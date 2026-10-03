import { normalizar, type Aleatorio } from './texto.ts'

/** Letras de la frase sin repetir, normalizadas y sin espacios. */
export function letrasDe(frase: string): string[] {
  return [...new Set([...normalizar(frase)].filter((l) => l !== ' '))]
}

function contar(frase: string, letras: readonly string[]): number {
  return [...normalizar(frase)].filter((l) => letras.includes(l)).length
}

function combinaciones<T>(items: readonly T[], k: number): T[][] {
  if (k === 0) return [[]]
  if (items.length < k) return []
  const [primero, ...resto] = items
  return [
    ...combinaciones(resto, k - 1).map((c) => [primero, ...c]),
    ...combinaciones(resto, k),
  ]
}

/**
 * Elige al azar `cantidad` letras distintas que, juntas, revelen entre
 * `min` y `max` casillas. Si ninguna combinación cae en el rango, usa la
 * que más se acerque.
 */
export function elegirLetrasDePista(
  frase: string,
  cantidad: number,
  rango: { min: number; max: number },
  aleatorio: Aleatorio = Math.random,
): string[] {
  const todas = combinaciones(letrasDe(frase), cantidad)
  if (todas.length === 0) return []

  const validas = todas.filter((c) => {
    const n = contar(frase, c)
    return n >= rango.min && n <= rango.max
  })
  if (validas.length > 0) return validas[Math.floor(aleatorio() * validas.length)]

  const distancia = (c: string[]) => {
    const n = contar(frase, c)
    return n < rango.min ? rango.min - n : n - rango.max
  }
  return todas.reduce((mejor, c) => (distancia(c) < distancia(mejor) ? c : mejor))
}

/** La frase está completa cuando todas sus letras están reveladas. */
export function estaCompleta(frase: string, reveladas: ReadonlySet<string>): boolean {
  return letrasDe(frase).every((l) => reveladas.has(l))
}

export const FILAS_DEL_TECLADO = ['QWERTYUIOP', 'ASDFGHJKLÑ', 'ZXCVBNM']
