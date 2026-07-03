'use strict';
/* Tests de @capychad/a11y en Node puro (mini-doc inyectado, como los tests de la v1). */
const assert = require('assert');
const A = require('../src');

let n = 0;
const ok = (name, fn) => { fn(); n++; console.log('  ✓ ' + name); };

function miniDoc() {
  const els = [];
  return {
    createElement() {
      const el = { attrs: {}, style: {}, textContent: '', setAttribute(k, v) { this.attrs[k] = v; } };
      return el;
    },
    body: { appendChild(el) { els.push(el); return el; } },
    _els: els
  };
}

ok('makeAnnouncer crea regiones polite y assertive una sola vez', () => {
  const doc = miniDoc();
  const a = A.makeAnnouncer(doc);
  a._regions(); a._regions();
  assert.strictEqual(doc._els.length, 2);
  assert.strictEqual(doc._els[0].attrs['aria-live'], 'polite');
  assert.strictEqual(doc._els[1].attrs['aria-live'], 'assertive');
});

ok('announce escribe en la región correcta según urgencia', (done) => {
  const doc = miniDoc();
  const a = A.makeAnnouncer(doc);
  const p = a.announce('Guion exportado.');
  const s = a.announce('No se pudo exportar.', true);
  assert.strictEqual(p.attrs['aria-live'], 'polite');
  assert.strictEqual(s.attrs['aria-live'], 'assertive');
});

ok('rovingNext replica el patrón v1 (flechas circulares, Home/End)', () => {
  assert.strictEqual(A.rovingNext(0, 'ArrowRight', 5), 1);
  assert.strictEqual(A.rovingNext(4, 'ArrowRight', 5), 0);
  assert.strictEqual(A.rovingNext(0, 'ArrowLeft', 5), 4);
  assert.strictEqual(A.rovingNext(2, 'Home', 5), 0);
  assert.strictEqual(A.rovingNext(2, 'End', 5), 4);
  assert.strictEqual(A.rovingNext(2, 'a', 5), 2);
  assert.strictEqual(A.rovingNext(0, 'ArrowRight', 0), -1);
});

console.log('a11y/announce: ' + n + '/3 OK');
