/* GeoFlock: "Natural Earth" relief colours, the Relief map's default style (Bright is the other picture style; Classic is hidden).
   Natural Earth I (shaded relief, land cover and water; public domain) graded to a saturated look: green where the land
   is wet, yellow and orange where it is dry, deep blue sea. The globe uses its own texture key (reliefNE) and the flat
   maps their own pictures, so Bright and Classic are untouched. */
(function(){
"use strict";
const ID="natural",NAME="Natural Earth",V="?v=1";
const IMG={all:"textures/reliefAllMaps_NE.webp"+V,atlas:"textures/reliefAtlas_NE.webp"+V,w:"textures/GLOBE_RELIEF_W_LK_NE.webp"+V,e:"textures/GLOBE_RELIEF_E_LK_NE.webp"+V};
const PAL={sea:["#3a95e0","#1f6fc4","#1257ab","#0b4594"],land:["#5fb04f","#e2d64a","#e9a866","#f2f4f8"],lake:"#a8cbe5"};
const on=()=>{try{return gfMS().style===ID}catch(e){return false}};
function install(){
 if(typeof GF_STYLE_ORDER==="undefined"||typeof gfReliefApply!=="function"||typeof gfSetStyle!=="function"||typeof GLOBE_TEX==="undefined")return false;
 if(gfReliefApply._gfNE)return true;
 /* Natural Earth first and the default; Bright next to it; Classic is hidden */
 {const i=GF_STYLE_ORDER.findIndex(x=>x[0]==="classic");if(i>=0)GF_STYLE_ORDER.splice(i,1)}
 if(!GF_STYLE_ORDER.some(x=>x[0]===ID))GF_STYLE_ORDER.unshift([ID,NAME]);
 try{const M=gfMS();if(!M.neDefault){M.neDefault=1;M.style=ID;gfMSsave()}else if(M.style==="classic"){M.style=ID;gfMSsave()}gfP().reliefClassic=false}catch(e){}
 GLOBE_TEX.reliefNE={kind:"halves",src:[IMG.w,IMG.e]};
 /* the globe's painted relief asks for "relief": it gets the Natural Earth halves while the style is on */
 /* WebGL keeps one texture per key: the Natural Earth pictures get their own */
 if(typeof GlobeGL!=="undefined"&&GlobeGL.prototype.texture&&!GlobeGL.prototype.texture._gfNE){const _t=GlobeGL.prototype.texture;GlobeGL.prototype.texture=function(key,imgs){return _t.call(this,key==="relief"&&on()?"reliefNE":key,imgs)};GlobeGL.prototype.texture._gfNE=1}
 const _gi=globeImages;globeImages=function(key,cb){return _gi.call(this,key==="relief"&&on()?"reliefNE":key,cb)};
 /* the older code turns any style it does not know back into Bright: it runs as Bright, then the pictures are swapped */
 const _ra=gfReliefApply;gfReliefApply=function(){if(!on())return _ra.apply(this,arguments);const M=gfMS();M.style="bright";let r;try{gfP().reliefClassic=false;r=_ra.apply(this,arguments)}finally{M.style=ID}
  const set=(id,u)=>{const el=document.getElementById(id);if(el&&el.getAttribute("href")!==u)el.setAttribute("href",u)};set("allMapsReliefLayer",IMG.all);set("atlasReliefLayer",IMG.atlas);
  try{RELIEF_SEA_RAMP.splice(0,RELIEF_SEA_RAMP.length,...PAL.sea);RELIEF_LAND_COVER.forEach((x,i)=>{x[0]=PAL.land[i]})}catch(e){}return r};gfReliefApply._gfNE=1;
 const _ss=gfSetStyle;gfSetStyle=function(s){const r=_ss.apply(this,arguments);try{GFG.sig=null;gfGlobeDirty()}catch(e){}if(s===ID){try{gfP().reliefClassic=false}catch(e){}gfReliefApply();try{amGlobe&&amGlobe.request()}catch(e){}
   try{const lg=document.getElementById("populationLegend");if(lg&&allMapsColorMode==="relief")lg.innerHTML=allMapsLegendHTML()}catch(e){}}else{try{amGlobe&&amGlobe.request()}catch(e){}}return r};
 /* the lake colour in the key */
 if(typeof reliefLegendHTML==="function"){const _rl=reliefLegendHTML;reliefLegendHTML=function(){const h=_rl.apply(this,arguments);return on()?h.replace(/background:#a9d3ec/g,"background:"+PAL.lake):h}}
  setTimeout(()=>{try{gfReliefApply();GFG.sig=null;gfGlobeDirty();amGlobe&&amGlobe.request();const lg=document.getElementById("populationLegend");if(lg&&allMapsColorMode==="relief")lg.innerHTML=allMapsLegendHTML()}catch(e){}},50);
 return true}
let n=0;const t=setInterval(()=>{if(install()||++n>80)clearInterval(t)},400);
{const st=document.createElement("style");st.textContent=`.gf-ms-swatch.s-natural i{background:linear-gradient(135deg,#1257ab 0 30%,#5fb04f 30% 55%,#e2d64a 55% 75%,#e9a866 75%)!important}`;document.head.appendChild(st)}
})();
/* lakes open to the sea are drawn as sea, not as lakes */
window.gfSeaLake=function(n){return /^(Caspian|Lake Maracaibo|Lagoa dos Patos|Lagoa Mirim|Lake Molochnyi Liman|Lake Kiziltashskiy liman)/.test(n||"")};
gfSeaLake.ne=function(){try{return gfMS().style==="natural"}catch(e){return false}};
/* the Caspian is a special exception: never painted as a lake (the base pictures already show it as water); hovering it
   still names it */
{const st=document.createElement("style");st.textContent=`svg .map-lake[data-name="Caspian Sea"]{fill:none!important;stroke:none!important}`;document.head.appendChild(st)}
