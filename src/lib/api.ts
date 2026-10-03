import type { JuegoId } from '../config/juegos.ts'

export class ErrorApi extends Error {
  status: number
  constructor(status: number, mensaje: string) {
    super(mensaje)
    this.status = status
  }
}

async function pedir<T>(url: string, init?: RequestInit): Promise<T> {
  let respuesta: Response
  try {
    respuesta = await fetch(url, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    })
  } catch {
    throw new ErrorApi(0, 'Sin conexión')
  }
  const cuerpo = await respuesta.json().catch(() => ({}))
  if (!respuesta.ok) {
    throw new ErrorApi(respuesta.status, cuerpo.error ?? 'Error del servidor')
  }
  return cuerpo as T
}

const post = <T>(url: string, cuerpo: unknown) =>
  pedir<T>(url, { method: 'POST', body: JSON.stringify(cuerpo) })

export type DatosRegistro = {
  nombre: string
  telefono: string
  email: string
  consentimiento: boolean
}

export function registrar(datos: DatosRegistro) {
  return post<{ jugadorId: string }>('/api/registro', datos)
}

export function crearPartida(jugadorId: string, juego: JuegoId) {
  return post<{ partidaId: string }>('/api/partidas', { jugadorId, juego })
}

export type ResultadoServidor = {
  resultado: 'gana' | 'pierde'
  duracionMs: number
  posicion: number | null
}

export async function terminarPartida(
  partidaId: string,
  resultado: 'gana' | 'pierde',
  errores: number,
): Promise<ResultadoServidor> {
  // Reintenta ante fallos de red: en el stand el wifi puede fallar un momento.
  let ultimo: unknown
  for (let intento = 0; intento < 3; intento++) {
    try {
      return await post<ResultadoServidor>('/api/terminar', { partidaId, resultado, errores })
    } catch (error) {
      ultimo = error
      if (error instanceof ErrorApi && error.status !== 0 && error.status < 500) throw error
      await new Promise((r) => setTimeout(r, 800 * (intento + 1)))
    }
  }
  throw ultimo
}

export type FilaRanking = { posicion: number; nombre: string; tiempoMs: number; esTu: boolean }

export function obtenerRanking(juego: JuegoId, jugadorId: string | null) {
  const params = new URLSearchParams({ juego })
  if (jugadorId) params.set('jugador', jugadorId)
  return pedir<{ filas: FilaRanking[] }>(`/api/ranking?${params}`)
}

export type PosicionJugador = { posicion: number; tiempoMs: number } | null

export function obtenerJugador(id: string) {
  return pedir<{ nombre: string; sopa: PosicionJugador; ahorcado: PosicionJugador }>(
    `/api/jugador?id=${encodeURIComponent(id)}`,
  )
}
