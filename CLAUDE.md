# Joalca Games

Aplicación web con dos juegos: sopa de letras y ahorcado. Todo corre en el cliente, sin backend.

## Stack

- Vite + React + TypeScript
- React Router (`/`, `/sopa-de-letras`, `/ahorcado`)
- Oxlint para el lint

## Comandos

- `npm run dev`: servidor de desarrollo
- `npm run build`: chequeo de tipos y build de producción
- `npm run lint`: lint
- `npm run preview`: sirve el build

## Estructura

- `src/App.tsx`: layout y rutas
- `src/pages/`: una página por juego más el menú (`Home.tsx`)

## Agent skills

### Issue tracker

Los issues viven como archivos markdown locales en `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Las cinco etiquetas canónicas por defecto (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: un `GLOSSARY.md` y `docs/adr/` en la raíz. See `docs/agents/domain.md`.
