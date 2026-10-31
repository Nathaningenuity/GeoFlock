/* GeoFlock: map fixes.
   1. Spun flat maps: the raster is redrawn in strips, and where a strip meets the old 180° edge it samples the rim of the
      source picture, which fades to transparent, leaving a dotted line. Before a picture is used for spinning, each row's
      edge colour is carried a few pixels out past the rim, so the edge is solid wherever it is sampled.
   2. Zoomed-in outlines: Åland's detailed outline has every skerry (about 6,000 points, more than all of Sweden), so next to the
      Swedish and Finnish coasts it looked far sharper than its neighbours. It is thinned to the same level of detail. */
(function(){
if(typeof spinImg==="function"){const _si=spinImg,done=new Map();
 spinImg=function(href){if(done.has(href))return done.get(href);const p=_si.apply(this,arguments).then(im=>{try{return padEdges(im)}catch(e){console.error(e);return im}});done.set(href,p);return p}}
function padEdges(im){const W=im.naturalWidth||im.width,H=im.naturalHeight||im.height;if(!W||!H)return im;
 const c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d",{willReadFrequently:true});x.drawImage(im,0,0);
 /* the oval's rim lies in the outer quarter on each side (Robinson is about half as wide at the poles) */
 /* rows whose rim is not solid picture (for example a see-through gap) are left alone, below */
 const S=Math.ceil(W*.27),P=10;
 [[0,S,1],[W-S,S,-1]].forEach(([x0,w,dir])=>{const D=x.getImageData(x0,0,w,H),d=D.data;
  for(let y=0;y<H;y++){const row=y*w*4;let e=-1;
   if(dir===1){for(let i=0;i<w;i++)if(d[row+i*4+3]>=250){e=i;break}}else{for(let i=w-1;i>=0;i--)if(d[row+i*4+3]>=250){e=i;break}}
   if(e<0)continue;/* the outermost opaque pixels are often darkened by smoothing too: take the colour from a little way in */const ii=e+dir*9;if(ii<0||ii>=w)continue;{let solid=true;for(let k=0;k<=12;k++){const j=e+dir*k;if(j<0||j>=w||d[row+j*4+3]<250){solid=false;break}}if(!solid)continue}const o=row+ii*4;for(let k=0;k<8;k++){const q=row+(e+dir*k)*4;d[q]=d[o];d[q+1]=d[o+1];d[q+2]=d[o+2];d[q+3]=255}
   for(let k=1;k<=P;k++){const i=e-dir*k;if(i<0||i>=w)break;const q=row+i*4;d[q]=d[o];d[q+1]=d[o+1];d[q+2]=d[o+2];d[q+3]=255}}
  x.putImageData(D,x0,0)});
 c.naturalWidth=W;c.naturalHeight=H;return c}
})();
/* 2. Places region frames: the world, Europe, Asia and Africa use the standard frame (0° in the middle, cut at the 180° meridian);
      the Americas sit in the middle (cut through Asia, at 100°E); Oceania keeps its own Pacific-centred frame. */
(function(){function hook(){if(window._gfSpinRegions||typeof spinRegionDl!=="function")return;window._gfSpinRegions=1;const _s=spinRegionDl;
 spinRegionDl=function(){try{const r=typeof activeRegion==="undefined"?"All":activeRegion;if(r==="Americas"||r==="North America"||r==="South America")return 80;if(r==="Oceania")return _s.apply(this,arguments);return 0}catch(e){}return _s.apply(this,arguments)}}
 hook();document.addEventListener("DOMContentLoaded",hook);setTimeout(hook,1000)})();
/* 3. Tour stops that are about clouds show them even if the Clouds switch was turned off earlier */
(function(){if(typeof cloudsOn!=="function")return;const _c=cloudsOn;
 cloudsOn=function(){try{if(typeof ps!=="undefined"&&ps&&(psSteps()[ps.i]||{}).clouds){if(typeof cloudsLoad==="function")cloudsLoad();return true}}catch(e){}return _c.apply(this,arguments)}})();
/* 4. Picking a region (in Places or Capitals) gives that region's frame again, even if the map was dragged sideways earlier */
(function(){if(typeof bboxForActiveSelection!=="function")return;let last=null;const _b=bboxForActiveSelection;
 bboxForActiveSelection=function(){try{const r=(typeof activeRegion==="undefined"?"All":activeRegion)+"|"+(typeof activeSub==="undefined"?"":activeSub);if(r!==last){last=r;if(typeof spinUser!=="undefined"&&spinUser.W&&!(typeof spinQuizOn==="function"&&spinQuizOn())){spinUser.W=false;const want=spinRegionDl();if(Math.abs(SPIN.W.dl-want)>1e-6)spinTo("W",want);try{spinHomeSync()}catch(e){}}}}catch(e){console.error(e)}return _b.apply(this,arguments)}})();
document.addEventListener("click",e=>{try{if(e.target.closest&&e.target.closest("#regionRow .chip")&&typeof spinUser!=="undefined")spinUser.W=false}catch(_){}},true);
/* 5. Satellite: rivers and lakes can be switched on (hover names them) but start off, and stay off in tours,
      since they can't be seen from space */
(function(){try{
 if(typeof ALLMAPS_MODE_DEFAULTS!=="undefined"&&ALLMAPS_MODE_DEFAULTS.satellite)ALLMAPS_MODE_DEFAULTS.satellite.rivers=false;
 if(typeof allMapsRiversByMode!=="undefined")allMapsRiversByMode.satellite=false;
 if(typeof ALLMAPS_LAKES_DEFAULT!=="undefined")ALLMAPS_LAKES_DEFAULT.satellite=false;
 if(typeof ALLMAPS_RIVER_HOVER_MODES!=="undefined")ALLMAPS_RIVER_HOVER_MODES.add("satellite");
 const inSatTour=()=>typeof ps!=="undefined"&&ps&&typeof allMapsColorMode!=="undefined"&&allMapsColorMode==="satellite";
 if(typeof allMapsRiversOn==="function"){const _r=allMapsRiversOn;allMapsRiversOn=function(){return inSatTour()?false:_r.apply(this,arguments)}}
 if(typeof allMapsLakesOn==="function"){const _l=allMapsLakesOn;allMapsLakesOn=function(){return inSatTour()?false:_l.apply(this,arguments)}}
 /* re-apply when a tour starts or ends */
 const re=()=>setTimeout(()=>{try{const w=document.getElementById("allMapsWrap");if(typeof applyAllMapsLakesBorders==="function")applyAllMapsLakesBorders(w);if(w)w.classList.toggle("rivers-hidden",!allMapsRiversOn());const t=document.getElementById("allMapsRiversToggle");if(t)t.checked=allMapsRiversOn();if(typeof amGlobe!=="undefined"&&amGlobe)(amGlobe.request||amGlobe.render).call(amGlobe)}catch(e){}},60);
 if(typeof psLaunchTour==="function"){const _p=psLaunchTour;psLaunchTour=function(){const r=_p.apply(this,arguments);re();return r}}
 if(typeof psEnd==="function"){const _e=psEnd;psEnd=function(){const r=_e.apply(this,arguments);re();return r}}
}catch(e){console.error(e)}})();
/* 6. A hovered lake stays blue: a clear, slightly deeper blue with its outline, instead of the near-clear tint that let the
      land picture underneath show through */
(function(){const st=document.createElement("style");st.textContent=`
html:root body :is(#allMapsWrap,#atlasStudyMapWrap,#worldMapWrap,#gfNoSuchId,.map-wrap) svg path:is(.map-lake,.map-lake-minor):is(.lake-hover,:hover){ fill:rgba(88,158,222,.72) !important; fill-opacity:1 !important; filter:none !important; stroke:#0f4f86 !important; stroke-width:1.4px !important; vector-effect:non-scaling-stroke; }
html:root body :is(#allMapsWrap,#atlasStudyMapWrap,#worldMapWrap,#gfNoSuchId,.map-wrap).sat-mode svg path:is(.map-lake,.map-lake-minor):is(.lake-hover,:hover){ fill:rgba(40,96,170,.82) !important; stroke:#cfe9ff !important; stroke-width:1.6px !important; }
html:root body #allMapsWrap.sat-mode svg path.water-casing{ stroke:rgba(10,30,60,.55) !important; stroke-width:2.5px !important; }`;document.head.appendChild(st)/* 2. */
const THIN={"Åland":{tol:.0045,minKm2:.4}};
function dp(R,tol){/* Douglas–Peucker on a closed ring, in degrees with longitude scaled by cos(latitude) */
 if(R.length<=4)return R;const c=Math.cos(R[0][1]*Math.PI/180),keep=new Uint8Array(R.length);keep[0]=keep[R.length-1]=1;
 const st=[[0,R.length-1]];while(st.length){const[a,b]=st.pop();let m=-1,md=0;const ax=R[a][0]*c,ay=R[a][1],bx=R[b][0]*c,by=R[b][1],dx=bx-ax,dy=by-ay,L=dx*dx+dy*dy;
  for(let i=a+1;i<b;i++){const px=R[i][0]*c,py=R[i][1];let t=L?((px-ax)*dx+(py-ay)*dy)/L:0;t=Math.max(0,Math.min(1,t));const ex=ax+t*dx-px,ey=ay+t*dy-py,d=ex*ex+ey*ey;if(d>md){md=d;m=i}}
  if(m>0&&md>tol*tol){keep[m]=1;st.push([a,m],[m,b])}}
 const out=R.filter((_,i)=>keep[i]);return out.length>=4?out:null}
function thin(G,o){const sr=o.minKm2/(6371*6371);G.coordinates=G.coordinates.map(P=>{if(d3.geoArea({type:"Polygon",coordinates:[P[0]]})<sr)return null;const Q=P.map(R=>dp(R,o.tol)).filter(Boolean);return Q.length?Q:null}).filter(Boolean)}
if(typeof hi10Load==="function"){const _hl=hi10Load;
 hi10Load=function(){return _hl.apply(this,arguments).then(H=>{if(H&&!H._thin){H._thin=1;try{let n=0;
  Object.entries(THIN).forEach(([name,o])=>{const f=H.byN.get(name);if(f){thin(f.geometry,o);n++;H.d&&H.d.delete&&H.d.delete(name);H.box&&H.box.delete&&H.box.delete(name)}});
  if(n){if(H.d&&H.d.clear)H.d.clear();HI10_GLOBES.forEach(g=>{try{if(g.host&&g.host.isConnected)g.render()}catch(e){}});hiWatched.forEach(w=>{try{if(w.isConnected)hi10Flat(w)}catch(e){}})}
 }catch(e){console.error(e)}}return H})}}
/* 3. */
function holes(L){if(!L||L._holes||L.type!=="MultiPolygon")return;L._holes=1;
 const rings=L.coordinates.map(p=>p[0]).filter(r=>r&&r.length>3);if(rings.length<2)return;
 const poly=r=>globeOrientPoly([r]);const P=rings.map(poly);
 /* depth = how many other rings contain this one; even depth = shore, odd = island */
 const inside=(i,j)=>{try{return d3.geoContains(P[j],rings[i][0])&&d3.geoArea(P[j])>d3.geoArea(P[i])}catch(e){return false}};
 const par=rings.map((_,i)=>{let best=-1,ba=Infinity;rings.forEach((_,j)=>{if(i!==j&&inside(i,j)){const a=d3.geoArea(P[j]);if(a<ba){ba=a;best=j}}});return best});
 const depth=i=>{let d=0,k=par[i];while(k>=0&&d<9){d++;k=par[k]}return d};
 const out=[];rings.forEach((r,i)=>{if(depth(i)%2)return;const hs=rings.map((h,j)=>par[j]===i&&depth(j)%2?P[j].coordinates[0].slice().reverse():null).filter(Boolean);
  const g={type:"Polygon",coordinates:[P[i].coordinates[0]].concat(hs)};if(d3.geoArea(g)>2*Math.PI)g.coordinates=g.coordinates.map(x=>x.slice().reverse());out.push(g.coordinates)});
 if(out.length)L.coordinates=out}
if(typeof globeOverlays==="function"){const _go=globeOverlays;
 /* each lake becomes a new object: anything already cached for the old one (simplified globe shapes, flat-map paths drawn
    before this script loaded) was cut with its islands as separate filled shapes, and must not be reused */
 globeOverlays=function(){const O=_go.apply(this,arguments);try{if(O&&O.lakes&&!O._lakeHoles){O._lakeHoles=1;O.lakes=O.lakes.map(L=>{if(!L||L.type!=="MultiPolygon")return L;const N=Object.assign({},L,{coordinates:L.coordinates.slice()});holes(N);return N})}}catch(e){console.error(e)}return O}}
const lk=document.createElement("style");lk.textContent="svg path:is(.map-lake,.map-lake-minor,.map-lake-hit){ fill-rule:evenodd; }";document.head.appendChild(lk);
/* 4. */
if(typeof gfGlobeKey==="function"){const VG={key:null,sig:null,busy:false,n:0};const _gk=gfGlobeKey;
 const mk=(w,h)=>{const c=document.createElement("canvas");c.width=w;c.height=h;return c};
 /* the shading layers are in the flat map's frame; re-sample them once onto a longitude/latitude grid */
 const toEq=src=>{const W=GFG.W,H=GFG.H,lut=gfGlobeLut(),S=src.getContext("2d").getImageData(0,0,src.width,src.height).data,c=mk(W,H),x=c.getContext("2d"),D=x.createImageData(W,H),d=D.data;
  for(let i=0,j=0;i<W*H;i++,j+=4){const k=lut[i]*4;if(k<0)continue;d[j]=S[k];d[j+1]=S[k+1];d[j+2]=S[k+2];d[j+3]=S[k+3]}x.putImageData(D,0,0);return c};
 function build(sig){const imgs=globeImages("relief",()=>gfGlobeDirty());if(!imgs||imgs.length!==2){VG.busy=false;return}
  const eqS=toEq(GFL.canv.shade),eqL=GFL.canv.light?toEq(GFL.canv.light):null,W=GFG.W,H=GFG.H;
  const out=imgs.map((im,h)=>{const iw=im.naturalWidth||im.width,ih=im.naturalHeight||im.height,c=mk(iw,ih),x=c.getContext("2d");x.drawImage(im,0,0,iw,ih);x.imageSmoothingEnabled=true;x.imageSmoothingQuality="high";
   x.globalCompositeOperation="multiply";x.drawImage(eqS,h*W/2,0,W/2,H,0,0,iw,ih);if(eqL){x.globalCompositeOperation="screen";x.drawImage(eqL,h*W/2,0,W/2,H,0,0,iw,ih)}x.globalCompositeOperation="source-over";return c});
  /* the two halves meet at 0° and 180°: ease each edge toward the other so no seam line shows */
  const join=(L,R,S)=>{const H=L.height,cl=L.getContext("2d"),cr=R.getContext("2d"),A=cl.getImageData(L.width-S,0,S,H),B=cr.getImageData(0,0,S,H),a=A.data,b=B.data,d=new Float32Array(H*3);
   for(let y=0;y<H;y++)for(let c=0;c<3;c++){let s=0,k=0;for(let yy=Math.max(0,y-2);yy<=Math.min(H-1,y+2);yy++)for(let x=0;x<3;x++){s+=a[(yy*S+S-1-x)*4+c]-b[(yy*S+x)*4+c];k++}d[y*3+c]=s/k/2}
   for(let y=0;y<H;y++)for(let x=0;x<S;x++){const w=1-x/S;for(let c=0;c<3;c++){a[(y*S+S-1-x)*4+c]-=d[y*3+c]*w;b[(y*S+x)*4+c]+=d[y*3+c]*w}}cl.putImageData(A,L.width-S,0);cr.putImageData(B,0,0)};
  try{join(out[0],out[1],24);join(out[1],out[0],24)}catch(e){}
  out._seam=true;const old=VG.key,key="gfRelShade"+ ++VG.n;GLOBE_TEX[key]={kind:"halves",src:[]};_globeImgs[key]={cbs:[],ready:true,imgs:out};VG.key=key;VG.sig=sig;VG.busy=false;
  if(old){try{const g=amGlobe&&amGlobe.gl;if(g&&g.tex[old]){(g.tex[old].list||[g.tex[old]]).forEach(t=>{try{g.gl.deleteTexture(t)}catch(e){}});delete g.tex[old]}}catch(e){}delete _globeImgs[old];delete GLOBE_TEX[old]}
  try{amGlobe&&(amGlobe.request?amGlobe.request():amGlobe.render())}catch(e){}}
 gfGlobeKey=function(){try{const M=gfMS();
  /* the plain relief with hill shading: the full-resolution texture with the shading laid smoothly over it */
  if(allMapsColorMode==="relief"&&!gfStyleGen()&&M.style!=="classic"&&!gfSeaLevel()&&M.shadeB>.02){const sk=M.sun+"|"+M.shadeB;
   if(!(GFL.canv.shade&&GFL.shadeKey===sk)){try{gfMsRefresh()}catch(e){}clearTimeout(VG.t);VG.t=setTimeout(gfGlobeDirty,700);return VG.key}
   if(VG.sig===sk&&VG.key)return VG.key;if(!VG.busy){VG.busy=true;setTimeout(()=>{try{gfElev(()=>{try{build(sk)}catch(e){console.error(e);VG.busy=false}})}catch(e){VG.busy=false}},30)}return VG.key}}catch(e){}
  return _gk.apply(this,arguments)}}
/* 5. */
if(typeof flatLabelsLikeGlobe==="function"&&window.SVGGraphicsElement){const BB=new WeakMap();let on=0;const _gb=SVGGraphicsElement.prototype.getBBox;
 SVGGraphicsElement.prototype.getBBox=function(){if(!on||this.tagName!=="path")return _gb.apply(this,arguments);const d=this.getAttribute("d"),c=BB.get(this);if(c&&c.d===d)return c.b;const b=_gb.apply(this,arguments);BB.set(this,{d,b});return b};
 const _fl=flatLabelsLikeGlobe;const full=function(w){on++;try{return _fl.call(this,w)}finally{on--}};
 const vbw=svg=>{const v=(svg.getAttribute("viewBox")||"").split(/[ ,]+/).map(Number);return v.length===4?v[2]:0};
 flatLabelsLikeGlobe=function(wrapEl){const svg=wrapEl&&wrapEl.querySelector&&wrapEl.querySelector("svg");if(!svg)return full.apply(this,arguments);
  const now=performance.now(),w=vbw(svg),last=wrapEl._gfLblW;
  if(last&&w&&Math.abs(w-last)>1e-6*w){
   /* mid-gesture: keep every label the same size on screen, then lay out properly once things settle */
   const r=w/last;svg.querySelectorAll("text.map-label").forEach(t=>{const f=parseFloat(t.getAttribute("font-size"));if(f)t.setAttribute("font-size",(f*r).toFixed(3));const sw=parseFloat(t.style.strokeWidth);if(sw)t.style.strokeWidth=(sw*r).toFixed(4)+"px"});
   wrapEl._gfLblW=w;wrapEl._gfLblT=now;clearTimeout(wrapEl._gfLblTo);wrapEl._gfLblTo=setTimeout(()=>{full(wrapEl)},320);return}
  wrapEl._gfLblW=w;wrapEl._gfLblT=now;return full.apply(this,arguments)}}
if(typeof climComposite==="function"){const _cc=climComposite;climComposite=function(){try{if(typeof allMapsColorMode!=="undefined"&&allMapsColorMode!=="climate")return null}catch(e){}return _cc.apply(this,arguments)}}
/* 6b. Flat-map gestures move a finished picture instead of redrawing every shape each step: a zoom-in stretches what is drawn,
      and a pan or zoom-out draws the map once with half a screen of margin all round and slides it. The live map is redrawn
      when the button or finger is let go. */
(function(){const SA=Element.prototype.setAttribute,GA=Element.prototype.getAttribute,GR=Element.prototype.getBoundingClientRect;
 const parse=v=>{const a=String(v||"").split(/[ ,]+/).map(Number);return a.length===4&&a.every(isFinite)&&a[2]>0?a:null};
 function fast(svg){if(svg._gfFast)return;svg._gfFast=1;let pend=null,cur=null,rect=null,t=0,first=0,ex=0;const M=.5;
  /* the transform lives in a stylesheet rule, so no attribute changes (other code watches the map's attributes) */
  const wrap=svg.parentNode,id=wrap.id,st=document.createElement("style");st.textContent="#"+id+" > svg{}#"+id+"{}";document.head.appendChild(st);const rule=st.sheet.cssRules[0].style,wrule=st.sheet.cssRules[1].style;
  const unexpand=()=>{if(!ex)return;ex=0;["position","left","top","width","height","max-width","max-height"].forEach(k=>rule.removeProperty(k));["height","box-sizing"].forEach(k=>wrule.removeProperty(k))};
  const reset=()=>{pend=null;svg._gfPend=false;rect=null;rule.transform="";rule.willChange="";unexpand();clearTimeout(t);t=0;if(window.gfSnapHide)gfSnapHide(svg)};
  const commit=()=>{clearTimeout(t);t=0;if(!pend)return;const v=pend;reset();measure();SA.call(svg,"viewBox",v.join(" "));cur=v;const h=svg._gfHeld;svg._gfHeld=null;if(h)try{h[0].apply(h[1],h[2])}catch(e){console.error(e)}};
  /* shows box b by sliding/stretching what is drawn (the drawn box is cur plus a margin of ex on every side) */
  const place=b=>{const W=rect.width,H=rect.height,u=W/cur[2],s=cur[2]/b[2];
   rule.transformOrigin="0 0";rule.willChange="transform";rule.transform="translate("+(ex*W-s*((b[0]-cur[0])*u+ex*W))+"px,"+(ex*H-s*((b[1]-cur[1])*u+ex*H))+"px) scale("+s+")"};
  /* a pan or zoom-out would uncover blank map, so the map is drawn once with a wide margin around b, then slid */
  const expand=b=>{const W=rect.width,H=rect.height,k=1+2*M,imp=(k2,v)=>rule.setProperty(k2,v,"important");ex=M;cur=b;
   wrule.setProperty("box-sizing","border-box","important");wrule.setProperty("height",rect._ph+"px","important");
   imp("position","absolute");imp("left",(rect.left-rect._pl-rect._bl-M*W)+"px");imp("top",(rect.top-rect._pt-rect._bt-M*H)+"px");imp("width",k*W+"px");imp("height",k*H+"px");imp("max-width","none");imp("max-height","none");
   SA.call(svg,"viewBox",[b[0]-M*b[2],b[1]-M*b[3],k*b[2],k*b[3]].join(" "));place(b)};
  svg.setAttribute=function(n,v){if(n!=="viewBox")return SA.apply(this,arguments);const b=parse(v);if(!b){commit();return SA.apply(this,arguments)}
   if(!cur)cur=parse(GA.call(svg,"viewBox"));if(!cur||!svg.isConnected||!svg.getClientRects().length){reset();cur=b;return SA.apply(this,arguments)}
   const now=performance.now();if(!pend){first=now;rect=box0}if(!rect||!rect.width){reset();cur=b;return SA.apply(this,arguments)}
   const e=1e-6,dx=ex*cur[2],dy=ex*cur[3],inside=b[0]>=cur[0]-dx-e&&b[1]>=cur[1]-dy-e&&b[0]+b[2]<=cur[0]+cur[2]+dx+e&&b[1]+b[3]<=cur[1]+cur[3]+dy+e;
   pend=b;svg._gfPend=true;if(!(window.gfSnapDraw&&gfSnapDraw(svg,b,rect)))if(inside)place(b);else expand(b);
   clearTimeout(t);if(now-first>600&&cur[2]/b[2]>1.25)commit();else t=setTimeout(later,170)};
  /* while a finger or button is still down the picture keeps sliding; the live map returns once it is let go */
  let down=0;const later=()=>{if(down)t=setTimeout(later,120);else commit()};
  wrap.addEventListener("pointerdown",()=>{down=1},true);["pointerup","pointercancel"].forEach(n=>addEventListener(n,()=>{if(!down)return;down=0;if(pend){clearTimeout(t);t=setTimeout(commit,90)}},true));
  let box0=null;const measure=()=>requestAnimationFrame(()=>{if(pend)return;const r=GR.call(svg),p=GR.call(wrap);box0={left:r.left,top:r.top,width:r.width,height:r.height,_pl:p.left,_pt:p.top,_bl:wrap.clientLeft,_bt:wrap.clientTop,_ph:wrap.offsetHeight}});
  try{new ResizeObserver(measure).observe(svg)}catch(e){}measure();
  svg.getAttribute=function(n){if(n==="viewBox"&&pend)return pend.join(" ");return GA.apply(this,arguments)};
  /* while transformed, the map keeps reporting its untransformed box, so pointer maths stays right */
  const CTM=svg.getScreenCTM;svg.getScreenCTM=function(){if(pend&&rect){const r=this.getBoundingClientRect(),k=r.width/pend[2];return new DOMMatrix([k,0,0,k,r.left-pend[0]*k,r.top-pend[1]*k])}return CTM.call(this)};
  svg.getBoundingClientRect=function(){if(pend&&rect){const r=GR.call(wrap);return new DOMRect(rect.left+(r.left-rect._pl),rect.top+(r.top-rect._pt),rect.width,rect.height)}return GR.call(this)}}
 /* zoom callbacks (border widths, label sizes, detailed coasts) change the drawing, so they wait for the commit */
 if(typeof attachMapPanZoom==="function"){const _ap=attachMapPanZoom;attachMapPanZoom=function(wrapEl,box,cb){if(typeof cb!=="function"||!wrapEl||!/^(allMapsWrap|atlasStudyMapWrap)$/.test(wrapEl.id))return _ap.apply(this,arguments);
  const held=function(){const svg=wrapEl.querySelector("svg");if(svg&&svg._gfPend){svg._gfHeld=[cb,this,arguments];return}return cb.apply(this,arguments)};return _ap.call(this,wrapEl,box,held,...[].slice.call(arguments,3))}}
 const scan=()=>document.querySelectorAll("#allMapsWrap > svg, #atlasStudyMapWrap > svg").forEach(fast);
 let q=0;new MutationObserver(()=>{if(!q)q=setTimeout(()=>{q=0;scan()},300)}).observe(document.documentElement,{childList:true,subtree:true});scan()})();
/* 7. */
if(typeof gfSubFlat==="function"){const _sf=gfSubFlat;
 gfSubFlat=function(){try{const host=document.getElementById("allMapsSubModes"),view=document.getElementById("allMapsView");if(!host||!view)return;
  const row=view.querySelector(".all-maps-label-controls"),srch=row&&row.querySelector(":scope > .global-search-wrap");
  /* flat map and globe alike (on wide screens) */
  const flat=appMode==="allmaps"&&window.innerWidth>760&&!document.querySelector("#gfDeep:not([hidden])");
  if(flat&&row&&host.children.length){
   /* its own line under the switches, in the gap above the map */
   if(host.parentNode!==row||host.nextElementSibling)row.appendChild(host);
   host.classList.add("gf-sub-inrow");["gf-sub-top","gf-sub-flat","am-sub-top","am-sub-globe","am-sub-row","am-sub-left","map-submode-overlay"].forEach(c=>host.classList.remove(c));
   if(host.style.left)host.style.left="";if(host.style.top)host.style.top="";if(host.style.visibility)host.style.visibility="";host.classList.remove("gf-sub-dd");return}
  host.classList.remove("gf-sub-inrow");if(host.parentNode===row){const wrap=document.getElementById("allMapsWrap");if(wrap)wrap.parentNode.insertBefore(host,wrap)}}catch(e){console.error(e)}return _sf.apply(this,arguments)};
 /* chips if they fit on the search box's line, else one pill with a menu */
 const NW=new Map();
 function fit(host,row,srch){const chips=[...host.querySelectorAll(":scope > .chip")];if(!chips.length)return;const key=chips.map(c=>c.textContent).join("|");
  if(!host.classList.contains("gf-sub-dd")){NW.set(key,host.scrollWidth)}
  const nat=NW.get(key);const sr=srch?srch.getBoundingClientRect():null;if(!sr||!sr.width)return;
  let prev=host.previousElementSibling;while(prev&&!prev.getClientRects().length)prev=prev.previousElementSibling;
  const pr=prev?prev.getBoundingClientRect():null,rr=row.getBoundingClientRect();
  /* room left on the last toggle's line once the search box is there too */
  const avail=rr.right-(pr?pr.right:rr.left)-sr.width-30;
  const dd=!nat||nat>avail;host.classList.toggle("gf-sub-dd",dd);if(!dd)closeMenu()}
 let menu=null;const closeMenu=()=>{if(menu){menu.remove();menu=null}};
 document.addEventListener("click",e=>{const host=document.getElementById("allMapsSubModes");const c=e.target.closest&&e.target.closest("#allMapsSubModes.gf-sub-dd > .chip.active");
  if(c){e.preventDefault();e.stopPropagation();if(menu){closeMenu();return}
   menu=document.createElement("div");menu.className="gf-sub-menu";menu.setAttribute("role","menu");
   [...host.querySelectorAll(":scope > .chip")].forEach(ch=>{const b=document.createElement("button");b.type="button";b.setAttribute("role","menuitem");b.textContent=ch.textContent;if(ch.classList.contains("active"))b.className="on";b.onclick=ev=>{ev.stopPropagation();closeMenu();ch.click()};menu.appendChild(b)});
   document.body.appendChild(menu);const r=c.getBoundingClientRect();menu.style.left=Math.max(8,Math.min(innerWidth-menu.offsetWidth-8,r.left))+scrollX+"px";menu.style.top=r.bottom+6+scrollY+"px";return}
  if(menu&&!e.target.closest(".gf-sub-menu"))closeMenu()},true);
 document.addEventListener("keydown",e=>{if(e.key==="Escape")closeMenu()});addEventListener("resize",closeMenu);
 /* the globe used to move the choices into a column at its left: on wide screens they stay in the row */
 if(typeof amSubOffGlobe==="function"){const _so=amSubOffGlobe;amSubOffGlobe=function(){if(appMode==="allmaps"&&window.innerWidth>760)return;return _so.apply(this,arguments)}}
 if(typeof amPlaceSubModes==="function"){const _pm=amPlaceSubModes;amPlaceSubModes=function(){if(appMode==="allmaps"&&window.innerWidth>760){try{gfSubFlat()}catch(e){}return}return _pm.apply(this,arguments)}}
 const st=document.createElement("style");st.textContent=`
 #allMapsSubModes.gf-sub-dd > .chip:not(.active){ display:none !important; }
 #allMapsSubModes.gf-sub-dd > .chip.active::after{ content:" ▾"; font-size:.85em; opacity:.85; }
 .gf-sub-menu{ position:absolute; z-index:9500; display:flex; flex-direction:column; gap:2px; padding:5px; border-radius:14px; background:#fff; box-shadow:0 8px 28px rgba(20,40,70,.22); min-width:180px; }
 .gf-sub-menu button{ text-align:left; border:0; background:none; padding:8px 12px; border-radius:9px; font:600 13px inherit; color:#1d3550; cursor:pointer; }
 .gf-sub-menu button:hover{ background:#eef4f8; } .gf-sub-menu button.on{ background:#3f9c96; color:#fff; }
 body.dark-theme .gf-sub-menu{ background:#1d2638; } body.dark-theme .gf-sub-menu button{ color:#e6edf7; } body.dark-theme .gf-sub-menu button:hover{ background:#2a3550; }
 .all-maps-label-controls:has(> #allMapsSubModes.gf-sub-inrow){ position:relative; }
 #allMapsSubModes.gf-sub-inrow{ position:absolute !important; left:0; right:0; top:calc(100% - 6px); display:flex !important; flex-direction:row; flex-wrap:nowrap; justify-content:center; align-items:center; gap:8px; margin:0 !important; padding:0; width:auto; max-width:none; background:none; box-shadow:none; transform:none !important; z-index:4; }
 @media (min-width:761px){ }
 #allMapsSubModes.gf-sub-inrow .chip{ background:rgba(255,255,255,.7) !important; box-shadow:0 1px 4px rgba(20,40,70,.1) !important; }
 #allMapsSubModes.gf-sub-inrow .chip.active{ background:#3f9c96 !important; color:#fff !important; }
 #allMapsSubModes.gf-sub-inrow .chip{ font-size:11.5px; padding:4px 11px; min-height:0; line-height:1.2; border:none; box-shadow:none; white-space:nowrap; margin:0; }
 body.dark-theme #allMapsSubModes.gf-sub-inrow{ background:rgba(20,28,44,.6); }`;document.head.appendChild(st)}
/* 8. */
try{if(typeof PS_ICONS!=="undefined"&&PS_ICONS.waterfall&&!/^<g transform="matrix\(-1/.test(PS_ICONS.waterfall))PS_ICONS.waterfall='<g transform="matrix(-1 0 0 1 24 0)">'+PS_ICONS.waterfall+"</g>"}catch(e){}
/* 9. */
if(typeof elevationLegendHTML==="function"){const _el=elevationLegendHTML;
 elevationLegendHTML=function(){let h=_el.apply(this,arguments);try{
  const at=i=>(i/(ELEV_LAND_STOPS.length-1)*100).toFixed(1);
  h=h.replace(/<span class="legend-ticks legend-ticks-at">[\s\S]*?<\/span>/,'<span class="legend-ticks legend-ticks-at"><i style="left:0%">0 m</i><i style="left:'+at(5)+'%">1,200</i><i style="left:100%">7,000 m</i></span>');
  h=h.replace(/<span class="legend-ticks"><i>&minus;11,000 m<\/i>[\s\S]*?<\/span>/,'<span class="legend-ticks"><i>&minus;11,000 m</i><i>&minus;4,000</i><i>0</i></span>');
  let n=0;h=h.replace(/<span class="legend-scale">/g,m=>'<span class="gf-el-sub">'+(n++?"Sea depth":"Land height")+"</span>"+m.replace('class="legend-scale"','class="legend-scale gf-el-scale"'));
 }catch(e){}return h}
 const st=document.createElement("style");st.textContent=`
 .gf-el-sub{ display:block; font-size:11px; font-weight:700; letter-spacing:.04em; text-transform:uppercase; opacity:.62; margin:10px 0 4px; }
 .gf-el-sub:first-of-type{ margin-top:6px; }
 .legend-scale.gf-el-scale{ display:block; margin-bottom:4px; }
 .legend-scale.gf-el-scale .legend-ticks{ margin-top:4px; }
 .legend-scale.gf-el-scale .legend-ticks-at i:first-child{ transform:none !important; }
 .legend-scale.gf-el-scale .legend-ticks-at i:last-child{ transform:translateX(-100%) !important; }`;document.head.appendChild(st)}
/* 10. */
{const st=document.createElement("style");st.textContent=`
html body #flagZoomOverlay #flagZoomClose, html body #flagZoomOverlay .flag-zoom-panel > .flag-zoom-close, html body .flag-zoom-close, html body #flagZoomClose{ min-width:24px !important; min-height:24px !important; width:24px !important; height:24px !important; padding:0 !important;
 position:absolute !important; top:8px !important; right:10px !important; left:auto !important; margin:0 !important; outline:none !important; background:transparent !important; border:0 !important; box-shadow:none !important; border-radius:50% !important;
 color:rgba(22,50,79,.45) !important; font-size:20px !important; line-height:1 !important; backdrop-filter:none !important; }
html body .flag-zoom-close:focus-visible, html body #flagZoomClose:focus-visible{ background:rgba(22,50,79,.1) !important; }
#flagZoomOverlay .flag-zoom-panel{ position:relative; }
html body .flag-zoom-close:hover, html body #flagZoomClose:hover{ color:var(--coral,#e0603f) !important; background:rgba(22,50,79,.06) !important; }
html body .flag-zoom-close svg, html body #flagZoomClose svg{ width:14px !important; height:14px !important; }
body.dark-theme .flag-zoom-close, body.sky-night .flag-zoom-close{ color:rgba(230,237,247,.6) !important; }`;document.head.appendChild(st)}
/* 11. */
if(typeof gfMS==="function"&&typeof gfMsRefresh==="function"){
 const NAMES=["N","NE","E","SE","S","SW","W","NW"];const dirName=a=>NAMES[Math.round(((a%360)+360)%360/45)%8];
 const val=()=>{try{return Math.round((typeof gfShadeV==="function"?gfShadeV():gfMS().shadeB)*100)}catch(e){return 30}};
 function sync(row){const M=gfMS(),sun=row.querySelector(".gf-sh-sun"),a=M.sun*Math.PI/180;sun.setAttribute("cx",(20+13*Math.sin(a)).toFixed(1));sun.setAttribute("cy",(20-13*Math.cos(a)).toFixed(1));
  row.querySelector(".gf-sh-dir").textContent=dirName(M.sun);const r=row.querySelector("input");if(document.activeElement!==r)r.value=val()}
 function apply(){try{gfMSsave()}catch(e){}try{gfMsRefresh()}catch(e){}try{if(typeof gfMsPanelSync==="function")gfMsPanelSync()}catch(e){}try{gfGlobeDirty()}catch(e){}}
 function make(){const row=document.createElement("div");row.id="gfShadeRow";
  row.innerHTML='<svg class="gf-sh-dial" viewBox="0 0 40 40" aria-label="Sun direction: drag round"><circle cx="20" cy="20" r="13" class="gf-sh-ring"/><text x="20" y="5.5" text-anchor="middle">N</text><circle class="gf-sh-sun" r="4.2"/></svg>'+
   '<div class="gf-sh-ctl"><span class="gf-sh-h">Terrain shading <small>light from <b class="gf-sh-dir"></b></small></span><input type="range" min="0" max="100" aria-label="Shading strength"><span class="gf-sh-ends"><small>none</small><small>dramatic</small></span></div>';
  const dial=row.querySelector("svg"),r=row.querySelector("input");
  const ang=ev=>{const b=dial.getBoundingClientRect(),dx=ev.clientX-(b.left+b.width/2),dy=ev.clientY-(b.top+b.height/2);gfMS().sun=Math.round((Math.atan2(dx,-dy)*180/Math.PI+360)%360/5)*5;sync(row)};
  dial.onpointerdown=ev=>{dial.setPointerCapture(ev.pointerId);ang(ev);dial.onpointermove=ang};dial.onpointerup=()=>{dial.onpointermove=null;apply()};
  r.oninput=()=>{};r.onchange=()=>{const M=gfMS();if(typeof GF_STYLES!=="undefined"&&GF_STYLES[M.style])M.shadeG=r.value/100;else M.shadeB=r.value/100;apply()};
  ["pointerdown","mousedown","click","wheel","touchstart"].forEach(t=>row.addEventListener(t,e=>e.stopPropagation(),{passive:t==="wheel"||t==="touchstart"}));
  return row}
 let row=null;
 /* it lives inside the key panel (bottom right), so it folds away with the key */
 const place=()=>{const key=document.getElementById("flKey");const relief=typeof allMapsColorMode!=="undefined"&&allMapsColorMode==="relief"&&appMode==="allmaps";
  if(!relief){if(row)row.remove();return}if(!row)row=make();
  /* when the folding key isn't shown (wide flat map), the key sits under the map: go there */
  if(!key||!key.getClientRects().length){const lg=document.getElementById("populationLegend");if(!lg){row.remove();return}if(row.parentNode!==lg||row.nextElementSibling)lg.appendChild(row);row.classList.add("in-key","in-legend");sync(row);return}
  row.classList.remove("in-legend");
  /* folded into its pill: the shading folds away with it */
  if(key.querySelector(".flk-pill")){row.remove();return}
  const pill=document.getElementById("amLabPill"),body=key.querySelector(".flk-body");
  if(pill&&pill.parentNode===key){if(row.nextElementSibling!==pill||row.parentNode!==key)key.insertBefore(row,pill)}else if(body){if(row.previousElementSibling!==body||row.parentNode!==key)body.after(row)}else if(row.parentNode!==key)key.appendChild(row);
  row.classList.add("in-key");sync(row)};
 setInterval(()=>{try{place()}catch(e){}},600);
 /* the floating key is a copy of the key under the map: drop the copied (dead) shading row, then put the real one in */
 if(typeof flkSync==="function"){const _fs=flkSync;flkSync=function(){const r=_fs.apply(this,arguments);try{const k=document.getElementById("flKey");if(k)k.querySelectorAll("#gfShadeRow").forEach(x=>{if(x!==row)x.remove()});place()}catch(e){}return r}}
 const st=document.createElement("style");st.textContent=`
 #gfShadeRow{ display:flex; align-items:center; gap:10px; padding:8px 12px; border-radius:16px; background:rgba(255,255,255,.92); box-shadow:0 2px 10px rgba(20,40,70,.14); color:#1d3550; font-size:12px; }
 
 #gfShadeRow.in-legend{ display:inline-flex; width:260px; margin:6px 0 0; vertical-align:middle; }
 #gfShadeRow.in-key{ background:rgba(127,140,180,.08); box-shadow:none; margin:8px 0 6px; }
 #gfShadeRow .gf-sh-dial{ width:42px; height:42px; flex:none; cursor:grab; touch-action:none; }
 #gfShadeRow .gf-sh-ring{ fill:#f3f6fa; stroke:rgba(29,53,80,.25); stroke-width:1.2; }
 #gfShadeRow .gf-sh-dial text{ font-size:6px; font-weight:700; fill:rgba(29,53,80,.55); }
 #gfShadeRow .gf-sh-sun{ fill:#f6b52c; stroke:#fff; stroke-width:1.2; }
 #gfShadeRow .gf-sh-ctl{ flex:1; min-width:0; display:flex; flex-direction:column; gap:2px; }
 #gfShadeRow .gf-sh-h{ font-weight:700; white-space:nowrap; } #gfShadeRow .gf-sh-h small{ font-weight:500; opacity:.7; margin-left:4px; }
 #gfShadeRow input[type=range]{ width:100%; margin:2px 0 0; accent-color:#3a7fc0; }
 #gfShadeRow .gf-sh-ends{ display:flex; justify-content:space-between; opacity:.6; font-size:10.5px; }
 body.dark-theme #gfShadeRow:not(.in-key), body.sky-night #gfShadeRow:not(.in-key){ background:rgba(22,30,46,.92); color:#e6edf7; }
 body.dark-theme #gfShadeRow, body.sky-night #gfShadeRow{ color:#e6edf7; }
 @media (max-width:640px){ #allMapsWrap > #gfShadeRow{ display:none; } }`;document.head.appendChild(st)}
/* 12. */
{const st=document.createElement("style");st.textContent=".ps-launcher:has(.ps-menu){ z-index:12 !important; }";document.head.appendChild(st)}
/* 13. */
if(typeof psSqPhoto==="function"&&typeof PS_PHOTO_DATA!=="undefined"){const LEO=PS_PHOTO_DATA.findIndex(p=>/King Leopold 2, and Congo Free State/.test(p.f||""));
 if(LEO>=0){const _sq=psSqPhoto;psSqPhoto=function(q){if(q&&/Leopold/.test(q.label||"")){const P=PS_PHOTO_DATA[LEO];if(P&&P.d)return P}return _sq.apply(this,arguments)}}}
/* 14. A trackpad pinch (ctrl + wheel) or Safari gesture over a map zooms the map, never the whole page */
/* pinch (ctrl + wheel) over the map zooms the map; anywhere else, beside the globe too, it zooms the page as usual */
document.addEventListener("wheel",e=>{if(!e.ctrlKey||!e.target.closest)return;const t=e.target;
 if(t.tagName==="CANVAS"&&t.closest(".globe-host")){let g=null;try{for(const x of [typeof amGlobe!=="undefined"&&amGlobe,typeof stGlobe!=="undefined"&&stGlobe])if(x&&x.canvas===t)g=x}catch(_){}
  if(g&&!g._flat){const rc=t.getBoundingClientRect(),z=g.size(),R=z.r*(g.zoom||1);if(Math.hypot(e.clientX-rc.left-z.w/2,e.clientY-rc.top-z.h/2)>R)return}e.preventDefault();return}
 if(t.closest("svg")&&t.closest("#allMapsWrap,#atlasStudyMapWrap,.map-wrap"))e.preventDefault()},{passive:false,capture:true});
/* Safari sends gesture events for a pinch instead: turn them into the map's own wheel zoom */
{let last=1;["gesturestart","gesturechange","gestureend"].forEach(t=>document.addEventListener(t,e=>{const host=e.target.closest&&e.target.closest("#allMapsWrap,.globe-host,#atlasStudyMapWrap,.map-wrap");if(!host)return;e.preventDefault();
 if(t==="gesturestart"){last=1;return}const sc=e.scale||1,d=sc/last;last=sc;if(t==="gestureend"||Math.abs(d-1)<.01)return;
 const tgt=host.querySelector("svg,canvas")||host;tgt.dispatchEvent(new WheelEvent("wheel",{deltaY:-Math.log(d)*400,clientX:e.clientX,clientY:e.clientY,bubbles:true,cancelable:true}))},{passive:false,capture:true}))}
/* 15. */
if(typeof partsBreakHTML==="function"&&typeof poolFor==="function"){
 const commonSet=()=>new Set(poolFor("Common").map(c=>c.c));
 /* a bit less common: the most populous countries outside the common set */
 function harder(r,n){try{const cs=commonSet(),inQ=new Set(r.queue.map(c=>c.c));let L=COUNTRIES.filter(c=>!cs.has(c.c)&&!inQ.has(c.c)&&(typeof COUNTRY_POPULATION==="undefined"||COUNTRY_POPULATION[c.c]));
   if(appMode==="map")L=L.filter(c=>!isMapAtlasUnavailable(c.c));if(appMode==="capital")L=L.filter(c=>c.caps&&c.caps.length);
   L.sort((a,b)=>((COUNTRY_POPULATION||{})[b.c]||0)-((COUNTRY_POPULATION||{})[a.c]||0));L=L.slice(0,55);const out=[];while(out.length<n&&L.length)out.push(L.splice(Math.floor(Math.random()*L.length),1)[0]);return out}catch(e){return[]}}
 /* swap three of the next part's questions for less common countries */
 function mixIn(r){const pp=r.pp;if(!pp||r._mixFor===pp.part+1||pp.part>=pp.n)return;r._mixFor=pp.part+1;const H=harder(r,3);if(!H.length)return;
  const end=Math.min(r.queue.length,r.idx+PARTS.size),slots=[];for(let i=r.idx;i<end;i++)slots.push(i);slots.sort(()=>Math.random()-.5);
  r._harder=r._harder||new Set();H.forEach((c,k)=>{const i=slots[k];if(i==null)return;r.queue[i]=c;r._harder.add(c.c)});r._harderPart=pp.part+1;r._typedFrom=r._typedFrom||pp.part+1}
 const _pb=partsBreakHTML;partsBreakHTML=function(r){let h=_pb.apply(this,arguments);try{const pp=r.pp;if(!pp||r.region!=="Common")return h;
  const k=pp.part,sz=partSize(pp,k),good=pp.partScore>=Math.ceil(sz*.8),what=appMode==="capital"?"capitals":appMode==="map"?(mapQuizSubMode==="silhouette"?"outlines":"countries"):"flags";
  const inJ=typeof gfEasyJourney==="function"&&gfEasyJourney();
  if(quizMode==="type"&&r._typedFrom==null)r._typedFrom=1;
  const typedAll=quizMode==="type"&&r._typedFrom<=k,hadHarder=r._harderPart===k;
  let box="";
  if(good&&quizMode!=="type"){box='<div class="gf-easy"><div class="gf-easy-h">🌟 '+pp.partScore+' of '+sz+'! Ready to type them?</div><p>Spell the answers yourself from the next question. A few slightly less common '+what+' will join in, and typed answers turn stamps gold.</p><div class="gf-easy-row"><button type="button" class="gf-easy-b" id="gfLadType"><b>⌨️ Switch to typing</b><small>From the next question</small></button></div></div>'}
  else if(good&&typedAll&&hadHarder){box='<div class="gf-easy"><div class="gf-easy-h">🏆 '+pp.partScore+' of '+sz+' typed, even the harder ones!</div><p>You know the common '+what+'. Time for the whole world'+(inJ?" once this step is done":"")+'.</p><div class="gf-easy-row">'+(inJ?"":'<button type="button" class="gf-easy-b" id="gfEasyAll"><b>🌍 All '+what+'</b><small>Move on to all 196</small></button>')+"</div></div>";mixIn(r)}
  else if(typedAll){mixIn(r);if(good)box='<div class="gf-easy"><div class="gf-easy-h">⌨️ Nicely typed</div><p>The next part mixes in three slightly less common '+what+'. Get 8 of 10 and you are ready for all of them.</p></div>'}
  /* replace the older "Too easy?" box with this one */
  h=h.replace(/<div class="gf-easy">[\s\S]*?(?=<div class="round-actions">)/,"");if(box)h=h.replace('<div class="round-actions">',box+'<div class="round-actions">')}catch(e){console.error(e)}return h};
 document.addEventListener("click",e=>{const t=e.target.closest&&e.target.closest("#gfLadType");if(!t)return;quizMode="type";try{renderChrome()}catch(err){}try{if(round&&round.pp){round._typedFrom=round.pp.part+1;mixIn(round)}}catch(err){}t.classList.add("on");t.innerHTML="<b>⌨️ Typing is on ✓</b><small>From the next question, with three harder ones</small>"})}
})();
/* 16. Pin photos that were shared with a pin they did not fit: France's mainland pin gets the Eiffel Tower, and pins whose only
       photo showed somewhere else (Khouribga had a tagine, Saint Martin had Saint Kitts) show the plain photo icon instead. */
(function(){const NONE=new Set(["Khouribga: Morocco’s phosphate mines",]);
 try{GF_SQ_FILE["Metropolitan France"]="Tour Eiffel Wikimedia Commons.jpg"}catch(e){}
 if(typeof psSqPhoto==="function"){const _p=psSqPhoto;psSqPhoto=function(q){if(q&&NONE.has(String(q.label).replace(/​/g,"")))return null;return _p.apply(this,arguments)}}})();
/* 17. History map: clicking a place opens the power that ruled it that year (not today's country): its name, what it was part
       of, the year's story, and a short summary and picture (often its flag or a map) from Wikipedia, fetched live. */
(function(){if(typeof openFlagZoom!=="function"||typeof histAtLL!=="function")return;
 let last=null;document.addEventListener("pointerdown",e=>{last=[e.clientX,e.clientY]},true);
 const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const cache={};const wiki=t=>cache[t]||(cache[t]=fetch("https://en.wikipedia.org/api/rest_v1/page/summary/"+encodeURIComponent(t.replace(/ /g,"_"))+"?redirect=true").then(r=>r.ok?r.json():null).then(j=>j&&j.type!=="disambiguation"&&j.extract?j:null).catch(()=>null));
 /* the same name meant different states at different times: pick the article for that year */
 const ERA=[["Republic of China",-9999,1949,"Republic of China (1912–1949)"],["China",1644,1911,"Qing dynasty"],["China",1368,1643,"Ming dynasty"],["China",1271,1367,"Yuan dynasty"],["China",1912,1949,"Republic of China (1912–1949)"],
  ["Germany",1871,1918,"German Empire"],["Germany",1919,1932,"Weimar Republic"],["Germany",1933,1945,"Nazi Germany"],["Germany",1949,1990,"West Germany"],["Russia",1721,1917,"Russian Empire"],["Russia",1547,1720,"Tsardom of Russia"],["Russia",1283,1546,"Grand Duchy of Moscow"],
  ["Japan",1868,1947,"Empire of Japan"],["Japan",1603,1867,"Tokugawa shogunate"],["Italy",1861,1946,"Kingdom of Italy"],["India",1858,1947,"British Raj"],["Persia",1789,1925,"Qajar Iran"],["Persia",1501,1736,"Safavid Iran"],["Iran",1925,1979,"Pahlavi Iran"],
  ["France",1804,1814,"First French Empire"],["France",1852,1870,"Second French Empire"],["France",987,1791,"Kingdom of France"],["Great Britain",1707,1800,"Kingdom of Great Britain"],["England",927,1706,"Kingdom of England"],["Egypt",1922,1952,"Kingdom of Egypt"],["Korea",1392,1897,"Joseon"],["Korea",1897,1910,"Korean Empire"],
  ["Spain",1492,1975,"Spanish Empire"],["Portugal",1415,1974,"Portuguese Empire"],["Austria",1804,1867,"Austrian Empire"],["Mexico",1821,1823,"First Mexican Empire"],["Brazil",1822,1889,"Empire of Brazil"],["Ethiopia",1270,1974,"Ethiopian Empire"],["Tibet",1912,1951,"Tibet (1912–1951)"],["Mongolia",1924,1992,"Mongolian People's Republic"],["Turkey",1299,1922,"Ottoman Empire"]];
 const era=(t,y)=>{const n=String(t).replace(/^the /i,"");const r=ERA.find(([k,a,b])=>k===n&&y>=a&&y<=b);return r?r[3]:null};
 function card(f){const p=f.properties||{},Y=histYear(),G=p.g&&HIST_DATA.groups[p.g],lab=((Y.labs||[]).find(l=>l[0]===p.g)||[])[1]||(G&&G[0])||"";
  const ruler=lab&&lab!==p.n&&p.g!=="new"?lab.replace(/^the /i,""):"";document.querySelectorAll(".gf-hist-back").forEach(x=>x.remove());
  const o=document.createElement("div");o.className="game-modal-backdrop gf-hist-back";
  o.innerHTML='<div class="game-modal gf-hist-card" role="dialog"><button class="modal-x" type="button" aria-label="Close">×</button><small>'+esc(Y.label||"")+'</small><h3>'+esc(ruler||p.n||"Unnamed")+"</h3>"+(ruler&&p.n?'<p class="gf-hist-sub">'+esc(p.n)+" was part of it"+(p.t?" ("+esc(p.t)+")":"")+"</p>":p.t?'<p class="gf-hist-sub">'+esc(p.t)+"</p>":"")+'<div class="gf-hist-wiki"><p class="gf-hist-wait">Looking it up…</p></div>'+(Y.cap?'<p class="gf-hist-cap"><b>The world in '+esc(Y.label)+":</b> "+esc(Y.cap)+"</p>":"")+"</div>";
  document.body.appendChild(o);const close=()=>o.remove();o.querySelector(".modal-x").onclick=close;o.addEventListener("click",e=>{if(e.target===o)close()});
  const yr=/^bc/.test(Y.y)?-parseInt(Y.y.slice(2),10):parseInt(Y.y,10),tries=[];[ruler,p.n].filter(Boolean).forEach(t=>{const e=era(t,yr);tries.push(e||t)});(async()=>{let j=null;for(const t of tries){j=await wiki(t);if(j)break}const box=o.querySelector(".gf-hist-wiki");if(!box)return;
   if(!j){box.innerHTML="";return}const ex=String(j.extract).split(/(?<=\.)\s+/).slice(0,3).join(" ");
   box.innerHTML=(j.thumbnail?'<img src="'+esc(j.thumbnail.source)+'" alt="">':"")+"<p>"+esc(ex)+'</p><a href="'+esc(j.content_urls&&j.content_urls.desktop&&j.content_urls.desktop.page||"#")+'" target="_blank" rel="noopener">Read more on Wikipedia →</a>'})()}
 const _oz=openFlagZoom;openFlagZoom=function(country){try{if(typeof allMapsColorMode!=="undefined"&&allMapsColorMode==="history"&&typeof appMode!=="undefined"&&appMode==="allmaps"&&last&&!(typeof ps!=="undefined"&&ps)){
   const onGlobe=typeof amGlobeOn==="function"&&amGlobeOn();let ll=null;if(!onGlobe&&typeof amtToLL==="function")ll=amtToLL(last[0],last[1]);
   else if(onGlobe&&amGlobe&&amGlobe.projection){const r=(amGlobe.host.querySelector("canvas.globe-canvas")||amGlobe.host).getBoundingClientRect(),pr=amGlobe.projection();ll=pr.invert&&pr.invert([last[0]-r.left,last[1]-r.top])}
   const hit=ll&&histAtLL(ll);if(hit&&hit[1]&&hit[1].properties&&hit[1].properties.n!=="No humans yet"){card(hit[1]);return}}}catch(e){console.error(e)}return _oz.apply(this,arguments)};
 const st=document.createElement("style");st.textContent=`.gf-hist-card{max-width:440px;text-align:left}.gf-hist-card small{text-transform:uppercase;letter-spacing:.06em;font-weight:800;opacity:.6;font-size:11px}.gf-hist-card h3{margin:2px 0 4px;font-size:23px}.gf-hist-sub{margin:0 0 10px;opacity:.75}.gf-hist-wiki img{float:right;max-width:120px;max-height:110px;margin:0 0 8px 12px;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,.15)}.gf-hist-wiki p{margin:0 0 6px;font-size:14px}.gf-hist-wiki a{font-weight:700;font-size:13px}.gf-hist-wait{opacity:.6}.gf-hist-cap{clear:both;font-size:13px;opacity:.85;background:rgba(232,112,26,.08);border-radius:10px;padding:8px 10px;margin:12px 0 0}`;document.head.appendChild(st)})();
/* 18. Sideways drags turn the flat map like the globe. The picture used while dragging only includes images that have
   already been loaded, so every image on the maps (relief, shading, sea level) is loaded as soon as it appears. */
(function(){if(typeof spinImg!=="function")return;const seen=new Set;
 const pre=()=>{document.querySelectorAll("#allMapsWrap svg image, #atlasStudyMapWrap svg image, #mapWrap svg image").forEach(el=>{const h=el.getAttribute("href")||el.getAttribute("xlink:href");if(!h||seen.has(h))return;seen.add(h);try{const p=spinImg(h);if(p&&p.catch)p.catch(()=>{})}catch(e){}})};
 setInterval(pre,700);pre()})();
/* the picture used while dragging is made ahead of time, when the map has been still for a moment, and reused until
   the map changes, so a drag starts at once */
(function(){if(typeof spinSnapshot!=="function")return;const _ss=spinSnapshot;
 const key=svg=>{try{const k=spinKindOf(svg);return (k&&SPIN[k].dl)+"|"+svg.getAttribute("viewBox")+"|"+(svg._gfMut||0)+"|"+svg.getBoundingClientRect().width.toFixed(0)}catch(e){return Math.random()}};
 spinSnapshot=function(svg){const k=key(svg),c=svg._gfSnap;if(c&&c.k===k&&c.s)return c.s;const s=_ss.apply(this,arguments);svg._gfSnap={k,s};return s};
 const watch=svg=>{if(svg._gfSnapW)return;svg._gfSnapW=1;let t=0;
  const warm=()=>{t=0;if(!svg.isConnected||!SPIN_DRAG_ON||svg._spinDrag||!svg.getClientRects().length)return;const go=()=>{try{if(!svg._spinDrag)spinSnapshot(svg)}catch(e){}};(window.requestIdleCallback||setTimeout)(go,{timeout:2000})};
  new MutationObserver(ms=>{if(ms.every(m=>{const n=m.target;return n.closest&&n.closest(".spin-preview")||[...m.addedNodes,...m.removedNodes].every(x=>x.classList&&x.classList.contains("spin-preview"))||m.attributeName==="class"||(m.type==="attributes"&&n.closest&&n.closest('[style*="display:none"],[style*="display: none"]'))}))return;svg._gfMut=(svg._gfMut||0)+1;clearTimeout(t);t=setTimeout(warm,1200)}).observe(svg,{subtree:true,childList:true,attributes:true,characterData:false});
  t=setTimeout(warm,1500)};
 setInterval(()=>document.querySelectorAll("svg#worldMapSvg, svg#worldMapSvgAllMaps").forEach(watch),1000)})();
/* 19. The Caspian Sea's lake shape stays invisible on maps whose picture already shows the water (relief, satellite,
   elevation), and appears while the pointer is over it. */
(function(){const st=document.createElement("style");st.textContent='#allMapsWrap.gf-own-water path.map-lake[data-name="Caspian Sea"]{fill-opacity:0 !important;stroke-opacity:0 !important;transition:fill-opacity .2s,stroke-opacity .2s}#allMapsWrap.gf-own-water path.map-lake[data-name="Caspian Sea"].gf-show{fill-opacity:1 !important;stroke-opacity:1 !important}';document.head.appendChild(st);
 const sync=()=>{const w=document.getElementById("allMapsWrap");if(!w)return;let m="";try{m=allMapsColorMode}catch(e){}w.classList.toggle("gf-own-water",/^(relief|satellite|elevation)$/.test(m))};setInterval(sync,500);sync();
 const lake=t=>{const w=t.closest&&t.closest("#allMapsWrap");return w&&w.querySelector('path.map-lake[data-name="Caspian Sea"]')};
 document.addEventListener("pointerover",e=>{const t=e.target;if(t&&t.getAttribute&&t.getAttribute("data-name")==="Caspian Sea"){const l=lake(t);if(l)l.classList.add("gf-show")}},true);
 document.addEventListener("pointerout",e=>{const t=e.target;if(t&&t.getAttribute&&t.getAttribute("data-name")==="Caspian Sea"){const l=lake(t);if(l)l.classList.remove("gf-show")}},true)})();
/* 20. Population tour, the Ganges plain: Uttar Pradesh outlined (Natural Earth 1:10m states and provinces) */
(function(){try{const S=PS_TOURS.pop&&PS_TOURS.pop.steps.find(s=>s.title==="The Ganges plain and Bangladesh");if(!S||S._up)return;S._up=1;
 S.lines=(S.lines||[]).concat([{coords:[[82.674,27.696],[82.752,27.495],[83.133,27.444],[83.282,27.331],[83.363,27.386],[83.356,27.452],[83.387,27.47],[83.59,27.457],[83.89,27.328],[83.886,27.28],[83.942,27.222],[83.941,27.154],[84.023,27.06],[84.071,26.924],[84.149,26.876],[84.226,26.892],[84.246,26.757],[84.306,26.744],[84.394,26.654],[84.099,26.65],[84.054,26.565],[83.963,26.516],[83.926,26.546],[83.926,26.465],[84.016,26.473],[84.186,26.395],[84.162,26.338],[84.186,26.285],[84.008,26.251],[83.988,26.209],[84.261,25.931],[84.374,25.94],[84.612,25.787],[84.592,25.738],[84.524,25.7],[84.373,25.765],[84.326,25.749],[84.326,25.663],[84.276,25.641],[84.222,25.661],[84.213,25.728],[84.143,25.736],[83.887,25.517],[83.346,25.199],[83.323,25.079],[83.364,24.998],[83.355,24.875],[83.524,24.746],[83.523,24.53],[83.398,24.493],[83.452,24.354],[83.215,23.949],[83.104,23.912],[82.936,23.92],[82.735,24.066],[82.736,24.115],[82.674,24.18],[82.733,24.214],[82.765,24.33],[82.734,24.552],[82.818,24.589],[82.772,24.668],[82.717,24.68],[82.715,24.718],[82.595,24.688],[82.427,24.719],[82.41,24.636],[82.307,24.632],[82.323,24.694],[82.265,24.715],[82.263,24.791],[82.208,24.764],[82.209,24.843],[82.122,24.808],[81.956,24.871],[81.873,24.93],[81.842,25.027],[81.753,25.02],[81.708,25.065],[81.578,25.085],[81.537,25.2],[81.425,25.165],[81.469,25.127],[81.418,25.104],[81.37,25.112],[81.361,25.157],[81.243,25.17],[81.235,25.089],[81.175,25.011],[81.181,24.958],[81.098,24.909],[81.005,24.966],[80.762,24.983],[80.859,25.188],[80.835,25.218],[80.777,25.163],[80.666,25.15],[80.718,25.082],[80.639,25.073],[80.565,25.152],[80.546,25.108],[80.458,25.117],[80.514,25.05],[80.478,25.018],[80.407,25.064],[80.407,25.013],[80.297,25.012],[80.27,25.089],[80.422,25.186],[80.399,25.244],[80.322,25.288],[80.284,25.414],[80.198,25.416],[80.125,25.351],[80.087,25.362],[79.84,25.241],[79.863,25.153],[79.802,25.132],[79.554,25.179],[79.48,25.106],[79.399,25.141],[79.392,25.074],[79.358,25.071],[79.333,25.089],[79.339,25.147],[79.442,25.297],[79.31,25.244],[79.29,25.28],[79.312,25.365],[79.262,25.296],[79.28,25.164],[79.172,25.182],[79.126,25.144],[79.109,25.195],[79.024,25.175],[79.011,25.214],[79.047,25.257],[78.999,25.283],[78.973,25.228],[78.87,25.181],[78.868,25.238],[78.935,25.304],[78.96,25.427],[78.909,25.441],[78.919,25.505],[78.891,25.538],[78.836,25.42],[78.801,25.427],[78.782,25.524],[78.727,25.494],[78.749,25.426],[78.728,25.346],[78.652,25.409],[78.582,25.407],[78.514,25.273],[78.574,25.212],[78.649,24.941],[78.724,24.849],[78.72,24.656],[78.74,24.631],[78.871,24.626],[78.922,24.533],[78.916,24.487],[78.978,24.467],[78.972,24.423],[78.81,24.22],[78.489,24.411],[78.435,24.328],[78.371,24.302],[78.33,24.342],[78.35,24.408],[78.224,24.519],[78.272,24.624],[78.225,24.794],[78.169,24.865],[78.325,25.002],[78.366,25.186],[78.251,25.398],[78.33,25.465],[78.371,25.553],[78.546,25.573],[78.748,25.643],[78.733,25.774],[78.808,25.842],[78.953,26.1],[78.92,26.145],[78.957,26.198],[78.938,26.255],[79.059,26.343],[79.049,26.441],[78.926,26.706],[78.861,26.701],[78.71,26.799],[78.564,26.758],[78.351,26.858],[78.2,26.824],[78.173,26.869],[78.246,26.923],[78.169,26.949],[78.029,26.91],[78.016,26.867],[77.977,26.904],[77.72,26.934],[77.398,26.779],[77.423,26.884],[77.719,27.016],[77.674,27.006],[77.643,27.047],[77.56,27.037],[77.503,27.08],[77.657,27.203],[77.602,27.329],[77.434,27.406],[77.318,27.617],[77.333,27.671],[77.281,27.809],[77.47,27.888],[77.529,27.953],[77.468,28.047],[77.47,28.113],[77.504,28.093],[77.495,28.152],[77.539,28.181],[77.497,28.209],[77.539,28.243],[77.467,28.315],[77.497,28.393],[77.415,28.465],[77.377,28.455],[77.298,28.569],[77.338,28.626],[77.313,28.707],[77.206,28.822],[77.221,28.914],[77.175,28.963],[77.196,28.998],[77.134,29.116],[77.148,29.415],[77.066,29.425],[77.12,29.484],[77.066,29.504],[77.058,29.555],[77.1,29.589],[77.088,29.659],[77.18,29.804],[77.23,29.977],[77.57,30.278],[77.585,30.383],[77.662,30.395],[77.946,30.228],[77.835,30.131],[77.746,29.977],[77.751,29.86],[77.831,29.66],[77.967,29.724],[78.107,29.655],[78.155,29.675],[78.198,29.748],[78.155,29.925],[78.218,29.954],[78.362,29.775],[78.479,29.722],[78.643,29.538],[78.92,29.422],[78.86,29.35],[78.731,29.32],[78.714,29.291],[78.868,29.215],[78.914,29.106],[79.056,29.152],[79.296,28.972],[79.371,28.97],[79.444,28.85],[79.526,28.878],[79.6,28.849],[79.813,28.877],[79.841,28.855],[79.834,28.806],[79.887,28.818],[79.896,28.775],[79.931,28.782],[79.972,28.733],[80.082,28.819],[80.291,28.69],[80.33,28.627],[80.408,28.626],[80.488,28.562],[80.488,28.656],[80.556,28.679],[80.564,28.647],[80.636,28.628],[80.782,28.515],[80.872,28.497],[80.905,28.441],[81.17,28.361],[81.296,28.128],[81.396,28.161],[81.473,28.066],[81.856,27.851],[81.976,27.917],[82.027,27.912],[82.402,27.677],[82.674,27.696]],kind:"outline"}])}catch(e){console.error(e)}})();

/* 21. Maps page tidy-up: the globe always starts where the flat map does (no jump when a map has measure tabs), measure tabs
   sit on the left in globe mode, and switches fold into groups: "Labels" (country and ocean labels) and "Plates"
   (plate boundaries and plate motion). A group's switch turns all of its switches on or off; its ▾ shows them one by one. */
(function(){const st=document.createElement("style");st.textContent=`
#allMapsView.globe-on #allMapsSubModes.gf-sub-inrow{ justify-content:flex-start; }
.gf-fold{ position:relative; display:inline-flex; align-items:center; }
.gf-fold > .gf-fcaret{ border:0; background:none; cursor:pointer; font-size:10px; padding:0 2px; margin-left:2px; color:inherit; opacity:.75; }
.gf-fold-pop{ position:absolute; top:calc(100% + 6px); left:0; z-index:60; display:flex; flex-direction:column; gap:8px; padding:10px 12px; background:#fff; border-radius:12px; box-shadow:0 6px 22px rgba(20,40,70,.18); white-space:nowrap; }
.gf-fold-pop[hidden]{ display:none; }
body.dark-theme .gf-fold-pop, body.sky-night .gf-fold-pop{ background:#1f2b3a; }`;document.head.appendChild(st);
 const GROUPS=[["Labels",["Country labels","Ocean labels"]],["Plates",["Plate boundaries","Plate motion"]]];
 const labOf=sw=>{const l=sw.querySelector(".switch-label");return l?l.textContent.trim():""};
 function fold(){const row=document.querySelector("#allMapsView .all-maps-label-controls");if(!row)return;
  GROUPS.forEach(([name,members])=>{let g=row.querySelector('.gf-fold[data-g="'+name+'"]');
   const sws=members.map(m=>[...document.querySelectorAll("#allMapsView label.switch")].find(sw=>labOf(sw)===m)).filter(Boolean);if(!sws.length)return;
   if(!g){g=document.createElement("span");g.className="gf-fold";g.dataset.g=name;g.innerHTML='<label class="switch gf-fsw"><input type="checkbox"><span class="switch-track"><span class="switch-thumb"></span></span><span class="switch-label">'+name+'</span></label><button type="button" class="gf-fcaret" aria-haspopup="true" aria-expanded="false" title="Choose which '+name.toLowerCase()+' to show">▾</button><div class="gf-fold-pop" hidden></div>';
    const first=sws[0];first.parentNode.insertBefore(g,first);
    const pop=g.querySelector(".gf-fold-pop"),car=g.querySelector(".gf-fcaret"),main=g.querySelector("input");
    car.onclick=e=>{e.stopPropagation();pop.hidden=!pop.hidden;car.setAttribute("aria-expanded",String(!pop.hidden))};
    document.addEventListener("click",e=>{if(!g.contains(e.target))pop.hidden=true});
    main.onchange=()=>{const want=main.checked;g._sws.forEach(sw=>{const i=sw.querySelector("input");if(i&&i.checked!==want){i.checked=want;i.dispatchEvent(new Event("change",{bubbles:true}));i.dispatchEvent(new Event("input",{bubbles:true}))}})}}
   const pop=g.querySelector(".gf-fold-pop");sws.forEach(sw=>{if(sw.parentNode!==pop)pop.appendChild(sw)});g._sws=sws;
   const main=g.querySelector("input"),any=sws.some(sw=>{const i=sw.querySelector("input");return i&&i.checked});if(main.checked!==any)main.checked=any})}
 /* the globe's top lines up with where the flat map starts */
 function level(){const v=document.getElementById("allMapsView");if(!v||!v.classList.contains("globe-on"))return;const c=v.querySelector(".all-maps-controls"),g=v.querySelector(".globe-wrap-rel");if(!c||!g)return;
  const cur=parseFloat(getComputedStyle(v).getPropertyValue("--gf-gtop"))||0,want=c.getBoundingClientRect().bottom+26,now=g.getBoundingClientRect().top,d=Math.round(cur+want-now);if(Math.abs(d-cur)>1)v.style.setProperty("--gf-gtop",d+"px")}
 setInterval(()=>{try{fold()}catch(e){}},400)})();
/* 22. Globe mode: the map's measure tabs (Nominal GDP / GDP per capita, Children per woman…) are a vertical list on the
   left, under the guided-tour button; the row version above the map is hidden there */
(function(){const st=document.createElement("style");st.textContent=`
#allMapsView.globe-on #allMapsSubModes{ display:none !important; }
#allMapsView.globe-on #amGlobeSubs.globe-subs{ position:absolute !important; left:10px; top:62px; z-index:5; display:flex; flex-direction:column; align-items:flex-start; gap:6px; margin:0 !important; justify-content:flex-start; }
#allMapsView.globe-on #amGlobeSubs.globe-subs:empty{ display:none !important; }
#allMapsView.globe-on #amGlobeSubs .chip{ white-space:nowrap; background:rgba(255,255,255,.88); box-shadow:0 1px 4px rgba(20,40,70,.12); }
#allMapsView.globe-on #amGlobeSubs .chip.active{ background:var(--accent,#2f8a7a); color:#fff; }
@media (max-width:760px){ #allMapsView.globe-on #amGlobeSubs.globe-subs{ position:static !important; flex-direction:row; flex-wrap:wrap; justify-content:center; } }`;document.head.appendChild(st)})();
/* 23. Letting go after turning the flat map: the drawn picture stays on screen while the real map is moved to the new
   position in small pieces between frames, so the page never freezes; grabbing the map again meanwhile just carries on. */
(function(){if(typeof spinPreviewEnd!=="function"||typeof spinApplySvg!=="function")return;
 const QSA=Element.prototype.querySelectorAll;
 spinPreviewEnd=function(svg){const D=svg._spinDrag;if(!D)return;if(D.raf){cancelAnimationFrame(D.raf);D.raf=0}const k=spinKindOf(svg),S=SPIN[k],target=spinNorm(D.dl),job={};svg._gfJob=job;
  if(k==="W")try{spinUser.W=true}catch(e){}
  const from=svg._spin?svg._spin.dl:S.dl;S.dl=target;try{spinTables(k);spinSetProj()}catch(e){}
  const all=[...QSA.call(svg,"*")].filter(el=>!el.closest(".spin-preview"));let i=0;const N=700;
  const step=()=>{if(svg._gfJob!==job)return;/* a newer let-go has taken over */
   if(window._gfHeld&&_gfHeld()){requestAnimationFrame(step);return}const t0=performance.now();
   while(i<all.length&&performance.now()-t0<12){const part=all.slice(i,i+N);i+=N;svg.querySelectorAll=function(sel){return sel==="*"?part:QSA.call(this,sel)};try{spinApplySvg(svg,target,S.f0,S.f,from)}catch(e){console.error(e)}finally{delete svg.querySelectorAll}}
   if(i<all.length){requestAnimationFrame(step);return}
   svg._spin={dl:target,f:S.f,clipUrl:svg._spin&&svg._spin.clipUrl};try{spinRefresh(svg)}catch(e){}
   const d=svg._spinDrag;if(d&&d.f)d.f.remove();svg.classList.remove("spin-dragging");const w=svg.closest(".map-wrap");if(w)w.classList.remove("spin-dragging");svg._spinDrag=null;svg._gfJob=null;
   try{document.querySelectorAll(".spin-btn").forEach(b=>spinBtnSync(b))}catch(e){}};
  requestAnimationFrame(step)};
 /* while the map is held again, the move waits (the next let-go replaces it with a fresh one) */
 let held=false;document.addEventListener("pointerdown",e=>{held=!!(e.target.closest&&e.target.closest(".map-wrap"))},true);["pointerup","pointercancel"].forEach(n=>document.addEventListener(n,()=>{held=false},true));window._gfHeld=()=>held})();
/* 24. "Drag turns the world" is off unless you turn it on, it switches itself off when you change map, and while it is on a
   small note on the map says so, with a button to turn it off */
(function(){if(typeof SPIN_DRAG_ON==="undefined")return;
 const off=()=>{if(!SPIN_DRAG_ON)return;SPIN_DRAG_ON=false;try{document.querySelectorAll(".spin-btn").forEach(b=>spinBtnSync(b))}catch(e){}note()};
 function note(){document.querySelectorAll(".map-wrap").forEach(w=>{let n=w.querySelector(":scope > .gf-spin-note");const show=SPIN_DRAG_ON&&w.querySelector("svg#worldMapSvg, svg#worldMapSvgAllMaps")&&w.offsetParent;
  if(!show){if(n)n.remove();return}if(!n){n=document.createElement("div");n.className="gf-spin-note";n.innerHTML='Dragging turns the world east–west <button type="button">Turn off</button>';n.querySelector("button").onclick=e=>{e.stopPropagation();off()};["pointerdown","mousedown","click"].forEach(t=>n.addEventListener(t,e=>e.stopPropagation()));w.appendChild(n)}})}
 let lastMode=null;setInterval(()=>{try{const m=typeof allMapsColorMode!=="undefined"?allMapsColorMode+"|"+(typeof appMode!=="undefined"?appMode:""):"";if(lastMode!==null&&m!==lastMode)off();lastMode=m;note()}catch(e){}},400);
 const st=document.createElement("style");st.textContent=".gf-spin-note{position:absolute;left:50%;bottom:12px;transform:translateX(-50%);z-index:8;display:flex;align-items:center;gap:10px;background:rgba(16,28,48,.88);color:#fff;font:600 12.5px/1.2 inherit;padding:6px 6px 6px 14px;border-radius:999px;box-shadow:0 3px 12px rgba(0,0,0,.25);white-space:nowrap}.gf-spin-note button{border:0;border-radius:999px;background:#e8701a;color:#fff;font:700 12px/1 inherit;padding:6px 11px;cursor:pointer}";document.head.appendChild(st)})();
/* 25. Projections: its switches on one row, with the tour button first on the left */
(function(){const st=document.createElement("style");st.textContent="#ptBar{display:flex !important;flex-wrap:nowrap !important;align-items:center;justify-content:center;gap:14px;white-space:nowrap}#ptBar > *{flex:none;margin:0 !important}#ptBar #ptStartBtn{order:-1;font-size:13px;padding:7px 14px}@media (max-width:900px){#ptBar{flex-wrap:wrap !important}}";document.head.appendChild(st)})();
setInterval(()=>{const b=document.getElementById("ptStartBtn"),bar=document.getElementById("ptBar");if(b&&bar&&b.parentNode===bar&&bar.firstElementChild!==b)bar.insertBefore(b,bar.firstElementChild)},500);
setInterval(()=>{const bar=document.getElementById("ptBar"),p=bar&&bar.parentElement;if(p&&p.firstElementChild!==bar)p.insertBefore(bar,p.firstElementChild)},500);
{const st=document.createElement("style");st.textContent=".proj-switches:has(#ptBar){display:flex !important;flex-wrap:nowrap;align-items:center;justify-content:center;gap:14px}";document.head.appendChild(st)}
/* 26. The flat map moves like the globe: while it is dragged or zoomed, a ready-made picture of the whole world is drawn in
   its place, moved and scaled every frame (no redrawing of thousands of shapes); the real map comes back when it stops.
   The picture is made in spare moments while the map is still, and remade after the map changes. */
(function(){if(typeof spinSnapshot!=="function")return;
 const ov=new WeakMap;
 /* the last picture is used even if small things (label sizes, line widths) changed since; it is remade in the background */
 function cache(svg){const c=svg._gfWorld,k=spinKindOf(svg);return c&&c.dl===(k?SPIN[k].dl:0)?c.s:null}
 function fresh(svg){const c=svg._gfWorld;return c&&c.mut===(svg._gfMut2||0)&&cache(svg)}
 window.gfSnapDraw=function(svg,b,rect){try{const s=cache(svg);if(!s||!rect||!rect.width)return false;const wrap=svg.parentNode;let cv=ov.get(svg);
   if(!cv){cv=document.createElement("canvas");cv.className="gf-world-pic";cv.style.cssText="position:absolute;pointer-events:none;z-index:1";wrap.appendChild(cv);ov.set(svg,cv)}
   const dpr=Math.min(2,devicePixelRatio||1),W=rect.width,H=rect.height;if(cv.width!==Math.round(W*dpr)||cv.height!==Math.round(H*dpr)){cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr)}
   cv.style.left=(rect.left-rect._pl-rect._bl)+"px";cv.style.top=(rect.top-rect._pt-rect._bt)+"px";cv.style.width=W+"px";cv.style.height=H+"px";cv.style.display="";
   const ctx=cv.getContext("2d"),k=W/b[2];ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,cv.width,cv.height);ctx.imageSmoothingQuality="high";
   ctx.setTransform(dpr*k/s.sc,0,0,dpr*k/s.sc,dpr*(s.vb0.x-b[0])*k,dpr*(s.vb0.y-b[1])*k);ctx.drawImage(s.cv,0,0);
   svg.style.visibility="hidden";return true}catch(e){console.error(e);return false}};
 window.gfSnapHide=function(svg){const cv=ov.get(svg);if(!cv||cv.style.display==="none")return;
   /* keep the picture until the real map has been drawn at its new place */
   requestAnimationFrame(()=>requestAnimationFrame(()=>{svg.style.visibility="";cv.style.display="none"}))};
 function warm(svg){if(svg._gfWarmT)return;svg._gfWarmT=setTimeout(()=>{svg._gfWarmT=0;if(!svg.isConnected||svg._gfPend||fresh(svg)||!svg.getClientRects().length)return;
   const go=()=>{try{if(svg._gfPend||fresh(svg))return;const mut=svg._gfMut2||0,k=spinKindOf(svg),dl=k?SPIN[k].dl:0;const s=spinSnapshot(svg);if(s)svg._gfWorld={s,mut,dl}}catch(e){}};
   (window.requestIdleCallback||setTimeout)(go,{timeout:1500})},900)}
 const watch=svg=>{if(svg._gfWW)return;svg._gfWW=1;new MutationObserver(ms=>{if(svg._gfPend)return;if(ms.every(m=>m.attributeName==="viewBox"||m.attributeName==="style"||m.attributeName==="class"||(m.target.closest&&m.target.closest(".spin-preview,[style*='display:none'],[style*='display: none']"))))return;svg._gfMut2=(svg._gfMut2||0)+1;warm(svg)}).observe(svg,{subtree:true,childList:true,attributes:true});warm(svg)};
 setInterval(()=>document.querySelectorAll("#allMapsWrap > svg, #atlasStudyMapWrap > svg").forEach(s=>{watch(s);if(!fresh(s))warm(s)}),1000)})();
/* 27. City dots grow at about half the zoom rate (like the capitals, landform and layer icons): after the city labels are
   placed, each dot and capital ring is resized to its world-view size times the square root of the zoom. */
(function(){if(typeof rescaleCityLabels!=="function"||typeof CITY_TIERS==="undefined")return;const _r=rescaleCityLabels;
 rescaleCityLabels=function(svg,zoomRatio,sizeScale){const out=_r.apply(this,arguments);try{const g=svg&&svg.querySelector("g.map-cities");if(!g||!zoomRatio)return out;
  const base=(sizeScale||1)*(typeof labelZoomMult==="function"?labelZoomMult(1):1),k=Math.pow(Math.min(1,zoomRatio),.5);
  g.querySelectorAll("g.map-city").forEach(item=>{if(item.style.display==="none")return;const tier=CITY_TIERS[Math.min(+item.dataset.tier,CITY_TIERS.length-1)];const dot=item.querySelector(".city-dot"),ring=item.querySelector(".city-ring");if(!dot)return;
   const old=parseFloat(dot.getAttribute("r"))||0,r=Math.max(.12,tier.dot*base*k);dot.setAttribute("r",r.toFixed(3));if(ring&&old){const ro=parseFloat(ring.getAttribute("r"))||0;if(ro)ring.setAttribute("r",(ro*r/old).toFixed(3))}})}catch(e){console.error(e)}return out}})();
/* 28. Profile photos: the same picture never shows twice in one country's photos (two copies of one Commons image were
   added under different names), and no "No Official Capital" capital slide */
(function(){const DROP={br:["Brasília, the capital"],so:["Mogadishu, the capital"],nr:["No Official Capital, the capital"]};let n=0;
 const go=()=>{try{if(!window.PS_CPHOTO||typeof PS_PHOTO_DATA==="undefined")throw 0;
  Object.entries(PS_CPHOTO).forEach(([c,L])=>{if(!Array.isArray(L))return;const seen=new Set,drop=DROP[c]||[];
   PS_CPHOTO[c]=L.filter(x=>{const p=PS_PHOTO_DATA[x[0]],k=p&&(p.d||p.f);if(drop.includes(x[1])||/^No Official Capital/i.test(x[1]||""))return false;if(k&&seen.has(k))return false;if(k)seen.add(k);return true})})}catch(e){}
  if(++n<30)setTimeout(go,700)};setTimeout(go,300)})();
/* 29. Territory flags come from the app itself (they were fetched from flagcdn.com, which can be slow or blocked, leaving
   an empty first slide in the profile) */
(function(){try{if(typeof FLAG_OVERRIDES==="undefined")return;"ai aq as aw ax bl bm bv cc ck cw cx fk fo gf gg gi gl gp gs gu hk hm im io je ky mf mo mp mq ms nc nf nu pf pm pn pr re sh sj sx tc tf tk tw vg vi wf yt".split(" ").forEach(c=>{
 if(!FLAG_OVERRIDES[c]&&!(typeof FLAG_LOCAL!=="undefined"&&FLAG_LOCAL[c])&&!(typeof FLAG_WEBP!=="undefined"&&FLAG_WEBP[c]))FLAG_OVERRIDES[c]="flags-extra/t-"+c+".webp"})}catch(e){console.error(e)}})();
/* 30. Landform names (ranges, deserts, plains…) and peak names grow at about half the zoom rate, like the icons: each
   label keeps its whole-world size and is scaled by the square root of the zoom. Volcanic summits get a red triangle
   with a notch for the crater; other peaks keep the brown triangle. */
const GF_VOLC_PEAKS=new Set(["kilimanjaro","elbrus","ojos del salado","chimborazo","cotopaxi","popocatepetl","popocatépetl","pico de orizaba","citlaltepetl","rainier","fuji","ararat","damavand","teide","etna","vesuvius","erebus","st. helens","saint helens","shasta","hood","baker","mauna kea","mauna loa","kilauea","llullaillaco","sajama","nevado del ruiz","tolima","misti","el misti","villarrica","osorno","lanin","klyuchevskaya sopka","kliuchevskoi","kerinci","rinjani","semeru","merapi","agung","mayon","pinatubo","taal","cameroon","mount cameroon","nyiragongo","karisimbi","meru","kenya","stromboli","hekla","pico","tambora","krakatoa","takahe","sidley","aconcagua"]);
function gfIsVolcano(name){const n=String(name||"").toLowerCase().replace(/^(mount|mt\.?|volcán|volcan|nevado|gora|cerro|gunung)\s+/,"").replace(/\s*\(.*$/,"").trim();if(n==="aconcagua"||n==="kenya")return false;if(GF_VOLC_PEAKS.has(n))return true;
 try{return(GF_LAYER_DATA.hazards.volcanoes||[]).some(v=>String(v.n).toLowerCase().replace(/^(mount|mt\.?)\s+/,"").replace(/\s*\(.*$/,"").trim()===n)}catch(e){return false}}
(function(){if(typeof rescaleLandforms!=="function")return;const _r=rescaleLandforms;
 rescaleLandforms=function(svg,zoomRatio,sizeScale){const out=_r.apply(this,arguments);try{
  let z=zoomRatio,s=sizeScale;if(z===undefined&&typeof lastLandformZoom!=="undefined"&&lastLandformZoom){z=lastLandformZoom.z;s=lastLandformZoom.s}
  const g=svg&&svg.querySelector("g.map-landforms");if(!g||!z)return out;const zr=Math.min(1,z),q=Math.sqrt(zr),es1=(s||1)*labelZoomMult(1),RW=[1.26,1.16,1.04,.92,.84];
  g.querySelectorAll("g.landform-item").forEach(item=>{if(item.style.display==="none")return;const t=item.querySelector("text");if(!t)return;const old=parseFloat(t.getAttribute("font-size"))||0;if(!old)return;
   if(item.dataset.cat==="peaks"){const tier=CITY_TIERS[Math.min(+item.dataset.tier,CITY_TIERS.length-1)];const want=Math.max(.5,Math.min(9*es1,tier.font*es1))*q,f=want/old,pr=Math.max(.12,tier.dot*es1)*q;
     const px=+item.dataset.x,py=+item.dataset.y,tx=parseFloat(t.getAttribute("x")),ty=parseFloat(t.getAttribute("y"));t.setAttribute("font-size",want.toFixed(2));t.setAttribute("stroke-width",(want*.3).toFixed(2));t.setAttribute("x",(px+(tx-px)*f).toFixed(2));t.setAttribute("y",(py+(ty-py)*f).toFixed(2));
     const m=item.querySelector(".peak-mark");if(m){const v=item.dataset.volc!=null?item.dataset.volc==="1":(item.dataset.volc=gfIsVolcano(t.textContent.replace(/\s[\d,.]+\s*m$/,""))?"1":"0")==="1";
      m.classList.toggle("is-volcano",v);m.setAttribute("d",v?"M"+(px-pr*1.15)+","+(py+pr*.85)+"L"+(px-pr*.32)+","+(py-pr*1.05)+"L"+(px-pr*.12)+","+(py-pr*.8)+"L"+(px+pr*.12)+","+(py-pr*.8)+"L"+(px+pr*.32)+","+(py-pr*1.05)+"L"+(px+pr*1.15)+","+(py+pr*.85)+"Z":"M"+px+","+(py-pr*1.25)+"L"+(px+pr*1.05)+","+(py+pr*.85)+"L"+(px-pr*1.05)+","+(py+pr*.85)+"Z")}
     return}
   const ext=parseFloat(item.dataset.ext)||0,rank=Math.min(Math.max(+item.dataset.rank||4,1),5),scr=5.2*es1,mapSize=ext*.05*RW[rank-1];
   const want=Math.max(scr*.45,Math.min(Math.sqrt(mapSize*scr)*1.2,34))*q,f=want/old;if(Math.abs(f-1)<.01)return;
   t.setAttribute("font-size",want.toFixed(2));t.setAttribute("stroke-width",(want*.26).toFixed(2));const ls=parseFloat(t.getAttribute("letter-spacing"))||0;if(ls)t.setAttribute("letter-spacing",(ls*f).toFixed(2))})}catch(e){console.error(e)}return out}
 const st=document.createElement("style");st.textContent=".map-wrap svg path.peak-mark.is-volcano, .map-wrap.relief-mode svg path.peak-mark.is-volcano{ fill:#d63a2a !important; stroke:#fff; stroke-width:.25; }";document.head.appendChild(st)})();
/* 31. The Labels and Plates ▾ menus look and work like the Landforms one: a "Show" checklist floating over the page */
(function(){const st=document.createElement("style");st.textContent=`
.gf-fold > .gf-fcaret{ background:none; border:1px solid transparent; border-radius:6px; cursor:pointer; color:rgba(var(--text-rgb),0.7); font-size:12px; line-height:1; padding:4px 5px; margin-left:0; opacity:1; }
.gf-fold > .gf-fcaret:hover, .gf-fold > .gf-fcaret[aria-expanded="true"]{ border-color:var(--line); color:rgb(var(--text-rgb)); background:var(--raised); }
.gf-fold-pop{ top:calc(100% + 8px) !important; min-width:200px; gap:2px !important; padding:8px !important; background:var(--surface) !important; border:1px solid var(--line); border-radius:10px !important; box-shadow:0 10px 28px rgba(0,0,0,0.22) !important; }
.gf-fold-pop::before{ content:"Show"; display:block; padding:2px 6px 6px; font-family:'JetBrains Mono',monospace; font-size:10px; letter-spacing:.1em; text-transform:uppercase; color:rgba(var(--text-rgb),0.55); border-bottom:1px solid var(--line); margin-bottom:4px; }
.gf-fold-pop label.switch{ display:flex; align-items:center; gap:9px; width:100%; cursor:pointer; border-radius:6px; padding:7px 8px; margin:0; }
.gf-fold-pop label.switch:hover{ background:var(--raised); }
.gf-fold-pop label.switch .switch-track{ display:none !important; }
.gf-fold-pop label.switch input{ position:absolute; opacity:0; pointer-events:none; }
.gf-fold-pop label.switch .switch-label{ font-family:'Inter',sans-serif !important; font-size:13px !important; text-transform:none !important; letter-spacing:0 !important; color:rgb(var(--text-rgb)) !important; display:flex; align-items:center; gap:9px; font-weight:400; }
.gf-fold-pop label.switch .switch-label::before{ content:""; width:15px; height:15px; border-radius:4px; border:1.5px solid rgba(var(--text-rgb),0.35); box-sizing:border-box; flex-shrink:0; }
.gf-fold-pop label.switch:has(input:checked) .switch-label::before{ background:var(--gold); border-color:var(--gold); background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M4 8.5l2.6 2.6L12 5.6' fill='none' stroke='white' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); background-size:100%; }
`;document.head.appendChild(st)})();
/* 32. Lagoa dos Patos is a lake on the maps (in the base data it was part of the sea): its outline (Natural Earth 1:10m land,
   the water behind the barrier beach) joins the lake shapes, drawn the same way as Lagoa Mirim next to it. */
(function(){try{if(typeof ALLMAPS_LAKES_MINOR==="undefined"||typeof SPIN==="undefined"||ALLMAPS_LAKES_MINOR.some(x=>x[0]==="Lagoa dos Patos"))return;
 const R=[[-52.236,-32.08],[-52.211,-32.057],[-52.259,-32.054],[-52.238,-31.966],[-52.134,-31.931],[-52.21,-31.869],[-52.236,-31.88],[-52.248,-31.862],[-52.21,-31.8],[-52.219,-31.741],[-52.063,-31.665],[-52.041,-31.623],[-52.046,-31.608],[-52.09,-31.606],[-52.083,-31.559],[-52.04,-31.57],[-52.008,-31.646],[-51.985,-31.574],[-52.005,-31.54],[-51.999,-31.409],[-51.943,-31.359],[-51.964,-31.332],[-51.923,-31.307],[-51.857,-31.311],[-51.819,-31.272],[-51.638,-31.257],[-51.651,-31.205],[-51.624,-31.135],[-51.443,-31.081],[-51.471,-31.053],[-51.486,-30.967],[-51.455,-30.889],[-51.362,-30.879],[-51.382,-30.776],[-51.377,-30.642],[-51.322,-30.642],[-51.291,-30.74],[-51.289,-30.767],[-51.314,-30.773],[-51.298,-30.795],[-51.27,-30.782],[-51.29,-30.624],[-51.25,-30.462],[-51.2,-30.4],[-51.115,-30.401],[-51.091,-30.352],[-51.188,-30.36],[-51.204,-30.285],[-51.238,-30.313],[-51.292,-30.272],[-51.265,-30.245],[-51.282,-30.221],[-51.327,-30.225],[-51.306,-30.187],[-51.314,-30.155],[-51.292,-30.084],[-51.306,-30.07],[-51.284,-30.007],[-51.262,-30.014],[-51.259,-30.047],[-51.238,-30.04],[-51.251,-30.108],[-51.217,-30.156],[-51.233,-30.19],[-51.18,-30.2],[-51.176,-30.225],[-51.123,-30.256],[-51.079,-30.238],[-51.058,-30.242],[-51.053,-30.265],[-51.023,-30.264],[-51.012,-30.296],[-51.04,-30.344],[-51.034,-30.376],[-50.936,-30.432],[-50.915,-30.436],[-50.933,-30.381],[-50.913,-30.317],[-50.799,-30.323],[-50.779,-30.293],[-50.672,-30.289],[-50.653,-30.252],[-50.676,-30.218],[-50.637,-30.185],[-50.604,-30.194],[-50.54,-30.268],[-50.537,-30.32],[-50.573,-30.409],[-50.572,-30.461],[-50.608,-30.485],[-50.65,-30.439],[-50.645,-30.392],[-50.69,-30.353],[-50.726,-30.363],[-50.69,-30.464],[-50.679,-30.642],[-50.693,-30.726],[-50.76,-30.815],[-50.82,-30.831],[-50.914,-30.893],[-50.978,-30.893],[-50.956,-30.923],[-50.988,-31.046],[-50.97,-31.074],[-50.936,-31.088],[-50.965,-31.101],[-50.976,-31.131],[-51.003,-31.133],[-51.014,-31.063],[-51.162,-31.078],[-51.176,-31.149],[-51.155,-31.212],[-51.159,-31.286],[-51.18,-31.359],[-51.245,-31.464],[-51.335,-31.519],[-51.378,-31.527],[-51.413,-31.518],[-51.423,-31.485],[-51.463,-31.557],[-51.448,-31.613],[-51.499,-31.575],[-51.513,-31.616],[-51.666,-31.77],[-51.704,-31.793],[-51.834,-31.8],[-51.814,-31.828],[-51.836,-31.855],[-51.923,-31.869],[-52.048,-31.808],[-52.087,-31.828],[-52.088,-31.859],[-52.012,-31.951],[-52.057,-31.988],[-52.036,-32.028],[-52.049,-32.08],[-52.092,-32.08],[-52.087,-32.067],[-52.149,-32.08],[-52.081,-32.038],[-52.108,-32.026],[-52.182,-32.079],[-52.236,-32.08]],f=SPIN.A.f,d="M"+R.map(ll=>{const q=GLOBE_ROBINSON0(ll);return(f.s*q[0]+f.bx).toFixed(2)+","+(f.s*q[1]+f.by).toFixed(2)}).join("L")+"Z";
 ALLMAPS_LAKES_MINOR.push(["Lagoa dos Patos",d]);
 if(typeof ATLAS_LAKES_MINOR!=="undefined"&&!ATLAS_LAKES_MINOR.some(x=>x[0]==="Lagoa dos Patos")){const m=ATLAS_LAKES_MINOR.find(x=>x[0]==="Lagoa Mirim"),a=ALLMAPS_LAKES_MINOR.find(x=>x[0]==="Lagoa Mirim");
  /* the atlas map is the same projection at another scale: map one onto the other using Lagoa Mirim's first point */
  if(m&&a){const p0=a[1].match(/^M([\d.-]+),([\d.-]+)/),q0=m[1].match(/^M([\d.-]+),([\d.-]+)/),k=1.0125;if(p0&&q0){const sx=k,ox=+q0[1]-sx*+p0[1],oy=+q0[2]-sx*+p0[2];
   ATLAS_LAKES_MINOR.push(["Lagoa dos Patos",d.replace(/([\d.-]+),([\d.-]+)/g,(_,x,y)=>(sx*+x+ox).toFixed(2)+","+(sx*+y+oy).toFixed(2))])}}}}catch(e){console.error(e)}})();
/* 33. Globe relief: the picture is built from a western and an eastern half; a small brightness step where they meet (0°
   longitude, e.g. through eastern Spain and Ghana) is smoothed away over a few dozen pixels. */
(function(){if(typeof gfGlobeBuild!=="function")return;const _b=gfGlobeBuild;
 gfGlobeBuild=function(){const c=_b.apply(this,arguments);try{if(c&&c.getContext&&!c._gfMid){c._gfMid=1;const W=c.width,H=c.height,m=Math.round(W/2),S=Math.max(8,Math.round(W/700)),k=3,x0=m-S-k,w=2*(S+k),g=c.getContext("2d"),D=g.getImageData(x0,0,w,H),d=D.data;
   for(let y=0;y<H;y++){const row=y*w*4;for(let ch=0;ch<3;ch++){let L=0,R=0;for(let i=0;i<k;i++){L+=d[row+(S-1-i+k)*4+ch];R+=d[row+(S+i+k)*4+ch]}const delta=(R-L)/k;
     for(let x=0;x<w;x++){const dist=x-(S+k-.5),t=Math.max(0,1-Math.abs(dist)/(S+k));if(!t)continue;const o=row+x*4+ch;d[o]=Math.max(0,Math.min(255,d[o]+(dist<0?1:-1)*delta*.5*t))}}}
   g.putImageData(D,x0,0)}}catch(e){console.error(e)}return c}})();

/* 34: the home page's flock flaps its wings by script rather than SVG <animate> tags, which some browsers (Safari above
   all) leave frozen. Each bird keeps its own beat and phase; the loop only runs while the flock is on screen. */
(function(){const NUM=/-?\d*\.?\d+/g,sh=s=>s.match(NUM).map(Number);
 const ease=t=>t*t*(3-2*t);
 function lerpD(A,B,t,tpl){let i=0;return tpl.replace(NUM,()=>{const v=A[i]+(B[i]-A[i])*t;i++;return v.toFixed(2)})}
 function prep(svg){svg._gfB=[];svg.querySelectorAll("path").forEach(p=>{const a=p.querySelector("animate"),g=p.parentNode,at=g.querySelector("animateTransform");if(!a)return;
   const vals=a.getAttribute("values").split(";"),kt=(a.getAttribute("keyTimes")||"").split(";").map(Number),dur=parseFloat(a.getAttribute("dur"))||.7,beg=parseFloat(a.getAttribute("begin"))||0;
   if(sh(vals[0]).length!==sh(vals[2]).length)return;a.remove();if(at)at.remove();
   svg._gfB.push({p,g,K:vals.map(sh),kt:kt.length===vals.length?kt:vals.map((v,i)=>i/(vals.length-1)),tpl:vals[1],dur,beg})})}
 function tick(now){const svg=document.querySelector(".hi-birds");if(svg&&svg.isConnected&&svg.getBoundingClientRect().width){if(!svg._gfB)prep(svg);const t=now/1000;
   svg._gfB.forEach(b=>{const f=(((t-b.beg)/b.dur)%1+1)%1;let k=0;while(k<b.kt.length-2&&f>b.kt[k+1])k++;const u=ease((f-b.kt[k])/(b.kt[k+1]-b.kt[k]||1));
    b.p.setAttribute("d",lerpD(b.K[k],b.K[k+1],u,b.tpl));const y=Math.sin(f*2*Math.PI)*-1.3;b.g.setAttribute("transform","translate(0 "+y.toFixed(2)+")")})}
  requestAnimationFrame(tick)}
 if(!(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches))requestAnimationFrame(tick)})();

/* 35: the label size buttons live in the Labels switch's drop-down (with the other label choices), not in the map key */
(function(){const st=document.createElement("style");st.textContent=`
 #amLabPill{ display:none !important; }
 .gf-lsize{ display:flex; align-items:center; gap:6px; margin-top:6px; padding-top:7px; border-top:1px solid rgba(29,53,80,.12); font:600 12px system-ui; color:#33475b; }
 .gf-lsize span{ flex:1; } .gf-lsize button{ border:1px solid rgba(29,53,80,.18); background:#fff; color:#1d3550; border-radius:999px; min-width:34px; height:26px; font:700 13px system-ui; cursor:pointer; }
 .gf-lsize button:hover{ background:#eef4f8; } body.dark-theme .gf-lsize{ color:#dbe6f2; } body.dark-theme .gf-lsize button{ background:#22324a; color:#dbe6f2; }`;document.head.appendChild(st);
 const add=()=>{document.querySelectorAll('.gf-fold[data-g="Labels"] .gf-fold-pop').forEach(pop=>{if(pop.querySelector(".gf-lsize"))return;const r=document.createElement("div");r.className="gf-lsize";
  r.innerHTML='<span>Label size</span><button type="button" data-lab="-" title="Smaller labels">A<sup>−</sup></button><button type="button" data-lab="+" title="Bigger labels">A<sup>+</sup></button>';
  r.addEventListener("click",e=>{const b=e.target.closest("[data-lab]");if(!b)return;e.stopPropagation();e.preventDefault();try{amcLabel(b.dataset.lab==="+")}catch(er){}});pop.appendChild(r)})};
 setInterval(()=>{try{add()}catch(e){}},700)})();

/* 36: flashcards swap two cards on drop, so the card under the pointer is outlined (not a line between cards) */
(function(){const st=document.createElement("style");st.textContent=".flash.drag-line-before::before,.flash.drag-line-after::before{display:none !important}.flash.drag-line-before{outline:3px dashed rgba(110,90,200,.75);outline-offset:3px}";document.head.appendChild(st)})();

/* 37: a pin's leader line ends on the visible card (photo and name), not on the padded box around it, so they touch */
(function(){if(typeof psLeaders!=="function")return;const _pl=psLeaders;psLeaders=function(pinsEl,rects){try{const labs=[...pinsEl.querySelectorAll(".ps-lab")];
  if(labs.length===rects.length){const o=pinsEl.getBoundingClientRect();rects.forEach((r,k)=>{if(!r)return;const el=labs[k];let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;
   [...el.querySelectorAll("*")].concat([el]).forEach(c=>{if(c!==el&&c.children.length)return;const b=c.getBoundingClientRect();if(!b.width||!b.height)return;if(getComputedStyle(c).visibility==="hidden")return;x0=Math.min(x0,b.left);y0=Math.min(y0,b.top);x1=Math.max(x1,b.right);y1=Math.max(y1,b.bottom)});
   if(!isFinite(x0))return;const L=x0-o.left,T=y0-o.top,R=x1-o.left,B=y1-o.top,ex=Math.max(L,Math.min(R,r.ax)),ey=Math.max(T,Math.min(B,r.ay));r.ex=ex;r.ey=ey})}}catch(e){}return _pl.apply(this,arguments)}})();

/* 38: "Relief underneath" sits in the map key again (with its colours), not in the switch rows over the map */
(function(){const st=document.createElement("style");st.textContent="#amReliefUnderSw{display:none !important} #populationLegend label.hist-relief-sw,#flKey label.hist-relief-sw{display:inline-flex !important}";document.head.appendChild(st)})();

/* 39: tour labels keep off the stop's own lines (rivers, routes, arrows) and the photo pins' spots, can be dragged
   anywhere like the photos, and a pin is shown by a ring around the place (the line ends on the ring), not a dot on it */
(function(){if(typeof psLayout!=="function"||typeof psLeaders!=="function")return;
 const _lay=psLayout;psLayout=function(cands,pins,sizes,W,H,blocks){try{const S=psSteps()[ps.i]||{},B=blocks.slice();
   (S.lines||[]).forEach(L=>{const c=L.coords||[];for(let i=0;i<c.length;i++){const a=psScreen(c[i]),b=i+1<c.length?psScreen(c[i+1]):null;if(!a)continue;const n=b?Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/14)):1;
    for(let j=0;j<n;j++){const x=b?a[0]+(b[0]-a[0])*j/n:a[0],y=b?a[1]+(b[1]-a[1])*j/n:a[1];B.push({x:x-7,y:y-7,w:14,h:14})}}});
   (S.phPins||[]).forEach(q=>{const a=q.at&&psScreen(q.at);if(a)B.push({x:a[0]-10,y:a[1]-10,w:20,h:20})});
   const r=_lay.call(this,cands,pins,sizes,W,H,B);const off=ps._labOff&&ps._labOff.i===ps.i?ps._labOff.d:null;
   if(off)r.forEach((q,k)=>{const d=off[k];if(!q||!d)return;q.x+=d[0];q.y+=d[1];q.ex=Math.max(q.x,Math.min(q.x+q.w,q.ax));q.ey=Math.max(q.y,Math.min(q.y+q.h,q.ay));q.gap=Math.max(q.gap||0,9)});return r}catch(e){return _lay.apply(this,arguments)}};
 /* pins are small solid dots; a ring (a circle around the spot, the leader stopping at its edge) only where a dot would
    cover what the pin is about: a pin marked {ring:true} (or "ring" as its kind) */
 const RR=8,_ldr=psLeaders;psLeaders=function(pinsEl,rects){const r=_ldr.apply(this,arguments);try{const svg=pinsEl.querySelector(".ps-leaders");if(!svg)return r;
   const S=(typeof psSteps==="function"&&ps)?psSteps()[ps.i]||{}:{},want=(S.pins||[]).filter(p=>p&&(p.ring||(Array.isArray(p)&&(p[2]==="ring"||p[3]==="ring")))).map(p=>{try{return psScreen(Array.isArray(p)?p[0]:p.at)}catch(e){return null}}).filter(Boolean);
   svg.querySelectorAll("circle.ps-dot").forEach(c=>{const x=+c.getAttribute("cx"),y=+c.getAttribute("cy");
    if(!want.some(q=>Math.hypot(q[0]-x,q[1]-y)<3)){c.classList.remove("ps-ring");c.classList.add("ps-dot-s");c.setAttribute("r",3.6);return}
    c.setAttribute("r",RR);c.classList.add("ps-ring");
    svg.querySelectorAll("line.ps-ldr, line.ps-ldr-h").forEach(l=>{if(Math.abs(+l.getAttribute("x1")-x)<.6&&Math.abs(+l.getAttribute("y1")-y)<.6){const x2=+l.getAttribute("x2"),y2=+l.getAttribute("y2"),d=Math.hypot(x2-x,y2-y);if(d>RR+2){l.setAttribute("x1",(x+(x2-x)/d*RR).toFixed(1));l.setAttribute("y1",(y+(y2-y)/d*RR).toFixed(1))}}})})}catch(e){}return r};
 /* dragging a label: it stays where it is put for this stop, and its line follows */
 let drag=null;
 document.addEventListener("pointerdown",e=>{const el=e.target.closest&&e.target.closest(".ps-pins .ps-lab");if(!el||e.button||!ps||!ps.lay)return;const pinsEl=el.closest(".ps-pins"),labs=[...pinsEl.querySelectorAll(".ps-lab")],k=labs.indexOf(el),R=ps.lay.rects[k];if(!R)return;
  e.preventDefault();e.stopPropagation();drag={el,k,pinsEl,x:e.clientX,y:e.clientY,moved:false};try{el.setPointerCapture(e.pointerId)}catch(er){}},true);
 document.addEventListener("pointermove",e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!drag.moved&&Math.hypot(dx,dy)<3)return;drag.moved=true;drag.x=e.clientX;drag.y=e.clientY;e.stopPropagation();
  const R=ps.lay.rects[drag.k];if(!R)return;R.x+=dx;R.y+=dy;R.ex=Math.max(R.x,Math.min(R.x+R.w,R.ax));R.ey=Math.max(R.y,Math.min(R.y+R.h,R.ay));R.gap=Math.max(R.gap||0,9);drag.el.style.left=R.x+"px";drag.el.style.top=R.y+"px";
  if(!ps._labOff||ps._labOff.i!==ps.i)ps._labOff={i:ps.i,d:{}};const o=ps._labOff.d[drag.k]||[0,0];ps._labOff.d[drag.k]=[o[0]+dx,o[1]+dy];psLeaders(drag.pinsEl,ps.lay.rects)},true);
 document.addEventListener("pointerup",e=>{if(!drag)return;const m=drag.moved;drag=null;if(m){e.stopPropagation();const stop=c=>{c.stopPropagation();c.preventDefault();removeEventListener("click",stop,true)};addEventListener("click",stop,true);setTimeout(()=>removeEventListener("click",stop,true),60)}},true);
 const st=document.createElement("style");st.textContent=`
 .ps-pins .ps-lab{ pointer-events:auto; cursor:grab; touch-action:none; user-select:none; }
 .ps-pins .ps-lab:active{ cursor:grabbing; }
 .ps-leaders circle.ps-dot-s{ fill:#13294b !important; stroke:#fff !important; stroke-width:1.6px !important; }
 .ps-leaders circle.ps-ring{ fill:none !important; stroke:#13294b !important; stroke-width:2px !important; paint-order:stroke; filter:drop-shadow(0 0 1.2px #fff) drop-shadow(0 0 1px #fff); }`;document.head.appendChild(st)})();

/* 40: the photo pins mark their spot with a small dot (rings were too many and looked strange) */
(function(){const fix=()=>{if(typeof psPhPinsSync!=="function"||psPhPinsSync._gfRing)return false;const _s=psPhPinsSync;
  psPhPinsSync=function(){const r=_s.apply(this,arguments);try{const box=psContainer&&psContainer(),svg=box&&box.querySelector(".ps-phpins svg.ps-sq-lead");if(svg){const RR=6;
   /* a pin with ringKm marks a small area drawn as a circle of that size: no dot, and its line ends at the circle's edge */
   const rk=[];try{(psSteps()[ps.i].phPins||[]).forEach(q=>{if(q&&q.ringKm){const a=psScreen(q.at),b=psScreen([q.at[0]+q.ringKm/(111.32*Math.cos(q.at[1]*Math.PI/180)),q.at[1]]);if(a&&b)rk.push([a[0],a[1],Math.hypot(b[0]-a[0],b[1]-a[1])])}})}catch(e){}
   svg.querySelectorAll("circle").forEach(c=>{const x=+c.getAttribute("cx"),y=+c.getAttribute("cy");const ring=rk.find(k=>Math.hypot(k[0]-x,k[1]-y)<1.5);
    if(ring){c.setAttribute("r",0);c.style.display="none";svg.querySelectorAll("line").forEach(l=>{if(Math.abs(+l.getAttribute("x1")-x)<.6&&Math.abs(+l.getAttribute("y1")-y)<.6){const x2=+l.getAttribute("x2"),y2=+l.getAttribute("y2"),d=Math.hypot(x2-x,y2-y),R=ring[2]+1;if(d>R+2){l.setAttribute("x1",(x+(x2-x)/d*R).toFixed(1));l.setAttribute("y1",(y+(y2-y)/d*R).toFixed(1))}else l.style.display="none"}});return}
    c.setAttribute("r",3.4);c.classList.add("ps-dot2");
    svg.querySelectorAll("line").forEach(l=>{if(Math.abs(+l.getAttribute("x1")-x)<.6&&Math.abs(+l.getAttribute("y1")-y)<.6){const x2=+l.getAttribute("x2"),y2=+l.getAttribute("y2"),d=Math.hypot(x2-x,y2-y);if(d>RR+2){l.setAttribute("x1",(x+(x2-x)/d*RR).toFixed(1));l.setAttribute("y1",(y+(y2-y)/d*RR).toFixed(1))}}})})}}catch(e){}return r};psPhPinsSync._gfRing=1;return true};
 if(!fix()){const t=setInterval(()=>{if(fix())clearInterval(t)},500)}
 const st=document.createElement("style");st.textContent=".ps-sq-lead circle.ps-dot2{ stroke:#fff !important; stroke-width:1.4px !important; }";document.head.appendChild(st)})();

/* 41: the time-zones tour runs on the satellite map, which is already dark: no dimming outside the highlighted places
   (they keep their white outline) */
(function(){const fix=()=>{if(typeof psDimFill!=="function"||psDimFill._gfTime)return false;const _d=psDimFill;psDimFill=function(){try{if(typeof ps!=="undefined"&&ps&&ps.tour==="time")return"rgba(0,0,0,0)"}catch(e){}return _d.apply(this,arguments)};psDimFill._gfTime=1;return true};
 if(!fix()){const t=setInterval(()=>{if(fix())clearInterval(t)},500)}})();
