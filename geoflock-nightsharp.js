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
   - night: VIIRS Black Marble 2016, through the same colour table the night picture was made with.
   - sat: Blue Marble Next Generation, processed exactly as the satellite picture was made from it (see below).
   A tile that fails just leaves the picture underneath. */
(function(){
const BASE="https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/",ZMIN=4,ZMAX=7;
const L={night:{path:"VIIRS_Black_Marble/default/2016-01-01/500m/",ext:".png"},sat:{path:"BlueMarble_NextGeneration/default/default/500m/",ext:".jpeg"}};
const URL0=BASE+L.night.path;
const ppd=z=>512*Math.pow(2,z)/288,tdeg=z=>288/Math.pow(2,z);
/* sat: the satellite picture itself (textures/GLOBE_SAT_IMG, SAT_FLAT_IMG) was made from these same tiles, with this
   same colour table (per channel, fitted to the earlier picture's look) and the same sea rule, so zooming in changes
   only the sharpness. Sea: the tiles' sea is very dark, so dark pixels are see-through (the picture's own shaded sea
   shows); a coarse land mask (textures/SAT_LAND_MASK.png) also clears the summer sea ice, which has its own layer. */
const LUT=["0d1113141515161617171718181819191a1b1c1d1e2021232526282a2c2d2f30323334353738393a3b3c3d3e3f4041424343444546474849494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f60626364656667696a6b6c6e6f70727374757778797b7c7d7e80818284858688898a8c8d8e909193949697989a9c9d9fa0a2a4a5a7a9aaacaeafb1b3b5b6b8babcbdbfc1c2c4c6c7c9cacccecfd1d2d4d5d6d8d9dbdcdedfe1e2e4e5e6e7e8e8e9e9eaeaebebebececececededededeeeeeeeeeeeeefefefefeff0f0f0f0f0f0f1f1f1f1f1f1f1f1f2f2f2f2f2f2f2f2f2f2f3f3f3f3f4f4f4f5f6f7f9fafbfcfdfdfefefefefeffffffffffffffffffff","09181a1b1b1b1c1d1e1f202021232425262728292a2a2b2c2d2d2e2f30323334353637393a3b3c3e3f41424344454647484a4b4c4d4e4f505152535455565758595a5b5c5d5e5f6061626465666768696b6c6d6e6f71727374757678797a7b7c7d7f80818283858687898a8c8d8f9092939596989a9b9d9ea0a1a3a5a6a8a9aaacadafb0b2b3b5b6b8b9bbbcbebfc0c2c3c5c6c8c9cbcdced0d2d3d5d6d8dadbdddee0e1e3e4e6e7e8e9eaebebececedededeeeeeeeeeeeeeeeeeeeeeeeeeeeeefefefefefefefefefefefefefefefefefefefefefefefefefefefefefefefefefefefefefeff0f0f0f0f0f0f0f0f1f1f3f4f6f8fafbfcfcfdfdfefefefefeff","00000102030405060708090b0c0d0f1113141618191a1c1d1e1f20222324252728292b2c2e2f3132343537383a3c3d3f404243454647494a4c4d4e50515253555658595a5c5d5f6062636567686a6b6d6e707273747677787a7b7c7d7e7f81828384858788898a8c8d8e90919294959798999b9c9e9fa1a2a4a5a7a9aaacadafb0b2b3b4b6b7b8b9babcbdbebfc0c1c1c2c3c4c4c5c5c6c6c7c7c8c8c9c9c9cacacacbcbcbcccccccdcdcdcdcecececfcfcfcfd0d0d0d1d1d1d2d2d2d3d3d4d4d4d5d5d6d6d7d7d7d8d8d9dadadbdbdcdcdddededfe0e0e1e2e3e3e4e5e6e7e7e8e9eaeaebebececededeeeeefefeff0f1f2f2f3f4f5f6f7f8f9fafbfcfdfefe"].map(h=>{const a=new Uint8Array(256);for(let i=0;i<256;i++)a[i]=parseInt(h.substr(i*2,2),16);return a});
const cache=new Map();
/* night: the night picture (textures/GLOBE_NIGHT_IMG, NIGHT_FLAT_IMG) was made from these tiles with this table */
const LUTN=["000000000304040404040405050505060606060707070808090a0a0a0b0b0b0c0c0c0d0d0d0d0e0e0e0e0f101d202327282b2b2c2e2e303232333738383939393c3c3e3f4040444445454949494a4a4d4d4e4e4e50505454545456585858585e5e5e5f5f606060636364696969696969696b6d6d6d6d6d72727272727375767779797979797a7a7a7e7e7e8181828484848585858587878c8c8c8c8d8d909191919797979898989d9d9da0a0a0a1a1a1a1a1a2a6a7a7a7a7a7a8acacacacadadaeafafafafb1b1b7b7b7b7b8b8b8b8b8bcbcbcbdbdc2c2c8c8c8c8c8c9c9c9c9cecfd0d0d0d1d1d1d8d9dadadadbdbdddde0e0e0e0e6e7e9e9eaeaeef3f4fafc","00000000000506060606060606070707080809090a0a0b0b0b0c0c0d0d0d0e0e0f0f101011111111111212131313131516161b1c282c3236383b3b3c3e3f42424444464748484b4b4b4f4f525252525255555858585c5c5d5d5e5e5e636365656666676969696a6a6d6f747474747476767676797a7a7b81818181818282828484898989898c8c8c8e8e9090909090959595959798989899999d9d9d9e9ea1a1a1a1a1a1a1a2a2a7ababababacacb6b6b6b7b7b7b7b7b7b7b7b7b7b7b9bbbcbcc1c1c4c4c4c4c5c5c6c6c7cbcbcccccdcdcdd4d4d4d4d4d4d9d9d9dadadadadae0e0e0e0e0e2e2e2e2e2e3e5e5e6e7e8e9e9ebebebebefeff2f2f3f3f3f8f9fa","0000000000000000000000000000111315151515151515151515151515151515161616161717171717181818181818181819191a1a1a1b1b1b1b1b1b1c1c1c1d1d1e1e1f2021222323242424242424242424242424243b41464e545c606464646868686d6d6d6d717171727274767679797a80808082828284888888888c8c8c8c8c8c8f8f9091939395999b9b9b9d9d9e9e9f9fa2a2a2a2a2a2a3a7a7a7abababacadadadadafafafb2b5b5b8b8b8b8b8b9bababbbdbdbfbfbfc2c2c2c2c2c2c2c2c2c2c2c3c5c8c8c8c8c8cacacacacacacacacacacfcfcfcfcfcfcfcfcfcfd0d0d0d0d4d4d4d4d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d7d8d8d8d8da"].map(h=>{const a=new Uint8Array(256);for(let i=0;i<256;i++)a[i]=parseInt(h.substr(i*2,2),16);return a});
let MASK=null;function mask(){if(MASK)return MASK;MASK=new Promise(res=>{const im=new Image();im.onload=()=>{try{const c=document.createElement("canvas");c.width=im.naturalWidth;c.height=im.naturalHeight;
 const x=c.getContext("2d",{willReadFrequently:true});x.drawImage(im,0,0);const d=x.getImageData(0,0,c.width,c.height).data,W=c.width,H=c.height,m=new Uint8Array(W*H);for(let i=0;i<W*H;i++)m[i]=d[i*4];c.width=0;res({m,W,H})}catch(e){res(null)}};
 im.onerror=()=>res(null);im.src="textures/SAT_LAND_MASK.png"});return MASK}
function fixNight(im){try{const n=im.naturalWidth||512,c=document.createElement("canvas");c.width=c.height=n;const x=c.getContext("2d",{willReadFrequently:true});x.drawImage(im,0,0);
 const D=x.getImageData(0,0,n,n),d=D.data,R=LUTN[0],G=LUTN[1],B=LUTN[2];for(let q=0;q<d.length;q+=4){d[q]=R[d[q]];d[q+1]=G[d[q+1]];d[q+2]=B[d[q+2]];d[q+3]=255}
 x.putImageData(D,0,0);return c}catch(e){return null}}
function fix(im,kind,M,z,ty,tx){if(kind!=="sat")return fixNight(im);try{const n=im.naturalWidth||512,c=document.createElement("canvas");c.width=c.height=n;const x=c.getContext("2d",{willReadFrequently:true});x.drawImage(im,0,0);
 const D=x.getImageData(0,0,n,n),d=D.data,td=tdeg(z),R=LUT[0],Gc=LUT[1],B=LUT[2];
 for(let j=0;j<n;j++){const lat=90-(ty+(j+.5)/n)*td;let mrow=null,my=0,fy=0;
  if(M){const yy=(90-lat)/180*M.H-.5;my=Math.max(0,Math.min(M.H-2,Math.floor(yy)));fy=Math.max(0,Math.min(1,yy-my))}
  for(let i=0;i<n;i++){const q=(j*n+i)*4,r=d[q],g=d[q+1],b=d[q+2],mx=Math.max(r,g,b);
   let a=mx<=14?0:mx>=22?1:(mx-14)/8;if(b>=g+6&&b>=r+12&&r<24)a=0;
   if(a>0&&M){const lon=-180+(tx+(i+.5)/n)*td,xx=(lon+180)/360*M.W-.5,mxi=Math.max(0,Math.min(M.W-2,Math.floor(xx))),fx=Math.max(0,Math.min(1,xx-mxi)),o=my*M.W+mxi;
    const v=((M.m[o]*(1-fx)+M.m[o+1]*fx)*(1-fy)+(M.m[o+M.W]*(1-fx)+M.m[o+M.W+1]*fx)*fy)/255;a*=Math.max(0,Math.min(1,v*2-.5))}
   d[q]=R[r];d[q+1]=Gc[g];d[q+2]=B[b];d[q+3]=a*255}}
 x.putImageData(D,0,0);return c}catch(e){return null}}
function tile(z,y,x,kind){kind=kind||"night";const k=kind+"/"+z+"/"+y+"/"+x;let t=cache.get(k);if(t){cache.delete(k);cache.set(k,t);return t}
 t=new Promise(res=>{const i=new Image();i.crossOrigin="anonymous";i.onload=()=>{if(kind==="sat")mask().then(M=>res(fix(i,kind,M,z,y,x)));else res(fix(i,kind))};i.onerror=()=>{/* not remembered: a tile that failed (busy server, a dropped connection) is asked for again next time */
  setTimeout(()=>{if(cache.get(k)===t)cache.delete(k)},0);res(null)};i.src=BASE+L[kind].path+z+"/"+y+"/"+x+L[kind].ext});
 cache.set(k,t);if(cache.size>160){const old=cache.keys().next().value;const o=cache.get(old);cache.delete(old);/* left to be garbage-collected: a picture still being put together may be using it */}return t}
/* the detail level for a view showing need device pixels per degree, or null when the 8192-px picture is enough */
function level(need){if(!(need>8192/360*1.08))return null;for(let z=ZMIN;z<=ZMAX;z++)if(ppd(z)>=need*.9)return z;return ZMAX}
/* a piece of the world (x,y,w,h in a virtual picture TW×TH of the whole world) drawn at rw×rh from level-z tiles */
function crop(z,cx,cy,cw,ch,rw,rh,TW,TH,kind){kind=kind||"night";if(kind==="sat")mask();const lon0=cx/TW*360-180,lon1=(cx+cw)/TW*360-180,lat0=90-cy/TH*180,lat1=90-(cy+ch)/TH*180,td=tdeg(z);
 const nx=Math.ceil(360/td),ny=Math.ceil(180/td),x0=Math.max(0,Math.floor((lon0+180)/td)),x1=Math.min(nx-1,Math.floor((lon1+180-1e-9)/td)),y0=Math.max(0,Math.floor((90-lat0)/td)),y1=Math.min(ny-1,Math.floor((90-lat1-1e-9)/td));
 const c=document.createElement("canvas");c.width=rw;c.height=rh;const x=c.getContext("2d");x.imageSmoothingEnabled=true;x.imageSmoothingQuality="high";
 const sx=rw/(lon1-lon0),sy=rh/(lat0-lat1),jobs=[];
 for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++){const Lo=-180+tx*td,T=90-ty*td;
  jobs.push(tile(z,ty,tx,kind).then(im=>{if(!im){c._gfMiss=(c._gfMiss||0)+1;return}x.drawImage(im,(Lo-lon0)*sx,(lat0-T)*sy,td*sx+.6,td*sy+.6);x.filter="none"}))}
 return Promise.all(jobs).then(()=>c)}
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
 /* done, unless some tiles failed: then it is made again a few seconds later (tiles that loaded are kept) */
 if(O&&O.key===V.key&&!(O.miss&&Date.now()-O.at>4000))return;
 if(O&&O.key===V.key&&O.miss){O.at=Date.now();if(!job){want=V;start(g,true)}return}
 /* a new view: make its sharp picture once the map has been still for a moment */
 want=V;if(V.key!==lastKey||!timer&&!job){lastKey=V.key;clearTimeout(timer);timer=setTimeout(()=>{timer=0;start(g)},IDLE)}};

const later=cb=>window.requestIdleCallback?requestIdleCallback(cb,{timeout:150}):setTimeout(cb,16);
function start(g,again){const V=want;if(!V||job&&job.V.key===V.key||O&&O.key===V.key&&!again)return;
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
   free(E);me.E=null;me.O=null;job=null;const old=O;O={cv:NO,key:V.key,S,t,dl,dpr,x:XL,y:ya,kind:V.kind,miss:B.some(b=>b&&b._gfMiss),at:Date.now()};if(old)free(old.cv);if(O.miss)setTimeout(()=>{try{g.request()}catch(e){}},4300);
   try{g.request()}catch(e){}};
  later(step)}).catch(e=>{console.error(e);kill(me)})}
window.gfNightSharpState=()=>({on:!!O,key:O&&O.key,size:O?[O.cv.width,O.cv.height]:null,building:!!job,kind:O&&O.kind,miss:!!(O&&O.miss)});
})();
/* a clean redraw once the City Lights flat map settles (after opening, zooming or panning): otherwise the last frame
   could stay a scaled, blurred stand-in until the next interaction */
(function(){let key="",since=0,done="";
 setInterval(()=>{try{if(typeof amGlobe==="undefined"||!amGlobe||!amGlobe._flat||appMode!=="allmaps"||(allMapsColorMode!=="night"&&allMapsColorMode!=="satellite"))return;
  const p=amGlobe.projection(),t=p.translate(),k=[p.scale().toFixed(2),t[0].toFixed(1),t[1].toFixed(1),amGlobe._gfDl||0].join("|");
  if(k!==key){key=k;since=Date.now();return}
  if(done!==k&&Date.now()-since>450&&!amGlobe._moving&&!amGlobe._flying){done=k;const r=()=>{try{if(key===k&&(allMapsColorMode==="night"||allMapsColorMode==="satellite")&&amGlobe._flat)(amGlobe.render?amGlobe.render():amGlobe.request())}catch(e){}};[0,1200,3500].forEach(ms=>setTimeout(r,ms))}}catch(e){}},150)})();
/* safety: map flights last under 2 s; if one never reported its end (cut off mid-way), "flying" is cleared, so the sharp
   pictures (which wait for the map to stop) are not held back for good */
(function(){let since=0;setInterval(()=>{try{const g=typeof amGlobe!=="undefined"&&amGlobe;if(!g||!g._flying){since=0;return}
 if(!since)since=Date.now();else if(Date.now()-since>6000){g._flyId=(g._flyId||0)+1;g._flying=false;since=0;try{g.request?g.request():g.render()}catch(e){}}}catch(e){}},1000)})();
