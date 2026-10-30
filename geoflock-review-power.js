/* GeoFlock review: the Power & economy shelf (govmap, politics, capitals, geopol, borders, regions, gdp, transport, energy,
   resources, currencies, conflicts, timeline). Applies the accepted suggestions of the October 2026 tour review: reworks of
   Special regions, Transport and trade, History, Energy of the world, Energy and resources, International relations and
   Conflicts and peace (stops cut, merged, reordered and rewritten place → mechanism → result), new stops on the other tours,
   duplicate stories given one home tour, and tour questions kept in step with the stop titles. New stops reuse what the
   tour engine already draws: highlighted countries, arrows and dashed lines, rulers, the night map, the climate overlay
   (gfClimate), map layers and History-map years; photos come from the shared library.
   It only patches PS_TOURS at load. Each tour is patched once per steps array (steps._rvPow); if a tour rebuilds its steps,
   the patch runs again (at 0, 1.5, 5 and 12 s, and before a tour's first stop draws). Every edit is keyed by stop title,
   so a stop that is missing is simply skipped. Special and contested regions use neutral wording. */
(function(){
const def=(o,k,v)=>Object.defineProperty(o,k,{configurable:true,enumerable:true,writable:true,value:v});
const lock=(o,k,v)=>Object.defineProperty(o,k,{configurable:true,enumerable:true,get(){return v},set(){}});
const strip=s=>String(s==null?"":s).replace(/​/g,"").trim();
const W=[-180,-58,180,80];
const S=o=>Object.assign({_autoSpin:1,_ctx:1,_lg:1,_ky:1,_enr:1},o.view?{_ff:1}:{},o);
const ph=(at,label,f)=>({at,label,col:"#d9682b",icon:"photo",_f:f});
const P=(at,label)=>[at,label,"point"];
const libIdx=f=>{try{return PS_PHOTO_DATA.findIndex(x=>x&&x.f===f&&x.d)}catch(e){return -1}};

/* ======================================================================================================
   Tour specs. edit: {title: {field: value, app:{field: text appended}, rm:[[field, text removed]], rename: "new title"}}
   add: new stops. order: the final stop order by title (stops not listed are dropped).
   ====================================================================================================== */
const SPEC={};

/* ---------- GDP ---------- */
SPEC.gdp={
 edit:{
  "Flip the map: money per person":{app:{more:"Split evenly, the world’s output would give everyone about $14,000 a year, a sixth of the US figure. Everyday things cost much less in poorer countries, so the same money goes further there; adjusted for prices (purchasing power), the gaps shrink a lot, but they are still huge."}},
  "The Global South":{more:"The line comes from a 1980 report on the gap between rich and poor countries, led by Willy Brandt, a former West German chancellor. Today people usually say “Global North” and “Global South”, and the words are about wealth and history, not compass directions: Australia and New Zealand are “North”. Most of the South was colonised by European powers, and many of its economies were built to export raw materials rather than make goods. Read the line as history and a rough guide, not a strict border."}
 },
 add:[
  S({title:"Count the lights, not the figures",mode:"night",view:[98,22,136,50],globe:[118,38,3],card:"left",
   pins:[P([123.43,41.8],"Shenyang, capital of Liaoning"),P([116.4,39.9],"Beijing"),P([125.75,39.03],"North Korea: dark at night")],
   stat:"In 2007 Li Keqiang, later China’s premier, told the US ambassador that China’s GDP figures were “man-made”",
   body:"He was then the party chief of Liaoning, in the north-east, and said he judged its economy by three numbers that are hard to fake: the electricity it used, the freight its railways carried and the loans its banks made. The remark leaked in 2010, and The Economist named a “Li Keqiang index” after it.",
   more:"Satellites can do the same job from space, because lights at night grow with the economy: the map has switched to the Earth at night. A 2022 study by the economist Luis Martinez compared night lights with official growth figures and found that dictatorships seem to overstate their growth by about a third. GDP is a measurement, and measurements can be bent."}),
  S({title:"Richer than France, once",sub:"percapita",view:[-82,-56,-40,-16],globe:[-62,-34,2.5],card:"left",hi:["ar"],
   pins:[P([-58.38,-34.6],"Buenos Aires"),P([-61.5,-35.5],"The Pampas: beef and wheat")],
   phPins:[ph([-58.38,-34.6],"Buenos Aires: the Teatro Colón, opened in 1908","Fachada del Teatro Colón en Buenos Aires, Argentina.jpg")],
   stat:"Just before the First World War, Argentina was one of the ten or so richest countries per person, by some estimates ahead of France and Germany",
   body:"The flat, fertile Pampas grew beef and wheat, British-built railways carried them to Buenos Aires, and from the late 1870s refrigerated ships could take frozen meat all the way to Europe. Then a century of coups, debt defaults and runaway prices pulled Argentina back to the middle of the table.",
   more:"Old figures like these are rough estimates, but most put Argentina near the top around 1913. A quip often credited to the economist Simon Kuznets says there are four kinds of countries: developed, undeveloped, Japan and Argentina. South Korea, the last stop, shows a country climbing; Argentina shows that being rich is not for ever."})
 ],
 order:["The world’s money map","Two giants","China’s rise","States bigger than countries","Los Angeles vs. the world","India and the UK","Africa, and the power of exchange rates","Count the lights, not the figures","Flip the map: money per person","The richest per person","Norway saved its oil money","The Global South","Rich in resources, poor in income","The poorest countries","Poorer than Ghana","Richer than France, once","Now explore"]
};

/* ---------- Borders ---------- */
SPEC.borders={
 edit:{
  "Most neighbours":{body:"Hover a country to see who it touches. Brazil comes next in the Americas, touching every South American country except Chile and Ecuador, and France too, through French Guiana.",
   rm:[["more"," Three countries are completely surrounded by a single other country: Lesotho, by South Africa, and Vatican City and San Marino, by Italy."]]},
  "Rivers, mountains and rulers":{rm:[["more"," At the Berlin Conference of 1884–85, European powers split much of Africa this way, often ignoring the peoples who lived there."]]},
  "The longest borders":{app:{more:"The two have not fought each other since the War of 1812. At the Peace Arch, south of Vancouver, the gates stand open under the words ‘May these gates never be closed’."},
   phPins:[ph([-122.76,49],"The Peace Arch")]},
  "Disputed lands":{stat:"Some borders are still argued over, and different countries print different maps of them",
   body:"Kashmir is claimed in whole or part by India, Pakistan and China, and divided by a ceasefire line (the Conflicts tour tells its story). Western Sahara is mostly run by Morocco, but the Polisario Front, which seeks independence, and many countries do not accept that.",
   more:"Morocco has built a sand wall, the Berm, around most of Western Sahara; in 2025 the UN Security Council backed Morocco’s offer of autonomy as the basis for talks, while the Polisario Front says the Sahrawi people must still choose. Different countries print different borders: the same map can be legal in one country and banned in another."}
 },
 add:[
  S({title:"Borders still stop trade",mode:"history",sub:"2026",noDots:true,view:[-128,38,-62,60],globe:[-95,48,1.8],card:"left",hi:["ca"],hiSoft:["us"],
   gfRuler:{a:[-79.38,43.65],b:[-123.12,49.28]},
   pins:[P([-79.38,43.65],"Toronto"),P([-123.12,49.28],"Vancouver: over 3,000 km away"),P([-83.0,40.0],"Ohio: next door, across the border")],
   phPins:[ph([-83.07,42.31],"The Ambassador Bridge, Detroit–Windsor","Ambassador Bridge from the Detroit River, Windsor, Ontario, 2025-07-27 03.jpg")],
   stat:"In 1988 Canadian provinces traded about 20 times more with each other than with US states of the same size and distance",
   body:"The economist John McCallum expected the open, friendly Canada–US border to barely matter. Instead, a firm in Toronto was far more likely to sell to a customer in Vancouver, over 3,000 km away (the ruler), than to one in Ohio, just across the line. Different rules, money, contacts and habits add up to a hidden wall.",
   more:"Later studies shrank the effect a lot, but still found that even this easy border cuts trade. The Ambassador Bridge, between Detroit and Windsor, carries more trade than almost any other crossing in North America. Every other stop on this tour is about where lines run; this one is about what they do."}),
  S({title:"A field inside a field inside a field",mode:"history",sub:"2026",noDots:true,view:[87.6,25.4,90.6,27.0],globe:[89.1,26.2,9],card:"left",hi:["in","bd"],
   pins:[P([89.1,26.25],"Dahala Khagrabari"),P([89.45,26.32],"Cooch Behar")],
   stat:"Until 2015 the world’s only enclave of the third order was a jute field: a scrap of India inside Bangladesh, inside India, inside Bangladesh",
   body:"Around Cooch Behar, India and Bangladesh had about 160 enclaves, small islands of one country surrounded by the other. They were left over from treaties between the Maharaja of Cooch Behar and the Mughal Empire in the early 1700s. People living in them often could not reach their own country’s schools, hospitals or police without crossing a foreign border.",
   more:"The field, Dahala Khagrabari, was about the size of a football pitch. In 2015 the two countries swapped almost all the enclaves, and about 50,000 people living in them chose which nationality to take. The pieces are too small to show on this map: zoom in on the Satellite map to see the fields."})
 ],
 order:["Strange borders","The longest borders","Most neighbours","The shortest borders","Rivers, mountains and rulers","Africa carved up in Berlin","Europe before the First World War","Countries inside countries","Cut-off pieces","Landlocked","Borders still stop trade","Disputed lands","Land nobody wants","Borders through living rooms","A field inside a field inside a field","The island that switches","France’s longest border","The whisky war island","So close, never touching","A lake without a border","Now explore"]
};

/* ---------- Special regions (rework) ---------- */
SPEC.regions={
 edit:{
  "America’s islands":{more:"The US took Puerto Rico and Guam from Spain in the war of 1898, and wanted Pago Pago’s deep harbour, in American Samoa, as a coaling station for its steamships. US courts later ruled that these places belong to the United States without being fully part of it, which is why people living there cannot vote for president."},
  "Denmark’s far north":{more:"Greenland is not in the EU. It joined the European Community with Denmark in 1973, voted to leave in 1982, mostly to control its own fishing, and left in 1985, the first territory ever to do so. The Faroe Islands never joined."},
  "France across the oceans":{more:"Thanks to its scattered islands, France has one of the two largest sea areas (exclusive economic zones) of any country, rivalled only by the United States. Europe’s rockets launch from Kourou, in French Guiana, close to the equator, where the Earth’s spin gives them a free push. New Caledonia voted in three independence referendums, in 2018, 2020 and 2021, and stayed French each time; most independence supporters boycotted the last one."},
  "Britain’s scattered pieces":{more:"Many of these islands, such as the Cayman Islands and Jersey, became financial centres because they set their own low taxes while keeping British law and courts, which reassures investors. Argentina also claims the Falklands, which it calls the Islas Malvinas, and Spain claims Gibraltar."},
  "The Dutch Caribbean":{more:"Curaçao was the hub of Dutch trade in the Caribbean, including the slave trade. Its own creole language, Papiamentu, also spoken on Aruba and Bonaire, mixes Portuguese, Spanish, Dutch and African languages."},
  "Hong Kong and Macau":{more:"Britain took Hong Kong island in 1842, after the First Opium War, and later leased the New Territories next to it for 99 years; when the lease ran out in 1997, the whole territory was handed back. Macau, a Portuguese trading post since the 1550s, is the only place in China where casinos are legal, and they bring in most of its money."},
  "Taiwan":{body:"Taiwan is governed by the Republic of China (ROC), whose leaders retreated to the island in 1949, at the end of China’s civil war. The People’s Republic of China (PRC), which governs the mainland, claims Taiwan as part of its territory. Taiwan is not a UN member; 11 UN member states and the Holy See have official diplomatic relations with the ROC.",
   more:"Taiwan elects its own president and parliament, and makes most of the world’s most advanced computer chips. The Geopolitics tour looks at the strait between the island and the mainland."},
  "Breakaway regions of Europe":{stat:"Abkhazia, South Ossetia, Transnistria and Northern Cyprus govern themselves, but almost no countries recognise them",
   body:"Each split off after fighting, and each leans on a bigger protector. Transnistria, a strip of land along the Dniester river where many people speak Russian, broke away from Moldova in a short war in 1992 and has had Russian troops ever since; no UN member recognises it. Northern Cyprus was formed after a Turkish military operation in 1974 and declared independence in 1983; only Turkey recognises it.",
   more:"Abkhazia and South Ossetia broke away from Georgia in wars in the early 1990s; Russia recognised them after its war with Georgia in 2008, and only a handful of other countries have followed. Kosovo, which declared independence from Serbia in 2008, is a different case: about half of UN members recognise it, but Serbia and many others do not, and it is not a UN member."},
  "Somaliland":{body:"Somaliland was a British protectorate, while the rest of Somalia was ruled by Italy. The two joined in 1960, but after a long war against Siad Barre’s government in the 1980s, Somaliland declared independence in 1991. It has held its own elections since. In December 2025 Israel became the first UN member state to recognise it; Somalia and most countries consider it part of Somalia."},
  "Western Sahara":{body:"Spain ruled the territory until 1975. When Spain left, Morocco and Mauritania moved in, and the Polisario Front, which seeks independence for the Sahrawi people, fought them both. Today Morocco controls most of the territory, the Polisario-led Sahrawi Arab Democratic Republic claims it, and the UN lists it as a non-self-governing territory. Drag the UK over it: at about 266,000 km², the territory is a little bigger."},
  "The Kurdistan Region":{body:"The Kurdistan Region is an autonomous region of Iraq with its own parliament, government and security forces. Its self-rule began in 1991, when a no-fly zone after the Gulf War kept Iraq’s army out of the north, and Iraq’s 2005 constitution recognised it.",
   more:"In 2017 about 93% of voters backed independence in a referendum, but Iraq’s army then retook the oil city of Kirkuk, and the vote led nowhere. The Money on the map tour tells how the region kept its own old banknotes in the 1990s."},
  "Palestine":{body:"Palestine is recognised as a state by 157 of the 193 UN member states and has been a UN non-member observer state since 2012. It claims the West Bank, East Jerusalem and the Gaza Strip, which Israel captured in the 1967 war; large parts of them remain under Israeli control.",
   more:"The Palestinian Authority, set up under the Oslo Accords of the 1990s, runs parts of the West Bank from Ramallah."},
  "Arctic oddities":{more:"Under the Svalbard Treaty, citizens of the treaty’s member countries may live and work there without a visa, which is why Russia still runs a coal-mining settlement at Barentsburg. Burials stopped in Longyearbyen decades ago, because the frozen ground does not let bodies decay."}
 },
 add:[
  S({title:"German town, Swiss money",view:[7.9,47.4,9.5,48.0],globe:[8.69,47.7,9],card:"left",
   pins:[P([8.69,47.697],"Büsingen (Germany)"),P([8.635,47.696],"Schaffhausen (Switzerland)")],
   stat:"Büsingen is a German town completely surrounded by Switzerland, where people pay in Swiss francs",
   body:"Büsingen, on the Rhine, was cut off in the 1600s when the land around it passed to the Swiss town of Schaffhausen, and a vote to join Switzerland in 1918 led nowhere. Since 1967 it has been inside Swiss customs, so there are no checks at its edges and people mostly use Swiss francs, but its laws, taxes and police are German.",
   more:"It has both a German and a Swiss postcode, and its football club, FC Büsingen, is the only German team that plays in the Swiss league. The Borders tour has more pieces of countries cut off from the rest."}),
  S({title:"The mountain of monks",view:[22.6,39.4,25.6,41.0],globe:[24.33,40.16,7],card:"left",
   pins:[P([24.33,40.16],"Mount Athos, 2,033 m"),P([24.25,40.26],"Karyes, its capital")],
   phPins:[ph([24.33,40.16],"Mount Athos","Mt. Athos (3939757657).jpg")],
   stat:"No women have been allowed onto Mount Athos, in Greece, for about 1,000 years",
   body:"Mount Athos is a self-governing community of 20 Orthodox monasteries on a mountainous peninsula, reached only by boat. It is part of Greece and the EU, but runs its own affairs under a charter that Greece’s constitution protects, and visitors need a special permit: only a little over a hundred are let in each day.",
   more:"The ban covers most female animals too, though cats are tolerated to keep down mice. When Greece joined the European Community in 1981, a special declaration protected Athos’s status."}),
  S({title:"A border in the sea",view:[-11.5,51.2,-2.0,56.4],globe:[-6,54.5,5],card:"left",
   lines:[{coords:[[-5.02,54.97],[-5.82,54.85]],kind:"flow"},{coords:[[-3.0,53.41],[-4.5,54.0],[-5.9,54.62]],kind:"flow"}],
   pins:[P([-5.93,54.6],"Belfast: checks on goods from Great Britain"),P([-7.3,54.35],"The land border: no checks")],
   phPins:[ph([-5.95,54.6],"Belfast: a peace wall","Belfast peace wall.jpg")],
   stat:"Northern Ireland is part of the UK, but for goods it still follows many EU rules",
   body:"After Brexit, the UK and the EU both wanted to keep the land border in Ireland open, because checkpoints there had been targets during the Troubles and an open border is part of the peace. So the checks moved to the ports instead: some goods arriving from Great Britain (the arrows) face paperwork, while goods cross freely into Ireland.",
   more:"The deal, first called the Northern Ireland Protocol, was reworked as the Windsor Framework in 2023. Unionists say it weakens Northern Ireland’s place in the UK; others say it gives the region a rare foot in both markets. The Conflicts tour tells the story of the Good Friday Agreement."}),
  S({title:"A vote for a new country",view:[143,-12,163,-1],globe:[155.5,-6.2,4],card:"left",hiSoft:["pg","sb"],
   pins:[P([155.49,-6.32],"Panguna copper mine"),P([154.67,-5.43],"Buka"),P([147.18,-9.44],"Port Moresby, PNG’s capital")],
   phPins:[ph([154.75,-5.35],"Bougainville: a reef island","White Island, Bougainville.jpg")],
   stat:"In 2019, 97.7% of voters in Bougainville chose independence from Papua New Guinea",
   body:"Bougainville is an autonomous region of Papua New Guinea, but it lies at the top of the Solomon Islands chain, and its people have closer ties to the Solomons than to the PNG mainland: a German–British deal of 1899 drew the line between them. The vote was not binding: Papua New Guinea’s parliament must agree, and the two governments have talked about independence by about 2027.",
   more:"Anger over the huge copper mine at Panguna, its pollution and who got the money, set off a civil war from 1988 to 1998 in which many thousands died. If Bougainville does become independent, it could be the world’s next new country."})
 ],
 order:["Not quite countries","America’s islands","Denmark’s far north","France across the oceans","Britain’s scattered pieces","The Dutch Caribbean","German town, Swiss money","The mountain of monks","Arctic oddities","A border in the sea","Hong Kong and Macau","Taiwan","Breakaway regions of Europe","Somaliland","Western Sahara","The Kurdistan Region","Palestine","A vote for a new country","Now explore"]
};

/* ---------- Capital cities ---------- */
SPEC.capitals={
 edit:{
  "Capital cities":{more:"This tour visits old capitals placed for defence or trade, capitals built from scratch, capitals on the move, and the highest and the coldest."},
  "Washington, D.C.":{more:"Giving the capital a district of its own stops any one state from controlling it, and many federations copied the idea: Canberra, Brasília and Abuja sit in capital territories of their own too. New York and then Philadelphia were capitals first; New York is about 330 km away (drag the ruler). The District of Columbia still has no voting member of Congress."}
 },
 add:[
  S({title:"Beijing, guarding the north",view:[103,27,127,45],globe:[116.4,38,3],card:"left",hi:["cn"],
   gfRuler:{a:[116.4,39.9],b:[116.02,40.36]},
   lines:[{coords:[[120.15,30.27],[119.0,32.4],[118.3,34.0],[117.0,36.0],[116.5,38.0],[116.4,39.9]],kind:"flow"}],
   pins:[P([116.4,39.9],"Beijing"),P([116.02,40.36],"The Great Wall at Badaling"),P([118.8,32.06],"Nanjing: capital before 1421"),P([120.15,30.27],"Hangzhou: the Grand Canal’s southern end")],
   phPins:[ph([116.39,39.92],"Beijing: the Forbidden City, finished in 1420","Sunset of the Forbidden City 2006.JPG")],
   stat:"China’s capital sits at the northern edge of its farmland, about 60 km from the Great Wall",
   body:"Most of China’s people and wealth lie far to the south, but for centuries its greatest threats came from the horse peoples of the northern steppe. In 1421 the Ming emperor Yongle moved the capital from Nanjing to Beijing, to guard the mountain passes himself (the ruler measures the distance to the Wall).",
   more:"The Grand Canal (the arrow) brought rice from the south to feed the court and its armies. The Mongols had ruled China from the same spot, which they called Khanbaliq: it sat right between the steppe and the farmland."}),
  S({title:"Capital on a swamp, and back",view:[22,52,44,62.5],globe:[33,57,3.5],card:"left",hi:["ru"],
   gfRuler:{a:[30.31,59.94],b:[37.62,55.75]},
   pins:[P([30.31,59.94],"St Petersburg: capital 1712–1918"),P([37.62,55.75],"Moscow: capital again from 1918")],
   phPins:[ph([30.33,59.94],"St Petersburg: the Church of the Saviour on Spilled Blood","Auferstehungskirche (Sankt Petersburg).JPG")],
   stat:"Peter the Great built a new capital on marshland in 1703; the Bolsheviks moved it back to Moscow in 1918",
   body:"Peter wanted a “window on Europe”: a port on the Baltic, close to the countries he wanted Russia to copy, on land just won from Sweden. St Petersburg was the capital for about two centuries. In 1918, with German armies not far away, Lenin’s government moved back to Moscow, about 630 km inland (the ruler).",
   more:"Forced labourers built the city on the Neva’s swampy islands, and many died. Its place on the Gulf of Finland made it a gateway in peace and a target in war: in the Second World War it was besieged for almost 900 days. The same capital moved twice, for opposite reasons: first to open up to the world, then to hide from it."}),
  S({title:"Kyoto, never formally replaced",view:[128,30,145,41],globe:[137,36,3.5],card:"left",hi:["jp"],
   gfRuler:{a:[135.77,35.01],b:[139.69,35.69]},
   pins:[P([135.77,35.01],"Kyoto: capital from 794"),P([139.69,35.69],"Tokyo (Edo): the emperor’s home since 1868")],
   phPins:[ph([135.77,34.97],"Kyoto: Fushimi Inari shrine","Torii path with lantern at Fushimi Inari Taisha Shrine, Kyoto, Japan.jpg")],
   stat:"Kyoto was Japan’s capital for over 1,000 years, and no law has ever formally made Tokyo the capital instead",
   body:"In 794 the emperor moved to Kyoto, in a basin ringed by hills. In 1868, after the shoguns fell, the young Emperor Meiji moved to Edo, the shoguns’ old base on the Pacific coast, about 370 km away (the ruler), and renamed it Tokyo, “eastern capital”. The government simply settled there, and Tokyo has been the capital in practice ever since.",
   more:"Kyoto’s own name means “capital city”. In 1945 it was on the list of targets for the atomic bomb until the US Secretary of War, Henry Stimson, had it removed."}),
  S({title:"Ottawa, chosen by a queen",view:[-84,41,-69,48.5],globe:[-76,45,4],card:"left",hi:["ca"],
   lines:[{coords:[[-75.7,45.42],[-75.9,45.05],[-76.1,44.75],[-76.35,44.55],[-76.48,44.23]],kind:"dash"}],
   pins:[P([-75.7,45.42],"Ottawa"),P([-79.38,43.65],"Toronto"),P([-76.48,44.23],"Kingston"),P([-73.57,45.5],"Montreal"),P([-71.21,46.81],"Quebec City")],
   stat:"Queen Victoria chose Ottawa as Canada’s capital in 1857, partly because it lay farther from the United States",
   body:"Toronto, Kingston, Montreal and Quebec City were bitter rivals. Ottawa sat on the river between English-speaking Upper Canada and French-speaking Lower Canada, and further from the US border than the cities along the St Lawrence, a real worry within living memory of the War of 1812.",
   more:"The Rideau Canal (dashed), finished in 1832, gave the army a route from Ottawa to Kingston away from the border river. Ottawa is still not Canada’s biggest city: Toronto is about four times bigger."})
 ],
 order:["Capital cities","Beijing, guarding the north","Capital on a swamp, and back","Kyoto, never formally replaced","Washington, D.C.","Ottawa, chosen by a queen","Canberra, the compromise","Brasília: built in 41 months","Abuja, in the middle","Astana on the steppe","Naypyidaw: a capital of empty roads","Putrajaya, the garden city","Nusantara: a capital for Borneo","Three capitals","La Paz: the highest seat of government","The coldest capital","Now explore"],
 move:[["Not the biggest city","Ottawa, not Toronto","Ottawa, chosen by a queen"]]
};

/* ---------- How countries are run ---------- */
SPEC.govmap={
 hint:"Kings who rule and kings who are elected, presidents and prime ministers, one-party states, coups, compulsory votes, direct democracy, citizens chosen by lot, power shared by religion and countries with no army",
 add:[
  S({title:"Voting with a sword",sub:"gov/_",view:[4,45.3,12,48.4],globe:[8.5,46.8,5],card:"left",hi:["ch"],
   pins:[P([9.41,47.33],"Appenzell: the Landsgemeinde"),P([9.07,47.04],"Glarus: the other open-air assembly"),P([7.45,46.95],"Bern")],
   stat:"In the Swiss canton of Appenzell Innerrhoden, citizens still make laws by raising their hands in the town square",
   body:"Each April the voters gather for the Landsgemeinde, an open-air assembly, and decide on laws and leaders by a show of hands; Glarus does the same. All Swiss can force a national vote on a new law by collecting signatures, so Swiss voters go to the polls several times a year.",
   more:"Men traditionally proved their right to vote by carrying a sword or a dagger, and many still do. Appenzell Innerrhoden let women vote on local matters only in 1990, after Switzerland’s highest court forced it to."}),
  S({title:"Citizens picked by lottery",sub:"gov/_",view:[-12,51,-4.5,55.8],globe:[-7.5,53.4,5],card:"left",hi:["ie"],
   pins:[P([-6.26,53.35],"Dublin")],
   phPins:[ph([-6.26,53.35],"Dublin: the River Liffey","Ha'penny Bridge & River Liffey, Dublin (507194) (32094198423).jpg")],
   stat:"Ireland asked 99 citizens picked at random to study its abortion ban, and voters later followed their advice",
   body:"In a citizens’ assembly, ordinary people are chosen by lot, hear from experts and from both sides, then make recommendations. Ireland’s assembly of 2016–17 recommended changing the constitution, and in a 2018 referendum two-thirds of voters agreed.",
   more:"Choosing by lottery is very old: ancient Athens used a stone machine, the kleroterion, to pick citizens for its courts and councils. France, Belgium and others have since tried citizens’ assemblies of their own. It is a third way to choose who decides, neither elected nor born to it."}),
  S({title:"A census too risky to take",sub:"gov/_",view:[31,31,40,36.5],globe:[35.8,33.9,6],card:"left",hi:["lb"],
   pins:[P([35.5,33.89],"Beirut")],
   phPins:[ph([35.48,33.9],"Beirut: the Corniche","Beirut Corniche, Beirut, Lebanon.jpg")],
   stat:"Lebanon has not held an official census since 1932",
   body:"Lebanon’s top jobs are shared out by religion: the president must be a Maronite Christian, the prime minister a Sunni Muslim and the speaker of parliament a Shia Muslim, and parliament’s seats are split equally between Christians and Muslims. A new count could show how much the balance of the population has changed, and upset the whole deal.",
   more:"The sharing was meant to keep the peace between the many communities of a small, mountainous country. Critics say it locks in religious politics and makes government slow: Lebanon went without a president from 2022 to 2025 because parliament could not agree on one."})
 ],
 order:["How the world is run","One king, fifteen countries","Kings who still rule","Kings who are elected","Presidents or prime ministers","Ruled by one party","Soldiers take over","Free, partly free, not free","The biggest democracy","You must vote","Voting with a sword","Citizens picked by lottery","The oldest constitutions","Big countries split power","A census too risky to take","No army","Now explore"]
};

/* ---------- International relations (rework) ---------- */
SPEC.politics={
 hint:"The UN and its vetoes, nuclear powers, NATO, the EU, Schengen, clubs of neighbours, neutral countries, a country without land and countries not everyone recognises",
 edit:{
  "The euro":{rename:"In the EU, not in the euro",hi:["dk","se","pl","cz","hu","ro"],hiSoft:["at","be","bg","hr","cy","ee","fi","fr","de","gr","ie","it","lv","lt","lu","mt","nl","pt","sk","si","es"],
   stat:"Denmark and Sweden are rich EU members that have chosen to keep their own money",
   body:"Every EU country except Denmark has promised to join the euro one day, but no date is fixed. Denmark won a legal opt-out in 1992, and Swedish voters said no in a referendum in 2003, so Sweden stays out by choosing not to meet one of the entry rules. Poland, Czechia, Hungary and Romania keep their own currencies too (the euro countries are pale).",
   more:"Keeping your own money lets your central bank set its own interest rates and lets the currency fall in a crisis, as Poland’s did in 2009, but trading with euro neighbours means changing money. The Money on the map tour follows the euro itself."},
  "Peaceful splits":{rename:"How new countries are born",view:W,hi:["ss","tl","cz","sk","sg","no","me"],
   stat:"South Sudan, born in 2011, is the world’s newest country; Czechoslovakia split in two in 1993 without a single shot",
   body:"Most new countries came out of empires breaking up or out of war: South Sudan after decades of civil war, Timor-Leste after a quarter-century of Indonesian rule. But some split peacefully: Czechia and Slovakia’s “Velvet Divorce”, and Norway, which voted to leave its union with Sweden in 1905.",
   more:"Singapore was pushed out of Malaysia in 1965, and its leader Lee Kuan Yew wept on TV; it went on to become one of the richest countries on Earth. Montenegro left its union with Serbia after a referendum in 2006."}
 },
 add:[
  S({title:"A seat worth paying for",sub:"clubs/_",view:W,globe:[-40,20,1],card:"left",hi:["bh","co","cd","dk","gr","lv","lr","pk","pa","so"],hiSoft:["us"],
   pins:[P([-73.968,40.749],"UN headquarters, New York")],
   phPins:[ph([-73.968,40.749],"The Security Council meeting","UN Security Council Nov 16 2023.jpg")],
   stat:"When a country wins a seat on the Security Council, the aid it gets from the US rises by more than half",
   body:"The ten elected members can swing votes. A 2006 study by the economists Ilyana Kuziemko and Eric Werker found that US aid to them jumped by about 60% while they sat on the Council, most of all in years with big votes, and fell back once they left.",
   more:"Aid from the UN itself rose too, though much less. In the General Assembly every member, from China to Tuvalu, has one vote; on the Council, some votes clearly count for more than others. Highlighted: the ten elected members for 2026."}),
  S({title:"A country without land",sub:"clubs/_",view:[8,29,38,45.5],globe:[22,38,3],card:"left",hiSoft:["it","mt"],
   lines:[{coords:[[35.23,31.78],[28.22,36.43],[14.51,35.9],[12.48,41.9]],kind:"flow"}],
   pins:[P([35.23,31.78],"Jerusalem: founded about 1100"),P([28.22,36.43],"Rhodes: 1310–1522"),P([14.51,35.9],"Malta: 1530–1798"),P([12.481,41.905],"Rome: the Palazzo di Malta")],
   stat:"The Order of Malta has no territory, yet it exchanges ambassadors with over 100 countries",
   body:"It began as a hospital order in Jerusalem around 1100, then ruled Rhodes and later Malta (the arrows), until Napoleon took Malta in 1798. It kept its status as a sovereign body and today runs hospitals and aid work from a palace in Rome.",
   more:"It has observer status at the UN and issues a few hundred passports of its own, to its leaders and diplomats. Its palace on a shopping street in Rome has special status, but with no land and no citizens of its own it is not a country by the usual rules. Who counts as a country is less simple than it looks: see the next stop."}),
  S({title:"The war that never formally ended",sub:"clubs/_",view:[136,39,153,48.5],globe:[145,44,4],card:"left",hi:["jp","ru"],
   pins:[P([145.8,44.0],"Kunashir"),P([147.9,45.0],"Iturup"),P([146.7,43.8],"Shikotan"),P([146.0,43.45],"Habomai islets")],
   stat:"Japan and Russia have never signed a peace treaty to end the Second World War",
   body:"In the last days of the war, Soviet troops took the southern Kuril Islands, just off Hokkaido. Russia holds them today; Japan claims the four southernmost as its Northern Territories. Because neither side will give way on the islands, the two countries have never signed a full peace treaty.",
   more:"A 1956 declaration ended the state of war and restored diplomatic ties, so they are not still fighting, and it promised to hand over the two smallest islands once a treaty was signed. Talks went on for decades, but Russia suspended them in 2022 after Japan joined sanctions over Ukraine."})
 ],
 order:["Politics of the world","Five with a veto","A seat worth paying for","Nine nuclear powers","NATO","The EU is not NATO","In the EU, not in the euro","Borders without passports","Clubs of neighbours","Rich club, rising club","Commonwealth surprises","Neutral countries","A country without land","Countries in question","The war that never formally ended","How new countries are born","Now explore"],
 movePh:[["The newest countries","How new countries are born"]]
};

/* ---------- Geopolitics ---------- */
SPEC.geopol={
 edit:{
  "Geopolitics":{app:{more:"In 1904 the British geographer Halford Mackinder argued that whoever held the vast interior of Eurasia, out of reach of navies, could dominate the world (the Mapped books shelf follows his idea). The old contest between land powers and sea powers runs through this tour."}},
  "Russia and warm water":{rm:[["more"," Murmansk, far in the north, stays open all year only because the last warmth of the Gulf Stream reaches it."]]},
  "Rivers you can’t sail up":{body:"Southern and eastern Africa is a high plateau that drops steeply close to the coast, so its great rivers tumble over falls and rapids near the sea. Ships cannot sail far inland, as they can up the Rhine, the Mississippi or the Yangtze, which carries ocean-going ships deep into China.",
   rm:[["more"," The Yangtze, too, carries ocean-going ships deep into China."]]},
  "Chokepoints":{rm:[["more","held up about 400 others"]],app:{}},
  "The first island chain":{rm:[["more","The Taiwan Strait is about 130 km wide at its narrowest, four times the English Channel. "]]},
  "What lies underneath":{body:"Batteries, motors and electronics depend on a few places, and on even fewer factories that refine what is dug up.",
   more:"Processing matters more than mines: China refines most of the world’s rare earths, and much of its lithium and cobalt, wherever they were dug. In 2025 it limited exports of rare earths and magnets, and car factories abroad ran short; in November it paused its newest limits for a year. The DR Congo halted cobalt exports for months in 2025 to push prices up. Countries now race to open refineries of their own; the Energy and resources tour shows where the metals lie."}
 },
 add:[
  S({title:"The Suwałki Gap",view:[17,52.3,30.5,57.6],globe:[23.3,54.6,5],card:"left",hi:["ru","by"],hiSoft:["lt","lv","ee","pl"],
   gfRuler:{a:[22.79,54.36],b:[23.5,53.94]},
   pins:[P([20.51,54.71],"Kaliningrad (Russia)"),P([23.3,54.1],"The Suwałki Gap"),P([27.56,53.9],"Minsk (Belarus)")],
   stat:"Three NATO members, Estonia, Latvia and Lithuania, are joined to the rest of the alliance by a strip of land only about 65 km wide",
   body:"The short Polish–Lithuanian border runs between Kaliningrad, a piece of Russia, and Belarus, Russia’s ally (the ruler). If that strip were cut, the three Baltic states could be reached only by sea or air. NATO planners call it one of the most dangerous spots in Europe.",
   more:"It is Europe’s version of India’s “Chicken’s Neck”, a few stops back. The land is part of the same open plain as the tour’s first stop: low hills, lakes and forest, with no mountain to hold. Both sides have held large exercises near it since Russia’s full invasion of Ukraine."}),
  S({title:"An island for a base",view:[38,-26,98,30],globe:[68,0,1.8],card:"left",hiSoft:["mu"],
   lines:[{coords:[[72.41,-7.31],[50.6,26.2]],kind:"dash"},{coords:[[72.41,-7.31],[43.15,11.6]],kind:"dash"},{coords:[[72.41,-7.31],[80.27,13.08]],kind:"dash"}],
   pins:[P([72.41,-7.31],"Diego Garcia"),P([57.5,-20.2],"Mauritius"),P([50.6,26.2],"The Gulf"),P([43.15,11.6],"The Horn of Africa")],
   phPins:[ph([72.2,-5.35],"The Chagos Islands: Salomon Atoll","Salomons Atoll in the Chagos.jpg")],
   stat:"Britain removed about 1,500 islanders from the Chagos Islands to make way for a US base",
   body:"Diego Garcia lies near the middle of the Indian Ocean, within bomber range of the Gulf, East Africa and South Asia (the dashed lines). Britain split the Chagos Islands off from Mauritius in 1965, three years before Mauritius became independent, moved the Chagossians off them between 1968 and 1973, and let the US build a large air and naval base.",
   more:"In 2019 the International Court of Justice advised that Britain should hand the islands to Mauritius. In 2025 the two countries signed a deal to do so, with Britain leasing Diego Garcia back for 99 years; many Chagossians say they were again left out. A speck of coral matters because of where it is, not how big it is."})
 ],
 order:["Geopolitics","The open plain","Russia and warm water","The luckiest country","Lines in the sand","Buffer states","The wall of the Himalaya","The Suwałki Gap","Upstream holds the tap","Rivers you can’t sail up","Chokepoints","The strait that closed","The Red Sea shortcut","The Malacca dilemma","An island for a base","The South China Sea","The first island chain","The Arctic opens","What lies underneath","Cables on the seabed","Now explore"]
};

/* ---------- Transport and trade (rework) ---------- */
SPEC.transport={
 hint:"Containers and flags of convenience, Suez, mine-to-port railways, trains that change wheels, the railway to the sky and why cargo jets stop in Alaska",
 edit:{
  "Transport and trade":{body:"Planes, trains, ships and trucks tie the world together. This tour asks why the routes run where they do: why ships fly the flags of faraway countries, why trains change their wheels at borders and why cargo jets stop in Alaska."},
  "The Suez Canal blocked":{rename:"Suez: the ditch the world needs",card:"right",
   stat:"About 12% of world trade normally squeezes through one 193-km canal; close it, and ships sail round Africa, about 10 days longer",
   body:"Opened in 1869, the Suez Canal saves ships between Asia and Europe about 7,000 km (the blue route). In March 2021 the 400-metre Ever Given ran aground across it in a sandstorm and blocked it for six days while more than 350 ships queued. From late 2023, attacks on ships in the Red Sea sent most big container lines the long way round the Cape of Good Hope (red).",
   more:"The canal has been shut before: after the Six-Day War of 1967 it stayed closed for eight years, and the 15 ships trapped in the Great Bitter Lake, the “Yellow Fleet”, held their own sailing races and even an Olympics. The Geopolitics tour follows the Red Sea attacks."},
  "The world’s factory":{rename:"China sells, America buys"}
 },
 add:[
  S({title:"Flags of convenience",view:[-160,-15,15,58],globe:[-40,15,1.3],card:"left",hi:["lr","pa"],
   lines:[{coords:[[-77.45,38.95],[-10.8,6.3]],kind:"dash"}],
   pins:[P([-10.8,6.3],"Monrovia, Liberia"),P([-79.52,8.98],"Panama"),P([-77.45,38.95],"Liberia’s registry office, near Washington")],
   phPins:[ph([-10.8,6.3],"Monrovia, Liberia","Providence Island view of downtown Monrovia.jpg")],
   stat:"More of the world’s shipping sails under Liberia’s flag than any other, and even landlocked Mongolia keeps a ship registry",
   body:"Every ship must be registered in a country and fly its flag, but owners may pick any country that will take them. Many choose flags with low fees, low taxes and light rules. Liberia, Panama and the Marshall Islands together register over 40% of the world’s merchant fleet, though few of those ships ever call there.",
   more:"Liberia’s registry is run by a company near Washington, D.C. (the dashed line). Critics say these “flags of convenience” make it harder to hold owners to account for unsafe ships and badly treated crews."}),
  S({title:"Railways to the coast",view:[8,-19,32,-4],globe:[20,-11,3],card:"left",hi:["ao"],hiSoft:["cd","zm"],
   lines:[{coords:[[25.47,-10.72],[22.23,-10.71],[19.91,-11.78],[16.93,-12.38],[15.74,-12.78],[14.2,-12.6],[13.54,-12.36]],kind:"flow"}],
   pins:[P([13.54,-12.36],"Lobito"),P([15.74,-12.78],"Huambo"),P([22.23,-10.71],"Luau: the DR Congo border"),P([25.47,-10.72],"Kolwezi: copper and cobalt")],
   stat:"Many African railways run from a mine or plantation straight to a port, and link to almost nothing else",
   body:"Colonial rulers built lines to carry copper, cotton or cocoa out to ships, not to join African cities to each other. Each colony often chose its own rail width too, so trains could not cross borders. It is one reason trade between African countries is still so low.",
   more:"The Benguela Railway, finished in 1929, runs from Lobito on Angola’s coast towards the copper mines of DR Congo and Zambia (the arrow). It is being rebuilt as the “Lobito Corridor” with American and European money, partly as a rival to Chinese-built routes such as the TAZARA railway to Dar es Salaam."}),
  S({title:"Change wheels at the border",view:[12,48.5,40,58],globe:[26,53,3],card:"left",hi:["by"],hiSoft:["pl","ru"],
   lines:[{coords:[[37.62,55.75],[32.05,54.78],[27.56,53.9],[23.69,52.08]],kind:"flow"},{coords:[[23.69,52.08],[21.01,52.23],[17.0,52.4],[13.4,52.52]],kind:"dash"}],
   pins:[P([23.69,52.08],"Brest: the wheels change here"),P([37.62,55.75],"Moscow"),P([13.4,52.52],"Berlin")],
   phPins:[ph([23.66,52.08],"Brest: the fortress by the border","Brest Brest Fortress Kholm Gate 9209 2150.jpg")],
   stat:"Trains from China to Europe must change the width of their wheels twice on the way",
   body:"Russia and the other former Soviet countries lay their rails 1,520 mm apart (the solid line); China and most of Europe use 1,435 mm (dashed). So at the Chinese–Kazakh border, and again here at Brest, on the Polish border, containers are lifted onto new wagons or the wheels are swapped, which takes hours.",
   more:"A popular story says Russia chose wider rails to slow invaders, but it was mostly an engineering choice of the 1840s, often credited to advice from the American engineer George Washington Whistler, father of the painter. Spain’s older lines are wider too, so some Spanish trains have wheels that slide to a new width as they roll slowly through a special shed."}),
  S({title:"Planes stop in Alaska",view:[70,8,180,72],globe:[-165,50,1.3],card:"left",hi:["us"],
   lines:[{coords:[[113.92,22.31],[-149.99,61.17]],kind:"flow"},{coords:[[-149.99,61.17],[-89.98,35.04]],kind:"flow"}],
   pins:[P([113.92,22.31],"Hong Kong"),P([-149.99,61.17],"Anchorage: refuel"),P([-89.98,35.04],"Memphis")],
   phPins:[ph([-149.9,61.22],"Anchorage, Alaska","Anchorage, Alaska.jpg")],
   stat:"Anchorage, a city of about 300,000 people, has one of the world’s busiest cargo airports",
   body:"On a globe, the shortest path from East Asia to the heart of the US curves far north, over Alaska (the arrows). A cargo jet full of goods cannot also carry fuel for the whole trip, so freighters stop at Anchorage to refuel and swap loads.",
   more:"The airport says it is within about 9.5 hours’ flight of 90% of the industrialised world. On a flat map the route looks like a detour that runs off the edge; switch to the Globe and it is almost a straight line. Passenger jets, carrying less weight, mostly fly straight over."})
 ],
 order:["Transport and trade","The box that changed the world","Flags of convenience","Suez: the ditch the world needs","China sells, America buys","The Belt and Road","Railways to the coast","The Trans-Siberian","Change wheels at the border","China’s fast trains","The bullet train","The railway to the sky","North Sea to Black Sea","The Pan-American Highway","The busiest airports","Planes stop in Alaska","More bikes than people","Now explore"],
 merge:[["The long way round","Suez: the ditch the world needs"]],mergeView:[-80,-42,125,60]
};

/* ---------- Energy of the world (rework) ---------- */
SPEC.energy={
 hint:"The biggest oil field, air-conditioning on oil, giant dams, volcano heat, desert sun, North Sea wind, nuclear France, and the grids that store and move power",
 edit:{
  "Energy of the world":{body:"Energy lights our homes, moves cars and ships and runs factories. This tour visits the oil fields and pipelines, then the rivers, volcanoes, deserts and seas where cleaner power is made, and finally the grids that store power and carry it to where it is needed.",
   more:"The world is in the middle of an energy transition: solar and wind power are growing faster than any energy source before them. The straits that tankers squeeze through are in the Geopolitics tour."},
  "Lights in the dark":{stat:"About 730 million people, most of them in sub-Saharan Africa, still had no electricity at home in 2024"},
  "Coal: the first and the last":{rm:[["more",", and China burns more than half of the world’s coal"]]},
  "Three Gorges":{app:{more:"Its reservoir holds so much water that a NASA geophysicist calculated it makes each day about 0.06 millionths of a second longer."}}
 },
 add:[
  S({title:"Burning oil to stay cool",view:[33,15,60,33],globe:[46.7,24.7,3],card:"left",hi:["sa"],gfClimate:{alpha:.45},
   pins:[P([46.68,24.71],"Riyadh: summer days pass 45 °C")],
   phPins:[ph([46.68,24.71],"Riyadh","Riyadh Skyline.jpg")],
   stat:"In summer Saudi Arabia burns several hundred thousand barrels of crude oil a day just to make electricity",
   body:"Summer days in Riyadh pass 45 °C, and air-conditioning takes a huge share of the country’s power, so electricity use in summer is far above winter’s. Saudi Arabia has long burned crude oil straight in its power stations, something few other countries still do.",
   more:"Every barrel burned at home is a barrel not sold abroad, so the kingdom is building solar parks and gas power stations to save its oil for export. The climate zones are laid over the map: almost all of the country is hot desert."}),
  S({title:"The kettle surge",view:[-6.5,52.2,-2.0,54.0],globe:[-4.1,53.1,7],card:"left",hi:["gb"],
   xsec:{title:"Dinorwig: from the lower lake up to the upper one",pts:[[-4.12,53.118,"Llyn Peris"],[-4.105,53.124],[-4.09,53.13],[-4.075,53.135,"Marchlyn Mawr"]],mark:500,note:"The dashed line marks 500 m. Water falls about 500 m from the upper lake, through tunnels inside the mountain, to the turbines."},
   pins:[P([-4.11,53.12],"Dinorwig: a power station inside a mountain"),P([-4.075,53.135],"Marchlyn Mawr: the upper lake")],
   stat:"When a big TV match ends, millions of Britons switch on their kettles at once, and a power station hidden inside a Welsh mountain is ready to take the strain",
   body:"Dinorwig pumps water from a lower lake up to a higher one when power is cheap, then lets it rush back down through turbines deep inside the mountain when demand jumps. It can go from idle to full power in seconds, far faster than a coal or gas plant: move along the chart to see the drop.",
   more:"The biggest TV surge on record came after England’s penalty shoot-out against West Germany in the 1990 World Cup semi-final. Pumping water uphill is still the world’s biggest way of storing electricity, though big batteries are catching up fast."}),
  S({title:"One country, two frequencies",view:[128,30,146,44],globe:[137,36,3.5],card:"left",hi:["jp"],
   lines:[{coords:[[137.86,37.04],[138.1,36.4],[138.4,35.7],[138.63,35.12]],kind:"dash"}],
   pins:[P([139.69,35.69],"East: 50 hertz (German generators)"),P([135.5,34.69],"West: 60 hertz (American generators)")],
   stat:"Eastern Japan’s electricity runs at 50 hertz and western Japan’s at 60, because of two purchases made in the 1890s",
   body:"Mains power flows back and forth many times a second, and every generator on a grid must keep exactly the same beat. Tokyo bought German generators that ran at 50 beats (hertz) a second; Osaka bought American ones running at 60. The two grids grew up apart and meet roughly along the Fuji River (dashed), and power can cross only through special converter stations.",
   more:"After the 2011 earthquake and tsunami shut down power plants in the east, the west had spare electricity but could send only a small part of it across. Japan has been building more converters ever since."}),
  S({title:"Texas runs its own grid",view:[-110,24.5,-90,38],globe:[-99,31,3.5],card:"left",
   lines:[{coords:[[-106.6,32.0],[-103.06,32.0],[-103.04,36.5],[-100.0,36.5],[-100.0,34.56],[-94.04,33.55],[-94.04,31.99],[-93.6,30.0],[-94.4,29.5],[-97.15,25.95],[-99.1,26.4],[-100.5,28.2],[-101.4,29.77],[-103.2,28.98],[-104.5,29.6],[-106.6,31.8],[-106.6,32.0]],kind:"red"}],
   pins:[P([-97.74,30.27],"Austin"),P([-95.37,29.76],"Houston"),P([-96.8,32.78],"Dallas")],
   stat:"Most of Texas runs on its own electricity grid, with only thin links to the rest of the United States",
   body:"Power lines that cross state borders fall under federal rules, so Texas kept most of its grid inside the state (outlined). In February 2021 a deep freeze shut down gas wells and power plants, and with few links to its neighbours, Texas could not bring in enough power from outside.",
   more:"About 4.5 million homes and businesses lost power, some for days, and the state counted more than 200 deaths. Grids are like water pipes: the more connections, the easier it is to borrow in an emergency. The US has three main grids: the East, the West and Texas."})
 ],
 order:["Energy of the world","Lights in the dark","Ghawar, the biggest oil field","Burning oil to stay cool","Pipelines across a continent","Coal: the first and the last","Three Gorges","Itaipu, a dam for two","Iceland: heat from below","Sunshine in the desert","Wind over the North Sea","France: a nuclear nation","The kettle surge","One country, two frequencies","Texas runs its own grid","The energy transition","Now explore"]
};

/* ---------- Energy and resources (rework) ---------- */
SPEC.resources={
 hint:"Oil, coal, uranium and the metals and minerals dug from the ground: a town moved by its mine, a country short of sand, islands of bird droppings",
 edit:{
  "Energy and resources":{body:"This tour is about the fuels, metals and minerals dug from the ground: where they lie, why they are there, and how a few places came to dominate them. The Energy of the world tour shows how power is made and moved.",
   phPinsDrop:["Three Gorges","Blue Lagoon"]},
  "Oil under the ground":{more:"Most of Venezuela’s oil lies in the Orinoco Belt and is so thick it must be heated or thinned before it can flow. Canada’s comes mostly from oil sands in Alberta, dug out like mud. The Gulf is rich in oil because a long-gone ocean, the Tethys, laid down thick layers of plankton-rich mud there, and the slow collision of Arabia with Asia later folded the rock into huge domes that trap the oil."},
  "China and coal":{rm:[["more"," Britain, where the coal-powered Industrial Revolution began, shut its last coal power station in 2024."]]},
  "Uranium":{rm:[["more"," France makes about two-thirds of its electricity from nuclear power, the highest share of any country."]],phPinsDrop:["France: 2/3 nuclear"]},
  "Rare earths aren’t rare":{more:"The hard part is separating them, a messy, polluting chemical process that China mastered while others stopped. Bayan Obo, in Inner Mongolia, is the world’s biggest rare-earth mine. These magnets are one reason the clean-energy boom runs through China: it also makes about four-fifths of the world’s solar panels."}
 },
 add:[
  S({title:"A town that had to move",view:[14,64.8,25,69.2],globe:[20.2,67.85,5],card:"left",hi:["se"],hiSoft:["no"],
   gfRuler:{a:[20.22,67.855],b:[20.3,67.86]},
   lines:[{coords:[[20.23,67.86],[19.0,68.35],[17.43,68.44]],kind:"flow"},{coords:[[20.23,67.86],[20.9,67.1],[21.7,66.0],[22.15,65.58]],kind:"flow"}],
   pins:[P([20.23,67.855],"Kiruna"),P([17.43,68.44],"Narvik: ice-free port"),P([22.15,65.58],"Luleå")],
   stat:"Sweden is moving the centre of a whole town about 3 km east, because the iron mine beneath it is swallowing the ground",
   body:"Kiruna sits beside the world’s biggest underground iron-ore mine. The ore body slopes down under the town, and as miners dig it out deeper and deeper, the ground above cracks and sinks. So the town hall, shops and thousands of homes are being rebuilt on safer land to the east.",
   more:"In August 2025 Kiruna’s wooden church, once voted Sweden’s most beautiful building, was rolled in one piece on giant trailers to its new site, about 5 km away, over two days. The ore leaves by rail (the arrows) for Narvik, in Norway, where the Gulf Stream keeps the sea free of ice, and for Luleå on the Baltic."}),
  S({title:"Frozen electricity",view:[-62,-8,4,70],globe:[-25,35,1.4],card:"left",hi:["is"],
   lines:[{coords:[[-44.3,-2.53],[-30,20],[-20,45],[-14.22,65.03]],kind:"flow"}],
   pins:[P([-14.22,65.03],"Reyðarfjörður: aluminium smelter"),P([-15.8,64.95],"Kárahnjúkar dam"),P([-44.3,-2.53],"Alumina by sea")],
   stat:"Iceland has no aluminium ore, yet aluminium smelters use most of its electricity",
   body:"Making aluminium takes huge amounts of electricity, and electricity is hard to send across oceans. So it is cheaper to ship the white powder made from bauxite ore across the world (the arrow shows one route) to where power is cheap. Iceland’s dams and hot springs make plenty, and there are only about 400,000 Icelanders to use it.",
   more:"Aluminium is sometimes called “solid electricity”: much of its cost is the power that made it. The same logic puts smelters beside big dams in Norway, Canada and Siberia. The smelter at Reyðarfjörður, in the east, is fed by the Kárahnjúkar dam."}),
  S({title:"Running out of sand",view:[101.8,-0.4,106.2,2.8],globe:[103.85,1.29,7],card:"left",hi:["sg"],hiSoft:["my","id"],
   pins:[P([103.85,1.29],"Singapore"),P([104.45,0.9],"Riau Islands: sand exports banned in 2007")],
   phPins:[ph([103.86,1.28],"Marina Bay: built on reclaimed land","Marina Bay Singapore-3499.jpg")],
   stat:"Singapore has grown by about a quarter since the 1960s, mostly by piling imported sand into the sea",
   body:"Sand is the most-used raw material on Earth after water, because concrete, glass and new land all need huge amounts. Singapore, short of land, bought so much from its neighbours that Malaysia, Indonesia and Cambodia have all banned or limited sand exports.",
   more:"Desert sand is almost useless for building: the wind rounds its grains so smooth that they do not lock together in concrete. That is why builders in the Gulf, surrounded by desert, have shipped in sand from overseas."}),
  S({title:"Islands claimed for bird droppings",view:[-86,-24,-66,-2],globe:[-76.4,-13.6,4],card:"left",hi:["pe"],on:["currents"],
   pins:[P([-76.4,-13.64],"Chincha Islands")],
   stat:"In 1856 the United States passed a law letting its citizens claim any unclaimed island covered in bird droppings",
   body:"Off Peru, the cold Humboldt Current (on the map) brings up water rich in nutrients, which feeds vast shoals of anchovies and millions of seabirds, and because cold water keeps the air above it stable, it almost never rains. So the birds’ droppings, guano, piled up for thousands of years into layers tens of metres deep: the best natural fertiliser on Earth.",
   more:"Guano set off a worldwide rush in the mid-1800s (the book tour 1493 follows it to Europe’s fields). The US Guano Islands Act is still law, and the US still holds Pacific islands first claimed under it, such as Baker and Howland. Factory-made fertiliser and mined phosphate, the next stop, ended the guano age."})
 ],
 order:["Energy and resources","Oil under the ground","America pumps the most","A field for two","China and coal","Uranium","A town that had to move","Gold","Diamonds","Congo’s cobalt","The lithium triangle","Rare earths aren’t rare","Frozen electricity","Running out of sand","Islands claimed for bird droppings","Phosphate","Water from the sea","Now explore"]
};

/* ---------- Money on the map ---------- */
SPEC.currencies={
 edit:{
  "The euro":{app:{more:"The bridges and gateways on euro banknotes are made up, so that no country is favoured; in 2013 the Dutch town of Spijkenisse, near Rotterdam, built real copies of all seven bridges, each painted the colour of its note."}},
  "Germany, 1923":{app:{more:"It happened again in Zimbabwe, which issued a 100-trillion-dollar note in 2009, and in Hungary in 1946, where prices doubled about every 15 hours, the world record."}},
  "The market never sleeps":{body:"Money markets follow the Sun around the planet: trading opens in Sydney and Tokyo, moves to Hong Kong and Singapore, then London, then New York, and begins again. London handles the biggest share of the world’s currency trading, partly because its working day overlaps Asia’s afternoon and New York’s morning."}
 },
 add:[
  S({title:"Money with no country behind it",mode:"history",sub:"2000",view:[37,29,50.5,39.5],globe:[44,35,4.5],card:"left",hiSoft:["iq"],
   pins:[P([44.01,36.19],"Erbil"),P([44.37,33.31],"Baghdad")],
   phPins:[ph([44.01,36.19],"Erbil Citadel","Erbil Citadel.jpg")],
   stat:"In the 1990s Iraqi Kurds kept using old banknotes that no government still printed, and they held their value better than the new ones",
   body:"After the 1991 Gulf War, the Kurdish north of Iraq was cut off from Baghdad. Saddam Hussein’s government printed cheap new dinars by the million, while the north kept using the old, well-printed “Swiss dinars”, named after the Swiss-made printing plates. Because nobody could print any more of them, they kept their value.",
   more:"When Iraq replaced both in 2003–04, one Swiss dinar was exchanged for 150 of the new Saddam dinars. Money is valuable because people trust it and it is scarce, not simply because a government stands behind it."}),
  S({title:"The burger test",mode:"history",sub:"2026",view:[-12,36,30,58],globe:[8,47,3],card:"left",hi:["ch"],
   pins:[P([7.45,46.95],"Switzerland: one of the dearest Big Macs")],
   stat:"A Big Mac usually costs more in Switzerland than almost anywhere else on Earth",
   body:"Since 1986 the magazine The Economist has compared the price of a Big Mac in different countries, because it is the same burger everywhere. If it costs much more in one country, after changing the money at the market rate, that country’s currency is probably “overvalued”; if much less, “undervalued”.",
   more:"It is half a joke, but it explains a serious idea, purchasing power parity, which the GDP tour uses to compare countries fairly. Switzerland comes out dear partly because the franc is a safe haven: in a crisis people around the world buy francs, which pushes their price up."})
 ],
 order:["Money on the map","The first coins","Stone money of Yap","Paper money from China","The pound sterling","Amsterdam’s stock exchange","The euro","The CFA francs","The Eastern Caribbean dollar","Dollarisation","Germany, 1923","Venezuela’s lost zeros","Money with no country behind it","The market never sleeps","The burger test","Money on a phone","Now explore"],
 movePh:[["Zimbabwe’s trillion-dollar notes","Germany, 1923"]]
};

/* ---------- Conflicts and peace (rework) ---------- */
SPEC.conflicts={
 hint:"Westphalia, coal and steel, blue helmets, the Green Line, the DMZ, Kashmir, the Football War, a Pope’s mediation, Badme and peace deals from Belfast to Bogotá",
 edit:{
  "Blue helmets":{app:{more:"Most peacekeepers come from poorer countries: in late 2025 the biggest senders were small, landlocked Nepal, then Rwanda, Bangladesh and India."}},
  "Kashmir":{rm:[["more"," GeoFlock does not take sides in these claims."]],app:{more:"In May 2025 the two countries fought four days of missile and drone strikes before a ceasefire. GeoFlock does not take sides in these claims."}},
  "Neutral ground":{rename:"Geneva, city of peace",hiSoft:[],
   stat:"The Red Cross was founded in Geneva in 1863, and the first Geneva Convention was signed there a year later",
   body:"Switzerland’s neutrality, recognised in 1815, made Geneva a place where enemies could meet: the Red Cross began there, the first Geneva Convention on caring for wounded soldiers was signed in 1864, and the UN has its European headquarters there today.",
   more:"The Geneva Conventions, rewritten after the Second World War, now bind every country in the world: they protect prisoners, the wounded and civilians in war. Talks on Syria, Yemen and many other conflicts have been held in the city."}
 },
 add:[
  S({title:"Making war impossible",mode:"history",sub:"1955",view:[-4,42,17,56],globe:[7,50,4],card:"left",hi:["fr","de","it","be","nl","lu"],
   pins:[P([7.2,51.5],"The Ruhr: coal"),P([7.0,49.3],"The Saar"),P([6.2,49.1],"Lorraine: iron and steel"),P([6.13,49.61],"Luxembourg: the shared authority")],
   phPins:[ph([6.13,49.61],"Luxembourg","Luxembourg City - Looking down on the lower city.jpg")],
   stat:"In 1951 France and West Germany put their coal and steel under one shared authority, to make another war between them “materially impossible”",
   body:"Coal and steel were what you needed to build tanks and guns, and the coalfields and steelworks of the Ruhr, the Saar and Lorraine (the pins) lay close to a French–German border fought over three times in 70 years. Sharing them meant neither side could secretly re-arm, and both grew richer trading with each other.",
   more:"The European Coal and Steel Community had six members (lit) and its headquarters in Luxembourg; it grew into today’s European Union. The plan was proposed by France’s foreign minister Robert Schuman on 9 May 1950, a day now celebrated as Europe Day."}),
  S({title:"The Football War",mode:"history",sub:"1970",view:[-93,11.5,-82,17.5],globe:[-87.5,14.3,5],card:"left",hi:["sv","hn"],
   lines:[{coords:[[-89.2,13.7],[-88.4,14.2],[-87.2,14.6]],kind:"flow"}],
   pins:[P([-89.19,13.69],"San Salvador"),P([-87.21,14.07],"Tegucigalpa")],
   phPins:[ph([-87.21,14.09],"Tegucigalpa, Honduras","Downtown Tegucigalpa, Honduras.jpg")],
   stat:"In 1969 El Salvador and Honduras fought a 100-hour war that broke out after World Cup qualifying matches",
   body:"The football was only the spark. El Salvador is small and crowded, and much of its best land was held by a few big estates, so about 300,000 Salvadorans had moved to farm in larger, emptier Honduras (the arrow). When Honduras began taking land back and expelling them, tempers boiled over during three qualifying matches.",
   more:"About 3,000 people died, many of them civilians, and tens of thousands of Salvadorans were forced home. The Polish writer Ryszard Kapuściński made it famous as “The Soccer War”. The two countries later took their border quarrel to the International Court of Justice, which ruled in 1992."}),
  S({title:"The Pope stopped a war",mode:"history",sub:"1975",view:[-75,-57.5,-61,-50.5],globe:[-67,-55,5],card:"left",hi:["ar","cl"],
   pins:[P([-66.9,-55.05],"Picton"),P([-66.85,-55.28],"Lennox"),P([-66.5,-55.23],"Nueva"),P([-68.3,-54.8],"Ushuaia"),P([-67.27,-55.98],"Cape Horn")],
   phPins:[ph([-68.3,-54.8],"Ushuaia, on the Beagle Channel","Moored boats and edge of town Ushuaia Argentina Coral Prines.jpg")],
   stat:"In December 1978 Argentina and Chile came within hours of war over three small islands, until the Pope stepped in",
   body:"The islands of Picton, Lennox and Nueva, at the mouth of the Beagle Channel near Cape Horn, decide who controls the sea around them. Argentina’s military government rejected an arbitration ruling that gave them to Chile and readied an invasion; Pope John Paul II’s envoy, Cardinal Antonio Samoré, got both sides to talk instead.",
   more:"After six years of talks the two countries signed a treaty in 1984: Chile kept the islands, and Argentina most of the sea to the east. Argentines backed it in a vote."}),
  S({title:"A war over a dusty town",mode:"history",sub:"2000",view:[33,9,44,18.5],globe:[38.5,14,4.5],card:"left",hi:["er","et"],
   pins:[P([37.81,14.73],"Badme"),P([38.93,15.32],"Asmara")],
   stat:"From 1998 to 2000 Ethiopia and Eritrea fought a war that killed tens of thousands of people, over a border town of a few thousand",
   body:"The border had been drawn by Italy and Ethiopia around 1900 and never clearly marked on the ground. It mattered little until Eritrea became independent in 1993; then both sides claimed Badme. An international commission gave the town to Eritrea in 2002, but Ethiopia refused to accept the ruling for 16 years.",
   more:"In 2018 Ethiopia’s new prime minister, Abiy Ahmed, accepted the ruling and made peace with Eritrea, and in 2019 he won the Nobel Peace Prize. The border is still not marked on the ground, and relations have since soured again."})
 ],
 order:["Conflicts and peace","The Peace of Westphalia","Making war impossible","Blue helmets","Cyprus: the Green Line","Korea’s DMZ","Kashmir","The Football War","Clearing hidden bombs","The Pope stopped a war","The Good Friday Agreement","A war over a dusty town","Colombia’s peace deal","Settled in court","Refugees: where people go","Geneva, city of peace","Now explore"]
};

/* ---------- History (timeline, rework) ---------- */
SPEC.timeline={
 hint:"Persia to the Soviet Union: 2,500 years of empires on the History map, from Rome’s last day to the Cold War",
 edit:{
  "Alexander’s ten years":{more:"He founded or renamed many cities after himself; the greatest, Alexandria in Egypt, became the ancient world’s centre of learning."},
  "Rome and Han China":{more:"Romans called the Chinese the Seres, the “silk people”, and early in the first century AD the Roman Senate tried to stop men wearing silk, calling it too luxurious."},
  "The Mongols":{more:"Their relay of horse stations, the yam, let messengers cover hundreds of kilometres a day; the same roads later carried the Black Death west in the 1340s. Distance also set their limits: in 1260 most of the army in the Middle East rode home on news that the Great Khan had died, and the Mamluks of Egypt beat the force left behind at Ain Jalut, near Nazareth."},
  "The Americas in 1492":{more:"The Inca had no wheeled vehicles, no iron and no writing as we know it; they kept records on knotted cords called khipu and sent messages along their roads by relay runners."},
  "Russia reaches the Pacific":{more:"Furs, Russia’s “soft gold”, paid a large share of the state’s income, and rivers did the work: Siberia’s great rivers, joined by short portages, made a water road east."},
  "Latin America breaks free":{more:"The spark came from Europe: when Napoleon invaded Spain in 1808 and imprisoned its king, the colonies began governing themselves, and soon wanted to stay that way."},
  "The age of empire":{more:"Steamships, quinine against malaria and the machine gun made conquest far cheaper in the late 1800s, which is why so much of the map changed so fast."},
  "One country becomes fifteen":{more:"Overnight, about 25 million Russians found themselves living outside Russia, which still shapes Russia’s quarrels with its neighbours."}
 },
 add:[
  S({title:"Rome finally falls",sub:"1450/byz",view:[8,30,48,50],pins:[P([28.98,41.01],"Constantinople")],
   phPins:[ph([28.98,41.01],"Constantinople: Hagia Sophia","Hagia Sophia Mars 2013.jpg")],
   stat:"1453: the Roman Empire ends, just 39 years before Columbus sails",
   body:"The eastern half of the Roman Empire outlived the western half by nearly 1,000 years, ruling from Constantinople, guarded by water on three sides and by huge land walls. By 1450 (on the map) it was little more than the city itself. In 1453 the Ottoman sultan Mehmed II broke the walls with giant cannon and made the city his capital.",
   more:"Mehmed called himself “Caesar of Rome”. The city controlled the only sea route between the Black Sea and the Mediterranean, which is why empires fought over it for 2,000 years."}),
  S({title:"The sun never sets",sub:"1585/spa",view:W,gfEmpire:{y:1585,gk:"por",name:"Portugal’s empire",alpha:.55},
   pins:[P([-9.14,38.72],"Lisbon"),P([120.98,14.6],"Manila: the Philippines, named after Philip")],
   phPins:[ph([-9.14,38.71],"Lisbon","Arco Triunfal da Rua Augusta, Plaza del Comercio, Lisboa, Portugal, 2012-05-12, DD 02.JPG")],
   stat:"1580: one king, Philip II of Spain, rules both the Spanish and the Portuguese empires",
   body:"When Portugal’s royal line died out, Philip II claimed its throne. For 60 years one king ruled lands from Mexico and Peru to Brazil, Angola, Goa and the Philippines, which are named after him: the first empire on which, people said, the sun never set.",
   more:"Portugal won back its independence in 1640. The phrase about the sun later passed to the British Empire."}),
  S({title:"China’s map is drawn",sub:"1760/chn",view:[55,12,145,56],pins:[P([81.28,43.91],"The Ili valley: conquered 1759"),P([116.4,39.9],"Beijing")],
   phPins:[ph([75.99,39.47],"Kashgar, in Xinjiang","Kashgar Old Town.jpg")],
   stat:"1760: the Qing dynasty has roughly doubled the lands ruled from Beijing",
   body:"The Manchu rulers of the Qing conquered Mongolia, Taiwan, Tibet and, by 1759, the vast region they named Xinjiang, the “new frontier”. Today’s map of China follows the Qing borders more closely than those of any older Chinese dynasty.",
   more:"The conquest of Xinjiang destroyed the Dzungars, the Mongol people who had ruled it; most were killed or died of smallpox. Outer Mongolia, and lands in the north-east that went to Russia in the 1850s and 1860s, later slipped away."}),
  S({title:"The world splits in two",sub:"1950/ussr",view:[-30,5,150,75],pins:[P([13.4,52.52],"Berlin, divided"),P([127,38],"Korea, divided")],
   phPins:[ph([13.38,52.51],"The Berlin Wall falls, 1989","Fall of the Berlin Wall 1989, people walking.jpg")],
   stat:"1950: much of the world is lining up behind the United States or the Soviet Union",
   body:"After 1945 the two powers that had beaten Germany split Europe down the middle, from the Baltic to the Adriatic, and Germany and Korea were cut in two. For 40 years the map was coloured by which bloc a country belonged to, and newly independent countries in Asia and Africa were pressed to pick a side.",
   more:"Many refused to join either. The split ended with the fall of the Berlin Wall in 1989 and the end of the Soviet Union two years later."}),
  S({title:"Now explore",sub:"2026",view:W,stat:"Drag the timeline to any year",
   body:"Pick a place you know and watch who ruled it across 2,500 years. The history tours for each continent tell the stories behind these maps.",more:null})
 ],
 order:["2,500 years of empires","Alexander’s ten years","Rome and Han China","The Islamic golden age","The Mongols","Rome finally falls","The Americas in 1492","The sun never sets","Russia reaches the Pacific","China’s map is drawn","Latin America breaks free","The age of empire","Africa in 1914","The world splits in two","The Year of Africa","One country becomes fifteen","Now explore"]
};

/* ---------- tour questions (keyed by tour; replace a question by its wording, or add) ---------- */
const Q={
 regions:{mid:[
  {at:"German town, Swiss money",st:"German town, Swiss money",q:"Which money do people in the German town of Büsingen mostly use?",o:["The euro","The Swiss franc","The pound sterling","The Danish krone"],a:1,why:"Büsingen is surrounded by Switzerland and has been inside Swiss customs since 1967.",kc:"de"},
  {at:"A border in the sea",st:"A border in the sea",q:"Since Brexit, where are most checks on goods going from Great Britain to Northern Ireland made?",o:["At the land border with Ireland","At the ports on the Irish Sea","At the Channel Tunnel","Nowhere: there are no checks"],a:1,why:"Both sides wanted the land border in Ireland to stay open, so the checks moved to the ports.",kc:"gb"}],
  recapAdd:[{st:"A vote for a new country",q:"In 2019, voters in which region chose independence by 97.7%?",o:["Bougainville","New Caledonia","Greenland","Åland"],a:0,why:"Bougainville voted to leave Papua New Guinea; PNG’s parliament must still agree.",kc:"pg"}]},
 govmap:{recapReplace:{"Which capital replaced Rio in 1960?":{st:"A census too risky to take",q:"Why has Lebanon not held an official census since 1932?",o:["It has no maps","A count could upset how top jobs are shared between religions","Its people move too often","The UN forbids it"],a:1,why:"Lebanon’s top jobs and seats are shared by religion, and a new count could upset the balance.",kc:"lb"}}},
 politics:{stFix:{"The newest countries":"How new countries are born","Peaceful splits":"How new countries are born"},
  recapAdd:[{st:"The war that never formally ended",q:"Which two countries have never signed a peace treaty to end the Second World War?",o:["Japan and Russia","Germany and France","Italy and Greece","China and Japan"],a:0,why:"The quarrel over the southern Kuril Islands has blocked a treaty.",kc:"jp"}]},
 transport:{midReplace:{"Which airport is the world's busiest?":{at:"Planes stop in Alaska"}},stFix:{"The Suez Canal blocked":"Suez: the ditch the world needs"},
  midAdd:[{at:"Suez: the ditch the world needs",st:"Suez: the ditch the world needs",q:"About how much longer is the trip from Asia to Europe round Africa instead of through Suez?",o:["About a day","About 10 days","About a month","About three months"],a:1,why:"Sailing round the Cape of Good Hope adds about 10 days.",kc:"eg"},
   {at:"Change wheels at the border",st:"Change wheels at the border",q:"Why must trains from China to Europe change their wheels twice?",o:["The rails are different widths","The wheels wear out","Each country has its own trains","To cross the mountains"],a:0,why:"Former Soviet countries use 1,520 mm rails; China and most of Europe use 1,435 mm.",kc:"by"}]},
 energy:{midReplace:{"About a fifth of the world’s oil passes through which strait?":{at:"One country, two frequencies",st:"One country, two frequencies",q:"Why does eastern Japan’s electricity run at a different frequency from western Japan’s?",o:["Because of its earthquakes","Tokyo bought German generators in the 1890s, Osaka American ones","The east uses more nuclear power","The east is colder"],a:1,why:"Tokyo’s German generators ran at 50 hertz, Osaka’s American ones at 60, and the two grids grew up apart.",kc:"jp"}},
  recapReplace:{"In which country were about 96% of new cars sold in 2025 fully electric?":{st:"Texas runs its own grid",q:"Why could Texas not bring in enough power during the February 2021 freeze?",o:["Its grid has few links to the rest of the US","Its power lines are all underground","Its dams froze solid","It had sold its power stations"],a:0,why:"Texas kept most of its grid inside the state, so it could borrow little from its neighbours.",kc:"us"}}},
 resources:{midReplace:{"How do most homes in Iceland get their heat?":{at:"A town that had to move",st:"A town that had to move",q:"Why is the centre of the Swedish town of Kiruna being moved?",o:["Rising seas","The iron mine beneath it is making the ground sink","A volcano nearby","To be nearer the railway"],a:1,why:"As the ore is dug out deeper under the town, the ground above cracks and sinks.",kc:"se"},
  "Where is about three-quarters of the world's cobalt dug up?":{at:"The lithium triangle"}}},
 currencies:{stFix:{"Zimbabwe’s trillion-dollar notes":"Germany, 1923"}},
 conflicts:{stFix:{"Neutral ground":"Geneva, city of peace"},
  recapReplace:{"Which two countries share the world’s longest international border?":{st:"The Football War",q:"What really lay behind the 1969 “Football War” between El Salvador and Honduras?",o:["A disputed goal","Land, and Salvadoran farmers living in Honduras","Oil under the border","A row over hosting the World Cup"],a:1,why:"The matches were only the spark; the real quarrel was over land and migrants.",kc:"sv"}}},
 timeline:{mid:[
  {at:"Rome finally falls",st:"Rome finally falls",q:"Which city did the Ottomans capture in 1453, ending the Roman Empire?",o:["Rome","Constantinople","Venice","Baghdad"],a:1,why:"Mehmed II broke Constantinople’s walls with giant cannon and made it his capital.",kc:"tr"},
  {at:"China’s map is drawn",st:"China’s map is drawn",q:"Which dynasty’s conquests drew most of today’s map of China?",o:["The Han","The Ming","The Qing","The Tang"],a:2,why:"The Qing conquered Mongolia, Tibet, Taiwan and Xinjiang.",kc:"cn"}],
  recap:[
  {st:"The sun never sets",q:"In 1580, which king came to rule both the Spanish and the Portuguese empires?",o:["Philip II","Charles V","Henry VIII","Louis XIV"],a:0,why:"Philip II of Spain claimed Portugal’s throne when its royal line died out.",kc:"es"},
  {st:"The Year of Africa",q:"How many African countries became independent in 1960?",o:["3","8","17","30"],a:2,why:"1960 is called the Year of Africa.",kc:"ng"},
  {st:"One country becomes fifteen",q:"Into how many countries did the Soviet Union break in 1991?",o:["5","10","15","20"],a:2,why:"All fifteen Soviet republics became independent countries.",kc:"ru"}]}
};

/* ======================================================================================================
   engine
   ====================================================================================================== */
function photoMerge(){try{if(typeof gfMergeExtra==="function")gfMergeExtra()}catch(e){}}
function regPins(s){try{window.PS_SQ_IMG=window.PS_SQ_IMG||{};(s.phPins||[]).forEach(q=>{const f=q&&q._f;if(!f)return;const i=libIdx(f);if(i>=0){q.img=i;PS_SQ_IMG[q.label]=i}})}catch(e){}}
function renameKeys(id,a,b){const cp=M=>{if(M&&M[id+"|"+a]!=null&&M[id+"|"+b]==null)M[id+"|"+b]=M[id+"|"+a]};
 try{if(typeof PS_PHOTO!=="undefined")cp(PS_PHOTO)}catch(e){}try{cp(window.PS_PHOTO_CAP)}catch(e){}}
function edit(id,s,o){
 for(const k in o){const v=o[k];
  if(k==="rename"){renameKeys(id,s.title,v);def(s,"title",v)}
  else if(k==="app"){for(const f in v){const cur=strip(s[f]);if(cur.indexOf(v[f])<0)def(s,f,(cur?cur+" ":"")+v[f])}}
  else if(k==="rm"){v.forEach(([f,t])=>{const cur=s[f];if(typeof cur==="string"&&cur.indexOf(t)>=0){let n=cur.replace(t,"");if(t==="held up about 400 others")n=cur.replace(t,"held up more than 350 others");def(s,f,n)}})}
  else if(k==="phPinsDrop"){const drop=new Set(v.map(strip));lock(s,"phPins",(s.phPins||[]).filter(q=>!drop.has(strip(q.label))))}
  else if(k==="phPins"){const have=new Set((s.phPins||[]).map(q=>strip(q.label)));lock(s,"phPins",(s.phPins||[]).concat(v.filter(q=>!have.has(strip(q.label)))))}
  else{def(s,k,v);if(k==="view")def(s,"_ff",1)}}}
function patchTour(id){const sp=SPEC[id];let t;try{t=PS_TOURS[id]}catch(e){return}
 if(!t||!Array.isArray(t.steps)||!t.steps.length||t.steps._rvPow)return;
 try{photoMerge();const steps=t.steps,by=new Map(steps.map(s=>[strip(s.title),s]));
  if(sp.hint)t.hint=sp.hint;
  /* carry photo pins from stops that are dropped or merged into the stop that keeps their story */
  (sp.movePh||[]).forEach(([from,to])=>{const a=by.get(from);if(!a)return;const b=by.get(to)||[...by.values()].find(s=>strip(s.title)===to);if(!b)return;
   const have=new Set((b.phPins||[]).map(q=>strip(q.label)));lock(b,"phPins",(b.phPins||[]).concat((a.phPins||[]).filter(q=>!have.has(strip(q.label))).map(q=>Object.assign({},q))))});
  (sp.move||[]).forEach(([from,label,to])=>{const a=by.get(from);if(!a)return;const q=(a.phPins||[]).find(x=>strip(x.label)===label);if(!q)return;sp._carry=sp._carry||{};sp._carry[to]=Object.assign({},q)});
  for(const title in (sp.edit||{})){const s=by.get(title);if(s)try{edit(id,s,sp.edit[title])}catch(e){console.error(e)}}
  (sp.merge||[]).forEach(([from,to])=>{const a=by.get(from),b=steps.find(s=>strip(s.title)===to);if(!a||!b)return;
   ["view","globe","lines","pins","iconPins"].forEach(k=>{if(a[k]!=null)def(b,k,JSON.parse(JSON.stringify(a[k])))});def(b,"_ff",1);if(sp.mergeView)def(b,"view",sp.mergeView);
   const have=new Set((b.phPins||[]).map(q=>strip(q.label)));lock(b,"phPins",(b.phPins||[]).concat((a.phPins||[]).filter(q=>!have.has(strip(q.label))).map(q=>Object.assign({},q))))});
  const now=new Map(steps.map(s=>[strip(s.title),s]));
  (sp.add||[]).forEach(n=>{const k=strip(n.title);if(now.has(k)&&k!=="Now explore")return;
   const s=Object.assign({},n,{phPins:undefined});
   /* the card covers the left part of the map: widen a new stop's view westwards so its subject sits in the open part */
   if(s.card==="left"&&Array.isArray(s.view)&&!s._padded){const v=s.view,w=v[2]-v[0];if(w<=100)s.view=[+(v[0]-w*.6).toFixed(2),v[1],v[2],v[3]];s._padded=1}if(s.more===null)delete s.more;delete s.phPins;
   let pp=(n.phPins||[]).map(q=>Object.assign({},q));if(sp._carry&&sp._carry[n.title])pp=[sp._carry[n.title]].concat(pp);
   lock(s,"phPins",pp);if(k==="Now explore"&&now.has(k))return;now.set(k,s)});
  const out=[];sp.order.forEach(ti=>{const s=now.get(strip(ti));if(s&&out.indexOf(s)<0)out.push(s)});
  if(out.length<sp.order.length*.7){console.warn("rvPow: too few stops matched for",id);return}
  steps.length=0;out.forEach(s=>steps.push(s));steps._rvPow=1;
  steps.forEach(regPins);
 }catch(e){console.error(e)}}
function cards(){try{if(typeof PS_PHOTO==="undefined")return;photoMerge();
 for(const id in SPEC){const t=PS_TOURS[id];if(!t||!t.steps)continue;
  const mine=new Set((SPEC[id].add||[]).map(n=>n.title).concat(Object.values(SPEC[id].edit||{}).map(o=>o.rename).filter(Boolean)));
  t.steps.forEach(s=>{const k=id+"|"+s.title;if(PS_PHOTO[k]!=null||!mine.has(s.title))return;
   for(const q of (s.phPins||[])){if(!q)continue;let i=q._f?libIdx(q._f):-1;if(i<0&&q.img!=null)i=q.img;if(i<0&&q._gfImg!=null)i=q._gfImg;if(i<0&&window.PS_SQ_IMG&&PS_SQ_IMG[q.label]!=null)i=PS_SQ_IMG[q.label];
    if(i>=0){PS_PHOTO[k]=i;break}}})}}catch(e){}}
function questions(){try{if(typeof TOURQ==="undefined")return;
 for(const id in Q){const c=Q[id];let T=TOURQ[id];if(!T){T=TOURQ[id]={mid:[],recap:[]}}if(T._rvPow)continue;T.mid=T.mid||[];T.recap=T.recap||[];
  if(c.mid&&!T.mid.length)c.mid.forEach(q=>T.mid.push(q));else if(c.mid)c.mid.forEach(q=>{if(!T.mid.some(x=>x.q===q.q))T.mid.push(q)});
  if(c.recap)c.recap.forEach(q=>{if(!T.recap.some(x=>x.q===q.q))T.recap.push(q)});
  (c.recapAdd||[]).forEach(q=>{if(!T.recap.some(x=>x.q===q.q))T.recap.push(q)});
  (c.midAdd||[]).forEach(q=>{if(!T.mid.some(x=>x.q===q.q))T.mid.push(q)});
  for(const w in (c.midReplace||{})){const i=T.mid.findIndex(x=>x.q===w);if(i>=0)T.mid[i]=Object.assign({},T.mid[i],c.midReplace[w])}
  for(const w in (c.recapReplace||{})){const i=T.recap.findIndex(x=>x.q===w);if(i>=0)T.recap[i]=Object.assign({},T.recap[i],c.recapReplace[w])}
  const fx=c.stFix||{};[T.mid,T.recap].forEach(L=>L.forEach(q=>{if(fx[q.st])q.st=fx[q.st];if(fx[q.at])q.at=fx[q.at]}));
  T._rvPow=1}}catch(e){console.error(e)}}
function run(){for(const id in SPEC)patchTour(id);cards();questions()}
window.gfRvPow={SPEC,run};
if(typeof psGo==="function"){const _g=psGo;psGo=function(i){try{if(typeof ps!=="undefined"&&ps&&SPEC[ps.tour]){patchTour(ps.tour);cards();const S0=(psSteps()||[])[i];if(S0)regPins(S0)}}catch(e){}return _g.apply(this,arguments)}}
[0,1500,5000,12000].forEach(ms=>setTimeout(run,ms));addEventListener("load",()=>setTimeout(run,800));
})();
