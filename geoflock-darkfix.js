/* GeoFlock: dark-theme safety net. Some cards keep their light background in the dark (Starlight) theme while their text
   turns white, so the text all but disappears. Any such light card gets a dark glass background instead. */
(function(){
const dark=()=>document.body.classList.contains("sky-night");
const rgba=c=>{const m=/rgba?\(([^)]+)\)/.exec(c);if(!m)return null;const v=m[1].split(/[ ,\/]+/).filter(Boolean).map(parseFloat);return[v[0],v[1],v[2],v.length>3?v[3]:1]};
const lum=c=>(.2126*c[0]+.7152*c[1]+.0722*c[2])/255;
const SKIP="svg,canvas,img,video,iframe,input,select,textarea,.gfk-panel,.gfk-tray,.globe-stage,.flk,.gf-owid,.vy-chart,.flag-img,[data-nodark],.app-mode-tabs,.tab-btn.active";
let seen=new WeakSet(),seenT=new WeakSet();
function check(el){if(seen.has(el))return;seen.add(el);if(el.closest(SKIP))return;const cs=getComputedStyle(el);if(cs.backgroundImage&&cs.backgroundImage!=="none"&&!/gradient/.test(cs.backgroundImage))return;
 const bg=rgba(cs.backgroundColor);if(!bg||bg[3]<.35||lum(bg)<.62)return;
 /* light card: does it hold light text? */
 let light=0,n=0;const tw=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let t;while((t=tw.nextNode())&&n<6){if(!t.nodeValue.trim())continue;const p=t.parentElement;if(!p||p.closest(SKIP))continue;n++;const c=rgba(getComputedStyle(p).color);if(c&&lum(c)>.72)light++}
 if(n&&light/n>=.5)el.classList.add("gf-dkfix")}
/* dark text left on a dark background (coloured scores, notes): lighten it, keeping its hue */
const lit=new Set();
function bgOf(el){for(let e=el;e&&e!==document.documentElement;e=e.parentElement){const c=rgba(getComputedStyle(e).backgroundColor);if(c&&c[3]>.5)return c;if(e.classList&&e.classList.contains("gf-dkfix"))return[28,36,62,1]}return[20,24,48,1]}
function text(el){if(seenT.has(el))return;seenT.add(el);if(el.closest(SKIP))return;if(![...el.childNodes].some(n=>n.nodeType===3&&n.nodeValue.trim()))return;
 const c=rgba(getComputedStyle(el).color);if(!c||lum(c)>.42)return;if(lum(bgOf(el))>.4)return;
 const m=v=>Math.round(v+(255-v)*.55);el.style.setProperty("color","rgb("+m(c[0])+","+m(c[1])+","+m(c[2])+")","important");lit.add(el)}
let q=0;function scan(){q=0;if(!dark())return;const v=[...document.querySelectorAll("main, .view, [id$='View'], body > div")].filter(x=>x.offsetParent!==null||x===document.body);
 (v.length?v:[document.body]).forEach(root=>{root.querySelectorAll("div,section,article,li,a,button,label,aside,header,details").forEach(el=>{if(el.offsetParent!==null)check(el)});
 root.querySelectorAll("span,small,b,strong,em,i,p,div,a,label,h1,h2,h3,h4,li,button").forEach(el=>{if(el.offsetParent!==null)text(el)})})}
const st=document.createElement("style");st.textContent=`
/* map sub-mode chips (GDP, GDP per person…): dark glass chips with light text at night */
body.sky-night #allMapsSubModes .sub-chip:not(.active), body.sky-night #amGlobeSubs .sub-chip:not(.active), body.sky-night #allMapsSubModes.am-sub-left [data-allmaps-sub]:not(.active){ background:rgba(255,255,255,.1) !important; color:#e6ebfb !important; border-color:rgba(255,255,255,.22) !important; box-shadow:none !important; opacity:1 !important; }
body.sky-night #allMapsSubModes .sub-chip:not(.active):hover, body.sky-night #amGlobeSubs .sub-chip:not(.active):hover{ background:rgba(255,255,255,.18) !important; }
body.sky-night #allMapsSubModes .sub-chip.active, body.sky-night #amGlobeSubs .sub-chip.active{ opacity:1 !important; }
body.sky-night .gf-dkfix{ background-color:rgba(28,36,62,.86) !important; border-color:rgba(255,255,255,.12) !important; color:#e8ecf6; }
body.sky-night .gf-dkfix:hover{ background-color:rgba(40,50,84,.92) !important; }
/* the map switches' names: crisp, not glowing */
body.sky-night #allMapsView .switch-label{ text-shadow:none !important; color:#d9e1ef !important; filter:none !important; }`;document.head.appendChild(st);
/* re-check when the theme changes or the page changes */
new MutationObserver(()=>{if(!q)q=setTimeout(scan,600)}).observe(document.body,{childList:true,subtree:true});
let wasDark=dark();new MutationObserver(()=>{const d=dark();if(d===wasDark)return;wasDark=d;document.querySelectorAll(".gf-dkfix").forEach(x=>x.classList.remove("gf-dkfix"));lit.forEach(x=>x.style.removeProperty("color"));lit.clear();seen=new WeakSet();seenT=new WeakSet();if(!q)q=setTimeout(scan,300)}).observe(document.body,{attributes:true,attributeFilter:["class"]});
setTimeout(scan,1500);
})();
