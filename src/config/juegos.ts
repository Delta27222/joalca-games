// Configuración de los juegos. Se toma en cada deploy: para cambiar palabras,
// tiempos o textos basta con editar este archivo. Lo usan el front y la API,
// así que no debe importar nada del navegador.

export type JuegoId = 'sopa' | 'ahorcado'

export const JUEGOS: readonly JuegoId[] = ['sopa', 'ahorcado']

/** Duración del 3, 2, 1. El servidor fija el inicio de la partida al terminarla. */
export const CUENTA_REGRESIVA_MS = 3000

/** Códigos de operadora de Venezuela; el primero es el seleccionado por defecto. */
export const CODIGOS_TELEFONO = ['0424', '0414', '0416', '0412', '0422']

/** Dígitos que van después del código de operadora. */
export const DIGITOS_TELEFONO = 7

export const TEXTO_CONSENTIMIENTO =
  'Acepto participar en el sorteo y que me contacten si gano.'

export const SOPA = {
  marca: 'TASTE OF THE WILD',
  nombre: 'Encuentra los beneficios',
  titulo: 'Encuentra los beneficios de Taste Of The Wild',
  limiteMs: 120_000,
  tamano: 13,
  // Se muestran tal cual en la lista; en el tablero van sin tildes.
  palabras: [
    'PROTEÍNAS',
    'PROBIÓTICOS',
    'ANTIOXIDANTES',
    'OMEGA',
    'DIGESTIÓN',
    'ENERGÍA',
    'FIBRA',
    'NUTRICIÓN',
    'PELAJE',
    'VITALIDAD',
  ],
  regla:
    'Encuentra los 10 beneficios escondidos en el tablero. Arrastra el dedo de la primera a la última letra, o toca la primera y luego la última.',
}

export const AHORCADO = {
  marca: 'DIAMOND CARE',
  formula: 'Sensitive Skin',
  nombre: 'Descubre la palabra',
  limiteMs: 60_000,
  maxErrores: 5,
  letrasDePista: 3,
  // Cuántas casillas pueden revelar, en total, las letras de pista.
  casillasDePista: { min: 5, max: 8 },
  // A cada jugador le toca una al azar.
  frases: [
    {
      texto: 'HIDROLIZADO DE SALMÓN',
      pista: 'Una única fuente de proteína de bajo peso molecular',
    },
  ],
  regla:
    'Descubre la frase tocando letras en el teclado. Tienes 5 intentos: cada error le quita una parte al perrito.',
}

export function limiteMs(juego: JuegoId): number {
  return juego === 'sopa' ? SOPA.limiteMs : AHORCADO.limiteMs
}
