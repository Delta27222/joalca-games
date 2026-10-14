import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { Link } from 'react-router'
import {
  CODIGOS_TELEFONO,
  DIGITOS_TELEFONO,
  DOMINIOS_EMAIL,
  limiteMs,
  TEXTO_CONSENTIMIENTO,
  type JuegoId,
} from '../config/juegos.ts'
import { ErrorApi, registrar } from '../lib/api.ts'
import { formatearTiempo } from '../lib/texto.ts'
import { llevarALaVista, useAltoTeclado } from '../lib/useTeclado.ts'

type Props = {
  juego: JuegoId
  /** Lo que ya había escrito, al volver desde las instrucciones. */
  inicial?: DatosRegistro | null
  onRegistrado: (jugadorId: string, datos: DatosRegistro) => void
}

/** Lo escrito en el formulario, para recuperarlo al volver atrás. */
export type DatosRegistro = {
  nombre: string
  codigo: string
  telefono: string
  usuarioEmail: string
  dominioEmail: string
  otroDominio: string
  consentimiento: boolean
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Valor del selector de dominio que muestra un campo para escribir uno propio.
const OTRO_DOMINIO = 'otro'

// En desarrollo el formulario se puede enviar vacío: lo que falte se completa
// con este jugador de prueba. El teléfono es fijo para reusar siempre la misma fila.
const EN_DESARROLLO = import.meta.env.DEV
const JUGADOR_DE_PRUEBA = { nombre: 'Prueba', telefono: '0000000' }

function Registro({ juego, inicial, onRegistrado }: Props) {
  // Nunca se autocompleta: en el iPad pasa una persona tras otra. Solo se
  // recupera lo que esta misma persona escribió si vuelve desde las instrucciones.
  const [nombre, setNombre] = useState(inicial?.nombre ?? '')
  const [codigo, setCodigo] = useState(inicial?.codigo ?? CODIGOS_TELEFONO[0])
  const [telefono, setTelefono] = useState(inicial?.telefono ?? '')
  // El email se pide en dos partes: usuario @ dominio (del selector o escrito).
  const [usuarioEmail, setUsuarioEmail] = useState(inicial?.usuarioEmail ?? '')
  const [dominioEmail, setDominioEmail] = useState(inicial?.dominioEmail ?? DOMINIOS_EMAIL[0])
  const [otroDominio, setOtroDominio] = useState(inicial?.otroDominio ?? '')
  const [consentimiento, setConsentimiento] = useState(inicial?.consentimiento ?? false)
  const [intentado, setIntentado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [errorServidor, setErrorServidor] = useState<string | null>(null)
  const altoTeclado = useAltoTeclado()

  const dominio = dominioEmail === OTRO_DOMINIO ? otroDominio.trim().toLowerCase() : dominioEmail
  const email = usuarioEmail.trim() ? `${usuarioEmail.trim()}@${dominio}` : ''

  const errores = {
    nombre: nombre.trim() ? null : 'Escribe tu nombre.',
    telefono: telefono.length === DIGITOS_TELEFONO ? null : `Escribe los ${DIGITOS_TELEFONO} dígitos después del código.`,
    email: !email.trim() || EMAIL.test(email.trim()) ? null : 'Revisa el email o déjalo vacío.',
    consentimiento: consentimiento ? null : 'Debes aceptar para participar.',
  }
  const visible = (campo: keyof typeof errores) => (intentado && !EN_DESARROLLO ? errores[campo] : null)

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setIntentado(true)
    setErrorServidor(null)
    if (!EN_DESARROLLO && Object.values(errores).some(Boolean)) return

    const datos = EN_DESARROLLO
      ? {
          nombre: errores.nombre ? JUGADOR_DE_PRUEBA.nombre : nombre.trim(),
          telefono: codigo + (errores.telefono ? JUGADOR_DE_PRUEBA.telefono : telefono),
          email: errores.email ? '' : email,
          consentimiento: true,
        }
      : { nombre: nombre.trim(), telefono: codigo + telefono, email, consentimiento }

    setEnviando(true)
    try {
      const { jugadorId } = await registrar(datos)
      onRegistrado(jugadorId, { nombre, codigo, telefono, usuarioEmail, dominioEmail, otroDominio, consentimiento })
    } catch (error) {
      setErrorServidor(
        error instanceof ErrorApi && error.status === 400
          ? error.message
          : 'No pudimos guardar tus datos. Revisa la conexión y toca “Continuar” otra vez.',
      )
      setEnviando(false)
    }
  }

  // Si escriben la @ en el usuario (o pegan el email completo), lo que va
  // después pasa al selector, o al campo de otro dominio si no está en la lista.
  function cambiarUsuarioEmail(valor: string) {
    const arroba = valor.indexOf('@')
    if (arroba === -1) return setUsuarioEmail(valor)
    setUsuarioEmail(valor.slice(0, arroba))
    const despues = valor.slice(arroba + 1).trim().toLowerCase()
    if (DOMINIOS_EMAIL.includes(despues)) setDominioEmail(despues)
    else if (despues.includes('.')) {
      setDominioEmail(OTRO_DOMINIO)
      setOtroDominio(despues)
    }
  }

  // Intro en el teclado pasa al siguiente campo, para no tener que tocar uno
  // que quedó tapado. En el email (el último) cierra el teclado.
  function siguienteCampo(evento: KeyboardEvent<HTMLFormElement>) {
    const actual = evento.target
    if (evento.key !== 'Enter' || !(actual instanceof HTMLInputElement) || actual.type === 'checkbox') return
    evento.preventDefault()
    const orden = ['f-nombre', 'f-tel', 'f-email', ...(dominioEmail === OTRO_DOMINIO ? ['f-email-otro'] : [])]
    const siguiente = orden[orden.indexOf(actual.id) + 1]
    if (siguiente) document.getElementById(siguiente)?.focus()
    else actual.blur()
  }

  return (
    <main
      className={`registro${altoTeclado ? ' con-teclado' : ''}`}
      // Espacio bajo el formulario para poder desplazarlo por encima del teclado.
      style={altoTeclado ? { paddingBottom: altoTeclado + 24 } : undefined}
    >
      <div className="registro-intro">
        <Link to="/" className="btn-pildora">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 6l-6 6 6 6" />
          </svg>
          <span>Inicio</span>
        </Link>
        <h1 className="titulo">Regístrate y juega</h1>
        <p className="muted">Al terminar entras al sorteo, ganes o pierdas.</p>
        <div className="chip">Tienes {formatearTiempo(limiteMs(juego)).replace(/^0/, '')}</div>
      </div>

      <form
        className="formulario"
        onSubmit={enviar}
        onKeyDown={siguienteCampo}
        // Espera a que el teclado termine de abrirse antes de mover el campo.
        onFocus={() => setTimeout(llevarALaVista, 350)}
        noValidate
      >
        {EN_DESARROLLO && <div className="chip">Modo desarrollo: puedes continuar sin llenar los datos.</div>}
        {errorServidor && (
          <div role="alert" className="alerta">
            {errorServidor}
          </div>
        )}
        <div className="campo">
          <label htmlFor="f-nombre">Nombre *</label>
          <input
            id="f-nombre"
            type="text"
            autoComplete="off"
            placeholder="Tu nombre"
            enterKeyHint="next"
            maxLength={60}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            aria-invalid={!!visible('nombre')}
          />
          {visible('nombre') && <div className="campo-error">{visible('nombre')}</div>}
        </div>
        <div className="campo">
          <label htmlFor="f-tel">Teléfono *</label>
          <div className="telefono">
            <select
              aria-label="Código de operadora"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
            >
              {CODIGOS_TELEFONO.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              id="f-tel"
              type="tel"
              inputMode="numeric"
              autoComplete="off"
              placeholder="1234567"
              enterKeyHint="next"
              maxLength={DIGITOS_TELEFONO}
              value={telefono}
              onChange={(e) => setTelefono(e.target.value.replace(/\D/g, '').slice(0, DIGITOS_TELEFONO))}
              aria-invalid={!!visible('telefono')}
            />
          </div>
          {visible('telefono') && <div className="campo-error">{visible('telefono')}</div>}
        </div>
        <div className="campo">
          <label htmlFor="f-email">
            Email <span className="muted">(opcional)</span>
          </label>
          <div className="email">
            <input
              id="f-email"
              type="email"
              autoComplete="off"
              placeholder="nombre"
              enterKeyHint={dominioEmail === OTRO_DOMINIO ? 'next' : 'done'}
              maxLength={80}
              value={usuarioEmail}
              onChange={(e) => cambiarUsuarioEmail(e.target.value)}
              aria-invalid={!!visible('email')}
            />
            <span className="email-arroba" aria-hidden="true">
              @
            </span>
            <select aria-label="Dominio del email" value={dominioEmail} onChange={(e) => setDominioEmail(e.target.value)}>
              {DOMINIOS_EMAIL.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
              <option value={OTRO_DOMINIO}>Otro…</option>
            </select>
          </div>
          {dominioEmail === OTRO_DOMINIO && (
            <input
              id="f-email-otro"
              type="text"
              inputMode="url"
              autoComplete="off"
              autoCapitalize="none"
              placeholder="empresa.com"
              aria-label="Otro dominio del email"
              enterKeyHint="done"
              maxLength={60}
              value={otroDominio}
              onChange={(e) => setOtroDominio(e.target.value.replace(/[@\s]/g, ''))}
              aria-invalid={!!visible('email')}
            />
          )}
          {visible('email') && <div className="campo-error">{visible('email')}</div>}
        </div>
        <div className="campo">
          <label className="consentimiento">
            <input type="checkbox" checked={consentimiento} onChange={(e) => setConsentimiento(e.target.checked)} />
            <span>{TEXTO_CONSENTIMIENTO} *</span>
          </label>
          {visible('consentimiento') && (
            <div className="campo-error" style={{ paddingLeft: 40 }}>
              {visible('consentimiento')}
            </div>
          )}
        </div>
        <button type="submit" className="btn btn-primario" disabled={enviando}>
          {enviando && <span className="girando" />}
          <span>{enviando ? 'Enviando…' : 'Continuar'}</span>
        </button>
      </form>
    </main>
  )
}

export default Registro
