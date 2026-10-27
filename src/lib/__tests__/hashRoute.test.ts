import { describe, expect, it } from 'vitest';
import { parseHash, projectHash, routeToHash, type Route } from '../hashRoute';

describe('parseHash', () => {
  it('trata la raíz como home', () => {
    expect(parseHash('')).toEqual({ name: 'home' });
    expect(parseHash('#/')).toEqual({ name: 'home' });
  });

  it('resuelve secciones de la home', () => {
    expect(parseHash('#/proyectos')).toEqual({ name: 'home', section: 'proyectos' });
    expect(parseHash('#/contacto/')).toEqual({ name: 'home', section: 'contacto' });
  });

  it('resuelve el detalle de un proyecto', () => {
    expect(parseHash('#/proyecto/api-de-tareas')).toEqual({
      name: 'project',
      id: 'api-de-tareas',
    });
  });

  it('resuelve datos y edición', () => {
    expect(parseHash('#/datos')).toEqual({ name: 'data' });
    expect(parseHash('#/editar')).toEqual({ name: 'edit' });
  });

  it('ignora query strings y rutas desconocidas', () => {
    expect(parseHash('#/proyecto/demo?ref=mail')).toEqual({ name: 'project', id: 'demo' });
    expect(parseHash('#/no-existe')).toEqual({ name: 'home' });
  });

  it('no rompe con un hash mal codificado', () => {
    expect(parseHash('#/%E0%A4%A')).toEqual({ name: 'home' });
  });

  it('decodifica ids con caracteres escapados', () => {
    expect(parseHash('#/proyecto/mi%20proyecto')).toEqual({
      name: 'project',
      id: 'mi proyecto',
    });
  });
});

describe('routeToHash', () => {
  const cases: Route[] = [
    { name: 'home' },
    { name: 'home', section: 'experiencia' },
    { name: 'project', id: 'demo' },
    { name: 'data' },
    { name: 'edit' },
  ];

  it.each(cases)('hace roundtrip con %j', (route) => {
    expect(parseHash(routeToHash(route))).toEqual(route);
  });

  it('codifica el id del proyecto', () => {
    expect(projectHash('mi proyecto')).toBe('#/proyecto/mi%20proyecto');
  });
});
