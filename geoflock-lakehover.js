/* GeoFlock: every named lake answers the pointer. A small lake on a river (Lake Bienville, Gyaring Hu, Bull Shoals) is
   named as the lake, not the river, whenever Lakes is on; a lake cut out of the country shapes (Lake Maracaibo, Lagoa dos
   Patos) is named with the country around it, like other lakes. */
(function(){
"use strict";
function install(){if(typeof GlobeView==="undefined"||!GlobeView.prototype.waterAt||GlobeView.prototype.waterAt._gfLk)return!!(typeof GlobeView!=="undefined"&&GlobeView.prototype.waterAt&&GlobeView.prototype.waterAt._gfLk);
 const _wa=GlobeView.prototype.waterAt;
 GlobeView.prototype.waterAt=function(ll){const out=_wa.apply(this,arguments)||{};try{if(out.lake||!ll)return out;const ov=this.cfg.overlays?this.cfg.overlays():{};if(!ov.lakes)return out;
   for(const L of globeOverlays().lakes){if(!L.n||!L.minor)continue;if(d3.geoDistance(L.c,ll)<=L.r&&d3.geoContains(L,ll)){out.water=L.n;out.lake=L;delete out.river;break}}}catch(e){}return out};
 GlobeView.prototype.waterAt._gfLk=1;
 const _h=GlobeView.prototype._hover;
 GlobeView.prototype._hover=function(e){const r=_h.apply(this,arguments);try{if(this.cfg.noHover||this.tip.hidden)return r;const t=this.tip.textContent||"";const h=this.hit(e.clientX,e.clientY);if(!h||!h.ll)return r;
   const w=this.waterAt(h.ll,e.clientX,e.clientY),L=w.lake;if(!L)return r;
   /* the lake's name first, then the place round it */
   if(t.indexOf(L.n)<0){this.tip.textContent=L.n+" — "+t;return r}
   if(t.indexOf(" — ")>=0||h.code||t.indexOf(L.n)!==0)return r;
   const c=countryAround(this,L,h.ll);if(c)this.tip.textContent=t+" — "+c}catch(err){}return r};return true}
/* the country whose land lies right round the lake: looked for a little way out from the pointer in eight directions */
const CACHE=new Map();
function countryAround(g,L,ll){if(CACHE.has(L.n))return CACHE.get(L.n);let name=null;const F=g.features||[];
 outer:for(const d of [.15,.35,.7,1.2,2]){for(let k=0;k<8;k++){const a=k*Math.PI/4,p=[ll[0]+Math.cos(a)*d/Math.max(.2,Math.cos(ll[1]*Math.PI/180)),ll[1]+Math.sin(a)*d];
   if(d3.geoContains(L,p))continue;for(const f of F){const cc=f.properties&&String(f.properties.c||"").toLowerCase();if(!cc||cc==="aq")continue;try{if(d3.geoContains(f,p)){const C=typeof COUNTRY_BY_CODE!=="undefined"&&COUNTRY_BY_CODE[cc];name=C?C.n:null;if(name)break outer}}catch(e){}}}}
 CACHE.set(L.n,name);return name}
let n=0;const t=setInterval(()=>{if(install()||++n>60)clearInterval(t)},500);
})();
