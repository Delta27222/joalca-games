import type { ReactNode } from 'react'
import { AHORCADO, SOPA, type JuegoId } from '../config/juegos.ts'
import { formatearDuracion } from '../lib/texto.ts'
import CodigoQr from './CodigoQr.tsx'
import Confeti from './Confeti.tsx'

export type EstadoGuardado =
  | { tipo: 'guardando' }
  | { tipo: 'guardado'; duracionMs: number; posicion: number | null; gana: boolean }
  | { tipo: 'error'; mensaje: string }

type Props = {
  juego: JuegoId
  gana: boolean
  titulo: string
  jugadorId: string
  guardado: EstadoGuardado
  /** Columna izquierda opcional (el perrito en el ahorcado). */
  lateral?: ReactNode
  children: ReactNode
  onReintentar: () => void
  onRanking: () => void
  onOtraVez: () => void
}

function PantallaResultado(props: Props) {
  const { juego, gana, titulo, jugadorId, guardado, lateral, children } = props
  const urlPersonal = `${window.location.origin}/jugador/${jugadorId}`
  const marca = juego === 'sopa' ? `${SOPA.marca} · SOPA DE LETRAS` : `${AHORCADO.marca} · ${AHORCADO.formula.toUpperCase()}`

  return (
    <div className={`resultado${gana ? '' : ' perdio'}`}>
      {gana && <Confeti />}
      <div className="resultado-tarjeta">
        {lateral}
        <div className="resultado-cuerpo">
          <div className="etiqueta">{marca}</div>
          <h1 className="titulo resultado-titulo">{titulo}</h1>
          {children}

          {guardado.tipo === 'guardando' && (
            <div className="guardando">
              <span className="girando" />
              Guardando tu resultado…
            </div>
          )}
          {guardado.tipo === 'guardado' && guardado.gana && (
            <div className="resultado-datos">
              <div className="dato">
                <div className="dato-etiqueta">Quedaste en el puesto</div>
                <div className="dato-valor">#{guardado.posicion ?? '—'}</div>
              </div>
              <div className="dato">
                <div className="dato-etiqueta">Tu tiempo</div>
                <div className="dato-valor">{formatearDuracion(guardado.duracionMs)}</div>
              </div>
            </div>
          )}
          {guardado.tipo === 'error' && (
            <div role="alert" className="alerta" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ flex: 1 }}>{guardado.mensaje}</span>
              <button type="button" className="btn btn-secundario" style={{ height: 48, fontSize: 18 }} onClick={props.onReintentar}>
                Reintentar
              </button>
            </div>
          )}

          <div className="sorteo">
            <IconoRegalo />
            <span>Ya estás participando en el sorteo</span>
          </div>

          <div className="resultado-acciones">
            <button type="button" className="btn btn-secundario" onClick={props.onRanking}>
              Ver ranking
            </button>
            <button type="button" className="btn btn-primario" onClick={props.onOtraVez}>
              Jugar de nuevo
            </button>
          </div>
        </div>
        <div className="resultado-qr">
          <CodigoQr url={urlPersonal} />
          <div>Escanea para ver tu posición en tu celular</div>
        </div>
      </div>
    </div>
  )
}

export function IconoRegalo({ tamano = 28 }: { tamano?: number }) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 12v9H4v-9" />
      <path d="M2 7h20v5H2z" />
      <path d="M12 21V7" />
      <path d="M12 7H8a2.5 2.5 0 1 1 0-5c3 0 4 5 4 5Z" />
      <path d="M12 7h4a2.5 2.5 0 1 0 0-5c-3 0-4 5-4 5Z" />
    </svg>
  )
}

export default PantallaResultado
