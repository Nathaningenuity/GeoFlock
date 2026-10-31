/* GeoFlock: Culture map › Ethnic groups, and the Africa tour's "Peoples split by borders" stop.
   Culture map: traditional homelands of the world's ethnic groups from GREG, Geo-Referencing of Ethnic Groups (Weidmann,
   Rød & Cederman 2010, Journal of Peace Research 47(4): 491–99), a GIS version of the Soviet Atlas Narodov Mira (1964).
   Data: textures/ETHNIC_GROUPS.json (topojson, object "eth"; one geometry per group or mix of groups, multipart pieces
   merged, clipped to land, simplified). Properties: n = name (the atlas's name; a few outdated, misspelt or offensive
   ones replaced by the usual name today), x = other names the atlas gives, c = colour index (one per polygon of a
   MultiPolygon, or one number for all). The colours come from a neighbour colouring done once when the data was built
   (no two touching pieces share a colour), so they mean nothing on their own: there is no per-group key, the patchwork
   itself shows the diversity. Hover (or tap) for a name. "Today's borders" draws the current national borders on top.
   Africa tour: a stop after "Straight-line borders" lays George Peter Murdock's 1959 map of African homelands, digitized
   by Nathan Nunn (textures/ETHNIC_MURDOCK.json, loaded only when that stop runs), over the relief with today's borders
   on top. The stop is added after window load + 1.5 s and again at +5 and +12 s (tours can rebuild their steps late),
   guarded by a flag on the steps array. Takes the Language areas tab's place (geoflock-langareas.js keeps that hidden). */
(function(){
if(typeof ALLMAPS_SUBMODES==="undefined"||typeof TH_THEMES==="undefined"||typeof d3==="undefined"||typeof topojson==="undefined")return;
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const ID="eth";
if(!ALLMAPS_SUBMODES.culture.some(s=>s.id===ID)){const i=ALLMAPS_SUBMODES.culture.findIndex(s=>s.id==="lang");ALLMAPS_SUBMODES.culture.splice(i<0?ALLMAPS_SUBMODES.culture.length:i+1,0,{id:ID,label:"Ethnic groups"})}
const on=()=>{try{return appMode==="allmaps"&&allMapsColorMode==="culture"&&allMapsSubMode.culture===ID}catch(e){return false}};
const dark=()=>document.body.classList.contains("sky-night");
/* seven soft colours that sit well on the light map (it stays light in the dark theme too); in the dark theme a little deeper. No sky blue: a blue patch would read as water */
const PAL_L=["#efb98f","#a3d3ae","#c9da8f","#eaa9bd","#ded28c","#c0abe0","#94d1cd"];
const PAL_D=["#e3a173","#86c095","#b0c56c","#dd8fa8","#cdbf6c","#a993d4","#74beb9"];
const pal=()=>dark()?PAL_D:PAL_L;
let bordersOn=true;
TH_THEMES[ID]={title:"Ethnic groups",cats:[],data:{},info:{},note:"Traditional homelands of ethnic groups."};

/* ---------- data: the pieces (one per polygon, with its colour), the lines between groups, the features for hover ---------- */
/* coarser copies of each ring for the zoomed-out views: a point is kept once it is tol degrees from the last one kept */
const LODS=[0,.04,.12,.3];
function dec(ring,tol){if(!tol)return ring;const o=[ring[0]];let l=ring[0];for(let i=1;i<ring.length-1;i++){const q=ring[i];if(Math.abs(q[0]-l[0])+Math.abs(q[1]-l[1])>=tol){o.push(q);l=q}}o.push(ring[ring.length-1]);return o}
function lodOf(q,k,lines){if(!q.lod)q.lod=[];if(q.lod[k]!==undefined)return q.lod[k];const t=LODS[k];let v;
 if(lines)v=dec(q.g,t);else{const[[w,s],[e,n]]=q.bb;if(k&&w<=e&&e-w<t&&n-s<t)v=null;else{v=q.g.map(r=>dec(r,t)).filter((r,i)=>r.length>=4||i===0);if(v[0].length<4)v=k?null:q.g;
  /* a coarse copy that turned inside out would cover the whole world: keep the full piece instead */
  else if(k&&d3.geoArea({type:"Polygon",coordinates:v})>2*Math.PI)v=q.g}}
 return q.lod[k]=v}
function build(topo){const obj=topo.objects.eth,fc=topojson.feature(topo,obj),n=PAL_L.length,parts=[],box=[];
 const fix=poly=>{try{if(d3.geoArea({type:"Polygon",coordinates:poly})>2*Math.PI)poly.forEach(r=>r.reverse())}catch(e){}return poly};
 fc.features.forEach(f=>{const g=f.geometry;if(!g)return;const P=g.type==="Polygon"?[g.coordinates]:g.type==="MultiPolygon"?g.coordinates:null;if(!P)return;
  P.forEach(fix);const c=f.properties.c;P.forEach((poly,k)=>{const ci=Array.isArray(c)?c[k]:c;if(!(ci>=0&&ci<n))return;parts.push(Object.assign({g:poly,ci},caps({type:"Polygon",coordinates:poly},poly[0])))});
  if(f.properties.n==="Uninhabited")return;box.push([d3.geoBounds(f),f,d3.geoArea(f)])});
 box.sort((a,b)=>a[2]-b[2]);/* smallest first: a small group inside a big one wins the hover */
 const mesh=topojson.mesh(topo,obj,(a,b)=>a!==b),lines=mesh.coordinates.map(l=>Object.assign({g:l},caps({type:"LineString",coordinates:l},l)));
 return{parts,n,lines,box}}
/* each piece keeps a bounding cap (for the globe) and box (for the flat map), so pieces out of view are skipped */
function caps(geo,pts){const cen=d3.geoCentroid(geo);let r=0;pts.forEach(q=>{const d=d3.geoDistance(cen,q);if(d>r)r=d});return{cen,r,bb:d3.geoBounds(geo)}}
function viewTest(p,gv,cv){try{if(gv&&!gv._flat&&gv.visibleAngle){const ctr=[-gv.rot[0],-gv.rot[1]],vis=gv.visibleAngle();return q=>d3.geoDistance(q.cen,ctr)-q.r<vis}
  if(cv){const T=cv.getContext("2d").getTransform(),W=cv.width/(T.a||1)+40,H=cv.height/(T.d||1)+40;
   return q=>{const[[w,s],[e,n]]=q.bb;if(w>e)return true;const lats=[s,n,(s+n)/2];if(s<0&&n>0)lats.push(0);let x0=1/0,x1=-1/0,y0=1/0,y1=-1/0;
    for(const la of lats)for(const lo of[w,e]){const xy=p([lo,la]);if(!xy)return true;if(xy[0]<x0)x0=xy[0];if(xy[0]>x1)x1=xy[0];if(xy[1]<y0)y0=xy[1];if(xy[1]>y1)y1=xy[1]}
    return x1>-40&&x0<W&&y1>-40&&y0<H}}}catch(e){}return()=>true}
/* how coarse a copy the view can take: about a pixel */
function lodLevel(p,gv){let ppd=1;try{ppd=gv&&!gv._flat&&gv.size?gv.size().r*(gv.zoom||1)*Math.PI/180:p.scale()*Math.PI/180}catch(e){}const t=.9/ppd;let k=0;LODS.forEach((v,i)=>{if(v<=t)k=i});return k}
let NAT=null;function natBorders(){if(NAT)return NAT;try{NAT=topojson.mesh(PROJ_WORLD,PROJ_WORLD.objects.countries,(a,b)=>a!==b)}catch(e){NAT={type:"MultiLineString",coordinates:[]}}return NAT}
let G=null,gLoad=null;
function load(){if(gLoad)return gLoad;gLoad=fetch("textures/ETHNIC_GROUPS.json").then(r=>r.json()).then(t=>{G=build(t);redraw()}).catch(e=>{console.error(e);gLoad=null});return gLoad}
let M=null,mLoad=null;
function loadM(){if(mLoad)return mLoad;mLoad=fetch("textures/ETHNIC_MURDOCK.json").then(r=>r.json()).then(t=>{M=build(t);reqTour()}).catch(e=>{console.error(e);mLoad=null});return mLoad}
function at(D,ll){if(!D||!ll)return null;for(const[b,f]of D.box){const w=b[0][0]<=b[1][0];if(w?(ll[0]<b[0][0]||ll[0]>b[1][0]):(ll[0]<b[0][0]&&ll[0]>b[1][0]))continue;if(ll[1]<b[0][1]||ll[1]>b[1][1])continue;if(d3.geoContains(f,ll))return f}return null}

/* ---------- drawing: the patchwork goes to a picture of its own, kept while the view does not move ---------- */
const OFF=new Map;
function layer(ctx,p,id,draw,op,alpha){const cv=ctx.canvas,T=ctx.getTransform();let R=OFF.get(id);if(!R){R={cv:document.createElement("canvas"),key:""};OFF.set(id,R)}
 const key=[cv.width,cv.height,T.a,T.d,T.e,T.f,p.rotate?p.rotate().join():"",p.scale(),p.translate().join(),dark()].join("|");
 if(R.key!==key){const c=R.cv;if(c.width!==cv.width||c.height!==cv.height){c.width=cv.width;c.height=cv.height}
  const o=c.getContext("2d");o.setTransform(1,0,0,1,0,0);o.clearRect(0,0,c.width,c.height);o.setTransform(T);draw(o,d3.geoPath(p,o),p);R.key=key}
 ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalCompositeOperation=op||"source-over";ctx.globalAlpha=alpha==null?1:alpha;ctx.drawImage(R.cv,0,0);ctx.restore()}
/* the pieces in view, in batches (one canvas path of thousands of pieces is far slower than many small ones) */
function patchwork(D,edgeCol,edgeW,gv){return(o,path,p)=>{const P=pal(),inView=viewTest(p,gv,o.canvas),k=Math.min(LODS.length-1,lodLevel(p,gv)+(gv&&gv._moving?1:0)),by=Array.from({length:D.n},()=>[]);
 D.parts.forEach(q=>{if(!inView(q))return;const v=lodOf(q,k);if(v)by[q.ci].push(v)});
 by.forEach((list,i)=>{o.fillStyle=P[i];for(let j=0;j<list.length;j+=60){o.beginPath();for(let m=j;m<Math.min(list.length,j+60);m++)path({type:"Polygon",coordinates:list[m]});o.fill()}});
 if(gv&&gv._moving)return;/* the thin lines between groups wait until the map stops */
 const L=[];D.lines.forEach(q=>{if(inView(q))L.push(lodOf(q,k,1))});o.strokeStyle=edgeCol;o.lineWidth=edgeW;o.lineJoin="round";
 for(let j=0;j<L.length;j+=200){o.beginPath();path({type:"MultiLineString",coordinates:L.slice(j,j+200)});o.stroke()}}}
/* today's borders: dark lines with a pale edge, thicker as you zoom in */
function drawBorders(ctx,p,gv){const z=gv&&gv.zoom||1,w=Math.max(1.1,Math.min(2.4,.75+.45*z)),path=d3.geoPath(p,ctx);ctx.save();ctx.lineJoin="round";ctx.lineCap="round";ctx.beginPath();path(natBorders());
 ctx.strokeStyle="rgba(255,255,255,.8)";ctx.lineWidth=w+1.8;ctx.stroke();ctx.strokeStyle="#262b36";ctx.lineWidth=w;ctx.stroke();ctx.restore()}
function drawHover(ctx,p,f){if(!f)return;const path=d3.geoPath(p,ctx);ctx.save();ctx.beginPath();path(f);ctx.strokeStyle="#ffffff";ctx.lineWidth=3.4;ctx.stroke();ctx.strokeStyle="#1d2433";ctx.lineWidth=1.6;ctx.stroke();ctx.restore()}
/* the countries go plain: the homelands are laid over them in multiply, so labels still show through */
{const _c=allMapsColorForCode;allMapsColorForCode=function(code){if(on())return code==="aq"?"#ffffff":"#f7f4ee";return _c.apply(this,arguments)}}
let hov=null;
if(typeof GlobeView!=="undefined"){const P=GlobeView.prototype,_dm=P._drawMeasure;P._drawMeasure=function(ctx,p){try{if(typeof amGlobe!=="undefined"&&this===amGlobe&&on()){
  if(!G)load();else{layer(ctx,p,"am",patchwork(G,"rgba(255,255,255,.75)",.6,this),"multiply");if(bordersOn)drawBorders(ctx,p,this);drawHover(ctx,p,hov)}}}catch(e){console.error(e)}return _dm.apply(this,arguments)}}
/* with "Today's borders" off, the map's own thin country borders go too, so only the homelands show */
setInterval(()=>{try{if(typeof amGlobe==="undefined"||!amGlobe||amGlobe._gfEth)return;amGlobe._gfEth=1;const c=amGlobe.cfg,_b=c.borders;c.borders=function(){if(on()&&!bordersOn)return false;return _b?_b.apply(this,arguments):true}}catch(e){}},400);
function redraw(){try{amGlobe&&(amGlobe.request?amGlobe.request():amGlobe.render())}catch(e){}try{if(on())applyAllMapsColorMode(document.getElementById("allMapsWrap"))}catch(e){}}

/* ---------- the name under the pointer (hover, or tap on a touch screen) ---------- */
const tip=document.createElement("div");tip.className="gf-eth-tip";tip.hidden=true;document.body.appendChild(tip);
const css=document.createElement("style");css.textContent=`.gf-eth-tip{position:fixed;z-index:9000;pointer-events:none;background:#1d2433;color:#fff;border-radius:10px;padding:7px 10px;font:12.5px/1.35 system-ui,sans-serif;box-shadow:0 6px 18px rgba(0,0,0,.25);max-width:290px}
.gf-eth-tip b{font-size:13.5px}.gf-eth-tip .x{opacity:.85}.gf-eth-tip .s{font-size:11px;opacity:.65;margin-top:3px}
.gf-eth-tog{margin:2px 10px 2px 4px;vertical-align:middle}.gf-eth-src{display:block;margin-top:4px}body.gf-eth-on #populationLegend .faint-sw,body.gf-eth-on #populationLegend .leg-opts{display:none}`;document.head.appendChild(css);
function tipHTML(f,src){const p=f.properties;return'<b>'+esc(p.n)+'</b>'+(p.x?'<div class="x">'+esc(p.x)+'</div>':'')+'<div class="s">'+src+'</div>'}
function place(e){tip.hidden=false;tip.style.left=Math.max(6,Math.min(innerWidth-300,e.clientX+16))+"px";tip.style.top=Math.min(innerHeight-90,e.clientY+14)+"px"}
const tourOn=()=>{try{if(typeof ps==="undefined"||!ps||!ps.g)return false;const S=(psSteps()||[])[ps.i];return!!(S&&S.gfMurdock)}catch(e){return false}};
let tHov=null,rq=0,touchT=0;
function track(e){const tour=tourOn(),g=tour?ps.g:on()?amGlobe:null,D=tour?M:G;
 if(!g||!D||!g.host||!g.host.contains(e.target)||(e.target.closest&&e.target.closest("button,a,input,.gfk-tray,.gfk-panel,.gf-xs,.gf-pc,.ps-card"))){if(!tip.hidden&&e.type==="pointermove"&&e.pointerType==="mouse")tip.hidden=true;if(hov||tHov){hov=tHov=null;try{g&&g.request()}catch(_){}}return}
 if(rq)return;rq=requestAnimationFrame(()=>{rq=0;const r=g.canvas.getBoundingClientRect();let ll=null;try{ll=g.projection().invert([e.clientX-r.left,e.clientY-r.top])}catch(_){}const f=at(D,ll);
  if(tour){if(f!==tHov){tHov=f;reqTour()}}else if(f!==hov){hov=f;try{g.request?g.request():g.render()}catch(_){}}
  if(!f){tip.hidden=true;return}tip.innerHTML=tipHTML(f,tour?"Murdock, 1959":"Atlas Narodov Mira, 1964");place(e);
  if(e.pointerType&&e.pointerType!=="mouse"){clearTimeout(touchT);touchT=setTimeout(()=>{tip.hidden=true},3500)}})}
addEventListener("pointermove",e=>{if(!on()&&!tourOn()){if(!tip.hidden)tip.hidden=true;if(hov)hov=null;return}if(e.pointerType==="mouse")track(e)},true);
addEventListener("pointerup",e=>{if((on()||tourOn())&&e.pointerType!=="mouse")track(e)},true);
/* in this view the country tooltip gives way to the group's */
document.addEventListener("pointermove",()=>{if(on()||tourOn())document.querySelectorAll(".globe-tip").forEach(t=>{t.style.visibility=tip.hidden?"":"hidden"})},true);

/* ---------- the key: today's borders on or off, what the map is and is not, and the credit ---------- */
const NOTE='Traditional homelands as mapped in the mid-20th century (Atlas Narodov Mira, 1964), not where people live today. Boundaries are fuzzy, cities are mixed, and these maps were drawn by outside scholars.';
const CREDIT='Ethnic groups: GREG (Weidmann, Rød &amp; Cederman 2010, after <i>Atlas Narodov Mira</i> 1964).';
if(typeof thLegendHTML==="function"){const _l=thLegendHTML;thLegendHTML=function(){try{if(on()){document.body.classList.add("gf-eth-on");if(!G){load();return'<span class="legend-title">Ethnic groups</span><span class="legend-note">Loading ethnic groups…</span>'}
 return'<span class="legend-title">Ethnic groups</span><label class="switch gf-eth-tog" title="Draw today’s national borders on top"><input type="checkbox" data-eth-borders'+(bordersOn?' checked':'')+'><span class="switch-track"><span class="switch-thumb"></span></span><span class="switch-label">Today’s borders</span></label>'
  +'<span class="legend-note">Each patch is one group’s homeland. Touching groups always get different colours; the colours mean nothing else. Hover or tap a patch for its name. Thick lines are today’s national borders: many groups are split by them.</span>'
  +'<span class="legend-note gf-eth-src">'+NOTE+' '+CREDIT+'</span>'}}catch(e){}return _l.apply(this,arguments)}}
document.addEventListener("change",e=>{const b=e.target.closest&&e.target.closest("input[data-eth-borders]");if(!b||!on())return;bordersOn=b.checked;try{amGlobe.request?amGlobe.request():amGlobe.render()}catch(_){}},true);
setInterval(()=>{const o=on();document.body.classList.toggle("gf-eth-on",o);if(o&&!gLoad)load();if(!o&&!tourOn()&&!tip.hidden)tip.hidden=true},500);

/* =====================================================================================================
   AFRICA TOUR: "Peoples split by borders" (Murdock's homelands, today's borders on top)
   ===================================================================================================== */
const STOP="Peoples split by borders",AFTER="Straight-line borders";
function reqTour(){try{if(typeof ps!=="undefined"&&ps&&ps.g)ps.g.request?ps.g.request():ps.g.render()}catch(e){}}
if(typeof psGlobeDraw==="function"){const _d=psGlobeDraw;psGlobeDraw=function(ctx,p,gv){try{if(typeof ps!=="undefined"&&ps&&gv&&gv===ps.g&&tourOn()){
  if(!M)loadM();else{layer(ctx,p,"tour",patchwork(M,"rgba(255,255,255,.8)",.7,gv),"source-over",.62);drawBorders(ctx,p,gv);drawHover(ctx,p,tHov)}}}catch(e){console.error(e)}return _d.apply(this,arguments)}}
const def=(o,k,v)=>Object.defineProperty(o,k,{configurable:true,enumerable:true,writable:true,value:v});
const lock=(o,k,v)=>Object.defineProperty(o,k,{configurable:true,enumerable:true,get(){return v},set(){}});
function stop(){const s={_autoSpin:1,_ctx:1,_lg:1,_ky:1,_enr:1,_ff:1,title:STOP,view:[-40,-13,53,17],globe:[24,2,1.3],card:"left",gfMurdock:1,
 pins:[[[0.9,7.2],"Ewe: Ghana and Togo","point"],[[36.0,-2.6],"Maasai: Kenya and Tanzania","point"],[[44.5,7.5],"Somali: four countries","point"]],
 stat:"About 230 of the 830 homelands on this map are cut by today’s borders",
 body:"The patches are the homelands of African peoples as the anthropologist George Peter Murdock mapped them in 1959; the dark lines are today’s borders. Most of those borders were drawn by European powers in the decades after the Berlin Conference of 1884–85, and they cut across many homelands. The Maasai are split between Kenya and Tanzania, the Ewe between Ghana and Togo, and the Somali live in Somalia, Ethiopia, Kenya and Djibouti.",
 more:"The economists Stelios Michalopoulos and Elias Papaioannou counted a homeland as split when at least a tenth of it lies outside its main country, and compared split and unsplit groups (“The Long-Run Effects of the Scramble for Africa”, American Economic Review, 2016). The homelands of split groups have seen more political violence and conflict since independence. The map is a mid-20th-century picture drawn by an outside scholar: borders between peoples were fuzzy, and people have moved since. Hover or tap a patch for its name. Homelands: Murdock (1959), digitized by Nathan Nunn."};
 lock(s,"phPins",[]);return s}
const Q={at:STOP,st:STOP,q:"Which people’s homeland is split between Kenya and Tanzania?",o:["Zulu","Maasai","Yoruba","Ewe"],a:1,why:"The border between Kenya and Tanzania, drawn by Britain and Germany in the 1880s, runs through Maasai land."};
function patch(){try{const t=PS_TOURS.africa;if(!t||!Array.isArray(t.steps)||!t.steps.length)return;
 if(!t.steps._gfEth){if(!t.steps.some(s=>s&&s.title===STOP)){let i=t.steps.findIndex(s=>s&&s.title===AFTER);if(i<0)i=t.steps.length-2;t.steps.splice(i+1,0,stop())}
  try{def(t.steps,"_gfEth",1)}catch(e){t.steps._gfEth=1}}
 if(typeof TOURQ!=="undefined"&&TOURQ.africa){const A=TOURQ.africa;A.mid=A.mid||[];if(!A.mid.some(x=>x.st===STOP))A.mid.push(Object.assign({},Q))}}catch(e){console.error(e)}}
const run=()=>[1500,5000,12000].forEach(ms=>setTimeout(patch,ms));
if(document.readyState==="complete")run();else addEventListener("load",run);
window.gfEthnic={load,loadM,patch,get borders(){return bordersOn},set borders(v){bordersOn=!!v;redraw()},at:ll=>{const f=at(G,ll);return f&&f.properties},atM:ll=>{const f=at(M,ll);return f&&f.properties}};
})();
