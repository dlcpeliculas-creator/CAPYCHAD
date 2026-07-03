'use strict';
/* Adaptador de audio: delega en el audiodrama v1 sincronizado (13 tests en la v1).
   Require ESTÁTICO (bundleable). La síntesis de voz vive en el shell (speechSynthesis);
   acá solo la lógica pura: segmentación guion → parlamentos, reparto y utilidades WAV. */

let v1;
try {
  v1 = require('../../vendor-v1/audiodrama.js');
} catch (e) {
  throw new Error('[@capychad/core] Falta vendor-v1/audiodrama.js — corré `npm run sync` en la raíz.');
}

/* Reparto derivado de los segmentos (v1: {role, speaker, voice, text, pauseAfter}). */
function castFromSegments(segs) {
  const seen = [];
  (segs || []).forEach(s => {
    const who = s && s.speaker;
    if (who && seen.indexOf(who) < 0) seen.push(who);
  });
  return seen;
}

module.exports = {
  buildSegments: v1.buildSegments,
  castOf: v1.castOf,
  firstSceneSlice: v1.firstSceneSlice,
  castFromSegments,
  pcmToWav: v1.pcmToWav,
  parseWav: v1.parseWav,
  silencePcm: v1.silencePcm,
  concatPcm: v1.concatPcm,
  _vendor: 'v1'
};
