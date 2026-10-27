import { describe, expect, it } from 'vitest';
import { filledLocales, hasLocalizedContent, pickLocalized } from '../localized';

describe('pickLocalized', () => {
  it('devuelve el idioma pedido', () => {
    expect(pickLocalized({ es: 'Hola', en: 'Hello' }, 'en')).toBe('Hello');
  });

  it('cae en español si falta el idioma pedido', () => {
    expect(pickLocalized({ es: 'Hola', en: '' }, 'en')).toBe('Hola');
  });

  it('cae en cualquier idioma disponible antes que devolver vacío', () => {
    expect(pickLocalized({ fr: 'Bonjour' }, 'en')).toBe('Bonjour');
  });

  it('ignora espacios en blanco', () => {
    expect(pickLocalized({ es: '   ' }, 'es')).toBe('');
  });

  it('devuelve string vacío si no hay datos', () => {
    expect(pickLocalized(undefined, 'es')).toBe('');
  });
});

describe('hasLocalizedContent', () => {
  it('detecta contenido en cualquier idioma', () => {
    expect(hasLocalizedContent({ en: 'Hello' })).toBe(true);
    expect(hasLocalizedContent({ es: ' ', en: '' })).toBe(false);
  });
});

describe('filledLocales', () => {
  it('lista solo idiomas con contenido', () => {
    expect(filledLocales({ es: 'Hola', en: '' }).sort()).toEqual(['es']);
  });
});
