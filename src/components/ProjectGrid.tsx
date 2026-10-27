import { useMemo, useState } from 'react';
import type { Project } from '../data/types';
import { useI18n } from '../i18n/I18nProvider';
import { pickLocalized } from '../lib/localized';
import { ProjectCard } from './ProjectCard';

function sortProjects(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => Number(b.featured) - Number(a.featured) || b.year - a.year);
}

function matchQuery(project: Project, query: string, locale: string): boolean {
  if (!query) return true;

  const haystack = [
    project.name,
    pickLocalized(project.summary, locale),
    pickLocalized(project.description, locale),
    ...project.tech,
  ]
    .join(' ')
    .toLowerCase();

  return haystack.includes(query);
}

export function ProjectGrid({ projects }: { projects: Project[] }) {
  const { locale, t } = useI18n();
  const [query, setQuery] = useState('');
  const [tech, setTech] = useState('');

  const techOptions = useMemo(() => {
    const unique = new Map<string, string>();
    for (const project of projects) {
      for (const item of project.tech) {
        const key = item.toLowerCase();
        if (!unique.has(key)) unique.set(key, item);
      }
    }
    return [...unique.values()].sort((a, b) => a.localeCompare(b, locale));
  }, [projects, locale]);

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return sortProjects(
      projects.filter(
        (project) =>
          (!tech || project.tech.some((item) => item.toLowerCase() === tech.toLowerCase())) &&
          matchQuery(project, normalized, locale),
      ),
    );
  }, [projects, query, tech, locale]);

  const isFiltering = query.trim() !== '' || tech !== '';

  return (
    <div className="projects">
      <div className="projects__controls">
        <div className="field field--inline">
          <label className="field__label" htmlFor="project-search">
            {t('projects.search')}
          </label>
          <input
            id="project-search"
            className="input"
            type="search"
            value={query}
            placeholder={t('projects.searchPlaceholder')}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <p className="projects__count" aria-live="polite">
          {t('projects.count', { count: visible.length })}
        </p>
      </div>

      {techOptions.length > 0 ? (
        <div className="chips" role="group" aria-label={t('projects.techFilter')}>
          <button
            type="button"
            className={tech === '' ? 'chip is-active' : 'chip'}
            aria-pressed={tech === ''}
            onClick={() => setTech('')}
          >
            {t('projects.all')}
          </button>
          {techOptions.map((option) => (
            <button
              key={option}
              type="button"
              className={tech === option ? 'chip is-active' : 'chip'}
              aria-pressed={tech === option}
              onClick={() => setTech(tech === option ? '' : option)}
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}

      {visible.length > 0 ? (
        <div className="project-grid">
          {visible.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>{t('projects.empty')}</p>
          {isFiltering ? (
            <button
              type="button"
              className="button button--small"
              onClick={() => {
                setQuery('');
                setTech('');
              }}
            >
              {t('projects.clear')}
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
