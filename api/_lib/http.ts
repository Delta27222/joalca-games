import { JUEGOS, type JuegoId } from '../../src/config/juegos.js'

export class ErrorHttp extends Error {
  status: number
  constructor(status: number, mensaje: string) {
    super(mensaje)
    this.status = status
  }
}

export function json(cuerpo: unknown, status = 200): Response {
  return Response.json(cuerpo, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  })
}

/** Envuelve un handler: los ErrorHttp se devuelven tal cual, el resto como 500. */
export function manejar(fn: (request: Request) => Promise<Response>) {
  return async (request: Request): Promise<Response> => {
    try {
      return await fn(request)
    } catch (error) {
      if (error instanceof ErrorHttp) return json({ error: error.message }, error.status)
      console.error(error)
      return json({ error: 'Error interno del servidor' }, 500)
    }
  }
}

export async function leerJson(request: Request): Promise<Record<string, unknown>> {
  try {
    const cuerpo: unknown = await request.json()
    if (cuerpo && typeof cuerpo === 'object') return cuerpo as Record<string, unknown>
  } catch {
    // cae al error de abajo
  }
  throw new ErrorHttp(400, 'El cuerpo debe ser JSON')
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function uuid(valor: unknown, campo: string): string {
  if (typeof valor === 'string' && UUID.test(valor)) return valor
  throw new ErrorHttp(400, `${campo} no es válido`)
}

export function uuidOpcional(valor: unknown): string | null {
  return typeof valor === 'string' && UUID.test(valor) ? valor : null
}

export function juego(valor: unknown): JuegoId {
  if (JUEGOS.includes(valor as JuegoId)) return valor as JuegoId
  throw new ErrorHttp(400, 'Juego no válido')
}

/** "Valentina Rodríguez" → "Valentina R.": el ranking es público. */
export function nombrePublico(nombre: string): string {
  const [primero, segundo] = nombre.trim().split(/\s+/)
  return segundo ? `${primero} ${segundo[0].toUpperCase()}.` : primero
}
