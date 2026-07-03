'use strict';
/* @capychad/ui · wiki — LA DOCUMENTACIÓN COMO SISTEMA (mandato del fundador).
   Contrato de la casa: cada función que entra a la app agrega SU entrada acá
   — {id, title, resumen (1 línea), accion (cómo se usa), atajos} — y con eso
   aparece sola en la Ayuda in-app (F1) y en el manual HTML del navegador.
   Una feature sin entrada de wiki no se mergea (regla en docs/migracion.md). */

const ENTRIES = [
  { id: 'editor', title: 'El editor de guion',
    resumen: 'Escribís con formato de industria automático: la app pone márgenes, mayúsculas y tipos por vos.',
    accion: 'Escribí normalmente. Enter crea el elemento que sigue según la lógica del guion (después de un personaje viene su diálogo). Tab cambia el tipo del bloque actual y lo anuncia; Shift+Tab va para atrás. Los tipos en mayúsculas (encabezado, personaje, transición) se convierten solos.',
    atajos: [['Enter', 'siguiente elemento lógico'], ['Tab / Shift+Tab', 'cambiar tipo de elemento'], ['Backspace en bloque vacío', 'unir con el anterior']] },

  { id: 'cursor', title: 'Lectura de cursor (modo no vidente)',
    resumen: 'Cada línea a la que llegás se anuncia con su texto y su tipo — siempre activa en modo no vidente.',
    accion: 'Movete con las flechas arriba/abajo entre bloques: la app anuncia por ejemplo "MARCOS — Personaje" o "Vacío — Acción". Viene activada de fábrica; se controla con la preferencia "Modo no vidente" en Personalización.',
    atajos: [['↑ / ↓', 'navegar bloques con anuncio']] },

  { id: 'lectura', title: 'Lectura (table read)',
    resumen: 'Escuchá tu guion interpretado: una voz por personaje y un narrador para acción y encabezados.',
    accion: 'Tocá Lectura o Alt+Shift+L. La app reparte las voces en español disponibles entre tus personajes, resalta la línea que suena y la sigue por la hoja. La velocidad se elige en Personalización. Hoy usa las voces del sistema; las voces nativas de alta calidad (Piper y Kokoro) llegan como descarga opcional — ver docs/voces.md.',
    atajos: [['Alt+Shift+L', 'iniciar / detener'], ['Espacio', 'pausar y reanudar'], ['Escape', 'detener']] },

  { id: 'personalizacion', title: 'Personalización',
    resumen: 'Todo el entorno se adapta a vos: skin, tamaño de texto, contraste, anuncios y más — y se recuerda.',
    accion: 'Abrí Personalización (Alt+Shift+P). Cada cambio se aplica al instante y se anuncia. Incluye: 9 skins auditados, tamaño de texto A/A+/A++, alto contraste AAA, modo máquina de escribir (línea siempre centrada), detalle de los anuncios de voz, voz propia (la app lee sus avisos sin necesitar lector — ideal si todavía no usás NVDA), animaciones y velocidad de la Lectura. ¿Falta una opción? Pedila en Comentarios: agregarla es nuestro trabajo más barato, a propósito.',
    atajos: [['Alt+Shift+P', 'abrir Personalización'], ['Alt+Shift+H', 'alto contraste directo']] },

  { id: 'skins', title: 'Los 9 skins',
    resumen: 'Nueve pieles de color — de Piedra y papel a Cinema o Brutalista — todas con contraste AA verificado.',
    accion: 'En Personalización → Skin. Un skin cambia solo colores: tus atajos, el lector de pantalla y la hoja Courier funcionan idéntico en los nueve. El claro por defecto es Piedra y papel; el oscuro de marca es Cinema.',
    atajos: [] },

  { id: 'guardado', title: 'Autoguardado y restauración',
    resumen: 'Todo lo que escribís se guarda solo en tu computadora — la pérdida máxima de trabajo es un minuto.',
    accion: 'No hace falta guardar: la app persiste tu guion segundos después de cada cambio, con un respaldo del guardado anterior. Al reabrir, tu último guion se restaura solo y se anuncia. Ctrl+S guarda al instante y lo confirma por voz. Todo queda en tu equipo: no hay nube.',
    atajos: [['Ctrl+S', 'guardar ahora (anunciado)']] },

  { id: 'abrir-exportar', title: 'Abrir y exportar',
    resumen: 'Entra y sale en formatos de industria: Fountain, Final Draft (.fdx) y texto.',
    accion: 'Abrir carga .fountain, .fdx o .txt. Exportar guarda tu guion en Fountain (el estándar abierto). Al exportar, la app anuncia el resultado y la carpeta; si cancelás, lo dice y te devuelve al texto. Tus archivos viven en TU computadora — no hay nube.',
    atajos: [] },

  { id: 'tutorial', title: 'Tutorial de voz (primera escena)',
    resumen: 'Cuatro pasos hablados para escribir tu primera escena: encabezado, acción, personaje y diálogo.',
    accion: 'Iniciá con Alt+Shift+T. El tutorial avanza cuando realmente escribiste cada cosa (no por tiempo) y podés salir con Escape en cualquier momento. Dura menos de dos minutos.',
    atajos: [['Alt+Shift+T', 'iniciar tutorial'], ['Escape', 'salir']] },

  { id: 'comentarios', title: 'Comentarios (feedback)',
    resumen: 'Pedí cambios sin salir de la app — los reportes de accesibilidad van primero en la cola, siempre.',
    accion: 'Abrí con Alt+Shift+F. Elegí el tipo (Accesibilidad es prioridad alta), contá qué necesitás y enviá. El reporte incluye tu configuración para reproducirlo — jamás tu guion — y queda guardado aunque no haya internet.',
    atajos: [['Alt+Shift+F', 'abrir Comentarios']] },

  { id: 'nvda', title: 'NVDA — el lector de pantalla',
    resumen: 'CAPYCHAD está hecho para NVDA, el lector gratuito de NV Access — y te lo ofrecemos desde el instalador.',
    accion: 'NVDA es un programa aparte: arrancalo primero (Ctrl+Alt+N) y después abrí CAPYCHAD; todo lo que reciba foco se lee — la app detecta el lector y lo confirma al arrancar. La pantalla final del instalador y la bienvenida tienen el enlace de descarga oficial (nvaccess.org). Consejo: en NVDA, Insert+N → Preferencias → Voz → sintetizador Windows OneCore para una voz en español natural. Dos aliados más: Windows 11 trae Acceso por voz en español (decí "hacer clic en Lectura" y controlás CAPYCHAD sin manos), y el add-on gratuito TesseractOCR de NVDA reconoce guiones escaneados en PDF, sin internet.',
    atajos: [['Ctrl+Alt+N', 'iniciar NVDA (atajo de su instalador)'], ['Insert+S', 'silenciar/activar la voz de NVDA']] },

  { id: 'privacidad', title: 'Privacidad y reportes de errores',
    resumen: 'Tus guiones viven en tu computadora. Nada sale sin tu permiso explícito — los reportes de errores están apagados de fábrica.',
    accion: 'Si querés ayudar, activá "Enviar reportes de errores anónimos" en Personalización: si la app falla, se envía solo el detalle técnico del error — jamás tu guion, tus archivos ni tu nombre. Podés apagarlo cuando quieras. Los Comentarios (Alt+Shift+F) también guardan una copia local que no se pierde sin internet.',
    atajos: [] },

  { id: 'ayuda', title: 'Esta Ayuda',
    resumen: 'El manual vive dentro de la app y crece con cada función nueva.',
    accion: 'F1 abre la Ayuda in-app, navegable con el lector. "Abrir manual en el navegador" genera esta misma guía como página HTML por si preferís leerla afuera o imprimirla.',
    atajos: [['F1', 'abrir Ayuda']] }
];

function validate() {
  const errs = [];
  ENTRIES.forEach(e => {
    ['id', 'title', 'resumen', 'accion'].forEach(k => { if (!e[k] || !String(e[k]).trim()) errs.push(e.id + ' sin ' + k); });
    if (!Array.isArray(e.atajos)) errs.push(e.id + ' sin lista de atajos');
    if (e.resumen && e.resumen.length > 160) errs.push(e.id + ': resumen demasiado largo (' + e.resumen.length + ')');
  });
  return errs;
}

function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

/* Manual HTML self-contained (Piedra y papel, accesible, sin dependencias). */
function renderHtml(opts) {
  opts = opts || {};
  const version = opts.version || '';
  const nav = ENTRIES.map(e => '<li><a href="#w-' + e.id + '">' + esc(e.title) + '</a></li>').join('');
  const body = ENTRIES.map(e =>
    '<section id="w-' + e.id + '" aria-labelledby="h-' + e.id + '">' +
    '<h2 id="h-' + e.id + '">' + esc(e.title) + '</h2>' +
    '<p class="resumen">' + esc(e.resumen) + '</p>' +
    '<p>' + esc(e.accion) + '</p>' +
    (e.atajos.length
      ? '<table><caption>Atajos</caption><tbody>' +
        e.atajos.map(a => '<tr><th scope="row"><kbd>' + esc(a[0]) + '</kbd></th><td>' + esc(a[1]) + '</td></tr>').join('') +
        '</tbody></table>'
      : '') +
    '</section>').join('\n');
  return '<!DOCTYPE html>\n<html lang="es"><head><meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<title>CAPYCHAD — Manual</title><style>' +
    'body{margin:0;background:#EAE8E1;color:#26221D;font:400 16px/1.6 "Segoe UI",system-ui,sans-serif}' +
    'header,main{max-width:46rem;margin:0 auto;padding:24px}' +
    'h1{font:700 26px/1.25 Georgia,serif}h1 span{color:#A23C1F}' +
    'h2{font:700 20px/1.3 Georgia,serif;margin:0 0 6px}' +
    'nav{background:#FFFFFF;border:1px solid #CFCBC0;border-radius:12px;padding:12px 20px}' +
    'nav ul{margin:0;padding-left:18px}a{color:#A23C1F}' +
    'section{background:#FFFFFF;border:1px solid #CFCBC0;border-radius:12px;padding:20px;margin:16px 0;box-shadow:0 3px 12px rgba(38,34,29,.14)}' +
    '.resumen{color:#5C5142;font-weight:600;margin:0 0 8px}' +
    'table{border-collapse:collapse;margin-top:10px}caption{text-align:left;font-weight:600;padding-bottom:4px}' +
    'th,td{text-align:left;padding:4px 12px 4px 0;vertical-align:top}' +
    'kbd{background:#E3E0D8;border:1px solid #A39B8C;border-radius:6px;padding:1px 8px;font:inherit;white-space:nowrap}' +
    ':focus-visible{outline:3px solid #A23C1F;outline-offset:2px}' +
    '</style></head><body>' +
    '<header><h1>CAPY<span>CHAD</span> — Manual</h1>' +
    '<p>Cada función, explicada en corto: qué hace y cómo se usa.' + (version ? ' Versión ' + esc(version) + '.' : '') + '</p>' +
    '<nav aria-label="Índice"><ul>' + nav + '</ul></nav></header>' +
    '<main>' + body + '</main></body></html>';
}

module.exports = { ENTRIES, validate, renderHtml };
