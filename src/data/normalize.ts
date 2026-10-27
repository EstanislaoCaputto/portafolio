import { hasLocalizedContent } from '../lib/localized';
import { slugify, uniqueId } from '../lib/slug';
import type {
  ExperienceItem,
  ExperienceKind,
  LocalizedText,
  Portfolio,
  Profile,
  Project,
  SkillGroup,
} from './types';

export interface NormalizedPortfolio {
  portfolio: Portfolio;
  warnings: string[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const asText = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

/** Acepta `{ es, en }` o un string simple (que se duplica en ambos idiomas). */
export function asLocalized(value: unknown): LocalizedText {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? { es: trimmed, en: trimmed } : {};
  }

  if (!isRecord(value)) return {};

  const result: LocalizedText = {};
  for (const [locale, entry] of Object.entries(value)) {
    if (typeof entry !== 'string') continue;
    const trimmed = entry.trim();
    if (trimmed) result[locale] = trimmed;
  }

  return result;
}

const asLocalizedList = (value: unknown): LocalizedText[] =>
  Array.isArray(value) ? value.map(asLocalized).filter(hasLocalizedContent) : [];

const asTextList = (value: unknown): string[] =>
  Array.isArray(value) ? value.map(asText).filter((entry) => entry.length > 0) : [];

function asYear(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number.parseInt(asText(value), 10);
  const current = new Date().getFullYear();

  return Number.isFinite(parsed) && parsed >= 1950 && parsed <= current + 1
    ? Math.trunc(parsed)
    : current;
}

const asKind = (value: unknown): ExperienceKind => (value === 'education' ? 'education' : 'work');

function normalizeProfile(value: unknown): Profile {
  const data = isRecord(value) ? value : {};
  const links = isRecord(data.links) ? data.links : {};

  return {
    name: asText(data.name),
    headline: asLocalized(data.headline),
    bio: asLocalized(data.bio),
    location: asText(data.location),
    email: asText(data.email),
    avatarUrl: asText(data.avatarUrl),
    availability: asLocalized(data.availability),
    links: {
      github: asText(links.github),
      linkedin: asText(links.linkedin),
      website: asText(links.website),
    },
  };
}

function normalizeProject(value: unknown, used: Set<string>): Project | null {
  if (!isRecord(value)) return null;

  const name = asText(value.name);
  if (!name) return null;

  const baseId = asText(value.id) || name;

  return {
    id: uniqueId(slugify(baseId), used),
    name,
    summary: asLocalized(value.summary),
    description: asLocalized(value.description),
    highlights: asLocalizedList(value.highlights),
    tech: asTextList(value.tech),
    year: asYear(value.year),
    repoUrl: asText(value.repoUrl),
    demoUrl: asText(value.demoUrl),
    featured: value.featured === true,
  };
}

function normalizeSkillGroup(value: unknown, used: Set<string>): SkillGroup | null {
  if (!isRecord(value)) return null;

  const items = asTextList(value.items);
  const label = asLocalized(value.label);
  if (items.length === 0) return null;

  const baseId = asText(value.id) || Object.values(label)[0] || 'skills';

  return {
    id: uniqueId(slugify(baseId), used),
    label,
    items,
  };
}

function normalizeExperience(value: unknown, used: Set<string>): ExperienceItem | null {
  if (!isRecord(value)) return null;

  const role = asLocalized(value.role);
  const organization = asText(value.organization);
  if (!hasLocalizedContent(role) && !organization) return null;

  const baseId = asText(value.id) || Object.values(role)[0] || organization;

  return {
    id: uniqueId(slugify(baseId), used),
    kind: asKind(value.kind),
    role,
    organization,
    period: asText(value.period),
    summary: asLocalized(value.summary),
  };
}

export function emptyPortfolio(): Portfolio {
  return {
    version: 1,
    demo: false,
    profile: normalizeProfile(null),
    projects: [],
    skills: [],
    experience: [],
  };
}

export function isPortfolioEmpty(portfolio: Portfolio): boolean {
  return (
    !portfolio.profile.name &&
    portfolio.projects.length === 0 &&
    portfolio.skills.length === 0 &&
    portfolio.experience.length === 0
  );
}

/**
 * Convierte datos externos (JSON importado, localStorage viejo, GitHub) en un
 * `Portfolio` válido. Nunca lanza: descarta entradas rotas y las reporta.
 */
export function normalizePortfolio(input: unknown): NormalizedPortfolio {
  const warnings: string[] = [];

  if (!isRecord(input)) {
    warnings.push('El archivo no contiene un objeto JSON válido.');
    return { portfolio: emptyPortfolio(), warnings };
  }

  const rawProjects = Array.isArray(input.projects) ? input.projects : [];
  const rawSkills = Array.isArray(input.skills) ? input.skills : [];
  const rawExperience = Array.isArray(input.experience) ? input.experience : [];

  const usedProjects = new Set<string>();
  const usedSkills = new Set<string>();
  const usedExperience = new Set<string>();

  const projects = rawProjects
    .map((project) => normalizeProject(project, usedProjects))
    .filter((project): project is Project => project !== null);

  const skills = rawSkills
    .map((skill) => normalizeSkillGroup(skill, usedSkills))
    .filter((skill): skill is SkillGroup => skill !== null);

  const experience = rawExperience
    .map((item) => normalizeExperience(item, usedExperience))
    .filter((item): item is ExperienceItem => item !== null);

  if (projects.length < rawProjects.length) {
    warnings.push('Se omitieron proyectos sin nombre.');
  }
  if (skills.length < rawSkills.length) {
    warnings.push('Se omitieron grupos de habilidades vacíos.');
  }
  if (experience.length < rawExperience.length) {
    warnings.push('Se omitieron experiencias sin puesto ni organización.');
  }

  return {
    portfolio: {
      version: 1,
      demo: input.demo === true,
      profile: normalizeProfile(input.profile),
      projects,
      skills,
      experience,
    },
    warnings,
  };
}
