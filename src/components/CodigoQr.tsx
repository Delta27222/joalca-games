import QRCode from 'qrcode'
import { useEffect, useState } from 'react'

function CodigoQr({ url }: { url: string }) {
  const [svg, setSvg] = useState('')

  useEffect(() => {
    let vigente = true
    QRCode.toString(url, {
      type: 'svg',
      margin: 0,
      errorCorrectionLevel: 'M',
      color: { dark: '#2B1E16', light: '#FFFFFF' },
    }).then((s) => vigente && setSvg(s))
    return () => {
      vigente = false
    }
  }, [url])

  return (
    <div
      className="qr"
      role="img"
      aria-label="Código QR personal"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

export default CodigoQr
