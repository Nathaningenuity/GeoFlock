/* GeoFlock: the Trivia page's builder, new kinds of question and game modes.
   - Build a quiz: a search box ("rivers", "Africa", "flags with stars", "capitals of Europe", "islands") that gathers every
     matching question (topic, part, wording, region and the answer's region), plus filters that stack (region, topic,
     difficulty, kind of question, length 10 / 25 / endless), saved quizzes and "Practise my mistakes".
   - New kinds of question, made from the app's own data: map pin (click where it is, 0–100 by distance), photo (which
     country?), higher or lower, put in order, matching, odd one out, number guess, outline and climate graph.
     They also turn up now and then in mixed trivia (see "Adjust the mix").
   - Game modes: Pin Drop, Photo Hunt, Daily Challenge (the same set for everyone each day, a streak and a shareable grid),
     Higher/Lower streak and Survival (three lives, getting harder).
   - The end of every round (these and the main trivia engine's): a score with a kind word, your answer next to the right
     one with the "why", country names that open their profile, a small map of the round's places, XP and stamps earned,
     and "Practise the ones I missed" / "Play again" / "Same topic, harder".
   Answers are never marked with crosses: a miss just shows the right answer. */
(function(){
if(typeof TRIVIA_Q==="undefined"||typeof renderTriviaHome!=="function"||window.gfTriviaModes)return;
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let R=Math.random;
const rnd=()=>R(),pick=a=>a[Math.floor(rnd()*a.length)];
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const BY=COUNTRY_BY_CODE,cname=c=>(BY[c]||{}).n||c;
const flagImg=(c,w,cls)=>BY[c]?'<img class="'+(cls||"tm-flag")+'" src="'+flagUrl(c,w||"w40")+'" alt="" loading="lazy">':"";
const cLink=c=>BY[c]?'<button type="button" class="tm-clink" data-cc="'+c+'">'+flagImg(c)+esc(cname(c))+'</button>':esc(c);
const LSget=(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}};
const LSset=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const fmtN=n=>n>=1e9?(n/1e9).toFixed(2).replace(/\.?0+$/,"")+" billion":n>=1e6?(n/1e6).toFixed(n>=1e7?0:1).replace(/\.0$/,"")+" million":n>=1e4?Math.round(n/1e3)+" thousand":Math.round(n).toLocaleString("en");
const fmtArea=a=>(a>=1e5?Math.round(a/1e3)*1e3:a>=100?Math.round(a/10)*10:Math.round(a)).toLocaleString("en")+" km²";
const fmtM=v=>Math.round(v).toLocaleString("en")+" m",fmtKm=v=>Math.round(v).toLocaleString("en")+" km";
const km=(a,b)=>d3.geoDistance(a,b)*6371;
const dayKey=(d)=>{d=d||new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};
function seeded(str){let h=1779033703^str.length;for(let i=0;i<str.length;i++){h=Math.imul(h^str.charCodeAt(i),3432918353);h=h<<13|h>>>19}let a=h>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function withRng(r,f){const o=R;R=r;try{return f()}finally{R=o}}

/* ---------- regions ---------- */
const CONT_OF=c=>(typeof TV_CONT_OF!=="undefined"&&TV_CONT_OF[c])||[(BY[c]||{}).r];
const SUB=c=>(BY[c]||{}).s||"";
const REGIONS=[
 {id:"Africa",w:["africa","african"],t:c=>CONT_OF(c).includes("Africa")},
 {id:"Asia",w:["asia","asian"],t:c=>CONT_OF(c).includes("Asia")},
 {id:"Europe",w:["europe","european"],t:c=>CONT_OF(c).includes("Europe")},
 {id:"North America",w:["north america","north american"],t:c=>CONT_OF(c).includes("North America")},
 {id:"South America",w:["south america","south american"],t:c=>CONT_OF(c).includes("South America")},
 {id:"Oceania",w:["oceania","pacific","australasia"],t:c=>CONT_OF(c).includes("Oceania")||c==="aq"},
 {id:"Caribbean",w:["caribbean"],t:c=>SUB(c)==="Caribbean",minor:1},
 {id:"Central America",w:["central america","central american"],t:c=>SUB(c)==="Central America",minor:1},
 {id:"Middle East",w:["middle east","middle eastern","arab world"],t:c=>SUB(c)==="Western Asia"&&!["ge","am","az","cy"].includes(c)||c==="eg"||c==="ir",minor:1},
 {id:"Americas",w:["americas","the americas","latin america"],t:c=>CONT_OF(c).some(x=>/America/.test(x)),minor:1}];
const REG=id=>REGIONS.find(r=>r.id===id)||null;

/* ---------- the question pools behind the new kinds ---------- */
const P={};
const COMMON=c=>typeof COMMON_MAP_CODES!=="undefined"&&COMMON_MAP_CODES.has(c);
function pools(){if(P.ok)return P;P.ok=1;
 P.pop=COUNTRIES.map(c=>c.c).filter(c=>COUNTRY_POPULATION[c]>=5e4);
 P.area=COUNTRIES.map(c=>c.c).filter(c=>typeof COUNTRY_AREA_KM2!=="undefined"&&COUNTRY_AREA_KM2[c]>=1);
 const LF=(typeof LANDFORMS!=="undefined"&&LANDFORMS.items)||[];
 const it=(cat,key)=>LF.filter(x=>x.cat===cat&&x.size&&x.size[key]>0).map(x=>({n:x.name,al:x.alt||[],v:x.size[key],cc:(x.countries||[])[0],ccs:x.countries||[],fame:x.fame||x.tier||3,ll:x.geom&&x.geom.t==="pt"?x.geom.c:null,id:x.id}));
 P.peak=it("peaks","height_m").concat(it("volcanoes","height_m")).filter((x,i,a)=>a.findIndex(y=>y.n===x.n)===i);
 P.river=it("rivers","length_km").filter(x=>x.v>=300);
 P.lake=it("lakes","area_km2");P.island=it("islands","area_km2").filter(x=>x.v>=2000);P.desert=it("deserts","area_km2");
 P.lm=((typeof GF_LANDMARKS!=="undefined"&&GF_LANDMARKS)||[]).filter(r=>r&&r[0]&&isFinite(r[1])&&isFinite(r[2])&&BY[r[3]]).map(r=>({n:r[0],ll:[+r[1],+r[2]],cc:r[3],kind:r[4],al:r[6]||[]}));
 P.fameNames=new Set();P.lm.forEach(l=>{P.fameNames.add(l.n.toLowerCase());(l.al||[]).forEach(a=>P.fameNames.add(String(a).toLowerCase()))});
 LF.forEach(x=>{if((x.fame||9)<=1)P.fameNames.add(String(x.name).toLowerCase())});
 /* country photos with captions: [photo index, caption] */
 P.cphoto=[];try{Object.entries(PS_CPHOTO||{}).forEach(([c,L])=>{if(!BY[c])return;(L||[]).forEach(([i,cap])=>{const D=PS_PHOTO_DATA[i];if(!D||!D.d)return;const lc=String(cap||"").toLowerCase();
  const famous=/capital|skyline|old town/.test(lc)||[...P.fameNames].some(n=>n.length>5&&lc.includes(n));P.cphoto.push({i,cc:c,cap:cap||"",famous})})})}catch(e){}
 /* photos with a place on the map, for Photo Hunt */
 P.geo=[];try{(gfGeoGuess.pool()||[]).forEach(p=>{const D=PS_PHOTO_DATA[p.i];if(D&&D.d&&p.at)P.geo.push({i:p.i,ll:p.at,label:p.label||""})})}catch(e){}
 return P}
/* the climate game's places (cities of 300,000+, every capital): read from its file once */
let CITIES=null,citiesP=null;
function loadCities(){if(citiesP)return citiesP;citiesP=fetch("geoflock-climgame.js").then(r=>r.text()).then(t=>{const m=t.match(/"cities":(\[\[.*?\]\])/);CITIES=m?JSON.parse(m[1]).filter(c=>BY[c[1]]).map(c=>({n:c[0],cc:c[1],ll:[c[2],c[3]],cap:!!c[4]})):[];return CITIES}).catch(()=>{CITIES=[];return CITIES});return citiesP}
let thermoOK=false;function loadThermo(){try{if(window.gfThermo&&gfThermo.load&&!loadThermo.c){loadThermo.c=1;gfThermo.load().then(()=>{thermoReady()}).catch(()=>{})}}catch(e){}}
function thermoReady(){if(thermoOK)return true;try{if(window.gfThermo&&gfThermo.at&&gfThermo.at([2.35,48.86]))thermoOK=true;else loadThermo()}catch(e){}return thermoOK}
const centroid=c=>{const x=typeof COUNTRY_CENTROIDS!=="undefined"&&COUNTRY_CENTROIDS[c];return x?[x[1],x[0]]:null};

/* ---------- a small world map of the app's own country shapes: pan, zoom, click ---------- */
const MW=1000,MH=520;let MP=null;
function mapBase(){if(MP)return MP;const p=d3.geoNaturalEarth1().fitExtent([[6,6],[MW-6,MH-6]],{type:"Sphere"});const path=d3.geoPath(p);
 const r1=s=>(s||"").replace(/(\d+\.\d)\d+/g,"$1");
 const feats=projFeatures().filter(f=>f.geometry);
 MP={p,path,feats,land:feats.map(f=>'<path class="tm-land" d="'+r1(path(f))+'"/>').join(""),sphere:r1(path({type:"Sphere"})),grat:r1(path(d3.geoGraticule().step([30,30])()))};return MP}
function makeMap(host,o){o=o||{};const B=mapBase();host.innerHTML='<div class="tm-map'+(o.small?" small":"")+'"><svg viewBox="0 0 '+MW+' '+MH+'" preserveAspectRatio="xMidYMid meet" role="img" aria-label="World map"><path class="tm-sea" d="'+B.sphere+'"/><path class="tm-grat" d="'+B.grat+'"/><g class="tm-lands">'+B.land+'</g><g class="tm-over"></g></svg>'+
  (o.zoom===false?'':'<div class="tm-zbtns"><button type="button" data-z="1" aria-label="Zoom in">+</button><button type="button" data-z="-1" aria-label="Zoom out">−</button><button type="button" data-z="0" aria-label="Whole world">⟲</button></div>')+(o.hint?'<div class="tm-maphint">'+o.hint+'</div>':'')+'</div>';
 const wrap=host.firstChild,svg=wrap.querySelector("svg"),over=svg.querySelector(".tm-over");let vb={x:0,y:0,w:MW,h:MH};const items=[];
 const apply=()=>{svg.setAttribute("viewBox",vb.x+" "+vb.y+" "+vb.w+" "+vb.h);draw()};
 const clampV=()=>{vb.w=Math.max(18,Math.min(MW,vb.w));vb.h=vb.w*MH/MW;vb.x=Math.max(-vb.w*.3,Math.min(MW-vb.w*.7,vb.x));vb.y=Math.max(-vb.h*.3,Math.min(MH-vb.h*.7,vb.y))};
 const zoomAt=(f,cx,cy)=>{const nw=Math.max(18,Math.min(MW,vb.w/f)),k=nw/vb.w;vb.x=cx-(cx-vb.x)*k;vb.y=cy-(cy-vb.y)*k;vb.w=nw;clampV();apply()};
 const toSvg=(x,y)=>{const pt=svg.createSVGPoint();pt.x=x;pt.y=y;const m=svg.getScreenCTM();return m?pt.matrixTransform(m.inverse()):{x:0,y:0}};
 function draw(){const s=vb.w/MW;over.innerHTML=items.map(it=>{if(it.t==="line"){return'<path class="tm-line '+(it.cls||"")+'" d="'+B.path({type:"LineString",coordinates:[it.a,it.b]})+'" style="stroke-width:'+(2.2*s).toFixed(3)+'px;stroke-dasharray:'+(6*s).toFixed(2)+' '+(4*s).toFixed(2)+'"/>'}
  const q=B.p(it.ll);if(!q)return"";const r=(it.r||6)*Math.max(s,.035);return'<g class="tm-pin '+(it.cls||"")+'"><circle cx="'+q[0].toFixed(2)+'" cy="'+q[1].toFixed(2)+'" r="'+r.toFixed(3)+'" style="stroke-width:'+(1.6*s).toFixed(3)+'px"/>'+(it.label?'<text x="'+(q[0]+r*1.5).toFixed(2)+'" y="'+(q[1]+r*.45).toFixed(2)+'" style="font-size:'+(13*s).toFixed(2)+'px;stroke-width:'+(3*s).toFixed(2)+'px">'+esc(it.label)+'</text>':'')+'</g>'}).join("")}
 const api={svg,wrap,add(it){items.push(it);draw();return api},clear(){items.length=0;draw();return api},
  fit(lls,pad){const pts=lls.map(ll=>B.p(ll)).filter(Boolean);if(!pts.length){vb={x:0,y:0,w:MW,h:MH};return apply()}let x0=Math.min(...pts.map(p=>p[0])),x1=Math.max(...pts.map(p=>p[0])),y0=Math.min(...pts.map(p=>p[1])),y1=Math.max(...pts.map(p=>p[1]));
   const w=Math.max(x1-x0,(y1-y0)*MW/MH,pad||90)*1.35,cx=(x0+x1)/2,cy=(y0+y1)/2;vb.w=Math.min(MW,w);vb.h=vb.w*MH/MW;vb.x=cx-vb.w/2;vb.y=cy-vb.h/2;clampV();apply()},
  world(){vb={x:0,y:0,w:MW,h:MH};apply()}};
 wrap.querySelectorAll("[data-z]").forEach(b=>b.onclick=e=>{e.stopPropagation();const z=+b.dataset.z;if(!z)return api.world();zoomAt(z>0?1.8:1/1.8,vb.x+vb.w/2,vb.y+vb.h/2)});
 if(o.pan!==false){
  svg.addEventListener("wheel",e=>{e.preventDefault();const q=toSvg(e.clientX,e.clientY);zoomAt(e.deltaY<0?1.25:1/1.25,q.x,q.y)},{passive:false});
  const ptrs=new Map();let moved=0,start=null,pinch=null;
  svg.addEventListener("pointerdown",e=>{svg.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,[e.clientX,e.clientY]);if(ptrs.size===1){moved=0;start={x:e.clientX,y:e.clientY,vb:Object.assign({},vb)}}else if(ptrs.size===2){const [a,b]=[...ptrs.values()];pinch={d:Math.hypot(a[0]-b[0],a[1]-b[1]),vb:Object.assign({},vb),c:toSvg((a[0]+b[0])/2,(a[1]+b[1])/2)};moved=99}});
  svg.addEventListener("pointermove",e=>{if(!ptrs.has(e.pointerId))return;ptrs.set(e.pointerId,[e.clientX,e.clientY]);
   if(ptrs.size===2&&pinch){const [a,b]=[...ptrs.values()],d=Math.hypot(a[0]-b[0],a[1]-b[1]);vb=Object.assign({},pinch.vb);zoomAt(d/Math.max(1,pinch.d),pinch.c.x,pinch.c.y);return}
   if(ptrs.size===1&&start){const dx=e.clientX-start.x,dy=e.clientY-start.y;moved=Math.max(moved,Math.hypot(dx,dy));if(moved>5){const r=svg.getBoundingClientRect(),k=start.vb.w/Math.min(r.width,r.height*MW/MH);vb.x=start.vb.x-dx*k;vb.y=start.vb.y-dy*k;clampV();apply()}}});
  const up=e=>{const was=ptrs.size;ptrs.delete(e.pointerId);if(ptrs.size<2)pinch=null;if(was===1&&moved<=5&&o.onClick&&e.type==="pointerup"){const q=toSvg(e.clientX,e.clientY),ll=B.p.invert([q.x,q.y]);if(ll&&isFinite(ll[0])&&Math.abs(ll[1])<=90)o.onClick(ll)}if(!ptrs.size)start=null};
  svg.addEventListener("pointerup",up);svg.addEventListener("pointercancel",up)}
 apply();return api}
const pinScore=(d,tol,scale)=>d<=tol?100:Math.max(0,Math.round(100*Math.exp(-(d-tol)/scale)));

/* ---------- the kinds of question ---------- */
const QBYID={};TRIVIA_Q.forEach(q=>QBYID[q.id]=q);
const qById=id=>QBYID[id]||(QBYID[id]=TRIVIA_Q.find(q=>q.id===id));
function near(c,n,pool,excl){excl=new Set(excl||[]);excl.add(c);const all=(pool||COUNTRIES.map(x=>x.c)).filter(x=>BY[x]&&!excl.has(x));
 const s=SUB(c),r=(BY[c]||{}).r;const a=shuffle(all.filter(x=>SUB(x)===s)),b=shuffle(all.filter(x=>SUB(x)!==s&&(BY[x]||{}).r===r)),d=shuffle(all.filter(x=>(BY[x]||{}).r!==r));
 return a.slice(0,Math.ceil(n/2)).concat(b,a.slice(Math.ceil(n/2)),d).slice(0,n)}
const SEC_NAME=s=>(TRIVIA_CAT_BY_ID[s]||{}).name||s;
const partName=(s,b)=>{const T=TRIVIA_CAT_BY_ID[s];const B=T&&T.blocks.find(x=>x.id===b);return B?B.name:""};
/* four buttons; opts [{h:html, ok:bool, txt:plain}] */
function mc(box,head,opts,done,after){let picked=-1;const draw=()=>{box.innerHTML=head+'<div class="tm-opts'+(opts.length>4?" six":"")+'">'+opts.map((o,i)=>{let c="";if(picked>=0){if(o.ok)c=" ok";else if(i===picked)c=" miss";else c=" dim"}
  return'<button type="button" class="tm-o'+c+'" data-i="'+i+'"'+(picked>=0?" disabled":"")+'><kbd>'+(i+1)+'</kbd><span>'+o.h+'</span></button>'}).join("")+'</div>'+(picked>=0&&after?'<div class="tm-after">'+after+'</div>':'');
  box.querySelectorAll(".tm-o").forEach(b=>b.onclick=()=>{if(picked>=0)return;picked=+b.dataset.i;draw();const o=opts[picked],r=opts.find(x=>x.ok);done({sc:o.ok?1:0,yours:o.txt!=null?o.txt:o.h,right:r?(r.txt!=null?r.txt:r.h):"",pick:o})})};draw();
 return{key:k=>{if(picked<0&&/^[1-9]$/.test(k)){const b=box.querySelectorAll(".tm-o")[+k-1];if(b){b.click();return true}}return false}}}
const metaH=(label,d)=>'<div class="tm-meta"><span>'+label+'</span>'+(d?'<span class="tm-dots" title="Difficulty '+d+' of 5">'+[1,2,3,4,5].map(i=>'<i class="'+(i<=d?"on":"")+'"></i>').join("")+'</span>':'')+'</div>';
const qH=t=>'<div class="tm-q">'+t+'</div>';
const SUBS={pop:{l:"population",v:c=>COUNTRY_POPULATION[c],f:fmtN,more:"more people",unit:"people"},area:{l:"area",v:c=>COUNTRY_AREA_KM2[c],f:fmtArea,more:"is larger"},peak:{l:"height",f:fmtM,more:"is higher"},river:{l:"length",f:fmtKm,more:"is longer"}};
function itemsFor(sub,o){const p=pools();o=o||{};const reg=o.reg;
 if(sub==="pop"||sub==="area"){const L=(sub==="pop"?p.pop:p.area).filter(c=>!reg||reg.t(c));const easy=o.d!=null&&o.d<=2;return(easy?L.filter(COMMON):L).map(c=>({n:cname(c),cc:c,v:SUBS[sub].v(c),key:c}))}
 const L=(sub==="peak"?p.peak:p.river).filter(x=>!reg||(x.ccs||[]).some(reg.t));return(o.d!=null&&o.d<=2?L.filter(x=>x.fame<=2):L).map(x=>({n:x.n,cc:x.cc,v:x.v,key:x.n,ll:x.ll}))}
const subOk=(t,o)=>!o.subs||!o.subs.length||o.subs.includes(t);
const itemH=(it,big)=>(it.cc&&BY[it.cc]&&!SUBS_PLACE(it)?flagImg(it.cc,big?"w80":"w40"):"")+'<b>'+esc(it.n)+'</b>'+(it.cc&&SUBS_PLACE(it)?'<small>'+esc(cname(it.cc))+'</small>':'');
const SUBS_PLACE=it=>it.n!==cname(it.cc);
const TYPES={};
/* text: a question from the trivia bank, as four choices */
TYPES.text={name:"Trivia question",icon:"❓",
 render(q,box,done){const Q=qById(q.qid);if(!Q)return done({sc:0,yours:"",right:""});let opts;
  if(Q.x){const g=(typeof TV_X_GROUP!=="undefined"&&TV_X_GROUP[Q.x.k])||"region";const pool=[...(((typeof TV_X_POOL!=="undefined"&&TV_X_POOL[g])||new Map()).keys())];const low=new Set([Q.x.n].concat(Q.x.al||[]).map(s=>String(s).toLowerCase()));
   const same=pool.filter(n=>!low.has(n.toLowerCase())&&(typeof TV_X_KIND_OF==="undefined"||TV_X_KIND_OF[n]===Q.x.k));const other=pool.filter(n=>!low.has(n.toLowerCase())&&!same.includes(n));
   const ds=shuffle(same).concat(shuffle(other)).slice(0,3);opts=shuffle([{h:esc(Q.x.n),ok:true,txt:esc(Q.x.n)}].concat(ds.map(n=>({h:esc(n),ok:false,txt:esc(n)}))))}
  else{const right=Q.e?pick(Q.a):Q.a[0];const ds=near(right,3,null,Q.a);opts=shuffle([right].concat(ds)).map(c=>({h:flagImg(c)+esc(cname(c)),ok:Q.a.includes(c),txt:cLink(c),cc:c}))}
  const med=Q.k&&Q.k!=="loc"&&typeof tvMediaHTML==="function"?tvMediaHTML(Q):"";
  return mc(box,metaH(esc(SEC_NAME(Q.s))+(partName(Q.s,Q.b)?" · "+esc(partName(Q.s,Q.b)):""),Q.d)+qH(esc(typeof tvText==="function"?tvText(Q):Q.t))+med,opts,res=>{
   res.codes=Q.x?(Q.kc||[]):Q.a.slice(0,1);res.why=Q.w||"";
   if(!Q.x)res.right=Q.a.length>1&&Q.e?Q.a.map(cLink).join(" or "):cLink(Q.a[0]);
   try{const keep=trivia.picks;trivia.picks=res.pick&&res.pick.cc?[res.pick.cc]:[];try{triviaRecord(Q,res.sc)}finally{trivia.picks=keep}}catch(e){}
   done(res)})},
 label:q=>{const Q=qById(q.qid);return Q?(typeof tvText==="function"?tvText(Q):Q.t):""}};
/* map pin: click where it is */
TYPES.pin={name:"Map pin",icon:"📍",
 gen(o){const p=pools(),reg=o.reg,d=o.d;const cand=[];
  const capOK=CITIES&&CITIES.length&&subOk("capital",o),lmOK=subOk("landmark",o),pkOK=subOk("peak",o),ctOK=CITIES&&CITIES.length&&subOk("city",o);
  if(capOK)CITIES.filter(c=>c.cap&&(!reg||reg.t(c.cc))&&(d==null||(d<=2?COMMON(c.cc):d>=4?!COMMON(c.cc):true))).forEach(c=>cand.push({sub:"capital",n:c.n,cc:c.cc,ll:c.ll,d:COMMON(c.cc)?2:4}));
  if(lmOK)p.lm.filter(l=>(!reg||reg.t(l.cc))).forEach(l=>{const f=P.fameNames.has(l.n.toLowerCase())&&COMMON(l.cc);if(d!=null&&(d<=2&&!COMMON(l.cc)))return;cand.push({sub:"landmark",n:l.n,cc:l.cc,ll:l.ll,d:COMMON(l.cc)?3:4})});
  if(pkOK)p.peak.filter(x=>x.ll&&(!reg||(x.ccs||[]).some(reg.t))&&(d==null||(d<=2?x.fame<=1:true))).forEach(x=>cand.push({sub:"peak",n:x.n,cc:x.cc,ll:x.ll,d:x.fame<=1?2:4}));
  if(ctOK&&(d==null||d>=3))CITIES.filter(c=>!c.cap&&(!reg||reg.t(c.cc))).forEach(c=>cand.push({sub:"city",n:c.n,cc:c.cc,ll:c.ll,d:5}));
  const L=cand.filter(c=>!o.avoid||!o.avoid.has("pin:"+c.n));if(!L.length)return null;
  /* spread the kinds: pick a kind first, then a place */
  const subs=[...new Set(L.map(c=>c.sub))],s=pick(subs),c=pick(L.filter(x=>x.sub===s));return Object.assign({type:"pin",key:"pin:"+c.n},c)},
 text(q){return q.sub==="capital"?"Where is "+esc(q.n)+"?":q.sub==="peak"?"Where is "+esc(q.n)+"?":"Where is "+esc(q.n)+"?"},
 hint(q){return q.sub==="capital"?"the capital of "+esc(cname(q.cc)):q.sub==="city"?"a city in "+esc(cname(q.cc)):q.sub==="peak"?"a mountain"+(q.cc?" in "+esc(cname(q.cc)):""):"in "+esc(cname(q.cc))},
 render(q,box,done,o){o=o||{};let fin=false;box.innerHTML=metaH("📍 Map pin · "+({capital:"Capitals",landmark:"Landmarks",peak:"Mountains",city:"Cities"}[q.sub]||"Places"),q.d)+qH(this.text(q)+' <small class="tm-hint">'+flagImg(q.cc)+this.hint(q)+'</small>')+'<div class="tm-mapbox"></div><div class="tm-pinmsg">Click or tap the map where you think it is. Zoom in for a closer look.</div>';
  const m=makeMap(box.querySelector(".tm-mapbox"),{onClick:ll=>{if(fin)return;fin=true;const d=km(ll,q.ll),sc=pinScore(d,o.tol||25,o.scale||700);
   m.add({t:"line",a:ll,b:q.ll}).add({ll,cls:"you",label:"you"}).add({ll:q.ll,cls:"ans",label:q.n});m.fit([ll,q.ll],60);
   box.querySelector(".tm-pinmsg").innerHTML='<b>'+(d<1?"Spot on!":Math.round(d).toLocaleString("en")+" km away")+'</b> · '+sc+' points';
   done({sc:sc/100,pts:sc,kmOff:d,yours:Math.round(d).toLocaleString("en")+" km off",right:esc(q.n)+", "+cLink(q.cc),codes:[q.cc],ll:q.ll})}});
  return{}},
 label:q=>"Where is "+q.n+"?"};
/* photo: which country is this? */
TYPES.photo={name:"Photo",icon:"📷",
 gen(o){const p=pools();let L=p.cphoto.filter(x=>(!o.reg||o.reg.t(x.cc))&&(!o.avoid||!o.avoid.has("ph:"+x.i)));if(o.d!=null){if(o.d>=4)L=L.filter(x=>!x.famous);else if(o.d<=2)L=L.filter(x=>x.famous||COMMON(x.cc))}if(!L.length)return null;
  const x=pick(L);return{type:"photo",key:"ph:"+x.i,i:x.i,cc:x.cc,cap:x.cap,d:x.famous?2:COMMON(x.cc)?3:5}},
 render(q,box,done){const D=PS_PHOTO_DATA[q.i];if(!D)return done({sc:0});const opts=shuffle([q.cc].concat(near(q.cc,3))).map(c=>({h:flagImg(c)+esc(cname(c)),ok:c===q.cc,txt:cLink(c),cc:c}));
  return mc(box,metaH("📷 Photo",q.d)+qH("Which country is this?")+'<figure class="tm-photo"><img src="'+gfSrc(D.d)+'" alt="A photo somewhere in the world"><figcaption>'+esc(D.by||"")+(D.lic?" · "+esc(D.lic):"")+'</figcaption></figure>',opts,res=>{res.right=esc(q.cap?q.cap+", ":"")+cLink(q.cc);res.codes=[q.cc];done(res)},null)},
 label:q=>"Which country is this photo from?",thumb:q=>{const D=PS_PHOTO_DATA[q.i];return D?gfSrc(D.d):""}};
/* higher or lower */
TYPES.hl={name:"Higher or lower",icon:"↕️",
 gen(o){const subs=["pop","area","peak","river"].filter(s=>subOk(s,o));if(!subs.length)return null;for(let k=0;k<6;k++){const s=pick(subs),L=itemsFor(s,o);if(L.length<2)continue;
   const a=o.from&&o.from.sub===s?o.from.b:pick(L);let tries=0,b;do{b=pick(L);tries++}while(tries<30&&(b.key===a.key||Math.max(a.v,b.v)/Math.min(a.v,b.v)<1.12));if(b.key===a.key)continue;
   const ratio=Math.max(a.v,b.v)/Math.min(a.v,b.v);return{type:"hl",key:"hl:"+s+":"+a.key+":"+b.key,sub:s,a,b,d:ratio>4?1:ratio>2?2:ratio>1.5?3:4}}return null},
 ask(q){return{pop:"Does it have more or fewer people?",area:"Is it larger or smaller?",peak:"Is it higher or lower?",river:"Is it longer or shorter?"}[q.sub]},
 words(q){return{pop:["More","Fewer"],area:["Larger","Smaller"],peak:["Higher","Lower"],river:["Longer","Shorter"]}[q.sub]},
 render(q,box,done){const S=SUBS[q.sub],W=this.words(q);let fin=false;const card=(it,show)=>'<div class="tm-hlc">'+itemH(it,true)+'<span class="tm-hlv">'+(show?esc(S.f(it.v)):"?")+'</span></div>';
  const draw=(pickI)=>{box.innerHTML=metaH("↕️ Higher or lower · "+esc(S.l),q.d)+'<div class="tm-hl">'+card(q.a,true)+'<div class="tm-hlvs">vs</div>'+card(q.b,fin)+'</div>'+qH(esc(q.b.n)+": "+this.ask(q))+
   '<div class="tm-opts two">'+W.map((w,i)=>{const ok=i===0?q.b.v>q.a.v:q.b.v<q.a.v;return'<button type="button" class="tm-o'+(fin?(ok?" ok":i===pickI?" miss":" dim"):"")+'" data-i="'+i+'"'+(fin?" disabled":"")+'><kbd>'+(i+1)+'</kbd><span>'+(i?"▼ ":"▲ ")+w+'</span></button>'}).join("")+'</div>';
   box.querySelectorAll(".tm-o").forEach(b=>b.onclick=()=>{if(fin)return;fin=true;const i=+b.dataset.i,ok=i===0?q.b.v>q.a.v:q.b.v<q.a.v;draw(i);
    done({sc:ok?1:0,yours:W[i],right:W[q.b.v>q.a.v?0:1]+" — "+esc(q.b.n)+" "+esc(S.f(q.b.v))+" vs "+esc(q.a.n)+" "+esc(S.f(q.a.v)),codes:[q.a.cc,q.b.cc].filter(Boolean)})})};draw(-1);
  return{key:k=>{const b=box.querySelectorAll(".tm-o")[+k-1];if(!fin&&b&&/^[12]$/.test(k)){b.click();return true}return false}}},
 label:q=>q.b.n+" vs "+q.a.n+": "+SUBS[q.sub].l};
/* put in order */
TYPES.order={name:"Put in order",icon:"🔢",
 gen(o){const subs=["pop","area","peak","river"].filter(s=>subOk(s,o));if(!subs.length)return null;for(let k=0;k<6;k++){const s=pick(subs),L=itemsFor(s,o);const n=o.d!=null&&o.d>=4?5:4;if(L.length<n)continue;
   const its=[];let t=0;while(its.length<n&&t<200){t++;const x=pick(L);if(its.some(y=>y.key===x.key||Math.max(x.v,y.v)/Math.min(x.v,y.v)<1.08))continue;its.push(x)}if(its.length<n)continue;
   return{type:"order",key:"ord:"+s+":"+its.map(x=>x.key).sort().join(","),sub:s,items:its,d:n===5?4:3}}return null},
 head(q){return{pop:"Put these in order, most people first",area:"Put these in order, largest first",peak:"Put these in order, highest first",river:"Put these in order, longest first"}[q.sub]},
 render(q,box,done){const S=SUBS[q.sub];const its=q.items,sel=[];let fin=false;const right=its.map((x,i)=>i).sort((a,b)=>its[b].v-its[a].v);
  const draw=()=>{box.innerHTML=metaH("🔢 Put in order · "+esc(S.l),q.d)+qH(this.head(q))+'<p class="tm-sub">Tap them in order. Tap again to undo.</p><div class="tm-ord">'+its.map((x,i)=>{const r=sel.indexOf(i),cr=right.indexOf(i);
    return'<button type="button" class="tm-oi'+(r>=0?" on":"")+(fin?(r===cr?" ok":" off"):"")+'" data-i="'+i+'"'+(fin?" disabled":"")+'><span class="tm-oin">'+(fin?cr+1:r>=0?r+1:"")+'</span><span class="tm-oit">'+itemH(x)+'</span>'+(fin?'<span class="tm-oiv">'+esc(S.f(x.v))+(r!==cr?' <small>you: '+(r+1)+'</small>':'')+'</span>':'')+'</button>'}).join("")+'</div>'+
    (fin?'':'<div class="tm-acts"><button type="button" class="tv-go" id="tmOrdGo"'+(sel.length<its.length?" disabled":"")+'>Check</button></div>');
   box.querySelectorAll(".tm-oi").forEach(b=>b.onclick=()=>{if(fin)return;const i=+b.dataset.i,r=sel.indexOf(i);if(r>=0)sel.splice(r);else{sel.push(i);if(sel.length===its.length-1)sel.push(its.findIndex((x,j)=>!sel.includes(j)))}draw()});
   const g=box.querySelector("#tmOrdGo");if(g)g.onclick=()=>{fin=true;let ok=0,n=0;for(let a=0;a<its.length;a++)for(let b=a+1;b<its.length;b++){n++;const sa=sel.indexOf(a),sb=sel.indexOf(b);if((sa<sb)===(its[a].v>its[b].v))ok++}
    const exact=sel.every((x,k)=>x===right[k]);draw();done({sc:exact?1:Math.round(ok/n*100)/100,yours:sel.map(i=>esc(its[i].n)).join(" › "),right:right.map(i=>esc(its[i].n)+" <small>"+esc(S.f(its[i].v))+"</small>").join(" › "),codes:its.map(x=>x.cc).filter(Boolean)})}};draw();return{}},
 label:q=>"Put in order by "+SUBS[q.sub].l+": "+q.items.map(x=>x.n).join(", ")};
/* matching: four capitals to four countries, or four flags to their names */
TYPES.match={name:"Matching",icon:"🔗",
 gen(o){const subs=["capital","flag"].filter(s=>subOk(s,o));if(!subs.length)return null;const s=pick(subs);
  let L=COUNTRIES.filter(c=>(c.caps||[]).length&&(!o.reg||o.reg.t(c.c))).map(c=>c.c);if(o.d!=null&&o.d<=2)L=L.filter(COMMON);else if(o.d!=null&&o.d>=4)L=L.filter(c=>!COMMON(c));if(L.length<4)L=COUNTRIES.filter(c=>(c.caps||[]).length&&(!o.reg||o.reg.t(c.c))).map(c=>c.c);if(L.length<4)return null;
  const a=pick(L),four=[a].concat(near(a,3,L));return{type:"match",key:"m:"+s+":"+four.slice().sort().join(","),sub:s,cs:four,d:four.every(COMMON)?2:4}},
 render(q,box,done){const cap=c=>{const t=(typeof TV_ID_CAP_NAME!=="undefined"&&TV_ID_CAP_NAME[c])||(BY[c].caps||[])[0];return t};const L=q.cs.slice(),Rt=shuffle(q.cs.slice());const pair={};let selL=null,selR=null,fin=false;const COL=["#e8701a","#3a95d0","#7a5cc7","#2e9e6a"];
  const leftH=c=>q.sub==="flag"?'<img class="tm-mflag" src="'+flagUrl(c,"w160")+'" alt="A flag">':flagImg(c)+esc(cname(c));
  const rightH=c=>q.sub==="flag"?esc(cname(c)):esc(cap(c));
  const draw=()=>{const used=Object.values(pair);box.innerHTML=metaH("🔗 Matching · "+(q.sub==="flag"?"Flags":"Capitals"),q.d)+qH(q.sub==="flag"?"Match each flag to its country":"Match each country to its capital")+'<p class="tm-sub">Tap one on each side to pair them. Tap a pair again to undo.</p><div class="tm-match"><div class="tm-mcol">'+
   L.map((c,i)=>{const k=pair[c]!=null?Object.keys(pair).indexOf(c):-1;const st=pair[c]!=null?' style="--mc:'+COL[L.indexOf(c)]+'"':'';return'<button type="button" class="tm-mi'+(pair[c]!=null?" on":"")+(selL===c?" sel":"")+(fin?(pair[c]===c?" ok":" off"):"")+'" data-l="'+c+'"'+st+(fin?" disabled":"")+'>'+leftH(c)+'</button>'}).join("")+'</div><div class="tm-mcol">'+
   Rt.map(c=>{const owner=Object.keys(pair).find(k=>pair[k]===c);const st=owner?' style="--mc:'+COL[L.indexOf(owner)]+'"':'';return'<button type="button" class="tm-mi r'+(owner?" on":"")+(selR===c?" sel":"")+(fin&&owner?(owner===c?" ok":" off"):"")+'" data-r="'+c+'"'+st+(fin?" disabled":"")+'>'+rightH(c)+(fin&&owner!==c?'<small>'+(q.sub==="flag"?"":"capital of ")+esc(cname(c))+'</small>':'')+'</button>'}).join("")+'</div></div>'+
   (fin?'':'<div class="tm-acts"><button type="button" class="tv-go" id="tmMGo"'+(Object.keys(pair).length<4?" disabled":"")+'>Check</button></div>');
   const auto=()=>{if(Object.keys(pair).length===3){const l=L.find(x=>pair[x]==null),r=Rt.find(x=>!Object.values(pair).includes(x));if(l&&r)pair[l]=r;selL=selR=null}};
   box.querySelectorAll("[data-l]").forEach(b=>b.onclick=()=>{const c=b.dataset.l;if(pair[c]!=null){delete pair[c];selL=c;selR=null}else if(selR){pair[c]=selR;selL=selR=null}else selL=selL===c?null:c;auto();draw()});
   box.querySelectorAll("[data-r]").forEach(b=>b.onclick=()=>{const c=b.dataset.r;const owner=Object.keys(pair).find(k=>pair[k]===c);if(owner)delete pair[owner];if(selL){pair[selL]=c;selL=selR=null}else selR=selR===c?null:c;auto();draw()});
   const g=box.querySelector("#tmMGo");if(g)g.onclick=()=>{fin=true;const ok=L.filter(c=>pair[c]===c).length;draw();done({sc:ok/4,yours:ok+" of 4 matched",right:L.map(c=>(q.sub==="flag"?flagImg(c):cLink(c))+(q.sub==="flag"?" "+cLink(c):" → "+esc(cap(c)))).join("<br>"),codes:L.slice()})}};draw();return{}},
 label:q=>q.sub==="flag"?"Match the flags: "+q.cs.map(cname).join(", "):"Match the capitals: "+q.cs.map(cname).join(", ")};
/* odd one out */
const ODD_SETS=[
 {id:"landlocked",w:"have no coast: they are landlocked",yes:"af ad am at by bt bo bw bf bi cf td cz et hu xk kg la ls li lu mk mw ml md mn np ne py rw sm rs sk ss ch tj ug uz va zm zw",
  no:"fr de it es pt pl ro bg gr al hr me ba si nl be dk se no fi ee lv lt ie gb ua tr ar br cl pe co ve ec uy th vn kh my cn in pk ir sa ye om ng gh ci sn gn cm ga cg cd ao na za mz tz ke so er dz ma tn ly eg sd"},
 {id:"eu",w:"are members of the European Union",yes:"at be bg hr cy cz dk ee fi fr de gr hu ie it lv lt lu mt nl pl pt ro sk si es se",no:"no ch is gb rs ua al mk ba me md by li ad mc sm"},
 {id:"equator",w:"are crossed by the equator",yes:"ec co br st ga cg cd ug ke so id ki mv",no:"ve cm tz et ss ng my ph pg rw bi sg gh"},
 {id:"monarchy",w:"have their own monarch (a king, queen, emperor, prince, sultan or emir)",yes:"gb es nl be dk no se li mc jp th kh my bn bt sa jo ma ae qa kw bh om sz ls to",no:"fr de it pt ie fi at ch us mx in cn kr id ph eg dz tn ir iq sy tr gr pl za ke ng br ar"},
 {id:"spanish",w:"have Spanish as an official language",yes:"es mx gt hn sv ni cr pa cu do co ve ec pe bo cl ar py uy",no:"br pt bz gy sr ht jm it fr"},
 {id:"portuguese",w:"have Portuguese as an official language",yes:"pt br ao mz gw cv st tl",no:"es ar uy py za na zw cm sn"},
 {id:"island",w:"are island countries with no land border",yes:"is jp ph lk mg mu sc cv st km mv sg cu jm bs bb tt ag dm lc vc gd kn mt fj ws to vu sb ki tv nr pw fm mh nz bh",no:"pt es fr gb ie no dk th vn my mx cr pa ve ar cl za ke tz mz gh sn ec pe"}];
TYPES.odd={name:"Odd one out",icon:"🧩",
 gen(o){for(let k=0;k<10;k++){const S=pick(ODD_SETS),yes=S.yes.split(" ").filter(c=>BY[c]),no=S.no.split(" ").filter(c=>BY[c]);let ys=yes.filter(c=>!o.reg||o.reg.t(c)),ns=no.filter(c=>!o.reg||o.reg.t(c));if(ys.length<3||!ns.length)continue;
   if(o.d!=null&&o.d<=2){const y2=ys.filter(COMMON),n2=ns.filter(COMMON);if(y2.length>=3&&n2.length){ys=y2;ns=n2}}
   const odd=pick(ns),three=shuffle(ys.slice()).sort((a,b)=>(SUB(b)===SUB(odd))-(SUB(a)===SUB(odd))||(BY[b].r===BY[odd].r)-(BY[a].r===BY[odd].r)).slice(0,3);
   return{type:"odd",key:"odd:"+S.id+":"+odd,set:S.id,cs:shuffle(three.concat(odd)),odd,d:[odd].concat(three).every(COMMON)?2:4}}return null},
 render(q,box,done){const S=ODD_SETS.find(s=>s.id===q.set);const opts=q.cs.map(c=>({h:flagImg(c)+esc(cname(c)),ok:c===q.odd,txt:cLink(c),cc:c}));
  return mc(box,metaH("🧩 Odd one out",q.d)+qH("Which is the odd one out?"),opts,res=>{res.right=cLink(q.odd);res.why="The other three "+S.w+"; "+cname(q.odd)+" doesn't.";res.codes=q.cs.slice();done(res)},"The other three "+esc(S.w)+"; "+esc(cname(q.odd))+" doesn’t.")},
 label:q=>"Odd one out: "+q.cs.map(cname).join(", ")};
/* number guess on a slider */
TYPES.num={name:"Number guess",icon:"🎚️",
 gen(o){const subs=["pop","area","peak","river"].filter(s=>subOk(s,o));if(!subs.length)return null;const s=pick(subs),L=itemsFor(s,o).filter(x=>s!=="pop"||x.v>=2e5);if(!L.length)return null;const x=pick(L);
  return{type:"num",key:"num:"+s+":"+x.key,sub:s,it:x,d:s==="pop"||s==="area"?(COMMON(x.cc)?3:4):3}},
 cfg(q){const v=q.it.v;return q.sub==="pop"?{lo:5,hi:9.3,log:1,start:1e7,tol:[1.15,1.5,3]}:q.sub==="area"?{lo:2,hi:7.3,log:1,start:2e5,tol:[1.15,1.5,3]}:q.sub==="peak"?{lo:0,hi:9000,start:4000,tol:[.05,.12,.3]}:{lo:0,hi:7000,start:2000,tol:[.07,.15,.4]}},
 render(q,box,done){const S=SUBS[q.sub],C=this.cfg(q);const to=x=>C.log?(Math.log10(x)-C.lo)/(C.hi-C.lo):(x-C.lo)/(C.hi-C.lo),from=s=>C.log?Math.pow(10,C.lo+s*(C.hi-C.lo)):C.lo+s*(C.hi-C.lo);let val=C.start,fin=false;
  const ask={pop:"How many people live in "+esc(q.it.n)+"?",area:"How large is "+esc(q.it.n)+"?",peak:"How high is "+esc(q.it.n)+"?",river:"How long is the "+esc(q.it.n.replace(/^the /i,""))+"?"}[q.sub];
  const draw=(sc)=>{box.innerHTML=metaH("🎚️ Number guess · "+esc(S.l),q.d)+qH(ask)+(q.it.cc&&BY[q.it.cc]?'<div class="tm-numflag">'+flagImg(q.it.cc,"w80")+(SUBS_PLACE(q.it)?'<small>'+esc(cname(q.it.cc))+'</small>':'')+'</div>':'')+
   '<div class="tm-num"><output>'+esc(S.f(val))+'</output><input type="range" min="0" max="1000" value="'+Math.round(Math.max(0,Math.min(1,to(val)))*1000)+'"'+(fin?" disabled":"")+' aria-label="Your guess"></div>'+(fin?'<div class="tm-numres">The answer is <b>'+esc(S.f(q.it.v))+'</b> · '+Math.round(sc*100)+' points</div>':'<div class="tm-acts"><button type="button" class="tv-go" id="tmNumGo">Lock it in</button></div>');
   const r=box.querySelector("input[type=range]"),out=box.querySelector("output");if(r&&!fin)r.oninput=()=>{val=from(+r.value/1000);out.textContent=S.f(val)};
   const g=box.querySelector("#tmNumGo");if(g)g.onclick=()=>{fin=true;const v=q.it.v;let e=C.log?Math.abs(Math.log(val/v)):Math.abs(val-v)/v;const t=C.tol.map(x=>C.log?Math.log(x):x);const sc=e<=t[0]?1:e<=t[1]?.7:e<=t[2]?.35:0;draw(sc);
    done({sc,yours:esc(S.f(val)),right:esc(S.f(v)),codes:q.it.cc?[q.it.cc]:[],ll:q.it.ll||null})}};draw();
  return{key:k=>{if(k==="Enter"&&!fin){const g=box.querySelector("#tmNumGo");if(g){g.click();return true}}return false}}},
 label:q=>({pop:"How many people live in ",area:"How large is ",peak:"How high is ",river:"How long is "}[q.sub])+q.it.n+"?"};
/* outline: which country has this shape? */
TYPES.outline={name:"Outline",icon:"🗺️",
 gen(o){let L=COUNTRIES.map(c=>c.c).filter(c=>(!o.reg||o.reg.t(c))&&COUNTRY_AREA_KM2[c]>=3000);if(o.d!=null&&o.d<=2)L=L.filter(COMMON);else if(o.d!=null&&o.d>=4)L=L.filter(c=>!COMMON(c));if(o.avoid)L=L.filter(c=>!o.avoid.has("ol:"+c));if(!L.length)return null;const c=pick(L);return{type:"outline",key:"ol:"+c,cc:c,d:COMMON(c)?2:4}},
 render(q,box,done){const opts=shuffle([q.cc].concat(near(q.cc,3))).map(c=>({h:esc(cname(c)),ok:c===q.cc,txt:cLink(c),cc:c}));let svg="";try{svg=countryOutlineSVG(q.cc,"tm-shape")}catch(e){}
  return mc(box,metaH("🗺️ Outline",q.d)+qH("Which country has this shape?")+'<div class="tm-outline">'+svg+'</div>',opts,res=>{res.right=cLink(q.cc);res.codes=[q.cc];done(res)},flagImg(q.cc,"w80"))},
 label:q=>"Which country has this outline?"};
/* climate graph: which place has this climate? */
TYPES.clim={name:"Climate graph",icon:"🌦️",
 gen(o){if(!thermoReady()||!CITIES||!CITIES.length||!window.gfThermo)return null;const L=CITIES.filter(c=>(c.cap||o.d==null||o.d>=4)&&(!o.reg||o.reg.t(c.cc)));for(let k=0;k<8;k++){const c=pick(L);if(!c)return null;const d=gfThermo.at(c.ll);if(!d||!d.T)continue;const K=gfThermo.koppen(d.T,d.P,c.ll[1]);
   const others=[];let t=0;while(others.length<3&&t<120){t++;const x=pick(CITIES.filter(y=>y.cap));if(!x||x.n===c.n||others.some(y=>y.n===x.n))continue;const dx=gfThermo.at(x.ll);if(!dx||!dx.T)continue;const Kx=gfThermo.koppen(dx.T,dx.P,x.ll[1]);if(String(Kx)===String(K)||(o.d==null||o.d<=3)&&String(Kx).charAt(0)===String(K).charAt(0))continue;others.push(x)}
   if(others.length<3)continue;return{type:"clim",key:"cl:"+c.n,c:{n:c.n,cc:c.cc,ll:c.ll},o:others.map(x=>({n:x.n,cc:x.cc,ll:x.ll})),k:String(K),d:c.cap&&COMMON(c.cc)?3:4}}return null},
 render(q,box,done){const d=window.gfThermo&&gfThermo.at(q.c.ll);if(!d)return done({sc:0,yours:"",right:esc(q.c.n)});const opts=shuffle([q.c].concat(q.o)).map(x=>({h:flagImg(x.cc)+esc(x.n)+'<small>'+esc(cname(x.cc))+'</small>',ok:x.n===q.c.n,txt:esc(x.n)}));
  const kn=(gfThermo.KN||{})[q.k]||q.k;return mc(box,metaH("🌦️ Climate graph",q.d)+qH("Which of these places has this climate?")+'<div class="tm-clim">'+gfThermo.graph(d.T,d.P)+'</div>',opts,res=>{res.right=esc(q.c.n)+", "+cLink(q.c.cc);res.why=q.c.n+" has a "+String(kn).toLowerCase()+" climate.";res.codes=[q.c.cc];res.ll=q.c.ll;done(res)},esc(q.c.n)+": "+esc(kn))},
 label:q=>"Which place has this climate graph? ("+q.c.n+")"};
/* photo hunt: where was this photo taken? (place it on the map) */
TYPES.phunt={name:"Photo on the map",icon:"🧭",
 gen(o){const p=pools();let L=p.geo;if(o.avoid)L=L.filter(x=>!o.avoid.has("phm:"+x.i));if(!L.length)return null;const x=pick(L);return{type:"phunt",key:"phm:"+x.i,i:x.i,ll:x.ll,label:x.label,d:3}},
 render(q,box,done){const D=PS_PHOTO_DATA[q.i];if(!D)return done({sc:0});let fin=false;box.innerHTML=metaH("🧭 Photo Hunt",0)+qH("Where was this photo taken?")+'<div class="tm-hunt"><figure class="tm-photo hunt"><img src="'+gfSrc(D.d)+'" alt="A photo somewhere in the world"><figcaption>'+esc(D.by||"")+(D.lic?" · "+esc(D.lic):"")+'</figcaption></figure><div class="tm-mapbox"></div></div><div class="tm-pinmsg">Tap the map where you think it was taken.</div>';
  const m=makeMap(box.querySelector(".tm-mapbox"),{onClick:ll=>{if(fin)return;fin=true;const d=km(ll,q.ll),sc=pinScore(d,50,1500);m.add({t:"line",a:ll,b:q.ll}).add({ll,cls:"you",label:"you"}).add({ll:q.ll,cls:"ans",label:""});m.fit([ll,q.ll],60);
   box.querySelector(".tm-pinmsg").innerHTML='<b>'+(d<1?"Spot on!":Math.round(d).toLocaleString("en")+" km away")+'</b> · '+sc+' points'+(q.label?'<br><span class="tm-cap">'+esc(q.label)+'</span>':'');
   done({sc:sc/100,pts:sc,kmOff:d,yours:Math.round(d).toLocaleString("en")+" km off",right:esc(q.label||"Here"),codes:[],ll:q.ll})}});return{}},
 label:q=>"Where was this photo taken?",thumb:q=>{const D=PS_PHOTO_DATA[q.i];return D?gfSrc(D.d):""}};
const GEN_TYPES=["pin","photo","hl","order","match","odd","num","outline","clim"];
const TYPE_TOPIC={pin:"geo",photo:"geo",hl:"geo",order:"geo",match:"politics",odd:"geo",num:"geo",outline:"geo",clim:"nature",phunt:"geo"};
const TYPE_TAGS={pin:"map pin pins place places where locate location capital capitals landmark landmarks mountain mountains peak peaks city cities",photo:"photo photos picture pictures",hl:"higher lower population people area size bigger mountain mountains peak peaks height river rivers length longer",
 order:"order rank ranking sort population people area size mountain mountains peak peaks river rivers",match:"match matching capital capitals flag flags",odd:"odd one out landlocked island islands eu european union monarchy monarchies king kings spanish portuguese equator",
 num:"number guess slider estimate population people area mountain mountains peak height river rivers",outline:"outline outlines shape shapes silhouette silhouettes",clim:"climate climates weather rain rainfall temperature graph"};
const SUB_TAGS={pop:"population people populous",area:"area size big bigger large largest",peak:"mountain mountains peak peaks height high highest",river:"river rivers length long longest",capital:"capital capitals",landmark:"landmark landmarks sight sights",city:"city cities",flag:"flag flags"};

/* ---------- records: mistakes, stamps, XP ---------- */
const MKEY="gfTrMistakes";
const mistakes=()=>LSget(MKEY,[]);
const slim=q=>q.type==="text"?{type:"text",key:q.key,qid:q.qid}:q;
function noteMistake(q,sc){if(!q||!q.key)return;let L=mistakes().filter(m=>m.key!==q.key);if(sc<.8)L.unshift({key:q.key,q:slim(q),t:Date.now()});LSset(MKEY,L.slice(0,150))}
const textQ=Q=>({type:"text",key:"t:"+Q.id,qid:Q.id,d:Q.d,s:Q.s});
function stampsTotal(){if(typeof ppStamped!=="function")return 0;let n=0;try{const P=stats.passport||{};Object.keys(P).forEach(c=>["know","flag","loc","outline","cap"].forEach(k=>{if(ppStamped(c,k))n++}))}catch(e){}return n}
const xpNow=()=>{try{return typeof xpTotal==="function"?xpTotal():0}catch(e){return 0}};
function credit(q,res,key){if(!res||res.sc<.8||typeof ppCredit!=="function")return;try{const K={pin:"loc",outline:"outline",photo:"know",odd:"know",clim:"know"};
 if(q.type==="match"){if(res.sc>=1)q.cs.forEach(c=>ppCredit(c,q.sub==="flag"?"flag":"cap",false,key))}
 else if(K[q.type]&&(q.cc||q.odd||(q.c&&q.c.cc)))ppCredit(q.cc||q.odd||q.c.cc,K[q.type],false,key)}catch(e){}}
function toast(msg){let t=document.getElementById("tmToast");if(!t){t=document.createElement("div");t.id="tmToast";t.className="tm-toast";document.body.appendChild(t)}t.textContent=msg;t.classList.add("on");clearTimeout(toast._t);toast._t=setTimeout(()=>t.classList.remove("on"),2400)}
const view=()=>document.getElementById("triviaView");
const fmtS=x=>Math.round(x*10)/10%1?(Math.round(x*10)/10).toFixed(1):String(Math.round(x));

/* ---------- the quiz runner for builder quizzes and the game modes ---------- */
let RUN=null,KEY=null;
function startRun(cfg){const run={cfg,i:0,items:[],score:0,lives:cfg.lives||0,xp:0,xp0:xpNow(),st0:stampsTotal(),key:"tm"+Date.now(),seen:new Set(),done:false};
 const q=cfg.next(run);if(!q){toast("No questions match those choices yet.");return false}run.cur=q;run.seen.add(q.key);RUN=run;try{trivia.view="home"}catch(e){}window._tmActive=true;renderRun();scrollTo(0,0);return true}
function renderRun(){const v=view(),run=RUN;if(!v||!run)return;const c=run.cfg,q=run.cur,T=TYPES[q.type];
 const prog=c.n===Infinity?'<span class="tm-prog">'+(c.lives?'<span class="tm-lives" title="Lives">'+"♥".repeat(Math.max(0,run.lives))+'<i>'+"♥".repeat(Math.max(0,c.lives-run.lives))+'</i></span> · ':'')+'Question '+(run.i+1)+'</span>':'<span class="tm-prog">Question '+(run.i+1)+' of '+c.n+'</span><span class="tm-pbar"><i style="width:'+(100*run.i/c.n).toFixed(1)+'%"></i></span>';
 v.innerHTML='<div class="tm-wrap tm-play'+(c.cls?" "+c.cls:"")+'"><div class="tm-bar"><button type="button" class="chip tm-back" id="tmBack" title="Back to the Trivia page">← Trivia</button><b class="tm-title">'+esc(c.title)+'</b>'+prog+'<span class="tm-score">'+(c.scoreLabel?c.scoreLabel(run):'Score <b>'+fmtS(run.score)+'</b>')+'</span><button type="button" class="tv-link" id="tmEnd">End round</button></div><div class="tm-card" id="tmCard"></div><div id="tmFb"></div></div>';
 document.getElementById("tmBack").onclick=()=>{window._tmActive=false;renderTriviaView();scrollTo(0,0)};
 document.getElementById("tmEnd").onclick=()=>{if(run.items.length)endRun();else{RUN=null;window._tmActive=false;renderTriviaView()}};
 const card=document.getElementById("tmCard");let answered=false;
 try{KEY=T.render(q,card,res=>{if(answered)return;answered=true;onAnswer(q,res)},c.typeOpts&&c.typeOpts[q.type])||null}catch(e){console.error(e);skip()}}
function skip(){const run=RUN;if(!run)return;run.cur=run.cfg.next(run);if(!run.cur)return endRun();run.seen.add(run.cur.key);renderRun()}
function onAnswer(q,res){const run=RUN;if(!run)return;res=Object.assign({sc:0},res);run.items.push({q,res});run.score+=res.sc;
 if(q.type!=="text")run.xp+=Math.round(res.sc*3);credit(q,res,run.key);if(!run.cfg.noMistakes)noteMistake(q,res.sc);if(run.cfg.lives&&res.sc<.5)run.lives--;
 if(run.cfg.onAnswer)run.cfg.onAnswer(run,q,res);
 const last=(run.cfg.n!==Infinity&&run.i+1>=run.cfg.n)||(run.cfg.lives&&run.lives<=0)||run.stop;
 const msg=res.sc>=.99?"Right!":res.sc>=.6?"Close — nice!":res.sc>=.3?"Partly there.":"Not this time.";
 const sc=document.querySelector(".tm-score");if(sc)sc.innerHTML=run.cfg.scoreLabel?run.cfg.scoreLabel(run):'Score <b>'+fmtS(run.score)+'</b>';
 const lv=document.querySelector(".tm-lives");if(lv)lv.innerHTML="♥".repeat(Math.max(0,run.lives))+'<i>'+"♥".repeat(Math.max(0,run.cfg.lives-run.lives))+'</i>';
 const fb=document.getElementById("tmFb");if(!fb)return;
 fb.innerHTML='<div class="tm-fb '+(res.sc>=.6?"good":"soft")+'"><div class="tm-fbm"><b>'+msg+'</b>'+(res.sc<.99&&res.right?' <span>'+(q.type==="pin"||q.type==="phunt"?"":"The answer: ")+res.right+'</span>':'')+'</div>'+(res.why?'<p class="tm-why">'+esc(res.why)+'</p>':'')+
  (run.cfg.lives&&res.sc<.5&&run.lives>0?'<p class="tm-life">One life used — '+run.lives+' left.</p>':'')+'<div class="tm-acts"><button type="button" class="tv-go" id="tmNext">'+(last?"See how you did →":"Next →")+'</button></div></div>';
 wireLinks(fb);wireLinks(document.getElementById("tmCard"));
 const n=document.getElementById("tmNext");n.focus({preventScroll:true});n.onclick=()=>{if(last)return endRun();run.i++;const nq=run.cfg.next(run);if(!nq)return endRun();run.cur=nq;run.seen.add(nq.key);renderRun();
  const cardEl=document.getElementById("tmCard");if(cardEl&&cardEl.getBoundingClientRect().top<0)cardEl.scrollIntoView({block:"start"})};
 setTimeout(()=>{const f=document.querySelector(".tm-fb");if(f){const r=f.getBoundingClientRect();if(r.bottom>innerHeight)f.scrollIntoView({block:"end",behavior:"smooth"})}},60)}
function endRun(){const run=RUN;if(!run||run.done&&run.shown)return;run.done=true;run.shown=true;window._tmActive=false;if(run.xp>0&&typeof xpGain==="function")try{xpGain(run.xp)}catch(e){}
 try{if(typeof saveStats==="function")saveStats()}catch(e){}
 if(run.cfg.onEnd)run.cfg.onEnd(run);const max=run.cfg.max?run.cfg.max(run):run.items.length;
 showResults({title:run.cfg.title,score:run.cfg.total?run.cfg.total(run):run.score,max,unit:run.cfg.unit,rows:run.items.map(it=>rowOf(it.q,it.res)),xp:xpNow()-run.xp0,stamps:stampsTotal()-run.st0,extra:run.cfg.extra?run.cfg.extra(run):"",
  buttons:[run.items.some(it=>it.res.sc<.8)&&!run.cfg.noPractice?{l:"Practise the ones I missed",f:()=>practise(run.items.filter(it=>it.res.sc<.8).map(it=>it.q))}:null,
   run.cfg.again?{l:run.cfg.againLabel||"Play again",f:run.cfg.again,main:1}:null,run.cfg.harder?{l:"Same topic, harder",f:run.cfg.harder}:null].filter(Boolean)})}
function rowOf(q,res){const T=TYPES[q.type];let label="";try{label=T.label(q)}catch(e){}const ll=res.ll||q.ll||(q.c&&q.c.ll)||(res.codes&&res.codes[0]&&centroid(res.codes[0]))||null;
 return{label:esc(label),yours:res.yours||"",right:res.right||"",why:res.why||"",sc:res.sc,ll,thumb:T.thumb?T.thumb(q):"",icon:T.icon,place:q.n||(q.cc&&cname(q.cc))||(res.codes&&res.codes[0]&&cname(res.codes[0]))||""}}
function wireLinks(el){if(!el)return;el.querySelectorAll(".tm-clink").forEach(b=>{if(b._w)return;b._w=1;b.onclick=e=>{e.stopPropagation();const c=BY[b.dataset.cc];if(c&&typeof openFlagZoom==="function")openFlagZoom(c)}})}
const KIND_WORD=p=>p>=.9?["Brilliant round!","You really know your world."]:p>=.7?["Great going!","That was a strong round."]:p>=.5?["Nicely done.","More right than not — that’s how it grows."]:p>=.3?["Good practice.","Every round teaches you something new."]:["A tough set!","You’ll know these next time — try the practice round."];
/* the end of a round: score, a kind word, XP and stamps, a map of the places, and every answer */
function showResults(D){const v=view();if(!v)return;const pct=D.max?D.score/D.max:0,[w1,w2]=KIND_WORD(pct);
 const rows=D.rows.map((r,i)=>{const st=r.sc>=.99?"right":r.sc>=.4?"part":"miss";return'<li class="tm-rrow '+st+'"><span class="tm-rdot" aria-hidden="true">'+(i+1)+'</span><div class="tm-rbody"><div class="tm-rq">'+(r.icon&&r.icon!=="❓"?r.icon+" ":"")+r.label+'</div>'+(r.thumb?'<img class="tm-rthumb" src="'+r.thumb+'" alt="" loading="lazy">':'')+
  '<div class="tm-rans">'+(st==="right"?'<span class="tm-rlab">Right</span> '+(r.right||r.yours):'<span class="tm-rlab">You</span> <span class="tm-ryou">'+(r.yours||"—")+'</span><span class="tm-rlab">Answer</span> <span class="tm-rright">'+r.right+'</span>')+'</div>'+(r.why?'<div class="tm-rwhy">'+esc(r.why)+'</div>':'')+'</div></li>'}).join("");
 const pts=D.rows.filter(r=>r.ll);
 v.innerHTML='<div class="tm-wrap tm-res"><div class="tm-bar"><button type="button" class="chip tm-back" id="tmRBack">← Trivia</button><b class="tm-title">'+esc(D.title||"Round complete")+'</b></div>'+
  '<div class="tm-rcard"><div class="tm-rtop"><div class="tm-rscore"><b>'+fmtS(D.score)+'</b><span>/ '+fmtS(D.max)+(D.unit?" "+esc(D.unit):"")+'</span></div><div class="tm-rwords"><b>'+w1+'</b><span>'+w2+'</span>'+
  '<div class="tm-rearn">'+(D.xp>0?'<span class="tm-xp">+'+Math.round(D.xp)+' XP</span>':'')+(D.stamps>0?'<span class="tm-stamp">+'+D.stamps+' stamp'+(D.stamps===1?"":"s")+'</span>':'')+'</div></div></div>'+(D.extra||"")+
  '<div class="tm-racts">'+D.buttons.map((b,i)=>'<button type="button" class="'+(b.main?"tv-go":"chip")+'" data-rb="'+i+'">'+esc(b.l)+'</button>').join("")+'<button type="button" class="chip" id="tmRHome">Back to Trivia</button></div></div>'+
  (pts.length?'<div class="tm-rmapw"><h3>Where this round took you</h3><div class="tm-rmap"></div></div>':'')+
  (rows?'<h3 class="tm-rh">Your answers</h3><ol class="tm-rlist">'+rows+'</ol>':'')+'</div>';
 const home=()=>{RUN=null;window._tmActive=false;try{if(trivia.view==="done"){trivia.run=null;trivia.view="home"}}catch(e){}renderTriviaView();scrollTo(0,0)};
 document.getElementById("tmRBack").onclick=home;document.getElementById("tmRHome").onclick=home;
 v.querySelectorAll("[data-rb]").forEach(b=>b.onclick=()=>D.buttons[+b.dataset.rb].f());wireLinks(v);
 if(pts.length){try{const m=makeMap(v.querySelector(".tm-rmap"),{small:1});pts.forEach(r=>m.add({ll:r.ll,cls:r.sc>=.99?"ans":r.sc>=.4?"part":"miss",r:8}));m.fit(pts.map(r=>r.ll),120)}catch(e){console.error(e)}}
 if(typeof v4Celebrate==="function"&&pct>=.9)try{v4Celebrate(.5)}catch(e){}
 if(D.after)D.after(v)}
function practise(qs){qs=qs.filter(Boolean);if(!qs.length)return;const list=shuffle(qs.slice());startRun({title:"Practice round",n:list.length,next:run=>list[run.i]||null,again:()=>practise(qs),practice:1})}

/* ---------- the builder: search and filters ---------- */
const TOPICS=[{id:"geo",name:"Geography",s:["geo","identify"]},{id:"nature",name:"Nature",s:["nature"]},{id:"culture",name:"Culture",s:["culture"],wb:["language"]},{id:"history",name:"History",s:["history"]},{id:"poleco",name:"Politics & Economy",s:["politics","economy"],wb:["names"]},{id:"words",name:"Names & Languages",s:["words"]}];
const TOPIC_GEN={geo:{pin:["landmark","city"],photo:null,hl:["pop","area"],order:["pop","area"],num:["pop","area"],odd:["landlocked","island","equator"],outline:null,match:["flag"]},
 nature:{pin:["peak"],hl:["peak","river"],order:["peak","river"],num:["peak","river"],clim:null},poleco:{pin:["capital"],match:["capital"],odd:["eu","monarchy"]},culture:{photo:null,odd:["spanish","portuguese"]},words:{odd:["spanish","portuguese"]},history:{}};
const TYPE_SUBS={pin:["capital","landmark","peak","city"],hl:["pop","area","peak","river"],order:["pop","area","peak","river"],num:["pop","area","peak","river"],match:["capital","flag"],odd:ODD_SETS.map(s=>s.id)};
Object.assign(SUB_TAGS,{landlocked:"landlocked coast sea",island:"island islands",equator:"equator",eu:"eu european union",monarchy:"monarchy monarchies king kings queen royal",spanish:"spanish",portuguese:"portuguese"});
const STOP=new Set("of the in with and quiz quizzes question questions about from a an on to for me my all any some country countries world trivia".split(" "));
const stem=w=>{w=w.toLowerCase();if(w.length>4&&/ies$/.test(w))return w.slice(0,-3)+"y";if(w.length>4&&/(ches|shes|xes|oes)$/.test(w))return w.slice(0,-2);if(w.length>3&&/s$/.test(w)&&!/ss$/.test(w))return w.slice(0,-1);return w};
const SYN={mountain:["peak","mount","mountain"],peak:["peak","mountain","mount"],food:["food","dish","drink","cuisine"],football:["football","soccer"],soccer:["football","soccer"],sea:["sea","ocean"],ocean:["sea","ocean"],lake:["lake","loch"],capital:["capital"]};
const words=s=>String(s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").split(/[^a-z0-9]+/).filter(Boolean).map(stem);
function parseQuery(s){let t=" "+String(s||"").toLowerCase()+" ";let reg=null;const regs=REGIONS.slice().sort((a,b)=>Math.max(...b.w.map(x=>x.length))-Math.max(...a.w.map(x=>x.length)));
 for(const r of regs){for(const w of r.w.slice().sort((a,b)=>b.length-a.length)){const re=new RegExp("(^|[^a-z])"+w.replace(/ /g,"\\s+")+"($|[^a-z])");if(re.test(t)){if(!reg)reg=r;t=t.replace(re," ")}}}
 const terms=[...new Set(words(t).filter(w=>w.length>=2&&!STOP.has(w)))];return{reg,terms}}
const HAY=new Map();
function hay(q){let h=HAY.get(q.id);if(h)return h;const parts=[typeof tvText==="function"?tvText(q):q.t,SEC_NAME(q.s),partName(q.s,q.b),q.b];
 if(q.x){parts.push(q.x.n,q.x.k);(q.x.al||[]).forEach(a=>parts.push(a))}else(q.a||[]).forEach(c=>parts.push(cname(c)));(q.kc||[]).forEach(c=>parts.push(cname(c)));
 if(q.s==="identify")parts.push({flag:"flag flags",outline:"outline shape silhouette",cap:"capital capitals",loc:"map location"}[q.k]||"");
 h=new Set(words(parts.join(" ")));HAY.set(q.id,h);return h}
const termHit=(t,H)=>(SYN[t]||[t]).some(x=>H.has(x));
const usable=q=>q&&(q.t||q.k)&&!(q.a.length>1&&!q.e)&&q.k!=="loc"&&q.k!=="cap2"&&(q.x||q.a.length)&&!q.twin;
const dOK=(d,f)=>!f||(f==="easy"?d<=2:f==="mid"?d===3:d>=4);
const inTopic=(q,t)=>{if(!t)return true;const T=TOPICS.find(x=>x.id===t);if(!T)return true;if(q.s==="words")return t==="words"||(T.wb||[]).includes(q.b);return T.s.includes(q.s)};
const codesOf=q=>q.x?(q.kc||[]):q.a;
function textMatches(F){const{reg,terms}=parseQuery(F.q);const R2=F.reg?REG(F.reg):null;const out=[];
 TRIVIA_Q.forEach(q=>{if(!usable(q))return;if(q.s==="identify"&&!terms.length)return;if(!inTopic(q,F.topic)||!dOK(q.d,F.diff))return;
  const cs=codesOf(q);if(reg&&!cs.some(reg.t))return;if(R2&&!cs.some(R2.t))return;if(terms.length){const H=hay(q);if(!terms.every(t=>termHit(t,H)))return}out.push(q)});return out}
function genSpecs(F){if(F.type==="text")return[];const{terms}=parseQuery(F.q);const tags=Object.fromEntries(Object.entries(TYPE_TAGS).map(([k,v])=>[k,new Set(words(v))]));const out=[];
 (F.type?[F.type]:GEN_TYPES).forEach(t=>{if(t==="clim"&&!thermoReady())return;let subs=TYPE_SUBS[t]?TYPE_SUBS[t].slice():null;
  if(terms.length){if(!terms.every(w=>termHit(w,tags[t])))return;if(subs){const hit=subs.filter(s=>terms.some(w=>termHit(w,new Set(words(SUB_TAGS[s]||"")))));if(hit.length)subs=hit}}
  if(F.topic){const G=TOPIC_GEN[F.topic]||{};if(!(t in G))return;if(G[t]&&subs)subs=subs.filter(s=>G[t].includes(s));if(subs&&!subs.length)return}
  out.push({type:t,subs})});return out}
const DMAP={easy:2,mid:3,hard:4};
function genOne(spec,o){const T=TYPES[spec.type];if(!T||!T.gen)return null;for(let k=0;k<6;k++){const q=T.gen(Object.assign({subs:spec.subs},o));if(q&&!(o.avoid&&o.avoid.has(q.key)))return q}return null}
/* odd one out honours the chosen sets */
{const g=TYPES.odd.gen;TYPES.odd.gen=function(o){if(!o.subs||!o.subs.length)return g.call(this,o);const keep=ODD_SETS.slice();ODD_SETS.splice(0,ODD_SETS.length,...keep.filter(s=>o.subs.includes(s.id)));try{return g.call(this,o)}finally{ODD_SETS.splice(0,ODD_SETS.length,...keep)}}}
function buildCfg(F){const text=shuffle(textMatches(F)),specs=genSpecs(F),reg=F.reg?REG(F.reg):parseQuery(F.q).reg,d=F.diff?DMAP[F.diff]:null;const n=F.len==="inf"?Infinity:+F.len||10;let ti=0;
 const nextText=run=>{if(!text.length)return null;for(let k=0;k<text.length;k++){if(ti>=text.length){ti=0;shuffle(text)}const q=text[ti++];const tq=textQ(q);if(!run.seen.has(tq.key)||n===Infinity&&run.seen.size>=text.length)return tq}return null};
 const nextGen=run=>{if(!specs.length)return null;for(let k=0;k<8;k++){const q=genOne(pick(specs),{reg,d,avoid:run.seen});if(q)return q}return null};
 const share=specs.length?(text.length?Math.min(.75,Math.max(.4,text.length/(text.length+40))):0):1;
 return{text,specs,n,cfg:{title:F.name||(F.q?"“"+F.q.trim()+"”":"Your quiz"),n,next:run=>{const q=rnd()<share?(nextText(run)||nextGen(run)):(nextGen(run)||nextText(run));return q},
  again:()=>startBuilt(F),harder:F.diff!=="hard"?()=>startBuilt(Object.assign({},F,{diff:F.diff==="easy"?"mid":"hard"})):null}}}
function startBuilt(F){const B=buildCfg(F);if(!B.text.length&&!B.specs.length){toast("Nothing matches that yet — try fewer words or filters.");return}if(B.text.length+(B.specs.length?99:0)<B.n&&B.n!==Infinity)B.cfg.n=Math.max(1,B.text.length+(B.specs.length?B.n:0));startRun(B.cfg)}

/* ---------- game modes ---------- */
const MST=()=>LSget("gfTrModes",{});const setBest=(k,v)=>{const S=MST();const nb=v>(S[k]||0);if(nb)S[k]=v;LSset("gfTrModes",S);return nb};
const ptsLabel=run=>'Points <b>'+Math.round(run.items.reduce((a,it)=>a+(it.res.pts||0),0))+'</b>';
const ptsTotal=run=>run.items.reduce((a,it)=>a+(it.res.pts||0),0);
const kmTotal=run=>run.items.reduce((a,it)=>a+(it.res.kmOff||0),0);
function pinDrop(){loadCities();const seen=new Set();startRun({title:"Pin Drop",n:10,cls:"tm-mode",next:run=>{const subs=[["capital"],["landmark"],["peak"],["capital"],["landmark"],["city"]][run.i%6];return genOne({type:"pin",subs},{avoid:run.seen,d:run.i<4?2:run.i<8?3:4})||genOne({type:"pin"},{avoid:run.seen})},
 scoreLabel:ptsLabel,total:ptsTotal,max:run=>run.items.length*100,unit:"points",noMistakes:1,
 onEnd:run=>{run.best=setBest("pin",ptsTotal(run))},extra:run=>'<p class="tm-rextra">'+Math.round(kmTotal(run)).toLocaleString("en")+' km off in all · '+(run.best?"a new best!":"best "+Math.round(MST().pin||0)+" points")+'</p>',again:pinDrop,againLabel:"Play again"})}
function photoHunt(){startRun({title:"Photo Hunt",n:10,cls:"tm-mode",next:run=>genOne({type:"phunt"},{avoid:run.seen}),scoreLabel:ptsLabel,total:ptsTotal,max:run=>run.items.length*100,unit:"points",noMistakes:1,
 onEnd:run=>{run.best=setBest("hunt",ptsTotal(run))},extra:run=>'<p class="tm-rextra">'+Math.round(kmTotal(run)).toLocaleString("en")+' km off in all · '+(run.best?"a new best!":"best "+Math.round(MST().hunt||0)+" points")+'</p>',again:photoHunt})}
function hlStreak(){let prev=null;startRun({title:"Higher or Lower",n:Infinity,lives:1,cls:"tm-mode",next:run=>{const last=run.items[run.items.length-1];const from=last&&last.res.sc>=1&&last.q.type==="hl"?last.q:null;return genOne({type:"hl",subs:from?[from.sub]:null},{from,avoid:run.seen,d:run.i<5?2:run.i<12?3:4})},
 scoreLabel:run=>'Streak <b>'+run.items.filter(it=>it.res.sc>=1).length+'</b>',total:run=>run.items.filter(it=>it.res.sc>=1).length,max:run=>run.items.length,noMistakes:1,
 onEnd:run=>{run.best=setBest("hl",run.items.filter(it=>it.res.sc>=1).length)},extra:run=>'<p class="tm-rextra">'+(run.best?"A new best streak!":"Best streak "+(MST().hl||0))+'</p>',again:hlStreak})}
function survival(){startRun({title:"Survival",n:Infinity,lives:3,cls:"tm-mode",next:run=>{const d=Math.min(5,1+Math.floor(run.i/4));if(rnd()<.5){const L=TRIVIA_Q.filter(q=>usable(q)&&q.s!=="identify"&&Math.abs(q.d-d)<=(d>=5?1:0)&&!run.seen.has("t:"+q.id));if(L.length)return textQ(pick(L))}
  return genOne({type:pick(GEN_TYPES.filter(t=>t!=="clim"||thermoReady()))},{d:Math.min(4,d),avoid:run.seen})||textQ(pick(TRIVIA_Q.filter(usable)))},
 scoreLabel:run=>'Score <b>'+fmtS(run.score)+'</b>',onEnd:run=>{run.best=setBest("surv",run.score)},extra:run=>'<p class="tm-rextra">You reached question '+run.items.length+' · level '+Math.min(5,1+Math.floor((run.items.length-1)/4))+' of 5 · '+(run.best?"a new best!":"best "+fmtS(MST().surv||0))+'</p>',again:survival})}
/* Daily Challenge: the same ten for everyone today */
const DPLAN=[["text",2],["pin",2],["photo",3],["hl",2],["text",3],["order",3],["match",3],["text",4],["num",3],["outline",3]];
function dailySet(day){const r=seeded("geoflock-daily:"+day);return withRng(r,()=>{const seen=new Set();return DPLAN.map(([t,d],i)=>{let q=null;
  if(t==="text"){const L=TRIVIA_Q.filter(q=>usable(q)&&q.s!=="identify"&&q.d===d&&(q.q||3)>=4).sort((a,b)=>a.id-b.id);for(let k=0;k<20&&!q;k++){const x=pick(L);if(x&&!seen.has(x.id)){seen.add(x.id);q=textQ(x)}}}
  else q=genOne({type:t,subs:t==="pin"?["capital","landmark"]:null},{d});
  return q||textQ(TRIVIA_Q.filter(usable)[Math.floor(r()*200)])})})}
const DKEY="gfTrDaily";
function dailyState(){const S=LSget(DKEY,{});return S}
const yday=()=>{const d=new Date();d.setDate(d.getDate()-1);return dayKey(d)};
const gridOf=sc=>sc.map(x=>x>=.8?"🟩":x>=.4?"🟨":"⬜");
function shareText(S){const g=gridOf(S.sc||[]);return"GeoFlock Daily Trivia · "+S.day+"\n"+fmtS((S.sc||[]).reduce((a,b)=>a+b,0))+"/"+(S.sc||[]).length+(S.streak>1?" · 🔥 "+S.streak+" days":"")+"\n"+g.slice(0,5).join("")+"\n"+g.slice(5).join("")}
function copyText(t,btn){const ok=()=>{if(btn){btn.textContent="Copied!";setTimeout(()=>{if(btn.isConnected)btn.textContent="Copy result"},1800)}};try{navigator.clipboard.writeText(t).then(ok,()=>fb())}catch(e){fb()}
 function fb(){try{const a=document.createElement("textarea");a.value=t;document.body.appendChild(a);a.select();document.execCommand("copy");a.remove();ok()}catch(e){}}}
function dailyExtra(S){return'<div class="tm-daily"><div class="tm-grid">'+gridOf(S.sc||[]).map(e=>'<span>'+e+'</span>').join("")+'</div><div class="tm-dmeta">'+(S.streak?'🔥 <b>'+S.streak+'</b> day'+(S.streak===1?"":"s")+' in a row':'')+(S.bestStreak>1?' · best '+S.bestStreak:'')+'</div><button type="button" class="tv-go" id="tmShare">Copy result</button><pre class="tm-share">'+esc(shareText(S))+'</pre><p class="tm-sub">A new set appears at midnight.</p></div>'}
function daily(){loadCities();const day=dayKey();let S=dailyState();
 if(S.day===day&&S.done)return showDailyDone(S);
 const go=()=>{const qs=S.day===day&&S.qs?S.qs:dailySet(day);S=Object.assign(S,{day,qs,done:false});LSset(DKEY,S);
  startRun({title:"Daily Challenge",n:qs.length,cls:"tm-mode",next:run=>qs[run.i]||null,noPractice:0,
   onEnd:run=>{const T=dailyState();const sc=run.items.map(it=>Math.round(it.res.sc*100)/100);while(sc.length<qs.length)sc.push(0);const streak=T.last===day?T.streak||1:T.last===yday()?(T.streak||0)+1:1;
    const N=Object.assign(T,{day,done:true,sc,last:day,streak,bestStreak:Math.max(T.bestStreak||0,streak)});LSset(DKEY,N);run.dS=N},
   extra:run=>dailyExtra(run.dS||dailyState()),after:null})};
 /* the photo and climate questions need their data first */
 if(!CITIES)loadCities().then(go);else go()}
function showDailyDone(S){showResults({title:"Daily Challenge",score:(S.sc||[]).reduce((a,b)=>a+b,0),max:(S.sc||[]).length,rows:[],xp:0,stamps:0,extra:dailyExtra(S)+'<p class="tm-sub">You have played today’s set. Come back tomorrow for the next one.</p>',buttons:[]});wireShare(S)}
function wireShare(S){const b=document.getElementById("tmShare");if(b)b.onclick=()=>copyText(shareText(S),b)}
{const _sr=showResults;showResults=function(D){_sr(D);const b=document.getElementById("tmShare");if(b)b.onclick=()=>copyText(shareText(dailyState()),b)}}

/* ---------- on the Trivia page: the builder at the top, the game modes under the mixed-trivia box ---------- */
const BKEY="gfTrBuild",SKEY="gfTrSaved";
const bState=()=>Object.assign({q:"",reg:"",topic:"",diff:"",type:"",len:"10"},LSget(BKEY,{}));
const EXAMPLES=["rivers","Africa","flags with stars","capitals of Europe","islands","mountains","festivals","empires","oil","Pacific","photos","higher or lower","outlines","climate"];
const LENS=[["10","10"],["25","25"],["inf","Endless"]];
const chipRow=(lab,key,list,cur)=>'<div class="tm-frow"><span class="tm-flab">'+lab+'</span><div class="tm-fchips">'+list.map(([v,l])=>'<button type="button" class="chip'+(String(cur)===String(v)?" active":"")+'" data-f="'+key+'" data-v="'+esc(v)+'">'+l+'</button>').join("")+'</div></div>';
function builderHTML(){const F=bState(),sv=LSget(SKEY,[]),M=mistakes();const nT=textMatches(F).length,sp=genSpecs(F);
 const P0=RUN&&!RUN.done?RUN:null;const DS=dailyState(),dDone=DS.day===dayKey()&&DS.done;
 return'<section class="tm-build" id="tmBuild">'+(P0?'<div class="tvh-resume tm-resume"><span><b>'+esc(P0.cfg.title)+'</b> · question '+(P0.i+1)+(P0.cfg.n!==Infinity?' of '+P0.cfg.n:'')+'</span><button type="button" class="tv-go" id="tmResume">Resume →</button><button type="button" class="tv-link" id="tmDrop">Discard it</button></div>':'')+
  '<div class="tm-bh"><h2>Build a quiz</h2><span class="tm-bsub">Search any topic, place or kind of question, then narrow it down.</span></div>'+
  '<form class="tm-search" id="tmForm" autocomplete="off"><span class="tm-sicon" aria-hidden="true">🔎</span><input id="tmQ" type="search" enterkeyhint="go" placeholder="Try “rivers”, “Africa”, “flags with stars”…" value="'+esc(F.q)+'" aria-label="What should the quiz be about?"><button type="submit" class="tv-go" id="tmGo">▶ Start</button></form>'+
  '<div class="tm-ex">'+EXAMPLES.map(x=>'<button type="button" class="tm-exb" data-ex="'+esc(x)+'">'+esc(x)+'</button>').join("")+'</div>'+
  '<details class="tm-filters"'+(F.open?" open":"")+'><summary>Filters'+((F.reg||F.topic||F.diff||F.type)?' <em>on</em>':'')+'</summary><div class="tm-fbody">'+
   chipRow("Region","reg",[["","All"]].concat(REGIONS.filter(r=>!r.minor||r.id!=="Americas").map(r=>[r.id,r.id])),F.reg)+
   chipRow("Topic","topic",[["","All"]].concat(TOPICS.map(t=>[t.id,t.name])),F.topic)+
   chipRow("Difficulty","diff",[["","Any"],["easy","Easy"],["mid","Medium"],["hard","Hard"]],F.diff)+
   chipRow("Kind","type",[["","Any"],["text","Trivia questions"]].concat(GEN_TYPES.filter(t=>t!=="clim"||thermoReady()).map(t=>[t,TYPES[t].icon+" "+TYPES[t].name])),F.type)+
   '</div></details>'+chipRow("Length","len",LENS,F.len)+
  '<div class="tm-count">'+(nT||sp.length?'<b>'+nT.toLocaleString("en")+'</b> trivia question'+(nT===1?"":"s")+' match'+(nT===1?"es":"")+(sp.length?', plus <b>'+sp.length+'</b> kind'+(sp.length===1?"":"s")+' of question made fresh each time <span class="tm-ticons">'+sp.map(s=>TYPES[s.type].icon).join(" ")+'</span>':''):'Nothing matches yet — try fewer words or filters.')+
   ((F.q||F.reg||F.topic||F.diff||F.type)?' · <button type="button" class="tv-link" id="tmClear">Clear</button>':'')+' · <button type="button" class="tv-link" id="tmSave">Save this quiz</button></div>'+
  (sv.length?'<div class="tm-saved"><span class="tm-flab">Saved</span>'+sv.map((s,i)=>'<span class="tm-sq"><button type="button" class="chip" data-sq="'+i+'">▶ '+esc(s.name)+'</button><button type="button" class="tm-sqx" data-sqx="'+i+'" aria-label="Delete '+esc(s.name)+'">×</button></span>').join("")+'</div>':'')+
  (M.length?'<button type="button" class="tm-mist" id="tmMist">Practise my mistakes <b>'+M.length+'</b></button>':'')+'</section>'}
function modesHTML(){const S=MST(),DS=dailyState(),dDone=DS.day===dayKey()&&DS.done;
 const card=(id,icon,name,sub,meta,cls)=>'<button type="button" class="tm-mcard'+(cls?" "+cls:"")+'" data-mode="'+id+'"><span class="tm-mic">'+icon+'</span><span class="tm-mt"><b>'+name+'</b><small>'+sub+'</small>'+(meta?'<em>'+meta+'</em>':'')+'</span></button>';
 return'<section class="tm-modes"><h2 class="tvh-h">Game modes</h2><div class="tm-mgrid">'+
  card("daily","📅","Daily Challenge","Ten mixed questions, the same for everyone today",dDone?"Done today · "+fmtS((DS.sc||[]).reduce((a,b)=>a+b,0))+"/10"+(DS.streak?" · 🔥 "+DS.streak:""):(DS.streak&&DS.last===yday()?"Keep your 🔥 "+DS.streak+"-day streak":"Play today’s set"),dDone?"done":"hot")+
  card("pin","📍","Pin Drop","Ten places: click each on the map. Points for every km you save",S.pin?"Best "+Math.round(S.pin)+" / 1000":"")+
  card("hunt","🧭","Photo Hunt","See a photo, place it on the map",S.hunt?"Best "+Math.round(S.hunt)+" / 1000":"")+
  card("hl","↕️","Higher or Lower","How long can your streak go? People, size, peaks, rivers",S.hl?"Best streak "+S.hl:"")+
  card("surv","❤️","Survival","Three lives, every kind of question, getting harder",S.surv?"Best "+fmtS(S.surv):"")+'</div></section>'}
function mixRowHTML(){const H=hubS(),v=typeof H.gq==="number"?H.gq:.12;const L=[[0,"Off"],[.06,"Rarely"],[.12,"Sometimes"],[.25,"Often"]];
 return'<div class="tvh-mrow tm-mixrow"><div class="tvh-mhead"><span class="tvh-mname">✦ New kinds of question <small>map pins, photos, higher or lower, put in order, matching…</small></span><span class="tvh-seg">'+L.map(([x,l])=>'<button type="button" class="'+(Math.abs(v-x)<1e-6?"on":"")+'" data-gq="'+x+'">'+l+'</button>').join("")+'</span></div></div>'}
const hubS=()=>{const t=triviaState();if(!t.hub||typeof t.hub!=="object")t.hub={};return t.hub};
function decorateHub(){const v=view(),w=v&&v.querySelector(".tv-wrap.tvh");if(!w||w.querySelector("#tmBuild"))return;
 const res=w.querySelector(".tvh-resume");if(res)res.insertAdjacentHTML("afterend",builderHTML());else w.insertAdjacentHTML("afterbegin",builderHTML());
 const hero=w.querySelector(".tvh-hero");if(hero)hero.insertAdjacentHTML("afterend",modesHTML());else w.querySelector("#tmBuild").insertAdjacentHTML("afterend",modesHTML());
 const mb=w.querySelector(".tvh-mixbody .tvh-bonusrow");if(mb)mb.insertAdjacentHTML("afterend",mixRowHTML());
 wireBuilder(w)}
function wireBuilder(w){const F=bState(),save=(patch,re)=>{LSset(BKEY,Object.assign(bState(),patch));if(re!==false)refresh()};
 const refresh=()=>{const b=w.querySelector("#tmBuild");if(!b)return;const inp=b.querySelector("#tmQ"),focus=document.activeElement===inp,pos=inp?inp.selectionStart:0;b.outerHTML=builderHTML();wireBuilder2(w,save);if(focus){const i=w.querySelector("#tmQ");i.focus();try{i.setSelectionRange(pos,pos)}catch(e){}}};
 wireBuilder2(w,save);
 w.querySelectorAll("[data-mode]").forEach(b=>b.onclick=()=>({daily,pin:pinDrop,hunt:photoHunt,hl:hlStreak,surv:survival})[b.dataset.mode]());
 w.querySelectorAll("[data-gq]").forEach(b=>b.onclick=()=>{hubS().gq=+b.dataset.gq;hubS().mixOpen=true;try{saveStats()}catch(e){}renderTriviaView()})}
function wireBuilder2(w,save){const b=w.querySelector("#tmBuild");if(!b)return;const inp=b.querySelector("#tmQ");let t=null;
 inp.oninput=()=>{clearTimeout(t);t=setTimeout(()=>save({q:inp.value}),260)};
 b.querySelector("#tmForm").onsubmit=e=>{e.preventDefault();clearTimeout(t);LSset(BKEY,Object.assign(bState(),{q:inp.value}));startBuilt(bState())};
 b.querySelectorAll("[data-ex]").forEach(x=>x.onclick=()=>save({q:x.dataset.ex}));
 b.querySelectorAll("[data-f]").forEach(x=>x.onclick=()=>{const k=x.dataset.f,v=x.dataset.v;save({[k]:bState()[k]===v&&k!=="len"?"":v,open:k!=="len"?true:bState().open})});
 const d=b.querySelector(".tm-filters");if(d)d.addEventListener("toggle",()=>LSset(BKEY,Object.assign(bState(),{open:d.open})));
 const cl=b.querySelector("#tmClear");if(cl)cl.onclick=()=>save({q:"",reg:"",topic:"",diff:"",type:""});
 b.querySelector("#tmSave").onclick=()=>{const F=bState();const name=(prompt("Name this quiz",F.q||[F.reg,F.topic&&TOPICS.find(x=>x.id===F.topic).name].filter(Boolean).join(" ")||"My quiz")||"").trim();if(!name)return;const L=LSget(SKEY,[]).filter(s=>s.name!==name);L.unshift({name:name.slice(0,40),F:Object.assign({},F,{name:name.slice(0,40),open:undefined})});LSset(SKEY,L.slice(0,12));save({})};
 b.querySelectorAll("[data-sq]").forEach(x=>x.onclick=()=>{const s=LSget(SKEY,[])[+x.dataset.sq];if(s)startBuilt(s.F)});
 b.querySelectorAll("[data-sqx]").forEach(x=>x.onclick=()=>{const L=LSget(SKEY,[]);L.splice(+x.dataset.sqx,1);LSset(SKEY,L);save({})});
 const m=b.querySelector("#tmMist");if(m)m.onclick=()=>{const L=mistakes().map(x=>x.q).filter(q=>q&&TYPES[q.type]&&(q.type!=="text"||qById(q.qid)));if(L.length)startRun({title:"My mistakes",n:Math.min(15,L.length),next:run=>{const left=L.filter(q=>!run.seen.has(q.key));return left.length?pick(left):null},practice:1,again:()=>m.onclick()})};
 const r=b.querySelector("#tmResume");if(r)r.onclick=()=>{window._tmActive=true;renderRun();scrollTo(0,0)};
 const dr=b.querySelector("#tmDrop");if(dr)dr.onclick=()=>{RUN=null;b.querySelector(".tm-resume").remove()}}
{const _h=renderTriviaHome;renderTriviaHome=function(){const r=_h.apply(this,arguments);try{decorateHub()}catch(e){console.error(e)}return r}}
/* the Trivia page reopens on a game in progress only through "Resume" */

/* ---------- mixed trivia: a new kind of question now and then ---------- */
function genMixed(run){const reg=run.conts&&run.conts.length?{t:c=>tvInConts(c,run.conts)}:null;let lv=3;try{lv=Math.round(tvRunLevel(run))}catch(e){}
 const kinds=GEN_TYPES.filter(t=>t!=="clim"||thermoReady());for(let k=0;k<6;k++){const q=genOne({type:pick(kinds)},{reg,d:Math.max(1,Math.min(5,lv)),avoid:new Set((run._gq||[]).map(x=>x.q.key))});if(q)return q}return null}
function showSpecial(q,run,cont){const v=view();if(!v)return cont();run._inBonus=true;
 v.innerHTML='<div class="tm-wrap tm-play tm-special"><div class="tm-bar"><button type="button" class="chip tm-back" id="tmSPause">← Trivia</button><b class="tm-title">✦ A new kind of question</b><span class="tm-score">Score <b>'+fmtS(run.score)+'</b>'+(run.bonus?' · bonus +'+fmtS(run.bonus):'')+'</span><button type="button" class="tv-link" id="tmSSkip">Skip</button></div><div class="tm-card" id="tmCard"></div><div id="tmFb"></div></div>';
 let done=false;const fin=()=>{if(done)return;done=true;run._inBonus=false;KEY=null;cont()};
 document.getElementById("tmSSkip").onclick=fin;document.getElementById("tmSPause").onclick=()=>{run._inBonus=false;trivia.view="home";renderTriviaView();scrollTo(0,0)};
 const card=document.getElementById("tmCard");let ans=false;
 KEY=TYPES[q.type].render(q,card,res=>{if(ans)return;ans=true;res=Object.assign({sc:0},res);(run._gq=run._gq||[]).push({q,res});run.bonus=(run.bonus||0)+res.sc;credit(q,res,"mix"+(run._xp0||0));noteMistake(q,res.sc);try{if(typeof xpGain==="function"&&res.sc>0)xpGain(Math.round(res.sc*3))}catch(e){}
  const fb=document.getElementById("tmFb");fb.innerHTML='<div class="tm-fb '+(res.sc>=.6?"good":"soft")+'"><div class="tm-fbm"><b>'+(res.sc>=.99?"Right! +1 bonus":res.sc>=.3?"Close: +"+fmtS(res.sc)+" bonus":"Not this time.")+'</b>'+(res.sc<.99&&res.right?' <span>'+(q.type==="pin"?"":"The answer: ")+res.right+'</span>':'')+'</div>'+(res.why?'<p class="tm-why">'+esc(res.why)+'</p>':'')+'<div class="tm-acts"><button type="button" class="tv-go" id="tmNext">Continue →</button></div></div>';
  wireLinks(fb);wireLinks(card);const n=document.getElementById("tmNext");n.focus({preventScroll:true});n.onclick=fin})||null}
{const _t=triviaNext;triviaNext=function(){try{const run=trivia.run,H=hubS(),p=typeof H.gq==="number"?H.gq:.12;
 if(run&&run.mix&&!run.fixed&&run.idx>=1&&run.idx+1<run.total&&!run._inBonus&&p>0&&(run.idx-(run._lastG==null?-9:run._lastG))>=3&&(run.idx-(run._lastB==null?-9:run._lastB))>=2&&Math.random()<p){
  const q=genMixed(run);if(q){run._lastG=run.idx;run._lastB=run.idx;const self=this,args=arguments;return showSpecial(q,run,()=>_t.apply(self,args))}}}catch(e){console.error(e)}return _t.apply(this,arguments)}}

/* ---------- the main trivia engine's end of round, made richer ---------- */
{const _s=triviaStart;triviaStart=function(){const x0=xpNow(),s0=stampsTotal();const r=_s.apply(this,arguments);try{if(trivia.run&&trivia.run._xp0==null){trivia.run._xp0=x0;trivia.run._st0=s0}}catch(e){}return r}}
{const _d=renderTriviaDone;renderTriviaDone=function(){const r=_d.apply(this,arguments);try{engineResults()}catch(e){console.error(e)}return r}}
function engineResults(){const v=view(),run=trivia.run;if(!v||!run)return;const items=run.items.filter(it=>it.r!==null);if(!items.length)return;
 const grab=id=>{const b=document.getElementById(id);return b&&b.onclick};const again=grab("tvAgain"),retry=grab("tvRetry"),home=grab("tvhDone")||grab("tvHome");
 const lvl=[".tv-level-change",".tv-atlas-line",".tvh-bdone"].map(s=>{const e=v.querySelector(s);return e?e.outerHTML:""}).join("");
 if(!run._tmLogged){run._tmLogged=1;items.forEach(it=>noteMistake(textQ(it.q),it.r))}
 const rows=items.map(it=>{const q=it.q;const right=q.x?esc(q.x.n):q.a.map(cLink).join(q.e?" or ":" and ");const yours=(it.picks||[]).length?it.picks.map(p=>BY[p]?cLink(p):esc(String(p))).join(", "):"No answer";
  const cs=codesOf(q);return{label:esc(typeof tvText==="function"?tvText(q):q.t),yours,right,why:q.w||"",sc:it.r,ll:cs[0]?centroid(cs[0]):null,icon:"",thumb:q.k==="flag"?flagUrl(q.a[0],"w80"):""}}).concat((run._gq||[]).map(x=>rowOf(x.q,x.res)));
 const missed=items.filter(it=>it.r<1).map(it=>it.q);
 showResults({title:"Round complete",score:items.reduce((a,it)=>a+it.r,0),max:items.length,rows,xp:run._xp0!=null?xpNow()-run._xp0:0,stamps:run._st0!=null?stampsTotal()-run._st0:0,extra:'<div class="tm-rlevel">'+lvl+'</div>',
  buttons:[missed.length?{l:"Practise the "+missed.length+" I missed",f:()=>{if(retry)retry();else triviaStart(missed)}}:null,{l:"Play again",main:1,f:()=>{if(again)again();else triviaStart()}},
   {l:"Same topic, harder",f:()=>{const H=hubS();H.diff=Math.min(1.5,(H.diff||0)+1);try{saveStats()}catch(e){}toast("The next round will be harder.");if(again)again();else triviaStart()}}]});
 const b=document.getElementById("tmRBack"),h=document.getElementById("tmRHome");const goHome=()=>{if(home)home();else{trivia.run=null;trivia.view="home";renderTriviaView()}scrollTo(0,0)};if(b)b.onclick=goHome;if(h)h.onclick=goHome}

/* keys: 1–4 to answer, Enter for next */
document.addEventListener("keydown",e=>{const v=view();if(!v||!v.querySelector(".tm-play")||e.ctrlKey||e.metaKey||e.altKey)return;if(e.target&&/input|textarea|select/i.test(e.target.tagName)&&e.target.type!=="range")return;
 if(e.key==="Enter"){const n=document.getElementById("tmNext");if(n){e.preventDefault();e.stopPropagation();n.click();return}}
 if(KEY&&KEY.key&&KEY.key(e.key)){e.preventDefault();e.stopPropagation()}},true);
/* load the slower data early, while the player reads the page */
setTimeout(()=>{try{pools()}catch(e){}loadCities();loadThermo()},4000);
window.gfTriviaModes={practise,stampsTotal,xpNow,centroid,TYPES,GEN_TYPES,makeMap,genOne,textQ,pools,loadCities,startRun,showResults,rowOf,REGIONS,mc,cLink,wireLinks,noteMistake,credit,flagImg,near,usable,TOPICS,inTopic,parseQuery,textMatches,
 get thermoOK(){return thermoReady()},daily,pinDrop,photoHunt,hlStreak,survival,dailySet};

const css=document.createElement("style");css.id="tmStyle";css.textContent=`
.tm-build{ background:linear-gradient(135deg,rgba(255,255,255,.95),rgba(232,244,255,.92)); border-radius:24px; padding:16px; margin:6px 0 14px; box-shadow:0 6px 22px rgba(20,40,70,.08); }
.tm-bh{ display:flex; flex-wrap:wrap; align-items:baseline; gap:4px 12px; margin-bottom:10px; } .tm-bh h2{ margin:0; font-size:20px; } .tm-bsub{ font-size:13px; opacity:.7; }
.tm-search{ display:flex; align-items:center; gap:8px; background:#fff; border:2px solid #cfe0f1; border-radius:999px; padding:4px 4px 4px 14px; } .tm-search:focus-within{ border-color:#3a95d0; box-shadow:0 0 0 4px rgba(58,149,208,.15); }
.tm-search input{ -webkit-appearance:none; appearance:none; background:transparent !important; box-shadow:none !important; flex:1; min-width:0; border:0; outline:0; background:none; font-weight:600;font-size:16px;font-family:inherit; color:inherit; padding:8px 0; } .tm-search .tv-go{ padding:9px 18px; font-size:15px; white-space:nowrap; } .tm-sicon{ opacity:.6; }
.tm-ex{ display:flex; flex-wrap:wrap; gap:6px; margin:10px 0 4px; } .tm-exb{ border:1px dashed rgba(0,0,0,.2); background:rgba(255,255,255,.6); border-radius:999px; padding:3px 10px; font-weight:600;font-size:12.5px;font-family:inherit; cursor:pointer; color:inherit; } .tm-exb:hover{ background:#fff; border-style:solid; }
.tm-filters{ margin-top:8px; } .tm-filters>summary{ cursor:pointer; font-weight:800; font-size:14px; list-style:none; display:inline-flex; gap:6px; align-items:center; } .tm-filters>summary::before{ content:"▸"; transition:transform .2s; } .tm-filters[open]>summary::before{ transform:rotate(90deg); }
.tm-filters summary em{ font-style:normal; font-size:11px; background:#9fd0f0; border-radius:999px; padding:1px 8px; } .tm-fbody{ display:grid; gap:6px; margin:8px 0 2px; }
.tm-frow{ display:flex; align-items:center; gap:8px; margin-top:6px; } .tm-flab{ font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:.04em; opacity:.6; min-width:76px; } .tm-fchips{ display:flex; flex-wrap:wrap; gap:5px; } .tm-fchips .chip{ padding:4px 11px; font-size:12.5px; }
.tm-count{ font-size:13px; margin:10px 2px 0; opacity:.85; } .tm-saved{ display:flex; flex-wrap:wrap; align-items:center; gap:6px; margin-top:10px; } .tm-sq{ display:inline-flex; align-items:center; } .tm-sq .chip{ border-top-right-radius:0; border-bottom-right-radius:0; padding:4px 10px; font-size:12.5px; }
.tm-sqx{ border:1px solid rgba(0,0,0,.12); border-left:0; background:rgba(255,255,255,.7); border-radius:0 999px 999px 0; height:28px; padding:0 8px; cursor:pointer; color:inherit; opacity:.6; } .tm-sqx:hover{ opacity:1; }
.tm-mist{ margin-top:10px; border:0; background:#fff3e0; color:#9a5a10; border-radius:999px; padding:7px 14px; font-weight:700;font-size:13px;font-family:inherit; cursor:pointer; } .tm-mist b{ background:#f0a040; color:#fff; border-radius:999px; padding:0 7px; margin-left:4px; }
.tm-modes{ margin:4px 0 8px; } .tm-mgrid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:10px; }
.tm-mcard{ display:flex; flex-direction:column; align-items:flex-start; gap:6px; text-align:left; border:0; background:rgba(255,255,255,.88); border-radius:18px; box-shadow:0 3px 12px rgba(20,40,70,.08); padding:12px 14px; cursor:pointer; font:inherit; color:inherit; transition:transform .15s,box-shadow .15s; }
.tm-mcard:hover{ transform:translateY(-1px); box-shadow:0 6px 18px rgba(20,40,70,.14); } .tm-mcard.hot{ background:linear-gradient(135deg,#fff7e6,#ffe9c7); } .tm-mcard.done{ background:linear-gradient(135deg,#eef9ee,#dff2df); }
.tm-mic{ font-size:28px; line-height:1; } .tm-mt{ display:flex; flex-direction:column; gap:2px; } .tm-mt b{ font-size:15.5px; } .tm-mt small{ font-size:12px; opacity:.72; } .tm-mt em{ font-style:normal; font-size:12px; font-weight:700; color:#b0700a; }
.tm-wrap{ max-width:820px; margin:0 auto; padding:0 12px 60px; } .tm-bar{ display:flex; flex-wrap:wrap; align-items:center; gap:8px 12px; margin:6px 0 10px; font-size:14px; } .tm-title{ font-size:15px; } .tm-prog{ opacity:.75; } .tm-score{ margin-left:auto; }
.tm-pbar{ flex:1 1 80px; max-width:160px; height:6px; border-radius:3px; background:rgba(0,0,0,.08); overflow:hidden; } .tm-pbar i{ display:block; height:100%; background:#3a95d0; }
.tm-lives{ color:#e0565b; letter-spacing:1px; } .tm-lives i{ font-style:normal; opacity:.22; }
.tm-card{ background:rgba(255,255,255,.95); border-radius:22px; padding:16px; box-shadow:0 6px 22px rgba(20,40,70,.09); }
.tm-meta{ display:flex; justify-content:space-between; align-items:center; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; opacity:.65; } .tm-dots{ display:inline-flex; gap:3px; } .tm-dots i{ width:7px; height:7px; border-radius:50%; background:rgba(0,0,0,.15); } .tm-dots i.on{ background:#e8701a; }
.tm-q{ font-size:21px; font-weight:800; line-height:1.3; margin:8px 0 12px; } .tm-hint{ display:block; font-size:14px; font-weight:600; opacity:.75; margin-top:4px; } .tm-hint .tm-flag{ margin-right:5px; } .tm-sub{ font-size:13px; opacity:.7; margin:-6px 0 8px; }
.tm-flag{ width:24px; height:auto; border-radius:3px; box-shadow:0 1px 3px rgba(0,0,0,.25); vertical-align:-3px; margin-right:6px; }
.tm-opts{ display:grid; grid-template-columns:1fr 1fr; gap:8px; } .tm-opts.two .tm-o{ justify-content:center; font-size:17px; }
.tm-o{ display:flex; align-items:center; gap:8px; border:1.5px solid rgba(0,0,0,.12); background:#fff; border-radius:14px; padding:11px 12px; font-weight:600;font-size:15px;font-family:inherit; cursor:pointer; text-align:left; color:inherit; min-height:48px; } .tm-o:hover:not([disabled]){ border-color:#3a95d0; background:#f4f9fe; }
.tm-o kbd{ font-size:11px; opacity:.45; font-family:inherit; } .tm-o small{ display:block; font-size:11.5px; opacity:.65; font-weight:500; } .tm-o.ok{ background:#e3f5e3; border-color:#3fae4a; } .tm-o.miss{ background:#fff4e2; border-color:#f0b860; } .tm-o.dim{ opacity:.55; }
.tm-after{ margin-top:10px; font-size:14px; } .tm-after .tm-flag{ width:60px; }
.tm-fb{ margin-top:12px; border-radius:18px; padding:12px 14px; } .tm-fb.good{ background:#e9f6e9; } .tm-fb.soft{ background:#fff6e8; } .tm-fbm{ font-size:15px; } .tm-fbm b{ margin-right:4px; } .tm-why{ margin:6px 0 0; font-size:14px; opacity:.85; } .tm-life{ margin:6px 0 0; font-size:13px; color:#b0505a; }
.tm-acts{ display:flex; justify-content:center; gap:8px; margin-top:12px; } .tm-acts .tv-go[disabled]{ opacity:.45; cursor:default; }
.tm-clink{ display:inline-flex; align-items:center; border:0; background:none; padding:0; font:inherit; color:inherit; font-weight:700; cursor:pointer; text-decoration:underline; text-decoration-color:rgba(58,149,208,.5); text-underline-offset:3px; } .tm-clink:hover{ color:#2d7fb8; }
.tm-map{ position:relative; border-radius:16px; overflow:hidden; background:#cfe6f7; touch-action:none; user-select:none; } .tm-map svg{ display:block; width:100%; height:auto; max-height:62vh; cursor:crosshair; }
.tm-map.small svg{ cursor:grab; max-height:300px; } .tm-sea{ fill:#cde5f6; } .tm-grat{ fill:none; stroke:rgba(255,255,255,.55); stroke-width:.5; } .tm-land{ fill:#f3ead7; stroke:#b9a98a; stroke-width:.35; vector-effect:non-scaling-stroke; }
.tm-pin circle{ fill:#3fae4a; stroke:#fff; } .tm-pin.you circle{ fill:#f0a040; } .tm-pin.part circle{ fill:#f0c050; } .tm-pin.miss circle{ fill:#8aa0c0; } .tm-pin text{ font-weight:800; fill:#1d2a35; stroke:#fff; paint-order:stroke; }
.tm-line{ fill:none; stroke:#e8701a; } .tm-zbtns{ position:absolute; right:8px; top:8px; display:flex; flex-direction:column; gap:4px; } .tm-zbtns button{ width:34px; height:34px; border-radius:10px; border:0; background:rgba(255,255,255,.92); font-weight:800;font-size:18px;font-family:inherit; cursor:pointer; box-shadow:0 2px 6px rgba(0,0,0,.15); color:#234; }
.tm-pinmsg{ text-align:center; margin-top:8px; font-size:14px; } .tm-pinmsg b{ font-size:16px; } .tm-cap{ font-size:13px; opacity:.8; }
.tm-photo{ margin:0 auto 10px; max-width:640px; } .tm-photo img{ width:100%; max-height:46vh; object-fit:cover; border-radius:14px; display:block; background:#e8eef4; } .tm-photo figcaption{ font-size:11px; opacity:.55; text-align:right; margin-top:2px; } .tm-photo.hunt img{ max-height:34vh; } @media (min-width:900px){ .tm-hunt{ display:grid; grid-template-columns:2fr 3fr; gap:12px; align-items:start; } .tm-hunt .tm-photo{ margin:0; } .tm-hunt .tm-photo img{ max-height:60vh; } .tm-play.tm-mode .tm-wrap, .tm-wrap.tm-mode{ max-width:1100px; } }
.tm-hl{ display:grid; grid-template-columns:1fr auto 1fr; gap:8px; align-items:stretch; margin:8px 0 4px; } .tm-hlc{ display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; gap:4px; background:#f4f8fc; border-radius:16px; padding:12px 8px; }
.tm-hlc .tm-flag{ width:64px; margin:0 0 4px; } .tm-hlc b{ font-size:17px; } .tm-hlc small{ font-size:12px; opacity:.65; } .tm-hlv{ font-weight:800;font-size:18px;font-family:inherit; color:#2d7fb8; } .tm-hlvs{ align-self:center; font-weight:800; opacity:.45; }
.tm-ord{ display:grid; gap:6px; } .tm-oi{ display:flex; align-items:center; gap:10px; border:1.5px solid rgba(0,0,0,.12); background:#fff; border-radius:14px; padding:8px 12px; font-weight:600;font-size:15px;font-family:inherit; cursor:pointer; color:inherit; text-align:left; min-height:46px; }
.tm-oi.on{ border-color:#3a95d0; background:#f1f8fe; } .tm-oi.ok{ background:#e3f5e3; border-color:#3fae4a; } .tm-oi.off{ background:#fff6e8; border-color:#f0c070; }
.tm-oin{ width:28px; height:28px; flex:none; border-radius:50%; display:grid; place-items:center; background:rgba(0,0,0,.07); font-weight:800; } .tm-oi.on .tm-oin{ background:#3a95d0; color:#fff; } .tm-oit{ flex:1; display:flex; align-items:center; gap:6px; flex-wrap:wrap; } .tm-oit small{ opacity:.6; font-size:12px; } .tm-oiv{ font-size:13px; font-weight:700; } .tm-oiv small{ font-weight:500; opacity:.7; }
.tm-match{ display:grid; grid-template-columns:1fr 1fr; gap:10px; } .tm-mcol{ display:grid; gap:6px; align-content:start; } .tm-mi{ display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; border:2px solid rgba(0,0,0,.12); background:#fff; border-radius:14px; padding:8px; min-height:52px; font-weight:600;font-size:14.5px;font-family:inherit; cursor:pointer; color:inherit; text-align:center; }
.tm-mi.sel{ border-color:#3a95d0; box-shadow:0 0 0 3px rgba(58,149,208,.2); } .tm-mi.on{ border-color:var(--mc,#3a95d0); background:color-mix(in srgb,var(--mc,#3a95d0) 12%,#fff); } .tm-mi.ok{ background:#e3f5e3; border-color:#3fae4a; } .tm-mi.off{ background:#fff6e8; border-color:#f0c070; } .tm-mi small{ font-size:11px; opacity:.7; font-weight:500; }
.tm-mflag{ width:84px; height:auto; border-radius:4px; box-shadow:0 1px 4px rgba(0,0,0,.25); }
.tm-num{ max-width:520px; margin:6px auto; text-align:center; } .tm-num output{ display:block; font-weight:800;font-size:26px;font-family:inherit; margin-bottom:8px; } .tm-num input{ width:100%; accent-color:#e8701a; } .tm-numres{ text-align:center; margin-top:8px; font-size:15px; } .tm-numflag{ text-align:center; margin-bottom:6px; } .tm-numflag .tm-flag{ width:72px; margin:0; } .tm-numflag small{ display:block; opacity:.65; }
.tm-outline{ display:flex; justify-content:center; margin:0 0 10px; } .tm-outline svg{ width:220px; height:220px; max-width:60vw; } .tm-outline svg path{ fill:#3a95d0; }
.tm-clim{ display:flex; justify-content:center; margin:0 0 10px; overflow-x:auto; } .tm-clim svg{ max-width:min(100%,520px); height:auto; }
.tm-res .tm-rcard{ background:linear-gradient(135deg,rgba(255,255,255,.96),rgba(255,244,230,.94)); border-radius:24px; padding:18px; box-shadow:0 6px 22px rgba(20,40,70,.09); }
.tm-rtop{ display:flex; flex-wrap:wrap; align-items:center; gap:10px 22px; } .tm-rscore b{ font-weight:900;font-size:54px;line-height:1;font-family:inherit; color:#e8701a; } .tm-rscore span{ font-size:18px; opacity:.6; margin-left:4px; }
.tm-rwords{ display:flex; flex-direction:column; gap:2px; } .tm-rwords b{ font-size:20px; } .tm-rwords span{ opacity:.75; } .tm-rearn{ display:flex; gap:6px; margin-top:6px; } .tm-xp,.tm-stamp{ font-size:12.5px; font-weight:800; border-radius:999px; padding:3px 10px; background:#fff1d6; color:#9a5a10; } .tm-stamp{ background:#e6f0ff; color:#2d5fa8; }
.tm-racts{ display:flex; flex-wrap:wrap; gap:8px; margin-top:14px; } .tm-rlevel{ margin-top:10px; font-size:13px; } .tm-rlevel>*{ margin:2px 0; } .tm-rextra{ margin:10px 0 0; font-size:14px; }
.tm-rmapw h3,.tm-rh{ font-size:17px; margin:18px 4px 8px; } .tm-rlist{ list-style:none; padding:0; margin:0; display:grid; gap:8px; }
.tm-rrow{ display:flex; gap:10px; background:rgba(255,255,255,.92); border-radius:16px; padding:10px 12px; box-shadow:0 2px 8px rgba(20,40,70,.06); border-left:5px solid #3fae4a; } .tm-rrow.part{ border-left-color:#f0c050; } .tm-rrow.miss{ border-left-color:#9fb4cf; }
.tm-rdot{ flex:none; width:24px; height:24px; border-radius:50%; display:grid; place-items:center; font-size:12px; font-weight:800; background:#e3f5e3; color:#2b7a33; } .tm-rrow.part .tm-rdot{ background:#fff3d0; color:#8a6410; } .tm-rrow.miss .tm-rdot{ background:#e9eff7; color:#4b6080; }
.tm-rbody{ flex:1; min-width:0; } .tm-rq{ font-weight:700; font-size:14.5px; line-height:1.35; } .tm-rthumb{ display:block; max-width:140px; max-height:80px; border-radius:8px; margin:6px 0; object-fit:cover; }
.tm-rans{ display:flex; flex-wrap:wrap; align-items:center; gap:4px 8px; margin-top:4px; font-size:14px; } .tm-rlab{ font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:.04em; opacity:.55; } .tm-ryou{ opacity:.8; } .tm-rright{ font-weight:700; }
.tm-rwhy{ font-size:13px; opacity:.75; margin-top:4px; }
.tm-daily{ margin-top:14px; display:flex; flex-direction:column; align-items:flex-start; gap:8px; } .tm-grid{ display:grid; grid-template-columns:repeat(5,30px); gap:4px; font-size:24px; line-height:30px; } .tm-share{ display:none; } .tm-dmeta{ font-size:14px; }
.tm-toast{ position:fixed; left:50%; bottom:24px; transform:translate(-50%,20px); background:#1f2a33; color:#fff; padding:9px 16px; border-radius:999px; font-size:14px; opacity:0; pointer-events:none; transition:.25s; z-index:9999; } .tm-toast.on{ opacity:1; transform:translate(-50%,0); }
.tm-mixrow{ background:#eef6ff; }
body.sky-night .tm-build, body.dark-theme .tm-build{ background:rgba(30,34,60,.9); } body.sky-night .tm-search, body.dark-theme .tm-search{ background:rgba(255,255,255,.06); border-color:rgba(255,255,255,.18); }
body.sky-night .tm-exb, body.dark-theme .tm-exb, body.sky-night .tm-sqx{ background:rgba(255,255,255,.06); border-color:rgba(255,255,255,.2); }
body.sky-night .tm-mcard, body.dark-theme .tm-mcard, body.sky-night .tm-card, body.dark-theme .tm-card, body.sky-night .tm-rrow, body.dark-theme .tm-rrow{ background:rgba(30,34,60,.88); }
body.sky-night .tm-mcard.hot, body.sky-night .tm-mcard.done{ background:rgba(60,52,40,.85); } body.sky-night .tm-mt em{ color:#f0c27a; }
body.sky-night .tm-o, body.dark-theme .tm-o, body.sky-night .tm-oi, body.sky-night .tm-mi, body.dark-theme .tm-oi, body.dark-theme .tm-mi{ background:rgba(255,255,255,.06); border-color:rgba(255,255,255,.16); color:inherit; }
body.sky-night .tm-o:hover:not([disabled]){ background:rgba(58,149,208,.18); }
body.sky-night .tm-o.ok, body.sky-night .tm-oi.ok, body.sky-night .tm-mi.ok{ background:rgba(63,174,74,.25); border-color:#3fae4a; } body.sky-night .tm-o.miss, body.sky-night .tm-oi.off, body.sky-night .tm-mi.off{ background:rgba(240,184,96,.18); border-color:#c8933f; }
body.sky-night .tm-fb.good{ background:rgba(63,174,74,.18); } body.sky-night .tm-fb.soft{ background:rgba(240,184,96,.14); } body.sky-night .tm-hlc{ background:rgba(255,255,255,.06); } body.sky-night .tm-hlv{ color:#8cc8f0; }
body.sky-night .tm-res .tm-rcard{ background:rgba(30,34,60,.92); } body.sky-night .tm-xp{ background:rgba(240,194,122,.18); color:#f0c27a; } body.sky-night .tm-stamp{ background:rgba(120,160,240,.18); color:#a8c4ff; }
body.sky-night .tm-sea{ fill:#16304a; } body.sky-night .tm-land{ fill:#3c4660; stroke:#6a7690; } body.sky-night .tm-grat{ stroke:rgba(255,255,255,.08); } body.sky-night .tm-map{ background:#16304a; } body.sky-night .tm-pin text{ fill:#fff; stroke:#16304a; }
body.sky-night .tm-zbtns button{ background:rgba(30,34,60,.9); color:#eee; } body.sky-night .tm-clink:hover{ color:#8cc8f0; } body.sky-night .tm-mist{ background:rgba(240,160,64,.16); color:#f0c27a; } body.sky-night .tm-mixrow{ background:rgba(58,149,208,.12); }
body.sky-night .tm-rdot{ background:rgba(63,174,74,.3); color:#bfe8c3; } body.sky-night .tm-rrow.part .tm-rdot{ background:rgba(240,192,80,.25); color:#f0d890; } body.sky-night .tm-rrow.miss .tm-rdot{ background:rgba(160,180,210,.2); color:#c8d4e6; }
@media (max-width:640px){
 .tm-build{ padding:12px; border-radius:20px; } .tm-bh h2{ font-size:18px; } .tm-bsub{ display:none; } .tm-search{ padding-left:10px; } .tm-search input{ font-size:15px; } .tm-search .tv-go{ padding:8px 12px; font-size:14px; }
 .tm-ex{ flex-wrap:nowrap; overflow-x:auto; scrollbar-width:none; } .tm-ex::-webkit-scrollbar{ display:none; } .tm-exb{ flex:none; }
 .tm-frow{ align-items:flex-start; flex-direction:column; gap:4px; } .tm-fchips{ flex-wrap:nowrap; overflow-x:auto; max-width:100%; scrollbar-width:none; } .tm-fchips::-webkit-scrollbar{ display:none; } .tm-fchips .chip{ flex:none; }
 .tm-mgrid{ grid-template-columns:1fr 1fr; gap:8px; } .tm-mcard{ flex-direction:column; align-items:flex-start; gap:4px; padding:10px; } .tm-mic{ font-size:24px; } .tm-mt b{ font-size:14px; } .tm-mt small{ font-size:11px; } .tm-mt em{ font-size:11px; }
 .tm-wrap{ padding:0 8px 70px; } .tm-card{ padding:12px; border-radius:18px; } .tm-q{ font-size:18px; } .tm-opts{ grid-template-columns:1fr; gap:6px; } .tm-opts.two{ grid-template-columns:1fr 1fr; } .tm-o{ padding:10px 12px; min-height:44px; }
 .tm-bar{ gap:6px 10px; font-size:13px; } .tm-title{ order:-1; flex:1 1 100%; } .tm-pbar{ display:none; } .tm-map svg{ max-height:52vh; }
 .tm-hl{ grid-template-columns:1fr; } .tm-hlvs{ text-align:center; } .tm-hlc{ flex-direction:row; flex-wrap:wrap; gap:6px 10px; padding:10px; } .tm-hlc .tm-flag{ width:44px; margin:0; }
 .tm-match{ gap:6px; } .tm-mi{ font-size:13px; padding:6px; } .tm-mflag{ width:66px; }
 .tm-rscore b{ font-size:44px; } .tm-rrow{ padding:9px 10px; } .tm-rq{ font-size:14px; }
}`;
document.head.appendChild(css);
})();
