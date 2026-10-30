/* GeoFlock: guided tours say when they are loading, and each tour has its own link.
   - Opening a tour shows "Opening <tour>…" over the map until the tour's first card is up; if it never comes, a
     "Try again" button instead of a silent map.
   - During a tour, while the map's pictures or a history year are still loading, a small "Loading the map…" chip shows.
   - Links: #tour=<id> (and &stop=<n>) opens that tour at that stop; the address follows the tour as you move through it,
     so it can be copied and shared. Ending the tour clears it. A "Copy link" button sits in the tour card menu row. */
(function(){
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const on=()=>typeof ps!=="undefined"&&!!ps;
let chip=null,want=null,wantAt=0,wantStop=0,busySince=0;
function host(){return document.getElementById("amGlobeHost")||document.getElementById("allMapsWrap")||document.body}
function show(html,btn){if(!chip){chip=document.createElement("div");chip.className="gftl";chip.setAttribute("role","status");chip.setAttribute("aria-live","polite")}
 const h=host();if(chip.parentNode!==h)h.appendChild(chip);chip.innerHTML='<span class="gftl-spin"'+(btn?' hidden':'')+'></span><span class="gftl-t">'+html+'</span>'+(btn||"");chip.hidden=false}
function hide(){if(chip)chip.hidden=true}
function nameOf(id){try{const T=PS_TOURS[id];return T.short||T.name}catch(e){return"the tour"}}
/* 1. opening a tour */
function hook(){if(typeof psLaunchTour!=="function"||psLaunchTour._gftl)return false;const _l=psLaunchTour;
 psLaunchTour=function(id){if(typeof PS_TOURS!=="undefined"&&PS_TOURS[id]){want=id;wantAt=Date.now()}return _l.apply(this,arguments)};psLaunchTour._gftl=1;return true}
if(!hook()){const t=setInterval(()=>{if(hook())clearInterval(t)},300)}
/* 2. the loop: opening state, map-loading state, and the address */
let lastHash="";
setInterval(()=>{try{
 document.body.classList.toggle("gf-touring",on());
 /* the toolkit sits right under the tour card (folded at first); in full screen it keeps its own spot */
 try{const tr=document.querySelector("#allMapsView .gfk-tray"),card=on()&&ps.card;
  if(tr&&card&&card.isConnected&&innerWidth>640&&!document.body.classList.contains("gf-fs")){const par=tr.offsetParent;if(par){const pr=par.getBoundingClientRect(),cr=card.getBoundingClientRect();
   tr.style.setProperty("top",Math.round(cr.bottom-pr.top+8)+"px","important");tr.style.setProperty("left",Math.round(cr.left-pr.left)+"px","important");tr.style.setProperty("bottom","auto","important");tr.style.setProperty("z-index","8","important");tr._gftl=1}}
  else if(tr&&tr._gftl){["top","left","bottom","z-index"].forEach(k=>tr.style.removeProperty(k));tr._gftl=0}}catch(e){}
 if(want){const age=Date.now()-wantAt;
  if(on()&&ps.tour===want){const st=wantStop;want=null;wantStop=0;if(chip)hide();if(st>0&&typeof psGo==="function")setTimeout(()=>{try{if(on())psGo(st)}catch(e){}},400)}
  else if(typeof appMode!=="undefined"&&appMode==="allmaps"&&!on()){
   /* the engine's own retries ran out (a slow map): keep trying, putting the tour's map back on if it slipped */
   if(age>12000&&Date.now()-(window._gftlTry||0)>1500){window._gftlTry=Date.now();try{const T=PS_TOURS[want],m=T.map.mode,ch=document.querySelector('[data-allmaps-mode="'+m+'"]');
    if(ch&&!(allMapsColorModeOn&&allMapsColorMode===m)&&!(T.alsoOn||[]).includes(allMapsColorMode))ch.click();psStart(want)}catch(e){}}
   if(age>45000)show("Still opening "+esc(nameOf(want))+"…",'<button type="button" class="gftl-btn" data-gftl-retry="'+esc(want)+'">Try again</button><button type="button" class="gftl-x" aria-label="Close">×</button>');
   else show("Opening "+esc(nameOf(want))+"…")}
  else if(age>90000){want=null;hide()}}
 if(!want){
  const busy=on()&&(window.gfMapLoading===true||(psStepMode()==="history"&&window.GF_HIST2&&GF_HIST2.loading&&GF_HIST2.loading())||(typeof allMapsColorMode!=="undefined"&&psStepMode()&&psStepMode()!==allMapsColorMode));
  if(busy){if(!busySince)busySince=Date.now();if(Date.now()-busySince>500)show("Loading the map…")}
  else{busySince=0;if(chip&&!chip.hidden&&!chip.querySelector(".gftl-btn"))hide()}}
 /* the address follows the tour */
 let h="";if(on()){h="#tour="+encodeURIComponent(ps.tour)+(ps.i>0?"&stop="+(ps.i+1):"")}
 if(h!==lastHash){const cur=location.hash;if(h&&cur!==h)history.replaceState(null,"",location.pathname+location.search+h);else if(!h&&/^#tour=/.test(cur))history.replaceState(null,"",location.pathname+location.search);lastHash=h}
}catch(e){}},250);
function psStepMode(){try{const S=psSteps()[ps.i];return S.mode||PS_TOURS[ps.tour].map.mode||null}catch(e){return null}}
document.addEventListener("click",e=>{const r=e.target.closest&&e.target.closest("[data-gftl-retry]");if(r){e.preventDefault();hide();psLaunchTour(r.dataset.gftlRetry);return}
 if(e.target.closest&&e.target.closest(".gftl-x")){hide();return}
 const c=e.target.closest&&e.target.closest("[data-gftl-copy]");if(c){e.preventDefault();const url=location.href;const done=()=>{c.textContent="Link copied";setTimeout(()=>{c.textContent="Copy link"},1600)};
  try{navigator.clipboard.writeText(url).then(done,()=>{prompt("Copy this link:",url)})}catch(err){prompt("Copy this link:",url)}}},true);
/* 3. opening from a link: #tour=<id>&stop=<n> (or ?tour=) */
function fromLink(){try{const q=new URLSearchParams((location.hash||"").replace(/^#/,"")),q2=new URLSearchParams(location.search);const id=q.get("tour")||q2.get("tour");if(!id)return;
  const n=Math.max(1,parseInt(q.get("stop")||q2.get("stop")||"1",10)||1);
  let tries=0;const t=setInterval(()=>{tries++;if(typeof PS_TOURS!=="undefined"&&PS_TOURS[id]&&typeof psLaunchTour==="function"&&typeof switchAppMode==="function"&&document.readyState!=="loading"){clearInterval(t);
   setTimeout(()=>{psLaunchTour(id);wantStop=n-1},600)}else if(tries>120)clearInterval(t)},250)}catch(e){}}
fromLink();
addEventListener("hashchange",()=>{try{const q=new URLSearchParams(location.hash.replace(/^#/,""));const id=q.get("tour");if(id&&!(on()&&ps.tour===id)&&PS_TOURS[id]){psLaunchTour(id);wantStop=Math.max(0,(parseInt(q.get("stop")||"1",10)||1)-1)}}catch(e){}});
/* 4. a "Copy link" button on the tour card */
function hookCard(){if(typeof psCardHTML!=="function"||psCardHTML._gftl)return false;const _c=psCardHTML;psCardHTML=function(){let h=_c.apply(this,arguments);
 try{if(on()&&!document.body.classList.contains("hg-touring")&&h.indexOf("data-gftl-copy")<0){const b='<button type="button" class="gftl-copy" data-gftl-copy title="Copy a link to this tour at this stop">Copy link</button>';
  if(h.indexOf('<div class="ps-dots"')>=0)h=h.replace('<div class="ps-dots"',b+'<div class="ps-dots"');else h+=b}}catch(e){}return h};psCardHTML._gftl=1;return true}
if(!hookCard()){const t=setInterval(()=>{if(hookCard())clearInterval(t)},400)}
const css=document.createElement("style");css.textContent=`
.gftl{ position:absolute; left:50%; top:14px; transform:translateX(-50%); z-index:60; display:flex; align-items:center; gap:9px; padding:8px 14px; border-radius:999px;
 background:rgba(255,255,255,.95); color:#16324f; font:600 13.5px/1.2 inherit; font-family:inherit; box-shadow:0 4px 16px rgba(0,0,0,.18); pointer-events:auto; white-space:nowrap; }
.gftl[hidden]{ display:none; }
.gftl-spin{ width:14px; height:14px; border-radius:50%; border:2.5px solid rgba(31,111,159,.25); border-top-color:#1f6f9f; animation:gftlspin .8s linear infinite; }
.gftl-spin[hidden]{ display:none; }
@keyframes gftlspin{ to{ transform:rotate(360deg); } }
.gftl-btn{ border:0; border-radius:999px; padding:5px 11px; background:#1f6f9f; color:#fff; font:700 12.5px inherit; font-family:inherit; cursor:pointer; }
.gftl-x{ border:0; background:none; font-size:17px; line-height:1; cursor:pointer; color:inherit; opacity:.6; padding:0 2px; }
.gftl-copy{ display:inline-block; margin:2px 0 8px; padding:4px 10px; border-radius:999px; border:1px solid rgba(22,50,79,.18); background:none; font:600 12px inherit; font-family:inherit; color:#1f6f9f; cursor:pointer; }
.gftl-copy:hover{ background:rgba(31,111,159,.08); }
body.sky-night .gftl{ background:rgba(16,24,44,.95); color:#e6eefc; } body.sky-night .gftl-copy{ color:#8fd0ff; border-color:rgba(255,255,255,.2); }`;
document.head.appendChild(css);
window.gfTourLink=id=>location.origin+location.pathname+"#tour="+encodeURIComponent(id);
})();
