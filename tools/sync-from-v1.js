'use strict';
/* Sincroniza el código probado de la v1 hacia packages/core/vendor-v1 (SOLO LECTURA).
   Uso:  npm run sync            (asume la v1 en ../app)
         V1_DIR=/ruta/a/app npm run sync
   Escribe un MANIFEST.json con checksums para saber exactamente qué versión vive acá. */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const V1 = process.env.V1_DIR || path.join(ROOT, '..', 'app');
const OUT = path.join(ROOT, 'packages', 'core', 'vendor-v1');

/* Qué se trae de la v1 (dominio puro, sin DOM): ampliar esta lista es parte del plan de migración. */
const FILES = [
  'src/engine.js',
  'src/analysis.js',
  'lib/contrast.js',
  'lib/history.js',
  'lib/beatsheets.js',
  'lib/dictation.js',
  'lib/audiodrama.js',
  'lib/telemetry.js'
];

function sha256(buf) { return crypto.createHash('sha256').update(buf).digest('hex'); }

if (!fs.existsSync(V1)) {
  console.error('No encuentro la v1 en: ' + V1 + '\nAjustá V1_DIR, p. ej.:  V1_DIR="C:/Users/Pc/OneDrive/Documents/FABLE/app" npm run sync');
  process.exit(1);
}
fs.mkdirSync(OUT, { recursive: true });

const manifest = { syncedAt: new Date().toISOString(), from: V1, files: {} };
let okCount = 0;
for (const rel of FILES) {
  const src = path.join(V1, rel);
  if (!fs.existsSync(src)) { console.warn('  · falta en v1 (se salta): ' + rel); continue; }
  const buf = fs.readFileSync(src);
  const dest = path.join(OUT, path.basename(rel));
  fs.writeFileSync(dest, buf);
  manifest.files[path.basename(rel)] = { from: rel, sha256: sha256(buf), bytes: buf.length };
  okCount++;
  console.log('  ✓ ' + rel + ' → vendor-v1/' + path.basename(rel));
}
fs.writeFileSync(path.join(OUT, 'MANIFEST.json'), JSON.stringify(manifest, null, 2));
fs.writeFileSync(path.join(OUT, 'NO-EDITAR.md'),
  '# NO EDITAR\n\nEste directorio lo escribe `npm run sync` desde la v1.\n' +
  'Cualquier cambio manual se pierde en el próximo sync. Si algo debe cambiar,\n' +
  'cambialo en la v1 (tiene los tests) y volvé a sincronizar.\n');
console.log('\nSync: ' + okCount + '/' + FILES.length + ' archivos · MANIFEST.json escrito.');
