/* GeoFlock: the sea on the data maps (Population, Economy, Politics, Culture; not History).
   Flat map: with the relief underneath off, the map has no background of its own (the page shows through the sea).
   Globe: the sea is filled, the dark night-sea colour in the dark theme and a light blue in the light one. */
(function(){
const MODES=new Set(["population","gdp","politics","culture"]);
const reliefUnder=()=>{try{return typeof thReliefOn==="function"&&thReliefOn()&&typeof TH_MODES!=="undefined"&&TH_MODES.has(allMapsColorMode)}catch(e){return false}};
const on=()=>{try{return appMode==="allmaps"&&allMapsColorModeOn&&MODES.has(allMapsColorMode)&&!reliefUnder()}catch(e){return false}};
function flat(){const w=document.getElementById("allMapsWrap");if(!w)return;const v=on();w.classList.toggle("gf-nosea",v);
 /* set on the frame itself: some map modes paint it with their own !important rules */
 w.querySelectorAll("svg .map-frame").forEach(f=>{if(v)f.style.setProperty("fill","transparent","important");else if(f.style.fill)f.style.removeProperty("fill")})}
const SEA_D="#1c2333",SEA_L="#cfe3f1",dark=()=>document.body.classList.contains("sky-night");
/* the Population globe's picture has its sea painted in (one blue, 111/168/201): recoloured copies, made once each */
const DENS={};function densKey(){const k=dark()?"densitySeaD":"densitySeaL";if(typeof GLOBE_TEX==="undefined"||!GLOBE_TEX.density)return null;
 if(GLOBE_TEX[k])return k;if(DENS[k])return null;DENS[k]=1;const im=new Image();im.onload=()=>{try{const c=document.createElement("canvas");c.width=im.width;c.height=im.height;const x=c.getContext("2d",{willReadFrequently:true});x.drawImage(im,0,0);
  const D=x.getImageData(0,0,c.width,c.height),d=D.data,h=dark()&&k==="densitySeaD"?SEA_D:k==="densitySeaD"?SEA_D:SEA_L,t=[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
  for(let i=0;i<d.length;i+=4){const dr=d[i]-111,dg=d[i+1]-168,db=d[i+2]-201,e=dr*dr+dg*dg+db*db;if(e<900){const f=e<200?1:1-(e-200)/700;d[i]=d[i]+(t[0]-d[i])*f;d[i+1]=d[i+1]+(t[1]-d[i+1])*f;d[i+2]=d[i+2]+(t[2]-d[i+2])*f}}
  x.putImageData(D,0,0);c.toBlob(bl=>{GLOBE_TEX[k]={kind:GLOBE_TEX.density.kind,src:[URL.createObjectURL(bl)]};try{amGlobe.request()}catch(e){}},"image/png")}catch(e){console.error(e)}};im.src=GLOBE_TEX.density.src[0];return null}
function globe(){try{if(typeof amGlobe==="undefined"||!amGlobe||amGlobe._gfSea)return;amGlobe._gfSea=1;const o=amGlobe.cfg.ocean,r=amGlobe.cfg.raster;
 amGlobe.cfg.ocean=function(){if(on())return amGlobe._flat?"rgba(0,0,0,0)":dark()?SEA_D:SEA_L;return o?o.apply(this,arguments):"#5797cf"};
 if(r)amGlobe.cfg.raster=function(){const v=r.apply(this,arguments);if(v==="density"&&on()){const k=densKey();if(k)return k}return v}}catch(e){}}
if(typeof applyAllMapsColorMode==="function"){const _a=applyAllMapsColorMode;applyAllMapsColorMode=function(){const r=_a.apply(this,arguments);try{flat()}catch(e){}return r}}
if(typeof amGlobeSync==="function"){const _s=amGlobeSync;amGlobeSync=function(){const r=_s.apply(this,arguments);try{globe()}catch(e){}return r}}
let last="";setInterval(()=>{try{flat();globe();const k=on()+"|"+document.body.classList.contains("sky-night");if(k!==last){last=k;if(typeof amGlobe!=="undefined"&&amGlobe&&amGlobeOn())amGlobe.request()}}catch(e){}},400);
const st=document.createElement("style");st.textContent="#allMapsWrap.gf-nosea svg .map-frame{ fill:transparent !important; }";document.head.appendChild(st);
})();
