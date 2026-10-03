import type { JuegoId } from '../../src/config/juegos.js'
import { db } from './db.js'
import { nombrePublico } from './http.js'

export type FilaRanking = {
  posicion: number
  nombre: string
  tiempoMs: number
  esTu: boolean
}

type Fila = { jugador_id: string; nombre: string; duracion_ms: number; posicion: string }

/**
 * Mejor partida ganada de cada jugador, ordenada por tiempo; desempata por
 * menos errores y luego por quien terminó primero. Devuelve el top `limite`
 * más la fila de `jugadorId`, aunque esté fuera del top.
 */
export async function ranking(
  juego: JuegoId,
  limite: number,
  jugadorId: string | null,
): Promise<FilaRanking[]> {
  const filas = await db()<Fila[]>`
    with mejores as (
      select distinct on (jugador_id) jugador_id, duracion_ms, errores, fin_at
      from partidas
      where juego = ${juego} and resultado = 'gana'
      order by jugador_id, duracion_ms, errores, fin_at
    ), ordenados as (
      select m.jugador_id, j.nombre, m.duracion_ms,
        row_number() over (order by m.duracion_ms, m.errores, m.fin_at) as posicion
      from mejores m
      join jugadores j on j.id = m.jugador_id
    )
    select jugador_id, nombre, duracion_ms, posicion
    from ordenados
    where posicion <= ${limite} or jugador_id = ${jugadorId}::uuid
    order by posicion
  `
  return filas.map((f) => ({
    posicion: Number(f.posicion),
    nombre: nombrePublico(f.nombre),
    tiempoMs: f.duracion_ms,
    esTu: f.jugador_id === jugadorId,
  }))
}

export async function posicionDe(
  juego: JuegoId,
  jugadorId: string,
): Promise<FilaRanking | null> {
  const filas = await ranking(juego, 0, jugadorId)
  return filas.find((f) => f.esTu) ?? null
}
