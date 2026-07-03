'use strict';
/* Tests del editor-core — el smoke del camino mágico portado a la 2.0 (patrón v1: Node puro). */
const assert = require('assert');
const Ed = require('../src/editor-core.js');
const path = require('path');

let n = 0;
const ok = (name, fn) => { fn(); n++; console.log('  ✓ ' + name); };

ok('nace con un encabezado vacío y foco en él', () => {
  const e = Ed.make();
  assert.strictEqual(e.current().t, 'scene_heading');
  assert.strictEqual(e.isEmpty(), true);
});

ok('los tipos UPPER fuerzan mayúsculas (encabezado, personaje, transición)', () => {
  const e = Ed.make();
  e.setText('int. cocina — noche');
  assert.strictEqual(e.current().text, 'INT. COCINA — NOCHE');
});

ok('Enter sigue el tipo lógico (NEXT) y lo anuncia en español', () => {
  const msgs = [];
  const e = Ed.make({ announce: m => msgs.push(m) });
  e.setText('INT. COCINA — NOCHE');
  assert.strictEqual(e.enter(), 'action');          // encabezado → acción
  assert.strictEqual(msgs[msgs.length - 1], 'Acción');
  e.setText('Marcos escucha.');
  e.enter();                                        // acción → acción
  e.setType('character');
  assert.strictEqual(msgs[msgs.length - 1], 'Personaje');
  e.setText('marcos');
  assert.strictEqual(e.current().text, 'MARCOS');
  assert.strictEqual(e.enter(), 'dialogue');        // personaje → diálogo
  assert.strictEqual(msgs[msgs.length - 1], 'Diálogo');
});

ok('Tab cicla los tipos en orden (y Shift+Tab al revés), anunciando cada uno', () => {
  const msgs = [];
  const e = Ed.make({ announce: m => msgs.push(m) });
  assert.strictEqual(e.cycleType(1), 'action');
  assert.strictEqual(e.cycleType(1), 'character');
  assert.strictEqual(msgs.join('|'), 'Acción|Personaje');
  assert.strictEqual(e.cycleType(-1), 'action');
  assert.strictEqual(e.cycleType(-1), 'scene_heading');
});

ok('backspace en bloque vacío une con el anterior; nunca deja la hoja sin bloques', () => {
  const e = Ed.make();
  e.setText('INT. COCINA — NOCHE');
  e.enter();
  assert.strictEqual(e.backspaceJoin(), true);
  assert.strictEqual(e.blocks().length, 1);
  assert.strictEqual(e.backspaceJoin(), false);     // con texto o en 0, no borra
});

ok('roundtrip con el MOTOR V1: core-editor → paragraphs → FDX → paragraphs → core-editor', () => {
  process.env.V1_DIR = process.env.V1_DIR || '';
  const engine = require(path.join(__dirname, '..', '..', 'core', 'src', 'engine'));
  const e = Ed.make();
  e.setText('INT. COCINA — NOCHE'); e.enter();
  e.setText('Marcos escucha el anuncio.'); e.enter();
  e.setType('character'); e.setText('MARCOS'); e.enter();
  e.setText('Lo escribí yo.');
  const paras = e.toParagraphs();
  assert.deepStrictEqual(paras.map(p => p.type), ['Scene Heading', 'Action', 'Character', 'Dialogue']);
  const fdx = engine.paragraphsToFdx(paras);
  const back = engine.fdxToParagraphs(fdx);
  const e2 = Ed.make();
  e2.fromParagraphs(back);
  assert.deepStrictEqual(e2.blocks().map(b => b.t), ['scene_heading', 'action', 'character', 'dialogue']);
  assert.ok(e2.blocks()[3].text.indexOf('Lo escribí yo') >= 0);
});

ok('placeholders y etiquetas en español para cada tipo (contrato del binding y de NVDA)', () => {
  const e = Ed.make();
  Ed.ORDER.forEach(t => {
    assert.ok(e.label(t).length >= 4, 'label ' + t);
    assert.ok(e.placeholder(t).length >= 4, 'placeholder ' + t);
  });
});

ok('lectura de cursor: cada línea se anuncia con su texto y tipo (modo no vidente)', () => {
  const e = Ed.make();
  e.setText('INT. COCINA — NOCHE');
  assert.strictEqual(e.lineAnnouncement(), 'INT. COCINA — NOCHE — Encabezado');
  e.enter();
  assert.strictEqual(e.lineAnnouncement(), 'Vacío — Acción');
  e.setType('character'); e.setText('MARCOS');
  assert.strictEqual(e.lineAnnouncement(), 'MARCOS — Personaje');
});

console.log('ui/editor-core: ' + n + '/8 OK');
