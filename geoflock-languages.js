/* GeoFlock: the Language family map (Culture map → Languages), corrected and filled in.
   - Japanese and Korean are not one family: Japonic (Japanese, Ryukyuan) and Koreanic (Korean, Jeju) are separate.
   - every family names a few of its languages (Turkic, Nilo-Saharan and the creoles had none).
   - a country is coloured by the family of the language most people grow up speaking.
   - Dravidian (Telugu, Tamil…) and the families of the Americas (Quechua, Guaraní, Maya…) are in the key.
   Mixed countries, on the flat map and the globe alike (both are the canvas map; the old SVG map keeps the country stripes):
   - STRIPES IN PROPORTION: where another family has about a tenth of the people or more, the country (or region) is striped,
     each family's stripe as wide as its share (CS for countries, RS for regions, below; sources in SRC).
   - REGIONS: where the split is well documented by region, the regions are coloured, solid or striped, instead of the whole
     country (textures/LANG_REGIONS.json: Natural Earth admin-1 outlines, public domain, trimmed to the regions used and
     simplified; built from provinces/*.json).
   - HOMELANDS: where no census asks about language (the Kurdish lands, the Sahel, Iran, Afghanistan, the Andes,
     Guatemala, East Africa), the homelands of peoples speaking another family are drawn from GREG (Weidmann, Rød &
     Cederman 2010, after the Atlas Narodov Mira, 1964), the same data as the Ethnic groups map; "A and B" homelands are
     striped half and half. Amazonian homelands in Peru and Bolivia are left out (thinly peopled, mostly mixed).
   - hover gives the shares and the source for the country, region or homeland under the pointer.
   Shares are of people who grow up speaking each family where the source says so; some sources count people by nationality
   or ethnic group, or people who speak a language (more than one allowed): the hover says which. */
(function(){
if(typeof TH_THEMES==="undefined"||!TH_THEMES.lang)return;
const T=TH_THEMES.lang;
T.note="The family of the language most people grow up speaking.";
T.cats=[["ger","Germanic (English, German…)","#7fa7dc"],["rom","Romance (Spanish, French…)","#e8a07a"],["sla","Slavic (Russian, Polish…)","#5b6fb8"],
 ["ieo","Other Indo-European (Greek…)","#b7a6dc"],["iir","Indo-Iranian (Hindi, Persian…)","#f2cf86"],["dra","Dravidian (Tamil, Telugu…)","#b4561f"],
 ["sem","Afro-Asiatic (Arabic, Hausa…)","#d9b26b"],["nc","Niger-Congo (Swahili, Yoruba…)","#8fcf9e"],["ns","Nilo-Saharan (Dinka, Luo…)","#5ea77a"],
 ["st","Sino-Tibetan (Chinese, Burmese…)","#e07b6f"],["tur","Turkic (Turkish, Kazakh…)","#6fc0c0"],["ura","Uralic (Finnish, Hungarian…)","#a6d8e8"],
 ["an","Austronesian (Malay, Tagalog…)","#d58fb8"],["aa","Austroasiatic (Vietnamese, Khmer…)","#c3a27c"],["kd","Kra-Dai (Thai, Lao…)","#efb7a0"],
 ["jpn","Japonic (Japanese)","#c96f8f"],["kor","Koreanic (Korean)","#9b5fa8"],["ame","Indigenous American (Quechua, Maya…)","#7fb8a8"],
 ["oth","Other families","#bdb6a6"],["cre","Creoles (Haitian, Tok Pisin…)","#f0d9a8"]];
/* main family changes: Japan and Korea apart; Guyana's home language is Guyanese Creole; most Paraguayans grow up speaking Guaraní;
   Åland speaks Swedish (about 90%, ÅSUB 2010) */
const D=T.data;["jp"].forEach(c=>D[c]="jpn");["kr","kp"].forEach(c=>D[c]="kor");D.gy="cre";D.py="ame";D.ax="ger";
/* other families: [family, its languages there] (listed on hover; the stripes come from the shares below) */
const ALSO={
 in:[["dra","Telugu, Tamil, Kannada, Malayalam"],["aa","Santali, Khasi"],["st","Manipuri, Bodo"]],
 lk:[["dra","Tamil"]],pk:[["dra","Brahui"]],np:[["st","Tamang, Newar, Magar"]],bt:[["iir","Nepali"]],bd:[["st","Garo, Marma"]],
 mm:[["kd","Shan"],["aa","Mon, Wa"]],cn:[["tur","Uyghur, Kazakh"],["kd","Zhuang"],["oth","Mongolian (Mongolic)"],["oth","Hmong-Mien languages"]],
 ru:[["tur","Tatar, Bashkir, Chuvash, Yakut"],["ura","Udmurt, Mari, Komi"],["oth","Chechen, Avar (Caucasian families)"]],mn:[["tur","Kazakh"]],
 tw:[["an","Formosan languages, the oldest branch of the family"]],la:[["aa","Khmu"],["oth","Hmong (Hmong-Mien)"]],vn:[["kd","Tày, Thái"],["oth","Hmong (Hmong-Mien)"]],
 my:[["st","Chinese (Hokkien, Cantonese, Hakka…)"],["dra","Tamil"]],sg:[["st","Mandarin, Hokkien"],["an","Malay"],["dra","Tamil"]],
 jp:[["oth","Ainu, a language isolate, now nearly gone"]],
 ir:[["tur","Azerbaijani, Turkmen"]],iq:[["iir","Kurdish"]],sy:[["iir","Kurdish"]],tr:[["iir","Kurdish, Zaza"]],af:[["tur","Uzbek, Turkmen"]],
 tj:[["tur","Uzbek"]],uz:[["iir","Tajik"],["sla","Russian"]],kz:[["sla","Russian"]],kg:[["sla","Russian"]],lv:[["sla","Russian"]],ee:[["sla","Russian"]],lt:[["sla","Polish, Russian"]],
 md:[["sla","Russian, Ukrainian"]],ge:[["tur","Azerbaijani"],["ieo","Armenian"]],cy:[["tur","Turkish, in the north"]],
 be:[["rom","French"]],ch:[["rom","French, Italian, Romansh"]],lu:[["rom","French, Portuguese"]],ca:[["rom","French"],["oth","Cree, Inuktitut"]],us:[["rom","Spanish"]],
 es:[["oth","Basque, a language isolate"]],fr:[["ieo","Breton (Celtic)"],["oth","Basque"],["ger","Alsatian"]],gb:[["ieo","Welsh, Scottish Gaelic (Celtic)"]],ie:[["ieo","Irish (Celtic)"]],
 fi:[["ger","Swedish"]],no:[["ura","Sámi"]],se:[["ura","Sámi, Meänkieli"]],it:[["ger","German, in South Tyrol"]],ro:[["ura","Hungarian"]],sk:[["ura","Hungarian"]],rs:[["ura","Hungarian"]],
 mk:[["ieo","Albanian"]],me:[["ieo","Albanian"]],xk:[["sla","Serbian"]],bg:[["tur","Turkish"]],
 za:[["ger","Afrikaans, English"]],na:[["oth","Khoekhoe (Khoe)"],["ger","Afrikaans, German"]],bw:[["oth","Khoe and San languages"]],
 ng:[["sem","Hausa, the most spoken language"],["ns","Kanuri"]],ne:[["ns","Zarma, Songhay, Kanuri"],["nc","Fula"]],ml:[["ns","Songhay"],["sem","Tamasheq, Arabic"]],
 td:[["sem","Chadian Arabic"]],sd:[["ns","Fur, Nubian, Masalit"]],ss:[["nc","Zande"]],cm:[["sem","Chadic languages (Mafa, Kotoko…)"]],
 ke:[["ns","Luo, Kalenjin, Maasai"],["sem","Somali"]],ug:[["ns","Acholi, Lango, Teso"]],tz:[["ns","Maasai, Luo"],["sem","Iraqw"]],et:[["ns","Nuer, Anuak"]],er:[["ns","Kunama, Nara"]],
 mr:[["nc","Pulaar, Soninke, Wolof"]],
 ae:[["iir","Urdu, Hindi, Persian (people from abroad)"],["dra","Malayalam"]],qa:[["iir","Hindi, Urdu, Nepali (people from abroad)"],["dra","Malayalam"]],kw:[["iir","Urdu, Hindi"]],bh:[["iir","Urdu, Hindi"]],
 fj:[["iir","Fiji Hindi"]],mu:[["iir","Bhojpuri"]],sr:[["cre","Sranan Tongo"],["iir","Sarnami Hindustani"],["an","Javanese"]],
 pg:[["cre","Tok Pisin, the lingua franca"],["an","coastal Austronesian languages"]],vu:[["cre","Bislama, the lingua franca"]],nz:[["an","Māori"]],au:[["oth","Aboriginal languages (Pama–Nyungan and others)"]],
 bo:[["ame","Quechua, Aymara, Guaraní"]],pe:[["ame","Quechua, Aymara"]],ec:[["ame","Kichwa (Quechua)"]],gt:[["ame","K’iche’, Q’eqchi’, Kaqchikel (Mayan)"]],
 mx:[["ame","Nahuatl, Yucatec Maya, Mixtec, Zapotec"]],cl:[["ame","Mapudungun"]],py:[["rom","Spanish"]],bz:[["rom","Spanish"],["cre","Belizean Kriol"]],ht:[["rom","French"]],gl:[["ger","Danish"]]};
T.also=ALSO;
const NOTE={jp:"Japanese and the Ryukyuan languages of Okinawa form the Japonic family",kr:"Korean (with Jeju) forms its own small family, often counted as a language isolate",kp:"Korean (with Jeju) forms its own small family, often counted as a language isolate",
 gy:"Guyanese Creole, based on English, is what most people speak at home",py:"most Paraguayans speak Guaraní, many alongside Spanish",ax:"Swedish is the only official language; about 90% speak it (ÅSUB, 2010)",
 dz:"Arabic and the Berber languages (Kabyle…) are both Afro-Asiatic",ma:"Arabic and the Berber languages (Tamazight…) are both Afro-Asiatic",il:"Hebrew and Arabic are both Afro-Asiatic (Semitic)",
 et:"Amharic, Oromo, Tigrinya and Somali are all Afro-Asiatic",sz:"Swazi (siSwati) is a Bantu language",
 cn:"Tibetan, too, is Sino-Tibetan, like Chinese",ua:"Ukrainian and Russian are both Slavic",es:"Catalan and Galician are Romance, like Spanish"};

/* ---------- sources ---------- */
const SRC={
 cia:"CIA World Factbook (languages)",ciaE:"CIA World Factbook (ethnic groups, as a stand-in for language)",
 in11:"Census of India 2011, mother tongue (table C-16)",lk24:"Census of Sri Lanka 2024, by ethnic group (Tamils and Moors counted as Tamil-speaking)",
 pk23:"Pakistan Bureau of Statistics, Census 2023",eu21:"Basque Government, 7th Sociolinguistic Survey 2021 (speak Basque well, aged 16+)",
 be:"Belgian language laws of 1962–63 (official language areas; no language census since 1947)",bru:"BRIO language barometer 2024",
 ch:"Swiss Federal Statistical Office, main languages (more than one allowed), as given by the canton",
 ca21:"Statistics Canada, Census 2021, mother tongue",ca06:"Statistics Canada, Census 2006, mother tongue",ca16:"Statistics Canada, Census 2016, mother tongue",
 fi25:"Statistics Finland 2025, registered mother tongue",it11:"Census 2011: South Tyrol language-group declarations (ASTAT), share of the whole region",
 ee21:"Statistics Estonia, Census 2021, by nationality",kz:"Bureau of National Statistics of Kazakhstan, by nationality (2020s figures)",
 my25:"Department of Statistics Malaysia, 2025 estimates (citizens; Bumiputera, Chinese, Indian)",cn20:"China 2020 census, by nationality",
 ru21:"Russian Census 2021, by nationality (of those who gave one)",mx20:"INEGI Census 2020, people aged 3+ who speak an Indigenous language"/* state shares as quoted from INEGI 2020 by the Quintana Roo government's Instituto para el Desarrollo del Pueblo Maya (Etnicidad en Quintana Roo, 2025) and, for Campeche, INEGI's 2020 state results; Puebla, San Luis Potosí and Veracruz left out until their shares are checked against INEGI's tables */,
 greg:"homeland in the Atlas Narodov Mira (1964), via GREG (Weidmann, Rød & Cederman 2010)"};
/* ---------- country shares: [source, [family, % or "a–b" range, languages]…]; "speak" sources may add up to more than 100 ---------- */
const CS={
 in:["in11",["iir",78.1,"Hindi, Bengali, Marathi…"],["dra",19.6,"Telugu, Tamil, Kannada, Malayalam"],["aa",1.1,"Santali, Khasi…"],["st",1.0,"Meitei, Bodo…"]],
 lk:["cia",["iir",87,"Sinhala"],["dra",28.5,"Tamil"],"speak (2012 census)"],pk:["cia",["iir",97.5,"Punjabi, Pashto, Sindhi, Saraiki, Urdu, Balochi…"],["dra",1.2,"Brahui"]],
 np:["cia",["iir",78.1,"Nepali, Maithili, Bhojpuri, Tharu…"],["st",13,"Tamang, Newar, Magar, Limbu, Gurung"],"2021 census"],bt:["cia",["st",52,"Sharchopkha, Dzongkha"],["iir",22,"Nepali (Lhotshamkha)"],"2005"],
 sg:["cia",["ger",48.3,"English"],["st",38.6,"Mandarin, Hokkien, Cantonese…"],["an",9.2,"Malay"],["dra",2.5,"Tamil"],"home language, 2020 census"],
 my:["ciaE",["an",63.8,"Malay, Iban, Kadazan… (Bumiputera)"],["st",20.6,"Chinese"],["dra",6,"Tamil… (Indian)"],"2023; non-citizens 9%"],
 tj:["cia",["iir",84.4,"Tajik"],["tur",12.7,"Uzbek, Kyrgyz"],"2010"],uz:["cia",["tur",74.3,"Uzbek"],["sla",14.2,"Russian"],["iir",4.4,"Tajik"]],kg:["cia",["tur",85.8,"Kyrgyz, Uzbek"],["sla",9,"Russian"],"2009"],
 kz:["ciaE",["tur",76.9,"Kazakh, Uzbek, Uyghur, Tatar"],["sla",16.8,"Russian, Ukrainian"],["ger",1.1,"German"],"2023"],
 lv:["cia",["ieo",56.3,"Latvian"],["sla",33.8,"Russian"],"2011 census"],ee:["cia",["ura",67.2,"Estonian"],["sla",28.5,"Russian"],"2021"],lt:["cia",["ieo",85.3,"Lithuanian"],["sla",11.9,"Russian, Polish"],"2021"],
 lu:["cia",["ger",55.4,"Luxembourgish, English, German"],["rom",33.9,"Portuguese, French, Italian"],"2021"],mk:["cia",["sla",61.4,"Macedonian"],["ieo",24.3,"Albanian"],["tur",3.4,"Turkish"],"2021"],
 md:["cia",["rom",80.2,"Romanian"],["sla",15.1,"Russian, Ukrainian, Bulgarian"],["tur",4.2,"Gagauz"],"2014"],bg:["cia",["sla",77.3,"Bulgarian"],["tur",7.9,"Turkish"],"2021"],
 ro:["cia",["rom",91.6,"Romanian"],["ura",6.3,"Hungarian"],"2021"],sk:["cia",["sla",81.8,"Slovak"],["ura",8.5,"Hungarian"],"2021"],rs:["cia",["sla",90,"Serbian, Bosnian"],["ura",3.4,"Hungarian"],"2011"],
 me:["cia",["sla",87.2,"Serbian, Montenegrin, Bosnian"],["ieo",5.3,"Albanian"],"2011"],xk:["cia",["ieo",94.5,"Albanian"],["sla",3.3,"Bosnian, Serbian"],["tur",1.1,"Turkish"],"2011"],
 cy:["cia",["ieo",80.9,"Greek"],["tur",0.2,"Turkish"],"2011, the south only; the north is Turkish-speaking"],
 fi:["cia",["ura",85.9,"Finnish"],["ger",5.2,"Swedish"],"2022"],es:["cia",["rom",98,"Spanish, Catalan, Galician"],["oth",2,"Basque"]],
 be:["cia",["ger",60,"Dutch"],["rom",40,"French"]],ch:["cia",["ger",62.1,"German"],["rom",31.3,"French, Italian, Romansh"],"2019"],
 ca:["ca21",["ger",56.6,"English"],["rom",20.2,"French"]],us:["cia",["ger",78.2,"English only"],["rom",13.4,"Spanish"],"home language, 2017"],
 mx:["cia",["rom",99.4,"Spanish"],["ame",6,"Nahuatl, Maya, Tseltal, Tsotsil, Mixtec, Zapotec…"],"speak, 2020 census"],
 gt:["cia",["rom",69.9,"Spanish"],["ame",29.7,"Q’eqchi’, K’iche’, Mam, Kaqchikel…"],"2018 census"],pe:["cia",["rom",82.9,"Spanish"],["ame",16.3,"Quechua, Aymara, Asháninka…"],"2017 census"],
 bo:["cia",["rom",68.1,"Spanish"],["ame",28.3,"Quechua, Aymara, Guaraní"],"2012 census"],py:["cia",["ame",80.3,"Guaraní (34% alone, 46% with Spanish)"],["rom",15.2,"Spanish only"],"2012"],
 ec:["cia",["rom",98.6,"Spanish"],["ame",3.9,"Kichwa…"],"speak, 2022"],
 za:["cia",["nc",77.5,"Zulu, Xhosa, Pedi, Tswana, Sotho…"],["ger",20.3,"Afrikaans, English"],"2011 census"],
 na:["cia",["nc",75.7,"Oshiwambo, Kavango, Herero…"],["ger",12.4,"Afrikaans, English, German"],["oth",11,"Khoekhoe (Nama/Damara)"],"2016"],
 fj:["ciaE",["an",58,"iTaukei, Rotuman"],["iir",37.5,"Fiji Hindi (Indo-Fijians)"],"2007"],
 ae:["ciaE",["sem",21.8,"Arabic (Emiratis 11.6%, Egyptians 10.2%)"],["iir",59.4,"Hindi, Urdu, Bengali, Malayalam… (South Asians)"],"2015; most residents come from abroad"],
 ru:["cia",["sla",85.7,"Russian"],["tur",3.2,"Tatar…"],["oth",1,"Chechen…"],"2010 census"],
 ng:["ciaE",["nc",42.7,"Yoruba, Igbo, Fula, Tiv, Ibibio, Ijaw (+ many smaller)"],["sem",30,"Hausa"],["ns",2.4,"Kanuri"],"2018"],
 ne:["ciaE",["sem",64.5,"Hausa, Tamasheq, Arabic"],["ns",27.5,"Zarma-Songhay, Kanuri, Tubu"],["nc",7.3,"Fula, Gurma"],"2006"],
 td:["ciaE",["ns",59.2,"Sara, Kanembu, Maba, Toubou…"],["sem",22.6,"Arabic, Masa, Marba… (Chadic)"],["nc",4.7,"Mundang, Tupuri"]],
 ml:["ciaE",["nc",85.6,"Bambara, Fula, Soninke, Senufo, Malinke, Dogon"],["ns",5.9,"Songhay"],["sem",1.7,"Tamasheq"],"2018"],
 mr:["ciaE",["sem",70,"Hassaniya Arabic"],["nc",30,"Pulaar, Soninke, Wolof"]],
 ke:["ciaE",["nc",62,"Kikuyu, Luhya, Kamba, Kisii, Mijikenda, Meru…"],["ns",28.7,"Kalenjin, Luo, Maasai, Turkana"],["sem",5.8,"Somali"],"2019 census"],
 ug:["ciaE",["nc",56.8,"Ganda, Nkole, Soga, Chiga, Gisu… (listed groups)"],["ns",21,"Teso, Lango, Acholi, Lugbara (listed groups)"],"2014 census"],
 et:["ciaE",["sem",86.5,"Oromo, Amharic, Somali, Tigrinya, Sidama…"],"2022; Nilo-Saharan peoples (Nuer, Anuak, Berta…) in the west"],
 cm:["ciaE",["nc",66,"Bamileke, Beti, Bassa, Grassfields…"],["sem",30,"Chadic (Mafa…), Arabic, Hausa"],"2022"],
 iq:["ciaE",["sem","75–80","Arabic"],["iir","15–20","Kurdish"],"1987 government estimate"],tr:["ciaE",["tur","70–75","Turkish"],["iir",19,"Kurdish, Zaza"],"2016"],
 sy:["ciaE",["sem","about 85","Arabic"],["iir","about 10","Kurdish"]],af:["cia",["iir",77,"Dari"],["iir",48,"Pashto"],["tur",11,"Uzbek"],["tur",3,"Turkmen"],"speak, 2020"]};

/* ---------- regions: "cc:Name" → [source, [family, %, languages]…, note?] or [source, "family", text] for a whole region of one family ---------- */
const RS={
 /* India, Census 2011 (mother tongues added up by family) */
 "in:Andhra Pradesh":["in11","dra","Telugu is the language of most people"],"in:Kerala":["in11","dra","Malayalam is the language of nearly everyone"],
 "in:Lakshadweep":["in11","dra","Malayalam (Jeseri) is the main language"],
 "in:Telangana":["in11",["dra",75.5,"Telugu"],["iir",21.2,"Urdu, Lambadi, Marathi, Hindi"]],
 "in:Karnataka":["in11",["dra",79.6,"Kannada, Telugu, Tamil, Tulu, Malayalam"],["iir",18.4,"Urdu, Marathi, Lambadi, Hindi, Konkani"]],
 "in:Tamil Nadu":["in11",["dra",97,"Tamil, Telugu, Kannada, Malayalam"],["iir",1.8,"Urdu"]],"in:Puducherry":["in11",["dra",98,"Tamil, Telugu, Malayalam"]],
 "in:Goa":["in11",["iir",88.4,"Konkani, Marathi, Hindi, Urdu"],["dra",4.7,"Kannada"]],
 "in:Jharkhand":["in11",["iir",80,"Khortha, Hindi, Bengali, Nagpuri, Urdu…"],["aa",14.7,"Santali, Ho, Mundari"],["dra",2.9,"Kurukh"]],
 "in:Assam":["in11",["iir",84.7,"Assamese, Bengali, Hindi, Sadri, Nepali"],["st",8.1,"Bodo, Mising, Karbi"]],
 "in:Meghalaya":["in11",["aa",46.2,"Khasi, Pnar, War"],["st",31.6,"Garo"],["iir",12.7,"Bengali, Nepali, Hindi, Hajong, Assamese"]],
 "in:Arunachal Pradesh":["in11",["st",62.5,"Nyishi, Adi, Tagin, Wancho, Apatani, Mishmi…"],["iir",24.4,"Nepali, Assamese, Bengali, Hindi, Chakma…"]],
 "in:Nagaland":["in11",["st",70.9,"Konyak, Ao, Lotha, Angami and other Naga languages"],["iir",8.1,"Bengali, Nepali, Hindi"]],
 "in:Manipur":["in11",["st",92.4,"Meitei, Thadou, Tangkhul, Poula…"],["iir",3.3,"Nepali, Bengali"]],
 "in:Mizoram":["in11",["st",86.3,"Mizo, Mara, Tripuri, Pawi…"],["iir",9.9,"Chakma, Bengali"]],
 "in:Tripura":["in11",["iir",66.3,"Bengali, Chakma"],["st",28.1,"Kokborok (Tripuri), Mogh"]],
 "in:Sikkim":["in11",["iir",71,"Nepali, Hindi, Bhojpuri, Bengali"],["st",24.9,"Sikkimese, Limbu, Lepcha, Sherpa, Tamang, Rai"]],
 "in:Ladakh":["in11",["st",79.9,"Ladakhi, Purgi, Balti, Tibetan"],["iir",15,"Hindi, Shina, Punjabi"]],
 /* Sri Lanka, Census 2024 by ethnic group */
 "lk:Northern":["lk24",["dra",96.9,"Tamil"],["iir",3.1,"Sinhala"]],"lk:Eastern":["lk24",["dra",77.6,"Tamil"],["iir",22,"Sinhala"]],
 "lk:Central":["lk24",["iir",65.7,"Sinhala"],["dra",34,"Tamil (Hill Tamils, Sri Lankan Tamils, Moors)"]],"lk:Uva":["lk24",["iir",81.4,"Sinhala"],["dra",18.4,"Tamil"]],
 "lk:Western":["lk24",["iir",83.6,"Sinhala"],["dra",15.2,"Tamil"]],"lk:North Western":["lk24",["iir",84.8,"Sinhala"],["dra",14.9,"Tamil"]],
 "lk:Sabaragamuwa":["lk24",["iir",86.3,"Sinhala"],["dra",13.6,"Tamil"]],"lk:North Central":["lk24",["iir",90.4,"Sinhala"],["dra",8.5,"Tamil"]],
 "lk:Southern":["lk24",["iir",94.8,"Sinhala"],["dra",4.6,"Tamil"]],
 "pk:Balochistan":["pk23",["iir",81.1,"Balochi, Pashto, Sindhi, Saraiki…"],["dra",17.2,"Brahui"]],
 "es:Basque Country":["eu21",["rom",63.8,"Spanish"],["oth",36.2,"Basque, a language isolate"]],"es:Navarre":["eu21",["rom",85.9,"Spanish"],["oth",14.1,"Basque, a language isolate"]],
 "be:Antwerp":["be","ger","Dutch-speaking area"],"be:East Flanders":["be","ger","Dutch-speaking area"],"be:Flemish Brabant":["be","ger","Dutch-speaking area"],
 "be:Limburg":["be","ger","Dutch-speaking area"],"be:West Flanders":["be","ger","Dutch-speaking area"],
 "be:Hainaut":["be","rom","French-speaking area"],"be:Namur":["be","rom","French-speaking area"],"be:Walloon Brabant":["be","rom","French-speaking area"],
 "be:Luxembourg":["be","rom","French-speaking area"],"be:Liège":["be","rom","French-speaking area; the German-speaking Community (about 78,000 people) is in its east"],
 "be:Brussels-Capital Region":["bru","rom","Officially French and Dutch; 81% speak French well, 22% Dutch"],
 "ch:Fribourg":["ch",["rom",68.9,"French"],["ger",27.1,"German"]],"ch:Valais":["ch",["rom",63,"French"],["ger",28,"German"]],
 "ch:Bern":["ch",["ger",86,"German"],["rom",11,"French"]],"ch:Graubünden":["ch",["ger",75.2,"German"],["rom",27.8,"Romansh 13.9%, Italian 13.9%"]],
 "ch:Geneva":["ch","rom","French-speaking canton"],"ch:Vaud":["ch","rom","French-speaking canton"],"ch:Neuchâtel":["ch","rom","French-speaking canton"],
 "ch:Jura":["ch","rom","French-speaking canton"],"ch:Ticino":["ch","rom","Italian-speaking canton"],
 "ca:Quebec":["ca21",["rom",77.8,"French"],["ger",10,"English"]],"ca:New Brunswick":["ca06",["ger",64.8,"English"],["rom",32.6,"French"]],
 "ca:Nunavut":["ca16",["ame",63.1,"Inuktitut (Eskimo–Aleut family)"],["ger",31.5,"English"]],
 "fi:Ostrobothnia":["fi25",["ger",49.1,"Swedish"],["ura",39.4,"Finnish"]],
 "it:Trentino-South Tyrol":["it11",["rom",66,"Italian, Ladin"],["ger",34,"German"]],
 "ee:Ida-Viru":["ee21",["sla",77.8,"Russians, Ukrainians, Belarusians"],["ura",19.3,"Estonians, Finns"]],
 "ee:Harju":["ee21",["ura",61.3,"Estonians, Finns"],["sla",33.3,"Russians, Ukrainians, Belarusians"]],
 "kz:North Kazakhstan":["kz",["sla",49.8,"Russians, Ukrainians"],["tur",40,"Kazakhs, Tatars"],["ger",4.1,"Germans"]],
 "kz:Akmola":["kz",["tur",58,"Kazakhs, Tatars"],["sla",32,"Russians, Ukrainians"],["ger",3.8,"Germans"]],
 "kz:Kostanay":["kz",["tur",46.2,"Kazakhs, Tatars"],["sla",45.9,"Russians, Ukrainians, Belarusians"],["ger",3.7,"Germans"]],
 "kz:Pavlodar":["kz",["tur",54.9,"Kazakhs, Tatars"],["sla",39.1,"Russians, Ukrainians"],["ger",2.7,"Germans"],"2020"],
 "kz:Karaganda":["kz",["tur",54.6,"Kazakhs, Tatars"],["sla",37.9,"Russians, Ukrainians"],["ger",2.3,"Germans"],"2020, before Ulytau Region split off"],
 "kz:East Kazakhstan":["kz",["tur",51.8,"Kazakhs, Tatars"],["sla",45,"Russians, Ukrainians"],"the region as it is since 2022; Abai Region, split off then, is more Kazakh"],
 "kz:Almaty City":["kz",["tur",70,"Kazakhs, Uyghurs, Tatars"],["sla",19.8,"Russians"],"2023"],
 "my:Johor":["my25",["an",61.2,"Malay…"],["st",31.8,"Chinese"],["dra",6.5,"Tamil… (Indians)"]],"my:Kedah":["my25",["an",81,"Malay…"],["st",11.7,"Chinese"],["dra",6.1,"Tamil… (Indians)"]],
 "my:Melaka":["my25",["an",72.8,"Malay…"],["st",21.1,"Chinese"],["dra",5.5,"Tamil… (Indians)"]],"my:Negeri Sembilan":["my25",["an",64.6,"Malay…"],["st",20.9,"Chinese"],["dra",14,"Tamil… (Indians)"]],
 "my:Pahang":["my25",["an",82,"Malay…"],["st",13.9,"Chinese"],["dra",3.5,"Tamil… (Indians)"]],"my:Penang":["my25",["an",46.2,"Malay…"],["st",43.7,"Chinese"],["dra",9.5,"Tamil… (Indians)"]],
 "my:Perak":["my25",["an",62.4,"Malay…"],["st",26,"Chinese"],["dra",11.2,"Tamil… (Indians)"]],"my:Selangor":["my25",["an",61.8,"Malay…"],["st",26.3,"Chinese"],["dra",11,"Tamil… (Indians)"]],
 "my:Sabah":["my25",["an",89.2,"Kadazan-Dusun, Bajau, Malay…"],["st",8.9,"Chinese"]],"my:Sarawak":["my25",["an",76.3,"Iban, Malay, Bidayuh…"],["st",23.2,"Chinese"]],
 "my:Kuala Lumpur":["my25",["an",49,"Malay…"],["st",40.4,"Chinese"],["dra",9.8,"Tamil… (Indians)"]],"my:Labuan":["my25",["an",86.6,"Malay…"],["st",10.8,"Chinese"]],
 "cn:Xinjiang":["cn20",["tur",51.7,"Uyghurs 45%, Kazakhs 6%, Kyrgyz"],["st",46.5,"Han 42%, Hui 4%"]],
 "cn:Inner Mongolia":["cn20",["st",78.7,"Han"],["oth",17.7,"Mongols (Mongolic family)"]],
 "cn:Guangxi":["cn20",["st",62,"Han"],["kd",32,"Zhuang, Dong, Mulao, Maonan"],["oth",4,"Yao, Miao (Hmong-Mien)"]],
 "cn:Guizhou":["cn20",["st",68,"Han, Tujia, Yi"],["kd",16,"Buyei, Dong, Sui, Gelao"],["oth",12,"Miao (Hmong-Mien)"]],
 "ru:Republic of Tatarstan":["ru21",["tur",53.6,"Tatars"],["sla",40.3,"Russians"]],
 "ru:Bashkortostan":["ru21",["tur",56.9,"Bashkirs 31%, Tatars 24%, Chuvash"],["sla",36.9,"Russians"],["ura",2.5,"Mari, Udmurts"]],
 "ru:Chuvash Republic":["ru21",["tur",63.7,"Chuvash"],["sla",30.7,"Russians"]],"ru:Sakha Republic":["ru21",["tur",55.3,"Yakuts"],["sla",32.6,"Russians"]],
 "ru:Tuva Republic":["ru21",["tur",88.7,"Tuvans"],["sla",10.1,"Russians"]],"ru:Altai Republic":["ru21",["sla",53.7,"Russians"],["tur",37,"Altai"]],
 "ru:Republic of Khakassia":["ru21",["sla",82.1,"Russians"],["tur",12.7,"Khakas"]],
 "ru:Kabardino-Balkaria":["ru21",["oth",57.1,"Kabardians (Northwest Caucasian family)"],["sla",19.8,"Russians"],["tur",13.7,"Balkars"]],
 "ru:Karachay-Cherkess Republic":["ru21",["tur",48.1,"Karachays, Nogais"],["sla",27.5,"Russians"],["oth",20.8,"Cherkess, Abazins (Northwest Caucasian family)"]],
 "ru:Republic of Dagestan":["ru21",["oth",74.9,"Avars, Dargins, Lezgins, Laks… (Northeast Caucasian family)"],["tur",20.7,"Kumyks, Azerbaijanis, Nogais"],["sla",3.3,"Russians"]],
 "ru:Chechen Republic":["ru21",["oth",96.4,"Chechens (Northeast Caucasian family)"],["sla",1.2,"Russians"]],
 "ru:Republic of Ingushetia":["ru21",["oth",96.4,"Ingush (Northeast Caucasian family)"],["sla",0.7,"Russians"]],
 "ru:Republic of North Ossetia-Alania":["ru21",["iir",68.1,"Ossetians"],["sla",18.9,"Russians"]],
 "ru:Republic of Kalmykia":["ru21",["oth",62.5,"Kalmyks (Mongolic family)"],["sla",25.7,"Russians"]],
 "ru:Republic of Buryatia":["ru21",["sla",64,"Russians"],["oth",32.5,"Buryats (Mongolic family)"]],
 "ru:Mari El Republic":["ru21",["sla",52.5,"Russians"],["ura",40.1,"Mari"]],"ru:Republic of Mordovia":["ru21",["sla",54.1,"Russians"],["ura",38.7,"Mordvins"]],
 "ru:Udmurt Republic":["ru21",["sla",67.7,"Russians"],["ura",24.1,"Udmurts"]],"ru:Komi Republic":["ru21",["sla",69.7,"Russians"],["ura",22.3,"Komi"]],
 "ru:Republic of Adygea":["ru21",["sla",64.4,"Russians"],["oth",25.7,"Adyghe (Northwest Caucasian family)"]],
 "mx:Oaxaca":["mx20",["ame",31.2,"Zapotec, Mixtec, Mazatec, Mixe…"]],"mx:Chiapas":["mx20",["ame",28.2,"Tseltal, Tsotsil, Ch’ol…"]],
 "mx:Yucatán":["mx20",["ame",23.7,"Yucatec Maya"]],"mx:Guerrero":["mx20",["ame",15.5,"Nahuatl, Mixtec, Tlapanec, Amuzgo"]],
 "mx:Hidalgo":["mx20",["ame",12.3,"Nahuatl, Otomi"]],"mx:Quintana Roo":["mx20",["ame",11.7,"Yucatec Maya"]],"mx:Campeche":["mx20",["ame",10.4,"Yucatec Maya, Ch’ol"]],
 };
const SPEAK=new Set(["mx20","eu21"]);/* "speak" counts: the rest grow up with the country's main language too, mostly */
const COUNTRY_NAME=c=>{try{return allMapsCountryName(c)||c}catch(e){return c}};

/* ---------- colours, honouring "show only this" in the key ---------- */
const catCol=k=>{const r=T.cats.find(c=>c[0]===k);return r?r[2]:"#ccc"};
const famName=k=>{const r=T.cats.find(c=>c[0]===k);return r?r[1].replace(/ \(.*$/,""):k};
function shownCol(k){try{if(!(typeof ps!=="undefined"&&ps)){const sel=typeof thSel==="function"?thSel():(thFocus&&thFocus!=="_"?[thFocus]:[]);
 if(sel.length){const c=catCol(k);return sel.includes(k)?(typeof thDeep==="function"?thDeep(c):c):(typeof faintOn==="function"&&faintOn()&&typeof thFaint==="function"?thFaint(c):"#ebe8e1")}}}catch(e){}return catCol(k)}

/* ---------- shares: the families of a country or region, biggest first, and the stripes they make ---------- */
const num=v=>typeof v==="number"?v:(parseFloat(String(v).replace(/^\D+/,""))+(/–/.test(v)?(parseFloat(String(v).split("–")[1])-parseFloat(v))/2:0))||0;
function famsOf(rows){/* rows: [[fam,pct,langs]…] → [[fam,total]…] by family, biggest first */const by={};rows.forEach(r=>{by[r[0]]=(by[r[0]]||0)+num(r[1])});return Object.entries(by).sort((a,b)=>b[1]-a[1])}
const BIG=9.5;/* about a tenth */
/* the stripes: every family with about a tenth or more gets a stripe as wide as its share; the biggest takes what is left */
function stripeParts(fams,speak){if(!fams.length)return null;const big=fams.filter((f,i)=>i&&f[1]>=BIG);if(!big.length)return null;
 let rest=100-big.reduce((s,f)=>s+f[1],0);if(speak)rest=Math.max(rest,0);if(rest<5)rest=Math.max(5,fams[0][1]);
 const parts=[[fams[0][0],rest]].concat(big.map(f=>[f[0],f[1]]));const tot=parts.reduce((s,p)=>s+p[1],0);return parts.map(p=>[p[0],p[1]/tot])}
function rowsOf(e){return e.filter(x=>Array.isArray(x))}
function extraOf(e){const s=e.filter((x,i)=>i&&typeof x==="string");return s.length?s[s.length-1]:""}
/* country stripes (none where the regions or homelands are drawn instead) */
const CSTRIPE={};
function fmtPct(v){if(typeof v!=="number")return v+"%";return(v>=10?Math.round(v):Math.round(v*10)/10)+"%"}
function sharesText(rows,speak){return famsOf(rows).map(([k])=>{const rs=rows.filter(r=>r[0]===k);const pct=rs.length===1?fmtPct(rs[0][1]):fmtPct(Math.round(rs.reduce((s,r)=>s+num(r[1]),0)*10)/10);
 return famName(k)+" "+pct+" ("+rs.map(r=>r[2]).filter(Boolean).join(", ")+")"}).join(", ")}

/* hover text for countries, kept in T.info (other parts of the app read it too) */
const old=T.info||{};const info={};
Object.keys(D).concat(Object.keys(CS)).forEach(c=>{if(info[c])return;const bits=[];const n=NOTE[c]||old[c];
 const cs=CS[c];
 if(cs){const src=cs[0],rows=rowsOf(cs),ex=extraOf(cs),speak=/^speak/.test(ex);
  bits.push((speak?"speak: ":"")+sharesText(rows,speak)+" — "+SRC[src]+(ex?", "+ex:""));if(n)bits.push(n)}
 else{if(n)bits.push(n);const A=ALSO[c];if(A){const by={};A.forEach(([k,l])=>{(by[k]=by[k]||[]).push(l)});bits.push((bits.length?"Also ":"also ")+Object.keys(by).map(k=>k==="oth"?by[k].join("; "):famName(k)+" ("+by[k].join("; ")+")").join(", "))}}
 if(bits.length)info[c]=bits.join(". ")});
T.info=info;

/* ---------- the regions and homelands (loaded the first time the Languages map is shown) ---------- */
let REG=null,regLoad=null;
/* countries drawn by region or homeland (known before the file loads, so their country stripes never flash) */
const REG_CC=new Set(Object.keys(RS).map(k=>k.slice(0,2)).concat(["gt","pe","bo","ir","iq","tr","sy","af","ng","ne","td","sd","ml","mr","ke","ug","et","ss","cm"]));
function langOn(){try{return allMapsColorMode==="culture"&&allMapsSubMode.culture==="lang"&&(typeof thOn!=="function"||thOn())}catch(e){return false}}
function loadReg(){if(regLoad)return regLoad;regLoad=fetch("textures/LANG_REGIONS.json?v=3").then(r=>r.json()).then(t=>{
 const fc=topojson.feature(t,t.objects.r);const list=[];
 fc.features.forEach(f=>{if(!f.geometry)return;const k=f.properties.k,c=k.slice(0,2);let fams,src,text="",name,rows=null,extra="";
  if(k.indexOf(":g:")===2){name=k.slice(5);const fs=String(f.properties.f||"").split("+").filter(Boolean);const n=fs.length;
   const by={};fs.forEach(x=>by[x]=(by[x]||0)+100/n);fams=Object.entries(by).sort((a,b)=>b[1]-a[1]);src="greg"}
  else{const e=RS[k];if(!e)return;name=k.slice(3);src=e[0];if(typeof e[1]==="string"){fams=[[e[1],100]];text=e[2]}else{rows=rowsOf(e);fams=famsOf(rows);extra=extraOf(e);
   /* only the minority counted (people who speak an Indigenous language): the rest is the country's main family */
   const sum=fams.reduce((a,x)=>a+x[1],0),m=D[c];if(sum<90&&m&&!fams.some(x=>x[0]===m)){fams.push([m,100-sum]);fams.sort((a,b)=>b[1]-a[1])}}}
  const g=f.geometry;try{if(d3.geoArea(f)>2*Math.PI){/* a ring wound the wrong way would cover the world */(g.type==="Polygon"?[g.coordinates]:g.coordinates).forEach(P=>P.forEach(r=>r.reverse()))}}catch(e){}
  const parts=fams.length>1?(src==="greg"?fams.map(x=>[x[0],x[1]/100]):stripeParts(fams,SPEAK.has(src))):null;
  const cen=d3.geoCentroid(f);let r=0;try{const walk=a=>{if(typeof a[0]==="number"){const d=d3.geoDistance(cen,a);if(d>r)r=d}else a.forEach(walk)};walk(g.coordinates)}catch(e){r=Math.PI}
  list.push({k,c,name,src,f,fams,rows,text,extra,parts,cen,r,bb:d3.geoBounds(f),greg:src==="greg"});REG_CC.add(c)});
 /* homelands under admin regions, smallest first for the hover */
 list.sort((a,b)=>(a.greg-b.greg)||(d3.geoArea(a.f)-d3.geoArea(b.f)));
 REG=list;buildCStripes();redraw()}).catch(e=>{console.error(e);regLoad=null});return regLoad}
function buildCStripes(){Object.keys(CSTRIPE).forEach(k=>delete CSTRIPE[k]);Object.entries(CS).forEach(([c,e])=>{if(REG_CC.has(c))return;const rows=rowsOf(e),ex=extraOf(e);if(/^speak/.test(ex))return;
 const main=D[c];let fams=famsOf(rows);if(main){const i=fams.findIndex(f=>f[0]===main);if(i>0){const m=fams.splice(i,1)[0];fams.unshift(m)}else if(i<0)fams.unshift([main,0])}
 const p=stripeParts(fams,false);if(p)CSTRIPE[c]=p})}
buildCStripes();

/* ---------- drawing on the canvas map (globe and flat map) ---------- */
const PERIOD=16;/* one repeat of the stripes, in screen pixels */
const patCache=new Map;
function pattern(ctx,parts){const dpr=(ctx.getTransform&&ctx.getTransform().a)||1;const key=parts.map(p=>shownCol(p[0])+":"+p[1].toFixed(3)).join("|")+"@"+dpr;let P=patCache.get(key);
 if(!P){const w=Math.max(4,Math.round(PERIOD*dpr)),c=document.createElement("canvas");c.width=w;c.height=2;const o=c.getContext("2d");let x=0;
  parts.forEach(([k,fr],i)=>{const x1=i===parts.length-1?w:x+fr*w;o.fillStyle=shownCol(k);o.fillRect(Math.round(x),0,Math.max(1,Math.round(x1)-Math.round(x)),2);x=x1});
  P={c,dpr};if(patCache.size>300)patCache.clear();patCache.set(key,P)}
 const pat=ctx.createPattern(P.c,"repeat");return{pat,dpr:P.dpr}}
function fillStriped(ctx,path,geo,parts,anchor){const{pat,dpr}=pattern(ctx,parts);let M=new DOMMatrix().translate(anchor[0],anchor[1]).rotate(-45).scale(1/dpr,1/dpr);
 ctx.fillStyle=pat;ctx.beginPath();path(geo);
 /* the flat map keeps the path in its own units and scales it when filling (geoflock-flatglobe.js): undo that scale for the stripes */
 const T=ctx._gfT;if(T&&ctx._gfPend&&T.S){try{M=new DOMMatrix([T.S,0,0,T.S,T.t[0],T.t[1]]).inverse().multiply(M)}catch(e){}}
 try{pat.setTransform(M)}catch(e){}ctx.fill()}
function viewTest(p,gv){try{if(gv&&!gv._flat&&gv.visibleAngle){const ctr=[-gv.rot[0],-gv.rot[1]],vis=gv.visibleAngle();return q=>d3.geoDistance(q.cen,ctr)-q.r<vis}}catch(e){}return()=>true}
function featsByCode(gv){if(gv._gfLangFC&&gv._gfLangFC.src===gv.features)return gv._gfLangFC.m;const m=new Map;(gv.features||[]).forEach(f=>{const c=f.properties&&f.properties.c;if(!c)return;if(!m.has(c))m.set(c,[]);m.get(c).push(f)});gv._gfLangFC={src:gv.features,m};return m}
function capOf(f){if(f._gfLangCap)return f._gfLangCap;const cen=d3.geoCentroid(f);let r=0;try{const walk=a=>{if(typeof a[0]==="number"){const d=d3.geoDistance(cen,a);if(d>r)r=d}else a.forEach(walk)};walk(f.geometry.coordinates)}catch(e){r=Math.PI}return f._gfLangCap={cen,r}}
/* coarser copies of the outlines for zoomed-out views: a point is kept once it is tol degrees from the last one kept */
const LODS=[0,.06,.18,.4];
function decRing(r,t){const o=[r[0]];let l=r[0];for(let i=1;i<r.length-1;i++){const q=r[i];if(Math.abs(q[0]-l[0])+Math.abs(q[1]-l[1])>=t){o.push(q);l=q}}o.push(r[r.length-1]);return o.length>=4?o:null}
function lodGeo(q,k){if(!k)return q.f;q.lod=q.lod||[];if(q.lod[k]!==undefined)return q.lod[k];const g=q.f.geometry,t=LODS[k];
 const P=(g.type==="Polygon"?[g.coordinates]:g.coordinates).map(poly=>{const rs=poly.map(r=>decRing(r,t));return rs[0]?rs.filter(Boolean):null}).filter(Boolean);
 return q.lod[k]=P.length?{type:"MultiPolygon",coordinates:P}:null}
function lodLevel(p,gv){let ppd=1;try{ppd=gv&&!gv._flat&&gv.size?gv.size().r*(gv.zoom||1)*Math.PI/180:p.scale()*Math.PI/180}catch(e){}const t=.9/ppd;let k=0;LODS.forEach((v,i)=>{if(v<=t)k=i});return k}
let hot=null;
function globeDraw(ctx,p,gv){if(!langOn())return;if(!REG){loadReg();}
 const path=d3.geoPath(p,ctx),inView=viewTest(p,gv),FC=featsByCode(gv);
 const anchorOf=q=>{const a=p(q.cen);return a&&isFinite(a[0])?a:[0,0]};
 ctx.save();ctx.lineJoin="round";
 /* countries striped as a whole */
 const lo=gv._moving&&!gv._flat&&(gv.zoom||1)<3&&window.gfLoF;
 Object.entries(CSTRIPE).forEach(([c,parts])=>{(FC.get(c)||[]).forEach(f=>{const cap=capOf(f);if(!inView(cap))return;fillStriped(ctx,path,lo?gfLoF(f):f,parts,anchorOf(cap))})});
 /* Northern Cyprus: Turkish */
 (FC.get("ncy")||[]).forEach(f=>{const cap=capOf(f);if(!inView(cap))return;ctx.beginPath();path(f);ctx.fillStyle=shownCol("tur");ctx.fill()});
 /* regions and homelands (cut to the country's outline when the file was built) */
 if(REG){const moving=!!gv._moving,lk=Math.min(LODS.length-1,lodLevel(p,gv)+(moving?1:0)),by=new Map;REG.forEach(q=>{if(!inView(q))return;if(!by.has(q.c))by.set(q.c,[]);by.get(q.c).push(q)});
  by.forEach((qs,c)=>{
   /* biggest first, so a small homeland inside a big one shows */
   for(let i=qs.length-1;i>=0;i--){const q=qs[i],g=lodGeo(q,lk);if(!g)continue;if(q.parts)fillStriped(ctx,path,g,q.parts,anchorOf(q));else{ctx.beginPath();path(g);ctx.fillStyle=shownCol(q.fams[0][0]);ctx.fill()}}
   if(moving)return;/* the thin lines wait until the map stops */
   /* thin lines round the census regions that differ from the country (not round the homelands, whose edges are fuzzy) */
   ctx.beginPath();let any=0;qs.forEach(q=>{const g=lodGeo(q,lk);if(g&&!q.greg&&(q.parts||q.fams[0][0]!==D[c])){path(g);any=1}});if(any){ctx.strokeStyle="rgba(255,255,255,0.55)";ctx.lineWidth=0.6;ctx.stroke()}
   /* the country's own border again, which the fills half covered */
   const cf=FC.get(c);if(cf){ctx.beginPath();cf.forEach(f=>path(f));ctx.strokeStyle="rgba(20,30,20,0.5)";ctx.lineWidth=0.55;ctx.stroke()}
   if(hot&&hot.c===c){ctx.beginPath();path(hot.f);ctx.strokeStyle="rgba(29,36,51,0.85)";ctx.lineWidth=1.4;ctx.stroke()}})}
 ctx.restore()}
/* drawn under the place names (window.gfPreLabels runs after the countries are filled, before the names) */
function patchGlobe(){try{const pl=window.gfPreLabels;if(!pl||!pl._gfLang){const f=function(ctx,p,gv){try{if(typeof amGlobe!=="undefined"&&gv===amGlobe)globeDraw(ctx,p,gv)}catch(e){console.error(e)}
   if(pl)try{pl.apply(this,arguments)}catch(e){console.error(e)}};f._gfLang=1;window.gfPreLabels=f;redraw()}
 if(typeof amGlobe!=="undefined"&&amGlobe&&!amGlobe._langPatched){const c=amGlobe.cfg;
  const h0=c.hover;c.hover=function(code,ll){const r=h0?h0.apply(this,arguments):null;try{return hoverText(code,ll,r)}catch(e){console.error(e);return r}};
  amGlobe._langPatched=true;redraw()}}catch(e){}}
patchGlobe();
setInterval(()=>{patchGlobe();document.body.classList.toggle("gf-lang-on",langOn());if(langOn()&&!regLoad)loadReg()},700);
function redraw(){try{amGlobe&&(amGlobe.request?amGlobe.request():amGlobe.render())}catch(e){}}

/* ---------- hover: the region or homeland under the pointer, with its shares and source ---------- */
function regAt(ll){if(!REG||!ll)return null;for(const q of REG){const[[w,s],[e,n]]=q.bb;if(ll[1]<s||ll[1]>n)continue;if(w<=e?(ll[0]<w||ll[0]>e):(ll[0]<w&&ll[0]>e))continue;if(d3.geoContains(q.f,ll))return q}return null}
function countryLine(c){const e=CS[c];if(!e)return"";const ex=extraOf(e),speak=/^speak/.test(ex);return COUNTRY_NAME(c)+" as a whole"+(speak?" (speak)":"")+": "+sharesText(rowsOf(e),speak)+" ("+SRC[e[0]]+(ex?", "+ex:"")+")"}
function regText(q){const cn=COUNTRY_NAME(q.c);
 if(q.greg){const fs=q.fams.map(f=>famName(f[0])).join(" and ");const cl=countryLine(q.c);return"Homeland of the "+q.name.replace(/ · /g," and ")+" ("+fs+"), "+cn+" — "+SRC.greg+(cl?". "+cl:"")}
 const head=q.name+", "+cn+" — ";if(!q.rows)return head+famName(q.fams[0][0])+": "+q.text+" ("+SRC[q.src]+")";
 const speak=SPEAK.has(q.src);const sum=q.rows.reduce((a,r)=>a+num(r[1]),0),m=D[q.c];
 return head+(speak?"speak: ":"")+sharesText(q.rows,speak)+(sum<90&&m&&!q.rows.some(r=>r[0]===m)?"; the others speak only "+(q.c==="mx"?"Spanish (Romance)":famName(m)):"")+" ("+SRC[q.src]+(q.extra?", "+q.extra:"")+")"}
function ncyAt(ll){try{const F=amGlobe&&amGlobe.features||[];return!!ll&&F.some(f=>f.properties&&f.properties.c==="ncy"&&d3.geoContains(f,ll))}catch(e){return false}}
function hoverText(code,ll,r){const q=langOn()&&ll?regAt(ll):null;if(q!==hot){hot=q;redraw()}
 if(langOn()&&(code==="ncy"||code==="cy"&&ncyAt(ll)))return"Northern Cyprus — Turkic: Turkish-speaking (the Turkish Cypriot north since 1974)";
 if(!q)return r;return regText(q)}
/* longer hover text wraps */
const st=document.createElement("style");st.textContent="#allMapsWrap .map-territory-tooltip{ white-space:normal !important; max-width:340px; } body.gf-lang-on .globe-tip{ white-space:normal; max-width:360px; }";document.head.appendChild(st);

/* ---------- the old SVG map (used only where the canvas map is off): country stripes in proportion ---------- */
function svgStripes(){try{
 if(typeof allMapsColorMode==="undefined"||allMapsColorMode!=="culture"||allMapsSubMode.culture!=="lang")return;
 const svg=document.querySelector("#allMapsWrap svg");if(!svg)return;
 let defs=svg.querySelector("defs#gfLangDefs");if(!defs){defs=document.createElementNS("http://www.w3.org/2000/svg","defs");defs.id="gfLangDefs";svg.insertBefore(defs,svg.firstChild)}
 const all=Object.assign({},CSTRIPE);Object.entries(CS).forEach(([c,e])=>{if(all[c]||/^speak/.test(extraOf(e)))return;let fams=famsOf(rowsOf(e));const p=stripeParts(fams,false);if(p)all[c]=p});
 Object.entries(all).forEach(([c,parts])=>{const id="gfLs-"+c+"-"+parts.map(p=>shownCol(p[0]).slice(1)).join("");
  if(!defs.querySelector("#"+id)){const pt=document.createElementNS("http://www.w3.org/2000/svg","pattern");pt.id=id;pt.setAttribute("patternUnits","userSpaceOnUse");pt.setAttribute("width","9");pt.setAttribute("height","9");pt.setAttribute("patternTransform","rotate(45)");
   let x=0;pt.innerHTML=parts.map(([k,fr])=>{const r='<rect x="'+x.toFixed(2)+'" width="'+(fr*9+0.05).toFixed(2)+'" height="9" fill="'+shownCol(k)+'"/>';x+=fr*9;return r}).join("");defs.appendChild(pt)}
  svg.querySelectorAll("#"+c.toUpperCase()+", [data-code='"+c+"']").forEach(el=>{if(el.classList.contains("map-country")||el.tagName==="path")el.style.fill="url(#"+id+")"})});
}catch(e){console.error(e)}}
if(typeof applyAllMapsColorMode==="function"){const _a=applyAllMapsColorMode;applyAllMapsColorMode=function(){const r=_a.apply(this,arguments);svgStripes();redraw();return r}}
document.addEventListener("click",e=>{if(e.target.closest&&e.target.closest("[data-th],[data-allmaps-sub],[data-legopt]"))setTimeout(()=>{svgStripes();redraw()},30)},true);

/* ---------- the key: what the stripes and patches are, and the sources ---------- */
if(typeof thLegendHTML==="function"){const _l=thLegendHTML;thLegendHTML=function(){const h=_l.apply(this,arguments);try{if(allMapsSubMode.culture==="lang"&&allMapsColorMode==="culture")
 return h+'<div class="legend-note gf-lang-note">Stripes: a mixed country or region, each family as wide as its share. Patches: regions or homelands where another family is spoken. Hover for shares and sources.</div>'
  +'<div class="legend-note gf-lang-src">Sources: national censuses (India 2011, Sri Lanka 2024, Pakistan 2023, Canada, Switzerland, Finland, Estonia 2021, Russia 2021, China 2020, Mexico 2020 and others); Kazakhstan and Malaysia statistics offices; Basque Sociolinguistic Survey 2021; CIA World Factbook; homelands from GREG (after the Atlas Narodov Mira, 1964); regional outlines from Natural Earth.</div>'}catch(e){}return h}}
})();
