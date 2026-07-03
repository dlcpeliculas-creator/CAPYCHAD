'use strict';
/* @capychad/platform · feedback — la voz del usuario DENTRO de la app.
   Contrato de la casa: el feedback de accesibilidad es un bug prioritario, no una sugerencia.
   El módulo es puro (DI): arma el reporte con contexto técnico, lo guarda localmente
   (store) y lo entrega (send). El shell decide cómo enviar (archivo + mailto hoy;
   endpoint cuando exista). Atajo global: Alt+Shift+F. */

const CATEGORIES = [
  ['accesibilidad', 'Accesibilidad — algo no funciona con mi lector o teclado (prioritario)'],
  ['idea', 'Idea — algo que me gustaría que la app tenga'],
  ['problema', 'Problema — algo se rompió o no hace lo esperado'],
  ['otro', 'Otro']
];

function make(deps) {
  deps = deps || {};
  const send = deps.send || function () { return Promise.resolve({ ok: true, via: 'noop' }); };
  const store = deps.store || function () { return Promise.resolve(true); };
  const context = deps.context || function () { return {}; };
  const now = deps.now || (() => new Date().toISOString());

  function build(input) {
    input = input || {};
    const message = String(input.message || '').trim();
    if (!message) return { ok: false, error: 'empty-message' };
    const category = CATEGORIES.some(c => c[0] === input.category) ? input.category : 'otro';
    return {
      ok: true,
      report: {
        v: 1,
        ts: now(),
        category,
        priority: category === 'accesibilidad' ? 'alta' : 'normal',
        message,
        email: String(input.email || '').trim() || null,
        context: context() || {}
      }
    };
  }

  async function submit(input) {
    const b = build(input);
    if (!b.ok) return b;
    try { await store(b.report); } catch (e) { /* el guardado local nunca bloquea el envío */ }
    try {
      const r = await send(b.report);
      return { ok: true, report: b.report, delivery: r && r.via ? r.via : 'sent' };
    } catch (e) {
      /* sin red o sin cliente de correo: el reporte quedó guardado localmente */
      return { ok: true, report: b.report, delivery: 'stored-only' };
    }
  }

  return { build, submit, CATEGORIES };
}

module.exports = { make, CATEGORIES };
