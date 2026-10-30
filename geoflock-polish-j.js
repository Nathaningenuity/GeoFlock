/* GeoFlock polish J: the reviewer's must-fix (P1) items for tours not being reworked elsewhere.
   - borders, bprisoners, bcollapse: stops about today show today's History map (not 1914 / 1650 / AD 1000)
   - hsince91, biomes, crops, geopol: contradicting or garbled stats
   - langrel: date-proof Ethiopian calendar line (Ethiopia entered 2019 on 11 Sept 2026)
   - night: Greater Tokyo answer matches the stop and the 2025 UN figures
   - amigration: the locust stop frames the Caribbean end of the crossing clear of the card
   - geo: the three questions whose stops no longer exist use the replacements already written in geoflock-tourq.js
   - humans: five tour questions (it had none) */
(function(){
const def=(o,k,v)=>{try{Object.defineProperty(o,k,{value:v,writable:true,configurable:true,enumerable:true})}catch(e){o[k]=v}};
const st=(id,title)=>{try{return PS_TOURS[id].steps.find(s=>s.title===title)}catch(e){return null}};
const set=(id,title,f)=>{const s=st(id,title);if(s)try{f(s)}catch(e){console.error(e)}};
function patch(){
 /* ---------- history-map years for stops about today ---------- */
 const today=(id,titles,y)=>titles.forEach(t=>set(id,t,s=>{def(s,"sub",y||"2026")}));
 if(PS_TOURS.borders&&!PS_TOURS.borders.steps._polJ){PS_TOURS.borders.steps._polJ=1;
  today("borders",["Countries inside countries","Cut-off pieces","Landlocked","Disputed lands","Land nobody wants","Borders through living rooms","France’s longest border","The whisky war island","So close, never touching","A lake without a border"])}
 if(PS_TOURS.bprisoners&&!PS_TOURS.bprisoners.steps._polJ){PS_TOURS.bprisoners.steps._polJ=1;
  today("bprisoners",["America’s lucky geography","Europe’s rivers and harbours","Africa: bigger than it looks","India and Pakistan","Korea: Seoul within range","Latin America’s walls"],"2015")}
 if(PS_TOURS.bcollapse&&!PS_TOURS.bcollapse.steps._polJ){PS_TOURS.bcollapse.steps._polJ=1;
  set("bcollapse","Societies that succeeded",s=>def(s,"sub","1700"));
  today("bcollapse",["Hispaniola: one island, two paths","Australia: mining the soil"]);
  set("bcollapse","Hispaniola: one island, two paths",s=>{if(s.more&&!/newer surveys/i.test(s.more))def(s,"more",s.more+" Newer satellite surveys find more tree cover in Haiti than Diamond’s 1%, which counted only untouched forest.")})}
 /* ---------- contradictions and garbled stats ---------- */
 set("hsince91","Yugoslavia breaks apart",s=>def(s,"stat","The wars that broke up Yugoslavia, from 1991 to 2001, killed about 130,000 people: Europe’s deadliest conflict between 1945 and 2022"));
 set("biomes","Taiga",s=>{def(s,"stat",String(s.stat).replace("the biggest land biome","the biggest forest on Earth"))});
 set("crops","Crops far from home",s=>def(s,"stat","Most big crops are now grown mainly far from where they were first farmed: cassava came from the Amazon, but Nigeria grows the most"));
 set("geopol","Chokepoints",s=>def(s,"stat","A handful of narrow straits carry most of the world’s sea trade: close one and ships detour thousands of kilometres"));
 set("langrel","It isn’t 2026 everywhere",s=>def(s,"stat","Ethiopia’s calendar runs about seven to eight years behind the usual one; Nepal’s is about 57 years ahead"));
 /* ---------- framing ---------- */
 set("amigration","Locust swarms",s=>{def(s,"view",[-135,-5,25,38]);def(s,"_ff",1)});
 /* ---------- questions ---------- */
 try{const Q=typeof TOURQ!=="undefined"&&TOURQ;if(!Q)return;
  /* the biomes question that repeats the taiga claim */
  (Q.biomes&&[].concat(Q.biomes.mid||[],Q.biomes.recap||[])||[]).forEach(q=>{if(/biggest land biome/i.test(q.q||"")){q.q=q.q.replace(/biggest land biome/i,"biggest forest")}});
  /* Tokyo */
  (Q.night&&[].concat(Q.night.mid||[],Q.night.recap||[])||[]).forEach(q=>{const i=(q.o||[]).findIndex(o=>/37 million/.test(o));if(i>=0){q.o[i]="More than 30 million";if(q.why)q.why=q.why.replace(/37 million/g,"more than 30 million")}});
  /* geo: questions whose stops no longer exist take the replacements written in geoflock-tourq.js */
  if(Q.geo&&!Q.geo._polJ&&PS_TOURS.geo){Q.geo._polJ=1;const titles=new Set(PS_TOURS.geo.steps.map(s=>s.title));
   const R={mid:[{q:"Many maps draw Greenland as big as Africa. Its true size is close to which country?",o:["India","Australia","DR Congo","Brazil"],a:2,why:"The Mercator projection stretches lands far from the equator; Africa is about 14 times bigger than Greenland.",at:"Maps lie about size",st:"Maps lie about size",kc:"cd"},
     {q:"Which country has the summit farthest from Earth’s centre, beating Everest?",o:["Nepal","Ecuador","United States","Peru"],a:1,why:"Earth bulges at the equator, so Ecuador’s Chimborazo pokes furthest into space, though Everest is highest above sea level.",at:"Everest isn’t the tallest mountain",st:"Everest isn’t the tallest mountain",kc:"ec"},
     {q:"Lima, on Peru’s west coast, is further east than which city?",o:["Rio de Janeiro","Buenos Aires","Miami","São Paulo"],a:2,why:"South America sits far east of North America: fly due south from Miami and you miss almost all of it.",at:"South America is east of North America",st:"South America is east of North America",kc:"pe"}]};
   const ok=q=>!q.at||titles.has(q.at);let k=0;
   Q.geo.mid=(Q.geo.mid||[]).map(q=>{if(ok(q))return q;while(k<R.mid.length&&!titles.has(R.mid[k].at))k++;return k<R.mid.length?R.mid[k++]:q}).filter(ok)}
  /* humans: five questions */
  if(!Q.humans&&PS_TOURS.humans){const has=t=>PS_TOURS.humans.steps.some(s=>s.title===t);const M=[
    {q:"All wild lemurs live on which island?",o:["Borneo","Madagascar","Sri Lanka","New Guinea"],a:1,why:"About 100 kinds of lemur live on Madagascar and nowhere else in the wild.",at:"Lemur island",st:"Lemur island",kc:"mg"},
    {q:"Where was ‘Lucy’, the 3.2-million-year-old skeleton, found?",o:["South Africa","Kenya","Ethiopia","Tanzania"],a:2,why:"Lucy was found in 1974 at Hadar, in Ethiopia’s Afar region.",at:"Standing up",st:"Standing up",kc:"et"},
    {q:"The 1.1-metre ‘hobbits’ (Homo floresiensis) lived on an island in which country?",o:["Philippines","Indonesia","Papua New Guinea","Malaysia"],a:1,why:"They lived on Flores, in Indonesia, until about 50,000 years ago.",at:"The hobbits",st:"The hobbits",kc:"id"}].filter(q=>has(q.at));
   const RC=[{q:"Chimpanzees and bonobos, our closest relatives, both live in which country?",o:["DR Congo","Nigeria","Indonesia","Brazil"],a:0,why:"Bonobos live only south of the Congo River, in DR Congo; chimpanzees live across much of central and west Africa, including DR Congo.",at:"Africa’s great apes",st:"Africa’s great apes",kc:"cd"},
    {q:"South America’s monkeys descend from ancestors that crossed which ocean?",o:["Pacific","Atlantic","Indian","Southern"],a:1,why:"Around 35–40 million years ago, African primates rafted across a much narrower Atlantic.",at:"Monkeys on rafts",st:"Monkeys on rafts",kc:"br"}].filter(q=>has(q.at));
   if(M.length)Q.humans={mid:M,recap:RC}}}catch(e){console.error(e)}}
patch();[1500,5000,12000].forEach(ms=>setTimeout(patch,ms));
})();
