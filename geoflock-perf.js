/* GeoFlock: the globe adapts to the device, from what it measures, not from guesses.
   While the globe moves (dragging, spinning, flying), the time between frames is measured. A device that keeps up is
   left alone, and one with a very sharp screen (above 2x) that is comfortably fast gets the screen's full sharpness (up to
   3x instead of the usual cap of 2x). A device that keeps missing smooth speed gets help, mildest step first, one step at
   a time and only while it is still needed:
     level -1  invisible: lighter shapes while moving (borders and rivers thinned to about 0.25°, still under a pixel or two)
     level -2  the big map pictures are capped at 4096 px on this device (from the next visit; close-up views use the sharp
               satellite tiles anyway)
     level -3  a little less resolution (1.25x instead of 1.5x or 2x), steady, never switched on and off during a drag
   The level is remembered in this browser (localStorage gfPerf) and steps back up if the device copes later.
   "Keep full sharpness" (in the notice) stops step -3 for good on this device.
   Also: a picture whose format the graphics chip cannot build mipmaps for (glGenerateMipmap errors on some Intel chips)
   is drawn with plain smoothing instead, so it still shows and the error stops repeating.
   When the map is slow, by any of several measures (software drawing = acceleration off, slow frames while moving or at
   rest, long freezes, clicks answered late, slow globe redraws), a small notice at the bottom explains how to turn on
   better graphics, with the browser's own settings addresses (clicking one copies it, since pages can't open them). It
   comes back on each visit while the device was slow in the last 30 days: × closes it for this visit, "Never remind me"
   for good. */
(function(){
const KEY="gfPerf";let S={lvl:0,ov:null,seen:0,shut:0};try{Object.assign(S,JSON.parse(localStorage.getItem(KEY)||"{}"))}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const base=()=>window.devicePixelRatio||1;
/* the resolution of the map canvases */
window.gfDpr=function(){const b=base();let c=Math.min(2,b);if(S.lvl>=1)c=Math.min(3,b);if(S.lvl<=-3&&S.ov!=="sharp"&&c>1.25)c=1.25;return c};
window.gfLoTol=S.lvl<=-1?.25:.12;
if(S.lvl<=-2)window.gfTexCap=4096;
window.gfPerf={state:()=>Object.assign({},S),set:l=>{S.lvl=l;apply();save()},reset:()=>{S={lvl:0,ov:null,seen:0,shut:0};apply();save()}};
function apply(){window.gfLoTol=S.lvl<=-1?.25:.12;window.gfTexCap=S.lvl<=-2?4096:undefined;try{if(typeof amGlobe!=="undefined"&&amGlobe)(amGlobe.request?amGlobe.request():amGlobe.render())}catch(e){}}

/* ---------- mipmaps the chip cannot build: plain smoothing for that picture ---------- */
[window.WebGL2RenderingContext,window.WebGLRenderingContext].forEach(C=>{if(!C||!C.prototype.generateMipmap||C.prototype.generateMipmap._gf)return;const o=C.prototype.generateMipmap;
 const f=function(t){o.call(this,t);try{const e=this.getError();if(e){this.texParameteri(t,this.TEXTURE_MIN_FILTER,this.LINEAR);if(!f._said){f._said=1;console.info("GeoFlock: this graphics chip could not build mipmaps for one picture; it is drawn with plain smoothing")}}}catch(x){}};
 f._gf=1;C.prototype.generateMipmap=f});

/* ---------- measuring, only while the globe moves ---------- */
let last=0,win=[],lastStep=0,okSince=0;
function loop(t){requestAnimationFrame(loop);let g=null;try{g=typeof amGlobe!=="undefined"&&amGlobe}catch(e){}
 const moving=!!(g&&g._moving&&g.host&&g.host.offsetParent&&!document.hidden);
 if(!moving){last=0;return}
 if(last){const d=t-last;if(d<200)win.push(d)}last=t;
 if(win.length<90)return;const a=win.slice().sort((x,y)=>x-y),med=a[a.length>>1],p80=a[Math.floor(a.length*.8)];win=[];const now=performance.now();
 if(med>22||p80>34){/* slow: one step down, at most every 8 seconds */okSince=0;if(now-lastStep>8000&&S.lvl>-3){S.lvl=Math.min(S.lvl,0)-1;lastStep=now;apply();save();slow("frames")}}
 else if(med<13&&p80<18){/* fast: back up a step after 20 s of good frames; a sharp, fast screen goes above 2x */
  if(!okSince)okSince=now;if(now-okSince>20000&&now-lastStep>20000){if(S.lvl<0){S.lvl++;lastStep=now;apply();save()}else if(S.lvl===0&&base()>2){S.lvl=1;lastStep=now;apply();save()}}}}
requestAnimationFrame(loop);
/* ---------- many ways of noticing that the map is slow (only on the Maps page, tab visible) ---------- */
const onMap=()=>{try{return typeof appMode!=="undefined"&&appMode==="allmaps"&&!document.hidden}catch(e){return false}};
let why=null;function slow(reason){if(!why)why=reason;S.slowAt=Date.now();S.why=reason;save();if(onMap())notice()}
/* 1. the browser draws with software instead of the graphics chip: acceleration is off */
let softGL=false;try{const c=document.createElement("canvas"),g=c.getContext("webgl");const x=g&&g.getExtension("WEBGL_debug_renderer_info");const r=x?String(g.getParameter(x.UNMASKED_RENDERER_WEBGL)):"";
 softGL=/swiftshader|llvmpipe|softpipe|software|basic render|microsoft basic/i.test(r);if(!g)softGL=true}catch(e){}
/* 2. frames while the globe moves: the step-down above calls slow() too */
/* 3. frames while nothing moves: the page itself is busy */
let idleLast=0,idleWin=[];
/* 4. long freezes */let longN=[];try{new PerformanceObserver(l=>{if(!onMap())return;const now=performance.now();l.getEntries().forEach(e=>{if(e.duration>=200)longN.push(now)});longN=longN.filter(t=>now-t<30000);if(longN.length>=5)slow("freezes")}).observe({type:"longtask",buffered:false})}catch(e){}
/* 5. clicks and keys answered late */let lateN=0;try{new PerformanceObserver(l=>{if(!onMap())return;l.getEntries().forEach(e=>{if(/pointer|click|key/.test(e.name)&&e.duration>=300)lateN++});if(lateN>=4)slow("late")}).observe({type:"event",durationThreshold:104,buffered:false})}catch(e){}
/* 6. one globe redraw takes long */let rT=[];function hookRender(){try{const g=typeof amGlobe!=="undefined"&&amGlobe;if(!g||g._gfPerfR)return;g._gfPerfR=1;const o=g.render;g.render=function(){const t=performance.now(),r=o.apply(this,arguments),d=performance.now()-t;if(onMap()){rT.push(d);if(rT.length>=40){const a=rT.slice().sort((x,y)=>x-y);rT=[];if(a[20]>32)slow("redraw")}}return r}}catch(e){}}
setInterval(hookRender,2000);
(function idle(t){requestAnimationFrame(idle);let g=null;try{g=typeof amGlobe!=="undefined"&&amGlobe}catch(e){}if(!onMap()||(g&&g._moving)){idleLast=0;return}
 if(idleLast){const d=t-idleLast;if(d<1000)idleWin.push(d)}idleLast=t;if(idleWin.length>=180){const a=idleWin.slice().sort((x,y)=>x-y);idleWin=[];if(a[90]>40)slow("busy")}})(0);
/* on the Maps page: acceleration off is told straight away; a device that was slow before is reminded on each visit */
{const t=setInterval(()=>{if(!onMap())return;clearInterval(t);setTimeout(()=>{if(softGL)slow("soft");else if(S.lvl<=-1||S.slowAt&&Date.now()-S.slowAt<30*864e5)notice()},2500)},1000)}

/* ---------- the notice: how to give the browser better graphics ---------- */
let shutNow=false;
const UA=navigator.userAgent,BR=/Edg\//.test(UA)?"edge":/OPR\//.test(UA)?"opera":/Firefox\//.test(UA)?"firefox":/Chrome\//.test(UA)?(navigator.brave?"brave":"chrome"):/Safari\//.test(UA)?"safari":"other";
const PRE={chrome:"chrome",edge:"edge",brave:"brave",opera:"opera"}[BR];
const link=(u,t)=>'<a href="'+u+'" class="gpn-link" data-u="'+u+'">'+(t||u)+'</a>';
function steps(){
 if(PRE)return'<li><b>Turn on graphics acceleration.</b> Open '+link(PRE+"://settings/system")+' and turn on <i>Use graphics acceleration when available</i> ('+(BR==="edge"?"<i>Use hardware acceleration when available</i> in Edge":"in System")+'), then click <i>Relaunch</i>.</li>'+
  '<li><b>Check it worked:</b> open '+link(PRE+"://gpu")+'. Most lines should say <i>Hardware accelerated</i>.</li>';
 if(BR==="firefox")return'<li><b>Turn on graphics acceleration.</b> Open '+link("about:preferences#general")+', scroll to <i>Performance</i>, tick <i>Use recommended performance settings</i> (or untick it and tick <i>Use hardware acceleration when available</i>), then restart Firefox.</li>'+
  '<li><b>Check it worked:</b> open '+link("about:support")+' and look under <i>Graphics</i> for <i>Compositing: WebRender</i> (not <i>WebRender (Software)</i>).</li>';
 return'<li><b>Turn on graphics acceleration</b> in your browser’s settings (usually under System or Performance), then restart the browser. Safari has it on already.</li>'}
/* giving the browser the best graphics chip: Windows' own settings page opens from a link (Windows asks first) */
const WIN=/Windows/.test(UA),MAC=/Macintosh/.test(UA);
function chip(){
 if(WIN)return'<li><b>Give the browser the best graphics chip.</b> Press <kbd>Win</kbd> + <kbd>R</kbd>, paste '+link("ms-settings:display-advancedgraphics")+' and press <kbd>Enter</kbd> (or click the link). Under <i>Custom options for apps</i>, find your browser (or <i>Add desktop app</i> → Browse to it), choose <i>Options</i> → <i>High performance</i> → <i>Save</i>, then restart the browser. This only helps if the computer has a second, stronger graphics card.</li>';
 if(MAC)return'<li><b>Give the browser the best graphics chip</b> (MacBook Pros with two chips): System Settings → Battery → Options → turn off <i>Automatic graphics switching</i>. Macs with Apple chips have one graphics chip, so there is nothing to change.</li>';
 return'<li><b>Give the browser the best graphics chip</b> in your system’s display or graphics settings, if the computer has two.</li>'}
function notice(){if(S.shut||shutNow||document.getElementById("gfPerfNote"))return;const n=document.createElement("div");n.id="gfPerfNote";n.setAttribute("role","status");
 const msg=softGL||(why||S.why)==="soft"?"Graphics acceleration seems to be off in this browser, so the map is drawn the slow way.":"The map is running slowly on this device. Better graphics settings can help.";
 n.innerHTML='<div class="gpn-row"><span class="gpn-ic">⚙️</span><span class="gpn-t">'+msg+'</span>'+
  '<button type="button" class="gpn-how">How?</button><button type="button" class="gpn-never" title="Do not show this again on this device">Never remind me</button><button type="button" class="gpn-x" aria-label="Close for now" title="Close for now">×</button></div>'+
  '<div class="gpn-body" hidden><ol>'+steps()+
  chip()+
  '<li><b>Plug the laptop in and leave battery saver off.</b> Windows: battery icon → <i>Best performance</i>. Mac: System Settings → Battery → Low Power Mode off.</li>'+
  '<li><b>Close other heavy tabs</b> (video calls, games, other maps).</li></ol>'+
  (PRE||BR==="firefox"?'<p class="gpn-tip">Browsers don’t let a web page open their own settings pages, so clicking a browser link copies it: paste it into the address bar. The Windows link opens Settings (Windows asks first) and is copied too.</p>':'')+
  '<label class="gpn-sharp"><input type="checkbox"'+(S.ov==="sharp"?" checked":"")+'> Keep full sharpness on this device (it may stay a little slower)</label></div>';
 document.body.appendChild(n);
 n.querySelectorAll(".gpn-link").forEach(a=>a.onclick=e=>{const u=a.dataset.u;if(!/^ms-settings:/.test(u))e.preventDefault();const done=()=>{a.classList.add("copied");a.setAttribute("data-c",/^ms-settings:/.test(u)?"Copied, paste it into Win + R":"Copied, paste it into the address bar");setTimeout(()=>a.classList.remove("copied"),2600)};
  try{navigator.clipboard.writeText(u).then(done,()=>{prompt("Copy this, then paste it into the address bar:",u)})}catch(x){prompt("Copy this, then paste it into the address bar:",u)}});
 /* sit just above the toolkit tray when it is open */
 const lift=()=>{if(!n.isConnected)return;let b=14;try{const t=[...document.querySelectorAll("#gfKit, .gfk-tray")].filter(e=>e.offsetParent).map(e=>e.getBoundingClientRect()).filter(r=>r.height&&r.top<innerHeight);if(t.length)b=Math.max(14,innerHeight-Math.min(...t.map(r=>r.top))+10)}catch(e){}n.style.setProperty("--gpn-b",b+"px");setTimeout(lift,700)};lift();
 n.querySelector(".gpn-how").onclick=()=>{const b=n.querySelector(".gpn-body");b.hidden=!b.hidden};
 n.querySelector(".gpn-x").onclick=()=>{shutNow=true;n.remove()};
 n.querySelector(".gpn-never").onclick=()=>{S.shut=1;save();n.remove()};
 n.querySelector(".gpn-sharp input").onchange=e=>{S.ov=e.target.checked?"sharp":null;save();apply()}}
const st=document.createElement("style");st.textContent=`
#gfPerfNote{ position:fixed; left:50%; bottom:var(--gpn-b,14px); transform:translateX(-50%); z-index:9000; max-width:min(560px,calc(100vw - 24px)); background:rgba(16,28,48,.94); color:#eef3fa;
  border-radius:14px; box-shadow:0 8px 24px rgba(0,0,0,.35); font:500 13px/1.4 system-ui,sans-serif; padding:8px 10px; }
#gfPerfNote .gpn-row{ display:flex; align-items:center; gap:8px; }
#gfPerfNote .gpn-t{ flex:1; }
#gfPerfNote button{ border:0; border-radius:999px; cursor:pointer; font:700 12px system-ui,sans-serif; }
#gfPerfNote .gpn-how{ background:#e8701a; color:#fff; padding:5px 12px; }
#gfPerfNote .gpn-x{ background:rgba(255,255,255,.14); color:#fff; width:26px; height:26px; font-size:16px; line-height:1; }
#gfPerfNote .gpn-never{ background:rgba(255,255,255,.14); color:#fff; padding:5px 10px; white-space:nowrap; }
#gfPerfNote .gpn-body{ margin-top:6px; } #gfPerfNote ol{ margin:4px 0 6px 18px; padding:0; } #gfPerfNote li{ margin:3px 0; }
#gfPerfNote .gpn-link{ color:#ffc27a; font-family:ui-monospace,Menlo,Consolas,monospace; font-size:12px; text-decoration:underline; position:relative; }
#gfPerfNote .gpn-link.copied::after{ content:attr(data-c); position:absolute; left:0; top:-22px; white-space:nowrap; background:#2e9d5b; color:#fff; font:700 11px system-ui,sans-serif; padding:2px 7px; border-radius:6px; }
#gfPerfNote kbd{ font:700 11px ui-monospace,Menlo,Consolas,monospace; color:#fff; border:1px solid rgba(255,255,255,.35); background:rgba(255,255,255,.16); border-radius:4px; padding:0 4px; }
#gfPerfNote .gpn-tip{ margin:0 0 6px; font-size:11.5px; opacity:.8; }
#gfPerfNote .gpn-sharp{ display:flex; gap:6px; align-items:center; font-size:12px; opacity:.9; }`;
document.head.appendChild(st);
})();
