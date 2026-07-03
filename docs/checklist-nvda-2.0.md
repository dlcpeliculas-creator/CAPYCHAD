# Checklist NVDA — CAPYCHAD 2.0 (el paso humano del gate)

Recorré la app con NVDA activo, solo teclado. Cada fila dice **qué debe anunciar NVDA**.
Un silencio, un foco perdido o un anuncio confuso = issue: anotalo en la tabla final y
me lo traés — se arregla antes de la primera sesión con tester real.

> Preparación: NVDA corriendo · `npm run start:desktop` · para ver la bienvenida de nuevo:
> Ctrl+Shift+I → consola → `localStorage.clear()` → recargar con Ctrl+R.

## A. Primer arranque


| #   | Paso                           | NVDA debe anunciar                                                                                                                                       | ✓/✗ |
| --- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| A1  | Abre la app                    | Título "CAPYCHAD" y, al momento, la bienvenida completa: "Bienvenido a CAPYCHAD… El modo no vidente está activo… tres opciones"                          | v   |
| A1b | Con NVDA ya corriendo al abrir | Además: "Lector de pantalla detectado. El modo no vidente de CAPYCHAD está activo…" (si no suena, no es bloqueo: la detección de Chromium a veces tarda) | v   |
| A2  | Tab por el diálogo             | "Empezar a escribir, botón" → "Tutorial de voz, botón" → "Ver la Ayuda, botón" (foco atrapado: Tab cicla adentro)                                        | v   |
| A3  | Escape                         | Cierra la bienvenida y el foco cae en el editor                                                                                                          | v   |
| A4  | ~1,5s después                  | La pregunta única de reportes de errores (queda apagado salvo que lo actives en Personalización)                                                         | v   |




## B. Editor y lectura de cursor


| #   | Paso                                  | NVDA debe anunciar                                                                               | ✓/✗ |
| --- | ------------------------------------- | ------------------------------------------------------------------------------------------------ | --- |
| B1  | Foco en la hoja                       | El grupo "Editor de guion. Tab cambia el tipo…"                                                  | v   |
| B2  | Escribí "int. cocina — noche"         | Eco normal; el texto queda en MAYÚSCULAS                                                         | v   |
| B3  | Enter                                 | "Acción"                                                                                         | v   |
| B4  | Tab (varias veces)                    | "Personaje" → "Diálogo" → "Transición"… (cicla y anuncia)                                        | v   |
| B5  | Escribí en Personaje "marcos" + Enter | "MARCOS" en mayúsculas; al Enter, "Diálogo"                                                      | v   |
| B6  | Flecha ↑ hasta el encabezado          | Cada línea: "MARCOS — Personaje", "Marcos escucha… — Acción", "INT. COCINA — NOCHE — Encabezado" | v   |
| B7  | Backspace en un bloque vacío          | Une con el anterior sin perder foco                                                              | v   |




## C. Tutorial de voz


| #   | Paso                           | NVDA debe anunciar                                                             | ✓/✗ |
| --- | ------------------------------ | ------------------------------------------------------------------------------ | --- |
| C1  | Alt+Shift+T                    | "Tutorial de dos minutos… Paso 1 de 4…"                                        | v   |
| C2  | Cumplí los 4 pasos escribiendo | Avanza SOLO cuando escribiste (no por tiempo); cierra con "Tutorial completo…" | v   |
| C3  | Alt+Shift+T y Escape           | "Tutorial cerrado. Podés relanzarlo…"                                          | v   |




## D. Lectura (table read)


| #   | Paso                               | NVDA debe anunciar / pasar                                                                                           | ✓/✗ |
| --- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------- | --- |
| D1  | Alt+Shift+L con una escena escrita | "Lectura iniciada: N voces…" y empieza a sonar; la línea sonando queda resaltada                                     | v   |
| D2  | Espacio (con el foco donde sea)    | "Lectura en pausa. Espacio reanuda." / de nuevo: "Lectura reanudada." y relee la línea que sonaba desde el principio | v   |
| D3  | Escape                             | "Lectura detenida." y el foco vuelve a tu línea                                                                      | v   |
| D4  | Escuchá voces                      | Personajes con voces distintas al narrador (si tu Windows tiene ≥2 voces es-*)                                       | v   |




## E. Personalización


| #   | Paso                                  | NVDA debe anunciar                                                                                                                                                                           | ✓/✗ |
| --- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| E1  | Alt+Shift+P                           | Diálogo "Personalización" con descripción; foco en el primer control                                                                                                                         | v   |
| E2  | "Modo no vidente" primero             | Interruptor, activado                                                                                                                                                                        | v   |
| E3  | Cambiá el skin con flechas            | "Skin: Cinema · oscuro." (cada cambio anunciado y aplicado en vivo)                                                                                                                          | v   |
| E4  | Tamaño de texto → Grande              | "Tamaño del texto: Grande (A+)." y la interfaz crece                                                                                                                                         | v   |
| E5  | Alt+Shift+H (fuera del panel)         | "Alto contraste (AAA): activado." — negro/blanco/amarillo por encima del skin                                                                                                                | v   |
| E6  | Restablecer                           | "Personalización restablecida: modo no vidente activo, anuncios en detalle alto, skin Piedra y papel, texto tamaño normal, voz propia apagada." (el estado COMPLETO, no solo "restablecida") | v   |
| E7  | Activá "Voz propia" y navegá 2 líneas | La APP habla con su propia voz además de NVDA (voces dobles = correcto acá: por eso viene apagada). Desactivala y verificá que calla                                                         | v   |




## F. Comentarios · G. Export · H. Ayuda


| #   | Paso                                     | NVDA debe anunciar                                                                                                                  | ✓/✗ |
| --- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | --- |
| F1  | Alt+Shift+F                              | El diálogo con su promesa Y ADEMÁS: "Comentarios. Tipo: Accesibilidad — … Hay N tipos; elegí con las flechas. Tab pasa al mensaje." | v   |
| F1b | Flechas en el selector Tipo              | Cada opción se anuncia ("Tipo: Error — …", "Tipo: Idea — …") — ya no depende de que NVDA lea el selector                            | v   |
| F2  | Enviá uno de prueba (tipo Accesibilidad) | "Reporte de accesibilidad enviado. Va primero en la cola — gracias."                                                                | v   |
| G1  | Exportar guion → confirmar               | "Guion exportado en formato Fountain. Carpeta: …"                                                                                   | v   |
| G2  | Exportar → cancelar                      | "Exportación cancelada." + foco de vuelta en tu línea                                                                               | v   |
| H1  | F1                                       | Diálogo "Ayuda — cada función, en corto", navegable sección por sección                                                             | v   |
| H2  | "Abrir manual en el navegador"           | Se abre el manual HTML;                                                                                                             | v   |




## Registro de issues


| #   | Paso                        | Qué anunció / qué esperaba                                                    | Severidad                                                                                                                    | Estado                                                                                                                                                                                                                                            |
| --- | --------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | restablecer personalizacion | no leyo todo lo seleccionado en la parte de comentarios. En la seccion "TIPO" | **"Detalle de los anuncios de voz" En modo alto tiene que ser mantenido si hay un reset, al restablecer la personalizacion** | ✅ Corregido: el reset ahora anuncia el estado completo resultante (incluido "anuncios en detalle alto") y un test fija que detalle alto + modo no vidente son SIEMPRE lo que queda tras restablecer. Requiere `npm run build:web` y re-test de E6 |


**Criterio del gate:** A–H sin issues de severidad alta ⇒ compilás la RC (`npm run dist`,
falta tu `build/icon.ico`) y arrancan las sesiones con testers del protocolo
(`FABLE/app/docs/mvp-test/protocolo-sesion-nvda.md`, apuntando a esta app).