import { useI18n } from '../i18n/I18nProvider';

export function DemoBanner() {
  const { t } = useI18n();

  return (
    <aside className="demo-banner" aria-label={t('demo.title')}>
      <div className="container demo-banner__inner">
        <p className="demo-banner__text">
          <strong>{t('demo.title')}</strong> {t('demo.text')}
        </p>
        <a className="button button--primary button--small" href="#/editar">
          {t('demo.cta')}
        </a>
      </div>
    </aside>
  );
}
