import isotipo from '../assets/koda/koda_isotipo.png'
import nombre from '../assets/koda/koda_nombre.png'

/**
 * Crédito de KodaTech, con enlace a su sitio: muestra el isotipo y, con hover
 * o foco, despliega el nombre completo.
 */
function CreditoKoda() {
  return (
    <a
      href="https://www.kodatech.dev"
      target="_blank"
      rel="noopener noreferrer"
      className="credito-koda"
      aria-label="Desarrollado por KodaTech (abre kodatech.dev)"
    >
      <img src={isotipo} alt="" className="credito-koda-isotipo" />
      <span className="credito-koda-nombre">
        <span className="credito-koda-by">by</span>
        <img src={nombre} alt="" />
      </span>
    </a>
  )
}

export default CreditoKoda
