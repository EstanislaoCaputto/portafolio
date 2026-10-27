import { serializePortfolio } from '../data/storage';
import type { Portfolio } from '../data/types';
import { useI18n } from '../i18n/I18nProvider';
import { downloadTextFile } from '../lib/download';
import { useCopy } from '../lib/useCopy';
import { ArrowUpRightIcon } from './icons';

export function DataPage({ portfolio }: { portfolio: Portfolio }) {
  const { t } = useI18n();
  const { copied, copy } = useCopy();
  const json = serializePortfolio(portfolio);

  return (
    <section className="section" aria-labelledby="data-title">
      <div className="container narrow">
        <h1 id="data-title">{t('data.title')}</h1>
        <p className="muted">{t('data.lead')}</p>

        <div className="toolbar">
          <button type="button" className="button button--primary" onClick={() => void copy(json)}>
            {copied ? t('data.copied') : t('data.copy')}
          </button>
          <button
            type="button"
            className="button"
            onClick={() => downloadTextFile('portfolio.json', json)}
          >
            {t('data.download')}
          </button>
          <a
            className="button button--ghost"
            href="./portfolio.json"
            target="_blank"
            rel="noreferrer noopener"
          >
            {t('data.static')}
          </a>
          <a className="button button--ghost" href="#/">
            {t('data.back')}
          </a>
        </div>

        <span className="sr-only" role="status">
          {copied ? t('data.copied') : ''}
        </span>

        <pre className="json-view" tabIndex={0}>
          {json}
        </pre>

        <p className="muted">
          <a href="./llms.txt" target="_blank" rel="noreferrer noopener">
            llms.txt <ArrowUpRightIcon />
          </a>
        </p>
      </div>
    </section>
  );
}
