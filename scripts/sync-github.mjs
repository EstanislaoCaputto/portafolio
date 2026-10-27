#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';

/**
 * Sincroniza los proyectos del seed con los repositorios públicos de GitHub.
 *
 * Requiere `gh` instalado y autenticado (`gh auth status`). Solo modifica
 * `projects`; perfil, habilidades y experiencia quedan intactos.
 *
 * Uso:
 *   npm run sync:github
 *   npm run sync:github -- --dry-run
 */

const SEED_URL = new URL('../src/data/seed.json', import.meta.url);
const MAX_PROJECTS = 50;
const EXCLUDED = new Set();
const FIELDS = [
  'name',
  'description',
  'isPrivate',
  'isFork',
  'isArchived',
  'isTemplate',
  'primaryLanguage',
  'repositoryTopics',
  'stargazerCount',
  'pushedAt',
  'url',
  'homepageUrl',
].join(',');

const dryRun = process.argv.includes('--dry-run');

function runGh(args) {
  return execFileSync('gh', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
}

function slugify(value) {
  return (
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'proyecto'
  );
}

function uniqueId(base, used) {
  let id = base;
  let suffix = 2;

  while (used.has(id)) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }

  used.add(id);
  return id;
}

function displayName(name) {
  const spaced = name.replace(/[-_]+/g, ' ').trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function techFor(repo) {
  const tech = new Map();

  const add = (value) => {
    const trimmed = value?.trim();
    if (!trimmed) return;
    const key = trimmed.toLowerCase();
    if (!tech.has(key)) tech.set(key, trimmed);
  };

  add(repo.primaryLanguage?.name);
  for (const topic of repo.repositoryTopics ?? []) add(topic.name);

  return [...tech.values()].slice(0, 6);
}

function projectFor(repo, used) {
  const description = (repo.description ?? '').trim();
  const language = repo.primaryLanguage?.name;
  const fallbackEs = language ? `Proyecto desarrollado con ${language}.` : 'Proyecto de software.';
  const fallbackEn = language ? `Project built with ${language}.` : 'Software project.';
  const year = Number.parseInt((repo.pushedAt ?? '').slice(0, 4), 10);

  return {
    id: uniqueId(slugify(repo.name), used),
    name: displayName(repo.name),
    summary: { es: description || fallbackEs, en: description || fallbackEn },
    description: { es: description || fallbackEs, en: description || fallbackEn },
    highlights: [],
    tech: techFor(repo),
    year: Number.isFinite(year) ? year : new Date().getFullYear(),
    repoUrl: repo.url,
    demoUrl: repo.homepageUrl ?? '',
    featured: repo.stargazerCount >= 5,
  };
}

async function main() {
  const owner = process.env.GITHUB_OWNER ?? runGh(['api', 'user', '--jq', '.login']).trim();

  const repos = JSON.parse(runGh(['repo', 'list', owner, '--limit', '200', '--json', FIELDS]));

  const publics = repos
    .filter(
      (repo) =>
        !repo.isPrivate &&
        !repo.isFork &&
        !repo.isArchived &&
        !repo.isTemplate &&
        !EXCLUDED.has(repo.name),
    )
    .sort((a, b) => (b.pushedAt ?? '').localeCompare(a.pushedAt ?? ''))
    .slice(0, MAX_PROJECTS);

  const used = new Set();
  const projects = publics.map((repo) => projectFor(repo, used));

  const seed = JSON.parse(await readFile(SEED_URL, 'utf8'));
  const next = { ...seed, demo: false, projects };

  const lines = [
    `Repositorios públicos encontrados: ${publics.length}`,
    `Privados u omitidos: ${repos.length - publics.length}`,
    ...projects.map((project) => `  - ${project.name} (${project.year}) ${project.repoUrl}`),
  ];

  if (dryRun) {
    process.stdout.write(`[dry-run] ${lines.join('\n')}\n`);
    return;
  }

  await writeFile(SEED_URL, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
  process.stdout.write(`${lines.join('\n')}\n\nSeed actualizado: src/data/seed.json\n`);
}

try {
  await main();
} catch {
  process.stderr.write(
    'No se pudo sincronizar con GitHub. Verificá que `gh` esté instalado y autenticado (`gh auth status`).\n',
  );
  process.exit(1);
}
