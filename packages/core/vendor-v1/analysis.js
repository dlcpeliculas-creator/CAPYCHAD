/* GUIÓN·IA — Análisis de producción (puro JS, navegador y Node).
   Entrada: paras = [{type,text,meta}]. */
(function (root, factory){
  if (typeof module==='object'&&module.exports) module.exports=factory();
  else root.GuionAnalysis=factory();
})(typeof self!=='undefined'?self:this, function(){
  'use strict';
  const HEAD=/^(INT\/EXT|I\/E|INT|EXT|EST)/i;
  function analyze(paras){
    const scenes=[], charLines={}; let cur=null, last=null;
    for(const p of paras){
      const t=p.type, x=p.text||'', m=p.meta||{};
      if(t==='Scene Heading'){
        const up=x.toUpperCase();
        const io=(up.match(HEAD)||[''])[0];
        const tm=up.match(/-\s*([A-ZÁÉÍÓÚÑ ]+)$/); const tod=tm?tm[1].trim():'';
        let loc=up.replace(/^(INT\/EXT|I\/E|INT|EXT|EST)\.?\s*/,'').replace(/\s*-\s*[A-ZÁÉÍÓÚÑ ]+$/,'').trim();
        cur={head:x,io,tod,loc,lines:0,chars:new Set(),speak:{},elements:new Set(),no:m.scene_no||null};
        scenes.push(cur); last=null;
      } else if(t==='Character'){ last=x.toUpperCase(); if(cur)cur.chars.add(last); }
      else if(t==='Dialogue'){ if(cur&&last){ charLines[last]=(charLines[last]||0)+1; cur.lines++; cur.speak[last]=(cur.speak[last]||0)+1; } }
      else if(t==='Action'||t==='General'){ if(cur){ cur.lines+=Math.max(1,Math.floor(x.length/58)+1);
        (x.match(/\b[A-ZÁÉÍÓÚÑ]{3,}\b/g)||[]).forEach(w=>cur.elements.add(w)); } }
    }
    const names=new Set(Object.keys(charLines));
    scenes.forEach(s=>{ s.elements=[...s.elements].filter(e=>!names.has(e)&&!s.chars.has(e)).map(e=>e.charAt(0)+e.slice(1).toLowerCase()).sort();
      // presentes = personajes nombrados en acción (en mayúscula) + los que hablan
      s.present=new Set([...s.chars]);
    });
    // detectar presencia por acción: personajes conocidos nombrados en acción
    let ci=0;
    for(const p of paras){ if(p.type==='Scene Heading'){ ci++; }
      else if((p.type==='Action'||p.type==='General')&&ci>0){ const sc=scenes[ci-1];
        (p.text.match(/\b[A-ZÁÉÍÓÚÑ]{2,}\b/g)||[]).forEach(w=>{ if(names.has(w)) sc.present.add(w); }); } }
    const totalLines=scenes.reduce((a,s)=>a+s.lines+2,0);
    const pages=Math.round(Math.max(1,totalLines/26)*10)/10;
    const io=count(scenes.map(s=>s.io).filter(Boolean));
    const tod=count(scenes.map(s=>s.tod).filter(Boolean));
    const locations=[...new Set(scenes.map(s=>s.loc).filter(Boolean))];
    const elements=[...new Set([].concat(...scenes.map(s=>s.elements)))].sort();
    const chars=[...new Set(Object.keys(charLines).concat([].concat(...scenes.map(s=>[...s.present]))))];
    return {scenes,charLines,nScenes:scenes.length,pages,minutes:Math.round(pages),io,tod,locations,elements,chars};
  }
  function count(arr){const d={};arr.forEach(k=>d[k]=(d[k]||0)+1);return d;}
  function insertSceneNumber(prev,next,existing){
    const base=(String(prev||'0').match(/\d+/)||['0'])[0];
    const ex=new Set([...existing].map(String));
    for(let i=0;i<26;i++){const c=base+String.fromCharCode(65+i);if(!ex.has(c))return c;}
    return base+'AA';
  }
  return {analyze,insertSceneNumber};
});
