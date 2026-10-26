/* GeoFlock: a guided tour on the Deep Time map — 750 million years in 15 stops. The map glides between ages;
   red pins mark where present-day places were, carried with their plates. */
(function(){
/* hidden for now, while the map before Gondwana is being redone */
if(true)return;
if(!window.gfDeepUI||!window.gfDrift)return;
const UI=gfDeepUI,esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const STOPS=[
 {t:750,title:"Rodinia",body:"750 million years ago nearly all land was joined in a supercontinent called Rodinia, ringed by an ocean called Mirovia. It was already starting to break apart.",more:"There were no plants or animals on land, only microbes. Positions this far back are estimates: the further back you go, the less certain they are."},
 {t:680,title:"Snowball Earth",body:"Between about 720 and 635 million years ago ice may have covered almost the whole planet. Rocks dropped by glaciers are found in places that were near the equator at the time.",more:"Volcanoes slowly added carbon dioxide to the air until the greenhouse effect was strong enough to melt the ice."},
 {t:540,title:"The Cambrian explosion",body:"Around 539 million years ago most of the main animal groups appear in the fossil record, within a few tens of millions of years. All of it was in the sea; the land was still bare.",more:"The southern continents were gathering into Gondwana, which would last for more than 300 million years."},
 {t:445,title:"Ice in the Sahara",body:"445 million years ago North Africa sat over the South Pole. Ice sheets scraped across what is now the Sahara, and the ice age caused one of the five great mass extinctions.",marks:[{lon:8,lat:25,label:"Today’s Sahara"}]},
 {t:400,title:"Mountains from a closing ocean",body:"As the Iapetus Ocean closed, North America and northern Europe collided. The worn-down roots of those mountains are the Appalachians, the Scottish Highlands and the mountains of Norway.",marks:[{lon:-80,lat:37.5,label:"Appalachians"},{lon:-4.5,lat:57,label:"Scottish Highlands"},{lon:8,lat:61,label:"Norway"}]},
 {t:310,title:"The coal forests",body:"Giant swamp forests grew along the equator. Their buried wood became the coal of Pennsylvania, Britain and Germany’s Ruhr, the coal that later powered the Industrial Revolution.",marks:[{lon:-77.5,lat:40.8,label:"Pennsylvania"},{lon:7.2,lat:51.5,label:"Ruhr"}]},
 {t:250,title:"Pangaea",body:"All the continents had come together into Pangaea, with one vast ocean, Panthalassa. About 252 million years ago the worst mass extinction on record wiped out most species in the sea.",more:"Huge volcanic eruptions in Siberia are the leading suspect: they warmed the planet and drained oxygen from the oceans."},
 {t:200,title:"The Atlantic is born",body:"Pangaea began to split. A rift opened between North America and Africa and filled with sea: the start of the Atlantic Ocean. New York and Morocco were neighbours.",marks:[{lon:-74,lat:40.7,label:"New York",side:"l"},{lon:-7.6,lat:33.6,label:"Casablanca"}]},
 {t:150,title:"The world of the dinosaurs",body:"By the Jurassic, Pangaea had split into Laurasia in the north and Gondwana in the south. Africa and South America were still joined, so the same kinds of dinosaurs lived on both."},
 {t:90,title:"India sets off",body:"Around 90 million years ago India broke away from Madagascar and headed north. It later reached 15 cm a year or more, among the fastest plate speeds known.",marks:[{lon:72.9,lat:19.1,label:"Mumbai"},{lon:46.9,lat:-18.9,label:"Madagascar",side:"l"}]},
 {t:66,title:"The asteroid",body:"66 million years ago an asteroid hit what is now Mexico’s Yucatán coast. With huge eruptions in India, the Deccan Traps, it ended the age of the dinosaurs.",marks:[{lon:-89.5,lat:21.3,label:"Chicxulub crater"},{lon:76,lat:18.5,label:"Deccan Traps",side:"l"}]},
 {t:50,title:"India hits Asia",body:"India ran into Asia about 50 million years ago. It is still pushing north by about 5 cm a year, and the crumpled crust became the Himalayas and the Tibetan Plateau.",marks:[{lon:86.9,lat:28,label:"Everest"}]},
 {t:34,title:"Antarctica freezes",body:"As Australia and South America pulled away, a current could circle Antarctica and cut it off from warm water. Ice sheets began to grow about 34 million years ago."},
 {t:3,title:"The Americas join",body:"About 3 million years ago the Isthmus of Panama rose from the sea. Animals crossed both ways: armadillos went north, while cats, bears and deer went south.",marks:[{lon:-80,lat:8.6,label:"Panama"}]},
 {t:0,title:"Still moving",body:"The plates move about as fast as fingernails grow. The Atlantic widens by a few centimetres a year, and in 200 to 250 million years the continents may join again.",marks:[{lon:-19,lat:64.9,label:"Iceland: the Atlantic’s ridge above sea"}]}];
let on=false,i=0,anim=0;
function ease(x){return x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2}
function glide(t1){cancelAnimationFrame(anim);UI.stop();const st=UI.st,t0=st.t,l0=st.lon,d=Math.min(2800,700+Math.abs(t1-t0)*7),s=performance.now();
 const f=n=>{const k=Math.min(1,(n-s)/d),e=ease(k);st.t=t0+(t1-t0)*e;st.lon=l0+(-10-l0)*e;UI.paint();if(k<1)anim=requestAnimationFrame(f)};anim=requestAnimationFrame(f)}
function card(){const b=UI.box();if(!b)return;let c=b.querySelector(".gdt-card");if(!on){if(c)c.remove();return}
 if(!c){c=document.createElement("div");c.className="gdt-card";b.appendChild(c)}const S=STOPS[i];
 c.innerHTML='<div class="gdt-top"><span class="gdt-k">Stop '+(i+1)+' of '+STOPS.length+'</span><span class="gdt-t">'+(S.t?S.t+" million years ago":"Today")+'</span><button type="button" class="gdt-x" aria-label="End the tour">×</button></div><h3>'+esc(S.title)+'</h3><p>'+esc(S.body)+'</p>'+(S.more?'<details><summary>Tell me more</summary><p>'+esc(S.more)+'</p></details>':'')+
  '<div class="gdt-dots">'+STOPS.map((_,k)=>'<i class="'+(k===i?"on":k<i?"done":"")+'"></i>').join("")+'</div><div class="gdt-nav"><button type="button" class="chip gdt-back"'+(i?"":" disabled")+'>← Back</button><button type="button" class="chip gdt-next">'+(i===STOPS.length-1?"Finish":"Next →")+'</button></div>';
 c.querySelector(".gdt-x").onclick=end;c.querySelector(".gdt-back").onclick=()=>go(i-1);c.querySelector(".gdt-next").onclick=()=>i===STOPS.length-1?end():go(i+1)}
function room(){const b=UI.box();UI.st.left=on&&b&&b.clientWidth>760?350:0}
function go(k){if(k<0||k>=STOPS.length)return;i=k;const S=STOPS[i];UI.st.marks=S.marks||null;room();glide(S.t);card()}
function start(){const open=()=>{UI.open();on=true;go(0)};if(typeof switchAppMode==="function"&&(typeof appMode==="undefined"||appMode!=="allmaps")){try{switchAppMode("allmaps")}catch(e){}setTimeout(open,400)}else open()}
function end(){on=false;cancelAnimationFrame(anim);UI.st.marks=null;room();card();UI.paint()}
document.addEventListener("keydown",e=>{if(!on)return;const b=UI.box();if(!b||b.hidden){end();return}if(/INPUT|TEXTAREA/.test((e.target&&e.target.tagName)||"")&&e.target.type!=="range")return;
 if(e.key==="ArrowRight"){e.preventDefault();e.stopPropagation();go(i+1)}else if(e.key==="ArrowLeft"){e.preventDefault();e.stopPropagation();go(i-1)}else if(e.key==="Escape")end()},true);
/* a Tour button in the Deep Time bar */
function ensureBtn(){const b=UI.box();if(!b||b.querySelector(".gdt-go"))return;const row=b.querySelector(".gfd-row");if(!row)return;const t=document.createElement("button");t.type="button";t.className="gdt-go";t.textContent="Guided tour";t.onclick=()=>on?end():(on=true,go(0));row.appendChild(t)}
{const _o=UI.open;UI.open=function(){const r=_o.apply(this,arguments);try{ensureBtn();if(!on)card()}catch(e){console.error(e)}return r};window.gfDeepTimeOpen=UI.open;const chip=document.getElementById("gfDeepChip");if(chip)chip.onclick=UI.open}
/* the chip is created later by the drift script; point its click at the wrapped open */
if(typeof renderAllMapsView==="function"){const _ra=renderAllMapsView;renderAllMapsView=function(){const r=_ra.apply(this,arguments);try{const c=document.getElementById("gfDeepChip");if(c)c.onclick=UI.open}catch(e){}return r}}
/* a card on the Tours page, next to the plate tectonics tour */
if(typeof renderToursView==="function"){const _rt=renderToursView;renderToursView=function(){const r=_rt.apply(this,arguments);try{const v=document.getElementById("toursView"),pl=v&&v.querySelector('[data-tour-go="plates"]'),art=pl&&pl.closest(".tr-card");if(art&&!v.querySelector(".gdt-trcard")){
 art.insertAdjacentHTML("afterend",'<article class="tr-card gdt-trcard" style="--tc:#3b6ea5"><button type="button" class="tr-thumb" data-deep-tour aria-label="Start the Deep Time tour"><img src="thumbs/deeptime.webp" alt="" loading="lazy"><span class="tr-badge">Deep Time map</span></button><div class="tr-body"><h3>750 million years of drifting continents</h3><p class="tr-hint">Watch the continents move, from Rodinia and Pangaea to the world today</p><ul class="tr-sample"><li>Snowball Earth</li><li>Ice in the Sahara</li><li>The Atlantic is born</li><li class="tr-more">+ 12 more stops</li></ul><div class="tr-foot"><button type="button" class="tr-go" data-deep-tour>Start →</button></div></div></article>');
 v.querySelectorAll("[data-deep-tour]").forEach(x=>x.onclick=start)}}catch(e){console.error(e)}return r}}
window.gfDeepTour={start,end,go,STOPS};
const css=document.createElement("style");css.textContent=`
#gfDeep .gdt-card{ position:absolute; left:14px; top:14px; width:330px; max-width:calc(100% - 28px); background:rgba(255,255,255,.96); color:#17222f; border-radius:18px; padding:12px 14px; box-shadow:0 8px 30px rgba(0,0,0,.35); z-index:3; animation:gdtIn .35s ease; }
@keyframes gdtIn{ from{ opacity:0; transform:translateY(-6px) } to{ opacity:1; transform:none } }
#gfDeep .gdt-top{ display:flex; align-items:center; gap:8px; font-size:12px; } .gdt-k{ font-weight:800; color:#c0532a; text-transform:uppercase; letter-spacing:.04em; } .gdt-t{ background:#17345a; color:#fff; border-radius:999px; padding:2px 9px; font-weight:700; }
#gfDeep .gdt-x{ margin-left:auto; border:0; background:none; font-size:20px; line-height:1; cursor:pointer; color:inherit; opacity:.6; }
#gfDeep .gdt-card h3{ margin:8px 0 4px; font-size:18px; } #gfDeep .gdt-card p{ margin:0 0 6px; font-size:14px; line-height:1.45; } #gfDeep .gdt-card summary{ cursor:pointer; font-weight:700; font-size:13px; opacity:.8; }
#gfDeep .gdt-dots{ display:flex; gap:4px; margin:8px 0; } #gfDeep .gdt-dots i{ width:7px; height:7px; border-radius:50%; background:#d6dbe3; } #gfDeep .gdt-dots i.done{ background:#e8a27f; } #gfDeep .gdt-dots i.on{ background:#c0532a; width:18px; border-radius:4px; }
#gfDeep .gdt-nav{ display:flex; justify-content:space-between; } #gfDeep .gdt-nav .chip{ color:#17222f; } #gfDeep .gdt-next{ background:#e8701a !important; color:#fff !important; border-color:transparent !important; }
#gfDeep .gdt-go{ border:1px solid rgba(255,255,255,.35); background:rgba(255,255,255,.1); color:#fff; border-radius:999px; padding:5px 12px; font:inherit; font-weight:700; cursor:pointer; white-space:nowrap; } #gfDeep .gdt-go:hover{ background:rgba(255,255,255,.2); }
@media (max-width:600px){ #gfDeep .gdt-card{ left:8px; right:8px; top:8px; width:auto; padding:10px 12px; } #gfDeep .gdt-card p{ font-size:13px; } #gfDeep .gdt-card h3{ font-size:16px; margin:6px 0 2px; } }`;
document.head.appendChild(css);
})();
