'use strict';
/* Punto de entrada del bundle de los shells: expone TODO lo que el renderer necesita
   como global `Capy` (esbuild IIFE). Un solo bundle, una sola verdad. */
module.exports = {
  core: require('../packages/core/src'),
  editor: require('../packages/ui/src/editor-core.js'),
  prefs: require('../packages/ui/src/prefs.js'),
  skins: require('../packages/ui/src/skins.js'),
  wiki: require('../packages/ui/src/wiki.js'),
  tutorial: require('../packages/ui/src/tutorial.js'),
  a11y: require('../packages/a11y/src'),
  feedback: require('../packages/platform/src/feedback.js')
};
