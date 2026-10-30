/* GeoFlock: a sharp City Lights flat map when zoomed in.
   The flat map's night picture is one 4000-px picture of the whole world (NIGHT_FLAT_IMG), so zoomed in it is stretched and
   soft, while the globe uses the 8192-px NASA Black Marble picture (GLOBE_NIGHT_IMG). Here, once the map is idle and zoomed
   in far enough that the 4000-px picture is being enlarged, the part of the world on screen is redrawn from the globe's
   picture at screen resolution and laid over the flat picture (under the borders, grid, day/night shading and labels,
   which are all drawn after it).
   How: only the piece of the globe picture that is on screen is decoded, off the page's main thread (createImageBitmap
   from the file, cropped and scaled to about screen size). In the Robinson projection every screen row is one latitude
   and along a row the longitude changes evenly, so (A) that piece is cut into strips of rows, stretched so each row of a
   working picture holds one screen row's latitude, then (B) each screen row is one stretched copy of its row. Both steps
   are plain drawImage calls, spread over idle frames in slices of a few milliseconds.
   While the map moves, the last sharp picture is moved and scaled with it (the flat map only ever slides and scales, so it
   stays lined up); a new one is made once the map has been still for a moment. The flat picture stays underneath, so
   nothing is ever bare.
   Memory: one screen-sized canvas is kept (plus, while a new one is made, a second one and screen-sized working copies);
   all freed when the map is zoomed out or leaves City Lights. The globe picture is kept only as its compressed file
   (about 0.5 MB), never as a whole decoded picture. Hooked from geoflock-flatglobe.js (_flatPictures). */
(function(){
if(typeof GlobeView==="undefined"||typeof d3==="undefined"||!d3.geoRobinson)return;
const IDLE=280,SLICE=8,BAND=8,MINMAG=1.15;
let tex=null,texUnused=0,O=null,job=null,timer=0,want=null,lastKey="";
const free=cv=>{try{if(cv&&cv.close)cv.close();else if(cv){cv.width=0;cv.height=0}}catch(e){}};
const night=h=>{try{return typeof NL_IMAGE!=="undefined"&&h===NL_IMAGE}catch(e){return false}};
/* the globe picture as its file (a Blob) and its size: {blob,W,H}, or a promise while it loads */
function texture(){if(tex)return tex;let src;try{src=GLOBE_NIGHT_IMG}catch(e){return null}if(!src||typeof createImageBitmap!=="function")return null;
 const t=tex={p:null,ok:false};
 t.p=fetch(src).then(r=>{if(!r.ok)throw new Error(r.status);return r.blob()}).then(blob=>new Promise((res,rej)=>{
   /* the size only (the header): an <img> that is never drawn is not decoded */
   const u=URL.createObjectURL(blob),i=new Image();i.onload=()=>{URL.revokeObjectURL(u);res({blob,W:i.naturalWidth,H:i.naturalHeight})};i.onerror=()=>{URL.revokeObjectURL(u);rej(new Error("img"))};i.src=u}))
  .then(v=>{if(tex===t){Object.assign(t,v);t.ok=t.W>0&&t.H>0}try{amGlobe&&amGlobe.request()}catch(e){}})
  .catch(()=>{setTimeout(()=>{if(tex===t)tex=null},5000)});
 return t}
/* the view as the overlay sees it: scale, centre, east–west frame and canvas size */
function viewOf(g,dpr){const p=g.projection(),S=p.scale(),t=p.translate(),{w,h}=g.size();return{S,t:[t[0],t[1]],dl:g._gfDl||0,w,h,dpr,key:[S.toFixed(3),t[0].toFixed(2),t[1].toFixed(2),g._gfDl||0,w,h,dpr].join("|")}}
function kill(j){if(!j)return;j.dead=true;free(j.O);free(j.E);(j.B||[]).forEach(free);if(job===j)job=null}
function dropAll(){kill(job);free(O&&O.cv);O=null;clearTimeout(timer);timer=0;lastKey=""}
/* off the map, or out of City Lights: free everything; the file itself is let go after a while unused */
setInterval(()=>{try{if((O||job)&&!(typeof amGlobe!=="undefined"&&amGlobe&&amGlobe._flat&&amGlobe.host&&amGlobe.host.isConnected&&amGlobe.host.offsetParent&&appMode==="allmaps"&&allMapsColorMode==="night"))dropAll()}catch(e){}
 if(tex&&tex.ok&&!O&&!job&&Date.now()-texUnused>60000)tex=null},2000);

/* called by the flat map right after it drew its own picture */
window.gfNightSharp=function(g,ctx,dpr,list,C){
 let ok=false;try{ok=typeof amGlobe!=="undefined"&&g===amGlobe&&g._flat&&!g._gfOx&&list&&list.length===1&&night(list[0].h)&&list[0].blend==="normal"&&!list[0].tf&&list[0].op>.99&&!!C}catch(e){}
 const V=ok?viewOf(g,dpr):null;
 /* how much the flat picture is enlarged on screen: below about 1:1 it is already as sharp as the screen */
 const mag=V?V.S/318.31/C.F*dpr:0;
 if(!V||mag<MINMAG){if(O||job)dropAll();return}
 texUnused=Date.now();
 /* the latest sharp picture, moved and scaled to this view (exact: the flat map only slides and scales); not when it
    would be enlarged more than the flat picture is */
 if(O&&O.dl===V.dl&&O.dpr===V.dpr){const a=V.S/O.S;if(O.key===V.key||a<=mag){ctx.save();ctx.globalAlpha=1;ctx.globalCompositeOperation="source-over";ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality=Math.abs(a-1)>.01?"high":"medium";
   ctx.setTransform(a,0,0,a,dpr*(V.t[0]-a*O.t[0]),dpr*(V.t[1]-a*O.t[1]));ctx.drawImage(O.cv,O.x,O.y);ctx.restore()}}
 if(job&&job.V.key!==V.key)kill(job);
 if(O&&O.key===V.key)return;
 /* a new view: make its sharp picture once the map has been still for a moment */
 want=V;if(V.key!==lastKey||!timer&&!job){lastKey=V.key;clearTimeout(timer);timer=setTimeout(()=>{timer=0;start(g)},IDLE)}};

const later=cb=>window.requestIdleCallback?requestIdleCallback(cb,{timeout:150}):setTimeout(cb,16);
function start(g){const V=want;if(!V||job&&job.V.key===V.key||O&&O.key===V.key)return;
 if(g._moving||g._flying||g._gfOx){timer=setTimeout(()=>{timer=0;start(g)},IDLE);return}
 const T=texture();if(!T)return;if(!T.ok){T.p.then(()=>{try{g.request()}catch(e){}});return}
 const TW=T.W,TH=T.H,{S,t,dl,w,h,dpr}=V,q0=d3.geoRobinson().scale(S).translate(t);
 /* the map's rows and columns on screen (device pixels) */
 const top=q0([0,90])[1],bot=q0([0,-90])[1],ya=Math.max(0,Math.floor(top*dpr)),yb=Math.min(Math.round(h*dpr),Math.ceil(bot*dpr));
 const half=q0([180,0])[0]-t[0],XL=Math.max(0,Math.floor((t[0]-half)*dpr)),XR=Math.min(Math.round(w*dpr),Math.ceil((t[0]+half)*dpr));
 const H=yb-ya,W=XR-XL;if(H<2||W<2)return;
 /* latitude at each row edge (k=0..H); latitude and half-width (CSS px) at each row's middle */
 const latAt=y=>{const v=q0.invert([t[0],y/dpr]);return v&&isFinite(v[1])?Math.max(-90,Math.min(90,v[1])):(y/dpr<t[1]?90:-90)};
 const latE=new Float64Array(H+1);for(let k=0;k<=H;k++)latE[k]=latAt(ya+k);
 const hwC=new Float64Array(H);let L0=180,L1=-180,ppd=0;
 for(let k=0;k<H;k++){const hw=q0([180,latAt(ya+k+.5)])[0]-t[0];hwC[k]=hw;if(!(hw>0))continue;
  const a=Math.max(-180,(XL/dpr-t[0])/hw*180),b=Math.min(180,(XR/dpr-t[0])/hw*180);if(b>a){L0=Math.min(L0,a);L1=Math.max(L1,b)}ppd=Math.max(ppd,hw*dpr/180)}
 if(!(L1>L0))return;
 const span=L1-L0,res=Math.min(TW/360,ppd),EW=Math.max(2,Math.min(8192,Math.ceil(span*res)));
 /* the rows of the globe picture in view, and its one or two pieces across the ±180° seam (in this east–west frame) */
 const syA=Math.max(0,Math.floor((90-latE[0])/180*TH)-1),syB=Math.min(TH,Math.ceil((90-latE[H])/180*TH)+1),cropH=syB-syA;if(cropH<1)return;
 const rh=Math.max(1,Math.min(cropH,Math.ceil(H*cropH/Math.max(1,(90-latE[0])/180*TH-(90-latE[H])/180*TH))+2));
 const a0=((L0-dl)%360+540)%360-180,parts=(a0+span<=180?[[a0,span,0]]:[[a0,180-a0,0],[-180,a0+span-180,180-a0]]).map(([lo,sp,off])=>{
   const sx=(lo+180)/360*TW,sw=sp/360*TW,cx=Math.max(0,Math.floor(sx)-1),cw=Math.min(TW,Math.ceil(sx+sw)+1)-cx,dw=sp/span*EW,rw=Math.max(1,Math.min(cw,Math.ceil(cw*dw/Math.max(1e-6,sw))+2));
   return{sx,sw,cx,cw,rw,dx:off/span*EW,dw}}).filter(p=>p.cw>0&&p.sw>0);
 const me=job={V,dead:false,B:[],E:null,O:null};
 /* only the piece in view is decoded, off the main thread, already scaled to about screen size */
 Promise.all(parts.map(p=>createImageBitmap(T.blob,p.cx,syA,p.cw,cropH,{resizeWidth:p.rw,resizeHeight:rh,resizeQuality:"high"}))).then(B=>{
  if(me.dead||job!==me){B.forEach(free);return}me.B=B;
  const E=me.E=document.createElement("canvas");E.width=EW;E.height=H;const ex=E.getContext("2d");ex.imageSmoothingEnabled=true;ex.imageSmoothingQuality="high";
  const NO=me.O=document.createElement("canvas");NO.width=W;NO.height=H;const ox=NO.getContext("2d");ox.imageSmoothingEnabled=true;ox.imageSmoothingQuality="high";
  const ky=rh/cropH;let k=0,stage=0;
  const step=()=>{if(me.dead||job!==me)return;const t0=performance.now();
   try{while(performance.now()-t0<SLICE){
    if(stage===0){/* A: a strip of rows, stretched so each row of E is one screen row's latitude */
     const k1=Math.min(H,k+BAND),y0=((90-latE[k])/180*TH-syA)*ky,y1=((90-latE[k1])/180*TH-syA)*ky;
     if(y1>y0+1e-6)parts.forEach((p,i)=>{const kx=p.rw/p.cw;ex.drawImage(B[i],(p.sx-p.cx)*kx,y0,p.sw*kx,y1-y0,p.dx,k,p.dw,k1-k)});
     k=k1;if(k>=H){stage=1;k=0;B.forEach(free);me.B=[]}}
    else{/* B: each screen row, one stretched copy of its row of E */
     const hw=hwC[k];if(hw>0){const xl=Math.max(XL,(t[0]-hw)*dpr),xr=Math.min(XR,(t[0]+hw)*dpr);
      if(xr-xl>.5){const la=(xl/dpr-t[0])/hw*180,lb=(xr/dpr-t[0])/hw*180;ox.drawImage(E,(la-L0)/span*EW,k,(lb-la)/span*EW,1,xl-XL,k,xr-xl,1)}}
     if(++k>=H){stage=2;break}}}}
   catch(e){console.error(e);kill(me);return}
   if(stage<2){later(step);return}
   free(E);me.E=null;me.O=null;job=null;const old=O;O={cv:NO,key:V.key,S,t,dl,dpr,x:XL,y:ya};if(old)free(old.cv);
   try{g.request()}catch(e){}};
  later(step)}).catch(e=>{console.error(e);kill(me)})}
window.gfNightSharpState=()=>({on:!!O,key:O&&O.key,size:O?[O.cv.width,O.cv.height]:null,building:!!job,file:!!(tex&&tex.ok)});
})();
