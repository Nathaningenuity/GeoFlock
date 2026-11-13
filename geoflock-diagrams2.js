/* GeoFlock: diagrams, round 2. Twelve comparison diagrams and simulations of change for the tours and the dictionary:
   kinds of volcano, a glacier that shrinks and grows (and the valleys ice carves), three shapes of delta, waves wearing
   back a coast, upwelling and El Niño, how a city spreads, a waterfall that walks backwards, kinds of fault, three ways
   to make rain, soils compared, how dry land turns to desert, and water underground.
   Each one is added to the shared registry DG (index.html), mapped to tour stops through PS_DIAG and shown in the
   dictionary by wrapping gfDictVis.visual (geoflock-dictvisual.js): a term with a photo keeps it, the diagram goes
   underneath. Loaded straight after geoflock-dictvisual.js. */
(function(){
"use strict";
if(typeof DG==="undefined"||typeof PS_DIAG==="undefined"||typeof dgTabs!=="function"||typeof dgFigure!=="function")return;
const INK="#1d3047",ACC="#e8701a",SUB="#5b6b80",WAT="#3d8fd1",PAN="#f3f6fa";
const T=(x,y,t,o)=>'<text x="'+x+'" y="'+y+'"'+(o?" "+o:"")+">"+t+"</text>";
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,f1=v=>(+v).toFixed(1);
const sstep=(a,b,v)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t)};
const q=(s,x)=>s.querySelector(x),txt=(s,x,t)=>{const e=q(s,x);if(e&&e.textContent!==t)e.textContent=t};
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");
const tip=t=>' data-tip="'+esc(t)+'"';
const uid=(svg,b)=>(q(svg,'[id^="'+b+'"]')||{}).id||b;
const fmt=n=>Math.round(n).toLocaleString("en-GB");
const show=(svg,sel,on)=>{svg.querySelectorAll(sel).forEach(e=>{e.style.display=on?"":"none"})};
const ln=pts=>pts.map((p,i)=>(i?"L":"M")+f1(p[0])+","+f1(p[1])).join("");
/* a seeded random number, so drawings stay the same from frame to frame */
const rnd=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)};
function simLoop(svg,fn){let last=performance.now(),vis=true;try{const io=new IntersectionObserver(es=>{vis=es[es.length-1].isIntersecting});io.observe(svg)}catch(e){}
  const tick=now=>{if(!svg.isConnected)return;const dt=Math.min(.1,(now-last)/1000);last=now;if(vis&&!document.hidden){try{fn(dt,now/1000)}catch(e){console.error(e);return}}requestAnimationFrame(tick)};requestAnimationFrame(tick)}
function slider(name,x,y,w,label){return '<g class="sm-sl g2-sl-'+name+'">'+T(x,y-6,label,'class="g2-sll-'+name+'" font-size="7.2" font-weight="700" fill="'+SUB+'"')+'<text class="sm-sv-'+name+'" x="'+(x+w)+'" y="'+(y-6)+'" font-size="7.6" font-weight="800" text-anchor="end" fill="'+INK+'"></text>'+
  '<rect x="'+x+'" y="'+(y-2)+'" width="'+w+'" height="4" rx="2" fill="#d6dee8"/><rect class="sm-fill-'+name+'" x="'+x+'" y="'+(y-2)+'" width="0" height="4" rx="2" fill="'+ACC+'"/>'+
  '<rect x="'+(x-6)+'" y="'+(y-9)+'" width="'+(w+12)+'" height="18" fill="transparent" data-drag="'+name+'"/>'+
  '<g class="dg-handle sm-knob-'+name+'" data-drag="'+name+'"><circle r="11" fill="transparent"/><circle r="5.6" fill="#fff" stroke="'+ACC+'" stroke-width="2"/></g></g>'}
function setSlider(svg,name,x,y,w,f,v){f=clamp(f,0,1);const k=q(svg,".sm-knob-"+name);if(k)k.setAttribute("transform","translate("+f1(x+w*f)+","+y+")");const fl=q(svg,".sm-fill-"+name);if(fl)fl.setAttribute("width",f1(w*f));txt(svg,".sm-sv-"+name,v)}
function btn(act,x,y,w,label,cls){return '<g data-act="'+act+'" class="sm-btn g2-btn-'+act+' '+(cls||"")+'" style="cursor:pointer"><rect x="'+x+'" y="'+y+'" width="'+w+'" height="15" rx="7.5" fill="'+INK+'"/><text class="sm-btn-t" x="'+(x+w/2)+'" y="'+(y+10.4)+'" font-size="7.2" font-weight="800" text-anchor="middle" fill="#fff">'+label+'</text></g>'}
function btnOn(svg,act,on){const r=q(svg,".g2-btn-"+act+" rect");if(r)r.style.fill=on?ACC:INK}
function tabSel(svg,i){svg.querySelectorAll(".dg-tab").forEach((t,j)=>{const on=j===i;t.classList.toggle("on",on);const r=t.querySelector("rect"),x=t.querySelector("text");if(r)r.style.fill=on?INK:"#fff";if(x)x.setAttribute("fill",on?"#fff":INK)})}
function tabIdx(a,cur,n){if(a==="tabnext")return(cur+1)%n;const m=/^tab:(\d+)/.exec(a);return m?+m[1]:null}
/* wrapped grey text */
function para(cls,x,y,w,h,size,col){return '<foreignObject x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'"><div xmlns="http://www.w3.org/1999/xhtml" class="'+cls+'" style="font:500 '+size+'px/1.32 Inter,system-ui,sans-serif;color:'+(col||SUB)+'"></div></foreignObject>'}
const setPara=(svg,cls,t)=>{const d=q(svg,"."+cls);if(d&&d.innerHTML!==t)d.innerHTML=t};
/* rows of label and value in the grey side panel */
function panel(x,y,w,h,cls,rows){let s='<g transform="translate('+x+','+y+')"><rect width="'+w+'" height="'+h+'" rx="9" fill="'+PAN+'"/><text class="'+cls+'-nm" x="7" y="13" font-size="8.4" font-weight="900" fill="'+INK+'"></text>';
  rows.forEach((r,i)=>{const yy=r[2];s+=T(7,yy,r[0],'class="'+cls+'-L'+r[1]+'" font-size="5.7" fill="'+SUB+'"')+'<text class="'+cls+'-'+r[1]+'" x="7" y="'+(yy+7.6)+'" font-size="6.5" font-weight="800" fill="'+INK+'"></text>'});return s+'</g>'}
/* a 0–8 explosivity meter */
function veiBar(x,y,w,cls){let s='<g class="'+cls+'">';for(let i=0;i<=8;i++)s+='<rect class="'+cls+'-c" x="'+f1(x+i*w/9)+'" y="'+y+'" width="'+f1(w/9-1)+'" height="7" rx="1.5" fill="#dfe6ee"/>';
  for(let i=0;i<=8;i+=2)s+=T(f1(x+i*w/9+w/18-.5),y+13.5,i,'font-size="5" text-anchor="middle" fill="'+SUB+'"');return s+'</g>'}
function setVei(svg,cls,a,b){const C=["#f6d04d","#f6c043","#f3a93a","#ee8c34","#e8701a","#de5a24","#cf4129","#b52d2d","#8e1f2f"];svg.querySelectorAll("."+cls+"-c").forEach((r,i)=>{r.style.fill=i>=a&&i<=b?C[i]:"#dfe6ee"})}
const add=(k,cat)=>{DG[k].cat=cat;try{if(!SIM_KEYS.includes(k))SIM_KEYS.push(k);if(!DG_ORDER.includes(k))DG_ORDER.push(k)}catch(e){}};
/* one diagram: o.tabs (optional), o.h (height), o.frame(tab) the fixed parts, o.draw(svg,s), o.tick, o.drag, o.act */
function make(key,o){const nT=o.tabs?o.tabs.length:1,t0=a=>clamp(parseInt(a,10)||0,0,nT-1);
  DG[key]={title:o.title,src:o.src,
   svg:a=>'<svg viewBox="0 0 300 '+o.h+'">'+(o.tabs?dgTabs(o.tabs,t0(a),4,8):"")+o.frame(t0(a))+'</svg>',
   _d:(svg,s)=>o.draw(svg,s,false),
   init:(svg,a)=>{svg._s=Object.assign({tab:t0(a)},o.state?o.state(t0(a),a):{});o.draw(svg,svg._s,true);if(o.tick)simLoop(svg,dt=>o.tick(svg,svg._s,dt))},
   drag:(svg,n,x,y)=>{const s=svg._s;if(s&&o.drag){o.drag(svg,s,n,x,y);o.draw(svg,s,false)}},
   act:(svg,a)=>{const s=svg._s;if(!s)return false;if(o.tabs){const i=tabIdx(a,s.tab,nT);if(i!=null){s.tab=i;tabSel(svg,i);if(o.onTab)o.onTab(svg,s);o.draw(svg,s,true);return true}}
     if(o.act&&o.act(svg,s,a)){o.draw(svg,s,true);return true}return false}}}

/* ================================================================ 1. Kinds of volcano */
(function(){
const VX=101,GY=128;
/* shape(u): height as a fraction of the top, for u = distance from the centre as a fraction of the half-width */
const V=[
 {k:"shield",nm:"Shield volcano",W:92,H:24,sh:u=>1-Math.pow(u,1.8),cr:.07,dep:.05,N:11,cols:["#5b4636","#6c5442"],runny:1,
  lava:"Basalt: hot and runny",si:"About 50% silica",sl:"Gentle: 2–10°",er:"Lava flows, fountains",vei:[0,1],ex:"Mauna Loa, Hawaii",ex2:"4,169 m high, 120 km across",bar:[60,"20 km"],
  p:"Runny basalt spreads far before it cools, so flow after flow builds a wide, gentle dome. Hawaii’s shield volcanoes are the biggest on Earth.",
  grow:g=>"about "+fmt(Math.round(g*70)*10)+",000 years",lab:"Build it, flow after flow"},
 {k:"strato",nm:"Stratovolcano",W:84,H:80,sh:u=>Math.pow(1-u,1.45),cr:.09,dep:.07,N:9,cols:["#4f3e32","#a39383"],
  lava:"Andesite: thick, sticky",si:"About 60% silica",sl:"Steep: up to 30–35°",er:"Ash, blasts and lava",vei:[2,6],ex:"Mount Fuji, Japan",ex2:"3,776 m high, last erupted 1707",bar:[40,"10 km"],
  p:"Sticky lava cannot flow far, so it piles up steeply. Layers of ash and lava take turns, which is why it is also called a composite volcano, and trapped gas can blow out violently.",
  grow:g=>"about "+fmt(Math.round(g*10)*10)+",000 years",lab:"Build it, layer by layer"},
 {k:"cinder",nm:"Cinder cone",W:54,H:36,sh:u=>1-u,cr:.26,dep:.16,N:7,cols:["#3b2f2a","#5a4639"],
  lava:"Basalt, full of gas",si:"About 50–55% silica",sl:"Straight: about 33°",er:"Fountains of cinders",vei:[1,2],ex:"Parícutin, Mexico",ex2:"424 m, grew 1943–1952",bar:[50,"500 m"],
  p:"Gassy lava is thrown up in fountains and falls back as cinders, which pile into a small, steep cone. Lava often leaks out from its base: at Parícutin it buried two villages.",lab:"Watch Parícutin grow"},
 {k:"caldera",nm:"Caldera",W:88,H:78,sh:u=>Math.pow(1-u,1.45),cr:.09,dep:.07,N:8,cols:["#4f3e32","#a39383"],
  lava:"Rhyolite, dacite: stiff",si:"About 65–75% silica",sl:"A basin with cliff walls",er:"Giant blasts, then collapse",vei:[6,8],ex:"Crater Lake, USA",ex2:"8–10 km wide, 594 m deep",bar:[40,"5 km"],lab:"Crater Lake, step by step"},
 {k:"dome",nm:"Lava dome",W:84,H:58,sh:u=>Math.pow(1-u,1.3),cr:.34,dep:.26,N:6,cols:["#5d5148","#8c7f73"],
  lava:"Dacite: too stiff to flow",si:"About 63–68% silica",sl:"Steep, bulging sides",er:"Oozes, then can collapse",vei:[0,3],ex:"Mount St Helens, USA",ex2:"domes grew 1980–86, 2004–08",bar:[40,"2 km"],
  p:"Lava too stiff to flow squeezes out like toothpaste and piles up over the vent. A dome can grow for years, and if it collapses it sends out deadly avalanches of hot rock and gas.",lab:"Watch the dome grow"},
 {k:"fissure",nm:"Fissure eruption",W:0,H:0,runny:1,
  lava:"Basalt: very runny",si:"About 50% silica",sl:"Almost flat sheets",er:"Curtains of fire",vei:[0,1],ex:"Laki, Iceland, 1783",ex2:"a crack 27 km long",bar:[50,"10 km"],
  p:"Lava pours out of a long crack instead of one vent. Flood after flood stacks up flat layers: India’s Deccan Traps are up to 2 km thick and wear into steps.",
  grow:g=>Math.max(1,Math.round(g*9))+" lava floods",lab:"Flood after flood"},
 {k:"all",nm:"Side by side"}];
const CAL=[["Mount Mazama","A tall stratovolcano, about 3,700 m high, with a large chamber of sticky magma below."],
 ["7,700 years ago: the blast","A giant eruption (VEI 7) empties the magma chamber, spreading ash over eight US states and Canada."],
 ["The top falls in","With nothing left to hold it up, the summit collapses into the empty chamber: a caldera, 8–10 km wide."],
 ["Crater Lake today","Rain and snow fill the caldera with the deepest lake in the USA, 594 m. Wizard Island is a later cinder cone."]];
/* Parícutin: about 50 m after one day, 336 m after a year, 424 m when it stopped in 1952 */
const pariH=t=>t<1?336*Math.pow(Math.max(t,0),.36):336+88*(t-1)/8;
const prof=(D,g,x)=>{const W=D.W*g,u=Math.abs(x)/W;if(u>=1)return 0;const H=D.H*g,c=D.cr;let s=D.sh(u);if(u<c){const top=D.sh(c);s=top-D.dep*(1-Math.pow(u/c,2))}return H*s};
function cone(D,g,x0,dx){const W=D.W*g,pts=[];for(let i=0;i<=60;i++){const x=-W+2*W*i/60;pts.push([x0+x,GY-prof(D,g,x)])}return pts}
make("vtypes",{title:"Kinds of volcano: shape, lava and blast",
 src:"Silica, slopes and typical Volcanic Explosivity Index (VEI) from the USGS Volcano Hazards Program and the Smithsonian Global Volcanism Program. Parícutin’s growth from USGS accounts; Crater Lake from the US National Park Service. Each tab has its own scale bar; heights are stretched to show the shapes",
 tabs:["Shield","Strato","Cinder","Caldera","Dome","Fissure","Compare"],h:218,
 state:()=>({g:1,t:0,P:[],acc:0}),
 frame:()=>{let h='<defs><linearGradient id="dgVtSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8cc3ea"/><stop offset="1" stop-color="#e3f1fb"/></linearGradient><linearGradient id="dgVtMag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffcf5a"/><stop offset="1" stop-color="#d63b16"/></linearGradient><clipPath id="dgVtClip"><rect x="6" y="26" width="190" height="146" rx="8"/></clipPath></defs>';
  h+='<g clip-path="url(#dgVtClip)"><rect x="6" y="26" width="190" height="146" fill="url(#dgVtSky)"/><g class="vt-sea"></g><rect x="6" y="'+GY+'" width="190" height="44" fill="#a0826a"/>';
  for(let i=0;i<3;i++)h+='<path d="M6,'+(GY+10+i*11)+' q48,'+(i%2?3:-3)+' 95,0 t95,0" fill="none" stroke="#8a6d55" stroke-width="1" opacity=".55"/>';
  h+='<g class="vt-body"></g><g class="vt-fx"></g></g><g class="vt-lab"></g>';
  h+=panel(202,26,94,146,"vt",[["Lava","lv",26],["Silica in the magma","si",43],["Slopes","sl",60],["Eruptions","er",77]]);
  h+='<g transform="translate(202,26)">'+T(7,96,"How explosive (VEI)",'class="vt-veil" font-size="5.7" fill="'+SUB+'"')+veiBar(7,99,80,"vt-vei")+T(7,124,"Example",'class="vt-exl" font-size="5.7" fill="'+SUB+'"')+'<text class="vt-ex" x="7" y="131.6" font-size="6.5" font-weight="800" fill="'+INK+'"></text><text class="vt-ex2" x="7" y="140" font-size="5.6" fill="'+SUB+'"></text></g>';
  h+=para("vt-p",8,175,288,24,6.3);
  h+='<g class="vt-slw">'+slider("g",14,208,272,"Build it")+'</g>';return h},
 draw:(svg,s)=>{const D=V[s.tab];show(svg,".vt-slw",D.k!=="all");
  const all=D.k==="all",LB=all?["Mauna Loa (shield)","Mount Fuji (strato)","Parícutin (cinder cone)","Crater Lake (caldera)"]:["Lava","Silica in the magma","Slopes","Eruptions"],
   VL=all?["120 km across, 9 km tall","40 km across, 3.8 km tall","1 km across, 424 m tall","a hole 8–10 km wide"]:[D.lava,D.si,D.sl,D.er];
  txt(svg,".vt-nm",all?"How big?":D.nm);["lv","si","sl","er"].forEach((c,i)=>{txt(svg,".vt-"+c,VL[i]);txt(svg,".vt-L"+c,LB[i])});
  txt(svg,".vt-exl",all?"Yellowstone (caldera)":"Example");txt(svg,".vt-veil",all?"":"How explosive (VEI)");
  txt(svg,".vt-ex",all?"about 70 km long":D.ex||"");txt(svg,".vt-ex2",all?"wider than Mount Fuji":D.ex2||"");if(D.vei)setVei(svg,"vt-vei",D.vei[0],D.vei[1]);else setVei(svg,"vt-vei",-1,-1);
  show(svg,".vt-vei",!!D.vei);
  let body="",lab="",sea="",p=D.p||"",val="";const g=clamp(s.g,.04,1);
  const scale=(len,txt2)=>'<g><line x1="14" x2="'+(14+len)+'" y1="164" y2="164" stroke="#fff" stroke-width="2.2"/><line x1="14" x2="14" y1="160.5" y2="167.5" stroke="#fff" stroke-width="1.4"/><line x1="'+(14+len)+'" x2="'+(14+len)+'" y1="160.5" y2="167.5" stroke="#fff" stroke-width="1.4"/>'+T(16+len,166.4,txt2,'font-size="6.2" font-weight="800" fill="#fff"')+'</g>';
  const chamber=(rx,ry,fill)=>'<ellipse cx="'+VX+'" cy="'+(GY+28)+'" rx="'+rx+'" ry="'+ry+'" fill="'+(fill==null?"url(#"+uid(svg,"dgVtMag")+")":fill)+'"'+tip("Magma chamber: molten rock a few kilometres down")+'/>'+T(VX,GY+30,"magma",'font-size="5.6" text-anchor="middle" fill="#fff3d6"');
  const pipe=top=>'<path d="M'+(VX-2.2)+','+(GY+22)+' L'+(VX-1.6)+','+f1(top)+' L'+(VX+1.6)+','+f1(top)+' L'+(VX+2.2)+','+(GY+22)+'Z" fill="url(#'+uid(svg,"dgVtMag")+')"/>';
  const shells=(D,g)=>{let b="";const N=D.N;const fs=[];for(let i=N;i>=1;i--){const f=g*i/N;if(f>.02)fs.push(f)}
    fs.forEach((f,j)=>{const pts=cone(D,f,VX);b+='<path d="'+ln(pts)+'Z" fill="'+D.cols[j%2]+'"'+(j===0?tip(D.nm+": "+D.ex):"")+'/>'});return b};
  if(D.k==="shield"||D.k==="strato"){body+=chamber(D.k==="shield"?34:28,D.k==="shield"?6:8)+shells(D,g)+pipe(GY-prof(D,g,0)+1);val=D.grow(g);
    body+=scale(D.bar[0],D.bar[1]);if(D.k==="strato")lab+=T(VX+26*g,GY-12*g,"ash and lava layers",'font-size="5.8" font-weight="800" fill="#fff"')}
  else if(D.k==="cinder"){const t=9*g*g,hm=pariH(t),gg=clamp(hm/424,.03,1);body+=chamber(20,5);
    if(t>.4){const L=8+30*clamp((t-.4)/3,0,1);body+='<path d="M'+f1(VX+D.W*gg*.6)+','+GY+' L'+f1(VX+D.W*gg*.6)+','+(GY-4)+' Q'+f1(VX+D.W*gg+L*.5)+','+(GY-7)+' '+f1(VX+D.W*gg+L)+','+(GY-3)+' L'+f1(VX+D.W*gg+L+3)+','+(GY+.5)+'Z" fill="#2a201c" stroke="#ff7b1f" stroke-width=".6"'+tip("Lava flows from the base buried the villages of Parícutin and San Juan Parangaricutiro")+'/>';
      if(t>3)lab+=T(f1(VX+D.W*gg+L*.5),GY-10,"lava flow",'font-size="5.8" font-weight="700" text-anchor="middle" fill="'+INK+'"')}
    body+=shells(D,gg)+pipe(GY-prof(D,gg,0)+1);const d=new Date(Date.UTC(1943,1,20)+t*365.25*864e5);
    val=(t<.02?"20 February 1943":t>=8.95?"1952: it stops":d.toLocaleDateString("en-GB",{month:"short",year:"numeric",timeZone:"UTC"}))+" · "+fmt(hm)+" m";body+=scale(D.bar[0]*.8,"400 m")}
  else if(D.k==="caldera"){const st=Math.round(g*3);val=CAL[st][0];p=CAL[st][1];
    if(st<=1){body+=chamber(42,10)+shells(D,1)+pipe(GY-prof(D,1,0)+1);if(st===1)body+='<path d="M'+(VX-6)+','+(GY-D.H+6)+' C'+(VX-30)+','+(GY-D.H*.6)+' '+(VX-60)+','+(GY-20)+' '+(VX-92)+','+(GY-2)+' L'+(VX-80)+','+GY+' C'+(VX-50)+','+(GY-12)+' '+(VX-24)+','+(GY-D.H*.5)+' '+VX+','+(GY-D.H+8)+'Z" fill="#8f8a85" opacity=".8"/><path d="M'+(VX+6)+','+(GY-D.H+6)+' C'+(VX+30)+','+(GY-D.H*.6)+' '+(VX+60)+','+(GY-20)+' '+(VX+92)+','+(GY-2)+' L'+(VX+80)+','+GY+' C'+(VX+50)+','+(GY-12)+' '+(VX+24)+','+(GY-D.H*.5)+' '+VX+','+(GY-D.H+8)+'Z" fill="#8f8a85" opacity=".8"/>'}
    else{const R=26,floor=GY-D.H*.2,cut=x=>{const h=prof(D,1,x),rim=D.H*D.sh(R/D.W)*.92;return Math.min(h,rim)};
      body+='<ellipse cx="'+VX+'" cy="'+(GY+28)+'" rx="42" ry="10" fill="#6e5a4a" stroke="#d63b16" stroke-width=".8" stroke-dasharray="2 2"'+tip("The emptied magma chamber")+'/>'+T(VX,GY+30,"empty chamber",'font-size="5.6" text-anchor="middle" fill="#ffe2c4"');
      const pts=[];for(let i=0;i<=80;i++){const x=-D.W+2*D.W*i/80;let y;if(Math.abs(x)<R)y=floor;else if(Math.abs(x)<R+9){const k=(Math.abs(x)-R)/9;y=lerp(floor,GY-cut(x),k)}else y=GY-cut(x);pts.push([VX+x,y])}
      body+='<path d="'+ln(pts)+'Z" fill="#6c5442"'+tip("The caldera: the summit collapsed into the emptied chamber")+'/>';
      body+='<path d="M'+(VX-R)+','+floor+' L'+(VX-R+6)+','+(GY+20)+' M'+(VX+R)+','+floor+' L'+(VX+R-6)+','+(GY+20)+'" stroke="#2c2018" stroke-width="1" stroke-dasharray="3 2"/>';
      for(let i=0;i<5;i++)body+='<path d="M'+f1(VX-R+4+i*10)+','+f1(floor)+' l3,-4 l5,1 l2,3Z" fill="#4f3e32"/>';
      if(st===3){const rimY=GY-cut(R+9),lv=lerp(floor,rimY,.7),lw=R+9*.7;body+='<path d="M'+f1(VX-lw)+','+f1(lv)+' L'+f1(VX+lw)+','+f1(lv)+' L'+(VX+R)+','+floor+' L'+(VX-R)+','+floor+'Z" fill="#2a74c4"'+tip("Crater Lake: 594 m deep, the deepest lake in the USA")+'/><path d="M'+(VX+4)+','+f1(lv)+' l5,-6 l3,0 l5,6Z" fill="#3b2f2a"'+tip("Wizard Island: a cinder cone that grew inside the caldera")+'/>';lab+=T(VX,f1(lv+10),"Crater Lake",'font-size="6.4" font-weight="800" text-anchor="middle" fill="#fff"')}
      const ry=GY-cut(R+9)-7;lab+=T(VX,f1(ry-3),"8–10 km",'font-size="6" font-weight="800" text-anchor="middle" fill="'+INK+'"')+'<path d="M'+(VX-R-9)+','+f1(ry)+' h'+(2*R+18)+'" stroke="'+INK+'" stroke-width=".7"/>'}
    body+=scale(D.bar[0],D.bar[1])}
  else if(D.k==="dome"){const yr=1980+28*g,sz1=clamp((yr-1980.8)/5.5,0,1),sz2=clamp((yr-2004.7)/3.4,0,1);
    body+=chamber(26,7)+shells(D,1)+pipe(GY-prof(D,1,0)+2);const fl=GY-prof(D,1,0);
    const dome=(cx,w,hh,c,tp)=>w>0?'<path d="M'+f1(cx-w)+','+f1(fl+1)+' C'+f1(cx-w)+','+f1(fl-hh*1.1)+' '+f1(cx+w)+','+f1(fl-hh*1.1)+' '+f1(cx+w)+','+f1(fl+1)+'Z" fill="'+c+'" stroke="#3b2f2a" stroke-width=".6"'+tip(tp)+'/>':"";
    body+=dome(VX-2,11*sz1,9*sz1,"#7a6d62","The 1980–86 dome: about 74 million m³ of stiff lava, 267 m high")+dome(VX+7,12*sz2,11*sz2,"#94877b","The 2004–08 dome: about 93 million m³");
    if(sz1>.2)lab+=T(VX-34,fl-14,"lava dome",'font-size="6" font-weight="800" text-anchor="end" fill="'+INK+'"')+'<path d="M'+(VX-33)+','+(fl-12)+' L'+(VX-8)+','+(fl-3)+'" stroke="'+INK+'" stroke-width=".6"/>';
    lab+=T(VX+D.W*.62,GY-D.H*.52,"crater left by 1980",'font-size="5.6" font-weight="700" fill="'+INK+'"');
    val=Math.floor(yr)+(yr<1986.3?": growing":yr<2004.7?": quiet":yr<2008?": a new dome":": stops");body+=scale(D.bar[0],D.bar[1])}
  else if(D.k==="fissure"){const n=Math.max(1,Math.round(g*9));val=D.grow(g);
    body+='<path d="M'+VX+','+(GY+40)+' L'+(VX-1.6)+','+GY+' L'+(VX+1.6)+','+GY+'Z" fill="url(#'+uid(svg,"dgVtMag")+')"/>';
    for(let i=0;i<n;i++){const y0=GY-i*5.2,w=88-i*3.2-rnd(i)*6,st=4+rnd(i+9)*3;const c=i%2?"#4a3a30":"#5c4a3d";
      body+='<path d="M'+f1(VX-w)+','+f1(y0)+' L'+f1(VX-w+st)+','+f1(y0-5.2)+' L'+f1(VX+w-st)+','+f1(y0-5.2)+' L'+f1(VX+w)+','+f1(y0)+'Z" fill="'+c+'"'+(i===n-1?tip("Each layer is one flood of lava, often several metres thick"):"")+'/>'}
    lab+=T(VX+60,GY-n*5.2-6,"flat lava layers",'font-size="5.8" font-weight="700" text-anchor="middle" fill="'+INK+'"');body+=scale(D.bar[0],D.bar[1])}
  else{/* side by side, 1.3 px per km across, heights ×5 */const k=1.02,v=k*5,B=152;p="Drawn to one scale, with heights stretched 5 times. A cinder cone is a speck next to a shield volcano, and Yellowstone’s caldera, about 70 km long, is wider than Mount Fuji.";
    sea='<rect x="6" y="'+f1(B-5*v)+'" width="190" height="'+f1(5*v+20)+'" fill="#2d6ea8" opacity=".55"/>';
    const sh=(x0,W,H,fn,c,tp)=>{const pts=[];for(let i=0;i<=50;i++){const u=-1+2*i/50;pts.push([x0+u*W*k/2,B-H*v*fn(Math.abs(u))])}return '<path d="'+ln(pts)+'Z" fill="'+c+'"'+tip(tp)+'/>'};
    body+='<rect x="6" y="'+B+'" width="190" height="30" fill="#a0826a"/>';
    body+=sh(10+60*k,120,9.2,u=>1-Math.pow(u,1.8),"#5b4636","Mauna Loa: about 9 km from the sea floor to the top, 4,169 m of it above sea level");
    const L=B-5*v;lab+=T(10+60*k,f1(B-9.2*v-4),"Mauna Loa",'font-size="6.4" font-weight="800" text-anchor="middle" fill="'+INK+'"')+T(12,f1(L-2),"sea level",'font-size="5.4" fill="#1d5f99"');
    body+='<rect x="'+f1(10+120*k+4)+'" y="'+f1(L)+'" width="'+f1(190)+'" height="'+f1(B-L)+'" fill="#a0826a"/>';
    const Fx=10+120*k+3+20*k;body+=sh(Fx,40,3.3,u=>Math.pow(1-u,1.45),"#6c5442","Mount Fuji: 3,776 m high, about 40 km across");
    lab+=T(f1(Fx),f1(L-3.3*v-3),"Fuji",'font-size="6.4" font-weight="800" text-anchor="middle" fill="'+INK+'"');
    const Px=Fx+20*k+8;body+='<path d="M'+f1(Px-1)+','+f1(L)+' L'+f1(Px)+','+f1(L-.42*v)+' L'+f1(Px+1)+','+f1(L)+'Z" fill="#2f2622"'+tip("Parícutin: 424 m high, about 1 km across")+'/>';
    lab+='<path d="M'+f1(Px)+','+f1(L-3)+' L'+f1(Px)+','+f1(L-20)+'" stroke="'+INK+'" stroke-width=".6"/>'+T(f1(Px),f1(L-22),"Parícutin",'font-size="5.8" font-weight="800" text-anchor="middle" fill="'+INK+'"');
    const Yx0=12,Yx1=12+70*k;lab+='<path d="M'+Yx0+',166 L'+f1(Yx1)+',166 M'+Yx0+',163 v6 M'+f1(Yx1)+',163 v6" stroke="#fff" stroke-width="1.3"/>'+T(f1(Yx1+4),168,"Yellowstone’s caldera, 70 km",'font-size="6" font-weight="800" fill="#fff"')}
  setPara(svg,"vt-p",p);const S=q(svg,".vt-sea");if(S)S.innerHTML=sea;const Bd=q(svg,".vt-body");if(Bd)Bd.innerHTML=body;const Lb=q(svg,".vt-lab");if(Lb)Lb.innerHTML=lab;
  if(D.lab)txt(svg,".g2-sll-g",D.lab);setSlider(svg,"g",14,208,272,s.g,val);s.top=D.k==="all"?null:D.k==="cinder"?GY-prof(D,clamp(pariH(9*g*g)/424,.03,1),0):D.k==="fissure"?GY:D.k==="caldera"?(Math.round(g*3)===1?GY-D.H:null):D.k==="dome"?null:GY-prof(D,g,0)},
 onTab:(svg,s)=>{s.g=1;s.P=[]},
 drag:(svg,s,n,x)=>{if(n==="g")s.g=clamp((x-14)/272,0,1)},
 tick:(svg,s,dt)=>{const D=V[s.tab],fx=q(svg,".vt-fx");if(!fx)return;s.t+=dt;let h="";if(s.top==null||D.k==="all"){if(fx.innerHTML)fx.innerHTML="";return}
  const top=s.top,g=clamp(s.g,.04,1);
  if(D.k==="shield"){const off=(s.t*16)%14;const W=D.W*g,pa=[];for(let i=0;i<=20;i++){const x=W*.85*i/20;pa.push([VX+x+1,GY-prof(D,g,x)-.8])}
    h+='<path d="'+ln(pa)+'" fill="none" stroke="#ff7b1f" stroke-width="2.2" stroke-dasharray="7 7" stroke-dashoffset="'+f1(-off)+'"/>';const pb=pa.map(p=>[2*VX-p[0],p[1]]);h+='<path d="'+ln(pb)+'" fill="none" stroke="#ffb43a" stroke-width="1.6" stroke-dasharray="5 9" stroke-dashoffset="'+f1(-off*.8)+'"/>'}
  if(D.k==="fissure"){const n=Math.max(1,Math.round(g*9)),y=GY-n*5.2;for(let i=0;i<14;i++){const x=VX-32+i*4.6,hh=6+7*Math.abs(Math.sin(s.t*6+i*1.7));h+='<path d="M'+f1(x-1.6)+','+f1(y)+' Q'+f1(x)+','+f1(y-hh*2)+' '+f1(x+1.6)+','+f1(y)+'Z" fill="#ff8a1f" opacity=".9"/>'}
    const off=(s.t*14)%12;h+='<path d="M'+(VX-34)+','+f1(y+1)+' L'+(VX-80)+','+f1(y+1)+' M'+(VX+34)+','+f1(y+1)+' L'+(VX+80)+','+f1(y+1)+'" stroke="#ff7b1f" stroke-width="1.6" stroke-dasharray="6 6" stroke-dashoffset="'+f1(-off)+'"/>'}
  /* puffs and cinders */
  const exp=D.k==="strato"||D.k==="caldera",cin=D.k==="cinder";
  if(exp||cin){s.acc+=dt*(D.k==="caldera"?40:cin?26:7);while(s.acc>1){s.acc--;if(cin&&Math.random()<.7)s.P.push({c:1,x:VX+(Math.random()-.5)*4,y:top,vx:(Math.random()-.5)*36,vy:-lerp(30,62,Math.random()),l:0,m:1.4});
      else s.P.push({c:0,x:VX+(Math.random()-.5)*5,y:top,vx:(Math.random()-.5)*8+4,vy:-lerp(14,30,Math.random())*(D.k==="caldera"?2.2:1),r:lerp(3,5,Math.random()),l:0,m:D.k==="caldera"?2.8:3.4})}}
  if(s.P.length>120)s.P.splice(0,s.P.length-120);
  s.P=s.P.filter(p=>{p.l+=dt;if(p.l>p.m)return false;if(p.c){p.vy+=70*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.y>GY)return false;h+='<circle cx="'+f1(p.x)+'" cy="'+f1(p.y)+'" r="1.3" fill="'+(p.l<.4?"#ffcf5a":"#3b2f2a")+'"/>';return true}
    p.x+=p.vx*dt;p.y+=p.vy*dt;p.r+=dt*(D.k==="caldera"?9:4);h+='<circle cx="'+f1(p.x)+'" cy="'+f1(p.y)+'" r="'+f1(p.r)+'" fill="#8a8580" fill-opacity="'+f1(Math.max(0,.7-p.l/p.m*.65))+'"/>';return p.y>20});
  fx.innerHTML=h}});
add("vtypes","plates");
})();

/* ================================================================ 2. A glacier shrinks and grows; how ice carves a valley */
(function(){
/* ice left in Alpine glaciers, % of 1850: rough, after GLAMOS (Swiss glacier monitoring) and Zekollari et al. (2019) */
const PAST=[[1850,100],[1880,93],[1920,83],[1950,72],[1975,65],[1985,64],[2000,55],[2010,47],[2020,40],[2025,36]];
const LOW=[[2025,36],[2050,26],[2075,18],[2100,14]],HIGH=[[2025,36],[2050,20],[2075,8],[2100,3]];
const tab=(t,y)=>{for(let i=1;i<t.length;i++)if(y<=t[i][0]){const a=t[i-1],b=t[i];return lerp(a[1],b[1],(y-a[0])/(b[0]-a[0]))}return t[t.length-1][1]};
const vol=(y,hi)=>y<=2025?tab(PAST,y):tab(hi?HIGH:LOW,y);
const X0=12,bed=x=>{const u=(x-6)/290;let y=62+80*Math.pow(u,.9);y+=6*Math.exp(-Math.pow((x-238)/11,2));return y},MOR=258;
const bedM=x=>bed(x)-7.5*Math.exp(-Math.pow((x-MOR)/7,2));
const term=v=>X0+(MOR-X0-4)*Math.pow(v/100,.7);
const STAGE=[[0,"A river valley","Rivers cut down into the land, leaving a narrow V-shaped valley with a stream at the bottom."],
 [.33,"An ice age","Snow piles up and turns to ice. The glacier fills the valley and grinds its sides and floor with the rocks frozen into it."],
 [.6,"The ice melts","A wide U-shaped valley is left, with steep walls. Side valleys that held smaller glaciers now hang high above, with waterfalls."],
 [.85,"The sea comes in","If the valley reaches the coast, the sea floods it: a fjord. Inland, the deep hollow fills with a long lake instead."]];
make("glacier",{title:"A glacier shrinks and grows",
 src:"A model valley glacier. Ice left in the Alps as a share of 1850, roughly, after GLAMOS (Swiss glacier monitoring) and Zekollari and others (2019); 2100 for low (Paris-style) and high emissions. Valley shapes are schematic",
 tabs:["Advance and retreat","How ice carves a valley"],h:214,
 state:t=>({yr:.7,hi:0,st:.5,t:0}),
 frame:()=>{let h='<defs><linearGradient id="dgGlSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9cc8ea"/><stop offset="1" stop-color="#eaf4fb"/></linearGradient><clipPath id="dgGlClip"><rect x="6" y="26" width="290" height="140" rx="8"/></clipPath></defs>';
  h+='<g clip-path="url(#dgGlClip)"><rect x="6" y="26" width="290" height="140" fill="url(#dgGlSky)"/><g class="gl-a"></g><g class="gl-b"></g><g class="gl-fx"></g></g>';
  h+='<g class="gl-ta"><text class="gl-yr" x="14" y="44" font-size="14" font-weight="900" fill="'+INK+'"></text><text class="gl-ev" x="14" y="54" font-size="6.6" font-weight="700" fill="'+SUB+'"></text>';
  h+='<g transform="translate(206,32)"><rect width="84" height="34" rx="7" fill="#fff" fill-opacity=".85"/>'+T(6,10,"Ice left (1850 = 100%)",'font-size="5.6" fill="'+SUB+'"')+'<text class="gl-v" x="6" y="22" font-size="10" font-weight="900" fill="'+INK+'"></text><rect x="6" y="26" width="72" height="4" rx="2" fill="#dfe6ee"/><rect class="gl-vb" x="6" y="26" width="72" height="4" rx="2" fill="#5aa9e6"/></g>';
  h+=btn("lo",8,172,92,"Low emissions")+btn("hi",104,172,92,"High emissions")+T(202,182,"choose a future after 2025",'font-size="6" fill="'+SUB+'"')+'</g>';
  h+='<g class="gl-tb">'+para("gl-p",8,170,288,26,6.4)+'</g>';
  h+=slider("y",14,206,272,"Year");return h},
 onTab:(svg,s)=>{},
 draw:(svg,s)=>{const A=q(svg,".gl-a"),B=q(svg,".gl-b");show(svg,".gl-ta",s.tab===0);show(svg,".gl-tb",s.tab===1);let h="",b="";
  if(s.tab===0){const y=Math.round(1850+250*s.yr),v=vol(y,s.hi),xt=term(v);
   /* mountains behind, the valley floor, moraines */
   h+='<path d="M6,70 L40,34 L62,52 L88,30 L118,58 L150,44 L190,74 L230,64 L296,96 L296,166 L6,166Z" fill="#c7d3df"/><path d="M40,34 l-8,9 l5,-1 l3,4 l3,-4 l5,1Z M88,30 l-9,10 l5,-1 l4,4 l3,-4 l6,1Z" fill="#fff"/>';
   const pts=[];for(let x=6;x<=296;x+=3)pts.push([x,bedM(x)]);h+='<path d="'+ln(pts)+'L296,166L6,166Z" fill="#8f7a66"/>';
   /* trimline: how high the ice reached in 1850 */
   const tl=[];for(let x=X0;x<=term(100);x+=4){const L=term(100)-X0,th=34*Math.sqrt(Math.max(0,1-(x-X0)/L));tl.push([x,bed(x)-th])}
   h+='<path d="'+ln(tl)+'" fill="none" stroke="#6a5745" stroke-width=".8" stroke-dasharray="2 2"'+tip("Trimline: the scar showing how thick the ice was in 1850")+'/>';
   const mor=(yy,lab)=>{const xx=term(vol(yy,0));return '<path d="M'+f1(xx-6)+','+f1(bed(xx))+' q6,-6 12,0Z" fill="#6f5d4c"'+tip("A moraine: a ridge of rubble dumped by the glacier’s snout around "+yy)+'/>'+(lab?T(f1(xx),f1(bed(xx)+8),yy,'font-size="5.4" text-anchor="middle" fill="#fff"'):"")};
   h+=T(MOR+4,bedM(MOR)+9,"1850",'font-size="5.6" font-weight="700" text-anchor="middle" fill="#fff"');
   if(y>1925&&xt<term(83)-6)h+=mor(1920,1);if(y>1990&&xt<term(64)-6)h+=mor(1985,1);
   /* the lake that fills the hollow once the ice has gone */
   const lakeY=bedM(MOR-8)+1.5;if(xt<MOR-12){const lp=[];let x0=Math.max(xt+2,214);for(let x=x0;x<=MOR-4;x+=2){const by=bed(x);if(by>lakeY)lp.push([x,by])}
     if(lp.length>2){h+='<path d="M'+f1(lp[0][0])+','+f1(lakeY)+ln(lp).replace("M","L")+'L'+f1(lp[lp.length-1][0])+','+f1(lakeY)+'Z" fill="#4a9bd6"'+tip("A lake dammed by the old moraine, filling the hollow the ice dug")+'/>';
       if(lp.length>8)h+=T(f1((lp[0][0]+lp[lp.length-1][0])/2),f1(lakeY+6),"new lake",'font-size="5.6" font-weight="700" text-anchor="middle" fill="#fff"')}}
   /* the glacier: thick at the top, thin at the snout */
   const L=xt-X0,H=34*Math.pow(v/100,.32),gs=[];for(let x=X0;x<=xt;x+=2){const th=H*Math.sqrt(Math.max(0,1-(x-X0)/L));gs.push([x,bed(x)-th])}gs.push([xt,bed(xt)]);
   const back=[];for(let x=xt;x>=X0;x-=4)back.push([x,bed(x)+1]);
   h+='<path d="'+ln(gs)+ln(back).replace("M","L")+'Z" fill="#dff1fb" stroke="#7fb6dc" stroke-width=".8"'+tip("The glacier: "+Math.round(v)+"% of its 1850 ice")+'/>';
   const ela=lerp(88,74,(y-1850)/250);h+='<path d="M6,'+f1(ela)+' L296,'+f1(ela)+'" stroke="#2f6ea8" stroke-width=".8" stroke-dasharray="4 3"/>'+T(292,f1(ela-2.5),"snow line: snow builds up above it, ice melts below",'font-size="5.6" font-weight="700" text-anchor="end" fill="#2f6ea8"');
   s.gs=gs;s.xt=xt;
   txt(svg,".gl-yr",y);txt(svg,".gl-ev",y<1870?"Little Ice Age: the glacier at its biggest":y<1970?"Shrinking as summers warm":y<1990?"A cooler spell: the melting pauses":y<=2025?"Melting speeds up":s.hi?"High emissions: almost all the ice gone":"Low emissions: some ice survives");
   txt(svg,".gl-v",Math.round(v)+"%");const vb=q(svg,".gl-vb");if(vb)vb.setAttribute("width",f1(72*v/100));btnOn(svg,"lo",!s.hi);btnOn(svg,"hi",!!s.hi);
   txt(svg,".g2-sll-y","Year: drag back to see it grow");setSlider(svg,"y",14,206,272,s.yr,y<=2025?"":s.hi?"high emissions":"low emissions")}
  else{const t=s.st,m=sstep(.3,.62,t),CX=151;
   const dep=dx=>{const a=Math.abs(dx),V=Math.max(0,96*(1-a/118)),U=a<92?116*(1-Math.pow(a/92,3.2)):0;return lerp(V,U,m)};
   const surf=x=>{const dx=x-CX;let y=52+dep(dx)+3*Math.sin(x/9);if(x<70&&x>36&&m>.4)y=Math.min(y+0,y);return y};
   const ice=t<.3?0:t<.5?sstep(.3,.45,t):1-sstep(.5,.66,t),iceY=lerp(170,66,ice);
   h+='<path d="M6,60 L30,40 L54,50 L70,36 L96,50 L210,48 L240,34 L262,46 L296,38 L296,72 L6,72Z" fill="#c7d3df"/>';
   if(ice>0)h+='<rect x="6" y="'+f1(iceY)+'" width="290" height="'+f1(170-iceY)+'" fill="#e2f3fc"/>'+(ice>.5?T(CX,f1(Math.min(iceY+30,140)),"glacier",'font-size="7" font-weight="800" text-anchor="middle" fill="#2f6ea8"'):"");
   const sea=sstep(.8,.95,t),seaY=lerp(172,104,sea);if(sea>0)h+='<rect x="6" y="'+f1(seaY)+'" width="290" height="'+f1(170-seaY)+'" fill="#2d6ea8"/>';
   const pts=[];for(let x=6;x<=296;x+=2)pts.push([x,surf(x)]);
   let rock='<path d="'+ln(pts)+'L296,170L6,170Z" fill="#8f7a66"'+tip(m<.5?"A V-shaped valley, cut by a river":"A U-shaped valley, ground out by ice")+'/>';
   /* a hanging side valley high on the left wall */
   const hv=sstep(.45,.65,t);if(hv>0){const hx=CX-84,hy=surf(hx),fy=surf(CX-40);rock+='<path d="M'+f1(hx-30)+','+f1(surf(hx-30)-1)+' Q'+f1(hx-14)+','+f1(hy-3)+' '+f1(hx)+','+f1(hy)+'" fill="none" stroke="#3d8fd1" stroke-width="1.6" opacity="'+f1(hv)+'"/>';
     if(t>.62&&t<.86)rock+='<path d="M'+f1(hx)+','+f1(hy)+' Q'+f1(hx+6)+','+f1(hy+10)+' '+f1(hx+10)+','+f1(fy-2)+'" fill="none" stroke="#dff1ff" stroke-width="2.2" stroke-dasharray="3 2"'+tip("A waterfall drops from the hanging valley")+'/>';
     if(t>.6)b+=T(f1(hx-6),f1(hy-16),"hanging valley",'font-size="5.8" font-weight="700" text-anchor="middle" fill="'+INK+'"')}
   h+=rock;if(t<.3)h+='<path d="M'+(CX-4)+','+f1(surf(CX)-1)+' h8" stroke="#3d8fd1" stroke-width="3" stroke-linecap="round"/>'+T(CX,f1(surf(CX)-6),"river",'font-size="6" font-weight="700" text-anchor="middle" fill="#1d5f99"');
   if(t>=.6&&t<.8){const fy=surf(CX);h+='<path d="M'+(CX-60)+','+f1(fy-1)+' L'+(CX+60)+','+f1(fy-1)+'" stroke="#3d8fd1" stroke-width="2"/>'}
   if(sea>.5)b+=T(CX,f1(seaY+14),"fjord",'font-size="8" font-weight="900" text-anchor="middle" fill="#fff"')+T(CX,f1(seaY+24),"the sea floods the valley",'font-size="6" text-anchor="middle" fill="#e3f1fb"');
   let st=STAGE[0];STAGE.forEach(x=>{if(t>=x[0])st=x});b+=T(14,44,st[1],'font-size="10" font-weight="900" fill="'+INK+'"');
   setPara(svg,"gl-p",st[2]);txt(svg,".g2-sll-y","Time");setSlider(svg,"y",14,206,272,t,st[1])}
  if(A)A.innerHTML=h;if(B)B.innerHTML=b},
 drag:(svg,s,n,x)=>{const f=clamp((x-14)/272,0,1);if(s.tab===0)s.yr=f;else s.st=f},
 act:(svg,s,a)=>{if(a==="lo"||a==="hi"){s.hi=a==="hi"?1:0;if(s.yr<.7)s.yr=1;return true}return false},
 tick:(svg,s,dt)=>{s.t+=dt;const fx=q(svg,".gl-fx");if(!fx)return;if(s.tab!==0||!s.gs){if(fx.innerHTML)fx.innerHTML="";return}
  /* ice creeps downhill: little moving marks inside the glacier, and meltwater from the snout */
  let h="";const g=s.gs,n=g.length;for(let k=0;k<6;k++){const u=((s.t*.05+k/6)%1),i=Math.floor(u*(n-2)),p=g[i];if(!p)continue;const by=bed(p[0]);h+='<circle cx="'+f1(p[0])+'" cy="'+f1((p[1]+by)/2)+'" r=".9" fill="#7fb6dc"/>'}
  const off=(s.t*12)%10,xt=s.xt;h+='<path d="M'+f1(xt)+','+f1(bed(xt)-.5)+' L'+f1(xt+30)+','+f1(bed(xt+30)-.5)+'" stroke="#3d8fd1" stroke-width="1.4" stroke-dasharray="4 3" stroke-dashoffset="'+f1(-off)+'"/>';fx.innerHTML=h}});
add("glacier","water");
})();

/* ================================================================ 3. Three shapes of delta */
(function(){
const MX=101,MY=78,R=62;
const PRE=[["Nile",.38,.52,.1,"Arcuate"],["Mississippi",.86,.09,.05,"Bird’s-foot"],["Tiber",.14,.8,.06,"Cuspate"],["Ganges–Brahmaputra",.14,.14,.72,"Tide-shaped"]];
const PTS=PRE.concat([["São Francisco",.05,.88,.07],["Mekong",.28,.34,.38],["Po",.5,.42,.08]]);
const TOP=[249,58],BL=[210,140],BR=[288,140];
const toXY=(r,w,t)=>[r*TOP[0]+w*BL[0]+t*BR[0],r*TOP[1]+w*BL[1]+t*BR[1]];
function toW(x,y){const [x1,y1]=TOP,[x2,y2]=BL,[x3,y3]=BR,d=(y2-y3)*(x1-x3)+(x3-x2)*(y1-y3);let a=((y2-y3)*(x-x3)+(x3-x2)*(y-y3))/d,b=((y3-y1)*(x-x3)+(x1-x3)*(y-y3))/d,c=1-a-b;a=Math.max(0,a);b=Math.max(0,b);c=Math.max(0,c);const s=a+b+c;return[a/s,b/s,c/s]}
const FING=[.82,1.32,1.78,2.3],FUN=[.62,1.02,1.42,1.82,2.22,2.56];
function rad(th,w){const [wr,ww,wt]=w,s=Math.sin(th);
  const rR=R*(.3*Math.pow(s,.3)+.7*Math.max(...FING.map(f=>Math.exp(-Math.pow((th-f)/.075,2)))));
  const rA=R*.8*Math.pow(s,.18),c=Math.abs(Math.cos(th)),rC=1/(c/(R*1.15)+s/(R*.75));
  const rW=lerp(rA,rC,sstep(.55,.88,ww/(ww+wr+.001)));
  const rT=R*.82*Math.pow(s,.3)*(1-.5*FUN.reduce((a,f)=>a+Math.exp(-Math.pow((th-f)/.055,2)),0));
  return wr*rR+ww*rW+wt*rT}
function kind(w){const [wr,ww,wt]=w;return wt>.45?3:wr>.62?1:ww>.66?2:0}
const TXT=["<b>Arcuate (fan-shaped).</b> River and waves roughly balance, so mud spreads into a smooth, curved fan crossed by many channels, like the Nile’s Δ.",
 "<b>Bird’s-foot.</b> The river brings so much mud, and the waves are so weak, that channels push far out to sea between their own banks of mud, like the Mississippi.",
 "<b>Cuspate (tooth-shaped).</b> Strong waves push the mud back to both sides of a single river mouth, making a pointed tooth, like the Tiber in Italy.",
 "<b>Tide-shaped.</b> Strong tides sweep in and out, cutting wide funnel-shaped channels and long islands that point out to sea, like the Ganges–Brahmaputra."];
make("deltas",{title:"Why deltas come in different shapes",
 src:"After Galloway’s (1975) triangle: a delta’s shape depends on whether the river, the waves or the tides win. Positions of real deltas are approximate. Shapes are schematic",
 tabs:["Arcuate","Bird’s-foot","Cuspate","Tide-shaped"],h:206,
 state:t=>({w:PRE[t].slice(1,4)}),
 frame:()=>{let h='<defs><clipPath id="dgDeClip"><rect x="6" y="26" width="190" height="146" rx="8"/></clipPath></defs><g clip-path="url(#dgDeClip)"><rect x="6" y="26" width="190" height="146" fill="#2f78bd"/><g class="de-map"></g></g>';
  h+='<g transform="translate(202,26)"><rect width="94" height="146" rx="9" fill="'+PAN+'"/>'+T(7,12,"What wins?",'font-size="8.4" font-weight="900" fill="'+INK+'"')+T(7,21,"drag the dot",'font-size="5.8" font-weight="700" fill="#c0561d"')+'</g>';
  h+='<path d="M'+TOP+' L'+BL+' L'+BR+'Z" fill="#fff" stroke="#c4d0dc"/>';
  [[TOP,"River",0,-3,"middle"],[BL,"Waves",-2,10,"start"],[BR,"Tides",2,10,"end"]].forEach(([p,n,dx,dy,a])=>{h+=T(p[0]+dx,p[1]+dy,n,'font-size="6.6" font-weight="800" text-anchor="'+a+'" fill="'+INK+'"')});
  PTS.forEach(p=>{const xy=toXY(p[1],p[2],p[3]);h+='<circle cx="'+f1(xy[0])+'" cy="'+f1(xy[1])+'" r="1.8" fill="#9aa8b8"'+tip(p[0]+(p[4]?" ("+p[4].toLowerCase()+")":""))+'/>'});
  h+='<g class="de-lab"></g><g class="dg-handle de-dot" data-drag="d"><circle r="12" fill="transparent"/><circle r="5" fill="'+ACC+'" stroke="#fff" stroke-width="1.6"/></g>';
  h+='<text class="de-k" x="249" y="158" font-size="7.6" font-weight="900" text-anchor="middle" fill="'+INK+'"></text><text class="de-near" x="249" y="167" font-size="5.8" text-anchor="middle" fill="'+SUB+'"></text>';
  h+=para("de-p",8,175,288,30,6.4);return h},
 onTab:(svg,s)=>{s.w=PRE[s.tab].slice(1,4)},
 draw:(svg,s)=>{const w=s.w,K=kind(w);let h='<rect x="6" y="26" width="190" height="'+(MY-26)+'" fill="#d9c58f"/>';
  for(let i=0;i<5;i++)h+='<path d="M6,'+(34+i*9)+' q40,'+(i%2?4:-4)+' 95,0 t95,0" fill="none" stroke="#c4ae74" stroke-width=".8"/>';
  /* mud plume, then the delta */
  const pts=[[MX-R*1.4,MY]];for(let i=0;i<=120;i++){const th=Math.PI-Math.PI*i/120,r=rad(th,w);pts.push([MX+r*Math.cos(th),MY+r*Math.sin(th)])}pts.push([MX+R*1.4,MY]);
  const pl=pts.map(p=>[MX+(p[0]-MX)*1.18,MY+(p[1]-MY)*1.25]);h+='<path d="'+ln(pl)+'Z" fill="#8a7a52" opacity=".35"/>';
  h+='<path d="'+ln(pts)+'Z" fill="#9cbf6a" stroke="#d8cc96" stroke-width="1.6"'+tip("Delta: new land made of river mud")+'/>';
  /* channels */
  const ch=(th,len,wd,op)=>{const r=Math.min(len,rad(th,w)*1.02);return op>.05?'<path d="M'+MX+','+MY+' Q'+f1(MX+r*.5*Math.cos(th)+3*Math.sin(th*7))+','+f1(MY+r*.5*Math.sin(th))+' '+f1(MX+r*Math.cos(th))+','+f1(MY+r*Math.sin(th))+'" fill="none" stroke="#2f78bd" stroke-width="'+f1(wd)+'" stroke-linecap="round" opacity="'+f1(op)+'"/>':""};
  FING.forEach(f=>h+=ch(f,R,1.8,w[0]*1.3));[.5,.8,1.1,1.4,1.7,2,2.3,2.6].forEach(f=>h+=ch(f,R,1.1,(1-w[2])*Math.max(0,1-Math.abs(w[1]-.5)*2.2)));h+=ch(Math.PI/2,R,2,w[1]*1.2);FUN.forEach(f=>h+=ch(f,R*.9,3.4,w[2]*1.4));
  h+='<path d="M'+MX+',26 C'+(MX-8)+',44 '+(MX+8)+',60 '+MX+','+MY+'" fill="none" stroke="#2f78bd" stroke-width="3.2"/>';
  if(w[2]>.3)for(let i=0;i<5;i++){const th=.8+i*.38,r=rad(th,w)*.55;h+='<ellipse cx="'+f1(MX+r*Math.cos(th))+'" cy="'+f1(MY+r*Math.sin(th))+'" rx="1.6" ry="6" transform="rotate('+f1(th*180/Math.PI-90)+' '+f1(MX+r*Math.cos(th))+' '+f1(MY+r*Math.sin(th))+')" fill="#2f7a3a" opacity="'+f1(w[2])+'"'+tip("Mangrove islands, like the Sundarbans")+'/>'}
  h+=T(14,36,"land",'font-size="6.4" font-weight="700" fill="#7a6a40"')+T(14,166,"sea",'font-size="6.4" font-weight="700" fill="#cfe6fa"')+T(MX+5,34,"river",'font-size="6.2" font-weight="700" fill="#1d5f99"');
  /* little waves or tide arrows, by what is winning */
  for(let i=0;i<5;i++){const x=20+i*38;h+='<path d="M'+x+',160 q4,-3 8,0 t8,0" fill="none" stroke="#fff" stroke-width="'+f1(.4+w[1]*1.6)+'" opacity=".8"/>'}
  if(w[2]>.2)h+='<path d="M180,150 v-14 m-3,4 l3,-4 l3,4 M188,136 v14 m-3,-4 l3,4 l3,-4" stroke="#fff" stroke-width="'+f1(w[2]*1.6)+'" fill="none"/>';
  const M=q(svg,".de-map");if(M)M.innerHTML=h;
  const xy=toXY(w[0],w[1],w[2]),d=q(svg,".de-dot");if(d)d.setAttribute("transform","translate("+f1(xy[0])+","+f1(xy[1])+")");
  let best=PTS[0],bd=9;PTS.forEach(p=>{const dd=Math.hypot(p[1]-w[0],p[2]-w[1],p[3]-w[2]);if(dd<bd){bd=dd;best=p}});
  txt(svg,".de-k",["Arcuate","Bird’s-foot","Cuspate","Tide-shaped"][K]);txt(svg,".de-near","nearest: "+best[0]);setPara(svg,"de-p",TXT[K]);
  const t2=kind(w);svg.querySelectorAll(".dg-tab").forEach((t,j)=>{const on=j===t2;t.classList.toggle("on",on);const r=t.querySelector("rect"),x=t.querySelector("text");if(r)r.style.fill=on?INK:"#fff";if(x)x.setAttribute("fill",on?"#fff":INK)})},
 drag:(svg,s,n,x,y)=>{if(n==="d")s.w=toW(x,y)}});
add("deltas","water");
})();

/* ================================================================ 4. Waves wear back a coast */
(function(){
const SEA=128;
const ST=[[0,"A crack","Waves attack a weak line in the headland, such as a joint or fault in the rock."],[.12,"A sea cave","Waves pound and scour the crack, and pebbles they throw grind it into a cave."],
 [.36,"An arch","The cave breaks through the headland, leaving an arch, like Durdle Door in England."],[.56,"A stack","The arch roof falls in, leaving a pillar of rock standing alone: a sea stack, like the Twelve Apostles."],
 [.76,"A stump","Waves wear away the foot of the stack until it topples, leaving a stump covered at high tide. New caves start in the cliff behind."]];
const ROCK={1:{nm:"Chalk",h:100,rate:.25,step:8,c:"#f1ede2",c2:"#ddd6c4",txt:"Firm chalk stands in tall, steep cliffs. Waves cut a notch at the foot until the overhang falls and the cliff steps back, leaving a wave-cut platform. Dover’s cliffs lose roughly 20–30 cm a year."},
 2:{nm:"Boulder clay",h:20,rate:1.8,step:4,c:"#b48a62",c2:"#9c7652",txt:"Boulder clay is soft rubble left by ice-age glaciers. On England’s Holderness coast the sea takes about 1.8 m a year, one of Europe’s fastest-eroding coasts; around 30 villages have gone."}};
const K=.9,X0=70,WL=140;
make("coasterode",{title:"How waves wear back a coast",
 src:"Stages of headland erosion after standard textbook models. Cliff retreat: Dover chalk roughly 0.2–0.3 m a year (Hurst and others, 2016); Holderness boulder clay about 1.8 m a year (East Riding of Yorkshire Council). Cliff scenes drawn to scale, 0.9 px per metre",
 tabs:["Headland to stack","Chalk cliff","Clay cliff"],h:212,
 state:()=>({p:.45,yr:.6,t:0}),
 frame:()=>{let h='<defs><linearGradient id="dgCoSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9cc8ea"/><stop offset="1" stop-color="#eaf4fb"/></linearGradient><clipPath id="dgCoClip"><rect x="6" y="26" width="290" height="140" rx="8"/></clipPath></defs>';
  h+='<g clip-path="url(#dgCoClip)"><rect x="6" y="26" width="290" height="140" fill="url(#dgCoSky)"/><g class="co-a"></g><g class="co-fx"></g></g><g class="co-b"></g>';
  h+=para("co-p",8,168,288,26,6.3)+slider("v",14,206,272,"Time");return h},
 draw:(svg,s)=>{let h="",b="";
  if(s.tab===0){const p=s.p;let st=ST[0];ST.forEach(x=>{if(p>=x[0])st=x});
   const cave=sstep(.1,.36,p),arch=p>=.36,fall=sstep(.56,.62,p),stump=sstep(.76,1,p),cx=208;
   /* the headland, seen side-on from the sea, with rock layers */
   const top=62,end=262;let body='M6,'+top+' L'+(end-14)+','+top+' Q'+end+','+(top+4)+' '+end+','+(top+20)+' L'+(end+6)+','+(SEA+40)+' L6,'+(SEA+40)+'Z';
   if(fall>0){/* the part beyond the gap becomes a stack */body='M6,'+top+' L'+(cx-16)+','+top+' Q'+(cx-14)+','+(top+30)+' '+(cx-22)+','+(SEA+40)+' L6,'+(SEA+40)+'Z';
     const sh=lerp(top,SEA-3,stump),w=lerp(16,13,stump);h+='<path d="M'+(cx+8)+','+(SEA+40)+' L'+(cx+10)+','+f1(sh+6)+' Q'+(cx+8+w)+','+f1(sh-3)+' '+(cx+12+2*w)+','+f1(sh+8)+' L'+(cx+16+2*w)+','+(SEA+40)+'Z" fill="#d9c49a" stroke="#a88e62" stroke-width=".8"'+tip(stump>.6?"A stump: the worn-down base of a stack":"A sea stack")+'/>';
     b+=T(cx+12+w,f1(sh-7),stump>.6?"stump":"stack",'font-size="7" font-weight="800" text-anchor="middle" fill="'+INK+'"');
     if(stump<.6)b+=T(cx-30,top-6,"cliff",'font-size="6.4" font-weight="700" text-anchor="middle" fill="'+INK+'"')}
   h='<path d="'+body+'" fill="#d9c49a" stroke="#a88e62" stroke-width=".8"/>'+h;
   for(let i=1;i<6;i++){const yy=top+i*12;h+='<path d="M6,'+yy+' L'+(fall>0?cx-16-i*1.2:end-2)+','+yy+'" stroke="#c2aa7c" stroke-width=".7"/>'}
   if(fall===0){if(!arch)h+='<path d="M'+cx+','+(SEA+4)+' L'+(cx+2)+','+(top+16)+'" stroke="#6b5636" stroke-width="'+f1(1+cave*1.5)+'"/>';
     if(cave>0){const cw=4+cave*18,ch=6+cave*30;h+='<path d="M'+f1(cx-cw)+','+(SEA+2)+' Q'+f1(cx-cw)+','+f1(SEA-ch)+' '+cx+','+f1(SEA-ch)+' Q'+f1(cx+cw)+','+f1(SEA-ch)+' '+f1(cx+cw)+','+(SEA+2)+'Z" fill="'+(arch?"#cfe7f7":"#3a2e22")+'"'+tip(arch?"An arch: the cave has broken right through":"A sea cave")+'/>';
       b+=T(cx,f1(SEA-ch-5),arch?"arch":"cave",'font-size="7" font-weight="800" text-anchor="middle" fill="'+INK+'"')}
     else b+=T(cx+6,top+12,"crack",'font-size="6.4" font-weight="800" fill="'+INK+'"')}
   else for(let i=0;i<5;i++)h+='<circle cx="'+f1(cx-8+i*6+rnd(i)*3)+'" cy="'+f1(SEA+3-rnd(i+3)*2)+'" r="'+f1(2+rnd(i+7)*2)+'" fill="#bda57a"/>';
   if(p>.82){const c2=sstep(.82,1,p);h+='<path d="M'+f1(140-c2*10)+','+(SEA+2)+' Q140,'+f1(SEA-c2*22)+' '+f1(140+c2*10)+','+(SEA+2)+'Z" fill="#3a2e22"/>';b+=T(140,f1(SEA-c2*22-4),"a new cave",'font-size="6" font-weight="700" text-anchor="middle" fill="'+INK+'"')}
   h+='<rect x="6" y="'+SEA+'" width="290" height="40" fill="#2f78bd" opacity=".92"/>';
   setPara(svg,"co-p","<b>"+st[1]+".</b> "+st[2]);txt(svg,".g2-sll-v","Time: thousands of years");setSlider(svg,"v",14,206,272,p,st[1]);s.face=null}
  else{const R=ROCK[s.tab],yr=Math.round(s.yr*100),ret=R.rate*yr,top=WL-R.h*K;
   const nc=Math.floor(ret/R.step),nd=(ret-nc*R.step)*K,xf=X0+nc*R.step*K;s.face=xf;
   /* sea bed, platform and the cliff */
   h+='<rect x="6" y="'+(WL-8)+'" width="290" height="60" fill="#2f78bd" opacity=".9"/>';
   h+='<path d="M6,166 L6,158 Q40,152 '+(X0-6)+','+(WL+7)+' L'+f1(xf)+','+(WL+5)+' L296,'+(WL+5)+' L296,166Z" fill="#8a7f72"/>';
   if(xf-X0>8){h+='<path d="M'+X0+','+(WL+6)+' L'+f1(xf)+','+(WL+5)+'" stroke="#5f564c" stroke-width="2"'+tip("Wave-cut platform: the old foot of the cliff, bared at low tide")+'/>';b+=T(f1((X0+xf)/2),WL+15,"wave-cut platform",'font-size="5.8" font-weight="700" text-anchor="middle" fill="#fff"')}
   const slope=s.tab===2?R.h*K*.6:0,ny=WL-1;
   h+='<path d="M'+f1(xf+slope)+','+f1(top)+' L'+f1(xf+(s.tab===2?6:0))+','+f1(ny-8)+' L'+f1(xf+nd)+','+f1(ny-3)+' L'+f1(xf)+','+(WL+5)+' L296,'+(WL+5)+' L296,'+f1(top)+'Z" fill="'+R.c+'" stroke="'+R.c2+'" stroke-width=".8"'+tip(R.nm+" cliff, "+R.h+" m high")+'/>';
   if(s.tab===1)for(let i=1;i<6;i++)h+='<path d="M'+f1(xf+3)+','+f1(top+i*R.h*K/6)+' L296,'+f1(top+i*R.h*K/6)+'" stroke="#c9c1ad" stroke-width=".5" stroke-dasharray="1 4"/>';
   h+='<rect x="'+f1(xf+slope)+'" y="'+f1(top-3)+'" width="300" height="3" fill="#6aa84f"/>';
   if(nd>2)b+=T(f1(xf+nd+4),f1(ny-2),"notch",'font-size="5.8" font-weight="700" fill="'+INK+'"');
   if(nd<R.step*K*.35&&nc>0)for(let i=0;i<4;i++)h+='<circle cx="'+f1(xf-4-i*4)+'" cy="'+f1(WL+2-rnd(i)*2)+'" r="'+f1(1.4+rnd(i+5)*1.4)+'" fill="'+R.c2+'"/>';
   /* homes on the cliff top: lost when the edge reaches them */
   let lost=0;[[100,"farm"],[140,"houses"],[172,"church"]].forEach(([m,nm],i)=>{const hx=X0+m*K;if(hx>296)return;const gone=hx<xf+slope+2;if(gone){lost++;return}
     const y0=top-3;h+='<g'+tip(nm+", "+m+" m from where the edge was")+'><rect x="'+f1(hx-4)+'" y="'+f1(y0-6)+'" width="8" height="6" fill="#e8e1d2" stroke="#7a6a55" stroke-width=".5"/><path d="M'+f1(hx-5)+','+f1(y0-6)+' L'+f1(hx)+','+f1(y0-10)+' L'+f1(hx+5)+','+f1(y0-6)+'Z" fill="#b5533c"/>'+(nm==="church"?'<rect x="'+f1(hx+2)+'" y="'+f1(y0-14)+'" width="2.4" height="8" fill="#e8e1d2"/>':"")+'</g>'});
   const L0=X0;h+='<path d="M'+L0+','+f1(top-14)+' v10" stroke="'+ACC+'" stroke-width="1" stroke-dasharray="2 1.5"/>';b+=T(L0+2,f1(top-16),"edge in year 0",'font-size="5.6" font-weight="700" fill="#c0561d"');
   b+='<g transform="translate('+(s.tab===1?186:14)+',34)"><rect width="104" height="'+(lost?40:30)+'" rx="6" fill="#fff" fill-opacity=".88"/>'+T(6,11,R.nm+": about "+(R.rate<1?Math.round(R.rate*100)+" cm":R.rate+" m")+" a year",'font-size="6" font-weight="800" fill="'+INK+'"')+T(6,22,"After "+yr+" years: "+(ret<10?ret.toFixed(1):Math.round(ret))+" m lost",'font-size="6.4" font-weight="800" fill="'+ACC+'"')+(lost?T(6,33,lost+(lost>1?" buildings":" building")+" gone over the edge",'font-size="6" font-weight="700" fill="#b5533c"'):"")+'</g>';
   setPara(svg,"co-p",R.txt);txt(svg,".g2-sll-v","Years");setSlider(svg,"v",14,206,272,s.yr,yr+" years")}
  const A=q(svg,".co-a");if(A)A.innerHTML=h;const B=q(svg,".co-b");if(B)B.innerHTML=b},
 drag:(svg,s,n,x)=>{const f=clamp((x-14)/272,0,1);if(s.tab===0)s.p=f;else s.yr=f},
 tick:(svg,s,dt)=>{s.t+=dt;const fx=q(svg,".co-fx");if(!fx)return;let h="";const y=s.tab===0?SEA:WL-8;
  for(let i=0;i<7;i++){const x=((s.t*18+i*44)%300);h+='<path d="M'+f1(x)+','+f1(y+4+i%3*7)+' q5,-3 10,0 t10,0" fill="none" stroke="#fff" stroke-width="1" opacity=".7"/>'}
  const fxX=s.tab===0?(s.p<.56?250:null):s.face;if(fxX!=null){const k=(s.t*1.3)%1;h+='<path d="M'+f1(fxX-2)+','+f1(y+1)+' q'+f1(-(4+8*k))+','+f1(-10*Math.sin(k*Math.PI))+' '+f1(-(8+10*k))+',0" fill="none" stroke="#fff" stroke-width="1.6" opacity="'+f1(1-k)+'"/>'}
  fx.innerHTML=h}});
add("coasterode","water");
})();

/* ================================================================ 5. Upwelling and El Niño */
(function(){
const SS=56,CO=160;
make("upwell",{title:"Upwelling and El Niño",
 src:"Simplified cross-sections. Upwelling after NOAA Ocean Service; El Niño and La Niña after NOAA Climate.gov. In the Southern Hemisphere the Earth’s spin turns water moved by the wind to the left of it, so a wind blowing north along Peru’s coast drives surface water west, out to sea",
 tabs:["Upwelling off Peru","Across the Pacific"],h:212,
 state:t=>({w:.7,k:.6,t:0,P:[]}),
 frame:()=>{let h='<defs><clipPath id="dgUpClip"><rect x="6" y="26" width="190" height="146" rx="8"/></clipPath></defs><g clip-path="url(#dgUpClip)"><rect x="6" y="26" width="190" height="146" fill="#cfe6f7"/><g class="up-a"></g><g class="up-fx"></g></g><g class="up-b"></g>';
  h+=panel(202,26,94,146,"up",[["","r1",28],["","r2",50],["","r3",72],["","r4",94]]);
  h+='<g transform="translate(202,26)"><foreignObject x="5" y="112" width="86" height="34"><div xmlns="http://www.w3.org/1999/xhtml" class="up-note" style="font:500 5.6px/1.3 Inter,system-ui,sans-serif;color:'+SUB+'"></div></foreignObject></g>';
  h+=para("up-p",8,175,288,18,6.2)+slider("w",14,206,272,"Wind");return h},
 draw:(svg,s)=>{let h="",b="";
  if(s.tab===0){const w=s.w,th=lerp(32,3,w);
   /* sea, the warm surface layer thinning towards the coast, land and the Andes */
   h+='<rect x="6" y="'+SS+'" width="190" height="120" fill="#1d4f86"/>';
   const tc=[];for(let x=6;x<=CO;x+=4){const u=(x-6)/(CO-6);tc.push([x,SS+lerp(34,th,Math.pow(u,1.6))])}
   h+='<path d="M6,'+SS+' L'+CO+','+SS+' L'+ln(tc.slice().reverse()).slice(1)+'Z" fill="#3f8fd0"'+tip("Warm surface water")+'/>';
   h+='<path d="'+ln(tc)+'" fill="none" stroke="#9fd0ff" stroke-width=".8" stroke-dasharray="3 2"/>';
   h+='<path d="M6,172 L6,150 Q90,146 130,120 Q150,104 '+CO+','+(SS+2)+' L196,'+(SS-8)+' L196,172Z" fill="#7d6a58"/><path d="M'+CO+','+(SS+1)+' L170,'+(SS-6)+' L182,30 L190,'+(SS-20)+' L196,'+(SS-12)+' L196,'+(SS+2)+'Z" fill="#b59a74"/><path d="M182,30 l-3,5 l3,-1 l3,1Z" fill="#fff"/>';
   b+=T(184,SS-24,"Peru",'font-size="6.4" font-weight="800" text-anchor="middle" fill="'+INK+'"')+T(74,SS-4,"Pacific Ocean (west)",'font-size="6" font-weight="700" fill="#1d5f99"')+T(14,SS+18,"warm",'font-size="6" font-weight="800" fill="#fff"')+T(14,140,"cold, deep water, full of nutrients",'font-size="6" font-weight="700" fill="#cfe6fa"');
   /* seen from above */
   b+='<g transform="translate(12,30)"><rect width="56" height="22" rx="4" fill="#fff" fill-opacity=".85"/><path d="M44,2 L46,20" stroke="#7d6a58" stroke-width="3"/>'+T(4,8,"from above:",'font-size="5" fill="'+SUB+'"')+
     '<path d="M38,18 L38,6 m-2.5,3 l2.5,-3 l2.5,3" stroke="'+INK+'" stroke-width="'+f1(.6+w*1.4)+'" fill="none"/>'+T(4,15,"wind N",'font-size="5" font-weight="800" fill="'+INK+'"')+'<path d="M34,14 L22,14 m3,-2.5 l-3,2.5 l3,2.5" stroke="#3d8fd1" stroke-width="'+f1(.6+w*1.4)+'" fill="none"/>'+T(4,21,"water W",'font-size="5" font-weight="800" fill="#1d5f99"')+'</g>';
   /* plankton and fish by the coast */
   const pk=Math.round(w*w*26);for(let i=0;i<pk;i++){const x=CO-8-rnd(i)*70,y=SS+2+rnd(i+40)*12;h+='<circle cx="'+f1(x)+'" cy="'+f1(y)+'" r="1" fill="#5fd36a"/>'}
   const fs=Math.round(w*w*8);for(let i=0;i<fs;i++){const x=CO-12-rnd(i+80)*60,y=SS+14+rnd(i+90)*16;h+='<path d="M'+f1(x)+','+f1(y)+' q4,-2.4 8,0 q-4,2.4 -8,0 Z M'+f1(x+8)+','+f1(y)+' l2.4,-1.8 v3.6Z" fill="#c8d6e3"/>'}
   const sst=Math.round(24-9*w);
   txt(svg,".up-nm","Off the coast");[["Wind along the coast",w<.15?"Calm":w<.5?"Light":w<.8?"Steady":"Strong"],["Sea by the shore","about "+sst+" °C"],["Plankton",w<.2?"Few":w<.5?"Some":w<.8?"Lots":"Huge blooms"],["Anchoveta",w<.2?"Scarce":w<.5?"Some":"Huge shoals"]].forEach((r,i)=>{txt(svg,".up-Lr"+(i+1),r[0]);txt(svg,".up-r"+(i+1),r[1])});
   setPara(svg,"up-note","Peru’s anchoveta catch is the biggest of any single kind of fish on Earth.");
   setPara(svg,"up-p","Wind blowing north along the coast pushes surface water out to sea. Cold, nutrient-rich water rises to replace it and feeds plankton, then fish.");
   txt(svg,".g2-sll-w","Wind along the coast");setSlider(svg,"w",14,206,272,w,Math.round(w*100)+"%")}
  else{const k=s.k,ph=k<.33?0:k<.8?1:2;const td=lerp(52,10,k),cx=lerp(150,34,k);
   h+='<rect x="6" y="26" width="190" height="44" fill="#d9ecf9"/><rect x="6" y="70" width="190" height="102" fill="#1d4f86"/>';
   const tl=[];for(let x=6;x<=196;x+=4){const u=(x-6)/190;tl.push([x,70+lerp(56,td,Math.pow(u,1.3))])}
   for(let i=0;i<19;i++){const x=6+i*10,u=i/18,warm=lerp(1,lerp(.15,1,1-k),Math.pow(u,1.5));const ty=70+lerp(56,td,Math.pow((x+5-6)/190,1.3));h+='<rect x="'+x+'" y="70" width="10.4" height="'+f1(ty-70)+'" fill="'+(warm>.75?"#e2603a":warm>.5?"#e99550":warm>.3?"#7ab3d8":"#4f8fc4")+'"/>'}
   h+='<path d="'+ln(tl)+'" fill="none" stroke="#fff" stroke-width="1" stroke-dasharray="3 2"'+tip("Thermocline: the boundary between warm surface water and cold deep water")+'/>';
   h+='<path d="M6,70 L6,48 L20,50 L28,70Z" fill="#7d9a5a"/><path d="M196,70 L196,40 L186,46 L182,70Z" fill="#b59a74"/>';
   /* the rising air, cloud and rain, then air sinking in the east */
   h+='<g'+tip("Rising warm, moist air builds storm clouds and rain")+'><ellipse cx="'+f1(cx)+'" cy="36" rx="22" ry="7" fill="#fff"/><ellipse cx="'+f1(cx-10)+'" cy="40" rx="12" ry="6" fill="#eef3f8"/><ellipse cx="'+f1(cx+12)+'" cy="40" rx="13" ry="6" fill="#eef3f8"/></g>';
   b+='<path d="M'+f1(cx+26)+',32 C'+f1(cx+70)+',24 170,26 180,44" fill="none" stroke="'+INK+'" stroke-width=".7" stroke-dasharray="2 2" opacity="'+f1(k)+'"/>';
   b+=T(10,80,"Indonesia",'font-size="6" font-weight="800" fill="#fff"')+T(192,80,"Peru",'font-size="6" font-weight="800" text-anchor="end" fill="#fff"')+T(100,160,"cold water",'font-size="6" font-weight="700" text-anchor="middle" fill="#cfe6fa"')+T(20,96,"warm pool",'font-size="6" font-weight="700" fill="#fff"');
   b+=T(101,66,k<.15?"trade winds almost stop":"trade winds",'font-size="6" font-weight="800" text-anchor="middle" fill="'+INK+'"');
   const R=[["Phase",["El Niño","Normal year","La Niña"][ph]],["Rain in Indonesia",["Drought, forest fires","Heavy","Even heavier, floods"][ph]],["Sea off Peru",["2–5 °C warmer","Cold","Colder than usual"][ph]],["Peru",["Desert floods; fish vanish","Rich fishing","Very rich fishing, drought"][ph]]];
   txt(svg,".up-nm","Across the Pacific");R.forEach((r,i)=>{txt(svg,".up-Lr"+(i+1),r[0]);txt(svg,".up-r"+(i+1),r[1])});
   setPara(svg,"up-note","El Niño comes every 2–7 years and changes weather around the world.");
   setPara(svg,"up-p","Trade winds blow warm surface water west, piling it up by Indonesia. When they weaken, the warm water and its rain slide back east: El Niño.");
   txt(svg,".g2-sll-w","Trade winds");setSlider(svg,"w",14,206,272,k,["weak: El Niño","normal","strong: La Niña"][ph])}
  const A=q(svg,".up-a");if(A)A.innerHTML=h;const B=q(svg,".up-b");if(B)B.innerHTML=b},
 onTab:(svg,s)=>{s.P=[]},
 drag:(svg,s,n,x)=>{const f=clamp((x-14)/272,0,1);if(s.tab===0)s.w=f;else s.k=f},
 tick:(svg,s,dt)=>{s.t+=dt;const fx=q(svg,".up-fx");if(!fx)return;let h="";
  if(s.tab===0){const w=s.w;s.acc=(s.acc||0)+dt*w*8;while(s.acc>1){s.acc--;s.P.push({u:0})}
   /* a loop: along the deep sea floor to the coast, up, then out to sea at the surface */
   const pos=u=>u<.4?[lerp(40,CO-14,u/.4),lerp(140,128,u/.4)]:u<.6?[lerp(CO-14,CO-8,(u-.4)/.2),lerp(128,SS+4,(u-.4)/.2)]:[lerp(CO-8,20,(u-.6)/.4),SS+4+((u*97)%1)*6];
   s.P=s.P.filter(p=>{p.u+=dt*.09*(.3+w);if(p.u>1)return false;const [x,y]=pos(p.u);h+='<circle cx="'+f1(x)+'" cy="'+f1(y)+'" r="1.3" fill="'+(p.u<.55?"#9fd0ff":"#fff")+'" opacity=".85"/>';return true});
   const off=(s.t*20)%12;h+='<path d="M'+(CO-6)+','+(SS-2)+' L20,'+(SS-2)+'" stroke="#fff" stroke-width="'+f1(.4+w*1.6)+'" stroke-dasharray="6 6" stroke-dashoffset="'+f1(off)+'" opacity="'+f1(w)+'"/>'}
  else{const k=s.k,off=(s.t*22*(.2+k))%12;h+='<path d="M180,60 L24,60" stroke="'+INK+'" stroke-width="'+f1(.4+k*1.8)+'" stroke-dasharray="7 5" stroke-dashoffset="'+f1(off)+'" opacity="'+f1(.25+k*.75)+'"/><path d="M24,60 l5,-3 v6Z" fill="'+INK+'" opacity="'+f1(.25+k*.75)+'"/>';
   const cx=lerp(150,34,k);for(let i=0;i<8;i++){const x=cx-16+i*4.4,y=44+((s.t*40+i*7)%22);h+='<path d="M'+f1(x)+','+f1(y)+' l-1,3.4" stroke="#3d8fd1" stroke-width=".9"/>'}}
  fx.innerHTML=h}});
add("upwell","water");
})();

/* ================================================================ 6. How a city spreads */
(function(){
const CX=101,CY=99,CS=5,NX=38,NY=29,ROADS=[18,108,198,292].map(a=>a*Math.PI/180),RB=7,RU0=10.5;
const TOWNS=ROADS.map(a=>[Math.cos(a)*12.5,Math.sin(a)*12.5]);
const pop=t=>.3+2.4/(1+Math.exp(-(t-1965)/18));
const dSprawl=t=>t<1945?lerp(9000,7000,(t-1900)/45):7000*Math.exp(-(t-1945)/36);
const river=(x,y)=>Math.abs(y-(Math.sin(x/4)*1.2+2.5))<.9;
let CELLS=null;
function cells(){if(CELLS)return CELLS;CELLS=[];for(let i=0;i<NX;i++)for(let j=0;j<NY;j++){const x=(i*CS+8-CX)/CS,y=(j*CS+28-CY)/CS;if(river(x,y))continue;const d=Math.hypot(x,y);
  let rd=9;ROADS.forEach(a=>{const ux=Math.cos(a),uy=Math.sin(a),t=x*ux+y*uy;if(t>0)rd=Math.min(rd,Math.abs(-x*uy+y*ux))});
  const sc=d*(1-.38*Math.exp(-rd*rd/2.5))+rnd(i*97+j)*1.6;
  CELLS.push({px:i*CS+8,py:j*CS+28,x,y,d,sc,tw:Math.min(...TOWNS.map(T=>Math.hypot(x-T[0],y-T[1])))+rnd(i+j*31)*.8})}
  CELLS.sort((a,b)=>a.sc-b.sc);return CELLS}
/* how many cells are built in year t under each policy; a cell, once built, stays built */
function plan(mode,t){const P=pop(t)*1e6,C=cells();let built=[],d=dSprawl(t);
  if(mode===0||t<1947||(mode===2&&t<1979)){const n=Math.round(P/d/(CS*CS*.16)/1);built=C.slice(0,Math.min(C.length,Math.round(P/d/4)))}
  else if(mode===1){const sh=.22*sstep(1947,1990,t),din=lerp(7000,4800,sstep(1947,2020,t)),nin=Math.round(P*(1-sh)/din/4);
    const inside=C.filter(c=>c.d<RB);built=inside.slice(0,nin);const nt=Math.round(P*sh/3200/4);const out=C.filter(c=>c.d>RB+3).sort((a,b)=>a.tw-b.tw);built=built.concat(out.slice(0,nt));d=P/(built.length*4)}
  else{const ru=RU0+1.5*sstep(1979,2020,t),cap=C.filter(c=>c.d<ru);const d79=dSprawl(1979),want=Math.round(P/Math.max(d79,P/(cap.length*4))/4);built=cap.slice(0,Math.min(cap.length,want));d=P/(built.length*4)}
  return{built,P,area:built.length*4,d:P/(built.length*4)}}
const TXT=["<b>Sprawl.</b> With cars, cheap land and no limits, new homes spread out along the roads at low density: more land per person, longer drives.",
 "<b>Greenbelt.</b> A ring of protected countryside stops the city growing outwards, so it stays denser and growth leaps to new towns beyond the belt, as around London.",
 "<b>Growth boundary.</b> A line drawn round the city in 1979 protects farms and forest outside it; inside, the city fills in with denser homes near transit, as in Portland, Oregon."];
make("urban",{title:"How a city spreads",
 src:"A model city, not a real one: the same population growth under three planning policies. Densities are typical of US sprawl, London and Portland",
 tabs:["Sprawl","Greenbelt","Growth boundary"],h:214,
 state:()=>({yr:1}),
 frame:()=>{let h='<defs><clipPath id="dgUrClip"><rect x="6" y="26" width="190" height="146" rx="8"/></clipPath></defs><g clip-path="url(#dgUrClip)"><rect x="6" y="26" width="190" height="146" fill="#dfe8c8"/><g class="ur-a"></g></g>';
  h+=panel(202,26,94,146,"ur",[["Year","yr",26],["People","pp",43],["Built-up area","ar",60],["People per km²","dn",77],["Countryside built on","lo",94]]);
  h+='<g transform="translate(209,140)">'+[["#7d3b2f","before 1945"],["#cf7350","1945–79"],["#f0b27a","1980 on"]].map((c,i)=>'<rect x="0" y="'+(i*9)+'" width="7" height="6" fill="'+c[0]+'"/>'+T(10,i*9+5.5,c[1],'font-size="5.6" fill="'+SUB+'"')).join("")+'</g>';
  h+=para("ur-p",8,175,288,22,6.3)+slider("y",14,206,272,"Year");return h},
 draw:(svg,s)=>{const t=Math.round(1900+120*s.yr),m=s.tab,R=plan(m,t);let h="";
  /* the river and roads */
  let rp=[];for(let x=-21;x<=21;x+=.5)rp.push([CX+x*CS,CY+(Math.sin(x/4)*1.2+2.5)*CS]);h+='<path d="'+ln(rp)+'" fill="none" stroke="#6fb3e0" stroke-width="5"/>';
  ROADS.forEach(a=>{h+='<path d="M'+CX+','+CY+' L'+f1(CX+Math.cos(a)*130)+','+f1(CY+Math.sin(a)*130)+'" stroke="#fff" stroke-width="1.4" opacity=".9"/>'});
  if(m===1&&t>=1947)h+='<circle cx="'+CX+'" cy="'+CY+'" r="'+((RB+1.5)*CS)+'" fill="none" stroke="#5c9a46" stroke-width="'+(3*CS)+'" opacity=".55"'+tip("The greenbelt: farms, woods and parks where building is restricted")+'/>';
  if(m===2&&t>=1979){const ru=RU0+1.5*sstep(1979,2020,t);h+='<circle cx="'+CX+'" cy="'+CY+'" r="'+f1(ru*CS)+'" fill="none" stroke="#2f7a3a" stroke-width="1.4" stroke-dasharray="4 3"'+tip("The urban growth boundary")+'/>'}
  /* built cells, coloured by when they were built */
  const yrs=[1945,1979];const prev=yrs.map(y=>y<t?new Set(plan(m,y).built):null);const g=["","",""];
  R.built.forEach(c=>{const k=prev[0]&&prev[0].has(c)?0:prev[1]&&prev[1].has(c)?1:2;const kk=t<=1945?0:t<=1979&&k===2?1:k;g[kk]+="M"+c.px+","+c.py+"h4.4v4.4h-4.4z"});
  ["#7d3b2f","#cf7350","#f0b27a"].forEach((c,i)=>{if(g[i])h+='<path d="'+g[i]+'" fill="'+c+'"/>'});
  ROADS.forEach(a=>{h+='<path d="M'+CX+','+CY+' L'+f1(CX+Math.cos(a)*130)+','+f1(CY+Math.sin(a)*130)+'" stroke="#fff" stroke-width=".8" opacity=".6"/>'});
  if(m===1&&t>=1965)h+=T(CX,f1(CY-(RB+1.5)*CS+2),"greenbelt",'font-size="6" font-weight="800" text-anchor="middle" fill="#2f5f22"');
  if(m===2&&t>=1979)h+=T(CX,f1(CY-(RU0+1.5)*CS-3),"growth boundary",'font-size="6" font-weight="800" text-anchor="middle" fill="#2f5f22"');
  h+=T(12,168,"each square: 4 km²",'font-size="5.6" fill="'+SUB+'"');
  const A=q(svg,".ur-a");if(A)A.innerHTML=h;
  const base=plan(0,1900).area;
  txt(svg,".ur-nm",["Sprawl","Greenbelt","Growth boundary"][m]);txt(svg,".ur-yr",t+"");txt(svg,".ur-pp",(R.P/1e6).toFixed(1)+" million");txt(svg,".ur-ar",fmt(R.area)+" km²");txt(svg,".ur-dn",fmt(Math.round(R.d/100)*100));txt(svg,".ur-lo",fmt(Math.max(0,R.area-base))+" km²");
  setPara(svg,"ur-p",TXT[m]);setSlider(svg,"y",14,206,272,s.yr,t+"")},
 drag:(svg,s,n,x)=>{s.yr=clamp((x-14)/272,0,1)}});
add("urban","econ");
})();

/* ================================================================ 7. A waterfall walks backwards */
(function(){
const XS=270,TOP=70,CAP=12,GF=124,KM=240/11;
make("waterfall",{title:"How a waterfall walks backwards",
 src:"Niagara Falls: the gorge is about 11 km long and the falls began at the Niagara Escarpment roughly 12,500 years ago. Rates from the US Geological Survey and the Niagara Parks Commission. Heights stretched about 20 times",
 h:206,state:()=>({p:1,t:0}),
 frame:()=>{let h='<defs><clipPath id="dgWfClip"><rect x="6" y="6" width="290" height="150" rx="8"/></clipPath></defs><g clip-path="url(#dgWfClip)"><rect x="6" y="6" width="290" height="150" fill="#dcedf9"/><g class="wf-a"></g><g class="wf-fx"></g></g><g class="wf-b"></g>';
  h+=para("wf-p",8,159,288,26,6.3)+slider("y",14,198,272,"Years since the ice left");return h},
 draw:(svg,s)=>{const yrs=Math.round(s.p*12500),km=11*s.p,xf=XS-km*KM,u=((km*5)%1),ov=u*7;let h="",b="";
  /* layers: hard cap rock on soft shale */
  h+='<rect x="6" y="'+TOP+'" width="290" height="'+CAP+'" fill="#9a8f80"'+tip("Hard cap rock (dolostone): wears away slowly")+'/>';
  h+='<rect x="6" y="'+(TOP+CAP)+'" width="290" height="80" fill="#6f6a72"'+tip("Soft shale: wears away fast")+'/>';
  for(let i=0;i<4;i++)h+='<path d="M6,'+(TOP+CAP+12+i*14)+' H296" stroke="#615c64" stroke-width=".8"/>';
  /* cut away the gorge downstream of the falls, with the undercut beneath the lip */
  h+='<path d="M'+f1(xf)+','+(TOP-1)+' L296,'+(TOP-1)+' L296,'+GF+' L'+f1(xf+12)+','+GF+' Q'+f1(xf+4)+','+(GF+10)+' '+f1(xf-ov+2)+','+(GF-4)+' L'+f1(xf-ov)+','+(TOP+CAP)+' L'+f1(xf)+','+(TOP+CAP)+'Z" fill="#dcedf9"/>';
  h+='<path d="M'+XS+','+(TOP-1)+' L296,'+(TOP-1)+' L296,'+GF+' L'+XS+','+GF+'Z" fill="#dcedf9"/><path d="M'+XS+','+GF+' L296,'+GF+' L296,160 L'+XS+',160Z" fill="#7a7468"/>';
  h+='<path d="M'+f1(xf+10)+','+GF+' L296,'+GF+'" stroke="#3d8fd1" stroke-width="4"/><path d="M6,'+(TOP-1.5)+' L'+f1(xf)+','+(TOP-1.5)+'" stroke="#3d8fd1" stroke-width="3"/>';
  h+='<path d="M'+f1(xf+2)+','+(GF+2)+' q8,8 16,0" fill="#2f78bd"'+tip("Plunge pool: swirling water scours the soft rock")+'/>';
  for(let i=0;i<4;i++)h+='<path d="M'+f1(xf+12+i*7+rnd(i)*3)+','+GF+' l3,-4 l4,1 l1,3Z" fill="#9a8f80"/>';
  h+='<path d="M6,'+(TOP-1)+' L6,30 L60,40 L120,36 L200,44 L296,40 L296,'+(TOP-1)+'Z" fill="#cfe2c0" opacity=".0"/>';
  b+=T(14,TOP-6,"river",'font-size="6.4" font-weight="700" fill="#1d5f99"')+T(f1(Math.min(xf+40,260)),GF-6,km>1.5?"gorge":"",'font-size="7" font-weight="800" text-anchor="middle" fill="'+INK+'"');
  b+=T(14,TOP+CAP-3,"hard cap rock",'font-size="6" font-weight="700" fill="#fff"')+T(14,TOP+CAP+16,"soft shale",'font-size="6" font-weight="700" fill="#e6e1ea"');
  b+='<path d="M'+XS+',22 v'+(TOP-24)+'" stroke="'+INK+'" stroke-width=".6" stroke-dasharray="2 2"/>'+T(XS-2,20,"where the falls began",'font-size="5.8" font-weight="700" text-anchor="end" fill="'+INK+'"');
  if(km>1)b+='<path d="M'+f1(xf)+',30 H'+XS+'" stroke="'+ACC+'" stroke-width="1"/><path d="M'+f1(xf)+',27 v6 M'+XS+',27 v6" stroke="'+ACC+'" stroke-width="1"/>'+T(f1((xf+XS)/2),27,km.toFixed(1)+" km",'font-size="7" font-weight="800" text-anchor="middle" fill="#c0561d"');
  if(ov>2.5)b+=T(f1(xf-ov-3),TOP+CAP+8,"undercut",'font-size="5.8" font-weight="700" text-anchor="end" fill="#fff"');
  s.xf=xf;const A=q(svg,".wf-a");if(A)A.innerHTML=h;const B=q(svg,".wf-b");if(B)B.innerHTML=b;
  setPara(svg,"wf-p",s.p>.98?"<b>Today.</b> The falls have moved back about 11 km, about 1 m a year in the 1800s. Since much of the water is now taken for power, the rate has dropped to roughly 30 cm a year.":
   "Spray and swirling water scour the soft shale under the hard cap rock. The lip is left hanging until it breaks off, and the falls step back upstream, leaving a gorge behind them.");
  setSlider(svg,"y",14,198,272,s.p,fmt(yrs)+" years")},
 drag:(svg,s,n,x)=>{s.p=clamp((x-14)/272,0,1)},
 tick:(svg,s,dt)=>{s.t+=dt;const fx=q(svg,".wf-fx");if(!fx||s.xf==null)return;const xf=s.xf,off=(s.t*30)%8;
  fx.innerHTML='<path d="M'+f1(xf)+','+(TOP-1)+' Q'+f1(xf+5)+','+(TOP+4)+' '+f1(xf+7)+','+(GF-2)+'" fill="none" stroke="#a9d6f5" stroke-width="5" stroke-dasharray="5 3" stroke-dashoffset="'+f1(-off)+'"/><ellipse cx="'+f1(xf+10)+'" cy="'+(GF-3)+'" rx="'+f1(9+Math.sin(s.t*7)*1.5)+'" ry="4" fill="#fff" opacity=".7"/>'}});
add("waterfall","water");
})();

/* ================================================================ 8. Kinds of fault */
(function(){
const SY=78,BY=166,L=14,Rr=188;
const K=[{nm:"Normal fault",f:"Pulled apart (tension)",m:"Upper block slides down",mk:"Steep scarps, rift valleys",ex:"East African Rift",ex2:"Basin and Range, USA",p:"When the crust is stretched, the block above a sloping crack slides down it, leaving a step in the ground called a fault scarp."},
 {nm:"Reverse fault",f:"Squeezed (compression)",m:"Upper block pushed up",mk:"Mountains, thrust sheets",ex:"The Himalaya, the Andes",ex2:"where plates collide",p:"When the crust is squeezed, the block above the crack is shoved up and over the other. Low-angle ones, called thrusts, stack rock into mountains."},
 {nm:"Strike-slip fault",f:"Sheared sideways",m:"Blocks slide past",mk:"Bent roads and streams",ex:"San Andreas, California",ex2:"about 5 cm a year",p:"The blocks slide past each other sideways. On the San Andreas Fault, Los Angeles rides north-west on the Pacific plate towards San Francisco."},
 {nm:"Rift valley",f:"Pulled apart (tension)",m:"Middle block drops",mk:"Long valleys and lakes",ex:"East African Rift",ex2:"a few mm a year",p:"Between two normal faults a long block drops down, making a rift valley. Its floor fills with long, deep lakes like Tanganyika, and hot rock rises beneath."}];
const LAY=["#c9a46a","#a8774a","#d8c08c","#8f6a4a","#b88e5c","#7a5a40"];
function strata(id){let h='<g clip-path="url(#'+id+')"><rect x="-300" y="'+(SY-80)+'" width="900" height="400" fill="#b88e5c"/>';for(let i=0;i<8;i++)h+='<rect x="-300" y="'+(SY+i*13)+'" width="900" height="13" fill="'+LAY[i%6]+'"/>';return h+'<rect x="-300" y="'+(SY-4)+'" width="900" height="4" fill="#6aa84f"/></g>'}
make("faults",{title:"Three kinds of fault, and a rift valley",
 src:"Fault types after the US Geological Survey. Rates: San Andreas about 3–5 cm a year; the East African Rift a few millimetres a year. Block diagrams are schematic",
 tabs:["Normal","Reverse","Strike-slip","Rift valley"],h:214,
 state:()=>({d:.6}),
 frame:()=>{let h='<defs><clipPath id="dgFaFr"><rect x="'+L+'" y="30" width="'+(Rr-L)+'" height="'+(BY-30)+'"/></clipPath><clipPath id="dgFaClip"><rect x="6" y="26" width="190" height="146" rx="8"/></clipPath></defs><g clip-path="url(#dgFaClip)"><rect x="6" y="26" width="190" height="146" fill="#dceefa"/><g class="fa-a"></g></g><g class="fa-b"></g>';
  h+=panel(202,26,94,146,"fa",[["Forces","f",26],["Movement","m",45],["Makes","mk",64],["Example","ex",83]]);
  h+='<text class="fa-ex2" x="209" y="125" font-size="5.8" fill="'+SUB+'"></text>';
  h+=para("fa-p",8,175,288,22,6.3)+slider("d",14,206,272,"Movement");return h},
 draw:(svg,s)=>{const k=s.tab,D=K[k],d=s.d*26;let h="",b="";const fr=uid(svg,"dgFaFr");
  const arrow=(x,y,dx,c)=>'<path d="M'+x+','+y+' h'+dx+' m'+(dx>0?-4:4)+',-3 l'+(dx>0?4:-4)+',3 l'+(dx>0?-4:4)+',3" fill="none" stroke="'+(c||"#c0392b")+'" stroke-width="1.8"/>';
  if(k<2){const ft=[92,SY],ux=.5,uy=.866,dir=k===0?1:-1,dx=ux*d*dir,dy=uy*d*dir,id=svg._fid||(svg._fid="fa"+Math.random().toString(36).slice(2,7));
   const fw=[[-300,SY-80],[ft[0]-80*ux*0+ (-80)*0,SY-80],[ft[0],SY],[ft[0]+ux*300,SY+uy*300],[-300,SY+uy*300]];
   const hw=[[ft[0],SY],[ft[0]-80*ux/uy*0,SY],[ft[0]-ux*100,SY-uy*100],[600,SY-uy*100],[600,SY+uy*300],[ft[0]+ux*300,SY+uy*300]];
   const fwp=[[-300,SY-90],[ft[0]-ux*100,SY-uy*100],[ft[0]+ux*300,SY+uy*300],[-300,SY+300]],hwp=[[ft[0]-ux*100,SY-uy*100],[600,SY-uy*100],[600,SY+300],[ft[0]+ux*300,SY+uy*300]];
   h+='<defs><clipPath id="'+id+'f"><path d="'+ln(fwp)+'Z"/></clipPath><clipPath id="'+id+'h"><path d="'+ln(hwp)+'Z"/></clipPath></defs><g clip-path="url(#'+fr+')">';
   h+='<rect x="'+L+'" y="30" width="'+(Rr-L)+'" height="'+(SY-30)+'" fill="#dceefa"/>';
   h+=strata(id+'f').replace('<rect x="-300" y="'+(SY-80)+'"','<rect x="-300" y="'+SY+'"')+'<g transform="translate('+f1(dx)+','+f1(dy)+')">'+strata(id+'h').replace('<rect x="-300" y="'+(SY-80)+'"','<rect x="-300" y="'+SY+'"')+'</g>';
   h+='<path d="M'+f1(ft[0]-ux*20)+','+f1(SY-uy*20)+' L'+f1(ft[0]+ux*120)+','+f1(SY+uy*120)+'" stroke="#3a2a1a" stroke-width="1.2" stroke-dasharray="4 2"/></g>';
   b+=T(50,SY+40,"footwall",'font-size="6.4" font-weight="800" fill="#fff"')+T(150,SY+40,"hanging wall",'font-size="6.4" font-weight="800" text-anchor="middle" fill="#fff"')+T(f1(ft[0]+ux*60+4),f1(SY+uy*60),"fault",'font-size="6.4" font-weight="800" fill="#3a2a1a"');
   if(d>3&&k===0)b+=T(f1(ft[0]+8),f1(SY+dy/2+2),"scarp",'font-size="6" font-weight="800" fill="'+INK+'"');
   b+=k===0?arrow(30,46,-14)+arrow(172,46,14):arrow(16,46,14)+arrow(186,46,-14);
   b+='<path d="M'+f1(ft[0]+ux*80+14)+','+f1(SY+uy*80-4)+' l'+f1(dir*ux*12)+','+f1(dir*uy*12)+'" stroke="'+ACC+'" stroke-width="1.6"/>'}
  else if(k===2){const dd=s.d*60;h+='<rect x="'+L+'" y="30" width="'+(Rr-L)+'" height="'+(BY-30)+'" fill="#d8c79a"/>';
   const blk=(x0,x1,off,c)=>{let g='<g clip-path="url(#'+fr+')"><g transform="translate(0,'+f1(off)+')"><rect x="'+x0+'" y="-60" width="'+(x1-x0)+'" height="300" fill="'+c+'"/>';
     for(let i=-2;i<9;i++)g+='<path d="M'+x0+','+(i*24+40)+' h'+(x1-x0)+'" stroke="#c3b07c" stroke-width=".5"/>';
     g+='<path d="M'+x0+',104 H'+x1+'" stroke="#5b6b80" stroke-width="5"/><path d="M'+x0+',104 H'+x1+'" stroke="#fff" stroke-width=".8" stroke-dasharray="4 4"/>';
     g+='<path d="M'+x0+',64 C'+(x0+20)+',58 '+(x1-20)+',70 '+x1+',64" fill="none" stroke="#3d8fd1" stroke-width="2"/>';return g+'</g></g>'};
   h+=blk(L,101,-dd,"#d3c08d")+blk(101,Rr,0,"#c7b685");
   h+='<path d="M101,30 V'+BY+'" stroke="#3a2a1a" stroke-width="1.4" stroke-dasharray="4 2"/>';
   const la=[52,150-dd],sf=[150,56];b+='<circle cx="52" cy="'+f1(la[1])+'" r="3" fill="#c0392b" stroke="#fff"/>'+T(58,f1(la[1]+2),"Los Angeles",'font-size="6" font-weight="800" fill="'+INK+'"');
   b+='<circle cx="150" cy="56" r="3" fill="'+INK+'" stroke="#fff"/>'+T(156,58,"San Francisco",'font-size="6" font-weight="800" fill="'+INK+'"').replace('x="156"','x="146" text-anchor="end"');
   b+=T(20,40,"Pacific plate",'font-size="6.2" font-weight="800" fill="#7a5a30"')+T(182,40,"North American plate",'font-size="6.2" font-weight="800" text-anchor="end" fill="#7a5a30"');
   b+='<path d="M30,160 v-14 m-3,4 l3,-4 l3,4" stroke="#c0392b" stroke-width="1.6" fill="none"/>'+T(36,158,"N",'font-size="6" font-weight="800" fill="'+INK+'"')+T(101,BY+4,"",'');
   b+=T(56,100,"road",'font-size="5.8" font-weight="700" fill="#fff"').replace('y="100"','y="'+f1(100-dd)+'"')}
  else{const e=s.d*12,dd=e*1.732,a=[61,SY],c=[141,SY],ap=[101,SY+69],id=svg._fid||(svg._fid="fa"+Math.random().toString(36).slice(2,7));
   const Lb=[[-300,SY-90],[a[0]-30*.577,SY-30],[ap[0],ap[1]],[101,400],[-300,400]],Rb=[[600,SY-90],[c[0]+30*.577,SY-30],[ap[0],ap[1]],[101,400],[600,400]],Gb=[[a[0]-30*.577,SY-30],[c[0]+30*.577,SY-30],ap];
   h+='<defs><clipPath id="'+id+'l"><path d="'+ln(Lb)+'Z"/></clipPath><clipPath id="'+id+'r"><path d="'+ln(Rb)+'Z"/></clipPath><clipPath id="'+id+'g"><path d="'+ln(Gb)+'Z"/></clipPath></defs><g clip-path="url(#'+fr+')">';
   h+='<rect x="'+f1(101-e-2)+'" y="'+(SY+40)+'" width="'+f1(2*e+4)+'" height="200" fill="#e8622c"'+tip("Hot rock rises where the crust thins")+'/>';
   const S=x=>strata(id+x).replace('<rect x="-300" y="'+(SY-80)+'"','<rect x="-300" y="'+SY+'"');
   h+='<g transform="translate('+f1(-e)+',0)">'+S("l")+'</g><g transform="translate('+f1(e)+',0)">'+S("r")+'</g><g transform="translate(0,'+f1(dd)+')">'+S("g")+'</g>';
   if(dd>6){const w=lerp(a[0],c[0],.5),lw=(c[0]-a[0])/2+e-4;h+='<rect x="'+f1(101-lw+2)+'" y="'+f1(SY+dd*.35)+'" width="'+f1(2*lw-4)+'" height="'+f1(dd*.65+.5)+'" fill="#2a74c4"'+tip("A rift lake, long and deep, like Tanganyika (1,470 m deep)")+'/>';b+=T(101,f1(SY+dd*.35+dd*.4+3),"rift lake",'font-size="6.2" font-weight="800" text-anchor="middle" fill="#fff"')}
   h+='</g>';b+=arrow(30,46,-14)+arrow(172,46,14)+T(101,SY-8,"rift valley",'font-size="6.6" font-weight="800" text-anchor="middle" fill="'+INK+'"');}
  const A=q(svg,".fa-a");if(A)A.innerHTML=h;const B=q(svg,".fa-b");if(B)B.innerHTML=b;
  txt(svg,".fa-nm",D.nm);["f","m","mk","ex"].forEach(c=>txt(svg,".fa-"+c,D[c]));txt(svg,".fa-ex2",D.ex2);setPara(svg,"fa-p",D.p);
  setSlider(svg,"d",14,206,272,s.d,k===2?Math.round(s.d*15)+" million years":k===3?"pulled "+Math.round(s.d*100)+"%":Math.round(s.d*100)+"%")},
 drag:(svg,s,n,x)=>{s.d=clamp((x-14)/272,0,1)}});
add("faults","plates");
})();

/* ================================================================ 9. Three ways to make rain */
(function(){
const G=160,PK=13;/* ground y; pixels per km */
const K=[{nm:"Convectional",T0:30,lift:"Heat from the ground",cl:"Towering cumulonimbus",rn:"Short, heavy, with thunder",wh:"Tropics; summer afternoons",
   p:"The Sun heats the ground, and warm air rises in bubbles. It cools as it climbs; when it reaches its dew point, cloud forms, building into towering thunderstorms."},
 {nm:"Frontal",T0:15,lift:"Warm air slides over cold",cl:"Thick layers (nimbostratus)",rn:"Long, steady rain",wh:"Mid-latitudes, like Britain",
   p:"Where a warm air mass meets a cold one, the lighter warm air is pushed up over the cold, dense air along the front. It cools, and a wide sheet of cloud brings hours of rain."},
 {nm:"Relief",T0:20,lift:"Mountains in the wind’s way",cl:"Cloud on the windward side",rn:"Wet side, dry rain shadow",wh:"Mawsynram, India; west Norway",
   p:"Wind meets mountains and is forced up. It cools and rains on the windward side; going down the far side it warms again, arriving warm and dry: a rain shadow."}];
const mtn=x=>Math.max(0,2.6*Math.exp(-Math.pow((x-118)/34,2)));
function path(k,u){if(k===0){const x=58+6*Math.sin(u*9);return[x,u*10.5]}
  if(k===1){const x=lerp(12,196,u);return[x,x<40?0:(x-40)*.035]}
  const x=lerp(8,196,u);return[x,mtn(x)+.15]}
make("rain",{title:"Three ways to make rain",
 src:"Air cools by about 10 °C per km as it rises until it is saturated, then by about 6 °C per km. Cloud base is roughly 125 m for every 1 °C between the air temperature and its dew point (World Meteorological Organization). Schematic",
 tabs:["Convectional","Frontal","Relief"],h:214,
 state:()=>({h:.6,u:0,t:0}),
 frame:()=>{let h='<defs><linearGradient id="dgRaSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fb2df"/><stop offset="1" stop-color="#e3f1fb"/></linearGradient><clipPath id="dgRaClip"><rect x="6" y="26" width="190" height="146" rx="8"/></clipPath></defs><g clip-path="url(#dgRaClip)"><rect x="6" y="26" width="190" height="146" fill="url(#dgRaSky)"/><g class="ra-a"></g><g class="ra-fx"></g></g><g class="ra-b"></g>';
  h+=panel(202,26,94,146,"ra",[["Air is lifted by","l",26],["Cloud","c",45],["Rain","r",64],["Typical of","w",83]]);
  h+='<g transform="translate(202,26)">'+T(7,104,"The rising air now",'font-size="5.7" fill="'+SUB+'"')+'<text class="ra-z" x="7" y="114" font-size="7.4" font-weight="900" fill="'+INK+'"></text><text class="ra-cb" x="7" y="128" font-size="6" font-weight="700" fill="#2f6ea8"></text><text class="ra-cb2" x="7" y="137" font-size="5.6" fill="'+SUB+'"></text></g>';
  h+=para("ra-p",8,175,288,22,6.3)+slider("h",14,206,272,"How damp is the air?");return h},
 draw:(svg,s)=>{const k=s.tab,D=K[k],cb=lerp(2.6,.3,s.h),cy=G-cb*PK;let h="",b="";s.cb=cb;
  if(k===0){h+='<rect x="6" y="'+G+'" width="190" height="20" fill="#7a9a54"/><circle cx="176" cy="40" r="9" fill="#ffd34d"/>';for(let i=0;i<6;i++)h+='<path d="M'+(70+i*16)+','+(G-2)+' q3,-5 0,-10 q-3,-5 0,-10" fill="none" stroke="#f0a050" stroke-width=".8" opacity=".7"/>';
   const top=G-10*PK;h+='<path d="M30,'+f1(cy)+' Q32,'+f1(cy-30)+' 44,'+f1(top+20)+' Q40,'+f1(top+4)+' 20,'+f1(top+2)+' L120,'+f1(top)+' Q86,'+f1(top+6)+' 84,'+f1(top+20)+' Q94,'+f1(cy-30)+' 92,'+f1(cy)+'Z" fill="#f4f7fa" stroke="#c9d4df"'+tip("Cumulonimbus: a thundercloud up to 10 km or more tall")+'/>';
   h+='<path d="M28,'+f1(cy)+' H96" stroke="#9aa8b8" stroke-width="2"/>';s.rx=[34,88]}
  else if(k===1){const fl=x=>G-(x-40)*.035*PK;h+='<path d="M40,'+G+' L196,'+f1(fl(196))+' L196,'+G+'Z" fill="#6fa3d6" opacity=".75"'+tip("Cold, dense air pushes in under the warm air")+'/>';h+='<rect x="6" y="'+G+'" width="190" height="20" fill="#7a9a54"/>';
   const x0=Math.max(40,40+cb/.035),pts=[];for(let x=x0;x<=196;x+=4)pts.push([x,fl(x)-2]);for(let x=196;x>=x0;x-=4)pts.push([x,fl(x)-lerp(16,44,(x-x0)/150)]);
   if(pts.length>4)h+='<path d="'+ln(pts)+'Z" fill="#e9eef3" stroke="#c4ced8"'+tip("A wide sheet of layered cloud along the front")+'/>';h+='<path d="M40,'+G+' L196,'+f1(fl(196))+'" stroke="#c0392b" stroke-width="1.6"/>';for(let x=60;x<190;x+=24)h+='<circle cx="'+x+'" cy="'+f1(fl(x)-1)+'" r="3" fill="#c0392b"/>';
   b+=T(14,G-8,"warm air",'font-size="6.6" font-weight="800" fill="#c0561d"')+T(180,G-6,"cold air",'font-size="6.6" font-weight="800" text-anchor="end" fill="#1d5f99"')+T(100,f1(fl(100)+12),"front",'font-size="6" font-weight="800" fill="#1d5f99"');s.rx=[x0+4,Math.min(196,x0+110)]}
  else{const pts=[];for(let x=6;x<=196;x+=2)pts.push([x,G-mtn(x)*PK]);h+='<path d="'+ln(pts)+'L196,180L6,180Z" fill="#8a9a64"/>';
   h+='<path d="'+ln(pts.filter(p=>p[0]>118))+'L196,180L118,180Z" fill="#c9b07a"/>';
   if(cb<2.6){const xs=pts.filter(p=>p[0]<=118&&(G-p[1])/PK>=cb);if(xs.length){const x0=xs[0][0];h+='<path d="M'+f1(x0-4)+','+f1(cy)+' Q'+f1(x0+10)+','+f1(cy-18)+' 100,'+f1(Math.min(cy,G-2.6*PK)-14)+' Q122,'+f1(G-2.6*PK-18)+' 128,'+f1(G-2.6*PK+4)+' Z" fill="#eef2f6" stroke="#c4ced8"/>';s.rx=[x0,116]}else s.rx=null}else s.rx=null;
   b+=T(30,G+12,"windward: wet",'font-size="6.2" font-weight="800" fill="#fff"')+T(186,G+12,"lee: dry",'font-size="6.2" font-weight="800" text-anchor="end" fill="#7a5a2a"')+T(14,40,"wind →",'font-size="6.6" font-weight="800" fill="'+INK+'"');
   if(cb>=2.6||!s.rx)b+=T(101,50,"Air too dry: cloud base above the mountain",'font-size="6" font-weight="800" text-anchor="middle" fill="#b5533c"')}
  h+='<path d="M6,'+f1(cy)+' H196" stroke="#2f6ea8" stroke-width=".7" stroke-dasharray="3 3"/>';b+=T(192,f1(cy-2),"cloud base",'font-size="5.6" font-weight="700" text-anchor="end" fill="#2f6ea8"');
  for(let km=2;km<=10;km+=2)b+=T(9,f1(G-km*PK+2),km+" km",'font-size="5" fill="'+SUB+'"');
  const A=q(svg,".ra-a");if(A)A.innerHTML=h;const B=q(svg,".ra-b");if(B)B.innerHTML=b;
  txt(svg,".ra-nm",D.nm);txt(svg,".ra-l",D.lift);txt(svg,".ra-c",D.cl);txt(svg,".ra-r",D.rn);txt(svg,".ra-w",D.wh);
  txt(svg,".ra-cb","Cloud base: "+fmt(Math.round(cb*10)*100)+" m");txt(svg,".ra-cb2",s.h>.7?"damp air: low cloud, more rain":s.h<.3?"dry air: cloud forms high up":"");
  setPara(svg,"ra-p",D.p);setSlider(svg,"h",14,206,272,s.h,s.h<.3?"dry":s.h<.7?"fairly damp":"very damp")},
 onTab:(svg,s)=>{s.u=0},
 drag:(svg,s,n,x)=>{s.h=clamp((x-14)/272,0,1)},
 tick:(svg,s,dt)=>{const k=s.tab,D=K[k],fx=q(svg,".ra-fx");if(!fx)return;s.t+=dt;s.u=(s.u+dt/7)%1;
  /* follow one parcel of air and its temperature */
  let T0=D.T0,z0=0,Tn=T0,zm=0;const N=40;for(let i=0;i<=N;i++){const [x,z]=path(k,s.u*i/N);const dz=z-z0;z0=z;Tn-=dz*(dz>0&&z>s.cb?6:9.8)}
  const [x,z]=path(k,s.u),y=G-z*PK,sat=z>=s.cb-.02;let h='<circle cx="'+f1(x)+'" cy="'+f1(y)+'" r="5" fill="'+(sat?"#fff":"#f6b26b")+'" stroke="'+(sat?"#9aa8b8":"#e07a2c")+'" stroke-width="1"/>'+T(f1(x+7),f1(y+2),Math.round(Tn)+" °C",'font-size="6.4" font-weight="900" fill="'+INK+'" stroke="#fff" stroke-width="2" paint-order="stroke"');
  if(s.rx){const n=Math.round(4+s.h*12),top=G-s.cb*PK;for(let i=0;i<n;i++){const rx=lerp(s.rx[0],s.rx[1],rnd(i)),ry=top+((s.t*60+rnd(i+20)*80)%Math.max(8,G-top-(k===2?mtn(rx)*PK:0)));h+='<path d="M'+f1(rx)+','+f1(ry)+' l-1,4" stroke="#3d8fd1" stroke-width="1"/>'}}
  fx.innerHTML=h;txt(svg,".ra-z",(z*1000<50?"at the ground":fmt(Math.round(z*10)*100)+" m up")+", "+Math.round(Tn)+" °C"+(sat?", in cloud":""))}});
add("rain","climate");
})();
/* ================================================================ 10. Soils compared */
(function(){
const Y0=74,CM=.5;/* top of the soil; px per cm */
const S=[{nm:"Latosol (oxisol)",k:"rain",top:"Thin: about 15 cm",fert:"Poor: rain washes it out",why:"Heat and rain rot leaves fast",use:"Years after the forest is cleared",
  H:[["O","Leaf litter",5,"#3a2a1a"],["A","Thin topsoil",10,"#5b3a24"],["B","Deep red clay: iron and aluminium left behind",300,"#b5532c"]],
  p:"The forest’s nutrients are in its plants, not its soil. Clear it and within a few years rain washes the thin topsoil away; the red clay can bake hard in the sun.",
  pc:"Nutrients mostly held in the trees"},
 {nm:"Chernozem",k:"grass",top:"Deep: up to 1 m, black",fert:"Very rich",why:"Grass roots die and rot each year",use:"Years after the prairie is ploughed",
  H:[["O","Thin litter",3,"#3a2e22"],["A","Deep black topsoil, full of humus",95,"#2a2320"],["B","Brown subsoil with white lime",45,"#6b5240"],["C","Loess: fine wind-blown dust",60,"#c9b48a"]],
  p:"Ploughing breaks the grass roots that held the soil together. In a drought the bare topsoil blows away in dust storms, as in the US Dust Bowl of the 1930s.",
  pc:"The world’s richest farm soils: Ukraine, the prairies, the pampas"},
 {nm:"Podzol",k:"taiga",top:"Thin and acid",fert:"Poor",why:"Cold slows rotting; acid water leaches",use:"Years after the forest is felled",
  H:[["O","Needles, slow to rot",10,"#3a2e22"],["A","Thin, dark topsoil",5,"#4a3a30"],["E","Bleached grey: acid water washed it out",18,"#cfc8bd"],["B","Rusty layer where iron collects",25,"#a5582a"],["C","Broken bedrock",80,"#9a8a72"]],
  p:"Needles make acid water that drains down, washing iron out of the upper soil (leaving a pale grey layer) and dumping it lower down as a rusty band.",
  pc:"Under the taiga of Canada, Scandinavia and Russia"},
 {nm:"Desert soil (aridisol)",k:"desert",top:"Very thin, pale",fert:"Little humus, can be salty",why:"Too dry for plants to add much",use:"Years of irrigation without drainage",
  H:[["A","Pale, sandy topsoil",6,"#d7b98a"],["B","Subsoil with lime",38,"#c99a6a"],["K","Hard layer of lime (calcrete)",10,"#efe7d6"],["C","Weathered rock",100,"#b08a5e"]],
  p:"Irrigating dry land without draining it lets water evaporate at the surface, leaving its salt behind: a white crust that kills crops. This is salinisation.",
  pc:"Little rain means little rotting and few plants"}];
make("soils",{title:"Soils compared",
 src:"Simplified soil profiles after the FAO World Reference Base and USDA soil taxonomy; depths are typical, not exact. Changes after clearing are schematic",
 tabs:["Rainforest","Grassland","Taiga","Desert"],h:214,
 state:()=>({y:0}),
 frame:()=>{let h='<defs><clipPath id="dgSoClip"><rect x="6" y="26" width="190" height="146" rx="8"/></clipPath></defs><g clip-path="url(#dgSoClip)"><rect x="6" y="26" width="190" height="146" fill="#dcedf9"/><g class="so-a"></g></g><g class="so-b"></g>';
  h+=panel(202,26,94,146,"so",[["Topsoil","t",26],["Fertility","f",45],["Why","w",64]]);
  h+='<g transform="translate(202,26)"><foreignObject x="5" y="86" width="86" height="56"><div xmlns="http://www.w3.org/1999/xhtml" class="so-pc" style="font:500 5.8px/1.32 Inter,system-ui,sans-serif;color:'+SUB+'"></div></foreignObject></g>';
  h+=para("so-p",8,175,288,22,6.3)+slider("y",14,206,272,"Years");return h},
 draw:(svg,s)=>{const D=S[s.tab],yv=s.y;let h="",b="";const k=D.k;
  /* what grows on top */
  const ground='<rect x="6" y="'+(Y0-2)+'" width="190" height="3" fill="'+(k==="desert"?"#d9bf8f":"#6b8f3a")+'"/>';
  let plants="";const clear=yv>.02;
  if(k==="rain"&&!clear)for(let i=0;i<5;i++){const x=24+i*38;plants+='<path d="M'+x+','+Y0+' v-26" stroke="#5a3f28" stroke-width="2.4"/><ellipse cx="'+x+'" cy="'+(Y0-34)+'" rx="18" ry="11" fill="'+(i%2?"#2f7a3a":"#3d8f45")+'"/>'}
  if(k==="grass")for(let i=0;i<34;i++){const x=10+i*5.4;plants+=clear?'<path d="M'+x+','+(Y0-2)+' l2,-2 l2,2" stroke="#a88e5c" stroke-width=".8" fill="none"/>':'<path d="M'+x+','+Y0+' l-1.5,-9 M'+x+','+Y0+' l1.5,-8 M'+x+','+Y0+' v-11" stroke="#6f9a3a" stroke-width=".9"/>'}
  if(k==="taiga"&&!clear)for(let i=0;i<6;i++){const x=20+i*32;plants+='<path d="M'+x+','+(Y0-40)+' l-9,30 h18Z M'+x+','+(Y0-44)+' l-7,20 h14Z" fill="#2c5e3a"/><path d="M'+x+','+(Y0-10)+' v10" stroke="#4a3426" stroke-width="2"/>'}
  if(k==="desert"){if(!clear)for(let i=0;i<3;i++){const x=40+i*60;plants+='<path d="M'+x+','+Y0+' v-20 M'+x+','+(Y0-12)+' h-5 v-6 M'+x+','+(Y0-9)+' h5 v-7" stroke="#4f8a4a" stroke-width="3" stroke-linecap="round" fill="none"/>'}
    else plants+='<path d="M20,'+(Y0-2)+' h160" stroke="#3d8fd1" stroke-width="1.5" stroke-dasharray="6 6"/>'+T(100,Y0-6,"irrigation water",'font-size="6" font-weight="700" text-anchor="middle" fill="#1d5f99"')}
  if(clear&&k!=="desert"&&k!=="grass")plants+='<path d="M30,'+(Y0-2)+' l14,-1 M120,'+(Y0-2)+' l12,-2" stroke="#7a5a3a" stroke-width="2"/>'+T(100,Y0-8,"cleared",'font-size="6.4" font-weight="800" text-anchor="middle" fill="#7a5a3a"');
  if(k==="grass"&&clear)plants+=T(100,Y0-10,"ploughed",'font-size="6.4" font-weight="800" text-anchor="middle" fill="#7a5a3a"');
  /* the horizons, changed by the years after clearing */
  let y=Y0;const loss=k==="rain"?sstep(0,.25,yv):k==="grass"?sstep(0,1,yv)*.35:k==="taiga"?sstep(0,.5,yv)*.5:0;
  D.H.forEach((L,i)=>{let th=L[2]*CM;if(k==="rain"&&i<2)th*=1-loss;if(k==="grass"&&L[0]==="A")th*=1-loss;if(k==="taiga"&&L[0]==="O")th*=1-loss;
   if(th<.3)return;const c=L[3];h+='<rect x="6" y="'+f1(y)+'" width="190" height="'+f1(Math.min(th,180-y))+'" fill="'+c+'"'+tip(L[0]+" horizon: "+L[1]+", about "+L[2]+" cm")+'/>';
   if(L[0]==="B"&&k==="grass")for(let j=0;j<10;j++)h+='<circle cx="'+f1(20+rnd(j)*160)+'" cy="'+f1(y+4+rnd(j+9)*(th-8))+'" r="1.3" fill="#efe9dc"/>';
   if(th>6&&y<168){const dark=["#2a2320","#3a2a1a","#3a2e22","#5b3a24","#4a3a30","#6b5240"].includes(c);b+=T(12,f1(Math.min(y+th/2+3,166)),L[0],'font-size="8" font-weight="900" fill="'+(dark?"#fff":INK)+'"')+T(24,f1(Math.min(y+th/2+3,166)),L[1],'font-size="5.8" font-weight="700" fill="'+(dark?"#f2e8da":INK)+'"')}
   y+=th});
  if(k==="desert"&&yv>.02){const c=sstep(0,1,yv)*6;h+='<rect x="6" y="'+(Y0-1)+'" width="190" height="'+f1(c+1)+'" fill="#f6f3ec"'+tip("Salt crust left as irrigation water evaporates")+'/>';b+=T(150,f1(Y0+c+7),"salt crust",'font-size="6" font-weight="800" fill="'+INK+'"')}
  if(k==="grass"&&yv>.05)for(let i=0;i<8;i++)h+='<circle cx="'+f1(30+rnd(i)*150)+'" cy="'+f1(Y0-14-rnd(i+3)*20)+'" r="'+f1(1.5+rnd(i+6)*2.5)+'" fill="#a8845a" opacity="'+f1(.25+yv*.35)+'"/>';
  /* roots */
  let roots="";if(!clear){const deep=k==="grass"?85:k==="desert"?60:k==="rain"?14:18;for(let i=0;i<9;i++){const x=16+i*21;roots+='<path d="M'+x+','+Y0+' q'+(rnd(i)*8-4)+','+f1(deep*.5)+' '+(rnd(i+2)*10-5)+','+deep+'" stroke="#e8d8b8" stroke-width=".6" fill="none" opacity=".7"/>'}}
  /* depth scale */
  for(let m=0;m<=1.5;m+=.5)b+='<path d="M190,'+f1(Y0+m*100*CM)+' h6" stroke="'+INK+'" stroke-width=".6"/>'+T(188,f1(Y0+m*100*CM+2),m+" m",'font-size="5.4" text-anchor="end" fill="'+INK+'" stroke="#fff" stroke-width="1.6" paint-order="stroke"');
  const A=q(svg,".so-a");if(A)A.innerHTML=h+roots+ground+plants;const B=q(svg,".so-b");if(B)B.innerHTML=b;
  txt(svg,".so-nm",D.nm);txt(svg,".so-t",D.top);txt(svg,".so-f",D.fert);txt(svg,".so-w",D.why);setPara(svg,"so-pc",D.pc);
  setPara(svg,"so-p",yv<.02?"Drag the slider to see what happens when people change the land.":D.p);txt(svg,".g2-sll-y",D.use);setSlider(svg,"y",14,206,272,yv,Math.round(yv*50)+" years")},
 drag:(svg,s,n,x)=>{s.y=clamp((x-14)/272,0,1)}});
add("soils","water");
})();

/* ================================================================ 11. How dry land turns to desert */
(function(){
const GY=120,NS=36;
function reset(s){Object.assign(s,{V:.55,S:.85,yr:0,acc:0,R:.6,G:.35,reg:0,rf:1,hist:[]})}
make("desert",{title:"How land turns to desert, and back",
 src:"A simple model of a dry grazing land like the Sahel: plants protect the soil, and bare soil grows fewer plants. After studies of Sahel droughts and regreening (UN Convention to Combat Desertification; Reij and others, 2009). Not a forecast",
 h:212,state:()=>{const s={};reset(s);return s},
 frame:()=>{let h='<defs><linearGradient id="dgDsSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9cc8ea"/><stop offset="1" stop-color="#f3ead6"/></linearGradient><clipPath id="dgDsClip"><rect x="6" y="6" width="190" height="150" rx="8"/></clipPath></defs><g clip-path="url(#dgDsClip)"><rect x="6" y="6" width="190" height="150" fill="url(#dgDsSky)"/><g class="ds-a"></g></g>';
  h+=panel(202,6,94,150,"ds",[["Year","yr",26],["Plant cover","v",43],["Topsoil","s",60]]);
  h+='<g transform="translate(202,6)"><g class="ds-ch"></g><foreignObject x="5" y="104" width="86" height="44"><div xmlns="http://www.w3.org/1999/xhtml" class="ds-t" style="font:500 5.7px/1.3 Inter,system-ui,sans-serif;color:'+SUB+'"></div></foreignObject></g>';
  h+=slider("r",14,178,124,"Rain")+slider("g",162,178,124,"Animals grazing");
  h+=btn("reg",14,193,104,"Regreening: off")+btn("drought",124,193,80,"A drought")+btn("reset",210,193,80,"Start again");return h},
 draw:(svg,s)=>{const V=s.V,S=s.S;let h="";
  const soil=6*S;h+='<rect x="6" y="'+GY+'" width="190" height="40" fill="#d7b98a"/><rect x="6" y="'+GY+'" width="190" height="'+f1(soil)+'" fill="#7a5a3a"'+tip("Topsoil: what holds water and food for plants")+'/>';
  /* a dune creeping in when the soil has blown away */
  const dn=clamp((.55-S)/.5,0,1);if(dn>0)h+='<path d="M6,'+GY+' L6,'+f1(GY-34*dn)+' Q'+f1(20+80*dn)+','+f1(GY-30*dn)+' '+f1(30+120*dn)+','+GY+'Z" fill="#e6c78c"'+tip("Sand drifts over the bare land")+'/>';
  if(s.reg)for(let i=0;i<8;i++){const x=20+i*22;h+='<path d="M'+x+','+(GY+1)+' a5,3 0 0 0 10,0" fill="#5a4030" stroke="#3a2a1a" stroke-width=".5"'+tip("Zaï pits and stone lines catch rain and manure")+'/>'}
  for(let i=0;i<NS;i++){if(rnd(i)>V*1.15)continue;const x=10+i*5.2+rnd(i+50)*3;const tree=rnd(i+90)<.28&&V>.35;
   h+=tree?'<path d="M'+f1(x)+','+GY+' v-14" stroke="#5a3f28" stroke-width="1.4"/><ellipse cx="'+f1(x)+'" cy="'+(GY-17)+'" rx="8" ry="4" fill="#5d8a3a"/>':'<path d="M'+f1(x)+','+GY+' l-2,-6 M'+f1(x)+','+GY+' l2,-6 M'+f1(x)+','+GY+' v-7" stroke="'+(V>.3?"#7aa43a":"#b8a55a")+'" stroke-width="1"/>'}
  const nA=Math.round(s.G*7);for(let i=0;i<nA;i++){const x=24+i*23+rnd(i)*6;h+='<g transform="translate('+f1(x)+','+(GY-6)+')"><ellipse cx="0" cy="0" rx="5" ry="3" fill="#efe7d6" stroke="#6b5a48" stroke-width=".5"/><path d="M-3,2 v4 M3,2 v4" stroke="#6b5a48" stroke-width=".8"/><circle cx="5.5" cy="-2" r="1.8" fill="#efe7d6" stroke="#6b5a48" stroke-width=".5"/></g>'}
  h+='<path d="M90,'+GY+' l-8,-12 h16Z" fill="#c9a46a"/><path d="M84,'+(GY-8)+' h12" stroke="#7a5a3a"/>';
  if(V<.25)for(let i=0;i<6;i++)h+='<ellipse cx="'+f1(40+i*26+((s.yr*18)%26))+'" cy="'+f1(GY-8-rnd(i)*20)+'" rx="'+f1(8+rnd(i+4)*10)+'" ry="3" fill="#c8a87a" opacity="'+f1((.25-V)*2.2)+'"/>';
  const rr=s.R*s.rf;for(let i=0;i<Math.round(rr*12);i++)h+='<path d="M'+f1(20+rnd(i+200)*170)+','+f1(18+rnd(i+300)*40)+' l-1.5,5" stroke="#3d8fd1" stroke-width=".8"/>';
  h+='<circle cx="176" cy="24" r="'+f1(7+4*(1-s.R))+'" fill="#ffd34d"/>';
  const A=q(svg,".ds-a");if(A)A.innerHTML=h;
  /* little history chart of plant cover */
  let c='<rect x="7" y="78" width="80" height="22" rx="3" fill="#fff"/>'+T(9,76,"plant cover, last 40 years",'font-size="5" fill="'+SUB+'"');const H=s.hist;if(H.length>1)c+='<path d="'+ln(H.map((v,i)=>[7+80*i/39,99-v*20]))+'" fill="none" stroke="#5d8a3a" stroke-width="1.2"/>';
  const C=q(svg,".ds-ch");if(C)C.innerHTML=c;
  txt(svg,".ds-nm",V>.45?"Green and grazed":V>.25?"Getting thin":S>.4?"Bare and dusty":"Turning to desert");
  txt(svg,".ds-yr",Math.floor(s.yr)+"");txt(svg,".ds-v",Math.round(V*100)+"%");txt(svg,".ds-s",S>.75?"Healthy":S>.5?"Thinning":S>.3?"Blowing away":"Mostly gone");
  setPara(svg,"ds-t",s.reg?"Regreening: pits, stone lines and protected young trees catch rain and rebuild the soil, as farmers in Niger and Burkina Faso have done.":"Try a drought with lots of animals. Then bring the rain back: does the land recover on its own?");
  const mm=Math.round(100+s.R*500);setSlider(svg,"r",14,178,124,s.R,mm+" mm a year");setSlider(svg,"g",162,178,124,s.G,s.G<.25?"few":s.G<.6?"some":"many");
  btnOn(svg,"reg",!!s.reg);txt(svg,".g2-btn-reg .sm-btn-t","Regreening: "+(s.reg?"on":"off"))},
 drag:(svg,s,n,x)=>{if(n==="r")s.R=clamp((x-14)/124,0,1);if(n==="g")s.G=clamp((x-162)/124,0,1)},
 act:(svg,s,a)=>{if(a==="reg"){s.reg=s.reg?0:1;return true}if(a==="drought"){s.R=.15;return true}if(a==="reset"){reset(s);return true}return false},
 tick:(svg,s,dt)=>{s.rf=s.rf||1;s.acc+=dt*2.2;let ch=false;while(s.acc>=1){s.acc--;s.yr++;ch=true;
   s.rf=.75+.5*rnd(s.yr*7.3);const Ry=s.R*s.rf,K=Math.min(1,clamp((Ry*500)/450,0,1)*(.3+.7*s.S)*(s.reg?1.25:1));
   const V=s.V;s.V=clamp(V+Math.max(-.22*V,.5*V*(1-V/Math.max(K,.02)))-s.G*.42*V/(V+.15)*.6+.006,0,1);
   s.S=clamp(s.S+.05*(s.V-.32)+(s.reg?.03:0),.05,1);s.hist.push(s.V);if(s.hist.length>40)s.hist.shift()}
  if(ch)DG.desert._d(svg,s)}});
add("desert","climate");
})();

/* ================================================================ 12. Water underground */
(function(){
const AQ0=96,AQ1=142;/* aquifer top and the clay beneath, roughly */
const surf=x=>x<70?lerp(40,86,x/70)+4*Math.sin(x/9):x<130?86+(x-70)*.05:x<160?92+10*Math.exp(-Math.pow((x-146)/9,2)):x<200?91:90;
const clayTop=x=>AQ1-x*.04;
const wt0=x=>x<60?lerp(58,86,x/60):x<146?lerp(86,100,(x-60)/86):lerp(100,104,(x-146)/150);
const WELLS=[228,262],QM=[34,19],QX=108;
/* Water budget (review 2026-11): rain soaking in (recharge, 1 unit a year) refills the aquifer; springs, the oasis and
   the qanat let water out again, more when the water table is high (Q falls to 0 as the table drops 3 units). Pumping P
   is extra outflow. dD/dt = K·(P + Q(D) − 1). Pump less than the recharge and the table settles a little lower (the
   springs give up the difference); pump more and it keeps falling until the wells run dry. This is the standard
   "capture" picture of groundwater (Theis 1940; Bredehoeft, Papadopulos & Cooper 1982, "The water budget myth"). */
const RCH=1,PMAX=2.5,KD=1,DMAX=42,outQ=D=>Math.max(0,1-D/3);
make("aquifer",{title:"Water underground",
 src:"Schematic cross-section after the US Geological Survey’s groundwater primers. The High Plains (Ogallala) aquifer under the US Great Plains has dropped by more than 30 m in places since the 1950s (USGS). Qanats after UNESCO’s Persian Qanat listing",
 h:236,state:()=>({p:0,D:0,yr:0,t:0,rate:0,dry:0}),
 frame:()=>{let h='<defs><linearGradient id="dgAqSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9cc8ea"/><stop offset="1" stop-color="#f3ead6"/></linearGradient><pattern id="dgAqSand" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#e2c995"/><circle cx="1.5" cy="1.5" r=".7" fill="#c9a970"/><circle cx="4.5" cy="4.2" r=".7" fill="#c9a970"/></pattern><clipPath id="dgAqClip"><rect x="6" y="6" width="290" height="150" rx="8"/></clipPath></defs>';
  h+='<g clip-path="url(#dgAqClip)"><rect x="6" y="6" width="290" height="150" fill="url(#dgAqSky)"/><g class="aq-a"></g><g class="aq-fx"></g></g><g class="aq-b"></g>';
  h+=para("aq-p",8,157,288,28,6)+slider("p",14,198,150,"Pumping");
  h+=T(14,219,"Water in",'font-size="6" font-weight="800" fill="'+SUB+'"')+T(14,231,"Water out",'font-size="6" font-weight="800" fill="'+SUB+'"')+'<g class="aq-bud"></g>'+btn("reset",214,214,76,"Start again");
  h+='<g transform="translate(176,182)"><text class="aq-yr" x="0" y="8" font-size="7" font-weight="900" fill="'+INK+'"></text><text class="aq-st" x="0" y="19" font-size="6" font-weight="700" fill="'+SUB+'"></text><text class="aq-st2" x="0" y="28" font-size="6" font-weight="700" fill="'+SUB+'"></text></g>';return h},
 draw:(svg,s)=>{const D=s.D;let h="",b="";
  const drop=x=>D*(.5+.5*clamp((x-60)/120,0,1))*(.6+.4*Math.exp(-Math.pow((x-245)/40,2)));
  const wt=x=>wt0(x)+drop(x);
  /* rock layers */
  const sp=[];for(let x=6;x<=296;x+=3)sp.push([x,surf(x)]);
  h+='<path d="'+ln(sp)+'L296,160L6,160Z" fill="url(#'+uid(svg,"dgAqSand")+')"'+tip("Aquifer: sand and gravel full of tiny gaps that hold water")+'/>';
  const cp=[];for(let x=6;x<=296;x+=6)cp.push([x,clayTop(x)]);h+='<path d="'+ln(cp)+'L296,160L6,160Z" fill="#7d6e62"'+tip("Clay: water cannot pass through it")+'/>';
  /* saturated zone below the water table */
  const wp=[];for(let x=6;x<=296;x+=3)wp.push([x,Math.max(wt(x),surf(x))]);const cb=[];for(let x=296;x>=6;x-=6)cb.push([x,clayTop(x)]);
  h+='<path d="'+ln(wp)+ln(cb).replace("M","L")+'Z" fill="#3d8fd1" opacity=".55"'+tip("Groundwater: below the water table every gap is full of water")+'/>';
  h+='<path d="'+ln(wp)+'" fill="none" stroke="#1d5f99" stroke-width="1" stroke-dasharray="4 2"/>';
  h+='<path d="'+ln(sp)+'" fill="none" stroke="#7a9a54" stroke-width="2.4"/>';
  /* qanat: mother well in the hills, a gently sloping tunnel out to the fields */
  const qIn=surf(QM[0])+QM[1],qOut=surf(QX),qOn=wt(QM[0])<qIn-2;
  h+='<path d="M'+QM[0]+','+f1(surf(QM[0]))+' V'+f1(qIn)+' L'+QX+','+f1(qOut)+'" fill="none" stroke="#4a3a2a" stroke-width="2"/>';
  for(let i=1;i<5;i++){const x=QM[0]+i*(QX-QM[0])/5,y=lerp(qIn,qOut,i/5);h+='<path d="M'+f1(x)+','+f1(surf(x))+' V'+f1(y)+'" stroke="#4a3a2a" stroke-width=".8"/><circle cx="'+f1(x)+'" cy="'+f1(surf(x)-1)+'" r="1.6" fill="#8a7a62"/>'}
  b+=T(QM[0]-2,f1(surf(QM[0])-6),"qanat",'font-size="6.4" font-weight="800" fill="'+INK+'"')+T(f1(QX+2),f1(qOut-10),qOn?"fields watered":"qanat dry",'font-size="5.8" font-weight="700" fill="'+(qOn?"#2f7a3a":"#b5533c")+'"');
  /* the oasis where the water table meets the hollow */
  const ox=146,oy=surf(ox),spring=wt(ox)<oy-.5;if(spring)h+='<ellipse cx="'+ox+'" cy="'+f1(oy-1)+'" rx="'+f1(5+Math.min(4,(oy-wt(ox))))+'" ry="2" fill="#2a74c4"'+tip("An oasis: the water table reaches the surface")+'/>';
  for(let i=0;i<3;i++){const x=ox-14+i*13;h+='<path d="M'+x+','+f1(surf(x))+' q1,-8 0,-16" stroke="#7a5a3a" stroke-width="1.6" fill="none"/><path d="M'+x+','+f1(surf(x)-16)+' l-7,3 M'+x+','+f1(surf(x)-16)+' l7,3 M'+x+','+f1(surf(x)-16)+' l-4,-5 M'+x+','+f1(surf(x)-16)+' l4,-5" stroke="'+(spring?"#3d8f45":"#a89a5a")+'" stroke-width="1.6"/>'}
  b+=T(ox,f1(oy+10),spring?"oasis":"oasis dried up",'font-size="6.2" font-weight="800" text-anchor="middle" fill="'+(spring?"#fff":"#b5533c")+'"');
  /* farm wells with pumps */
  let dry=0;WELLS.forEach((x,i)=>{const bot=clayTop(x)-12,on=wt(x)<bot-3;if(!on)dry++;h+='<path d="M'+x+','+f1(surf(x)-8)+' V'+f1(bot)+'" stroke="#5b6b80" stroke-width="2"/><rect x="'+(x-4)+'" y="'+f1(surf(x)-13)+'" width="8" height="6" rx="1" fill="'+INK+'"/>';
    if(s.p>.02&&on)h+='<path d="M'+(x+4)+','+f1(surf(x)-10)+' q8,-4 14,4" stroke="#3d8fd1" stroke-width="1.4" fill="none"/>'});
  b+=T(245,f1(surf(245)-17),"farm wells",'font-size="6.2" font-weight="800" text-anchor="middle" fill="'+INK+'"');
  b+=T(10,f1(clayTop(10)+12),"clay",'font-size="6" font-weight="800" fill="#fff"')+T(170,128,"aquifer",'font-size="6.4" font-weight="800" fill="#fff"')+T(292,f1(wt(292)-3),"water table",'font-size="5.8" font-weight="800" text-anchor="end" fill="#1d5f99"');
  b+=T(14,14,"rain soaks into the hills",'font-size="5.8" font-weight="700" fill="#1d5f99"');
  s.qOn=qOn;s.spring=spring;
  const A=q(svg,".aq-a");if(A)A.innerHTML=h;const B=q(svg,".aq-b");if(B)B.innerHTML=b;
  s.dry=dry;const mr=s.rate*.9;
  txt(svg,".aq-yr","After "+Math.floor(s.yr)+(Math.floor(s.yr)===1?" year":" years"));txt(svg,".aq-st","Water table under the farm: "+Math.round(9+D*.9)+" m down");
  const st2=q(svg,".aq-st2");if(st2){const t=dry?(dry===2?"Both wells dry: drill deeper or stop":"One well has run dry"):mr>.05?"Falling "+f1(mr)+" m a year":mr<-.05?"Rising "+f1(-mr)+" m a year":"Steady";if(st2.textContent!==t)st2.textContent=t;st2.setAttribute("fill",dry||mr>.05?"#b5533c":mr<-.05?"#2f7a3a":SUB)}
  /* the water budget: what comes in each year against what goes out */
  const P=s.p*PMAX,Q=outQ(D),u=38,x0=52;let g='<rect x="'+x0+'" y="213" width="'+f1(RCH*u)+'" height="7" rx="1.5" fill="#3d8fd1"'+tip("Rain soaking into the ground each year: the only thing that refills the aquifer")+'/>';
  g+='<rect x="'+x0+'" y="225" width="'+f1(Math.max(.01,P*u))+'" height="7" rx="1.5" fill="#e8701a"'+tip("Pumped out by the farm wells")+'/><rect x="'+f1(x0+P*u)+'" y="225" width="'+f1(Q*u)+'" height="7" rx="1.5" fill="#46b39a"'+tip("Flowing out at springs, the oasis and the qanat")+'/>';
  g+='<line x1="'+f1(x0+RCH*u)+'" x2="'+f1(x0+RCH*u)+'" y1="211" y2="234" stroke="'+INK+'" stroke-width=".6" stroke-dasharray="1.5 1.5"/>';
  g+=T(f1(x0+Math.max(RCH,P+Q)*u+4),231,P+Q>RCH+.02?"more out than in":P+Q<RCH-.02?"less out than in":"in = out",'font-size="5.8" font-weight="800" fill="'+(P+Q>RCH+.02?"#b5533c":P+Q<RCH-.02?"#2f7a3a":SUB)+'"');
  const BU=q(svg,".aq-bud");if(BU&&BU._h!==g){BU._h=g;BU.innerHTML=g}
  setPara(svg,"aq-p",s.p<.02&&D<.3?"Rain soaks into the hills and refills the aquifer; where the water table meets the ground it flows out as a spring or an oasis. <b>Challenge: what is the most you can pump and keep the water table steady?</b>":
   s.rate<-.05?"You pumped less, so the water table is rising again, but only as fast as the rain soaks in. Real aquifers like the High Plains can take centuries to refill.":
   P>RCH+.02?"<b>Pumping more than the rain puts back:</b> the water table keeps falling. Springs, the oasis and the qanat dry up first, then the wells. It never settles.":
   P>.02?"<b>Pumping less than the rain puts back:</b> the water table settles a little lower, and the springs and oasis give up the difference. Pump more than 100% and it never settles.":
   "Rain soaks into the hills and slowly refills the aquifer. Where the water table meets the ground, water comes out as a spring or an oasis; a qanat taps it without pumps.");
  setSlider(svg,"p",14,198,150,s.p,s.p<.02?"none":Math.round(s.p*PMAX*100)+"% of the rain that soaks in")},
 drag:(svg,s,n,x)=>{s.p=clamp((x-14)/150,0,1);/* snap to "as much as the rain" so it can be found */if(Math.abs(s.p*PMAX-1)<.025)s.p=1/PMAX},
 act:(svg,s,a)=>{if(a==="reset"){s.p=0;s.D=0;s.yr=0;s.rate=0;return true}return false},
 tick:(svg,s,dt)=>{s.t+=dt;/* 3 simulated years a second */const yrs=dt*3,old=s.D;s.rate=KD*(s.p*PMAX+outQ(s.D)-RCH);s.D=clamp(s.D+s.rate*yrs,0,DMAX);if(s.D<=0&&s.rate<0||s.D>=DMAX&&s.rate>0)s.rate=0;s.yr+=yrs;
  if(Math.abs(old-s.D)>.01||Math.floor(s.yr)!==Math.floor(s.yr-yrs))DG.aquifer._d(svg,s);
  const fx=q(svg,".aq-fx");if(!fx)return;let h="";for(let i=0;i<10;i++){const x=12+i*6,y=20+((s.t*50+i*13)%24);h+='<path d="M'+x+','+f1(y)+' l-1,4" stroke="#3d8fd1" stroke-width=".8"/>'}
  if(s.qOn){const qIn=surf(QM[0])+QM[1],qOut=surf(QX);for(let i=0;i<4;i++){const u=((s.t*.25)+i/4)%1;h+='<circle cx="'+f1(lerp(QM[0],QX,u))+'" cy="'+f1(lerp(qIn,qOut,u)-1)+'" r="1.3" fill="#3d8fd1"/>'}}
  fx.innerHTML=h}});
add("aquifer","water");
})();

/* ================================================================ wiring: tour stops and dictionary terms */
const STOPS={};const TERMS={};
function wireAll(){Object.entries(STOPS).forEach(([k,v])=>{if(!PS_DIAG[k]&&DG[String(v).split(":")[0]])PS_DIAG[k]=v})}
window.gfDiag2={STOPS,TERMS};
function finish(){
 wireAll();window.addEventListener("load",wireAll);setTimeout(wireAll,4000);
 const Vis=window.gfDictVis;if(!Vis||Vis._g2)return;Vis._g2=1;
 const fig=t=>'<div class="g2-dict">'+dgFigure(TERMS[t])+'</div>';
 const base=Vis.visual;
 Vis.visual=function(e){const k=e&&TERMS[e.t];if(!k||!DG[String(k).split(":")[0]])return base.apply(this,arguments);let ph="";try{const P=(window.GF_DICT_IMG||{})[e.t];if(P&&P.d)ph=base.apply(this,arguments)}catch(_){}return ph+fig(e.t)};
 Object.keys(TERMS).forEach(t=>{if(Vis.DIAG&&!Vis.DIAG[t])Vis.DIAG[t]=()=>fig(t)});
 const st=document.createElement("style");st.textContent=".g2-dict{margin:4px 0 10px}.g2-dict .ps-dg{max-width:520px}.g2-dict .ps-dg-svg svg{max-height:none}";document.head.appendChild(st)}

Object.assign(STOPS,{
 "volcanoes|Volcanoes":"vtypes:6","volcanoes|Mauna Loa: a giant shield":"vtypes:0","volcanoes|Steep cones: stratovolcanoes":"vtypes:1",
 "volcanoes|A volcano born in a cornfield":"vtypes:2","volcanoes|Yellowstone’s supervolcano":"vtypes:3","volcanoes|Mount St Helens":"vtypes:4",
 "volcanoes|Iceland: fire and ice":"vtypes:5","volcanoes|Floods of lava: the Deccan Traps":"vtypes:5"});
Object.assign(STOPS,{
 "ice|A park losing its glaciers":"glacier:0","ice|The Alps lose their ice":"glacier:0","environment|Vanishing glaciers":"glacier:0",
 "ice|Valleys the ice dug":"glacier:1","coasts|Fjords":"glacier:1","climate|Fjords: carved on windy west coasts":"glacier:1",
 "coasts|A delta named after a letter":"deltas:0","coasts|The biggest delta":"deltas:3",
 "coasts|The Twelve Apostles":"coasterode:0","caves|Caves the sea carved":"coasterode:0","coasts|White cliffs and high cliffs":"coasterode:1","coasts|The coast that eats villages":"coasterode:2",
 "ocean|Upwelling: where the fish are":"upwell:0","ocean|The anchoveta and El Niño":"upwell:0","weather|El Niño":"upwell:1"});
Object.assign(TERMS,{"Glacier":"glacier:0","Moraine":"glacier:0","Fjord":"glacier:1","U-shaped valley":"glacier:1",
 "Delta":"deltas:0","Arcuate delta":"deltas:0","Bird's-foot delta":"deltas:1","Cuspate delta":"deltas:2",
 "Sea stack":"coasterode:0","Headland":"coasterode:0","Coastal erosion":"coasterode:2",
 "Upwelling":"upwell:0","Humboldt Current":"upwell:0","Cold current":"upwell:0","El Niño":"upwell:1","La Niña":"upwell:1","Trade winds":"upwell:1"});
Object.assign(STOPS,{
 "hg6c|Urban sprawl":"urban:0","hg6c|Suburbanisation":"urban:0","hg6c|Greenbelts":"urban:1","hg6c|Smart growth":"urban:2",
 "rivers|The waterfall that walks backwards":"waterfall",
 "plates|Africa is splitting":"faults:3","plates|Los Angeles is coming":"faults:2","plates|Squeezing up the Andes":"faults:1",
 "climate|The rain belt":"rain:0","weather|The lightning capital":"rain:0","weather|Where air masses collide":"rain:1",
 "biomes|Tropical rainforest":"soils:0","biomes|Grasslands: steppe, prairie and pampas":"soils:1","biomes|Taiga":"soils:2","biomes|The desert biome":"soils:3","hg5d|The Dust Bowl":"soils:1",
 "hg5d|Spreading deserts":"desert","deserts|Making deserts, and stopping them":"desert","hazards|The Sahel droughts":"desert","environment|A wall of trees":"desert",
 "deserts|Oases and qanats":"aquifer"});
Object.assign(TERMS,{"Urban sprawl":"urban:0","Suburbanization":"urban:0","Greenbelt":"urban:1","Urban growth boundary":"urban:2","Smart growth":"urban:2",
 "Waterfall":"waterfall","Gorge":"waterfall","Fault":"faults:0","Rift valley":"faults:3","Graben":"faults:3",
 "Convectional rainfall":"rain:0","Precipitation":"rain:0","Lapse rate":"rain:0","Dew point":"rain:0","Frontal precipitation":"rain:1","Front":"rain:1","Air mass":"rain:1","Orographic precipitation":"rain:2",
 "Soil":"soils:1","Soil horizon":"soils:2","Chernozem":"soils:1","Laterite":"soils:0","Humus":"soils:1","Salinization":"soils:3","Soil erosion":"soils:1",
 "Desertification":"desert","Aquifer":"aquifer","Water table":"aquifer","Groundwater":"aquifer","Oasis":"aquifer","Qanat":"aquifer"});
Object.assign(TERMS,{"Volcano":"vtypes:6","Shield volcano":"vtypes:0","Stratovolcano":"vtypes:1","Cinder cone":"vtypes:2","Caldera":"vtypes:3","Supervolcano":"vtypes:3","Lava":"vtypes:0"});

finish();
})();
