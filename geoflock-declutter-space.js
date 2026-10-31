/* GeoFlock: decluttering the "Earth from space" tour (id "space").
   Every stop keeps only what its text needs: usually one photo pin and at most one or two short labels.
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
 /* 0: a whole-planet overview: six photo pins scattered over the globe → one */
 set("The Earth from space",s=>{const q=keepPh(s,"Grand Erg Oriental: sand sea",{nodot:1});lock(s,"phPins",q?[q]:[])});

 /* 1: the dashed wall and its icon say it; the "about here" label sat on the line, the Gobi photo is not in the text */
 set("You can’t see the Great Wall from space",s=>{lock(s,"pins",[]);const q=keepPh(s,"Great Wall",{nodot:1,dir:60});lock(s,"phPins",q?[q]:[])});

 /* 2: the green thread and its delta: a circle round the delta, one photo on the valley with no dot on the thread */
 set("The Nile, a green thread",s=>{
  lock(s,"lines",[circle([31.05,30.85],160)]);
  lock(s,"pins",[lab([31.05,30.85],"The delta",{ringKm:160,dir:-20})]);
  const q=keepPh(s,"The Nile valley",{nodot:1,dir:0});lock(s,"phPins",q?[q]:[])});

 /* 3: one photo of a sand sea, plus the two other kinds of desert the text names */
 set("The colours of the Sahara",s=>{
  lock(s,"pins",[lab([[9.0,24.6],[5.5,23.3]],"The Tassili and Ahaggar: dark rock"),lab([[18.5,17],[20,18]],"Dry lakebeds")]);
  const q=keepPh(s,"Grand Erg Oriental: sand sea",{nodot:1});lock(s,"phPins",q?[q]:[])});

 /* 4: the 1960 shore (orange) and the stranded ship stay; the two rivers the text names are drawn as rivers,
    instead of a label with a dot on the Amu Darya delta */
 set("A sea that shrank",s=>{
  const L=(s.lines||[]).filter(l=>l&&l.poly);lock(s,"lines",L.concat(lfRiver("amu-darya"),lfRiver("syr-darya")));
  lock(s,"on",["rivers"]);
  lock(s,"pins",[lab([59.6,44.9],"Aralkum: a new desert on the old seabed",{dir:0})])});

 /* 5: the sea of plastic (already circle + one photo): framed a little closer so the circle reads */
 set("The sea of plastic",s=>{def(s,"globe",[-2.75,36.85,8]);def(s,"gz",11);(s.phPins||[]).forEach(q=>{if(q&&q.ringKm&&q.dir==null)q.dir=-30})});

 /* 6: Everest, the plateau photo and the chart; the plateau text label repeated the photo, the rivers label is not in the text */
 set("The Himalaya from orbit",s=>{lock(s,"pins",[lab([86.93,27.99],"Everest",{area:false,dir:110})]);
  (s.phPins||[]).forEach(q=>{if(q)q.nodot=1})});

 /* 7: the biggest delta: no hand-drawn arrows and no Dhaka; the two rivers highlighted on the rivers layer, the
    Sundarbans circled with the photo, the mud plume circled with one short label */
 set("The biggest delta on Earth",s=>{
  lock(s,"on",["rivers"]);lock(s,"rivHi",["Ganges","Brahmaputra"]);
  lock(s,"lines",[circle([89.15,22.0],105),circle([91.25,20.75],90)]);
  lock(s,"pins",[lab([91.25,20.75],"Mud from the Himalaya clouds the sea",{ringKm:90,dir:30})]);
  const q=keepPh(s,"Bangladesh: The Sundarbans",{at:[89.15,22.0],ringKm:105,dir:170});lock(s,"phPins",q?[q]:[]);
  def(s,"globe",[89.9,22.9,7]);def(s,"gz",7.5);
  rep(s,"body","From space you can see the dark green Sundarbans mangroves along the coast and the brown plume of mud spreading into the sea.","From space you can see the dark green Sundarbans mangroves along the coast (circled) and the brown plume of mud spreading into the sea.")});

 /* 8: the dashed arc and its name; the forest itself needs no label */
 set("The Amazon’s edge",s=>{lock(s,"pins",[lab([-54,-11],"The ‘arc of deforestation’",{dir:100})]);
  (s.phPins||[]).forEach(q=>{if(q)q.nodot=1})});

 /* 9: the dust arrow (the text refers to it) from the Bodélé to the Amazon; Tibesti and Ennedi labels crowded the source */
 set("Dust that feeds the Amazon",s=>{lock(s,"pins",[lab([17.5,17],"Bodélé Depression",{dir:-60}),lab([[-62,-3.5]],"The Amazon",{dir:120})])});

 /* 10: a river that dies in the desert: no hand-drawn arrow from Angola and one photo pin (there were three);
    the Okavango drawn as a river from its source, the delta circled, the Kalahari named well clear of it */
 set("A river that dies in the desert",s=>{
  lock(s,"on",["rivers"]);
  lock(s,"lines",lfRiver("okavango").concat([circle([22.85,-19.25],165)]));
  lock(s,"pins",[lab([[22.8,-23.6],[23.8,-23.2]],"The Kalahari",{dir:90})]);
  const q=keepPh(s,"Okavango Delta",{at:[22.85,-19.25],ringKm:165,dir:10})||keepPh(s,"The Okavango Delta: up to about 15,000 km² in flood",{at:[22.85,-19.25],ringKm:165,dir:10});
  lock(s,"phPins",q?[q]:[]);def(s,"globe",[21.0,-17.0,5.5]);def(s,"gz",5.5)});

 /* 11: Greenland: the ice label without a dot on the ice */
 set("Greenland from orbit",s=>{lock(s,"pins",[lab([-40,73],"Ice up to about 3 km thick",{dir:-90})]);(s.phPins||[]).forEach(q=>{if(q)q.nodot=1})});

 /* 12: shallow seas: today's sea level (the -15 m start turned the turquoise banks into beige land); the slider stays,
    starting at today's level; one photo and one short label, both over deep water */
 set("Shallow seas, deep seas",s=>{
  def(s,"gfSea",0);
  lock(s,"pins",[lab([[-74.2,26.4]],"Thousands of metres deep",{dir:-45})]);
  lock(s,"phPins",[{at:[-76.45,24.18],label:"Exumas: the swimming pigs",col:"#d9682b",icon:"photo",nodot:1,dir:20}])});

 /* 13: the red centre: a continent-wide view, too wide for a circle round Lake Eyre to read: its label gets a plain
    line with no dot on the white patch; Uluru's photo also without a dot */
 set("Australia’s red centre",s=>{
  lock(s,"pins",[lab([137.3,-28.6],"Lake Eyre (Kati Thanda): a salt lake, usually dry",{dir:30})]);
  (s.phPins||[]).forEach(q=>{if(q){q.nodot=1;if(q.dir==null)q.dir=200}})});

 /* 14: one big circle round the Salar de Uyuni and one photo placed well away from it; no Titicaca, no lithium ponds
    (the text names neither), no duplicate photo pin */
 set("A white mirror in the Andes",s=>{
  lock(s,"pins",[]);lock(s,"lines",[circle([-67.55,-20.2],100)]);
  const q=keepPh(s,"Salar de Uyuni",{at:[-67.55,-20.2],ringKm:100,dir:0})||keepPh(s,"Salar de Uyuni: about 10,000 km²",{at:[-67.55,-20.2],ringKm:100,dir:0});
  lock(s,"phPins",q?[q]:[]);def(s,"globe",[-67.0,-20.2,6]);def(s,"gz",9)});

 /* 15: the ridge label and the Iceland photo without dots */
 set("The sea floor",s=>{lock(s,"pins",[lab([-30,40],"The Mid-Atlantic Ridge",{dir:180})]);(s.phPins||[]).forEach(q=>{if(q)q.nodot=1})});

 /* 16: the two patterns the text explains; the mid-latitude label is not in the text */
 set("Weather patterns from space",s=>{lock(s,"pins",[lab([-30,6],"The storm band near the equator",{dir:90}),lab([[10,23],[20,22]],"Clear skies over the deserts",{dir:-90})])});
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
