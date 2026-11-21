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
let IDX={by:{},credit:{},lib:{}};fetch("drillimg/index.json?v=202611211400").then(r=>r.ok?r.json():null).then(j=>{if(j&&j.by){IDX=Object.assign({by:{},credit:{},lib:{}},j);document.dispatchEvent(new Event("gf-drillimg"))}}).catch(()=>{});
const F=c=>(typeof DRILL_FACTS!=="undefined"?DRILL_FACTS:{})[c]||null;
const fl=(c,w)=>{try{return flagUrl(c,w||"w320")}catch(e){return"https://flagcdn.com/"+(w||"w320")+"/"+c+".png"}};
const SUBJ={cur:v=>v.cur,city:v=>v.city,lm:v=>v.lm,an:v=>v.an};
/* the app's photo library, by file name (indices shift, names do not) */
let LIBM=null,LIBN=-1;
function libPhoto(f){try{if(typeof PS_PHOTO_DATA==="undefined")return null;try{if(typeof gfMergeExtra==="function")gfMergeExtra()}catch(e){}
 if(!LIBM||LIBN!==PS_PHOTO_DATA.length){LIBM=new Map();PS_PHOTO_DATA.forEach(p=>{if(p&&p.f&&!LIBM.has(p.f))LIBM.set(p.f,p)});LIBN=PS_PHOTO_DATA.length}
 const p=LIBM.get(f);if(!p||!p.d)return null;const src=typeof gfSrc==="function"?gfSrc(p.d):p.d;return{src,by:p.by||"",lic:p.lic||"",page:p.page||"",title:p.f||""}}catch(e){return null}}
/* the photo for a fact, or null */
/* index.json "pos" ({code:{id:"50% 30%"}}) frames a photo when it is cropped to the card; "contain" shows it whole instead */
function photo(id,c){const pos=((IDX.pos||{})[c]||{})[id]||"";const lf=(IDX.lib[c]||{})[id];if(lf){const p=libPhoto(lf);if(p)return Object.assign(p,{pos})}
 const f=(IDX.by[c]||{})[id];if(f){const C=IDX.credit[f]||{};return{src:"drillimg/"+f,by:C.by||"",lic:C.lic||"",page:C.page||"",title:C.title||"",pos,C}}return null}
/* a language's sample line: the "Which language?" set, plus the national languages it leaves out (Article 1 of the UDHR, from
   the Unicode UDHR project texts) */
const EXTRA=[["mly_latn","Malay"],["mos","Mooré"],["bam","Bambara"],["dzo","Dzongkha"],["div","Dhivehi"],["tsn","Setswana"],["sot","Sesotho"],["run","Kirundi"],["nya_chechewa","Chichewa"],["ssw","Swati"],["pbu","Pashto"],["ltz","Luxembourgish"],["tet","Tetum"],["sag","Sango"],["bis","Bislama"],["tpi","Tok Pisin"],["mah","Marshallese"],["crs","Seychellois Creole"],["pau","Palauan"],["bos_latn","Bosnian"]];
const ALIAS={dari:"persian",farsi:"persian",filipino:"tagalog",mandarin:"chinese","standard chinese":"chinese",bokmål:"norwegian",kiswahili:"swahili",flemish:"dutch",moldovan:"romanian",montenegrin:"serbian"};
/* a country's own national language goes first, where there is a sample of it, ahead of a colonial lingua franca */
const PREF={bw:"Setswana",mw:"Chichewa",cf:"Sango",ht:"Haitian Creole",fj:"Fijian",zw:"Shona",sg:"Malay"};
function langImg(names,c){names=[].concat(names||[]);if(c&&PREF[c]&&names.includes(PREF[c]))names=[PREF[c]].concat(names);for(const nm of names){const r=langOne(ALIAS[String(nm).toLowerCase()]||nm);if(r)return r}return null}
function langOne(name){const L=((window.gfLangId&&gfLangId.LANGS)||[]).concat(EXTRA);if(!name)return null;const n=String(name).toLowerCase().replace(/\s*\(.*\)/,"").trim();
 /* an exact name, else whole words only ("Malay" is not "Malayalam") */
 const hit=L.find(x=>x[1].toLowerCase()===n)||L.find(x=>{const m=x[1].toLowerCase();return n.startsWith(m+" ")||m.startsWith(n+" ")});return hit?{src:"lang/"+hit[0]+".webp",name:hit[1]}:null}
/* the clue for "Which country uses the …?": one plain neutral note with the currency's sign and nothing else
   (no code, no name, no colour per currency: a real banknote, or the ISO code, would name the country) */
function note(v){return'<div class="dm-note"><span class="dm-sym">'+esc(v.sym||"¤")+'</span></div>'}
/* the currency card: the prepared image (drillimg/cur/…) in the neutral tray, ⓘ with its credit on every card */
const curLabel=v=>typeof gfCurLabel==="function"?gfCurLabel(v):[v.cur,v.iso,v.sym].filter(Boolean).join(" · ");
function curHtml(v,c,k,clue){if(clue)return'<figure class="dm dm-cur dm-clue '+k+'" aria-label="A banknote">'+note(v)+'</figure>';
 const P=photo("cur",c);if(!P)return'<figure class="dm dm-cur '+k+'" title="'+esc(curLabel(v)+"\nNo freely licensed picture of this currency is available, so a plain drawn note stands in.")+'">'+note(v)+'<span class="dm-cr" aria-hidden="true">ⓘ</span></figure>';const C=P.C||{};
 const tip=[curLabel(v),C.what,C.shared,"Image: "+([P.by,P.lic].filter(Boolean).join(", ")||"Wikimedia Commons")].filter(Boolean).join("\n");
 return'<figure class="dm dm-cur dm-cimg '+k+'" title="'+esc(tip)+'"><img src="'+esc(P.src)+'" alt="'+esc(C.what||v.cur)+'" loading="lazy"><span class="dm-cr" aria-hidden="true">ⓘ</span></figure>'}
function html(id,c,cls,opt){const v=F(c);if(!v)return"";const k=cls||"",clue=!!(opt&&opt.clue),noCap=!!(opt&&opt.noCap);if(id==="cur")return curHtml(v,c,k,clue);const P=SUBJ[id]?photo(id,c):null;
 if(P){const name=SUBJ[id](v)||"",cr=[P.by,P.lic].filter(Boolean).join(" · "),tip=(clue?"":name+" — ")+"Photo: "+(cr||"Wikimedia Commons");
  const cap=noCap?"":name;
  /* a landscape photo fills the card (fit() below crops it a little); a tall one is shown whole over a blurred copy.
     opt.zoom (Study cards): click it for the lightbox */
  const pos=P.pos&&P.pos!=="contain"?P.pos:"",zoom=!!(opt&&opt.zoom)&&!clue;
  return'<figure class="dm dm-ph '+k+(P.pos==="contain"?' dm-whole':'')+(zoom?' dm-zoom" tabindex="0" role="button" aria-label="'+esc("Enlarge the photo of "+name):'')+'" data-dm-id="'+id+'" data-dm-c="'+esc(c)+'" title="'+esc(tip)+'"><span class="dm-bg" style="background-image:url(&quot;'+esc(P.src)+'&quot;)"></span><img src="'+esc(P.src)+'" alt="'+esc(name)+'" loading="lazy"'+(pos?' style="object-position:'+esc(pos)+'"':'')+'>'+
   (cap?'<figcaption>'+esc(cap)+'</figcaption>':'')+'<span class="dm-cr" aria-hidden="true">ⓘ</span></figure>'}
 if(id==="lang"){const L=langImg(v.lang||[],c);if(L)return'<figure class="dm dm-lang '+k+'"><img src="'+L.src+'" alt="A line of '+esc(L.name)+'" loading="lazy"><figcaption>'+(clue?'Which language is this?':esc(L.name))+'</figcaption></figure>'}
 return'<figure class="dm dm-flag '+k+'"><img src="'+fl(c)+'" alt="" loading="lazy"></figure>'}
/* a photo from 1.25:1 to 2.1:1 fills its card (16:10), cropped a little top and bottom or at the sides; narrower or wider
   ones stay whole over their blurred copy */
function fit(im){const f=im.parentNode;if(!f||!f.classList||!f.classList.contains("dm-ph")||!im.naturalWidth)return;const r=im.naturalWidth/im.naturalHeight;
 f.classList.toggle("dm-fill",!f.classList.contains("dm-whole")&&r>=1.25&&r<=2.1)}
document.addEventListener("load",e=>{const t=e.target;if(t&&t.tagName==="IMG")fit(t)},true);
/* the lightbox: a Study card's photo, whole and large, with its name, country and credit; ←/→ (or the arrows) step through
   the cards on the page, ×, Esc or a click outside the picture close it */
const cname=c=>{try{const x=(typeof COUNTRIES!=="undefined"?COUNTRIES:[]).find(o=>o.c===c);return x?x.n:c.toUpperCase()}catch(e){return c}};
function credit(P){return[P.by,P.lic].filter(Boolean).join(" · ")||"Wikimedia Commons"}
let LB=null;
function lbList(){return[...document.querySelectorAll(".dm-zoom[data-dm-c]")]}
function lbShow(fig){const id=fig.dataset.dmId,c=fig.dataset.dmC,v=F(c),P=photo(id,c);if(!P||!v)return;LB.cur=fig;
 const name=SUBJ[id](v)||"",L=lbList(),i=L.indexOf(fig),d=LB.el;
 d.querySelector(".dm-lb-img").src=P.src;d.querySelector(".dm-lb-img").alt=name;
 d.querySelector(".dm-lb-name").textContent=name;d.querySelector(".dm-lb-ctry").textContent=cname(c);
 const a=d.querySelector(".dm-lb-cr");a.textContent="Photo: "+credit(P)+(P.page?" · Wikimedia Commons":"");if(P.page){a.href=P.page;a.removeAttribute("aria-disabled")}else{a.removeAttribute("href");a.setAttribute("aria-disabled","true")}
 d.querySelector(".dm-lb-n").textContent=L.length>1&&i>=0?(i+1)+" / "+L.length:"";
 d.querySelectorAll(".dm-lb-prev,.dm-lb-next").forEach(b=>b.hidden=L.length<2)}
function lbStep(k){const L=lbList();if(!LB||L.length<2)return;let i=L.indexOf(LB.cur);i=((i<0?0:i+k)%L.length+L.length)%L.length;lbShow(L[i]);try{L[i].scrollIntoView({block:"nearest"})}catch(e){}}
function lbClose(){if(!LB)return;const f=LB.cur;LB.el.remove();document.removeEventListener("keydown",LB.key,true);LB=null;try{if(f&&f.isConnected)f.focus({preventScroll:true})}catch(e){}}
function lbOpen(fig){if(LB)lbClose();const d=document.createElement("div");d.className="dm-lb";d.setAttribute("role","dialog");d.setAttribute("aria-modal","true");d.setAttribute("aria-label","Photo");
 d.innerHTML='<figure class="dm-lb-fig"><img class="dm-lb-img" alt=""><figcaption><span class="dm-lb-t"><b class="dm-lb-name"></b> <span class="dm-lb-ctry"></span></span><a class="dm-lb-cr" target="_blank" rel="noopener"></a><span class="dm-lb-n"></span></figcaption></figure>'+
  '<button type="button" class="dm-lb-x" aria-label="Close">×</button><button type="button" class="dm-lb-prev" aria-label="Previous card">‹</button><button type="button" class="dm-lb-next" aria-label="Next card">›</button>';
 const key=e=>{if(e.key==="Escape"){e.stopPropagation();e.preventDefault();lbClose()}else if(e.key==="ArrowLeft"||e.key==="ArrowRight"){e.stopPropagation();e.preventDefault();lbStep(e.key==="ArrowLeft"?-1:1)}};
 d.addEventListener("click",e=>{if(e.target.closest(".dm-lb-prev")){lbStep(-1);return}if(e.target.closest(".dm-lb-next")){lbStep(1);return}
  if(e.target.closest(".dm-lb-x")||!e.target.closest(".dm-lb-img,figcaption"))lbClose()});
 /* a swipe steps too, on a phone */
 let sx=null;d.addEventListener("touchstart",e=>{sx=e.touches.length===1?e.touches[0].clientX:null},{passive:true});
 d.addEventListener("touchend",e=>{if(sx==null)return;const dx=e.changedTouches[0].clientX-sx;sx=null;if(Math.abs(dx)>50)lbStep(dx<0?1:-1)},{passive:true});
 LB={el:d,key,cur:fig};document.addEventListener("keydown",key,true);document.body.appendChild(d);lbShow(fig);d.querySelector(".dm-lb-x").focus({preventScroll:true})}
/* ⓘ on a Study card shows the credit on the card itself (and does not open the lightbox) */
function crToggle(fig){const o=fig.querySelector(".dm-crpop");if(o){o.remove();return}const P=photo(fig.dataset.dmId,fig.dataset.dmC);if(!P)return;
 const s=document.createElement("span");s.className="dm-crpop";s.innerHTML="Photo: "+esc(credit(P))+(P.page?' · <a href="'+esc(P.page)+'" target="_blank" rel="noopener">Commons</a>':"");fig.appendChild(s)}
document.addEventListener("click",e=>{const t=e.target;if(!t||!t.closest)return;const fig=t.closest(".dm-zoom");if(!fig)return;
 if(t.closest(".dm-crpop")){if(!t.closest("a"))fig.querySelector(".dm-crpop").remove();e.stopPropagation();return}
 e.preventDefault();e.stopPropagation();if(t.closest(".dm-cr")){crToggle(fig);return}lbOpen(fig)});
document.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target&&e.target.classList&&e.target.classList.contains("dm-zoom")){e.preventDefault();lbOpen(e.target)}});
window.gfDrillMedia={html,has:(id,c)=>!!(SUBJ[id]&&photo(id,c)),photo,langImg,open:lbOpen};
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
.dm-ph.dm-fill .dm-bg{ display:none; } .dm-ph.dm-fill img, .pro-card .dm-ph.dm-fill img{ object-fit:cover; }
/* Study cards: the photo opens the lightbox, ⓘ shows the credit */
.dm-zoom{ cursor:zoom-in; } .dm-zoom:focus-visible{ outline:3px solid #4d90fe; outline-offset:2px; }
.dm-zoom .dm-cr{ pointer-events:auto; cursor:pointer; width:22px; height:22px; line-height:22px; font-size:12px; }
.dm-crpop{ position:absolute; left:6px; right:6px; top:32px; padding:6px 8px; border-radius:8px; background:rgba(12,18,28,.86); color:#fff; font:500 11.5px/1.35 system-ui,sans-serif; cursor:default; z-index:2; }
.dm-crpop a{ color:#bcd3ee; }
.dm-lb{ position:fixed; inset:0; z-index:100200; background:rgba(6,10,18,.9); display:flex; align-items:center; justify-content:center; padding:48px 56px 16px; box-sizing:border-box; cursor:zoom-out; }
.dm-lb-fig{ margin:0; display:flex; flex-direction:column; align-items:center; max-width:100%; max-height:100%; }
.dm-lb-img{ display:block; max-width:min(1100px,100%); max-height:calc(100vh - 150px); width:auto; height:auto; object-fit:contain; border-radius:10px; box-shadow:0 18px 50px rgba(0,0,0,.5); cursor:default; background:#1b2230; }
.dm-lb figcaption{ display:flex; flex-wrap:wrap; align-items:baseline; gap:4px 14px; justify-content:center; margin-top:10px; color:#eef3fb; font:500 13px/1.4 system-ui,sans-serif; text-align:center; cursor:default; max-width:min(1100px,100%); }
.dm-lb-name{ font-size:15px; } .dm-lb-ctry{ color:#b9c6d8; } .dm-lb-cr{ color:#bcd3ee; font-size:12px; } .dm-lb-n{ color:#8f9db0; font-size:12px; }
.dm-lb button{ position:absolute; border:0; border-radius:50%; background:rgba(255,255,255,.14); color:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center; font:300 30px/1 system-ui,sans-serif; }
.dm-lb button:hover, .dm-lb button:focus-visible{ background:rgba(255,255,255,.28); outline:none; }
.dm-lb-x{ top:10px; right:12px; width:40px; height:40px; font-size:28px !important; }
.dm-lb-prev, .dm-lb-next{ top:50%; transform:translateY(-50%); width:44px; height:44px; font-size:34px !important; padding-bottom:4px; }
.dm-lb-prev{ left:8px; } .dm-lb-next{ right:8px; } .dm-lb button[hidden]{ display:none; }
@media (max-width:600px){ .dm-lb{ padding:56px 8px 12px; } .dm-lb-prev, .dm-lb-next{ top:auto; bottom:14px; transform:none; } .dm-lb-img{ max-height:calc(100vh - 190px); } .dm-lb figcaption{ padding:0 48px; } }
.pro-card .dm-ph figcaption{ display:none; }
.dm-flag{ background:#f3f5f8; } .dm-flag img, .pro-card .dm-flag img{ object-fit:contain; padding:10%; filter:drop-shadow(0 2px 6px rgba(0,0,0,.18)); }
.dm-lang{ background:#fff; flex-direction:column; } .dm-lang img, .pro-card .dm-lang img{ object-fit:contain; height:auto !important; max-height:72%; padding:0 6%; }
.dm-lang figcaption{ font:600 11px system-ui; color:#6a7383; margin-top:4px; }
/* currency: one 2:1 tray, one neutral colour, no blurred backdrop; every image is already 800×400 with a transparent surround */
.dm.dm-cur{ aspect-ratio:2/1; background:#eceff3; }
.dm-cur img, .pro-card .dm-cur img{ object-fit:contain; padding:5% 6%; box-sizing:border-box; filter:drop-shadow(0 2px 6px rgb(0 0 0 / .15)); }
.dm-cur .dm-cr{ opacity:.7; } .dm-cur:hover .dm-cr{ opacity:1; }
.dm-note{ width:72%; height:72%; border-radius:6px; display:flex; align-items:center; justify-content:center; color:#4f5b69;
 background:#dfe4ea; box-shadow:inset 0 0 0 5px #dfe4ea, inset 0 0 0 6px rgb(79 91 105 / .35), 0 2px 6px rgb(0 0 0 / .15); }
.dm-note .dm-sym{ font:800 clamp(22px,4.2vw,46px)/1 system-ui,sans-serif; letter-spacing:-.01em; }
body.sky-night .dm.dm-cur{ background:#222b38; } body.sky-night .dm-note{ background:#323d4c; color:#c9d2dd; box-shadow:inset 0 0 0 5px #323d4c, inset 0 0 0 6px rgb(201 210 221 / .3), 0 2px 6px rgb(0 0 0 / .3); }
body.sky-night .dm{ background:#253049; } body.sky-night .dm-flag{ background:#2a3550; }
body.sky-night .dm-lang{ background:#f4f1ea; } body.sky-night .dm-lang figcaption{ color:#5d6574; }`;document.head.appendChild(st);
})();
