/* GeoFlock: tour stops can light up landforms by name (islands, peninsulas, deserts…), not only whole countries.
   A stop's hiLand:["Borneo","Sumatra",…] fills and outlines each shape from the map's landform data (the same shapes the
   search uses), on the flat map and the globe. Used where an island is only part of a country (Borneo, Baffin Island…). */
(function(){
const HILAND={
 "islands|The biggest islands":["Greenland","New Guinea","Borneo","Madagascar","Baffin Island","Sumatra","Honshu","Victoria Island","Great Britain"]};
const CACHE=new Map();
function shape(name){if(CACHE.has(name))return CACHE.get(name);let g=null;
 try{const o=(LANDFORMS.items||[]).find(x=>x.name===name&&!/__L\d$/.test(x.id||""));
  if(o&&window.gfSearch){const f=gfSearch.find(name)||[];for(const r of f){const e=r[2]||r;if(e&&e.n===name&&e.g&&/Polygon/.test(e.g.type)){g=e.g;break}}}
  if(g){const turn=P=>{try{return d3.geoArea({type:"Polygon",coordinates:P})>2*Math.PI?P.map(r=>r.slice().reverse()):P}catch(x){return P}};
   g=g.type==="Polygon"?{type:"Polygon",coordinates:turn(g.coordinates)}:{type:"MultiPolygon",coordinates:g.coordinates.map(turn)}}}catch(e){g=null}
 CACHE.set(name,g);return g}
function names(){try{if(typeof ps==="undefined"||!ps)return null;const S=psSteps()[ps.i];if(!S)return null;return S.hiLand||HILAND[ps.tour+"|"+S.title]||(S.gfFrom&&HILAND[S.gfFrom])||null}catch(e){return null}}
function draw(ctx,p){const N=names();if(!N)return;const path=d3.geoPath(p,ctx);ctx.save();ctx.lineJoin="round";
 N.forEach(n=>{const g=shape(n);if(!g)return;ctx.beginPath();path(g);ctx.fillStyle="rgba(255,206,84,.32)";ctx.fill();ctx.strokeStyle="rgba(20,30,50,.55)";ctx.lineWidth=3.2;ctx.stroke();ctx.strokeStyle="#ffce54";ctx.lineWidth=1.6;ctx.stroke()});ctx.restore()}
let hooked=null;setInterval(()=>{try{const g=typeof amGlobe!=="undefined"&&amGlobe;if(!g||!g.cfg||hooked===g)return;hooked=g;const d0=g.cfg.drawExtra;
  g.cfg.drawExtra=function(ctx,p,gv){if(d0)try{d0.apply(this,arguments)}catch(e){console.error(e)}try{draw(ctx,p)}catch(e){console.error(e)}}}catch(e){}},500);
{const _g=psGo;psGo=function(){const r=_g.apply(this,arguments);setTimeout(()=>{try{amGlobe&&amGlobe.request()}catch(e){}},50);return r}}
window.gfTourLand={HILAND,shape};
})();
