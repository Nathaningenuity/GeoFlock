/* GeoFlock: "Relief underneath" on the History, Politics and Culture maps shows the real relief, and the colours lie
   over it as one see-through layer whose strength the viewer sets.
   1. Terrain: the same picture as the Relief map — the relief texture plus its hill shading (gfShadeLayer, multiply) and
      light (gfLightLayer, screen), painted if they are not ready yet — on the flat map and on the globe.
   2. One layer: the History map's states are drawn whole at full strength and then laid over the relief at the chosen
      strength, so where two shapes overlap the colour does not add up (geoflock-history2.js draws through gfHR.alpha()).
      "No state" land is left clear so the relief shows there. Borders are drawn darker so they stay readable through a
      weak layer; names stay fully opaque. The Politics and Culture maps use the same strength for their colours.
   3. "Colour strength" slider (10–100 %, default 40 %) in the map key while Relief underneath is on; saved in
      localStorage (gfReliefAlpha) and applied live on the flat map and the globe.
   4. History names grow at half the zoom rate (screen size × √zoom, at most 2.5 times their whole-world size, like the layer icons), like the
      city, landform and layer icons — on the flat map, the globe and the old SVG map. */
(function(){
if(typeof histOn!=="function"||typeof histReliefOn!=="function")return;
const KEY="gfReliefAlpha",DEF=.4;
let A=DEF;try{const v=parseFloat(localStorage.getItem(KEY));if(v>=.1&&v<=1)A=v}catch(e){}
const hOn=()=>{try{return histOn()&&histReliefOn()}catch(e){return false}};
const tOn=()=>{try{return typeof thOn==="function"&&typeof thReliefOn==="function"&&thOn()&&thReliefOn()}catch(e){return false}};
const active=()=>hOn()||tOn();
const onMaps=()=>{try{return appMode==="allmaps"}catch(e){return false}};

/* ---------- 2. the History layer: hooks read by geoflock-history2.js ---------- */
/* borders: drawn so that after the layer is made see-through they still show at about half strength */
const lineA=()=>Math.min(1,.55/A);
window.gfHR={
 alpha:()=>A,
 line:()=>hOn()?"rgba(48,34,20,"+lineA().toFixed(2)+")":"rgba(60,45,30,.42)",
 /* the layer pictures depend on these (clear "no state" land, border strength) */
 fx:()=>hOn()?"|r"+lineA().toFixed(2):""};
/* "no state" land is left clear over the relief */
{const _f=histFill;histFill=function(p){if(p&&p.k===0&&hOn())return"rgba(0,0,0,0)";return _f.apply(this,arguments)}}

/* ---------- 4. names grow at half the zoom rate ---------- */
const CAP=2.5;
const grow=z=>Math.min(CAP,Math.sqrt(Math.max(1,z||1)));
/* the label size the globe's engine uses for a whole-world view (its own size setting and the flat map's factor kept) */
function lsHalf(gv,orig){const z=Math.max(1,gv.zoom||1),v=orig.call(gv);return v/Math.min(2,Math.pow(z,.25))*grow(z)}
{const _d=histGlobeDraw;histGlobeDraw=function(ctx,p,gv){
  if(!gv||!gv.ls||!histOn())return _d.apply(this,arguments);
  const own=Object.prototype.hasOwnProperty.call(gv,"ls"),orig=gv.ls,L=lsHalf(gv,orig);gv.ls=function(){return L};
  try{
   /* the older year-by-year maps (tour stops before 3000 BC) draw shape by shape: drawn whole into a picture first */
   let isNew=true;try{isNew=!window.GF_HIST2||!GF_HIST2.usesNew||GF_HIST2.usesNew()}catch(e){}
   if(!isNew&&hOn()&&ctx&&ctx.canvas)return oldWhole(_d,this,arguments,ctx);
   return _d.apply(this,arguments)}
  finally{if(own)gv.ls=orig;else delete gv.ls}}}
let OLDC=null;
function oldWhole(fn,self,args,ctx){const cv=ctx.canvas;if(!OLDC)OLDC=document.createElement("canvas");if(OLDC.width!==cv.width||OLDC.height!==cv.height){OLDC.width=cv.width;OLDC.height=cv.height}
 const o=OLDC.getContext("2d");o.setTransform(1,0,0,1,0,0);o.clearRect(0,0,cv.width,cv.height);o.setTransform(ctx.getTransform());
 /* names are kept aside and written over the layer at full strength */
 const texts=[],keep=m=>function(){const s={font:this.font,fillStyle:this.fillStyle,strokeStyle:this.strokeStyle,lineWidth:this.lineWidth,textAlign:this.textAlign,textBaseline:this.textBaseline,lineJoin:this.lineJoin,t:this.getTransform()};texts.push([m,s,[...arguments]])};
 o.fillText=keep("fillText");o.strokeText=keep("strokeText");
 const hr=histReliefOn;let r;
 try{histReliefOn=()=>false;const a=[...args];a[0]=o;r=fn.apply(self,a)}finally{histReliefOn=hr;delete o.fillText;delete o.strokeText}
 ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=A;ctx.drawImage(OLDC,0,0);ctx.restore();
 ctx.save();texts.forEach(([m,s,a])=>{ctx.setTransform(s.t);ctx.globalAlpha=1;for(const k in s)if(k!=="t")ctx[k]=s[k];ctx[m](...a)});ctx.restore();return r}
/* the old SVG map's names (shown where the globe's engine is not used): same rule, in map units */
if(typeof histLabels==="function"&&typeof GLOBE_ROBINSON==="function"){histLabels=function(svg){const lg=svg.querySelector("#histLayer .hist-labs");if(!lg)return;
 const vb=(svg.getAttribute("viewBox")||"0 0 2000 1001").split(/\s+/).map(Number),Z=2e3/Math.max(1,vb[2]),z=grow(Z)/Z,placed=[];let h="";
 const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
 histLabelList().forEach(([gid,nm,lon,lat,area])=>{const p=GLOBE_ROBINSON([lon,lat]);if(!p)return;const base=area>600?27:area>150?23:area>40?19.5:17,fs=base*z;const w=fs*.58*nm.length,bx=[p[0]-w/2,p[1]-fs*.6,p[0]+w/2,p[1]+fs*.6];
  if(placed.some(q=>!(bx[2]<q[0]||bx[0]>q[2]||bx[3]<q[1]||bx[1]>q[3])))return;placed.push(bx);h+=`<text x="${p[0].toFixed(1)}" y="${p[1].toFixed(1)}" font-size="${fs.toFixed(1)}">${esc(nm)}</text>`});lg.innerHTML=h}}

/* ---------- 2b. Politics and Culture maps: their colours at the chosen strength ---------- */
/* (thColor is replaced by later code in places, so the strength is set here whatever came before: pale "no data" greys
   stay faint, every other colour gets the chosen strength) */
const PALE=new Set(["#ebe8e1","#e4e1da","#d8d4cb"]);
if(typeof thColor==="function"){const _c=thColor;thColor=function(code){const c=_c.apply(this,arguments);try{if(typeof c==="string"&&code!=="aq"&&thReliefOn()){
  let m=/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/.exec(c),rgb=null,pale=false;
  if(m){rgb=[m[1],m[2],m[3]];pale=+m[4]<.2}else if(/^#[0-9a-f]{6}$/i.test(c)){const n=parseInt(c.slice(1),16);rgb=[n>>16&255,n>>8&255,n&255];pale=PALE.has(c.toLowerCase())}
  if(rgb)return"rgba("+rgb.join(",")+","+(pale?.12:A)+")"}}catch(e){}return c}}

/* ---------- 1. the terrain: relief + hill shading + light ---------- */
let painted=false;
function terrain(){try{const svg=document.getElementById("worldMapSvgAllMaps");if(!svg||typeof GFL==="undefined")return;
  const mode=typeof allMapsColorMode!=="undefined"?allMapsColorMode:"";if(mode==="relief")return;/* the Relief map looks after itself */
  const shade=svg.querySelector("#gfShadeLayer"),light=svg.querySelector("#gfLightLayer");
  const on=active()&&onMaps();
  if(on&&!painted&&typeof gfMsRefresh==="function"){painted=true;gfMsRefresh();return}/* paints what is missing, then calls gfMsApply again */
  if(!shade||!light)return;
  const M=gfMS(),show=on&&!gfStyleGen()&&M.shadeB>.02&&GFL.shadeUrl&&GFL.lightUrl&&GFL.shadeKey===M.sun+"|"+M.shadeB;
  if(show){if(shade.getAttribute("href")!==GFL.shadeUrl)gfSetHref(shade,GFL.shadeUrl);if(light.getAttribute("href")!==GFL.lightUrl)gfSetHref(light,GFL.lightUrl)}
  [shade,light].forEach((el,i)=>{el.style.display=show?"":"none";el.style.mixBlendMode=i?"screen":"multiply";const f=el._spinFo;if(f){f.style.display=el.style.display;f.style.mixBlendMode=el.style.mixBlendMode}})}catch(e){console.error(e)}}
if(typeof gfMsApply==="function"){const _a=gfMsApply;gfMsApply=function(){const r=_a.apply(this,arguments);terrain();return r}}
/* the globe: the Relief map's own globe picture (shading included) under the colours */
function withRelief(fn){const m=allMapsColorMode;allMapsColorMode="relief";try{return fn()}finally{allMapsColorMode=m}}
setInterval(()=>{try{const g=typeof amGlobe!=="undefined"&&amGlobe;if(!g||!g.cfg||g._gfHrRaster||!g._histRaster||!g._gfRaster)return;const prev=g.cfg.raster;g._gfHrRaster=true;
  g.cfg.raster=function(){if(active()&&typeof gfGlobeKey==="function"){try{const k=withRelief(()=>gfGlobeKey());if(k)return k}catch(e){}return"relief"}return prev.apply(this,arguments)};
  /* the History map's plain land colour under the states would hide the relief: no land colour then */
  const pf=g.cfg.fill;if(pf)g.cfg.fill=function(){if(hOn())return null;return pf.apply(this,arguments)}}catch(e){}},300);

/* ---------- 3. the strength slider ---------- */
const pct=()=>Math.round(A*100);
const SL=()=>`<span class="gf-hr-op" title="How strongly the colours cover the relief"><span class="gf-hr-l">Colour strength</span><input type="range" min="10" max="100" step="5" value="${pct()}" aria-label="Colour strength over the relief"><b>${pct()}%</b></span>`;
{const _l=histLegendHTML;histLegendHTML=function(){const h=_l.apply(this,arguments);if(!h)return h;const at=h.indexOf('<span class="legend-swatches');return at<0?h+SL():h.slice(0,at)+SL()+h.slice(at)}}
if(typeof thLegendHTML==="function"){const _l=thLegendHTML;thLegendHTML=function(){const h=_l.apply(this,arguments);if(!h)return h;return SL()+h}}
let rq=0;
function applyA(final){document.documentElement.style.setProperty("--gf-hr-a",String(A));
 document.querySelectorAll(".gf-hr-op").forEach(s=>{const i=s.querySelector("input"),b=s.querySelector("b");if(i&&document.activeElement!==i)i.value=pct();if(b)b.textContent=pct()+"%"});
 if(rq)return;rq=requestAnimationFrame(()=>{rq=0;try{
  if(tOn()){const w=document.getElementById("allMapsWrap");if(w&&typeof applyAllMapsColorMode==="function")applyAllMapsColorMode(w);if(typeof amGlobe!=="undefined"&&amGlobe&&amGlobeOn())amGlobeSync()}
  if(typeof amGlobe!=="undefined"&&amGlobe&&amGlobeOn())amGlobe.request?amGlobe.request():amGlobe.render()}catch(e){console.error(e)}})}
document.addEventListener("input",e=>{const i=e.target.closest&&e.target.closest(".gf-hr-op input");if(!i)return;A=Math.max(.1,Math.min(1,(+i.value||40)/100));try{localStorage.setItem(KEY,String(A))}catch(err){}applyA()});
document.addEventListener("change",e=>{const i=e.target.closest&&e.target.closest(".gf-hr-op input");if(i)applyA(true)});

/* ---------- keeping it all in step ---------- */
let was=null;
function sync(){const on=active()&&onMaps();document.documentElement.classList.toggle("gf-hr-on",on);document.documentElement.style.setProperty("--gf-hr-a",String(A));
 if(on!==was){was=on;if(!on)painted=false;terrain();try{if(typeof gfGlobeDirty==="function"&&typeof amGlobe!=="undefined"&&amGlobe&&amGlobeOn())gfGlobeDirty()}catch(e){}}}
["histReliefApply","thReliefApply","applyAllMapsColorMode"].forEach(n=>{try{const f=eval(n);if(typeof f!=="function")return;const w=function(){const r=f.apply(this,arguments);try{sync()}catch(e){}return r};eval(n+"=w")}catch(e){}});
setInterval(()=>{try{sync()}catch(e){}},500);

const st=document.createElement("style");st.textContent=`
/* the old SVG map: one see-through layer, no state = clear */
#allMapsWrap.hist-mode.hist-relief #histLayer .hist-years{ opacity:var(--gf-hr-a,.4); }
#allMapsWrap.hist-mode.hist-relief #histLayer .hist-year path, #allMapsWrap.hist-mode.hist-relief #histLayer .hist-year path.hist-g{ fill-opacity:1 !important; }
#allMapsWrap.hist-mode.hist-relief #histLayer .hist-year path.hist-k0{ fill-opacity:0 !important; }
/* the slider */
.gf-hr-op{ display:inline-flex; align-items:center; gap:7px; margin:2px 12px 4px 0; vertical-align:middle; font-size:12px; font-weight:700; color:#3d5566; white-space:nowrap; }
html:not(.gf-hr-on) .gf-hr-op{ display:none !important; }
.gf-hr-op input{ width:110px; accent-color:#8a6a3c; margin:0; cursor:pointer; }
.gf-hr-op b{ min-width:34px; font-variant-numeric:tabular-nums; color:#5a4630; }
html[data-theme="dark"] .gf-hr-op, body.sky-night .gf-hr-op{ color:#c9d6e6; }
html[data-theme="dark"] .gf-hr-op b, body.sky-night .gf-hr-op b{ color:#e8d3b0; }
html[data-theme="dark"] .gf-hr-op input, body.sky-night .gf-hr-op input{ accent-color:#d0a868; }`;
document.head.appendChild(st);
window.gfHistRelief={get:()=>A,set:v=>{A=Math.max(.1,Math.min(1,+v||DEF));try{localStorage.setItem(KEY,String(A))}catch(e){}applyA(true)},active,grow};
})();
