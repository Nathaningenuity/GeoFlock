/* GeoFlock: the last card of a tour suggests what to take next. Up to three tours you have not finished: the closest ones
   on the same theme first, then one from another shelf that still connects; tours in a series (world history) point to
   the next part instead. Always followed by "Explore all tours". */
(function(){
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
/* series: the next part is the natural continuation */
const SERIES=[["hancient","hmedieval","hgunpowder","hrevolutions","hwars","hcoldwar","hsince91"],["heurope","hasia","hafrica","hnamerica","hsamerica","hoceania","hantarctica"],
 ["europe","asia","africa","namerica","samerica","oceania","antarctica"]];
/* hand-picked neighbours: closest first; the last one or two reach into another shelf */
const REL={
 geo:["pop","elev","space"],pop:["cities","migration","geo"],projections:["geo","space","time"],space:["night","geo","climate"],night:["pop","cities","space"],time:["projections","geo","space"],
 elev:["plates","ranges","biomes"],plates:["volcanoes","hazards","islands","hancient"],climate:["weather","biomes","deserts"],weather:["climate","coasts","ice"],rivers:["lakes","seas","crops"],lakes:["rivers","ice","seas"],
 seas:["coasts","ocean","rivers"],coasts:["seas","islands","ocean"],islands:["islandlife","coasts","volcanoes"],deserts:["climate","weather","biomes"],ice:["climate","weather","coasts"],
 ranges:["elev","volcanoes","caves"],volcanoes:["plates","hazards","ranges"],hazards:["plates","volcanoes","weather"],caves:["ranges","elev","hancient"],
 animals:["amigration","biomes","islandlife"],biomes:["forests","climate","animals"],forests:["biomes","environment","animals"],ocean:["seas","amigration","coasts"],amigration:["animals","ocean","migration"],
 environment:["forests","energy","climate"],islandlife:["islands","animals","humans"],humans:["migration","hancient","animals"],crops:["food","biomes","rivers"],
 cities:["pop","night","capitals"],migration:["people","humans","pop"],people:["migration","langrel","culture"],culture:["langrel","festivals","people"],langrel:["culture","words","festivals"],
 food:["crops","festivals","culture"],sports:["festivals","music","cities"],musicsport:["music","sports","festivals"],festivals:["culture","langrel","food"],houses:["climate","cities","culture"],
 landmarks:["art","cities","hancient"],flags:["govmap","borders","capitals"],
 art:["landmarks","literature","music"],music:["festivals","art","culture"],literature:["philosophy","words","art"],philosophy:["literature","science","hancient"],mythology:["literature","langrel","hancient"],
 science:["maths","inventions","space"],maths:["science","projections","geo"],psychology:["people","time","climate"],inventions:["science","transport","hrevolutions"],words:["langrel","literature","learning"],learning:["words","science","literature"],
 govmap:["politics","geopol","borders"],politics:["govmap","geopol","conflicts"],capitals:["cities","govmap","flags"],geopol:["politics","borders","conflicts"],borders:["geopol","flags","conflicts"],
 regions:["borders","govmap","europe"],gdp:["resources","transport","currencies"],transport:["gdp","energy","seas"],energy:["resources","environment","transport"],resources:["energy","gdp","hazards"],
 currencies:["gdp","capitals","hrevolutions"],conflicts:["geopol","borders","hwars"],
 hempires:["hmedieval","hancient","explorers"],hmodern:["hrevolutions","hwars","geopol"],explorers:["hgunpowder","seas","islands"]};
function done(id){try{const o=(stats.tourProg||{})[id];return!!(o&&o.done)}catch(e){return false}}
function shelfOf(id){try{const S=window.gfTourShelves||[];const s=S.find(x=>x[3].includes(id));return s?s[0]:null}catch(e){return null}}
function ok(id,cur){try{const T=PS_TOURS[id];return T&&T.group!=="_retired"&&id!==cur&&!done(id)&&(T.steps||[]).length}catch(e){return false}}
function picks(cur){const out=[];const add=id=>{if(out.length<3&&!out.includes(id)&&ok(id,cur))out.push(id)};
 /* a series: the next part (and the one after), nothing else */
 for(const S of SERIES){const i=S.indexOf(cur);if(i>=0){S.slice(i+1).forEach(id=>{if(out.length<2)add(id)});if(out.length)return{ids:out,series:true}}}
 const sh=shelfOf(cur),S=window.gfTourShelves||[],rel=REL[cur]||[];
 /* two on the same theme, then one from another shelf that still connects */
 rel.filter(id=>shelfOf(id)===sh).forEach(id=>{if(out.length<2)add(id)});rel.filter(id=>shelfOf(id)!==sh).forEach(id=>{if(out.length<3)add(id)});rel.forEach(add);
 /* then the rest of the same shelf, in shelf order, keeping one place for another shelf */
 if(out.length<2&&sh){const row=S.find(x=>x[0]===sh);if(row)row[3].forEach(id=>{if(out.length<2)add(id)})}
 if(out.length<3&&!out.some(id=>shelfOf(id)!==sh)){(REL[cur]||[]).forEach(r=>(REL[r]||[]).forEach(id=>{if(shelfOf(id)!==sh)add(id)}))}
 if(out.length<3&&sh){const row=S.find(x=>x[0]===sh);if(row)row[3].forEach(add)}
 return{ids:out.slice(0,3),series:false}}
function html(cur){const P=picks(cur),cov=id=>{try{return TOUR_THUMBS[id]||""}catch(e){return""}};
 const card=id=>{const T=PS_TOURS[id],c=cov(id);return'<button type="button" class="tnx-card" data-ps-nexttour="'+esc(id)+'" title="'+esc(T.hint||"")+'">'+(c?'<span class="tnx-img"><img src="'+esc(c)+'" alt="" loading="lazy"></span>':'<span class="tnx-img tnx-none"></span>')+'<span class="tnx-t"><b>'+esc(T.short||T.name)+'</b><small>'+esc(T.hint||"")+'</small></span></button>'};
 return'<div class="tnx"><div class="tnx-h">'+(P.series?"Continue the story":"Where next?")+'</div>'+(P.ids.length?'<div class="tnx-list">'+P.ids.map(card).join("")+'</div>':'<p class="tnx-none-t">You have taken every tour close to this one.</p>')+
  '<button type="button" class="tnx-all" data-ps-hub>Explore all tours →</button></div>'}
/* the old single "Next:" button becomes this block */
const hook=()=>{if(typeof psCardHTML!=="function"||psCardHTML._tnx)return false;const _c=psCardHTML;psCardHTML=function(){let h=_c.apply(this,arguments);
 try{if(ps&&psSteps&&ps.i===psSteps().length-1&&!document.body.classList.contains("hg-touring")){const blk=html(ps.tour);
  if(/<div class="ps-nextwrap">[\s\S]*?<\/div>/.test(h))h=h.replace(/<div class="ps-nextwrap">[\s\S]*?<\/div>/,blk);
  else{h=h.replace(/<button type="button" class="ps-btn ps-nexttour"[\s\S]*?<\/button>/,"");h=h.replace('<div class="ps-dots"',blk+'<div class="ps-dots"')}}}catch(e){console.error(e)}return h};psCardHTML._tnx=1;return true};
if(!hook()){const t=setInterval(()=>{if(hook())clearInterval(t)},400)}
window.gfTourNext=picks;
const css=document.createElement("style");css.textContent=`
.tnx{ margin:4px 0 10px; } .tnx-h{ font:800 12px/1 inherit; font-family:inherit; text-transform:uppercase; letter-spacing:.08em; color:#c25a10; margin:2px 2px 8px; }
.tnx-list{ display:grid; gap:7px; }
.tnx-card{ display:grid; grid-template-columns:58px 1fr; gap:10px; align-items:center; padding:6px; border-radius:12px; border:1px solid rgba(22,50,79,.1); background:rgba(22,50,79,.04); text-align:left; cursor:pointer; font:inherit; color:inherit; }
.tnx-card:hover{ background:rgba(22,50,79,.09); }
.tnx-img{ width:58px; height:42px; border-radius:8px; overflow:hidden; display:block; background:linear-gradient(135deg,#8fd1c4,#7cb4e8); } .tnx-img img{ width:100%; height:100%; object-fit:cover; display:block; }
.tnx-t b{ display:block; font-size:13.5px; line-height:1.2; } .tnx-t small{ display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; font-size:11.5px; opacity:.7; line-height:1.3; margin-top:2px; }
.tnx-all{ margin-top:8px; width:100%; padding:8px; border-radius:12px; border:1px dashed rgba(22,50,79,.25); background:none; font:700 13px inherit; font-family:inherit; color:#1f6f9f; cursor:pointer; }
.tnx-none-t{ font-size:12.5px; opacity:.7; margin:0 2px 4px; }
body.sky-night .tnx-card{ background:rgba(255,255,255,.06); border-color:rgba(255,255,255,.12); } body.sky-night .tnx-all{ color:#8fd0ff; border-color:rgba(255,255,255,.25); } body.sky-night .tnx-h{ color:#ffb27a; }`;
document.head.appendChild(css);
})();
