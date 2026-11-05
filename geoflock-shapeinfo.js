/* GeoFlock — the details card for anything drawn on the map: a shape, a line, a point or a pin.
   Shapes: people, countries inside, height, what the land is made of.
   Lines: height profile, countries crossed in order, flight and shortest route, climate from end to end.
   Points and pins: the place, its climate, sun and daylight, people nearby, what is here, and the place through time.
   Every figure comes from data already in the app: GHS-POP 2025 (people), ETOPO 2022 (height), WorldClim 2.1 (climate),
   Natural Earth countries, RESOLVE 2017 biomes and ecoregions, the plate and volcano layers, OpenHistoricalMap
   (history) and PALEOMAP (deep time). */
(function(){
"use strict";
const RAD=Math.PI/180,KM=6371,WORLD_POP=8.2e9;
const T=()=>window.gfToolkit||{};
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]);
const hav=(p,q)=>d3.geoDistance(p,q);
const kmTxt=k=>(k>=100?Math.round(k).toLocaleString():k.toFixed(1))+" km";
const mTxt=m=>Math.round(m).toLocaleString()+" m";
const pct=x=>(x>=.995?100:x<.005?"<1":Math.round(x*100))+"%";
const fmtPpl=n=>n>=1e9?(n/1e9).toFixed(2)+" billion":n>=1e6?(n/1e6).toFixed(n>=1e8?0:1)+" million":n>=1e3?Math.round(n/1e3).toLocaleString()+" thousand":Math.round(n).toLocaleString();
const llTxt=ll=>Math.abs(ll[1]).toFixed(2)+"°"+(ll[1]>=0?"N":"S")+", "+Math.abs(ll[0]).toFixed(2)+"°"+(ll[0]>=0?"E":"W");
const latTxt=l=>Math.abs(l).toFixed(0)+"°"+(l>=0?"N":"S");

/* ---------- lookups ---------- */
/* countries and biomes are painted once onto an equirectangular grid (one colour per feature), so a point is
   a single pixel read; a pixel on a border (blended colours) falls back to the exact test */
const RW=2160,RH=1080;
function raster(feats){const c=document.createElement("canvas");c.width=RW;c.height=RH;const x=c.getContext("2d",{willReadFrequently:true});
 const pr=d3.geoEquirectangular().scale(RW/(2*Math.PI)).translate([RW/2,RH/2]),path=d3.geoPath(pr,x);
 feats.forEach((f,i)=>{if(!f.geometry)return;const k=i+1;x.fillStyle="rgb("+(k>>8)+","+(k&255)+",77)";x.beginPath();path(f);x.fill()});
 const d=x.getImageData(0,0,RW,RH).data;
 const at=ll=>{const px=Math.max(0,Math.min(RW-1,Math.floor((ll[0]+180)/360*RW))),py=Math.max(0,Math.min(RH-1,Math.floor((90-ll[1])/180*RH))),j=(py*RW+px)*4;
  if(d[j+3]<250||d[j+2]!==77)return d[j+3]<40?-1:null;const k=(d[j]<<8)|d[j+1];return k>=1&&k<=feats.length?k-1:null};
 return ll=>{const r=at(ll);if(r===-1)return-1;if(r!=null&&d3.geoContains(feats[r],ll))return r;
  for(let i=0;i<feats.length;i++){const f=feats[i];if(f.geometry&&f._bb&&!inBB(f._bb,ll))continue;if(f.geometry&&d3.geoContains(f,ll))return i}return-1}}
function inBB(b,ll){const[[x0,y0],[x1,y1]]=b;if(ll[1]<y0-.5||ll[1]>y1+.5)return false;if(x0<=x1)return ll[0]>=x0-.5&&ll[0]<=x1+.5;return ll[0]>=x0-.5||ll[0]<=x1+.5}
let CTY=null;
function countries(){if(CTY)return CTY;let F=[];try{F=projFeatures().filter(f=>f.geometry)}catch(e){}F.forEach(f=>{try{f._bb=d3.geoBounds(f)}catch(e){}});
 const look=raster(F);CTY={F,at:ll=>{const i=look(ll);return i>=0?F[i]:null}};return CTY}
function ctyName(f){if(!f)return null;const c=f.properties&&f.properties.c;try{return projName(c,c)}catch(e){return c}}
function ctyCode(f){return f&&f.properties&&f.properties.c}
let BIO=null;
function biomes(){if(BIO)return BIO;const N=window.GF_NATURE;const F=N&&N.biomes?N.biomes.features:[];F.forEach(f=>{try{f._bb=d3.geoBounds(f)}catch(e){}});const look=raster(F);BIO={F,at:ll=>{const i=look(ll);return i>=0?F[i].properties:null}};return BIO}
let ECO=null;
function ecoLoad(){if(ECO)return ECO;ECO=fetch("nature/ecoregions.topo.json").then(r=>r.json()).then(t=>{const fc=topojson.feature(t,t.objects.eco);fc.features.forEach(f=>{try{f._bb=d3.geoBounds(f)}catch(e){}});return fc.features}).catch(()=>[]);return ECO}
function ecoAt(F,ll){for(const f of F){if(f._bb&&!inBB(f._bb,ll))continue;try{if(d3.geoContains(f,ll))return f.properties}catch(e){}}return null}
/* which plate: the boundary lines are painted onto a grid and the areas between them filled one by one; each
   area takes the name of the plate label inside it */
let PLT=null;
function plates(){if(PLT)return PLT;const W=1440,H=720,c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d",{willReadFrequently:true});
 const pr=d3.geoEquirectangular().scale(W/(2*Math.PI)).translate([W/2,H/2]),path=d3.geoPath(pr,x);x.strokeStyle="#000";x.lineWidth=2.2;
 (OV().plates||[]).forEach(z=>{x.beginPath();path(z);x.stroke()});const d=x.getImageData(0,0,W,H).data,wall=new Uint8Array(W*H);for(let i=0;i<W*H;i++)wall[i]=d[i*4+3]>60?1:0;
 const lab=new Int32Array(W*H).fill(-1);let n=0;const st=[];
 for(let i=0;i<W*H;i++){if(wall[i]||lab[i]>=0)continue;lab[i]=n;st.push(i);while(st.length){const k=st.pop(),px=k%W,py=(k-px)/W;
  const nb=[py*W+((px+1)%W),py*W+((px-1+W)%W),py>0?k-W:-1,py<H-1?k+W:-1];for(const q of nb){if(q>=0&&!wall[q]&&lab[q]<0){lab[q]=n;st.push(q)}}}n++}
 const names={};(OV().plateLabels||[]).forEach(L=>{const q=pr(L.ll);if(!q)return;const k=Math.floor(q[1])*W+Math.floor(q[0]);const r=lab[k];if(r>=0&&!(r in names))names[r]=L.n});
 PLT={at:ll=>{const q=pr(ll);if(!q)return null;let k=Math.floor(q[1])*W+Math.floor(q[0]);let r=lab[k];if(r<0){for(let dd=1;dd<6&&r<0;dd++)for(const o of[dd,-dd,dd*W,-dd*W]){const v=lab[k+o];if(v>=0){r=v;break}}}return r>=0&&names[r]?names[r]:null}};return PLT}
const OV=()=>{try{return globeOverlays()}catch(e){return{}}};
function tzAt(ll){const Z=OV().tz||[];let best=null,ba=1e9;Z.forEach(z=>(z.polys||[]).forEach(p=>{try{if(d3.geoContains(p,ll)){const a=d3.geoArea(p);if(a<ba){ba=a;best=z.n}}}catch(e){}}));
 if(!best)return{n:"UTC "+(Math.round(ll[0]/15)>=0?"+":"")+Math.round(ll[0]/15),off:Math.round(ll[0]/15),sea:true};const m=best.match(/([+-−±])\s*(\d+)(?::(\d+))?/);let off=0;if(m){off=(+m[2])+(m[3]?+m[3]/60:0);if(m[1]==="-"||m[1]==="−")off=-off}return{n:best,off}}
function nearestCity(ll){const C=OV().cities||[];let b=null,bd=1e9;C.forEach(c=>{if(!c.ll)return;const d=hav(c.ll,ll);if(d<bd){bd=d;b=c}});return b?{c:b,km:bd*KM}:null}
const elev=ll=>{try{return gfCrossSection.elevAt(ll[0],ll[1])}catch(e){return 0}};
const dem=()=>{try{return gfCrossSection.loadDEM()}catch(e){return Promise.resolve()}};
const clim=()=>{try{return gfThermo.load()}catch(e){return Promise.resolve()}};
const pop=()=>{try{return gfPopCount.load()}catch(e){return Promise.reject()}};
function climAt(ll){try{const r=gfThermo.at(ll);if(!r)return null;const k=gfThermo.koppen(r.T,r.P,ll[1]);return{T:r.T,P:r.P,k,kn:gfThermo.KN[k]||k}}catch(e){return null}}
const KGROUP={A:"tropical",B:"dry",C:"mild",D:"cold-winter",E:"polar"};

/* samples spread evenly over a closed shape (weighted by the cosine of the latitude, so each stands for the same area) */
function samples(ring,n){let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;ring.forEach(([lo,la])=>{x0=Math.min(x0,lo);x1=Math.max(x1,lo);y0=Math.min(y0,la);y1=Math.max(y1,la)});
 if(x1-x0>180){/* across the date line */const r2=ring.map(([lo,la])=>[lo<0?lo+360:lo,la]);x0=1e9;x1=-1e9;r2.forEach(([lo])=>{x0=Math.min(x0,lo);x1=Math.max(x1,lo)})}
 const poly={type:"Polygon",coordinates:[ring]},out=[],dx=(x1-x0)/n||.01,dy=(y1-y0)/n||.01;
 for(let j=0;j<n;j++){const la=y0+(j+.5)*dy,w=Math.cos(la*RAD);for(let i=0;i<n;i++){let lo=x0+(i+.5)*dx;if(lo>180)lo-=360;const ll=[lo,la];if(d3.geoContains(poly,ll))out.push({ll,w})}}
 if(!out.length){try{out.push({ll:d3.geoCentroid(poly),w:1})}catch(e){}}return out}
function shares(S,key){const m=new Map();let tw=0;S.forEach(s=>{const k=key(s.ll);tw+=s.w;if(k==null)return;m.set(k,(m.get(k)||0)+s.w)});return[...m.entries()].map(([k,w])=>({k,f:w/tw})).sort((a,b)=>b.f-a.f)}
/* a line as evenly spaced points with the distance along it */
function along(p,n){const seg=[];let tot=0;for(let i=1;i<p.length;i++){const d=hav(p[i-1],p[i]);seg.push(d);tot+=d}const out=[];if(!tot)return[{ll:p[0],d:0}];
 for(let k=0;k<=n;k++){let t=tot*k/n,i=0;while(i<seg.length-1&&t>seg[i]){t-=seg[i];i++}const f=seg[i]?Math.min(1,t/seg[i]):0;out.push({ll:d3.geoInterpolate(p[i],p[i+1])(f),d:tot*k/n*KM})}return out}

/* ---------- sun (NOAA's simple formulas, good to a minute or two) ---------- */
function sunDay(date){const st=Date.UTC(date.getUTCFullYear(),0,1),n=Math.floor((date-st)/864e5)+1,g=2*Math.PI/365*(n-1);
 const eq=229.18*(.000075+.001868*Math.cos(g)-.032077*Math.sin(g)-.014615*Math.cos(2*g)-.040849*Math.sin(2*g));
 const de=.006918-.399912*Math.cos(g)+.070257*Math.sin(g)-.006758*Math.cos(2*g)+.000907*Math.sin(2*g)-.002697*Math.cos(3*g)+.00148*Math.sin(3*g);return{eq,de}}
function sunTimes(ll,date){const{eq,de}=sunDay(date),ph=ll[1]*RAD,c=(Math.cos(90.833*RAD)/(Math.cos(ph)*Math.cos(de)))-Math.tan(ph)*Math.tan(de);
 if(c>1)return{polar:"night",len:0,de,eq};if(c<-1)return{polar:"day",len:24,de,eq};const ha=Math.acos(c)/RAD;
 return{rise:720-4*(ll[0]+ha)-eq,set:720-4*(ll[0]-ha)-eq,noon:720-4*ll[0]-eq,len:2*ha/15,de,eq}}
const hm=(min,off)=>{let m=Math.round(min+off*60);m=((m%1440)+1440)%1440;return String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0")};
function sunPathSVG(ll,date){const W=300,H=120,pad=22,lat=ll[1]*RAD;const el=(de,h)=>Math.asin(Math.sin(lat)*Math.sin(de)+Math.cos(lat)*Math.cos(de)*Math.cos((h-12)*15*RAD))/RAD;
 const X=h=>pad+(W-2*pad)*h/24,Y=e=>H/2-e*(H/2-10)/90;const line=de=>{let d="";for(let h=0;h<=24;h+=.25)d+=(h?"L":"M")+X(h).toFixed(1)+","+Y(el(de,h)).toFixed(1);return d};
 const today=sunDay(date).de,yr=date.getUTCFullYear(),jun=sunDay(new Date(Date.UTC(yr,5,21))).de,dec=sunDay(new Date(Date.UTC(yr,11,21))).de;
 let s='<svg viewBox="0 0 '+W+' '+H+'" width="100%" class="gfsi-svg"><rect x="'+pad+'" y="'+Y(0)+'" width="'+(W-2*pad)+'" height="'+(H-Y(0)-6)+'" fill="rgba(60,70,110,.25)"/><line x1="'+pad+'" x2="'+(W-pad)+'" y1="'+Y(0)+'" y2="'+Y(0)+'" stroke="currentColor" stroke-opacity=".5"/>';
 s+='<path d="'+line(jun)+'" fill="none" stroke="#f2a33a" stroke-opacity=".45" stroke-dasharray="3 3"/><path d="'+line(dec)+'" fill="none" stroke="#6aa0e0" stroke-opacity=".55" stroke-dasharray="3 3"/><path d="'+line(today)+'" fill="none" stroke="#f2c230" stroke-width="2.4"/>';
 [0,6,12,18,24].forEach(h=>s+='<text x="'+X(h)+'" y="'+(H-1)+'" font-size="9" text-anchor="middle" fill="currentColor" opacity=".7">'+(h===24?"24h":h+"h")+'</text>');
 s+='<text x="'+(W-pad)+'" y="'+(Y(0)-4)+'" font-size="9" text-anchor="end" fill="currentColor" opacity=".7">horizon</text></svg>';return s}
function dayLenSVG(ll){const W=300,H=90,pad=22,yr=new Date().getUTCFullYear();let d="",mx=0,mn=24,pts=[];for(let k=0;k<=52;k++){const dt=new Date(Date.UTC(yr,0,1+k*7)),t=sunTimes(ll,dt),L=t.len;pts.push(L);mx=Math.max(mx,L);mn=Math.min(mn,L)}
 const X=k=>pad+(W-2*pad)*k/52,Y=L=>H-16-(H-26)*L/24;pts.forEach((L,k)=>d+=(k?"L":"M")+X(k).toFixed(1)+","+Y(L).toFixed(1));
 let s='<svg viewBox="0 0 '+W+' '+H+'" width="100%" class="gfsi-svg"><line x1="'+pad+'" x2="'+(W-pad)+'" y1="'+Y(12)+'" y2="'+Y(12)+'" stroke="currentColor" stroke-opacity=".25" stroke-dasharray="2 3"/><text x="'+(pad-3)+'" y="'+(Y(12)+3)+'" font-size="8.5" text-anchor="end" fill="currentColor" opacity=".7">12h</text><path d="'+d+'" fill="none" stroke="#f2c230" stroke-width="2"/>';
 "JFMAMJJASOND".split("").forEach((m,i)=>s+='<text x="'+(pad+(W-2*pad)*(i+.5)/12)+'" y="'+(H-3)+'" font-size="9" text-anchor="middle" fill="currentColor" opacity=".7">'+m+'</text>');return{svg:s+'</svg>',mx,mn}}

/* ---------- the card ---------- */
let card=null,job=0;
/* the card's place and height are remembered: it opens where you left it */
let POS={};try{POS=JSON.parse(localStorage.getItem("gfsiPos")||"{}")}catch(e){}
const savePos=()=>{try{const r=card.getBoundingClientRect();POS={top:Math.round(r.top),left:card.style.left?Math.round(r.left):null,h:card.style.height?Math.round(r.height):POS.h||null};localStorage.setItem("gfsiPos",JSON.stringify(POS))}catch(e){}};
function shell(title,sub){if(!card){card=document.createElement("div");card.className="gfsi";["pointerdown","mousedown","wheel","click","dblclick"].forEach(ev=>card.addEventListener(ev,e=>e.stopPropagation()));document.body.appendChild(card);
  if(POS.top!=null)card.style.top=Math.max(4,Math.min(innerHeight-80,POS.top))+"px";if(POS.left!=null){card.style.left=Math.max(4,Math.min(innerWidth-80,POS.left))+"px";card.style.right="auto"}if(POS.h)card.style.height=Math.max(140,Math.min(innerHeight-20,POS.h))+"px"}
 card.innerHTML='<div class="gfsi-h"><div><b>'+esc(title)+'</b>'+(sub?'<small>'+esc(sub)+'</small>':'')+'</div><button type="button" class="gfsi-x" aria-label="Close">×</button></div><div class="gfsi-b"></div><div class="gfsi-grip" title="Drag to make it taller or shorter"></div>';
 card.querySelector(".gfsi-x").onclick=close;
 /* drag by its title */
 const h=card.querySelector(".gfsi-h");h.onpointerdown=e=>{if(e.target.closest("button"))return;const r=card.getBoundingClientRect(),ox=e.clientX-r.left,oy=e.clientY-r.top;
  const mv=ev=>{card.style.left=Math.max(4,Math.min(innerWidth-80,ev.clientX-ox))+"px";card.style.top=Math.max(4,Math.min(innerHeight-40,ev.clientY-oy))+"px";card.style.right="auto"};
  const up=()=>{removeEventListener("pointermove",mv);removeEventListener("pointerup",up);savePos()};addEventListener("pointermove",mv);addEventListener("pointerup",up)};
 /* drag the bottom edge: taller or shorter */
 card.querySelector(".gfsi-grip").onpointerdown=e=>{e.preventDefault();const r=card.getBoundingClientRect(),y0=e.clientY,h0=r.height;
  const mv=ev=>{card.style.height=Math.max(140,Math.min(innerHeight-r.top-6,h0+ev.clientY-y0))+"px";card.style.maxHeight="none"};
  const up=()=>{removeEventListener("pointermove",mv);removeEventListener("pointerup",up);savePos()};addEventListener("pointermove",mv);addEventListener("pointerup",up)};
 return card.querySelector(".gfsi-b")}
function sec(body,ic,title,open){const s=document.createElement("details");s.className="gfsi-s";if(open!==false)s.open=true;s.innerHTML='<summary><i>'+ic+'</i>'+esc(title)+'</summary><div class="gfsi-c"><p class="gfsi-wait">Working it out…</p></div>';body.appendChild(s);return s.querySelector(".gfsi-c")}
function close(){job++;if(card){card.remove();card=null}}
const row=(k,v)=>'<div class="gfsi-r"><span>'+k+'</span><b>'+v+'</b></div>';
const bars=list=>'<div class="gfsi-bars">'+list.map(x=>'<div class="gfsi-bar"><span>'+esc(x.n)+'</span><i><em style="width:'+Math.max(1.5,(x.w!=null?x.w:x.f)*100).toFixed(1)+'%;background:'+(x.col||"#2f6fb0")+'"></em></i><b>'+(x.lab!=null?x.lab:pct(x.f))+'</b></div>').join("")+'</div>';
/* sea hidden by default (a switch shows it); land shares then add up to 100% */
let SEA=false;const seaSw=on=>'<label class="gfsi-sea"><input type="checkbox" data-sea'+(on?" checked":"")+'> Show sea</label>';
const noSea=(list,isSea)=>{if(SEA)return list;const L=list.filter(x=>!isSea(x)),t=L.reduce((a,x)=>a+x.f,0)||1;return L.map(x=>Object.assign({},x,{f:x.f/t}))};
const big=v=>v>=1e12?(v/1e12).toFixed(1)+" trillion":v>=1e9?(v/1e9).toFixed(1)+" billion":v>=1e6?(v/1e6).toFixed(1)+" million":Math.round(v).toLocaleString();
/* ways to rank the countries inside a shape */
const RANKS=[["share","Share of the shape"],["pop","Population"]];
function rankVal(k,c){try{const P=typeof COUNTRY_POPULATION!=="undefined"?COUNTRY_POPULATION[c]:null,Gd=typeof COUNTRY_GDP!=="undefined"?COUNTRY_GDP[c]:null;
 if(k==="pop")return P;if(k==="gdp")return Gd!=null?Gd*1e6:null;if(k==="gdppc")return P&&Gd?Gd*1e6/P:null;
 if(k==="area"){const f=countries().F.find(x=>ctyCode(x)===c);return f?d3.geoArea(f)*KM*KM:null}}catch(e){}return null}
function rankLab(k,v){if(v==null)return"–";if(k==="pop")return big(v)+" people";if(k==="gdp")return"$"+big(v);if(k==="gdppc")return"$"+Math.round(v).toLocaleString();if(k==="area")return big(v)+" km²";return pct(v)}
const live=j=>j===job&&card;

function open(s){if(!s)return;close();const j=++job;
 if(s.pin||s.t==="geoDot"||(s.g&&s.g.m==="text"))return point(s.ll||(s.g&&s.g.A)||s.p[0],s.n||(s.tx&&s.tx!=="Text"?s.tx:null),j);
 const closed=s.f||(s.g&&(s.g.m==="poly"?s.g.cl:["compass","rect","oval","ring"].includes(s.g.m)));
 if(closed)return shape(s,j);return line(s,j)}

/* ----- a shape ----- */
function shape(s,j){const tk=T();let ring=tk.fillRing?tk.fillRing(s):s.p;if(ring.length&&(ring[0][0]!==ring[ring.length-1][0]||ring[0][1]!==ring[ring.length-1][1]))ring=ring.concat([ring[0]]);
 const A=d3.geoArea({type:"Polygon",coordinates:[ring]})*KM*KM;
 const b=shell(s.tx&&s.tx!=="Text"?s.tx:"Your shape",(A>=100?Math.round(A).toLocaleString():A.toFixed(1))+" km²");
 const cP=sec(b,"👥","People"),cC=sec(b,"🏳️","Countries inside"),cE=sec(b,"⛰️","Height"),cM=sec(b,"🌿","What the land is made of");
 pop().then(()=>{if(!live(j))return;const c=gfPopCount.count([ring]);if(!c){cP.innerHTML="<p>No population data here.</p>";return}
  cP.innerHTML=row("People living here",fmtPpl(c.tot))+row("Density",(c.tot/A>=10?Math.round(c.tot/A).toLocaleString():(c.tot/A).toFixed(1))+" per km²")+row("Share of the world",c.tot/WORLD_POP<.0005&&c.tot>0?"under 0.05%":(c.tot/WORLD_POP*100).toFixed(c.tot/WORLD_POP<.1?2:1)+"%")+'<p class="gfsi-note">GHS-POP 2025, counted over 0.1° cells; the world is about 8.2 billion people.</p>'}).catch(()=>{cP.innerHTML="<p>Population data did not load.</p>"});
 setTimeout(()=>{if(!live(j))return;const S=samples(ring,40),C=countries();
  const sh=shares(S,ll=>{const f=C.at(ll);return f?ctyCode(f):"~sea"});const land=sh.filter(x=>x.k!=="~sea"),sea=sh.find(x=>x.k==="~sea");
  if(!land.length)cC.innerHTML="<p>No country: it is all sea"+(sea?"":"")+".</p>";
  else{let rk="share";const draw=()=>{const L=land.map(x=>({n:projName(x.k,x.k),f:x.f,k:x.k}));let shown;
    if(rk==="share")shown=noSea(L.concat(sea?[{n:"Sea",f:sea.f,col:"#5b8fc7",k:"~sea"}]:[]),x=>x.k==="~sea").sort((a,b)=>(a.k==="~sea")-(b.k==="~sea")||b.f-a.f).slice(0,13);
    else{const V=L.map(x=>Object.assign(x,{v:rankVal(rk,x.k)})).filter(x=>x.v!=null).sort((a,b)=>b.v-a.v).slice(0,12),mx=V.length?V[0].v:1;shown=V.map(x=>Object.assign(x,{w:x.v/mx,lab:rankLab(rk,x.v)}))}
    cC.innerHTML='<div class="gfsi-ctl"><label>Rank by <select data-rk>'+RANKS.map(([k,t])=>'<option value="'+k+'"'+(k===rk?" selected":"")+'>'+t+'</option>').join("")+'</select></label>'+(rk==="share"&&sea?seaSw(SEA):"")+'</div>'+bars(shown)+(land.length>12?'<p class="gfsi-note">'+land.length+' countries in all</p>':'')+
     '<button type="button" class="gfsi-btn" data-sel>Turn these countries into shapes on the map</button><p class="gfsi-note">'+(rk==="share"?"Share of the shape’s "+(SEA?"area.":"land."):"Ranked by the whole country’s "+RANKS.find(r=>r[0]===rk)[1].toLowerCase()+".")+'</p>';
    cC.querySelector("[data-sel]").onclick=()=>selectCountries(land.slice(0,12).map(x=>x.k));
    cC.querySelector("[data-rk]").onchange=e=>{rk=e.target.value;draw()};const sw=cC.querySelector("[data-sea]");if(sw)sw.onchange=()=>{SEA=sw.checked;draw();try{drawM&&drawM()}catch(e){}}};draw()}
  dem().then(()=>{if(!live(j))return;const st=tk.elevStats?tk.elevStats(ring):null;if(!st){cE.innerHTML="<p>No height data.</p>";return}
   const nm=ll=>{try{const f=gfCrossSection.lfAt(ll,elev(ll));return f&&f.n?" · "+esc(f.n):""}catch(e){return""}};
   cE.innerHTML=row("Highest",mTxt(st.hi)+'<small>'+nm(st.hiAt)+'</small>')+row("Lowest",(st.lo<0?mTxt(-st.lo)+(C.at(st.loAt)?" below sea level":" deep (sea floor)"):mTxt(st.lo))+'<small>'+nm(st.loAt)+'</small>')+row("Average",mTxt(st.avg))+'<p class="gfsi-note">ETOPO 2022, 0.1° grid: single peaks read a little low.</p>'});
  /* make-up: by biome, by climate, by how much people have changed the land */
  clim().then(()=>{if(!live(j))return;const B=biomes(),N=window.GF_NATURE||{};
   const bio=shares(S,ll=>{const p=B.at(ll);return p?p.n:(C.at(ll)?null:"Sea")}).filter(x=>x.k);
   const kp=shares(S,ll=>{const c=climAt(ll);return c?c.kn:null}).filter(x=>x.k);
   const fc=N.footClasses||[];let fp=[];if(N.footprint&&N.footprint.features){const FF=N.footprint.features;FF.forEach(f=>{if(!f._bb)try{f._bb=d3.geoBounds(f)}catch(e){}});
    fp=shares(S.filter((_,i)=>i%3===0),ll=>{for(const f of FF){if(f._bb&&!inBB(f._bb,ll))continue;try{if(d3.geoContains(f,ll)){const k=f.properties.k,c=fc.find(x=>x[0]===k);return c?c[1]:k}}catch(e){}}return null}).filter(x=>x.k)}
   const card0=(N.cards||[]);const bcol=n=>{const c=card0.find(x=>x.n===n);return c&&c.col};
   const sum=bio.filter(x=>x.k!=="Sea").slice(0,3).map(x=>pct(x.f)+" "+x.k.toLowerCase()).join(", ");
   let cur=0;const hasSea=bio.some(x=>x.k==="Sea");
   drawM=()=>{if(!cM.isConnected)return;const tabs=[["Biome",bars(noSea(bio.map(x=>({n:x.k,f:x.f,col:x.k==="Sea"?"#5b8fc7":bcol(x.k)})),x=>x.n==="Sea").slice(0,8))],["Climate",kp.length?bars(kp.slice(0,8).map(x=>({n:x.k,f:x.f,col:"#c0802f"}))):"<p>No climate data (sea).</p>"]];
    if(fp.length)tabs.push(["Human footprint",bars(fp.map(x=>({n:x.k,f:x.f,col:"#8a6b4a"})))]);
    cM.innerHTML=(sum?'<p class="gfsi-sum">'+esc(sum)+'</p>':'')+'<div class="gfsi-tabs">'+tabs.map((t,i)=>'<button type="button" data-t="'+i+'" class="'+(i===cur?"on":"")+'">'+t[0]+'</button>').join("")+(hasSea?seaSw(SEA):"")+'</div><div class="gfsi-tab">'+tabs[cur][1]+'</div>';
    cM.querySelectorAll("[data-t]").forEach(bt=>bt.onclick=()=>{cur=+bt.dataset.t;drawM()});const sw=cM.querySelector("[data-sea]");if(sw)sw.onchange=()=>{SEA=sw.checked;drawM()}};drawM()})},30)}
let drawM=null;
/* the countries of a shape become shapes of their own (picked together in the Geometry set) */
function selectCountries(codes){const tk=T(),C=countries();if(!tk.keep)return;const k=tk.K(),n0=k.ink.length,cols=["#2a3f8f","#1e8c8a","#2f8f3e","#e8762a","#7a3fb0","#c8281c"];
 codes.forEach((c,i)=>{const f=C.F.find(x=>ctyCode(x)===c);if(!f)return;const g=f.geometry,P=g.type==="Polygon"?[g.coordinates]:g.coordinates;let best=null,ba=0;
  P.forEach(poly=>{const r=poly[0];try{const a=d3.geoArea({type:"Polygon",coordinates:[r]});const aa=a>2*Math.PI?4*Math.PI-a:a;if(aa>ba){ba=aa;best=r}}catch(e){}});if(!best)return;
  const step=Math.max(1,Math.ceil(best.length/500)),r=best.filter((_,q)=>q%step===0);if(r[r.length-1]!==r[0])r.push(r[0].slice());
  tk.keep({t:"geo",c:cols[i%cols.length],p:r,f:1,fo:.22,g:tk.polyFrom(r,1),tx:projName(c,c),cty:1})});
 const n1=k.ink.length;if(n1>n0){tk.GEO.sels=[];for(let i=n0;i<n1;i++)tk.GEO.sels.push(i);tk.GEO.sel=n1-1;tk.render()}}

/* ----- a line ----- */
function line(s,j){const tk=T(),p=s.p,L=along(p,400),len=L[L.length-1].d,a=p[0],z=p[p.length-1],gc=hav(a,z)*KM;
 const b=shell(s.tx&&s.tx!=="Text"?s.tx:"Your line",kmTxt(len));
 const cX=sec(b,"⛏️","Height along the line"),cC=sec(b,"🏳️","Countries crossed"),cT=sec(b,"✈️","Travel"),cK=sec(b,"🌡️","Climate along the line");
 cX.innerHTML='<p>See the ground and sea floor under the line, with the mountains, valleys and lakes named.</p><button type="button" class="gfsi-btn">Open the cross-section</button>';
 cX.querySelector("button").onclick=()=>{try{gfCrossSection.line(a,z,s.tx&&s.tx!=="Text"?s.tx:"Your line",p)}catch(e){}};
 setTimeout(()=>{if(!live(j))return;const C=countries();const runs=[];L.forEach((q,i)=>{const f=C.at(q.ll),k=f?ctyCode(f):"~sea";const last=runs[runs.length-1];if(last&&last.k===k)last.d1=q.d;else runs.push({k,d0:q.d,d1:q.d})});
  /* a blip of one sample on a border is merged into its neighbour */
  const R=runs.filter((r,i)=>r.d1-r.d0>len*.004||runs.length<3);const M=[];R.forEach(r=>{const l=M[M.length-1];if(l&&l.k===r.k)l.d1=r.d1;else M.push(Object.assign({},r))});
  for(let i=1;i<M.length;i++){M[i].d0=M[i-1].d1}
  const ctry=M.filter(r=>r.k!=="~sea");
  cC.innerHTML=ctry.length?'<ol class="gfsi-ol">'+M.map(r=>'<li class="'+(r.k==="~sea"?"sea":"")+'"><span>'+(r.k==="~sea"?"Sea":esc(projName(r.k,r.k)))+'</span><b>'+kmTxt(Math.max(0,r.d1-r.d0))+'</b></li>').join("")+'</ol><p class="gfsi-note">In order from where you started; '+new Set(ctry.map(r=>r.k)).size+' countr'+(new Set(ctry.map(r=>r.k)).size===1?"y":"ies")+'.</p>':"<p>No country: the line is over the sea.</p>"},30);
 {const fh=gc/850+.5,h=Math.floor(fh),m=Math.round((fh-h)*60/5)*5;const extra=len/gc-1;
  cT.innerHTML=row("Flight between the ends","about "+(h?h+" h ":"")+(m?m+" min":"")+'<small> · '+kmTxt(gc)+' at 850 km/h, plus take-off and landing</small>')+
   (gc>1?row("Shortest route (great circle)",kmTxt(gc))+row("Your line",kmTxt(len)+(extra>.003?' <small>('+(extra*100).toFixed(extra<.1?1:0)+'% longer)</small>':' <small>(already the shortest)</small>')):"")+
   '<p class="gfsi-note">On a flat map the shortest route looks curved, bending towards the pole: that is why flights to Asia from America cross the Arctic.</p><button type="button" class="gfsi-btn">Show the shortest route on the map</button>';
  cT.querySelector("button").onclick=()=>{const n=96,pts=[];for(let i=0;i<=n;i++)pts.push(d3.geoInterpolate(a,z)(i/n));try{tk.keep({t:"geoDash",c:"#1d6fb8",p:pts,lab:"shortest · "+kmTxt(gc),at:d3.geoInterpolate(a,z)(.5)})}catch(e){}}}
 clim().then(()=>{if(!live(j))return;const n=10,P=along(p,n).map(q=>Object.assign(q,{c:climAt(q.ll)}));const ok=P.filter(q=>q.c);if(!ok.length){cK.innerHTML="<p>The line is over the sea: no climate data.</p>";return}
  const W=300,H=130,l=30,r=30,t=10,bt=20,X=d=>l+(W-l-r)*d/len,Tm=q=>q.c.T.reduce((x,y)=>x+y)/12,Pm=q=>q.c.P.reduce((x,y)=>x+y);
  const tmin=Math.min(...ok.map(Tm),0),tmax=Math.max(...ok.map(Tm),25),pmax=Math.max(...ok.map(Pm),500);const YT=v=>t+(H-t-bt)*(1-(v-tmin)/(tmax-tmin)),bw=(W-l-r)/(n+1)*.7;
  let s2='<svg viewBox="0 0 '+W+' '+H+'" width="100%" class="gfsi-svg">';ok.forEach(q=>{const h=(H-t-bt)*Pm(q)/pmax;s2+='<rect x="'+(X(q.d)-bw/2)+'" y="'+(H-bt-h)+'" width="'+bw+'" height="'+h+'" fill="#4a86c8" opacity=".75"/>'});
  s2+='<path d="'+ok.map((q,i)=>(i?"L":"M")+X(q.d).toFixed(1)+","+YT(Tm(q)).toFixed(1)).join("")+'" fill="none" stroke="#d8452b" stroke-width="2.2"/>';ok.forEach(q=>s2+='<circle cx="'+X(q.d)+'" cy="'+YT(Tm(q))+'" r="2.6" fill="#d8452b"/>');
  s2+='<text x="'+(l-4)+'" y="'+(YT(tmax)+4)+'" font-size="9" text-anchor="end" fill="#d8452b">'+Math.round(tmax)+'°</text><text x="'+(l-4)+'" y="'+(YT(tmin)+3)+'" font-size="9" text-anchor="end" fill="#d8452b">'+Math.round(tmin)+'°</text><text x="'+(W-r+4)+'" y="'+(t+8)+'" font-size="9" fill="#4a86c8">'+Math.round(pmax)+'</text><text x="'+(W-r+4)+'" y="'+(t+18)+'" font-size="8" fill="#4a86c8">mm</text>';
  s2+='<text x="'+l+'" y="'+(H-5)+'" font-size="9" fill="currentColor" opacity=".7">start</text><text x="'+(W-r)+'" y="'+(H-5)+'" font-size="9" text-anchor="end" fill="currentColor" opacity=".7">end</text></svg>';
  const f=ok[0],e=ok[ok.length-1];
  cK.innerHTML=s2+'<p class="gfsi-sum">From <b>'+esc(f.c.kn.toLowerCase())+'</b> ('+Tm(f).toFixed(0)+'°C, '+Math.round(Pm(f)).toLocaleString()+' mm a year) to <b>'+esc(e.c.kn.toLowerCase())+'</b> ('+Tm(e).toFixed(0)+'°C, '+Math.round(Pm(e)).toLocaleString()+' mm).</p>'+
   '<div class="gfsi-chips">'+ok.filter((q,i)=>!i||q.c.k!==ok[i-1].c.k).map(q=>'<span title="'+esc(q.c.kn)+'">'+q.c.k+'</span>').join("<i>→</i>")+'</div><p class="gfsi-note">Red: average temperature. Blue bars: rain in a year. WorldClim 2.1, 1970–2000.</p>'})}

/* ----- a point or a pin ----- */
function point(ll,name,j){const b=shell(name||"This spot",llTxt(ll));
 const cP=sec(b,"📍","The place"),cK=sec(b,"🌡️","Climate"),cS=sec(b,"☀️","Sun and daylight",false),cN=sec(b,"👥","People nearby"),cW=sec(b,"🌿","What’s here",false),cH=sec(b,"🕰️","Through time",false);
 const tz=tzAt(ll),now=new Date();
 setTimeout(()=>{if(!live(j))return;const C=countries(),f=C.at(ll),cc=ctyCode(f),nc=nearestCity(ll);
  let h=row("Coordinates",llTxt(ll))+row("Country",f?esc(ctyName(f)):"none (at sea)")+'<div data-prov></div>';
  if(nc)h+=row("Nearest city",esc(nc.c.n)+' <small>'+kmTxt(nc.km)+' away</small>');
  h+='<div data-el></div>'+row("Time zone",esc(tz.n.replace("UTC","UTC "))+(tz.sea?" <small>(by longitude)</small>":""))+row("Local time now",hm(now.getUTCHours()*60+now.getUTCMinutes(),tz.off)+' <small>standard time</small>');
  cP.innerHTML=h;
  dem().then(()=>{if(!live(j))return;const e=elev(ll);let lf=null;try{lf=gfCrossSection.lfAt(ll,e)}catch(er){}const el=cP.querySelector("[data-el]");if(el)el.innerHTML=row(e<0&&!f?"Sea depth":"Height",e<0&&!f?mTxt(-e):mTxt(e)+(e<0?" (below sea level)":""))+(lf&&lf.n?row(lf.k==="sea"?"Sea":lf.k==="lake"?"Lake":"Landform",esc(lf.n)):"")});
  try{const L=gfProvinces.LIST.find(x=>x[0]===cc);if(L)gfProvinces.load(cc).then(d=>{if(!live(j))return;const it=d.items.find(x=>{try{return d3.geoContains({type:"Feature",geometry:x.g},ll)}catch(e){return false}});const el=cP.querySelector("[data-prov]");if(it&&el)el.innerHTML=row(L[2]?L[2].replace(/^\w/,c=>c.toUpperCase()):"Region",esc(it.n))}).catch(()=>{})}catch(e){}
  /* what is here */
  const B=biomes().at(ll);let hw=row("Biome",B?esc(B.n):(f?"—":"open sea"));
  const PL=OV().plateLabels||[];let pl=null,pd=1e9;PL.forEach(q=>{const d=hav(q.ll,ll);if(d<pd){pd=d;pl=q}});
  let bd=1e9,bn=null;(OV().plates||[]).forEach(z=>(z.coordinates||[]).forEach(ls=>ls.forEach(q=>{const d=hav(q,ll);if(d<bd){bd=d;bn=z.n}})));
  const V=((window.GF_LAYER_DATA||{}).hazards||{}).volcanoes||[];let vn=null,vd=1e9;V.forEach(v=>{const d=hav(v.ll,ll);if(d<vd){vd=d;vn=v}});
  let pn=null;try{pn=plates().at(ll)}catch(e){}if(pn||pl)hw+=row("Tectonic plate",esc(pn||pl.n)+(pn?"":' <small>(the plate named nearest)</small>'));if(bn)hw+=row("Nearest plate boundary",kmTxt(bd*KM));if(vn)hw+=row("Nearest volcano",esc(vn.n)+' <small>'+kmTxt(vd*KM)+'</small>');
  hw+='<div data-eco></div>';cW.innerHTML=hw;
  ecoLoad().then(F=>{if(!live(j))return;const e=ecoAt(F,ll),el=cW.querySelector("[data-eco]");if(e&&el)el.innerHTML=row("Ecoregion",esc(e.n))})},30);
 clim().then(()=>{if(!live(j))return;const c=climAt(ll);if(!c){cK.innerHTML="<p>No climate data here (open sea).</p>";return}
  const Ta=c.T.reduce((x,y)=>x+y)/12,Pa=c.P.reduce((x,y)=>x+y);let g="";try{g=gfThermo.graph(c.T,c.P)}catch(e){}
  cK.innerHTML='<p class="gfsi-sum"><b class="gfsi-k">'+c.k+'</b> '+esc(c.kn)+' <small>('+KGROUP[c.k[0]]+')</small></p><div class="gfsi-graph">'+g+'</div>'+row("Average temperature",Ta.toFixed(1)+"°C")+row("Rain and snow in a year",Math.round(Pa).toLocaleString()+" mm")+'<p class="gfsi-note">WorldClim 2.1 (1970–2000); Köppen–Geiger after Peel and others (2007).</p>'});
 {const t=sunTimes(ll,now),dl=dayLenSVG(ll);let h="";
  if(t.polar)h+=row("Today",t.polar==="day"?"the sun does not set (midnight sun)":"the sun does not rise (polar night)");
  else h+=row("Sunrise",hm(t.rise,tz.off))+row("Sunset",hm(t.set,tz.off))+row("Daylight today",Math.floor(t.len)+" h "+Math.round((t.len%1)*60)+" min");
  const noonEl=90-Math.abs(ll[1]-t.de/RAD);h+=row("Sun at midday",Math.max(0,noonEl).toFixed(0)+"° above the horizon");
  cS.innerHTML=h+'<p class="gfsi-cap">The sun’s height across today <small>(yellow; dashed: 21 June and 21 December)</small></p>'+sunPathSVG(ll,now)+'<p class="gfsi-cap">Hours of daylight through the year <small>('+dl.mn.toFixed(1)+' to '+dl.mx.toFixed(1)+' h)</small></p>'+dl.svg+'<p class="gfsi-note">Times are in standard time for the zone.</p>'}
 pop().then(()=>{if(!live(j))return;const out=[10,50,100].map(km=>{const r=d3.geoCircle().center(ll).radius(km/KM/RAD).precision(2)().coordinates[0];const c=gfPopCount.count([r]);return{km,n:c?c.tot:0}});
  const dens=out[0].n/(Math.PI*100);
  cN.innerHTML=out.map(o=>row("Within "+o.km+" km",fmtPpl(o.n)+" people")).join("")+row("Density near here",(dens>=10?Math.round(dens).toLocaleString():dens.toFixed(1))+" people per km²")+'<button type="button" class="gfsi-btn">Draw these rings on the map</button><p class="gfsi-note">GHS-POP 2025 over 0.1° cells (about 11 km), so the 10 km ring is rough.</p>';
  cN.querySelector("button").onclick=()=>{const tk=T();if(!tk.ringAt)return;const k0=tk.GEO.km;[10,50,100].forEach((km,i)=>{tk.GEO.km=km;const o=tk.ringAt(ll.slice());o.g={m:"ring",A:ll.slice(),km};o.fo=0;o.c=["#c8281c","#e8762a","#2a3f8f"][i];o.tx=fmtPpl(out[i].n);tk.keep(o)});tk.GEO.km=k0}}).catch(()=>{cN.innerHTML="<p>Population data did not load.</p>"});
 /* through time: who held this spot (OpenHistoricalMap), and where it was on the globe in deep time (PALEOMAP) */
 cH.innerHTML='<div data-hist><p class="gfsi-wait">Looking through the history maps…</p></div><div data-deep></div>';
 const H2=window.GF_HIST2;const YEARS=[1914,1800,1600,1400,1200,1000,500,100,-500,-1500];
 if(H2&&H2.featsAt){Promise.all(YEARS.map(y=>Promise.resolve(H2.featsAt(y)).then(F=>{const f=(F||[]).find(f=>{try{return f.properties.k!==0&&d3.geoContains(f,ll)}catch(e){return false}});return{y,n:f?f.properties.n:null}}).catch(()=>({y,n:null})))).then(R=>{if(!live(j))return;const el=cH.querySelector("[data-hist]");if(!el)return;
   const yr=y=>y<0?(-y)+" BC":y<1000?"AD "+y:String(y);const L=[];R.forEach(r=>{const l=L[L.length-1];if(l&&l.n===r.n)l.y0=r.y;else L.push({n:r.n,y1:r.y,y0:r.y})});
   el.innerHTML='<p class="gfsi-cap">Who held it</p><ul class="gfsi-ul">'+L.map(r=>'<li><b>'+(r.y0===r.y1?yr(r.y1):yr(r.y0)+"–"+yr(r.y1))+'</b> '+(r.n?esc(r.n):"<i>no state on the map</i>")+'</li>').join("")+'</ul><p class="gfsi-note">OpenHistoricalMap borders on the History map.</p>'})}
 else{const el=cH.querySelector("[data-hist]");if(el)el.innerHTML=""}
 try{const D=window.gfDrift;if(D&&D.load)Promise.resolve(D.load()).then(()=>{if(!live(j))return;const el=cH.querySelector("[data-deep]");if(!el)return;const AG=[100,200,300,500];
   const R=AG.map(t=>({t,q:D.placeAt(ll[0],ll[1],t)}));const r3=R.find(r=>r.t===300);let fact="";
   if(r3&&r3.q){const la=r3.q[1];fact='About 300 million years ago this spot sat at <b>'+latTxt(la)+'</b>'+(Math.abs(la)<15?", near the equator":Math.abs(la)>60?", near a pole":Math.abs(la)<35?", in the tropics or subtropics":"")+(Math.abs(la-ll[1])>20?' (today '+latTxt(ll[1])+')':"")+'.'}
   el.innerHTML='<p class="gfsi-cap">Deep time</p>'+(fact?'<p class="gfsi-sum">'+fact+'</p>':"")+'<ul class="gfsi-ul">'+R.map(r=>'<li><b>'+r.t+' million years ago</b> '+(r.q?latTxt(r.q[1])+", "+Math.abs(r.q[0]).toFixed(0)+"°"+(r.q[0]>=0?"E":"W"):"<i>this land did not exist yet</i>")+'</li>').join("")+'</ul><p class="gfsi-note">PALEOMAP plate rotations (Scotese and Wright 2018).</p>'}).catch(()=>{})}catch(e){}}

window.gfShapeInfo={open,close,plateAt:ll=>plates().at(ll)};
addEventListener("keydown",e=>{if(e.key==="Escape"&&card&&!(e.target.closest&&e.target.closest("input,textarea")))close()});
{const st=document.createElement("style");st.textContent=`.gfsi{position:fixed;right:18px;top:96px;z-index:9000;width:min(360px,calc(100vw - 24px));height:min(380px,calc(100vh - 120px));max-height:calc(100vh - 20px);display:flex;flex-direction:column;background:rgba(255,251,243,.98);color:#2b2118;border-radius:16px;box-shadow:0 14px 40px rgba(0,0,0,.35);font:13px system-ui;overflow:hidden}
.gfsi-grip{flex:0 0 12px;cursor:ns-resize;position:relative}.gfsi-grip::after{content:"";position:absolute;left:50%;top:4px;width:40px;height:4px;margin-left:-20px;border-radius:2px;background:currentColor;opacity:.25}.gfsi-grip:hover::after{opacity:.5}
.gfsi-h{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;padding:12px 14px 8px;cursor:move;border-bottom:1px solid rgba(0,0,0,.08)}.gfsi-h b{display:block;font-size:15px}.gfsi-h small{opacity:.7;font-weight:600}.gfsi-x{border:0;background:rgba(0,0,0,.07);width:28px;height:28px;border-radius:50%;font-size:18px;line-height:1;cursor:pointer;color:inherit;padding:0;margin:0;min-height:0;box-shadow:none}
.gfsi-b{flex:1 1 auto;min-height:0;overflow:auto;padding:4px 12px 12px}.gfsi-s{border-bottom:1px solid rgba(0,0,0,.07);padding:4px 0}.gfsi-s summary{cursor:pointer;font-weight:800;padding:6px 0;list-style:none;display:flex;align-items:center;gap:7px}.gfsi-s summary::-webkit-details-marker{display:none}.gfsi-s summary::after{content:"▾";margin-left:auto;opacity:.5}.gfsi-s:not([open]) summary::after{content:"▸"}.gfsi-s summary i{font-style:normal}
.gfsi-c{padding:0 0 6px}.gfsi-r{display:flex;justify-content:space-between;gap:10px;padding:3px 0;border-bottom:1px dashed rgba(0,0,0,.06)}.gfsi-r span{opacity:.75}.gfsi-r b{text-align:right;font-weight:700}.gfsi-r small{font-weight:500;opacity:.7}
.gfsi-note{font-size:11px;opacity:.65;margin:5px 0 0}.gfsi-wait{opacity:.6;font-style:italic;margin:2px 0}.gfsi-sum{margin:4px 0 6px}.gfsi-cap{margin:8px 0 2px;font-weight:700;font-size:12px}.gfsi-cap small{font-weight:500;opacity:.7}
.gfsi-bars{display:flex;flex-direction:column;gap:3px}.gfsi-bar{display:grid;grid-template-columns:minmax(0,1.3fr) 1fr 38px;align-items:center;gap:6px}.gfsi-bar span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.gfsi-bar i{height:8px;border-radius:4px;background:rgba(0,0,0,.08);overflow:hidden}.gfsi-bar em{display:block;height:100%;border-radius:4px}.gfsi-bar b{text-align:right;font-size:12px}
.gfsi-btn{margin:8px 0 0;border:1px solid #2f6fb0;background:#2f6fb0;color:#fff;border-radius:999px;padding:5px 12px;font:700 12px system-ui;cursor:pointer;min-height:0;box-shadow:none}
.gfsi-tabs{display:flex;gap:4px;margin:2px 0 6px;align-items:center;flex-wrap:wrap}.gfsi-ctl{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:2px 0 6px;font-size:12px}.gfsi-ctl select{font:inherit;border-radius:8px;padding:2px 6px}.gfsi-sea{display:inline-flex;gap:4px;align-items:center;font-size:12px;margin-left:auto;cursor:pointer}.gfsi-tabs button{border:1px solid rgba(0,0,0,.15);background:none;color:inherit;border-radius:999px;padding:3px 10px;font:700 11.5px system-ui;cursor:pointer;margin:0;min-height:0;box-shadow:none}.gfsi-tabs button.on{background:#2f6fb0;border-color:#2f6fb0;color:#fff}
.gfsi-ol{margin:0;padding-left:20px}.gfsi-ol li{padding:2px 0}.gfsi-ol li span{display:inline-block;min-width:60%}.gfsi-ol li b{float:right}.gfsi-ol li.sea{opacity:.6}.gfsi-ul{margin:2px 0;padding-left:16px}.gfsi-ul li{padding:2px 0}
.gfsi-k{display:inline-block;background:#2f6fb0;color:#fff;border-radius:6px;padding:1px 6px;margin-right:4px}.gfsi-graph svg{width:100%;height:auto}.gfsi-svg{display:block;margin:2px 0}
.gfsi-chips{display:flex;flex-wrap:wrap;align-items:center;gap:3px;margin:4px 0}.gfsi-chips span{background:rgba(0,0,0,.07);border-radius:5px;padding:1px 5px;font-weight:700;font-size:11px}.gfsi-chips i{font-style:normal;opacity:.5;font-size:10px}
body.dark-theme .gfsi,body.sky-night .gfsi{background:rgba(27,34,52,.98);color:#e6edf7}body.dark-theme .gfsi-x,body.sky-night .gfsi-x{background:rgba(255,255,255,.1)}body.dark-theme .gfsi-bar i,body.sky-night .gfsi-bar i,body.dark-theme .gfsi-chips span,body.sky-night .gfsi-chips span{background:rgba(255,255,255,.1)}body.dark-theme .gfsi-s,body.sky-night .gfsi-s,body.dark-theme .gfsi-h,body.sky-night .gfsi-h{border-color:rgba(255,255,255,.1)}body.dark-theme .gfsi-r,body.sky-night .gfsi-r{border-color:rgba(255,255,255,.07)}body.dark-theme .gfsi-tabs button,body.sky-night .gfsi-tabs button{border-color:rgba(255,255,255,.2)}`;document.head.appendChild(st)}
})();
