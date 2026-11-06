/* GeoFlock: more kinds of places for the Maps search. The ocean floor (trenches, ridges, deeps), the map's lines (the
   Equator, tropics, polar circles, meridians, the Date Line), ocean currents, plate tectonics, straits, capes and canals,
   land and ice features, well-known regions, and the dictionary's words (which open the dictionary rather than the map).
   geoflock-search.js calls window.gfSearchMore() while it builds its index and skips any name it already has.
   Shapes are lists of [longitude, latitude]; lines are kept simple but placed where the real feature is. */
(function(){
/* a line with a point every 2 degrees or so, so it follows the curve on any map (d3 draws great circles between points).
   A step across the 180th meridian is taken the short way */
function dens(L,step){step=step||2;const out=[];for(let i=0;i<L.length;i++){const a=L[i];if(!i){out.push(a.slice());continue}const p=L[i-1];let dx=a[0]-p[0];if(dx>180)dx-=360;if(dx<-180)dx+=360;const dy=a[1]-p[1],n=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/step));
 for(let k=1;k<=n;k++){let x=p[0]+dx*k/n;if(x>180)x-=360;if(x<-180)x+=360;out.push([+x.toFixed(3),+(p[1]+dy*k/n).toFixed(3)])}}return out}
const ml=(...parts)=>({type:"MultiLineString",coordinates:parts.map(p=>dens(p))});
const ctr=g=>{try{const c=d3.geoCentroid(g);if(c&&isFinite(c[0]))return c}catch(e){}const p=g.coordinates[0][Math.floor(g.coordinates[0].length/2)];return p};
const line=(n,cat,typ,parts,o)=>{const g=ml(...parts);return Object.assign({n,alt:[],cat,typ,g,ll:ctr(g),fame:2},o||{})};
const spot=(n,ll,typ,o)=>Object.assign({n,alt:[],cat:"spots",typ,g:{type:"Point",coordinates:ll},ll,fame:2},o||{});
const par=lat=>{const L=[];for(let x=-180;x<=180;x+=2)L.push([x,lat]);return L};
const mer=lon=>{const L=[];for(let y=-90;y<=90;y+=2)L.push([lon,y]);return L};

window.gfSearchMore=function(){const E=[];
 /* ---- the ocean floor: trenches (the deep cuts where one plate dives under another), ridges and a seamount chain ---- */
 const T=(n,pts,o)=>E.push(line(n,"seafloor","ocean trench",[pts],o));
 T("Mariana Trench",[[145.5,23.5],[147,21],[147.8,18.5],[147.6,16],[146.6,13.6],[144.6,11.8],[142.2,11.3],[140.4,10.7],[138.8,9.5]],{alt:["Marianas Trench"],fame:1,typ:"deepest ocean trench"});
 T("Puerto Rico Trench",[[-70,20.3],[-68,20],[-66.4,19.7],[-64,19.3],[-62,18.6]]);
 T("Tonga Trench",[[-172.4,-15],[-173,-17.5],[-173.6,-20],[-174.7,-23.2],[-175.8,-25.6]]);
 T("Kermadec Trench",[[-175.8,-25.6],[-176.4,-28],[-176.9,-31],[-177.5,-34],[-178.6,-36.6]]);
 T("Java Trench",[[93,10],[92.6,6],[94,2],[96.8,-2.5],[100.5,-6.5],[104.5,-9.3],[108,-10.2],[111,-10.5],[115,-11],[119,-11.4]],{alt:["Sunda Trench","Sunda Megathrust"]});
 T("Kuril-Kamchatka Trench",[[163.5,55.5],[161.5,52.5],[158,49.6],[154,47],[150,44.5],[146.5,42],[144.6,41]],{alt:["Kuril Trench","Kamchatka Trench","Kuril–Kamchatka Trench"]});
 T("Japan Trench",[[144.6,41],[144.2,39],[143.7,37],[142.8,35.3],[142,34.2]]);
 T("Izu-Bonin Trench",[[142,34.2],[142.2,32],[142.4,29.5],[143,27],[144.3,25],[145.5,23.5]],{alt:["Izu–Bonin Trench","Izu–Ogasawara Trench","Bonin Trench"]});
 T("Aleutian Trench",[[-146,58.5],[-150,57],[-155,55],[-160,53.6],[-165,52.4],[-170,51.5],[-175,51],[180,50.6],[175,50.8],[170,51.8],[166,53.4],[164,54.8]]);
 T("Peru-Chile Trench",[[-81.3,-3.5],[-81.6,-7],[-80,-10.5],[-77.5,-13.5],[-74.5,-16.5],[-71.8,-19],[-71.4,-22],[-71.5,-25.5],[-72,-29],[-72.8,-33],[-74,-37],[-75,-41],[-75.9,-45]],{alt:["Atacama Trench","Peru–Chile Trench","Chile Trench"]});
 T("Philippine Trench",[[126.2,14],[126.7,11.5],[126.8,9],[126.8,7],[127,5],[127.6,3]],{alt:["Mindanao Trench"]});
 T("Middle America Trench",[[-105.8,19.6],[-103,17.8],[-100,16.3],[-97,15],[-94,14.4],[-91.8,13.3],[-89,12],[-87,10.8],[-85.5,9.4],[-84,8]],{alt:["Mesoamerica Trench","Central America Trench"]});
 T("South Sandwich Trench",[[-29.5,-55.3],[-27,-55.6],[-25,-56.8],[-24.4,-58.5],[-25,-60.2],[-27,-61.2]]);
 T("Hellenic Trench",[[20,38.3],[20.4,36.8],[21.7,35.6],[23.5,34.6],[25.5,34.2],[27.5,34.8],[29,35.7]],{alt:["Hellenic Arc"]});
 E.push(line("Cayman Trough","seafloor","deep trough in the Caribbean",[[[-88,15.9],[-85.5,17],[-82,18.2],[-79,19],[-76.5,19.4],[-74.5,19.8]]],{alt:["Cayman Trench","Bartlett Deep"]}));
 const R=(n,parts,o)=>E.push(line(n,"seafloor","mid-ocean ridge",parts,o));
 R("Mid-Atlantic Ridge",[[[-7,72],[-12,69.5],[-17,66.5],[-19,63.8],[-23,62],[-28,58],[-30,53],[-28.5,47],[-30,42],[-29,38.5],[-37,35],[-44,30],[-45.5,24],[-45,15],[-37,8],[-30,2],[-17,-1],[-13,-5],[-14,-15],[-13.5,-25],[-14,-35],[-16.5,-45],[-12,-52],[-1,-54.4]]],{fame:1,alt:["Mid Atlantic Ridge","Atlantic ridge"]});
 R("East Pacific Rise",[[[-109,23],[-108,20.5],[-105,16],[-104,10],[-102.5,5],[-104,0],[-107,-5],[-111,-12],[-113,-20],[-112.5,-28],[-112,-35],[-115,-45],[-117,-52],[-125,-56],[-140,-60],[-155,-62],[-175,-64]]],{fame:1});
 R("Ninety East Ridge",[[[88,10],[88.5,5],[89.3,0],[89.5,-8],[89,-15],[88.3,-22],[88,-31]]],{alt:["Ninetyeast Ridge","Ninety-East Ridge"],typ:"ridge on the ocean floor"});
 R("Southwest Indian Ridge",[[[70,-25.5],[66,-27],[62,-29],[57,-33],[52,-36],[45,-40],[38,-43],[32,-44.5],[25,-48],[15,-52],[7,-53],[0,-54.3]]]);
 R("Central Indian Ridge",[[[57.5,14],[60,11],[63,7],[66.5,2],[68,-3],[67.5,-9],[66,-15],[67,-21],[70,-25.5]]],{alt:["Carlsberg Ridge"]});
 E.push(line("Hawaiian-Emperor seamount chain","seafloor","chain of undersea volcanoes",[[[-155.5,19.5],[-158,21.3],[-161,22.8],[-166,23.8],[-171,25],[-176,27.8],[-178.5,28.5],[172,32],[170.5,36],[170,40],[168.5,45],[167.5,50],[167,53]]],{alt:["Hawaiian–Emperor seamount chain","Emperor Seamounts","Hawaiian Ridge","Emperor seamount chain"]}));
 /* deepest points and other spots on the ocean floor (and the ends of the Earth) */
 E.push(spot("Challenger Deep",[142.2,11.35],"deepest point of the ocean",{fame:1,h:-10935}),
  spot("Milwaukee Deep",[-66.43,19.77],"deepest point of the Atlantic",{alt:["Brownson Deep"],h:-8376}),
  spot("Horizon Deep",[-174.73,-23.26],"second-deepest point of the ocean",{h:-10800}),
  spot("Molloy Deep",[2.82,79.14],"deepest point of the Arctic Ocean",{alt:["Molloy Hole"],h:-5550}),
  spot("Kerguelen Plateau",[77,-55],"undersea plateau"),
  spot("Lord Howe Rise",[162,-30],"undersea plateau"),
  spot("Point Nemo",[-123.39,-48.88],"point farthest from land",{fame:1,alt:["Oceanic pole of inaccessibility"]}),
  spot("North Pole",[0,90],"northernmost point on Earth",{fame:1,alt:["Geographic North Pole"]}),
  spot("South Pole",[0,-90],"southernmost point on Earth",{fame:1,alt:["Geographic South Pole"]}));

 /* ---- the map's own lines ---- */
 const LN=(n,lat,typ,alt)=>E.push({n,alt:alt||[],cat:"lines",typ,g:{type:"MultiLineString",coordinates:[par(lat)]},ll:[0,lat],fame:1});
 LN("Equator",0,"line of latitude 0°",["the Equator"]);
 LN("Tropic of Cancer",23.44,"line of latitude 23.44° N",["Northern Tropic"]);
 LN("Tropic of Capricorn",-23.44,"line of latitude 23.44° S",["Southern Tropic"]);
 LN("Arctic Circle",66.56,"line of latitude 66.56° N");
 LN("Antarctic Circle",-66.56,"line of latitude 66.56° S");
 E.push({n:"Prime Meridian",alt:["Greenwich meridian","Greenwich Mean Time line","0° longitude"],cat:"lines",typ:"line of longitude 0°",g:{type:"MultiLineString",coordinates:[mer(0)]},ll:[0,51.48],fame:1});
 E.push({n:"Antimeridian",alt:["180th meridian","180° meridian","180° longitude"],cat:"lines",typ:"line of longitude 180°",g:{type:"MultiLineString",coordinates:[mer(180)]},ll:[180,0],fame:2});
 /* the Date Line bends round countries so that each keeps one date: east round Russia's tip, west of the Aleutians,
   east round Kiribati, and between Samoa and American Samoa down to east of New Zealand's Chatham Islands */
 {const g=ml([[180,90],[180,75],[-169,68.3],[-169,65.5],[-169.5,63],[180,55],[170,51.5],[180,47.5],[180,5],[-150,5],[-150,-11],[-171,-11],[-171.7,-15],[-172.5,-20],[-172.5,-45],[180,-51.2],[180,-90]]);
  E.push({n:"International Date Line",alt:["Date Line","Dateline","IDL"],cat:"lines",typ:"where the date changes",g,ll:[180,0],fame:1})}

 /* ---- ocean currents, from the map's current layer (a current may come in several pieces) ---- */
 try{const C=typeof CURRENTS!=="undefined"?CURRENTS:typeof GF_CURRENTS!=="undefined"?GF_CURRENTS:window.GF_CURRENTS||[],by=new Map();
  C.forEach(r=>{if(!r||!r[0]||!Array.isArray(r[2])||r[2].length<2)return;const o=by.get(r[0])||{w:r[1],parts:[]};o.parts.push(r[2]);by.set(r[0],o)});
  by.forEach((o,n)=>{const g=ml(...o.parts);E.push({n,alt:/Current$/.test(n)?[]:[n+" Current"],cat:"currents",typ:o.w?"warm current":"cold current",g,ll:ctr(g),fame:2})})}catch(e){console.error(e)}

 /* ---- plate tectonics ---- */
 const F=(n,pts,typ,o)=>E.push(line(n,"tectonics",typ,[pts],o));
 F("San Andreas Fault",[[-124.4,40.3],[-123.8,39.2],[-123.7,38.9],[-122.9,38],[-122.5,37.6],[-121.6,36.9],[-120.9,36.3],[-120.4,35.9],[-119.6,35.2],[-118.9,34.8],[-118,34.5],[-117.4,34.3],[-116.6,33.9],[-115.8,33.4]],"fault where two plates slide past",{fame:1});
 F("North Anatolian Fault",[[26,40.4],[27.5,40.7],[29.3,40.7],[30.6,40.7],[32.4,40.9],[34,41],[35.8,40.8],[37.5,40.3],[39,39.9],[40.5,39.5],[41.3,39.3]],"fault where two plates slide past");
 F("Alpine Fault",[[166.6,-45.4],[167.8,-44.7],[168.7,-44.1],[169.6,-43.6],[170.5,-43.1],[171.4,-42.7],[172.2,-42.3],[173,-42]],"fault where two plates slide past",{alt:["Alpine Fault (New Zealand)"]});
 E.push(line("Ring of Fire","tectonics","belt of volcanoes and earthquakes",[
  [[-73.5,-52],[-72.5,-40],[-70.5,-30],[-69,-20],[-72,-15],[-78,-6],[-78,1],[-77,7],[-84,10],[-90,14],[-96,17],[-103,19.5],[-112,28],[-118,34],[-122,38],[-122.5,44],[-123,48],[-130,54],[-140,59.5],[-152,59],[-160,55],[-170,52.5],[180,51.5],[170,53.5],[160,53],[156,50.5],[147,44.5],[141,40],[138,36],[133,33.5],[129,31],[124.5,25],[121.5,23],[121,18],[123.5,13],[125.5,8],[125,2],[122,-1],[120,-8.5],[115,-8.3],[110,-7.6],[105,-6.5],[101,-2],[96,4]],
  [[139.5,35],[140,30],[142,24],[145.5,17],[145,13]],
  [[131,-4],[136,-4],[141,-5],[147,-6],[152,-5],[155,-7],[160,-10],[167,-15],[169,-20],[175,-17],[178,-18],[-175,-18],[-175,-22],[-176.5,-30],[-178,-37],[176,-39],[175.6,-39.3],[173,-42],[170,-44.5],[167,-46]]],
  {alt:["Pacific Ring of Fire","Circum-Pacific Belt"],fame:1,ll:[-160,10]}));
 /* the plates, named where the map labels them (positions on the flat map, turned back into longitude and latitude) */
 try{const P=d3.geoRobinson().scale(318.31).translate([1e3,500.5]),dl=typeof SPIN!=="undefined"?SPIN.A.dl:0;
  (typeof ALLMAPS_PLATE_LABELS!=="undefined"?ALLMAPS_PLATE_LABELS:[]).forEach(r=>{if(!r||!r[0])return;let ll=P.invert([r[1],r[2]]);if(!ll||!isFinite(ll[0]))return;ll=[((ll[0]-dl+540)%360)-180,Math.max(-89.9,Math.min(89.9,ll[1]))];
   /* the usual English names: the Eurasian Plate, not the Eurasia Plate (the map's own name is kept as another name) */
   const ADJ={"North America":"North American","South America":"South American",Eurasia:"Eurasian",Africa:"African",Australia:"Australian",India:"Indian",Antarctica:"Antarctic",Arabia:"Arabian",Anatolia:"Anatolian",Somalia:"Somali"};
   const base=r[0].replace(/ plate$/i,""),n=(ADJ[base]||base)+" Plate",alt=ADJ[base]?[base+" Plate"]:[],big=/^(North America|Eurasia|Pacific|Antarctica|Africa|Australia|South America|Nazca|India|Indo-Australia)$/.test(base);
   E.push(spot(n,ll,big?"major tectonic plate":"tectonic plate",{alt,fame:big?1:3}))})}catch(e){console.error(e)}
 /* hotspots: places where hot rock rises from deep in the mantle, far from plate edges */
 [["Hawaii hotspot",[-155.3,19.4],["Hawaiian hotspot"]],["Iceland hotspot",[-17,64.4],[]],["Yellowstone hotspot",[-110.6,44.4],[]],["Réunion hotspot",[55.7,-21.2],["Reunion hotspot"]],["Galápagos hotspot",[-91.5,-0.4],["Galapagos hotspot"]],["Afar hotspot",[41.5,11.5],["Afar plume","Afar Triple Junction"]]]
  .forEach(([n,ll,alt])=>E.push(spot(n,ll,"volcanic hotspot",{alt})));

 /* ---- straits, channels, canals and capes ---- */
 [["Strait of Hormuz",[56.4,26.6],"strait",["Hormuz Strait"],1],["Bab-el-Mandeb",[43.4,12.6],"strait",["Bab el-Mandeb","Bab al-Mandab","Strait of Bab-el-Mandeb"],1],["Dardanelles",[26.4,40.2],"strait",["Strait of Dardanelles","Hellespont","Çanakkale Strait"],1],
  ["Bosporus",[29.05,41.12],"strait",["Bosphorus","Bosphorus Strait","Bosporus Strait","Istanbul Strait"],1],["Bering Strait",[-168.9,65.8],"strait",[],1],["Strait of Magellan",[-70.9,-53.4],"strait",["Magellan Strait"],1],
  ["Mozambique Channel",[40.5,-18],"channel",[],2],["Taiwan Strait",[119.5,24.3],"strait",["Formosa Strait"],2],["Korea Strait",[129,34.5],"strait",["Tsushima Strait"],2],["Cook Strait",[174.5,-41.2],"strait",[],2],
  ["Bass Strait",[146,-39.5],"strait",[],2],["Torres Strait",[142.4,-10.2],"strait",[],2],["Denmark Strait",[-27,67],"strait",[],2],["Florida Straits",[-80.5,24],"strait",["Straits of Florida","Florida Strait"],2],
  ["Strait of Messina",[15.63,38.2],"strait",["Messina Strait"],2],["Palk Strait",[79.7,10],"strait",[],2],["Strait of Dover",[1.4,51],"strait",["Dover Strait","Pas de Calais"],2],["Øresund",[12.7,55.8],"strait",["Oresund","The Sound","Öresund"],2],
  ["Skagerrak",[9.5,57.8],"strait",[],2],["Kattegat",[11.5,56.7],"strait",[],2],["Kerch Strait",[36.55,45.25],"strait",[],2],["Lombok Strait",[115.75,-8.6],"strait",[],3],["Sunda Strait",[105.8,-6],"strait",[],2],
  ["Hudson Strait",[-70,62],"strait",[],2],["Davis Strait",[-57,66.5],"strait",[],2],["Kiel Canal",[9.6,54.15],"canal",["Nord-Ostsee-Kanal"],2],["Corinth Canal",[22.99,37.93],"canal",[],2],
  ["Cape Horn",[-67.27,-55.98],"southern tip of South America",["Cabo de Hornos"],1],["Cape Agulhas",[20,-34.83],"southern tip of Africa",[],1],["Cape York",[142.53,-10.69],"northern tip of Australia",["Cape York Peninsula tip"],2],
  ["Cape Comorin",[77.54,8.08],"southern tip of India",["Kanyakumari"],2],["Land's End",[-5.71,50.07],"western tip of England",["Lands End"],2],["North Cape",[25.78,71.17],"northern tip of Europe (by tradition)",["Nordkapp"],2],
  ["Cape Finisterre",[-9.27,42.88],"cape",["Cabo Fisterra","Finisterre"],2],["Cape Canaveral",[-80.6,28.46],"cape and spaceport",[],2],["Cape Reinga",[172.68,-34.43],"northern tip of New Zealand",[],2]]
  .forEach(([n,ll,typ,alt,fame])=>E.push(spot(n,ll,typ,{alt,fame})));

 /* ---- low places, high plains and ice ---- */
 [["Death Valley",[-116.83,36.24],"lowest point in North America",["Badwater Basin","Badwater"],1],["Qattara Depression",[27,29.5],"desert basin below sea level",[],2],["Danakil Depression",[40.3,14.2],"hot desert basin below sea level",["Afar Depression","Danakil"],2],
  ["Turpan Depression",[89.3,42.6],"desert basin below sea level",["Turfan Depression"],2],["Tibetan Plateau",[88,33],"highest plateau on Earth",["Tibet Plateau","Qinghai-Tibet Plateau","Roof of the World"],1],["Altiplano",[-68,-18],"high plateau",["Bolivian Plateau","Andean Plateau"],2],
  ["Deccan Plateau",[77,17],"plateau",["Deccan"],2],["Colorado Plateau",[-110.5,37],"plateau",[],2],
  ["Greenland Ice Sheet",[-41,74],"ice sheet",["Greenland ice cap"],1],["Antarctic Ice Sheet",[30,-82],"largest ice sheet on Earth",["Antarctic ice cap"],1],["Ross Ice Shelf",[178,-81.5],"largest ice shelf",[],2],
  ["Ronne Ice Shelf",[-61,-78.5],"ice shelf",["Filchner-Ronne Ice Shelf","Ronne-Filchner Ice Shelf"],2],["Vatnajökull",[-16.8,64.4],"ice cap",["Vatnajokull"],2],["Lambert Glacier",[69,-73],"largest glacier on Earth",[],2],
  ["Aletsch Glacier",[8.02,46.45],"largest glacier in the Alps",["Great Aletsch Glacier"],2],["Siachen Glacier",[77.1,35.4],"glacier",[],2],["Lake Vostok",[106,-77.5],"lake under the Antarctic ice",["Vostok"],2],
  ["Norwegian fjords",[6.5,61.2],"fjords",["Fjords","Fjords of Norway","Norway's fjords","Fjord"],2]]
  .forEach(([n,ll,typ,alt,fame])=>E.push(spot(n,ll,typ,{alt,fame})));

 /* ---- regions ---- */
 {let ring=[[-80.19,25.76],[-64.78,32.3],[-66.1,18.47],[-80.19,25.76]];let g={type:"Polygon",coordinates:[ring]};try{if(d3.geoArea(g)>2*Math.PI)g={type:"Polygon",coordinates:[ring.slice().reverse()]}}catch(e){}
  E.push({n:"Bermuda Triangle",alt:["Devil's Triangle"],cat:"regions",typ:"area of sea (by legend)",g,ll:[-70.4,25.5],fame:2})}
 [["Fertile Crescent",[42,34],"historic region",[],2],["Kurdistan",[43.5,37],"region where Kurds live",["Kurdish region"],2],["Transnistria",[29.4,47.2],"breakaway region of Moldova",["Pridnestrovie"],2],
  ["Silicon Valley",[-122,37.4],"tech region",[],2],["Tornado Alley",[-98,37],"region with many tornadoes",[],2],["Rust Belt",[-82,41],"old industrial region",[],2],["Corn Belt",[-92,41.5],"farming region",[],2],
  ["Bible Belt",[-88,34],"cultural region",[],3],["Golden Triangle",[100.1,20.35],"where Thailand, Laos and Myanmar meet",["Golden Triangle (Southeast Asia)"],2],["Grand Banks",[-50,45],"shallow fishing banks",["Grand Banks of Newfoundland"],2],
  ["Dogger Bank",[2.5,54.8],"sandbank in the North Sea",[],2],["Wall Street",[-74.009,40.706],"New York's financial district",[],2]]
  .forEach(([n,ll,typ,alt,fame])=>E.push(spot(n,ll,typ,{alt,fame})));

 /* ---- words from the dictionary (monsoon, El Niño, Pangaea...): not places, so they open the dictionary ---- */
 try{(window.GF_DICT||[]).forEach(d=>{if(!d||!d.t)return;E.push({n:d.t,alt:(d.a||[]).filter(a=>a&&a.length>2),cat:"terms",typ:"word in the dictionary",g:{type:"Point",coordinates:[0,0]},ll:[0,0],fame:9})})}catch(e){console.error(e)}
 return E};
})();
