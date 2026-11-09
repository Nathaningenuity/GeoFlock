/* GeoFlock: "Natural Earth" relief colours, the Relief map's default style (Bright is the other picture style; Classic is hidden).
   Natural Earth I (shaded relief, land cover and water; public domain) graded to a saturated look: green where the land
   is wet, yellow and orange where it is dry, deep blue sea. The globe uses its own texture key (reliefNE) and the flat
   maps their own pictures, so Bright and Classic are untouched. */
(function(){
"use strict";
const ID="natural",NAME="Natural Earth",V="?v=1";
const IMG={all:"textures/reliefAllMaps_NE.webp"+V,atlas:"textures/reliefAtlas_NE.webp"+V,w:"textures/GLOBE_RELIEF_W_LK_NE.webp"+V,e:"textures/GLOBE_RELIEF_E_LK_NE.webp"+V};
const PAL={sea:["#3a95e0","#1f6fc4","#1257ab","#0b4594"],land:["#5fb04f","#e2d64a","#e9a866","#f2f4f8"],lake:"#2f7ab8"};
let ALLOW=0;const on=()=>{try{return gfMS().style===ID}catch(e){return false}};
function install(){
 if(typeof GF_STYLE_ORDER==="undefined"||typeof gfReliefApply!=="function"||typeof gfSetStyle!=="function"||typeof GLOBE_TEX==="undefined")return false;
 if(gfReliefApply._gfNE)return true;
 /* Natural Earth first and the default; Bright next to it; Classic is hidden */
 {const i=GF_STYLE_ORDER.findIndex(x=>x[0]==="classic");if(i>=0)GF_STYLE_ORDER.splice(i,1)}
 if(!GF_STYLE_ORDER.some(x=>x[0]===ID))GF_STYLE_ORDER.unshift([ID,NAME]);
 /* the style last chosen here (kept apart from the app's settings, which an older timer can reset) */
 try{const M=gfMS();let want=null;try{want=localStorage.getItem("gfReliefStyle")}catch(e){}
  if(!want||want==="classic")want=ID;if(M.style!==want&&(want===ID||GF_STYLE_ORDER.some(x=>x[0]===want))){M.style=want;gfMSsave()}M.neDefault=1;gfP().reliefClassic=false}catch(e){}
 GLOBE_TEX.reliefNE={kind:"halves",src:[IMG.w,IMG.e]};
 /* the globe's painted relief asks for "relief": it gets the Natural Earth halves while the style is on */
 /* WebGL keeps one texture per key: the Natural Earth pictures get their own */
 if(typeof GlobeGL!=="undefined"&&GlobeGL.prototype.texture&&!GlobeGL.prototype.texture._gfNE){const _t=GlobeGL.prototype.texture;GlobeGL.prototype.texture=function(key,imgs){return _t.call(this,key==="relief"&&on()?"reliefNE":key,imgs)};GlobeGL.prototype.texture._gfNE=1}
 const _gi=globeImages;globeImages=function(key,cb){return _gi.call(this,key==="relief"&&on()?"reliefNE":key,cb)};
 /* the older code turns any style it does not know back into Bright: it runs as Bright, then the pictures are swapped */
 const _ra=gfReliefApply;gfReliefApply=function(){if(!on())return _ra.apply(this,arguments);const M=gfMS();M.style="bright";let r;try{gfP().reliefClassic=false;r=_ra.apply(this,arguments)}finally{M.style=ID}
  const set=(id,u)=>{const el=document.getElementById(id);if(el&&el.getAttribute("href")!==u)el.setAttribute("href",u)};set("allMapsReliefLayer",IMG.all);set("atlasReliefLayer",IMG.atlas);
  try{RELIEF_SEA_RAMP.splice(0,RELIEF_SEA_RAMP.length,...PAL.sea);RELIEF_LAND_COVER.forEach((x,i)=>{x[0]=PAL.land[i]})}catch(e){}return r};gfReliefApply._gfNE=1;
 /* older code puts any style it does not know back to Bright (a timer set up before this file): only a real choice may
    move off Natural Earth */
 const guard=()=>{try{const M=gfMS();if(Object.getOwnPropertyDescriptor(M,"style").get)return;let v=M.style;
   Object.defineProperty(M,"style",{configurable:true,enumerable:true,get(){return v},set(x){if(v===ID&&x==="bright"&&!ALLOW)return;v=x}})}catch(e){}};
 guard();setInterval(guard,1000);
 const _ss=gfSetStyle;gfSetStyle=function(s){try{localStorage.setItem("gfReliefStyle",s)}catch(e){}ALLOW=1;guard();let r;try{r=_ss.apply(this,arguments)}finally{ALLOW=0}try{GFG.sig=null;gfGlobeDirty()}catch(e){}if(s===ID){try{gfP().reliefClassic=false}catch(e){}gfReliefApply();try{amGlobe&&amGlobe.request()}catch(e){}
   try{const lg=document.getElementById("populationLegend");if(lg&&allMapsColorMode==="relief")lg.innerHTML=allMapsLegendHTML()}catch(e){}}else{try{amGlobe&&amGlobe.request()}catch(e){}}return r};
 /* the lake colour in the key */
 if(typeof reliefLegendHTML==="function"){const _rl=reliefLegendHTML;reliefLegendHTML=function(){const h=_rl.apply(this,arguments);return on()?h.replace(/background:#a9d3ec/g,"background:"+PAL.lake):h}}
  setTimeout(()=>{try{gfReliefApply();GFG.sig=null;gfGlobeDirty();amGlobe&&amGlobe.request();const lg=document.getElementById("populationLegend");if(lg&&allMapsColorMode==="relief")lg.innerHTML=allMapsLegendHTML()}catch(e){}},50);
 return true}
let n=0;const t=setInterval(()=>{if(install()||++n>80)clearInterval(t)},400);
{const st=document.createElement("style");st.textContent=`.gf-ms-swatch.s-natural i{background:linear-gradient(135deg,#1257ab 0 30%,#5fb04f 30% 55%,#e2d64a 55% 75%,#e9a866 75%)!important}`;document.head.appendChild(st)}

/* Garabogazköl, the Caspian's great bay, is not among the map's own lakes: the relief picture shows it pale like a lake. Its
   outline (from OpenFreeMap's water, simplified to about 600 m) is added as a lake joined to the sea, so it is drawn in the
   Caspian's colour */
(function(){const GB={type:"MultiPolygon",coordinates:[[[[53.394,40.947],[53.394,42.132],[53.549,42.146],[53.698,42.154],[53.733,42.141],[53.841,42.129],[53.903,42.091],[53.926,42.025],[53.895,41.927],[53.904,41.908],[53.939,41.893],[53.978,41.834],[54.004,41.817],[54.022,41.749],[54.028,41.689],[54.018,41.641],[54.029,41.583],[54.103,41.527],[54.108,41.49],[54.144,41.484],[54.319,41.36],[54.406,41.344],[54.536,41.28],[54.549,41.269],[54.547,41.254],[54.609,41.205],[54.659,41.183],[54.675,41.158],[54.733,41.139],[54.773,41.093],[54.754,41.074],[54.805,41.046],[54.792,41.02],[54.772,41.039],[54.711,41.064],[54.719,41.057],[54.711,41.054],[54.772,41.005],[54.79,40.964],[54.783,40.947],[53.394,40.947]]],[[[54.531,40.703],[54.362,40.678],[54.248,40.675],[54.198,40.684],[54.145,40.673],[54.11,40.684],[54.107,40.708],[54.117,40.723],[54.103,40.725],[54.042,40.715],[54.088,40.706],[54.051,40.67],[53.963,40.663],[53.95,40.679],[53.934,40.653],[53.87,40.643],[53.841,40.621],[53.771,40.625],[53.72,40.616],[53.696,40.64],[53.699,40.685],[53.643,40.791],[53.64,40.818],[53.657,40.82],[53.629,40.832],[53.627,40.855],[53.64,40.858],[53.628,40.858],[53.635,40.882],[53.629,40.885],[53.624,40.88],[53.6,40.891],[53.611,40.86],[53.583,40.828],[53.591,40.824],[53.58,40.803],[53.588,40.777],[53.562,40.753],[53.52,40.739],[53.477,40.744],[53.481,40.736],[53.47,40.729],[53.433,40.738],[53.443,40.747],[53.422,40.756],[53.416,40.742],[53.396,40.743],[53.394,41.013],[54.764,41.013],[54.79,40.964],[54.769,40.922],[54.737,40.885],[54.624,40.808],[54.463,40.792],[54.42,40.818],[54.36,40.889],[54.344,40.889],[54.337,40.862],[54.314,40.85],[54.312,40.84],[54.332,40.817],[54.371,40.797],[54.367,40.778],[54.38,40.772],[54.351,40.762],[54.347,40.747],[54.31,40.739],[54.33,40.737],[54.321,40.725],[54.362,40.751],[54.413,40.769],[54.562,40.78],[54.59,40.769],[54.596,40.735],[54.579,40.732],[54.564,40.745],[54.531,40.703]],[[54.134,40.722],[54.175,40.712],[54.17,40.688],[54.193,40.704],[54.204,40.725],[54.237,40.726],[54.207,40.733],[54.134,40.722]]],[[[52.998,40.947],[52.99,40.986],[52.961,41.013],[52.963,41.042],[52.954,41.062],[52.944,41.064],[52.947,41.058],[52.928,41.079],[52.918,41.101],[52.904,41.072],[52.917,41.052],[52.901,41.065],[52.911,41.106],[52.88,41.115],[52.839,41.292],[52.806,41.364],[52.812,41.416],[52.86,41.576],[52.862,41.641],[52.886,41.668],[52.837,41.673],[52.819,41.636],[52.824,41.628],[52.787,41.598],[52.732,41.606],[52.738,41.61],[52.726,41.612],[52.723,41.626],[52.765,41.677],[52.741,41.704],[52.74,41.74],[52.797,41.784],[52.967,41.999],[53.112,42.097],[53.186,42.117],[53.283,42.1],[53.387,42.131],[53.481,42.136],[53.481,40.947],[52.998,40.947]]],[[[53.481,40.74],[53.47,40.729],[53.447,40.731],[53.433,40.738],[53.443,40.747],[53.422,40.756],[53.416,40.742],[53.405,40.74],[53.39,40.749],[53.393,40.767],[53.383,40.761],[53.359,40.775],[53.367,40.765],[53.359,40.755],[53.298,40.731],[53.262,40.731],[53.228,40.709],[53.209,40.729],[53.172,40.715],[53.099,40.707],[53.072,40.712],[53.07,40.72],[53.043,40.709],[53.001,40.722],[52.972,40.76],[52.975,40.784],[52.999,40.804],[53.006,40.794],[52.986,40.766],[53.026,40.778],[53.041,40.814],[53.038,40.838],[52.988,40.972],[52.993,40.98],[52.962,41.013],[53.481,41.013],[53.481,40.74]]]]};let fixed=false;
 /* drawn just before the detail layer, on the Relief map while the tiles do not cover the view yet (they draw it themselves
    when close, as water joined to the sea) */
 const t=setInterval(()=>{if(!window.gfDetail||!gfDetail.draw||gfDetail.draw._gfGB)return;const d0=gfDetail.draw;
  gfDetail.draw=function(g,ctx,I){try{const ov=I&&I.ov||{};if(I&&I.drewRaster&&/^(relief|gfRelShade)/.test(I.texKey||"")&&ov.lakes&&!(gfDetail.covers&&gfDetail.covers(g))){
    if(!fixed){fixed=true;try{if(d3.geoArea(GB)>2*Math.PI)GB.coordinates.forEach(P=>P.forEach(r=>r.reverse()))}catch(e){}}
    ctx.save();ctx.beginPath();d3.geoPath(g.projection(),ctx)(GB);ctx.fillStyle=window._gfSeaC||"rgb(38,116,185)";ctx.fill();ctx.restore()}}catch(e){}return d0.apply(this,arguments)};
  gfDetail.draw._gfGB=1;clearInterval(t)},400)})();
})();
/* lakes open to the sea are drawn as sea, not as lakes */
window.gfSeaLake=function(n){return /^(Caspian|Garabogaz|Kara-?Bogaz|Lake Maracaibo|Lagoa dos Patos|Lagoa Mirim|Lake Molochnyi Liman|Lake Kiziltashskiy liman)/.test(n||"")};
gfSeaLake.ne=function(){try{return gfMS().style==="natural"}catch(e){return false}};
/* the Caspian is a special exception: never painted as a lake (the base pictures already show it as water); hovering it
   still names it */
{const st=document.createElement("style");st.textContent=`svg .map-lake[data-name="Caspian Sea"]{fill:none!important;stroke:none!important}`;document.head.appendChild(st)}
