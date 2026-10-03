import { ALFABETO, normalizar, type Aleatorio } from './texto.ts'

export type Celda = { fila: number; col: number }

export type Ubicacion = {
  /** Índice de la palabra en la configuración. */
  indice: number
  inicio: Celda
  fin: Celda
  celdas: Celda[]
}

export type Tablero = {
  tamano: number
  letras: string[][]
  ubicaciones: Ubicacion[]
}

// Solo direcciones que se leen hacia adelante: nunca palabras al revés.
const DIRECCIONES: readonly [number, number][] = [
  [0, 1], // horizontal
  [1, 0], // vertical
  [1, 1], // diagonal que baja
  [-1, 1], // diagonal que sube
]

const INTENTOS_POR_PALABRA = 300
const INTENTOS_DE_TABLERO = 50

export class ErrorDeConfiguracion extends Error {}

export function generarTablero(
  palabras: readonly string[],
  tamano: number,
  aleatorio: Aleatorio = Math.random,
): Tablero {
  const normalizadas = palabras.map(normalizar)
  const largas = normalizadas.filter((p) => p.length > tamano)
  if (largas.length > 0) {
    throw new ErrorDeConfiguracion(
      `No caben en un tablero de ${tamano}×${tamano}: ${largas.join(', ')}`,
    )
  }

  // Primero las más largas: son las que tienen menos sitios posibles.
  const orden = normalizadas
    .map((palabra, indice) => ({ palabra, indice }))
    .sort((a, b) => b.palabra.length - a.palabra.length)

  for (let intento = 0; intento < INTENTOS_DE_TABLERO; intento++) {
    const tablero = intentarTablero(orden, tamano, aleatorio)
    if (tablero) return tablero
  }
  throw new ErrorDeConfiguracion(
    `No se pudieron acomodar las ${palabras.length} palabras en ${tamano}×${tamano}. Usa un tablero más grande o menos palabras.`,
  )
}

function intentarTablero(
  orden: { palabra: string; indice: number }[],
  tamano: number,
  aleatorio: Aleatorio,
): Tablero | null {
  const letras: (string | null)[][] = Array.from({ length: tamano }, () =>
    Array<string | null>(tamano).fill(null),
  )
  const ubicaciones: Ubicacion[] = []

  for (const { palabra, indice } of orden) {
    const ubicacion = colocar(palabra, indice, letras, tamano, aleatorio)
    if (!ubicacion) return null
    ubicaciones.push(ubicacion)
  }

  ubicaciones.sort((a, b) => a.indice - b.indice)
  const llenas = letras.map((fila) =>
    fila.map((l) => l ?? ALFABETO[Math.floor(aleatorio() * ALFABETO.length)]),
  )
  return { tamano, letras: llenas, ubicaciones }
}

function colocar(
  palabra: string,
  indice: number,
  letras: (string | null)[][],
  tamano: number,
  aleatorio: Aleatorio,
): Ubicacion | null {
  const n = palabra.length
  for (let i = 0; i < INTENTOS_POR_PALABRA; i++) {
    const [df, dc] = DIRECCIONES[Math.floor(aleatorio() * DIRECCIONES.length)]
    // Rango de inicios válidos para que la palabra quede dentro del tablero.
    const filaMin = df < 0 ? n - 1 : 0
    const filaMax = df > 0 ? tamano - n : tamano - 1
    const colMax = dc > 0 ? tamano - n : tamano - 1
    if (filaMax < filaMin || colMax < 0) continue
    const fila = filaMin + Math.floor(aleatorio() * (filaMax - filaMin + 1))
    const col = Math.floor(aleatorio() * (colMax + 1))

    const celdas: Celda[] = []
    let cabe = true
    for (let k = 0; k < n; k++) {
      const f = fila + df * k
      const c = col + dc * k
      const actual = letras[f][c]
      if (actual !== null && actual !== palabra[k]) {
        cabe = false
        break
      }
      celdas.push({ fila: f, col: c })
    }
    if (!cabe) continue

    celdas.forEach(({ fila: f, col: c }, k) => {
      letras[f][c] = palabra[k]
    })
    return { indice, inicio: celdas[0], fin: celdas[n - 1], celdas }
  }
  return null
}

/**
 * Celdas en línea recta entre dos puntos. Si no están alineados (horizontal,
 * vertical o diagonal), ajusta el final a la dirección más cercana.
 */
export function lineaEntre(inicio: Celda, hasta: Celda, tamano: number): Celda[] {
  const df = hasta.fila - inicio.fila
  const dc = hasta.col - inicio.col
  if (df === 0 && dc === 0) return [inicio]

  const angulo = Math.atan2(df, dc)
  const octante = Math.round(angulo / (Math.PI / 4))
  const pasoF = Math.round(Math.sin((octante * Math.PI) / 4))
  const pasoC = Math.round(Math.cos((octante * Math.PI) / 4))
  const largo = Math.max(Math.abs(df), Math.abs(dc))

  const celdas: Celda[] = []
  for (let k = 0; k <= largo; k++) {
    const f = inicio.fila + pasoF * k
    const c = inicio.col + pasoC * k
    if (f < 0 || c < 0 || f >= tamano || c >= tamano) break
    celdas.push({ fila: f, col: c })
  }
  return celdas
}

const misma = (a: Celda, b: Celda) => a.fila === b.fila && a.col === b.col

/** La ubicación que coincide con la selección, en cualquier sentido. */
export function buscarPalabra(
  seleccion: Celda[],
  ubicaciones: Ubicacion[],
): Ubicacion | null {
  if (seleccion.length < 2) return null
  const a = seleccion[0]
  const b = seleccion[seleccion.length - 1]
  return (
    ubicaciones.find(
      (u) =>
        u.celdas.length === seleccion.length &&
        ((misma(u.inicio, a) && misma(u.fin, b)) || (misma(u.inicio, b) && misma(u.fin, a))),
    ) ?? null
  )
}
