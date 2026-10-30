/* GeoFlock: tour stops can lay context over the map they run on (usually the Relief map) instead of switching maps.
   gfEmpire:{y:1530,gk:"inca",name:"Inca Empire"}   an empire's extent in year y, from the History map's own data
                                                     (history/h2-*.json; gk is the History map's group key, "chn" also
                                                     matches China's dynasties by name), shaded and outlined
   gfClimate:{alpha:.5, box:[w,s,e,n]}              today's climate zones (the Climate map's own picture, Köppen
                                                     classes) laid half see-through over the stop's view (or box)
   Both are drawn on the globe and on the flat map (the tours draw through psGlobeDraw on both), under the stop's
   pins, lines and labels. */
(function(){
if(typeof psGlobeDraw!=="function"||typeof d3==="undefined")return;
const req=()=>{try{if(typeof ps!=="undefined"&&ps&&ps.g)ps.g.request?ps.g.request():ps.g.render()}catch(e){}};

/* ---------- empires from the History map's data ---------- */
let IDX=null,idxP=null;const CH={},CHP={},EMP=new Map;
const ALIAS={chn:/^(Great Ming|Ming|Qing|Northern Song|Southern Song|Song Empire|Han Empire|Western Han|Eastern Han|Tang|Sui|Yuan|China)$/};
function dens(r){const o=[];for(let k=0;k<r.length;k++){const a=r[k];o.push(a);const b=r[k+1];if(!b)continue;const n=Math.floor(Math.max(Math.abs(b[0]-a[0]),Math.abs(b[1]-a[1])));for(let j=1;j<n;j++)o.push([a[0]+(b[0]-a[0])*j/n,a[1]+(b[1]-a[1])*j/n])}return o}
function chunk(y){if(!IDX){if(!idxP)idxP=fetch("history/h2-index.json").then(r=>r.json()).then(j=>{IDX=j;req()}).catch(()=>{});return null}
 const k=IDX.chunks.findIndex(c=>y>=c[0]&&y<c[1]);if(k<0)return null;if(CH[k])return CH[k];
 if(!CHP[k])CHP[k]=fetch("history/"+IDX.chunks[k][2]).then(r=>r.json()).then(topo=>{const fc=topojson.feature(topo,topo.objects[Object.keys(topo.objects)[0]]);CH[k]=fc.features;req()}).catch(()=>{});return null}
function empire(o){const key=o.y+"|"+o.gk;if(EMP.has(key))return EMP.get(key);const C=chunk(o.y);if(!C)return null;const t=o.y+.5,out=[];
 C.forEach(f=>{const p=f.properties||{};if(!(p.s<=t&&t<p.e)||!f.geometry)return;if(p.h&&p.h.some(r=>t>=r[0]&&t<r[1]))return;
  if(!(p.gk===o.gk||(ALIAS[o.gk]&&ALIAS[o.gk].test(p.n||""))))return;
  const g=f.geometry;let P=g.type==="Polygon"?[g.coordinates]:g.type==="MultiPolygon"?g.coordinates:null;if(!P)return;
  P=P.map(poly=>poly.map(dens));P.forEach(poly=>{try{if(d3.geoArea({type:"Polygon",coordinates:poly})>2*Math.PI)poly.forEach(r=>r.reverse())}catch(e){}});
  out.push({type:"Feature",properties:p,geometry:{type:"MultiPolygon",coordinates:P}})});
 out.sort((a,b)=>(b.properties.a||0)-(a.properties.a||0));const E={feats:out,col:(out[0]&&out[0].properties.c)||"#c0623a",big:out.length?out[0].properties.a||0:0};EMP.set(key,E);return E}

/* ---------- climate zones from the Climate map's picture ---------- */
let CLIM=null,climP=null;
function climData(){if(CLIM)return CLIM;if(climP||typeof GLOBE_CLIMATE_IMG==="undefined")return null;
 climP=new Promise(res=>{const im=new Image;im.onload=()=>{try{const c=document.createElement("canvas");c.width=im.naturalWidth;c.height=im.naturalHeight;const x=c.getContext("2d",{willReadFrequently:true});x.drawImage(im,0,0);
   CLIM={w:c.width,h:c.height,d:x.getImageData(0,0,c.width,c.height).data,cells:new Map};req()}catch(e){console.error(e)}res()};im.onerror=()=>res();im.src=GLOBE_CLIMATE_IMG});return null}
const climCol=i=>typeof GLOBE_CLIMATE_COLS!=="undefined"?GLOBE_CLIMATE_COLS[i-1]:null;
/* the zones as runs of equal cells (one degree, at most six long) inside the box */
function climCells(box){const C=climData();if(!C)return null;const key=box.join(",");if(C.cells.has(key))return C.cells.get(key);const R=1,out=[];
 const at=(lon,lat)=>{const x=Math.min(C.w-1,Math.max(0,Math.floor((lon+180)/360*C.w))),y=Math.min(C.h-1,Math.max(0,Math.floor((90-lat)/180*C.h)));return C.d[(y*C.w+x)*4]};
 for(let lat=Math.ceil(box[3]);lat>Math.floor(box[1]);lat-=R){let run=null;
  for(let lon=Math.floor(box[0]);lon<Math.ceil(box[2]);lon+=R){const i=at(lon+R/2,lat-R/2),col=i?climCol(i):null;
   if(run&&run.col===col&&lon+R-run.a<=6){run.b=lon+R;continue}if(run&&run.col)out.push(run);run={a:lon,b:lon+R,col}}
  if(run&&run.col)out.push(run);out.forEach(r=>{if(r.lat==null)r.lat=lat})}
 const e=.06,byCol=new Map;out.forEach(r=>{const ring=[[r.a-e,r.lat+e],[r.b+e,r.lat+e],[r.b+e,r.lat-R-e],[r.a-e,r.lat-R-e],[r.a-e,r.lat+e]];
  if(!byCol.has(r.col))byCol.set(r.col,[]);byCol.get(r.col).push([ring])});
 const res=[...byCol].map(([col,polys])=>({col,geo:{type:"MultiPolygon",coordinates:polys}}));C.cells.set(key,res);return res}

/* ---------- drawing: fills go to a picture of their own, laid over the map half see-through ---------- */
let OFF=null;
function layer(ctx,p,alpha,draw){const cv=ctx.canvas;if(!OFF)OFF=document.createElement("canvas");if(OFF.width!==cv.width||OFF.height!==cv.height){OFF.width=cv.width;OFF.height=cv.height}
 const o=OFF.getContext("2d");o.setTransform(1,0,0,1,0,0);o.clearRect(0,0,OFF.width,OFF.height);o.setTransform(ctx.getTransform());draw(o,d3.geoPath(p,o));
 ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=alpha;ctx.drawImage(OFF,0,0);ctx.restore()}
function drawOver(ctx,p,gv){if(typeof ps==="undefined"||!ps||!gv||gv!==ps.g)return;const S=(psSteps()||[])[ps.i];if(!S||!(S.gfEmpire||S.gfClimate))return;
 if(S.gfClimate){const o=S.gfClimate===true?{}:S.gfClimate,box=o.box||S.view||[-180,-60,180,80],cells=climCells(box);
  if(cells)layer(ctx,p,o.alpha||.5,(c,path)=>cells.forEach(z=>{c.beginPath();path(z.geo);c.fillStyle=z.col;c.fill()}))}
 if(S.gfEmpire){(Array.isArray(S.gfEmpire)?S.gfEmpire:[S.gfEmpire]).forEach(o=>{const E=empire(o);if(!E||!E.feats.length)return;const col=o.col||E.col;
  layer(ctx,p,o.alpha||.42,(c,path)=>{c.beginPath();E.feats.forEach(f=>path(f));c.fillStyle=col;c.fill()});
  const path=d3.geoPath(p,ctx);ctx.save();ctx.lineJoin="round";
  E.feats.forEach(f=>{if((f.properties.a||0)<E.big*.25)return;ctx.beginPath();path(f);ctx.strokeStyle="rgba(255,255,255,.85)";ctx.lineWidth=4;ctx.stroke();ctx.strokeStyle=col;ctx.lineWidth=2;ctx.stroke()});
  /* the empire's name and year, in its colour, at its label point */
  const name=o.name||E.feats[0].properties.n,at=o.at||E.feats[0].properties.l;let q=null;try{q=at&&p(at)}catch(e){}
  if(name&&q&&(!gv._flat?d3.geoDistance(at,[-gv.rot[0],-gv.rot[1]])<Math.PI/2-.05:true)){const s=Math.max(12,Math.min(17,12+(gv.zoom||1)));ctx.font="800 "+s+"px Inter, system-ui, sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";
   const txt=name+(o.label===false?"":", "+(o.y<0?(-o.y+1)+" BC":o.y));ctx.lineWidth=4;ctx.strokeStyle="rgba(255,255,255,.92)";ctx.strokeText(txt,q[0],q[1]);ctx.fillStyle="#3b2414";ctx.fillText(txt,q[0],q[1])}
  ctx.restore()})}}
{const _d=psGlobeDraw;psGlobeDraw=function(ctx,p,gv){try{drawOver(ctx,p,gv)}catch(e){console.error(e)}return _d.apply(this,arguments)}}
/* data is fetched as soon as a stop that needs it is near, so it is there when the stop opens */
setInterval(()=>{try{if(typeof ps==="undefined"||!ps)return;const L=psSteps()||[];for(let k=ps.i;k<=ps.i+1&&k<L.length;k++){const S=L[k];if(!S)continue;
  if(S.gfClimate)climData();if(S.gfEmpire)(Array.isArray(S.gfEmpire)?S.gfEmpire:[S.gfEmpire]).forEach(empire)}}catch(e){}},700);
window.gfTourOver={empire,climCells};
})();
