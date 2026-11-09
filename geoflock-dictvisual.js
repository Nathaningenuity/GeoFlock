/* GeoFlock: pictures in the dictionary. Opening a term shows, in order of preference: its photo (GF_DICT_IMG, Wikimedia
   Commons, credited), a small diagram drawn here for ideas a photo cannot show (the demographic transition, a population
   pyramid, a rain shadow, latitude and longitude, the rank-size rule, von Thünen's rings), or a little map of its example
   place drawn from the map's own country shapes. The library's Pictures tab lists every photo (terms and famous places,
   GF_ICONIC, the tour and map library, country profiles, landmarks) and can be searched by word or by place; a picture opens
   its term, or shows it large with a button to fly the map there. */
(function(){
"use strict";
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]);
const IMG=()=>window.GF_DICT_IMG||{},ICON=()=>window.GF_ICONIC||[];
const credit=P=>'<small class="gfdv-cr">'+esc(P.by||"")+(P.lic?" · "+esc(P.lic):"")+'</small>';
/* ---------- diagrams ---------- */
const AX='stroke="#7a6a55" stroke-width="1.2" fill="none"';
const DIAG={
 "Demographic transition model":()=>{const st=[[0,"High birth and death rates; slow growth"],[1,"Death rate falls: fast growth"],[2,"Birth rate falls: growth slows"],[3,"Both low: little growth"],[4,"Births below deaths: decline"]];
  return'<div class="gfdv-dg gfdv-dtm"><svg viewBox="0 0 320 170"><path '+AX+' d="M30 10V140H310"/>'+
   '<path d="M30 40 C80 40 120 40 140 70 S190 115 230 118 S290 120 310 125" stroke="#d0573a" stroke-width="2.6" fill="none"/>'+
   '<path d="M30 46 C60 46 80 100 110 112 S200 118 310 112" stroke="#2f6f8f" stroke-width="2.6" fill="none"/>'+
   '<path d="M30 132 C120 130 150 90 200 60 S280 38 310 40" stroke="#2e9b5f" stroke-width="2" stroke-dasharray="5 4" fill="none"/>'+
   [0,1,2,3,4].map(i=>'<rect class="gfdv-st" data-s="'+i+'" x="'+(30+i*56)+'" y="10" width="56" height="130" fill="#e8a24a" opacity="0"/>').join("")+
   [1,2,3,4].map(i=>'<line x1="'+(30+i*56)+'" y1="10" x2="'+(30+i*56)+'" y2="140" stroke="#cdbfa6" stroke-dasharray="3 3"/>').join("")+
   [0,1,2,3,4].map(i=>'<text x="'+(58+i*56)+'" y="155" text-anchor="middle" font-size="10" fill="#5a4a36">'+(i+1)+'</text>').join("")+
   '<text x="36" y="34" font-size="9.5" fill="#d0573a">birth rate</text><text x="96" y="124" font-size="9.5" fill="#2f6f8f">death rate</text><text x="236" y="52" font-size="9.5" fill="#2e9b5f">population</text></svg>'+
   '<label class="gfdv-sl">Stage <input type="range" min="1" max="5" value="2"><b></b></label><p class="gfdv-cap" data-st=\''+esc(JSON.stringify(st.map(x=>x[1])))+'\'></p></div>'},
 "Population pyramid":()=>{const young=[9,8.6,8.2,7.8,7.2,6.5,5.6,4.6,3.6,2.6,1.6,.8],old=[5.6,5.8,6,6.2,6.5,6.8,6.9,6.8,6.4,5.6,4.4,3];
  const bars=(A,y0,lab)=>'<g transform="translate(0,'+y0+')">'+A.map((v,i)=>{const y=120-i*10;return'<rect x="'+(80-v*8)+'" y="'+y+'" width="'+v*8+'" height="8.5" fill="#2f6f8f"/><rect x="82" y="'+y+'" width="'+v*7.6+'" height="8.5" fill="#d0573a"/>'}).join("")+'<text x="81" y="142" text-anchor="middle" font-size="10" fill="#5a4a36">'+lab+'</text></g>';
  return'<div class="gfdv-dg"><svg viewBox="0 0 330 160">'+bars(young,0,"Young, growing (e.g. Niger)")+'<g transform="translate(170,0)">'+bars(old,0,"Older, shrinking (e.g. Japan)").replace(/translate\(0,0\)/,"")+'</g><text x="4" y="12" font-size="9" fill="#2f6f8f">men</text><text x="128" y="12" font-size="9" fill="#d0573a">women</text></svg><p class="gfdv-cap">Each bar is an age group, youngest at the bottom: a wide base means many children.</p></div>'},
 "Rain shadow":()=>'<div class="gfdv-dg"><svg viewBox="0 0 320 150"><path d="M0 140 L90 140 L160 40 L230 140 L320 140 Z" fill="#b9a27a"/><path d="M0 140 L90 140 L125 90 L60 140Z" fill="#6aa86a"/><path d="M200 100 L230 140 L320 140 L320 140Z" fill="#e2c98c"/>'+
  '<path d="M10 70 C60 70 110 40 150 25" stroke="#2f6f8f" stroke-width="2" fill="none" marker-end="url(#gfa)"/><path d="M175 30 C215 45 250 80 310 95" stroke="#c7853a" stroke-width="2" fill="none" marker-end="url(#gfa)"/>'+
  '<g fill="#fff" stroke="#9fb3c8"><ellipse cx="105" cy="45" rx="26" ry="12"/><ellipse cx="128" cy="38" rx="20" ry="10"/></g>'+[95,105,115,125].map(x=>'<line x1="'+x+'" y1="60" x2="'+(x-4)+'" y2="76" stroke="#2f6f8f" stroke-width="1.5"/>').join("")+
  '<defs><marker id="gfa" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="#5a4a36"/></marker></defs><text x="8" y="62" font-size="10" fill="#2f6f8f">moist wind</text><text x="58" y="132" font-size="10" fill="#fff">wet side</text><text x="240" y="132" font-size="10" fill="#7a5a2a">dry side</text></svg><p class="gfdv-cap">Air rises over the mountains, cools and drops its rain; it comes down the far side dry and warm.</p></div>',
 "Latitude":()=>'<div class="gfdv-dg"><svg viewBox="0 0 320 160"><circle cx="110" cy="80" r="68" fill="#a9cbe5" stroke="#5a4a36"/>'+[-60,-30,0,30,60].map(a=>{const y=80-68*Math.sin(a*Math.PI/180),w=68*Math.cos(a*Math.PI/180);return'<ellipse cx="110" cy="'+y.toFixed(1)+'" rx="'+w.toFixed(1)+'" ry="'+(w*.18).toFixed(1)+'" fill="none" stroke="'+(a?"#2f6f8f":"#d0573a")+'" stroke-width="'+(a?1.2:2)+'"/><text x="'+(185)+'" y="'+(y+3).toFixed(1)+'" font-size="10" fill="#5a4a36">'+(a?Math.abs(a)+"°"+(a>0?"N":"S"):"0° Equator")+'</text>'}).join("")+'</svg><p class="gfdv-cap">Latitude: how far north or south of the Equator, from 0° to 90° at the poles.</p></div>',
 "Longitude":()=>'<div class="gfdv-dg"><svg viewBox="0 0 320 160"><circle cx="110" cy="80" r="68" fill="#a9cbe5" stroke="#5a4a36"/>'+[-60,-30,0,30,60].map(a=>{const rx=Math.abs(68*Math.sin(a*Math.PI/180));return'<ellipse cx="110" cy="80" rx="'+rx.toFixed(1)+'" ry="68" fill="none" stroke="'+(a?"#2f6f8f":"#d0573a")+'" stroke-width="'+(a?1.2:2)+'"/>'}).join("")+'<text x="185" y="40" font-size="10" fill="#d0573a">0°: Greenwich</text><text x="185" y="58" font-size="10" fill="#5a4a36">0–180° east</text><text x="185" y="74" font-size="10" fill="#5a4a36">0–180° west</text></svg><p class="gfdv-cap">Longitude: how far east or west of the prime meridian through Greenwich.</p></div>',
 "Rank-size rule":()=>{const P=[1,.5,.333,.25,.2,.167,.143,.125];return'<div class="gfdv-dg"><svg viewBox="0 0 320 150"><path '+AX+' d="M30 10V130H310"/>'+P.map((p,i)=>'<rect x="'+(40+i*33)+'" y="'+(130-p*110)+'" width="24" height="'+(p*110)+'" fill="#2f6f8f"/><text x="'+(52+i*33)+'" y="143" text-anchor="middle" font-size="9" fill="#5a4a36">'+(i+1)+'</text>').join("")+'<text x="44" y="16" font-size="9.5" fill="#5a4a36">biggest city = 1</text><text x="140" y="60" font-size="9.5" fill="#5a4a36">2nd is ½, 3rd is ⅓…</text></svg><p class="gfdv-cap">The nth-largest city has about 1/n of the biggest city’s people.</p></div>'},
 "Von Thünen model":()=>{const R=[["#5a4a36","City"],["#7fb069","Dairy, market gardens"],["#2e7d32","Forest (fuel, timber)"],["#d9c26a","Grain"],["#c7a27a","Ranching"]];
  return'<div class="gfdv-dg"><svg viewBox="0 0 320 150">'+R.slice().reverse().map((r,i)=>'<circle cx="80" cy="75" r="'+(66-i*14)+'" fill="'+r[0]+'"/>').join("")+R.map((r,i)=>'<rect x="170" y="'+(18+i*24)+'" width="14" height="14" fill="'+r[0]+'"/><text x="190" y="'+(29+i*24)+'" font-size="10.5" fill="#3d2a16">'+r[1]+'</text>').join("")+'</svg><p class="gfdv-cap">Farther from the market, transport costs more, so land use changes ring by ring.</p></div>'}
};
/* ---------- the little map ---------- */
function mini(e){if(!e.m||!e.m.at)return"";return'<div class="gfdv-mm"><canvas width="560" height="300" data-ll="'+e.m.at.join(",")+'" data-z="'+(e.m.z||4)+'"></canvas><small>'+esc(e.e?String(e.e).split(/[;:,(]/)[0]:"On the map")+'</small></div>'}
/* the little map: a piece of the Relief map (Natural Earth picture: land cover, mountains and the sea floor), with the place marked */
const RH={};const relief=h=>RH[h]||(RH[h]=new Promise((res,rej)=>{const im=new Image();im.onload=()=>res(im);im.onerror=rej;im.src="textures/GLOBE_RELIEF_"+h+"_LK_NE.webp?v=1"}));
function drawMini(cv){try{if(cv._done)return;cv._done=1;
 const ll=cv.dataset.ll.split(",").map(Number),z=+cv.dataset.z||4,W=cv.width,H=cv.height,x=cv.getContext("2d");
 /* the same area the old globe view showed: degrees across, widened by latitude so shapes keep their proportions */
 const scale=Math.min(4000,H*.45*Math.pow(1.55,z-1)),wDeg=W/scale*180/Math.PI,k=Math.max(.2,Math.cos(ll[1]*Math.PI/180));
 const lonSpan=wDeg/k,latSpan=wDeg*H/W,lon0=ll[0]-lonSpan/2,lat0=Math.min(90,ll[1]+latSpan/2);
 x.fillStyle="#2a5d9a";x.fillRect(0,0,W,H);
 Promise.all([relief("W"),relief("E")]).then(([iw,ie])=>{const pxd=iw.width/180;
  /* each half covers 180° of longitude and the whole height; draw what falls in the window (also across the date line) */
  [[iw,-180],[ie,0]].forEach(([im,base])=>[-360,0,360].forEach(off=>{const L=Math.max(lon0,base+off),R=Math.min(lon0+lonSpan,base+off+180);if(R<=L)return;
   const sx=(L-base-off)*pxd,sw=(R-L)*pxd,sy=(90-lat0)*pxd,sh=latSpan*pxd;x.drawImage(im,sx,sy,sw,sh,(L-lon0)/lonSpan*W,0,sw/(lonSpan*pxd)*W,H)}));
  const px=(ll[0]-lon0)/lonSpan*W,py=(lat0-ll[1])/latSpan*H;
  x.beginPath();x.arc(px,py,11,0,2*Math.PI);x.fillStyle="rgba(255,255,255,.35)";x.fill();x.beginPath();x.arc(px,py,6,0,2*Math.PI);x.fillStyle="#d0573a";x.fill();x.strokeStyle="#fff";x.lineWidth=2.2;x.stroke()}).catch(()=>{cv._done=0})}catch(er){}}
function visual(e){const P=IMG()[e.t];if(P&&P.d)return'<figure class="gfdv-fig"><img loading="lazy" alt="'+esc(e.t)+'" src="'+esc(P.d)+'"><figcaption>'+esc(P.caption||"")+credit(P)+'</figcaption></figure>';
 if(DIAG[e.t])return DIAG[e.t]();return mini(e)}
/* ---------- the Pictures tab ---------- */
/* Every picture on the site goes into one index, made the first time the tab opens (not at page load): dictionary photos,
   famous places (GF_ICONIC), the tour and map photo library (titled by the stops and pins that show it), each country's
   profile photos, landmark photos (GF_LANDMARKS carry their country), capital photos, tagged photos, and tour photo pins and
   stop photos, which are placed in the country that contains their coordinates (a picture of the map's own country
   shapes, read pixel by pixel, with the smallest countries tested exactly). A search for a country or a city returns
   every picture paired with that place, its own first: country names match as whole names, so "Port of Spain" is not
   Spain. Any other search also shows the other pictures of the places its pictures belong to. */
const nrm=s=>" "+String(s==null?"":s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[’'`]/g,"").replace(/[^a-z0-9]+/g," ").trim()+" ";
const OKD=/^(photos\/|data:|https?:)/;
/* which country a point is in */
let CCL=null;
function ccLookup(){if(CCL)return CCL;const memo=new Map();CCL=ll=>null;
 try{const F=projFeatures().filter(f=>f&&f.geometry&&f.properties&&f.properties.c);const W=3000,H=1500;
  const cv=document.createElement("canvas");cv.width=W;cv.height=H;const x=cv.getContext("2d",{willReadFrequently:true});
  const path=d3.geoPath(d3.geoEquirectangular().scale(W/(2*Math.PI)).translate([W/2,H/2]).precision(0),x);
  const small=[],codes=[];
  F.forEach(f=>{const c=String(f.properties.c).toLowerCase(),b=d3.geoBounds(f),dx=b[1][0]-b[0][0],dy=b[1][1]-b[0][1];
   if(dx>=0&&dx<.7&&dy<.7){small.push({f,b,c});return}
   const id=codes.push(c);x.beginPath();path(f);x.fillStyle="rgb("+(id&255)+","+(id>>8)+","+((id*67)%251+4)+")";x.fill()});
  const D=x.getImageData(0,0,W,H).data,G=new Uint16Array(W*H);
  for(let i=0,o=0;i<G.length;i++,o+=4){if(D[o+3]!==255)continue;const id=D[o]|(D[o+1]<<8);if(id&&D[o+2]===(id*67)%251+4)G[i]=id}
  cv.width=cv.height=1;
  const inB=(b,ll,m)=>ll[0]>=b[0][0]-m&&ll[0]<=b[1][0]+m&&ll[1]>=b[0][1]-m&&ll[1]<=b[1][1]+m;
  CCL=ll=>{const k=ll[0].toFixed(3)+","+ll[1].toFixed(3);if(memo.has(k))return memo.get(k);let r=null;
   for(const s of small)if(inB(s.b,ll,0)&&d3.geoContains(s.f,ll)){r=s.c;break}
   if(!r){const px=Math.floor((ll[0]+180)/360*W),py=Math.floor((90-ll[1])/180*H),g=(a,b)=>b<0||b>=H?0:G[b*W+((a%W)+W)%W];
    let id=g(px,py);
    /* on a coast the point can land just off the drawn shore: take the nearest country within a few pixels (about 40 km) */
    for(let rad=1;!id&&rad<=3;rad++){let best=1e9;for(let dy=-rad;dy<=rad;dy++)for(let dx=-rad;dx<=rad;dx++){const v=g(px+dx,py+dy),d=dx*dx+dy*dy;if(v&&d<best){best=d;id=v}}}
    if(id)r=codes[id-1]}
   if(!r)for(const s of small)if(inB(s.b,ll,.25)){r=s.c;break}
   memo.set(k,r);return r}}catch(e){console.error(e)}
 return CCL}
/* other names people type for some countries */
const ALIAS={us:["usa","united states of america","the united states"],gb:["uk","britain","great britain"],cd:["drc","democratic republic of the congo","congo kinshasa"],cg:["republic of the congo","congo brazzaville"],
 ci:["ivory coast"],cz:["czech republic"],mm:["burma"],tr:["turkiye"],sz:["swaziland"],mk:["macedonia"],cv:["cape verde"],tl:["east timor"],va:["vatican","the vatican","holy see"],ae:["uae","emirates"],
 nl:["holland","the netherlands"],kr:["korea","republic of korea"],kp:["dprk"],bs:["the bahamas"],gm:["the gambia"],mo:["macao"],ru:["russian federation"],ps:["palestinian territories"]};
/* names that contain a country's name but are somewhere else, or are not places at all */
const EXTRA_MASK=["northern ireland","new jersey","new mexico","new guinea","gulf of mexico","guinea pig","guinea pigs","guinea fowl","guinea worm","wild turkey","turkey vulture","panama hat","panama hats"];
let IDX=null,IDXN=-1,PL=null,MASK=new Map();
const cname=c=>{try{const C=COUNTRY_BY_CODE[c];if(C)return C.n}catch(e){}return String(c).toUpperCase()};
function buildIdx(){const D=window.PS_PHOTO_DATA||(typeof PS_PHOTO_DATA!=="undefined"?PS_PHOTO_DATA:[]);
 if(IDX&&IDXN===D.length)return IDX;try{if(typeof gfMergeExtra==="function")gfMergeExtra()}catch(e){}IDXN=D.length;
 const L=[],byD=new Map(),byF=new Map();D.forEach((P,i)=>{if(P&&P.f&&!byF.has(P.f))byF.set(P.f,i)});
 const get=(P,kind,t)=>{const k=P&&P.d?String(P.d):"";if(!OKD.test(k))return null;let x=byD.get(k);
  if(!x){x={i:L.length,kind,t:t||"Photo",P,parts:[],cc:{},own:{},ll:[]};byD.set(k,x);L.push(x)}return x};
 const txt=(x,...a)=>{if(x)a.forEach(s=>{s=String(s==null?"":s).replace(/​/g,"").trim();if(s&&!x.parts.includes(s))x.parts.push(s)})};
 const pin=(x,c,r)=>{if(!x||!c)return;c=String(c).toLowerCase();if(x.cc[c]==null||x.cc[c]>r)x.cc[c]=r};
 const at=(x,ll)=>{if(x&&ll&&isFinite(ll[0])&&isFinite(ll[1])&&!x.ll.some(q=>Math.abs(q[0]-ll[0])<.01&&Math.abs(q[1]-ll[1])<.01))x.ll.push([+ll[0],+ll[1]])};
 const byFile=f=>{const i=byF.get(f);return i==null?null:D[i]};
 /* dictionary terms and famous places keep their own click (the term, or the big view with a fly-there button) */
 Object.entries(IMG()).forEach(([t,P])=>{const x=get(P,"term",t);txt(x,t,P.caption)});
 ICON().forEach(P=>{const x=get(P,"place",P.name||P.caption);txt(x,P.name,P.caption);if(P.ll)at(x,P.ll)});
 /* each country's profile photos, in the profile's order */
 try{const CP=window.PS_CPHOTO||{};for(const c in CP)(CP[c]||[]).forEach(([i,cap],k)=>{const x=get(D[i],"photo",cap);if(!x)return;txt(x,cap);pin(x,c,0);if(x.own[c]==null)x.own[c]=k})}catch(e){}
 /* landmarks: name, place and country */
 try{(window.GF_LANDMARKS||[]).forEach(r=>{const x=get(byFile(r[5]),"photo",r[0]);if(!x)return;txt(x,r[0],...(r[6]||[]));pin(x,r[3],1);at(x,[r[1],r[2]])})}catch(e){}
 /* capital photos */
 try{const dI=new Map();D.forEach((P,i)=>{if(P&&P.d&&!dI.has(P.d))dI.set(typeof gfSrc==="function"?gfSrc(P.d):P.d,i)});
  Object.values(COUNTRY_BY_CODE).forEach(C=>{const s=typeof gfCapPhoto==="function"?gfCapPhoto(C.c):null;if(!s)return;const i=dI.get(s.src);if(i==null)return;const cap=(C.caps||[])[0];
   const x=get(D[i],"photo",cap?cap+", the capital":C.n);txt(x,cap,cap?cap+", the capital":"");pin(x,C.c,1);if(x)(x.capOf=x.capOf||[]).push(C.c)})}catch(e){}
 /* tagged photos (a name and a country) and the name index of the Maps search */
 try{const T=window.PS_PHOTO_TAGS||{};for(const k in T){const h=T[k];const x=get(D[h.img],"photo",h.cap);txt(x,h.cap,k);pin(x,h.c,1)}}catch(e){}
 try{const N=window.GF_NAMEPH||{};for(const k in N){const x=get(byFile(N[k]),"photo",null);txt(x,k)}}catch(e){}
 try{((window.GF_WALL||{}).gameIdx||[]).forEach(g=>{const x=get(D[g.i],"photo",g.label);txt(x,g.label);pin(x,g.c,1);at(x,g.at)})}catch(e){}
 /* the whole tour and map library: titles from the stops and pins that show each photo */
 lib().forEach(y=>{const x=get(y.P,"photo",y.t);if(!x)return;txt(x,y.t,y.P.caption,y.cap)});
 /* tour photo pins, stop photos and their places */
 const SQ=window.PS_SQ_IMG||{};
 try{for(const id in PS_TOURS){const T=PS_TOURS[id];(T&&T.steps||[]).forEach(S=>{const ti=String(S.title||"").replace(/​/g,"");
  (S.phPins||[]).forEach(q=>{if(!q||!q.label)return;const i=q.img!=null?q.img:SQ[q.label];if(i==null)return;const x=get(D[i],"photo",q.label);txt(x,q.label,ti);at(x,q.at)});
  (S.photoPins||[]).forEach(q=>{if(!q)return;const i=q.img!=null?q.img:SQ[q.label];if(i==null)return;const x=get(D[i],"photo",q.label);txt(x,q.label,ti);at(x,q.at)});
  [S.ph,S.photo].forEach(f=>{if(typeof f==="string"){const x=get(byFile(f),"photo",ti);txt(x,ti)}})})}}catch(e){}
 try{(window.PS_SQ_LIB||[]).forEach(q=>{const x=get(D[q.img],"photo",(q.names||[])[0]);txt(x,...(q.names||[]));at(x,q.at)})}catch(e){}
 try{(window.GF_STOP_PHOTOS||[]).forEach(q=>{const x=get(byFile(q.f)||q,"photo",q.label);txt(x,q.label,q.stop);at(x,q.at)})}catch(e){}
 /* place everything that has coordinates */
 const cc=ccLookup();L.forEach(x=>{x.ll.forEach(ll=>pin(x,cc(ll),2));x.txt=nrm(x.t+" "+x.parts.join(" ")+" "+String(x.P.f||"").replace(/\.\w+$/,""))});
 /* place names: countries and cities, with where each city is */
 PL=new Map();const addPL=(k,f)=>{k=nrm(k).trim();if(k.length<3)return;const e=PL.get(k)||{countries:[],cities:[]};f(e);PL.set(k,e)};
 try{Object.values(COUNTRY_BY_CODE).forEach(C=>{[C.n].concat(ALIAS[C.c]||[]).forEach(n=>addPL(n,e=>{if(!e.countries.includes(C.c))e.countries.push(C.c)}))})}catch(e){}
 try{projFeatures().forEach(f=>{const p=f.properties||{},c=String(p.c||"").toLowerCase();if(c&&p.n&&!/\./.test(p.n)&&p.n.toLowerCase()!==c&&!(window.COUNTRY_BY_CODE||{})[c])addPL(p.n,e=>{if(!e.countries.includes(c))e.countries.push(c)})})}catch(e){}
 const capOf=new Map();try{Object.values(COUNTRY_BY_CODE).forEach(C=>(C.caps||[]).forEach(n=>capOf.set(nrm(n).trim(),C.c)))}catch(e){}
 try{(pfmOrig("ALLMAPS_CITIES")||[]).forEach(r=>{const ll=GLOBE_ROBINSON0.invert([r[3],r[4]]);if(!ll)return;const k=nrm(r[0]).trim(),c=capOf.get(k)||cc(ll);addPL(r[0],e=>e.cities.push({n:r[0],ll,c}))})}catch(e){}
 capOf.forEach((c,k)=>{if(!(PL.get(k)||{cities:[]}).cities.length)addPL(k,e=>e.cities.push({n:k.replace(/\b\w/g,m=>m.toUpperCase()),ll:null,c}))});
 MASK=new Map();IDX=L;return L}
/* a whole-name match in a picture's words, leaving out longer names that are other places ("Port of Spain" is not Spain) */
function masks(ph,c){const k=ph+"|"+c;if(MASK.has(k))return MASK.get(k);const w=" "+ph+" ",out=[];
 PL.forEach((e,n)=>{if(n===ph||!(" "+n+" ").includes(w))return;if(e.countries.some(x=>x!==c)||e.cities.some(x=>x.c!==c))out.push(n)});
 EXTRA_MASK.forEach(n=>{if(n!==ph&&(" "+n+" ").includes(w))out.push(n)});out.sort((a,b)=>b.length-a.length);
 const re=out.length?new RegExp("(?<= )(?:"+out.join("|")+")(?= )","g"):null;MASK.set(k,re);return re}
function named(x,ph,c){const w=" "+ph+" ";if(!x.txt.includes(w))return false;const re=masks(ph,c);return re?x.txt.replace(re," ").includes(w):true}
const near=(x,ll,km)=>ll&&x.ll.some(q=>d3.geoDistance(q,ll)*6371<km);
/* the pictures of a country, its own first: profile photos, then landmarks, capital and tagged photos, then those taken there, then those whose words name it */
function countryPics(c,names){const I=IDX,R=[];
 I.forEach(x=>{let r=x.cc[c];if(r==null){if(!names.some(n=>named(x,n,c)))return;r=Object.keys(x.cc).length?4:3}R.push([r,r===0?x.own[c]||0:0,x.i,x])});
 return R.sort((a,b)=>a[0]-b[0]||a[1]-b[1]||a[2]-b[2]).map(a=>a[3])}
function cityPics(city,ph){const R=[];IDX.forEach(x=>{const nr=near(x,city.ll,30),nm=named(x,ph,city.c),cap=x.capOf&&x.capOf.includes(city.c)&&nrm(x.t).includes(" "+ph+" ");
 if(!nr&&!nm&&!cap)return;R.push([cap?0:nr&&nm?0:nr?1:2,x.i,x])});return R.sort((a,b)=>a[0]-b[0]||a[1]-b[1]).map(a=>a[2])}
const ownPics=c=>countryPics(c,namesOf(c)).filter(x=>x.cc[c]!=null||!Object.keys(x.cc).length);
const namesOf=c=>{const n=[nrm(cname(c)).trim()].concat((ALIAS[c]||[]).map(a=>nrm(a).trim()));PL.forEach((e,k)=>{if(e.countries.includes(c)&&!n.includes(k))n.push(k)});return n};
function placeSearch(ph,pl,rest){const keep=x=>rest.every(w=>x.txt.includes(w));const S=[],shown=new Set();
 const sec=(h,L,cap)=>{const out=[];L.forEach(x=>{if(!shown.has(x.i)&&keep(x)){shown.add(x.i);out.push(x)}});if(out.length)S.push({h,L:cap?out.slice(0,cap):out,n:out.length})};
 pl.countries.forEach(c=>{const L=countryPics(c,namesOf(c));sec(cname(c),L.filter(x=>x.cc[c]!=null||!Object.keys(x.cc).length));sec("Elsewhere, naming "+cname(c),L)});
 pl.cities.forEach(city=>{if(pl.countries.includes(city.c))return;sec(city.n+(city.c?", "+cname(city.c):""),cityPics(city,ph))});
 /* the city's country: its other pictures */
 pl.cities.forEach(city=>{if(city.c&&!pl.countries.includes(city.c)&&S.length)sec("More from "+cname(city.c),ownPics(city.c),60)});
 pl.countries.forEach(c=>{pl.cities.forEach(city=>{if(city.c===c)sec("Around "+city.n,cityPics(city,ph))})});
 return S}
function textSearch(W,Q){const I=IDX,A=[];I.forEach(x=>{if(!W.every(w=>x.txt.includes(w)))return;A.push([x.txt.includes(" "+Q+" ")?0:W.every(w=>x.txt.includes(" "+w+" "))?1:W.every(w=>x.txt.includes(" "+w))?2:3,x.i,x])});
 const L=A.sort((a,b)=>a[0]-b[0]||a[1]-b[1]).map(a=>a[2]),S=[];if(!L.length)return S;S.push({h:"",L,n:L.length});
 /* the places these pictures belong to: their other pictures */
 if(L.length<=80){const cnt=new Map();L.forEach(x=>{const ks=Object.keys(x.cc).filter(k=>x.cc[k]<=2);ks.forEach(k=>cnt.set(k,(cnt.get(k)||0)+1))});
  const shown=new Set(L.map(x=>x.i));[...cnt.entries()].sort((a,b)=>b[1]-a[1]).slice(0,3).forEach(([c])=>{const out=ownPics(c).filter(x=>!shown.has(x.i));out.forEach(x=>shown.add(x.i));if(out.length)S.push({h:"More from "+cname(c),L:out.slice(0,30),n:out.length})})}
 return S}
function picSearch(q){const I=buildIdx(),Q=nrm(q).trim();if(!Q)return[{h:"",L:I,n:I.length}];const W=Q.split(" ");
 for(let len=W.length;len>=1;len--)for(let s=0;s+len<=W.length;s++){const ph=W.slice(s,s+len).join(" "),pl=PL.get(ph);if(!pl)continue;
  const S=placeSearch(ph,pl,W.slice(0,s).concat(W.slice(s+len)));if(S.length)return S}
 return textSearch(W,Q)}
let LIB=null,LIBN=-1;
function lib(){const D=window.PS_PHOTO_DATA||(typeof PS_PHOTO_DATA!=="undefined"?PS_PHOTO_DATA:null);if(!D)return[];if(LIB&&LIBN===D.length)return LIB;LIBN=D.length;
 const ctx=new Map(),add=(i,t)=>{if(i==null||i<0||!t)return;t=String(t).replace(/​/g,"").replace(/^[^|]*\|/,"");const a=ctx.get(i)||[];if(!a.includes(t))a.push(t);ctx.set(i,a)};
 try{const PP=window.PS_PHOTO||(typeof PS_PHOTO!=="undefined"?PS_PHOTO:{});for(const k in PP)add(PP[k],k)}catch(e){}
 try{const SQ=window.PS_SQ_IMG||{};for(const k in SQ)add(SQ[k],k)}catch(e){}
 const nice=f=>String(f||"").replace(/\.(jpe?g|png|webp|gif|tiff?|svg)$/i,"").replace(/[_]+/g," ").replace(/\s*\((\d{6,}|cropped|\d+)\)\s*/gi," ").replace(/\s+-\s+\d{4}.*$/,"").replace(/\s{2,}/g," ").trim();
 LIB=[];D.forEach((P,i)=>{if(!P||!P.d||!OKD.test(P.d))return;const c=ctx.get(i)||[];const t=c.find(x=>x.length<48)||nice(P.f)||"Photo";
  LIB.push({kind:"photo",t,P:Object.assign({name:t,caption:c.filter(x=>x!==t).slice(0,3).join(" · ")||nice(P.f)},P),cap:nice(P.f)+" "+c.join(" ")})});return LIB}
let BUILDING=0;
function picsHTML(q){
 /* the first time: say so, gather the pictures just after the tab has drawn, then show the results */
 if(!IDX){if(!BUILDING){BUILDING=1;setTimeout(()=>{try{buildIdx()}catch(e){console.error(e)}BUILDING=0;const qi=document.querySelector(".gflib:not([hidden]) .gflib-q");if(qi&&document.querySelector(".gflib .gfdv-wait"))qi.dispatchEvent(new Event("input"))},40)}
  return'<p class="gflib-empty gfdv-wait">Gathering every picture on the site…</p>'}
 let S;try{S=picSearch(q)}catch(e){console.error(e);S=[]}
 if(!IDX||!IDX.length)return'<p class="gflib-empty">Pictures are on their way.</p>';
 let left=240,total=0;const tile=x=>'<button type="button" class="gfdv-tile" data-pi="'+x.i+'"><img loading="lazy" alt="" src="'+esc(x.P.d)+'"><span>'+esc(x.t)+'</span></button>';
 const body=S.map(s=>{total+=s.n;if(left<=0)return"";const L=s.L.slice(0,left);left-=L.length;
  return(s.h?'<h4 class="gfdv-sec">'+esc(s.h)+' <i>'+s.n.toLocaleString()+(s.n===1?' picture':' pictures')+'</i></h4>':'')+'<div class="gfdv-grid">'+L.map(tile).join("")+'</div>'}).join("");
 if(!S.length)return'<p class="gflib-empty">No picture matches “'+esc(q)+'”.</p>';
 return senses(q)+body+(total>240?'<p class="gflib-empty">'+total.toLocaleString()+' pictures: type to narrow them down.</p>':'')}
/* a word that names several things ("victoria": the falls, the lake, the harbour, cities) gets a row of choices above the
   pictures; each fills the search with that name */
function senses(q){const Q=nrm(q).trim();if(!Q||Q.split(" ").length>2||!IDX)return"";const w=Q;const C=new Map();
 const esc2=t=>t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
 IDX.forEach(x=>{const t=String(x.t||"");if(!nrm(t).includes(" "+w+" "))return;
  const re=new RegExp("((?:(?:Lake|Mount|Mt|Cape|Port|Gulf|Bay|River|Saint|St|Fort|Isla|Lago) )?(?:[A-Z][\\w’'.-]* )*)("+w.split(" ").map(t=>"["+t[0].toUpperCase()+t[0]+"]"+esc2(t.slice(1))).join(" ")+")((?: (?:of |de |la |del |the )?[A-Z][\\w’'.-]*)*)");
  const m=re.exec(t.normalize("NFD").replace(/[\u0300-\u036f]/g,""));if(!m)return;let ph=(m[1]+m[2]+m[3]).trim().replace(/[,.]$/,"");
  /* "Victoria Falls Bridge" counts as Victoria Falls; a bare word as itself */const k=nrm(ph).trim();if(!k||k===w)return;const a=C.get(k)||{ph,n:0};a.n++;C.set(k,a)});
 /* fold longer names into a shorter one they start with, when it is common */
 const L=[...C.entries()].sort((a,b)=>a[0].length-b[0].length);L.forEach(([k,v])=>{const par=L.find(([k2,v2])=>k2!==k&&v2.n>=2&&(k+" ").startsWith(k2+" "));if(par){par[1].n+=v.n;v.n=0}});
 const out=L.filter(([,v])=>v.n>0).sort((a,b)=>b[1].n-a[1].n).slice(0,8).map(([,v])=>v);
 const pl=PL&&PL.get(w);(pl?pl.cities:[]).forEach(c=>{const ph=c.n+", "+cname(c.c);if(c.c&&out.length<10&&!out.some(v=>v.ph===ph))out.push({ph:c.n+", "+cname(c.c),n:0,city:1})});
 if(out.length<2)return"";
 return'<div class="gfdv-senses"><span>Which '+esc(q.trim())+'?</span>'+out.map(v=>'<button type="button" class="gfdv-sense" data-pq="'+esc(v.ph)+'">'+esc(v.ph)+(v.n?' <i>'+v.n+'</i>':'')+'</button>').join("")+'</div>'}
function view(x){const cap=x.parts.filter(s=>s!==x.t&&s.length<90).slice(0,3).join(" · ");return Object.assign({},x.P,{name:x.t,caption:x.P.caption&&x.kind!=="photo"?x.P.caption:cap,ll:x.P.ll||x.ll[0]||null,_cc:Object.keys(x.cc).sort((a,b)=>x.cc[a]-x.cc[b])[0]||null,_words:[x.t].concat(x.parts)})}
/* where a picture is: its own point; else a place the map search knows by one of its names ("Emerald Bay, Lake Tahoe" →
   Lake Tahoe); else its country */
function where(P){if(P._wh!==undefined)return P._wh;let hit=null;
 if(!P.ll&&window.gfSearch){const tries=[];(P._words||[P.name]).forEach(s=>{s=String(s||"");tries.push(s);s.split(/[,·(]|\s[-–—]\s/).forEach(t=>{t=t.replace(/\)$/,"").trim();if(t.length>2)tries.push(t)})});
  for(const t of tries){let r=[];try{r=gfSearch.find(t)||[]}catch(e){}const n=nrm(t).trim();hit=r.find(e=>e&&e.cat!=="terms"&&nrm(e.n).trim()===n)||null;if(hit)break}}
 return(P._wh=P.ll||hit||P._cc?{hit,cc:P._cc}:null)}
function big(P,api){const el=document.createElement("div");el.className="gfdv-lb";el.innerHTML='<div class="gfdv-lbox"><button type="button" class="gfdv-lx" aria-label="Close">×</button><img alt="" src="'+esc(P.d)+'"><div><b>'+esc(P.name||"")+'</b><p>'+esc(P.caption||"")+'</p>'+credit(P)+(where(P)?'<button type="button" class="gfdv-go">🗺️ Find on map</button>':'')+'</div></div>';
 document.body.appendChild(el);const x=()=>el.remove();el.onclick=ev=>{if(ev.target===el)x()};el.querySelector(".gfdv-lx").onclick=x;
 const g=el.querySelector(".gfdv-go");if(g)g.onclick=()=>{x();const W=where(P);try{api.close();api.goMap("satellite",()=>{if(W.hit&&!P.ll){try{gfSearch.show(W.hit);return}catch(e){}}if(!P.ll&&W.cc){try{const h=gfSearch.find(cname(W.cc)).find(e=>e&&e.cat==="countries");if(h){gfSearch.show(h);return}}catch(e){}return}/* the place as a search result (pin, photo, chip to close), when the search knows it; else a ping */let hit=null;try{if(window.gfSearch)hit=gfSearch.find(String(P.name||"")).find(e=>e&&e.ll&&Math.abs(e.ll[0]-P.ll[0])<1.5&&Math.abs(e.ll[1]-P.ll[1])<1.5)}catch(e){}if(hit){try{gfSearch.show(hit);return}catch(e){}}api.flyLL(P.ll,6);setTimeout(()=>api.ping(P.ll,P.name),950)})}catch(e){}}}
function wire(c,api){c.querySelectorAll(".gfdv-mm canvas").forEach(drawMini);
 c.querySelectorAll(".gfdv-dtm").forEach(d=>{const sl=d.querySelector("input"),b=d.querySelector("b"),cap=d.querySelector(".gfdv-cap"),T=JSON.parse(cap.dataset.st);const up=()=>{const v=+sl.value;b.textContent=v;cap.textContent=T[v-1];d.querySelectorAll(".gfdv-st").forEach(r=>r.setAttribute("opacity",+r.dataset.s===v-1?.22:0))};sl.oninput=up;up()});
 c.querySelectorAll(".gfdv-sense").forEach(b=>b.onclick=()=>{const qi=document.querySelector(".gflib:not([hidden]) .gflib-q");if(qi){qi.value=b.dataset.pq;qi.dispatchEvent(new Event("input"))}});
 c.querySelectorAll(".gfdv-tile").forEach(b=>b.onclick=()=>{const x=IDX&&IDX[+b.dataset.pi];if(!x)return;if(x.kind==="term")api.showTerm(x.t);else big(view(x),api)})}
/* the pictures of a place, for the map search's photo card (several to flip through): the first group a search for its name gives */
function picsForPlace(q,max){try{buildIdx();const S=picSearch(q);if(!S.length)return[];return S[0].L.slice(0,max||8).map(x=>({P:x.P,cap:x.t}))}catch(e){return[]}}
window.gfDictVis={visual,picsHTML,wire,DIAG,picsForPlace};
{const s=document.createElement("style");s.textContent=`
.gfdv-fig{margin:4px 0 10px}.gfdv-fig img{display:block;width:100%;max-height:260px;object-fit:cover;border-radius:10px}.gfdv-fig figcaption{font-size:12.5px;color:#6a5a44;margin-top:4px}
.gfdv-cr{display:block;font-size:10.5px;color:#9a8a72}
.gfdv-mm{margin:4px 0 10px}.gfdv-mm canvas{display:block;width:100%;max-width:420px;height:auto;border-radius:10px;border:1px solid #d8ccb4}.gfdv-mm small{font-size:11.5px;color:#7a6a55}
.gfdv-dg{margin:4px 0 10px;padding:8px;border-radius:10px;background:#fbf6ea;border:1px solid #e3d6bc}.gfdv-dg svg{display:block;width:100%;max-width:440px;height:auto}.gfdv-cap{font-size:12.5px;color:#5a4a36;margin:4px 0 0}
.gfdv-sl{display:flex;align-items:center;gap:8px;font-size:12.5px;font-weight:700;color:#5a4a36}.gfdv-sl input{flex:1;max-width:240px}
.gfdv-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px}.gfdv-tile{border:0;padding:0;border-radius:12px;overflow:hidden;background:#fff;cursor:pointer;text-align:left;box-shadow:0 2px 8px rgba(0,0,0,.12)}
.gfdv-sec{margin:14px 0 8px;font:800 14px system-ui;color:#3d2a16}.gfdv-senses{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:4px 0 10px}.gfdv-senses>span{font:800 13px system-ui;opacity:.7;margin-right:4px}.gfdv-sense{border:1px solid rgba(60,40,20,.2);background:#fff;border-radius:99px;padding:5px 11px;font:700 12.5px system-ui;cursor:pointer;color:#3d2a16}.gfdv-sense:hover{background:#fff4dd}.gfdv-sense i{font-style:normal;opacity:.5;margin-left:3px}.gfdv-sec:first-child{margin-top:2px}.gfdv-sec i{font-style:normal;font-weight:600;opacity:.6;font-size:12px}body.sky-night .gfdv-sec{color:#e8ecf6}
.gfdv-tile img{display:block;width:100%;height:100px;object-fit:cover}.gfdv-tile span{display:block;padding:6px 8px;font-size:12.5px;font-weight:700;color:#3d2a16}
.gfdv-lb{position:fixed;inset:0;z-index:3100;background:rgba(10,8,6,.7);display:flex;align-items:center;justify-content:center;padding:16px}
.gfdv-lbox{position:relative;max-width:min(980px,100%);max-height:92vh;overflow:auto;background:#fffaf0;border-radius:16px;padding:14px;display:flex;flex-direction:column;gap:10px}.gfdv-lbox img{max-width:100%;max-height:68vh;object-fit:contain;border-radius:10px;align-self:center}
.gfdv-lx{position:absolute;top:8px;right:10px;border:0;background:rgba(255,250,240,.9);border-radius:50%;width:32px;height:32px;font-size:20px;cursor:pointer}
.gfdv-go{margin-top:8px;border:0;border-radius:999px;padding:7px 14px;font-weight:800;background:#2f6f8f;color:#fff;cursor:pointer}`;document.head.appendChild(s)}
})();
