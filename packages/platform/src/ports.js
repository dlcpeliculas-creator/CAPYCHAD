'use strict';
/* Puertos de plataforma — el contrato que TODA implementación debe cumplir.
   core y ui solo conocen esta forma; jamás importan electron ni APIs del navegador.
   Implementaciones: ./electron/ (IPC + diálogos nativos) y ./web/ (File System Access API). */

/* Contrato (documentado como fábrica validadora): */
function definePlatform(impl) {
  const required = ['saveScript', 'openScript', 'exportPdf', 'platformName'];
  for (const k of required) {
    if (typeof impl[k] !== 'function' && typeof impl[k] !== 'string') {
      throw new Error('[platform] implementación incompleta: falta ' + k);
    }
  }
  return Object.freeze({
    platformName: impl.platformName,          // 'electron' | 'web'
    /* saveScript({ text, defaultName, kind }) → { ok, filePath? , canceled?, error? } */
    saveScript: impl.saveScript,
    /* openScript() → { ok, text?, name?, canceled?, error? } */
    openScript: impl.openScript,
    /* exportPdf({ html, defaultName }) → { ok, filePath?, canceled?, error? } */
    exportPdf: impl.exportPdf
  });
}

module.exports = { definePlatform };
