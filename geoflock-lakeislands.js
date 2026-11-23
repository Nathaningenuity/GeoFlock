/* GeoFlock: islands in lakes. Hovering an island in a lake (Ometepe, Olkhon, Bled Island…) names the island and its
   country ("Ometepe — Nicaragua"), highlights the island and the country it belongs to, and leaves the lake alone.
   - Big islands are the holes already in the lake shapes (the lake data has them as inner rings): the hole is the island.
     Samosir is joined to Lake Toba's shore at this resolution, so its outline is the part of Toba's ring that runs round it.
   - Small islands are not in the lake shapes: each has a centre point and is hovered within about 1.5 km of it (or 3 px). Where the lake
     is painted over one, a small dot of land marks it once the map is zoomed in far enough (not on the satellite picture),
     and it is highlighted while hovered.
   - An outlined island is hovered only while the mouse is on its own outline: no boost or margin, so the lake water round it is the lake's.
   - Islands are hoverable while the lakes are shown; with the lakes off only on a picture map (relief, satellite…) and
     only islands big enough on screen to be seen on their own.
   Works on the Maps page's flat map and globe (both are amGlobe), in light and dark themes. The islands are in search too. */
(function(){
if(typeof GlobeView==="undefined"||typeof d3==="undefined")return;
/* [name, country, lake, lon, lat, kind ("s": hole in the lake shape, "p": point), other names, note after the country] */
const ISLES=[
 ["Manitoulin Island","ca","Lake Huron",-82.26,45.8,"s",["Manitoulin","Mnidoo Mnis"]],
 ["René-Levasseur Island","ca","Réservoir Manicouagan",-68.72,51.4,"s",["Rene-Levasseur Island","Rene-Levasseur","Île René-Levasseur","Ile Rene-Levasseur","Rene Levasseur"]],
 ["Olkhon","ru","Lake Baikal",107.38,53.17,"s",["Olkhon Island","Ostrov Olkhon"]],
 ["Samosir","id","Lake Toba",98.82,2.58,"s",["Samosir Island","Pulau Samosir"]],
 ["Isle Royale","us","Lake Superior",-88.89,48.0,"s",["Isle Royale National Park"]],
 ["Ukerewe","tz","Lake Victoria",33.01,-2.04,"s",["Ukerewe Island"]],
 ["Ometepe","ni","Lago de Nicaragua",-85.58,11.5,"s",["Isla de Ometepe","Ometepe Island"]],
 ["Zapatera","ni","Lago de Nicaragua",-85.83,11.74,"s",["Isla Zapatera","Zapatera Island"]],
 ["Valaam","ru","Lake Ladoga",30.95,61.385,"s",["Valaam Island","Valamo","Balaam"]],
 ["Mantsinsaari","ru","Lake Ladoga",31.59,61.35,"s",["Mantsinsaari Island"]],
 ["Bolshoy Klimenetsky Island","ru","Lake Onega",35.26,61.97,"s",["Klimenetsky Island","Bolshoi Klimenetsky","Big Klimenetsky Island"]],
 ["Sääminginsalo","fi","Lake Saimaa",29.09,61.97,"s",["Saaminginsalo"]],
 ["Likoma Island","mw","Lake Malawi",34.73,-12.06,"s",["Likoma"],"surrounded by Mozambican waters"],
 ["Idjwi","cd","Lake Kivu",29.06,-2.11,"s",["Idjwi Island","Ijwi"]],
 ["Bugala (Ssese Islands)","ug","Lake Victoria",32.255,-0.44,"s",["Ssese Islands","Sese Islands","Bugala Island","Bugala"]],
 ["Buvuma Island","ug","Lake Victoria",33.29,0.22,"s",["Buvuma"]],
 ["Rubondo Island","tz","Lake Victoria",31.85,-2.33,"s",["Rubondo"]],
 ["Wolfe Island","ca","Lake Ontario",-76.43,44.17,"s",[]],
 ["Amherst Island","ca","Lake Ontario",-76.72,44.16,"s",[]],
 ["Pelee Island","ca","Lake Erie",-82.66,41.78,"s",["Pelee"]],
 ["Kelleys Island","us","Lake Erie",-82.705,41.605,"s",["Kelley's Island","Kelleys"]],
 ["South Bass Island","us","Lake Erie",-82.83,41.65,"p",["Put-in-Bay","South Bass"]],
 ["Beaver Island","us","Lake Michigan",-85.55,45.67,"s",[]],
 ["St. Joseph Island","ca","Lake Huron",-83.94,46.21,"s",["Saint Joseph Island","St Joseph Island"]],
 ["Drummond Island","us","Lake Huron",-83.66,46.01,"s",[]],
 ["St. Ignace Island","ca","Lake Superior",-87.94,48.8,"s",["Saint Ignace Island","St Ignace Island"]],
 ["Michipicoten Island","ca","Lake Superior",-85.78,47.76,"s",[]],
 ["Madeline Island","us","Lake Superior",-90.7,46.82,"s",[]],
 ["Antelope Island","us","Great Salt Lake",-112.21,40.98,"s",[]],
 ["Hecla Island","ca","Lake Winnipeg",-96.72,51.1,"s",[]],
 ["Mackinac Island","us","Lake Huron",-84.625,45.856,"p",["Mackinac"]],
 ["Bled Island","si","Lake Bled",14.0905,46.3624,"p",["Blejski otok","Lake Bled Island"]],
 ["Isola Bella (Borromean Islands)","it","Lake Maggiore",8.5266,45.8964,"p",["Isola Bella","Borromean Islands","Isole Borromee"]],
 ["Isola Madre","it","Lake Maggiore",8.5385,45.9125,"p",[]],
 ["Reichenau","de","Lake Constance",9.0625,47.6965,"p",["Reichenau Island","Insel Reichenau"]],
 ["Mainau","de","Lake Constance",9.1955,47.705,"p",["Mainau Island","Insel Mainau","Flower Island"]],
 ["Herrenchiemsee","de","Chiemsee",12.398,47.862,"p",["Herreninsel","Herren Island"]],
 ["Frauenchiemsee","de","Chiemsee",12.4229,47.8737,"p",["Fraueninsel","Frauen Island"]],
 ["Ufenau","ch","Lake Zurich",8.7817,47.2181,"p",["Ufnau","Ufenau Island"]],
 ["Kizhi","ru","Lake Onega",35.224,62.067,"p",["Kizhi Island","Kizhi Pogost"]],
 ["Isla del Sol","bo","Lago Titicaca",-69.17,-16.02,"p",["Island of the Sun"]],
 ["Isla de la Luna","bo","Lago Titicaca",-69.071,-16.04,"p",["Island of the Moon","Koati"]],
 ["Taquile","pe","Lago Titicaca",-69.69,-15.77,"p",["Taquile Island","Isla Taquile"]],
 ["Amantaní","pe","Lago Titicaca",-69.72,-15.66,"p",["Amantani","Amantani Island","Isla Amantaní"]],
 ["Uros floating islands","pe","Lago Titicaca",-69.97,-15.82,"p",["Uros","Uros Islands","Islas flotantes de los Uros","Floating islands"]],
 ["Chizumulu Island","mw","Lake Malawi",34.62,-12.02,"p",["Chizumulu"],"surrounded by Mozambican waters"],
 ["Dek Island","et","Lake Tana",37.267,11.917,"p",["Dek","Lake Tana islands"]],
 ["Daga Island","et","Lake Tana",37.30,11.883,"p",["Daga","Lake Tana islands"]],
 ["Akdamar","tr","Lake Van",43.0365,38.3412,"p",["Akdamar Island","Aghtamar","Akhtamar"]],
 ["Lesser Yingzhou","cn","West Lake",120.144,30.243,"p",["Xiaoyingzhou","Xiao Yingzhou","Little Yingzhou","Three Pools Mirroring the Moon"]]
].map(r=>({n:r[0],cc:r[1],lake:r[2],ll:[r[3],r[4]],kind:r[5],alt:r[6]||[],note:r[7]||""}));
/* Samosir: the stretch of Lake Toba's own ring that runs round the island, closed across the isthmus at Pangururan */
const SAMOSIR=[[98.69,2.608],[98.74,2.531],[98.858,2.441],[98.899,2.428],[98.978,2.463],[98.978,2.48],[98.845,2.678],[98.796,2.73],[98.732,2.755],[98.701,2.744],[98.679,2.709],[98.676,2.627],[98.69,2.608]];
const HOVER_PX=9,PT_MIN_PXDEG=20,BIG_ALONE_PX=8;
/* hovering an island: on the island itself only, with no extra margin or pixel boost round it */
const TINY_PX=3,SMALL_KM=6,PT_KM=1.5,R_KM=6371;
const dark=()=>document.body.classList.contains("sky-night");
const smallPoly=r=>{const g={type:"Polygon",coordinates:[r.slice()]};if(d3.geoArea(g)>2*Math.PI)g.coordinates=[r.slice().reverse()];return g};
/* the island shapes, from the lake holes (built once, after the overlays exist) */
let READY=false;
function prep(){if(READY)return;let O;try{O=globeOverlays()}catch(e){return}if(!O||!O.lakes)return;READY=true;
 const inLake=(L,ll)=>{try{return!!L&&d3.geoContains(L,ll)}catch(e){return false}};
 ISLES.forEach(I=>{const L=O.lakes.find(x=>x.n===I.lake);I.L=L||null;
  /* a small island the lake shape paints over (it has no hole of its own) gets a dot of land */
  if(I.kind!=="s"){I.dot=inLake(L,I.ll);return}let poly=null;
  if(I.n==="Samosir")poly=smallPoly(SAMOSIR);
  else if(L){const polys=L.type==="MultiPolygon"?L.coordinates:[L.coordinates];
   for(const P of polys){for(let k=1;k<P.length;k++){const g=smallPoly(P[k]);if(d3.geoContains(g,I.ll)){poly=g;break}}if(poly)break}}
  if(poly){I.g=poly;I.c=d3.geoCentroid(poly);I.km2=d3.geoArea(poly)*6371*6371;let r=0;poly.coordinates[0].forEach(p=>{r=Math.max(r,d3.geoDistance(p,I.c))});I.r=r}
  else{I.kind="p";I.dot=inLake(L,I.ll)}})}
const countryName=cc=>{try{if(typeof allMapsCountryName==="function"){const n=allMapsCountryName(cc);if(n)return n}}catch(e){}try{return COUNTRY_BY_CODE[cc].n}catch(e){}return cc.toUpperCase()};
const labelOf=I=>I.n+" — "+countryName(I.cc)+(I.note?" ("+I.note+")":"");
const onMaps=g=>{try{return typeof amGlobe!=="undefined"&&g===amGlobe&&appMode==="allmaps"&&!g.cfg.noHover&&!(typeof proj!=="undefined"&&proj.on)}catch(e){return false}};
const lakeShown=(ov,I)=>!!ov.lakes&&!(I.L&&I.L.minor&&!ov.minorLakes&&!window._gfMinorOn);
/* pixels per degree of longitude at a point (small islands are only marked once the map is zoomed in that far) */
const pxDeg=(p,ll)=>{const c=p(ll),q=p([ll[0]+.1,ll[1]]);return c&&q?Math.hypot(q[0]-c[0],q[1]-c[1])*10:0};
/* the island as the map draws it when zoomed in. Once the sharp map tiles are on show the island is only the land they draw
   with water all round it, near the island's place: a hole in one lake, or land between several lake pieces (a lake cut at
   tile edges, Great Salt Lake's arms), found on a grid of about a screen pixel. The rough outline is never used then: where
   the tiles draw no such island (Antelope Island is joined to the shore by Farmington Bay's mud flats in them), the island
   is not hovered and the land there is the country's. Zoomed out the rough outline is the island (the lake is drawn with it as a hole). */
const ISL_MAX=1100;
function ptIn(rs,x,y){let c=false;for(const r of rs)for(let i=0,j=r.length-3;i<r.length;j=i,i+=3){const yi=r[i+1],yj=r[j+1];if((yi>y)!==(yj>y)&&x<(r[j]-r[i])*(y-yi)/(yj-yi)+r[i])c=!c}return c}
function detIsle(g,I){if(I.kind!=="s"||!window.gfDetail||!gfDetail.waterIn)return null;const cl=Math.max(.2,Math.cos(I.c[1]*Math.PI/180)),pad=I.r*1.6*180/Math.PI;
 const x0=I.c[0]-pad/cl,x1=I.c[0]+pad/cl,y0=I.c[1]-pad,y1=I.c[1]+pad;const W=gfDetail.waterIn(g,[x0,y0,x1,y1]);if(!W)return null;
 const p=g.projection(),k=pxDeg(p,I.c);const ck=W.key+"|"+k.toFixed(1);if(I._dk===ck)return I._d;
 /* the grid: about one cell per screen pixel (at most ISL_MAX a side) */
 let gw=Math.max(48,Math.ceil((x1-x0)*k)),gh=Math.max(48,Math.ceil((y1-y0)*k/cl));const sc=Math.min(1,ISL_MAX/Math.max(gw,gh));gw=Math.ceil(gw*sc);gh=Math.ceil(gh*sc);
 const cv=document.createElement("canvas");cv.width=gw;cv.height=gh;const c=cv.getContext("2d",{willReadFrequently:true});
 c.setTransform(gw/(x1-x0),0,0,-gh/(y1-y0),-x0*gw/(x1-x0),y1*gh/(y1-y0));c.fillStyle="#000";
 W.list.forEach(rs=>{c.beginPath();rs.forEach(r=>{for(let i=0;i<r.length;i+=3)i?c.lineTo(r[i],r[i+1]):c.moveTo(r[i],r[i+1]);c.closePath()});c.fill("evenodd")});
 const px=c.getImageData(0,0,gw,gh).data,N=gw*gh,cdx=(x1-x0)/gw,cdy=(y1-y0)/gh,cellKm2=cdx*cl*cdy*111.2*111.2,Q=new Int32Array(N);
 /* the land cut off by water near the island's place. Which land is cut off is decided first on the land shrunk by a cell, so a
    neck a pixel wide (a causeway, a narrow channel drawn shut at this scale) does not join an island to the shore, the island
    being that core grown back by the cell, on land only; an island too small for that is taken as it is */
 const pick=erode=>{const lab=new Int32Array(N),land=new Uint8Array(N);/* lab: 0 land not yet seen, -1 water, -2 land reached from the box's edge, n>0 an enclosed piece */
  for(let i=0;i<N;i++){if(px[i*4+3]>=128)lab[i]=-1;else land[i]=1}
  if(erode)for(let y=0;y<gh;y++)for(let x=0;x<gw;x++){const i=y*gw+x;if(land[i]&&(x>0&&!land[i-1]||x<gw-1&&!land[i+1]||y>0&&!land[i-gw]||y<gh-1&&!land[i+gw]))lab[i]=-1}
  const flood=(seeds,v)=>{let h=0,t=0;seeds.forEach(i=>{if(lab[i]===0){lab[i]=v;Q[t++]=i}});let n=0,sx=0,sy=0;
   while(h<t){const i=Q[h++],x=i%gw,y=(i-x)/gw;n++;sx+=x;sy+=y;const nb=[x>0?i-1:-1,x<gw-1?i+1:-1,y>0?i-gw:-1,y<gh-1?i+gw:-1];for(const j of nb)if(j>=0&&lab[j]===0){lab[j]=v;Q[t++]=j}}return{n,sx,sy}};
  const edge=[];for(let x=0;x<gw;x++)edge.push(x,(gh-1)*gw+x);for(let y=0;y<gh;y++)edge.push(y*gw,y*gw+gw-1);flood(edge,-2);
  const near=new Set();let id=0,main=0,mn=0;for(let i=0;i<N;i++)if(lab[i]===0){const r=flood([i],++id),m=[x0+(r.sx/r.n+.5)*cdx,y1-(r.sy/r.n+.5)*cdy];if(d3.geoDistance(m,I.c)<=I.r*1.25){near.add(id);if(r.n>mn){mn=r.n;main=id}}}
  if(!main)return null;
  /* the island is the biggest such piece, with the pieces and islets just off it (within a few pixels, or 6% of its size); not
     other islands further out, nor islands in the lakes of the land round about */
  const keep=new Set([main]),K0=Math.max(3,Math.round(.06*I.r*180/Math.PI/cdy)),dist=new Int16Array(N).fill(-1);let h=0,t=0;
  for(let i=0;i<N;i++)if(lab[i]===main){dist[i]=0;Q[t++]=i}
  while(h<t){const i=Q[h++],x=i%gw,y=(i-x)/gw;if(lab[i]>0&&near.has(lab[i]))keep.add(lab[i]);if(dist[i]>=K0)continue;for(const j of [x>0?i-1:-1,x<gw-1?i+1:-1,y>0?i-gw:-1,y<gh-1?i+gw:-1])if(j>=0&&dist[j]<0){dist[j]=dist[i]+1;Q[t++]=j}}const sel=new Uint8Array(N);let a=0;const K=i=>lab[i]>0&&keep.has(lab[i]);
  for(let y=0;y<gh;y++)for(let x=0;x<gw;x++){const i=y*gw+x;if(!land[i])continue;if(K(i)||erode&&(x>0&&K(i-1)||x<gw-1&&K(i+1)||y>0&&K(i-gw)||y<gh-1&&K(i+gw))){sel[i]=1;a+=cellKm2}}
  return a>=.4*I.km2&&a<=2.5*I.km2?sel:null};
 const sel=pick(1)||pick(0);let D={ok:false};
 if(sel){
  /* the island grown by a cell (into the water round it), as runs along each row: drawn, then the exact water cut out of it */
  const runs=[];for(let y=0;y<gh;y++){let s0=-1;for(let x=0;x<=gw;x++){let on=0;if(x<gw)for(let b=-1;b<=1&&!on;b++)for(let e=-1;e<=1;e++){const xx=x+e,yy=y+b;if(xx>=0&&xx<gw&&yy>=0&&yy<gh&&sel[yy*gw+xx]){on=1;break}}
   if(on&&s0<0)s0=x;if(!on&&s0>=0){runs.push([x0+s0*cdx,y1-y*cdy,x0+x*cdx,y1-(y+1)*cdy]);s0=-1}}}
  D={ok:true,sel,gw,gh,x0,y1,cdx,cdy,runs,W:W.list}}
 I._dk=ck;I._d=D;return D}
/* is the point on the island as drawn? (null: the sharp tiles are not on show) */
function onDet(g,I,ll){const D=detIsle(g,I);if(!D)return null;if(!D.ok)return false;const x=Math.floor((ll[0]-D.x0)/D.cdx),y=Math.floor((D.y1-ll[1])/D.cdy);
 if(x<0||y<0||x>=D.gw||y>=D.gh)return false;for(const rs of D.W)if(ptIn(rs,ll[0],ll[1]))return false;/* in the water: the lake's */
 for(let b=-1;b<=1;b++)for(let e=-1;e<=1;e++){const xx=x+e,yy=y+b;if(xx>=0&&xx<D.gw&&yy>=0&&yy<D.gh&&D.sel[yy*D.gw+xx])return true}return false}
/* is this island shown, and where is the mouse on it? */
function find(g,ll,mx,my){prep();if(!READY)return null;const ov=g.cfg.overlays?g.cfg.overlays():{};const raster=!!(g.cfg.raster&&g.cfg.raster());
 const p=g.projection(),ctr=[-g.rot[0],-g.rot[1]];let best=null,bd=Infinity;
 for(const I of ISLES){if(!g._flat&&d3.geoDistance(I.ll,ctr)>Math.PI/2-.01)continue;
  const lakeOn=lakeShown(ov,I);const c=p(I.kind==="s"?I.c:I.ll);if(!c)continue;
  const d=Math.hypot(c[0]-mx,c[1]-my);
  if(I.kind==="s"){if(d3.geoDistance(I.c,ll)>I.r*1.6+.002)continue;/* (a quick test: its islets can lie a little beyond its rough outline) */
   /* size on screen: the island's radius in pixels */
   const e=p([I.c[0]+I.r*180/Math.PI/Math.max(.2,Math.cos(I.c[1]*Math.PI/180)),I.c[1]]),px=e?Math.abs(e[0]-c[0]):0;
   if(!lakeOn&&!(raster&&px*2>=BIG_ALONE_PX))continue;
   /* an island too small to see at this zoom is not hovered, unless the outlines (borders) layer draws its outline */
   {let ol=false;try{ol=typeof allMapsBordersOn!=="undefined"&&allMapsBordersOn!==false}catch(e){}if(!ol&&px*2<(sat()?10:6))continue}
   /* hovered only on the island itself, with no margin: the lake water round it is the lake's */
   {const od=onDet(g,I,ll);if(od===false||(od===null&&!d3.geoContains(I.g,ll)))continue}if(d<bd){bd=d;best=I}}
  else{/* islands known only as a point have no outline on the map: not hovered (and no dot is drawn for them) */continue;if(!lakeOn||(d3.geoDistance(I.ll,ll)*R_KM>PT_KM&&d>TINY_PX)||sat())continue;/* on the satellite picture these islands are not drawn: nothing to hover */if(pxDeg(p,I.ll)<PT_MIN_PXDEG)continue;if(d<bd){bd=d;best=I}}}
 return best}
/* small islands the lake is painted over show as a dot of land once the map is zoomed in far enough to see them
   (not on the satellite picture, which is left as it is) */
const sat=()=>{try{return allMapsColorMode==="satellite"}catch(e){return false}};
function dots(g){/* the little dots for point-only islands are no longer drawn */return;prep();if(!READY||sat())return;const ov=g.cfg.overlays?g.cfg.overlays():{};if(!ov.lakes)return;
 const p=g.projection(),ctr=[-g.rot[0],-g.rot[1]],list=[];
 for(const I of ISLES){if(!I.dot||!lakeShown(ov,I))continue;if(!g._flat&&d3.geoDistance(I.ll,ctr)>Math.PI/2-.02)continue;const k=pxDeg(p,I.ll);if(k<PT_MIN_PXDEG)continue;const c=p(I.ll);if(c)list.push([c,k])}
 if(!list.length)return;const ctx=g.ctx,dpr=(window.gfDpr?gfDpr():Math.min(2,window.devicePixelRatio||1)),dk=dark();
 ctx.save();ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle=dk?"#8f8a6c":"#d2c79f";ctx.strokeStyle=dk?"rgba(255,255,255,.55)":"rgba(70,58,30,.6)";ctx.lineWidth=.8;
 /* a little bigger as the map zooms in, but always small: these islands are only a few km across */
 list.forEach(([c,k])=>{const rr=Math.max(1.8,Math.min(3.4,k/40));ctx.beginPath();ctx.arc(c[0],c[1],rr,0,2*Math.PI);ctx.fill();ctx.stroke()});ctx.restore()}
/* the island as the tiles draw it: its grid cells (grown by one) with the tiles' water cut out, edged along the shore */
let OFF=null;
function drawDet(g,ctx,D,fill,edge,dpr){const pj=gfDetail.pj(g),cv=ctx.canvas;if(!OFF)OFF=document.createElement("canvas");if(OFF.width!==cv.width||OFF.height!==cv.height){OFF.width=cv.width;OFF.height=cv.height}
 const o=OFF.getContext("2d");o.setTransform(1,0,0,1,0,0);o.clearRect(0,0,OFF.width,OFF.height);o.setTransform(dpr,0,0,dpr,0,0);
 const runsPath=c=>{c.beginPath();D.runs.forEach(([a,b,e,f])=>{const q=[pj(a,b),pj(e,b),pj(e,f),pj(a,f)];if(q.some(v=>!v))return;c.moveTo(q[0][0],q[0][1]);c.lineTo(q[1][0],q[1][1]);c.lineTo(q[2][0],q[2][1]);c.lineTo(q[3][0],q[3][1]);c.closePath()})};
 const water=(c,edges)=>{D.W.forEach(rs=>{c.beginPath();rs.forEach(r=>{let pen=false;const n=r.length/3;for(let k=0;k<n;k++){const i=k*3,j=((k+1)%n)*3;if(edges&&(r[i+2]&r[j+2])){pen=false;continue}const a=pj(r[i],r[i+1]),b=pj(r[j],r[j+1]);if(!a||!b){pen=false;continue}if(!pen){c.moveTo(a[0],a[1]);pen=true}c.lineTo(b[0],b[1])}});edges?c.stroke():c.fill("evenodd")})};
 runsPath(o);o.fillStyle=fill;o.fill("nonzero");o.globalCompositeOperation="destination-out";o.fillStyle="#000";water(o,false);o.globalCompositeOperation="source-over";
 ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(OFF,0,0);ctx.restore();
 /* the shore: the water's edges (not the tiles' cut edges) inside the island's grown cells */
 ctx.save();runsPath(ctx);ctx.clip("nonzero");ctx.strokeStyle="rgba(255,255,255,0.95)";ctx.lineWidth=3;water(ctx,true);ctx.strokeStyle=edge;ctx.lineWidth=1.3;water(ctx,true);ctx.restore()}
function install(){const P=GlobeView.prototype;
 const _hov=P._hover;P._hover=function(e){const r=_hov.apply(this,arguments);if(!onMaps(this))return r;const was=this._gfIsle;let I=null;
  try{if(e&&isFinite(e.clientX)){const h=this.hit(e.clientX,e.clientY);if(h&&h.ll){const rc=this.canvas.getBoundingClientRect();I=find(this,h.ll,e.clientX-rc.left,e.clientY-rc.top)}}}catch(err){console.error(err)}
  this._gfIsle=I;
  if(I){this.hotWater=null;this.hot=I.cc;const hb=this.stage.getBoundingClientRect();this.tip.textContent=labelOf(I);this.tip.style.left=e.clientX-hb.left+14+"px";this.tip.style.top=e.clientY-hb.top+14+"px";this.tip.hidden=false;this.canvas.style.cursor="pointer"}
  if(I!==was||I)this.request();return r};
 /* the island is drawn last, over the country outline */
 const _ren=P._render;P._render=function(){const r=_ren.apply(this,arguments);if(!onMaps(this))return r;
  try{dots(this)}catch(err){console.error(err)}
  const I=this._gfIsle;if(!I||this.tip.hidden)return r;
  try{const ctx=this.ctx,dpr=(window.gfDpr?gfDpr():Math.min(2,window.devicePixelRatio||1)),{w,h,r:R}=this.size(),p=this.projection(),dk=dark();
   ctx.save();ctx.setTransform(dpr,0,0,dpr,0,0);if(!this._flat){ctx.beginPath();ctx.arc(w/2,h/2,R,0,2*Math.PI);ctx.clip()}
   ctx.lineJoin="round";ctx.lineCap="round";const fill=dk?"rgba(255,226,120,0.62)":"rgba(255,206,64,0.58)",edge=dk?"#fff3c4":"#7a4a00";
   if(I.kind==="s"){const D=detIsle(this,I);if(D&&D.ok)drawDet(this,ctx,D,fill,edge,dpr);else if(!D){const path=d3.geoPath(p,ctx);ctx.beginPath();path(I.g);ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle="rgba(255,255,255,0.95)";ctx.lineWidth=3;ctx.stroke();ctx.strokeStyle=edge;ctx.lineWidth=1.3;ctx.stroke()}}
   else{const c=p(I.ll);if(c){ctx.beginPath();ctx.arc(c[0],c[1],4.2,0,2*Math.PI);ctx.fillStyle=dk?"#ffe27a":"#ffc52e";ctx.fill();ctx.lineWidth=2;ctx.strokeStyle="#ffffff";ctx.stroke();ctx.beginPath();ctx.arc(c[0],c[1],5.6,0,2*Math.PI);ctx.lineWidth=1.1;ctx.strokeStyle=edge;ctx.stroke()}}
   ctx.restore()}catch(err){console.error(err)}return r};
 addSearch()}
/* search: each island as an "islands" entry (an island the search already has gets the other names) */
function addSearch(){const S=window.gfSearch;if(!S||!S.build)return;const FOLD={"ø":"o","æ":"ae","œ":"oe","ß":"ss","ł":"l","đ":"d","ð":"d","þ":"th","ı":"i","-":" ","–":" ","—":" "};
 const norm=s=>String(s||"").toLowerCase().replace(/[øæœßłđðþı\-–—]/g,c=>FOLD[c]).normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[’'`.]/g,"").replace(/\s+/g," ").trim();
 const _b=S.build;let done=false;
 const add=IDX=>{if(done||!IDX||!IDX.push)return;done=true;prep();
  /* the search's islands by name, once (looking each island up in the whole list froze the page for seconds) */
  const BY=new Map();IDX.forEach(e=>{if(e&&e.cat==="islands"){const k=norm(e.n);if(!BY.has(k))BY.set(k,e)}});
  ISLES.forEach(I=>{const g=I.g||{type:"Point",coordinates:I.ll},keys=[I.n].concat(I.alt).map(norm);
   let old=null;for(const k of keys){old=BY.get(k);if(old)break}
   if(old){old.alt=(old.alt||[]).concat(I.alt.filter(a=>!(old.alt||[]).includes(a)));old.keys=Array.from(new Set((old.keys||[]).concat(keys)));return}
   const ne={n:I.n,alt:I.alt.slice(),cat:"islands",typ:"island in "+I.lake,g,ll:I.g?I.c:I.ll,fame:2,cc:I.cc,keys};IDX.push(ne);const k0=norm(I.n);if(!BY.has(k0))BY.set(k0,ne)})};
 S.build=function(){const r=_b.apply(this,arguments);add(r);return r};
 /* find() uses the search's own build(): fill the shared list now so typed searches see the islands */
 const idle=f=>window.requestIdleCallback?requestIdleCallback(f,{timeout:4000}):setTimeout(f,200);
 idle(()=>{try{add(_b())}catch(e){}})}
/* installed after every other script, so these wrappers are the outermost */
const go=()=>setTimeout(()=>{try{install()}catch(e){console.error(e)}},0);
if(document.readyState==="complete")go();else addEventListener("load",go);
window.gfLakeIslands={list:ISLES,find:(g,ll,x,y)=>find(g,ll,x,y),prep,det:(g,I)=>detIsle(g,I)};
})();
