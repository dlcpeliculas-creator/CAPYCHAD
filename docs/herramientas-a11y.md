# Herramientas para usuarios no videntes — research y decisiones (2026-07)

**Pregunta del fundador:** ¿qué herramientas existen para comandos de voz y qué más
necesita el proyecto? **Veredicto corto:** sí hay camino 100% nativo y con licencias
libres. Y la mitad del ecosistema ya nos cubre gratis si seguimos haciendo bien los
nombres accesibles (NVDA reparte nuestro trabajo a braille y a control por voz sin
que escribamos una línea).

## 1. Comandos de voz — las opciones reales

| Opción | Qué es | Español | Latencia | Peso | Licencia | Veredicto |
|---|---|---|---|---|---|---|
| **Vosk** | ASR offline, bindings Node oficiales (npm `vosk`) | Sí (modelos 40 MB a 1.4 GB) | <500 ms, streaming, **vocabulario reconfigurable** (gramática cerrada) | 40 MB alcanza para comandos | Apache 2.0 | **Elegido para comandos** |
| **sherpa-onnx** | Suite k2/Kaldi: ASR streaming + keyword spotting + VAD + **TTS (soporta Kokoro y Piper/VITS)**, bindings Node | Sí (modelos multilingües) | Streaming real | Variable | Apache 2.0 | **Candidato a runtime único** (voz entrante y saliente en una sola dependencia) — evaluar al implementar el puerto tts |
| **whisper.cpp** | ASR batch de máxima precisión | Excelente | 1–2 s (no streaming real) | 100 MB–1 GB+ | MIT | Solo si el dictado largo exige más precisión; nunca para comandos |
| **Acceso por voz de Windows 11** | Control por voz del SO (22H2+), offline, **en español**, con integración NVDA (anuncia dictado y estado de mic) | Sí | — | 0 (viene con Windows) | — | **Gratis para nosotros**: si nuestros nombres accesibles están bien (lo están), el usuario ya puede decir "hacer clic en Lectura" HOY. Documentarlo en la wiki § NVDA |
| Web Speech API (reconocimiento) | La del navegador | — | — | — | — | Descartada: en Electron requiere clave de Google Cloud → viola "nada sale de la máquina" |

## 2. Diseño para CAPYCHAD (cuando toque, cola post-gate junto al dictado)

- **Puerto `platform/asr`**, espejo del puerto tts: la UI pide `listen(grammar)` y no sabe
  qué motor escucha. Motor inicial: Vosk es-small (40 MB, descarga opcional como las voces).
- **Pulsar-para-hablar, jamás escucha continua:** un atajo (p. ej. `Alt+Shift+V`) abre el
  micrófono, se anuncia "Escuchando", y se cierra al soltar o por silencio. Razones:
  privacidad (regla de la casa), CPU, y cero falsos positivos mientras se dicta un guion.
- **Un solo registro manda:** los comandos de voz no se inventan aparte — son los mismos
  IDs del registro de atajos/wiki. "Guardar", "Exportar", "Lectura", "Personalización",
  "Ayuda". Agregar una función = una entrada que da atajo + comando de voz + wiki. La
  gramática cerrada de Vosk (lista de frases) hace que reconocer 20 comandos sea casi
  perfecto incluso con el modelo chico.
- **Dictado ≠ comandos:** el dictado de texto largo es otra pieza (vendor `lib/dictation`
  ya segmenta a párrafos; 6 tests). Motor: Vosk es grande o whisper.cpp según prueba de
  precisión con guiones reales. Modo dictado se activa/desactiva con anuncio.

## 3. Lo que el ecosistema ya nos da gratis (no construir)

- **Braille:** NVDA enruta a displays braille (USB/Bluetooth, decenas de marcas) todo lo
  que anunciamos por aria-live. Regla de diseño que ya cumplimos y hay que sostener:
  **anuncios cortos y con lo importante primero** — en braille se leen, no se escuchan.
- **Control por voz del SO:** Acceso por voz (Win 11) en español + NVDA. Cero código.
- **Magnificadores (ZoomText/Lupa):** funcionan sobre Chromium; nuestro `fontScale` y
  alto contraste ya cubren baja visión dentro de la app.
- **JAWS y Narrator:** Chromium expone UIA/IAccessible2, así que lo que funciona en NVDA
  suele funcionar. Smoke test con Narrator (gratis, ya instalado) post-gate.

## 4. Baratas de sumar (candidatas a prefs nuevas, una entrada c/u)

1. **Earcons** — sonidos breves opcionales para guardado/error/inicio-fin de Lectura.
   Los usuarios expertos de NVDA los prefieren a más palabras. Pref `sounds` off por defecto.
2. **Atajos remapeables** — el registro ya conoce todos los atajos; un mapa en prefs
   evita colisiones con gestos de NVDA/JAWS del usuario.
3. **Wiki § "Control por voz hoy"** — explicar Acceso por voz de Windows en 5 líneas.

## 5. Qué NO hacer

- Wake word / micrófono siempre abierto (privacidad, CPU, falsos positivos).
- Reconocimiento en la nube como única vía (puede ser opt-in premium algún día, como ElevenLabs).
- Motor propio de braille o de magnificación: es pelearle al lector de pantalla.

## 6. Segunda pasada (búsqueda profunda) — lo que NO estábamos viendo

| Hallazgo | Qué habilita | Costo | Cuándo |
|---|---|---|---|
| **PDF etiquetado** — Electron ≥28 tiene `printToPDF({ generateTaggedPDF: true, generateDocumentOutline: true })` | El PDF exportado se vuelve **legible por lectores de pantalla**. Hoy casi ninguna app de guion exporta PDF accesible: un guionista ciego manda un PDF que otro ciego (profesor, concurso) no puede leer. Es UNA línea sobre el export que ya existe | 1 línea + probar con NVDA (flag experimental: si falla, se apaga) | **Candidata a única excepción pre-gate** — es calidad del export existente, no feature |
| **Detección de lector de pantalla** — `app.isAccessibilitySupportEnabled()` + evento `accessibility-support-changed`; API nueva `getAccessibilitySupportFeatures()` → `'screenReader'` | Primer arranque: si hay NVDA/JAWS corriendo, ofrecer activar modo no vidente sin que el usuario lo busque | Chico. ⚠️ Hubo regresión reportada en Electron 37 (issue #48039); usamos ^42 — verificar al implementar y preferir la API nueva | Post-gate, con la bienvenida |
| **Modo self-voicing** — patrón de audiogames/Ren'Py: la app habla por sí misma vía nuestro TTS, sin lector instalado | Sirve al usuario que NO tiene NVDA (pérdida de visión reciente, adultos mayores). Nuestro announcer ya centraliza todos los mensajes: es enrutar esa salida a speechSynthesis/Piper con un toggle | Medio-chico (el announcer ya existe) | Post-gate, junto al puerto tts |
| **Export braille (BRF/PEF)** — liblouis, la MISMA librería que usan NVDA/JAWS/VoiceOver; tablas español; CLI `file2brl`; ecosistema soporta embosadoras Index, ONCE/CIDAT, ViewPlus | Guion listo para imprimir en braille — nadie lo ofrece. Oro para la fase educación (escuelas ONCE, profesores) | Medio (liblouis es C con CLI; se integra como proceso, igual que Piper) | Fase educación (con la cola 7–8) |
| **OCR de PDFs escaneados** — NVDA ya tiene add-on TesseractOCR (gratis, offline, español) | Importar guiones en papel/imagen. **No construirlo:** el ecosistema ya lo resuelve; documentar el add-on en la wiki § NVDA | 5 líneas de wiki | Wiki, cuando se toque |
| Audiolibro accesible del guion (EPUB3/DAISY) | Idea exploratoria pegada a la tubería de audiodrama; sin research aún | — | Backlog, sin compromiso |

**Síntesis de prioridades:** el PDF etiquetado es la joya (impacto enorme, costo casi nulo, y
convierte "accesible" en algo que se nota AFUERA de la app). Detección de lector y self-voicing
redondean la bienvenida post-gate. Braille export define la fase educación.

**ESTADO (2026-07-03, decisión del fundador — implementado desde la base):**
✅ PDF etiquetado (puerto `capy:exportPdf`, con fallback si el flag experimental falla) ·
✅ Detección de lector de pantalla (IPC `capy:a11yState` + evento, anunciada) ·
✅ Voz propia — pref `selfVoice`, off de fábrica, enganchada en el announcer único ·
✅ Wiki: Acceso por voz Win11 + TesseractOCR documentados (§ NVDA y § Personalización) ·
Suite 42/42 en verde. Pendientes por diseño: comandos de voz Vosk y dictado (cola post-gate 6),
braille BRF (fase educación), earcons y atajos remapeables (prefs futuras a demanda de testers).

## Fuentes

- Vosk (modelos, Node, vocabulario reconfigurable): github.com/alphacep/vosk-api · alphacephei.com/vosk
- sherpa-onnx (ASR streaming + KWS + TTS Kokoro/VITS, Node): github.com/k2-fsa/sherpa-onnx
- Comparativa Vosk vs Whisper local (latencia/precisión 2026): sinologic.net · vocalinux.com/compare
- Acceso por voz Win 11 en español + NVDA: support.microsoft.com (P+F Acceso por voz) · download.nvaccess.org/documentation/es
- Kokoro-82M voces español (1F/2M): huggingface.co/hexgrad/Kokoro-82M (VOICES.md)
- PDF etiquetado en Electron: github.com/electron/electron/pull/39563 · electronjs.org/docs/latest/api/web-contents
- Detección de lector: electronjs.org/docs/latest/tutorial/accessibility · issue electron#48039 (regresión v37)
- Self-voicing (patrón): en.wikipedia.org/wiki/Self-voicing · Ren'Py accessibility
- liblouis/BRF: liblouis.io · github.com/liblouis/liblouisutdml · brailleblaster.org
- OCR: nvda.es/2022/06/02/tesseractocr (add-on TesseractOCR, offline, español)
