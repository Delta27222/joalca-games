import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { limiteMs, TEXTO_CONSENTIMIENTO, type JuegoId } from '../config/juegos.ts'
import { ErrorApi, registrar } from '../lib/api.ts'
import { formatearTiempo } from '../lib/texto.ts'

type Props = {
  juego: JuegoId
  onRegistrado: (jugadorId: string) => void
}

const TELEFONO = /^\d{10,15}$/
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Registro({ juego, onRegistrado }: Props) {
  // Nunca se autocompleta: en el iPad pasa una persona tras otra.
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [consentimiento, setConsentimiento] = useState(false)
  const [intentado, setIntentado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [errorServidor, setErrorServidor] = useState<string | null>(null)

  const errores = {
    nombre: nombre.trim() ? null : 'Escribe tu nombre.',
    telefono: TELEFONO.test(telefono) ? null : 'Usa solo números, de 10 a 15 dígitos.',
    email: !email.trim() || EMAIL.test(email.trim()) ? null : 'Revisa el email o déjalo vacío.',
    consentimiento: consentimiento ? null : 'Debes aceptar para participar.',
  }
  const visible = (campo: keyof typeof errores) => (intentado ? errores[campo] : null)

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setIntentado(true)
    setErrorServidor(null)
    if (Object.values(errores).some(Boolean)) return

    setEnviando(true)
    try {
      const { jugadorId } = await registrar({ nombre: nombre.trim(), telefono, email: email.trim(), consentimiento })
      onRegistrado(jugadorId)
    } catch (error) {
      setErrorServidor(
        error instanceof ErrorApi && error.status === 400
          ? error.message
          : 'No pudimos guardar tus datos. Revisa la conexión y toca “Continuar” otra vez.',
      )
      setEnviando(false)
    }
  }

  return (
    <main className="registro">
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

      <form className="formulario" onSubmit={enviar} noValidate>
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
            maxLength={60}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            aria-invalid={!!visible('nombre')}
          />
          {visible('nombre') && <div className="campo-error">{visible('nombre')}</div>}
        </div>
        <div className="campo">
          <label htmlFor="f-tel">Teléfono *</label>
          <input
            id="f-tel"
            type="tel"
            inputMode="numeric"
            autoComplete="off"
            placeholder="Solo números"
            maxLength={15}
            value={telefono}
            onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ''))}
            aria-invalid={!!visible('telefono')}
          />
          {visible('telefono') && <div className="campo-error">{visible('telefono')}</div>}
        </div>
        <div className="campo">
          <label htmlFor="f-email">
            Email <span className="muted">(opcional)</span>
          </label>
          <input
            id="f-email"
            type="email"
            autoComplete="off"
            placeholder="nombre@correo.com"
            maxLength={120}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!visible('email')}
          />
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
