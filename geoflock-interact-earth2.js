/* GeoFlock: six more nature and physical-geography tour stops you can play with, not just read. Each one puts a layer over
   the Maps globe and a small control block on the card (right after the stop's headline), with a one-line instruction:
   - weather | "The monsoon": a date slider (or Play) runs through the year. Wind streaks over the Indian Ocean blow off the
     cold land in winter and turn round in summer; the monsoon reaches Kerala, Chennai, Mumbai, Delhi and the Thar on its
     normal dates, and the card shows how much of India's rain falls in June to September.
   - ranges | "Rain shadows": drag a rain cloud off the Pacific over the Olympic Mountains and the Cascades. It rains itself
     out on every slope it climbs and dries up as it sinks; rain gauges at the Hoh Rain Forest, Seattle and Ellensburg fill
     as it passes.
   - plates | "Seashells on Everest": drag India (or the slider, or Play) from 80 million years ago to today. It races north
     across the Tethys Sea, its front edge hits Asia, the crust between crumples up into the Himalaya, and a shell from the
     Tethys sea floor ends up on the top of Everest. The card gives India's speed and how far south of today it was.
   - environment | "Coral in hot water": heat a reef on the Great Barrier Reef: how much warmer than its usual hottest
     month, and for how many weeks. The card adds up NOAA's "degree heating weeks" and the coral pales, turns white and dies
     at NOAA's alert levels. Two presets compare a short spike with a long simmer.
   - seas | "Point Nemo": drag a buoy round the South Pacific. A circle round it grows until it touches the nearest land; the
     card keeps the best. Can you find the spot farthest from land? Then see the three pieces of land it is equally far from.
   - hazards | "Tornado Alley": drag the three ingredients onto the Great Plains: warm, wet air from the Gulf of Mexico,
     cold air from Canada and hot, dry air from the deserts. When all three meet, a supercell grows and a tornado spins.
   Same pattern as geoflock-odyssey.js and geoflock-interact-phys.js: a watchdog polls `ps`, matches the stop by tour and
   title, mounts a layer in amGlobe.host drawn with amGlobe.projection(), redraws when the view changes, and removes
   everything (layer, card block, body class, timers) as soon as the stop changes or the tour ends. Globe view only. Next
   and Back are never blocked, and every step is wrapped in try/catch. The CSS classes here start with "ge2-" so they never
   clash with the other interactive files. Sources are named beside each set of figures below. */
(function(){
"use strict";
if(window.gfInteractEarth2)return;
const R_KM=6371,DEG=Math.PI/180;
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=n=>Math.round(n).toLocaleString("en-GB");
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const g=()=>{try{return typeof amGlobe!=="undefined"?amGlobe:null}catch(e){return null}};
const km=(a,b)=>{try{return d3.geoDistance(a,b)*R_KM}catch(e){return 0}};
const NS="http://www.w3.org/2000/svg";

/* ---------------- shared helpers (as in geoflock-interact-phys.js) ---------------- */
/* a lon/lat point → [x,y] in the host's pixels, or null when it is round the back of the globe. `card` true: also null
   under the tour card (for labels and handles). SVG shapes are clipped away from the card by a clip path instead. */
function proj(L,ll,card){const G=g();if(!G||!ll)return null;try{if(!G._flat){const d=d3.geoDistance([-G.rot[0],-G.rot[1]],ll);if(d>Math.PI/2-.02)return null}
 const s=G.projection()(ll);if(!s||!isFinite(s[0]))return null;const x=s[0]+L.ox,y=s[1]+L.oy,B=L.cb;
 if(card&&B&&x>B[0]&&x<B[2]&&y>B[1]&&y<B[3])return null;return[x,y]}catch(e){return null}}
function unproj(L,x,y){const G=g();try{const p=G.projection();if(!p.invert)return null;const ll=p.invert([x-L.ox,y-L.oy]);if(!ll||!isFinite(ll[0]))return null;
 if(!G._flat&&d3.geoDistance([-G.rot[0],-G.rot[1]],ll)>Math.PI/2-.02)return null;return ll}catch(e){return null}}
function pathOf(L,pts,close){let d="",pen=false,px=0,py=0,n=0;const G=g(),J=close?1e9:G&&G.size?G.size().w*.3:1e9;for(const ll of pts){const q=proj(L,ll);if(!q){pen=false;continue}
 if(!pen||Math.abs(q[0]-px)+Math.abs(q[1]-py)>J){d+="M"+q[0].toFixed(1)+" "+q[1].toFixed(1);pen=true}else{d+="L"+q[0].toFixed(1)+" "+q[1].toFixed(1);n++}px=q[0];py=q[1]}
 return close&&n>1?d+"Z":d}
/* a polyline cut into short steps, with the distance in km along it */
function route(C,step){step=step||.15;const P=[];for(let i=0;i<C.length-1;i++){const a=C[i],b=C[i+1],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/step));
  for(let k=0;k<n;k++)P.push([a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n])}P.push(C[C.length-1].slice(0,2));
 const K=[0];for(let i=1;i<P.length;i++)K.push(K[i-1]+km(P[i-1],P[i]));return{P,K,total:K[K.length-1]}}
function at(R,u){const t=clamp(u,0,1)*R.total;let lo=0,hi=R.K.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(R.K[m]<=t)lo=m;else hi=m}
 const f=R.K[hi]>R.K[lo]?(t-R.K[lo])/(R.K[hi]-R.K[lo]):0,a=R.P[lo],b=R.P[hi];return{ll:[a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f],i:lo}}
const uOf=(R,ll)=>{let b=0,bd=1e9;R.P.forEach((p,i)=>{const d=Math.hypot(p[0]-ll[0],p[1]-ll[1]);if(d<bd){bd=d;b=i}});return R.K[b]/R.total};
function nearestU(L,R,px,py,u){const cur=at(R,u).i,W=Math.max(60,R.P.length>>2);let best=-1,bd=1e9;
 for(let i=Math.max(0,cur-W);i<=Math.min(R.P.length-1,cur+W);i++){const q=proj(L,R.P[i]);if(!q)continue;const d=Math.hypot(q[0]-px,q[1]-py)+Math.abs(i-cur)*.05;if(d<bd){bd=d;best=i}}
 return best<0?u:R.K[best]/R.total}
/* drag anything: mv(x,y) in host pixels; the globe does not spin under the finger. Arrow keys nudge L.u on slider stops. */
function draggable(L,el,mv,start,keys){const down=e=>{if(e.button>0)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();try{el.setPointerCapture(e.pointerId)}catch(err){}
  el.classList.add("ge2-dragging");if(start)try{start()}catch(err){}const m=ev=>{ev.stopPropagation();const hr=L.host.getBoundingClientRect();try{mv(ev.clientX-hr.left,ev.clientY-hr.top)}catch(err){}L.dirty=1};
  const up=()=>{el.removeEventListener("pointermove",m);el.removeEventListener("pointerup",up);el.removeEventListener("pointercancel",up);el.classList.remove("ge2-dragging");L.dirty=1};
  el.addEventListener("pointermove",m);el.addEventListener("pointerup",up);el.addEventListener("pointercancel",up)};
 el.addEventListener("keydown",e=>{const k=e.key,f=k==="ArrowRight"||k==="ArrowUp"?1:k==="ArrowLeft"||k==="ArrowDown"?-1:0;if(!f)return;e.preventDefault();
  if(keys){try{keys(f)}catch(err){}}else{stopPlay(L);L.u=clamp(L.u+f*.01,0,1)}L.dirty=1});
 el.addEventListener("pointerdown",down);["mousedown","touchstart","click","dblclick","wheel"].forEach(t=>el.addEventListener(t,e=>e.stopPropagation(),{passive:t!=="mousedown"}))}
function svgEl(parent,tag,attrs,html){const e=document.createElementNS(NS,tag);for(const k in attrs||{})e.setAttribute(k,attrs[k]);if(html!=null)e.innerHTML=html;parent.appendChild(e);return e}
function place(el,q,extra){if(!q){el.style.display="none";return false}el.style.display="";el.setAttribute("transform","translate("+q[0].toFixed(1)+","+q[1].toFixed(1)+")"+(extra||""));return true}
function tag(L,cls){const d=document.createElement("div");d.className="ge2-tag "+(cls||"");L.el.appendChild(d);return d}
function putTag(L,d,q,html,dy){if(!q||html==null){d.style.display="none";return}d.style.display="";if(d._h!==html){d.innerHTML=html;d._h=html}d.style.left=q[0]+"px";d.style.top=(q[1]+(dy||0))+"px";
 let hide=false;try{const B=L.cb;if(B){const r=d.getBoundingClientRect(),h=L.host.getBoundingClientRect(),x0=r.left-h.left,y0=r.top-h.top;hide=!(x0+r.width<B[0]||x0>B[2]||y0+r.height<B[1]||y0>B[3])}}catch(e){}
 d.style.visibility=hide?"hidden":""}
function say(L,head,text){const c=L.card;if(!c)return;const k=head+"|"+text;if(L._said===k)return;L._said=k;const e=c.querySelector(".ge2-ep");if(!e)return;
 e.innerHTML=(head?"<b>"+head+"</b>":"")+"<span>"+text+"</span>";e.classList.remove("ge2-new");void e.offsetWidth;e.classList.add("ge2-new")}
function playerHTML(label,read){return'<div class="ge2-row"><button type="button" class="ge2-play" aria-label="Play">▶</button><input type="range" class="ge2-range" min="0" max="1000" step="1" value="0" aria-label="'+esc(label)+'"><span class="ge2-read">'+esc(read||"")+"</span></div>"}
function playBtn(L){const b=L.card&&L.card.querySelector(".ge2-play");if(b){b.textContent=L.playing?"❚❚":"▶";b.setAttribute("aria-label",L.playing?"Pause":"Play")}}
function wirePlayer(L){const c=L.card,b=c.querySelector(".ge2-play"),r=c.querySelector(".ge2-range");if(!b||!r)return;
 b.onclick=()=>{if(L.u>=1&&!L.D.loop)L.u=0;L.playing=!L.playing;playBtn(L);L.dirty=1};r.addEventListener("input",()=>{L.playing=false;playBtn(L);L.u=r.value/1000;L.dirty=1})}
function syncRange(L,txt){const c=L.card;if(!c)return;const r=c.querySelector(".ge2-range");if(r&&document.activeElement!==r)r.value=Math.round(L.u*1000);const o=c.querySelector(".ge2-read");if(o&&txt!=null&&o.textContent!==txt)o.textContent=txt}
const stopPlay=L=>{if(L.playing){L.playing=false;playBtn(L)}};
function advance(L,dt,dur,loop){if(!L.playing)return;L.u+=dt/dur;if(L.u>=1){if(loop)L.u-=1;else{L.u=1;L.playing=false;playBtn(L)}}L.dirty=1}
/* unit vectors and quaternion turns (for India's drift) */
const vec=ll=>{const lo=ll[0]*DEG,la=ll[1]*DEG;return[Math.cos(la)*Math.cos(lo),Math.cos(la)*Math.sin(lo),Math.sin(la)]};
const toLL=v=>{const n=Math.hypot(v[0],v[1],v[2])||1;return[Math.atan2(v[1],v[0])/DEG,Math.asin(clamp(v[2]/n,-1,1))/DEG]};
function qrot(q,v){const w=q[0],x=q[1],y=q[2],z=q[3],t=[2*(y*v[2]-z*v[1]),2*(z*v[0]-x*v[2]),2*(x*v[1]-y*v[0])];
 return[v[0]+w*t[0]+(y*t[2]-z*t[1]),v[1]+w*t[1]+(z*t[0]-x*t[2]),v[2]+w*t[2]+(x*t[1]-y*t[0])]}
const qconj=q=>[q[0],-q[1],-q[2],-q[3]];

/* ======================================================================== 1. The monsoon
   Normal dates of the monsoon's arrival, India Meteorological Department (IMD), "New normal dates of onset/advance and
   withdrawal of southwest monsoon" (revised 2020): Kerala 1 June, Chennai 4 June, Mumbai 11 June, Delhi 27 June, the
   whole country (the last place is west Rajasthan) 8 July; withdrawal begins from north-west India on 17 September and is
   complete over the whole country by 15 October. Between those two dates this file lets each city's monsoon end by its
   latitude, so the city end dates are only approximate and are not shown as dates.
   Rainfall over all India, IMD long-period averages 1971–2020: June 165.3 mm, July 280.5 mm, August 254.9 mm, September
   167.9 mm (June to September 868.6 mm), of a year's 1,160.1 mm, so about three-quarters falls in those four months (the
   stop's own figure). Chennai's wet season is October to December, from the north-east (winter) monsoon (IMD).
   The wind streaks are a picture of the seasons' prevailing winds (south-west in summer, north-east in winter, the trade
   winds crossing the Equator), not a measured wind field; the strength between seasons is a smooth ramp. */
const MON=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],MDAYS=[31,28,31,30,31,30,31,31,30,31,30,31];
const MSTART=MDAYS.reduce((a,d,i)=>(a.push(i?a[i-1]+MDAYS[i-1]:0),a),[]);
const dayName=d=>{d=Math.floor(clamp(d,0,364.99));let m=0;while(m<11&&d>=MSTART[m+1])m++;return(d-MSTART[m]+1)+" "+MON[m]};
const monthOf=d=>{let m=0;while(m<11&&d>=MSTART[m+1])m++;return m};
const MCITY=[{n:"Kerala",ll:[76.95,8.5],on:151},{n:"Chennai",ll:[80.27,13.08],on:154},{n:"Mumbai",ll:[72.88,19.08],on:161},{n:"Delhi",ll:[77.21,28.61],on:177},{n:"Jaisalmer, Thar Desert",ll:[70.91,26.92],on:188,left:1}];
const M_OFF0=259,M_OFF1=287;/* 17 Sep, 15 Oct */
const mOff=lat=>Math.round(M_OFF0+clamp((26.9-lat)/(26.9-8.5),0,1)*(M_OFF1-M_OFF0));
const MRAIN=[["Jun",165.3],["Jul",280.5],["Aug",254.9],["Sep",167.9],["Other 8 months",291.5]];
/* season: −1 winter (north-east winds), +1 summer (south-west winds) */
function mSeason(d){const r=(a,b,x,y)=>x+(y-x)*clamp((d-a)/(b-a),0,1);if(d<59)return-1;if(d<105)return r(59,105,-1,0);if(d<151)return r(105,151,0,1);if(d<259)return 1;if(d<288)return r(259,288,1,0);if(d<320)return r(288,320,0,-1);return-1}
function mWind(lon,lat,s){let v;if(s>=0){const sw=[.8,.6],tr=[-.55,.83],ne=lon>84&&lat>12?[.3,.95]:sw,k=clamp((lat+3)/7,0,1);v=[tr[0]+(ne[0]-tr[0])*k,tr[1]+(ne[1]-tr[1])*k]}
 else{const k=clamp((lat+2)/6,0,1);v=[-.45+(-.8+.45)*k,-.88+(-.58+.88)*k]}return[v[0]*s,v[1]*s]}
const DROP='<path d="M0 -7 C 4 -2 5 1 5 3 A5 5 0 0 1 -5 3 C -5 1 -4 -2 0 -7 Z" fill="#2f8fe0" stroke="#fff" stroke-width="1.4"/>';
const MONSOON={tour:"weather",title:"The monsoon",dur:30,loop:1,
 tip:"Press ▶ or drag the date through the year. Watch the winds turn round and the rain sweep north across India.",
 card:()=>playerHTML("Day of the year","1 Jan")+'<div class="ge2-bars"></div>',
 init(L){L.u=0;L.g=svgEl(L.clip,"g",{class:"ge2-noev"});L.parts=[];for(let i=0;i<120;i++)L.parts.push(this.spawn(Math.random()*3));
  L.cities=MCITY.map(c=>({c,e:svgEl(L.clip,"g",{class:"ge2-noev"}),t:tag(L,"ge2-small"+(c.left?"":" ge2-right"))}));L.press=tag(L,"ge2-press");L.t=0},
 spawn(age){return{ll:[45+Math.random()*55,-15+Math.random()*45],age:age||0,life:2+Math.random()*2.5}},
 wire(L){this.bars(L)},
 bars(L){const box=L.card&&L.card.querySelector(".ge2-bars");if(!box)return;const m=monthOf(L.u*365),k=m>=5&&m<=8?m-5:4,mx=300;
  const h=MRAIN.map((r,i)=>'<div class="ge2-bar'+(i===k?" ge2-on":"")+(i<4?" ge2-wet":"")+'"><i style="height:'+Math.round(r[1]/mx*56)+'px"></i><b>'+Math.round(r[1])+'</b><span>'+r[0]+"</span></div>").join("");
  const html='<div class="ge2-bartitle">Rain over all India in an average year (mm)</div><div class="ge2-barrow">'+h+'</div><div class="ge2-barnote">June to September: <b>75%</b> of the year’s rain</div>';
  if(box._h!==html){box.innerHTML=html;box._h=html}},
 tick(L,dt){advance(L,dt,this.dur,1);L.t+=dt;const s=mSeason(L.u*365),sp=2.6*Math.abs(s)+.15;
  for(let i=0;i<L.parts.length;i++){const p=L.parts[i];p.age+=dt;const w=mWind(p.ll[0],p.ll[1],s===0?.05:s);p.ll=[p.ll[0]+w[0]*sp*dt*1.6,p.ll[1]+w[1]*sp*dt*1.6];
   if(p.age>p.life||p.ll[0]<42||p.ll[0]>102||p.ll[1]<-17||p.ll[1]>33)L.parts[i]=this.spawn()}
  let h="";const col=s>.15?"#7fd4ff":s<-.15?"#ffc061":"#ffffff";for(const p of L.parts){const w=mWind(p.ll[0],p.ll[1],s>=0?1:-1),a=proj(L,p.ll),b=proj(L,[p.ll[0]-w[0]*2.4,p.ll[1]-w[1]*2.4]);if(!a||!b)continue;
   const o=Math.min(1,p.age*2,(p.life-p.age)*2)*(.35+.65*Math.abs(s));const dd="M"+b[0].toFixed(1)+" "+b[1].toFixed(1)+"L"+a[0].toFixed(1)+" "+a[1].toFixed(1);h+='<path class="ge2-sh" d="'+dd+'" opacity="'+o.toFixed(2)+'"/><path d="'+dd+'" stroke="'+col+'" opacity="'+o.toFixed(2)+'"/><circle cx="'+a[0].toFixed(1)+'" cy="'+a[1].toFixed(1)+'" r="2.2" fill="'+col+'" opacity="'+o.toFixed(2)+'"/>'}
  L.g.innerHTML='<g class="ge2-streak">'+h+"</g>"},
 draw(L){const d=L.u*365,s=mSeason(d),m=monthOf(d);let rainN=0;
  L.cities.forEach(o=>{const on=d>=o.c.on&&d<mOff(o.c.ll[1]),q=proj(L,o.c.ll);if(on)rainN++;
   o.e.innerHTML=on?'<circle r="13" class="ge2-wetring"/>'+DROP:'<circle r="5" fill="#fff" stroke="#13294b" stroke-width="2"/>';place(o.e,q);
   const dd=dayName(o.c.on),qt=proj(L,o.c.ll,1);putTag(L,o.t,qt?(o.c.left?[qt[0],qt[1]+14]:[qt[0]+16,qt[1]]):null,"<b>"+esc(o.c.n.split(",")[0])+"</b>"+(on?" · monsoon rain":" · from "+dd),0)});
  if(s>.3)putTag(L,L.press,proj(L,[71,29],1),"<b>LOW</b><small>hot land, rising air</small>",-20);else if(s<-.3)putTag(L,L.press,proj(L,[88,36],1),"<b>HIGH</b><small>cold land, sinking air</small>",-20);else putTag(L,L.press,null);
  L.press.classList.toggle("ge2-hi",s<0);
  syncRange(L,dayName(d));this.bars(L);
  const on=n=>MCITY[n].on;
  if(d<59)say(L,"Winter: the north-east monsoon","The land is now colder than the sea. Cool, dry air sinks over Asia and blows out to sea from the north-east. Most of India gets almost no rain.");
  else if(d<on(0))say(L,m<4?"Spring: the land heats up":"May: the land is baking","Land warms much faster than water. Over the hot north-west a low forms as the air rises; the winds die down and begin to turn.");
  else if(d<on(2))say(L,"1 June: the monsoon reaches Kerala","Wet south-west winds off the Indian Ocean are pulled in towards the hot land. Rain bursts on the south-west coast, then Chennai (4 June).");
  else if(d<on(3))say(L,"11 June: Mumbai","The rain marches north up the west coast. As the winds rise over the Western Ghats, the rain pours down.");
  else if(d<on(4))say(L,"27 June: Delhi","The second branch, from the Bay of Bengal, turns west along the Ganges plain and reaches Delhi.");
  else if(d<M_OFF0)say(L,"8 July: all of India",(m===6?"July is the wettest month: about 281 mm of rain on average over all India. ":"")+"Now the whole country, even the Thar Desert, is under the monsoon"+(rainN===MCITY.length?": all five places on the map are getting monsoon rain.":"."));
  else if(d<M_OFF1)say(L,"From 17 September: the monsoon retreats","The land cools, the low fades and the winds weaken. The rain pulls back south-east, out of the north-west first.");
  else if(d<335)say(L,"15 October: the winds have turned","Out of India by mid-October. Now the north-east winds pick up water over the Bay of Bengal: this ‘winter monsoon’ gives Chennai its wettest months, October to December.");
  else say(L,"December: dry winter winds","Cold, dry air blows off the land again. In a few months the land will heat up and the winds will turn round once more.")}};

/* ======================================================================== 2. Rain shadows
   Figures are the stop's own (yearly rain: Hoh Rain Forest about 3,600 mm, Seattle about 1,000 mm, Sequim about 400 mm,
   Ellensburg about 230 mm), which match the US National Park Service (Olympic National Park: the Hoh gets 140 to 170
   inches, 3.6–4.3 m) and NOAA NCEI's 1991–2020 climate normals (Seattle–Tacoma about 39 inches, 990 mm; Ellensburg about
   9 inches, 230 mm). Mount Olympus 2,432 m (USGS). Rising air cools by about 10 °C per km while it is dry (the dry
   adiabatic lapse rate, 9.8 °C/km) and sinking air warms at that rate, which is why the lee side is dry. The cloud's
   "water left" bar is an illustration of where the rain falls, not a measurement. */
const RS=[[-127.2,47.95],[-124.65,47.9],[-123.93,47.86],[-123.71,47.8],[-123.1,47.72],[-122.33,47.61],[-121.85,47.5],[-121.41,47.42],[-120.95,47.2],[-120.55,47.0],[-119.7,46.9]];
/* water left in the cloud at each point (1 = fresh off the ocean) and whether the air is climbing on the way to it */
const RSW=[1,.97,.62,.42,.42,.37,.3,.12,.1,.08,.08],RSUP=[0,0,1,1,0,0,1,1,0,0,0];
const RSG=[{k:2,n:"Hoh Rain Forest",mm:3600,ll:[-123.93,47.86]},{k:4,n:"Sequim",mm:400,ll:[-123.1,48.08]},{k:5,n:"Seattle",mm:1000,ll:[-122.33,47.61]},{k:9,n:"Ellensburg",mm:230,ll:[-120.55,47.0]}];
const RSPH=[{k:0,h:"Over the Pacific",t:"Wind off the ocean is full of water vapour. It blows east, towards the mountains."},
 {k:1,h:"Climbing the Olympic Mountains",t:"The air is forced up the slopes. Rising air cools, and cool air cannot hold as much water: clouds build and it pours. The Hoh Rain Forest gets about 3,600 mm a year."},
 {k:3,h:"Over Mount Olympus, 2,432 m",t:"Much of the water has already fallen on the western slopes."},
 {k:4,h:"Sinking: the rain shadow",t:"Going down the far side the air is squeezed and warms, about 10 °C for every kilometre it sinks. Warm air soaks up water, so the cloud dries out. Sequim, just behind the mountains, gets only about 400 mm."},
 {k:5,h:"Seattle: about 1,000 mm a year",t:"Over Puget Sound the air picks up a little water again. It is rainy, but less than the coast."},
 {k:6,h:"Climbing the Cascades",t:"Up again, so it cools again: the western Cascades get heavy rain and deep winter snow."},
 {k:8,h:"Down the dry side",t:"Over the crest the sinking air warms and dries. There is almost no water left to fall."},
 {k:9,h:"Ellensburg: about 230 mm a year",t:"Only 150 km from Seattle, but a quarter of the rain: sagebrush instead of forest. Seattle gets about four times as much."}];
let RSR=null;const rsR=()=>{if(RSR)return RSR;const R=route(RS,.03);R.uk=RS.map(p=>uOf(R,p));return RSR=R};
function rsSeg(R,u){let k=0;for(let i=0;i<R.uk.length-1;i++)if(u>=R.uk[i])k=i;const f=clamp((u-R.uk[k])/((R.uk[k+1]-R.uk[k])||1),0,1);return{k,f,w:RSW[k]+(RSW[k+1]-RSW[k])*f,up:RSUP[k+1]&&k<R.uk.length-1}}
const CLOUD='<g class="ge2-cloud">'+[[-14,2,12],[-4,-6,14],[9,-2,13],[3,7,11],[-9,8,9],[16,6,9]].map(c=>'<circle cx="'+c[0]+'" cy="'+c[1]+'" r="'+c[2]+'"/>').join("")+"</g>";
const RAINX={tour:"ranges",title:"Rain shadows",dur:20,follow:1,lookTo:[[-123.4,47.4],10],
 tip:"Drag the rain cloud east from the Pacific over both mountain ranges, or press ▶. Watch where its water falls.",
 card:()=>playerHTML("How far the cloud has blown","Pacific")+'<div class="ge2-tank"><span>Water left in the cloud</span><div class="ge2-tankbar"><i></i></div></div><div class="ge2-gauges"></div>',
 init(L){const R=rsR();L.trail=svgEl(L.clip,"path",{class:"ge2-dash"});L.rain=svgEl(L.clip,"g",{class:"ge2-noev ge2-rain"});
  L.gp=RSG.map(gg=>({gg,e:svgEl(L.clip,"g",{class:"ge2-noev"},'<rect x="-6" y="-26" width="12" height="26" rx="2" class="ge2-gbox"/><rect x="-4" y="-2" width="8" height="0" class="ge2-gfill"/>'),t:tag(L,"ge2-small")}));
  L.c=svgEl(L.clip,"g",{class:"ge2-grab",tabindex:"0","aria-label":"Rain cloud: drag it east"});svgEl(L.c,"circle",{r:34,class:"ge2-hit"});L.cI=svgEl(L.c,"g",{},CLOUD);
  L.bub=tag(L,"ge2-bub");L.hint=tag(L,"ge2-hint");L.t=0;L.max=0;
  draggable(L,L.c,(x,y)=>{L.u=nearestU(L,R,x,y,L.u)},()=>stopPlay(L))},
 tick(L,dt){L.t+=dt;advance(L,dt,this.dur);const s=L.seg;let h="";if(L.q&&s&&s.up&&s.w>.09){const n=Math.round(4+s.w*12),sc=L.sc||1;
   for(let k=0;k<n;k++){const ph=(L.t*1.6+k/n*1.7)%1,x=L.q[0]+(k-n/2)*5*sc+Math.sin(k*5.1)*3,y=L.q[1]+10*sc+ph*38;h+='<path d="M'+x.toFixed(1)+" "+y.toFixed(1)+"l-2 6\" opacity=\""+(1-ph).toFixed(2)+'"/>'}}
  if(L.rain)L.rain.innerHTML=h},
 draw(L){const R=rsR(),s=at(R,L.u),sg=rsSeg(R,L.u);L.seg=sg;L.fll=s.ll;L.max=Math.max(L.max,L.u);
  L.trail.setAttribute("d",pathOf(L,R.P.slice(0,s.i+1).concat([s.ll])));
  const q=proj(L,s.ll);L.q=q;place(L.c,q);const sc=.6+sg.w*.75;L.sc=sc;L.cI.setAttribute("transform","scale("+sc.toFixed(2)+")");
  L.cI.classList.toggle("ge2-dark",sg.up&&sg.w>.15);L.cI.style.opacity=(.45+sg.w*.55).toFixed(2);
  L.gp.forEach(o=>{const reached=L.max>=R.uk[o.gg.k]-.002,qq=proj(L,o.gg.ll);place(o.e,qq);const f=o.e.querySelector(".ge2-gfill"),hh=reached?Math.max(2,Math.round(22*Math.sqrt(o.gg.mm/3600))):0;
   f.setAttribute("y",-2-hh);f.setAttribute("height",hh);/* the stop already labels the others on the map; the card lists all four */putTag(L,o.t,reached&&o.gg.n==="Sequim"?proj(L,o.gg.ll,1):null,esc(o.gg.n)+": the rain shadow · "+fmt(o.gg.mm)+" mm a year",8)});
  let ph=RSPH[0];RSPH.forEach(x=>{if(L.u>=R.uk[x.k]-.004)ph=x});
  const pq=proj(L,s.ll,1);putTag(L,L.bub,pq,sg.up&&sg.w>.15?"Rising and cooling: rain!":sg.k>=3&&!sg.up&&sg.w<.45?"Sinking and warming: drying out":"Wet ocean air",-40*sc-6);
  putTag(L,L.hint,L.u<.003&&pq?[pq[0]+36,pq[1]-8]:null,"Drag the cloud east ⟶");
  const bar=L.card&&L.card.querySelector(".ge2-tankbar i");if(bar)bar.style.width=Math.round(sg.w*100)+"%";
  const gb=L.card&&L.card.querySelector(".ge2-gauges");if(gb){const html=RSG.map(o=>{const r=L.max>=R.uk[o.k]-.002;return'<div class="ge2-gauge'+(r?" ge2-on":"")+'"><i style="height:'+(r?Math.max(3,Math.round(48*o.mm/3600)):0)+'px"></i><b>'+(r?fmt(o.mm):"?")+"</b><span>"+esc(o.n)+"</span></div>"}).join("");
   if(gb._h!==html){gb.innerHTML='<div class="ge2-bartitle">Rain a year (mm)</div><div class="ge2-barrow">'+html+"</div>";gb._h=html}}
  syncRange(L,L.u<R.uk[1]?"Pacific":L.u<R.uk[4]?"Olympics":L.u<R.uk[6]?"Seattle":L.u<R.uk[8]?"Cascades":"Dry side");say(L,ph.h,ph.t)}};

/* ======================================================================== 3. Seashells on Everest
   India's path relative to Asia (Eurasia held still) is computed from C. R. Scotese's PALEOMAP plate model, the one the
   Deep Time map (geoflock-drift.js) uses: India-plate and Eurasia rotations were sampled from that model every 5 million
   years and India's position relative to Eurasia fitted as one rotation (a unit quaternion) per step, listed below for
   0, 5, 10 … 90 million years ago; between steps the positions are blended. The outline drawn is today's Indian block
   (India, with Pakistan's and Bangladesh's plains and Sri Lanka) cut roughly at the foot of the mountains (the Main
   Frontal Thrust); the line it meets is the Indus–Yarlung suture, where India joined Asia, traced roughly through Ladakh
   and southern Tibet. In this reconstruction today's outline is still about 2,400 km short of Asia at 50 million years ago:
   the gap was India's northern edge ("Greater India"), now pushed under Tibet or crumpled into the Himalaya. It is drawn
   here so that its front edge touches the suture 50 million years ago, the stop's (and USGS's) date for the collision
   (USGS "This Dynamic Earth": India hit Asia 40 to 50 million years ago and its advance slowed by about half). India's
   speed is measured from the model, between positions 5 million years apart. The summit of Everest is Ordovician marine
   limestone, the Qomolangma Formation, with fossils of trilobites and crinoids (Searle et al. 2003, Journal of the
   Geological Society 160; Myrow et al. 2009). India split from Madagascar about 88 million years ago (Storey et al. 1995,
   Science 267), so at 80 million years ago it is an island continent. Everest's height 8,849 m (Nepal and China, 2020). Mountain heights during
   the rise are not given: only "rising". */
const INQ=[[1,0,0,0],[.99949,-.023,-.02092,-.00756],[.998,-.04671,-.04056,-.01267],[.9962,-.06631,-.05219,-.02151],[.99379,-.08592,-.06385,-.03037],[.99013,-.10841,-.07955,-.03946],
 [.98561,-.13113,-.09531,-.0479],[.9801,-.15398,-.11066,-.05877],[.97392,-.17579,-.12114,-.07678],[.96676,-.2052,-.12853,-.08221],[.95608,-.24596,-.12867,-.09413],[.94179,-.2917,-.12602,-.10987],
 [.92629,-.33413,-.13083,-.11498],[.90503,-.38494,-.13484,-.12066],[.88829,-.4187,-.13147,-.13547],[.86941,-.44826,-.13016,-.16202],[.84728,-.48184,-.13694,-.17663],[.82944,-.50655,-.13994,-.18937],[.81735,-.52184,-.1282,-.2078]];
const IN_T=80,IN_HIT=50;
const IN_FRONT=[[72.9,33.4],[74.5,32.5],[76,31.6],[77.5,30.4],[79,29.6],[80.5,28.9],[82.5,27.6],[84.5,27.2],[86.5,26.8],[88.5,26.8],[90.5,26.7],[92.5,26.8],[94.5,27.4],[95.5,27.8]];
const IN_BLOCK=[[67,25],[67.8,27],[68.5,28.8],[69.6,29.8],[70.6,31.5],[71.4,33]].concat(IN_FRONT,[[95,26.6],[94,25.3],[93,24.6],[92.3,23.5],[92,22],[91.5,22.6],[90.5,22],[89.5,21.9],[88.8,21.6],[87.9,21.8],[86.9,21.2],[86.8,20.3],
 [85.2,19.8],[82.3,16.6],[80.3,15.7],[79.8,10.3],[78.9,9.6],[79.4,9.2],[78.4,9.1],[77.5,8.1],[76.6,8.9],[75,12.8],[73.3,16.5],[72.7,19.8],[72.6,21.5],[73.1,21.8],[72.2,22.3],[72,21.2],[70.5,20.8],[69,22.3],[70,23],[68.4,23.6],[67.4,23.8]]);
const IN_LANKA=[[79.9,9.8],[81,8.8],[81.9,7],[81.6,6.4],[80.6,5.9],[80,6.8],[79.8,8]];
const SUTURE=[[73.5,35.3],[75.5,34.6],[77.6,34],[79.5,32.6],[81.5,31],[83.5,29.9],[85.5,29.4],[87.5,29.2],[89.5,29.3],[91.5,29.2],[93.5,29.3],[95,29.6]];
const EVEREST=[86.925,27.988],SHELL0=[86.9,28.6],IN_HANDLE=[79,21];
const inQ=t=>{t=clamp(t,0,90);const k=Math.min(17,Math.floor(t/5)),f=t/5-k;return{a:INQ[k],b:INQ[k+1],f}};
function inAt(t,ll){const Q=inQ(t),v=vec(ll),a=qrot(Q.a,v),b=qrot(Q.b,v);return toLL([a[0]+(b[0]-a[0])*Q.f,a[1]+(b[1]-a[1])*Q.f,a[2]+(b[2]-a[2])*Q.f])}
/* points fixed to India whose place 50 million years ago was on the suture (Greater India's front edge), and the shell */
let IN50=null;function in50(){if(IN50)return IN50;const q=INQ[IN_HIT/5],c=qconj(q),back=ll=>toLL(qrot(c,vec(ll)));return IN50={lead:SUTURE.map(back),shell:back(SHELL0)}}
const inLead=t=>t>=IN_HIT?in50().lead.map(p=>inAt(t,p)):SUTURE;
const inShell=t=>{if(t>=IN_HIT)return inAt(t,in50().shell);const f=t/IN_HIT;return[EVEREST[0]+(SHELL0[0]-EVEREST[0])*f,EVEREST[1]+(SHELL0[1]-EVEREST[1])*f]};
const inSpeed=t=>{const a=Math.max(0,t-2.5),b=a+5;return km(inAt(a,IN_HANDLE),inAt(b,IN_HANDLE))/5/10};/* km per million years ÷ 10 = cm a year */
const SHELLI='<path d="M0 7 L-8 -3 Q0 -11 8 -3 Z" fill="#fff4dc" stroke="#7a4b20" stroke-width="1.4" stroke-linejoin="round"/><path d="M0 7 L-4 -6 M0 7 L0 -8 M0 7 L4 -6" stroke="#7a4b20" stroke-width="1"/>';
const MTN='<path d="M-9 5 L0 -9 L9 5 Z" fill="#8a6a4a" stroke="#fff" stroke-width="1"/><path d="M-3.4 -3.7 L0 -9 L3.4 -3.7 L1 -4.8 L0 -3.6 L-1.3 -4.8 Z" fill="#fff"/>';
const SHELLS={tour:"plates",title:"Seashells on Everest",dur:22,lookTo:[[68,-4],1.3],
 tip:"Drag India north towards Asia, or press ▶, from 80 million years ago to today. Follow the seashell.",
 card:()=>playerHTML("Millions of years ago","80 million yrs ago"),
 init(L){L.mask=svgEl(L.clip,"path",{class:"ge2-inmask"});L.band=svgEl(L.clip,"path",{class:"ge2-band"});L.lead=svgEl(L.clip,"path",{class:"ge2-lead"});L.sut=svgEl(L.clip,"path",{class:"ge2-suture"});
  L.mts=svgEl(L.clip,"g",{class:"ge2-noev"});L.trail=svgEl(L.clip,"path",{class:"ge2-dash"});
  L.ind=svgEl(L.clip,"g",{class:"ge2-grab",tabindex:"0","aria-label":"India: drag it north"});L.indP=svgEl(L.ind,"path",{class:"ge2-india"});L.lkP=svgEl(L.ind,"path",{class:"ge2-india"});
  L.shell=svgEl(L.clip,"g",{class:"ge2-noev"},SHELLI);
  L.bub=tag(L,"ge2-bub");L.hint=tag(L,"ge2-hint");L.teth=tag(L,"ge2-sea");L.asia=tag(L,"ge2-small");L.shT=tag(L,"ge2-small");L.todayT=tag(L,"ge2-small ge2-ghost");L.gT=tag(L,"ge2-small ge2-ghost");L.evT=tag(L,"ge2-bub ge2-brown");
  draggable(L,L.ind,(x,y)=>{let best=L.u,bd=1e9;for(let k=0;k<=320;k++){const u=k/320,q=proj(L,inAt(IN_T*(1-u),IN_HANDLE));if(!q)continue;const d=Math.hypot(q[0]-x,q[1]-y)+Math.abs(u-L.u)*20;if(d<bd){bd=d;best=u}}L.u=best},()=>stopPlay(L))},
 tick(L,dt){advance(L,dt,this.dur)},
 draw(L){const t=IN_T*(1-L.u),G=g();
  /* today's India and Himalaya are painted over as sea while India is still on its way */
  const op=clamp(t/3,0,1);L.mask.setAttribute("d",op>0?pathOf(L,IN_BLOCK,1)+pathOf(L,IN_LANKA,1)+pathOf(L,IN_FRONT.concat(SUTURE.slice().reverse()),1):"");L.mask.style.opacity=op.toFixed(2);
  const front=IN_FRONT.map(p=>inAt(t,p)),lead=inLead(t);
  L.band.setAttribute("d",pathOf(L,front.concat(lead.slice().reverse()),1));L.band.classList.toggle("ge2-crumple",t<IN_HIT);
  L.lead.setAttribute("d",t>=IN_HIT?pathOf(L,lead):"");L.sut.setAttribute("d",pathOf(L,SUTURE));
  L.indP.setAttribute("d",pathOf(L,IN_BLOCK.map(p=>inAt(t,p)),1));L.lkP.setAttribute("d",pathOf(L,IN_LANKA.map(p=>inAt(t,p)),1));
  const path=[];for(let k=0;k<=40;k++){const tt=IN_T-k*2;if(tt<t)break;path.push(inAt(tt,IN_HANDLE))}path.push(inAt(t,IN_HANDLE));L.trail.setAttribute("d",pathOf(L,path));
  /* mountains grow along the crumple zone after the crash */
  let mh="";if(t<IN_HIT){const sc=.45+1.1*(1-t/IN_HIT);for(let i=1;i<SUTURE.length-1;i+=1){const a=front[Math.min(front.length-1,Math.round(i*(front.length-1)/(SUTURE.length-1)))],b=SUTURE[i],m=[(a[0]*.45+b[0]*.55),(a[1]*.45+b[1]*.55)],q=proj(L,m);
    if(q)mh+='<g transform="translate('+q[0].toFixed(1)+","+q[1].toFixed(1)+") scale("+sc.toFixed(2)+')">'+MTN+"</g>"}}L.mts.innerHTML=mh;
  const sh=inShell(t),qs=proj(L,sh);place(L.shell,qs,t<IN_HIT?" scale(1.15)":"");
  const hq=proj(L,inAt(t,IN_HANDLE),1),away=km(inAt(t,IN_HANDLE),IN_HANDLE),sp=inSpeed(t);
  putTag(L,L.bub,hq,t<.5?"India · today":"India · "+Math.round(t)+" million years ago",-18);
  putTag(L,L.hint,L.u<.003&&hq?[hq[0]+26,hq[1]+12]:null,"Drag India north ↑");
  const mid=t>=IN_HIT+1?[(lead[6][0]+SUTURE[6][0])/2,(lead[6][1]+SUTURE[6][1])/2]:null;putTag(L,L.teth,mid?proj(L,mid,1):null,"Tethys Sea",-8);
  putTag(L,L.asia,proj(L,[86,33],1),"Asia",-10);putTag(L,L.gT,t>=IN_HIT+4?proj(L,[(front[5][0]+lead[5][0])/2,(front[5][1]+lead[5][1])/2],1):null,"India’s front edge: later pushed under Asia",0);putTag(L,L.todayT,away>1600?proj(L,[77.5,13],1):null,"Where India is today",0);
  putTag(L,L.shT,t>=2&&qs&&proj(L,sh,1)?proj(L,sh,1):null,t>=IN_HIT?"Shells on the sea floor":"Shells being lifted",10);
  putTag(L,L.evT,t<.5?proj(L,EVEREST,1):null,"Everest 8,849 m: the shells are on top",-14);
  syncRange(L,t<.5?"Today":Math.round(t)+" million yrs ago");
  if(t>=IN_HIT+1)say(L,Math.round(t)+" million years ago: racing north",(t>75?"India has split from Madagascar and is an island continent. ":"")+"In this reconstruction it is moving at about "+Math.round(sp)+" cm a year, "+fmt(away)+" km south of where it is today. Ahead lies the Tethys Sea, where shells and coral pile up on the sea floor as limestone.");
  else if(t>=IN_HIT-3)say(L,"About 50 million years ago: the crash","India’s front edge, dashed, hits Asia. Continents are too light to sink into the mantle, so instead the rock between them crumples, stacks up and is pushed up, sea floor, shells and all.");
  else if(t>=.5)say(L,Math.round(t)+" million years ago: the Himalaya rise","India keeps pushing, slower now: about "+Math.round(sp)+" cm a year. Its front edge is forced under Tibet and the squeezed rock between rises into mountains. The shells ride up with it.");
  else say(L,"Today: seashells on the roof of the world","The top of Everest is limestone made of sea creatures (trilobites, sea lilies) that lived on the floor of the Tethys Sea more than 440 million years ago. India still pushes north about 4 to 5 cm a year.")}};

/* ======================================================================== 4. Coral in hot water
   NOAA Coral Reef Watch (coralreefwatch.noaa.gov, "Methodology" and the 2023 expansion of its alert levels): heat stress is
   counted only when the sea is at least 1 °C above the reef's usual warmest month (its maximum monthly mean, MMM; that
   excess is the "HotSpot"). Degree Heating Weeks (DHW) add up the HotSpots over the last 12 weeks, in °C-weeks.
   Alert levels: DHW 4 or more, Alert Level 1, significant bleaching likely; 8, Level 2, severe bleaching and significant
   mortality likely; 12, Level 3, multi-species mortality likely; 16, Level 4, severe mortality likely (more than half of
   the corals); 20, Level 5, near-complete mortality likely (more than 80%). Below 4, "Bleaching Warning" (any HotSpot).
   Here the HotSpot is held steady for the weeks chosen, so DHW = HotSpot × weeks (when it is at least 1 °C). Why corals
   whiten: they expel the algae (zooxanthellae) living in their tissue, which feed them (NOAA Ocean Service). The coral's
   colours and how many branches die at each level are a picture of those alert levels, not a survey. The reef is drawn on
   the southern Great Barrier Reef. */
const CORAL_LL=[151.5,-21.3];
const crwLevel=d=>d>=20?{n:"Alert Level 5",t:"Near-complete mortality likely: more than 80% of the corals die.",c:"#5a1020"}:d>=16?{n:"Alert Level 4",t:"Severe mortality likely: more than half of the corals die.",c:"#7d1830"}:
 d>=12?{n:"Alert Level 3",t:"Many kinds of coral die, not just the most sensitive.",c:"#a8212e"}:d>=8?{n:"Alert Level 2",t:"Severe bleaching, and many corals start to die.",c:"#d2452b"}:
 d>=4?{n:"Alert Level 1",t:"Bleaching: corals throw out their algae and turn pale and white.",c:"#e8891a"}:d>0?{n:"Bleaching Warning",t:"The coral is stressed, but if the heat ends soon it will be fine.",c:"#d9b52b"}:{n:"No stress",t:"Healthy coral: the tiny algae living inside it give it colour and most of its food.",c:"#2f8a4c"};
/* a branching colony: branches with their own tolerance, so bleaching and death spread through it, not all at once */
const CBR=(()=>{const B=[];let s=7;const rnd=()=>{s=(s*16807)%2147483647;return s/2147483647};const add=(x,y,a,len,dep)=>{const x2=x+Math.sin(a)*len,y2=y-Math.cos(a)*len;B.push({x,y,x2,y2,w:Math.max(2,6-dep*1.5),b:4+rnd()*4,d:10+rnd()*12});
  if(dep<3){add(x2,y2,a-.45-rnd()*.25,len*.72,dep+1);add(x2,y2,a+.45+rnd()*.25,len*.72,dep+1)}};
 [-1.0,-.5,0,.5,1.0].forEach((a,i)=>add((i-2)*9,22,a*.6,18+rnd()*6,0));return B})();
function coralSVG(dhw){const mix=(a,b,f)=>{const h=x=>[parseInt(x.slice(1,3),16),parseInt(x.slice(3,5),16),parseInt(x.slice(5,7),16)],A=h(a),B=h(b);return"rgb("+A.map((v,i)=>Math.round(v+(B[i]-v)*f)).join(",")+")"};
 let h='<ellipse cx="0" cy="24" rx="44" ry="7" fill="#c9b48a" opacity=".9"/>';
 CBR.forEach(b=>{const dead=dhw>=b.d,bl=clamp((dhw-b.b+1.5)/3,0,1),c=dead?"#7f7a5a":mix("#e06a3a","#f7f5ee",bl),tip=dead?"#6b6a48":mix("#9b4fc4","#ffffff",bl);
  h+='<path d="M'+b.x.toFixed(1)+" "+b.y.toFixed(1)+"L"+b.x2.toFixed(1)+" "+b.y2.toFixed(1)+'" stroke="'+c+'" stroke-width="'+b.w.toFixed(1)+'" stroke-linecap="round"/>';
  if(b.w<=2.6)h+='<circle cx="'+b.x2.toFixed(1)+'" cy="'+b.y2.toFixed(1)+'" r="2.6" fill="'+tip+'"/>'});return h}
const CORALX={tour:"environment",title:"Coral in hot water",lookTo:[[150,-20],2.2],
 tip:"Heat the reef: set how much warmer the sea is than its usual hottest month, and for how many weeks.",
 card:()=>'<div class="ge2-sl"><label>Hotter than the usual warmest month <b class="ge2-v1">0 °C</b></label><input type="range" class="ge2-r1" min="0" max="3" step="0.25" value="0" aria-label="How much warmer than the usual warmest month, in °C"></div>'+
  '<div class="ge2-sl"><label>For how many weeks <b class="ge2-v2">0</b></label><input type="range" class="ge2-r2" min="0" max="12" step="1" value="0" aria-label="For how many weeks"></div>'+
  '<div class="ge2-dhw"><div class="ge2-dhwhead"><span>Heat stress</span><b class="ge2-dhwv">0 degree heating weeks</b></div><div class="ge2-scale"><i class="ge2-mark"></i>'+[4,8,12,16,20].map(v=>'<span style="left:'+(v/24*100)+'%">'+v+"</span>").join("")+"</div></div>"+
  '<div class="ge2-row ge2-btns"><button type="button" class="ge2-btn" data-p="3,2">A short spike: +3 °C for 2 weeks</button><button type="button" class="ge2-btn" data-p="1.5,10">A long simmer: +1.5 °C for 10 weeks</button></div>',
 init(L){L.heat=0;L.weeks=0;L.sea=svgEl(L.clip,"circle",{class:"ge2-noev ge2-warm",r:0});L.algae=svgEl(L.clip,"g",{class:"ge2-noev"});L.col=svgEl(L.clip,"g",{class:"ge2-noev"});L.t=0;L.bub=tag(L,"ge2-bub");L.reefT=tag(L,"ge2-small");L._dh=-1},
 wire(L){const c=L.card,r1=c.querySelector(".ge2-r1"),r2=c.querySelector(".ge2-r2");const upd=()=>{L.heat=+r1.value;L.weeks=+r2.value;L.dirty=1};
  r1.addEventListener("input",upd);r2.addEventListener("input",upd);r1.value=L.heat;r2.value=L.weeks;
  c.querySelectorAll(".ge2-btn").forEach(b=>b.onclick=()=>{const p=b.dataset.p.split(",");r1.value=p[0];r2.value=p[1];upd()})},
 dhw(L){return L.heat>=1?L.heat*L.weeks:0},
 tick(L,dt){L.t+=dt;const d=this.dhw(L);let h="";if(L.q&&d>=4&&d<20){const n=10;for(let k=0;k<n;k++){const ph=(L.t*.35+k/n)%1,x=L.q[0]+Math.sin(k*2.3+L.t*.8)*22*(.4+ph),y=L.q[1]-6-ph*60;
   h+='<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="2.2" fill="#b8a33a" opacity="'+(1-ph).toFixed(2)+'"/>'}}L.algae.innerHTML=h},
 draw(L){const d=this.dhw(L),lv=crwLevel(d),q=proj(L,CORAL_LL);L.q=q;const z=(g()&&g().zoom)||1,sc=clamp(.7+z*.25,.8,1.6);
  if(L._dh!==d){L.col.innerHTML=coralSVG(d);L._dh=d}place(L.col,q," scale("+sc.toFixed(2)+")");
  L.sea.setAttribute("r",q?(70*sc).toFixed(0):"0");if(q){L.sea.setAttribute("cx",q[0]);L.sea.setAttribute("cy",q[1])}L.sea.style.opacity=(clamp(L.heat/3,0,1)*.6).toFixed(2);
  const qc=proj(L,CORAL_LL,1);putTag(L,L.bub,qc,esc(lv.n),-48*sc);putTag(L,L.reefT,qc,"Great Barrier Reef",30*sc);L.bub.style.background=lv.c;
  const c=L.card;if(c){const s=(sel,t)=>{const e=c.querySelector(sel);if(e&&e.textContent!==t)e.textContent=t};s(".ge2-v1","+"+L.heat+" °C");s(".ge2-v2",L.weeks+(L.weeks===1?" week":" weeks"));
   s(".ge2-dhwv",(Math.round(d*10)/10)+" degree heating weeks");const m=c.querySelector(".ge2-mark");if(m){m.style.width=clamp(d/24*100,0,100)+"%";m.style.background=lv.c}}
  if(L.heat>0&&L.heat<1&&L.weeks>0)say(L,"Warm, but not counted","NOAA only counts heat at least 1 °C above the reef’s usual warmest month. Corals cope with this.");
  else if(d===0&&L.heat===0&&L.weeks===0)say(L,lv.n,lv.t+" Heat stress adds up: degrees above normal × weeks.");
  else say(L,lv.n+(d>0?" · "+(Math.round(d*10)/10)+" °C-weeks":""),lv.t+(d>=4&&d<8?" If the sea cools soon, the algae can come back and the coral recovers.":"")+(L.weeks>0&&L.heat>=1&&d>=8&&L.heat<=1.5?" A small rise, if it lasts long enough, does more harm than a short spike.":""))}};

/* ======================================================================== 5. Point Nemo
   Point Nemo, the oceanic pole of inaccessibility, 48°52.6′S 123°23.6′W, about 2,688 km from the three nearest pieces of
   land: Ducie Island (Pitcairn Islands), Motu Nui (off Easter Island) and Maher Island (off Marie Byrd Land, Antarctica)
   (H. Lukatela, 1992, computed with the Hipparchus geodesic library; the stop's own figures). Coordinates of the small
   islands below are from their Wikipedia/GeoNames entries, rounded to about 0.05°; with them, the three distances from
   Point Nemo come out within 10 km of 2,688 (checked on a 1° grid over the whole box: the farthest point found is beside
   Point Nemo, about 2,670 km). Land also comes from the map's own country shapes (projFeatures). The buoy is
   kept inside the South Pacific (180°–70°W, 5°–75°S), where this list covers every island; elsewhere small islands are
   missing from the map's shapes and the distances would be wrong. */
const NEMO=[-123.393,-48.877],NEMO3=[{n:"Ducie Island",ll:[-124.787,-24.677]},{n:"Motu Nui, Easter Island",ll:[-109.446,-27.203]},{n:"Maher Island, Antarctica",ll:[-126.35,-72.95]}];
const ISLES=[["Ducie Island",-124.787,-24.677],["Henderson Island",-128.32,-24.37],["Pitcairn Island",-130.1,-25.07],["Oeno Island",-130.74,-23.93],["Motu Nui, Easter Island",-109.446,-27.203],["Easter Island",-109.35,-27.12],
 ["Salas y Gómez",-105.36,-26.47],["Robinson Crusoe Island",-78.85,-33.64],["Alejandro Selkirk Island",-80.77,-33.76],["San Félix",-80.09,-26.29],["San Ambrosio",-79.89,-26.34],
 ["Tahiti",-149.43,-17.65],["Tubuai",-149.47,-23.37],["Raivavae",-147.67,-23.87],["Rapa Iti",-144.33,-27.6],["Marotiri",-143.53,-27.92],["Rurutu",-151.35,-22.47],["Rimatara",-152.8,-22.65],["Maria Island (Austral)",-154.68,-21.8],
 ["Mangareva",-134.97,-23.12],["Temoe",-134.47,-23.34],["Morane",-137.1,-23.16],["Tematangi",-140.6,-21.68],["Moruroa",-138.9,-21.83],["Fangataufa",-138.75,-22.23],["Hao",-140.9,-18.1],["Rangiroa",-147.7,-15.1],
 ["Nuku Hiva",-140.1,-8.86],["Hiva Oa",-139,-9.75],["Fatu Hiva",-138.65,-10.47],["Rarotonga",-159.78,-21.23],["Mangaia",-157.9,-21.92],["Aitutaki",-159.78,-18.86],["Palmerston",-163.17,-18.05],
 ["Niue",-169.87,-19.05],["Tongatapu",-175.2,-21.18],["ʻAta",-174.98,-22.34],["Raoul Island",-177.92,-29.27],["L’Esperance Rock",-178.9,-31.35],["Chatham Island",-176.55,-43.95],["Pitt Island",-176.2,-44.28],
 ["Bounty Islands",179.05,-47.75],["Antipodes Islands",178.77,-49.68],["Campbell Island",169.15,-52.54],["Auckland Islands",166.1,-50.7],["Macquarie Island",158.9,-54.6],["Scott Island",-179.97,-67.4],
 ["Peter I Island",-90.6,-68.8],["Maher Island, Antarctica",-126.35,-72.95],["Diego Ramírez Islands",-68.7,-56.5],["Isabela, Galápagos",-91.1,-0.8],["San Cristóbal, Galápagos",-89.4,-0.85],["Española, Galápagos",-89.7,-1.38],["Clipperton Island",-109.2,10.3]].map(a=>({n:a[0],ll:[a[1],a[2]],v:vec([a[1],a[2]])}));
let NLAND=null;function nemoLand(){if(NLAND)return NLAND;const P=[];try{const F=typeof projFeatures==="function"?projFeatures():[];const inBox=(x,y)=>y<-1&&y>-86&&(x<-60||x>140);
  let nm="";const walk=c=>{if(typeof c[0]==="number"){if(inBox(c[0],c[1]))P.push({n:nm,ll:[c[0],c[1]],v:vec(c)});return}c.forEach(walk)};
  F.forEach(f=>{if(f&&f.geometry){nm=(f.properties&&f.properties.n)||"";walk(f.geometry.coordinates)}})}catch(e){}
 return NLAND=P.concat(ISLES)}
function nearestLand(ll){const v=vec(ll);let best=null,bd=-2;for(const p of nemoLand()){const d=v[0]*p.v[0]+v[1]*p.v[1]+v[2]*p.v[2];if(d>bd){bd=d;best=p}}return{p:best,km:Math.acos(clamp(bd,-1,1))*R_KM}}
const nemoClamp=ll=>[clamp(ll[0]>0?-180:ll[0],-179.9,-70),clamp(ll[1],-75,-5)];
const BUOY='<path d="M0 -16 L0 -6" stroke="#13294b" stroke-width="2"/><path d="M0 -17 L9 -13 L0 -10 Z" fill="#d2252b"/><path d="M-9 -6 L9 -6 L6 6 L-6 6 Z" fill="#ffcc33" stroke="#13294b" stroke-width="1.6" stroke-linejoin="round"/><path d="M-12 7 Q-6 3 0 7 T12 7" fill="none" stroke="#fff" stroke-width="1.6"/>';
const NEMOX={tour:"seas",title:"Point Nemo",lookTo:[[-125,-45],1.45],
 tip:"Is Point Nemo really the loneliest spot? Drag the buoy round the South Pacific: its yellow circle grows until it touches land. Try to beat 2,688 km.",
 card:()=>'<div class="ge2-nemo"><div><span>Nearest land</span><b class="ge2-nnow">–</b></div><div><span>Your best</span><b class="ge2-nbest">–</b></div></div><div class="ge2-nbar"><i class="ge2-nb1"></i><i class="ge2-nb2"></i></div>'+
  '<div class="ge2-row ge2-btns"><button type="button" class="ge2-btn ge2-reveal">Show me Point Nemo</button><button type="button" class="ge2-btn ge2-again">Start again</button></div>',
 init(L){L.b=[-150,-35];L.best=0;L.bestLL=null;L.won=0;L.circ=svgEl(L.clip,"path",{class:"ge2-ncirc"});L.ln=svgEl(L.clip,"path",{class:"ge2-nline"});L.three=svgEl(L.clip,"g",{class:"ge2-noev"});
  L.bestD=svgEl(L.clip,"circle",{r:5,class:"ge2-nbestdot"});L.buoy=svgEl(L.clip,"g",{class:"ge2-grab",tabindex:"0","aria-label":"Buoy: drag it round the South Pacific"});svgEl(L.buoy,"circle",{r:26,class:"ge2-hit"});svgEl(L.buoy,"g",{},BUOY);
  L.bub=tag(L,"ge2-bub");L.landT=tag(L,"ge2-small");L.hint=tag(L,"ge2-hint");L.t3=NEMO3.map(()=>tag(L,"ge2-small"));L.nT=tag(L,"ge2-bub ge2-nemot");
  const mv=ll=>{L.b=nemoClamp(ll);L.moved=1;const r=nearestLand(L.b);if(r.km>L.best){L.best=r.km;L.bestLL=L.b.slice()}if(r.km>=2580&&!L.won){L.won=1;L.reveal=1;L._said=""}};
  draggable(L,L.buoy,(x,y)=>{const ll=unproj(L,x,y);if(ll)mv(ll)},null,f=>{mv([L.b[0]+f*1.5,L.b[1]])});L.mv=mv;mv(L.b);L.moved=0},
 wire(L){const c=L.card;c.querySelector(".ge2-reveal").onclick=()=>{L.reveal=1;L.dirty=1;turnTo(L,NEMO)};c.querySelector(".ge2-again").onclick=()=>{L.reveal=0;L.won=0;L.best=0;L.bestLL=null;L.b=[-150,-35];L.mv(L.b);L.moved=0;L._said="";L.dirty=1}},
 draw(L){const r=nearestLand(L.b),q=proj(L,L.b);place(L.buoy,q);
  try{L.circ.setAttribute("d",pathOf(L,d3.geoCircle().center(L.b).radius(r.km/R_KM/DEG).precision(2)().coordinates[0],1))}catch(e){}
  L.ln.setAttribute("d",r.p?pathOf(L,d3.range(0,21).map(k=>d3.geoInterpolate(L.b,r.p.ll)(k/20))):"");
  putTag(L,L.landT,r.p?proj(L,r.p.ll,1):null,r.p&&r.p.n?esc(r.p.n):"Land",10);
  putTag(L,L.bub,proj(L,L.b,1),fmt(r.km)+" km to the nearest land",-26);putTag(L,L.hint,!L.moved&&q?[q[0]+24,q[1]+10]:null,"Drag the buoy");
  place(L.bestD,L.bestLL&&L.best>r.km+30?proj(L,L.bestLL):null);
  let h="";if(L.reveal){NEMO3.forEach((o,i)=>{const d=pathOf(L,d3.range(0,31).map(k=>d3.geoInterpolate(NEMO,o.ll)(k/30)));if(d)h+='<path class="ge2-n3" d="'+d+'"/>';putTag(L,L.t3[i],proj(L,o.ll,1),esc(o.n)+" · "+fmt(km(NEMO,o.ll))+" km",10)});
   const qn=proj(L,NEMO);if(qn)h+='<circle cx="'+qn[0].toFixed(1)+'" cy="'+qn[1].toFixed(1)+'" r="7" class="ge2-nemodot"/>';putTag(L,L.nT,proj(L,NEMO,1),"Point Nemo",-12)}else{L.t3.forEach(t=>putTag(L,t,null));putTag(L,L.nT,null)}
  L.three.innerHTML=h;
  const c=L.card;if(c){const s=(sel,t)=>{const e=c.querySelector(sel);if(e&&e.textContent!==t)e.textContent=t};s(".ge2-nnow",fmt(r.km)+" km");s(".ge2-nbest",L.best?fmt(L.best)+" km":"–");
   const b1=c.querySelector(".ge2-nb1"),b2=c.querySelector(".ge2-nb2");if(b1)b1.style.width=clamp(r.km/2688*100,0,100)+"%";if(b2)b2.style.left=clamp(L.best/2688*100,0,100)+"%"}
  if(L.reveal)say(L,L.won?"You found it: Point Nemo!":"Point Nemo","At the loneliest spot the circle touches three pieces of land at once, all about 2,688 km away: Ducie Island, Motu Nui off Easter Island, and Maher Island off Antarctica. Move any way and you get closer to one of them.");
  else if(!L.moved)say(L,"Can you find a lonelier spot?","The circle around the buoy reaches out to the nearest land. Push the buoy away from whatever it touches.");
  else if(r.km<800)say(L,"Too close to land","Islands are scattered across much of the Pacific. Look for the emptiest stretch of sea.");
  else if(r.km<2000)say(L,"Getting lonelier","When the circle touches land on one side, push the buoy away from it, until it touches something else.");
  else say(L,"Very lonely: "+fmt(r.km)+" km","Now the circle is pinned between islands and Antarctica. Find the spot where it touches three at once.")}};

/* ======================================================================== 6. Tornado Alley
   About 1,200 tornadoes a year in the United States (NOAA National Severe Storms Laboratory, "Severe Weather 101"; the stop's
   own figure). Why the Plains: warm, moist air from the Gulf of Mexico flows north at low levels, hot, dry air off the
   desert south-west and the Mexican plateau rides over it, and cold, dry air comes down from Canada; with no mountains
   running east–west to keep them apart, they meet over the flat Great Plains, and the jet stream above adds winds that
   change with height, which set storms spinning (NOAA NSSL, "Severe Weather 101: Tornado Basics"; US National Weather
   Service). Most tornadoes come in spring and early summer (NOAA NCEI). The three air masses are pictures, placed where
   they come from; "Tornado Alley" is drawn as the stop's own box, roughly Texas to South Dakota. */
const TZONE=[-98.5,37],TZR=7.5;
const TAIR=[{k:"wet",n:"Warm, wet air",from:"Gulf of Mexico",ll:[-91,25],c:"#2f8fe0",ic:'<path d="M0 -10 C 6 -3 7 1 7 4 A7 7 0 0 1 -7 4 C -7 1 -6 -3 0 -10 Z" fill="#fff"/>'},
 {k:"cold",n:"Cold air",from:"Canada",ll:[-104,54],c:"#6a8fd8",ic:'<path d="M0 -10 V10 M-8.7 -5 L8.7 5 M-8.7 5 L8.7 -5" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>'},
 {k:"dry",n:"Hot, dry air",from:"the desert south-west",ll:[-112,31],c:"#e08a2a",ic:'<circle r="5" fill="#fff"/><path d="M0 -10 V-7.5 M0 10 V7.5 M-10 0 H-7.5 M10 0 H7.5 M-7 -7 L-5.3 -5.3 M7 7 L5.3 5.3 M-7 7 L-5.3 5.3 M7 -7 L5.3 -5.3" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>'}];
const TSTORM='<g class="ge2-sc"><ellipse cx="0" cy="-34" rx="46" ry="11" fill="#5d6778"/><ellipse cx="-14" cy="-30" rx="26" ry="14" fill="#4a5466"/><ellipse cx="14" cy="-28" rx="24" ry="13" fill="#566072"/></g>'+
 '<g class="ge2-funnel"><path d="M-14 -20 Q-6 -2 -3 14 L3 14 Q6 -2 14 -20 Z" fill="#7b8696" opacity=".92"/><path d="M-9 -12 Q0 -8 9 -12 M-6 -3 Q0 0 6 -3 M-4 6 Q0 8 4 6" stroke="#cfd5de" stroke-width="1.4" fill="none"/></g>'+
 '<ellipse cx="0" cy="16" rx="13" ry="4" fill="#9a8a6a" opacity=".85"/>';
const TORNX={tour:"hazards",title:"Tornado Alley",
 tip:"Build a tornado: drag the three kinds of air onto the Great Plains (the dashed ring) so they meet.",
 card:()=>'<div class="ge2-ing">'+TAIR.map(a=>'<div class="ge2-ingi" data-k="'+a.k+'"><i style="background:'+a.c+'"></i><span><b>'+a.n+'</b> from '+a.from+'</span><em>✓</em></div>').join("")+'</div><div class="ge2-row ge2-btns"><button type="button" class="ge2-btn ge2-again">Start again</button></div>',
 init(L){L.pos={};TAIR.forEach(a=>L.pos[a.k]=a.ll.slice());L.zone=svgEl(L.clip,"path",{class:"ge2-tzone"});L.trails=svgEl(L.clip,"g",{class:"ge2-noev"});L.storm=svgEl(L.clip,"g",{class:"ge2-noev"},TSTORM);L.t=0;
  L.m=TAIR.map(a=>{const e=svgEl(L.clip,"g",{class:"ge2-grab",tabindex:"0","aria-label":a.n+" from "+a.from+": drag it onto the Great Plains"});svgEl(e,"circle",{r:30,class:"ge2-hit"});
   svgEl(e,"g",{},'<circle r="24" fill="'+a.c+'" fill-opacity=".72" stroke="#fff" stroke-width="2.5"/>'+a.ic);const t=tag(L,"ge2-small");
   draggable(L,e,(x,y)=>{const ll=unproj(L,x,y);if(ll){L.pos[a.k]=ll;L.moved=1}},null,f=>{const p=L.pos[a.k],dx=TZONE[0]-p[0],dy=TZONE[1]-p[1],n=Math.hypot(dx,dy)||1;L.pos[a.k]=[p[0]+dx/n*f,p[1]+dy/n*f];L.moved=1});return{a,e,t}});
  L.clip.appendChild(L.storm);/* the storm sits on top of the air masses */L.zT=tag(L,"ge2-small ge2-zt");L.bub=tag(L,"ge2-bub");L.hint=tag(L,"ge2-hint")},
 wire(L){L.card.querySelector(".ge2-again").onclick=()=>{TAIR.forEach(a=>L.pos[a.k]=a.ll.slice());L.moved=0;L._said="";L.dirty=1}},
 inZone(ll){return d3.geoDistance(ll,TZONE)/DEG<=TZR},
 tick(L,dt){L.t+=dt;if(L.all){const f=L.storm.querySelector(".ge2-funnel");if(f)f.setAttribute("transform","skewX("+(Math.sin(L.t*3)*8).toFixed(1)+")")}},
 draw(L){try{L.zone.setAttribute("d",pathOf(L,d3.geoCircle().center(TZONE).radius(TZR).precision(3)().coordinates[0],1))}catch(e){}
  const inz={};let n=0,h="";TAIR.forEach(a=>{if(this.inZone(L.pos[a.k]))n++});const all=n===3;n=0;
  L.m.forEach(o=>{const p=L.pos[o.a.k],q=proj(L,p),z=this.inZone(p);inz[o.a.k]=z;if(z)n++;place(o.e,q,all?" scale(.7)":"");o.e.classList.toggle("ge2-in",z);o.e.style.opacity=all?".55":"";
   putTag(L,o.t,all?null:proj(L,p,1),esc(o.a.n),26);const d=pathOf(L,[o.a.ll,p]);if(d&&km(o.a.ll,p)>200)h+='<path d="'+d+'" stroke="'+o.a.c+'" class="ge2-ttrail"/>'});L.trails.innerHTML=h;
  L.all=n===3;let mid=null;if(L.all){const P=TAIR.map(a=>L.pos[a.k]);mid=[(P[0][0]+P[1][0]+P[2][0])/3,(P[0][1]+P[1][1]+P[2][1])/3]}
  place(L.storm,L.all?proj(L,mid):null," scale(1.5)");putTag(L,L.zT,L.all?null:proj(L,[TZONE[0],TZONE[1]+TZR],1),"Tornado Alley: the Great Plains",-24);
  putTag(L,L.bub,L.all?proj(L,mid,1):null,"Supercell! A tornado touches down",-82);
  const q0=proj(L,L.pos.wet,1);putTag(L,L.hint,!L.moved&&q0?[q0[0]+30,q0[1]-10]:null,"Drag me north ⟶");
  if(L.card)L.card.querySelectorAll(".ge2-ingi").forEach(e=>e.classList.toggle("ge2-on",!!inz[e.dataset.k]));
  if(L.all)say(L,"All three meet: storms explode","Warm, wet air near the ground, hot dry air on top like a lid and cold air pushing in: when the lid breaks, the warm air shoots up into giant thunderstorms, and winds that change with height set them spinning. The US gets about 1,200 tornadoes a year, most in spring.");
  else if(!L.moved)say(L,"Three kinds of air, one flat meeting place","Nothing stands between the Gulf of Mexico and Canada: the Rockies run north to south, so there is no wall of mountains to keep the air masses apart.");
  else if(n===0)say(L,"Bring them to the Plains","Drag each kind of air into the dashed ring over Kansas and Oklahoma.");
  else say(L,n+" of 3 have arrived",!inz.wet?"Storms need fuel: warm, wet air from the Gulf to rise and make clouds.":!inz.cold?"Bring cold air down from Canada to shove under the warm air and lift it.":"Bring hot, dry desert air too: it forms a lid that lets the warm, wet air build up until it bursts upward.")}};

/* ---------------- the engine: one stop at a time (as in geoflock-interact-phys.js) ---------------- */
const DEFS=[MONSOON,RAINX,SHELLS,CORALX,NEMOX,TORNX];
let L=null,raf=0,lastT=0;
function activeDef(){try{if(typeof ps==="undefined"||!ps||!ps.tour||ps.mode!=="globe")return null;const S=psSteps()[ps.i];if(!S)return null;return DEFS.find(d=>d.tour===ps.tour&&d.title===S.title)||null}catch(e){return null}}
function mount(D){const G=g();if(!G||!G.host)return;if(L&&L.D===D&&L.host===G.host&&L.el.isConnected)return;unmount();
 const el=document.createElement("div");el.className="ge2-layer";el.innerHTML='<svg class="ge2-svg"><defs><clipPath id="ge2Clip"><path class="ge2-clipp" clip-rule="evenodd"/></clipPath></defs><g class="ge2-clipg" clip-path="url(#ge2Clip)"></g></svg>';G.host.appendChild(el);
 const svg=el.querySelector("svg");L={D,host:G.host,el,svg,clip:svg.querySelector(".ge2-clipg"),clipP:svg.querySelector(".ge2-clipp"),u:0,playing:false,dirty:1,ox:0,oy:0,key:""};
 try{D.init.call(D,L)}catch(e){console.error(e)}document.body.classList.add("ge2-on");lastT=0;loop()}
function unmount(){cancelAnimationFrame(raf);raf=0;if(L){try{if(L.D.off)L.D.off(L)}catch(e){}try{L.el.remove()}catch(e){}L=null}
 document.querySelectorAll(".ge2-ctl").forEach(c=>c.remove());document.body.classList.remove("ge2-on")}
function ensureCard(){if(!L||typeof ps==="undefined"||!ps||!ps.card)return;const ex=ps.card.querySelector(".ge2-ctl");if(ex&&L.card===ex)return;if(ex)ex.remove();
 const at0=ps.card.querySelector(".ps-stat");if(!at0)return;const D=L.D,c=document.createElement("div");c.className="ge2-ctl";
 c.innerHTML='<div class="ge2-do">'+esc(D.tip)+"</div>"+(D.card?D.card(L):"")+'<div class="ge2-ep"></div>';at0.after(c);L.card=c;L._said="";
 try{if(c.querySelector(".ge2-play"))wirePlayer(L);if(D.wire)D.wire.call(D,L)}catch(e){console.error(e)}playBtn(L);L.dirty=1}
function loop(){if(!L)return;raf=requestAnimationFrame(t=>{try{const G=g();const dt=Math.min(.1,(t-(lastT||t))/1000);lastT=t;
  const hr=L.host.getBoundingClientRect(),cr=G.canvas?G.canvas.getBoundingClientRect():hr;L.ox=cr.left-hr.left;L.oy=cr.top-hr.top;
  let cb=null;try{const c=ps&&ps.card;if(c&&c.isConnected&&c.offsetWidth){const b=c.getBoundingClientRect();cb=[b.left-hr.left-6,b.top-hr.top-6,b.right-hr.left+6,b.bottom-hr.top+6]}}catch(e){}L.cb=cb;
  if(L.D.tick)L.D.tick.call(L.D,L,dt);
  const key=(G.key?G.key():(G.rot||[]).join(",")+G.zoom)+"|"+hr.width+"x"+hr.height+"|"+cr.left+","+cr.top+"|"+(cb?cb.map(Math.round).join(","):"");
  if(key!==L.key||L.dirty){L.key=key;L.dirty=0;L.svg.setAttribute("width",hr.width);L.svg.setAttribute("height",hr.height);
   /* everything drawn in the SVG is kept off the tour card by an even-odd clip */
   L.clipP.setAttribute("d","M-10 -10H"+(hr.width+10)+"V"+(hr.height+10)+"H-10Z"+(cb?"M"+cb[0]+" "+cb[1]+"H"+cb[2]+"V"+cb[3]+"H"+cb[0]+"Z":""));
   L.D.draw.call(L.D,L);follow(L)}}catch(e){console.error(e)}loop()})}
/* turn the globe smoothly so a place shows beside the card, not under it */
function turnTo(L,ll,zoom){const G=g();if(!G||!G.lookAt||G._flat)return;let side=0;try{const c=ps.card.getBoundingClientRect(),h=L.host.getBoundingClientRect();side=(c.left+c.right)/2>(h.left+h.right)/2?1:-1}catch(e){}
 const z=zoom||G.zoom||1;glide(L,[ll[0]+side*28/z,ll[1]*(1-.3/Math.max(1,z))],z)}
function glide(L,t,z1){const G=g();const r0=[-G.rot[0],-G.rot[1]],z0=G.zoom,T0=performance.now(),ip=d3.geoInterpolate(r0,[t[0],t[1]]),D=L.D;L.gliding=T0;
 const step=()=>{if(!L||L.D!==D||!L.el.isConnected)return;const f=Math.min(1,(performance.now()-T0)/1100),e=f<.5?2*f*f:1-Math.pow(-2*f+2,2)/2,c=ip(e);try{G.lookAt(c[0],c[1],z0+(z1-z0)*e)}catch(err){L.gliding=0;return}L.dirty=1;if(f<1)requestAnimationFrame(step);else L.gliding=0};step()}
function follow(L){if(!L.D.follow||!L.fll||L.gliding||!L.looked&&L.D.lookTo)return;if(performance.now()-(L.lastFollow||0)<1500)return;if(proj(L,L.fll,1))return;
 L.lastFollow=performance.now();turnTo(L,L.fll)}
/* a stop whose action sits off to one side turns the globe there once, after the tour's own move has settled; if the reader
   has already turned the globe, nothing more happens after that first turn */
function look(){if(!L||!L.D.lookTo||L.looked)return;const G=g();if(!G||!G.lookAt)return;const k=(G.rot||[]).map(v=>v.toFixed(2)).join(",")+"|"+(+G.zoom).toFixed(2);
 if(k!==L.lastRot){L.lastRot=k;L.still=0;return}if(++L.still<3)return;L.looked=1;turnTo(L,L.D.lookTo[0],L.D.lookTo[1])}
setInterval(()=>{try{const D=activeDef();if(D){mount(D);ensureCard();look()}else if(L||document.querySelector(".ge2-ctl"))unmount()}catch(e){}},300);
addEventListener("resize",()=>{if(L)L.dirty=1});

{const s=document.createElement("style");s.textContent=`
.ge2-layer{position:absolute;inset:0;pointer-events:none;z-index:24;overflow:hidden}
.ge2-svg{position:absolute;left:0;top:0;overflow:visible}
.ge2-grab{pointer-events:all;cursor:grab;touch-action:none;outline:none}.ge2-grab.ge2-dragging{cursor:grabbing}
.ge2-noev{pointer-events:none}
.ge2-hit{fill:rgba(255,255,255,.001);stroke:none}
.ge2-grab>g{filter:drop-shadow(0 2px 2px rgba(0,0,0,.45))}
.ge2-grab:hover>g,.ge2-grab:focus-visible>g{filter:drop-shadow(0 0 5px #fff) drop-shadow(0 2px 2px rgba(0,0,0,.45))}
.ge2-dash{fill:none;stroke:rgba(255,255,255,.8);stroke-width:1.8;stroke-dasharray:4 5}
.ge2-tag{position:absolute;transform:translate(-50%,0);white-space:nowrap;pointer-events:none}
.ge2-bub{transform:translate(-50%,-100%);background:#13294b;color:#fff;font-weight:800;font-size:14px;padding:5px 12px;border-radius:999px;box-shadow:0 3px 10px rgba(0,0,0,.3)}
.ge2-brown{background:#6b4423}
.ge2-small{background:rgba(255,255,255,.94);color:#13294b;font-weight:800;font-size:12.5px;padding:3px 9px;border-radius:999px;box-shadow:0 2px 6px rgba(0,0,0,.25)}
.ge2-hint{transform:none;background:rgba(255,255,255,.96);color:#9a4a16;font-weight:800;font-size:13px;padding:4px 10px;border-radius:999px;box-shadow:0 2px 8px rgba(0,0,0,.25);animation:ge2Nudge 1.4s ease-in-out infinite}
@keyframes ge2Nudge{50%{transform:translateX(6px)}}
.ge2-streak path{fill:none;stroke-width:2.6;stroke-linecap:round}.ge2-streak .ge2-sh{stroke:#13294b;stroke-width:5;stroke-opacity:.55}
.ge2-right{transform:translate(0,-50%)}
.ge2-wetring{fill:rgba(47,143,224,.25);stroke:#2f8fe0;stroke-width:2;animation:ge2Pulse 1.6s ease-in-out infinite}
@keyframes ge2Pulse{50%{stroke-width:5;fill:rgba(47,143,224,.4)}}
.ge2-press{transform:translate(-50%,-100%);text-align:center;background:rgba(210,60,40,.92);color:#fff;font-weight:900;font-size:15px;padding:4px 12px;border-radius:12px;box-shadow:0 3px 10px rgba(0,0,0,.3)}
.ge2-press.ge2-hi{background:rgba(40,90,180,.92)}.ge2-press small{display:block;font-weight:700;font-size:11px}
.ge2-cloud circle{fill:#f4f8fc;stroke:rgba(60,80,110,.45);stroke-width:1}.ge2-cloud.ge2-dark circle{fill:#9aa8ba;stroke:#5b6b80}
.ge2-rain path{stroke:#4aa3ff;stroke-width:2;stroke-linecap:round}
.ge2-gbox{fill:rgba(255,255,255,.85);stroke:#13294b;stroke-width:1.4}.ge2-gfill{fill:#2f8fe0}
.ge2-inmask{fill:rgba(255,255,255,.16);stroke:#fff;stroke-width:1.6;stroke-dasharray:4 4;pointer-events:none}
.ge2-india{fill:#c9a86a;stroke:#5a3d1a;stroke-width:2;stroke-linejoin:round}
.ge2-band{fill:rgba(201,168,106,.35);stroke:#5a3d1a;stroke-width:1.4;stroke-dasharray:5 4;pointer-events:none}.ge2-band.ge2-crumple{fill:rgba(139,100,60,.75);stroke-dasharray:none}
.ge2-lead{fill:none;stroke:#fff;stroke-width:2.2;stroke-dasharray:5 4;pointer-events:none}
.ge2-suture{fill:none;stroke:#ffd166;stroke-width:3;stroke-linecap:round;pointer-events:none}
.ge2-ghost{background:rgba(255,255,255,.7);font-weight:700;font-style:italic}
.ge2-sea{transform:translate(-50%,-50%);color:#fff;font-weight:900;font-style:italic;font-size:14px;letter-spacing:.06em;text-shadow:0 1px 3px rgba(0,0,0,.7)}
.ge2-warm{fill:#ff5a36}
.ge2-ncirc{fill:rgba(255,209,102,.16);stroke:#ffd166;stroke-width:3;pointer-events:none}
.ge2-nline{fill:none;stroke:#ffd166;stroke-width:2;stroke-dasharray:4 4;pointer-events:none}
.ge2-n3{fill:none;stroke:#ff5a36;stroke-width:3;stroke-linecap:round}.ge2-nemodot{fill:#ff5a36;stroke:#fff;stroke-width:2.5}
.ge2-nbestdot{fill:#fff;stroke:#13294b;stroke-width:2;pointer-events:none}.ge2-nemot{background:#c2364f}
.ge2-tzone{fill:rgba(255,255,255,.1);stroke:#fff;stroke-width:2.2;stroke-dasharray:7 6;pointer-events:none}
.ge2-ttrail{fill:none;stroke-width:5;stroke-linecap:round;opacity:.55}
.ge2-grab.ge2-in>g>circle{stroke:#ffd166;stroke-width:4}
.ge2-zt{transform:translate(-50%,-100%)}
.ge2-sc{animation:ge2Flash 2.2s infinite}@keyframes ge2Flash{0%,86%,100%{filter:none}90%{filter:brightness(2.2)}}
.ge2-ctl{margin:10px 0 4px;padding:10px 12px;border-radius:12px;background:rgba(19,41,75,.06);border:1px solid rgba(19,41,75,.12)}
.ge2-do{font-weight:800;font-size:14px;line-height:1.35;color:#9a4a16;margin-bottom:8px}
.ge2-row{display:flex;align-items:center;gap:10px}
.ge2-play{flex:0 0 auto;width:36px;height:36px;border-radius:50%;border:0;background:#d9682b;color:#fff;font-size:13px;cursor:pointer}
.ge2-range,.ge2-sl input{flex:1 1 auto;min-width:0;accent-color:#d9682b}
.ge2-read{flex:0 0 auto;font-weight:800;font-size:12.5px;color:#9a4a16;white-space:nowrap;min-width:64px;text-align:right}
.ge2-ep{margin-top:8px;font-size:14px;line-height:1.4;min-height:2.8em}.ge2-ep b{display:block;font-size:15px}
.ge2-ep.ge2-new{animation:ge2In .45s ease}@keyframes ge2In{from{opacity:.2;transform:translateY(4px)}}
.ge2-bartitle{font-size:12px;font-weight:700;opacity:.75;margin:8px 0 4px}
.ge2-barrow{display:flex;gap:6px;align-items:flex-end}
.ge2-bar,.ge2-gauge{flex:1 1 0;min-width:0;display:flex;flex-direction:column;align-items:center;font-size:11px;line-height:1.2;text-align:center}
.ge2-bar i,.ge2-gauge i{display:block;width:70%;background:rgba(19,41,75,.25);border-radius:4px 4px 0 0;transition:height .3s}
.ge2-bar.ge2-wet i{background:#7fb6e6}.ge2-bar.ge2-on i,.ge2-gauge.ge2-on i{background:#2f8fe0}.ge2-bar.ge2-on b{color:#1d6fc0}
.ge2-bar b,.ge2-gauge b{font-size:12px;margin-top:2px}.ge2-bar span,.ge2-gauge span{opacity:.75}
.ge2-barnote{font-size:12.5px;margin-top:4px}
.ge2-tank{font-size:12px;font-weight:700;margin-top:8px}.ge2-tankbar{height:10px;border-radius:6px;background:rgba(19,41,75,.12);overflow:hidden;margin-top:3px}
.ge2-tankbar i{display:block;height:100%;width:100%;background:linear-gradient(90deg,#2f8fe0,#7fc4ff);transition:width .2s}
.ge2-sl{margin-bottom:6px}.ge2-sl label{display:flex;justify-content:space-between;font-size:13px;font-weight:700}.ge2-sl b{color:#c2364f}.ge2-sl input{width:100%}
.ge2-dhwhead{display:flex;justify-content:space-between;font-size:13px;font-weight:700}
.ge2-scale{position:relative;height:12px;border-radius:6px;margin:4px 0 16px;background:linear-gradient(90deg,#2f8a4c 0,#d9b52b 8%,#e8891a 16.7%,#d2452b 33.3%,#a8212e 50%,#7d1830 66.7%,#5a1020 83.3%)}
.ge2-scale .ge2-mark{position:absolute;left:0;top:-3px;height:18px;border-right:3px solid #13294b;background:transparent!important;width:0}
.ge2-scale span{position:absolute;top:13px;transform:translateX(-50%);font-size:10.5px;font-weight:700;opacity:.7}
.ge2-btns{margin-top:8px;gap:8px;flex-wrap:wrap}
.ge2-btn{flex:1 1 auto;border:1px solid rgba(19,41,75,.2);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:6px 10px;border-radius:999px;cursor:pointer}
.ge2-nemo{display:flex;gap:10px}.ge2-nemo div{flex:1;display:flex;flex-direction:column;font-size:12px}.ge2-nemo b{font-size:18px}
.ge2-nbar{position:relative;height:10px;border-radius:6px;background:rgba(19,41,75,.12);margin-top:6px}
.ge2-nb1{position:absolute;left:0;top:0;bottom:0;border-radius:6px;background:#ffd166}.ge2-nb2{position:absolute;top:-3px;width:3px;height:16px;background:#13294b;margin-left:-1.5px}
.ge2-ing{display:flex;flex-direction:column;gap:5px}
.ge2-ingi{display:flex;align-items:center;gap:8px;font-size:13px;padding:4px 6px;border-radius:8px}.ge2-ingi i{flex:0 0 14px;height:14px;border-radius:50%}
.ge2-ingi span{flex:1}.ge2-ingi em{font-style:normal;font-weight:900;color:#1f8a4c;opacity:0}.ge2-ingi.ge2-on{background:rgba(31,138,76,.12)}.ge2-ingi.ge2-on em{opacity:1}
body.ge2-on .ps-leaders{opacity:.5}
body.dark-theme .ge2-ctl{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)}
body.dark-theme .ge2-do,body.dark-theme .ge2-read{color:#ffb27a}
body.dark-theme .ge2-btn{background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.2)}
body.dark-theme .ge2-bar i,body.dark-theme .ge2-gauge i,body.dark-theme .ge2-tankbar,body.dark-theme .ge2-nbar{background:rgba(255,255,255,.15)}
body.dark-theme .ge2-nb2,body.dark-theme .ge2-scale .ge2-mark{background:#fff;border-color:#fff}`;document.head.appendChild(s)}
window.gfInteractEarth2={v:1,set:u=>{if(L){L.u=clamp(u,0,1);L.dirty=1}},get:()=>L?{title:L.D.title,u:L.u}:null,L:()=>L,nearestLand:ll=>nearestLand(ll),inAt:(t,ll)=>inAt(t,ll)};
})();
