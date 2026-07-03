'use strict';
/* Modelo nativo del párrafo de guion — la PRIMERA pieza estrangulada (ejemplo del patrón).
   Es dominio puro: tipos válidos, constructores y predicados. Sin DOM, sin Electron.
   Los tipos espejan el motor v1 (engine.TYPES) para interoperar sin traducción. */

const TYPES = Object.freeze([
  'Scene Heading', 'Action', 'Character', 'Parenthetical', 'Dialogue',
  'Transition', 'Shot', 'Summary', 'New Act', 'End of Act', 'Sequence',
  'Cast List', 'Note', 'General'
]);

function isType(t) { return TYPES.indexOf(t) >= 0; }

function paragraph(type, text, extra) {
  if (!isType(type)) throw new Error('Tipo de párrafo inválido: ' + type);
  const p = { type: type, text: String(text == null ? '' : text) };
  if (extra && typeof extra === 'object') {
    if (extra.number != null) p.number = extra.number;   // número de escena
    if (extra.dual) p.dual = extra.dual;                 // diálogo dual ('right')
  }
  return p;
}

function isDialogueBlock(p) {
  return p && (p.type === 'Character' || p.type === 'Parenthetical' || p.type === 'Dialogue');
}

function sceneCount(paras) {
  let n = 0;
  for (const p of paras || []) if (p && p.type === 'Scene Heading') n++;
  return n;
}

module.exports = { TYPES, isType, paragraph, isDialogueBlock, sceneCount };
