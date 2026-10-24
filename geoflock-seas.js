/* GeoFlock: how seas nest inside each other, and Landforms sea levels.
   - GF_SEA_PARENT: which sea or ocean each sea, gulf or bay belongs to (roughly the International Hydrographic Organization's limits).
   - Landforms: the Pacific and the Atlantic are one shape each (not north and south halves).
     Easy: oceans and the biggest seas, with the smaller seas inside them counted as part of them.
     Medium: more seas named on their own, the smallest still merged.  Hard: every sea, gulf and bay on its own.
   Loaded after the landforms data and before the main page script, which builds its lists from this data later. */
(function(){
window.GF_SEA_PARENT={
 "Aegean Sea":"Mediterranean Sea","Ionian Sea":"Mediterranean Sea","Adriatic Sea":"Mediterranean Sea","Tyrrhenian Sea":"Mediterranean Sea","Balearic Sea":"Mediterranean Sea","Gulf of Lion":"Mediterranean Sea",
 "Sea of Azov":"Black Sea","Gulf of Suez":"Red Sea","Gulf of Oman":"Arabian Sea","Persian Gulf":"Gulf of Oman","Gulf of Aden":"Arabian Sea","Gulf of Kutch":"Arabian Sea","Gulf of Mannar":"Laccadive Sea",
 "Gulf of Honduras":"Caribbean Sea","Bay of Campeche":"Gulf of Mexico","Gulf of Bothnia":"Baltic Sea","Gulf of Finland":"Baltic Sea","Skagerrak and Kattegat":"North Sea","James Bay":"Hudson Bay",
 "Melville Bay":"Baffin Bay","Disko Bay":"Baffin Bay","Scoresby Sund":"Greenland Sea","Ungava Bay":"Hudson Strait","Gulf of Ob":"Kara Sea","Yenisey Gulf":"Kara Sea","Khatanga Gulf":"Laptev Sea",
 "Bristol Bay":"Bering Sea","Cook Inlet":"Gulf of Alaska","Shelikhov Gulf":"Sea of Okhotsk","Bohai Sea":"Yellow Sea","Gulf of Thailand":"South China Sea","Gulf of Tonkin":"South China Sea","Strait of Singapore":"South China Sea","Gulf of Carpentaria":"Arafura Sea","Bay of Fundy":"Gulf of Maine",
 "Caribbean Sea":"Atlantic Ocean","Gulf of Mexico":"Atlantic Ocean","Sargasso Sea":"Atlantic Ocean","Labrador Sea":"Atlantic Ocean","Bay of Biscay":"Atlantic Ocean","North Sea":"Atlantic Ocean","English Channel":"Atlantic Ocean","Irish Sea":"Atlantic Ocean","Inner Seas (Scotland)":"Atlantic Ocean","Bristol Channel":"Atlantic Ocean","Gulf of Saint Lawrence":"Atlantic Ocean","Gulf of Maine":"Atlantic Ocean","Chesapeake Bay":"Atlantic Ocean","Straits of Florida":"Atlantic Ocean","Mediterranean Sea":"Atlantic Ocean","Baltic Sea":"Atlantic Ocean","Black Sea":"Atlantic Ocean","Sea of Marmara":"Atlantic Ocean","Strait of Gibraltar":"Atlantic Ocean","Davis Strait":"Atlantic Ocean",
 "Gulf of Guinea":"Atlantic Ocean","Río de la Plata":"Atlantic Ocean","San Jorge Gulf":"Atlantic Ocean","Marajó Bay":"Atlantic Ocean",
 "Baffin Bay":"Arctic Ocean","Hudson Bay":"Arctic Ocean","Hudson Strait":"Arctic Ocean","Greenland Sea":"Arctic Ocean","Norwegian Sea":"Arctic Ocean","Barents Sea":"Arctic Ocean","White Sea":"Arctic Ocean","Kara Sea":"Arctic Ocean","Laptev Sea":"Arctic Ocean","Chukchi Sea":"Arctic Ocean","Beaufort Sea":"Arctic Ocean","Northwest Passage":"Arctic Ocean","Viscount Melville Sound":"Arctic Ocean","Amundsen Gulf":"Arctic Ocean",
 "Bering Sea":"Pacific Ocean","Gulf of Alaska":"Pacific Ocean","Sea of Okhotsk":"Pacific Ocean","Sea of Japan":"Pacific Ocean","Yellow Sea":"Pacific Ocean","East China Sea":"Pacific Ocean","South China Sea":"Pacific Ocean","Philippine Sea":"Pacific Ocean","Sulu Sea":"Pacific Ocean","Celebes Sea":"Pacific Ocean","Gulf of California":"Pacific Ocean","Gulf of Panama":"Pacific Ocean","Strait of Georgia":"Pacific Ocean","Seto Inland Sea":"Pacific Ocean","Korea Strait":"Pacific Ocean","Taiwan Strait":"Pacific Ocean",
 "Coral Sea":"Pacific Ocean","Tasman Sea":"Pacific Ocean","Solomon Sea":"Pacific Ocean","Bismarck Sea":"Pacific Ocean","Arafura Sea":"Pacific Ocean","Banda Sea":"Pacific Ocean","Molucca Sea":"Pacific Ocean","Ceram Sea":"Pacific Ocean","Java Sea":"Pacific Ocean","Makassar Strait":"Pacific Ocean","Bay of Plenty":"Pacific Ocean","Gulf of Corcovado":"Pacific Ocean",
 "Arabian Sea":"Indian Ocean","Bay of Bengal":"Indian Ocean","Andaman Sea":"Indian Ocean","Laccadive Sea":"Indian Ocean","Red Sea":"Indian Ocean","Mozambique Channel":"Indian Ocean","Timor Sea":"Indian Ocean","Great Australian Bight":"Indian Ocean","Strait of Malacca":"Indian Ocean",
 "Weddell Sea":"Southern Ocean","Ross Sea":"Southern Ocean","Amundsen Sea":"Southern Ocean","Bellingshausen Sea":"Southern Ocean","Scotia Sea":"Southern Ocean","Drake Passage":"Southern Ocean"};
if(typeof LANDFORMS==="undefined"||!LANDFORMS.items)return;
const P=window.GF_SEA_PARENT,L=LANDFORMS.items;
/* the Caspian is a lake: listed once, with the lakes */
const lakeNames=new Set(L.filter(x=>x.cat==="lakes").map(x=>x.name));
for(let i=L.length-1;i>=0;i--)if(L[i].cat==="seas"&&lakeNames.has(L[i].name))L.splice(i,1);
const polysOf=g=>{if(!g||g.t!=="poly"||!g.c||!g.c.length)return[];return Array.isArray(g.c[0][0][0])?g.c:g.c.map(r=>[r])};
/* one Pacific and one Atlantic */
[["Pacific Ocean","pacific",["Pacific","The Pacific"]],["Atlantic Ocean","atlantic",["Atlantic","The Atlantic"]]].forEach(([name,id,alt])=>{
 const parts=L.filter(x=>x.cat==="seas"&&(x.name==="North "+name||x.name==="South "+name));if(!parts.length)return;
 const o=Object.assign({},parts[0],{id:"sea_"+id,name,alt,geom:{t:"poly",c:parts.flatMap(x=>polysOf(x.geom))},fact:parts.map(x=>x.fact).filter(Boolean)[0]||""});
 parts.forEach(x=>L.splice(L.indexOf(x),1));L.push(o)});
const seas=L.filter(x=>x.cat==="seas"),byName=new Map(seas.map(x=>[x.name,x]));
const wm=x=>x.wm==null?4:x.wm;
/* the nearest sea or ocean that is shown at this level */
const host=(x,max)=>{let n=x.name,g=0;while(g++<8){const p=P[n];if(!p)return null;const h=byName.get(p);if(h&&wm(h)<=max)return h;n=p}return null};
const SHOWN=[[1,1],[2,2],[3,9]];/* level: biggest wm shown on its own */
const extra=[];
seas.forEach(x=>{x.lvs=[]});
SHOWN.forEach(([lv,max])=>{
 seas.forEach(x=>{if(wm(x)>max)return;/* x is named on its own at this level; collect the smaller ones merged into it */
  const kids=seas.filter(y=>y!==x&&wm(y)>max&&host(y,max)===x);
  if(!kids.length){x.lvs.push(lv);return}
  const names=kids.map(y=>y.name);
  extra.push(Object.assign({},x,{id:x.id+"__L"+lv,lvs:[lv],geom:{t:"poly",c:polysOf(x.geom).concat(kids.flatMap(y=>polysOf(y.geom)))},incl:names,
   fact:(x.fact?x.fact+" ":"")+"Here it includes the "+names.slice(0,6).join(", ")+(names.length>6?" and "+(names.length-6)+" more":"")+"."}))})});
extra.forEach(x=>L.push(x));
})();
