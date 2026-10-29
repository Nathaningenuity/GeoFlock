/* GeoFlock: a picture for each country fact in Study & Quiz › Other. A photo of the major city, the landmark and the
   national animal, the currency's banknote (or, for a euro country, its national side of a euro coin), a line of the
   language itself for Language, and the flag for Demonym.
   Photos come first from the app's own photo library (PS_PHOTO_DATA, looked up by file name: drillimg/index.json "lib"),
   then from drillimg/ (Wikipedia/Wikimedia Commons, credited in drillimg/index.json "credit"). Currency pictures all live in
   drillimg/cur/ and are made by tools/currency_media.py to one shape (800×400, transparent, centred: see
   docs/CURRENCY_MEDIA_SPEC.md), shown in one neutral tray. gfDrillMedia.html(drillId, code, cls, {clue}) gives the markup;
   with clue:true nothing in it names the answer (a reverse question shows the picture as its clue; for a currency that is
   one plain drawn note with only the currency's sign, since a real banknote names its country). */
(function(){
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let IDX={by:{},credit:{},lib:{}};fetch("drillimg/index.json").then(r=>r.ok?r.json():null).then(j=>{if(j&&j.by){IDX=Object.assign({by:{},credit:{},lib:{}},j);document.dispatchEvent(new Event("gf-drillimg"))}}).catch(()=>{});
const F=c=>(typeof DRILL_FACTS!=="undefined"?DRILL_FACTS:{})[c]||null;
const fl=(c,w)=>{try{return flagUrl(c,w||"w320")}catch(e){return"https://flagcdn.com/"+(w||"w320")+"/"+c+".png"}};
const SUBJ={cur:v=>v.cur,city:v=>v.city,lm:v=>v.lm,an:v=>v.an};
/* the app's photo library, by file name (indices shift, names do not) */
let LIBM=null,LIBN=-1;
function libPhoto(f){try{if(typeof PS_PHOTO_DATA==="undefined")return null;try{if(typeof gfMergeExtra==="function")gfMergeExtra()}catch(e){}
 if(!LIBM||LIBN!==PS_PHOTO_DATA.length){LIBM=new Map();PS_PHOTO_DATA.forEach(p=>{if(p&&p.f&&!LIBM.has(p.f))LIBM.set(p.f,p)});LIBN=PS_PHOTO_DATA.length}
 const p=LIBM.get(f);if(!p||!p.d)return null;const src=typeof gfSrc==="function"?gfSrc(p.d):p.d;return{src,by:p.by||"",lic:p.lic||""}}catch(e){return null}}
/* the photo for a fact, or null */
function photo(id,c){const lf=(IDX.lib[c]||{})[id];if(lf){const p=libPhoto(lf);if(p)return p}
 const f=(IDX.by[c]||{})[id];if(f){const C=IDX.credit[f]||{};return{src:"drillimg/"+f,by:C.by||"",lic:C.lic||"",C}}return null}
/* a language's sample line (from the "Which language?" set) */
const ALIAS={dari:"persian",farsi:"persian",tajik:"persian",filipino:"tagalog",mandarin:"chinese","standard chinese":"chinese",bokmål:"norwegian",kiswahili:"swahili",flemish:"dutch",moldovan:"romanian",montenegrin:"serbian",bosnian:"croatian"};
function langImg(names){for(const nm of [].concat(names||[])){const r=langOne(ALIAS[String(nm).toLowerCase()]||nm);if(r)return r}return null}
function langOne(name){const L=window.gfLangId&&gfLangId.LANGS;if(!L||!name)return null;const n=String(name).toLowerCase().replace(/\s*\(.*\)/,"").trim();
 const hit=L.find(x=>x[1].toLowerCase()===n)||L.find(x=>n.startsWith(x[1].toLowerCase())||x[1].toLowerCase().startsWith(n));return hit?{src:"lang/"+hit[0]+".webp",name:hit[1]}:null}
/* the clue for "Which country uses the …?": one plain neutral note with the currency's sign and nothing else
   (no code, no name, no colour per currency: a real banknote, or the ISO code, would name the country) */
function note(v){return'<div class="dm-note"><b>'+esc(v.sym||"¤")+'</b></div>'}
/* the currency card: the prepared image (drillimg/cur/…) in the neutral tray, ⓘ with its credit on every card */
const curLabel=v=>typeof gfCurLabel==="function"?gfCurLabel(v):[v.cur,v.iso,v.sym].filter(Boolean).join(" · ");
function curHtml(v,c,k,clue){if(clue)return'<figure class="dm dm-cur dm-clue '+k+'" aria-label="A banknote">'+note(v)+'</figure>';
 const P=photo("cur",c);if(!P)return'<figure class="dm dm-cur '+k+'">'+note(v)+'</figure>';const C=P.C||{};
 const tip=[curLabel(v),C.what,C.shared,"Image: "+([P.by,P.lic].filter(Boolean).join(", ")||"Wikimedia Commons")].filter(Boolean).join("\n");
 return'<figure class="dm dm-cur dm-cimg '+k+'" title="'+esc(tip)+'"><img src="'+esc(P.src)+'" alt="'+esc(C.what||v.cur)+'" loading="lazy"><span class="dm-cr" aria-hidden="true">ⓘ</span></figure>'}
function html(id,c,cls,opt){const v=F(c);if(!v)return"";const k=cls||"",clue=!!(opt&&opt.clue),noCap=!!(opt&&opt.noCap);if(id==="cur")return curHtml(v,c,k,clue);const P=SUBJ[id]?photo(id,c):null;
 if(P){const name=SUBJ[id](v)||"",cr=[P.by,P.lic].filter(Boolean).join(" · "),tip=(clue?"":name+" — ")+"Photo: "+(cr||"Wikimedia Commons");
  const cap=noCap?"":name;
  return'<figure class="dm dm-ph '+k+'" title="'+esc(tip)+'"><span class="dm-bg" style="background-image:url(&quot;'+esc(P.src)+'&quot;)"></span><img src="'+esc(P.src)+'" alt="'+esc(name)+'" loading="lazy">'+
   (cap?'<figcaption>'+esc(cap)+'</figcaption>':'')+'<span class="dm-cr" aria-hidden="true">ⓘ</span></figure>'}
 if(id==="lang"){const L=langImg(v.lang||[]);if(L)return'<figure class="dm dm-lang '+k+'"><img src="'+L.src+'" alt="A line of '+esc(L.name)+'" loading="lazy"><figcaption>'+(clue?'Which language is this?':esc(L.name))+'</figcaption></figure>'}
 return'<figure class="dm dm-flag '+k+'"><img src="'+fl(c)+'" alt="" loading="lazy"></figure>'}
window.gfDrillMedia={html,has:(id,c)=>!!(SUBJ[id]&&photo(id,c)),photo,langImg};
const st=document.createElement("style");st.textContent=`
.dm{ margin:0; position:relative; border-radius:12px; overflow:hidden; background:#e9eef4; aspect-ratio:16/10; display:flex; align-items:center; justify-content:center; isolation:isolate; }
.dm img, .pro-card .dm img{ width:100% !important; height:100% !important; object-fit:cover; display:block; border-radius:0 !important; box-shadow:none !important; }
/* a photo is shown whole (tall towers, standing animals), over a blurred copy of itself */
.dm-ph .dm-bg{ position:absolute; inset:-14px; background-size:cover; background-position:center; filter:blur(14px) brightness(.82) saturate(1.1); z-index:-1; }
.dm-ph img, .pro-card .dm-ph img{ object-fit:contain; position:relative; }
.dm-ph figcaption{ position:absolute; left:0; right:0; bottom:0; padding:14px 10px 6px; font:600 12.5px/1.25 system-ui,sans-serif; color:#fff; text-align:left;
 background:linear-gradient(transparent,rgba(0,0,0,.62)); text-shadow:0 1px 2px rgba(0,0,0,.6); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; pointer-events:none; }
.dm-cr{ position:absolute; top:6px; right:6px; width:18px; height:18px; border-radius:50%; background:rgba(0,0,0,.45); color:#fff; font:700 11px/18px system-ui,sans-serif; text-align:center; opacity:.55; transition:opacity .15s; pointer-events:none; }
.dm-ph:hover .dm-cr{ opacity:1; }
.pro-card .dm-ph figcaption{ display:none; }
.dm-flag{ background:#f3f5f8; } .dm-flag img, .pro-card .dm-flag img{ object-fit:contain; padding:10%; filter:drop-shadow(0 2px 6px rgba(0,0,0,.18)); }
.dm-lang{ background:#fff; flex-direction:column; } .dm-lang img, .pro-card .dm-lang img{ object-fit:contain; height:auto !important; max-height:72%; padding:0 6%; }
.dm-lang figcaption{ font:600 11px system-ui; color:#6a7383; margin-top:4px; }
/* currency: one 2:1 tray, one neutral colour, no blurred backdrop; every image is already 800×400 with a transparent surround */
.dm.dm-cur{ aspect-ratio:2/1; background:var(--dm-tray,#eceff3); }
.dm-cur img, .pro-card .dm-cur img{ object-fit:contain; padding:5% 6%; box-sizing:border-box; filter:drop-shadow(0 2px 6px rgb(0 0 0 / .15)); }
.dm-cur .dm-cr{ opacity:.7; } .dm-cur:hover .dm-cr{ opacity:1; }
.dm-note{ width:72%; height:72%; border-radius:6px; display:flex; align-items:center; justify-content:center; color:#4f5b69;
 background:#dfe4ea; box-shadow:inset 0 0 0 5px #dfe4ea, inset 0 0 0 6px rgb(79 91 105 / .35), 0 2px 6px rgb(0 0 0 / .15); }
.dm-note b{ font:800 2.6em/1 system-ui,sans-serif; }
body.sky-night .dm.dm-cur{ --dm-tray:#222b38; } body.sky-night .dm-note{ background:#323d4c; color:#c9d2dd; box-shadow:inset 0 0 0 5px #323d4c, inset 0 0 0 6px rgb(201 210 221 / .3), 0 2px 6px rgb(0 0 0 / .3); }
body.sky-night .dm{ background:#253049; } body.sky-night .dm-flag{ background:#2a3550; }
body.sky-night .dm-lang{ background:#f4f1ea; } body.sky-night .dm-lang figcaption{ color:#5d6574; }`;document.head.appendChild(st);
})();
