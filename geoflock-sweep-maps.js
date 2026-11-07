/* GeoFlock: fixes from the Maps and Toolkit sweep.
   1. Sharp satellite / night tiles across the date line (with geoflock-daynightglobe.js): a patch of NASA tiles may now run
      past ±180°, so gfGibs.crop is taught to wrap round: a piece of the world that crosses the edge is fetched as two
      pieces and joined. (Before, the patch stopped at 180°: a hard seam there, and the islands just east of it, such as
      Fiji's Lau group, were left in the blurry built-in picture.)
   2. The Toolkit tray, while it is still in its first place (never dragged), stays at the bottom of the map when the map
      changes size, e.g. going from the flat map to the taller globe. Before, it kept its distance from the map's top and
      ended up across the middle of the globe.
   3. The Thermometer card (bottom left of the map) moves up above the Toolkit tray instead of lying under it.
   4. Esc stops the Ruler: it ends the measuring mode (the ruler stays on the map; click it to measure again). */
(function(){
"use strict";
/* ---------- 1. tiles that wrap round the date line ---------- */
(function wrapCrop(){
 if(!window.gfGibs||!gfGibs.crop){setTimeout(wrapCrop,500);return}
 if(gfGibs._gfWrap)return;gfGibs._gfWrap=1;const orig=gfGibs.crop;
 gfGibs.crop=function(z,cx,cy,cw,ch,rw,rh,TW,TH,kind,prog){
  if(!(cw>0)||cw>=TW||(cx>=0&&cx+cw<=TW))return orig.apply(this,arguments);
  /* split [cx, cx+cw) at the picture's edges */
  const segs=[];let s=cx;const e=cx+cw;
  while(s<e-1e-6){const k=Math.floor(s/TW),edge=(k+1)*TW,t=Math.min(e,edge);segs.push([s,t,s-k*TW]);s=t}
  const c=document.createElement("canvas");c.width=rw;c.height=rh;const x=c.getContext("2d");
  const parts=segs.map(([a,b,w0])=>({dx:(a-cx)/cw*rw,dw:(b-a)/cw*rw,w0,cw:b-a,pic:null}));
  const paint=()=>{x.clearRect(0,0,rw,rh);parts.forEach(P=>{if(P.pic&&P.pic.width)x.drawImage(P.pic,P.dx,0,P.dw,rh)})};
  let last=0;const tick=()=>{if(!prog)return;const n=performance.now();if(n-last<250)return;last=n;paint();try{prog(c)}catch(er){}};
  return Promise.all(parts.map(P=>{const pw=Math.max(1,Math.ceil(P.dw));
   return orig.call(gfGibs,z,P.w0,cy,P.cw,ch,pw,rh,TW,TH,kind,prog?(pc=>{P.pic=pc;tick()}):undefined).then(pc=>{P.pic=pc;return pc})}))
   .then(pics=>{paint();const miss=pics.reduce((m,p)=>m+((p&&p._gfMiss)||0),0);if(miss)c._gfMiss=miss;pics.forEach(p=>{try{p.width=0}catch(er){}});return c})}})();

/* ---------- 2. the Toolkit tray keeps to the bottom of the map until it is moved by hand ---------- */
(function(){
 const MK="gfKitMovedByHand";let moved=false;try{moved=localStorage.getItem(MK)==="1"}catch(e){}
 const tray=()=>document.getElementById("gfKit");
 /* a drag of the tab or a pull of either end is the user placing it */
 addEventListener("pointerdown",e=>{const t=e.target&&e.target.closest&&e.target.closest("#gfKit .gfk-tab, #gfKit .gfkl-rz");if(!t||e.target.closest(".gfkl-gear"))return;
  let before="";try{before=JSON.stringify(gfKitLayout.get().pn)}catch(er){}
  const up=()=>{removeEventListener("pointerup",up,true);setTimeout(()=>{try{const L=gfKitLayout.get();if(JSON.stringify(L.pn)!==before||t.classList.contains("gfkl-rz")){moved=true;localStorage.setItem(MK,"1")}}catch(er){}},120)};
  addEventListener("pointerup",up,true)},true);
 /* "Reset" in the ⚙ menu puts it back to its first place */
 document.addEventListener("click",e=>{if(e.target&&e.target.closest&&e.target.closest(".gfkl-menu [data-reset]")){moved=false;try{localStorage.removeItem(MK)}catch(er){}}},true);
 let sig="";
 setInterval(()=>{try{if(moved||!window.gfKitLayout||innerWidth<=640||document.body.classList.contains("gf-fs"))return;const t=tray();if(!t||!t.classList.contains("gfkl-fixed")||t.classList.contains("gfkl-moving"))return;
  const h=t.parentElement;if(!h)return;const r=h.getBoundingClientRect();if(!r.width||!r.height)return;
  const s=Math.round(r.width)+"x"+Math.round(r.height)+"|"+(typeof amGlobe!=="undefined"&&amGlobe&&amGlobe._flat?"f":"g");
  if(s===sig)return;const first=!sig;sig=s;const L=gfKitLayout.get();
  /* an older saved place counts as the first one if it is the default left edge (x 12) */
  if(first&&L.pn&&L.pn.x!==12){moved=true;try{localStorage.setItem(MK,"1")}catch(er){}return}
  if(L.col)return;gfKitLayout.set({pn:null})}catch(e){}},400);
})();

/* ---------- 3. the Thermometer card stays clear of the Toolkit tray ---------- */
setInterval(()=>{try{const c=document.querySelector(".gfth:not(.gfth-float)"),t=document.getElementById("gfKit");if(!c)return;
 const h=c.parentElement;if(!h||!t||!t.getClientRects().length||getComputedStyle(t).visibility==="hidden"){if(c._gfSw){c.style.bottom="";c.style.maxHeight="";c._gfSw=0}return}
 const hr=h.getBoundingClientRect(),tr=t.getBoundingClientRect();
 /* where the card would be on its own: 10 px from the map's bottom left */
 const w=c.offsetWidth,l=hr.left+10,overX=tr.left<l+w&&tr.right>l,overY=tr.top<hr.bottom-10&&tr.bottom>hr.bottom-10-Math.min(c.offsetHeight,200);
 if(overX&&overY&&tr.top-hr.top>160){const b=Math.round(hr.bottom-tr.top+8);if(c.style.bottom!==b+"px"){c.style.bottom=b+"px";c.style.maxHeight=Math.max(140,Math.round(tr.top-hr.top-18))+"px"}c._gfSw=1}
 else if(c._gfSw){c.style.bottom="";c.style.maxHeight="";c._gfSw=0}}catch(e){}},300);

/* ---------- 5. no seam on the globe at 180° ----------
   The globe's whole-world pictures (Satellite, Elevation, City Lights, Population…) were uploaded with their left and right
   edges clamped, so whatever reads a little way across the 180° line (the satellite sea's shore and inland-water tests
   look up to ~3° round each pixel, and every picture blends neighbouring pixels) read the edge pixel again instead of the
   far side of the world: a visible line, and a differently shaded strip of sea, down the date line (Fiji, Tonga, the
   Bering Strait). Single whole-world pictures now wrap round left to right. (The Relief map's two half pictures are left
   as they are: each half ends in the middle of the world.) */
(function wrapTex(){
 if(typeof GlobeGL==="undefined"||!GlobeGL.prototype||!GlobeGL.prototype.texture){setTimeout(wrapTex,500);return}
 const P=GlobeGL.prototype;if(P._gfWrapS)return;P._gfWrapS=1;const orig=P.texture;
 P.texture=function(key,imgs){const r=orig.apply(this,arguments);try{if(r&&r.kind==="single"&&!r._gfRep&&r.list){r._gfRep=1;const gl=this.gl;
   r.list.forEach(t=>{gl.bindTexture(gl.TEXTURE_2D,t);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT)})}}catch(e){}return r};
 /* pictures already uploaded before this file ran */
 try{if(typeof amGlobe!=="undefined"&&amGlobe&&amGlobe.gl&&amGlobe.gl.tex){const G=amGlobe.gl,gl=G.gl;Object.values(G.tex).forEach(r=>{if(r&&r.kind==="single"&&r.list&&!r._gfRep){r._gfRep=1;r.list.forEach(t=>{gl.bindTexture(gl.TEXTURE_2D,t);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT)})}})}}catch(e){}
})();

/* ---------- 4. Esc ends the Ruler's measuring ---------- */
addEventListener("keydown",e=>{if(e.key!=="Escape"||e.defaultPrevented)return;if(e.target&&e.target.closest&&e.target.closest("input,textarea,select,[contenteditable]"))return;
 try{if(typeof appMode==="undefined"||appMode!=="allmaps")return;let did=false;
  if(typeof amtMeasure!=="undefined"&&amtMeasure&&typeof amtToggleMeasure==="function"){amtToggleMeasure(false);did=true}
  if(typeof amGlobe!=="undefined"&&amGlobe&&amGlobe._measure&&amGlobe.toggleMeasure){amGlobe.toggleMeasure();did=true}
  if(did)e.stopImmediatePropagation()}catch(er){}},true);
})();
