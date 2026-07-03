'use strict';
/* Adaptador WEB de los puertos — File System Access API (Chrome/Edge) con fallback a descarga.
   Este archivo ES el peldaño web de la escalera: mismo contrato que Electron, cero Electron. */
const { definePlatform } = require('../ports');

function makeWebPlatform(win) {
  const w = win || (typeof window !== 'undefined' ? window : null);
  if (!w) throw new Error('[platform/web] necesita window');

  async function saveScript({ text, defaultName, kind }) {
    try {
      if (w.showSaveFilePicker) {
        const handle = await w.showSaveFilePicker({
          suggestedName: defaultName || 'guion.fountain',
          types: [{ description: kind === 'fdx' ? 'Final Draft' : 'Fountain', accept: { 'text/plain': [kind === 'fdx' ? '.fdx' : '.fountain'] } }]
        });
        const writable = await handle.createWritable();
        await writable.write(text);
        await writable.close();
        return { ok: true, filePath: handle.name };
      }
      /* Fallback universal: descarga */
      const blob = new w.Blob([text], { type: 'text/plain;charset=utf-8' });
      const a = w.document.createElement('a');
      a.href = w.URL.createObjectURL(blob);
      a.download = defaultName || 'guion.fountain';
      a.click();
      w.URL.revokeObjectURL(a.href);
      return { ok: true, filePath: a.download };
    } catch (e) {
      if (e && e.name === 'AbortError') return { ok: false, canceled: true };
      return { ok: false, error: String(e) };
    }
  }

  async function openScript() {
    try {
      if (w.showOpenFilePicker) {
        const [handle] = await w.showOpenFilePicker({
          types: [{ description: 'Guiones', accept: { 'text/plain': ['.fountain', '.fdx', '.txt'] } }]
        });
        const file = await handle.getFile();
        return { ok: true, text: await file.text(), name: file.name };
      }
      return { ok: false, error: 'File System Access API no disponible' };
    } catch (e) {
      if (e && e.name === 'AbortError') return { ok: false, canceled: true };
      return { ok: false, error: String(e) };
    }
  }

  async function exportPdf() {
    /* En web, el PDF sale por el diálogo de impresión del navegador (window.print). */
    try { w.print(); return { ok: true, filePath: '(impresión del navegador)' }; }
    catch (e) { return { ok: false, error: String(e) }; }
  }

  return definePlatform({ platformName: 'web', saveScript, openScript, exportPdf });
}

module.exports = { makeWebPlatform };
