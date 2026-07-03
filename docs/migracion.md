# Plan de estrangulamiento — de la v1 a la 2.0

**Regla cero (ACTUALIZADA 2026-07-02, decisión del fundador):** la v1 queda descartada como
producto — pasa a ser solo la **cantera** de módulos probados (vendor-v1). El test de 2 semanas
corre SOBRE LA 2.0, y por eso el gate es alcanzar la **paridad del momento mágico** acá:
bienvenida accesible → editor (Tab/Enter, tipos) → guardar → exportar, verificado con el
checklist NVDA (`app/docs/mvp-test/checklist-flujo-ciego.md`). Hasta ese gate: cero features
nuevas — solo migración. El kit de test (protocolo, mensajes, métricas, landing) se reutiliza
tal cual apuntando a la release de la 2.0. Prioridades de features post-gate: ver
`research-competitivo.md` (P1/P2).

## El patrón, pieza por pieza

Cada módulo se estrangula igual:

1. **Portar los tests primero** (de `app/test/` al paquete destino, adaptando imports).
2. Consumir la pieza v1 vía `vendor-v1` (ya pasa con el motor).
3. Escribir el reemplazo nativo detrás de la MISMA interfaz.
4. Cambiar el switch interno del adaptador (p. ej. `engine/index.js`) y correr los tests portados.
5. Solo entonces, borrar la dependencia del vendor para esa pieza.

## Orden propuesto (de menor a mayor riesgo)

| # | Pieza | Origen v1 | Destino | Estado |
|---|---|---|---|---|
| 0 | Motor Fountain/FDX | src/engine.js | core/engine (vendor) | ✅ sincronizado y testeado |
| 1 | Modelo del párrafo | (implícito en app.js) | core/model | ✅ nativo (primera pieza) |
| 2 | Announcer + roving | src/a11y.js | a11y | ✅ portado con tests |
| 3 | Análisis de producción | src/analysis.js | core/services/analysis | vendor listo, falta test portado |
| 4 | History / Beatsheets / Dictation | lib/*.js | core/services | vendor listo |
| 4e | Autoguardado + restauración | persist v1 | IPC + shell | ✅ debounce 1.5s + tic 30s + beforeunload, rotación .bak, restore anunciado al abrir, Ctrl+S por voz, wiki § guardado (snapshots con history vendor = siguiente) |
| 4b | Audio: segmentación + Lectura (table read) | lib/audiodrama.js + render v1 | core/audio + shell | ✅ segmentación v1 adaptada (4 tests) + Lectura con voces del sistema es-*, resaltado, Espacio/Escape, velocidad en Personalización (Alt+Shift+L) |
| 4c | Audio: motores nativos (Piper base + **Kokoro alta calidad**) + dictado + export audiodrama | lib/dictation + piper | platform/tts (puerto único) | pendiente — decisión y escalera de calidad en `voces.md`; permiso de micrófono ya habilitado; el puerto tts hace que Lectura/dictado/export no sepan qué motor suena |
| 4d | Lectura de cursor (modo no vidente) | patrón v1 | editor-core.lineAnnouncement + shell | ✅ SIEMPRE activa con `a11yMode` (pref on de fábrica): cada línea se anuncia con texto y tipo al navegar con flechas o foco |
| 5 | Puertos de archivo/export | main.js + preload | platform | ✅ contrato + 2 adaptadores |
| 5b | Sistema visual completo | docs/design.md | ui (tokens 9 skins + registro + audit 108/108) | ✅ nativo |
| 5c | Instalador/lanzador | build v1 | package.json build + docs/lanzador.md | ✅ estándar definido |
| 6 | Editor (la hoja) | app.js (Tab/Enter, tipos) | ui/editor-core + binding en shell | ✅ **CORE MIGRADO** (7/7 tests: Tab/Enter/NEXT/UPPER/anuncios + roundtrip FDX con motor v1); falta: tutorial de voz portado y sesión NVDA real |
| 6b | Bienvenida accesible + tutorial de voz | splash/app.js + tutorial v1 | apps/desktop + ui/tutorial | ✅ bienvenida en primer arranque (anunciada, 3 opciones) + tutorial 4 pasos portado con tests (Alt+Shift+T); telemetría (lib/telemetry, 8 tests) queda como siguiente pieza |
| 6e | **Wiki interna (mandato del fundador)** | — | ui/wiki + Ayuda F1 + manual HTML | ✅ registro por función (resumen + acción + atajos), Ayuda in-app navegable, "Abrir manual en el navegador" self-contained. **Regla de merge: una función sin entrada de wiki no entra** — el test wiki.test.js verifica el contrato (funciones vivas ⊆ wiki, atajos documentados = reales) |
| 6c | Personalización (NUEVO, prioridad del fundador) | Funciones/temas v1 | ui/prefs (registro) | ✅ nativo — 6 prefs fundacionales; agregar una = una entrada; panel autogenerado en el shell |
| 6d | Feedback in-app (NUEVO) | — | platform/feedback + IPC | ✅ nativo — Alt+Shift+F, accesibilidad = prioridad alta, guarda local + email configurable |
| 6f | **A11y desde la base (research 2026-07)** | docs/herramientas-a11y.md | main/preload/renderer + prefs + wiki | ✅ PDF etiquetado en el puerto exportPdf (generateTaggedPDF + outline, con fallback) · detección de lector de pantalla anunciada al arrancar y en vivo · pref `selfVoice` (voz propia: la app habla sin lector, off de fábrica) enganchada en el ÚNICO punto de anuncios · wiki documenta Acceso por voz Win11 y TesseractOCR |
| 7 | Telemetría opt-in | lib/telemetry.js | vendor + IPC + pref | ✅ portada: apagada de fábrica, pregunta única en el 2º arranque (solo informa; activar es siempre acción del usuario en Personalización), toggle `telemetry` con hook a IPC, wiki § Privacidad |
| 8 | Colaboración Yjs | lib/sync + yjs-engine | core/collab + platform/net | último (30 tests que portar) |

## Criterio de "done" por pieza

- Tests portados en verde en la 2.0 **y** los de la v1 siguen en verde (no se tocó la v1).
- Cero imports de `vendor-v1` para esa pieza.
- Si la pieza toca UI: smoke de teclado + anuncio NVDA equivalente al de la v1.

## La cola post-gate — cuándo vuelve cada función de la v1

Ninguna función de la v1 se perdió: viven como módulos probados en la cantera. Este es el
orden de retorno, decidido por (1) qué promete la landing, (2) qué piden los testers, y
(3) dificultad. Se ejecuta apenas cierre el test de 2 semanas — o durante la semana 2 si
las sesiones van holgadas.

| Orden | Función | Base en la cantera | Peso | Por qué este lugar |
|---|---|---|---|---|
| 1 | **Motores de voz nativos (Piper → Kokoro)** + Lectura con asignación de voces | scripts piper v1 + puerto tts (voces.md) | Medio | Habilita el export de audiodrama que la landing promete; sube la calidad de la Lectura |
| 2 | **Export de audiodrama** | lib/audiodrama (ya adaptado) + Piper | Chico (tras el 1) | El diferencial #3 del research; la tubería WAV ya está testeada |
| 3 | **Beat Board** + plantillas (Save the Cat, etc.) | lib/beatsheets (vendor, 10 tests) | Medio | La feature de estructura más usada; visible y vendible |
| 4 | **Historia / snapshots** | lib/history (vendor, 7 tests) | Chico | Completa la promesa de guardado (versiones con fecha) |
| 5 | **Asistente IA** ("asesora, no escribe") | anthropic.js + gateway v1 | Medio | Requiere cuidar la política de marca; entra con su entrada de wiki y opt-in |
| 6 | **Dictado por voz** | lib/dictation (vendor, 6 tests) + mic ya permitido | Medio | Accesibilidad de entrada; depende de motor de reconocimiento disponible |
| 7 | **Sala de coedición (Yjs)** + invitaciones + anfitrión | lib/sync + yjs-engine + invite + host (30+ tests) | **Grande** | La más pesada; el aula/colaboración es fase educativa (post-caso de estudio) |
| 8 | **Revisión colaborativa (.capyrev)** + compartir Telegram | lib/review + share (42+34 tests) | Medio | Acompaña a la 7 (flujo profesor↔alumno) |
| 9 | Fichas + reportes de producción + análisis en vivo | src/analysis (vendor) | Medio | Con el navigator de escenas del research (P1) |

**Regla intacta:** cada pieza entra con sus tests portados, su entrada de wiki, corriendo en
las 3 plantillas × 9 skins, y sin romper el flujo NVDA. Una por vez.

## Plantillas Moderna y Futurista — regla de integración total

Cuando lleguen las 2 plantillas de disposición (design.md § Plantillas), **heredan TODO por
contrato, no por esfuerzo**: los 9 skins (tokens.css § data-skin), Personalización completa
(prefs.js manda en las 3), Lectura y motores de voz (puerto tts), lectura de cursor, feedback
in-app, y el mismo árbol ARIA/atajos. Regla de merge: **una feature nueva no entra si no corre
en las 3 plantillas × 9 skins** (la matriz de 27 se automatiza en CI, herencia del TASK-050).
Como los skins son variables y las plantillas solo presentación, el costo de cumplirla es CSS,
no lógica — esa es la razón de esta arquitectura.

## Qué NO se migra

- Los skins legacy Estación/Cuaderno (quedan en la v1; la 2.0 nace con el catálogo design.md).
- El gateway/copias `(antes)` marcadas en el README de la v1.

## Señal de corte

La 2.0 reemplaza a la v1 cuando: el flujo mágico completo (bienvenida → escribir → exportar
con NVDA) pasa el checklist de `app/docs/mvp-test/checklist-flujo-ciego.md` en la 2.0,
y la matriz de skins/contraste corre en su CI. Hasta esa señal, la v1 es LA app.

**✅ GATE CUMPLIDO — 2026-07-03.** El fundador completó `checklist-nvda-2.0.md` A–H
(29/29 en verde) con NVDA real. Issues encontrados y corregidos en el camino: pausa de
Lectura determinística (D2), reset anuncia el estado completo (E6/issue #1), foco diferido
en diálogos + Tipo de Comentarios anunciado por aria-live (F1/F1b). **La 2.0 es LA app.**
**RC 0.1.0 compilada, instalada y verificada por el fundador (2026-07-03):** instalador con
oferta de NVDA en la pantalla final + flujo mágico completo en la app instalada. Sigue:
prerrequisitos del test (MercadoPago, Releases, landing — `publicacion.md`) → Semana 1.
**✅ Repo publicado y CI verde (2026-07-03):** `dlcpeliculas-creator/CAPYCHAD` (privado,
TRUEGOTDF como marca), con Actions corriendo suite + contraste + bundle en cada push (~13s).
La señal de corte está completa en sus dos condiciones: checklist NVDA + matriz en CI.
