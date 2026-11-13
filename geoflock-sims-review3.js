/* GeoFlock: simulation review, batch 3 (DG keys rainshadow … worldclock). Fixes and new play for diagrams, re-registered
   here under their old keys so tour stops, the Models browser and the dictionary pick them up. Loaded after
   geoflock-sims-review2.js. */
(function(){
"use strict";
if(typeof DG==="undefined"||typeof dgT!=="function")return;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");
const dyn=(svg,h)=>{try{dgDyn(svg,h)}catch(e){const g=svg.querySelector(".dg-dyn");if(g)g.innerHTML=h}};

/* ------------------------------------------------------------------ guess first, then see the simulation
   The one-tap guess of batches 1 and 2 (geoflock-sims-review1.js, -review2.js), made a shared helper: window.gfGuessFirst(
   key,[question,[options],right index,why]) lays a question over the diagram; any answer (or "just show me") reveals it.
   Answers come from each diagram's own model or its cited figures, named with each question below. */
const GQ_ACC="#e8701a",GQ_INK="#1d3047";
const wrap=(t,max)=>{const out=[];let line="";t.split(" ").forEach(x=>{if((line+" "+x).trim().length>max){out.push(line);line=x}else line=(line+" "+x).trim()});if(line)out.push(line);return out};
function guessFirst(k,Q){const D=DG[k];if(!D||D._gq)return;const [qq,opts,ans,why]=Q;const svg0=D.svg,act0=D.act;D._gq=1;
 D.svg=(...a)=>{const s=svg0.apply(D,a);if(typeof s!=="string")return s;const m=/viewBox="0 0 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)"/.exec(s);if(!m)return s;const W=+m[1],H=+m[2];
  let o='<g class="gq-ov"><rect x="0" y="0" width="'+W+'" height="'+H+'" rx="6" fill="#f3f6fa" opacity=".98"/>';
  const L=wrap(qq,52),y0=Math.max(16,H/2-28-L.length*6);L.forEach((l,i)=>{o+=dgT(W/2,y0+i*12,esc(l),'text-anchor="middle" font-size="9.5" font-weight="800" fill="'+GQ_INK+'"')});
  const bw=opts.length>3?62:opts.length>2?84:110,gap=6,tw=opts.length*bw+(opts.length-1)*gap,bx=(W-tw)/2,by=y0+L.length*12+6;
  opts.forEach((t,i)=>{const x=bx+i*(bw+gap);o+='<g data-act="gq:'+i+'" class="gq-b" style="cursor:pointer"><rect x="'+x+'" y="'+by+'" width="'+bw+'" height="18" rx="9" fill="#fff" stroke="'+GQ_ACC+'" stroke-width="1.4"/>'+dgT(x+bw/2,by+12.2,esc(t),'text-anchor="middle" font-size="7.6" font-weight="800" fill="'+GQ_INK+'"')+'</g>'});
  o+='<g class="gq-why"></g><g data-act="gq:skip" style="cursor:pointer"><rect x="'+(W/2-60)+'" y="'+(by+25)+'" width="120" height="13" fill="transparent"/>'+dgT(W/2,by+34,"just show me",'text-anchor="middle" font-size="6.8" font-weight="700" fill="#5b6b80" text-decoration="underline"')+'</g></g>';
  return s.replace(/<\/svg>\s*$/,o+"</svg>")};
 D.act=(svg,a,...r)=>{if(!/^gq:/.test(a))return act0?act0.call(D,svg,a,...r):false;const ov=svg.querySelector(".gq-ov");if(!ov||ov._done)return true;
  const hide=()=>{ov._done=1;ov.style.transition="opacity .5s";ov.style.opacity="0";setTimeout(()=>{ov.style.display="none"},520)};
  if(a==="gq:skip"){hide();return true}
  const i=+a.slice(3),right=i===ans;ov.querySelectorAll(".gq-b").forEach((b,j)=>{const rr=b.querySelector("rect"),t=b.querySelector("text");if(j===ans){rr.style.fill="#2f9a5a";rr.style.stroke="#2f9a5a";t.style.fill="#fff"}else if(j===i){rr.style.fill="#c94b2c";rr.style.stroke="#c94b2c";t.style.fill="#fff"}});
  const W=+(svg.getAttribute("viewBox")||"0 0 300").split(" ")[2]||300,b0=ov.querySelector(".gq-b rect"),by=b0?+b0.getAttribute("y")+30:100;
  const L=wrap((right?"Right! ":"Not quite. ")+why,66);let h="";L.forEach((l,j)=>{h+=dgT(W/2,by+j*10,esc(l),'text-anchor="middle" font-size="7.4" font-weight="'+(j?600:800)+'" fill="'+(right?"#2f7a3a":"#b23c0a")+'"')});
  const wy=ov.querySelector(".gq-why");if(wy)wy.innerHTML=h;const sk=ov.querySelector('[data-act="gq:skip"]');if(sk)sk.style.display="none";
  ov._done=1;setTimeout(()=>{ov._done=0;hide()},2600+L.length*700);return true}}
window.gfGuessFirst=guessFirst;
try{
/* rainshadow: the diagram's own model (20 °C at sea level; cools 9.8 °C/km to the cloud base at 1 km, then about 6 °C/km
   while it rains; warms 9.8 °C/km going down dry): over the 4.4 km Sierra Nevada it arrives at 33 °C. This warm dry
   downslope wind is the foehn (Met Office; NOAA calls it a chinook in the Rockies). */
guessFirst("rainshadow",["Sea air at 20 °C rises over a 4.4 km mountain and rains on the way up. How warm is it when it reaches the plain on the far side?",["Colder, ~10 °C","Same, 20 °C","Warmer, ~33 °C"],2,"Warmer: rising air cools only about 6 °C per km while its vapour turns to rain (that releases heat), but the dry air coming down warms 9.8 °C per km. In the Alps this wind is the foehn."]);
/* silkroad: the diagram's own figures, about 9,300 km at 30–40 km a day, about 9 months without a day's rest */
guessFirst("silkroad",["A camel caravan walks from Luoyang in China to Rome without one day of rest. How long does it take?",["About 1 month","About 9 months","About 3 years"],1,"About 9 months for some 9,300 km at a camel’s pace. With rests, markets and winters it took far longer, and no trader made the whole trip: silk changed hands many times."]);
/* slr: the diagram's own figures, 58 m (Antarctica, Fretwell et al. 2013) + 7.4 m (Greenland, Morlighem et al. 2017)
   + 0.32 m (mountain glaciers, Farinotti et al. 2019) ≈ 66 m */
guessFirst("slr",["If all the ice on land melted, how much higher would the sea be?",["About 7 m","About 66 m","About 300 m"],1,"About 66 m, roughly a 20-storey building: 58 m from Antarctica, 7.4 m from Greenland and a third of a metre from mountain glaciers. Sea ice already floats, so it adds nothing."]);
}catch(e){console.warn("review3 guess",e)}

/* ------------------------------------------------------------------ The rank-size rule: a real country
   The two tabs were schematic numbers only. A third tab puts real cities against the rule: the eight biggest US
   metropolitan areas at the 2020 census (US Census Bureau, 2023 metro-area definitions, as listed in Wikipedia's
   "Metropolitan statistical area"): New York 20,081,935; Los Angeles 13,200,998; Chicago 9,449,351; Dallas–Fort Worth
   7,637,387; Houston 7,149,642; Washington 6,278,542; Miami 6,138,333; Atlanta 6,104,803. The rule predicts the 8th at
   20.1 ÷ 8 = 2.5 million; the real one has 6.1 million, so the lower ranks fall off far more slowly than Zipf's rule. */
try{(function(){
const D=DG.ranksize;if(!D||!D._draw||D._us)return;D._us=1;const draw0=D._draw;
const US=[["New York",20.08],["LA",13.2],["Chicago",9.45],["Dallas",7.64],["Houston",7.15],["DC",6.28],["Miami",6.14],["Atlanta",6.1]];
D.svg=()=>'<svg viewBox="0 0 300 176">'+dgTabs(["Rank-size rule","A primate city","Real: the USA"],0,4)+'<g class="dg-dyn"></g></svg>';
D._draw=svg=>{if(D._tab!==2)return draw0(svg);let h="";const X0=34,Y0=140,k=98/20.08;
 US.forEach(([n,v],i)=>{const x=X0+i*32,ideal=20.08/(i+1);
  h+='<rect x="'+x+'" y="'+(Y0-v*k).toFixed(1)+'" width="22" height="'+(v*k).toFixed(1)+'" rx="2" fill="'+(i?"#6c8ebf":"#c94b2c")+'"'+dgTip(n+": "+v.toFixed(1)+" million (the rule predicts "+ideal.toFixed(1)+" million)")+"/>"+
   dgT(x+11,(Y0-v*k-3).toFixed(1),v.toFixed(1),'text-anchor="middle" font-size="6.6" font-weight="800"')+dgT(x+11,Y0+9,n,'text-anchor="middle" font-size="6.6"')+
   '<line x1="'+x+'" x2="'+(x+22)+'" y1="'+(Y0-ideal*k).toFixed(1)+'" y2="'+(Y0-ideal*k).toFixed(1)+'" stroke="#1d3047" stroke-dasharray="2 2"/>'});
 h+=dgT(X0,30,"Biggest US metro areas, 2020 census, millions (dashes: the rule)",'font-size="7.8" font-weight="700"');
 h+=dgT(X0,160,"Real cities fall off more slowly: the 8th has 6.1 million, not 2.5",'font-size="7.2" opacity=".85"')+dgT(X0,170,"hover the bars",'class="dg-hint"');
 dyn(svg,h)};
})()}catch(e){console.warn("review3 ranksize",e)}

/*@@MORE@@*/
})();
