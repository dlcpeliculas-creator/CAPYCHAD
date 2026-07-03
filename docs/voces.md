# Voces — el estándar de audio nativo de CAPYCHAD

_Decisión 2026-07-02, tras research del estado del arte local-TTS._

## La escalera de calidad (todas NATIVAS: sin nube obligatoria)

| Nivel | Motor | Calidad | Peso | Licencia | Cuándo |
|---|---|---|---|---|---|
| 0 · Inmediato | **Voces del sistema** (speechSynthesis) | Correcta | 0 MB | — | Ya implementado: funciona apenas instalás, sin descargar nada |
| 1 · Base universal | **Piper** | Buena (MOS ~3.3) | ~60 MB por voz | MIT | Descarga opt-in desde la app; corre en CUALQUIER equipo (clave para LatAm) |
| 2 · **Alta calidad (la voz de la marca)** | **Kokoro-82M** | Excelente (MOS ~4.5, comparable a nube) | ~330 MB + onnxruntime | Apache 2.0 | Descarga opt-in "Voz Alta Calidad"; corre en CPU moderna, español incluido |
| 3 · Premium opcional | ElevenLabs (nube) | Tope de mercado | 0 MB | Pago del usuario | Solo para export de audiodrama final; la v1 ya tiene la integración |

**Regla:** la app SIEMPRE habla desde el nivel 0 sin pedir nada. Los niveles 1–2 se ofrecen
como descarga dentro de la app ("Mejorar las voces — 1 clic, sin cuenta"), con el peso y el
origen declarados. Nada de nube obligatoria; el nivel 3 es una elección explícita del usuario.

## Integración (una sola tubería)

`core/audio.buildSegments()` produce los parlamentos; el **motor es un puerto** más
(`platform/tts`): `speak(segment) → audio`. Sistema/Piper/Kokoro/ElevenLabs implementan el
mismo contrato, así la Lectura, el futuro dictado-eco y el export de audiodrama no saben ni
les importa qué motor suena. Cambiar de motor = una preferencia en Personalización.

## Modo no vidente y autovoz (roadmap corto)

- Los anuncios de la app van por **aria-live** → NVDA los lee (cero doble-voz).
- **Autovoz** (futuro): para personas ciegas SIN lector instalado, un modo donde la app se
  narra a sí misma con el motor nativo — CAPYCHAD usable de fábrica en cualquier PC. Nadie
  del género lo tiene; queda declarado como diferencial a construir tras el test.

### Fuentes
- [Local AI Master — Best local TTS 2026](https://localaimaster.com/blog/best-local-tts-models)
- [LocalClaw — Local TTS guide 2026](https://localclaw.io/blog/local-tts-guide-2026)
- [Kokoro TTS review](https://reviewnexa.com/kokoro-tts-review/)
