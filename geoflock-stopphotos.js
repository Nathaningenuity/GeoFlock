/* GeoFlock: extra photo pins on tour stops (GF_STOP_PHOTOS: tour id, exact stop title, label, at [lon,lat], Commons file).
   Each becomes an ordinary square photo pin on its stop, credited like the others; a stop that already shows the same
   photo or the same label, or already has 8 pins, is left alone. Load after the tour files and before portraits. */
(function(){
"use strict";
const L=window.GF_STOP_PHOTOS||[];if(!L.length)return;
const strip=s=>String(s==null?"":s).replace(/​/g,"").trim();
let merged=false;
function merge(){try{if(merged)return true;if(typeof PS_PHOTO_DATA==="undefined")return false;if(typeof gfMergeExtra==="function")gfMergeExtra();
 const have=new Map();PS_PHOTO_DATA.forEach((p,i)=>{if(p&&p.f&&!have.has(p.f))have.set(p.f,i)});
 window.PS_SQ_IMG=window.PS_SQ_IMG||{};
 L.forEach(p=>{let i=have.get(p.f);if(i==null){PS_PHOTO_DATA.push({f:p.f,d:p.d,by:p.by,lic:p.lic,page:p.page});i=PS_PHOTO_DATA.length-1;have.set(p.f,i)}
  if(PS_SQ_IMG[p.label]==null)PS_SQ_IMG[p.label]=i;try{if(typeof GF_SQ_FILE!=="undefined"&&!GF_SQ_FILE[p.label])GF_SQ_FILE[p.label]=p.f}catch(e){}});
 merged=true;return true}catch(e){return false}}
const BY=new Map();L.forEach(p=>{const k=p.tour+"|"+p.stop;if(!BY.has(k))BY.set(k,[]);BY.get(k).push(p)});
function add(S,tour){try{if(!S)return;const A=BY.get(tour+"|"+strip(S.title));if(!A)return;if(!merge())return;
 const P=Array.isArray(S.phPins)?S.phPins:[];if(S._gfSpOk===P)return;const labs=new Set(P.map(q=>strip(q&&q.label).toLowerCase()));
 const files=new Set(P.map(q=>{try{const x=psSqPhoto(q);return x&&x.f}catch(e){return null}}).filter(Boolean));try{const m=typeof psPhotoFor==="function"&&psPhotoFor(S);if(m&&m.f)files.add(m.f)}catch(e){}
 const extra=[];A.forEach(p=>{if(P.length+extra.length>=8||labs.has(p.label.toLowerCase())||files.has(p.f))return;extra.push({at:p.at.slice(),label:p.label,icon:"photo"});labs.add(p.label.toLowerCase());files.add(p.f)});
 if(extra.length){const next=P.concat(extra);S.phPins=next;
  /* a stop whose pins another patch has locked (a getter that ignores writes) keeps the lock, with these pins added */
  if(S.phPins.length<next.length){try{const d=Object.getOwnPropertyDescriptor(S,"phPins");if(d&&d.get)Object.defineProperty(S,"phPins",{configurable:true,enumerable:true,get(){return next},set(){}})}catch(e){}}
  S._sqPruned=-1}
 S._gfSpOk=S.phPins}catch(e){}}
/* one photo once per stop: two labels that point at the same picture (Kilimanjaro, Kilimanjaro 5,895 m) keep the first */
function setPins(S,next){S.phPins=next;if(S.phPins.length!==next.length){try{const d=Object.getOwnPropertyDescriptor(S,"phPins");if(d&&d.get)Object.defineProperty(S,"phPins",{configurable:true,enumerable:true,get(){return next},set(){}})}catch(e){}}S._sqPruned=-1}
function dedupe(S){try{const P=S&&Array.isArray(S.phPins)?S.phPins:null;if(!P||P.length<2)return false;const seen=new Set;let drop=false;
 const next=P.filter(q=>{if(!q||q.person)return true;let f=null;try{const x=psSqPhoto(q);f=x&&x.f}catch(e){}if(!f)return true;if(seen.has(f)){drop=true;return false}seen.add(f);return true});
 if(!drop)return false;setPins(S,next);S._gfSpOk=S.phPins;return true}catch(e){return false}}
function all(){try{if(typeof PS_TOURS==="undefined")return;Object.keys(PS_TOURS).forEach(t=>{const T=PS_TOURS[t];(T&&T.steps||[]).forEach(S=>add(S,t))})}catch(e){}}
function install(){if(typeof psGo!=="function"||typeof PS_PHOTO_DATA==="undefined")return false;if(psGo._gfSp)return true;
 all();if(typeof gfStopPh==="function"&&!gfStopPh._gfSp){const _s=gfStopPh;gfStopPh=function(S){const r=_s.apply(this,arguments);try{if(ps&&ps.tour)add(S,ps.tour)}catch(e){}return r};gfStopPh._gfSp=1}
 if(typeof psSteps==="function"&&!psSteps._gfSp){const _st=psSteps;psSteps=function(){const L=_st.apply(this,arguments);try{if(ps&&ps.tour&&Array.isArray(L))L.forEach(S=>add(S,ps.tour))}catch(e){}return L};psSteps._gfSp=1}
 const _g=psGo;psGo=function(){try{if(typeof ps!=="undefined"&&ps&&ps.tour){const T=PS_TOURS[ps.tour];(T&&T.steps||[]).forEach(S=>add(S,ps.tour))}}catch(e){}const r=_g.apply(this,arguments);try{if(ps&&dedupe(psSteps()[ps.i])&&typeof psPhPinsSync==="function")psPhPinsSync()}catch(e){}return r};psGo._gfSp=1;return true}
let n=0;const t=setInterval(()=>{if(install()||++n>80)clearInterval(t)},300);
window.gfStopPhotos={add,all,merge,dedupe};
})();
