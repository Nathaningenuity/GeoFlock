/* GeoFlock: each guided tour's own colour, picked for what the tour is about (volcanoes are lava red, ice is pale blue,
   forests green…), not for the group it sits in. Neighbouring tours may be close in colour but each one is slightly
   different. Loaded after every tour file; it also rebuilds the coloured "start tour" buttons on the maps. */
(function(){
if(typeof PS_TOURS==="undefined")return;
const C={
 /* the Earth and its maps */
 pop:"#e0703a",geo:"#2f8f6b",gdp:"#1f7a4d",time:"#5b4fb8",projections:"#2a78d0",night:"#2d3480",space:"#163f6e",
 /* physical */
 elev:"#8d6a3c",climate:"#d08a1c",rivers:"#1d72b0",lakes:"#2b93bf",seas:"#1f4fa0",islands:"#22a3a0",plates:"#a8432a",
 hazards:"#d2491d",ranges:"#7a6a5a",volcanoes:"#c8321e",caves:"#5e5a6e",weather:"#5a9ad8",coasts:"#2aa0b8",
 deserts:"#d29a4a",ice:"#7fb8dc",
 /* living Earth */
 environment:"#2f9a5a",animals:"#8a6a2c",humans:"#a8623a",islandlife:"#2a9a7e",biomes:"#4f9a3f",forests:"#2e7d32",
 ocean:"#1a7aa8",amigration:"#6a9f2a",crops:"#9aa21f",
 /* continents */
 europe:"#3a6fd0",asia:"#d0463a",africa:"#c98a1c",namerica:"#3d8a5a",samerica:"#3f9a3a",oceania:"#1a8f9e",antarctica:"#8fb4d6",
 /* history */
 hancient:"#b0773a",hempires:"#7b3f61",hmodern:"#6d4c41",heurope:"#3f51b5",hasia:"#c2185b",hafrica:"#b5651d",
 hnamerica:"#7a5038",hsamerica:"#3a8a2a",hoceania:"#00897b",hantarctica:"#6a9cc0",explorers:"#8a5a2b",
 hmedieval:"#7a4a8a",hgunpowder:"#5a4a3a",hrevolutions:"#b8402e",hwars:"#5d6248",hcoldwar:"#4a5a78",hsince91:"#3a7ab8",
 timeline:"#a07a2a",
 /* people, culture and ideas */
 food:"#d06a1b",landmarks:"#9a7a4a",musicsport:"#6a3fb5",migration:"#2a86b0",inventions:"#d0a00a",culture:"#b5367a",
 flags:"#c8102e",cities:"#5a6a7e",langrel:"#7a5cc2",people:"#c4573a",sports:"#2e9a4a",festivals:"#e0609a",houses:"#a8654a",
 art:"#c24f7f",music:"#8a4fc8",literature:"#7a5a3a",philosophy:"#5a6a9a",mythology:"#9a6fd8",science:"#2f8ab0",
 maths:"#4a6ad0",psychology:"#b06fb0",words:"#a85a8a",learning:"#d08a3a",
 /* power, money and politics */
 borders:"#b0413e",resources:"#2f2f2f",transport:"#546e7a",politics:"#3d4f9e",govmap:"#c2573a",geopol:"#7a3b8f",
 regions:"#6a4fb0",capitals:"#b8862a",energy:"#e0a21a",currencies:"#3a8a4a",conflicts:"#a83a3a",
 /* books */
 bprisoners:"#7a6048",bggs:"#a5683f",bnations:"#9a5a48",bcollapse:"#6a7a50",
 /* AP Human Geography units */
 hg1:"#3b6fb6",hg1b:"#4a7ac0",hg2a:"#d0603a",hg2b:"#bc5e3e",hg2d:"#b06a5a",hg2c:"#2a86a8",
 hg3a:"#8a5ad0",hg3b:"#6a8a4a",hg3c:"#7052c8",hg4a:"#2e8b84",hg4b:"#3a6a9a",hg4c:"#7a3f6a",hg4d:"#a8483a",
 hg5a:"#5f9a3c",hg5b:"#8a9a3a",hg5c:"#c0801f",hg5d:"#3a8a5a",hg6a:"#5a6a80",hg6b:"#cf8a1f",hg6c:"#4f9a6a",hg6d:"#9a5a4a",
 hg7a:"#b4466f",hg7b:"#5a5f6a",hg7c:"#2e77b8",hg7d:"#3f9a4a"};
/* resources was near-black: a deep oil-and-coal grey that still reads as a colour */
C.resources="#4a4f3a";
/* white text sits on these colours, so any colour too light for it (sand, ice) is deepened a little, keeping its hue */
const lum=h=>{const n=parseInt(h.slice(1),16);return(.2126*(n>>16&255)+.7152*(n>>8&255)+.0722*(n&255))/255};
const deepen=h=>{let n=parseInt(h.slice(1),16),r=n>>16&255,g=n>>8&255,b=n&255;for(let i=0;i<20&&(.2126*r+.7152*g+.0722*b)/255>.56;i++){r*=.94;g*=.94;b*=.94}return"#"+[r,g,b].map(v=>Math.round(v).toString(16).padStart(2,"0")).join("")};
Object.keys(C).forEach(k=>{if(lum(C[k])>.56)C[k]=deepen(C[k])});
Object.keys(C).forEach(k=>{if(PS_TOURS[k])PS_TOURS[k].col=C[k]});
/* the coloured tour buttons on the maps were built from the old colours: build them again for every tour */
try{const dark=h=>{const n=parseInt(h.slice(1),16),f=v=>Math.max(0,Math.round(v*.72));return"rgb("+f(n>>16&255)+","+f(n>>8&255)+","+f(n&255)+")"};
 const st=document.createElement("style");
 st.textContent=Object.keys(PS_TOURS).filter(k=>!["pop","geo","gdp"].includes(k)&&/^#[0-9a-f]{6}$/i.test(PS_TOURS[k].col||"")).map(k=>".ps-launch.ps-launch-"+k+"{ background:linear-gradient(135deg, "+PS_TOURS[k].col+", "+dark(PS_TOURS[k].col)+") !important; color:#fff !important; box-shadow:0 4px 14px rgba(20,40,80,0.28) !important; }").join("\n");
 document.head.appendChild(st)}catch(e){console.error(e)}
window.GF_TOUR_COLS=C;
})();
