import { formatearTiempo } from '../lib/texto.ts'

const ALERTA_MS = 10_000

function Cronometro({ restanteMs }: { restanteMs: number }) {
  const alerta = restanteMs <= ALERTA_MS
  return (
    <div className={`cronometro${alerta ? ' alerta-tiempo' : ''}`} role="timer">
      <div className="cronometro-etiqueta">TIEMPO</div>
      <div className="cronometro-valor">{formatearTiempo(restanteMs)}</div>
    </div>
  )
}

export default Cronometro
