/* GeoFlock: "Human origins" — a guided tour of primate and human biogeography.
   Why Australia has no monkeys, how monkeys crossed oceans, and the many kinds of human that once shared the planet. */
(function(){
if(typeof PS_TOURS==="undefined"||typeof PS_TOUR_ORDER==="undefined")return;
const ID="humans",W=[-180,-58,180,80],OR="#d9682b";
const S=o=>Object.assign({_autoSpin:1,_ctx:1,_lg:1,_ky:1,_enr:1},o);
const ph=(at,label)=>({at,label,col:OR,icon:"photo"});
/* countries with wild monkeys or apes today (not counting people) */
const PRIM_AF=["sn","gm","gw","gn","sl","lr","ci","gh","tg","bj","ng","cm","gq","ga","cg","cd","cf","td","ne","ml","bf","sd","ss","er","et","dj","so","ke","ug","rw","bi","tz","mz","mw","zm","zw","bw","na","ao","za","sz","ma","dz"];
const PRIM_AS=["in","lk","np","bt","bd","mm","th","la","kh","vn","my","sg","bn","id","ph","tl","cn","tw","jp","pk","af"];
const PRIM_AM=["mx","gt","bz","hn","sv","ni","cr","pa","co","ve","gy","sr","ec","pe","bo","br","py","ar"];
const steps=[
S({title:"Our family’s map",view:W,globe:[30,10,1],
 stat:"For most of the last two million years, more than one kind of human was alive at the same time",
 body:"This tour follows primates, apes and humans across the map: where they could spread, where the sea stopped them, and why our species is the only human left.",
 more:"Dates in human evolution change as new fossils are found, and some ideas are still argued over. Where scientists disagree, the tour says so."}),
S({title:"Where primates live",view:[-135,-45,160,45],globe:[20,0,1],
 G:[{t:"Wild monkeys and apes",c:"#d9822b",codes:PRIM_AF.concat(PRIM_AS,PRIM_AM)},{t:"Lemurs: Madagascar only",c:"#8a4fd1",codes:["mg"]}],
 stat:"Apart from us, almost all primates live in the tropics, and none are native to Australia",
 body:"Primates are mostly tree animals of warm forests. Africa, South and Southeast Asia and Central and South America have them. Australia, with forests of its own, never had any.",
 more:"A few hardy exceptions live in the cold: Japanese macaques, the ‘snow monkeys’, bathe in hot springs, and Barbary macaques live in the mountains of Morocco and Algeria."}),
S({title:"Australia sails away",view:[95,-60,180,-5],globe:[135,-35,1.6],dg:"pangaea",
 pins:[[[134,-25],"Australia: no native primates","point"],[[30,-80],"Antarctica","point"]],
 stat:"Australia finally split from Antarctica about 35 million years ago and has been on its own ever since",
 body:"Australia was part of Gondwana, but it drifted away in the far south, far from where primates were spreading, and none ever reached it. Its mammals took a different path: kangaroos, koalas and wombats are marsupials.",
 more:"Drag the slider on the card to run the continents back to Pangaea. The first primates to set foot in Australia were people, at least 50,000 years ago."}),
S({title:"Monkeys on rafts",view:[-90,-40,30,25],globe:[-20,0,1.4],
 lines:[{coords:[[8,2],[-5,0],[-18,-2],[-30,-4],[-40,-5]],kind:"flow"}],
 pins:[[[-15,-6],"A narrower Atlantic, about 35–40 million years ago","point"]],
 phPins:[ph([-62,-4],"Howler monkeys: descendants of the rafters")],
 stat:"South America’s monkeys descend from African ancestors that crossed the Atlantic 35 to 40 million years ago",
 body:"There was no land bridge. The likeliest answer is that small monkeys drifted over on rafts of trees and plants washed out to sea, when the ocean was much narrower than today.",
 more:"They were not the only rafters: the ancestors of guinea pigs and capybaras made the same crossing at about the same time. South America’s monkeys still differ from Africa’s and Asia’s: they have flat noses, and many can grip with their tails."}),
S({title:"Lemur island",view:[30,-30,62,-8],globe:[47,-19,3],hi:["mg"],
 phPins:[ph([46.3,-21.9],"Ring-tailed lemurs")],
 stat:"All wild lemurs, about 100 kinds, live only on Madagascar",
 body:"Their ancestors reached Madagascar from Africa about 50 to 60 million years ago, probably by rafting too. With no monkeys or apes to compete with, they spread into almost every corner of the island.",
 more:"Some extinct lemurs were as big as gorillas. Most of the giants vanished in the last 2,000 years, after people arrived."}),
S({title:"Africa joins Asia",view:[20,0,80,45],globe:[45,22,2],
 lines:[{coords:[[38,8],[42,16],[46,24],[50,30],[56,34]],kind:"flow"},{coords:[[50,30],[60,32],[72,30],[85,26]],kind:"flow"}],
 pins:[[[44,28],"Arabia meets Asia, about 20 million years ago","point"]],
 stat:"About 20 million years ago Arabia ran into Asia and joined Africa to it by land",
 body:"Elephants, apes and later monkeys walked out of Africa across the new bridge. Asia’s gibbons, orangutans and macaques all descend from these travellers.",
 more:"Africa is still pushing into Europe and Asia today: the same collision is slowly closing the Mediterranean and raising the mountains of Iran."}),
S({title:"The apes of Asia",view:[90,-10,130,32],globe:[110,8,2.4],hi:["id","my","bn"],
 pins:[[[108,24],"Gigantopithecus: southern China","point"]],
 phPins:[ph([114,1],"Bornean orangutan")],
 stat:"Gigantopithecus, a giant ape related to orangutans, may have stood up to 3 m tall",
 body:"It lived in the forests of southern China until roughly 250,000 years ago, and is known only from teeth and jaws, so its size is a careful guess. Today the only great apes outside Africa are orangutans, on Borneo and Sumatra.",
 more:"Gigantopithecus probably died out as its forests turned more open and seasonal and the fruit it relied on became harder to find. Orangutans are critically endangered, mainly because their forests are being cleared."}),
S({title:"Africa’s great apes",view:[-20,-15,40,15],globe:[15,0,2.2],
 G:[{t:"Gorillas",c:"#3a6ea5",codes:["ng","cm","gq","ga","cg","ao","cf","ug","rw"]},{t:"Chimpanzees",c:"#d9822b",codes:["sn","gn","ml","sl","lr","ci","gh","ng","cm","gq","ga","cg","cf","ss","ug","rw","bi","tz"]},{t:"Bonobos (and gorillas and chimps too)",c:"#8a4fd1",codes:["cd"]}],
 rivHi:["Congo"],
 phPins:[ph([12,-1.5],"Western gorilla"),ph([29.6,-4.7],"Chimpanzee")],
 stat:"Chimpanzees and bonobos are our closest living relatives, sharing about 98–99% of our DNA",
 body:"Their ancestors and ours split about 6 to 7 million years ago. The Congo River, too wide for apes to swim, split chimps from bonobos: bonobos live only south of it. DR Congo is the one country with all three.",
 more:"Gorillas, chimps and bonobos are all endangered. Bonobos live only in the Democratic Republic of the Congo, and are famous for settling arguments peacefully."}),
S({title:"Standing up",view:[25,-12,50,18],globe:[38,4,2.6],
 phPins:[ph([40.5,11.1],"Lucy, found at Hadar in 1974"),ph([35.35,-3.2],"Laetoli footprints: 3.7 million years ago")],
 stat:"Lucy walked upright 3.2 million years ago, but her brain was about the size of a chimpanzee’s",
 body:"Lucy is a skeleton of Australopithecus afarensis, found in the Afar region of Ethiopia. Footprints pressed into volcanic ash at Laetoli in Tanzania show that her kind walked on two legs.",
 more:"Walking upright came long before big brains. Lucy’s kind still had long arms and curved fingers, probably for climbing trees at night."}),
S({title:"The first tools",view:[28,-8,45,10],globe:[36,1,3],
 pins:[[[35.9,3.7],"Lomekwi: tools 3.3 million years old","point"],[[40.4,11.4],"Ledi-Geraru: oldest Homo jaw, 2.8 million years","point"]],
 phPins:[ph([35.35,-2.99],"Olduvai Gorge"),ph([36.1,3.2],"Lake Turkana")],
 stat:"The oldest known stone tools, from Lomekwi in Kenya, are about 3.3 million years old",
 body:"Our own genus, Homo, appears in East Africa about 2.8 million years ago. Olduvai Gorge in Tanzania, where the Leakey family dug for decades, gave its name to the oldest well-known kind of toolkit, the Oldowan.",
 more:"The East African Rift is the best place on Earth to find early humans: lakes and rivers buried bones quickly, volcanic ash layers can be dated, and the rift keeps lifting old layers back to the surface."}),
S({title:"The first to leave Africa",view:[0,-20,130,55],globe:[70,20,1.2],
 lines:[{coords:[[37,3],[40,12],[39,22],[38,32],[42,38],[44.3,41.3]],kind:"flow"},{coords:[[39,22],[48,28],[60,28],[75,24],[90,24],[102,22],[108,30],[109.5,34.1]],kind:"flow"},{coords:[[90,24],[98,14],[102,4],[106,-4],[110.9,-7.4]],kind:"flow"}],
 pins:[[[109.5,34.1],"China: Lantian, 1.6 million years ago","point"],[[110.9,-7.4],"Java: about 1.6 million years ago","point"]],
 phPins:[ph([44.3,41.3],"Dmanisi, Georgia: 1.8 million years ago")],
 stat:"By 1.8 million years ago early humans had reached Dmanisi, in Georgia",
 body:"Homo erectus was built much like us from the neck down. It spread from Africa across Asia to China and Java, and lasted far longer than our species has so far.",
 more:"On Java, Homo erectus survived until roughly 110,000 years ago. Some sites in China have stone tools said to be over 2 million years old, which would mean an even earlier exit from Africa; not all scientists accept them."}),
S({title:"The hobbits",view:[95,-15,130,22],globe:[115,2,2.4],
 pins:[[[120.45,-8.53],"Flores: Homo floresiensis","point"],[[121.8,17.7],"Luzon: Homo luzonensis","point"]],
 phPins:[ph([120.6,-8.7],"Homo floresiensis skull")],
 stat:"Homo floresiensis stood about 1.1 m tall and lived on Flores until about 50,000 years ago",
 body:"Flores was never joined to the mainland, even when the Ice Age sea was 120 m lower, so its first humans must have crossed open sea. On Luzon in the Philippines lived another small human, Homo luzonensis.",
 more:"Islands often shrink big animals, and Flores also had dwarf elephants. Whether the hobbits shrank from Homo erectus or came from an older, smaller kind of human is still argued over."}),
S({title:"Many kinds of human",view:[-15,-35,130,62],globe:[50,30,1.2],
 G:[{t:"Neanderthals",c:"#3a6ea5",codes:["es","pt","gb","fr","be","de","it","hr","si","cz","hu","gr","il","sy","iq","ir","uz","ge"]}],
 pins:[[[102.6,35.4],"Tibet: Denisovan jaw","point"],[[119.6,23.5],"Off Taiwan: Denisovan jaw","point"],[[27.75,-26],"Rising Star cave: Homo naledi","point"]],
 phPins:[ph([84.68,51.4],"Denisova Cave, Siberia: Denisovans and Neanderthals"),ph([6.95,51.23],"Neanderthal")],
 stat:"About 100,000 years ago there were at least five kinds of human on Earth",
 body:"Neanderthals lived from Spain to Siberia. Denisovans are known mostly from their DNA, a finger bone and teeth from a Siberian cave, and jaws from Tibet and the seabed off Taiwan. In South Africa, the small-brained Homo naledi lived as recently as about 250,000 years ago.",
 more:"In 2025, ancient proteins and DNA from a big skull found at Harbin in China linked it to the Denisovans, giving the first good look at a Denisovan face. It had been named Homo longi, and what to call the group is still being settled."}),
S({title:"Our own species",view:[-20,-38,52,38],globe:[15,5,1.6],
 pins:[[[35.9,5.4],"Omo Kibish, Ethiopia: about 230,000 years ago","point"],[[26.1,-28.8],"Florisbad, South Africa: about 260,000 years ago","point"]],
 phPins:[ph([-8.87,31.85],"Jebel Irhoud, Morocco: about 300,000 years ago")],
 stat:"The oldest known fossils of our species, Homo sapiens, are about 300,000 years old, from Jebel Irhoud in Morocco",
 body:"Early Homo sapiens fossils come from Morocco, Ethiopia and South Africa, so our species probably took shape across Africa rather than in one place.",
 more:"The earliest Homo sapiens had faces like ours but longer, lower braincases. The rounder modern head shape came gradually, over the next 200,000 years."}),
S({title:"Out of Africa again",view:W,globe:[60,20,1],
 lines:[{coords:[[37,3],[42,12],[48,16],[56,22],[66,24],[78,18],[90,22],[100,14],[106,2],[118,-6],[132,-14],[143,-34]],kind:"flow"},{coords:[[42,12],[36,28],[36,36],[29,41],[20,45],[10,47],[0,46]],kind:"flow"},{coords:[[56,22],[62,38],[80,45],[100,50],[120,58],[145,64],[179.9,65.8]],kind:"flow"},{coords:[[-180,65.8],[-165,64.5],[-150,61],[-128,52],[-115,38],[-100,22],[-82,8],[-74,-8],[-70,-30],[-71,-45]],kind:"flow"}],
 pins:[[[0,46],"Europe: about 45,000 years ago","point"],[[-168,65.5],"Bering land bridge","point"],[[-90,30],"Americas: at least 15,000 years ago","point"]],
 phPins:[ph([143.0,-33.7],"Lake Mungo: about 42,000 years ago")],
 stat:"Everyone outside Africa descends mostly from people who left it about 50,000 to 70,000 years ago",
 body:"Small groups crossed into Asia, and their descendants walked and paddled to Australia, Europe and, last of all, the Americas. Within a few tens of thousands of years, every other kind of human was gone.",
 more:"Why the others disappeared is not settled. Competition with our species probably played a part, along with climate swings and small, scattered populations. Footprints in New Mexico suggest people reached the Americas over 20,000 years ago, though that date is still debated."}),
S({title:"We still carry them",view:[-20,-50,180,62],globe:[100,0,1.1],
 G:[{t:"Up to about 5% Denisovan DNA",c:"#8a4fd1",codes:["pg","sb","vu","au"]}],
 pins:[[[88,31],"Tibet: a Denisovan gene for high altitude","point"],[[10,50],"About 1–2% Neanderthal DNA outside Africa","point"]],
 stat:"Most people whose ancestors come from outside Africa carry about 1 to 2% Neanderthal DNA",
 body:"Our ancestors met Neanderthals and had children with them, mostly around 50,000 years ago. People in Papua New Guinea and Aboriginal Australians also carry several per cent of Denisovan DNA.",
 more:"Some of these borrowed genes helped: a Denisovan version of the gene EPAS1 helps Tibetans live at high altitude. People living in Africa today carry some Neanderthal DNA too, brought back by later migrations."}),
S({title:"Now explore",view:W,globe:[20,10,1],
 stat:"Hover any country to see its name and neighbours",
 body:"Look for the barriers in this tour: seas that monkeys rafted across, a river that apes could not swim, and a land bridge that opened the way to Asia. The Animals tour has more of the same story."})];
const fix=s=>{if(s.G){s._hsMerged=1;s.legend=null;s.hi=s.hi||[...new Set(s.G.flatMap(g=>g.codes))];s.hiSoft=s.hiSoft||[]}
 if(s.dg){if(typeof PS_DIAG!=="undefined"&&typeof DG!=="undefined"&&DG[s.dg.split(":")[0]])PS_DIAG[ID+"|"+s.title]=s.dg;delete s.dg}return s};
PS_TOURS[ID]={name:"Guided tour on human origins",short:"Human origins",
 hint:"Why Australia has no monkeys, how monkeys crossed an ocean, and the other humans we met",
 map:{mode:"relief"},group:"nature",col:"#a0522d",steps:steps.map(fix)};
/* photos for this tour (Flickr, openly licensed), added to the shared photo library */
const PHOTOS=[{"f":"Lucy skeleton reconstruction.jpg","d":"photos/x92200f2c53c7c7d6.webp","by":"Tim Evanson","lic":"CC BY-SA 2.0","page":"https://www.flickr.com/photos/23165290@N00/7282894210"},{"f":"Australopithecus afarensis reconstruction.jpg","d":"photos/x2d4addd17adf8770.webp","by":"Tim Evanson","lic":"CC BY-SA 2.0","page":"https://www.flickr.com/photos/23165290@N00/7283201084"},{"f":"Laetoli footprints cast.jpg","d":"photos/xee86bdad47dbd1d8.webp","by":"Tim Evanson","lic":"CC BY-SA 2.0","page":"https://www.flickr.com/photos/23165290@N00/7282890638"},{"f":"Bornean orangutan.jpg","d":"photos/x0dc44147fa318a40.webp","by":"Eric Kilby","lic":"CC BY-SA 2.0","page":"https://www.flickr.com/photos/8749778@N06/12627089413"},{"f":"Chimpanzee.jpg","d":"photos/xfee874e01198af4d.webp","by":"AfrikaForce","lic":"CC BY 2.0","page":"https://www.flickr.com/photos/55630855@N07/5187976192"},{"f":"Western gorilla.jpg","d":"photos/xa8f11ffb0617124a.webp","by":"LaggedOnUser","lic":"CC BY-SA 2.0","page":"https://www.flickr.com/photos/47847725@N04/4530705035"},{"f":"Ring-tailed lemur.jpg","d":"photos/x1911f5a60144629b.webp","by":"Mathias Appel","lic":"CC0","page":"https://www.flickr.com/photos/91501748@N07/25911695040"},{"f":"Lake Turkana.jpg","d":"photos/x77b4155e695103db.webp","by":"Shaan Hurley","lic":"CC BY 2.0","page":"https://www.flickr.com/photos/7881775@N06/7255125428"},{"f":"Olduvai Gorge.jpg","d":"photos/x236b8b7fd91fa3be.webp","by":"David Berkowitz","lic":"CC BY 2.0","page":"https://www.flickr.com/photos/25897810@N00/5701713619"},{"f":"Red howler monkey.jpg","d":"photos/xede1d855595eefbf.webp","by":"archer10 (Dennis)","lic":"CC BY-SA 2.0","page":"https://www.flickr.com/photos/22490717@N02/36384553204"},{"f":"Lake Mungo.jpg","d":"photos/xbc2d03d88d4f29e2.webp","by":"CazzJj","lic":"CC0","page":"https://www.flickr.com/photos/64249609@N08/27464678334"},{"f":"Neanderthal skull.jpg","d":"photos/x2c5743001874c966.webp","by":"Gary Lee Todd, Ph.D.","lic":"CC0","page":"https://www.flickr.com/photos/101561334@N08/28650572992"}];
try{if(window._gfExtraDone&&typeof PS_PHOTO_DATA!=="undefined"){const have=new Set(PS_PHOTO_DATA.map(p=>p.f));PHOTOS.forEach(p=>{if(!have.has(p.f))PS_PHOTO_DATA.push(p)})}else if(typeof GF_EXTRA_PHOTOS!=="undefined")PHOTOS.forEach(p=>GF_EXTRA_PHOTOS.push(p))}catch(e){}
/* card photos by stop, photo pins by label */
const CARD={"Our family’s map":"Australopithecus afarensis reconstruction.jpg","Monkeys on rafts":"Red howler monkey.jpg","Lemur island":"Ring-tailed lemur.jpg","The apes of Asia":"Bornean orangutan.jpg","Africa’s great apes":"Western gorilla.jpg","Standing up":"Lucy skeleton reconstruction.jpg","The first tools":"Olduvai Gorge.jpg","Many kinds of human":"Neanderthal skull.jpg","Out of Africa again":"Lake Mungo.jpg"};
const PIN={"Howler monkeys: descendants of the rafters":"Red howler monkey.jpg","Ring-tailed lemurs":"Ring-tailed lemur.jpg","Bornean orangutan":"Bornean orangutan.jpg","Western gorilla":"Western gorilla.jpg","Chimpanzee":"Chimpanzee.jpg","Lucy, found at Hadar in 1974":"Lucy skeleton reconstruction.jpg","Laetoli footprints: 3.7 million years ago":"Laetoli footprints cast.jpg","Olduvai Gorge":"Olduvai Gorge.jpg","Lake Turkana":"Lake Turkana.jpg","Neanderthal":"Neanderthal skull.jpg","Lake Mungo: about 42,000 years ago":"Lake Mungo.jpg"};
if(typeof psPhotoFor==="function"){const _pf=psPhotoFor;psPhotoFor=function(S){try{if(typeof ps!=="undefined"&&ps&&ps.tour===ID&&S&&CARD[S.title]){if(typeof gfMergeExtra==="function")gfMergeExtra();const p=PS_PHOTO_DATA.find(x=>x&&x.f===CARD[S.title]&&x.d);if(p)return p}}catch(e){}return _pf.apply(this,arguments)}}
try{Object.assign(GF_SQ_FILE,PIN)}catch(e){}
/* photo pins still waiting for a photo show as ordinary labelled points */
PS_TOURS[ID].steps.forEach(S=>{if(!S.phPins)return;const keep=[],pts=[];S.phPins.forEach(q=>PIN[q.label]?keep.push(q):pts.push([q.at,q.label,"point"]));S.phPins=keep;if(pts.length)S.pins=(S.pins||[]).concat(pts)});
/* the site trims photo pins as each stop opens (for example one that repeats the card photo); this tour's pins are chosen by hand, so put them back and redraw */
const KEEP=new Map(PS_TOURS[ID].steps.map(S=>[S,(S.phPins||[]).map(q=>Object.assign({},q))]));
function restore(){try{if(typeof ps==="undefined"||!ps||ps.tour!==ID)return;const S=psSteps()[ps.i],K=S&&KEEP.get(S);if(!K||!K.length)return;if(typeof gfMergeExtra==="function")gfMergeExtra();
 K.forEach(q=>{const f=PIN[q.label],k=f&&PS_PHOTO_DATA.findIndex(x=>x&&x.f===f);if(k>=0)PS_SQ_IMG[q.label]=k});
 if((S.phPins||[]).length!==K.length){S.phPins=K.map(q=>Object.assign({},q));if(typeof psPhPinsSync==="function")psPhPinsSync();if(typeof psPlacePins==="function")psPlacePins()}}catch(e){console.error(e)}}
if(typeof psGo==="function"){const _g=psGo;psGo=function(){const r=_g.apply(this,arguments);restore();setTimeout(restore,300);return r}}
/* on the Tours page, right after Animals */
const o=PS_TOUR_ORDER,old=o.indexOf(ID);if(old>=0)o.splice(old,1);const a=o.indexOf("animals");o.splice(a>=0?a+1:o.length,0,ID);
})();
