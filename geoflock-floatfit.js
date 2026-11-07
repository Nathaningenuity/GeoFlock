/* GeoFlock: every floating panel behaves the same way.
   1. Pressing, scrolling or double-clicking inside a panel never reaches the map underneath (no dragging or zooming the map).
   2-3. A panel can be made narrower or wider from its left or right edge, and shorter or taller from its top or bottom edge
        (or both at once from a corner). Its contents scroll when it is made small. The size is kept while the page is open,
        also when the panel is closed and opened again.
   4. Panels are dragged by their own title bars anywhere on the page. Tool panels (the toolkit's people counter, sea level,
      shovel...; the sun panel) may be pushed partly off the screen, keeping a strip to grab them back by; reading panels
      (the tour card, the tour quiz, the History story) always stay wholly on the screen, so no text is lost.
   Resizing is from an 8 px band along the edges, shown by the resize cursor; the title bar keeps dragging the panel. */
(function(){
"use strict";
/* sel: the panel; key: what its size is remembered by; off: may go partly off the screen */
const REG=[
 {sel:".gfk-panel",key:p=>"gfk:"+(p.id||"panel"),off:true,min:[220,140]},
 {sel:"#gfDngPanel",key:()=>"dng",off:true,min:[220,120]},
 {sel:".ps-card",key:()=>"tourcard",off:false,min:[260,180]},
 {sel:"#ptCard",key:()=>"ptcard",off:false,min:[260,180]},
 {sel:".gftq",key:()=>"tourquiz",off:false,min:[300,220],drag:".gftq-h"},
 {sel:".hist-story",key:()=>"histstory",off:false,min:[240,160]}];
const SIZE={};try{Object.assign(SIZE,JSON.parse(sessionStorage.getItem("gfFloatSize")||"{}"))}catch(e){}
const save=()=>{try{sessionStorage.setItem("gfFloatSize",JSON.stringify(SIZE))}catch(e){}};
const EDGE=8;
const STOP=["pointerdown","mousedown","touchstart","wheel","dblclick"];

function regOf(p){return REG.find(R=>p.matches(R.sel))}
function zone(p,x,y){const r=p.getBoundingClientRect();if(x<r.left-2||x>r.right+2||y<r.top-2||y>r.bottom+2)return"";
 let z="";if(y<=r.top+EDGE)z+="n";else if(y>=r.bottom-EDGE)z+="s";if(x<=r.left+EDGE)z+="w";else if(x>=r.right-EDGE)z+="e";return z}
const CUR={n:"ns-resize",s:"ns-resize",e:"ew-resize",w:"ew-resize",ne:"nesw-resize",sw:"nesw-resize",nw:"nwse-resize",se:"nwse-resize"};

function setSize(p,w,h){if(w!=null)p.style.setProperty("width",Math.round(w)+"px","important");
 /* a height chosen by the reader is a ceiling, not a fixed size: a panel with less in it stays small */
 if(h!=null){p.style.setProperty("height","auto","important");p.style.setProperty("max-height",Math.round(h)+"px","important");p.style.setProperty("overflow","auto","important")}}
/* the panel's position in its own terms (left/top as CSS lengths), moved by dx, dy */
function shift(p,dx,dy){const cs=getComputedStyle(p);
 if(dx){const l=parseFloat(cs.left);if(isFinite(l)){p.style.setProperty("left",(l+dx)+"px","important");p.style.setProperty("right","auto","important")}}
 if(dy){const t=parseFloat(cs.top);if(isFinite(t)){p.style.setProperty("top",(t+dy)+"px","important");p.style.setProperty("bottom","auto","important")}}}

/* reading panels stay wholly on the screen; tool panels keep at least a strip to grab */
function keepIn(p){const R=regOf(p);if(!R)return;/* only panels floating over the page (a card sitting in the map scrolls with it) */if(getComputedStyle(p).position!=="fixed")return;const r=p.getBoundingClientRect();if(!r.width)return;let dx=0,dy=0;
 if(R.off){const keep=70;if(r.right<keep)dx=keep-r.right;else if(r.left>innerWidth-keep)dx=innerWidth-keep-r.left;if(r.top<0)dy=-r.top;else if(r.top>innerHeight-44)dy=innerHeight-44-r.top}
 else{if(r.width>innerWidth-8)setSize(p,innerWidth-8,null);if(r.height>innerHeight-8)setSize(p,null,innerHeight-8);const q=p.getBoundingClientRect();
  if(q.left<4)dx=4-q.left;else if(q.right>innerWidth-4)dx=innerWidth-4-q.right;if(q.top<4)dy=4-q.top;else if(q.bottom>innerHeight-4)dy=innerHeight-4-q.bottom}
 if(dx||dy)shift(p,dx,dy)}

function wire(p){if(p._gff)return;p._gff=1;const R=regOf(p);
 /* 1. nothing inside reaches the map */
 /* (a press on a title bar goes on: each panel's own drag code listens for it on the page, and handles the map itself) */
 const HANDLES=".ps-head,.hs-head,.gfk-grip,.gfk-ph,.gftq-h,.gf-dng-top";
 STOP.forEach(t=>p.addEventListener(t,e=>{if((t==="pointerdown"||t==="mousedown"||t==="touchstart")&&e.target.closest&&e.target.closest(HANDLES)&&!e.target.closest("button"))return;e.stopPropagation()},{passive:true}));
 /* the size chosen before */
 const k=R.key(p),s=SIZE[k];if(s)setSize(p,s.w,s.h);
 /* 2-3. resize from the edges */
 p.addEventListener("pointermove",e=>{if(p._gffRes||e.buttons)return;const z=zone(p,e.clientX,e.clientY);if(z){p.style.cursor=CUR[z];p._gffZ=z}else if(p._gffZ){p.style.cursor="";p._gffZ=""}});
 p.addEventListener("pointerleave",()=>{if(!p._gffRes&&p._gffZ){p.style.cursor="";p._gffZ=""}});
 p.addEventListener("pointerdown",e=>{const z=zone(p,e.clientX,e.clientY);if(!z||e.button>0)return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();p._gffRes=z;const r0=p.getBoundingClientRect(),x0=e.clientX,y0=e.clientY,mn=R.min;
  try{p.setPointerCapture(e.pointerId)}catch(err){}document.body.classList.add("gff-resizing");
  const mv=ev=>{const dx=ev.clientX-x0,dy=ev.clientY-y0;let w=null,h=null,mx=0,my=0;
   if(z.includes("e"))w=Math.max(mn[0],Math.min(innerWidth-8,r0.width+dx));
   if(z.includes("w")){w=Math.max(mn[0],Math.min(innerWidth-8,r0.width-dx));mx=r0.width-w}
   if(z.includes("s"))h=Math.max(mn[1],Math.min(innerHeight-8,r0.height+dy));
   if(z.includes("n")){h=Math.max(mn[1],Math.min(innerHeight-8,r0.height-dy));my=r0.height-h}
   const cur=p.getBoundingClientRect();setSize(p,w,h);if(h!=null)p.style.setProperty("height",Math.round(h)+"px","important");
   /* left and top edges: the far edge stays put */
   const ax=z.includes("w")?(r0.left+mx)-cur.left:0,ay=z.includes("n")?(r0.top+my)-cur.top:0;if(ax||ay)shift(p,ax,ay)};
  const up=()=>{p.removeEventListener("pointermove",mv);p.removeEventListener("pointerup",up);p.removeEventListener("pointercancel",up);document.body.classList.remove("gff-resizing");
   const r=p.getBoundingClientRect();SIZE[k]={w:Math.round(r.width),h:z.match(/[ns]/)?Math.round(r.height):(SIZE[k]&&SIZE[k].h)||null};if(!z.match(/[ew]/))SIZE[k].w=(s&&s.w)||Math.round(r.width);save();if(SIZE[k].h)setSize(p,null,SIZE[k].h);setTimeout(()=>{p._gffRes=""},0);keepIn(p)};
  p.addEventListener("pointermove",mv);p.addEventListener("pointerup",up);p.addEventListener("pointercancel",up)},true)}

/* 4. panels with no drag of their own (the tour quiz) are dragged by their title bar, anywhere on the page */
document.addEventListener("pointerdown",e=>{const R=REG.find(R=>R.drag&&e.target.closest&&e.target.closest(R.sel+" "+R.drag));if(!R||e.button>0||e.target.closest("button,a,input"))return;
 const p=e.target.closest(R.sel);if(!p||p._gffRes)return;e.preventDefault();e.stopPropagation();const r=p.getBoundingClientRect(),dx=e.clientX-r.left,dy=e.clientY-r.top;p._gffMoved=1;p.classList.add("gff-moving");
 const mv=ev=>{p.style.setProperty("left",(ev.clientX-dx)+"px","important");p.style.setProperty("top",(ev.clientY-dy)+"px","important");p.style.setProperty("right","auto","important");p.style.setProperty("bottom","auto","important");keepIn(p)};
 const up=()=>{removeEventListener("pointermove",mv);removeEventListener("pointerup",up);removeEventListener("pointercancel",up);p.classList.remove("gff-moving")};
 addEventListener("pointermove",mv);addEventListener("pointerup",up);addEventListener("pointercancel",up)},true);
{const st=document.createElement("style");st.textContent=REG.filter(R=>R.drag).map(R=>R.sel+" "+R.drag+"{cursor:grab;touch-action:none}").join("");document.head.appendChild(st)}
/* panels come and go (and some are rebuilt or resized by their own code): look every half second */
function scan(){REG.forEach(R=>document.querySelectorAll(R.sel).forEach(p=>{if(!p.isConnected||!p.getClientRects().length)return;wire(p);
 const s=SIZE[R.key(p)];if(s&&!p._gffRes){const r=p.getBoundingClientRect();if(s.w&&Math.abs(r.width-s.w)>2||s.h&&parseFloat(p.style.maxHeight)!==Math.round(s.h))setSize(p,s.w,s.h)}
 if(!p._gffRes&&!p.matches(".gfk-moving,.hs-dragging,.gff-moving"))keepIn(p)}))}
setInterval(scan,500);addEventListener("resize",scan);
{const st=document.createElement("style");st.textContent=`body.gff-resizing,body.gff-resizing *{user-select:none!important;-webkit-user-select:none!important}`;document.head.appendChild(st)}
/* the tour card opens beside the map, in the page's margin, when there is room (it does not cover the map); once the reader
   drags it, it stays where they put it for the rest of the tour */
function cardOut(){try{if(typeof ps==="undefined"||!ps||!ps.card||!ps.card.isConnected||typeof psSetCardPos!=="function")return;
 if(ps._gffUser||ps.card.classList.contains("ps-dragging")){if(ps.card.classList.contains("ps-dragging"))ps._gffUser=1;return}
 const h=typeof psHostEl==="function"&&psHostEl();if(!h||!h.getBoundingClientRect)return;const r=h.getBoundingClientRect(),cw=ps.card.offsetWidth||340,gap=12;if(!r.width)return;
 let x=null;if(r.left-gap-8>=cw)x=r.left-gap-cw;else if(innerWidth-r.right-gap-8>=cw)x=r.right+gap;if(x==null)return;
 const y=Math.max(70,r.top);const c=ps.card.getBoundingClientRect();if(ps.card.parentNode===document.body&&Math.abs(c.left-x)<2&&Math.abs(c.top-y)<2)return;psSetCardPos(x,y)}catch(e){}}
setInterval(cardOut,400);
window.gfFloatFit={scan,REG,SIZE,cardOut};
})();
