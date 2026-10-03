import { AHORCADO, limiteMs, type JuegoId } from '../src/config/juegos.js'
import { db } from './_lib/db.js'
import { ErrorHttp, json, leerJson, manejar, uuid } from './_lib/http.js'
import { posicionDe } from './_lib/ranking.js'

/** Una victoria más rápida que esto no es humana. */
const MINIMO_MS = 3000
/** Margen para la latencia entre el iPad y el servidor. */
const TOLERANCIA_MS = 5000

type Partida = {
  jugador_id: string
  juego: JuegoId
  fin_at: Date | null
  transcurrido_ms: number
}

/**
 * Cierra la partida. El servidor calcula la duración con su propio reloj y
 * convierte en derrota una victoria que llega fuera del límite.
 */
export const POST = manejar(async (request) => {
  const cuerpo = await leerJson(request)
  const partidaId = uuid(cuerpo.partidaId, 'partidaId')
  const declarado = cuerpo.resultado
  if (declarado !== 'gana' && declarado !== 'pierde') {
    throw new ErrorHttp(400, 'Resultado no válido')
  }
  const errores = Number(cuerpo.errores ?? 0)
  if (!Number.isInteger(errores) || errores < 0 || errores > AHORCADO.maxErrores) {
    throw new ErrorHttp(400, 'Errores no válidos')
  }

  const sql = db()
  const [partida] = await sql<Partida[]>`
    select jugador_id, juego, fin_at,
      (extract(epoch from (now() - inicio_at)) * 1000)::int as transcurrido_ms
    from partidas
    where id = ${partidaId}
  `
  if (!partida) throw new ErrorHttp(404, 'Partida no encontrada')
  if (partida.fin_at) throw new ErrorHttp(409, 'La partida ya terminó')

  const limite = limiteMs(partida.juego)
  if (declarado === 'gana' && partida.transcurrido_ms < MINIMO_MS) {
    throw new ErrorHttp(422, 'Tiempo no válido')
  }
  const resultado =
    declarado === 'gana' && partida.transcurrido_ms > limite + TOLERANCIA_MS ? 'pierde' : declarado
  const duracionMs = Math.min(Math.max(partida.transcurrido_ms, 0), limite)

  const actualizadas = await sql`
    update partidas
    set fin_at = now(), duracion_ms = ${duracionMs}, resultado = ${resultado}, errores = ${errores}
    where id = ${partidaId} and fin_at is null
  `
  if (actualizadas.count === 0) throw new ErrorHttp(409, 'La partida ya terminó')

  const posicion =
    resultado === 'gana' ? await posicionDe(partida.juego, partida.jugador_id) : null
  return json({ resultado, duracionMs, posicion: posicion?.posicion ?? null })
})
