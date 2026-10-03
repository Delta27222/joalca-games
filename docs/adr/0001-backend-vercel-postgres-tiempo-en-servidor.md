# 0001 · Backend en funciones de Vercel, PostgreSQL y tiempo medido en el servidor

Estado: aceptada (2026-10-03)

## Contexto

Los juegos corren en 3 iPads de un evento y el ranking debe ser uno solo, compartido. Hay un sorteo, así que no se pueden perder los datos de los jugadores. La URL es pública (aunque no se difunde), así que cualquiera podría llamar a la API.

## Decisión

- El backend vive en el mismo repo como funciones de Vercel en `api/`, desplegadas junto al front.
- Los datos se guardan en PostgreSQL (13+), con la conexión en la variable `DATABASE_URL`. El esquema está en `db/schema.sql`.
- El **servidor mide el tiempo**: al pulsar "¡Comenzar!" se crea la partida con `inicio = now() + cuenta regresiva`, y al terminar el servidor calcula la duración. Se rechazan las victorias con duraciones imposibles: menos de 3 s, o más que el límite más una tolerancia de 5 s.
- La API nunca devuelve el teléfono ni el email.

## Consecuencias

- Falsificar un tiempo exige jugar de verdad dentro del límite. Lo que no se valida en el servidor es *si* la partida se ganó: el tablero vive en el cliente. Para un evento interno se acepta.
- En desarrollo, `npm run dev` sirve también `api/` mediante un plugin de Vite (`vite.config.ts`), así que no hace falta la CLI de Vercel.
