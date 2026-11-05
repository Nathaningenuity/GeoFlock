/* GeoFlock AP Human Geography games, units 3 and 4 (needs geoflock-hug-plus.js).
   Unit 3: Diffusion on the map (name the diffusion from real spreads; a free simulator over real cities), Where do
   they pray? (religion map), Paint the language families, Sacred-site hunt.
   Unit 4: Boundary spotter (real borders from the map's own shapes), Shapes of states (real outlines), Choke-point
   hunt, Who's in the club? (EU, NATO, landlocked states), Gerrymander a state (packing, cracking, efficiency gap). */
(function(){
"use strict";
if(!window.HGX||window._hgxB)return;window._hgxB=1;
const G=HGX,D=G.D,esc=G.esc,h=G.h,btn=G.btn,fmt=G.fmt;
const region=r=>{try{return COUNTRIES.filter(c=>c.r===r).map(c=>c.c).filter(G.feat)}catch(e){return[]}};

/* ===================== UNIT 3 ===================== */
/* ---- Diffusion on the map ---- */
const CITIES=[["Tokyo",139.69,35.69,37],["Delhi",77.21,28.61,33],["Shanghai",121.47,31.23,30],["Dhaka",90.41,23.81,23],["São Paulo",-46.63,-23.55,22],["Cairo",31.24,30.04,22],["Mexico City",-99.13,19.43,22],["Beijing",116.4,39.9,22],["Mumbai",72.88,19.08,21],["Osaka",135.5,34.69,19],["Karachi",67,24.86,17],["Istanbul",28.98,41.01,16],["Buenos Aires",-58.38,-34.6,15.5],["Kolkata",88.36,22.57,15.5],["Lagos",3.38,6.52,15.9],["Kinshasa",15.27,-4.44,16],["Manila",120.98,14.6,15],["Guangzhou",113.26,23.13,14],["Rio de Janeiro",-43.17,-22.91,14],["Lahore",74.36,31.52,14],["Moscow",37.62,55.76,12.7],["Paris",2.35,48.86,11.2],["Bogotá",-74.07,4.71,11.5],["Jakarta",106.85,-6.21,11],["Lima",-77.03,-12.05,11],["Bangkok",100.5,13.76,11],["Seoul",126.98,37.57,10],["London",-0.13,51.51,9.6],["Tehran",51.39,35.69,9.5],["New York",-74,40.71,19],["Los Angeles",-118.24,34.05,12.5],["Chicago",-87.63,41.88,8.9],["Ho Chi Minh City",106.63,10.82,9.3],["Luanda",13.23,-8.84,9.6],["Nairobi",36.82,-1.29,5.3],["Johannesburg",28.05,-26.2,6.4],["Baghdad",44.37,33.31,7.7],["Madrid",-3.7,40.42,6.8],["Toronto",-79.38,43.65,6.4],["Riyadh",46.72,24.71,7.9],["Sydney",151.21,-33.87,5.1],["Berlin",13.4,52.52,3.6],["Rome",12.5,41.9,4.3],["Addis Ababa",38.75,9.03,5.7],["Casablanca",-7.59,33.57,3.9],["Santiago",-70.67,-33.45,6.9],["Dakar",-17.47,14.72,3.6],["Accra",-0.19,5.6,2.7],["Singapore",103.82,1.35,6],["Melbourne",144.96,-37.81,5.2],["Vancouver",-123.12,49.28,2.6],["Houston",-95.37,29.76,6.7],["Miami",-80.19,25.76,6.2],["Hanoi",105.85,21.03,5.2],["Kabul",69.21,34.53,4.6],["Khartoum",32.53,15.5,6.3],["Abidjan",-4.01,5.36,5.6],["Caracas",-66.9,10.48,3],["Montreal",-73.57,45.5,4.3],["Warsaw",21.01,52.23,1.8]];
/* real spreads, step by step: [name, lon, lat] per step; type is the answer */
const CASES=[
 {t:"hierarchical",n:"Starbucks opens in China, 1999–2017",box:[[95,20],[128,46]],steps:[[["Beijing",116.4,39.9],["Shanghai",121.47,31.23]],[["Guangzhou",113.26,23.13],["Shenzhen",114.06,22.54],["Hangzhou",120.15,30.27],["Chengdu",104.07,30.66]],[["Wuhan",114.3,30.59],["Xi’an",108.94,34.34],["Nanjing",118.8,32.06],["Tianjin",117.2,39.08],["Chongqing",106.55,29.56]],[["Kunming",102.83,25.04],["Harbin",126.63,45.75],["Changsha",112.94,28.23],["Zhengzhou",113.63,34.75],["Xiamen",118.09,24.48]],[["Guilin",110.29,25.27],["Yinchuan",106.23,38.49],["Lhasa",91.11,29.65],["Baotou",109.84,40.66],["Zhuhai",113.58,22.27]]],
  why:"Hierarchical: the chain opened first in the two biggest, richest cities, then in provincial capitals, then in smaller cities. Each step went down the urban hierarchy, not outwards across the map."},
 {t:"contagious",n:"The Black Death in Europe, 1347–1351",box:[[-12,30],[45,66]],steps:[[["Messina",15.55,38.19]],[["Naples",14.27,40.85],["Marseille",5.37,43.3],["Genoa",8.93,44.41],["Tunis",10.18,36.81]],[["Paris",2.35,48.86],["Barcelona",2.17,41.39],["Florence",11.26,43.77],["Vienna",16.37,48.21],["Lyon",4.84,45.76]],[["London",-0.13,51.51],["Cologne",6.96,50.94],["Bordeaux",-0.58,44.84],["Budapest",19.04,47.5],["Frankfurt",8.68,50.11]],[["Bergen",5.32,60.39],["Hamburg",9.99,53.55],["Copenhagen",12.57,55.68],["Dublin",-6.26,53.35],["Lübeck",10.69,53.87]],[["Stockholm",18.07,59.33],["Novgorod",31.27,58.52],["Danzig",18.65,54.35],["Moscow",37.62,55.76]]],
  why:"Contagious: the plague spread outwards from place to place, like a ripple, reaching everyone in its path. A wave you can see moving across the map is the sign of contagious diffusion."},
 {t:"relocation",n:"The Sikh diaspora carries a faith abroad, 1900–2000",box:[[-130,-45],[155,62]],steps:[[["Amritsar, Punjab",74.88,31.63]],[["Vancouver",-123.12,49.28],["Yuba City, California",-121.62,39.14]],[["Southall, London",-0.38,51.51],["Birmingham",-1.9,52.48]],[["Brampton, Toronto",-79.76,43.73],["Melbourne",144.96,-37.81]]],
  why:"Relocation: the faith did not spread across the places in between. It jumped thousands of kilometres because Punjabi migrants carried it with them, and gurdwaras rose where they settled.",reloc:true},
 {t:"hierarchical",n:"COVID-19 spreads, January to March 2020",box:[[-130,-40],[150,62]],steps:[[["Wuhan",114.3,30.59]],[["Bangkok",100.5,13.76],["Seoul",126.98,37.57],["Tokyo",139.69,35.69],["Seattle",-122.33,47.61]],[["Milan",9.19,45.46],["Tehran",51.39,35.69],["Paris",2.35,48.86],["New York",-74,40.71],["London",-0.13,51.51]],[["São Paulo",-46.63,-23.55],["Madrid",-3.7,40.42],["Sydney",151.21,-33.87],["Mumbai",72.88,19.08],["Lagos",3.38,6.52],["Mexico City",-99.13,19.43]]],
  why:"Hierarchical first: the virus flew from one global hub to another before it reached the towns between them. (After that it spread contagiously within each country.)",reloc:true},
 {t:"stimulus",n:"McDonald’s reaches India, 1996",box:[[-100,5],[90,50]],steps:[[["Chicago (the idea)",-87.63,41.88]],[["New Delhi: no beef, a McAloo Tikki",77.21,28.61],["Mumbai: the Maharaja Mac, made of chicken",72.88,19.08]]],
  why:"Stimulus: the idea of the fast-food burger spread, but it changed on arrival. In a mostly Hindu country, where cows are sacred, the menu has no beef at all.",reloc:true},
 {t:"contagious",n:"Islam spreads from Arabia, 632–750",box:[[-12,8],[72,46]],steps:[[["Medina",39.61,24.47],["Mecca",39.83,21.42]],[["Damascus",36.29,33.51],["Jerusalem",35.23,31.78],["Baghdad region",44.37,33.31]],[["Alexandria",29.92,31.2],["Isfahan",51.67,32.65],["Mosul",43.13,36.34]],[["Kairouan",10.1,35.68],["Merv",61.83,37.66],["Tripoli",13.19,32.89]],[["Córdoba",-4.78,37.88],["Samarkand",66.96,39.65],["Fez",-5,34.03]]],
  why:"Expansion by contact: the faith spread outward across neighbouring lands, step by step, mostly through conquest, trade and conversion along the frontier. A spreading wave is contagious diffusion."},
 {t:"relocation",n:"Irish emigrants take St Patrick’s Day with them, 1840s–1900s",box:[[-80,-45],[155,60]],steps:[[["Dublin",-6.26,53.35]],[["Boston",-71.06,42.36],["New York",-74,40.71]],[["Chicago",-87.63,41.88],["Buenos Aires",-58.38,-34.6]],[["Sydney",151.21,-33.87]]],
  why:"Relocation: after the Great Famine about a million and a half Irish left. The holiday appeared where they settled, far from Ireland, with nothing in between.",reloc:true},
 {t:"stimulus",n:"Sequoyah invents a Cherokee syllabary, 1821",box:[[-100,25],[-70,45]],steps:[[["English letters around him",-77,39]],[["Cherokee lands: a new script of 85 symbols",-84.5,35.2]]],
  why:"Stimulus: Sequoyah could not read English, but the idea that marks on paper could hold words reached him. He invented his own symbols for Cherokee: the idea spread, the form was new.",reloc:true}];
const TYPES=[["contagious","Contagious"],["hierarchical","Hierarchical"],["relocation","Relocation"],["stimulus","Stimulus"]];
G.add("u3",[{id:"diffmap",kind:"game",ch:"hg3a",wide:true,title:"Diffusion on the map",blurb:"Watch real spreads play out on the map, then name the kind of diffusion. Or run your own.",skill:"Types of diffusion (3.5): contagious, hierarchical, relocation and stimulus.",
 intro:"Diffusion is how ideas, products and diseases spread from a hearth. Its shape on the map gives the type away: a ripple, a jump down the city ladder, a leap with the migrants, or an idea that changes as it arrives.",
 play(el,done,L){
  const start=()=>{el.innerHTML='<div class="hgx-start"><p>Two ways to play:</p><div class="hgx-choice"><button type="button" class="hgx-btn pri" data-m="game">🎯 Name the diffusion<br><small>Eight real spreads, scored</small></button><button type="button" class="hgx-btn" data-m="sim">🧪 Simulator<br><small>Pick a city and a type; watch it spread</small></button></div></div>';
   el.querySelector('[data-m="game"]').onclick=game;el.querySelector('[data-m="sim"]').onclick=sim};
  let timer=null;const stop=()=>{if(timer){clearInterval(timer);timer=null}};
  const animate=(A,steps,reloc,onEnd)=>{stop();A.clear();let k=0;const prev=[];
   timer=setInterval(()=>{if(!el.isConnected){stop();return}if(k>=steps.length){stop();onEnd&&onEnd();return}
    steps[k].forEach(p=>{const ll=[p[1],p[2]];if(prev.length&&(reloc||k>0)){let best=prev[0],bd=1e9;prev.forEach(q=>{const d=G.km(q,ll);if(d<bd){bd=d;best=q}});if(reloc||bd>900)A.line(reloc?prev[0]:best,ll,{arrow:true,cls:"dif"})}
     A.marker(ll,{cls:"dif s"+Math.min(k,4),r:k?6:8,text:steps.length<4||k===0?p[0]:""})});
    steps[k].forEach(p=>prev.push([p[1],p[2]]));k++},1000)};
  const game=()=>{stop();el.innerHTML="";const R=G.shuffle(CASES).slice(0,8);let i=0,score=0;const res=[];const H=G.hud(el,{res});const q=h("div","hgx-q");el.appendChild(q);
   const A=G.atlas(el,{names:false});const ch=h("div","hgx-choice");el.appendChild(ch);const fb=h("div","hgx-fbw");el.appendChild(fb);
   const ask=()=>{const r=R[i];H.set(i+1,R.length,score);fb.innerHTML="";ch.innerHTML="";q.innerHTML='<b>'+esc(r.n)+'</b><small>Watch the spread, step by step. Which kind of diffusion is it?</small>';A.home=()=>A.focusBox(r.box);A.home();
    const replay=btn("↻ Replay","",()=>animate(A,r.steps,r.reloc));
    TYPES.forEach(([k,t])=>ch.appendChild(btn(t,"",()=>{stop();ch.querySelectorAll("button").forEach(x=>x.disabled=true);replay.disabled=false;const ok=k===r.t;score+=ok?100:0;res.push(ok?1:0);H.set(i+1,R.length,score);A.clear();r.steps.forEach((s,j)=>s.forEach(p=>A.marker([p[1],p[2]],{cls:"dif s"+Math.min(j,4),r:j?6:8})));
     fb.innerHTML='<div class="hgx-fb '+(ok?"ok":"no")+'"><b>'+(ok?"Right! +100":"It was "+r.t+".")+'</b> '+r.why+'</div>';fb.appendChild(btn(i+1<R.length?"Next spread →":"See your score","pri",()=>{i++;if(i<R.length)ask();else end()}))})));
    ch.appendChild(replay);setTimeout(()=>animate(A,r.steps,r.reloc),500)};
   const end=()=>{stop();G.finish(el,{key:"g:"+L.id,pts:score,max:R.length*100,again:game,done,lines:['<p><b>Contagious</b>: a ripple through neighbours. <b>Hierarchical</b>: big places first, then smaller. <b>Relocation</b>: people carry it far away. <b>Stimulus</b>: the idea spreads, the form changes. Contagious, hierarchical and stimulus are all kinds of <b>expansion</b> diffusion.</p>']})};
   ask()};
  const sim=()=>{stop();el.innerHTML="";const q=h("div","hgx-q","<b>Click a city to make it the hearth.</b><small>Then pick a type and press Play. Big dots are big cities.</small>");el.appendChild(q);const ch=h("div","hgx-choice");el.appendChild(ch);
   const A=G.atlas(el,{names:true});let mode="contagious",hearth=CITIES[0];const out=h("p","hgx-small");el.appendChild(out);
   const dots=()=>{A.clear();CITIES.forEach(c=>{const m=A.marker([c[1],c[2]],{r:2.5+Math.sqrt(c[3])*.9,cls:"city"+(c===hearth?" hearth":"")});m.dataset.city=c[0];m.style.cursor="pointer"})};dots();
   A.onClick=(cc,ll)=>{if(!ll)return;let best=null,bd=1e9;CITIES.forEach(c=>{const d=G.km(ll,[c[1],c[2]]);if(d<bd){bd=d;best=c}});if(bd<900){stop();hearth=best;dots();out.textContent="Hearth: "+best[0]+"."}};
   const run=()=>{stop();dots();const on=new Set([hearth]);let k=0;const H0=[hearth[1],hearth[2]];
    const lights=(c,from)=>{if(from)A.line([from[1],from[2]],[c[1],c[2]],{cls:"dif",arrow:mode!=="contagious"});A.marker([c[1],c[2]],{r:2.5+Math.sqrt(c[3])*.9,cls:"dif s"+Math.min(k,4)})};
    const byPop=CITIES.slice().sort((a,b)=>b[3]-a[3]);
    timer=setInterval(()=>{if(!el.isConnected){stop();return}k++;const add=[];
     if(mode==="contagious")CITIES.forEach(c=>{if(!on.has(c)&&G.km(H0,[c[1],c[2]])<k*1800)add.push([c,null])});
     if(mode==="hierarchical"){const n=[4,10,22,40,99][Math.min(k-1,4)];byPop.slice(0,n).forEach(c=>{if(!on.has(c)){let best=hearth,bd=1e9;on.forEach(o=>{const d=G.km([o[1],o[2]],[c[1],c[2]]);if(o[3]>=c[3]&&d<bd){bd=d;best=o}});add.push([c,best])}})}
     if(mode==="relocation"){if(k===1){G.shuffle(CITIES.filter(c=>G.km(H0,[c[1],c[2]])>4000)).slice(0,4).forEach(c=>add.push([c,hearth]))}else{[...on].filter(o=>o!==hearth).forEach(o=>CITIES.forEach(c=>{if(!on.has(c)&&G.km([o[1],o[2]],[c[1],c[2]])<(k-1)*900)add.push([c,null])}))}}
     add.forEach(([c,f])=>{if(on.has(c))return;on.add(c);lights(c,f)});out.innerHTML="Step "+k+": "+on.size+" of "+CITIES.length+" cities reached. "+{contagious:"It spreads to the nearest places first, like a ripple.",hierarchical:"It jumps between the biggest cities first, then down to smaller ones.",relocation:"Migrants carry it far away first; then it spreads around each new home."}[mode];
     if(k>=6||on.size>=CITIES.length){stop();done(.5)}},900)};
   const draw=()=>{ch.innerHTML="";[["contagious","Contagious"],["hierarchical","Hierarchical"],["relocation","Relocation"]].forEach(([k,t])=>{const b=btn(t,k===mode?"on":"",()=>{mode=k;draw()});ch.appendChild(b)});ch.appendChild(btn("▶ Play","pri",run));ch.appendChild(btn("🎯 Name-the-diffusion game","",game))};draw()};
  start()}}]);

/* ---- Where do they pray? ---- */
const RELQ=[["hin","Click a country where most people are <b>Hindu</b>."],["orth","Click a country where most people are <b>Orthodox Christians</b>."],["shi","Click a country where most people are <b>Shia Muslims</b>."],["bud","Click a country where most people are <b>Buddhist</b>."],
 ["prot","Click a country where <b>Protestants</b> are the largest group."],["jew","Click the country where most people are <b>Jewish</b>."],["none","Click a country where the largest group follows <b>no religion</b>."],["sun","Click a country where most people are <b>Sunni Muslims</b>."],["cat","Click a country in <b>Asia</b> where most people are <b>Catholic</b>.",c=>{try{return COUNTRY_BY_CODE[c].r==="Asia"}catch(e){return false}}]];
const relName=k=>(D.cats("rel").find(x=>x[0]===k)||[,k])[1];const relCol=k=>(D.cats("rel").find(x=>x[0]===k)||[,,null])[2];
G.add("u3",[{id:"pray",kind:"pick",ch:"hg3c",wide:true,title:"Where do they pray?",blurb:"Find countries by their largest religion, then see the whole religion map.",skill:"Distribution of religions (3.3–3.6): universalising and ethnic religions.",
 intro:"Universalising religions (Christianity, Islam, Buddhism, Sikhism) seek converts and spread across the world; ethnic religions (Hinduism, Judaism, Shinto) belong to one people and stay clustered near their hearth.",
 game:()=>({n:7,rounds:RELQ.map(([k,q,lim])=>({q,ok:c=>D.rel(c)===k&&(!lim||lim(c)),why:c=>esc(D.name(c))+": largest group <b>"+esc(relName(D.rel(c))||"no data")+"</b>."+(k==="hin"?" Hinduism, an ethnic religion, is concentrated in India and Nepal (and Mauritius, by migration).":k==="jew"?" Judaism is an ethnic religion: only Israel has a Jewish majority.":k==="none"?" Secularisation: in Czechia, Estonia, China and parts of East Asia, most people follow no religion.":k==="shi"?" Shia Islam is a minority overall (about 10–15% of Muslims), concentrated in Iran, Iraq, Azerbaijan and Bahrain.":""),
  show:c=>relCol(D.rel(c))}))})}]);

/* ---- Paint the language families ---- */
function langRound(name,codes,q){const fams=[...new Set(codes.map(D.lang).filter(Boolean))];const cats=D.cats("lang").filter(c=>fams.includes(c[0]));return{q,cats,scope:codes,ans:c=>D.lang(c)||undefined,why:"Language families follow old migrations: Indo-European spread with farmers and herders from the steppe; Bantu (Niger-Congo) languages with farmers moving south and east across Africa."}}
G.add("u3",[{id:"langpaint",kind:"paint",ch:"hg3c",wide:true,title:"Paint the language families",blurb:"Colour each country by the family of its main language, then check against the Languages map.",skill:"Language families and their diffusion (3.3, 3.5).",
 intro:"A language family is a group of languages with a shared ancestor. Most Europeans speak Indo-European languages; Hungarian, Finnish and Estonian are Uralic islands among them.",
 game:()=>({fixed:true,n:3,intro:"<p>Three maps: Europe, then Asia, then Africa. Pick a family from the palette, then click the countries that speak it. <b>Fill the rest</b> paints every unpainted country with the chosen family.</p>",
  rounds:[Object.assign(langRound("Europe",region("Europe").filter(c=>D.area(c)>15000&&c!=="ru"),"Paint <b>Europe</b> by language family."),{focus:[[-12,35],[42,70]]}),Object.assign(langRound("Asia",region("Asia").filter(c=>{const f=G.feat(c);return f&&D.area(c)>8000&&d3.geoCentroid(f)[0]>60}),"Paint <b>South, East and Southeast Asia</b> by language family."),{focus:[[62,-11],[150,52]]}),Object.assign(langRound("Africa",region("Africa").filter(c=>D.area(c)>15000),"Paint <b>Africa</b> by language family. Tip: paint the commonest family everywhere with <b>Fill the rest</b>, then fix the exceptions."),{})]})}]);

/* ---- Sacred-site hunt ---- */
const SACRED=[["Mecca: the Kaaba",39.826,21.4225,"Islam (universalising). Every Muslim who can is asked to make the hajj once; about 1.7 million came in 2025, and Muslims everywhere pray facing this spot."],
 ["Jerusalem: the Old City",35.234,31.778,"Sacred to three faiths: the Western Wall (Judaism), the Church of the Holy Sepulchre (Christianity) and the al-Aqsa Mosque (Islam), all within one square kilometre."],
 ["Varanasi on the Ganges",83.01,25.32,"Hinduism (ethnic). Pilgrims bathe in the river from the ghats; to die here is believed to free the soul from rebirth."],
 ["Bodh Gaya",84.99,24.69,"Buddhism (universalising): where the Buddha reached enlightenment under the Bodhi tree. A hearth in India, though few Indians are Buddhist today."],
 ["Lumbini: the Buddha’s birthplace",83.28,27.47,"Buddhism: just inside Nepal. The faith later diffused east and south along trade routes, to Sri Lanka, China, Korea and Japan."],
 ["St Peter’s Basilica, Vatican City",12.453,41.902,"Catholic Christianity: the world’s smallest state is the centre of a church of 1.4 billion people."],
 ["The Golden Temple, Amritsar",74.876,31.62,"Sikhism (universalising, though small): its holiest gurdwara, open to all; its free kitchen feeds about 100,000 people a day."],
 ["Ise Grand Shrine",136.725,34.455,"Shinto (ethnic): the shrine to the sun goddess is rebuilt every 20 years, most recently in 2013."],
 ["Karbala: the shrine of Husayn",44.03,32.62,"Shia Islam: the Arbaeen pilgrimage brings over 20 million people a year, one of the largest gatherings on Earth."],
 ["Prayagraj: the Kumbh Mela",81.88,25.43,"Hinduism: where the Ganges and Yamuna meet. The 2025 Maha Kumbh Mela counted over 600 million visits in six weeks."],
 ["Uluru",131.04,-25.34,"Sacred to the Aṉangu people (an ethnic, Indigenous belief). Climbing it has been banned since 2019."],
 ["Lalibela",39.04,12.03,"Ethiopian Orthodox Christianity: eleven churches cut down into the rock in the 1200s, as a ‘New Jerusalem’."],
 ["Santiago de Compostela",-8.545,42.88,"Christianity: the end of the Camino, walked by about 500,000 pilgrims a year."],
 ["Mount Kailash",81.31,31.07,"Sacred to Hindus, Buddhists, Jains and Bon: pilgrims walk round it, and no one is allowed to climb it."]];
G.add("u3",[{id:"sacred",kind:"hunt",ch:"hg3b",wide:true,title:"Sacred-site hunt",blurb:"Find the holy places of the world’s religions on the map.",skill:"Religion in the cultural landscape (3.3): sacred space.",
 intro:"Sacred spaces are places a faith holds holy. Universalising religions usually hold the places of their founder’s life sacred; ethnic religions often hold natural features of their homeland sacred.",
 game:{n:8,rounds:SACRED.map(s=>({q:"Find "+esc(s[0]),ll:[s[1],s[2]],name:s[0],tol:120,why:s[3]}))}}]);

/* ===================== UNIT 4 ===================== */
/* ---- Boundary spotter: real borders ---- */
let MESH={};
function border(a,b){const k=[a,b].sort().join("-");if(MESH[k]!==undefined)return MESH[k];try{const T=PROJ_WORLD;MESH[k]=topojson.mesh(T,T.objects.countries,(x,y)=>x!==y&&((x.properties.c===a&&y.properties.c===b)||(x.properties.c===b&&y.properties.c===a)))}catch(e){MESH[k]=null}if(MESH[k]&&!MESH[k].coordinates.length)MESH[k]=null;return MESH[k]}
const BTYPE={geo:"Geometric: a straight line of latitude or longitude, drawn on a map",phys:"Physical: follows a river, lake or mountain crest",ante:"Antecedent: drawn before most people settled there",sub:"Subsequent: drawn after settlement, to separate peoples",sup:"Superimposed: forced on the land by outside powers, ignoring the people there",cons:"Consequent: drawn after a war"};
const BR=[
 {q:"Click the <b>geometric</b> boundary.",box:[[-5,-12],[45,35]],ans:"eg-sd",c:[["eg","sd","geo","Egypt–Sudan: the 22nd parallel, ruler-straight for about 1,200 km."],["cd","cg","phys","DR Congo–Congo: the Congo and Ubangi rivers."],["et","er","cons","Ethiopia–Eritrea: fought over in a war, 1998–2000."],["tz","mz","phys","Tanzania–Mozambique: the Ruvuma River."]]},
 {q:"Click the boundary that follows a <b>mountain crest</b>.",box:[[-85,-56],[-35,5]],ans:"ar-cl",c:[["cl","ar","phys","Chile–Argentina: the crest of the Andes, the line where water divides."],["br","uy","phys","Brazil–Uruguay: partly rivers and lakes, partly lines on open plains."],["co","ve","sup","Colombia–Venezuela: a colonial line through the llanos."],["pe","ec","cons","Peru–Ecuador: settled only in 1998, after wars."]]},
 {q:"Click the <b>subsequent</b> boundary drawn in 1947 to split two religious groups.",box:[[60,5],[100,40]],ans:"in-pk",alt:["bd-in"],c:[["in","pk","sub","India–Pakistan: the Radcliffe Line of 1947, drawn to separate Hindus and Muslims. Over 14 million people moved."],["in","np","phys","India–Nepal: rivers and the foot of the Himalaya."],["in","cn","ante","India–China: high, empty mountains, still disputed."],["bd","mm","phys","Bangladesh–Myanmar: the Naf River and hills."]]},
 {q:"Click the <b>superimposed</b> boundary that split the Somali people.",box:[[25,-12],[55,18]],ans:"ke-so",alt:["et-so"],c:[["ke","so","sup","Kenya–Somalia: a colonial line that left many Somalis in Kenya’s north-east."],["eg","ly","geo","Egypt–Libya: close to the 25th meridian."],["tz","mz","phys","Tanzania–Mozambique: the Ruvuma River."],["ug","rw","sup","Uganda–Rwanda: also colonial, but it does not split the Somalis."]]},
 {q:"Click the <b>antecedent</b> boundary: drawn when few settlers lived along it.",box:[[-140,10],[-50,62]],ans:"ca-us",c:[["us","ca","ante","US–Canada: the 49th parallel was agreed in 1818 and 1846, before most settlers arrived in the West."],["us","mx","cons","US–Mexico: drawn after the war of 1846–48 (consequent); the Rio Grande forms part of it."],["gt","mx","sup","Guatemala–Mexico: straight lines through the forest."],["ni","hn","phys","Nicaragua–Honduras: rivers and the Gulf of Fonseca."]]},
 {q:"Click the boundary that follows <b>rivers</b> and was moved west after the Second World War.",box:[[-5,40],[35,60]],ans:"de-pl",c:[["de","pl","cons","Germany–Poland: the Oder–Neisse line, set in 1945. Millions of Germans were expelled from the land east of it."],["fr","es","phys","France–Spain: the Pyrenees."],["it","ch","phys","Italy–Switzerland: the crest of the Alps."],["no","se","phys","Norway–Sweden: mostly the mountain watershed."]]},
 {q:"Click the <b>ceasefire line</b> of 1953 that still divides a nation.",box:[[115,30],[135,46]],ans:"kp-kr",c:[["kp","kr","cons","North–South Korea: the Demilitarised Zone, the ceasefire line of the Korean War. One nation, two states."],["kp","cn","phys","North Korea–China: the Yalu and Tumen rivers."],["cn","mn","ante","China–Mongolia: lines across the empty Gobi."],["ru","cn","phys","Russia–China: the Amur and Ussuri rivers."]]}];
G.add("u4",[{id:"bspot",kind:"game",ch:"hg4a",wide:true,title:"Boundary spotter",blurb:"Four real borders light up. Click the one that matches the type.",skill:"Types of political boundaries (4.5, 4.6).",
 intro:"Boundaries are classed by how they were drawn (geometric, physical) and when (antecedent before settlement, subsequent after it, superimposed by outsiders, consequent after a war). One border can be more than one type.",
 play(el,done,L){
  const play=()=>{el.innerHTML="";const R=G.shuffle(BR).slice(0,6);let i=0,score=0;const res=[];const H=G.hud(el,{res});const q=h("div","hgx-q");el.appendChild(q);
   const A=G.atlas(el,{names:true});const fb=h("div","hgx-fbw");el.appendChild(fb);
   const ask=()=>{const r=R[i];H.set(i+1,R.length,score);A.clear();A.cls(()=>"");fb.innerHTML="";q.innerHTML='<b>'+r.q+'</b><small>The four thick lines are real borders. Click on (or next to) the one you choose.</small>';A.home=()=>A.focusBox(r.box);A.home();
    const lines=r.c.map(([a,b,t,why],j)=>{const g=border(a,b);if(!g)return null;const p=A.geo(g,{cls:"bline"});return{a,b,t,why,g,p,k:[a,b].sort().join("-")}}).filter(Boolean);
    A.onClick=(c,ll)=>{if(!ll)return;let best=null,bd=1e9;lines.forEach(Ln=>Ln.g.coordinates.forEach(seg=>seg.forEach(pt=>{const d=G.km(ll,pt);if(d<bd){bd=d;best=Ln}})));if(!best||bd>700)return;A.onClick=null;
     const ok=best.k===r.ans||(r.alt||[]).includes(best.k);score+=ok?100:0;res.push(ok?1:0);H.set(i+1,R.length,score);
     lines.forEach(Ln=>{Ln.p.classList.add(Ln===best?(ok?"pick-ok":"pick-no"):(Ln.k===r.ans?"right":"other"));A.setCls(Ln.a,"");});
     fb.innerHTML='<div class="hgx-fb '+(ok?"ok":"no")+'"><b>'+(ok?"Right! +100":"Not that one: the right one is now green.")+'</b><ul class="hgx-blist">'+lines.map(Ln=>'<li class="'+(Ln.k===r.ans?"r":"")+'"><b>'+esc(BTYPE[Ln.t].split(":")[0])+'</b> · '+esc(Ln.why)+'</li>').join("")+'</ul></div>';
     fb.appendChild(btn(i+1<R.length?"Next →":"See your score","pri",()=>{i++;if(i<R.length)ask();else end()}))}};
   const end=()=>G.finish(el,{key:"g:"+L.id,pts:score,max:R.length*100,again:play,done,lines:['<p>'+Object.values(BTYPE).map(esc).join("<br>")+'</p>']});ask()};play()}}]);

/* ---- Shapes of states ---- */
const SHAPES=[["pl","compact","Poland: roughly round, so the capital can reach every edge easily."],["zw","compact","Zimbabwe: compact, no part far from the centre."],["ug","compact","Uganda: compact."],["fr","compact","France: ‘the Hexagon’, a classic compact state."],["ro","compact","Romania: compact."],
 ["cl","elongated","Chile: about 4,300 km long and rarely 200 km wide."],["vn","elongated","Vietnam: long and thin, hard to defend and to connect."],["no","elongated","Norway: elongated, along the coast."],["mw","elongated","Malawi: long and narrow, beside Lake Malawi."],["it","elongated","Italy: the boot is elongated (and perforated by San Marino and Vatican City)."],["gm","elongated","The Gambia: a thin strip along a river."],
 ["th","prorupted","Thailand: a long proruption reaches south down the Malay peninsula."],["na","prorupted","Namibia: the Caprivi Strip, drawn to give Germany a route to the Zambezi."],["cd","prorupted","DR Congo: a proruption reaches the Atlantic along the Congo River."],["af","prorupted","Afghanistan: the Wakhan Corridor, a buffer between British and Russian empires."],["mm","prorupted","Myanmar: a proruption runs south down the coast."],
 ["za","perforated","South Africa: perforated by Lesotho, which it surrounds completely."],
 ["id","fragmented","Indonesia: over 17,000 islands."],["ph","fragmented","The Philippines: over 7,000 islands."],["my","fragmented","Malaysia: split between the peninsula and Borneo."],["dk","fragmented","Denmark: a peninsula and hundreds of islands."],["nz","fragmented","New Zealand: two main islands and many small ones."]];
const SH_T=[["compact","Compact"],["elongated","Elongated"],["prorupted","Prorupted"],["perforated","Perforated"],["fragmented","Fragmented"]];
function outline(c,sz){const f=G.feat(c);if(!f)return"";const ctr=d3.geoCentroid(f);const P=d3.geoAzimuthalEqualArea().rotate([-ctr[0],-ctr[1]]).fitExtent([[6,6],[sz-6,sz-6]],f);return'<svg viewBox="0 0 '+sz+' '+sz+'" class="hgx-sil"><path d="'+d3.geoPath(P)(f)+'"/></svg>'}
G.add("u4",[{id:"shapes",kind:"game",ch:"hg4d",wide:true,title:"Shapes of states",blurb:"Real country outlines: is each one compact, elongated, prorupted, perforated or fragmented?",skill:"Territorial morphology (4.7).",
 intro:"A state’s shape affects how easy it is to govern, defend and connect. The outlines are the real countries, drawn without names.",
 play(el,done,L){
  const play=()=>{el.innerHTML="";const per=SHAPES.filter(s=>s[1]==="perforated");const R=G.shuffle(G.shuffle(SHAPES.filter(s=>s[1]!=="perforated")).slice(0,9).concat(per));let i=0,score=0,streak=0;const res=[];const H=G.hud(el,{res});
   const wrap=h("div","hgx-shw");el.appendChild(wrap);const fb=h("div","hgx-fbw");el.appendChild(fb);
   const ask=()=>{const[c,t,why]=R[i];H.set(i+1,R.length,score,streak>1?'<span class="hgx-streak">🔥 '+streak+'</span> ':'');fb.innerHTML="";
    wrap.innerHTML='<div class="hgx-shcard">'+outline(c,260)+'<span class="hgx-dim">Which shape is this country?</span></div><div class="hgx-shbins">'+SH_T.map(([k,l])=>'<button type="button" class="hgx-btn" data-k="'+k+'">'+l+'</button>').join("")+'</div>';
    wrap.querySelectorAll("[data-k]").forEach(b=>b.onclick=()=>{wrap.querySelectorAll("[data-k]").forEach(x=>{x.disabled=true;if(x.dataset.k===t)x.classList.add("on")});const ok=b.dataset.k===t;streak=ok?streak+1:0;score+=ok?100:0;res.push(ok?1:0);H.set(i+1,R.length,score);
     fb.innerHTML='<div class="hgx-fb '+(ok?"ok":"no")+'"><b>'+(ok?"Yes! +100":"It is "+t+".")+'</b> '+esc(why)+'</div>';fb.appendChild(btn(i+1<R.length?"Next →":"See your score","pri",()=>{i++;if(i<R.length)ask();else end()}))})};
   const end=()=>G.finish(el,{key:"g:"+L.id,pts:score,max:R.length*100,again:play,done,lines:['<p>Compact states are easiest to govern; elongated ones struggle to connect their ends; proruptions often come from a colonial bargain for access; perforated states surround another; fragmented states must link islands or exclaves.</p>']});ask()};play()}}]);

/* ---- Choke-point hunt ---- */
const CHOKE=[["the Strait of Hormuz",56.4,26.6,"About a fifth of the world’s oil passes through, between Iran and Oman. In June 2025, during the Israel–Iran war, Iran’s parliament voted to close it; shipping slowed but it stayed open."],
 ["the Strait of Malacca",100.9,2.9,"The shortest sea route between the Indian Ocean and the Pacific: about a third of all world trade, much of China’s oil."],
 ["the Suez Canal",32.35,30.6,"Normally about 12% of world trade. After Houthi attacks on ships from late 2023, traffic fell by about half as lines went round Africa."],
 ["the Panama Canal",-79.7,9.1,"A drought in 2023–24 lowered Gatun Lake, so the canal cut its daily ship crossings by over a third."],
 ["Bab-el-Mandeb",43.4,12.6,"The ‘Gate of Tears’ between Yemen and Djibouti: the southern door to the Red Sea and Suez."],
 ["the Bosporus",29.05,41.1,"Istanbul’s strait, under 1 km wide at its narrowest: Russia’s and Ukraine’s grain and oil from the Black Sea pass through."],
 ["the Strait of Gibraltar",-5.6,35.95,"About 14 km wide: the only way between the Atlantic and the Mediterranean."],
 ["the Strait of Dover",1.45,51,"The world’s busiest shipping lane, about 33 km wide between England and France."],
 ["the Taiwan Strait",119.5,24.3,"About half the world’s container ships pass through it each year; tension over Taiwan makes it a strategic risk."],
 ["the Danish straits (Øresund)",12.7,55.9,"The Baltic’s only way out to the ocean: Russian oil from St Petersburg passes Denmark."],
 ["the Bering Strait",-169,65.8,"Only 82 km between Russia and Alaska. As Arctic sea ice shrinks, a northern shipping route is opening."],
 ["the Cape of Good Hope",18.47,-34.36,"Not a strait, but the detour: ships avoiding the Red Sea since 2023 sail round it, adding about 10 days."]];
G.add("u4",[{id:"choke",kind:"hunt",ch:"hg4c",wide:true,title:"Choke-point hunt",blurb:"Find the narrow sea passages that world trade depends on.",skill:"Geopolitics and choke points (4.2, 4.4).",
 intro:"A choke point is a narrow passage on a busy route. Whoever controls it, or can block it, holds power far beyond its size.",
 game:{n:8,rounds:CHOKE.map(s=>({q:"Find "+esc(s[0]),ll:[s[1],s[2]],name:s[0].replace(/^the /,"The "),tol:s[0].includes("Bosporus")||s[0].includes("Gibraltar")?70:160,why:s[3]}))}}]);

/* ---- Who's in the club? ---- */
const LL_AF=["ml","ne","td","bf","cf","ss","et","ug","rw","bi","zm","mw","zw","bw","ls","sz"];
const LL_AS=["af","mn","la","np","bt","kz","kg","tj","tm","uz","am","az"];
G.add("u4",[{id:"clubs",kind:"paint",ch:"hg4c",wide:true,title:"Who’s in the club?",blurb:"Paint the members of the EU and NATO, and the landlocked states, then check.",skill:"Supranationalism (4.8) and landlocked states (4.7).",
 intro:"Supranational organisations are clubs of states that share some sovereignty. Their members form a region you can map. Landlocked states, with no coast, depend on their neighbours for trade.",
 game:()=>({n:4,rounds:[
  {q:"Paint the <b>27 members of the European Union</b>.",cats:[["y","EU member","#3f6fc4"]],scope:region("Europe"),ans:c=>{const k=D.clubs(c);return k==="eu"||k==="both"?"y":null},focus:[[-25,34],[45,71]],why:"Not in the EU: Norway, Switzerland and Iceland (in EFTA), the UK (left in 2020), and the Balkan candidates. Ukraine and Moldova became candidates in 2022."},
  {q:"Paint the European members of <b>NATO</b>.",cats:[["y","NATO member","#2f8a4e"]],scope:region("Europe"),ans:c=>{const k=D.clubs(c);return k==="nato"||k==="both"?"y":null},focus:[[-25,34],[45,71]],why:"NATO has 32 members, with the US and Canada. Finland (2023) and Sweden (2024) joined after Russia’s invasion of Ukraine. Austria, Ireland, Malta and Cyprus are EU members outside it."},
  {q:"Paint Africa’s <b>landlocked</b> countries.",cats:[["y","Landlocked","#a7802a"]],scope:region("Africa"),ans:c=>LL_AF.includes(c)?"y":null,why:"Sixteen African states have no coast, more than any other continent: a legacy of colonial borders. Their goods must cross a neighbour to reach a port."},
  {q:"Paint Asia’s <b>landlocked</b> countries.",cats:[["y","Landlocked","#a7802a"]],scope:region("Asia"),ans:c=>LL_AS.includes(c)?"y":null,why:"Kazakhstan is the world’s largest landlocked country; Uzbekistan is one of only two doubly landlocked ones (with Liechtenstein). The Caspian is a lake, so its shores do not count as coast."}]})}]);

/* ---- Gerrymander a state ---- */
const GV=[[46,48,52,55,47,45,42,43],[51,72,82,78,57,47,44,42],[54,80,90,86,60,48,43,44],[50,74,84,79,58,46,44,41],[48,56,62,58,51,45,43,40],[46,47,50,51,47,44,42,39]];
const GR=6,GC=8,GN=6,GS=8,DCOL=["#f2c14e","#8fcf9e","#b7a6dc","#ef8f8f","#7fb8e8","#e8b58a"];
const GTASK=[{t:"Rig it for Orange",goal:"Blue has 54% of the votes. Redraw the districts so <b>Orange wins at least 4 of the 6 seats</b>.",how:"Pack Blue voters into one or two city districts they win by a mile; crack the rest so Blue narrowly loses everywhere else.",ok:S=>S.o>=4},
 {t:"Rig it for Blue",goal:"Now the other way: make <b>Blue win 5 of the 6 seats</b>.",how:"Crack the city: give each district a slice of it, so Blue’s big city majorities spread out into narrow wins.",ok:S=>S.b>=5},
 {t:"Draw a fair map",goal:"This map of six long stripes is legal but not compact. Redraw it as a <b>fair</b> map: Blue (54% of votes) wins <b>3 or 4 seats</b>, every district is compact (a shape score of 75% or more), and the efficiency gap is under 10%.",how:"Keep districts square-ish and keep communities (the city, the farms) together.",ok:S=>(S.b===3||S.b===4)&&S.minC>=.75&&Math.abs(S.eg)<.1}];
function gTile(t){const a=[];for(let r=0;r<GR;r++)for(let c=0;c<GC;c++)a.push(t===2?r:r<4?Math.floor(c/2):4+Math.floor(c/4));return a}
function gStats(a){const D=[];for(let d=0;d<GN;d++)D.push({n:0,b:0,o:0,per:0,cells:[]});a.forEach((d,i)=>{if(d<0)return;const r=Math.floor(i/GC),c=i%GC,x=D[d];x.n++;x.b+=GV[r][c];x.o+=100-GV[r][c];x.cells.push(i);
  [[r-1,c],[r+1,c],[r,c-1],[r,c+1]].forEach(([y,z])=>{if(y<0||y>=GR||z<0||z>=GC||a[y*GC+z]!==d)x.per++})});
 const conn=d=>{const cs=D[d].cells;if(!cs.length)return false;const set=new Set(cs),seen=new Set([cs[0]]),st=[cs[0]];while(st.length){const i=st.pop(),r=Math.floor(i/GC),c=i%GC;[[r-1,c],[r+1,c],[r,c-1],[r,c+1]].forEach(([y,z])=>{const j=y*GC+z;if(y>=0&&y<GR&&z>=0&&z<GC&&set.has(j)&&!seen.has(j)){seen.add(j);st.push(j)}})}return seen.size===cs.length};
 let b=0,o=0,wb=0,wo=0,minC=1,valid=true;D.forEach((x,d)=>{x.ok=x.n===GS&&conn(d);if(!x.ok)valid=false;x.win=x.b>x.o?"b":"o";if(x.win==="b"){b++;wb+=x.b-(x.n*50+1);wo+=x.o}else{o++;wo+=x.o-(x.n*50+1);wb+=x.b}x.comp=x.n?12/x.per:0;minC=Math.min(minC,x.comp)});
 return{D,b,o,eg:(wb-wo)/(GR*GC*100),minC,valid}}
G.add("u4",[{id:"gerry2",kind:"game",ch:"hg4d",wide:true,title:"Gerrymander a state",blurb:"A city, its suburbs and farmland: paint six districts to rig the map both ways, then draw a fair one.",skill:"Redistricting and gerrymandering (4.6): packing, cracking, the efficiency gap.",
 intro:"After each census, district lines are redrawn so every district has the same population. Whoever draws them can choose the winner: pack the other side’s voters into a few districts, crack the rest across many. In 2025 Texas, then California, redrew their maps in the middle of the decade to win more seats.",
 play(el,done,L){
  let task=0,a=gTile(0),cur=0,score=0,down=false;const won=[false,false,false];const upH=()=>{down=false};addEventListener("pointerup",upH);
  const draw=()=>{const S=gStats(a),T=GTASK[task];const cw=60;
   let svg='<svg viewBox="0 0 '+(GC*cw)+' '+(GR*cw)+'" class="hgx-gm"><defs><pattern id="hgxst" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M0 6h12M6 0v12" stroke="#9aa3ad" stroke-width="1.2"/></pattern><pattern id="hgxfm" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><path d="M0 5h10" stroke="#9cbf6e" stroke-width="2"/></pattern></defs>';
   for(let r=0;r<GR;r++)for(let c=0;c<GC;c++){const v=GV[r][c],city=v>=70,sub=v>=55&&!city;svg+='<rect x="'+c*cw+'" y="'+r*cw+'" width="'+cw+'" height="'+cw+'" class="'+(city?"gcity":sub?"gsub":"gfarm")+'"/>'+(city?'<rect x="'+c*cw+'" y="'+r*cw+'" width="'+cw+'" height="'+cw+'" fill="url(#hgxst)" opacity=".5"/>':!sub?'<rect x="'+c*cw+'" y="'+r*cw+'" width="'+cw+'" height="'+cw+'" fill="url(#hgxfm)" opacity=".45"/>':'')}
   svg+='<path d="M'+(4.5*cw)+' 0 C'+(4.2*cw)+' '+(1.5*cw)+' '+(5.3*cw)+' '+(2.5*cw)+' '+(4.6*cw)+' '+(4*cw)+' S'+(4.4*cw)+' '+(5.6*cw)+' '+(5*cw)+' '+(6*cw)+'" class="griver"/>';
   for(let i=0;i<GR*GC;i++){const r=Math.floor(i/GC),c=i%GC,d=a[i],v=GV[r][c];
    if(d>=0)svg+='<rect x="'+c*cw+'" y="'+r*cw+'" width="'+cw+'" height="'+cw+'" fill="'+DCOL[d]+'" opacity=".55"/>';
    svg+='<rect x="'+(c*cw+8)+'" y="'+(r*cw+cw-14)+'" width="'+(cw-16)+'" height="7" rx="3" class="gbar-o"/><rect x="'+(c*cw+8)+'" y="'+(r*cw+cw-14)+'" width="'+((cw-16)*v/100)+'" height="7" rx="3" class="gbar-b"/><text x="'+(c*cw+cw/2)+'" y="'+(r*cw+24)+'" class="gnum">'+v+'</text>'+
     '<rect x="'+c*cw+'" y="'+r*cw+'" width="'+cw+'" height="'+cw+'" class="ghit" data-i="'+i+'"/>'}
   /* district borders */
   for(let i=0;i<GR*GC;i++){const r=Math.floor(i/GC),c=i%GC,d=a[i];if(c<GC-1&&a[i+1]!==d)svg+='<line x1="'+(c+1)*cw+'" y1="'+r*cw+'" x2="'+(c+1)*cw+'" y2="'+(r+1)*cw+'" class="gb"/>';if(r<GR-1&&a[i+GC]!==d)svg+='<line x1="'+c*cw+'" y1="'+(r+1)*cw+'" x2="'+(c+1)*cw+'" y2="'+(r+1)*cw+'" class="gb"/>'}
   svg+='<rect x="0" y="0" width="'+GC*cw+'" height="'+GR*cw+'" class="gframe"/></svg>';
   const ok=S.valid&&T.ok(S);
   el.innerHTML='<div class="hgx-gtabs">'+GTASK.map((x,k)=>'<button type="button" class="hgx-btn'+(k===task?" on":"")+'" data-t="'+k+'">'+(won[k]?"✓ ":"")+(k+1)+'. '+x.t+'</button>').join("")+'</div>'+
    '<div class="hgx-q"><b>'+T.goal+'</b><small>'+T.how+' Pick a district below, then click or drag over precincts to move them into it. Each district needs exactly 8 precincts, all joined up.</small></div>'+
    '<div class="hgx-grow"><div class="hgx-gmap">'+svg+'<p class="hgx-dim hgx-small">Each square is a precinct of 100 voters. Number and bar: Blue’s share. Grey streets: the city; green stripes: farms.</p></div><div class="hgx-gside">'+
    '<div class="hgx-gpal">'+S.D.map((x,d)=>'<button type="button" data-d="'+d+'" class="'+(d===cur?"on ":"")+(x.ok?"":"bad")+'" style="--dc:'+DCOL[d]+'"><b>'+(d+1)+'</b><span>'+x.n+'/8</span><i class="'+(x.n?x.win:"")+'">'+(x.n?(x.win==="b"?"Blue ":"Orange ")+Math.round(100*Math.max(x.b,x.o)/(x.n*100))+"%":"")+'</i></button>').join("")+'</div>'+
    '<div class="hgx-gst"><p>Votes: <b class="cb">Blue 54%</b> · <b class="co">Orange 46%</b></p><p>Seats: <b class="cb">Blue '+S.b+'</b> · <b class="co">Orange '+S.o+'</b></p>'+
    '<p title="Wasted votes: every vote for a loser, plus every winning vote beyond the 50% needed">Efficiency gap: <b>'+(Math.abs(S.eg)*100).toFixed(0)+'%</b> '+(Math.abs(S.eg)<.08?"(fair)":S.eg>0?"(against Blue)":"(against Orange)")+'</p><p>Least compact district: <b>'+Math.round(S.minC*100)+'%</b></p>'+
    (S.valid?"":'<p class="warn">Some districts are not 8 joined precincts yet (red outline).</p>')+'</div>'+
    '<div class="hgx-gbtns"><button type="button" class="hgx-btn" data-x="reset">↺ Start this task again</button></div>'+
    (ok?'<div class="hgx-fb ok"><b>Done! +100</b> '+(task===0?"Orange wins "+S.o+" seats with 46% of the votes: that is the power of the pen.":task===1?"Blue turns 54% of the votes into "+S.b+" of 6 seats.":"Seats match votes, districts are compact and few votes are wasted.")+'</div>':'')+'</div></div>';
   if(ok&&!won[task]){won[task]=true;score+=100;try{done(score/300)}catch(e){}}
   el.querySelectorAll("[data-t]").forEach(b=>b.onclick=()=>{task=+b.dataset.t;a=gTile(task);draw()});
   el.querySelectorAll("[data-d]").forEach(b=>b.onclick=()=>{cur=+b.dataset.d;draw()});
   el.querySelector('[data-x="reset"]').onclick=()=>{a=gTile(task);draw()};
   if(ok){const nx=h("div","hgx-end-btns");if(won.every(Boolean)){nx.appendChild(btn("See your score","pri",()=>G.finish(el,{key:"g:"+L.id,pts:score,max:300,again:()=>{task=0;a=gTile(0);won.fill(false);score=0;draw()},done,lines:['<p>Real gerrymanders use the same tricks with real voter data, precinct by precinct. Courts in many US states now measure the efficiency gap and compactness to judge maps; in 2019 the Supreme Court ruled that partisan gerrymandering is a question for states and Congress, not federal courts.</p>']})))}else{const nt=won.findIndex(w=>!w);nx.appendChild(btn("Next task →","pri",()=>{task=nt;a=gTile(nt);draw()}))}el.querySelector(".hgx-gside").appendChild(nx)}
   const svgEl=el.querySelector(".hgx-gm");const paint=e=>{const t=document.elementFromPoint(e.clientX,e.clientY);if(!t||!t.dataset||t.dataset.i==null)return;const i=+t.dataset.i;if(a[i]===cur)return;a[i]=cur;draw2()};
   const draw2=()=>{if(!el.isConnected){removeEventListener("pointerup",upH);return}draw()};
   svgEl.addEventListener("pointerdown",e=>{down=true;e.preventDefault();paint(e)});
   svgEl.addEventListener("pointermove",e=>{if(down)paint(e)});
  };
  draw()}}]);
G.drop("u4","gerry");G.drop("u4","fair");

/* ---- Devolution and separatism hunt ---- */
const DEVO=[["Catalonia",1.5,41.8,"Held an independence referendum in 2017 that Spain called illegal; its leaders were jailed or fled, then amnestied in 2024. Language and a richer economy feed separatism."],
 ["Scotland",-4.2,56.8,"Has its own parliament since 1999 (devolution). It voted to stay in the UK in 2014 (55%), but voted against Brexit in 2016."],
 ["Quebec",-71.5,52,"French-speaking province of Canada; independence referendums failed in 1980 and, by under 1%, in 1995."],
 ["Kurdistan",44,36.5,"About 30–40 million Kurds live split between Turkey, Iraq, Iran and Syria: the largest stateless nation. Iraqi Kurdistan has its own autonomous government."],
 ["the Basque Country",-2.6,43,"A people with a language unrelated to any other in Europe; ETA’s armed campaign ended in 2011, and the region has wide self-rule."],
 ["Flanders",4,51,"Dutch-speaking northern Belgium: Belgium devolved power to its language regions until it became a federal state (1993)."],
 ["Tibet",88,31.5,"An autonomous region of China in name; its people’s religion and language face heavy controls. Its leader in exile, the Dalai Lama, lives in India."],
 ["Bougainville",155.3,-6.2,"Voted 98% for independence from Papua New Guinea in 2019; talks on when it will happen continue."],
 ["Mindanao’s Bangsamoro",124.3,7.2,"A Muslim autonomous region of the mainly Catholic Philippines, set up in 2019 after decades of conflict."],
 ["Kashmir",75,34.2,"Claimed by India and Pakistan (and partly China) since 1947. India removed its special autonomy in 2019; a deadly attack in 2025 led to clashes between the two nuclear powers."],
 ["New Caledonia",165.5,-21.3,"A French territory in the Pacific that voted three times to stay French (2018–21); riots in 2024 followed a change to who may vote."],
 ["Greenland",-41,72,"Has home rule within Denmark and the right to independence; US interest in buying it in 2019 and 2025 made it a geopolitical prize."]];
G.add("u4",[{id:"devolve",kind:"hunt",ch:"hg4b",wide:true,title:"Devolution and separatism hunt",blurb:"Find the regions pushing for self-rule or independence, and learn what drives them.",skill:"Centrifugal forces and devolution (4.8, 4.9).",
 intro:"Centrifugal forces pull states apart: a different language, religion or economy in one region, distance from the capital, a history of separate rule. Devolution hands power down to regions to hold the state together; separatism wants out.",
 game:{n:8,rounds:DEVO.map(s=>({q:"Find "+esc(s[0]),ll:[s[1],s[2]],name:s[0].replace(/^the /,"The "),tol:300,why:s[3]}))}}]);

/* ---- the existing labs join their chapters ---- */
const CH={u3:{folkpop:"hg3b",hagia:"hg3b",spread:"hg3a",difftype:"hg3a",religion:"hg3c",blend:"hg3c"},u4:{nations:"hg4a",borders:"hg4a",make:"hg4d",gerry:"hg4d",fair:"hg4d",forces:"hg4b"}};
for(const u in CH)for(const id in CH[u])G.set(u,id,{ch:CH[u][id]});

const css=document.createElement("style");css.textContent=`
.hgx-mk.dif .hgx-dot{ fill:#d9682b; } .hgx-mk.dif.s0 .hgx-dot{ fill:#b0201a; } .hgx-mk.dif.s1 .hgx-dot{ fill:#d9682b; } .hgx-mk.dif.s2 .hgx-dot{ fill:#e8a23a; } .hgx-mk.dif.s3 .hgx-dot{ fill:#efc84a; } .hgx-mk.dif.s4 .hgx-dot{ fill:#f3e27a; }
.hgx-mk.dif{ animation:hgxpop .5s ease-out; } @keyframes hgxpop{ from{ opacity:0; } to{ opacity:1; } }
.hgx-line.dif{ stroke:#d9682b; stroke-width:1.6; stroke-opacity:.8; }
.hgx-mk.city .hgx-dot{ fill:#8a96a8; stroke-width:1; } .hgx-mk.city.hearth .hgx-dot{ fill:#b0201a; stroke-width:3; }
.hgx-choice .hgx-btn small{ font-weight:500; opacity:.85; }
.hgx-geo.bline{ stroke:#f2b630; stroke-width:6; stroke-linecap:round; opacity:.9; } .hgx-geo.bline.pick-ok,.hgx-geo.bline.right{ stroke:#3aa66a; } .hgx-geo.bline.pick-no{ stroke:#d9573a; } .hgx-geo.bline.other{ opacity:.45; }
.hgx-blist{ margin:6px 0 0; padding-left:18px; font-size:13px; } .hgx-blist li.r{ font-weight:700; }
.hgx-shw{ display:flex; gap:16px; align-items:center; flex-wrap:wrap; justify-content:center; }
.hgx-shcard{ display:flex; flex-direction:column; align-items:center; gap:4px; background:rgba(127,127,127,.08); border-radius:16px; padding:10px; }
.hgx-sil{ width:240px; height:240px; } .hgx-sil path{ fill:var(--uc,#2e8b84); stroke:#1d2433; stroke-width:1; fill-rule:evenodd; }
.hgx-shbins .hgx-btn.on{ background:#3aa66a; color:#fff; opacity:1; border-color:transparent; }
.hgx-shbins{ display:grid; grid-template-columns:1fr; gap:8px; min-width:200px; } .hgx-shbins .hgx-btn{ font-size:15px; padding:11px 16px; }
body:not(.light-theme) .hgx-sil path{ stroke:#e6edf5; }
.hgx-gtabs{ display:flex; gap:6px; flex-wrap:wrap; margin:0 0 8px; }
.hgx-grow{ display:flex; gap:14px; align-items:flex-start; } .hgx-gmap{ flex:1.3; min-width:0; } .hgx-gside{ flex:1; min-width:240px; }
.hgx-gm{ width:100%; display:block; border-radius:12px; touch-action:none; user-select:none; }
.hgx-gm .gfarm{ fill:#e7efd2; } .hgx-gm .gsub{ fill:#efe7d6; } .hgx-gm .gcity{ fill:#d9dce1; } .hgx-gm .griver{ fill:none; stroke:#5d9bd5; stroke-width:7; opacity:.7; pointer-events:none; }
.hgx-gm .gbar-o{ fill:#e8873a; } .hgx-gm .gbar-b{ fill:#2f6fd0; } .hgx-gm .gnum{ font:800 15px Inter,system-ui,sans-serif; fill:#1d2433; text-anchor:middle; pointer-events:none; }
.hgx-gm .ghit{ fill:transparent; cursor:pointer; } .hgx-gm .ghit:hover{ fill:rgba(255,255,255,.25); } .hgx-gm .gb{ stroke:#1d2433; stroke-width:3.5; stroke-linecap:round; pointer-events:none; } .hgx-gm .gframe{ fill:none; stroke:#1d2433; stroke-width:4; pointer-events:none; }
.hgx-gpal{ display:grid; grid-template-columns:repeat(3,1fr); gap:6px; } .hgx-gpal button{ border:2px solid transparent; background:var(--dc); color:#1d2433; border-radius:10px; padding:6px; font:600 12px Inter,system-ui,sans-serif; cursor:pointer; display:flex; flex-direction:column; align-items:center; }
.hgx-gpal button b{ font-size:16px; } .hgx-gpal button.on{ border-color:#1d2433; box-shadow:0 0 0 2px #fff inset; } .hgx-gpal button.bad{ outline:2px solid #d23b2a; } .hgx-gpal i{ font-style:normal; font-weight:800; font-size:11px; } .hgx-gpal i.b{ color:#1d4fa0; } .hgx-gpal i.o{ color:#a3480c; }
.hgx-gst{ font-size:13.5px; margin:8px 0; } .hgx-gst p{ margin:3px 0; } .hgx-gst .cb{ color:#2f6fd0; } .hgx-gst .co{ color:#d9682b; } .hgx-gst .warn{ color:#d23b2a; font-weight:700; }
.hgx-gbtns{ margin:6px 0; }
body:not(.light-theme) .hgx-gm .gb,body:not(.light-theme) .hgx-gm .gframe{ stroke:#0d1626; } body:not(.light-theme) .hgx-gpal button.on{ border-color:#fff; } body:not(.light-theme) .hgx-gst .cb{ color:#7fb0ff; } body:not(.light-theme) .hgx-gst .co{ color:#ffab6b; }
@media (max-width:700px){ .hgx-grow{ flex-direction:column; } .hgx-gside{ min-width:0; width:100%; } }
`;document.head.appendChild(css);
})();
