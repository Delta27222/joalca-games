import { useEffect, useState } from 'react'
import Cronometro from '../components/Cronometro.tsx'
import Encabezado from '../components/Encabezado.tsx'
import type { PropsJuego } from '../components/FlujoDeJuego.tsx'
import Perrito from '../components/Perrito.tsx'
import { AHORCADO } from '../config/juegos.ts'
import { elegirLetrasDePista, estaCompleta, FILAS_DEL_TECLADO, letrasDe } from '../lib/ahorcado.ts'
import { normalizar } from '../lib/texto.ts'
import { useRestante } from '../lib/useRestante.ts'

export type DetalleAhorcado = {
  frase: string
  motivo: 'completa' | 'tiempo' | 'errores'
}

function elegirFrase() {
  const frase = AHORCADO.frases[Math.floor(Math.random() * AHORCADO.frases.length)]
  const pistas = elegirLetrasDePista(frase.texto, AHORCADO.letrasDePista, AHORCADO.casillasDePista)
  return { ...frase, pistas }
}

function Ahorcado({ inicio, onTerminar }: PropsJuego<DetalleAhorcado>) {
  // Frase y letras de pista nuevas en cada partida.
  const [{ texto, pista, pistas }] = useState(elegirFrase)
  const [usadas, setUsadas] = useState<string[]>([])
  const [terminado, setTerminado] = useState<DetalleAhorcado['motivo'] | null>(null)

  const letras = letrasDe(texto)
  const errores = usadas.filter((l) => !letras.includes(l)).length
  const activo = inicio !== null && terminado === null
  const restante = useRestante(inicio ?? 0, AHORCADO.limiteMs, activo, () => terminar('tiempo', errores))

  function terminar(motivo: DetalleAhorcado['motivo'], nErrores: number) {
    setTerminado(motivo)
    onTerminar({
      gana: motivo === 'completa',
      errores: nErrores,
      duracionLocalMs: performance.now() - (inicio ?? 0),
      detalle: { frase: texto, motivo },
    })
  }

  function pulsar(letra: string) {
    if (!activo || usadas.includes(letra) || pistas.includes(letra)) return
    const nuevas = [...usadas, letra]
    setUsadas(nuevas)
    const nErrores = nuevas.filter((l) => !letras.includes(l)).length
    if (estaCompleta(texto, new Set([...pistas, ...nuevas]))) terminar('completa', nErrores)
    else if (nErrores >= AHORCADO.maxErrores) terminar('errores', nErrores)
  }

  // Teclado físico: útil para probar en computadora.
  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      const l = normalizar(e.key)
      if (l.length === 1 && FILAS_DEL_TECLADO.some((f) => f.includes(l))) pulsar(l)
    }
    window.addEventListener('keydown', alTeclear)
    return () => window.removeEventListener('keydown', alTeclear)
  })

  return (
    <>
      <Encabezado juego="ahorcado" enJuego pista={pista} />
      <main className="juego">
        <div className="perrito-panel">
          <Perrito errores={errores} />
          <div className="errores">
            <div className="errores-etiqueta">
              ERRORES {errores}/{AHORCADO.maxErrores}
            </div>
            <div className="huesos">
              {Array.from({ length: AHORCADO.maxErrores }, (_, i) => (
                <div key={i} className={`hueso${i < errores ? ' perdido' : ''}`}>
                  <Hueso color={i < errores ? '#B9AFA6' : '#F2784B'} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lateral" style={{ gap: 22 }}>
          <Cronometro restanteMs={restante} />
          <div className="frase" aria-label="Frase por descubrir">
            {texto.split(' ').map((palabra, p) => (
              <div key={p} className="frase-palabra">
                {[...palabra].map((caracter, i) => {
                  const base = normalizar(caracter)
                  const esPista = pistas.includes(base)
                  const acertada = usadas.includes(base)
                  const revelada = terminado !== null && terminado !== 'completa' && !esPista && !acertada
                  const clase = esPista ? ' pista' : acertada ? ' acierto' : revelada ? ' revelada' : ''
                  return (
                    <div key={i} className={`casilla${clase}`}>
                      {esPista || acertada || revelada ? caracter : ''}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          <div className="teclado">
            {FILAS_DEL_TECLADO.map((fila) => (
              <div key={fila} className="teclado-fila">
                {[...fila].map((letra) => {
                  const esPista = pistas.includes(letra)
                  const usada = usadas.includes(letra)
                  const clase = esPista ? ' pista' : usada ? (letras.includes(letra) ? ' acierto' : ' error') : ''
                  return (
                    <button
                      key={letra}
                      type="button"
                      className={`tecla${clase}`}
                      aria-label={`Letra ${letra}`}
                      disabled={!activo || esPista || usada}
                      onClick={() => pulsar(letra)}
                    >
                      {letra}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}

function Hueso({ color }: { color: string }) {
  return (
    <svg width="36" height="20" viewBox="0 0 36 20" aria-hidden="true">
      <path
        d="M9 4.5a4 4 0 1 0-3.5 6 4 4 0 1 0 3.5 6c1.5-1.5 2.5-2 4-2h10c1.5 0 2.5.5 4 2a4 4 0 1 0 3.5-6 4 4 0 1 0-3.5-6c-1.5 1.5-2.5 2-4 2H13c-1.5 0-2.5-.5-4-2Z"
        fill={color}
      />
    </svg>
  )
}

export default Ahorcado
