/* GeoFlock: islands in lakes. Hovering an island in a lake (Ometepe, Olkhon, Bled Island…) names the island and its
   country ("Ometepe — Nicaragua"), highlights the island and the country it belongs to, and leaves the lake alone.
   - Big islands are the holes already in the lake shapes (the lake data has them as inner rings): the hole is the island.
     Samosir is joined to Lake Toba's shore at this resolution, so its outline is the part of Toba's ring that runs round it.
   - Small islands are not in the lake shapes: each has a centre point and is hovered within about 9 px of it, with a
     small dot drawn there while it is hovered. They are only hoverable once the map is zoomed in far enough to see the lake.
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
 ["Likoma Island","mw","Lake Malawi",34.73,-12.06,"s",["Likoma"],"in Mozambique’s waters"],
 ["Idjwi","cd","Lake Kivu",29.06,-2.11,"s",["Idjwi Island","Ijwi"]],
 ["Bugala (Ssese Islands)","ug","Lake Victoria",32.255,-0.44,"s",["Ssese Islands","Sese Islands","Bugala Island","Bugala"]],
 ["Buvuma Island","ug","Lake Victoria",33.29,0.22,"s",["Buvuma"]],
 ["Rubondo Island","tz","Lake Victoria",31.85,-2.33,"s",["Rubondo"]],
 ["Wolfe Island","ca","Lake Ontario",-76.43,44.17,"s",[]],
 ["Amherst Island","ca","Lake Ontario",-76.72,44.16,"s",[]],
 ["Pelee Island","ca","Lake Erie",-82.66,41.78,"s",["Pelee"]],
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
 ["Isla del Sol","bo","Lake Titicaca",-69.17,-16.02,"p",["Island of the Sun"]],
 ["Isla de la Luna","bo","Lake Titicaca",-69.071,-16.04,"p",["Island of the Moon","Koati"]],
 ["Taquile","pe","Lake Titicaca",-69.69,-15.77,"p",["Taquile Island","Isla Taquile"]],
 ["Amantaní","pe","Lake Titicaca",-69.72,-15.66,"p",["Amantani","Amantani Island","Isla Amantaní"]],
 ["Uros floating islands","pe","Lake Titicaca",-69.97,-15.82,"p",["Uros","Uros Islands","Islas flotantes de los Uros","Floating islands"]],
 ["Chizumulu Island","mw","Lake Malawi",34.62,-12.02,"p",["Chizumulu"],"in Mozambique’s waters"],
 ["Dek Island","et","Lake Tana",37.267,11.917,"p",["Dek","Lake Tana islands"]],
 ["Daga Island","et","Lake Tana",37.30,11.883,"p",["Daga","Lake Tana islands"]],
 ["Akdamar","tr","Lake Van",43.0365,38.3412,"p",["Akdamar Island","Aghtamar","Akhtamar"]],
 ["Lesser Yingzhou","cn","West Lake",120.144,30.243,"p",["Xiaoyingzhou","Xiao Yingzhou","Little Yingzhou","Three Pools Mirroring the Moon"]]
].map(r=>({n:r[0],cc:r[1],lake:r[2],ll:[r[3],r[4]],kind:r[5],alt:r[6]||[],note:r[7]||""}));
/* Samosir: the stretch of Lake Toba's own ring that runs round the island, closed across the isthmus at Pangururan */
const SAMOSIR=[[98.69,2.608],[98.74,2.531],[98.858,2.441],[98.899,2.428],[98.978,2.463],[98.978,2.48],[98.845,2.678],[98.796,2.73],[98.732,2.755],[98.701,2.744],[98.679,2.709],[98.676,2.627],[98.69,2.608]];
const HOVER_PX=9,PT_MIN_PXDEG=20,BIG_ALONE_PX=12;
const dark=()=>document.body.classList.contains("sky-night");
const smallPoly=r=>{const g={type:"Polygon",coordinates:[r.slice()]};if(d3.geoArea(g)>2*Math.PI)g.coordinates=[r.slice().reverse()];return g};
/* the island shapes, from the lake holes (built once, after the overlays exist) */
let READY=false;
function prep(){if(READY)return;let O;try{O=globeOverlays()}catch(e){return}if(!O||!O.lakes)return;READY=true;
 ISLES.forEach(I=>{const L=O.lakes.find(x=>x.n===I.lake);I.L=L||null;if(I.kind!=="s")return;let poly=null;
  if(I.n==="Samosir")poly=smallPoly(SAMOSIR);
  else if(L){const polys=L.type==="MultiPolygon"?L.coordinates:[L.coordinates];
   for(const P of polys){for(let k=1;k<P.length;k++){const g=smallPoly(P[k]);if(d3.geoContains(g,I.ll)){poly=g;break}}if(poly)break}}
  if(poly){I.g=poly;I.c=d3.geoCentroid(poly);I.km2=d3.geoArea(poly)*6371*6371;let r=0;poly.coordinates[0].forEach(p=>{r=Math.max(r,d3.geoDistance(p,I.c))});I.r=r}
  else{I.kind="p";console.warn("lake islands: no hole for",I.n)}})}
const countryName=cc=>{try{if(typeof allMapsCountryName==="function"){const n=allMapsCountryName(cc);if(n)return n}}catch(e){}try{return COUNTRY_BY_CODE[cc].n}catch(e){}return cc.toUpperCase()};
const labelOf=I=>I.n+" — "+countryName(I.cc)+(I.note?" ("+I.note+")":"");
const onMaps=g=>{try{return typeof amGlobe!=="undefined"&&g===amGlobe&&appMode==="allmaps"&&!g.cfg.noHover&&!(typeof proj!=="undefined"&&proj.on)}catch(e){return false}};
/* is this island shown, and where is the mouse on it? */
function find(g,ll,mx,my){prep();if(!READY)return null;const ov=g.cfg.overlays?g.cfg.overlays():{};const raster=!!(g.cfg.raster&&g.cfg.raster());
 const p=g.projection(),ctr=[-g.rot[0],-g.rot[1]];let best=null,bd=Infinity;
 for(const I of ISLES){if(!g._flat&&d3.geoDistance(I.ll,ctr)>Math.PI/2-.01)continue;
  const lakeOn=!!ov.lakes&&!(I.L&&I.L.minor&&!ov.minorLakes&&!window._gfMinorOn);const c=p(I.kind==="s"?I.c:I.ll);if(!c)continue;
  const d=Math.hypot(c[0]-mx,c[1]-my);
  if(I.kind==="s"){if(d3.geoDistance(I.c,ll)>I.r+.02&&d>HOVER_PX)continue;
   /* size on screen: the island's radius in pixels */
   const e=p([I.c[0]+I.r*180/Math.PI/Math.max(.2,Math.cos(I.c[1]*Math.PI/180)),I.c[1]]),px=e?Math.abs(e[0]-c[0]):0;
   if(!lakeOn&&!(raster&&px*2>=BIG_ALONE_PX))continue;
   const inside=d3.geoContains(I.g,ll);if(!inside&&!(px*2<16&&d<=HOVER_PX))continue;const s=inside?-1:d;if(s<bd){bd=s;best=I}}
  else{if(!lakeOn||d>HOVER_PX)continue;const q=p([I.ll[0]+.1,I.ll[1]]);if(!q||Math.hypot(q[0]-c[0],q[1]-c[1])*10<PT_MIN_PXDEG)continue;if(d<bd){bd=d;best=I}}}
 return best}
function install(){const P=GlobeView.prototype;
 const _hov=P._hover;P._hover=function(e){const r=_hov.apply(this,arguments);if(!onMaps(this))return r;const was=this._gfIsle;let I=null;
  try{if(e&&!this.tip.hidden||this._gfIsle){const h=this.hit(e.clientX,e.clientY);if(h&&h.ll){const rc=this.canvas.getBoundingClientRect();I=find(this,h.ll,e.clientX-rc.left,e.clientY-rc.top)}}}catch(err){console.error(err)}
  this._gfIsle=I;
  if(I){this.hotWater=null;this.hot=I.cc;const hb=this.stage.getBoundingClientRect();this.tip.textContent=labelOf(I);this.tip.style.left=e.clientX-hb.left+14+"px";this.tip.style.top=e.clientY-hb.top+14+"px";this.tip.hidden=false;this.canvas.style.cursor="pointer"}
  if(I!==was||I)this.request();return r};
 /* the island is drawn last, over the country outline */
 const _ren=P._render;P._render=function(){const r=_ren.apply(this,arguments);const I=this._gfIsle;if(!I||!onMaps(this)||this.tip.hidden)return r;
  try{const ctx=this.ctx,dpr=Math.min(2,window.devicePixelRatio||1),{w,h,r:R}=this.size(),p=this.projection(),dk=dark();
   ctx.save();ctx.setTransform(dpr,0,0,dpr,0,0);if(!this._flat){ctx.beginPath();ctx.arc(w/2,h/2,R,0,2*Math.PI);ctx.clip()}
   ctx.lineJoin="round";ctx.lineCap="round";const fill=dk?"rgba(255,226,120,0.62)":"rgba(255,206,64,0.58)",edge=dk?"#fff3c4":"#7a4a00";
   if(I.kind==="s"){const path=d3.geoPath(p,ctx);ctx.beginPath();path(I.g);ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle="rgba(255,255,255,0.95)";ctx.lineWidth=3;ctx.stroke();ctx.strokeStyle=edge;ctx.lineWidth=1.3;ctx.stroke()}
   else{const c=p(I.ll);if(c){ctx.beginPath();ctx.arc(c[0],c[1],4.2,0,2*Math.PI);ctx.fillStyle=dk?"#ffe27a":"#ffc52e";ctx.fill();ctx.lineWidth=2;ctx.strokeStyle="#ffffff";ctx.stroke();ctx.beginPath();ctx.arc(c[0],c[1],5.6,0,2*Math.PI);ctx.lineWidth=1.1;ctx.strokeStyle=edge;ctx.stroke()}}
   ctx.restore()}catch(err){console.error(err)}return r};
 /* leaving the map or dragging hides the tip; the island goes with it */
 addSearch()}
/* search: each island as an "islands" entry (an island the search already has gets the other names) */
function addSearch(){const S=window.gfSearch;if(!S||!S.build)return;const FOLD={"ø":"o","æ":"ae","œ":"oe","ß":"ss","ł":"l","đ":"d","ð":"d","þ":"th","ı":"i","-":" ","–":" ","—":" "};
 const norm=s=>String(s||"").toLowerCase().replace(/[øæœßłđðþı\-–—]/g,c=>FOLD[c]).normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[’'`.]/g,"").replace(/\s+/g," ").trim();
 const _b=S.build;let done=false;
 const add=IDX=>{if(done||!IDX||!IDX.push)return;done=true;prep();
  ISLES.forEach(I=>{const g=I.g||{type:"Point",coordinates:I.ll},keys=[I.n].concat(I.alt).map(norm);
   const old=IDX.find(e=>e.cat==="islands"&&keys.includes(norm(e.n)));
   if(old){old.alt=(old.alt||[]).concat(I.alt.filter(a=>!(old.alt||[]).includes(a)));old.keys=Array.from(new Set((old.keys||[]).concat(keys)));return}
   IDX.push({n:I.n,alt:I.alt.slice(),cat:"islands",typ:"island in "+I.lake,g,ll:I.g?I.c:I.ll,fame:2,cc:I.cc,keys})})};
 S.build=function(){const r=_b.apply(this,arguments);add(r);return r};
 /* find() uses the search's own build(): fill the shared list now so typed searches see the islands */
 try{add(_b())}catch(e){}}
/* installed after every other script, so these wrappers are the outermost */
const go=()=>setTimeout(()=>{try{install()}catch(e){console.error(e)}},0);
if(document.readyState==="complete")go();else addEventListener("load",go);
window.gfLakeIslands={list:ISLES,find:(g,ll,x,y)=>find(g,ll,x,y),prep};
})();
