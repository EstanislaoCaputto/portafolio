import { useI18n } from '../i18n/I18nProvider';

export function Footer({ name }: { name: string }) {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <p className="site-footer__signature">
          © {year} {name || t('app.title')}
        </p>
        <p className="site-footer__note">
          {t('footer.local')} {t('footer.builtWith')}
        </p>
        <nav className="site-footer__nav">
          <a href="#/datos">{t('footer.data')}</a>
          <a href="#/editar">{t('nav.edit')}</a>
        </nav>
      </div>
    </footer>
  );
}
