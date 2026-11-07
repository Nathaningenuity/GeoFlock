/* GeoFlock: sea level from detailed heights. The world height grid behind the Sea level changer is about 10 km a
   cell, too coarse to show a rise of a few metres (+7 m showed nothing on the US coast). Once the map is still, this
   fetches detailed heights for what is in view (AWS Terrain Tiles: SRTM, GMTED2010, ETOPO1 and other open data) and
   floods every spot lower than the new sea level that the sea can reach (connected to the ocean, so Death Valley and
   lakes inland stay dry); with the sea lowered, it shows the sea floor that would be dry land. Drawn over the map on
   the globe and the flat map (the globe engine's flat mode). */
(function(){
if(typeof GlobeView==="undefined"||typeof d3==="undefined")return;
const R_KM=6371,MAXT=140,TILES=new Map();
function tile(k){if(TILES.has(k)){const v=TILES.get(k);TILES.delete(k);TILES.set(k,v);return v}
 const pr=new Promise((res,rej)=>{const im=new Image();im.crossOrigin="anonymous";im.onload=()=>{try{const c=document.createElement("canvas");c.width=c.height=256;const g=c.getContext("2d",{willReadFrequently:true});g.drawImage(im,0,0);res(g.getImageData(0,0,256,256).data)}catch(e){rej(e)}};im.onerror=rej;
  im.src="https://s3.amazonaws.com/elevation-tiles-prod/terrarium/"+k+".png"});TILES.set(k,pr);pr.catch(()=>TILES.delete(k));
 while(TILES.size>160)TILES.delete(TILES.keys().next().value);return pr}
const txy=(ll,z)=>{const n=2**z,la=Math.max(-85.05,Math.min(85.05,ll[1]))*Math.PI/180;return[(((ll[0]+180)/360)%1+1)%1*n*256,(1-Math.log(Math.tan(la)+1/Math.cos(la))/Math.PI)/2*n*256]};
const level=()=>{try{return typeof gfSeaLevel==="function"?gfSeaLevel():0}catch(e){return 0}};
const G=()=>{try{return typeof amGlobe!=="undefined"&&amGlobe&&amGlobe.host&&amGlobe.host.isConnected&&typeof appMode!=="undefined"&&appMode==="allmaps"?amGlobe:null}catch(e){return null}};
function viewKey(g,lv){const{w,h}=g.size();return[lv,w,h,g.zoom.toFixed(4),g.rot[0].toFixed(3),g.rot[1].toFixed(3),g._flat?1:0,g._gfDl||0,(g._gfOx||0).toFixed(1),(g.roll&&g.roll()||0).toFixed(2)].join("|")}
/* the coarse ocean mask (the world grid's sea, filled from the open ocean): is this point in the sea? */
function oceanAt(ll){try{if(typeof GFE==="undefined"||!GFE.ready)return null;const m=GFE.ocean||(typeof gfOceanMask==="function"?gfOceanMask():null);if(!m)return null;const p=GLOBE_ROBINSON0(ll);if(!p)return null;
 const W=GFE.W,H=GFE.H,y=Math.floor((p[1]+6.688)/1014.376*H),x=Math.floor(p[0]/2e3*W);if(y<0||y>=H||x<0||x>=W)return null;return!!m[y*W+x]}catch(e){return null}}
/* is the coarse ocean mask's sea within a cell or two of this point? */
function oceanNear(ll){if(!ll)return false;for(const d of[0,.06,.12,.2])for(const[a,b]of[[0,0],[d,0],[-d,0],[0,d],[0,-d],[d,d],[-d,-d],[d,-d],[-d,d]]){if(!d&&(a||b))continue;if(oceanAt([ll[0]+a,ll[1]+b]))return true}return false}
/* the world grid's height at a point (NaN: unknown) and whether it is land */
function coarseAt(ll){try{if(typeof GFE==="undefined"||!GFE.ready)return NaN;const p=GLOBE_ROBINSON0(ll);if(!p)return NaN;const W=GFE.W,H=GFE.H,y=Math.floor((p[1]+6.688)/1014.376*H),x=Math.floor(p[0]/2e3*W);if(y<0||y>=H||x<0||x>=W)return NaN;const i=y*W+x;
 const v=GFE.land[i]&&GFE.zf?GFE.zf[i]:GFE.z[i];return GFE.land[i]?Math.max(v,.5):Math.min(v,-1)}catch(e){return NaN}}
let DBG={};let OV=null,job=0,timer=0,lastKey="";
async function build(g,key,lv){const id=++job;const{w,h}=g.size(),pr=g.projection(),STEP=2,GW=Math.ceil(w/STEP),GH=Math.ceil(h/STEP),N=GW*GH;
 const LL=new Array(N);let cx=0,cy=0,cn=0;const ctr=g._flat?null:[-g.rot[0],-g.rot[1]];
 for(let j=0;j<GH;j++)for(let i=0;i<GW;i++){let ll=null;try{ll=pr.invert([i*STEP+STEP/2,j*STEP+STEP/2])}catch(e){}
  if(ll&&isFinite(ll[0])&&isFinite(ll[1])&&Math.abs(ll[1])<85&&(!ctr||d3.geoDistance(ll,ctr)<Math.PI/2-.01)){LL[j*GW+i]=ll;cx+=ll[0];cy+=ll[1];cn++}}
 if(!cn)return null;
 /* detail to match the screen: one height sample per sample point, at most MAXT tiles */
 const kmPer=R_KM*STEP/pr.scale(),lat=cy/cn;let z=Math.max(3,Math.min(12,Math.round(Math.log2(40075*Math.cos(lat*Math.PI/180)/(256*kmPer)))+2));/* finer than the screen: true heights, not a smoothed average */
 /* only where it matters: low land (by the world grid) within reach of the new level; the rest is high ground or open sea */
 const CE=new Float32Array(N);for(let k=0;k<N;k++)CE[k]=LL[k]?coarseAt(LL[k]):NaN;
 const lowAt=k=>{const e=CE[k];return e!==e||(lv>0?(e>-30&&e<lv+40):(e<0&&e>lv-80))};
 const need=z=>{const S=new Set();for(let k=0;k<N;k++){const ll=LL[k];if(!ll||!lowAt(k))continue;const q=txy(ll,z);S.add(z+"/"+Math.floor(q[0]/256)+"/"+Math.floor(q[1]/256))}return S};
 /* as fine as the tile budget allows (the coarse tiles average heights: a 2 m Miami reads 9 m) */
 let S=need(z);while(S.size>MAXT&&z>3){z--;S=need(z)}while(z<11){const S2=need(z+1);if(S2.size>MAXT)break;z++;S=S2}
 /* the whole globe in view: the world grid does it */
 if(z<4)return null;
 DBG={z,tiles:S.size,t0:Date.now()};const T={};try{await Promise.all([...S].map(k=>tile(k).then(d=>{T[k]=d})))}catch(e){}
 DBG.loaded=Object.keys(T).length;DBG.ms=Date.now()-DBG.t0;if(id!==job){DBG.stale=1;return null}
 const n2=2**z,E=new Float32Array(N).fill(NaN);
 for(let k=0;k<N;k++){const ll=LL[k];if(!ll)continue;const q=txy(ll,z),tx=Math.floor(q[0]/256),ty=Math.floor(q[1]/256),d=T[z+"/"+((tx%n2)+n2)%n2+"/"+ty];if(!d){/* no detail fetched: high ground stays dry, open sea stays sea */E[k]=CE[k]===CE[k]?(CE[k]<0?CE[k]:(lv>0?Math.max(CE[k],lv+1e3):CE[k])):NaN;continue}
  const px=Math.min(255,Math.floor(q[0]-tx*256)),py=Math.min(255,Math.floor(q[1]-ty*256)),o=(py*256+px)*4;E[k]=d[o]*256+d[o+1]+d[o+2]/256-32768}
 const c=document.createElement("canvas");c.width=GW;c.height=GH;const x=c.getContext("2d"),D=x.createImageData(GW,GH),px=D.data;
 const sea=new Uint8Array(N);for(let k=0;k<N;k++){if(!(E[k]<=0.5))continue;const o=oceanAt(LL[k]);if(o)sea[k]=1}
 if(lv>0){/* flood from the sea through everything lower than the new level */
  const wet=new Uint8Array(N),Q=new Int32Array(N);let qh=0,qt=0;for(let k=0;k<N;k++)if(sea[k]){wet[k]=1;Q[qt++]=k}
  while(qh<qt){const k=Q[qh++],i=k%GW;for(const m of[i>0?k-1:-1,i<GW-1?k+1:-1,k-GW,k+GW]){if(m<0||m>=N||wet[m])continue;const e=E[m];if(e===e&&e<lv){wet[m]=2;Q[qt++]=m}}}
  for(let k=0;k<N;k++)if(wet[k]===2){const i=k%GW,dry=m=>m>=0&&m<N&&E[m]===E[m]&&!wet[m];const edge=(i>0&&dry(k-1))||(i<GW-1&&dry(k+1))||dry(k-GW)||dry(k+GW);
   const o=k*4;if(edge){px[o]=24;px[o+1]=84;px[o+2]=150;px[o+3]=255}else{px[o]=74;px[o+1]=158;px[o+2]=226;px[o+3]=215}}}
 else if(lv<0){/* the sea lowered: sea floor above the new level becomes land. The coarse ocean mask is about 10 km a
   cell, so the shallow water along today's coasts often lies in a cell it calls land: the sea is grown from the mask
   through every spot at or below today's sea level that joins it, or that band stayed blue between the land and the
   exposed shelf (and coarse islands left blue holes in it). Inland lows (the Caspian, the Dead Sea) are not joined. */
  const Q=new Int32Array(N);let qh=0,qt=0;for(let k=0;k<N;k++)if(sea[k])Q[qt++]=k;
  if(!qt)/* zoomed in on a coast that the coarse mask counts as land: seed from the open sea close by */
   for(let k=0;k<N;k++)if(E[k]<=0.5&&oceanNear(LL[k])){sea[k]=1;Q[qt++]=k}
  while(qh<qt){const k=Q[qh++],i=k%GW;for(const m of[i>0?k-1:-1,i<GW-1?k+1:-1,k-GW,k+GW]){if(m<0||m>=N||sea[m]||!(E[m]<=0.5))continue;sea[m]=1;Q[qt++]=m}}
  for(let k=0;k<N;k++)if(sea[k]&&E[k]>=lv){const o=k*4;px[o]=214;px[o+1]=196;px[o+2]=140;px[o+3]=235}
  /* the map's own coastline lies a sample or so off the heights' one: the low shore next to the exposed floor is
     drawn as floor too, or a thin blue line of today's sea stays between them */
  const fl=k=>k>=0&&k<N&&sea[k]&&E[k]>=lv;
  for(let k=0;k<N;k++){if(sea[k]||!(E[k]<8))continue;const i=k%GW;if((i>0&&fl(k-1))||(i<GW-1&&fl(k+1))||fl(k-GW)||fl(k+GW)){const o=k*4;px[o]=214;px[o+1]=196;px[o+2]=140;px[o+3]=235}}}
 DBG.probe=ll=>{const q=pr(ll);if(!q)return null;const k=Math.floor(q[1]/STEP)*GW+Math.floor(q[0]/STEP);return{k,E:E[k],CE:CE[k],sea:sea[k],ll:LL[k],a:px[k*4+3]}};
 x.putImageData(D,0,0);return{key,c,z}}
function schedule(){clearTimeout(timer);timer=setTimeout(async()=>{const g=G(),lv=level();if(!g||!lv){OV=null;return}const key=viewKey(g,lv);if(OV&&OV.key===key)return;
  try{if(typeof gfElev==="function"&&typeof GFE!=="undefined"&&!GFE.ready){gfElev(()=>schedule());return}}catch(e){}
  const r=await build(g,key,lv);if(r&&viewKey(g,level())===r.key){OV=r;try{g.request?g.request():g.render()}catch(e){}}else if(!r&&key===viewKey(g,level())){OV=null}},350)}
/* drawn over everything the map paints, once the map has been still and the heights are in */
const _r=GlobeView.prototype.render;GlobeView.prototype.render=function(){const cfg=this.cfg;
 if(typeof amGlobe!=="undefined"&&this===amGlobe&&cfg&&!cfg._gfsf){cfg._gfsf=1;const d0=cfg.drawExtra;cfg.drawExtra=(ctx,p,g)=>{if(d0)d0(ctx,p,g);try{draw(ctx)}catch(e){}}}return _r.apply(this,arguments)};
function draw(ctx){const g=G();if(!g)return;const lv=level();if(!lv){OV=null;return}const key=viewKey(g,lv);if(key!==lastKey){lastKey=key;schedule()}
 if(!OV||OV.key!==key)return;const{w,h}=g.size();ctx.save();ctx.imageSmoothingEnabled=true;ctx.drawImage(OV.c,0,0,w,h);ctx.restore()}
window.gfSeaFine={state:()=>OV&&{key:OV.key,z:OV.z},dbg:()=>DBG};
})();
