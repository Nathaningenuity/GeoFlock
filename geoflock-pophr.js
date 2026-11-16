/* GeoFlock: the Population map gets sharper as you zoom in on the globe, in clear steps.
   Source: GHS-POP R2023A, epoch 2025, 30 arc-seconds (about 1 km a pixel at the equator), European Commission, Joint
   Research Centre (Schiavina, Freire, Carioli, MacManus, 2023; GHSL, doi:10.2905/2FF68A52-5B5B-4A22-8F40-C41DA8332CFE),
   CC BY 4.0. The sea is where Natural Earth's 10m land and minor islands (public domain) are not, and no one lives.
   Built by tools/build-pop-tiles.py into textures/pophr: grey tiles of 360 x 360 px, one value a pixel standing for the
   people per km2 of land in it (32 steps a factor of ten; 0 sea, 1 under about 2 a km2, white on the map), in three sizes: 0/ 12-degree tiles (30 px a
   degree), 1/ 6-degree (60) and 2/ 3-degree (120, the data's own 30 arc-seconds). Tiles of all sea are left out, and
   tiles of land with under 2 people a km2 everywhere are only listed (index.json). The globe picture (GLOBE_DENS_IMG, 10 px a degree) and
   the flat map's picture (FLAT_DENS_IMG) are made from the same data by the same script, so nothing jumps between steps.
   The grey values are coloured here with the map's own 64 colours (DENS_LEVELS in index.html, 16 a factor of ten from
   1 person per km2), the same table the key, the hover read-out and the globe picture use.
   Zoomed in on the globe, the part in view is drawn from the tiles instead of the globe picture (index.html,
   GlobeGL.draw -> gfHRPatch; this file answers for the Population map and hands everything else on to
   geoflock-reliefsharp.js). As with the Relief map it comes in steps, not a slow blur-to-sharp: once the globe picture
   is magnified the 30 px tiles fade in quickly, and each next size replaces the last in one swap once the last would be
   magnified (all counted in screen pixels, so on a sharp screen the steps come sooner). The tiles of the next step are
   fetched ahead while you zoom and decoded off the page (createImageBitmap). The flat map keeps its own picture (now from
   the same data, about 10 km a pixel); it is not drawn from the tiles. */
(function(){
"use strict";
const BASE="textures/pophr/",V="?v=1",T=360,FADE=260;
/* zoom (device pixels a degree) at which each step starts: the 30 px tiles once the globe picture (10 px a degree) is
   twice magnified and the view is small enough to be covered by about a hundred tiles; the next ones once the last
   would be magnified */
const ON=[20,31.5,63],PRE=[14,24,46];
let IDX=null,idxP=null,HAVE=null;
function index(){if(!idxP)idxP=fetch(BASE+"index.json"+V).then(r=>r.ok?r.json():null).then(j=>{if(j){IDX=j;HAVE=j.levels.map(L=>({h:new Set(L.have),e:new Set(L.e)}))}return j}).catch(()=>null);return idxP}
const IMG=new Map();
function load(k){const u=BASE+k+".webp"+V,opt={colorSpaceConversion:"none",premultiplyAlpha:"none"};
 if(window.createImageBitmap&&window.fetch)return fetch(u).then(r=>r.ok?r.blob():null).then(b=>b?createImageBitmap(b,opt).catch(()=>createImageBitmap(b)):null).catch(()=>null);
 return new Promise(res=>{const im=new Image();im.onload=()=>res(im);im.onerror=()=>res(null);im.src=u})}
function img(k){if(IMG.has(k)){const v=IMG.get(k);IMG.delete(k);IMG.set(k,v);return v}
 const p=load(k);IMG.set(k,p);while(IMG.size>500)IMG.delete(IMG.keys().next().value);return p}
/* "density", or "densitySeaL" / "densitySeaD": the same picture with the sea recoloured for the light or dark theme (geoflock-thsea.js) */
const isDens=k=>/^density/.test(k||"");
function wanted(){try{return typeof amDensityOn==="function"&&amDensityOn()&&!(typeof gfSeaLevel==="function"&&gfSeaLevel())}catch(e){return false}}
let P=null,busy=false,timer=0,lastShown=0,preKey="",preT=0;
const req=()=>{try{amGlobe&&(amGlobe.request?amGlobe.request():amGlobe.render())}catch(e){}};
function viewBox(gv){const pr=gv.projection(),{w,h}=gv.size(),c=[-gv.rot[0],-gv.rot[1]];let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9,n=0;
 for(let i=0;i<=10;i++)for(let j=0;j<=10;j++){const q=pr.invert&&pr.invert([w*i/10,h*j/10]);if(!q||!isFinite(q[0])||!isFinite(q[1]))continue;if(d3.geoDistance(q,c)>Math.PI/2)continue;let dl=((q[0]-c[0]+540)%360)-180;x0=Math.min(x0,dl);x1=Math.max(x1,dl);y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1]);n++}
 if(n<4)return null;const lat=Math.max(Math.abs(y0),Math.abs(y1));if(lat>80){x0=-180;x1=180}return{l0:c[0]+x0,l1:c[0]+x1,b0:y0,b1:y1}}
/* the tiles covering the view and a margin of one tile, middle first; drawn smaller (sc) if they would not fit in one texture */
function tilesFor(gv,lv,maxPx){const L=IDX.levels[lv],D=L.deg,v=viewBox(gv);if(!v)return null;
 let c0=Math.floor((v.l0+180)/D)-1,c1=Math.floor((v.l1+180)/D)+1,r0=Math.max(0,Math.floor((90-v.b1)/D)-1),r1=Math.min(L.rows-1,Math.floor((90-v.b0)/D)+1);
 if(c1-c0+1>L.cols){c0=0;c1=L.cols-1}
 const cols=c1-c0+1,rows=r1-r0+1;if(cols*rows>260)return null;
 const sc=Math.min(1,maxPx/(cols*T),maxPx/(rows*T));
 const ks=[],mc=(c0+c1)/2,mr=(r0+r1)/2;for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++){const cc=((c%L.cols)+L.cols)%L.cols,k=cc+"_"+r;ks.push([c-c0,r-r0,k,(c-mc)**2+(r-mr)**2])}
 ks.sort((a,b)=>a[3]-b[3]);return{c0,c1,r0,r1,D,ks,sc}}
/* the colour of each grey value: the map's own 64 colours, the sea the theme's sea */
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
/* the sea as the globe picture shows it: geoflock-thsea.js's colours for its recoloured copies, else the theme's sea (index.html) */
function oceanNow(key){if(key==="densitySeaL")return"#cfe3f1";if(key==="densitySeaD")return"#1c2333";try{return getComputedStyle(document.body).getPropertyValue("--ocean").trim()||"#5797cf"}catch(e){return"#5797cf"}}
function lut(sea){const C=DENS_LEVELS.colours,N=C.length,per=N/(DENS_LEVELS.hi-DENS_LEVELS.lo),out=new Uint32Array(256),le=new Uint8Array(new Uint32Array([1]).buffer)[0]===1,s=hex(sea.length===4?"#"+sea[1]+sea[1]+sea[2]+sea[2]+sea[3]+sea[3]:sea);
 const pack=(r,g,b)=>le?(255<<24|b<<16|g<<8|r)>>>0:(r<<24|g<<16|b<<8|255)>>>0;
 for(let g=0;g<256;g++){let c;if(g===0)c=s;else{/* people per km2 of grey value g: 10^((g-2)/32-1); colour n covers 10^(lo+n/per) .. */
   let n=g<2?0:Math.floor(((g-2)/32-1-DENS_LEVELS.lo)*per+1e-9);n=Math.max(0,Math.min(N-1,n));c=hex(C[n])}
  out[g]=pack(c[0],c[1],c[2])}return out}
const maxPx=G=>Math.min(4096,G.getParameter(G.MAX_TEXTURE_SIZE)||4096);
async function build(gv,lv,sig,ppd){busy=true;try{const G=gv.gl&&gv.gl.gl;if(!G||!IDX){busy=false;return}
 /* a view over a pole needs every longitude: then a coarser size, if this one would need too many tiles */
 let tf=null,ul=lv;for(;ul>=0&&!(tf=tilesFor(gv,ul,maxPx(G)));ul--);if(!tf){busy=false;return}const{c0,c1,r0,r1,D,ks,sc}=tf;
 const key=[ul,c0,c1,r0,r1,sig].join(",");if(P&&P.key===key){P.ppd=ppd;busy=false;return}
 const H=HAVE[ul],ims=await Promise.all(ks.map(k=>H.h.has(k[2])?img(ul+"/"+k[2]):null));
 const cols=c1-c0+1,rows=r1-r0+1,ts=T*sc,cw=Math.round(cols*ts),ch=Math.round(rows*ts),cv=document.createElement("canvas");cv.width=cw;cv.height=ch;
 const x=cv.getContext("2d",{willReadFrequently:true});x.imageSmoothingEnabled=false;x.fillStyle="#000";x.fillRect(0,0,cw,ch);x.fillStyle="rgb(1,1,1)";
 ks.forEach(([i,j,k],n)=>{const X=Math.round(i*ts),Y=Math.round(j*ts),W=Math.round((i+1)*ts)-X,Hh=Math.round((j+1)*ts)-Y;if(ims[n])x.drawImage(ims[n],X,Y,W,Hh);else if(H.e.has(k))x.fillRect(X,Y,W,Hh)});
 const id=x.getImageData(0,0,cw,ch),L=lut(sig.split("|")[0]),u32=new Uint32Array(id.data.buffer),d=id.data;
 for(let i=0,n=u32.length;i<n;i++)u32[i]=L[d[i*4]];
 if(gv.gl.gl!==G){busy=false;return}
 const t=G.createTexture();G.activeTexture(G.TEXTURE4);G.bindTexture(G.TEXTURE_2D,t);G.pixelStorei(G.UNPACK_FLIP_Y_WEBGL,false);G.pixelStorei(G.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
 G.texImage2D(G.TEXTURE_2D,0,G.RGBA,cw,ch,0,G.RGBA,G.UNSIGNED_BYTE,new Uint8Array(id.data.buffer));G.generateMipmap(G.TEXTURE_2D);
 G.texParameteri(G.TEXTURE_2D,G.TEXTURE_MIN_FILTER,G.LINEAR_MIPMAP_LINEAR);G.texParameteri(G.TEXTURE_2D,G.TEXTURE_MAG_FILTER,G.LINEAR);G.texParameteri(G.TEXTURE_2D,G.TEXTURE_WRAP_S,G.CLAMP_TO_EDGE);G.texParameteri(G.TEXTURE_2D,G.TEXTURE_WRAP_T,G.CLAMP_TO_EDGE);
 try{const an=gv.gl.aniso;if(an)G.texParameterf(G.TEXTURE_2D,an.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(8,G.getParameter(an.MAX_TEXTURE_MAX_ANISOTROPY_EXT)))}catch(e){}
 G.activeTexture(G.TEXTURE0);if(P&&P.tex&&P.gl===G)try{G.deleteTexture(P.tex)}catch(e){}
 /* fades in only when nothing sharp was showing; a step from one size to the next is one swap */
 const now=performance.now();
 P={key,lv,sig,ppd,sc,gl:G,tex:t,bb:[c0*D-180,90-r0*D,cols*D,rows*D],box:[c0*D-180,c1*D-180+D,90-r1*D-D,90-r0*D],t0:lastShown?-1e9:now};busy=false;req()}catch(e){console.error(e);busy=false}}
function inside(gv){if(!P)return false;const v=viewBox(gv);if(!v)return false;const l=((v.l0-P.box[0])%360+360)%360,r=l+(v.l1-v.l0);return l>=0&&r<=P.box[1]-P.box[0]+1e-6&&v.b0>=P.box[2]-1e-6&&v.b1<=P.box[3]+1e-6}
const sigNow=key=>oceanNow(key)+"|"+(typeof DENS_LEVELS!=="undefined"?DENS_LEVELS.colours.length+DENS_LEVELS.colours[40]:"");
function prefetch(gv,lv){const now=performance.now();if(now-preT<300||!IDX)return;preT=now;const G=gv.gl&&gv.gl.gl;if(!G)return;const tf=tilesFor(gv,lv,maxPx(G));if(!tf)return;
 const k=lv+":"+tf.c0+","+tf.r0+","+tf.c1+","+tf.r1;if(k===preKey)return;preKey=k;tf.ks.forEach(t=>{if(HAVE[lv].h.has(t[2]))img(lv+"/"+t[2])})}
function patch(G,o){const gv=o.gv;if(!gv||gv._flat||!wanted())return null;const ppd=o.s*Math.PI/180;
 if(P&&P.gl!==G.gl)P=null;
 if(ppd<ON[0]){if(ppd>PRE[0]){if(IDX)prefetch(gv,0);else index()}return null}
 if(!IDX){index().then(req);return null}
 const lv=ppd>=ON[2]?2:ppd>=ON[1]?1:0,sig=sigNow(o.key);if(lv<2&&ppd>PRE[lv+1])prefetch(gv,lv+1);
 /* a patch drawn smaller to fit (sc below 1) is made again once zoomed in enough for fewer tiles to fill the view */
 const fresh=P&&P.lv===lv&&P.sig===sig&&inside(gv)&&!(P.sc<.999&&ppd>P.ppd*1.25);
 if(!busy&&!fresh){clearTimeout(timer);timer=setTimeout(function go(){
   if(gv._moving&&P&&P.lv===lv&&P.sig===sigNow(o.key)&&inside(gv)&&!(P.sc<.999&&ppd>P.ppd*1.25)){timer=setTimeout(go,250);return}
   if(!busy)build(gv,lv,sigNow(o.key),ppd)},P?(gv._moving?300:60):0)}
 if(!P||P.sig!==sig)return null;const now=performance.now(),f=Math.max(0,Math.min(1,(now-P.t0)/FADE));
 if(f<1)requestAnimationFrame(req);lastShown=now;return{tex:P.tex,bb:P.bb,a:f}}
const prev=window.gfHRPatch;
/* lastShown is cleared whenever a frame is drawn without a patch: a new patch fades in only then, and replaces a shown one in one swap
   (it is often made more than 300 ms after the last frame, once the globe stops, and used to fade in from the blurry picture) */
window.gfHRPatch=function(G,o){if(o&&isDens(o.key)){const r=patch(G,o);if(!r)lastShown=0;return r}return prev?prev(G,o):null};
window.gfHRPatch.state=prev&&prev.state;window.gfPopHR={state:()=>({busy,key:P&&P.key,lv:P&&P.lv,cached:IMG.size,idx:!!IDX})};
/* the flat map's picture: the same data, coloured the same way (the one in the map file was labelled NASA GPWv4 2015) */
const FLAT="textures/FLAT_DENS_IMG.webp?v=1";
function flatSwap(wrapEl){try{const svg=wrapEl&&wrapEl.querySelector?wrapEl.querySelector("svg"):null,el=(svg||document).querySelector("#allMapsDensityLayer");
 if(el&&el.getAttribute("href")!==FLAT){el.setAttribute("href",FLAT);try{densSampler=null}catch(e){}try{if(typeof PSC_THR!=="undefined"){PSC_THR.popLv=null;PSC_THR.pop={}}}catch(e){}}}catch(e){}}
if(typeof applyAllMapsColorMode==="function"){const _a=applyAllMapsColorMode;applyAllMapsColorMode=function(wrapEl){flatSwap(wrapEl);return _a.apply(this,arguments)}}
if(typeof allMapsLegendHTML==="function"){const _l=allMapsLegendHTML;allMapsLegendHTML=function(){const h=_l.apply(this,arguments);if(!(typeof amDensityOn==="function"&&amDensityOn()))return h;
 return h.replace("NASA GPWv4 (2015, ~11 km cells)","GHS-POP 2025 (European Commission JRC, CC BY 4.0), 1 km cells zoomed in on the globe")}}
flatSwap(document);
})();
