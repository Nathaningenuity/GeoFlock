/* GeoFlock: more "Name them all" lists, about half of them not lists of countries.
   - Country lists in four new sections (Animals & Nature, Records & Rankings, Culture & Customs, Fun & Quirky).
     Top-N lists show each answer's rank and value when found or revealed, with a short source line.
   - Lists of other things (islands, lakes, rivers, mountains, wonders, cities, buildings, states and provinces) get
     their own play screen: type the name, forgiving about accents, "Lake", "Mount", "Island", "River", "the" and plurals,
     with accepted other names (Borneo or Kalimantan); a small map puts a dot on each one found or revealed.
   Figures are rounded; the source of each ranking is given under its title. */
(function(){
if(typeof LIST_DATA==="undefined"||typeof renderListPlay!=="function")return;
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const C=(sec,id,t,d,codes,note,vals)=>{const a=codes.split(" ").filter(c=>COUNTRY_BY_CODE[c]);const L={sec,id,t,d,a,more:1};if(note)L.note=note;if(vals){L.v={};vals.split("|").forEach((v,i)=>{if(a[i])L.v[a[i]]=v.trim()});L.rk=1}return L};
/* items: "Name|other names;…|value|lon,lat|country code" one per line */
const I=(sec,id,t,d,unit,rk,note,rows)=>{const items=rows.trim().split("\n").map((r,i)=>{const[n,al,v,ll,cc]=r.trim().split("|");const p=(ll||"").split(",").map(Number);return{id:"i"+i,n,al:al?al.split(";"):[],v:v||"",ll:p.length===2&&isFinite(p[0])?p:null,cc:cc||""}});
 return{sec,id,t,d,unit,rk:!!rk,note,items,a:items.map(x=>x.id),more:1}};
const L=[];
/* ---------- Animals & Nature ---------- */
const AN="Animals & Nature";
L.push(C(AN,"an-tigers","Countries where wild tigers live",3,"in ru id np th bt my bd cn mm","Nine countries have survey-based estimates. Indonesia has no recent nationwide survey; 400\u2013600 is the usual estimate range. Myanmar still has a small population in the far north and south, but there is no reliable current number (about 22 were confirmed in the mid-2010s). Tigers are considered functionally extinct in Cambodia, Laos and Vietnam. The global total is about 5,500 (GTF 2023). Source: National surveys compiled by the Global Tiger Forum and WWF: India (NTCA/WII 2022), Russia (Amur tiger census 2021\u201322), Nepal (2022), Thailand (DNP/WWF 2024), Bhutan (2021\u201322 survey, published 2023), Malaysia (2022 national survey), Bangladesh (Forest Dept 2024), China (NE China Tiger & Leopard NP, 2024).","\u22483,682 (2022)|\u2248750 (2021\u201322)|\u2248400\u2013600 (Sumatra)|355 (2022)|\u2248179\u2013223 (2024)|131 (2021\u201322)|<150 (2022)|125 (2024)|\u224870 (2024)|"));
L.push(C(AN,"an-gorillas","Countries where wild gorillas live",3,"ao cm cf cg cd gq ga ng rw ug","Western, Cross River, eastern lowland and mountain gorillas together (IUCN Red List)."));
L.push(C(AN,"an-penguins","Countries where wild penguins breed",3,"ar cl au nz za na pe ec","On their own coasts and islands: not counting Antarctica or overseas territories like the Falklands."));
L.push(C(AN,"an-amazon","Countries with part of the Amazon rainforest",2,"br pe co ve ec bo gy sr","French Guiana, part of France, has some too."));
L.push(C(AN,"an-andes","Countries the Andes run through",2,"ve co ec pe bo cl ar"));
L.push(C(AN,"an-mekong","Countries the Mekong flows through or along",3,"cn mm la th kh vn"));
L.push(C(AN,"an-black","Countries on the Black Sea",2,"tr bg ro ua ru ge"));
L.push(C(AN,"an-red","Countries on the Red Sea",3,"eg sd er dj ye sa jo il","Counting the Gulf of Aqaba, Jordan’s and Israel’s short coasts."));
L.push(C("Position","p-brazil","Borders Brazil",2,"uy ar py bo pe co ve gy sr fr","Every South American country but Chile and Ecuador, and France through French Guiana."));
L.push(C("Position","p-germany","Borders Germany",2,"dk pl cz at ch fr lu be nl","Nine neighbours, more than any other European country except Russia."));
L.push(C("Position","p-drc","Borders DR Congo",3,"cg cf ss ug rw bi tz zm ao","Its border with Tanzania runs down the middle of Lake Tanganyika."));
L.push(C("Position","p-tanzania","Borders Tanzania",3,"ke ug rw bi cd zm mw mz","Its neighbours across Lakes Victoria, Tanganyika and Malawi count."));
L.push(C(AN,"an-baltic","Countries on the Baltic Sea",2,"se fi ru ee lv lt pl de dk"));
/* ---------- Records & Rankings ---------- */
const RR="Records & Rankings";
L.push(C(RR,"rr-unesco","The 10 countries with the most UNESCO World Heritage Sites",3,"it cn de fr es in mx gb ru ir","Counts include transboundary properties. Some Russian sources call Shulgan-Tash (2025) Russia's 34th site; UNESCO's per-State count gives 33. The July 2026 session has since added more sites (Italy now has 62). Source: UNESCO World Heritage Centre, World Heritage List statistics, after the 47th session (July 2025).","61 sites|60 sites|55 sites|54 sites|50 sites|44 sites|36 sites|35 sites|33 sites|29 sites"));
L.push(C(RR,"rr-coffee","The 10 biggest coffee growers",3,"br vn co id et ug in pe cf hn","9th and 10th are a near-tie: Central African Republic (324,923 t) and Honduras (324,015 t). The CAR figure is an FAO estimate. Guatemala (\u2248225,000 t) is 11th. Source: FAO, FAOSTAT Crops and livestock products, green coffee production, 2024.","\u22483.39 million t|\u22482.02 million t|\u2248840,000 t|\u2248808,000 t|\u2248576,000 t|\u2248402,000 t|\u2248363,000 t|\u2248359,000 t|\u2248325,000 t|\u2248324,000 t"));
L.push(C(RR,"rr-banana","The 10 biggest banana growers",4,"in cn id ec br ng ph ao tz gt","Bananas only (plantains are counted separately). Mexico (\u22482.67 million t) is 11th. Source: FAO, FAOSTAT Crops and livestock products, banana production, 2024.","\u224837.6 million t|\u224811.8 million t|\u22489.26 million t|\u22487.59 million t|\u22487.05 million t|\u22486.91 million t|\u22485.64 million t|\u22485.21 million t|\u22483.27 million t|\u22482.84 million t"));
L.push(C(RR,"rr-oilres","The 10 largest proven oil reserves",3,"ve sa ir iq ae kw ru ly us ng","OPEC leaves out Canada's oil sands (it lists only \u22485.1 billion bbl for Canada). Sources that include the oil sands put Canada at about 160\u2013170 billion bbl, which would rank 4th. Kazakhstan (30 billion bbl) is 11th. Source: OPEC, Annual Statistical Bulletin 2026, Table 3.1 (proven crude oil reserves at end of 2025).","\u2248303.7 billion bbl|\u2248267.2 billion bbl|\u2248208.6 billion bbl|\u2248140.0 billion bbl|\u2248120.0 billion bbl|\u2248101.5 billion bbl|\u224880.0 billion bbl|\u224848.4 billion bbl|\u224841.9 billion bbl|\u224837.0 billion bbl"));
L.push(C(RR,"rr-oilprod","The 10 biggest oil producers",3,"us sa ru ca cn ir iq br ae kw","Includes crude, condensate, NGL, biofuels and refinery gains. Iran (4.63) and Iraq (4.57) are almost tied. Mexico (\u22482.0) is 11th. Source: US EIA, International Energy Statistics, total petroleum and other liquids production, 2024.","\u224822.9 million b/d|\u224810.9 million b/d|\u224810.5 million b/d|\u22486.0 million b/d|\u22485.3 million b/d|\u22484.6 million b/d|\u22484.6 million b/d|\u22484.3 million b/d|\u22484.2 million b/d|\u22482.8 million b/d"));
L.push(C(RR,"rr-tourists","The 10 most visited countries",2,"fr es us it tr mx gb de jp gr","China has not reported 2024 arrivals, so it is left out. France's figure is the French government's estimate. Italy and T\u00fcrkiye are close: the May 2025 Barometer put T\u00fcrkiye 4th, but the revised database figure for Italy is higher. Greece (\u224836.0 million, national figure) and Japan (36.9 million) are close. Thailand (\u224835.5 million) is just outside the top 10. Source: UN Tourism, Statistics Database and World Tourism Barometer (May 2025): international overnight tourist arrivals, 2024.","\u2248100 million|\u224893.8 million|\u224872.4 million|\u224857.7 million|\u224856.7 million|\u224845.0 million|\u224838.2 million|\u224837.4 million|\u224836.9 million|\u224836 million"));
L.push(C(RR,"rr-paris","Paris 2024 Olympics medal table: top 10",3,"us cn jp au fr nl gb kr it de","Ranked by gold, then silver, then bronze. USA is ahead of China on silver (44 v 27). Italy and Germany both have 12 gold and 13 silver; Italy is ahead on bronze (15 v 8). Source: IOC, Paris 2024 official medal table.","40 gold|40 gold|20 gold|18 gold|16 gold|15 gold|14 gold|13 gold|12 gold|12 gold"));
L.push(C(RR,"rr-langs","The 10 countries with the most living languages",3,"pg id ng in cn mx cm us au br","Counts indigenous languages plus established non-indigenous ones. The DR Congo (211) is 11th. Figures change slightly with each Ethnologue edition. Source: SIL Global, Ethnologue (2026 edition), via Our World in Data.","843 languages|713 languages|530 languages|458 languages|308 languages|297 languages|282 languages|243 languages|227 languages|224 languages"));
L.push(C(RR,"rr-gdp","The 10 largest economies",2,"us cn de jp gb in fr ru it ca","Russia ($2.57tn) and Italy ($2.55tn) are close. Brazil ($2.28tn) is just behind Canada ($2.32tn). The IMF's 2026 projections put Brazil ahead of Canada. Source: IMF, World Economic Outlook database (October 2026), nominal GDP in current US$, 2025.","\u2248$30.9 trillion|\u2248$19.6 trillion|\u2248$5.1 trillion|\u2248$4.5 trillion|\u2248$4.0 trillion|\u2248$3.9 trillion|\u2248$3.4 trillion|\u2248$2.6 trillion|\u2248$2.6 trillion|\u2248$2.3 trillion"));
L.push(C(RR,"rr-rice","The 10 biggest rice growers",3,"in cn bd id vn th mm ph pk kh","Brazil (\u224810.7 million t) is 11th. Source: FAO, FAOSTAT Crops and livestock products, rice (paddy) production, 2024.","\u2248218 million t|\u2248208 million t|\u224860.6 million t|\u224853.1 million t|\u224843.5 million t|\u224833.6 million t|\u224827.7 million t|\u224819.1 million t|\u224814.6 million t|\u224814.2 million t"));
L.push(C(RR,"rr-wheat","The 10 biggest wheat growers",3,"cn in ru us ca au pk fr ua tr","Kazakhstan, Germany and Argentina (\u224818.5 million t each) follow. Source: FAO, FAOSTAT Crops and livestock products, wheat production, 2024.","\u2248140 million t|\u2248113 million t|\u224882.6 million t|\u224853.7 million t|\u224835.9 million t|\u224834.1 million t|\u224831.8 million t|\u224826.6 million t|\u224822.4 million t|\u224820.8 million t"));
L.push(C(RR,"rr-afpop","The 10 most populous countries in Africa",2,"ng et eg cd tz za ke sd ug dz","Sudan and Uganda are very close (51.66 v 51.38 million), and Uganda is growing faster. Angola (\u224839 million) is 11th. Source: UN DESA, World Population Prospects 2024, medium variant, 2025.","\u2248238 million|\u2248135 million|\u2248118 million|\u2248113 million|\u224870.5 million|\u224864.7 million|\u224857.5 million|\u224851.7 million|\u224851.4 million|\u224847.4 million"));
L.push(C(RR,"rr-afarea","The 10 largest countries in Africa",2,"dz cd sd ly td ne ao ml za et","Total area, including inland water. Mauritania (1.03 million km\u00b2) is 11th. Sudan's area excludes South Sudan, which became independent in 2011. Source: UN Statistics Division, Demographic Yearbook, Table 3 (surface area).","2.38 million km\u00b2|2.34 million km\u00b2|1.86 million km\u00b2|1.76 million km\u00b2|1.28 million km\u00b2|1.27 million km\u00b2|1.25 million km\u00b2|1.24 million km\u00b2|1.22 million km\u00b2|1.10 million km\u00b2"));
/* ---------- Culture & Customs ---------- */
const CC="Culture & Customs";
L.push(C(CC,"cc-left","Countries that drive on the left",4,"gb ie mt cy in pk bd lk np bt mv jp th my sg id bn tl au nz pg fj sb ws to ki tv nr za na bw zm zw mw mz tz ke ug ls sz mu sc jm bs bb tt gd lc vc ag dm kn gy sr","About a third of the world’s people drive on the left. Samoa switched to the left in 2009."));
L.push(C(CC,"cc-monarch","Countries with their own monarch",3,"gb es nl be lu dk no se li mc jp th kh my bn bt sa jo ma qa kw bh om sz ls to","Not counting the 14 other realms that share the British monarch, Andorra’s two co-princes, the Pope, or the UAE’s seven emirs, whose head of state is an elected president."));
L.push(C(CC,"cc-euro","Countries that use the euro",3,"at be bg hr cy ee fi fr de gr ie it lv lt lu mt nl pt sk si es ad mc sm va me xk","21 EU members (Bulgaria joined in 2026), four small states by agreement, and Montenegro and Kosovo on their own."));
L.push(C(CC,"cc-spanish","Spanish as an official language",2,"es mx gt hn sv ni cr pa cu do co ve ec pe bo cl ar py uy gq","Equatorial Guinea is the only one in Africa."));
L.push(C(CC,"cc-brics","Members of BRICS",3,"br ru in cn za eg et ir ae id","Full members in 2025. Indonesia joined in January 2025; Saudi Arabia was invited but has not confirmed."));
L.push(C(CC,"cc-wchosts","Countries that have hosted the men’s football World Cup",4,"uy it fr br ch se cl gb mx de ar es us kr jp za ru qa ca","Up to and including 2026. England hosted for the UK in 1966, and West Germany in 1974."));
L.push(C(CC,"cc-antarctic","Countries with a claim to part of Antarctica",3,"ar au cl fr nz no gb","The Antarctic Treaty of 1959 put all claims on hold."));
/* ---------- Fun & Quirky ---------- */
const FQ="Fun & Quirky";
L.push(C(FQ,"fq-person","Countries named after a person",4,"co bo ph mu sa mh sb sc","Not counting saints: Columbus, Bolívar, Philip II, Maurice of Nassau, the House of Saud, John Marshall, King Solomon and Jean Moreau de Séchelles."));
L.push(C(FQ,"fq-norivers","Countries with no permanent rivers",4,"sa ye om ae qa kw bh ly mt mc va mv to tv ki nr mh","Seasonal riverbeds (wadis) and small streams don’t count."));
L.push(C(FQ,"fq-cancer","Countries the Tropic of Cancer crosses",4,"mx bs mr ml dz ne ly eg sa ae om in bd mm cn tw","It also crosses Western Sahara."));
L.push(C(FQ,"fq-capricorn","Countries the Tropic of Capricorn crosses",3,"cl ar py br na bw za mz mg au"));
["B","C","M","S"].forEach(ch=>{const a=COUNTRIES.filter(c=>c.n.toUpperCase().startsWith(ch)).map(c=>c.c);if(a.length>=5)L.push({sec:FQ,id:"fq-start-"+ch.toLowerCase(),t:"Every country starting with "+ch,d:3,a,more:1,note:"As named in this atlas."})});
/* ---------- Islands & Water ---------- */
const IW="Islands & Water";
L.push(I(IW,"iw-islands","The 10 largest islands",3,"islands",1,"Australia counts as a continent, not an island.",`
Greenland|Kalaallit Nunaat|2,130,800 km²|-41,72|dk
New Guinea|Papua;Nueva Guinea|785,750 km²|141,-5.5|pg
Borneo|Kalimantan|743,330 km²|114,1|id
Madagascar||587,710 km²|46.7,-19|mg
Baffin Island|Baffin|507,450 km²|-71,68|ca
Sumatra|Sumatera|443,070 km²|101.5,-0.5|id
Honshu|Honshū|225,800 km²|138.5,36.5|jp
Victoria Island||217,290 km²|-110,71|ca
Great Britain|Britain|209,330 km²|-2,54|gb
Ellesmere Island|Ellesmere|196,240 km²|-80,80|ca`));
L.push(I(IW,"iw-lakes","The 10 largest lakes",3,"lakes",1,"By surface area. The Caspian is called a sea, but it is a lake.",`
Caspian Sea|Caspian|371,000 km²|50.5,41.5|kz
Lake Superior|Superior|82,100 km²|-87.5,47.7|us
Lake Victoria|Victoria;Victoria Nyanza|68,870 km²|33,-1|ug
Lake Huron|Huron|59,600 km²|-82.4,44.8|ca
Lake Michigan|Michigan|58,000 km²|-87,44|us
Lake Tanganyika|Tanganyika|32,600 km²|29.6,-6|tz
Lake Baikal|Baikal|31,500 km²|108,53.5|ru
Great Bear Lake|Great Bear|31,000 km²|-121,66|ca
Lake Malawi|Malawi;Lake Nyasa;Nyasa|29,500 km²|34.5,-12|mw
Great Slave Lake|Great Slave|27,200 km²|-114,61.7|ca`));
L.push(I(IW,"iw-rivers","The 10 longest rivers",3,"rivers",1,"Lengths are approximate; the Nile and the Amazon swap places depending on where their sources are measured.",`
Nile|Nile River|≈6,650 km|31,24|eg
Amazon|Amazonas|≈6,400 km|-55,-2.5|br
Yangtze|Chang Jiang;Yangzi|≈6,300 km|112,30|cn
Mississippi–Missouri|Mississippi;Missouri;Mississippi Missouri|≈6,275 km|-90.5,35|us
Yenisei|Yenisey|≈5,540 km|88,62|ru
Yellow River|Huang He;Huanghe|≈5,460 km|110,37|cn
Ob–Irtysh|Ob;Irtysh;Ob Irtysh|≈5,410 km|67,62|ru
Paraná|Parana;Río de la Plata;Rio de la Plata|≈4,880 km|-59,-30|ar
Congo|Zaire|≈4,700 km|19,0|cd
Amur|Heilong Jiang;Heilongjiang|≈4,440 km|130,49|ru`));
L.push(I(IW,"iw-eurivers","The 10 longest rivers in Europe",3,"rivers",1,"Each river is measured along its named main stem, and tributaries count, as in most reference lists (Kama, Oka and Belaya are Volga-system tributaries). The Ural counts in full, although only its right bank is in Europe. Coordinates are the mouth for rivers that reach the sea and the midpoint for tributaries. If tributaries are left out, the Rhine (1,233 km), Elbe (1,094 km) and Vistula (1,047 km) come in at 8th to 10th. Measured to its longest headstream, the Northern Dvina (Vychegda branch, 1,803 km) would also rank. The Dniester is sometimes given as 1,352 km. Source: Russian State Water Register (Volga, Ural, Don, Pechora, Kama, Oka, Belaya); ICPDR (Danube); standard reference lengths (Dnieper, Dniester).",`
Volga|Wolga|3,530 km|47.9,46.2|ru
Danube|Donau;Duna;Dunărea;Dunav;Dunaj|2,857 km|29.65,45.15|ro
Ural|Ural River;Zhaiyq;Jayiq|2,428 km|51.75,46.9|ru
Dnieper|Dnipro;Dnepr;Dniapro|2,201 km|32.2,46.55|ua
Don|Don River|1,870 km|39.25,47.1|ru
Pechora|Pechora River|1,809 km|53.9,68.2|ru
Kama|Kama River|1,805 km|56.25,58.0|ru
Oka|Oka River|1,500 km|43.98,56.33|ru
Belaya|Agidel;Aghidhel;Belaya River|1,430 km|55.95,54.75|ru
Dniester|Dnister;Nistru;Dnestr|1,362 km|30.3,46.15|md`));
L.push(I(IW,"iw-afrivers","The 10 longest rivers in Africa",2,"rivers",1,"Sources differ for several rivers: Niger 4,180\u20134,200 km, Zambezi 2,574\u20132,740 km, Orange 2,200\u20132,432 km (with the Senqu headwaters), Limpopo 1,750\u20131,800 km. Senegal is measured with its Bafing headstream (1,641 km) and the Shebelle as the Jubba\u2013Shebelle system (2,064 km). Okavango, Volta and Blue Nile (each \u22481,600 km) are just outside. Coordinates are the mouth (the Congo confluence for the Ubangi and Kasai). Order within the list does not affect play. Source: Standard reference lengths (Britannica / Wikipedia 'List of river systems by length').",`
Nile|White Nile;Nil;Bahr an-Nil|6,650 km|31.0,31.45|eg
Congo|Zaire;Lualaba;Kongo|4,700 km|12.35,-6.05|cd
Niger|Joliba;Isa Ber;Kwara|4,180 km|6.1,4.3|ng
Zambezi|Zambesi;Zambeze|2,574 km|36.3,-18.85|mz
Ubangi|Oubangui;Ubangi–Uele;Ubangi-Uele|2,270 km|17.7,-0.6|cd
Orange|Gariep;Senqu;Orange River|2,200 km|16.45,-28.63|za
Kasai|Kassai;Cassai;Kwa|2,153 km|16.2,-3.2|cd
Shebelle|Shabelle;Jubba–Shebelle;Shabeelle|2,064 km|42.55,-0.25|so
Limpopo|Vhembe;Limpopo River|1,750 km|33.55,-25.2|mz
Senegal|Sénégal;Senegal River;Bafing|1,641 km|-16.5,15.85|sn`));
L.push(I(IW,"iw-afrlakes","The African Great Lakes",4,"lakes",0,"The big lakes of the Rift Valley region.",`
Lake Victoria|Victoria||33,-1|ug
Lake Tanganyika|Tanganyika||29.6,-6|tz
Lake Malawi|Malawi;Lake Nyasa;Nyasa||34.5,-12|mw
Lake Turkana|Turkana;Lake Rudolf;Rudolf||36.1,3.6|ke
Lake Albert|Albert||30.9,1.7|ug
Lake Kivu|Kivu||29.2,-2|rw
Lake Edward|Edward||29.6,-0.35|cd`));
L.push(I(IW,"iw-eulakes","The 10 largest lakes in Europe",4,"lakes",1,"Excludes the Caspian Sea, which is treated as a sea, and reservoirs such as Kuybyshev and Rybinsk. Onega is often given as 9,720 km\u00b2. Vygozero was enlarged by a dam (766 km\u00b2 before) and the IJsselmeer is a dammed former sea inlet. If both are left out, P\u00e4ij\u00e4nne (1,081 km\u00b2) and Inari (1,040 km\u00b2) take 9th and 10th. Ilmen (982 km\u00b2 on average) varies greatly with the seasons. Source: Wikipedia 'List of largest lakes of Europe' (average surface areas from national sources).",`
Ladoga|Lake Ladoga;Ladozhskoye;Laatokka|17,700 km²|31.5,60.85|ru
Onega|Lake Onega;Onezhskoye;Ääninen|9,894 km²|35.4,61.7|ru
Vänern|Vanern;Lake Vänern|5,655 km²|13.3,58.9|se
Saimaa|Lake Saimaa|4,377 km²|28.3,61.3|fi
Peipus|Lake Peipus;Peipsi;Chudskoye;Peipus–Pskov|3,555 km²|27.5,58.7|ee
Vättern|Vattern;Lake Vättern|1,893 km²|14.55,58.3|se
Beloye|Lake Beloye;Beloye Ozero;White Lake|1,290 km²|37.65,60.18|ru
Vygozero|Lake Vygozero;Uikujärvi|1,250 km²|34.5,63.6|ru
Mälaren|Malaren;Lake Mälaren|1,140 km²|17.0,59.45|se
IJsselmeer|Ijsselmeer;Lake IJssel|1,100 km²|5.35,52.8|nl`));
L.push(I(IW,"iw-choke","The world’s main oil shipping chokepoints",5,"chokepoints",0,"Source: US Energy Information Administration.",`
Strait of Hormuz|Hormuz||56.4,26.6|ir
Strait of Malacca|Malacca||101,2.5|my
Suez Canal|Suez||32.35,30.5|eg
Bab el-Mandeb|Bab al-Mandab;Bab-el-Mandeb;Mandeb||43.4,12.6|ye
Danish Straits|Danish strait;Oresund;Øresund;Great Belt;Kattegat||11,55.5|dk
Turkish Straits|Bosphorus;Bosporus;Dardanelles;Turkish strait||29,41.1|tr
Panama Canal|Panama||-79.7,9.1|pa
Cape of Good Hope|Good Hope||18.47,-34.36|za`));
L.push(I(IW,"iw-medisl","The 10 largest islands in the Mediterranean",3,"islands",1,"Sources give slightly different areas for the main island versus the island with its islets (Sicily 25,460\u201325,830 km\u00b2, Crete 8,260\u20138,450 km\u00b2), but the ranking does not change. Kefalonia (781 km\u00b2) is 11th. Source: Wikipedia 'List of islands in the Mediterranean' (areas from national statistics); set and order match WorldAtlas.",`
Sicily|Sicilia|≈25,800 km²|14.1,37.6|it
Sardinia|Sardegna|≈24,100 km²|9.0,40.1|it
Cyprus|Kypros;Kıbrıs|9,251 km²|33.2,35.1|cy
Corsica|Corse|≈8,680 km²|9.1,42.15|fr
Crete|Kriti;Candia|≈8,310 km²|24.9,35.25|gr
Euboea|Evia;Evvoia|≈3,660 km²|23.75,38.55|gr
Mallorca|Majorca|≈3,640 km²|2.95,39.6|es
Lesbos|Lesvos;Mytilene|≈1,630 km²|26.25,39.2|gr
Rhodes|Rodos|≈1,400 km²|28.0,36.2|gr
Chios|Khios;Hios|≈842 km²|26.0,38.4|gr`));
L.push(I(IW,"iw-canary","The seven main Canary Islands",3,"islands",0,"",`
Tenerife|||-16.6,28.3|es
Gran Canaria|||-15.6,27.95|es
Lanzarote|||-13.6,29.05|es
Fuerteventura|||-14.0,28.4|es
La Palma|Palma||-17.85,28.68|es
La Gomera|Gomera||-17.23,28.1|es
El Hierro|Hierro||-18.0,27.73|es`));
L.push(I(IW,"iw-hawaii","The eight main Hawaiian Islands",4,"islands",0,"",`
Hawaiʻi|Hawaii;Big Island||-155.5,19.6|us
Maui|||-156.3,20.8|us
Oʻahu|Oahu||-158,21.47|us
Kauaʻi|Kauai||-159.5,22.05|us
Molokaʻi|Molokai||-157,21.13|us
Lānaʻi|Lanai||-156.93,20.83|us
Niʻihau|Niihau||-160.15,21.9|us
Kahoʻolawe|Kahoolawe||-156.6,20.55|us`));
/* ---------- Mountains & Wonders ---------- */
const MW="Mountains & Wonders";
L.push(I(MW,"mw-peaks","The 10 highest mountains",4,"mountains",1,"All ten are in the Himalayas or the Karakoram.",`
Mount Everest|Everest;Sagarmatha;Chomolungma;Qomolangma|8,849 m|86.925,27.988|np
K2|Chhogori;Godwin-Austen|8,611 m|76.51,35.88|pk
Kangchenjunga|Kanchenjunga;Kangchenjonga|8,586 m|88.147,27.703|np
Lhotse||8,516 m|86.933,27.962|np
Makalu||8,485 m|87.089,27.889|np
Cho Oyu||8,188 m|86.661,28.094|np
Dhaulagiri||8,167 m|83.493,28.697|np
Manaslu||8,163 m|84.559,28.55|np
Nanga Parbat||8,126 m|74.589,35.237|pk
Annapurna||8,091 m|83.82,28.596|np`));
L.push(I(MW,"mw-summits","The Seven Summits",3,"mountains",0,"The highest peak of each continent; Oceania has two versions, so both count.",`
Mount Everest|Everest;Sagarmatha;Chomolungma|Asia, 8,849 m|86.925,27.988|np
Aconcagua||South America, ≈6,960 m|-70.01,-32.65|ar
Denali|Mount McKinley;McKinley|North America, 6,190 m|-151,63.07|us
Kilimanjaro|Kibo|Africa, 5,895 m|37.35,-3.07|tz
Mount Elbrus|Elbrus|Europe, 5,642 m|42.44,43.35|ru
Vinson Massif|Mount Vinson;Vinson|Antarctica, 4,892 m|-85.62,-78.53|
Puncak Jaya|Carstensz Pyramid;Carstensz|Oceania, ≈4,880 m|137.16,-4.08|id
Mount Kosciuszko|Kosciuszko;Kosciusko|Australia, 2,228 m|148.26,-36.46|au`));
L.push(I(MW,"mw-africa","The 10 highest mountains in Africa",3,"mountains",1,"Only independent mountains count: the summit must have at least 1,500 m of topographic prominence (an ultra-prominent peak). This counts Kilimanjaro once (Kibo/Uhuru; Mawenzi, 5,148 m, is a subsidiary peak) and the Rwenzori once (Mount Stanley; Speke, Baker, Emin and Gessi are left out). Next are Bada (4,195 m, Ethiopia), Toubkal (4,167 m, Morocco) and Mount Cameroon (4,040 m). If the Rwenzori peaks with more than 500 m of prominence counted separately, Speke (4,890 m) and Baker (4,844 m) would enter. Source: Wikipedia 'List of highest mountain peaks of Africa' (heights and prominences from national surveys / Peakbagger).",`
Kilimanjaro|Kibo;Uhuru Peak;Mount Kilimanjaro|5,895 m|37.3525,-3.0758|tz
Mount Kenya|Batian;Kirinyaga|5,199 m|37.3083,-0.1519|ke
Mount Stanley|Margherita Peak;Ngaliema;Rwenzori|5,109 m|29.8725,0.3856|cd
Mount Meru|Meru;Socialist Peak|4,566 m|36.75,-3.2442|tz
Ras Dashen|Ras Dejen;Ras Dashan|4,550 m|38.3725,13.2367|et
Karisimbi|Mount Karisimbi|4,507 m|29.4503,-1.5061|rw
Tullu Demtu|Tullu Dimtu;Bale Mountains|4,377 m|39.8192,6.8267|et
Mount Elgon|Elgon;Wagagai;Masaba|4,321 m|34.5264,1.1183|ug
Amba Farit|Kollo Massif|4,270 m|39.1044,10.9506|et
Abune Yosef|Abuna Yosef;Guliba Amba|4,260 m|39.1836,12.1411|et`));
L.push(I(MW,"mw-alps","The 10 highest mountains in the Alps",4,"mountains",1,"The rule: a summit from the UIAA 4000ers list with at least 300 m of topographic prominence. This leaves out subsidiary tops such as Nordend, Zumsteinspitze, Signalkuppe, Mont Blanc de Courmayeur, T\u00e4schhorn (213 m) and Mont Maudit (162 m). Mont Blanc's ice-cap summit changes height (4,805.6 m in the 2023 survey; often quoted as 4,808\u20134,810 m). Other sources round some heights differently (Dom 4,546, Lyskamm 4,532, Weisshorn 4,505, Grand Combin 4,309). Alphubel (4,206 m, 359 m prominence) is 11th; Grandes Jorasses (4,208 m) would be 11th if Alphubel were left out. Source: UIAA list of Alpine 4000ers (1994), with heights from Swisstopo/IGN and prominence from Peakbagger (via Wikipedia 'List of Alpine four-thousanders').",`
Mont Blanc|Monte Bianco|4,806 m|6.8652,45.8326|fr
Monte Rosa|Dufourspitze;Punta Dufour|4,634 m|7.8670,45.9369|ch
Dom|Dom (Mischabel)|4,545 m|7.8589,46.0939|ch
Liskamm|Lyskamm;Lyskamm East|4,527 m|7.8357,45.9224|ch
Weisshorn|Weißhorn|4,506 m|7.7161,46.1014|ch
Matterhorn|Cervino;Cervin|4,478 m|7.6586,45.9763|ch
Dent Blanche|Dent Blanche (Valais)|4,357 m|7.6119,46.0342|ch
Grand Combin|Combin de Grafeneire|4,314 m|7.2994,45.9375|ch
Finsteraarhorn|Finsteraar Horn|4,274 m|8.1261,46.5372|ch
Zinalrothorn|Rothorn|4,221 m|7.6903,46.0650|ch`));
L.push(I(MW,"mw-deserts","The 10 largest deserts",3,"deserts",1,"Polar deserts are counted (Antarctica and the Arctic), so the Sahara is 3rd and the largest hot desert. The Arctic Desert covers land in several countries; its pin is placed on Greenland. The Australian deserts are counted together. Their combined area varies a lot between sources (1.37 million km\u00b2 here; up to 2.7 million km\u00b2 elsewhere, which would put it 4th). Arabian figures range from 2.33 to 2.6 million km\u00b2. Chihuahuan (\u2248450,000 km\u00b2) is 11th. Without polar deserts, Chihuahuan and Karakum (\u2248350,000 km\u00b2) would complete the top 10. Source: Wikipedia 'List of deserts by area' (2025), compiled from WWF ecoregions / Britannica.",`
Antarctic Desert|Antarctica|14.2 million km²|45.0,-82.0|aq
Arctic Desert|Arctic|13.9 million km²|-42.0,75.0|gl
Sahara|Sahara Desert;Great Desert|9.2 million km²|13.0,23.0|dz
Arabian Desert|Arabian;Rub' al Khali|2.33 million km²|47.0,23.0|sa
Great Australian Desert|Australian Desert;Great Victoria;Great Sandy;Gibson;Simpson|1.37 million km²|128.0,-25.0|au
Gobi|Gobi Desert|1.30 million km²|105.0,43.0|mn
Kalahari|Kalahari Desert|900,000 km²|22.0,-23.0|bw
Patagonian Desert|Patagonian;Patagonia Desert|673,000 km²|-69.0,-45.0|ar
Syrian Desert|Badiat al-Sham;Syrian|500,000 km²|39.0,33.0|sy
Great Basin Desert|Great Basin|492,000 km²|-117.0,40.0|us`));
L.push(I(MW,"mw-decade","The 16 Decade Volcanoes",5,"volcanoes",0,"Picked by volcanologists (IAVCEI) in the 1990s for close study, because they are both active and close to people.",`
Avachinsky–Koryaksky|Avachinsky;Koryaksky;Avacha||158.8,53.3|ru
Nevado de Colima|Colima;Volcan de Colima||-103.6,19.5|mx
Mount Etna|Etna||15,37.75|it
Galeras|||-77.36,1.22|co
Mauna Loa|||-155.6,19.47|us
Merapi|Mount Merapi||110.44,-7.54|id
Nyiragongo|Mount Nyiragongo||29.25,-1.52|cd
Mount Rainier|Rainier;Tahoma||-121.76,46.85|us
Sakurajima|||130.66,31.58|jp
Santa María|Santa Maria;Santiaguito||-91.55,14.76|gt
Santorini|Thera;Thira||25.4,36.4|gr
Taal|||120.99,14.0|ph
Teide|Mount Teide;Pico del Teide||-16.64,28.27|es
Ulawun|||151.33,-5.05|pg
Mount Unzen|Unzen;Unzendake||130.3,32.76|jp
Vesuvius|Mount Vesuvius;Vesuvio||14.43,40.82|it`));
L.push(I(MW,"mw-new7","The New Seven Wonders of the World",2,"wonders",0,"Chosen in a worldwide public vote in 2007.",`
Great Wall of China|Great Wall||117.23,40.68|cn
Petra|||35.44,30.33|jo
Christ the Redeemer|Cristo Redentor;Christ the Redeemer statue||-43.21,-22.95|br
Machu Picchu|||-72.545,-13.163|pe
Chichén Itzá|Chichen Itza||-88.57,20.68|mx
Colosseum|Coliseum;Colosseo;Roman Colosseum||12.49,41.89|it
Taj Mahal|||78.04,27.175|in`));
L.push(I(MW,"mw-ancient","The Seven Wonders of the Ancient World",3,"wonders",0,"Only the Great Pyramid still stands.",`
Great Pyramid of Giza|Great Pyramid;Pyramids;Pyramid of Giza;Pyramids of Giza;Giza||31.13,29.98|eg
Hanging Gardens of Babylon|Hanging Gardens;Babylon||44.42,32.54|iq
Statue of Zeus at Olympia|Statue of Zeus;Zeus||21.63,37.64|gr
Temple of Artemis at Ephesus|Temple of Artemis;Artemis;Ephesus||27.36,37.95|tr
Mausoleum at Halicarnassus|Mausoleum;Halicarnassus;Mausoleum of Halicarnassus||27.42,37.04|tr
Colossus of Rhodes|Colossus;Rhodes||28.23,36.45|gr
Lighthouse of Alexandria|Pharos;Pharos of Alexandria;Lighthouse||29.88,31.21|eg`));
L.push(I(MW,"mw-nature7","The New Seven Wonders of Nature",4,"wonders",0,"Chosen in a public vote announced in 2011.",`
Amazon rainforest|Amazon||-62,-4|br
Ha Long Bay|Halong Bay;Ha Long||107.1,20.9|vn
Iguazu Falls|Iguaçu Falls;Iguazu;Iguassu||-54.44,-25.69|ar
Jeju Island|Jeju;Jejudo||126.55,33.38|kr
Komodo National Park|Komodo;Komodo Island||119.5,-8.55|id
Puerto Princesa Underground River|Puerto Princesa;Underground River;Puerto Princesa Subterranean River||118.93,10.19|ph
Table Mountain|||18.40,-33.96|za`));
/* ---------- Cities & Buildings ---------- */
const CB="Cities & Buildings";
L.push(I(CB,"cb-towers","The 10 tallest buildings in the world",4,"buildings",1,"Height includes spires but not antennas. The two CTF Finance Centres share 8th place (530 m). Taipei 101 (508 m) is 11th. Jeddah Tower is still under construction. Source: CTBUH (now the Council on Vertical Urbanism), The Skyscraper Center: tallest completed buildings by height to architectural top, 2026.",`
Burj Khalifa|Burj Dubai|828 m|55.2744,25.1972|ae
Merdeka 118|Menara Merdeka Maybank;Merdeka Tower|679 m|101.7003,3.1417|my
Shanghai Tower|Shanghai Zhongxin Dasha|632 m|121.5055,31.2335|cn
Makkah Royal Clock Tower|Abraj Al-Bait;Mecca Clock Tower|601 m|39.8262,21.4187|sa
Ping An Finance Center|Ping An International Finance Centre;Ping An Tower|599 m|114.0505,22.5364|cn
Lotte World Tower|Lotte Tower|555 m|127.1025,37.5125|kr
One World Trade Center|1 WTC;Freedom Tower|541 m|-74.0134,40.7127|us
Guangzhou CTF Finance Centre|Chow Tai Fook Centre;Guangzhou CTF|530 m|113.3212,23.1204|cn
Tianjin CTF Finance Centre|Tianjin Chow Tai Fook Binhai Center;Tianjin CTF|530 m|117.6982,39.0213|cn
CITIC Tower|China Zun;Beijing CITIC Tower|528 m|116.4626,39.9134|cn`));
L.push(I(CB,"cb-high","Capitals higher than 2,000 m",4,"capitals",0,"Elevations rounded. La Paz is Bolivia’s seat of government, Sucre its constitutional capital.",`
La Paz||≈3,640 m, Bolivia|-68.15,-16.5|bo
Quito||≈2,850 m, Ecuador|-78.51,-0.22|ec
Sucre||≈2,810 m, Bolivia|-65.26,-19.04|bo
Bogotá|Bogota|≈2,640 m, Colombia|-74.07,4.71|co
Addis Ababa|Addis Abeba;Addis|≈2,355 m, Ethiopia|38.75,9.03|et
Thimphu||≈2,330 m, Bhutan|89.64,27.47|bt
Asmara|Asmera|≈2,325 m, Eritrea|38.93,15.33|er
Sanaa|Sana'a;Sana|≈2,250 m, Yemen|44.2,15.35|ye
Mexico City|Ciudad de Mexico;CDMX;Mexico|≈2,240 m, Mexico|-99.13,19.43|mx`));
L.push(I(CB,"cb-people","Capitals named after a person",4,"capitals",0,"Not counting saints.",`
Washington, D.C.|Washington;Washington DC|George Washington|-77.04,38.9|us
Monrovia||James Monroe|-10.8,6.3|lr
Georgetown||King George III|-58.16,6.8|gy
Port Louis||King Louis XV|57.5,-20.16|mu
Wellington||the Duke of Wellington|174.78,-41.29|nz
Brazzaville||Pierre Savorgnan de Brazza|15.28,-4.27|cg
Victoria||Queen Victoria|55.45,-4.62|sc
Pretoria||Andries Pretorius|28.19,-25.75|za
Port Moresby|Moresby|Admiral Fairfax Moresby|147.18,-9.44|pg
Castries||the Marquis de Castries|-60.99,14.01|lc
Valletta|Valetta|Jean de Valette|14.51,35.9|mt
Sucre||Antonio José de Sucre|-65.26,-19.04|bo`));
L.push(I(CB,"cb-olympic2","European cities that have hosted the Summer Olympics",3,"cities",0,"Up to 2024. London and Paris have each hosted three times, Athens twice.",`
Athens|Athina|1896, 2004|23.73,37.98|gr
Paris||1900, 1924, 2024|2.35,48.86|fr
London||1908, 1948, 2012|-0.13,51.5|gb
Stockholm||1912|18.07,59.33|se
Antwerp|Antwerpen;Anvers|1920|4.4,51.22|be
Amsterdam||1928|4.9,52.37|nl
Berlin||1936|13.4,52.52|de
Helsinki|Helsingfors|1952|24.94,60.17|fi
Rome|Roma|1960|12.5,41.9|it
Munich|München;Muenchen|1972|11.58,48.14|de
Moscow|Moskva|1980|37.62,55.75|ru
Barcelona||1992|2.17,41.39|es`));
L.push(I(CB,"cb-olyworld","Cities outside Europe that have hosted the Summer Olympics",3,"cities",0,"Up to 2024; Los Angeles hosts again in 2028 and Brisbane in 2032.",`
St. Louis|Saint Louis;St Louis|1904|-90.2,38.63|us
Los Angeles|LA|1932, 1984|-118.24,34.05|us
Melbourne||1956|144.96,-37.81|au
Tokyo||1964, 2020|139.69,35.69|jp
Mexico City|Ciudad de México;Mexico|1968|-99.13,19.43|mx
Montreal|Montréal|1976|-73.57,45.5|ca
Seoul||1988|126.98,37.57|kr
Atlanta||1996|-84.39,33.75|us
Sydney||2000|151.21,-33.87|au
Beijing|Peking|2008|116.4,39.9|cn
Rio de Janeiro|Rio|2016|-43.2,-22.91|br`));
/* ---------- States & Provinces ---------- */
const SP="States & Provinces";
L.push(I(SP,"sp-uscanada","US states that border Canada",3,"states",0,"Counting the borders across the Great Lakes.",`
Alaska|||-150,64|us
Washington|||-120.5,47.4|us
Idaho|||-114.6,44.4|us
Montana|||-109.6,47|us
North Dakota|||-100.5,47.5|us
Minnesota|||-94.3,46.3|us
Michigan|||-85,44.3|us
Ohio|||-82.8,40.3|us
Pennsylvania|||-77.6,40.9|us
New York|||-75.5,43|us
Vermont|||-72.7,44|us
New Hampshire|||-71.6,43.7|us
Maine|||-69.2,45.4|us`));
L.push(I(SP,"sp-13","The 13 original US states",3,"states",0,"The colonies that declared independence in 1776.",`
Delaware|||-75.5,39|us
Pennsylvania|||-77.6,40.9|us
New Jersey|||-74.7,40.1|us
Georgia|||-83.4,32.7|us
Connecticut|||-72.7,41.6|us
Massachusetts|||-71.8,42.3|us
Maryland|||-76.8,39|us
South Carolina|||-80.9,33.9|us
New Hampshire|||-71.6,43.7|us
Virginia|||-78.8,37.5|us
New York|||-75.5,43|us
North Carolina|||-79.4,35.5|us
Rhode Island|||-71.5,41.7|us`));
L.push(I(SP,"sp-uslarge","The 10 largest US states",2,"states",1,"By total area. Michigan (250,487 km\u00b2) is 11th; most of its area is water in the Great Lakes, so by land area alone it ranks 22nd. Source: US Census Bureau, State Area Measurements (2010 Census), total area (land + water).",`
Alaska|AK|1,723,337 km²|-152.0,64.0|us
Texas|TX|695,662 km²|-99.3,31.5|us
California|CA|423,967 km²|-119.5,37.2|us
Montana|MT|380,831 km²|-109.6,47.0|us
New Mexico|NM|314,917 km²|-106.1,34.4|us
Arizona|AZ|295,234 km²|-111.7,34.3|us
Nevada|NV|286,380 km²|-116.6,39.3|us
Colorado|CO|269,601 km²|-105.55,39.0|us
Oregon|OR|254,799 km²|-120.55,43.9|us
Wyoming|WY|253,335 km²|-107.55,43.0|us`));
L.push(I(SP,"sp-uspop","The 10 most populous US states",2,"states",1,"The Vintage 2025 estimates (1 July 2025) have the same ten states in the same order (e.g. California 39.36 million, Texas 31.71 million). New Jersey is 11th. Source: US Census Bureau, Vintage 2024 population estimates (1 July 2024).",`
California|CA|39,431,263|-119.5,37.2|us
Texas|TX|31,290,831|-99.3,31.5|us
Florida|FL|23,372,215|-81.7,28.1|us
New York|NY|19,867,248|-75.5,42.9|us
Pennsylvania|PA|13,078,751|-77.6,40.9|us
Illinois|IL|12,710,158|-89.2,40.0|us
Ohio|OH|11,883,304|-82.8,40.3|us
Georgia|GA|11,180,878|-83.4,32.7|us
North Carolina|NC|11,046,024|-79.4,35.5|us
Michigan|MI|10,140,459|-84.7,44.3|us`));
L.push(I(SP,"sp-canada","Canada’s provinces and territories",2,"provinces and territories",0,"Ten provinces and three territories.",`
Ontario|||-85,50|ca
Quebec|Québec||-72,52|ca
British Columbia|BC||-125,54|ca
Alberta|||-115,55|ca
Manitoba|||-98,55|ca
Saskatchewan|||-106,54|ca
Nova Scotia|||-63,45|ca
New Brunswick|||-66.4,46.5|ca
Newfoundland and Labrador|Newfoundland;Labrador;Newfoundland & Labrador||-60,53|ca
Prince Edward Island|PEI||-63.3,46.4|ca
Yukon|||-135,64|ca
Northwest Territories|NWT;North West Territories||-120,64|ca
Nunavut|||-95,66|ca`));
L.push(I(SP,"sp-australia","Australia’s states and territories",2,"states and territories",0,"Six states and two mainland territories.",`
New South Wales|NSW||147,-32.5|au
Victoria|||144.5,-37|au
Queensland|||145,-22|au
Western Australia|WA||122,-26|au
South Australia|SA||135,-30|au
Tasmania|||146.6,-42|au
Northern Territory|NT||133,-19.5|au
Australian Capital Territory|ACT||149.1,-35.5|au`));
L.push(I(SP,"sp-germany","Germany’s 16 states",4,"states",0,"Berlin, Hamburg and Bremen are city-states.",`
Baden-Württemberg|Baden-Wurttemberg;Baden Wuerttemberg||9,48.6|de
Bavaria|Bayern||11.5,48.9|de
Berlin|||13.4,52.5|de
Brandenburg|||13,52.4|de
Bremen|||8.8,53.1|de
Hamburg|||10,53.55|de
Hesse|Hessen||9,50.6|de
Lower Saxony|Niedersachsen||9.5,52.7|de
Mecklenburg-Vorpommern|Mecklenburg-Western Pomerania;Mecklenburg||12.5,53.8|de
North Rhine-Westphalia|Nordrhein-Westfalen;NRW||7.5,51.5|de
Rhineland-Palatinate|Rheinland-Pfalz||7.4,49.9|de
Saarland|Saar||6.9,49.4|de
Saxony|Sachsen||13.3,51|de
Saxony-Anhalt|Sachsen-Anhalt||11.7,52|de
Schleswig-Holstein|||9.8,54.2|de
Thuringia|Thüringen;Thuringen||11,50.9|de`));

L.push(C("Population","pop-dense","The 10 most densely populated countries",3,"mc sg bh mt mv bd bb mu rw nr","Sovereign UN member states only, with Monaco and Singapore included. Not counted: Macao and Hong Kong (Chinese SARs), Gibraltar and other territories, Palestine (\u2248878 /km\u00b2, UN observer state) and Vatican City (\u22482,000 /km\u00b2, not in World Bank data). Nauru (569) and Lebanon (568) are almost tied for 10th. Source: World Bank, World Development Indicators, population density (EN.POP.DNST), 2024.","\u224818,500 /km\u00b2|\u22488,330 /km\u00b2|\u22481,990 /km\u00b2|\u22481,810 /km\u00b2|\u22481,770 /km\u00b2|\u22481,330 /km\u00b2|\u2248655 /km\u00b2|\u2248623 /km\u00b2|\u2248600 /km\u00b2|\u2248569 /km\u00b2"));
/* new lists are added; a list with the id of an older one replaces it (the top 10s that were shorter) */
const before=LIST_DATA.length;L.forEach(x=>{const i=LIST_DATA.findIndex(y=>y.id===x.id);if(i<0)LIST_DATA.push(x);else{if(!x.sec)x.sec=LIST_DATA[i].sec;LIST_DATA[i]=x}});
const SECS={[AN]:["nature:wildlife","nature",1],[RR]:["geo:size","geo",1],[CC]:["culture:festivals","culture",1],[FQ]:["words:names","words",0],[IW]:["nature:water","nature",0],[MW]:["nature:terrain","culture",0],[CB]:["geo:cities","geo",0],[SP]:["geo:borders","politics",0]};
Object.entries(SECS).forEach(([s,[ic,col,map]])=>{if(!LIST_SECS.includes(s))LIST_SECS.push(s);LIST_SEC_ICON[s]=ic;LIST_SEC_COLOR[s]=col;if(map&&typeof LIST_MAP_SECS!=="undefined")LIST_MAP_SECS.add(s)});
try{LIST_BY_ID&&L.forEach(x=>{LIST_BY_ID[x.id]=x})}catch(e){}
window.GF_LISTS_MORE={before,after:LIST_DATA.length};

/* ---------- typed answers that aren't countries ---------- */
const DROP=new Set("the lake lakes mount mt mountain mountains river rivers island islands isle isles of sea seas desert falls fall waterfall strait straits state states province city ocean peak massif national park".split(" "));
const norm=s=>String(s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[ʻ’'`]/g,"").replace(/&/g," and ").split(/[^a-z0-9]+/).filter(w=>w&&!DROP.has(w)).map(w=>w.length>4&&/s$/.test(w)&&!/ss$/.test(w)?w.slice(0,-1):w).join(" ");
/* typing slips: a swapped pair of letters counts as one slip (optimal string alignment distance) */
function osa(a,b){const m=a.length,n=b.length;if(!m)return n;if(!n)return m;const d=[];for(let i=0;i<=m;i++){d[i]=[i];for(let j=1;j<=n;j++)d[i][j]=i?0:j}
 for(let i=1;i<=m;i++)for(let j=1;j<=n;j++){const c=a[i-1]===b[j-1]?0:1;d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+c);if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1])d[i][j]=Math.min(d[i][j],d[i-2][j-2]+1)}return d[m][n]}
/* how many slips a name of this length may have */
const slips=n=>n<4?0:n<6?1:n<9?2:3;
/* the item a typed answer means: exact (names and other names, words like "lake" left out), else the closest within a few
   slips (spaces ignored), else a name it is the clear start of; two items equally close are not guessed between */
function matchItem(Lx,txt){const t=norm(txt);if(!t)return null;const tz=t.replace(/ /g,"");let best=null,bd=99,tie=false;const pre=[];
 for(const it of Lx.items){const cands=[it.n].concat(it.al||[]).map(norm).filter(Boolean);if(cands.includes(t))return it;let d=99;
  cands.forEach(c=>{const cz=c.replace(/ /g,"");if(cz===tz)d=0;else{const k=osa(tz,cz);if(k<=slips(Math.min(tz.length,cz.length)))d=Math.min(d,k);
   /* a whole word of a longer name, typed exactly ("Tanganyika" for "Lake Tanganyika" works already; "Superior" for "Lake Superior" too) */
   c.split(" ").forEach(w=>{if(w.length>=5&&w!==c){const k2=osa(t,w);if(k2<=slips(w.length)&&k2<1)d=Math.min(d,.5)}})}
   if(tz.length>=4&&cz.startsWith(tz)&&cz.length>tz.length)pre.push(it)});
  if(d<bd){bd=d;best=it;tie=false}else if(d===bd&&d<99&&best!==it)tie=true}
 if(best&&bd<99&&!tie)return best;const up=[...new Set(pre)];return up.length===1&&!best?up[0]:null}
function guessItem(txt){const run=lsRun;if(!run||run.revealed)return;const Lx=LIST_BY_ID[run.id],raw=String(txt||"").trim();if(!raw)return;const it=matchItem(Lx,raw);
 if(it&&run.found.includes(it.id)){run.msg=it.n+" — already found.";run.msgKind=""}
 else if(it){run.found.push(it.id);run.msg=it.n+" ✓"+([it.n].concat(it.al||[]).some(n=>norm(n)===norm(raw))?"":" (you typed “"+raw+"”)");run.msgKind="good";try{if(typeof gmEvent==="function")gmEvent("lsGuess")}catch(e){}
  if(run.found.length===Lx.a.length){run.revealed=true;run.msg="All "+Lx.a.length+" found"+(run.strikes.length?" — "+run.strikes.length+" strike"+(run.strikes.length===1?"":"s")+".":" with no strikes!");lsFinish()}}
 else if(run.strikes.some(s=>osa(norm(s).replace(/ /g,""),norm(raw).replace(/ /g,""))<=1)){run.msg=raw+" — already tried.";run.msgKind=""}
 else{run.strikes.push(raw);run.msg=raw+" isn’t on this list — strike "+run.strikes.length+".";run.msgKind="bad"}
 try{saveStats()}catch(e){}renderLists();const i=document.getElementById("lsInput");if(i)i.focus()}
const flag=c=>c&&COUNTRY_BY_CODE[c]?'<img src="'+flagUrl(c,"w40")+'" alt="" loading="lazy">':"";
function itemChip(it,cls){return'<span class="ls-chip '+(cls||"")+'">'+flag(it.cc)+esc(it.n)+(it.v&&cls!=="lsx-plain"?'<small class="lsx-v">'+esc(it.v)+'</small>':'')+'</span>'}
function renderItems(v){const run=lsRun,Lx=LIST_BY_ID[run.id],b=lsBest(run.id),n=Lx.a.length,unit=Lx.unit||"answers";const got=id=>run.found.includes(id);
 const answers=Lx.rk?'<ol class="ls-slots ranked">'+Lx.items.map((it,i)=>{const g=got(it.id),show=g||run.revealed;return'<li class="ls-slot'+(g?" got":run.revealed?" missed":"")+'"><span class="ls-rank">'+(i+1)+'</span>'+(show?itemChip(it,"lsx-plain")+'<span class="ls-val">'+esc(it.v)+'</span>':'<span class="ls-q">?</span>')+'</li>'}).join("")+'</ol>'
  :'<div class="ls-found">'+Lx.items.filter(it=>got(it.id)).map(it=>itemChip(it,"got")).join("")+(run.revealed?Lx.items.filter(it=>!got(it.id)).map(it=>itemChip(it,"missed")).join(""):'')+(!run.revealed&&n-run.found.length?'<span class="ls-left">'+(n-run.found.length)+' to go</span>':'')+'</div>';
 const strikes=run.strikes.length?'<div class="ls-strikes"><span class="ls-lab">Strikes '+run.strikes.length+'</span>'+run.strikes.map(s=>'<span class="ls-chip strike">'+esc(s)+'</span>').join("")+'</div>':'';
 const hasMap=Lx.items.some(it=>it.ll);
 v.innerHTML='<div class="ls-play lsx" style="'+tvTopicColorVars(LIST_SEC_COLOR[Lx.sec])+'"><div class="ls-top"><button type="button" class="ls-back" id="lsBack">← All lists</button>'+(run.revealed?'<span class="ls-sec-tag">'+esc(Lx.sec)+'</span>':'<button type="button" class="ls-giveup" id="lsGiveUp" title="Ends the round and shows the answers">give up &amp; reveal</button>')+'</div>'+
  '<div class="tv-card tv-qcard ls-head"><div class="tv-card-meta">'+esc(Lx.sec)+' · '+n+' '+esc(unit)+(b&&b.best?' · your best '+b.best+'/'+n:'')+'</div><h2 class="ls-q-title">'+esc(Lx.t)+'</h2>'+(Lx.note?'<p class="ls-note">'+esc(Lx.note)+'</p>':'')+
  '<div class="ls-score"><span class="ls-big">'+run.found.length+'</span><span class="ls-of">/ '+n+'</span><span class="ls-bar"><i style="width:'+(100*run.found.length/n).toFixed(1)+'%"></i></span><span class="ls-strk'+(run.strikes.length?" on":"")+'">✕ '+run.strikes.length+'</span></div></div>'+
  (run.revealed?'':'<form class="game-input-wrap ls-input lsx-form" id="lsxForm" autocomplete="off"><input type="text" id="lsInput" class="global-search-input" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Name one of the '+esc(unit)+'… then press Enter" enterkeyhint="done"><button type="submit" class="tv-go lsx-go">Enter</button></form>')+
  '<div class="ls-msg '+run.msgKind+'">'+esc(run.msg||"")+'</div>'+answers+strikes+(hasMap?'<div class="lsx-map" id="lsxMap"></div>':'')+
  '<div class="ls-actions">'+(run.revealed?'<button type="button" class="tv-go" id="lsAgain">Try again</button><button type="button" class="tv-go ghost" id="lsNext">Next list</button><button type="button" class="tv-go ghost" id="lsHome">All lists</button>':'')+'</div></div>';
 const g=id=>document.getElementById(id);g("lsBack").onclick=()=>{lsRun=null;renderLists()};if(g("lsGiveUp"))g("lsGiveUp").onclick=lsReveal;if(g("lsAgain"))g("lsAgain").onclick=()=>lsStart(run.id);if(g("lsHome"))g("lsHome").onclick=()=>{lsRun=null;renderLists()};
 if(g("lsNext"))g("lsNext").onclick=()=>{const S=lsStats(),i=LIST_DATA.findIndex(l=>l.id===run.id);const after=LIST_DATA.slice(i+1).concat(LIST_DATA.slice(0,i+1)).find(l=>!(S[l.id]&&S[l.id].done)&&l.id!==run.id)||LIST_DATA[(i+1)%LIST_DATA.length];lsStart(after.id)};
 const f=g("lsxForm");if(f){f.onsubmit=e=>{e.preventDefault();const i=g("lsInput");const t=i.value;i.value="";guessItem(t)};const i=g("lsInput");if(i&&!("ontouchstart" in window))i.focus({preventScroll:true})}
 if(hasMap&&window.gfTriviaModes){try{const m=gfTriviaModes.makeMap(g("lsxMap"),{small:1});const pts=[];Lx.items.forEach(it=>{if(!it.ll)return;const fd=got(it.id);if(!fd&&!run.revealed)return;pts.push(it.ll);m.add({ll:it.ll,cls:fd?"ans":"miss",r:7,label:it.n})});
   if(pts.length)m.fit(Lx.items.filter(it=>it.ll).map(it=>it.ll),140);else m.fit(Lx.items.filter(it=>it.ll).map(it=>it.ll),140)}catch(e){console.error(e)}}}
{const _p=renderListPlay;renderListPlay=function(v){try{const Lx=lsRun&&LIST_BY_ID[lsRun.id];if(Lx&&Lx.items)return renderItems(v)}catch(e){console.error(e)}return _p.apply(this,arguments)}}
/* the list cards say what kind of answer they want */
{const _h=renderListHome;renderListHome=function(v){const r=_h.apply(this,arguments);try{(v||document).querySelectorAll("[data-ls]").forEach(b=>{const Lx=LIST_BY_ID[b.dataset.ls];if(!Lx||!Lx.items)return;const m=b.querySelector(".ls-card-m");if(m&&m.firstChild&&m.firstChild.nodeType===3)m.firstChild.nodeValue=m.firstChild.nodeValue.replace(/countries/,Lx.unit||"answers")})}catch(e){}return r}}
const css=document.createElement("style");css.textContent=`
.lsx .ls-chip small.lsx-v{ font-size:11px; opacity:.65; margin-left:6px; font-weight:600; } .lsx .ls-chip img{ margin-right:5px; }
.lsx-form{ display:flex; gap:8px; align-items:center; } .lsx-form input{ flex:1; min-width:0; } .lsx-go{ padding:9px 16px; font-size:14px; }
.lsx-map{ margin:12px 0 6px; } .lsx-map .tm-map svg{ max-height:340px; }
`;document.head.appendChild(css);
})();
