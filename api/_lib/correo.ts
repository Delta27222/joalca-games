import QRCode from 'qrcode'
import { AHORCADO, SOPA, type JuegoId } from '../../src/config/juegos.js'
import { formatearDuracion } from '../../src/lib/texto.js'

export type DatosCorreo = {
  email: string
  nombre: string
  juego: JuegoId
  gana: boolean
  duracionMs: number
  posicion: number | null
  /** URL de la página personal; el QR apunta aquí. */
  urlPersonal: string
}

const escapar = (texto: string) =>
  texto.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)

/**
 * Envía el resultado de la partida con el QR de la página personal, vía Resend.
 * Sin RESEND_API_KEY o CORREO_REMITENTE no hace nada: el juego no depende del correo.
 */
export async function enviarResultado(datos: DatosCorreo): Promise<void> {
  const clave = process.env.RESEND_API_KEY
  const remitente = process.env.CORREO_REMITENTE
  if (!clave || !remitente) return

  const nombre = escapar(datos.nombre.trim().split(/\s+/)[0])
  const marca = datos.juego === 'sopa' ? SOPA.marca : AHORCADO.marca
  const nombreJuego = datos.juego === 'sopa' ? SOPA.nombre : AHORCADO.nombre
  const asunto = datos.gana
    ? `🏆 ¡Completaste "${nombreJuego}" en ${formatearDuracion(datos.duracionMs)}!`
    : `🐾 Gracias por jugar "${nombreJuego}"`
  const titular = datos.gana ? `¡Lo lograste, ${nombre}! 🎉` : `¡Gracias por jugar, ${nombre}! 🐾`
  const detalle = datos.gana
    ? `Completaste <b>${escapar(nombreJuego)}</b> en <b>${formatearDuracion(datos.duracionMs)}</b>.`
    : `Esta vez no completaste <b>${escapar(nombreJuego)}</b>, ¡pero estuviste cerca!`
  const puesto = datos.posicion ? `<p style="margin:0 0 8px;font-size:18px">Quedaste en el puesto <b>#${datos.posicion}</b> del ranking.</p>` : ''

  // Va adjunto e incrustado por cid: Gmail y otros bloquean las imágenes en data:.
  const qr = await QRCode.toBuffer(datos.urlPersonal, {
    type: 'png',
    width: 480,
    margin: 2,
    errorCorrectionLevel: 'M',
    color: { dark: '#2B1E16', light: '#FFFFFF' },
  })

  const html = `<!doctype html>
<html lang="es">
<body style="margin:0;padding:24px 12px;background:#fdf6ef;font-family:Helvetica,Arial,sans-serif;color:#2b1e16">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:20px;padding:32px 24px;text-align:center">
    <div style="font-size:13px;font-weight:700;letter-spacing:2px;color:#7a6a5e">JOALCA GAMES · ${escapar(marca.toUpperCase())}</div>
    <h1 style="margin:12px 0 16px;font-size:28px">${titular}</h1>
    <p style="margin:0 0 8px;font-size:18px">${detalle}</p>
    ${puesto}
    <img src="cid:qr-personal" width="240" height="240" alt="Código QR de tu página personal" style="display:block;margin:24px auto 12px;border-radius:12px" />
    <p style="margin:0 0 20px;font-size:16px;color:#7a6a5e">Escanea el QR para ver tu puesto en vivo 📲</p>
    <a href="${escapar(datos.urlPersonal)}" style="display:inline-block;padding:14px 28px;border-radius:12px;background:#f2784b;color:#2b1e16;font-weight:700;font-size:18px;text-decoration:none">Ver mi puesto</a>
  </div>
</body>
</html>`

  const respuesta = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${clave}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: remitente,
      to: [datos.email],
      subject: asunto,
      html,
      attachments: [{ filename: 'mi-qr.png', content: qr.toString('base64'), content_id: 'qr-personal' }],
    }),
  })
  if (!respuesta.ok) {
    throw new Error(`Resend respondió ${respuesta.status}: ${await respuesta.text()}`)
  }
}
