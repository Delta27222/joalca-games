import { useEffect, useRef, useState } from 'react'
import { CUENTA_REGRESIVA_MS } from '../config/juegos.ts'

/** 3, 2, 1 sobre el juego. Llama a `onFin` una sola vez al terminar. */
function CuentaRegresiva({ onFin }: { onFin: () => void }) {
  const total = Math.round(CUENTA_REGRESIVA_MS / 1000)
  const [n, setN] = useState(total)
  const avisado = useRef(false)

  useEffect(() => {
    if (n === 0) {
      if (!avisado.current) {
        avisado.current = true
        onFin()
      }
      return
    }
    const id = setTimeout(() => setN(n - 1), 1000)
    return () => clearTimeout(id)
  }, [n, onFin])

  if (n === 0) return null
  return (
    <div className="cuenta">
      {/* La key reinicia la animación en cada número. */}
      <div key={n} className="cuenta-numero" aria-live="assertive">
        {n}
      </div>
      <div className="cuenta-texto">¡Prepárate!</div>
    </div>
  )
}

export default CuentaRegresiva
