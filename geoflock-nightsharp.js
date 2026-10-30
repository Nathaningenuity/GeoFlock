/* GeoFlock: a sharp City Lights flat map when zoomed in.
   The flat map's night picture is one 4000-px picture of the whole world (NIGHT_FLAT_IMG), so zoomed in it is stretched and
   soft, while the globe uses the 8192-px NASA Black Marble picture (GLOBE_NIGHT_IMG). Here, once the map is idle and zoomed
   in far enough that the 4000-px picture is being enlarged, the part of the world on screen is redrawn from the globe's
   picture at screen resolution and laid over the flat picture.
   How: in the Robinson projection every screen row is one latitude, and along a row the longitude changes evenly. So
   (A) the globe picture is cut into strips of rows and stretched so that each row of a small working picture holds the
   latitude of one screen row, then (B) each screen row is one stretched copy of that row. Both steps are plain drawImage
   calls (smooth, done by the browser), a few milliseconds each, spread over idle frames.
   While the map moves, the last sharp picture is moved and scaled with it (the flat map only ever slides and scales, so it
   stays lined up); the new one is made once the map has been still for a moment. The flat picture stays underneath, so
   nothing is ever bare.
   Memory: only screen-sized canvases (one kept, one more while a new one is built); everything is freed when the map is
   zoomed out or leaves City Lights, and the globe picture itself is let go a little later. Hooked from geoflock-flatglobe.js
   (_flatPictures). */
(function(){
if(typeof GlobeView==="undefined"||typeof d3==="undefined"||!d3.geoRobinson)return;
const TW=8192,TH=4096;/* the globe picture: equirectangular, longitude −180° at its left edge, latitude 90° at its top */
const IDLE=280,SLICE=10,BAND=8,MINMAG=1.15;
let tex=null,texUnused=0,O=null,job=null,timer=0,want=null,lastKey="";
const free=cv=>{if(cv){cv.width=0;cv.height=0}};
const night=h=>{try{return typeof NL_IMAGE!=="undefined"&&h===NL_IMAGE}catch(e){return false}};
function texture(){if(tex)return tex;let src;try{src=GLOBE_NIGHT_IMG}catch(e){return null}if(!src)return null;
 const i=new Image();i.decoding="async";i.onload=()=>{try{amGlobe&&amGlobe.request()}catch(e){}};i.onerror=()=>{if(tex===i)setTimeout(()=>{if(tex===i)tex=null},5000)};i.src=src;return tex=i}
const ready=i=>!!(i&&i.complete&&i.naturalWidth);
/* the view as the overlay sees it: scale, centre, east–west frame and canvas size */
function viewOf(g,dpr){const p=g.projection(),S=p.scale(),t=p.translate(),{w,h}=g.size();return{S,t:[t[0],t[1]],dl:g._gfDl||0,w,h,dpr,key:[S.toFixed(3),t[0].toFixed(2),t[1].toFixed(2),g._gfDl||0,w,h,dpr].join("|")}}
function dropAll(){if(job){job.dead=true;free(job.O);free(job.E);job=null}free(O&&O.cv);O=null;clearTimeout(timer);timer=0;lastKey=""}
/* let the globe picture go when the sharp map has not been needed for a while */
setInterval(()=>{try{if((O||job)&&!(typeof amGlobe!=="undefined"&&amGlobe&&amGlobe._flat&&amGlobe.host&&amGlobe.host.isConnected&&amGlobe.host.offsetParent&&appMode==="allmaps"&&allMapsColorMode==="night"))dropAll()}catch(e){}
 if(tex&&!O&&!job&&Date.now()-texUnused>30000){try{tex.src=""}catch(e){}tex=null}},2000);

/* called by the flat map right after it drew its own picture (ctx in device pixels via setTransform) */
window.gfNightSharp=function(g,ctx,dpr,list,C){
 let ok=false;try{ok=typeof amGlobe!=="undefined"&&g===amGlobe&&g._flat&&!g._gfOx&&list&&list.length===1&&night(list[0].h)&&list[0].blend==="normal"&&!list[0].tf&&list[0].op>.99&&C}catch(e){}
 const V=ok?viewOf(g,dpr):null;
 /* how much the flat picture is enlarged on screen: below about 1:1 it is already as sharp as the screen */
 const mag=V?V.S/318.31/C.F*dpr:0;
 if(!V||mag<MINMAG){if(O||job)dropAll();texUnused=Date.now();return}
 texUnused=Date.now();
 /* the latest sharp picture, moved and scaled to this view (exact: the flat map only slides and scales) */
 if(O&&O.dl===V.dl&&O.dpr===V.dpr){const a=V.S/O.S;if(O.key===V.key||a<=mag*1.05){ctx.save();ctx.globalAlpha=1;ctx.globalCompositeOperation="source-over";ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality=a>1.01?"high":"medium";
   ctx.setTransform(a,0,0,a,dpr*(V.t[0]-a*O.t[0]),dpr*(V.t[1]-a*O.t[1]));ctx.drawImage(O.cv,O.x,O.y);ctx.restore()}}
 if(O&&O.key===V.key){if(job&&job.V.key!==V.key){job.dead=true;free(job.O);free(job.E);job=null}return}
 /* a new view: build its sharp picture once the map has been still for a moment */
 want=V;if(job&&job.V.key!==V.key){job.dead=true;free(job.O);free(job.E);job=null}
 if(V.key!==lastKey||!timer){lastKey=V.key;clearTimeout(timer);timer=setTimeout(()=>{timer=0;start(g)},IDLE)}};

function busy(g){return!!(g._moving||g._flying||g._gfOx)}
function start(g){const V=want;if(!V||job&&job.V.key===V.key||O&&O.key===V.key)return;
 if(busy(g)){timer=setTimeout(()=>{timer=0;start(g)},IDLE);return}
 const T=texture();if(!ready(T)){if(T&&!T._gfNs){T._gfNs=1;T.addEventListener("load",()=>{try{g.request()}catch(e){}},{once:true})}return}
 const{S,t,dl,w,h,dpr}=V,q0=d3.geoRobinson().scale(S).translate(t);
 /* the rows of the map on screen (device pixels) */
 const top=q0([0,90])[1],bot=q0([0,-90])[1],ya=Math.max(0,Math.floor(top*dpr)),yb=Math.min(Math.round(h*dpr),Math.ceil(bot*dpr)),xa=0,xb=Math.round(w*dpr);
 const half=q0([180,0])[0]-t[0],XL=Math.max(xa,Math.floor((t[0]-half)*dpr)),XR=Math.min(xb,Math.ceil((t[0]+half)*dpr));
 const H=yb-ya,W=XR-XL;if(H<2||W<2)return;
 /* latitude and half-width (CSS px) of each row edge (k=0..H) and centre */
 const latAt=y=>{const v=q0.invert([t[0],y/dpr]);return v&&isFinite(v[1])?Math.max(-90,Math.min(90,v[1])):(y/dpr<t[1]?90:-90)};
 const hwAt=lat=>q0([180,lat])[0]-t[0];
 const latE=new Float64Array(H+1);for(let k=0;k<=H;k++)latE[k]=latAt(ya+k);
 const latC=new Float64Array(H),hwC=new Float64Array(H);let L0=180,L1=-180,ppd=0;
 for(let k=0;k<H;k++){const la=latAt(ya+k+.5),hw=hwAt(la);latC[k]=la;hwC[k]=hw;if(!(hw>0))continue;
  const a=Math.max(-180,((XL/dpr)-t[0])/hw*180),b=Math.min(180,((XR/dpr)-t[0])/hw*180);if(b>a){L0=Math.min(L0,a);L1=Math.max(L1,b)}ppd=Math.max(ppd,hw*dpr/180)}
 if(!(L1>L0))return;
 /* the working picture: one row per screen row, longitude evenly across, never finer than the globe picture */
 const res=Math.min(TW/360,ppd),EW=Math.max(2,Math.min(8192,Math.ceil((L1-L0)*res)));
 const E=document.createElement("canvas");E.width=EW;E.height=H;const ex=E.getContext("2d");ex.imageSmoothingEnabled=true;ex.imageSmoothingQuality="high";
 const NO=document.createElement("canvas");NO.width=W;NO.height=H;const ox=NO.getContext("2d");ox.imageSmoothingEnabled=true;ox.imageSmoothingQuality="high";
 job={V,E,O:NO,dead:false};const me=job;let k=0,stage=0;
 /* the longitude span [L0,L1] (in this frame) in the globe picture: one or two pieces across its ±180° seam */
 const a0=((L0-dl)%360+540)%360-180,span=L1-L0,pieces=a0+span<=180?[[a0,span,0]]:[[a0,180-a0,0],[-180,a0+span-180,180-a0]];
 const step=()=>{if(me.dead||job!==me)return;const t0=performance.now();
  try{while(performance.now()-t0<SLICE){
   if(stage===0){/* A: a strip of rows, stretched so each row of E is one screen row's latitude */
    const k1=Math.min(H,k+BAND),sy0=(90-latE[k])/180*TH,sy1=(90-latE[k1])/180*TH;
    if(sy1>sy0+1e-6)for(const[lo,sp,off]of pieces){const sx=(lo+180)/360*TW,sw=sp/360*TW,dx=off/span*EW,dw=sp/span*EW;if(sw>0&&dw>0)ex.drawImage(T,sx,Math.max(0,sy0),sw,Math.min(TH,sy1)-Math.max(0,sy0),dx,k,dw,k1-k)}
    k=k1;if(k>=H){stage=1;k=0}}
   else{/* B: each screen row, one stretched copy of its row of E */
    const hw=hwC[k];if(hw>0){const xl=Math.max(XL,(t[0]-hw)*dpr),xr=Math.min(XR,(t[0]+hw)*dpr);
     if(xr-xl>.5){const la=(xl/dpr-t[0])/hw*180,lb=(xr/dpr-t[0])/hw*180,sx=(la-L0)/span*EW,sw=(lb-la)/span*EW;if(sw>0)ox.drawImage(E,sx,k,sw,1,xl-XL,k,xr-xl,1)}}
    if(++k>=H){stage=2;break}}}}
  catch(e){console.error(e);me.dead=true;free(E);free(NO);if(job===me)job=null;return}
  if(stage<2){(window.requestIdleCallback?cb=>requestIdleCallback(cb,{timeout:200}):cb=>setTimeout(cb,16))(step);return}
  free(E);me.E=null;job=null;const old=O;O={cv:NO,key:V.key,S,t,dl,dpr,x:XL,y:ya};if(old)free(old.cv);
  try{g.request()}catch(e){}};
 step()}
window.gfNightSharpState=()=>({on:!!O,key:O&&O.key,size:O?[O.cv.width,O.cv.height]:null,building:!!job,tex:ready(tex)});
})();
