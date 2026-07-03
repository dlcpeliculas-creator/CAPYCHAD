'use strict';
/* @capychad/core — punto de entrada del dominio.
   Hoy: re-exporta el motor probado de la v1 (vendor-v1, sincronizado con checksums).
   Mañana: cada pieza se estrangula por un módulo nativo SIN cambiar esta interfaz
   (los consumidores nunca saben si detrás está la v1 o el reemplazo). */
const engine = require('./engine');
const model = require('./model/paragraph');
const audio = require('./audio');

module.exports = {
  engine: engine,
  model: model,
  audio: audio
};
