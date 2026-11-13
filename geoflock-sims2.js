/* GeoFlock: simulations, round 3 — better versions of the tour diagrams that looked most like toys.
   Each one is re-registered in the shared registry DG (index.html) under its old key, so every tour stop, the Models
   browser and the dictionary pick up the new version without any other change. They share a small kit (window.GFSIM)
   that geoflock-sims-library.js also uses: sliders, buttons, tabs, an animation loop that pauses off screen, real land
   from the map's own country shapes (projFeatures), real plate boundaries (Bird 2002, as drawn on the Maps page) and
   plate motions (NNR-MORVEL56 Euler poles), and texture tiles drawn once on a canvas.
   Replaced here:
     hawaii      Hawaii on a conveyor belt: the real islands' coastlines, the plate sliding over a fixed plume, a cross-section
                 with the volcanoes growing and sinking, island ages; a second tab for the whole Hawaiian–Emperor chain
     plates      How fast the plates move: a world map with the real plate boundaries coloured by type, motion arrows, and
                 cities carried along by their plates for up to 50 million years
     platebound  How plates meet: layered, textured cross-sections, each with a locator map of where it happens
     meander     How a river makes an oxbow lake: a meandering river on a textured floodplain that bends, cuts off and leaves
                 an oxbow lake
     tides       Two tides a day, spring and neap: the real Earth from above the North Pole, the Moon and the Sun
     monsoon     Why the monsoon switches on and off: the real map of South Asia through the year
     gravity     The gravity model: real cities on a real map, flows that change as you drag
     mercator    How much Mercator inflates: real Greenland and Africa outlines dragged north and south
     citymodels  Three models of the city, drawn as textured city plans
     vonthunen   Von Thünen's rings on a textured landscape, with transport cost and a river
     tsunami     A tsunami crossing the Indian Ocean on the real depth profile from Sumatra to Sri Lanka
     tallest     Which mountain is tallest: jagged mountains, Mauna Kea's drowned base, the Earth's bulge
     epicentre   Find the earthquake: the 2019 Ridgecrest quake timed by three real towns' seismographs
   Loaded after geoflock-climate-sims.js; the climate tour's own diagrams are left alone. */
(function(){
"use strict";
if(typeof DG==="undefined"||typeof dgFigure!=="function"||typeof d3==="undefined")return;
const INK="#1d3047",ACC="#e8701a",SUB="#5b6b80",WAT="#3d8fd1",PAN="#f3f6fa",HOT="#d2552b";
const T=(x,y,t,o)=>'<text x="'+x+'" y="'+y+'"'+(o?" "+o:"")+">"+t+"</text>";
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,f1=v=>(+v).toFixed(1),f2=v=>(+v).toFixed(2);
const sstep=(a,b,v)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t)};
const q=(s,x)=>s.querySelector(x),txt=(s,x,t)=>{const e=q(s,x);if(e&&e.textContent!==t)e.textContent=t};
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");
const tip=t=>' data-tip="'+esc(t)+'"';
const fmt=n=>Math.round(n).toLocaleString("en-GB");
const show=(svg,sel,on)=>{svg.querySelectorAll(sel).forEach(e=>{e.style.display=on?"":"none"})};
const ln=pts=>pts.map((p,i)=>(i?"L":"M")+f1(p[0])+","+f1(p[1])).join("");
const rnd=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)};
const R=Math.PI/180;
/* the real id of a gradient or pattern after dgFigure has made it unique */
const uid=(svg,b)=>(q(svg,'[id="'+b+'"],[id^="'+b+'_g"]')||{}).id||b;
const url=(svg,b)=>"url(#"+uid(svg,b)+")";
function setHTML(svg,sel,h){const g=q(svg,sel);if(g&&g._h!==h){g._h=h;g.innerHTML=typeof dgPaint==="function"?dgPaint(h):h}}

/* ---------- animation that pauses when the diagram is off screen or the tab is hidden ---------- */
function simLoop(svg,fn){let last=performance.now(),vis=true;try{const io=new IntersectionObserver(es=>{vis=es[es.length-1].isIntersecting});io.observe(svg)}catch(e){}
 const tick=now=>{if(!svg.isConnected)return;const dt=Math.min(.1,(now-last)/1000);last=now;if(vis&&!document.hidden){try{fn(dt,now/1000)}catch(e){console.error(e);return}}requestAnimationFrame(tick)};requestAnimationFrame(tick)}

/* ---------- controls (same look as the other simulations) ---------- */
function slider(name,x,y,w,label){return '<g class="sm-sl gs-sl-'+name+'">'+T(x,y-6,label,'class="gs-sll-'+name+'" font-size="7.2" font-weight="700" fill="'+SUB+'"')+'<text class="sm-sv-'+name+'" x="'+(x+w)+'" y="'+(y-6)+'" font-size="7.6" font-weight="800" text-anchor="end" fill="'+INK+'"></text>'+
 '<rect x="'+x+'" y="'+(y-2)+'" width="'+w+'" height="4" rx="2" fill="#d6dee8"/><rect class="sm-fill-'+name+'" x="'+x+'" y="'+(y-2)+'" width="0" height="4" rx="2" fill="'+ACC+'"/>'+
 '<rect x="'+(x-6)+'" y="'+(y-10)+'" width="'+(w+12)+'" height="20" fill="transparent" data-drag="'+name+'"/>'+
 '<g class="dg-handle sm-knob-'+name+'" data-drag="'+name+'"><circle r="12" fill="transparent"/><circle r="5.8" fill="#fff" stroke="'+ACC+'" stroke-width="2.2"/></g></g>'}
function setSlider(svg,name,x,y,w,f,v){f=clamp(f,0,1);const k=q(svg,".sm-knob-"+name);if(k)k.setAttribute("transform","translate("+f1(x+w*f)+","+y+")");const fl=q(svg,".sm-fill-"+name);if(fl)fl.setAttribute("width",f1(w*f));if(v!=null)txt(svg,".sm-sv-"+name,v)}
function btn(act,x,y,w,label,cls){return '<g data-act="'+act+'" class="sm-btn gs-btn-'+act+' '+(cls||"")+'" style="cursor:pointer"><rect x="'+x+'" y="'+y+'" width="'+w+'" height="15" rx="7.5" fill="'+INK+'"/><text class="sm-btn-t" x="'+(x+w/2)+'" y="'+(y+10.4)+'" font-size="7.2" font-weight="800" text-anchor="middle" fill="#fff">'+label+'</text></g>'}
function btnOn(svg,act,on,label){const r=q(svg,".gs-btn-"+act+" rect");if(r)r.style.fill=on?ACC:INK;if(label!=null){const t=q(svg,".gs-btn-"+act+" text");if(t&&t.textContent!==label)t.textContent=label}}
function tabSel(svg,i){svg.querySelectorAll(".dg-tab").forEach((t,j)=>{const on=j===i;t.classList.toggle("on",on);const r=t.querySelector("rect"),x=t.querySelector("text");if(r)r.style.fill=on?INK:"#fff";if(x)x.setAttribute("fill",on?"#fff":INK)})}
function tabIdx(a,cur,n){if(a==="tabnext")return(cur+1)%n;const m=/^tab:(\d+)/.exec(a);return m?+m[1]:null}
/* the one-line "try this" hint */
const hint=(x,y,t,anchor)=>'<text class="dg-hint gs-hint" x="'+x+'" y="'+y+'"'+(anchor?' text-anchor="'+anchor+'"':"")+' font-size="7.2" font-weight="700" fill="#c0561d">'+t+'</text>';
/* wrapped grey text */
function para(cls,x,y,w,h,size,col){return '<foreignObject x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'"><div xmlns="http://www.w3.org/1999/xhtml" class="'+cls+'" style="font:500 '+size+'px/1.3 Inter,system-ui,sans-serif;color:'+(col||SUB)+'"></div></foreignObject>'}
const setPara=(svg,cls,t)=>{const d=q(svg,"."+cls);if(d&&d.innerHTML!==t)d.innerHTML=t};
/* an arrow head at the end of a line */
function arrow(x1,y1,x2,y2,col,w,head){const a=Math.atan2(y2-y1,x2-x1),h=head||4.2;return '<path d="M'+f1(x1)+','+f1(y1)+'L'+f1(x2)+','+f1(y2)+'" stroke="'+col+'" stroke-width="'+(w||1.4)+'" fill="none" stroke-linecap="round"/><path d="M'+f1(x2+Math.cos(a)*h*.4)+','+f1(y2+Math.sin(a)*h*.4)+'L'+f1(x2-Math.cos(a-.45)*h)+','+f1(y2-Math.sin(a-.45)*h)+'L'+f1(x2-Math.cos(a+.45)*h)+','+f1(y2-Math.sin(a+.45)*h)+'Z" fill="'+col+'"/>'}

/* ---------- the registry: one simulation ----------
   o: title, src, h (height), tabs, frame(tab) the fixed parts, draw(svg,s,full), state(tab,arg), tick(svg,s,dt),
   drag(svg,s,name,x,y), act(svg,s,a), onTab(svg,s), cat (earth, climate, plates, water, people, econ, maps) */
const SIMS=[];
function make(key,o){const nT=o.tabs?o.tabs.length:1,t0=a=>clamp(parseInt(a,10)||0,0,nT-1);
 const draw=(svg,s,full)=>{try{o.draw(svg,s,full)}catch(e){console.error(key,e)}};
 const later=(svg,s)=>{if(s._raf)return;s._raf=requestAnimationFrame(()=>{s._raf=0;if(svg.isConnected)draw(svg,s,false)})};
 DG[key]={title:o.title,src:o.src,cat:o.cat,gfs:1,
  svg:a=>'<svg viewBox="0 '+(o.y0||0)+' 300 '+(o.h-(o.y0||0))+'">'+(o.defs?'<defs>'+o.defs(t0(a))+'</defs>':"")+(o.tabs?dgTabs(o.tabs,t0(a),4,8):"")+o.frame(t0(a),a)+'</svg>',
  _d:(svg,s)=>draw(svg,s,false),
  init:(svg,a)=>{svg._s=Object.assign({tab:t0(a)},o.state?o.state(t0(a),a):{});draw(svg,svg._s,true);if(o.tick)simLoop(svg,dt=>o.tick(svg,svg._s,dt))},
  drag:(svg,n,x,y)=>{const s=svg._s;if(s&&o.drag){if(o.drag(svg,s,n,x,y)===false)return;later(svg,s)}},
  act:(svg,a)=>{const s=svg._s;if(!s)return false;if(o.tabs){const i=tabIdx(a,s.tab,nT);if(i!=null){s.tab=i;if(o.onTab)o.onTab(svg,s);if(o.tabFrames)rebuild(svg,key);else{tabSel(svg,i);draw(svg,s,true)}return true}}
   if(o.act&&o.act(svg,s,a)){draw(svg,s,true);return true}return false}};
 if(o.move)DG[key].move=(svg,x,y)=>{const s=svg._s;if(s&&o.move(svg,s,x,y)!==false)later(svg,s)};
 if(o.leave)DG[key].leave=svg=>{const s=svg._s;if(s&&o.leave(svg,s)!==false)later(svg,s)};
 SIMS.push(key);try{if(typeof SIM_KEYS!=="undefined"&&!SIM_KEYS.includes(key))SIM_KEYS.push(key);if(typeof DG_ORDER!=="undefined"&&!DG_ORDER.includes(key))DG_ORDER.push(key)}catch(e){}
 return DG[key]}

/* ---------- geography: land, plates, plate motion ---------- */
let LANDF=null;
function landFeatures(){if(LANDF)return LANDF;let F=[];try{F=(typeof projFeatures==="function"?projFeatures():[]).filter(f=>{if(!f||!f.geometry)return false;try{return d3.geoArea(f)<2*Math.PI}catch(e){return false}})}catch(e){}if(F.length)LANDF=F;return F}
/* the land as one path for a projection; cached by a name */
const LANDC={};
function landPath(name,proj,filter){if(LANDC[name])return LANDC[name];const F=landFeatures();if(!F.length)return"";const pa=d3.geoPath(proj);let d="";
 F.forEach(f=>{if(filter&&!filter(f))return;try{const s=pa(f);if(s)d+=s}catch(e){}});d=d.replace(/(\.\d)\d+/g,"$1");LANDC[name]=d;return d}
/* polygons of the land inside a lon/lat box, as lists of [lon,lat] rings */
function landPolys(x0,y0,x1,y1){const out=[];landFeatures().forEach(f=>{const g=f.geometry,P=g.type==="Polygon"?[g.coordinates]:g.type==="MultiPolygon"?g.coordinates:[];
 P.forEach(poly=>{const r=poly[0];let a=1e9,b=1e9,c=-1e9,d=-1e9;r.forEach(p=>{a=Math.min(a,p[0]);b=Math.min(b,p[1]);c=Math.max(c,p[0]);d=Math.max(d,p[1])});if(a>=x0&&c<=x1&&b>=y0&&d<=y1)out.push({ring:r,box:[a,b,c,d],id:f.id})})});return out}
/* the land with thinner outlines (a point kept when tol degrees from the last), for drawings redrawn every frame:
   [{rings, c:[lon,lat] middle of the outer ring}] */
const THIN={};
function landThin(tol){if(THIN[tol])return THIN[tol];const F=landFeatures();if(!F.length)return null;const out=[];
 F.forEach(f=>{const g=f.geometry,P=g.type==="Polygon"?[g.coordinates]:g.type==="MultiPolygon"?g.coordinates:[];
  P.forEach(poly=>{const r0=poly[0];if(!r0||r0.length<4)return;let sx=0,sy=0;r0.forEach(p=>{sx+=p[0];sy+=p[1]});
   const thin=r=>{const o=[r[0]];for(let i=1;i<r.length;i++){const a=o[o.length-1],b=r[i];if(Math.abs(b[0]-a[0])+Math.abs(b[1]-a[1])>tol||i===r.length-1)o.push(b)}return o};
   let rings=poly.map(thin).filter(r=>r.length>=4);if(!rings.length)return;try{if(d3.geoArea({type:"Polygon",coordinates:rings})>2*Math.PI)rings=rings.map(r=>r.slice().reverse())}catch(e){}
   out.push({rings,c:[sx/r0.length,sy/r0.length],id:f.id})})});THIN[tol]=out;return out}
/* plate boundaries (Bird 2002, as on the Maps page) in lon/lat, from the Maps page's Robinson drawing */
let PLATES=null;
const ROB0=()=>d3.geoRobinson().scale(318.31).translate([1e3,500.5]);
function plateLines(){if(PLATES)return PLATES;let segs=null;try{segs=typeof ALLMAPS_PLATE_SEGS!=="undefined"?ALLMAPS_PLATE_SEGS:null}catch(e){}
 if(!segs){const A=window.__APP;if(A&&A.plates){PLATES=A.plates.map(([n,rings])=>({n,rings}));return PLATES}return[]}
 const P=ROB0();PLATES=segs.map(([n,d])=>{const rings=[];String(d).replace(/([ML])\s*([-\d.]+)[ ,]([-\d.]+)/g,(m,c,x,y)=>{const ll=P.invert([+x,+y]);if(!ll||!isFinite(ll[0]))return m;if(c==="M"||!rings.length)rings.push([]);rings[rings.length-1].push([ll[0],ll[1]]);return m});return{n,rings}});return PLATES}
/* NNR-MORVEL56 Euler poles: [lat, lon, degrees per million years] (Argus, Gordon and DeMets 2011) */
const POLES={PA:[-63.58,114.7,.651],NA:[-4.85,-80.64,.209],SA:[-22.62,-112.83,.109],NZ:[46.23,-101.06,.696],CO:[26.93,-124.31,1.198],CA:[35.2,-92.62,.286],JF:[-38.31,60.04,.951],EU:[48.85,-106.5,.223],AF:[47.68,-68.44,.292],SO:[49.95,-84.52,.339],AR:[48.88,-8.49,.559],IN:[50.37,-3.29,.544],AU:[33.86,37.94,.632],PS:[-46.02,-31.36,.91],AN:[65.42,-118.11,.25]};
const PNAME={PA:"Pacific",NA:"North American",SA:"South American",NZ:"Nazca",CO:"Cocos",CA:"Caribbean",JF:"Juan de Fuca",EU:"Eurasian",AF:"African",SO:"Somali",AR:"Arabian",IN:"Indian",AU:"Australian",PS:"Philippine Sea",AN:"Antarctic"};
/* small plates move roughly with a big neighbour */
const PMAP={AT:"EU",AS:"EU",SU:"EU",YA:"EU",AM:"EU",ON:"EU",BU:"EU",MS:"EU",OK:"NA",TI:"AU",BS:"AU",BH:"AU",MO:"AU",WL:"AU",SS:"AU",KE:"AU",TO:"AU",NI:"AU",NH:"AU",CR:"AU",BR:"AU",FT:"PA",SB:"PA",NB:"PA",MN:"PA",CL:"PA",MA:"PS",EA:"NZ",JZ:"NZ",GP:"NZ",RI:"CO",PM:"CA",ND:"SA",AP:"SA",SC:"SA",SL:"AN",SW:"SA"};
const xyz=(lon,lat)=>[Math.cos(lat*R)*Math.cos(lon*R),Math.cos(lat*R)*Math.sin(lon*R),Math.sin(lat*R)];
/* velocity of a plate at a place, mm a year east and north */
function plateVel(code,lon,lat){const p=POLES[code]||POLES[PMAP[code]];if(!p)return null;const w=xyz(p[1],p[0]).map(c=>c*p[2]*R),r=xyz(lon,lat);
 const v=[w[1]*r[2]-w[2]*r[1],w[2]*r[0]-w[0]*r[2],w[0]*r[1]-w[1]*r[0]].map(c=>c*6371);
 const e=[-Math.sin(lon*R),Math.cos(lon*R),0],n=[-Math.sin(lat*R)*Math.cos(lon*R),-Math.sin(lat*R)*Math.sin(lon*R),Math.cos(lat*R)];
 const d=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];return[d(v,e),d(v,n)]}
/* carry a place along with its plate for t million years (a rotation about the plate's Euler pole) */
function plateCarry(code,lon,lat,t){const p=POLES[code]||POLES[PMAP[code]];if(!p)return[lon,lat];const k=xyz(p[1],p[0]),v=xyz(lon,lat),a=p[2]*t*R,c=Math.cos(a),s=Math.sin(a),kd=k[0]*v[0]+k[1]*v[1]+k[2]*v[2];
 const kx=[k[1]*v[2]-k[2]*v[1],k[2]*v[0]-k[0]*v[2],k[0]*v[1]-k[1]*v[0]];const o=[0,1,2].map(i=>v[i]*c+kx[i]*s+k[i]*kd*(1-c));return[Math.atan2(o[1],o[0])/R,Math.asin(clamp(o[2],-1,1))/R]}
/* each little piece of every boundary, classified by how the two plates move there:
   D spreading apart, C coming together (subduction or collision), T sliding past */
let PBC=null;
function plateBoundaryPieces(){if(PBC)return PBC;const out=[];const RIFT={"AF-SO":1,"SO-AF":1};
 plateLines().forEach(({n,rings})=>{const m=/^([A-Z]{2})([-\\\/])([A-Z]{2})$/.exec(n);if(!m)return;const a=m[1],sep=m[2],b=m[3];
  rings.forEach(r=>{let Sn=0,St=0,sp=0,Lt=0;const segs=[];
   for(let i=1;i<r.length;i++){const p0=r[i-1],p1=r[i];if(Math.abs(p1[0]-p0[0])>90)continue;const lon=(p0[0]+p1[0])/2,lat=(p0[1]+p1[1])/2;segs.push([p0,p1]);
    let tx=(p1[0]-p0[0])*Math.cos(lat*R),ty=p1[1]-p0[1];const L=Math.hypot(tx,ty);if(!L)continue;tx/=L;ty/=L;const nx=-ty,ny=tx;
    const va=plateVel(a,lon,lat),vb=plateVel(b,lon,lat);if(!va||!vb)continue;const rel=[va[0]-vb[0],va[1]-vb[1]];sp+=Math.hypot(rel[0],rel[1])*L;Lt+=L;
    Sn+=(rel[0]*nx+rel[1]*ny)*L;St+=Math.abs(rel[0]*tx+rel[1]*ty)*L}
   /* the whole piece: mostly opening, mostly closing, or mostly sliding (ridges include their short transform steps) */
   const k=RIFT[n]?"D":sep!=="-"?"C":!Lt||sp/Lt<4?"T":Math.abs(Sn)<.5*St?"T":Sn>0?"D":"C";
   segs.forEach(p=>out.push({k,a,b,sp:Lt?sp/Lt:0,p}))})});PBC=out;return out}
/* ---------- textures: small tiles drawn once on a canvas ---------- */
const TILES={};
function tile(name,w,h,fn){if(TILES[name])return TILES[name];try{const c=document.createElement("canvas");c.width=w;c.height=h;const x=c.getContext("2d");fn(x,w,h);TILES[name]=c.toDataURL()}catch(e){TILES[name]=""}return TILES[name]}
/* speckled rock, mottled mantle, sand, water ripples, fields */
function speckle(name,base,dots,n,size){return tile(name,64,64,(x,w,h)=>{x.fillStyle=base;x.fillRect(0,0,w,h);for(let i=0;i<n;i++){x.fillStyle=dots[i%dots.length];const r=size*(.4+rnd(i*3.1)*.8);x.globalAlpha=.25+rnd(i*7.3)*.5;x.beginPath();x.arc(rnd(i*1.7)*w,rnd(i*2.9)*h,r,0,7);x.fill()}x.globalAlpha=1})}
function pattern(id,img,w,h,extra){return '<pattern id="'+id+'" patternUnits="userSpaceOnUse" width="'+w+'" height="'+h+'"'+(extra||"")+'><image href="'+img+'" width="'+w+'" height="'+h+'" preserveAspectRatio="none"/></pattern>'}
/* the standard rock textures as pattern defs, ids starting with the given prefix */
function rockDefs(p){
 const crust=speckle("crust","#8a6a4f",["#6b4f3a","#a98a6a","#4f3a2a"],380,1.3),ocrust=speckle("ocrust","#4a4a52",["#2f3036","#6a6a74","#3b3d46"],420,1.1),
  lith=speckle("lith","#7d5a46",["#664634","#8f6c55","#5a3f2f"],300,1.6),mant=speckle("mant","#c4572b",["#a8401f","#d9733a","#b14b25"],260,2.4),sand=speckle("sand","#e7d3a1",["#cdb47c","#f3e4bd","#bfa36a"],500,.9);
 return pattern(p+"Crust",crust,24,24)+pattern(p+"OCrust",ocrust,20,20)+pattern(p+"Lith",lith,28,28)+pattern(p+"Mant",mant,40,40)+pattern(p+"Sand",sand,18,18)+
  '<linearGradient id="'+p+"Sea"+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5aa5dc"/><stop offset="1" stop-color="#1d4f86"/></linearGradient>'+
  '<linearGradient id="'+p+"Sky"+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe6f7"/><stop offset="1" stop-color="#eef6fb"/></linearGradient>'+
  '<linearGradient id="'+p+"Hot"+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e58a3a"/><stop offset="1" stop-color="#a5321c"/></linearGradient>'+
  '<radialGradient id="'+p+"Glow"+'"><stop offset="0" stop-color="#ffd27a" stop-opacity=".95"/><stop offset=".45" stop-color="#ff7a2a" stop-opacity=".7"/><stop offset="1" stop-color="#ff5a1f" stop-opacity="0"/></radialGradient>'}

window.GFSIM={INK,ACC,SUB,WAT,PAN,HOT,T,clamp,lerp,f1,f2,sstep,q,txt,esc,tip,fmt,show,ln,rnd,uid,url,setHTML,simLoop,slider,setSlider,btn,btnOn,tabSel,tabIdx,hint,para,setPara,arrow,make,SIMS,
 landFeatures,landPath,landPolys,landThin,plateLines,plateVel,plateCarry,plateBoundaryPieces,POLES,PNAME,PMAP,tile,speckle,pattern,rockDefs};

/* ================================================================ 1. Hawaii on a conveyor belt */
(function(){
/* the main islands: name, centre, age of the oldest dated lava (million years), highest point (m) */
const ISL=[["Hawaiʻi",-155.5,19.6,.43,4207,"Mauna Kea"],["Maui",-156.33,20.8,1.3,3055,"Haleakalā"],["Kahoʻolawe",-156.6,20.55,1,452,""],["Lānaʻi",-156.93,20.83,1.3,1026,""],
 ["Molokaʻi",-157.02,21.13,1.9,1512,""],["Oʻahu",-157.98,21.47,3.7,1220,""],["Kauaʻi",-159.53,22.07,5.1,1598,""],["Niʻihau",-160.15,21.9,4.9,381,""]];
const HS=[-155.27,18.92];/* the plume, under Kīlauea and the young seamount Kamaʻehuakanaloa (Lōʻihi) */
/* the whole chain: name, lon, lat, age in million years (rounded K–Ar and Ar–Ar dates) */
const CHAIN=[["Kīlauea",-155.29,19.41,0],["Kauaʻi",-159.5,22.05,5.1],["Nihoa",-161.92,23.06,7.2],["Necker",-164.7,23.58,10.3],["French Frigate Shoals",-166.2,23.75,12],["Laysan",-171.73,25.77,19.9],["Pearl and Hermes",-175.83,27.83,20.6],["Midway",-177.37,28.2,27.7],
 ["Daikakuji (the bend)",172.3,32.1,47],["Koko",171.6,35.25,49],["Ojin",170.5,38,55],["Nintoku",170.6,41.3,56],["Suiko",170.3,44.6,61],["Detroit",167.8,51.5,76],["Meiji",164.5,53,82]];
/* map tab 0: a Mercator turned so the chain runs left to right */
let P0=null,P1=null,ISLD=null;
function proj0(){if(P0)return P0;P0=d3.geoMercator().rotate([157.6,-20.6,38]).fitExtent([[16,34],[256,112]],{type:"MultiPoint",coordinates:[[-160.4,21.9],[-154.7,18.9],[-160.2,22.6],[-155,19.0]]});return P0}
function proj1(){if(P1)return P1;P1=d3.geoMercator().rotate([170,0]).fitExtent([[12,30],[288,206]],{type:"MultiPoint",coordinates:[[158,55.5],[-152,17.5]]});return P1}
/* each island's coastline, projected once and split by island */
function islands(){if(ISLD)return ISLD;const P=proj0(),polys=landPolys(-161,18.5,-154.5,22.5);if(!polys.length)return null;const by={};
 polys.forEach(o=>{const c=[(o.box[0]+o.box[2])/2,(o.box[1]+o.box[3])/2];let best=0,bd=1e9;ISL.forEach((I,i)=>{const d=Math.hypot(I[1]-c[0],I[2]-c[1]);if(d<bd){bd=d;best=i}});(by[best]=by[best]||[]).push(o.ring)});
 ISLD=ISL.map((I,i)=>{const rings=(by[i]||[]).map(r=>r.map(p=>P(p)));const c=P([I[1],I[2]]);let x0=1e9,x1=-1e9;rings.forEach(r=>r.forEach(p=>{x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0])}));
  if(!rings.length){x0=c[0]-4;x1=c[0]+4}return{I,rings,c,hw:Math.max(2.5,(x1-x0)/2)}});return ISLD}
const H0=262,SEA=150,FLOOR=168,LITH=182,BOT=210;
function frame0(){const P=proj0(),hs=P(HS);
 let h='<rect x="6" y="25" width="288" height="97" rx="8" fill="url(#dgHwOcean)"/><rect x="6" y="25" width="288" height="97" rx="8" fill="url(#dgHwNoise)" opacity=".35"/>'+
  /* the Hawaiian swell: the sea floor bulges up over the plume */
  '<clipPath id="dgHwMc"><rect x="6" y="25" width="288" height="97" rx="8"/></clipPath><ellipse clip-path="url(#dgHwMc)" cx="'+f1(hs[0]-80)+'" cy="'+f1(hs[1]-10)+'" rx="150" ry="24" fill="#6fb3e3" opacity=".2"/>'+
  '<circle cx="'+f1(hs[0])+'" cy="'+f1(hs[1])+'" r="15" fill="url(#dgHwGlow)" opacity=".85"/>'+
  '<g class="hw-isl"></g>'+T(f1(hs[0]),f1(hs[1]+16),"hotspot (stays put)",'text-anchor="middle" font-size="6.6" font-weight="800" fill="#ffd8b8"')+
  arrow(48,114,18,114,"#fff",1.4,5)+T(52,116.5,"the plate moves this way, about 7–10 cm a year",'font-size="6.4" font-weight="700" fill="#fff"');
 /* compass: north is turned because the map is turned to lay the chain flat */
 const n0=P([-155.6,20.9]),n1=P([-155.6,21.2]);const a=Math.atan2(n1[1]-n0[1],n1[0]-n0[0]);h+='<g transform="translate(280,38)">'+arrow(-Math.cos(a)*6,-Math.sin(a)*6,Math.cos(a)*7,Math.sin(a)*7,"#e9f3fb",1.2,4)+T(f1(Math.cos(a)*13),f1(Math.sin(a)*13+2.5),"N",'text-anchor="middle" font-size="6.6" font-weight="900" fill="#fff"')+'</g>';
 /* the cross-section */
 h+='<rect x="6" y="126" width="288" height="'+(SEA-126)+'" fill="url(#dgHwSky)"/><rect x="6" y="'+SEA+'" width="288" height="'+(FLOOR-SEA)+'" fill="url(#dgHwSea)"/>'+
  '<rect x="6" y="'+FLOOR+'" width="288" height="'+(LITH-FLOOR)+'" fill="url(#dgHwLith)"/><rect x="6" y="'+FLOOR+'" width="288" height="2.2" fill="url(#dgHwOCrust)"/><rect x="6" y="'+LITH+'" width="288" height="'+(BOT-LITH)+'" fill="url(#dgHwMant)"/>'+
  '<path d="M'+f1(hs[0]-9)+','+BOT+' C'+f1(hs[0]-7)+','+(LITH+10)+' '+f1(hs[0]-4)+','+(LITH+2)+' '+f1(hs[0]-3)+','+FLOOR+' L'+f1(hs[0]+3)+','+FLOOR+' C'+f1(hs[0]+4)+','+(LITH+2)+' '+f1(hs[0]+7)+','+(LITH+10)+' '+f1(hs[0]+9)+','+BOT+'Z" fill="url(#dgHwHot)" opacity=".95"/>'+
  '<ellipse cx="'+f1(hs[0])+'" cy="'+(LITH+4)+'" rx="16" ry="6" fill="url(#dgHwGlow)"/>'+
  '<clipPath id="dgHwXc"><rect x="6" y="126" width="288" height="'+(BOT-126)+'"/></clipPath><g class="hw-xs" clip-path="url(#dgHwXc)"></g>'+
  T(10,FLOOR+9,"plate (lithosphere, ~90 km)",'font-size="6" font-weight="800" fill="#f6e7da"')+T(10,BOT-4,"mantle",'font-size="6" font-weight="800" fill="#ffe3cc"')+T(f1(hs[0]+11),BOT-4,"plume",'font-size="6" font-weight="800" fill="#fff3c4"')+
  T(10,SEA-2,"sea level",'font-size="5.6" font-weight="700" fill="#2b5f8e"')+
  '<rect x="6" y="126" width="288" height="'+(BOT-126)+'" fill="none" stroke="#9fb2c4" stroke-width=".6"/>';
 return h}
function frame1(){const P=proj1();const land=landPath("hw1",P,f=>{try{const b=d3.geoBounds(f);return b[1][1]>15&&b[0][1]>-50}catch(e){return false}});let h='<rect x="6" y="25" width="288" height="185" rx="8" fill="url(#dgHwOcean)"/><rect x="6" y="25" width="288" height="185" rx="8" fill="url(#dgHwNoise)" opacity=".35"/>'+
  '<clipPath id="dgHwClip"><rect x="6" y="25" width="288" height="185" rx="8"/></clipPath><g clip-path="url(#dgHwClip)"><path d="'+land+'" fill="#c9c09a" stroke="#8e8462" stroke-width=".5"/>';
 const g=d3.geoPath(P)(d3.geoGraticule().step([10,10])());h+='<path d="'+(g||"").replace(/(\.\d)\d+/g,"$1")+'" fill="none" stroke="#fff" stroke-opacity=".14" stroke-width=".5"/></g>';
 const hs=P([-155.29,19.41]);h+='<circle cx="'+f1(hs[0])+'" cy="'+f1(hs[1])+'" r="16" fill="url(#dgHwGlow)"/><g class="hw-ch"></g>'+
  T(f1(hs[0]-14),f1(hs[1]+12),"hotspot",'text-anchor="end" font-size="6.6" font-weight="800" fill="#ffd8b8"');
 const k=P([157.5,54]);h+=T(f1(k[0]+2),f1(k[1]),"Kamchatka",'font-size="6.2" font-weight="700" fill="#e9eedc"');const al=P([-176,50.6]);h+=T(f1(al[0]),f1(al[1]),"Aleutian Islands",'font-size="6.2" font-weight="700" fill="#e9eedc" text-anchor="middle"');
 return h}
const HDEFS=()=>rockDefs("dgHw")+'<radialGradient id="dgHwOcean" cx=".7" cy=".6" r=".9"><stop offset="0" stop-color="#2f78b8"/><stop offset="1" stop-color="#173f6e"/></radialGradient>'+
 pattern("dgHwNoise",speckle("hwn","#1f5a92",["#2e6fa8","#184b7c","#3b80b8"],600,1.2),32,32)+
 '<linearGradient id="dgHwIsl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5f8a4c"/><stop offset="1" stop-color="#8d7a52"/></linearGradient>'+
 '<linearGradient id="dgHwNew" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7d9455"/><stop offset=".6" stop-color="#6d6450"/><stop offset="1" stop-color="#4a3c33"/></linearGradient>';
/* a volcano's height (m above sea) when it is tau million years old, scaled so that today it matches the real summit */
const prof=tau=>tau<0?0:tau<.45?Math.pow(tau/.45,.7):Math.exp(-(tau-.45)/3.1);
function draw0(svg,s){const D=islands(),P=proj0(),hs=P(HS),t=s.t;let m="",x="";
 if(!D){setHTML(svg,".hw-isl",T(150,75,"loading the map…",'text-anchor="middle" fill="#fff"'));return}
 const now=[];
 D.forEach(d=>{const[n,lon,lat,age,top]=d.I;if(t>=age+.05)return;const f=clamp(t/age,0,1),dx=(hs[0]-d.c[0])*f,dy=(hs[1]-d.c[1])*f,tau=age-t;
  const grow=clamp(tau/.35,0,1);if(tau>=0&&tau<.9)now.push([tau,n]);
  const sc=.35+.65*grow,tr='translate('+f1(d.c[0]+dx)+','+f1(d.c[1]+dy)+') scale('+f2(sc)+') translate('+f1(-d.c[0])+','+f1(-d.c[1])+')';
  const path=d.rings.map(r=>ln(r)+"Z").join("");const young=tau<.6;
  m+='<g transform="'+tr+'"'+tip(n+": oldest lava about "+age+" million years; highest point "+fmt(top)+" m today")+'><path d="'+path+'" fill="none" stroke="#9fd8f0" stroke-width="3.4" stroke-linejoin="round" opacity=".5"/><path d="'+path+'" fill="url(#'+uid(svg,young?"dgHwNew":"dgHwIsl")+')" stroke="#e8f4e0" stroke-width=".5"/></g>';
  if(young&&tau>=0){const v=P([-155.29+(-155.29-d.I[1])*0,19.41]);const k=[d.c[0]+dx+(v[0]-d.c[0])*sc,d.c[1]+dy+(v[1]-d.c[1])*sc];m+='<circle cx="'+f1(k[0])+'" cy="'+f1(k[1])+'" r="3.2" fill="url(#'+uid(svg,"dgHwGlow")+')"/><circle cx="'+f1(k[0])+'" cy="'+f1(k[1])+'" r="1.1" fill="#ffdf9a"/>'}
  const lx=d.c[0]+dx,ly=d.c[1]+dy-d.hw*sc*.55-4;if(n!=="Kahoʻolawe"&&n!=="Lānaʻi")m+=T(f1(lx),f1(ly-1),n,'text-anchor="middle" font-size="6.6" font-weight="800" fill="#fff"')+(n==="Kahoʻolawe"||n==="Lānaʻi"?"":T(f1(lx),f1(ly+6),age+" Ma",'text-anchor="middle" font-size="5.6" font-weight="700" fill="#cfe8ff"'));
  /* the cross-section: a shield volcano that rises from the sea floor, then sinks and wears down */
  const X=d.c[0]+dx,hgt=top*prof(tau)/prof(age),H=hgt>0?hgt/280:-(1-prof(tau)/1)*2,base=d.hw*sc*1.9+10;
  const yT=SEA-hgt/280;let pts=[];for(let i=-20;i<=20;i++){const u=i/20,z=1-Math.pow(Math.abs(u),1.35);pts.push([X+u*base,FLOOR-(FLOOR-yT)*z])}
  x+='<path d="'+ln(pts)+'Z" fill="url(#'+uid(svg,"dgHwOCrust")+')" stroke="#2c2622" stroke-width=".4"/>';
  if(hgt>0){/* the part above the sea: black new lava on a young volcano, green on an old one */const cut=pts.filter(p=>p[1]<=SEA);if(cut.length>1)x+='<path d="'+ln(cut)+'Z" fill="'+(young?"#4a4038":"#6f8f4e")+'" stroke="none"/>'+(young?'':'<path d="'+ln(cut)+'" fill="none" stroke="#9cbf6e" stroke-width=".6"/>')}
  if(young&&tau>=0)x+='<path d="M'+f1(X)+','+f1(Math.max(yT,126))+' L'+f1(X)+','+FLOOR+'" stroke="#ff7a2a" stroke-width="1.4" opacity=".9"/>'});
 /* the next island, still under the sea */
 if(t<.15){const l=P([-155.27,18.92]);m+='<circle cx="'+f1(l[0])+'" cy="'+f1(l[1])+'" r="2" fill="#ff8a3a" stroke="#fff" stroke-width=".5"'+tip("Kamaʻehuakanaloa (Lōʻihi): a new volcano growing on the sea floor, its top still about 975 m below the waves")+'/>';
  x+='<path d="M'+f1(hs[0]-12)+','+FLOOR+' Q'+f1(hs[0])+','+(FLOOR-7)+' '+f1(hs[0]+12)+','+FLOOR+'Z" fill="url(#'+uid(svg,"dgHwNew")+')"/>'}
 /* water over the drowned parts */
 x+='<rect x="6" y="'+SEA+'" width="288" height="'+(FLOOR-SEA)+'" fill="#3d8fd1" opacity=".28" pointer-events="none"/><line x1="6" x2="294" y1="'+SEA+'" y2="'+SEA+'" stroke="#bfe0f6" stroke-width=".8"/>';
 setHTML(svg,".hw-isl",m);setHTML(svg,".hw-xs",x);
 now.sort((a,b)=>a[0]-b[0]);const lbl=t<.05?"Today: the Big Island sits over the hotspot; Kauaʻi has drifted about 500 km":(t.toFixed(1)+" million years ago: "+(now.length?now[0][1]+" is growing over the hotspot":"a new volcano is building under the sea"));
 txt(svg,".hw-now",lbl);setSlider(svg,"t",14,240,206,t/6,t<.05?"now":t.toFixed(1)+" Ma ago")}
function draw1(svg,s){const P=proj1(),t=s.T;let h="";
 /* where a point of age a sits today: along the chain by age */
 const at=a=>{if(a<=0)return[CHAIN[0][1],CHAIN[0][2]];for(let i=1;i<CHAIN.length;i++){const A=CHAIN[i-1],B=CHAIN[i];if(a<=B[3]){const f=(a-A[3])/(B[3]-A[3]);let l0=A[1],l1=B[1];if(Math.abs(l1-l0)>180)l1+=l1<l0?360:-360;return[l0+(l1-l0)*f,A[2]+(B[2]-A[2])*f]}}const L=CHAIN[CHAIN.length-1];return[L[1],L[2]]};
 const track=[];for(let a=0;a<=82;a+=1)track.push(P(at(a)));
 h+='<path d="'+ln(track)+'" fill="none" stroke="#9fd8f0" stroke-width="5" opacity=".18" stroke-linecap="round"/>';
 const col=a=>d3.interpolateYlOrBr?d3.interpolateYlOrBr(.25+.7*a/85):"#e8a24a";
 /* the chain as it was t million years ago */
 const pts=[];for(let a=t;a<=82;a+=.5)pts.push(P(at(a-t)));if(pts.length>1)h+='<path d="'+ln(pts)+'" fill="none" stroke="#f3d9a6" stroke-width="1.6" stroke-dasharray="1.5 2"/>';
 CHAIN.forEach(([n,lon,lat,a],i)=>{if(a<t)return;const p=P(at(a-t)),big=i===0||i===1||i===8||i===14||i===7;
  h+='<circle cx="'+f1(p[0])+'" cy="'+f1(p[1])+'" r="'+(big?3.2:2.4)+'" fill="'+col(a)+'" stroke="#fff" stroke-width=".6"'+tip(n+": "+(a?"about "+a+" million years old":"erupting today"))+'/>';
  if(big||t>0&&Math.abs(a-t)<3)h+=T(f1(p[0]+(i>7?5:-4)),f1(p[1]+(i>7?2.5:-5)),n+(a?" · "+a+" Ma":""),'font-size="6.2" font-weight="800" fill="#fff"'+(i>7?"":' text-anchor="end"'))});
 setHTML(svg,".hw-ch",h);
 const lbl=t<.5?"Today: 80 million years of volcanoes, with a bend at 47 Ma":t<47?Math.round(t)+" million years ago: the plate has slid "+fmt(t*80)+" km back towards the hotspot":Math.round(t)+" million years ago: before the bend the plate moved north, not north-west";
 txt(svg,".hw-now",lbl);setSlider(svg,"t",14,240,206,t/82,t<.5?"now":Math.round(t)+" Ma ago")}
make("hawaii",{title:"Hawaii on a conveyor belt",cat:"plates",h:H0,tabs:["The islands","The whole chain"],
 src:"Coastlines: the map’s own Natural Earth shapes. Ages of the oldest lava: Clague and Dalrymple (1987, USGS); Emperor seamounts: Sharp and Clague (2006), Duncan and Keller (2004), rounded. Plate speed about 7–10 cm a year (USGS; NNR-MORVEL56). Cross-section heights exaggerated.",
 defs:HDEFS,
 frame:tab=>(tab===0?frame0():frame1())+'<text class="hw-now" x="12" y="'+(tab===0?220:220)+'" font-size="7.4" font-weight="800" fill="'+INK+'"></text>'+slider("t",14,240,206,"Go back in time")+btn("play",232,232,62,"▶ Play")+hint(12,258,tab===0?"Drag back in time: each island slides back to the hotspot where it was born":"Drag back: the whole chain slides back into the hotspot, bend and all"),
 state:()=>({t:0,T:0,play:0}),
 tabFrames:1,
 draw:(svg,s)=>{if(s.tab===0)draw0(svg,s);else draw1(svg,s);btnOn(svg,"play",!!s.play,s.play?"❚❚ Pause":"▶ Play")},
 drag:(svg,s,n,x)=>{s.play=0;const f=clamp((x-14)/206,0,1);if(s.tab===0)s.t=f*6;else s.T=f*82},
 act:(svg,s,a)=>{if(a==="play"){if(!s.play){if(s.tab===0&&s.t<.05)s.t=6;if(s.tab===1&&s.T<.5)s.T=82}s.play=!s.play;return true}},
 tick:(svg,s,dt)=>{if(!s.play)return;if(s.tab===0){s.t=Math.max(0,s.t-dt*.55);if(s.t<=0)s.play=0}else{s.T=Math.max(0,s.T-dt*7);if(s.T<=0)s.play=0}DG.hawaii._d(svg,s)}});
})();

/* ================================================================ 2. How fast the plates move */
(function(){
/* which plate a piece of land rides on (by its middle; good enough at this scale) */
function plateAt(lon,lat){if(lat<-60)return"AN";
 if(lon>=-20&&lon<=52&&lat>=-36&&lat<=37){if(lon>36&&lat<12&&lat>-27)return"SO";if(lon>=36&&lat>=12)return"AR";return"AF"}
 if(lon>34&&lon<=60&&lat>=12&&lat<34)return"AR";
 if(lon>=60&&lon<92&&lat>=5&&lat<35)return"IN";
 if(lon>=131&&lon<=180&&lat<-1&&lat>-50)return"AU";if(lon>=110&&lon<131&&lat<-9&&lat>-45)return"AU";
 if((lon>160||lon<-150)&&lat>-30&&lat<30)return"PA";
 if(lon>=-92&&lon<=-60&&lat>=7&&lat<=19)return"CA";
 if(lon>=-82&&lon<=-34&&lat<13)return"SA";
 if(lon>=-170&&lon<-30)return"NA";if(lon>=-30&&lon<-10&&lat>60)return"NA";
 return"EU"}
let PIECES=null;
function pieces(){if(PIECES)return PIECES;const L=landThin(.5);if(!L)return null;PIECES=L.map(o=>({k:plateAt(o.c[0],o.c[1]),rings:o.rings}));return PIECES}
/* rotation matrices for every plate after t million years */
function mats(t){const M={};Object.keys(POLES).forEach(k=>{const p=POLES[k],kv=xyz(p[1],p[0]),a=p[2]*t*R,c=Math.cos(a),s=Math.sin(a),C=1-c,[x,y,z]=kv;
 M[k]=[[c+x*x*C,x*y*C-z*s,x*z*C+y*s],[y*x*C+z*s,c+y*y*C,y*z*C-x*s],[z*x*C-y*s,z*y*C+x*s,c+z*z*C]]});return M}
function rot(M,lon,lat){const v=xyz(lon,lat),o=[M[0][0]*v[0]+M[0][1]*v[1]+M[0][2]*v[2],M[1][0]*v[0]+M[1][1]*v[1]+M[1][2]*v[2],M[2][0]*v[0]+M[2][1]*v[1]+M[2][2]*v[2]];return[Math.atan2(o[1],o[0])/R,Math.asin(clamp(o[2],-1,1))/R]}
const SITES=[["PA",-140,5],["PA",-165,-30],["PA",168,22],["NA",-100,45],["NA",-50,35],["SA",-58,-15],["NZ",-92,-20],["CO",-95,8],
 ["EU",30,52],["EU",105,52],["AF",15,0],["SO",50,-15],["AR",45,23],["IN",80,12],["AU",133,-25],["PS",134,18],["AN",30,-76]];
const CITIES=[["London","EU",-.13,51.5],["New York","NA",-74,40.7],["Reykjavík","NA",-21.9,64.1],["Lima","SA",-77,-12],["Lagos","AF",3.4,6.5],["Mombasa","SO",39.7,-4],["Mumbai","IN",72.9,19.1],["Sydney","AU",151.2,-33.9],["Honolulu","PA",-157.9,21.3],["Riyadh","AR",46.7,24.7]];
const KCOL={D:"#21b3a0",C:"#e0452b",T:"#f2c230"};
let PR=null;const proj=()=>PR||(PR=d3.geoRobinson().fitExtent([[8,8],[292,150]],{type:"Sphere"}));
const dirName=(e,n)=>{const a=(Math.atan2(e,n)/R+360)%360;return["north","north-east","east","south-east","south","south-west","west","north-west"][Math.round(a/45)%8]};
make("plates",{title:"How fast the plates move",cat:"plates",h:226,
 src:"Plate boundaries: Bird (2002), as drawn on the Maps page; motion: NNR-MORVEL56 Euler poles (Argus, Gordon and DeMets 2011), classified by how the two plates move. Land carried forward with today’s motions, which will not stay the same for 50 million years.",
 defs:()=>'<radialGradient id="dgPlOc" cx=".5" cy=".45" r=".7"><stop offset="0" stop-color="#3f86c4"/><stop offset="1" stop-color="#1d4f86"/></radialGradient>'+pattern("dgPlN",speckle("pln","#2a69a6",["#3778b3","#235c94","#4686bf"],500,1.1),30,30)+
  '<linearGradient id="dgPlL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8cfa4"/><stop offset=".5" stop-color="#a9bf86"/><stop offset="1" stop-color="#cdbf94"/></linearGradient>',
 frame:()=>{const P=proj(),sph=d3.geoPath(P)({type:"Sphere"}),g=(d3.geoPath(P)(d3.geoGraticule().step([30,30])())||"").replace(/(\.\d)\d+/g,"$1");
  return '<path d="'+sph+'" fill="url(#dgPlOc)"/><path d="'+sph+'" fill="url(#dgPlN)" opacity=".3"/><path d="'+g+'" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width=".5"/><g class="pl-land"></g><g class="pl-b"></g><g class="pl-a"></g><g class="pl-c"></g>'+
   '<g transform="translate(10,160)"><path d="M0,0h12" stroke="'+KCOL.D+'" stroke-width="2.2"/>'+T(15,2.5,"pulling apart",'font-size="6.4" font-weight="700" fill="'+INK+'"')+'<path d="M64,0h12" stroke="'+KCOL.C+'" stroke-width="2.2"/>'+T(79,2.5,"coming together",'font-size="6.4" font-weight="700" fill="'+INK+'"')+'<path d="M140,0h12" stroke="'+KCOL.T+'" stroke-width="2.2"/>'+T(155,2.5,"sliding past",'font-size="6.4" font-weight="700" fill="'+INK+'"')+
   arrow(206,0,222,0,"#fff",1.6,4.5).replace(/#fff/g,"#41546a")+T(225,2.5,"5 cm a year",'font-size="6.4" font-weight="700" fill="'+INK+'"')+'</g>'+
   '<text class="pl-now" x="10" y="178" font-size="7.4" font-weight="800" fill="'+INK+'"></text>'+slider("t",14,200,200,"Fast-forward the plates")+btn("play",230,192,62,"▶ Play")+hint(10,220,"Drag to fast-forward: each city rides its plate. Hover an arrow for its speed.")},
 state:()=>({t:0,play:0}),
 draw:(svg,s,full)=>{const P=proj(),pa=d3.geoPath(P),t=s.t,M=mats(t);
  const L=pieces();if(L){let d="";L.forEach(o=>{const m=M[o.k]||M[PMAP[o.k]]||null;const rings=t>0&&m?o.rings.map(r=>r.map(p=>rot(m,p[0],p[1]))):o.rings;const s2=pa({type:"Polygon",coordinates:rings});if(s2)d+=s2});
   setHTML(svg,".pl-land",'<path d="'+d.replace(/(\.\d)\d+/g,"$1")+'" fill="url(#'+uid(svg,"dgPlL")+')" stroke="#7d8a5e" stroke-width=".35"/>')}else setHTML(svg,".pl-land",T(150,80,"loading the map…",'text-anchor="middle" fill="#fff"'));
  if(full||s._bt!==(t>0)){s._bt=t>0;let b="";const by={D:"",C:"",T:""};plateBoundaryPieces().forEach(o=>{const a=P(o.p[0]),c=P(o.p[1]);if(!a||!c||Math.abs(a[0]-c[0])>60)return;by[o.k]+="M"+f1(a[0])+","+f1(a[1])+"L"+f1(c[0])+","+f1(c[1])});
   Object.keys(by).forEach(k=>{b+='<path d="'+by[k]+'" fill="none" stroke="'+KCOL[k]+'" stroke-width="1.25" stroke-linecap="round" opacity="'+(t>0?.25:.95)+'"/>'});setHTML(svg,".pl-b",b)}
  /* arrows: speed and direction where each plate is */
  let a="";if(t<.01)SITES.forEach(([k,lon,lat])=>{const v=plateVel(k,lon,lat);if(!v)return;const p=P([lon,lat]),sp=Math.hypot(v[0],v[1])/10,len=sp*3.2,ang=Math.atan2(-v[1],v[0]);
   const x2=p[0]+Math.cos(ang)*len,y2=p[1]+Math.sin(ang)*len;a+='<g'+tip(PNAME[k]+" plate here: "+(Math.round(sp*10)/10)+" cm a year towards the "+dirName(v[0],v[1])+" · "+(Math.round(sp*.8*10)/10)+" m in an 80-year life, "+fmt(sp*10)+" km in a million years")+'><circle cx="'+f1(p[0])+'" cy="'+f1(p[1])+'" r="7" fill="transparent"/><circle cx="'+f1(p[0])+'" cy="'+f1(p[1])+'" r="1.2" fill="#fff"/>'+arrow(p[0],p[1],x2,y2,"#fff",1.5,4)+'</g>'});
  setHTML(svg,".pl-a",a);
  /* cities ride along */
  let c="";const pos={};CITIES.forEach(([n,k,lon,lat],i)=>{const m=M[k];const q0=P([lon,lat]),ll=t>0?rot(m,lon,lat):[lon,lat],q1=P(ll);pos[n]=ll;if(!q1)return;
   if(t>0)c+='<path d="M'+f1(q0[0])+','+f1(q0[1])+'L'+f1(q1[0])+','+f1(q1[1])+'" stroke="#fff" stroke-width=".8" stroke-dasharray="1.5 1.5" opacity=".8"/>';
   c+='<circle cx="'+f1(q1[0])+'" cy="'+f1(q1[1])+'" r="2.1" fill="'+ACC+'" stroke="#fff" stroke-width=".7"'+tip(n+" rides the "+PNAME[k]+" plate")+'/>'+(t>0||i%2===0?T(f1(q1[0]+3),f1(q1[1]-2.5),n,'font-size="5.8" font-weight="800" fill="#fff" stroke="#1d3047" stroke-width="1.6" paint-order="stroke"'):"")});
  setHTML(svg,".pl-c",c);
  const dist=(a,b)=>{const x=xyz(a[0],a[1]),y=xyz(b[0],b[1]);return Math.acos(clamp(x[0]*y[0]+x[1]*y[1]+x[2]*y[2],-1,1))*6371};
  let lbl;if(t<.01)lbl="Today: the fastest plates move about 7–10 cm a year, as fast as fingernails grow";
  else{const atl=dist(pos["New York"],pos["London"])-dist([-74,40.7],[-.13,51.5]),syd=dist(pos["Sydney"],[151.2,-33.9]);lbl="In "+Math.round(t)+" million years: the Atlantic "+(atl>=0?"widens":"narrows")+" by "+fmt(Math.abs(atl))+" km; Sydney moves "+fmt(syd)+" km north"}
  txt(svg,".pl-now",lbl);setSlider(svg,"t",14,200,200,t/50,t<.01?"today":"+"+Math.round(t)+" million years");btnOn(svg,"play",!!s.play,s.play?"❚❚ Pause":"▶ Play")},
 drag:(svg,s,n,x)=>{s.play=0;s.t=clamp((x-14)/200,0,1)*50},
 act:(svg,s,a)=>{if(a==="play"){if(!s.play&&s.t>=49.9)s.t=0;s.play=!s.play;return true}},
 tick:(svg,s,dt)=>{if(!s.play)return;s.t=Math.min(50,s.t+dt*6);if(s.t>=50)s.play=0;DG.plates._d(svg,s)}});
})();

/* ================================================================ 3. How plates meet: four cases */
(function(){
/* the last 4 million years of magnetic reversals (normal = true), Cande and Kent (1995), rounded: Brunhes, Jaramillo, Olduvai, Gauss, Kaena, Mammoth */
const REV=[[0,.78,1],[.78,.99,0],[.99,1.07,1],[1.07,1.78,0],[1.78,1.95,1],[1.95,2.58,0],[2.58,3.04,1],[3.04,3.11,0],[3.11,3.22,1],[3.22,3.33,0],[3.33,3.58,1],[3.58,9,0]];
const pol=a=>{for(const r of REV)if(a>=r[0]&&a<r[1])return r[2];return 0};
const CASES=[
 {nm:"Pull apart",k:"D",at:[-18,64],T:4,unit:"million years",ex:"DIVERGENT · Mid-Atlantic Ridge · Iceland · E. African Rift",
  p:"Hot mantle rises under the ridge, melts and fills the crack, making new ocean floor. Each new strip keeps the magnetic direction of its time, so the stripes match on both sides. The Atlantic widens about 2.5 cm a year."},
 {nm:"Sink under",k:"C",at:[-75,-15],T:4,unit:"million years",ex:"SUBDUCTION · Andes · Japan · Cascades",
  p:"Heavy ocean floor dives under the lighter continent at a trench. At about 100 km down, water squeezed out of the slab melts the mantle above it, feeding a line of volcanoes. The Nazca plate goes under South America about 7 cm a year."},
 {nm:"Crash together",k:"C",at:[85,29],T:4,unit:"million years",ex:"COLLISION · Himalayas · Alps · Zagros",
  p:"Two continents are too light to sink, so the crust crumples, stacks and thickens to about 70 km, pushing up mountains. India still pushes into Asia about 4 cm a year; sea shells lie in limestone near the top of Everest."},
 {nm:"Slide past",k:"T",at:[-121,36],T:600,unit:"years",ex:"TRANSFORM · San Andreas · Alpine Fault · North Anatolian",
  p:"The plates grind sideways. The fault locks, strain builds for a century or two, then it slips several metres at once in an earthquake. Across the San Andreas the Pacific plate moves about 3.5 cm a year past North America."}];
let PI=null;const pin=()=>PI||(PI=d3.geoRobinson().fitExtent([[226,157],[292,191]],{type:"Sphere"}));
function inset(k,at){const P=pin(),pa=d3.geoPath(P);let h='<path d="'+pa({type:"Sphere"})+'" fill="#d7e8f5" stroke="#9fb2c4" stroke-width=".5"/><path d="'+landPath("pbin",P)+'" fill="#c9c09a"/>';
 let d="";plateBoundaryPieces().forEach(o=>{if(o.k!==k)return;const a=P(o.p[0]),c=P(o.p[1]);if(a&&c&&Math.abs(a[0]-c[0])<20)d+="M"+f1(a[0])+","+f1(a[1])+"L"+f1(c[0])+","+f1(c[1])});
 const pm=P(at);return h+'<path d="'+d+'" fill="none" stroke="'+(k==="D"?"#16a08e":k==="C"?"#d63a22":"#d9a400")+'" stroke-width=".9"/><circle cx="'+f1(pm[0])+'" cy="'+f1(pm[1])+'" r="2.6" fill="none" stroke="'+ACC+'" stroke-width="1.2"/>'+T(259,198,"where it happens",'text-anchor="middle" font-size="5.6" font-weight="700" fill="'+SUB+'"')}
const X0=6,X1=294,Y0=26,Y1=150,SL=56;
const box='<clipPath id="dgPbClip"><rect x="'+X0+'" y="'+Y0+'" width="'+(X1-X0)+'" height="'+(Y1-Y0)+'" rx="7"/></clipPath>';
/* a wavy layer boundary */
const wav=(x0,x1,y,a,f,ph)=>{const pts=[];for(let x=x0;x<=x1;x+=3)pts.push([x,y+a*Math.sin(x*f+ph)]);return pts};
function draw(svg,s){const C=CASES[s.tab],t=s.t[s.tab],u=t/C.T,U=k=>url(svg,"dgPb"+k);let h="";
 h+='<rect x="'+X0+'" y="'+Y0+'" width="'+(X1-X0)+'" height="'+(Y1-Y0)+'" fill="'+U("Sky")+'"/>';
 if(s.tab===0){/* ---- mid-ocean ridge ---- */
  const cx=150,v=36;/* px per million years, each side (drawn wider than real) */
  const floor=x=>SL+18+2.4*Math.sqrt(Math.abs(x-cx));
  const top=[];for(let x=X0;x<=X1;x+=2)top.push([x,floor(x)]);
  h+='<path d="M'+X0+','+SL+'H'+X1+'V'+Y1+'H'+X0+'Z" fill="'+U("Sea")+'"/>';
  /* lithosphere thickens with age away from the ridge */
  const lb=x=>floor(x)+8+Math.min(36,3.4*Math.sqrt(Math.abs(x-cx)*2));
  const lpts=[];for(let x=X0;x<=X1;x+=2)lpts.push([x,lb(x)]);
  h+='<path d="M'+X0+','+Y1+'L'+ln(lpts).slice(1)+'L'+X1+','+Y1+'Z" fill="'+U("Mant")+'"/>';
  h+='<path d="'+ln(top)+'L'+ln(lpts.slice().reverse()).slice(1)+'Z" fill="'+U("Lith")+'"/>';
  /* the crust with magnetic stripes: crust at distance d formed d/v million years ago; older than the run, it is the grey crust from before */
  let st="";for(let x=X0;x<X1;x+=2){const a=Math.abs(x+1-cx)/v;const yb=floor(x+1);let col;if(a>t)col="#8d9099";else col=pol(C.T-t+a)?"#1f3d7a":"#ead9a6";st+='<rect x="'+x+'" y="'+f1(yb-1)+'" width="2.3" height="7.5" fill="'+col+'"/>'}
  h+=st+'<path d="'+ln(top)+'" fill="none" stroke="#1d2a3a" stroke-width=".6"/>';
  /* magma under the ridge, mantle rising */
  h+='<ellipse cx="'+cx+'" cy="'+f1(floor(cx)+12)+'" rx="12" ry="6" fill="'+U("Glow")+'"/><path d="M'+(cx-3)+','+f1(floor(cx)+10)+' Q'+cx+','+f1(floor(cx)+2)+' '+(cx+3)+','+f1(floor(cx)+10)+'" fill="#ffb24a"/>';
  for(let i=0;i<3;i++){const ph=(t*.9+i/3)%1,y=Y1-6-ph*30;h+=arrow(cx-22+i*22,y+8,cx-22+i*22+(i-1)*-4,y,"#ffe0b0",1,3)}
  h+=arrow(cx-30,SL+10,cx-70,SL+10,"#fff",1.6,5)+arrow(cx+30,SL+10,cx+70,SL+10,"#fff",1.6,5)+T(cx,SL+6,"mid-ocean ridge",'text-anchor="middle" font-size="6.6" font-weight="800" fill="#fff"');
  h+=T(12,Y1-26,"plate gets thicker and sinks as it cools",'font-size="5.8" font-weight="700" fill="#f6e7da"')+T(12,Y1-5,"hot mantle (asthenosphere)",'font-size="6" font-weight="800" fill="#fff0de"');
  h+='<g transform="translate(12,'+(Y1-40)+')"><rect width="7" height="5" fill="#1f3d7a" stroke="#fff" stroke-width=".4"/>'+T(10,4.6,"normal",'font-size="5.6" fill="#fff"')+'<rect x="34" width="7" height="5" fill="#ead9a6"/>'+T(44,4.6,"reversed magnetism",'font-size="5.6" fill="#fff"')+'</g>';
  txt(svg,".pb-big",t<.01?"Start the clock":"+"+fmt(t*25)+" km of new ocean floor");
 }else if(s.tab===1){/* ---- ocean dives under continent ---- */
  const tx=128,dip=.62,mv=u*34;/* trench x, slab slope, how far the ocean plate has moved */
  const slab=(off)=>{const pts=[];for(let x=X0;x<=X1;x+=3){const y=x<tx?SL+30+(x-X0)*.03:SL+31+(x-tx)*dip+Math.pow(Math.max(0,x-tx),1.2)*.02;pts.push([x,y+off])}return pts};
  const top=slab(0),cb=slab(5),lbot=slab(22);
  h+='<rect x="'+X0+'" y="'+(SL+20)+'" width="'+(X1-X0)+'" height="'+(Y1-SL-20)+'" fill="'+U("Mant")+'"/>';
  h+='<path d="M'+X0+','+SL+'H'+(tx+20)+'L'+ln(top.filter(p=>p[0]<=tx+20).reverse()).slice(1)+'Z" fill="'+U("Sea")+'"/>';
  h+='<path d="'+ln(cb)+'L'+ln(lbot.slice().reverse()).slice(1)+'Z" fill="'+U("Lith")+'"/>';
  h+='<path d="'+ln(top)+'L'+ln(cb.slice().reverse()).slice(1)+'Z" fill="'+U("OCrust")+'"/>';
  /* marks on the ocean plate show it moving in and down */
  for(let i=0;i<9;i++){const x=X0+((i*30+mv*2.2)%270);const yy=x<tx?SL+30+(x-X0)*.03:SL+31+(x-tx)*dip+Math.pow(Math.max(0,x-tx),1.2)*.02;h+='<rect x="'+f1(x)+'" y="'+f1(yy+.5)+'" width="2" height="4" fill="#c9b48a" transform="rotate('+(x<tx?0:Math.atan(dip)/R)+' '+f1(x)+' '+f1(yy)+')"/>'}
  /* the continent: thick, light, layered */
  const cont=[[tx+4,SL-1],[tx+30,SL-6],[tx+56,SL-14],[tx+64,SL-24-u*4],[tx+70,SL-14],[tx+96,SL-9],[X1,SL-8],[X1,SL+42],[tx+120,SL+46],[tx+70,SL+44],[tx+40,SL+36],[tx+16,SL+30],[tx+6,SL+20]];
  h+='<path d="'+ln(cont)+'Z" fill="'+U("Crust")+'" stroke="#5a4030" stroke-width=".5"/>';
  h+='<path d="M'+(tx+30)+','+(SL-6)+' L'+(tx+56)+','+(SL-14)+' L'+(tx+64)+','+f1(SL-24-u*4)+' L'+(tx+70)+','+(SL-14)+' L'+(tx+96)+','+(SL-9)+'" fill="none" stroke="#6f8f4e" stroke-width="2"/>';
  /* melting above the slab, magma rising to the volcano */
  h+='<ellipse cx="'+(tx+70)+'" cy="'+(SL+64)+'" rx="14" ry="7" fill="'+U("Glow")+'"/><path d="M'+(tx+68)+','+(SL+58)+' C'+(tx+62)+','+(SL+30)+' '+(tx+66)+','+(SL+6)+' '+(tx+64)+','+f1(SL-22-u*4)+'" stroke="#ff7a2a" stroke-width="1.6" fill="none"/>';
  h+='<path d="M'+(tx+60)+','+f1(SL-24-u*4)+' q4,-8 8,0" fill="#9aa0a8" opacity=".7"/>';
  /* earthquakes along the slab */
  for(let i=0;i<7;i++){const f=(i+.5)/7,x=tx+8+f*120,yy=SL+31+(x-tx)*dip+Math.pow(x-tx,1.2)*.02+3,on=((t*3+i*.37)%1)<.25;if(x<X1)h+='<circle cx="'+f1(x)+'" cy="'+f1(yy)+'" r="'+(on?2.2:1.2)+'" fill="'+(on?"#ffe14a":"#fff")+'" opacity="'+(on?1:.55)+'"/>'}
  h+=arrow(40,SL+24,80,SL+24,"#fff",1.6,5)+T(14,SL+20,"ocean plate",'font-size="6.4" font-weight="800" fill="#fff"')+T(tx-4,SL+44,"trench, 8 km deep",'text-anchor="end" font-size="6" font-weight="700" fill="#dbeaf7"');
  h+=T(tx+74,SL-20-u*4,"volcano",'font-size="6.4" font-weight="800" fill="'+INK+'"')+T(tx+100,SL+20,"continent",'font-size="6.4" font-weight="800" fill="#fff"')+T(tx+86,SL+76,"melting at ~100 km",'font-size="6" font-weight="800" fill="#fff3c4"')+T(170,Y1-5,"earthquakes along the sinking slab",'font-size="5.8" font-weight="700" fill="#fff0de"');
  txt(svg,".pb-big",t<.01?"Start the clock":fmt(t*70)+" km of ocean floor gone under");
 }else if(s.tab===2){/* ---- two continents collide ---- */
  const sq=u;/* how far the squeeze has gone */
  const mx=150,ht=8+sq*26,root=10+sq*30;
  h+='<rect x="'+X0+'" y="'+(SL+12)+'" width="'+(X1-X0)+'" height="'+(Y1-SL-12)+'" fill="'+U("Mant")+'"/>';
  /* crust: flat on both sides, thick and folded in the middle */
  const surf=x=>SL+12-ht*Math.exp(-Math.pow((x-mx)/(30+sq*10),2))*(1+.08*Math.sin(x*.4)),base=x=>SL+44+root*Math.exp(-Math.pow((x-mx)/(34+sq*10),2));
  const tp=[],bt=[];for(let x=X0;x<=X1;x+=2){tp.push([x,surf(x)]);bt.push([x,base(x)])}
  h+='<path d="'+ln(tp)+'L'+ln(bt.slice().reverse()).slice(1)+'Z" fill="'+U("Crust")+'"/>';
  /* folded rock layers from the old sea floor between them */
  for(let L=0;L<5;L++){const pts=[];for(let x=X0;x<=X1;x+=2){const yb=surf(x)+3+L*4.2,w=Math.exp(-Math.pow((x-mx)/(40+sq*10),2));pts.push([x,yb+w*sq*6*Math.sin((x-mx)*.22+L*.6)])}h+='<path d="'+ln(pts)+'" fill="none" stroke="'+(L%2?"#e6d7ae":"#7a5a40")+'" stroke-width="1.6" opacity=".75"/>'}
  /* snow on the peaks */
  if(sq>.45){const sn=tp.filter(p=>p[1]<SL+12-ht*.72);if(sn.length>2)h+='<path d="'+ln(sn)+'" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>'}
  h+=arrow(30,SL+30,62,SL+30,"#fff",1.8,5)+arrow(270,SL+30,238,SL+30,"#fff",1.8,5)+T(14,SL+44,"India",'font-size="6.8" font-weight="800" fill="#fff"')+T(286,SL+44,"Asia",'text-anchor="end" font-size="6.8" font-weight="800" fill="#fff"');
  h+=T(mx+34,f1(SL+8-ht*.5),sq>.1?"Himalayas":"",'font-size="6.6" font-weight="800" fill="'+INK+'"')+T(mx,f1(SL+50+root),"crust up to 70 km thick",'text-anchor="middle" font-size="6" font-weight="800" fill="#fff0de"');
  txt(svg,".pb-big",t<.01?"Start the clock":"India has pushed "+fmt(t*40)+" km into Asia");
 }else{/* ---- sliding past: a block seen from above, with a road across the fault ---- */
  const yrs=t,rate=.035,slip=x=>{/* locked, then sudden slips of about 5 m every 150 years */const n=Math.floor(x/150);return n*150*rate};const off=slip(yrs),strain=(yrs%150)/150;
  const fy=88,sc=4.2;/* fault line y, px per metre of offset */
  h+='<rect x="'+X0+'" y="'+Y0+'" width="'+(X1-X0)+'" height="'+(fy-Y0)+'" fill="'+U("Grass")+'"/><rect x="'+X0+'" y="'+fy+'" width="'+(X1-X0)+'" height="'+(Y1-fy)+'" fill="'+U("Dry")+'"/>';
  /* the road and a fence: straight before, offset across the fault after quakes, bending as strain builds */
  const bend=strain*1.6*sc;const road=(dx,col,w)=>'<path d="M'+f1(90+dx)+','+Y0+' L'+f1(90+dx)+','+(fy-14)+' Q'+f1(90+dx)+','+f1(fy-2)+' '+f1(90+dx+bend*.5)+','+fy+'" stroke="'+col+'" stroke-width="'+w+'" fill="none"/>'+
   '<path d="M'+f1(90-off*sc+bend*.5)+','+fy+' Q'+f1(90-off*sc)+','+(fy+2)+' '+f1(90-off*sc)+','+(fy+14)+' L'+f1(90-off*sc)+','+Y1+'" stroke="'+col+'" stroke-width="'+w+'" fill="none"/>';
  h+=road(0,"#6b6b6b",7)+road(0,"#f2e6a0",.7);
  /* a stream offset the same way */
  const st=(dx)=>'<path d="M'+(200+dx)+','+Y0+' C'+(196+dx)+','+(Y0+30)+' '+(206+dx)+','+(fy-20)+' '+(200+dx)+','+fy+'" stroke="#4a9bd6" stroke-width="2.4" fill="none"/>';
  h+=st(0)+'<path d="M'+f1(200-off*sc)+','+fy+' C'+f1(196-off*sc)+','+(fy+20)+' '+f1(206-off*sc)+','+(Y1-20)+' '+f1(200-off*sc)+','+Y1+'" stroke="#4a9bd6" stroke-width="2.4" fill="none"/>';
  h+='<path d="M'+X0+','+fy+'H'+X1+'" stroke="#5a3a2a" stroke-width="1.4" stroke-dasharray="5 2"/>';
  h+=arrow(250,fy-10,280,fy-10,"#1d3047",1.6,5)+arrow(60,fy+14,30,fy+14,"#1d3047",1.6,5)+T(246,fy-7,"Pacific plate",'text-anchor="end" font-size="6.4" font-weight="800" fill="'+INK+'"')+T(14,fy+26,"North American plate",'font-size="6.4" font-weight="800" fill="'+INK+'"');
  if(strain<.05&&yrs>=150){h+='<path d="M150,'+fy+' l4,-10 l2,8 l6,-6 l-2,8 l10,0 l-8,4 l6,6 l-10,-2 l-2,8 l-4,-8 l-8,4 l4,-8 l-8,-4 l10,0Z" fill="#ffd23a" stroke="#c0561d" stroke-width=".8"/>'}
  h+=T(286,Y1-5,"seen from above",'text-anchor="end" font-size="6" font-weight="700" fill="#6a5530"');
  txt(svg,".pb-big",yrs<1?"Start the clock":Math.floor(yrs/150)+" earthquake"+(Math.floor(yrs/150)===1?"":"s")+" · road offset "+(Math.round(off*10)/10)+" m");
 }
 setHTML(svg,".pb-sec",'<g clip-path="url(#'+uid(svg,"dgPbClip")+')">'+h+'</g><rect x="'+X0+'" y="'+Y0+'" width="'+(X1-X0)+'" height="'+(Y1-Y0)+'" rx="7" fill="none" stroke="#9fb2c4" stroke-width=".6"/>');
 if(s._in!==s.tab){s._in=s.tab;setHTML(svg,".pb-in",inset(C.k,C.at))}
 txt(svg,".pb-ex",C.ex);setPara(svg,"pb-p",C.p);
 setSlider(svg,"t",14,212,206,t/C.T,s.tab===3?Math.round(t)+" years":(Math.round(t*10)/10)+" million years");btnOn(svg,"play",!!s.play,s.play?"❚❚ Pause":"▶ Play")}
make("platebound",{title:"How plates meet: four cases",cat:"plates",h:236,tabs:CASES.map(c=>c.nm),
 src:"Cross-sections after USGS ‘This Dynamic Earth’; rates from NNR-MORVEL56 and USGS (San Andreas about 3.5 cm a year, slipping in large earthquakes); magnetic reversals: Cande and Kent (1995). Boundaries on the little map: Bird (2002). Not to scale.",
 defs:()=>rockDefs("dgPb")+box+pattern("dgPbGrass",speckle("grass","#9fbf6a",["#86a955","#b3cf80","#7a9a4a"],500,1.4),26,26)+pattern("dgPbDry",speckle("dry","#d8c48c",["#c4ad72","#e6d6a6","#b89c62"],500,1.3),26,26),
 frame:()=>'<g class="pb-sec"></g><g class="pb-in"></g><text class="pb-big" x="12" y="'+(Y0+14)+'" font-size="9" font-weight="900" fill="'+INK+'" stroke="#fff" stroke-width="2.4" paint-order="stroke"></text>'+
  '<text class="pb-ex" x="8" y="160" font-size="6.4" font-weight="800" fill="'+ACC+'"></text>'+para("pb-p",8,163,214,40,6.4)+slider("t",14,212,206,"Run the clock")+btn("play",232,204,62,"▶ Play")+hint(8,231,"Pick a case, then drag the clock or press Play"),
 state:()=>({t:[0,0,0,0],play:0}),
 draw:(svg,s)=>draw(svg,s),
 onTab:(svg,s)=>{s.play=0},
 drag:(svg,s,n,x)=>{s.play=0;s.t[s.tab]=clamp((x-14)/206,0,1)*CASES[s.tab].T},
 act:(svg,s,a)=>{if(a==="play"){const C=CASES[s.tab];if(!s.play&&s.t[s.tab]>=C.T*.99)s.t[s.tab]=0;s.play=!s.play;return true}},
 tick:(svg,s,dt)=>{if(!s.play)return;const C=CASES[s.tab];s.t[s.tab]=Math.min(C.T,s.t[s.tab]+dt*C.T/9);if(s.t[s.tab]>=C.T)s.play=0;DG.platebound._d(svg,s)}});
})();

/* ================================================================ 4. How a river makes an oxbow lake */
(function(){
const PX0=6,PX1=294,PY0=26,PY1=150,W=8.5,L=112;/* channel width; wavelength about 13 widths (Leopold and Wolman 1960) */
/* fields on the flood plain, drawn once */
function fields(){return tile("mfields",600,248,(x,w,h)=>{x.fillStyle="#9fbf74";x.fillRect(0,0,w,h);
 for(let i=0;i<110;i++){const fx=rnd(i*3.3)*w,fy=rnd(i*5.1)*h,fw=40+rnd(i*1.9)*60,fh=26+rnd(i*2.7)*40;x.save();x.translate(fx,fy);x.rotate((rnd(i*7.7)-.5)*.5);
  x.fillStyle=["#a9c47e","#9dbb72","#b3c886","#bcc88c","#98b86e","#c4c690"][i%6];x.fillRect(-fw/2,-fh/2,fw,fh);x.strokeStyle="rgba(70,95,45,.45)";x.lineWidth=2;x.strokeRect(-fw/2,-fh/2,fw,fh);
  x.strokeStyle="rgba(255,255,255,.12)";x.lineWidth=1;for(let k=-fw/2;k<fw/2;k+=5){x.beginPath();x.moveTo(k,-fh/2);x.lineTo(k,fh/2);x.stroke()}x.restore()}
 for(let i=0;i<120;i++){x.fillStyle="rgba(60,95,45,"+(.3+rnd(i*9.1)*.35)+")";x.beginPath();x.arc(rnd(i*4.4)*w,rnd(i*6.6)*h,1.5+rnd(i*8.8)*2.5,0,7);x.fill()}})}
/* a sine-generated river (Langbein and Leopold 1966): the direction swings as w*sin(2*pi*s/L); the middle bend has the biggest w */
function centre(om){const N=520,S=640,ds=S/N,pts=[];let x=0,y=0,sm=S/2;
 for(let i=0;i<=N;i++){const s=i*ds,bump=Math.exp(-Math.pow((s-sm)/(L*.62),2)),w=.55+(om-.55)*bump,th=w*Math.sin(2*Math.PI*(s-sm)/L+Math.PI/2*0);pts.push([x,y,th]);x+=Math.cos(th)*ds;y+=Math.sin(th)*ds}
 /* centre the middle bend in the panel */const m=pts[N/2];return pts.map(p=>[p[0]-m[0]+150,p[1]-m[1]+88,p[2]])}
/* where the river first touches itself: the neck */
function neck(P){let best=null;for(let i=0;i<P.length;i+=2)for(let j=i+60;j<P.length;j+=2){const d=Math.hypot(P[i][0]-P[j][0],P[i][1]-P[j][1]);if(d<W*1.05&&(!best||j-i<best[1]-best[0]))best=[i,j]}return best}
let TC=null;/* the time of the cutoff, found once */
const omAt=t=>.7+1.75*Math.min(t,TC==null?t:TC)/.75;
function cutoffTime(){if(TC!=null)return TC;for(let t=.3;t<=1;t+=.005){if(neck(centre(.7+1.75*t/.75))){TC=t;return TC}}TC=.75;return TC}
const off=(P,i,d)=>{const a=P[Math.max(0,i-1)],b=P[Math.min(P.length-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1;return[P[i][0]-dy/l*d,P[i][1]+dx/l*d]};
make("meander",{title:"How a river makes an oxbow lake",cat:"water",h:226,y0:20,
 src:"Shape: a sine-generated curve (Langbein and Leopold 1966); wavelength about 11–14 times the channel width (Leopold and Wolman 1960). Big lowland rivers can move their bends metres to tens of metres a year; a loop takes decades to centuries to cut off.",
 defs:()=>pattern("dgMeF",fields(),288,124,' x="6" y="26"')+'<clipPath id="dgMeClip"><rect x="6" y="26" width="288" height="124" rx="7"/></clipPath>'+
  '<linearGradient id="dgMeW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a9ad8"/><stop offset="1" stop-color="#2f78b8"/></linearGradient>',
 frame:()=>'<rect x="6" y="26" width="288" height="124" rx="7" fill="url(#dgMeF)"/><g class="me-p" clip-path="url(#dgMeClip)"></g><g class="me-fx" clip-path="url(#dgMeClip)"></g><rect x="6" y="26" width="288" height="124" rx="7" fill="none" stroke="#9fb2c4" stroke-width=".6"/>'+
  '<g class="me-x"></g><text class="me-st" x="8" y="162" font-size="8.4" font-weight="900" fill="'+INK+'"></text>'+para("me-tx",8,165,212,30,6.5)+slider("t",14,206,206,"Time")+btn("play",232,198,62,"▶ Play")+hint(8,222,"Drag time: the bends grow until the river breaks through the neck"),
 state:()=>({t:.25,play:0,ph:0}),
 draw:(svg,s)=>{const tc=cutoffTime(),t=s.t,cut=t>=tc,P=centre(omAt(t));let h="",chan=P,ox=null;
  if(cut){const nk=neck(P)||[0,0];chan=P.slice(0,nk[0]+1).concat(P.slice(nk[1]));ox=P.slice(nk[0]+3,nk[1]-2)}
  /* older scars on the flood plain */
  h+='<path d="M20,52 q30,-22 60,0 t60,0" fill="none" stroke="#7d9a5a" stroke-width="7" opacity=".35"/><path d="M200,132 q24,16 48,0" fill="none" stroke="#7d9a5a" stroke-width="7" opacity=".3"/>';
  /* sand on the inside of each bend (point bars) and raw earth on the outside (cut banks) */
  let bars="",banks="",run=[];const flush=()=>{if(run.length>1)banks+='<path d="'+ln(run)+'" fill="none" stroke="#7a4a2a" stroke-width="1.8" stroke-linecap="round" opacity=".85"/>';run=[]};for(let i=4;i<chan.length-4;i+=3){const a=chan[i-3],b=chan[i],c=chan[i+3];const k=((b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0]))/36;if(Math.abs(k)<.025){flush();continue}const inner=k>0?1:-1,r=Math.min(6.5,Math.abs(k)*55);if(run.length&&run.sgn!==inner)flush();run.sgn=inner;
   const pIn=off(chan,i,inner*(W/2+r*.6)),pOut=off(chan,i,-inner*(W/2+.6));bars+='<circle cx="'+f1(pIn[0])+'" cy="'+f1(pIn[1])+'" r="'+f1(r)+'" fill="#e3cf98"/>';run.push(pOut)}flush();
  h+=bars+banks;
  if(ox){const f=clamp((t-tc)/.4,0,1);h+='<path d="'+ln(ox)+'" fill="none" stroke="'+(f<.7?"#3f8fcf":"#6f9a5a")+'" stroke-width="'+f1(W*(1-.35*f))+'" stroke-linecap="round" opacity="'+f1(1-.2*f)+'"/>';
   const e0=ox[0],e1=ox[ox.length-1];h+='<circle cx="'+f1(e0[0])+'" cy="'+f1(e0[1])+'" r="'+f1(W*.6)+'" fill="#e3cf98"/><circle cx="'+f1(e1[0])+'" cy="'+f1(e1[1])+'" r="'+f1(W*.6)+'" fill="#e3cf98"/>'}
  h+='<path d="'+ln(chan)+'" fill="none" stroke="#2f6aa0" stroke-width="'+(W+1.6)+'" stroke-linejoin="round"/><path d="'+ln(chan)+'" fill="none" stroke="url(#'+uid(svg,"dgMeW")+')" stroke-width="'+W+'" stroke-linejoin="round"/>';
  h+='<path class="me-flow" d="'+ln(chan)+'" fill="none" stroke="#bfe3fb" stroke-width="1.1" stroke-dasharray="3 9" stroke-linejoin="round" opacity=".9"/>';
  /* labels at the middle bend */
  const m=P[Math.floor(P.length/2)],nk=neck(P);
  if(!cut){h+=T(f1(m[0]),f1(m[1]-22),"cut bank: fast water erodes",'text-anchor="middle" font-size="6.2" font-weight="800" fill="#5a2e14" stroke="#fff" stroke-width="2" stroke-opacity=".7" paint-order="stroke"');
   const pi=off(P,Math.floor(P.length/2),18);h+=T(f1(pi[0]),f1(pi[1]+8),"point bar: slow water drops sand",'text-anchor="middle" font-size="6.2" font-weight="800" fill="#5a4a1a" stroke="#fff" stroke-width="2" stroke-opacity=".7" paint-order="stroke"');
   if(t>tc-.15){const a=P[Math.floor(P.length/2)-55]||m;h+=T(f1(a[0]),f1(a[1]+16),"the neck narrows",'text-anchor="middle" font-size="6.2" font-weight="800" fill="'+ACC+'" stroke="#fff" stroke-width="2" paint-order="stroke"')}}
  else if(ox){const c=ox[Math.floor(ox.length/2)];h+=T(f1(c[0]),f1(c[1]+(c[1]>88?14:-10)),t-tc>.22?"oxbow turning to marsh":"oxbow lake",'text-anchor="middle" font-size="6.8" font-weight="900" fill="#173f6e" stroke="#fff" stroke-width="2.2" paint-order="stroke"')}
  h+=arrow(16,40,36,40,"#fff",1.4,4)+T(40,42,"flow",'font-size="6.2" font-weight="800" fill="#fff"');
  setHTML(svg,".me-p",h);
  /* the river bed across a bend */
  const x0=220,y0=106;let xs='<rect x="'+(x0-6)+'" y="'+(y0-10)+'" width="82" height="48" rx="6" fill="#fff" opacity=".9"/>'+T(x0+35,y0-2,"across a bend",'text-anchor="middle" font-size="5.8" font-weight="800" fill="'+INK+'"');
  xs+='<path d="M'+x0+','+(y0+6)+' L'+(x0+6)+','+(y0+6)+' L'+(x0+10)+','+(y0+26)+' C'+(x0+22)+','+(y0+28)+' '+(x0+44)+','+(y0+16)+' '+(x0+64)+','+(y0+8)+' L'+(x0+70)+','+(y0+6)+' V'+(y0+34)+' H'+x0+'Z" fill="#b48a5a"/>';
  xs+='<path d="M'+(x0+6)+','+(y0+8)+' L'+(x0+10)+','+(y0+26)+' C'+(x0+22)+','+(y0+28)+' '+(x0+44)+','+(y0+16)+' '+(x0+60)+','+(y0+9)+' L'+(x0+6)+','+(y0+8)+'Z" fill="#3f8fcf" opacity=".9"/><path d="M'+(x0+40)+','+(y0+17)+' C'+(x0+50)+','+(y0+13)+' '+(x0+58)+','+(y0+10)+' '+(x0+64)+','+(y0+8)+'" stroke="#e3cf98" stroke-width="3"/>';
  xs+=T(x0+2,y0+40,"deep, eroding",'font-size="5.2" font-weight="700" fill="#5a2e14"')+T(x0+72,y0+40,"shallow, sand",'text-anchor="end" font-size="5.2" font-weight="700" fill="#5a4a1a"');
  setHTML(svg,".me-x",cut?"":xs);
  const yrs=Math.round(t*240);
  txt(svg,".me-st",!cut?(t<.35?"A gentle bend":"The bends grow"):t-tc<.12?"Cut-off! The river takes the short cut":"An oxbow lake, slowly filling in");
  setPara(svg,"me-tx",!cut?"Water runs fastest round the outside of each bend, wearing the bank away, and slowest on the inside, where it drops sand. So the bends swing wider and wider.":"In a flood the river breaks through the narrow neck. Sand seals the ends of the old loop, leaving a curved lake that fills with mud and plants.");
  setSlider(svg,"t",14,206,206,t,"about "+yrs+" years");btnOn(svg,"play",!!s.play,s.play?"❚❚ Pause":"▶ Play")},
 drag:(svg,s,n,x)=>{s.play=0;s.t=clamp((x-14)/206,0,1)},
 act:(svg,s,a)=>{if(a==="play"){if(!s.play&&s.t>=.99)s.t=0;s.play=!s.play;return true}},
 tick:(svg,s,dt)=>{s.ph=(s.ph+dt*14)%120;const f=q(svg,".me-flow");if(f)f.setAttribute("stroke-dashoffset",f1(-s.ph));if(!s.play)return;s.t=Math.min(1,s.t+dt*.07);if(s.t>=1)s.play=0;DG.meander._d(svg,s)}});
})();

/* ================================================================ 5. Two tides a day, spring and neap */
(function(){
const EX=88,EY=84,ER=27,MO=60,AS=.46;/* Earth centre and radius, Moon's orbit (not to scale), the Sun's pull as a share of the Moon's (NOAA) */
const PL=[-.1,51.5];/* the place we watch: London */
let PO=null;
const tideAt=(a,am)=>Math.cos(2*(a-am))+AS*Math.cos(2*(a-Math.PI));/* a: the place's angle on screen; the Sun is to the left (angle pi) */
function earthProj(lam){if(!PO)PO=d3.geoOrthographic().scale(ER).translate([EX,EY]).clipAngle(90);PO.rotate([lam,-90,0]);return PO}
const placeAngle=(lam)=>{const p=earthProj(lam)(PL);return Math.atan2(p[1]-EY,p[0]-EX)};
make("tides",{title:"Two tides a day, spring and neap",cat:"water",h:222,y0:4,
 src:"Equilibrium tide: the Sun’s tide-raising pull is about 46% of the Moon’s (NOAA). High water comes about every 12 h 25 min; spring tides are about 2.7 times the range of neap tides in this simple model. Bulges hugely exaggerated; sizes and distances not to scale.",
 defs:()=>'<radialGradient id="dgTiSun" cx="0" cy=".5" r="1"><stop offset="0" stop-color="#fff3b0"/><stop offset=".25" stop-color="#ffd25a" stop-opacity=".9"/><stop offset="1" stop-color="#ffb02a" stop-opacity="0"/></radialGradient>'+
  '<radialGradient id="dgTiSea" cx=".4" cy=".4" r=".7"><stop offset="0" stop-color="#3f86c4"/><stop offset="1" stop-color="#173f6e"/></radialGradient>'+
  '<radialGradient id="dgTiMoon" cx=".35" cy=".35" r=".7"><stop offset="0" stop-color="#f4f2ea"/><stop offset="1" stop-color="#b9b6ad"/></radialGradient>'+
  '<linearGradient id="dgTiNight" x1="0" y1="0" x2="1" y2="0"><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset=".56" stop-color="#000" stop-opacity=".45"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient>',
 frame:()=>{let st="";for(let i=0;i<46;i++)st+='<circle cx="'+f1(8+rnd(i*3.1)*162)+'" cy="'+f1(8+rnd(i*5.3)*140)+'" r="'+f2(.3+rnd(i*7.7)*.6)+'" fill="#fff" opacity="'+f2(.3+rnd(i*2.2)*.6)+'"/>';
  return '<rect x="6" y="6" width="166" height="146" rx="8" fill="#0d1630"/>'+st+'<rect x="6" y="6" width="40" height="146" rx="8" fill="url(#dgTiSun)"/>'+T(10,20,"Sun",'font-size="7.4" font-weight="900" fill="#ffe7a0"')+T(10,29,"far this way",'font-size="5.8" fill="#ffe7a0"')+
   '<circle cx="'+EX+'" cy="'+EY+'" r="'+MO+'" fill="none" stroke="#fff" stroke-opacity=".22" stroke-dasharray="2 3"/><g class="ti-bulge"></g><g class="ti-earth"></g><g class="ti-moon"></g>'+
   T(89,146,"Earth from above the North Pole",'text-anchor="middle" font-size="5.8" fill="#c9d6ea"')+
   '<g transform="translate(178,6)"><rect width="116" height="146" rx="8" fill="#fff"/>'+T(8,13,"Water level in London",'font-size="7" font-weight="800" fill="'+INK+'"')+T(8,21,"the next two days",'font-size="5.8" fill="'+SUB+'"')+'<g class="ti-ch"></g></g>'+
   '<text class="ti-big" x="10" y="166" font-size="9.4" font-weight="900" fill="'+INK+'"></text><text class="ti-sub" x="10" y="176" font-size="6.6" font-weight="700" fill="'+SUB+'"></text>'+
   slider("ph",14,198,206,"Days since new moon")+btn("play",232,190,62,"▶ Play")+hint(10,216,"Drag the Moon: tides are biggest when Sun, Moon and Earth line up")},
 state:()=>({h:6,ph:0,play:1}),
 draw:(svg,s)=>{const lam=s.h*15,am=Math.PI+s.ph/29.53*2*Math.PI;/* Moon's angle on screen, new moon towards the Sun */
  const P=earthProj(lam),pa=d3.geoPath(P),L=landThin(1.2);let e='<circle cx="'+EX+'" cy="'+EY+'" r="'+ER+'" fill="url(#'+uid(svg,"dgTiSea")+')"/>';
  if(L){let d="";L.forEach(o=>{if(o.c[1]<-5)return;const s2=pa({type:"Polygon",coordinates:o.rings});if(s2)d+=s2});e+='<path d="'+d.replace(/(\.\d)\d+/g,"$1")+'" fill="#9fbf7a" stroke="#6f8f55" stroke-width=".3"/>'}
  e+='<rect x="'+(EX-ER)+'" y="'+(EY-ER)+'" width="'+2*ER+'" height="'+2*ER+'" fill="url(#'+uid(svg,"dgTiNight")+')" clip-path="circle('+ER+'px at '+ER+'px '+ER+'px)" opacity="0"/>';
  /* night side: away from the Sun (the right) */
  e+='<path d="M'+EX+','+(EY-ER)+' A'+ER+','+ER+' 0 0 1 '+EX+','+(EY+ER)+'Z" fill="#000" opacity=".38"/>';
  const pl=P(PL);e+='<circle cx="'+f1(pl[0])+'" cy="'+f1(pl[1])+'" r="2.6" fill="'+ACC+'" stroke="#fff" stroke-width=".8"/><circle cx="'+EX+'" cy="'+EY+'" r=".9" fill="#fff"/>';
  setHTML(svg,".ti-earth",e);
  /* the water bulges: Moon's pull plus the Sun's */
  let bp=[];for(let i=0;i<=72;i++){const a=i/72*2*Math.PI,r=ER+4.5+4.2*tideAt(a,am);bp.push([EX+Math.cos(a)*r,EY+Math.sin(a)*r])}
  setHTML(svg,".ti-bulge",'<path d="'+ln(bp)+'Z" fill="#6fc0ef" opacity=".55" stroke="#9fd8f7" stroke-width=".6"/>');
  const mx=EX+Math.cos(am)*MO,my=EY+Math.sin(am)*MO;
  setHTML(svg,".ti-moon",'<g class="dg-handle" data-drag="moon" transform="translate('+f1(mx)+','+f1(my)+')"><circle r="13" fill="transparent"/><circle r="7" fill="url(#'+uid(svg,"dgTiMoon")+')"/><path d="M0,-7 A7,7 0 0 1 0,7Z" fill="#1a1d26" opacity=".7"/><circle cx="-2" cy="-2" r="1.2" fill="#a9a59a"/><circle cx="2" cy="2.5" r="1" fill="#a9a59a"/><circle cx="-3" cy="3" r=".7" fill="#a9a59a"/></g>'+T(f1(mx),f1(my+(my>EY?16:-11)),"Moon",'text-anchor="middle" font-size="6.6" font-weight="800" fill="#fff"'));
  /* the next 48 hours at the place */
  const W2=100,H2=96,x0=8,y0=30;let pts=[],hi=-9,lo=9;for(let k=0;k<=96;k++){const hh=s.h+k/2,ph=s.ph+k/2/24,lv=tideAt(placeAngle(hh*15),Math.PI+ph/29.53*2*Math.PI);hi=Math.max(hi,lv);lo=Math.min(lo,lv);pts.push([x0+k/96*W2,y0+H2/2-lv*H2/3.2])}
  let c='<rect x="'+x0+'" y="'+y0+'" width="'+W2+'" height="'+H2+'" fill="#eef5fb"/><path d="M'+x0+','+(y0+H2/2)+'h'+W2+'" stroke="#9fb2c4" stroke-width=".5" stroke-dasharray="2 2"/>';
  for(let k=0;k<=48;k+=12)c+='<path d="M'+f1(x0+k/48*W2)+','+(y0+H2)+'v3" stroke="#9fb2c4" stroke-width=".6"/>'+T(f1(x0+k/48*W2),y0+H2+10,k?"+"+k+"h":"now",'text-anchor="middle" font-size="5.6" fill="'+SUB+'"');
  c+='<path d="'+ln(pts)+'L'+(x0+W2)+','+(y0+H2)+'L'+x0+','+(y0+H2)+'Z" fill="#3d8fd1" opacity=".25"/><path d="'+ln(pts)+'" fill="none" stroke="#2f78b8" stroke-width="1.4"/><circle cx="'+x0+'" cy="'+f1(pts[0][1])+'" r="2.4" fill="'+ACC+'" stroke="#fff" stroke-width=".7"/>';
  c+=T(x0+2,y0+8,"high",'font-size="5.4" fill="'+SUB+'"')+T(x0+2,y0+H2-3,"low",'font-size="5.4" fill="'+SUB+'"');
  setHTML(svg,".ti-ch",c);
  const rng=Math.sqrt(1+AS*AS+2*AS*Math.cos(2*(am-Math.PI)))/1.46,spring=rng>.85,neap=rng<.5;
  txt(svg,".ti-big",spring?"Spring tide: the biggest range":neap?"Neap tide: the smallest range":"Between spring and neap");
  txt(svg,".ti-sub","Tidal range "+Math.round(rng*100)+"% of the biggest · "+(spring?"Sun and Moon pull in line":neap?"Sun and Moon pull at right angles":"the Moon moves on 12° a day"));
  const pd=s.ph;setSlider(svg,"ph",14,198,206,pd/29.53,pd<.8||pd>28.7?"new moon":Math.abs(pd-14.8)<.8?"full moon":Math.abs(pd-7.4)<.8?"first quarter":Math.abs(pd-22.1)<.8?"last quarter":Math.round(pd)+" days");
  btnOn(svg,"play",!!s.play,s.play?"❚❚ Pause":"▶ Play")},
 drag:(svg,s,n,x,y)=>{if(n==="moon"){let a=Math.atan2(y-EY,x-EX)-Math.PI;a=((a%(2*Math.PI))+2*Math.PI)%(2*Math.PI);s.ph=a/(2*Math.PI)*29.53}else s.ph=clamp((x-14)/206,0,1)*29.53},
 act:(svg,s,a)=>{if(a==="play"){s.play=!s.play;return true}},
 tick:(svg,s,dt)=>{if(!s.play)return;s.h+=dt*4;s.ph=(s.ph+dt*4/24)%29.53;DG.tides._d(svg,s)}});
})();

/* ================================================================ 6. Why the monsoon switches on and off */
(function(){
const MON=["January","February","March","April","May","June","July","August","September","October","November","December"];
/* Mumbai (Santacruz) mean monthly rainfall, mm, IMD normals 1971–2000, rounded */
const RAIN=[1,1,0,1,11,523,800,530,312,56,17,5];
/* the summer monsoon's strength by month: −1 the dry north-east wind of winter, +1 the wet south-west wind of summer */
const W=[-1,-.9,-.6,-.2,.25,.85,1,1,.7,-.1,-.6,-.9];
/* the rain belt (ITCZ / monsoon trough), latitude by month, rounded */
const ITCZ=[-5,-4,0,5,10,18,24,24,18,8,0,-4];
const at=(A,m)=>{const i=Math.floor(m)%12,j=(i+1)%12,u=m-Math.floor(m);return A[i]*(1-u)+A[j]*u};
let PM=null;const proj=()=>PM||(PM=d3.geoMercator().fitExtent([[6,6],[200,150]],{type:"MultiPoint",coordinates:[[55,-6],[102,36]]}));
make("monsoon",{title:"Why the monsoon switches on and off",cat:"climate",h:214,
 src:"Rain: Mumbai (Santacruz), India Meteorological Department normals 1971–2000, rounded (about 2,250 mm a year, 95% from June to September). Winds and rain belt: long-term averages, simplified.",
 defs:()=>'<linearGradient id="dgMoSea" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#1d4f86"/><stop offset="1" stop-color="#3f86c4"/></linearGradient><linearGradient id="dgMoLand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b8a27a"/><stop offset=".5" stop-color="#c9b98a"/><stop offset="1" stop-color="#9fb874"/></linearGradient>',
 frame:()=>{const P=proj(),pa=d3.geoPath(P);let h='<clipPath id="dgMoClip"><rect x="6" y="6" width="194" height="144" rx="8"/></clipPath><g clip-path="url(#dgMoClip)"><rect x="6" y="6" width="194" height="144" fill="url(#dgMoSea)"/>'+
  '<path d="'+landPath("mon",P,f=>{try{const b=d3.geoBounds(f);return b[1][1]>-12&&b[0][1]<45&&b[1][0]>45&&b[0][0]<110}catch(e){return false}})+'" fill="url(#dgMoLand)" stroke="#8e8462" stroke-width=".4"/>';
  /* the Himalayas and the Tibetan plateau */
  const hm=[[73,35],[78,33],[84,29],[88,28],[92,28],[96,29]].map(P);h+='<path d="'+ln(hm)+'" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".85"/><path d="'+ln(hm)+'" fill="none" stroke="#8a7a6a" stroke-width="1" stroke-dasharray="2 2"/>';
  const t=P([86,33.5]);h+=T(f1(t[0]),f1(t[1]),"Himalayas",'text-anchor="middle" font-size="6" font-weight="800" fill="#5a4a3a"');
  [["Arabian Sea",64,14],["Bay of Bengal",89,14],["India",79,22]].forEach(([n,lo,la])=>{const p=P([lo,la]);h+=T(f1(p[0]),f1(p[1]),n,'text-anchor="middle" font-size="6.2" font-weight="800" fill="'+(n==="India"?"#4a3a2a":"#d8ecfa")+'"')});
  const mb=P([72.9,19.1]);h+='<circle cx="'+f1(mb[0])+'" cy="'+f1(mb[1])+'" r="2.2" fill="'+ACC+'" stroke="#fff" stroke-width=".7"/>'+T(f1(mb[0]-3),f1(mb[1]+2),"Mumbai",'text-anchor="end" font-size="5.8" font-weight="800" fill="#fff" stroke="#1d3047" stroke-width="1.6" paint-order="stroke"');
  h+='<g class="mo-w"></g></g><rect x="6" y="6" width="194" height="144" rx="8" fill="none" stroke="#9fb2c4" stroke-width=".6"/>';
  h+='<g transform="translate(206,6)"><rect width="88" height="144" rx="8" fill="#fff"/>'+T(6,12,"Rain in Mumbai",'font-size="6.6" font-weight="800" fill="'+INK+'"')+T(6,20,"mm each month",'font-size="5.6" fill="'+SUB+'"')+'<g class="mo-b"></g></g>';
  h+='<text class="mo-big" x="8" y="162" font-size="8.4" font-weight="900" fill="'+INK+'"></text>'+para("mo-tx",8,165,286,26,6.3)+slider("m",14,200,206,"Month")+btn("play",232,192,62,"▶ Play")+hint(8,212,"Drag through the year: the wind turns round and the rain belt moves");
  return h},
 state:()=>({m:6,play:0,ph:0}),
 draw:(svg,s)=>{const P=proj(),m=s.m,w=at(W,m),lat=at(ITCZ,m);let h="";
  /* the rain belt */
  const y=P([80,lat])[1];h+='<path d="M6,'+f1(y)+' C60,'+f1(y-5)+' 120,'+f1(y+6)+' 200,'+f1(y-3)+'" fill="none" stroke="#fff" stroke-width="7" opacity=".18"/><path d="M6,'+f1(y)+' C60,'+f1(y-5)+' 120,'+f1(y+6)+' 200,'+f1(y-3)+'" fill="none" stroke="#fff" stroke-width="1" stroke-dasharray="4 3"/>'+T(196,f1(y-5),"rain belt (ITCZ)",'text-anchor="end" font-size="5.6" font-weight="800" fill="#fff"');
  /* clouds and rain over the land when the wet wind blows */
  if(w>.2){const k=w;[[73,19],[76,12],[88,24],[91,25],[80,22],[84,20]].forEach(([lo,la],i)=>{const p=P([lo,la]);h+='<g transform="translate('+f1(p[0])+','+f1(p[1]-6)+') scale('+f2(.6+k*.5)+')" opacity="'+f2(.4+k*.6)+'"><circle cx="-4" cy="0" r="5" fill="#f4f7fb"/><circle cx="3" cy="-2" r="6" fill="#f4f7fb"/><circle cx="9" cy="1" r="4" fill="#f4f7fb"/><path d="M-4,6 l-1.5,5 M1,6 l-1.5,6 M6,6 l-1.5,5" stroke="#4a9ad8" stroke-width="1"/></g>'})}
  /* the wind */
  const a=w>0?-Math.PI/4-.15:Math.PI*3/4+.1,sp=Math.abs(w);for(let j=0;j<5;j++)for(let i=0;i<6;i++){const lo=58+i*8+(j%2)*4,la=-2+j*7.5,p=P([lo,la]);const L=4+sp*9,ph=(s.ph*sp*.8+i*.13+j*.29)%1;
   const x0=p[0]+Math.cos(a)*L*(ph-.5)*1.2,y0=p[1]+Math.sin(a)*L*(ph-.5)*1.2;if(sp>.12)h+=arrow(x0,y0,x0+Math.cos(a)*L,y0+Math.sin(a)*L,w>0?"#e8f6ff":"#ffe7c4",1.1,3.4)}
  /* the pressure that drives it */
  const hp=P([w>0?72:92,w>0?28:32.5]);h+=T(f1(hp[0]),f1(hp[1]),w>0?"L":"H",'text-anchor="middle" font-size="14" font-weight="900" fill="'+(w>0?"#c0392b":"#1d4f86")+'" stroke="#fff" stroke-width="2" paint-order="stroke"')+T(f1(hp[0]),f1(hp[1]+8),w>0?"hot land, low pressure":"cold land, high pressure",'text-anchor="middle" font-size="5.4" font-weight="800" fill="#fff" stroke="#1d3047" stroke-width="1.6" paint-order="stroke"');
  setHTML(svg,".mo-w",h);
  let b="";const bx=6,bw=6,bh=96,by=124;RAIN.forEach((v,i)=>{const H=v/850*bh,on=i===Math.round(m)%12;b+='<rect x="'+f1(bx+i*bw*1.2)+'" y="'+f1(by-H)+'" width="'+bw+'" height="'+f1(Math.max(.6,H))+'" fill="'+(on?ACC:"#3d8fd1")+'"'+tip(MON[i]+": about "+v+" mm")+'/>'+T(f1(bx+i*bw*1.2+bw/2),by+7,MON[i][0],'text-anchor="middle" font-size="5" fill="'+SUB+'"')});
  const mi=Math.round(m)%12;b+=T(6,138,MON[mi]+": "+RAIN[mi]+" mm",'font-size="6.6" font-weight="900" fill="'+INK+'"');setHTML(svg,".mo-b",b);
  txt(svg,".mo-big",w>.2?MON[mi]+": the wet south-west monsoon":w<-.2?MON[mi]+": the dry north-east monsoon":MON[mi]+": the wind is turning round");
  setPara(svg,"mo-tx",w>.2?"The land has heated far more than the sea, so air rises over India and moist sea air pours in. It rises against the Western Ghats and the Himalayas and falls as heavy rain.":w<-.2?"The land is now colder than the sea, so air sinks over Asia and dry wind blows out to sea. Hardly any rain falls for months.":"Between the seasons the winds are light and changeable; the first storms come before the monsoon breaks in June.");
  setSlider(svg,"m",14,200,206,m/11.99,MON[mi]);btnOn(svg,"play",!!s.play,s.play?"❚❚ Pause":"▶ Play")},
 drag:(svg,s,n,x)=>{s.play=0;s.m=clamp((x-14)/206,0,1)*11.99},
 act:(svg,s,a)=>{if(a==="play"){s.play=!s.play;return true}},
 tick:(svg,s,dt)=>{s.ph+=dt;if(s.play)s.m=(s.m+dt*.9)%12;DG.monsoon._d(svg,s)}});
})();

/* ================================================================ 7. The gravity model, on a real map */
(function(){
/* US metropolitan areas, 2020 census, millions (rounded) */
const C=[["New York",-74,40.7,20.1],["Los Angeles",-118.2,34.05,13.2],["Chicago",-87.6,41.9,9.6],["Dallas",-96.8,32.8,7.6],["Houston",-95.4,29.8,7.1],["Washington",-77,38.9,6.4],["Philadelphia",-75.2,40,6.2],["Miami",-80.2,25.8,6.1],["Atlanta",-84.4,33.75,6.1],["Boston",-71.1,42.4,4.9],["Phoenix",-112.1,33.45,4.8],["San Francisco",-122.4,37.8,4.7],["Seattle",-122.3,47.6,4],["Denver",-105,39.7,2.96],["Minneapolis",-93.3,45,3.7]];
const dist=(a,b)=>{const x=Math.sin((b[2]-a[2])*R/2),y=Math.sin((b[1]-a[1])*R/2);return 2*6371*Math.asin(Math.sqrt(x*x+Math.cos(a[2]*R)*Math.cos(b[2]*R)*y*y))};
let PG=null;const proj=()=>PG||(PG=d3.geoAlbers().rotate([96,0]).center([0,38]).parallels([29.5,45.5]).fitExtent([[24,18],[276,132]],{type:"MultiPoint",coordinates:[[-124,48.5],[-67,45],[-80,24.5],[-117,32],[-97,26]]}));
make("gravity",{title:"The gravity model",cat:"people",h:204,
 src:"Interaction = population × population ÷ distance^b (after Reilly 1931 and Zipf 1946); b = 2 is the classic value. Metro populations: US Census 2020, rounded; distances along great circles. Real flows (flights, phone calls, migration) follow this pattern roughly.",
 defs:()=>'<linearGradient id="dgGvLand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e3dcc0"/><stop offset="1" stop-color="#d4cba8"/></linearGradient>',
 frame:()=>{const P=proj();return'<rect x="6" y="6" width="288" height="136" rx="8" fill="#d7e8f5"/><clipPath id="dgGvClip"><rect x="6" y="6" width="288" height="136" rx="8"/></clipPath><g clip-path="url(#dgGvClip)"><path d="'+landPath("grav",P,f=>{/* by centroid: the USA's bounds cross the date line (the Aleutians), so a bounds test dropped it */try{const c=d3.geoCentroid(f);return c[1]>8&&c[0]<-50&&c[0]>-170}catch(e){return false}})+'" fill="url(#dgGvLand)" stroke="#a89a6a" stroke-width=".4"/><g class="gv-f"></g><g class="gv-c"></g></g>'+
  '<text class="gv-big" x="8" y="154" font-size="8.4" font-weight="900" fill="'+INK+'"></text>'+para("gv-tx",8,157,286,20,6.3)+btn("b1",8,180,88,"distance")+btn("b2",100,180,88,"distance²")+btn("b3",192,180,100,"distance³")+hint(8,202,"Tap a city to see its pull on the others; change how fast distance weakens it")},
 state:()=>({o:2,b:2}),
 draw:(svg,s)=>{const P=proj(),O=C[s.o];let f="",c="";const I=C.map((B,i)=>i===s.o?0:O[3]*B[3]/Math.pow(dist(O,B)/1000,s.b));const mx=Math.max(...I);
  const order=C.map((B,i)=>[I[i],i]).sort((a,b)=>a[0]-b[0]);
  order.forEach(([v,i])=>{if(i===s.o)return;const a=P([O[1],O[2]]),b=P([C[i][1],C[i][2]]),k=v/mx;f+='<path d="M'+f1(a[0])+','+f1(a[1])+' Q'+f1((a[0]+b[0])/2)+','+f1((a[1]+b[1])/2-Math.hypot(b[0]-a[0],b[1]-a[1])*.12)+' '+f1(b[0])+','+f1(b[1])+'" fill="none" stroke="'+ACC+'" stroke-width="'+f2(.4+k*6)+'" opacity="'+f2(.25+k*.7)+'" stroke-linecap="round"'+tip(O[0]+" ↔ "+C[i][0]+": "+fmt(dist(O,C[i]))+" km · pull "+Math.round(k*100)+" (the strongest = 100)")+'/>'});
  C.forEach((B,i)=>{const p=P([B[1],B[2]]),r=1.4+Math.sqrt(B[3])*1.1,on=i===s.o;c+='<g data-act="o:'+i+'" style="cursor:pointer"'+tip(B[0]+": "+B[3]+" million people")+'><circle cx="'+f1(p[0])+'" cy="'+f1(p[1])+'" r="'+f1(r+4)+'" fill="transparent"/><circle cx="'+f1(p[0])+'" cy="'+f1(p[1])+'" r="'+f1(r)+'" fill="'+(on?ACC:"#2f6fb0")+'" stroke="#fff" stroke-width=".8"/>'+/* every city named (the smaller ones smaller), so the unlabelled dots are not a mystery */(on||B[3]>6||B[0]!=="Boston"?T(f1(p[0]+r+1.5),f1(p[1]+2),B[0],'font-size="'+(on||B[3]>6?5.8:4.9)+'" font-weight="'+(on||B[3]>6?800:700)+'" fill="'+INK+'" stroke="#fff" stroke-width="1.6" stroke-opacity=".8" paint-order="stroke"'):"")+'</g>'});
  setHTML(svg,".gv-f",f);setHTML(svg,".gv-c",c);
  const top=order.slice(-3).reverse().map(([v,i])=>C[i][0]+" ("+fmt(dist(O,C[i]))+" km)");
  txt(svg,".gv-big",O[0]+" pulls hardest on "+top[0]);
  setPara(svg,"gv-tx","Next: "+top.slice(1).join(", ")+". "+(s.b>=2?"Halve the distance and the pull is "+Math.pow(2,s.b)+" times stronger; big cities far apart pull less than smaller ones close by.":"With distance counting less, big cities pull each other even across the country."));
  [1,2,3].forEach(k=>btnOn(svg,"b"+k,s.b===k))},
 act:(svg,s,a)=>{let m=/^o:(\d+)/.exec(a);if(m){s.o=+m[1];return true}m=/^b(\d)$/.exec(a);if(m){s.b=+m[1];return true}}});
})();

/* ================================================================ 8. How much Mercator inflates: drag real countries */
(function(){
const SH=[["Greenland","304",2166086],["Australia","036",7692024],["Brazil","076",8515767],["DR Congo","180",2344858]];
let PM=null;const proj=()=>PM||(PM=d3.geoMercator().fitExtent([[8,26],[292,150]],{type:"MultiPoint",coordinates:[[-180,-60],[180,80]]}).clipExtent([[8,26],[292,150]]));
const featOf=id=>landFeatures().find(f=>String(f.id)===id);
/* move a shape on the globe so its middle sits at (lon, lat), keeping its true size */
function moved(f,c0,c1){if(!f)return null;const r1=d3.geoRotation([-c0[0],-c0[1]]),r2=d3.geoRotation([-c1[0],-c1[1]]);const mv=p=>r2.invert(r1(p));
 const g=f.geometry,map=rings=>rings.map(r=>r.map(mv));return{type:g.type,coordinates:g.type==="Polygon"?map(g.coordinates):g.coordinates.map(map)}}
const CTR={};const ctr=(i)=>{if(CTR[i])return CTR[i];const f=featOf(SH[i][1]);return CTR[i]=f?d3.geoCentroid(f):[0,0]};
make("mercator",{title:"How much Mercator inflates",cat:"maps",h:200,tabs:SH.map(x=>x[0]),
 src:"Real outlines (the map’s own Natural Earth shapes) moved on the globe at their true size, then drawn on a Mercator map, which stretches areas by 1/cos²(latitude). Areas: UN Statistics Division, rounded.",
 frame:()=>{const P=proj(),pa=d3.geoPath(P);return'<rect x="8" y="26" width="284" height="124" fill="#d7e8f5"/><path d="'+landPath("merc",P,f=>{try{return d3.geoBounds(f)[1][1]>-60}catch(e){return false}})+'" fill="#e0d8bc" stroke="#b5a980" stroke-width=".3"/><path d="'+(pa(d3.geoGraticule().step([30,20])())||"").replace(/(\.\d)\d+/g,"$1")+'" fill="none" stroke="#fff" stroke-width=".5"/><g class="mc-s"></g><rect x="8" y="26" width="284" height="124" fill="none" stroke="#9fb2c4" stroke-width=".6"/>'+
  '<text class="mc-big" x="8" y="162" font-size="8.4" font-weight="900" fill="'+INK+'"></text>'+para("mc-tx",8,165,286,20,6.3)+hint(8,196,"Drag the orange shape north and south: its true size never changes")},
 state:()=>({c:[[ -30,72],[134,-25],[-53,-10],[23,-3]].map(x=>x.slice())}),
 draw:(svg,s)=>{const P=proj(),pa=d3.geoPath(P),i=s.tab,f=featOf(SH[i][1]);if(!f){setHTML(svg,".mc-s",T(150,90,"loading the map…",'text-anchor="middle"'));return}
  const c0=ctr(i);if(!s.init){s.init=1;s.c=SH.map((x,k)=>ctr(k).slice())}const c1=s.c[i];const g=moved(f,c0,c1);
  const home=pa(f.geometry),now=pa(g),cp=P(c1);
  setHTML(svg,".mc-s",'<path d="'+home+'" fill="none" stroke="#7a6a4a" stroke-width=".8" stroke-dasharray="2 1.5"/><g class="dg-handle" data-drag="m"><path d="'+now+'" fill="'+ACC+'" fill-opacity=".75" stroke="#b5501a" stroke-width=".8"/>'+(cp?'<circle cx="'+f1(cp[0])+'" cy="'+f1(cp[1])+'" r="14" fill="transparent"/>':"")+'</g>');
  const k=1/Math.pow(Math.cos(c1[1]*R),2),k0=1/Math.pow(Math.cos(c0[1]*R),2);
  txt(svg,".mc-big",SH[i][0]+" at "+Math.abs(Math.round(c1[1]))+"°"+(c1[1]>=0?"N":"S")+": drawn "+(k<1.08?"about true size":k.toFixed(1)+"× too big"));
  setPara(svg,"mc-tx","True area "+fmt(SH[i][2])+" km², the same wherever it goes. At home (dashed) Mercator draws it "+k0.toFixed(1)+"× too big"+(SH[i][0]==="Greenland"?"; Africa is really 14 times bigger than Greenland.":"."))},
 drag:(svg,s,n,x,y)=>{const ll=proj().invert([x,y]);if(!ll||!isFinite(ll[1]))return false;s.c[s.tab]=[ll[0],clamp(ll[1],-72,78)]}});
})();

/* ================================================================ 9. Three models of the city, drawn as city plans */
(function(){
const ZN=[["Central business district","#d9573a","Offices, shops and banks: land is dearest here, so buildings go up"],["Factories and old housing","#8a7a6a","Industry, warehouses and run-down housing; Burgess called it the zone in transition"],
 ["Working-class homes","#e8a24a","Rows of small houses close to the factories and the jobs"],["Middle-class homes","#7fb6e0","Bigger houses with gardens, a longer trip to work"],["Commuter suburbs","#3a6fb5","Wealthy homes and villages; people travel in by train or car"]];
const MD=[["Concentric zones","Burgess (1925), drawn from Chicago: the city grows outward in rings; each zone pushes into the next (invasion and succession)."],
 ["Sectors","Hoyt (1939): wedges follow transport lines. Industry runs along the railway and the river; the rich move outward along the best side."],
 ["Multiple nuclei","Harris and Ullman (1945): a car city grows around several centres: the old downtown, an industrial district, a suburban business centre."]];
const W=194,H=124,X0=6,Y0=26,CX=150,CY=64;/* centre on the lake shore, as in Chicago */
function zoneAt(m,x,y,g){if(x>172+6*Math.sin(y/9))return-1;/* the lake */const dx=x-CX,dy=y-CY,r=Math.hypot(dx,dy)/(.7+.5*g),a=Math.atan2(dy,dx);
 if(m===0)return r<12?0:r<26?1:r<44?2:r<66?3:4;
 if(m===1){if(r<12)return 0;const ind=Math.abs(Math.atan2(Math.sin(a-2.5),Math.cos(a-2.5)))<.32,rich=Math.abs(Math.atan2(Math.sin(a+1.75),Math.cos(a+1.75)))<.38,low=Math.abs(Math.atan2(Math.sin(a-2.5),Math.cos(a-2.5)))<.8;return ind&&r<90?1:rich?(r<70?4:4):low?2:r<70?3:4}
 const N=[[CX,CY,0,1],[CX-62,CY+30,1,.8],[CX-80,CY-36,0,.55],[CX-38,CY-46,4,.9],[CX-18,CY+40,2,1]];let best=4,bd=1e9;N.forEach(([nx,ny,z,w])=>{const d=Math.hypot(x-nx,y-ny)/(w*(.7+.5*g));if(d<bd){bd=d;best=z}});
 if(bd>34)return Math.hypot(x-CX,y-CY)>90*(.7+.5*g)?4:3;return best===0&&Math.hypot(x-CX,y-CY)>14*(.7+.5*g)&&Math.hypot(x-(CX-80),y-(CY-36))>10?3:best}
const C=new Map();
function plan(m,g){const key=m+":"+Math.round(g*10);if(C.has(key))return C.get(key);const S=2,cw=W*S,ch=H*S,c=document.createElement("canvas");c.width=cw;c.height=ch;const x=c.getContext("2d"),im=x.createImageData(cw,ch),D=im.data;
 const hex=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];const ZC=ZN.map(z=>hex(z[1]));
 for(let py=0;py<ch;py++)for(let px=0;px<cw;px++){const ux=px/S,uy=py/S,z=zoneAt(m,ux,uy,g),k=(py*cw+px)*4;let c3;
  if(z<0){const t=.5+.5*Math.sin(px*.15+py*.03);c3=[70+t*10,140+t*12,200+t*10]}
  else{const bs=z===0?7:z===1?11:z===2?6:z===3?8:12,bx=Math.floor(ux/bs),by=Math.floor(uy/bs),fx=ux-bx*bs,fy=uy-by*bs,rr=rnd(bx*31.7+by*7.3+z),road=fx<.9||fy<.9;
   if(road)c3=z===4?[214,206,170]:[226,222,214];
   else if(z===0){const top=fx>bs-2.2||fy>bs-2.2;c3=top?[90,100,118]:[150+rr*50,160+rr*45,178+rr*40]}
   else if(z===1){c3=rr<.6?[150+rr*20,146+rr*18,138]:[132,110,90];if((Math.floor(fx*2))%3===0&&rr<.6)c3=[120,120,118]}
   else if(z===2){const row=Math.floor(fy/1.5)%2;c3=row?[176,86,60]:[200,110,80];if(fx>bs-1.2)c3=[214,200,170]}
   else if(z===3){const house=Math.abs(fx-bs/2)<2&&Math.abs(fy-bs/2)<2;c3=house?[204,120,92]:[150+rr*20,190,120]}
   else{const house=rr<.3&&Math.abs(fx-bs/2)<1.6&&Math.abs(fy-bs/2)<1.6,tree=rnd(Math.floor(ux*1.3)*3.1+Math.floor(uy*1.3)*7.7)<.25;c3=house?[220,210,196]:tree?[70,120,60]:[150+rr*25,186,110]}
   const t=ZC[z];c3=[c3[0]*.6+t[0]*.4,c3[1]*.6+t[1]*.4,c3[2]*.6+t[2]*.4]}
  D[k]=c3[0];D[k+1]=c3[1];D[k+2]=c3[2];D[k+3]=255}
 x.putImageData(im,0,0);const u=c.toDataURL();if(C.size>40)C.clear();C.set(key,u);return u}
make("citymodels",{title:"Three models of the city",cat:"people",h:212,tabs:MD.map(x=>x[0]),
 src:"Burgess (1925), Hoyt (1939), Harris and Ullman (1945), drawn as city plans on a lake shore like Chicago’s. Simplified: real cities mix all three.",
 frame:()=>'<image class="cm-i" x="'+X0+'" y="'+Y0+'" width="'+W+'" height="'+H+'" preserveAspectRatio="none"/><rect x="'+X0+'" y="'+Y0+'" width="'+W+'" height="'+H+'" fill="transparent" data-drag="pick"/><g class="cm-sel"></g><rect x="'+X0+'" y="'+Y0+'" width="'+W+'" height="'+H+'" rx="2" fill="none" stroke="#9fb2c4" stroke-width=".6"/>'+T(190,Y0+12,"lake",'text-anchor="end" font-size="6.2" font-weight="800" fill="#fff"')+
  '<g transform="translate(206,26)"><rect width="88" height="124" rx="8" fill="#fff"/><g class="cm-l"></g></g>'+para("cm-tx",8,154,286,24,6.3)+slider("g",14,192,206,"The city grows")+hint(8,208,"Tap a zone on the plan; drag to let the city grow outward"),
 state:(tab,a)=>({g:.5,sel:0}),
 draw:(svg,s)=>{const im=q(svg,".cm-i");const u=plan(s.tab,s.g);if(im&&im.getAttribute("href")!==u)im.setAttribute("href",u);
  let l="";ZN.forEach((z,i)=>{const y=8+i*22,on=i===s.sel;l+='<g data-act="z:'+i+'" style="cursor:pointer"><rect x="4" y="'+(y-5)+'" width="80" height="20" rx="5" fill="'+(on?"#f3f6fa":"#fff")+'" stroke="'+(on?z[1]:"none")+'"/><rect x="8" y="'+(y-1)+'" width="9" height="9" rx="2" fill="'+z[1]+'"/>'+T(21,y+6,z[0].replace("Central business district","CBD").replace("Factories and old housing","Factories, old housing"),'font-size="5.8" font-weight="'+(on?900:700)+'" fill="'+INK+'"')+'</g>'});setHTML(svg,".cm-l",l);
  setPara(svg,"cm-tx","<b>"+ZN[s.sel][0]+".</b> "+ZN[s.sel][2]+". <i>"+MD[s.tab][1]+"</i>");
  setSlider(svg,"g",14,192,206,s.g,s.g<.33?"1900":s.g<.66?"1930":"1960")},
 drag:(svg,s,n,x,y)=>{if(n==="g"){s.g=clamp((x-14)/206,0,1);return}const z=zoneAt(s.tab,x-X0,y-Y0,s.g);if(z>=0)s.sel=z},
 act:(svg,s,a)=>{const m=/^z:(\d)/.exec(a);if(m){s.sel=+m[1];return true}}});
})();

/* ================================================================ 10. Von Thünen's rings on a landscape */
(function(){
/* rent per km² = yield × (price − cost) − yield × freight × distance (von Thünen 1826); numbers chosen so that one unit is about one km */
const USE=[["Market gardens and dairy","#7cbf5a",100,10],["Forest (firewood, timber)","#2f6a3a",70,4],["Grain","#e3c45a",48,1.2],["Ranching","#c9b98a",20,.25]];
const MX=6,MY=26,MW=180,MH=124,TX=96,TY=88;
function rentAt(d,k){let best=-1,bv=0;USE.forEach((u,i)=>{const v=u[2]-u[3]*k*d;if(v>bv){bv=v;best=i}});return[best,bv]}
const C=new Map();
function land(k,river){const key=Math.round(k*20)+":"+river;if(C.has(key))return C.get(key);const S=2,cw=MW*S,ch=MH*S,c=document.createElement("canvas");c.width=cw;c.height=ch;const x=c.getContext("2d"),im=x.createImageData(cw,ch),D=im.data;
 for(let py=0;py<ch;py++)for(let px=0;px<cw;px++){const ux=px/S,uy=py/S,dx=ux-(TX-MX),dy=uy-(TY-MY);let d=Math.hypot(dx,dy)*.5;
  const ry=(TY-MY)+5*Math.sin(ux/16);if(river)d=Math.min(d,(Math.abs(dx)*.25+Math.abs(uy-ry))*.5);/* boats carry goods cheaply along the river */
  const[u]=rentAt(d,k),kk=(py*cw+px)*4,r=rnd(Math.floor(ux/5)*13.1+Math.floor(uy/4)*7.7);let c3;
  if(river&&Math.abs(uy-ry)<1.6)c3=[70,140,205];
  else if(Math.hypot(dx,dy)<4)c3=((Math.floor(ux)+Math.floor(uy))%3===0)?[226,222,214]:[150+r*40,140+r*30,130];
  else if(u===0){const plot=Math.floor(ux/3)+Math.floor(uy/3)*7;c3=[[120,180,80],[160,120,170],[110,160,70],[190,150,90],[90,150,70]][Math.floor(rnd(plot)*5)]}
  else if(u===1){const n=rnd(Math.floor(ux*1.4)*3.7+Math.floor(uy*1.4)*9.1);c3=[40+n*40,90+n*40,50+n*20]}
  else if(u===2){const stripe=Math.floor((ux+uy*.3)*1.6)%2;c3=r<.5?(stripe?[232,200,96]:[220,186,80]):(stripe?[214,196,110]:[200,180,100])}
  else if(u===3){c3=[196+r*14,190+r*10,140];if(rnd(Math.floor(ux*.9)*5.3+Math.floor(uy*.9)*2.9)<.05)c3=[110,80,60]}
  else c3=[166,150,124];
  D[kk]=c3[0];D[kk+1]=c3[1];D[kk+2]=c3[2];D[kk+3]=255}
 x.putImageData(im,0,0);const u=c.toDataURL();if(C.size>60)C.clear();C.set(key,u);return u}
make("vonthunen",{title:"Von Thünen’s rings: rent falls with distance",cat:"econ",h:214,
 src:"After J. H. von Thünen, The Isolated State (1826): each crop’s rent = yield × (price − cost) − yield × freight × distance; the land goes to the crop that pays most. Numbers are made up but keep his order.",
 frame:()=>'<image class="vt-i" x="'+MX+'" y="'+MY+'" width="'+MW+'" height="'+MH+'" preserveAspectRatio="none"/><rect x="'+MX+'" y="'+MY+'" width="'+MW+'" height="'+MH+'" rx="2" fill="none" stroke="#9fb2c4" stroke-width=".6"/>'+
  '<g transform="translate('+TX+','+TY+')"><circle r="4.5" fill="#fff" opacity=".6"/><path d="M-1,-8 h2 v-4 h-2Z M-3,-8 h6 v6 h-6Z" fill="#8a3a2a"/></g>'+T(TX,TY+12,"market town",'text-anchor="middle" font-size="6" font-weight="900" fill="#fff" stroke="#1d3047" stroke-width="1.8" paint-order="stroke"')+
  '<g transform="translate(192,26)"><rect width="102" height="124" rx="8" fill="#fff"/><g class="vt-c"></g></g>'+para("vt-tx",8,154,286,22,6.3)+slider("k",14,192,140,"Transport cost")+btn("river",160,184,64,"No river")+btn("price",228,184,66,"Grain price ↑")+hint(8,210,"Drag the transport cost; add a river and the rings stretch along it"),
 state:()=>({k:1,river:0,price:0}),
 draw:(svg,s)=>{if(s.price)USE[2][2]=62;else USE[2][2]=48;const im=q(svg,".vt-i"),u=land(s.k,s.river)+"";if(im&&im.getAttribute("href")!==u)im.setAttribute("href",u);
  /* the rent lines */const X0=10,X1=96,Y0=14,Y1=92,dm=90,xd=d=>X0+d/dm*(X1-X0),yr=v=>Y1-v/100*(Y1-Y0);let c=T(4,9,"Rent each crop can pay",'font-size="6" font-weight="800" fill="'+INK+'"');
  c+='<path d="M'+X0+','+Y1+'H'+X1+'M'+X0+','+Y0+'V'+Y1+'" stroke="#9fb2c4" stroke-width=".6"/>'+T(X1,Y1+7,"distance →",'text-anchor="end" font-size="5" fill="'+SUB+'"');
  USE.forEach(u=>{const d0=u[2]/(u[3]*s.k);c+='<path d="M'+f1(xd(0))+','+f1(yr(u[2]))+'L'+f1(xd(Math.min(dm,d0)))+','+f1(yr(Math.max(0,u[2]-u[3]*s.k*Math.min(dm,d0))))+'" stroke="'+u[1]+'" stroke-width="1.4"/>'});
  let env=[];for(let d=0;d<=dm;d+=1){const[,v]=rentAt(d,s.k);env.push([xd(d),yr(v)])}c+='<path d="'+ln(env)+'" fill="none" stroke="#1d3047" stroke-width=".8" stroke-dasharray="2 1.5"/>';
  USE.forEach((u,i)=>{c+='<rect x="6" y="'+(100+i*6.4)+'" width="6" height="4.6" fill="'+u[1]+'"/>'+T(15,104+i*6.4,u[0],'font-size="5" fill="'+INK+'"')});setHTML(svg,".vt-c",c);
  const rings=[];let last=-1,start=0;for(let d=0;d<=90;d+=.5){const[u]=rentAt(d,s.k);if(u!==last){if(last>=0)rings.push(USE[last][0].split(" (")[0]+" "+Math.round(start)+"–"+Math.round(d)+" km");last=u;start=d}}if(last>=0)rings.push(USE[last][0].split(" (")[0]+" "+Math.round(start)+"+ km");
  setPara(svg,"vt-tx",(s.river?"Boats carry goods cheaply, so each ring stretches along the river. ":"Close to town, crops that are heavy or go off quickly pay the most rent; further out, only cheap, light-to-move uses pay. ")+"Rings: "+rings.slice(0,3).join(", ")+".");
  setSlider(svg,"k",14,192,140,(s.k-.5)/1.5,s.k<.8?"low (railways)":s.k>1.4?"high (ox carts)":"medium");btnOn(svg,"river",!!s.river,s.river?"River":"No river");btnOn(svg,"price",!!s.price,s.price?"Grain price up":"Grain price ↑")},
 drag:(svg,s,n,x)=>{s.k=.5+clamp((x-14)/140,0,1)*1.5},
 act:(svg,s,a)=>{if(a==="river"){s.river=s.river?0:1;return true}if(a==="price"){s.price=!s.price;C.clear();return true}}});
})();

/* ================================================================ 11. The 2004 tsunami crosses the Bay of Bengal */
(function(){
/* depth along the path from the earthquake off Sumatra to Sri Lanka (km from the epicentre, metres), rounded from GEBCO */
const PROF=[[0,-3000],[100,-4500],[300,-4300],[550,-3300],[640,-2100],[740,-3400],[900,-4200],[1400,-4100],[1500,-3200],[1555,-700],[1575,-100],[1600,0]];
const EQ=[95.85,3.32],SL=[81.85,7.2];/* epicentre (USGS) and the coast of eastern Sri Lanka */
const depth=x=>{for(let i=1;i<PROF.length;i++)if(x<=PROF[i][0]){const a=PROF[i-1],b=PROF[i],u=(x-a[0])/(b[0]-a[0]);return a[1]+(b[1]-a[1])*u}return 0};
/* time to reach each point: the wave runs at the square root of g × depth */
const TT=[0];for(let x=1;x<=1600;x++){const d=Math.max(5,-depth(x-.5));TT.push(TT[x-1]+1000/Math.sqrt(9.81*d)/3600)}
const posAt=t=>{let x=0;while(x<1600&&TT[x+1]<=t)x++;return x};
let PM=null;const proj=()=>PM||(PM=d3.geoMercator().fitExtent([[6,6],[294,92]],{type:"MultiPoint",coordinates:[[76,0],[101,15]]}));
make("tsunami",{title:"Why a tsunami slows down and rears up near land",cat:"water",h:218,
 src:"26 December 2004, magnitude 9.1 off Sumatra (USGS). Wave speed = √(g × depth); height grows as depth shrinks (Green’s law, height ∝ depth^−¼), from about 0.6 m in deep water. It reached Sri Lanka about 2 hours later (NOAA NCEI). Depths rounded from GEBCO.",
 defs:()=>'<linearGradient id="dgTsSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f86c4"/><stop offset="1" stop-color="#0f2f5a"/></linearGradient>',
 frame:()=>{const P=proj();return'<clipPath id="dgTsClip"><rect x="6" y="6" width="288" height="86" rx="8"/></clipPath><g clip-path="url(#dgTsClip)"><rect x="6" y="6" width="288" height="86" fill="#2a6aa6"/><path d="'+landPath("tsu",P,f=>{try{const b=d3.geoBounds(f);return b[1][1]>-12&&b[0][1]<30&&b[1][0]>60&&b[0][0]<110}catch(e){return false}})+'" fill="#cbbf98" stroke="#8e8462" stroke-width=".4"/><g class="ts-m"></g></g><rect x="6" y="6" width="288" height="86" rx="8" fill="none" stroke="#9fb2c4" stroke-width=".6"/>'+
  '<g class="ts-p"></g><text class="ts-big" x="8" y="174" font-size="8.4" font-weight="900" fill="'+INK+'"></text><text class="ts-sub" x="8" y="184" font-size="6.4" font-weight="700" fill="'+SUB+'"></text>'+slider("t",14,204,206,"Time after the earthquake")+btn("play",232,196,62,"▶ Play")+hint(8,216,"Drag the time: the wave races across deep water, then slows and grows")},
 state:()=>({t:.6,play:0}),
 draw:(svg,s)=>{const P=proj(),t=s.t,x=posAt(t),d=-depth(Math.min(1599,x)),sp=Math.sqrt(9.81*Math.max(5,d))*3.6,hgt=.6*Math.pow(4000/Math.max(10,d),.25);
  /* the wave front on the map: faster where the sea is deep (west), slower in the shallow Andaman Sea (east) */
  let ring=[];for(let a=0;a<=360;a+=6){const th=a*R,v=560+230*Math.cos(th-Math.PI*1.03),dist=Math.min(2600,v*t),p=d3.geoDestination?null:null;
   const ll=dest(EQ,a,dist);const q2=P(ll);if(q2)ring.push(q2)}
  let m='<path d="'+ln(ring)+'Z" fill="#9fd8f7" fill-opacity=".18" stroke="#fff" stroke-width="1.4"/>';const e=P(EQ),sl=P(SL);
  m+='<path d="M'+f1(e[0])+','+f1(e[1])+'L'+f1(sl[0])+','+f1(sl[1])+'" stroke="#ffd24a" stroke-width=".8" stroke-dasharray="3 2"/><path d="M'+f1(e[0])+','+f1(e[1]-5)+' l1.6,3.4 3.6,.4 -2.7,2.4 .8,3.6 -3.3,-1.9 -3.3,1.9 .8,-3.6 -2.7,-2.4 3.6,-.4Z" fill="#ffd24a" stroke="#c0561d" stroke-width=".5"/>';
  [["Sri Lanka",80.7,7.9],["India",79,14],["Sumatra",98.5,1.6],["Thailand",99.6,10.5],["Andaman Is.",92.8,11.8]].forEach(([n,lo,la])=>{const p=P([lo,la]);m+=T(f1(p[0]),f1(p[1]),n,'text-anchor="middle" font-size="5.8" font-weight="800" fill="#4a3a2a"')});
  setHTML(svg,".ts-m",m);
  /* the profile */const X0=6,X1=294,Y0=100,Y1=164,SLY=112,xd=k=>X0+k/1600*(X1-X0),yd=v=>SLY+(-v)/4600*(Y1-SLY-2);let p='<rect x="'+X0+'" y="'+Y0+'" width="'+(X1-X0)+'" height="'+(SLY-Y0)+'" fill="#e6f1fa"/>';
  const bed=[];for(let k=0;k<=1600;k+=10)bed.push([xd(k),yd(depth(k))]);p+='<path d="M'+X0+','+SLY+'H'+X1+'V'+Y1+'H'+X0+'Z" fill="url(#'+uid(svg,"dgTsSea")+')"/><path d="'+ln(bed)+'L'+X1+','+Y1+'L'+X0+','+Y1+'Z" fill="#7a5a3a"/>';
  /* the wave: a long low hump in deep water that grows steep near the coast */const wx=xd(x),wl=Math.max(6,Math.min(60,sp/14)),A=Math.min(9,hgt*1.6);p+='<path d="M'+f1(wx-wl)+','+SLY+' Q'+f1(wx)+','+f1(SLY-A*2)+' '+f1(wx+wl*.4)+','+SLY+'Z" fill="#9fd8f7" stroke="#fff" stroke-width=".6"/>';
  p+=T(X0+4,Y0+9,"Sumatra",'font-size="5.8" font-weight="800" fill="'+INK+'"')+T(X1-4,Y0+9,"Sri Lanka",'text-anchor="end" font-size="5.8" font-weight="800" fill="'+INK+'"')+T(xd(640),f1(yd(-2100)+10),"Ninety East Ridge",'text-anchor="middle" font-size="5.4" font-weight="700" fill="#f6e7da"')+T(xd(1100),Y1-4,"4 km deep",'text-anchor="middle" font-size="5.6" font-weight="800" fill="#cfe4f7"');
  setHTML(svg,".ts-p",p);
  const hh=Math.floor(t),mm=Math.round((t-hh)*60)%60;
  txt(svg,".ts-big",x>=1599?"Landfall in Sri Lanka, about 2 hours after the quake":fmt(sp)+" km/h over water "+fmt(d)+" m deep · wave about "+(Math.round(hgt*10)/10)+" m high");
  txt(svg,".ts-sub",x>=1599?"Run-up on the beaches reached up to about 10 m; some 35,000 people died in Sri Lanka":sp>500?"As fast as a jet airliner, but so low and long that ships at sea barely notice it":"In shallow water it slows down, the back catches up with the front, and it rears up");
  setSlider(svg,"t",14,204,206,t/2.3,hh+" h "+String(mm).padStart(2,"0")+" min");btnOn(svg,"play",!!s.play,s.play?"❚❚ Pause":"▶ Play")},
 drag:(svg,s,n,x)=>{s.play=0;s.t=clamp((x-14)/206,0,1)*2.3},
 act:(svg,s,a)=>{if(a==="play"){if(!s.play&&s.t>=2.29)s.t=0;s.play=!s.play;return true}},
 tick:(svg,s,dt)=>{if(!s.play)return;s.t=Math.min(2.3,s.t+dt*.25);if(s.t>=2.3)s.play=0;DG.tsunami._d(svg,s)}});
/* a point at a distance (km) and bearing (degrees) from a start point */
function dest(p,brg,km){const d=km/6371,b=brg*R,la=p[1]*R,lo=p[0]*R,la2=Math.asin(Math.sin(la)*Math.cos(d)+Math.cos(la)*Math.sin(d)*Math.cos(b)),lo2=lo+Math.atan2(Math.sin(b)*Math.sin(d)*Math.cos(la),Math.cos(d)-Math.sin(la)*Math.sin(la2));return[lo2/R,la2/R]}
})();

/* ================================================================ 12. Find the earthquake: three seismographs on a real map */
(function(){
/* the 2019 Ridgecrest earthquake, magnitude 7.1 (USGS), timed from three towns' seismographs */
const EQ=[-117.6,35.77],ST=[["Pasadena",-118.17,34.15],["Barstow",-117.02,34.9],["Bakersfield",-119.02,35.37]];
const KPS=8.4;/* km per second of S-minus-P delay: P waves about 6 km/s, S waves about 3.5 km/s */
const SAF=[[-115.6,33.3],[-116.5,33.9],[-117.3,34.25],[-118,34.55],[-118.9,34.85],[-119.6,35.2],[-120.3,35.9],[-121,36.4]],GAR=[[-118.6,34.85],[-117.6,35.35],[-116.3,35.6]];
const dist=(a,b)=>{const x=Math.sin((b[1]-a[1])*R/2),y=Math.sin((b[0]-a[0])*R/2);return 2*6371*Math.asin(Math.sqrt(x*x+Math.cos(a[1]*R)*Math.cos(b[1]*R)*y*y))};
let PM=null;const proj=()=>PM||(PM=d3.geoMercator().fitExtent([[8,8],[170,150]],{type:"MultiPoint",coordinates:[[-120.6,33.6],[-115.8,36.6]]}));
make("epicentre",{title:"Find the earthquake: three seismographs",cat:"plates",h:206,
 src:"The 2019 Ridgecrest earthquake, magnitude 7.1, located by USGS. S−P method: P waves run about 6 km/s and S waves about 3.5 km/s, so each second between them means about 8.4 km of distance. Faults simplified from the USGS fault database.",
 frame:()=>{const P=proj(),pa=d3.geoPath(P);return'<rect x="8" y="8" width="162" height="142" rx="8" fill="#cfe4f4"/><clipPath id="dgEpClip"><rect x="8" y="8" width="162" height="142" rx="8"/></clipPath><g clip-path="url(#dgEpClip)"><path d="'+landPath("epi",P,f=>["840","484"].includes(String(f.id)))+'" fill="#e6dcb8" stroke="#a89a6a" stroke-width=".5"/>'+
  '<path d="'+ln(SAF.map(P))+'" fill="none" stroke="#b5401c" stroke-width="1.1" stroke-dasharray="4 1.5"/><path d="'+ln(GAR.map(P))+'" fill="none" stroke="#b5401c" stroke-width=".9" stroke-dasharray="4 1.5"/>'+T(f1(P([-119.3,34.7])[0]),f1(P([-119.3,34.7])[1]+9),"San Andreas Fault",'font-size="5.4" font-weight="800" fill="#b5401c"')+
  '<g class="ep-c"></g><g class="ep-s"></g></g><rect x="8" y="8" width="162" height="142" rx="8" fill="none" stroke="#9fb2c4" stroke-width=".6"/><rect x="8" y="8" width="162" height="142" fill="transparent" data-drag="g"/><g class="ep-g"></g>'+
  '<g transform="translate(176,8)"><rect width="118" height="142" rx="8" fill="#fff"/><g class="ep-w"></g></g><text class="ep-big" x="8" y="164" font-size="8.4" font-weight="900" fill="'+INK+'"></text>'+para("ep-tx",8,167,286,22,6.3)+hint(8,202,"Tap each seismograph to measure it, then drag the star to where the circles meet")},
 state:()=>({on:[0,0,0],g:[-118.6,35.1]}),
 draw:(svg,s)=>{const P=proj();let c="",st="",w=T(6,12,"Seismographs (tap)",'font-size="6.4" font-weight="800" fill="'+INK+'"');
  ST.forEach(([n,lo,la],i)=>{const d=dist([lo,la],EQ),sp=d/KPS,p=P([lo,la]),on=s.on[i];
   if(on){const pts=[];for(let a=0;a<=360;a+=6){const b=a*R,dd=d/6371,l1=la*R,l2=Math.asin(Math.sin(l1)*Math.cos(dd)+Math.cos(l1)*Math.sin(dd)*Math.cos(b)),o2=lo*R+Math.atan2(Math.sin(b)*Math.sin(dd)*Math.cos(l1),Math.cos(dd)-Math.sin(l1)*Math.sin(l2));pts.push(P([o2/R,l2/R]))}c+='<path d="'+ln(pts)+'Z" fill="'+["#2f78b8","#2e9b5f","#8a4ab5"][i]+'" fill-opacity=".08" stroke="'+["#2f78b8","#2e9b5f","#8a4ab5"][i]+'" stroke-width="1.1"/>'}
   st+='<g data-act="st:'+i+'" style="cursor:pointer"><circle cx="'+f1(p[0])+'" cy="'+f1(p[1])+'" r="9" fill="transparent"/><path d="M'+f1(p[0])+','+f1(p[1]-4)+' l3.5,6 h-7Z" fill="'+INK+'"/>'+T(f1(p[0]+5),f1(p[1]+2),n,'font-size="5.8" font-weight="800" fill="'+INK+'" stroke="#fff" stroke-width="1.6" stroke-opacity=".8" paint-order="stroke"')+'</g>';
   /* the trace: quiet, P arrives, then the bigger S */const y0=26+i*38,x0=6,x1=112;let tr=[];for(let k=0;k<=106;k++){const t=k/106*40,a=t<4?.4:t<4+sp?2.5*Math.exp(-(t-4)/9):9*Math.exp(-(t-4-sp)/7);tr.push([x0+k,y0+10+Math.sin(k*2.3+i)*a*(.5+rnd(k+i*99)*.5)])}
   w+='<g data-act="st:'+i+'" style="cursor:pointer"><rect x="'+x0+'" y="'+(y0-6)+'" width="'+(x1-x0)+'" height="34" rx="5" fill="'+(on?"#f3f6fa":"#fbfcfe")+'" stroke="'+(on?["#2f78b8","#2e9b5f","#8a4ab5"][i]:"#e1e7ef")+'"/>'+T(x0+4,y0+2,n,'font-size="5.8" font-weight="800" fill="'+INK+'"')+T(x1-4,y0+2,on?"S−P "+sp.toFixed(1)+" s → "+fmt(d)+" km":"tap",'text-anchor="end" font-size="5.6" font-weight="800" fill="'+(on?ACC:SUB)+'"')+'<path d="'+ln(tr)+'" fill="none" stroke="#1d3047" stroke-width=".5"/>'+(on?'<path d="M'+f1(x0+4/40*106)+','+(y0+3)+'v22M'+f1(x0+(4+sp)/40*106)+','+(y0+3)+'v22" stroke="'+ACC+'" stroke-width=".7" stroke-dasharray="1.5 1"/>'+T(f1(x0+4/40*106+1.5),y0+26,"P",'font-size="5" font-weight="900" fill="'+ACC+'"')+T(f1(x0+(4+sp)/40*106+1.5),y0+26,"S",'font-size="5" font-weight="900" fill="'+ACC+'"'):"")+'</g>'});
  setHTML(svg,".ep-c",c);setHTML(svg,".ep-s",st);setHTML(svg,".ep-w",w);
  const gp=P(s.g),off=dist(s.g,EQ),n=s.on.filter(Boolean).length;setHTML(svg,".ep-g",'<g class="dg-handle" data-drag="g" transform="translate('+f1(gp[0])+','+f1(gp[1])+')"><circle r="12" fill="transparent"/><path d="M0,-6 l1.8,4 4.2,.4 -3.2,2.8 1,4.2 -3.8,-2.2 -3.8,2.2 1,-4.2 -3.2,-2.8 4.2,-.4Z" fill="#ffd24a" stroke="#c0561d" stroke-width=".8"/></g>');
  const found=n===3&&off<15;txt(svg,".ep-big",found?"Found it: near Ridgecrest, 4 July 2019 (it was a magnitude 7.1)":n<3?n+" of 3 seismographs measured":"Your star is "+fmt(off)+" km from where the circles meet");
  setPara(svg,"ep-tx",found?"Each circle shows every place that far from one seismograph; only one point lies on all three. Seismologists do the same with hundreds of stations.":"The fast P wave arrives first, the slower S wave later. The longer the gap, the further away the earthquake: about 8.4 km for each second.")},
 drag:(svg,s,n,x,y)=>{const ll=proj().invert([clamp(x,10,168),clamp(y,10,148)]);if(ll)s.g=ll},
 act:(svg,s,a)=>{const m=/^st:(\d)/.exec(a);if(m){s.on[+m[1]]=1;return true}}});
})();

/* ================================================================ 13. Which mountain is tallest? */
(function(){
/* name, latitude, height above sea (m), height from its own base (m), colour of its rock */
const M=[["Everest",27.99,8849,4600,"#7d7368"],["K2",35.88,8611,3800,"#857a6c"],["Chimborazo",-1.47,6263,3700,"#6f6a66"],["Kilimanjaro",-3.07,5895,4900,"#6b5f55"],["Denali",63.07,6190,5500,"#8a8378"],["Mauna Kea",19.82,4207,10210,"#5b4a40"]];
const A=6378.137,B=6356.752;/* WGS 84, km */
const rC=(lat,h)=>{const f=lat*R,c=Math.cos(f),s=Math.sin(f);return Math.sqrt(((A*A*c)**2+(B*B*s)**2)/((A*c)**2+(B*s)**2))+h/1000};
/* a jagged mountain outline from a seed */
function peak(cx,base,top,hw,seed,snow){const n=26,pts=[],sn=[];for(let i=0;i<=n;i++){const u=i/n*2-1,env=Math.pow(1-Math.abs(u),1.25),j=(rnd(seed*13+i*3.7)-.5)*.16*(1-Math.abs(u)*.6);pts.push([cx+u*hw,base-(top-0)*Math.max(0,env+j*env)])}
 return pts}
const TABS=["Above sea level","From its base","From Earth’s centre"];
make("tallest",{title:"Which mountain is tallest? It depends how you measure",cat:"plates",h:206,tabs:TABS,
 src:"Everest 8,849 m (China–Nepal survey, 2020); K2 8,611 m; Chimborazo 6,263 m (IGM Ecuador); Kilimanjaro 5,895 m; Denali 6,190 m (USGS 2015); Mauna Kea 4,207 m, about 10,200 m from the sea floor (USGS). Bases rounded. Distances from the centre worked out on the WGS 84 ellipsoid.",
 defs:()=>'<linearGradient id="dgTaSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fc3ec"/><stop offset="1" stop-color="#eaf4fb"/></linearGradient><linearGradient id="dgTaSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d8fd1"/><stop offset="1" stop-color="#173f6e"/></linearGradient><linearGradient id="dgTaSnow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#dfe9f2"/></linearGradient>',
 frame:()=>'<rect x="6" y="26" width="288" height="128" rx="8" fill="url(#dgTaSky)"/><clipPath id="dgTaClip"><rect x="6" y="26" width="288" height="128" rx="8"/></clipPath><g class="ta-g" clip-path="url(#dgTaClip)"></g><rect x="6" y="26" width="288" height="128" rx="8" fill="none" stroke="#9fb2c4" stroke-width=".6"/><g class="ta-l"></g>'+
  '<text class="ta-big" x="8" y="166" font-size="8.4" font-weight="900" fill="'+INK+'"></text>'+para("ta-tx",8,169,286,22,6.3)+hint(8,202,"Switch the way of measuring, and drag the dashed line to compare heights"),
 state:()=>({y:60}),
 draw:(svg,s)=>{const t=s.tab;let h="",lab="";const X=[34,80,126,170,214,262],Y1=150,Y0=34;
  if(t<2){const max=t===0?10200:11200,ys=v=>Y1-v/max*(Y1-Y0)*(t===1?.98:1),sea=t===0?Y1:Y1;
   if(t===0)h+='<rect x="236" y="'+(Y1-3)+'" width="60" height="8" fill="url(#'+uid(svg,"dgTaSea")+')"/>';
   M.forEach((m,i)=>{const v=t===0?m[2]:m[3],top=Y1-ys(v)+0,base=t===1?Y1:Y1,hw=t===1&&i===5?30:20+v/max*12,pts=peak(X[i],Y1,Y1-ys(v)===0?0:(Y1-ys(v)),hw,i+3);
    if(t===1&&i===5){const sl=ys(6000);h+='<rect x="'+(X[i]-34)+'" y="'+f1(sl)+'" width="68" height="'+f1(Y1-sl)+'" fill="url(#'+uid(svg,"dgTaSea")+')" opacity=".9"/>';lab+=T(X[i]+33,f1(sl-2),"sea level",'text-anchor="end" font-size="5.2" font-weight="800" fill="#1d4f86"')}
    h+='<path d="'+ln(pts)+'Z" fill="'+m[4]+'" stroke="#3a322c" stroke-width=".4"/>';
    const snowLine=t===0?ys(5000):-1;const sp=pts.filter(p=>p[1]<snowLine);if(sp.length>2)h+='<path d="'+ln(sp)+'Z" fill="url(#'+uid(svg,"dgTaSnow")+')"/>';
    if(t===1&&i===5)h+='<rect x="'+(X[i]-34)+'" y="'+f1(ys(6000))+'" width="68" height="'+f1(Y1-ys(6000))+'" fill="#3d8fd1" opacity=".35"/>';
    lab+=T(X[i],f1(ys(v)-9),m[0],'text-anchor="middle" font-size="6" font-weight="900" fill="'+INK+'"')+T(X[i],f1(ys(v)-2),fmt(v)+" m",'text-anchor="middle" font-size="5.6" font-weight="700" fill="'+SUB+'"')});
   const lv=Math.round((Y1-s.y)/(Y1-Y0)*max/50)*50;h+='<path d="M6,'+f1(s.y)+'H294" stroke="'+ACC+'" stroke-width="1" stroke-dasharray="4 2"/>';lab+='<g class="dg-handle" data-drag="y" transform="translate(284,'+f1(s.y)+')"><circle r="12" fill="transparent"/><circle r="5" fill="#fff" stroke="'+ACC+'" stroke-width="1.8"/></g>'+T(278,f1(s.y-3),fmt(lv)+" m",'text-anchor="end" font-size="6" font-weight="900" fill="'+ACC+'"');
   txt(svg,".ta-big",t===0?"Above sea level, Everest wins: 8,849 m":"From its base on the sea floor, Mauna Kea wins: about 10,200 m");
   setPara(svg,"ta-tx",t===0?"Heights on maps are measured from sea level. Everest’s summit is the highest point above it.":"Mauna Kea rises from the Pacific floor about 6,000 m down; Everest stands on the high Tibetan Plateau, so from foot to top it is only about 4,600 m.")}
  else{/* the Earth bulges at the Equator: a quarter of it, flattening hugely exaggerated */const cx=26,cy=150,ex=8,base=6355,k=1.9;
   const rp=lat=>(rC(lat,0)-base)*k*ex/ex+96;let arc=[];for(let l=0;l<=90;l+=3){const r=rp(l);arc.push([cx+Math.cos(l*R)*r*1.3,cy-Math.sin(l*R)*r*.95])}
   h+='<path d="M'+cx+','+cy+' '+ln(arc).replace("M","L")+'Z" fill="#c9b48a" stroke="#8e7a52" stroke-width=".6"/>'+T(cx+4,cy-4,"Earth’s centre (far below)",'font-size="5.4" fill="#5a4a2a"');
   M.forEach((m,i)=>{const l=Math.abs(m[1]),r0=rp(l),r1=r0+m[2]/1000*k*1.4,a=l*R,x0=cx+Math.cos(a)*r0*1.3,y0=cy-Math.sin(a)*r0*.95,x1=cx+Math.cos(a)*r1*1.3,y1=cy-Math.sin(a)*r1*.95;
    h+='<path d="M'+f1(x0)+','+f1(y0)+'L'+f1(x1)+','+f1(y1)+'" stroke="'+m[4]+'" stroke-width="5" stroke-linecap="round"/>';const eq=l<5,ly=eq?(m[0]==="Chimborazo"?y1-22:y1-12):y1+2;lab+=(eq?'<path d="M'+f1(x1)+','+f1(y1-2)+'L'+f1(x1-2)+','+f1(ly+2)+'" stroke="#9fb2c4" stroke-width=".5"/>':"")+T(f1(eq?x1-3:x1+4),f1(ly),m[0]+" "+rC(m[1],m[2]).toFixed(1)+" km",'font-size="5.6" font-weight="800" fill="'+INK+'"'+(eq?' text-anchor="end"':""))});
   lab+=T(150,40,"(the bulge is drawn many times bigger than it is)",'text-anchor="middle" font-size="5.4" fill="'+SUB+'"');
   txt(svg,".ta-big","From the centre of the Earth, Chimborazo wins: 6,384.4 km");
   setPara(svg,"ta-tx","The Earth bulges at the Equator: its radius there is 21 km longer than at the poles. Chimborazo sits almost on the Equator, so its top is the point furthest from the centre, about 2 km further out than Everest’s.")}
  setHTML(svg,".ta-g",h);setHTML(svg,".ta-l",lab)},
 drag:(svg,s,n,x,y)=>{s.y=clamp(y,36,150)}});
})();

/* rebuild a diagram's fixed parts for its current tab, keeping its state (for diagrams whose frame differs by tab) */
function rebuild(svg,key){const s=svg._s;if(!s)return;const D=DG[key];const tmp=document.createElement("div");let h=D.svg(String(s.tab));h=typeof dgPaint==="function"?dgPaint(h):h;
 /* keep the unique ids the figure was given */
 const m=/_(g\d+)"/.exec(svg.innerHTML);if(m)h=h.replace(/id="(dg[A-Za-z0-9_]*)"/g,'id="$1_'+m[1]+'"').replace(/url\(#(dg[A-Za-z0-9_]*)\)/g,"url(#$1_"+m[1]+")");
 tmp.innerHTML=h;const ns=tmp.querySelector("svg");if(!ns)return;svg.innerHTML=ns.innerHTML;svg.setAttribute("viewBox",ns.getAttribute("viewBox"));D._d(svg,s);tabSel(svg,s.tab)}
window.GFSIM.rebuild=rebuild;

})();
