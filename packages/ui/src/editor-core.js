'use strict';
/* @capychad/ui · editor-core — el corazón del editor como MÁQUINA DE ESTADOS PURA.
   Cero DOM: los tests corren en Node (patrón v1). El binding visual vive en editor-dom.js.
   Semántica portada de la v1: Tab cicla tipos, Enter crea el tipo lógico siguiente (NEXT),
   los tipos UPPER van en mayúsculas, cada cambio se anuncia con su etiqueta en español (LB). */

const ORDER = ['scene_heading', 'action', 'character', 'parenthetical', 'dialogue', 'transition', 'shot', 'summary', 'sequence', 'note'];

const LB = {
  scene_heading: 'Encabezado', action: 'Acción', character: 'Personaje',
  parenthetical: 'Paréntesis', dialogue: 'Diálogo', transition: 'Transición',
  shot: 'Plano', summary: 'Resumen', newact: 'Acto (inicio)', endact: 'Fin de acto',
  sequence: 'Secuencia', cast: 'Reparto', note: 'Nota'
};
const PH = {
  scene_heading: 'INT./EXT. LUGAR - DÍA', action: 'Acción…', character: 'PERSONAJE',
  parenthetical: '(acotación)', dialogue: 'Diálogo…', transition: 'CORTE A:',
  shot: 'PLANO / SHOT', summary: 'Resumen de la escena…', newact: 'ACTO',
  endact: 'FIN DEL ACTO', sequence: 'SECUENCIA', cast: 'Reparto…', note: 'Nota…'
};
const NEXT = {
  scene_heading: 'action', action: 'action', character: 'dialogue',
  parenthetical: 'dialogue', dialogue: 'action', transition: 'scene_heading',
  shot: 'action', summary: 'action', newact: 'scene_heading', endact: 'scene_heading',
  sequence: 'scene_heading', cast: 'action', note: 'action'
};
const UPPER = ['scene_heading', 'character', 'transition', 'shot', 'newact', 'endact', 'sequence'];

/* Interop con el motor v1 (engine.TYPES) */
const T2E = {
  scene_heading: 'Scene Heading', action: 'Action', character: 'Character',
  parenthetical: 'Parenthetical', dialogue: 'Dialogue', transition: 'Transition',
  shot: 'Shot', summary: 'Summary', newact: 'New Act', endact: 'End of Act',
  sequence: 'Sequence', cast: 'Cast List', note: 'Note'
};
const E2T = {};
Object.keys(T2E).forEach(k => { E2T[T2E[k]] = k; });

function make(opts) {
  opts = opts || {};
  const announce = opts.announce || function () {};
  let blocks = [{ t: 'scene_heading', text: '' }];
  let i = 0;
  const listeners = [];
  function emit(kind, payload) { listeners.forEach(fn => { try { fn(kind, payload); } catch (e) {} }); }
  function clampCaps(b) { if (UPPER.indexOf(b.t) >= 0) b.text = b.text.toUpperCase(); }

  const api = {
    /* estado */
    blocks: () => blocks.map(b => ({ t: b.t, text: b.text })),
    index: () => i,
    current: () => ({ t: blocks[i].t, text: blocks[i].text }),
    label: (t) => LB[t] || t,
    placeholder: (t) => PH[t] || '',
    isEmpty: () => blocks.length === 1 && blocks[0].text.trim() === '',

    /* edición */
    setText(text) { blocks[i].text = String(text == null ? '' : text); clampCaps(blocks[i]); emit('text', api.current()); },
    setIndex(n) { if (n >= 0 && n < blocks.length) { i = n; emit('focus', { index: i }); } },

    setType(t) {
      if (!LB[t]) return;
      blocks[i].t = t; clampCaps(blocks[i]);
      announce(LB[t]);                       // paridad visual/sonora: el tipo SIEMPRE se anuncia
      emit('type', api.current());
    },
    cycleType(dir) {
      const cur = ORDER.indexOf(blocks[i].t);
      const nx = cur < 0 ? 0 : (cur + (dir < 0 ? -1 : 1) + ORDER.length) % ORDER.length;
      api.setType(ORDER[nx]);
      return ORDER[nx];
    },
    enter() {
      const t = NEXT[blocks[i].t] || 'action';
      blocks.splice(i + 1, 0, { t, text: '' });
      i = i + 1;
      announce(LB[t]);
      emit('enter', { index: i, t });
      return t;
    },
    backspaceJoin() {
      if (i === 0 || blocks[i].text !== '') return false;
      blocks.splice(i, 1); i = Math.max(0, i - 1);
      emit('remove', { index: i });
      return true;
    },

    /* interop motor v1 */
    toParagraphs() {
      return blocks
        .filter(b => b.text.trim() !== '')
        .map(b => ({ type: T2E[b.t] || 'Action', text: b.text }));
    },
    fromParagraphs(paras) {
      blocks = (paras || []).map(p => {
        const b = { t: E2T[p.type] || 'action', text: String(p.text || '') };
        clampCaps(b); return b;
      });
      if (!blocks.length) blocks = [{ t: 'scene_heading', text: '' }];
      i = 0;
      emit('load', { count: blocks.length });
    },

    /* Lectura de cursor (modo no vidente): la frase que se anuncia al llegar a una línea. */
    lineAnnouncement(b) {
      b = b || api.current();
      const txt = String(b.text || '').trim();
      const shown = txt ? (txt.length > 90 ? txt.slice(0, 90) + '…' : txt) : 'Vacío';
      return shown + ' — ' + (LB[b.t] || b.t);
    },

    onChange(fn) { listeners.push(fn); return () => { const k = listeners.indexOf(fn); if (k >= 0) listeners.splice(k, 1); }; }
  };
  return api;
}

module.exports = { make, ORDER, LB, PH, NEXT, UPPER, T2E, E2T };
