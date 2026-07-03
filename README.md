# CAPYCHAD 2.0 — arquitectura estranguladora

Arquitectura nueva desde cero que **no tira nada**: importa el motor probado de la v1
(`FABLE/app`) como código sincronizado de solo lectura, y lo va reemplazando por
módulos nativos **cuando cada pieza lo amerite** — mientras la v1 sigue vendiendo.

## El mapa

```
CAPYCHAD 2.0/
├── packages/
│   ├── core/        # Dominio puro: guion, análisis. SIN DOM, SIN Electron.
│   │   └── vendor-v1/   ← código v1 sincronizado (SOLO LECTURA, lo escribe tools/sync-from-v1)
│   ├── a11y/        # Anuncios, foco, roving tabindex — como paquete reutilizable
│   ├── ui/          # Tokens de docs/design.md + componentes (vanilla)
│   └── platform/    # Puertos (fs, diálogos, export) + adaptadores electron/ y web/
├── apps/
│   ├── desktop/     # Shell Electron mínimo y seguro
│   └── web/         # Shell PWA — el peldaño Mac/web/Android de la escalera
├── tools/
│   ├── sync-from-v1.js   # trae engine/analysis/libs de la v1 con checksums
│   └── build-web.js      # bundlea core+ui para el shell web (esbuild)
├── landing/         # La página de venta (CONFIG editable: links de MercadoPago, email)
└── docs/
    ├── arquitectura.md   # reglas de dependencia y decisiones
    ├── migracion.md      # orden de estrangulamiento y criterios de done
    ├── research-competitivo.md · voces.md · lanzador.md
    ├── checklist-nvda-2.0.md # el paso humano del gate
    └── test/             # kit del test de 2 semanas (plan, protocolo, guía de sesión,
                          #  mensajes de outreach, métricas, entrega de licencias)
```

## Reglas de oro

1. **`vendor-v1/` no se edita jamás.** Se regenera con `npm run sync`. Si algo de la v1
   necesita cambiar, se cambia EN la v1 (que tiene los tests) y se re-sincroniza.
2. **`core` no conoce el DOM ni Electron.** Si un archivo de core importa `document`
   o `electron`, está mal ubicado.
3. **Dirección de dependencia:** `apps → ui/a11y/platform → core`. Nunca al revés.
4. **Un módulo se estrangula solo con sus tests portados primero** (ver docs/migracion.md).
5. **La validación manda:** mientras corra el test de 2 semanas de la v1, este repo
   avanza solo en horas muertas. La v1 es la que paga las cuentas.

## Empezar

```bash
npm install          # una vez (esbuild + electron + electron-builder)
npm run sync         # trae el motor v1 (ajustá V1_DIR si moviste la carpeta)
npm test             # motor v1 en el core nuevo + a11y + registro de skins
npm run contrast     # 108 pares AA sobre los 9 skins (rojo = no se lanza)
npm run build:web    # bundlea core para los shells
npm run start:desktop  # abre el shell Electron (arranque sin flash, selector de 9 skins)
npm run dist         # instalador NSIS según docs/lanzador.md (tests+contraste primero)
```
