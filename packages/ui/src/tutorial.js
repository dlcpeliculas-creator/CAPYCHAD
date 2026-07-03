'use strict';
/* @capychad/ui · tutorial — el tutorial de voz de primera escena, portado de la v1
   (misma máquina de pasos, ahora escaneando editor-core en vez del DOM).
   Avanza cuando la persona ESCRIBIÓ cada cosa — nunca por tiempo. Escape sale. */

function make(opts) {
  opts = opts || {};
  const announce = opts.announce || function () {};
  const scan = opts.scan || function () { return []; };  // () => ed.blocks(): [{t, text}]
  const interval = opts.interval != null ? opts.interval : 700;

  const steps = [
    { id: 'heading', instr: 'Paso 1 de 4. Escribí un encabezado de escena. Por ejemplo: INT. COCINA, guion, NOCHE. Cuando termines, presioná Enter.',
      done: bs => bs.some(b => b.t === 'scene_heading' && (b.text || '').trim().length >= 3) },
    { id: 'action', instr: 'Paso 2 de 4. Ahora una línea de acción: contá qué se ve en la escena. Enter cuando termines.',
      done: bs => bs.some(b => b.t === 'action' && (b.text || '').trim().length >= 3) },
    { id: 'character', instr: 'Paso 3 de 4. Presioná Tab hasta escuchar Personaje, y escribí el nombre de tu personaje.',
      done: bs => bs.some(b => b.t === 'character' && (b.text || '').trim().length >= 2) },
    { id: 'dialogue', instr: 'Paso 4 de 4. Presioná Enter, y escribí lo que dice tu personaje.',
      done: bs => bs.some(b => b.t === 'dialogue' && (b.text || '').trim().length >= 2) }
  ];

  let i = -1, timer = null, active = false;

  function next() {
    i++;
    if (i >= steps.length) { finish(); return; }
    announce(steps[i].instr);
  }
  function tick() {
    if (!active) return;
    try { const bs = scan() || []; if (i >= 0 && i < steps.length && steps[i].done(bs)) next(); } catch (e) {}
  }
  function start() {
    if (active) return;
    active = true; i = -1;
    announce('Tutorial de dos minutos. Escape para salir cuando quieras.');
    next();
    if (interval > 0) timer = setInterval(tick, interval);
  }
  function stop() { active = false; if (timer) { clearInterval(timer); timer = null; } }
  function finish() {
    stop();
    announce('Tutorial completo. Ya escribiste tu primera escena: encabezado, acción, personaje y diálogo. El botón Exportar guarda tu guion con formato de industria.');
    if (opts.onDone) { try { opts.onDone(); } catch (e) {} }
  }
  function cancel() {
    if (!active) return;
    stop();
    announce('Tutorial cerrado. Podés relanzarlo con Alt Shift T.');
  }

  return { start, stop, cancel, tick, isActive: () => active, stepIndex: () => i, steps };
}

module.exports = { make };
