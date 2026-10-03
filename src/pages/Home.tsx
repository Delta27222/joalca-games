import { Link } from 'react-router'
import { IconoReloj } from '../components/Instrucciones.tsx'
import Perrito from '../components/Perrito.tsx'
import { AHORCADO, SOPA } from '../config/juegos.ts'

// Mini sopa decorativa de la tarjeta, con OMEGA resaltada.
const FILAS_DEMO = ['RAPEJT', 'OMEGAK', 'ÑDFIBU', 'SLCVOE']

function Flecha() {
  return (
    <div className="tarjeta-flecha">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 12h14" />
        <path d="M13 6l6 6-6 6" />
      </svg>
    </div>
  )
}

function Home() {
  return (
    <main className="pantalla inicio">
      <div className="inicio-burbuja" style={{ width: 520, height: 520, background: '#FDE6DA', top: -260, right: -160 }} />
      <div className="inicio-burbuja" style={{ width: 420, height: 420, background: '#E6F0EA', bottom: -240, left: -140 }} />

      <div className="inicio-cabecera">
        <div className="etiqueta muted" style={{ fontSize: 15, letterSpacing: '0.18em' }}>
          JOALCA GAMES
        </div>
        <h1 className="titulo">¡Juega y entra al sorteo!</h1>
        <p className="muted">Elige un juego. Todos los que juegan participan, ganen o pierdan.</p>
      </div>

      <nav className="inicio-tarjetas">
        <Link to="/sopa-de-letras" className="tarjeta-juego juego-sopa" aria-label={`${SOPA.nombre}, Taste of the Wild, 2 minutos`}>
          <div className="tarjeta-arte">
            <div className="logo-hueco">LOGO</div>
            <div className="tarjeta-letras">
              {FILAS_DEMO.flatMap((fila, f) =>
                [...fila].map((letra, c) => {
                  const resaltada = f === 1 && c < 5
                  return (
                    <div
                      key={`${f}-${c}`}
                      style={{
                        background: resaltada ? '#F7E3A8' : 'rgba(255,255,255,0.14)',
                        color: resaltada ? 'var(--text)' : '#FFFFFF',
                      }}
                    >
                      {letra}
                    </div>
                  )
                }),
              )}
            </div>
          </div>
          <div className="tarjeta-cuerpo">
            <div className="etiqueta">{SOPA.marca}</div>
            <div className="tarjeta-nombre">{SOPA.nombre}</div>
            <div className="tarjeta-pie">
              <div className="chip" style={{ height: 40, fontSize: 17, padding: '0 16px' }}>
                <IconoReloj />
                <span>2 minutos</span>
              </div>
              <Flecha />
            </div>
          </div>
        </Link>

        <Link to="/ahorcado" className="tarjeta-juego juego-ahorcado" aria-label={`${AHORCADO.nombre}, Diamond Care, 1 minuto`}>
          <div className="tarjeta-arte" style={{ alignItems: 'flex-end' }}>
            <div className="logo-hueco">LOGO</div>
            <div style={{ position: 'absolute', right: 28, top: 28, display: 'flex', gap: 6 }}>
              <div className="tarjeta-letras" style={{ display: 'flex', transform: 'none' }}>
                <div style={{ width: 36, height: 44, background: '#FFFFFF', color: 'var(--accent-ahorcado)' }}>D</div>
                <div style={{ width: 36, height: 44, background: 'rgba(255,255,255,0.25)' }} />
                <div style={{ width: 36, height: 44, background: 'rgba(255,255,255,0.25)' }} />
              </div>
            </div>
            <Perrito errores={0} className="perrito-tarjeta" />
          </div>
          <div className="tarjeta-cuerpo">
            <div className="etiqueta">{AHORCADO.marca}</div>
            <div className="tarjeta-nombre">{AHORCADO.nombre}</div>
            <div className="tarjeta-pie">
              <div className="chip" style={{ height: 40, fontSize: 17, padding: '0 16px' }}>
                <IconoReloj />
                <span>1 minuto</span>
              </div>
              <Flecha />
            </div>
          </div>
        </Link>
      </nav>
    </main>
  )
}

export default Home
