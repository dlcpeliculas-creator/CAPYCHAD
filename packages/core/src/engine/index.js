'use strict';
/* Adaptador del motor: HOY delega en el engine v1 sincronizado (vendor-v1).
   Esta es la interfaz estable que consume el resto de la arquitectura.
   IMPORTANTE: require ESTÁTICO y sin fs/path — así esbuild puede empaquetarlo
   para los shells (browser) y Node lo corre igual. Si falta el vendor,
   el mensaje te dice exactamente qué correr. */

let v1;
try {
  v1 = require('../../vendor-v1/engine.js');
} catch (e) {
  throw new Error(
    '[@capychad/core] Falta vendor-v1/engine.js — corré `npm run sync` en la raíz ' +
    '(trae el motor probado desde la v1). Regla de oro: vendor-v1 no se edita, se sincroniza.'
  );
}

/* Interfaz pública del motor (espejo de la v1, deliberadamente): */
module.exports = {
  TYPES: v1.TYPES,
  textToParagraphs: v1.textToParagraphs,
  paragraphsToFountain: v1.paragraphsToFountain,
  fountainToParagraphs: v1.fountainToParagraphs || v1.textToParagraphs,
  paragraphsToFdx: v1.paragraphsToFdx,
  fdxToParagraphs: v1.fdxToParagraphs,
  norm: v1.norm,
  _vendor: 'v1'
};
