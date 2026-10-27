import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../App';
import type { Locale } from '../i18n';
import { I18nProvider } from '../i18n/I18nProvider';

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
  it('muestra el portafolio de ejemplo en español', () => {
    renderApp();

    expect(screen.getByRole('heading', { level: 1, name: 'Nombre Apellido' })).toBeInTheDocument();
    expect(screen.getByText('Datos de ejemplo')).toBeInTheDocument();
    expect(screen.getByText('Proyectos: 3')).toBeInTheDocument();
  });

  it('cambia de idioma sin recargar', () => {
    renderApp();

    fireEvent.click(screen.getByRole('button', { name: 'English' }));

    expect(screen.getByRole('link', { name: 'Projects' })).toBeInTheDocument();
    expect(document.documentElement.lang).toBe('en');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Nombre Apellido');
  });

  it('filtra proyectos por búsqueda', () => {
    renderApp();

    fireEvent.change(screen.getByLabelText('Buscar'), { target: { value: 'notas' } });

    expect(screen.getByRole('heading', { level: 3, name: 'Notas offline' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 3, name: 'API de tareas' })).toBeNull();
    expect(screen.getByText('Proyectos: 1')).toBeInTheDocument();
  });

  it('abre el detalle de un proyecto por URL', () => {
    goTo('#/proyecto/api-de-tareas');
    renderApp();

    expect(screen.getByRole('heading', { level: 1, name: 'API de tareas' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Resultados' })).toBeInTheDocument();
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
      profile?: { name?: string };
    };
    expect(stored.profile?.name).toBe('Ada Lovelace');
  });
});
