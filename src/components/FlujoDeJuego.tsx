import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import type { JuegoId } from '../config/juegos.ts'
import { crearPartida, ErrorApi, terminarPartida } from '../lib/api.ts'
import CuentaRegresiva from './CuentaRegresiva.tsx'
import Encabezado from './Encabezado.tsx'
import Instrucciones from './Instrucciones.tsx'
import PantallaResultado, { type EstadoGuardado } from './PantallaResultado.tsx'
import Registro from './Registro.tsx'

export type Final<D> = {
  gana: boolean
  errores: number
  duracionLocalMs: number
  detalle: D
}

export type PropsJuego<D> = {
  /** performance.now() del arranque; null durante la cuenta regresiva. */
  inicio: number | null
  onTerminar: (final: Final<D>) => void
}

type Props<D> = {
  juego: JuegoId
  renderJuego: (props: PropsJuego<D>) => ReactNode
  renderResultado: (
    final: Final<D>,
    gana: boolean,
  ) => { titulo: string; lateral?: ReactNode; contenido: ReactNode }
}

type Fase = 'registro' | 'instrucciones' | 'cuenta' | 'jugando' | 'final' | 'resultado'

// Cuánto se ve el tablero en su estado final antes de pasar al resultado.
const PAUSA_GANA_MS = 900
const PAUSA_PIERDE_MS = 2500

/**
 * Registro → instrucciones → cuenta regresiva → juego → resultado.
 * El juego concreto se inyecta con `renderJuego` y `renderResultado`.
 */
function FlujoDeJuego<D>({ juego, renderJuego, renderResultado }: Props<D>) {
  const navigate = useNavigate()
  const [fase, setFase] = useState<Fase>('registro')
  const [jugadorId, setJugadorId] = useState<string | null>(null)
  const [errorInicio, setErrorInicio] = useState<string | null>(null)
  const [inicio, setInicio] = useState<number | null>(null)
  const [ronda, setRonda] = useState(0)
  const [final, setFinal] = useState<Final<D> | null>(null)
  const [guardado, setGuardado] = useState<EstadoGuardado>({ tipo: 'guardando' })
  const partida = useRef<Promise<string> | null>(null)
  const partidaId = useRef<string | null>(null)

  function comenzar() {
    if (!jugadorId) return
    setErrorInicio(null)
    // Se crea durante la cuenta regresiva: el servidor ya descuenta esos 3 s.
    const promesa = crearPartida(jugadorId, juego).then((r) => r.partidaId)
    promesa.catch(() => {})
    partida.current = promesa
    partidaId.current = null
    setInicio(null)
    setFinal(null)
    setRonda((r) => r + 1)
    setFase('cuenta')
  }

  const finCuenta = useCallback(async () => {
    try {
      partidaId.current = await partida.current
      setInicio(performance.now())
      setFase('jugando')
    } catch {
      setErrorInicio('No pudimos iniciar la partida. Revisa la conexión e inténtalo otra vez.')
      setFase('instrucciones')
    }
  }, [])

  const guardar = useCallback(async (f: Final<unknown>) => {
    const id = partidaId.current
    if (!id) return
    setGuardado({ tipo: 'guardando' })
    try {
      const r = await terminarPartida(id, f.gana ? 'gana' : 'pierde', f.errores)
      setGuardado({ tipo: 'guardado', duracionMs: r.duracionMs, posicion: r.posicion, gana: r.resultado === 'gana' })
    } catch (error) {
      if (error instanceof ErrorApi && error.status === 409) {
        // Ya estaba guardada (un reintento cuya primera respuesta se perdió).
        setGuardado({ tipo: 'guardado', duracionMs: f.duracionLocalMs, posicion: null, gana: f.gana })
      } else {
        setGuardado({ tipo: 'error', mensaje: 'No pudimos guardar tu resultado. Revisa la conexión.' })
      }
    }
  }, [])

  const terminar = useCallback(
    (f: Final<D>) => {
      setFinal(f)
      setFase('final')
      void guardar(f)
    },
    [guardar],
  )

  useEffect(() => {
    if (fase !== 'final' || !final) return
    const id = setTimeout(() => setFase('resultado'), final.gana ? PAUSA_GANA_MS : PAUSA_PIERDE_MS)
    return () => clearTimeout(id)
  }, [fase, final])

  const clase = `pantalla juego-${juego}`

  if (fase === 'registro' || !jugadorId) {
    return (
      <div className={clase}>
        <Encabezado juego={juego} />
        <Registro
          juego={juego}
          onRegistrado={(id) => {
            setJugadorId(id)
            setFase('instrucciones')
          }}
        />
      </div>
    )
  }

  if (fase === 'instrucciones') {
    return (
      <div className={clase}>
        <Encabezado juego={juego} />
        <Instrucciones juego={juego} error={errorInicio} onComenzar={comenzar} />
      </div>
    )
  }

  if (fase === 'resultado' && final) {
    // El servidor tiene la última palabra: una victoria fuera de tiempo no cuenta.
    const gana = final.gana && (guardado.tipo !== 'guardado' || guardado.gana)
    const { titulo, lateral, contenido } = renderResultado(final, gana)
    return (
      <div className={`juego-${juego}`}>
        <PantallaResultado
          juego={juego}
          gana={gana}
          titulo={titulo}
          jugadorId={jugadorId}
          guardado={guardado}
          lateral={lateral}
          onReintentar={() => void guardar(final)}
          onRanking={() => navigate(`/leaderboard?juego=${juego}&jugador=${jugadorId}`)}
          onOtraVez={() => {
            // Registro vacío para la siguiente persona.
            setJugadorId(null)
            setFinal(null)
            setFase('registro')
          }}
        >
          {contenido}
        </PantallaResultado>
      </div>
    )
  }

  return (
    <div className={clase} key={ronda}>
      {/* terminar solo lee refs al ser llamado, no durante el render. */}
      {/* oxlint-disable-next-line react/refs */}
      {renderJuego({ inicio, onTerminar: terminar })}
      {fase === 'cuenta' && <CuentaRegresiva onFin={finCuenta} />}
    </div>
  )
}

export default FlujoDeJuego
