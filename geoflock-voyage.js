/* The Voyage: the route around the world drawn as an old paper sea chart.
   - 15 legs, mostly at sea: 7 ports (one per continent, then home to Lisbon) and 8 ocean passages between them
   - a port is done when its landfall tour and its charting quests are done; a passage is done when its tour is done.
     The first unfinished leg and the one after it are open, so the next leg can be started early, and once a leg is done the one after next opens too
   - the chart grows as you go: a coast nobody has reached is a pencil sketch marked "Terra Incognita"; landfall inks the coast
     and its water-lines; charting draws the rivers, lakes and hills from the Landforms data; a finished continent is washed in colour,
     its countries named and its port sealed
   - port quests reuse the stops of the old route (journeyStart / journeyState().done), tours use psLaunchTour / stats.tourProg
   - replaces the "Your route around the world" overlay (twOpen) and its Home section, not the Home page */
(function(){
"use strict";
if(typeof d3==="undefined"||typeof topojson==="undefined"||typeof PROJ_WORLD==="undefined")return;

/* ---------- the legs ---------- */
const LEGS=[
 {t:"port",name:"Lisbon",cont:"Europe",at:[-9.14,38.71],land:"eu-tour",req:["eu-find","eu-flag","eu-cap","eu-tv"],tre:["sp-proj","eu-fp","eu-shape","tour:heurope"],
  blurb:"The voyage begins where the great age of sail began: the Tagus, Lisbon. Chart Europe before you put out to sea."},
 {t:"sea",name:"Down the coast of Africa",tour:"sp-explorers",path:[[-9.14,38.71],[-12,32],[-19,22],[-20,12],[-12,2],[0,-6],[6,-16],[12,-28],[18.42,-33.92]],
  blurb:"Follow the explorers who crept down this coast for most of a century before rounding the Cape."},
 {t:"port",name:"Cape Town",cont:"Africa",at:[18.42,-33.92],land:"af-tour",req:["af-find","af-flag","af-cap","af-tv"],tre:["af-fp","sp-animals","tour:hafrica"],
  blurb:"The Cape of Good Hope, where the Atlantic meets the Indian Ocean. Chart Africa, the second largest continent."},
 {t:"sea",name:"Across the South Atlantic",tour:"tour:seas",path:[[18.42,-33.92],[10,-37],[-10,-33],[-30,-27],[-43.17,-22.91]],
  blurb:"The westerlies carry you across the widest open water you have seen so far. Learn the world's seas on the way."},
 {t:"port",name:"Rio de Janeiro",cont:"South America",at:[-43.17,-22.91],land:"sa-tour",req:["sa-find","am-flag"],tre:["tour:hsamerica"],
  blurb:"Guanabara Bay, under Sugarloaf Mountain. Chart South America, from the Andes to the Amazon."},
 {t:"sea",name:"Through the Caribbean and up the Gulf Stream",tour:"tour:islands",path:[[-43.17,-22.91],[-37,-14],[-34,-6],[-40,2],[-50,8],[-60,13],[-68,15.5],[-74,19.6],[-75,24],[-73,30],[-71,36],[-74,40.5]],
  blurb:"Island-hop through the Antilles, then ride the warm Gulf Stream north. A passage for learning islands."},
 {t:"port",name:"New York",cont:"North America",at:[-74,40.7],land:"na-tour",req:["na-find","am-cap","am-tv"],tre:["am-fp","t-atlantic","sp-food","tour:hnamerica"],
  blurb:"The harbour of New York. Chart North America, from the Arctic islands to Panama."},
 {t:"sea",name:"Through Panama and across the Pacific",tour:"sp-time",path:[[-74,40.5],[-71,34],[-72,24],[-74,19.6],[-78,14],[-79.6,9.3],[-80,6],[-95,-2],[-120,-12],[-149.5,-17.5],[-175,-21],[170,-27],[158,-31],[151.21,-33.87]],
  blurb:"Through the canal and into the largest ocean on Earth, crossing a date line and a dozen time zones."},
 {t:"port",name:"Sydney",cont:"Oceania",at:[151.21,-33.87],land:"oc-tour",req:["oc-find","oc-flag","oc-cap","oc-tv"],tre:["oc-fp","sp-time","tour:hoceania"],
  blurb:"Port Jackson. Chart Australia and the islands of the Pacific."},
 {t:"sea",name:"Into the Southern Ocean",tour:"tour:climate",path:[[151.21,-33.87],[156,-42],[165,-52],[172,-64],[170,-72],[166.67,-77.6]],
  blurb:"South into the Roaring Forties and the Furious Fifties, where climate is not an abstract idea."},
 {t:"port",name:"McMurdo Sound",cont:"Antarctica",at:[166.67,-77.6],land:"tour:antarctica",req:[],tre:["tour:hantarctica"],
  blurb:"The edge of the ice. Chart the one continent with no countries."},
 {t:"sea",name:"Across the Indian Ocean on the monsoon",tour:"tour:transport",path:[[166.67,-77.6],[160,-66],[130,-55],[100,-44],[84,-28],[76,-10],[70,5],[72.6,18.6]],
  blurb:"North with the monsoon winds that traders have used for two thousand years."},
 {t:"port",name:"Mumbai",cont:"Asia",at:[72.88,19.08],land:"as-tour",req:["as-find","as-flag","as-cap","as-tv"],tre:["as-fp","sp-globle","sp-plates","t-eurasia","tour:hasia"],
  blurb:"The harbour of Mumbai. Chart Asia, the largest continent of all."},
 {t:"sea",name:"Home by the Red Sea and Suez",tour:"tour:hancient",path:[[72.6,18.6],[64,15],[55,13],[50,12.4],[43.4,12.6],[38.5,19],[34.4,26.5],[32.55,29.9],[32.3,31.4],[26,34],[16,36],[11.6,37.3],[4,37.8],[-2,36.3],[-5.6,35.95],[-9,36.6],[-9.14,38.71]],
  blurb:"Up the Red Sea, through the canal and along the Mediterranean: the shores of the first civilisations."},
 {t:"port",name:"Lisbon again: the whole world",cont:"World",at:[-9.14,38.71],mark:[-19,41.5],land:"c-tour",req:["t-world"],tre:["w-tour","w-find","w-flag","w-cap","w-shape","w-tv","w-fp","c-find","c-flag","c-cap","c-tv","c-fp","sp-flags"],
  blurb:"Home, with the whole world charted. One last test puts your name on the chart."}
];
const CONTS=["Europe","Africa","South America","North America","Oceania","Antarctica","Asia"];
const CONT_LEG={};LEGS.forEach((L,i)=>{if(L.t==="port"&&L.cont!=="World")CONT_LEG[L.cont]=i});
const WASH={"Europe":"#d48b6e","Africa":"#d6ae52","Asia":"#93ad6d","North America":"#bd8fb0","South America":"#86ad94","Oceania":"#cf9a62","Antarctica":"#9fb6c8"};
const CLABEL={"Europe":[16,53],"Africa":[20,6],"Asia":[92,46],"North America":[-102,47],"South America":[-60,-13],"Oceania":[134,-25],"Antarctica":[40,-80]};

/* ---------- progress ---------- */
const st=()=>{try{const V=stats.voyage=stats.voyage||{};if(!Array.isArray(V.seen))V.seen=[];return V}catch(e){return{seen:[]}}};
const save=()=>{try{saveStats()}catch(e){}};
const twIdx=id=>{try{return TW3_STOPS.findIndex(s=>s.id===id)}catch(e){return-1}};
const tourDone=k=>{try{const p=(stats.tourProg||{})[k];return!!(p&&p.done)}catch(e){return false}};
function qDone(q){
 if(q.startsWith("tour:"))return tourDone(q.slice(5));
 const i=twIdx(q);if(i<0)return false;
 let J;try{J=journeyState().done}catch(e){J={}}
 if(J[i])return true;const s=TW3_STOPS[i];return!!(s&&s.k==="tour"&&s.tour&&tourDone(s.tour));
}
function qLabel(q){
 if(q.startsWith("tour:")){const T=typeof PS_TOURS!=="undefined"&&PS_TOURS[q.slice(5)];return T?(T.name||q):q.slice(5)}
 const i=twIdx(q);if(i<0)return q;const s=TW3_STOPS[i];
 if(s.k==="tour"&&s.tour&&PS_TOURS[s.tour])return PS_TOURS[s.tour].name;
 return s.label||q;
}
function qKind(q){if(q.startsWith("tour:"))return"tour";const i=twIdx(q);return i<0?"":TW3_STOPS[i].k}
const qOK=q=>q.startsWith("tour:")?!!(typeof PS_TOURS!=="undefined"&&PS_TOURS[q.slice(5)]):twIdx(q)>=0;
const firstQ=L=>L.t==="sea"?L.tour:L.land;
function legDone(i){const L=LEGS[i];if(L.t==="sea")return!qOK(L.tour)||qDone(L.tour);return(!qOK(L.land)||qDone(L.land))&&L.req.filter(qOK).every(qDone)}
function legParts(i){const L=LEGS[i];const all=[firstQ(L)].concat(L.req||[]).filter(qOK);return[all.filter(qDone).length,all.length]}
function treasures(i){const L=LEGS[i];const t=(L.tre||[]).filter(qOK);return[t.filter(qDone).length,t.length]}
function firstOpen(){for(let i=0;i<LEGS.length;i++)if(!legDone(i))return i;return LEGS.length}
const isOpen=i=>legDone(i)||i<=firstOpen()+1;
/* the look of each continent: 0 uncharted, 1 landfall inked, 2 half charted, 3 finished */
function contLevel(c){const i=CONT_LEG[c];if(i==null)return 0;const L=LEGS[i];
 if(!(!qOK(L.land)||qDone(L.land)))return 0;if(legDone(i))return 3;
 const r=L.req.filter(qOK);return r.length&&r.filter(qDone).length*2>=r.length?2:1}

/* ---------- geography, built once ---------- */
const EXTRA={ru:"Asia",kz:"Asia",tr:"Asia",gl:"North America",eh:"Africa",tw:"Asia",mo:"Asia",hk:"Asia",io:"Asia",je:"Europe",gg:"Europe",im:"Europe",ax:"Europe",fo:"Europe",sh:"Africa",re:"Africa",yt:"Africa",gf:"South America",fk:"South America",gs:"South America",tf:"Antarctica",hm:"Antarctica",bv:"Antarctica",aq:"Antarctica",pm:"North America",bm:"North America"};
let G=null;
function geo(){if(G)return G;
 const obj=PROJ_WORLD.objects.countries,feats=topojson.feature(PROJ_WORLD,obj).features;
 const contOf=f=>{const c=f.properties.c;if(EXTRA[c])return EXTRA[c];const t=typeof TV_CONT_OF!=="undefined"&&TV_CONT_OF[c];if(t&&t[0])return t[0];
  const[x,y]=d3.geoCentroid(f);if(y<-60)return"Antarctica";if((x>130||x<-120)&&y<25)return"Oceania";if(x<-30)return y>11?"North America":"South America";if(x<60)return y>35?"Europe":"Africa";return"Asia"};
 const by={};obj.geometries.forEach((g,i)=>{const c=contOf(feats[i]);g._vc=c;(by[c]=by[c]||[]).push(i)});
 G={feats,cont:{}};
 CONTS.forEach(C=>{const ix=by[C]||[];G.cont[C]={
  land:topojson.merge(PROJ_WORLD,ix.map(i=>obj.geometries[i])),
  borders:topojson.mesh(PROJ_WORLD,obj,(a,b)=>a!==b&&a._vc===C&&b._vc===C),
  countries:ix.map(i=>feats[i]),rivers:[],lakes:[],hills:[]}});
 G.all={type:"FeatureCollection",features:CONTS.map(C=>({type:"Feature",geometry:G.cont[C].land}))};
 const rings=g=>g.t==="poly"?{type:"Polygon",coordinates:g.c}:g.t==="mpoly"?{type:"MultiPolygon",coordinates:g.c}:null;
 try{LANDFORMS.items.forEach(it=>{const C=G.cont[it.region];if(!C||!it.geom)return;
  if(it.cat==="rivers"&&it.geom.t==="line")C.rivers.push({type:"MultiLineString",coordinates:it.geom.c});
  else if(it.cat==="lakes"){const g=rings(it.geom);if(g)C.lakes.push(g)}
  else if(it.cat==="ranges"){const g=rings(it.geom);if(!g)return;const f={type:"Feature",geometry:g},[[x0,y0],[x1,y1]]=d3.geoBounds(f);
   const step=Math.max(.9,Math.min(2.2,Math.sqrt((x1-x0)*(y1-y0))/9));
   for(let y=y0+step/2;y<y1;y+=step)for(let x=x0+step/2;x<x1;x+=step*1.3){const p=[x+((y*7)%1)*step*.4,y];if(d3.geoContains(f,p))C.hills.push(p)}}
 })}catch(e){console.error(e)}
 return G}

/* ---------- drawing ---------- */
const INK="#3a2a18",RED="#9c2b1c",PENCIL="rgba(92,78,58,",SEA_INK="rgba(64,92,112,";
const FONT='"IM Fell English","Iowan Old Style","Palatino Linotype",Georgia,serif',FONT_SC='"IM Fell English SC","IM Fell English",Georgia,serif';
let paperImg=null,paperOK=false;
function loadPaper(cb){if(paperImg){if(paperOK)cb();else paperImg.addEventListener("load",cb,{once:true});return}
 paperImg=new Image();paperImg.onload=()=>{paperOK=true;cb()};paperImg.src="textures/PAPER.webp"}
let hatch=null;
function hatchPat(ctx){if(hatch)return ctx.createPattern(hatch,"repeat");hatch=document.createElement("canvas");hatch.width=hatch.height=7;
 const h=hatch.getContext("2d");h.strokeStyle="rgba(92,78,58,.16)";h.lineWidth=.7;h.beginPath();h.moveTo(0,7);h.lineTo(7,0);h.moveTo(-1,1);h.lineTo(1,-1);h.moveTo(6,8);h.lineTo(8,6);h.stroke();return ctx.createPattern(hatch,"repeat")}
function rnd(seed){let s=seed>>>0||1;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}
let tmp=null;
function waterLines(ctx,path,geom,W,H,k){
 /* rings of thin lines following the coast, the way engravers shaded water near the land */
 const dpr=ctx.canvas.width/W;
 if(!tmp)tmp=document.createElement("canvas");if(tmp.width!==ctx.canvas.width||tmp.height!==ctx.canvas.height){tmp.width=ctx.canvas.width;tmp.height=ctx.canvas.height}
 const t=tmp.getContext("2d");t.setTransform(1,0,0,1,0,0);t.clearRect(0,0,tmp.width,tmp.height);t.setTransform(dpr,0,0,dpr,0,0);t.lineJoin="round";
 const p=path.context(t);const D=[2.6,5.4,8.6,12.4],A=[.55,.4,.27,.16];
 D.forEach((d,j)=>{t.globalCompositeOperation="source-over";t.strokeStyle=SEA_INK+A[j]+")";t.lineWidth=2*d+.9;t.beginPath();p(geom);t.stroke();
  t.globalCompositeOperation="destination-out";t.strokeStyle="#000";t.lineWidth=2*d-.9;t.beginPath();p(geom);t.stroke()});
 t.globalCompositeOperation="destination-out";t.fillStyle="#000";t.beginPath();p(geom);t.fill();t.globalCompositeOperation="source-over";
 path.context(ctx);ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(tmp,0,0);ctx.restore();
}
function rose(ctx,x,y,r,main){
 ctx.save();ctx.translate(x,y);
 /* rhumb lines: 32 from each rose, as on a portolan chart */
 if(main!==false){for(let i=0;i<32;i++){const a=i*Math.PI/16;ctx.strokeStyle=i%4===0?"rgba(58,42,24,.17)":i%2?"rgba(156,43,28,.10)":"rgba(70,110,70,.11)";ctx.lineWidth=i%4===0?.8:.6;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*3000,Math.sin(a)*3000);ctx.stroke()}}
 ctx.fillStyle="rgba(244,233,206,.92)";ctx.beginPath();ctx.arc(0,0,r*.98,0,7);ctx.fill();
 ctx.strokeStyle=INK;ctx.lineWidth=.9;[1,.86,.3].forEach(f=>{ctx.beginPath();ctx.arc(0,0,r*f,0,7);ctx.stroke()});
 for(let i=0;i<32;i++){const a=i*Math.PI/16,l=i%2?.92:.86;ctx.beginPath();ctx.moveTo(Math.cos(a)*r*l,Math.sin(a)*r*l);ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);ctx.stroke()}
 const pt=(n,len,wid,c1,c2,off)=>{for(let i=0;i<n;i++){const a=off+i*2*Math.PI/n,b1=a-Math.PI/n*wid,b2=a+Math.PI/n*wid,w=len*.22;
  const tip=[Math.cos(a)*len,Math.sin(a)*len],l=[Math.cos(b1)*w,Math.sin(b1)*w],rr=[Math.cos(b2)*w,Math.sin(b2)*w];
  ctx.fillStyle=c1;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(l[0],l[1]);ctx.lineTo(tip[0],tip[1]);ctx.closePath();ctx.fill();
  ctx.fillStyle=c2;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(rr[0],rr[1]);ctx.lineTo(tip[0],tip[1]);ctx.closePath();ctx.fill();
  ctx.strokeStyle=INK;ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(l[0],l[1]);ctx.lineTo(tip[0],tip[1]);ctx.lineTo(rr[0],rr[1]);ctx.stroke()}};
 pt(8,r*.62,.5,"#e9dcb8","#6b8a62",Math.PI/8);pt(4,r*.9,.5,"#f3ead2",INK,-Math.PI/2);
 /* fleur-de-lis for north, simplified */
 ctx.fillStyle=RED;ctx.beginPath();ctx.moveTo(0,-r*1.18);ctx.quadraticCurveTo(r*.12,-r*1.04,0,-r*.94);ctx.quadraticCurveTo(-r*.12,-r*1.04,0,-r*1.18);ctx.fill();
 ctx.fillStyle=INK;ctx.beginPath();ctx.arc(0,0,r*.06,0,7);ctx.fill();
 ctx.restore()}
function ship(ctx,x,y,s,dir){
 ctx.save();ctx.translate(x,y);ctx.scale(dir<0?-s:s,s);ctx.lineJoin="round";ctx.lineCap="round";
 ctx.fillStyle="#6b4a2c";ctx.strokeStyle=INK;ctx.lineWidth=1/s*1.1;
 ctx.beginPath();ctx.moveTo(-11,1);ctx.lineTo(11,1);ctx.quadraticCurveTo(9,6,5,6.5);ctx.lineTo(-7,6.5);ctx.quadraticCurveTo(-10,5,-11,1);ctx.closePath();ctx.fill();ctx.stroke();
 ctx.beginPath();ctx.moveTo(-1,1);ctx.lineTo(-1,-15);ctx.moveTo(6,1);ctx.lineTo(6,-10);ctx.moveTo(11,1);ctx.lineTo(16,-3);ctx.stroke();
 ctx.fillStyle="#f6eedb";
 [[-1,-14.5,-1,-3,7],[6,-9.5,6,-2,5]].forEach(([x0,y0,x1,y1,w])=>{ctx.beginPath();ctx.moveTo(x0-w,y0+1);ctx.quadraticCurveTo(x0,y0-1,x0+w,y0+1);ctx.quadraticCurveTo(x0+w+1.5,(y0+y1)/2,x1+w,y1);ctx.lineTo(x1-w,y1);ctx.quadraticCurveTo(x0-w+1.5,(y0+y1)/2,x0-w,y0+1);ctx.closePath();ctx.fill();ctx.stroke()});
 ctx.fillStyle=RED;ctx.beginPath();ctx.moveTo(-1,-15);ctx.lineTo(4,-16.5);ctx.lineTo(-1,-18);ctx.closePath();ctx.fill();
 ctx.strokeStyle=SEA_INK+".7)";ctx.lineWidth=1/s;ctx.beginPath();ctx.moveTo(-14,8);ctx.quadraticCurveTo(-10,6.5,-6,8);ctx.moveTo(4,8.5);ctx.quadraticCurveTo(8,7,13,8.5);ctx.stroke();
 ctx.restore()}
function serpent(ctx,x,y,s){
 ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.strokeStyle=INK;ctx.lineWidth=1.1/s;ctx.lineCap="round";ctx.fillStyle="rgba(107,138,98,.55)";
 /* three humps and a head out of the water */
 [[-30,0,8],[-12,0,9],[6,0,7]].forEach(([hx,hy,r])=>{ctx.beginPath();ctx.moveTo(hx-r,hy);ctx.bezierCurveTo(hx-r,hy-r*1.6,hx+r,hy-r*1.6,hx+r,hy);ctx.lineTo(hx+r-3,hy);ctx.bezierCurveTo(hx+r-3,hy-r*1.05,hx-r+3,hy-r*1.05,hx-r+3,hy);ctx.closePath();ctx.fill();ctx.stroke()});
 ctx.beginPath();ctx.moveTo(16,0);ctx.bezierCurveTo(17,-12,22,-20,30,-20);ctx.quadraticCurveTo(37,-19,38,-14);ctx.lineTo(31,-13);ctx.quadraticCurveTo(26,-12,23,-4);ctx.lineTo(21,0);ctx.closePath();ctx.fill();ctx.stroke();
 ctx.beginPath();ctx.moveTo(-40,-2);ctx.quadraticCurveTo(-44,-9,-39,-12);ctx.quadraticCurveTo(-41,-7,-36,-4);ctx.stroke();
 ctx.fillStyle=INK;ctx.beginPath();ctx.arc(31,-17,1.1,0,7);ctx.fill();
 ctx.strokeStyle=SEA_INK+".6)";[[-42,3],[-20,3],[0,3],[20,3]].forEach(([a,b])=>{ctx.beginPath();ctx.moveTo(a,b);ctx.quadraticCurveTo(a+5,b-2,a+10,b);ctx.stroke()});
 ctx.restore()}
function whale(ctx,x,y,s){
 ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.strokeStyle=INK;ctx.lineWidth=1/s;ctx.fillStyle="rgba(96,112,124,.45)";
 ctx.beginPath();ctx.moveTo(-18,0);ctx.bezierCurveTo(-16,-9,8,-11,16,-3);ctx.quadraticCurveTo(19,0,15,1);ctx.lineTo(-14,1);ctx.closePath();ctx.fill();ctx.stroke();
 ctx.beginPath();ctx.moveTo(-17,-1);ctx.lineTo(-24,-7);ctx.lineTo(-23,-1);ctx.lineTo(-25,4);ctx.closePath();ctx.fill();ctx.stroke();
 ctx.beginPath();ctx.moveTo(9,-8);ctx.quadraticCurveTo(8,-15,4,-18);ctx.moveTo(9,-8);ctx.quadraticCurveTo(10,-16,14,-18);ctx.stroke();
 ctx.fillStyle=INK;ctx.beginPath();ctx.arc(11,-3,.9,0,7);ctx.fill();ctx.restore()}
function seal(ctx,x,y,r){
 ctx.save();ctx.translate(x,y);const R=rnd(Math.round(x*7+y*13));
 ctx.fillStyle="#9e2418";ctx.beginPath();for(let i=0;i<=20;i++){const a=i/20*Math.PI*2,rr=r*(1+(R()-.5)*.22);i?ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr):ctx.moveTo(Math.cos(a)*rr,Math.sin(a)*rr)}ctx.closePath();ctx.fill();
 ctx.strokeStyle="rgba(255,210,190,.45)";ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,r*.68,0,7);ctx.stroke();
 ctx.fillStyle="rgba(255,220,200,.7)";ctx.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.22:r*.5;i?ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr):ctx.moveTo(Math.cos(a)*rr,Math.sin(a)*rr)}ctx.closePath();ctx.fill();
 ctx.fillStyle="rgba(255,255,255,.18)";ctx.beginPath();ctx.arc(-r*.3,-r*.35,r*.35,0,7);ctx.fill();ctx.restore()}
function spaced(ctx,txt,x,y,sp){const w=[...txt].reduce((a,c)=>a+ctx.measureText(c).width+sp,0)-sp;let cx=x-w/2;
 const al=ctx.textAlign;ctx.textAlign="left";[...txt].forEach(c=>{ctx.fillText(c,cx,y);cx+=ctx.measureText(c).width+sp});ctx.textAlign=al}
function cartouche(ctx,x,y,w,h,lines){
 ctx.save();ctx.fillStyle="rgba(246,236,210,.93)";ctx.strokeStyle=INK;
 const sc=12;ctx.beginPath();ctx.moveTo(x+sc,y);ctx.lineTo(x+w-sc,y);ctx.quadraticCurveTo(x+w-sc,y+sc,x+w,y+sc);ctx.lineTo(x+w,y+h-sc);ctx.quadraticCurveTo(x+w-sc,y+h-sc,x+w-sc,y+h);ctx.lineTo(x+sc,y+h);ctx.quadraticCurveTo(x+sc,y+h-sc,x,y+h-sc);ctx.lineTo(x,y+sc);ctx.quadraticCurveTo(x+sc,y+sc,x+sc,y);ctx.closePath();
 ctx.fill();ctx.lineWidth=1.6;ctx.stroke();
 ctx.lineWidth=.6;ctx.strokeRect(x+sc+3,y+5,w-2*sc-6,h-10);
 /* scroll curls at the corners */
 [[x,y,1,1],[x+w,y,-1,1],[x,y+h,1,-1],[x+w,y+h,-1,-1]].forEach(([cx,cy,sx,sy])=>{ctx.beginPath();ctx.arc(cx+sx*sc*.5,cy+sy*sc*.5,sc*.32,0,7);ctx.stroke()});
 ctx.fillStyle=INK;ctx.textAlign="center";ctx.textBaseline="alphabetic";
 let yy=y+12;lines.forEach(([txt,size,font,col,gap])=>{yy+=size+(gap||4);const it=font.startsWith("italic ");ctx.font=(it?"italic ":"")+size+"px "+(it?font.slice(7):font);ctx.fillStyle=col||INK;ctx.fillText(txt,x+w/2,yy)});
 ctx.restore()}

function draw(cv,opt){
 opt=opt||{};const W=cv._w,H=cv._h,ctx=cv.getContext("2d"),dpr=cv.width/W,g=geo();
 const k=opt.k||1,proj=projFor(W,H,opt.tr),narrow=W<600;const path=d3.geoPath(proj,ctx);
 ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
 /* paper */
 ctx.fillStyle="#efe2c2";ctx.fillRect(0,0,W,H);
 if(paperOK){ctx.save();ctx.globalAlpha=.95;ctx.fillStyle=ctx.createPattern(paperImg,"repeat");ctx.fillRect(0,0,W,H);ctx.restore()}
 const sphere={type:"Sphere"};
 ctx.save();ctx.beginPath();path(sphere);ctx.clip();
 ctx.fillStyle="rgba(196,214,214,.20)";ctx.fillRect(0,0,W,H);
 ctx.strokeStyle="rgba(92,72,46,.16)";ctx.lineWidth=.6;ctx.beginPath();path(d3.geoGraticule().step([15,15])());ctx.stroke();
 ctx.strokeStyle="rgba(156,43,28,.28)";ctx.setLineDash([5,4]);ctx.lineWidth=.8;
 [[23.44],[-23.44],[0]].forEach(([la])=>{ctx.beginPath();path({type:"LineString",coordinates:d3.range(-180,181,5).map(x=>[x,la])});ctx.stroke()});ctx.setLineDash([]);
 /* compass roses and their rhumb lines */
 const R1=proj([-27,-47]),R2=proj([60,-46]),R3=proj([-150,32]);
 const rs=Math.max(18,Math.min(54,W/26))*Math.sqrt(k);
 if(!opt.mini){rose(ctx,R1[0],R1[1],rs,true);rose(ctx,R2[0],R2[1],rs*.62,true);rose(ctx,R3[0],R3[1],rs*.62,true)}
 /* land */
 const lv={};CONTS.forEach(C=>lv[C]=contLevel(C));
 const hp=hatchPat(ctx);
 CONTS.forEach(C=>{const L=g.cont[C],l=lv[C];
  if(l===0){ctx.fillStyle="rgba(239,228,198,.55)";ctx.beginPath();path(L.land);ctx.fill();ctx.fillStyle=hp;ctx.fill();}
  else{ctx.fillStyle="rgba(247,238,214,.75)";ctx.beginPath();path(L.land);ctx.fill()}});
 if(!opt.fast)CONTS.forEach(C=>{if(lv[C]>0)waterLines(ctx,path,g.cont[C].land,W,H,k)});
 CONTS.forEach(C=>{const L=g.cont[C],l=lv[C];
  if(l===3){ctx.save();ctx.beginPath();path(L.land);ctx.clip();ctx.globalAlpha=.30;ctx.fillStyle=WASH[C];ctx.fill();
   ctx.globalAlpha=.32;ctx.strokeStyle=WASH[C];ctx.lineWidth=7;ctx.stroke();ctx.restore();
   ctx.strokeStyle="rgba(58,42,24,.55)";ctx.lineWidth=.6;ctx.setLineDash([2.5,2]);ctx.beginPath();path(L.borders);ctx.stroke();ctx.setLineDash([])}
  if(l>=2){
   ctx.fillStyle="rgba(122,154,172,.45)";ctx.strokeStyle=SEA_INK+".8)";ctx.lineWidth=.6;L.lakes.forEach(x=>{ctx.beginPath();path(x);ctx.fill();ctx.stroke()});
   ctx.strokeStyle=SEA_INK+".85)";ctx.lineWidth=.85;ctx.lineJoin="round";L.rivers.forEach(x=>{ctx.beginPath();path(x);ctx.stroke()});
   const s=Math.max(2.2,Math.min(6,2.6*Math.sqrt(k)*W/1100));ctx.lineWidth=.75;
   const taken=new Set(),cell=s*2.6;
   L.hills.forEach(p=>{const q=proj(p);if(!q||q[0]<-9||q[1]<-9||q[0]>W+9||q[1]>H+9)return;const[x,y]=q;
    /* one hill per patch of screen, so ranges read as hills and not as smudges */
    const key=Math.round(x/cell)+","+Math.round(y/(cell*.8));if(taken.has(key))return;taken.add(key);
    ctx.fillStyle="rgba(140,110,70,.25)";ctx.beginPath();ctx.moveTo(x,y-s*1.1);ctx.quadraticCurveTo(x+s*.5,y-s*.2,x+s,y+s*.3);ctx.lineTo(x,y+s*.3);ctx.closePath();ctx.fill();
    ctx.strokeStyle=INK;ctx.beginPath();ctx.moveTo(x-s,y+s*.3);ctx.quadraticCurveTo(x-s*.35,y-s*.4,x,y-s*1.1);ctx.quadraticCurveTo(x+s*.4,y-s*.4,x+s,y+s*.3);ctx.stroke()})}
  ctx.lineJoin="round";
  if(l===0){ctx.strokeStyle=PENCIL+".62)";ctx.lineWidth=.75;ctx.beginPath();path(L.land);ctx.stroke();
   ctx.save();ctx.translate(.7,.5);ctx.strokeStyle=PENCIL+".22)";ctx.lineWidth=.6;ctx.beginPath();path(L.land);ctx.stroke();ctx.restore()}
  else{ctx.strokeStyle=INK;ctx.lineWidth=l===3?1.25:1.05;ctx.beginPath();path(L.land);ctx.stroke()}});
 /* names */
 ctx.textAlign="center";ctx.textBaseline="middle";
 const big=Math.max(11,Math.min(26,W/58))*Math.min(1.8,Math.sqrt(k));
 CONTS.forEach(C=>{const l=lv[C],p=proj(CLABEL[C]);if(!p)return;
  if(l===0){if(opt.mini)return;ctx.font="italic "+(big*.82)+"px "+FONT;ctx.fillStyle="rgba(92,78,58,.62)";ctx.fillText("Terra Incognita",p[0],p[1]);return}
  if(l===3&&!opt.mini){const fs=Math.max(8.5,Math.min(15,W/110))*Math.min(2.2,Math.sqrt(k));
   ctx.fillStyle="rgba(58,42,24,.82)";
   g.cont[C].countries.forEach(f=>{const a=path.area(f);if(a<fs*fs*9)return;const cc=typeof COUNTRY_CENTROIDS!=="undefined"&&COUNTRY_CENTROIDS[f.properties.c];
    const q=cc?proj([cc[1],cc[0]]):path.centroid(f);if(!q||isNaN(q[0]))return;const big2=a>fs*fs*80;
    ctx.font=(big2?"":"italic ")+(big2?fs*1.05:fs*.9)+"px "+(big2?FONT_SC:FONT);ctx.fillText(f.properties.n,q[0],q[1])})}
  ctx.font=big+"px "+FONT_SC;ctx.fillStyle=l===3?"rgba(58,42,24,.42)":"rgba(58,42,24,.85)";spaced(ctx,C.toUpperCase(),p[0],l===3?p[1]-big*1.1:p[1],big*.28)});
 if(!opt.mini&&(!narrow||k>1.6)){ctx.font="italic "+(big*.95)+"px "+FONT;ctx.fillStyle="rgba(52,78,96,.62)";
  [["Atlantic Ocean",[-38,28]],["Pacific Ocean",[-138,4]],["Pacific Ocean",[168,12]],["Indian Ocean",[62,-22]],["Southern Ocean",[-60,-60]],["Arctic Ocean",[30,82]]].forEach(([t,c])=>{const p=proj(c);if(p)spaced(ctx,t,p[0],p[1],big*.24)})}
 /* decoration at sea */
 if(!opt.mini){const sp=proj([-122,-36]);serpent(ctx,sp[0],sp[1],Math.max(.55,W/1500)*Math.sqrt(k));
  ctx.font="italic "+(big*.72)+"px "+FONT;ctx.fillStyle="rgba(58,42,24,.6)";ctx.fillText("Here be dragons",sp[0],sp[1]+big*1.5);
  const wp=proj([-40,48]);whale(ctx,wp[0],wp[1],Math.max(.55,W/1600)*Math.sqrt(k));
  const sp2=proj([88,-12]);ship(ctx,sp2[0],sp2[1],Math.max(.5,W/2200)*Math.sqrt(k),-1)}
 /* the route */
 const fo=firstOpen(),scl=Math.max(.8,Math.min(1.5,W/1000));
 LEGS.forEach((L,i)=>{if(L.t!=="sea")return;const done=legDone(i),open=isOpen(i);
  ctx.lineCap="round";ctx.lineWidth=(done?2.1:1.6)*scl;ctx.strokeStyle=done?RED:open?"rgba(156,43,28,.72)":PENCIL+".55)";ctx.setLineDash(done?[7*scl,4.5*scl]:[1,5*scl]);
  if(opt.sel===i){ctx.save();ctx.setLineDash([]);ctx.strokeStyle="rgba(214,170,60,.45)";ctx.lineWidth=9*scl;ctx.beginPath();path({type:"LineString",coordinates:L.path});ctx.stroke();ctx.restore()}
  ctx.beginPath();path({type:"LineString",coordinates:L.path});ctx.stroke()});ctx.setLineDash([]);
 /* ports */
 const pts=[];
 LEGS.forEach((L,i)=>{if(L.t!=="port")return;const p=proj(L.mark||L.at);if(!p)return;pts.push([i,p[0],p[1]]);const done=legDone(i),open=isOpen(i),r=(opt.mini?5:7.5)*scl;
  if(opt.sel===i){ctx.fillStyle="rgba(214,170,60,.45)";ctx.beginPath();ctx.arc(p[0],p[1],r*2.1,0,7);ctx.fill()}
  if(L.cont==="World"){ctx.save();ctx.translate(p[0],p[1]);ctx.fillStyle=done?"#c9a23a":open?"#f3e7c6":"rgba(243,231,198,.6)";ctx.strokeStyle=done?"#6b4a12":open?INK:PENCIL+".6)";ctx.lineWidth=1;
   ctx.beginPath();for(let j=0;j<16;j++){const a=-Math.PI/2+j*Math.PI/8,rr=j%2?r*.5:r*1.25;j?ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr):ctx.moveTo(Math.cos(a)*rr,Math.sin(a)*rr)}ctx.closePath();ctx.fill();ctx.stroke();ctx.restore()}
  else if(done)seal(ctx,p[0],p[1],r*1.15);
  else{ctx.fillStyle=open?"#f6edd6":"rgba(243,231,198,.7)";ctx.strokeStyle=open?INK:PENCIL+".6)";ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(p[0],p[1],r,0,7);ctx.fill();ctx.stroke();
   ctx.beginPath();ctx.arc(p[0],p[1],r*.55,0,7);ctx.lineWidth=.7;ctx.stroke();
   ctx.fillStyle=open?RED:PENCIL+".7)";ctx.beginPath();ctx.arc(p[0],p[1],r*.22,0,7);ctx.fill()}
  if(!opt.mini){const[tf,tn]=treasures(i);if(tn&&open&&L.cont!=="World"){const x=p[0]+r*1.9,y=p[1]-r*1.5,s=r*.62;ctx.strokeStyle=tf===tn?"#b58a1a":RED;ctx.lineWidth=2*scl;ctx.lineCap="round";
    ctx.beginPath();ctx.moveTo(x-s,y-s);ctx.lineTo(x+s,y+s);ctx.moveTo(x+s,y-s);ctx.lineTo(x-s,y+s);ctx.stroke()}
   ctx.font="italic "+Math.round(12.5*scl)+"px "+FONT;ctx.fillStyle=open?INK:PENCIL+".75)";ctx.textAlign="center";ctx.textBaseline="top";
   const nm=L.cont==="World"?"Home":L.name;if(!narrow||open||k>1.6)ctx.fillText(nm,p[0],p[1]+r+3)}});
 /* the ship sits at the first unfinished leg */
 if(fo<LEGS.length){const L=LEGS[fo];let a,b;
  if(L.t==="port"){a=proj(L.mark||L.at);b=null}else{a=proj(L.path[0]);b=proj(L.path[1])}
  if(a){const dir=b?(b[0]>=a[0]?1:-1):1;ship(ctx,a[0]+(L.t==="port"?-24*scl:10*scl*dir),a[1]-(L.t==="port"?20:16)*scl,(opt.mini?.75:1.05)*scl*Math.min(1.6,Math.sqrt(k)),dir)}}
 ctx.restore();
 /* sphere outline: a double neat line */
 ctx.strokeStyle=INK;ctx.lineWidth=1.4;ctx.beginPath();path(sphere);ctx.stroke();
 /* sheet edge: vignette, foxing, folds */
 const vg=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*.35,W/2,H/2,Math.max(W,H)*.75);vg.addColorStop(0,"rgba(120,80,30,0)");vg.addColorStop(1,"rgba(110,70,25,.30)");ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
 const R=rnd(7);for(let i=0;i<(opt.mini?3:7);i++){const x=R()*W,y=R()*H,r=(20+R()*70)*(W/1100);const gr=ctx.createRadialGradient(x,y,r*.2,x,y,r);gr.addColorStop(0,"rgba(150,105,45,.05)");gr.addColorStop(.85,"rgba(150,105,45,.08)");gr.addColorStop(1,"rgba(150,105,45,0)");ctx.fillStyle=gr;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill()}
 [[W/2,0,W/2,H],[0,H/2,W,H/2]].forEach(([x0,y0,x1,y1])=>{const v=x0===x1,gr=v?ctx.createLinearGradient(x0-6,0,x0+6,0):ctx.createLinearGradient(0,y0-6,0,y0+6);
  gr.addColorStop(0,"rgba(255,250,235,0)");gr.addColorStop(.45,"rgba(255,250,235,.20)");gr.addColorStop(.55,"rgba(90,60,25,.10)");gr.addColorStop(1,"rgba(90,60,25,0)");ctx.fillStyle=gr;v?ctx.fillRect(x0-6,0,12,H):ctx.fillRect(0,y0-6,W,12)});
 if(!opt.mini){
  /* frame with alternating degree ticks */
  const f=7;ctx.fillStyle="rgba(58,42,24,.9)";ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.strokeRect(2.5,2.5,W-5,H-5);ctx.strokeRect(2.5+f,2.5+f,W-5-2*f,H-5-2*f);
  const seg=Math.max(30,W/36);for(let x=2.5+f,j=0;x<W-f;x+=seg,j++)if(j%2){const w=Math.min(seg,W-f-2.5-x);ctx.fillRect(x,2.5,w,f);ctx.fillRect(x,H-2.5-f,w,f)}
  for(let y=2.5+f,j=0;y<H-f;y+=seg,j++)if(j%2){const h=Math.min(seg,H-f-2.5-y);ctx.fillRect(2.5,y,f,h);ctx.fillRect(W-2.5-f,y,f,h)}
  /* cartouche and scale */
  const fo2=firstOpen(),dn=LEGS.filter((_,i)=>legDone(i)).length;
  const cw=Math.min(300,W*.36),ch=cw*.42;
  if(!opt.noCart&&!narrow)cartouche(ctx,f+16,H-ch-f-16,cw,ch,[["A Chart of the",cw*.05,"italic "+FONT,INK,0],["WORLD'S SEAS & SHORES",cw*.071,FONT_SC,INK,2],["as sailed by the good ship GeoFlock",cw*.046,"italic "+FONT,"rgba(58,42,24,.8)",4],[dn+" of "+LEGS.length+" legs completed"+(fo2>=LEGS.length?" · voyage complete":""),cw*.046,"italic "+FONT,RED,6]]);
  const k1=proj([0,0]),k2=proj([9,0]);if(k1&&k2&&!narrow){const u=Math.abs(k2[0]-k1[0]),n=Math.max(2,Math.min(5,Math.floor(Math.min(W*.22,240)/u)));
   const x0=W-f-24-u*n,y0=H-f-30;ctx.lineWidth=.8;for(let j=0;j<n;j++){ctx.fillStyle=j%2?"#f2e6c8":INK;ctx.fillRect(x0+j*u,y0,u,5);ctx.strokeRect(x0+j*u,y0,u,5)}
   ctx.fillStyle=INK;ctx.font="italic 11px "+FONT;ctx.textAlign="center";ctx.textBaseline="bottom";ctx.fillText("Scale at the Equator, in thousands of kilometres",x0+u*n/2,y0-3);
   ctx.textBaseline="top";for(let j=0;j<=n;j++)ctx.fillText(String(j),x0+j*u,y0+7)}}
 cv._proj=proj;cv._pts=pts;
}
function projFor(W,H,tr){const pad=Math.max(14,W*.02);const p=d3.geoNaturalEarth1().rotate([-12,0]).precision(.3).fitExtent([[pad,pad+H*.01],[W-pad,H-pad]],{type:"Sphere"});
 if(tr){const s=p.scale(),t=p.translate();p.scale(s*tr.k).translate([t[0]*tr.k+tr.x,t[1]*tr.k+tr.y])}return p}
function sizeCanvas(cv,W,H){const dpr=Math.min(2,window.devicePixelRatio||1);cv._w=W;cv._h=H;cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);cv.style.width=W+"px";cv.style.height=H+"px"}

/* ---------- fonts ---------- */
if(!document.getElementById("gfVoyFont")){const l=document.createElement("link");l.id="gfVoyFont";l.rel="stylesheet";l.href="https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&family=IM+Fell+English+SC&display=swap";document.head.appendChild(l)}
let fontsReady=false;const whenFonts=cb=>{if(fontsReady)return cb();try{Promise.all([document.fonts.load('16px "IM Fell English"'),document.fonts.load('italic 16px "IM Fell English"'),document.fonts.load('16px "IM Fell English SC"')]).then(()=>{fontsReady=true;cb()},cb)}catch(e){cb()}};

/* ---------- the overlay ---------- */
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]);
let V=null;
function open(sel){
 closePill();document.querySelectorAll(".journey-backdrop").forEach(x=>x.remove());
 if(V)close();
 const o=document.createElement("div");o.id="gfVoyage";o.setAttribute("role","dialog");o.setAttribute("aria-label","The Voyage: your chart of the world");
 o.innerHTML='<div class="vy-chart"><canvas aria-label="Sea chart of the voyage"></canvas><div class="vy-zoom"><button type="button" data-z="1.6" aria-label="Zoom in">+</button><button type="button" data-z="0.625" aria-label="Zoom out">−</button><button type="button" data-z="0" aria-label="Whole chart">⤢</button></div></div>'+
  '<aside class="vy-log"><div class="vy-log-h"><div><b>Ship’s log</b><small>The Voyage</small></div><button type="button" class="vy-x" aria-label="Close the chart">✕</button></div><div class="vy-log-b"></div></aside>';
 document.body.appendChild(o);document.documentElement.classList.add("vy-lock");
 const cv=o.querySelector("canvas"),wrap=o.querySelector(".vy-chart");
 V={o,cv,wrap,tr:{k:1,x:0,y:0},sel:null,fast:false,raf:0,idle:0};
 /* newly finished legs since the chart was last opened */
 const S=st(),now=LEGS.map((_,i)=>legDone(i)?i:-1).filter(i=>i>=0),fresh=now.filter(i=>S.seen.indexOf(i)<0);
 S.seen=now;save();
 V.sel=sel!=null?sel:Math.min(firstOpen(),LEGS.length-1);V.fresh=fresh;
 const resize=()=>{const r=wrap.getBoundingClientRect();sizeCanvas(cv,Math.max(200,r.width),Math.max(160,r.height));paint()};
 V.resize=resize;addEventListener("resize",resize);
 /* pan and zoom: drag, wheel, pinch (the site's d3 has no zoom module) */
 const setT=(k,x,y)=>{if(!V||V.cv!==cv)return;const W=cv._w,H=cv._h;k=Math.max(1,Math.min(9,k));x=Math.min(0,Math.max(W-W*k,x));y=Math.min(0,Math.max(H-H*k,y));V.tr={k,x,y};V.fast=true;paint();clearTimeout(V.idle);V.idle=setTimeout(()=>{if(V){V.fast=false;paint()}},170)};
 const zoomAt=(f,cx,cy)=>{const t=V.tr,k=Math.max(1,Math.min(9,t.k*f)),r=k/t.k;setT(k,cx-(cx-t.x)*r,cy-(cy-t.y)*r)};
 const ease=(to)=>{const fr=Object.assign({},V.tr),t0=performance.now();const step=n=>{if(!V||V.cv!==cv)return;const u=Math.min(1,(n-t0)/380),e=1-Math.pow(1-u,3);setT(fr.k+(to.k-fr.k)*e,fr.x+(to.x-fr.x)*e,fr.y+(to.y-fr.y)*e);if(u<1&&V)requestAnimationFrame(step)};requestAnimationFrame(step)};
 V.setT=setT;V.ease=ease;
 cv.addEventListener("wheel",e=>{e.preventDefault();const r=cv.getBoundingClientRect();zoomAt(Math.exp(-e.deltaY*(e.deltaMode?.05:.0022)),e.clientX-r.left,e.clientY-r.top)},{passive:false});
 const P=new Map();let last=null;
 cv.addEventListener("pointerdown",e=>{cv.setPointerCapture(e.pointerId);P.set(e.pointerId,[e.clientX,e.clientY]);last=null});
 cv.addEventListener("pointermove",e=>{if(!P.has(e.pointerId))return;const r=cv.getBoundingClientRect();P.set(e.pointerId,[e.clientX,e.clientY]);const a=[...P.values()];
  const c=a.length>1?[(a[0][0]+a[1][0])/2-r.left,(a[0][1]+a[1][1])/2-r.top]:[a[0][0]-r.left,a[0][1]-r.top],d=a.length>1?Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]):0;
  if(last&&last.n===a.length){const t=V.tr;let k=t.k,x=t.x+c[0]-last.c[0],y=t.y+c[1]-last.c[1];if(d&&last.d){const f=d/last.d,k2=Math.max(1,Math.min(9,k*f)),rr=k2/k;x=c[0]-(c[0]-x)*rr;y=c[1]-(c[1]-y)*rr;k=k2}setT(k,x,y)}
  last={n:a.length,c,d};if(a.length===1)cv.style.cursor="grabbing"});
 const up=e=>{P.delete(e.pointerId);last=null;cv.style.cursor="grab"};cv.addEventListener("pointerup",up);cv.addEventListener("pointercancel",up);
 cv.addEventListener("dblclick",e=>{const r=cv.getBoundingClientRect();zoomAt(1.8,e.clientX-r.left,e.clientY-r.top)});
 o.querySelectorAll(".vy-zoom button").forEach(b=>b.onclick=()=>{const z=+b.dataset.z,W=cv._w,H=cv._h;if(!z)ease({k:1,x:0,y:0});else{const t=V.tr,k=Math.max(1,Math.min(9,t.k*z)),rr=k/t.k;ease({k,x:W/2-(W/2-t.x)*rr,y:H/2-(H/2-t.y)*rr})}});
 let down=null;cv.addEventListener("pointerdown",e=>{down=[e.clientX,e.clientY]});
 cv.addEventListener("click",e=>{if(down&&Math.hypot(e.clientX-down[0],e.clientY-down[1])>5)return;const i=hit(e);if(i!=null){V.sel=i;log();paint()}});
 cv.addEventListener("mousemove",e=>{cv.style.cursor=hit(e)!=null?"pointer":"grab"});
 o.querySelector(".vy-x").onclick=close;
 V.key=e=>{if(e.key==="Escape"&&V&&!document.querySelector(".game-modal-backdrop")){e.preventDefault();close()}};document.addEventListener("keydown",V.key);
 log();
 requestAnimationFrame(resize);loadPaper(paint);whenFonts(paint);
}
function hit(e){if(!V)return null;const r=V.cv.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;let best=null,bd=22;
 (V.cv._pts||[]).forEach(([i,px,py])=>{const d=Math.hypot(px-x,py-y);if(d<bd){bd=d;best=i}});if(best!=null)return best;bd=12;
 const p=V.cv._proj;if(!p)return null;
 LEGS.forEach((L,i)=>{if(L.t!=="sea")return;for(let j=1;j<L.path.length;j++){const ip=d3.geoInterpolate(L.path[j-1],L.path[j]);for(let t=0;t<=1;t+=.1){const q=p(ip(t));if(!q)continue;const d=Math.hypot(q[0]-x,q[1]-y);if(d<bd){bd=d;best=i}}}});
 return best}
function paint(){if(!V||V.raf)return;const v=V;v.raf=requestAnimationFrame(()=>{v.raf=0;if(V!==v||!v.cv._w)return;try{draw(V.cv,{tr:V.tr,k:V.tr.k,fast:V.fast,sel:V.sel})}catch(e){console.error(e)}})}
function close(){if(!V)return;clearTimeout(V.idle);cancelAnimationFrame(V.raf);removeEventListener("resize",V.resize);document.removeEventListener("keydown",V.key);V.o.remove();V=null;document.documentElement.classList.remove("vy-lock");refreshHome()}

const KIND={quiz:"Quiz",tv:"Trivia",fp:"Flagpie",test:"Test",game:"Game",tour:"Tour"};
function qRow(q,locked){const d=qDone(q),k=qKind(q);
 return'<li class="vy-q'+(d?" done":"")+'"><span class="vy-qk">'+(d?"✓":KIND[k]||"")+'</span><span class="vy-ql">'+esc(qLabel(q))+'</span>'+(locked?"":'<button type="button" class="vy-go" data-q="'+esc(q)+'">'+(d?"Again":"Start")+"</button>")+"</li>"}
function log(){if(!V)return;const b=V.o.querySelector(".vy-log-b"),i=V.sel,L=LEGS[i],done=legDone(i),op=isOpen(i),fo=firstOpen();
 const dn=LEGS.filter((_,j)=>legDone(j)).length;
 let h="";
 if(V.fresh&&V.fresh.length){const f=V.fresh[V.fresh.length-1],F=LEGS[f];h+='<div class="vy-news">'+(F.t==="port"?(F.cont==="World"?"The voyage is complete. Your name goes on the chart.":"Landfall at "+esc(F.name)+" is complete: "+esc(F.cont)+" is charted and sealed."):"Passage complete: "+esc(F.name)+". The route is inked in red.")+"</div>";V.fresh=null}
 h+='<div class="vy-prog"><div class="vy-bar"><i style="width:'+(dn/LEGS.length*100)+'%"></i></div><span>'+dn+" of "+LEGS.length+" legs</span></div>";
 h+='<div class="vy-leg'+(op?"":" locked")+'"><div class="vy-leg-h"><span class="vy-n">'+(i+1)+'</span><div><small>'+(L.t==="port"?(L.cont==="World"?"Home port":"Port · "+esc(L.cont)):"Ocean passage")+"</small><h3>"+esc(L.name)+"</h3></div>"+(done?'<span class="vy-badge">✓ Done</span>':"")+"</div>";
 h+="<p>"+esc(L.blurb)+"</p>";
 if(!op)h+='<p class="vy-lockmsg">🔒 Opens once leg '+(i)+" is done. Leg "+(fo+1)+" and the one after it are open now.</p>";
 if(L.t==="sea"){h+='<h4>The passage</h4><ul class="vy-qs">'+qRow(L.tour,!op)+"</ul>"}
 else{h+="<h4>Landfall</h4><ul class=\"vy-qs\">"+qRow(L.land,!op)+"</ul>";
  const req=L.req.filter(qOK);if(req.length)h+="<h4>Charting the coast <small>"+req.filter(qDone).length+" of "+req.length+"</small></h4><ul class=\"vy-qs\">"+req.map(q=>qRow(q,!op)).join("")+"</ul>";
  const tre=(L.tre||[]).filter(qOK);if(tre.length)h+='<h4 class="vy-tre">✗ Buried treasure <small>optional · '+tre.filter(qDone).length+" of "+tre.length+"</small></h4><ul class=\"vy-qs\">"+tre.map(q=>qRow(q,!op)).join("")+"</ul>"}
 h+="</div>";
 h+='<h4 class="vy-all-h">All legs</h4><ol class="vy-legs">'+LEGS.map((M,j)=>{const d=legDone(j),o=isOpen(j),[a,n]=legParts(j);
  return'<li><button type="button" data-leg="'+j+'" class="'+(j===i?"on ":"")+(d?"done":o?"open":"locked")+'"><span class="vy-li">'+(d?"✓":o?(M.t==="port"?"⚓":"⛵"):"🔒")+'</span><span class="vy-lt">'+esc(M.name)+'</span><span class="vy-ls">'+(d?"":o&&n>1?a+"/"+n:"")+"</span></button></li>"}).join("")+"</ol>";
 h+='<p class="vy-help">Drag to move the chart, pinch or scroll to zoom, tap a port or a passage to read about it. Coasts are inked when you make landfall, rivers and hills appear as you chart them, and a finished continent is coloured in and sealed. Chart data: Natural Earth; rivers, lakes and mountain ranges from GeoFlock’s Landforms.</p>';
 b.innerHTML=h;b.scrollTop=0;
 b.querySelectorAll("[data-leg]").forEach(x=>x.onclick=()=>{V.sel=+x.dataset.leg;log();paint();
  /* bring the leg into view when zoomed in */
  if(V.tr.k>1.05){const M=LEGS[V.sel],c=M.t==="port"?(M.mark||M.at):M.path[Math.floor(M.path.length/2)],p=projFor(V.cv._w,V.cv._h)(c);if(p){const k=V.tr.k;V.ease({k,x:V.cv._w/2-p[0]*k,y:V.cv._h/2-p[1]*k})}}});
 b.querySelectorAll("[data-q]").forEach(x=>x.onclick=()=>launch(x.dataset.q,i));
}
function launch(q,leg){
 st().last=leg;save();close();
 try{if(q.startsWith("tour:"))psLaunchTour(q.slice(5));else{const i=twIdx(q);if(i>=0)journeyStart(i)}}catch(e){console.error(e)}
 showPill(leg);
}
/* a small way back to the chart while doing a quest */
function showPill(leg){closePill();const p=document.createElement("div");p.id="gfVoyPill";
 p.innerHTML='<button type="button" class="vy-pb">⚓ Back to the chart</button><button type="button" class="vy-px" aria-label="Hide">✕</button>';
 document.body.appendChild(p);p.querySelector(".vy-pb").onclick=()=>open(leg);p.querySelector(".vy-px").onclick=closePill}
function closePill(){const p=document.getElementById("gfVoyPill");if(p)p.remove()}

/* ---------- Home: the route section becomes the chart ---------- */
function nextQuest(){const i=firstOpen();if(i>=LEGS.length)return null;const L=LEGS[i];const all=[firstQ(L)].concat(L.req||[]).filter(qOK);const q=all.find(x=>!qDone(x));return q?[i,q]:null}
function homeCard(sec){
 const fo=firstOpen(),L=LEGS[Math.min(fo,LEGS.length-1)],dn=LEGS.filter((_,i)=>legDone(i)).length,nq=nextQuest();
 const h=sec.querySelector(".hx-sec-h,.hi-h2");const sub=dn+" of "+LEGS.length+" legs · "+(fo>=LEGS.length?"the whole world is charted":"next: "+esc(L.name));
 if(h&&h.classList.contains("hi-h2"))h.innerHTML="Your voyage around the world <small class=\"vy-h-sub\">"+sub+"</small>";else if(h)h.innerHTML="<h2>Your voyage around the world</h2><small>"+sub+"</small>";
 [...sec.children].forEach(c=>{if(c!==h)c.remove()});
 const d=document.createElement("div");d.className="vy-home";
 d.innerHTML='<button type="button" class="vy-home-map" aria-label="Open the chart"><canvas></canvas><span class="vy-home-open">Open the chart →</span></button>'+
  '<div class="vy-home-side"><p>Sail from Lisbon round the world: a port on every continent and an ocean passage between each. Your chart fills in as you go.</p>'+
  (nq?'<div class="vy-home-next"><small>Leg '+(nq[0]+1)+" · "+esc(LEGS[nq[0]].name)+"</small><b>"+esc(qLabel(nq[1]))+'</b><button type="button" class="hi-btn main vy-home-go">Start →</button></div>':"")+
  '<button type="button" class="hx-link vy-home-log">Read the ship’s log →</button></div>';
 sec.appendChild(d);sec.dataset.vy="1";
 d.querySelector(".vy-home-map").onclick=()=>open();d.querySelector(".vy-home-log").onclick=()=>open();
 const go=d.querySelector(".vy-home-go");if(go)go.onclick=()=>launch(nq[1],nq[0]);
 const cv=d.querySelector("canvas");
 const pr=()=>{const r=cv.parentNode.getBoundingClientRect();if(!r.width)return;sizeCanvas(cv,r.width,Math.round(r.width*.52));try{draw(cv,{mini:r.width<520,noCart:true,fast:r.width<520})}catch(e){console.error(e)}};
 requestAnimationFrame(pr);loadPaper(pr);whenFonts(pr);
}
function refreshHome(){const s=document.getElementById("hxRoute");if(s){delete s.dataset.vy;try{homeCard(s)}catch(e){console.error(e)}}}
let hq=0;new MutationObserver(()=>{if(hq)return;hq=requestAnimationFrame(()=>{hq=0;
 /* the current Home page: a chart card under "Today" */
 const td=document.querySelector("section.hi-today");if(td&&!document.getElementById("hxRoute")){const v=document.createElement("section");v.id="hxRoute";v.className="hi-voyage";v.innerHTML='<h2 class="hi-h2">Your voyage</h2>';td.after(v)}
 const s=document.getElementById("hxRoute");if(s&&!s.dataset.vy)try{homeCard(s)}catch(e){console.error(e)}
 const c=document.getElementById("hiCont");if(c&&!c.dataset.vy){c.dataset.vy="1";c.innerHTML=(firstOpen()?"Continue your voyage":"Start your voyage")+" <span>→</span>"}
 const r=document.getElementById("hiRoute");if(r&&!r.dataset.vy){r.dataset.vy="1";const fo=firstOpen(),b=r.querySelector("b"),sm=r.querySelector("small");if(b)b.textContent="Your voyage";if(sm)sm.textContent=fo>=LEGS.length?"The whole world is charted":"Leg "+(fo+1)+" of "+LEGS.length+": "+LEGS[fo].name}})}).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener("click",e=>{const t=e.target.closest&&e.target.closest("#hiCont,#hxRouteAll,#hiRoute");if(!t)return;e.preventDefault();e.stopImmediatePropagation();open()},true);

/* the old route overlay opens the chart instead */
try{const _tw=twOpen;twOpen=function(sel,which){if(which===2)return _tw.apply(this,arguments);open()}}catch(e){}
window.gfVoyage={open,close,LEGS,legDone,isOpen,firstOpen,contLevel,draw,qDone};

const css=document.createElement("style");css.textContent=`
html.vy-lock{ overflow:hidden; }
#gfVoyage :is(div,p,span,small,b,i,li,button,h3,h4,a), #gfVoyPill button, .vy-home-open{ font-family:"IM Fell English",Georgia,serif !important; }
#gfVoyage :is(.vy-log-h b,h4,h4 *:not(small)){ font-family:"IM Fell English SC","IM Fell English",Georgia,serif !important; }
#gfVoyage{ position:fixed; inset:0; z-index:9000; display:grid; grid-template-columns:1fr 340px; background:#2b2118; }
#gfVoyage .vy-chart{ position:relative; min-width:0; min-height:0; overflow:hidden; background:#e8d9b5; }
#gfVoyage canvas{ display:block; touch-action:none; cursor:grab; }
#gfVoyage .vy-zoom{ position:absolute; right:22px; top:22px; display:flex; flex-direction:column; gap:6px; }
#gfVoyage .vy-zoom button{ width:34px; height:34px; border-radius:50%; border:1px solid #3a2a18; background:rgba(246,236,210,.92); color:#3a2a18; font:20px/1 Georgia,serif; cursor:pointer; box-shadow:0 2px 6px rgba(40,25,10,.25); }
#gfVoyage .vy-log{ background:#f4ead2 url(textures/PAPER.webp); color:#3a2a18; display:flex; flex-direction:column; min-height:0; border-left:2px solid #3a2a18; box-shadow:-6px 0 18px rgba(0,0,0,.25); font-family:"IM Fell English",Georgia,serif; }
#gfVoyage .vy-log-h{ display:flex; align-items:center; justify-content:space-between; padding:14px 16px 10px; border-bottom:1px solid rgba(58,42,24,.35); }
#gfVoyage .vy-log-h b{ display:block; font:26px/1.05 "IM Fell English SC","IM Fell English",Georgia,serif; letter-spacing:.04em; }
#gfVoyage .vy-log-h small{ font-style:italic; font-size:14px; opacity:.75; }
#gfVoyage .vy-x{ width:36px; height:36px; border-radius:50%; border:1px solid rgba(58,42,24,.5); background:rgba(255,250,235,.6); color:#3a2a18; font-size:16px; cursor:pointer; }
#gfVoyage .vy-log-b{ overflow-y:auto; padding:12px 16px 24px; flex:1; -webkit-overflow-scrolling:touch; }
#gfVoyage .vy-news{ background:#9c2b1c; color:#fbecd6; border-radius:4px; padding:9px 12px; margin-bottom:12px; font-size:15px; font-style:italic; box-shadow:0 2px 6px rgba(80,20,10,.25); }
#gfVoyage .vy-prog{ display:flex; align-items:center; gap:10px; font-style:italic; font-size:14px; margin-bottom:12px; }
#gfVoyage .vy-bar{ flex:1; height:6px; border:1px solid #3a2a18; border-radius:3px; overflow:hidden; } #gfVoyage .vy-bar i{ display:block; height:100%; background:#9c2b1c; }
#gfVoyage .vy-leg{ border:1px solid rgba(58,42,24,.45); border-radius:4px; background:rgba(255,250,236,.55); padding:12px 12px 6px; }
#gfVoyage .vy-leg.locked{ opacity:.82; }
#gfVoyage .vy-leg-h{ display:flex; gap:10px; align-items:flex-start; }
#gfVoyage .vy-n{ flex:none; width:30px; height:30px; border-radius:50%; border:1.5px solid #3a2a18; display:grid; place-items:center; font-size:16px; background:#f6edd6; }
#gfVoyage .vy-leg-h > div{ flex:1; min-width:0; } #gfVoyage .vy-leg-h small{ font-style:italic; font-size:13px; opacity:.75; }
#gfVoyage .vy-leg h3{ margin:0; font:21px/1.15 "IM Fell English",Georgia,serif; }
#gfVoyage .vy-badge{ flex:none; color:#9c2b1c; font-size:13px; border:1px solid #9c2b1c; border-radius:999px; padding:2px 8px; }
#gfVoyage .vy-leg p{ font-size:15.5px; line-height:1.4; margin:10px 0; }
#gfVoyage .vy-lockmsg{ font-style:italic; color:#7a3b20; }
#gfVoyage h4{ font:15px "IM Fell English SC","IM Fell English",Georgia,serif; letter-spacing:.05em; margin:12px 0 4px; border-bottom:1px solid rgba(58,42,24,.25); padding-bottom:2px; }
#gfVoyage h4 small{ font:italic 13px "IM Fell English",Georgia,serif; letter-spacing:0; opacity:.75; margin-left:4px; }
#gfVoyage h4.vy-tre{ color:#9c2b1c; }
#gfVoyage .vy-qs{ list-style:none; margin:0; padding:0; }
#gfVoyage .vy-q{ display:flex; align-items:center; gap:8px; padding:6px 0; border-bottom:1px dotted rgba(58,42,24,.25); font-size:15px; }
#gfVoyage .vy-qk{ flex:none; width:52px; font:italic 12px "IM Fell English",Georgia,serif; opacity:.7; }
#gfVoyage .vy-q.done .vy-qk{ color:#9c2b1c; font-size:16px; font-style:normal; opacity:1; }
#gfVoyage .vy-ql{ flex:1; min-width:0; } #gfVoyage .vy-q.done .vy-ql{ opacity:.7; }
#gfVoyage .vy-go{ flex:none; border:1px solid #3a2a18; background:#3a2a18; color:#f6edd6; border-radius:3px; padding:5px 12px; font:15px "IM Fell English",Georgia,serif; cursor:pointer; }
#gfVoyage .vy-q.done .vy-go{ background:transparent; color:#3a2a18; }
#gfVoyage .vy-all-h{ margin-top:20px; }
#gfVoyage .vy-legs{ list-style:none; margin:0; padding:0; }
#gfVoyage .vy-legs button{ width:100%; display:flex; align-items:center; gap:8px; text-align:left; background:none; border:0; border-bottom:1px dotted rgba(58,42,24,.22); padding:6px 4px; color:inherit; font:15px "IM Fell English",Georgia,serif; cursor:pointer; }
#gfVoyage .vy-legs button.on{ background:rgba(214,170,60,.25); }
#gfVoyage .vy-legs button.locked{ opacity:.55; }
#gfVoyage .vy-legs button.done .vy-li{ color:#9c2b1c; }
#gfVoyage .vy-li{ width:22px; text-align:center; flex:none; } #gfVoyage .vy-lt{ flex:1; } #gfVoyage .vy-ls{ font-style:italic; font-size:13px; opacity:.7; }
#gfVoyage .vy-help{ font-size:13px; font-style:italic; opacity:.72; line-height:1.4; margin-top:16px; }
#gfVoyPill{ position:fixed; left:50%; bottom:18px; transform:translateX(-50%); z-index:8000; display:flex; border-radius:999px; overflow:hidden; box-shadow:0 4px 16px rgba(40,25,10,.35); border:1.5px solid #3a2a18; background:#f4ead2 url(textures/PAPER.webp); font-family:"IM Fell English",Georgia,serif; }
#gfVoyPill button{ border:0; background:none; color:#3a2a18; cursor:pointer; font:16px "IM Fell English",Georgia,serif; }
#gfVoyPill .vy-pb{ padding:9px 14px 9px 18px; } #gfVoyPill .vy-px{ padding:9px 14px 9px 8px; opacity:.6; font-size:13px; }
.hi-voyage .vy-h-sub{ text-transform:none; letter-spacing:0; font-weight:600; margin-left:8px; opacity:.8; }
.hi-voyage .vy-home{ background:rgba(255,255,255,.6); border-radius:18px; padding:14px; box-shadow:0 4px 18px rgba(30,60,90,.08); }
.vy-home{ display:grid; grid-template-columns:minmax(0,1.9fr) minmax(220px,1fr); gap:18px; align-items:center; }
.vy-home-map{ position:relative; display:block; width:100%; padding:0; border:2px solid #3a2a18; border-radius:4px; overflow:hidden; cursor:pointer; background:#e8d9b5; box-shadow:0 6px 18px rgba(60,40,15,.18); }
.vy-home-map canvas{ display:block; width:100%; }
.vy-home-open{ position:absolute; right:12px; bottom:12px; background:#3a2a18; color:#f6edd6; border-radius:3px; padding:6px 12px; font:16px "IM Fell English",Georgia,serif; }
.vy-home-side p{ margin:0 0 12px; line-height:1.45; }
.vy-home-next{ border:1px solid rgba(58,42,24,.3); border-radius:10px; padding:10px 12px; display:grid; gap:4px; margin-bottom:10px; }
.vy-home-next small{ opacity:.7; } .vy-home-next b{ font-size:15px; } .vy-home-next .hi-btn{ justify-self:start; margin-top:4px; }
@media (max-width:820px){
 #gfVoyage{ grid-template-columns:1fr; grid-template-rows:min(58vh,calc(56vw + 20px)) minmax(0,1fr); }
 #gfVoyage .vy-log{ border-left:0; border-top:2px solid #3a2a18; box-shadow:0 -6px 18px rgba(0,0,0,.25); }
 #gfVoyage .vy-log-h{ padding:8px 14px 6px; } #gfVoyage .vy-log-h b{ font-size:21px; }
 #gfVoyage .vy-zoom{ right:12px; top:12px; } #gfVoyage .vy-zoom button{ width:30px; height:30px; font-size:17px; }
 .vy-home{ grid-template-columns:1fr; gap:12px; }
}
`;document.head.appendChild(css);
})();
