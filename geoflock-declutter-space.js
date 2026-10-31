/* GeoFlock: decluttering the "Earth from space" tour (id "space"), on the stops the tour review added
   ("The sea of plastic", "Dust that feeds the Amazon"); the tour's older stops are left exactly as they were.
   A stop keeps only what its text needs: usually one photo pin and at most one or two short labels.
   - Rivers are no longer hand-drawn arrows: the stop turns the rivers layer on and highlights the river itself
     (rivHi for rivers in the map's river layer; the real river line from LANDFORMS, drawn as kind "river", otherwise).
   - Small areas (a delta, a salt flat, a mangrove forest, a mud plume, a salt lake) get a big true-size circle and one
     pin whose line ends at the circle, with no dot pointing into the place (ringKm on photo pins, as in
     geoflock-mapfix.js; the same here for text labels).
   - Labels that would put a dot on what the stop is about get a plain line with no dot (nodot), and a pin can be told
     which way to sit (dir, in screen degrees: 0 right, 90 down) so it keeps clear of the place it names.
   Patched by tour id and stop title (a renamed or removed stop is skipped); the flag sits on the steps array
   (steps._dclSpace), so a tour that rebuilds its steps is patched again. Load after the tour and review patches. */
(function(){
const ID="space";
const def=(o,k,v)=>Object.defineProperty(o,k,{configurable:true,enumerable:true,writable:true,value:v});
const lock=(o,k,v)=>Object.defineProperty(o,k,{configurable:true,enumerable:true,get(){return v},set(){}});
const T=()=>{try{const t=typeof PS_TOURS!=="undefined"&&PS_TOURS[ID];return t&&Array.isArray(t.steps)?t:null}catch(e){return null}};
const st=title=>{const t=T();return t?t.steps.find(s=>s&&s.title===title):null};
const set=(title,f)=>{const s=st(title);if(s)try{f(s)}catch(e){console.error("declutter-space",title,e)}};
const rep=(s,k,a,b)=>{const v=s&&s[k];if(typeof v==="string"&&v.includes(a))def(s,k,v.replace(a,b))};
/* a text label: an object pin, as the tour engine accepts them ({at:[anchors],text,area}), plus our options */
const lab=(at,text,o)=>Object.assign({at:Array.isArray(at[0])?at:[at],text:text,area:true,nodot:1},o||{});
/* keep one existing photo pin (by label), optionally moved and given options; the photo it shows is unchanged */
const keepPh=(s,label,o)=>{const q=(s.phPins||[]).find(x=>x&&x.label===label);if(!q)return null;const n=Object.assign({},q,o||{});if(o&&o.at)n.at=o.at.slice();return n};
const circle=(c,km)=>({circle:c,km:km,kind:"outline"});
/* the real course of a river from the landforms data, as plain blue river lines (no arrows) */
const lfRiver=id=>{try{const it=LANDFORMS.items.find(x=>x&&x.id===id);const g=it&&it.geom;if(!g||g.t!=="line")return[];return g.c.map(p=>({coords:p.map(q=>[q[0],q[1]]),kind:"river"}))}catch(e){return[]}};

function patch(){
 /* The sea of plastic: circle + one photo pin whose line ends at the circle (as set in geoflock-review-start.js);
    the circle is made a little bigger and the globe flies closer than the usual cap, so the ring reads (about 45-50 px) */
 set("The sea of plastic",s=>{
  lock(s,"lines",[circle([-2.75,36.78],65)]);
  const q=(s.phPins||[]).find(x=>x&&x.ringKm);
  if(q)lock(s,"phPins",[Object.assign({},q,{at:[-2.75,36.78],ringKm:65,dir:-30})]);
  def(s,"globe",[-2.75,36.9,8]);def(s,"gz",12.5);def(s,"view",[-5.6,35.6,0.1,38.4])});

 /* Dust that feeds the Amazon: the arrow stays (the text refers to it); Tibesti and Ennedi crowded the source,
    so only the start (Bodélé) and the end (the Amazon) are named, with plain lines and no dots */
 set("Dust that feeds the Amazon",s=>{
  lock(s,"pins",[lab([17.5,17],"Bodélé Depression",{dir:-60}),lab([-62,-3.5],"The Amazon",{dir:120})])});
}

function run(){try{const t=T();if(!t||t.steps._dclSpace)return;patch();def(t.steps,"_dclSpace",1)}catch(e){console.error("declutter-space",e)}}

/* ---------------------------------------------------------------- engine support (space tour only) */
const on=()=>{try{return typeof ps!=="undefined"&&ps&&ps.tour===ID}catch(e){return false}};
const kmPx=(c,km)=>{const a=psScreen(c),b=psScreen([c[0]+km/(111.32*Math.cos(c[1]*Math.PI/180)),c[1]]);return a&&b?Math.hypot(b[0]-a[0],b[1]-a[1]):0};
/* distance from a box's centre to its edge along unit vector u */
const ext=(u,w,h)=>Math.min(Math.abs(u[0])>1e-6?w/2/Math.abs(u[0]):1e9,Math.abs(u[1])>1e-6?h/2/Math.abs(u[1]):1e9);
const cardBox=box=>{try{if(!ps.card||!ps.card.classList.contains("ps-over"))return null;const c=ps.card.getBoundingClientRect(),b=box.getBoundingClientRect();return{l:c.left-b.left-8,t:c.top-b.top-8,r:c.right-b.left+8,b:c.bottom-b.top+8}}catch(e){return null}};
const ctrlBoxes=box=>{const o=[];try{const b=box.getBoundingClientRect();box.querySelectorAll(".map-zoom-controls, .globe-btns, .globe-subs, .am-subs").forEach(el=>{if(!el.offsetParent)return;const r=el.getBoundingClientRect();o.push({l:r.left-b.left-4,t:r.top-b.top-4,r:r.right-b.left+4,b:r.bottom-b.top+4})})}catch(e){}return o};
const hit=(a,b)=>a.l<b.r&&a.r>b.l&&a.t<b.b&&a.b>b.t;
/* where to put a w×h box so it clears a circle of radius R (px) round anchor a, preferring angle deg; returns its centre */
function spot(a,R,deg,w,h,W,H,avoid,gap){const tries=[0,25,-25,50,-50,75,-75,100,-100,130,-130,160,-160,180];
 let first=null;for(const d of tries){const t=(deg+d)*Math.PI/180,u=[Math.cos(t),Math.sin(t)];const D=R+gap+ext(u,w,h);const c=[a[0]+u[0]*D,a[1]+u[1]*D];
  const r={l:c[0]-w/2,t:c[1]-h/2,r:c[0]+w/2,b:c[1]+h/2};if(!first)first=c;
  if(r.l<4||r.t<4||r.r>W-4||r.b>H-4)continue;if(avoid.some(o=>hit(r,o)))continue;return c}
 return null}
/* the line from a circle's edge (or a little short of the spot) to the edge of the label or photo */
function seg(a,R,c,w,h){const dx=c[0]-a[0],dy=c[1]-a[1],d=Math.hypot(dx,dy)||1,u=[dx/d,dy/d];const s=R>0?R+2:7,e=d-ext(u,w,h)+1;if(e-s<4)return null;return[a[0]+u[0]*s,a[1]+u[1]*s,a[0]+u[0]*e,a[1]+u[1]*e]}

function hookLeaders(){if(typeof psLeaders!=="function"||psLeaders._dclSpace)return typeof psLeaders==="function";const _l=psLeaders;
 psLeaders=function(pinsEl,rects){if(!on())return _l.apply(this,arguments);let todo=[];
  try{const box=psContainer(),W=box.clientWidth,H=box.clientHeight,labs=[...pinsEl.querySelectorAll(".ps-lab")],cb=cardBox(box),avoid=(cb?[cb]:[]).concat(ctrlBoxes(box)),stored=ps.lay&&ps.lay.rects;
   const placed=[];
   rects.forEach((r,k)=>{const P=ps.pins&&ps.pins[k];if(!r||!P||!(P.ringKm||P.nodot||P.dir!=null))return;
    const a=[r.ax,r.ay],R=P.ringKm?kmPx(P.at[r.ai||0]||P.at[0],P.ringKm):0;
    if(P.dir!=null||P.ringKm){const deg=P.dir!=null?P.dir:Math.atan2(r.y+r.h/2-a[1],r.x+r.w/2-a[0])*180/Math.PI;
     const c=spot(a,R,deg,r.w,r.h,W,H,avoid.concat(placed),P.ringKm?28:22);
     if(c){const nx=c[0]-r.w/2,ny=c[1]-r.h/2,dx=nx-r.x,dy=ny-r.y;r.x=nx;r.y=ny;
      if(stored&&stored[k]&&stored[k]!==r){stored[k].x+=dx;stored[k].y+=dy}
      const el=labs[k];if(el){el.style.left=nx+"px";el.style.top=ny+"px"}
      r.ex=Math.max(r.x,Math.min(r.x+r.w,a[0]));r.ey=Math.max(r.y,Math.min(r.y+r.h,a[1]));r.gap=Math.max(r.gap||0,20)}
     placed.push({l:r.x-6,t:r.y-6,r:r.x+r.w+6,b:r.y+r.h+6})}
    todo.push([a,R,r,P])})}catch(e){console.error(e)}
  const out=_l.apply(this,arguments);
  try{const svg=pinsEl.querySelector(".ps-leaders");if(svg&&todo.length){const labs=[...pinsEl.querySelectorAll(".ps-lab")];
   todo.forEach(([a,R,r])=>{svg.querySelectorAll("circle").forEach(c=>{if(Math.hypot(+c.getAttribute("cx")-a[0],+c.getAttribute("cy")-a[1])<1.5)c.remove()});
    svg.querySelectorAll("line").forEach(l=>{if(Math.hypot(+l.getAttribute("x1")-a[0],+l.getAttribute("y1")-a[1])<R+9){
     const x2=+l.getAttribute("x2"),y2=+l.getAttribute("y2"),d=Math.hypot(x2-a[0],y2-a[1]),s=R>0?R+2:7;
     if(d<s+4){l.remove();return}l.setAttribute("x1",(a[0]+(x2-a[0])/d*s).toFixed(1));l.setAttribute("y1",(a[1]+(y2-a[1])/d*s).toFixed(1))}})})}}catch(e){console.error(e)}
  return out};psLeaders._dclSpace=1;return true}

function hookPhotos(){if(typeof psPhPinsSync!=="function")return false;if(psPhPinsSync._dclSpace)return true;if(!psPhPinsSync._gfRing)return false;const _s=psPhPinsSync;
 psPhPinsSync=function(){const out=_s.apply(this,arguments);if(!on())return out;
  try{const box=psContainer&&psContainer(),L=box&&box.querySelector(".ps-phpins");const S=psSteps()[ps.i],P=S&&S.phPins||[];if(!L||L._for!==S)return out;
   const svg=L.querySelector("svg.ps-sq-lead");const W=box.clientWidth,H=box.clientHeight,cb=cardBox(box),avoid=(cb?[cb]:[]).concat(ctrlBoxes(box));
   const els=[...L.querySelectorAll(".ps-sq")];const placed=[];let add="";
   els.forEach((el,k)=>{const q=P[k];if(!q||el.style.display==="none")return;const w=el.offsetWidth||56,h=el.offsetHeight||72;
    let x=parseFloat(el.style.left),y=parseFloat(el.style.top);
    if(!(q.ringKm||q.nodot||q.dir!=null)){placed.push({l:x-w/2-6,t:y-h/2-6,r:x+w/2+6,b:y+h/2+6});return}
    const a=psScreen(q.at);if(!a)return;const R=q.ringKm?kmPx(q.at,q.ringKm):0;
    if(!(L._user&&L._user[k])){const deg=q.dir!=null?q.dir:Math.atan2(y-a[1],x-a[0])*180/Math.PI;
     const c=spot(a,R,deg,w,h,W,H,avoid.concat(placed),R?34:30);if(c){x=c[0];y=c[1];el.style.left=x+"px";el.style.top=y+"px";if(L._off)L._off[k]=[x-a[0],y-a[1]]}}
    placed.push({l:x-w/2-6,t:y-h/2-6,r:x+w/2+6,b:y+h/2+6});
    /* drop this pin's old dot and line, then draw one plain line from the circle's edge (or near the spot) to the photo */
    if(svg){svg.querySelectorAll("circle").forEach(c=>{if(Math.hypot(+c.getAttribute("cx")-a[0],+c.getAttribute("cy")-a[1])<2)c.remove()});
     svg.querySelectorAll("line").forEach(l=>{if(Math.hypot(+l.getAttribute("x1")-a[0],+l.getAttribute("y1")-a[1])<R+9)l.remove()})}
    const g=seg(a,R,[x,y],w,h);if(g)add+=`<line x1="${g[0].toFixed(1)}" y1="${g[1].toFixed(1)}" x2="${g[2].toFixed(1)}" y2="${g[3].toFixed(1)}"/>`});
   if(svg&&add)svg.insertAdjacentHTML("beforeend",add)}catch(e){console.error(e)}
  return out};psPhPinsSync._dclSpace=1;psPhPinsSync._gfRing=1;return true}

/* a stop of this tour can fly the globe closer than the usual cap of 6 (gz), so that its circle reads */
function hookZoom(){if(typeof psGlobeTarget!=="function"||psGlobeTarget._dclSpace)return;const _t=psGlobeTarget;
 psGlobeTarget=function(S){const t=_t.apply(this,arguments);try{if(on()&&S&&S.gz&&Array.isArray(S.globe)&&!(ps.g&&ps.g._flat))return[S.globe[0],S.globe[1],S.gz]}catch(e){}return t};psGlobeTarget._dclSpace=1}

/* the tour (re)builds: patch again straight away */
function hookStart(){if(typeof psStart!=="function"||psStart._dclSpace)return;const _ps=psStart;psStart=function(){const r=_ps.apply(this,arguments);try{run()}catch(e){}return r};psStart._dclSpace=1}

function all(){run();hookStart();hookZoom();hookLeaders();hookPhotos()}
function boot(){setTimeout(all,1500);[3000,6500,13500].forEach(ms=>setTimeout(all,ms))}
if(document.readyState==="complete")boot();else addEventListener("load",boot);
})();
