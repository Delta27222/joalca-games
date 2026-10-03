import { AHORCADO, limiteMs, SOPA, type JuegoId } from '../config/juegos.ts'
import { formatearTiempo } from '../lib/texto.ts'
import Perrito from './Perrito.tsx'

type Props = {
  juego: JuegoId
  error: string | null
  onComenzar: () => void
}

function Instrucciones({ juego, error, onComenzar }: Props) {
  return (
    <main className="instrucciones">
      <div className="instrucciones-tarjeta">
        <div className="instrucciones-arte">
          {juego === 'sopa' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
              <div className="demo-palabra">
                {[...'OMEGA'].map((l) => (
                  <div key={l}>{l}</div>
                ))}
              </div>
              <svg width="200" height="44" viewBox="0 0 200 44" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent)' }} aria-hidden="true">
                <path d="M20 22h150" />
                <path d="M160 12l12 10-12 10" />
                <circle cx="20" cy="22" r="8" fill="currentColor" />
              </svg>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--accent)' }}>Arrastra el dedo</div>
            </div>
          ) : (
            <Perrito errores={0} className="perrito-instrucciones" />
          )}
        </div>
        <div className="instrucciones-texto">
          <h1 className="titulo">¿Cómo se juega?</h1>
          <p>{juego === 'sopa' ? SOPA.regla : AHORCADO.regla}</p>
          <div className="chip">
            <IconoReloj />
            <span>Tienes {formatearTiempo(limiteMs(juego)).replace(/^0/, '')}</span>
          </div>
          {error && (
            <div role="alert" className="alerta">
              {error}
            </div>
          )}
          <button type="button" className="btn btn-primario btn-grande" onClick={onComenzar}>
            ¡Comenzar!
          </button>
        </div>
      </div>
    </main>
  )
}

export function IconoReloj() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2.5 2" />
      <path d="M10 2h4" />
    </svg>
  )
}

export default Instrucciones
