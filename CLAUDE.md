# CAPYCHAD — instrucciones persistentes del proyecto

## Qué es
Editor de guion profesional en español, accesible con lector de pantalla (NVDA) desde el primer minuto. Marca: TRUEGOTDF. Repo: `dlcpeliculas-creator/CAPYCHAD` (público). Licencia FSL-1.1-Apache-2.0.

## Reglas para Claude
- **Siempre en español** (voseo rioplatense). Nunca responder en inglés.
- Estamos en el **test de validación de 2 semanas** (`docs/test/plan-2-semanas.md`): NO agregar features, solo arreglos de bloqueos. Pagos reales o nada.
- La accesibilidad es el corazón del producto: cualquier cambio de UI debe pasar la auditoría de contraste (`npm run contrast`) y no romper el flujo con NVDA.
- Anotar métricas del test en `docs/test/metricas.md` el mismo día.
- OneDrive y git conviven mal acá: ante archivos que "no aparecen" en bash, usar Read (descarga el archivo cloud-only).

## Estado (actualizar al avanzar)
- Release **v0.1.1** publicado en GitHub Releases (exe + latest.yml + blockmap). Auto-update configurado.
- Landing lista en `landing/index.html`, bloque CONFIG completo. Deploy automático a GitHub Pages vía `.github/workflows/pages.yml` (requiere Settings → Pages → Source: GitHub Actions, una sola vez).
- Landing empresarial TRUEGOTDF en `landing/empresa/index.html` (comunidad no vidente desde el día uno; reciprocidad = licencia vitalicia + crédito). CONFIG pendiente: links de grupo WhatsApp/Telegram (los botones aparecen solos al pegarlos). Se publica junto con la otra en Pages.
- Fix de contraste dark mode en ambas landings: texto sobre terracota clara pasó de blanco (2,97:1, fallaba AA) a tinta oscura (6,34:1).
- Prerrequisitos pendientes del plan: publicar landing en Pages, video demo.

## Links de pago (MercadoPago) — NO tocar sin confirmación
- Vitalicia fundadora (USD 24,50): https://mpago.li/18xVogo
- Vitalicia (USD 49): https://mpago.la/2bWZt3N
- Suscripción anual (USD 8/año): https://mpago.la/1rPWAc7

## Contacto público
truegotdf@gmail.com

## Archivos clave
- `landing/index.html` — landing con bloque CONFIG (links de pago, descarga, email)
- `docs/test/plan-2-semanas.md` — plan del test con checkboxes (fuente de verdad del avance)
- `docs/test/mensajes-outreach.md` — mensajes lote A/B/C
- `docs/test/metricas.md` — funnel del test
- `docs/publicacion.md` — guía de publicación (repo, releases, Pages)
- `package.json` raíz — versión del instalador (electron-builder corre desde acá)

## Comandos
- `npm run dist` — tests + contraste + bundle web + instalador NSIS
- `npm run contrast` — auditoría de contraste (108 pares AA)
