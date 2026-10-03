import { useEffect, useRef, useState } from 'react'

/**
 * Milisegundos que quedan desde `inicio` (performance.now) hasta `limiteMs`.
 * Deja de actualizarse cuando `activo` es false y llama a `onAgotado` una vez
 * al llegar a cero.
 */
export function useRestante(
  inicio: number,
  limiteMs: number,
  activo: boolean,
  onAgotado: () => void,
): number {
  const [restante, setRestante] = useState(() => Math.max(0, limiteMs - (performance.now() - inicio)))
  const alAgotar = useRef(onAgotado)

  useEffect(() => {
    alAgotar.current = onAgotado
  })

  useEffect(() => {
    if (!activo) return
    const id = setInterval(() => {
      const r = Math.max(0, limiteMs - (performance.now() - inicio))
      setRestante(r)
      if (r === 0) {
        clearInterval(id)
        alAgotar.current()
      }
    }, 200)
    return () => clearInterval(id)
  }, [inicio, limiteMs, activo])

  return activo ? restante : Math.min(restante, limiteMs)
}
