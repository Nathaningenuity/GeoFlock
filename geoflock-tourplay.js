/* GeoFlock: things to DO at tour stops.
   Three small, optional interactions, added to stops by "tour id|stop title" (so they survive stops being reordered):
   - guess: "Guess first". The stop's headline number is veiled; a slider asks for an estimate, then shows the real
     value and how close the guess was. {q, min, max, step, ans, unit, log, show}
   - find:  "Find it". A button arms the map: click (or tap) the place. A hit within `km` of `ll` (or inside the country
     `code`) is a success; after two misses a pulsing ring points the way. "Show me" / Esc / Skip end it at any time.
     It claims gfOneTool("tourplay") while armed, so no other map tool listens at the same time.
   - drag:  a true-size "drag me" country outline (the tours' own S.drag), added to stops that compare sizes and had none.
   Next/Back always work: nothing here blocks the tour. All map listeners and DOM go when the stop changes or the tour
   ends (psGo / psEnd are wrapped, plus a watchdog). Loads after everything else and waits for the tour code. */
(function(){
"use strict";
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const clean=s=>String(s==null?"":s).replace(/​/g,"").trim();

/* ---------------- data ---------------- */
const G=(q,min,max,ans,unit,o)=>Object.assign({q,min,max,ans,unit:unit||""},o||{});
const GUESS={
 "geo|Deeper than Everest is tall":G("How deep is the deepest point of the Mariana Trench?",1000,15000,10935,"m",{step:100,show:"about 10,935 m"}),
 "geo|The longest straight line at sea":G("How far can you sail in one straight line without touching land?",5000,40000,32090,"km",{step:10}),
 "geo|France: the most time zones":G("How many time zones does France have, counting its lands overseas?",1,15,12,"",{step:1}),
 "elev|The lowest land on Earth":G("How far below sea level is the Dead Sea’s shore?",0,1000,430,"m",{step:10,show:"over 430 m"}),
 "elev|Living in thin air":G("How high up is El Alto, Bolivia?",0,6000,4150,"m",{step:50,show:"about 4,150 m"}),
 "elev|Low and high, neighbours":G("How far apart are the lowest and the highest points of the lower 48 US states?",10,3000,135,"km",{log:1,show:"about 135 km"}),
 "elev|A country below the sea":G("What share of the Netherlands lies below sea level?",0,100,25,"%",{step:1,show:"about a quarter"}),
 "rivers|The deepest river":G("How deep is the Congo River at its deepest?",10,500,220,"m",{step:5,show:"over 220 m"}),
 "rivers|The waterfall that walks backwards":G("How far upstream has Niagara Falls moved in the last 12,500 years?",0,50,11,"km",{step:.5,show:"about 11 km"}),
 "rivers|Ten countries, one river":G("Through or along how many countries does the Danube flow?",1,15,10,"",{step:1}),
 "rivers|Running from the sea":G("How far from the Atlantic does the Niger River start?",10,3000,250,"km",{log:1,show:"only about 250 km"}),
 "lakes|Lakes in a crack":G("How long is Lake Tanganyika?",100,1500,670,"km",{step:10,show:"about 670 km"}),
 "lakes|The highest lake you can sail":G("How high above the sea is Lake Titicaca?",0,6000,3812,"m",{step:10}),
 "lakes|Lakes scraped by ice":G("About how many lakes does Finland have?",1000,1000000,188000,"",{log:1,show:"about 188,000"}),
 "lakes|Deadly lakes":G("How many people did Lake Nyos’s gas cloud kill in 1986?",10,20000,1700,"",{log:1,show:"about 1,700"}),
 "seas|The deep ocean":G("How deep is the ocean on average?",.5,8,3.7,"km",{step:.1,show:"about 3.7 km"}),
 "seas|14 km from Africa":G("How far apart are Europe and Africa at the Strait of Gibraltar?",1,200,14,"km",{log:1,show:"about 14 km"}),
 "seas|If all the ice melted":G("If every glacier and ice sheet melted, how much would the sea rise?",1,300,70,"m",{log:1,show:"about 70 m"}),
 "islands|The most islands":G("About how many islands does Sweden have?",1000,1000000,267000,"",{log:1,show:"about 267,000"}),
 "islands|The loneliest island town":G("How far is Tristan da Cunha from the nearest other town?",100,6000,2400,"km",{step:50,show:"about 2,400 km"}),
 "deserts|Hotter than an oven floor":G("How hot have satellites measured the ground in Iran’s Lut Desert?",30,100,70,"°C",{step:1,show:"over 70 °C"}),
 "deserts|The great salt flat":G("How big is Bolivia’s Salar de Uyuni?",100,100000,10500,"km²",{log:1,show:"about 10,500 km²"}),
 "ice|Antarctica’s ice sheet":G("How thick is Antarctica’s ice at its thickest?",.5,10,4.8,"km",{step:.1,show:"about 4.8 km"}),
 "ice|A park losing its glaciers":G("Glacier National Park had about 150 glaciers in 1850. How many were still big enough to count in 2015?",0,150,26,"",{step:1}),
 "ranges|The Andes":G("How long are the Andes?",1000,15000,7000,"km",{step:100,show:"about 7,000 km"}),
 "ranges|Where Europe meets Asia":G("How high is the highest peak of the Ural Mountains?",500,6000,1895,"m",{step:5}),
 "volcanoes|Mauna Loa: a giant shield":G("How high does Mauna Loa rise, measured from the sea floor?",1,15,9,"km",{step:.5,show:"about 9 km"}),
 "volcanoes|The biggest bang in a century":G("How high did the 2022 Tonga eruption throw its plume?",5,100,57,"km",{step:1,show:"about 57 km"}),
 "caves|The longest cave: Mammoth Cave":G("How long are Mammoth Cave’s mapped passages?",10,3000,680,"km",{log:1,show:"more than 680 km"}),
 "caves|Caves made by lava":G("How long is Kazumura Cave, the longest lava tube known?",1,300,65.5,"km",{log:1,show:"65.5 km"}),
 "capitals|La Paz: the highest seat of government":G("How high is La Paz, the highest seat of government?",0,6000,3640,"m",{step:10,show:"about 3,640 m"}),
 "capitals|Brasília: built in 41 months":G("How long did it take to build Brasília?",6,180,41,"months",{step:1,show:"about 41 months"}),
 "asia|Two rice baskets on a pole":G("How wide is Vietnam at its narrowest?",5,500,50,"km",{log:1,show:"about 50 km"}),
 "samerica|A ribbon of a country":G("How long is Chile from north to south?",500,8000,4300,"km",{step:50,show:"over 4,000 km (about 4,300 km)"}),
 "oceania|A thousand languages":G("About how many languages are spoken in Papua New Guinea?",10,3000,840,"",{log:1,show:"about 840"}),
 "oceania|Tuvalu’s lucky letters":G("How high is the highest point in Tuvalu?",1,100,4.6,"m",{log:1,show:"4.6 m"}),
 "namerica|The longest border":G("How long is the border between Canada and the United States?",1000,20000,8900,"km",{step:100,show:"about 8,900 km"}),
 "namerica|A capital that sinks":G("In the worst places, how fast is Mexico City sinking?",0,200,50,"cm a year",{step:1,show:"up to about 50 cm a year"}),
 "europe|Changing wheels at the border":G("How much wider are the rails east of the Polish–Belarus border?",0,500,85,"mm",{step:5}),
 "europe|A city on two continents":G("How wide is the Bosphorus strait at Istanbul, at its narrowest?",100,10000,700,"m",{log:1,show:"about 700 m"}),
 "antarctica|Who lives there":G("How many people stay in Antarctica in summer?",100,100000,5000,"",{log:1,show:"up to about 5,000"}),
 "pop|Mongolia: the emptiest country":G("How many people live on each square kilometre of Mongolia, on average?",0,50,2,"",{step:1,show:"about 2"}),
 "pop|Egypt is the Nile":G("What share of Egyptians live along the Nile?",0,100,95,"%",{step:1})};

const F=(q,ll,km,name,o)=>Object.assign({q,ll,km,name},o||{});
const FIND={
 "geo|Point Nemo":F("Click the spot in the ocean farthest from any land.",[-123.39,-48.88],1200,"Point Nemo"),
 "elev|The roof of the world":F("Click the Tibetan Plateau.",[88,32.5],700,"The Tibetan Plateau"),
 "lakes|The deepest and oldest lake":F("Find Lake Baikal.",[108,53.5],350,"Lake Baikal"),
 "lakes|Lakes that disappeared":F("Find the Aral Sea, or what is left of it.",[60,45],300,"The Aral Sea"),
 "rivers|China’s great river":F("Click where the Yangtze reaches the sea.",[121.8,31.4],250,"The mouth of the Yangtze, at Shanghai"),
 "rivers|The river that reverses":F("Find the great lake the Tonlé Sap River fills: the Tonlé Sap.",[104,12.9],180,"The Tonlé Sap lake, Cambodia"),
 "seas|The Bermuda Triangle":F("Click Bermuda, one corner of the ‘triangle’.",[-64.75,32.3],300,"Bermuda"),
 "islands|Island born in 1963":F("Find Surtsey, off Iceland’s south coast.",[-20.6,63.3],200,"Surtsey"),
 "islands|The loneliest island town":F("Find Tristan da Cunha, in the South Atlantic.",[-12.3,-37.1],450,"Tristan da Cunha"),
 "volcanoes|Vesuvius and Pompeii":F("Find Vesuvius, next to Naples.",[14.43,40.82],120,"Vesuvius"),
 "volcanoes|Etna, always busy":F("Find Etna, on Sicily.",[15,37.75],120,"Etna"),
 "volcanoes|Pinatubo cools the planet":F("Find Pinatubo, on Luzon in the Philippines.",[120.35,15.13],200,"Pinatubo"),
 "volcanoes|Kilimanjaro and the Rift":F("Find Kilimanjaro.",[37.36,-3.07],150,"Kilimanjaro"),
 "deserts|The Empty Quarter":F("Click the Empty Quarter, in the south of the Arabian Peninsula.",[50,20.5],500,"The Rub’ al Khali"),
 "caves|Ha Long Bay: karst in the sea":F("Find Ha Long Bay, in northern Vietnam.",[107.1,20.9],150,"Ha Long Bay"),
 "caves|Son Doong: the biggest cave passage":F("Find Son Doong, in central Vietnam near the border with Laos.",[106.15,17.46],180,"Son Doong"),
 "capitals|Abuja, in the middle":F("Find Abuja, near the middle of Nigeria.",[7.49,9.06],150,"Abuja"),
 "capitals|Canberra, the compromise":F("Find Canberra, between Sydney and Melbourne.",[149.13,-35.28],120,"Canberra"),
 "capitals|Astana on the steppe":F("Find Astana, on the steppe of northern Kazakhstan.",[71.45,51.17],180,"Astana"),
 "africa|The real southern tip":F("Click Africa’s southernmost point.",[20,-34.83],120,"Cape Agulhas"),
 "africa|A river country":F("Find the Gambia.",[-15.4,13.45],60,"The Gambia",{code:"gm"}),
 "africa|The kingdom in the sky":F("Find Lesotho.",[28.2,-29.6],60,"Lesotho",{code:"ls"}),
 "europe|Russia, cut off from Russia":F("Find Kaliningrad, between Poland and Lithuania.",[21,54.7],120,"Kaliningrad"),
 "europe|Cyprus is in Asia":F("Find Cyprus.",[33.2,35],60,"Cyprus",{code:"cy"}),
 "europe|Islands of the midnight sun":F("Find Svalbard, far north of Norway.",[17,78.5],350,"Svalbard"),
 "asia|Two Koreas":F("Click North Korea.",[127,40],60,"North Korea",{code:"kp"}),
 "namerica|The dinosaur-killer crater":F("Click where the asteroid hit, on the tip of Mexico’s Yucatán Peninsula.",[-89.5,21.3],200,"Chicxulub"),
 "samerica|Two landlocked countries":F("Click Paraguay.",[-58.4,-23.4],60,"Paraguay",{code:"py"}),
 "samerica|Darwin’s islands":F("Find the Galápagos Islands.",[-90.5,-0.6],300,"The Galápagos"),
 "oceania|The smallest island country":F("Find Nauru, just south of the equator.",[166.93,-0.52],350,"Nauru"),
 "antarctica|Sail into a volcano":F("Find Deception Island, off the Antarctic Peninsula.",[-60.6,-62.95],250,"Deception Island"),
 "pop|Java":F("Click Java.",[110,-7.4],300,"Java")};

/* true-size outlines for stops that compare sizes but had nothing to drag (only added when the stop has no S.drag / S.ghosts) */
const DRAG={
 "lakes|A lake under the ice":{kind:"outline",code:"jm",at:[105,-77.5],label:"Jamaica · drag me"},
 "deserts|The Empty Quarter":{kind:"outline",code:"fr",at:[50,20.5],label:"France · drag me"},
 "oceania|The Great Barrier Reef":{kind:"outline",code:"it",at:[150,-17],label:"Italy · drag me"}};

window.gfTourPlay={GUESS,FIND,DRAG};

/* ---------------- helpers ---------------- */
const stop=()=>{try{return ps?psSteps()[ps.i]:null}catch(e){return null}};
const keyOf=()=>{const S=stop();return S?ps.tour+"|"+clean(S.title):null};
const onGlobe=()=>{try{return typeof amGlobeOn==="function"&&amGlobeOn()&&amGlobe&&amGlobe.host&&amGlobe.host.offsetParent}catch(e){return false}};
const host=()=>onGlobe()?amGlobe.host:document.getElementById("allMapsWrap");
function toLL(cx,cy){try{if(onGlobe()){const r=amGlobe.canvas.getBoundingClientRect(),p=amGlobe.projection(),ll=p.invert([cx-r.left,cy-r.top]);if(!ll||!isFinite(ll[0]))return null;const r0=p.rotate();if(!amGlobe._flat&&d3.geoDistance(ll,[-r0[0],-r0[1]])>Math.PI/2-.01)return null;return ll}return typeof amtToLL==="function"?amtToLL(cx,cy):null}catch(e){return null}}
function toScreen(ll){try{if(onGlobe()){const p=amGlobe.projection(),r0=p.rotate();if(!amGlobe._flat&&d3.geoDistance(ll,[-r0[0],-r0[1]])>Math.PI/2-.02)return null;const q=p(ll),r=amGlobe.canvas.getBoundingClientRect();return q?[r.left+q[0],r.top+q[1]]:null}
 const svg=typeof amtSvg==="function"&&amtSvg(),q=svg&&typeof amtFromLL==="function"&&amtFromLL(ll);if(!q)return null;const m=svg.getScreenCTM();if(!m)return null;const P=new DOMPoint(q[0],q[1]).matrixTransform(m);return[P.x,P.y]}catch(e){return null}}
const kmBetween=(a,b)=>d3.geoDistance(a,b)*6371;
function inCountry(code,ll){try{return projFeatures().some(f=>f.geometry&&String(f.properties&&f.properties.c).toLowerCase()===code&&d3.geoContains(f,ll))}catch(e){return false}}
const sig=v=>{if(v<=0)return 0;const p=Math.pow(10,Math.floor(Math.log10(v))-1);return Math.round(v/p)*p};
const fmt=(v,unit)=>{const s=(Math.abs(v)<10&&v%1?v.toFixed(1):Math.round(v).toLocaleString("en-GB"));return unit?(unit==="%"||unit==="°C"||unit==="km²"?s+(unit==="%"?"%":" "+unit):s+" "+unit):s};

/* ---------------- state ---------------- */
const done={};          /* key -> {g:{v,ok}} / {f:"found"|"shown"} for this session, so a re-drawn card shows the result */
let F_ON=null;          /* {key, item, misses} while a Find-it is armed */

/* ---------------- card UI ---------------- */
function guessVal(G,s){return G.log?sig(G.min*Math.pow(G.max/G.min,s/1000)):+s}
function guessSlider(G,v){return G.log?Math.round(1000*Math.log(v/G.min)/Math.log(G.max/G.min)):v}
function guessHTML(k,G){const D=done[k]&&done[k].g;
 if(D)return'<div class="tp tp-g tp-done" data-tp="'+esc(k)+'"><b class="tp-h">🎯 Your guess</b>'+resultHTML(G,D.v)+'</div>';
 const mid=G.log?500:Math.round((G.min+G.max)/2/(G.step||1))*(G.step||1);
 return'<div class="tp tp-g" data-tp="'+esc(k)+'"><b class="tp-h">🎯 Guess first</b><div class="tp-q">'+esc(G.q)+'</div>'+
 '<div class="tp-row"><input type="range" class="tp-r" min="'+(G.log?0:G.min)+'" max="'+(G.log?1000:G.max)+'" step="'+(G.log?1:(G.step||1))+'" value="'+mid+'" aria-label="'+esc(G.q)+'" data-tp-r>'+
 '<output class="tp-o" data-tp-o>'+esc(fmt(guessVal(G,mid),G.unit))+'</output></div>'+
 '<div class="tp-btns"><button type="button" class="tp-b tp-go" data-tp-lock>Lock in my guess</button><button type="button" class="tp-b tp-sk" data-tp-skip>Just show me</button></div></div>'}
function resultHTML(G,v){const a=G.ans;let msg;
 if(v==null)msg="";else{const r=Math.abs(v-a)/Math.max(Math.abs(a),1e-9);msg=r<=.1?"Spot on!":r<=.25?"Very close!":r<=.5?"Not bad.":v<a?"Too low.":"Too high.";
  msg='You said <b>'+esc(fmt(v,G.unit))+'</b>. '+msg}
 return'<div class="tp-res" role="status">'+(msg?msg+' ':'')+'The answer: <b>'+esc(G.show||fmt(a,G.unit))+'</b>.</div>'}
function findHTML(k,I){const D=done[k]&&done[k].f;
 if(D)return'<div class="tp tp-f tp-done" data-tp="'+esc(k)+'"><b class="tp-h">📍 Find it</b><div class="tp-res" role="status">'+(D==="found"?"✓ You found "+esc(I.name)+".":"That is "+esc(I.name)+".")+'</div></div>';
 const on=F_ON&&F_ON.key===k;
 return'<div class="tp tp-f'+(on?' tp-on':'')+'" data-tp="'+esc(k)+'"><b class="tp-h">📍 Find it</b><div class="tp-q">'+esc(I.q)+'</div>'+
 '<div class="tp-msg" role="status" aria-live="polite" data-tp-msg>'+(on?'Click the map. Esc to stop.':'')+'</div>'+
 '<div class="tp-btns">'+(on?'':'<button type="button" class="tp-b tp-go" data-tp-arm>Find it on the map</button>')+'<button type="button" class="tp-b tp-sk" data-tp-show>Show me</button></div></div>'}
function uiFor(k){const G=GUESS[k],I=FIND[k];return(G?guessHTML(k,G):"")+(I?findHTML(k,I):"")}
function veil(){try{const k=keyOf(),c=ps&&ps.card;if(!c)return;c.classList.toggle("tp-veil",!!(k&&GUESS[k]&&!(done[k]&&done[k].g)))}catch(e){}}
function redraw(k){try{const c=ps&&ps.card;if(!c||keyOf()!==k)return;const box=c.querySelectorAll('[data-tp]');if(!box.length)return;const tmp=document.createElement("div");tmp.innerHTML=uiFor(k);box[0].replaceWith(...tmp.childNodes);for(let i=1;i<box.length;i++)box[i].remove();veil()}catch(e){console.error("tourplay",e)}}

/* ---------------- Find it: the map listener ---------------- */
let ring=null,raf=0,down=null,eat=false;
function ringAt(ll,kind){if(!ring){ring=document.createElement("div");ring.className="tp-ring";ring.setAttribute("aria-hidden","true");document.body.appendChild(ring)}
 ring.className="tp-ring tp-"+kind;ring._ll=ll;cancelAnimationFrame(raf);const tick=()=>{if(!ring)return;const q=toScreen(ring._ll);if(q){ring.style.display="block";ring.style.left=q[0]+"px";ring.style.top=q[1]+"px"}else ring.style.display="none";raf=requestAnimationFrame(tick)};tick()}
function ringOff(){cancelAnimationFrame(raf);if(ring){ring.remove();ring=null}}
let ringT=0;
/* a tap that answers a Find-it must not also open the country's profile: the globe engine opens it from its own
   pointerup (cfg.click), after ours, so its click callbacks skip while a Find-it is armed or has just eaten a tap */
function guardGlobe(){try{const c=amGlobe&&amGlobe.cfg;if(!c||c._tp)return;["click","clickLL"].forEach(n=>{const f=c[n];if(typeof f!=="function")return;c[n]=function(){if(F_ON||eat)return;return f.apply(this,arguments)}});c._tp=1}catch(e){}}
function arm(k){const I=FIND[k];if(!I)return;guardGlobe();try{gfOneTool.claim("tourplay")}catch(e){}F_ON={key:k,item:I,misses:0};document.documentElement.classList.add("tp-arming");redraw(k);
 const b=ps&&ps.card&&ps.card.querySelector('[data-tp-show]');if(b)try{b.focus({preventScroll:true})}catch(e){}}
function disarm(){if(!F_ON)return;F_ON=null;document.documentElement.classList.remove("tp-arming")}
function finish(k,how){const I=FIND[k];disarm();done[k]=Object.assign(done[k]||{},{f:how});redraw(k);if(I){ringAt(I.ll,how==="found"?"ok":"show");clearTimeout(ringT);ringT=setTimeout(ringOff,how==="found"?2500:5000)}}
function msg(t){const m=ps&&ps.card&&ps.card.querySelector('[data-tp-msg]');if(m)m.textContent=t}
function blocked(t){return!!(t&&t.closest&&t.closest('button,a,input,select,textarea,label,.ps-card,[role="dialog"],.gfk-tray,.gfk-obj,.tp-ui,.ps-pin,[data-ps-end]'))}
function inMap(x,y){const h=host();if(!h)return false;const r=h.getBoundingClientRect();return x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom}
window.addEventListener("pointerdown",e=>{if(!F_ON||e.button>0||blocked(e.target)||!inMap(e.clientX,e.clientY)){down=null;return}down={x:e.clientX,y:e.clientY,t:Date.now(),id:e.pointerId}},true);
window.addEventListener("pointerup",e=>{const d=down;down=null;if(!F_ON||!d||d.id!==e.pointerId)return;if(Math.hypot(e.clientX-d.x,e.clientY-d.y)>8||Date.now()-d.t>900)return;
 const ll=toLL(e.clientX,e.clientY);if(!ll)return;eat=true;setTimeout(()=>eat=false,400);const k=F_ON.key,I=F_ON.item;
 const ok=kmBetween(ll,I.ll)<=I.km||(I.code&&inCountry(I.code,ll));
 if(ok){finish(k,"found");return}
 F_ON.misses++;const dist=kmBetween(ll,I.ll),dir=bearing(ll,I.ll);
 if(F_ON.misses>=2){msg("Not there. Look for the pulsing ring"+(dir?", "+dir:"")+".");ringAt(I.ll,"hint")}
 else msg("Not quite: about "+fmt(sig(dist),"km")+" away"+(dir?", "+dir:"")+". Try again.")},true);
window.addEventListener("click",e=>{if(eat&&!blocked(e.target)){eat=false;e.stopPropagation();e.preventDefault()}},true);
function bearing(a,b){const r=Math.PI/180,y=Math.sin((b[0]-a[0])*r)*Math.cos(b[1]*r),x=Math.cos(a[1]*r)*Math.sin(b[1]*r)-Math.sin(a[1]*r)*Math.cos(b[1]*r)*Math.cos((b[0]-a[0])*r);
 const deg=(Math.atan2(y,x)/r+360)%360;return["to the north","to the north-east","to the east","to the south-east","to the south","to the south-west","to the west","to the north-west"][Math.round(deg/45)%8]}
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&F_ON){e.stopPropagation();e.preventDefault();const k=F_ON.key;disarm();ringOff();redraw(k)}},true);

/* ---------------- card buttons ---------------- */
document.addEventListener("input",e=>{const r=e.target.closest&&e.target.closest("[data-tp-r]");if(!r)return;const box=r.closest("[data-tp]"),G=box&&GUESS[box.getAttribute("data-tp")];if(!G)return;const o=box.querySelector("[data-tp-o]");if(o)o.textContent=fmt(guessVal(G,r.value),G.unit)});
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-tp-lock],[data-tp-skip],[data-tp-arm],[data-tp-show]");if(!b)return;const box=b.closest("[data-tp]"),k=box&&box.getAttribute("data-tp");if(!k)return;
 e.preventDefault();e.stopPropagation();
 try{if(b.hasAttribute("data-tp-lock")){const G=GUESS[k],r=box.querySelector("[data-tp-r]");done[k]=Object.assign(done[k]||{},{g:{v:guessVal(G,r.value)}});redraw(k)}
  else if(b.hasAttribute("data-tp-skip")){done[k]=Object.assign(done[k]||{},{g:{v:null}});redraw(k)}
  else if(b.hasAttribute("data-tp-arm"))arm(k);
  else if(b.hasAttribute("data-tp-show"))finish(k,"shown");
  const n=ps&&ps.card&&ps.card.querySelector('[data-tp="'+CSS.escape(k)+'"] button');if(n&&!b.isConnected)try{n.focus({preventScroll:true})}catch(_){}}catch(err){console.error("tourplay",err)}},true);
/* the veiled number: a click on it reveals it (counts as "just show me") */
document.addEventListener("click",e=>{const s=e.target.closest&&e.target.closest(".tp-veil .ps-stat");if(!s)return;const k=keyOf();if(k&&GUESS[k]&&!(done[k]&&done[k].g)){done[k]=Object.assign(done[k]||{},{g:{v:null}});redraw(k)}},true);

/* ---------------- cleanup ---------------- */
function cleanup(){disarm();ringOff();clearTimeout(ringT)}
let lastKey=null;
function watch(){const k=ps?keyOf():null;if(k!==lastKey){lastKey=k;cleanup()}if(ps&&ps.card&&!ps.card.querySelector("[data-tp]")&&k&&(GUESS[k]||FIND[k]))inject();else veil()}
function inject(){try{const c=ps&&ps.card,k=keyOf();if(!c||!k||c.querySelector("[data-tp]"))return;const ui=uiFor(k);if(!ui)return;const st=c.querySelector(".ps-stat");const tmp=document.createElement("div");tmp.innerHTML=ui;
 if(st&&st.parentNode)st.after(...tmp.childNodes);else c.append(...tmp.childNodes);veil()}catch(e){console.error("tourplay",e)}}

/* ---------------- styles ---------------- */
{const st=document.createElement("style");st.textContent=`
.tp{margin:4px 0 10px;padding:9px 11px;border-radius:12px;border:1.5px solid #e8701a;background:#fff8f1;color:#3b2a1a;font-size:13.5px;line-height:1.35}
.tp-h{display:block;font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:#b4530f;margin-bottom:3px}
.tp-q{font-weight:700;margin-bottom:6px}
.tp-row{display:flex;align-items:center;gap:10px}.tp-r{flex:1;min-width:0;accent-color:#e8701a;height:28px}
.tp-o{min-width:84px;text-align:right;font-weight:800;color:#9a3412;font-variant-numeric:tabular-nums}
.tp-btns{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
.tp-b{padding:6px 12px;min-height:32px;border-radius:999px;border:1.5px solid #e8701a;background:#fff;color:#b4530f;font:800 12.5px inherit;font-family:inherit;cursor:pointer}
.tp-b.tp-go{background:#e8701a;color:#fff}.tp-b:hover{filter:brightness(1.07)}.tp-b:focus-visible{outline:3px solid #2a78d0;outline-offset:2px}
.tp-sk{border-color:transparent;background:transparent;text-decoration:underline}
.tp-res{font-size:13.5px}.tp-msg{min-height:0;font-weight:700;color:#9a3412}.tp-msg:empty{display:none}
.tp-on{box-shadow:0 0 0 3px rgba(232,112,26,.35)}
.tp-veil .ps-stat{filter:blur(6px);cursor:pointer;user-select:none;transition:filter .3s}
html.tp-arming #amGlobeHost canvas,html.tp-arming #allMapsWrap svg{cursor:crosshair!important}
.tp-ring{position:fixed;z-index:60;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;pointer-events:none;border:3px solid #e8701a;box-shadow:0 0 0 3px rgba(255,255,255,.85)}
.tp-ring.tp-hint,.tp-ring.tp-show{animation:tpPulse 1.1s ease-out infinite}
.tp-ring.tp-ok{border-color:#1f9d55;animation:tpPulse 1.1s ease-out 2}
@keyframes tpPulse{0%{transform:scale(.6);opacity:1}100%{transform:scale(1.6);opacity:.15}}
@media (prefers-reduced-motion:reduce){.tp-ring{animation:none!important}}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .tp{background:rgba(232,112,26,.12);color:#f3e6da}:root:not([data-theme="light"]) .tp-b{background:transparent;color:#ffc89a}:root:not([data-theme="light"]) .tp-b.tp-go{background:#e8701a;color:#fff}:root:not([data-theme="light"]) .tp-h,:root:not([data-theme="light"]) .tp-o,:root:not([data-theme="light"]) .tp-msg{color:#ffc89a}}
:root[data-theme="dark"] .tp{background:rgba(232,112,26,.12);color:#f3e6da}:root[data-theme="dark"] .tp-b{background:transparent;color:#ffc89a}:root[data-theme="dark"] .tp-b.tp-go{background:#e8701a;color:#fff}:root[data-theme="dark"] .tp-h,:root[data-theme="dark"] .tp-o,:root[data-theme="dark"] .tp-msg{color:#ffc89a}
`;document.head.appendChild(st)}

/* ---------------- wiring (waits for the tour code) ---------------- */
function addDrags(){let n=0;for(const k in DRAG){const i=k.indexOf("|"),T=PS_TOURS[k.slice(0,i)];if(!T||!T.steps)continue;const S=T.steps.find(s=>clean(s.title)===k.slice(i+1));if(!S||S.drag||S.ghosts)continue;try{S.drag=Object.assign({},DRAG[k]);n++}catch(e){}}return n}
function wire(){if(typeof PS_TOURS==="undefined"||typeof psGo!=="function"||typeof psEnd!=="function"||typeof psCardHTML!=="function")return false;
 if(psGo._tp)return true;
 addDrags();
 {const _pg=psGo;psGo=function(){cleanup();const r=_pg.apply(this,arguments);try{lastKey=keyOf();inject()}catch(e){}return r};psGo._tp=1}
 {const _pe=psEnd;psEnd=function(){cleanup();lastKey=null;return _pe.apply(this,arguments)};psEnd._tp=1}
 {const _c=psCardHTML;psCardHTML=function(){let h=_c.apply(this,arguments);try{const k=keyOf(),ui=k&&uiFor(k);if(ui){const i=h.indexOf('class="ps-stat"'),at=i>0?h.indexOf("</div>",i):-1;h=at>0?h.slice(0,at+6)+ui+h.slice(at+6):h+ui}}catch(e){console.error("tourplay",e)}return h};psCardHTML._tp=1}
 try{gfOneTool.on("tourplay",()=>{if(F_ON){const k=F_ON.key;disarm();ringOff();redraw(k)}})}catch(e){}
 setInterval(watch,400);
 return true}
if(!wire()){const t=setInterval(()=>{if(wire())clearInterval(t)},300)}
})();
