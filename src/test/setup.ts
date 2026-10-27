import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.history.replaceState(null, '', '/');
});

// jsdom no implementa scrollTo: el portafolio lo usa al cambiar de ruta.
Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true,
});
