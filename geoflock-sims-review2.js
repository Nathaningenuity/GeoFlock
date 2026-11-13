/* GeoFlock: simulation review, batch 2 (DG keys h2cost … rain). Fixes and new play for diagrams, re-registered here
   under their old keys so tour stops, the Models browser and the dictionary pick them up. Loaded after
   geoflock-sims-review1.js. */
(function(){
"use strict";
if(typeof DG==="undefined"||typeof dgT!=="function")return;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const fmt=n=>Math.round(n).toLocaleString("en-GB");
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");
const dyn=(svg,h)=>{try{dgDyn(svg,h)}catch(e){const g=svg.querySelector(".dg-dyn");if(g)g.innerHTML=h}};

/* ------------------------------------------------------------------ Years of military rule in South America
   The chart showed one spell per country, so in 1950 it said "0 of 8" while General Odría ruled Peru, and Argentina's
   1966–73 and Ecuador's 1963–66 juntas were missing. Spells now follow Encyclopaedia Britannica's country histories:
   Argentina 1955–58 (Revolución Libertadora), 1966–73 (Onganía, Levingston, Lanusse), 1976–83; Peru 1948–56 (Odría),
   1962–63 (junta), 1968–80; Ecuador 1963–66 (junta), 1972–79; the others unchanged. A "guess" button asks for the
   year when most of them were under the army before revealing it. */
try{(function(){
const D=DG.juntas;if(!D||!D._draw)return;
D._D=[["Paraguay",[[1954,1989]]],["Brazil",[[1964,1985]]],["Bolivia",[[1964,1982]]],["Peru",[[1948,1956],[1962,1963],[1968,1980]]],["Ecuador",[[1963,1966],[1972,1979]]],["Chile",[[1973,1990]]],["Uruguay",[[1973,1985]]],["Argentina",[[1955,1958],[1966,1973],[1976,1983]]]];
D._y=1950;D._g=null;
const Y0=1945,Y1=1995,X0=70,X1=290,sx=y=>X0+(y-Y0)/(Y1-Y0)*(X1-X0);
const count=y=>D._D.filter(([c,sp])=>sp.some(([a,b])=>y>=a&&y<b)).length;
let best=0;for(let y=Y0;y<=Y1;y++)best=Math.max(best,count(y));
const peak=[];for(let y=Y0;y<=Y1;y++)if(count(y)===best)peak.push(y);
D.svg=()=>'<svg viewBox="0 0 300 200"><g class="dg-dyn"></g></svg>';
D.drag=(svg,n,x)=>{D._y=Math.round(clamp(Y0+(x-X0)/(X1-X0)*(Y1-Y0),Y0,Y1));if(D._g&&!D._g.done)D._g.pick=D._y;D._draw(svg)};
D.act=(svg,a)=>{if(a==="guess"){D._g={pick:D._y};D._y=Y0;D._g.pick=null}else if(a==="check"&&D._g&&D._g.pick!=null){D._g.done=1;D._g.ans=D._y}D._draw(svg)};
D._draw=svg=>{const G=D._g,hide=G&&!G.done;let h="";
 [1950,1960,1970,1980,1990].forEach(y=>{h+='<line x1="'+sx(y)+'" x2="'+sx(y)+'" y1="18" y2="152" stroke="#7d90a3" stroke-width=".4" stroke-dasharray="2 2"/>'+dgT(sx(y),162,y,'text-anchor="middle" font-size="7"')});
 let n=0;D._D.forEach(([c,sp],i)=>{const y=22+i*16,on=sp.some(([a,b])=>D._y>=a&&D._y<b);if(on)n++;
  h+="<g"+dgTip(c+": military rule "+sp.map(([a,b])=>a+"–"+b).join(", "))+">"+dgT(X0-5,y+9,c,'text-anchor="end" font-size="8.2"'+(on&&!hide?' font-weight="800"':""))+
   (hide?"":sp.map(([a,b])=>'<rect x="'+sx(a).toFixed(1)+'" y="'+y+'" width="'+(sx(b)-sx(a)).toFixed(1)+'" height="11" rx="2" fill="'+(on?"#c94b2c":"#d9a89a")+'"/>').join(""))+"</g>"});
 h+='<g class="dg-handle" data-drag="y"><rect x="'+(sx(D._y)-8)+'" y="14" width="16" height="146" fill="transparent"/><line x1="'+sx(D._y)+'" x2="'+sx(D._y)+'" y1="16" y2="154" stroke="#1d3047" stroke-width="1.4"/><circle cx="'+sx(D._y)+'" cy="154" r="5" fill="#1d3047" stroke="#fff" stroke-width="1.2"/></g>';
 const B=(act,x,w,l,on)=>'<g data-act="'+act+'" style="cursor:pointer"><rect x="'+x+'" y="2" width="'+w+'" height="13" rx="6.5" fill="'+(on?"#e8701a":"#1d3047")+'"/>'+dgT(x+w/2,11,l,'text-anchor="middle" font-size="6.8" font-weight="800" fill="#fff"')+"</g>";
 if(!G||G.done)h+=B("guess",206,86,G?"Guess again":"Guess the worst year");else h+=B("check",206,86,"Check my year",G.pick!=null);
 let msg,sub="";
 if(hide){msg=G.pick==null?"Drag to the year you think most were under the army":"Your guess: "+G.pick+" · press Check";sub="the bars are hidden until you check"}
 else{msg=D._y+": "+n+" of these 8 countries "+(n===1?"was":"were")+" under military rule";
  if(G&&G.done){const d=Math.min(...peak.map(p=>Math.abs(p-G.ans)));sub=(d===0?"Spot on! ":"You said "+G.ans+". ")+"All "+best+" were under the army from "+peak[0]+" to "+peak[peak.length-1]+(d===0?"":" ("+d+" year"+(d===1?"":"s")+" away)")+"."}
  else if(!G)sub="Drag the year. In the Cold War, armies took power in one country after another"}
 h+=dgT(8,178,msg,'font-size="8.6" font-weight="800"')+(sub?dgT(8,190,sub,'font-size="6.8" fill="#b04a14" font-weight="700"'):"");
 dyn(svg,h)};
})()}catch(e){console.warn("review2 juntas",e)}

/* ------------------------------------------------------------------ guess first, then see the chart
   The same one-tap guess as batch 1 (geoflock-sims-review1.js) on four more charts whose point is a surprise. Answers
   are the charts' own figures: USGS (each magnitude step about 32 times the energy); Baikal 23,600 km³ against the Great
   Lakes' 22,700 km³ (WorldAtlas, after US EPA); UN World Urbanization Prospects 2025 (Jakarta about 42 million); UN World
   Population Prospects 2024 (Asia about 59% of the people on about 30% of the land). */
try{(function(){
const Q={
 quake:["How many magnitude-5 earthquakes release as much energy as one magnitude 9?",["About 4","About 1,000","About a million"],2,"About a million: each step up in magnitude releases about 32 times the energy, and 32 × 32 × 32 × 32 ≈ 1,000,000 (USGS)."],
 lakesvol:["Which holds more water: Lake Baikal, or all five Great Lakes of North America together?",["Lake Baikal","The five Great Lakes"],0,"Lake Baikal, just: about 23,600 km³ against 22,700 km³. It is up to 1,642 m deep; the Great Lakes are wide but shallow."],
 megacities:["Which is the world’s biggest city in the UN’s 2025 count?",["Tokyo","Delhi","Jakarta","Shanghai"],2,"Jakarta, with about 42 million people. The UN now draws city edges more widely; Tokyo, long the leader, is third."],
 landpeople:["Asia has about 30% of the world’s land. What share of the world’s people live there?",["About a quarter","About a third","More than half"],2,"More than half: about 59% of everyone. Oceania has 6% of the land but under 1% of the people."]};
const ACC="#e8701a",INK="#1d3047";
const wrap=(t,max)=>{const out=[];let line="";t.split(" ").forEach(x=>{if((line+" "+x).trim().length>max){out.push(line);line=x}else line=(line+" "+x).trim()});if(line)out.push(line);return out};
Object.keys(Q).forEach(k=>{const D=DG[k];if(!D||D._gq)return;const [qq,opts,ans,why]=Q[k];const svg0=D.svg,act0=D.act;D._gq=1;
 D.svg=a=>{const s=svg0(a);if(typeof s!=="string")return s;const m=/viewBox="0 0 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)"/.exec(s);if(!m)return s;const W=+m[1],H=+m[2];
  let o='<g class="gq-ov"><rect x="0" y="0" width="'+W+'" height="'+H+'" rx="6" fill="#f3f6fa" opacity=".98"/>';
  const L=wrap(qq,52),y0=Math.max(16,H/2-28-L.length*6);L.forEach((l,i)=>{o+=dgT(W/2,y0+i*12,esc(l),'text-anchor="middle" font-size="9.5" font-weight="800" fill="'+INK+'"')});
  const bw=opts.length>3?62:opts.length>2?84:110,gap=6,tw=opts.length*bw+(opts.length-1)*gap,bx=(W-tw)/2,by=y0+L.length*12+6;
  opts.forEach((t,i)=>{const x=bx+i*(bw+gap);o+='<g data-act="gq:'+i+'" class="gq-b" style="cursor:pointer"><rect x="'+x+'" y="'+by+'" width="'+bw+'" height="18" rx="9" fill="#fff" stroke="'+ACC+'" stroke-width="1.4"/>'+dgT(x+bw/2,by+12.2,esc(t),'text-anchor="middle" font-size="7.6" font-weight="800" fill="'+INK+'"')+'</g>'});
  o+='<g class="gq-why"></g><g data-act="gq:skip" style="cursor:pointer"><rect x="'+(W/2-60)+'" y="'+(by+25)+'" width="120" height="13" fill="transparent"/>'+dgT(W/2,by+34,"just show me the chart",'text-anchor="middle" font-size="6.8" font-weight="700" fill="#5b6b80" text-decoration="underline"')+'</g></g>';
  return s.replace(/<\/svg>\s*$/,o+"</svg>")};
 D.act=(svg,a,...r)=>{if(!/^gq:/.test(a))return act0?act0.call(D,svg,a,...r):false;const ov=svg.querySelector(".gq-ov");if(!ov||ov._done)return true;
  const hide=()=>{ov._done=1;ov.style.transition="opacity .5s";ov.style.opacity="0";setTimeout(()=>{ov.style.display="none"},520)};
  if(a==="gq:skip"){hide();return true}
  const i=+a.slice(3),right=i===ans;ov.querySelectorAll(".gq-b").forEach((b,j)=>{const rr=b.querySelector("rect"),t=b.querySelector("text");if(j===ans){rr.style.fill="#2f9a5a";rr.style.stroke="#2f9a5a";t.style.fill="#fff"}else if(j===i){rr.style.fill="#c94b2c";rr.style.stroke="#c94b2c";t.style.fill="#fff"}});
  const W=+(svg.getAttribute("viewBox")||"0 0 300").split(" ")[2]||300,b0=ov.querySelector(".gq-b rect"),by=b0?+b0.getAttribute("y")+30:100;
  const L=wrap((right?"Right! ":"Not quite. ")+why,66);let h="";L.forEach((l,j)=>{h+=dgT(W/2,by+j*10,esc(l),'text-anchor="middle" font-size="7.4" font-weight="'+(j?600:800)+'" fill="'+(right?"#2f7a3a":"#b23c0a")+'"')});
  const wy=ov.querySelector(".gq-why");if(wy)wy.innerHTML=h;const sk=ov.querySelector('[data-act="gq:skip"]');if(sk)sk.style.display="none";
  ov._done=1;setTimeout(()=>{ov._done=0;hide()},2600+L.length*700);return true}});
})()}catch(e){console.warn("review2 guess",e)}

/* ------------------------------------------------------------------ Build a population pyramid: a goal
   "Stop the growth": life expectancy is set to 79 years and you hunt for the number of children per woman that holds the
   population steady. In this model the answer is about 2.1 (replacement fertility: 2 parents replaced, plus a little for
   the extra boys born and for the few girls who die before they have children; UN Population Division). Below that the
   population shrinks and ages; above it, it keeps growing. */
try{(function(){
const D=DG.pyramid;if(!D||D._goal)return;D._goal=1;const svg0=D.svg,act0=D.act,drag0=D.drag,init0=D.init;
D.svg=a=>{let s=svg0(a);if(typeof s!=="string")return s;s=s.replace('viewBox="0 0 300 206"','viewBox="0 0 300 224"');
 return s.replace(/<\/svg>\s*$/,'<g class="pp-goal"><g data-act="goal" style="cursor:pointer"><rect x="10" y="208" width="96" height="13" rx="6.5" fill="#1d3047"/>'+dgT(58,216.8,"Goal: stop the growth",'text-anchor="middle" font-size="6.6" font-weight="800" fill="#fff"')+'</g><text class="pp-gm" x="112" y="217" font-size="6.6" font-weight="700" fill="#b04a14"></text></g></svg>')};
const growth=s=>{if(!s.last)return null;const a=s.last.reduce((x,y)=>x+y,0),b=s.P.reduce((x,y)=>x+y,0);return(Math.pow(b/a,1/5)-1)*100};
function watch(svg){if(svg._ppw)return;svg._ppw=1;let last=-1;const go=()=>{if(!svg.isConnected){svg._ppw=0;return}const s=svg._s,m=svg.querySelector(".pp-gm");
  if(s&&m&&s.goal){const key=s.yr+"|"+s.tfr+"|"+s.le;if(key!==last){last=key;const g=growth(s);let t;
   if(s.le<75)t="Keep life expectancy near 79 years (the goal set it there)";
   else if(g==null||s.yr<5)t="Drag children per woman and watch the growth a year";
   else if(Math.abs(g)<.12){t="Done! "+s.tfr.toFixed(1)+" children per woman just replaces the parents";s.won=1}
   else t="Growth "+(g>0?"+":"")+g.toFixed(1)+"% a year: "+(g>0?"fewer children":"more children")+" per woman";
   m.textContent=t;m.setAttribute("fill",s.won&&Math.abs(g||9)<.12?"#2f7a3a":"#b04a14")}}
  requestAnimationFrame(go)};requestAnimationFrame(go)}
D.init=(svg,...r)=>{const v=init0.call(D,svg,...r);try{const m=svg.querySelector(".pp-gm");if(m)m.textContent="Can you make the population stop growing?";watch(svg)}catch(e){}return v};
D.act=(svg,a,...r)=>{if(a!=="goal"){if(/^tab/.test(a)&&svg._s&&svg._s.goal){svg._s.goal=0;const m=svg.querySelector(".pp-gm");if(m){m.textContent="Can you make the population stop growing?";m.setAttribute("fill","#b04a14")}}return act0.call(D,svg,a,...r)}const s=svg._s;if(!s)return false;
 s.goal=1;s.won=0;s.tfr=4;s.le=79;act0.call(D,svg,"reset");s.play=true;s.acc=.5;watch(svg);return true};
/* in goal mode each change starts from that setting's settled shape, so the growth shown is the long-run one (no
   momentum from the old pyramid's crowd of young people) */
D.drag=(svg,n,x,...r)=>{const v=drag0.call(D,svg,n,x,...r);const s=svg._s;if(s&&s.goal){s.won=0;act0.call(D,svg,"reset");s.play=true;s.acc=.5}return v};
})()}catch(e){console.warn("review2 pyramid",e)}

/*@@MORE@@*/
})();
