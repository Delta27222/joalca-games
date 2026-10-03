import { CUENTA_REGRESIVA_MS } from '../src/config/juegos.js'
import { db } from './_lib/db.js'
import { ErrorHttp, juego, json, leerJson, manejar, uuid } from './_lib/http.js'

/**
 * Crea la partida al pulsar "¡Comenzar!". El inicio queda fijado en el
 * servidor justo al terminar la cuenta regresiva.
 */
export const POST = manejar(async (request) => {
  const cuerpo = await leerJson(request)
  const jugadorId = uuid(cuerpo.jugadorId, 'jugadorId')
  const elJuego = juego(cuerpo.juego)

  const [partida] = await db()<{ id: string }[]>`
    insert into partidas (jugador_id, juego, inicio_at)
    select id, ${elJuego}, now() + make_interval(secs => ${CUENTA_REGRESIVA_MS / 1000})
    from jugadores
    where id = ${jugadorId}
    returning id
  `
  if (!partida) throw new ErrorHttp(404, 'Jugador no encontrado')
  return json({ partidaId: partida.id })
})
