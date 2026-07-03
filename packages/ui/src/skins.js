'use strict';
/* @capychad/ui · Registro de skins — la fuente ejecutable del catálogo de design.md § skins.
   Un skin cambia SOLO tokens de color: jamás DOM, ARIA, atajos ni la Courier de la hoja.
   Testeable en Node puro (aplicar = escribir data-skin; los valores viven en tokens.css). */

const SKINS = Object.freeze({
  piedra:      { label: 'Piedra y papel', mode: 'light', default: true,
                 background: '#EAE8E1', surface: '#FFFFFF', surfaceAlt: '#E3E0D8',
                 text: '#26221D', textSecondary: '#5C5142', textMuted: '#645C50',
                 primary: '#A23C1F', onPrimary: '#FFFFFF', primaryHover: '#83301A',
                 border: '#CFCBC0', borderStrong: '#A39B8C' },
  cinema:      { label: 'Cinema', mode: 'dark',
                 background: '#14110D', surface: '#1E1A15', surfaceAlt: '#262019',
                 text: '#F3EEE5', textSecondary: '#C9C0B2', textMuted: '#9A9184',
                 primary: '#E07A52', onPrimary: '#2B1207', primaryHover: '#EE9270',
                 border: '#3A332A', borderStrong: '#55493C' },
  editorial:   { label: 'Editorial', mode: 'light',
                 background: '#F7F4EF', surface: '#FFFFFF', surfaceAlt: '#EFE9DF',
                 text: '#26221D', textSecondary: '#5C5142', textMuted: '#645C50',
                 primary: '#A23C1F', onPrimary: '#FFFFFF', primaryHover: '#83301A',
                 border: '#D8D0C2', borderStrong: '#B8AE9D' },
  brutalista:  { label: 'Brutalista', mode: 'light',
                 background: '#F4F1EA', surface: '#FFFFFF', surfaceAlt: '#E7E3D8',
                 text: '#0A0A0A', textSecondary: '#44443F', textMuted: '#5C5C55',
                 primary: '#B02900', onPrimary: '#FFFFFF', primaryHover: '#8C2100',
                 border: '#C9C4B6', borderStrong: '#96917F' },
  industrial:  { label: 'Industrial', mode: 'dark',
                 background: '#0E1110', surface: '#1A1E1C', surfaceAlt: '#242927',
                 text: '#E8ECE6', textSecondary: '#B4BEB1', textMuted: '#8F998C',
                 primary: '#C4F82A', onPrimary: '#0E1110', primaryHover: '#D6FF55',
                 border: '#2A322C', borderStrong: '#414B44' },
  inmersivo:   { label: 'Inmersivo', mode: 'dark',
                 background: '#07070A', surface: '#141419', surfaceAlt: '#1C1C23',
                 text: '#F3F4F2', textSecondary: '#C0C3C7', textMuted: '#8B8F93',
                 primary: '#8AD7FF', onPrimary: '#07222E', primaryHover: '#AAE3FF',
                 border: '#26262E', borderStrong: '#3C3C46' },
  maximalista: { label: 'Maximalista', mode: 'light',
                 background: '#FFF7E8', surface: '#FFFFFF', surfaceAlt: '#FAEDD3',
                 text: '#332F24', textSecondary: '#5C5644', textMuted: '#6B6353',
                 primary: '#C2410C', onPrimary: '#FFFFFF', primaryHover: '#9A3412',
                 border: '#EBDCBB', borderStrong: '#BFA97A' },
  patagonia:   { label: 'Patagonia', mode: 'light',
                 background: '#FEF7F3', surface: '#FFFFFF', surfaceAlt: '#FBEAE2',
                 text: '#3A3350', textSecondary: '#5B5470', textMuted: '#6E6884',
                 primary: '#C2255C', onPrimary: '#FFFFFF', primaryHover: '#A61E4D',
                 border: '#F3DDD2', borderStrong: '#CBAF9F' },
  corporativo: { label: 'Corporativo', mode: 'light',
                 background: '#F5F9FF', surface: '#FFFFFF', surfaceAlt: '#EAF2FC',
                 text: '#1B2A3A', textSecondary: '#3E5871', textMuted: '#56708A',
                 primary: '#1E5FA8', onPrimary: '#FFFFFF', primaryHover: '#174A85',
                 border: '#D6E3F3', borderStrong: '#A9C4E3' }
});

const DEFAULT_SKIN = 'piedra';
const STORAGE_KEY = 'capychad2_skin';

function list() {
  return Object.keys(SKINS).map(id => ({ id, label: SKINS[id].label, mode: SKINS[id].mode, isDefault: !!SKINS[id].default }));
}
function get(id) { return SKINS[id] || null; }
function isValid(id) { return !!SKINS[id]; }

/* applySkin(id, {doc, storage}) — DI para tests: escribe data-skin y persiste.
   Los VALORES los aplica tokens.css vía [data-skin]; acá no se pintan colores. */
function applySkin(id, deps) {
  deps = deps || {};
  const doc = deps.doc || (typeof document !== 'undefined' ? document : null);
  const storage = deps.storage || (typeof localStorage !== 'undefined' ? localStorage : null);
  if (!isValid(id)) id = DEFAULT_SKIN;
  if (doc && doc.documentElement) doc.documentElement.setAttribute('data-skin', id);
  try { if (storage) storage.setItem(STORAGE_KEY, id); } catch (e) {}
  return id;
}
function savedSkin(storage) {
  const s = storage || (typeof localStorage !== 'undefined' ? localStorage : null);
  try { const v = s && s.getItem(STORAGE_KEY); return isValid(v) ? v : DEFAULT_SKIN; }
  catch (e) { return DEFAULT_SKIN; }
}

module.exports = { SKINS, DEFAULT_SKIN, STORAGE_KEY, list, get, isValid, applySkin, savedSkin };
