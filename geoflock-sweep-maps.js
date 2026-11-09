/* GeoFlock: fixes from the Maps and Toolkit sweep.
   1. Sharp satellite / night tiles across the date line (with geoflock-daynightglobe.js): a patch of NASA tiles may now run
      past ±180°, so gfGibs.crop is taught to wrap round: a piece of the world that crosses the edge is fetched as two
      pieces and joined. (Before, the patch stopped at 180°: a hard seam there, and the islands just east of it, such as
      Fiji's Lau group, were left in the blurry built-in picture.)
   2. The Toolkit tray, while it is still in its first place (never dragged), stays at the bottom of the map when the map
      changes size, e.g. going from the flat map to the taller globe. Before, it kept its distance from the map's top and
      ended up across the middle of the globe.
   3. Cards and pills along the map's bottom (Thermometer, Cross-section, the History story, the "Click a country" tip and
      the coordinates) keep clear of the Toolkit tray, so none is hidden under it and every × can be reached.
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

/* ---------- shared: the layout checks below run only when something could have changed ----------
   They measure the page (getBoundingClientRect forces a layout), so they are not run on every tick: only when the tray,
   the map or a watched card changed size (ResizeObserver), the window was scrolled or resized, or a cheap signature
   (tray place, map style, which cards exist) changed, and otherwise every 1.5 s; never while the map is moving or the
   page is hidden. */
const DIRTY={kit:true,cards:true};const mark=()=>{DIRTY.kit=DIRTY.cards=true};
const RO=typeof ResizeObserver==="function"?new ResizeObserver(mark):null,SEEN=new WeakSet();
function watch(el){if(el&&RO&&!SEEN.has(el)){SEEN.add(el);try{RO.observe(el)}catch(e){}}}
addEventListener("resize",mark,{passive:true});addEventListener("scroll",mark,{passive:true,capture:true});
function busy(){try{if(document.hidden||typeof appMode==="undefined"||appMode!=="allmaps")return true;const g=typeof amGlobe!=="undefined"&&amGlobe;return!!(g&&(g._moving||g._flying||g._gfDown))}catch(e){return true}}
let cheapSig="";
function cheap(){const t=document.getElementById("gfKit");let s="";try{s=(t?t.style.left+t.style.top+t.className:"-")+"|"+(typeof allMapsColorMode!=="undefined"?allMapsColorMode:"")+"|"+(typeof amGlobe!=="undefined"&&amGlobe&&amGlobe._flat?"f":"g")+"|"+document.body.classList.contains("gf-fs")+"|"}catch(e){}
 /* a card that is new (or was rebuilt) is watched; watching it reports its size once, which marks the page for a check */
 document.querySelectorAll(".gfth,.gf-xs,.gf-learn,.gfk-coord,.hist-story,.hist-dock").forEach(watch);
 if(s!==cheapSig){cheapSig=s;mark()}if(t){watch(t);watch(t.parentElement)}}
/* things can also move without changing size (a card sliding in, the History timeline settling), so while the map is
   still the page is checked again every 1.5 s anyway */
let lastFull=0;setInterval(()=>{if(busy())return;cheap();const n=Date.now();if(n-lastFull>1500){lastFull=n;mark()}},250);
window.gfSweepMapsDbg=()=>({dirty:Object.assign({},DIRTY),busy:busy(),sig:cheapSig});

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
 setInterval(()=>{try{if(moved||!DIRTY.kit||busy())return;DIRTY.kit=false;if(!window.gfKitLayout||innerWidth<=640||document.body.classList.contains("gf-fs"))return;const t=tray();if(!t||!t.classList.contains("gfkl-fixed")||t.classList.contains("gfkl-moving"))return;
  const h=t.parentElement;if(!h)return;const r=h.getBoundingClientRect();if(!r.width||!r.height)return;
  /* the History timeline floats over the bottom of the globe: the tray goes just above it */
  const dock=[...document.querySelectorAll(".hist-dock")].map(d=>(watch(d),d)).find(d=>d.getClientRects().length&&getComputedStyle(d).visibility!=="hidden");let lim=Math.min(r.bottom,innerHeight);
  if(dock){const dr=dock.getBoundingClientRect();if(dr.top<lim&&dr.bottom>r.top+150&&dr.left<r.left+t.offsetWidth+12)lim=Math.min(lim,dr.top)}
  const s=Math.round(r.width)+"x"+Math.round(r.height)+"|"+(typeof amGlobe!=="undefined"&&amGlobe&&amGlobe._flat?"f":"g")+"|"+(lim<Math.min(r.bottom,innerHeight)?"d":"");
  if(s===sig)return;const first=!sig;sig=s;const L=gfKitLayout.get();
  /* an older saved place counts as the first one if it is the default left edge (x 12) */
  if(first&&L.pn&&L.pn.x!==12){moved=true;try{localStorage.setItem(MK,"1")}catch(er){}return}
  if(L.col)return;const oh=t.classList.contains("closed")?Math.max(t.offsetHeight,L.fh||0):t.offsetHeight;
  const y=Math.round(lim-oh-6-r.top);if(y<4){gfKitLayout.set({pn:null});return}
  if(!L.pn||L.pn.x!==12||Math.abs(L.pn.y-y)>2)gfKitLayout.set({pn:{x:12,y}})}catch(e){}},200);
})();

/* ---------- 3. cards in the map's lower left stay clear of the Toolkit tray ----------
   The Thermometer card, the Cross-section panel, the "Click a country" tip and the coordinates sit along the map's bottom,
   where the tray floats too, and the History story card hangs down from the top left over it. A card the tray would cover is lifted above the tray (or,
   the History card, made shorter: its text scrolls); it goes back to its own place when the tray is elsewhere. */
const LIFT=[".gfth:not(.gfth-float)",".gf-xs:not(.gf-xs-free)",".gf-learn",".gfk-coord"],SHRINK=[".hist-story"];
function trayRect(){const t=document.getElementById("gfKit");if(!t||!t.getClientRects().length||getComputedStyle(t).visibility==="hidden"||document.body.classList.contains("gf-fs")||innerWidth<=640)return null;return t.getBoundingClientRect()}
/* the card's own inline max-height (the History card sets one) is put back as it was */
function keepMH(c){if(!c._gfSw)c._gfMH0=c.style.maxHeight}
function undo(c){if(c._gfSw){c.style.removeProperty("bottom");c.style.maxHeight=c._gfMH0||"";c._gfSw=0}}
setInterval(()=>{try{if(!DIRTY.cards||busy())return;DIRTY.cards=false;const tr=trayRect();
 /* a Cross-section panel moved off the map sits where it was put: no lift (a pinned bottom squeezed it, cutting off the chart) */
 document.querySelectorAll(".gf-xs.gf-xs-free").forEach(c=>{if(c._gfSw)undo(c)});
 document.querySelectorAll(LIFT.join(",")).forEach(c=>{watch(c);const h=c.parentElement;if(!tr||!h||!c.getClientRects().length){undo(c);return}
  const hr=h.getBoundingClientRect(),cs=getComputedStyle(c),R=c.getBoundingClientRect();
  /* where the card would be on its own: where it is now, less any lift given to it */
  if(!c._gfSw)c._gfB0=parseFloat(cs.bottom)||0;const b0=c._gfB0,lift=c._gfSw?(parseFloat(c.style.bottom)||b0)-b0:0,top=R.top+lift,bot=R.bottom+lift,hgt=R.height;
  const over=tr.left<R.right&&tr.right>R.left&&tr.top<bot&&tr.bottom>top;
  /* the Cross-section panel keeps the height it has (or the one you drag it to): it is only lifted when it fits whole above the tray */
  const whole=c.classList.contains("gf-xs");
  if(over&&tr.top-hr.top>(whole?hgt:Math.min(hgt,160))+12){const b=Math.round(b0+bot-tr.top+8);keepMH(c);if(c.style.bottom!==b+"px"){c.style.setProperty("bottom",b+"px","important");if(hgt>100&&!whole){c.style.maxHeight=Math.max(120,Math.round(tr.top-hr.top-16))+"px";if(cs.overflowY==="visible")c.style.overflowY="auto"}}c._gfSw=1}
  else if(c._gfSw)undo(c)});
 document.querySelectorAll(SHRINK.join(",")).forEach(c=>{watch(c);if(!tr||!c.getClientRects().length){undo(c);return}
  keepMH(c);if(c._gfSw){c.style.maxHeight=c._gfMH0||""}const r=c.getBoundingClientRect();
  const over=tr.left<r.right&&tr.right>r.left&&tr.top<r.bottom&&tr.bottom>r.top;
  if(over&&tr.top-r.top>170){c.style.maxHeight="min("+(c._gfMH0||"100vh")+", "+Math.round(tr.top-r.top-10)+"px)";c._gfSw=1}else undo(c)});
}catch(e){}},300);

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
