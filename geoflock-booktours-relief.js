/* GeoFlock: the four big "Mapped books" tours run on the Relief map, with the History map laid over it where a stop needs a year.
   Prisoners of Geography (bprisoners), Why Nations Fail (bnations) and Collapse (bcollapse) had moved onto the History map
   (geoflock-tourhist.js turns a tour with History-map stops into a History tour). Like Guns, Germs, and Steel (bggs) they
   now run on the Relief map, which looks better:
   1. Map. Their stops leave the History map (stop text, pins, photos and order are untouched; a stop on a data map that
      carries the point, such as Korea on the Economy map, keeps it). The year each stop had before the History-map move
      is put back as it was.
   2. gfHistYear (a new per-stop overlay, on the globe and the flat map). A stop about a past year gets that year's
      states from the History map's own data (history/h2-*.json, through GF_HIST2.featsAt), laid over the relief as ONE
      see-through layer: every state is drawn whole into a picture of its own, which is then laid over the map at one
      strength, so where shapes overlap the colour does not add up. Borders are drawn crisp over it at full strength, and
      only the names the stop needs are written (labels). "No state" land is left clear.
        gfHistYear: 1914                                         the states of 1914
        gfHistYear:{y:1914,focus:"ott",labels:[{gk:"ott"}]}       focus: that History-map group stays strong, the rest
                                                                 paler (inside the same layer); labels: by group key
                                                                 (gk), by name (n, a string or RegExp), name: shown
                                                                 text, at:[lon,lat] moves it
      Stops that do not need a year are plain relief with their usual highlights, lines and pins.
   3. Strength. The overlay follows the History map's "Relief underneath" colour strength (geoflock-histrelief.js:
      gfHR.alpha(), saved as gfReliefAlpha; 40 % when neither is there). The empire and climate overlays of these tours
      (gfEmpire, gfClimate, geoflock-tourover.js) follow it too.
   4. Where they are listed. All four are in the "more tours" list of both the Relief tab and the History tab
      (T.alsoOn includes "history"). Started from the History tab, a book tour switches to the Relief map and runs there;
      moving to the History tab during one ends it, as for the other Relief tours.
   Load after geoflock-tourover.js and geoflock-tourhist.js. */
(function(){
if(window._gfBookRelief)return;window._gfBookRelief=1;
const BOOKS=["bprisoners","bggs","bnations","bcollapse"],MOVE=["bprisoners","bnations","bcollapse"];
const def=(o,k,v)=>{try{Object.defineProperty(o,k,{configurable:true,enumerable:true,writable:true,value:v})}catch(e){try{o[k]=v}catch(e2){}}};
const live=()=>typeof ps!=="undefined"&&!!ps;

/* ---------- which stops get which year ---------- */
/* the year each stop of the three tours had before geoflock-tourhist.js moved it (undefined = none) */
const ORIG_SUB={
 bprisoners:{"America’s lucky geography":"2015","Europe’s rivers and harbours":"2015","Africa: bigger than it looks":"2015","Congo: too big to hold":"2015",
  "Lines in the sand":"1914/ott","Iran, a mountain fortress":"2015","India and Pakistan":"2015","Korea: Seoul within range":"2015","Latin America’s walls":"2015","Brazil’s wall by the sea":"2015"},
 bnations:{"Korea: one people, two economies":"percapita","Silver and forced labour":"1650/spa","The convicts who sued":"1800","Printing held back":"1700","Tearing up the railway":"1975"},
 bcollapse:{"The Classic Maya":"800/maya","Iceland’s blowing soil":"1000","Societies that succeeded":"1700","Too many people, too little land":"1990",
  "Hispaniola: one island, two paths":"2026","Australia: mining the soil":"2026","An oil field that saved the forest":"2005"}};
/* the stops about a past year, and the names they need (modern years such as 1975 or 2015 stay plain relief: their
   borders are today's, which the relief's highlights already show) */
const YEAR={
 bprisoners:{
  "Lines in the sand":{y:1914,focus:"ott",labels:[{gk:"ott",name:"Ottoman Empire",at:[39.2,35.3]}]}},
 bnations:{
  "Silver and forced labour":{y:1650,focus:"spa",labels:[{gk:"spa",name:"Spain’s empire"}]},
  "The Glorious Revolution":{y:1688,labels:[{n:"Kingdom of England",name:"England"},{n:"Republic of the Seven United Netherlands",name:"Dutch Republic"}]},
  "The convicts who sued":{y:1800,labels:[{n:"Colony of New South Wales",name:"New South Wales (British)"}]},
  "Venice closes its doors":{y:1297,labels:[{n:/^Republic of Venice$|^Venice$/,name:"Venice"},{n:"Eastern Roman Empire",name:"Byzantine Empire"},{n:"Mamluk Sultanate"}]},
  "Printing held back":{y:1700,focus:"ott",labels:[{gk:"ott",name:"Ottoman Empire"}]}},
 bcollapse:{
  "The Classic Maya":{y:800,focus:"maya",labels:[{gk:"maya",name:"Maya city-states"}]},
  "Iceland’s blowing soil":{y:1000,labels:[{n:"Icelandic Commonwealth"}]},
  "The Norse in Greenland":{y:1000,labels:[]},
  "Societies that succeeded":{y:1700,labels:[{n:"Tokugawa Shogunate",name:"Tokugawa Japan"}]}}};

/* ---------- the overlays' strength ---------- */
function strength(){try{if(window.gfHR&&typeof gfHR.alpha==="function"){const a=+gfHR.alpha();if(a>=.05&&a<=1)return a}}catch(e){}
 try{const v=parseFloat(localStorage.getItem("gfReliefAlpha"));if(v>=.1&&v<=1)return v}catch(e){}return .4}
window.gfHistOpacity=window.gfHistOpacity||strength;
/* the empire and climate overlays read o.alpha when they draw: it follows the same strength */
function follow(o){if(!o||typeof o!=="object"||o._gfBkA)return;try{Object.defineProperty(o,"alpha",{configurable:true,enumerable:true,get:strength,set(){}});Object.defineProperty(o,"_gfBkA",{value:1,configurable:true})}catch(e){}}

/* ---------- 1. the tours on the Relief map ---------- */
function patch(id){try{const T=typeof PS_TOURS!=="undefined"&&PS_TOURS[id];if(!T||!Array.isArray(T.steps))return;
 if(MOVE.includes(id)){if(T.map&&T.map.mode==="history"){T.map=Object.assign({},T.map,{mode:"relief"});delete T.map.histRelief}
  /* tourhist leaves a tour alone once its steps carry this flag (and with no History stop left it would anyway) */
  def(T.steps,"_gfHist",1);
  const O=ORIG_SUB[id]||{};
  T.steps.forEach(S=>{if(!S||S._gfBk)return;
   if(S.mode==="history"){def(S,"mode",undefined);if(S.title in O)def(S,"sub",O[S.title]);else def(S,"sub",undefined)}
   const Y=(YEAR[id]||{})[S.title];if(Y&&!S.gfHistYear)def(S,"gfHistYear",Y);
   def(S,"_gfBk",1)})}
 T.steps.forEach(S=>{if(!S)return;(Array.isArray(S.gfEmpire)?S.gfEmpire:S.gfEmpire?[S.gfEmpire]:[]).forEach(follow);
  if(S.gfClimate){if(S.gfClimate===true)def(S,"gfClimate",{});follow(S.gfClimate)}});
 T.alsoOn=(T.alsoOn||[]).filter(m=>m!=="relief");if(!T.alsoOn.includes("history"))T.alsoOn.push("history");
 if(T.relief===true)delete T.relief}catch(e){console.error("booktours-relief",id,e)}}
function patchAll(){BOOKS.forEach(patch)}

/* ---------- 4. started from the History tab: run on the Relief map ---------- */
const curMode=()=>{try{return appMode==="allmaps"&&allMapsColorModeOn?allMapsColorMode:null}catch(e){return null}};
let redirectAt=0;
function hook(){if(typeof psStart!=="function"||typeof psLaunchTour!=="function"||typeof psCtx!=="function")return false;if(psStart._gfBk)return true;
 {const _s=psStart;psStart=function(want){try{if(want&&BOOKS.includes(want)){patch(want);if(curMode()==="history"){
    /* psLaunchTour puts the Relief map on and starts the tour once it is up (its retries come back here) */
    if(Date.now()-redirectAt>15000){redirectAt=Date.now();psLaunchTour(want)}return}}}catch(e){console.error(e)}
   return _s.apply(this,arguments)};psStart._gfBk=1}
 {const _l=psLaunchTour;psLaunchTour=function(id){try{if(BOOKS.includes(id)){patch(id);redirectAt=Date.now()}}catch(e){}return _l.apply(this,arguments)}}
 /* a book tour running on the Relief map is not one of the History tab's tours (so moving there ends it) */
 {const _c=psCtx;psCtx=function(){const ctx=_c.apply(this,arguments);try{if(ctx&&live()&&BOOKS.includes(ps.tour)&&curMode()==="history"&&ctx.tours.includes(ps.tour)){
    const tours=ctx.tours.filter(t=>t!==ps.tour);if(!tours.length)return null;return Object.assign({},ctx,{tours,tour:tours.includes(ctx.tour)?ctx.tour:tours[0]})}}catch(e){}return ctx}}
 return true}

/* ---------- 2. the History map's states for a stop's year ---------- */
const FR=new Map,FRP=new Map;
const req=()=>{try{if(live()&&ps.g)ps.g.request?ps.g.request():ps.g.render()}catch(e){}};
function feats(y){if(FR.has(y))return FR.get(y);if(!FRP.has(y)&&window.GF_HIST2&&GF_HIST2.featsAt){
  FRP.set(y,GF_HIST2.featsAt(y).then(F=>{const out=(F||[]).filter(f=>f&&f.geometry&&f.properties&&f.properties.k!==0);if(out.length){FR.set(y,out);req()}else FRP.delete(y)}).catch(()=>FRP.delete(y)))}
 return null}
const spec=S=>{const v=S&&S.gfHistYear;if(v==null||v===false)return null;return typeof v==="number"?{y:v}:v};
const dark=()=>{try{return document.body.classList.contains("sky-night")||document.documentElement.getAttribute("data-theme")==="dark"}catch(e){return false}};
const match=(f,p)=>{if(!f)return true;return p.gk===f};
const OFF=new Map;
function pic(id,ctx,p,draw){const cv=ctx.canvas,M=ctx.getTransform();let R=OFF.get(id);if(!R){if(OFF.size>8)OFF.clear();R={cv:document.createElement("canvas"),key:""};OFF.set(id,R)}
 const key=[cv.width,cv.height,M.a,M.b,M.c,M.d,M.e,M.f,p.rotate?p.rotate().join():"",p.scale(),p.translate().join(),dark()?1:0].join("|");
 if(R.key!==key){const c=R.cv;if(c.width!==cv.width||c.height!==cv.height){c.width=cv.width;c.height=cv.height}
  const o=c.getContext("2d");o.setTransform(1,0,0,1,0,0);o.clearRect(0,0,c.width,c.height);o.setTransform(M);draw(o,d3.geoPath(p,o));R.key=key}
 return R.cv}
function drawYear(ctx,p,gv){if(!live()||!gv||gv!==ps.g)return;const S=(psSteps()||[])[ps.i];const o=spec(S);if(!o)return;const F=feats(o.y);if(!F)return;
 const id=ps.tour+"|"+ps.i+"|"+o.y,foc=o.focus||null;
 /* the states, whole, into one picture (the focus group strong, the others paler inside the same picture) */
 const fill=pic(id+"|f",ctx,p,(c,path)=>{F.forEach(f=>{const q=f.properties;c.globalAlpha=foc&&!match(foc,q)?.4:1;c.beginPath();path(f);c.fillStyle=q.c||"hsl(200,28%,80%)";c.fill()});c.globalAlpha=1});
 /* borders, crisp, at full strength */
 const line=pic(id+"|l",ctx,p,(c,path)=>{c.lineJoin="round";const d=dark();
  c.beginPath();F.forEach(f=>path(f));c.strokeStyle=d?"rgba(236,224,200,.55)":"rgba(48,34,20,.55)";c.lineWidth=.7;c.stroke();
  if(foc){c.beginPath();F.forEach(f=>{if(match(foc,f.properties))path(f)});c.strokeStyle=d?"rgba(255,244,222,.9)":"rgba(40,26,14,.85)";c.lineWidth=1.5;c.stroke()}});
 ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=strength();ctx.drawImage(fill,0,0);ctx.globalAlpha=1;ctx.drawImage(line,0,0);ctx.restore();
 /* the names the stop needs, at the biggest matching shape's label point */
 (o.labels||[]).forEach(L=>{let best=null;F.forEach(f=>{const q=f.properties;const ok=L.gk?q.gk===L.gk:L.n instanceof RegExp?L.n.test(q.n||""):q.n===L.n;if(ok&&(!best||(q.a||0)>(best.properties.a||0)))best=f});
  if(!best)return;const at=L.at||best.properties.l;if(!at)return;let xy=null;try{xy=p(at)}catch(e){}if(!xy||!isFinite(xy[0]))return;
  if(!gv._flat){try{if(d3.geoDistance(at,[-gv.rot[0],-gv.rot[1]])>Math.PI/2-.05)return}catch(e){}}
  const txt=L.name||best.properties.n;if(!txt)return;const s=Math.max(12,Math.min(16,11.5+(gv.zoom||1)*.5));
  ctx.save();ctx.font="800 "+s+"px Inter, system-ui, sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.lineJoin="round";
  ctx.lineWidth=4;ctx.strokeStyle="rgba(255,255,255,.92)";ctx.strokeText(txt,xy[0],xy[1]);ctx.fillStyle="#3b2414";ctx.fillText(txt,xy[0],xy[1]);ctx.restore()})}
let drawHooked=false;
function hookDraw(){if(drawHooked||typeof psGlobeDraw!=="function"||typeof d3==="undefined")return;drawHooked=true;
 const _d=psGlobeDraw;psGlobeDraw=function(ctx,p,gv){try{drawYear(ctx,p,gv)}catch(e){console.error(e)}return _d.apply(this,arguments)}}
/* the years of the running tour are fetched at its start, so they are there when a stop opens */
setInterval(()=>{try{if(!live())return;(psSteps()||[]).forEach(S=>{const o=spec(S);if(o)feats(o.y)})}catch(e){}},700);

/* ---------- run ---------- */
function run(){try{hookDraw();if(!hook()){}patchAll()}catch(e){console.error("booktours-relief",e)}}
function start(){run();[1500,5000,12000].forEach(ms=>setTimeout(run,ms))}
if(document.readyState==="complete")setTimeout(start,1500);else addEventListener("load",()=>setTimeout(start,1500));
window.gfBookRelief={YEAR,strength,feats,patch:patchAll};
})();
