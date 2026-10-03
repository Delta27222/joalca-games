# Glosario

| Término | Significado |
| --- | --- |
| **Juego** | Una de las dos experiencias: `sopa` (Sopa de letras, Taste of the Wild) o `ahorcado` (Descubre la palabra, Diamond Care). |
| **Jugador** | Persona registrada, identificada por su **teléfono**. Tiene un `id` aleatorio (UUID) que se usa en su página personal; nunca se expone el teléfono. |
| **Partida** | Un intento de un jugador en un juego. El servidor fija su `inicio` y calcula su `duración`. Resultado `gana` o `pierde`; una partida sin terminar cuenta como perdida. |
| **Límite de tiempo** | 120 s en la sopa, 60 s en el ahorcado. |
| **Bonus de tiempo** | En la sopa, al encontrar 5 palabras se suman 15 s al cronómetro, una sola vez. Por eso una sopa ganada puede durar hasta 135 s. |
| **Letra de ayuda** | En la sopa, si pasan 15 s sin encontrar una palabra, se ilumina una letra (la inicial o una intermedia) de una palabra pendiente. |
| **Cuenta regresiva** | El 3, 2, 1 previo a la partida. El inicio de la partida en el servidor ya la descuenta. |
| **Ranking** | Por juego, el mejor tiempo ganador de cada jugador. Desempate: menos errores (ahorcado) y luego quien terminó primero. |
| **Sorteo** | Participa todo jugador registrado que jugó, gane o pierda. Una participación por persona. |
| **Página personal** | `/jugador/<id>`, abierta desde el QR: posición en vivo en cada juego. |
| **Letras de pista** | En el ahorcado, 3 letras distintas al azar que se revelan al empezar (todas sus apariciones), siempre que sumen entre 5 y 8 casillas. |
| **Normalizar** | Quitar tildes y pasar a mayúsculas para comparar letras. La **Ñ** es una letra propia y no se normaliza a N. |
