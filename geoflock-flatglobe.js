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
const tour=()=>typeof ps!=="undefined"&&!!ps||!!window._gfPsStarting;
function flatWanted(){try{return typeof appMode!=="undefined"&&appMode==="allmaps"&&FEATURES.globe&&!globePrefs().allmaps&&ALLMAPS_GLOBE_MODES.has(allMapsColorMode)&&!(typeof proj!=="undefined"&&proj.on)&&!(window.gfCartoOn&&gfCartoOn())/* tours run on the flat map too */}catch(e){return false}}
/* which globes can turn flat: the Maps page's, and the Places and Capitals study map's */
const stWanted=()=>{try{return typeof stGlobe!=="undefined"&&FEATURES.globe&&!globePrefs().study&&typeof activeTab!=="undefined"&&activeTab==="study"&&(appMode==="map"||appMode==="capital"&&window._gfCapMap||appMode==="flag"&&window._gfFlagTour)/* tours run on the flat map too */}catch(e){return false}};
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
P._flatBase=function(){const{w}=this.size(),S=w/(2*Math.PI)*this.zoom;/* d3's Robinson is π·scale wide on each side; this._gfDl is the east–west frame (set by spinning the map at full zoom-out) */return d3.geoRobinson().scale(S).translate([0,0]).rotate([this._gfDl||0,0])};
{const _proj=P.projection;P.projection=function(){if(!this._flat)return _proj.apply(this,arguments);
 const{w,h}=this.size(),b=this._flatBase(),c=[-this.rot[0],-this.rot[1]];let q=b(c)||[0,0];
 /* the view never leaves the map: the centre is kept inside */
 const hx=Math.max(0,w/2*this.zoom-w/2),hy=Math.max(0,h/2*this.zoom-h/2);if(!this._noClamp)q=[Math.max(-hx,Math.min(hx,q[0])),Math.max(-hy,Math.min(hy,q[1]))];
 if(!this._noClamp){const ll=b.invert(q);if(ll&&isFinite(ll[0]))this.rot=[-ll[0],-ll[1]]}
 /* while the map is being spun east–west it slides sideways (_gfOx) and the next copy of the world comes in */
 const ox=this._gfOx||0,W=2*Math.PI*b.scale(),raw=b.translate([w/2-q[0]+ox,h/2-q[1]]),rinv=raw.invert.bind(raw);
 if(!ox){const inv=rinv;raw.invert=pt=>{const v=inv(pt);return v&&isFinite(v[0])&&Math.abs(v[0])<=180.0001&&Math.abs(v[1])<=90?v:null};return raw}
 const f=function(ll){const v=raw(ll);if(!v)return v;v[0]-=Math.round((v[0]-w/2)/W)*W;return v};
 ["stream","scale","translate","rotate","center","clipAngle","clipExtent","precision","angle","reflectX","reflectY","preclip","postclip"].forEach(k=>{if(raw[k])f[k]=raw[k].bind(raw)});
 f.invert=pt=>{for(const dx of [0,-W,W]){const v=rinv([pt[0]+dx,pt[1]]);if(v&&isFinite(v[0])&&Math.abs(v[0])<=180.0001&&Math.abs(v[1])<=90)return v}return null};return f}}
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
/* the picture in another east–west frame: in the Robinson projection a turn east–west only slides each row sideways
   (by the same share of that row's width), wrapping round, so the picture is re-cut row by row, once per frame */
const ROB=d3.geoRobinson().scale(318.31).translate([1e3,500.5]);
function spun(C,dl){dl=((dl%360)+540)%360-180;if(Math.abs(dl)<1e-6)return C.cv;if(C._spun&&C._spun.dl===dl&&C._spun.src===C.cv)return C._spun.cv;
 const F=C.F,src=C.cv,Wc=src.width,Hc=src.height,cv=C._spun&&C._spun.cv&&C._spun.cv.width===Wc?C._spun.cv:document.createElement("canvas");cv.width=Wc;cv.height=Hc;const x=cv.getContext("2d");x.clearRect(0,0,Wc,Hc);
 x.imageSmoothingEnabled=false;/* whole pixels only: the soft edge pixels must not be blended in */
 for(let py=0;py<Hc;py++){const ll=ROB.invert([1e3,(py+.5)/F]);if(!ll||!isFinite(ll[1]))continue;const e=ROB([180,ll[1]]);if(!e)continue;const hw=e[0]-1e3;if(!(hw>0))continue;
  /* the row's solid pixels (its soft outer pixels left out) */
  const L=Math.ceil((1e3-hw)*F)+1,R=Math.floor((1e3+hw)*F)-1,Wr=R-L;if(Wr<4)continue;let d=Math.round(dl/180*hw*F)%Wr;if(d<0)d+=Wr;
  if(!d){x.drawImage(src,L,py,Wr,1,L,py,Wr,1);continue}
  x.drawImage(src,L,py,Wr-d,1,L+d,py,Wr-d,1);x.drawImage(src,L+Wr-d,py,d,1,L,py,d,1)}
 C._spun={dl,cv,src};return cv}
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
 if(C){const src=spun(C,this._gfDl||0),Wd=2*Math.PI*S,vw=this.size().w;ctx.imageSmoothingQuality=k>3?"high":"medium";for(let n=-2;n<=2;n++){if(n&&!this._gfOx)continue;const x0=t[0]+n*Wd;if(x0+Wd/2<0||x0-Wd/2>vw)continue;ctx.setTransform(dpr*k/C.F,0,0,dpr*k/C.F,dpr*(x0-1e3*k),dpr*(t[1]-500.5*k));ctx.drawImage(src,0,0)}ctx.restore();return 1}
 /* pictures still loading: draw them one by one (only in the usual frame) */
 if(this._gfDl){ctx.restore();return 0}
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
/* the map's own hover runs once per pointer move, whichever listener hears it first */
{const _hv=GlobeView.prototype._hover;GlobeView.prototype._hover=function(e){if(e&&typeof e==="object"){if(e._gfHov===this)return;try{e._gfHov=this}catch(er){}}return _hv.apply(this,arguments)}}
/* the end of a spin: the slide becomes the new east–west frame (the middle of the view keeps its place) */
function gfSpinCommit(g){const ox=g._gfOx||0;g._gfOx=0;if(!ox)return;const b=g._flatBase(),W=2*Math.PI*b.scale();let dl=(g._gfDl||0)+ox/W*360;dl=Math.round((((dl%360)+540)%360-180)*10)/10;g._gfDl=dl;g.rot=[dl,0];g.request()}
window.gfSpinCommit=gfSpinCommit;
function wire(g){if(g._gfFlatWired)return;g._gfFlatWired=1;const host=g.host,c=g.canvas,pts=new Map;let drag=null,pinch=null,target=null,raf=0;
 /* only the map itself: not the tour card, labels, photos or panels that sit over it */
 const onMap=t=>t===c||t===host||!!(t&&t.classList&&(t.classList.contains("globe-stage")||t.classList.contains("gfk-cap-pass")));
 const inMap=e=>{const rc=c.getBoundingClientRect();return onMap(e.target)&&e.clientX>=rc.left&&e.clientX<=rc.right&&e.clientY>=rc.top&&e.clientY<=rc.bottom&&!(e.target.closest&&e.target.closest(".globe-btns,.globe-tip,.gfk-coord,button,a,input,.gfk-cap,.gfk-obj,.gfk-tray,.gfk-panel,.gfk-pin"))};/* the toolkit's pens, pins and objects handle their own pointer */
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
  if(drag){stop(e);if(Math.abs(e.clientX-drag.x)+Math.abs(e.clientY-drag.y)>3)drag.moved=true;
   /* fully zoomed out, a sideways drag spins the world east–west; the new frame is set on letting go */
   if(drag.moved&&g.zoom<=1.02&&g._spinOK!==false){g._gfOx=(g._gfOx||0)+(e.clientX-drag.last[0]);drag.last=[e.clientX,e.clientY];drag.spin=true;g.tip.hidden=true;g.hot=null;g.hotWater=null;g._moving=true;g.request();return}
   if(drag.moved){/* the point under the finger stays under it */
    const rc=c.getBoundingClientRect(),p=g.projection(),before=p.invert([drag.last[0]-rc.left,drag.last[1]-rc.top]),after=p.invert([e.clientX-rc.left,e.clientY-rc.top]);
    if(before&&after){const q=g._flatBase()([-g.rot[0],-g.rot[1]]);const dq=[e.clientX-drag.last[0],e.clientY-drag.last[1]],ll=g._flatBase().invert([q[0]-dq[0],q[1]-dq[1]]);if(ll&&isFinite(ll[0]))g.rot=[-ll[0],-ll[1]]}
    drag.last=[e.clientX,e.clientY];g.tip.hidden=true;g.hot=null;g.hotWater=null;g._moving=true;g.request()}return}
  if(e.pointerType==="mouse"&&inMap(e)){g._hover(e)/* the event goes on, so the theme notes (nature, layers, history…) hear it too */}},true);
 const up=e=>{if(!g._flat)return;const had=pts.has(e.pointerId);pts.delete(e.pointerId);if(pts.size<2)pinch=null;if(!had)return;stop(e);g._moving=false;
  if(drag&&!drag.moved&&e.type==="pointerup"){const x=e.clientX,y=e.clientY;drag=null;
   if(g._measure){g._measureClick(x,y);return}
   if(g.cfg.clickLL){const rc=c.getBoundingClientRect(),ll=g.projection().invert([x-rc.left,y-rc.top]);if(ll)g.cfg.clickLL(ll);return}
   if(document.querySelector(".gfk-pinning"))return;/* a click while pins are armed drops a pin (the toolkit does that), not open the country */
   const hh=g.hit(x,y);if(hh&&hh.code&&g.cfg.click)g.cfg.click(hh.code);return}
  if(drag&&drag.spin){gfSpinCommit(g)}if(drag&&drag.moved)g.request();drag=null};
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
setInterval(()=>{try{if(typeof stGlobe!=="undefined"&&stGlobe){wire(stGlobe);if(stWanted()!==!!stGlobe._flat)stGlobe.request()}else if(stWanted()&&typeof stGlobeSync==="function")stGlobeSync()}catch(e){}try{if(typeof amGlobe!=="undefined"&&amGlobe){wire(amGlobe);const want=flatWanted();if(want!==!!amGlobe._flat)amGlobe.request();
 /* a tour (or the cartogram, projections…) turns the flat engine off: hand the view back to the old map, so the tour card is not left inside a hidden map */
 if(want!==window._gfFlatPrev){const was=window._gfFlatPrev;window._gfFlatPrev=want;if(was!==undefined&&typeof amGlobeSync==="function")amGlobeSync()}}else if(flatWanted()&&typeof amGlobeSync==="function")amGlobeSync()}catch(e){}},400);
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
   Climate maps the country is highlighted but the note still names the sea and its depth (the hover note does that
   whenever the point is outside the country's shape). */
(function(){const P=GlobeView.prototype,_hit=P.hit;if(!_hit||typeof globeDistToRings!=="function")return;
 const AMAX=3e-4;/* about 12,000 km² */
 function parts(g){if(g._gfParts)return g._gfParts;const out=[];(g.features||[]).forEach(f=>{const c=f.properties&&f.properties.c,G=f.geometry;if(!c||!G)return;
  const polys=G.type==="Polygon"?[G.coordinates]:G.type==="MultiPolygon"?G.coordinates:[];
  polys.forEach(Q=>{let a;try{a=d3.geoArea({type:"Polygon",coordinates:Q})}catch(e){return}if(!(a>0)||a>AMAX)return;const ring=Q[0];let x=0,y=0,z=0;const R=Math.PI/180;
   for(const[lo,la]of ring){const cl=Math.cos(la*R);x+=cl*Math.cos(lo*R);y+=cl*Math.sin(lo*R);z+=Math.sin(la*R)}const cc=[Math.atan2(y,x)/R,Math.atan2(z,Math.hypot(x,y))/R];let rad=0;for(const p of ring)rad=Math.max(rad,d3.geoDistance(p,cc));
   out.push({code:c,f,ring,c:cc,rad})})});
  /* a country that also has a mainland (a piece bigger than the limit) gets a smaller boost for its islands: its mainland is easy to hover */
  const big=new Set;(g.features||[]).forEach(f=>{const c=f.properties&&f.properties.c,G=f.geometry;if(!c||!G)return;(G.type==="Polygon"?[G.coordinates]:G.type==="MultiPolygon"?G.coordinates:[]).forEach(Q=>{try{if(d3.geoArea({type:"Polygon",coordinates:Q})>AMAX)big.add(c)}catch(e){}})});
  out.forEach(q=>q.px=big.has(q.code)?6:10);return g._gfParts=out}
 P.hit=function(clientX,clientY){const h=_hit.apply(this,arguments);try{if(!h||h.code||!h.ll||(this._boostOff&&this._boostOff()))return h;
  const s=(this._flat?this.projection().scale():this.size().r*this.zoom),u=180/(Math.PI*Math.max(1,s)),rr=10*u*Math.PI/180,ll=h.ll;let best=null,bd=Infinity;
  for(const q of parts(this)){if(d3.geoDistance(ll,q.c)>q.rad+rr*1.6)continue;const d=globeDistToRings(ll,[q.ring]);if(d<=q.px*u&&d/q.px<bd){bd=d/q.px;best=q}}
  if(!best)return h;try{const w=this.waterAt(ll,clientX,clientY);if(w&&w.water)return h}catch(e){}/* the note names the island itself (Canary Islands, Spain), so it is looked up at a point on the island */
  let at=best.ring[0];try{const m=[best.c[0],best.c[1]];if(d3.geoContains({type:"Polygon",coordinates:[best.ring]},m))at=m}catch(e){}
  return{code:best.code,f:best.f,ll:at,boosted:true,pointerLL:ll}}catch(e){return h}}})();
/* The flat map is only ever scaled and shifted (never turned), so every shape is projected once, at scale 1, into a
   cached Path2D, and each frame just draws those with the frame's scale and offset. Every frame is then a full, sharp
   map (borders, rivers, lakes, labels) — while dragging and zooming too, like the globe — at a fraction of the cost. */
(function(){const P=GlobeView.prototype,_r=P._render,_gp=d3.geoPath;
 /* one cache of shapes per east–west frame (a few are kept) */
 const CACHES=new Map;function cacheFor(dl){let c=CACHES.get(dl);if(!c){if(CACHES.size>3)CACHES.delete(CACHES.keys().next().value);c={unit:d3.geoRobinson().scale(1).translate([0,0]).rotate([dl,0]).precision(.0003),m:new WeakMap};CACHES.set(dl,c)}return c}
 /* in another frame the shapes' old cuts along the 180° meridian fall inside the map: outlines leave those edges out */
 const ED=179.999;function cutRings(rs,out){rs.forEach(r=>{let cur=[];for(let i=0;i<r.length;i++){const a=r[i];if(i){const b=r[i-1];if(Math.abs(a[0])>ED&&Math.abs(b[0])>ED&&Math.sign(a[0])===Math.sign(b[0])){if(cur.length>1)out.push(cur);cur=[]}}cur.push(a)}if(cur.length>1)out.push(cur)})}
 function cutGeom(g){if(!g)return g;switch(g.type){case"Feature":return{type:"Feature",properties:g.properties,geometry:cutGeom(g.geometry)};case"FeatureCollection":return{type:"FeatureCollection",features:g.features.map(cutGeom)};
  case"GeometryCollection":return{type:"GeometryCollection",geometries:g.geometries.map(cutGeom)};case"Polygon":{const o=[];cutRings(g.coordinates,o);return{type:"MultiLineString",coordinates:o}}
  case"MultiPolygon":{const o=[];g.coordinates.forEach(p=>cutRings(p,o));return{type:"MultiLineString",coordinates:o}}default:return g}}
 function cachedS(o){if(!curDl||!o||typeof o!=="object")return cached(o);const C=cacheFor(curDl);C.s=C.s||new WeakMap;let pa=C.s.get(o);if(!pa){pa=new Path2D();try{_gp(C.unit,pa)(cutGeom(o))}catch(e){}C.s.set(o,pa)}return pa}
 let curDl=0;function cached(o){if(!o||typeof o!=="object")return null;const C=cacheFor(curDl);let pa=C.m.get(o);if(!pa){pa=new Path2D();try{_gp(C.unit,pa)(o)}catch(e){}C.m.set(o,pa)}return pa}
 function hook(ctx){if(ctx._gfP2)return;ctx._gfP2=1;const BP=ctx.beginPath,F=ctx.fill,S=ctx.stroke,CL=ctx.clip;
  const one=()=>{const L=ctx._gfPend;if(L.length===1)return L[0];const q=new Path2D();L.forEach(x=>q.addPath(x));return ctx._gfPend=[q],q};
  const oneS=()=>{if(!curDl||!ctx._gfPendO)return one();const q=new Path2D();ctx._gfPendO.forEach(o=>{const pa=cachedS(o);pa&&q.addPath(pa)});return q};
  ctx.beginPath=function(){this._gfPend=null;this._gfPendO=null;return BP.apply(this,arguments)};
  ctx.fill=function(){const T=this._gfT;if(!T||!this._gfPend||arguments.length&&typeof arguments[0]!=="string")return F.apply(this,arguments);const q=one();T.ks.forEach(dx=>{this.save();this.transform(T.S,0,0,T.S,T.t[0]+dx,T.t[1]);F.call(this,q,arguments[0]||"nonzero");this.restore()})};
  ctx.stroke=function(){const T=this._gfT;if(!T||!this._gfPend||arguments.length)return S.apply(this,arguments);const q=oneS();const lw=this.lineWidth,d=this.getLineDash();T.ks.forEach(dx=>{this.save();this.transform(T.S,0,0,T.S,T.t[0]+dx,T.t[1]);this.lineWidth=lw/T.S;if(d.length)this.setLineDash(d.map(v=>v/T.S));S.call(this,q);this.restore()})};
  ctx.clip=function(){const T=this._gfT;if(!T||!this._gfPend||arguments.length&&typeof arguments[0]!=="string")return CL.apply(this,arguments);const q=new Path2D(),src=one();T.ks.forEach(dx=>q.addPath(src,new DOMMatrix([T.S,0,0,T.S,T.t[0]+dx,T.t[1]])));return CL.call(this,q,arguments[0]||"nonzero")}}
 d3.geoPath=function(proj,ctx){const T=ctx&&ctx._gfT;if(T&&proj&&proj._gfFlatP){return function(o){if(o==null)return;const pa=cached(o);if(pa){(ctx._gfPend||(ctx._gfPend=[])).push(pa);(ctx._gfPendO||(ctx._gfPendO=[])).push(o)}}}return _gp.apply(this,arguments)};
 Object.keys(_gp).forEach(k=>{try{d3.geoPath[k]=_gp[k]}catch(e){}});
 const _proj=P.projection;P.projection=function(){const p=_proj.apply(this,arguments);if(this._flat&&p)p._gfFlatP=1;return p};
 P._render=function(){if(!this._flat||!this.ctx)return _r.apply(this,arguments);const ctx=this.ctx;hook(ctx);const p=this.projection(),S0=p.scale(),t0=p.translate(),W0=2*Math.PI*S0,vw=this.size().w,ks=[];if(this._gfOx){for(let n=-2;n<=2;n++){const x0=t0[0]+n*W0;if(!(x0+W0/2<0||x0-W0/2>vw))ks.push(n*W0)}}curDl=this._gfDl||0;ctx._gfT={S:S0,t:t0,ks:ks.length?ks:[0]};ctx._gfPend=null;
  try{return _r.apply(this,arguments)}finally{ctx._gfT=null;ctx._gfPend=null}}})();
/* borders and labels as fine as the old flat map: thinner lines, slightly smaller text */
(function(){const P=GlobeView.prototype,_ls=P.ls;
 {const _r=P._render;P._render=function(){const ctx=this.ctx;if(this._flat&&ctx&&!ctx._gfThin){ctx._gfThin=1;const g=this,ST=ctx.stroke;ctx.stroke=function(){if(g._flat&&!g._fastMove&&/^rgba\((25, 25, 25|20, 30, 20)/.test(String(this.strokeStyle).replace(/rgba\((\d+),(\d+),(\d+)/,"rgba($1, $2, $3"))){const lw=this.lineWidth;this.lineWidth=lw*.55;const r=ST.apply(this,arguments);this.lineWidth=lw;return r}return ST.apply(this,arguments)}}return _r.apply(this,arguments)}}
})();

/* Capitals study, Map view: the same smooth flat map as Places, with each capital's gold star (from the old map's stars:
   the ones for the chosen region) and its name; a click near a star opens that country's profile. */
(function(){if(typeof stGlobeSync!=="function")return;
 const capMap=()=>{try{const b=document.querySelector('#studyView [data-cv="map"]');return typeof appMode!=="undefined"&&appMode==="capital"&&typeof activeTab!=="undefined"&&activeTab==="study"&&!!b&&b.classList.contains("on")}catch(e){return false}};
 const _s=stGlobeSync;stGlobeSync=function(){if(typeof appMode!=="undefined"&&(appMode==="capital"||appMode==="flag")){if(appMode==="capital"?!capMap():!window._gfFlagTour)return;const a=appMode;appMode="map";try{return _s.apply(this,arguments)}finally{appMode=a}}return _s.apply(this,arguments)};
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
   S.forEach(s=>{s._lb=null;if(!s._q||!s.cap)return;const w=ctx.measureText(s.cap).width,x=s._q[0]+r+2,y=s._q[1],b=[x,y-fs/2,x+w,y+fs/2];if(placed.some(o=>b[0]<o[2]&&b[2]>o[0]&&b[1]<o[3]&&b[3]>o[1]))return;placed.push(b);s._lb=b;
    ctx.strokeStyle="rgba(255,255,255,.9)";ctx.lineWidth=3;ctx.strokeText(s.cap,x,y);ctx.fillStyle="#3a2a00";ctx.fillText(s.cap,x,y)});ctx.restore()}}catch(e){console.error(e)}return _dm.apply(this,arguments)};
 /* a click on a star or on a capital's name opens a card about the capital: its photo, name and a short description,
    with a link to the country (a drag of the map is not a click) */
 let down=null;document.addEventListener("pointerdown",e=>{down=[e.clientX,e.clientY]},true);
 const esc=t=>String(t==null?"":t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
 function closeCard(){const c=document.getElementById("gfCapCard");if(c)c.remove()}
 function openCard(s,x,y){closeCard();const C=COUNTRY_BY_CODE[s.c]||{},W=(window.GF_CAPWIKI||{})[s.c],ph=typeof window.gfCapPhoto==="function"?window.gfCapPhoto(s.c):null,host=stGlobe.host;
  const d=document.createElement("div");d.id="gfCapCard";d.className="gf-capcard";
  d.innerHTML='<button type="button" class="gf-cc-x" aria-label="Close">×</button>'+(ph?'<img src="'+ph.src+'" alt="'+esc(s.cap)+'">':"")+
   '<div class="gf-cc-b"><b>'+esc(s.cap)+'</b><small>Capital of '+esc(C.n||"")+'</small>'+(W?'<p>'+esc(W.x)+'</p>':"")+
   '<div class="gf-cc-f">'+(ph&&ph.by?'Photo: '+esc(ph.by)+(ph.lic?" · "+esc(ph.lic):"")+'<br>':"")+(W?'Text: <a href="https://en.wikipedia.org/wiki/'+encodeURIComponent(W.t.replace(/ /g,"_"))+'" target="_blank" rel="noopener">Wikipedia</a> · CC BY-SA':"")+'</div>'+
   '<button type="button" class="gf-cc-go">About '+esc(C.n||"the country")+' →</button></div>';
  if(getComputedStyle(host).position==="static")host.style.position="relative";host.appendChild(d);
  const hw=host.clientWidth,hh=host.clientHeight,cw=d.offsetWidth,ch=d.offsetHeight;let L=x+16,T=y-ch/2;if(L+cw>hw-8)L=x-16-cw;L=Math.max(8,L);T=Math.max(8,Math.min(hh-ch-8,T));d.style.left=L+"px";d.style.top=T+"px";
  d.querySelector(".gf-cc-x").onclick=closeCard;d.querySelector(".gf-cc-go").onclick=()=>{closeCard();if(C.c)openFlagZoom(C)};
  d.addEventListener("pointerdown",e=>e.stopPropagation());d.addEventListener("pointerup",e=>e.stopPropagation())}
 document.addEventListener("keydown",e=>{if(e.key==="Escape")closeCard()});
 document.addEventListener("pointerup",e=>{try{if(!window._gfCapMap||typeof stGlobe==="undefined"||!stGlobe||!stGlobe._flat){closeCard();return}const cv=stGlobe.canvas,r=cv.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)return;
  if(down&&Math.hypot(e.clientX-down[0],e.clientY-down[1])>5)return;
  const x=e.clientX-r.left,y=e.clientY-r.top;let best=null,bd=14;stars().forEach(s=>{if(!s._q)return;const d=Math.hypot(s._q[0]-x,s._q[1]-y);if(d<bd){bd=d;best=s}});
  if(!best)best=stars().find(s=>s._lb&&x>=s._lb[0]-2&&x<=s._lb[2]+2&&y>=s._lb[1]-3&&y<=s._lb[3]+3)||null;
  if(best){e.stopPropagation();const hr=stGlobe.host.getBoundingClientRect();openCard(best,e.clientX-hr.left,e.clientY-hr.top)}else closeCard()}catch(er){}},true);
 const st=document.createElement("style");st.textContent=`
 .gf-capcard{ position:absolute; z-index:30; width:270px; background:rgba(255,255,255,.98); border-radius:16px; box-shadow:0 10px 32px rgba(20,40,80,.25); overflow:hidden; color:#1d3550; font:13px/1.45 Inter,system-ui,sans-serif; }
 .gf-capcard img{ display:block; width:100%; height:150px; object-fit:cover; }
 .gf-cc-b{ padding:10px 14px 12px; } .gf-cc-b b{ display:block; font-size:17px; } .gf-cc-b small{ display:block; color:#5d6f82; font-size:12px; margin-bottom:6px; }
 .gf-cc-b p{ margin:0 0 8px; } .gf-cc-f{ font-size:10.5px; color:#7a8a99; margin-bottom:8px; } .gf-cc-f a{ color:inherit; }
 .gf-cc-go{ border:0; border-radius:999px; background:#2f8a7a; color:#fff; font:600 12.5px system-ui; padding:7px 13px; cursor:pointer; }
 .gf-cc-x{ position:absolute; top:6px; right:6px; width:26px; height:26px; border:0; border-radius:50%; background:rgba(255,255,255,.9); color:#1d3550; font:700 16px/1 system-ui; cursor:pointer; box-shadow:0 1px 5px rgba(0,0,0,.2); }
 body.dark-theme .gf-capcard{ background:rgba(28,38,56,.98); color:#e6eef7; } body.dark-theme .gf-cc-b small, body.dark-theme .gf-cc-f{ color:#9fb0c2; }`;document.head.appendChild(st);
})();
/* Landform names on the flat map and the globe: sized by how large the landform is on screen — huge regions (Sahara,
   Andes, Siberia) get big, widely spaced letters, small ranges small, tight ones — and every landform appears once it is
   big enough on screen to hold its name (the Pyrenees, the Carpathians…), biggest first so they win the space. */
(function(){const P=GlobeView.prototype,_lf=P._landforms;if(!_lf||typeof LANDFORM_DATA==="undefined")return;
 const EXT={};Object.values(LANDFORM_DATA).forEach(L=>(L||[]).forEach(r=>{if(Array.isArray(r)&&typeof r[0]==="string")EXT[r[0].toUpperCase()]=+r[4]||0}));
 /* the stored tilts are clockwise-negative (the Appalachians rise to the north-east); two of them point the other way */
 const AFIX={"CASCADE RANGE":74,"Antarctic Peninsula":-55.9};
 const COL={mountains:"#6b4423",plateaus:"#7a5a2e",deserts:"#9a5b16",plains:"#3f6b2a",basins:"#2f5f6b",peninsulas:"#4a4a6a"};
 P._landforms=function(ctx,p,O,show,cats){try{const list=[];Object.keys(O.landforms||{}).forEach(cat=>{if(cat==="peaks"||!cats.has(cat))return;O.landforms[cat].forEach(L=>list.push([cat,L]))});
  const S=this._flat?p.scale():this.size().r*this.zoom,k=S/318.31,ls=this.ls();
  list.sort((a,b)=>(EXT[b[1].n]||0)-(EXT[a[1].n]||0));const placed=[],fits=b=>{if(placed.some(o=>b[0]<o[2]&&b[2]>o[0]&&b[1]<o[3]&&b[3]>o[1]))return false;placed.push(b);return true};
  list.forEach(([cat,L])=>{const ext=(EXT[L.n]||40)*k;if(ext<26||!show(L.ll,1.25))return;const xy=p(L.ll);if(!xy)return;const txt=L.n.toUpperCase(),n=txt.length;
   /* letter size grows gently with the landform, from small to a little above a country name */
   const fs=Math.max(5.6*ls,Math.min(12.5,5*ls+Math.pow(ext,.5)*.18));const font="italic 700 "+fs.toFixed(1)+'px Inter, "Baloo 2", system-ui, sans-serif';ctx.font=font;
   const glyph=ctx.measureText(txt).width;if(glyph>ext*1.35&&ext<120)return;/* not yet room for it */
   let sp=n>1?(ext*.4-glyph)/(n-1):0;sp=Math.max(fs*.04,Math.min(sp,fs*.55));const tw=glyph+sp*(n-1);
   const a0=L.n in AFIX?AFIX[L.n]:(L.ang||0),ang=Math.abs(a0)>30?a0*Math.PI/180:0;const box=ang?[xy[0]-fs,xy[1]-tw/2,xy[0]+fs,xy[1]+tw/2]:[xy[0]-tw/2,xy[1]-fs/2,xy[0]+tw/2,xy[1]+fs/2];if(!fits(box))return;
   ctx.save();ctx.globalAlpha=fs>10?.85:1;try{ctx.letterSpacing=sp.toFixed(1)+"px"}catch(e){}this._text(ctx,txt,xy[0]+(ctx.letterSpacing?sp/2:0),xy[1],COL[cat]||"#5a4630","rgba(255,255,255,0.62)",font,ang);ctx.restore()})}catch(e){console.error(e)}
  /* peaks as before */
  return _lf.call(this,ctx,p,Object.assign({},O,{landforms:{peaks:(O.landforms||{}).peaks||[]}}),show,cats)}})();
/* hovers and clicks that ask the old flat map where the pointer is (nature, layers, history, toolkit…) get the answer
   from the flat map now on screen */
(function(){const fix=()=>{if(typeof amtToLL!=="function"||amtToLL._gfFlat)return false;const _a=amtToLL;
  amtToLL=function(cx,cy){try{const g=typeof amGlobe!=="undefined"&&amGlobe;if(g&&g._flat&&g.host&&g.host.isConnected&&g.host.offsetParent){const r=g.canvas.getBoundingClientRect();if(cx<r.left||cx>r.right||cy<r.top||cy>r.bottom)return null;const p=g.projection(),ll=p.invert([cx-r.left,cy-r.top]);return ll&&isFinite(ll[0])?ll:null}}catch(e){}return _a.apply(this,arguments)};amtToLL._gfFlat=1;return true};
 if(!fix()){const t=setInterval(()=>{if(fix())clearInterval(t)},500)}})();
/* a small hovered country's outline (Monaco, San Marino) is drawn again last, over the city dots and the labels: only its
   real border, never the enlarged hover area of a tiny place (that showed as a strange ring) */
(function(){const P=GlobeView.prototype,_r=P._render;P._render=function(){const r=_r.apply(this,arguments);try{const code=this.hot,ctx=this.ctx;if(!code||!ctx)return r;
  const fs=(this._base||[]).filter(f=>f&&f.properties&&f.properties.c===code);if(!fs.length)return r;
  /* only small countries (Monaco, San Marino): bigger ones keep their normal outline under the labels */let pa=0;try{const gp=d3.geoPath(this.projection());fs.forEach(f=>{pa+=gp.area(f)})}catch(e){return r}if(!(pa<900))return r;
  const dpr=Math.min(2,window.devicePixelRatio||1),{w,h}=this.size();ctx.save();ctx.setTransform(dpr,0,0,dpr,0,0);
  if(!this._flat){ctx.beginPath();ctx.arc(w/2,h/2,this.size().r,0,2*Math.PI);ctx.clip()}
  const path=d3.geoPath(this.projection(),ctx);ctx.lineJoin="round";
  fs.forEach(f=>{ctx.beginPath();path(f);ctx.strokeStyle="#ffffff";ctx.lineWidth=2*Math.max(.35,Math.min(1.2,.42*Math.pow(this.zoom,.6)));ctx.stroke()});/* as thin as the normal highlight *//* the same white line as the normal highlight */ctx.restore()}catch(e){}return r}})();
/* jumping to a country frames its mainland (with the pieces right next to it); far-off islands that belong to it (the
   Azores, the Canaries, Hawaii…) are simply shown if they fit, not used to centre or size the view */
(function(){const P=GlobeView.prototype,_fly=P.flyTo;if(!_fly)return;
 function mainBody(f){const G=f&&f.geometry;if(!G||G.type!=="MultiPolygon"||G.coordinates.length<2)return G;
  const parts=G.coordinates.map(c=>{const g={type:"Polygon",coordinates:c};let a=0,m=null;try{a=d3.geoArea(g);m=d3.geoCentroid(g)}catch(e){}return{c,a,m}}).filter(q=>q.m).sort((x,y)=>y.a-x.a);if(!parts.length)return G;
  const big=parts[0],tot=parts.reduce((s,q)=>s+q.a,0);if(big.a<tot*.3)return G;/* a true archipelago (Indonesia, the Philippines): keep it all */
  let R=0;try{const b=d3.geoBounds({type:"Polygon",coordinates:big.c});[[b[0][0],b[0][1]],[b[1][0],b[1][1]]].forEach(p=>R=Math.max(R,d3.geoDistance(p,big.m)))}catch(e){}
  const keep=parts.filter(q=>q===big||d3.geoDistance(q.m,big.m)<R*.9+.03);return{type:"MultiPolygon",coordinates:keep.map(q=>q.c)}}
 P.flyTo=function(code,opts){try{if(!(opts&&(opts.center||opts.zoom))){const f=projFeatureFor(code,this.features);const g=f&&mainBody(f);
   if(g&&g!==f.geometry||this._flat&&g){const c=d3.geoCentroid(g);let r=0;/* the farthest coast point from the middle (works across the 180° line, unlike a box) */(g.type==="Polygon"?[g.coordinates]:g.coordinates).forEach(P=>{const ring=P[0],st=Math.max(1,Math.floor(ring.length/400));for(let i=0;i<ring.length;i+=st)r=Math.max(r,d3.geoDistance(ring[i],c))});
    const zoom=this._flat?Math.max(1.25,Math.min(11,Math.PI/(Math.max(.02,r)*(r>.3?3.4:4.4)))):Math.max(1,Math.min(9,.55/Math.max(.02,r)));
    return _fly.call(this,code,Object.assign({},opts||{},{center:c,zoom}))}}}catch(e){}return _fly.apply(this,arguments)}})();
/* tours on the flat map: a pin is shown wherever it falls inside the map (not only within a globe's radius of the
   middle), and each stop is framed from its flat-map view box rather than the globe's zoom */
/* tours set the east–west frame a stop needs: the stop's own frame from the old flat map (S.spin), else the one in use if the stop fits, else the usual one, else one centred on the stop */
const nrm=a=>((a%360)+540)%360-180;
function gfFrameFits(v,dl){if(!v)return true;let a=v[0],b=v[2];if(b<a)b+=360;if(b-a>=340)return true;return Math.abs(nrm((a+b)/2+dl))+(b-a)/2<=176}
function gfTourFrame(g,S){if(ps&&ps._gfDlHome===undefined)ps._gfDlHome=g._gfDl||0;const v=S.flatViewW||S.flatView||S.view,cur=g._gfDl||0;let want;
 if(S.spin!=null&&!(S.flatViewW&&!gfFrameFits(S.flatViewW,S.spin)))want=nrm(S.spin);else if(gfFrameFits(v,cur))want=cur;else if(gfFrameFits(v,0))want=0;else{let a=v[0],b=v[2];if(b<a)b+=360;want=nrm(-Math.round((a+b)/2/5)*5)}
 if(Math.abs(nrm(want-cur))>1e-6){g._gfOx=0;g._gfDl=want;g.request()}}
window.gfTourFrame=gfTourFrame;
(function(){const fix=()=>{if(typeof psScreen!=="function"||typeof psGlobeTarget!=="function"||psScreen._gfFlat)return false;
  const _sc=psScreen;psScreen=function(ll){try{if(ps&&ps.mode==="globe"&&ps.g&&ps.g._flat){const q=ps.g.projection()(ll);if(!q||!isFinite(q[0]))return null;const z=ps.g.size();if(q[0]<-40||q[1]<-40||q[0]>z.w+40||q[1]>z.h+40)return null;return[q[0],q[1]]}}catch(e){}return _sc.apply(this,arguments)};psScreen._gfFlat=1;
  const _gt=psGlobeTarget;psGlobeTarget=function(S){try{const g=ps&&ps.g;if(g&&g._flat&&S){gfTourFrame(g,S);const v0=S.flatViewW||S.flatView||S.view,v=v0&&[v0[0],v0[1],v0[2]<v0[0]?v0[2]+360:v0[2],v0[3]];if(v){const b=g._flatBase(),{w,h}=g.size(),z0=g.zoom;
     const pts=[];for(let i=0;i<=6;i++)for(let j=0;j<=6;j++){const q=b([v[0]+(v[2]-v[0])*i/6,v[1]+(v[3]-v[1])*j/6]);if(q)pts.push(q)}
     if(pts.length){const xs=pts.map(q=>q[0]/z0),ys=pts.map(q=>q[1]/z0),bw=Math.max(1e-6,Math.max(...xs)-Math.min(...xs)),bh=Math.max(1e-6,Math.max(...ys)-Math.min(...ys));
      /* the same frame the old flat map used: the view box with an 8% margin (12% top and bottom), at least 5° of longitude wide, over the whole map */
      let fw=bw*1.08,fh=bh*1.12;{const mx=(v[0]+v[2])/2,my=(v[1]+v[3])/2,qa=b([mx-2.5,my]),qb=b([mx+2.5,my]);if(qa&&qb){const minW=Math.abs(qb[0]-qa[0])/z0;if(fw<minW){fh*=minW/fw;fw=minW}}}
      const zt=Math.max(1,Math.min(24,Math.min(w/fw,h/fh)));const cx=(Math.max(...xs)+Math.min(...xs))/2*z0,cy=(Math.max(...ys)+Math.min(...ys))/2*z0,ll=b.invert([cx,cy]);
      return[ll&&isFinite(ll[0])?ll[0]:(v[0]+v[2])/2,ll&&isFinite(ll[1])?ll[1]:(v[1]+v[3])/2,zt]}}}}catch(e){}return _gt.apply(this,arguments)};
  /* the old flat map did not slide the view aside for the card; neither does this one */
  /* after a tour the map goes back to the frame it had before */
  if(typeof psEnd==="function"){const _pe=psEnd;psEnd=function(){let g=null,h;try{g=ps&&ps.g;h=ps&&ps._gfDlHome;if(ps)ps._gfDlHome=undefined}catch(e){}const r=_pe.apply(this,arguments);try{if(g&&h!==undefined&&(g._gfDl||0)!==h){g._gfDl=h;g.rot=[h,0];g.zoom=1;g.request()}}catch(e){}return r}}
  if(typeof psCardOver==="function"){const _co=psCardOver;psCardOver=function(){try{if(ps&&ps.g&&ps.g._flat)return 0}catch(e){}return _co.apply(this,arguments)}}
  return true};
 if(!fix()){const t=setInterval(()=>{if(fix())clearInterval(t)},500)}})();
/* Places: on the flat map each region opens on the old map's frame for it (its east–west frame, box and per-region tweaks) */
(function(){
 /* regions whose opening view is set here directly (west, south, east, north) */
 const FRAME_LL={"North America|All":[-170,6,-46,63]};
 function frameLL(g,v){let dl=SPIN.W.dl||0;if(!gfFrameFits(v,dl))dl=nrm(-Math.round((v[0]+v[2])/2/5)*5);g._gfOx=0;g._gfDl=dl;g.zoom=1;
  const b=g._flatBase(),{w,h}=g.size(),pts=[];for(let i=0;i<=6;i++)for(let j=0;j<=6;j++){const q=b([v[0]+(v[2]-v[0])*i/6,v[1]+(v[3]-v[1])*j/6]);if(q)pts.push(q)}
  const xs=pts.map(q=>q[0]),ys=pts.map(q=>q[1]),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
  g.zoom=Math.max(1,Math.min(24,Math.min(w/(x1-x0),h/(y1-y0))));const c=b.invert([(x0+x1)/2,(y0+y1)/2]);if(c&&isFinite(c[0]))g.rot=[-c[0],-c[1]];g.request();return true}
 function frame(g){try{if(!g||!g._flat||typeof defaultMapAtlasBox!=="function"||typeof SPIN==="undefined")return false;
  {const v=FRAME_LL[activeRegion+"|"+(activeSub||"All")];if(v)return frameLL(g,v)}
  const B=defaultMapAtlasBox(),f=SPIN.W.f,R=d3.geoRobinson().scale(318.31).translate([1e3,500.5]).rotate([SPIN.W.dl||0,0]);
  /* both maps are the same Robinson projection at different scales, so the box carries over exactly: its centre as longitude/latitude and its size */
  const bw=B.w/f.s,bh=B.h/f.s,cx=(B.x+B.w/2-f.bx)/f.s,cy=(B.y+B.h/2-f.by)/f.s,ROW=d3.geoRobinson().scale(318.31).translate([1e3,500.5]);
  const cl=ROW.invert([1e3,cy]);if(!cl||!isFinite(cl[1]))return false;const lat=Math.max(-85,Math.min(85,cl[1])),hw=ROW([180,lat])[0]-1e3;if(!(hw>0))return false;
  const c=[nrm(-(SPIN.W.dl||0)+(cx-1e3)/hw*180),lat],half=Math.min(180,bw/2/hw*180);
  let dl=SPIN.W.dl||0;if(!gfFrameFits([c[0]-half,0,c[0]+half,0],dl))dl=nrm(-Math.round(c[0]/5)*5);
  g._gfOx=0;g._gfDl=dl;const{w,h}=g.size(),k=w/2e3,z=Math.max(1,Math.min(24,Math.min(w/(bw*k),h/(bh*k))));
  g.zoom=z;if(c&&isFinite(c[0]))g.rot=[-c[0],-c[1]];g.request();return true}catch(e){return false}}
 window.gfStFrame=frame;
 const hook=()=>{if(typeof stFocus!=="function"||stFocus._gfF)return false;const _f=stFocus;stFocus=function(g){const r=_f.apply(this,arguments);try{if(g&&g._flat)frame(g);else if(g)g._gfFrameDue=1}catch(e){}return r};stFocus._gfF=1;return true};
 if(!hook()){const t=setInterval(()=>{if(hook())clearInterval(t)},300)}
 /* the flat map can switch on after the region was set: frame it then */
 setInterval(()=>{try{const g=typeof stGlobe!=="undefined"&&stGlobe;if(!g)return;const k=g._flat?[activeRegion,activeSub].join("|"):"";if(g._flat&&(g._gfFrameDue||g._gfFrameKey!==k)){g._gfFrameDue=0;g._gfFrameKey=k;frame(g)}else if(!g._flat)g._gfFrameKey=""}catch(e){}},250);
})();
