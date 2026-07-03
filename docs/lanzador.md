# El lanzador — estándar del instalador y del arranque

La primera impresión de una "empresa seria" no es la landing: es el .exe. Este documento
fija el estándar del instalador/lanzador de CAPYCHAD 2.0 y cómo se compara con la competencia.

## Contra qué competimos

| | Final Draft | WriterDuet / Arc | CAPYCHAD 2.0 |
|---|---|---|---|
| Instalación | Instalador pesado, suele pedir **admin**, activación por cuenta | Principalmente web; desktop = wrapper | NSIS **sin admin** (per-user), sin cuenta, sin activación online |
| Accesibilidad del instalador | No verificada con lector | n/a | **Verificada con NVDA paso a paso** (checklist A del flujo ciego) — nadie más lo hace |
| Updates | Manuales / notificación | Automáticos (web) | **Diferenciales y silenciosos** (blockmap): baja solo lo que cambió, avisa y aplica al reiniciar |
| Desinstalación | Deja restos | n/a | Limpia el programa; **jamás toca tus guiones** ni la carpeta de datos (deleteAppDataOnUninstall: false) |
| Integridad | — | — | **SHA-256 publicados** con cada release + zip portable |
| Arranque | Splash largo | Carga web | **Sin flash blanco**: ventana nace con el color de la piedra y aparece lista (ready-to-show) |

## Los 10 puntos del estándar (checklist de release)

1. **Sin admin.** `perMachine: false` — instala en el perfil del usuario. Nunca UAC salvo que el usuario elija Archivos de Programa.
2. **Accesible.** El instalador NSIS se recorre completo con NVDA (checklist A de `app/docs/mvp-test/checklist-flujo-ciego.md`). Nada de pantallas gráficas custom sin texto.
3. **Elección respetada.** `oneClick: false` + carpeta elegible — instalación asistida pero de 3 pantallas, no 8.
4. **Liviano.** Instalador < 150 MB. Las voces Piper se descargan aparte (opt-in), no infladas en el .exe.
5. **Updates diferenciales.** `differentialPackage: true` + electron-updater: el update baja deltas, avisa con lenguaje claro ("Hay una versión nueva — se aplica al reiniciar") y nunca interrumpe una sesión de escritura.
6. **Desinstalación honesta.** Se lleva el programa; los guiones, la licencia y las preferencias del usuario quedan. Un desinstalador que borra trabajo ajeno es un bug de confianza.
7. **Integridad verificable.** SHA-256 de cada artefacto publicado en el Release (script checksums heredado de la v1) + zip portable para quien no quiere instalador.
8. **Arranque pulcro.** `show:false` + `backgroundColor` de marca + `ready-to-show`: la primera pintura ya es CAPYCHAD, nunca un rectángulo blanco. Menú oculto por defecto (Alt lo muestra).
9. **Primer arranque accesible.** El lanzador entrega a la bienvenida con modo accesible activo por defecto (herencia v1) — del doble clic al editor sin ver la pantalla.
10. **Rollback siempre posible.** Todos los instaladores anteriores quedan en Releases; volver atrás es descargar y ejecutar.
11. **NVDA ofrecido de fábrica.** La pantalla final del instalador incluye "Descargar NVDA — lector de pantalla gratuito" (checkbox, abre la página oficial de NV Access), y la bienvenida de la app repite la oferta. Ningún instalador del género lo hace: es la puerta de entrada de nuestro mercado. NVDA no se empaqueta (GPL, updates propios) — se ofrece la descarga oficial.

## SmartScreen y firma de código (el plan honesto)

Sin firma, Windows muestra "aplicación desconocida" — la peor primera impresión posible.

- **Hoy (validación):** instrucciones claras en la landing y el email de licencia: "Más información → Ejecutar de todas formas", con captura. Checksums publicados como compensación de confianza.
- **Al validar (≥25 ventas):** firma con **Azure Trusted Signing** (~USD 10/mes, persona jurídica o individual con verificación) — reputación SmartScreen inmediata. Alternativa: certificado OV clásico (~USD 100/año, reputación gradual).
- **Regla:** ninguna campaña de marketing grande antes de firmar. La cuña accesible puede convivir con el aviso (comunidad temprana tolera); el público general no.

## Configuración

Vive en `package.json > build` (raíz del monorepo): NSIS per-user con differential package,
target zip portable, publish → GitHub Releases (TRUEGOTDF). Falta humano: `build/icon.ico`
(256px multi-res) y — cuando exista — el certificado. `npm run dist` corre tests + contraste
+ bundle antes de empaquetar: un instalador jamás se genera con la suite en rojo.
