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
        <div className="logo-hueco">LOGO</div>
        <div className="encabezado-textos">
          <div className="etiqueta">{SOPA.marca}</div>
          <h1>{enJuego ? SOPA.titulo : SOPA.nombre}</h1>
        </div>
      </header>
    )
  }

  return (
    <header className="encabezado">
      <div className="logo-hueco">LOGO</div>
      <div className="encabezado-textos">
        <div className="encabezado-marca">
          <div className="etiqueta">{AHORCADO.marca}</div>
          <div className="encabezado-formula">{AHORCADO.formula}</div>
        </div>
        <h1>{AHORCADO.nombre}</h1>
        {enJuego && pista && <div className="encabezado-pista">Pista: {pista}</div>}
      </div>
    </header>
  )
}

export default Encabezado
