/* GeoFlock: the Language family map (Culture map → Languages), corrected and filled in.
   - Japanese and Korean are not one family: Japonic (Japanese, Ryukyuan) and Koreanic (Korean, Jeju) are separate.
   - every family names a few of its languages (Turkic, Nilo-Saharan and the creoles had none).
   - a country is coloured by the family of the language most people grow up speaking, and big second families are shown
     as stripes on the flat map; every family with a real number of speakers is listed when you hover the country.
   - Dravidian (Telugu, Tamil…) and the families of the Americas (Quechua, Guaraní, Maya…) are in the key.
   Shares are rough, from national censuses; "big" (striped) means roughly a tenth of the people or more. */
(function(){
if(typeof TH_THEMES==="undefined"||!TH_THEMES.lang)return;
const T=TH_THEMES.lang;
T.note="The family of the language most people grow up speaking. Stripes show a second family spoken by many people; hover a country for all of them.";
T.cats=[["ger","Germanic (English, German, Dutch…)","#7fa7dc"],["rom","Romance (Spanish, Portuguese, French…)","#e8a07a"],["sla","Slavic (Russian, Polish, Serbian…)","#5b6fb8"],
 ["ieo","Other Indo-European (Greek, Albanian, Armenian, Latvian…)","#b7a6dc"],["iir","Indo-Iranian (Hindi, Bengali, Persian, Kurdish…)","#f2cf86"],["dra","Dravidian (Telugu, Tamil, Kannada, Malayalam)","#b4561f"],
 ["sem","Afro-Asiatic (Arabic, Amharic, Hausa, Somali, Hebrew…)","#d9b26b"],["nc","Niger-Congo (Swahili, Yoruba, Igbo, Zulu…)","#8fcf9e"],["ns","Nilo-Saharan (Dinka, Luo, Kanuri, Songhay…)","#5ea77a"],
 ["st","Sino-Tibetan (Chinese, Burmese, Tibetan…)","#e07b6f"],["tur","Turkic (Turkish, Azerbaijani, Kazakh, Uzbek…)","#6fc0c0"],["ura","Uralic (Finnish, Estonian, Hungarian, Sámi)","#a6d8e8"],
 ["an","Austronesian (Malay, Indonesian, Tagalog, Malagasy…)","#d58fb8"],["aa","Austroasiatic (Vietnamese, Khmer, Santali…)","#c3a27c"],["kd","Kra-Dai (Thai, Lao, Shan, Zhuang)","#efb7a0"],
 ["jpn","Japonic (Japanese, Ryukyuan)","#c96f8f"],["kor","Koreanic (Korean, Jeju)","#9b5fa8"],["ame","Indigenous American families (Quechua, Guaraní, Maya…)","#7fb8a8"],
 ["oth","Other families (Kartvelian, Mongolic, Papuan, Khoe…)","#bdb6a6"],["cre","Creoles (Haitian, Jamaican, Cape Verdean…)","#f0d9a8"]];
/* main family changes: Japan and Korea apart; Guyana's home language is Guyanese Creole; most Paraguayans grow up speaking Guaraní */
const D=T.data;["jp"].forEach(c=>D[c]="jpn");["kr","kp"].forEach(c=>D[c]="kor");D.gy="cre";D.py="ame";
/* other families: [family, its languages there, big?] */
const ALSO={
 in:[["dra","Telugu, Tamil, Kannada, Malayalam",1],["aa","Santali, Khasi"],["st","Manipuri, Bodo"]],
 lk:[["dra","Tamil",1]],pk:[["dra","Brahui"]],np:[["st","Tamang, Newar, Magar"]],bt:[["iir","Nepali",1]],bd:[["st","Garo, Marma"]],
 mm:[["kd","Shan"],["aa","Mon, Wa"]],cn:[["tur","Uyghur, Kazakh"],["kd","Zhuang"],["oth","Mongolian (Mongolic)"],["oth","Hmong-Mien languages"]],
 ru:[["tur","Tatar, Bashkir, Chuvash, Yakut"],["ura","Udmurt, Mari, Komi"],["oth","Chechen, Avar (Caucasian families)"]],mn:[["tur","Kazakh"]],
 tw:[["an","Formosan languages, the oldest branch of the family"]],la:[["aa","Khmu"],["oth","Hmong (Hmong-Mien)"]],vn:[["kd","Tày, Thái"],["oth","Hmong (Hmong-Mien)"]],
 my:[["st","Chinese (Hokkien, Cantonese, Hakka…)",1],["dra","Tamil"]],sg:[["st","Mandarin, Hokkien",1],["an","Malay"],["dra","Tamil"]],
 jp:[["oth","Ainu, a language isolate, now nearly gone"]],
 ir:[["tur","Azerbaijani, Turkmen",1]],iq:[["iir","Kurdish",1]],sy:[["iir","Kurdish"]],tr:[["iir","Kurdish, Zaza",1]],af:[["tur","Uzbek, Turkmen"]],
 tj:[["tur","Uzbek",1]],uz:[["iir","Tajik"]],kz:[["sla","Russian",1]],kg:[["sla","Russian"]],lv:[["sla","Russian",1]],ee:[["sla","Russian",1]],lt:[["sla","Polish, Russian"]],
 md:[["sla","Russian, Ukrainian"]],ge:[["tur","Azerbaijani"],["ieo","Armenian"]],cy:[["tur","Turkish, in the north",1]],
 be:[["rom","French",1]],ch:[["rom","French, Italian, Romansh",1]],lu:[["rom","French"]],ca:[["rom","French",1],["oth","Cree, Inuktitut"]],us:[["rom","Spanish",1]],
 es:[["oth","Basque, a language isolate"]],fr:[["ieo","Breton (Celtic)"],["oth","Basque"],["ger","Alsatian"]],gb:[["ieo","Welsh, Scottish Gaelic (Celtic)"]],ie:[["ieo","Irish (Celtic)"]],
 fi:[["ger","Swedish"]],no:[["ura","Sámi"]],se:[["ura","Sámi, Meänkieli"]],it:[["ger","German, in South Tyrol"]],ro:[["ura","Hungarian"]],sk:[["ura","Hungarian"]],rs:[["ura","Hungarian"]],
 mk:[["ieo","Albanian",1]],me:[["ieo","Albanian"]],xk:[["sla","Serbian"]],bg:[["tur","Turkish"]],
 za:[["ger","Afrikaans, English",1]],na:[["oth","Khoekhoe (Khoe)",1],["ger","Afrikaans, German"]],bw:[["oth","Khoe and San languages"]],
 ng:[["sem","Hausa, the most spoken language",1],["ns","Kanuri"]],ne:[["ns","Zarma, Songhay, Kanuri",1],["nc","Fula"]],ml:[["ns","Songhay"],["sem","Tamasheq, Arabic"]],
 td:[["sem","Chadian Arabic",1]],sd:[["ns","Fur, Nubian, Masalit"]],ss:[["nc","Zande"]],cm:[["sem","Chadic languages (Mafa, Kotoko…)"]],
 ke:[["ns","Luo, Kalenjin, Maasai",1],["sem","Somali"]],ug:[["ns","Acholi, Lango, Teso",1]],tz:[["ns","Maasai, Luo"],["sem","Iraqw"]],et:[["ns","Nuer, Anuak"]],er:[["ns","Kunama, Nara"]],
 mr:[["nc","Pulaar, Soninke, Wolof",1]],
 ae:[["iir","Urdu, Hindi, Persian (people from abroad)",1],["dra","Malayalam"]],qa:[["iir","Hindi, Urdu, Nepali (people from abroad)",1],["dra","Malayalam"]],kw:[["iir","Urdu, Hindi"]],bh:[["iir","Urdu, Hindi"]],
 fj:[["iir","Fiji Hindi",1]],mu:[["iir","Bhojpuri"]],sr:[["cre","Sranan Tongo",1],["iir","Sarnami Hindustani"],["an","Javanese"]],
 pg:[["cre","Tok Pisin, the lingua franca"],["an","coastal Austronesian languages"]],vu:[["cre","Bislama, the lingua franca"]],nz:[["an","Māori"]],au:[["oth","Aboriginal languages (Pama–Nyungan and others)"]],
 bo:[["ame","Quechua, Aymara, Guaraní",1]],pe:[["ame","Quechua, Aymara",1]],ec:[["ame","Kichwa (Quechua)"]],gt:[["ame","K’iche’, Q’eqchi’, Kaqchikel (Mayan)",1]],
 mx:[["ame","Nahuatl, Yucatec Maya, Mixtec, Zapotec"]],cl:[["ame","Mapudungun"]],py:[["rom","Spanish",1]],bz:[["rom","Spanish",1],["cre","Belizean Kriol"]],ht:[["rom","French"]],gl:[["ger","Danish"]]};
T.also=ALSO;
const NOTE={jp:"Japanese and the Ryukyuan languages of Okinawa form the Japonic family",kr:"Korean (with Jeju) forms its own small family, often counted as a language isolate",kp:"Korean (with Jeju) forms its own small family, often counted as a language isolate",
 gy:"Guyanese Creole, based on English, is what most people speak at home",py:"most Paraguayans speak Guaraní, many alongside Spanish",
 dz:"Arabic and the Berber languages (Kabyle…) are both Afro-Asiatic",ma:"Arabic and the Berber languages (Tamazight…) are both Afro-Asiatic",il:"Hebrew and Arabic are both Afro-Asiatic (Semitic)",
 et:"Amharic, Oromo, Tigrinya and Somali are all Afro-Asiatic",sz:"Swazi (siSwati) is a Bantu language"};
const famName=k=>{const r=T.cats.find(c=>c[0]===k);return r?r[1].replace(/ \(.*$/,""):k};
const old=T.info||{};const info={};
Object.keys(D).forEach(c=>{const bits=[];const n=NOTE[c]||old[c];if(n)bits.push(n);
 const A=ALSO[c];if(A){const by={};A.forEach(([k,l])=>{(by[k]=by[k]||[]).push(l)});bits.push((bits.length?"Also ":"also ")+Object.keys(by).map(k=>k==="oth"?by[k].join("; "):famName(k)+" ("+by[k].join("; ")+")").join(", "))}
 if(bits.length)info[c]=bits.join(". ")});
T.info=info;
/* stripes: the second big family over the main colour, on the flat map */
const col=k=>{const r=T.cats.find(c=>c[0]===k);return r?r[2]:"#ccc"};
function stripes(){try{
 if(typeof allMapsColorMode==="undefined"||allMapsColorMode!=="culture"||allMapsSubMode.culture!=="lang")return;
 const svg=document.querySelector("#allMapsWrap svg");if(!svg)return;
 let defs=svg.querySelector("defs#gfLangDefs");if(!defs){defs=document.createElementNS("http://www.w3.org/2000/svg","defs");defs.id="gfLangDefs";svg.insertBefore(defs,svg.firstChild)}
 const focus=typeof thFocus!=="undefined"?thFocus:null;
 Object.entries(ALSO).forEach(([c,L])=>{const big=L.find(x=>x[2]);if(!big)return;const main=D[c];if(!main||focus&&focus!==main&&focus!==big[0])return;
  const id="gfLs-"+main+"-"+big[0];
  if(!defs.querySelector("#"+id)){const p=document.createElementNS("http://www.w3.org/2000/svg","pattern");p.id=id;p.setAttribute("patternUnits","userSpaceOnUse");p.setAttribute("width","9");p.setAttribute("height","9");p.setAttribute("patternTransform","rotate(45)");
   p.innerHTML='<rect width="9" height="9" fill="'+col(main)+'"/><rect width="3" height="9" fill="'+col(big[0])+'"/>';defs.appendChild(p)}
  svg.querySelectorAll("#"+c.toUpperCase()+", [data-code='"+c+"']").forEach(el=>{if(el.classList.contains("map-country")||el.tagName==="path")el.style.fill="url(#"+id+")"})});
}catch(e){console.error(e)}}
if(typeof applyAllMapsColorMode==="function"){const _a=applyAllMapsColorMode;applyAllMapsColorMode=function(){const r=_a.apply(this,arguments);stripes();return r}}
document.addEventListener("click",e=>{if(e.target.closest&&e.target.closest("[data-th],[data-allmaps-sub]"))setTimeout(stripes,30)},true);
/* longer hover text wraps */
const st=document.createElement("style");st.textContent="#allMapsWrap .map-territory-tooltip{ white-space:normal !important; max-width:340px; }";document.head.appendChild(st);
/* the key: a line about the stripes */
if(typeof thLegendHTML==="function"){const _l=thLegendHTML;thLegendHTML=function(){const h=_l.apply(this,arguments);try{if(allMapsSubMode.culture==="lang"&&allMapsColorMode==="culture")return h+'<div class="legend-note gf-lang-note">Stripes: a second language family spoken by many people. Hover a country to see all of them.</div>'}catch(e){}return h}}
})();
