import { useI18n } from '../i18n/I18nProvider';
import type { Route } from '../lib/hashRoute';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';

const SECTIONS = [
  { id: 'proyectos', key: 'nav.projects' },
  { id: 'habilidades', key: 'nav.skills' },
  { id: 'experiencia', key: 'nav.experience' },
  { id: 'contacto', key: 'nav.contact' },
] as const;

export function Header({ route }: { route: Route }) {
  const { t } = useI18n();
  const onHome = route.name === 'home';

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <a className="brand" href="#/" aria-label={t('nav.home')}>
          <span className="brand__mark" aria-hidden="true">
            /
          </span>
          <span className="brand__text">{t('app.title')}</span>
        </a>

        {onHome ? (
          <nav className="site-nav" aria-label={t('nav.sections')}>
            {SECTIONS.map((section) => (
              <a key={section.id} className="site-nav__link" href={`#/${section.id}`}>
                {t(section.key)}
              </a>
            ))}
          </nav>
        ) : (
          <a className="site-nav__link site-nav__back" href="#/">
            {t('nav.back')}
          </a>
        )}

        <div className="site-header__actions">
          <a className="button button--ghost button--small" href="#/editar">
            {t('nav.edit')}
          </a>
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
