import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../App';
import { SEED } from '../data/seed';
import type { Locale } from '../i18n';
import { I18nProvider } from '../i18n/I18nProvider';

const firstProject = SEED.projects[0];
const secondProject = SEED.projects[1];

if (!firstProject || !secondProject) {
  throw new Error('El seed necesita al menos dos proyectos para correr estos tests.');
}

function renderApp(initialLocale: Locale = 'es') {
  return render(
    <I18nProvider initialLocale={initialLocale}>
      <App />
    </I18nProvider>,
  );
}

function goTo(hash: string) {
  window.history.replaceState(null, '', `/${hash}`);
}

beforeEach(() => {
  window.localStorage.clear();
  goTo('#/');
});

describe('App', () => {
  it('muestra el portafolio publicado en español', () => {
    renderApp();

    expect(screen.getByRole('heading', { level: 1, name: SEED.profile.name })).toBeInTheDocument();
    expect(screen.getByText(`Proyectos: ${SEED.projects.length}`)).toBeInTheDocument();
  });

  it('no muestra el aviso de ejemplo si los datos son reales', () => {
    renderApp();

    expect(screen.queryByText('Datos de ejemplo')).toBeNull();
  });

  it('muestra el aviso cuando el portafolio está marcado como ejemplo', () => {
    window.localStorage.setItem('portfolio:draft:v1', JSON.stringify({ ...SEED, demo: true }));

    renderApp();

    expect(screen.getByText('Datos de ejemplo')).toBeInTheDocument();
  });

  it('cambia de idioma sin recargar', () => {
    renderApp();

    fireEvent.click(screen.getByRole('button', { name: 'English' }));

    expect(screen.getByRole('link', { name: 'Projects' })).toBeInTheDocument();
    expect(document.documentElement.lang).toBe('en');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(SEED.profile.name);
  });

  it('filtra proyectos por búsqueda', () => {
    renderApp();

    fireEvent.change(screen.getByLabelText('Buscar'), {
      target: { value: firstProject.name },
    });

    expect(screen.getByRole('heading', { level: 3, name: firstProject.name })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 3, name: secondProject.name })).toBeNull();
    expect(screen.getByText('Proyectos: 1')).toBeInTheDocument();
  });

  it('abre el detalle de un proyecto por URL', () => {
    goTo(`#/proyecto/${firstProject.id}`);
    renderApp();

    expect(screen.getByRole('heading', { level: 1, name: firstProject.name })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Volver a proyectos/ })).toBeInTheDocument();
  });

  it('muestra un mensaje si el proyecto no existe', () => {
    goTo('#/proyecto/no-existe');
    renderApp();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'No encontramos ese proyecto.',
    );
  });

  it('expone los datos en JSON para lectura automática', () => {
    goTo('#/datos');
    renderApp();

    expect(
      screen.getByRole('heading', { level: 1, name: 'Datos del portafolio' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/"version": 1/)).toBeInTheDocument();
  });

  it('abre el asistente en la ruta de edición', () => {
    goTo('#/editar');
    renderApp();

    expect(
      screen.getByRole('heading', { level: 1, name: 'Asistente del portafolio' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Proyectos/ })).toBeInTheDocument();
  });

  it('cambia al tema claro y lo recuerda', () => {
    renderApp();

    fireEvent.click(screen.getByRole('button', { name: 'Cambiar al tema claro' }));

    expect(document.documentElement.dataset.theme).toBe('light');
    expect(window.localStorage.getItem('portfolio:theme')).toBe('light');
  });

  it('guarda los cambios del asistente en el navegador', () => {
    goTo('#/editar');
    renderApp();

    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ada Lovelace' } });

    const stored = JSON.parse(window.localStorage.getItem('portfolio:draft:v1') ?? '{}') as {
      demo?: boolean;
      profile?: { name?: string };
    };
    expect(stored.profile?.name).toBe('Ada Lovelace');
    expect(stored.demo).toBe(false);
  });
});
