# Protocolo de sesión NVDA — flujo ciego end-to-end

**Duración:** 30–40 min por videollamada (Zoom/Meet con audio del sistema compartido).
**Regla de oro:** no ayudes. Si el tester se traba, cuenta 60 segundos en silencio antes de dar UNA pista, y anótala. Cada pista dada = la tarea no fue "sin ayuda".

## Antes de la sesión

- [ ] Tester confirmado: usuario de NVDA en Windows, hispanohablante, que escribe habitualmente.
- [ ] Enviarle el link del instalador ANTES de la sesión (instalar es la Tarea 1 — no lo instales tú).
- [ ] Pedir permiso para grabar: "¿Puedo grabar la sesión para corregir errores? Solo la usa el equipo. Si me autorizas, un fragmento podría usarse como demo — te pido eso aparte y puedes decir que no."
- [ ] Tener `metricas.md` abierto para anotar en vivo.

## Guion de apertura (leer tal cual)

> "Gracias por darme 30 minutos. Estoy probando si CAPYCHAD, un editor de guiones en español, se puede usar de verdad con NVDA. No te estoy evaluando a ti — estoy evaluando a la app. Si algo se traba, la culpa es mía, no tuya, y eso es exactamente lo que necesito descubrir. Pensá en voz alta: decime qué escuchás y qué esperabas escuchar."

## Las 5 tareas

| # | Tarea | Instrucción al tester | Éxito |
|---|---|---|---|
| 1 | Instalar y abrir | "Instalá la app desde el link y abrila" | Llega a la pantalla de bienvenida y la entiende |
| 2 | Crear guion | "Creá un guion nuevo, la plantilla que quieras" | Entra al editor y sabe dónde está |
| 3 | Escribir una escena | "Escribí una escena corta: un encabezado (INT. COCINA — NOCHE), una línea de acción, un personaje y su diálogo" | Usa Tab/Enter para cambiar tipos de elemento y lo logra |
| 4 | Guardar y exportar | "Guardá el guion y exportalo a PDF" | Archivo exportado en disco |
| 5 | Verificar | "Abrí el PDF exportado y comprobá que tu escena está ahí" | Lo confirma con su lector |

**El test pasa si las tareas 2, 3 y 4 salen sin ayuda.** (La 1 y la 5 dan contexto.)

## Qué anotar por tarea

- Completada: sin ayuda / con 1 pista / bloqueada
- Tiempo aproximado
- Dónde exactamente se trabó (qué anunció NVDA, qué esperaba el tester)
- Cita textual si dice algo revelador

## Cierre (3 preguntas + 1 oferta)

1. "¿Qué fue lo más frustrante?"
2. "¿Qué usás hoy para escribir, y esto lo reemplazaría mañana?"
3. "¿Qué tendría que tener para que lo recomiendes a otra persona ciega que escribe?"

**Oferta (test de pago real):**
> "La app cuesta $8 al año o $49 la licencia de por vida. Por ser de los primeros testers, te ofrezco la vitalicia a mitad de precio. ¿La querés? Te paso el link ahora."

Anotar la respuesta literal. Un "sí" sin pago no cuenta como pago.

## Después de cada sesión

- [ ] Volcar resultados en `metricas.md` el mismo día.
- [ ] Listar los bloqueos como issues concretos (qué anunció NVDA vs. qué debía anunciar).
- [ ] Arreglar los bloqueos ANTES de la siguiente sesión — cada sesión debe probar una app mejor.
