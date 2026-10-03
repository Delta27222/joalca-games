import { formatearTiempo } from '../lib/texto.ts'

const ALERTA_MS = 10_000

/** `bonus` resalta el cronómetro en verde mientras se anuncia tiempo extra. */
function Cronometro({ restanteMs, bonus = false }: { restanteMs: number; bonus?: boolean }) {
  const alerta = restanteMs <= ALERTA_MS
  const clase = bonus ? ' bonus-tiempo' : alerta ? ' alerta-tiempo' : ''
  return (
    <div className={`cronometro${clase}`} role="timer">
      <div className="cronometro-etiqueta">TIEMPO</div>
      <div className="cronometro-valor">{formatearTiempo(restanteMs)}</div>
    </div>
  )
}

export default Cronometro
