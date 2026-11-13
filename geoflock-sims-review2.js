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

/*@@MORE@@*/
})();
