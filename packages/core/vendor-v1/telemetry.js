'use strict';
// CAPYCHAD · Telemetría opt-in (FR-007).
// Regla de la casa: NADA sale de la máquina sin consentimiento explícito.
// Sin consentimiento (o con el DSN placeholder) este módulo no hace ni un require de Sentry.
const path = require('path');
const fs = require('fs');

// TODO: pegar el DSN real al crear el proyecto Electron en sentry.io (gratis).
// Mientras empiece con "TODO", Sentry queda desactivado aunque haya consentimiento.
const DSN = 'TODO_SENTRY_DSN';

// Borra nombres de usuario de rutas Windows/macOS/Linux.
function scrubPath(s) {
  return String(s).replace(/([A-Za-z]:\\Users\\|\/home\/|\/Users\/)[^\\\/\s"']+/g, '$1<usuario>');
}

function scrubBreadcrumb(b) {
  try {
    if (!b) return null;
    if (b.category === 'console') return null;          // consolas pueden contener texto del guion
    if (b.message) b.message = scrubPath(b.message);
    if (b.data) { delete b.data.url; delete b.data.path; delete b.data.file; delete b.data.arguments; }
    return b;
  } catch (e) { return null; }
}

// beforeSend: si no se puede limpiar, el evento NO se envía (return null).
function scrubEvent(ev) {
  try {
    delete ev.user; delete ev.server_name; delete ev.request; delete ev.extra;
    if (Array.isArray(ev.breadcrumbs)) ev.breadcrumbs = ev.breadcrumbs.map(scrubBreadcrumb).filter(Boolean);
    if (ev.exception && Array.isArray(ev.exception.values)) {
      ev.exception.values.forEach(function (v) {
        if (v.value) v.value = scrubPath(v.value);
        if (v.stacktrace && Array.isArray(v.stacktrace.frames)) {
          v.stacktrace.frames.forEach(function (f) {
            if (f.filename) f.filename = scrubPath(f.filename);
            if (f.abs_path) f.abs_path = scrubPath(f.abs_path);
            delete f.vars;
          });
        }
      });
    }
    if (ev.message) ev.message = scrubPath(ev.message);
    return ev;
  } catch (e) { return null; }
}

// make({ dir, requireFn, dsn }) — inyectables para tests.
function make(deps) {
  deps = deps || {};
  const dir = deps.dir;                       // () => carpeta userData
  const requireFn = deps.requireFn || require;
  const dsn = deps.dsn || DSN;
  let inited = false;

  function file() { return path.join(dir(), 'telemetry.json'); }

  function read() {
    try {
      const j = JSON.parse(fs.readFileSync(file(), 'utf8'));
      return {
        consent: typeof j.consent === 'boolean' ? j.consent : null,
        askedAt: j.askedAt || null,
        launches: j.launches | 0
      };
    } catch (e) { return { consent: null, askedAt: null, launches: 0 }; }
  }
  function write(st) {
    try { fs.writeFileSync(file(), JSON.stringify(st, null, 2), 'utf8'); return true; }
    catch (e) { return false; }
  }
  function bumpLaunch() { const st = read(); st.launches = (st.launches | 0) + 1; write(st); return st; }
  function setConsent(v) { const st = read(); st.consent = !!v; st.askedAt = new Date().toISOString(); write(st); return st; }
  // Se pregunta UNA vez, recién en el 2º arranque (nunca interrumpir el primer guion).
  function shouldAsk() { const st = read(); return st.consent === null && !st.askedAt && st.launches >= 2; }

  function init() {
    const st = read();
    if (st.consent !== true) return { active: false, reason: st.consent === false ? 'declined' : 'no-consent' };
    if (!dsn || /^TODO/.test(dsn)) return { active: false, reason: 'dsn-placeholder' };
    try {
      const Sentry = requireFn('@sentry/electron/main');
      Sentry.init({ dsn: dsn, sendDefaultPii: false, beforeSend: scrubEvent, beforeBreadcrumb: scrubBreadcrumb });
      inited = true;
      return { active: true };
    } catch (e) { return { active: false, reason: 'module-missing' }; }
  }

  return { read: read, write: write, bumpLaunch: bumpLaunch, setConsent: setConsent, shouldAsk: shouldAsk, init: init, isActive: function () { return inited; } };
}

module.exports = { make: make, scrubEvent: scrubEvent, scrubBreadcrumb: scrubBreadcrumb, scrubPath: scrubPath, DSN: DSN };
