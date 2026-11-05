/* GeoFlock AP Human Geography games, unit 5: Agriculture and rural land use (needs geoflock-hug-plus.js).
   - Von Thünen farm builder: paint the land around a market town, harvest, and compare your rent with the best;
     then a river, a grain price shock and refrigerated lorries reshape the rings.
   - Farm the climate: place each farming system on a world map coloured by Köppen climate (WorldClim data through
     the Thermometer, geoflock-thermo.js), checked against the climate where you click.
   - Hearth hunt: where were wheat, rice, maize, potatoes, coffee… first domesticated?
   - The Green Revolution on a timeline: drag each event to its year.
   - Food miles: choose where your shopping comes from and how it travels; see the routes and the carbon.
   - Food miles with the ruler: a live-map mission. */
(function(){
"use strict";
if(!window.HGX||window._hgxC)return;window._hgxC=1;
const G=HGX,D=G.D,esc=G.esc,h=G.h,btn=G.btn,fmt=G.fmt;
/* the old von Thünen slider keeps its place as the explainer after the builder */
(function(){const A=HUG.labs.u5;const sl=A.find(x=>x.id==="vonthunen"&&x.kind==="slider");if(sl){sl.id="vtslider";sl.title="Reshape von Thünen’s rings (slider)"}})();

/* ---------------- Von Thünen farm builder ---------------- */
/* location rent per cell: R = a − b·d (a = yield × (price − cost), b = yield × freight rate) */
const VT_USE=[["dairy","Dairy & market gardens","#5aa36b",120,30],["forest","Forest (fuel & timber)","#2f6b3f",80,10],["grain","Grain","#e3c45a",56,4],["ranch","Ranching","#c79a5e",38.5,1.5]];
const VT_LV=[{t:"The isolated state",goal:"A flat, even plain with one market town in the middle and no roads. Paint the land to earn the most rent.",mod:{}},
 {t:"A navigable river",goal:"A river now flows east from the town. Shipping by river costs a third as much as by cart. Repaint for the most rent.",mod:{river:true}},
 {t:"A grain price shock",goal:"Grain prices jump by half, as wheat did in 2022 when Russia invaded Ukraine. Where does grain now pay best?",mod:{grain:1.5}},
 {t:"Refrigerated lorries",goal:"Cold-chain lorries halve the cost of moving milk and fresh vegetables. Repaint.",mod:{fresh:.5}}];
const VR=9,VN=2*VR+1;
G.add("u5",[{id:"vonthunen",kind:"game",ch:"hg5b",wide:true,title:"Von Thünen farm builder",blurb:"Paint the land around a market town, harvest, and beat the model; then a river and a price shock change the rings.",skill:"Von Thünen’s model and bid-rent (5.6): applying a model to changing conditions.",
 intro:"Johann von Thünen (1826) asked why farms change with distance from the market. Every crop earns its yield times its price, minus costs, minus the cost of carting it to town. Whatever pays the most rent at each distance wins the land.",
 play(el,done,L){
  let lv=0,score=0;const best=[0,0,0,0];
  const rent=(u,x,y,m)=>{const U=VT_USE.find(z=>z[0]===u);let a=U[3],b=U[4];if(u==="grain"&&m.grain)a=a*m.grain;if(u==="dairy"&&m.fresh)b=b*m.fresh;let d=Math.hypot(x,y);if(m.river&&x>0)d=Math.min(d,Math.abs(y)+x/3);return Math.max(0,a-b*d)};
  const bestUse=(x,y,m)=>{let bu=null,br=0;VT_USE.forEach(U=>{const r=rent(U[0],x,y,m);if(r>br){br=r;bu=U[0]}});return[bu,br]};
  const effD=(x,y,m)=>{let d=Math.hypot(x,y);if(m.river&&x>0)d=Math.min(d,Math.abs(y)+x/3);return d};
  const level=()=>{const Lv=VT_LV[lv],m=Lv.mod;const A={};let cur="dairy",brush="ring",checked=false;
   const cells=[];for(let y=-VR;y<=VR;y++)for(let x=-VR;x<=VR;x++){if(Math.hypot(x,y)<=VR+.3&&!(x===0&&y===0))cells.push([x,y])}
   const total=()=>cells.reduce((s,[x,y])=>s+(A[x+","+y]?rent(A[x+","+y],x,y,m):0),0);
   const opt=cells.reduce((s,[x,y])=>s+bestUse(x,y,m)[1],0);
   const draw=()=>{const cw=22,W=VN*cw;let svg='<svg viewBox="0 0 '+W+' '+W+'" class="hgx-vt"><circle cx="'+W/2+'" cy="'+W/2+'" r="'+(VR+.5)*cw+'" class="vt-plain"/>';
    if(m.river)svg+='<path d="M'+W/2+' '+W/2+' C'+(W*.65)+' '+(W/2+6)+' '+(W*.8)+' '+(W/2-6)+' '+W+' '+(W/2+3)+'" class="vt-river"/>';
    cells.forEach(([x,y])=>{const u=A[x+","+y];const U=u&&VT_USE.find(z=>z[0]===u);const ok=checked&&u===bestUse(x,y,m)[0];
     svg+='<rect x="'+((x+VR)*cw+1)+'" y="'+((y+VR)*cw+1)+'" width="'+(cw-2)+'" height="'+(cw-2)+'" rx="4" class="vt-c'+(checked?(ok?" ok":" no"):"")+'" data-x="'+x+'" data-y="'+y+'"'+(U?' style="fill:'+U[2]+'"':'')+'/>';
     if(checked&&!ok){const b=VT_USE.find(z=>z[0]===bestUse(x,y,m)[0]);svg+='<circle cx="'+((x+VR)*cw+cw/2)+'" cy="'+((y+VR)*cw+cw/2)+'" r="4" fill="'+b[2]+'" stroke="#fff" stroke-width="1.2" pointer-events="none"/>'}});
    svg+='<g class="vt-town" transform="translate('+(W/2)+','+(W/2)+')"><rect x="-10" y="-10" width="20" height="20" rx="4"/><path d="M-6 4 V-2 L0 -7 L6 -2 V4Z"/></g></svg>';
    /* the bid-rent graph */
    const gw=300,gh=150;let g='<svg viewBox="0 0 '+gw+' '+(gh+22)+'" class="hgx-vtg"><line x1="26" y1="'+gh+'" x2="'+gw+'" y2="'+gh+'" class="ax"/><line x1="26" y1="4" x2="26" y2="'+gh+'" class="ax"/>';
    const sx=d=>26+d*(gw-30)/VR,sy=r=>gh-r*(gh-8)/Math.max(130,VT_USE[2][3]*(m.grain||1));
    VT_USE.forEach(U=>{let p="";for(let d=0;d<=VR;d+=.25){const r=rent(U[0],d,0,Object.assign({},m,{river:false}));p+=(p?"L":"M")+sx(d).toFixed(1)+" "+sy(r).toFixed(1)}g+='<path d="'+p+'" stroke="'+U[2]+'" class="ln"/>'});
    g+='<text x="'+(gw/2)+'" y="'+(gh+16)+'" class="lb">distance from the market →</text><text x="4" y="12" class="lb">rent</text></svg>';
    const you=total();
    el.innerHTML='<div class="hgx-gtabs">'+VT_LV.map((x,k)=>'<button type="button" class="hgx-btn'+(k===lv?" on":"")+'" data-l="'+k+'">'+(best[k]?"✓ ":"")+(k+1)+'. '+x.t+'</button>').join("")+'</div>'+
     '<div class="hgx-q"><b>'+Lv.goal+'</b><small>Choose a land use, then click the plain. The <b>Ring</b> brush paints every square at the same transport cost; <b>Square</b> paints one. Then press <b>Harvest</b>.</small></div>'+
     '<div class="hgx-grow"><div class="hgx-gmap">'+svg+'</div><div class="hgx-gside"><div class="hgx-pal">'+VT_USE.map(U=>'<button type="button" data-u="'+U[0]+'" class="'+(U[0]===cur?"on":"")+'"><i style="background:'+U[2]+'"></i>'+U[1]+'</button>').join("")+'<button type="button" data-u="" class="'+(cur===""?"on":"")+'"><i style="background:transparent;border-style:dashed"></i>Clear</button></div>'+
     '<div class="hgx-pal"><span class="hgx-dim">Brush:</span><button type="button" data-b="ring" class="'+(brush==="ring"?"on":"")+'">◎ Ring</button><button type="button" data-b="one" class="'+(brush==="one"?"on":"")+'">▪ Square</button></div>'+
     '<p class="hgx-small">Rent the land earns: <b>'+fmt(you)+'</b>'+(checked?' · the best possible: <b>'+fmt(opt)+'</b>':'')+'</p>'+g+'<p class="hgx-dim hgx-small">The bid-rent lines: each use’s rent falls with distance at its own slope. The steepest (perishable, bulky goods) win near town.</p>'+
     '<div class="hgx-vtfb"></div></div></div>';
    el.querySelectorAll("[data-l]").forEach(b=>b.onclick=()=>{lv=+b.dataset.l;level()});
    el.querySelectorAll("[data-u]").forEach(b=>b.onclick=()=>{cur=b.dataset.u;draw()});
    el.querySelectorAll("[data-b]").forEach(b=>b.onclick=()=>{brush=b.dataset.b;draw()});
    const fb=el.querySelector(".hgx-vtfb");
    if(!checked){const hv=btn("🌾 Harvest","pri",harvest);hv.disabled=Object.keys(A).length<cells.length*.6;fb.appendChild(hv);if(hv.disabled)fb.insertAdjacentHTML("beforeend",'<span class="hgx-dim hgx-small"> Paint most of the plain first.</span>')}
    else{const f=G.clamp(you/opt,0,1);const p=Math.round(100*Math.max(0,(f-.5)/.5));
     fb.innerHTML='<div class="hgx-fb '+(f>=.95?"ok":f>=.8?"mid":"no")+'"><b>'+Math.round(f*100)+'% of the best rent. +'+p+'</b> Squares with a red edge earn less than they could; the dot shows the best use. '+
      (lv===0?"Fresh milk and vegetables pay most near town, where they reach market before they spoil; wood is heavy, so the forest comes next; grain keeps and travels; cattle walk themselves to market.":lv===1?"Along the river the rings stretch out east: cheaper transport makes far land behave like near land, just as von Thünen drew it.":lv===2?"Higher grain prices push the grain ring outwards and squeeze the others: price changes move the rings.":"Cheaper transport for fresh food lets dairy reach much farther from town: time–space compression reshapes the model.")+'</div>';
     fb.appendChild(btn(lv<VT_LV.length-1?"Next level →":"See your score","pri",()=>{if(lv<VT_LV.length-1){lv++;level()}else end()}));fb.appendChild(btn("Try again","",()=>{checked=false;draw()}))}
    const svgEl=el.querySelector(".hgx-vt");let down=false;
    const paint=t=>{if(checked||!t||t.dataset.x==null)return;const x=+t.dataset.x,y=+t.dataset.y;if(brush==="ring"){const band=Math.round(effD(x,y,m));cells.forEach(([a,b])=>{if(Math.round(effD(a,b,m))===band){if(cur)A[a+","+b]=cur;else delete A[a+","+b]}})}else{if(cur)A[x+","+y]=cur;else delete A[x+","+y]}};
    svgEl.addEventListener("pointerdown",e=>{down=true;e.preventDefault();paint(document.elementFromPoint(e.clientX,e.clientY));draw()});
    svgEl.addEventListener("pointermove",e=>{if(!down||brush==="ring")return;const t=document.elementFromPoint(e.clientX,e.clientY);if(t&&t.dataset.x!=null&&A[t.dataset.x+","+t.dataset.y]!==cur){paint(t);draw()}});
    svgEl.addEventListener("pointerup",()=>{down=false});
   };
   const harvest=()=>{checked=true;const f=total()/opt;const p=Math.round(100*Math.max(0,(f-.5)/.5));if(p>best[lv]){score+=p-best[lv];best[lv]=p}draw()};
   draw()};
  const end=()=>G.finish(el,{key:"g:"+L.id,pts:best.reduce((a,b)=>a+b,0),max:400,again:()=>{lv=0;best.fill(0);level()},done,lines:['<p>Von Thünen’s rings are bent by real geography, but the logic still works: Dutch greenhouses crowd round the cities, the Corn Belt sits farther out, and ranching fills the far West. Today the “town” is the world market, and refrigerated ships and planes stretch the rings round the planet.</p>']});
  level()}}]);

/* ---------------- Farm the climate ---------------- */
const KCOL={Af:"#1d4fd8",Am:"#2f7fe8",Aw:"#7fb6f2",BWh:"#e8483a",BWk:"#f2a19a",BSh:"#f0a43a",BSk:"#f6d77a",Csa:"#f2ea3a",Csb:"#c6c43a",Csc:"#9c9a2a",Cwa:"#96e896",Cwb:"#63c064",Cwc:"#3f9a40",Cfa:"#c6f05a",Cfb:"#78d84a",Cfc:"#3fae2a",Dsa:"#e85ad8",Dsb:"#c85ac8",Dsc:"#9a3a9a",Dsd:"#7a2a7a",Dwa:"#b3b8f8",Dwb:"#8090e8",Dwc:"#5868c8",Dwd:"#3a3aa0",Dfa:"#3ae8e8",Dfb:"#48c0f0",Dfc:"#1a7e8a",Dfd:"#10505a",ET:"#b8b8b8",EF:"#707070"};
const FARMS=[
 {n:"a wet-rice paddy (intensive subsistence)",ok:k=>/^(Af|Am|Aw|Cwa|Cfa|Cwb)$/.test(k),why:"Wet rice needs heat and lots of water: the monsoon lands of South and East Asia (Aw, Am, Cwa, Cfa) are its home."},
 {n:"Mediterranean agriculture (olives, grapes, citrus)",ok:k=>/^Cs/.test(k),why:"Olives and grapes love dry, hot summers and mild, wet winters: the Cs climates round the Mediterranean, California, central Chile, the Cape and south-west Australia."},
 {n:"pastoral nomadism (herding camels, goats, yaks)",ok:k=>/^(BWh|BWk|BSh|BSk|ET|Dwc|Dwb)$/.test(k),why:"Too dry or cold for crops, but grass and shrubs feed moving herds: the deserts, steppes and high plateaus of North Africa, Arabia, Central Asia and Mongolia."},
 {n:"a cocoa, coffee or banana plantation",ok:k=>/^(Af|Am|Aw|Cwb)$/.test(k),why:"Plantation crops are tropical and frost-free: the A climates (and tropical highlands, Cwb, for coffee)."},
 {n:"shifting cultivation (slash and burn)",ok:k=>/^(Af|Am|Aw)$/.test(k),why:"Rainforest soils lose their nutrients fast, so farmers clear a plot, farm it a few years and move on: the humid tropics (Af, Am, Aw)."},
 {n:"commercial grain farming (wheat)",ok:k=>/^(BSk|Dfa|Dfb|Dwa|Dwb|Cfa|Csa|Csb)$/.test(k),why:"Wheat likes cool to warm, fairly dry climates with cold winters or dry summers: the steppes and continental plains (BSk, Dfa, Dfb) of Kansas, Ukraine, Kazakhstan and the Canadian prairies, and the pampas."},
 {n:"a dairy farm",ok:k=>/^(Cfb|Dfb|Dfa|Cfc|Cfa)$/.test(k),why:"Cows need lush grass all year: the mild, wet oceanic (Cfb) and cool continental (Dfb) climates of north-west Europe, New Zealand and Wisconsin."},
 {n:"a livestock ranch",ok:k=>/^(BSh|BSk|BWk|BWh|Aw|Cfa|Csb)$/.test(k),why:"Ranches use cheap, dry or grassy land far from markets: the semi-arid steppes and savannas of the US West, the Australian outback, Argentina and Brazil’s cerrado."},
 {n:"reindeer herding",ok:k=>/^(ET|Dfc|Dfd|Dwc|Dwd)$/.test(k),why:"Reindeer graze lichen on the tundra and in the northern forest: the Sámi in Scandinavia, the Nenets in Siberia."}];
G.add("u5",[{id:"agclimate",kind:"game",ch:"hg5a",wide:true,title:"Farm the climate",blurb:"Place each farming system on a world map coloured by climate; the climate where you click decides.",skill:"Agricultural regions and physical geography (5.2, 5.3).",
 intro:"Where a kind of farming can work depends first on climate: heat, rain and how they change through the year. The map is coloured by Köppen climate, worked out from WorldClim data (the same data as the Thermometer in the toolkit).",
 play(el,done,L){
  const TH=window.gfThermo;
  el.innerHTML='<p class="hgx-dim">Loading the climate data…</p>';
  if(!TH||!TH.load){el.innerHTML='<p>The climate data is not available.</p>';return}
  TH.load().then(()=>{if(!el.isConnected)return;
   const play=()=>{el.innerHTML="";const R=G.shuffle(FARMS).slice(0,8);let i=0,score=0;const res=[];const H=G.hud(el,{res});const q=h("div","hgx-q");el.appendChild(q);
    const A=G.atlas(el,{names:true,grat:false,proj:"eq",bgStep:1});
    const kAt=(lo,la)=>{const d=TH.at([lo,la]);if(!d)return null;try{return TH.koppen(d.T,d.P,la)}catch(e){return null}};
    A.bg((lo,la)=>{const k=kAt(lo,la);return k?KCOL[k]||"#ccc":null},.5);
    const leg=h("div","hgx-kleg",'<span class="hgx-dim">Climate:</span> '+[["A","Tropical","#2f7fe8"],["B","Dry","#f0a43a"],["C","Temperate","#78d84a"],["D","Continental","#48c0f0"],["E","Polar","#b8b8b8"]].map(x=>'<i style="background:'+x[2]+'"></i>'+x[1]).join(" ")+' <span class="hgx-dim">· hover the map to read a climate</span>');el.appendChild(leg);
    A.hoverText=c=>null;A.svg.addEventListener("pointermove",e=>{const ll=A.ll(e);const tip=A.wrap.querySelector(".hgx-tip");if(!ll){tip.hidden=true;return}const k=kAt(ll[0],ll[1]);if(!k){tip.hidden=true;return}const r=A.wrap.getBoundingClientRect();tip.hidden=false;tip.innerHTML='<b>'+k+'</b> '+esc((TH.KN&&TH.KN[k])||"");let x=e.clientX-r.left+12;if(x>r.width-180)x-=200;tip.style.left=x+"px";tip.style.top=(e.clientY-r.top+12)+"px"});
    const fb=h("div","hgx-fbw");el.appendChild(fb);
    const ask=()=>{const r=R[i];H.set(i+1,R.length,score);A.clear();fb.innerHTML="";q.innerHTML='<b>Where would you put '+esc(r.n)+'?</b><small>Click a spot on land with a climate that suits it.</small>';
     A.onClick=(c,ll)=>{if(!ll||!c)return;const k=kAt(ll[0],ll[1]);if(!k)return;A.onClick=null;const ok=r.ok(k);score+=ok?100:0;res.push(ok?1:0);H.set(i+1,R.length,score);A.marker(ll,{cls:ok?"real":"guess",r:7,ring:14,text:k});
      fb.innerHTML='<div class="hgx-fb '+(ok?"ok":"no")+'"><b>'+(ok?"It grows! +100":"It fails here.")+'</b> You chose '+(c?esc(D.name(c))+", ":"")+'<b>'+k+'</b>: '+esc((TH.KN&&TH.KN[k])||"")+'. '+r.why+'</div>';fb.appendChild(btn(i+1<R.length?"Next farm →":"See your score","pri",()=>{i++;if(i<R.length)ask();else end()}))}};
    const end=()=>G.finish(el,{key:"g:"+L.id,pts:score,max:R.length*100,again:play,done,lines:['<p>Climate sets the limits; markets, technology and culture decide what is grown within them. Irrigation can push farming into deserts (California’s Central Valley, Egypt’s Nile), at a cost in water.</p>']});ask()};
   play()})}}]);

/* ---------------- Hearth hunt ---------------- */
const HEARTHS=[["wheat and barley",38.5,37,"The Fertile Crescent, about 11,500 years ago: the arc from the Levant through south-east Turkey to the Zagros. Wheat, barley, lentils, sheep and goats."],
 ["rice",113,29.5,"The Yangtze valley in China, about 9,000 years ago. Rice later spread across monsoon Asia; Africa domesticated its own rice in the inland Niger delta."],
 ["maize (corn)",-100,18.3,"The Balsas valley in southern Mexico, about 9,000 years ago, from a wild grass called teosinte. With beans and squash it fed the Maya and the Aztecs."],
 ["the potato",-69.5,-15.8,"The Andes near Lake Titicaca, about 8,000 years ago. After the Columbian Exchange it fed Europe’s growing cities, and Ireland came to depend on it."],
 ["sorghum",33,13,"The eastern Sahel of Sudan and Ethiopia, about 5,000 years ago: a crop that survives drought."],
 ["bananas and taro",144,-5.8,"The highlands of New Guinea, about 7,000 years ago: one of the independent hearths, far from the others."],
 ["coffee",36.2,7.3,"South-west Ethiopia (the old kingdom of Kaffa). From there it went to Yemen, and by the 1600s to the coffee houses of Istanbul and London."],
 ["cacao (chocolate)",-78.5,-4.3,"The upper Amazon, in south-east Ecuador, about 5,300 years ago. Today most cocoa grows in West Africa: Côte d’Ivoire and Ghana."],
 ["the soybean",117,36,"Northern China, about 3,000 years ago. Today the US and Brazil grow most of the world’s soy, much of it to feed animals."],
 ["the sunflower",-87,37,"Eastern North America, about 4,000 years ago. Russia and Ukraine now grow half the world’s sunflower seed."],
 ["African rice and yams",-4,14,"West Africa: African rice in the inland Niger delta of Mali about 3,000 years ago; yams in the forests to the south."]];
G.add("u5",[{id:"hearths",kind:"hunt",ch:"hg5a",wide:true,title:"Hearth hunt: where food began",blurb:"Find where the world’s great crops were first domesticated.",skill:"Agricultural origins and diffusion (5.4): hearths and the Columbian Exchange.",
 intro:"Farming began independently in several hearths, each with its own crops and animals. They spread out from there, and after 1492 the Columbian Exchange swapped them between the hemispheres.",
 game:{n:8,rounds:HEARTHS.map(s=>({q:"Where was "+esc(s[0])+" first grown?",ll:[s[1],s[2]],name:s[0].charAt(0).toUpperCase()+s[0].slice(1),tol:450,why:s[3]}))}}]);

/* ---------------- The Green Revolution on a timeline ---------------- */
const GREV=[[1909,"Fritz Haber makes ammonia from the air: synthetic fertiliser becomes possible"],[1944,"Norman Borlaug starts breeding wheat in Mexico for the Rockefeller Foundation"],[1956,"Mexico grows all the wheat it needs, with short, rust-proof varieties"],
 [1965,"India and Pakistan import Mexican dwarf wheat seed after drought and famine fears"],[1966,"IR8 ‘miracle rice’ is released by the rice institute in the Philippines"],[1968,"An American official names it the ‘Green Revolution’"],[1970,"Borlaug wins the Nobel Peace Prize"],
 [1996,"The first genetically modified crops are planted commercially, in the US"],[2006,"AGRA is founded to bring the Green Revolution to Africa"],[2022,"War in Ukraine sends wheat and fertiliser prices to record highs"]];
G.add("u5",[{id:"greenrev",kind:"game",ch:"hg5c",wide:true,title:"The Green Revolution on a timeline",blurb:"Drag each event to its year. Close counts.",skill:"The Green Revolution (5.9): its causes, spread and consequences.",
 intro:"The Green Revolution brought high-yield seeds, fertiliser, pesticides and irrigation to poorer countries from the 1940s. Yields of wheat and rice soared, especially in Asia; Africa was largely left out.",
 play(el,done,L){
  const Y0=1900,Y1=2030;
  const play=()=>{el.innerHTML="";const R=G.shuffle(GREV);const pos={};let i=0;
   const wrap=h("div","hgx-tl");el.appendChild(wrap);const fb=h("div","hgx-fbw");el.appendChild(fb);
   const draw=(checked)=>{let tl='<div class="hgx-tl-axis">';for(let y=1900;y<=2030;y+=10)tl+='<span style="left:'+((y-Y0)/(Y1-Y0)*100)+'%">'+y+'</span>';tl+='</div><div class="hgx-tl-track" data-track>';
    R.forEach((e,k)=>{if(pos[k]==null)return;tl+='<i class="hgx-tl-pin'+(k===i&&!checked?" cur":"")+(checked?(Math.abs(pos[k]-e[0])<=3?" ok":Math.abs(pos[k]-e[0])<=10?" mid":" no"):"")+'" style="left:'+((pos[k]-Y0)/(Y1-Y0)*100)+'%" title="'+esc(e[1])+'"><b>'+(k+1)+'</b></i>';if(checked)tl+='<i class="hgx-tl-true" style="left:'+((e[0]-Y0)/(Y1-Y0)*100)+'%"><b>'+(k+1)+'</b></i>'});
    tl+='</div>';
    wrap.innerHTML=(checked?'':'<div class="hgx-q"><b>'+(i+1)+'. '+esc(R[i][1])+'</b><small>Drag along the timeline (or tap it) to set the year, then press Place. Event '+(i+1)+' of '+R.length+'.</small></div>')+tl+
     (checked?'<ol class="hgx-tl-list">'+R.map((e,k)=>'<li><b>'+e[0]+'</b> '+esc(e[1])+' <span class="hgx-pill '+(Math.abs(pos[k]-e[0])<=3?"g":Math.abs(pos[k]-e[0])<=10?"m":"b")+'">you: '+pos[k]+'</span></li>').join("")+'</ol>':'');
    if(checked)return;const tr=wrap.querySelector("[data-track]");let dn=false;const set=e=>{const r=tr.getBoundingClientRect();pos[i]=Math.round(Y0+G.clamp((e.clientX-r.left)/r.width,0,1)*(Y1-Y0));draw(false);fb.querySelector("[data-place]").disabled=false};
    tr.onpointerdown=e=>{dn=true;set(e)};tr.onpointermove=e=>{if(dn)set(e)};tr.onpointerup=()=>{dn=false};
    const yr=wrap.querySelector(".hgx-tl-pin.cur");if(yr)yr.insertAdjacentHTML("beforeend",'<em>'+pos[i]+'</em>')};
   const step=()=>{fb.innerHTML="";const b=btn("Place","pri",()=>{i++;if(i<R.length)step();else check()});b.dataset.place=1;b.disabled=pos[i]==null;fb.appendChild(b);draw(false)};
   const check=()=>{draw(true);let pts=0;R.forEach((e,k)=>{const d=Math.abs(pos[k]-e[0]);pts+=d<=3?100:d<=10?Math.round(100-(d-3)*8):Math.max(0,Math.round(44-(d-10)*2))});
    fb.innerHTML='<div class="hgx-fb mid">Grey numbers show the real years. The Green Revolution’s core was fast: from Borlaug’s Mexican wheat to India’s harvests took about twenty years. Its costs came later: falling water tables in Punjab, fertiliser run-off, and bigger farms squeezing out small ones.</div>';
    fb.appendChild(btn("See your score","pri",()=>G.finish(el,{key:"g:"+L.id,pts,max:R.length*100,again:play,done})))};
   step()};play()}}]);

/* ---------------- Food miles: fill a basket ---------------- */
const LON=[-0.13,51.51];
/* kg CO2e per kg of food, transport by mode per tonne-km: road 0.1, sea 0.015, air 0.8 (DEFRA-style averages); plus the production extras that matter (heated greenhouses, cold storage) */
const BASKET=[{item:"Green beans in February",opts:[["Kenya, flown in",36.8,-1.3,"air",0],["Spain, by lorry",-2.4,36.8,"road",.1],["A heated British greenhouse",-1.5,52.5,"road",2.2]],note:"Air freight is the carbon heavyweight: a kilo of beans flown 6,800 km emits over 5 kg of CO2. Spanish beans grown in the sun and trucked north do best."},
 {item:"Tomatoes in winter",opts:[["Almería, Spain, unheated plastic greenhouses",-2.46,36.84,"road",.3],["A heated greenhouse in Kent",.9,51.2,"road",2.5],["Morocco, by lorry and ferry",-9.6,30.4,"road",.3]],note:"Distance is not everything: a heated British greenhouse burns so much gas that tomatoes trucked 2,000 km from Spain or Morocco have the smaller footprint."},
 {item:"Apples in April",opts:[["New Zealand, by sea",174.9,-39.5,"sea",.05],["British apples, kept 6 months in cold store",.9,51.2,"road",.12],["Chile, by sea",-71.2,-35,"sea",.05]],note:"A close call: shipping by sea is so efficient that apples from the other side of the world can match British apples that sat in a cold store since October."},
 {item:"Asparagus in November",opts:[["Peru, flown in",-79,-8.1,"air",0],["Peru, shipped (canned or frozen)",-79,-8.1,"sea",.3],["Wait for the British season in May",-0.5,52.2,"road",0]],note:"Fresh asparagus from Peru flies 10,000 km: about 8 kg of CO2 per kilo. Eating in season, or shipped, cuts it by over 90%."},
 {item:"Bananas",opts:[["Ecuador, by refrigerated ship",-79.9,-2.2,"sea",.05],["Costa Rica, by refrigerated ship",-83.5,10,"sea",.05],["Ecuador, flown in",-79.9,-2.2,"air",0]],note:"Bananas almost always come by ship, which is why a banana’s footprint is small despite 9,000 km of travel."},
 {item:"Lamb",opts:[["New Zealand, by sea",172.6,-43.5,"sea",0],["Welsh hill farms",-3.7,52.4,"road",0],["Ireland, by lorry and ferry",-7.7,53.2,"road",0]],note:"For meat, how the animal is raised matters far more than how it travels: shipping is a few per cent of lamb’s footprint. All three are similar here."}];
const MODE={road:[.1,"by lorry"],sea:[.015,"by sea"],air:[.8,"by air"]};
G.add("u5",[{id:"foodmiles",kind:"game",ch:"hg5c",wide:true,title:"Food miles: fill the basket",blurb:"Choose where your food comes from; see the route on the map and what it costs the climate.",skill:"The global food system (5.10, 5.11): food miles and commodity chains.",
 intro:"Food miles measure how far food travels from farm to plate. The idea began in London in the 1990s; the research since shows that how food travels, and how it is grown, can matter more than how far.",
 play(el,done,L){
  const play=()=>{el.innerHTML="";const R=G.shuffle(BASKET).slice(0,5);let i=0,score=0;const res=[];const H=G.hud(el,{res});const q=h("div","hgx-q");el.appendChild(q);const ch=h("div","hgx-fmopts");el.appendChild(ch);
   const A=G.atlas(el,{names:true});const fb=h("div","hgx-fbw");el.appendChild(fb);
   const co2=o=>{const d=G.km([o[1],o[2]],LON)*(o[3]==="sea"?1.3:o[3]==="road"?1.2:1);return{d,c:d/1000*MODE[o[3]][0]+o[4]}};
   const ask=()=>{const r=R[i];H.set(i+1,R.length,score);A.clear();fb.innerHTML="";ch.innerHTML="";A.reset();
    q.innerHTML='<b>Your shopping in London: '+esc(r.item)+'</b><small>Which choice has the smallest carbon footprint? The routes are on the map.</small>';
    A.marker(LON,{r:6,text:"London"});const cs=["#2b6fd0","#d9682b","#3aa66a"];
    r.opts.forEach((o,k)=>{A.line([o[1],o[2]],LON,{col:cs[k],cls:o[3]==="air"?"":"dash2"});A.marker([o[1],o[2]],{r:5,col:cs[k]})});
    {const xs=r.opts.map(o=>o[1]).concat(LON[0]),ys=r.opts.map(o=>o[2]).concat(LON[1]);const w=Math.max(...xs)-Math.min(...xs),hh=Math.max(...ys)-Math.min(...ys);if(w<170){const pd=Math.max(6,w*.25,hh*.25);A.home=()=>A.focusBox([[Math.min(...xs)-pd,Math.min(...ys)-pd],[Math.max(...xs)+pd,Math.max(...ys)+pd]]);A.home()}else A.home=null}
    const v=r.opts.map(co2);const min=Math.min(...v.map(x=>x.c));
    r.opts.forEach((o,k)=>{const b=btn('<i style="background:'+cs[k]+'"></i><b>'+esc(o[0])+'</b><small>'+fmt(v[k].d)+' km '+MODE[o[3]][1]+'</small>',"hgx-fmo",()=>{ch.querySelectorAll("button").forEach(x=>x.disabled=true);
      const best=v[k].c<=min*1.15;const p=best?100:v[k].c<=min*2.5?50:0;score+=p;res.push(p/100);H.set(i+1,R.length,score);
      const mx=Math.max(...v.map(x=>x.c));
      fb.innerHTML='<div class="hgx-fb '+(p===100?"ok":p?"mid":"no")+'"><b>'+(p===100?"Lowest footprint! +100":p?"Not bad. +50":"The heaviest choice.")+'</b><div class="hgx-bars">'+r.opts.map((o,j)=>'<div><span>'+esc(o[0])+'</span><i style="width:'+Math.max(2,v[j].c/mx*100)+'%;background:'+cs[j]+'"></i><b>'+v[j].c.toFixed(2)+' kg CO₂</b></div>').join("")+'</div><p>'+r.note+'</p></div>';
      fb.appendChild(btn(i+1<R.length?"Next item →":"See your score","pri",()=>{i++;if(i<R.length)ask();else end()}))});ch.appendChild(b)})};
   const end=()=>G.finish(el,{key:"g:"+L.id,pts:score,max:R.length*100,again:play,done,lines:['<p>Rules of thumb: avoid air-freighted fresh food; eat in season; a ship moving food across the world often emits less than a lorry across one country. Figures per kilo of food, rough averages.</p>']});ask()};play()}}]);

/* ---------------- Food miles with the ruler (live map) ---------------- */
G.add("u5",[{id:"foodruler",kind:"mission",ch:"hg5c",title:"Measure the food miles",blurb:"On the live map, use the toolkit’s ruler to measure how far real food travels.",skill:"Commodity chains and the global food system (5.10).",
 how:"The live map opens with a task card. Drag the <b>Ruler</b> out of the toolkit tray, click the farm, then the market, and type the distance.",
 mission:{title:"Measure the food miles",mode:"relief",n:5,intro:"Five foods, five journeys. Measure each in a straight line with the <b>Ruler</b> from the toolkit tray.",
  rounds:[
   {q:"Bananas: from Guayaquil, Ecuador, to the port of Rotterdam.",kind:"num",ans:9750,unit:"km",tol:.07,fly:[[-85,-10],[10,58]],tip:"The ship’s real route through the Panama Canal is longer than the ruler line.",why:"About 9,750 km in a straight line. Europe’s bananas come mostly from Ecuador, Colombia and Costa Rica, by refrigerated ship."},
   {q:"Avocados: from Uruapan, Michoacán (Mexico), to Chicago.",kind:"num",ans:2900,unit:"km",tol:.08,fly:[[-108,15],[-82,45]],tip:"Uruapan is west of Mexico City.",why:"About 2,900 km by lorry. Michoacán grows most of the avocados Americans eat."},
   {q:"Lamb: from Christchurch, New Zealand, to London.",kind:"num",ans:18960,unit:"km",tol:.06,fly:[[-30,-50],[180,60]],tip:"Almost to the far side of the Earth: try the globe if the flat map wraps.",why:"About 19,000 km: Christchurch is close to London’s antipode. Yet shipping adds only a few per cent to lamb’s footprint."},
   {q:"Coffee: from Addis Ababa, Ethiopia, to Seattle.",kind:"num",ans:11400,unit:"km",tol:.07,fly:[[-130,0],[45,62]],tip:"Coffee’s hearth to the city that made coffee shops global.",why:"About 11,400 km. Coffee is a classic commodity chain: most of its value is added far from the farm."},
   {q:"Rice: from Bangkok to Dakar, Senegal.",kind:"num",ans:11100,unit:"km",tol:.07,fly:[[-20,0],[105,35]],tip:"Senegal imports most of its rice from Asia.",why:"About 11,100 km. Senegal eats more rice than it grows, a legacy of colonial policies that made it grow peanuts for export."},
   {q:"Strawberries: from Huelva, Spain, to Berlin.",kind:"num",ans:2350,unit:"km",tol:.08,fly:[[-10,35],[20,55]],tip:"Huelva is in south-west Spain, near Portugal.",why:"About 2,350 km by lorry. Huelva’s plastic greenhouses supply much of northern Europe’s winter strawberries, using a lot of the Doñana wetland’s water."}]}}]);

/* ---------------- Farming’s footprint hunt ---------------- */
const FOOT=[["the Aral Sea",60,45,"Once the world’s fourth-largest lake; Soviet cotton irrigation from its two rivers shrank it by about 90% since the 1960s, leaving salty dust and dead fishing towns."],
 ["the Gulf of Mexico dead zone",-90.5,28.8,"Fertiliser washed down the Mississippi from the Corn Belt feeds algae that use up the oxygen: a dead zone of about 15,000 km² most summers."],
 ["the Dust Bowl",-101.5,36.5,"In the 1930s ploughed-up prairie in Oklahoma, Kansas and Texas blew away in drought: a lesson in farming beyond what the climate can bear."],
 ["the Ogallala aquifer",-100.5,40,"Under the Great Plains: pumped for irrigation far faster than rain refills it; parts of Kansas and Texas are running dry."],
 ["the arc of deforestation",-60,-11,"Along the southern Amazon in Rondônia and Mato Grosso, forest is cleared for cattle and soy. Clearing fell sharply in 2023–24 under new enforcement."],
 ["Borneo’s oil-palm frontier",114.5,1,"Rainforest cleared for oil palm, the world’s most used vegetable oil: the orangutan’s habitat has halved since the 1970s."],
 ["the Sahel",2,15,"The semi-arid belt south of the Sahara, where overgrazing, cutting trees for fuel and droughts can turn land to desert (desertification). The Great Green Wall aims to restore it."],
 ["Punjab’s falling water tables",75.5,30.8,"The Green Revolution’s heartland: free electricity for pumps and thirsty rice have dropped groundwater by tens of metres."],
 ["the Central Valley of California",-120,36.7,"A desert made into a garden by irrigation: it grows a quarter of the US’s food, and the land is sinking as groundwater is pumped out."],
 ["the Murray–Darling basin",145,-34,"Australia’s food bowl: irrigation took so much water that the river’s mouth silted up; states now buy water back for the environment."]];
G.add("u5",[{id:"footprint",kind:"hunt",ch:"hg5d",wide:true,title:"Farming’s footprint hunt",blurb:"Find the places where farming has changed the land, the water and the sea.",skill:"Agriculture and the environment (5.11, 5.12): desertification, irrigation, pollution, deforestation.",
 intro:"Feeding eight billion people reshapes the planet: forests cleared, aquifers drained, rivers emptied, seas starved of oxygen. Each of these places is a case study for the exam.",
 game:{n:8,rounds:FOOT.map(s=>({q:"Find "+esc(s[0]),ll:[s[1],s[2]],name:s[0].charAt(0).toUpperCase()+s[0].slice(1),tol:350,why:s[3]}))}}]);

/* ---- the existing labs join their chapters ---- */
const CH={intensive:"hg5a",survey:"hg5b",revs:"hg5b",chain:"hg5c",vtslider:"hg5b"};
for(const id in CH)G.set("u5",id,{ch:CH[id]});
/* the old von Thünen slider becomes the explainer that follows the builder */
G.set("u5","vonthunen",{ch:"hg5b"});

const css=document.createElement("style");css.textContent=`
.hgx-vt{ width:100%; max-width:470px; display:block; margin:0 auto; touch-action:none; user-select:none; }
.hgx-vt .vt-plain{ fill:#efe6cf; stroke:#c9b98f; } .hgx-vt .vt-c{ fill:rgba(255,255,255,.55); stroke:rgba(0,0,0,.08); cursor:pointer; } .hgx-vt .vt-c:hover{ stroke:#1d2433; stroke-width:1.5; }
.hgx-vt .vt-c.no{ stroke:#d23b2a; stroke-width:2; } .hgx-vt .vt-river{ fill:none; stroke:#4f8fd6; stroke-width:6; opacity:.75; pointer-events:none; }
.hgx-vt .vt-town rect{ fill:#7a4b2a; stroke:#fff; stroke-width:2; } .hgx-vt .vt-town path{ fill:#fff; }
.hgx-vtg{ width:100%; display:block; margin-top:6px; } .hgx-vtg .ax{ stroke:currentColor; opacity:.4; } .hgx-vtg .ln{ fill:none; stroke-width:2.5; } .hgx-vtg .lb{ font:600 10px Inter,system-ui,sans-serif; fill:currentColor; opacity:.65; }
.hgx-kleg{ font-size:12px; margin:6px 0 0; display:flex; flex-wrap:wrap; gap:4px; align-items:center; } .hgx-kleg i{ display:inline-block; width:12px; height:12px; border-radius:3px; margin:0 3px 0 8px; vertical-align:-2px; }
.hgx-tl{ margin:4px 0 6px; } .hgx-tl-axis{ position:relative; height:18px; margin:18px 12px 0; font-size:10.5px; opacity:.7; } .hgx-tl-axis span{ position:absolute; transform:translateX(-50%); }
.hgx-tl-track{ position:relative; height:64px; margin:0 12px; border-radius:12px; background:linear-gradient(90deg,rgba(95,154,60,.15),rgba(95,154,60,.35)); cursor:pointer; touch-action:none; }
.hgx-tl-track::before{ content:""; position:absolute; left:0; right:0; top:50%; border-top:2px solid rgba(127,127,127,.5); }
.hgx-tl-pin,.hgx-tl-true{ position:absolute; top:10px; transform:translateX(-50%); width:26px; height:26px; border-radius:50%; background:#8a96a8; color:#fff; font-style:normal; display:grid; place-items:center; font-size:12px; box-shadow:0 2px 5px rgba(0,0,0,.3); }
.hgx-tl-pin.cur{ background:var(--uc,#5f9a3c); width:32px; height:32px; top:7px; } .hgx-tl-pin em{ position:absolute; top:-18px; font-style:normal; font-weight:800; font-size:12px; color:inherit; }
.hgx-tl-pin.ok{ background:#3aa66a; } .hgx-tl-pin.mid{ background:#e2a33a; } .hgx-tl-pin.no{ background:#d9573a; } .hgx-tl-true{ top:36px; background:#5b6575; width:22px; height:22px; font-size:11px; }
.hgx-tl-list{ font-size:13px; margin:10px 0 0; padding-left:22px; } .hgx-tl-list li{ margin:3px 0; }
.hgx-fmopts{ display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin:0 0 8px; } .hgx-fmo{ text-align:left; border-radius:12px !important; display:flex; flex-direction:column; gap:2px; position:relative; padding-left:28px !important; }
.hgx-fmo i{ position:absolute; left:10px; top:13px; width:11px; height:11px; border-radius:50%; } .hgx-fmo small{ font-weight:500; opacity:.75; }
.hgx-line.dash2{ stroke-dasharray:2 4; stroke-width:2.6; }
.hgx-bars{ margin:6px 0; } .hgx-bars div{ display:grid; grid-template-columns:minmax(120px,1.3fr) 2fr auto; gap:8px; align-items:center; font-size:12.5px; margin:3px 0; } .hgx-bars i{ height:12px; border-radius:6px; display:block; }
@media (max-width:640px){ .hgx-fmopts{ grid-template-columns:1fr; } }
`;document.head.appendChild(css);
})();
