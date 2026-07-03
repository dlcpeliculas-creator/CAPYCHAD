/* CAPYCHAD · Audiodrama — núcleo puro (Node y navegador).
   - buildSegments(): convierte el guion (paras) en una lista de "tomas" de doblaje
     (narrador para acción/encabezados/transiciones; voz del personaje en diálogos).
   - utilidades WAV (PCM 16-bit): sólo se usan en Node (main.js). Referencian Buffer
     dentro de las funciones, así que el módulo carga igual en el navegador. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CapyAudio = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ---------- guion → segmentos ---------- */
  function buildSegments(paras, opt) {
    opt = opt || {};
    const narrName = opt.narratorName || 'NARRADOR';
    const voices = opt.voices || {};                 // { PERSONAJE: voiceId }
    const narrVoice = opt.narratorVoice || voices[narrName] || '';
    const wantAction = opt.includeAction !== false;
    const wantHeads = opt.includeHeadings !== false;
    const wantParen = opt.includeParenthetical !== false;
    const segs = []; let last = null;
    for (const p of (paras || [])) {
      const t = p.type, x = String(p.text || '').trim();
      if (!x) continue;
      if (t === 'Scene Heading') { if (wantHeads) segs.push(seg('scene', narrName, narrVoice, x, 700)); last = null; }
      else if (t === 'Character') { last = x.replace(/\s*\^\s*$/, '').toUpperCase().trim(); }
      else if (t === 'Parenthetical') { if (wantParen) segs.push(seg('paren', narrName, narrVoice, x.replace(/^\(|\)$/g, ''), 150)); }
      else if (t === 'Dialogue') { const who = last || 'PERSONAJE'; segs.push(seg('dialogue', who, voices[who] || opt.defaultVoice || '', x, 350)); }
      else if (t === 'Transition') { if (wantHeads) segs.push(seg('transition', narrName, narrVoice, x, 500)); }
      else if (t === 'Action' || t === 'General') { if (wantAction) segs.push(seg('action', narrName, narrVoice, x, 250)); }
      /* Summary / Note / etc. → se omiten del audio */
    }
    return segs;
  }
  function seg(role, speaker, voice, text, pauseAfter) { return { role, speaker, voice, text, pauseAfter }; }

  function castOf(segments) {
    const set = []; segments.forEach(s => { if (set.indexOf(s.speaker) < 0) set.push(s.speaker); });
    return set;
  }
  /* Devuelve las tomas de la PRIMERA escena (para previsualizar sin renderizar todo). */
  function firstSceneSlice(segments) {
    if (!segments || !segments.length) return [];
    let start = segments.findIndex(s => s.role === 'scene'); if (start < 0) start = 0;
    let end = -1;
    for (let i = start + 1; i < segments.length; i++) { if (segments[i].role === 'scene') { end = i; break; } }
    const slice = segments.slice(start, end < 0 ? Math.min(segments.length, start + 8) : end);
    return slice.length ? slice : segments.slice(0, Math.min(8, segments.length));
  }

  /* ---------- WAV (PCM 16-bit) — sólo Node ---------- */
  function wavHeader(dataLen, sampleRate, channels, bits) {
    sampleRate = sampleRate || 22050; channels = channels || 1; bits = bits || 16;
    const blockAlign = channels * bits / 8, byteRate = sampleRate * blockAlign;
    const b = Buffer.alloc(44);
    b.write('RIFF', 0); b.writeUInt32LE(36 + dataLen, 4); b.write('WAVE', 8);
    b.write('fmt ', 12); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20);
    b.writeUInt16LE(channels, 22); b.writeUInt32LE(sampleRate, 24); b.writeUInt32LE(byteRate, 28);
    b.writeUInt16LE(blockAlign, 32); b.writeUInt16LE(bits, 34);
    b.write('data', 36); b.writeUInt32LE(dataLen, 40);
    return b;
  }
  function pcmToWav(pcm, sampleRate, channels, bits) {
    return Buffer.concat([wavHeader(pcm.length, sampleRate, channels, bits), pcm]);
  }
  function parseWav(buf) {
    if (buf.length < 44 || buf.toString('ascii', 0, 4) !== 'RIFF') throw new Error('no es WAV RIFF');
    let off = 12, sampleRate = 22050, channels = 1, bits = 16, data = null;
    while (off + 8 <= buf.length) {
      const id = buf.toString('ascii', off, off + 4); const sz = buf.readUInt32LE(off + 4); const body = off + 8;
      if (id === 'fmt ') { channels = buf.readUInt16LE(body + 2); sampleRate = buf.readUInt32LE(body + 4); bits = buf.readUInt16LE(body + 14); }
      else if (id === 'data') { data = buf.slice(body, body + sz); }
      off = body + sz + (sz % 2);
    }
    if (!data) throw new Error('sin chunk data');
    return { sampleRate, channels, bits, pcm: data };
  }
  function silencePcm(ms, sampleRate, channels, bits) {
    const n = Math.round((sampleRate || 22050) * (ms || 0) / 1000) * (channels || 1) * ((bits || 16) / 8);
    return Buffer.alloc(n);
  }
  function concatPcm(parts) { return Buffer.concat(parts); }
  function resamplePcm(pcm, fromRate, toRate) {
    if (!fromRate || fromRate === toRate) return pcm;
    const inN = Math.floor(pcm.length / 2), ratio = toRate / fromRate, outN = Math.max(1, Math.round(inN * ratio));
    const out = Buffer.alloc(outN * 2);
    for (let i = 0; i < outN; i++) {
      const pos = i / ratio, i0 = Math.floor(pos), i1 = Math.min(inN - 1, i0 + 1), frac = pos - i0;
      const s0 = pcm.readInt16LE(i0 * 2), s1 = pcm.readInt16LE(i1 * 2);
      let v = Math.round(s0 + (s1 - s0) * frac); if (v > 32767) v = 32767; else if (v < -32768) v = -32768;
      out.writeInt16LE(v, i * 2);
    }
    return out;
  }
  /* Low-pass biquad (2 polos) sobre PCM 16-bit. Quita la aspereza/aliasing de agudos
     que producen las voces de baja calidad o un Piper saturado. fc en Hz. */
  function lowpassPcm(pcm, sampleRate, fc, q) {
    sampleRate = sampleRate || 22050; fc = fc || 7000; q = q || 0.707;
    if (fc >= sampleRate / 2) return pcm;
    const n = Math.floor(pcm.length / 2); if (n < 2) return pcm;
    const w0 = 2 * Math.PI * fc / sampleRate, a = Math.sin(w0) / (2 * q), c = Math.cos(w0);
    let b0 = (1 - c) / 2, b1 = 1 - c, b2 = (1 - c) / 2, a0 = 1 + a, a1 = -2 * c, a2 = 1 - a;
    b0 /= a0; b1 /= a0; b2 /= a0; a1 /= a0; a2 /= a0;
    const out = Buffer.alloc(n * 2);
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    for (let i = 0; i < n; i++) {
      const xi = pcm.readInt16LE(i * 2);
      let yi = b0 * xi + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
      x2 = x1; x1 = xi; y2 = y1; y1 = yi;
      let v = Math.round(yi); if (v > 32767) v = 32767; else if (v < -32768) v = -32768;
      out.writeInt16LE(v, i * 2);
    }
    return out;
  }
  /* Normaliza el PCM a un pico objetivo (por defecto ~-2 dBFS) y le quita el DC.
     Evita el clipping/overdrive que ensucia el audio. */
  function normalizePcm(pcm, targetPeak) {
    targetPeak = targetPeak || 26000;
    const n = Math.floor(pcm.length / 2); if (n < 1) return pcm;
    let sum = 0, peak = 1;
    for (let i = 0; i < n; i++) { const s = pcm.readInt16LE(i * 2); sum += s; if (Math.abs(s) > peak) peak = Math.abs(s); }
    const dc = sum / n, g = targetPeak / Math.max(1, peak - Math.abs(dc));
    if (g >= 0.999 && g <= 1.001 && Math.abs(dc) < 2) return pcm;
    const out = Buffer.alloc(n * 2);
    for (let i = 0; i < n; i++) {
      let v = Math.round((pcm.readInt16LE(i * 2) - dc) * g);
      if (v > 32767) v = 32767; else if (v < -32768) v = -32768;
      out.writeInt16LE(v, i * 2);
    }
    return out;
  }

  return { buildSegments, castOf, firstSceneSlice, wavHeader, pcmToWav, parseWav, silencePcm, concatPcm, resamplePcm, lowpassPcm, normalizePcm };
});
