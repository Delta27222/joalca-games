import type { JuegoId } from '../../src/config/juegos.js'
import { db } from './db.js'
import { nombrePublico } from './http.js'

export type FilaRanking = {
  posicion: number
  nombre: string
  tiempoMs: number
  esTu: boolean
  /** false si su mejor partida no la completó (perdió o se le acabó el tiempo). */
  gana: boolean
  /** Solo para el staff: para escribirle al ganador por WhatsApp. */
  telefono?: string
}

type Fila = {
  jugador_id: string
  nombre: string
  telefono: string
  duracion_ms: number
  gana: boolean
  posicion: string
}

/**
 * Mejor partida terminada de cada jugador, gane o pierda. Van primero los que
 * ganaron y después los que no, cada grupo por tiempo; desempata por menos
 * errores y luego por quien terminó primero. Las abandonadas no entran. Devuelve el top `limite`
 * más la fila de `jugadorId`, aunque esté fuera del top. Con `conTelefono`
 * incluye el teléfono de cada jugador (solo para el staff).
 */
export async function ranking(
  juego: JuegoId,
  limite: number,
  jugadorId: string | null,
  conTelefono = false,
): Promise<FilaRanking[]> {
  const filas = await db()<Fila[]>`
    with mejores as (
      select distinct on (jugador_id) jugador_id, resultado = 'gana' as gana, duracion_ms, errores, fin_at
      from partidas
      where juego = ${juego} and resultado is not null
      order by jugador_id, resultado = 'gana' desc, duracion_ms, errores, fin_at
    ), ordenados as (
      select m.jugador_id, j.nombre, j.telefono, m.gana, m.duracion_ms,
        row_number() over (order by m.gana desc, m.duracion_ms, m.errores, m.fin_at) as posicion
      from mejores m
      join jugadores j on j.id = m.jugador_id
    )
    select jugador_id, nombre, telefono, gana, duracion_ms, posicion
    from ordenados
    where posicion <= ${limite} or jugador_id = ${jugadorId}::uuid
    order by posicion
  `
  return filas.map((f) => ({
    posicion: Number(f.posicion),
    nombre: nombrePublico(f.nombre),
    tiempoMs: f.duracion_ms,
    esTu: f.jugador_id === jugadorId,
    gana: f.gana,
    ...(conTelefono && { telefono: f.telefono }),
  }))
}

export async function posicionDe(
  juego: JuegoId,
  jugadorId: string,
): Promise<FilaRanking | null> {
  const filas = await ranking(juego, 0, jugadorId)
  return filas.find((f) => f.esTu) ?? null
}
