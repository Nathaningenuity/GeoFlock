/* GeoFlock: sea ice on the flat Satellite map.
   The globe draws its sea ice in the Day & Night shader (geoflock-daynightglobe.js): textures/SEAICE_POLAR.png, AMSR2 ASI
   sea-ice concentration from the University of Bremen (3.125 km, mean of 9-15 September 2026 in the Arctic and 23 February -
   1 March 2026 round Antarctica, the weeks of the 2026 minima), Natural Earth ice shelves; and textures/SEAICE_PHOTO.webp,
   a cloud-free photo of the ice from NASA GIBS MODIS / VIIRS Corrected Reflectance pictures of the same weeks.
   The flat map is drawn from the old map's SVG pictures, so the same ice is added there as two picture strips
   (textures/SEAICE_FLAT_N.webp, _S.webp), made once by tools/build-seaice-flat.js with the globe's own rules: the
   15% ice edge, the real photo inside it (drawn floes and leads where no clear photo exists), the same colours, and
   only over the sea.
   They sit above the satellite picture and below the clouds. */
(function(){
"use strict";
const BANDS=[{id:"gfSeaIceFlatN",href:"textures/SEAICE_FLAT_N.webp?v=2",y:-7,h:195},{id:"gfSeaIceFlatS",href:"textures/SEAICE_FLAT_S.webp?v=2",y:813,h:195}];
const NS="http://www.w3.org/2000/svg";
function on(){try{return allMapsColorMode==="satellite"&&allMapsColorModeOn!==false}catch(e){return false}}
function sync(){try{const svg=document.querySelector("#allMapsWrap svg");if(!svg)return;const want=on();
  const sat=svg.querySelector("#allMapsSatSea")||svg.querySelector("#allMapsSatLayer");let prev=sat&&(sat._spinFo||sat);
  BANDS.forEach(B=>{let im=svg.querySelector("#"+B.id);
   if(!im){if(!want)return;im=document.createElementNS(NS,"image");im.id=B.id;im.setAttribute("href",B.href);im.setAttribute("x","0");im.setAttribute("y",String(B.y));
    im.setAttribute("width","2000");im.setAttribute("height",String(B.h));im.setAttribute("preserveAspectRatio","none");im.style.pointerEvents="none"}
   if(prev&&prev.parentNode&&prev.nextSibling!==im)prev.after(im);else if(!im.parentNode)svg.insertBefore(im,svg.firstChild);
   prev=im;im.style.display=want?"":"none"});
  try{if(window.gfFlatOn&&gfFlatOn()&&typeof amGlobe!=="undefined"&&amGlobe)amGlobe.request?amGlobe.request():amGlobe.render()}catch(e){}}catch(e){console.error(e)}}
if(typeof applyAllMapsColorMode==="function"){const _a=applyAllMapsColorMode;applyAllMapsColorMode=function(){const r=_a.apply(this,arguments);try{sync()}catch(e){}return r}}
if(typeof amGlobeSync==="function"){const _s=amGlobeSync;amGlobeSync=function(){const r=_s.apply(this,arguments);try{sync()}catch(e){}return r}}
if(typeof cloudFlatSync==="function"){const _c=cloudFlatSync;cloudFlatSync=function(){const r=_c.apply(this,arguments);try{sync()}catch(e){}return r}}
setTimeout(sync,500);
window.gfSeaIceFlat={sync};
})();
