'use strict';
/* @capychad/ui · prefs — LA PERSONALIZACIÓN COMO SISTEMA.
   Regla de la casa: agregar una preferencia nueva = agregar UNA entrada a REGISTRY.
   El panel de Personalización se autogenera desde acá, la persistencia es automática,
   y cada cambio se anuncia — así respondemos en días (no meses) a lo que pidan los
   usuarios, videntes o no videntes. Ese es el contrato con el feedback in-app. */

const REGISTRY = [
  { id: 'a11yMode', label: 'Modo no vidente', type: 'toggle', default: true,
    attr: 'data-a11y', attrValue: 'on',
    describe: 'Lectura de cursor SIEMPRE activa: cada línea a la que llegás se anuncia con su tipo. Viene activado de fábrica; desactivalo solo si no usás lector de pantalla.' },

  { id: 'skin', label: 'Skin', type: 'select', default: 'piedra',
    options: [
      ['piedra', 'Piedra y papel · claro (default)'], ['cinema', 'Cinema · oscuro'],
      ['editorial', 'Editorial · claro'], ['brutalista', 'Brutalista · claro'],
      ['industrial', 'Industrial · oscuro'], ['inmersivo', 'Inmersivo · oscuro'],
      ['maximalista', 'Maximalista · claro'], ['patagonia', 'Patagonia · claro'],
      ['corporativo', 'Corporativo · claro']
    ],
    attr: 'data-skin',
    describe: 'Cambia los colores de toda la app. Los 9 pasan la auditoría de contraste.' },

  { id: 'fontScale', label: 'Tamaño del texto', type: 'select', default: '0',
    options: [['0', 'Normal'], ['1', 'Grande (A+)'], ['2', 'Muy grande (A++)']],
    attr: 'data-fontscale',
    describe: 'Agranda la interfaz y la hoja. Se recuerda entre sesiones.' },

  { id: 'highContrast', label: 'Alto contraste (AAA)', type: 'toggle', default: false,
    attr: 'data-contrast', attrValue: 'high',
    describe: 'Negro, blanco y amarillo por encima de cualquier skin. Atajo: Alt+Shift+H.' },

  { id: 'typewriter', label: 'Modo máquina de escribir', type: 'toggle', default: false,
    attr: 'data-typewriter', attrValue: 'on',
    describe: 'Mantiene la línea que escribís siempre centrada en la pantalla.' },

  { id: 'announceVerbosity', label: 'Detalle de los anuncios de voz', type: 'select', default: 'alta',
    options: [['alta', 'Alto — anuncia cada cambio'], ['media', 'Medio — solo cambios de tipo'], ['baja', 'Bajo — solo confirmaciones']],
    attr: 'data-verbosity',
    describe: 'Cuánto habla la app con tu lector de pantalla.' },

  { id: 'selfVoice', label: 'Voz propia (hablar sin lector de pantalla)', type: 'toggle', default: false,
    describe: 'La app lee sus propios avisos con la voz del sistema, sin necesitar NVDA. Pensada para quien recién pierde la visión o todavía no instaló un lector. Si usás NVDA, dejala apagada: evita voces dobles.' },

  { id: 'motion', label: 'Animaciones', type: 'select', default: 'sistema',
    options: [['sistema', 'Según el sistema'], ['reducidas', 'Reducidas siempre']],
    attr: 'data-motion', map: { sistema: '', reducidas: 'reduce' },
    describe: 'Reducidas apaga toda transición, sin depender de la configuración de Windows.' },

  { id: 'readRate', label: 'Velocidad de la Lectura', type: 'select', default: '1',
    options: [['0.85', 'Pausada'], ['1', 'Normal'], ['1.15', 'Ágil'], ['1.35', 'Rápida']],
    describe: 'La velocidad del table read (Lectura): una voz por personaje y narrador.' },

  { id: 'telemetry', label: 'Enviar reportes de errores anónimos', type: 'toggle', default: false,
    describe: 'Si la app falla, envía el reporte técnico — sin tus guiones ni datos personales. Apagado de fábrica; nada sale de tu computadora sin este permiso.' }
];

const STORAGE_KEY = 'capychad2_prefs';

function make(deps) {
  deps = deps || {};
  const doc = deps.doc || (typeof document !== 'undefined' ? document : null);
  const storage = deps.storage || (typeof localStorage !== 'undefined' ? localStorage : null);
  const announce = deps.announce || function () {};
  const hooks = deps.hooks || {};        // { skin: fn(value), typewriter: fn(value), ... }
  const listeners = [];

  function defaults() {
    const o = {};
    REGISTRY.forEach(p => { o[p.id] = p.default; });
    return o;
  }
  function load() {
    try {
      const raw = storage && storage.getItem(STORAGE_KEY);
      return Object.assign(defaults(), raw ? JSON.parse(raw) : {});
    } catch (e) { return defaults(); }
  }
  let state = load();

  function persist() { try { if (storage) storage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {} }

  function applyOne(p, value) {
    if (!doc || !doc.documentElement || !p.attr) return;
    const el = doc.documentElement;
    let v = value;
    if (p.map) v = p.map[value] != null ? p.map[value] : value;
    if (p.type === 'toggle') v = value ? (p.attrValue || 'on') : '';
    if (v === '' || v === false || v == null) el.removeAttribute(p.attr);
    else el.setAttribute(p.attr, String(v));
  }
  function applyAll() { REGISTRY.forEach(p => applyOne(p, state[p.id])); }

  const api = {
    registry: () => REGISTRY.map(p => Object.assign({}, p)),
    get: (id) => state[id],
    all: () => Object.assign({}, state),
    set(id, value, opts2) {
      const p = REGISTRY.find(x => x.id === id);
      if (!p) return false;
      state[id] = value;
      persist();
      applyOne(p, value);
      if (hooks[id]) { try { hooks[id](value); } catch (e) {} }
      if (!(opts2 && opts2.silent)) {
        const shown = p.type === 'toggle'
          ? (value ? 'activado' : 'desactivado')
          : ((p.options || []).find(o => o[0] === String(value)) || [null, value])[1];
        announce(p.label + ': ' + shown + '.');
      }
      listeners.forEach(fn => { try { fn(id, value); } catch (e) {} });
      return true;
    },
    reset() {
      state = defaults(); persist(); applyAll();
      /* Issue #1 del checklist (fundador): tras restablecer, el usuario no vidente tiene
         que saber EN QUÉ QUEDÓ TODO — se anuncia el estado resultante completo, no solo
         "restablecida". El detalle alto y el modo no vidente son el default garantizado. */
      announce('Personalización restablecida: modo no vidente activo, anuncios en detalle alto, skin Piedra y papel, texto tamaño normal, voz propia apagada.');
    },
    apply: applyAll,
    onChange(fn) { listeners.push(fn); }
  };
  return api;
}

module.exports = { make, REGISTRY, STORAGE_KEY };
