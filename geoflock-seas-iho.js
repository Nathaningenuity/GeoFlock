/* GeoFlock: the seas and oceans from the International Hydrographic Organization's limits (geoflock-seas-iho-data.js),
   in place of the rough sea shapes the map had (Natural Earth's marine areas, which left parts of a sea out: the
   Alboran Sea and the Gulf of Sidra were in no sea, so the Mediterranean had holes near Gibraltar and off Libya).
   The IHO areas cover all the sea with no gaps; each was cut back to the map's own coast, so a sea's fill stops at the shore.
   - Search and Landforms: each sea keeps its name and facts and takes its IHO shape (the smaller seas the app has no name
     for are part of the sea around them: the Mediterranean takes in the Alboran and Ligurian Seas, the Baltic the Gulf
     of Riga, the Red Sea the Gulf of Aqaba). Searching a sea still lights up the seas inside it (GF_SEA_PARENT).
   - Globe: pointing at the sea names the smallest sea there (the Adriatic, not the Mediterranean around it), and the
     sea names are placed inside the new shapes. Seas with no name of their own in the app (the Celtic Sea, the Flores
     Sea, Bass Strait...) are named on hover too.
   Bays and gulfs the IHO does not list (Chesapeake Bay, the Gulf of Lion, the Weddell Sea...) keep their shapes.
   Loaded after geoflock-landforms.js and before geoflock-seas.js, which merges the North and South Atlantic and Pacific. */
(function(){
const D=window.GF_SEAS_IHO;if(!D||typeof d3==="undefined")return;
/* d3 wants each polygon wound so it holds the small side: one wound the other way round holds the rest of the world */
Object.values(D).forEach(polys=>polys.forEach(P=>{try{if(d3.geoArea({type:"Polygon",coordinates:P})>2*Math.PI)P.forEach(r=>r.reverse())}catch(e){}}));
/* the map's sea names that differ from the IHO's */
const ALIAS={"Golfo de California":"Gulf of California","The North Western Passages":"Northwest Passage","Inner Seas":"Inner Seas (Scotland)","Inner Sea":"Seto Inland Sea"};
const key=n=>D[n]?n:ALIAS[n]&&D[ALIAS[n]]?ALIAS[n]:null;
/* Search and Landforms */
try{if(typeof LANDFORMS!=="undefined"&&LANDFORMS.items)LANDFORMS.items.forEach(o=>{if(o.cat!=="seas")return;const k=key(o.name);if(k)o.geom={t:"poly",c:D[k]}})}catch(e){console.error(e)}
/* Globe: the sea shapes behind hover and the sea names */
const used=new Set();
function patch(O){if(!O||!O.seas||O._iho)return;O._iho=1;
 O.seas.forEach(S=>{const k=key(S.n);if(!k)return;used.add(k);S.poly={type:"MultiPolygon",coordinates:D[k]};delete S._g;delete S._sp});
 const have=new Set(O.seas.map(S=>S.n));
 Object.keys(D).forEach(k=>{if(used.has(k)||have.has(k)||/^(North|South) (Atlantic|Pacific) Ocean$/.test(k))return;const poly={type:"MultiPolygon",coordinates:D[k]};
  try{O.seas.push({n:k,tier:3,ll:d3.geoCentroid(poly),poly,iho:1})}catch(e){}})}
function wrap(){if(typeof globeOverlays!=="function"||globeOverlays._iho)return false;const g0=globeOverlays;
 globeOverlays=function(){const O=g0.apply(this,arguments);try{patch(O)}catch(e){console.error(e)}return O};globeOverlays._iho=1;return true}
/* the smallest sea under the pointer (the seas overlap: the Mediterranean holds the Adriatic) */
const box=S=>{if(!S._bb){const b=d3.geoBounds(S.poly);S._bb=b;S._ar=d3.geoArea(S.poly)}return S._bb};
const inBox=(b,ll)=>{const[[x0,y0],[x1,y1]]=b;if(ll[1]<y0-.01||ll[1]>y1+.01)return false;return x0<=x1?ll[0]>=x0-.01&&ll[0]<=x1+.01:ll[0]>=x0-.01||ll[0]<=x1+.01};
function wrapHover(){if(typeof GlobeView==="undefined"||!GlobeView.prototype.waterAt||GlobeView.prototype.waterAt._iho)return false;const w0=GlobeView.prototype.waterAt;
 GlobeView.prototype.waterAt=function(ll){const out=w0.apply(this,arguments)||{};if(out.sea&&ll)try{const O=globeOverlays();let best=null;
  for(const S of O.seas){if(!S.poly)continue;if(!inBox(box(S),ll))continue;if(best&&S._ar>=best._ar)continue;if(d3.geoContains(S.poly,ll))best=S}if(best)out.sea=best.n}catch(e){}return out};
 GlobeView.prototype.waterAt._iho=1;return true}
const go=()=>{const a=wrap(),b=wrapHover();return a&&b};
if(!go()){document.addEventListener("DOMContentLoaded",go);setTimeout(go,0)}
})();
