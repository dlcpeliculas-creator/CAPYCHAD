'use strict';
/* El test que valida la promesa del estrangulador: el motor v1 corre INTACTO
   dentro del core nuevo. Fountain → paras → FDX → paras → Fountain, estable. */
const assert = require('assert');
const core = require('../src');

let n = 0;
const ok = (name, fn) => { fn(); n++; console.log('  ✓ ' + name); };

const FOUNTAIN = [
  'INT. COCINA — NOCHE',
  '',
  'Marcos escucha el anuncio del lector.',
  '',
  'MARCOS',
  '(orgulloso)',
  'Lo escribí yo. De punta a punta.',
  '',
  'CORTE A:'
].join('\n');

ok('el motor v1 vive dentro del core (vendor sincronizado)', () => {
  assert.strictEqual(core.engine._vendor, 'v1');
  assert.ok(Array.isArray(core.engine.TYPES) && core.engine.TYPES.length >= 10);
});

ok('fountain → paragraphs: detecta escena, personaje, paréntesis, diálogo y transición', () => {
  const paras = core.engine.fountainToParagraphs(FOUNTAIN);
  const types = paras.map(p => p.type);
  assert.ok(types.indexOf('Scene Heading') >= 0);
  assert.ok(types.indexOf('Character') >= 0);
  assert.ok(types.indexOf('Parenthetical') >= 0);
  assert.ok(types.indexOf('Dialogue') >= 0);
  assert.ok(types.indexOf('Transition') >= 0);
});

ok('roundtrip Fountain → FDX → paragraphs: estructura estable', () => {
  const p1 = core.engine.fountainToParagraphs(FOUNTAIN);
  const fdx = core.engine.paragraphsToFdx(p1);
  assert.ok(fdx.indexOf('<FinalDraft') >= 0);
  const p2 = core.engine.fdxToParagraphs(fdx);
  assert.deepStrictEqual(p2.map(p => p.type), p1.map(p => p.type), 'tipos estables tras FDX');
  assert.ok(p2.some(p => p.text.indexOf('Lo escribí yo') >= 0), 'conserva el diálogo');
});

ok('roundtrip conserva acentos y mayúsculas del español', () => {
  const p1 = core.engine.fountainToParagraphs('INT. CAFÉ - DÍA\n\nAna sonríe.');
  const back = core.engine.paragraphsToFountain(p1);
  assert.ok(back.indexOf('CAFÉ') >= 0 && back.indexOf('DÍA') >= 0);
});

ok('modelo nativo interopera con el motor v1 (primera pieza estrangulada)', () => {
  const model = core.model;
  const paras = [
    model.paragraph('Scene Heading', 'INT. COCINA — NOCHE', { number: 1 }),
    model.paragraph('Action', 'Marcos escucha.'),
    model.paragraph('Character', 'MARCOS'),
    model.paragraph('Dialogue', 'Lo escribí yo.')
  ];
  assert.strictEqual(model.sceneCount(paras), 1);
  const fdx = core.engine.paragraphsToFdx(paras);   // el motor v1 consume el modelo nativo
  assert.ok(fdx.indexOf('MARCOS') >= 0);
  let threw = false; try { model.paragraph('Inventado', 'x'); } catch (e) { threw = true; }
  assert.ok(threw, 'el modelo rechaza tipos inválidos');
});

console.log('core/engine.roundtrip: ' + n + '/5 OK');
