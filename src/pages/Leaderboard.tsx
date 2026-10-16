import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import Burbujas from '../components/Burbujas.tsx'
import LogoJoalca from '../components/LogoJoalca.tsx'
import { AHORCADO, SOPA, hoy, type JuegoId } from '../config/juegos.ts'
import { enlaceExcelRanking, obtenerRanking, type FilaRanking } from '../lib/api.ts'
import { formatearDuracion } from '../lib/texto.ts'

const PESTANAS: { juego: JuegoId; nombre: string }[] = [
  { juego: 'sopa', nombre: 'Sopa de letras' },
  { juego: 'ahorcado', nombre: AHORCADO.nombre },
]

const MEDALLAS = ['#F7C548', '#D9D4CE', '#E2A574']

/** Solo los primeros puestos que ganaron reciben premio; al resto se le escribe por el sorteo. */
const PUESTOS_CON_PREMIO = 5

/**
 * Chat de WhatsApp con el jugador y el mensaje ya escrito. "04241234567" → "584241234567".
 * Usa api.whatsapp.com y no wa.me: la redirección de wa.me rompe los emojis (salen como �).
 */
function enlaceWhatsapp(fila: FilaRanking & { telefono: string }, juego: JuegoId) {
  const nombre = fila.nombre.split(' ')[0]
  const nombreJuego = juego === 'sopa' ? SOPA.nombre : AHORCADO.nombre
  const mensaje =
    fila.gana && fila.posicion <= PUESTOS_CON_PREMIO
      ? `¡Hola ${nombre}! 🎉🏆 Eres el ganador #${fila.posicion} de los Joalca Games en "${nombreJuego}" 🐶✨\n\n` +
        '📍 Acércate a nuestro stand para recibir tus premios 🎁🙌'
      : `¡Hola ${nombre}! 👋🐾 Gracias por jugar "${nombreJuego}" en los Joalca Games 🎮\n\n` +
        `Quedaste en el puesto #${fila.posicion} 🍀\n\n` +
        '📍 Acércate a nuestro stand para recibir tus premios 🎁🙌'
  return `https://api.whatsapp.com/send?phone=58${fila.telefono.replace(/^0/, '')}&text=${encodeURIComponent(mensaje)}`
}

function IconoWhatsapp() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.05 21.5h-.01a9.5 9.5 0 0 1-4.84-1.33l-.35-.21-3.6.94.96-3.5-.23-.36A9.45 9.45 0 0 1 2.5 12C2.5 6.76 6.77 2.5 12.05 2.5c2.54 0 4.93.99 6.72 2.79a9.43 9.43 0 0 1 2.78 6.72c0 5.24-4.27 9.49-9.5 9.49zm8.08-17.57A11.35 11.35 0 0 0 12.05.6C5.75.6.63 5.71.63 12c0 2.01.53 3.97 1.53 5.7L.53 23.4l5.84-1.53a11.43 11.43 0 0 0 5.68 1.45h.01c6.29 0 11.41-5.12 11.42-11.4a11.33 11.33 0 0 0-3.35-8.06z" />
    </svg>
  )
}
const REFRESCO_MS = 15_000

type Estado =
  | { tipo: 'cargando' }
  | { tipo: 'listo'; filas: FilaRanking[]; total: number; porPagina: number; consulta: string }
  | { tipo: 'error'; consulta: string }

const CLAVE_GUARDADA = 'joalca-clave-staff'

/**
 * La clave de staff llega una vez por la URL (?staff=<clave>) y queda guardada
 * en el dispositivo: así el botón de WhatsApp sale aunque se entre al ranking
 * desde "Ver ranking" o desde el inicio. ?staff= vacío la borra.
 */
function claveStaff(deUrl: string | null): string | null {
  try {
    if (deUrl) localStorage.setItem(CLAVE_GUARDADA, deUrl)
    else if (deUrl === '') localStorage.removeItem(CLAVE_GUARDADA)
    return localStorage.getItem(CLAVE_GUARDADA)
  } catch {
    return deUrl || null
  }
}

function Leaderboard() {
  const [params, setParams] = useSearchParams()
  const juego: JuegoId = params.get('juego') === 'ahorcado' ? 'ahorcado' : 'sopa'
  const jugadorId = params.get('jugador')
  // Sin ?fecha= se muestra el día de hoy; ?fecha=todas quita el filtro.
  const fecha = params.get('fecha') === 'todas' ? null : (params.get('fecha') ?? hoy())
  const pagina = Math.max(1, Number(params.get('pagina')) || 1)
  const staff = claveStaff(params.get('staff'))
  const [guardado, setEstado] = useState<Estado>({ tipo: 'cargando' })
  // Al cambiar de pestaña, fecha o página, lo guardado es de otra consulta: se muestra cargando.
  const consulta = `${juego}:${fecha}:${pagina}:${jugadorId}:${staff}`
  const estado: Estado = 'consulta' in guardado && guardado.consulta !== consulta ? { tipo: 'cargando' } : guardado

  useEffect(() => {
    let vigente = true
    const consulta = `${juego}:${fecha}:${pagina}:${jugadorId}:${staff}`
    const cargar = () =>
      obtenerRanking({ juego, fecha, pagina }, jugadorId, staff)
        .then(({ filas, total, porPagina }) => vigente && setEstado({ tipo: 'listo', filas, total, porPagina, consulta }))
        .catch(
          () =>
            vigente &&
            setEstado((e) => (e.tipo === 'listo' && e.consulta === consulta ? e : { tipo: 'error', consulta })),
        )
    void cargar()
    // Se refresca solo, por si queda proyectado en una pantalla del evento.
    const id = setInterval(cargar, REFRESCO_MS)
    return () => {
      vigente = false
      clearInterval(id)
    }
  }, [juego, fecha, pagina, jugadorId, staff])

  /** Cambia parámetros de la URL; si no es un cambio de página, vuelve a la primera. */
  function cambiar(cambios: Record<string, string | null>) {
    const siguiente = new URLSearchParams(params)
    if (!('pagina' in cambios)) siguiente.delete('pagina')
    for (const [clave, valor] of Object.entries(cambios)) {
      if (valor === null) siguiente.delete(clave)
      else siguiente.set(clave, valor)
    }
    setParams(siguiente, { replace: true })
  }

  const paginas = estado.tipo === 'listo' ? Math.max(1, Math.ceil(estado.total / estado.porPagina)) : 1
  const esHoy = fecha === hoy()

  return (
    <main className={`pantalla ranking con-burbujas juego-${juego}`}>
      <Burbujas />
      <div className="ranking-cabecera">
        <div>
          <LogoJoalca className="logo-joalca-chico" />
          <h1 className="titulo">Ranking</h1>
        </div>
        <Link to="/" className="btn btn-primario btn-inicio">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 11l9-7 9 7" />
            <path d="M5 10v10h14V10" />
          </svg>
          <span>Inicio</span>
        </Link>
      </div>

      <div role="tablist" className="pestanas">
        {PESTANAS.map((p) => (
          <button
            key={p.juego}
            type="button"
            role="tab"
            aria-selected={p.juego === juego}
            className="pestana"
            onClick={() => cambiar({ juego: p.juego })}
          >
            {p.nombre}
          </button>
        ))}
      </div>

      <div className="ranking-filtros">
        <label className="filtro-fecha">
          <span>Fecha</span>
          <input
            type="date"
            value={fecha ?? ''}
            max={hoy()}
            onChange={(e) => cambiar({ fecha: e.target.value || 'todas' })}
          />
        </label>
        <button type="button" className="chip-filtro" aria-pressed={esHoy} onClick={() => cambiar({ fecha: null })}>
          Hoy
        </button>
        <button type="button" className="chip-filtro" aria-pressed={fecha === null} onClick={() => cambiar({ fecha: 'todas' })}>
          Todas las fechas
        </button>
        {staff && (
          <a className="btn btn-secundario btn-excel" href={enlaceExcelRanking({ juego, fecha, pagina }, staff)} download>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3v12" />
              <path d="M7 10l5 5 5-5" />
              <path d="M5 21h14" />
            </svg>
            <span>Descargar Excel</span>
          </a>
        )}
      </div>

      {estado.tipo === 'cargando' && (
        <div className="ranking-lista" aria-busy="true" style={{ gap: 8 }}>
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="esqueleto" />
          ))}
        </div>
      )}

      {estado.tipo === 'error' && (
        <div className="ranking-vacio">
          <div className="titulo">No pudimos cargar el ranking</div>
          <div className="muted" style={{ fontSize: 20 }}>Revisa la conexión. Lo intentaremos de nuevo en unos segundos.</div>
        </div>
      )}

      {estado.tipo === 'listo' && estado.filas.length === 0 && (
        <div className="ranking-vacio">
          <div className="titulo">{fecha ? (esHoy ? 'Hoy todavía nadie ha jugado' : 'Nadie jugó ese día') : 'Todavía nadie ha jugado'}</div>
          <div className="muted" style={{ fontSize: 20 }}>¡El primero en terminar se queda con el puesto #1!</div>
        </div>
      )}

      {estado.tipo === 'listo' && estado.filas.length > 0 && (
        <ol className="ranking-lista">
          {estado.filas.map((f, i) => {
            // La fila del jugador fuera de la página llega al final y va separada del resto.
            const separada = i > 0 && f.posicion !== estado.filas[i - 1].posicion + 1
            return (
              <li
                key={f.posicion}
                className={`fila-ranking${f.esTu ? ' yo' : ''}${f.gana ? '' : ' no-completo'}${separada ? ' separada' : ''}`}
              >
                <div className="medalla" style={{ background: MEDALLAS[f.posicion - 1] ?? 'transparent' }}>
                  {f.posicion}
                </div>
                <div className="fila-nombre">{f.nombre}</div>
                {f.esTu && <div className="etiqueta-tu">Tú</div>}
                {!f.gana && <div className="etiqueta-no-completo">No completó</div>}
                <div className="fila-tiempo">{formatearDuracion(f.tiempoMs)}</div>
                {f.telefono && (
                  <a
                    href={enlaceWhatsapp({ ...f, telefono: f.telefono }, juego)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-whatsapp"
                    aria-label={`Escribir a ${f.nombre} por WhatsApp`}
                  >
                    <IconoWhatsapp />
                  </a>
                )}
              </li>
            )
          })}
        </ol>
      )}

      {estado.tipo === 'listo' && estado.total > estado.porPagina && (
        <nav className="paginacion" aria-label="Páginas del ranking">
          <button
            type="button"
            className="btn btn-secundario"
            disabled={pagina <= 1}
            onClick={() => cambiar({ pagina: String(pagina - 1) })}
          >
            ← Anterior
          </button>
          <span className="paginacion-texto">
            Página {Math.min(pagina, paginas)} de {paginas} · {estado.total} jugadores
          </span>
          <button
            type="button"
            className="btn btn-secundario"
            disabled={pagina >= paginas}
            onClick={() => cambiar({ pagina: String(pagina + 1) })}
          >
            Siguiente →
          </button>
        </nav>
      )}
    </main>
  )
}

export default Leaderboard
