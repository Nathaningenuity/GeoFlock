/* GeoFlock: the toolkit's die. Throw it onto the map (drag it out of the tray, or press it for a random throw) and it
   tells you a quick fun fact about what it landed on: usually the country, now and then something close by (a city, a
   lake, a river, a mountain range, a desert, a landmark...). The facts come from the guided tours' own stops (the stop's
   headline fact, with the tour it comes from); a country no stop talks about gets a few facts from the country data.
   The card closes with ×, Esc, a click elsewhere, or by itself after a while. */
(function(){
"use strict";
const NEAR_CATS={cities:1,lakes:1,rivers:1,ranges:1,peaks:1,deserts:1,forests:1,volcanoes:1,waterfalls:1,landmarks:1,islands:1,groups:1,seas:1};
const KIND={cities:"city",lakes:"lake",rivers:"river",ranges:"mountain range",peaks:"mountain",deserts:"desert",forests:"forest",volcanoes:"volcano",waterfalls:"waterfall",landmarks:"landmark",islands:"island",groups:"islands",seas:"sea"};
const strip=s=>String(s==null?"":s).replace(/​/g,"").trim();
let STOPS=null;
function stops(){if(STOPS)return STOPS;STOPS=[];try{for(const[id,T]of Object.entries(PS_TOURS)){if(!T||!Array.isArray(T.steps))continue;const tn=strip(T.name||T.title||id).replace(/^Guided tour (on|of) /i,"");
  T.steps.forEach(S=>{if(!S||!S.stat||/^Now explore/i.test(S.title||""))return;STOPS.push({tour:tn,title:strip(S.title),stat:strip(S.stat),text:(strip(S.title)+" "+strip(S.stat)).toLowerCase(),hi:Array.isArray(S.hi)?S.hi:[]})})}}catch(e){}return STOPS}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]);
function nameKeys(n){n=strip(n);const k=[n.toLowerCase()];const b=n.replace(/^(Lake|Mount|Mt\.?|River|The|Lac|Lago|Cape)\s+/i,"").replace(/\s+(River|Lake|Mountains|Desert|Falls|Island|Islands)$/i,"");if(b.length>4&&b!==n)k.push(b.toLowerCase());return k}
const wordIn=(t,k)=>{const i=t.indexOf(k);if(i<0)return false;const a=t[i-1],z=t[i+k.length];return!(a&&/[a-z]/.test(a))&&!(z&&/[a-z]/.test(z))};
function factsFor(name){const ks=nameKeys(name);return stops().filter(s=>ks.some(k=>k.length>3&&wordIn(s.text,k)))}
const pick=a=>a[Math.floor(Math.random()*a.length)];
function countryFallback(code){const C=typeof COUNTRY_BY_CODE!=="undefined"&&COUNTRY_BY_CODE[code],D=typeof DRILL_FACTS!=="undefined"&&DRILL_FACTS[code];if(!C)return null;const out=[];
 if(C.caps&&C.caps.length)out.push("Its capital is "+C.caps[0]+".");if(D){if(D.lm)out.push("Best-known sight: "+D.lm+".");if(D.an)out.push("National animal: the "+D.an.toLowerCase()+".");if(D.cur)out.push("Money: the "+D.cur+(D.sym?" ("+D.sym+")":"")+".");if(D.lang&&D.lang.length)out.push("People speak "+D.lang.slice(0,2).join(" and ")+".")}
 return out.length?out.slice(0,3).join(" "):null}
/* what the die landed on */
function target(ll,f){const code=f&&f.properties?String(f.properties.c||"").toLowerCase():"";const cn=code&&typeof COUNTRY_BY_CODE!=="undefined"&&COUNTRY_BY_CODE[code]?COUNTRY_BY_CODE[code].n:(f&&f.properties&&f.properties.n)||"";
 /* about one throw in three, or always at sea: something close by that a tour talks about */
 let near=null;if(ll&&(!code||Math.random()<.35)){try{const z=(typeof amGlobe!=="undefined"&&amGlobe&&amGlobe.zoom)||1,R=Math.min(.12,.07/Math.sqrt(z));
   const C=(gfSearch.build()||[]).filter(e=>NEAR_CATS[e.cat]&&e.ll&&d3.geoDistance(e.ll,ll)<R&&(code||e.cat==="seas"||e.cat==="islands"||e.cat==="groups"));
   const W=C.map(e=>({e,F:factsFor(e.n)})).filter(x=>x.F.length);if(W.length){W.sort((a,b)=>(b.e.fame||0)-(a.e.fame||0));near=pick(W.slice(0,6))}}catch(e){}}
 if(near){const F=pick(near.F);return{title:near.e.n,kind:KIND[near.e.cat]||near.e.cat,where:cn,fact:F.stat,src:F.tour+" › "+F.title,at:near.e.ll}}
 if(code&&code!=="aq"||cn){const F=factsFor(cn);if(F.length){const s=pick(F);return{title:cn,kind:"country",fact:s.stat,src:s.tour+" › "+s.title,at:ll}}
  const fb=countryFallback(code);if(fb)return{title:cn,kind:"country",fact:fb,src:"",at:ll}}
 if(code==="aq")return{title:"Antarctica",kind:"continent",fact:"Antarctica holds about 70% of the world’s fresh water, frozen in ice up to almost 5 km thick.",src:"",at:ll};
 /* at sea: the sea's name, and a fact about it if a tour has one */
 let sea=null;try{const w=amGlobe.waterAt(ll,0,0);sea=w&&(w.sea||w.water)||null}catch(e){}
 if(!sea)try{const S=(gfSearch.build()||[]).filter(e=>e.cat==="seas"&&e.ll).sort((a,b)=>d3.geoDistance(a.ll,ll)-d3.geoDistance(b.ll,ll))[0];if(S&&d3.geoDistance(S.ll,ll)<.35)sea=S.n}catch(e){}
 if(sea){const F=factsFor(sea);if(F.length){const s=pick(F);return{title:"Splash! "+sea,kind:"sea",fact:s.stat,src:s.tour+" › "+s.title,at:ll}}}
 return{title:sea?"Splash! "+sea:"Splash!",kind:"ocean",fact:"It landed in the sea: about 71% of the Earth’s surface is ocean, so most throws of a die on a globe would land in water.",src:"",at:ll}}
/* the card */
let card=null,timer=0;
function close(){if(card){card.remove();card=null}clearTimeout(timer)}
function show(cx,cy,T){close();const h=document.querySelector("#allMapsWrap")||document.body;const hr=h.getBoundingClientRect();
 card=document.createElement("div");card.className="gf-dicefact";card.setAttribute("role","dialog");card.setAttribute("aria-label","Fun fact");
 card.innerHTML='<button type="button" class="gf-df-x" aria-label="Close">×</button><div class="gf-df-h">🎲 <b>'+esc(T.title)+'</b>'+(T.kind&&T.kind!=="country"?'<span>'+esc(T.kind)+(T.where?", "+esc(T.where):"")+'</span>':"")+'</div><p>'+esc(T.fact)+'</p>'+(T.src?'<small>From the tour on '+esc(T.src)+'</small>':"");
 h.appendChild(card);const w=card.offsetWidth,hh=card.offsetHeight;let x=cx-hr.left+18,y=cy-hr.top-hh/2;if(x+w>hr.width-8)x=cx-hr.left-w-18;x=Math.max(8,x);y=Math.max(8,Math.min(hr.height-hh-8,y));card.style.left=x+"px";card.style.top=y+"px";
 card.querySelector(".gf-df-x").onclick=e=>{e.stopPropagation();close()};["pointerdown","mousedown","click","wheel"].forEach(t=>card.addEventListener(t,e=>e.stopPropagation()));
 timer=setTimeout(close,16000)}
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&card)close()});
document.addEventListener("pointerdown",e=>{if(card&&!card.contains(e.target))close()},true);
/* a ring where the thing it landed on is */
function mark(ll){try{if(!ll||typeof amGlobe==="undefined"||!amGlobe)return;const s=amGlobe.projection()(ll);if(!s)return;const r=amGlobe.canvas.getBoundingClientRect(),h=document.querySelector("#allMapsWrap")||document.body,hr=h.getBoundingClientRect();
 const m=document.createElement("div");m.className="gf-df-ring";m.style.left=(r.left-hr.left+s[0])+"px";m.style.top=(r.top-hr.top+s[1])+"px";h.appendChild(m);setTimeout(()=>m.remove(),2600)}catch(e){}}
window.gfDiceLand=function(cx,cy,ll,f){const T=target(ll,f);if(T.at&&T.kind!=="country"&&T.kind!=="ocean")mark(T.at);show(cx,cy,T)};
{const st=document.createElement("style");st.textContent=`
.gf-dicefact{position:absolute;z-index:40;width:270px;padding:12px 14px 11px;border-radius:14px;background:#fffaf0;color:#2a2014;box-shadow:0 10px 30px rgba(10,20,40,.35);font:13.5px/1.42 inherit;font-family:inherit;animation:gfdf .28s ease-out}
.gf-dicefact .gf-df-h{font-size:15px;margin:0 18px 4px 0}.gf-dicefact .gf-df-h span{display:block;font-size:11.5px;color:#8a6a3c;text-transform:capitalize}
.gf-dicefact p{margin:0}.gf-dicefact small{display:block;margin-top:6px;color:#8a7458;font-size:11px}
.gf-df-x{position:absolute;top:6px;right:8px;border:0;background:none;font-size:18px;line-height:1;color:#8a7458;cursor:pointer;padding:2px 4px}
.gf-df-ring{position:absolute;z-index:39;width:30px;height:30px;margin:-15px 0 0 -15px;border-radius:50%;border:3px solid #ffcf4a;box-shadow:0 0 0 2px rgba(20,30,50,.5);pointer-events:none;animation:gfdfr 2.6s ease-out forwards}
@keyframes gfdf{from{opacity:0;transform:translateY(6px) scale(.97)}to{opacity:1;transform:none}}
@keyframes gfdfr{0%{transform:scale(.4);opacity:0}15%{opacity:1}100%{transform:scale(1.6);opacity:0}}`;document.head.appendChild(st)}
})();
