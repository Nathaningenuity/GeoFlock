/* GeoFlock: decluttering the guided tours (all tours except "Earth from space", which has its own file).
   The rules, from the October 2026 review of the tour maps:
   1. No chaos: usually one photo pin and at most one or two short labels; extra labels, photos and arrows are removed.
   2. Rivers are not traced by hand-drawn arrows: the stop turns on the rivers layer and highlights the river itself (S.riv).
   3. A small area (a delta, a lake-sized patch, a district, an island…) is circled with a true-size circle that is clearly
      bigger than the feature, and named by ONE photo pin whose line stops at the circle, without a dot (phPin.ringKm).
   4. No line, dot or arrowhead may sit on the thing a stop is about.
   5. Labels and photo pins keep clear of the stop's key area and of each other; the same photo is never shown twice.
   6. A sea-level slider starts at today's sea, so a stop shows on arrival what its text describes.
   How it works: every edit is keyed by tour id and stop title (a stop that has been renamed or removed is skipped), and
   is applied once per steps array (flag steps._gfDecl), at load + 1.5 s and again at +1.5, +5 and +12 s, whenever a tour
   starts, and before a stop draws. Fields that other patches lock with a getter are replaced with Object.defineProperty.
   A placement guard also moves any photo pin whose picture would cover a stop's circle or another pin's point.
   Load it after all the other tour patches. */
(function(){
const def=(o,k,v)=>Object.defineProperty(o,k,{configurable:true,enumerable:true,writable:true,value:v});
/* a field that other patches would overwrite later: it keeps this value (the array itself can still be edited) */
const lock=(o,k,v)=>Object.defineProperty(o,k,{configurable:true,enumerable:true,get(){return v},set(){}});
const strip=s=>String(s==null?"":s).replace(/​/g,"").trim();
const T=id=>{try{const t=typeof PS_TOURS!=="undefined"&&PS_TOURS[id];return t&&Array.isArray(t.steps)?t:null}catch(e){return null}};
const lab=p=>strip(Array.isArray(p)?p[1]:p&&(p.text||p.label));
/* does a pin / photo pin match a selector? (a number is its index, a string is the start of its label, a RegExp tests it) */
const hit=(sel,x,i)=>typeof sel==="number"?sel===i:sel instanceof RegExp?sel.test(lab(x)):lab(x).toLowerCase().startsWith(String(sel).toLowerCase());
const pick=(arr,sels)=>(arr||[]).filter((x,i)=>sels.some(s=>hit(s,x,i)));
const drop=(arr,sels)=>(arr||[]).filter((x,i)=>!sels.some(s=>hit(s,x,i)));
const rep=(S,k,a,b)=>{const v=S[k];if(typeof v==="string"&&v.includes(a))def(S,k,v.split(a).join(b))};

/* ======================================================================================================
   The edits. "tour|stop title": {
     ph: keep only these photo pins (selectors, in this order)     phDrop: drop these photo pins
     pins: keep only these text pins                               pinsDrop: drop these text pins
     icons: false → no icon pins                                   flow: false → no arrows; "river" → arrows become plain river lines
     lines: replacement lines                                      linesDrop: [kinds] lines of these kinds are dropped
     ring: {at:[lon,lat], km, ph: selector of the photo pin that names it (moved to the centre), label: new label}
     riv: rivers to highlight (names of the map's rivers); the rivers layer is turned on
     off: {selector: [dx,dy]} where a photo pin's picture sits, in pixels from its point
     at: {selector: [lon,lat]} move a photo pin's point                label: {selector: "new label"}
     set: {field: value}                                           text: [[field, old phrase, new phrase], …]
     sea: a sea level to start from (0 by default when the stop has a slider) }
   ====================================================================================================== */
const E={};
/* a text pin that names a circled area: no dot, its line stops at the circle */
const RP=(at,km,text)=>({at:[at.slice()],text,ringKm:km});

/* ---------- physical ---------- */
E["climate|Fjords: carved on windy west coasts"]={pins:[],
 lines:[{circle:[8,64],km:1250,kind:"dash"},{circle:[-133,56],km:1300,kind:"dash"},{circle:[-74,-48.5],km:1300,kind:"dash"},{circle:[167.3,-45.3],km:1050,kind:"dash"},{circle:[-26,70.5],km:1050,kind:"dash"}],
 at:{"Milford":[167.3,-45.3]},ringPh:["Milford",1050]};
E["humans|The first tools"]={pins:["Lomekwi","Ledi-Geraru"],ph:["Olduvai"]};
E["humans|Out of Africa again"]={pins:["Bering","Americas"],ph:["Chauvet"]};
E["hazards|The 2004 tsunami"]={pins:["Sri Lanka","Somalia"],ph:["Banda Aceh"],
 lines:[{circle:[95.85,3.3],km:550,kind:"outline"},{coords:[[95.85,3.3],[82.2,7]],kind:"flow"},{coords:[[95.85,3.3],[74,4.2]],kind:"flow"},{coords:[[95.85,3.3],[52,10]],kind:"flow"}],
 at:{"Banda Aceh":[95.85,3.3]},label:{"Banda Aceh":"Epicentre, off Banda Aceh"},ringPh:["Epicentre",550]};
E["lakes|Half fresh, half salty"]={lines:[{circle:[76.8,46.35],km:100,kind:"outline"}],ringPh:["The narrow strait",100]};

/* ---------- history ---------- */
E["heurope|The Hanseatic League"]={pins:["London","Novgorod"],ph:["Lübeck"],flowTo:"dash"};
E["heurope|The Vikings"]={pins:["Normandy","Lindisfarne"],ph:["Dublin"]};
E["heurope|Rome falls, nations rise"]={pins:["Angles","Franks","Visigoths"],flowKeep:[0,1,2]};
E["migration|Lebanon’s global family"]={pins:["São Paulo"],ph:["Beirut"]};
E["migration|Chinese Southeast Asia"]={pins:["Fujian","Guangdong"],ph:["Singapore"]};
E["langrel|Older than Russia’s church"]={pins:["Aksum"],ph:["Ukraine"]};
E["words|Borrowed words"]={pins:["Hindi","Nahuatl","Czech"],flowKeep:[0,1,5]};
E["learning|Print, Protestants and reading"]={pins:["Venice","Wittenberg","Sweden"],ph:["Mainz"],flowKeep:[0,4]};
E["food|Three grains, three cradles"]={pins:[],flow:false};
E["migration|India’s diaspora"]={pins:["Kerala","Silicon Valley"],ph:["Mauritius"],flowKeep:[0,1,2,3],icons:false};
E["hrevolutions|The year of revolutions"]={pins:["Palermo","Paris","Vienna"],flowKeep:[0,1,2]};
E["crops|Crops far from home"]={pins:["Cassava","Potatoes"],ph:["Cocoa"],flowKeep:[0,2,3]};
E["conflicts|Refugees: where people go"]={pins:[],ph:["Refugees at Przemyśl"]};
E["bggs|Animals worth taming"]={pins:["Sheep","Llama","Zebra"],ph:["Horse racing"],iconsNear:1};
E["words|Tea or chá?"]={pins:["Xiamen","Macau","English","Russian"],ph:[]};
E["philosophy|Baghdad: the House of Wisdom"]={pins:["Alexandria","Ujjain"],ph:["Baghdad"],icons:false};
E["migration|China moves to the cities"]={ph:["Shenzhen"],flowKeep:[0,1,4]};
E["learning|The road of paper"]={pins:["Luoyang","Samarkand","Xàtiva"],ph:["Baghdad"]};
E["animals|The Wallace Line"]={pins:["Wallace Line"],ph:["Orangutan","Cassowary"],addPins:[RP([115.75,-8.6],75,"Bali and Lombok: 35 km apart")],addLines:[{circle:[115.75,-8.6],km:75,kind:"outline"}]};
E["ranges|The top of each continent"]={ph:["Kilimanjaro"]};
E["europe|Where Europe ends"]={pins:["Ural River","Caspian Sea"],ph:["Ural Mountains","Caucasus","Bosphorus"],icons:false};
E["literature|Homer’s Troy and Ithaca"]={pins:["Ithaca","Lotus-eaters"],ph:["The walls of Troy","Etna"]};
E["explorers|Captain Cook"]={pins:["Tahiti","Botany Bay"],ph:["Maina"],icons:false,
 lines:null,linesDrop:["circle"],addLines:[{circle:[-159.8,-19.5],km:1800,kind:"outline"}],at:{"Maina":[-159.8,-19.5]},label:{"Maina":"Cook Islands, named after him"},ringPh:["Cook Islands",1800]};

/* ------------------------------------------------------------------------------------------------------ */
function apply(id,S,e){
 if(!S||!e)return;
 if(e.set)for(const k in e.set)def(S,k,e.set[k]);
 const P0=(S.phPins||[]).slice(),N0=Array.isArray(S._pins0)?S._pins0.slice():(S.pins||[]).slice();
 /* the image of every photo pin, so it survives a new label and the pruning that drops photo pins without one */
 const img=q=>{try{const I=window.PS_SQ_IMG||{};return q.img!=null?q.img:q._gfImg!=null?q._gfImg:I[q.label]!=null?I[q.label]:(typeof GF_SQ_OVERRIDE!=="undefined"&&GF_SQ_OVERRIDE[q.label]!=null?GF_SQ_OVERRIDE[q.label]:null)}catch(_){return null}};
 let PH=P0;if(e.ph)PH=pick(P0,e.ph).sort((a,b)=>e.ph.findIndex(s=>hit(s,a,-1))-e.ph.findIndex(s=>hit(s,b,-1)));if(e.phDrop)PH=drop(PH,e.phDrop);
 if(e.ph||e.phDrop)lock(S,"phPins",PH);
 let PN=null;if(e.pins)PN=pick(N0,e.pins);if(e.pinsDrop)PN=drop(PN||N0,e.pinsDrop);if(e.addPins)PN=(PN||N0).concat(e.addPins);
 if(PN){lock(S,"pins",PN.slice());def(S,"_pins0",PN.slice());def(S,"_restored",[])}
 if(e.icons===false)def(S,"iconPins",[]);
 if(e.iconsNear){const keep=[].concat((S.pins||[]).map(p=>Array.isArray(p)?p[0]:p&&p.at),(S.phPins||[]).map(q=>q&&q.at)).filter(a=>Array.isArray(a)&&typeof a[0]==="number");
  def(S,"iconPins",(S.iconPins||[]).filter(c=>c&&keep.some(a=>Math.hypot(a[0]-c.at[0],a[1]-c.at[1])<1.5)))}
 if(e.at)for(const s in e.at){const q=(S.phPins||[]).find((x,i)=>hit(isNaN(s)?s:+s,x,i));if(q)def(q,"at",e.at[s].slice())}
 if(e.off)for(const s in e.off){const q=(S.phPins||[]).find((x,i)=>hit(isNaN(s)?s:+s,x,i));if(q)def(q,"off",e.off[s].slice())}
 if(e.label)for(const s in e.label){const q=(S.phPins||[]).find((x,i)=>hit(isNaN(s)?s:+s,x,i));if(q){const im=img(q);def(q,"label",e.label[s]);if(im!=null){def(q,"img",im);def(q,"_gfImg",im);(window.PS_SQ_IMG=window.PS_SQ_IMG||{})[e.label[s]]=im}}}
 let L=Array.isArray(S.lines)?S.lines.slice():[];
 if(e.lines)L=e.lines.slice();
 if(e.linesDrop)L=L.filter(l=>!(l&&e.linesDrop.includes(l.kind||(l.circle?"circle":""))));
 if(e.flow===false)L=L.filter(l=>!(l&&l.kind==="flow"));
 if(e.flowKeep){let n=-1;L=L.filter(l=>!(l&&l.kind==="flow")||e.flowKeep.includes(++n))}
 if(e.flow==="river")L=L.map(l=>l&&l.kind==="flow"?Object.assign({},l,{kind:"river"}):l);
 if(e.flowTo)L=L.map(l=>l&&l.kind==="flow"?Object.assign({},l,{kind:e.flowTo}):l);
 if(e.addLines)L=L.concat(e.addLines);
 if(e.ringPh){const q=(S.phPins||[]).find((x,i)=>hit(e.ringPh[0],x,i));if(q)def(q,"ringKm",e.ringPh[1])}
 if(e.ring){const r=e.ring;L=L.filter(l=>!(l&&l.circle&&l.kind==="outline"&&Math.hypot(l.circle[0]-r.at[0],l.circle[1]-r.at[1])<1));L.push({circle:r.at.slice(),km:r.km,kind:"outline"});
  const P=S.phPins||[];let q=r.ph!=null?P.find((x,i)=>hit(r.ph,x,i)):P[0];
  if(q){def(q,"at",r.at.slice());def(q,"ringKm",r.km);if(r.label)def(q,"label",r.label)}}
 if(e.lines||e.linesDrop||e.flow!=null||e.ring||e.flowKeep||e.flowTo||e.addLines)def(S,"lines",L);
 if(e.riv){def(S,"riv",e.riv.slice());const on=(S.on||[]).slice();if(!on.includes("allMapsRiversToggle"))on.push("allMapsRiversToggle");def(S,"on",on)}
 if(e.text)e.text.forEach(([k,a,b])=>rep(S,k,a,b));
 if(e.sea!=null)def(S,"gfSea",e.sea);
 def(S,"_enr",1);def(S,"_sqPruned",-1);def(S,"_gfDecl",1);
}
/* ------------------------------------------------------------------------------------------------------
   Rules applied to every stop (also the ones edited above), when it is first shown:
   - the same picture is never shown twice: a photo pin repeating another one's picture is dropped;
   - a text pin that names the same thing as a photo pin next to it is dropped (the photo pin already names it);
   - small circles are made big enough to read (at least ~45 px at the stop's framing), and a photo pin or text pin that
     pointed into such a circle names it from outside instead (no dot, its line ends at the circle). */
const LOG=[];
const words=t=>new Set(strip(t).toLowerCase().replace(/[^a-zà-ÿ’' ]/g," ").split(/\s+/).filter(w=>w.length>=4&&!/^(the|from|with|about|their|where|years?|island|city|river|lake|mount|north|south|east|west)$/.test(w)));
function auto(id,S){if(!S||S._gfAuto)return;def(S,"_gfAuto",1);try{
 const k=id+"|"+strip(S.title),I=window.PS_SQ_IMG||{};
 const img=q=>q&&(q.img!=null?q.img:q._gfImg!=null?q._gfImg:I[q.label]);
 const P=S.phPins;if(Array.isArray(P)&&P.length>1){const seen=new Set();for(let i=0;i<P.length;i++){const m=img(P[i]);if(m==null)continue;if(seen.has(m)){LOG.push([k,"dup photo",P[i].label]);P.splice(i--,1)}else seen.add(m)}}
 if(Array.isArray(S.pins)&&Array.isArray(S.phPins)&&S.phPins.length){const keep=S.pins.filter(p=>{if(!Array.isArray(p)||Array.isArray(p[0][0])||p[2]==="area")return true;const w=words(p[1]);
   const dup=S.phPins.some(q=>q&&Array.isArray(q.at)&&Math.hypot(q.at[0]-p[0][0],q.at[1]-p[0][1])<1.2&&[...words(q.label)].some(x=>w.has(x)));if(dup)LOG.push([k,"pin = photo",p[1]]);return !dup});
  if(keep.length<S.pins.length){S.pins.length=0;keep.forEach(p=>S.pins.push(p));if(Array.isArray(S._pins0))def(S,"_pins0",keep.slice())}}
 const v=S.flatView||S.view;if(!Array.isArray(v)||!Array.isArray(S.lines))return;
 const W=Math.max(.5,(v[2]-v[0])),latc=(v[1]+v[3])/2,ppk=860/(W*111.32*Math.max(.25,Math.cos(latc*Math.PI/180)));
 S.lines.forEach(L=>{if(!L||!L.circle||!L.km||L._gfBig||!/^(outline|circle|dash)$/.test(L.kind||"")||L.km>400)return;const r=L.km*ppk;if(r>=40)return;
  const km0=L.km,km=Math.round(Math.min(km0*4,46/ppk));if(km<=km0)return;def(L,"km",km);def(L,"_gfBig",km0);LOG.push([k,"circle",km0+" → "+km+" km"]);
  const c=L.circle,inC=a=>Array.isArray(a)&&typeof a[0]==="number"&&d3.geoDistance(a,c)*6371<Math.max(km0*1.3,km*.6);
  (S.phPins||[]).forEach(q=>{if(q&&!q.ringKm&&inC(q.at)){def(q,"at",c.slice());def(q,"ringKm",km);LOG.push([k,"ring photo",q.label])}});
  if(Array.isArray(S.pins))S.pins.forEach((p,j)=>{if(Array.isArray(p)&&!Array.isArray(p[0][0])&&p[2]!=="peak"&&inC(p[0])){S.pins[j]={at:[c.slice()],text:p[1],ringKm:km};LOG.push([k,"ring pin",p[1]])}});
  if(Array.isArray(S._pins0))def(S,"_pins0",S.pins.slice())});
}catch(e){console.error("declutter auto",e)}}

function patchTour(id){const t=T(id);if(!t||id==="space"||t.steps._gfDecl)return;
 t.steps.forEach(S=>{if(!S)return;const k=id+"|"+strip(S.title);try{if(E[k])apply(id,S,E[k])}catch(e){console.error("declutter",k,e)}});
 def(t.steps,"_gfDecl",1)}
function run(){try{if(typeof PS_TOURS==="undefined")return;for(const id in PS_TOURS)patchTour(id)}catch(e){console.error(e)}}
window.gfDeclutter={E,run,apply,auto,LOG};

/* ------------------------------------------------------------------------------------------------------
   Photo pins: a pin can carry off:[dx,dy] (where its picture goes), and no picture may cover the stop's circles or another
   pin's point. When one does, the picture is moved to the nearest free spot around its point (the line just gets longer). */
function guard(inner){return function(){const r=inner.apply(this,arguments);try{
 const box=psContainer&&psContainer(),L=box&&box.querySelector(".ps-phpins"),S=psSteps()[ps.i];
 if(!L||!S||L._for!==S||!Array.isArray(L._off))return r;const P=S.phPins||[];L._user=L._user||[];L._gfK=L._gfK||[];
 const bw=box.clientWidth,bh=box.clientHeight,br=box.getBoundingClientRect();
 const kmPx=at=>{const a=psScreen(at),b=psScreen([at[0]+20/(111.32*Math.cos(at[1]*Math.PI/180)),at[1]]);return a&&b?[a,Math.hypot(b[0]-a[0],b[1]-a[1])/20]:null};
 const circ=[];(S.lines||[]).forEach(l=>{if(l&&l.circle&&l.km){const z=kmPx(l.circle);if(z&&z[1]*l.km<170)circ.push([z[0][0],z[0][1],z[1]*l.km+12])}});
 P.forEach(q=>{if(q&&q.ringKm&&Array.isArray(q.at)){const z=kmPx(q.at);if(z)circ.push([z[0][0],z[0][1],z[1]*q.ringKm+12])}});
 /* small highlighted countries are key areas too */
 if(!S._gfHiZ){const z=[];try{(Array.isArray(S.hi)?S.hi:[]).forEach(c=>{const f=typeof projFeatureFor==="function"&&(projFeatureFor(String(c).toUpperCase())||projFeatureFor(c));if(!f||d3.geoArea(f)>6e-4)return;const b=d3.geoBounds(f);z.push([d3.geoCentroid(f),[b[0][0],b[1][1]],[b[1][0],b[0][1]]])})}catch(_){}def(S,"_gfHiZ",z)}
 S._gfHiZ.forEach(([c,a,b])=>{const C=psScreen(c),A=psScreen(a),B=psScreen(b);if(C)circ.push([C[0],C[1],Math.max(8,A&&B?Math.hypot(B[0]-A[0],B[1]-A[1])/2:8)+26])});
 const pts=[];P.forEach(q=>{const a=q&&Array.isArray(q.at)&&typeof q.at[0]==="number"&&psScreen(q.at);if(a&&!q.ringKm)pts.push(a)});
 (S.pins||[]).forEach(p=>{const at=Array.isArray(p)?p[0]:p&&p.at;if(Array.isArray(at)&&typeof at[0]==="number"){const a=psScreen(at);if(a)pts.push(a)}});
 const rects=[];const R=(el,pad)=>{if(!el||!el.offsetParent)return;const b=el.getBoundingClientRect();if(b.width)rects.push({l:b.left-br.left-pad,t:b.top-br.top-pad,r:b.right-br.left+pad,b:b.bottom-br.top+pad})};
 if(ps.card&&ps.card.classList.contains("ps-over"))R(ps.card,6);box.querySelectorAll(".map-zoom-controls, .globe-btns, .ps-lab").forEach(el=>R(el,3));
 const els=[...L.querySelectorAll(".ps-sq")];let changed=false;
 const ovR=(a,b)=>Math.max(0,Math.min(a.r,b.r)-Math.max(a.l,b.l))*Math.max(0,Math.min(a.b,b.b)-Math.max(a.t,b.t));
 const ovC=(B,c)=>{const dx=Math.max(B.l-c[0],0,c[0]-B.r),dy=Math.max(B.t-c[1],0,c[1]-B.b),d=Math.hypot(dx,dy);return d<c[2]?(c[2]-d)*(c[2]-d):0};
 const boxes=els.map(el=>{if(el.style.display==="none")return null;const b=el.getBoundingClientRect();return{l:b.left-br.left,t:b.top-br.top,r:b.right-br.left,b:b.bottom-br.top}});
 els.forEach((el,k)=>{const q=P[k];if(!q||L._user[k]||!boxes[k])return;const a=psScreen(q.at);if(!a)return;
  const key=circ.map(c=>Math.round(c[2]/6)).join(",")+"|"+bw+"x"+bh;
  if(q.off&&L._gfK[k]!=="off"){L._off[k]=q.off.slice();L._gfK[k]="off";changed=true;return}
  if(q.off||L._gfK[k]===key)return;
  const w=boxes[k].r-boxes[k].l,h=boxes[k].b-boxes[k].t;
  const own=q.ringKm?null:a;
  const cost=(B,dx,dy)=>{let c=0;circ.forEach(z=>c+=ovC(B,z)*60);pts.forEach(p=>{if(p!==own||true){const d=Math.hypot(Math.max(B.l-p[0],0,p[0]-B.r),Math.max(B.t-p[1],0,p[1]-B.b));if(d<14)c+=(14-d)*(14-d)*40}});
   rects.forEach(o=>c+=ovR(B,o)*3);boxes.forEach((o,j)=>{if(o&&j!==k)c+=ovR(B,o)*4});if(B.l<4||B.t<4||B.r>bw-4||B.b>bh-4)c+=5e4;return c+Math.hypot(dx,dy)*.6};
  const cur=boxes[k],c0=cost(cur,(cur.l+cur.r)/2-a[0],(cur.t+cur.b)/2-a[1]);
  L._gfK[k]=key;if(c0<400)return;
  let best=null;const ringR=q.ringKm?(circ.find(c=>Math.hypot(c[0]-a[0],c[1]-a[1])<2)||[0,0,0])[2]:0;
  for(const rad of [0,.7,1,1.4,1.9,2.6])for(let n=0;n<16;n++){const ang=-Math.PI/2+n*Math.PI/8,dx=Math.cos(ang)*(ringR+w*(rad+.6)+10),dy=Math.sin(ang)*(ringR+h*(rad+.6)+8);
   const B={l:a[0]+dx-w/2,t:a[1]+dy-h/2,r:a[0]+dx+w/2,b:a[1]+dy+h/2};const c=cost(B,dx,dy);if(!best||c<best.c)best={c,dx,dy}}
  if(best&&best.c<c0*.7){L._off[k]=[best.dx,best.dy];boxes[k]={l:a[0]+best.dx-w/2,t:a[1]+best.dy-h/2,r:a[0]+best.dx+w/2,b:a[1]+best.dy+h/2};changed=true}});
 if(changed)inner.apply(this,arguments);
}catch(e){console.error(e)}return r}}
function wrap(){if(typeof psPhPinsSync!=="function"||psPhPinsSync._gfDecl)return;const g=guard(psPhPinsSync);g._gfDecl=1;
 /* keep the flags of the wrappers underneath, so they do not wrap again */
 for(const k in psPhPinsSync)try{g[k]=psPhPinsSync[k]}catch(e){}g._gfDecl=1;psPhPinsSync=g}

/* Text pins can name a circled area too: a pin given as {at:[[lon,lat]], text, ringKm} (at = the circle's centre) loses its
   dot, and its line starts at the circle's edge instead of at the centre. */
function wrapLeaders(){if(typeof psLeaders!=="function"||psLeaders._gfDecl)return;const _l=psLeaders;
 psLeaders=function(pinsEl,rects){const r=_l.apply(this,arguments);try{const svg=pinsEl&&pinsEl.querySelector(".ps-leaders");if(!svg||!ps||!ps.pins)return r;
  (rects||[]).forEach((R,k)=>{const P=ps.pins[k];if(!R||!P||!P.ringKm)return;const at=Array.isArray(P.at[0])?P.at[0]:P.at;
   const b=psScreen([at[0]+P.ringKm/(111.32*Math.cos(at[1]*Math.PI/180)),at[1]]);if(!b)return;const rad=Math.hypot(b[0]-R.ax,b[1]-R.ay)+1;
   svg.querySelectorAll("circle").forEach(c=>{if(Math.abs(+c.getAttribute("cx")-R.ax)<.6&&Math.abs(+c.getAttribute("cy")-R.ay)<.6)c.remove()});
   svg.querySelectorAll("line").forEach(l=>{if(Math.abs(+l.getAttribute("x1")-R.ax)<.6&&Math.abs(+l.getAttribute("y1")-R.ay)<.6){const x2=+l.getAttribute("x2"),y2=+l.getAttribute("y2"),d=Math.hypot(x2-R.ax,y2-R.ay);
    if(d>rad+2){l.setAttribute("x1",(R.ax+(x2-R.ax)/d*rad).toFixed(1));l.setAttribute("y1",(R.ay+(y2-R.ay)/d*rad).toFixed(1))}else l.remove()}})})}catch(e){console.error(e)}return r};
 for(const k in _l)try{psLeaders[k]=_l[k]}catch(e){}psLeaders._gfDecl=1}

/* ------------------------------------------------------------------------------------------------------ */
function hooks(){
 wrap();wrapLeaders();
 if(typeof psGo==="function"&&!psGo._gfDecl){const _g=psGo;psGo=function(i){try{if(typeof ps!=="undefined"&&ps){patchTour(ps.tour);const S=psSteps()[i],k=ps.tour+"|"+strip(S&&S.title);
   if(S&&!S._gfDecl&&E[k])apply(ps.tour,S,E[k]);if(S&&ps.tour!=="space")auto(ps.tour,S)}}catch(e){console.error(e)}return _g.apply(this,arguments)};for(const k in _g)try{psGo[k]=_g[k]}catch(e){}psGo._gfDecl=1}
 if(typeof psStart==="function"&&!psStart._gfDecl){const _s=psStart;psStart=function(){const r=_s.apply(this,arguments);try{run()}catch(e){}return r};for(const k in _s)try{psStart[k]=_s[k]}catch(e){}psStart._gfDecl=1}
}
const go=()=>{hooks();run()};
const ready=()=>setTimeout(()=>{go();[1500,5000,12000].forEach(ms=>setTimeout(go,ms))},1500);
if(document.readyState==="complete")ready();else addEventListener("load",ready);
})();
