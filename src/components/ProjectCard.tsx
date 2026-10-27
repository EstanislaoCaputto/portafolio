import type { Project } from '../data/types';
import { useI18n } from '../i18n/I18nProvider';
import { projectHash } from '../lib/hashRoute';
import { pickLocalized } from '../lib/localized';

export function ProjectCard({ project }: { project: Project }) {
  const { locale, t } = useI18n();
  const summary =
    pickLocalized(project.summary, locale) || pickLocalized(project.description, locale);

  return (
    <article className="card">
      <a className="card__link" href={projectHash(project.id)}>
        <header className="card__head">
          <h3 className="card__title">{project.name}</h3>
          {project.featured ? (
            <span className="badge badge--accent">{t('projects.featured')}</span>
          ) : null}
        </header>

        {summary ? <p className="card__summary">{summary}</p> : null}

        {project.tech.length > 0 ? (
          <ul className="tag-list">
            {project.tech.map((tag, index) => (
              <li key={`${tag}-${index}`} className="tag">
                {tag}
              </li>
            ))}
          </ul>
        ) : null}

        <footer className="card__foot">
          <span className="card__year">{project.year}</span>
          <span className="card__cta">{t('projects.view')} →</span>
        </footer>
      </a>
    </article>
  );
}
