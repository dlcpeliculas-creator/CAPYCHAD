'use strict';
/* @capychad/a11y — la accesibilidad como paquete de primera clase.
   Diseñado con inyección de dependencias (doc = document) para poder testearlo
   en Node puro, igual que los tests de la v1. */

/* Anunciador aria-live: una región polite y una assertive, creadas una sola vez. */
function makeAnnouncer(doc) {
  let polite = null, assertive = null;
  function region(kind) {
    const el = doc.createElement('div');
    el.setAttribute('aria-live', kind);
    el.setAttribute('role', kind === 'assertive' ? 'alert' : 'status');
    el.className = 'sr-only-live';
    el.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)';
    doc.body.appendChild(el);
    return el;
  }
  function ensure() {
    if (!polite) polite = region('polite');
    if (!assertive) assertive = region('assertive');
  }
  /* Doble escritura con limpieza breve: fuerza a NVDA a re-anunciar mensajes repetidos. */
  function announce(msg, urgent) {
    ensure();
    const el = urgent ? assertive : polite;
    el.textContent = '';
    setTimeout(function () { el.textContent = String(msg == null ? '' : msg); }, 30);
    return el;
  }
  return { announce: announce, _regions: function () { ensure(); return { polite: polite, assertive: assertive }; } };
}

/* Roving tabindex: navegación por flechas en toolbars/tablists (portado del patrón v1). */
function rovingNext(current, key, count) {
  if (count <= 0) return -1;
  if (key === 'Home') return 0;
  if (key === 'End') return count - 1;
  if (key === 'ArrowRight' || key === 'ArrowDown') return (current + 1) % count;
  if (key === 'ArrowLeft' || key === 'ArrowUp') return (current - 1 + count) % count;
  return current;
}

module.exports = { makeAnnouncer: makeAnnouncer, rovingNext: rovingNext };
