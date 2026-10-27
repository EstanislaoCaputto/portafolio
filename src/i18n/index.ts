import en from './en';
import es, { type TranslationKey } from './es';

/**
 * Registro de idiomas: agregar uno nuevo es crear su archivo, sumarlo acá y
 * completar el tipo `Locale`. La UI recorre este objeto automáticamente.
 */
export const dictionaries = { es, en };

export type Locale = keyof typeof dictionaries;

export const locales = Object.keys(dictionaries) as Locale[];

export const localeNames: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
};

export const localeShortNames: Record<Locale, string> = {
  es: 'ES',
  en: 'EN',
};

export const DEFAULT_LOCALE: Locale = 'es';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && value in dictionaries;
}

export type Translate = (key: TranslationKey, vars?: Record<string, string | number>) => string;

export function createTranslator(locale: Locale): Translate {
  const dictionary = dictionaries[locale];

  return (key, vars) => {
    const template = dictionary[key] ?? dictionaries[DEFAULT_LOCALE][key];

    if (!vars) return template;

    return template.replace(/\{(\w+)\}/g, (match, name: string) => {
      const value = vars[name];
      return value === undefined ? match : String(value);
    });
  };
}
