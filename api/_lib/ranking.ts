import { ZONA_HORARIA, type JuegoId } from '../../src/config/juegos.js'
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

/** Fila con todos los datos del jugador, para el Excel del staff. */
export type FilaCompleta = {
  posicion: number
  nombre: string
  telefono: string
  email: string | null
  gana: boolean
  tiempoMs: number
  errores: number
  /** Cuándo terminó su mejor partida, en hora de Caracas: "16/10/2026 14:05". */
  terminoEl: string
}

type Fila = {
  jugador_id: string
  nombre: string
  telefono: string
  email: string | null
  duracion_ms: number
  errores: number
  gana: boolean
  termino_el: string
  posicion: string
  total: string
}

type Consulta = {
  juego: JuegoId
  /** "2026-10-16": solo partidas terminadas ese día (hora de Caracas). null = todas. */
  fecha: string | null
  /** Puestos que se devuelven: de `desde` + 1 a `hasta`. `hasta` null = hasta el final. */
  desde: number
  hasta: number | null
  /** Su fila se devuelve aunque esté fuera del rango, al final. */
  jugadorId: string | null
}

/**
 * Mejor partida terminada de cada jugador, gane o pierda. Van primero los que
 * ganaron y después los que no, cada grupo por tiempo; desempata por menos
 * errores y luego por quien terminó primero. Las abandonadas no entran. Con
 * `fecha`, el ranking se arma solo con las partidas de ese día.
 */
async function consultar({ juego, fecha, desde, hasta, jugadorId }: Consulta) {
  const sql = db()
  const filas = await sql<Fila[]>`
    with mejores as (
      select distinct on (jugador_id) jugador_id, resultado = 'gana' as gana, duracion_ms, errores, fin_at
      from partidas
      where juego = ${juego} and resultado is not null
        ${fecha ? sql`and (fin_at at time zone ${ZONA_HORARIA})::date = ${fecha}::date` : sql``}
      order by jugador_id, resultado = 'gana' desc, duracion_ms, errores, fin_at
    ), ordenados as (
      select m.jugador_id, j.nombre, j.telefono, j.email, m.gana, m.duracion_ms, m.errores,
        to_char(m.fin_at at time zone ${ZONA_HORARIA}, 'DD/MM/YYYY HH24:MI') as termino_el,
        row_number() over (order by m.gana desc, m.duracion_ms, m.errores, m.fin_at) as posicion,
        count(*) over () as total
      from mejores m
      join jugadores j on j.id = m.jugador_id
    )
    select *
    from ordenados
    where (posicion > ${desde} and (${hasta}::int is null or posicion <= ${hasta}::int))
      or jugador_id = ${jugadorId}::uuid
    order by (posicion > ${desde} and (${hasta}::int is null or posicion <= ${hasta}::int)) desc, posicion
  `
  return { filas, total: filas.length ? Number(filas[0].total) : 0 }
}

/**
 * Una página del ranking más la fila de `jugadorId`, aunque esté fuera de la
 * página. Con `conTelefono` incluye el teléfono de cada jugador (solo para el
 * staff). `total` es la cantidad de jugadores en el ranking filtrado.
 */
export async function ranking(opciones: {
  juego: JuegoId
  fecha: string | null
  pagina: number
  porPagina: number
  jugadorId: string | null
  conTelefono?: boolean
}): Promise<{ filas: FilaRanking[]; total: number }> {
  const { pagina, porPagina, jugadorId, conTelefono = false } = opciones
  const { filas, total } = await consultar({
    ...opciones,
    desde: (pagina - 1) * porPagina,
    hasta: pagina * porPagina,
  })
  return {
    total,
    filas: filas.map((f) => ({
      posicion: Number(f.posicion),
      nombre: nombrePublico(f.nombre),
      tiempoMs: f.duracion_ms,
      esTu: f.jugador_id === jugadorId,
      gana: f.gana,
      ...(conTelefono && { telefono: f.telefono }),
    })),
  }
}

/** El ranking entero con nombre completo, teléfono y correo. Solo para el staff. */
export async function rankingCompleto(juego: JuegoId, fecha: string | null): Promise<FilaCompleta[]> {
  const { filas } = await consultar({ juego, fecha, desde: 0, hasta: null, jugadorId: null })
  return filas.map((f) => ({
    posicion: Number(f.posicion),
    nombre: f.nombre.trim(),
    telefono: f.telefono,
    email: f.email,
    gana: f.gana,
    tiempoMs: f.duracion_ms,
    errores: f.errores,
    terminoEl: f.termino_el,
  }))
}

/** Posición en el ranking general (todas las fechas). */
export async function posicionDe(
  juego: JuegoId,
  jugadorId: string,
): Promise<FilaRanking | null> {
  const { filas } = await ranking({ juego, fecha: null, pagina: 1, porPagina: 0, jugadorId })
  return filas.find((f) => f.esTu) ?? null
}
