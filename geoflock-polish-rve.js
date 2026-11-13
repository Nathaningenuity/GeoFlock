/* GeoFlock polish RV-E: a stop-by-stop review of four tours (Antarctica, Time zones, Plate tectonics, Natural hazards),
   looked at on the globe at 1280×860.
   1. Fixes, keyed "tour|stop title" and applied each time the stop opens (psGo is wrapped, as in geoflock-polish-rvc.js,
      and the fixed fields are pinned with non-configurable getters, because several sweep files set framing and card
      side again from their own psGo wrappers). A pin is skipped when another file has already pinned the field.
      - globe framing and card side where the place discussed was under the card, off the edge or round the back;
      - Antarctica, seen whole: a plain globe always puts the South Pole straight below the middle of the globe, so the
        continent sat under the card or off the bottom of the page. These stops now turn the view (the globe's own
        "roll", the same angle its tilt feature uses) so the pole sits to the right of the card, with the prime meridian
        up, as on a usual map of Antarctica. The view eases back when the stop changes;
      - stops marked `exact` are flown to exactly where they are framed (the tour's sideways shift away from the card is
        skipped for them: near the pole that shift turned the globe instead of moving it sideways);
      - facts corrected or brought up to date, each with its source beside it.
   2. Stops you can play with: a layer over the Maps globe and a control block on the card right after the stop's
      headline, with a one-line instruction (pattern of geoflock-interact-world3.js and geoflock-polish-rvc.js):
      - antarctica | "Claims like cake slices": tap a flag to light up its slice; three are stacked on the peninsula,
        and one slice has no flag.
      - antarctica | "Meteorite hunting ground": let the ice flow and watch meteorites gather on the blue ice.
      - antarctica | "Why Antarctica froze": open the two sea gates; the current closes round the continent and the ice
        grows.
      - time | "One clock for China": slide Beijing's clock through a winter morning and watch dawn cross China.
      - time | "Spain’s clock is off": slide the clock until the Sun is highest over Madrid.
      - plates | "Three ways plates meet": the globe turns to a place; is it pulling apart, crashing or sliding past?
      - plates | "Australia is on the move": run the clock forward and watch Australia drift towards Asia.
      - hazards | "The town that ignored the map": follow the mud from Nevado del Ruiz to Armero, minute by minute.
      - hazards | "Bangladesh fights back": guess how many died in each great cyclone, then see the toll fall.
   Everything goes (layer, card block, timers) as soon as the stop changes or the tour ends. Globe view only; Next and
   Back are never blocked; every step is wrapped in try/catch. CSS classes start with "rve-". */
(function(){
"use strict";
if(window.gfPolishRVE)return;
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=n=>Math.round(n).toLocaleString("en-GB");
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const g=()=>{try{return typeof amGlobe!=="undefined"?amGlobe:null}catch(e){return null}};
const NS="http://www.w3.org/2000/svg";
const SET=(S,k,v)=>{try{S[k]=v}catch(e){}if(S[k]!==v)try{const d=Object.getOwnPropertyDescriptor(S,k);if(!d||d.configurable)Object.defineProperty(S,k,{configurable:true,enumerable:true,writable:true,value:v})}catch(e){}};

/* ============================================================ 1. stop fixes
   globe: [lon, lat, zoom]; card: side of the card; roll: degrees the view is turned (see above); exact: fly straight to
   the framing. Checked by screenshot at 1280×860. */
const POLE={globe:[-165,-70,1.35],roll:100,card:"left"};   /* Antarctica whole, right of the card, the peninsula reaching up towards South America */
const FIX={
 /* ---------------- Antarctica */
 "antarctica|Antarctica":POLE,                                  /* the continent was half under the card and off the bottom */
 "antarctica|Bigger than Europe":POLE,
 "antarctica|Most of the world’s fresh water":POLE,
 "antarctica|Coldest, driest, windiest, highest":POLE,          /* the card sat on the right, over the whole continent */
 "antarctica|Claims like cake slices":Object.assign({pinDrop:/^Australia: about 42%$/},POLE), /* the pole, Norway's slice and the UK tag were under the card; the "about 42%" pin sat under the Australia flag tag (the share is in the text) */
 /* tourists: IAATO counted 122,072 visitors in the 2023–24 season, most landing from ships on the peninsula
    (IAATO, "IAATO Antarctic visitor figures 2023-2024"). */
 "antarctica|Who lives there":Object.assign({rep:[["Each summer, tens of thousands of tourists visit by ship, mostly to the peninsula.","Tourists come too: more than 120,000 in the 2023–24 summer, most of them by ship to the peninsula."]]},POLE),
 /* the midge Belgica antarctica is 2 to 6 mm long (Wikipedia, "Belgica antarctica") */
 "antarctica|Life at the edge":Object.assign({rep:[["a wingless midge, about 6 mm long","a wingless midge, at most about 6 mm long"]]},POLE),
 "antarctica|Hidden under the ice":POLE,
 /* "no snow or ice for two million years" could not be sourced; the valleys "are so named because of their extremely low
    humidity and their lack of snow or ice cover", kept bare by dry katabatic winds (Wikipedia, "McMurdo Dry Valleys"). */
 "antarctica|Blood Falls":{globe:[161.6,-77.65,5],exact:1,card:"left",
  rep:[["where no snow or ice has covered the ground for about two million years","where winds so dry and strong blow down from the ice sheet that the valley floors stay almost bare of snow and ice"]]},
 /* the Blood Falls pin sat on top of the pond's own pin (they are about 30 km apart) */
 "antarctica|The pond that never freezes":{globe:[161.2,-77.56,6],exact:1,card:"left",pinDrop:/^Blood Falls$/},
 /* the drill site of Klages et al. 2020 (Nature 580, 81–86), core PS104_20-2, is at 73.57° S, 107.09° W in Pine Island Bay */
 "antarctica|Antarctic rainforest":{phMove:{"Ancient forest soil found here":[-107.09,-73.57]}},
 "antarctica|Why Antarctica froze":{globe:[-140,-60,1.05],roll:120,card:"left"}, /* the Tasmanian Gateway was off the edge */
 "antarctica|Sail into a volcano":{globe:[-60.63,-62.95,6],exact:1,card:"left"},   /* Deception Island was a dot */
 "antarctica|Now explore":POLE,
 /* ---------------- Time zones */
 /* the tour shows the real Sun: open on the evening edge of the day, so day, dusk and night all show */
 "time|Time zones":{globe:()=>dusk(),exact:1,card:"left"},
 "time|Now explore":{globe:()=>dusk(),exact:1,card:"left"},
 /* the southern towns' tags ran off the bottom and under the card */
 "time|The date line":{globe:[-179,-3,1.6],exact:1,card:"left"},
 /* the card sat over the right half of the globe and the map buttons */
 "time|The most time zones":{globe:[-2,15,1],exact:1,card:"left"},
 /* Kaliningrad and Moscow were round the edge, Kamchatka under the card: seen from above the Arctic, all eleven fit */
 "time|Russia: eleven clocks":{globe:[33,77,1.1],roll:10,card:"left"},
 /* the mainland was under the card, New York off screen */
 "time|The United States: six zones":{globe:[-154,57,1.1],exact:1,card:"left"},
 /* sunset times from the NOAA solar calculator equations (sunrise/sunset with 0.833° refraction), 21 June, CDT:
    Nashville 36.16° N 86.78° W about 8:07 p.m., Amarillo 35.22° N 101.83° W about 9:05 p.m. The globe's soft twilight
    (about 13° of sun height either side of the horizon) makes both look dusky at 8:30, so the text says what the
    slider shows rather than "the map shows". */
 "time|When sunset steals your sleep":{rep:[["The map shows 8:30 p.m. in June on Central Time: the Sun has set in Nashville but is still up in Amarillo.","On a June evening on Central Time, the Sun sets in Nashville at about 8:05 p.m., but in Amarillo not until about 9:05 p.m.: slide the time of day and watch the dusk cross the zone."]]},
 "time|Australia: three zones, five in summer":{globe:[116,-33,1.6],exact:1,card:"left"},   /* Brisbane's pin was hidden, Sydney's tag down in the trees */
 "time|One clock for China":{globe:[73,39,1.45],exact:1,card:"left"},                    /* Kashgar and the Afghan border were off the edge */
 /* Boudhanath Stupa is in Kathmandu, 27.7215° N 85.3620° E (Wikipedia, "Boudhanath"); the pin stood near Pokhara */
 "time|Half and quarter hours":{globe:[80,26.5,4.5],exact:1,card:"left",phMove:{"Nepal: Boudhanath Stupa":[85.362,27.7215]}},
 "time|Arizona’s clock doughnut":{globe:[-110.6,35.6,6],exact:1,card:"left",pinDrop:/^Hopi: no DST$/},   /* its tag covered Flagstaff once the drive is drawn; the Hopi outline stays */
 /* Detroit was under the map buttons, Reno at the card's edge. Middle Island, Canada's southernmost point, is at
    41°41′ N (Wikipedia, "Middle Island (Lake Erie)"); all of California's northern border is on 42° N, so it is south of
    the whole border, not "parts" of it. */
 "time|Where north and west fool you":{globe:[-119,42,2],exact:1,card:"left",rep:[["is further south than parts of California’s northern border","is further south than California’s whole northern border, which runs along 42° N"]]},
 "time|Every time zone at once":POLE,
 /* countries that change their clocks and were not lit: Cyprus, Luxembourg, Malta and Kosovo (EU / European summer time),
    Egypt (brought daylight saving back in 2023), Haiti and the Bahamas (US rules). Wikipedia, "Daylight saving time by
    country" (2025). */
 "time|Daylight saving time":{hiAdd:["cy","lu","mt","xk","eg","ht","bs"]},
 /* ---------------- Plate tectonics (framings found by projecting each stop's pins at 1280×860) */
 /* Japan, the Mariana Trench and Fuji were under the card: seen from above the North Pacific, Fuji, the trench,
    Hawaii and Mount St Helens all show */
 "plates|Where the Pacific sinks":{globe:[144,50,1],exact:1,card:"left"},
 "plates|Seashells on Everest":{globe:[77,12,1.8],exact:1,card:"left"},        /* the "80 million years ago" India and its shell sat off the bottom */
 "plates|The Atlantic is growing":{globe:[-48,25,1.15],exact:1,card:"left"},     /* the ridge's tag sat under the Þingvellir photo, the Americas under the card */
 "plates|Hawaii on a conveyor belt":{globe:[-167,15,4],exact:1,card:"left"},    /* the chain was on the globe's edge */
 /* Kīlauea is too far west to show with the other three; St Helens, Soufrière Hills and Chaitén now all show */
 "plates|Why some volcanoes explode":{globe:[-114.5,-4,1],exact:1,card:"left"},
 /* the 2011 earthquake shortened the day by about 1.8 microseconds (NASA JPL, Richard Gross, 2011) */
 "plates|Japan’s four plates":{globe:[129.5,37,3],exact:1,card:"left",rep:[["shortened the day by about a millionth of a second","shortened the day by almost two millionths of a second"]]},
 "plates|The earthquake Japan wrote down":{globe:[147,47,1],exact:1,card:"left"},   /* the Japan end of the tsunami's path was under the card */
 "plates|Los Angeles is coming":{globe:[-126,36,2.6],exact:1,card:"left"},       /* California sat on the globe's left edge behind the card's tags */
 "plates|Australia is on the move":{globe:[118,-22,1.6],exact:1,card:"left"},    /* Western Australia was under the card */
 /* ---------------- Natural hazards */
 "hazards|Fewer deaths than ever":{globe:[70,22,1],exact:1,card:"left"},          /* India, lit, was half under the card */
 "hazards|The 2004 tsunami":{globe:[62,5,1.1],exact:1,card:"left"},               /* Somalia and the far end of the waves were under the card */
 "hazards|Buildings kill, not quakes":{globe:[-72,-14,1],exact:1,card:"right"},   /* the Chile photo was off the bottom */
 "hazards|China’s great floods":{globe:[108,31,2.6],exact:1,card:"left"},         /* Wuhan, Nanjing and Gaoyou were under the map key */
 "hazards|The loudest sound":{globe:[75,-15,1],exact:1,card:"left"},              /* Krakatoa itself was under the card */
 "hazards|Fire seasons":{globe:[-110,45,1],exact:1,card:"left"},                  /* Canada was round the edge; Alberta and Los Angeles hidden */
 "hazards|The silent killer":{globe:[5,36,1.1],exact:1,card:"left"},             /* Paris was under the card, Jacobabad under the map key */
 /* New England's tag floated off the globe's edge: the stop now looks across the Atlantic at New England */
 "hazards|The year without a summer":{globe:[-45,42,1],exact:1,card:"right"},
 "hazards|When mountains fall":{globe:[-76,-3,2.4],exact:1,card:"left"},          /* Yungay sat at the bottom, Peru's tag in the trees */
 /* Lituya Bay is 11 km long: the globe's zoom (capped at 6 by the tours) showed a dot, so the stop turns in closer */
 "hazards|The tallest wave ever":{globe:[-137.55,58.65,6],exact:1,card:"left",zoomTo:[-137.55,58.66,25]}
};
/* the Sun's longitude now, and a view just east of it (afternoon to night), for the Time zones tour's first stop */
function dusk(){let lon=60;try{const s=typeof gfSun==="function"?gfSun():null;if(s)lon=s[0]+62}catch(e){}lon=((lon+540)%360)-180;return[+lon.toFixed(1),12,1]}
/* framing is pinned: several sweep files set a stop's globe or card side from their own psGo wrappers, some of them
   running after this one, so a plain assignment would be undone. The pinned field ignores later writes. A field another
   file has already pinned (non-configurable) is left alone. */
function pin(S,k,v){try{const d=Object.getOwnPropertyDescriptor(S,k);if(d&&d.get&&d.get._rve){d.get._rve.v=v;return}
 if(d&&!d.configurable)return;
 const box={v},get=()=>{const x=typeof box.v==="function"?box.v():box.v;return Array.isArray(x)?x.slice():x};get._rve=box;Object.defineProperty(S,k,{configurable:false,enumerable:true,get,set(){}})}catch(e){SET(S,k,v)}}
const clean=s=>String(s==null?"":s).replace(/​/g,"").trim();
function applyFix(S,tour,soft){try{if(!S)return;const X=FIX[tour+"|"+S.title];if(!X)return;
 const put=soft?(S,k,v)=>{const d=Object.getOwnPropertyDescriptor(S,k);if(!(d&&d.get&&d.get._rve))SET(S,k,typeof v==="function"?v():v)}:pin;
 if(X.hiAdd&&Array.isArray(S.hi)){const add=X.hiAdd.filter(c=>!S.hi.includes(c));if(add.length)SET(S,"hi",S.hi.concat(add))}
 if(X.globe)put(S,"globe",X.globe);if(X.card)put(S,"card",X.card);
 if(X.pinDrop&&Array.isArray(S.pins)){const P=S.pins.filter(q=>!(q&&X.pinDrop.test(clean(q[1]))));if(P.length!==S.pins.length)SET(S,"pins",P)}
 if(X.phMove&&Array.isArray(S.phPins))S.phPins.forEach(q=>{const to=q&&X.phMove[clean(q.label)];if(to)try{q.at=to.slice()}catch(e){}});
 (X.rep||[]).forEach(([a,b])=>["stat","body","more"].forEach(k=>{if(typeof S[k]==="string"&&S[k].includes(a))SET(S,k,S[k].split(a).join(b))}))}catch(e){}}
function curFix(){try{if(typeof ps==="undefined"||!ps||!ps.tour)return null;const S=psSteps()[ps.i];return S?FIX[ps.tour+"|"+S.title]||null:null}catch(e){return null}}
function wrapGo(){if(typeof psGo!=="function")return false;if(psGo._rve)return true;const _g=psGo;
 psGo=function(i){try{const L=psSteps(),S=L[Math.max(0,Math.min(L.length-1,i))];applyFix(S,ps&&ps.tour)}catch(e){}return _g.apply(this,arguments)};psGo._rve=1;return true}
/* stops framed `exact` (and the turned Antarctica views) skip the sideways shift away from the card */
function wrapFly(){if(typeof psFlyGlobe!=="function")return false;if(psFlyGlobe._rve)return true;const _f=psFlyGlobe;
 psFlyGlobe=function(){const X=curFix();if(X&&(X.exact||X.roll!=null)&&typeof psCardOver==="function"){const o=psCardOver;try{psCardOver=()=>0}catch(e){}
   try{return _f.apply(this,arguments)}finally{try{psCardOver=o}catch(e){}}}return _f.apply(this,arguments)};psFlyGlobe._rve=1;return true}
const TOURS=["antarctica","time","plates","hazards"];
function applyAll(){try{for(const t of TOURS){const T=PS_TOURS[t];if(T&&T.steps)T.steps.forEach(S=>applyFix(S,t,1))}}catch(e){}}
{let n=0;const t=setInterval(()=>{const ok=wrapGo()&&wrapFly();if(ok)applyAll();if(ok&&n>20||++n>90)clearInterval(t)},500)}
/* the first stop of a tour is shown without psGo: fix it there too */
setInterval(()=>{try{if(typeof ps!=="undefined"&&ps&&TOURS.includes(ps.tour)&&ps._rveT!==ps.tour+ps.i){ps._rveT=ps.tour+ps.i;applyFix(psSteps()[ps.i],ps.tour)}}catch(e){}},400);

/* ---- a stop whose place is tiny turns the globe in closer once the tour's own move has settled */
let zLast="";setInterval(()=>{try{if(typeof ps==="undefined"||!ps||!ps.tour||ps.mode!=="globe")return;const k=ps.tour+"|"+ps.i;if(k===zLast)return;zLast=k;const X=curFix();if(!X||!X.zoomTo)return;
 setTimeout(()=>{try{if(!ps||ps.tour+"|"+ps.i!==k)return;const G=g();if(!G||!G.lookAt)return;const t=X.zoomTo,r0=[-G.rot[0],-G.rot[1]],z0=G.zoom,T0=performance.now(),ip=d3.geoInterpolate(r0,[t[0],t[1]]);
  const step=()=>{if(!ps||ps.tour+"|"+ps.i!==k)return;const f=Math.min(1,(performance.now()-T0)/1400),e=f<.5?2*f*f:1-Math.pow(-2*f+2,2)/2,c=ip(e);try{G.lookAt(c[0],c[1],z0*Math.pow(t[2]/z0,e))}catch(err){return}if(f<1)requestAnimationFrame(step)};step()}catch(e){}},1700)}catch(e){}},300);

/* ---- the turned view: the globe's roll eases to the stop's angle, and back to the globe's own when the stop changes */
const RO={k:0,v:0,want:null,raf:0};
function rollPatch(G){if(!G||G._rveRoll)return;const base=G.roll;G._rveRoll=1;
 G.roll=function(){let b=0;try{b=base.call(this)}catch(e){}return RO.k>0?b+(RO.v-b)*RO.k:b}}
function rollTick(){const G=g();if(!G)return;rollPatch(G);let want=null;try{const X=curFix();if(X&&X.roll!=null&&ps.mode==="globe"&&ps.g===G)want=X.roll}catch(e){}
 if(want!=null)RO.v=want;const to=want!=null?1:0;if(RO.k===to||RO.raf)return;
 const k0=RO.k,t0=performance.now(),dur=1100;const step=()=>{const f=Math.min(1,(performance.now()-t0)/dur),e=f<.5?2*f*f:1-Math.pow(-2*f+2,2)/2;RO.k=k0+(to-k0)*e;try{G.render()}catch(err){}
  if(f<1)RO.raf=requestAnimationFrame(step);else{RO.raf=0;RO.k=to}};RO.raf=requestAnimationFrame(step)}
setInterval(()=>{try{rollTick()}catch(e){}},250);

/* ============================================================ 2. interactive stops: shared helpers */
function proj(L,ll,card){const G=g();if(!G||!ll)return null;try{const P=G.projection();if(!G._flat){const r=P.rotate(),c=[-r[0],-r[1]];if(d3.geoDistance(c,ll)>Math.PI/2-.02)return null}
 const s=P(ll);if(!s||!isFinite(s[0]))return null;if(!G._flat){const z=G.size();if(Math.hypot(s[0]-z.w/2,s[1]-z.h/2)>z.r+1)return null}const x=s[0]+L.ox,y=s[1]+L.oy,B=L.cb;
 if(card&&B&&x>B[0]&&x<B[2]&&y>B[1]&&y<B[3])return null;return[x,y]}catch(e){return null}}
function geoD(geom){const G=g();try{return d3.geoPath(G.projection())(geom)||""}catch(e){return""}}
function quiet(el){["mousedown","touchstart","click","dblclick","wheel"].forEach(t=>el.addEventListener(t,e=>e.stopPropagation(),{passive:t!=="mousedown"}))}
function svgEl(parent,tag,attrs){const e=document.createElementNS(NS,tag);for(const k in attrs||{})e.setAttribute(k,attrs[k]);parent.appendChild(e);return e}
function tag(L,cls){const d=document.createElement("div");d.className="rve-tag "+(cls||"");L.el.appendChild(d);return d}
function putTag(L,d,q,html,dy){if(!q||html==null){d.style.display="none";return}d.style.display="";if(d._h!==html){d.innerHTML=html;d._h=html}d.style.left=q[0]+"px";d.style.top=(q[1]+(dy||0))+"px";
 /* a tag that would fall on the card slides sideways off it, if there is room; otherwise it hides */
 let hide=false;try{const B=L.cb;if(B){const r=d.getBoundingClientRect(),h=L.host.getBoundingClientRect(),x0=r.left-h.left,y0=r.top-h.top;
  if(!(x0+r.width<B[0]||x0>B[2]||y0+r.height<B[1]||y0>B[3])){const toR=B[2]+4-x0,toL=B[0]-4-(x0+r.width);
   const dx=Math.abs(toR)<=Math.abs(toL)&&x0+toR+r.width<h.width-4||x0+toL<4?toR:toL;
   if(Math.abs(dx)<r.width+60&&x0+dx>=4&&x0+dx+r.width<=h.width-4)d.style.left=(q[0]+dx)+"px";else hide=true}}}catch(e){}
 d.style.visibility=hide?"hidden":""}
function say(L,head,text){const c=L.card;if(!c)return;const k=head+"|"+text;if(L._said===k)return;L._said=k;const e=c.querySelector(".rve-ep");if(!e)return;
 e.innerHTML=(head?"<b>"+head+"</b>":"")+"<span>"+text+"</span>";e.classList.remove("rve-new");void e.offsetWidth;e.classList.add("rve-new")}
const setHTML=(el,html)=>{if(el&&el._h!==html){el.innerHTML=html;el._h=html}};
function feat(code){try{return projFeatures().find(f=>f.properties&&String(f.properties.c).toLowerCase()===code)||null}catch(e){return null}}
const ring=c=>{const r=c.slice();const a=r[0],b=r[r.length-1];if(a[0]!==b[0]||a[1]!==b[1])r.push(a);return r};
const polyGeo=c=>{const r=ring(c);let p={type:"Polygon",coordinates:[r]};if(d3.geoArea(p)>2*Math.PI)p={type:"Polygon",coordinates:[r.slice().reverse()]};return p};
/* turn the globe smoothly so a place shows beside the card, not under it */
function turnTo(L,ll,zoom){const G=g();if(!G||!G.lookAt||G._flat)return;let side=0;try{const c=ps.card.getBoundingClientRect(),h=L.host.getBoundingClientRect();side=(c.left+c.right)/2>(h.left+h.right)/2?1:-1}catch(e){}
 const z=zoom||G.zoom||1,t=[ll[0]+side*26/z/Math.max(.5,Math.cos(ll[1]*Math.PI/180)),clamp(ll[1],-70,70)],r0=[-G.rot[0],-G.rot[1]],z0=G.zoom,T0=performance.now(),ip=d3.geoInterpolate(r0,t),D=L.D;
 const step=()=>{if(!L||L.D!==D||!L.el.isConnected)return;const f=Math.min(1,(performance.now()-T0)/1100),e=f<.5?2*f*f:1-Math.pow(-2*f+2,2)/2,c=ip(e);try{G.lookAt(c[0],c[1],z0+(z-z0)*e)}catch(err){return}L.dirty=1;if(f<1)requestAnimationFrame(step)};step()}
/* a sector of the Southern Ocean and Antarctica, from longitude a east to b, south of `lat` */
function sector(a,b,lat){let B=b;if(B<a)B+=360;const pts=[];for(let x=a;x<B;x+=2)pts.push([x>180?x-360:x,lat]);pts.push([B>180?B-360:B,lat]);
 pts.push([B>180?B-360:B,-89.999]);pts.push([a,-89.999]);return polyGeo(pts)}
function arrowMarker(L,id,col){const d=svgEl(L.root,"defs",{});const m=svgEl(d,"marker",{id,viewBox:"0 0 10 10",refX:"6",refY:"5",markerWidth:"4",markerHeight:"4",orient:"auto-start-reverse"});
 svgEl(m,"path",{d:"M0 0L10 5L0 10z",fill:col});return"url(#"+id+")"}

/* ============================================================ A. Claims like cake slices
   Wikipedia, "Territorial claims in Antarctica": Argentina 25° W–74° W; Australia 44°38′ E–136°11′ E and 142°02′ E–160° E;
   Chile 53° W–90° W; France (Adélie Land) 136°11′ E–142°02′ E; New Zealand (Ross Dependency) 160° E–150° W; Norway
   (Queen Maud Land) 20° W–44°38′ E, with no southern limit stated; United Kingdom 20° W–80° W; Marie Byrd Land,
   90° W–150° W, is unclaimed. All the claims are south of 60° S, where the Antarctic Treaty applies. */
const CLAIM=[{k:"ar",n:"Argentina",f:"🇦🇷",c:"#4f9fdc",s:[[-74,-25]]},{k:"au",n:"Australia",f:"🇦🇺",c:"#2e9d5b",s:[[44.63,136.18],[142.03,160]]},
 {k:"cl",n:"Chile",f:"🇨🇱",c:"#d52b1e",s:[[-90,-53]]},{k:"fr",n:"France",f:"🇫🇷",c:"#24479b",s:[[136.18,142.03]]},
 {k:"nz",n:"New Zealand",f:"🇳🇿",c:"#13294b",s:[[160,-150]]},{k:"no",n:"Norway",f:"🇳🇴",c:"#e07a1f",s:[[-20,44.63]]},
 {k:"gb",n:"UK",f:"🇬🇧",c:"#7b4fb3",s:[[-80,-20]]}];
const NOBODY={k:"none",n:"Nobody",s:[[-150,-90]]};
const lonTxt=x=>Math.abs(x).toFixed(0)+"° "+(x<0?"W":"E");
const CLAIMS={tour:"antarctica",title:"Claims like cake slices",
 tip:"Tap the flags to light up each slice. Where are three slices stacked? Which slice has no flag?",
 card:()=>'<div class="rve-row rve-btns">'+CLAIM.map(c=>'<button type="button" class="rve-btn rve-k" data-k="'+c.k+'">'+c.f+" "+esc(c.n)+"</button>").join("")+'<button type="button" class="rve-btn rve-k" data-k="none">🏳 Nobody?</button></div><div class="rve-score"></div>',
 init(L){L.on={};L.t=0;L.last=null;const G=svgEl(L.geo,"g",{});L.ws=[];
  CLAIM.concat([NOBODY]).forEach(c=>c.s.forEach(s=>{const p=svgEl(G,"path",{class:"rve-wedge"});p.style.fill=c.c||"#fff";p.style.stroke=c.c||"#fff";L.ws.push({c,geo:sector(s[0],s[1],-60),p})}));
  L.tags=CLAIM.concat([NOBODY]).map(()=>tag(L,"rve-small"))},
 wire(L){L.card.querySelectorAll(".rve-k").forEach(b=>b.onclick=()=>{const k=b.dataset.k;L.on[k]=!L.on[k];L.last=L.on[k]?k:null;L._said="";L.dirty=1})},
 tick(L,dt){L.t+=dt;if(L.on.none){const w=L.ws.find(w=>w.c.k==="none");if(w)w.p.style.fillOpacity=(.45+.3*Math.sin(L.t*4)).toFixed(2)}},
 draw(L){L.ws.forEach(w=>{const on=!!L.on[w.c.k];w.p.setAttribute("d",on?geoD(w.geo):"");if(w.c.k==="none"){w.p.style.fill="#fff";w.p.style.stroke="#13294b";w.p.style.strokeDasharray="6 4"}else w.p.style.fillOpacity=".38"});
  CLAIM.concat([NOBODY]).forEach((c,i)=>{const s=c.s[0];let a=s[0],b=s[1];if(b<a)b+=360;let m=(a+b)/2;if(m>180)m-=360;const lat=c.k==="none"?-77:c.k==="fr"?-69:-74+((i%3)-1)*3;
   putTag(L,L.tags[i],null,null)});   /* the stop already tags each claimant, and Marie Byrd Land */
  const nOn=CLAIM.filter(c=>L.on[c.k]).length,pen=L.on.ar&&L.on.cl&&L.on.gb;
  if(L.card){L.card.querySelectorAll(".rve-k").forEach(b=>b.classList.toggle("rve-on",!!L.on[b.dataset.k]));
   setHTML(L.card.querySelector(".rve-score"),'<span><b>'+nOn+"</b> of 7 claims lit"+(L.on.none?" · plus the slice nobody claims":"")+"</span>")}
  const c=CLAIM.find(x=>x.k===L.last);
  if(pen&&(L.last==="ar"||L.last==="cl"||L.last==="gb"))say(L,"Three claims stacked on one peninsula","Argentina, Chile and the UK all claim the Antarctic Peninsula, the part nearest South America. The 1959 Antarctic Treaty froze every claim, so none of them has had to back down, and none can act on its claim either.");
  else if(L.last==="none")say(L,"Marie Byrd Land: nobody’s","From 90° W to 150° W, no country has ever made a claim. It is the largest piece of land on Earth that nobody claims: remote, icy, and left over when the treaty froze the claims in 1959.");
  else if(c&&c.k==="au")say(L,"Australia: the biggest slice","About 42% of the continent, in two pieces, from "+lonTxt(44.63)+" to "+lonTxt(160)+". France’s thin slice, Adélie Land, splits it in two.");
  else if(c&&c.k==="fr")say(L,"France: Adélie Land","A thin wedge between "+lonTxt(136.18)+" and "+lonTxt(142.03)+", cutting Australia’s claim in two. It was named after the wife of the French explorer who reached its coast in 1840.");
  else if(c&&c.k==="no")say(L,"Norway: Queen Maud Land","From "+lonTxt(-20)+" to "+lonTxt(44.63)+". Norway never said how far south its slice goes; here it is drawn to the pole like the others.");
  else if(c&&c.k==="nz")say(L,"New Zealand: the Ross Dependency","From "+lonTxt(160)+" across the date line to "+lonTxt(-150)+", taking in the Ross Sea and the biggest station, McMurdo (which is American).");
  else if(c)say(L,c.f+" "+c.n+": "+lonTxt(c.s[0][0])+" to "+lonTxt(c.s[0][1]),"Now light up the other two countries that claim the Antarctic Peninsula: the slices overlap there.");
  else if(nOn===7&&!L.on.none)say(L,"Seven claims, and still a gap","All seven are lit. One slice of the continent has no colour at all. Tap “Nobody?”.");
  else say(L,"Seven countries, seven slices","Each slice runs from the coast to the South Pole between two lines of longitude. Tap the flags and see where they fit, overlap or leave a gap.")}};

/* ============================================================ B. Meteorite hunting ground: the blue-ice trap
   How meteorite stranding works (NASA / ANSMET, "The Antarctic Search for Meteorites"; Wikipedia, "Blue ice (glacial)"):
   meteorites that land on the ice sheet are buried by snow and carried by the slowly flowing ice; where mountains block
   the flow, the ice is pushed up and dry winds strip it away (sublimation), so meteorites from a wide area come back to
   the surface and gather on patches of bare blue ice. The drawing is a sketch, not to scale. */
const METEOR={tour:"antarctica",title:"Meteorite hunting ground",cardOnly:1,
 tip:"Press ▶ and let the ice flow for a few hundred thousand years. Where do the meteorites end up?",
 card:()=>'<svg class="rve-met" viewBox="0 0 320 150" role="img" aria-label="A slice through the ice sheet: meteorites ride the ice to the mountains"><defs><linearGradient id="rveIce" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f9fd"/><stop offset="1" stop-color="#b9d7ee"/></linearGradient></defs>'+
  '<path class="rve-met-ice" fill="url(#rveIce)"/><path class="rve-met-blue"/><path class="rve-met-rock"/><g class="rve-met-flow"></g><g class="rve-met-dots"></g>'+
  '<text x="34" y="20" class="rve-met-t">snow falls here</text><text x="214" y="34" class="rve-met-t">wind strips the ice</text><text x="276" y="140" class="rve-met-t" text-anchor="middle">mountains</text><text x="216" y="104" class="rve-met-t rve-met-bt" text-anchor="middle">blue ice</text></svg>'+
  '<div class="rve-row"><button type="button" class="rve-play" aria-label="Play">▶</button><div class="rve-read rve-kyr"></div><button type="button" class="rve-btn rve-reset" aria-label="Start again">↺</button></div>',
 init(L){L.run=false;L.T=0;L.m=[];L.seed=1;L.next=0},
 surf(x){return x<200?40+x*.16:x<238?72+(x-200)*.55:x<250?93-(x-238)*1.5:200},  /* the ice surface, sloping down to the blue-ice patch */
 bed(x){return x<250?128:128-(x-250)*1.6},
 wire(L){const c=L.card,b=c.querySelector(".rve-play"),r=c.querySelector(".rve-reset"),svg=c.querySelector(".rve-met"),D=this;
  const xs=[];for(let x=0;x<=320;x+=4)xs.push(x);
  svg.querySelector(".rve-met-ice").setAttribute("d","M0 "+D.surf(0)+xs.filter(x=>x<=250).map(x=>"L"+x+" "+D.surf(x).toFixed(1)).join("")+"L250 128L0 128Z");
  svg.querySelector(".rve-met-blue").setAttribute("d","M200 72"+xs.filter(x=>x>=200&&x<=248).map(x=>"L"+x+" "+D.surf(x).toFixed(1)).join("")+"L250 93L250 98L200 77Z");
  svg.querySelector(".rve-met-rock").setAttribute("d","M0 128L250 128L262 96L276 60L290 74L300 52L320 66L320 150L0 150Z");
  const fl=svg.querySelector(".rve-met-flow");[[40,0],[110,0],[170,0]].forEach(([x])=>{const y=D.surf(x)+22;const p=document.createElementNS(NS,"path");p.setAttribute("d","M"+x+" "+y+"l26 4");p.setAttribute("class","rve-met-arr");fl.appendChild(p)});
  {const p=document.createElementNS(NS,"path");p.setAttribute("d","M222 112q14 -6 16 -22");p.setAttribute("class","rve-met-arr");fl.appendChild(p)}
  b.onclick=()=>{L.run=!L.run;b.textContent=L.run?"❚❚":"▶";b.setAttribute("aria-label",L.run?"Pause":"Play");L._said=""};
  r.onclick=()=>{L.run=false;b.textContent="▶";L.T=0;L.m=[];L.next=0;L.seed=1;L._said="";L.dirty=1};quiet(svg)},
 rnd(L){L.seed=(L.seed*16807)%2147483647;return L.seed/2147483647},
 tick(L,dt){if(!L.run)return;L.T+=dt;L.dirty=1;
  /* one meteorite lands about every 0.7 s, anywhere on the ice between the coast of the drawing and the blue ice */
  if(L.T>L.next){L.next=L.T+.5;if(L.m.filter(m=>!m.done).length<14)L.m.push({x:8+this.rnd(L)*180,d:0,fall:1,f:.25+this.rnd(L)*.6})}
  L.m.forEach(m=>{if(m.fall>0){m.fall=Math.max(0,m.fall-dt*2.2);return}if(m.done)return;
   const v=m.x<200?26:14;m.x+=v*dt;
   if(m.x<200)m.d=Math.min(m.f,m.d+dt*.2);else m.d=Math.max(0,m.d-dt*.8*(1+m.f));    /* buried by snow, then lifted to the surface */
   if(m.x>=200&&m.d<=0.001){m.done=1;m.x=Math.min(m.x,244)}})},
 draw(L){const c=L.card;if(!c)return;const g0=c.querySelector(".rve-met-dots");if(!g0)return;const D=this;
  let h="";L.m.forEach(m=>{const s=D.surf(m.x),bot=D.bed(m.x),y=m.done?s-1.5:s+(bot-s)*m.d*.85;
   if(m.fall>0){const y0=s-60*m.fall;h+='<line x1="'+(m.x-8*m.fall).toFixed(1)+'" y1="'+(y0-12).toFixed(1)+'" x2="'+m.x.toFixed(1)+'" y2="'+y0.toFixed(1)+'" class="rve-met-trail"/><circle cx="'+m.x.toFixed(1)+'" cy="'+y0.toFixed(1)+'" r="3" class="rve-met-m"/>'}
   else h+='<circle cx="'+m.x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="3" class="rve-met-m'+(m.done?" rve-met-found":"")+'"/>'});
  if(g0._h!==h){g0.innerHTML=h;g0._h=h}
  const found=L.m.filter(m=>m.done).length,kyr=Math.round(L.T*20);
  const r=c.querySelector(".rve-kyr");const s=(L.T>0?"about "+fmt(kyr)+",000 years · ":"")+"<b>"+found+"</b> on the blue ice";setHTML(r,s);
  if(found>=8)say(L,"Gathered on the blue ice","Meteorites that landed all over the ice sheet were buried, carried for thousands of years, then pushed up where the mountains block the ice. The wind strips the ice away and leaves them lying together on bare blue ice: that is where hunters look.");
  else if(L.T>4)say(L,"Buried, then carried","Snow buries each one deeper, and the ice sheet slowly carries it towards the mountains. Keep watching the blue patch.");
  else if(!L.run&&L.T===0)say(L,"Meteorites fall everywhere","They land all over Antarctica, then vanish under the snow. So why do hunters find so many in a few places? Press ▶.");}};

/* ============================================================ C. Why Antarctica froze: open the gates
   The stop's own story (sources it gives: the Drake Passage and the Tasmanian Gateway opened around 34 million years
   ago, and the Antarctic Circumpolar Current then circled the continent; Wikipedia, "Antarctic Circumpolar Current",
   "Drake Passage" and "Eocene–Oligocene extinction event"). Falling CO₂ mattered too, as the stop says: the panel says so.
   The gates and the current are drawn as sketches on today's map. */
const GATES={drake:{n:"Drake Passage",bridge:[[-67.6,-55.4],[-63,-59.5],[-58.3,-63]],tag:[-63,-59.6]},
 tas:{n:"Tasmanian Gateway",bridge:[[146.8,-43.7],[146.5,-55],[145,-66.2]],tag:[146.5,-54]}};
const FROZE={tour:"antarctica",title:"Why Antarctica froze",
 tip:"Open both sea gates. What happens to the current, and to Antarctica?",
 card:()=>'<div class="rve-row rve-btns"><button type="button" class="rve-btn rve-gate" data-k="tas">🌊 Open the Tasmanian Gateway</button><button type="button" class="rve-btn rve-gate" data-k="drake">🌊 Open the Drake Passage</button><button type="button" class="rve-btn rve-reset" aria-label="Close both again">↺</button></div><div class="rve-score"></div>',
 init(L){L.open={};L.ice=0;L.t=0;const G=L.geo;
  L.land=svgEl(G,"path",{class:"rve-aq"});
  L.warm=svgEl(G,"g",{});L.cold=svgEl(G,"path",{class:"rve-acc"});L.mk=arrowMarker(L,"rveArrW","#e2672a");L.mkC=arrowMarker(L,"rveArrC","#9fd8ff");L.cold.setAttribute("marker-end",L.mkC);
  L.br={};Object.keys(GATES).forEach(k=>{L.br[k]=svgEl(G,"path",{class:"rve-bridge"})});
  L.tags={};Object.keys(GATES).forEach(k=>L.tags[k]=tag(L,"rve-small"));L.iceT=tag(L,"rve-bub");
  L.warmP=[[-40,-30,-68],[-90,-38,-66],[100,-36,-63],[170,-40,-71],[30,-34,-66]].map(()=>{const p=svgEl(L.warm,"path",{class:"rve-warm"});p.setAttribute("marker-end",L.mk);return p})},
 wire(L){const c=L.card;c.querySelectorAll(".rve-gate").forEach(b=>b.onclick=()=>{L.open[b.dataset.k]=!L.open[b.dataset.k];L._said="";L.dirty=1});
  c.querySelector(".rve-reset").onclick=()=>{L.open={};L._said="";L.dirty=1}},
 tick(L,dt){L.t+=dt;const both=L.open.drake&&L.open.tas;const to=both?1:0;if(L.ice!==to){L.ice=both?Math.min(1,L.ice+dt/4):Math.max(0,L.ice-dt/1.5);L.dirty=1}
  try{L.cold.style.strokeDashoffset=(-L.t*28).toFixed(1);L.warm.style.strokeDashoffset=(-L.t*20).toFixed(1)}catch(e){}},
 draw(L){const both=L.open.drake&&L.open.tas;
  try{const f=feat("aq");L.land.setAttribute("d",f?geoD(f):"");const k=L.ice;L.land.style.fill=k>.5?"#f4f9fd":"#4f8f3a";L.land.style.fillOpacity=(k>.5?(k-.5)*1.6:.62*(1-2*k)).toFixed(2)}catch(e){}
  /* the current: a full ring when both gates are open, otherwise broken at each closed gate */
  const lat=-58.5,cut=[];if(!L.open.drake)cut.push(-63);if(!L.open.tas)cut.push(146.5);let segs=[];
  if(!cut.length){const pts=[];for(let x=-180;x<=176;x+=4)pts.push([x,lat]);pts.push([179.9,lat]);segs=[pts.slice(0,46),pts.slice(45)]}
  else{const c=cut.map(x=>(x+360)%360).sort((a,b)=>a-b);for(let i=0;i<c.length;i++){let a=c[i]+6,b=(i+1<c.length?c[i+1]:c[0]+360)-6;const pts=[];for(let x=a;x<=b;x+=4)pts.push([((x+180)%360)-180,lat]);pts.push([((b+180)%360)-180,lat]);segs.push(pts)}}
  L.cold.setAttribute("d",segs.map(s=>geoD({type:"LineString",coordinates:s})).join(""));L.cold.style.opacity=both?"1":".45";
  /* warm water reaches the coast while a gate is closed */
  const WARM=[[-40,-30,-68],[-90,-38,-66],[100,-36,-63],[170,-40,-71],[30,-34,-66]];
  L.warmP.forEach((p,i)=>{const w=WARM[i];p.setAttribute("d",!both?geoD({type:"LineString",coordinates:[[w[0],w[1]],[w[0]+6,(w[1]+w[2])/2],[w[0],w[2]]]}):"")});
  Object.keys(GATES).forEach(k=>{const o=L.open[k];L.br[k].setAttribute("d",o?"":geoD({type:"LineString",coordinates:GATES[k].bridge}));
   putTag(L,L.tags[k],proj(L,GATES[k].tag,1),(o?"🌊 open: ":"🚧 closed: ")+GATES[k].n,-26)});
  putTag(L,L.iceT,proj(L,[40,-80],1),L.ice>=1?"❄ An ice sheet grows":L.ice>0?"❄ Cooling…":"🌳 Green and wooded",-14);
  if(L.card){L.card.querySelectorAll(".rve-gate").forEach(b=>{const o=!!L.open[b.dataset.k];b.classList.toggle("rve-on",o);b.textContent=(o?"🚧 Close the ":"🌊 Open the ")+GATES[b.dataset.k].n});
   setHTML(L.card.querySelector(".rve-score"),'<span class="rve-chip" style="background:'+(both?"#2a78d0":"#e2672a")+'">Current: '+(both?"circles the continent":"blocked")+'</span><span class="rve-chip" style="background:'+(L.ice>=1?"#5b8db8":"#4f8f3a")+'">Antarctica: '+(L.ice>=1?"icy":L.ice>0?"cooling":"green")+"</span>")}
  if(both&&L.ice>=1)say(L,"Cut off, and frozen","With both gates open, the current can run all the way round with nothing in its way. It walls Antarctica off from warm water from the north, the continent cools, and snow piles up into an ice sheet that never melts. (Falling carbon dioxide in the air helped too.)");
  else if(both)say(L,"The ring is closed…","The current now circles the whole continent. Watch Antarctica.");
  else if(L.open.drake||L.open.tas)say(L,"One gate open, one still shut","The current still runs into land and is turned north, and warm water still swirls down to Antarctica’s coast. Open the other gate.");
  else say(L,"Both gates shut","South America and Australia still touch Antarctica, or nearly. Ocean currents bump into them and carry warm water south to its coast (orange), so Antarctica stays green.")}};

/* ============================================================ D. The most time zones: collect France's twelve clocks
   Wikipedia, "Time in France" (standard time, without summer time): French Polynesia UTC−10 (Tahiti), the Marquesas
   UTC−9:30, the Gambier Islands UTC−9, Clipperton UTC−8, Guadeloupe, Martinique, Saint-Barthélemy and Saint-Martin
   UTC−4, French Guiana and Saint-Pierre-et-Miquelon UTC−3, metropolitan France UTC+1, Mayotte UTC+3, Réunion UTC+4,
   the Kerguelen Islands (French Southern Lands) UTC+5, New Caledonia UTC+11, Wallis and Futuna UTC+12: twelve zones;
   Adélie Land in Antarctica (UTC+10) makes thirteen. Places: each zone's main town or island. */
const FRZ=[{o:"−10",n:"Tahiti",ll:[-149.57,-17.54]},{o:"−9:30",n:"Marquesas Islands",ll:[-140.1,-8.86]},{o:"−9",n:"Gambier Islands",ll:[-134.97,-23.12]},
 {o:"−8",n:"Clipperton Island",ll:[-109.21,10.3]},{o:"−4",n:"Martinique and Guadeloupe",ll:[-61.3,15.3]},{o:"−3",n:"French Guiana",ll:[-52.33,4.94]},
 {o:"+1",n:"Paris",ll:[2.35,48.86]},{o:"+3",n:"Mayotte",ll:[45.23,-12.78]},{o:"+4",n:"Réunion",ll:[55.53,-21.11]},
 {o:"+5",n:"Kerguelen Islands",ll:[70.2,-49.35]},{o:"+11",n:"New Caledonia",ll:[166.46,-22.27]},{o:"+12",n:"Wallis and Futuna",ll:[-176.2,-13.28]}];
const FRANCE={tour:"time",title:"The most time zones",
 tip:"Collect France’s clocks: tap a time zone and the globe flies there. Can you find all twelve?",
 card:()=>'<div class="rve-row rve-btns rve-zones">'+FRZ.map((z,i)=>'<button type="button" class="rve-btn rve-z" data-i="'+i+'">UTC'+z.o+"</button>").join("")+'</div><div class="rve-score"></div>',
 init(L){L.got={};L.cur=-1;L.mk=FRZ.map(()=>{const c=svgEl(L.svg,"circle",{r:"6",class:"rve-frdot"});c.style.display="none";return c});L.tags=FRZ.map(()=>tag(L,"rve-small"));L.bub=tag(L,"rve-bub")},
 wire(L){L.card.querySelectorAll(".rve-z").forEach(b=>b.onclick=()=>{const i=+b.dataset.i;L.got[i]=1;L.cur=i;L._said="";L.dirty=1;turnTo(L,FRZ[i].ll,FRZ[i].n==="Paris"?1.6:1.45)})},
 draw(L){const n=Object.keys(L.got).length;
  FRZ.forEach((z,i)=>{const q=L.got[i]?proj(L,z.ll):null,c=L.mk[i];if(q){c.style.display="";c.setAttribute("cx",q[0].toFixed(1));c.setAttribute("cy",q[1].toFixed(1))}else c.style.display="none";
   putTag(L,L.tags[i],L.got[i]&&i!==L.cur?proj(L,z.ll,1):null,"🇫🇷 UTC"+z.o,9)});
  const z=FRZ[L.cur];putTag(L,L.bub,z?proj(L,z.ll,1):null,z?"🇫🇷 "+esc(z.n)+": UTC"+z.o:null,-14);
  if(L.card){L.card.querySelectorAll(".rve-z").forEach(b=>{b.classList.toggle("rve-on",!!L.got[+b.dataset.i]);b.classList.toggle("rve-at",+b.dataset.i===L.cur)});
   setHTML(L.card.querySelector(".rve-score"),'<div class="rve-dots">'+FRZ.map((x,i)=>'<i class="'+(L.got[i]?"rve-ok":"")+(i===L.cur?" rve-at":"")+'" title="UTC'+x.o+'"></i>').join("")+"</div><span><b>"+n+"</b> of 12 clocks</span>")}
  if(n===12)say(L,"Twelve clocks: more than any other country","From Tahiti (UTC−10) to Wallis and Futuna (UTC+12), France’s clocks are 22 hours apart. When it is breakfast time in Paris, it is evening in New Caledonia and the middle of the night before in Tahiti. Count France’s base in Antarctica, Adélie Land (UTC+10), and it has thirteen.");
  else if(z)say(L,z.n+": UTC"+z.o,z.n==="Paris"?"Mainland France, an hour ahead of London.":z.n==="Marquesas Islands"?"A half-hour zone, in the middle of the Pacific. All these islands are part of France, with French schools, euros or Pacific francs, and votes in French elections.":z.n==="Clipperton Island"?"A tiny, empty coral atoll off Mexico. Nobody lives there, but it still has a time zone.":(()=>{const h=parseFloat(z.o.replace("−","-").replace(":30",".5"))-1;return"Part of France, "+Math.abs(h)+" hours "+(h<0?"behind":"ahead of")+" Paris. "+(12-n)+" to go."})());
  else say(L,"Twelve zones, one country","France’s overseas regions and territories, left over from its empire, are spread round the whole world. Tap the zones to visit them.")}};

/* ============================================================ E. Arizona's clock doughnut: drive across it
   Clock rules (Wikipedia, "Time in Arizona"): Arizona keeps Mountain Standard Time (UTC−7) all year; the Navajo Nation
   uses daylight saving time (UTC−6 in summer), like New Mexico; the Hopi Reservation, surrounded by the Navajo Nation,
   does not. The towns are on the road from Flagstaff through Tuba City, the Hopi mesas (Kykotsmovi, Keams Canyon),
   Ganado and Window Rock to Gallup, New Mexico (US 89, US 160, AZ 264, US 491); where each town falls is decided by the
   stop's own outlines (its Arizona, Navajo and Hopi shapes, drawn roughly), so the jumps match the map. Driving time
   assumes 90 km/h. */
const ROUTE=[["Flagstaff",[-111.65,35.2]],["Cameron",[-111.41,35.88]],["Tuba City",[-111.24,36.13]],["Kykotsmovi (Hopi)",[-110.62,35.87]],
 ["Keams Canyon (Hopi)",[-110.2,35.81]],["Ganado",[-109.54,35.71]],["Window Rock",[-109.05,35.68]],["Gallup, New Mexico",[-108.74,35.53]]];
const DRIVE={tour:"time",title:"Arizona’s clock doughnut",look:[[-110.2,35.65],16],
 tip:"Drive across on a July morning (drag the slider or press ▶). Watch your phone’s clock.",
 card:()=>'<div class="rve-row"><button type="button" class="rve-play" aria-label="Play">▶</button><input type="range" class="rve-range" min="0" max="1000" step="1" value="0" aria-label="Distance driven"></div><div class="rve-phone"></div>',
 init(L){L.f=0;L.play=false;L.jumps=0;L.prev=null;const S=psSteps()[ps.i];
  try{L.az=(S.holes||[]).map(h=>h.geo).find(Boolean)||null;const ln=S.lines||[];L.nav=ln.find(x=>x.kind==="forest");L.hopi=ln.find(x=>x.kind==="outline");
   L.navG=L.nav?polyGeo(L.nav.poly):null;L.hopiG=L.hopi?polyGeo(L.hopi.poly):null}catch(e){}
  const P=[];ROUTE.forEach(r=>P.push(r[1]));L.P=P;L.cum=[0];for(let i=1;i<P.length;i++)L.cum.push(L.cum[i-1]+d3.geoDistance(P[i-1],P[i])*6371);L.km=L.cum[L.cum.length-1];
  L.road=svgEl(L.geo,"path",{class:"rve-road"});L.dots=ROUTE.map(()=>svgEl(L.svg,"circle",{r:"4",class:"rve-town"}));L.tags=ROUTE.map(()=>tag(L,"rve-small rve-tiny"));L.car=tag(L,"rve-car");L.car.textContent="🚗"},
 wire(L){const c=L.card,b=c.querySelector(".rve-play"),r=c.querySelector(".rve-range");
  b.onclick=()=>{if(L.f>=1){L.f=0;L.jumps=0;L.prev=null}L.play=!L.play;b.textContent=L.play?"❚❚":"▶";b.setAttribute("aria-label",L.play?"Pause":"Play")};
  r.addEventListener("input",()=>{L.play=false;b.textContent="▶";L.f=+r.value/1000;L.dirty=1})},
 tick(L,dt){if(L.play){L.f=Math.min(1,L.f+dt/14);L.dirty=1;if(L.f>=1){L.play=false;try{L.card.querySelector(".rve-play").textContent="▶"}catch(e){}}}},
 at(L,f){const d=f*L.km;let i=1;while(i<L.cum.length-1&&L.cum[i]<d)i++;const a=L.P[i-1],b=L.P[i],t=(d-L.cum[i-1])/Math.max(1e-6,L.cum[i]-L.cum[i-1]);return d3.geoInterpolate(a,b)(clamp(t,0,1))},
 zone(L,ll){const inP=g=>{try{return!!g&&d3.geoContains(g,ll)}catch(e){return false}};
  if(inP(L.hopiG))return{n:"Hopi Reservation",dst:false};if(inP(L.navG))return{n:"Navajo Nation",dst:true};if(inP(L.az))return{n:"Arizona",dst:false};return{n:"New Mexico",dst:true}},
 draw(L){const D=this,ll=D.at(L,L.f),Z=D.zone(L,ll);
  L.road.setAttribute("d",geoD({type:"LineString",coordinates:L.P}));
  ROUTE.forEach((r,i)=>{const q=proj(L,r[1]),c=L.dots[i];if(q){c.style.display="";c.setAttribute("cx",q[0].toFixed(1));c.setAttribute("cy",q[1].toFixed(1))}else c.style.display="none";
   putTag(L,L.tags[i],[0,2,3,5,7].includes(i)?proj(L,r[1],1):null,esc(r[0]),i===3?8:-24)});
  putTag(L,L.car,proj(L,ll,1),"🚗",-14);
  /* the clock: leave Flagstaff at 9:00 a.m. Arizona time; driving time at 90 km/h; +1 h where daylight time is kept */
  const mins=9*60+L.f*L.km/90*60+(Z.dst?60:0),hh=Math.floor(mins/60),mm=Math.floor(mins%60),t=(hh>12?hh-12:hh)+":"+String(mm).padStart(2,"0")+(hh>=12?" p.m.":" a.m.");
  if(L.prev&&L.prev!==Z.n&&(L.prevDst!==Z.dst))L.jumps++;if(L.f===0){L.jumps=0}L.prev=Z.n;L.prevDst=Z.dst;
  if(L.card){const r=L.card.querySelector(".rve-range");if(r&&document.activeElement!==r)r.value=Math.round(L.f*1000);
   setHTML(L.card.querySelector(".rve-phone"),'<div class="rve-ph"><span class="rve-ph-t">📱 '+t+'</span><span class="rve-ph-z" style="background:'+(Z.dst?"#d9682b":"#2a78d0")+'">'+esc(Z.n)+": "+(Z.dst?"summer time, UTC−6":"no summer time, UTC−7")+'</span></div><div class="rve-note">'+Math.round(L.f*L.km)+" km driven, "+(L.f*L.km/90).toFixed(1).replace(".0","")+" h · the clock has jumped <b>"+L.jumps+"</b> time"+(L.jumps===1?"":"s")+"</div>")}
  if(L.f>=1)say(L,"Gallup, New Mexico: jumped "+L.jumps+" times","Arizona skips summer time because its summers are hot: an extra hour of evening sun is the last thing people want. The Navajo Nation keeps one clock with its land in Utah and New Mexico, and the Hopi, inside it, keep Arizona’s. Little Navajo and Hopi pockets inside each other add even more jumps on other roads.");
  else if(Z.n==="Hopi Reservation")say(L,"Into the Hopi Reservation: back an hour","The Hopi keep Arizona time, so your phone falls back an hour, though you are still surrounded by the Navajo Nation.");
  else if(Z.n==="Navajo Nation")say(L,"Into the Navajo Nation: forward an hour","The Navajo Nation keeps summer time, so on a July morning its clocks are an hour ahead of the rest of Arizona.");
  else if(L.f>0)say(L,"Arizona time",Z.n==="New Mexico"?"New Mexico keeps summer time too.":"Arizona keeps the same clock all year.");
  else say(L,"Leaving Flagstaff at 9:00 a.m.","A July morning. Arizona has no summer time. Drive north-east and watch the phone.")}};

/* the date line stop: the town tags follow the stop's world clock (they used the real time while the clock in the card
   showed 21:00 UTC, so Honolulu said Thursday night in one place and Friday morning in the other), and its layer is
   kept inside the globe (the date line ran up over the map buttons). */
function patchDateline(){try{const H=window.gfInteractHuman,m=H&&H.mods&&H.mods.find(x=>x&&x.id==="dateline");if(!m||m._rve)return;const o=m.now;
 m.now=function(){try{const svg=ps&&ps.card&&ps.card.querySelector('[data-dg="worldclock"] svg'),off=svg&&svg._s&&svg._s.off;if(isFinite(off)&&off!==0)return Date.now()+off*36e5}catch(e){}return o.apply(this,arguments)};m._rve=1;
 let lastOff=null;setInterval(()=>{try{const svg=ps&&ps.card&&ps.card.querySelector('[data-dg="worldclock"] svg'),off=svg&&svg._s?svg._s.off:null;if(off!==lastOff){lastOff=off;H.redraw()}}catch(e){}},500)}catch(e){}}
function clipLayers(){try{const G=g();if(!G||!G.host)return;const on=typeof ps!=="undefined"&&ps&&ps.tour&&TOURS.includes(ps.tour)&&ps.mode==="globe";
 G.host.querySelectorAll(".gfh-layer").forEach(el=>{if(!on){if(el._rveClip){el.style.clipPath="";el._rveClip=0}return}
  const sz=G.size(),hr=G.host.getBoundingClientRect(),er=el.getBoundingClientRect(),cr=G.canvas?G.canvas.getBoundingClientRect():hr;
  const cx=cr.left-er.left+sz.w/2,cy=cr.top-er.top+sz.h/2,v="circle("+(sz.r+2).toFixed(0)+"px at "+cx.toFixed(0)+"px "+cy.toFixed(0)+"px)";if(el.style.clipPath!==v)el.style.clipPath=v;el._rveClip=1})}catch(e){}}
setInterval(()=>{patchDateline();clipLayers()},400);

/* ============================================================ F. Three ways plates meet: which kind is it?
   Boundary types (USGS, "Understanding plate motions"; Wikipedia articles on each feature): Iceland and the Red Sea sit on
   spreading (divergent) boundaries and the East African Rift is a continental rift; the Himalaya (India–Eurasia), the
   Andes (Nazca under South America) and the Japan Trench (Pacific under Okhotsk) are convergent; the San Andreas Fault,
   New Zealand's Alpine Fault and Turkey's North Anatolian Fault are transform faults. */
const KIND={a:"↔ Pulling apart",c:"→← Crashing together",s:"⇅ Sliding past"};
const BND=[{n:"Iceland",k:"a",ll:[-19,64.8],why:"Iceland sits on the Mid-Atlantic Ridge: North America and Eurasia pull apart here, about 2 cm a year, and lava fills the gap."},
 {n:"The Himalaya",k:"c",ll:[86.9,28],why:"India is crashing into Asia. Neither plate sinks easily, so the crust crumples upwards into the highest mountains on Earth."},
 {n:"The San Andreas Fault",k:"s",ll:[-120.5,35.6],why:"The Pacific plate grinds north-west past North America. No crust is made or destroyed, but the plates stick and jerk: earthquakes."},
 {n:"The East African Rift",k:"a",ll:[36.5,-1],why:"Africa is tearing in two here: the land stretches, drops into long rift valleys and lets volcanoes through."},
 {n:"The Andes",k:"c",ll:[-71.5,-20],why:"The Nazca plate dives under South America. The squeeze lifts the Andes, and the sinking plate melts to feed their volcanoes."},
 {n:"Japan",k:"c",ll:[143,38],why:"The Pacific plate dives under Japan at the Japan Trench, which is why Japan has so many volcanoes and great earthquakes, like 2011’s."},
 {n:"New Zealand’s Alpine Fault",k:"s",ll:[170.5,-43.5],why:"The Pacific and Australian plates slide past each other along the Southern Alps, with a little squeeze that lifts the mountains."},
 {n:"The Red Sea",k:"a",ll:[38.5,20],why:"Arabia is pulling away from Africa. The gap has flooded: a young ocean, still widening."},
 {n:"Turkey’s North Anatolian Fault",k:"s",ll:[33,40.8],why:"Turkey is squeezed out sideways, west past the Eurasian plate, along a fault that has caused a string of deadly earthquakes."}];
const PLQ={tour:"plates",title:"Three ways plates meet",
 tip:"The globe turns to a place. Are the plates there pulling apart, crashing together or sliding past?",
 card:()=>'<div class="rve-row rve-btns">'+Object.keys(KIND).map(k=>'<button type="button" class="rve-btn rve-k" data-k="'+k+'">'+KIND[k]+"</button>").join("")+'</div><div class="rve-score"></div>',
 init(L){L.cur=0;L.ans={};L.t=0;L.ring=svgEl(L.svg,"circle",{r:"14",class:"rve-qring"});L.tags=BND.map(()=>tag(L,"rve-small"));L.bub=tag(L,"rve-bub");setTimeout(()=>{if(L&&L.el.isConnected)turnTo(L,BND[0].ll,1.5)},1700)},
 wire(L){L.card.querySelectorAll(".rve-k").forEach(b=>b.onclick=()=>{const i=L.cur;if(L.ans[i])return;L.ans[i]={k:b.dataset.k,ok:b.dataset.k===BND[i].k};L._said="";L.dirty=1;
   clearTimeout(L.nx);L.nx=setTimeout(()=>{if(!L||!L.el.isConnected)return;const n=BND.findIndex((x,j)=>!L.ans[j]);if(n>=0){L.cur=n;L._said="";L.dirty=1;turnTo(L,BND[n].ll,1.5)}},3200)})},
 off(L){clearTimeout(L.nx)},
 tick(L,dt){L.t+=dt;if(!L.ans[L.cur])try{L.ring.setAttribute("r",(12+4*Math.sin(L.t*5)).toFixed(1))}catch(e){}},
 draw(L){let right=0,done=0;BND.forEach((o,i)=>{const a=L.ans[i];if(a){done++;if(a.ok)right++}putTag(L,L.tags[i],a&&i!==L.cur?proj(L,o.ll,1):null,a?(a.ok?"✓ ":"✗ ")+esc(o.n):null,8)});
  const o=BND[L.cur],a=L.ans[L.cur],q=proj(L,o.ll);if(q){L.ring.style.display="";L.ring.setAttribute("cx",q[0].toFixed(1));L.ring.setAttribute("cy",q[1].toFixed(1));L.ring.style.stroke=a?(a.ok?"#1f8a4c":"#c2364f"):"#ffd166"}else L.ring.style.display="none";
  putTag(L,L.bub,proj(L,o.ll,1),esc(o.n)+(a?": "+KIND[o.k]:"?"),-18);
  if(L.card){L.card.querySelectorAll(".rve-k").forEach(b=>{b.disabled=!!a;b.classList.toggle("rve-right",!!a&&b.dataset.k===o.k);b.classList.toggle("rve-wrong",!!a&&!a.ok&&b.dataset.k===a.k)});
   setHTML(L.card.querySelector(".rve-score"),'<div class="rve-dots">'+BND.map((x,i)=>'<i class="'+(L.ans[i]?L.ans[i].ok?"rve-ok":"rve-no":"")+(i===L.cur?" rve-at":"")+'" title="'+esc(x.n)+'"></i>').join("")+"</div><span><b>"+right+"</b> right of "+done+"</span>")}
  if(done===BND.length)say(L,"Nine boundaries: "+right+" right","Pulling apart makes new crust (ridges, rifts, young seas). Crashing together destroys it or piles it up (trenches, volcanoes, high mountains). Sliding past does neither, but the plates stick and slip in earthquakes.");
  else if(a)say(L,(a.ok?"Right: ":"Not quite: ")+KIND[o.k].replace(/^\S+ /,"").toLowerCase(),o.why);
  else say(L,o.n,"Look at the land and the red boundary line. Which way are the plates moving here?")}};

/* ============================================================ G. Australia is on the move: run the clock forward
   Geoscience Australia ("Australia on the move" / GDA2020): Australia moves about 7 cm a year, to the north-north-east.
   The outline is the map's own Australia, moved in a straight line at today's speed and heading (7 cm a year =
   70 km per million years; heading taken as 20° east of north). A sketch: real plates turn as they go, and nobody can
   say exactly when, or where, it will hit Asia; geologists expect it to collide with south-east Asia in tens of
   millions of years, as the stop says. */
function dest(ll,brg,km){const R=6371,d=km/R,b=brg*Math.PI/180,f1=ll[1]*Math.PI/180,l1=ll[0]*Math.PI/180;
 const f2=Math.asin(Math.sin(f1)*Math.cos(d)+Math.cos(f1)*Math.sin(d)*Math.cos(b)),l2=l1+Math.atan2(Math.sin(b)*Math.sin(d)*Math.cos(f1),Math.cos(d)-Math.sin(f1)*Math.sin(f2));
 return[((l2*180/Math.PI+540)%360)-180,f2*180/Math.PI]}
const AUSD={tour:"plates",title:"Australia is on the move",
 tip:"Run the clock forward: where will Australia be in 10, 30, 50 million years?",
 card:()=>'<div class="rve-row"><button type="button" class="rve-play" aria-label="Play">▶</button><input type="range" class="rve-range" min="0" max="500" step="1" value="0" aria-label="Millions of years from now"><span class="rve-read rve-myr" style="flex:0 0 auto;min-width:96px"></span></div>',
 init(L){L.T=0;L.play=false;L.shape=null;try{const f=feat("au");const P=f&&f.geometry?(f.geometry.type==="Polygon"?[f.geometry.coordinates]:f.geometry.coordinates):[];
   let best=null,ba=0;P.forEach(c=>{const g={type:"Polygon",coordinates:c};const a=d3.geoArea(g);if(a<2*Math.PI&&a>ba){ba=a;best=c}});L.shape=best}catch(e){}
  L.ghost=svgEl(L.geo,"path",{class:"rve-ghost"});L.tg=tag(L,"rve-bub")},
 wire(L){const c=L.card,b=c.querySelector(".rve-play"),r=c.querySelector(".rve-range");
  b.onclick=()=>{if(L.T>=50)L.T=0;L.play=!L.play;b.textContent=L.play?"❚❚":"▶";b.setAttribute("aria-label",L.play?"Pause":"Play")};
  r.addEventListener("input",()=>{L.play=false;b.textContent="▶";L.T=+r.value/10;L.dirty=1})},
 tick(L,dt){if(L.play){L.T=Math.min(50,L.T+dt*4);L.dirty=1;if(L.T>=50){L.play=false;try{L.card.querySelector(".rve-play").textContent="▶"}catch(e){}}}},
 draw(L){const km=L.T*70;let d="";if(L.shape&&L.T>0){const mv=L.shape.map(ring=>ring.map(p=>dest(p,20,km)));d=geoD({type:"Polygon",coordinates:mv})}L.ghost.setAttribute("d",d);
  putTag(L,L.tg,L.T>0?proj(L,dest([134,-25],20,km),1):null,"Australia in "+Math.round(L.T)+" million years",-10);
  if(L.card){const r=L.card.querySelector(".rve-range");if(r&&document.activeElement!==r)r.value=Math.round(L.T*10);setHTML(L.card.querySelector(".rve-myr"),L.T>0?"+"+Math.round(L.T)+" Myr · "+fmt(km)+" km":"today")}
  if(L.T>=40)say(L,fmt(km)+" km north","At 7 cm a year, Australia’s middle reaches the latitude of today’s New Guinea. Long before that, New Guinea, the front of the same plate, ploughs into south-east Asia, and new mountains rise: the way India made the Himalaya.");
  else if(L.T>=10)say(L,Math.round(L.T)+" million years: "+fmt(km)+" km","Fingernail speed adds up. Australia has already moved this way for about 50 million years, since it broke away from Antarctica.");
  else say(L,"7 cm a year","Too slow to feel, fast enough for GPS: in 30 years it adds up to about 2 m, which is why the maps had to be moved. Run the clock forward.")}};

/* ============================================================ H. The town that ignored the map: race the lahar
   Wikipedia, "Armero tragedy": the eruption began at 9:08 p.m. on 13 November 1985; lahars reached Armero at about
   11:30 p.m., more than two hours later, and buried it; more than 23,000 people died there. The town was not evacuated.
   The mud's path is the stop's own arrow (Nevado del Ruiz to Armero, about 47 km); the front is drawn moving along it at
   a steady speed between those two times. */
const LAHAR={tour:"hazards",title:"The town that ignored the map",look:[[-75.1,4.93],40],
 tip:"Press ▶ and follow the mud from the volcano to Armero. How long did the town have?",
 card:()=>'<div class="rve-row"><button type="button" class="rve-play" aria-label="Play">▶</button><input type="range" class="rve-range" min="0" max="150" step="1" value="0" aria-label="Minutes after the eruption"><span class="rve-read rve-clk" style="flex:0 0 auto;min-width:70px"></span></div>',
 init(L){L.m=0;L.play=false;const S=psSteps()[ps.i];L.P=((S.lines||[]).find(x=>x&&x.coords)||{coords:[[-75.32,4.89],[-74.9,4.965]]}).coords;
  L.cum=[0];for(let i=1;i<L.P.length;i++)L.cum.push(L.cum[i-1]+d3.geoDistance(L.P[i-1],L.P[i]));
  L.mud=svgEl(L.geo,"path",{class:"rve-mud"});L.town=svgEl(L.svg,"circle",{r:"9",class:"rve-armero"});L.tg=tag(L,"rve-bub")},
 wire(L){const c=L.card,b=c.querySelector(".rve-play"),r=c.querySelector(".rve-range");
  b.onclick=()=>{if(L.m>=142)L.m=0;L.play=!L.play;b.textContent=L.play?"❚❚":"▶";b.setAttribute("aria-label",L.play?"Pause":"Play")};
  r.addEventListener("input",()=>{L.play=false;b.textContent="▶";L.m=+r.value;L.dirty=1})},
 tick(L,dt){if(L.play){L.m=Math.min(150,L.m+dt*10);L.dirty=1;if(L.m>=150){L.play=false;try{L.card.querySelector(".rve-play").textContent="▶"}catch(e){}}}},
 draw(L){const f=clamp(L.m/142,0,1),tot=L.cum[L.cum.length-1],d=f*tot,pts=[L.P[0]];for(let i=1;i<L.P.length;i++){if(L.cum[i]<=d)pts.push(L.P[i]);else{const t=(d-L.cum[i-1])/(L.cum[i]-L.cum[i-1]);pts.push(d3.geoInterpolate(L.P[i-1],L.P[i])(t));break}}
  L.mud.setAttribute("d",f>0?geoD({type:"LineString",coordinates:pts}):"");const end=L.P[L.P.length-1],q=proj(L,end);
  if(q){L.town.style.display="";L.town.setAttribute("cx",q[0].toFixed(1));L.town.setAttribute("cy",q[1].toFixed(1));L.town.style.fill=f>=1?"#6b4a2b":"#ffd166"}else L.town.style.display="none";
  const mins=9*60+8+L.m,hh=Math.floor(mins/60),mm=Math.floor(mins%60),clk=(hh>12?hh-12:hh)+":"+String(mm).padStart(2,"0")+" p.m.";
  putTag(L,L.tg,proj(L,f<1&&f>0?pts[pts.length-1]:end,1),f>=1?"Armero buried · "+clk:f>0?"Mud · "+clk:"Armero, asleep",-14);
  if(L.card){const r=L.card.querySelector(".rve-range");if(r&&document.activeElement!==r)r.value=Math.round(L.m);setHTML(L.card.querySelector(".rve-clk"),"🕘 "+clk)}
  if(f>=1)say(L,"11:30 p.m.: more than two hours too late","The mud took over two hours to reach Armero: time enough for everyone to walk to higher ground. But the warnings were confused, and nobody told the town to leave. Today volcano observatories and towns agree evacuation plans before an eruption.");
  else if(L.m>20)say(L,"A river of mud","Melted ice, ash and rock pour down the river valleys at the speed of a car, picking up more mud as they go. In Armero, people are going to bed.");
  else say(L,"9:08 p.m., 13 November 1985","Nevado del Ruiz erupts. Its ice cap starts to melt. Press ▶.")}};

/* ============================================================ I. Bangladesh fights back: guess the toll
   Deaths (Wikipedia, "1970 Bhola cyclone": 300,000–500,000; "1991 Bangladesh cyclone": about 138,000; "Cyclone Sidr"
   2007: about 3,500 in Bangladesh, as the stop says; "Cyclone Amphan" 2020: 26 in Bangladesh). Peak winds: Bhola about
   185 km/h, Sidr about 260 km/h (the same articles). */
const CYC=[{y:1970,n:"Bhola cyclone",d:300000,t:"300,000 to 500,000"},{y:1991,n:"1991 cyclone",d:138000,t:"about 138,000"},{y:2007,n:"Cyclone Sidr",d:3500,t:"about 3,500"},{y:2020,n:"Cyclone Amphan",d:26,t:"26"}];
const BANGLA={tour:"hazards",title:"Bangladesh fights back",cardOnly:1,
 tip:"Cyclone Sidr (2007) had even stronger winds than the 1970 storm. Guess how many it killed, then reveal.",
 card:()=>'<div class="rve-row"><input type="range" class="rve-range rve-gs" min="0" max="500" step="1" value="350" aria-label="Your guess"><button type="button" class="rve-btn rve-reset rve-rev">Reveal</button></div><div class="rve-bars rve-cyc"></div>',
 init(L){L.g=350;L.shown=false},
 wire(L){const c=L.card;c.querySelector(".rve-gs").addEventListener("input",e=>{L.g=+e.target.value;L.dirty=1});c.querySelector(".rve-rev").onclick=()=>{L.shown=true;L._said="";L.dirty=1}},
 val(g){return Math.round(Math.pow(10,1+g/100))},
 draw(L){const c=L.card;if(!c)return;const gv=this.val(L.g),w=v=>(Math.log10(Math.max(10,v))-1)/5*100;
  const rows=CYC.map(o=>{const show=o.y===1970||L.shown,guess=o.y===2007;return'<div class="rve-lane"><span>'+o.y+'</span><div class="rve-track">'+(show?'<i style="width:'+w(o.d).toFixed(1)+'%;background:'+(o.y===1970?"#c2364f":"#2a78d0")+'"></i>':"")+(guess?'<em style="left:'+w(gv).toFixed(1)+'%"></em>':"")+'</div><b>'+(show?o.t:guess?"you: "+fmt(gv):"?")+"</b></div>"}).join("");
  setHTML(c.querySelector(".rve-cyc"),'<div class="rve-bartitle">Deaths in Bangladesh (each step is ten times more)</div>'+rows);
  const b=c.querySelector(".rve-rev");if(b)b.disabled=L.shown;
  if(L.shown){const r=gv/3500;say(L,(r>.5&&r<2?"Close! ":r>=2?"Far fewer than you guessed: ":"More than you guessed: ")+"about 3,500","Each storm was huge, yet the toll fell by a hundred times, then a hundred times again. Warnings by radio and megaphone, thousands of raised concrete shelters and volunteers who lead people to them made the difference.")}
  else say(L,"Your guess: "+fmt(gv),"Slide to guess Sidr’s toll, then press Reveal.")}};

/* ============================================================ the engine: one stop at a time */
const DEFS=[CLAIMS,METEOR,FROZE,FRANCE,DRIVE,PLQ,AUSD,LAHAR,BANGLA];
let L=null,raf=0,lastT=0;
function activeDef(){try{if(typeof ps==="undefined"||!ps||!ps.tour||ps.mode!=="globe")return null;const S=psSteps()[ps.i];if(!S)return null;return DEFS.find(d=>d.tour===ps.tour&&d.title===S.title)||null}catch(e){return null}}
function mount(D){const G=g();if(!G||!G.host)return;if(L&&L.D===D&&L.host===G.host&&L.el.isConnected)return;unmount();
 const el=document.createElement("div");el.className="rve-layer";el.innerHTML='<svg class="rve-svg"><defs><clipPath id="rveClip"><path class="rve-clipp" clip-rule="evenodd"/></clipPath></defs><g class="rve-clipg" clip-path="url(#rveClip)"></g></svg>';G.host.appendChild(el);
 const svg=el.querySelector("svg");const cg=svg.querySelector(".rve-clipg");L={D,host:G.host,el,svg:cg,geo:svgEl(cg,"g",{}),root:svg,clipP:svg.querySelector(".rve-clipp"),dirty:1,ox:0,oy:0,key:""};
 try{D.init.call(D,L)}catch(e){console.error(e)}lastT=0;loop();
 if(D.look){const L0=L;setTimeout(()=>{if(L===L0&&L.el.isConnected)turnTo(L,D.look[0],D.look[1])},1600)}}
function unmount(){cancelAnimationFrame(raf);raf=0;if(L){try{if(L.D.off)L.D.off(L)}catch(e){}try{L.el.remove()}catch(e){}L=null}document.querySelectorAll(".rve-ctl").forEach(c=>c.remove())}
function ensureCard(){if(!L||typeof ps==="undefined"||!ps||!ps.card)return;const ex=ps.card.querySelector(".rve-ctl");if(ex&&L.card===ex)return;if(ex)ex.remove();
 const at0=ps.card.querySelector(".ps-stat");if(!at0)return;const D=L.D,c=document.createElement("div");c.className="rve-ctl";
 c.innerHTML='<div class="rve-do">'+esc(D.tip)+"</div>"+(D.card?D.card(L):"")+'<div class="rve-ep"></div>';at0.after(c);L.card=c;L._said="";
 try{if(D.wire)D.wire.call(D,L)}catch(e){console.error(e)}L.dirty=1}
function loop(){if(!L)return;raf=requestAnimationFrame(t=>{try{const G=g();const dt=Math.min(.1,(t-(lastT||t))/1000);lastT=t;
  const hr=L.host.getBoundingClientRect(),cr=G.canvas?G.canvas.getBoundingClientRect():hr;L.ox=cr.left-hr.left;L.oy=cr.top-hr.top;
  let cb=null;try{const c=ps&&ps.card;if(c&&c.isConnected&&c.offsetWidth){const b=c.getBoundingClientRect();cb=[b.left-hr.left-6,b.top-hr.top-6,b.right-hr.left+6,b.bottom-hr.top+6]}}catch(e){}L.cb=cb;
  if(L.D.tick)L.D.tick.call(L.D,L,dt);
  let rl=0;try{rl=G.roll()}catch(e){}
  const key=(G.rot||[]).join(",")+G.zoom+"|"+rl+"|"+hr.width+"x"+hr.height+"|"+cr.left+","+cr.top+"|"+(cb?cb.map(Math.round).join(","):"");
  if(key!==L.key||L.dirty){L.key=key;L.dirty=0;L.root.setAttribute("width",hr.width);L.root.setAttribute("height",hr.height);
   /* shapes drawn with the globe's projection (geoD) sit in L.geo, shifted by the canvas offset; points from proj() are
      already in the host's pixels. Everything is kept off the tour card by an even-odd clip. */
   L.geo.setAttribute("transform","translate("+L.ox.toFixed(1)+","+L.oy.toFixed(1)+")");
   /* the globe is drawn as a disc of radius size().r (zooming in magnifies inside it): keep shapes inside the disc */
   let disc="M-10 -10H"+(hr.width+10)+"V"+(hr.height+10)+"H-10Z";try{if(!G._flat){const z=G.size(),cx=L.ox+z.w/2,cy=L.oy+z.h/2,r=z.r+1;disc="M"+(cx-r)+" "+cy+"A"+r+" "+r+" 0 1 0 "+(cx+r)+" "+cy+"A"+r+" "+r+" 0 1 0 "+(cx-r)+" "+cy+"Z"}}catch(e){}
   L.clipP.setAttribute("d",disc+(cb?"M"+cb[0]+" "+cb[1]+"H"+cb[2]+"V"+cb[3]+"H"+cb[0]+"Z":""));
   L.D.draw.call(L.D,L)}}catch(e){console.error(e)}loop()})}
setInterval(()=>{try{const D=activeDef();if(D){mount(D);ensureCard()}else if(L||document.querySelector(".rve-ctl"))unmount()}catch(e){}},300);
addEventListener("resize",()=>{if(L)L.dirty=1});

{const s=document.createElement("style");s.textContent=`
.rve-layer{position:absolute;inset:0;pointer-events:none;z-index:24;overflow:hidden}
.rve-svg{position:absolute;left:0;top:0;overflow:visible}
.rve-tag{position:absolute;transform:translate(-50%,0);white-space:nowrap;pointer-events:none}
.rve-bub{transform:translate(-50%,-100%);background:#13294b;color:#fff;font-weight:800;font-size:14px;padding:5px 12px;border-radius:999px;box-shadow:0 3px 10px rgba(0,0,0,.3)}
.rve-small{background:rgba(255,255,255,.94);color:#13294b;font-weight:800;font-size:12.5px;padding:3px 9px;border-radius:999px;box-shadow:0 2px 6px rgba(0,0,0,.25)}
.rve-wedge{stroke-width:2;transition:fill-opacity .3s}
.rve-aq{stroke:none;transition:fill .6s}
.rve-acc{fill:none;stroke:#9fd8ff;stroke-width:5;stroke-linecap:round;stroke-dasharray:14 10;filter:drop-shadow(0 0 2px rgba(10,30,60,.8))}
.rve-warm{fill:none;stroke:#e2672a;stroke-width:4;stroke-linecap:round;stroke-dasharray:10 7;filter:drop-shadow(0 0 2px rgba(255,255,255,.7))}
.rve-bridge{fill:none;stroke:#8a5a2b;stroke-width:9;stroke-linecap:round;stroke-linejoin:round;filter:drop-shadow(0 0 2px #fff)}
.rve-ctl{margin:10px 0 4px;padding:10px 12px;border-radius:12px;background:rgba(19,41,75,.06);border:1px solid rgba(19,41,75,.12)}
.rve-do{font-weight:800;font-size:14px;line-height:1.35;color:#9a4a16;margin-bottom:8px}
.rve-row{display:flex;align-items:center;gap:10px}
.rve-btns{gap:6px;flex-wrap:wrap}
.rve-btn{flex:1 1 auto;display:inline-flex;align-items:center;justify-content:center;gap:5px;border:1px solid rgba(19,41,75,.2);background:#fff;color:#13294b;font-weight:700;font-size:12.5px;padding:6px 10px;border-radius:999px;cursor:pointer}
.rve-btn.rve-reset{flex:0 0 auto}
.rve-btn.rve-on{background:#13294b;color:#fff;border-color:#13294b}
.rve-btn:disabled{cursor:default;opacity:.55}.rve-btn.rve-right{opacity:1;background:#1f8a4c;color:#fff;border-color:#1f8a4c}.rve-btn.rve-wrong{opacity:1;background:#c2364f;color:#fff;border-color:#c2364f}
.rve-play{flex:0 0 auto;width:36px;height:36px;border-radius:50%;border:0;background:#d9682b;color:#fff;font-size:13px;cursor:pointer}
.rve-range{flex:1 1 auto;min-width:0;accent-color:#d9682b}
.rve-read{flex:1 1 auto;font-weight:700;font-size:12.5px;color:#9a4a16}
.rve-note{font-size:12px;opacity:.8;margin-top:4px}
.rve-score{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:8px;font-size:12.5px}
.rve-chip{color:#fff;font-weight:700;font-size:12px;padding:3px 9px;border-radius:999px}
.rve-dots{display:flex;gap:4px}.rve-dots i{width:11px;height:11px;border-radius:50%;background:rgba(19,41,75,.18)}.rve-dots i.rve-ok{background:#1f8a4c}.rve-dots i.rve-no{background:#c2364f}.rve-dots i.rve-at{box-shadow:0 0 0 2px #ffd166}
.rve-ep{margin-top:8px;font-size:14px;line-height:1.4;min-height:2.8em}.rve-ep b{display:block;font-size:15px}
.rve-ep.rve-new{animation:rveIn .45s ease}@keyframes rveIn{from{opacity:.2;transform:translateY(4px)}}
.rve-frdot{fill:#fff;stroke:#24479b;stroke-width:3}
.rve-zones .rve-btn{flex:0 0 auto;min-width:58px;padding:5px 8px}.rve-btn.rve-at{box-shadow:0 0 0 2px #ffd166}
.rve-road{fill:none;stroke:#fff;stroke-width:3;stroke-dasharray:6 4;filter:drop-shadow(0 0 2px rgba(0,0,0,.7))}
.rve-town{fill:#13294b;stroke:#fff;stroke-width:1.5}.rve-tiny{font-size:11px;padding:2px 7px}
.rve-car{transform:translate(-50%,-100%);font-size:26px;filter:drop-shadow(0 2px 3px rgba(0,0,0,.5))}
.rve-phone{margin-top:8px}.rve-ph{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.rve-ph-t{font-weight:800;font-size:20px;color:#13294b;font-variant-numeric:tabular-nums}
.rve-ph-z{color:#fff;font-weight:700;font-size:12px;padding:3px 9px;border-radius:999px}
:is(body.dark-theme,body.sky-night) .rve-ph-t{color:#fff}
.rve-qring{fill:none;stroke-width:4;filter:drop-shadow(0 0 3px rgba(0,0,0,.6))}
.rve-hot{fill:rgba(255,80,30,.55);stroke:#ffd166;stroke-width:2;filter:drop-shadow(0 0 8px #ff5a1e)}
.rve-ghost{fill:rgba(217,104,43,.35);stroke:#d9682b;stroke-width:2.5;stroke-dasharray:6 4}
.rve-mud{fill:none;stroke:#7a5230;stroke-width:9;stroke-linecap:round;stroke-linejoin:round;filter:drop-shadow(0 0 3px #fff)}
.rve-armero{stroke:#13294b;stroke-width:2.5}
.rve-bars{margin-top:8px;display:flex;flex-direction:column;gap:5px}.rve-bartitle{font-size:12px;font-weight:700;opacity:.75}
.rve-lane{display:flex;align-items:center;gap:8px;font-size:12.5px}.rve-lane span{flex:0 0 38px;font-weight:800}.rve-lane b{flex:0 0 112px;text-align:right;font-size:12px}
.rve-track{position:relative;flex:1 1 auto;height:12px;border-radius:6px;background:rgba(19,41,75,.12)}
.rve-track i{position:absolute;left:0;top:0;bottom:0;border-radius:6px;min-width:2px}
.rve-track em{position:absolute;top:-3px;bottom:-3px;width:4px;margin-left:-2px;background:#d9682b;border-radius:2px}
:is(body.dark-theme,body.sky-night) .rve-track{background:rgba(255,255,255,.15)}
.rve-met{display:block;width:100%;height:auto;margin:0 0 6px;border-radius:8px;background:linear-gradient(#1d2f55,#41618f)}
.rve-met-blue{fill:#5fb4ec;opacity:.9}.rve-met-rock{fill:#6b5a4a}.rve-met-arr{fill:none;stroke:#2a78d0;stroke-width:2;stroke-dasharray:4 3;opacity:.7}
.rve-met-m{fill:#2b2420;stroke:#fff;stroke-width:.6}.rve-met-found{fill:#111;stroke:#ffd166;stroke-width:1.4}.rve-met-trail{stroke:#ffd166;stroke-width:2;stroke-linecap:round;opacity:.8}
.rve-met-t{font:700 9.5px system-ui,sans-serif;fill:#fff}.rve-met-bt{fill:#0b3d66}
:is(body.dark-theme,body.sky-night) .rve-ctl{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)}
:is(body.dark-theme,body.sky-night) .rve-do,:is(body.dark-theme,body.sky-night) .rve-read{color:#ffb27a}
:is(body.dark-theme,body.sky-night) .rve-btn{background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.2)}
:is(body.dark-theme,body.sky-night) .rve-btn.rve-on{background:#fff;color:#13294b}
:is(body.dark-theme,body.sky-night) .rve-dots i{background:rgba(255,255,255,.15)}`;document.head.appendChild(s)}
window.gfPolishRVE={v:1,FIX,L:()=>L,RO};
})();
