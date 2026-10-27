import { describe, expect, it } from 'vitest';
import {
  createTranslator,
  DEFAULT_LOCALE,
  dictionaries,
  isLocale,
  localeNames,
  locales,
} from '../index';

describe('diccionarios', () => {
  it('español e inglés están registrados', () => {
    expect(locales).toEqual(['es', 'en']);
    expect(DEFAULT_LOCALE).toBe('es');
  });

  it('inglés tiene exactamente las mismas claves que español', () => {
    expect(Object.keys(dictionaries.en).sort()).toEqual(Object.keys(dictionaries.es).sort());
  });

  it('no hay traducciones vacías', () => {
    for (const [locale, dictionary] of Object.entries(dictionaries)) {
      for (const [key, value] of Object.entries(dictionary)) {
        expect(value.trim(), `${locale}.${key}`).not.toBe('');
      }
    }
  });

  it('todos los idiomas tienen nombre visible', () => {
    for (const locale of locales) {
      expect(localeNames[locale]).toBeTruthy();
    }
  });
});

describe('createTranslator', () => {
  it('interpola variables en español', () => {
    expect(createTranslator('es')('projects.count', { count: 3 })).toBe('Proyectos: 3');
  });

  it('interpola variables en inglés', () => {
    expect(createTranslator('en')('projects.count', { count: 1 })).toBe('Projects: 1');
  });

  it('deja intacto un placeholder sin valor', () => {
    expect(createTranslator('es')('projects.count')).toBe('Proyectos: {count}');
  });
});

describe('isLocale', () => {
  it('valida códigos de idioma', () => {
    expect(isLocale('es')).toBe(true);
    expect(isLocale('fr')).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
});
