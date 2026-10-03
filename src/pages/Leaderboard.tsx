import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { AHORCADO, type JuegoId } from '../config/juegos.ts'
import { obtenerRanking, type FilaRanking } from '../lib/api.ts'
import { formatearDuracion } from '../lib/texto.ts'

const PESTANAS: { juego: JuegoId; nombre: string }[] = [
  { juego: 'sopa', nombre: 'Sopa de letras' },
  { juego: 'ahorcado', nombre: AHORCADO.nombre },
]

const MEDALLAS = ['#F7C548', '#D9D4CE', '#E2A574']
const REFRESCO_MS = 15_000

type Estado =
  | { tipo: 'cargando' }
  | { tipo: 'listo'; filas: FilaRanking[]; consulta: string }
  | { tipo: 'error'; consulta: string }

function Leaderboard() {
  const [params, setParams] = useSearchParams()
  const juego: JuegoId = params.get('juego') === 'ahorcado' ? 'ahorcado' : 'sopa'
  const jugadorId = params.get('jugador')
  const [guardado, setEstado] = useState<Estado>({ tipo: 'cargando' })
  // Al cambiar de pestaña, lo guardado es de otra consulta: se muestra cargando.
  const consulta = `${juego}:${jugadorId}`
  const estado: Estado = 'consulta' in guardado && guardado.consulta !== consulta ? { tipo: 'cargando' } : guardado

  useEffect(() => {
    let vigente = true
    const consulta = `${juego}:${jugadorId}`
    const cargar = () =>
      obtenerRanking(juego, jugadorId)
        .then(({ filas }) => vigente && setEstado({ tipo: 'listo', filas, consulta }))
        .catch(
          () =>
            vigente &&
            setEstado((e) => (e.tipo === 'listo' && e.consulta === consulta ? e : { tipo: 'error', consulta })),
        )
    void cargar()
    // Se refresca solo, por si queda proyectado en una pantalla del evento.
    const id = setInterval(cargar, REFRESCO_MS)
    return () => {
      vigente = false
      clearInterval(id)
    }
  }, [juego, jugadorId])

  function cambiar(nuevo: JuegoId) {
    const siguiente = new URLSearchParams(params)
    siguiente.set('juego', nuevo)
    setParams(siguiente, { replace: true })
  }

  return (
    <main className={`pantalla ranking juego-${juego}`}>
      <div className="ranking-cabecera">
        <div>
          <div className="etiqueta muted" style={{ letterSpacing: '0.18em' }}>
            JOALCA GAMES
          </div>
          <h1 className="titulo">Ranking</h1>
        </div>
        <Link to="/" className="btn btn-primario btn-inicio">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 11l9-7 9 7" />
            <path d="M5 10v10h14V10" />
          </svg>
          <span>Inicio</span>
        </Link>
      </div>

      <div role="tablist" className="pestanas">
        {PESTANAS.map((p) => (
          <button
            key={p.juego}
            type="button"
            role="tab"
            aria-selected={p.juego === juego}
            className="pestana"
            onClick={() => cambiar(p.juego)}
          >
            {p.nombre}
          </button>
        ))}
      </div>

      {estado.tipo === 'cargando' && (
        <div className="ranking-lista" aria-busy="true" style={{ gap: 8 }}>
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="esqueleto" />
          ))}
        </div>
      )}

      {estado.tipo === 'error' && (
        <div className="ranking-vacio">
          <div className="titulo">No pudimos cargar el ranking</div>
          <div className="muted" style={{ fontSize: 20 }}>Revisa la conexión. Lo intentaremos de nuevo en unos segundos.</div>
        </div>
      )}

      {estado.tipo === 'listo' && estado.filas.length === 0 && (
        <div className="ranking-vacio">
          <div className="titulo">Todavía no hay ganadores</div>
          <div className="muted" style={{ fontSize: 20 }}>¡El primero en terminar se queda con el puesto #1!</div>
        </div>
      )}

      {estado.tipo === 'listo' && estado.filas.length > 0 && (
        <ol className="ranking-lista">
          {estado.filas.map((f, i) => {
            // La fila del jugador fuera del top va separada del resto.
            const separada = i > 0 && f.posicion > estado.filas[i - 1].posicion + 1
            return (
              <li key={f.posicion} className={`fila-ranking${f.esTu ? ' yo' : ''}${separada ? ' separada' : ''}`}>
                <div className="medalla" style={{ background: MEDALLAS[f.posicion - 1] ?? 'transparent' }}>
                  {f.posicion}
                </div>
                <div className="fila-nombre">{f.nombre}</div>
                {f.esTu && <div className="etiqueta-tu">Tú</div>}
                <div className="fila-tiempo">{formatearDuracion(f.tiempoMs)}</div>
              </li>
            )
          })}
        </ol>
      )}
    </main>
  )
}

export default Leaderboard
