import { Link } from 'react-router'
import fotoDiamondCare from '../assets/diamond/diamond_tarjeta.jpg'
import fotoTaste from '../assets/taste/taste_tarjeta.jpg'
import Burbujas from '../components/Burbujas.tsx'
import CreditoKoda from '../components/CreditoKoda.tsx'
import { IconoReloj } from '../components/Instrucciones.tsx'
import LogoJoalca from '../components/LogoJoalca.tsx'
import { AHORCADO, SOPA } from '../config/juegos.ts'

function Flecha() {
  return (
    <div className="tarjeta-flecha">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 12h14" />
        <path d="M13 6l6 6-6 6" />
      </svg>
    </div>
  )
}

function IconoTrofeo() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4z" />
      <path d="M17 5h3v2a3 3 0 0 1-3 3" />
      <path d="M7 5H4v2a3 3 0 0 0 3 3" />
    </svg>
  )
}

function Home() {
  return (
    <main className="pantalla inicio con-burbujas">
      <Burbujas />

      <div className="inicio-cabecera">
        <LogoJoalca />
        <h1 className="titulo">¡Juega y entra al sorteo!</h1>
        <p className="muted">Elige un juego. Todos los que juegan participan, ganen o pierdan.</p>
      </div>

      <nav className="inicio-tarjetas">
        <Link to="/sopa-de-letras" className="tarjeta-juego juego-sopa" aria-label={`${SOPA.nombre}, Taste of the Wild, 2 minutos`}>
          <div className="tarjeta-arte">
            <img src={fotoTaste} alt="" className="tarjeta-foto" />
          </div>
          <div className="tarjeta-cuerpo">
            <div className="etiqueta">{SOPA.marca}</div>
            <div className="tarjeta-nombre">{SOPA.nombre}</div>
            <div className="tarjeta-pie">
              <div className="chip" style={{ height: 40, fontSize: 17, padding: '0 16px' }}>
                <IconoReloj />
                <span>2 minutos</span>
              </div>
              <Flecha />
            </div>
          </div>
        </Link>

        <Link to="/ahorcado" className="tarjeta-juego juego-ahorcado" aria-label={`${AHORCADO.nombre}, Diamond Care, 1 minuto`}>
          <div className="tarjeta-arte">
            <img src={fotoDiamondCare} alt="" className="tarjeta-foto" />
          </div>
          <div className="tarjeta-cuerpo">
            <div className="etiqueta">{AHORCADO.marca}</div>
            <div className="tarjeta-nombre">{AHORCADO.nombre}</div>
            <div className="tarjeta-pie">
              <div className="chip" style={{ height: 40, fontSize: 17, padding: '0 16px' }}>
                <IconoReloj />
                <span>1:30 minutos</span>
              </div>
              <Flecha />
            </div>
          </div>
        </Link>
      </nav>

      <Link to="/leaderboard" className="btn btn-secundario inicio-ranking">
        <IconoTrofeo />
        Ver ranking
      </Link>

      <CreditoKoda />
    </main>
  )
}

export default Home
