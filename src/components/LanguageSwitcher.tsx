import { localeNames, localeShortNames, locales } from '../i18n';
import { useI18n } from '../i18n/I18nProvider';

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className="lang-switch" role="group" aria-label={t('header.language')}>
      {locales.map((code) => (
        <button
          key={code}
          type="button"
          className={code === locale ? 'lang-switch__button is-active' : 'lang-switch__button'}
          aria-pressed={code === locale}
          aria-label={localeNames[code]}
          lang={code}
          onClick={() => setLocale(code)}
        >
          {localeShortNames[code]}
        </button>
      ))}
    </div>
  );
}
