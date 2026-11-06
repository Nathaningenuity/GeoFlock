/* GeoFlock: portraits of the people in a tour stop. Where a real person matters to the stop (Darwin in the Galápagos,
   Voltaire at Ferney, Ibn Battuta, Mercator, the six dethroned kings at Candide's supper...) a round portrait with their
   name sits on the map where they belong in the story, like the square photo pins but round, so a face reads as a person
   and not a place. The list (GF_PORTRAITS) is keyed by tour id and exact stop title; the pictures (GF_PORTRAIT_PHOTOS) are
   Wikimedia Commons portraits under free licences, with author, licence and page. Load after the tour files. */
(function(){
"use strict";
const PH=window.GF_PORTRAIT_PHOTOS||[],PPL=window.GF_PORTRAITS||[];
const COL="#3d3466";
const strip=s=>String(s==null?"":s).replace(/​/g,"").trim();
const BY=new Map();PPL.forEach(p=>{const k=p.tour+"|"+p.stop;if(!BY.has(k))BY.set(k,[]);BY.get(k).push(p)});
let merged=false;
function merge(){try{if(typeof gfMergeExtra==="function")gfMergeExtra();if(typeof PS_PHOTO_DATA==="undefined")return;
 const have=new Set(PS_PHOTO_DATA.map(p=>p&&p.f));PH.forEach(p=>{if(!have.has(p.f)){PS_PHOTO_DATA.push(p);have.add(p.f)}});
 try{PPL.forEach(p=>{GF_SQ_FILE[p.name]=p.f})}catch(e){}
 window.PS_SQ_IMG=window.PS_SQ_IMG||{};PPL.forEach(p=>{const i=PS_PHOTO_DATA.findIndex(x=>x&&x.f===p.f&&x.d);if(i>=0)PS_SQ_IMG[p.name]=i});merged=true}catch(e){}}
const has=f=>{try{return PS_PHOTO_DATA.some(x=>x&&x.f===f&&x.d)}catch(e){return false}};
/* the stop's photo pins plus its people (a person already pinned by name is not added twice) */
function augment(S,tour){try{if(!S||!tour)return;const L=BY.get(tour+"|"+S.title)||(S.gfFrom&&BY.get(S.gfFrom));if(!L)return;
 if(S._gfPpl&&S.phPins===S._gfPpl)return;if(!merged)merge();
 const base=(S.phPins||[]).filter(q=>!(q&&q.person));const names=new Set(base.map(q=>strip(q&&q.label).toLowerCase()));
 const add=L.filter(p=>has(p.f)&&!names.has(p.name.toLowerCase())).map(p=>({at:p.at,label:p.name,col:COL,icon:"photo",person:1}));
 const out=base.concat(add);
 Object.defineProperty(S,"_gfPpl",{configurable:true,enumerable:false,writable:true,value:out});
 Object.defineProperty(S,"phPins",{configurable:true,enumerable:true,get(){return S._gfPpl},set(v){if(Array.isArray(v)){S._gfPpl=(v||[]).filter(q=>!(q&&q.person)).concat(add)}}})}catch(e){console.error("portraits",e)}}
function prepAll(){try{if(typeof ps==="undefined"||!ps||!ps.tour)return;const T=PS_TOURS[ps.tour];(T&&T.steps||[]).forEach(S=>augment(S,ps.tour))}catch(e){}}
function mark(){try{const box=typeof psContainer==="function"&&psContainer();const L=box&&box.querySelector(".ps-phpins");if(!L)return;const S=psSteps()[ps.i],P=S&&S.phPins||[];
 L.querySelectorAll(".ps-sq").forEach(el=>{const q=P[+el.dataset.ph];el.classList.toggle("gf-person",!!(q&&q.person))})}catch(e){}}
function install(){if(typeof psGo!=="function"||typeof psPhPinsSync!=="function"||typeof psSteps!=="function")return false;
 if(psGo._gfPpl)return true;
 const _g=psGo;psGo=function(){prepAll();return _g.apply(this,arguments)};psGo._gfPpl=1;
 const _s=psSteps;psSteps=function(){const L=_s.apply(this,arguments);try{if(ps&&ps.tour&&Array.isArray(L))L.forEach(S=>augment(S,ps.tour))}catch(e){}return L};
 const _p=psPhPinsSync;psPhPinsSync=function(){const r=_p.apply(this,arguments);mark();return r};
 return true}
let n=0;const t=setInterval(()=>{if(install()||++n>80)clearInterval(t)},400);
/* after the small-places patch (it wraps late) the marks are put back on each redraw */
setTimeout(()=>{try{const _p=psPhPinsSync;psPhPinsSync=function(){const r=_p.apply(this,arguments);mark();return r}}catch(e){}},16000);
{const st=document.createElement("style");st.textContent=`
.ps-pp.ps-sq.gf-person{border-radius:50%;background:${COL};border:3px solid #f4e9cf;box-shadow:0 4px 14px rgba(10,20,40,.4),0 0 0 1.5px ${COL}}
.ps-pp.ps-sq.gf-person i,.ps-pp.ps-sq.gf-person i img{border-radius:50%}
.ps-pp.ps-sq.gf-person i img{object-position:50% 22%}
.ps-pp.ps-sq.gf-person span{position:absolute;left:50%;top:100%;transform:translateX(-50%);margin:4px 0 0;padding:2px 7px;border-radius:9px;white-space:nowrap;
 background:${COL};color:#fff;box-shadow:0 2px 6px rgba(10,20,40,.35);-webkit-line-clamp:1;max-width:none}`;document.head.appendChild(st)}
window.gfPortraits={augment,merge,BY};
})();
