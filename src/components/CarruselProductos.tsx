import React from 'react'
const MS_POR_IMAGEN = 1500

type Props = {
  imagenes: string[]
  className?: string
}

/** Rota las imágenes de los productos cada pocos segundos. Todas quedan montadas para que no parpadeen al cambiar. */
function CarruselProductos({ imagenes, className }: Props) {
  const [actual, setActual] = React.useState(0)

  React.useEffect(() => {
    const id = setInterval(() => setActual((i) => (i + 1) % imagenes.length), MS_POR_IMAGEN)
    return () => clearInterval(id)
  }, [imagenes.length])

  return (
    <div className={className ? `carrusel ${className}` : 'carrusel'}>
      {imagenes.map((src, i) => (
        <img key={src} src={src} alt="" className={i === actual ? 'visible' : undefined} />
      ))}
    </div>
  )
}

export default CarruselProductos
