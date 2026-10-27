/**
 * Rutas por hash: funcionan en GitHub Pages sin reglas de rewrite ni 404.html.
 * El hash también permite compartir un proyecto puntual por enlace.
 */
export const HOME_SECTIONS = ['proyectos', 'habilidades', 'experiencia', 'contacto'] as const;

export type HomeSection = (typeof HOME_SECTIONS)[number];

export type Route =
  | { name: 'home'; section?: HomeSection }
  | { name: 'project'; id: string }
  | { name: 'data' }
  | { name: 'edit' };

export function isHomeSection(value: string): value is HomeSection {
  return (HOME_SECTIONS as readonly string[]).includes(value);
}

export function parseHash(hash: string): Route {
  let raw = hash.replace(/^#\/?/, '');
  try {
    raw = decodeURIComponent(raw);
  } catch {
    // Un hash mal codificado no debe romper la navegación.
  }

  const path = (raw.split('?')[0] ?? '').replace(/\/+$/, '');
  const [section, rest] = path.split('/');
  const id = rest?.split('/')[0] ?? '';

  if (!section) return { name: 'home' };
  if (section === 'datos') return { name: 'data' };
  if (section === 'editar') return { name: 'edit' };
  if (section === 'proyecto' && id) return { name: 'project', id };
  if (isHomeSection(section)) return { name: 'home', section };

  return { name: 'home' };
}

export function routeToHash(route: Route): string {
  switch (route.name) {
    case 'home':
      return route.section ? `#/${route.section}` : '#/';
    case 'project':
      return `#/proyecto/${encodeURIComponent(route.id)}`;
    case 'data':
      return '#/datos';
    case 'edit':
      return '#/editar';
  }
}

export function projectHash(id: string): string {
  return routeToHash({ name: 'project', id });
}
