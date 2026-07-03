'use strict';
/* Adaptador ELECTRON de los puertos — habla con el preload del shell desktop.
   Espera el bridge `window.capy` (apps/desktop/preload.js), espejo del patrón v1. */
const { definePlatform } = require('../ports');

function makeElectronPlatform(bridge) {
  const b = bridge || (typeof window !== 'undefined' ? window.capy : null);
  if (!b) throw new Error('[platform/electron] falta el bridge del preload (window.capy)');
  return definePlatform({
    platformName: 'electron',
    saveScript: (p) => b.saveScript(p),
    openScript: () => b.openScript(),
    exportPdf: (p) => b.exportPdf(p)
  });
}

module.exports = { makeElectronPlatform };
