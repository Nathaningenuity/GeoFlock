/* GeoFlock: the Elevation map gets sharper as you zoom in on the globe. Its picture is about 10 km a pixel; zoomed in, the
   heights for the view are fetched (AWS Terrain Tiles, the same heights the cross-section uses: SRTM, GMTED2010, ETOPO1 and
   other open data) and coloured with the Elevation map's own colours (its legend's stops, as the picture was made), then
   shaded with light from the north-west as the picture is. The globe's shader puts it in place of the picture (index.html,
   GlobeGL.draw → gfElevPatch). It is worked out once the map is still; while it moves, the last one is kept.
   The sea's depth and the top of the ice sheets come from NOAA's DEM Global Mosaic (ETOPO 2022 and finer coastal models,
   public domain, about 450 m a pixel in the open sea; its server allows the page to read it). The Terrain Tiles' sea is
   ETOPO1 (1.8 km a pixel), which drew a soft pale halo round every atoll and reef, and from zoom 11 their tiles that touch
   land have the sea at 0 m; in Antarctica and Greenland they give the rock under the ice, so there the close-up used to fall
   back on the zoomed-out picture, whose pixels at 70 degrees are 10 km and three times taller than wide (islands such as
   Peter I came out as sea, and the coast was smeared in north-south streaks). NOAA never holds up the land: if it is not
   in soon after the height tiles, the land is shown first and the sea's depth and the ice are added when it comes; if it
   cannot be reached (it is given up after 10 s), the Terrain Tiles and the picture are used as before.
   The work itself (fetching and decoding the tiles, working out each cell's height, colour and shading) is done off the
   page's main thread, in a Worker (GF_ELEV_ENGINE, below). */
(function(){
"use strict";
/* ---------- the engine: the height tiles, NOAA's grid, and the close-up's heights, colours and shading ----------
   The same code runs in a Worker, off the page's main thread, wherever the browser can (Worker, OffscreenCanvas and
   createImageBitmap in it), else on the page itself in slices of a few milliseconds. On the page it used to be the slow
   part: the globe is redrawn, and rivers and lakes come in, while the close-up is worked out, so each slice waited its
   turn (on a slow machine about half a second a slice: the sharp picture took 10 to 20 s, though the tiles were in after 1).
   It knows nothing of the page: it is given boxes of the world in latitude/longitude, a land mask (from the map's own
   land shapes, drawn on the page), the zoomed-out picture's sea and the map's colours. */
function GF_ELEV_ENGINE(G,inWorker){
"use strict";
let LANDS=[[0,"#5f9f72"],[7e3,"#ffffff"]],SEAS=[[-11e3,"#183660"],[0,"#bedaee"]],SEA=null;
const now=()=>performance.now(),wait=ms=>new Promise(r=>setTimeout(r,ms));
/* ---- the height tiles: AWS Terrain Tiles (terrarium PNGs: height = R*256 + G + B/256 - 32768) ---- */
const TURL="https://s3.amazonaws.com/elevation-tiles-prod/terrarium/",TILES=new Map();
const toH=d=>{const h=new Float32Array(65536);for(let i=0;i<65536;i++)h[i]=d[i*4]*256+d[i*4+1]+d[i*4+2]/256-32768;return h};
function tile(k){let pr=TILES.get(k);if(pr){TILES.delete(k);TILES.set(k,pr);return pr}
 /* a tile that never answers counts as failed after 12 s, so a close-up waiting for it is not held up for good */
 if(inWorker)pr=(async()=>{const ac=new AbortController(),t=setTimeout(()=>ac.abort(),12000);
   try{const r=await fetch(TURL+k+".png",{signal:ac.signal});if(!r.ok)return null;const b=await r.arrayBuffer();let h=null;try{h=await png(b)}catch(e){h=null}if(h)return h;
    const bm=await createImageBitmap(new Blob([b]),{premultiplyAlpha:"none",colorSpaceConversion:"none"}),c=new OffscreenCanvas(256,256),g=c.getContext("2d",{willReadFrequently:true});g.drawImage(bm,0,0);bm.close&&bm.close();return toH(g.getImageData(0,0,256,256).data)}
   catch(e){return null}finally{clearTimeout(t)}})();
 else pr=new Promise(res=>{const im=new Image();im.crossOrigin="anonymous";im.onload=()=>{try{const c=document.createElement("canvas");c.width=c.height=256;const g=c.getContext("2d",{willReadFrequently:true});g.drawImage(im,0,0);
   res(toH(g.getImageData(0,0,256,256).data))}catch(e){res(null)}};im.onerror=()=>res(null);
  setTimeout(()=>{if(!im.complete){im.onload=im.onerror=null;im.src="";res(null)}},12000);im.src=TURL+k+".png"});
 TILES.set(k,pr);
 /* a tile that failed (a dropped connection) is not remembered: it is asked for again next time */
 pr.then(h=>{if(!h&&TILES.get(k)===pr)TILES.delete(k)});while(TILES.size>160)TILES.delete(TILES.keys().next().value);return pr}
/* a tile's PNG read here (8-bit RGB or RGBA, 256 x 256, as the Terrain Tiles are; else null and the browser decodes it): in
   the Worker, createImageBitmap was slow while the page was busy (up to 5 s for a dozen tiles); this takes a few ms a tile */
async function png(buf){if(typeof DecompressionStream==="undefined")return null;const u=new Uint8Array(buf),dv=new DataView(buf);if(u.length<33||u[1]!==80||u[2]!==78||u[3]!==71)return null;
 let i=8,w=0,h=0,ct=0,bd=0,il=1;const parts=[];
 while(i+8<=u.length){const l=dv.getUint32(i),t=String.fromCharCode(u[i+4],u[i+5],u[i+6],u[i+7]);if(t==="IHDR"){w=dv.getUint32(i+8);h=dv.getUint32(i+12);bd=u[i+16];ct=u[i+17];il=u[i+20]}else if(t==="IDAT")parts.push(u.subarray(i+8,i+8+l));else if(t==="IEND")break;i+=12+l}
 if(w!==256||h!==256||bd!==8||il||(ct!==2&&ct!==6)||!parts.length)return null;const bpp=ct===2?3:4,st=w*bpp;
 const raw=new Uint8Array(await new Response(new Blob(parts).stream().pipeThrough(new DecompressionStream("deflate"))).arrayBuffer());if(raw.length<h*(st+1))return null;
 const out=new Float32Array(65536);let prev=new Uint8Array(st),cur=new Uint8Array(st);
 for(let y=0;y<h;y++){const f=raw[y*(st+1)],o=y*(st+1)+1;if(f>4)return null;
  for(let x=0;x<st;x++){const r=raw[o+x],a=x>=bpp?cur[x-bpp]:0,b=prev[x];let v;
   if(f===0)v=r;else if(f===1)v=r+a;else if(f===2)v=r+b;else if(f===3)v=r+((a+b)>>1);else{const c=x>=bpp?prev[x-bpp]:0,p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);v=r+(pa<=pb&&pa<=pc?a:pb<=pc?b:c)}cur[x]=v&255}
  for(let x=0;x<w;x++){const q=x*bpp;out[y*w+x]=cur[q]*256+cur[q+1]+cur[q+2]/256-32768}const t=prev;prev=cur;cur=t}
 return out}
const tileZoom=dlon=>Math.max(2,Math.min(12,Math.round(Math.log2(360/dlon/256))));
const merc=(lo,la,z)=>{const n=2**z,s=Math.sin(Math.max(-85,Math.min(85,la))*Math.PI/180);return[(((lo+180)/360)%1+1)%1*n*256,(.5-Math.log((1+s)/(1-s))/(4*Math.PI))*n*256]};
function tileSpan(v,z){const a=merc(v.lon0,v.lat1,z),b=merc(v.lon1,v.lat0,z),r={z,tx0:Math.floor(a[0]/256),ty0:Math.floor(a[1]/256),tx1:Math.floor(b[0]/256),ty1:Math.floor(b[1]/256)};if(r.tx1<r.tx0)r.tx1+=2**z;return r}
const count=R=>(R.tx1-R.tx0+1)*(R.ty1-R.ty0+1);
const keysOf=R=>{const n=2**R.z,ks=[];for(let ty=R.ty0;ty<=R.ty1;ty++)for(let tx=R.tx0;tx<=R.tx1;tx++)ks.push([tx,ty,R.z+"/"+(((tx%n)+n)%n)+"/"+Math.max(0,Math.min(n-1,ty))]);return ks};
/* the tiles for cells dlon degrees wide: about one tile pixel a cell, a zoom coarser while there would be more than maxT
   of them, or more than maxT+16 counting the zoom-10 ones for the sea (below) */
function spans(v,dlon,maxT){let z=tileZoom(dlon),A;for(;;){A=tileSpan(v,z);if(count(A)<=maxT&&count(A)+(z>10?count(tileSpan(v,10)):0)<=maxT+16||z<=2)break;z--}
 /* from zoom 11 the tiles that touch land have the sea at 0 m: the sea's depth (and the rock under ice shelves) is read at zoom 10 */
 return{z,A,S:z>10?tileSpan(v,10):A}}
/* ---- NOAA DEM Global Mosaic for a box: float32 heights, a row a latitude (north first), split at the date line ----
   Asked for once a view (the quick first look uses the sharp one's grid) and remembered: the last few boxes, and a box that
   failed for a minute, so a close-up made again does not ask again. Given up after 10 s. */
const NOAA="https://gis.ngdc.noaa.gov/arcgis/rest/services/DEM_mosaics/DEM_global_mosaic/ImageServer/exportImage",NQ=new Map();
async function noaaPart(lo0,lo1,la0,la1,w,h){const ac=new AbortController(),t=setTimeout(()=>ac.abort(),10000);
 try{const r=await fetch(NOAA+"?bbox="+[lo0,la0,lo1,la1].map(x=>x.toFixed(5)).join(",")+"&bboxSR=4326&imageSR=4326&size="+w+","+h+"&format=bsq&pixelType=F32&interpolation=RSP_BilinearInterpolation&f=image",{signal:ac.signal});
  if(!r.ok)return null;const b=await r.arrayBuffer();if(b.byteLength<w*h*4)return null;const f=new Float32Array(b.slice(0,w*h*4)),m=b.byteLength>=w*h*4+Math.ceil(w*h/8)?new Uint8Array(b,w*h*4):null;
  /* after the heights, one bit a pixel (most significant first): 0 where there is no data */
  if(m)for(let i=0;i<w*h;i++)if(!(m[i>>3]&(128>>(i&7))))f[i]=NaN;return f}catch(e){return null}finally{clearTimeout(t)}}
async function noaa0(lon0,lon1,la0,la1,w,h){let s=((lon0+180)%360+360)%360-180;const e=s+(lon1-lon0);
 if(e<=180){const f=await noaaPart(s,e,la0,la1,w,h);return f&&{f,w,h,lon0:s,dl:(e-s)/w,la1,dla:(la1-la0)/h}}
 const wa=Math.max(2,Math.round(w*(180-s)/(e-s))),wb=Math.max(2,w-wa),[A,B]=await Promise.all([noaaPart(s,180,la0,la1,wa,h),noaaPart(-180,e-360,la0,la1,wb,h)]);if(!A||!B)return null;
 const W=wa+wb,f=new Float32Array(W*h);for(let j=0;j<h;j++){f.set(A.subarray(j*wa,(j+1)*wa),j*W);f.set(B.subarray(j*wb,(j+1)*wb),j*W+wa)}
 return{f,w:W,h,lon0:s,dl:(e-s)/W,la1,dla:(la1-la0)/h}}
function noaa(v,w,h){const k=[v.lon0,v.lon1,v.lat0,v.lat1].map(x=>x.toFixed(4)).join(",")+"|"+w+"x"+h;let e=NQ.get(k);
 if(e&&e.st==="fail"&&now()-e.at>60000){NQ.delete(k);e=null}
 if(!e){e={st:"wait",at:now()};e.p=noaa0(v.lon0,v.lon1,v.lat0,v.lat1,w,h).then(N=>{e.st=N?"ok":"fail";e.at=now();return N});NQ.set(k,e);
  /* the grids are large (up to about 10 MB): a few are kept */
  for(const [kk,x] of NQ){if(NQ.size<=3)break;if(x!==e)NQ.delete(kk)}}
 return e}
/* bilinear height from such a grid; NaN outside it or where it has no data */
function noaaAt(N,lo,la){if(!N)return NaN;const x=((((lo-N.lon0)%360)+360)%360)/N.dl-.5,y=(N.la1-la)/N.dla-.5;if(x<-.5||y<-.5||x>N.w-.5||y>N.h-.5)return NaN;
 const x0=Math.max(0,Math.min(N.w-1,Math.floor(x))),y0=Math.max(0,Math.min(N.h-1,Math.floor(y))),x1=Math.min(N.w-1,x0+1),y1=Math.min(N.h-1,y0+1),fx=Math.max(0,Math.min(1,x-x0)),fy=Math.max(0,Math.min(1,y-y0)),F=N.f;
 return(F[y0*N.w+x0]*(1-fx)+F[y0*N.w+x1]*fx)*(1-fy)+(F[y1*N.w+x0]*(1-fx)+F[y1*N.w+x1]*fx)*fy}
/* where the heights are the rock under an ice sheet (Antarctica, Greenland), not the ice: the picture is left as it is */
const iceZone=(lo,la)=>la<-60||la>84||(lo>-75&&lo<-10&&la>59&&!(lo>-25&&lo<-13&&la>63&&la<67.5));
const hex=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));
/* the zoomed-out picture's sea (2048 x 1024, 1 where blue), for telling sea from land where the map's shapes do not */
const seaPic0=(lo,la)=>{if(!SEA)return false;const x=Math.max(0,Math.min(2047,Math.floor((((lo+180)%360+360)%360)/360*2048))),y=Math.max(0,Math.min(1023,Math.floor((90-la)/180*1024)));return SEA[y*2048+x]===1};
/* the heights of a box of the world (v: lon0..lon1 west to east, lat0 south .. lat1 north) on an nx by ny grid of plain
   latitude/longitude cells, coloured and shaded: {out (RGBA), H, LND}, or null where too little is known. A generator:
   it yields now and then, so it can be worked out in slices. T: the tiles (spans, with their heights), N: NOAA's grid or
   null, fineN: whether that grid is fine, MK: the land mask or null, fade: fade the edges out (for the globe) */
function* colour(v,nx,ny,T,N,fineN,MK,fade){const dlon=(v.lon1-v.lon0)/nx,dlat=(v.lat1-v.lat0)/ny,{A,S,z}=T,midLat=(v.lat0+v.lat1)/2;
 const at=(R,lo,la)=>{if(la>85||la<-85)return NaN;const n=2**R.z;let [px,py]=merc(lo,la,R.z);let tx=Math.floor(px/256);if(tx<R.tx0)tx+=n,px+=n*256;const ty=Math.floor(py/256),T=R.TM.get(tx+","+ty);if(!T)return NaN;
   const x=Math.min(255,Math.max(0,px-tx*256-.5)),y=Math.min(255,Math.max(0,py-ty*256-.5)),x0=Math.floor(x),y0=Math.floor(y),x1=Math.min(255,x0+1),y1=Math.min(255,y0+1),fx=x-x0,fy=y-y0;
   return(T[y0*256+x0]*(1-fx)+T[y0*256+x1]*fx)*(1-fy)+(T[y1*256+x0]*(1-fx)+T[y1*256+x1]*fx)*fy};
 /* land below sea level (round the Caspian, the Dead Sea, the Netherlands) is told from sea by the map's own land shapes drawn
    for this view, not by the zoomed-out picture, whose 20 km pixels made it in blocky steps */
 const seaPic=(lo,la)=>{if(MK){const i=Math.floor((lo-v.lon0)/dlon),j=Math.floor((v.lat1-la)/dlat);if(i>=0&&j>=0&&i<nx&&j<ny)return!MK[j*nx+i]}return seaPic0(lo,la)};
 /* each cell: its height (land) or depth (sea), and whether it is land; NaN (left to the picture) where nothing is known */
 const H=new Float32Array(nx*ny),LND=new Uint8Array(nx*ny);let ok=0;
 for(let j=0;j<ny;j++){yield;const la=v.lat1-(j+.5)*dlat;for(let i=0;i<nx;i++){const lo=v.lon0+(i+.5)*dlon,k=j*nx+i,hL=at(A,lo,la),hS=S===A?hL:at(S,lo,la),nh=noaaAt(N,lo,la);
   if(!isFinite(hL)){/* beyond the tiles (within 5 degrees of the poles): the top of the ice from NOAA, if it is known */
    if((la>85||la<-85)&&isFinite(nh)){H[k]=nh;LND[k]=nh>0?1:0;ok++}else H[k]=NaN;continue}ok++;let land,h;
   if(iceZone(lo,la)){
    /* ice sheets: the Terrain Tiles give the rock under the ice, NOAA the top of the ice. Ice that floats (an ice shelf: the rock
       deeper than about 8 times the ice's height above the sea) is sea, as on the zoomed-out picture. Rock above the sea in the
       Terrain Tiles is land too: NOAA's grid is coarse in places (it draws Peter I squat, 8 km north to south instead of 19) */
    if(!isFinite(nh)){if(hL<0&&seaPic(lo,la)){land=false;h=hL}else{H[k]=NaN;continue}}
    else if((nh>0&&!(isFinite(hS)&&hS<0&&hS<-8*nh))||hL>.5){land=true;h=Math.max(nh,hL)}
    else{land=false;h=nh<0?nh:isFinite(hS)&&hS<0?hS:-1}}
   else{
    /* land below sea level (round the Caspian) is land where the picture shows land; an atoll's lagoon, which the zoom-10 tiles
       give at about 0 m (or as made-up hills up to about 100 m), is sea where NOAA gives it a few metres deep */
    if(z>10)land=hL>.5||(hL<-.5&&!seaPic(lo,la));else land=hL>=0?!(fineN&&hL<120&&nh<-3):!seaPic(lo,la);
    h=land?hL:nh<0?nh:isFinite(hS)&&hS<0?hS:-1;
    /* the Terrain Tiles have holes round the date line in Fiji: Taveuni's eastern half comes as sea 1,500 m deep from zoom
       10, its western half as sea at every zoom (0 m from zoom 11), and from zoom 11 parts of Vanua Levu at 0 m. It came out
       as flat green land, or as sea, with a straight seam at 180 degrees. Where they give deep sea, or no land where the
       map's own land shapes have it, and NOAA's fine grid gives land, NOAA's height is used */
    if(fineN&&nh>2&&(hL<-50||!land&&!seaPic(lo,la))){land=true;h=nh}
    /* and some tiles there have smooth made-up hills of a few hundred metres over the reefs, ending in a straight line at the
       tile's edge: where NOAA's fine grid gives sea and so do the map's own land shapes, it is sea */
    else if(land&&fineN&&nh<-3&&hL<600&&seaPic(lo,la)){land=false;h=nh}}
   H[k]=h;LND[k]=land?1:0}}
 if(ok<nx*ny*.5)return null;
 /* the Elevation map's own colours for each height (its legend's stops, the same as the zoomed-out picture: tools/build-elev.py) */
 const LS=LANDS.map(s=>[s[0],hex(s[1])]),SS=SEAS.map(s=>[s[0],hex(s[1])]);
 const stops=(S,h)=>{let i=1;while(i<S.length-1&&S[i][0]<h)i++;const a=S[i-1],b=S[i],t=Math.max(0,Math.min(1,(h-a[0])/(b[0]-a[0]))),A=a[1],B=b[1];return[A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t,A[2]+(B[2]-A[2])*t]};
 /* shading: light from the north-west, about as strong as the picture's; the slope from the cell's neighbours of its own kind
    (land or sea), so the drop from the shore to the sea floor does not draw a dark or bright rim along the coast. Slopes
    look gentler on coarser cells, so the land's relief is raised more on them: 1.6 times on cells of 1 km or less, up to
    the picture's 6 times on its own 10 km cells, so the close-up's first step looks like the picture, only sharper */
 const mx=dlon*111320*Math.cos(midLat*Math.PI/180),my=dlat*110540,L=[-.5,.5,.707],exL=Math.min(6,1.6*Math.pow(Math.max(1,my/1000),.574));
 const out=new Uint8ClampedArray(nx*ny*4);
 const nb=(k,k2)=>isFinite(H[k2])&&LND[k2]===LND[k]?H[k2]:H[k];
 for(let j=0;j<ny;j++){yield;for(let i=0;i<nx;i++){const k=j*nx+i,h=H[k];if(!isFinite(h))continue;const land=LND[k]===1;
  const hx=(nb(k,j*nx+Math.min(nx-1,i+1))-nb(k,j*nx+Math.max(0,i-1)))/(2*mx),hy=(nb(k,Math.max(0,j-1)*nx+i)-nb(k,Math.min(ny-1,j+1)*nx+i))/(2*my);
  const ex=land?exL:1.1,nl=Math.hypot(hx*ex,hy*ex,1),dot=(-hx*ex*L[0]-hy*ex*L[1]+L[2])/nl,sh=Math.max(.55,Math.min(1.35,1+(land?1.1:.8)*(dot-L[2])));
  const c=land?stops(LS,Math.max(0,h)):stops(SS,Math.min(0,h));out[k*4]=c[0]*sh;out[k*4+1]=c[1]*sh;out[k*4+2]=c[2]*sh;out[k*4+3]=fade?Math.round(255*Math.min(1,Math.min(i,nx-1-i)/(nx*.04),Math.min(j,ny-1-j)/(ny*.04))):255}}
 return{out,H,LND}}
/* a generator run in slices of ms milliseconds, with a pause between them; null if given up (dead()) */
async function drive(gen,ms,dead){for(;;){const t=now();let x;do{x=gen.next()}while(!x.done&&now()-t<ms);if(x.done)return x.value;await wait(0);if(dead())return null}}
/* a close-up: J = {v, nx, ny, maxT, fade, nq: NOAA's grid size [w,h] (or null: about a cell a pixel), two: draw the land
   first if NOAA is late and again once it comes (else once, with NOAA if it came in time), grace: how long to wait for
   NOAA once the tiles are in (ms)}; mask(): a promise of the land mask; emit(R, final) with R = {out,H,LND,z,noaa,miss,
   late (NOAA was not in yet), t: timings} or null (failed), or {same:true} (final, nothing new); dead(): given up */
async function run(J,mask,emit,dead){const t0=now(),tm={};const v=J.v,nx=J.nx,ny=J.ny,T=spans(v,(v.lon1-v.lon0)/nx,J.maxT||36);let miss=0;
 const load=async R=>{const ks=keysOf(R),hs=await Promise.all(ks.map(k=>tile(k[2])));R.TM=new Map();ks.forEach((k,i)=>{if(!hs[i])miss++;R.TM.set(k[0]+","+k[1],hs[i])});return R};
 /* NOAA's grid: about a cell a pixel, no finer than its own 15 arc-seconds in the open sea */
 const nq=J.nq||[nx,ny],NW=Math.max(8,Math.min(nq[0],Math.ceil((v.lon1-v.lon0)*240))),NH=Math.max(8,Math.min(nq[1],Math.ceil((v.lat1-v.lat0)*240)));
 /* NOAA's grid is read at its own fine size only close in; zoomed out it comes in coarse blocks, and low land along the coast
    (the Arctic coast of Russia) came out as sea in a band of steps. So only close in may it make low land into sea (an atoll's lagoon) */
 const fineN=(v.lon1-v.lon0)/NW<.02,NE=noaa(v,NW,NH);
 await Promise.all([load(T.A),T.S===T.A?null:load(T.S)]);tm.tiles=Math.round(now()-t0);if(dead())return;
 const MK=await mask();tm.mask=Math.round(now()-t0);if(dead())return;
 const once=async N=>{const t=now(),R=await drive(colour(v,nx,ny,T,N,fineN,MK,J.fade),inWorker?50:12,dead);tm.colour=Math.round(now()-t);tm.done=Math.round(now()-t0);
  return R&&Object.assign(R,{z:T.z,noaa:!!N,miss,t:Object.assign({},tm)})};
 let N=NE.st==="ok"?await NE.p:null;
 if(NE.st==="wait"&&J.grace>0)N=await Promise.race([NE.p,wait(J.grace).then(()=>null)]);
 if(dead())return;
 const late=NE.st==="wait";
 const R=await once(N);if(dead())return;if(!R){emit(null,true);return}
 R.late=late;emit(R,!(late&&J.two));if(!(late&&J.two))return;
 /* NOAA came late: the sea's depth and the ice are added once it is in (or the land alone stays, if it fails) */
 N=await NE.p;tm.noaa=Math.round(now()-t0);if(dead())return;
 if(!N){emit({same:true,t:Object.assign({},tm)},true);return}
 const R2=await once(N);if(dead())return;if(R2)R2.late=false;emit(R2||{same:true},true)}
/* fetch (only) the tiles of a box ahead of time: need cells a degree, at most max tiles */
function prefetch(v,need,maxT,max){const T=spans(v,1/need,maxT),list=[T.A];if(T.S!==T.A)list.push(T.S);if(list.reduce((s,R)=>s+count(R),0)>max)return;list.forEach(R=>keysOf(R).forEach(k=>tile(k[2])))}
function setup(o){if(o.LANDS)LANDS=o.LANDS;if(o.SEAS)SEAS=o.SEAS;if(o.SEA)SEA=o.SEA}
const api={run,prefetch,setup,tile,state:()=>({tiles:TILES.size,noaa:NQ.size})};
if(!inWorker)return api;
/* in the Worker: the page's messages */
const JOBS=new Map();
G.onmessage=e=>{const m=e.data;try{
 if(m.t==="init"){let ok=false;try{ok=typeof OffscreenCanvas!=="undefined"&&typeof createImageBitmap!=="undefined"&&!!new OffscreenCanvas(4,4).getContext("2d")}catch(x){}G.postMessage({t:"ready",ok});return}
 if(m.t==="setup"){setup(m);return}
 if(m.t==="prefetch"){prefetch(m.v,m.need,m.maxT,m.max);return}
 if(m.t==="cancel"){const j=JOBS.get(m.id);if(j){j.dead=true;JOBS.delete(m.id);if(j.mres)j.mres(null)}return}
 if(m.t==="mask"){const j=JOBS.get(m.id);if(j){j.MK=m.MK;if(j.mres)j.mres(m.MK);j.got=true}return}
 if(m.t==="job"){const j={dead:false,got:false,MK:null,mres:null};JOBS.set(m.id,j);
  const mask=()=>j.got?Promise.resolve(j.MK):new Promise(r=>{j.mres=r});
  run(m.J,mask,(R,final)=>{if(j.dead)return;const tr=R&&R.out?[R.out.buffer,R.H.buffer,R.LND.buffer]:[];G.postMessage({t:"res",id:m.id,R,final},tr);if(final)JOBS.delete(m.id)},()=>j.dead)
   .catch(x=>{if(!j.dead)G.postMessage({t:"res",id:m.id,R:null,final:true});JOBS.delete(m.id)})}}
 catch(x){}};
}
const LANDS=typeof ELEV_LAND_STOPS!=="undefined"?ELEV_LAND_STOPS:[[0,"#5f9f72"],[7e3,"#ffffff"]],SEAS=typeof ELEV_SEA_STOPS!=="undefined"?ELEV_SEA_STOPS:[[-11e3,"#183660"],[0,"#bedaee"]];
/* ---------- where the engine runs: a Worker if it can, else this page ---------- */
let W=null,WOK=null,MAIN=null,JID=0,PIC=null;const WJ=new Map();
function mainEng(){if(!MAIN)MAIN=GF_ELEV_ENGINE(window,false);MAIN.setup({LANDS,SEAS,SEA:PIC?PIC.SEA:null});return MAIN}
function wDead(){try{W&&W.terminate()}catch(e){}W=null;WOK=Promise.resolve(false)}
function worker(){if(WOK)return WOK;WOK=new Promise(res=>{try{if(typeof Worker==="undefined"||typeof OffscreenCanvas==="undefined"||typeof Blob==="undefined"){res(false);return}
  const u=URL.createObjectURL(new Blob(["("+GF_ELEV_ENGINE.toString()+")(self,true)"],{type:"text/javascript"}));W=new Worker(u);
  const to=setTimeout(()=>{wDead();res(false)},5000);
  W.onmessage=e=>{const m=e.data;if(m.t==="ready"){clearTimeout(to);try{URL.revokeObjectURL(u)}catch(x){}if(!m.ok){wDead();res(false);return}W.postMessage({t:"setup",LANDS,SEAS});res(true);return}
   if(m.t==="res"){const j=WJ.get(m.id);if(!j)return;if(m.final)WJ.delete(m.id);j.emit(m.R,m.final)}};
  /* if the Worker fails, the close-ups under way are made again on the page, and so are the next ones */
  W.onerror=()=>{clearTimeout(to);wDead();res(false);[...WJ].forEach(([id,j])=>{WJ.delete(id);j.redo()})};
  W.postMessage({t:"init"})}catch(e){wDead();res(false)}});return WOK}
/* a close-up worked out by the engine (see run in the engine); mk(): the land mask, drawn on the page. Returns {cancel()} */
function run(J,mk,emit){const h={dead:false,id:0,cancel(){if(h.dead)return;h.dead=true;WJ.delete(h.id);try{if(h.id&&W)W.postMessage({t:"cancel",id:h.id})}catch(e){}}};
 const onMain=()=>{if(h.dead)return;let MK;mainEng().run(J,()=>{if(MK===undefined)try{MK=mk()}catch(e){MK=null}return Promise.resolve(MK)},(R,f)=>{if(!h.dead)emit(R,f)},()=>h.dead).catch(e=>{console.error(e);if(!h.dead)emit(null,true)})};
 worker().then(ok=>{if(h.dead)return;if(!ok||!W){onMain();return}
  const id=h.id=++JID;WJ.set(id,{emit:(R,f)=>{if(!h.dead)emit(R,f)},redo:onMain});
  if(W._gfSea!==PIC){W._gfSea=PIC;W.postMessage({t:"setup",SEA:PIC?PIC.SEA:null})}
  W.postMessage({t:"job",id,J});
  /* the land mask is drawn here while the Worker fetches the tiles */
  let MK=null;try{MK=mk()}catch(e){MK=null}if(h.dead||!W)return;W.postMessage({t:"mask",id,MK},MK?[MK.buffer]:[])});
 return h}
/* the zoomed-out picture (2048 x 1024), kept only as where it is sea (blue) */
function picOf(key){try{const im=globeImages(key,()=>{});if(!im||!im.length)return null;const a=im[0];if(PIC&&PIC.a===a)return PIC;const c=document.createElement("canvas");c.width=2048;c.height=1024;const x=c.getContext("2d",{willReadFrequently:true});
 if(im.length===2){x.drawImage(im[0],0,0,1024,1024);x.drawImage(im[1],1024,0,1024,1024)}else x.drawImage(a,0,0,2048,1024);const d=x.getImageData(0,0,2048,1024).data,SEA=new Uint8Array(2048*1024);c.width=0;
 for(let i=0;i<SEA.length;i++)SEA[i]=d[i*4+2]>d[i*4]+25?1:0;PIC={a,SEA};if(MAIN)MAIN.setup({SEA});return PIC}catch(e){return null}}
function viewBox(gv){const pr=gv.projection(),{w,h}=gv.size(),c=[-gv.rot[0],-gv.rot[1]];let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9,n=0;
 for(let i=0;i<=24;i++)for(let j=0;j<=24;j++){const q=pr.invert&&pr.invert([w*i/24,h*j/24]);if(!q||!isFinite(q[0])||d3.geoDistance(q,c)>Math.PI/2)continue;const dl=((q[0]-c[0]+540)%360)-180;x0=Math.min(x0,dl);x1=Math.max(x1,dl);y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1]);n++}
 /* a margin round the view, so the edges of the close-up (faded, below) fall outside it rather than across the map */
 const px=(x1-x0)*.05,py=(y1-y0)*.05;x0-=px;x1+=px;y0-=py;y1+=py;
 if(n<30||y1>84||y0<-84||x1-x0>150)return null;return{lon0:c[0]+x0,lon1:c[0]+x1,lat0:y0,lat1:y1,w,h}}
/* the grid for a view: stage 1 about a device pixel a cell (sharp on a Retina screen too), at most 2048 a side and 2.6
   million cells; stage 0, the quick first look, half that on each side */
const dprNow=()=>{try{return window.gfDpr?gfDpr():Math.min(2,devicePixelRatio||1)}catch(e){return 1}};
function gridFor(v,stage){const f=dprNow()*(stage?1:.5);let nx=Math.max(64,Math.round(v.w*f)),ny=Math.max(64,Math.round(v.h*f));const k=Math.min(1,2048/nx,2048/ny,Math.sqrt(2.6e6/(nx*ny)));
 return[Math.max(64,Math.round(nx*k)),Math.max(64,Math.round(ny*k))]}
/* whether a land shape may reach into a box (its bounds, worked out once); the others are not drawn into the land mask */
const FB=new WeakMap();
function near(f,v){let b=FB.get(f);if(!b){try{b=d3.geoBounds(f)}catch(e){b=null}FB.set(f,b||0)}if(!b||!isFinite(b[0][0]))return true;
 if(b[1][1]<v.lat0||b[0][1]>v.lat1)return false;if(b[0][0]>b[1][0]||v.lon1-v.lon0>=360)return true;/* across the date line */
 const c=(v.lon0+v.lon1)/2,h=(v.lon1-v.lon0)/2,fc=(b[0][0]+b[1][0])/2,fh=(b[1][0]-b[0][0])/2,d=Math.abs((((fc-c)%360)+540)%360-180);return d<=h+fh+.5}
/* the map's own land shapes for a box, as a mask of its nx by ny cells (1 land), or null */
function maskFor(gv,v,nx,ny){try{const F=gv&&gv.features;if(!F||!F.length)return null;const dlon=(v.lon1-v.lon0)/nx,dlat=(v.lat1-v.lat0)/ny,cv=document.createElement("canvas");cv.width=nx;cv.height=ny;const x=cv.getContext("2d",{willReadFrequently:true}),c0=(v.lon0+v.lon1)/2;
  const pr=d3.geoEquirectangular().rotate([-c0,0]).scale(180/Math.PI).translate([0,0]).precision(.1);x.setTransform(1/dlon,0,0,1/dlat,-(v.lon0-c0)/dlon,v.lat1/dlat);x.beginPath();const pa=d3.geoPath(pr,x);F.forEach(f=>{if(f.geometry&&near(f,v))pa(f)});x.fillStyle="#fff";x.fill();
  const d=x.getImageData(0,0,nx,ny).data,MK=new Uint8Array(nx*ny);for(let i=0;i<nx*ny;i++)MK[i]=d[i*4+3]>127?1:0;cv.width=0;return MK}catch(e){return null}}
/* ---------- the globe's close-up ---------- */
/* the wait before a view's close-up is started counts from the last change of view, not from the last frame: other layers
   (rivers and lakes coming in) redraw the globe every few tenths of a second, and each redraw used to start the wait
   again, so the close-up did not start until they were all in (5 s and more) */
let P=null,job=null,timer=0,tk="",lastShown=0,ring="";
/* the loading ring (geoflock-busy.js) turns from the first step of a view until its sharp close-up is shown, with the sea's
   depth from NOAA or without it once NOAA has failed or given up; a view's steps count as one load, of at most 30 s */
function ringOn(tok){if(ring===tok)return;ring=tok;try{window.gfSharpBusy&&gfSharpBusy.start("elev-globe",tok,30000)}catch(e){}}
function ringOff(){if(!ring)return;ring="";try{window.gfSharpBusy&&gfSharpBusy.done("elev-globe")}catch(e){}}
function stopJob(){if(job){job.hs.forEach(h=>h.cancel());job=null}ringOff()}
/* a view whose close-up could not be made (the height tiles failed, or the view is too wide for them) is tried again only
   after a pause, longer each time (1.5 s, 3 s, 6 s ... at most 30 s): before, it was tried again every quarter second,
   asking for the same failed tiles over and over while the height server could not be reached */
let FAIL={k:"",n:0,until:0};
function failed(gv,want){if(gv._moving||sig(gv,want.split("|")[0])!==want)return;const n=FAIL.k===want?FAIL.n+1:0,d=Math.min(30000,1500*2**n);
 FAIL={k:want,n,until:performance.now()+d};setTimeout(()=>req(gv),d+60)}
/* for checking: the steps' timings (ms from the start of the view's work) */
let TL=null;
/* the close-up of the view: the quick first look (stage 0, if st is 0) and the sharp one (stage 1) are both asked for at
   once, so the sharp one does not wait for the page to show the quick one first (on a busy page that took a second or
   more); the quick one is left out if the sharp one is in first */
function build(gv,key,st){const want=sig(gv,key),v=viewBox(gv);if(!v){stopJob();failed(gv,want);return}const PI=picOf(key);if(!PI)return;
 stopJob();const me=job={want,hs:[],got:-1},t0=performance.now();ringOn(want);if(!TL||TL.k!==want)TL={k:want,t0,ev:[]};const tl=TL;
 /* at most 36 tiles, 80 on a sharp (Retina) screen: with 36, the four times as many cells got tiles a zoom coarser than the
    cells, and zoomed right in the close-up stopped getting sharper (the Alps stayed at zoom 10, 2.5 cells a tile pixel).
    NOAA's grid is asked for once a view, at the sharp step's size: the quick first look uses it only if it is already in.
    The sharp step waits for it at most 0.8 s after the tiles: if it is later, the land is shown at once and the sea's depth
    and the ice are added when it comes */
 const one=stage=>{const [nx,ny]=gridFor(v,stage),dlon=(v.lon1-v.lon0)/nx,dlat=(v.lat1-v.lat0)/ny;
  me.hs.push(run({v,nx,ny,maxT:dprNow()>1.5?80:36,fade:true,nq:gridFor(v,1),two:stage>=1,grace:stage?800:0},()=>maskFor(gv,v,nx,ny),(R,final)=>{
   if(job!==me)return;
   if(R&&R.t)tl.ev.push({stage,final,late:!!R.late,noaa:!!R.noaa,same:!!R.same,at:Math.round(performance.now()-tl.t0),t:R.t});
   if(!R){if(stage>=1){stopJob();failed(gv,want);req(gv)}return}
   if(stage<me.got)return;FAIL.k="";
   const here=sig(gv,key)===want||P&&P.src===want&&P.key===sig(gv,key);if(!here){stopJob();req(gv);return}
   if(R.out){const G=gv.gl&&gv.gl.gl;if(G){const t=P&&P.gl===G?P.tex:G.createTexture();G.activeTexture(G.TEXTURE6);G.bindTexture(G.TEXTURE_2D,t);G.pixelStorei(G.UNPACK_FLIP_Y_WEBGL,false);
    G.texImage2D(G.TEXTURE_2D,0,G.RGBA,nx,ny,0,G.RGBA,G.UNSIGNED_BYTE,new Uint8Array(R.out.buffer));[G.TEXTURE_MIN_FILTER,G.TEXTURE_MAG_FILTER].forEach(p=>G.texParameteri(G.TEXTURE_2D,p,G.LINEAR));
    G.texParameteri(G.TEXTURE_2D,G.TEXTURE_WRAP_S,G.CLAMP_TO_EDGE);G.texParameteri(G.TEXTURE_2D,G.TEXTURE_WRAP_T,G.CLAMP_TO_EDGE);G.activeTexture(G.TEXTURE0);
    const now=performance.now();me.got=stage;
    /* fades in only when no close-up was showing; the sharper stage replaces the quick one in one swap */
    P={gl:G,tex:t,bb:[v.lon0,v.lat1,nx*dlon,ny*dlat],key:sig(gv,key),src:want,stage,cell:dlon,H:R.H,nx,ny,z:R.z,noaa:!!R.noaa,late:!!R.late&&!final,t0:lastShown?(P?P.t0:-1e9):now}}}
   else if(final&&P&&P.src===want)P.late=false;
   if(stage>=1&&final)stopJob();req(gv)}))};
 if(st===0)one(0);one(1)}
function blur(H,nx,ny,r){const T=new Float32Array(nx*ny),O=new Float32Array(nx*ny);
 for(let j=0;j<ny;j++){let s=0,c=0;for(let i=-r;i<nx+r;i++){const a=i+r,b=i-r-1;if(a>=0&&a<nx&&isFinite(H[j*nx+a])){s+=H[j*nx+a];c++}if(b>=0&&b<nx&&isFinite(H[j*nx+b])){s-=H[j*nx+b];c--}if(i>=0&&i<nx)T[j*nx+i]=c?s/c:NaN}}
 for(let i=0;i<nx;i++){let s=0,c=0;for(let j=-r;j<ny+r;j++){const a=j+r,b=j-r-1;if(a>=0&&a<ny&&isFinite(T[a*nx+i])){s+=T[a*nx+i];c++}if(b>=0&&b<ny&&isFinite(T[b*nx+i])){s-=T[b*nx+i];c--}if(j>=0&&j<ny)O[j*nx+i]=c?s/c:NaN}}return O}
const sig=(gv,key)=>[key,gv.rot[0].toFixed(3),gv.rot[1].toFixed(3),gv.zoom.toFixed(3)].join("|");
/* the height under the pointer, from the same tiles (zoom 10, about 150 m a pixel); null until that tile has loaded */
const HV=new Map();
window.gfElevHeight=function(ll){if(iceZone(ll[0],ll[1])){/* on the ice sheets, the top of the ice from the last close-up worked out (NOAA), if it covers the point */
  if(!P||!P.noaa)return null;const i=Math.floor((((ll[0]-P.bb[0])%360+360)%360)/P.bb[2]*P.nx),j=Math.floor((P.bb[1]-ll[1])/P.bb[3]*P.ny);if(i<0||j<0||i>=P.nx||j>=P.ny)return null;const h=P.H[j*P.nx+i];return isFinite(h)?Math.round(h):null}const z=10,n=2**z,la=Math.max(-85,Math.min(85,ll[1]))*Math.PI/180,px=(((ll[0]+180)/360)%1+1)%1*n*256,py=(1-Math.log(Math.tan(la)+1/Math.cos(la))/Math.PI)/2*n*256,tx=Math.floor(px/256),ty=Math.floor(py/256),k=z+"/"+tx+"/"+ty;
 if(!HV.has(k)){HV.set(k,null);mainEng().tile(k).then(h=>{HV.set(k,h);while(HV.size>40)HV.delete(HV.keys().next().value)})}const T=HV.get(k);if(!T)return null;return T[Math.min(255,Math.floor(py-ty*256))*256+Math.min(255,Math.floor(px-tx*256))]};
const iceZone=(lo,la)=>la<-60||la>84||(lo>-75&&lo<-10&&la>59&&!(lo>-25&&lo<-13&&la>63&&la<67.5));
/* In steps, not a slow blur-to-sharp: once the picture (about 11.4 pixels a degree) is magnified, the close-up for the view
   comes in with a quick fade, first a quick half-sharp one (stage 0), then in one swap one about a device pixel a cell
   (stage 1). After the view moves, the quick one is only made again if the last close-up does not cover the new view or
   is coarser than it would be; otherwise the sharp one is made straight away and swapped in. A view moved or zoomed only
   a little (the last sharp close-up still covers it, out of its faded edge, at about the same detail) keeps it. */
const ON=11.4*1.05,FADE=260;
/* whether a close-up of the view would be finer than the picture: its cells (a device pixel each, at most 2048 across)
   at least ON a degree. Zoomed in a little on a wide view (far from the equator the view spans many more longitudes)
   they were not: at 46 degrees north the first close-up had about 6 cells a degree, so it was blurrier than the
   picture it replaced (and on the Alps none came at all until zoomed in further). Then the picture is kept, and the
   quick half-size look (stage 0) is made only when it too is finer than the picture. Worked out once a view. */
const fineFor=(v,stage)=>{if(!v)return false;const g=gridFor(v,stage);return g[0]/(v.lon1-v.lon0)>=ON&&g[1]/(v.lat1-v.lat0)>=ON};
let FQ={k:"",ok:false};
function fine(gv,k){if(FQ.k!==k)FQ={k,ok:fineFor(viewBox(gv),1)};return FQ.ok}
/* whether the last close-up covers what is on screen (the view box without the margin viewBox adds); inner: and out of
   most of the close-up's faded edge (at least 7/8 opaque at the screen's edge) */
function covers(v,inner){if(!P||!v)return false;const mx=(v.lon1-v.lon0)/22,my=(v.lat1-v.lat0)/22,ex=inner?P.bb[2]*.035:0,ey=inner?P.bb[3]*.035:0,l=((v.lon0+mx-P.bb[0]-ex)%360+360)%360;
 return l+(v.lon1-v.lon0-2*mx)<=P.bb[2]-2*ex+1e-6&&v.lat1-my<=P.bb[1]-ey+1e-6&&v.lat0+my>=P.bb[1]-P.bb[3]+ey-1e-6}
const reuse=v=>{if(!P||P.stage<1||P.late&&!job||!v)return false;const c1=(v.lon1-v.lon0)/gridFor(v,1)[0];return P.cell<=c1*1.04&&P.cell>=c1/1.04&&covers(v,true)};
const req=gv=>{try{gv.request?gv.request():gv.render()}catch(e){}};
const patch=function(G,o){const gv=o&&o.gv;if(!gv||gv._flat||o.key!=="elevation"){if(job||ring)stopJob();return null}const ppd=o.s*Math.PI/180;if(ppd<ON){if(job||ring)stopJob();return null}
 if(P&&P.gl!==G.gl)P=null;const k=sig(gv,o.key);
 if(!fine(gv,k)){if(job||ring)stopJob();return null}
 /* moving: what is being worked out is for a view that is gone */
 if(gv._moving&&(job||ring))stopJob();
 /* nothing left to do for this view: the ring stops (it can be left on when a step was not needed after all) */
 if(ring&&!job&&P&&P.key===k&&P.stage>=1&&!P.late)ringOff();
 if((!P||P.key!==k||P.stage<1)&&!(job&&job.want===k)&&!(FAIL.k===k&&performance.now()<FAIL.until)&&!(timer&&tk===k)){clearTimeout(timer);tk=k;timer=setTimeout(function go(){timer=0;if(gv._moving){timer=setTimeout(go,250);return}
   const k2=sig(gv,o.key);if(P&&P.key===k2&&P.stage>=1||job&&job.want===k2)return;
   const v=viewBox(gv);if(P&&P.key!==k2&&reuse(v)){P.key=k2;req(gv);return}
   let st=1;if(!P||P.key!==k2){if(v){const c0=(v.lon1-v.lon0)/gridFor(v,0)[0];if((!covers(v)||P.cell>c0*1.01)&&fineFor(v,0))st=0}}
   build(gv,o.key,st)},P&&P.key===k?30:250)}
 if(!P)return null;const now=performance.now(),a=Math.max(0,Math.min(1,(now-P.t0)/FADE));if(a<1)requestAnimationFrame(()=>req(gv));lastShown=now;return{tex:P.tex,bb:P.bb,a}};
/* a new close-up fades in only after a frame drawn without one; otherwise it replaces the shown one in one swap (it is made
   once the globe stops, often more than 300 ms after the last frame, and used to fade in from the blurry picture each time) */
window.gfElevPatch=function(G,o){const r=patch(G,o);if(!r)lastShown=0;return r};
/* for checking: what the last close-up was worked out from, and the timings of the view's steps */
window.gfElevPatch.dbg=()=>P&&{bb:P.bb,nx:P.nx,ny:P.ny,z:P.z,noaa:P.noaa,late:P.late,stage:P.stage,busy:!!job,pending:!!job,ring:!!ring,worker:!!W,steps:TL&&TL.ev};

/* ---------- the flat map's close-up (drawn by geoflock-nightsharp.js) ----------
   The flat Elevation map is one picture of about 10 km a pixel. Zoomed in on it, geoflock-nightsharp.js draws the view again
   at screen resolution (device pixels), as it does for City Lights, Satellite and Population, and asks gfElevHR.flat for
   the pieces of the world it needs, in plain latitude/longitude: they are worked out by the same engine, with the same
   colours and the same light from the north-west as the globe's close-up. A "level" is only a size, ppd(z) pixels a
   degree, the smallest at least as fine as the screen; the tiles are fetched at about one tile pixel a screen pixel (at
   most FLATT tiles). The grid is at most FLATC cells (larger screens get a slightly enlarged one). NOAA is waited for at
   most 1.5 s after the tiles: if it is later, the piece is drawn without it and marked as missing something, so
   geoflock-nightsharp.js makes it again a few seconds later (by then NOAA's grid is in, or has failed and is left out). */
const FLATT=96,FLATC=4.2e6,fppd=z=>8*2**z;
const flatWanted=()=>{try{return typeof appMode!=="undefined"&&appMode==="allmaps"&&typeof allMapsColorMode!=="undefined"&&allMapsColorMode==="elevation"&&!(typeof gfSeaLevel==="function"&&gfSeaLevel())}catch(e){return false}};
let flatLoad=null,FT=null;
window.gfElevHR={flat:{
 /* whether this flat picture is the Elevation map's (and the map is showing it) */
 match(h){if(!flatWanted()||typeof h!=="string")return false;const el=document.getElementById("allMapsElevationLayer");return!!el&&(el.getAttribute("href")||el.getAttribute("xlink:href"))===h},
 /* the zoomed-out globe picture, for telling sea from land where the map's shapes leave it open */
 ready:()=>!!picOf("elevation"),
 load(){if(picOf("elevation"))return Promise.resolve();if(flatLoad)return flatLoad;
  flatLoad=new Promise(res=>{try{if(globeImages("elevation",()=>res()))res()}catch(e){res()}setTimeout(res,15000)}).then(()=>{flatLoad=null});return flatLoad},
 ppd:fppd,
 /* the size for need device pixels a degree; null when the view is too wide for the tiles */
 level(need,lo0,lo1){if(lo0!=null&&!(lo1-lo0<=200))return null;let z=0;while(z<12&&fppd(z)<need*.98)z++;return z},
 /* a piece of the world (x,y,w,h in a virtual picture TW x TH of the whole world, TW=360*ppd(z)) drawn at rw x rh;
    stop(): true when it is no longer wanted. Where nothing is known the piece is see-through (the flat picture shows) */
 async crop(z,cx,cy,cw,ch,rw,rh,TW,TH,stop){const v={lon0:cx/TW*360-180,lon1:(cx+cw)/TW*360-180,lat1:90-cy/TH*180,lat0:90-(cy+ch)/TH*180};
  const k=Math.min(1,Math.sqrt(FLATC/(rw*rh))),nx=Math.max(2,Math.round(rw*k)),ny=Math.max(2,Math.round(rh*k));
  const c=document.createElement("canvas");c.width=rw;c.height=rh;picOf("elevation");const t0=performance.now();
  const R=await new Promise(res=>{let iv=0;const h=run({v,nx,ny,maxT:FLATT,fade:false,two:false,grace:1500},()=>maskFor(typeof amGlobe!=="undefined"?amGlobe:null,v,nx,ny),(R,f)=>{if(f){clearInterval(iv);res(R)}});
   iv=setInterval(()=>{if(stop&&stop()){h.cancel();clearInterval(iv);res(null)}},150)});
  FT={t:R&&R.t,at:Math.round(performance.now()-t0)};if(!R||!R.out)return c;if(R.miss||R.late)c._gfMiss=(R.miss||0)+(R.late?1:0);if(R.late)c._gfLate=1;
  const id=new ImageData(R.out,nx,ny);if(nx===rw&&ny===rh)c.getContext("2d").putImageData(id,0,0);
  else{const t=document.createElement("canvas");t.width=nx;t.height=ny;t.getContext("2d").putImageData(id,0,0);const x=c.getContext("2d");x.imageSmoothingEnabled=true;x.imageSmoothingQuality="high";x.drawImage(t,0,0,rw,rh);t.width=0}
  return c},
 /* fetch (only) the tiles of a view ahead of time: need cells a degree over [W,N,E,S], at most max tiles */
 prefetch(need,b,max){const v={lon0:b[0],lon1:b[2],lat1:Math.min(85,b[1]),lat0:Math.max(-85,b[3])};if(!(v.lat1>v.lat0)||!(v.lon1>v.lon0))return;
  const m={t:"prefetch",v,need,maxT:FLATT,max:max||FLATT+30};worker().then(ok=>{try{if(ok&&W)W.postMessage(m);else mainEng().prefetch(v,need,m.maxT,m.max)}catch(e){}})},
 /* for checking: where the work is done, and the last piece's timings */
 state:()=>({eng:W?"worker":"page",last:FT})}};
})();
