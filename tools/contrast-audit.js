'use strict';
/* Auditoría WCAG de la 2.0: recorre TODO el catálogo de skins (packages/ui/src/skins.js)
   y verifica los 12 pares de texto por skin. Rojo = no se lanza (mismo estándar que la v1).
   Usa la matemática probada de la v1 (vendor-v1/contrast.js — corré `npm run sync` antes). */
const path = require('path');
const SKINS = require(path.join(__dirname, '..', 'packages', 'ui', 'src', 'skins.js')).SKINS;

let C;
try { C = require(path.join(__dirname, '..', 'packages', 'core', 'vendor-v1', 'contrast.js')); }
catch (e) { console.error('Falta vendor-v1/contrast.js — corré `npm run sync` primero.'); process.exit(1); }

const semL = { success: '#2F6B3A', warning: '#7A5200', error: '#A32014', info: '#1D5A8A' };
const semD = { success: '#8FCF9B', warning: '#E3BC6B', error: '#F2917F', info: '#8FC1E9' };

let fails = 0, checks = 0;
for (const [id, s] of Object.entries(SKINS)) {
  const sem = s.mode === 'dark' ? semD : semL;
  const pairs = [
    ['texto / fondo', s.text, s.background],
    ['secundario / fondo', s.textSecondary, s.background],
    ['muted / fondo', s.textMuted, s.background],
    ['acento / fondo', s.primary, s.background],
    ['hover / fondo', s.primaryHover, s.background],
    ['texto de botón / acento', s.onPrimary, s.primary],
    ['texto / hoja', s.text, s.surface],
    ['muted / panel', s.textMuted, s.surfaceAlt],
    ['success / fondo', sem.success, s.background],
    ['warning / fondo', sem.warning, s.background],
    ['error / fondo', sem.error, s.background],
    ['info / fondo', sem.info, s.background]
  ];
  let min = Infinity, bad = [];
  for (const [label, a, b] of pairs) {
    checks++;
    const r = C.ratio(a, b);
    if (r < min) min = r;
    if (!C.wcag(r, false).aa) { fails++; bad.push(label + '=' + r.toFixed(2)); }
  }
  console.log((bad.length ? '✗ ' : '✓ ') + id.padEnd(12) + (bad.length ? 'FALLA: ' + bad.join(', ') : 'AA (mín ' + min.toFixed(2) + ')'));
}
console.log('\nResultado: ' + (checks - fails) + '/' + checks + ' pares pasan AA en ' + Object.keys(SKINS).length + ' skins.');
process.exit(fails ? 1 : 0);
