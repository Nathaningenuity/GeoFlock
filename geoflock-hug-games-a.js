/* GeoFlock AP Human Geography games, units 1 and 2 (needs geoflock-hug-plus.js).
   Unit 1: Where in the world (latitude/longitude hunt), True size (drag countries on a Mercator map), Scale zoom
   challenge, Measure the world (live map, ruler), Map a formal region (paint from real data).
   Unit 2: The DTM on the map (real fertility and median age), Build a population pyramid, Crowded or empty
   (density duel), Draw the great migrations. */
(function(){
"use strict";
if(!window.HGX||window._hgxA)return;window._hgxA=1;
const G=HGX,D=G.D,esc=G.esc,h=G.h,btn=G.btn,fmt=G.fmt;
const region=r=>{try{return COUNTRIES.filter(c=>c.r===r).map(c=>c.c).filter(G.feat)}catch(e){return[]}};

/* ===================== UNIT 1 ===================== */
/* ---- Where in the world: latitude and longitude ---- */
const LLPLACES=[["Tokyo",139.69,35.69],["Cairo",31.24,30.04],["Lima",-77.03,-12.05],["Nairobi",36.82,-1.29],["Moscow",37.62,55.76],["Sydney",151.21,-33.87],["Reykjavík",-21.94,64.15],
 ["Singapore",103.82,1.35],["Mexico City",-99.13,19.43],["Cape Town",18.42,-33.92],["Mumbai",72.88,19.08],["Buenos Aires",-58.38,-34.6],["Anchorage",-149.9,61.22],["Honolulu",-157.86,21.31],
 ["Dakar",-17.47,14.72],["Ulaanbaatar",106.92,47.92],["Quito",-78.47,-0.18],["Perth",115.86,-31.95],["Lagos",3.38,6.52],["London",-0.13,51.51],["Murmansk",33.08,68.97],["Tehran",51.39,35.69],["Bogotá",-74.07,4.71],["Wellington",174.78,-41.29]];
function llq(p){const la=p[2],lo=p[1];const f=(v,a,b)=>Math.abs(v).toFixed(0)+"°"+(v>=0?a:b);return[f(la,"N","S"),f(lo,"E","W")]}
G.add("u1",[{id:"latlong",kind:"hunt",ch:"hg1",wide:true,title:"Where in the world? Latitude and longitude",blurb:"Read the grid: click the spot that matches each pair of coordinates.",skill:"Absolute location (1.2): latitude and longitude.",
 intro:"Latitude counts degrees north or south of the Equator; longitude counts degrees east or west of the Prime Meridian at Greenwich. Together they give every spot on Earth an absolute location.",
 game:{proj:"eq",grat:"fine",gratLabels:true,n:8,cls:"hgx-ll",
  intro:'<p>Eight coordinates. The map shows the grid every 10°, labelled every 30°. Find the spot and click it: the closer you are, the more points.</p><ul><li>Latitude first: N is above the Equator, S below.</li><li>Then longitude: E is right of Greenwich (0°), W is left.</li></ul>',
  get rounds(){return LLPLACES.map(p=>{const[a,b]=llq(p);return{q:"Click "+a+", "+b,ll:[p[1],p[2]],name:p[0]+" ("+a+", "+b+")",tol:300,hint:(p[2]>=0?"North":"South")+" of the Equator, "+(p[1]>=0?"east":"west")+" of the Prime Meridian.",
   why:p[0]+" sits at "+a+", "+b+". "+(Math.abs(p[2])<23.4?"That is inside the tropics, between the Tropic of Cancer (23.4°N) and the Tropic of Capricorn.":Math.abs(p[2])>66.5?"That is north of the Arctic Circle (66.5°N).":"That is in the mid-latitudes.")}})}}}]);

/* ---- True size: drag a country on the Mercator map ---- */
const PAIRS=[["gl","au"],["gl","cd"],["ca","cn"],["no","mg"],["gl","mx"],["gl","in"],["fi","vn"],["se","iq"],["ru","br"],["ca","au"]];
function rotGeom(g,C0,C1){const rA=d3.geoRotation([-C0[0],-C0[1]]),rB=d3.geoRotation([-C1[0],-C1[1]]);const m=p=>rB.invert(rA(p));const mapR=r=>r.map(m);
 return g.type==="Polygon"?{type:"Polygon",coordinates:g.coordinates.map(mapR)}:{type:"MultiPolygon",coordinates:g.coordinates.map(pl=>pl.map(mapR))}}
function mainGeom(f){const g=f.geometry;if(g.type!=="MultiPolygon")return g;let best=null,ba=-1;g.coordinates.forEach(pl=>{const a=d3.geoArea({type:"Polygon",coordinates:pl});if(a>ba){ba=a;best=pl}});
 const c=d3.geoCentroid({type:"Polygon",coordinates:best});return{type:"MultiPolygon",coordinates:g.coordinates.filter(pl=>d3.geoDistance(d3.geoCentroid({type:"Polygon",coordinates:pl}),c)<.45)}}
G.add("u1",[{id:"truesize",kind:"game",ch:"hg1",wide:true,title:"True size: how big is it really?",blurb:"Guess which country is bigger, then drag it across the Mercator map and watch it shrink.",skill:"Map projections (1.1): distortion of area.",
 intro:"The Mercator projection keeps shapes and compass directions true, which sailors needed, but it stretches areas more and more towards the poles. Greenland looks as big as Africa; Africa is fourteen times bigger.",
 play(el,done,L){
  const play=()=>{el.innerHTML="";const R=G.shuffle(PAIRS).slice(0,6);let i=0,score=0;const res=[];
   const H=G.hud(el,{res});const q=h("div","hgx-q");el.appendChild(q);const ch=h("div","hgx-choice");el.appendChild(ch);
   const A=G.atlas(el,{proj:"merc",names:true,maxZoom:8});const fb=h("div","hgx-fbw");el.appendChild(fb);
   let ghost=null;A.grab=null;
   const ask=()=>{const[a,b]=R[i];const fa=G.feat(a),fb2=G.feat(b);H.set(i+1,R.length,score);A.clear();A.cls(c=>c===a?"hl":c===b?"hl2":"");fb.innerHTML="";ch.innerHTML="";if(ghost){ghost.remove();ghost=null}A.grab=null;
    const na=D.name(a),nb=D.name(b);q.innerHTML='<b>Which is bigger in real life: <span class="hgx-t1">'+esc(na)+'</span> or <span class="hgx-t2">'+esc(nb)+'</span>?</b><small>Both are highlighted on this Mercator map.</small>';
    A.home=()=>A.focusCodes([a,b],600,1.4);A.home();
    const sa=D.area(a),sb=D.area(b),r=sa/sb;const truth=Math.abs(Math.log(r))<Math.log(1.12)?0:r>1?1:2;
    [[1,na+" is bigger"],[0,"About the same"],[2,nb+" is bigger"]].forEach(([k,t])=>ch.appendChild(btn(esc(t),"",()=>answer(k))));
    function answer(k){ch.querySelectorAll("button").forEach(x=>x.disabled=true);const ok=k===truth;let pts=ok?60:0;score+=pts;
     const big=sa>sb?na:nb,ratio=sa>sb?sa/sb:sb/sa;
     fb.innerHTML='<div class="hgx-fb '+(ok?"ok":"no")+'"><b>'+(ok?"Right! +60":"Not quite.")+'</b> '+esc(na)+' is about '+fmt(sa/1000)+' thousand km², '+esc(nb)+' about '+fmt(sb/1000)+' thousand km²'+(truth===0?': almost the same size.':'. '+esc(big)+' is '+(ratio<1.5?ratio.toFixed(2):ratio.toFixed(1))+' times bigger.')+
      '<p><b>Now see it:</b> drag the yellow '+esc(na)+' to the same latitude as '+esc(nb)+' (+40).</p></div>';
     /* the draggable ghost */
     const g0=mainGeom(fa),C0=d3.geoCentroid(g0);let C=C0.slice(),moved=false;const cb=d3.geoCentroid(mainGeom(fb2));
     const Z=A.svg.querySelector(".hgx-ov");ghost=document.createElementNS("http://www.w3.org/2000/svg","path");ghost.setAttribute("class","hgx-ghost");Z.appendChild(ghost);
     const draw=()=>ghost.setAttribute("d",A.path(rotGeom(g0,C0,C))||"");draw();
     let off=null;
     const onMove=e=>{const ll=A.llAt(e.clientX,e.clientY);if(!ll)return;C=[ll[0]-off[0],G.clamp(ll[1]-off[1],-72,78)];draw();
      if(!moved&&Math.abs(C[1]-cb[1])<8){moved=true;score+=40;pts+=40;H.set(i+1,R.length,score);const p=fb.querySelector(".hgx-fb p:last-child");if(p)p.innerHTML='<b>+40.</b> At the same latitude the two are drawn at the same stretch, so their sizes compare fairly. '+esc(na)+' was '+Math.abs(C0[1]).toFixed(0)+'° from the Equator: there Mercator stretches area about '+(1/Math.pow(Math.cos(C0[1]*Math.PI/180),2)).toFixed(1)+' times.'}};
     const onUp=()=>{removeEventListener("pointermove",onMove);removeEventListener("pointerup",onUp);ghost.classList.remove("drag")};
     A.grab=e=>{if(e.target!==ghost)return false;const ll=A.llAt(e.clientX,e.clientY);off=ll?[ll[0]-C[0],ll[1]-C[1]]:[0,0];ghost.classList.add("drag");addEventListener("pointermove",onMove);addEventListener("pointerup",onUp);e.preventDefault();return true};
     const nx=btn(i+1<R.length?"Next →":"See your score","pri",()=>{res.push(pts/100);i++;if(i<R.length)ask();else end()});fb.appendChild(nx);
     A.home=()=>A.reset();A.reset();
    }};
   const end=()=>G.finish(el,{key:"g:"+L.id,pts:score,max:R.length*100,again:play,done,lines:['<p>On a Mercator map a country at 60° latitude is drawn four times too big in area; at 70° about eight times. Equal-area projections such as Gall–Peters or Equal Earth keep sizes true but bend shapes.</p>']});
   ask()};
  play()}}]);

/* ---- Scale zoom challenge ---- */
const SCALES=[["the whole of Africa",[[-20,-36],[52,38]],60e6],["Europe",[[-12,35],[35,62]],25e6],["Japan",[[129,30],[146,46]],8e6],["Sri Lanka",[[79.5,5.8],[82,9.9]],2.5e6],["the Nile delta",[[29.5,30],[32.5,31.7]],1e6],["Singapore and its strait",[[103.5,1.1],[104.2,1.5]],400000]];
G.add("u1",[{id:"scalezoom",kind:"game",ch:"hg1",wide:true,title:"Scale zoom challenge",blurb:"Zoom the map to a given scale. Small scale, large scale: feel the difference.",skill:"Scale of analysis and map scale (1.1, 1.6).",
 intro:"Map scale compares a distance on the map with the same distance on the ground. 1:1,000,000 means 1 cm on your screen is 10 km. A large-scale map (1:10,000) shows a small area in great detail; a small-scale map (1:100,000,000) shows the world with little.",
 play(el,done,L){
  const play=()=>{el.innerHTML="";const R=SCALES.slice();let i=0,score=0;const res=[];const H=G.hud(el,{res});const q=h("div","hgx-q");el.appendChild(q);
   const bar=h("div","hgx-scalebar");el.appendChild(bar);
   const A=G.atlas(el,{proj:"merc",names:true,maxZoom:1600,grat:false});const fb=h("div","hgx-fbw");el.appendChild(fb);A.reset(0);
   const rf=()=>{/* the representative fraction at the centre of the view (CSS pixels at 96 per inch) */try{const t=A.t;const cx=(A.W/2-t.x)/t.k,cy=(A.H/2-t.y)/t.k;const a=A.P.invert([cx-5,cy]),b=A.P.invert([cx+5,cy]);const gm=G.km(a,b)*1000/(10*t.k);/* ground metres per svg unit */
     const pxPerUnit=A.svg.getBoundingClientRect().width/A.W;return gm/(pxPerUnit*0.0002646)}catch(e){return 0}};
   const show=()=>{const r=rf();const T=R[i];const lg=Math.log10(r/T[2]);const near=Math.abs(lg)<Math.log10(1.5);bar.innerHTML='<span>Your map now</span><b>1 : '+fmt(r)+'</b><span class="hgx-dim">target 1 : '+fmt(T[2])+'</span><span class="hgx-sc-ar '+(near?"ok":"")+'">'+(near?"✓ on target":lg>0?"zoom in (larger scale) ▸":"◂ zoom out (smaller scale)")+'</span>'};
   A.onZoom=()=>show();
   const ask=()=>{const T=R[i];H.set(i+1,R.length,score);fb.innerHTML="";A.clear();
    q.innerHTML='<b>Make a map of '+esc(T[0])+' at about 1 : '+fmt(T[2])+'</b><small>Zoom with the buttons, the wheel or a pinch, and keep '+esc(T[0])+' in the middle. Then press Snap.</small>';show();
    const snap=btn("📸 Snap the map","pri",()=>{const r=rf();const t=A.t;const cx=(A.W/2-t.x)/t.k,cy=(A.H/2-t.y)/t.k;const c=A.P.invert([cx,cy]);const b=T[1];
     const inside=c&&c[0]>=b[0][0]-(b[1][0]-b[0][0])*.5&&c[0]<=b[1][0]+(b[1][0]-b[0][0])*.5&&c[1]>=b[0][1]-(b[1][1]-b[0][1])*.5&&c[1]<=b[1][1]+(b[1][1]-b[0][1])*.5;
     const err=Math.abs(Math.log10(r/T[2]));const f=(inside?1:.4)*G.clamp(1-Math.max(0,err-.08)/.6,0,1);const p=Math.round(f*100);score+=p;res.push(f);H.set(i+1,R.length,score);snap.remove();
     fb.innerHTML='<div class="hgx-fb '+(f>=.8?"ok":f>=.4?"mid":"no")+'"><b>+'+p+'</b> You snapped 1 : '+fmt(r)+(inside?'':' (but '+esc(T[0])+' is not in the middle of the map)')+'. '+(i>0?'That is a <b>larger scale</b> than the last map: the fraction 1/'+fmt(T[2])+' is bigger than 1/'+fmt(R[i-1][2])+', so a smaller area shows in more detail.':'A continent fits on the screen: a <b>small-scale</b> map.')+'</div>';
     fb.appendChild(btn(i+1<R.length?"Next →":"See your score","pri",()=>{i++;if(i<R.length)ask();else end()}))});fb.appendChild(snap)};
   const end=()=>G.finish(el,{key:"g:"+L.id,pts:score,max:R.length*100,again:play,done,lines:['<p>From Africa (1:60 million) to Singapore (1:400,000) the scale grew 150 times larger. <b>Large scale = zoomed in.</b> Scale of analysis works the same way: a pattern seen at the scale of the world (global) can vanish at the scale of a city (local).</p>']});
   ask()};play()}}]);

/* ---- Measure the world: a live-map mission with the ruler ---- */
G.add("u1",[{id:"measure",kind:"mission",ch:"hg1",title:"Measure the world with the ruler",blurb:"On the live map: drag the ruler out of the toolkit and measure real distances.",skill:"Absolute and relative distance (1.4); using geospatial tools (1.3).",
 intro:"Absolute distance is measured in kilometres; relative distance in time, cost or connections. Here you measure the absolute kind on the real map, then think about the relative kind.",
 how:"The live Maps page opens with a task card. For each task, drag the <b>Ruler</b> out of the toolkit tray (bottom left of the map), click the first place, then the second, and type the distance it shows.",
 mission:{title:"Measure the world",mode:"relief",n:6,intro:"Six measuring tasks. Use the <b>Ruler</b> from the toolkit tray at the bottom left of the map. Zoom in close for the short ones.",
  rounds:[
   {q:"How far is London from New York, as the crow flies?",kind:"num",ans:5570,unit:"km",tol:.06,fly:[[-80,35],[5,58]],tip:"Ruler: click London, then New York.",why:"About 5,570 km, yet a flight takes about 7 hours and a video call no time at all: absolute distance stays, relative distance shrinks. That is time–space compression.",a:[-0.13,51.51],b:[-74,40.71]},
   {q:"How wide is the Strait of Gibraltar at its narrowest?",kind:"num",ans:14,unit:"km",tol:.3,fly:[[-6.5,35.6],[-4.8,36.4]],tip:"Zoom right in: Spain to the north, Morocco to the south.",why:"About 14 km. So narrow a passage between Africa and Europe is a choke point for ships and a crossing for migrants."},
   {q:"How long is Chile, from the Peruvian border to Cape Horn?",kind:"num",ans:4300,unit:"km",tol:.1,fly:[[-80,-56],[-60,-17]],tip:"Measure in a straight line, north to south.",why:"About 4,300 km, yet rarely 200 km wide: an elongated state, which makes it hard to hold together and to supply."},
   {q:"How far is Cape Town from Cairo?",kind:"num",ans:7240,unit:"km",tol:.07,fly:[[10,-36],[38,33]],tip:"From the southern tip of Africa to the Nile delta.",why:"About 7,200 km: Africa is far bigger than most world maps make it look."},
   {q:"How far is it from Sydney to Perth, across Australia?",kind:"num",ans:3290,unit:"km",tol:.07,fly:[[112,-38],[155,-25]],tip:"East coast to west coast.",why:"About 3,300 km: Perth is one of the most isolated big cities on Earth, so distance decay shapes its trade with Asia more than with Sydney."},
   {q:"How far is Singapore from the Equator?",kind:"num",ans:150,unit:"km",tol:.25,fly:[[101,-2],[107,3]],tip:"Turn on Grid lines, or use the Geometry set’s Line up latitude to find 0°.",why:"About 150 km (1.35° of latitude; each degree is about 111 km)."},
   {q:"How far does a ship sail through the Panama Canal, ocean to ocean?",kind:"num",ans:77,unit:"km",tol:.25,fly:[[-80.3,8.7],[-79.3,9.5]],tip:"Zoom in on the isthmus of Panama, Atlantic side to Pacific side, along the canal.",why:"About 80 km, and it saves ships from New York to California a 13,000 km trip round South America."}
  ]}}]);

/* ---- Map a formal region ---- */
const FR=[
 {q:"In Africa, paint the countries that drive on the <b>left</b>.",region:"Africa",ans:c=>D.drive(c)==="L"?"y":null,cats:[["y","Drives on the left","#e3b25a"]],why:"A formal region: one shared trait, mapped country by country. Most of it is a relic of British rule in eastern and southern Africa."},
 {q:"In the Americas, paint the countries where <b>Catholics</b> are the largest religious group.",region:"Americas",ans:c=>D.rel(c)==="cat"?"y":null,cats:[["y","Catholic is largest","#7fa7dc"]],why:"A formal region drawn by one trait. Spanish and Portuguese colonisation carried Catholicism; English and Dutch colonies were mostly Protestant."},
 {q:"In Asia, paint the countries where most people are <b>Buddhist</b>.",region:"Asia",ans:c=>D.rel(c)==="bud"?"y":null,cats:[["y","Buddhist is largest","#f2d36b"]],why:"Mainland Southeast Asia, Sri Lanka, Bhutan, Mongolia and Japan. China has no single largest religion once ‘no religion’ is counted."},
 {q:"In Europe, paint the countries where a <b>Slavic</b> language is spoken most.",region:"Europe",ans:c=>D.lang(c)==="sla"?"y":null,cats:[["y","Slavic language","#5b6fb8"]],why:"Slavic languages run from Poland and Czechia to Russia and down to the Balkans; Romania, Hungary and Albania break the pattern."},
 {q:"In Africa, paint the countries where <b>half or more</b> of all workers farm.",region:"Africa",ans:c=>D.farm(c)==null?undefined:D.farm(c)>=50?"y":null,cats:[["y","50%+ of workers farm","#a7802a"]],why:"A formal region from a number: draw the line at 50% and the region appears. Move the line and the region changes: every formal region depends on where its edge is drawn."}
];
G.add("u1",[{id:"formal",kind:"paint",ch:"hg1b",wide:true,title:"Map a formal region",blurb:"Paint the countries that share one trait, then check your map against the data.",skill:"Types of regions (1.7): formal regions and their edges.",
 intro:"A formal region shares one measurable trait: a language, a religion, which side of the road people drive on. The maps’ own data decide the answer.",
 game:()=>({n:4,intro:"<p>Four regions to draw. Paint every country you think shares the trait, then press <b>Check my map</b>. Hover over a country to see its name.</p>",
  rounds:FR.map(r=>{const sc=region(r.region);return{q:r.q,cats:r.cats,scope:sc,ans:r.ans,why:r.why,explain:c=>r.ans(c)?"has the trait":"does not"}})})}]);

/* ===================== UNIT 2 ===================== */
/* ---- The DTM on the map ---- */
const stageOf=c=>{const f=D.fert(c),a=D.age(c);if(f==null||a==null)return null;if(f>=4.5)return 2;if(f>=2.2)return 3;if(f<1.6&&a>=39)return 5;return 4};
const stageOk=(c,s)=>{const f=D.fert(c),a=D.age(c);const st=stageOf(c);if(st===s)return true;/* borderline: within 0.3 children of a boundary */
 if(s===2&&f>=4.2)return true;if(s===3&&(f>=4.2&&f<4.8||f>=1.9&&f<2.5))return true;if(s===4&&(f>=2.2&&f<2.5||f<1.75&&a>=37))return true;if(s===5&&f<1.75&&a>=37)return true;return false};
const SNAME={2:"Stage 2: early expanding",3:"Stage 3: late expanding",4:"Stage 4: low stationary",5:"Stage 5: declining"};
const SCOL={2:"#c4472a",3:"#ec9455",4:"#8fbce0",5:"#2c6fb7"};
const dtmWhy=c=>esc(D.name(c))+": "+D.fert(c).toFixed(2)+" children per woman, median age "+D.age(c).toFixed(0)+(D.life(c)?", life expectancy "+D.life(c).toFixed(0):"")+" → <b>"+SNAME[stageOf(c)]+"</b>.";
const DTM_SVG=sel=>{const B=[40,40,30,14,9],Dr=[38,18,10,9,11];const x=i=>30+i*80,y=r=>96-r*2;const pth=A=>A.map((r,i)=>(i?"L":"M")+x(i)+" "+y(r)).join(" ");
 return'<svg viewBox="0 0 400 118" class="hgx-dtm">'+[1,2,3,4,5].map(s=>'<g class="hgx-st'+(s===sel?" on":"")+(s===1?" dis":"")+'" data-s="'+s+'"><rect x="'+(x(s-1)-38)+'" y="2" width="76" height="114" rx="8"/><text x="'+x(s-1)+'" y="112" text-anchor="middle">Stage '+s+'</text></g>').join("")+
 '<path d="'+pth(B)+'" class="hgx-dtm-b"/><path d="'+pth(Dr)+'" class="hgx-dtm-d"/><text x="6" y="12" class="hgx-dtm-k b">births</text><text x="300" y="12" class="hgx-dtm-k d">deaths</text></svg>'};
G.add("u2",[{id:"dtmmap",kind:"game",ch:"hg2b",wide:true,title:"The DTM on the map",blurb:"Find countries at each stage on the real map, and place highlighted ones on the model.",skill:"The demographic transition model (2.5) applied to real data.",
 intro:"The demographic transition model is one story told at different times. Today’s map shows countries at every stage from 2 to 5. The data are the maps’ own: UN fertility and median age for 2024.",
 play(el,done,L){
  const PLACE=["ne","td","so","ml","cd","ao","af","ng","ke","pk","eg","et","ph","in","bd","mx","br","us","fr","gb","au","jp","it","kr","de","es","cn","th","ru"].filter(c=>stageOf(c));
  const play=()=>{el.innerHTML="";const res=[];let i=0,score=0;
   const R=G.shuffle([{t:"find",s:2},{t:"find",s:3},{t:"find",s:4},{t:"find",s:5},...G.shuffle(PLACE).slice(0,4).map(c=>({t:"place",c}))]);
   const H=G.hud(el,{res});const q=h("div","hgx-q");el.appendChild(q);const dt=h("div","hgx-dtmw");el.appendChild(dt);
   const A=G.atlas(el,{names:true});const fb=h("div","hgx-fbw");el.appendChild(fb);
   const reveal=()=>{A.fill(c=>{const s=stageOf(c);return s?SCOL[s]:null})};
   const legend='<div class="hgx-leg">'+[2,3,4,5].map(s=>'<i style="display:inline-block;width:10px;height:10px;border-radius:3px;background:'+SCOL[s]+';margin:0 4px 0 8px"></i>'+SNAME[s].split(":")[0]).join("")+'</div>';
   const next=()=>{fb.appendChild(btn(i+1<R.length?"Next →":"See your score","pri",()=>{i++;if(i<R.length)ask();else end()}))};
   const ask=()=>{const r=R[i];H.set(i+1,R.length,score);A.fill(()=>null);A.cls(()=>"");A.clear();fb.innerHTML="";A.reset();
    if(r.t==="find"){q.innerHTML='<b>Find a country in '+SNAME[r.s]+'</b><small>'+["","","Births high, deaths falling fast: very young and growing quickly.","Births falling, deaths low: still growing, more slowly.","Births and deaths both low: little natural growth.","Births below deaths, or close: an old population, starting to shrink."][r.s]+' Click it on the map.</small>';
     dt.innerHTML=DTM_SVG(r.s);
     A.onClick=c=>{if(!c||!stageOf(c))return;A.onClick=null;const ok=stageOk(c,r.s);score+=ok?100:0;res.push(ok?1:0);H.set(i+1,R.length,score);A.setCls(c,ok?"pick-ok":"pick-no");setTimeout(reveal,700);
      const ex=PLACE.filter(x=>stageOf(x)===r.s).slice(0,4).map(D.name).join(", ");
      fb.innerHTML='<div class="hgx-fb '+(ok?"ok":"no")+'"><b>'+(ok?"Yes! +100":"Not quite.")+'</b> '+dtmWhy(c)+(ok?"":" Some countries in "+SNAME[r.s].split(":")[0]+": "+esc(ex)+".")+legend+'</div>';next()}}
    else{const c=r.c;q.innerHTML='<b>Where is <span class="hgx-t1">'+esc(D.name(c))+'</span> on the model?</b><small>Look at where it is and what you know, then click its stage on the graph. (After you answer, you see its numbers.)</small>';
     A.setCls(c,"hl");A.focusCodes([c],600,3);A.onClick=null;dt.innerHTML=DTM_SVG(0);
     dt.querySelectorAll(".hgx-st:not(.dis)").forEach(g=>g.onclick=()=>{if(dt.dataset.done)return;dt.dataset.done=1;const s=+g.dataset.s;const ok=stageOk(c,s);score+=ok?100:0;res.push(ok?1:0);H.set(i+1,R.length,score);
      dt.innerHTML=DTM_SVG(stageOf(c));delete dt.dataset.done;reveal();A.reset();
      fb.innerHTML='<div class="hgx-fb '+(ok?"ok":"no")+'"><b>'+(ok?"Right! +100":"Not quite.")+'</b> '+dtmWhy(c)+legend+'</div>';next()})}};
   const end=()=>{reveal();G.finish(el,{key:"g:"+L.id,pts:score,max:R.length*100,again:play,done,lines:['<p>No country is in Stage 1 today. Stage 2 is now almost only in the Sahel and Central Africa; Stage 5 has spread from Japan and Italy to South Korea, China and much of Europe.</p>']})};
   ask()};play()}}]);

/* ---- Build a population pyramid ---- */
/* share of the whole population in each 10-year band, both sexes (UN World Population Prospects 2024, rounded) */
const PYR={ne:[35,25,15.5,10.5,6.5,4,2.3,1,.2],ng:[30.5,23.5,17,12,8,5,2.7,1.1,.2],in:[16.5,17.5,17.5,15.5,12.5,9.5,6.5,3.4,1.1],us:[11.5,12.8,13.2,13.6,12.4,12.3,12.2,8,4],cn:[9.5,12,11,15,13.5,16,12,7.5,3.5],jp:[6.8,8.6,9.6,10.4,13.5,14,12.2,14.7,10.2],it:[7.2,9.5,10,11.2,14.4,16.5,13.2,10.5,7.5]};
const BANDS=["0–9","10–19","20–29","30–39","40–49","50–59","60–69","70–79","80+"];
G.add("u2",[{id:"pyramid",kind:"game",ch:"hg2b",wide:true,title:"Build a population pyramid",blurb:"Drag the bars to build a real country’s pyramid from its clues, then compare it with the UN data.",skill:"Population pyramids (2.4): reading age structure.",
 intro:"A population pyramid shows how many people are in each age group. Its shape tells a country’s story: a wide base means many children; a pillar means low births and long lives; a top-heavy shape means ageing.",
 play(el,done,L){
  const play=()=>{el.innerHTML="";const R=G.shuffle(Object.keys(PYR)).slice(0,4);let i=0,score=0;const res=[];const H=G.hud(el,{res});const q=h("div","hgx-q");el.appendChild(q);
   const row=h("div","hgx-pyrrow");el.appendChild(row);const fb=h("div","hgx-fbw");el.appendChild(fb);
   const ask=()=>{const c=R[i];H.set(i+1,R.length,score);fb.innerHTML="";row.innerHTML="";let V=BANDS.map(()=>100/9),checked=false;
    q.innerHTML='<b>Build the pyramid of <span class="hgx-t1">'+esc(D.name(c))+'</span></b><small>Clues: '+(D.fert(c)?D.fert(c).toFixed(1)+' children per woman · ':'')+(D.age(c)?'median age '+D.age(c).toFixed(0)+' · ':'')+(D.life(c)?'life expectancy '+D.life(c).toFixed(0):'')+'. Drag each bar (or tap it) to set the share of people in that age group.</small>';
    const side=h("div","hgx-pyr-side");const mini=G.atlas(side,{zoom:false,grat:false});mini.setCls(c,"hl");mini.focusCodes([c],0,2.5);row.appendChild(side);
    const W=440,BH=26,S=11;const box=h("div","hgx-pyrbox");row.appendChild(box);
    const draw=()=>{const tot=V.reduce((a,b)=>a+b,0);const real=PYR[c];
     box.innerHTML='<svg viewBox="0 0 '+W+' '+(BANDS.length*BH+30)+'" class="hgx-pyr">'+BANDS.map((b,k)=>{const y=(BANDS.length-1-k)*BH+4,w=V[k]/2*S;const rw=real[k]/2*S;
      return'<g data-k="'+k+'"><rect class="hit" x="0" y="'+y+'" width="'+W+'" height="'+BH+'"/><rect class="m" x="'+(W/2-w)+'" y="'+(y+2)+'" width="'+w+'" height="'+(BH-5)+'" rx="3"/><rect class="f" x="'+(W/2)+'" y="'+(y+2)+'" width="'+w+'" height="'+(BH-5)+'" rx="3"/>'+
       (checked?'<rect class="real" x="'+(W/2-rw)+'" y="'+(y+2)+'" width="'+rw*2+'" height="'+(BH-5)+'" rx="3"/>':'')+'<text x="'+(W/2)+'" y="'+(y+BH/2+3)+'" text-anchor="middle" class="ag">'+b+'</text><text x="'+(W-4)+'" y="'+(y+BH/2+3)+'" text-anchor="end" class="pc">'+V[k].toFixed(1)+'%'+(checked?' <tspan class="rp">('+real[k]+')</tspan>':'')+'</text></g>'}).join("")+
      '<text x="'+(W/2-8)+'" y="'+(BANDS.length*BH+20)+'" text-anchor="end" class="lb">◂ males</text><text x="'+(W/2+8)+'" y="'+(BANDS.length*BH+20)+'" class="lb">females ▸</text><text x="4" y="'+(BANDS.length*BH+20)+'" class="lb '+(Math.abs(tot-100)>1?"warn":"")+'">total '+tot.toFixed(0)+'%</text></svg>';
     if(checked)return;const svg=box.querySelector("svg");
     const set=e=>{const r=svg.getBoundingClientRect();const x=(e.clientX-r.left)*W/r.width,y=(e.clientY-r.top)*(BANDS.length*BH+30)/r.height;const k=BANDS.length-1-Math.floor((y-4)/BH);if(k<0||k>=BANDS.length)return;
      V[k]=G.clamp(Math.abs(x-W/2)*2/S,0,38);draw()};
     let down=false;svg.onpointerdown=e=>{down=true;svg.setPointerCapture(e.pointerId);set(e)};svg.onpointermove=e=>{if(down)set(e)};svg.onpointerup=()=>{down=false}};
    draw();
    const chk=btn("Compare with the real pyramid","pri",()=>{checked=true;const tot=V.reduce((a,b)=>a+b,0);V=V.map(v=>v*100/tot);const real=PYR[c];const err=V.reduce((a,v,k)=>a+Math.abs(v-real[k]),0);/* 0 = perfect, ~60 = way off */
     const f=G.clamp(1-(err-6)/44,0,1);const p=Math.round(100*f);score+=p;res.push(f);H.set(i+1,R.length,score);draw();chk.remove();
     const shape=real[0]>25?"a wide-based pyramid: many children, a young and fast-growing population (DTM stage 2)":real[0]>15?"a pyramid that is narrowing at the base as births fall (stage 3)":real[7]+real[8]>15?"a top-heavy pyramid: few children and many old people, an ageing population (stage 5)":"a pillar: births have been low for a while and most people live to old age (stage 4)";
     fb.innerHTML='<div class="hgx-fb '+(f>=.8?"ok":f>=.5?"mid":"no")+'"><b>+'+p+'</b> The outline shows the real pyramid (UN, 2024; figures in brackets). '+esc(D.name(c))+' has '+shape+'.'+(c==="cn"?' The pinch at 10–19 and the bulge at 30–39 and 50–59 are echoes of the one-child policy and of earlier baby booms.':'')+(c==="us"?' Immigration of young adults keeps the US pyramid fuller in the middle than Europe’s.':'')+'</div>';
     fb.appendChild(btn(i+1<R.length?"Next country →":"See your score","pri",()=>{i++;if(i<R.length)ask();else end()}))});fb.appendChild(chk)};
   const end=()=>G.finish(el,{key:"g:"+L.id,pts:score,max:R.length*100,again:play,done,lines:['<p>Read a pyramid from the bottom: the base is recent births, so a narrowing base means falling fertility. Bulges are baby booms; dents are wars, famines and policies.</p>']});
   ask()};play()}}]);

/* ---- Crowded or empty? Density duel ---- */
const DUEL=[["bd","jp","Bangladesh packs about 1,300 people into each km², four times Japan, and most of them farm."],["eg","fr","Arithmetic density says Egypt and France are alike (about 110 people per km²). But 95% of Egyptians live on the 4% of land along the Nile: its physiological density, people per km² of farmland, is among the highest on Earth."],
 ["nl","gb","The Netherlands is one of Europe’s most crowded countries, around 520 people per km²."],["in","cn","India has about the same number of people as China on a third of the land."],["ng","us","Nigeria has about 250 people per km², the US under 40."],["au","ca","Both are nearly empty overall, about 3 to 4 people per km², because deserts and frozen north are almost uninhabited."],
 ["kr","jp","South Korea is more crowded than Japan: about 515 against 330 people per km²."],["de","it","Germany, about 235 people per km², is more crowded than Italy, about 195."],["ru","br","Russia, the largest country, has fewer than 9 people per km²; Brazil about 25."],["mn","na","Mongolia is the most sparsely populated sovereign state: about 2 people per km²."],["ph","vn","The Philippines (about 380 per km²) is more crowded than Vietnam (about 315)."],["rw","ug","Rwanda, about 560 people per km², is Africa’s most crowded mainland country."]];
G.add("u2",[{id:"density",kind:"game",ch:"hg2a",wide:true,title:"Crowded or empty? The density duel",blurb:"Two countries light up: which has more people per square kilometre?",skill:"Population density (2.1): arithmetic and physiological.",
 intro:"Arithmetic density is people divided by land area. It hides a lot: physiological density divides people by farmland, and shows the pressure on the land that feeds them.",
 play(el,done,L){
  const play=()=>{el.innerHTML="";const R=G.shuffle(DUEL).slice(0,8);let i=0,score=0,streak=0;const res=[];const H=G.hud(el,{res});const q=h("div","hgx-q");el.appendChild(q);const ch=h("div","hgx-choice hgx-duel");el.appendChild(ch);
   const A=G.atlas(el,{names:false});const fb=h("div","hgx-fbw");el.appendChild(fb);
   const ask=()=>{const[a0,b0]=R[i];const[a,b]=Math.random()<.5?[a0,b0]:[b0,a0];H.set(i+1,R.length,score,streak>1?'<span class="hgx-streak">🔥 '+streak+'</span> ':'');fb.innerHTML="";ch.innerHTML="";A.cls(c=>c===a?"hl":c===b?"hl2":"");A.home=()=>A.focusCodes([a,b],600,1.5);A.home();
    q.innerHTML='<b>Which is more crowded?</b><small>More people per km² of land.</small>';
    [[a,"hgx-t1"],[b,"hgx-t2"]].forEach(([c,cl])=>ch.appendChild(btn('<span class="'+cl+'">'+esc(D.name(c))+'</span>',"big",()=>answer(c))));
    function answer(c){ch.querySelectorAll("button").forEach(x=>x.disabled=true);const da=D.dens(a),db=D.dens(b);const ok=(da>db)===(c===a);streak=ok?streak+1:0;const p=ok?100:0;score+=p;res.push(ok?1:0);H.set(i+1,R.length,score);
     const row=x=>'<tr><td>'+esc(D.name(x))+'</td><td>'+(D.pop(x)/1e6).toFixed(1)+' m</td><td>'+fmt(D.area(x)/1000)+'k km²</td><td><b>'+fmt(D.dens(x))+'</b></td></tr>';
     fb.innerHTML='<div class="hgx-fb '+(ok?"ok":"no")+'"><b>'+(ok?"Right! +100":"No: the other one.")+'</b><table class="hgx-tbl"><tr><th></th><th>people</th><th>area</th><th>per km²</th></tr>'+row(a)+row(b)+'</table><p>'+R[i][2]+'</p></div>';
     fb.appendChild(btn(i+1<R.length?"Next →":"See your score","pri",()=>{i++;if(i<R.length)ask();else end()}))}};
   const end=()=>G.finish(el,{key:"g:"+L.id,pts:score,max:R.length*100,again:play,done});ask()};play()}}]);

/* ---- Draw the great migrations ---- */
const FLOWS=[
 {q:"The world’s largest migration corridor: about 11 million people born in one country live in its northern neighbour.",from:["mx"],to:["us"],f:["Pull: higher wages and jobs","Push: a civil war","Forced: a natural disaster"],why:"Mexico → United States. Wages several times higher pull workers north; family ties then pull relatives (chain migration). Since 2007 more Mexicans have gone home than arrived."},
 {q:"After 2011 the largest refugee population on Earth crossed one border, to a single neighbouring country.",from:["sy"],to:["tr"],f:["Push: civil war","Pull: oil jobs","Pull: farm land"],why:"Syria → Turkey: about 3.5 million at the peak. After Assad fell in December 2024, hundreds of thousands began to go home."},
 {q:"Over 3 million workers from South Asia’s biggest country build and staff a Gulf state where they outnumber the citizens.",from:["in"],to:["ae"],f:["Pull: construction and service jobs","Push: a famine","Forced: deportation"],why:"India → United Arab Emirates: guest workers on fixed contracts. Their remittances make India the world’s largest receiver, over $125 billion a year."},
 {q:"In 2022 millions fled an invasion, most of them first to the western neighbour.",from:["ua"],to:["pl"],f:["Push: war","Pull: retirement","Pull: cheaper housing"],why:"Ukraine → Poland: about a million Ukrainians still hold temporary protection there. Most were women and children, because men of fighting age could not leave."},
 {q:"Since 2015 almost 8 million people have left an oil-rich country whose economy collapsed; its western neighbour took the most.",from:["ve"],to:["co"],f:["Push: economic collapse and shortages","Pull: a gold rush","Forced: a volcano"],why:"Venezuela → Colombia: about 2.8 million. Hyperinflation and shortages pushed; a shared language and an open border made Colombia the easiest destination."},
 {q:"In 2017 about 700,000 members of a persecuted Muslim minority fled across a river border in a few weeks.",from:["mm"],to:["bd"],f:["Push: persecution and violence","Pull: jobs in garment factories","Pull: family reunion"],why:"Myanmar → Bangladesh: the Rohingya, denied citizenship in Myanmar, now live in the camps of Cox’s Bazar, among the largest refugee camps in the world."},
 {q:"Since 2021 millions have left a country taken over by a militant movement; most went to its large western neighbour, which deported over a million in 2025.",from:["af"],to:["ir"],f:["Push: conflict and a new regime","Pull: free university places","Pull: a warmer climate"],why:"Afghanistan → Iran. Many Afghans in Iran have no papers, so they can be deported: an example of how fragile refugee status is."},
 {q:"Since 2023 a war between two armies has sent over a million refugees west across the Sahel, to a country that is itself among the poorest on Earth.",from:["sd"],to:["td"],f:["Push: war","Pull: oil jobs","Push: rising sea level"],why:"Sudan → Chad. Most of Sudan’s 12 million displaced stayed inside Sudan as internally displaced persons."},
 {q:"Former colonial ties and a shared language pull North Africans across the Mediterranean to one European country.",from:["dz","ma","tn"],to:["fr"],f:["Pull: shared language and family ties","Push: a volcano","Pull: cold weather"],why:"Algeria, Morocco, Tunisia → France: migration follows old colonial links, and earlier migrants help the next ones (chain migration)."},
 {q:"Russia’s Asian neighbour sends the most workers to Russia: their remittances are about a third of its whole economy.",from:["tj","uz","kg"],to:["ru"],f:["Pull: jobs and higher wages","Push: an earthquake","Forced: a war"],why:"Central Asia → Russia: Tajikistan is among the countries most dependent on remittances, about a third of its GDP."}];
G.add("u2",[{id:"flows",kind:"game",ch:"hg2c",wide:true,title:"Draw the great migrations",blurb:"Read the clue, draw the arrow from origin to destination, then name the force behind it.",skill:"Push and pull factors, forced and voluntary migration (2.10–2.12).",
 intro:"Migration has an origin, a destination and reasons: push factors at home, pull factors abroad, and obstacles between. Every arrow here is a real flow of the last fifteen years.",
 play(el,done,L){
  const play=()=>{el.innerHTML="";const R=G.shuffle(FLOWS).slice(0,7);let i=0,score=0;const res=[];const H=G.hud(el,{res});const q=h("div","hgx-q");el.appendChild(q);
   const A=G.atlas(el,{names:true});const fb=h("div","hgx-fbw");el.appendChild(fb);const cen=c=>{const f=G.feat(c);return d3.geoCentroid(mainGeomF(f))};
   const ask=()=>{const r=R[i];H.set(i+1,R.length,score);A.clear();A.cls(()=>"");fb.innerHTML="";A.reset();let from=null,pts=0;
    q.innerHTML='<b>'+r.q+'</b><small class="hgx-step">Step 1: click the country they <b>left</b>.</small>';
    A.onClick=c=>{if(!c)return;if(!from){from=c;A.setCls(c,"hl");q.querySelector(".hgx-step").innerHTML="Step 2: click the country they <b>went to</b>.";return}
     if(c===from)return;A.onClick=null;const to=c;A.setCls(to,"hl2");const okF=r.from.includes(from),okT=r.to.includes(to);pts=(okF?25:0)+(okT?25:0);
     A.line(cen(from),cen(to),{arrow:true,cls:"mine",col:"#2b6fd0"});if(!(okF&&okT)){A.line(cen(r.from[0]),cen(r.to[0]),{arrow:true,w:3.5});r.from.concat(r.to).forEach(x=>A.setCls(x,r.from.includes(x)?"hl":"hl2"))}
     A.focusCodes(r.from.concat(r.to,[from,to]),600,1.6);
     q.querySelector(".hgx-step").innerHTML=(okF&&okT?"✓ Right flow (+50). ":okF||okT?"Half right (+25): the red arrow is the real flow. ":"The red arrow is the real flow. ")+"Step 3: what drove it?";
     const opts=G.shuffle(r.f.map((t,k)=>[t,k===0]));const ch=h("div","hgx-choice");opts.forEach(([t,ok])=>ch.appendChild(btn(esc(t),"",()=>{ch.querySelectorAll("button").forEach(x=>x.disabled=true);if(ok)pts+=50;score+=pts;res.push(pts/100);H.set(i+1,R.length,score);
      fb.innerHTML='<div class="hgx-fb '+(pts>=80?"ok":pts>=40?"mid":"no")+'"><b>'+(ok?"Yes. ":"Not that one. ")+'+'+pts+'</b> '+r.why+'</div>';fb.appendChild(btn(i+1<R.length?"Next flow →":"See your score","pri",()=>{i++;if(i<R.length)ask();else end()}))})));
     fb.innerHTML="";fb.appendChild(ch)}};
   const end=()=>G.finish(el,{key:"g:"+L.id,pts:score,max:R.length*100,again:play,done,lines:['<p>Notice the pattern: most migrants move to a neighbouring country or within their region, as Ravenstein predicted in the 1880s; labour flows run from poorer to richer places; refugee flows run from war to the nearest safe border.</p>']});
   ask()};play()}}]);
function mainGeomF(f){const g=f.geometry;if(g.type!=="MultiPolygon")return f;let best=null,ba=-1;g.coordinates.forEach(pl=>{const a=d3.geoArea({type:"Polygon",coordinates:pl});if(a>ba){ba=a;best=pl}});return{type:"Polygon",coordinates:best}}

/* ---- An ageing world: find the extremes ---- */
const AGEQ=[{q:"Click a country where the <b>median age is 45 or more</b>: half the people are older than that.",ok:c=>D.age(c)>=45,f:c=>"median age "+D.age(c).toFixed(1),show:"age"},
 {q:"Click a country where the <b>median age is under 18</b>: half the people are children.",ok:c=>D.age(c)!=null&&D.age(c)<18,f:c=>"median age "+D.age(c).toFixed(1),show:"age"},
 {q:"Click a country where women have <b>fewer than 1.3 children</b> each.",ok:c=>D.fert(c)!=null&&D.fert(c)<1.3,f:c=>D.fert(c).toFixed(2)+" children per woman",show:"fert"},
 {q:"Click a country where women have <b>5 or more children</b> each.",ok:c=>D.fert(c)>=5,f:c=>D.fert(c).toFixed(2)+" children per woman",show:"fert"},
 {q:"Click a country where people live <b>83 years or more</b> on average.",ok:c=>D.life(c)>=83,f:c=>"life expectancy "+D.life(c).toFixed(1),show:"life"},
 {q:"Click a country where <b>one person in five or more</b> was born abroad.",ok:c=>D.mig(c)>=20,f:c=>D.info("mig",c)||"",show:"mig"},
 {q:"Click a country where <b>half or more</b> of all workers farm.",ok:c=>D.farm(c)>=50,f:c=>D.info("farm",c)||"",show:"farm"}];
const thCol=(k,c)=>{try{const T=TH_THEMES[k],v=T.data[c];const x=T.cats.find(z=>z[0]===v);return x?x[2]:null}catch(e){return null}};
G.add("u2",[{id:"ageing",kind:"pick",ch:"hg2d",wide:true,title:"An ageing world: find the extremes",blurb:"Find the oldest, youngest, longest-lived and most migrant countries on the People map’s data.",skill:"Population change and its consequences (2.6–2.9): ageing, fertility and policy.",
 intro:"Falling fertility and longer lives are ageing the world. Some countries now have more grandparents than grandchildren; others are among the youngest populations ever recorded. Countries respond with policies: pronatalist (more babies), antinatalist (fewer), or more immigration.",
 game:()=>({n:6,rounds:AGEQ.map(r=>({q:r.q,ok:c=>{try{return!!r.ok(c)}catch(e){return false}},why:c=>{let t="";try{t=r.f(c)}catch(e){}return esc(D.name(c))+(t?": "+esc(t)+".":": no data.")+(r.show==="age"?" Japan, Italy, South Korea and much of Europe are oldest; the Sahel youngest.":r.show==="fert"?" South Korea’s 0.75 is the lowest; Niger, Chad, Somalia and DR Congo are around 6.":r.show==="mig"?" The Gulf states top the list: most of their workers are migrants.":"")},show:c=>thCol(r.show,c),legend:(()=>{try{return TH_THEMES[r.show].cats.map(x=>'<i style="display:inline-block;width:10px;height:10px;border-radius:3px;background:'+x[2]+';margin:0 4px 0 8px"></i>'+esc(x[1])).join("")}catch(e){return""}})()}))})}]);

/* ---- the existing labs join their chapters ---- */
const CH={u1:{scale:"hg1",decay:"hg1",data:"hg1b",determ:"hg1b",regions:"hg1b"},u2:{dtm:"hg2b",epi:"hg2b",malthus:"hg2d",policy:"hg2d",pushpull:"hg2c",migrant:"hg2c"}};
for(const u in CH)for(const id in CH[u])G.set(u,id,{ch:CH[u][id]});
/* order: the games first in each chapter, then the older labs */
["u1","u2"].forEach(u=>{const A=HUG.labs[u];A.sort((a,b)=>(!!(b.play||b.game||b.mission))-(!!(a.play||a.game||a.mission)))});

const css=document.createElement("style");css.textContent=`
.hgx-t1{ background:#ffcf5a; color:#3a2a00; padding:0 6px; border-radius:6px; } .hgx-t2{ background:#7fc4ff; color:#0b2a48; padding:0 6px; border-radius:6px; }
.hgx-ghost{ fill:#ffcf5a; fill-opacity:.8; stroke:#8a5b00; stroke-width:1.5; vector-effect:non-scaling-stroke; cursor:grab; } .hgx-ghost:active{ cursor:grabbing; }
.hgx-scalebar{ display:flex; gap:10px; align-items:baseline; flex-wrap:wrap; font-size:13px; margin:0 0 6px; } .hgx-scalebar b{ font-size:18px; font-variant-numeric:tabular-nums; }
.hgx-sc-ar{ margin-left:auto; font-weight:800; color:#d9573a; } .hgx-sc-ar.ok{ color:#2f8a63; }
.hgx-dtmw{ margin:0 0 6px; } .hgx-dtm{ width:100%; max-width:560px; display:block; margin:0 auto; }
.hgx-st rect{ fill:rgba(127,127,127,.08); stroke:rgba(127,127,127,.25); cursor:pointer; } .hgx-st:not(.dis):hover rect{ fill:rgba(127,127,127,.18); } .hgx-st.on rect{ fill:rgba(255,207,90,.4); stroke:#d9a21a; } .hgx-st.dis rect{ cursor:default; opacity:.5; }
.hgx-st text{ font:700 11px Inter,system-ui,sans-serif; fill:currentColor; opacity:.75; pointer-events:none; }
.hgx-dtm-b{ fill:none; stroke:#d6402f; stroke-width:2.5; pointer-events:none; } .hgx-dtm-d{ fill:none; stroke:#2b6fd0; stroke-width:2.5; pointer-events:none; } .hgx-dtm-k{ font:700 10px Inter,system-ui,sans-serif; } .hgx-dtm-k.b{ fill:#d6402f; } .hgx-dtm-k.d{ fill:#2b6fd0; }
.hgx-pyrrow{ display:flex; gap:12px; align-items:flex-start; } .hgx-pyr-side{ width:220px; flex:none; } .hgx-pyr-side .hgx-atlas{ border-radius:10px; } .hgx-pyrbox{ flex:1; min-width:0; max-width:560px; margin:0 auto; }
.hgx-pyr{ width:100%; display:block; touch-action:none; cursor:ew-resize; } .hgx-pyr .hit{ fill:transparent; } .hgx-pyr .m{ fill:#5b8fd6; } .hgx-pyr .f{ fill:#e07b8f; } .hgx-pyr .real{ fill:none; stroke:#1d2433; stroke-width:2; stroke-dasharray:5 3; }
.hgx-pyr .ag{ font:700 11px Inter,system-ui,sans-serif; fill:#fff; paint-order:stroke; stroke:rgba(0,0,0,.45); stroke-width:2.5px; pointer-events:none; } .hgx-pyr .pc{ font:600 11px Inter,system-ui,sans-serif; fill:currentColor; opacity:.75; } .hgx-pyr .rp{ font-weight:800; opacity:1; }
.hgx-pyr .lb{ font:600 11px Inter,system-ui,sans-serif; fill:currentColor; opacity:.65; } .hgx-pyr .lb.warn{ fill:#d9573a; opacity:1; }
.hgx-duel .hgx-btn.big{ font-size:15px; padding:10px 18px; }
.hgx-tbl{ border-collapse:collapse; margin:6px 0; font-size:13px; } .hgx-tbl td,.hgx-tbl th{ padding:2px 10px 2px 0; text-align:left; } .hgx-tbl th{ font-size:11px; opacity:.6; }
.hgx-streak{ font-weight:800; color:#d9573a; margin-right:8px; }
.hgx-line.mine{ stroke:#2b6fd0; }
body:not(.light-theme) .hgx-pyr .real{ stroke:#fff; }
@media (max-width:640px){ .hgx-pyr .ag,.hgx-pyr .pc,.hgx-pyr .lb{ font-size:16px; } .hgx-dtm .hgx-st text{ font-size:15px; } .hgx-pyrrow{ flex-direction:column; } .hgx-pyr-side{ width:100%; max-width:260px; } }
`;document.head.appendChild(css);
})();
