import { describe, expect, it, vi } from 'vitest';
import { GitHubImportError, importFromGitHub, parseUsername, type Fetcher } from '../github';

interface RepoOverrides {
  name?: string;
  description?: string | null;
  homepage?: string | null;
  language?: string | null;
  topics?: string[];
  stargazers_count?: number;
  fork?: boolean;
  archived?: boolean;
  created_at?: string;
  pushed_at?: string | null;
}

const USER = {
  login: 'ada',
  name: 'Ada Lovelace',
  bio: 'Matemática y programadora',
  location: 'Londres',
  avatar_url: 'https://avatars.githubusercontent.com/u/1',
  blog: 'https://ada.dev',
  html_url: 'https://github.com/ada',
};

function repo(overrides: RepoOverrides = {}) {
  return {
    name: 'demo',
    html_url: 'https://github.com/ada/demo',
    description: 'Una demo',
    homepage: null,
    language: 'TypeScript',
    topics: ['typescript', 'react'],
    stargazers_count: 3,
    fork: false,
    archived: false,
    created_at: '2023-01-01T00:00:00Z',
    pushed_at: '2024-05-01T00:00:00Z',
    ...overrides,
  };
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function fetcherFor(repos: unknown[]): Fetcher {
  return vi.fn(async (url: string) =>
    url.includes('/repos') ? jsonResponse(repos) : jsonResponse(USER),
  );
}

describe('parseUsername', () => {
  it('acepta usuario simple, con @ y URL completa', () => {
    expect(parseUsername('ada')).toBe('ada');
    expect(parseUsername('@ada')).toBe('ada');
    expect(parseUsername('https://github.com/ada/')).toBe('ada');
  });

  it('rechaza entradas inválidas', () => {
    expect(() => parseUsername('')).toThrow(GitHubImportError);
    expect(() => parseUsername('ada lovelace')).toThrow(GitHubImportError);
    expect(() => parseUsername('ada!')).toThrow(GitHubImportError);
  });
});

describe('importFromGitHub', () => {
  it('mapea perfil y repositorios públicos', async () => {
    const fetcher = fetcherFor([
      repo({ name: 'zeta', stargazers_count: 10, pushed_at: '2022-03-01T00:00:00Z' }),
      repo({ name: 'alpha', stargazers_count: 1, pushed_at: '2025-01-01T00:00:00Z' }),
    ]);

    const result = await importFromGitHub('https://github.com/ada', fetcher);

    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(result.username).toBe('ada');
    expect(result.profile.name).toBe('Ada Lovelace');
    expect(result.profile.bio).toEqual({
      es: 'Matemática y programadora',
      en: 'Matemática y programadora',
    });
    expect(result.profile.website).toBe('https://ada.dev/');
    expect(result.projects.map((project) => project.name)).toEqual(['zeta', 'alpha']);
    expect(result.projects[0]?.featured).toBe(true);
    expect(result.projects[1]?.featured).toBe(false);
    expect(result.projects[0]?.year).toBe(2022);
  });

  it('descarta forks, archivados y el repo del perfil', async () => {
    const fetcher = fetcherFor([
      repo({ name: 'valido' }),
      repo({ name: 'forkeado', fork: true }),
      repo({ name: 'viejo', archived: true }),
      repo({ name: 'ada' }),
    ]);

    const result = await importFromGitHub('ada', fetcher);

    expect(result.projects.map((project) => project.name)).toEqual(['valido']);
  });

  it('deduplica tecnologías sin distinguir mayúsculas', async () => {
    const fetcher = fetcherFor([
      repo({ name: 'uno', language: 'TypeScript', topics: ['typescript', 'react'] }),
    ]);

    const result = await importFromGitHub('ada', fetcher);

    expect(result.projects[0]?.tech).toEqual(['TypeScript', 'react']);
  });

  it('traduce errores de GitHub a códigos propios', async () => {
    const notFound = vi.fn(async () => new Response('{}', { status: 404 }));
    await expect(importFromGitHub('ada', notFound)).rejects.toMatchObject({ code: 'not-found' });

    const rateLimited = vi.fn(async () => new Response('{}', { status: 403 }));
    await expect(importFromGitHub('ada', rateLimited)).rejects.toMatchObject({
      code: 'rate-limit',
    });

    const offline = vi.fn(async () => {
      throw new Error('offline');
    });
    await expect(importFromGitHub('ada', offline)).rejects.toMatchObject({ code: 'network' });

    const broken = vi.fn(async () => new Response('no-json', { status: 200 }));
    await expect(importFromGitHub('ada', broken)).rejects.toMatchObject({
      code: 'bad-response',
    });
  });

  it('rechaza respuestas que no son una lista de repositorios', async () => {
    const fetcher: Fetcher = vi.fn(async (url: string) =>
      url.includes('/repos') ? jsonResponse({ message: 'no' }) : jsonResponse(USER),
    );

    await expect(importFromGitHub('ada', fetcher)).rejects.toMatchObject({
      code: 'bad-response',
    });
  });
});
