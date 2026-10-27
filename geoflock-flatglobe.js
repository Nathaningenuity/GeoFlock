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
window.gfFlatOn=()=>{try{return typeof amGlobe!=="undefined"&&!!amGlobe&&!!amGlobe._flat&&flatWanted()}catch(e){return false}};
{const _on=amGlobeOn;amGlobeOn=function(){return _on.apply(this,arguments)||flatWanted()}}

/* ---------- geometry ---------- */
const P=GlobeView.prototype;
{const _size=P.size;P.size=function(){if(!this._flat)return _size.apply(this,arguments);
 const avail=Math.max(320,this.host.clientWidth||this.host.parentNode&&this.host.parentNode.clientWidth||900),capH=Math.max(260,innerHeight*.82);
 let w=Math.round(Math.min(avail,capH/.5072));const h=Math.round(w*.5072);/* r: the size the label and detail rules see; matched to the flat map's real scale */
 const r=this._bigR?1e6:w/(2*Math.PI*RX)*1.07;return{w,h,r}}}
P._flatBase=function(){const{w}=this.size(),S=w/(2*Math.PI*RX)*this.zoom;return d3.geoRobinson().scale(S).translate([0,0])};
{const _proj=P.projection;P.projection=function(){if(!this._flat)return _proj.apply(this,arguments);
 const{w,h}=this.size(),b=this._flatBase(),c=[-this.rot[0],-this.rot[1]];let q=b(c)||[0,0];
 /* the view never leaves the map: the centre is kept inside */
 const hx=Math.max(0,w/2*this.zoom-w/2),hy=Math.max(0,h/2*this.zoom-h/2);q=[Math.max(-hx,Math.min(hx,q[0])),Math.max(-hy,Math.min(hy,q[1]))];
 const ll=b.invert(q);if(ll&&isFinite(ll[0]))this.rot=[-ll[0],-ll[1]];
 const p=b.translate([w/2-q[0],h/2-q[1]]);const inv=p.invert.bind(p);p.invert=pt=>{const v=inv(pt);return v&&isFinite(v[0])&&Math.abs(v[0])<=180.0001&&Math.abs(v[1])<=90?v:null};return p}}
{const _roll=P.roll;P.roll=function(){return this._flat?0:_roll.apply(this,arguments)}}
{const _va=P.visibleAngle;P.visibleAngle=function(){return this._flat?Math.PI:_va.apply(this,arguments)}}
/* "is it on the visible side of the ball?" is always yes on the flat map (distance to the view centre counts as 0) */
{const _gd=d3.geoDistance;d3.geoDistance=function(a,b){const g=typeof amGlobe!=="undefined"&&amGlobe;if(g&&g._flat&&a&&b){const c0=-g.rot[0],c1=-g.rot[1];if((b[0]===c0&&b[1]===c1)||(a[0]===c0&&a[1]===c1))return 0}return _gd(a,b)}}
/* hit tests use the ball's outline; on the flat map the whole rectangle counts */
["hit","_hover","waterAt"].forEach(k=>{const f=P[k];if(!f)return;P[k]=function(){if(!this._flat)return f.apply(this,arguments);this._bigR=true;try{return f.apply(this,arguments)}finally{this._bigR=false}}});
try{if(typeof gfSpinWanted==="function"){const _s=gfSpinWanted;gfSpinWanted=function(g){if(g&&g._flat)return false;return _s.apply(this,arguments)}}}catch(e){}

/* ---------- drawing ---------- */
/* the flat map's own pictures (relief, shading, sea depth, satellite, climate…), as they are layered in the old map */
let PIC=null,picT=0;const IMG=new Map;
function img(h){let i=IMG.get(h);if(!i){i=new Image();i.decoding="async";i.onload=()=>{try{amGlobe&&amGlobe.request()}catch(e){}};i.src=h;IMG.set(h,i)}return i}
function pictures(){const now=performance.now();if(PIC&&now-picT<400)return PIC;picT=now;const svg=document.querySelector("#allMapsWrap > svg");PIC=[];if(!svg)return PIC;
 svg.querySelectorAll("image").forEach(el=>{let e=el,op=1,ok=true,blend="normal";while(e&&e!==svg){const cs=getComputedStyle(e);if(cs.display==="none"||cs.visibility==="hidden"){ok=false;break}op*=+cs.opacity;if(blend==="normal"&&cs.mixBlendMode&&cs.mixBlendMode!=="normal")blend=cs.mixBlendMode;e=e.parentNode}
  if(!ok||op<=.01)return;const h=el.getAttribute("href")||el.getAttribute("xlink:href");if(!h)return;
  const n=k=>parseFloat(el.getAttribute(k))||0;let tf=null;try{const m=el.transform&&el.transform.baseVal&&el.transform.baseVal.consolidate();if(m)tf=m.matrix}catch(er){}
  PIC.push({h,x:n("x"),y:n("y"),w:n("width"),hh:n("height"),op,blend,tf,pr:el.getAttribute("preserveAspectRatio")})});return PIC}
P._flatPictures=function(ctx,dpr){const{w,h}=this.size(),p=this.projection(),S=p.scale(),t=p.translate(),k=S/318.31,list=pictures();let drew=0;
 ctx.save();ctx.setTransform(dpr*k,0,0,dpr*k,dpr*(t[0]-1e3*k),dpr*(t[1]-500.5*k));ctx.imageSmoothingQuality="high";
 list.forEach(o=>{const im=img(o.h);if(!im.complete||!im.naturalWidth)return;ctx.globalAlpha=o.op;ctx.globalCompositeOperation=o.blend==="normal"?"source-over":o.blend;
  ctx.save();if(o.tf)ctx.transform(o.tf.a,o.tf.b,o.tf.c,o.tf.d,o.tf.e,o.tf.f);ctx.drawImage(im,o.x,o.y,o.w||im.naturalWidth,o.hh||im.naturalHeight);ctx.restore();drew++});
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
{const _r=P._render;P._render=function(){if(typeof amGlobe==="undefined"||this!==amGlobe){this._flat=false;return _r.apply(this,arguments)}
 const want=flatWanted();if(want!==!!this._flat){this._flat=want;if(want){this.zoom=Math.max(1,this.zoom);if(this._flatHome!==false){this.zoom=1;this.rot=[0,0]}}else{this.zoom=1;this.rot=this.cfg.rot?this.cfg.rot.slice():[-15,-20]}
  this.host.classList.toggle("gf-flat",want);const v=document.getElementById("allMapsView");if(v)v.classList.toggle("gf-flatc",want);if(want)setTimeout(()=>{try{gfFlatSave()}catch(e){}},0)}
 if(!this._flat)return _r.apply(this,arguments);
 flatCtx(this);const{w,h,r}=this.size();this._flatR={w,h,r,s:r*this.zoom,p:this.projection(),skip:false};
 /* the GL ball is not used: the flat pictures go on the 2-D canvas first */
 const gl=this.gl;if(gl&&!gl._gfFlat){gl._gfFlat=1;const D=gl.draw.bind(gl),T=gl.texture.bind(gl),self=this;gl.texture=function(){return self._flat?null:T.apply(gl,arguments)};
  gl.draw=function(o){if(!self._flat)return D(o);D(null);if(!self._inFlat||self._picDone)return;self._picDone=true;const dpr=Math.min(2,window.devicePixelRatio||1);const n=self._flatPictures(self.ctx,dpr);self._flatR.skip=n>0}}
 if(!gl){/* no GL: draw the pictures right after the canvas is cleared */}
 this._inFlat=true;this._picDone=false;let r0;try{r0=_r.apply(this,arguments)}finally{this._inFlat=false}
 this.host.style.setProperty("margin-top","10px","important");
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
#amGlobeHost.gf-flat{ margin-top:10px !important; }
#amGlobeHost.gf-flat .globe-stage{ margin:0 auto; }
#amGlobeHost.gf-flat .globe-btns [data-g="spin"]{ display:none !important; }
#amGlobeHost.gf-flat canvas.globe-gl{ visibility:hidden; }
#amGlobeHost.gf-flat canvas.globe-canvas{ cursor:grab; }
#amGlobeHost.gf-flat canvas.globe-canvas:active{ cursor:grabbing; }
`;document.head.appendChild(st);
/* the switch: choosing Flat map on a map the globe can show brings up the flat view right away */
setInterval(()=>{try{if(typeof amGlobe!=="undefined"&&amGlobe){wire(amGlobe);const want=flatWanted();if(want!==!!amGlobe._flat)amGlobe.request()}else if(flatWanted()&&typeof amGlobeSync==="function")amGlobeSync()}catch(e){}},400);
})();
/* labels on the flat map read at the size the old flat map used */
(function(){const P=GlobeView.prototype,_ls=P.ls;if(_ls)P.ls=function(){const v=_ls.apply(this,arguments);return this._flat?v*1.35:v}})();
