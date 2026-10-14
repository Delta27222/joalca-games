import logoDiamondCare from '../assets/diamond/diamond_care_logo.svg'
import logoTaste from '../assets/taste/taste_logo.svg'
import { AHORCADO, SOPA, type JuegoId } from '../config/juegos.ts'

type Props = {
  juego: JuegoId
  /** En el juego se muestra el título completo (y la pista en el ahorcado). */
  enJuego?: boolean
  pista?: string
}

function Encabezado({ juego, enJuego = false, pista }: Props) {
  if (juego === 'sopa') {
    return (
      <header className="encabezado">
        <img src={logoTaste} alt={SOPA.marca} className="logo-encabezado" />
        <div className="encabezado-textos">
          <div className="etiqueta">{SOPA.marca}</div>
          <h1>{enJuego ? SOPA.titulo : SOPA.nombre}</h1>
        </div>
      </header>
    )
  }

  return (
    <header className="encabezado">
      <img src={logoDiamondCare} alt={AHORCADO.marca} className="logo-encabezado logo-diamond" />
      <div className="encabezado-textos">
        <h1>{AHORCADO.nombre}</h1>
        {enJuego && pista && <div className="encabezado-pista">Pista: {pista}</div>}
      </div>
    </header>
  )
}

export default Encabezado
