import { juego, json, manejar, uuidOpcional } from './_lib/http.js'
import { ranking } from './_lib/ranking.js'

/** GET /api/ranking?juego=sopa&jugador=<id> → top 10 y la fila del jugador. */
export const GET = manejar(async (request) => {
  const params = new URL(request.url).searchParams
  const filas = await ranking(juego(params.get('juego')), 10, uuidOpcional(params.get('jugador')))
  return json({ filas })
})
