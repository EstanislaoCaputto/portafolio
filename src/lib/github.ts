import type { LocalizedText, Project } from '../data/types';
import { slugify, uniqueId } from './slug';
import { safeUrl } from './url';

export type GitHubErrorCode =
  'invalid-username' | 'not-found' | 'rate-limit' | 'network' | 'bad-response';

export class GitHubImportError extends Error {
  constructor(readonly code: GitHubErrorCode) {
    super(code);
    this.name = 'GitHubImportError';
  }
}

export interface ImportedProfile {
  name: string;
  bio: LocalizedText;
  location: string;
  avatarUrl: string;
  github: string;
  website: string;
}

export interface GitHubImportResult {
  username: string;
  profile: ImportedProfile;
  projects: Project[];
}

export type Fetcher = (url: string) => Promise<Response>;

interface GitHubUser {
  login: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  avatar_url: string;
  blog: string | null;
  html_url: string;
}

interface GitHubRepo {
  name: string;
  html_url: string;
  description: string | null;
  homepage: string | null;
  language: string | null;
  topics?: string[];
  stargazers_count: number;
  fork: boolean;
  archived: boolean;
  created_at: string;
  pushed_at: string | null;
}

const API = 'https://api.github.com';
const MAX_PROJECTS = 12;

export function parseUsername(input: string): string {
  const cleaned = input
    .trim()
    .replace(/^@/, '')
    .replace(/^https?:\/\/(www\.)?github\.com\//i, '')
    .replace(/\/+$/, '')
    .split('/')[0];

  if (!cleaned || !/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,38})$/.test(cleaned)) {
    throw new GitHubImportError('invalid-username');
  }

  return cleaned;
}

async function fetchJson<T>(fetcher: Fetcher, url: string): Promise<T> {
  let response: Response;

  try {
    response = await fetcher(url);
  } catch {
    throw new GitHubImportError('network');
  }

  if (response.status === 404) throw new GitHubImportError('not-found');
  if (response.status === 403 || response.status === 429) {
    throw new GitHubImportError('rate-limit');
  }
  if (!response.ok) throw new GitHubImportError('bad-response');

  try {
    return (await response.json()) as T;
  } catch {
    throw new GitHubImportError('bad-response');
  }
}

function mapProfile(user: GitHubUser): ImportedProfile {
  const bio = user.bio?.trim() ?? '';

  return {
    name: user.name?.trim() || user.login,
    bio: bio ? { es: bio, en: bio } : {},
    location: user.location?.trim() ?? '',
    avatarUrl: safeUrl(user.avatar_url),
    github: safeUrl(user.html_url),
    website: safeUrl(user.blog),
  };
}

function mapProjects(user: GitHubUser, repos: GitHubRepo[]): Project[] {
  const used = new Set<string>();

  return repos
    .filter((repo) => !repo.fork && !repo.archived && repo.name !== user.login)
    .sort((a, b) => {
      if (b.stargazers_count !== a.stargazers_count) {
        return b.stargazers_count - a.stargazers_count;
      }
      return (b.pushed_at ?? '').localeCompare(a.pushed_at ?? '');
    })
    .slice(0, MAX_PROJECTS)
    .map((repo) => {
      const description = repo.description?.trim() ?? '';
      const tech = new Set<string>();
      const addTech = (value: string | null | undefined) => {
        const trimmed = value?.trim();
        if (!trimmed) return;
        const exists = [...tech].some((item) => item.toLowerCase() === trimmed.toLowerCase());
        if (!exists) tech.add(trimmed);
      };

      addTech(repo.language);
      for (const topic of repo.topics ?? []) addTech(topic);

      const pushedAt = repo.pushed_at ?? repo.created_at;
      const parsedYear = new Date(pushedAt).getFullYear();
      const year = Number.isFinite(parsedYear) ? parsedYear : new Date().getFullYear();
      const summary: LocalizedText = description ? { es: description, en: description } : {};

      return {
        id: uniqueId(slugify(repo.name), used),
        name: repo.name,
        summary,
        description: summary,
        highlights: [],
        tech: [...tech].slice(0, 6),
        year,
        repoUrl: safeUrl(repo.html_url),
        demoUrl: safeUrl(repo.homepage),
        featured: repo.stargazers_count >= 5,
      };
    });
}

export async function importFromGitHub(
  input: string,
  fetcher: Fetcher = (url) => fetch(url),
): Promise<GitHubImportResult> {
  const username = parseUsername(input);

  const [user, repos] = await Promise.all([
    fetchJson<GitHubUser>(fetcher, `${API}/users/${encodeURIComponent(username)}`),
    fetchJson<GitHubRepo[]>(
      fetcher,
      `${API}/users/${encodeURIComponent(username)}/repos?per_page=100&sort=pushed`,
    ),
  ]);

  if (!Array.isArray(repos)) throw new GitHubImportError('bad-response');

  return {
    username: user.login,
    profile: mapProfile(user),
    projects: mapProjects(user, repos),
  };
}
