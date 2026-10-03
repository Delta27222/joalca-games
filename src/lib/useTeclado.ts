import { useEffect, useState } from 'react'

// Menos que esto es la barra de Safari moviéndose, no un teclado.
const MINIMO_PX = 120

/** Lleva el campo enfocado al centro de la parte visible de la pantalla. */
export function llevarALaVista() {
  const el = document.activeElement
  if (el instanceof HTMLElement && el.matches('input, select, textarea')) {
    el.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }
}

/**
 * Alto en px del teclado en pantalla (0 si está cerrado). En el iPad, Safari
 * pone el teclado encima de la página sin encogerla; lo único que cambia es
 * el visualViewport, así que se mide la diferencia con la ventana.
 */
export function useAltoTeclado(): number {
  const [alto, setAlto] = useState(0)

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const medir = () => {
      const diferencia = window.innerHeight - vv.height
      const abierto = diferencia > MINIMO_PX
      setAlto(abierto ? Math.round(diferencia) : 0)
      // Al abrirse (o cambiar de tamaño) el teclado, el campo activo no debe quedar debajo.
      if (abierto) setTimeout(llevarALaVista, 50)
    }
    vv.addEventListener('resize', medir)
    return () => vv.removeEventListener('resize', medir)
  }, [])

  return alto
}
