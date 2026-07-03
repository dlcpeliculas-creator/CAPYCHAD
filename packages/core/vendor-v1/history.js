/* CAPYCHAD · Historial de versiones (snapshots locales). Node y navegador.
   Lógica pura: agregar con tope y sin duplicados, buscar, generar id. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CapyHistory = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  function makeId(ts) { return 's' + (ts || Date.now()) + '_' + Math.random().toString(36).slice(2, 7); }
  // Agrega una versión al principio; descarta si es idéntica a la última; acota al máximo.
  function addSnapshot(list, entry, max) {
    list = Array.isArray(list) ? list.slice() : [];
    if (list.length && list[0] && list[0].text === entry.text) return list; // sin cambios → no duplica
    list.unshift(entry);
    max = max || 30;
    if (list.length > max) list = list.slice(0, max);
    return list;
  }
  function findSnapshot(list, id) {
    list = list || [];
    for (var i = 0; i < list.length; i++) if (list[i] && list[i].id === id) return list[i];
    return null;
  }
  return { makeId, addSnapshot, findSnapshot };
});
