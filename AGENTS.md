# AGENTS.md — portafolio

Bases específicas de este proyecto. Hereda las reglas de `../AGENTS.md` y solo las especializa.

## Stack

- React 19 + TypeScript 6 + Vite 8.
- CSS propio con tokens (`src/styles/tokens.css`), sin framework de estilos.
- i18n propia y tipada (`src/i18n/`), sin librería externa.
- Vitest 5 + Testing Library + jsdom.
- Sin backend, sin analytics, sin servicios de terceros.

## Comandos

- Instalar: `npm install`
- Ejecutar: `npm run dev`
- Lint: `npm run lint`
- Tipos: `npm run typecheck`
- Tests: `npm test`
- Build: `npm run build`
- Verificación completa: `npm run check`

## Reglas específicas

- **Textos de UI siempre en `src/i18n/es.ts` y `src/i18n/en.ts`.** Nunca strings visibles sueltos en
  componentes. El test de i18n exige ambas traducciones y prohíbe valores vacíos.
- **El español y el inglés son obligatorios**; un idioma nuevo se agrega como archivo + registro en
  `src/i18n/index.ts`, sin tocar componentes.
- **Datos del usuario solo en `src/data/seed.json` o en `localStorage`.** No agregar backend, base de
  datos ni analytics.
- **La única llamada de red permitida desde la app** es `api.github.com` en el paso de importación
  (API pública, sin token). El script `scripts/sync-github.mjs` puede consultar GitHub mediante `gh`
  (sesión local del desarrollador) para actualizar `projects`; no corre en build ni en CI. Cualquier
  otra integración externa requiere ADR.
- **Tema oscuro por defecto.** Todo color nuevo entra como token en `tokens.css` con su variante clara;
  no usar valores hex sueltos en `components.css`.
- **Rutas solo por hash** (`#/`, `#/proyecto/:id`, `#/datos`, `#/editar`). No introducir router: GitHub
  Pages no admite rewrites.
- **Accesibilidad no negociable**: labels asociados, foco visible, contraste AA, navegación por teclado
  y `aria-live` donde cambia contenido dinámico.
- **`npm run check` debe pasar** antes de cada commit.
- **No introducir dependencias nuevas** (router, i18n, estado, UI kit) sin justificarlo en un ADR y
  consultarlo antes.

## Estructura

- `src/components/`: UI de la SPA; `wizard/` contiene el onboarding.
- `src/data/`: tipos, seed, normalización defensiva y persistencia.
- `src/lib/`: lógica pura y testeable (rutas, GitHub, JSON-LD, URLs, slugs).
- `src/i18n/`: diccionarios y provider.
- `src/styles/`: tokens, base y componentes.
- `scripts/`: generación de artefactos estáticos para el build.
