const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);

/**
 * Normaliza una URL y descarta esquemas peligrosos (`javascript:`, `data:`…).
 * Los datos pueden venir de un JSON importado o de GitHub, así que nunca se
 * usan directo en un `href`.
 */
export function safeUrl(value: string | null | undefined): string {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return '';

  try {
    const parsed = new URL(trimmed);
    return ALLOWED_PROTOCOLS.has(parsed.protocol) ? parsed.href : '';
  } catch {
    return '';
  }
}

export function safeEmail(value: string | null | undefined): string {
  const trimmed = (value ?? '').trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) ? trimmed : '';
}
