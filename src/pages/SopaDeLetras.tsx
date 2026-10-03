import FlujoDeJuego from '../components/FlujoDeJuego.tsx'
import Sopa, { type DetalleSopa } from '../juegos/Sopa.tsx'

function SopaDeLetras() {
  return (
    <FlujoDeJuego<DetalleSopa>
      juego="sopa"
      renderJuego={(props) => <Sopa {...props} />}
      renderResultado={(final, gana) => ({
        titulo: gana ? '¡LO LOGRASTE!' : '¡Tiempo terminado!',
        contenido: gana ? (
          <p className="resultado-detalle">
            Encontraste {final.detalle.encontradas}/{final.detalle.encontradas + final.detalle.faltantes.length} beneficios
          </p>
        ) : (
          <>
            <p className="resultado-detalle">Te faltaron:</p>
            <div className="faltantes">
              {final.detalle.faltantes.map((p) => (
                <span key={p}>{p}</span>
              ))}
            </div>
          </>
        ),
      })}
    />
  )
}

export default SopaDeLetras
