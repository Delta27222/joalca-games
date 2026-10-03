export const ALFABETO = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'

/** Mayúsculas y sin tildes, pero conservando la Ñ como letra propia. */
export function normalizar(texto: string): string {
  return texto
    .toUpperCase()
    // Se aparta la Ñ con un carácter de uso privado para que NFD no la parta.
    .replace(/Ñ/g, '')
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .replace(//g, 'Ñ')
}

export function formatearTiempo(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/** Para tiempos ya transcurridos: redondea hacia abajo, como un cronómetro. */
export function formatearDuracion(ms: number): string {
  return formatearTiempo(Math.floor(ms / 1000) * 1000)
}

export type Aleatorio = () => number
