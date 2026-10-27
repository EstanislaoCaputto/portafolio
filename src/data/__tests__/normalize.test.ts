import { describe, expect, it } from 'vitest';
import { asLocalized, emptyPortfolio, isPortfolioEmpty, normalizePortfolio } from '../normalize';
import seed from '../seed.json';

describe('asLocalized', () => {
  it('duplica un string en español e inglés', () => {
    expect(asLocalized('  Hola  ')).toEqual({ es: 'Hola', en: 'Hola' });
  });

  it('conserva idiomas con contenido y descarta vacíos', () => {
    expect(asLocalized({ es: 'Hola', en: '  ', fr: 'Salut' })).toEqual({
      es: 'Hola',
      fr: 'Salut',
    });
  });

  it('devuelve un objeto vacío para datos inválidos', () => {
    expect(asLocalized(null)).toEqual({});
    expect(asLocalized(42)).toEqual({});
  });
});

describe('normalizePortfolio', () => {
  it('normaliza el seed sin advertencias', () => {
    const { portfolio, warnings } = normalizePortfolio(seed);

    expect(warnings).toEqual([]);
    expect(portfolio.profile.name).toBe('Nombre Apellido');
    expect(portfolio.projects.length).toBeGreaterThan(0);
    expect(portfolio.skills.length).toBeGreaterThan(0);
    expect(portfolio.experience.length).toBeGreaterThan(0);
  });

  it('garantiza español e inglés en todos los textos del seed', () => {
    const { portfolio } = normalizePortfolio(seed);
    const texts = [
      portfolio.profile.headline,
      portfolio.profile.bio,
      portfolio.profile.availability,
      ...portfolio.projects.flatMap((project) => [
        project.summary,
        project.description,
        ...project.highlights,
      ]),
      ...portfolio.skills.map((group) => group.label),
      ...portfolio.experience.flatMap((item) => [item.role, item.summary]),
    ];

    for (const text of texts) {
      expect(text.es?.trim()).toBeTruthy();
      expect(text.en?.trim()).toBeTruthy();
    }
  });

  it('descarta proyectos sin nombre y lo reporta', () => {
    const { portfolio, warnings } = normalizePortfolio({
      projects: [{ name: 'Uno' }, { name: '' }, { summary: 'sin nombre' }],
    });

    expect(portfolio.projects).toHaveLength(1);
    expect(warnings).toContain('Se omitieron proyectos sin nombre.');
  });

  it('genera ids únicos a partir del nombre', () => {
    const { portfolio } = normalizePortfolio({
      projects: [{ name: 'Demo' }, { name: 'Demo' }],
    });

    expect(portfolio.projects.map((project) => project.id)).toEqual(['demo', 'demo-2']);
  });

  it('corrige años inválidos y limita los textos', () => {
    const { portfolio } = normalizePortfolio({
      projects: [
        { name: 'Viejo', year: 1800 },
        { name: 'Futuro', year: 9999 },
      ],
    });

    const currentYear = new Date().getFullYear();
    expect(portfolio.projects.map((project) => project.year)).toEqual([currentYear, currentYear]);
  });

  it('acepta datos parciales sin lanzar', () => {
    const { portfolio, warnings } = normalizePortfolio({});

    expect(isPortfolioEmpty(portfolio)).toBe(true);
    expect(warnings).toEqual([]);
  });

  it('rechaza entradas que no son objetos', () => {
    const { portfolio, warnings } = normalizePortfolio('texto');

    expect(isPortfolioEmpty(portfolio)).toBe(true);
    expect(warnings).toHaveLength(1);
  });

  it('normaliza habilidades y experiencias incompletas', () => {
    const { portfolio, warnings } = normalizePortfolio({
      skills: [{ label: { es: 'Frontend' }, items: ['React'] }, { items: [] }],
      experience: [{ role: { es: 'Dev' }, organization: 'ACME' }, {}],
    });

    expect(portfolio.skills).toHaveLength(1);
    expect(portfolio.experience).toHaveLength(1);
    expect(warnings).toHaveLength(2);
  });
});

describe('emptyPortfolio', () => {
  it('no tiene contenido', () => {
    expect(isPortfolioEmpty(emptyPortfolio())).toBe(true);
  });
});
