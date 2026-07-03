'use strict';
/* Renderer del shell desktop: cablea editor-core + prefs + a11y + feedback.
   Todo llega por el bundle global `Capy`; la plataforma por `window.capy` (preload). */
(function () {
  if (!window.Capy) {
    document.getElementById('statusBar').textContent = 'Falta capy.bundle.js — corré `npm run build:web` en la raíz.';
    return;
  }
  var Capy = window.Capy;

  /* ---------- Anunciador (aria-live) + verbosidad ---------- */
  var announcer = Capy.a11y.makeAnnouncer(document);

  /* VOZ PROPIA (self-voicing, docs/herramientas-a11y.md §6): con la pref activada, la app
     lee sus propios avisos con la voz del sistema — sirve sin lector instalado. Se engancha
     en el ÚNICO punto por donde pasan todos los anuncios, así ninguna función futura se la
     olvida. Silenciosa durante la Lectura (no pelea con el table read). */
  function sayOwn(text) {
    try {
      if (!prefs || !prefs.get('selfVoice')) return;
      if (!window.speechSynthesis) return;
      if (typeof reading === 'object' && reading && reading.active) return;
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(String(text));
      u.lang = 'es';
      u.rate = parseFloat(prefs.get('readRate')) || 1;
      var vs = esVoices();
      if (vs.length) u.voice = vs[0];
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }
  var rawAnnounce = announcer.announce.bind(announcer);
  announcer.announce = function (msg, urgent) { rawAnnounce(msg, urgent); sayOwn(msg); };
  function verbosity() { return prefs ? prefs.get('announceVerbosity') : 'alta'; }
  function announce(msg, urgent, level) {
    /* level: 'alta' (todo) · 'media' (tipos/confirmaciones) · 'baja' (solo confirmaciones) */
    var v = verbosity();
    if (v === 'baja' && level === 'alta') return;
    if (v === 'media' && level === 'alta') return;
    announcer.announce(msg, urgent);
  }

  /* ---------- Preferencias (el registro manda) ---------- */
  var prefs = Capy.prefs.make({
    announce: function (m) { announcer.announce(m); },
    hooks: {
      typewriter: function () { centerCurrent(); },
      telemetry: function (v) { if (window.capy && window.capy.telemetrySetConsent) window.capy.telemetrySetConsent(!!v); }
    }
  });
  prefs.apply();

  /* Consentimiento de telemetría: UNA pregunta, recién en el 2º arranque (patrón v1). */
  if (window.capy && window.capy.telemetryState) {
    window.capy.telemetryState().then(function (st) {
      if (st && typeof st.consent === 'boolean') prefs.set('telemetry', st.consent, { silent: true });
      if (st && st.shouldAsk) {
        setTimeout(function () {
          announcer.announce('Una pregunta única: ¿querés enviar reportes de errores anónimos si la app falla? Sin tus guiones ni datos personales. Podés activarlo o dejarlo apagado en Personalización, opción Enviar reportes. Por ahora queda apagado.');
          window.capy.telemetrySetConsent(false); // "no" explícito hasta que la persona lo active — jamás por defecto
        }, 1500);
      }
    }).catch(function () {});
  }

  /* Detección de lector de pantalla (docs/herramientas-a11y.md §6): si Chromium detecta
     NVDA/JAWS/Narrator, se confirma en voz alta que el modo no vidente está activo.
     Si la API no responde (regresión conocida), no pasa nada: el modo ya viene activado. */
  if (window.capy && window.capy.a11yState) {
    window.capy.a11yState().then(function (st) {
      if (st && st.screenReader) {
        setTimeout(function () {
          announce('Lector de pantalla detectado. El modo no vidente de CAPYCHAD está activo: cada línea se anuncia al navegar.', false, 'baja');
        }, 900);
      }
    }).catch(function () {});
    if (window.capy.onA11yChanged) {
      window.capy.onA11yChanged(function (on) {
        if (on) announce('Lector de pantalla detectado. Modo no vidente activo.', false, 'baja');
      });
    }
  }

  /* ---------- Editor: core puro + binding fino ---------- */
  var ed = Capy.editor.make({ announce: function (m) { announce(m, false, 'media'); } });
  var hoja = document.getElementById('hoja');

  function renderBlocks() {
    hoja.innerHTML = '';
    ed.blocks().forEach(function (b, k) {
      var d = document.createElement('div');
      d.className = 'blk ' + b.t;
      d.dataset.el = b.t;
      d.dataset.ph = ed.placeholder(b.t);
      d.contentEditable = 'true';
      d.spellcheck = true;
      d.textContent = b.text;
      d.addEventListener('focus', function () {
        var moved = ed.index() !== k;
        ed.setIndex(k);
        if (moved) announceCaret();
      });
      hoja.appendChild(d);
    });
  }
  function blockEl(k) { return hoja.children[k]; }
  function focusBlock(k, toEnd) {
    var el = blockEl(k); if (!el) return;
    el.focus();
    if (toEnd) {
      var r = document.createRange(); r.selectNodeContents(el); r.collapse(false);
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
    }
    centerCurrent();
  }
  function centerCurrent() {
    if (prefs.get('typewriter')) {
      var el = blockEl(ed.index());
      if (el && el.scrollIntoView) el.scrollIntoView({ block: 'center', behavior: 'auto' });
    }
  }
  function syncCurrentFromDom() {
    var el = blockEl(ed.index());
    if (el) ed.setText(el.textContent);
  }
  function refreshCurrent() {
    var el = blockEl(ed.index()), b = ed.current();
    if (!el) return;
    el.className = 'blk ' + b.t; el.dataset.el = b.t; el.dataset.ph = ed.placeholder(b.t);
    if (el.textContent !== b.text) el.textContent = b.text;
  }

  /* Lectura de cursor: SIEMPRE activa en modo no vidente (mandato de la casa). */
  function announceCaret() {
    if (prefs.get('a11yMode') || verbosity() === 'alta') {
      announcer.announce(ed.lineAnnouncement());
    }
  }
  function caretAtStart(el) {
    var s = window.getSelection();
    return !s.rangeCount || (s.getRangeAt(0).startOffset === 0 && s.isCollapsed);
  }
  function caretAtEnd(el) {
    var s = window.getSelection();
    if (!s.rangeCount || !s.isCollapsed) return false;
    return s.getRangeAt(0).endOffset >= (el.textContent || '').length;
  }

  hoja.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      var el = blockEl(ed.index());
      var down = e.key === 'ArrowDown';
      if (el && (down ? caretAtEnd(el) : caretAtStart(el))) {
        var target = ed.index() + (down ? 1 : -1);
        if (target >= 0 && target < ed.blocks().length) {
          e.preventDefault();
          syncCurrentFromDom();
          ed.setIndex(target);
          focusBlock(target, !down);
          announceCaret();
          return;
        }
      }
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      syncCurrentFromDom();
      ed.cycleType(e.shiftKey ? -1 : 1);
      refreshCurrent();
      focusBlock(ed.index(), true);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      syncCurrentFromDom();
      ed.enter();
      renderBlocks();
      focusBlock(ed.index(), false);
    } else if (e.key === 'Backspace') {
      var el = blockEl(ed.index());
      if (el && el.textContent === '' && ed.index() > 0) {
        e.preventDefault();
        ed.backspaceJoin();
        renderBlocks();
        focusBlock(ed.index(), true);
      }
    }
  });
  hoja.addEventListener('input', function () { syncCurrentFromDom(); centerCurrent(); });

  renderBlocks(); focusBlock(0, false);

  /* ---------- Autoguardado: debounce tras escribir + tic de respaldo (regla: ≤60s de pérdida) ---------- */
  var autosaveTimer = null, autosaveDirty = false, lastSavedText = '';
  function currentFountain() {
    return Capy.core.engine.paragraphsToFountain(ed.toParagraphs());
  }
  function autosaveNow(announceIt) {
    if (!window.capy || !window.capy.autosaveWrite) return;
    syncCurrentFromDom();
    var text = currentFountain();
    if (text === lastSavedText && !announceIt) return;
    window.capy.autosaveWrite(text).then(function (r) {
      if (r && r.ok) {
        lastSavedText = text; autosaveDirty = false;
        status('Guardado ✓ ' + new Date().toLocaleTimeString());
        if (announceIt) announce('Guardado.', false, 'baja');
      } else if (announceIt) {
        announce('No pude guardar: ' + (r && r.error ? r.error : 'error desconocido'), true, 'baja');
      }
    });
  }
  function scheduleAutosave() {
    autosaveDirty = true;
    if (autosaveTimer) clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(function () { autosaveNow(false); }, 1500);
  }
  ed.onChange(function () { scheduleAutosave(); });
  hoja.addEventListener('input', scheduleAutosave);
  setInterval(function () { if (autosaveDirty) autosaveNow(false); }, 30000);
  window.addEventListener('beforeunload', function () { try { autosaveNow(false); } catch (e) {} });
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) { e.preventDefault(); autosaveNow(true); }
  });

  /* Restauración al abrir: si hay autosave y la hoja está vacía, se recupera y se anuncia. */
  if (window.capy && window.capy.autosaveRead) {
    window.capy.autosaveRead().then(function (r) {
      if (!r || !r.ok || !r.text || !r.text.trim()) return;
      if (!ed.isEmpty()) return;
      var paras = Capy.core.engine.fountainToParagraphs(r.text);
      if (!paras.length) return;
      ed.fromParagraphs(paras);
      renderBlocks(); focusBlock(0, false);
      lastSavedText = r.text;
      announce('Se restauró tu último guion: ' + Capy.core.model.sceneCount(paras) + ' escenas. Todo lo que escribas se guarda solo.', false, 'baja');
    }).catch(function () {});
  }

  /* ---------- Exportar / Abrir (puertos de plataforma) ---------- */
  function announceExport(fmt, r) {
    if (r && r.ok) { announce('Guion exportado en formato ' + fmt + '. Carpeta: ' + String(r.filePath || '').replace(/[^\\\/]+$/, '') + '.', false, 'baja'); status('Exportado: ' + r.filePath); }
    else if (r && r.canceled) { announce('Exportación cancelada.', false, 'baja'); focusBlock(ed.index(), true); }
    else { announce('No se pudo exportar' + (r && r.error ? ': ' + r.error : '.'), true, 'baja'); }
  }
  function status(msg) { document.getElementById('statusBar').textContent = msg; }

  document.getElementById('btnExport').addEventListener('click', function () {
    syncCurrentFromDom();
    var fountain = Capy.core.engine.paragraphsToFountain(ed.toParagraphs());
    if (!window.capy) { status('Bridge de plataforma no disponible.'); return; }
    window.capy.saveScript({ text: fountain, defaultName: 'guion.fountain', kind: 'fountain' }).then(function (r) { announceExport('Fountain', r); });
  });
  document.getElementById('btnOpen').addEventListener('click', function () {
    if (!window.capy) return;
    window.capy.openScript().then(function (r) {
      if (!r || !r.ok) { if (r && !r.canceled) announce('No se pudo abrir: ' + (r.error || ''), true, 'baja'); return; }
      var paras = /\.fdx$/i.test(r.name || '') ? Capy.core.engine.fdxToParagraphs(r.text) : Capy.core.engine.fountainToParagraphs(r.text);
      ed.fromParagraphs(paras);
      renderBlocks(); focusBlock(0, false);
      hoja.classList.remove('capy-page-enter'); void hoja.offsetWidth; hoja.classList.add('capy-page-enter');
      announce('Guion abierto: ' + (r.name || '') + '. ' + Capy.core.model.sceneCount(paras) + ' escenas.', false, 'baja');
    });
  });

  /* ---------- Diálogos accesibles (foco atrapado + Escape) ---------- */
  function dialog(idModal, onOpen) {
    var m = document.getElementById(idModal);
    var prev = null;
    function focusables() { return m.querySelectorAll('button,select,textarea,input,[tabindex]'); }
    function open() {
      prev = document.activeElement;
      m.style.display = 'flex';
      if (onOpen) onOpen();
      /* Foco DIFERIDO (issue #1, parte 2): si el foco entra en el mismo tick en que el
         diálogo se hace visible, el árbol de accesibilidad de Chromium puede no estar
         listo y NVDA lee a medias (o nada). Un respiro de 50ms lo hace determinístico. */
      var f = focusables();
      if (f.length) setTimeout(function () { f[0].focus(); }, 50);
    }
    function close() {
      m.style.display = 'none';
      if (prev && prev.focus) prev.focus();
    }
    m.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.stopPropagation(); close(); }
      if (e.key === 'Tab') {
        var f = focusables(); if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    return { open: open, close: close };
  }

  /* ---------- Panel de Personalización: AUTOGENERADO del registro ---------- */
  var prefsDlg = dialog('prefsModal', buildPrefsPanel);
  function buildPrefsPanel() {
    var box = document.getElementById('prefsFields');
    box.innerHTML = '';
    prefs.registry().forEach(function (p) {
      var row = document.createElement('div'); row.className = 'prow';
      var lab = document.createElement('label'); lab.className = 'flabel'; lab.textContent = p.label; lab.htmlFor = 'pref_' + p.id;
      var desc = document.createElement('p'); desc.className = 'muted small'; desc.id = 'prefd_' + p.id; desc.textContent = p.describe || '';
      var ctl;
      if (p.type === 'toggle') {
        ctl = document.createElement('input'); ctl.type = 'checkbox'; ctl.checked = !!prefs.get(p.id);
        ctl.addEventListener('change', function () { prefs.set(p.id, ctl.checked); });
      } else {
        ctl = document.createElement('select'); ctl.className = 'capy-input';
        (p.options || []).forEach(function (o) {
          var op = document.createElement('option'); op.value = o[0]; op.textContent = o[1];
          if (String(prefs.get(p.id)) === String(o[0])) op.selected = true;
          ctl.appendChild(op);
        });
        ctl.addEventListener('change', function () { prefs.set(p.id, ctl.value); });
      }
      ctl.id = 'pref_' + p.id; ctl.setAttribute('aria-describedby', desc.id);
      row.appendChild(lab); row.appendChild(ctl); row.appendChild(desc);
      box.appendChild(row);
    });
  }
  document.getElementById('btnPrefs').addEventListener('click', prefsDlg.open);
  document.getElementById('prefsClose').addEventListener('click', prefsDlg.close);
  document.getElementById('prefsReset').addEventListener('click', function () { prefs.reset(); buildPrefsPanel(); });

  /* ---------- Feedback in-app (Alt+Shift+F) ---------- */
  var fb = Capy.feedback.make({
    context: function () {
      return { version: '0.1.0', prefs: prefs.all(), a11yLikely: verbosity() !== 'baja' };
    },
    store: function (r) { return window.capy && window.capy.sendFeedback ? window.capy.sendFeedback(r) : Promise.resolve(true); },
    send: function () { return Promise.resolve({ via: 'local' }); }
  });
  var fbDlg = dialog('fbModal', function () {
    var sel = document.getElementById('fbCat');
    if (!sel.options.length) {
      Capy.feedback.CATEGORIES.forEach(function (c) {
        var op = document.createElement('option'); op.value = c[0]; op.textContent = c[1]; sel.appendChild(op);
      });
    }
    /* Cinturón y tiradores: el estado del Tipo se anuncia SIEMPRE por aria-live al abrir,
       sin depender de que NVDA lea el foco del selector (issue #1 del checklist). */
    var opt = sel.options[sel.selectedIndex];
    announce('Comentarios. Tipo: ' + (opt ? opt.textContent : '') + '. Hay ' + sel.options.length +
      ' tipos; elegí con las flechas. Tab pasa al mensaje.', false, 'baja');
  });
  /* Y cada cambio de Tipo se confirma por voz — aunque el lector no lea el selector. */
  document.getElementById('fbCat').addEventListener('change', function () {
    var sel = document.getElementById('fbCat');
    var opt = sel.options[sel.selectedIndex];
    if (opt) announce('Tipo: ' + opt.textContent + '.', false, 'baja');
  });
  document.getElementById('btnFeedback').addEventListener('click', fbDlg.open);
  document.getElementById('fbCancel').addEventListener('click', fbDlg.close);
  document.getElementById('fbSend').addEventListener('click', function () {
    fb.submit({
      category: document.getElementById('fbCat').value,
      message: document.getElementById('fbMsg').value,
      email: document.getElementById('fbMail').value
    }).then(function (r) {
      if (!r.ok) { announce('Escribí un mensaje antes de enviar.', true, 'baja'); return; }
      document.getElementById('fbMsg').value = '';
      fbDlg.close();
      announce(r.report.priority === 'alta'
        ? 'Reporte de accesibilidad enviado. Va primero en la cola — gracias.'
        : 'Comentario enviado. Gracias por ayudar a mejorar CAPYCHAD.', false, 'baja');
    });
  });

  /* ---------- Lectura (table read): voces del sistema, una por personaje ---------- */
  var reading = { active: false, paused: false, timer: null, lastBlock: -1 };

  function esVoices() {
    var all = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
    var es = all.filter(function (v) { return /^es/i.test(v.lang); });
    return es.length ? es : all;
  }
  function voiceMap(cast) {
    var vs = esVoices(), map = {};
    cast.forEach(function (who, k) { map[who] = vs.length ? vs[k % vs.length] : null; });
    return map;
  }
  function highlightSeg(seg, fromIdx) {
    var blocks = hoja.children;
    for (var k = Math.max(0, fromIdx); k < blocks.length; k++) {
      if ((blocks[k].textContent || '').indexOf((seg.text || '').slice(0, 40)) >= 0) {
        for (var j = 0; j < blocks.length; j++) blocks[j].classList.remove('reading');
        blocks[k].classList.add('reading');
        if (blocks[k].scrollIntoView) blocks[k].scrollIntoView({ block: 'center' });
        return k;
      }
    }
    return fromIdx;
  }
  function stopReading(announceIt) {
    reading.active = false; reading.paused = false; reading.toggle = null;
    if (reading.timer) { clearTimeout(reading.timer); reading.timer = null; }
    try { window.speechSynthesis.cancel(); } catch (e) {}
    Array.prototype.forEach.call(hoja.children, function (b) { b.classList.remove('reading'); });
    var btn = document.getElementById('btnRead');
    btn.setAttribute('aria-pressed', 'false'); btn.textContent = 'Lectura';
    if (announceIt) announce('Lectura detenida.', false, 'baja');
    focusBlock(ed.index(), true);
  }
  function startReading() {
    if (!window.speechSynthesis) { announce('Este equipo no tiene voces del sistema disponibles.', true, 'baja'); return; }
    syncCurrentFromDom();
    var segs = Capy.core.audio.buildSegments(ed.toParagraphs());
    if (!segs.length) { announce('No hay nada para leer todavía.', false, 'baja'); return; }
    var cast = Capy.core.audio.castFromSegments(segs);
    var voices = voiceMap(cast);
    var rate = parseFloat(prefs.get('readRate')) || 1;
    reading.active = true; reading.paused = false; reading.lastBlock = -1;
    var btn = document.getElementById('btnRead');
    btn.setAttribute('aria-pressed', 'true'); btn.textContent = 'Detener';
    announce('Lectura iniciada: ' + cast.length + ' voces. Espacio pausa; Escape detiene.', false, 'baja');
    var i = 0;
    /* Pausa DETERMINÍSTICA (fix del checklist D2): speechSynthesis.pause() es poco fiable
       en Windows, así que pausar = cancelar recordando el segmento; reanudar relee esa
       línea desde el principio (mejor para retomar el hilo de la escena). */
    reading.toggle = function () {
      if (!reading.active) return;
      if (!reading.paused) {
        reading.paused = true;
        if (reading.timer) { clearTimeout(reading.timer); reading.timer = null; }
        i = Math.max(0, i - 1); // el segmento que estaba sonando
        try { window.speechSynthesis.cancel(); } catch (e) {}
        announce('Lectura en pausa. Espacio reanuda.', false, 'baja');
      } else {
        reading.paused = false;
        announce('Lectura reanudada.', false, 'baja');
        next();
      }
    };
    function next() {
      if (!reading.active || reading.paused) return;
      if (i >= segs.length) { stopReading(false); announce('Lectura completa.', false, 'baja'); return; }
      var s = segs[i++];
      reading.lastBlock = highlightSeg(s, reading.lastBlock + 0);
      var u = new SpeechSynthesisUtterance(s.text);
      u.lang = 'es'; u.rate = rate;
      if (voices[s.speaker]) u.voice = voices[s.speaker];
      u.onend = function () {
        if (!reading.active || reading.paused) return;
        reading.timer = setTimeout(next, Math.min(900, s.pauseAfter || 250));
      };
      u.onerror = function () { if (reading.active && !reading.paused) next(); };
      window.speechSynthesis.speak(u);
    }
    /* getVoices() puede llegar async la primera vez */
    if (!esVoices().length && window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = function () { window.speechSynthesis.onvoiceschanged = null; startReading(); };
      window.speechSynthesis.getVoices();
      reading.active = false;
      return;
    }
    next();
  }
  document.getElementById('btnRead').addEventListener('click', function () {
    if (reading.active) stopReading(true); else startReading();
  });

  /* ---------- Ayuda (wiki interna, F1) ---------- */
  var helpDlg = dialog('helpModal', buildHelp);
  function buildHelp() {
    var box = document.getElementById('helpBody');
    if (box.childElementCount) return;
    Capy.wiki.ENTRIES.forEach(function (w) {
      var sec = document.createElement('section');
      var h = document.createElement('h3'); h.textContent = w.title; h.style.cssText = 'font:var(--font-h3);margin:14px 0 2px';
      var r = document.createElement('p'); r.className = 'muted small'; r.textContent = w.resumen; r.style.fontWeight = '600';
      var a = document.createElement('p'); a.className = 'muted small'; a.textContent = w.accion;
      sec.appendChild(h); sec.appendChild(r); sec.appendChild(a);
      if (w.atajos.length) {
        var k = document.createElement('p'); k.className = 'muted small';
        k.textContent = 'Atajos: ' + w.atajos.map(function (x) { return x[0] + ' (' + x[1] + ')'; }).join(' · ');
        sec.appendChild(k);
      }
      box.appendChild(sec);
    });
  }
  document.getElementById('btnHelp').addEventListener('click', helpDlg.open);
  document.getElementById('helpClose').addEventListener('click', helpDlg.close);
  document.getElementById('helpBrowser').addEventListener('click', function () {
    if (window.capy && window.capy.openWiki) {
      window.capy.openWiki(Capy.wiki.renderHtml({ version: '0.1.0' })).then(function (r) {
        announce(r && r.ok ? 'Manual abierto en el navegador.' : 'No pude abrir el navegador; el manual quedó guardado.', false, 'baja');
      });
    }
  });

  /* ---------- Tutorial de voz (Alt+Shift+T) ---------- */
  var tut = Capy.tutorial.make({
    announce: function (m) { announcer.announce(m); },
    scan: function () { syncCurrentFromDom(); return ed.blocks(); },
    onDone: function () { try { localStorage.setItem('capychad2_tutorial_done', '1'); } catch (e) {} }
  });

  /* ---------- Bienvenida (solo el primer arranque) ---------- */
  var welcomeDlg = dialog('welcomeModal');
  document.getElementById('wStart').addEventListener('click', function () { welcomeDlg.close(); focusBlock(0, false); });
  document.getElementById('wTutorial').addEventListener('click', function () { welcomeDlg.close(); focusBlock(0, false); tut.start(); });
  document.getElementById('wHelp').addEventListener('click', function () { welcomeDlg.close(); helpDlg.open(); });
  document.getElementById('wNvda').addEventListener('click', function () {
    if (window.capy && window.capy.openLink) {
      window.capy.openLink('https://www.nvaccess.org/download/').then(function (r) {
        announce(r && r.ok ? 'Se abrió la página oficial de descarga de NVDA en tu navegador.' : 'No pude abrir el navegador.', false, 'baja');
      });
    }
  });
  try {
    if (!localStorage.getItem('capychad2_welcomed')) {
      localStorage.setItem('capychad2_welcomed', '1');
      setTimeout(function () {
        welcomeDlg.open();
        announcer.announce('Bienvenido a CAPYCHAD, el editor de guion en español accesible desde el primer minuto. El modo no vidente está activo. Hay tres opciones: Empezar a escribir, Tutorial de voz, o Ayuda.');
      }, 400);
    }
  } catch (e) {}

  /* ---------- Atajos globales ---------- */
  document.addEventListener('keydown', function (e) {
    if (e.altKey && e.shiftKey && (e.key === 'F' || e.key === 'f')) { e.preventDefault(); fbDlg.open(); }
    if (e.altKey && e.shiftKey && (e.key === 'H' || e.key === 'h')) { e.preventDefault(); prefs.set('highContrast', !prefs.get('highContrast')); }
    if (e.altKey && e.shiftKey && (e.key === 'P' || e.key === 'p')) { e.preventDefault(); prefsDlg.open(); }
    if (e.altKey && e.shiftKey && (e.key === 'L' || e.key === 'l')) { e.preventDefault(); reading.active ? stopReading(true) : startReading(); }
    if (e.altKey && e.shiftKey && (e.key === 'T' || e.key === 't')) { e.preventDefault(); if (!tut.isActive()) { focusBlock(ed.index(), true); tut.start(); } }
    if (e.key === 'F1') { e.preventDefault(); helpDlg.open(); }
    if (e.key === 'Escape' && tut.isActive()) { tut.cancel(); }
    if (reading.active) {
      if (e.key === 'Escape') { e.preventDefault(); stopReading(true); }
      /* Durante la Lectura, Espacio = pausa/reanuda SIEMPRE (convención de reproductor),
         incluso con el foco en la hoja — antes una guardia de foco lo tragaba (bug D2).
         Solo se respeta la escritura en campos de texto de diálogos (Comentarios, etc.). */
      if (e.key === ' ') {
        var tg = (document.activeElement && document.activeElement.tagName) || '';
        if (tg !== 'TEXTAREA' && tg !== 'INPUT' && tg !== 'SELECT') {
          e.preventDefault();
          if (reading.toggle) reading.toggle();
        }
      }
    }
  });
})();
