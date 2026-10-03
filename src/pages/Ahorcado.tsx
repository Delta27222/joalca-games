import FlujoDeJuego from '../components/FlujoDeJuego.tsx'
import Perrito from '../components/Perrito.tsx'
import AhorcadoJuego, { type DetalleAhorcado } from '../juegos/Ahorcado.tsx'

function Ahorcado() {
  return (
    <FlujoDeJuego<DetalleAhorcado>
      juego="ahorcado"
      renderJuego={(props) => <AhorcadoJuego {...props} />}
      renderResultado={(final, gana) => ({
        titulo: gana ? '¡LO LOGRASTE!' : final.detalle.motivo === 'errores' ? '¡Sin intentos!' : '¡TIEMPO!',
        lateral: (
          <div className="resultado-perrito">
            <Perrito errores={gana ? 0 : final.errores} />
          </div>
        ),
        contenido: gana ? (
          <p className="resultado-frase">{final.detalle.frase}</p>
        ) : (
          <>
            <p className="resultado-detalle">La respuesta era:</p>
            <p className="resultado-frase">{final.detalle.frase}</p>
          </>
        ),
      })}
    />
  )
}

export default Ahorcado
