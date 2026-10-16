import ExcelJS from 'exceljs'
import { AHORCADO, SOPA, ZONA_HORARIA } from '../src/config/juegos.js'
import { formatearDuracion } from '../src/lib/texto.js'
import { ErrorHttp, esStaff, fecha, juego, manejar } from './_lib/http.js'
import { rankingCompleto } from './_lib/ranking.js'

const COLUMNAS: Partial<ExcelJS.Column>[] = [
  { header: 'Puesto', key: 'posicion', width: 9 },
  { header: 'Nombre', key: 'nombre', width: 30 },
  { header: 'Teléfono', key: 'telefono', width: 15 },
  { header: 'Correo', key: 'email', width: 32 },
  { header: 'Resultado', key: 'resultado', width: 15 },
  { header: 'Tiempo', key: 'tiempo', width: 10 },
  { header: 'Errores', key: 'errores', width: 10 },
  { header: 'Terminó el', key: 'terminoEl', width: 18 },
]

const NARANJA = 'FFF2784B'
const GRIS = 'FF7A6A5E'

/**
 * GET /api/ranking-excel?juego=sopa&fecha=2026-10-16&staff=<clave> → el
 * ranking filtrado completo en .xlsx, con una leyenda arriba. Solo para el
 * staff: trae nombre completo, teléfono y correo.
 */
export const GET = manejar(async (request) => {
  const params = new URL(request.url).searchParams
  if (!esStaff(params.get('staff'))) throw new ErrorHttp(403, 'Solo el staff puede descargar el ranking')
  const id = juego(params.get('juego'))
  const dia = fecha(params.get('fecha'))
  const filas = await rankingCompleto(id, dia)

  const datosJuego = id === 'sopa' ? SOPA : AHORCADO
  const tipoJuego = id === 'sopa' ? 'Sopa de letras' : 'Ahorcado'
  const ganaron = filas.filter((f) => f.gana).length
  const generado = new Intl.DateTimeFormat('es-VE', {
    timeZone: ZONA_HORARIA,
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date())

  const libro = new ExcelJS.Workbook()
  libro.creator = 'Joalca Games'
  const hoja = libro.addWorksheet('Ranking')
  hoja.columns = COLUMNAS
  // `columns` escribe los encabezados en la fila 1; se bajan debajo de la leyenda.
  hoja.spliceRows(1, 1)

  const leyenda: [string, Partial<ExcelJS.Font>?][] = [
    [`Joalca Games · Ranking de ${tipoJuego}`, { bold: true, size: 18, color: { argb: NARANJA } }],
    [`Juego: ${tipoJuego} · ${datosJuego.nombre} (${datosJuego.marca})`, { bold: true }],
    [`Fecha: ${dia ? dia.split('-').reverse().join('/') : 'Todas las fechas'}`, { bold: true }],
    [`Jugadores: ${filas.length} · Completaron: ${ganaron} · No completaron: ${filas.length - ganaron}`],
    [
      `Cómo se lee: cuenta la mejor partida terminada de cada jugador${dia ? ' en ese día' : ''}. ` +
        'Primero van quienes completaron el juego y después quienes no, cada grupo por tiempo (mm:ss); ' +
        'si empatan, gana quien tuvo menos errores y luego quien terminó primero. Las partidas abandonadas no aparecen.',
      { italic: true, color: { argb: GRIS } },
    ],
    [`Generado el ${generado} (hora de Venezuela). Contiene datos personales: uso exclusivo del staff.`, { italic: true, color: { argb: GRIS } }],
  ]
  for (const [texto, fuente] of leyenda) {
    const fila = hoja.addRow([texto])
    hoja.mergeCells(fila.number, 1, fila.number, COLUMNAS.length)
    fila.getCell(1).alignment = { wrapText: true, vertical: 'middle' }
    if (fuente) fila.getCell(1).font = fuente
  }
  hoja.getRow(1).height = 28
  hoja.getRow(5).height = 48
  hoja.addRow([])

  const encabezado = hoja.addRow(COLUMNAS.map((c) => c.header))
  encabezado.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  encabezado.eachCell((celda) => {
    celda.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NARANJA } }
    celda.alignment = { horizontal: 'center' }
  })

  for (const f of filas) {
    const fila = hoja.addRow({
      ...f,
      email: f.email ?? '',
      resultado: f.gana ? 'Completó' : 'No completó',
      tiempo: formatearDuracion(f.tiempoMs),
    })
    if (!f.gana) fila.font = { color: { argb: GRIS } }
    for (const clave of ['posicion', 'resultado', 'tiempo', 'errores', 'terminoEl']) {
      fila.getCell(clave).alignment = { horizontal: 'center' }
    }
  }

  hoja.views = [{ state: 'frozen', ySplit: encabezado.number }]
  hoja.autoFilter = {
    from: { row: encabezado.number, column: 1 },
    to: { row: encabezado.number + filas.length, column: COLUMNAS.length },
  }

  const archivo = `ranking-${id}-${dia ?? 'todas-las-fechas'}.xlsx`
  return new Response(await libro.xlsx.writeBuffer(), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${archivo}"`,
      'Cache-Control': 'no-store',
    },
  })
})
