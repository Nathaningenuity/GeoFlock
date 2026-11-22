/* GeoFlock: every named lake answers the pointer. A small lake on a river (Lake Bienville, Gyaring Hu, Bull Shoals) is
   named as the lake, not the river, whenever Lakes is on; a lake cut out of the country shapes (Lake Maracaibo, Lagoa dos
   Patos) is named with the country around it, like other lakes. */
(function(){
"use strict";
function install(){if(typeof GlobeView==="undefined"||!GlobeView.prototype.waterAt||GlobeView.prototype.waterAt._gfLk)return!!(typeof GlobeView!=="undefined"&&GlobeView.prototype.waterAt&&GlobeView.prototype.waterAt._gfLk);
 const _wa=GlobeView.prototype.waterAt;
 GlobeView.prototype.waterAt=function(ll){const out=_wa.apply(this,arguments)||{};try{if(out.lake||!ll)return out;const ov=this.cfg.overlays?this.cfg.overlays():{};if(!ov.lakes)return out;
   /* zoomed in, the map shows the detailed tiles' lakes, not these rough shapes: the detailed hover alone answers (a rough Lake Nasser lit up
      in the desert beside the sharp lake) */
   if(window.gfDetail&&gfDetail.on&&gfDetail.on(this))return out;
   for(const L of globeOverlays().lakes){if(!L.n||!L.minor)continue;if(d3.geoDistance(L.c,ll)<=L.r&&d3.geoContains(L,ll)){const n=window.gfLakeAlias?gfLakeAlias(L.n,ll,this):L.n;out.water=n;out.lake=n===L.n?L:Object.assign({},L,{n});delete out.river;break}}}catch(e){}return out};
 GlobeView.prototype.waterAt._gfLk=1;
 const _h=GlobeView.prototype._hover;
 GlobeView.prototype._hover=function(e){const r=_h.apply(this,arguments);try{if(this.cfg.noHover||this.tip.hidden)return r;const t=this.tip.textContent||"";const h=this.hit(e.clientX,e.clientY);if(!h||!h.ll)return r;
   const w=this.waterAt(h.ll,e.clientX,e.clientY),L=w.lake;if(!L)return r;
   /* the lake's name first, then the place round it */
   if(t.indexOf(L.n)<0){this.tip.textContent=L.n+" — "+t;return r}
   if(t.indexOf(" — ")>=0||h.code||t.indexOf(L.n)!==0)return r;
   const c=countryAround(this,L,h.ll);if(c)this.tip.textContent=t+" — "+c}catch(err){}return r};return true}
/* the country whose land lies right round the lake: looked for a little way out from the pointer in eight directions */
/* worked out for each half-degree square of the lake, not once per lake: a lake with several countries round it is named with the
   nearest (the Caspian off Baku read "— Russia" everywhere, from wherever it was first hovered); none when no shore is near */
const CACHE=new Map(),BB=new WeakMap();
const bbOf=f=>{let b=BB.get(f);if(!b){try{b=d3.geoBounds(f)}catch(e){b=[[-180,-90],[180,90]]}BB.set(f,b)}return b};
const inBB=(b,p)=>b[0][0]<=b[1][0]?(p[0]>=b[0][0]&&p[0]<=b[1][0]&&p[1]>=b[0][1]&&p[1]<=b[1][1]):(p[1]>=b[0][1]&&p[1]<=b[1][1]);
function countryAround(g,L,ll){const key=L.n+"|"+Math.round(ll[0]*2)+","+Math.round(ll[1]*2);if(CACHE.has(key))return CACHE.get(key);let name=null;const F=g.features||[];
 outer:for(const d of [.15,.35,.7,1.2,2]){for(let k=0;k<8;k++){const a=k*Math.PI/4,p=[ll[0]+Math.cos(a)*d/Math.max(.2,Math.cos(ll[1]*Math.PI/180)),ll[1]+Math.sin(a)*d];
   if(d3.geoContains(L,p))continue;for(const f of F){const cc=f.properties&&String(f.properties.c||"").toLowerCase();if(!cc||cc==="aq"||!inBB(bbOf(f),p))continue;try{if(d3.geoContains(f,p)){const C=typeof COUNTRY_BY_CODE!=="undefined"&&COUNTRY_BY_CODE[cc];name=C?C.n:null;if(name)break outer}}catch(e){}}}}
 CACHE.set(key,name);return name}
let n=0;const t=setInterval(()=>{if(install()||++n>60)clearInterval(t)},500);
})();
