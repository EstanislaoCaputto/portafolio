# 0001 — Arquitectura base del portafolio

- **Estado:** aceptada
- **Fecha:** 2026-10-26

## Contexto

La carpeta `proyectos` reúne proyectos de desarrollo web. Este es el primero: una plantilla de
portafolio genérica y bilingüe, con datos que completa cada persona, publicable en hosting estático
(GitHub Pages) y legible tanto por reclutadores humanos como por sistemas automáticos.

Requisitos que condicionaron las decisiones:

- SPA dinámica, tema oscuro por defecto, navegación intuitiva.
- Español e inglés obligatorios, con posibilidad de sumar idiomas.
- Datos del desarrollador completables sin editar código, con búsqueda de información pública a
  partir de GitHub/email/LinkedIn.
- Sin complejidad de infraestructura para un sitio de una sola persona.

## Decisión

1. **React + Vite + TypeScript**, build 100% estático. Sin servidor ni base de datos.
2. **Rutas por hash** (`#/`, `#/proyecto/:id`, `#/datos`, `#/editar`). GitHub Pages no necesita
   rewrites ni `404.html`, y los enlaces a proyectos siguen siendo compartibles.
3. **Datos en JSON**: `src/data/seed.json` es la fuente publicada; `localStorage` guarda el borrador
   mientras se edita. El asistente exporta/importa el JSON y el build lo publica como
   `/portfolio.json`.
4. **i18n propia y tipada** con un archivo por idioma. El test de i18n exige paridad de claves y
   prohíbe valores vacíos; agregar un idioma es un archivo y un registro.
5. **Importación de GitHub opt-in** desde el asistente, usando la API pública sin token. Es la única
   llamada de red del proyecto.
6. **Artefactos para lectura automática**: JSON-LD `schema.org/Person`, `/portfolio.json`,
   `/llms.txt`, vista `#/datos` y hoja de impresión tipo CV.
7. **CSS propio con tokens** en lugar de un framework: el sitio es pequeño, el control de la
   accesibilidad y del tema claro/oscuro importa más que la velocidad inicial de escribir estilos.

## Consecuencias

**Positivas**

- Deploy gratuito y portable; el build funciona en raíz de dominio o en subcarpeta.
- Cero dependencias de UI, router o i18n: menos superficie de mantenimiento.
- Los datos se pueden auditar y versionar como texto plano.
- El contenido crítico para reclutadores tiene un formato estático además del render.

**Negativas / límites asumidos**

- Al ser SPA, el HTML inicial no incluye los datos de la persona; `/portfolio.json`, `llms.txt` y el
  JSON-LD (generado en cliente) mitigan el problema pero no equivalen a prerender.
- La importación de GitHub sin token tiene un límite de 60 solicitudes/hora por IP.
- LinkedIn no ofrece API pública de perfiles y scrapearla viola sus términos, así que solo se guarda
  como enlace manual; el email tampoco permite descubrir información pública adicional.
- Editar en el navegador y publicar son dos pasos: exportar el JSON y reemplazar el seed.

## Alternativas descartadas

- **Next.js / SSG:** mejor SEO y HTML con datos, pero contradice el requisito de SPA pura y agrega
  complejidad de build/servidor para un sitio de una página.
- **`react-i18next`:** estándar y potente, innecesario para dos idiomas y ~100 claves; la i18n propia
  da tipado completo sin dependencias.
- **CLI generador de datos:** descartado por decisión del usuario; el asistente dentro de la app
  cumple el mismo objetivo sin un paso de terminal.
- **Backend o CMS:** descartado por costo y por la regla de que los datos personales no salgan del
  navegador.
