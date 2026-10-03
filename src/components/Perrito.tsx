// Perrito por capas (Perrito.dc.html). Cada error retira una capa en este
// orden; la cabeza y el cuerpo nunca se quitan. Desde 3 errores se sorprende.
const CAPAS = ['cola', 'orejaIzquierda', 'orejaDerecha', 'patasTraseras', 'patasDelanteras'] as const
type Capa = (typeof CAPAS)[number]

function Perrito({ errores, className }: { errores: number; className?: string }) {
  const clase = (capa: Capa) => (errores > CAPAS.indexOf(capa) ? 'capa fuera' : 'capa')
  const sorprendido = errores >= 3

  return (
    <div className={`perrito ${className ?? ''}`}>
      <svg viewBox="0 0 260 260" role="img" aria-label={`Perrito con ${errores} de 5 errores`}>
        <g className={clase('cola')}>
          <path
            d="M180 198 C214 194 232 170 228 136"
            fill="none"
            stroke="#C98A52"
            strokeWidth="16"
            strokeLinecap="round"
          />
        </g>
        <g className={clase('patasTraseras')}>
          <ellipse cx="80" cy="210" rx="30" ry="24" fill="#D9A066" />
          <ellipse cx="180" cy="210" rx="30" ry="24" fill="#D9A066" />
          <ellipse cx="68" cy="231" rx="20" ry="10" fill="#FFF1DE" />
          <ellipse cx="192" cy="231" rx="20" ry="10" fill="#FFF1DE" />
        </g>
        <ellipse cx="130" cy="180" rx="58" ry="60" fill="#E9B97F" />
        <ellipse cx="130" cy="194" rx="32" ry="38" fill="#FFF1DE" />
        <g className={clase('patasDelanteras')}>
          <rect x="105" y="194" width="21" height="42" rx="10.5" fill="#E9B97F" stroke="#D9A066" strokeWidth="2" />
          <rect x="134" y="194" width="21" height="42" rx="10.5" fill="#E9B97F" stroke="#D9A066" strokeWidth="2" />
          <ellipse cx="115.5" cy="237" rx="15" ry="9" fill="#FFF1DE" />
          <ellipse cx="144.5" cy="237" rx="15" ry="9" fill="#FFF1DE" />
        </g>
        <circle cx="130" cy="96" r="54" fill="#E9B97F" />
        <ellipse cx="151" cy="84" rx="17" ry="15" fill="#D9A066" />
        <ellipse cx="130" cy="118" rx="30" ry="22" fill="#FFF1DE" />
        <path d="M92 140 Q130 160 168 140" fill="none" stroke="#1F5C7A" strokeWidth="8" strokeLinecap="round" />
        <circle cx="130" cy="155" r="7" fill="#F7C548" />
        <g className={clase('orejaIzquierda')}>
          <path d="M86 58 C58 56 48 100 60 130 C68 146 92 136 94 112 C96 92 96 70 86 58 Z" fill="#B97A45" />
        </g>
        <g className={clase('orejaDerecha')}>
          <path d="M174 58 C202 56 212 100 200 130 C192 146 168 136 166 112 C164 92 164 70 174 58 Z" fill="#B97A45" />
        </g>
        <circle cx="110" cy="90" r="7" fill="#2B1E16" />
        <circle cx="150" cy="90" r="7" fill="#2B1E16" />
        <circle cx="112.5" cy="87.5" r="2.4" fill="#FFFFFF" />
        <circle cx="152.5" cy="87.5" r="2.4" fill="#FFFFFF" />
        <g className="capa" opacity={sorprendido ? 1 : 0}>
          <path d="M101 75 Q110 68 118 73" fill="none" stroke="#7A4A26" strokeWidth="3" strokeLinecap="round" />
          <path d="M142 73 Q150 68 159 75" fill="none" stroke="#7A4A26" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="130" cy="127" rx="5.5" ry="7" fill="#2B1E16" />
        </g>
        <ellipse cx="130" cy="108" rx="10" ry="7" fill="#2B1E16" />
        <g className="capa" opacity={sorprendido ? 0 : 1}>
          <path d="M125 122 Q130 138 135 122 Z" fill="#F2784B" />
          <path
            d="M118 118 Q124 126 130 118 Q136 126 142 118"
            fill="none"
            stroke="#2B1E16"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
        <circle cx="98" cy="112" r="7" fill="#F2784B" opacity="0.3" />
        <circle cx="162" cy="112" r="7" fill="#F2784B" opacity="0.3" />
      </svg>
    </div>
  )
}

export default Perrito
