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
 globeOverlays=function(){const O=_go.apply(this,arguments);try{if(O&&O.lakes&&!O._lakeHoles){O._lakeHoles=1;O.lakes.forEach(holes)}}catch(e){console.error(e)}return O}}
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
/* 6. */
(function(){const SA=Element.prototype.setAttribute,GA=Element.prototype.getAttribute,GR=Element.prototype.getBoundingClientRect;
 const parse=v=>{const a=String(v||"").split(/[ ,]+/).map(Number);return a.length===4&&a.every(isFinite)&&a[2]>0?a:null};
 function fast(svg){if(svg._gfFast)return;svg._gfFast=1;let pend=null,cur=null,rect=null,t=0,first=0;
  /* the transform lives in a stylesheet rule, so no attribute changes (other code watches the map's attributes) */
  const id=svg.parentNode.id,st=document.createElement("style");st.textContent="#"+id+" > svg{}";document.head.appendChild(st);const rule=st.sheet.cssRules[0].style;
  const commit=()=>{clearTimeout(t);t=0;if(!pend)return;const v=pend;pend=null;svg._gfPend=false;rect=null;measure();rule.transform="";rule.willChange="";SA.call(svg,"viewBox",v.join(" "));cur=v;const h=svg._gfHeld;svg._gfHeld=null;if(h)try{h[0].apply(h[1],h[2])}catch(e){console.error(e)}};
  svg.setAttribute=function(n,v){if(n!=="viewBox")return SA.apply(this,arguments);const b=parse(v);if(!b){commit();return SA.apply(this,arguments)}
   if(!cur)cur=parse(GA.call(svg,"viewBox"));if(!cur||!svg.isConnected||!svg.getClientRects().length){pend=null;cur=b;return SA.apply(this,arguments)}
   const now=performance.now();if(!pend){first=now;rect=box0}if(!rect||!rect.width){pend=null;cur=b;return SA.apply(this,arguments)}pend=b;svg._gfPend=true;
   const ppu=rect.width/cur[2],s=cur[2]/b[2];
   rule.transformOrigin="0 0";rule.willChange="transform";rule.transform="translate("+(-(b[0]-cur[0])*ppu*s)+"px,"+(-(b[1]-cur[1])*ppu*s)+"px) scale("+s+")";
   clearTimeout(t);if(now-first>600)commit();else t=setTimeout(commit,170)};
  let box0=null;const measure=()=>requestAnimationFrame(()=>{if(pend)return;const r=GR.call(svg),p=GR.call(svg.parentNode);box0={left:r.left,top:r.top,width:r.width,height:r.height,_pl:p.left,_pt:p.top}});
  try{new ResizeObserver(measure).observe(svg)}catch(e){}measure();
  svg.getAttribute=function(n){if(n==="viewBox"&&pend)return pend.join(" ");return GA.apply(this,arguments)};
  /* while transformed, the map keeps reporting its untransformed box, so pointer maths stays right */
  svg.getBoundingClientRect=function(){if(pend&&rect){const r=GR.call(svg.parentNode);return new DOMRect(rect.left+(r.left-rect._pl),rect.top+(r.top-rect._pt),rect.width,rect.height)}return GR.call(this)}}
 /* zoom callbacks (border widths, label sizes, detailed coasts) change the drawing, so they wait for the commit */
 if(typeof attachMapPanZoom==="function"){const _ap=attachMapPanZoom;attachMapPanZoom=function(wrapEl,box,cb){if(typeof cb!=="function"||!wrapEl||!/^(allMapsWrap|atlasStudyMapWrap)$/.test(wrapEl.id))return _ap.apply(this,arguments);
  const held=function(){const svg=wrapEl.querySelector("svg");if(svg&&svg._gfPend){svg._gfHeld=[cb,this,arguments];return}return cb.apply(this,arguments)};return _ap.call(this,wrapEl,box,held,...[].slice.call(arguments,3))}}
 const scan=()=>document.querySelectorAll("#allMapsWrap > svg, #atlasStudyMapWrap > svg").forEach(fast);
 let q=0;new MutationObserver(()=>{if(!q)q=setTimeout(()=>{q=0;scan()},300)}).observe(document.documentElement,{childList:true,subtree:true});scan()})();
/* 7. */
if(typeof gfSubFlat==="function"){const _sf=gfSubFlat;
 gfSubFlat=function(){try{const host=document.getElementById("allMapsSubModes"),view=document.getElementById("allMapsView");if(!host||!view)return;
  const row=view.querySelector(".all-maps-label-controls"),srch=row&&row.querySelector(":scope > .global-search-wrap");
  const flat=appMode==="allmaps"&&!(typeof amGlobeOn==="function"&&amGlobeOn())&&window.innerWidth>760;
  if(flat&&row&&host.children.length&&!host.closest(".am-globe-side")){
   if(host.parentNode!==row||(srch&&host.nextElementSibling!==srch))row.insertBefore(host,srch||null);
   host.classList.add("gf-sub-inrow");["gf-sub-top","gf-sub-flat","am-sub-top","am-sub-globe","am-sub-row","am-sub-left","map-submode-overlay"].forEach(c=>host.classList.remove(c));
   if(host.style.left)host.style.left="";if(host.style.top)host.style.top="";if(host.style.visibility)host.style.visibility="";fit(host,row,srch);return}
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
 const st=document.createElement("style");st.textContent=`
 #allMapsSubModes.gf-sub-dd > .chip:not(.active){ display:none !important; }
 #allMapsSubModes.gf-sub-dd > .chip.active::after{ content:" ▾"; font-size:.85em; opacity:.85; }
 .gf-sub-menu{ position:absolute; z-index:9500; display:flex; flex-direction:column; gap:2px; padding:5px; border-radius:14px; background:#fff; box-shadow:0 8px 28px rgba(20,40,70,.22); min-width:180px; }
 .gf-sub-menu button{ text-align:left; border:0; background:none; padding:8px 12px; border-radius:9px; font:600 13px inherit; color:#1d3550; cursor:pointer; }
 .gf-sub-menu button:hover{ background:#eef4f8; } .gf-sub-menu button.on{ background:#3f9c96; color:#fff; }
 body.dark-theme .gf-sub-menu{ background:#1d2638; } body.dark-theme .gf-sub-menu button{ color:#e6edf7; } body.dark-theme .gf-sub-menu button:hover{ background:#2a3550; }
 #allMapsSubModes.gf-sub-inrow{ position:static !important; display:inline-flex !important; flex-direction:row; flex-wrap:nowrap; align-items:center; gap:2px; margin:0 0 0 4px !important; padding:3px; width:auto; max-width:none; border-radius:999px; background:rgba(255,255,255,.6); box-shadow:0 1px 5px rgba(20,40,70,.12); transform:none !important; }
 #allMapsSubModes.gf-sub-inrow .chip{ font-size:11.5px; padding:4px 11px; min-height:0; line-height:1.2; border:none; box-shadow:none; white-space:nowrap; margin:0; }
 #allMapsSubModes.gf-sub-inrow .chip:not(.active){ background:transparent; }
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
html body .flag-zoom-close, html body #flagZoomClose{ min-width:24px !important; min-height:24px !important; width:24px !important; height:24px !important; padding:0 !important;
 position:absolute !important; top:8px !important; right:10px !important; left:auto !important; margin:0 !important; outline:none !important; background:transparent !important; border:0 !important; box-shadow:none !important; border-radius:50% !important;
 color:rgba(22,50,79,.45) !important; font-size:20px !important; line-height:1 !important; backdrop-filter:none !important; }
html body .flag-zoom-close:focus-visible, html body #flagZoomClose:focus-visible{ background:rgba(22,50,79,.1) !important; }
#flagZoomOverlay .flag-zoom-panel{ position:relative; }
html body .flag-zoom-close:hover, html body #flagZoomClose:hover{ color:var(--coral,#e0603f) !important; background:rgba(22,50,79,.06) !important; }
html body .flag-zoom-close svg, html body #flagZoomClose svg{ width:14px !important; height:14px !important; }
body.dark-theme .flag-zoom-close, body.sky-night .flag-zoom-close{ color:rgba(230,237,247,.6) !important; }`;document.head.appendChild(st)}
})();
