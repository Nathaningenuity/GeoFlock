/* GeoFlock: Models. Three things:
   1. The Guided tours page opens with a "Suggested" path through the six tours on the home page hero
      (Geography → Population → Tectonics → Climate → Explorers → History). A newcomer sees the numbered path; someone who
      has started a tour sees "Continue: <tour>, stop N of M" first, then the next unfinished tour on the path.
   2. The Simulations and Diagrams galleries leave the Tours page (the "Diagrams & simulations" pane and its jump button)
      and become "Models", a new subject tab in Study & Quiz after "Other". Diagrams inside tour stops are untouched:
      only the Tours page's gallery HTML is switched off while that page renders.
   3. A Models browser: every simulation and diagram (every DG_ORDER entry the galleries showed), with a search box and
      topic chips. It sits inline in the Study & Quiz › Models tab and opens as a list from a new "Models" slot in the map
      Toolkit. Picking a model opens it, fully working, in one small floating panel (drag it by its top bar, × or Esc to
      close) that sits over the map, full screen and tours included, or over the Study page. The model is the very same
      DG figure the galleries and tour cards draw (dgFigure), so its drags, buttons and hover tips work as they do there.
   A patch file: it wraps renderToursView, goToursPane, switchAppMode, renderActiveView and renderTriviaView after load,
   and adds to the Study & Quiz subject tabs and the Toolkit tray by watching the DOM. Safe to run twice. */
(function(){
if(window.gfModels)return;
if(typeof DG==="undefined"||typeof DG_ORDER==="undefined"||typeof dgFigure!=="function")return;
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const simKeys=()=>{try{return SIM_KEYS}catch(e){return[]}};
const isSim=k=>simKeys().includes(k);

/* ================= the models: topics and one-line descriptions ================= */
const CATS=[["sky","Earth & sky","🌍"],["land","Land & rock","⛰️"],["water","Water & ice","🌊"],["climate","Weather & climate","⛅"],["life","Living world","🦜"],
 ["people","People & cities","🏙️"],["money","Money & trade","🚢"],["history","History & politics","🏛️"],["maps","Maps & measuring","📐"],["other","Other","✨"]];
const CAT={
 seasons:"sky",sunangle:"sky",worldclock:"sky",coriolis:"sky",tides:"sky",stars:"sky",earthday:"sky",
 hypso:"land",tallest:"land",islands:"land",plates:"land",platebound:"land",hawaii:"land",quake:"land",epicentre:"land",geology:"land",volcano:"land",rockcycle:"land",tsunami:"land",pangaea:"land",supercont:"land",
 waterball:"water",water:"water",slr:"water",depth:"water",lakesvol:"water",lakearea:"water",amazon:"water",antslice:"water",eurivers:"water",meander:"water",nileflow:"water",oceanph:"water",deadzone:"water",humsea:"water",
 rainshadow:"climate",monsoon:"climate",co2:"climate",hurricane:"climate",deserts:"climate",climb:"climate",norwayev:"climate",
 deadly:"life",wallace:"life",islkrak:"life",islbeak:"life",islrule:"life",prodes:"life",fishery:"life",
 populous:"people",landpeople:"people",dtm:"people",fertgdp:"people",agefert:"people",doubling:"people",indiatfr:"people",pyramid:"people",megacities:"people",detroit:"people",citymodels:"people",ranksize:"people",urbgdp:"people",
 farmgdp:"money",scatter:"money",hdigdp:"money",vonthunen:"money",gravity:"money",weber:"money",panama:"money",gmcrops:"money",hearths:"money",boxes:"money",growth:"money",chokes:"money",
 juntas:"history",empires:"history",silkroad:"history",nukes:"history",h2cost:"history",h2un:"history",shrink:"history",libyaflag:"history",apportion:"history",cleopatra:"history",humtime:"history",
 mercator:"maps",tissot:"maps",polaris:"maps"};
/* a model nobody has filed yet goes by the words in its title, then by the topic its own file gave it */
const GUESS=[["sky",/\b(sun|moon|star|season|day|night|clock|time zone|orbit|tide|planet)/i],["climate",/\b(rain|wind|storm|hurricane|climate|weather|monsoon|desert|warm|cold|co₂|carbon)/i],
 ["water",/\b(sea|ocean|river|lake|water|ice|glacier|flood|wave)/i],["land",/\b(plate|volcan|quake|rock|mountain|island|continent|fault|cave)/i],["life",/\b(animal|bird|fish|forest|tree|species|finch|life)/i],
 ["people",/\b(people|population|cit(y|ies)|birth|migrat|famil)/i],["money",/\b(gdp|trade|money|farm|crop|ship|factor|rich|poor)/i],["history",/\b(war|empire|nuclear|army|countr(y|ies)|century|ancient|flag)/i],["maps",/\b(map|projection|latitude|longitude|scale|measure)/i]];
const DGCAT={earth:"sky",climate:"climate",plates:"land",water:"water",people:"people",econ:"money",maps:"maps"};
function catOf(k){if(CAT[k])return CAT[k];const D=DG[k]||{},t=D.title||"";for(const [c,re] of GUESS)if(re.test(t))return c;return DGCAT[D.cat]||"other"}
const DESC={
 waterball:"All the water on Earth gathered into one ball, next to the planet.",water:"How much of Earth’s water is sea, ice, groundwater, lakes and rivers.",
 slr:"Which ice sheets would add how many metres if they all melted.",depth:"From the shelf to the trenches: how deep the ocean really goes.",
 lakesvol:"Lake Baikal holds more water than the next five lakes together.",amazon:"The rivers that carry the most water to the sea, to scale.",
 antslice:"A cut through Antarctica: kilometres of ice on top of the rock.",hypso:"How much of the Earth’s surface sits at each height and depth.",
 tallest:"Everest, Mauna Kea or Chimborazo: it depends what you measure from.",islands:"The world’s biggest islands side by side, at the same scale.",
 plates:"How many centimetres a year each plate moves.",hawaii:"A hot spot stays put while the plate slides over it, island by island.",
 quake:"Each step up the magnitude scale is about 32 times more energy.",earthday:"Squeeze 4.5 billion years into one day and see when everything arrived.",
 mercator:"How much Mercator’s map blows up countries far from the equator.",populous:"The countries with the most people, as bars.",
 landpeople:"Each continent’s share of the land set against its share of the people.",dtm:"The five stages: birth and death rates falling as a country develops.",
 fertgdp:"Every country plotted: income against children per woman.",agefert:"Countries with young people have the biggest families.",
 urbgdp:"Every country plotted: income against how many live in cities.",farmgdp:"Every country plotted: income against how many work on farms.",
 scatter:"Every country plotted: income against life expectancy.",hdigdp:"Every country plotted: income against the Human Development Index.",
 vonthunen:"Rings of farming around a market town, set by the cost of transport.",citymodels:"Concentric rings, sectors and many nuclei: three ways a city grows.",
 ranksize:"The second city is half the first, the third a third… unless one city dominates.",weber:"Put the factory where the cost of moving materials and goods is lowest.",
 prodes:"Brazil’s Amazon forest cleared year by year, from satellite counts.",norwayev:"How quickly Norway switched its new cars to electric.",
 indiatfr:"Children per woman across India’s states, from 1.6 to 3.",apportion:"Which US states gained and lost seats in Congress in 2020.",
 lakearea:"The Caspian Sea against the next four biggest lakes.",deadly:"Mosquitoes, snakes, dogs… and sharks: deaths caused each year.",
 eurivers:"Europe’s longest rivers, from the Volga down.",juntas:"Years each South American country spent under military rule.",
 megacities:"The world’s biggest cities by the UN’s 2025 count.",detroit:"Detroit’s population from its peak in 1950 to today.",
 panama:"New York to San Francisco: round Cape Horn or through the Panama Canal.",deserts:"The biggest deserts, cold ones included.",
 cleopatra:"Cleopatra lived nearer to the Moon landing than to the pyramids being built.",hearths:"Where and when farming began, hearth by hearth.",
 gmcrops:"How much US corn, soy and cotton is grown from GM seed.",seasons:"Change the date and latitude: watch the daylight and the seasons change.",
 rainshadow:"Wind meets a mountain: rain on one side, desert on the other.",worldclock:"A live clock for cities around the world, with day and night.",
 sunangle:"The same sunlight spread thin near the poles and strong at the tropics.",monsoon:"Land heats faster than sea: watch the monsoon wind switch round.",
 platebound:"Plates pulling apart, pushing together and sliding past.",wallace:"Lower the sea and see which islands join up, and where the animals change.",
 pyramid:"Change birth and death rates and watch the population pyramid change.",coriolis:"Why winds curve on a spinning Earth.",
 tides:"The Moon pulls the sea into two bulges, so there are two tides a day.",co2:"Add carbon dioxide and see how much warmer the Earth gets.",
 epicentre:"Three seismographs, three circles: find where the quake was.",tissot:"The same circle drawn on two map projections.",
 geology:"Cut into the Earth: crust, mantle, outer and inner core.",volcano:"Runny or sticky magma: why some volcanoes ooze and others explode.",
 hurricane:"Warm sea, damp air and spin: give a hurricane what it needs.",rockcycle:"Take a rock through melting, weathering and squeezing.",
 meander:"Watch a river bend, loop and cut off an oxbow lake.",nileflow:"The Nile’s flood through the year, before and after the Aswan Dam.",
 tsunami:"A tsunami slows and rears up as the sea gets shallow.",stars:"How light pollution hides the stars where you live.",
 boxes:"Container ships from 58 boxes in 1956 to 24,000 today.",polaris:"The Pole Star’s height above the horizon gives your latitude.",
 fishery:"Set the catch: fish for ever, or fish the stock out.",oceanph:"More carbon dioxide in the air makes the sea more acidic.",
 deadzone:"Fertiliser washes into the sea and leaves it without oxygen.",empires:"The biggest empires in history, drawn to scale.",
 silkroad:"Follow silk from China to Rome and watch the price climb.",nukes:"How many nuclear weapons each country had, year by year.",
 climb:"Climb a mountain: the air gets colder and thinner.",growth:"Grow 2% or 7% a year and see how fast a poor country catches up.",
 chokes:"Close a strait and see which ships get stuck and how far round they go.",libyaflag:"Libya’s flag before and after 2011.",
 shrink:"Countries in Europe losing people since 1990.",pangaea:"Move the continents from Pangaea to today.",supercont:"Where the continents may meet in 250 million years.",
 humsea:"Drag the sea level and watch land bridges open for early humans.",humtime:"Which kinds of human were alive at the same time.",
 islkrak:"Krakatoa after 1883: plants and animals come back.",islbeak:"A drought on the Galápagos changes the finches’ beaks.",
 islrule:"On islands, big animals shrink and small ones grow.",h2cost:"The dead of World War II, country by country.",
 h2un:"The United Nations filling up with newly independent countries.",gravity:"Big, close cities pull more trade and travel between them.",
 doubling:"How many years a population takes to double at each growth rate."};
function descOf(k){const D=DG[k]||{};return DESC[k]||(isSim(k)?"A working model: drag it and see what changes.":"A diagram from the tours"+(D.src?": "+String(D.src).replace(/<[^>]*>/g,""):"."))}
function models(){const L=[];const seen=new Set();DG_ORDER.forEach(k=>{if(DG[k]&&!seen.has(k)){seen.add(k);L.push(k)}});return L}

/* where a model also appears in a tour stop */
function usesOf(key){const out=[];try{Object.entries(PS_DIAG).forEach(([s,k])=>{if(String(k).split(":")[0]!==key)return;const i=s.indexOf("|"),t=s.slice(0,i),title=s.slice(i+1),T=PS_TOURS[t];if(!T)return;const at=(T.steps||[]).findIndex(x=>x.title===title);if(at>=0)out.push({t,at,title,T})})}catch(e){}return out.slice(0,3)}

/* ================= styles ================= */
const css=document.createElement("style");css.id="gfModelsCss";css.textContent=`
/* --- the Suggested path on the Tours page --- */
.gfm-sug{ margin:6px 0 22px; }
.gfm-sug .tr-sec-h{ margin-bottom:8px; }
.gfm-row{ display:flex; align-items:stretch; gap:4px; overflow-x:auto; padding:4px 2px 8px; scrollbar-width:thin; }
.gfm-arr{ flex:none; align-self:center; font-size:15px; font-weight:800; opacity:.45; }
.gfm-tc{ flex:1 1 0; min-width:108px; max-width:210px; display:flex; flex-direction:column; text-align:left; padding:0; border:2px solid #fff; border-radius:16px; overflow:hidden; background:#fff; color:#1d2a3a; cursor:pointer; font:inherit; box-shadow:0 4px 14px rgba(20,40,70,.12); position:relative; transition:transform .15s, box-shadow .15s; }
.gfm-tc:hover{ transform:translateY(-3px); box-shadow:0 10px 22px rgba(20,40,70,.18); }
.gfm-tc:focus-visible{ outline:3px solid var(--tc,#2b7bb5); outline-offset:2px; }
.gfm-pic{ position:relative; aspect-ratio:16/10; background:color-mix(in srgb,var(--tc,#2b7bb5) 30%,#dfe8ef); }
.gfm-pic img{ width:100%; height:100%; object-fit:cover; display:block; }
.gfm-num{ position:absolute; left:7px; top:7px; width:26px; height:26px; border-radius:50%; background:var(--tc,#2b7bb5); color:#fff; font:800 14px/26px Inter,system-ui,sans-serif; text-align:center; box-shadow:0 2px 6px rgba(0,0,0,.3); border:2px solid #fff; }
.gfm-tick{ position:absolute; right:7px; top:7px; width:26px; height:26px; border-radius:50%; background:#2e9b55; color:#fff; font:900 15px/26px system-ui,sans-serif; text-align:center; border:2px solid #fff; box-shadow:0 2px 6px rgba(0,0,0,.3); }
.gfm-tx{ padding:8px 10px 10px; display:flex; flex-direction:column; gap:3px; flex:1; }
.gfm-tx b{ font-size:14.5px; line-height:1.2; }
.gfm-tx small{ font-size:12px; opacity:.72; line-height:1.3; }
.gfm-bar{ height:4px; border-radius:3px; background:rgba(20,40,70,.1); overflow:hidden; margin-top:auto; }
.gfm-bar i{ display:block; height:100%; background:var(--tc,#2b7bb5); }
.gfm-tc.done{ opacity:.82; } .gfm-tc.done .gfm-tx small{ color:#2e7a48; opacity:1; font-weight:700; }
.gfm-cont{ flex:2 1 0; max-width:420px; min-width:250px; flex-direction:row; }
.gfm-cont .gfm-pic{ width:40%; aspect-ratio:auto; flex:none; }
.gfm-cont .gfm-tx{ justify-content:center; gap:5px; }
.gfm-cont .gfm-bar{ margin-top:4px; }
.gfm-cont .gfm-k{ font-size:11px; font-weight:800; letter-spacing:.04em; text-transform:uppercase; color:var(--tc,#2b7bb5); }
.gfm-cont .gfm-go{ align-self:flex-start; margin-top:4px; padding:5px 12px; border-radius:999px; background:var(--tc,#2b7bb5); color:#fff; font-size:12.5px; font-weight:800; }
.gfm-next .gfm-k{ font-size:11px; font-weight:800; letter-spacing:.04em; text-transform:uppercase; opacity:.6; }
.gfm-dots{ display:flex; gap:6px; flex-wrap:wrap; align-items:center; margin:4px 4px 0; font-size:12px; opacity:.85; }
.gfm-dots button{ font:700 12px Inter,system-ui,sans-serif; border:1.5px solid var(--tc); color:inherit; background:transparent; border-radius:999px; padding:2px 9px; cursor:pointer; }
.gfm-dots button.done{ background:var(--tc); color:#fff; }
.gfm-dots button.on{ box-shadow:0 0 0 2px color-mix(in srgb,var(--tc) 35%,transparent); }
body:not(.light-theme) .gfm-tc{ background:#1f2a3d; color:#e8eef8; border-color:#2c3a52; }
body:not(.light-theme) .gfm-bar{ background:rgba(255,255,255,.14); }
body:not(.light-theme) .gfm-tc.done .gfm-tx small{ color:#7fd39b; }
@media (max-width:640px){ .gfm-tc{ min-width:128px; flex:none; width:44vw; } .gfm-cont{ width:86vw; max-width:none; } }

/* --- the Models browser (Study & Quiz tab and the Toolkit list) --- */
.gfm-br{ max-width:1000px; margin:0 auto; padding:0 12px 40px; }
.gfm-br-h{ text-align:center; margin:2px 0 12px; } .gfm-br-h p{ margin:0; opacity:.72; font-size:14px; }
.gfm-tools{ display:flex; flex-direction:column; gap:8px; align-items:center; margin:0 0 12px; }
.gfm-q{ font:inherit; font-size:14px; padding:8px 14px; border-radius:999px; border:1px solid rgba(0,0,0,.18); width:min(420px,100%); background:#fff; color:#1d2433; }
.gfm-chips{ display:flex; flex-wrap:wrap; gap:6px; justify-content:center; }
.gfm-chips button{ font:600 12.5px Inter,system-ui,sans-serif; display:inline-flex; gap:5px; align-items:center; padding:5px 11px; border-radius:999px; border:1px solid rgba(20,40,70,.16); background:rgba(255,255,255,.75); color:#1d2a3a; cursor:pointer; }
.gfm-chips button b{ font-weight:600; opacity:.55; font-size:11px; }
.gfm-chips button.on{ background:#1f6f5c; border-color:#1f6f5c; color:#fff; } .gfm-chips button.on b{ opacity:.8; }
.gfm-count{ text-align:center; font-size:12.5px; opacity:.65; margin:0 0 10px; }
.gfm-grid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(230px,1fr)); gap:10px; }
.gfm-card{ display:flex; gap:10px; align-items:center; text-align:left; font:inherit; color:#1d2a3a; padding:8px 10px 8px 8px; border-radius:14px; border:1px solid rgba(20,40,70,.08); background:rgba(255,255,255,.88); box-shadow:0 2px 8px rgba(20,40,70,.07); cursor:pointer; transition:transform .12s, box-shadow .12s; }
.gfm-card:hover{ transform:translateY(-2px); box-shadow:0 8px 18px rgba(20,40,70,.14); }
.gfm-card:focus-visible{ outline:3px solid #2b7bb5; outline-offset:2px; }
.gfm-pv{ flex:none; width:74px; height:52px; border-radius:9px; background:#eef3f7; display:flex; align-items:center; justify-content:center; overflow:hidden; font-size:24px; position:relative; }
.gfm-pv svg{ width:100%; height:100%; display:block; pointer-events:none; }
.gfm-card[data-sim="1"] .gfm-pv::after{ content:"▶"; position:absolute; right:3px; bottom:3px; width:15px; height:15px; border-radius:50%; background:#e8701a; color:#fff; font-size:8px; line-height:15px; text-align:center; }
.gfm-ct{ min-width:0; display:flex; flex-direction:column; gap:2px; }
.gfm-ct b{ font-size:13.5px; line-height:1.25; }
.gfm-ct small{ font-size:12px; line-height:1.3; opacity:.72; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.gfm-ct em{ font-style:normal; font-size:10.5px; font-weight:800; letter-spacing:.03em; text-transform:uppercase; opacity:.55; }
.gfm-ct em.sim{ color:#c75c12; opacity:1; }
.gfm-none{ text-align:center; opacity:.65; padding:24px 0; grid-column:1/-1; }
body:not(.light-theme) .gfm-card{ background:rgba(31,42,61,.92); color:#e8eef8; border-color:#2c3a52; }
body:not(.light-theme) .gfm-pv{ background:#e9eef4; }
body:not(.light-theme) .gfm-chips button{ background:rgba(31,42,61,.85); color:#e8eef8; border-color:#33425c; }
body:not(.light-theme) .gfm-chips button.on{ background:#2a8a73; border-color:#2a8a73; }
body:not(.light-theme) .gfm-q{ background:#1f2a3d; color:#e8eef8; border-color:#3a4a66; }
body:not(.light-theme) .gfm-ct em.sim{ color:#ffab6b; }

/* the list, opened from the Toolkit */
.gfm-modal{ position:fixed; inset:0; z-index:9700; background:rgba(10,20,35,.45); display:flex; align-items:center; justify-content:center; padding:16px; }
.gfm-modal-in{ position:relative; width:min(940px,100%); max-height:min(86vh,900px); overflow:auto; border-radius:20px; background:#f7f9fc; color:#1d2a3a; box-shadow:0 20px 50px rgba(0,0,0,.35); padding:16px 6px 6px; overscroll-behavior:contain; }
.gfm-modal-in h2{ margin:0; font-size:22px; }
.gfm-modal .gfm-br{ padding-bottom:14px; }
.gfm-x{ position:absolute; right:10px; top:10px; width:34px; height:34px; border-radius:50%; border:0; background:rgba(20,40,70,.08); color:inherit; font:700 20px/1 system-ui,sans-serif; cursor:pointer; z-index:2; }
.gfm-x:hover{ background:rgba(20,40,70,.16); }
body:not(.light-theme) .gfm-modal-in{ background:#151d2b; color:#e8eef8; }
body:not(.light-theme) .gfm-x{ background:rgba(255,255,255,.1); }
@media (max-width:600px){ .gfm-modal{ padding:0; align-items:flex-end; } .gfm-modal-in{ width:100%; max-height:92vh; border-radius:18px 18px 0 0; } .gfm-grid{ grid-template-columns:1fr; } }

/* --- one model, in a floating panel (like the cross-section panel) --- */
.gfm-panel{ position:fixed; z-index:9600; width:min(540px, calc(100vw - 24px)); max-width:860px; max-height:calc(100vh - 20px); display:flex; flex-direction:column; background:#fff; color:#1d2433; border-radius:14px; box-shadow:0 10px 34px rgba(0,0,0,.3); font:13px/1.35 system-ui,sans-serif; overflow:hidden; }
.gfm-panel.wide{ width:min(860px, calc(100vw - 24px)); }
.gfm-ph{ display:flex; align-items:center; gap:8px; padding:7px 8px 7px 12px; cursor:move; user-select:none; touch-action:none; background:linear-gradient(#f4f7fb,#e9eef5); border-bottom:1px solid rgba(20,40,70,.08); }
.gfm-ph .gfm-grip{ width:18px; height:12px; flex:none; opacity:.35; background:radial-gradient(circle,currentColor 1.2px,transparent 1.6px) 0 0/6px 6px; }
.gfm-ph b{ flex:1; min-width:0; font-size:13.5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.gfm-ph small{ flex:none; font-size:10.5px; font-weight:800; text-transform:uppercase; letter-spacing:.03em; color:#c75c12; }
.gfm-ph button{ flex:none; width:28px; height:28px; border:0; border-radius:50%; background:rgba(20,40,70,.07); color:inherit; font:700 17px/1 system-ui,sans-serif; cursor:pointer; }
.gfm-ph button:hover{ background:rgba(20,40,70,.16); }
.gfm-pb{ overflow:auto; padding:8px 10px 10px; overscroll-behavior:contain; }
.gfm-pb .ps-dg{ margin:0; max-width:none; }
.gfm-pb .ps-dg > .ps-dg-h{ display:none; }
.gfm-pb .ps-dg-svg{ cursor:default; }
.gfm-pb .ps-dg-svg svg{ width:100%; height:auto; display:block; max-height:calc(100vh - 170px); }
.gfm-wait{ padding:28px 8px; text-align:center; opacity:.7; }
.gfm-uses{ display:flex; flex-wrap:wrap; gap:6px; margin-top:8px; align-items:center; font-size:12px; }
.gfm-uses span{ opacity:.6; }
.gfm-uses button{ font:600 12px Inter,system-ui,sans-serif; border:1.5px solid var(--tc,#2b7bb5); background:transparent; color:inherit; border-radius:999px; padding:3px 10px; cursor:pointer; }
.gfm-uses button:hover{ background:color-mix(in srgb,var(--tc,#2b7bb5) 14%,transparent); }
.gfm-panel.moving{ opacity:.93; box-shadow:0 16px 44px rgba(0,0,0,.36); }
body:not(.light-theme) .gfm-panel{ background:#1c2333; color:#e8ecf3; }
body:not(.light-theme) .gfm-ph{ background:linear-gradient(#253049,#1f2840); border-color:rgba(255,255,255,.08); }
body:not(.light-theme) .gfm-ph button{ background:rgba(255,255,255,.1); }
body:not(.light-theme) .gfm-ph small{ color:#ffab6b; }
@media (max-width:600px){
 .gfm-panel{ left:0 !important; right:0 !important; top:auto !important; bottom:0 !important; width:100% !important; max-width:none; max-height:72vh; border-radius:16px 16px 0 0; }
 .gfm-ph{ cursor:default; } .gfm-ph .gfm-wide{ display:none; }
}

/* --- the Toolkit slot and the Study & Quiz tab --- */
.gfk-slot.gfk-models{ cursor:pointer; }
.gfk-slot.gfk-models.gfk-active{ background:rgba(246,200,90,.18); box-shadow:inset 0 0 0 1.5px rgba(246,200,90,.6); }
`;
document.head.appendChild(css);

/* ================= 1. the Suggested path on the Tours page ================= */
const SUGG=[["geo","Geography"],["pop","Population"],["plates","Tectonics"],["climate","Climate"],["explorers","Explorers"],["hempires","History"]];
const prog=id=>{try{return(stats.tourProg||{})[id]||null}catch(e){return null}};
const stopsOf=id=>Math.max(1,(PS_TOURS[id].steps||[]).length-2);
const atOf=id=>{const p=prog(id);return p?Math.min(stopsOf(id),Math.max(0,p.max||0)):0};
const isDone=id=>{const p=prog(id);return!!(p&&p.done)};
const started=id=>{const p=prog(id);return!!(p&&!p.done&&(p.max||0)>0)};
function thumbOf(id){try{const T=typeof TOUR_THUMBS!=="undefined"?TOUR_THUMBS:{};return(id==="hempires"&&T.histmap)||T[id]||""}catch(e){return""}}
function tourName(id){const T=PS_TOURS[id]||{},s=SUGG.find(x=>x[0]===id);if(s)return s[1];const n=String(T.short||T.name||id).replace(/^guided tour (on|of)\s+/i,"");return n.charAt(0).toUpperCase()+n.slice(1)}
function lastOpen(){try{const P=stats.tourProg||{};let best=null;Object.keys(P).forEach(t=>{const p=P[t];if(p&&!p.done&&(p.max||0)>0&&PS_TOURS[t]&&PS_TOURS[t].group!=="aphg"&&(!best||(p.t||0)>(P[best].t||0)))best=t});return best}catch(e){return null}}
function stopTitle(id,at){try{const x=PS_TOURS[id].steps[at];return x&&x.title||""}catch(e){return""}}
function card(id,num,kind){const T=PS_TOURS[id],col=T.col||"#2b7bb5",done=isDone(id),at=atOf(id),n=stopsOf(id),th=thumbOf(id);
 const pct=done?100:Math.round(at/n*100);
 const hint=done?"✓ Finished":at>0?"Stop "+at+" of "+n:n+" stops";
 const resume=!done&&at>0?' data-gfm-at="'+at+'"':"";
 if(kind==="cont")return'<button type="button" class="gfm-tc gfm-cont" data-gfm-tour="'+id+'"'+resume+' style="--tc:'+col+'"><span class="gfm-pic">'+(th?'<img src="'+th+'" alt="" loading="lazy">':"")+'</span><span class="gfm-tx"><span class="gfm-k">Continue</span><b>'+esc(tourName(id))+', stop '+at+' of '+n+'</b>'+(stopTitle(id,at)?'<small>You were at: '+esc(stopTitle(id,at))+'</small>':"")+'<span class="gfm-bar"><i style="width:'+pct+'%"></i></span><span class="gfm-go">Continue →</span></span></button>';
 return'<button type="button" class="gfm-tc'+(done?" done":"")+(kind==="next"?" gfm-next":"")+'" data-gfm-tour="'+id+'"'+resume+' style="--tc:'+col+'" aria-label="'+esc(num+". "+tourName(id)+": "+hint)+'"><span class="gfm-pic">'+(th?'<img src="'+th+'" alt="" loading="lazy">':"")+'<span class="gfm-num">'+num+'</span>'+(done?'<span class="gfm-tick" aria-hidden="true">✓</span>':"")+'</span><span class="gfm-tx">'+(kind==="next"?'<span class="gfm-k">Next on the path</span>':"")+'<b>'+esc(tourName(id))+'</b><small>'+hint+'</small><span class="gfm-bar"><i style="width:'+pct+'%"></i></span></span></button>'}
function suggestedHTML(){const path=SUGG.filter(([id])=>PS_TOURS[id]);if(!path.length)return"";
 const any=Object.values((typeof stats!=="undefined"&&stats.tourProg)||{}).some(p=>p&&((p.max||0)>0||p.done));
 const cur=lastOpen(),ndone=path.filter(([id])=>isDone(id)).length;
 let row,sub;
 if(any&&cur){const nxt=path.find(([id])=>id!==cur&&!isDone(id));const ni=nxt?path.indexOf(nxt)+1:0;
  row=card(cur,0,"cont")+(nxt?'<span class="gfm-arr" aria-hidden="true">→</span>'+card(nxt[0],ni,"next"):"");
  sub="Pick up where you left off, then the next tour on the path";
  row+='</div><div class="gfm-dots" aria-label="The suggested path"><span>Path:</span>'+path.map(([id],i)=>'<button type="button" data-gfm-tour="'+id+'"'+(started(id)?' data-gfm-at="'+atOf(id)+'"':"")+' class="'+(isDone(id)?"done":"")+(id===cur?" on":"")+'" style="--tc:'+(PS_TOURS[id].col||"#2b7bb5")+'" title="'+esc(tourName(id)+(isDone(id)?": finished":started(id)?": stop "+atOf(id)+" of "+stopsOf(id):""))+'">'+(isDone(id)?"✓ ":(i+1)+" ")+esc(tourName(id))+'</button>').join("")+'<span>'+ndone+' of '+path.length+' done</span>'}
 else{row=path.map(([id],i)=>(i?'<span class="gfm-arr" aria-hidden="true">→</span>':"")+card(id,i+1)).join("");
  sub=ndone===path.length?"You’ve done the whole path: every tour below is yours to explore":any?ndone+" of "+path.length+" done. Carry on along the path":"New here? Six tours that cover the big picture, in this order"}
 return'<section class="gfm-sug" id="gfmSuggested" aria-label="Suggested tours"><div class="tr-sec-h"><h3>Suggested</h3><span>'+sub+'</span></div><div class="gfm-row">'+row+'</div></section>'}
function wireTours(root){root.querySelectorAll("[data-gfm-tour]").forEach(b=>b.onclick=()=>{const id=b.dataset.gfmTour,at=+b.dataset.gfmAt||0;try{psLaunchTour(id);if(at&&typeof toursResumeAt==="function")toursResumeAt(id,at)}catch(e){console.error(e)}})}
function addSuggested(){const v=document.getElementById("toursView"),w=v&&v.querySelector(".tr-wrap");if(!w)return;
 const old=w.querySelector("#gfmSuggested");if(old)old.remove();
 if(typeof hugTab!=="undefined"&&hugTab==="aphg")return;
 const html=suggestedHTML();if(!html)return;
 const hero=[...w.children].find(c=>c.classList.contains("tr-hero")&&!c.classList.contains("dg-head"));
 if(hero)hero.insertAdjacentHTML("afterend",html);else w.insertAdjacentHTML("afterbegin",html);
 wireTours(w.querySelector("#gfmSuggested"))}

/* ================= 2. the galleries leave the Tours page ================= */
function stripGalleries(){const v=document.getElementById("toursView");if(!v)return;
 v.querySelectorAll(".tp-tabs,.dg-head,.dg-jump,#dgGallery,#dgSims,.dg-gal").forEach(x=>x.remove());v.classList.remove("pane-diagrams")}
if(typeof renderToursView==="function"&&!renderToursView._gfm){
 const _r=renderToursView;
 renderToursView=function(){
  /* the gallery's HTML is not built at all for this page: no 86 figures drawn only to be hidden */
  const hadG=typeof dgGalleryHTML==="function",_g=hadG?dgGalleryHTML:null;window.trPane="tours";
  if(hadG)try{dgGalleryHTML=function(){return""}}catch(e){}
  let r;try{r=_r.apply(this,arguments)}finally{if(hadG)try{dgGalleryHTML=_g}catch(e){}}
  try{stripGalleries();addSuggested()}catch(e){console.error(e)}return r};
 renderToursView._gfm=1}
/* the old "Diagrams & simulations" pane now means Study & Quiz › Models */
if(typeof window.goToursPane==="function"&&!window.goToursPane._gfm){const _gp=window.goToursPane;window.goToursPane=function(p){if(p==="diagrams"){openTab();return}return _gp.apply(this,arguments)};window.goToursPane._gfm=1}
window.trPane="tours";

/* ================= 3a. the browser: search + topic chips + cards ================= */
const BS={q:"",cat:"all"};
function cardsHTML(list){if(!list.length)return'<p class="gfm-none">No model matches that. Try another word.</p>';
 return list.map(k=>{const D=DG[k],c=CATS.find(x=>x[0]===catOf(k))||CATS[CATS.length-1],s=isSim(k);
  return'<button type="button" class="gfm-card" data-gfm-model="'+k+'" data-sim="'+(s?1:0)+'" title="Open '+esc(D.title)+'"><span class="gfm-pv" data-pv="'+k+'" aria-hidden="true">'+c[2]+'</span><span class="gfm-ct"><em class="'+(s?"sim":"")+'">'+(s?"Simulation":"Diagram")+' · '+esc(c[1])+'</em><b>'+esc(D.title)+'</b><small>'+esc(descOf(k))+'</small></span></button>'}).join("")}
function filtered(){const q=BS.q.trim().toLowerCase(),words=q.split(/\s+/).filter(Boolean);
 return models().filter(k=>{if(BS.cat!=="all"&&catOf(k)!==BS.cat)return false;if(!words.length)return true;const hay=" "+((DG[k].title||"")+" "+descOf(k)+" "+k).toLowerCase().replace(/[^a-z0-9₂à-ÿ]+/g," ");return words.every(w=>hay.includes(" "+w.replace(/[^a-z0-9₂à-ÿ]+/g," ").trim()))})
  .sort((a,b)=>(isSim(b)?1:0)-(isSim(a)?1:0))}
function browserHTML(inModal){const L=models(),nS=L.filter(isSim).length;
 const counts={};L.forEach(k=>{const c=catOf(k);counts[c]=(counts[c]||0)+1});
 const chips='<button type="button" data-gfm-cat="all" class="'+(BS.cat==="all"?"on":"")+'">All <b>'+L.length+'</b></button>'+CATS.filter(([k])=>counts[k]).map(([k,n,ic])=>'<button type="button" data-gfm-cat="'+k+'" class="'+(BS.cat===k?"on":"")+'"><span aria-hidden="true">'+ic+'</span>'+esc(n)+' <b>'+counts[k]+'</b></button>').join("");
 return'<div class="gfm-br">'+(inModal?'<div class="gfm-br-h"><h2>Models</h2><p>'+nS+' simulations and '+(L.length-nS)+' diagrams. Pick one and it opens in a small window over the map.</p></div>':'<div class="gfm-br-h"><p>'+nS+' simulations to play with and '+(L.length-nS)+' diagrams from the tours. Pick one and it opens in a small window you can move.</p></div>')+
  '<div class="gfm-tools"><input type="search" class="gfm-q" placeholder="Search models: tides, volcano, population…" aria-label="Search models" value="'+esc(BS.q)+'"><div class="gfm-chips" role="toolbar" aria-label="Topics">'+chips+'</div></div><p class="gfm-count"></p><div class="gfm-grid"></div></div>'}
function fillGrid(root){const L=filtered(),g=root.querySelector(".gfm-grid");if(!g)return;g.innerHTML=cardsHTML(L);const c=root.querySelector(".gfm-count");if(c)c.textContent=L.length+(L.length===1?" model":" models");
 root.querySelectorAll("[data-gfm-cat]").forEach(b=>b.classList.toggle("on",b.dataset.gfmCat===BS.cat));lazyPreviews(g)}
function wireBrowser(root,onPick){fillGrid(root);
 const q=root.querySelector(".gfm-q");if(q)q.oninput=()=>{BS.q=q.value;clearTimeout(q._t);q._t=setTimeout(()=>fillGrid(root),120)};
 root.querySelectorAll("[data-gfm-cat]").forEach(b=>b.onclick=()=>{BS.cat=b.dataset.gfmCat;fillGrid(root)});
 root.addEventListener("click",e=>{const c=e.target.closest&&e.target.closest("[data-gfm-model]");if(c&&root.contains(c)){e.preventDefault();onPick(c.dataset.gfmModel)}})}

/* little previews: the model drawn once off-screen and copied as a still picture, only for cards that scroll into view
   and only for models that draw quickly (some are a whole world map: those keep their topic icon) */
const PV={},PV_SKIP=new Set(["tissot","waterball","islands","hypso","worldclock"]);
let pvIO=null,pvQ=[],pvBusy=false;
function pvMake(k){if(k in PV)return PV[k];PV[k]="";if(PV_SKIP.has(k))return"";
 const t0=performance.now();let html="";try{html=dgFigure(k)}catch(e){}if(!html||html.length>90000){if(performance.now()-t0>40)PV_SKIP.add(k);return""}
 const box=document.createElement("div");box.setAttribute("aria-hidden","true");box.style.cssText="position:fixed;left:-5000px;top:0;width:420px;visibility:hidden;pointer-events:none";box.innerHTML=html;document.body.appendChild(box);
 try{const svg=box.querySelector(".ps-dg svg"),f=box.querySelector(".ps-dg");if(svg&&f){svg.setAttribute("data-dgi","1");const D=DG[k];if(D&&D.init)try{D.init(svg,f.dataset.arg||"")}catch(e){}
   const cl=svg.cloneNode(true);cl.removeAttribute("data-dgi");cl.querySelectorAll("[data-drag],[data-act],[data-tip]").forEach(x=>{x.removeAttribute("data-drag");x.removeAttribute("data-act");x.removeAttribute("data-tip")});cl.setAttribute("preserveAspectRatio","xMidYMid meet");
   const s=new XMLSerializer().serializeToString(cl);if(s.length<160000)PV[k]=s}}catch(e){}
 box.remove();return PV[k]}
function pvPump(){if(pvBusy)return;pvBusy=true;const step=()=>{const t=performance.now();while(pvQ.length&&performance.now()-t<24){const el=pvQ.shift();if(!el.isConnected)continue;const s=pvMake(el.dataset.pv);if(s){el.innerHTML=s;el.classList.add("on")}}if(pvQ.length)setTimeout(step,30);else pvBusy=false};setTimeout(step,0)}
function lazyPreviews(g){if(!("IntersectionObserver" in window))return;if(!pvIO)pvIO=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){pvIO.unobserve(e.target);pvQ.push(e.target)}});pvPump()},{rootMargin:"120px"});
 g.querySelectorAll("[data-pv]").forEach(el=>{const k=el.dataset.pv;if(PV[k]){el.innerHTML=PV[k];return}if(PV_SKIP.has(k)||(k in PV))return;pvIO.observe(el)})}

/* ================= 3b. the Toolkit list (a modal) ================= */
function closeList(){document.querySelectorAll(".gfm-modal").forEach(m=>m.remove());const s=document.querySelector("#gfKit .gfk-models");if(s)s.classList.remove("gfk-active")}
function openList(){closeList();const m=document.createElement("div");m.className="gfm-modal";m.setAttribute("role","dialog");m.setAttribute("aria-modal","true");m.setAttribute("aria-label","Models");
 m.innerHTML='<div class="gfm-modal-in"><button type="button" class="gfm-x" aria-label="Close">×</button>'+browserHTML(true)+'</div>';document.body.appendChild(m);
 ["pointerdown","mousedown","wheel","dblclick","touchstart"].forEach(t=>m.addEventListener(t,e=>e.stopPropagation(),{passive:true}));
 m.addEventListener("click",e=>{if(e.target===m||e.target.closest(".gfm-x"))closeList()});
 wireBrowser(m,k=>{closeList();openModel(k)});const s=document.querySelector("#gfKit .gfk-models");if(s)s.classList.add("gfk-active");
 setTimeout(()=>{const q=m.querySelector(".gfm-q");if(q&&innerWidth>700)try{q.focus({preventScroll:true})}catch(e){}},30)}

/* ================= 3c. one model in a floating panel ================= */
let PANEL=null;const POS={};
function closeModel(){if(PANEL){PANEL.remove();PANEL=null}try{if(typeof DGI!=="undefined"){if(DGI.tip)DGI.tip.style.display="none";DGI.drag=null;DGI.hov=null}}catch(e){}}
function clampP(p){if(innerWidth<=600)return;const r=p.getBoundingClientRect();let l=parseFloat(p.style.left)||0,t=parseFloat(p.style.top)||0;
 l=Math.max(60-r.width,Math.min(innerWidth-60,l));t=Math.max(4,Math.min(innerHeight-44,t));p.style.left=l+"px";p.style.top=t+"px"}
function placeP(p){if(innerWidth<=600)return;if(POS.at){p.style.left=POS.at[0]+"px";p.style.top=POS.at[1]+"px";clampP(p);return}
 const r=p.getBoundingClientRect(),top=Math.max(64,Math.min(innerHeight-r.height-14,Math.round(innerHeight*.14)));p.style.left=Math.max(8,Math.round(innerWidth-r.width-24))+"px";p.style.top=top+"px";clampP(p)}
function fillBody(p,key,tries){const b=p.querySelector(".gfm-pb");if(!b)return;let fig="";try{fig=dgFigure(key,innerWidth>600&&p.classList.contains("wide"))}catch(e){console.error(e)}
 if(!fig){if(!b.querySelector(".gfm-wait"))b.innerHTML='<p class="gfm-wait">Working it out from the map…</p>';try{if(typeof GFE!=="undefined"&&!GFE.ready&&typeof gfElev==="function")gfElev()}catch(e){}
  if((tries||0)<30)setTimeout(()=>{if(PANEL===p)fillBody(p,key,(tries||0)+1)},1000);return}
 const uses=usesOf(key);
 b.innerHTML=fig+(uses.length?'<div class="gfm-uses"><span>In the tours:</span>'+uses.map(u=>'<button type="button" data-gfm-tour="'+u.t+'" data-gfm-at="'+u.at+'" style="--tc:'+(u.T.col||"#2b7bb5")+'">'+esc(u.T.short||u.T.name)+' · '+esc(u.title)+' →</button>').join("")+'</div>':"");
 /* the panel is already the big view: clicking the drawing does not open the enlarge window on top */
 b.querySelectorAll("[data-dg-open]").forEach(x=>{x.removeAttribute("data-dg-open");x.removeAttribute("role");x.removeAttribute("tabindex")});
 b.querySelectorAll("[data-gfm-tour]").forEach(x=>x.onclick=()=>{const id=x.dataset.gfmTour,at=+x.dataset.gfmAt||0;closeModel();try{psLaunchTour(id);if(at)toursResumeAt(id,at)}catch(e){console.error(e)}});
 try{if(typeof dgInitAll==="function")dgInitAll(b)}catch(e){}
 requestAnimationFrame(()=>{if(PANEL===p)clampP(p)})}
function openModel(key){if(!DG[key])return;closeModel();closeList();
 const D=DG[key],p=document.createElement("div");p.className="gfm-panel"+(POS.wide?" wide":"");p.setAttribute("role","dialog");p.setAttribute("aria-label",D.title);p.dataset.model=key;
 p.innerHTML='<div class="gfm-ph" title="Drag to move"><span class="gfm-grip" aria-hidden="true"></span><b>'+esc(D.title)+'</b>'+(isSim(key)?'<small>Simulation</small>':'')+'<button type="button" class="gfm-wide" aria-label="Bigger or smaller" title="Bigger / smaller">⤢</button><button type="button" class="gfm-close" aria-label="Close">×</button></div><div class="gfm-pb"></div>';
 document.body.appendChild(p);PANEL=p;
 /* the map underneath does not see presses, clicks or the wheel inside the panel (the models' own handlers listen on the document first) */
 ["pointerdown","mousedown","wheel","dblclick","touchstart","contextmenu"].forEach(t=>p.addEventListener(t,e=>e.stopPropagation(),{passive:true}));
 p.addEventListener("click",e=>e.stopPropagation());
 p.querySelector(".gfm-close").onclick=closeModel;
 p.querySelector(".gfm-wide").onclick=()=>{POS.wide=!POS.wide;p.classList.toggle("wide",POS.wide);fillBody(p,key);clampP(p)};
 const bar=p.querySelector(".gfm-ph");
 bar.addEventListener("pointerdown",e=>{if(e.button||e.target.closest("button")||innerWidth<=600)return;e.preventDefault();const r=p.getBoundingClientRect(),dx=e.clientX-r.left,dy=e.clientY-r.top;p.classList.add("moving");
  const mv=ev=>{p.style.left=(ev.clientX-dx)+"px";p.style.top=(ev.clientY-dy)+"px";clampP(p)};
  const up=()=>{removeEventListener("pointermove",mv);removeEventListener("pointerup",up);removeEventListener("pointercancel",up);p.classList.remove("moving");POS.at=[parseFloat(p.style.left),parseFloat(p.style.top)]};
  addEventListener("pointermove",mv);addEventListener("pointerup",up);addEventListener("pointercancel",up)});
 fillBody(p,key,0);placeP(p);
 try{p.querySelector(".gfm-close").focus({preventScroll:true})}catch(e){}}
addEventListener("resize",()=>{if(PANEL)clampP(PANEL)});
/* Esc closes the list, then the panel, before anything else (a tour, full screen, the toolkit) hears it */
addEventListener("keydown",e=>{if(e.key!=="Escape")return;if(document.querySelector(".dg-lightbox,.flag-zoom-overlay.show"))return;
 if(document.querySelector(".gfm-modal")){closeList();e.preventDefault();e.stopImmediatePropagation();return}
 if(PANEL){closeModel();e.preventDefault();e.stopImmediatePropagation()}},true);

/* ================= 3d. the Toolkit slot ================= */
function slotArt(){const u="gfm"+Math.random().toString(36).slice(2,7);
 /* a little framed model on a stand: a sun, a hill and a slider */
 return'<svg viewBox="0 0 100 100" class="gfk-art"><defs><linearGradient id="'+u+'f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c98f4a"/><stop offset="1" stop-color="#8a5a2b"/></linearGradient><linearGradient id="'+u+'s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe3ff"/><stop offset="1" stop-color="#e9f6ff"/></linearGradient></defs>'+
  '<path d="M38 80 L50 66 L62 80" fill="none" stroke="#6d4520" stroke-width="5" stroke-linecap="round"/>'+
  '<rect x="12" y="16" width="76" height="54" rx="7" fill="url(#'+u+'f)"/><rect x="18" y="22" width="64" height="42" rx="3" fill="url(#'+u+'s)"/>'+
  '<circle cx="66" cy="33" r="6.5" fill="#f6c34a" stroke="#e39a1c" stroke-width="1.5"/>'+
  '<path d="M18 56 Q30 38 42 50 T66 46 L82 52 L82 64 L18 64 Z" fill="#5fa86a"/><path d="M18 60 Q40 54 82 58 L82 64 L18 64 Z" fill="#3f86c9"/>'+
  '<line x1="24" y1="88" x2="76" y2="88" stroke="#d7e8dc" stroke-width="3" stroke-linecap="round" opacity=".8"/><circle cx="56" cy="88" r="5" fill="#e8701a" stroke="#fff" stroke-width="1.6"/></svg>'}
function addSlot(){const felt=document.querySelector("#gfKit .gfk-felt");if(!felt||felt.querySelector(".gfk-models"))return;
 const b=document.createElement("button");b.type="button";b.className="gfk-slot gfk-models";b.dataset.gfmTool="models";b.title="Models: every simulation and diagram, opened over the map";b.setAttribute("aria-label","Models");
 b.innerHTML=slotArt()+"<span>Models</span>";b.onclick=e=>{e.stopPropagation();if(document.querySelector(".gfm-modal"))closeList();else openList()};felt.appendChild(b)}
setInterval(addSlot,700);addSlot();

/* ================= 2b. Study & Quiz › Models ================= */
/* Models runs inside the Trivia page's view the way "Other" does (window._prOther), flagged by window._gfModels */
const MCOL={c:"#8fd0c4",d:"#1f6f5c"};
const onModels=()=>!!window._gfModels&&!!window._prOther&&typeof appMode!=="undefined"&&appMode==="trivia";
let entering=false;
function practiceState(){try{stats.practice=stats.practice||{last:"map",seen:false,dl:"cur",tab:"study",reg:"all"};return stats.practice}catch(e){return{}}}
function openTab(){const P=practiceState();P.lastM=true;P.seen=true;try{saveStats()}catch(e){}
 entering=true;window._gfModels=true;window._prOther=true;
 try{try{triviaState().fcMode="quiz"}catch(e){}if(appMode!=="trivia")switchAppMode("trivia");else{applyAppMode();renderChrome();renderActiveView()}}catch(e){console.error(e)}finally{entering=false}
 renderTab();fixTabs();scrollTo(0,0)}
window.gfModelsTab=openTab;
function leaveModels(forget){if(!window._gfModels)return;window._gfModels=false;if(forget)practiceState().lastM=false;
 /* Study & Quiz redraws its tabs only when they change: make it draw them afresh so the right one is lit again */
 const el=document.getElementById("prSubj");if(el){el._h="";el.style.removeProperty("--pr-c")}try{gfPracticeSync()}catch(e){}}
function renderTab(){if(!onModels())return;const v=document.getElementById("triviaView");if(!v)return;
 const L=models();if(v.querySelector(".gfm-br")&&v._gfmN===L.length){fixTabs();return}
 v.innerHTML=browserHTML(false);v._gfmN=L.length;wireBrowser(v.querySelector(".gfm-br"),openModel);fixTabs()}
function fixTabs(){const el=document.getElementById("prSubj");if(!el)return;
 let b=el.querySelector('[data-gfm-subj]');
 if(!b){const n=el.querySelectorAll("[data-prs]").length;if(!n)return;b=document.createElement("button");b.type="button";b.setAttribute("role","tab");b.dataset.gfmSubj="models";b.style.cssText="--c:"+MCOL.c+";--d:"+MCOL.d;
  b.title="Every simulation and diagram, to play with (key "+(n+1)+")";b.innerHTML='<span class="pr-ic" aria-hidden="true">🧪</span>Models <kbd>'+(n+1)+'</kbd>';b.onclick=()=>{if(!onModels())openTab()};el.appendChild(b)}
 const on=onModels();b.classList.toggle("on",on);b.setAttribute("aria-selected",String(on));
 if(on){el.querySelectorAll("[data-prs]").forEach(x=>{x.classList.remove("on");x.setAttribute("aria-selected","false")});el.style.setProperty("--pr-c",MCOL.c);
  const t=document.getElementById("headerTitle"),st=document.getElementById("headerSubtitle");if(t&&t.textContent!=="Models")t.textContent="Models";const sub="simulations and diagrams to play with";if(st&&st.textContent!==sub)st.textContent=sub}}
/* leaving: any subject tab, the Trivia pill or another page */
document.addEventListener("click",e=>{const t=e.target.closest&&e.target.closest("#prSubj [data-prs], #prChoose [data-prs], #prMoved, #appModeTriviaBtn, #appModePracticeBtn");if(!t)return;
 if(t.dataset.prs||t.id==="prMoved")practiceState().lastM=false;
 if(t.id==="appModePracticeBtn"){const P=practiceState();if(P.seen&&P.lastM&&!onModels()){e.preventDefault();e.stopImmediatePropagation();openTab()}return}
 if(!onModels())return;leaveModels(!!t.dataset.prs);
 if(t.dataset.prs==="other"){e.preventDefault();e.stopImmediatePropagation();try{gfPracticeGo("other")}catch(err){}}},true);
if(typeof switchAppMode==="function"&&!switchAppMode._gfm){const _s=switchAppMode;switchAppMode=function(m){const subj=["map","flag","capital","landforms"].includes(m);if(!entering){if(window._gfModels)leaveModels(subj);else if(subj)practiceState().lastM=false}return _s.apply(this,arguments)};switchAppMode._gfm=1}
if(typeof renderActiveView==="function"&&!renderActiveView._gfm){const _ra=renderActiveView;renderActiveView=function(){const r=_ra.apply(this,arguments);try{if(onModels())renderTab();else fixTabs()}catch(e){console.error(e)}return r};renderActiveView._gfm=1}
if(typeof renderTriviaView==="function"&&!renderTriviaView._gfm){const _rt=renderTriviaView;renderTriviaView=function(){if(onModels()){try{const v=document.getElementById("triviaView");if(v)v._gfmN=-1}catch(e){}renderTab();return}return _rt.apply(this,arguments)};renderTriviaView._gfm=1}
if(typeof applyAppMode==="function"&&!applyAppMode._gfm){const _am=applyAppMode;applyAppMode=function(){const r=_am.apply(this,arguments);try{fixTabs()}catch(e){}return r};applyAppMode._gfm=1}
if(typeof renderChrome==="function"&&!renderChrome._gfm){const _rc=renderChrome;renderChrome=function(){const r=_rc.apply(this,arguments);try{fixTabs()}catch(e){}return r};renderChrome._gfm=1}
/* the subject tabs are redrawn by Study & Quiz itself: put Models back each time, and keep the page title */
{const watch=()=>{const el=document.getElementById("prSubj");if(!el||el._gfmW)return!!el;el._gfmW=1;new MutationObserver(()=>fixTabs()).observe(el,{childList:true});fixTabs();return true};if(!watch()){const t=setInterval(()=>{if(watch())clearInterval(t)},300)}}
{const t=document.getElementById("headerTitle");if(t)new MutationObserver(()=>{if(onModels()&&t.textContent!=="Models")fixTabs()}).observe(t,{childList:true,characterData:true,subtree:true})}
/* key 6 opens Models while studying, as 1–5 open the other subjects; 5 goes back to Other */
document.addEventListener("keydown",e=>{if(e.ctrlKey||e.metaKey||e.altKey)return;const t=e.target;if(t&&(t.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)))return;
 const el=document.getElementById("prSubj");if(!el||el.classList.contains("pr-off")||!el.offsetParent)return;
 if(onModels()){if(/^[1-5]$/.test(e.key)){const b=el.querySelectorAll("[data-prs]")[+e.key-1];if(b){e.preventDefault();e.stopImmediatePropagation();b.click()}}return}
 const n=el.querySelectorAll("[data-prs]").length;if(e.key!==String(n+1))return;
 let studying=false;try{studying=window._prOther?(practiceState().tab==="study"&&triviaState().fcMode!=="drills"):appMode==="landforms"?!!document.querySelector('#landformsView [data-lfm="study"].active'):activeTab==="study"}catch(err){}
 if(studying){e.preventDefault();openTab()}},true);

/* the Tours page may already be on screen */
try{if(typeof appMode!=="undefined"&&appMode==="tours")renderToursView()}catch(e){}
window.gfModels={open:openModel,close:closeModel,list:openList,tab:openTab,catOf,models,CATS};
})();
