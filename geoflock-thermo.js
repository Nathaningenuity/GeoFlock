/* GeoFlock: the Thermometer, a Toolkit gadget. Turn it on, click any place on land (flat map or globe) and a climate graph
   opens: average temperature month by month (red line) and rainfall (blue bars), with the Köppen climate type worked out
   from the same numbers, the yearly average temperature and the yearly rainfall. Clicking again moves the pin.
   Data: WorldClim 2.1 monthly averages 1970–2000 (Fick & Hijmans 2017, CC BY 4.0), averaged to 0.5° (about 55 km) and
   packed into textures/CLIMATE_MONTHLY.png: 24 strips of 720×360, the 12 temperatures ((t+70)×2) then the 12 rainfalls
   (√mm×5); 0 = sea or ice-free data missing. The Climate map opens with the Thermometer on; the Elevation map with the
   cross-section (Shovel) on. */
(function(){
if(window._gfThermo)return;window._gfThermo=1;
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const G=()=>{try{return typeof amGlobe!=="undefined"&&amGlobe&&amGlobe.host&&amGlobe.host.isConnected&&amGlobe.host.offsetParent?amGlobe:null}catch(e){return null}};
const MON=["J","F","M","A","M","J","J","A","S","O","N","D"];

/* ---------- data ---------- */
let D=null,dP=null;
function load(){if(dP)return dP;dP=new Promise(res=>{const im=new Image();im.onload=()=>{try{const c=document.createElement("canvas");c.width=im.naturalWidth;c.height=im.naturalHeight;
  const x=c.getContext("2d",{willReadFrequently:true});x.drawImage(im,0,0);const d=x.getImageData(0,0,c.width,c.height).data,n=c.width*c.height,a=new Uint8Array(n);for(let i=0;i<n;i++)a[i]=d[i*4];c.width=0;
  D={a,W:im.naturalWidth,H:im.naturalHeight/24};res(D)}catch(e){res(null)}};im.onerror=()=>res(null);im.src="textures/CLIMATE_MONTHLY.png?v=1"});return dP}
function cell(x,y){const{a,W,H}=D;x=((x%W)+W)%W;if(y<0||y>=H)return null;if(!a[y*W+x])return null;
 const T=[],P=[];for(let m=0;m<12;m++){T.push(a[(m*H+y)*W+x]/2-70);P.push(Math.pow(a[((12+m)*H+y)*W+x]/5,2))}return{T,P}}
/* the nearest land cell (a click right on the coast can land in the sea by a few km) */
function at(ll){if(!D)return null;const x0=Math.floor((ll[0]+180)/360*D.W),y0=Math.floor((90-ll[1])/180*D.H);let r=cell(x0,y0);if(r)return r;
 for(let k=1;k<=2;k++)for(let dy=-k;dy<=k;dy++)for(let dx=-k;dx<=k;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))!==k)continue;r=cell(x0+dx,y0+dy);if(r)return r}return null}

/* ---------- Köppen–Geiger (Peel, Finlayson & McMahon 2007) from the twelve months ---------- */
const KN={Af:"Tropical rainforest",Am:"Tropical monsoon",Aw:"Tropical savanna",BWh:"Hot desert",BWk:"Cold desert",BSh:"Hot steppe",BSk:"Cold steppe",
 Csa:"Mediterranean, hot summer",Csb:"Mediterranean, warm summer",Csc:"Mediterranean, cool summer",Cwa:"Humid subtropical, dry winter",Cwb:"Subtropical highland",Cwc:"Cold subtropical highland",
 Cfa:"Humid subtropical",Cfb:"Oceanic",Cfc:"Subpolar oceanic",Dsa:"Continental, dry hot summer",Dsb:"Continental, dry warm summer",Dsc:"Subarctic, dry summer",Dsd:"Subarctic, dry summer, very cold winter",
 Dwa:"Continental, dry winter, hot summer",Dwb:"Continental, dry winter, warm summer",Dwc:"Subarctic, dry winter",Dwd:"Subarctic, dry winter, very cold winter",
 Dfa:"Humid continental, hot summer",Dfb:"Humid continental, warm summer",Dfc:"Subarctic",Dfd:"Subarctic, very cold winter",ET:"Tundra",EF:"Ice cap"};
function koppen(T,P,lat){const MAT=T.reduce((a,b)=>a+b)/12,MAP=P.reduce((a,b)=>a+b),Th=Math.max(...T),Tc=Math.min(...T),T10=T.filter(t=>t>=10).length;
 const sumIdx=lat>=0?[3,4,5,6,7,8]:[9,10,11,0,1,2],winIdx=lat>=0?[9,10,11,0,1,2]:[3,4,5,6,7,8];
 const Ps=sumIdx.map(i=>P[i]),Pw=winIdx.map(i=>P[i]),Psum=Ps.reduce((a,b)=>a+b),Pwin=Pw.reduce((a,b)=>a+b);
 const Pthr=Pwin>=.7*MAP?2*MAT:Psum>=.7*MAP?2*MAT+28:2*MAT+14;
 if(Th<10)return Th>0?"ET":"EF";
 if(MAP<10*Pthr)return(MAP<5*Pthr?"BW":"BS")+(MAT>=18?"h":"k");
 if(Tc>=18){const Pdry=Math.min(...P);return Pdry>=60?"Af":Pdry>=100-MAP/25?"Am":"Aw"}
 const g=Tc>0?"C":"D",Psdry=Math.min(...Ps),Pswet=Math.max(...Ps),Pwdry=Math.min(...Pw),Pwwet=Math.max(...Pw);
 const s=Psdry<40&&Psdry<Pwwet/3?"s":Pwdry<Pswet/10?"w":"f";
 const t=Th>=22?"a":T10>=4?"b":g==="D"&&Tc<-38?"d":"c";return g+s+t}

/* ---------- where the click was ---------- */
let FB=null;function feats(){if(FB)return FB;try{FB=projFeatures().filter(f=>f.geometry&&f.properties&&f.properties.c).map(f=>({f,b:d3.geoBounds(f),c:String(f.properties.c).toLowerCase()}))}catch(e){FB=[]}return FB}
function countryAt(ll){for(const o of feats()){const b=o.b;if(ll[1]<b[0][1]||ll[1]>b[1][1])continue;if(b[0][0]<=b[1][0]&&(ll[0]<b[0][0]||ll[0]>b[1][0]))continue;try{if(d3.geoContains(o.f,ll))return o.c}catch(e){}}return null}
const cname=c=>c&&typeof COUNTRY_BY_CODE!=="undefined"&&COUNTRY_BY_CODE[c]?COUNTRY_BY_CODE[c].n:null;
const fmtLL=ll=>Math.abs(ll[1]).toFixed(1)+"°"+(ll[1]>=0?"N":"S")+" "+Math.abs(ll[0]).toFixed(1)+"°"+(ll[0]>=0?"E":"W");

/* ---------- the graph ---------- */
function graph(T,P){const W=340,H=170,l=34,r=36,t=12,b=22;
 const tlo=Math.min(-10,Math.floor(Math.min(...T)/10)*10),thi=Math.max(30,Math.ceil(Math.max(...T)/10)*10),pmax=Math.max(100,Math.ceil(Math.max(...P)/50)*50);
 const X=i=>l+(W-l-r)*(i+.5)/12,bw=(W-l-r)/12*.62,YT=v=>t+(H-t-b)*(thi-v)/(thi-tlo),YP=v=>t+(H-t-b)*(1-v/pmax);
 let s='<svg viewBox="0 0 '+W+' '+H+'" class="gfth-g" role="img" aria-label="Climate graph">';
 for(let v=tlo;v<=thi;v+=10)s+='<line x1="'+l+'" x2="'+(W-r)+'" y1="'+YT(v)+'" y2="'+YT(v)+'" class="gl"/><text x="'+(l-4)+'" y="'+(YT(v)+3)+'" class="yt">'+v+'°</text>';
 for(let k=0;k<=4;k++){const v=pmax*k/4;s+='<text x="'+(W-r+4)+'" y="'+(YP(v)+3)+'" class="yp">'+Math.round(v)+'</text>'}
 if(tlo<0)s+='<line x1="'+l+'" x2="'+(W-r)+'" y1="'+YT(0)+'" y2="'+YT(0)+'" class="z"/>';
 P.forEach((v,i)=>{s+='<rect x="'+(X(i)-bw/2).toFixed(1)+'" y="'+YP(v).toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+(H-b-YP(v)).toFixed(1)+'" class="pb"><title>'+MON[i]+": "+Math.round(v)+' mm</title></rect>'});
 s+='<polyline points="'+T.map((v,i)=>X(i).toFixed(1)+","+YT(v).toFixed(1)).join(" ")+'" class="tl"/>';
 T.forEach((v,i)=>{s+='<circle cx="'+X(i).toFixed(1)+'" cy="'+YT(v).toFixed(1)+'" r="2.6" class="td"><title>'+MON[i]+": "+v.toFixed(1)+' °C</title></circle>'});
 MON.forEach((m,i)=>{s+='<text x="'+X(i)+'" y="'+(H-7)+'" class="mo">'+m+'</text>'});
 s+='<text x="4" y="10" class="ax tc">°C</text><text x="'+(W-2)+'" y="10" class="ax pc" text-anchor="end">mm</text></svg>';return s}

/* ---------- the panel, the pin, the clicks ---------- */
let on=false,panel=null,pin=null,last=null;
function mount(){const g=G();if(!g)return null;const h=g.host;if(getComputedStyle(h).position==="static")h.style.position="relative";
 if(!panel||(panel.parentNode!==h&&!panel._float)){if(panel)panel.remove();panel=document.createElement("div");panel.className="gfth";h.appendChild(panel);
  ["pointerdown","mousedown","wheel","click","dblclick"].forEach(t=>panel.addEventListener(t,e=>e.stopPropagation()));drag(panel)}
 if(!pin||pin.parentNode!==h){if(pin)pin.remove();pin=document.createElement("div");pin.className="gfth-pin";pin.innerHTML=ICON;h.appendChild(pin)}return panel}
function drag(p){p.addEventListener("pointerdown",e=>{if(e.button||e.target.closest("button,a,input,select,textarea,summary"))return;
 const r=p.getBoundingClientRect(),dx=e.clientX-r.left,dy=e.clientY-r.top,x0=e.clientX,y0=e.clientY;let moved=false;
 const mv=ev=>{if(!moved){if(Math.hypot(ev.clientX-x0,ev.clientY-y0)<4)return;moved=true;
   /* lift the card out of the map so it can go anywhere on the screen */
   if(!p._float){p._float=1;document.body.appendChild(p);p.classList.add("gfth-float")}}
  ev.preventDefault();const w=p.offsetWidth,h=p.offsetHeight;
  p.style.left=Math.max(0,Math.min(innerWidth-Math.min(w,60),ev.clientX-dx))+"px";p.style.top=Math.max(0,Math.min(innerHeight-30,ev.clientY-dy))+"px";p.style.bottom="auto";p.style.right="auto"};
 const up=()=>{removeEventListener("pointermove",mv);removeEventListener("pointerup",up)};addEventListener("pointermove",mv);addEventListener("pointerup",up)})}
function render(){const p=mount();if(!p)return;let body;
 if(!last)body='<p class="gfth-help">Click anywhere on land to see its climate: temperature and rainfall, month by month.</p>';
 else if(!D)body='<p class="gfth-help">Loading the climate data…</p>';
 else if(!last.c)body='<p class="gfth-help"><b>'+fmtLL(last.ll)+'</b>: open sea. Climate graphs are for places on land; click on land.</p>';
 else{const{T,P}=last.c,k=koppen(T,P,last.ll[1]),MAT=T.reduce((a,b)=>a+b)/12,MAP=P.reduce((a,b)=>a+b);
  body='<div class="gfth-where"><b>'+esc(last.name||fmtLL(last.ll))+'</b>'+(last.name?'<small>'+fmtLL(last.ll)+'</small>':'')+'</div>'+
   '<div class="gfth-now">Today ('+new Date().toLocaleDateString(undefined,{day:"numeric",month:"long"})+'): usually about <b>'+todayT(T).toFixed(1).replace("-","−")+' °C</b></div><div class="gfth-k"><span class="kc">'+k+'</span>'+esc(KN[k]||"")+'</div>'+graph(T,P)+
   '<div class="gfth-sum"><span><i class="tc"></i>Average '+MAT.toFixed(1)+' °C · warmest '+Math.max(...T).toFixed(1)+' °C · coldest '+Math.min(...T).toFixed(1)+' °C</span><span><i class="pc"></i>Rain and snow '+Math.round(MAP).toLocaleString()+' mm a year</span></div>'}
 p.innerHTML='<div class="gfth-h" title="Drag to move"><span class="gfth-ic">'+ICON+'</span><b>Thermometer</b><button type="button" class="gfth-x" aria-label="Close">×</button></div>'+body+
  '<p class="gfth-src">WorldClim 2.1 monthly averages, 1970–2000 (CC BY 4.0), at about 55 km; the Köppen type is worked out from the same numbers.</p>';
 p.querySelector(".gfth-x").onclick=()=>stop();place()}
function place(){const g=G();if(!pin||!g)return;if(!last||!on){pin.style.display="none";return}
 const pr=g.projection(),q=pr(last.ll);let vis=!!q&&isFinite(q[0]);if(vis&&!g._flat){try{const ro=pr.rotate();vis=d3.geoDistance(last.ll,[-ro[0],-ro[1]])<Math.PI/2}catch(e){}}
 const c=g.canvas.getBoundingClientRect(),h=g.host.getBoundingClientRect();if(!tag||tag.parentNode!==g.host){if(tag)tag.remove();tag=document.createElement("div");tag.className="gfth-tag";g.host.appendChild(tag)}
 if(!vis){pin.style.display="none";tag.style.display="none";return}
 if(last.c){const t=todayT(last.c.T);tag.textContent=(t<0&&Math.round(t)!==0?"−":"")+Math.abs(Math.round(t))+" °C";tag.title="Usual temperature for today's date";tag.style.display="";tag.style.left=(c.left-h.left+q[0]+14)+"px";tag.style.top=(c.top-h.top+q[1]-22)+"px"}else tag.style.display="none";
 pin.style.display="";pin.style.left=(c.left-h.left+q[0])+"px";pin.style.top=(c.top-h.top+q[1])+"px"}
function todayT(T,d){d=d||new Date();const y=d.getFullYear(),doy=(d-new Date(y,0,1))/864e5,L=(y%4?365:366),m=doy/L*12-.5,i=Math.floor(m),f=m-i,a=(i+12)%12,b=(i+13)%12;return T[a]*(1-f)+T[b]*f}
let tag=null;
function pick(ll){last={ll,c:null,name:null};render();load().then(()=>{if(!last||last.ll!==ll)return;last.c=at(ll);const cc=countryAt(ll);last.name=cname(cc);render()})}
let down=null;
function onDown(e){if(!on)return;const g=G();if(!g||e.button)return;const c=g.canvas.getBoundingClientRect();if(e.clientX<c.left||e.clientX>c.right||e.clientY<c.top||e.clientY>c.bottom)return;
 if(e.target.closest&&e.target.closest(".gfth,.globe-btns,.gf-xs,.gfk-tray,.gfk-panel,.ps-card,.flk,.ps-launcher,.globe-subs,button,input,select"))return;
 /* the place is worked out now, before the map can react to the press */
 /* the place: from the last pointer position before the press (other handlers can shift the map's frame on the press itself) */
 let ll=hov&&Math.hypot(hov.x-e.clientX,hov.y-e.clientY)<3?hov.ll:llAt(g,e.clientX,e.clientY);
 down={x:e.clientX,y:e.clientY,t:performance.now(),ll};e.stopPropagation()}
/* like the pins: while the thermometer is on, a press on the map picks a place and never spins or drags the map */
["mousedown","touchstart"].forEach(t=>addEventListener(t,e=>{if(down)e.stopPropagation()},true));
function onUp(e){if(!on||!down)return;const d=down;down=null;if(Math.hypot(e.clientX-d.x,e.clientY-d.y)>5||performance.now()-d.t>700)return;
 const ll=d.ll;if(!ll||!isFinite(ll[0])||!isFinite(ll[1]))return;
 e.stopImmediatePropagation();e.preventDefault();pick([((ll[0]+540)%360)-180,ll[1]]);swallow=performance.now()}
function llAt(g,x,y){try{const c=g.canvas.getBoundingClientRect();const ll=g.projection().invert([x-c.left,y-c.top]);if(!ll||!isFinite(ll[0]))return null;
 if(!g._flat){const ro=g.projection().rotate();if(d3.geoDistance(ll,[-ro[0],-ro[1]])>Math.PI/2)return null}return ll}catch(e){return null}}
let hov=null;addEventListener("pointermove",e=>{if(!on||e.buttons)return;const g=G();if(!g)return;hov={x:e.clientX,y:e.clientY,ll:llAt(g,e.clientX,e.clientY)}},true);
let swallow=0;
addEventListener("pointerdown",onDown,true);addEventListener("pointerup",onUp,true);
/* the click that placed the pin does not also open a country card */
addEventListener("click",e=>{if(performance.now()-swallow<400){e.stopImmediatePropagation();e.preventDefault()}},true);
function start(){on=true;load();mount();render();sync()}
function stop(){on=false;if(panel){panel.remove();panel=null}if(tag){tag.remove();tag=null}if(pin){pin.remove();pin=null}sync()}
(function loop(){try{if(on){if(appMode!=="allmaps")stop();else if(G()){if(!panel||!panel.isConnected||(panel.parentNode!==G().host&&!panel._float))render();place()}}}catch(e){}requestAnimationFrame(loop)})();
function sync(){try{const g=G();if(g)g.host.classList.toggle("gfth-on",on)}catch(e){}document.querySelectorAll(".gfk-thermo").forEach(b=>b.classList.toggle("on",on))}

/* ---------- the Toolkit slot ---------- */
const ICON='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 4a2 2 0 0 1 4 0v9.3a4 4 0 1 1-4 0z" fill="#fff" stroke="#b3261e" stroke-width="1.6"/><circle cx="12" cy="16.6" r="2.3" fill="#e0402f"/><rect x="11.2" y="8" width="1.6" height="8" rx=".8" fill="#e0402f"/></svg>';
function art(){return'<svg viewBox="0 0 100 100" class="gfk-art"><defs><linearGradient id="gfthG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#eef3f8"/><stop offset=".5" stop-color="#fff"/><stop offset="1" stop-color="#d9e2ec"/></linearGradient></defs>'+
 '<rect x="38" y="8" width="24" height="64" rx="12" fill="url(#gfthG)" stroke="#5b6b7d" stroke-width="2.5"/><circle cx="50" cy="76" r="15" fill="#e0402f" stroke="#9c2116" stroke-width="2.5"/>'+
 '<rect x="46" y="30" width="8" height="44" rx="4" fill="#e0402f"/><g stroke="#5b6b7d" stroke-width="2">'+[20,30,40,50,60].map(y=>'<line x1="62" x2="'+(y%20?68:72)+'" y1="'+y+'" y2="'+y+'"/>').join("")+'</g>'+
 '<circle cx="45" cy="71" r="4" fill="#fff" opacity=".55"/></svg>'}
function addSlot(){const felt=document.querySelector("#gfKit .gfk-felt");if(!felt||felt.querySelector(".gfk-thermo"))return;
 const b=document.createElement("button");b.type="button";b.className="gfk-slot gfk-thermo";b.title="Thermometer: click a place to see its climate graph";b.setAttribute("aria-label","Thermometer");
 b.innerHTML=art()+"<span>Thermometer</span>";b.onclick=e=>{e.stopPropagation();on?stop():start()};
 const after=felt.querySelector('[data-tool="shovel"]');if(after&&after.nextSibling)felt.insertBefore(b,after.nextSibling);else felt.appendChild(b);sync()}
setInterval(addSlot,700);addSlot();

/* ---------- the Climate map opens with the Thermometer on; the Elevation map with the cross-section ---------- */
(function(){let lastMode=null;setInterval(()=>{try{const m=appMode==="allmaps"?allMapsColorMode:null;if(m===lastMode)return;const prev=lastMode;lastMode=m;
 if(typeof ps!=="undefined"&&ps)return;
 if(m==="climate"&&!on)setTimeout(()=>{if(allMapsColorMode==="climate"&&!on)start()},300);else if(prev==="climate"&&on)stop();
 if(m==="elevation"&&window.gfCrossSection&&!document.querySelector(".gf-xs"))setTimeout(()=>{try{if(allMapsColorMode==="elevation"&&!document.querySelector(".gf-xs"))gfCrossSection.start()}catch(e){}},300);
 else if(prev==="elevation"&&m!=="elevation"&&window.gfCrossSection&&document.querySelector(".gf-xs"))try{gfCrossSection.stop()}catch(e){}}catch(e){}},400)})();

const css=document.createElement("style");css.textContent=`
.gfth{ position:absolute; left:10px; bottom:10px; z-index:9; width:min(370px,calc(100% - 20px)); background:#fff; color:#1d2433; border-radius:14px; box-shadow:0 8px 26px rgba(0,0,0,.25); padding:0 10px 8px; font-size:12.5px; }
.gfth-h{ display:flex; align-items:center; gap:6px; padding:7px 0 5px; cursor:move; user-select:none; }
.gfth-h b{ flex:1; font-size:13.5px; } .gfth-ic svg,.gfth-pin svg{ width:18px; height:18px; display:block; }
.gfth-x{ border:0; background:rgba(20,40,70,.07); width:26px; height:26px; border-radius:50%; font:700 16px/1 system-ui; cursor:pointer; color:inherit; }
.gfth-help{ margin:2px 0 6px; opacity:.8; }
.gfth-where b{ font-size:14px; } .gfth-where small{ margin-left:6px; opacity:.6; }
.gfth-k{ margin:3px 0 2px; } .gfth-k .kc{ display:inline-block; font-weight:800; background:#2b7bb5; color:#fff; border-radius:6px; padding:1px 6px; margin-right:6px; font-size:11.5px; }
.gfth-g{ width:100%; height:auto; display:block; margin:2px 0; }
.gfth-g .gl{ stroke:#000; stroke-opacity:.08; } .gfth-g .z{ stroke:#2b7bb5; stroke-dasharray:3 2; stroke-opacity:.5; }
.gfth-g .yt{ font-size:9.5px; fill:#c0392b; text-anchor:end; } .gfth-g .yp{ font-size:9.5px; fill:#2b7bb5; }
.gfth-g .mo{ font-size:10px; fill:#5b6575; text-anchor:middle; } .gfth-g .ax{ font-size:9.5px; font-weight:800; } .gfth-g .ax.tc{ fill:#c0392b; } .gfth-g .ax.pc{ fill:#2b7bb5; }
.gfth-g .pb{ fill:#4b97d8; fill-opacity:.75; } .gfth-g .tl{ fill:none; stroke:#d6402f; stroke-width:2.2; stroke-linejoin:round; } .gfth-g .td{ fill:#fff; stroke:#d6402f; stroke-width:1.6; }
.gfth-sum{ display:flex; flex-direction:column; gap:2px; font-size:11.5px; } .gfth-sum i{ display:inline-block; width:10px; height:3px; border-radius:2px; margin-right:5px; vertical-align:middle; } .gfth-sum i.tc{ background:#d6402f; } .gfth-sum i.pc{ background:#4b97d8; height:8px; }
.gfth-src{ margin:5px 0 0; font-size:10px; opacity:.55; }
.gfth.gfth-float{ position:fixed; z-index:9000; }
.gfth{ cursor:grab; } .gfth button{ cursor:pointer; }
.gfth-now{ margin:2px 0 6px; font-size:12.5px; } .gfth-now b{ color:#d2452c; font-size:14px; }
.gfth-tag{ position:absolute; z-index:8; pointer-events:none; background:#d2452c; color:#fff; font:700 12px/1 system-ui,sans-serif; padding:4px 7px; border-radius:10px; box-shadow:0 2px 6px rgba(0,0,0,.35); white-space:nowrap; }
.gfth-pin{ position:absolute; z-index:8; transform:translate(-50%,-100%); pointer-events:none; filter:drop-shadow(0 1px 2px rgba(0,0,0,.4)); }
.gfth-pin svg{ width:26px; height:26px; }
.globe-host.gfth-on canvas{ cursor:crosshair; }
.gfk-thermo.on{ outline:2px solid #e0402f; outline-offset:2px; border-radius:12px; }
body.sky-night .gfth{ background:#1c2333; color:#e8ecf3; } body.sky-night .gfth-g .mo{ fill:#aab4c6; } body.sky-night .gfth-g .gl{ stroke:#fff; } body.sky-night .gfth-x{ background:rgba(255,255,255,.1); }`;
document.head.appendChild(css);
window.gfThermo={start,stop,pick,koppen,load,graph,KN,at:ll=>D?at(ll):null};
})();
