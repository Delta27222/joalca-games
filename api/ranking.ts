import { esStaff, juego, json, manejar, uuidOpcional } from './_lib/http.js'
import { ranking } from './_lib/ranking.js'

/**
 * GET /api/ranking?juego=sopa&jugador=<id>&staff=<clave> → top 10 y la fila
 * del jugador. Con la clave de staff, cada fila trae el teléfono.
 */
export const GET = manejar(async (request) => {
  const params = new URL(request.url).searchParams
  const filas = await ranking(
    juego(params.get('juego')),
    10,
    uuidOpcional(params.get('jugador')),
    esStaff(params.get('staff')),
  )
  return json({ filas })
})
