import { esStaff, fecha, juego, json, manejar, pagina, uuidOpcional } from './_lib/http.js'
import { ranking } from './_lib/ranking.js'

const POR_PAGINA = 10

/**
 * GET /api/ranking?juego=sopa&fecha=2026-10-16&pagina=2&jugador=<id>&staff=<clave>
 * → una página del ranking, la fila del jugador y el total de jugadores. Sin
 * `fecha` (o con "todas") toma todas las fechas. Con la clave de staff, cada
 * fila trae el teléfono.
 */
export const GET = manejar(async (request) => {
  const params = new URL(request.url).searchParams
  const { filas, total } = await ranking({
    juego: juego(params.get('juego')),
    fecha: fecha(params.get('fecha')),
    pagina: pagina(params.get('pagina')),
    porPagina: POR_PAGINA,
    jugadorId: uuidOpcional(params.get('jugador')),
    conTelefono: esStaff(params.get('staff')),
  })
  return json({ filas, total, porPagina: POR_PAGINA })
})
