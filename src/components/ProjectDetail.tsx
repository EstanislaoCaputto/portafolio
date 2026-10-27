import type { Portfolio } from '../data/types';
import { useI18n } from '../i18n/I18nProvider';
import { projectHash } from '../lib/hashRoute';
import { pickLocalized } from '../lib/localized';
import { safeUrl } from '../lib/url';
import { ArrowUpRightIcon } from './icons';

export function ProjectDetail({
  portfolio,
  projectId,
}: {
  portfolio: Portfolio;
  projectId: string;
}) {
  const { locale, t } = useI18n();

  const index = portfolio.projects.findIndex((item) => item.id === projectId);
  const project = index >= 0 ? portfolio.projects[index] : undefined;

  if (!project) {
    return (
      <section className="section">
        <div className="container narrow">
          <h1>{t('project.notFound')}</h1>
          <p className="muted">{t('project.notFoundHelp')}</p>
          <a className="button" href="#/proyectos">
            {t('project.back')}
          </a>
        </div>
      </section>
    );
  }

  const summary = pickLocalized(project.summary, locale);
  const description = pickLocalized(project.description, locale) || summary;
  const highlights = project.highlights
    .map((item) => pickLocalized(item, locale))
    .filter((item) => item !== '');
  const repoUrl = safeUrl(project.repoUrl);
  const demoUrl = safeUrl(project.demoUrl);
  const next =
    portfolio.projects.length > 1
      ? portfolio.projects[(index + 1) % portfolio.projects.length]
      : undefined;

  return (
    <article className="section project-detail" aria-labelledby="project-title">
      <div className="container narrow">
        <a className="back-link" href="#/proyectos">
          ← {t('project.back')}
        </a>

        <header className="project-detail__head">
          <p className="project-detail__meta">
            <span>{project.year}</span>
            {project.featured ? (
              <span className="badge badge--accent">{t('projects.featured')}</span>
            ) : null}
          </p>
          <h1 id="project-title">{project.name}</h1>
          {summary ? <p className="project-detail__summary">{summary}</p> : null}
        </header>

        {description ? <p className="project-detail__description">{description}</p> : null}

        {highlights.length > 0 ? (
          <section className="project-detail__block" aria-labelledby="project-highlights">
            <h2 id="project-highlights">{t('project.highlights')}</h2>
            <ul className="highlights">
              {highlights.map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {project.tech.length > 0 ? (
          <section className="project-detail__block" aria-labelledby="project-tech">
            <h2 id="project-tech">{t('project.tech')}</h2>
            <ul className="tag-list">
              {project.tech.map((tag, index) => (
                <li key={`${tag}-${index}`} className="tag">
                  {tag}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {repoUrl || demoUrl ? (
          <div className="project-detail__actions">
            {repoUrl ? (
              <a
                className="button button--primary"
                href={repoUrl}
                target="_blank"
                rel="noreferrer noopener"
              >
                {t('project.repo')}
                <ArrowUpRightIcon />
              </a>
            ) : null}
            {demoUrl ? (
              <a className="button" href={demoUrl} target="_blank" rel="noreferrer noopener">
                {t('project.demo')}
                <ArrowUpRightIcon />
              </a>
            ) : null}
          </div>
        ) : null}

        {next ? (
          <nav className="project-detail__next" aria-label={t('project.next')}>
            <span className="muted">{t('project.next')}</span>
            <a href={projectHash(next.id)}>{next.name} →</a>
          </nav>
        ) : null}
      </div>
    </article>
  );
}
