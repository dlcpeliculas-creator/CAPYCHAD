'use strict';
/* Tests del wiki interno + tutorial portado. */
const assert = require('assert');
const W = require('../src/wiki.js');
const T = require('../src/tutorial.js');
const P = require('../src/prefs.js');

let n = 0;
const ok = (name, fn) => { fn(); n++; console.log('  ✓ ' + name); };

ok('wiki: toda entrada tiene id, título, resumen corto y acción (validate limpio)', () => {
  assert.deepStrictEqual(W.validate(), []);
  assert.ok(W.ENTRIES.length >= 8, 'las funciones actuales están documentadas');
});

ok('wiki: las funciones vivas del shell tienen su entrada (contrato)', () => {
  const ids = W.ENTRIES.map(e => e.id);
  ['editor', 'cursor', 'lectura', 'personalizacion', 'skins', 'guardado', 'abrir-exportar', 'tutorial', 'comentarios', 'nvda', 'privacidad', 'ayuda']
    .forEach(id => assert.ok(ids.indexOf(id) >= 0, 'falta wiki de ' + id));
});

ok('wiki: el manual HTML es self-contained, en español y navegable', () => {
  const html = W.renderHtml({ version: '0.1.0' });
  assert.ok(html.indexOf('<html lang="es">') >= 0);
  assert.ok(html.indexOf('nav aria-label="Índice"') >= 0);
  W.ENTRIES.forEach(e => assert.ok(html.indexOf('id="w-' + e.id + '"') >= 0, 'sección ' + e.id));
  assert.ok(html.indexOf('<script') < 0, 'sin JS: es un documento');
  assert.ok(html.indexOf('http') < 0 || !/src=|href="http/.test(html), 'sin recursos externos');
});

ok('wiki: los atajos documentados coinciden con los reales del shell', () => {
  const flat = W.ENTRIES.map(e => e.atajos.map(a => a[0]).join(' ')).join(' ');
  ['Alt+Shift+L', 'Alt+Shift+P', 'Alt+Shift+H', 'Alt+Shift+F', 'Alt+Shift+T', 'F1', 'Tab', 'Enter', 'Ctrl+S']
    .forEach(k => assert.ok(flat.indexOf(k) >= 0, 'atajo sin documentar: ' + k));
});

ok('wiki: la Personalización documenta lo que el registro de prefs realmente ofrece', () => {
  const texto = W.ENTRIES.find(e => e.id === 'personalizacion').accion.toLowerCase();
  assert.ok(/9 skins/.test(texto) && /alto contraste/.test(texto) && /máquina de escribir/.test(texto));
  assert.ok(/voz propia/.test(texto), 'la voz propia (self-voicing) está documentada');
  assert.ok(P.REGISTRY.length >= 8, 'el registro respalda lo prometido');
  const nvda = W.ENTRIES.find(e => e.id === 'nvda').accion;
  assert.ok(/Acceso por voz/.test(nvda) && /TesseractOCR/.test(nvda), 'los aliados del ecosistema están documentados');
});

ok('tutorial portado: avanza escribiendo de verdad y cierra en 4 pasos', () => {
  const msgs = [];
  let page = [];
  const t = T.make({ announce: m => msgs.push(m), scan: () => page, interval: 0 });
  t.start();
  assert.ok(msgs[msgs.length - 1].indexOf('Paso 1') === 0);
  page = [{ t: 'scene_heading', text: 'INT. COCINA — NOCHE' }]; t.tick();
  page.push({ t: 'action', text: 'Marcos escucha.' }); t.tick();
  page.push({ t: 'character', text: 'MARCOS' }); t.tick();
  page.push({ t: 'dialogue', text: 'Lo escribí yo.' }); t.tick();
  assert.ok(msgs[msgs.length - 1].indexOf('Tutorial completo') === 0);
  assert.strictEqual(t.isActive(), false);
  const t2 = T.make({ announce: m => msgs.push(m), scan: () => [], interval: 0 });
  t2.start(); t2.cancel();
  assert.ok(/relanzarlo/i.test(msgs[msgs.length - 1]));
});

console.log('ui/wiki+tutorial: ' + n + '/6 OK');
