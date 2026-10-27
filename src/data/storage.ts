import { isPortfolioEmpty, normalizePortfolio } from './normalize';
import { SEED } from './seed';
import type { Portfolio } from './types';

export const DRAFT_KEY = 'portfolio:draft:v1';

export interface LoadedPortfolio {
  portfolio: Portfolio;
  fromSeed: boolean;
  warnings: string[];
}

export type ImportedPortfolio =
  | { ok: true; portfolio: Portfolio; warnings: string[] }
  | { ok: false; reason: 'invalid-json' | 'empty' };

function getStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadPortfolio(storage: Storage | null = getStorage()): LoadedPortfolio {
  if (!storage) return { portfolio: SEED, fromSeed: true, warnings: [] };

  try {
    const raw = storage.getItem(DRAFT_KEY);
    if (!raw) return { portfolio: SEED, fromSeed: true, warnings: [] };

    const { portfolio, warnings } = normalizePortfolio(JSON.parse(raw) as unknown);
    if (isPortfolioEmpty(portfolio)) {
      return { portfolio: SEED, fromSeed: true, warnings };
    }

    return { portfolio, fromSeed: false, warnings };
  } catch {
    return { portfolio: SEED, fromSeed: true, warnings: [] };
  }
}

export function savePortfolio(
  portfolio: Portfolio,
  storage: Storage | null = getStorage(),
): boolean {
  if (!storage) return false;

  try {
    storage.setItem(DRAFT_KEY, JSON.stringify(portfolio));
    return true;
  } catch {
    return false;
  }
}

export function clearPortfolio(storage: Storage | null = getStorage()): void {
  try {
    storage?.removeItem(DRAFT_KEY);
  } catch {
    // Sin almacenamiento disponible: no hay nada que borrar.
  }
}

export function serializePortfolio(portfolio: Portfolio): string {
  return `${JSON.stringify(portfolio, null, 2)}\n`;
}

export function importPortfolioJson(text: string): ImportedPortfolio {
  let parsed: unknown;

  try {
    parsed = JSON.parse(text) as unknown;
  } catch {
    return { ok: false, reason: 'invalid-json' };
  }

  const { portfolio, warnings } = normalizePortfolio(parsed);
  if (isPortfolioEmpty(portfolio)) return { ok: false, reason: 'empty' };

  return { ok: true, portfolio, warnings };
}
