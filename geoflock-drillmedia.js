/* GeoFlock: a picture for each country fact in Study & Quiz › Other. A photo of the major city, the landmark and the
   national animal, a banknote or coin for the currency, a line of the language itself for Language, and the flag for Demonym.
   Photos come first from the app's own photo library (PS_PHOTO_DATA, looked up by file name: drillimg/index.json "lib"),
   then from drillimg/ (Wikipedia/Wikimedia Commons, credited in drillimg/index.json "credit"). A fact without a photo gets a
   drawn stand-in (the currency's sign on a note, the flag). gfDrillMedia.html(drillId, code, cls, {clue}) gives the markup;
   with clue:true nothing in it names the answer (a reverse question shows the picture as its clue). */
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
 const f=(IDX.by[c]||{})[id];if(f){const C=IDX.credit[f]||{};return{src:"drillimg/"+f,by:C.by||"",lic:C.lic||""}}return null}
/* a language's sample line (from the "Which language?" set) */
const ALIAS={dari:"persian",farsi:"persian",tajik:"persian",filipino:"tagalog",mandarin:"chinese","standard chinese":"chinese",bokmål:"norwegian",kiswahili:"swahili",flemish:"dutch",moldovan:"romanian",montenegrin:"serbian",bosnian:"croatian"};
function langImg(names){for(const nm of [].concat(names||[])){const r=langOne(ALIAS[String(nm).toLowerCase()]||nm);if(r)return r}return null}
function langOne(name){const L=window.gfLangId&&gfLangId.LANGS;if(!L||!name)return null;const n=String(name).toLowerCase().replace(/\s*\(.*\)/,"").trim();
 const hit=L.find(x=>x[1].toLowerCase()===n)||L.find(x=>n.startsWith(x[1].toLowerCase())||x[1].toLowerCase().startsWith(n));return hit?{src:"lang/"+hit[0]+".webp",name:hit[1]}:null}
/* a stand-in banknote: the currency's sign big, its code and name small (not when it is the clue: the code starts with the country's) */
function note(v,clue){const sym=esc(v.sym||v.iso||"¤"),hue=[...String(v.iso||v.cur)].reduce((a,ch)=>(a*31+ch.charCodeAt(0))%9973,7)*47%360;
 return'<div class="dm-note" style="--h:'+hue+'"><b>'+sym+'</b>'+(clue?'':'<small>'+esc(v.iso||"")+'</small><i>'+esc(v.cur)+'</i>')+'</div>'}
function html(id,c,cls,opt){const v=F(c);if(!v)return"";const k=cls||"",clue=!!(opt&&opt.clue),noCap=!!(opt&&opt.noCap);const P=SUBJ[id]?photo(id,c):null;
 if(P){const name=SUBJ[id](v)||"",cr=[P.by,P.lic].filter(Boolean).join(" · "),tip=(clue?"":name+" — ")+"Photo: "+(cr||"Wikimedia Commons");
  /* the currency's name would give away the country of a reverse question */
  const cap=noCap||(clue&&id==="cur")?"":name;
  return'<figure class="dm dm-ph '+k+'" title="'+esc(tip)+'"><span class="dm-bg" style="background-image:url(&quot;'+esc(P.src)+'&quot;)"></span><img src="'+esc(P.src)+'" alt="'+esc(clue&&id==="cur"?"A banknote or coin":name)+'" loading="lazy">'+
   (cap?'<figcaption>'+esc(cap)+'</figcaption>':'')+'<span class="dm-cr" aria-hidden="true">ⓘ</span></figure>'}
 if(id==="lang"){const L=langImg(v.lang||[]);if(L)return'<figure class="dm dm-lang '+k+'"><img src="'+L.src+'" alt="A line of '+esc(L.name)+'" loading="lazy"><figcaption>'+(clue?'Which language is this?':esc(L.name))+'</figcaption></figure>'}
 if(id==="cur")return'<figure class="dm dm-cur '+k+'">'+note(v,clue)+'</figure>';
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
.dm-cr{ position:absolute; top:6px; right:6px; width:18px; height:18px; border-radius:50%; background:rgba(0,0,0,.45); color:#fff; font:700 11px/18px system-ui,sans-serif; text-align:center; opacity:0; transition:opacity .15s; pointer-events:none; }
.dm-ph:hover .dm-cr{ opacity:1; }
.pro-card .dm-ph figcaption{ display:none; }
.dm-flag{ background:#f3f5f8; } .dm-flag img, .pro-card .dm-flag img{ object-fit:contain; padding:10%; filter:drop-shadow(0 2px 6px rgba(0,0,0,.18)); }
.dm-lang{ background:#fff; flex-direction:column; } .dm-lang img, .pro-card .dm-lang img{ object-fit:contain; height:auto !important; max-height:72%; padding:0 6%; }
.dm-lang figcaption{ font:600 11px system-ui; color:#6a7383; margin-top:4px; }
.dm-cur{ background:#eef1ec; }
.dm-note{ width:84%; height:66%; border-radius:8px; position:relative; color:#fff; display:flex; align-items:center; justify-content:center; flex-direction:column;
 background:linear-gradient(135deg,hsl(var(--h) 45% 42%),hsl(calc(var(--h) + 40) 40% 30%)); box-shadow:inset 0 0 0 4px rgba(255,255,255,.25), inset 0 0 0 7px rgba(0,0,0,.12), 0 4px 10px rgba(0,0,0,.2); }
.dm-note b{ font-size:2.4em; line-height:1; font-weight:800; text-shadow:0 2px 0 rgba(0,0,0,.2); }
.dm-note small{ font:700 .75em system-ui; letter-spacing:.12em; opacity:.85; margin-top:2px; }
.dm-note i{ position:absolute; left:8px; bottom:5px; font:600 .62em system-ui; font-style:normal; opacity:.8; }
body.sky-night .dm{ background:#253049; } body.sky-night .dm-flag{ background:#2a3550; } body.sky-night .dm-cur{ background:#26302f; }
body.sky-night .dm-lang{ background:#f4f1ea; } body.sky-night .dm-lang figcaption{ color:#5d6574; }`;document.head.appendChild(st);
})();
