import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Rutas relativas: el build funciona tanto en la raíz de un dominio como en
  // https://usuario.github.io/portafolio/ sin reconfigurar nada.
  base: './',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    css: false,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    restoreMocks: true,
  },
});
