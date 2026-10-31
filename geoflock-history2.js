/* History map, second edition: borders from OpenHistoricalMap (CC0), with historical-basemaps (GPL-3.0) filling the
   places and periods OpenHistoricalMap does not cover yet, all clipped to Natural Earth coastlines. Each polity has its
   own start and end date, so the year moves one year at a time from 3000 BC to today (the slider's scale is squeezed
   in early times), and the caption tells the story of the period rather than of one year.
   The data is split by period (history/h2-*.json) and fetched when needed. The guided history tours show this map too
   (their stops name a year and an empire by the first map's keys, see "focus" below); only their stops before 3000 BC
   (human origins) and the eras games keep the older year-by-year maps (terra-atlas-history.js).
   Playing: the year counts up one year at a time (faster in early times, when little changes); whenever the borders
   change, the map grows and shrinks into the new borders instead of jumping (see "transitions" below).
   Drawing: the map is drawn once into a picture a little larger than the view, and dragging only slides that picture. */
(function(){
if(typeof histFeatures!=="function"||typeof HIST_DATA==="undefined")return;
const BASE="history/";let IDX=null;const CH={},LOADING={};
/* the slider's scale: one step per 10 years before 1500, 5 to 1800, then 1 (the year itself moves one year at a time) */
const YEARS=[];for(let b=3000;b>=10;b-=10)YEARS.push(1-b);for(let y=1;y<1500;y=y<10?10:y+10)YEARS.push(y);
for(let y=1500;y<1800;y+=5)YEARS.push(y);for(let y=1800;y<=2025;y++)YEARS.push(y);
const N=YEARS.length,YMIN=YEARS[0],YMAX=YEARS[N-1];
const PERIODS=[
 [-3000,-2334,"The first cities","Sumer’s walled city-states fill southern Mesopotamia, Egypt has been one kingdom since about 3100 BC, and the cities of the Indus valley are growing. Writing, kings and taxes appear for the first time."],
 [-2334,-1600,"The first empires","Sargon of Akkad joins the Sumerian cities into what is often called the first empire. Egypt builds its great pyramids, the Indus cities trade as far as Mesopotamia, and Hammurabi rules Babylon in the 1700s BC."],
 [-1600,-1177,"Bronze Age great powers","New Kingdom Egypt, the Hittites, Mitanni, Babylon and Mycenaean Greece trade and write to each other as equals, while the Shang dynasty rules the Yellow River plain in China."],
 [-1177,-550,"Collapse and the Iron Age","Around 1177 BC many Bronze Age kingdoms fall. From the ruins come iron tools, the Phoenician alphabet and Greek city-states, and Assyria builds the largest empire yet before it falls in 612 BC. Zhou kings rule in China."],
 [-550,-323,"Persia and the Greeks","Cyrus the Great founds the Achaemenid Persian Empire around 550 BC, stretching from Egypt to the Indus. The Greek cities hold it off, and then Alexander the Great conquers all of it before he dies in 323 BC."],
 [-323,-27,"Successors, Qin and Rome","Alexander’s generals split his empire. Ashoka’s Maurya Empire covers most of India, Qin unites China in 221 BC and the Han dynasty follows, while Rome takes over the whole Mediterranean."],
 [-27,476,"The classical empires","From 27 BC Rome is ruled by emperors; at the same time the Han, Parthian (later Sasanian), Kushan and Gupta realms link Eurasia through the Silk Roads. Rome splits in two in 395, and the western half ends in 476."],
 [476,632,"After Rome","Germanic kingdoms share the old Western Empire, the Eastern Roman (Byzantine) Empire wins back Italy under Justinian, Sasanian Persia is at its height, and the Sui reunite China in 589, followed by the Tang in 618."],
 [632,800,"The caliphates","After Muhammad’s death in 632, Arab armies build a caliphate from Spain to the Indus within a century. The Abbasids found Baghdad in 762, while Tang China and the Tibetan Empire meet in Central Asia."],
 [800,1000,"Franks, Vikings and the Abbasids","Charlemagne is crowned emperor in 800, Vikings raid and settle from Russia to Iceland, the Abbasid caliphate breaks into local dynasties, and after the Tang fall in 907 the Song reunite most of China from 960."],
 [1000,1206,"Crusades and kingdoms","The Holy Roman Empire, the Seljuk Turks and Song China are the big powers; crusaders take Jerusalem in 1099, Angkor is the capital of the Khmer Empire, and gold from West Africa reaches the Mediterranean."],
 [1206,1368,"The Mongol world","Genghis Khan is proclaimed in 1206 and his heirs build the largest connected land empire in history. Kublai Khan rules China as the Yuan dynasty, Mansa Musa’s Mali is famous for its gold, and the Black Death spreads along the trade routes from 1346."],
 [1368,1492,"Ming, Timur and the Ottomans","The Ming drive the Mongols from China in 1368 and send Zheng He’s fleets across the Indian Ocean, Timur raids from Delhi to Anatolia, the Ottomans take Constantinople in 1453, and the Aztec and Inca empires grow in the Americas."],
 [1492,1648,"Oceans join the world","Columbus reaches the Caribbean in 1492. Spain conquers the Aztec and Inca empires, Portugal builds trading posts from Brazil to Japan, the Mughals take northern India from 1526, and the Peace of Westphalia ends Europe’s Thirty Years’ War in 1648."],
 [1648,1763,"Gunpowder and trade","The Qing rule China from 1644, the Mughal Empire is at its largest around 1700, Russia has reached the Pacific, and British, French and Dutch trading companies fight for colonies until the Seven Years’ War ends in 1763."],
 [1763,1815,"An age of revolutions","The United States wins independence, the French Revolution of 1789 leads to Napoleon’s empire across Europe, Haiti becomes the first state founded after a slave revolt in 1804, and the Congress of Vienna redraws Europe in 1815."],
 [1815,1871,"New nations","Most of Spanish and Portuguese America is independent by the mid-1820s, Britain rules India and forces trade on China, and Italy (1861) and Germany (1871) are unified."],
 [1871,1914,"The height of empire","European powers divide Africa among themselves after the Berlin Conference of 1884–85, and by 1914 only Ethiopia and Liberia are still independent there. Japan and the United States build overseas empires too."],
 [1914,1945,"The world wars","The First World War ends the German, Austro-Hungarian, Russian and Ottoman empires and creates new states in Europe and the Middle East. The Soviet Union forms in 1922, and the Second World War redraws the map again."],
 [1945,1991,"Cold War and the end of empires","India and Pakistan become independent in 1947 and 17 African countries in 1960 alone. The United States and the Soviet Union face each other in the Cold War until the Soviet Union breaks into 15 countries in 1991."],
 [1991,2026,"The world today","New states appear from the former Soviet Union, Yugoslavia and Czechoslovakia, the European Union grows, and South Sudan becomes the newest widely recognised country in 2011."]];
PERIODS.forEach(P=>{if(P[0]<0)P[0]+=1;if(P[1]<0)P[1]+=1});/* written as BC years above; stored as astronomical years (1 BC = 0) */
const LOOK=["the river valleys of the Tigris and Euphrates, the Nile and the Indus, where the first states appear.","Akkad in Mesopotamia and Egypt along the Nile; most of the world still lives in farming villages without states.",
 "Egypt reaching north into the Levant, and the Hittites in Anatolia.","Assyria spreading across the Fertile Crescent before its fall in 612 BC.","Persia, the largest empire the world had yet seen, from Egypt to the Indus.",
 "the Maurya Empire in India, and Rome taking the coasts of the Mediterranean.","Rome and Han China at the two ends of Eurasia around AD 100.","the Byzantine reconquest of Italy and North Africa in the 530s–550s.",
 "the caliphate stretching from Spain to Central Asia by 750.","the Frankish Empire around 800 and its split into three in 843.","the crusader states along the eastern Mediterranean after 1099.",
 "the Mongol khanates covering most of Asia by the 1280s.","the Ottomans growing around Constantinople, and the Inca along the Andes.","Spain’s and Portugal’s new lands in the Americas.",
 "Russia reaching across Siberia to the Pacific.","the United States after 1783, and Napoleon’s France around 1810.","the new republics of Latin America in the 1820s.",
 "Africa filling with colonial colours after 1885.","the new countries of central and eastern Europe after 1918.","Africa’s new countries around 1960.","the 15 countries that came out of the Soviet Union."];
/* the year shown (exact, one year at a time) and its place on the slider's scale */
let curY=1000,pos=YEARS.indexOf(1000);if(pos<0){curY=1914;pos=YEARS.indexOf(1914)}/* opens at AD 1000: a busy, varied world, and the map moves fastest from here on */
function posOf(y){let lo=0,hi=N-1;while(lo<hi){const m=(lo+hi+1)>>1;if(YEARS[m]<=y)lo=m;else hi=m-1}return lo}
const uOf=y=>{const i=posOf(y);return i>=N-1?N-1:i+(y-YEARS[i])/(YEARS[i+1]-YEARS[i])};
const yOfU=u=>{u=Math.max(0,Math.min(N-1,u));const i=Math.floor(u);return i>=N-1?YMAX:Math.round(YEARS[i]+(u-i)*(YEARS[i+1]-YEARS[i]))};
const tourOn=()=>typeof ps!=="undefined"&&!!ps;let tourOld=false,preTourY=null;
const useNew=()=>!!IDX&&!(tourOn()&&tourOld);
const yLabel=y=>y<=0?(1-y)+" BC":y<1000?"AD "+y:String(y);
const yKey=y=>y<=0?"bc"+(1-y):String(y);
const period=y=>PERIODS.find(p=>y>=p[0]&&y<p[1])||PERIODS[PERIODS.length-1];
function yearObj(){const y=curY,P=period(y);return{y:yKey(y),label:yLabel(y),cap:P[2]+". "+P[3],era:P[2],labs:labList(),yr:y}}
fetch(BASE+"h2-index.json").then(r=>r.ok?r.json():null).then(j=>{if(!j)return;IDX=j;need(curY);try{if(histOn())applyAllMapsColorMode(document.getElementById("allMapsWrap"))}catch(e){}}).catch(()=>{});
function chunkOf(y){if(!IDX)return-1;return IDX.chunks.findIndex(c=>y>=c[0]&&y<c[1])}
function dens(r){const o=[];for(let k=0;k<r.length;k++){const a=r[k];o.push(a);const b=r[k+1];if(!b)continue;const n=Math.floor(Math.max(Math.abs(b[0]-a[0]),Math.abs(b[1]-a[1])));for(let j=1;j<n;j++)o.push([a[0]+(b[0]-a[0])*j/n,a[1]+(b[1]-a[1])*j/n])}return o}
function load(k){if(k<0||!IDX||k>=IDX.chunks.length||CH[k]||LOADING[k])return;LOADING[k]=fetch(BASE+IDX.chunks[k][2]).then(r=>r.json()).then(topo=>{
 const fc=topojson.feature(topo,topo.objects[Object.keys(topo.objects)[0]]);const out=[];
 fc.features.forEach(f=>{const g=f.geometry;if(!g)return;let P=g.type==="Polygon"?[g.coordinates]:g.type==="MultiPolygon"?g.coordinates:null;if(!P)return;
  P=P.map(poly=>poly.map(dens));P.forEach(poly=>{try{if(d3.geoArea({type:"Polygon",coordinates:poly})>2*Math.PI)poly.forEach(r=>r.reverse())}catch(e){}});
  f.geometry={type:"MultiPolygon",coordinates:P};f._b=d3.geoBounds(f);f.properties.imp=impOf(f.properties);out.push(f)});
 out.sort((a,b)=>(a.properties.o?1:0)-(b.properties.o?1:0)||b.properties.a-a.properties.a);
 CH[k]=out;delete LOADING[k];FC.clear();warm(out);if(useNew()&&histOn()&&chunkOf(curY)===k){histShown=-1;setYear(curY,false,tourOn())}}).catch(()=>{delete LOADING[k]})}
function need(y){const k=chunkOf(y);load(k);load(k+1);if(k>0)load(k-1)}
/* the polities alive in the shown year. The same set of polities is always the same array, so a change of borders
   can be told by the array alone. */
const FC=new Map,SIG=new Map;let lastFrame=[],frameId=0;
function frameAt(y){const k=chunkOf(y);if(!CH[k])return null;const t=y+.5,C=CH[k],ix=[];
 for(let i=0;i<C.length;i++){const p=C[i].properties;if(!(p.s<=t&&t<p.e))continue;let hole=false;if(p.h)for(const r of p.h)if(t>=r[0]&&t<r[1]){hole=true;break}if(!hole)ix.push(i)}
 const sig=k+":"+ix.join(",");let fr=SIG.get(sig);if(!fr){fr=ix.map(i=>C[i]);fr._id=++frameId;if(SIG.size>400)SIG.clear();SIG.set(sig,fr)}return fr}
function frame(){const y=curY;let fr=FC.get(y);if(fr)return lastFrame=fr;need(y);fr=frameAt(y);if(!fr)return lastFrame;if(FC.size>3000)FC.clear();FC.set(y,fr);return lastFrame=fr}
/* the next year (after y, up to y+span) whose borders differ: used to slow the count down a little near changes */
const keyOf=p=>p.gk&&HIST_DATA.groups[p.gk]?"g:"+p.gk:"n:"+p.n;
const keyName=k=>KN[k]||(k.startsWith("g:")?HIST_DATA.groups[k.slice(2)][0]:k.slice(2));

/* ---------- which names matter ----------
   A name is shown for how well known the polity is, not only for how big it is: a short list of well-known states and
   peoples (tier 3: always named when there is room among the other names; tier 2: named once it is not tiny on the
   screen), and the area as a small extra. Unknown small places are named only when the name fits inside them. */
const IMP3=/egypt|\b(shang|zhou|qin|han|western han|eastern han|sui|tang|song|northern song|southern song|yuan|ming|qing|roman|rome|byzantine|achaemenid|persia|persian|parthian|parthia|sasanian|sassanid|assyria|assyrian|neo-assyrian|babylon|babylonia|babylonian|neo-babylonian|akkad|akkadian|sumer|sumerian|ur|uruk|lagash|hittite|hittites|mycenaean|minoan|athens|athenian|sparta|spartan|macedon|macedonia|macedonian|alexander|carthage|carthaginian|israel|judah|judea|judaea|olmec|maya|mayan|aztec|aztecs|mexica|tenochtitlan|triple alliance|inca|incas|tawantinsuyu|aksum|axum|aksumite|kush|kushite|meroe|mali|songhai|ghana|wagadu|venice|venetian|holy roman|frankish|franks|francia|carolingian|caliphate|rashidun|umayyad|umayyads|abbasid|abbasids|fatimid|ottoman|ottomans|mongol|mongols|golden horde|ilkhanate|chagatai|timurid|mughal|maurya|mauryan|gupta|khmer|angkor|teotihuacan|teotihuacán|indus|harappa|harappan|elam|elamite|phoenicia|phoenician|phoenicians|tyre|nubia|kerma|great zimbabwe|zimbabwe|ethiopia|ethiopian|abyssinia|kievan rus|kyivan rus|seljuk|seljuks|mamluk|mamluks|delhi sultanate|xiongnu|scythians|scythia|mitanni|hyksos|kassite|kassites|urartu|lydia|lydian|medes|median|media|greek city-states|greek|greece|hellenic|etruscan|etruscans|seleucid|ptolemaic|tibet|tibetan|goguryeo|silla|goryeo|joseon|gojoseon|japan|yamato|xia|srivijaya|majapahit|chola|vijayanagara|kushan|toltec|chimu|chimú|tiwanaku|wari|huari|moche|nazca|zapotec|benin|kongo|kanem|bornu|kanem-bornu|swahili|kilwa|mutapa|mwenemutapa|zulu|ashanti|asante)\b/i;
const IMP2=/\b(mitanni|arzawa|amurru|canaan|philistia|philistines|aram|aramean|arameans|damascus|nabataean|nabataea|saba|sheba|sabaean|himyar|himyarite|dilmun|magan|qataban|hadramaut|phrygia|phrygian|lycia|caria|thrace|thracian|illyria|illyrian|epirus|thessaly|thebes|corinth|argos|syracuse|crete|cyprus|latin|latins|samnites|numidia|numidian|mauretania|pontus|bithynia|pergamon|pergamum|armenia|armenian|georgia|iberia|colchis|albania|bactria|bactrian|sogdia|khwarazm|khwarezm|chorasmia|magadha|kosala|kalinga|satavahana|chalukya|pallava|pandya|chera|rashtrakuta|pala|ghaznavid|ghurid|samanid|buyid|tahirid|saffarid|safavid|afsharid|zand|qajar|durrani|maratha|sikh|mysore|hyderabad|bengal|kievan|rus|novgorod|muscovy|moscow|vladimir|lithuania|poland|polish|hungary|hungarian|bohemia|moravia|great moravia|serbia|serbian|bulgaria|bulgarian|bulgars|croatia|bosnia|wallachia|moldavia|england|english|wessex|mercia|northumbria|scotland|wales|ireland|france|west francia|east francia|burgundy|burgundians|castile|aragon|leon|león|navarre|portugal|asturias|granada|cordoba|córdoba|al-andalus|denmark|norway|sweden|papal|teutonic|livonian|jerusalem|antioch|edessa|tripoli|cilicia|trebizond|nicaea|epirus|genoa|genoese|florence|milan|naples|sicily|sardinia|savoy|lombard|lombards|ostrogoth|ostrogoths|ostrogothic|visigoth|visigoths|visigothic|vandal|vandals|suebi|gepids|avar|avars|khazar|khazars|huns|hunnic|alans|sarmatians|cumans|pechenegs|uyghur|uyghurs|gokturk|göktürk|turkic khaganate|khitan|liao|jin|jurchen|western xia|xi xia|tangut|nanzhao|dali|wei|shu|wu|chu|zhao|yan|qi|jin|liang|chen|baekje|gaya|balhae|bohai|champa|funan|chenla|dai viet|đại việt|annam|pagan|bagan|pyu|ayutthaya|sukhothai|lan xang|lanna|mataram|singhasari|kediri|sailendra|malacca|brunei|aceh|ryukyu|ainu|hawaii|hawaiian|tonga|maori|cahokia|mississippian|ancestral puebloans|hohokam|purepecha|purépecha|tarascan|mixtec|tlaxcala|muisca|chachapoya|cañari|mapuche|tupi|guarani|kanem|hausa|oyo|ife|dahomey|kush|nobatia|makuria|alodia|zagwe|adal|ajuran|ifat|buganda|bunyoro|rwanda|luba|lunda|kuba|ndongo|mapungubwe|merina|madagascar|morocco|marinid|almohad|almoravid|hafsid|zayyanid|tlemcen|mamluk|ayyubid|zengid|tulunid|ikhshidid|idrisid|aghlabid|rustamid|zirid|hammadid|ottoman|safavid|crimean|kazan|astrakhan|siberia|sibir|nogai|kazakh|khiva|bukhara|kokand|durrani|hotaki)\b/i;
function impOf(p){const n=String(p.n||"");let tier=IMP3.test(n)?3:IMP2.test(n)?2:0;if(p.k===0)tier=Math.min(tier,1);/* peoples without a state */
 const a=+p.a||0;return{tier,score:tier*100+Math.log2(1+a)*9-(p.k===0?60:0)}}
function labList(fr){const seen=new Set,L=[];(fr||frame()).slice().sort((a,b)=>b.properties.imp.score-a.properties.imp.score).forEach(f=>{const p=f.properties;if(!p.n||seen.has(p.n))return;const T=p.imp.tier;
 if(T<2&&p.a<(p.k===0?40:3))return;if(histFocus&&focusAny(fr||frame())&&!inFocus(p))return;seen.add(p.n);L.push([keyOf(p),p.n,p.l[0],p.l[1],p.k===0?Math.min(p.a,60):p.a,0,f._b,p.k===0,T])});return L}
let KN={};/* a group with one member alive is named after that member (Denmark in 1000 is not yet "Denmark–Norway") */
function powers(){const m=new Map,mem={};frame().forEach(f=>{const p=f.properties;if(p.k===0||!p.n)return;const k=keyOf(p);m.set(k,(m.get(k)||0)+p.a);(mem[k]=mem[k]||new Set).add(p.n)});KN={};for(const k in mem)if(k.startsWith("g:")&&mem[k].size===1)KN[k]=[...mem[k]][0];return[...m].sort((a,b)=>b[1]-a[1]).slice(0,12).map(x=>x[0])}
/* ---------- focus: one polity (a coloured name in the key) or, in the guided tours, an old group key ----------
   The tours name their highlighted empire with the first map's group keys ("brit", "mon", "chn"…). Most polities in
   this map carry the same key (gk); a few are matched by name, and "new" means states that did not exist six years
   earlier. */
const ALIAS={chn:/^(Great Ming|Ming|Qing|Northern Song|Southern Song|Song Empire|Han Empire|Western Han|Eastern Han|Tang|Sui|Yuan|China|Republic of China|People's Republic of China)$/,
 ann:/^(Russia|Ukraine)$/,sum:/^(Ur|Uruk|Lagash|Kish|Umma|Akkad|city-states|Sumer)$/,alex:/^(Empire of Alexander|Macedon|Kingdom of Macedon|Macedonia)$/};
const NOTNEW=/Empire|\(|Kingdom of Serbia|German|Austria|Italy|Itali|France|French Rep|Japan|Trieste|occup|Occup|zone|Zone|Allied|Soviet|Russia|Spain|Portugal|Antarctic/;
let newSet=null;
function newNames(y){if(newSet&&newSet.y===y)return newSet.s;const prev=frameAt(y-6);if(!prev){need(y-6);return null}const had=new Set(prev.map(f=>f.properties.n));newSet={y,s:had};return had}
function tourMatch(f,p){if(p.k===0||!p.n)return false;if(f==="new"){if(NOTNEW.test(p.n))return false;const had=newNames(curY);return had?!had.has(p.n):p.s>curY-6&&p.s<=curY+.5}
 if(ALIAS[f]&&ALIAS[f].test(p.n))return true;if(f==="mon"&&/Ming/.test(p.n))return false;return p.gk===f}
function inFocus(p){const F=histFocus;if(!F)return true;if(F.startsWith("g:")||F.startsWith("n:"))return keyOf(p)===F;return tourMatch(F,p)}
const FA=new Map;function focusAny(fr){const k=fr._id+"|"+histFocus+"|"+curY;if(FA.has(k))return FA.get(k);if(FA.size>50)FA.clear();const v=fr.some(f=>inFocus(f.properties));FA.set(k,v);return v}
const W=(name,fn)=>{const old=window[name]||eval(name);const f=function(){return useNew()?fn.apply(this,arguments):old.apply(this,arguments)};f._old=old;try{eval(name+"=f")}catch(e){window[name]=f}};
W("histFeatures",()=>frame());
W("histYear",()=>yearObj());
W("histLabelList",()=>labMode()==="off"?[]:labList());
W("histFill",p=>{if(histFocus&&focusAny(frame())&&!inFocus(p))return p.k===0?"#f1ece2":"#e6e1d6";if(p.k===0||!p.c)return p.k===0?HIST_LAND:"hsl(200,28%,80%)";return p.c});
W("histDescribe",f=>{const p=f.properties;let s=p.n||"Unnamed";if(p.k===0)return s+" — peoples without a state";const G=p.gk&&HIST_DATA.groups[p.gk];if(G&&G[0]!==p.n&&!KN["g:"+p.gk]&&!/^(Russia|China|India|Persia|Germany|Italy|Japan|Egypt)$/.test(G[0]))s+=" — "+G[0];
 if(p.o){const a=Math.floor(p.s),b=p.e>=9999?null:Math.floor(p.e);s+=" ("+(b==null?"since "+yLabel(a):yLabel(a).replace(/^AD /,"")+"–"+yLabel(b).replace(/^AD /,""))+")"}return s});
/* the bar shows a few broad eras; the 21 story periods stay in the story card */
const ERAS=[[-2999,-499,"Ancient world"],[-499,500,"Classical"],[500,1450,"Middle Ages"],[1450,1800,"Exploration"],[1800,1914,"Empires"],[1914,1991,"World wars"],[1991,3000,"Now"]];
function eraHTML(){return ERAS.map(P=>{let a=YEARS.findIndex(y=>y>=P[0]),b=YEARS.findIndex(y=>y>=P[1]);if(b<0)b=N-1;const on=curY>=P[0]&&curY<P[1];
 return`<span class="hist-era${on?" on":""}" style="left:${(a/(N-1)*100).toFixed(2)}%;width:${((b-a)/(N-1)*100).toFixed(2)}%" data-hy="${a}" title="${P[2]}">${P[2]}</span>`}).join("")}
function ticksHTML(){return[-2999,-1999,-999,1,500,1000,1500,1800,1900,2000].map(y=>{const i=YEARS.findIndex(v=>v>=y);return`<button type="button" class="hist-tick key${i===pos?" on":""}" data-hy="${i}" style="left:${(i/(N-1)*100).toFixed(2)}%" aria-label="${yLabel(YEARS[i])}"><b></b><span>${yLabel(YEARS[i])}</span></button>`}).join("")}
const playIco=()=>histPlaying?"❚❚":"▶",playLab=()=>histPlaying?"Pause":"Play through history";
function barHTML(){return`<div class="hist-bar">
      <button type="button" class="hist-btn" data-hstep="-1" aria-label="Earlier">‹</button>
      <button type="button" class="hist-btn hist-play" aria-label="${playLab()}">${playIco()}</button>
      <div class="hist-track hist2"><div class="hist-eras">${eraHTML()}</div><input type="range" class="hist-range" min="0" max="${N-1}" step="any" value="${uOf(curY).toFixed(3)}" aria-label="Year" aria-valuetext="${yLabel(curY)}"><div class="hist-ticks">${ticksHTML()}</div></div>
      <button type="button" class="hist-btn" data-hstep="1" aria-label="Later">›</button>
    </div>`}
const capHTML=()=>`<b>${yLabel(curY)}</b> ${!CH[chunkOf(curY)]?"Loading borders…":"<i>"+period(curY)[2]+"</i> · "+pRange(period(curY))}`;
W("histLegendHTML",()=>{const fr=frame();const keys=powers().map(k=>{const f=fr.find(x=>keyOf(x.properties)===k);return`<span class="legend-swatch th-sw${histFocus===k?" is-on":""}" data-hg="${k.replace(/"/g,"&quot;")}" role="button" tabindex="0"><i style="background:${f&&f.properties.c||"#ccc"}"></i>${keyName(k)}</span>`}).join("");
 return`${barHTML()}
    <div class="hist-cap">${capHTML()}</div>
    <span class="hist-names">Names <button type="button" data-hnames="main" class="${labMode()==="main"?"on":""}" title="Well-known places, and the others that fit; zoom in for more">Main</button><button type="button" data-hnames="all" class="${labMode()==="all"?"on":""}" title="Every name that has room">All</button><button type="button" data-hnames="off" class="${labMode()==="off"?"on":""}" title="No names: hover a place to see it">Off</button></span>
    <span class="legend-swatches th-swatches hist-keys">${keys}${fr.some(f=>f.properties.k===0)?`<span class="legend-swatch"><i style="background:${HIST_LAND}"></i>No state</span>`:""}</span>
    <span class="legend-note">Hover to name a state; click it for its story. Click a coloured name to show it alone; use ← → to step through time. Borders: OpenHistoricalMap contributors (CC0), with gaps filled from historical-basemaps by A. Ourednik (GPL-3.0); coastlines from Natural Earth. Borders before about 1500 are approximate, and many early states had no fixed borders at all. While the map plays, changes of borders are drawn as a short growing or shrinking movement.</span>`});
const reqMap=()=>{try{if(amGlobe&&amGlobeOn()){amGlobe.request();return true}}catch(e){}return false};
/* everything that shows the year: legend, timeline, story card. "light" (while playing) touches only the year texts and the
   slider; the rest is refreshed when the borders or the period change */
let uiFrame=null,uiPeriod=null,uiT=0;
function syncUI(light){const legend=document.getElementById("populationLegend");if(!legend||!histOn())return;const fr=frame(),P=period(curY),now=performance.now();
 const heavy=!light||fr!==uiFrame&&now-uiT>350||P!==uiPeriod;
 const ranges=[...document.querySelectorAll(".hist-track.hist2 .hist-range")];
 if(!legend.querySelector(".hist-track.hist2 .hist-range")){legend.innerHTML=histLegendHTML();uiFrame=fr;uiPeriod=P;uiT=now}
 else{const u=uOf(curY);ranges.forEach(r=>{if(!(window.HIST_DRAG&&r===document.activeElement))r.value=u;r.setAttribute("aria-valuetext",yLabel(curY))});
  const cap=legend.querySelector(".hist-cap");if(cap){const b=cap.querySelector("b");if(light&&b&&!heavy)b.textContent=yLabel(curY);else cap.innerHTML=capHTML()}
  document.querySelectorAll(".hd-year").forEach(e=>e.textContent=yLabel(curY));
  if(heavy){uiFrame=fr;uiT=now;const t=document.createElement("div");t.innerHTML=histLegendHTML();
   [".hist-keys"].forEach(sel=>{const a=legend.querySelector(sel),b=t.querySelector(sel);if(a&&b&&a.innerHTML!==b.innerHTML)a.innerHTML=b.innerHTML});
   if(P!==uiPeriod||!light){uiPeriod=P;const eh=eraHTML(),th=ticksHTML();document.querySelectorAll(".hist-track.hist2").forEach(tr=>{const e=tr.querySelector(".hist-eras"),k=tr.querySelector(".hist-ticks");if(e&&e.innerHTML!==eh)e.innerHTML=eh;if(k&&k.innerHTML!==th)k.innerHTML=th})}}
  document.querySelectorAll(".hist-bar .hist-play").forEach(pb=>{if(pb.textContent!==playIco()){pb.textContent=playIco();pb.setAttribute("aria-label",playLab())}})}
 legend.classList.toggle("has-th",!!histFocus);
 /* the story card: rebuilt when the period or the play state changes, otherwise only its year and progress bar */
 const card=document.querySelector(".hist-story");
 if(card&&light&&card._hs2P===P&&card._hs2Play===!!histPlaying){const y=card.querySelector(".hs-year");if(y)y.textContent=yLabel(curY);storyBar(card)}
 else try{histStorySync()}catch(e){}
 dockSync()}
function storyBar(card){const bar=card&&card.querySelector(".hs-bar i");if(!bar)return;const P=period(curY);bar.style.transition="none";bar.style.width=histPlaying?(Math.max(0,Math.min(1,(curY-P[0])/(P[1]-P[0])))*100).toFixed(1)+"%":"0%"}
/* show a year: the map moves to it (with a short transition when the borders change) */
function setYear(y,light,inTour){curY=Math.max(YMIN,Math.min(YMAX,Math.round(y)));pos=posOf(curY);histIdx=pos;need(curY);const fr=frame();
 if(histFocus&&!tourOn()&&!focusAny(fr))histFocus=null;histHotI=null;
 if(!reqMap()){const now=performance.now();if(!light||fr!==svgFr&&now-svgT>300){svgFr=fr;svgT=now;histShown=-1;try{histRender()}catch(e){}}}syncUI(light)}
let svgFr=null,svgT=0;
W("histSet",i=>{i=Math.max(0,Math.min(N-1,i|0));setYear(YEARS[i])});
/* in a guided tour, histSet gets an index into the first map's years: shown on this map at that exact year (stops
   before 3000 BC, where this map has no data, keep the first map) */
{const _hs=histSet,_old=_hs._old;const yk=k=>/^bc/.test(k)?1-(+k.slice(2)):+k;
 histSet=function(i){if(!tourOn()||!IDX||!HIST_DATA)return _hs.apply(this,arguments);const n=HIST_DATA.years.length;i=Math.max(0,Math.min(n-1,i|0));const Y=HIST_DATA.years[i],y=Y?yk(Y.y):NaN;
  if(preTourY==null)preTourY=curY;
  if(!(y>=YMIN)){if(!tourOld){tourOld=true;LAY=null;TR=null}return _old.apply(this,arguments)}
  if(tourOld){tourOld=false;LAY=null;TR=null}setYear(Math.min(YMAX,y),false,true);histIdx=i;try{if(ps&&ps.g&&ps.g!==amGlobe&&ps.g.request)ps.g.request()}catch(e){}}}
/* a stop that replays a few years ends on its own highlighted empire again */
try{const _ar=histAnimRun;histAnimRun=function(keys){const r=_ar.apply(this,arguments);try{const at=ps&&ps.i,S=ps&&psSteps()[at],f=S&&S.sub&&String(S.sub).split("/")[1];
 if(f&&keys&&keys.length){const wait=Math.max(0,keys.length-2)*1050+1300+150;setTimeout(()=>{try{if(ps&&ps.i===at&&!histAnimT&&!histFocus&&IDX&&!tourOld){histFocus=f;LBL.clear();reqMap()}}catch(e){}},wait)}}catch(e){}return r}}catch(e){}
/* the tours frame a stop on its highlighted empire */
{const _fb=histFocusBox;histFocusBox=function(sub){try{if(!IDX||tourOld)return _fb.apply(this,arguments);const[yk0,f]=String(sub||"").split("/");if(!f)return null;const y=/^bc/.test(yk0)?1-(+yk0.slice(2)):+yk0;if(!(y>=YMIN))return _fb.apply(this,arguments);
 const fr=frameAt(Math.min(YMAX,y));if(!fr)return _fb.apply(this,arguments);const keep=histFocus,cy=curY;histFocus=f;curY=Math.min(YMAX,y);const fs=fr.filter(x=>tourMatch(f,x.properties)&&x._b);histFocus=keep;curY=cy;if(!fs.length)return null;
 let lo=1e9,hi=-1e9,la0=90,la1=-90;const c0=fs[0]._b[0][0];fs.forEach(x=>{let a=x._b[0][0],b=x._b[1][0];if(b<a)b+=360;while(a-c0>180){a-=360;b-=360}while(c0-a>180){a+=360;b+=360}lo=Math.min(lo,a);hi=Math.max(hi,b);la0=Math.min(la0,x._b[0][1]);la1=Math.max(la1,x._b[1][1])});
 return{lo,hi,la0,la1,c:(lo+hi)/2}}catch(e){return _fb.apply(this,arguments)}}}
/* ---------- playing ----------
   The year counts up one by one. Years per second (at 1×): fast in the early millennia, when maps change slowly, and
   slower towards today, when borders change nearly every year. */
const rate=y=>y<-1000?55:y<0?40:y<1500?30:y<1800?16:y<1900?6:4.5;
let playRAF=0,playF=0,playLast=0;
function playTick(now){playRAF=0;if(!histPlaying||!useNew()||!histOn()){return}
 const dt=Math.min(120,Math.max(0,now-playLast));playLast=now;const sp=typeof histStorySpeed!=="undefined"?histStorySpeed:1;
 /* while new borders are being loaded, the count waits */
 const nf=playF+rate(playF)*sp*dt/1000,ny=Math.floor(nf);if(!CH[chunkOf(Math.min(YMAX,ny))]){need(ny);playRAF=requestAnimationFrame(playTick);return}
 playF=Math.min(YMAX,nf);if(Math.floor(playF)!==curY)setYear(Math.floor(playF),true);
 if(playF>=YMAX){histStop();setYear(YMAX);return}
 playRAF=requestAnimationFrame(playTick)}
W("histPlay",()=>{if(histPlaying){histStop();setYear(curY);return}if(curY>=YMAX)curY=YMIN;playF=curY;histPlaying=-2;playLast=performance.now();
 if(!playRAF)playRAF=requestAnimationFrame(playTick);setYear(curY)});
W("histStoryDelay",()=>140/(typeof histStorySpeed!=="undefined"?histStorySpeed:1));
const pRange=P=>yLabel(P[0]).replace(/^AD /,"")+"–"+(P[1]>=2026?"today":yLabel(P[1]).replace(/^AD /,""));
/* the story card tells the story of the period the slider is in; its arrows jump between periods */
W("histStoryHTML",()=>{const y=curY,i=PERIODS.indexOf(period(y)),P=PERIODS[i],e=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
 return`<div class="hs-head"><span class="hs-grip" aria-hidden="true"></span><span class="hs-era">${e(pRange(P))} · period ${i+1} of ${PERIODS.length}</span><button type="button" class="hs-x" data-hs="close" aria-label="Hide the story" title="Hide the story">×</button></div>
    <div class="hs-year">${e(yLabel(y))}</div>
    <div class="hs-body"><h3>${e(P[2])}</h3><p>${e(P[3])}</p><p class="hs-look">Look for: ${e(LOOK[i]||"")}</p></div>
    <div class="hs-bar"><i></i></div>
    <div class="hs-ctl">
      <button type="button" data-hs="prev" aria-label="Previous period">‹</button>
      <button type="button" class="hs-play" data-hs="play">${histPlaying?"❚❚ Pause":curY>=YMAX?"↺ From the start":"▶ Play through time"}</button>
      <button type="button" data-hs="next" aria-label="Next period">›</button>
      <button type="button" class="hs-speed" data-hs="speed" title="Speed">${typeof histStorySpeed!=="undefined"?histStorySpeed:1}×</button>
    </div>`});
document.addEventListener("click",e=>{if(!useNew())return;const b=e.target.closest&&e.target.closest(".hist-story [data-hs=prev], .hist-story [data-hs=next]");if(!b)return;e.stopPropagation();histStop();
 const i=PERIODS.indexOf(period(curY)),j=b.dataset.hs==="next"?Math.min(PERIODS.length-1,i+1):(curY>PERIODS[i][0]+(PERIODS[i][1]-PERIODS[i][0])*.15?i:Math.max(0,i-1));setYear(Math.max(YMIN,PERIODS[j][0]))},true);
/* the story card's own sync, wrapped: it remembers which period and play state it shows, and keeps its progress bar */
{const _s=histStorySync;histStorySync=function(){const r=_s.apply(this,arguments);try{if(useNew()){const c=document.querySelector(".hist-story");if(c){c._hs2P=period(curY);c._hs2Play=!!histPlaying;if(histPlaying)storyBar(c)}}freeCard()}catch(e){}return r}}

/* ================= drawing ================= */
/* Shapes are projected once per east–west frame into Path2D at scale 1 (the flat map is only scaled and shifted), so a
   frame only fills ready-made shapes. A shape's outline leaves out the old cut along the 180° meridian. */
const PC=new Map;function pcFor(dl){let c=PC.get(dl);if(!c){if(PC.size>1)PC.delete(PC.keys().next().value);c={unit:d3.geoRobinson().scale(1).translate([0,0]).rotate([dl,0]).precision(.0003),f:new WeakMap,s:new WeakMap};PC.set(dl,c)}return c}
let GP=d3.geoPath;try{if(d3.geoPath._gfOrig)GP=d3.geoPath._gfOrig}catch(e){}
const gpath=(proj,ctx)=>GP===d3.geoPath?d3.geoPath(proj,ctx):GP(proj,ctx);
function fillPath(f,dl){const C=pcFor(dl);let pa=C.f.get(f);if(!pa){pa=new Path2D();try{gpath(C.unit,pa)(f)}catch(e){}C.f.set(f,pa)}return pa}
const ED=179.999;function cutRings(rs,out){rs.forEach(r=>{let cur=[];for(let i=0;i<r.length;i++){const a=r[i];if(i){const b=r[i-1];if(Math.abs(a[0])>ED&&Math.abs(b[0])>ED&&Math.sign(a[0])===Math.sign(b[0])){if(cur.length>1)out.push(cur);cur=[]}}cur.push(a)}if(cur.length>1)out.push(cur)})}
function linePath(f,dl){if(!dl)return fillPath(f,0);const C=pcFor(dl);let pa=C.s.get(f);if(!pa){pa=new Path2D();const o=[];f.geometry.coordinates.forEach(p=>cutRings(p,o));try{gpath(C.unit,pa)({type:"MultiLineString",coordinates:o})}catch(e){}C.s.set(f,pa)}return pa}
/* a chunk's shapes are prepared a few at a time in spare moments, so playing into it does not stall */
function warm(list){const dl=(()=>{try{return amGlobe&&amGlobe._gfDl||0}catch(e){return 0}})();let i=0;const step=()=>{const t=performance.now();while(i<list.length&&performance.now()-t<12){fillPath(list[i],dl);i++}if(i<list.length)(window.requestIdleCallback||setTimeout)(step,{timeout:200})};setTimeout(step,50)}
const ROB0=d3.geoRobinson().scale(1).translate([0,0]),XR=ROB0([180,0])[0],YR=Math.abs(ROB0([0,90])[1]);
/* draws the polities onto a canvas; on the flat map with the ready-made shapes, on the globe through the projection */
function paint(c,feats,V,ox,oy,g,noLine){g=g||1;c.save();c.lineJoin="round";
 if(V.flat){const k=V.A*V.S*g;c.setTransform(k,0,0,k,ox,oy);const dl=V.dl;
  feats.forEach(f=>{c.fillStyle=histFill(f.properties);c.fill(fillPath(f,dl));if(!noLine&&f.properties.k!==0){c.lineWidth=(f.properties.o?.55:.45)/V.S;c.strokeStyle=LINE();c.stroke(linePath(f,dl))}})}
 else{c.setTransform(g===1?V.M:new DOMMatrix([g,0,0,g,0,0]).multiply(V.M));const path=gpath(V.p,c),ctr=V.ctr;
  feats.forEach(f=>{const b=f._b;let x1=b[1][0];if(x1<b[0][0])x1+=360;if(x1-b[0][0]<170){const cc=[(b[0][0]+x1)/2,(b[0][1]+b[1][1])/2],r=Math.max(d3.geoDistance(cc,b[0]),d3.geoDistance(cc,b[1]),d3.geoDistance(cc,[b[0][0],b[1][1]]),d3.geoDistance(cc,[x1,b[0][1]]));if(d3.geoDistance(cc,ctr)-r>1.6)return}
   c.beginPath();path(f);c.fillStyle=histFill(f.properties);c.fill();if(!noLine&&f.properties.k!==0){c.lineWidth=f.properties.o?.55:.45;c.strokeStyle=LINE();c.stroke()}})}
 c.restore()}
/* layer pictures are reused, not made anew for every change */
const SPARE=[];const getCv=()=>SPARE.pop()||document.createElement("canvas");const putCv=cv=>{if(cv&&SPARE.length<3&&SPARE.indexOf(cv)<0)SPARE.push(cv)};
/* the view: scale and offset on the flat map (in device pixels), or the whole projection on the globe */
function viewOf(ctx,p,gv){const M=ctx.getTransform(),cw=ctx.canvas.width,ch=ctx.canvas.height;
 if(!gv._flat)return{flat:false,M,p,cw,ch,ctr:[-gv.rot[0],-gv.rot[1]],key:["g",gv.rot[0],gv.rot[1],gv.rot[2]||0,gv.zoom,p.scale(),p.translate().join(),M.a,M.d,M.e,M.f,cw,ch].join("|")};
 const S=p.scale(),t=p.translate(),A=M.a,bx=A*t[0]+M.e,by=M.d*t[1]+M.f,dl=gv._gfDl||0,W0=2*Math.PI*S,ks=[];
 if(gv._gfOx){const vw=gv.size().w;for(let n=-2;n<=2;n++){const x0=t[0]+n*W0;if(!(x0+W0/2<0||x0-W0/2>vw))ks.push(n*W0)}}if(!ks.length)ks.push(0);
 return{flat:true,M,p,cw,ch,S,A,bx,by,dl,ks,key:["f",S,dl,A,M.d].join("|")}}
/* the part of the map (relative to the world's centre, in device pixels) that the view needs */
function needRect(V){const ex=V.A*V.S*XR+3,ey=V.A*V.S*YR+3;let x0=1e9,x1=-1e9;V.ks.forEach(k=>{const o=V.bx+V.A*k;x0=Math.min(x0,-o);x1=Math.max(x1,V.cw-o)});
 return[Math.max(-ex,x0),Math.max(-ey,-V.by),Math.min(ex,x1),Math.min(ey,V.ch-V.by)]}
const inside=(r,R)=>r[0]>=R[0]-.5&&r[1]>=R[1]-.5&&r[2]<=R[2]+.5&&r[3]<=R[3]+.5;
const CAP=4096;
/* one picture of a set of polities for a view: flat → the view plus a margin (so a drag only slides it); globe → the view */
const DBG=window.GF_H2DBG={layer:0,label:0,blit:0,scaled:0,trans:0,direct:0,layerMs:0,labelMs:0};
function layerFor(feats,V,rect,old){DBG.layer++;const _t=performance.now();try{return layerFor0(feats,V,rect,old)}finally{DBG.layerMs+=performance.now()-_t}}
function layerFor0(feats,V,rect,old){let L=old&&old.cv&&!old.busy?old:{cv:getCv()};
 if(V.flat){const ex=V.A*V.S*XR+3,ey=V.A*V.S*YR+3;let R=rect;if(!R){const n=needRect(V),mx=V.cw*.5,my=V.ch*.5;R=[Math.max(-ex,n[0]-mx),Math.max(-ey,n[1]-my),Math.min(ex,n[2]+mx),Math.min(ey,n[3]+my)];
   if(R[2]-R[0]>CAP){const c=(n[0]+n[2])/2;R[0]=Math.max(R[0],c-CAP/2);R[2]=Math.min(R[2],R[0]+CAP)}if(R[3]-R[1]>CAP){const c=(n[1]+n[3])/2;R[1]=Math.max(R[1],c-CAP/2);R[3]=Math.min(R[3],R[1]+CAP)}}
  R=[Math.floor(R[0]),Math.floor(R[1]),Math.ceil(R[2]),Math.ceil(R[3])];const w=Math.max(1,R[2]-R[0]),h=Math.max(1,R[3]-R[1]);
  if(L.cv.width!==w||L.cv.height!==h){L.cv.width=w;L.cv.height=h}const c=L.cv.getContext("2d");c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,w,h);paint(c,feats,V,-R[0],-R[1]);
  Object.assign(L,{R,w,h,key:V.key,S:V.S,feats,fx:fxKey()})}
 else{if(L.cv.width!==V.cw||L.cv.height!==V.ch){L.cv.width=V.cw;L.cv.height=V.ch}const c=L.cv.getContext("2d");c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,V.cw,V.ch);paint(c,feats,V);
  Object.assign(L,{R:null,w:V.cw,h:V.ch,key:V.key,feats,fx:fxKey()})}
 return L}
const fxKey=()=>String(histFocus||"")+(window.gfHR?gfHR.fx():"");
/* the borders' colour (geoflock-histrelief.js darkens it when the map lies over the relief, so it stays readable) */
const LINE=()=>window.gfHR?gfHR.line():"rgba(60,45,30,.42)";
/* the picture's place on the canvas (device pixels) for one copy of the world */
const layerXY=(L,V,k)=>V.flat?[Math.round(V.bx+V.A*k+L.R[0]),Math.round(V.by+L.R[1])]:[0,0];
let LAY=null,GLB=null,GOFF=null,lastS=0,lastSAt=0,crispT=0;
function blit(ctx,L,V,alpha){DBG.blit++;ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=alpha;if(V.flat)V.ks.forEach(k=>{const[x,y]=layerXY(L,V,k);ctx.drawImage(L.cv,x,y)});else ctx.drawImage(L.cv,0,0);ctx.restore()}
/* while a zoom is under way the last picture is stretched; a sharp one is drawn as soon as the zoom rests */
function blitScaled(ctx,L,V,alpha){DBG.scaled++;const r=V.S/L.S;ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=alpha;ctx.imageSmoothingEnabled=true;V.ks.forEach(k=>{ctx.drawImage(L.cv,V.bx+V.A*k+L.R[0]*r,V.by+L.R[1]*r,L.w*r,L.h*r)});ctx.restore()}

/* ---------- transitions ----------
   When the borders change, both maps are drawn to pictures and compared on a coarse grid. Each changed cell gets a
   time: cells a polity gains are reached by a flood that starts at the polity's old border (so it grows outwards
   from where it was), cells it loses are taken back from the neighbours' side (so it shrinks inwards), and a polity
   that is new grows out from its own middle. Each frame, a soft-edged mask from those times lets the new map show
   through where the flood has arrived. */
let TR=null;
let GA=null,GB=null;const cpu=()=>{const c=document.createElement("canvas");c.getContext("2d",{willReadFrequently:true});return c};
function analyse(A,B,V){const w=A.w,h=A.h,cell=Math.max(2,Math.ceil(Math.sqrt(w*h/120000))),gw=Math.max(1,Math.ceil(w/cell)),gh=Math.max(1,Math.ceil(h/cell)),n=gw*gh,g=gw/w;
 if(!GA){GA=cpu();GB=cpu()}
 const grab=(cv,feats)=>{if(cv.width!==gw||cv.height!==gh){cv.width=gw;cv.height=gh}const c=cv.getContext("2d",{willReadFrequently:true});c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,gw,gh);
  if(V.flat)paint(c,feats,V,-A.R[0]*g,-A.R[1]*g,g,true);else paint(c,feats,V,0,0,g,true);return c.getImageData(0,0,gw,gh).data};
 const a=grab(GA,A.feats),b=grab(GB,B.feats);
 const near=(x,i,y,j)=>{const ax=x[i*4+3],ay=y[j*4+3];if(ax<40&&ay<40)return true;if(ax<40||ay<40)return false;return Math.abs(x[i*4]-y[j*4])+Math.abs(x[i*4+1]-y[j*4+1])+Math.abs(x[i*4+2]-y[j*4+2])+Math.abs(ax-ay)<34};
 const T=new Int32Array(n),Q=new Int32Array(n);let qh=0,qt=0,nch=0;for(let i=0;i<n;i++){if(near(a,i,b,i))T[i]=0;else{T[i]=-1;nch++}}
 if(!nch)return null;
 const nb=(i,f)=>{const x=i%gw;if(x>0)f(i-1);if(x<gw-1)f(i+1);if(i>=gw)f(i-gw);if(i<n-gw)f(i+gw)};
 /* seeds: a changed cell next to a cell that already had its new colour */
 for(let i=0;i<n;i++)if(T[i]<0){let s=false;nb(i,j=>{if(!s&&near(a,j,b,i))s=true});if(s){T[i]=1;Q[qt++]=i}}
 while(qh<qt){const i=Q[qh++],ti=T[i];nb(i,j=>{if(T[j]<0&&near(b,j,b,i)){T[j]=ti+1;Q[qt++]=j}})}
 /* the rest (a polity that is new here): grows from its middle. Distance to its edge, then turned round per patch */
 const D=new Int32Array(n).fill(-1);qh=qt=0;for(let i=0;i<n;i++)if(T[i]<0){let e=false;nb(i,j=>{if(T[j]>=0)e=true});const x=i%gw,y=(i/gw)|0;if(e||x===0||y===0||x===gw-1||y===gh-1){D[i]=1;Q[qt++]=i}}
 while(qh<qt){const i=Q[qh++];nb(i,j=>{if(T[j]<0&&D[j]<0){D[j]=D[i]+1;Q[qt++]=j}})}
 const comp=new Int32Array(n).fill(-1);for(let i=0;i<n;i++)if(T[i]<0&&comp[i]<0){qh=qt=0;Q[qt++]=i;comp[i]=i;let mx=1;while(qh<qt){const c=Q[qh++];if(D[c]>mx)mx=D[c];nb(c,j=>{if(T[j]<0&&comp[j]<0){comp[j]=i;Q[qt++]=j}})}
  for(let q=0;q<qt;q++){const c=Q[q];T[c]=Math.max(1,mx-Math.max(1,D[c])+1)}}
 let Tmax=8;for(let i=0;i<n;i++)if(T[i]>Tmax)Tmax=T[i];
 if(!MK)MK=document.createElement("canvas");const mk=MK;if(mk.width!==gw||mk.height!==gh){mk.width=gw;mk.height=gh}const mc=mk.getContext("2d");const md=mc.createImageData(gw,gh);
 return{gw,gh,T,Tmax,mk,mc,md,nch}}
let MK=null,WORK=null;
function maskAt(G,e){const thr=e*(G.Tmax+2),d=G.md.data,T=G.T;for(let i=0,n=T.length;i<n;i++){const t=T[i];let v;if(t===0)v=255;else{v=(thr-t)*.5+.5;v=v<=0?0:v>=1?255:(v*255)|0}d[i*4+3]=v}G.mc.putImageData(G.md,0,0);return G.mk}
const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
function startTransition(ctx,V,from,toFeats){const sp=typeof histStorySpeed!=="undefined"?histStorySpeed:1;
 const t0=performance.now(),B=layerFor(toFeats,V,from.R,null),t1=performance.now(),G=analyse(from,B,V);(window.GF_HIST2_TT=window.GF_HIST2_TT||[]).push([Math.round(t1-t0),Math.round(performance.now()-t1),G?G.nch:0]);if(window.GF_HIST2_TT.length>50)window.GF_HIST2_TT.shift();if(!G){if(LAY!==B)putCv(from.cv);LAY=B;TR=null;return}
 const dur=histPlaying?Math.max(260,Math.min(900,(420+G.Tmax*2.2)/Math.sqrt(sp))):window.HIST_DRAG?220:tourOn()?Math.min(800,420+G.Tmax*2.2):340;
 if(!WORK)WORK=document.createElement("canvas");TR={A:from,B,G,t0:performance.now(),dur,work:WORK};from.busy=true}
function endTransition(){if(!TR)return;TR.A.busy=false;if(TR.A.cv!==TR.B.cv)putCv(TR.A.cv);if(LAY&&LAY!==TR.A&&LAY!==TR.B&&LAY.cv!==TR.B.cv)putCv(LAY.cv);LAY=TR.B;TR=null}
function drawTransition(ctx,V,alpha){const e=ease(Math.min(1,(performance.now()-TR.t0)/TR.dur)),A=TR.A,B=TR.B,G=TR.G;
 const[x,y]=layerXY(A,V,0),sx=Math.max(0,-x),sy=Math.max(0,-y),sw=Math.min(A.w-sx,V.cw-(x+sx)),sh=Math.min(A.h-sy,V.ch-(y+sy));if(sw<=0||sh<=0)return e;
 const wk=TR.work;if(wk.width!==sw||wk.height!==sh){wk.width=sw;wk.height=sh}const c=wk.getContext("2d");c.globalCompositeOperation="source-over";c.clearRect(0,0,sw,sh);c.drawImage(B.cv,sx,sy,sw,sh,0,0,sw,sh);
 c.globalCompositeOperation="destination-in";c.imageSmoothingEnabled=true;c.drawImage(maskAt(G,e),-sx,-sy,A.w,A.h);c.globalCompositeOperation="source-over";
 ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=alpha;ctx.drawImage(A.cv,sx,sy,sw,sh,x+sx,y+sy,sw,sh);ctx.drawImage(wk,x+sx,y+sy);ctx.restore();return e}

/* ---------- names ---------- */
const LBL=new Map;let MC=null;
function labelSet(feats,V,p,gv,LM){DBG.label++;const k=gv.ls?gv.ls():1,placed=[],out=[],ctr=V.flat?null:V.ctr,c=MC||(MC=document.createElement("canvas").getContext("2d"));
 labList(feats).forEach(([gid,nm,lon,lat,area,_a,b,people,T])=>{if(ctr&&d3.geoDistance([lon,lat],ctr)>1.35)return;const q=p([lon,lat]);if(!q||!isFinite(q[0]))return;
  const fs=(area>600?14:area>150?12.5:11)*k;c.font=(people?"italic 700 ":"800 ")+fs+"px 'Nunito Sans', system-ui, sans-serif";const w=c.measureText(nm).width;
  let sw=0;if(b){const my=(b[0][1]+b[1][1])/2,a0=p([b[0][0],my]),a1=p([b[1][0],my]);sw=a0&&a1?Math.abs(a1[0]-a0[0]):0}
  /* well-known names come first and need less room; the others must fit inside their place */
  const need=T>=3?0:T===2?(LM==="all"?.12:.35):LM==="all"?(people?.9:.6):(people?1.5:.95);if(b&&sw<w*need)return;
  /* a well-known name that is crowded out may sit just above or below its place */
  for(const dy of T>=2?[0,-fs*1.15,fs*1.15]:[0]){const bx=[q[0]-w/2-2,q[1]+dy-fs*.62,q[0]+w/2+2,q[1]+dy+fs*.62];if(placed.some(o=>!(bx[2]<o[0]||bx[0]>o[2]||bx[3]<o[1]||bx[1]>o[3])))continue;placed.push(bx);
   out.push({nm,lon,lat,font:c.font,people,dy});break}});out.k=k;return out}
function drawLabels(ctx,p,set,alpha,skip){ctx.save();ctx.textAlign="center";ctx.textBaseline="middle";ctx.lineWidth=3;ctx.globalAlpha=alpha;
 set.forEach(o=>{if(skip&&skip.has(o.nm))return;const q=p([o.lon,o.lat]);if(!q||!isFinite(q[0]))return;ctx.font=o.font;ctx.strokeStyle="rgba(255,255,255,.85)";const nm=String(o.nm).replace(/\s*\((?:c\.\s*)?\d{1,4}(?:\s*(?:BC|AD))?\s*[–-]\s*(?:\d{1,4}(?:\s*(?:BC|AD))?)?\)\s*$/,"");ctx.strokeText(nm,q[0],q[1]+o.dy);ctx.fillStyle=o.people?"#6b5a45":"#2a2118";ctx.fillText(nm,q[0],q[1]+o.dy)});ctx.restore()}
function labelsFor(feats,V,p,gv,LM,zooming){const key=[feats._id,V.key,LM,fxKey()].join("#");let o=LBL.get(feats._id+"#"+LM+"#"+fxKey());
 if(o&&(o.key===key||zooming&&V.flat&&Math.abs(o.set.k/(gv.ls?gv.ls():1)-1)<.12))return o.set;const set=labelSet(feats,V,p,gv,LM);if(LBL.size>6)LBL.clear();LBL.set(feats._id+"#"+LM+"#"+fxKey(),{key,set});return set}
/* drawing on the globe and the flat map */
W("histGlobeDraw",(ctx,p,gv)=>{if(!histOn()||!gv||gv!==amGlobe)return;const t0=performance.now();const feats=frame(),V=viewOf(ctx,p,gv);let alpha=1;try{if(typeof histReliefOn==="function"&&histReliefOn())alpha=window.gfHR?gfHR.alpha():.55}catch(e){}
 const now=performance.now();if(V.flat&&V.S!==lastS){lastS=V.S;lastSAt=now}const zooming=V.flat&&now-lastSAt<160;
 /* a transition is dropped when the view changes under it (the new map is then simply shown) */
 if(TR&&(TR.A.key!==V.key||TR.A.fx!==fxKey()||V.flat&&(V.ks.length>1||!inside(needRect(V),TR.A.R))))endTransition();
 let shown=feats,e=1;
 if(TR){e=drawTransition(ctx,V,alpha);shown=TR.B.feats;if(e>=1)endTransition();gv.request()}
 else if(V.flat){const L=LAY;
  const ok=L&&L.key===V.key&&L.fx===fxKey()&&inside(needRect(V),L.R);
  if(ok&&L.feats!==feats){startTransition(ctx,V,L,feats);if(TR){e=drawTransition(ctx,V,alpha);shown=TR.B.feats;gv.request()}else blit(ctx,LAY,V,alpha)}
  else if(ok)blit(ctx,L,V,alpha);
  else if(zooming&&L&&L.feats===feats&&L.fx===fxKey()&&L.key.split("|").slice(2).join()===V.key.split("|").slice(2).join()&&V.S/L.S>.5&&V.S/L.S<2){blitScaled(ctx,L,V,alpha);clearTimeout(crispT);crispT=setTimeout(()=>gv.request(),180)}
  else{LAY=layerFor(feats,V,null,L&&!L.busy?L:null);blit(ctx,LAY,V,alpha)}}
 else{/* the globe: drawn straight onto the map while it turns; a change of borders on a still globe is a transition */
  const G0=GLB;if(G0&&G0.key===V.key&&G0.fx===fxKey()&&G0.feats!==feats){startTransition(ctx,V,layerFor(G0.feats,V,null,null),feats);if(TR){e=drawTransition(ctx,V,alpha);shown=TR.B.feats;gv.request()}}
  /* see-through (over the relief): drawn whole into a picture first, so overlapping shapes do not add up */
  if(!TR){if(alpha<1){GOFF=layerFor(feats,V,null,GOFF);blit(ctx,GOFF,V,alpha)}else{ctx.save();ctx.globalAlpha=alpha;paint(ctx,feats,V);ctx.restore()}}}
 if(!V.flat)GLB={key:V.key,feats:shown,fx:fxKey()};
 if(histHotI!=null&&feats[histHotI]&&!TR){const path=d3.geoPath(p,ctx);ctx.save();ctx.beginPath();path(feats[histHotI]);ctx.lineWidth=2;ctx.strokeStyle="#fff";ctx.stroke();ctx.restore()}
 /* names: well-known places first; "Main" names the others only when the name fits inside them on the screen, "All"
    names everything that has room, "Off" leaves names to the hover */
 const LM=labMode();if(LM!=="off"){if(TR){const a=labelsFor(TR.A.feats,V,p,gv,LM,true),b=labelsFor(TR.B.feats,V,p,gv,LM,true);const an=new Set(a.map(o=>o.nm)),bn=new Set(b.map(o=>o.nm));
   drawLabels(ctx,p,a,1-e,bn);drawLabels(ctx,p,b,1,new Set([...bn].filter(n=>!an.has(n))));drawLabels(ctx,p,b.filter(o=>!an.has(o.nm)),e)}
  else drawLabels(ctx,p,labelsFor(shown,V,p,gv,LM,zooming))}
 window.GF_HIST2_LAST_MS=performance.now()-t0});
function labMode(){try{return localStorage.getItem("gfHistNames")||"main"}catch(e){return"main"}}
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-hnames]");if(!b)return;try{localStorage.setItem("gfHistNames",b.dataset.hnames)}catch(err){}document.querySelectorAll("[data-hnames]").forEach(x=>x.classList.toggle("on",x.dataset.hnames===b.dataset.hnames));LBL.clear();try{amGlobe.request()}catch(err){}try{if(!amGlobeOn())histRender()}catch(err){}});
/* the slider: dragging it shows every year it passes (the map follows with short transitions) */
document.addEventListener("pointerdown",e=>{if(!useNew()||!histOn()||e.button>0)return;const tr=e.target.closest&&e.target.closest(".hist-track.hist2");if(!tr)return;const r=tr.querySelector(".hist-range");if(!r)return;
 if(e.target.closest("[data-hy]")&&e.target!==r)return;e.stopPropagation();e.preventDefault();r.focus();histStop();const legend=document.getElementById("populationLegend");legend&&legend.classList.add("hist-dragging");window.HIST_DRAG=true;
 const at=x=>{const b=r.getBoundingClientRect();return Math.max(0,Math.min(1,(x-b.left)/b.width))*(N-1)};
 const mv=ev=>{const u=at(ev.clientX),y=yOfU(u);r.value=u;if(y!==curY)setYear(y,true)};const up=()=>{document.removeEventListener("pointermove",mv);document.removeEventListener("pointerup",up);document.removeEventListener("pointercancel",up);legend&&legend.classList.remove("hist-dragging");window.HIST_DRAG=false;setYear(curY)};
 document.addEventListener("pointermove",mv);document.addEventListener("pointerup",up);document.addEventListener("pointercancel",up);mv(e)},true);
/* clicks and keys on the timeline under the map (the legend has its own) */
document.addEventListener("click",e=>{if(!useNew()||!histOn())return;const d=e.target.closest&&e.target.closest(".hist-dock");if(!d)return;
 const t=e.target.closest("[data-hy]");if(t){histStop();histSet(+t.dataset.hy);return}const s=e.target.closest("[data-hstep]");if(s){histStop();stepBy(+s.dataset.hstep);return}if(e.target.closest(".hist-play")){histPlay();return}});
function stepBy(d){const i=posOf(curY);setYear(d>0?YEARS[Math.min(N-1,i+1)]:YEARS[YEARS[i]<curY?i:Math.max(0,i-1)])}
document.addEventListener("keydown",e=>{if(!useNew()||!histOn())return;const r=e.target.closest&&e.target.closest(".hist-track.hist2 .hist-range");if(!r)return;
 const k=e.key;if(k==="ArrowLeft"||k==="ArrowDown"){stepBy(-1)}else if(k==="ArrowRight"||k==="ArrowUp"){stepBy(1)}else if(k==="Home")setYear(YMIN);else if(k==="End")setYear(YMAX);else return;e.preventDefault();e.stopPropagation();histStop()},true);
/* when a tour hands the map back, show the new map at the year it was on */
try{const _pl=psLaunchTour;psLaunchTour=function(){if(!tourOn()&&IDX)preTourY=curY;return _pl.apply(this,arguments)}}catch(e){}
try{const _pe=psEnd;psEnd=function(){const y=preTourY!=null?preTourY:curY;preTourY=null;const r=_pe.apply(this,arguments);tourOld=false;try{if(IDX&&histOn()){histFocus=null;LAY=null;TR=null;setYear(y)}}catch(e){}return r}}catch(e){}
let wasNew=null;setInterval(()=>{const n=useNew();if(n!==wasNew){wasNew=n;if(n&&!tourOn()){histIdx=pos;histFocus=null}histShown=-1;FC.clear();LAY=null;TR=null;LBL.clear();try{if(histOn()){const legend=document.getElementById("populationLegend");if(legend)legend.innerHTML=histLegendHTML();if(!reqMap())histRender();dockSync()}}catch(e){}}if(!n){const d=document.querySelector(".hist-dock");if(d)d.remove()}},500);

/* ---------- a lighter frame for the whole map while it is dragged (history map only) ----------
   1. The map's size is worked out once per frame instead of a dozen times: each time it read the page layout, and the
      frame itself had just changed the map's style, so the browser laid the page out again and again.
   2. The modern country names (shown with the history map in recent years) need each country's box on the screen;
      on the flat map that box is the box at scale 1, scaled and shifted, so it is worked out once per country. */
const h2Map=g=>{try{return g===amGlobe&&useNew()&&histOn()}catch(e){return false}};
{const GP_=GlobeView.prototype,_r=GP_._render,_s=GP_.size;
 GP_._render=function(){if(!h2Map(this))return _r.apply(this,arguments);this._h2R=(this._h2R||0)+1;this._h2Sz=null;try{return _r.apply(this,arguments)}finally{this._h2R--;if(!this._h2R)this._h2Sz=null}};
 GP_.size=function(){if(this._h2R){const k=this._bigR?1:0,m=this._h2Sz&&this._h2Sz[k];if(m)return Object.assign({},m);const r=_s.apply(this,arguments);(this._h2Sz||(this._h2Sz=[]))[k]=Object.assign({},r);return r}return _s.apply(this,arguments)};
 const _l=GP_._labels;if(_l)GP_._labels=function(ctx,p){if(!h2Map(this)||!this._flat||this._gfOx||!p||!p._gfFlatP)return _l.apply(this,arguments);
  const dl=this._gfDl||0,C=pcFor(dl),S=p.scale(),t=p.translate(),gp=d3.geoPath;C.b=C.b||new WeakMap;
  d3.geoPath=function(proj,c){const r=gp.apply(this,arguments);if(proj===p&&!c){r.bounds=o=>{let u=o&&typeof o==="object"?C.b.get(o):null;if(!u){u=GP(C.unit).bounds(o);if(o&&typeof o==="object")C.b.set(o,u)}return[[u[0][0]*S+t[0],u[0][1]*S+t[1]],[u[1][0]*S+t[0],u[1][1]*S+t[1]]]}}return r};
  Object.keys(gp).forEach(k=>{try{d3.geoPath[k]=gp[k]}catch(e){}});
  try{return _l.apply(this,arguments)}finally{d3.geoPath=gp}}}

/* ================= the timeline on the map =================
   The year slider sits at the bottom of the map, in the middle, clear of the toolkit tray: narrower beside a folded
   tray, above an open one when there is no room beside it. On a phone it sits just under the map. */
function dockHost(){try{if(useNew()&&!tourOn()&&histOn()&&typeof amGlobe!=="undefined"&&amGlobe&&amGlobeOn()&&amGlobe.host&&amGlobe.host.isConnected&&appMode==="allmaps")return amGlobe.host}catch(e){}return null}
function dockSync(){const h=dockHost();let d=document.querySelector(".hist-dock");const legend=document.getElementById("populationLegend");
 if(!h){if(d)d.remove();if(legend)legend.classList.remove("hist-docked");document.querySelectorAll(".hd-over").forEach(x=>x.classList.remove("hd-over"));return}
 if(!d){d=document.createElement("div");d.className="hist-dock";d.innerHTML=`<div class="hd-year"></div>${barHTML()}`;["wheel","dblclick","touchstart","pointerdown","mousedown"].forEach(t=>d.addEventListener(t,e=>e.stopPropagation(),{passive:true}))}
 if(!d.parentNode)h.appendChild(d);if(legend)legend.classList.add("hist-docked");
 const y=d.querySelector(".hd-year");if(y&&y.textContent!==yLabel(curY))y.textContent=yLabel(curY);
 const r=d.querySelector(".hist-range");if(r&&!window.HIST_DRAG)r.value=uOf(curY);
 const pb=d.querySelector(".hist-play");if(pb&&pb.textContent!==playIco()){pb.textContent=playIco();pb.setAttribute("aria-label",playLab())}
 placeDock(d,h)}
function placeDock(d,h){const fs=document.body.classList.contains("gf-fs"),phone=innerWidth<=640;
 const hr=h.getBoundingClientRect();if(!hr.width)return;
 /* full screen: the timeline fills the strip along the bottom, under the toolkit and the GPS box */
 if(fs&&!phone){if(d.parentNode!==h)h.appendChild(d);d.classList.remove("hd-below");d.classList.add("hd-fs");d.style.position="fixed";d.style.width="calc(100vw - 16px)";d.style.left="8px";d.style.bottom="6px";d.style.marginLeft="";d.style.marginTop="";
  h.classList.remove("hd-over");return}
 d.classList.remove("hd-fs");d.style.position="";const cv=h.querySelector(".globe-stage canvas")||h.querySelector("canvas");const cr=cv?cv.getBoundingClientRect():hr;
 /* the map's own rectangle inside the host (the flat map can be narrower than the host) */
 const L0=Math.max(hr.left,cr.left),R0=Math.min(hr.right,cr.right),B0=Math.min(hr.bottom,cr.bottom),mid=(L0+R0)/2,want=Math.min(860,Math.max(260,R0-L0-24));
 /* outside full screen the timeline always sits just under the map, in one fixed place */
 if(false){if(d.parentNode!==h)h.appendChild(d);d.classList.remove("hd-below");const dh=d.offsetHeight||64;
  const obs=[...document.querySelectorAll(".gfk-tray, .gfk-coord, .globe-btns, .map-zoom-controls")].filter(x=>(h.contains(x)||getComputedStyle(x).position==="fixed")&&!d.contains(x)&&getComputedStyle(x).visibility!=="hidden").map(x=>x.getBoundingClientRect()).filter(r=>r.width&&r.height);
  let w=want,bottom=hr.bottom-B0+8,ok=true;
  for(let it=0;it<6;it++){let again=false;for(const r of obs){const top=hr.bottom-bottom-dh,bot=hr.bottom-bottom;if(r.bottom<top-2||r.top>bot+2)continue;if(r.right<mid-w/2-4||r.left>mid+w/2+4)continue;
    /* room beside it, with the slider still centred? */
    const half=(r.left+r.right)/2<mid?mid-r.right-8:r.left-8-mid,ww=Math.min(w,2*half);if(ww>=440){w=ww;continue}
    if(!fs){ok=false;break}bottom=hr.bottom-r.top+6;w=want;again=true;break}if(!ok||!again)break}
  if(ok){d.style.width=Math.round(w)+"px";d.style.left=Math.round(mid-hr.left-w/2)+"px";d.style.bottom=Math.round(bottom)+"px";d.style.marginLeft="";d.style.marginTop="";h.style.setProperty("--hd-space",Math.round(bottom+dh+8)+"px");h.classList.add("hd-over");return}}
 /* no room on the map: just under it */
 h.classList.remove("hd-over");if(d.previousElementSibling!==h)h.after(d);d.classList.add("hd-below");const pr=d.parentNode.getBoundingClientRect(),w=phone?pr.width:Math.min(want,pr.width);
 d.style.left=d.style.bottom="";d.style.width=Math.round(w)+"px";d.style.marginLeft=phone?"0px":Math.max(0,Math.round(mid-pr.left-w/2))+"px";
 /* buttons that hang below the map (phones) must not cover it */
 let mt=8;h.querySelectorAll(".globe-btns, .gfk-tray").forEach(x=>{const r=x.getBoundingClientRect();if(r.height&&r.bottom>hr.bottom&&getComputedStyle(x).position==="absolute")mt=Math.max(mt,Math.round(r.bottom-hr.bottom+8))});d.style.marginTop=mt+"px"}
addEventListener("resize",()=>{try{dockSync();freeCard(true)}catch(e){}});setInterval(()=>{try{if(histOn()&&useNew())dockSync();else{const d=document.querySelector(".hist-dock");if(d)d.remove()}}catch(e){}},400);
document.addEventListener("click",e=>{if(e.target.closest&&e.target.closest(".gfk-tab"))setTimeout(()=>{try{dockSync()}catch(err){}},30)});

/* ================= the story card: drag it anywhere in the window =================
   Grab its top (the handle, the period line or the year) and drop it anywhere on the page, also off the map; it stays
   fully on the screen and keeps its place while the page is open. */
const HS_KEY="gfHistCardPos";let cardPos=null;try{cardPos=JSON.parse(sessionStorage.getItem(HS_KEY)||"null");if(cardPos)histStoryFree={x:cardPos.x,y:cardPos.y}}catch(e){}
function placeFixed(p,x,y){const w=p.offsetWidth,h=Math.min(p.offsetHeight,innerHeight-8);x=Math.max(4,Math.min(innerWidth-w-4,x));y=Math.max(4,Math.min(innerHeight-h-4,y));
 p.classList.add("hs-free","hs-fixed");p.classList.remove("hs-below");p.style.right=p.style.bottom="auto";p.style.maxHeight=(innerHeight-8)+"px";p.style.left=x+"px";p.style.top=y+"px";
 /* a transformed ancestor would move a fixed card: correct for it */
 const r=p.getBoundingClientRect();if(Math.abs(r.left-x)>.5||Math.abs(r.top-y)>.5){p.style.left=(x+(x-r.left))+"px";p.style.top=(y+(y-r.top))+"px"}
 cardPos={x,y};try{histStoryFree={x,y}}catch(e){}}
function freeCard(save){const p=document.querySelector(".hist-story");if(!p||!cardPos||!useNew())return;if(!p.style.width)p.style.width=Math.min(330,innerWidth-16)+"px";placeFixed(p,cardPos.x,cardPos.y);if(save)try{sessionStorage.setItem(HS_KEY,JSON.stringify(cardPos))}catch(e){}}
try{histStorySetPos=function(x,y){const p=document.querySelector(".hist-story");if(!p)return;if(cardPos){placeFixed(p,cardPos.x,cardPos.y);return}const host=p.parentNode,hr=host&&host.getBoundingClientRect?host.getBoundingClientRect():{left:0,top:0};placeFixed(p,x+hr.left,y+hr.top)}}catch(e){}
document.addEventListener("pointerdown",e=>{const p=e.target.closest&&e.target.closest(".hist-story");if(!p||e.button>0||e.target.closest("button,a,input")||!e.target.closest(".hs-head, .hs-year"))return;
 e.preventDefault();e.stopPropagation();const c=p.getBoundingClientRect(),dx=e.clientX-c.left,dy=e.clientY-c.top;p.style.width=c.width+"px";p.classList.add("hs-dragging");try{p.setPointerCapture(e.pointerId)}catch(err){}
 const move=ev=>{placeFixed(p,ev.clientX-dx,ev.clientY-dy)};const up=()=>{document.removeEventListener("pointermove",move);document.removeEventListener("pointerup",up);document.removeEventListener("pointercancel",up);p.classList.remove("hs-dragging");freeCard(true)};
 document.addEventListener("pointermove",move);document.addEventListener("pointerup",up);document.addEventListener("pointercancel",up);move(e)},true);
/* double-click on its handle puts it back in its corner */
document.addEventListener("dblclick",e=>{const p=e.target.closest&&e.target.closest(".hist-story");if(!p||!e.target.closest(".hs-head"))return;cardPos=null;try{sessionStorage.removeItem(HS_KEY);histStoryFree=null}catch(err){}p.classList.remove("hs-free","hs-fixed");p.style.left=p.style.top=p.style.width=p.style.maxHeight="";try{histStorySync()}catch(err){}},true);

const st=document.createElement("style");st.textContent=`.hist-track.hist2 .hist-era{font-size:9.5px;white-space:nowrap;overflow:hidden;text-overflow:clip}.hist-track.hist2 .hist-tick span{white-space:nowrap}.hist-cap i{font-style:normal;font-weight:800}.hist-names{display:inline-flex;align-items:center;gap:3px;font-size:12px;font-weight:700;margin:2px 10px 4px 0;vertical-align:middle}.hist-names button{border:1px solid #c9bda6;background:#fffaf0;border-radius:999px;padding:1px 9px;font:700 11.5px system-ui;cursor:pointer;color:#4a3520}.hist-names button.on{background:#2f6fb0;border-color:#2f6fb0;color:#fff}body.dark .hist-names button:not(.on),body.sky-night .hist-names button:not(.on){background:#25304a;color:#e6edf7;border-color:#3a4a66}.hist-track.hist2 .hist-era:not(.on){opacity:.5}.hist-track.hist2 .hist-era.on{overflow:visible;z-index:2}
#populationLegend.hist-docked > .hist-bar{display:none !important}
.hist-dock{position:absolute;z-index:6;bottom:8px;left:50%;width:min(860px,calc(100% - 24px));box-sizing:border-box;display:flex;align-items:center;gap:6px;padding:0 10px 0 12px;border-radius:16px;background:rgba(255,253,247,.9);box-shadow:0 6px 20px rgba(20,30,50,.18);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);color:#1d2b3a;touch-action:none}
.hist-dock .hd-year{flex:none;min-width:66px;font:800 17px/1 'Baloo 2',system-ui,sans-serif;color:#13294b;text-align:center;font-variant-numeric:tabular-nums}
.hist-dock .hist-bar{flex:1;min-width:0;gap:6px}.hist-dock .hist-btn{width:30px;height:30px;font-size:16px}.hist-dock .hist-play{font-size:11px}
.hist-dock .hist-track{padding:16px 10px 20px}.hist-dock .hist-ticks{top:36px}.hist-dock .hist-tick span{font-size:10px}
.hist-dock.hd-fs{z-index:5;padding-left:18px;padding-right:18px}
.hist-dock.hd-below{position:relative;left:auto;bottom:auto;margin-top:8px;margin-bottom:2px;box-shadow:0 3px 12px rgba(20,30,50,.12)}
@media (max-width:640px){.hist-dock{padding:0 6px;border-radius:12px}.hist-dock .hd-year{min-width:50px;font-size:14px}.hist-dock .hist-btn{width:28px;height:28px}.hist-dock .hist-tick span{font-size:9px}}
.globe-host.hd-over > .hist-story:not(.hs-free){max-height:calc(100% - var(--hd-space,80px) - 60px) !important}
body .globe-host.hd-over.hd-over:has(> .hist-dock) #gfLearn{bottom:calc(var(--hd-space,80px) + 2px) !important}
body.sky-night .hist-dock{background:rgba(29,37,70,.92);color:#e6ebfa}body.sky-night .hist-dock .hd-year{color:#fff}
.hist-story.hs-fixed{position:fixed !important;z-index:61 !important;max-height:calc(100vh - 8px)}
.hist-story .hs-head{position:relative;padding-top:6px}
.hist-story .hs-grip{position:absolute;left:50%;top:-4px;width:40px;height:10px;margin-left:-20px;cursor:grab;background:radial-gradient(circle,#b9c3cd 1.6px,transparent 2px) 0 0/8px 5px;opacity:.9}
.hist-story .hs-head::before{display:none}
.hist-story .hs-head,.hist-story .hs-year{cursor:grab}`;document.head.appendChild(st);
window.GF_HIST2={usesNew:()=>useNew(),loading:()=>Object.keys(LOADING).length>0,years:YEARS,periods:PERIODS,go:y=>{const i=YEARS.findIndex(v=>v>=y);histSet(i<0?N-1:i)},year:()=>curY,setYear:y=>setYear(y),frame:()=>frame(),labels:()=>{const o=LBL.get(frame()._id+"#"+labMode()+"#"+fxKey());return o&&o.set},tr:()=>TR,imp:p=>impOf(p),focusInfo:()=>{const fr=frame();return{focus:histFocus,old:tourOld,y:curY,any:!!histFocus&&focusAny(fr),names:histFocus?[...new Set(fr.filter(f=>inFocus(f.properties)).map(f=>f.properties.n))].slice(0,6):[]}},featsAt:async y=>{for(let i=0;i<200&&!CH[chunkOf(y)];i++){need(y);await new Promise(r=>setTimeout(r,100))}return frameAt(y)||[]}};
})();
