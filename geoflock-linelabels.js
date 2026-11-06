/* GeoFlock: names on tour lines. A stop line with label:"..." gets a small tag on the line itself (at its middle, or at
   labelAt:0..1 along it), in the line's own colour, so a reader can tell which route is which without hunting through the
   text. Lines can also be given colours in LINES below (keyed by tour id and stop title) together with their labels:
   [index, label, colour]. Tags that would sit on top of each other or off the map are left out. */
(function(){
"use strict";
const LINES={
 "explorers|The great journeys":[[1,"Columbus, 1492"],[3,"Da Gama, 1498"],[4,"Magellan’s crew, 1519–22"],[6,"Zheng He, 1405–33"],[8,"Cook, 1768–71"]],
 "food|Three grains, three cradles":[[0,"Wheat","#c99a1a"],[1,"Wheat","#c99a1a"],[2,"Rice","#3c9a4a"],[3,"Rice","#3c9a4a"],[4,"Rice","#3c9a4a"],[5,"Maize","#d9622b"],[6,"Maize","#d9622b"]],
 "b12maps|Al-Idrisi’s map for a Norman king":[0,1,2,3,4,5,6].map(i=>[i,"Climate "+(i+1)+" ↑",null,.04]),
 "explorers|Sailing by the stars":[[5,"Hōkūleʻa, 1976"]]
};
const strip=s=>String(s==null?"":s).replace(/​/g,"").trim();
function apply(S,tour){try{const L=LINES[tour+"|"+S.title];if(!L||S._gfLnl)return;Object.defineProperty(S,"_gfLnl",{value:1,configurable:true});
 L.forEach(([i,label,col,at])=>{const l=(S.lines||[])[i];if(!l)return;if(label&&!l.label)l.label=label;if(col&&!l.col)l.col=col;if(at!=null&&l.labelAt==null)l.labelAt=at})}catch(e){}}
function lineCol(l){return l.col||l._col||({amber:"#c47d00",red:"#d62828",warm:"#e0592a",cold:"#2a78d0",river:"#1478e0"})[l.kind]||"#13294b"}
function draw(){try{const box=typeof psContainer==="function"&&psContainer();if(!box)return;let lay=box.querySelector(".gf-lnlabs");
 const S=ps&&psSteps()[ps.i];const L=(S&&S.lines||[]).filter(l=>l&&l.label&&Array.isArray(l.coords)&&l.coords.length>1);
 if(!L.length){if(lay)lay.remove();return}
 if(!lay){lay=document.createElement("div");lay.className="gf-lnlabs";box.appendChild(lay)}
 const W=box.clientWidth,H=box.clientHeight,placed=[],seen=new Set();let html="";const avoid=[...box.querySelectorAll(".ps-sq,.ps-lab,.gf-keyring")].filter(e=>e.offsetParent&&e.style.display!=="none").map(e=>{const r=e.getBoundingClientRect(),bb=box.getBoundingClientRect();return{l:r.left-bb.left-3,t:r.top-bb.top-3,w:r.width+6,h:r.height+6}});const br=box.getBoundingClientRect(),cr=ps.card&&ps.card.getBoundingClientRect(),card=cr&&cr.width?{l:cr.left-br.left-4,r:cr.right-br.left+4,t:cr.top-br.top-4,b:cr.bottom-br.top+4}:null;
 L.forEach(l=>{const key=strip(l.label);if(seen.has(key))return;
  /* the point along the line (by vertex count), or the nearest point to it that is on screen and clear of the card */
  const c=l.coords,t0=l.labelAt!=null?l.labelAt:.5,w=Math.min(190,key.length*6.4+16),h=20;
  const at=t=>{const f=(c.length-1)*t,k=Math.min(c.length-2,Math.floor(f)),u=f-k;return[c[k][0]+(c[k+1][0]-c[k][0])*u,c[k][1]+(c[k+1][1]-c[k][1])*u]};
  const ok=b=>!(b.l<4||b.t<4||b.l+b.w>W-4||b.t+b.h>H-64)&&!(card&&!(b.l+b.w<card.l||card.r<b.l||b.t+b.h<card.t||card.b<b.t))&&!avoid.concat(placed).some(q=>!(b.l+b.w<q.l||q.l+q.w<b.l||b.t+b.h<q.t||q.t+q.h<b.t));
  let b=null,p=null;for(let d=0;d<=1&&!b;d+=.03){for(const t of d?[t0+d,t0-d]:[t0]){if(t<0||t>1)continue;const q=psScreen(at(t));if(!q)continue;const bb={l:q[0]-w/2,t:q[1]-h/2,w,h};if(ok(bb)){b=bb;p=q;break}}}
  if(!b)return;
  placed.push(b);seen.add(key);html+=`<span style="left:${p[0].toFixed(0)}px;top:${p[1].toFixed(0)}px;--lc:${lineCol(l)}">${key.replace(/[<>&]/g,"")}</span>`});
 if(lay._h!==html){lay.innerHTML=html;lay._h=html}}catch(e){}}
function install(){if(typeof psPlacePins!=="function"||typeof psGo!=="function")return false;if(psPlacePins._gfLnl)return true;
 const _p=psPlacePins;psPlacePins=function(){const r=_p.apply(this,arguments);draw();return r};psPlacePins._gfLnl=1;
 const _g=psGo;psGo=function(){try{const T=PS_TOURS[ps&&ps.tour];(T&&T.steps||[]).forEach(S=>apply(S,ps.tour));psSteps().forEach(S=>apply(S,ps.tour))}catch(e){}const r=_g.apply(this,arguments);setTimeout(draw,60);return r};
 const _e=psEnd;psEnd=function(){document.querySelectorAll(".gf-lnlabs").forEach(x=>x.remove());return _e.apply(this,arguments)};return true}
let n=0;const t=setInterval(()=>{if(install()||++n>80)clearInterval(t)},400);
setInterval(()=>{try{if(typeof ps!=="undefined"&&ps)draw()}catch(e){}},700);
{const st=document.createElement("style");st.textContent=`.gf-lnlabs{position:absolute;inset:0;pointer-events:none;z-index:3}
.gf-lnlabs span{position:absolute;transform:translate(-50%,-50%);white-space:nowrap;font:700 11px/1 inherit;font-family:inherit;padding:4px 8px;border-radius:10px;
 color:#fff;background:var(--lc);border:1.5px solid #fff;box-shadow:0 2px 8px rgba(10,20,40,.35)}`;document.head.appendChild(st)}
window.gfLineLabels={LINES,draw};
})();
