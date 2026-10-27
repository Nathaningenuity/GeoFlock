/* GeoFlock: the flat map on the Maps page is drawn by the globe's engine with a flat (Robinson) projection, so it zooms
   and pans as smoothly as the globe: one picture redrawn every frame, zoom by how far you scroll, no bursts.
   How it works: when "Flat map" is chosen on a map the globe can show, the globe view is used with amGlobe._flat on.
   In that state the projection is Robinson (the same one the old flat map used), the map is a rectangle instead of a
   ball, the pictures under the map (relief, shading, satellite…) are the flat map's own pictures drawn to the canvas, and
   dragging slides the map instead of turning a ball. Everything that already works on the globe (colours, borders,
   labels, hover, clicks, layers, the toolkit, search) works here too. Tours and the Projections page keep the old map. */
(function(){
if(typeof GlobeView==="undefined"||typeof amGlobeOn!=="function"||typeof d3==="undefined"||!d3.geoRobinson)return;
const RX=.8487,RY=1.3523;/* Robinson's width and height factors */
const tour=()=>typeof ps!=="undefined"&&!!ps;
function flatWanted(){try{return typeof appMode!=="undefined"&&appMode==="allmaps"&&FEATURES.globe&&!globePrefs().allmaps&&ALLMAPS_GLOBE_MODES.has(allMapsColorMode)&&!(typeof proj!=="undefined"&&proj.on)&&!tour()&&!(window.gfCartoOn&&gfCartoOn())}catch(e){return false}}
/* which globes can turn flat: the Maps page's, and the Places and Capitals study map's */
const stWanted=()=>{try{return typeof stGlobe!=="undefined"&&FEATURES.globe&&!globePrefs().study&&typeof activeTab!=="undefined"&&activeTab==="study"&&(appMode==="map"||appMode==="capital"&&window._gfCapMap)&&!tour()}catch(e){return false}};
function defOf(g){try{if(typeof amGlobe!=="undefined"&&g===amGlobe)return{wanted:flatWanted,svg:"#allMapsWrap > svg",view:"allMapsView",f:()=>SPIN.A.f,key:"am"};if(typeof stGlobe!=="undefined"&&g===stGlobe)return{wanted:stWanted,view:"studyView",f:()=>({s:1,bx:0,by:0}),key:"st",fixed:()=>stats.mapColorMode?[]:[{h:"textures/reliefAllMaps.webp",x:0,y:-6.688,w:2000,hh:1014.376,op:1,blend:"normal",tf:null,pr:"none"}]}}catch(e){}return null}
window.gfStWanted=stWanted;
window.gfFlatOn=()=>{try{return typeof amGlobe!=="undefined"&&!!amGlobe&&!!amGlobe._flat&&flatWanted()}catch(e){return false}};
{const _on=amGlobeOn;amGlobeOn=function(){return _on.apply(this,arguments)||flatWanted()}}
if(typeof stGlobeOn==="function"){const _o=stGlobeOn;stGlobeOn=function(){return _o.apply(this,arguments)||stWanted()}}

/* ---------- geometry ---------- */
const P=GlobeView.prototype;
{const _size=P.size;P.size=function(){if(!this._flat)return _size.apply(this,arguments);
 const avail=Math.max(320,this.host.clientWidth||this.host.parentNode&&this.host.parentNode.clientWidth||900),capH=Math.max(260,innerHeight*.82);
 let w=Math.round(Math.min(avail,capH/.5072));const h=Math.round(w*.5072);/* r: the size the label and detail rules see; matched to the flat map's real scale */
 const r=this._bigR?1e6:w/(2*Math.PI)*1.07;return{w,h,r}}}
P._flatBase=function(){const{w}=this.size(),S=w/(2*Math.PI)*this.zoom;/* d3's Robinson is π·scale wide on each side */return d3.geoRobinson().scale(S).translate([0,0])};
{const _proj=P.projection;P.projection=function(){if(!this._flat)return _proj.apply(this,arguments);
 const{w,h}=this.size(),b=this._flatBase(),c=[-this.rot[0],-this.rot[1]];let q=b(c)||[0,0];
 /* the view never leaves the map: the centre is kept inside */
 const hx=Math.max(0,w/2*this.zoom-w/2),hy=Math.max(0,h/2*this.zoom-h/2);if(!this._noClamp)q=[Math.max(-hx,Math.min(hx,q[0])),Math.max(-hy,Math.min(hy,q[1]))];
 if(!this._noClamp){const ll=b.invert(q);if(ll&&isFinite(ll[0]))this.rot=[-ll[0],-ll[1]]}
 const p=b.translate([w/2-q[0],h/2-q[1]]);const inv=p.invert.bind(p);p.invert=pt=>{const v=inv(pt);return v&&isFinite(v[0])&&Math.abs(v[0])<=180.0001&&Math.abs(v[1])<=90?v:null};return p}}
{const _roll=P.roll;P.roll=function(){return this._flat?0:_roll.apply(this,arguments)}}
{const _va=P.visibleAngle;P.visibleAngle=function(){return this._flat?Math.PI:_va.apply(this,arguments)}}
/* "is it on the visible side of the ball?" is always yes on the flat map (distance to the view centre counts as 0) */
{const _gd=d3.geoDistance;d3.geoDistance=function(a,b){if(a&&b)for(const g of [window._gfFlatNow,typeof amGlobe!=="undefined"&&amGlobe,typeof stGlobe!=="undefined"&&stGlobe]){if(g&&g._flat){const c0=-g.rot[0],c1=-g.rot[1];if((b[0]===c0&&b[1]===c1)||(a[0]===c0&&a[1]===c1))return 0}}return _gd(a,b)}}
/* hit tests use the ball's outline; on the flat map the whole rectangle counts */
["hit","_hover","waterAt"].forEach(k=>{const f=P[k];if(!f)return;P[k]=function(){if(!this._flat)return f.apply(this,arguments);this._bigR=true;try{return f.apply(this,arguments)}finally{this._bigR=false}}});
try{if(typeof gfSpinWanted==="function"){const _s=gfSpinWanted;gfSpinWanted=function(g){if(g&&g._flat)return false;return _s.apply(this,arguments)}}}catch(e){}

/* ---------- drawing ---------- */
/* the flat map's own pictures (relief, shading, sea depth, satellite, climate…), as they are layered in the old map */
const PICS={};const IMG=new Map;
function img(h){let i=IMG.get(h);if(!i){i=new Image();i.decoding="async";i.onload=()=>{try{amGlobe&&amGlobe.request()}catch(e){}try{stGlobe&&stGlobe.request()}catch(e){}};i.src=h;IMG.set(h,i)}return i}
function pictures(D){if(D.fixed)return D.fixed();const now=performance.now(),C=PICS[D.key]||(PICS[D.key]={t:0,L:null});if(C.L&&now-C.t<400)return C.L;C.t=now;const svg=document.querySelector(D.svg);const PIC=C.L=[];if(!svg)return PIC;
 svg.querySelectorAll("image").forEach(el=>{let e=el,op=1,ok=true,blend="normal";while(e&&e!==svg){const cs=getComputedStyle(e);if(cs.display==="none"||cs.visibility==="hidden"){ok=false;break}op*=+cs.opacity;if(blend==="normal"&&cs.mixBlendMode&&cs.mixBlendMode!=="normal")blend=cs.mixBlendMode;e=e.parentNode}
  if(!ok||op<=.01)return;const h=el.getAttribute("href")||el.getAttribute("xlink:href");if(!h)return;
  const n=k=>parseFloat(el.getAttribute(k))||0;let tf=null;try{const m=el.transform&&el.transform.baseVal&&el.transform.baseVal.consolidate();if(m)tf=m.matrix}catch(er){}
  PIC.push({h,x:n("x"),y:n("y"),w:n("width"),hh:n("height"),op,blend,tf,pr:el.getAttribute("preserveAspectRatio")})});return PIC}
/* the flat map's pictures are merged once into a single 4000-px picture (blend modes and all), then drawn with one call */
const COMPS={};
/* an SVG <image> keeps its picture's proportions unless told otherwise (preserveAspectRatio, default "xMidYMid meet") */
function drawFit(c,im,o){const W=o.w||im.naturalWidth,H=o.hh||im.naturalHeight,pr=String(o.pr||"xMidYMid meet");
 if(/^none/.test(pr)||!im.naturalWidth){c.drawImage(im,o.x,o.y,W,H);return}const sl=/slice/.test(pr),k=sl?Math.max(W/im.naturalWidth,H/im.naturalHeight):Math.min(W/im.naturalWidth,H/im.naturalHeight),dw=im.naturalWidth*k,dh=im.naturalHeight*k;
 const ax=/xMin/.test(pr)?0:/xMax/.test(pr)?1:.5,ay=/YMin/.test(pr)?0:/YMax/.test(pr)?1:.5;c.drawImage(im,o.x+(W-dw)*ax,o.y+(H-dh)*ay,dw,dh)}
function composite(list,D){let COMP=COMPS[D.key];const key=list.map(o=>o.h.slice(-40)+o.op+o.blend+(o.tf?[o.tf.a,o.tf.e,o.tf.f].join():"")+o.x+o.y+o.w).join("|");
 if(COMP&&COMP.key===key)return COMP;if(!list.every(o=>{const im=img(o.h);return im.complete&&im.naturalWidth}))return COMP&&COMP.part?null:null;
 const F=2,cv=COMP&&COMP.cv||document.createElement("canvas");cv.width=2000*F;cv.height=Math.round(1001*F);const x=cv.getContext("2d");const ff=D.f();/* the old map's own coordinates → the plain Robinson ones */x.setTransform(F/ff.s,0,0,F/ff.s,-F*ff.bx/ff.s,-F*ff.by/ff.s);x.imageSmoothingQuality="high";
 list.forEach(o=>{const im=img(o.h);x.globalAlpha=o.op;x.globalCompositeOperation=o.blend==="normal"?"source-over":o.blend;x.save();if(o.tf)x.transform(o.tf.a,o.tf.b,o.tf.c,o.tf.d,o.tf.e,o.tf.f);drawFit(x,im,o);x.restore()});
 x.globalAlpha=1;x.globalCompositeOperation="source-over";COMP=COMPS[D.key]={cv,key,F};return COMP}
P._flatPictures=function(ctx,dpr){const p=this.projection(),S=p.scale(),t=p.translate(),k=S/318.31,D=defOf(this)||{key:"am",svg:"#allMapsWrap > svg",f:()=>({s:1,bx:0,by:0})},list=pictures(D);if(!list.length)return 0;
 const C=composite(list,D);ctx.save();
 if(C){ctx.setTransform(dpr*k/C.F,0,0,dpr*k/C.F,dpr*(t[0]-1e3*k),dpr*(t[1]-500.5*k));ctx.imageSmoothingQuality=k>3?"high":"medium";ctx.drawImage(C.cv,0,0);ctx.restore();return 1}
 /* pictures still loading: draw them one by one */
 {const ff=D.f(),kk=k/ff.s;ctx.setTransform(dpr*kk,0,0,dpr*kk,dpr*(t[0]-1e3*k-ff.bx*kk),dpr*(t[1]-500.5*k-ff.by*kk))}let drew=0;
 list.forEach(o=>{const im=img(o.h);if(!im.complete||!im.naturalWidth)return;ctx.globalAlpha=o.op;ctx.globalCompositeOperation=o.blend==="normal"?"source-over":o.blend;
  ctx.save();if(o.tf)ctx.transform(o.tf.a,o.tf.b,o.tf.c,o.tf.d,o.tf.e,o.tf.f);drawFit(ctx,im,o);ctx.restore();drew++});
 ctx.restore();return drew};
/* the ball's drawing calls, turned into the flat map's: the round clip and sea become the map's outline; the shading,
   glow and rim of the ball are left out */
function flatCtx(g){const ctx=g.ctx;if(ctx._gfFlat)return;ctx._gfFlat=1;const A=ctx.arc,RG=ctx.createRadialGradient;
 ctx.arc=function(x,y,rad,a0,a1,ccw){if(!g._flat||!g._flatR)return A.apply(this,arguments);const F=g._flatR;
  if(Math.abs(x-F.w/2)<.5&&Math.abs(y-F.h/2)<.5&&(Math.abs(rad-F.r)<.5||Math.abs(rad-F.s)<.5||Math.abs(rad-F.r-11)<.5)){
   /* the ball's own outline (used as a clip) becomes the whole rectangle */
   this._gfSph=true;if(F.skip){/* sea fill when pictures are already drawn: nothing */return}d3.geoPath(F.p,this)({type:"Sphere"});return}return A.apply(this,arguments)};
 const CL=ctx.clip,BP=ctx.beginPath;ctx.beginPath=function(){this._gfSph=false;return BP.apply(this,arguments)};
 /* a clip to the ball's outline becomes a clip to the whole rectangle */
 ctx.clip=function(){if(g._flat&&this._gfSph&&g._flatR){BP.call(this);this.rect(0,0,g._flatR.w,g._flatR.h);this._gfSph=false}return CL.apply(this,arguments)};
 ctx.createRadialGradient=function(){const gr=RG.apply(this,arguments);if(!g._flat)return gr;const add=gr.addColorStop.bind(gr);gr.addColorStop=(o,c)=>add(o,"rgba(0,0,0,0)");return gr}}
{const _r=P._render;P._render=function(){const D=defOf(this);if(!D){this._flat=false;return _r.apply(this,arguments)}
 window._gfFlatNow=this;const want=D.wanted();if(want!==!!this._flat){this._flat=want;if(want){this.zoom=Math.max(1,this.zoom);if(this._flatHome!==false){this.zoom=1;this.rot=[0,0]}}else{this.zoom=1;this.rot=this.cfg.rot?this.cfg.rot.slice():[-15,-20]}
  this.host.classList.toggle("gf-flat",want);const v=document.getElementById(D.view);if(v)v.classList.toggle("gf-flatc",want);if(want)setTimeout(()=>{try{wire(this);this.request()}catch(e){}},0)}
 this.host.style.removeProperty("margin-top");
 if(!this._flat)return _r.apply(this,arguments);
 this.host.style.setProperty("margin-top","10px","important");
 flatCtx(this);const{w,h,r}=this.size();this._flatR={w,h,r,s:r*this.zoom,p:this.projection(),skip:false};
 /* the GL ball is not used: the flat pictures go on the 2-D canvas first */
 const gl=this.gl;if(gl&&!gl._gfFlat){gl._gfFlat=1;const D=gl.draw.bind(gl),T=gl.texture.bind(gl),self=this;gl.texture=function(){return self._flat?null:T.apply(gl,arguments)};
  gl.draw=function(o){if(!self._flat)return D(o);D(null);if(!self._inFlat||self._picDone)return;self._picDone=true;const dpr=Math.min(2,window.devicePixelRatio||1);const n=self._flatPictures(self.ctx,dpr);self._flatR.skip=n>0}}
 if(!gl){/* no GL: draw the pictures right after the canvas is cleared */}
 this._inFlat=true;this._picDone=false;let r0;try{r0=_r.apply(this,arguments)}finally{this._inFlat=false}

 if(!gl){}
 return r0}}
/* without GL the ball would be drawn by the processor; on the flat map the pictures are drawn instead */
{const _c=P._cpuRaster;if(_c)P._cpuRaster=function(){if(!this._flat)return _c.apply(this,arguments);const dpr=Math.min(2,window.devicePixelRatio||1);this._flatR.skip=this._flatPictures(this.ctx,dpr)>0}}
/* the sea under the pictures when the map has no pictures of its own (colour maps): drawn by the ball code, as the outline */

/* ---------- moving the flat map: drag slides, wheel and pinch zoom around the pointer, smoothly ---------- */
function wire(g){if(g._gfFlatWired)return;g._gfFlatWired=1;const host=g.host,c=g.canvas,pts=new Map;let drag=null,pinch=null,target=null,raf=0;
 const inMap=e=>{const rc=c.getBoundingClientRect();return e.clientX>=rc.left&&e.clientX<=rc.right&&e.clientY>=rc.top&&e.clientY<=rc.bottom&&!(e.target.closest&&e.target.closest(".globe-btns,.globe-tip,.gfk-coord,button,a,input"))};
 const stop=e=>{e.stopPropagation();e.stopImmediatePropagation()};
 /* zoom glides to its target a little each frame, like zooming a photo */
 const glide=()=>{raf=0;if(!target)return;const z=g.zoom,dz=Math.log(target.z/z);if(Math.abs(dz)<.004){g.setZoom(target.z,target.at);target=null;return}g.setZoom(z*Math.exp(dz*.35),target.at);raf=requestAnimationFrame(glide)};
 host.addEventListener("wheel",e=>{if(!g._flat||!inMap(e))return;e.preventDefault();stop(e);if(g._flying){g._flyId=(g._flyId||0)+1;g._flying=false}
  const dy=e.deltaMode===1?e.deltaY*33:e.deltaMode===2?e.deltaY*400:e.deltaY,rate=e.ctrlKey?.012:.0022;const base=target?target.z:g.zoom;
  target={z:Math.max(1,Math.min(24,base*Math.exp(Math.max(-.6,Math.min(.6,-dy*rate))))),at:[e.clientX,e.clientY]};if(!raf)raf=requestAnimationFrame(glide)},{capture:true,passive:false});
 host.addEventListener("pointerdown",e=>{if(!g._flat||!inMap(e))return;stop(e);target=null;if(g._flying){g._flyId=(g._flyId||0)+1;g._flying=false}try{c.setPointerCapture(e.pointerId)}catch(er){}pts.set(e.pointerId,[e.clientX,e.clientY]);
  if(pts.size===2){const[a,b]=[...pts.values()];pinch={d:Math.max(1,Math.hypot(a[0]-b[0],a[1]-b[1])),z:g.zoom};drag=null}else drag={x:e.clientX,y:e.clientY,last:[e.clientX,e.clientY],moved:false}},true);
 host.addEventListener("pointermove",e=>{if(!g._flat)return;if(pts.has(e.pointerId))pts.set(e.pointerId,[e.clientX,e.clientY]);
  if(pinch&&pts.size===2){stop(e);const[a,b]=[...pts.values()];g.setZoom(Math.max(1,pinch.z*Math.hypot(a[0]-b[0],a[1]-b[1])/pinch.d),[(a[0]+b[0])/2,(a[1]+b[1])/2]);return}
  if(drag){stop(e);if(Math.abs(e.clientX-drag.x)+Math.abs(e.clientY-drag.y)>3)drag.moved=true;if(drag.moved){/* the point under the finger stays under it */
    const rc=c.getBoundingClientRect(),p=g.projection(),before=p.invert([drag.last[0]-rc.left,drag.last[1]-rc.top]),after=p.invert([e.clientX-rc.left,e.clientY-rc.top]);
    if(before&&after){const q=g._flatBase()([-g.rot[0],-g.rot[1]]);const dq=[e.clientX-drag.last[0],e.clientY-drag.last[1]],ll=g._flatBase().invert([q[0]-dq[0],q[1]-dq[1]]);if(ll&&isFinite(ll[0]))g.rot=[-ll[0],-ll[1]]}
    drag.last=[e.clientX,e.clientY];g.tip.hidden=true;g.hot=null;g.hotWater=null;g._moving=true;g.request()}return}
  if(e.pointerType==="mouse"&&inMap(e)){stop(e);g._hover(e)}},true);
 const up=e=>{if(!g._flat)return;const had=pts.has(e.pointerId);pts.delete(e.pointerId);if(pts.size<2)pinch=null;if(!had)return;stop(e);g._moving=false;
  if(drag&&!drag.moved&&e.type==="pointerup"){const x=e.clientX,y=e.clientY;drag=null;
   if(g._measure){g._measureClick(x,y);return}
   if(g.cfg.clickLL){const rc=c.getBoundingClientRect(),ll=g.projection().invert([x-rc.left,y-rc.top]);if(ll)g.cfg.clickLL(ll);return}
   const hh=g.hit(x,y);if(hh&&hh.code&&g.cfg.click)g.cfg.click(hh.code);return}
  if(drag&&drag.moved)g.request();drag=null};
 host.addEventListener("pointerup",up,true);host.addEventListener("pointercancel",up,true);
 /* the + and − buttons glide too */
 host.addEventListener("click",e=>{if(!g._flat)return;const b=e.target.closest&&e.target.closest('.globe-btns [data-g="in"], .globe-btns [data-g="out"], .globe-btns [data-g="reset"]');if(!b)return;stop(e);e.preventDefault();
  const rc=c.getBoundingClientRect(),mid=[rc.left+rc.width/2,rc.top+rc.height/2];if(b.dataset.g==="reset"){target=null;g.zoom=1;g.rot=[0,0];g.request();return}
  target={z:Math.max(1,Math.min(24,(target?target.z:g.zoom)*(b.dataset.g==="in"?1.8:1/1.8))),at:mid};if(!raf)raf=requestAnimationFrame(glide)},true)}
window.gfFlatSave=function(){try{if(amGlobe){wire(amGlobe);amGlobe.request()}}catch(e){}};

/* ---------- page layout in flat mode: the measure tabs stay in the row above the map ---------- */
const st=document.createElement("style");st.textContent=`
#allMapsView.globe-on.gf-flatc #allMapsSubModes{ display:flex !important; }
#allMapsView.globe-on.gf-flatc #amGlobeSubs{ display:none !important; }
.globe-host.gf-flat{ margin-top:10px !important; }
.globe-host.gf-flat .globe-stage{ margin:0 auto; }
.globe-host.gf-flat .globe-btns [data-g="spin"]{ display:none !important; }
.globe-host.gf-flat canvas.globe-gl{ visibility:hidden; }
.globe-host.gf-flat canvas.globe-canvas{ cursor:grab; }
.globe-host.gf-flat canvas.globe-canvas:active{ cursor:grabbing; }
`;document.head.appendChild(st);
/* the switch: choosing Flat map on a map the globe can show brings up the flat view right away */
setInterval(()=>{try{if(typeof stGlobe!=="undefined"&&stGlobe){wire(stGlobe);if(stWanted()!==!!stGlobe._flat)stGlobe.request()}else if(stWanted()&&typeof stGlobeSync==="function")stGlobeSync()}catch(e){}try{if(typeof amGlobe!=="undefined"&&amGlobe){wire(amGlobe);const want=flatWanted();if(want!==!!amGlobe._flat)amGlobe.request()}else if(flatWanted()&&typeof amGlobeSync==="function")amGlobeSync()}catch(e){}},400);
})();
/* labels on the flat map read at the size the old flat map used */
(function(){const P=GlobeView.prototype,_ls=P.ls;if(_ls)P.ls=function(){const v=_ls.apply(this,arguments);return this._flat?v*1.12:v}})();
/* labels: territories (Western Sahara, Gibraltar, Greenland…) are named only on hover, not with a printed label; on the
   flat map the label rules check room against the whole rectangle (not the ball's outline) */
(function(){const P=GlobeView.prototype,_l=P._labels;if(!_l)return;
 const sov=f=>{const c=f&&f.properties&&f.properties.c;return!(c&&typeof TERRITORY_INFO!=="undefined"&&TERRITORY_INFO[c])};
 P._labels=function(ctx,p,s,base,big){const B=(base||[]).filter(sov),G=(big||[]).filter(sov);if(!this._flat)return _l.call(this,ctx,p,s,B,G);this._bigR=true;try{return _l.call(this,ctx,p,s,B,G)}finally{this._bigR=false}};
 ["_seaLabels","_landforms","_cities","_simpleLabels"].forEach(k=>{const f=P[k];if(!f)return;P[k]=function(){if(!this._flat)return f.apply(this,arguments);this._bigR=true;try{return f.apply(this,arguments)}finally{this._bigR=false}}})})();
/* hover boosts for every small piece of land: an offshore island, an islet or a tiny exclave is picked out when the
   pointer is within about 10 screen pixels of its coast, on the globe and the flat map. Over the sea of the Elevation and
   Climate maps the country is highlighted but the note still names the sea and its depth (the hover note already does
   that when the point is outside the country's shape). */
(function(){const P=GlobeView.prototype,_hit=P.hit;if(!_hit||typeof globeDistToRings!=="function")return;
 const AMAX=3e-4;/* about 12,000 km² */
 function parts(g){if(g._gfParts)return g._gfParts;const out=[];(g.features||[]).forEach(f=>{const c=f.properties&&f.properties.c,G=f.geometry;if(!c||!G)return;
  const polys=G.type==="Polygon"?[G.coordinates]:G.type==="MultiPolygon"?G.coordinates:[];
  polys.forEach(P=>{let a;try{a=d3.geoArea({type:"Polygon",coordinates:P})}catch(e){return}if(!(a>0)||a>AMAX)return;const ring=P[0];let x=0,y=0,z=0;const R=Math.PI/180;
   for(const[lo,la]of ring){const cl=Math.cos(la*R);x+=cl*Math.cos(lo*R);y+=cl*Math.sin(lo*R);z+=Math.sin(la*R)}const cc=[Math.atan2(y,x)/R,Math.atan2(z,Math.hypot(x,y))/R];let rad=0;for(const p of ring)rad=Math.max(rad,d3.geoDistance(p,cc));
   out.push({code:c,f,ring,c:cc,rad})})});return g._gfParts=out}
 P.hit=function(clientX,clientY){const h=_hit.apply(this,arguments);try{if(!h||h.code||!h.ll||(this._boostOff&&this._boostOff()))return h;
  const s=this.size().r*this.zoom,px=10,deg=px*180/(Math.PI*Math.max(1,s)),rr=deg*Math.PI/180,ll=h.ll;let best=null,bd=Infinity;
  for(const q of parts(this)){if(d3.geoDistance(ll,q.c)>q.rad+rr*1.6)continue;const d=globeDistToRings(ll,[q.ring]);if(d<=deg&&d<bd){bd=d;best=q}}
  if(!best)return h;try{const w=this.waterAt(ll,clientX,clientY);if(w&&w.water)return h}catch(e){}return{code:best.code,f:best.f,ll,boosted:true}}catch(e){return h}}})();
/* hover boosts for every small piece of land: an offshore island, an islet or a tiny exclave is picked out when the
   pointer is within about 10 screen pixels of its coast, on the globe and the flat map. Over the sea of the Elevation and
   Climate maps the country is highlighted but the note still names the sea and its depth (the hover note does that
   whenever the point is outside the country's shape). */
(function(){const P=GlobeView.prototype,_hit=P.hit;if(!_hit||typeof globeDistToRings!=="function")return;
 const AMAX=3e-4;/* about 12,000 km² */
 function parts(g){if(g._gfParts)return g._gfParts;const out=[];(g.features||[]).forEach(f=>{const c=f.properties&&f.properties.c,G=f.geometry;if(!c||!G)return;
  const polys=G.type==="Polygon"?[G.coordinates]:G.type==="MultiPolygon"?G.coordinates:[];
  polys.forEach(Q=>{let a;try{a=d3.geoArea({type:"Polygon",coordinates:Q})}catch(e){return}if(!(a>0)||a>AMAX)return;const ring=Q[0];let x=0,y=0,z=0;const R=Math.PI/180;
   for(const[lo,la]of ring){const cl=Math.cos(la*R);x+=cl*Math.cos(lo*R);y+=cl*Math.sin(lo*R);z+=Math.sin(la*R)}const cc=[Math.atan2(y,x)/R,Math.atan2(z,Math.hypot(x,y))/R];let rad=0;for(const p of ring)rad=Math.max(rad,d3.geoDistance(p,cc));
   out.push({code:c,f,ring,c:cc,rad})})});return g._gfParts=out}
 P.hit=function(clientX,clientY){const h=_hit.apply(this,arguments);try{if(!h||h.code||!h.ll||(this._boostOff&&this._boostOff()))return h;
  const s=(this._flat?this.projection().scale():this.size().r*this.zoom),deg=10*180/(Math.PI*Math.max(1,s)),rr=deg*Math.PI/180,ll=h.ll;let best=null,bd=Infinity;
  for(const q of parts(this)){if(d3.geoDistance(ll,q.c)>q.rad+rr*1.6)continue;const d=globeDistToRings(ll,[q.ring]);if(d<=deg&&d<bd){bd=d;best=q}}
  if(!best)return h;try{const w=this.waterAt(ll,clientX,clientY);if(w&&w.water)return h}catch(e){}return{code:best.code,f:best.f,ll,boosted:true}}catch(e){return h}}})();
/* While the flat map is moving (dragging, wheel or pinch zoom, + and −), the last finished picture is slid and scaled like
   an image over the map's own background pictures, and the full map (every border, label and icon) is drawn once it
   stops. The finished picture is simply a copy of the screen, so making it costs nothing. */
(function(){const P=GlobeView.prototype,_r=P._render;
 P._render=function(){const g=this;
  if(g._flat&&g._fastMove&&g._snap&&g._snap.ok){const sn=g._snap,{w,h}=g.size(),dpr=Math.min(2,window.devicePixelRatio||1),c=g.canvas,ctx=g.ctx;
   if(c.width===Math.round(w*dpr)&&c.height===Math.round(h*dpr)&&sn.dpr===dpr){const p=g.projection(),S=p.scale(),t=p.translate(),k=S/sn.S;
    ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation="source-over";ctx.fillStyle=g.cfg.ocean?g.cfg.ocean():"#5797cf";ctx.fillRect(0,0,c.width,c.height);
    try{g._flatR={w,h,r:g.size().r,s:0,p,skip:false};g._flatPictures(ctx,dpr)}catch(e){}
    ctx.setTransform(dpr*k,0,0,dpr*k,dpr*(t[0]-k*sn.t[0]),dpr*(t[1]-k*sn.t[1]));ctx.imageSmoothingQuality="low";ctx.drawImage(sn.cv,0,0,w,h);ctx.setTransform(1,0,0,1,0,0);return}}
  const r=_r.apply(this,arguments);
  if(g._flat){try{const sn=g._snap||(g._snap={cv:document.createElement("canvas")}),c=g.canvas;if(sn.cv.width!==c.width||sn.cv.height!==c.height){sn.cv.width=c.width;sn.cv.height=c.height}
   const x=sn.cv.getContext("2d");x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,c.width,c.height);x.drawImage(c,0,0);const p=g.projection();sn.S=p.scale();sn.t=p.translate().slice();sn.dpr=Math.min(2,window.devicePixelRatio||1);sn.ok=true}catch(e){}}
  return r};
 const _req=P.request;P.request=function(){if(this._flat&&this._gfMoving){this._fastMove=!!(this._snap&&this._snap.ok);clearTimeout(this._fmT);this._fmT=setTimeout(()=>{this._fastMove=false;this._gfMoving=false;this.render()},160)}return _req.apply(this,arguments)};
 const _sz=P.setZoom;P.setZoom=function(){if(this._flat)this._gfMoving=true;return _sz.apply(this,arguments)};
 document.addEventListener("pointermove",e=>{try{[typeof amGlobe!=="undefined"&&amGlobe,typeof stGlobe!=="undefined"&&stGlobe].forEach(g=>{if(g&&g._flat&&e.buttons&&g.host.contains(e.target))g._gfMoving=true})}catch(er){}},true);
})();
/* borders and labels as fine as the old flat map: thinner lines, slightly smaller text */
(function(){const P=GlobeView.prototype,_ls=P.ls;
 {const _r=P._render;P._render=function(){const ctx=this.ctx;if(this._flat&&ctx&&!ctx._gfThin){ctx._gfThin=1;const g=this,ST=ctx.stroke;ctx.stroke=function(){if(g._flat&&!g._fastMove&&/^rgba\((25, 25, 25|20, 30, 20)/.test(String(this.strokeStyle).replace(/rgba\((\d+),(\d+),(\d+)/,"rgba($1, $2, $3"))){const lw=this.lineWidth;this.lineWidth=lw*.55;const r=ST.apply(this,arguments);this.lineWidth=lw;return r}return ST.apply(this,arguments)}}return _r.apply(this,arguments)}}
})();

/* Capitals study, Map view: the same smooth flat map as Places, with each capital's gold star (from the old map's stars:
   the ones for the chosen region) and its name; a click near a star opens that country's profile. */
(function(){if(typeof stGlobeSync!=="function")return;
 const capMap=()=>{try{const b=document.querySelector('#studyView [data-cv="map"]');return typeof appMode!=="undefined"&&appMode==="capital"&&typeof activeTab!=="undefined"&&activeTab==="study"&&!!b&&b.classList.contains("on")}catch(e){return false}};
 const _s=stGlobeSync;stGlobeSync=function(){if(typeof appMode!=="undefined"&&appMode==="capital"){if(!capMap())return;const a=appMode;appMode="map";try{return _s.apply(this,arguments)}finally{appMode=a}}return _s.apply(this,arguments)};
 setInterval(()=>{try{const on=capMap();window._gfCapMap=on;const sw=document.getElementById("stGlobeSwitch");if(sw)sw.style.display=typeof appMode!=="undefined"&&appMode==="capital"?"none":"";
  if(on){const host=document.getElementById("stGlobeHost");if(!host||host.style.display==="none"||typeof stGlobe==="undefined"||!stGlobe||!stGlobe.host.isConnected)stGlobeSync()}
  else if(typeof appMode!=="undefined"&&appMode==="capital"){const v=document.getElementById("studyView"),h=document.getElementById("stGlobeHost");if(v&&v.classList.contains("globe-on")&&!(globePrefs().study)){v.classList.remove("globe-on");if(h)h.style.display="none"}}}catch(e){}},400);
 /* the stars, read from the old map (its coordinates → longitude and latitude) */
 let SK="",STARS=[];
 function stars(){const g=document.querySelector("#atlasStudyMapWrap svg g.cap-stars");if(!g)return[];const els=[...g.querySelectorAll(".cap-st")],k=els.map(e=>e.dataset.c).join(",");if(k===SK)return STARS;const first=!SK;SK=k;const f=SPIN.W.f;setTimeout(()=>fit(first),0);
  STARS=els.map(e=>{const X=+e.dataset.x,Y=+e.dataset.y,ll=GLOBE_ROBINSON0.invert([(X-f.bx)/f.s,(Y-f.by)/f.s]);const c=e.dataset.c,C=COUNTRY_BY_CODE[c]||{};return ll?{c,ll,cap:(C.caps&&C.caps[0])||""}:null}).filter(Boolean);return STARS}
 /* a new region: frame its capitals */
 function fit(){try{const g=stGlobe;if(!g||!g._flat||!STARS.length)return;const b=g._flatBase(),{w,h}=g.size();const P2=STARS.map(s=>b(s.ll));if(STARS.length>120){g.zoom=1;g.rot=[0,0];g.request();return}
  const xs=P2.map(p=>p[0]),ys=P2.map(p=>p[1]),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys),bw=Math.max(40,x1-x0),bh=Math.max(30,y1-y0);
  const z=Math.max(1,Math.min(8,Math.min(w/bw,h/bh)*.72));const ll=b.invert([(x0+x1)/2,(y0+y1)/2]);g.zoom=z;if(ll)g.rot=[-ll[0],-ll[1]];g.request()}catch(e){}}
 const P=GlobeView.prototype,_dm=P._drawMeasure;P._drawMeasure=function(ctx,p){try{if(this._flat&&typeof stGlobe!=="undefined"&&this===stGlobe&&window._gfCapMap){const S=stars(),z=Math.min(1.6,Math.pow(Math.max(1,this.zoom),.4)),r=5.2*z;
   ctx.save();ctx.lineJoin="round";S.forEach(s=>{const q=p(s.ll);if(!q)return;ctx.save();ctx.translate(q[0],q[1]);ctx.scale(r/9,r/9);ctx.beginPath();ctx.moveTo(0,-9);[[2.6,-3.2],[8.6,-2.8],[4,1.2],[5.4,7.4],[0,4],[-5.4,7.4],[-4,1.2],[-8.6,-2.8],[-2.6,-3.2]].forEach(([x,y])=>ctx.lineTo(x,y));ctx.closePath();ctx.fillStyle="#f5c518";ctx.strokeStyle="rgba(90,60,0,.85)";ctx.lineWidth=1.4;ctx.fill();ctx.stroke();ctx.restore();s._q=q});
   const fs=Math.max(8,9*this.ls());ctx.font="700 "+fs.toFixed(1)+'px Inter, "Baloo 2", system-ui, sans-serif';ctx.textBaseline="middle";const placed=[];
   S.forEach(s=>{if(!s._q||!s.cap)return;const w=ctx.measureText(s.cap).width,x=s._q[0]+r+2,y=s._q[1],b=[x,y-fs/2,x+w,y+fs/2];if(placed.some(o=>b[0]<o[2]&&b[2]>o[0]&&b[1]<o[3]&&b[3]>o[1]))return;placed.push(b);
    ctx.strokeStyle="rgba(255,255,255,.9)";ctx.lineWidth=3;ctx.strokeText(s.cap,x,y);ctx.fillStyle="#3a2a00";ctx.fillText(s.cap,x,y)});ctx.restore()}}catch(e){console.error(e)}return _dm.apply(this,arguments)};
 /* a click on (or next to) a star opens that country */
 document.addEventListener("pointerup",e=>{try{if(!window._gfCapMap||typeof stGlobe==="undefined"||!stGlobe||!stGlobe._flat)return;const cv=stGlobe.canvas,r=cv.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)return;
  const x=e.clientX-r.left,y=e.clientY-r.top;let best=null,bd=14;stars().forEach(s=>{if(!s._q)return;const d=Math.hypot(s._q[0]-x,s._q[1]-y);if(d<bd){bd=d;best=s}});if(best){const C=COUNTRY_BY_CODE[best.c];if(C){e.stopPropagation();setTimeout(()=>openFlagZoom(C),0)}}}catch(er){}},true);
})();
/* Landform names on the flat map and the globe: sized by how large the landform is on screen — huge regions (Sahara,
   Andes, Siberia) get big, widely spaced letters, small ranges small, tight ones — and every landform appears once it is
   big enough on screen to hold its name (the Pyrenees, the Carpathians…), biggest first so they win the space. */
(function(){const P=GlobeView.prototype,_lf=P._landforms;if(!_lf||typeof LANDFORM_DATA==="undefined")return;
 const EXT={};Object.values(LANDFORM_DATA).forEach(L=>(L||[]).forEach(r=>{if(Array.isArray(r)&&typeof r[0]==="string")EXT[r[0].toUpperCase()]=+r[4]||0}));
 const COL={mountains:"#6b4423",plateaus:"#7a5a2e",deserts:"#9a5b16",plains:"#3f6b2a",basins:"#2f5f6b",peninsulas:"#4a4a6a"};
 P._landforms=function(ctx,p,O,show,cats){try{const list=[];Object.keys(O.landforms||{}).forEach(cat=>{if(cat==="peaks"||!cats.has(cat))return;O.landforms[cat].forEach(L=>list.push([cat,L]))});
  const S=this._flat?p.scale():this.size().r*this.zoom,k=S/318.31,ls=this.ls();
  list.sort((a,b)=>(EXT[b[1].n]||0)-(EXT[a[1].n]||0));const placed=[],fits=b=>{if(placed.some(o=>b[0]<o[2]&&b[2]>o[0]&&b[1]<o[3]&&b[3]>o[1]))return false;placed.push(b);return true};
  list.forEach(([cat,L])=>{const ext=(EXT[L.n]||40)*k;if(ext<26||!show(L.ll,1.25))return;const xy=p(L.ll);if(!xy)return;const txt=L.n.toUpperCase(),n=txt.length;
   /* letter size grows with the landform, from small to about three times a country name */
   const fs=Math.max(5.6*ls,Math.min(30,4.2*ls+Math.pow(ext,.62)*.42));const font="italic 700 "+fs.toFixed(1)+'px Inter, "Baloo 2", system-ui, sans-serif';ctx.font=font;
   const glyph=ctx.measureText(txt).width;if(glyph>ext*1.35&&ext<120)return;/* not yet room for it */
   let sp=n>1?(ext*.62-glyph)/(n-1):0;sp=Math.max(fs*.04,Math.min(sp,fs*1.6));const tw=glyph+sp*(n-1);
   const ang=Math.abs(L.ang||0)>30?-(L.ang)*Math.PI/180:0;const box=ang?[xy[0]-fs,xy[1]-tw/2,xy[0]+fs,xy[1]+tw/2]:[xy[0]-tw/2,xy[1]-fs/2,xy[0]+tw/2,xy[1]+fs/2];if(!fits(box))return;
   ctx.save();ctx.globalAlpha=fs>14?.72:fs>9?.85:1;try{ctx.letterSpacing=sp.toFixed(1)+"px"}catch(e){}this._text(ctx,txt,xy[0]+(ctx.letterSpacing?sp/2:0),xy[1],COL[cat]||"#5a4630","rgba(255,255,255,0.62)",font,ang);ctx.restore()})}catch(e){console.error(e)}
  /* peaks as before */
  return _lf.call(this,ctx,p,Object.assign({},O,{landforms:{peaks:(O.landforms||{}).peaks||[]}}),show,cats)}})();
