import { normalizePortfolio } from './normalize';
import seed from './seed.json';
import type { Portfolio } from './types';

/**
 * Datos con los que arranca el portafolio cuando el navegador no tiene nada
 * guardado. Reemplazar este JSON (o `seed.json`) es la forma de publicar un
 * portafolio real.
 */
export const SEED: Portfolio = normalizePortfolio(seed).portfolio;
