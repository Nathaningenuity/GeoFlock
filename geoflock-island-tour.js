/* GeoFlock: "Island life" — a guided tour of island biogeography.
   Why big islands hold more species and far ones fewer, how one finch became many, giants and dwarfs, and the "islands"
   that are not in the sea at all: mountaintops, lakes and the patches of forest we leave behind.
   Six card simulations (species and area, the balance of arrivals and losses, Krakatoa, finch beaks, the island rule,
   cutting up a forest). Also swaps the stops that repeated across tours: Animals loses Madagascar and the dodo (the dodo
   moves here) for monarch butterflies and snow leopards; Islands loses "Lemur island" for an island in a lake on an island. */
(function(){
if(typeof PS_TOURS==="undefined"||typeof PS_TOUR_ORDER==="undefined")return;
const ID="islandlife",W=[-180,-58,180,80],TL="#1f8a7a";
const S=o=>Object.assign({_autoSpin:1,_ctx:1,_lg:1,_ky:1,_enr:1},o);
const ph=(at,label)=>({at,label,col:TL,icon:"photo"});
const steps=[
S({title:"Islands of life",view:W,globe:[-150,0,1],
 G:[{t:"Some famous island laboratories",c:TL,codes:["ec","mu","nz","mg","fj","cu","jm"]}],
 pins:[[[-90.5,-0.6],"Galápagos","point"],[[-155.5,19.6],"Hawaii","point"],[[105.42,-6.1],"Krakatoa","point"],[[159.08,-31.55],"Lord Howe Island","point"]],
 stat:"Islands are only about 5% of Earth’s land, but about six in ten of the species known to have died out since 1500 lived on islands",
 body:"Islands are nature’s experiments: cut off by sea, their plants and animals evolve in their own way. Darwin and Wallace both worked out evolution partly from what they saw on islands.",
 more:"This tour also visits places that are islands without being surrounded by sea: mountaintops, lakes and the patches of forest we leave behind. To a frog, a fish or a beetle they are just as cut off."}),
S({title:"Bigger islands, more life",view:[-86,9,-58,26],globe:[-72,18,3],hi:["cu","do","ht","jm","pr"],
 pins:[[[-62.19,16.74],"Montserrat: about 9 kinds","point"],[[-63.23,17.63],"Saba: about 5 kinds","point"],[[-62.35,16.94],"Redonda: about 3 kinds","point"],[[-79.5,21.8],"Cuba: about 76 kinds","point"],[[-71,19],"Hispaniola: about 84 kinds","point"]],
 stat:"Ten times the area means roughly twice as many kinds of animals",
 body:"Counting the reptiles and amphibians on Caribbean islands, the zoologist Philip Darlington found a rule of thumb in 1957: every time the area goes up ten times, the number of species roughly doubles. Drag along the curve on the card.",
 more:"Bigger islands have more kinds of habitat, from beaches to mountain forest, and room for bigger populations that are less likely to die out. The same species–area curve turns up for birds, ants and plants, on islands and in nature reserves."}),
S({title:"Far from everywhere",view:[-168,12,-114,44],globe:[-140,25,2],
 lines:[{coords:[[-157.8,21.3],[-140,30],[-122.4,37.8]],kind:"flow"}],
 pins:[[[-140,31.5],"About 3,800 km of open ocean","point"],[[-122.4,37.8],"California","point"]],
 phPins:[ph([-155.5,19.6],"Hawaiian hoary bat: Hawaii’s only native land mammal")],
 stat:"Hawaii has just one native land mammal: a bat",
 body:"The Hawaiian Islands are the most isolated island group on Earth, about 3,800 km from the nearest continent. Only things that could fly, float or be blown there ever arrived: no frogs, no snakes, no land mammals but a bat.",
 more:"Plants came as seeds on the wind, in birds’ guts or stuck to their feathers. Each new arrival was so rare that, by one estimate, a successful newcomer reached the islands only once in tens of thousands of years. Pigs, rats, cats and mongooses all came with people."}),
S({title:"Islands keep a balance",view:[-84.2,23.6,-79.6,26.4],globe:[-81,24.8,8],
 pins:[[[-81.2,24.7],"Florida Keys: tiny mangrove islands","point"]],
 phPins:[ph([-80.9,25.1],"Mangrove islets, Florida Keys")],
 stat:"In 1966 scientists cleared every insect off six tiny islands, and within a year about as many kinds had moved back in",
 body:"In 1967 Robert MacArthur and E. O. Wilson explained why: new species keep arriving, others keep dying out, and the count settles where arrivals and losses balance. Near, big islands settle high; far, small islands settle low. Try it on the card.",
 more:"Daniel Simberloff and Wilson tented small mangrove islets in the Florida Keys and fumigated them. Spiders, ants and beetles drifted back from the mainland; the nearest islet filled up most, the farthest least, just as the theory predicted. The kinds that came back were not always the same ones."}),
S({title:"Krakatoa starts again",view:[102,-9.5,109,-3.5],globe:[105.4,-6.1,6],hi:["id"],
 pins:[[[105.42,-6.1],"Krakatoa: wiped clean in 1883","point"]],
 phPins:[ph([105.2,-6.35],"Anak Krakatau, the ‘child of Krakatoa’")],
 stat:"After its 1883 eruption Krakatoa was bare ash; within 50 years it had about 30 kinds of land birds and some 270 kinds of plants",
 body:"The eruption buried what was left of the island in hot ash, killing everything. Scientists who came back again and again watched life return: ferns and grasses first, then forest, birds, bats and insects.",
 more:"The number of bird species climbed fast, then levelled off at about 30, but which birds were there kept changing, just as MacArthur and Wilson predicted. A new volcano, Anak Krakatau, rose from the sea in 1927 and started the experiment over again."}),
S({title:"One finch, many finches",view:[-92.3,-1.8,-88.9,0.9],globe:[-90.5,-0.6,9],hi:["ec"],
 pins:[[[-90.37,-0.42],"Daphne Major: the finch island","point"]],
 phPins:[ph([-90.95,-0.85],"A Darwin’s finch")],
 stat:"About 18 kinds of Darwin’s finches all descend from one kind of bird that reached the Galápagos roughly 2 million years ago",
 body:"On islands with few other birds, the newcomers split into seed-crackers, insect-eaters, cactus-feeders and even a ‘vampire finch’ that sips seabird blood. Their beaks fit their food. Spreading out like this is called adaptive radiation.",
 more:"Peter and Rosemary Grant measured the finches of tiny Daphne Major for over 40 years. In the 1977 drought only big, hard seeds were left, most finches starved, and the survivors’ chicks had noticeably deeper beaks: evolution you could measure in a single year. Try the drought on the card."}),
S({title:"Hawaii’s honeycreepers",view:[-160.6,18.6,-154.4,22.6],globe:[-157.3,20.5,6],
 pins:[[[-159.5,22.07],"Kauaʻi: the last few of some kinds","point"],[[-155.47,19.82],"Mauna Kea: cool forests above the mosquitoes","point"]],
 phPins:[ph([-156.25,20.72],"ʻIʻiwi, a Hawaiian honeycreeper")],
 stat:"More than 50 kinds of Hawaiian honeycreepers evolved from one kind of finch; only about 17 are left",
 body:"Their beaks went every way: long and curved for flowers, thick for seeds, thin for insects. Then people brought rats, cats, pigs and, in 1826, mosquitoes carrying bird malaria. Most surviving honeycreepers now live high in the mountains, where it is too cool for mosquitoes.",
 more:"As the climate warms, mosquitoes are moving uphill and the birds have nowhere higher to go. In 2023 conservationists began releasing millions of male mosquitoes carrying a bacterium that stops their eggs hatching, to bring the numbers down."}),
S({title:"Giants and dwarfs",view:[5,-15,130,45],globe:[70,15,1.3],
 pins:[[[14.2,37.5],"Sicily: elephants about 1 m tall","point"],[[14.4,35.9],"Malta: dwarf elephants too","point"],[[33.2,35],"Cyprus: dwarf hippos","point"],[[121,-8.6],"Flores: hobbit humans, dwarf elephants, giant rats","point"]],
 phPins:[ph([119.5,-8.55],"Komodo dragon: the biggest lizard alive")],
 stat:"On islands, big animals often shrink and small ones often grow",
 body:"With little food, a smaller elephant does better; with no big predators, a lizard or a rat can grow huge. Biologists call it the island rule. Komodo dragons grow up to 3 m long, while the elephants of ancient Sicily stood about as tall as a ten-year-old.",
 more:"The rule has plenty of exceptions, but it shows up again and again: dwarf mammoths on Wrangel Island in the Arctic, giant tortoises on the Galápagos and Aldabra, and on Flores, small humans living alongside dwarf elephants and rats the size of cats. Compare the sizes on the card."}),
S({title:"A land of birds",view:[164,-48,180,-33],globe:[172,-41,4],hi:["nz"],
 pins:[[[171.5,-43.5],"Haast’s eagle: wingspan up to about 3 m","point"],[[168,-46.9],"Kākāpō: kept safe on predator-free islands","point"]],
 phPins:[ph([175.5,-39.2],"Moa: up to about 3.6 m tall"),ph([172.6,-41.3],"Kākāpō")],
 stat:"New Zealand’s only native land mammals are bats, so birds took every job",
 body:"Giant moa grazed like deer, kiwi sniffed out worms at night like hedgehogs, and Haast’s eagle, the biggest eagle ever, hunted moa. The kākāpō, a flightless, night-time parrot, smells sweet and freezes when in danger, which works against eagles but not against cats or stoats.",
 more:"People reached New Zealand only about 750 years ago. Within about two centuries all nine kinds of moa were gone, and Haast’s eagle with them. Only about 250 kākāpō are alive, every one of them named and watched by rangers."}),
S({title:"Strangers from the ships",view:[40,-28,160,26],globe:[100,-5,1.4],hi:["mu"],
 pins:[[[57.55,-20.25],"Mauritius: the dodo, gone by the 1660s","point"],[[144.8,13.45],"Guam: the brown tree snake","point"]],
 phPins:[ph([57.4,-20.4],"The dodo"),ph([144.7,13.3],"Brown tree snake")],
 stat:"A snake that hitched a ride to Guam about 1950 wiped out 10 of the island’s 12 native forest birds",
 body:"Island animals had no reason to fear hunters, so they were easy prey. On Mauritius the dodo, a giant flightless pigeon, vanished within about 80 years of sailors arriving, eaten by people and by the rats, pigs and monkeys they brought. On Guam, a snake arrived in military cargo and spread to up to 2 million.",
 more:"Guam’s forests are now strangely quiet, and with fewer birds to spread seeds, fewer new trees grow. Rats are the worst stowaways of all: clearing them from islands is one of the most successful ways to bring seabirds back."}),
S({title:"The tree lobster",view:[155.5,-33.5,162.5,-29.5],globe:[159.2,-31.6,8],
 pins:[[[159.08,-31.55],"Lord Howe Island: rats arrived 1918","point"]],
 phPins:[ph([159.25,-31.75],"Ball’s Pyramid"),ph([159.6,-31.3],"Lord Howe Island stick insect")],
 stat:"A hand-sized insect thought extinct for 80 years was found in 2001, under one bush on a sea stack",
 body:"The Lord Howe Island stick insect, or ‘tree lobster’, vanished after rats swam ashore from a shipwreck in 1918. Then climbers on Ball’s Pyramid, a 562 m spike of rock 20 km out to sea, found 24 of them living under a single shrub.",
 more:"A few were taken to zoos, where thousands have since been bred. Rats were cleared from Lord Howe Island in 2019, so one day the insects may go home. An island off an island had saved them."}),
S({title:"Islands in the sky",view:[-66,1.5,-57,8.5],globe:[-61.5,5,5],hi:["ve","gy","br"],
 pins:[[[-60.76,5.14],"Mount Roraima, 2,810 m","point"],[[-62.53,5.97],"Auyán-tepui: Angel Falls","point"],[[-110.8,32.4],"Arizona’s ‘sky islands’","point"]],
 phPins:[ph([-60.9,5.35],"Mount Roraima, a tepui")],
 stat:"The flat tops of the tepuis have been cut off from the forest below for millions of years",
 body:"Tepuis are table mountains rising sheer from the rainforest of Venezuela, Guyana and Brazil. Their cool, wet, misty tops are islands in the sky, with plants and frogs found nowhere else. One tiny black ‘pebble toad’ escapes danger by curling up and bouncing down the rocks.",
 more:"Mountains can be islands anywhere. In Arizona and northern Mexico, cool forested peaks rise out of hot desert, each with its own squirrels, snails and insects that cannot cross the desert between them."}),
S({title:"Lakes are islands too",view:[28.5,-4.5,37.5,2.2],globe:[33,-1,5],hi:["ug","ke","tz"],
 pins:[[[33,-1],"Lake Victoria: about 500 kinds of cichlid","point"]],
 phPins:[ph([32.6,0.2],"Fishing on Lake Victoria")],
 stat:"About 500 kinds of cichlid fish evolved in Lake Victoria in perhaps 15,000 years",
 body:"To a fish, a lake is an island of water surrounded by land. Lake Victoria seems to have almost dried out about 15,000 years ago; since then its cichlids have split into hundreds of species, some eating snails, some algae, some the eggs of other fish. It is the fastest big burst of new species known.",
 more:"In the 1950s the Nile perch, a giant predator, was put into the lake to boost fishing. It ate its way through the cichlids, and roughly 200 kinds are thought to have vanished: one of the biggest extinctions of the last century."}),
S({title:"Islands we make",view:[-61.5,-4.2,-58.5,-1.2],globe:[-60,-2.4,7],hi:["br"],
 pins:[[[-60,-2.4],"Forest fragments experiment, since 1979","point"],[[-60.02,-3.1],"Manaus","point"]],
 phPins:[ph([-59.4,-2.0],"Forest cut into patches")],
 stat:"When a forest is cut into patches, each patch behaves like an island, and the smallest lose their species fastest",
 body:"North of Manaus, scientists left forest squares of 1, 10 and 100 hectares as cattle ranches were cleared around them, and have watched them since 1979. Small patches lost birds, primates and big trees; their edges dried out and blew down. Cut up the forest on the card.",
 more:"The fix is to keep patches big and joined up. In Banff National Park in Canada, bridges of soil and trees over the highway let bears, elk and wolves cross safely; they have been used many thousands of times."}),
S({title:"Now explore",view:W,globe:[-150,0,1],
 stat:"Hover any country to see its name and neighbours",
 body:"Look for the islands on the map, then for the hidden ones: mountain ranges in deserts, lakes and the last forests. The Islands tour has more on how islands form, and the Human origins tour follows people who crossed the sea to islands like Flores."})];
const fix=s=>{if(s.G){s._hsMerged=1;s.legend=null;s.hi=s.hi||[...new Set(s.G.flatMap(g=>g.codes))];s.hiSoft=s.hiSoft||[]}return s};
PS_TOURS[ID]={name:"Guided tour on island life",short:"Island life",
 hint:"Why big islands hold more species, how one finch became 18, and why a lake or a mountaintop can be an island too",
 map:{mode:"relief"},group:"nature",col:TL,steps:steps.map(fix)};
/* ---------- card simulations ---------- */
if(typeof DG!=="undefined"&&typeof dgT==="function"){
const T=dgT,tip=typeof dgTip==="function"?dgTip:()=>"",fmt=n=>Math.round(n).toLocaleString("en-US");
const slider=(cls,x1,x2,y,col)=>'<g class="dg-handle" data-drag="'+cls+'"><rect x="'+(x1-4)+'" y="'+(y-8)+'" width="'+(x2-x1+8)+'" height="16" fill="transparent"/><line x1="'+x1+'" x2="'+x2+'" y1="'+y+'" y2="'+y+'" stroke="#c9d3dc" stroke-width="3" stroke-linecap="round"/><circle class="dg-k-'+cls+'" cy="'+y+'" r="6" fill="'+(col||"#e8701a")+'" stroke="#fff" stroke-width="1.4"/></g>';
const knob=(svg,cls,x)=>{const k=svg.querySelector(".dg-k-"+cls);if(k)k.setAttribute("cx",x.toFixed(1))};
const btn=(act,x,y,w,label,on)=>'<g data-act="'+act+'" class="dg-tab'+(on?" on":"")+'" style="cursor:pointer"><rect x="'+x+'" y="'+y+'" width="'+w+'" height="17" rx="8.5" fill="'+(on?"#1d3047":"#fff")+'" stroke="#1d3047" stroke-opacity=".3"/>'+T(x+w/2,y+11.6,label,'text-anchor="middle" font-size="7.6" font-weight="700" fill="'+(on?"#fff":"#1d3047")+'"')+"</g>";
/* 1. species and area: Caribbean reptiles and amphibians (Darlington 1957, as redrawn by MacArthur and Wilson 1967) */
const SPA=[["Redonda",1.6,3],["Saba",13,5],["Montserrat",102,9],["Puerto Rico",8900,40],["Jamaica",11000,39],["Hispaniola",76000,84],["Cuba",105000,76]];
const spaS=a=>3.3*Math.pow(a,.28),spaX=a=>40+Math.log10(a)/5.2*245,spaY=s=>150-Math.log10(s)/2*118;
DG.islspa={title:"Bigger islands, more species",src:"Reptiles and amphibians of Caribbean islands: P. J. Darlington (1957), as plotted by MacArthur and Wilson (1967); counts are approximate. Curve: about 3.3 × area^0.28.",_a:1000,
 svg:()=>'<svg viewBox="0 0 300 200"><g class="dg-dyn"></g>'+slider("a",40,285,190,TL)+"</svg>",
 init:svg=>DG.islspa._set(svg),
 drag:(svg,n,x)=>{const D=DG.islspa;D._a=Math.pow(10,Math.max(0,Math.min(1,(x-40)/245))*5.2);D._set(svg)},
 _set:svg=>{const D=DG.islspa;let g='<rect x="40" y="26" width="245" height="124" fill="#eef5f7" rx="4"/>';
  [1,10,100,1000,1e4,1e5].forEach(a=>{const x=spaX(a);g+='<line x1="'+x+'" x2="'+x+'" y1="26" y2="150" stroke="#fff"/>'+T(x,160,a>=1000?fmt(a/1000)+"k":a,'text-anchor="middle" font-size="6.6" opacity=".7"')});
  [1,10,100].forEach(s=>{const y=spaY(s);g+='<line x1="40" x2="285" y1="'+y+'" y2="'+y+'" stroke="#fff"/>'+T(34,y+2,s,'text-anchor="end" font-size="6.6" opacity=".7"')});
  g+=T(162,168,"island area, km² (each step is 10 times bigger)",'text-anchor="middle" font-size="6.8"')+T(8,18,"kinds of reptiles and amphibians",'font-size="7" font-weight="700"');
  let d="";for(let i=0;i<=50;i++){const a=Math.pow(10,i/50*5.2);d+=(i?"L":"M")+spaX(a).toFixed(1)+","+spaY(spaS(a)).toFixed(1)}g+='<path d="'+d+'" fill="none" stroke="'+TL+'" stroke-width="2" stroke-dasharray="5 3"/>';
  SPA.forEach(([n,a,s])=>{const x=spaX(a),y=spaY(s);g+='<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="3.6" fill="#e8701a" stroke="#fff"'+tip(n+": about "+fmt(a)+" km², about "+s+" kinds")+"/>";const L={Cuba:[-6,3,1],Hispaniola:[-5,-5,1],"Puerto Rico":[-6,-3,1],Jamaica:[5,9,0]}[n]||[5,3,0];g+=T(x+L[0],y+L[1],n,'font-size="6.4" font-weight="700"'+(L[2]?' text-anchor="end"':""))});
  const a=D._a,s=spaS(a),x=spaX(a),y=spaY(s);g+='<line x1="'+x.toFixed(1)+'" x2="'+x.toFixed(1)+'" y1="'+y.toFixed(1)+'" y2="150" stroke="'+TL+'" stroke-opacity=".5"/><circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="5" fill="'+TL+'" stroke="#fff" stroke-width="1.4"/>';
  g+=T(150,182,"An island of "+(a<10?a.toFixed(1):fmt(a))+" km²: about "+Math.round(s)+" kinds",'text-anchor="middle" font-size="8" font-weight="800" fill="#16594f"')+T(290,18,"10× area ≈ 2× species",'text-anchor="end" font-size="7" fill="#b04a14" font-weight="700"');
  dgDyn(svg,g.replace(/y="182"/,'y="178"'));knob(svg,"a",x)}};
/* 2. the balance of arrivals and losses (MacArthur and Wilson 1967) */
DG.islmw={title:"Arrivals and losses balance",src:"The equilibrium theory of island biogeography: R. H. MacArthur and E. O. Wilson (1967). A sketch with a pool of 100 mainland species; rates are illustrative.",_s:.3,_d:.6,_run:null,
 svg:()=>'<svg viewBox="0 0 300 200"><g class="dg-dyn"></g>'+T(8,173,"island size",'font-size="7" font-weight="700"')+slider("s",62,170,170,"#3a8f3a")+T(8,191,"distance",'font-size="7" font-weight="700"')+slider("d",62,170,188,"#2f6ea8")+btn("run",184,174,104,"▶ start it empty")+"</svg>",
 init:svg=>DG.islmw._set(svg),
 drag:(svg,n,x)=>{const D=DG.islmw,v=Math.max(0,Math.min(1,(x-62)/108));if(n==="s")D._s=v;else D._d=v;D._cur=null;D._set(svg)},
 _rates:()=>{const D=DG.islmw;return{I0:60*(1-.78*D._d),E0:60*(1-.78*D._s)}},
 act:(svg,a)=>{const D=DG.islmw;if(a!=="run")return;const {I0,E0}=D._rates();let S=0,t0=null;D._hist=[0];const step=n=>{if(!svg.isConnected)return;if(t0==null)t0=n;const k=Math.min(60,Math.floor((n-t0)/70));while(D._hist.length<=k){const s=D._hist[D._hist.length-1],I=I0*(1-s/100),E=E0*s/100;D._hist.push(Math.max(0,Math.min(100,s+(I-E)*.12+(Math.random()-.5)*3)))}D._cur=D._hist[D._hist.length-1];D._set(svg);if(k<60)requestAnimationFrame(step);else D._hist=null};requestAnimationFrame(step)},
 _set:svg=>{const D=DG.islmw,{I0,E0}=D._rates(),Se=100*I0/(I0+E0),R=Se*E0/100;
  const X=s=>28+s*1.4,Y=r=>146-r*1.7;let g='<rect x="28" y="24" width="140" height="122" fill="#f2f6f8" rx="3"/>'+T(98,158,"species on the island (out of 100)",'text-anchor="middle" font-size="6.4"')+T(8,16,"rate (new arrivals, losses)",'font-size="6.8" font-weight="700"');
  g+='<line x1="'+X(0)+'" y1="'+Y(I0).toFixed(1)+'" x2="'+X(100)+'" y2="'+Y(0)+'" stroke="#2f6ea8" stroke-width="2"/>'+T(X(3),Y(I0)-3,"arrivals",'font-size="6.6" fill="#2f6ea8" font-weight="700"');
  g+='<line x1="'+X(0)+'" y1="'+Y(0)+'" x2="'+X(100)+'" y2="'+Y(E0).toFixed(1)+'" stroke="#c0392b" stroke-width="2"/>'+T(X(97),Y(E0)-3,"losses",'text-anchor="end" font-size="6.6" fill="#c0392b" font-weight="700"');
  g+='<line x1="'+X(Se).toFixed(1)+'" x2="'+X(Se).toFixed(1)+'" y1="'+Y(R).toFixed(1)+'" y2="146" stroke="#1d3047" stroke-dasharray="3 2"/><circle cx="'+X(Se).toFixed(1)+'" cy="'+Y(R).toFixed(1)+'" r="4" fill="#1d3047"/>';
  /* the island and the mainland */
  const ix=200+D._d*72,r=7+D._s*15;g+='<rect x="176" y="24" width="118" height="122" fill="#bcd9ee" rx="3"/><path d="M176,24 h12 q-6,30 0,61 q6,30 0,61 h-12z" fill="#8fb36b"/>'+T(182,140,"mainland",'font-size="6" transform="rotate(-90 182 140)" fill="#2c4a1d"')+'<circle cx="'+ix.toFixed(1)+'" cy="85" r="'+r.toFixed(1)+'" fill="#d9c58f" stroke="#a88f4f"/>';
  const n=Math.round((D._cur!=null?D._cur:Se)/3);let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;for(let i=0;i<n;i++){const a=rnd()*6.283,q=Math.sqrt(rnd())*(r-2.5);g+='<circle cx="'+(ix+Math.cos(a)*q).toFixed(1)+'" cy="'+(85+Math.sin(a)*q).toFixed(1)+'" r="1.9" fill="'+["#e8701a","#2f6ea8","#7b4fd1","#c0392b","#2c7a3a"][i%5]+'"/>'}
  const shown=D._cur!=null?D._cur:Se;g+=T(235,38,"about "+Math.round(shown)+" kinds",'text-anchor="middle" font-size="9" font-weight="800" fill="#1d3047"')+T(235,48,(D._s>.6?"big":D._s<.35?"small":"medium")+" island, "+(D._d>.6?"far":D._d<.35?"near":"middle distance"),'text-anchor="middle" font-size="6.6"');
  if(D._hist){let d="";D._hist.forEach((s,i)=>{d+=(i?"L":"M")+(182+i*1.8).toFixed(1)+","+(140-s*.3).toFixed(1)});g+='<path d="'+d+'" fill="none" stroke="#1d3047" stroke-width="1.2"/>'+T(182,112,"over time",'font-size="6" opacity=".8"')}
  dgDyn(svg,g);knob(svg,"s",62+D._s*108);knob(svg,"d",62+D._d*108)}};
/* 3. Krakatoa's birds */
const KR=[[1883,0,"The eruption leaves bare, hot ash: nothing alive"],[1884,0,"Nine months later, one spider is found"],[1908,13,"Ferns, grass and young trees: 13 kinds of land birds"],[1920,31,"Forest is growing: 31 kinds of land birds"],[1933,30,"About 30 kinds: the count stops rising, but the birds keep changing"]];
DG.islkrak={title:"Life returns to Krakatoa",src:"Land-bird counts on the Krakatau islands from surveys of 1908, 1919–21 and 1932–34 (Docters van Leeuwen; Thornton, ‘Krakatau’, 1996); approximate.",_y:1933,
 svg:()=>'<svg viewBox="0 0 300 200"><g class="dg-dyn"></g>'+slider("y",34,284,186,"#c0392b")+"</svg>",
 init:svg=>{const D=DG.islkrak;if(!D._played){D._played=1;D._y=1883;const t0=performance.now()+500,go=n=>{if(!svg.isConnected)return;const f=Math.max(0,Math.min(1,(n-t0)/2600));D._y=1883+50*f;D._set(svg);if(f<1)requestAnimationFrame(go)};requestAnimationFrame(go)}D._set(svg)},
 drag:(svg,n,x)=>{const D=DG.islkrak;D._y=1883+Math.max(0,Math.min(1,(x-34)/250))*50;D._set(svg)},
 _set:svg=>{const D=DG.islkrak,y=D._y,X=yr=>34+(yr-1883)*5,Y=s=>150-s*3.4;let g='<rect x="34" y="24" width="250" height="126" fill="#f4f1ea" rx="3"/>'+T(8,16,"kinds of land birds on Krakatoa",'font-size="7" font-weight="700"');
  [0,10,20,30].forEach(s=>{g+='<line x1="34" x2="284" y1="'+Y(s)+'" y2="'+Y(s)+'" stroke="#fff"/>'+T(30,Y(s)+2,s,'text-anchor="end" font-size="6.6" opacity=".7"')});
  [1883,1893,1903,1913,1923,1933].forEach(yr=>{g+=T(X(yr),160,yr,'text-anchor="middle" font-size="6.6" opacity=".7"')});
  g+='<line x1="'+X(1915)+'" x2="284" y1="'+Y(30.5)+'" y2="'+Y(30.5)+'" stroke="#2c7a3a" stroke-dasharray="4 3"/>'+T(282,Y(30.5)-4,"balance",'text-anchor="end" font-size="6.6" fill="#2c7a3a" font-weight="700"');
  /* green that creeps over the island as the years pass */
  const f=Math.max(0,Math.min(1,(y-1883)/50));g+='<ellipse cx="78" cy="52" rx="30" ry="12" fill="#9b8a7a"/><ellipse cx="78" cy="50" rx="'+(30*f).toFixed(1)+'" ry="'+(11*f).toFixed(1)+'" fill="#4f8a3c" opacity=".9"/>'+T(78,72,f<.05?"bare ash":f<.6?"plants coming back":"forest again",'text-anchor="middle" font-size="6.4" font-weight="700" fill="#5a4a3a"');
  let d="",last=null;KR.forEach(([yr,s])=>{if(yr<=y){d+=(d?"L":"M")+X(yr)+","+Y(s);last=[yr,s]}});
  if(last&&y>last[0]){const nx=KR.find(k=>k[0]>last[0]);if(nx){const t=(y-last[0])/(nx[0]-last[0]),s=last[1]+(nx[1]-last[1])*t;d+="L"+X(y).toFixed(1)+","+Y(s).toFixed(1)}}
  g+='<path d="'+d+'" fill="none" stroke="#c0392b" stroke-width="2.2"/>';KR.forEach(([yr,s,txt])=>{if(yr<=y)g+='<circle cx="'+X(yr)+'" cy="'+Y(s)+'" r="3.4" fill="#c0392b" stroke="#fff"'+tip(yr+": "+txt)+"/>"});
  const cap=[...KR].reverse().find(k=>k[0]<=y+.5);g+=T(159,176,Math.round(y)+(cap?": "+cap[2]:""),'text-anchor="middle" font-size="7.4" font-weight="800" fill="#7a2a1a"');
  dgDyn(svg,g);knob(svg,"y",34+f*250)}};
/* 4. finch beaks and the 1977 drought on Daphne Major */
const bell=(m,sd,n)=>{const out=[];for(let i=0;i<14;i++){const x=7+i*.5;out.push(n*Math.exp(-((x+.25-m)**2)/(2*sd*sd))*.5/(sd*Math.sqrt(2*Math.PI)))}return out};
DG.islbeak={title:"A drought changes the finches",src:"After P. R. and B. R. Grant’s studies of medium ground finches on Daphne Major, Galápagos (Boag & Grant 1981; Grant 1986). Numbers rounded; the shapes are a sketch.",_k:0,
 svg:()=>'<svg viewBox="0 0 300 200">'+'<g class="dg-tabs"></g><g class="dg-dyn"></g></svg>',
 init:svg=>DG.islbeak._set(svg),
 act:(svg,a)=>{if(a.indexOf("tab:")===0){DG.islbeak._k=+a.slice(4);DG.islbeak._set(svg)}},
 _set:svg=>{const D=DG.islbeak,k=D._k,tabs=["1976: plenty of seeds","1977: drought","1978: the chicks"];let h="";let x=8;tabs.forEach((t,i)=>{const w=t.length*4.3+14;h+=btn("tab:"+i,x,6,w,t,i===k);x+=w+5});
  const all=bell(9.4,.95,1200),surv=all.map((v,i)=>v*(1/(1+Math.exp(-((7+i*.5+.25)-10.2)*2.2)))*.32),kids=bell(9.85,.95,700);
  const X=i=>40+i*17,Y=v=>150-v*.38;let g='<rect x="36" y="30" width="248" height="120" fill="#f6f3ec" rx="3"/>';
  for(let i=0;i<14;i++){const xb=X(i);if(k===0){g+='<rect x="'+xb+'" y="'+Y(all[i]).toFixed(1)+'" width="15" height="'+(all[i]*.38).toFixed(1)+'" fill="#d9a441"/>'}
   else if(k===1){g+='<rect x="'+xb+'" y="'+Y(all[i]).toFixed(1)+'" width="15" height="'+(all[i]*.38).toFixed(1)+'" fill="#d9a441" opacity=".25"/><rect x="'+xb+'" y="'+Y(surv[i]).toFixed(1)+'" width="15" height="'+(surv[i]*.38).toFixed(1)+'" fill="#b04a14"/>'}
   else g+='<rect x="'+xb+'" y="'+Y(kids[i]).toFixed(1)+'" width="15" height="'+(kids[i]*.38).toFixed(1)+'" fill="#2c7a3a"/>';
   if(i%2===0)g+=T(xb+7.5,160,(7+i*.5).toFixed(0),'text-anchor="middle" font-size="6.6" opacity=".7"')}
  g+=T(160,170,"beak depth, mm (small beaks ← → big, strong beaks)",'text-anchor="middle" font-size="6.8"');
  const L=["About 1,200 medium ground finches; beaks of every size","Only big, hard seeds are left. About 180 finches survive, mostly big-beaked","The next generation: beaks about 4% deeper on average"][k];
  g+=T(160,186,L,'text-anchor="middle" font-size="7.4" font-weight="800" fill="#7a2a1a"');
  const mean=[9.4,10.1,9.85][k];g+='<line x1="'+(40+(mean-7-.25)*34+8.5).toFixed(1)+'" x2="'+(40+(mean-7-.25)*34+8.5).toFixed(1)+'" y1="34" y2="150" stroke="#1d3047" stroke-dasharray="3 2"/>'+T((40+(mean-7-.25)*34+11).toFixed(1),42,"average",'font-size="6.4" font-weight="700"');
  const tg=svg.querySelector(".dg-tabs");if(tg)tg.innerHTML=typeof dgPaint==="function"?dgPaint(h):h;dgDyn(svg,g)}};
/* 5. the island rule: rough heights, mainland relative beside its island form */
const RULE=[[["Elephant","4 m","Sicilian dwarf elephant","0.9 m",4,.9],["Hippo","1.5 m","Cyprus dwarf hippo","0.75 m",1.5,.75],["Early human (Homo erectus)","1.6 m","Flores ‘hobbit’","1.1 m",1.6,1.1]],
 [["Monitor lizard","1.5 m long","Komodo dragon","3 m long",1.5,3],["Black rat","20 cm","Flores giant rat","45 cm",.2,.45],["Mainland tortoise","40 cm shell","Galápagos giant tortoise","1.3 m shell",.4,1.3]]];
DG.islrule={title:"The island rule",src:"Typical adult sizes, rounded (heights at the shoulder or head; lengths nose to tail; shell length for tortoises). Sicilian elephant: Palaeoloxodon falconeri; ancestor the straight-tusked elephant.",_k:0,
 svg:()=>'<svg viewBox="0 0 300 200"><g class="dg-tabs"></g><g class="dg-dyn"></g></svg>',
 init:svg=>DG.islrule._set(svg),act:(svg,a)=>{if(a.indexOf("tab:")===0){DG.islrule._k=+a.slice(4);DG.islrule._set(svg)}},
 _set:svg=>{const D=DG.islrule,k=D._k;const h=btn("tab:0",40,6,100,"Big animals shrink",k===0)+btn("tab:1",150,6,110,"Small animals grow",k===1);
  let g="";const rows=RULE[k],mx=Math.max(...rows.map(r=>Math.max(r[4],r[5])));
  rows.forEach((r,i)=>{const y=40+i*50,sc=100/mx,w1=Math.max(3,r[4]*sc),w2=Math.max(3,r[5]*sc);
   g+=T(8,y,r[0]+": "+r[1],'font-size="7" font-weight="700"')+'<rect x="8" y="'+(y+4)+'" width="'+(w1*2.6).toFixed(1)+'" height="12" rx="3" fill="#9aa8b5"/>';
   g+=T(8,y+29,r[2]+": "+r[3],'font-size="7" font-weight="700" fill="'+(k?"#b04a14":"#2c7a3a")+'"')+'<rect x="8" y="'+(y+33)+'" width="'+(w2*2.6).toFixed(1)+'" height="12" rx="3" fill="'+(k?"#e8701a":"#3a8f3a")+'"/>'});
  g+=T(150,196,k?"No big predators and room to grow: small animals get bigger":"Little food and nowhere to roam: big animals get smaller",'text-anchor="middle" font-size="7.2" font-weight="800" fill="#1d3047"');
  const tg=svg.querySelector(".dg-tabs");if(tg)tg.innerHTML=typeof dgPaint==="function"?dgPaint(h):h;dgDyn(svg,g)}};
/* 6. cutting up a forest */
const CUTS=[["Whole forest",1,false],["One road",2,false],["4 pieces",4,false],["16 pieces",16,false],["16 + bridges",16,true]];
DG.islfrag={title:"Cutting up a forest",src:"A sketch: a 10 km square of forest, with the outer 300 m of each piece counted as drier, windier edge; species from a species–area curve (area^0.25). After the Biological Dynamics of Forest Fragments Project, Manaus.",_k:0,
 svg:()=>'<svg viewBox="0 0 300 200"><g class="dg-tabs"></g><g class="dg-dyn"></g></svg>',
 init:svg=>DG.islfrag._set(svg),act:(svg,a)=>{if(a.indexOf("tab:")===0){DG.islfrag._k=+a.slice(4);DG.islfrag._set(svg)}},
 _set:svg=>{const D=DG.islfrag,k=D._k,[name,n,br]=CUTS[k];let h="",x=6;CUTS.forEach((c,i)=>{const w=c[0].length*4.1+12;h+=btn("tab:"+i,x,6,w,c[0],i===k);x+=w+4});
  const cols=n===2?1:Math.sqrt(n),rows=n===2?2:Math.sqrt(n),pw=10/cols,phh=10/rows,road=n>1?.06:0,E=.3;
  const core=Math.max(0,pw-2*E-road)*Math.max(0,phh-2*E-road),whole=(10-2*E)*(10-2*E);
  const per=br?100*Math.pow((n*core)/whole,.25)*.97:100*Math.pow(core/whole,.25);
  let g="";const ox=14,oy=32,sz=128,u=sz/10;g+='<rect x="'+ox+'" y="'+oy+'" width="'+sz+'" height="'+sz+'" fill="#c9b48a"/>';
  for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){const x0=ox+i*pw*u+(n>1?2:0),y0=oy+j*phh*u+(n>1?2:0),w=pw*u-(n>1?4:0),hh=phh*u-(n>1?4:0);
   g+='<rect x="'+x0.toFixed(1)+'" y="'+y0.toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+hh.toFixed(1)+'" fill="#9cc47a"/><rect x="'+(x0+E*u).toFixed(1)+'" y="'+(y0+E*u).toFixed(1)+'" width="'+Math.max(0,w-2*E*u).toFixed(1)+'" height="'+Math.max(0,hh-2*E*u).toFixed(1)+'" fill="#2f6b2f"/>'}
  if(br)for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){const cx=ox+(i+.5)*pw*u,cy=oy+(j+.5)*phh*u;if(i<cols-1)g+='<rect x="'+(cx+pw*u/2-4).toFixed(1)+'" y="'+(cy-3).toFixed(1)+'" width="8" height="6" fill="#4f8a3c" stroke="#fff" stroke-width=".6"/>';if(j<rows-1)g+='<rect x="'+(cx-3).toFixed(1)+'" y="'+(cy+phh*u/2-4).toFixed(1)+'" width="6" height="8" fill="#4f8a3c" stroke="#fff" stroke-width=".6"/>'}
  const corePct=Math.round(100*n*core/100);
  g+=T(156,48,name,'font-size="9" font-weight="800"')+T(156,66,"deep, shady forest left: "+corePct+"%",'font-size="7.4"')+T(156,80,"(light green: hot, dry, windy edges)",'font-size="6.4" opacity=".75"');
  g+=T(156,104,br?"Animals can move between pieces:":"Kinds of forest animal that can",'font-size="7.4" font-weight="700"')+T(156,115,br?"together they hold about":"live in each piece, out of 100:",'font-size="7.4" font-weight="700"')+T(156,140,"about "+Math.round(per),'font-size="16" font-weight="800" fill="'+(per>80?"#2c7a3a":per>55?"#b07a14":"#b0301a")+'"');
  g+=T(156,156,br?"Bridges and corridors join the islands up again":n>1?"Each piece is now an island of forest":"One big forest: room for everything",'font-size="6.8" opacity=".85"');
  const tg=svg.querySelector(".dg-tabs");if(tg)tg.innerHTML=typeof dgPaint==="function"?dgPaint(h):h;dgDyn(svg,g)}};
if(typeof PS_DIAG!=="undefined")Object.assign(PS_DIAG,{[ID+"|Bigger islands, more life"]:"islspa",[ID+"|Islands keep a balance"]:"islmw",[ID+"|Krakatoa starts again"]:"islkrak",[ID+"|One finch, many finches"]:"islbeak",[ID+"|Giants and dwarfs"]:"islrule",[ID+"|Islands we make"]:"islfrag"});
try{["islspa","islmw","islkrak","islbeak","islrule","islfrag"].forEach(k=>{if(!DG_ORDER.includes(k))DG_ORDER.push(k);if(!SIM_KEYS.includes(k))SIM_KEYS.push(k)})}catch(e){}
}
/* ---------- questions: a right answer inks the named country's Knowledge stamp ---------- */
try{if(typeof TOURQ!=="undefined")TOURQ[ID]={mid:[
 {at:"Bigger islands, more life",st:"Bigger islands, more life",q:"An island is ten times bigger than its neighbour. Roughly how many more kinds of reptiles and amphibians would you expect on it?",o:["The same number","About twice as many","Ten times as many","A hundred times as many"],a:1,why:"Darlington’s rule of thumb: ten times the area, about twice the species.",kc:"cu"},
 {at:"Far from everywhere",st:"Far from everywhere",q:"What is Hawaii’s only native land mammal?",o:["A rat","A bat","A fox","A wild pig"],a:1,why:"Only flying mammals could cross 3,800 km of ocean; pigs and rats came with people.",kc:"us"},
 {at:"Krakatoa starts again",st:"Krakatoa starts again",q:"Fifty years after the 1883 eruption wiped Krakatoa clean, what had happened to its number of land-bird species?",o:["It was still zero","It kept climbing every year","It had levelled off at about 30","It was higher than before the eruption"],a:2,why:"Arrivals and losses balanced at about 30 kinds, though the cast kept changing.",kc:"id"},
 {at:"One finch, many finches",st:"One finch, many finches",q:"After the 1977 drought on the Galápagos, the surviving finches’ chicks had…",o:["Smaller beaks","Deeper, stronger beaks","Longer legs","No change at all"],a:1,why:"Only big, hard seeds were left, so big-beaked finches survived and passed their beaks on.",kc:"ec"},
 {at:"Giants and dwarfs",st:"Giants and dwarfs",q:"On which island did elephants shrink to about 1 m tall?",o:["Sicily","Iceland","Ireland","Sri Lanka"],a:0,why:"Sicily and Malta had dwarf elephants, descended from straight-tusked elephants about 4 m tall.",kc:"it"},
 {at:"Strangers from the ships",st:"Strangers from the ships",q:"What wiped out most of Guam’s native forest birds?",o:["A volcano","A hurricane","The brown tree snake","Bird flu"],a:2,why:"The snake arrived in cargo around 1950; with no predators it spread to up to 2 million.",kc:"gu"},
 {at:"Lakes are islands too",st:"Lakes are islands too",q:"Which lake has about 500 kinds of cichlid fish that evolved in perhaps 15,000 years?",o:["Lake Baikal","Lake Victoria","Lake Titicaca","Lake Superior"],a:1,why:"Lake Victoria, shared by Uganda, Kenya and Tanzania, nearly dried out about 15,000 years ago.",kc:"ug"}],
 recap:[
 {q:"New Zealand’s only native land mammals are…",o:["Possums","Bats","Kiwis","Rabbits"],a:1,why:"Birds such as moa and kiwi took the jobs mammals do elsewhere.",st:"A land of birds",kc:"nz"},
 {q:"Where was the ‘tree lobster’, thought extinct, found again in 2001?",o:["On Ball’s Pyramid, a sea stack","In a zoo in Sydney","In New Guinea","On Tasmania"],a:0,why:"24 insects lived under one shrub on Ball’s Pyramid, 20 km from Lord Howe Island.",st:"The tree lobster",kc:"au"},
 {q:"Tepuis, the table mountains with life found nowhere else, rise mostly in which country?",o:["Peru","Venezuela","Chile","Mexico"],a:1,why:"Most tepuis, including Auyán-tepui with Angel Falls, are in Venezuela; Roraima is shared with Brazil and Guyana.",st:"Islands in the sky",kc:"ve"},
 {q:"In which country is the long-running experiment on forest fragments near Manaus?",o:["Peru","Colombia","Brazil","Bolivia"],a:2,why:"Since 1979, scientists there have watched small forest patches lose species fastest.",st:"Islands we make",kc:"br"},
 {q:"The dodo lived only on which island?",o:["Madagascar","Mauritius","Réunion","Sri Lanka"],a:1,why:"It vanished within about 80 years of sailors arriving, by the 1660s.",st:"Strangers from the ships",kc:"mu"}]}}catch(e){}
/* ---------- photos: card photos by stop, photo pins by label (Commons file names; extra photos below) ---------- */
const CARD={"Islands of life":"Galapagos giant tortoise, head (Chelonoidis niger hoodensis).jpg","Krakatoa starts again":"Anak Krakatau (Anak Krakatoa), Indonesia - 12 May 2023 (52891922902).jpg","Giants and dwarfs":"Komodo dragon (Varanus komodoensis).jpg","Islands in the sky":"Monte Roraima, ponto mais alto.jpg","Lakes are islands too":"A Fisherman on Lake Victoria, Uganda.jpg","Strangers from the ships":"Dronte dodo Raphus cucullatus.jpg","Far from everywhere":"Na Pali Coast, Kauai, Hawaii.jpg"};
const PIN={"Anak Krakatau, the ‘child of Krakatoa’":"Anak Krakatau (Anak Krakatoa), Indonesia - 12 May 2023 (52891922902).jpg","Komodo dragon: the biggest lizard alive":"Komodo dragon (Varanus komodoensis).jpg","The dodo":"Dronte dodo Raphus cucullatus.jpg","Mount Roraima, a tepui":"Monte Roraima, ponto mais alto.jpg","Fishing on Lake Victoria":"A Fisherman on Lake Victoria, Uganda.jpg","Forest cut into patches":"Aerial view of the Amazon Rainforest.jpg"};
const PHOTOS=window.GF_ISL_PHOTOS||[];
try{if(window._gfExtraDone&&typeof PS_PHOTO_DATA!=="undefined"){const have=new Set(PS_PHOTO_DATA.map(p=>p.f));PHOTOS.forEach(p=>{if(!have.has(p.f))PS_PHOTO_DATA.push(p)})}else if(typeof GF_EXTRA_PHOTOS!=="undefined")PHOTOS.forEach(p=>GF_EXTRA_PHOTOS.push(p))}catch(e){}
PHOTOS.forEach(p=>{if(p.card)CARD[p.card]=p.f;(p.pins||[]).forEach(l=>PIN[l]=p.f)});
if(typeof psPhotoFor==="function"){const _pf=psPhotoFor;psPhotoFor=function(St){try{if(typeof ps!=="undefined"&&ps&&ps.tour===ID&&St&&CARD[St.title]){if(typeof gfMergeExtra==="function")gfMergeExtra();const p=PS_PHOTO_DATA.find(x=>x&&x.f===CARD[St.title]&&x.d);if(p)return p}}catch(e){}return _pf.apply(this,arguments)}}
try{Object.assign(GF_SQ_FILE,PIN)}catch(e){}
/* photo pins still without a photo show as ordinary labelled points */
PS_TOURS[ID].steps.forEach(St=>{if(!St.phPins)return;const keep=[],pts=[];St.phPins.forEach(q=>PIN[q.label]?keep.push(q):pts.push([q.at,q.label,"point"]));St.phPins=keep;if(pts.length)St.pins=(St.pins||[]).concat(pts)});
const KEEP=new Map(PS_TOURS[ID].steps.map(St=>[St,(St.phPins||[]).map(q=>Object.assign({},q))]));
function restore(){try{if(typeof ps==="undefined"||!ps||ps.tour!==ID)return;const St=psSteps()[ps.i],K=St&&KEEP.get(St);if(!K||!K.length)return;if(typeof gfMergeExtra==="function")gfMergeExtra();
 K.forEach(q=>{const f=PIN[q.label],k=f&&PS_PHOTO_DATA.findIndex(x=>x&&x.f===f);if(k>=0)PS_SQ_IMG[q.label]=k});
 if((St.phPins||[]).length!==K.length){St.phPins=K.map(q=>Object.assign({},q));if(typeof psPhPinsSync==="function")psPhPinsSync();if(typeof psPlacePins==="function")psPlacePins()}}catch(e){console.error(e)}}
if(typeof psGo==="function"){const _g=psGo;psGo=function(){const r=_g.apply(this,arguments);restore();setTimeout(restore,300);return r}}
/* on the Tours page, right after Human origins */
const o=PS_TOUR_ORDER,old=o.indexOf(ID);if(old>=0)o.splice(old,1);const a=o.indexOf("humans");o.splice(a>=0?a+1:o.length,0,ID);

/* ---------- fewer repeats across tours ---------- */
const swap=(tour,title,stop)=>{const T=PS_TOURS[tour];if(!T)return;const i=T.steps.findIndex(s=>s.title===title);if(i<0)return;T.steps[i]=fix(S(stop));
 try{const Q=TOURQ[tour];if(Q)["mid","recap"].forEach(k=>(Q[k]||[]).forEach(q=>{if(q.at===title||q.st===title){q._gone=1}}));if(Q){Q.mid=(Q.mid||[]).filter(q=>!q._gone);Q.recap=(Q.recap||[]).filter(q=>!q._gone)}}catch(e){}};
swap("animals","Madagascar",{title:"Monarch butterflies",view:[-125,12,-60,55],globe:[-95,35,1.8],hi:["mx"],
 lines:[{coords:[[-80,45],[-88,38],[-96,30],[-100.3,19.6]],kind:"flow"},{coords:[[-97,48],[-99,38],[-100.3,19.6]],kind:"flow"}],
 pins:[[[-100.27,19.6],"Fir forests of Michoacán: winter home","point"]],
 phPins:[{at:[-100.6,19.3],label:"Monarchs wintering in Mexico",col:"#e8701a",icon:"photo"}],
 stat:"Monarch butterflies fly up to about 4,000 km, from Canada and the US to a few mountains in Mexico",
 body:"Every autumn, millions of monarchs from eastern North America head south to fir forests about 3,000 m up in central Mexico, where they cluster on the trees by the million. None of them has ever made the trip before.",
 more:"The butterflies that fly south live about eight months; the summer generations live only a few weeks. It takes three or four generations to get back north, so the great-great-grandchildren of last year’s travellers find the same mountains."});
swap("animals","The dodo",{title:"Snow leopards",view:[60,25,115,52],globe:[88,38,2.2],hi:["cn","mn","np","bt","in","pk","af","tj","kg","kz","uz","ru"],
 phPins:[{at:[86,36],label:"Snow leopard",col:"#e8701a",icon:"photo"}],
 stat:"Snow leopards live in 12 countries, but about 60% of their mountains are in China",
 body:"These ‘ghosts of the mountains’ live high in the Himalayas, the Tibetan Plateau, the Pamirs and the Altai, up to about 5,500 m. Perhaps 4,000 to 6,500 are left in the wild.",
 more:"A snow leopard’s tail is almost as long as its body: it helps with balance on steep rock and wraps round its face like a scarf in the cold. Mongolia has the second-most."});
swap("islands","Lemur island",{title:"An island in a lake on an island",view:[95,-4,103,6],globe:[98.8,2.6,6],hi:["id"],
 pins:[[[98.8,2.6],"Samosir, in Lake Toba, on Sumatra","point"],[[-110.6,70.4],"Victoria Island, Canada: an island in a lake on an island in a lake on an island","point"]],
 phPins:[{at:[98.65,2.75],label:"Samosir in Lake Toba",col:"#2f6ea8",icon:"photo"}],
 stat:"Samosir, an island in Lake Toba on Sumatra, is nearly as big as Singapore",
 body:"Lake Toba fills the crater left by one of the biggest volcanic eruptions of the last two million years, about 74,000 years ago. The ground has since risen in the middle, making an island inside the lake.",
 more:"In Canada’s Arctic, on Victoria Island, there is even a small island in a lake on an island in a lake on an island, probably the deepest nesting of islands anywhere."});
})();
