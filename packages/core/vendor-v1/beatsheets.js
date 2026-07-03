/* CAPYCHAD · Plantillas de estructura (beat sheets). Node y navegador.
   Datos puros + buildSheet() que arma la estructura del Beat Board
   ({beats, acts, seqs}) con ids. Referencias clásicas; el guion es del autor. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CapyBeatsheets = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var ACTC = ['#2E5BFF', '#7A2EFF', '#23B26D', '#F5A623'];
  var ROMAN = ['I', 'II', 'III', 'IV', 'V'];

  var SHEETS = {
    stc: {
      name: 'Save the Cat (15 beats)', acts: [[1, 5], [6, 12], [13, 15]],
      beats: [
        ['Imagen de apertura', 'Primer vistazo del tono y del mundo; el “antes”.'],
        ['Tema expuesto', 'Alguien enuncia, sin saberlo, de qué trata la historia.'],
        ['Planteamiento', 'Presentás al protagonista, su mundo y lo que le falta.'],
        ['Catalizador', 'El hecho que rompe la rutina.'],
        ['Debate', '¿Se anima el protagonista? Duda antes de actuar.'],
        ['Cambio al Acto II', 'Decide actuar y entra al mundo nuevo.'],
        ['Trama B', 'Subtrama (a menudo de amor o del tema).'],
        ['Diversión y juegos', 'La “promesa de la premisa”: lo que el público vino a ver.'],
        ['Punto medio', 'Falsa victoria o falsa derrota; sube la apuesta.'],
        ['Los malos se acercan', 'La presión externa e interna crece.'],
        ['Todo está perdido', 'El golpe más bajo; “olor a muerte”.'],
        ['Noche oscura del alma', 'El protagonista toca fondo.'],
        ['Cambio al Acto III', 'Encuentra la solución (a menudo con la trama B).'],
        ['Final', 'Pone en práctica lo aprendido y resuelve.'],
        ['Imagen final', 'El “después”; espejo de la imagen de apertura.']
      ]
    },
    hero: {
      name: 'Viaje del héroe (12 etapas)', acts: [[1, 4], [5, 9], [10, 12]],
      beats: [
        ['Mundo ordinario', 'La vida cotidiana del héroe antes del cambio.'],
        ['Llamada a la aventura', 'Aparece el desafío o problema.'],
        ['Rechazo de la llamada', 'Miedo o duda inicial.'],
        ['Encuentro con el mentor', 'Guía, herramienta o consejo clave.'],
        ['Cruce del primer umbral', 'Se compromete y entra al mundo especial.'],
        ['Pruebas, aliados y enemigos', 'Aprende las reglas del nuevo mundo.'],
        ['Aproximación', 'Se prepara para el gran desafío.'],
        ['La prueba suprema', 'Enfrenta su mayor miedo; momento de crisis.'],
        ['La recompensa', 'Obtiene lo que buscaba (objeto o saber).'],
        ['El camino de vuelta', 'Consecuencias; lo persiguen.'],
        ['Resurrección', 'Prueba final; renace transformado.'],
        ['Regreso con el elíxir', 'Vuelve con algo para compartir.']
      ]
    },
    three: {
      name: 'Estructura en 3 actos', acts: [[1, 1], [2, 4], [5, 6]],
      beats: [
        ['Detonante', 'El incidente que dispara la trama.'],
        ['Primer punto de giro', 'Cierra el Acto I y cambia el rumbo.'],
        ['Punto medio', 'Giro central; sube la apuesta.'],
        ['Segundo punto de giro', 'Cierra el Acto II; el peor momento o la gran decisión.'],
        ['Clímax', 'La confrontación final.'],
        ['Resolución', 'El nuevo equilibrio.']
      ]
    }
  };

  function listSheets() { return Object.keys(SHEETS).map(function (k) { return { key: k, name: SHEETS[k].name, beats: SHEETS[k].beats.length }; }); }

  function buildSheet(key, idFn) {
    var s = SHEETS[key]; if (!s) return null;
    idFn = idFn || function () { return 'b' + Math.random().toString(36).slice(2, 9); };
    function actOf(pos) { for (var i = 0; i < s.acts.length; i++) if (pos >= s.acts[i][0] && pos <= s.acts[i][1]) return i; return 0; }
    var beats = s.beats.map(function (b, i) {
      return { id: idFn(), title: b[0], desc: b[1] || '', color: ACTC[actOf(i + 1) % ACTC.length] };
    });
    var acts = s.acts.map(function (r, idx) {
      return { id: idFn(), title: 'ACTO ' + (ROMAN[idx] || (idx + 1)), from: r[0], to: r[1], color: ACTC[idx % ACTC.length] };
    });
    return { beats: beats, acts: acts, seqs: [] };
  }

  return { SHEETS: SHEETS, listSheets: listSheets, buildSheet: buildSheet };
});
