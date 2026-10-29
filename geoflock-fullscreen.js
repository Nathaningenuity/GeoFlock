/* GeoFlock: full screen for World Maps (and the guided tours, which play on the same map).
   A round ⛶ button in the map's right-hand column. In full screen the map fills the window; the map tabs sit in one
   slim scrolling row at the top with a "Layers ▾" button that folds the switches away; the toolkit, the right-hand
   buttons and the floating key stay where they are; the text under the map is hidden. Esc or the button leaves. */
(function(){
const V=()=>document.getElementById("allMapsView");let on=false;
const ICO=f=>f?'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>'
 :'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>';
function redraw(){setTimeout(()=>{dispatchEvent(new Event("resize"));try{amGlobe.request?amGlobe.request():amGlobe.render()}catch(e){}},80)}
function enter(){if(on)return;on=true;document.body.classList.add("gf-fs","gf-fs-layers");try{const r=document.documentElement.requestFullscreen&&document.documentElement.requestFullscreen({navigationUI:"hide"});if(r&&r.catch)r.catch(()=>{})}catch(e){}scrollTo(0,0);sync();redraw()}
function exit(){if(!on)return;on=false;document.body.classList.remove("gf-fs","gf-fs-layers");try{if(document.fullscreenElement)document.exitFullscreen().catch(()=>{})}catch(e){}sync();redraw()}
window.gfFullscreen={enter,exit,on:()=>on};
document.addEventListener("fullscreenchange",()=>{if(!document.fullscreenElement&&on)exit()});
/* without the browser's full screen (an iPhone, say), Esc still leaves */
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&on&&!document.fullscreenElement&&!document.querySelector(".gfk-panel,.game-modal:not([hidden]),.flag-zoom-overlay.show")){exit()}});
/* full-screen maps: the flat map may use all the height there is */
if(typeof GlobeView!=="undefined"){const P=GlobeView.prototype,_s=P.size;P.size=function(){const r=_s.apply(this,arguments);try{if(on&&typeof amGlobe!=="undefined"&&this===amGlobe){const top=this.host.getBoundingClientRect().top,availH=Math.max(260,innerHeight-Math.max(0,top)-4),W=this.host.clientWidth||r.w;
 /* the flat map is as big as the window allows with the whole world in view */
 if(this._flat){const w=Math.round(Math.min(W-8,availH/.5072));return{w,h:Math.round(w*.5072),r:this._bigR?1e6:w/(2*Math.PI)*1.07}}
 const side=Math.round(Math.min(W,availH));return{w:side,h:side,r:side/2-9}}}catch(e){}return r}}
/* a satellite globe in full screen: the starry sky fills the whole window, not just a box round the globe */
let SKY=null;function sky(){const v=V();let g;try{g=amGlobe}catch(e){}const st=g&&g.host&&g.host.querySelector(".globe-stage");if(!v||!st)return;
 const want=on&&v.classList.contains("sat-on")&&!g._flat;
 if(want){if(!SKY){const b=getComputedStyle(st).backgroundImage;if(b&&b!=="none")SKY=b}if(SKY&&!v.classList.contains("gf-fs-sky")){v.style.setProperty("--gf-fs-sky",SKY);v.classList.add("gf-fs-sky")}}
 else if(v.classList.contains("gf-fs-sky"))v.classList.remove("gf-fs-sky")}
function sync(){let g;try{g=amGlobe}catch(e){return}try{sky()}catch(e){}const show=typeof appMode!=="undefined"&&appMode==="allmaps";if(!show&&on)exit();if(!g||!g.host)return;const btns=g.host.querySelector(".globe-btns");if(!btns)return;
 let b=btns.querySelector(".gf-fsb");if(!b){b=document.createElement("button");b.type="button";b.className="gf-fsb";btns.insertBefore(b,btns.firstChild);b.onclick=e=>{e.stopPropagation();on?exit():enter()}}
 if(b._on!==on){b._on=on;b.innerHTML=ICO(on);b.title=on?"Leave full screen (Esc)":"Full screen";b.setAttribute("aria-label",b.title)}
 /* the Layers fold, only in full screen */
 const row=document.getElementById("allMapsToggleRow");if(row){let L=row.querySelector(".gf-fs-lay");if(on&&!L){L=document.createElement("button");L.type="button";L.className="chip gf-fs-lay";L.onclick=()=>{document.body.classList.toggle("gf-fs-layers");redraw();sync()};row.insertBefore(L,row.firstChild)}
  if(L){if(!on)L.remove();else L.textContent=document.body.classList.contains("gf-fs-layers")?"Layers ▴":"Layers ▾"}}}
setInterval(()=>{try{sync()}catch(e){}},400);
const st=document.createElement("style");st.textContent=`
body.gf-fs{ overflow:hidden !important; }
body.gf-fs #topbar, body.gf-fs .masthead, body.gf-fs footer, body.gf-fs .site-foot, body.gf-fs #gfHelpBtn{ display:none !important; }
body.gf-fs #allMapsView{ position:fixed !important; inset:0 !important; z-index:60; overflow:hidden auto; padding:4px 4px 0 !important; margin:0 !important; max-width:none !important; width:auto !important;
 background:linear-gradient(160deg,#d7eef4,#e6f1fb 55%,#efe9f7); }
body.sky-night.gf-fs #allMapsView{ background:radial-gradient(ellipse at 30% 20%,#232c58,#0e1328 70%); }
body.gf-fs #allMapsToggleRow{ flex-wrap:nowrap !important; overflow-x:auto; justify-content:flex-start !important; gap:5px !important; margin:0 0 4px !important; padding:2px 52px 4px 2px !important; scrollbar-width:none; }
body.gf-fs #allMapsToggleRow::-webkit-scrollbar{ display:none; }
body.gf-fs #allMapsToggleRow > *{ flex:none !important; }
body.gf-fs #allMapsToggleRow .chip, body.gf-fs #allMapsToggleRow button{ font-size:12px !important; padding:5px 11px !important; min-height:0 !important; }
body.gf-fs .all-maps-controls{ display:none !important; }
body.gf-fs.gf-fs-layers .all-maps-controls{ display:flex !important; margin:0 0 4px !important; }
body.gf-fs #populationLegend, body.gf-fs #allMapsView > .am-note, body.gf-fs #allMapsView .gf-below{ display:none !important; }
body.gf-fs .globe-wrap-rel{ margin-top:0 !important; }
.gf-fs-lay{ font-weight:700 !important; }
body.gf-fs #allMapsView.gf-fs-sky{ background:var(--gf-fs-sky) repeat, #03060f !important; }
body.gf-fs #allMapsView.gf-fs-sky .globe-stage{ background:none !important; }
body.gf-fs #allMapsView.gf-fs-sky .switch-label{ color:#dfe6f3 !important; text-shadow:none !important; }
/* the round buttons sit over the map's right edge */
body.gf-fs .globe-btns{ position:absolute !important; right:12px !important; left:auto !important; top:4px !important; z-index:8; }
/* the corners of the oval map are empty: toolkit in the bottom-left corner of the screen, the tour buttons in the top-left corner */
body.gf-fs #allMapsView .gfk-tray{ position:fixed !important; left:10px !important; bottom:4px !important; top:auto !important; }
body.gf-fs #allMapsView .ps-launcher{ top:0 !important; left:2px !important; bottom:auto !important; flex-direction:column; align-items:flex-start; gap:4px; max-width:240px; }
body.gf-fs #allMapsView .ps-launcher .ps-launch{ font-size:12.5px !important; padding:6px 12px !important; }
body.gf-fs #allMapsView .gf-learn{ left:50% !important; transform:translateX(-50%); bottom:6px !important; }
body.gf-fs .globe-wrap-rel, body.gf-fs #amGlobeHost{ width:100% !important; max-width:none !important; margin-left:0 !important; margin-right:0 !important; }`;document.head.appendChild(st);
})();
