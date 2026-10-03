import { CODIGOS_TELEFONO, DIGITOS_TELEFONO } from '../src/config/juegos.js'
import { db } from './_lib/db.js'
import { ErrorHttp, json, leerJson, manejar } from './_lib/http.js'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TELEFONO = new RegExp(`^(${CODIGOS_TELEFONO.join('|')})\\d{${DIGITOS_TELEFONO}}$`)

/** Crea o actualiza al jugador por su teléfono. Devuelve solo su id. */
export const POST = manejar(async (request) => {
  const cuerpo = await leerJson(request)

  const nombre = typeof cuerpo.nombre === 'string' ? cuerpo.nombre.trim() : ''
  if (nombre.length < 1 || nombre.length > 60) throw new ErrorHttp(400, 'Escribe tu nombre.')

  const telefono = typeof cuerpo.telefono === 'string' ? cuerpo.telefono.replace(/\s+/g, '') : ''
  if (!TELEFONO.test(telefono)) {
    throw new ErrorHttp(400, `Elige el código y escribe los ${DIGITOS_TELEFONO} dígitos restantes.`)
  }

  const email = typeof cuerpo.email === 'string' && cuerpo.email.trim() ? cuerpo.email.trim() : null
  if (email && (email.length > 120 || !EMAIL.test(email))) {
    throw new ErrorHttp(400, 'El email no es válido.')
  }

  if (cuerpo.consentimiento !== true) throw new ErrorHttp(400, 'Debes aceptar para participar.')

  // Si vuelve, se queda con el último nombre; el email solo se reemplaza si escribió uno.
  const [jugador] = await db()<{ id: string }[]>`
    insert into jugadores (nombre, telefono, email, consentimiento_at)
    values (${nombre}, ${telefono}, ${email}, now())
    on conflict (telefono) do update set
      nombre = excluded.nombre,
      email = coalesce(excluded.email, jugadores.email),
      consentimiento_at = excluded.consentimiento_at,
      actualizado_at = now()
    returning id
  `
  return json({ jugadorId: jugador.id })
})
