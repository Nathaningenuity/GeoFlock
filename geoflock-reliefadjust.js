/* GeoFlock: your own shades of the picture relief styles (Natural Earth, Bright). In the toolkit's Palette, on the Relief
   map, six colour wells: forest, grassland, desert, ice and peaks, shallow sea, deep ocean. Each starts as the colour the
   picture already uses there; nudging one shifts every pixel of that kind by the same amount (shading and texture stay),
   on the flat maps and the globe. "Back to the original" undoes it. Saved in this browser (localStorage gfReliefAdj). */
(function(){
"use strict";
const KEY="gfReliefAdj";
let ADJ={};try{ADJ=JSON.parse(localStorage.getItem(KEY)||"{}")||{}}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(ADJ))}catch(e){}};
const CLASSES=[["forest","Forest",[-62,-4]],["grass","Grassland",[-100,40]],["desert","Desert",[12,24]],["ice","Ice and peaks",[-40,74]],["shallow","Shallow sea",[-78.5,24.5]],["deep","Deep ocean",[-140,-20]]];
const SRC={natural:{w:"textures/GLOBE_RELIEF_W_LK_NE.webp?v=1",e:"textures/GLOBE_RELIEF_E_LK_NE.webp?v=1",all:"textures/reliefAllMaps_NE.webp?v=1",atlas:"textures/reliefAtlas_NE.webp?v=1"},
 bright:{w:"textures/GLOBE_RELIEF_W_LK.webp",e:"textures/GLOBE_RELIEF_E_LK.webp",all:"textures/reliefAllMaps.webp",atlas:"textures/reliefAtlas.webp"}};
const style=()=>{try{const s=gfMS().style;return SRC[s]?s:null}catch(e){return null}};
const load=u=>new Promise((res,rej)=>{const im=new Image();im.onload=()=>res(im);im.onerror=rej;im.src=u});
const hx=c=>"#"+c.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,"0")).join("");
const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
/* the colours each picture already uses for each kind of ground (averaged round a typical spot) */
const BASE={};
async function base(st){if(BASE[st])return BASE[st];const[w,e]=await Promise.all([load(SRC[st].w),load(SRC[st].e)]);const c=document.createElement("canvas");c.width=1024;c.height=512;const x=c.getContext("2d",{willReadFrequently:true});
 x.drawImage(w,0,0,512,512);x.drawImage(e,512,0,512,512);const out={};
 for(const[k,,ll]of CLASSES){const px=Math.round((ll[0]+180)/360*1024),py=Math.round((90-ll[1])/180*512);const d=x.getImageData(px-3,py-3,7,7).data;let r=0,g=0,b=0,n=0;for(let i=0;i<d.length;i+=4){r+=d[i];g+=d[i+1];b+=d[i+2];n++}out[k]=[r/n,g/n,b/n]}
 return BASE[st]=out}
/* every pixel moves by a blend of the class shifts, weighted by how close its colour is to each class's colour */
function shiftData(D,B,T){const ks=CLASSES.map(c=>c[0]).filter(k=>T[k]);if(!ks.length)return;const A=ks.map(k=>B[k]),S=ks.map(k=>{const t=rgb(T[k]),b=B[k];return[t[0]-b[0],t[1]-b[1],t[2]-b[2]]});
 const all=CLASSES.map(c=>B[c[0]]),sig=1/(2*38*38);
 for(let i=0;i<D.length;i+=4){const r=D[i],g=D[i+1],b=D[i+2];if(!D[i+3])continue;
  /* closeness to every class (also the ones not changed, so a pixel between two kinds is shared fairly) */
  let tot=.02,dr=0,dg=0,db=0;for(let k=0;k<all.length;k++){const a=all[k],q=(r-a[0])**2+(g-a[1])**2+(b-a[2])**2;tot+=Math.exp(-q*sig)}
  for(let k=0;k<A.length;k++){const a=A[k],q=(r-a[0])**2+(g-a[1])**2+(b-a[2])**2,wv=Math.exp(-q*sig)/tot;dr+=wv*S[k][0];dg+=wv*S[k][1];db+=wv*S[k][2]}
  D[i]=r+dr;D[i+1]=g+dg;D[i+2]=b+db}}
async function paint(u,W,B,T){const im=await load(u);const H=Math.round(im.height*W/im.width),c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d",{willReadFrequently:true});x.drawImage(im,0,0,W,H);
 const id=x.getImageData(0,0,W,H);shiftData(id.data,B,T);x.putImageData(id,0,0);await new Promise(r=>setTimeout(r,0));
 return await new Promise(r=>c.toBlob(b=>r(URL.createObjectURL(b)),"image/webp",.9))}
let OUT={},N=0,busy=null;
const has=st=>{const T=ADJ[st];return!!(T&&Object.keys(T).length)};
async function build(st){const T=ADJ[st];if(!has(st)){OUT[st]=null;return}const B=await base(st),me=++N;
 const urls={w:await paint(SRC[st].w,2048,B,T),e:await paint(SRC[st].e,2048,B,T),all:await paint(SRC[st].all,4000,B,T),atlas:await paint(SRC[st].atlas,4000,B,T)};
 if(me!==N)return;const key="reliefAdj"+me;GLOBE_TEX[key]={kind:"halves",src:[urls.w,urls.e]};OUT[st]={key,urls};refresh()}
function refresh(){try{gfReliefApply()}catch(e){}try{GFG.sig=null;gfGlobeDirty()}catch(e){}try{amGlobe&&amGlobe.request()}catch(e){}}
/* which globe texture and flat pictures to use now */
function curKey(k){if(k!=="relief")return k;const st=style();if(st&&OUT[st])return OUT[st].key;return st==="natural"?"reliefNE":k}
function install(){if(typeof globeImages!=="function"||typeof GlobeGL==="undefined"||typeof gfReliefApply!=="function"||!GLOBE_TEX.reliefNE)return false;if(globeImages._gfAdj)return true;
 const _gi=globeImages;globeImages=function(key,cb){return _gi.call(this,key==="relief"||key==="reliefNE"?curKey("relief"):key,cb)};globeImages._gfAdj=1;
 const _t=GlobeGL.prototype.texture;GlobeGL.prototype.texture=function(key,imgs){return _t.call(this,key==="relief"||key==="reliefNE"?curKey("relief"):key,imgs)};
 const _ra=gfReliefApply;gfReliefApply=function(){const r=_ra.apply(this,arguments);const st=style();if(st&&OUT[st]){const set=(id,u)=>{const el=document.getElementById(id);if(el&&el.getAttribute("href")!==u)el.setAttribute("href",u)};set("allMapsReliefLayer",OUT[st].urls.all);set("atlasReliefLayer",OUT[st].urls.atlas)}return r};
 Object.keys(SRC).forEach(st=>{if(has(st))build(st)});return true}
let n=0;const t=setInterval(()=>{if(install()||++n>80)clearInterval(t)},500);
/* ---- in the Palette panel ---- */
async function section(p){const st=style();if(!st||p.querySelector(".gfra"))return;const B=await base(st);if(p.querySelector(".gfra"))return;const T=ADJ[st]||{};
 const name=st==="natural"?"Natural Earth":"Bright";const div=document.createElement("div");div.className="gfk-sec gfra";
 div.innerHTML='<small>Your shades of '+name+' <em>(click a colour to change it a little or a lot)</em></small><div class="gfk-mine">'+CLASSES.map(([k,l])=>`<label><input type="color" data-ra="${k}" value="${T[k]||hx(B[k])}"><span>${l}</span></label>`).join("")+
  '</div><div class="gfk-acts"><button type="button" data-ra-reset>Back to the original '+name+'</button><span class="gfra-busy" hidden>painting…</span></div>';
 const first=p.querySelector(".gfk-sec");if(first&&first.nextSibling)p.insertBefore(div,first.nextSibling);else p.appendChild(div);
 const busyEl=div.querySelector(".gfra-busy");
 const go=async()=>{busyEl.hidden=false;try{await build(st)}finally{busyEl.hidden=true}};
 div.querySelectorAll("[data-ra]").forEach(inp=>inp.addEventListener("change",()=>{(ADJ[st]=ADJ[st]||{})[inp.dataset.ra]=inp.value;
   /* a well put back to its starting colour is no change */if(inp.value.toLowerCase()===hx(B[inp.dataset.ra]))delete ADJ[st][inp.dataset.ra];save();go()}));
 div.querySelector("[data-ra-reset]").onclick=()=>{delete ADJ[st];save();OUT[st]=null;refresh();div.querySelectorAll("[data-ra]").forEach(inp=>inp.value=hx(B[inp.dataset.ra]))}}
new MutationObserver(()=>{const p=document.getElementById("gfkPal");if(p&&typeof allMapsColorMode!=="undefined"&&allMapsColorMode==="relief")section(p)}).observe(document.body,{childList:true,subtree:true});
window.gfReliefAdj={ADJ,build,base,OUT};
})();
