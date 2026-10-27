import type { LocalizedText } from '../data/types';

const FALLBACKS = ['es', 'en'] as const;

/**
 * Devuelve el texto en el idioma pedido; si falta, cae en español y luego en
 * cualquier idioma disponible. Nunca devuelve `undefined`.
 */
export function pickLocalized(value: LocalizedText | undefined, locale: string): string {
  if (!value) return '';

  const direct = value[locale]?.trim();
  if (direct) return direct;

  for (const fallback of FALLBACKS) {
    const candidate = value[fallback]?.trim();
    if (candidate) return candidate;
  }

  for (const candidate of Object.values(value)) {
    const trimmed = candidate.trim();
    if (trimmed) return trimmed;
  }

  return '';
}

export function hasLocalizedContent(value: LocalizedText): boolean {
  return Object.values(value).some((entry) => entry.trim().length > 0);
}

/**
 * Idiomas que tienen contenido para un campo localizado. Se usa en el asistente
 * para avisar cuando falta la versión inglesa o española.
 */
export function filledLocales(value: LocalizedText): string[] {
  return Object.entries(value)
    .filter(([, entry]) => entry.trim().length > 0)
    .map(([locale]) => locale);
}
