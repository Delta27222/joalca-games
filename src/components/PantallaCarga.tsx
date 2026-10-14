import { useEffect, useState } from 'react'
import fotoDiamondCare from '../assets/diamond/diamond_tarjeta.jpg'
import fotoTaste from '../assets/taste/taste_tarjeta.jpg'
import Burbujas from './Burbujas.tsx'
import LogoJoalca from './LogoJoalca.tsx'
import Perrito from './Perrito.tsx'

// Lo que se ve primero en el inicio: se precarga para que no aparezca a pedazos.
const IMAGENES = [fotoTaste, fotoDiamondCare]

// Se muestra al menos este tiempo, aunque todo cargue antes, para que no parpadee.
const MS_MINIMO = 1800
// Si algo no responde, se entra igual.
const MS_MAXIMO = 6000
// Lo que dura el fundido de salida (igual que la transición de .carga).
const MS_SALIDA = 400

function cargarImagen(src: string) {
  return new Promise<void>((resolver) => {
    const imagen = new Image()
    imagen.onload = imagen.onerror = () => resolver()
    imagen.src = src
  })
}

type Props = {
  onFin: () => void
}

/** Pantalla de carga al abrir la app: precarga fotos y fuentes y luego se desvanece. */
function PantallaCarga({ onFin }: Props) {
  const [listos, setListos] = useState(0)
  const [saliendo, setSaliendo] = useState(false)
  const total = IMAGENES.length + 1

  useEffect(() => {
    let vigente = true
    const sumar = () => vigente && setListos((n) => n + 1)
    const recursos = Promise.all([
      ...IMAGENES.map((src) => cargarImagen(src).then(sumar)),
      document.fonts.ready.then(sumar),
    ])
    const minimo = new Promise((resolver) => setTimeout(resolver, MS_MINIMO))
    const maximo = new Promise((resolver) => setTimeout(resolver, MS_MAXIMO))

    let idSalida: ReturnType<typeof setTimeout>
    void Promise.race([Promise.all([recursos, minimo]), maximo]).then(() => {
      if (!vigente) return
      setSaliendo(true)
      idSalida = setTimeout(onFin, MS_SALIDA)
    })
    return () => {
      vigente = false
      clearTimeout(idSalida)
    }
  }, [onFin])

  const progreso = saliendo ? 1 : listos / total

  return (
    <div className={`carga${saliendo ? ' saliendo' : ''}`} role="status" aria-live="polite">
      <div className="carga-contenido con-burbujas">
        <Burbujas />
        <Perrito errores={0} className="perrito-carga" />
        <LogoJoalca className="carga-marca" />
        <h1 className="titulo carga-titulo">¡Preparando los juegos!</h1>
        <div className="barra carga-barra">
          <div style={{ width: `${Math.round(progreso * 100)}%` }} />
        </div>
        <p className="muted carga-texto">Cargando… {Math.round(progreso * 100)}%</p>
      </div>
    </div>
  )
}

export default PantallaCarga
