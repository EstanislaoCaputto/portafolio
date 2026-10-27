/* eslint-disable react-refresh/only-export-components -- el provider y su hook comparten contexto */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { createTranslator, DEFAULT_LOCALE, isLocale, type Locale, type Translate } from './index';

const STORAGE_KEY = 'portfolio:locale';

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translate;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function detectLocale(): Locale {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLocale(stored)) return stored;
  } catch {
    // Sin almacenamiento: se usa el idioma del navegador.
  }

  const preferred = navigator.language?.slice(0, 2).toLowerCase();
  return isLocale(preferred) ? preferred : DEFAULT_LOCALE;
}

interface I18nProviderProps {
  children: ReactNode;
  initialLocale?: Locale;
}

export function I18nProvider({ children, initialLocale }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(() => initialLocale ?? detectLocale());

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // La preferencia no persiste, pero la sesión sigue funcionando.
    }
  }, []);

  const t = useMemo(() => createTranslator(locale), [locale]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n debe usarse dentro de <I18nProvider>');
  return context;
}
