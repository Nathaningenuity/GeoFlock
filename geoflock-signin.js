/* GeoFlock: sign in (a simulator: names and passwords stay in this browser, nothing is sent anywhere) and what needs it.
   - The account button (top right) opens Sign in / Sign up: a username and a password. Signed in, it shows your initial
     and a menu (your progress profiles, sign out).
   - Without signing in: the Relief map (flat and globe), the Guided tour on geography and Unit 1 of Human Geo are open; every other map,
     Projections, Deep Time and Printable maps, the other guided tours and Human Geo Units 2-7 ask you to sign up first, with a
     picture of what you would get. Study & Quiz and Trivia allow 10 questions, and each game one round or 5 questions.
     While the sign-up card is open, the map you asked for starts loading, so it is ready when you are in.
   - The Trace the River game is hidden for now.
   Passwords are kept only as a salted SHA-256 hash (localStorage gfSimUsers); the signed-in name is gfSignIn and what
   you have used for free is gfFreeUse. */
(function(){
const LS=k=>{try{return JSON.parse(localStorage.getItem(k)||"null")}catch(e){return null}};
const SV=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
let SI=LS("gfSignIn");const USERS=LS("gfSimUsers")||{};const FREE=Object.assign({study:0,trivia:0,g:{}},LS("gfFreeUse")||{});
const signed=()=>!!(SI&&SI.user);window.gfSignedIn=signed;
const saveFree=()=>SV("gfFreeUse",FREE);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const G=n=>{try{return(0,eval)(n)}catch(e){return undefined}};/* top-level let/const by name */
async function hash(name,pw){const s="geoflock-sim:"+name.toLowerCase()+":"+pw;
 try{const d=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s));return[...new Uint8Array(d)].map(b=>b.toString(16).padStart(2,"0")).join("")}
 catch(e){let h=5381;for(let i=0;i<s.length;i++)h=(h*33^s.charCodeAt(i))>>>0;return"x"+h.toString(16)}}

/* ---------- what each locked thing is ---------- */
const MAPS={satellite:"Satellite",elevation:"Elevation Map",population:"Population Map",gdp:"Economy Map",climate:"Climate Map",politics:"Politics Map",
 culture:"Culture Map",people:"People Map",nature:"Nature Map",history:"History Map",night:"City Lights",political:"World Map",
 projections:"Projections",deeptime:"Deep Time",print:"Printable maps"};
const BLURB={satellite:"The Earth from space, with real clouds, on a flat map or a spinning globe.",elevation:"Mountains and ocean depths in colour, with cross-sections you draw yourself.",
 population:"Where 8 billion people live, down to the city.",gdp:"Rich and poor countries, and how economies compare.",climate:"Every climate zone on Earth, with climate graphs for any place.",
 politics:"How every country is governed.",culture:"Languages, religions and cultures of the world.",people:"Life expectancy, ages, migration and more.",
 nature:"Biomes, forests, deserts and wildlife.",history:"5,000 years of borders, year by year, animated.",night:"The Earth at night: cities lit from space.",
 political:"Every country and its borders.",projections:"Why every flat map distorts something.",deeptime:"Continents drifting over 500 million years.",print:"Maps to print for class or the wall."};
const IMG={projections:"projections",deeptime:"deeptime",print:"politics",political:"politics"};
const PERKS=["All 14 maps, on the flat map and the globe","60+ guided tours, from rivers to empires","The full AP Human Geography course","Unlimited quizzes, trivia and games","Your progress, streaks and passport stamps saved"];

/* ---------- styles ---------- */
const css=document.createElement("style");css.textContent=`
.gf-si{position:fixed;inset:0;z-index:10060;display:flex;align-items:center;justify-content:center;background:rgba(10,16,32,.55);padding:16px;animation:gfSiIn .18s ease-out}
@keyframes gfSiIn{from{opacity:0}to{opacity:1}}
.gf-si>.c{width:min(460px,100%);max-height:calc(100vh - 32px);overflow:auto;background:#fffdf8;color:#22324a;border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,.35);font:500 14.5px/1.45 system-ui,sans-serif;position:relative}
.gf-si .shot{position:relative;height:196px;background:#cfdbe6 center/cover no-repeat;border-radius:20px 20px 0 0}
.gf-si .shot::after{content:"";position:absolute;inset:0;border-radius:20px 20px 0 0;background:linear-gradient(to bottom,rgba(0,0,0,0) 45%,rgba(0,0,0,.55))}
.gf-si .shot b{position:absolute;left:18px;bottom:12px;z-index:1;color:#fff;font-size:20px;text-shadow:0 1px 4px rgba(0,0,0,.5)}
.gf-si .shot i{position:absolute;left:14px;top:12px;z-index:1;background:rgba(255,255,255,.92);color:#22324a;border-radius:999px;padding:4px 10px;font:700 12px system-ui;font-style:normal}
.gf-si .bd{padding:18px 22px 20px}
.gf-si h3{margin:0 0 4px;font-size:19px}.gf-si p{margin:0 0 10px;color:#4a5a70}
.gf-si ul{margin:6px 0 14px;padding:0;list-style:none}.gf-si li{padding:3px 0 3px 24px;position:relative}
.gf-si li::before{content:"✓";position:absolute;left:2px;color:#2a9d8f;font-weight:800}
.gf-si .x{position:absolute;right:10px;top:10px;z-index:2;width:32px;height:32px;border:0;border-radius:50%;background:rgba(255,255,255,.92);color:#22324a;font-size:16px;cursor:pointer}
.gf-si .row{display:flex;gap:8px;flex-wrap:wrap}
.gf-si button.b{border:0;border-radius:999px;padding:10px 18px;font:700 14.5px system-ui;cursor:pointer;background:#e9edf3;color:#22324a}
.gf-si button.b.pri{background:#2a9d8f;color:#fff;flex:1}
.gf-si form{display:flex;flex-direction:column;gap:10px;margin-top:4px}
.gf-si label{display:flex;flex-direction:column;gap:4px;font-weight:700;font-size:13px}
.gf-si input{font:500 15px system-ui;padding:10px 12px;border-radius:12px;border:1.5px solid #ccd6e0;background:#fff;color:#22324a}
.gf-si input:focus{outline:none;border-color:#2a9d8f;box-shadow:0 0 0 3px rgba(42,157,143,.2)}
.gf-si .tabs{display:flex;gap:4px;background:#eef2f6;border-radius:999px;padding:4px;margin:2px 0 12px}
.gf-si .tabs button{flex:1;border:0;border-radius:999px;padding:8px;font:700 14px system-ui;background:none;color:#4a5a70;cursor:pointer}
.gf-si .tabs button.on{background:#fff;color:#22324a;box-shadow:0 1px 4px rgba(0,0,0,.1)}
.gf-si .err{color:#c0392b;font-size:13px;min-height:1em}
.gf-si .note{font-size:12px;color:#7a8898;margin-top:8px}
.gf-si .ld{font-size:12.5px;color:#2a9d8f;margin:-4px 0 10px}
body.sky-night .gf-si>.c,body.dark .gf-si>.c{background:#1d2638;color:#e6edf7}
body.sky-night .gf-si p,body.dark .gf-si p{color:#b6c2d4}
body.sky-night .gf-si input,body.dark .gf-si input{background:#141b2b;border-color:#3a4760;color:#e6edf7}
body.sky-night .gf-si .tabs,body.dark .gf-si .tabs{background:#141b2b}body.sky-night .gf-si .tabs button.on,body.dark .gf-si .tabs button.on{background:#2c3750;color:#fff}
body.sky-night .gf-si button.b:not(.pri),body.dark .gf-si button.b:not(.pri){background:#2c3750;color:#e6edf7}
.gf-si-menu{position:fixed;z-index:10061;min-width:220px;background:#fffdf8;color:#22324a;border-radius:14px;box-shadow:0 12px 36px rgba(0,0,0,.25);padding:8px;font:500 14px system-ui}
.gf-si-menu .who{padding:8px 10px 10px;border-bottom:1px solid #e3e8ee;margin-bottom:6px}.gf-si-menu .who b{display:block;font-size:15px}
.gf-si-menu button{display:block;width:100%;text-align:left;border:0;background:none;padding:9px 10px;border-radius:9px;font:600 14px system-ui;color:inherit;cursor:pointer}
.gf-si-menu button:hover{background:#eef2f6}
body.sky-night .gf-si-menu,body.dark .gf-si-menu{background:#1d2638;color:#e6edf7}body.sky-night .gf-si-menu button:hover,body.dark .gf-si-menu button:hover{background:#2c3750}
.gf-lockchip{position:relative}
body:not(.gf-in) #allMapsToggleRow [data-allmaps-mode]:not([data-allmaps-mode="relief"])::before,
body:not(.gf-in) #projTabChip::before,body:not(.gf-in) #gfDeepChip::before,body:not(.gf-in) #gfPrintChip::before{
 content:"";position:absolute;left:3px;top:3px;width:10px;height:10px;opacity:.6;background:currentColor;
 -webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M7 10V7a5 5 0 0 1 10 0v3h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2zm2 0h6V7a3 3 0 0 0-6 0z'/%3E%3C/svg%3E") center/contain no-repeat;mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M7 10V7a5 5 0 0 1 10 0v3h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2zm2 0h6V7a3 3 0 0 0-6 0z'/%3E%3C/svg%3E") center/contain no-repeat;z-index:2}
body:not(.gf-in) #allMapsToggleRow [data-allmaps-mode]:not([data-allmaps-mode="relief"]),body:not(.gf-in) #projTabChip,body:not(.gf-in) #gfDeepChip,body:not(.gf-in) #gfPrintChip{position:relative;overflow:visible}
#regionRow [data-g="river"]{display:none!important}
.acct-btn .gf-si-ico{width:18px;height:18px;display:block}`;
document.head.appendChild(css);
const syncBody=()=>document.body&&document.body.classList.toggle("gf-in",signed());syncBody();

/* ---------- the account button ---------- */
const ICO='<svg class="gf-si-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>';
function renderBtn(){const b=document.getElementById("acctBtn");if(!b)return;
 if(signed()){const ini=(SI.user.trim()[0]||"?").toUpperCase();if(b.textContent!==ini||b.querySelector(".gf-si-ico"))b.innerHTML='<span class="acct-ini">'+esc(ini)+"</span>";b.title="Signed in as "+SI.user;b.setAttribute("aria-label","Signed in as "+SI.user+". Account menu")}
 else{if(!b.querySelector(".gf-si-ico"))b.innerHTML=ICO;b.title="Sign in";b.setAttribute("aria-label","Sign in")}}
if(typeof acctRenderBtn==="function"){const _r=acctRenderBtn;acctRenderBtn=function(){const r=_r.apply(this,arguments);renderBtn();return r}}
renderBtn();setTimeout(renderBtn,800);setTimeout(renderBtn,3000);
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("#acctBtn");if(!b)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
 if(signed())menu(b);else open({mode:"in"})},true);
function menu(b){const old=document.querySelector(".gf-si-menu");if(old){old.remove();return}
 const m=document.createElement("div");m.className="gf-si-menu";m.setAttribute("role","menu");
 m.innerHTML='<div class="who">Signed in as<b>'+esc(SI.user)+'</b></div><button type="button" data-a="prof">Progress profiles…</button><button type="button" data-a="out">Sign out</button>';
 document.body.appendChild(m);const r=b.getBoundingClientRect();m.style.top=r.bottom+8+"px";m.style.left=Math.max(8,Math.min(innerWidth-m.offsetWidth-8,r.right-m.offsetWidth))+"px";
 const close=()=>{m.remove();document.removeEventListener("click",out,true)};const out=ev=>{if(!m.contains(ev.target)&&!ev.target.closest("#acctBtn"))close()};setTimeout(()=>document.addEventListener("click",out,true),0);
 m.querySelector('[data-a="prof"]').onclick=()=>{close();try{acctOpen()}catch(e){}};
 m.querySelector('[data-a="out"]').onclick=()=>{close();SI=null;SV("gfSignIn",null);syncBody();renderBtn();toast("Signed out")}}
function toast(t){const d=document.createElement("div");d.textContent=t;Object.assign(d.style,{position:"fixed",left:"50%",bottom:"28px",transform:"translateX(-50%)",zIndex:10070,background:"#22324a",color:"#fff",padding:"10px 18px",borderRadius:"999px",font:"600 14px system-ui",boxShadow:"0 8px 24px rgba(0,0,0,.25)"});document.body.appendChild(d);setTimeout(()=>d.remove(),2400)}

/* ---------- the sign-in / sign-up card ---------- */
let CUR=null;
/* o: {mode:"in"|"up", key (a map), title, text, img, then: function to run once signed in} */
function open(o){if(CUR)CUR.remove();o=o||{};let mode=o.mode||"up";
 const d=document.createElement("div");d.className="gf-si";d.setAttribute("role","dialog");d.setAttribute("aria-modal","true");CUR=d;
 const shot=o.img?'<div class="shot" style="background-image:url(textures/lock/'+o.img+'.webp)"><i>🔒 Members</i><b>'+esc(o.title||"")+"</b></div>":"";
 const gate=o.text?'<h3>'+esc(o.head||"Sign up to open this")+'</h3><p>'+esc(o.text)+'</p>'+(o.loading?'<div class="ld">⏳ '+esc(o.loading)+'</div>':"")+'<p style="margin:0"><b>A free account unlocks:</b></p><ul>'+PERKS.map(p=>"<li>"+esc(p)+"</li>").join("")+"</ul>":"";
 d.innerHTML='<div class="c">'+(shot?"":"")+shot+'<button type="button" class="x" aria-label="Close">✕</button><div class="bd">'+gate+(gate?"":'<h3>Welcome to GeoFlock</h3><p>Sign in to keep your progress and open every map, tour and game.</p>')+
  '<div class="tabs" role="tablist"><button type="button" data-m="up">Sign up</button><button type="button" data-m="in">Sign in</button></div>'+
  '<form novalidate><label>Username<input name="u" autocomplete="username" maxlength="24" required></label><label>Password<input name="p" type="password" autocomplete="current-password" maxlength="64" required></label>'+
  '<div class="err" aria-live="polite"></div><div class="row"><button type="submit" class="b pri"></button>'+(o.text?'<button type="button" class="b" data-later>Not now</button>':"")+'</div></form>'+
  '<div class="note">This is a practice sign-in: your name and password stay on this device and are not sent anywhere.</div></div></div>';
 document.body.appendChild(d);
 const f=d.querySelector("form"),err=d.querySelector(".err"),sub=f.querySelector('[type="submit"]'),pw=f.p;
 const setMode=m=>{mode=m;d.querySelectorAll("[data-m]").forEach(b=>{b.classList.toggle("on",b.dataset.m===m);b.setAttribute("aria-selected",String(b.dataset.m===m))});sub.textContent=m==="up"?"Create account":"Sign in";pw.autocomplete=m==="up"?"new-password":"current-password";err.textContent=""};
 setMode(mode);d.querySelectorAll("[data-m]").forEach(b=>b.onclick=()=>setMode(b.dataset.m));
 const close=()=>{d.remove();if(CUR===d)CUR=null;document.removeEventListener("keydown",key,true)};
 const key=e=>{if(e.key==="Escape"){e.stopPropagation();close()}};document.addEventListener("keydown",key,true);
 d.querySelector(".x").onclick=close;const l=d.querySelector("[data-later]");if(l)l.onclick=close;d.addEventListener("click",e=>{if(e.target===d)close()});
 f.onsubmit=async e=>{e.preventDefault();const u=f.u.value.trim(),p=pw.value;
  if(u.length<2){err.textContent="Choose a username of at least 2 characters.";f.u.focus();return}
  if(!/^[\w .\-]+$/.test(u)){err.textContent="Use letters, numbers, spaces, dots, dashes or underscores.";f.u.focus();return}
  if(p.length<4){err.textContent="Use a password of at least 4 characters.";pw.focus();return}
  const k=u.toLowerCase(),h=await hash(u,p);
  if(mode==="up"){if(USERS[k]){err.textContent="That username is taken on this device. Sign in instead?";return}USERS[k]={name:u,h};SV("gfSimUsers",USERS)}
  else{if(!USERS[k]){err.textContent="No account with that name on this device. Sign up instead?";return}if(USERS[k].h!==h){err.textContent="Wrong password.";pw.value="";pw.focus();return}}
  SI={user:USERS[k].name,at:Date.now()};SV("gfSignIn",SI);syncBody();renderBtn();close();toast((mode==="up"?"Welcome, ":"Welcome back, ")+SI.user+"! Everything is open.");
  if(o.then)setTimeout(()=>{try{o.then()}catch(x){console.error(x)}},60)};
 setTimeout(()=>f.u.focus(),30)}
window.gfSignIn=open;

/* ---------- maps ---------- */
function preload(k){/* the sign-up card buys time: the map starts loading behind it */
 try{if(["satellite","night","elevation"].includes(k)&&typeof globeImages==="function")globeImages(k,()=>{})}catch(e){}
 try{if(k==="night"&&typeof globeImages==="function")globeImages("satellite",()=>{})}catch(e){}
 try{if(k==="history"&&window.GF_HIST2&&GF_HIST2.featsAt)GF_HIST2.featsAt(GF_HIST2.year())}catch(e){}
 try{const b=document.querySelector('[data-allmaps-mode="'+k+'"]');const src=b&&b.dataset.src;if(src)new Image().src=src}catch(e){}}
function mapGate(k,el){preload(k);const name=MAPS[k]||"This map";
 open({img:IMG[k]||k,title:name,head:"Sign up to open the "+name.replace(/ Map$/,"")+(/map|lights|time|projections/i.test(name)?"":" map"),text:"Access to this map requires a free account. "+(BLURB[k]||""),loading:"The map is loading while you sign up.",
  then:()=>{if(el&&el.isConnected)el.click()}})}
const keyOf=el=>el.dataset&&el.dataset.allmapsMode||(el.id==="projTabChip"?"projections":el.id==="gfDeepChip"?"deeptime":el.id==="gfPrintChip"?"print":null);
document.addEventListener("click",e=>{if(signed()||!e.target.closest)return;
 const el=e.target.closest('#allMapsToggleRow [data-allmaps-mode]:not([data-allmaps-mode="relief"]),#projTabChip,#gfDeepChip,#gfPrintChip');if(!el)return;
 if(tourOn("geo"))return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();mapGate(keyOf(el),el)},true);
const tourOn=id=>{try{const p=G("ps");return!!p&&(!id||p.tour===id)}catch(e){return false}};
/* any other way onto a locked map (links, buttons elsewhere): back to Relief, and the card */
let lastBlock=0;
setInterval(()=>{if(signed())return;try{
 if(G("appMode")!=="allmaps")return;if(tourOn("geo"))return;
 const m=G("allMapsColorMode"),on=G("allMapsColorModeOn"),pr=G("proj");
 let k=null;if(on&&m&&m!=="relief")k=m;else if(pr&&pr.on)k="projections";else if(document.querySelector("#gfDeepChip.active,#gfDeepChip.on"))k="deeptime";
 if(!k)return;if(tourOn())return;/* a tour that was started some other way is stopped by the tour gate */
 if(pr&&pr.on&&typeof projShow==="function")projShow(false);
 const rb=document.querySelector('#allMapsToggleRow [data-allmaps-mode="relief"]');if(rb){e_skip=true;rb.click();e_skip=false}
 if(Date.now()-lastBlock>4000){lastBlock=Date.now();mapGate(k,document.querySelector('#allMapsToggleRow [data-allmaps-mode="'+k+'"]'))}}catch(e){}},400);
let e_skip=false;

/* ---------- tours and Human Geo ---------- */
const freeTour=id=>id==="geo"||/^hg1/.test(String(id||""));
function tourGate(id,then){let nm="";try{nm=PS_TOURS[id]&&PS_TOURS[id].name||""}catch(e){}
 open({img:null,head:"Sign up for this guided tour",text:(nm?nm+": ":"")+"guided tours other than the Guided tour on geography need a free account.",then})}
function W(name,mk){const f=window[name];if(typeof f!=="function"||f._gfSi)return;const w=mk(f);w._gfSi=1;try{window[name]=w}catch(e){}}
function wrapAll(){
 W("psLaunchTour",o=>function(id){if(!signed()&&id&&!freeTour(id)){const a=arguments,t=this;tourGate(id,()=>o.apply(t,a));return}return o.apply(this,arguments)});
 W("psStart",o=>function(want){if(!signed()){let id=want;if(!id)try{id=psCtx().tour}catch(e){}
   if(!freeTour(id)){const a=arguments,t=this;tourGate(id,()=>o.apply(t,a));return}}return o.apply(this,arguments)});
 /* Study & Quiz: 10 questions */
 W("finalizeAnswer",o=>function(){if(!signed()){FREE.study++;saveFree()}return o.apply(this,arguments)});
 W("spAnswer",o=>function(){if(!signed()){if(FREE.study>=10){studyGate();return}FREE.study++;saveFree()}return o.apply(this,arguments)});
 W("renderQuizCard",o=>function(){if(!signed()&&FREE.study>=10){let rd=G("round");if(rd&&rd.queue&&rd.idx<rd.queue.length&&rd.idx>0){studyGate();return}}return o.apply(this,arguments)});
 /* Trivia: 10 questions */
 W("triviaRecord",o=>function(){if(!signed()){FREE.trivia++;saveFree()}return o.apply(this,arguments)});
 W("triviaNext",o=>function(){if(!signed()&&FREE.trivia>=10){triviaGate();return}return o.apply(this,arguments)});
 W("triviaStart",o=>function(){if(!signed()&&FREE.trivia>=10){triviaGate();return}return o.apply(this,arguments)});
 W("tsPickAns",o=>function(){if(!signed()&&FREE.trivia>=10){triviaGate();return}return o.apply(this,arguments)});
 W("jpCredit",o=>function(){if(!signed()&&FREE.trivia>=10){triviaGate();return}return o.apply(this,arguments)});
 /* games */
 const inGames=()=>G("appMode")==="games";
 const gc=id=>FREE.g[id]||0,gi=(id,n)=>{FREE.g[id]=gc(id)+(n||1);saveFree()};
 const block=(id,lim)=>!signed()&&inGames()&&gc(id)>=lim;
 const rnd=(fn,id)=>W(fn,o=>function(){if(block(id,1)){gameGate(id);return}return o.apply(this,arguments)});
 const end=(fn,id)=>W(fn,o=>function(){const r=o.apply(this,arguments);if(!signed()&&inGames())gi(id);return r});
 /* one round: Globle, Border Chain, Memory Match, Silhouette Rush */
 rnd("submitGlobleGuess","globle");end("recordGlobleWin","globle");end("recordGlobleGiveUp","globle");
 rnd("submitChainStep","chain");end("recordChainSolve","chain");end("recordChainGiveUp","chain");
 W("memFlip",o=>function(){if(block("memory",1)){gameGate("memory");return}const r=o.apply(this,arguments);
   try{const m=G("mem");if(!signed()&&inGames()&&m&&m.matched&&m.matched.size===memPairs()&&!m._gfSi){m._gfSi=1;gi("memory")}}catch(e){}return r});
 W("srHit",o=>function(){if(block("silrush",1)){gameGate("silrush");return}return o.apply(this,arguments)});end("srOver","silrush");
 /* 5 questions: Higher or Lower, Flagpie, Flag Reveal, Where is this?, Scramble, Mystery Country, Neighbours, Close Enough */
 W("hiloAnswer",o=>function(){if(block("hilo",5)){gameGate("hilo");return}const h=G("hilo"),was=h&&h.picked;const r=o.apply(this,arguments);if(!signed()&&inGames()&&h&&!was&&h.picked)gi("hilo");return r});
 rnd5("submitFlagpieGuess","flagpie");end("fpFinish","flagpie");
 W("frNext",o=>function(){if(block("reveal",5)){gameGate("reveal");return}return o.apply(this,arguments)});end("frFinish","reveal");
 rnd5("wiGuess","whereis");end("wiFinish","whereis");
 W("scrSubmit",o=>function(){if(block("scramble",5)){gameGate("scramble");return}const r=o.apply(this,arguments);if(!signed()&&inGames())gi("scramble");return r});
 W("myGuess",o=>function(){if(block("mystery",5)){gameGate("mystery");return}const m=G("MY"),was=m&&m.done;const r=o.apply(this,arguments);if(!signed()&&inGames()&&m&&!was&&m.done)gi("mystery");return r});
 W("nbPick",o=>function(){if(!signed()&&inGames()){if(gc("neighbours")>=5){gameGate("neighbours");return}gi("neighbours")}return o.apply(this,arguments)});
 W("pqRender",o=>function(){const q=G("pq");if(!signed()&&inGames()&&q){const n=(q.log||[]).length;if(q._gfN==null||n<q._gfN)q._gfN=n;if(n>q._gfN){gi("popguess",n-q._gfN);q._gfN=n}
   else if(q.state!=="setup"&&q.state!=="end"&&gc("popguess")>=5&&q._gfR===n){gameGate("popguess");return}q._gfR=n}return o.apply(this,arguments)});
 W("pqStart",o=>function(){if(block("popguess",5)){gameGate("popguess");return}return o.apply(this,arguments)});
 function rnd5(fn,id){W(fn,o=>function(){if(block(id,5)){gameGate(id);return}return o.apply(this,arguments)})}
 /* Trace the River is hidden for now */
 try{const N=G("NEW_GAMES");if(N){const i=N.findIndex(g=>g[0]==="river");if(i>=0)N.splice(i,1)}}catch(e){}}
wrapAll();[500,1500,4000,9000].forEach(t=>setTimeout(wrapAll,t));
function apGate(u,then){open({img:null,head:"Sign up for Unit "+u+" of Human Geo",text:"Unit 1 of the AP Human Geography course is free. Units 2 to 7 (tours, labs, practice and unit tests) need a free account.",then})}
function studyGate(){open({head:"You've answered your 10 free questions",text:"Sign up for free to keep practising in Study & Quiz, with every subject and mode.",then:()=>{try{renderQuizCard()}catch(e){}}})}
function triviaGate(){open({head:"You've answered your 10 free trivia questions",text:"Sign up for free for unlimited trivia, topic quizzes, speed rounds and Jeopardy.",then:()=>{try{triviaNext()}catch(e){}}})}
const GNAME={globle:"Globle",chain:"Border Chain",memory:"Memory Match",silrush:"Silhouette Rush",hilo:"Higher or Lower",flagpie:"Flagpie",reveal:"Flag Reveal",whereis:"Where is this?",scramble:"Scramble",mystery:"Mystery Country",neighbours:"Neighbours",popguess:"Close Enough",langid:"Which Language?",climguess:"Guess the Climate"};
function gameGate(id){const one=["globle","chain","memory","silrush"].includes(id);
 open({head:"That was your free "+(one?"round":"5 questions")+" of "+(GNAME[id]||"this game"),text:"Sign up for free to keep playing "+(GNAME[id]||"this game")+" and every other game as much as you like."})}
document.addEventListener("click",e=>{if(signed()||!e.target.closest||e_skip)return;
 {const h=e.target.closest("[data-hggo]");if(h){const v=h.dataset.hggo,m=/(?:t:hg|u)(\d+)/.exec(v),u=m?+m[1]:1;
  if(u>1){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();apGate(u,()=>{if(h.isConnected)h.click()});return}}}
 if(G("appMode")!=="games")return;const g=G("activeGame");
 /* closure games: Which Language? and Guess the Climate, 5 answers each */
 const lang=g==="langid"&&e.target.closest("#gamesView .li-o"),clim=g==="climguess"&&e.target.closest("#gamesView .cg-go, #gamesView .cg-sug li, #gamesView .cg-skip");
 if(lang||clim){const id=lang?"langid":"climguess";if((FREE.g[id]||0)>=5){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();gameGate(id);return}FREE.g[id]=(FREE.g[id]||0)+1;saveFree()}},true);
document.addEventListener("keydown",e=>{if(signed()||e.key!=="Enter")return;try{if(G("appMode")==="games"&&G("activeGame")==="climguess"&&e.target.closest&&e.target.closest("#gamesView")&&e.target.tagName==="INPUT"){
 if((FREE.g.climguess||0)>=5){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();gameGate("climguess");return}FREE.g.climguess=(FREE.g.climguess||0)+1;saveFree()}}catch(x){}},true);
window.gfFreeUse=()=>JSON.parse(JSON.stringify(FREE));
})();
