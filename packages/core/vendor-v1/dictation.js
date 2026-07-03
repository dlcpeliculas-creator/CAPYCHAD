/* CAPYCHAD · Dictado por voz — post-proceso de comandos hablados. Node y navegador.
   applyVoiceCommands(texto): convierte palabras de puntuación dichas en voz alta
   ("punto", "coma", "nueva línea"…) en signos, limpia espacios y capitaliza oraciones. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CapyDictation = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var CMD = {
    'punto y aparte': '\n', 'punto y seguido': '. ', 'nueva línea': '\n', 'nueva linea': '\n',
    'punto y coma': '; ', 'dos puntos': ': ', 'punto': '. ', 'coma': ', ',
    'signo de interrogación': '?', 'signo de interrogacion': '?',
    'signo de exclamación': '!', 'signo de exclamacion': '!',
    'abrir paréntesis': '(', 'abrir parentesis': '(', 'cerrar paréntesis': ')', 'cerrar parentesis': ')',
    'comillas': '"', 'guion': '-', 'raya': '—'
  };
  function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function applyVoiceCommands(text) {
    if (!text) return '';
    var s = String(text).trim();
    Object.keys(CMD).sort(function (a, b) { return b.length - a.length; }).forEach(function (k) {
      var re = new RegExp('\\b' + escapeRe(k) + '\\b', 'gi');
      s = s.replace(re, CMD[k]);
    });
    s = s.replace(/\s+([.,;:!?)”"])/g, '$1')   // sin espacio antes de cierre/puntuación
         .replace(/([(¿¡])\s+/g, '$1')              // sin espacio tras apertura
         .replace(/[ \t]{2,}/g, ' ')
         .replace(/[ \t]*\n[ \t]*/g, '\n')
         .trim();
    s = s.replace(/(^|[.!?]\s|\n)([a-záéíóúñ])/g, function (m, p, c) { return p + c.toUpperCase(); });
    return s;
  }
  return { applyVoiceCommands: applyVoiceCommands };
});
