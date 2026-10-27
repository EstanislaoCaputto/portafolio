import { beforeEach, describe, expect, it } from 'vitest';
import { SEED } from '../seed';
import {
  clearPortfolio,
  DRAFT_KEY,
  importPortfolioJson,
  loadPortfolio,
  savePortfolio,
  serializePortfolio,
} from '../storage';

beforeEach(() => {
  window.localStorage.clear();
});

describe('loadPortfolio', () => {
  it('usa el seed cuando no hay nada guardado', () => {
    const loaded = loadPortfolio();

    expect(loaded.portfolio).toBe(SEED);
    expect(loaded.fromSeed).toBe(true);
  });

  it('recupera un borrador guardado', () => {
    const custom = structuredClone(SEED);
    custom.profile.name = 'Ada Lovelace';

    expect(savePortfolio(custom)).toBe(true);

    const loaded = loadPortfolio();
    expect(loaded.fromSeed).toBe(false);
    expect(loaded.portfolio.profile.name).toBe('Ada Lovelace');
  });

  it('vuelve al seed si el borrador está corrupto', () => {
    window.localStorage.setItem(DRAFT_KEY, '{esto no es json');

    const loaded = loadPortfolio();
    expect(loaded.portfolio).toBe(SEED);
    expect(loaded.fromSeed).toBe(true);
  });

  it('vuelve al seed si el borrador está vacío', () => {
    window.localStorage.setItem(DRAFT_KEY, '{}');

    const loaded = loadPortfolio();
    expect(loaded.portfolio).toBe(SEED);
  });
});

describe('savePortfolio y clearPortfolio', () => {
  it('persiste y borra el borrador', () => {
    expect(savePortfolio(SEED)).toBe(true);
    expect(window.localStorage.getItem(DRAFT_KEY)).not.toBeNull();

    clearPortfolio();
    expect(window.localStorage.getItem(DRAFT_KEY)).toBeNull();
  });

  it('no falla si el almacenamiento no está disponible', () => {
    expect(savePortfolio(SEED, null)).toBe(false);
    expect(loadPortfolio(null).portfolio).toBe(SEED);
    expect(() => clearPortfolio(null)).not.toThrow();
  });
});

describe('importPortfolioJson', () => {
  it('importa un portafolio válido', () => {
    const result = importPortfolioJson(JSON.stringify({ profile: { name: 'Ana' } }));

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.portfolio.profile.name).toBe('Ana');
      expect(result.portfolio.projects).toEqual([]);
    }
  });

  it('rechaza JSON inválido', () => {
    expect(importPortfolioJson('no es json')).toEqual({
      ok: false,
      reason: 'invalid-json',
    });
  });

  it('rechaza un portafolio vacío', () => {
    expect(importPortfolioJson('{}')).toEqual({ ok: false, reason: 'empty' });
  });
});

describe('serializePortfolio', () => {
  it('produce JSON legible con salto de línea final', () => {
    const text = serializePortfolio(SEED);

    expect(text.endsWith('\n')).toBe(true);
    expect(text).toContain('\n  "profile"');
    expect(JSON.parse(text)).toEqual(SEED);
  });
});
