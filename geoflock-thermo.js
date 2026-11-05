/* GeoFlock: the Thermometer, a Toolkit gadget. Turn it on, click any place on land (flat map or globe) and a climate graph
   opens: average temperature month by month (red line) and rainfall (blue bars), with the Köppen climate type worked out
   from the same numbers, the yearly average temperature and the yearly rainfall. Each click places another thermometer (up to 8).
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

/* ---------- the panel, the pins, the clicks ----------
   Up to MAXT thermometers stay on the map (a new one past that replaces the oldest). The card shows the newest; click a
   thermometer's icon on the map, or its tab in the card, to show that one. Each icon is a little gauge: a red bar rising
   from the zero mark for today's usual temperature above 0 °C, a blue bar dropping below it for one below 0 °C. */
const MAXT=8;let on=false,panel=null,items=[],last=null,tag=null,pin=null;
function mount(){const g=G();if(!g)return null;const h=g.host;if(getComputedStyle(h).position==="static")h.style.position="relative";
 if(!panel||(panel.parentNode!==h&&!panel._float)){if(panel)panel.remove();panel=document.createElement("div");panel.className="gfth";h.appendChild(panel);
  ["pointerdown","mousedown","wheel","click","dblclick"].forEach(t=>panel.addEventListener(t,e=>e.stopPropagation()));drag(panel)}return panel}
function drag(p){p.addEventListener("pointerdown",e=>{if(e.button||e.target.closest("button,a,input,select,textarea,summary"))return;
 const r=p.getBoundingClientRect(),dx=e.clientX-r.left,dy=e.clientY-r.top,x0=e.clientX,y0=e.clientY;let moved=false;
 const mv=ev=>{if(!moved){if(Math.hypot(ev.clientX-x0,ev.clientY-y0)<4)return;moved=true;
   /* lift the card out of the map so it can go anywhere on the screen */
   if(!p._float){p._float=1;document.body.appendChild(p);p.classList.add("gfth-float")}}
  ev.preventDefault();const w=p.offsetWidth,h=p.offsetHeight;
  p.style.left=Math.max(0,Math.min(innerWidth-Math.min(w,60),ev.clientX-dx))+"px";p.style.top=Math.max(0,Math.min(innerHeight-30,ev.clientY-dy))+"px";p.style.bottom="auto";p.style.right="auto"};
 const up=()=>{removeEventListener("pointermove",mv);removeEventListener("pointerup",up)};addEventListener("pointermove",mv);addEventListener("pointerup",up)})}
const fmtT=t=>(t<0&&Math.round(t)!==0?"−":"")+Math.abs(Math.round(t))+" °C";
/* the gauge: tube from y=3 to y=30, zero mark at y=19; +40 °C fills to the top, −40 °C to the bulb */
function gauge(t){const Z=19;let bar="",bulb="#b9c3cd";
 if(t!=null){if(t>=0){const top=Z-Math.min(1,t/40)*15;bar='<rect x="10.4" y="'+top.toFixed(1)+'" width="3.2" height="'+(Z-top+.6).toFixed(1)+'" rx="1.6" fill="#e0402f"/>';bulb="#e0402f"}
  else{const bot=Z+Math.min(1,-t/40)*10;bar='<rect x="10.4" y="'+(Z-.6)+'" width="3.2" height="'+(bot-Z+.6).toFixed(1)+'" rx="1.6" fill="#2b7bd5"/>';bulb="#2b7bd5"}}
 return'<svg viewBox="0 0 24 40" aria-hidden="true"><path d="M8.6 5a3.4 3.4 0 0 1 6.8 0v24.2a6.2 6.2 0 1 1-6.8 0z" fill="#fff" stroke="#4a5568" stroke-width="1.4"/>'+bar+
  '<line x1="15.4" x2="18.4" y1="'+Z+'" y2="'+Z+'" stroke="#4a5568" stroke-width="1.3"/><text x="19.2" y="'+(Z+1.6)+'" font-size="4.6" font-weight="800" fill="#4a5568" font-family="system-ui">0</text>'+
  '<circle cx="12" cy="33.6" r="4.1" fill="'+bulb+'"/></svg>'}
const tNow=it=>it&&it.c?todayT(it.c.T):null;
function tabs(){if(items.length<2)return"";return'<div class="gfth-tabs" role="tablist">'+items.map((it,i)=>{const t=tNow(it);return'<button type="button" role="tab" data-ti="'+i+'" class="'+(it===last?"on":"")+'" aria-selected="'+(it===last)+'"><span class="gfth-tn">'+(i+1)+'</span>'+esc(it.name||fmtLL(it.ll))+(t!=null?' <i class="'+(t<0?"cold":"")+'">'+fmtT(t)+'</i>':'')+'<span class="gfth-tx" data-tx="'+i+'" title="Remove this thermometer">×</span></button>'}).join("")+'</div>'}
/* quiet: a tour stop put thermometers down; only their pins show (no panel, map clicks place nothing) until one is clicked */
let quiet=false,auto=[],autoStarted=false,drop=false;
function render(){const p=mount();if(!p)return;p.style.display=quiet?"none":"";let body;
 if(!last)body='<p class="gfth-help">'+(drop?'Click anywhere on land to place a thermometer and see its climate: temperature and rainfall, month by month. You can place up to '+MAXT+'.':'Turn on <b>Drop thermometers</b>, then click anywhere on land to see its climate: temperature and rainfall, month by month.')+'</p>';
 else if(!D)body='<p class="gfth-help">Loading the climate data…</p>';
 else if(!last.c)body='<p class="gfth-help"><b>'+fmtLL(last.ll)+'</b>: open sea. Climate graphs are for places on land; click on land.</p>';
 else{const{T,P}=last.c,k=koppen(T,P,last.ll[1]),MAT=T.reduce((a,b)=>a+b)/12,MAP=P.reduce((a,b)=>a+b);
  body='<div class="gfth-where"><b>'+esc(last.name||fmtLL(last.ll))+'</b>'+(last.name?'<small>'+fmtLL(last.ll)+'</small>':'')+'</div>'+
   '<div class="gfth-now">Today ('+new Date().toLocaleDateString(undefined,{day:"numeric",month:"long"})+'): usually about <b>'+todayT(T).toFixed(1).replace("-","−")+' °C</b></div><div class="gfth-k"><span class="kc">'+k+'</span>'+esc(KN[k]||"")+'</div>'+graph(T,P)+
   '<div class="gfth-sum"><span><i class="tc"></i>Average '+MAT.toFixed(1)+' °C · warmest '+Math.max(...T).toFixed(1)+' °C · coldest '+Math.min(...T).toFixed(1)+' °C</span><span><i class="pc"></i>Rain and snow '+Math.round(MAP).toLocaleString()+' mm a year</span></div>'}
 p.innerHTML='<div class="gfth-h" title="Drag to move"><span class="gfth-ic">'+ICON+'</span><b>Thermometer'+(items.length?' <small>'+items.length+' of '+MAXT+'</small>':'')+'</b><button type="button" class="gfth-x" aria-label="Close">×</button></div>'+
  '<div class="gfth-dropr"><button type="button" class="gfth-drop'+(drop?' on':'')+'" aria-pressed="'+drop+'" title="'+(drop?'Clicks on the map place thermometers (Esc stops)':'Turn on to place thermometers with a click')+'"><i></i>Drop thermometers</button><small>'+(drop?'Click on land · Esc to stop':'Off: the map pans as usual')+'</small></div>'+tabs()+body+
  (items.length>=MAXT?'<p class="gfth-help gfth-full">That is the most thermometers: the next one replaces the oldest.</p>':'')+
  '<p class="gfth-src">WorldClim 2.1 monthly averages, 1970–2000 (CC BY 4.0), at about 55 km; the Köppen type is worked out from the same numbers.</p>';
 p.querySelector(".gfth-x").onclick=()=>stop();p.querySelector(".gfth-drop").onclick=()=>setDrop(!drop);
 p.querySelectorAll("[data-ti]").forEach(b=>b.onclick=e=>{const x=e.target.closest("[data-tx]");if(x){remove(+x.dataset.tx);return}show(+b.dataset.ti)});place()}
function show(i){if(!items[i])return;quiet=false;last=items[i];if(!on){on=true;sync()}render()}
function remove(i){const it=items[i];if(!it)return;if(it.pin)it.pin.remove();if(it.tag)it.tag.remove();items.splice(i,1);if(last===it)last=items[items.length-1]||null;render()}
function mkPin(it,g){const h=g.host;if(it.pin&&it.pin.parentNode===h)return;if(it.pin)it.pin.remove();if(it.tag)it.tag.remove();
 const p=document.createElement("div");p.className="gfth-pin";p.title="Click to show this thermometer · drag to move it";h.appendChild(p);it.pin=p;it.pk="";
 /* a click shows this thermometer; a drag moves it, and it reads the new place when let go */
 p.addEventListener("pointerdown",e=>{if(e.button)return;e.stopPropagation();e.preventDefault();const x0=e.clientX,y0=e.clientY;let moved=false;
  try{p.setPointerCapture(e.pointerId)}catch(x){}
  const mv=ev=>{if(!moved&&Math.hypot(ev.clientX-x0,ev.clientY-y0)<4)return;moved=true;p.classList.add("drag");const g2=G();const ll=g2&&llAt(g2,ev.clientX,ev.clientY);if(ll){it.ll=[((ll[0]+540)%360)-180,ll[1]];place()}};
  const up=ev=>{p.removeEventListener("pointermove",mv);p.removeEventListener("pointerup",up);p.removeEventListener("pointercancel",up);p.classList.remove("drag");swallow=performance.now();
   const i=items.indexOf(it);if(i<0)return;if(!moved){show(i);return}
   it.c=null;it.name=null;it.pk="";last=it;render();load().then(()=>{it.c=at(it.ll);it.name=cname(countryAt(it.ll));it.pk="";if(on)render()})};
  p.addEventListener("pointermove",mv);p.addEventListener("pointerup",up);p.addEventListener("pointercancel",up)});
 p.addEventListener("click",e=>{e.stopPropagation();e.preventDefault()});
 const t=document.createElement("div");t.className="gfth-tag";h.appendChild(t);it.tag=t}
/* the picked thermometer gets a small bar under it: Duplicate, Delete */
let bar=null;
function dup(it){const g=G();if(!g)return;let ll=null;try{const q=g.projection()(it.ll);if(q)ll=g.projection().invert([q[0]+34,q[1]+6])}catch(e){}
 if(!ll||!isFinite(ll[0]))ll=[it.ll[0]+1.5,it.ll[1]];pick([((ll[0]+540)%360)-180,ll[1]])}
function placeBar(g,h){const it=last,show=on&&!quiet&&it&&it.pin&&it.pin.style.display!=="none"&&items.includes(it);
 if(!show){if(bar)bar.hidden=true;return}
 if(!bar||bar.parentNode!==h){if(bar)bar.remove();bar=document.createElement("div");bar.className="gfth-bar";
  bar.innerHTML='<button type="button" data-a="dup" title="Another thermometer next to this one">⧉ Duplicate</button><button type="button" data-a="del" class="del" title="Remove this thermometer">🗑 Delete</button>';
  ["pointerdown","mousedown","click","dblclick","wheel"].forEach(t=>bar.addEventListener(t,e=>e.stopPropagation()));
  bar.querySelector('[data-a="dup"]').onclick=()=>{if(last)dup(last)};bar.querySelector('[data-a="del"]').onclick=()=>{const i=items.indexOf(last);if(i>=0)remove(i)};h.appendChild(bar)}
 bar.hidden=false;bar.style.left=it.pin.style.left;bar.style.top=(parseFloat(it.pin.style.top)+14)+"px"}
function place(){const g=G();if(!g)return;const pr=g.projection(),ro=pr.rotate?pr.rotate():[0,0],c=g.canvas.getBoundingClientRect(),h=g.host.getBoundingClientRect();
 items.forEach(it=>{mkPin(it,g);
  const q=pr(it.ll);let vis=!!q&&isFinite(q[0]);if(vis&&!g._flat){try{vis=d3.geoDistance(it.ll,[-ro[0],-ro[1]])<Math.PI/2&&(!window.gfGlobeShows||gfGlobeShows(g,q))}catch(e){}}
  if(!vis){it.pin.style.display=it.tag.style.display="none";return}
  const t=tNow(it),k=(t==null?"n":Math.round(t*2))+(it===last?"s":"");if(it.pk!==k){it.pk=k;it.pin.innerHTML=gauge(t);it.pin.classList.toggle("sel",it===last)}
  const x=c.left-h.left+q[0],y=c.top-h.top+q[1];it.pin.style.display="";it.pin.style.left=x+"px";it.pin.style.top=y+"px";
  if(t!=null){it.tag.textContent=fmtT(t);it.tag.title="Usual temperature for today's date";it.tag.classList.toggle("cold",t<0);it.tag.style.display="";it.tag.style.left=(x+12)+"px";it.tag.style.top=(y-30)+"px"}else it.tag.style.display="none"});placeBar(g,g.host)}
function todayT(T,d){d=d||new Date();const y=d.getFullYear(),doy=(d-new Date(y,0,1))/864e5,L=(y%4?365:366),m=doy/L*12-.5,i=Math.floor(m),f=m-i,a=(i+12)%12,b=(i+13)%12;return T[a]*(1-f)+T[b]*f}
function pick(ll,nm){if(items.length>=MAXT)remove(0);const it={ll,c:null,name:null,pin:null,tag:null};items.push(it);last=it;render();
 load().then(()=>{it.c=at(ll);const cc=countryAt(ll);it.name=nm||cname(cc);it.pk="";if(on)render()});return it}
/* a tour stop's thermometers: [[lon,lat,"Name"],…]; clearAuto takes them away again (and the tool, if the stop turned it on) */
function setAuto(list){clearAuto();if(!list||!list.length)return;quiet=true;if(!on){autoStarted=true;start({drop:false})}
 auto=list.map(q=>pick([q[0],q[1]],q[2]||null));if(quiet)last=auto[0];render()}
function clearAuto(){const A=auto;auto=[];A.forEach(it=>{const i=items.indexOf(it);if(i>=0)remove(i)});const was=quiet;quiet=false;if(autoStarted){autoStarted=false;if(!items.length)stop();else render()}else if(was&&on)render()}
let down=null;
function onDown(e){if(!on||quiet||!drop)return;const g=G();if(!g||e.button)return;const c=g.canvas.getBoundingClientRect();if(e.clientX<c.left||e.clientX>c.right||e.clientY<c.top||e.clientY>c.bottom)return;
 if(e.target.closest&&e.target.closest(".gfth,.gfth-pin,.globe-btns,.gf-xs,.gfk-tray,.gfk-panel,.ps-card,.flk,.ps-launcher,.globe-subs,button,input,select"))return;
 /* the place is worked out now, before the map can react to the press */
 /* the place: from the last pointer position before the press (other handlers can shift the map's frame on the press itself) */
 let ll=hov&&Math.hypot(hov.x-e.clientX,hov.y-e.clientY)<3?hov.ll:llAt(g,e.clientX,e.clientY);
 /* the map still pans and spins as usual: only a quick click that does not move puts a thermometer down */
 if(pend&&performance.now()-pend.t<320){clearTimeout(pend.tm);pend=null;down=null;return}
 down={x:e.clientX,y:e.clientY,t:performance.now(),ll}}
let pend=null;
function onUp(e){if(!on||!drop||!down)return;const d=down;down=null;if(Math.hypot(e.clientX-d.x,e.clientY-d.y)>4||performance.now()-d.t>500)return;
 const ll=d.ll;if(!ll||!isFinite(ll[0])||!isFinite(ll[1]))return;
 swallow=performance.now();
 /* wait a moment: a second click (a double-click zooms the map) cancels it */
 const at0=[((ll[0]+540)%360)-180,ll[1]];pend={t:performance.now(),tm:setTimeout(()=>{pend=null;if(on&&drop)pick(at0)},300)}}
function llAt(g,x,y){try{const c=g.canvas.getBoundingClientRect();const ll=g.projection().invert([x-c.left,y-c.top]);if(!ll||!isFinite(ll[0]))return null;
 if(!g._flat){const ro=g.projection().rotate();if(d3.geoDistance(ll,[-ro[0],-ro[1]])>Math.PI/2)return null}return ll}catch(e){return null}}
let hov=null;addEventListener("pointermove",e=>{if(!on||e.buttons)return;const g=G();if(!g)return;hov={x:e.clientX,y:e.clientY,ll:llAt(g,e.clientX,e.clientY)}},true);
let swallow=0;
addEventListener("pointerdown",onDown,true);addEventListener("pointerup",onUp,true);
/* the click that placed the pin does not also open a country card */
addEventListener("click",e=>{if(performance.now()-swallow<400){e.stopImmediatePropagation();e.preventDefault()}},true);
/* the map now sees the press too (so it can pan), so its own tap would open the country card: not right after a thermometer tap */
(function hookFZ(){if(typeof openFlagZoom!=="function"){setTimeout(hookFZ,800);return}if(openFlagZoom._th)return;const _f=openFlagZoom;
 openFlagZoom=function(){if(performance.now()-swallow<700)return;return _f.apply(this,arguments)};openFlagZoom._th=1})();
function setDrop(v){drop=!!v;if(drop)try{gfOneTool.claim("thermo")}catch(e){}render();sync()}
/* start({drop}): dropping is on unless asked otherwise (the Climate map opens the tool with it off) */
function start(o){on=true;drop=!(o&&o.drop===false);if(drop)try{gfOneTool.claim("thermo")}catch(e){}load();mount();render();sync()}
try{gfOneTool.on("thermo",()=>{if(!drop)return;drop=false;if(on)render();sync()})}catch(e){}
/* Esc stops dropping (the thermometers stay) */
addEventListener("keydown",e=>{if(e.key==="Escape"&&on&&drop&&!e.target.closest?.("input,textarea,select")){drop=false;render();sync()}});
/* closing the tool keeps the thermometers on the map (a click on one opens it again); only new ones cannot be placed */
function stop(){on=false;drop=false;if(panel){panel.remove();panel=null}if(bar)bar.hidden=true;sync()}
(function loop(){try{if(on){if(appMode!=="allmaps")stop();else if(G()){if(!panel||!panel.isConnected||(panel.parentNode!==G().host&&!panel._float))render();place()}}
 else if(items.length&&appMode==="allmaps"&&G())place()}catch(e){}requestAnimationFrame(loop)})();
function sync(){try{const g=G();if(g)g.host.classList.toggle("gfth-on",on&&drop&&!quiet)}catch(e){}document.querySelectorAll(".gfk-thermo").forEach(b=>b.classList.toggle("on",on))}

/* ---------- the Toolkit slot ---------- */
const ICON='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 4a2 2 0 0 1 4 0v9.3a4 4 0 1 1-4 0z" fill="#fff" stroke="#b3261e" stroke-width="1.6"/><circle cx="12" cy="16.6" r="2.3" fill="#e0402f"/><rect x="11.2" y="8" width="1.6" height="8" rx=".8" fill="#e0402f"/></svg>';
function art(){return'<svg viewBox="0 0 100 100" class="gfk-art"><defs><linearGradient id="gfthG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#eef3f8"/><stop offset=".5" stop-color="#fff"/><stop offset="1" stop-color="#d9e2ec"/></linearGradient></defs>'+
 '<rect x="38" y="8" width="24" height="64" rx="12" fill="url(#gfthG)" stroke="#5b6b7d" stroke-width="2.5"/><circle cx="50" cy="76" r="15" fill="#e0402f" stroke="#9c2116" stroke-width="2.5"/>'+
 '<rect x="46" y="30" width="8" height="44" rx="4" fill="#e0402f"/><g stroke="#5b6b7d" stroke-width="2">'+[20,30,40,50,60].map(y=>'<line x1="62" x2="'+(y%20?68:72)+'" y1="'+y+'" y2="'+y+'"/>').join("")+'</g>'+
 '<circle cx="45" cy="71" r="4" fill="#fff" opacity=".55"/></svg>'}
function addSlot(){const felt=document.querySelector("#gfKit .gfk-felt");if(!felt||felt.querySelector(".gfk-thermo"))return;
 const b=document.createElement("button");b.type="button";b.className="gfk-slot gfk-thermo";b.title="Thermometer: click a place to see its climate graph";b.setAttribute("aria-label","Thermometer");
 b.innerHTML=art()+"<span>Thermometer</span>";b.onclick=e=>{e.stopPropagation();if(on&&quiet){quiet=false;autoStarted=false;render();return}on?stop():start({drop:true})};
 const after=felt.querySelector('[data-tool="shovel"]');if(after&&after.nextSibling)felt.insertBefore(b,after.nextSibling);else felt.appendChild(b);sync()}
setInterval(addSlot,700);addSlot();

/* ---------- the Climate map opens with the Thermometer on; the Elevation map with the cross-section ---------- */
(function(){let lastMode=null;setInterval(()=>{try{const m=appMode==="allmaps"?allMapsColorMode:null;if(m===lastMode)return;const prev=lastMode;lastMode=m;
 if(typeof ps!=="undefined"&&ps)return;
 if(m==="climate"&&!on)setTimeout(()=>{if(allMapsColorMode==="climate"&&!on)start({drop:false})},300);else if(prev==="climate"&&on)stop();
 if(m==="elevation"&&window.gfCrossSection&&!document.querySelector(".gf-xs"))setTimeout(()=>{try{if(allMapsColorMode==="elevation"&&!document.querySelector(".gf-xs"))gfCrossSection.start()}catch(e){}},300);
 else if(prev==="elevation"&&m!=="elevation"&&window.gfCrossSection&&document.querySelector(".gf-xs"))try{gfCrossSection.stop()}catch(e){}}catch(e){}},400)})();

const css=document.createElement("style");css.textContent=`
.gfth-dropr{ display:flex; align-items:center; gap:8px; margin:2px 0 8px; } .gfth-dropr small{ opacity:.7; font-size:11.5px; }
.gfth-drop{ display:inline-flex; align-items:center; gap:7px; border:1.5px solid rgba(179,38,30,.45); background:transparent; color:inherit; border-radius:999px; padding:5px 11px; font:700 12.5px system-ui,sans-serif; cursor:pointer; }
.gfth-drop i{ width:26px; height:14px; border-radius:999px; background:rgba(120,130,150,.45); position:relative; flex:none; transition:background .15s; }
.gfth-drop i::after{ content:""; position:absolute; top:2px; left:2px; width:10px; height:10px; border-radius:50%; background:#fff; transition:left .15s; }
.gfth-drop.on{ background:#c0392b; border-color:#c0392b; color:#fff; } .gfth-drop.on i{ background:rgba(255,255,255,.45); } .gfth-drop.on i::after{ left:14px; }
.gfth-bar{ position:absolute; z-index:26; transform:translateX(-50%); display:flex; gap:4px; padding:3px; border-radius:10px; background:rgba(20,28,48,.92); box-shadow:0 3px 10px rgba(0,0,0,.3); }
.gfth-bar[hidden]{ display:none; }
.gfth-bar button{ border:0; border-radius:7px; padding:4px 9px; background:rgba(255,255,255,.1); color:#fff; font:700 11.5px system-ui,sans-serif; cursor:pointer; white-space:nowrap; }
.gfth-bar button:hover{ background:rgba(255,255,255,.22); } .gfth-bar button.del:hover{ background:#c0392b; }
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
.gfth:not(.gfth-float){ z-index:20; max-height:calc(100% - 20px); overflow:auto; }
.gfth{ cursor:grab; } .gfth button{ cursor:pointer; }
.gfth-now{ margin:2px 0 6px; font-size:12.5px; } .gfth-now b{ color:#d2452c; font-size:14px; }
.gfth-tag{ position:absolute; z-index:8; pointer-events:none; background:#d2452c; color:#fff; font:700 12px/1 system-ui,sans-serif; padding:4px 7px; border-radius:10px; box-shadow:0 2px 6px rgba(0,0,0,.35); white-space:nowrap; }
.gfth-pin{ position:absolute; z-index:8; transform:translate(-50%,-92%); pointer-events:auto; cursor:grab; touch-action:none; filter:drop-shadow(0 1px 2px rgba(0,0,0,.45)); border-radius:10px; }
.gfth-pin svg{ width:22px; height:37px; display:block; } .gfth-pin.sel{ filter:drop-shadow(0 0 0 #fff) drop-shadow(0 0 3px #ffd34d) drop-shadow(0 1px 2px rgba(0,0,0,.5)); }
.gfth-tag.cold{ background:#2b7bd5; }
.gfth-tabs{ display:flex; flex-wrap:nowrap; overflow-x:auto; gap:4px; margin:0 0 6px; padding-bottom:2px; scrollbar-width:thin; } .gfth-tabs button{ flex:none; }
.gfth-tabs button{ border:1.5px solid rgba(20,40,70,.14); background:transparent; color:inherit; border-radius:999px; padding:2px 4px 2px 3px; font:600 11.5px system-ui; display:inline-flex; align-items:center; gap:4px; max-width:170px; white-space:nowrap; overflow:hidden; }
.gfth-tabs button.on{ border-color:#d2452c; background:rgba(210,69,44,.1); } .gfth-tabs i{ font-style:normal; font-weight:800; color:#d2452c; } .gfth-tabs i.cold{ color:#2b7bd5; }
.gfth-tn{ background:#4a5568; color:#fff; border-radius:50%; width:16px; height:16px; display:inline-flex; align-items:center; justify-content:center; font-size:10px; flex:none; }
.gfth-tx{ opacity:.5; padding:0 4px; font-size:14px; } .gfth-tx:hover{ opacity:1; }
.gfth-h small{ font-weight:600; opacity:.55; font-size:11px; margin-left:4px; } .gfth-full{ font-size:11px; }
body.sky-night .gfth-tabs button{ border-color:rgba(255,255,255,.18); }
.globe-host.gfth-on canvas{ cursor:crosshair; }
.gfk-thermo.on{ outline:2px solid #e0402f; outline-offset:2px; border-radius:12px; }
body.sky-night .gfth{ background:#1c2333; color:#e8ecf3; } body.sky-night .gfth-g .mo{ fill:#aab4c6; } body.sky-night .gfth-g .gl{ stroke:#fff; } body.sky-night .gfth-x{ background:rgba(255,255,255,.1); }`;
document.head.appendChild(css);
window.gfThermo={start,stop,pick,setAuto,clearAuto,koppen,load,graph,KN,at:ll=>D?at(ll):null};
})();
