/* GeoFlock: Europe's "Blue Banana" (la dorsale européenne), one shape and one look wherever the map shows it (the population
   and City Lights tours, The World Is Spiky, search), and the Rhine traced along it.
   The band was named by Roger Brunet's RECLUS team in 1989 (R. Brunet, "Les villes européennes", RECLUS/DATAR, La
   Documentation française, 1989); see also Wikipedia, "Blue Banana". It has no official edge: the shape here is a smooth
   curve through its usual cities, Liverpool and Manchester - Birmingham - London - across the Channel - Brussels, Antwerp and
   the Randstad - the Ruhr and Cologne - Frankfurt - the Rhine valley past Strasbourg and Basel - Zurich - Milan, ending by
   Genoa, wider in the middle and rounded at both ends (a smooth centre line fitted through those places, about 155 km each side
   at its widest). Why there: the Rhine, Europe's main trade artery for centuries, from the Alps to the North Sea at Rotterdam
   (Wikipedia, "Rhine"; "Port of Rotterdam"), with the old belt of trading towns between France and the German lands (once
   Lotharingia) and the coal fields of northern England, Belgium and the Ruhr; the Rhine is a main reason, not the only one. */
(function(){
"use strict";
window.GF_BANANA=[[-2.693,53.854],[-2.608,53.887],[-2.516,53.913],[-2.42,53.933],[-2.319,53.946],[-2.213,53.952],[-2.104,53.951],[-1.991,53.942],[-1.873,53.927],[-1.75,53.906],[-1.622,53.879],[-1.489,53.846],[-1.351,53.809],[-1.207,53.767],[-1.058,53.72],[-0.903,53.67],[-0.743,53.617],[-0.578,53.561],[-0.407,53.503],[-0.231,53.444],[-0.051,53.384],[0.135,53.324],[0.325,53.264],[0.52,53.206],[0.719,53.149],[0.922,53.095],[1.129,53.045],[1.34,52.998],[1.555,52.955],[1.775,52.916],[2.002,52.882],[2.235,52.852],[2.478,52.827],[2.733,52.805],[3.002,52.787],[3.289,52.771],[3.598,52.756],[3.934,52.74],[4.301,52.718],[4.703,52.686],[5.141,52.637],[5.615,52.565],[6.116,52.462],[6.633,52.322],[7.147,52.144],[7.641,51.928],[8.097,51.68],[8.501,51.409],[8.848,51.123],[9.138,50.831],[9.376,50.54],[9.568,50.253],[9.724,49.974],[9.849,49.701],[9.951,49.437],[10.033,49.179],[10.099,48.929],[10.151,48.685],[10.192,48.447],[10.224,48.216],[10.246,47.99],[10.261,47.771],[10.269,47.557],[10.271,47.35],[10.266,47.148],[10.257,46.953],[10.242,46.763],[10.223,46.581],[10.199,46.404],[10.171,46.235],[10.14,46.072],[10.104,45.916],[10.065,45.767],[10.023,45.625],[9.977,45.49],[9.929,45.363],[9.877,45.244],[9.822,45.132],[9.764,45.028],[9.703,44.931],[9.639,44.843],[9.571,44.762],[9.501,44.69],[9.427,44.626],[9.348,44.569],[9.265,44.522],[9.175,44.482],[9.078,44.45],[8.974,44.427],[8.863,44.412],[8.749,44.405],[8.633,44.407],[8.521,44.416],[8.415,44.435],[8.315,44.461],[8.221,44.496],[8.132,44.539],[8.047,44.591],[7.965,44.65],[7.885,44.717],[7.808,44.792],[7.732,44.874],[7.658,44.964],[7.585,45.062],[7.513,45.166],[7.442,45.278],[7.372,45.397],[7.303,45.522],[7.235,45.653],[7.167,45.791],[7.1,45.935],[7.033,46.085],[6.967,46.24],[6.9,46.4],[6.833,46.565],[6.766,46.735],[6.698,46.908],[6.63,47.086],[6.56,47.267],[6.49,47.45],[6.417,47.636],[6.343,47.823],[6.266,48.012],[6.187,48.199],[6.105,48.386],[6.02,48.57],[5.931,48.749],[5.839,48.922],[5.745,49.086],[5.649,49.239],[5.553,49.377],[5.459,49.497],[5.37,49.599],[5.285,49.682],[5.202,49.747],[5.116,49.797],[5.019,49.838],[4.901,49.871],[4.75,49.901],[4.56,49.93],[4.328,49.96],[4.054,49.991],[3.742,50.024],[3.399,50.062],[3.032,50.104],[2.647,50.155],[2.253,50.214],[1.854,50.283],[1.458,50.363],[1.068,50.455],[0.69,50.558],[0.326,50.67],[-0.021,50.792],[-0.348,50.921],[-0.655,51.057],[-0.94,51.196],[-1.204,51.339],[-1.448,51.483],[-1.67,51.628],[-1.874,51.773],[-2.058,51.915],[-2.224,52.056],[-2.374,52.193],[-2.507,52.327],[-2.624,52.457],[-2.727,52.582],[-2.815,52.703],[-2.89,52.818],[-2.952,52.928],[-3.002,53.033],[-3.038,53.132],[-3.063,53.226],[-3.076,53.313],[-3.078,53.395],[-3.067,53.471],[-3.044,53.542],[-3.01,53.608],[-2.965,53.668],[-2.909,53.723],[-2.844,53.772],[-2.772,53.816],[-2.693,53.854]];

/* the look: a soft see-through blue band with a glowing light-blue edge, readable on dark (night, satellite) and light maps */
const FILL="rgba(70,160,255,0.26)",GLOW="rgba(110,195,255,0.55)",EDGE="#5cb8ff";
window.gfBananaSVG=d=>'<path class="gf-banana-glow" d="'+d+'"/><path class="gf-banana" d="'+d+'"/>';
window.gfBananaCanvas=function(ctx,path,geom){ctx.save();ctx.setLineDash([]);ctx.lineJoin="round";
 ctx.beginPath();path(geom);ctx.fillStyle=FILL;ctx.fill();
 ctx.shadowColor=GLOW;ctx.shadowBlur=14;ctx.strokeStyle=GLOW;ctx.lineWidth=6;ctx.stroke();
 ctx.shadowBlur=6;ctx.shadowColor="rgba(90,185,255,0.9)";ctx.strokeStyle=EDGE;ctx.lineWidth=2.4;ctx.stroke();
 ctx.shadowBlur=0;ctx.strokeStyle="rgba(225,245,255,0.9)";ctx.lineWidth=0.9;ctx.stroke();ctx.restore()};
{const st=document.createElement("style");st.textContent=
 "svg path.gf-banana-glow{fill:none !important;stroke:"+GLOW+" !important;stroke-width:7px !important;stroke-linejoin:round;stroke-dasharray:none !important;vector-effect:non-scaling-stroke;filter:blur(2.5px);pointer-events:none}"+
 "svg path.gf-banana{fill:"+FILL+" !important;stroke:"+EDGE+" !important;stroke-width:2.4px !important;stroke-linejoin:round;stroke-dasharray:none !important;vector-effect:non-scaling-stroke;filter:drop-shadow(0 0 2px rgba(90,185,255,.9));pointer-events:none}";
 (document.head||document.documentElement).appendChild(st)}

/* the Rhine from its source to the sea, in order, from the map's own river lines (the river drawn on every map): its pieces
   are joined end to end, from Lake Toma in the Alps through Lake Constance, Basel, Strasbourg, Mainz, Cologne and the Ruhr
   to Rotterdam (the Lek and Nieuwe Maas arm, not the Waal) */
const SRC=[8.67,46.63],MOUTH=[4.1,51.98];let RH=null;
function rhine(){if(RH)return RH;try{const R=globeOverlays().rivers.find(r=>r.n==="Rhine");if(!R)return null;
 const V=[],key=p=>p[0].toFixed(3)+","+p[1].toFixed(3),ix=new Map(),E=[];const node=p=>{const k=key(p);if(!ix.has(k)){ix.set(k,V.length);V.push(p);E.push([])}return ix.get(k)};
 const d=(a,b)=>Math.hypot((a[0]-b[0])*Math.cos(a[1]*Math.PI/180),a[1]-b[1]);
 R.coordinates.forEach(l=>{for(let i=1;i<l.length;i++){const a=node(l[i-1]),b=node(l[i]),w=d(l[i-1],l[i]);E[a].push([b,w]);E[b].push([a,w])}});
 /* pieces that nearly touch (a gap of a few km where the data splits the river) are joined */
 for(let a=0;a<V.length;a++)for(let b=a+1;b<V.length;b++){const w=d(V[a],V[b]);if(w<.07&&w>0){E[a].push([b,w]);E[b].push([a,w])}}
 const near=q=>V.reduce((m,p,i)=>d(p,q)<d(V[m],q)?i:m,0),s=near(SRC),t=near(MOUTH);
 const D=V.map(()=>Infinity),P=V.map(()=>-1),done=V.map(()=>false);D[s]=0;
 for(;;){let u=-1;for(let i=0;i<V.length;i++)if(!done[i]&&D[i]<Infinity&&(u<0||D[i]<D[u]))u=i;if(u<0||u===t)break;done[u]=true;E[u].forEach(([v,w])=>{if(D[u]+w<D[v]){D[v]=D[u]+w;P[v]=u}})}
 if(D[t]===Infinity)return null;const out=[];for(let v=t;v>=0;v=P[v])out.unshift(V[v].slice());RH=out.length>4?out:null}catch(e){RH=null}return RH}
window.gfRhineLine=rhine;

/* the first part of a line, by length (0..1), for drawing the river on as it flows */
function part(c,f){if(f>=1)return c;const L=[0];for(let i=1;i<c.length;i++)L.push(L[i-1]+Math.hypot(c[i][0]-c[i-1][0],c[i][1]-c[i-1][1]));const s=L[L.length-1]*Math.max(0,f);
 const o=[c[0]];for(let i=1;i<c.length;i++){if(L[i]<=s){o.push(c[i]);continue}const u=(s-L[i-1])/((L[i]-L[i-1])||1);o.push([c[i-1][0]+(c[i][0]-c[i-1][0])*u,c[i-1][1]+(c[i][1]-c[i-1][1])*u]);break}
 if(o.length<2)o.push(c[0].slice());return o}
const reduce=()=>{try{return matchMedia("(prefers-reduced-motion: reduce)").matches}catch(e){return false}};
function lineOf(S){return S&&(S.lines||[]).find(l=>l&&l.gfRhine)}
function fill(S){const L=lineOf(S),c=L&&rhine();if(L&&c)L.coords=c;return L}
function install(){if(typeof psGo!=="function"||typeof psGlobeDraw!=="function"||typeof psDrawFlat!=="function"||typeof PS_TOURS==="undefined")return false;if(psGo._gfBan)return true;
 const _go=psGo;psGo=function(){let r;try{r=_go.apply(this,arguments)}finally{try{const S=ps&&psSteps()[ps.i];if(fill(S)){ps._gfRhT0=performance.now()+(ps.mode==="globe"?1100:0);
   if(ps.mode==="globe"&&ps.g)setTimeout(()=>{try{ps&&ps.g&&(ps.g.request?ps.g.request():ps.g.render())}catch(e){}},1100)}}catch(e){}}return r};psGo._gfBan=1;
 /* flat map: the river is drawn whole; the tour's own line animation draws it on (the stop has animate) */
 const _fl=psDrawFlat;psDrawFlat=function(){try{fill(ps&&psSteps()[ps.i])}catch(e){}return _fl.apply(this,arguments)};
 /* globe: the river grows from the Alps to the sea over about two seconds, one frame at a time */
 const _gd=psGlobeDraw;psGlobeDraw=function(ctx,p,gv){let again=false;try{const S=ps&&ps.mode==="globe"&&ps.g===gv&&psSteps()[ps.i],L=lineOf(S),c=L&&rhine();
   if(L&&c){const t0=ps._gfRhT0||0,f=reduce()?1:Math.max(0,Math.min(1,(performance.now()-t0)/2200)),e=1-Math.pow(1-f,2);L.coords=f>=1?c:part(c,e);again=f<1&&performance.now()>=t0-1200}}catch(e){}
  const r=_gd.apply(this,arguments);
  /* on the City Lights map the tour's river line is thin and dark: the Rhine is drawn over it as a glowing light-blue thread */
  try{const S=ps&&ps.mode==="globe"&&ps.g===gv&&psSteps()[ps.i],L=lineOf(S);if(L&&L.coords&&L.coords.length>1&&typeof allMapsColorMode!=="undefined"&&allMapsColorMode==="night"){
   const path=d3.geoPath(p,ctx);ctx.save();ctx.setLineDash([]);ctx.lineCap=ctx.lineJoin="round";ctx.beginPath();path({type:"LineString",coordinates:L.coords});
   ctx.shadowColor="rgba(110,195,255,0.9)";ctx.shadowBlur=8;ctx.strokeStyle="rgba(110,195,255,0.5)";ctx.lineWidth=5;ctx.stroke();ctx.shadowBlur=0;ctx.strokeStyle="#a8e0ff";ctx.lineWidth=2.2;ctx.stroke();ctx.restore()}}catch(e){}
  if(again&&!psGlobeDraw._q){psGlobeDraw._q=1;requestAnimationFrame(()=>{psGlobeDraw._q=0;try{ps&&ps.g&&ps.g.render()}catch(e){}})}return r};
 return true}
let n=0;const t=setInterval(()=>{if(install()||++n>100)clearInterval(t)},300);
})();
