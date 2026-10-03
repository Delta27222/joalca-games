import { useState } from 'react'

const COLORES = ['#F2784B', '#F7C548', '#FFFFFF', '#3BB273', '#F5D0E3', '#1F5C7A']

function Confeti({ cantidad = 36 }: { cantidad?: number }) {
  // Se calcula una vez por montaje: cada celebración cae distinta.
  const [piezas] = useState(() =>
    Array.from({ length: cantidad }, (_, i) => ({
      left: `${Math.random() * 100}%`,
      width: 8 + Math.random() * 8,
      height: 14 + Math.random() * 12,
      background: COLORES[i % COLORES.length],
      animationDuration: `${3 + Math.random() * 3}s`,
      animationDelay: `${-Math.random() * 6}s`,
    })),
  )

  return (
    <div className="confeti" aria-hidden="true">
      {piezas.map((estilo, i) => (
        <span key={i} style={estilo} />
      ))}
    </div>
  )
}

export default Confeti
