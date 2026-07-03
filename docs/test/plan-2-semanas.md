# Test de MVP — Plan de 2 semanas

> **ACTUALIZADO A LA 2.0:** la base del test es CAPYCHAD 2.0. La RC se compila con
> `npm run dist` (corre tests + contraste antes de empaquetar; el instalador ofrece NVDA
> en la pantalla final). El checklist técnico es `../checklist-nvda-2.0.md`; la guía de
> sesión de 1 página es `guia-sesion.md`; la entrega de licencias, `entrega-licencias.md`.
> Donde este plan diga "npm run release", leé `npm run dist`. El refresh visual del Día 1–3
> ya está hecho (skins Piedra/Cinema + 7 más).

**Objetivo:** probar el supuesto central con conducta real, no opiniones.
**Éxito =** 3/3 usuarios ciegos completan escribir → exportar sin ayuda **+** ≥5 pagos reales.

## Antes del Día 1 (prerrequisitos, ~1 día de trabajo)

- [ ] Crear links de pago en MercadoPago: vitalicia fundadora (USD 24,50 o equivalente local), vitalicia normal ($49), suscripción anual ($8). Pegarlos en `landing/index.html` (bloque CONFIG, líneas marcadas).
- [ ] Poner tu email de contacto en el bloque CONFIG de la landing.
- [ ] Compilar el instalador actual (`npm run release`) y subirlo a un link descargable (GitHub Releases).
- [ ] Publicar la landing (GitHub Pages o Netlify — arrastrar la carpeta `landing/`).
- [ ] Grabar el video demo del flujo ciego (puede ser después de la sesión 1, con permiso del tester).

## Semana 1 — ¿El flujo ciego funciona de verdad?

| Día | Acción | Meta |
|---|---|---|
| 1 | Enviar mensajes lote A (comunidades de tiflotecnología — ver `mensajes-outreach.md`) | 10 enviados |
| 1–3 | Refresh visual del tema por defecto (Claude puede hacerlo contigo) sin romper alto contraste | Tema nuevo listo |
| 2–3 | Responder interesados, agendar sesiones | 3 sesiones agendadas |
| 3–5 | **Sesiones NVDA 1–3** (grabadas, ver `protocolo-sesion-nvda.md`); corregir bloqueos entre sesión y sesión | 3 sesiones hechas |
| 6–7 | Arreglos finales de lo que se trabó; si alguna sesión falló, repetirla con el fix | 3/3 flujo completo |

**Puerta de salida de la Semana 1:** si tras los arreglos ningún usuario completa el flujo, **pausar la Semana 2** — no lances la historia de accesibilidad hasta que sea verdad. Arreglar y repetir no es fracaso ni pivote.

## Semana 2 — ¿Alguien paga?

| Día | Acción | Meta |
|---|---|---|
| 8 | Publicar el video demo en la landing; post lote B (comunidades de guionistas) y lote C (profesores) | 3 posts + 5 DMs |
| 9–11 | Conversaciones 1 a 1 con interesados; ofrecer vitalicia fundadora (10 cupos) | 10 conversaciones |
| 9–14 | Seguimiento del funnel en `metricas.md` (visitas → descargas → pagos) | diario |
| 12–13 | Segundo empujón en comunidades donde hubo respuesta; recordatorio de cupos fundadores | — |
| 14 | Cierre: llenar resultados en `metricas.md` y decidir con la tabla de decisión | Veredicto |

## Tabla de decisión (Día 14)

| Resultado | Decisión |
|---|---|
| 3/3 flujo ciego + ≥5 pagos | **Validado.** Correr Product Planner y planificar en serio |
| 3/3 flujo ciego + 0–4 pagos pero uso activo | Pivote de **pricing** (vitalicia/donación, precio regional) o de **segmento** (educación / audiodrama) — re-validar |
| Flujo ciego falla tras arreglos | No es pivote: es deuda técnica. Arreglar con testers aliados y repetir Semana 1 |
| Nadie responde a los mensajes (< 3 conversaciones) | El canal es el problema: revisar dónde está la comunidad real antes de tocar el producto |

## Reglas del test

1. No agregar features durante los 14 días. Solo arreglos de bloqueos.
2. Pagos de verdad o nada — "yo lo compraría" no cuenta.
3. Anotar todo en `metricas.md` el mismo día.
4. Los primeros mensajes piden **conversación**, no venta.
