/* GeoFlock: globe pictures without freezing the page. The globe's big pictures (relief, satellite, city lights and
   elevation, up to 8192x4096) used to be copied, edge-blended and uploaded in the frame they arrived, which stopped the
   spinning globe for seconds on a first visit. The edge blend is now baked into the files (the *_LK / *_B pictures), and
   here each picture is decoded off the main thread (img.decode) and, if needed, shrunk to what the graphics card takes
   before the globe sees it; the globe keeps spinning with what it has meanwhile. */
(function(){
if(typeof globeImages!=="function"||typeof _globeImgs==="undefined")return;
const KEYS={relief:1,satellite:1,night:1,elevation:1};
let MX=0;
function maxTex(){if(MX)return MX;try{const c=document.createElement("canvas"),g=c.getContext("webgl")||c.getContext("experimental-webgl");MX=g&&g.getParameter(g.MAX_TEXTURE_SIZE)||4096;if(window.gfTexCap)MX=Math.min(MX,window.gfTexCap);
 try{const l=g&&g.getExtension("WEBGL_lose_context");if(l)l.loseContext()}catch(e){}}catch(e){MX=4096}MX=Math.min(MX,8192);return MX}
const P={};/* key -> {state:"load"|"wait"|"prep"|"done"|"skip", cbs:[]} */
const _gi=globeImages;
function fire(p){const cbs=p.cbs.splice(0);cbs.forEach(f=>{try{f&&f()}catch(e){console.error(e)}})}
function prep(key,p){const rec=_globeImgs[key];if(!rec||!rec.ready){p.state="skip";fire(p);return}p.state="prep";const mx=maxTex();
 /* the pictures stay ordinary images (pre-decoded ImageBitmaps drew black on some computers): they are decoded off the main
    thread with img.decode() before the globe gets them; one bigger than the graphics card takes is shrunk on a canvas */
 Promise.all(rec.imgs.map(im=>{const w=im.naturalWidth||im.width,h=im.naturalHeight||im.height;
   const dec=im.decode?im.decode().catch(()=>{}):Promise.resolve();
   if(!w||!h||(w<=mx&&h<=mx))return dec.then(()=>im);
   return dec.then(()=>{const k=Math.min(mx/w,mx/h),c=document.createElement("canvas");c.width=Math.round(w*k);c.height=Math.round(h*k);
    c.getContext("2d").drawImage(im,0,0,c.width,c.height);return c}).catch(()=>im)}))
  .then(list=>{const r=_globeImgs[key];if(r!==rec){p.state="skip";fire(p);return}
   list.forEach((b,i)=>{rec.imgs[i]=b});rec.imgs._seam=true;rec._gfClean=true;p.state="done";fire(p)})
  .catch(()=>{p.state="skip";fire(p)})}
globeImages=function(key,cb){
 if(!KEYS[key])return _gi.apply(this,arguments);
 let p=P[key];const rec=_globeImgs[key];
 if(!p){/* pictures already in (and handled the old way) before this ran: leave them be */
  if(rec&&rec.ready&&rec.imgs._seam){P[key]={state:"skip",cbs:[]};return _gi.apply(this,arguments)}
  p=P[key]={state:"load",cbs:[]};
  const done=()=>{if(p.state==="load"){p.state="wait";setTimeout(()=>prep(key,p),0)}};
  if(rec&&rec.ready)done();/* in, but not yet handed to the globe */
  else _gi.call(this,key,done);/* starts the download; the old handlers run only when asked for the pictures, which this skips */
 }
 if(p.state==="skip")return _gi.apply(this,arguments);
 if(p.state==="done"&&_globeImgs[key]===rec&&rec&&rec.ready)return rec.imgs;
 if(p.state==="done"){/* the record was replaced (e.g. rebuilt): start over */delete P[key];return globeImages.call(this,key,cb)}
 if(cb&&!p.cbs.includes(cb))p.cbs.push(cb);
 return null};
})();
