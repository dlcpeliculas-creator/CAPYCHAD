/* GUIÓN·IA — Motor FDX <-> Fountain (puro JS, sirve en navegador y en Node).
   Modelo: paras = [{type, text, meta}] con meta.scene_no y meta.dual="right". */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.GuionEngine = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const TYPES = ["Scene Heading","Action","Character","Parenthetical","Dialogue","Transition","Shot","Summary","New Act","End of Act","Sequence","Cast List","Note","General"];
  const SCENE_RE = /^(\.|INT|EXT|EST|I\/E|INT\.|EXT\.|INT\/EXT)\b/i;
  const SCENE_PREFIX = /^(INT|EXT|EST|I\/E|INT\.|EXT\.|INT\/EXT)/i;
  const TRANS_RE = /(TO:|A:)\s*$/;
  const NUM_RE = /\s*#([\w.\-]+)#\s*$/;

  function isUpper(s){const L=(s.match(/[A-Za-zÁÉÍÓÚÑáéíóúñ]/g)||[]);return L.length>0 && L.every(c=>c===c.toUpperCase());}
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  function unesc(s){return String(s).replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,'&');}

  // ---------- Fountain -> paras ----------
  function fountainToParagraphs(text){
    const raw = text.replace(/\r\n?/g,'\n').split('\n').map(l=>l.replace(/\s+$/,''));
    const paras=[]; let i=0,n=raw.length;
    while(i<n){
      const s=raw[i].trim();
      if(s===''){i++;continue;}
      if(s.startsWith('= ')){ paras.push({type:"Summary",text:s.slice(2).trim(),meta:{}}); i++; continue; }
      // Secciones Fountain ↔ estructura propia: #=Acto, ##=Secuencia, ###=Fin de acto
      if(s[0]==='#'){ const mm=s.match(/^(#+)\s*(.*)$/); const lvl=mm[1].length; const tx=(mm[2]||'').trim();
        const ty = lvl>=3 ? "End of Act" : (lvl===2 ? "Sequence" : "New Act"); paras.push({type:ty,text:tx,meta:{}}); i++; continue; }
      // Notas y reparto ↔ [[ ... ]]
      if(s.startsWith('[[') && s.endsWith(']]')){ const inner=s.slice(2,-2).trim();
        if(/^REPARTO:/i.test(inner)) paras.push({type:"Cast List",text:inner.replace(/^REPARTO:\s*/i,'').trim(),meta:{}});
        else paras.push({type:"Note",text:inner,meta:{}}); i++; continue; }
      // Acción/plano forzado ↔ "!": en MAYÚSCULAS es Plano (Shot); si no, Acción
      if(s[0]==='!'){ const tx=s.slice(1).trim(); paras.push({type:isUpper(tx)?"Shot":"Action",text:tx,meta:{}}); i++; continue; }
      if(SCENE_RE.test(s) || (s.startsWith('.') && !s.startsWith('..'))){
        let heading = s.startsWith('.') ? s.slice(1) : s; const meta={};
        const m = heading.match(NUM_RE);
        if(m){meta.scene_no=m[1];heading=heading.replace(NUM_RE,'');}
        paras.push({type:"Scene Heading",text:heading.trim(),meta});i++;continue;
      }
      if((isUpper(s)&&TRANS_RE.test(s)) || s.startsWith('>')){
        paras.push({type:"Transition",text:s.replace(/^>/,'').trim(),meta:{}});i++;continue;
      }
      const nxt = i+1<n ? raw[i+1].trim() : '';
      const core = s.endsWith('^') ? s.slice(0,-1).trim() : s;
      if(isUpper(core) && nxt!==''){
        const meta = s.endsWith('^') ? {dual:'right'} : {};
        paras.push({type:"Character",text:core,meta});i++;
        while(i<n && raw[i].trim()!==''){
          const d=raw[i].trim();
          if(d.startsWith('(')&&d.endsWith(')')) paras.push({type:"Parenthetical",text:d,meta:{}});
          else paras.push({type:"Dialogue",text:d,meta:{}});
          i++;
        }
        continue;
      }
      paras.push({type:"Action",text:s,meta:{}});i++;
    }
    return paras;
  }

  // ---------- paras -> Fountain ----------
  function paragraphsToFountain(paras){
    const lines=[];
    for(const p of paras){
      const t=p.type,x=p.text||'',m=p.meta||{};
      if(t==="Scene Heading"){ if(lines.length)lines.push(''); let h = SCENE_PREFIX.test(x.toUpperCase())?x:('.'+x); if(m.scene_no)h+=' #'+m.scene_no+'#'; lines.push(h); }
      else if(t==="Action"||t==="General"){ if(lines.length)lines.push(''); lines.push(x); }
      else if(t==="Shot"){ if(lines.length)lines.push(''); lines.push('!'+x.toUpperCase()); }
      else if(t==="Character"){ lines.push(''); let nm=x.toUpperCase(); if(m.dual==='right')nm+=' ^'; lines.push(nm); }
      else if(t==="Parenthetical"){ lines.push(x.startsWith('(')?x:('('+x+')')); }
      else if(t==="Dialogue"){ lines.push(x); }
      else if(t==="Transition"){ lines.push(''); lines.push(x.toUpperCase()); }
      else if(t==="Summary"){ if(lines.length)lines.push(''); lines.push('= '+x); }
      else if(t==="Note"){ if(lines.length)lines.push(''); lines.push('[['+x+']]'); }
      else if(t==="New Act"){ if(lines.length)lines.push(''); lines.push('# '+x); }
      else if(t==="Sequence"){ if(lines.length)lines.push(''); lines.push('## '+x); }
      else if(t==="End of Act"){ if(lines.length)lines.push(''); lines.push('### '+x); }
      else if(t==="Cast List"){ if(lines.length)lines.push(''); lines.push('[[REPARTO: '+x+']]'); }
    }
    return lines.join('\n').trim()+'\n';
  }

  // ---------- FDX -> paras (parser por regex, sirve en Node) ----------
  function fdxToParagraphs(xml){
    const out=[]; const re=/<Paragraph\b([^>]*)>([\s\S]*?)<\/Paragraph>/g; let mm;
    while((mm=re.exec(xml))){
      const attrs=mm[1], body=mm[2];
      const type=(attrs.match(/Type="([^"]*)"/)||[])[1]||"Action";
      const meta={};
      const num=(attrs.match(/Number="([^"]*)"/)||[])[1]; if(num)meta.scene_no=num;
      if(/DualDialogue="Right"/.test(attrs))meta.dual='right';
      let text=''; const tre=/<Text\b[^>]*>([\s\S]*?)<\/Text>/g; let tm;
      while((tm=tre.exec(body)))text+=unesc(tm[1]);
      if(!/<Text/.test(body)){ const self=body.match(/<Text\b[^>]*\/>/); if(self)text=''; }
      out.push({type,text:text.trim(),meta});
    }
    return out;
  }

  // ---------- paras -> FDX ----------
  function paragraphsToFdx(paras){
    const parts=['<?xml version="1.0" encoding="UTF-8" standalone="no" ?>',
      '<FinalDraft DocumentType="Script" Template="No" Version="5">','  <Content>'];
    for(const p of paras){
      const t=p.type,m=p.meta||{}; let a=' Type="'+t+'"';
      if(t==="Scene Heading"&&m.scene_no)a+=' Number="'+m.scene_no+'"';
      if(t==="Character"&&m.dual==='right')a+=' DualDialogue="Right"';
      parts.push('    <Paragraph'+a+'><Text>'+esc(p.text||'')+'</Text></Paragraph>');
    }
    parts.push('  </Content>');parts.push('</FinalDraft>');
    return parts.join('\n')+'\n';
  }


  // ---------- Texto plano "a medio hacer" -> paras (tolerante, sin requerir líneas en blanco) ----------
  function textToParagraphs(text){
    const raw = text.replace(/\r\n?/g,'\n').split('\n');
    const paras=[]; let i=0, n=raw.length;
    const isHead = s => /^(\.|INT|EXT|EST|I\/E|INT\.|EXT\.|INT\/EXT)\b/i.test(s);
    const isCue = s => { const c = s.endsWith('^') ? s.slice(0,-1).trim() : s; return isUpper(c) && c.length<=24 && !isHead(c); };
    const TRANS_WORDS = /^(CORTE A|CORTA A|FUNDIDO|DISOLVENCIA|FADE (IN|OUT)|CUT TO|SMASH CUT|MATCH CUT|DISSOLVE|FUNDE A|FUNDIDO A)\b/i;
    while(i<n){
      let s = raw[i].trim();
      if(s===''){ i++; continue; }
      if(isHead(s)){ let h = s.startsWith('.') ? s.slice(1) : s; const meta={}; const m=h.match(NUM_RE); if(m){meta.scene_no=m[1]; h=h.replace(NUM_RE,'');} paras.push({type:"Scene Heading",text:h.trim(),meta}); i++; continue; }
      if((isUpper(s)&&TRANS_RE.test(s)) || s.startsWith('>') || TRANS_WORDS.test(s)){ paras.push({type:"Transition",text:s.replace(/^>/,'').trim().toUpperCase(),meta:{}}); i++; continue; }
      const nxt = i+1<n ? raw[i+1].trim() : '';
      if(isCue(s) && nxt!=='' && !isHead(nxt)){
        const meta = s.endsWith('^') ? {dual:'right'} : {};
        paras.push({type:"Character", text:(s.endsWith('^')?s.slice(0,-1).trim():s), meta}); i++;
        while(i<n){
          let d = raw[i].trim();
          if(d===''){ i++; break; }
          if(isHead(d) || TRANS_WORDS.test(d)) break;
          const dnxt = i+1<n ? raw[i+1].trim() : '';
          if(isCue(d) && dnxt!=='' && !isHead(dnxt)) break;
          if(d.startsWith('(')&&d.endsWith(')')) paras.push({type:"Parenthetical",text:d,meta:{}});
          else paras.push({type:"Dialogue",text:d,meta:{}});
          i++;
        }
        continue;
      }
      paras.push({type:"Action", text:s, meta:{}}); i++;
    }
    return paras;
  }

  function norm(paras){
    return paras.map(p=>{let x=p.text||'';if(p.type==="Transition"||p.type==="Character")x=x.toUpperCase();
      const m=p.meta||{};const k=[];if(m.scene_no)k.push('scene_no='+m.scene_no);if(m.dual)k.push('dual='+m.dual);
      return p.type+'|'+x+'|'+k.sort().join(',');}).join('\n');
  }

  return { TYPES, fountainToParagraphs, paragraphsToFountain, fdxToParagraphs, paragraphsToFdx, textToParagraphs, norm };
});
