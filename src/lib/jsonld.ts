import type { Portfolio } from '../data/types';
import { pickLocalized } from './localized';
import { safeEmail, safeUrl } from './url';

/**
 * Datos estructurados schema.org `Person`. Es lo que leen los sistemas
 * automáticos (incluidos los de selección de personal) cuando no interpretan
 * el render visual.
 */
export function buildPersonJsonLd(portfolio: Portfolio, locale: string): Record<string, unknown> {
  const { profile, skills } = portfolio;

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
  };

  const name = profile.name.trim();
  if (name) data.name = name;

  const jobTitle = pickLocalized(profile.headline, locale);
  if (jobTitle) data.jobTitle = jobTitle;

  const description = pickLocalized(profile.bio, locale);
  if (description) data.description = description;

  const email = safeEmail(profile.email);
  if (email) data.email = `mailto:${email}`;

  const website = safeUrl(profile.links.website);
  if (website) data.url = website;

  const avatar = safeUrl(profile.avatarUrl);
  if (avatar) data.image = avatar;

  if (profile.location.trim()) data.address = profile.location.trim();

  const knowsAbout = skills.flatMap((group) => group.items);
  if (knowsAbout.length > 0) data.knowsAbout = knowsAbout;

  const sameAs = [safeUrl(profile.links.github), safeUrl(profile.links.linkedin)].filter(
    (url) => url !== '',
  );
  if (sameAs.length > 0) data.sameAs = sameAs;

  return data;
}

/** Evita que un dato con `</script>` corte el bloque JSON-LD. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
