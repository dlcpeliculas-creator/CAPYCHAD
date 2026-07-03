'use strict';
/* Tests del registro de skins: catálogo completo, default correcto, aplicar/persistir con DI. */
const assert = require('assert');
const S = require('../src/skins.js');

let n = 0;
const ok = (name, fn) => { fn(); n++; console.log('  ✓ ' + name); };

ok('catálogo completo: 9 skins, piedra es el default y es claro', () => {
  const l = S.list();
  assert.strictEqual(l.length, 9);
  const d = l.filter(x => x.isDefault);
  assert.strictEqual(d.length, 1);
  assert.strictEqual(d[0].id, 'piedra');
  assert.strictEqual(d[0].mode, 'light');
});

ok('cada skin declara los 11 tokens de color', () => {
  const keys = ['background','surface','surfaceAlt','text','textSecondary','textMuted','primary','onPrimary','primaryHover','border','borderStrong'];
  for (const [id, s] of Object.entries(S.SKINS)) {
    for (const k of keys) assert.ok(/^#[0-9A-F]{6}$/i.test(s[k]), id + ' define ' + k);
  }
});

ok('applySkin escribe data-skin y persiste (DI, sin navegador)', () => {
  let attr = null, stored = {};
  const doc = { documentElement: { setAttribute: (k, v) => { attr = k + '=' + v; } } };
  const storage = { setItem: (k, v) => { stored[k] = v; }, getItem: (k) => stored[k] };
  assert.strictEqual(S.applySkin('cinema', { doc, storage }), 'cinema');
  assert.strictEqual(attr, 'data-skin=cinema');
  assert.strictEqual(S.savedSkin(storage), 'cinema');
});

ok('un skin inválido cae al default (nunca rompe)', () => {
  let attr = null;
  const doc = { documentElement: { setAttribute: (k, v) => { attr = v; } } };
  const storage = { setItem: () => {}, getItem: () => 'no-existe' };
  assert.strictEqual(S.applySkin('no-existe', { doc, storage }), 'piedra');
  assert.strictEqual(attr, 'piedra');
  assert.strictEqual(S.savedSkin(storage), 'piedra');
});

console.log('ui/skins: ' + n + '/4 OK');
