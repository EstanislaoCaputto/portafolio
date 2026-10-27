export function slugify(value: string, fallback = 'item'): string {
  const slug = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

  return slug || fallback;
}

export function uniqueId(base: string, used: Set<string>): string {
  let id = base;
  let suffix = 2;

  while (used.has(id)) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }

  used.add(id);
  return id;
}
