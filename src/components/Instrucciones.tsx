import { AHORCADO, limiteMs, SOPA, type JuegoId } from '../config/juegos.ts'
import { formatearTiempo } from '../lib/texto.ts'
import CarruselProductos from './CarruselProductos.tsx'

/** Imágenes de una carpeta de assets, ordenadas por su número (1, 2, …, 10). */
function imagenesEnOrden(modulos: Record<string, string>): string[] {
  const numero = (ruta: string) => Number(ruta.match(/(\d+)\.\w+$/)?.[1])
  return Object.keys(modulos)
    .sort((a, b) => numero(a) - numero(b))
    .map((ruta) => modulos[ruta])
}

const PRODUCTOS = {
  sopa: imagenesEnOrden(import.meta.glob('../assets/taste/*.png', { eager: true, import: 'default' })),
  ahorcado: imagenesEnOrden(import.meta.glob('../assets/diamond/[0-9]*.webp', { eager: true, import: 'default' })),
}

type Props = {
  juego: JuegoId
  error: string | null
  onComenzar: () => void
  /** Vuelve al registro con los datos ya escritos. */
  onVolver: () => void
}

function Instrucciones({ juego, error, onComenzar, onVolver }: Props) {
  return (
    <main className="instrucciones">
      <div className="instrucciones-columna">
        <button type="button" className="btn-pildora" onClick={onVolver}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 6l-6 6 6 6" />
          </svg>
          <span>Volver</span>
        </button>
        <div className="instrucciones-tarjeta">
          <div className="instrucciones-arte">
            <CarruselProductos imagenes={PRODUCTOS[juego]} className="carrusel-instrucciones" />
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
