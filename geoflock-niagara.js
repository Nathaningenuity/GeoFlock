/* GeoFlock: a simulation for the Rivers tour stop "The waterfall that walks backwards" (Niagara Falls).
   The card gets a "Years ago" slider (12,500 years ago → today → 10,000 years ahead, the future part labelled as a
   projection). As it moves, the falls (a bright bar across the river) slide along the real Niagara Gorge, from the
   Niagara Escarpment at Queenston–Lewiston to today's Horseshoe Falls: behind the falls the gorge shows as cut rock (a
   dark band with the river in its floor), ahead of them the river still runs on top of the plateau (a blue line).
   A "Zoom to the gorge" button frames the gorge (about 79.12–79.00°W, 43.05–43.17°N); the stop's own view is not changed,
   and its pins, labels and dashed line stay as they are (this file only adds).
   Drawn on the Maps globe and on the flat map (both draw tours through psGlobeDraw), under the stop's own pins and lines.

   Figures (sources):
   - About 11 km of gorge cut in about 12,500 years: an average of roughly 0.9 m a year (Niagara Parks Commission;
     Tinkler, Pengelly, Parkins & Terasmae 1994, "Postglacial recession of Niagara Falls in relation to the Great Lakes",
     Quaternary Research 42). The real pace was uneven: for thousands of years the upper Great Lakes drained another way
     and the river carried much less water. The slider maps time to distance linearly, which the card says.
   - Before the water was diverted for hydropower, the Horseshoe Falls retreated about 1–1.5 m a year (surveys of
     1842–1905; Philbrick 1974, "Horseshoe Falls recession", and the International Joint Commission's 1953 report).
   - Since the 1950 Niagara Treaty diversion and the remedial works of the 1950s, about 0.3 m a year or less (Niagara
     Parks Commission; US Army Corps of Engineers). The projection uses 0.3 m a year.
   - The falls are about 32 km from Lake Erie: about 30,000 years at the old rate of about 1 m a year, and over 100,000
     years at 0.3 m a year (simple division; geologists expect the falls to change form long before then).
   - Gorge centreline: Lewiston–Queenston Bridge, the power stations, Devil's Hole and the Niagara Glen, the Whirlpool
     bend (about 43.119°N, 79.069°W), the Whirlpool Rapids, the Whirlpool Rapids and Rainbow bridges, the Maid of the
     Mist pool and the Horseshoe Falls (43.0786°N, 79.0756°W); then the upper river through the rapids towards Chippawa.
   Patch pattern as in geoflock-dngtour.js: runs after window load + 1.5 s, re-runs at +1.5, +5 and +12 s, guarded. */
(function(){
const TOUR="rivers",TITLE="The waterfall that walks backwards";
const PAST=12500,FUT=10000,GORGE_KM=11,NOW_RATE=0.3/1000;/* km a year in the projection */
const BOX=[-79.115,43.055,-78.995,43.168];/* a little inside the 79.15–78.95°W, 43.03–43.20°N frame, so the gorge is larger */
const ZCAP_GLOBE=600;/* the globe's GL picture is safe this close; the flat map goes further */
/* [lon,lat] from the escarpment (where the falls began) upstream to today's Horseshoe Falls */
const GORGE=[[-79.0458,43.1575],[-79.0443,43.1530],[-79.0438,43.1460],[-79.0462,43.1395],[-79.0508,43.1343],[-79.0562,43.1293],
 [-79.0608,43.1252],[-79.0655,43.1226],[-79.0690,43.1193],[-79.0668,43.1160],[-79.0618,43.1128],[-79.0592,43.1090],
 [-79.0612,43.1030],[-79.0643,43.0965],[-79.0676,43.0905],[-79.0722,43.0842],[-79.0748,43.0806],[-79.0756,43.0786]];
/* the river above the falls: through the rapids towards Chippawa and Navy Island */
const UPPER=[[-79.0756,43.0786],[-79.0712,43.0748],[-79.0640,43.0708],[-79.0565,43.0668],[-79.0480,43.0632],[-79.0370,43.0625],[-79.0250,43.0640]];
/* the river below the escarpment, towards Lake Ontario */
const LOWER=[[-79.0458,43.1575],[-79.0490,43.1660],[-79.0505,43.1760],[-79.0520,43.1880],[-79.0540,43.2050]];

const def=(o,k,v)=>{try{Object.defineProperty(o,k,{configurable:true,enumerable:true,writable:true,value:v})}catch(e){try{o[k]=v}catch(x){}}};
const clean=s=>String(s==null?"":s).replace(/​/g,"").trim();
const tourOn=()=>typeof ps!=="undefined"&&!!ps;
const curStop=()=>{try{return tourOn()?psSteps()[ps.i]:null}catch(e){return null}};
const ours=S=>!!S&&clean(S.title)===TITLE;
const active=()=>{try{return tourOn()&&ps.tour===TOUR&&ours(curStop())}catch(e){return false}};
const fmt=n=>Math.round(n).toLocaleString("en-GB");
function req(){try{if(tourOn()&&ps.g)ps.g.request?ps.g.request():ps.g.render()}catch(e){}}

/* ---------------------------------------------------------------- geometry */
const R=Math.PI/180;
const km=(a,b)=>{const dl=(b[1]-a[1])*R,dn=(b[0]-a[0])*R,h=Math.sin(dl/2)**2+Math.cos(a[1]*R)*Math.cos(b[1]*R)*Math.sin(dn/2)**2;return 12742*Math.asin(Math.sqrt(h))};
const ROUTE=GORGE.concat(UPPER.slice(1)),CUM=[0];for(let i=1;i<ROUTE.length;i++)CUM.push(CUM[i-1]+km(ROUTE[i-1],ROUTE[i]));
const LG=CUM[GORGE.length-1];/* length of the drawn gorge, km */
/* split the route at s km from the escarpment: [behind, ahead, point, direction] */
function split(s){s=Math.max(0,Math.min(CUM[CUM.length-1],s));let i=1;while(i<CUM.length-1&&CUM[i]<s)i++;
 const a=ROUTE[i-1],b=ROUTE[i],f=(s-CUM[i-1])/Math.max(1e-9,CUM[i]-CUM[i-1]),pt=[a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f];
 return{behind:ROUTE.slice(0,i).concat([pt]),ahead:[pt].concat(ROUTE.slice(i)),pt,a,b}}
/* where the falls are at year t (negative = years ago, positive = years ahead) */
function stateAt(t){if(t<=0){const f=(PAST+t)/PAST;return{s:f*LG,kmTxt:f*GORGE_KM,future:false}}
 const d=t*NOW_RATE;return{s:LG+d,kmAhead:d,future:true}}

/* ---------------------------------------------------------------- state */
const SIM={t:0,key:null,zoomed:false};

/* ---------------------------------------------------------------- drawing */
function draw(ctx,p,gv){if(!active()||!gv||gv!==ps.g)return;
 const st=stateAt(SIM.t),sp=split(st.s),path=d3.geoPath(p,ctx);
 /* pixels per km here */
 let pk=1;try{const c=[-79.06,43.12],q0=p(c),q1=p([c[0],c[1]+1/111.2]);if(q0&&q1)pk=Math.hypot(q1[0]-q0[0],q1[1]-q0[1])}catch(e){}
 const W=(k,lo,hi)=>Math.max(lo,Math.min(hi,k*pk));
 const ln=(coords,col,w,dash)=>{ctx.beginPath();path({type:"LineString",coordinates:coords});ctx.strokeStyle=col;ctx.lineWidth=w;ctx.setLineDash(dash||[]);ctx.stroke()};
 ctx.save();ctx.lineCap="round";ctx.lineJoin="round";
 const rw=W(.16,1.6,7);/* the river */
 /* the river below the escarpment and above the falls: blue water on the land */
 ln(LOWER,"rgba(255,255,255,.75)",rw+2.2);ln(LOWER,"#2f7fd0",rw);
 ln(sp.ahead,"rgba(255,255,255,.8)",rw+2.4);ln(sp.ahead,"#2f7fd0",rw);
 /* behind the falls: the gorge as cut rock, with the river in its floor */
 if(sp.behind.length>1&&st.s>0.01){const gw=W(.42,4,20);
  ln(sp.behind,"rgba(255,255,255,.7)",gw+2.5);ln(sp.behind,"#4a3a2e",gw);ln(sp.behind,"#6b5646",Math.max(2,gw*.55));ln(sp.behind,"#3a8ad6",Math.max(1.3,rw*.75))}
 /* the falls: a bright bar across the river */
 let q=null;try{const vis=!gv._flat?d3.geoDistance(sp.pt,[-gv.rot[0],-gv.rot[1]])<Math.PI/2-.01:true;if(vis)q=p(sp.pt)}catch(e){}
 if(q){let qa=null,qb=null;try{qa=p(sp.a);qb=p(sp.b)}catch(e){}
  let dx=1,dy=0;if(qa&&qb){dx=qb[0]-qa[0];dy=qb[1]-qa[1];const n=Math.hypot(dx,dy)||1;dx/=n;dy/=n}
  const L=W(.55,8,26)/2,nx=-dy,ny=dx;
  const g=ctx.createRadialGradient(q[0],q[1],0,q[0],q[1],L*1.8);g.addColorStop(0,"rgba(190,235,255,.85)");g.addColorStop(1,"rgba(190,235,255,0)");
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(q[0],q[1],L*1.8,0,7);ctx.fill();
  ctx.setLineDash([]);ctx.beginPath();ctx.moveTo(q[0]-nx*L,q[1]-ny*L);ctx.lineTo(q[0]+nx*L,q[1]+ny*L);
  ctx.strokeStyle="#0b4f8a";ctx.lineWidth=W(.12,5,9)+2.5;ctx.stroke();ctx.strokeStyle="#ffffff";ctx.lineWidth=W(.12,5,9);ctx.stroke()}
 ctx.restore()}

/* ---------------------------------------------------------------- the card */
function readout(t){return t===0?["Years ago","today"]:t<0?["Years ago",fmt(-t)]:["Years ahead",fmt(t)+" · projection"]}
function note(t){const st=stateAt(t);
 if(t===0)return"Travelled: about 11 km. Before the big 1950s diversion of water for hydropower the falls retreated about 1–1.5 m a year; now about 0.3 m a year or less.";
 if(t<0)return st.s<0.01?"The falls pour over the Niagara Escarpment at Queenston–Lewiston.":"Travelled: about "+st.kmTxt.toFixed(1)+" km from the escarpment (at a steady 0.9 m a year; the real pace varied).";
 const d=st.kmAhead,dt=d<1?fmt(Math.round(d*100)*10)+" m":d.toFixed(1)+" km";
 return"Projection at today’s 0.3 m a year: about "+dt+" beyond today’s falls. Lake Erie, about 32 km upstream, is roughly 30,000 years away at the old 1 m a year, over 100,000 at today’s.";}
function blockHTML(){const z=PAST/(PAST+FUT)*100;
 return'<div class="gf-nia" role="group" aria-label="Niagara Falls through time">'+
 '<div class="gf-nia-h"><span><span class="gf-nia-l">Years ago</span> <b class="gf-nia-v"></b></span><button type="button" class="gf-nia-reset" hidden>Reset to today</button></div>'+
 '<input type="range" class="gf-nia-r" min="'+(-PAST)+'" max="'+FUT+'" step="100" value="0" aria-label="Years ago (left) to years ahead (right)">'+
 '<div class="gf-nia-ticks"><span style="left:0">12,500 years ago</span><span style="left:'+z.toFixed(1)+'%;transform:translateX(-50%)">today</span><span style="right:0">+10,000 · projection</span></div>'+
 '<small class="gf-nia-n" aria-live="polite"></small>'+
 '<div class="gf-nia-key"><span><i class="k-f"></i>the falls</span><span><i class="k-g"></i>gorge cut so far</span><span><i class="k-r"></i>river on the plateau</span></div>'+
 '<button type="button" class="gf-nia-zoom">Zoom to the gorge</button></div>'}
function sync(box){if(!box)return;const t=SIM.t,r=box.querySelector(".gf-nia-r"),v=box.querySelector(".gf-nia-v"),n=box.querySelector(".gf-nia-n"),rs=box.querySelector(".gf-nia-reset"),z=box.querySelector(".gf-nia-zoom");
 if(r&&+r.value!==t&&document.activeElement!==r)r.value=t;
 const [lt,txt]=readout(t),l=box.querySelector(".gf-nia-l");if(l&&l.textContent!==lt)l.textContent=lt;if(v&&v.textContent!==txt)v.textContent=txt;
 box.classList.toggle("gf-nia-fut",t>0);
 const nt=note(t);if(n&&n.textContent!==nt)n.textContent=nt;if(rs)rs.hidden=t===0;
 if(z){const zt=SIM.zoomed?"Back to the stop’s view":"Zoom to the gorge";if(z.textContent!==zt)z.textContent=zt;z.hidden=!(tourOn()&&ps.mode==="globe"&&ps.g)}}
function ensure(){const card=tourOn()&&ps.card;if(!card)return;let box=card.querySelector(".gf-nia");
 if(!active()){if(box)box.remove();if(SIM.key){SIM.key=null;SIM.t=0;SIM.zoomed=false}return}
 const key=ps.tour+"|"+ps.i;if(SIM.key!==key){SIM.key=key;SIM.t=0;SIM.zoomed=false}
 if(!box){const w=document.createElement("div");w.innerHTML=blockHTML();box=w.firstChild;
  const at=card.querySelector(".ps-body")||card.querySelector(".ps-stat");if(at)at.after(box);else card.appendChild(box);
  const r=box.querySelector(".gf-nia-r");
  r.addEventListener("input",()=>{SIM.t=+r.value;sync(box);req()});
  box.querySelector(".gf-nia-reset").addEventListener("click",()=>{SIM.t=0;r.value=0;sync(box);req()});
  box.querySelector(".gf-nia-zoom").addEventListener("click",()=>{try{if(SIM.zoomed){SIM.zoomed=false;if(typeof psFlyGlobe==="function")psFlyGlobe()}else{SIM.zoomed=true;fly(BOX)}}catch(e){console.error(e)}sync(box)});
  /* keep the map's own gestures off the slider */
  ["pointerdown","mousedown","touchstart","wheel"].forEach(ev=>box.addEventListener(ev,e=>e.stopPropagation(),{passive:true}))}
 sync(box)}

/* ---------------------------------------------------------------- framing the gorge */
/* the part of the map that shows (inside the window and, on the globe, inside its disc) and is not under the card,
   in the canvas's own pixels */
function freeRect(g){const sz=g.size(),el=g.canvas||g.stage||g.host,A=el.getBoundingClientRect();
 let x0=Math.max(0,-A.left),y0=Math.max(0,-A.top),x1=Math.min(sz.w,innerWidth-A.left),y1=Math.min(sz.h,innerHeight-A.top);
 if(!g._flat&&sz.r){const cx=sz.w/2,cy=sz.h/2,k=sz.r*.94;x0=Math.max(x0,cx-k);x1=Math.min(x1,cx+k);y0=Math.max(y0,cy-k);y1=Math.min(y1,cy+k)}
 try{const card=ps.card;if(card&&card.offsetParent!==null){const c=card.getBoundingClientRect();
  if(!(c.right<=A.left+x0||c.left>=A.left+x1||c.bottom<=A.top+y0||c.top>=A.top+y1)){
   if(c.left+c.width/2<A.left+(x0+x1)/2)x0=Math.max(x0,c.right-A.left+12);else x1=Math.min(x1,c.left-A.left-12)}}}catch(e){}
 if(x1-x0<160){x0=0;x1=sz.w}if(y1-y0<160){y0=0;y1=sz.h}
 return{x0,y0,x1,y1,w:sz.w,h:sz.h}}
function fly(box){if(!tourOn()||ps.mode!=="globe"||!ps.g)return;const g=ps.g;
 const c=[(box[0]+box[2])/2,(box[1]+box[3])/2];
 const z0=g.zoom,r0=g.rot.slice();let zT=z0,to=c;
 try{const F=freeRect(g);g.rot=[-c[0],-c[1]];const pr=g.projection(),pts=[[box[0],box[1]],[box[2],box[1]],[box[0],box[3]],[box[2],box[3]]].map(x=>pr(x)).filter(Boolean);
  const xs=pts.map(q=>q[0]),ys=pts.map(q=>q[1]),bw=Math.max(...xs)-Math.min(...xs),bh=Math.max(...ys)-Math.min(...ys);
  zT=Math.max(1,Math.min(g._flat?6000:ZCAP_GLOBE,z0*Math.min((F.x1-F.x0)*.92/bw,(F.y1-F.y0)*.9/bh)));
  /* put the box in the middle of that free part */
  const q=pr(c),f=zT/z0,dx=(F.x0+F.x1)/2-q[0],dy=(F.y0+F.y1)/2-q[1];
  to=[c[0]-dx/(bw*f/(box[2]-box[0])),c[1]+dy/(bh*f/(box[3]-box[1]))]}
 catch(e){console.error(e)}finally{g.rot=r0;g.zoom=z0}
 const from=[-r0[0],-r0[1]],ms=matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches?0:1100,t0=performance.now();
 const fid=g._flyId=(g._flyId||0)+1;g._flying=true;
 const step=t=>{if(g._flyId!==fid||!tourOn()||ps.g!==g)return;const k=ms?Math.min(1,(t-t0)/ms):1,e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
  g.zoom=z0*Math.pow(zT/z0,e);g.rot=[-(from[0]+(to[0]-from[0])*e),-(from[1]+(to[1]-from[1])*e)];g.render();
  if(k<1)requestAnimationFrame(step);else{g._flying=false;g._flyId++}};
 requestAnimationFrame(step)}

/* ---------------------------------------------------------------- hooks */
let hooked=false,timer=null;
function hook(){if(hooked||typeof psGlobeDraw!=="function"||typeof psGo!=="function"||typeof d3==="undefined")return;hooked=true;
 {const _d=psGlobeDraw;psGlobeDraw=function(ctx,p,gv){try{draw(ctx,p,gv)}catch(e){console.error("niagara",e)}return _d.apply(this,arguments)}}
 {const _g=psGo;psGo=function(){const r=_g.apply(this,arguments);try{ensure()}catch(e){console.error(e)}return r}}
 if(typeof psEnd==="function"){const _e=psEnd;psEnd=function(){const r=_e.apply(this,arguments);try{if(!tourOn()){SIM.key=null;SIM.t=0;SIM.zoomed=false}}catch(e){}return r}}
 timer=setInterval(()=>{try{if(tourOn())ensure();else if(SIM.key){SIM.key=null;SIM.t=0;SIM.zoomed=false}}catch(e){}},300);
 /* on the globe, wheel and pinch zoom stay close to the gorge after "Zoom to the gorge" (the globe's own limit is 16) */
 if(typeof GlobeView!=="undefined"&&GlobeView.prototype.setZoom){const _z=GlobeView.prototype.setZoom;GlobeView.prototype.setZoom=function(z,at){
  try{if(isFinite(z)&&!this._flat&&this.zoom>16&&z>16&&active()&&this===ps.g){const nz=Math.min(ZCAP_GLOBE,z);
   if(at){const rc=this.canvas.getBoundingClientRect(),pt=[at[0]-rc.left,at[1]-rc.top],b0=this.projection().invert(pt);this.zoom=nz;const b1=this.projection().invert(pt);
    if(b0&&b1&&isFinite(b0[0])&&isFinite(b1[0]))this.rot=[this.rot[0]+(b1[0]-b0[0]),Math.max(-90,Math.min(90,this.rot[1]+(b1[1]-b0[1])))]}else this.zoom=nz;
   this.request?this.request():this.render();return}}catch(e){console.error(e)}
  return _z.apply(this,arguments)}}
 const css=document.createElement("style");css.textContent=`
.ps-card .gf-nia{ margin:6px 0 10px; padding:8px 10px 8px; border-radius:10px; background:rgba(120,170,230,0.12); }
.ps-card .gf-nia-h{ display:flex; justify-content:space-between; align-items:center; gap:8px; font-size:12.5px; }
.ps-card .gf-nia-h b{ color:#1d5f9a; }
.ps-card .gf-nia.gf-nia-fut .gf-nia-h b{ color:#a3561a; }
body.sky-night .ps-card .gf-nia-h b{ color:#9cc9f5; }
.ps-card .gf-nia-reset, .ps-card .gf-nia-zoom{ border:1px solid rgba(29,95,154,.35); background:#fff; color:#1d5f9a; border-radius:999px; font-size:11px; font-weight:700; padding:2px 9px; cursor:pointer; white-space:nowrap; }
.ps-card .gf-nia-reset:hover, .ps-card .gf-nia-zoom:hover{ background:#1d5f9a; color:#fff; }
.ps-card .gf-nia-zoom{ margin-top:6px; font-size:12px; padding:3px 11px; }
.ps-card .gf-nia-r{ width:100%; margin:4px 0 0; accent-color:#e8701a; cursor:pointer; }
.ps-card .gf-nia-ticks{ position:relative; height:13px; font-size:9.5px; opacity:.65; }
.ps-card .gf-nia-ticks span{ position:absolute; top:0; white-space:nowrap; }
.ps-card .gf-nia-n{ display:block; font-size:11.5px; line-height:1.35; opacity:.85; margin-top:4px; }
.ps-card .gf-nia-key{ display:flex; flex-wrap:wrap; gap:4px 12px; font-size:11px; opacity:.85; margin-top:5px; }
.ps-card .gf-nia-key i{ display:inline-block; width:16px; height:5px; border-radius:3px; margin-right:5px; vertical-align:middle; }
.ps-card .gf-nia-key .k-f{ background:#fff; box-shadow:0 0 0 1.5px #0b4f8a; height:4px; }
.ps-card .gf-nia-key .k-g{ background:#4a3a2e; height:7px; }
.ps-card .gf-nia-key .k-r{ background:#2f7fd0; height:3px; }`;
 document.head.appendChild(css)}

function patch(){try{
 if(typeof PS_TOURS==="undefined"||!PS_TOURS[TOUR])return;
 const S=(PS_TOURS[TOUR].steps||[]).find(ours);if(S&&!S._gfNia)def(S,"_gfNia",1);
 hook();if(tourOn())ensure()}catch(e){console.error("niagara",e)}}
let booted=false;
function boot(){if(booted)return;booted=true;patch();[1500,5000,12000].forEach(ms=>setTimeout(patch,ms))}
if(document.readyState==="complete")setTimeout(boot,1500);else addEventListener("load",()=>setTimeout(boot,1500));
window.gfNiagara={sim:SIM,set(t){SIM.t=Math.max(-PAST,Math.min(FUT,Math.round(t)));try{ensure()}catch(e){}req()},zoom(){SIM.zoomed=true;fly(BOX);try{ensure()}catch(e){}},gorgeKm:LG};
})();
