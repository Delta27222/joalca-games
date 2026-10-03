import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import Confeti from '../components/Confeti.tsx'
import { IconoRegalo } from '../components/PantallaResultado.tsx'
import Perrito from '../components/Perrito.tsx'
import { AHORCADO, SOPA } from '../config/juegos.ts'
import { ErrorApi, obtenerJugador, type PosicionJugador } from '../lib/api.ts'
import { formatearDuracion } from '../lib/texto.ts'

const REFRESCO_MS = 15_000

type Datos = Awaited<ReturnType<typeof obtenerJugador>>
type Estado = { tipo: 'cargando' } | { tipo: 'listo'; datos: Datos } | { tipo: 'invalido' }

function TarjetaPosicion(props: { clase: string; marca: string; juego: string; posicion: PosicionJugador }) {
  const { posicion } = props
  return (
    <div className={`tarjeta-posicion ${props.clase}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div className="etiqueta">{props.marca}</div>
        <div className="tarjeta-posicion-juego">{props.juego}</div>
        <div className="muted" style={{ fontSize: 15 }}>
          {posicion ? `Tu mejor tiempo: ${formatearDuracion(posicion.tiempoMs)}` : 'Sin posición: aún no lo has completado'}
        </div>
      </div>
      <div className={`tarjeta-posicion-numero${posicion ? '' : ' sin-posicion'}`}>
        {posicion ? `#${posicion.posicion}` : '—'}
      </div>
    </div>
  )
}

function Jugador() {
  const { id = '' } = useParams()
  const [estado, setEstado] = useState<Estado>({ tipo: 'cargando' })

  useEffect(() => {
    let vigente = true
    const cargar = () =>
      obtenerJugador(id)
        .then((datos) => vigente && setEstado({ tipo: 'listo', datos }))
        .catch((error) => {
          // Un fallo de red no borra lo que ya se ve.
          if (vigente && error instanceof ErrorApi && error.status === 404) setEstado({ tipo: 'invalido' })
        })
    void cargar()
    const intervalo = setInterval(cargar, REFRESCO_MS)
    return () => {
      vigente = false
      clearInterval(intervalo)
    }
  }, [id])

  if (estado.tipo === 'invalido') {
    return (
      <main className="pantalla personal">
        <div className="centrado">
          <Perrito errores={3} className="perrito-personal" />
          <h1 className="titulo" style={{ fontSize: 30 }}>No encontramos este jugador</h1>
          <p className="muted" style={{ fontSize: 17, lineHeight: 1.45 }}>
            Revisa que escaneaste el código correcto o pide ayuda en el stand.
          </p>
        </div>
      </main>
    )
  }

  if (estado.tipo === 'cargando') {
    return (
      <main className="pantalla personal">
        <div className="centrado">
          <span className="girando" />
        </div>
      </main>
    )
  }

  const { nombre, sopa, ahorcado } = estado.datos
  return (
    <main className="pantalla personal">
      <Confeti cantidad={18} />
      <div className="etiqueta muted" style={{ position: 'relative', fontSize: 13, letterSpacing: '0.18em', textAlign: 'center' }}>
        JOALCA GAMES
      </div>
      <div className="personal-saludo">
        <div className="avatar">{nombre.charAt(0).toUpperCase()}</div>
        <h1 className="titulo">¡Hola, {nombre}!</h1>
        <div className="sorteo juego-sopa" style={{ fontSize: 17, padding: '12px 16px' }}>
          <IconoRegalo tamano={24} />
          <span>Ya estás participando en el sorteo</span>
        </div>
      </div>
      <div className="en-vivo">Tu posición en vivo</div>
      <TarjetaPosicion clase="juego-sopa" marca={SOPA.marca} juego="Sopa de letras" posicion={sopa} />
      <TarjetaPosicion clase="juego-ahorcado" marca={AHORCADO.marca} juego={AHORCADO.nombre} posicion={ahorcado} />
      <p className="muted" style={{ position: 'relative', marginTop: 'auto', fontSize: 14, lineHeight: 1.45, textAlign: 'center' }}>
        Esta página se actualiza sola. Guárdala para revisar tu puesto durante el evento.
      </p>
    </main>
  )
}

export default Jugador
