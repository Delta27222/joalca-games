/**
 * Círculos decorativos que flotan en el fondo. El contenedor necesita la clase
 * `con-burbujas` para recortarlos y dejarlos detrás del contenido. El de abajo
 * toma el color del juego, salvo que la página defina `--burbuja-abajo`.
 */
function Burbujas() {
  return (
    <>
      <div className="burbuja" style={{ width: 520, height: 520, background: '#FDE6DA', top: -260, right: -160 }} aria-hidden="true" />
      <div className="burbuja" style={{ width: 420, height: 420, background: 'var(--burbuja-abajo, var(--accent-bg))', bottom: -240, left: -140 }} aria-hidden="true" />
    </>
  )
}

export default Burbujas
