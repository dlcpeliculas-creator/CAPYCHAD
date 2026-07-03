'use strict';
/* Tests del sistema de personalización: registro, persistencia, atributos y anuncios. */
const assert = require('assert');
const P = require('../src/prefs.js');

let n = 0;
const ok = (name, fn) => { fn(); n++; console.log('  ✓ ' + name); };

function fakeEnv() {
  const attrs = {};
  const store = {};
  return {
    attrs, store,
    doc: { documentElement: {
      setAttribute: (k, v) => { attrs[k] = v; },
      removeAttribute: (k) => { delete attrs[k]; }
    } },
    storage: { getItem: k => store[k] || null, setItem: (k, v) => { store[k] = v; } }
  };
}

ok('el registro tiene las 6 prefs fundacionales con default y descripción', () => {
  const ids = P.REGISTRY.map(p => p.id);
  ['skin', 'fontScale', 'highContrast', 'typewriter', 'announceVerbosity', 'motion']
    .forEach(id => assert.ok(ids.indexOf(id) >= 0, 'falta ' + id));
  P.REGISTRY.forEach(p => {
    assert.ok(p.label && p.describe, p.id + ' con label y describe');
    assert.ok(p.default !== undefined, p.id + ' con default');
  });
});

ok('set() aplica el atributo, persiste y anuncia en español', () => {
  const env = fakeEnv();
  const msgs = [];
  const prefs = P.make({ doc: env.doc, storage: env.storage, announce: m => msgs.push(m) });
  prefs.set('skin', 'cinema');
  assert.strictEqual(env.attrs['data-skin'], 'cinema');
  assert.ok(msgs[msgs.length - 1].indexOf('Skin') === 0);
  const saved = JSON.parse(env.store[P.STORAGE_KEY]);
  assert.strictEqual(saved.skin, 'cinema');
});

ok('toggle activa/desactiva el atributo (alto contraste)', () => {
  const env = fakeEnv();
  const prefs = P.make({ doc: env.doc, storage: env.storage });
  prefs.set('highContrast', true);
  assert.strictEqual(env.attrs['data-contrast'], 'high');
  prefs.set('highContrast', false);
  assert.strictEqual(env.attrs['data-contrast'], undefined);
});

ok('recarga: las prefs guardadas vuelven a aplicarse (apply)', () => {
  const env = fakeEnv();
  const p1 = P.make({ doc: env.doc, storage: env.storage });
  p1.set('fontScale', '2', { silent: true });
  p1.set('typewriter', true, { silent: true });
  const env2attrs = {};
  const doc2 = { documentElement: { setAttribute: (k, v) => { env2attrs[k] = v; }, removeAttribute: (k) => { delete env2attrs[k]; } } };
  const p2 = P.make({ doc: doc2, storage: env.storage });
  p2.apply();
  assert.strictEqual(env2attrs['data-fontscale'], '2');
  assert.strictEqual(env2attrs['data-typewriter'], 'on');
});

ok('hooks: cambiar una pref dispara su integración (p. ej. skin → applySkin)', () => {
  const env = fakeEnv();
  let hooked = null;
  const prefs = P.make({ doc: env.doc, storage: env.storage, hooks: { skin: v => { hooked = v; } } });
  prefs.set('skin', 'patagonia', { silent: true });
  assert.strictEqual(hooked, 'patagonia');
});

ok('pref desconocida no rompe ni persiste basura', () => {
  const env = fakeEnv();
  const prefs = P.make({ doc: env.doc, storage: env.storage });
  assert.strictEqual(prefs.set('no-existe', 1), false);
});

ok('reset: garantiza modo no vidente activo + detalle alto, y ANUNCIA el estado completo (issue #1)', () => {
  const env = fakeEnv();
  const msgs = [];
  const prefs = P.make({ doc: env.doc, storage: env.storage, announce: m => msgs.push(m) });
  prefs.set('announceVerbosity', 'baja', { silent: true });
  prefs.set('a11yMode', false, { silent: true });
  prefs.reset();
  assert.strictEqual(prefs.get('announceVerbosity'), 'alta', 'el detalle vuelve a alto (pedido del fundador)');
  assert.strictEqual(prefs.get('a11yMode'), true, 'el modo no vidente queda activo');
  assert.strictEqual(prefs.get('selfVoice'), false, 'la voz propia queda apagada');
  const last = msgs[msgs.length - 1];
  assert.ok(/restablecida/i.test(last) && /detalle alto/i.test(last) && /no vidente activo/i.test(last),
    'el anuncio dice en qué quedó todo, no solo "restablecida"');
});

ok('voz propia (self-voicing): existe, apagada de fábrica y es conductual (sin atributo DOM)', () => {
  const p = P.REGISTRY.find(x => x.id === 'selfVoice');
  assert.ok(p, 'falta la pref selfVoice');
  assert.strictEqual(p.default, false, 'debe venir apagada: con NVDA activo serían voces dobles');
  assert.ok(!p.attr, 'no toca el DOM: la enruta el announcer del shell');
  assert.ok(/lector/i.test(p.describe), 'la descripción explica la relación con el lector');
});

console.log('ui/prefs: ' + n + '/8 OK');
