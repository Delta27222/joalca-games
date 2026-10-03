# Joalca Games: diseño para implementar

Estas son las maquetas de alta fidelidad de la app (Vite + React + TypeScript, funciones de Vercel en /api, PostgreSQL).
Las reglas completas de los juegos, los datos y el backend están en el documento "Joalca Games — Plan de diseño".

## Cómo leer estos archivos

- `project/*.dc.html` son las pantallas del canvas de diseño. Cada una es HTML con estilos en línea y un
  bloque `<script type="text/x-dc">` con la lógica de la maqueta (`renderVals()`).
- Son **referencia visual**, no código para copiar tal cual: usan un runtime del editor (`support.js`)
  que no está incluido. Toma de ellas medidas, colores, tipografía, textos y estados.
- Cada pantalla tiene sus variantes en `data-props` (por ejemplo, `estado`, `errors`, `resultado`).
  Esas son las variantes que hay que implementar.
- `project/canvas.json` es solo la distribución de las pantallas en el canvas.

## Pantallas

| Archivo | Pantalla | Variantes |
|---|---|---|
| Main.dc.html | 1 · Inicio | tarjeta presionada |
| Registro.dc.html | 2 · Registro | juego (sopa/ahorcado); vacío, errores, enviando, error de red |
| Instrucciones.dc.html | 3 · Instrucciones | juego |
| CuentaRegresiva.dc.html | 4 · Cuenta regresiva | 3, 2, 1 |
| Sopa.dc.html | 5a · Sopa de letras | jugando, alerta (últimos 10 s), perdido |
| Ahorcado.dc.html | 5b · Descubre la palabra | errores 0–5, alerta |
| SopaResultado.dc.html | 6a · Resultado sopa | gana, pierde por tiempo |
| AhorcadoResultado.dc.html | 6b · Resultado ahorcado | gana, pierde por tiempo, pierde por errores |
| Ranking.dc.html | 7 · Ranking | con datos, fuera del top, vacío, cargando |
| Personal.dc.html | 8 · Página personal (celular, 390×844) | ganador, participante, id inválido |
| Perrito.dc.html | Perrito SVG por capas | errors 0–5 |
| PerritoEstados.dc.html | Los 6 estados del perrito | — |
| Sistema.dc.html | Tokens y componentes | — |

## Decisiones de diseño

- Tamaño base: iPad horizontal 1180×820. Casillas de la sopa de 46 px; sube a 48 px en pantallas más grandes.
- Tokens (provisionales, como variables CSS): --bg #FFF8F0, --surface #FFFFFF, --text #2B1E16,
  --text-muted #7A6A5E, --primary #F2784B, --accent-sopa #2F6B4F, --accent-ahorcado #1F5C7A,
  --success #3BB273, --danger #E04F5F, --border #EADFD3.
- Botón primario: fondo --primary con texto --text (con blanco no llega a contraste AA) y sombra inferior #C9532A.
- Fuentes (Google Fonts): Baloo 2 para títulos, letras y casillas; Nunito Sans para texto y cronómetro
  (`font-variant-numeric: tabular-nums`).
- El perrito es un SVG con grupos separados (cola, oreja izquierda, oreja derecha, patas traseras,
  patas delanteras); cada error pone en 0 la opacidad de una capa, con transición suave. Desde 3 errores,
  la expresión cambia a sorprendida.
- Animaciones de 150–300 ms; respetar `prefers-reduced-motion`.
- Pendiente: logos reales, texto de consentimiento, y las versiones vertical y celular de los juegos.
