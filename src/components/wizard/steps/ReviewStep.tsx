import { useMemo, useRef, useState, type ChangeEvent } from 'react';
import type { Portfolio } from '../../../data/types';
import { importPortfolioJson, serializePortfolio } from '../../../data/storage';
import { useI18n } from '../../../i18n/I18nProvider';
import { downloadTextFile } from '../../../lib/download';
import { pickLocalized } from '../../../lib/localized';
import { safeEmail } from '../../../lib/url';

interface ReviewStepProps {
  portfolio: Portfolio;
  onChange: (portfolio: Portfolio) => void;
  onReset: () => void;
}

function lacksEnglish(value: Record<string, string>): boolean {
  return Boolean(value.es?.trim()) && !value.en?.trim();
}

function hasMissingEnglish(portfolio: Portfolio): boolean {
  const { profile, projects, skills, experience } = portfolio;
  const fields = [
    profile.headline,
    profile.bio,
    profile.availability,
    ...projects.flatMap((project) => [project.summary, project.description, ...project.highlights]),
    ...skills.map((group) => group.label),
    ...experience.flatMap((item) => [item.role, item.summary]),
  ];

  return fields.some(lacksEnglish);
}

export function ReviewStep({ portfolio, onChange, onReset }: ReviewStepProps) {
  const { locale, t } = useI18n();
  const [notice, setNotice] = useState<{ kind: 'error' | 'info'; message: string } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const warnings = useMemo(() => {
    const list: string[] = [];

    if (!portfolio.profile.name.trim()) list.push(t('review.missingName'));
    if (!safeEmail(portfolio.profile.email)) list.push(t('review.missingEmail'));
    if (hasMissingEnglish(portfolio)) list.push(t('review.missingEnglish'));

    return list;
  }, [portfolio, t]);

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const result = importPortfolioJson(await file.text());
    if (!result.ok) {
      setNotice({ kind: 'error', message: t('review.importError') });
      return;
    }

    onChange(result.portfolio);
    setNotice(
      result.warnings.length > 0
        ? { kind: 'info', message: t('review.importWarnings', { count: result.warnings.length }) }
        : null,
    );
  };

  return (
    <div className="stack">
      <p className="muted">{t('review.lead')}</p>

      <dl className="summary">
        <div>
          <dt>{t('review.profile')}</dt>
          <dd>{pickLocalized(portfolio.profile.headline, locale) || '—'}</dd>
        </div>
        <div>
          <dt>{t('review.projects')}</dt>
          <dd>{portfolio.projects.length}</dd>
        </div>
        <div>
          <dt>{t('review.skills')}</dt>
          <dd>{portfolio.skills.length}</dd>
        </div>
        <div>
          <dt>{t('review.experience')}</dt>
          <dd>{portfolio.experience.length}</dd>
        </div>
      </dl>

      {warnings.length > 0 ? (
        <ul className="warnings" role="list">
          {warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      ) : null}

      {notice ? (
        <p
          className={notice.kind === 'error' ? 'status status--error' : 'status status--ok'}
          role={notice.kind === 'error' ? 'alert' : 'status'}
        >
          {notice.message}
        </p>
      ) : null}

      <div className="toolbar">
        <button
          type="button"
          className="button button--primary"
          onClick={() => downloadTextFile('portfolio.json', serializePortfolio(portfolio))}
        >
          {t('review.export')}
        </button>

        <button type="button" className="button" onClick={() => fileInput.current?.click()}>
          {t('review.import')}
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(event) => void handleFile(event)}
        />

        <button
          type="button"
          className="button button--danger"
          onClick={() => {
            if (window.confirm(t('review.resetConfirm'))) {
              onReset();
              setNotice(null);
            }
          }}
        >
          {t('review.reset')}
        </button>

        <a className="button button--ghost" href="#/">
          {t('review.view')}
        </a>
      </div>

      <section className="editor-card" aria-labelledby="review-publish">
        <h3 id="review-publish">{t('review.publish')}</h3>
        <p className="field__hint">{t('review.publishHelp')}</p>
      </section>
    </div>
  );
}
