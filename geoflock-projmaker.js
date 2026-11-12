/* GeoFlock: "Make your own projection", a panel inside Projections. Pick a family (cylindrical, conic, azimuthal or
   pseudo-cylindrical), move the sliders and the world map redraws at once. A blend slider morphs between the family's
   classic projections (built with d3.geoProjectionMutator), the panel names the projection the sliders have landed on
   (or the nearest known one), and a readout measures how much the map bends sizes and shapes. */
(function(){
"use strict";
const R=Math.PI/180;
const FAM=[["cyl","Cylindrical"],["conic","Conic"],["azi","Azimuthal"],["pseudo","Pseudo-cylindrical"]];
const AZI=[["equidistant","Equidistant"],["equalarea","Equal-area"],["stereographic","Stereographic"],["orthographic","Orthographic"],["gnomonic","Gnomonic"]];
/* blend anchors per family: the slider runs 0..n-1, whole numbers are the pure projections */
const ANCH={cyl:["Equal-area","Equidistant","Conformal (Mercator)"],conic:["Equal-area (Albers)","Equidistant","Conformal (Lambert)"],
 pseudo:["Sinusoidal","Mollweide","Equal Earth","Robinson","Winkel tripel"]};
const DEF={fam:"cyl",blend:1,sp:0,p1:20,p2:50,lon:0,lat:0,gamma:0,stretch:1,azi:"equidistant",grid:true,tissot:false};
let S=Object.assign({},DEF),built=false,on=false,raf=0,mut=null,feats=null;

/* ---- raw projections ---- */
const cylY=[p=>Math.sin(p),p=>p,p=>Math.log(Math.tan(Math.PI/4+Math.max(-78*R,Math.min(84*R,p))/2))];
function lerp2(A,t){const i=Math.max(0,Math.min(A.length-2,Math.floor(t))),f=t-i;return(l,p)=>{const a=A[i](l,p),b=A[i+1](l,p);return[a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f]}}
function rawFor(s){const st=s.stretch;let f;
 if(s.fam==="cyl"){const c=Math.cos(s.sp*R),t=s.blend,i=Math.min(1,Math.floor(t)),k=t-i;
  /* x = λ·cos φs ; y mixes sin φ / cos φs (equal-area), φ (equidistant), Mercator's ln tan */
  const Y=[p=>cylY[0](p)/c,p=>cylY[1](p),p=>cylY[2](p)];f=(l,p)=>[l*c,Y[i](p)+(Y[i+1](p)-Y[i](p))*k]}
 else if(s.fam==="conic"){let a=s.p1*R,b=s.p2*R;if(Math.abs(a+b)<1e-3)b+=2e-3;
  const ea=d3.geoConicEqualAreaRaw(a,b),ed=d3.geoConicEquidistantRaw(a,b),cf=d3.geoConicConformalRaw(a,b);
  /* the conformal cone runs off to infinity at the far pole: cut the map off there, more as the blend nears Lambert */
  const g=lerp2([ea,ed,cf],s.blend),lim=(s.blend<=1?90:90-45*Math.min(1,(s.blend-1)*4))*R,north=s.p1+s.p2>=0;
  f=(l,p)=>g(l,north?Math.max(-lim,p):Math.min(lim,p))}
 else if(s.fam==="azi"){f={equidistant:d3.geoAzimuthalEquidistantRaw,equalarea:d3.geoAzimuthalEqualAreaRaw,stereographic:d3.geoStereographicRaw,
  orthographic:d3.geoOrthographicRaw,gnomonic:d3.geoGnomonicRaw}[s.azi]}
 else{const A=[d3.geoSinusoidalRaw,d3.geoMollweideRaw,d3.geoEqualEarthRaw,d3.geoRobinsonRaw,d3.geoWinkel3Raw].map(r=>r||d3.geoEquirectangularRaw);f=lerp2(A,s.blend)}
 return st===1?f:(l,p)=>{const q=f(l,p);return[q[0],q[1]*st]}}
const CLIP={equidistant:179.9,equalarea:179.9,stereographic:150,orthographic:90,gnomonic:62};

/* ---- named projections: the matcher and the presets ---- */
/* each fixes the fields it names; anything left out may be anything */
const NAMED=[
 {n:"Lambert cylindrical equal-area",fam:"cyl",blend:0,sp:0,lat:0,g:0,note:"Johann Lambert, 1772. Every country keeps its true size; shapes near the poles are squashed flat."},
 {n:"Behrmann",fam:"cyl",blend:0,sp:30,lat:0,g:0,note:"An equal-area cylinder true to scale along 30°N and 30°S (Walter Behrmann, 1910)."},
 {n:"Hobo–Dyer",fam:"cyl",blend:0,sp:37.5,lat:0,g:0,note:"An equal-area cylinder true along 37.5°, drawn in 2002 as a gentler Gall–Peters."},
 {n:"Gall–Peters",fam:"cyl",blend:0,sp:45,lat:0,g:0,preset:1,note:"The equal-area cylinder true along 45°: James Gall drew it in 1855, Arno Peters made it famous in 1973."},
 {n:"Balthasart",fam:"cyl",blend:0,sp:50,lat:0,g:0,note:"An equal-area cylinder true along 50° (M. Balthasart, 1935): very tall in the tropics."},
 {n:"Transverse cylindrical equal-area",fam:"cyl",blend:0,lat:0,g:90,note:"Lambert’s cylinder turned on its side, so it is true along a meridian instead of the equator."},
 {n:"Plate carrée",fam:"cyl",blend:1,sp:0,lat:0,g:0,preset:1,note:"The simplest map: longitude and latitude used straight as x and y. Every square of the grid is a square."},
 {n:"Equirectangular",fam:"cyl",blend:1,lat:0,g:0,note:"Latitude and longitude as y and x, squeezed sideways so that one chosen parallel is true to scale."},
 {n:"Cassini",fam:"cyl",blend:1,sp:0,lat:0,g:90,note:"The plate carrée turned on its side, true along the central meridian: used for the first maps of France."},
 {n:"Mercator",fam:"cyl",blend:2,lat:0,g:0,preset:1,note:"Gerardus Mercator, 1569. Angles are true, so a straight line is a constant compass bearing, but sizes balloon towards the poles."},
 {n:"Transverse Mercator",fam:"cyl",blend:2,lat:0,g:90,preset:1,lon:15,note:"Mercator turned on its side, true along one meridian. Every UTM zone and most national grids use it."},
 {n:"Albers equal-area conic (USA)",fam:"conic",blend:0,p1:29.5,p2:45.5,preset:1,lon:-96,note:"The US Geological Survey’s map of the lower 48 states: true sizes, little shape distortion between its two parallels."},
 {n:"Albers equal-area conic",fam:"conic",blend:0,note:"Heinrich Albers, 1805. A cone cutting the globe along two parallels; areas are true everywhere."},
 {n:"Equidistant conic",fam:"conic",blend:1,note:"Distances along every meridian are true. Common in atlases for countries in the middle latitudes."},
 {n:"Lambert conformal conic (Europe)",fam:"conic",blend:2,p1:35,p2:65,preset:1,lon:10,note:"The EU’s standard for conformal maps of Europe (ETRS89-LCC): parallels 35°N and 65°N."},
 {n:"Lambert conformal conic",fam:"conic",blend:2,note:"Angles are true, so pilots use it for aeronautical charts: a straight line is close to a great circle."},
 {n:"Polar azimuthal equidistant (the UN emblem)",fam:"azi",azi:"equidistant",lat:90,preset:1,note:"Seen from above the North Pole with true distances from the centre: this is the map in the United Nations flag."},
 {n:"Azimuthal equidistant",fam:"azi",azi:"equidistant",note:"Distances and directions from the centre are true: the map for ‘how far is everywhere from here?’"},
 {n:"Lambert azimuthal equal-area",fam:"azi",azi:"equalarea",note:"True areas in a round map; the EU uses it (centred on 52°N 10°E) for statistics."},
 {n:"Stereographic",fam:"azi",azi:"stereographic",note:"Known to the ancient Greeks: conformal, and every circle on the globe stays a circle on the map."},
 {n:"Orthographic",fam:"azi",azi:"orthographic",lat:20,preset:1,label:"Globe",note:"The globe as seen from far away in space: only half the world, and the edges are squashed."},
 {n:"Gnomonic",fam:"azi",azi:"gnomonic",note:"Every straight line is a great circle, the shortest route. Navigators plot routes on it, then copy them to Mercator."},
 {n:"Sinusoidal",fam:"pseudo",blend:0,lat:0,g:0,note:"An equal-area map with every parallel true to scale; the shapes shear badly at the edges."},
 {n:"Boggs eumorphic (roughly)",fam:"pseudo",blend:0.5,lat:0,g:0,note:"Halfway between Sinusoidal and Mollweide, which is how Samuel Boggs built his 1929 projection."},
 {n:"Mollweide",fam:"pseudo",blend:1,lat:0,g:0,preset:1,note:"An equal-area ellipse (Karl Mollweide, 1805): popular for maps of the whole sky and of world climate."},
 {n:"Equal Earth",fam:"pseudo",blend:2,lat:0,g:0,preset:1,note:"Equal-area, with shapes kept pleasant (2018). The UN General Assembly backed it as the recommended world map in 2026."},
 {n:"Robinson",fam:"pseudo",blend:3,lat:0,g:0,preset:1,note:"Arthur Robinson’s 1963 compromise, picked by eye: nothing exact, nothing badly wrong."},
 {n:"Winkel tripel",fam:"pseudo",blend:4,lat:0,g:0,preset:1,note:"Oswald Winkel’s 1921 compromise, an average of two maps: National Geographic’s world map since 1998."}
];
const gDiff=(a,b,m)=>{const d=Math.abs(((a-b)%m+m*1.5)%m-m/2);return Math.min(d,m-d)};
function dist(s,N){if(N.fam!==s.fam)return 1e9;let d=Math.abs(s.stretch-1)*40;
 if(N.azi&&N.azi!==s.azi)return 1e9;if(N.blend!=null)d+=Math.abs(s.blend-N.blend)*30;
 if(N.sp!=null&&!(N.blend===2))d+=Math.abs(s.sp-N.sp)*.6;
 if(N.p1!=null){const a=Math.abs(s.p1-N.p1)+Math.abs(s.p2-N.p2),b=Math.abs(s.p1-N.p2)+Math.abs(s.p2-N.p1);d+=Math.min(a,b)*.4}
 if(N.lat!=null)d+=(s.fam==="azi"?Math.abs(s.lat-N.lat)*(N.lat===90?.6:0):Math.abs(s.lat)*.3);
 if(N.g!=null)d+=gDiff(s.gamma,N.g,180)*.3;
 if(N.lon!=null&&N.preset&&N.p1!=null)d+=0;return d}
function aspect(s){if(s.fam==="azi")return Math.abs(s.lat)>89.5?"polar":Math.abs(s.lat)<.5?"equatorial":"oblique";
 if(s.fam==="conic")return gDiff(s.gamma,0,360)<.5&&Math.abs(s.lat)<.5?"":"oblique";
 if(Math.abs(s.lat)<.5&&gDiff(s.gamma,0,180)<.5)return"";if(Math.abs(s.lat)<.5&&gDiff(s.gamma,90,180)<.5)return"transverse";return"oblique"}
function nameOf(s){let best=null,bd=1e9;for(const N of NAMED){const d=dist(s,N);if(d<bd){bd=d;best=N}}
 /* aspect-free match: the same projection seen in an oblique aspect */
 const ap=aspect(s);let free=null;if(ap){let fd=1e9;for(const N of NAMED){if(N.g!=null&&N.g!==0||N.lat!=null&&s.fam==="azi")continue;const d=dist(Object.assign({},s,{lat:0,gamma:0}),N);if(d<fd){fd=d;free=N}}if(fd>1)free=null}
 return{best,bd,ap,free}}

/* ---- UI ---- */
const esc=t=>String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const SL=[["blend","Blend",0,2,.01],["sp","Standard parallel",0,80,.5,"°"],["p1","First standard parallel",-80,80,.5,"°"],["p2","Second standard parallel",-80,80,.5,"°"],
 ["lon","Centre longitude",-180,180,1,"°"],["lat","Centre latitude",-90,90,1,"°"],["gamma","Tilt (γ rotation)",-180,180,1,"°"],["stretch","Vertical stretch",.5,2,.01,"×"]];
function fmt(k,v){if(k==="stretch")return v.toFixed(2)+"×";if(k==="blend"){const A=ANCH[S.fam]||[];const i=Math.round(v);return Math.abs(v-i)<.005&&A[i]?A[i]:v.toFixed(2)}
 const u=k==="lon"?(v<0?"W":v>0?"E":""):k==="gamma"?"":(v<0?"S":v>0?"N":"");return(k==="gamma"?Math.round(v):Math.abs(v))+"°"+(u?" "+u:"")}
function build(){const pv=document.getElementById("projView");if(!pv||document.getElementById("gfpm"))return;
 const presets=NAMED.filter(N=>N.preset);
 pv.insertAdjacentHTML("beforeend",'<div id="gfpm" class="gfpm" hidden><div class="gfpm-ctl">'+
  '<div class="gfpm-l">Family</div><div class="gfpm-seg" data-k="fam">'+FAM.map(f=>'<button type="button" data-v="'+f[0]+'">'+f[1]+'</button>').join("")+'</div>'+
  '<div class="gfpm-azi"><div class="gfpm-l">Kind</div><div class="gfpm-seg gfpm-seg-s" data-k="azi">'+AZI.map(f=>'<button type="button" data-v="'+f[0]+'">'+f[1]+'</button>').join("")+'</div></div>'+
  SL.map(x=>'<div class="gfpm-row" data-row="'+x[0]+'"><div class="gfpm-rl"><span>'+x[1]+'</span><b data-out="'+x[0]+'"></b></div><input type="range" data-s="'+x[0]+'" min="'+x[2]+'" max="'+x[3]+'" step="'+x[4]+'" aria-label="'+x[1]+'">'+(x[0]==="blend"?'<div class="gfpm-ticks"></div>':'')+'</div>').join("")+
  '<div class="proj-switches gfpm-sw"><label class="switch"><input type="checkbox" data-c="grid"><span class="switch-track"><span class="switch-thumb"></span></span><span class="switch-label">Grid lines</span></label>'+
  '<label class="switch"><input type="checkbox" data-c="tissot"><span class="switch-track"><span class="switch-thumb"></span></span><span class="switch-label">Distortion circles</span></label></div>'+
  '<div class="gfpm-l">Presets</div><div class="gfpm-pre">'+presets.map(N=>'<button type="button" class="chip" data-pre="'+esc(N.n)+'">'+esc(N.label||N.n.replace(/ \(.*\)$/,"").replace("Lambert conformal conic","Lambert conformal").replace("Albers equal-area conic","Albers"))+'</button>').join("")+'</div>'+
  '<button type="button" class="gfpm-reset">↺ Reset</button></div>'+
  '<div class="gfpm-out"><div class="gfpm-name"></div><div class="proj-map gfpm-map"><svg role="img" aria-label="Your projection of the world"></svg><div class="proj-hint">move the sliders to bend the world</div></div>'+
  '<div class="gfpm-read"></div></div></div>');
 const P=document.getElementById("gfpm");
 P.querySelectorAll(".gfpm-seg").forEach(g=>g.addEventListener("click",e=>{const b=e.target.closest("[data-v]");if(!b)return;const k=g.dataset.k;if(S[k]===b.dataset.v)return;S[k]=b.dataset.v;
  if(k==="fam"){S.blend=S.fam==="pseudo"?2:S.fam==="cyl"?1:0;S.lat=S.fam==="azi"?90:0;S.gamma=0;if(S.fam==="conic"){S.p1=20;S.p2=50}}sync();draw()}));
 P.querySelectorAll("[data-s]").forEach(i=>i.addEventListener("input",()=>{let v=+i.value;const k=i.dataset.s;
  /* snap gently to the pure projections and round numbers */
  if(k==="blend"&&Math.abs(v-Math.round(v))<.04)v=Math.round(v);if(k==="stretch"&&Math.abs(v-1)<.03)v=1;if((k==="lat"||k==="gamma")&&Math.abs(v)<2)v=0;
  S[k]=v;sync(true);sched()}));
 P.querySelectorAll("[data-c]").forEach(c=>c.addEventListener("change",()=>{S[c.dataset.c]=c.checked;draw()}));
 P.querySelector(".gfpm-pre").addEventListener("click",e=>{const b=e.target.closest("[data-pre]");if(b)preset(b.dataset.pre)});
 P.querySelector(".gfpm-reset").onclick=()=>{S=Object.assign({},DEF);sync();draw()};
 new ResizeObserver(()=>{if(on)sched()}).observe(P.querySelector(".gfpm-map"));
 built=true;sync()}
function preset(n){const N=NAMED.find(x=>x.n===n);if(!N)return;
 S=Object.assign({},DEF,{grid:S.grid,tissot:S.tissot,fam:N.fam,blend:N.blend!=null?N.blend:0,lat:N.lat!=null?N.lat:0,gamma:N.g||0,lon:N.lon||0});
 if(N.azi)S.azi=N.azi;if(N.sp!=null)S.sp=N.sp;if(N.p1!=null){S.p1=N.p1;S.p2=N.p2}
 if(N.fam==="azi"&&N.lat==null)S.lat=0;sync();draw()}
function sync(partial){const P=document.getElementById("gfpm");if(!P)return;const f=S.fam;
 const show={blend:f!=="azi",sp:f==="cyl",p1:f==="conic",p2:f==="conic"};
 P.querySelectorAll("[data-row]").forEach(r=>{const k=r.dataset.row;r.hidden=show[k]===false});
 P.querySelector(".gfpm-azi").hidden=f!=="azi";
 const bl=P.querySelector('[data-s="blend"]');if(ANCH[f]){bl.max=ANCH[f].length-1;
  const tk=P.querySelector(".gfpm-ticks");const key=f;if(tk.dataset.f!==key){tk.dataset.f=key;tk.classList.toggle("two",ANCH[f].length>3);tk.innerHTML=ANCH[f].map((a,i)=>'<span class="'+(i%2?"lo":"")+'" style="left:'+(i/(ANCH[f].length-1)*100)+'%">'+esc(a.replace(/ \(.*\)/,""))+'</span>').join("")}}
 P.querySelectorAll("[data-s]").forEach(i=>{const k=i.dataset.s;if(!partial||document.activeElement!==i)i.value=S[k];P.querySelector('[data-out="'+k+'"]').textContent=fmt(k,S[k])});
 P.querySelectorAll(".gfpm-seg").forEach(g=>g.querySelectorAll("[data-v]").forEach(b=>b.classList.toggle("on",b.dataset.v===S[g.dataset.k])));
 P.querySelectorAll("[data-c]").forEach(c=>c.checked=!!S[c.dataset.c])}
function sched(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;draw()})}

/* ---- drawing ---- */
function features(){if(feats)return feats;try{feats=projFeatures().filter(f=>f.geometry)}catch(e){feats=[]}return feats}
function fill(c){try{return projFill(c)}catch(e){return"#c9c2b2"}}
function makeProj(w){if(!mut)mut=d3.geoProjectionMutator(s=>rawFor(s));const p=mut(Object.assign({},S));
 p.rotate([-S.lon,-S.lat,S.gamma]).precision(.3);p.clipAngle(S.fam==="azi"?CLIP[S.azi]:null);
 const sph={type:"Sphere"};p.scale(100).translate([0,0]);const b=d3.geoPath(p).bounds(sph);
 let ar=(b[1][0]-b[0][0])/Math.max(1e-6,b[1][1]-b[0][1]);if(!isFinite(ar)||ar<=0)ar=2;
 const h=Math.round(Math.max(240,Math.min(w/ar,Math.min(620,w*1.05))));p.fitExtent([[10,10],[w-10,h-10]],sph);return{p,h}}
function draw(){const P=document.getElementById("gfpm");if(!P||!on)return;const svg=P.querySelector("svg"),host=P.querySelector(".gfpm-map");
 const w=Math.max(280,host.clientWidth-2);let p,h;try{({p,h}=makeProj(w))}catch(e){console.error(e);return}
 const path=d3.geoPath(p),sph={type:"Sphere"},od=path(sph)||"";
 svg.setAttribute("viewBox","0 0 "+w+" "+h);svg.setAttribute("width",w);svg.setAttribute("height",h);
 let s='<defs><clipPath id="gfpmClip"><path d="'+od+'"/></clipPath></defs><path class="proj-sea" d="'+od+'"/><g clip-path="url(#gfpmClip)">';
 for(const f of features()){const d=path(f);if(d)s+='<path class="gfpm-land" d="'+d+'" fill="'+fill(f.properties&&f.properties.c)+'"/>'}
 if(S.grid)s+='<path class="proj-grid" d="'+(path(d3.geoGraticule10())||"")+'"/>';
 if(S.tissot){const circ=d3.geoCircle().radius(4.5);let t="";for(let lat=-60;lat<=60;lat+=30)for(let lon=-180;lon<180;lon+=30){const dd=path(circ.center([lon+15,lat])());if(dd)t+=dd}s+='<path class="proj-tissot" d="'+t+'"/>'}
 s+='</g><path class="proj-edge" d="'+od+'"/>';svg.innerHTML=s;
 naming(P);readout(P,p,path)}
const lc=n=>/^(Azimuthal|Equidistant|Stereographic|Orthographic|Gnomonic|Transverse|Equirectangular|Sinusoidal|Plate)/.test(n)?n[0].toLowerCase()+n.slice(1):n;
function naming(P){const{best,bd,ap,free}=nameOf(S);const el=P.querySelector(".gfpm-name");let h;
 if(best&&bd<.6){const nm=best.n;const a=ap&&!/Transverse|Cassini|polar|Polar/.test(nm)&&!(S.fam==="azi"&&/polar/i.test(nm))?ap+" ":"";
  h='<small>Your projection</small><h3>This is the '+esc(a+(a?lc(nm):nm))+'</h3><p>'+esc(best.note)+'</p>'}
 else if(free){h='<small>Your projection</small><h3>'+(/^[aeiou]/.test(ap)?"An ":"A ")+esc(ap)+' '+esc(lc(free.n))+'</h3><p>The '+esc(free.n)+' with the globe turned under it. '+esc(free.note)+'</p>'}
 else{h='<small>Your own projection</small><h3>No famous name yet</h3><p>'+(best?'The nearest known one is the <b>'+esc(best.n)+'</b>. ':'')+'Mapmakers have named projections for less: perhaps this one should be yours.</p>'}
 if(el.innerHTML!==h)el.innerHTML=h}
/* Tissot's indicatrix from the map's own derivatives: a and b are the biggest and smallest scale at a point */
function readout(P,p,path){const rot=d3.geoRotation([-S.lon,-S.lat,S.gamma]),e=.05;const out=[];
 for(let lat=-80;lat<=80;lat+=10)for(let lon=-175;lon<180;lon+=10){const q=rot([lon,lat]);
  if(S.fam==="azi"){if(d3.geoDistance([0,0],q)>Math.min(CLIP[S.azi]-8,75)*R)continue}else if(Math.abs(q[1])>60||Math.abs(q[0])>170)continue;
  const c=p([lon,lat]),u=p([lon,lat+e]),v=p([lon+e,lat]);if(!c||!u||!v)continue;
  const cs=Math.cos(lat*R),ux=(u[0]-c[0])/e,uy=(u[1]-c[1])/e,vx=(v[0]-c[0])/e/cs,vy=(v[1]-c[1])/e/cs;
  const sum=ux*ux+uy*uy+vx*vx+vy*vy,D=Math.abs(ux*vy-uy*vx);if(!(D>1e-6*sum))continue;/* a point squashed onto the cut-off edge */const r=Math.sqrt(Math.max(0,sum*sum/4-D*D));
  const a=Math.sqrt(sum/2+r),b=Math.sqrt(Math.max(1e-12,sum/2-r));if(!isFinite(a)||!isFinite(b))continue;out.push([a*b,2*Math.asin((a-b)/(a+b))/R])}
 let area="–",ang="–",areaT="",angT="";
 if(out.length){const A=out.map(x=>x[0]).sort((x,y)=>x-y),lo=A[Math.floor(A.length*.02)],hi=A[Math.ceil(A.length*.98)-1],ratio=hi/lo,w=Math.max(...out.map(x=>x[1]));
  area=ratio<1.02?"True":(ratio>99?"×99+":"×"+(ratio<10?ratio.toFixed(1):Math.round(ratio)));areaT=ratio<1.02?"Equal-area: every country keeps its true size":"the biggest-drawn places are blown up this much against the smallest";
  ang=w<.5?"0°":Math.round(w)+"°";angT=w<.5?"Conformal: small shapes and angles are true":"angles bent by up to this much: shapes stretch"}
 let gl="–",glT="Greenland is really 0.28× the size of Australia";try{const F=features(),g=F.find(f=>f.properties.c==="gl"),au=F.find(f=>f.properties.c==="au");
  if(g&&au){const r=path.area(g)/path.area(au);if(isFinite(r)&&r>0)gl=r.toFixed(r<10?2:0)+"×"}}catch(e){}if(gl==="–")glT="Greenland or Australia is off this map; really Greenland is 0.28× Australia";
 const zone=S.fam==="azi"?"within 75° of the centre":"between 60°N and 60°S of the map’s own equator";
 P.querySelector(".gfpm-read").innerHTML='<div><b>'+area+'</b><span>Size range</span><em>'+areaT+'</em></div><div><b>'+ang+'</b><span>Shape distortion</span><em>'+angT+'</em></div><div><b>'+gl+'</b><span>Greenland vs Australia</span><em>'+glT+'</em></div><p class="gfpm-zone">Measured '+zone+'.</p>'}

/* ---- the chip in Projections, next to the projection chips ---- */
function show(v){const pv=document.getElementById("projView");if(!pv)return;build();on=v;pv.classList.toggle("gfpm-on",v);document.getElementById("gfpm").hidden=!v;
 const chips=pv.querySelectorAll("#projChips [data-proj]"),me=pv.querySelector(".gfpm-open");if(me)me.classList.toggle("active",v);
 if(v){chips.forEach(c=>c.classList.remove("active"));draw()}else{try{chips.forEach(c=>c.classList.toggle("active",c.dataset.proj===proj.id))}catch(e){}}}
function addButton(){const row=document.querySelector("#projView #projChips");if(!row||row.querySelector(".gfpm-open"))return;
 const b=document.createElement("button");b.type="button";b.className="chip gfpm-open";b.title="Build your own projection with sliders";b.textContent="🛠 Make your own";
 b.addEventListener("click",e=>{e.stopPropagation();show(!on)});const om=row.querySelector(".gfom-open");row.insertBefore(b,om||null);
 row.addEventListener("click",e=>{if(on&&e.target.closest("[data-proj]"))show(false)},true)}
setInterval(addButton,1200);
window.gfProjMaker={show,preset,state:()=>Object.assign({},S),set:o=>{Object.assign(S,o);sync();draw()},nameOf:()=>nameOf(S)};
{const s=document.createElement("style");s.textContent=`
#projChips .chip.gfpm-open{background:#2f6f8f;color:#fff;border-color:#24576f}#projChips .chip.gfpm-open:hover{background:#3a7fa1}#projChips .chip.gfpm-open.active{background:#009edb;color:#fff;box-shadow:0 0 0 2px rgba(0,158,219,.3)}
#projView.gfpm-on>.proj-switches,#projView.gfpm-on>.proj-map,#projView.gfpm-on>.proj-info,#projView.gfpm-on>.proj-zoom{display:none!important}
.gfpm{display:grid;grid-template-columns:300px minmax(0,1fr);gap:14px;align-items:start}.gfpm[hidden]{display:none}
.gfpm-ctl{border:1px solid var(--line);border-radius:12px;background:var(--raised);padding:12px 14px 14px;display:flex;flex-direction:column;gap:6px}
.gfpm-l{font:700 10.5px 'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.06em;color:rgba(var(--text-rgb),.55);margin-top:4px}
.gfpm-seg{display:grid;grid-template-columns:1fr 1fr;gap:4px}.gfpm-seg-s{grid-template-columns:repeat(3,1fr)}
.gfpm-seg button{border:1px solid var(--line);background:var(--surface);color:rgb(var(--text-rgb));border-radius:8px;padding:6px 4px;font-size:12px;cursor:pointer;line-height:1.15}
.gfpm-seg button:hover{border-color:rgba(0,158,219,.6)}.gfpm-seg button.on{background:#009edb;border-color:#009edb;color:#fff;font-weight:700}
.gfpm-azi[hidden],.gfpm-row[hidden]{display:none}
.gfpm-row{margin-top:2px}.gfpm-rl{display:flex;justify-content:space-between;gap:8px;font-size:12.5px}.gfpm-rl b{font:600 11.5px 'JetBrains Mono',monospace;color:#0a85b8;white-space:nowrap}
.gfpm-row input{width:100%;margin:3px 0 0;accent-color:#009edb}
.gfpm-ticks{position:relative;height:13px;margin:0 7px}.gfpm-ticks span{position:absolute;transform:translateX(-50%);font-size:9.5px;color:rgba(var(--text-rgb),.55);white-space:nowrap}.gfpm-ticks span:first-child{transform:none;left:-7px!important}.gfpm-ticks.two{height:24px}.gfpm-ticks.two span.lo{top:11px}.gfpm-ticks span:last-child{transform:translateX(-100%);left:calc(100% + 7px)!important}
.gfpm-sw{justify-content:flex-start;flex-wrap:wrap;gap:8px 14px;margin:6px 0 0}
.gfpm-pre{display:flex;flex-wrap:wrap;gap:4px}.gfpm-pre .chip{border:1px solid var(--line);background:var(--surface);color:rgb(var(--text-rgb));font-size:11px;padding:4px 9px;cursor:pointer}.gfpm-pre .chip:hover{border-color:#009edb}
.gfpm-reset{margin-top:8px;align-self:flex-start;border:1px solid var(--line);background:var(--surface);color:rgb(var(--text-rgb));border-radius:999px;padding:6px 14px;font-weight:700;font-size:12.5px;cursor:pointer}.gfpm-reset:hover{border-color:#009edb}
.gfpm-out{min-width:0;display:flex;flex-direction:column;gap:10px}
.gfpm-name{padding:10px 16px;border:1px solid var(--line);border-radius:12px;background:var(--raised);min-height:76px}.gfpm-name small{font:700 10.5px 'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.06em;color:#0a85b8}
.gfpm-name h3{margin:2px 0 3px;font-size:19px}.gfpm-name p{margin:0;font-size:13.5px;line-height:1.45;color:rgba(var(--text-rgb),.8)}
.gfpm-map svg{display:block;max-width:100%}.gfpm-land{stroke:rgba(20,30,20,.45);stroke-width:.4}
.gfpm-read{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.gfpm-read>div{border:1px solid var(--line);border-radius:12px;background:var(--raised);padding:8px 12px}
.gfpm-read b{display:block;font:700 20px 'JetBrains Mono',monospace;color:rgb(var(--text-rgb))}.gfpm-read span{display:block;font-size:12px;font-weight:700}.gfpm-read em{display:block;font-style:normal;font-size:11.5px;line-height:1.35;color:rgba(var(--text-rgb),.62)}
.gfpm-zone{grid-column:1/-1;margin:0;font-size:11px;color:rgba(var(--text-rgb),.5)}
@media (max-width:820px){.gfpm{grid-template-columns:1fr}.gfpm-read{grid-template-columns:1fr}.gfpm-out{order:-1}}`;document.head.appendChild(s)}
})();
