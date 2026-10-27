# 0002 — Sincronización de repositorios con `gh`

- **Estado:** aceptada
- **Fecha:** 2026-10-27

## Contexto

El seed tenía tres proyectos de ejemplo con enlaces `https://github.com/` de relleno. El autor tiene
10 repositorios públicos y 29 privados. Cargarlos uno por uno desde el asistente es tedioso, y la
importación del navegador está pensada para un perfil (máximo 12 repos, sin listar todos).

Se necesita una forma repetible de vincular todos los repositorios públicos sin introducir un backend
ni credenciales en el repositorio.

## Decisión

Agregar un script local, `scripts/sync-github.mjs`, ejecutable con `npm run sync:github` y con modo
`--dry-run`, que:

1. Usa `gh repo list` con la sesión ya autenticada del desarrollador (`gh auth status`).
2. Incluye solo repositorios **públicos**, sin forks, archivados ni templates, ordenados por último
   push (máximo 50).
3. Mapea cada repo a un `Project`: nombre legible, descripción de GitHub en `es`/`en` (con texto
   genérico bilingüe si falta), lenguaje y topics como tecnologías, año del último push, URL del repo
   y homepage como demo.
4. **Reemplaza únicamente `projects`** en `src/data/seed.json`; el perfil, las habilidades y la
   experiencia quedan intactos.
5. No se ejecuta en `build` ni en CI: es una herramienta local, no parte del artefacto publicado.

## Consecuencias

**Positivas**

- Sincronizar 10 repositorios es un comando, no diez formularios.
- No hay tokens en el repo: `gh` gestiona la credencial en el keyring del sistema.
- Sin dependencias nuevas de npm ni cambios en el bundle.
- Los enlaces dejan de ser placeholders y los proyectos existentes se pueden refrescar.

**Negativas / límites asumidos**

- Requiere `gh` instalado y autenticado en la máquina donde se corre.
- Los repos privados quedan afuera: sus enlaces no serían visibles en el sitio público.
- Reemplaza cualquier edición manual de `projects` en el asistente; hay que exportar antes si se
  quieren conservar cambios.
- Las descripciones de GitHub se copian tal cual en ambos idiomas; no se traducen automáticamente.
- La calidad de las tarjetas depende de las descripciones y topics que tenga cada repo en GitHub.

## Alternativas descartadas

- **Importación desde la app:** requiere abrir el navegador, importar, exportar y reemplazar el seed;
  además limita a 12 repos y no está pensada para “todos”.
- **Fetch en build o CI:** haría el build no determinista y obligaría a manejar un token en GitHub
  Actions, con riesgo de filtrarlo.
- **GitHub Action programada que abra PRs:** automatiza de más para un sitio estático y agrega ruido
  de mantenimiento.
