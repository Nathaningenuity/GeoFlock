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
/* NASA GIBS tiles, 512 px in plain latitude/longitude (EPSG:4326); level z tiles are 288/2^z degrees square, down to about
   500 m a pixel at level 7. Used where the view needs more detail than the 8192-px globe pictures.
   - night: VIIRS Black Marble 2016, brightened to match the night picture.
   - sat: Blue Marble Next Generation (the same summer composite as the satellite picture), its colours fitted to that
     picture over land; its near-black sea is left see-through, so the picture's own blue sea shows.
   A tile that fails just leaves the picture underneath. */
(function(){
const BASE="https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/",ZMIN=4,ZMAX=7;
const L={night:{path:"VIIRS_Black_Marble/default/2016-01-01/500m/",ext:".png"},sat:{path:"BlueMarble_NextGeneration/default/default/500m/",ext:".jpeg"}};
const URL0=BASE+L.night.path;
const ppd=z=>512*Math.pow(2,z)/288,tdeg=z=>288/Math.pow(2,z);
const G=[[1.345,-8.9],[1.452,-8.0],[1.494,-13.5]];
const cache=new Map();
function fix(im,kind){if(kind!=="sat")return im;try{const c=document.createElement("canvas");c.width=im.naturalWidth||512;c.height=im.naturalHeight||512;const x=c.getContext("2d",{willReadFrequently:true});x.drawImage(im,0,0);
 const D=x.getImageData(0,0,c.width,c.height),d=D.data;for(let i=0;i<d.length;i+=4){const r=d[i],g=d[i+1],b=d[i+2],lum=(r+g+b)/3;
  d[i]=r*G[0][0]+G[0][1];d[i+1]=g*G[1][0]+G[1][1];d[i+2]=b*G[2][0]+G[2][1];d[i+3]=lum<28?0:lum<40?(lum-28)/12*255:255}
 x.putImageData(D,0,0);return c}catch(e){return null}}
function tile(z,y,x,kind){kind=kind||"night";const k=kind+"/"+z+"/"+y+"/"+x;let t=cache.get(k);if(t){cache.delete(k);cache.set(k,t);return t}
 t=new Promise(res=>{const i=new Image();i.crossOrigin="anonymous";i.onload=()=>res(fix(i,kind));i.onerror=()=>res(null);i.src=BASE+L[kind].path+z+"/"+y+"/"+x+L[kind].ext});
 cache.set(k,t);if(cache.size>160){const old=cache.keys().next().value;const o=cache.get(old);cache.delete(old);o&&o.then&&o.then(c=>{if(c&&c.getContext){c.width=0;c.height=0}})}return t}
/* the detail level for a view showing need device pixels per degree, or null when the 8192-px picture is enough */
function level(need){if(!(need>8192/360*1.08))return null;for(let z=ZMIN;z<=ZMAX;z++)if(ppd(z)>=need*.9)return z;return ZMAX}
/* a piece of the world (x,y,w,h in a virtual picture TW×TH of the whole world) drawn at rw×rh from level-z tiles */
function crop(z,cx,cy,cw,ch,rw,rh,TW,TH,kind){kind=kind||"night";if(kind==="sat")ref();const lon0=cx/TW*360-180,lon1=(cx+cw)/TW*360-180,lat0=90-cy/TH*180,lat1=90-(cy+ch)/TH*180,td=tdeg(z);
 const nx=Math.ceil(360/td),ny=Math.ceil(180/td),x0=Math.max(0,Math.floor((lon0+180)/td)),x1=Math.min(nx-1,Math.floor((lon1+180-1e-9)/td)),y0=Math.max(0,Math.floor((90-lat0)/td)),y1=Math.min(ny-1,Math.floor((90-lat1-1e-9)/td));
 const c=document.createElement("canvas");c.width=rw;c.height=rh;const x=c.getContext("2d");x.imageSmoothingEnabled=true;x.imageSmoothingQuality="high";
 const sx=rw/(lon1-lon0),sy=rh/(lat0-lat1),jobs=[];
 for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++){const Lo=-180+tx*td,T=90-ty*td;
  jobs.push(tile(z,ty,tx,kind).then(im=>{if(!im)return;if(kind==="night")x.filter="brightness(1.35) saturate(1.08)";x.drawImage(im,(Lo-lon0)*sx,(lat0-T)*sy,td*sx+.6,td*sy+.6);x.filter="none"}))}
 return Promise.all(jobs).then(()=>kind==="sat"?match(c,lon0,lat0,lon1,lat1):c)}
/* colour match: the fixed fit above is right on average, but deserts, forests and ice differ a little. Each sharp
   picture is compared with our own satellite picture over the same land and its colours nudged (per channel: the same
   average), so zooming in changes the sharpness, not the colours. */
let REF=null;
function ref(){if(REF)return REF.p;REF={p:new Promise(res=>{let src;try{src=GLOBE_SAT_IMG}catch(e){}if(!src)return res(null);const im=new Image();im.crossOrigin="anonymous";
 im.onload=()=>{try{const c=document.createElement("canvas");c.width=4096;c.height=2048;const x=c.getContext("2d",{willReadFrequently:true});x.drawImage(im,0,0,4096,2048);REF.d=x.getImageData(0,0,4096,2048).data;c.width=0;res(REF)}catch(e){res(null)}};
 im.onerror=()=>res(null);im.src=src})};return REF.p}
let FID=0,LAST=null;
function match(c,lon0,lat0,lon1,lat1){return ref().then(R=>{if(!R||!R.d)return c;try{
 const k=4096/360,X0=Math.floor((lon0+180)*k),Y0=Math.floor((90-lat0)*k),sw=Math.max(4,Math.min(512,Math.round((lon1-lon0)*k))),sh=Math.max(4,Math.min(512,Math.round((lat0-lat1)*k)));
 const m=document.createElement("canvas");m.width=sw;m.height=sh;const mx=m.getContext("2d",{willReadFrequently:true});mx.drawImage(c,0,0,sw,sh);const P=mx.getImageData(0,0,sw,sh).data;
 const sA=[0,0,0],sB=[0,0,0],qA=[0,0,0],qB=[0,0,0];let n=0;
 for(let j=0;j<sh;j++){const Y=Math.min(2047,Y0+Math.floor(j*(lat0-lat1)*k/sh));for(let i=0;i<sw;i++){const q=(j*sw+i)*4;if(P[q+3]<250)continue;
  const X=Math.min(4095,Math.max(0,X0+Math.floor(i*(lon1-lon0)*k/sw))),r=(Y*4096+X)*4;
  /* snow and ice left out: sharp snow is brighter than the same snow blurred, and would darken everything else */
  if(P[q]+P[q+1]+P[q+2]>570||R.d[r]+R.d[r+1]+R.d[r+2]>570)continue;
  for(let ch=0;ch<3;ch++){const a=P[q+ch],b=R.d[r+ch];sA[ch]+=a;qA[ch]+=a*a;sB[ch]+=b;qB[ch]+=b*b}n++}}
 m.width=0;const mid=[(lon0+lon1)/2,(lat0+lat1)/2];let sl=[],ic=[0,0,0];
 /* too little land to judge (zoomed far in, or mostly snow): the last nearby match is used, else the fixed fit */
 if(n<120){if(LAST&&Math.abs(LAST.mid[0]-mid[0])<15&&Math.abs(LAST.mid[1]-mid[1])<12)sl=LAST.sl;else return c}
 else for(let ch=0;ch<3;ch++){const mA=sA[ch]/n,mB=sB[ch]/n,dA=Math.sqrt(Math.max(1,qA[ch]/n-mA*mA)),dB=Math.sqrt(Math.max(1,qB[ch]/n-mB*mB));
  /* the same average colour, by a gain only: matching the spread too would blur away the sharp picture's contrast */
  const g=Math.max(.8,Math.min(1.25,(mB+4)/(mA+4)));sl.push(g)}
 if(n>=120)LAST={mid,sl};
 const id="gfSatFix"+(++FID%4),NS="http://www.w3.org/2000/svg";let sv=document.getElementById("gfSatFixes");
 if(!sv){sv=document.createElementNS(NS,"svg");sv.id="gfSatFixes";sv.setAttribute("width","0");sv.setAttribute("height","0");sv.style.cssText="position:absolute;width:0;height:0";document.body.appendChild(sv)}
 let f=document.getElementById(id);if(f)f.remove();f=document.createElementNS(NS,"filter");f.id=id;f.setAttribute("color-interpolation-filters","sRGB");
 const t=document.createElementNS(NS,"feComponentTransfer");["R","G","B"].forEach((C,ch)=>{const e=document.createElementNS(NS,"feFunc"+C);e.setAttribute("type","linear");e.setAttribute("slope",sl[ch].toFixed(4));e.setAttribute("intercept",ic[ch].toFixed(4));t.appendChild(e)});
 f.appendChild(t);sv.appendChild(f);
 const o=document.createElement("canvas");o.width=c.width;o.height=c.height;const ox=o.getContext("2d");ox.filter="url(#"+id+")";ox.drawImage(c,0,0);ox.filter="none";c.width=0;
 window.gfSatFixLast={sl,ic,n};return o}catch(e){return c}})}
window.gfGibs={level,ppd,crop,tile,tdeg,ZMAX,URL0};
})();
(function(){
if(typeof GlobeView==="undefined"||typeof d3==="undefined"||!d3.geoRobinson)return;
const IDLE=280,SLICE=8,BAND=8,MINMAG=1.05;/* only once the flat picture is being enlarged: zoomed out, the flat picture shrunk to the screen is sharper than the overlay */
let TEX={},texUnused=0,O=null,job=null,timer=0,want=null,lastKey="";
const free=cv=>{try{if(cv&&cv.close)cv.close();else if(cv){cv.width=0;cv.height=0}}catch(e){}};
/* which picture the flat map shows: the night picture or (the same way) the satellite one */
const kindOf=h=>{try{if(typeof NL_IMAGE!=="undefined"&&h===NL_IMAGE)return"night";if(typeof SAT_FLAT_IMG!=="undefined"&&h===SAT_FLAT_IMG)return"sat"}catch(e){}return null};
/* the globe picture as its file (a Blob) and its size: {blob,W,H}, or a promise while it loads */
function texture(kind){if(TEX[kind])return TEX[kind];let src;try{src=kind==="sat"?GLOBE_SAT_IMG:GLOBE_NIGHT_IMG}catch(e){return null}if(!src||typeof createImageBitmap!=="function")return null;
 const t=TEX[kind]={p:null,ok:false};
 t.p=fetch(src).then(r=>{if(!r.ok)throw new Error(r.status);return r.blob()}).then(blob=>new Promise((res,rej)=>{
   /* the size only (the header): an <img> that is never drawn is not decoded */
   const u=URL.createObjectURL(blob),i=new Image();i.onload=()=>{URL.revokeObjectURL(u);res({blob,W:i.naturalWidth,H:i.naturalHeight})};i.onerror=()=>{URL.revokeObjectURL(u);rej(new Error("img"))};i.src=u}))
  .then(v=>{if(TEX[kind]===t){Object.assign(t,v);t.ok=t.W>0&&t.H>0}try{amGlobe&&amGlobe.request()}catch(e){}})
  .catch(()=>{setTimeout(()=>{if(TEX[kind]===t)delete TEX[kind]},5000)});
 return t}
/* the view as the overlay sees it: scale, centre, east–west frame and canvas size */
function viewOf(g,dpr,kind){const p=g.projection(),S=p.scale(),t=p.translate(),{w,h}=g.size();return{S,t:[t[0],t[1]],dl:g._gfDl||0,w,h,dpr,kind,key:[kind,S.toFixed(3),t[0].toFixed(2),t[1].toFixed(2),g._gfDl||0,w,h,dpr].join("|")}}
function kill(j){if(!j)return;j.dead=true;free(j.O);free(j.E);(j.B||[]).forEach(free);if(job===j)job=null}
function dropAll(){kill(job);free(O&&O.cv);O=null;clearTimeout(timer);timer=0;lastKey=""}
/* off the map, or out of City Lights: free everything; the file itself is let go after a while unused */
setInterval(()=>{try{if((O||job)&&!(typeof amGlobe!=="undefined"&&amGlobe&&amGlobe._flat&&amGlobe.host&&amGlobe.host.isConnected&&amGlobe.host.offsetParent&&appMode==="allmaps"&&(allMapsColorMode==="night"||allMapsColorMode==="satellite")))dropAll()}catch(e){}
 if(!O&&!job&&Date.now()-texUnused>60000)TEX={}},2000);

/* called by the flat map right after it drew its own picture */
window.gfNightSharp=function(g,ctx,dpr,list,C){
 let ok=false,kind=null;try{kind=list&&list.length>=1?kindOf(list[0].h):null;ok=typeof amGlobe!=="undefined"&&g===amGlobe&&g._flat&&!g._gfOx&&!!kind&&(list.length===1||kind==="sat")&&list[0].blend==="normal"&&!list[0].tf&&list[0].op>.99&&!!C}catch(e){}
 const V=ok?viewOf(g,dpr,kind):null;
 /* how much the flat picture is enlarged on screen: below about 1:1 it is already as sharp as the screen */
 const mag=V?V.S/318.31/C.F*dpr:0;
 if(!V||mag<MINMAG){if(O||job)dropAll();return}
 texUnused=Date.now();
 /* the latest sharp picture, moved and scaled to this view (exact: the flat map only slides and scales); not when it
    would be enlarged more than the flat picture is */
 if(O&&O.dl===V.dl&&O.dpr===V.dpr&&O.kind===V.kind){const a=V.S/O.S;if(O.key===V.key||a<=mag){ctx.save();ctx.globalAlpha=1;ctx.globalCompositeOperation="source-over";ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality=Math.abs(a-1)>.01?"high":"medium";
   ctx.setTransform(a,0,0,a,dpr*(V.t[0]-a*O.t[0]),dpr*(V.t[1]-a*O.t[1]));ctx.drawImage(O.cv,O.x,O.y);ctx.restore()}}
 if(job&&job.V.key!==V.key)kill(job);
 if(O&&O.key===V.key)return;
 /* a new view: make its sharp picture once the map has been still for a moment */
 want=V;if(V.key!==lastKey||!timer&&!job){lastKey=V.key;clearTimeout(timer);timer=setTimeout(()=>{timer=0;start(g)},IDLE)}};

const later=cb=>window.requestIdleCallback?requestIdleCallback(cb,{timeout:150}):setTimeout(cb,16);
function start(g){const V=want;if(!V||job&&job.V.key===V.key||O&&O.key===V.key)return;
 if(g._moving||g._flying||g._gfOx){timer=setTimeout(()=>{timer=0;start(g)},IDLE);return}
 const {S,t,dl,w,h,dpr}=V,q0=d3.geoRobinson().scale(S).translate(t);
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
 /* zoomed in past the globe picture's detail: NASA's tiles (GIBS) at the level the screen needs; otherwise the picture */
 const Z=window.gfGibs?gfGibs.level(ppd):null;let T=null,TW,TH;
 if(Z!=null){TW=360*gfGibs.ppd(Z);TH=180*gfGibs.ppd(Z)}
 else{T=texture(V.kind);if(!T)return;if(!T.ok){T.p.then(()=>{try{g.request()}catch(e){}});return}TW=T.W;TH=T.H}
 const span=L1-L0,res=Math.min(TW/360,ppd),EW=Math.max(2,Math.min(8192,Math.ceil(span*res)));
 /* the rows of the globe picture in view, and its one or two pieces across the ±180° seam (in this east–west frame) */
 const syA=Math.max(0,Math.floor((90-latE[0])/180*TH)-1),syB=Math.min(TH,Math.ceil((90-latE[H])/180*TH)+1),cropH=syB-syA;if(cropH<1)return;
 const rh=Math.max(1,Math.min(cropH,Math.ceil(H*cropH/Math.max(1,(90-latE[0])/180*TH-(90-latE[H])/180*TH))+2));
 const a0=((L0-dl)%360+540)%360-180,parts=(a0+span<=180?[[a0,span,0]]:[[a0,180-a0,0],[-180,a0+span-180,180-a0]]).map(([lo,sp,off])=>{
   const sx=(lo+180)/360*TW,sw=sp/360*TW,cx=Math.max(0,Math.floor(sx)-1),cw=Math.min(TW,Math.ceil(sx+sw)+1)-cx,dw=sp/span*EW,rw=Math.max(1,Math.min(cw,Math.ceil(cw*dw/Math.max(1e-6,sw))+2));
   return{sx,sw,cx,cw,rw,dx:off/span*EW,dw}}).filter(p=>p.cw>0&&p.sw>0);
 const me=job={V,dead:false,B:[],E:null,O:null};
 /* only the piece in view is decoded, off the main thread, already scaled to about screen size */
 Promise.all(parts.map(p=>Z!=null?gfGibs.crop(Z,p.cx,syA,p.cw,cropH,p.rw,rh,TW,TH,V.kind):createImageBitmap(T.blob,p.cx,syA,p.cw,cropH,{resizeWidth:p.rw,resizeHeight:rh,resizeQuality:"high"}))).then(B=>{
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
   free(E);me.E=null;me.O=null;job=null;const old=O;O={cv:NO,key:V.key,S,t,dl,dpr,x:XL,y:ya,kind:V.kind};if(old)free(old.cv);
   try{g.request()}catch(e){}};
  later(step)}).catch(e=>{console.error(e);kill(me)})}
window.gfNightSharpState=()=>({on:!!O,key:O&&O.key,size:O?[O.cv.width,O.cv.height]:null,building:!!job,kind:O&&O.kind});
})();
/* a clean redraw once the City Lights flat map settles (after opening, zooming or panning): otherwise the last frame
   could stay a scaled, blurred stand-in until the next interaction */
(function(){let key="",since=0,done="";
 setInterval(()=>{try{if(typeof amGlobe==="undefined"||!amGlobe||!amGlobe._flat||appMode!=="allmaps"||(allMapsColorMode!=="night"&&allMapsColorMode!=="satellite"))return;
  const p=amGlobe.projection(),t=p.translate(),k=[p.scale().toFixed(2),t[0].toFixed(1),t[1].toFixed(1),amGlobe._gfDl||0].join("|");
  if(k!==key){key=k;since=Date.now();return}
  if(done!==k&&Date.now()-since>450&&!amGlobe._moving&&!amGlobe._flying){done=k;const r=()=>{try{if(key===k&&(allMapsColorMode==="night"||allMapsColorMode==="satellite")&&amGlobe._flat)(amGlobe.render?amGlobe.render():amGlobe.request())}catch(e){}};[0,1200,3500].forEach(ms=>setTimeout(r,ms))}}catch(e){}},150)})();
