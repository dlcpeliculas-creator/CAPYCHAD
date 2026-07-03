'use strict';
/* Tests del módulo de feedback: prioridad accesible, contexto, guardado local resiliente. */
const assert = require('assert');
const F = require('../src/feedback.js');

let n = 0;
const ok = (name, fn) => { const r = fn(); n++; console.log('  ✓ ' + name); return r; };

ok('accesibilidad es la primera categoría y se marca prioridad alta', () => {
  assert.strictEqual(F.CATEGORIES[0][0], 'accesibilidad');
  const f = F.make({ now: () => 'T' });
  const b = f.build({ message: 'El export no anuncia la carpeta', category: 'accesibilidad' });
  assert.strictEqual(b.report.priority, 'alta');
});

ok('el reporte lleva contexto técnico automático (skin, prefs, versión)', () => {
  const f = F.make({ now: () => 'T', context: () => ({ skin: 'cinema', fontScale: '1', version: '0.1.0', nvda: true }) });
  const b = f.build({ message: 'x', category: 'idea' });
  assert.strictEqual(b.report.context.skin, 'cinema');
  assert.strictEqual(b.report.priority, 'normal');
});

ok('mensaje vacío se rechaza con error claro', () => {
  const f = F.make();
  assert.strictEqual(f.build({ message: '   ' }).ok, false);
});

(async () => {
  await (async () => {
    let stored = null, sent = null;
    const f = F.make({ store: async r => { stored = r; }, send: async r => { sent = r; return { via: 'mailto' }; }, now: () => 'T' });
    const r = await f.submit({ message: 'Quiero un skin sepia', category: 'idea' });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.delivery, 'mailto');
    assert.strictEqual(stored.message, 'Quiero un skin sepia');
    assert.strictEqual(sent.category, 'idea');
    n++; console.log('  ✓ submit guarda localmente Y envía');
  })();

  await (async () => {
    const f = F.make({ store: async () => {}, send: async () => { throw new Error('sin red'); } });
    const r = await f.submit({ message: 'reporte offline', category: 'accesibilidad' });
    assert.strictEqual(r.ok, true);
    assert.strictEqual(r.delivery, 'stored-only');
    n++; console.log('  ✓ sin red: el reporte queda guardado y no se pierde (local-first)');
  })();

  console.log('platform/feedback: ' + n + '/5 OK');
})();
