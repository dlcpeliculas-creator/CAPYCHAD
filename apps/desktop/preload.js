'use strict';
const { contextBridge, ipcRenderer } = require('electron');
/* Bridge mínimo `window.capy` — el shape exacto de packages/platform/src/ports.js. */
contextBridge.exposeInMainWorld('capy', {
  saveScript: (p) => ipcRenderer.invoke('capy:saveScript', p),
  openScript: () => ipcRenderer.invoke('capy:openScript'),
  exportPdf: (p) => ipcRenderer.invoke('capy:exportPdf', p),
  sendFeedback: (r) => ipcRenderer.invoke('capy:feedback', r),
  openWiki: (html) => ipcRenderer.invoke('capy:openWiki', html),
  telemetryState: () => ipcRenderer.invoke('telemetry:state'),
  telemetrySetConsent: (v) => ipcRenderer.invoke('telemetry:setConsent', v),
  openLink: (url) => ipcRenderer.invoke('capy:openLink', url),
  autosaveWrite: (text) => ipcRenderer.invoke('capy:autosaveWrite', text),
  autosaveRead: () => ipcRenderer.invoke('capy:autosaveRead'),
  a11yState: () => ipcRenderer.invoke('capy:a11yState'),
  onA11yChanged: (fn) => ipcRenderer.on('capy:a11yChanged', (_e, v) => { try { fn(!!v); } catch (e) {} })
});
