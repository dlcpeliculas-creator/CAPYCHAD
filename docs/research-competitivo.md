# Research competitivo — el género en 2026 y nuestro rumbo

_Investigado: 2026-07-02. Decisión registrada: la v1 se descarta como producto; TODO se
migra a CAPYCHAD 2.0 y el test de 2 semanas corre sobre esta base cuando alcance el
momento mágico (ver migracion.md § Regla cero, actualizada)._

## El mapa del mercado

| App | Modelo | Precio | Fortaleza | Queja recurrente |
|---|---|---|---|---|
| **Final Draft 13** | Compra + Cloud | ~USD 199–249 | EL estándar de entrega (.fdx); Track Changes, Beat Board con Flow Lines, Typewriter/Midnight/Focus Mode, Navigator 2.0, Custom Color PDFs | Caro; pesado; accesibilidad decaída |
| **WriterDuet** | Suscripción | Free / ~$7.5–12/mes; Teams $25 | Colaboración tiempo real (el Google Docs del guion) | Fatiga de suscripción |
| **Arc Studio Pro** | Suscripción | Free / $69/año | Onboarding amable, estructura guiada, colabora offline | Desktop lento/glitchy; free limitado; iPad flojo |
| **Fade In** | Compra única | $79.95 | Formato pro + Revision Mode a fracción del precio; multiplataforma | Marketing invisible; UI utilitaria |
| **Highland Pro** | Suscripción | $59.99/año | "PDF melting" (PDF→editable), minimalismo Mac | Solo Apple |
| **Celtx** | Suscripción teams | Por equipo | Pre-producción integral | Ya no hay app de escritorio (solo online); precio de equipo para individuos; abrumador |
| **CAPYCHAD 2.0** | Vitalicia + anual | **$49 única / $8 año** | Español total · accesible NVDA verificado · local-first · audiodrama · 9 skins auditados | (por construir la reputación) |

**Lectura estratégica:** el mercado se partió en dos — los legacy (FD, Fade In) son dueños del
formato y la producción; los nuevos (WriterDuet, Arc) de la nube y la colaboración. Los
profesionales usan DOS herramientas. Nadie — nadie — menciona accesibilidad ni español
en todo el research de 2026: nuestra cuña sigue completamente vacía. Y las quejas del
mercado (suscripciones, solo-online, desktop glitchy, precio) son exactamente nuestras
fortalezas de diseño.

## ✓ Bien encaminados (el mercado nos valida)

1. **Precio disruptivo sin suscripción obligatoria** — $49 vitalicia contra $199–249 de FD y la fatiga de subs de WriterDuet/Arc/Highland/Celtx. La compra única de Fade In ($79.95) demuestra que el modelo funciona; nosotros lo bajamos a precio LatAm.
2. **Local-first con colaboración opcional** — la muerte del desktop de Celtx y los glitches del desktop de Arc validan la apuesta: app nativa sólida + Yjs cuando lo pedís. Offline no es nostalgia, es confiabilidad.
3. **La cuña accesible + español** — cero menciones en el mercado 2026. El océano sigue azul; el caso de estudio NVDA será literalmente único en el género.
4. **Skins + Cinema + plantilla Moderna** — FD13 vende Typewriter/Midnight/Focus Mode como novedades estrella: la personalización del entorno ES tendencia, y nuestros 9 skins auditados AA van más lejos que sus 2 modos.
5. **Beat Board con plantillas (Save the Cat, etc.)** — paridad con la dirección de FD12/13; nuestro filmstrip de la plantilla Futurista es la evolución natural de sus Flow Lines.
6. **Colaboración tiempo real con Yjs** — paridad conceptual con WriterDuet/Arc, ya construida y testeada (30 tests), sin nube obligatoria.
7. **Modo Revisión en el roadmap** — Fade In y FD lo confirman como LA feature pro. Ya estaba planificado; ahora sube de prioridad (ver abajo).
8. **Instalador sin admin + updates diferenciales + sin activación online** — ningún competidor lo comunica; docs/lanzador.md nos da un estándar superior de fábrica.
9. **IA "asistente, no coguionista"** — en la era del ruido AI (media docena de apps-AI en el research), nuestra política clara es diferenciación de confianza, no carencia.

## + A sumar (lo planteamos ahora para no volver atrás)

**P0 · antes del test (paridad del momento mágico en la 2.0):** nada nuevo — solo migrar
editor, bienvenida, export y NVDA. Cero features hasta que el flujo ciego pase en esta base.

**P1 · durante/inmediatamente después del test (baratos, esperados por el mercado):**
1. **Typewriter mode** — scroll que mantiene la línea activa centrada (headline de FD13; es CSS+scroll). Va en la plantilla Clásica y Moderna.
2. **Metas y estadísticas de escritura** — portar sprint/stats de la v1 y elevarlas (FD13 lo vende como "Writing Goals & Productivity Stats"; el HUD de la Futurista ya lo contemplaba).
3. **Navigator de escenas con filtros** — navegación por escena/personaje/locación en el sidebar de la Moderna (paridad Navigator 2.0; nuestro analysis.js ya calcula todo).

**P2 · post-validación (los diferenciales pro):**
4. **Modo Revisión completo + Track Changes** — páginas de colores WGA + aceptar/rechazar cambios (FD separa ambos; tenemos ydiff y review como base). El épico ya planificado absorbe Track Changes.
5. **"Descongelá tu PDF"** — elevar pdftext (PDF→guion editable) a feature con nombre y marketing, estilo el "PDF melting" que hizo famosa a Highland.
6. **Desglose de producción (tagging)** — props/vestuario/elementos por escena exportable; extiende las Fichas actuales al estándar FD/Fade In.
7. **PDF con marca de agua y colores custom** — compartir borradores con protección (paridad FD13 Custom Color PDFs + watermark que ellos no enfatizan).
8. **Web con sync OPCIONAL** — FD empuja Cloud fuerte; nuestra apps/web ya nació. Regla: sync opt-in, jamás obligatorio (la queja de Celtx es el memo).

**Empresa seria (procesos, no features):**
9. **Changelog público + roadmap público + versionado semántico + canal beta** — la confianza se construye con ritmo visible.
10. **Política de privacidad y de IA publicadas** en la landing — una página, lenguaje llano; en este mercado es ventaja competitiva.
11. **Firma de código antes de cualquier campaña grande** (plan en docs/lanzador.md).

## Lo que NO vamos a perseguir

- Paridad total con FD en paperwork de producción profunda (sides avanzados, etc. ya tenemos lo esencial) — es su foso, no nuestro campo de batalla.
- IA generativa de guiones — el segmento AI-writer está saturado y erosiona la confianza que nuestra marca necesita.
- App móvil nativa — el iPad flojo de Arc enseña que un companion mediocre resta; primero web excelente.

### Fuentes
- [ScriptReaderPro — Screenwriting software compared](https://www.scriptreaderpro.com/screenwriting-software/)
- [StudioBinder — Best screenwriting software 2026](https://www.studiobinder.com/blog/screenwriting-software/)
- [Final Draft 13 — What's new](https://www.finaldraft.com/products/whats-new-fd13/)
- [Arc Studio — Pricing](https://www.arcstudiopro.com/pricing) · [G2 reviews](https://www.g2.com/products/arc-studio-pro/reviews)
- [Highland Pro](https://quoteunquoteapps.com/highland-pro/) · [Highland 2 → Pro](https://blog.quoteunquoteapps.com/highland-2-highland-pro-what-changed-what-stayed-the-same-and-where-to-get-it/)
- [Celtx — Capterra reviews](https://www.capterra.com/p/235136/Celtx/reviews/)
