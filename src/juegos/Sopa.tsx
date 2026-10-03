import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import Cronometro from '../components/Cronometro.tsx'
import Encabezado from '../components/Encabezado.tsx'
import type { PropsJuego } from '../components/FlujoDeJuego.tsx'
import { SOPA } from '../config/juegos.ts'
import {
  buscarPalabra,
  elegirPista,
  ErrorDeConfiguracion,
  generarTablero,
  lineaEntre,
  type Celda,
  type Tablero,
} from '../lib/sopa.ts'
import { useRestante } from '../lib/useRestante.ts'

export type DetalleSopa = { encontradas: number; faltantes: string[] }

// Un color por palabra encontrada (Sopa.dc.html).
const COLORES_PALABRA = [
  '#F7E3A8', '#D3E6F5', '#FFD9C7', '#CDEBD8', '#E6D8F2',
  '#FADADD', '#D8EFEA', '#F2E0CC', '#FFE7B3', '#F5D0E3',
]

const clave = (c: Celda) => `${c.fila},${c.col}`

function crearTablero(): Tablero | string {
  try {
    return generarTablero(SOPA.palabras, SOPA.tamano)
  } catch (error) {
    if (error instanceof ErrorDeConfiguracion) return error.message
    throw error
  }
}

function Sopa({ inicio, onTerminar }: PropsJuego<DetalleSopa>) {
  // Un tablero nuevo en cada partida (el componente se monta de nuevo).
  const [tablero] = useState(crearTablero)
  if (typeof tablero === 'string') {
    return (
      <>
        <Encabezado juego="sopa" enJuego />
        <div className="centrado">
          <h1 className="titulo" style={{ fontSize: 36 }}>Revisa la configuración de la sopa</h1>
          <p className="muted" style={{ fontSize: 20 }}>{tablero}</p>
        </div>
      </>
    )
  }
  return <TableroSopa tablero={tablero} inicio={inicio} onTerminar={onTerminar} />
}

function TableroSopa({ tablero, inicio, onTerminar }: PropsJuego<DetalleSopa> & { tablero: Tablero }) {
  const [encontradas, setEncontradas] = useState<number[]>([])
  const [seleccion, setSeleccion] = useState<Celda[]>([])
  const [ancla, setAncla] = useState<Celda | null>(null)
  const [rechazo, setRechazo] = useState<Celda[]>([])
  const [recien, setRecien] = useState<number | null>(null)
  const [terminado, setTerminado] = useState<'gana' | 'pierde' | null>(null)
  const [pista, setPista] = useState<Celda | null>(null)
  const [bonus, setBonus] = useState(false)
  const [avisoBonus, setAvisoBonus] = useState(false)
  const arrastre = useRef<{ desde: Celda; hasta: Celda; pointerId: number } | null>(null)

  const activo = inicio !== null && terminado === null
  const limite = SOPA.limiteMs + (bonus ? SOPA.bonus.ms : 0)
  const restante = useRestante(inicio ?? 0, limite, activo, () => terminar(false, encontradas))
  const total = tablero.ubicaciones.length

  // Si pasan 15 s sin encontrar una palabra, se ilumina una letra de ayuda.
  // Cada palabra encontrada (o cada pista nueva) reinicia la espera.
  useEffect(() => {
    if (!activo) return
    const id = setTimeout(() => setPista(elegirPista(tablero.ubicaciones, encontradas)), SOPA.pistaTrasMs)
    return () => clearTimeout(id)
  }, [activo, encontradas, pista, tablero])

  function terminar(gana: boolean, lista: number[]) {
    setTerminado(gana ? 'gana' : 'pierde')
    setSeleccion([])
    setAncla(null)
    onTerminar({
      gana,
      errores: 0,
      duracionLocalMs: performance.now() - (inicio ?? 0),
      detalle: {
        encontradas: lista.length,
        faltantes: tablero.ubicaciones.filter((u) => !lista.includes(u.indice)).map((u) => SOPA.palabras[u.indice]),
      },
    })
  }

  function evaluar(linea: Celda[]) {
    const ubicacion = buscarPalabra(linea, tablero.ubicaciones)
    if (ubicacion && !encontradas.includes(ubicacion.indice)) {
      const nuevas = [...encontradas, ubicacion.indice]
      setEncontradas(nuevas)
      setRecien(ubicacion.indice)
      setPista(null)
      if (nuevas.length === total) {
        terminar(true, nuevas)
      } else if (nuevas.length === SOPA.bonus.palabras && !bonus) {
        setBonus(true)
        setAvisoBonus(true)
        setTimeout(() => setAvisoBonus(false), 4000)
      }
    } else if (linea.length > 1) {
      setRechazo(linea)
      setTimeout(() => setRechazo([]), 320)
    }
  }

  function celdaEn(evento: PointerEvent): Celda | null {
    const el = document.elementFromPoint(evento.clientX, evento.clientY)?.closest<HTMLElement>('[data-fila]')
    if (!el) return null
    return { fila: Number(el.dataset.fila), col: Number(el.dataset.col) }
  }

  function alPresionar(evento: PointerEvent<HTMLDivElement>) {
    if (!activo || arrastre.current) return
    const celda = celdaEn(evento)
    if (!celda) return

    // Segundo toque del modo "tocar la primera y luego la última".
    if (ancla) {
      setAncla(null)
      setSeleccion([])
      if (clave(ancla) !== clave(celda)) evaluar(lineaEntre(ancla, celda, tablero.tamano))
      return
    }
    evento.currentTarget.setPointerCapture(evento.pointerId)
    arrastre.current = { desde: celda, hasta: celda, pointerId: evento.pointerId }
    setSeleccion([celda])
  }

  function alMover(evento: PointerEvent<HTMLDivElement>) {
    const a = arrastre.current
    if (!a || a.pointerId !== evento.pointerId) return
    const celda = celdaEn(evento)
    if (!celda) return
    a.hasta = celda
    setSeleccion(lineaEntre(a.desde, celda, tablero.tamano))
  }

  function alSoltar(evento: PointerEvent<HTMLDivElement>) {
    const a = arrastre.current
    if (!a || a.pointerId !== evento.pointerId) return
    arrastre.current = null
    if (!activo) return
    const linea = lineaEntre(a.desde, a.hasta, tablero.tamano)
    if (linea.length <= 1) {
      // Fue un toque: queda marcada como primera letra.
      setAncla(a.desde)
      setSeleccion([a.desde])
    } else {
      setSeleccion([])
      evaluar(linea)
    }
  }

  // Qué palabra (encontrada) pinta cada celda, y cuáles faltaron al perder.
  const colorDe = new Map<string, string>()
  const faltante = new Set<string>()
  for (const u of tablero.ubicaciones) {
    const encontrada = encontradas.includes(u.indice)
    for (const c of u.celdas) {
      if (encontrada) colorDe.set(clave(c), COLORES_PALABRA[u.indice % COLORES_PALABRA.length])
      else if (terminado === 'pierde') faltante.add(clave(c))
    }
  }
  const seleccionadas = new Set(seleccion.map(clave))
  const rechazadas = new Set(rechazo.map(clave))
  const clavePista = pista && activo ? clave(pista) : null
  const recienCeldas = new Set(
    recien === null ? [] : tablero.ubicaciones.find((u) => u.indice === recien)?.celdas.map(clave),
  )

  return (
    <>
      <Encabezado juego="sopa" enJuego />
      <main className="juego">
        <div
          className="tablero"
          style={{ '--tamano': tablero.tamano } as CSSProperties}
          onPointerDown={alPresionar}
          onPointerMove={alMover}
          onPointerUp={alSoltar}
          onPointerCancel={alSoltar}
          aria-label="Sopa de letras"
        >
          {tablero.letras.map((fila, f) =>
            fila.map((letra, c) => {
              const k = `${f},${c}`
              const clases = ['celda']
              let fondo: string | undefined
              if (seleccionadas.has(k) && activo) clases.push('seleccionada')
              else if (rechazadas.has(k)) clases.push('rechazo')
              else if (colorDe.has(k)) {
                clases.push('encontrada')
                fondo = colorDe.get(k)
                if (recienCeldas.has(k)) clases.push('recien')
              } else if (faltante.has(k)) clases.push('faltante')
              else if (k === clavePista) clases.push('pista')
              return (
                <div key={k} className={clases.join(' ')} style={fondo ? { background: fondo } : undefined} data-fila={f} data-col={c}>
                  {inicio === null ? '' : letra}
                </div>
              )
            }),
          )}
        </div>

        <aside className="lateral">
          <Cronometro restanteMs={restante} bonus={avisoBonus} />
          {avisoBonus && (
            <div className="aviso-bonus" role="status">
              ¡+{SOPA.bonus.ms / 1000} segundos! Encontraste {SOPA.bonus.palabras} beneficios
            </div>
          )}
          {clavePista && !avisoBonus && (
            <div className="aviso-pista" role="status">
              ¡Una ayuda! Un beneficio pasa por la letra que brilla
            </div>
          )}
          {terminado === 'pierde' && (
            <div className="aviso-perdido">¡Tiempo terminado! Las palabras en rojo eran las que faltaban.</div>
          )}
          <div className="panel progreso">
            <div className="progreso-fila">
              <span>Beneficios encontrados</span>
              <span className="progreso-numero">
                {encontradas.length}/{total}
              </span>
            </div>
            <div className="barra">
              <div style={{ width: `${(encontradas.length / total) * 100}%` }} />
            </div>
          </div>
          <ul className="panel lista-palabras">
            {SOPA.palabras.map((palabra, i) => {
              const hecha = encontradas.includes(i)
              const perdida = terminado === 'pierde' && !hecha
              return (
                <li key={palabra} style={{ color: hecha ? 'var(--text-muted)' : perdida ? 'var(--danger-text)' : undefined }}>
                  <span
                    className="punto"
                    style={{ background: hecha ? COLORES_PALABRA[i % COLORES_PALABRA.length] : perdida ? 'var(--danger-bg)' : '#fff' }}
                  />
                  <span style={{ textDecoration: hecha ? 'line-through' : undefined }}>{palabra}</span>
                </li>
              )
            })}
          </ul>
        </aside>
      </main>
    </>
  )
}

export default Sopa
