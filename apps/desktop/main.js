'use strict';
/* Shell Electron 2.0 — deliberadamente mínimo. Hereda las reglas de seguridad de la v1:
   contextIsolation ON, nodeIntegration OFF, sandbox ON, permisos denegados por defecto. */
const { app, BrowserWindow, ipcMain, dialog, session } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  /* Arranque pulcro: la ventana nace oculta con el color de la piedra y se muestra
     recién cuando el contenido está listo — cero flash blanco (estándar docs/lanzador.md). */
  const win = new BrowserWindow({
    width: 1200, height: 800,
    minWidth: 760, minHeight: 520,
    title: 'CAPYCHAD',
    show: false,
    backgroundColor: '#EAE8E1',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  win.once('ready-to-show', () => win.show());
  win.loadFile(path.join(__dirname, 'index.html'));
}

/* Puertos (mismo shape que packages/platform/src/ports.js) */
ipcMain.handle('capy:saveScript', async (_e, { text, defaultName, kind }) => {
  const filters = kind === 'fdx'
    ? [{ name: 'Final Draft', extensions: ['fdx'] }]
    : [{ name: 'Fountain', extensions: ['fountain'] }, { name: 'Texto', extensions: ['txt'] }];
  const { canceled, filePath } = await dialog.showSaveDialog({ title: 'Exportar guion', defaultPath: defaultName || 'guion.fountain', filters });
  if (canceled || !filePath) return { ok: false, canceled: true };
  try { fs.writeFileSync(filePath, text, 'utf8'); return { ok: true, filePath }; }
  catch (e) { return { ok: false, error: String(e) }; }
});

ipcMain.handle('capy:openScript', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: 'Abrir guion',
    filters: [{ name: 'Guiones', extensions: ['fountain', 'fdx', 'txt'] }],
    properties: ['openFile']
  });
  if (canceled || !filePaths || !filePaths[0]) return { ok: false, canceled: true };
  try { return { ok: true, text: fs.readFileSync(filePaths[0], 'utf8'), name: path.basename(filePaths[0]) }; }
  catch (e) { return { ok: false, error: String(e) }; }
});

ipcMain.handle('capy:exportPdf', async (_e, { html, defaultName }) => {
  const { canceled, filePath } = await dialog.showSaveDialog({ title: 'Exportar PDF', defaultPath: defaultName || 'guion.pdf', filters: [{ name: 'PDF', extensions: ['pdf'] }] });
  if (canceled || !filePath) return { ok: false, canceled: true };
  let w = null;
  try {
    w = new BrowserWindow({ show: false, webPreferences: { offscreen: true, sandbox: true, contextIsolation: true, nodeIntegration: false, javascript: false } });
    await w.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
    /* PDF ETIQUETADO (accesible): el PDF exportado se puede leer con lector de pantalla.
       Casi ninguna app de guion lo hace — acá es parte de la base (docs/herramientas-a11y.md §6).
       El flag es experimental en Chromium: si fallara, se reintenta sin etiquetar. */
    let data;
    try {
      data = await w.webContents.printToPDF({ pageSize: 'Letter', printBackground: false, generateTaggedPDF: true, generateDocumentOutline: true });
    } catch (e2) {
      data = await w.webContents.printToPDF({ pageSize: 'Letter', printBackground: false });
    }
    fs.writeFileSync(filePath, data);
    return { ok: true, filePath };
  } catch (e) { return { ok: false, error: String(e) }; }
  finally { try { if (w) w.destroy(); } catch (e) {} }
});

/* ===== Telemetría opt-in (portada de la v1: 8 tests, cero red sin consentimiento) ===== */
let telemetry = null;
try {
  const CapyTelemetry = require('../../packages/core/vendor-v1/telemetry.js');
  telemetry = CapyTelemetry.make({ dir: () => app.getPath('userData') });
  try { telemetry.init(); } catch (e) {}
} catch (e) { /* sin vendor (falta sync): la app corre igual, sin telemetría */ }

ipcMain.handle('telemetry:state', () => {
  if (!telemetry) return { consent: null, shouldAsk: false, active: false };
  const st = telemetry.read();
  return { consent: st.consent, shouldAsk: telemetry.shouldAsk(), active: telemetry.isActive() };
});
ipcMain.handle('telemetry:setConsent', (_e, v) => {
  if (!telemetry) return { ok: false };
  const st = telemetry.setConsent(!!v);
  if (st.consent === true) { try { telemetry.init(); } catch (e) {} }
  return { ok: true, consent: st.consent };
});

/* Feedback in-app: SIEMPRE se guarda localmente (jsonl en userData); si hay email de
   destino configurado, además abre el cliente de correo con el reporte prellenado. */
const FEEDBACK_EMAIL = 'truegotdf@gmail.com'; // los reportes también abren el correo prellenado, además de guardarse local
ipcMain.handle('capy:feedback', async (_e, report) => {
  try {
    const dir = path.join(app.getPath('userData'), 'feedback');
    fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(path.join(dir, 'feedback.jsonl'), JSON.stringify(report) + '\n', 'utf8');
  } catch (e) { return { ok: false, error: String(e) }; }
  try {
    if (FEEDBACK_EMAIL && !/^TODO/.test(FEEDBACK_EMAIL)) {
      const subject = encodeURIComponent('[CAPYCHAD ' + (report.priority === 'alta' ? 'ACCESIBILIDAD' : report.category) + '] feedback');
      const body = encodeURIComponent(report.message + '\n\n— contexto —\n' + JSON.stringify(report.context, null, 2));
      const { shell } = require('electron');
      shell.openExternal('mailto:' + FEEDBACK_EMAIL + '?subject=' + subject + '&body=' + body);
    }
  } catch (e) {}
  return { ok: true };
});

/* ===== Autoguardado local (regla de la casa: pérdida máxima de trabajo ≈ 60 segundos) =====
   Guarda el guion actual en userData/autosave.fountain con rotación a .bak (el guardado
   anterior nunca se pisa sin respaldo). El renderer decide cuándo; acá solo se persiste. */
function autosavePath() { return path.join(app.getPath('userData'), 'autosave.fountain'); }
ipcMain.handle('capy:autosaveWrite', async (_e, text) => {
  try {
    const p = autosavePath();
    if (fs.existsSync(p)) { try { fs.copyFileSync(p, p + '.bak'); } catch (e) {} }
    fs.writeFileSync(p, String(text || ''), 'utf8');
    return { ok: true };
  } catch (e) { return { ok: false, error: String(e) }; }
});
ipcMain.handle('capy:autosaveRead', async () => {
  try {
    const p = autosavePath();
    if (!fs.existsSync(p)) return { ok: true, text: '' };
    return { ok: true, text: fs.readFileSync(p, 'utf8') };
  } catch (e) { return { ok: false, error: String(e) }; }
});

/* ===== Detección de lector de pantalla (Chromium la hace sola; acá solo se consulta) =====
   Sirve para que la bienvenida confirme "lector detectado" sin que el usuario busque nada.
   Nota: API con regresión conocida en Electron 37 (issue #48039) — por eso todo va en try
   y la app funciona idéntico si la detección no responde. */
ipcMain.handle('capy:a11yState', () => {
  try { return { screenReader: !!app.isAccessibilitySupportEnabled() }; }
  catch (e) { return { screenReader: false }; }
});
app.on('accessibility-support-changed', (_e, enabled) => {
  BrowserWindow.getAllWindows().forEach(w => {
    try { w.webContents.send('capy:a11yChanged', !!enabled); } catch (e) {}
  });
});

/* Abrir enlaces externos: SOLO destinos de la allowlist (seguridad heredada de la v1). */
const LINK_ALLOWLIST = [/^https:\/\/(www\.)?nvaccess\.org\//i];
ipcMain.handle('capy:openLink', async (_e, url) => {
  const u = String(url || '');
  if (!LINK_ALLOWLIST.some(rx => rx.test(u))) return { ok: false, error: 'destino no permitido' };
  try { const { shell } = require('electron'); await shell.openExternal(u); return { ok: true }; }
  catch (e) { return { ok: false, error: String(e) }; }
});

/* Manual (wiki) en el navegador: el renderer genera el HTML; acá se guarda y se abre. */
ipcMain.handle('capy:openWiki', async (_e, html) => {
  try {
    const p = path.join(app.getPath('userData'), 'manual.html');
    fs.writeFileSync(p, String(html || ''), 'utf8');
    const { shell } = require('electron');
    await shell.openPath(p);
    return { ok: true, filePath: p };
  } catch (e) { return { ok: false, error: String(e) }; }
});

app.whenReady().then(() => {
  /* Solo MICRÓFONO (dictado futuro) — cámara, geoloc y el resto denegados (herencia v1). */
  session.defaultSession.setPermissionRequestHandler((_wc, perm, cb, details) => {
    if (perm === 'media') { const t = (details && details.mediaTypes) || []; return cb(t.indexOf('video') < 0); }
    cb(false);
  });
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
