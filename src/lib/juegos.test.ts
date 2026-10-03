import { describe, expect, it } from 'vitest'
import { AHORCADO, SOPA } from '../config/juegos.ts'
import { elegirLetrasDePista, estaCompleta, letrasDe } from './ahorcado.ts'
import { buscarPalabra, ErrorDeConfiguracion, generarTablero, lineaEntre } from './sopa.ts'
import { formatearTiempo, normalizar } from './texto.ts'

// Generador determinista para que las pruebas sean repetibles.
function semilla(s: number) {
  return () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
}

describe('normalizar', () => {
  it('quita tildes y conserva la Ñ', () => {
    expect(normalizar('Salmón proteínas añejo')).toBe('SALMON PROTEINAS AÑEJO')
  })
})

describe('formatearTiempo', () => {
  it('muestra minutos y segundos redondeando hacia arriba', () => {
    expect(formatearTiempo(120_000)).toBe('02:00')
    expect(formatearTiempo(7_200)).toBe('00:08')
    expect(formatearTiempo(-5)).toBe('00:00')
  })
})

describe('generarTablero', () => {
  it('coloca las 10 palabras de la configuración, leídas hacia adelante', () => {
    for (let s = 1; s <= 200; s++) {
      const t = generarTablero(SOPA.palabras, SOPA.tamano, semilla(s))
      expect(t.ubicaciones).toHaveLength(SOPA.palabras.length)
      for (const u of t.ubicaciones) {
        const leida = u.celdas.map((c) => t.letras[c.fila][c.col]).join('')
        expect(leida).toBe(normalizar(SOPA.palabras[u.indice]))
        // Nunca al revés: la columna siempre avanza o la palabra es vertical.
        expect(u.fin.col >= u.inicio.col).toBe(true)
        if (u.fin.col === u.inicio.col) expect(u.fin.fila > u.inicio.fila).toBe(true)
      }
    }
  })

  it('cambia de una partida a otra', () => {
    const a = generarTablero(SOPA.palabras, SOPA.tamano, semilla(1))
    const b = generarTablero(SOPA.palabras, SOPA.tamano, semilla(2))
    expect(a.letras).not.toEqual(b.letras)
  })

  it('avisa si una palabra no cabe', () => {
    expect(() => generarTablero(['ANTIOXIDANTES'], 12)).toThrow(ErrorDeConfiguracion)
  })
})

describe('selección en la sopa', () => {
  const t = generarTablero(SOPA.palabras, SOPA.tamano, semilla(7))
  const u = t.ubicaciones[0]

  it('encuentra la palabra en ambos sentidos', () => {
    expect(buscarPalabra(lineaEntre(u.inicio, u.fin, t.tamano), t.ubicaciones)).toBe(u)
    expect(buscarPalabra(lineaEntre(u.fin, u.inicio, t.tamano), t.ubicaciones)).toBe(u)
  })

  it('ajusta una línea torcida a la dirección más cercana', () => {
    expect(lineaEntre({ fila: 0, col: 0 }, { fila: 1, col: 4 }, 13)).toEqual([
      { fila: 0, col: 0 },
      { fila: 0, col: 1 },
      { fila: 0, col: 2 },
      { fila: 0, col: 3 },
      { fila: 0, col: 4 },
    ])
  })
})

describe('letras de pista', () => {
  const frase = AHORCADO.frases[0].texto

  it('elige 3 letras distintas que revelan entre 5 y 8 casillas', () => {
    for (let s = 1; s <= 100; s++) {
      const letras = elegirLetrasDePista(frase, 3, AHORCADO.casillasDePista, semilla(s))
      expect(new Set(letras).size).toBe(3)
      const reveladas = [...normalizar(frase)].filter((l) => letras.includes(l)).length
      expect(reveladas).toBeGreaterThanOrEqual(5)
      expect(reveladas).toBeLessThanOrEqual(8)
    }
  })

  it('la frase está completa cuando todas sus letras están reveladas', () => {
    expect(estaCompleta(frase, new Set(letrasDe(frase)))).toBe(true)
    expect(estaCompleta(frase, new Set(['H', 'D']))).toBe(false)
  })
})
