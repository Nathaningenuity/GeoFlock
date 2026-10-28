/* GeoFlock: a picture for each country fact in Study & Quiz › Other. A photo of the major city, the landmark and the
   national animal, a banknote or coin for the currency (photos from Wikipedia/Wikimedia Commons, credited in drillimg/index.json),
   a line of the language itself for Language, and the flag for Demonym. A fact without a photo gets a drawn stand-in
   (the currency's sign on a note, the flag). gfDrillMedia.html(drillId, code, size) gives the markup. */
(function(){
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let IDX={by:{},credit:{}};fetch("drillimg/index.json").then(r=>r.ok?r.json():null).then(j=>{if(j&&j.by){IDX=j;document.dispatchEvent(new Event("gf-drillimg"))}}).catch(()=>{});
const F=c=>(typeof DRILL_FACTS!=="undefined"?DRILL_FACTS:{})[c]||null;
const fl=(c,w)=>{try{return flagUrl(c,w||"w320")}catch(e){return"https://flagcdn.com/"+(w||"w320")+"/"+c+".png"}};
/* a language's sample line (from the "Which language?" set) */
const ALIAS={dari:"persian",farsi:"persian",tajik:"persian",filipino:"tagalog",mandarin:"chinese","standard chinese":"chinese",bokmål:"norwegian",kiswahili:"swahili",flemish:"dutch",moldovan:"romanian",montenegrin:"serbian",bosnian:"croatian"};
function langImg(names){for(const nm of [].concat(names||[])){const r=langOne(ALIAS[String(nm).toLowerCase()]||nm);if(r)return r}return null}
function langOne(name){const L=window.gfLangId&&gfLangId.LANGS;if(!L||!name)return null;const n=String(name).toLowerCase().replace(/\s*\(.*\)/,"").trim();
 const hit=L.find(x=>x[1].toLowerCase()===n)||L.find(x=>n.startsWith(x[1].toLowerCase())||x[1].toLowerCase().startsWith(n));return hit?{src:"lang/"+hit[0]+".webp",name:hit[1]}:null}
/* a stand-in banknote: the currency's sign big, its code small */
function note(v){const sym=esc(v.sym||v.iso||"¤"),hue=[...String(v.iso||v.cur)].reduce((a,ch)=>(a*31+ch.charCodeAt(0))%9973,7)*47%360;
 return'<div class="dm-note" style="--h:'+hue+'"><b>'+sym+'</b><small>'+esc(v.iso||"")+'</small><i>'+esc(v.cur)+'</i></div>'}
function credit(f){const C=IDX.credit&&IDX.credit[f];return C?' title="'+esc((C.title||"").replace(/^File:/,"")+" · "+(C.by||"")+" · "+(C.lic||""))+'"':""}
function html(id,c,cls){const v=F(c);if(!v)return"";const k=cls||"";const ph=(IDX.by[c]||{})[id];
 if(ph)return'<figure class="dm '+k+'"><img src="drillimg/'+esc(ph)+'" alt="'+esc(id==="cur"?v.cur:id==="city"?v.city:id==="lm"?v.lm:id==="an"?v.an:"")+'" loading="lazy"'+credit(ph)+'></figure>';
 if(id==="lang"){const L=langImg(v.lang||[]);if(L)return'<figure class="dm dm-lang '+k+'"><img src="'+L.src+'" alt="A line of '+esc(L.name)+'" loading="lazy"><figcaption>'+esc(L.name)+'</figcaption></figure>'}
 if(id==="cur")return'<figure class="dm '+k+'">'+note(v)+'</figure>';
 return'<figure class="dm dm-flag '+k+'"><img src="'+fl(c)+'" alt="" loading="lazy"></figure>'}
window.gfDrillMedia={html,has:(id,c)=>!!((IDX.by[c]||{})[id]),langImg};
const st=document.createElement("style");st.textContent=`
.dm{ margin:0; position:relative; border-radius:12px; overflow:hidden; background:#e9eef4; aspect-ratio:16/10; display:flex; align-items:center; justify-content:center; }
.dm img, .pro-card .dm img{ width:100% !important; height:100% !important; object-fit:cover; display:block; border-radius:0 !important; box-shadow:none !important; }
.dm-flag{ background:#f3f5f8; } .dm-flag img, .pro-card .dm-flag img{ object-fit:contain; padding:10%; filter:drop-shadow(0 2px 6px rgba(0,0,0,.18)); }
.dm-lang{ background:#fff; flex-direction:column; } .dm-lang img, .pro-card .dm-lang img{ object-fit:contain; height:auto !important; max-height:72%; padding:0 6%; }
.dm-lang figcaption{ font:600 11px system-ui; color:#6a7383; margin-top:4px; }
.dm-note{ width:84%; height:66%; border-radius:8px; position:relative; color:#fff; display:flex; align-items:center; justify-content:center; flex-direction:column;
 background:linear-gradient(135deg,hsl(var(--h) 45% 42%),hsl(calc(var(--h) + 40) 40% 30%)); box-shadow:inset 0 0 0 4px rgba(255,255,255,.25), inset 0 0 0 7px rgba(0,0,0,.12), 0 4px 10px rgba(0,0,0,.2); }
.dm-note b{ font-size:2.4em; line-height:1; font-weight:800; text-shadow:0 2px 0 rgba(0,0,0,.2); }
.dm-note small{ font:700 .75em system-ui; letter-spacing:.12em; opacity:.85; margin-top:2px; }
.dm-note i{ position:absolute; left:8px; bottom:5px; font:600 .62em system-ui; font-style:normal; opacity:.8; }
body.sky-night .dm{ background:#253049; } body.sky-night .dm-flag{ background:#2a3550; }`;document.head.appendChild(st);
})();
