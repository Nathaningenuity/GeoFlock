/* GeoFlock AP Human Geography games, units 6 and 7 (needs geoflock-hug-plus.js).
   Unit 6: Build a city (Burgess, Hoyt, Griffin–Ford), Central places (serve every village with the fewest towns),
   Rank-size with real cities, Cool the city (urban heat island), Megacity hunt on the City Lights map (live map).
   Unit 7: Weber on the map (drag a factory between real mines and markets), Core and periphery (paint from GDP data),
   Guess the HDI, Route the container ship (choke points, closures), Match the SDGs. */
(function(){
"use strict";
if(!window.HGX||window._hgxD)return;window._hgxD=1;
const G=HGX,D=G.D,esc=G.esc,h=G.h,btn=G.btn,fmt=G.fmt;

/* ===================== UNIT 6 ===================== */
/* ---- Build a city ---- */
const CU=[["cbd","CBD: offices and shops","#d9573a"],["ind","Industry and warehouses","#8a7a6a"],["low","Low-income housing","#e8a24a"],["mid","Middle-income housing","#7fb6e0"],["high","High-income housing","#3a6fb5"],["comm","Commuter suburbs","#9bcf8a"],["inf","Informal settlements","#c9b28a"]];
const CNR=4,CNS=8;/* rings 1..4, 8 sectors; ring 0 is the centre */
const CMODELS=[{id:"burgess",t:"Concentric zone (Burgess, 1925)",desc:"Chicago in the 1920s: the city grows outwards in rings. Around the CBD lies a <b>zone in transition</b> of factories and old housing, then <b>working-class homes</b>, then <b>middle-class homes</b>, then the <b>commuter zone</b>.",
  ans:(r,s)=>r===0?"cbd":["ind","low","mid","comm"][r-1],real:"Chicago"},
 {id:"hoyt",t:"Sector (Hoyt, 1939)",desc:"Cities grow in wedges along transport lines. An <b>industry</b> wedge follows the railway (sectors 1–2, from the CBD to the edge); <b>low-income</b> housing wedges sit on either side of it; the <b>high-income</b> wedge runs out the opposite way (sectors 5–6), with <b>middle-income</b> wedges between.",
  ans:(r,s)=>r===0?"cbd":s<=1?"ind":(s===2||s===7)?"low":(s===4||s===5)?"high":"mid",real:"Boston or Minneapolis"},
 {id:"gf",t:"Latin American (Griffin–Ford, 1980)",desc:"A CBD with an elite <b>spine</b> of high-income homes running out along a grand boulevard (sector 5); a <b>zone of maturity</b> of middle-income homes around the centre (ring 1); <b>zones of in situ accretion</b>, low-income homes slowly improving (rings 2–3); <b>informal settlements</b> on the edge (ring 4), and in a <b>disamenity sector</b> (sector 1) along the river or the dump.",
  ans:(r,s)=>r===0?"cbd":s===4?"high":s===0?"inf":r===1?"mid":r===4?"inf":"low",real:"Lima, Bogotá or Mexico City"}];
function cityCell(r,s,R0,DR){/* a ring sector as an SVG path */if(r===0)return null;const a0=(s/CNS)*2*Math.PI-Math.PI/2-Math.PI/CNS,a1=a0+2*Math.PI/CNS;const r0=R0+(r-1)*DR,r1=r0+DR;const P=(rr,a)=>(rr*Math.cos(a)).toFixed(1)+" "+(rr*Math.sin(a)).toFixed(1);
 return"M"+P(r0,a0)+" L"+P(r1,a0)+" A"+r1+" "+r1+" 0 0 1 "+P(r1,a1)+" L"+P(r0,a1)+" A"+r0+" "+r0+" 0 0 0 "+P(r0,a0)+"Z"}
G.add("u6",[{id:"citybuild",kind:"game",ch:"hg6b",wide:true,title:"Build a city",blurb:"Paint the land uses of a city to match Burgess, Hoyt and the Latin American model; the model checks your work.",skill:"Urban models (6.6): concentric, sector and Latin American city.",
 intro:"Urban models are simplified maps of who lives and works where. Read the description of each model, then build it: paint the rings and wedges of the city with the right land uses.",
 play(el,done,L){
  let mi=0;const best=[0,0,0];
  const level=()=>{const M=CMODELS[mi];const A={};let cur="cbd",brush="ring",checked=false;
   const draw=()=>{const W=420,c=W/2,R0=34,DR=(W/2-8-R0)/CNR;let svg='<svg viewBox="0 0 '+W+' '+W+'" class="hgx-city"><g transform="translate('+c+','+c+')">';
    for(let r=1;r<=CNR;r++)for(let s=0;s<CNS;s++){const u=A[r+","+s],U=CU.find(x=>x[0]===u);const ok=checked&&u===M.ans(r,s);svg+='<path d="'+cityCell(r,s,R0,DR)+'" class="cc'+(checked?(ok?" ok":" no"):"")+'" data-r="'+r+'" data-s="'+s+'"'+(U?' style="fill:'+U[2]+'"':'')+'/>';
     if(checked&&!ok){const a=(s/CNS)*2*Math.PI-Math.PI/2,rr=R0+(r-.5)*DR;const b=CU.find(x=>x[0]===M.ans(r,s));svg+='<circle cx="'+(rr*Math.cos(a)).toFixed(1)+'" cy="'+(rr*Math.sin(a)).toFixed(1)+'" r="6" fill="'+b[2]+'" stroke="#fff" stroke-width="1.5" pointer-events="none"/>'}}
    {const u=A["0,0"],U=CU.find(x=>x[0]===u);const ok=checked&&u==="cbd";svg+='<circle r="'+R0+'" class="cc'+(checked?(ok?" ok":" no"):"")+'" data-r="0" data-s="0"'+(U?' style="fill:'+U[2]+'"':'')+'/>'}
    for(let s=0;s<CNS;s++){const a=(s/CNS)*2*Math.PI-Math.PI/2,rr=W/2-2;svg+='<text x="'+((rr-6)*Math.cos(a)).toFixed(1)+'" y="'+((rr-6)*Math.sin(a)+4).toFixed(1)+'" class="cs">'+(s+1)+'</text>'}
    if(mi===1)svg+='<line x1="0" y1="0" x2="'+((W/2)*Math.cos(-Math.PI/2+Math.PI/8)).toFixed(1)+'" y2="'+((W/2)*Math.sin(-Math.PI/2+Math.PI/8)).toFixed(1)+'" class="crail"/>';
    if(mi===2)svg+='<line x1="0" y1="0" x2="'+((W/2)*Math.cos(-Math.PI/2+Math.PI)).toFixed(1)+'" y2="'+((W/2)*Math.sin(-Math.PI/2+Math.PI)).toFixed(1)+'" class="cblvd"/>';
    svg+='</g></svg>';
    const n=Object.keys(A).length,tot=CNR*CNS+1;let right=0;for(let r=1;r<=CNR;r++)for(let s=0;s<CNS;s++)if(A[r+","+s]===M.ans(r,s))right++;if(A["0,0"]==="cbd")right++;
    el.innerHTML='<div class="hgx-gtabs">'+CMODELS.map((x,k)=>'<button type="button" class="hgx-btn'+(k===mi?" on":"")+'" data-m="'+k+'">'+(best[k]?"✓ ":"")+x.t+'</button>').join("")+'</div>'+
     '<div class="hgx-q"><b>Build the '+esc(M.t)+'</b><small>'+M.desc+'</small></div><div class="hgx-grow"><div class="hgx-gmap">'+svg+(mi===1?'<p class="hgx-dim hgx-small">The dark line is the railway.</p>':mi===2?'<p class="hgx-dim hgx-small">The dashed line is the grand boulevard of the spine.</p>':'')+'</div><div class="hgx-gside">'+
     '<div class="hgx-pal">'+CU.map(U=>'<button type="button" data-u="'+U[0]+'" class="'+(U[0]===cur?"on":"")+'"><i style="background:'+U[2]+'"></i>'+U[1]+'</button>').join("")+'</div>'+
     '<div class="hgx-pal"><span class="hgx-dim">Brush:</span><button type="button" data-b="ring" class="'+(brush==="ring"?"on":"")+'">◎ Ring</button><button type="button" data-b="sector" class="'+(brush==="sector"?"on":"")+'">◔ Wedge</button><button type="button" data-b="one" class="'+(brush==="one"?"on":"")+'">▪ One block</button></div>'+
     '<p class="hgx-small">'+n+' of '+tot+' blocks painted.</p><div class="hgx-cfb"></div></div></div>';
    el.querySelectorAll("[data-m]").forEach(b=>b.onclick=()=>{mi=+b.dataset.m;level()});el.querySelectorAll("[data-u]").forEach(b=>b.onclick=()=>{cur=b.dataset.u;draw()});el.querySelectorAll("[data-b]").forEach(b=>b.onclick=()=>{brush=b.dataset.b;draw()});
    const fb=el.querySelector(".hgx-cfb");
    if(!checked){const ck=btn("Check against the model","pri",()=>{checked=true;const f=right/tot;const p=Math.round(100*f);if(p>best[mi])best[mi]=p;try{done(best.reduce((a,b)=>a+b,0)/300)}catch(e){}draw()});ck.disabled=n<tot;fb.appendChild(ck)}
    else{const f=right/tot;fb.innerHTML='<div class="hgx-fb '+(f>=.9?"ok":f>=.6?"mid":"no")+'"><b>'+right+' of '+tot+' blocks match. +'+Math.round(100*f)+'</b> A dot shows what the model puts in each wrong block. Real example: '+esc(M.real)+'. '+
      (mi===0?"Burgess’s rings come from bid-rent: the centre is most accessible, so it is most expensive; newcomers start in the zone in transition and move outwards as they get richer.":mi===1?"Hoyt saw that once a wedge starts (factories along a railway, the rich along a scenic road), it keeps growing outwards in the same direction.":"In Latin American cities the rich often live near the centre along the spine, and the poorest on the edge: the reverse of the North American pattern.")+'</div>';
     fb.appendChild(btn(mi<CMODELS.length-1?"Next model →":"See your score","pri",()=>{if(mi<CMODELS.length-1){mi++;level()}else G.finish(el,{key:"g:"+L.id,pts:best.reduce((a,b)=>a+b,0),max:300,again:()=>{mi=0;best.fill(0);level()},done,lines:['<p>No real city fits a model exactly. Models are useful because the differences tell you something: where the real city’s rivers, railways, rich suburbs and history bent the pattern. Multiple nuclei and galactic cities add more centres: business parks, airports and edge cities.</p>']})}));fb.appendChild(btn("Try again","",()=>{checked=false;draw()}))}
    const svgEl=el.querySelector(".hgx-city");let down=false;
    const paint=t=>{if(checked||!t||t.dataset.r==null)return;const r=+t.dataset.r,s=+t.dataset.s;const set=(a,b)=>{A[a+","+b]=cur};if(r===0){A["0,0"]=cur;return}
     if(brush==="ring")for(let k=0;k<CNS;k++)set(r,k);else if(brush==="sector")for(let k=1;k<=CNR;k++)set(k,s);else set(r,s)};
    svgEl.addEventListener("pointerdown",e=>{down=true;e.preventDefault();paint(document.elementFromPoint(e.clientX,e.clientY));draw()});
    svgEl.addEventListener("pointermove",e=>{if(!down||brush!=="one")return;const t=document.elementFromPoint(e.clientX,e.clientY);if(t&&t.dataset.r!=null&&A[t.dataset.r+","+t.dataset.s]!==cur){paint(t);draw()}});
    svgEl.addEventListener("pointerup",()=>{down=false})};
   draw()};
  level()}}]);

/* ---- Central places ---- */
const HX=9,HY=8;/* hex grid, offset rows */
const hexes=()=>{const a=[];for(let r=0;r<HY;r++)for(let q=0;q<HX;q++)a.push([q,r]);return a};
const toCube=(q,r)=>{const x=q-(r-(r&1))/2,z=r;return[x,-x-z,z]};
const hd=(a,b)=>{const A=toCube(a[0],a[1]),B=toCube(b[0],b[1]);return Math.max(Math.abs(A[0]-B[0]),Math.abs(A[1]-B[1]),Math.abs(A[2]-B[2]))};
function greedyCover(range,must){const H=hexes();const un=new Set(H.map(x=>x+""));let n=0;const pick=[];while(un.size){let best=null,bc=-1;H.forEach(c=>{let k=0;H.forEach(v=>{if(un.has(v+"")&&hd(c,v)<=range)k++});if(k>bc){bc=k;best=c}});pick.push(best);H.forEach(v=>{if(hd(best,v)<=range)un.delete(v+"")});n++}return n}
const CP_LV=[{t:"Market towns",goal:"Every village needs a market within <b>one step</b> (a short walk). Place market towns so <b>every village is served</b>, using as few towns as you can.",range:1},
 {t:"A bigger range",goal:"A hospital is a higher-order service: people will travel <b>two steps</b> for it, but it needs more customers to survive. Serve every village with as few hospitals as you can.",range:2}];
G.add("u6",[{id:"centralplace",kind:"game",ch:"hg6a",wide:true,title:"Central places: serve every village",blurb:"Place market towns on a plain so every village is served, with as few towns as possible. Watch hexagons appear.",skill:"Central place theory (6.4): threshold, range and market areas.",
 intro:"Walter Christaller (1933) asked how many towns a region needs, and where. Each service has a range (how far people will travel) and a threshold (how many customers it needs). The most efficient pattern packs market areas as hexagons.",
 play(el,done,L){
  let lv=0,score=0;const got=[0,0];
  const level=()=>{const Lv=CP_LV[lv];const T=new Set();const H=hexes();const target=greedyCover(Lv.range);
   const draw=()=>{const s=26,w=Math.sqrt(3)*s;const X=(q,r)=>w*(q+.5*(r&1))+w*.6,Y=r=>s*1.5*r+s*1.1;const W=X(HX,1)+w*.2,Hh=Y(HY)+s*.2;
    const served={};H.forEach(v=>{served[v]=0;T.forEach(t=>{const c=t.split(",").map(Number);if(hd(c,v)<=Lv.range)served[v]++})});
    const un=H.filter(v=>!served[v]).length,over=H.reduce((a,v)=>a+Math.max(0,served[v]-1),0);
    const hexP=(cx,cy)=>{let p="";for(let k=0;k<6;k++){const a=Math.PI/180*(60*k-30);p+=(k?"L":"M")+(cx+s*Math.cos(a)).toFixed(1)+" "+(cy+s*Math.sin(a)).toFixed(1)}return p+"Z"};
    let svg='<svg viewBox="0 0 '+W.toFixed(0)+' '+Hh.toFixed(0)+'" class="hgx-hex">';
    H.forEach(v=>{const[q,r]=v;const n=served[v];svg+='<path d="'+hexP(X(q,r),Y(r))+'" class="hx'+(n===1?" s1":n>1?" s2":"")+'" data-h="'+q+","+r+'"/>';
     svg+=T.has(q+","+r)?'<g transform="translate('+X(q,r).toFixed(1)+','+Y(r).toFixed(1)+')" class="hxt"><circle r="9"/><path d="M-5 3 V-2 L0 -6 L5 -2 V3Z"/></g>':'<circle cx="'+X(q,r).toFixed(1)+'" cy="'+Y(r).toFixed(1)+'" r="3" class="hxv"/>'});
    svg+='</svg>';const ok=!un;
    el.innerHTML='<div class="hgx-gtabs">'+CP_LV.map((x,k)=>'<button type="button" class="hgx-btn'+(k===lv?" on":"")+'" data-l="'+k+'">'+(got[k]?"✓ ":"")+(k+1)+'. '+x.t+'</button>').join("")+'</div><div class="hgx-q"><b>'+Lv.goal+'</b><small>Click a village to make it a town; click again to remove it. Green: served once; dark green: served twice (wasted overlap).</small></div>'+
     '<div class="hgx-grow"><div class="hgx-gmap">'+svg+'</div><div class="hgx-gside"><p class="hgx-cpst"><b>'+T.size+'</b> towns · <b class="'+(un?"bad":"")+'">'+un+'</b> villages not served · <b>'+over+'</b> served twice</p>'+
     (ok?'<div class="hgx-fb '+(T.size<=target?"ok":"mid")+'"><b>Every village is served with '+T.size+' towns.</b> '+(T.size<=target?"That is as efficient as it gets. ":"A planner did it with "+target+". Try spacing the towns out more evenly. ")+'Notice the shape of each market area: with even spacing, they fit together like a honeycomb of hexagons, Christaller’s pattern.</div>':'<p class="hgx-dim hgx-small">Tip: start in a corner and space the towns so their areas just touch.</p>')+'<div class="hgx-cpb"></div></div></div>';
    el.querySelectorAll("[data-l]").forEach(b=>b.onclick=()=>{lv=+b.dataset.l;level()});
    el.querySelectorAll("[data-h]").forEach(p=>p.onclick=()=>{const k=p.dataset.h;if(T.has(k))T.delete(k);else T.add(k);draw()});
    if(ok){const p=T.size<=target?100:Math.max(30,100-(T.size-target)*15);const b=el.querySelector(".hgx-cpb");
     b.appendChild(btn(lv<CP_LV.length-1?"Lock it in: next level →":"Lock it in: see your score","pri",()=>{got[lv]=Math.max(got[lv],p);if(lv<CP_LV.length-1){lv++;level()}else G.finish(el,{key:"g:"+L.id,pts:got.reduce((a,c)=>a+c,0),max:200,again:()=>{lv=0;got.fill(0);level()},done,lines:['<p>Bigger range, fewer places: high-order services (hospitals, universities, airports) are found only in a few large central places, low-order ones (a corner shop) in every village. That nesting is the urban hierarchy.</p>']})}))}};
   draw()};level()}}]);

/* ---- Rank-size with real cities ---- */
const RS=[{c:"us",n:"United States",k:"rank",cities:[["New York",19.9,-74,40.71],["Los Angeles",12.9,-118.24,34.05],["Chicago",9.3,-87.63,41.88]]},
 {c:"th",n:"Thailand",k:"primate",cities:[["Bangkok",11.2,100.5,13.76],["Chiang Mai",1.2,98.99,18.79],["Nakhon Ratchasima",.6,102.1,14.97]]},
 {c:"fr",n:"France",k:"primate",cities:[["Paris",11.3,2.35,48.86],["Lyon",1.8,4.84,45.76],["Marseille",1.6,5.37,43.3]]},
 {c:"ar",n:"Argentina",k:"primate",cities:[["Buenos Aires",15.7,-58.38,-34.6],["Córdoba",1.6,-64.18,-31.42],["Rosario",1.5,-60.64,-32.95]]},
 {c:"in",n:"India",k:"rank",cities:[["Delhi",34,77.21,28.61],["Mumbai",22,72.88,19.08],["Kolkata",15.8,88.36,22.57]]},
 {c:"cn",n:"China",k:"rank",cities:[["Shanghai",30,121.47,31.23],["Beijing",22,116.4,39.9],["Chongqing",17,106.55,29.56]]},
 {c:"pe",n:"Peru",k:"primate",cities:[["Lima",11.4,-77.03,-12.05],["Arequipa",1.1,-71.54,-16.41],["Trujillo",1,-79.03,-8.11]]},
 {c:"mx",n:"Mexico",k:"primate",cities:[["Mexico City",22.5,-99.13,19.43],["Guadalajara",5.6,-103.35,20.67],["Monterrey",5.3,-100.31,25.69]]},
 {c:"de",n:"Germany",k:"rank",cities:[["Berlin",3.6,13.4,52.52],["Hamburg",1.9,9.99,53.55],["Munich",1.6,11.58,48.14]]},
 {c:"gb",n:"United Kingdom",k:"primate",cities:[["London",9.8,-0.13,51.51],["Manchester",2.9,-2.24,53.48],["Birmingham",2.7,-1.9,52.48]]},
 {c:"ng",n:"Nigeria",k:"primate",cities:[["Lagos",16.5,3.38,6.52],["Kano",4.6,8.52,12],["Ibadan",4,3.93,7.38]]}];
G.add("u6",[{id:"ranksize2",kind:"game",ch:"hg6a",wide:true,title:"Rank-size or primate? Real countries",blurb:"Predict the second and third cities’ sizes, check against real data, and spot the primate cities.",skill:"Urban hierarchies (6.3): rank-size rule and primate cities.",
 intro:"The rank-size rule predicts that the second city is half the size of the first, the third a third. A primate city is more than twice the size of the next, and dominates its country. Populations are metropolitan areas, about 2025, rounded.",
 play(el,done,L){
  const play=()=>{el.innerHTML="";const R=G.shuffle(RS).slice(0,5);let i=0,score=0;const res=[];const H=G.hud(el,{res});const q=h("div","hgx-q");el.appendChild(q);
   const row=h("div","hgx-grow");el.appendChild(row);const fb=h("div","hgx-fbw");el.appendChild(fb);
   const ask=()=>{const r=R[i];H.set(i+1,R.length,score);fb.innerHTML="";row.innerHTML="";const C=r.cities;const top=C[0][1];const V=[top,top*.5,top*.5];let checked=false,pts=0;
    q.innerHTML='<b>'+esc(r.n)+': '+esc(C[0][0])+' has about '+top+' million people.</b><small>Drag the bars to guess the sizes of '+esc(C[1][0])+' and '+esc(C[2][0])+', then press Check.</small>';
    const side=h("div","hgx-gmap");row.appendChild(side);const mini=G.atlas(side,{zoom:false,grat:false});mini.setCls(r.c,"hl");mini.focusCodes([r.c],0,1.6);C.forEach((c,k)=>mini.marker([c[2],c[3]],{r:4+Math.sqrt(c[1])*1.6,text:c[0]}));
    const box=h("div","hgx-gside");row.appendChild(box);
    const draw=()=>{const W=360,Hh=220,mx=top*1.1;let s='<svg viewBox="0 0 '+W+' '+(Hh+40)+'" class="hgx-rs">';
     [0,1,2].forEach(k=>{const x=30+k*110,hh=V[k]/mx*Hh,rh=C[k][1]/mx*Hh,ph=top/(k+1)/mx*Hh;s+='<rect x="'+x+'" y="'+(Hh-hh+10)+'" width="80" height="'+hh+'" rx="6" class="b'+(k?" you":"")+'" data-k="'+k+'"/>';
      if(checked){s+='<rect x="'+x+'" y="'+(Hh-rh+10)+'" width="80" height="'+rh+'" rx="6" class="real"/><line x1="'+(x-6)+'" x2="'+(x+86)+'" y1="'+(Hh-ph+10)+'" y2="'+(Hh-ph+10)+'" class="pred"/>'}
      s+='<text x="'+(x+40)+'" y="'+(Hh+26)+'" class="lb">'+esc(C[k][0])+'</text><text x="'+(x+40)+'" y="'+(Hh-hh+4)+'" class="vl">'+V[k].toFixed(1)+'m'+(checked&&k?' · real '+C[k][1]:'')+'</text>'});
     s+='</svg>';box.innerHTML=s+(checked?'<p class="hgx-dim hgx-small">Outline: the real size. Dashed line: what the rank-size rule predicts.</p>':'<p class="hgx-dim hgx-small">Drag the second and third bars up or down.</p>');
     const svg=box.querySelector("svg");let dk=null;const set=e=>{const rr=svg.getBoundingClientRect();const y=(e.clientY-rr.top)*(Hh+40)/rr.height;V[dk]=G.clamp((Hh+10-y)/Hh*mx,.2,top);draw()};
     if(!checked){svg.onpointerdown=e=>{const t=e.target.closest("[data-k]");const x=(e.clientX-svg.getBoundingClientRect().left)*W/svg.getBoundingClientRect().width;const k=t?+t.dataset.k:x>250?2:x>140?1:-1;if(k<1)return;dk=k;svg.setPointerCapture(e.pointerId);set(e)};svg.onpointermove=e=>{if(dk)set(e)};svg.onpointerup=()=>{dk=null}}
    };draw();
    const ck=btn("Check","pri",()=>{checked=true;ck.remove();draw();const err=[1,2].reduce((a,k)=>a+Math.abs(Math.log(V[k]/C[k][1])),0)/2;pts=Math.round(60*G.clamp(1-err/1.2,0,1));
     fb.innerHTML='<div class="hgx-fb '+(pts>=45?"ok":pts>=25?"mid":"no")+'"><b>Size guess: +'+pts+'</b> Now: is '+esc(r.n)+' a primate-city country, or does it follow the rank-size rule?</div>';
     const ch=h("div","hgx-choice");[["primate","Primate city"],["rank","Close to rank-size"]].forEach(([k,t])=>ch.appendChild(btn(t,"",()=>{ch.querySelectorAll("button").forEach(x=>x.disabled=true);const ok=k===r.k;pts+=ok?40:0;score+=pts;res.push(pts/100);H.set(i+1,R.length,score);
      const ratio=(top/C[1][1]).toFixed(1);fb.querySelector(".hgx-fb").className="hgx-fb "+(pts>=80?"ok":pts>=40?"mid":"no");fb.querySelector(".hgx-fb").innerHTML='<b>'+(ok?"Right! ":"Not quite. ")+'+'+pts+'</b> '+esc(C[0][0])+' is '+ratio+' times the size of '+esc(C[1][0])+'. '+(r.k==="primate"?(r.c==="ng"?"Primate by size, though Lagos lost the capital to Abuja in 1991: Kano and Ibadan are big regional centres.":r.c==="mx"?"A primate city: Mexico City is four times Guadalajara.":"A primate city: it holds the country’s government, money and media, and draws migrants from everywhere."):"Close enough to the rule: several big cities share the country’s functions"+(r.c==="de"?" (Germany’s federal history spread them out).":"."));
      fb.appendChild(btn(i+1<R.length?"Next country →":"See your score","pri",()=>{i++;if(i<R.length)ask();else end()}))})));fb.appendChild(ch)});fb.appendChild(ck)};
   const end=()=>G.finish(el,{key:"g:"+L.id,pts:score,max:R.length*100,again:play,done});ask()};play()}}]);

/* ---- Cool the city: urban heat island ---- */
const UZ=[["Farmland",24,"rural"],["Suburbs",26.3,"sub"],["Park",25.2,"park"],["Downtown",29.6,"cbd"],["River",25.8,"river"],["Old suburbs",27,"sub"],["Farmland",24.2,"rural"]];
const COOL=[["🌳 Plant street trees",2,{cbd:.7,sub:.4},"Shade and evaporation from leaves cool the street."],["⬜ Paint roofs white",1,{cbd:.5,sub:.3},"Reflect sunlight instead of absorbing it: cheap and quick."],["🌿 Green roofs",3,{cbd:.6},"Soil and plants on roofs soak up heat and rain."],["💧 Open up a buried stream",4,{cbd:1},"Seoul tore down a motorway to reopen the Cheonggyecheon stream in 2005: the area is now several degrees cooler in summer."],["🚇 Fewer cars, more trams",2,{cbd:.4},"Less waste heat from engines and air conditioning."],["🏙️ More car parks and roads",1,{cbd:-.8,sub:-.3},"Dark asphalt stores heat: this makes it worse!"]];
/* each measure works fully once, half as well the second time, and can be bought twice */
const coolOf=(buy,zone)=>{let d=0;Object.keys(buy).forEach(i=>{const e=COOL[i][2][zone];if(e)d+=e*(buy[i]>=2?1.5:buy[i]>=1?1:0)});return d};
G.add("u6",[{id:"uhi",kind:"game",ch:"hg6d",wide:true,title:"Cool the city: the urban heat island",blurb:"Predict the temperature across a city on a summer evening, then spend a budget to cool it.",skill:"Urban sustainability and challenges (6.10, 6.11): the urban heat island.",
 intro:"Cities are warmer than the countryside, especially on calm summer evenings: dark roofs and roads store the day’s heat, there are few trees to shade and cool, and cars and air conditioners pump out waste heat. Heat waves kill more people in cities than any other weather.",
 play(el,done,L){
  const play=()=>{const P=UZ.map(()=>25);let checked=false,score=0;const buy={};
   const draw=()=>{const W=640,Hh=200,x=k=>40+k*(W-70)/(UZ.length-1),y=t=>Hh-(t-22)*(Hh-20)/9;
    let s='<svg viewBox="0 0 '+W+' '+(Hh+70)+'" class="hgx-uhi"><rect x="0" y="0" width="'+W+'" height="'+(Hh+10)+'" class="sky"/>';
    for(let t=22;t<=31;t++)s+='<line x1="30" x2="'+(W-10)+'" y1="'+y(t)+'" y2="'+y(t)+'" class="gl"/><text x="4" y="'+(y(t)+4)+'" class="tl">'+t+'°</text>';
    /* the skyline */UZ.forEach((z,k)=>{const cx=x(k);if(z[2]==="cbd")[[-30,60],[-14,90],[2,70],[18,110]].forEach(([dx,hh])=>s+='<rect x="'+(cx+dx)+'" y="'+(Hh+10-hh*.5)+'" width="14" height="'+(hh*.5)+'" class="bld"/>');
     else if(z[2]==="sub")[-26,-8,10].forEach(dx=>s+='<path d="M'+(cx+dx)+' '+(Hh+10)+' v-12 l8 -7 l8 7 v12z" class="hse"/>');else if(z[2]==="park"||z[2]==="rural")[-20,0,20].forEach(dx=>s+='<circle cx="'+(cx+dx)+'" cy="'+(Hh+2)+'" r="'+(z[2]==="park"?8:5)+'" class="tree"/>');else s+='<rect x="'+(cx-30)+'" y="'+(Hh+4)+'" width="60" height="6" class="riv"/>';
     s+='<text x="'+cx+'" y="'+(Hh+30)+'" class="zl">'+z[0]+'</text>'});
    const cool=k=>Math.min(coolOf(buy,UZ[k][2]),Math.max(0,UZ[k][1]-24.4));
    const path=A=>A.map((t,k)=>(k?"L":"M")+x(k).toFixed(1)+" "+y(t).toFixed(1)).join(" ");
    if(checked){const real=UZ.map((z,k)=>z[1]-cool(k));s+='<path d="'+path(UZ.map(z=>z[1]))+'" class="realo"/><path d="'+path(real)+'" class="real"/>'}
    s+='<path d="'+path(P)+'" class="you"/>'+P.map((t,k)=>'<circle cx="'+x(k)+'" cy="'+y(t)+'" r="8" class="h" data-k="'+k+'"/><text x="'+x(k)+'" y="'+(y(t)-12)+'" class="tv">'+t.toFixed(1)+'°</text>').join("")+'</svg>';
    let html='<div class="hgx-q"><b>'+(checked?"Now cool the city: you have 8 coins.":"A calm summer evening at 9 pm. Drag each dot to the temperature you expect.")+'</b><small>'+(checked?"Downtown is "+(UZ[3][1]-cool(3)-24).toFixed(1)+" °C warmer than the farmland. Get it within <b>3.3 °C</b>. Each measure can be used twice; the second time works half as well.":"The farmland is about 24 °C. Think about what each place is made of.")+'</small></div>'+s;
    if(checked){const spent=Object.keys(buy).reduce((a,i)=>a+COOL[i][1]*buy[i],0);html+='<div class="hgx-cool">'+COOL.map((c,i)=>'<button type="button" class="hgx-btn" data-c="'+i+'"'+(spent+c[1]>8||buy[i]>=2?" disabled":"")+'><b>'+c[0]+'</b><small>'+c[1]+' coin'+(c[1]>1?"s":"")+(buy[i]?' · ×'+buy[i]:'')+'</small></button>').join("")+'</div><p class="hgx-small">Spent '+spent+' of 8 coins. <button type="button" class="hgx-btn" data-x="undo">Undo all</button></p>'}
    el.innerHTML=html+'<div class="hgx-fbw"></div>';
    const fb=el.querySelector(".hgx-fbw");
    if(!checked){const svg=el.querySelector(".hgx-uhi");let dk=null;const set=e=>{const r=svg.getBoundingClientRect();const yy=(e.clientY-r.top)*(Hh+70)/r.height;P[dk]=Math.round(G.clamp(22+(Hh-yy)*9/(Hh-20),22,31)*10)/10;draw()};
     svg.onpointerdown=e=>{const r=svg.getBoundingClientRect();const xx=(e.clientX-r.left)*W/r.width;let k=0,bd=1e9;UZ.forEach((z,j)=>{const d=Math.abs(x(j)-xx);if(d<bd){bd=d;k=j}});dk=k;svg.setPointerCapture(e.pointerId);set(e)};svg.onpointermove=e=>{if(dk!=null)set(e)};svg.onpointerup=()=>{dk=null};
     fb.appendChild(btn("Show the real profile","pri",()=>{checked=true;const err=P.reduce((a,t,k)=>a+Math.abs(t-UZ[k][1]),0)/P.length;score=Math.round(50*G.clamp(1-(err-.4)/2,0,1));draw();
      el.querySelector(".hgx-fbw").insertAdjacentHTML("afterbegin",'<div class="hgx-fb '+(score>=40?"ok":score>=25?"mid":"no")+'"><b>Prediction: +'+score+'</b> The green line is a typical profile: the city centre is about 5–6 °C warmer than the farmland, the park and the river are cool islands inside it. (Measured differences reach 8–10 °C in some cities.)</div>')}))}
    else{el.querySelectorAll("[data-c]").forEach(b=>b.onclick=()=>{const i=+b.dataset.c;buy[i]=(buy[i]||0)+1;draw()});el.querySelector('[data-x="undo"]').onclick=()=>{Object.keys(buy).forEach(k=>delete buy[k]);draw()};
     const gap=UZ[3][1]-cool(3)-24;const last=Object.keys(buy).length?COOL[Object.keys(buy).slice(-1)[0]]:null;
     if(last)fb.insertAdjacentHTML("beforeend",'<div class="hgx-fb">'+esc(last[0])+': '+esc(last[3])+'</div>');
     if(gap<=3.3){fb.insertAdjacentHTML("beforeend",'<div class="hgx-fb ok"><b>Cooled! +50</b> Downtown is now '+gap.toFixed(1)+' °C above the farmland. Paris, Medellín and Singapore are doing exactly this with trees, cool roofs and water.</div>');
      fb.appendChild(btn("See your score","pri",()=>G.finish(el,{key:"g:"+L.id,pts:score+50,max:100,again:play,done,lines:['<p>Heat islands are also a justice issue: in many US cities the neighbourhoods redlined in the 1930s have fewer trees today and are several degrees hotter on summer days.</p>']})))}}};
   draw()};play()}}]);

/* ---- Megacity hunt on the City Lights map ---- */
const MEGA=[["Jakarta",106.85,-6.21,"About 42 million: the UN’s 2025 count makes Greater Jakarta the world’s biggest city. It is sinking, and Indonesia is building a new capital, Nusantara, on Borneo."],["Dhaka",90.41,23.81,"About 37 million, and the fastest-growing of the giants: migrants arrive from a countryside hit by floods and river erosion."],["Tokyo",139.69,35.69,"About 33 million. It was the biggest for decades; now its population is slowly shrinking and ageing."],["New Delhi",77.21,28.61,"About 30 million, growing fast."],["Shanghai",121.47,31.23,"About 30 million: China’s biggest port and financial centre."],["Guangzhou",113.26,23.13,"About 28 million in the UN’s count, which joins it with its neighbours in the Pearl River delta."],["Cairo",31.24,30.04,"About 26 million: by far Africa’s and the Arab world’s largest city, squeezed along the Nile."],["Manila",120.98,14.6,"About 25 million."],["Kolkata",88.36,22.57,"About 22 million."],["Seoul",126.98,37.57,"About 22 million: half of South Korea lives in its metropolitan region."],["Lagos",3.38,6.52,"Africa’s other giant, growing so fast that estimates range from 15 to over 20 million."],["São Paulo",-46.63,-23.55,"The largest city in the Americas by most counts, about 22 million."]];
G.add("u6",[{id:"megahunt",kind:"mission",ch:"hg6a",title:"Megacity hunt on the City Lights map",blurb:"On the live night-time map, click the world’s biggest cities by their glow.",skill:"Megacities and urbanisation (6.2); satellite data (1.3).",
 how:"The live map opens on <b>City Lights</b>, the Earth at night from satellites. Find each megacity by its glow and click it. Zoom in for a closer look.",
 mission:{title:"Megacity hunt",mode:"night",n:8,intro:"The UN’s 2025 count of cities (with every city’s edge drawn the same way) has a new top three: <b>Jakarta, Dhaka and Tokyo</b>. Find the giants by their lights.",
  rounds:MEGA.map(m=>({q:"Click <b>"+esc(m[0])+"</b>.",kind:"click",ll:[m[1],m[2]],name:m[0],tol:120,why:m[3]}))}}]);

/* ===================== UNIT 7 ===================== */
/* ---- Weber on the map ---- */
const WB=[{t:"Steel, 1900",box:[[1,45.5],[16,55]],pts:[["Iron ore, Lorraine",6.1,49.3,"r",3],["Coal, the Ruhr",7.0,51.45,"r",2],["Market, Berlin",13.4,52.52,"m",1]],
   goal:"Making a tonne of steel needs about 3 t of Lorraine’s low-grade ore and 2 t of coal; the 1 t of steel goes to Berlin. Drag the steelworks to the cheapest spot.",lesson:"Steel is weight-losing: the inputs weigh five times the product, so the mill is pulled towards the raw materials, here right at the ore: when one input weighs as much as everything else together, it wins outright. In practice the steelworks of Lorraine and the Ruhr swapped ore and coal both ways along the Moselle and the Rhine."},
 {t:"Bottling soft drinks",box:[[-95,30],[-78,45]],pts:[["Syrup, Atlanta",-84.39,33.75,"r",.05],["Bottles, Toledo",-83.55,41.65,"r",.15],["Market, Chicago",-87.63,41.88,"m",1]],
   goal:"A tonne of bottled drink is mostly local tap water: 0.05 t of syrup and 0.15 t of bottles go in, 1 t of drink comes out for Chicago. Where should the bottling plant go?",lesson:"Bottling is weight-gaining (water is everywhere, so it is added at the plant): the product is heavier than the inputs, so the plant goes next to the market. Every big city has its own bottling plant."},
 {t:"Cheap labour: car parts",box:[[-106,22],[-78,44]],pts:[["Steel, Pittsburgh",-80,40.44,"r",1],["Components, Detroit",-83.05,42.33,"r",.6],["Market, Dallas",-96.8,32.78,"m",1]],labour:["Cheap labour, Monterrey",-100.31,25.69,95],
   goal:"Car parts from steel (1 t) and components (0.6 t), sold in Dallas (1 t). A maquiladora in Monterrey saves $95 a tonne in wages. Find the cheapest place overall: transport plus labour.",lesson:"If the labour saving is bigger than the extra transport cost, the factory moves to the cheap-labour site. The red line is the critical isodapane: inside it, the move pays. This is why so many US parts plants moved to northern Mexico after NAFTA (1994), now the USMCA."}];
const RATE=.06;/* $ per tonne-km */
G.add("u7",[{id:"weber2",kind:"game",ch:"hg7b",wide:true,title:"Weber on the map: site the factory",blurb:"Drag a factory between real mines and markets; the transport bill updates as you go. Then labour pulls it to Mexico.",skill:"Weber’s least-cost theory (7.5): weight-losing and weight-gaining, labour and the isodapane.",
 intro:"Alfred Weber (1909): a factory goes where the total cost of moving its inputs in and its product out is lowest, unless cheap labour or a cluster of other firms saves more than the extra transport costs.",
 play(el,done,L){
  let lv=0,score=0;const got=[0,0,0];
  const level=()=>{const W=WB[lv];el.innerHTML="";const q=h("div","hgx-q",'<b>'+esc(W.t)+'</b><small>'+W.goal+' The heavier the load, the stronger the pull.</small>');el.appendChild(q);
   const A=G.atlas(el,{proj:"eq",names:true,grat:false,maxZoom:40});const st=h("p","hgx-wbst");el.appendChild(st);const fb=h("div","hgx-fbw");el.appendChild(fb);
   A.home=()=>A.focusBox(W.box,0);A.home();
   const cost=ll=>{let c=0;W.pts.forEach(p=>{c+=p[4]*G.km(ll,[p[1],p[2]])*RATE});return c};
   const total=ll=>cost(ll)-(W.labour&&G.km(ll,[W.labour[1],W.labour[2]])<60?W.labour[3]:0);
   /* the least-cost point by Weiszfeld's iteration, then the labour site */
   let o=[0,0];{let sw=0;W.pts.forEach(p=>{o[0]+=p[1]*p[4];o[1]+=p[2]*p[4];sw+=p[4]});o=[o[0]/sw,o[1]/sw];for(let it=0;it<200;it++){let nx=0,ny=0,ws=0;W.pts.forEach(p=>{const d=Math.max(1,G.km(o,[p[1],p[2]]));nx+=p[1]*p[4]/d;ny+=p[2]*p[4]/d;ws+=p[4]/d});o=[nx/ws,ny/ws]}}
   let opt=total(o);if(W.labour&&total([W.labour[1],W.labour[2]])<opt){opt=total([W.labour[1],W.labour[2]])}
   W.pts.forEach(p=>A.marker([p[1],p[2]],{r:7+p[4]*1.5,col:p[3]==="m"?"#2b6fd0":"#8a5a2e",text:p[0]+" ("+p[4]+" t)"}));
   if(W.labour)A.marker([W.labour[1],W.labour[2]],{r:7,col:"#3aa66a",text:W.labour[0]});
   let F=[(W.box[0][0]+W.box[1][0])/2,(W.box[0][1]+W.box[1][1])/2],built=false;
   const fac=A.marker(F,{r:11,col:"#d9573a",cls:"fac"});fac.querySelector("circle:last-of-type").style.cursor="grab";fac.insertAdjacentHTML("beforeend",'<text x="0" y="5" text-anchor="middle" class="hgx-facic">🏭</text>');
   const lines=W.pts.map(p=>A.line(F,[p[1],p[2]],{cls:"wbl"}));
   const upd=()=>{const q=A.xy(F);fac.dataset.x=q[0];fac.dataset.y=q[1];fac.setAttribute("transform","translate("+q[0]+","+q[1]+") scale("+(1/Math.pow(A.k,.85))+")");
    lines.forEach((l,k)=>{const p=W.pts[k];l.setAttribute("d",A.path({type:"LineString",coordinates:[F,[p[1],p[2]]]})||"");l.style.strokeWidth=1+p[4]*1.2});
    const c=total(F);st.innerHTML='Transport'+(W.labour?' and labour':'')+' cost per tonne of product: <b>$'+fmt(c)+'</b>'+(W.labour&&G.km(F,[W.labour[1],W.labour[2]])<60?' <span class="hgx-ok">(Monterrey labour saving: −$'+W.labour[3]+')</span>':'')+(built?' · the cheapest possible: <b>$'+fmt(opt)+'</b>':'')};
   upd();const _oz=A.onZoom;A.onZoom=k=>{upd()};
   A.grab=e=>{if(built||!e.target.closest(".fac"))return false;const mv=ev=>{const ll=A.llAt(ev.clientX,ev.clientY);if(ll){F=ll;upd()}};const up=()=>{removeEventListener("pointermove",mv);removeEventListener("pointerup",up)};addEventListener("pointermove",mv);addEventListener("pointerup",up);e.preventDefault();return true};
   A.onClick=(c,ll)=>{if(built||!ll)return;F=ll;upd()};
   const bld=btn("🏗️ Build here","pri",()=>{built=true;bld.remove();const f=G.clamp(opt/total(F),0,1);const p=Math.round(100*G.clamp((f-.6)/.4,0,1));got[lv]=Math.max(got[lv],p);
    /* the cost surface: bands of extra cost over the best */{const bx=W.box,pw=(bx[1][0]-bx[0][0])*.25,ph=(bx[1][1]-bx[0][1])*.25;A.bg((lo,la)=>{const x=total([lo,la])/opt;return x<1.03?"#2f8f55":x<1.08?"#7cc46a":x<1.15?"#c9e27a":x<1.3?"#f2d36b":x<1.6?"#f0a43a":"#e8634a"},.08,[[bx[0][0]-pw,bx[0][1]-ph],[bx[1][0]+pw,bx[1][1]+ph]],.72)}
    A.marker(o,{r:5,col:"#fff",text:"★ cheapest transport"});
    if(W.labour){const sv=W.labour[3];/* the critical isodapane: where extra transport = labour saving */let pts=[];for(let a=0;a<360;a+=4){let lo=0,hi=25;for(let it=0;it<30;it++){const m=(lo+hi)/2;const ll=[o[0]+m*Math.cos(a*Math.PI/180),o[1]+m*Math.sin(a*Math.PI/180)];if(cost(ll)-cost(o)<sv)lo=m;else hi=m}pts.push([o[0]+lo*Math.cos(a*Math.PI/180),o[1]+lo*Math.sin(a*Math.PI/180)])}pts.push(pts[0]);A.geo({type:"LineString",coordinates:pts},{cls:"iso"})}
    upd();fb.innerHTML='<div class="hgx-fb '+(f>=.97?"ok":f>=.85?"mid":"no")+'"><b>Your site costs '+Math.round(100/f)+'% of the cheapest. +'+p+'</b> The colours show how much extra each place would cost: dark green is within 3% of the best. '+W.lesson+'</div>';
    fb.appendChild(btn(lv<WB.length-1?"Next industry →":"See your score","pri",()=>{if(lv<WB.length-1){lv++;level()}else G.finish(el,{key:"g:"+L.id,pts:got.reduce((a,b)=>a+b,0),max:300,again:()=>{lv=0;got.fill(0);level()},done,lines:['<p>Weber’s model still explains a lot (bulky steel by coal and ore, bottling by the market), but cheap bulk shipping, just-in-time supply chains and the pull of skilled labour and clusters (agglomeration) now matter as much as the weight of the inputs.</p>']})}));fb.appendChild(btn("Try again","",level))});
   fb.appendChild(bld);fb.insertAdjacentHTML("beforeend",'<span class="hgx-dim hgx-small">Drag the red factory, or click the map to move it.</span>')};
  level()}}]);

/* ---- Core and periphery from GDP data ---- */
const CP_CORE=["us","ca","gb","fr","de","jp","au","se","ch","nl"],CP_SEMI=["br","mx","cn","ru","tr","ar","my","th","cl","za"],CP_PER=["ne","td","et","cd","mz","ht","af","ml","mg","bd","ye","so"];
const cpOf=c=>{const g=D.gdppc(c);if(g==null)return undefined;return g>=35000?"core":g>=6000?"semi":"per"};
G.add("u7",[{id:"corep",kind:"paint",ch:"hg7a",wide:true,title:"Core and periphery: paint the world-system",blurb:"Paint 30 countries core, semi-periphery or periphery; the World Bank’s GDP per person checks your map.",skill:"Theories of development (7.4): Wallerstein’s world-system.",
 intro:"Immanuel Wallerstein divided the world economy into a core (rich, high-skill, high-wage), a periphery (poor, exporting raw materials and cheap labour) and a semi-periphery in between. Here the dividing lines are GDP per person: $35,000 and $6,000.",
 game:()=>({n:1,fixed:true,intro:"<p>Thirty countries are lit up. Paint each one <b>core</b>, <b>semi-periphery</b> or <b>periphery</b>. Tip: paint all of one kind with <b>Fill the rest</b>, then fix the others.</p>",
  rounds:[{q:"Paint the world-system.",cats:[["core","Core","#2f6fb5"],["semi","Semi-periphery","#e8b13a"],["per","Periphery","#d9573a"]],scope:CP_CORE.concat(CP_SEMI,CP_PER).filter(G.feat),ans:cpOf,
   explain:c=>"GDP per person about $"+fmt(D.gdppc(c))+": "+({core:"core",semi:"semi-periphery",per:"periphery"}[cpOf(c)]),
   why:"Wallerstein’s point is about relationships, not just income: the core buys raw materials and cheap labour from the periphery and sells it finished, high-value goods. Countries can move: South Korea climbed from periphery to core in fifty years; Argentina slipped from near the core to the semi-periphery."}]})}]);

/* ---- Guess the HDI ---- */
const HDIC=["no","ne","in","sa","cu","lk","ng","br","cn","us","bd","mx","et","jp","qa","za","vn","ru","eg","af","kr","bw","tr","pk"];
G.add("u7",[{id:"hdiguess",kind:"game",ch:"hg7a",wide:true,title:"Guess the HDI",blurb:"A country lights up: slide to its Human Development Index, then see what drives it.",skill:"Measures of development (7.2, 7.3): the HDI, GDP per person and their differences.",
 intro:"The Human Development Index (UNDP) combines life expectancy, years of schooling and income per person into one number from 0 to 1. It often differs from income: some countries are healthier and better schooled than their GDP suggests, others less.",
 play(el,done,L){
  const play=()=>{el.innerHTML="";const R=G.shuffle(HDIC.filter(c=>D.hdi(c))).slice(0,8);let i=0,score=0;const res=[];const H=G.hud(el,{res});const q=h("div","hgx-q");el.appendChild(q);const ctl=h("div","hgx-hdictl");el.appendChild(ctl);
   const A=G.atlas(el,{names:false});const fb=h("div","hgx-fbw");el.appendChild(fb);const done8=[];
   const col=v=>v>=.8?"#1d6f6a":v>=.7?"#5aa89a":v>=.55?"#e7c46d":"#d0763e";
   const ask=()=>{const c=R[i];H.set(i+1,R.length,score);fb.innerHTML="";A.clear();A.cls(x=>x===c?"hl":"");A.fill(x=>done8.includes(x)?col(D.hdi(x)):null);A.focusCodes([c],600,3);A.home=()=>A.focusCodes([c],600,3);
    q.innerHTML='<b>What is the HDI of <span class="hgx-t1">'+esc(D.name(c))+'</span>?</b><small>Slide, then press Guess. 1.0 would be perfect; the world average is about 0.75.</small>';
    ctl.innerHTML='<div class="hgx-hdir"><input type="range" min="0.35" max="1" step="0.005" value="0.7"><b>0.700</b><button type="button" class="hgx-btn pri">Guess</button></div><div class="hgx-hdiscale"><span>0.35</span><span style="color:#d0763e">low</span><span style="color:#e7c46d">medium</span><span style="color:#5aa89a">high</span><span style="color:#1d6f6a">very high</span><span>1.0</span></div>';
    const r=ctl.querySelector("input"),b=ctl.querySelector("b");r.oninput=()=>{b.textContent=(+r.value).toFixed(3)};
    ctl.querySelector("button").onclick=()=>{ctl.querySelector("button").disabled=true;r.disabled=true;const v=+r.value,t=D.hdi(c);const err=Math.abs(v-t);const p=Math.round(100*G.clamp(1-(err-.015)/.12,0,1));score+=p;res.push(p/100);H.set(i+1,R.length,score);done8.push(c);A.setFill(c,col(t));A.setCls(c,"");
     const g=D.gdppc(c),le=D.life(c);fb.innerHTML='<div class="hgx-fb '+(p>=80?"ok":p>=40?"mid":"no")+'"><b>'+t.toFixed(3)+' (you said '+v.toFixed(3)+'). +'+p+'</b> '+esc(D.name(c))+': GDP per person about $'+fmt(g||0)+', life expectancy '+(le?le.toFixed(0):"?")+' years. '+
      (c==="cu"||c==="lk"?"Health and schooling lift its HDI well above what its income alone would give.":c==="qa"||c==="sa"?"Oil makes it rich, but its HDI is lower than its income suggests: schooling and health have lagged behind wealth.":c==="us"?"The richest big country, but shorter lives than other rich countries hold its HDI back.":c==="za"||c==="bw"?"Diamonds and minerals give middle incomes, but HIV and inequality cut life expectancy.":t<.55?"Low HDI: short lives, few years of school and low incomes, often after conflict.":"")+'</div>';
     fb.appendChild(btn(i+1<R.length?"Next →":"See your score","pri",()=>{i++;if(i<R.length)ask();else end()}))}};
   const end=()=>{A.fill(x=>{const v=D.hdi(x);return v?col(v):null});A.reset();G.finish(el,{key:"g:"+L.id,pts:score,max:R.length*100,again:play,done,lines:['<p>Human Development Report 2025 (data for 2023): Iceland is first (0.972), Norway and Switzerland next; South Sudan last (0.388). Global HDI growth slowed to its weakest pace since 1990, apart from the pandemic years.</p>']})};
   ask()};play()}}]);

/* ---- Route the container ship ---- */
const NODES={sha:["Shanghai",121.8,31.1],sin:["Singapore",103.8,1.25],mal:["Strait of Malacca",100.4,3.3],col:["Colombo",79.85,6.95],bab:["Bab-el-Mandeb",43.4,12.6],sue:["Suez Canal",32.4,30.5],gib:["Gibraltar",-5.6,35.95],rot:["Rotterdam",4,51.95],cap:["Cape of Good Hope",18.4,-34.8],pan:["Panama Canal",-79.7,9.1],la:["Los Angeles",-118.27,33.73],ny:["New York",-74,40.55],hor:["Hormuz",56.4,26.6],dxb:["Dubai",55.03,25.02],hon:["mid-Pacific",-160,25]};
const EDGES=[["sha","sin",[[115,15]]],["sin","mal",[]],["mal","col",[[90,6]]],["col","bab",[[60,13]]],["bab","sue",[[38.5,20.5]]],["sue","gib",[[18,34.5],[5,37.5]]],["gib","rot",[[-10,44],[-5,48.5],[1.5,50.5]]],["col","cap",[[55,-25],[33,-35]]],["cap","gib",[[10,-15],[-20,10],[-17,28]]],["cap","ny",[[-10,-20],[-35,10],[-55,30]]],["gib","ny",[[-40,38]]],["rot","ny",[[-20,50]]],
 ["sha","hon",[]],["hon","la",[]],["hon","pan",[[-120,12]]],["la","pan",[[-105,15]]],["pan","ny",[[-75,15],[-72,25]]],["col","hor",[[66,20]]],["hor","dxb",[]],["la","ny",[],"rail"]];
const ROUTES=[{from:"sha",to:"rot",t:"Televisions from Shanghai to Rotterdam",closed:[],why:"The classic Asia–Europe route: through Malacca, across the Indian Ocean, up the Red Sea and through Suez. About 19,500 km."},
 {from:"sha",to:"rot",t:"The same, in 2024: Houthi missiles make the Red Sea too dangerous",closed:["col-bab","bab-sue"],why:"Most container lines did exactly this: round the Cape of Good Hope, about 6,000 km and 10–14 days longer, burning more fuel and pushing up freight rates."},
 {from:"sha",to:"ny",t:"Toys from Shanghai to New York",closed:[],why:"Across the Pacific and through the Panama Canal is shortest by sea; many shippers land in Los Angeles and send the boxes east by rail: the ‘land bridge’."},
 {from:"sha",to:"ny",t:"Toys to New York in the 2023–24 drought: the Panama Canal cuts its crossings",closed:["hon-pan","la-pan","pan-ny"],why:"With the canal restricted, the land bridge from Los Angeles (or the Suez route) takes the load: a choke point closes, and trade finds another way."},
 {from:"dxb",to:"rot",t:"Oil from Dubai to Rotterdam in a supertanker too deep for the Suez Canal",closed:["bab-sue"],why:"The biggest tankers cannot pass Suez fully laden, so they sail round Africa (or pump part of the oil through Egypt’s SUMED pipeline). Every barrel first passes Hormuz."}];
function edgeKey(a,b){return[a,b].sort().join("-")}
G.add("u7",[{id:"shiproute",kind:"game",ch:"hg7c",wide:true,title:"Route the container ship",blurb:"Plan real shipping routes port by port through the choke points; then canals close and you must reroute.",skill:"Trade, choke points and global supply chains (7.6, 7.7; 4.2).",
 intro:"About 80% of world trade by volume goes by sea, much of it in containers. A few narrow passages carry a huge share, so a war or a drought at one of them changes the whole world’s supply chains.",
 play(el,done,L){
  const play=()=>{el.innerHTML="";const R=ROUTES.slice();let i=0,score=0;const res=[];const H=G.hud(el,{res});const q=h("div","hgx-q");el.appendChild(q);
   const A=G.atlas(el,{names:true});const st=h("p","hgx-wbst");el.appendChild(st);const fb=h("div","hgx-fbw");el.appendChild(fb);
   const elen=e=>{const pts=[NODES[e[0]].slice(1)].concat(e[2],[NODES[e[1]].slice(1)]);let d=0;for(let k=1;k<pts.length;k++)d+=G.km(pts[k-1],pts[k]);return e[3]==="rail"?d*.9:d};
   const adj=closed=>{const M={};EDGES.forEach(e=>{if(closed.includes(edgeKey(e[0],e[1])))return;(M[e[0]]=M[e[0]]||[]).push([e[1],e]);(M[e[1]]=M[e[1]]||[]).push([e[0],e])});return M};
   const best=(r)=>{const M=adj(r.closed);const dist={},prev={};Object.keys(NODES).forEach(k=>dist[k]=1e12);dist[r.from]=0;const Q=new Set(Object.keys(NODES));while(Q.size){let u=null;Q.forEach(k=>{if(u==null||dist[k]<dist[u])u=k});Q.delete(u);(M[u]||[]).forEach(([v,e])=>{const d=dist[u]+elen(e);if(d<dist[v]){dist[v]=d;prev[v]=u}})}return dist[r.to]};
   const ask=()=>{const r=R[i];H.set(i+1,R.length,score);A.clear();fb.innerHTML="";A.reset();const path=[r.from];let len=0;
    q.innerHTML='<b>'+esc(r.t)+'</b><small>Click the ports and straits one after another to plan the route, from <b>'+esc(NODES[r.from][0])+'</b> to <b>'+esc(NODES[r.to][0])+'</b>. Only the dashed sea lanes can be used'+(r.closed.length?'; the red ones are closed':'')+'.</small>';
    const M=adj(r.closed);
    const drawNet=()=>{A.clear();EDGES.forEach(e=>{const closed=r.closed.includes(edgeKey(e[0],e[1]));A.line(NODES[e[0]].slice(1),NODES[e[1]].slice(1),{via:e[2],cls:"lane"+(closed?" closed":"")+(e[3]==="rail"?" rail":"")})});
     for(let k=1;k<path.length;k++){const e=EDGES.find(x=>edgeKey(x[0],x[1])===edgeKey(path[k-1],path[k]));const via=e[0]===path[k-1]?e[2]:e[2].slice().reverse();A.line(NODES[path[k-1]].slice(1),NODES[path[k]].slice(1),{via,cls:"route",arrow:true})}
     Object.keys(NODES).forEach(k=>{const n=NODES[k];const m=A.marker(n.slice(1),{r:k===r.from||k===r.to?8:6,cls:"node"+(k===r.from?" from":k===r.to?" to":"")+(path.includes(k)?" on":""),text:n[0]});m.dataset.node=k});
     st.innerHTML='Route so far: <b>'+path.map(k=>esc(NODES[k][0])).join(" → ")+'</b> · '+fmt(len)+' km · about '+Math.round(len/890)+' days at sea'};
    drawNet();
    A.onClick=(c,ll)=>{if(!ll)return;let best2=null,bd=1e9;Object.keys(NODES).forEach(k=>{const d=G.km(ll,NODES[k].slice(1));if(d<bd){bd=d;best2=k}});if(bd>1500/Math.sqrt(A.k))return;const last=path[path.length-1];
     const e=(M[last]||[]).find(x=>x[0]===best2);if(!e){st.insertAdjacentHTML("beforeend",' <span class="hgx-warn">No open lane from '+esc(NODES[last][0])+' to '+esc(NODES[best2][0])+'.</span>');return}
     path.push(best2);len+=elen(e[1]);drawNet();if(best2===r.to){A.onClick=null;const b=best(r);const f=G.clamp(b/len,0,1);const p=Math.round(100*G.clamp((f-.7)/.3,0,1));score+=p;res.push(p/100);H.set(i+1,R.length,score);
      fb.innerHTML='<div class="hgx-fb '+(p>=90?"ok":p>=50?"mid":"no")+'"><b>Delivered: '+fmt(len)+' km, about '+Math.round(len/890)+' days. '+(f>=.99?"The shortest open route! ":"The shortest open route was "+fmt(b)+" km. ")+'+'+p+'</b> '+r.why+'</div>';fb.appendChild(btn(i+1<R.length?"Next shipment →":"See your score","pri",()=>{i++;if(i<R.length)ask();else end()}))}};
    fb.appendChild(btn("↶ Undo","",()=>{if(path.length>1){const a=path.pop(),b=path[path.length-1];const e=EDGES.find(x=>edgeKey(x[0],x[1])===edgeKey(a,b));len-=elen(e);drawNet()}}))};
   const end=()=>G.finish(el,{key:"g:"+L.id,pts:score,max:R.length*100,again:play,done,lines:['<p>The Ever Given blocked Suez for six days in 2021 and held up about $9 billion of trade a day. Choke points make supply chains efficient and fragile at the same time, which is why firms now talk of “near-shoring” and “friend-shoring”.</p>']});ask()};play()}}]);

/* ---- Match the SDGs ---- */
const SDG=[["No poverty","#e5243b"],["Zero hunger","#dda63a"],["Good health","#4c9f38"],["Quality education","#c5192d"],["Gender equality","#ff3a21"],["Clean water","#26bde2"],["Clean energy","#fcc30b"],["Decent work","#a21942"],["Industry and infrastructure","#fd6925"],["Reduced inequalities","#dd1367"],["Sustainable cities","#fd9d24"],["Responsible consumption","#bf8b2e"],["Climate action","#3f7e44"],["Life below water","#0a97d9"],["Life on land","#56c02b"],["Peace and justice","#00689d"],["Partnerships","#19486a"]];
const SDGQ=[["Grameen Bank micro-loans let poor women in Bangladesh start small businesses.",[1,5],"Micro-credit targets poverty (Goal 1) and, because most borrowers are women, gender equality (Goal 5)."],
 ["Drip irrigation lets Kenyan smallholders grow more maize with less water.",[2],"More food from the same land: Goal 2, zero hunger (and it saves water, Goal 6)."],["Bed nets treated with insecticide cut malaria deaths in Nigeria.",[3],"Goal 3, good health. Malaria still kills about 600,000 people a year, most of them African children."],
 ["Free school meals keep more girls in school in Malawi.",[4,2,5],"Mainly Goal 4, quality education, and it helps Goals 2 and 5 too: the goals are linked."],["Iceland makes employers prove they pay men and women equally (2018).",[5],"Goal 5, gender equality. Iceland has topped the Global Gender Gap Index for over 15 years."],
 ["New wells and latrines reach villages in rural Ethiopia.",[6],"Goal 6, clean water and sanitation. About 2 billion people still lack safe drinking water at home."],["Solar mini-grids bring electricity to villages in India and Africa.",[7],"Goal 7, affordable and clean energy. About 670 million people, most in sub-Saharan Africa, have no electricity."],
 ["A fair-trade cocoa co-operative in Ghana pays farmers a guaranteed minimum price.",[8,1],"Goal 8, decent work and economic growth (and Goal 1)."],["M-Pesa lets Kenyans send money by mobile phone, with no bank.",[9,1],"Goal 9, industry, innovation and infrastructure: a technology leapfrog that skipped bank branches."],
 ["Bolsa Família pays poor Brazilian families if their children go to school and get vaccinated.",[10,1],"Goal 10, reduced inequalities (and Goal 1). Brazil’s inequality fell while it ran."],["Medellín builds cable cars to link its hillside barrios to the metro.",[11],"Goal 11, sustainable cities: transport that connects the poorest neighbourhoods."],
 ["Sweden burns or recycles all but about 1% of household waste.",[12],"Goal 12, responsible consumption and production."],["Bangladesh builds cyclone shelters and early warnings, cutting cyclone deaths a hundredfold since 1970.",[13],"Goal 13, climate action, which includes adapting to the changes already here."],
 ["Palau closes 80% of its waters to fishing.",[14],"Goal 14, life below water: one of the largest marine sanctuaries on Earth."],["Costa Rica pays landowners to keep their forests; forest cover has doubled since the 1980s.",[15],"Goal 15, life on land."],
 ["Rwanda’s community courts try genocide cases and rebuild trust.",[16],"Goal 16, peace, justice and strong institutions."],["Ecuador swaps $1.6 billion of debt for protecting the Galápagos seas (2023).",[17,14],"Goal 17, partnerships: banks, governments and conservation groups working together (and Goal 14)."]];
G.add("u7",[{id:"sdgmatch",kind:"game",ch:"hg7d",wide:true,title:"Match the Sustainable Development Goals",blurb:"Seventeen goals, real projects: tap the goal each project serves most.",skill:"Sustainable development (7.8): the UN Sustainable Development Goals.",
 intro:"In 2015 every UN member agreed seventeen Sustainable Development Goals for 2030, from ending poverty to protecting the oceans. With five years left, the UN’s 2025 report found only about a third of the targets on track.",
 play(el,done,L){
  const play=()=>{el.innerHTML="";const R=G.shuffle(SDGQ).slice(0,10);let i=0,score=0,streak=0;const res=[];const H=G.hud(el,{res});const q=h("div","hgx-q");el.appendChild(q);const grid=h("div","hgx-sdg");el.appendChild(grid);const fb=h("div","hgx-fbw");el.appendChild(fb);
   const ask=()=>{const r=R[i];H.set(i+1,R.length,score,streak>1?'<span class="hgx-streak">🔥 '+streak+'</span> ':'');fb.innerHTML="";q.innerHTML='<b>'+esc(r[0])+'</b><small>Which goal does it serve most?</small>';
    grid.innerHTML=SDG.map((g,k)=>'<button type="button" data-g="'+(k+1)+'" style="--g:'+g[1]+'"><b>'+(k+1)+'</b><span>'+esc(g[0])+'</span></button>').join("");
    grid.querySelectorAll("[data-g]").forEach(b=>b.onclick=()=>{const g=+b.dataset.g;grid.querySelectorAll("[data-g]").forEach(x=>{x.disabled=true;if(r[1].includes(+x.dataset.g))x.classList.add(+x.dataset.g===r[1][0]?"ok":"ok2")});const ok=g===r[1][0],half=!ok&&r[1].includes(g);const p=ok?100:half?60:0;streak=ok?streak+1:0;score+=p;res.push(p/100);H.set(i+1,R.length,score);if(!ok)b.classList.add("no");
     fb.innerHTML='<div class="hgx-fb '+(ok?"ok":half?"mid":"no")+'"><b>'+(ok?"Yes! +100":half?"Linked, but not the main one. +60":"Not that one.")+'</b> '+esc(r[2])+'</div>';fb.appendChild(btn(i+1<R.length?"Next →":"See your score","pri",()=>{i++;if(i<R.length)ask();else end()}))})};
   const end=()=>G.finish(el,{key:"g:"+L.id,pts:score,max:R.length*100,again:play,done});ask()};play()}}]);

/* ---- Planning experiments hunt ---- */
const PLAN=[["Curitiba",-49.27,-25.43,"Brazil’s pioneer of bus rapid transit (1974): buses in their own lanes, boarded from tube stations, copied by over 150 cities."],
 ["Barcelona’s superblocks",2.16,41.39,"Nine city blocks joined into one, with through traffic kept to the edges and the inner streets given to people and trees."],
 ["Levittown, New York",-73.51,40.72,"The first mass-produced suburb (1947): 17,000 identical houses for returning soldiers, and at first only for white families."],
 ["Houston",-95.37,29.76,"The biggest US city with no zoning code: land uses mix freely, and the city sprawls across about 1,700 km²."],
 ["Portland, Oregon",-122.68,45.52,"Drew an urban growth boundary in 1979: no sprawl beyond the line, denser building inside it (smart growth)."],
 ["Copenhagen",12.57,55.68,"The 1947 Finger Plan: the city grows only along five rail lines, with green wedges between the fingers."],
 ["Brasília",-47.93,-15.78,"A planned capital built from scratch in four years (1956–60), shaped like an aeroplane, to pull people inland."],
 ["Celebration, Florida",-81.55,28.32,"Built by Disney in the 1990s on New Urbanist lines: porches, walkable streets, shops within reach."],
 ["Masdar City",54.62,24.43,"Abu Dhabi’s planned zero-carbon district: narrow shaded streets and wind towers to cool it without air conditioning."],
 ["London’s green belt",-0.13,51.75,"A ring of protected countryside since 1938–55 that stops London sprawling; critics say it also pushes up house prices."],
 ["Detroit",-83.05,42.33,"The city that shrank: from 1.85 million people (1950) to about 640,000. Vacant lots became urban farms."],
 ["Singapore",103.82,1.35,"About 80% of its people live in public housing (HDB flats), planned with ethnic quotas so every block is mixed."]];
G.add("u6",[{id:"planning",kind:"hunt",ch:"hg6c",wide:true,title:"Find the planning experiments",blurb:"Locate the cities that tried sprawl, smart growth, new urbanism, green belts and more.",skill:"Urban planning and sustainability (6.7, 6.11): sprawl, smart growth, new urbanism, greenbelts.",
 intro:"Cities are planning experiments. Some sprawled with the car, some drew lines against sprawl, some tried to rebuild the walkable town. Find each one and learn what it tried.",
 game:{n:8,rounds:PLAN.map(s=>({q:"Find "+esc(s[0]),ll:[s[1],s[2]],name:s[0],tol:150,why:s[3]}))}}]);

/* ---- the existing labs join their chapters; the old one-line Weber lab is replaced by the map version ---- */
const CH={u6:{site:"hg6a",ranksize:"hg6a",gravity:"hg6a",models:"hg6b",bidrent:"hg6b",change:"hg6d"},u7:{indrev:"hg7b",sectors:"hg7a",rostow:"hg7a",wallerstein:"hg7a",fordism:"hg7b"}};
for(const u in CH)for(const id in CH[u])G.set(u,id,{ch:CH[u][id]});
G.drop("u7","weber");
/* in every unit: games first within each chapter, the older labs after */
Object.keys(HUG.labs).forEach(u=>{const A=HUG.labs[u];const g=A.filter(x=>x.play||x.game||x.mission),o=A.filter(x=>!(x.play||x.game||x.mission));A.length=0;A.push(...g,...o)});

const css=document.createElement("style");css.textContent=`
.hgx-city{ width:100%; max-width:430px; display:block; margin:0 auto; touch-action:none; user-select:none; }
.hgx-city .cc{ fill:rgba(255,255,255,.6); stroke:#5b6575; stroke-width:1; cursor:pointer; } .hgx-city .cc:hover{ stroke-width:2.5; } .hgx-city .cc.no{ stroke:#d23b2a; stroke-width:2.5; }
.hgx-city .cs{ font:700 11px Inter,system-ui,sans-serif; fill:currentColor; opacity:.6; text-anchor:middle; } .hgx-city .crail{ stroke:#1d2433; stroke-width:3; stroke-dasharray:8 3; pointer-events:none; } .hgx-city .cblvd{ stroke:#fff; stroke-width:3; stroke-dasharray:4 4; pointer-events:none; }
.hgx-hex{ width:100%; display:block; } .hgx-hex .hx{ fill:#efe6cf; stroke:#c9b98f; stroke-width:1; cursor:pointer; } .hgx-hex .hx:hover{ fill:#e3d6b0; } .hgx-hex .hx.s1{ fill:#9bd17a; } .hgx-hex .hx.s2{ fill:#4f9a5a; }
.hgx-hex .hxv{ fill:#7a6a4a; pointer-events:none; } .hgx-hex .hxt{ pointer-events:none; } .hgx-hex .hxt circle{ fill:#7a4b2a; stroke:#fff; stroke-width:2; } .hgx-hex .hxt path{ fill:#fff; }
.hgx-cpst{ font-size:14px; } .hgx-cpst .bad{ color:#d23b2a; }
.hgx-rs{ width:100%; max-width:420px; display:block; touch-action:none; } .hgx-rs .b{ fill:#cf8a1f; } .hgx-rs .b.you{ fill:#e8b96a; cursor:ns-resize; } .hgx-rs .real{ fill:none; stroke:#1d2433; stroke-width:2.5; stroke-dasharray:5 3; } .hgx-rs .pred{ stroke:#2b6fd0; stroke-width:2.5; stroke-dasharray:3 3; }
.hgx-rs .lb{ font:700 12px Inter,system-ui,sans-serif; fill:currentColor; text-anchor:middle; } .hgx-rs .vl{ font:700 11.5px Inter,system-ui,sans-serif; fill:currentColor; text-anchor:middle; }
body:not(.light-theme) .hgx-rs .real{ stroke:#fff; }
.hgx-uhi{ width:100%; display:block; touch-action:none; cursor:ns-resize; } .hgx-uhi .sky{ fill:rgba(255,190,120,.12); } .hgx-uhi .gl{ stroke:currentColor; opacity:.12; } .hgx-uhi .tl{ font:600 10px Inter,system-ui,sans-serif; fill:currentColor; opacity:.6; }
.hgx-uhi .bld{ fill:#7d8796; } .hgx-uhi .hse{ fill:#b49a7a; } .hgx-uhi .tree{ fill:#4f9a5a; } .hgx-uhi .riv{ fill:#5d9bd5; } .hgx-uhi .zl{ font:700 11px Inter,system-ui,sans-serif; fill:currentColor; text-anchor:middle; }
.hgx-uhi .you{ fill:none; stroke:#d9573a; stroke-width:2.5; } .hgx-uhi .h{ fill:#d9573a; stroke:#fff; stroke-width:2; cursor:ns-resize; } .hgx-uhi .tv{ font:800 11px Inter,system-ui,sans-serif; fill:#d9573a; text-anchor:middle; }
.hgx-uhi .real{ fill:none; stroke:#3aa66a; stroke-width:3.5; } .hgx-uhi .realo{ fill:none; stroke:#3aa66a; stroke-width:2; stroke-dasharray:4 4; opacity:.6; }
.hgx-cool{ display:grid; grid-template-columns:repeat(3,1fr); gap:6px; margin:6px 0; } .hgx-cool .hgx-btn{ border-radius:12px; text-align:left; display:flex; flex-direction:column; } .hgx-cool small{ font-weight:500; opacity:.75; }
.hgx-wbst{ font-size:14px; margin:6px 0 0; } .hgx-ok{ color:#2f8a63; font-weight:700; } .hgx-warn{ color:#d23b2a; font-weight:700; }
.hgx-mk.fac .hgx-dot{ stroke-width:3; } .hgx-facic{ font-size:13px; pointer-events:none; } .hgx-line.wbl{ stroke:#8a5a2e; stroke-opacity:.75; } .hgx-geo.iso{ stroke:#d23b2a; stroke-width:2.5; stroke-dasharray:6 4; }
.hgx-hdictl{ margin:0 0 8px; } .hgx-hdir{ display:flex; gap:10px; align-items:center; } .hgx-hdir input{ flex:1; accent-color:var(--uc); } .hgx-hdir b{ font-size:20px; font-variant-numeric:tabular-nums; min-width:62px; }
.hgx-hdiscale{ display:flex; justify-content:space-between; font-size:11px; font-weight:700; opacity:.8; padding:0 120px 0 4px; }
.hgx-line.lane{ stroke:#5d9bd5; stroke-width:1.6; stroke-dasharray:4 4; opacity:.8; } .hgx-line.lane.closed{ stroke:#d23b2a; stroke-dasharray:2 3; opacity:1; } .hgx-line.lane.rail{ stroke:#8a7a6a; stroke-dasharray:10 3; }
.hgx-line.route{ stroke:#d9573a; stroke-width:3.5; } .hgx-mk.node .hgx-dot{ fill:#5d9bd5; cursor:pointer; } .hgx-mk.node.on .hgx-dot{ fill:#d9573a; } .hgx-mk.node.from .hgx-dot,.hgx-mk.node.to .hgx-dot{ fill:#1d2433; stroke:#ffcf5a; stroke-width:3; } .hgx-mk.node .hgx-mt{ font-size:11px; }
.hgx-sdg{ display:grid; grid-template-columns:repeat(6,1fr); gap:6px; margin:0 0 8px; } .hgx-sdg button{ background:var(--g); color:#fff; border:3px solid transparent; border-radius:10px; padding:6px; text-align:left; cursor:pointer; min-height:62px; display:flex; flex-direction:column; font:600 11.5px Inter,system-ui,sans-serif; }
.hgx-sdg button b{ font-size:18px; line-height:1; } .hgx-sdg button:disabled{ opacity:.35; cursor:default; } .hgx-sdg button.ok{ opacity:1; border-color:#fff; box-shadow:0 0 0 3px #3aa66a; } .hgx-sdg button.ok2{ opacity:.85; border-color:#fff; } .hgx-sdg button.no{ opacity:1; box-shadow:0 0 0 3px #d23b2a; }
@media (max-width:640px){ .hgx-uhi .zl{ font-size:19px; } .hgx-uhi .tl{ font-size:15px; } .hgx-uhi .tv{ font-size:17px; } .hgx-uhi .h{ r:12px; } .hgx-rs .lb,.hgx-rs .vl{ font-size:15px; } .hgx-city .cs{ font-size:15px; } .hgx-sdg{ grid-template-columns:repeat(3,1fr); } .hgx-cool{ grid-template-columns:1fr 1fr; } .hgx-hdiscale{ padding-right:0; } }
`;document.head.appendChild(css);
})();
