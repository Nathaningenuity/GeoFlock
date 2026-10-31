/* GeoFlock: tour fixes — "drag me" shapes that really drag, coloured group outlines, and a few tour stops.
   1. Drag. The flat map is now drawn by the globe engine (#amGlobeHost.gf-flat), and its pan handler listens on the
      host in the capture phase, so it got every pointerdown before the tour's own drag listeners on the canvas (those
      run later, at the target) — the shape never started to move, the map panned instead. Here one listener on window,
      in the capture phase (so before the host and the canvas), starts the drag when the pointer is on a dragged shape
      (S.drag outlines and the Moon, S.ghosts) or on its "· drag me" tag, on the flat canvas map, on the globe and on the
      old SVG flat map (where only the tag needed it). The tag takes the pointer now, with a grab cursor.
   2. Grouped highlights (stop.G): each country's outline is drawn in its group's legend colour, not white.
   3. Stops: North America "The Caribbean" (three groups, territories too, new text); Oceania "Oceania" (intro: the
      Opera House photo sits at Sydney), "Only in Australia" (no Wallace Line diagram, a dingo photo pin), "The Great
      Barrier Reef" (reef animals from the Ocean life tour), "New Zealand" (Zealandia drawn), "Big ocean states"
      (Kiribati's islands lit and ringed). Other stops are not changed. */
(function(){
"use strict";
const OR="#d9682b";
const def=(o,k,v)=>Object.defineProperty(o,k,{configurable:true,enumerable:true,writable:true,value:v});
const lock=(o,k,v)=>Object.defineProperty(o,k,{configurable:true,enumerable:true,get(){return v},set(){}});
const live=()=>{try{return typeof ps!=="undefined"&&!!ps}catch(e){return false}};
const stepOf=(t,title)=>{try{const T=PS_TOURS[t];return T&&Array.isArray(T.steps)?T.steps.find(s=>s&&s.title===title):null}catch(e){return null}};
const cur=()=>{try{return psSteps()[ps.i]}catch(e){return null}};
const codeOf=f=>String(f&&f.properties&&(f.properties.c||f.properties.dimAs)||"").toLowerCase();
const isDark=()=>{try{const b=document.body.classList;return b.contains("dark-theme")||b.contains("dark")||document.documentElement.classList.contains("dark")||(typeof allMapsColorMode!=="undefined"&&allMapsColorMode==="night")}catch(e){return false}};

/* ---------------- photos ---------------- */
const DINGO={f:"Canis lupus dingo, Fraser Island.jpg",d:"photos/xffc1b3e520baaf0c.webp",by:"Brian Gratwicke",lic:"CC BY 2.0",page:"https://commons.wikimedia.org/wiki/File:Canis_lupus_dingo,_Fraser_Island.jpg"};
const LAB_FILE={"Dingo: roams the north":DINGO.f,"Clownfish":"Clownfish in an anemone.jpg","Green turtle":"Green turtle on a reef.jpg","Manta ray":"Giant oceanic manta ray.jpg","Nudibranch":"Anna's chromodoris nudibranch.jpg"};
function libIdx(f){try{return PS_PHOTO_DATA.findIndex(x=>x&&x.f===f&&x.d)}catch(e){return -1}}
function photos(){try{if(typeof PS_PHOTO_DATA==="undefined")return;if(libIdx(DINGO.f)<0)PS_PHOTO_DATA.push(Object.assign({},DINGO));
 window.PS_SQ_IMG=window.PS_SQ_IMG||{};for(const l in LAB_FILE){const i=libIdx(LAB_FILE[l]);if(i>=0)PS_SQ_IMG[l]=i}
 try{window.GF_PHCAP=window.GF_PHCAP||{};GF_PHCAP["Dingo: roams the north"]="A dingo"}catch(e){}}catch(e){}}
const ph=(at,label,extra)=>{const q=Object.assign({at:at,label:label,col:OR,icon:"photo"},extra||{});const f=LAB_FILE[label];if(f){const i=libIdx(f);if(i>=0){q.img=i;q._f=f}}return q};

/* ---------------- stops ---------------- */
/* Zealandia, after Mortimer et al. 2017 (GSA Today 27:3) and GNS Science's map: the 1,500-2,500 m isobath around the
   Lord Howe Rise, New Caledonia and the Norfolk Ridge, New Zealand, the Challenger and Campbell plateaus and the
   Chatham Rise. About 4.9 million km². */
const ZEALANDIA=[[154.7,-24.5],[156.4,-21.0],[159.4,-19.3],[162.4,-18.0],[164.2,-19.0],[166.6,-21.6],[167.6,-24.0],[168.6,-27.0],[169.4,-29.5],[171.0,-31.5],[173.0,-33.5],[174.6,-35.2],[176.0,-36.6],[178.0,-37.0],[178.9,-37.7],[178.7,-39.4],[177.6,-41.0],[178.8,-42.3],[-178.5,-42.8],[-176.0,-43.3],[-175.3,-44.0],[-176.2,-44.9],[-179.0,-45.0],[179.5,-46.3],[179.0,-47.8],[178.3,-49.3],[176.6,-51.0],[175.0,-53.2],[172.6,-55.0],[169.8,-56.2],[167.0,-55.6],[165.6,-53.2],[165.2,-51.0],[166.0,-49.0],[165.2,-47.4],[165.8,-46.0],[166.9,-44.6],[167.2,-43.0],[165.6,-41.6],[164.5,-40.0],[163.6,-38.4],[161.6,-37.0],[159.3,-35.4],[157.2,-33.0],[156.1,-30.4],[154.9,-27.6],[154.7,-24.5]];
const KI_RING=70;/* km: the true-size ring drawn round each Kiribati atoll group */
const CARIB={
 G:[{t:"Greater Antilles",c:"#0c8599",codes:["cu","ht","do","jm","pr","ky"]},
    {t:"Lesser Antilles",c:"#e67700",codes:["vi","vg","ai","mf","sx","bl","saba","statia","kn","ag","ms","gp","dm","mq","lc","vc","bb","gd","tt","aw","cw","bonaire"]},
    {t:"Lucayan Islands",c:"#7048e8",codes:["bs","tc"]}],
 groups:[["Greater Antilles","Cuba, Hispaniola (Haiti and the Dominican Republic), Jamaica, Puerto Rico, the Cayman Islands"],["Lesser Antilles","the small islands from the Virgin Islands south to Trinidad, then west to Aruba"],["Lucayan Islands","the Bahamas, Turks and Caicos"]],
 stat:"The West Indies are three island groups: the Greater Antilles, the Lesser Antilles and the Lucayan Islands",
 body:"The Antilles make a ring of islands round the Caribbean Sea. It starts with the big islands in the north, the Greater Antilles: Cuba, Hispaniola (Haiti and the Dominican Republic), Jamaica and Puerto Rico. The arc then curves east and south through the small islands of the Lesser Antilles to Trinidad, and runs west along the coast of Venezuela through Margarita (part of Venezuela), Bonaire, Curaçao and Aruba. To the north, in the Atlantic, lie the Lucayan Islands: the Bahamas and the Turks and Caicos."
};
function patchStops(){
 photos();
 /* North America: The Caribbean */
 {const S=stepOf("namerica","The Caribbean");if(S){const c=CARIB;
  if(S._tfG!==c.G){lock(S,"G",c.G);def(S,"_tfG",c.G)}
  lock(S,"hi",[...new Set(c.G.flatMap(g=>g.codes))]);lock(S,"hiSoft",[]);def(S,"legend",null);def(S,"_grpA",[]);def(S,"_grpB",[]);def(S,"_hsMerged",1);
  lock(S,"groups",c.groups);lock(S,"stat",c.stat);lock(S,"body",c.body);
  /* the legend names the groups, so no group labels sit on the islands; Columbus's landfall (San Salvador) is ringed and
     named by one label out at sea (its old photo pin had no picture of its own) */
  const col=[{at:[[-74.5,24.05]],text:"Columbus landed, 1492",ringKm:60}];
  def(S,"_al",1);def(S,"_pins0",col.slice());def(S,"_restored",[]);if(!S._tfPins)def(S,"_tfPins",col.slice());lock(S,"pins",S._tfPins);lock(S,"iconPins",[]);
  lock(S,"lines",[{circle:[-74.5,24.05],km:60,kind:"outline"}]);lock(S,"phPins",[]);lock(S,"globe",[-69,17.5,2.45])}}
 /* Oceania intro: the Sydney Opera House photo at Sydney, not the middle of Australia */
 {const S=stepOf("oceania","Oceania");if(S&&Array.isArray(S.phPins))S.phPins.forEach(q=>{if(q&&/Sydney Opera House/.test(q.label||"")&&Math.abs(q.at[0]-151.21)>1){q.at=[151.21,-33.86]}})}
 /* Only in Australia: no Wallace Line diagram (the card shows its photo); a dingo photo instead of the text pin */
 {const S=stepOf("oceania","Only in Australia");if(S){try{if(typeof PS_DIAG!=="undefined")delete PS_DIAG["oceania|Only in Australia"]}catch(e){}
  const drop=p=>String(Array.isArray(p)?p[1]:p&&p.text||"").indexOf("Dingoes roam")<0;
  const base=(S._tfBase||(S._pins0||S.pins||[]).filter(drop));def(S,"_tfBase",base);def(S,"_pins0",base.slice());def(S,"_restored",(S._restored||[]).filter(drop));
  if(!S._tfPins)def(S,"_tfPins",base.slice());lock(S,"pins",S._tfPins);
  if(!S._tfPh)def(S,"_tfPh",[ph([152.4,-30.6],"Platypus: a mammal that lays eggs"),ph([141.6,-31.9],"Wild camels"),ph([128,-18.5],"Dingo: roams the north")]);
  lock(S,"phPins",S._tfPh)}}
 /* The Great Barrier Reef: reef animals out at sea along the reef; Heart Reef is the card photo already, so it is not pinned again */
 {const S=stepOf("oceania","The Great Barrier Reef");if(S){
  const base=[[[145.77,-16.92],"Cairns","point"],[[[150.6,-17.8],[151.6,-19.6]],"About 2,300 km of reefs","area"]];
  def(S,"_al",1);def(S,"_pins0",base.slice());def(S,"_restored",[]);if(!S._tfPins)def(S,"_tfPins",base.slice());lock(S,"pins",S._tfPins);lock(S,"iconPins",[]);
  /* Italy starts inland, clear of the card on the flat map and of the reef's photos */
  (S.ghosts||[]).forEach(G=>{if(G&&G.code==="it"&&!G._tfAt){G.at=[145.2,-22.8];G._tfAt=1}});
  const H={_tfDir:"here",off:[0,0]};
  if(!S._tfPh)def(S,"_tfPh",[ph([146.5,-16.3],"Flynn Reef"),ph([146.6,-11.6],"Nudibranch",H),ph([148.9,-14.4],"Clownfish",H),ph([153.0,-17.0],"Manta ray",H),ph([153.9,-21.6],"Green turtle",H)]);
  lock(S,"phPins",S._tfPh)}}
 /* New Zealand: Zealandia drawn, framed whole */
 {const S=stepOf("oceania","New Zealand");if(S){
  const base=[[[174.76,-36.85],"Auckland","point"],[[[160.6,-30.2],[161.2,-33.5],[170.5,-52.5]],"Zealandia, mostly under the sea","area"]];
  def(S,"_al",1);def(S,"_pins0",base.slice());def(S,"_restored",[]);if(!S._tfPins)def(S,"_tfPins",base.slice());lock(S,"pins",S._tfPins);
  lock(S,"lines",[{poly:ZEALANDIA,kind:"outline"}]);lock(S,"view",[146,-59,194,-15]);lock(S,"globe",[170,-37,1.75]);def(S,"card","left")}}
 /* Big ocean states: Kiribati's own islands lit and ringed; the Tarawa photo sits west of its ring */
 {const S=stepOf("oceania","Big ocean states");if(S){def(S,"_tfKi",1);
  const P=S.phPins||[];const q=P.find(x=>x&&/Tarawa/.test(x.label||""));if(q){def(q,"ringKm",KI_RING);def(q,"_tfDir",195)}}}
}

/* ---------------- drawing: group outlines, Kiribati ---------------- */
function gCol(G){return String(G.c||"").replace("|pale","")}
function kiParts(feats){const out=[];feats.forEach(f=>{if(codeOf(f)!=="ki"||!f.geometry)return;const P=f.geometry.type==="Polygon"?[f.geometry.coordinates]:f.geometry.type==="MultiPolygon"?f.geometry.coordinates:[];P.forEach(p=>out.push(d3.geoCentroid({type:"Polygon",coordinates:p})))});
 /* atolls closer than a ring's width share one ring */
 const cl=[];out.forEach(c=>{const k=cl.find(g=>d3.geoDistance(g.c,c)*6371<KI_RING*1.1);if(k){k.n++;k.c=[(k.c[0]*(k.n-1)+c[0])/k.n,(k.c[1]*(k.n-1)+c[1])/k.n]}else cl.push({c:c.slice(),n:1})});return cl.map(g=>g.c)}
let kiCache=null;
function kiRings(feats){if(kiCache&&kiCache.f===feats)return kiCache.r;const r=kiParts(feats).map(c=>d3.geoCircle().center(c).radius(KI_RING/6371*180/Math.PI).precision(6)());kiCache={f:feats,r:r};return r}
function globeExtra(ctx,p,gv){if(!live()||ps.mode!=="globe"||ps.g!==gv)return;const S=cur();if(!S)return;const path=d3.geoPath(p,ctx);
 if(S.G&&S.G.length){ctx.save();ctx.setLineDash([]);ctx.lineJoin="round";const dk=isDark();
  S.G.forEach(G=>{ctx.beginPath();let any=false;gv.features.forEach(f=>{if(G.codes.includes(codeOf(f))){path(f);any=true}});if(!any)return;ctx.strokeStyle=gCol(G);ctx.lineWidth=dk?1.5:1.8;ctx.stroke()});ctx.restore()}
 if(S._tfKi){ctx.save();ctx.setLineDash([]);const ki=gv.features.filter(f=>codeOf(f)==="ki");
  kiRings(gv.features).forEach(o=>{ctx.beginPath();path(o);ctx.fillStyle="rgba(255,196,0,0.22)";ctx.fill();ctx.strokeStyle="rgba(255,255,255,0.95)";ctx.lineWidth=3.2;ctx.stroke();ctx.strokeStyle="#e67700";ctx.lineWidth=1.6;ctx.stroke()});
  ctx.beginPath();ki.forEach(f=>path(f));ctx.fillStyle="#ffb000";ctx.fill();ctx.strokeStyle="#fff";ctx.lineWidth=1.4;ctx.stroke();ctx.restore()}}
function flatExtra(){try{if(!live()||ps.mode!=="flat"||!ps.wrap)return;const S=cur(),svg=ps.wrap.querySelector("svg"),g=svg&&svg.querySelector("#psLayer");if(!S||!g)return;
 if(S.G){/* each grouped country gets an outline in its group's colour */
  const byCode={};S.G.forEach(G=>G.codes.forEach(c=>{byCode[c]=gCol(G)}));let html="";
  svg.querySelectorAll("path[id]").forEach(el=>{if(el.closest("#psLayer")||el.closest("defs")||el.classList.contains("tiny-hit-overlay")||el.classList.contains("hover-outline"))return;let c=null;try{c=psCodeOf(el)}catch(e){}if(c&&byCode[c])html+='<path class="ps-tf-gline" d="'+el.getAttribute("d")+'" style="fill:none;stroke:'+byCode[c]+';stroke-width:1.6px;vector-effect:non-scaling-stroke;pointer-events:none"/>'});
  g.insertAdjacentHTML("beforeend",html)}
 if(S._tfKi){const path=psPath();let html="";const feats=projFeatures();kiRings(feats).forEach(o=>{const d=path(o);if(d)html+='<path d="'+d+'" style="fill:rgba(255,196,0,0.22);stroke:#e67700;stroke-width:1.6px;vector-effect:non-scaling-stroke;pointer-events:none"/>'});
  feats.forEach(f=>{if(codeOf(f)==="ki"){const d=path(f);if(d)html+='<path d="'+d+'" style="fill:#ffb000;stroke:#fff;stroke-width:1.2px;vector-effect:non-scaling-stroke;pointer-events:none"/>'}});g.insertAdjacentHTML("beforeend",html)}}catch(e){console.error("tourfix flat",e)}}

/* ---------------- photo pins told which way to sit (_tfDir, screen degrees: 0 right, 90 down) ---------------- */
function kmPx(at,km){const a=psScreen(at),b=psScreen([at[0]+km/(111.32*Math.cos(at[1]*Math.PI/180)),at[1]]);return a&&b?Math.hypot(b[0]-a[0],b[1]-a[1]):0}
function placeDirPins(){try{if(!live())return;const S=cur(),P=S&&S.phPins||[];if(!P.some(q=>q&&q._tfDir!=null))return;const box=psContainer(),L=box&&box.querySelector(".ps-phpins");if(!L||L._for!==S)return;
 const svg=L.querySelector("svg.ps-sq-lead"),els=[...L.querySelectorAll(".ps-sq")],W=box.clientWidth,H=box.clientHeight,br=box.getBoundingClientRect();
 const cr=ps.card&&ps.card.offsetParent?ps.card.getBoundingClientRect():null,card=cr?{l:cr.left-br.left-8,r:cr.right-br.left+8,t:cr.top-br.top-8,b:cr.bottom-br.top+8}:null;
 els.forEach((el,k)=>{const q=P[k];if(!q||q._tfDir==null||el.style.display==="none")return;if(L._user&&L._user[k])return;const a=psScreen(q.at);if(!a)return;
  if(q._tfDir==="here"){/* a photo that stands for the sea round it: it sits right there, no line, no dot */
   const w=el.offsetWidth||56,h=el.offsetHeight||72,x=Math.max(w/2+4,Math.min(W-w/2-4,a[0])),y=Math.max(h/2+4,Math.min(H-h/2-4,a[1]));
   if(card&&x+w/2>card.l&&x-w/2<card.r&&y+h/2>card.t&&y-h/2<card.b)return;el.style.left=x+"px";el.style.top=y+"px";if(Array.isArray(L._off))L._off[k]=[x-a[0],y-a[1]];
   if(svg){svg.querySelectorAll("circle").forEach(c=>{if(Math.hypot(+c.getAttribute("cx")-a[0],+c.getAttribute("cy")-a[1])<3)c.remove()});svg.querySelectorAll("line").forEach(l=>{if(Math.hypot(+l.getAttribute("x1")-a[0],+l.getAttribute("y1")-a[1])<3)l.remove()})}return}
  const R=q.ringKm?kmPx(q.at,q.ringKm):4,w=el.offsetWidth||56,h=el.offsetHeight||72;
  const at=deg=>{const t=deg*Math.PI/180,ux=Math.cos(t),uy=Math.sin(t),half=Math.min(Math.abs(w/2/(ux||1e-9)),Math.abs(h/2/(uy||1e-9)));const d=R+30+half;let x=a[0]+ux*d,y=a[1]+uy*d;x=Math.max(w/2+4,Math.min(W-w/2-4,x));y=Math.max(h/2+4,Math.min(H-h/2-4,y));return[x,y]};
  const bad=([x,y])=>card&&x+w/2>card.l&&x-w/2<card.r&&y+h/2>card.t&&y-h/2<card.b;
  let pos=null;for(const dd of [0,25,-25,50,-50,90,-90,180]){const c=at(q._tfDir+dd);if(!bad(c)){pos=c;break}}if(!pos)return;
  el.style.left=pos[0]+"px";el.style.top=pos[1]+"px";if(Array.isArray(L._off))L._off[k]=[pos[0]-a[0],pos[1]-a[1]];
  if(svg){svg.querySelectorAll("circle").forEach(c=>{if(Math.hypot(+c.getAttribute("cx")-a[0],+c.getAttribute("cy")-a[1])<R+3)c.remove()});
   svg.querySelectorAll("line").forEach(l=>{const x1=+l.getAttribute("x1"),y1=+l.getAttribute("y1");if(Math.hypot(x1-a[0],y1-a[1])<R+12)l.remove()});
   const dx=pos[0]-a[0],dy=pos[1]-a[1],d=Math.hypot(dx,dy)||1,ux=dx/d,uy=dy/d,half=Math.min(Math.abs(w/2/(ux||1e-9)),Math.abs(h/2/(uy||1e-9)));
   if(d-half>R+4)svg.insertAdjacentHTML("beforeend",`<line x1="${(a[0]+ux*(R+1)).toFixed(1)}" y1="${(a[1]+uy*(R+1)).toFixed(1)}" x2="${(pos[0]-ux*half).toFixed(1)}" y2="${(pos[1]-uy*half).toFixed(1)}"/>`)}})}catch(e){console.error("tourfix pins",e)}}

/* ---------------- drag ---------------- */
const geoDist0=d3.geoDistance;/* the flat map patches d3.geoDistance; the real one is still needed for the ball */
const normLon=x=>((x+540)%360)-180;
function scr2ll(cx,cy){try{if(ps.mode==="globe"&&ps.g){const g=ps.g,r=g.canvas.getBoundingClientRect(),pr=g.projection(),x=cx-r.left,y=cy-r.top,ll=pr.invert([x,y]);if(!ll||!isFinite(ll[0])||!isFinite(ll[1]))return null;
   if(!g._flat){const q=pr(ll);if(!q||Math.hypot(q[0]-x,q[1]-y)>2)return null;if(geoDist0(ll,[-g.rot[0],-g.rot[1]])>Math.PI/2)return null}return ll}
  const svg=ps.wrap&&ps.wrap.querySelector("svg");if(!svg)return null;const m=svg.getScreenCTM().inverse(),p=[m.a*cx+m.c*cy+m.e,m.b*cx+m.d*cy+m.f],ll=ps.P.inv(p);return ll&&isFinite(ll[0])?ll:null}catch(e){return null}}
const dragOK=S=>S&&S.drag&&!(S.drag.only&&S.drag.only!==ps.mode);
function shapeAt(cx,cy){const S=cur();if(!S)return null;const ll=scr2ll(cx,cy);if(!ll)return null;
 const Gs=S.ghosts||[];for(let k=Gs.length-1;k>=0;k--){let o=null;try{o=psGhostGeom(Gs[k])}catch(e){}if(o&&d3.geoContains(o,ll))return{kind:"ghost",G:Gs[k]}}
 if(dragOK(S)&&S.drag.kind!=="water"){let o=null;try{o=psDragGeom(S)}catch(e){}if(o&&d3.geoContains(o,ll))return{kind:"drag"}}return null}
function tagTarget(el){const S=cur();if(!S||!el)return null;if(el.classList.contains("ps-ghosttag")){const r=el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,box=psContainer().getBoundingClientRect();let best=null,bd=1e9;
  (S.ghosts||[]).forEach(G=>{const a=psScreen(psGhostAt(G));if(!a)return;const d=Math.hypot(box.left+a[0]-cx,box.top+a[1]-cy);if(d<bd){bd=d;best=G}});return best?{kind:"ghost",G:best}:null}
 if(!dragOK(S))return null;if(S.drag.kind==="water")return{kind:el.classList.contains("ps-dragtag2")?"water2":"drag"};return{kind:"drag"}}
function atOf(h){const S=cur();if(h.kind==="ghost")return psGhostAt(h.G);if(h.kind==="water2"){try{return psWaterAt(S).B}catch(e){return ps.dragAt2}}return ps.dragAt||S.drag.at}
function setAt(h,v){const S=cur();if(h.kind==="ghost"){psGhostSet(h.G,v);return}ps._dragOwner=S;if(h.kind==="water2")ps.dragAt2=v;else ps.dragAt=v}
/* on the globe and the flat canvas the engine's own scheduled redraw is used (it draws coarser while things move) */
let rq=0;function redraw(h){if(live()&&ps.mode==="globe"&&ps.g){try{ps.g.request()}catch(e){}}if(rq)return;rq=requestAnimationFrame(()=>{rq=0;try{if(!live())return;if(ps.mode==="globe")psPlaceDragTag();else if(h.kind==="ghost")psGhostRedraw();else psDragRedraw()}catch(e){console.error(e)}})}
let dragging=null,justDragged=0;
function onMap(t){try{if(!t||!t.closest)return false;if(t.closest(".ps-card,.ps-pp,button,a,input,select,textarea,.globe-btns,.gfk-panel,.gfk-tray"))return false;const host=ps.mode==="globe"?ps.g&&ps.g.host:ps.wrap;return !!host&&host.contains(t)}catch(e){return false}}
function down(e){try{if(!live()||dragging)return;if(e.button!=null&&e.button!==0)return;const t=e.target,tag=t&&t.closest&&t.closest(".ps-dragtag");let h=null;
  if(tag)h=tagTarget(tag);else if(ps.mode==="globe"&&onMap(t))h=shapeAt(e.clientX,e.clientY);if(!h)return;
  e.stopImmediatePropagation();e.preventDefault();const at0=atOf(h).slice(),ll0=scr2ll(e.clientX,e.clientY);
  dragging={h:h,at0:at0,ll0:ll0,x0:e.clientX,y0:e.clientY,id:e.pointerId,moved:false};try{(tag||t).setPointerCapture(e.pointerId)}catch(_){}
  document.documentElement.classList.add("gf-tf-dragging");if(tag)tag.classList.add("dragging")}catch(err){console.error("tourfix drag",err)}}
function move(e){if(!dragging){hover(e);return}if(e.pointerId!==dragging.id)return;e.stopImmediatePropagation();e.preventDefault();const D=dragging;
 if(Math.abs(e.clientX-D.x0)+Math.abs(e.clientY-D.y0)>2)D.moved=true;let ll=scr2ll(e.clientX,e.clientY);
 if(!D.ll0){/* the grab started off the map (a tag past the edge of the ball): start from here */if(ll){D.ll0=ll}return}
 if(!ll)return;const v=[normLon(D.at0[0]+normLon(ll[0]-D.ll0[0])),Math.max(-84,Math.min(84,D.at0[1]+ll[1]-D.ll0[1]))];setAt(D.h,v);redraw(D.h)}
function up(e){if(!dragging||(e.pointerId!=null&&e.pointerId!==dragging.id))return;e.stopImmediatePropagation();if(dragging.moved)justDragged=performance.now();dragging=null;document.documentElement.classList.remove("gf-tf-dragging");
 document.querySelectorAll(".ps-dragtag.dragging").forEach(t=>t.classList.remove("dragging"));try{if(live()){if(ps.mode==="globe"){ps.g.request();setTimeout(()=>{try{if(live()&&ps.g){ps.g.request();psPlaceDragTag()}}catch(_){}},260)}psPlaceDragTag()}}catch(_){}}
let hvT=0;function hover(e){if(!live()||ps.mode!=="globe"||e.pointerType&&e.pointerType!=="mouse")return;const now=performance.now();if(now-hvT<40)return;hvT=now;const host=ps.g&&ps.g.host;if(!host)return;
 const S=cur(),any=S&&((S.ghosts&&S.ghosts.length)||dragOK(S));const on=!!(any&&onMap(e.target)&&shapeAt(e.clientX,e.clientY));host.classList.toggle("gf-tf-grab",on)}
function swallow(e){if(!live()||dragging)return;const t=e.target,tag=t&&t.closest&&t.closest(".ps-dragtag");const pt=e.touches?e.touches[0]:e;if(!pt)return;
 if(tag||(ps.mode==="globe"&&onMap(t)&&shapeAt(pt.clientX,pt.clientY)))e.stopImmediatePropagation()}
function wireDrag(){if(window._gfTfDrag)return;window._gfTfDrag=1;
 window.addEventListener("pointerdown",down,{capture:true});window.addEventListener("pointermove",move,{capture:true});
 window.addEventListener("pointerup",up,{capture:true});window.addEventListener("pointercancel",up,{capture:true});
 ["mousedown","touchstart"].forEach(t=>window.addEventListener(t,swallow,{capture:true,passive:true}));
 window.addEventListener("click",e=>{if(performance.now()-justDragged<400){e.stopImmediatePropagation();e.preventDefault()}},{capture:true});
 const st=document.createElement("style");st.id="gf-tourfix-drag-css";st.textContent=
  ".ps-dragtag{pointer-events:auto !important;cursor:grab !important;user-select:none;-webkit-user-select:none;touch-action:none}"+
  ".ps-dragtag.dragging,.gf-tf-dragging,.gf-tf-dragging *{cursor:grabbing !important}"+
  ".gf-tf-grab canvas,.gf-tf-grab{cursor:grab !important}";document.head.appendChild(st)}

/* ---------------- install ---------------- */
function install(){
 if(typeof psGlobeDraw==="function"&&!psGlobeDraw._tfd){const _g=psGlobeDraw;psGlobeDraw=function(ctx,p,gv){const r=_g.apply(this,arguments);try{globeExtra(ctx,p,gv)}catch(e){console.error("tourfix globe",e)}return r};psGlobeDraw._tfd=1}
 if(typeof psDrawFlat==="function"&&!psDrawFlat._tfd){const _f=psDrawFlat;psDrawFlat=function(){const r=_f.apply(this,arguments);flatExtra();return r};psDrawFlat._tfd=1}
 if(typeof psPhPinsSync==="function"&&!psPhPinsSync._tfd){const _s=psPhPinsSync;psPhPinsSync=function(){const r=_s.apply(this,arguments);placeDirPins();return r};psPhPinsSync._tfd=1;
  /* keep the other files' marks so they don't wrap again round this one */for(const k of ["_gfRing","_dclSpace","_rvpp"])if(_s[k])psPhPinsSync[k]=_s[k]}
 if(typeof psGo==="function"&&!psGo._tfd){const _p=psGo;psGo=function(){try{patchStops()}catch(e){console.error("tourfix stops",e)}const r=_p.apply(this,arguments);
  /* some fields (the ghosts) are only made while the stop opens: patch again, then redraw */
  try{patchStops();if(live()){if(ps.mode==="globe"&&ps.g&&ps.g.request)ps.g.request();else if(typeof psGhostRedraw==="function")psGhostRedraw();psPlaceDragTag()}}catch(e){console.error("tourfix stops",e)}return r};psGo._tfd=1}
 wireDrag();
 try{patchStops()}catch(e){console.error("tourfix stops",e)}
 try{for(const t of ["namerica","oceania"]){const T=PS_TOURS[t];if(T&&Array.isArray(T.steps))def(T.steps,"_gfTourfixDrag",1)}}catch(e){}
 try{if(live()){if(ps.mode==="globe"&&ps.g)ps.g.request&&ps.g.request();}}catch(e){}}
const start=()=>{[1500,3000,6500,13500].forEach(t=>setTimeout(()=>{try{install()}catch(e){console.error("tourfix",e)}},t))};
if(document.readyState==="complete")start();else window.addEventListener("load",start);
})();
