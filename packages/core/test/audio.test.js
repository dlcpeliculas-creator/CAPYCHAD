'use strict';
/* Tests del adaptador de audio: la segmentación v1 corriendo sobre el editor nuevo. */
const assert = require('assert');
const core = require('../src');
const Ed = require('../../ui/src/editor-core.js');

let n = 0;
const ok = (name, fn) => { fn(); n++; console.log('  ✓ ' + name); };

function sampleParas() {
  const e = Ed.make();
  e.setText('INT. COCINA — NOCHE'); e.enter();
  e.setText('Marcos escucha el anuncio.'); e.enter();
  e.setType('character'); e.setText('MARCOS'); e.enter();
  e.setText('Lo escribí yo.'); e.enter();
  e.setType('transition'); e.setText('CORTE A:');
  return e.toParagraphs();
}

ok('buildSegments: el editor 2.0 alimenta al motor de audio v1 sin traducción', () => {
  const segs = core.audio.buildSegments(sampleParas());
  assert.ok(Array.isArray(segs) && segs.length >= 3);
  const roles = segs.map(s => s.role);
  assert.ok(roles.indexOf('scene') >= 0, 'el encabezado lo lee el narrador');
  assert.strictEqual(segs[0].speaker, 'NARRADOR');
});

ok('el diálogo de MARCOS lleva su nombre (voz por personaje)', () => {
  const segs = core.audio.buildSegments(sampleParas());
  const dial = segs.find(s => /Lo escribí yo/.test(s.text || ''));
  assert.ok(dial, 'existe el segmento del diálogo');
  assert.strictEqual(String(dial.speaker).toUpperCase(), 'MARCOS');
  assert.strictEqual(dial.role, 'dialogue');
});

ok('castFromSegments: narrador + personajes en orden de aparición', () => {
  const segs = core.audio.buildSegments(sampleParas());
  const cast = core.audio.castFromSegments(segs);
  assert.ok(cast.length >= 2);
  assert.ok(cast.indexOf('NARRADOR') >= 0);
  assert.ok(cast.indexOf('MARCOS') >= 0);
});

ok('opciones: solo diálogos (sin acción ni encabezados) para lectura rápida', () => {
  const segs = core.audio.buildSegments(sampleParas(), { includeAction: false, includeHeadings: false, includeParenthetical: false });
  assert.ok(segs.every(s => s.role !== 'scene'), 'sin encabezados');
  assert.ok(segs.some(s => /Lo escribí yo/.test(s.text || '')), 'los diálogos quedan');
});

console.log('core/audio: ' + n + '/4 OK');
