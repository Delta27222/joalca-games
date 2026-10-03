import { db } from './_lib/db.js'
import { ErrorHttp, json, manejar, uuidOpcional } from './_lib/http.js'
import { posicionDe } from './_lib/ranking.js'

/** GET /api/jugador?id=<id> → nombre y posición en cada juego (página personal). */
export const GET = manejar(async (request) => {
  const id = uuidOpcional(new URL(request.url).searchParams.get('id'))
  if (!id) throw new ErrorHttp(404, 'Jugador no encontrado')

  const [jugador] = await db()<{ nombre: string }[]>`
    select nombre from jugadores where id = ${id}
  `
  if (!jugador) throw new ErrorHttp(404, 'Jugador no encontrado')

  const [sopa, ahorcado] = await Promise.all([posicionDe('sopa', id), posicionDe('ahorcado', id)])
  const resumen = (f: Awaited<ReturnType<typeof posicionDe>>) =>
    f ? { posicion: f.posicion, tiempoMs: f.tiempoMs } : null

  return json({
    nombre: jugador.nombre.trim().split(/\s+/)[0],
    sopa: resumen(sopa),
    ahorcado: resumen(ahorcado),
  })
})
