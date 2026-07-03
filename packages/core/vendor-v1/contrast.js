/* CAPYCHAD · Contraste de color (WCAG 2.1). Node y navegador.
   ratio(a,b) → relación de contraste 1..21 entre dos colores hex.
   wcag(r, large) → { aa, aaa, ratio } según umbrales WCAG. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CapyContrast = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  function hexToRgb(h) {
    h = String(h).trim().replace(/^#/, '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    if (!/^[0-9a-fA-F]{6}$/.test(h)) throw new Error('hex inválido: ' + h);
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function lin(c) { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
  function luminance(hex) { const [r, g, b] = hexToRgb(hex); return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b); }
  function ratio(a, b) {
    const la = luminance(a) + 0.05, lb = luminance(b) + 0.05;
    return la > lb ? la / lb : lb / la;
  }
  function wcag(r, large) {
    return {
      ratio: Math.round(r * 100) / 100,
      aa: large ? r >= 3 : r >= 4.5,
      aaa: large ? r >= 4.5 : r >= 7
    };
  }
  return { hexToRgb, luminance, ratio, wcag };
});
