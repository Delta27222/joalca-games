import logo from '../assets/joalca_logo.png'

/**
 * El logo viene en blanco; se usa como máscara para pintarlo con el color del
 * texto (currentColor) y que se vea sobre el fondo claro.
 */
function LogoJoalca({ className }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label="Joalca Games"
      className={className ? `logo-joalca ${className}` : 'logo-joalca'}
      style={{ maskImage: `url(${logo})`, WebkitMaskImage: `url(${logo})` }}
    />
  )
}

export default LogoJoalca
