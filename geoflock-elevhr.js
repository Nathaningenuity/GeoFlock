/* GeoFlock: the Elevation map gets sharper as you zoom in on the globe. Its picture is about 10 km a pixel; zoomed in, the
   heights for the view are fetched (AWS Terrain Tiles, the same heights the cross-section uses: SRTM, GMTED2010, ETOPO1 and
   other open data) and coloured with the Elevation map's own colours, which are read off the picture itself (each height's
   colour is the typical colour the picture gives that height in view), then shaded with light from the north-west as the
   picture is. The globe's shader puts it in place of the picture (index.html, GlobeGL.draw → gfElevPatch). It is worked out
   once the map is still; while it moves, the last one is kept.
   The sea's depth and the top of the ice sheets come from NOAA's DEM Global Mosaic (ETOPO 2022 and finer coastal models,
   public domain, about 450 m a pixel in the open sea; its server allows the page to read it). The Terrain Tiles' sea is
   ETOPO1 (1.8 km a pixel), which drew a soft pale halo round every atoll and reef, and from zoom 11 their tiles that touch
   land have the sea at 0 m; in Antarctica and Greenland they give the rock under the ice, so there the close-up used to fall
   back on the zoomed-out picture, whose pixels at 70 degrees are 10 km and three times taller than wide (islands such as
   Peter I came out as sea, and the coast was smeared in north-south streaks). If NOAA cannot be reached, the Terrain Tiles
   and the picture are used as before. */
(function(){
"use strict";
const TILES=new Map();
function tile(k){if(TILES.has(k))return TILES.get(k);
 const pr=new Promise(res=>{const im=new Image();im.crossOrigin="anonymous";im.onload=()=>{try{const c=document.createElement("canvas");c.width=c.height=256;const g=c.getContext("2d",{willReadFrequently:true});g.drawImage(im,0,0);
   const d=g.getImageData(0,0,256,256).data,h=new Float32Array(65536);for(let i=0;i<65536;i++)h[i]=d[i*4]*256+d[i*4+1]+d[i*4+2]/256-32768;res(h)}catch(e){res(null)}};im.onerror=()=>res(null);
  im.src="https://s3.amazonaws.com/elevation-tiles-prod/terrarium/"+k+".png"});TILES.set(k,pr);while(TILES.size>160)TILES.delete(TILES.keys().next().value);return pr}
/* NOAA DEM Global Mosaic for a box: float32 heights, a row a latitude (north first), split at the date line; null if it fails */
const NOAA="https://gis.ngdc.noaa.gov/arcgis/rest/services/DEM_mosaics/DEM_global_mosaic/ImageServer/exportImage";
async function noaaPart(lo0,lo1,la0,la1,w,h){const ac=typeof AbortController!=="undefined"?new AbortController():null,t=setTimeout(()=>ac&&ac.abort(),20000);
 try{const r=await fetch(NOAA+"?bbox="+[lo0,la0,lo1,la1].map(x=>x.toFixed(5)).join(",")+"&bboxSR=4326&imageSR=4326&size="+w+","+h+"&format=bsq&pixelType=F32&interpolation=RSP_BilinearInterpolation&f=image",ac?{signal:ac.signal}:{});
  if(!r.ok)return null;const b=await r.arrayBuffer();if(b.byteLength<w*h*4)return null;const f=new Float32Array(b.slice(0,w*h*4)),m=b.byteLength>=w*h*4+Math.ceil(w*h/8)?new Uint8Array(b,w*h*4):null;
  /* after the heights, one bit a pixel (most significant first): 0 where there is no data */
  if(m)for(let i=0;i<w*h;i++)if(!(m[i>>3]&(128>>(i&7))))f[i]=NaN;return f}catch(e){return null}finally{clearTimeout(t)}}
async function noaa(lon0,lon1,la0,la1,w,h){let s=((lon0+180)%360+360)%360-180;const e=s+(lon1-lon0);
 if(e<=180){const f=await noaaPart(s,e,la0,la1,w,h);return f&&{f,w,h,lon0:s,dl:(e-s)/w,la1,dla:(la1-la0)/h}}
 const wa=Math.max(2,Math.round(w*(180-s)/(e-s))),wb=Math.max(2,w-wa),[A,B]=await Promise.all([noaaPart(s,180,la0,la1,wa,h),noaaPart(-180,e-360,la0,la1,wb,h)]);if(!A||!B)return null;
 const W=wa+wb,f=new Float32Array(W*h);for(let j=0;j<h;j++){f.set(A.subarray(j*wa,(j+1)*wa),j*W);f.set(B.subarray(j*wb,(j+1)*wb),j*W+wa)}
 return{f,w:W,h,lon0:s,dl:(e-s)/W,la1,dla:(la1-la0)/h}}
/* bilinear height from such a grid; NaN outside it or where it has no data */
function noaaAt(N,lo,la){if(!N)return NaN;const x=((((lo-N.lon0)%360)+360)%360)/N.dl-.5,y=(N.la1-la)/N.dla-.5;if(x<-.5||y<-.5||x>N.w-.5||y>N.h-.5)return NaN;
 const x0=Math.max(0,Math.min(N.w-1,Math.floor(x))),y0=Math.max(0,Math.min(N.h-1,Math.floor(y))),x1=Math.min(N.w-1,x0+1),y1=Math.min(N.h-1,y0+1),fx=Math.max(0,Math.min(1,x-x0)),fy=Math.max(0,Math.min(1,y-y0)),F=N.f;
 return(F[y0*N.w+x0]*(1-fx)+F[y0*N.w+x1]*fx)*(1-fy)+(F[y1*N.w+x0]*(1-fx)+F[y1*N.w+x1]*fx)*fy}
/* where the heights are the rock under an ice sheet (Antarctica, Greenland), not the ice: the picture is left as it is */
const iceZone=(lo,la)=>la<-60||la>84||(lo>-75&&lo<-10&&la>59&&!(lo>-25&&lo<-13&&la>63&&la<67.5));
const hex=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));
const LANDS=typeof ELEV_LAND_STOPS!=="undefined"?ELEV_LAND_STOPS:[[0,"#5f9f72"],[7e3,"#ffffff"]],SEAS=typeof ELEV_SEA_STOPS!=="undefined"?ELEV_SEA_STOPS:[[-11e3,"#183660"],[0,"#bedaee"]];
let PIC=null;
function picOf(key){try{const im=globeImages(key,()=>{});if(!im||!im.length)return null;const a=im[0];if(PIC&&PIC.a===a)return PIC;const c=document.createElement("canvas");c.width=2048;c.height=1024;const x=c.getContext("2d",{willReadFrequently:true});
 if(im.length===2){x.drawImage(im[0],0,0,1024,1024);x.drawImage(im[1],1024,0,1024,1024)}else x.drawImage(a,0,0,2048,1024);PIC={a,d:x.getImageData(0,0,2048,1024).data};return PIC}catch(e){return null}}
const picAt=(P,lo,la)=>{const x=Math.max(0,Math.min(2047,Math.floor((((lo+180)%360+360)%360)/360*2048))),y=Math.max(0,Math.min(1023,Math.floor((90-la)/180*1024))),o=(y*2048+x)*4;return o};
function viewBox(gv){const pr=gv.projection(),{w,h}=gv.size(),c=[-gv.rot[0],-gv.rot[1]];let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9,n=0;
 for(let i=0;i<=10;i++)for(let j=0;j<=10;j++){const q=pr.invert&&pr.invert([w*i/10,h*j/10]);if(!q||!isFinite(q[0])||d3.geoDistance(q,c)>Math.PI/2)continue;const dl=((q[0]-c[0]+540)%360)-180;x0=Math.min(x0,dl);x1=Math.max(x1,dl);y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1]);n++}
 if(n<6||y1>84||y0<-84)return null;return{lon0:c[0]+x0,lon1:c[0]+x1,lat0:y0,lat1:y1,w,h}}
let P=null,busy=false,timer=0;
async function build(gv,key){busy=true;try{const v=viewBox(gv);if(!v){busy=false;return}const PI=picOf(key);if(!PI){busy=false;return}
 /* about a screen pixel a cell, at most 1100 a side */
 const nx=Math.min(1100,Math.max(64,Math.round(v.w))),ny=Math.min(1100,Math.max(64,Math.round(v.h))),dlon=(v.lon1-v.lon0)/nx,dlat=(v.lat1-v.lat0)/ny;
 /* the tiles' zoom: about one tile pixel a cell, fewer tiles if the view needs too many. (A tile pixel spans 360/256/2^z degrees
    of longitude at every latitude, as a cell spans dlon: no cos(latitude) here, which made the tiles near 70 degrees nearly
    three times coarser than the screen.) */
 const midLat=(v.lat0+v.lat1)/2;let z=Math.round(Math.log2(360/dlon/256));z=Math.max(2,Math.min(12,z));
 const merc=(lo,la,z)=>{const n=2**z,s=Math.sin(Math.max(-85,Math.min(85,la))*Math.PI/180);return[(((lo+180)/360)%1+1)%1*n*256,(.5-Math.log((1+s)/(1-s))/(4*Math.PI))*n*256]};
 const span=z=>{const a=merc(v.lon0,v.lat1,z),b=merc(v.lon1,v.lat0,z),r={z,tx0:Math.floor(a[0]/256),ty0:Math.floor(a[1]/256),tx1:Math.floor(b[0]/256),ty1:Math.floor(b[1]/256)};if(r.tx1<r.tx0)r.tx1+=2**z;return r};
 let A;for(;;){A=span(z);if((A.tx1-A.tx0+1)*(A.ty1-A.ty0+1)<=36||z<=2)break;z--}
 /* from zoom 11 the tiles that touch land have the sea at 0 m: the sea's depth (and the rock under ice shelves) is read at zoom 10 */
 const S=z>10?span(10):A;
 const load=async R=>{const n=2**R.z,ks=[];for(let ty=R.ty0;ty<=R.ty1;ty++)for(let tx=R.tx0;tx<=R.tx1;tx++)ks.push([tx,ty]);
  const hs=await Promise.all(ks.map(([tx,ty])=>tile(R.z+"/"+(((tx%n)+n)%n)+"/"+Math.max(0,Math.min(n-1,ty)))));R.TM=new Map();ks.forEach(([tx,ty],i)=>R.TM.set(tx+","+ty,hs[i]));return R};
 /* NOAA's grid: about a cell a pixel, no finer than its own 15 arc-seconds in the open sea */
 const NW=Math.max(8,Math.min(nx,Math.ceil((v.lon1-v.lon0)*240))),NH=Math.max(8,Math.min(ny,Math.ceil((v.lat1-v.lat0)*240)));
 const [,,N]=await Promise.all([load(A),S===A?null:load(S),noaa(v.lon0,v.lon1,v.lat0,v.lat1,NW,NH)]);
 if(gv._moving){busy=false;return}
 const at=(R,lo,la)=>{const n=2**R.z;let [px,py]=merc(lo,la,R.z);let tx=Math.floor(px/256);if(tx<R.tx0)tx+=n,px+=n*256;const ty=Math.floor(py/256),T=R.TM.get(tx+","+ty);if(!T)return NaN;
   const x=Math.min(255,Math.max(0,px-tx*256-.5)),y=Math.min(255,Math.max(0,py-ty*256-.5)),x0=Math.floor(x),y0=Math.floor(y),x1=Math.min(255,x0+1),y1=Math.min(255,y0+1),fx=x-x0,fy=y-y0;
   return(T[y0*256+x0]*(1-fx)+T[y0*256+x1]*fx)*(1-fy)+(T[y1*256+x0]*(1-fx)+T[y1*256+x1]*fx)*fy};
 const seaPic=(lo,la)=>{const o=picAt(PI,lo,la);return PI.d[o+2]>PI.d[o]+25};
 /* each cell: its height (land) or depth (sea), and whether it is land; NaN (left to the picture) where nothing is known */
 const H=new Float32Array(nx*ny),LND=new Uint8Array(nx*ny);let ok=0;
 for(let j=0;j<ny;j++){const la=v.lat1-(j+.5)*dlat;for(let i=0;i<nx;i++){const lo=v.lon0+(i+.5)*dlon,k=j*nx+i,hL=at(A,lo,la),hS=S===A?hL:at(S,lo,la),nh=noaaAt(N,lo,la);
   if(!isFinite(hL)){H[k]=NaN;continue}ok++;let land,h;
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
    if(z>10)land=hL>.5||(hL<-.5&&!seaPic(lo,la));else land=hL>=0?!(hL<120&&nh<-3):!seaPic(lo,la);
    h=land?hL:nh<0?nh:isFinite(hS)&&hS<0?hS:-1}
   H[k]=h;LND[k]=land?1:0}}
 if(ok<nx*ny*.5){busy=false;return}
 /* the Elevation map's own colours for each height (its legend's stops, the same as the zoomed-out picture: tools/build-elev.py) */
 const stops=(S,h)=>{let i=1;while(i<S.length-1&&S[i][0]<h)i++;const a=S[i-1],b=S[i],t=Math.max(0,Math.min(1,(h-a[0])/(b[0]-a[0]))),A=hex(a[1]),B=hex(b[1]);return[A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t,A[2]+(B[2]-A[2])*t]};
 /* shading: light from the north-west, about as strong as the picture's; the slope from the cell's neighbours of its own kind
    (land or sea), so the drop from the shore to the sea floor does not draw a dark or bright rim along the coast */
 const mx=dlon*111320*Math.cos(midLat*Math.PI/180),my=dlat*110540,L=[-.5,.5,.707];
 const out=new Uint8ClampedArray(nx*ny*4);
 const nb=(k,k2)=>isFinite(H[k2])&&LND[k2]===LND[k]?H[k2]:H[k];
 for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const k=j*nx+i,h=H[k];if(!isFinite(h))continue;const land=LND[k]===1;
  const hx=(nb(k,j*nx+Math.min(nx-1,i+1))-nb(k,j*nx+Math.max(0,i-1)))/(2*mx),hy=(nb(k,Math.max(0,j-1)*nx+i)-nb(k,Math.min(ny-1,j+1)*nx+i))/(2*my);
  const ex=land?1.6:1.1,nl=Math.hypot(hx*ex,hy*ex,1),dot=(-hx*ex*L[0]-hy*ex*L[1]+L[2])/nl,sh=Math.max(.55,Math.min(1.35,1+(land?1.1:.8)*(dot-L[2])));
  const c=land?stops(LANDS,Math.max(0,h)):stops(SEAS,Math.min(0,h));out[k*4]=c[0]*sh;out[k*4+1]=c[1]*sh;out[k*4+2]=c[2]*sh;out[k*4+3]=255}
 const G=gv.gl&&gv.gl.gl;if(!G){busy=false;return}const t=P&&P.gl===G?P.tex:G.createTexture();G.activeTexture(G.TEXTURE6);G.bindTexture(G.TEXTURE_2D,t);G.pixelStorei(G.UNPACK_FLIP_Y_WEBGL,false);
 G.texImage2D(G.TEXTURE_2D,0,G.RGBA,nx,ny,0,G.RGBA,G.UNSIGNED_BYTE,new Uint8Array(out.buffer));[G.TEXTURE_MIN_FILTER,G.TEXTURE_MAG_FILTER].forEach(p=>G.texParameteri(G.TEXTURE_2D,p,G.LINEAR));
 G.texParameteri(G.TEXTURE_2D,G.TEXTURE_WRAP_S,G.CLAMP_TO_EDGE);G.texParameteri(G.TEXTURE_2D,G.TEXTURE_WRAP_T,G.CLAMP_TO_EDGE);G.activeTexture(G.TEXTURE0);
 P={gl:G,tex:t,bb:[v.lon0,v.lat1,nx*dlon,ny*dlat],key:sig(gv,key),H,LND,nx,ny,z,noaa:!!N};try{gv.request?gv.request():gv.render()}catch(e){}}catch(e){console.error(e)}busy=false}
function blur(H,nx,ny,r){const T=new Float32Array(nx*ny),O=new Float32Array(nx*ny);
 for(let j=0;j<ny;j++){let s=0,c=0;for(let i=-r;i<nx+r;i++){const a=i+r,b=i-r-1;if(a>=0&&a<nx&&isFinite(H[j*nx+a])){s+=H[j*nx+a];c++}if(b>=0&&b<nx&&isFinite(H[j*nx+b])){s-=H[j*nx+b];c--}if(i>=0&&i<nx)T[j*nx+i]=c?s/c:NaN}}
 for(let i=0;i<nx;i++){let s=0,c=0;for(let j=-r;j<ny+r;j++){const a=j+r,b=j-r-1;if(a>=0&&a<ny&&isFinite(T[a*nx+i])){s+=T[a*nx+i];c++}if(b>=0&&b<ny&&isFinite(T[b*nx+i])){s-=T[b*nx+i];c--}if(j>=0&&j<ny)O[j*nx+i]=c?s/c:NaN}}return O}
const sig=(gv,key)=>[key,gv.rot[0].toFixed(3),gv.rot[1].toFixed(3),gv.zoom.toFixed(3)].join("|");
/* from when the picture starts to be magnified (it has about 11 pixels a degree), full a little after */
/* the height under the pointer, from the same tiles (zoom 10, about 150 m a pixel); null until that tile has loaded */
const HV=new Map();
window.gfElevHeight=function(ll){if(iceZone(ll[0],ll[1])){/* on the ice sheets, the top of the ice from the last close-up worked out (NOAA), if it covers the point */
  if(!P||!P.noaa)return null;const i=Math.floor((((ll[0]-P.bb[0])%360+360)%360)/P.bb[2]*P.nx),j=Math.floor((P.bb[1]-ll[1])/P.bb[3]*P.ny);if(i<0||j<0||i>=P.nx||j>=P.ny)return null;const h=P.H[j*P.nx+i];return isFinite(h)?Math.round(h):null}const z=10,n=2**z,la=Math.max(-85,Math.min(85,ll[1]))*Math.PI/180,px=(((ll[0]+180)/360)%1+1)%1*n*256,py=(1-Math.log(Math.tan(la)+1/Math.cos(la))/Math.PI)/2*n*256,tx=Math.floor(px/256),ty=Math.floor(py/256),k=z+"/"+tx+"/"+ty;
 if(!HV.has(k)){HV.set(k,null);tile(k).then(h=>{HV.set(k,h);while(HV.size>40)HV.delete(HV.keys().next().value)})}const T=HV.get(k);if(!T)return null;return T[Math.min(255,Math.floor(py-ty*256))*256+Math.min(255,Math.floor(px-tx*256))]};
window.gfElevPatch=function(G,o){const gv=o&&o.gv;if(!gv||gv._flat||o.key!=="elevation")return null;const ppd=o.s*Math.PI/180,a=Math.max(0,Math.min(1,(ppd/11.4-.9)/.6));if(a<=0)return null;
 if(P&&P.gl!==G.gl)P=null;const k=sig(gv,o.key);
 if((!P||P.key!==k)&&!busy){clearTimeout(timer);timer=setTimeout(function go(){if(gv._moving){timer=setTimeout(go,250);return}if(!busy)build(gv,o.key)},250)}
 return P?{tex:P.tex,bb:P.bb,a}:null};
/* for checking: what the last close-up was worked out from */
window.gfElevPatch.dbg=()=>P&&{bb:P.bb,nx:P.nx,ny:P.ny,z:P.z,noaa:P.noaa,busy};
})();
