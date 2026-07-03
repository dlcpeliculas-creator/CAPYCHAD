'use strict';
/* Bundlea @capychad/core (con el motor v1 sincronizado adentro) como IIFE global
   `CapyCore`, para los shells desktop y web. Requiere `npm install` (esbuild). */
const path = require('path');
const ROOT = path.join(__dirname, '..');

let esbuild;
try { esbuild = require('esbuild'); }
catch (e) {
  console.error('Falta esbuild — corré `npm install` en la raíz primero.');
  process.exit(1);
}

/* Prerrequisito: el vendor tiene que existir para poder empaquetar el motor. */
const fs = require('fs');
if (!fs.existsSync(path.join(ROOT, 'packages', 'core', 'vendor-v1', 'engine.js'))) {
  console.error('Falta vendor-v1/engine.js — corré `npm run sync` antes de build:web.');
  process.exit(1);
}

const outs = [
  path.join(ROOT, 'apps', 'desktop', 'capy.bundle.js'),
  path.join(ROOT, 'apps', 'web', 'capy.bundle.js')
];

Promise.all(outs.map(outfile => esbuild.build({
  entryPoints: [path.join(ROOT, 'tools', 'bundle-entry.js')],
  bundle: true,
  format: 'iife',
  globalName: 'Capy',
  platform: 'browser',
  outfile
}))).then(() => {
  console.log('capy.bundle.js (core + editor + prefs + skins + a11y + feedback) generado en apps/desktop y apps/web.');
}).catch(e => { console.error(e); process.exit(1); });
