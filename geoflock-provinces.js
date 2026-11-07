/* GeoFlock: States & provinces drills (part of Trivia → Drills).
   Outlines: Natural Earth admin-1 (public domain), one small file per country in provinces/, loaded only when that country is opened.
   Where Natural Earth has second-level or older units they are merged into the current first-level divisions
   (e.g. France, Italy, Spain, UK, Norway, Philippines, Vietnam, Ireland, Hungary, Sri Lanka, New Zealand).
   LIST rows: [code, title, noun, continent, note on how current the divisions are]. */
(function(){
if(typeof d3==="undefined")return;
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const LIST=[
 ["us", "US states", "state", "Americas"],
 ["ca", "Canada", "province or territory", "Americas"],
 ["mx", "Mexico", "state", "Americas"],
 ["br", "Brazil", "state", "Americas"],
 ["ar", "Argentina", "province", "Americas"],
 ["gb", "United Kingdom", "region or nation", "Europe"],
 ["fr", "France", "region", "Europe"],
 ["de", "Germany", "state", "Europe"],
 ["it", "Italy", "region", "Europe"],
 ["es", "Spain", "autonomous community", "Europe"],
 ["ru", "Russia", "region", "Europe"],
 ["cn", "China", "province", "Asia"],
 ["in", "India", "state or territory", "Asia"],
 ["jp", "Japan", "prefecture", "Asia"],
 ["au", "Australia", "state or territory", "Oceania"],
 ["za", "South Africa", "province", "Africa"],
 ["ng", "Nigeria", "state", "Africa"],
 ["at", "Austria", "state", "Europe"],
 ["ch", "Switzerland", "canton", "Europe"],
 ["be", "Belgium", "province", "Europe"],
 ["nl", "Netherlands", "province", "Europe"],
 ["dk", "Denmark", "region", "Europe"],
 ["no", "Norway", "county", "Europe", "2024 counties, built from the older county outlines"],
 ["se", "Sweden", "county", "Europe"],
 ["fi", "Finland", "region", "Europe"],
 ["ee", "Estonia", "county", "Europe"],
 ["lt", "Lithuania", "county", "Europe"],
 ["pl", "Poland", "voivodeship", "Europe"],
 ["cz", "Czechia", "region", "Europe"],
 ["sk", "Slovakia", "region", "Europe"],
 ["hu", "Hungary", "county", "Europe"],
 ["ro", "Romania", "county", "Europe"],
 ["bg", "Bulgaria", "province", "Europe"],
 ["gr", "Greece", "region", "Europe"],
 ["al", "Albania", "county", "Europe"],
 ["mk", "North Macedonia", "statistical region", "Europe"],
 ["me", "Montenegro", "municipality", "Europe", "municipalities before 2014: Gusinje, Petnjica, Tuzi and Zeta are not split off"],
 ["rs", "Serbia", "district", "Europe"],
 ["xk", "Kosovo", "district", "Europe"],
 ["ba", "Bosnia and Herzegovina", "canton or entity", "Europe"],
 ["hr", "Croatia", "county", "Europe"],
 ["si", "Slovenia", "statistical region", "Europe"],
 ["ua", "Ukraine", "oblast", "Europe"],
 ["by", "Belarus", "region", "Europe"],
 ["ie", "Ireland", "county", "Europe"],
 ["pt", "Portugal", "district", "Europe", "the 18 mainland districts (the Azores and Madeira not shown)"],
 ["is", "Iceland", "region", "Europe"],
 ["ad", "Andorra", "parish", "Europe"],
 ["sm", "San Marino", "castello", "Europe"],
 ["li", "Liechtenstein", "municipality", "Europe"],
 ["tr", "Turkey", "province", "Asia"],
 ["ge", "Georgia", "region", "Asia"],
 ["am", "Armenia", "province", "Asia"],
 ["ir", "Iran", "province", "Asia"],
 ["iq", "Iraq", "governorate", "Asia", "Halabja (2014) is still part of Sulaymaniyah here"],
 ["sy", "Syria", "governorate", "Asia"],
 ["lb", "Lebanon", "governorate", "Asia", "6 governorates: Akkar, Baalbek-Hermel and Keserwan-Jbeil are not split off"],
 ["il", "Israel", "district", "Asia"],
 ["jo", "Jordan", "governorate", "Asia"],
 ["sa", "Saudi Arabia", "province", "Asia"],
 ["ae", "United Arab Emirates", "emirate", "Asia"],
 ["om", "Oman", "governorate", "Asia"],
 ["qa", "Qatar", "municipality", "Asia", "7 municipalities: Al-Shahaniya (2014) is not split off"],
 ["kw", "Kuwait", "governorate", "Asia"],
 ["ye", "Yemen", "governorate", "Asia", "Socotra (2013) is still part of Hadhramaut here"],
 ["af", "Afghanistan", "province", "Asia"],
 ["pk", "Pakistan", "province or territory", "Asia"],
 ["bd", "Bangladesh", "division", "Asia", "7 divisions: Mymensingh (2015) is still part of Dhaka here"],
 ["bt", "Bhutan", "district", "Asia"],
 ["lk", "Sri Lanka", "province", "Asia"],
 ["mm", "Myanmar", "state or region", "Asia", "14 states and regions: Naypyidaw Union Territory is not split off"],
 ["th", "Thailand", "province", "Asia"],
 ["la", "Laos", "province", "Asia", "17 provinces: Xaisomboun (2013) is not split off"],
 ["kh", "Cambodia", "province", "Asia", "24 provinces: Tbong Khmum (2013) is still part of Kampong Cham"],
 ["vn", "Vietnam", "province or city", "Asia", "34 provinces and cities of 2025, built from the 63 older provinces"],
 ["my", "Malaysia", "state or federal territory", "Asia"],
 ["id", "Indonesia", "province", "Asia", "33 provinces: North Kalimantan (2012) and the four new Papuan provinces (2022) are not split off"],
 ["ph", "Philippines", "region", "Asia", "18 regions incl. Negros Island Region (2024); Bangsamoro drawn with the old ARMM outline"],
 ["bn", "Brunei", "district", "Asia"],
 ["tl", "Timor-Leste", "municipality", "Asia"],
 ["mn", "Mongolia", "province", "Asia"],
 ["kp", "North Korea", "province or city", "Asia"],
 ["kr", "South Korea", "province or city", "Asia"],
 ["tw", "Taiwan", "county or city", "Asia", "Lienchiang (Matsu Islands) is not in the data"],
 ["kz", "Kazakhstan", "region", "Asia", "regions before 2022: Abai, Jetisu, Ulytau and Shymkent are not split off"],
 ["uz", "Uzbekistan", "region", "Asia"],
 ["tm", "Turkmenistan", "province", "Asia", "Ashgabat city is drawn as part of Ahal"],
 ["kg", "Kyrgyzstan", "region", "Asia", "Osh city is drawn as part of Osh Region"],
 ["tj", "Tajikistan", "region", "Asia", "Dushanbe is drawn as part of the Districts of Republican Subordination"],
 ["eg", "Egypt", "governorate", "Africa"],
 ["ly", "Libya", "district", "Africa"],
 ["dz", "Algeria", "province", "Africa", "48 provinces: the 10 created in 2019 are not split off"],
 ["mr", "Mauritania", "region", "Africa", "13 regions: Nouakchott is one region here, not three (2014)"],
 ["ml", "Mali", "region", "Africa", "regions before 2016"],
 ["ne", "Niger", "region", "Africa"],
 ["td", "Chad", "province", "Africa", "22 provinces: Ennedi-Est and Ennedi-Ouest (2012) are one province here"],
 ["sd", "Sudan", "state", "Africa", "17 states: West Kordofan (2013) is not split off"],
 ["ss", "South Sudan", "state", "Africa"],
 ["et", "Ethiopia", "region", "Africa", "regions before 2020: Sidama, South West, South and Central Ethiopia are not split off"],
 ["er", "Eritrea", "region", "Africa"],
 ["dj", "Djibouti", "region", "Africa"],
 ["ug", "Uganda", "region", "Africa", "the 4 regions; the data has only pre-2010 districts"],
 ["tz", "Tanzania", "region", "Africa", "30 regions: Songwe (2016) is still part of Mbeya"],
 ["rw", "Rwanda", "province", "Africa"],
 ["cg", "Congo", "department", "Africa"],
 ["ga", "Gabon", "province", "Africa"],
 ["gq", "Equatorial Guinea", "province", "Africa", "7 provinces: Djibloho (2017) is not split off"],
 ["cm", "Cameroon", "region", "Africa"],
 ["cf", "Central African Republic", "prefecture", "Africa", "prefectures before 2020"],
 ["bj", "Benin", "department", "Africa"],
 ["tg", "Togo", "region", "Africa"],
 ["gh", "Ghana", "region", "Africa", "the 10 regions before 2019 (now 16)"],
 ["bf", "Burkina Faso", "region", "Africa", "the 13 regions before the 2025 reform"],
 ["lr", "Liberia", "county", "Africa"],
 ["sl", "Sierra Leone", "province", "Africa", "4 provinces: North West (2017) is still part of Northern"],
 ["gn", "Guinea", "region", "Africa"],
 ["gw", "Guinea-Bissau", "region", "Africa"],
 ["sn", "Senegal", "region", "Africa"],
 ["gm", "Gambia", "division", "Africa"],
 ["cv", "Cabo Verde", "municipality", "Africa"],
 ["ao", "Angola", "province", "Africa", "18 provinces: the 2024 split into 21 is not in the data"],
 ["zm", "Zambia", "province", "Africa"],
 ["zw", "Zimbabwe", "province", "Africa"],
 ["mw", "Malawi", "district", "Africa"],
 ["mz", "Mozambique", "province", "Africa"],
 ["na", "Namibia", "region", "Africa", "13 regions: Kavango East and West (2013) are one region here"],
 ["bw", "Botswana", "district or town", "Africa"],
 ["ls", "Lesotho", "district", "Africa"],
 ["sz", "Eswatini", "region", "Africa"],
 ["mg", "Madagascar", "region", "Africa", "22 regions: Vatovavy and Fitovinany (2021) are one region here"],
 ["mu", "Mauritius", "district", "Africa", "the 9 districts of the main island (Rodrigues and Agaléga not shown)"],
 ["km", "Comoros", "island", "Africa"],
 ["gt", "Guatemala", "department", "Americas"],
 ["bz", "Belize", "district", "Americas"],
 ["sv", "El Salvador", "department", "Americas"],
 ["hn", "Honduras", "department", "Americas"],
 ["ni", "Nicaragua", "department or autonomous region", "Americas"],
 ["cr", "Costa Rica", "province", "Americas"],
 ["pa", "Panama", "province or comarca", "Americas", "Panamá Oeste (2014) is still part of Panamá; Naso Tjër Di (2020) is not shown"],
 ["cu", "Cuba", "province", "Americas"],
 ["jm", "Jamaica", "parish", "Americas"],
 ["ht", "Haiti", "department", "Americas"],
 ["do", "Dominican Republic", "province", "Americas"],
 ["bs", "Bahamas", "district", "Americas"],
 ["tt", "Trinidad and Tobago", "region or municipality", "Americas"],
 ["bb", "Barbados", "parish", "Americas"],
 ["lc", "Saint Lucia", "quarter", "Americas"],
 ["dm", "Dominica", "parish", "Americas"],
 ["gd", "Grenada", "parish", "Americas"],
 ["vc", "Saint Vincent and the Grenadines", "parish", "Americas"],
 ["ag", "Antigua and Barbuda", "parish or dependency", "Americas"],
 ["kn", "Saint Kitts and Nevis", "parish", "Americas"],
 ["co", "Colombia", "department", "Americas"],
 ["ve", "Venezuela", "state", "Americas"],
 ["ec", "Ecuador", "province", "Americas"],
 ["pe", "Peru", "region", "Americas"],
 ["bo", "Bolivia", "department", "Americas"],
 ["py", "Paraguay", "department", "Americas"],
 ["uy", "Uruguay", "department", "Americas"],
 ["gy", "Guyana", "region", "Americas"],
 ["sr", "Suriname", "district", "Americas"],
 ["cl", "Chile", "region", "Americas"],
 ["nz", "New Zealand", "region", "Oceania"],
 ["pg", "Papua New Guinea", "province", "Oceania", "20 provinces: Hela and Jiwaka (2012) are not split off"],
 ["fj", "Fiji", "division", "Oceania"],
 ["sb", "Solomon Islands", "province", "Oceania"],
 ["vu", "Vanuatu", "province", "Oceania"],
 ["ws", "Samoa", "district", "Oceania"],
 ["nr", "Nauru", "district", "Oceania"]];
const CAPS={
 us:{"Alabama":"Montgomery","Alaska":"Juneau","Arizona":"Phoenix","Arkansas":"Little Rock","California":"Sacramento","Colorado":"Denver","Connecticut":"Hartford","Delaware":"Dover","Florida":"Tallahassee","Georgia":"Atlanta","Hawaii":"Honolulu","Idaho":"Boise","Illinois":"Springfield","Indiana":"Indianapolis","Iowa":"Des Moines","Kansas":"Topeka","Kentucky":"Frankfort","Louisiana":"Baton Rouge","Maine":"Augusta","Maryland":"Annapolis","Massachusetts":"Boston","Michigan":"Lansing","Minnesota":"Saint Paul","Mississippi":"Jackson","Missouri":"Jefferson City","Montana":"Helena","Nebraska":"Lincoln","Nevada":"Carson City","New Hampshire":"Concord","New Jersey":"Trenton","New Mexico":"Santa Fe","New York":"Albany","North Carolina":"Raleigh","North Dakota":"Bismarck","Ohio":"Columbus","Oklahoma":"Oklahoma City","Oregon":"Salem","Pennsylvania":"Harrisburg","Rhode Island":"Providence","South Carolina":"Columbia","South Dakota":"Pierre","Tennessee":"Nashville","Texas":"Austin","Utah":"Salt Lake City","Vermont":"Montpelier","Virginia":"Richmond","Washington":"Olympia","West Virginia":"Charleston","Wisconsin":"Madison","Wyoming":"Cheyenne"},
 ca:{"Alberta":"Edmonton","British Columbia":"Victoria","Manitoba":"Winnipeg","New Brunswick":"Fredericton","Newfoundland and Labrador":"St. John's","Nova Scotia":"Halifax","Ontario":"Toronto","Prince Edward Island":"Charlottetown","Quebec":"Quebec City","Saskatchewan":"Regina","Northwest Territories":"Yellowknife","Nunavut":"Iqaluit","Yukon":"Whitehorse"},
 mx:{"Aguascalientes":"Aguascalientes","Baja California":"Mexicali","Baja California Sur":"La Paz","Campeche":"Campeche","Chiapas":"Tuxtla Gutiérrez","Chihuahua":"Chihuahua","Coahuila":"Saltillo","Colima":"Colima","Durango":"Durango","Guanajuato":"Guanajuato","Guerrero":"Chilpancingo","Hidalgo":"Pachuca","Jalisco":"Guadalajara","Michoacán":"Morelia","Morelos":"Cuernavaca","Nayarit":"Tepic","Nuevo León":"Monterrey","Oaxaca":"Oaxaca","Puebla":"Puebla","Querétaro":"Querétaro","Quintana Roo":"Chetumal","San Luis Potosí":"San Luis Potosí","Sinaloa":"Culiacán","Sonora":"Hermosillo","State of Mexico":"Toluca","Tabasco":"Villahermosa","Tamaulipas":"Ciudad Victoria","Tlaxcala":"Tlaxcala","Veracruz":"Xalapa","Yucatán":"Mérida","Zacatecas":"Zacatecas"},
 br:{"Acre":"Rio Branco","Alagoas":"Maceió","Amapá":"Macapá","Amazonas":"Manaus","Bahia":"Salvador","Ceará":"Fortaleza","Espírito Santo":"Vitória","Goiás":"Goiânia","Maranhão":"São Luís","Mato Grosso":"Cuiabá","Mato Grosso do Sul":"Campo Grande","Minas Gerais":"Belo Horizonte","Paraná":"Curitiba","Paraíba":"João Pessoa","Pará":"Belém","Pernambuco":"Recife","Piauí":"Teresina","Rio Grande do Norte":"Natal","Rio Grande do Sul":"Porto Alegre","Rio de Janeiro":"Rio de Janeiro","Rondônia":"Porto Velho","Roraima":"Boa Vista","Santa Catarina":"Florianópolis","Sergipe":"Aracaju","São Paulo":"São Paulo","Tocantins":"Palmas"},
 ar:{"Buenos Aires":"La Plata","Catamarca":"San Fernando del Valle de Catamarca","Chaco":"Resistencia","Chubut":"Rawson","Corrientes":"Corrientes","Córdoba":"Córdoba","Entre Ríos":"Paraná","Formosa":"Formosa","Jujuy":"San Salvador de Jujuy","La Pampa":"Santa Rosa","La Rioja":"La Rioja","Mendoza":"Mendoza","Misiones":"Posadas","Neuquén":"Neuquén","Río Negro":"Viedma","Salta":"Salta","San Juan":"San Juan","San Luis":"San Luis","Santa Cruz":"Río Gallegos","Santa Fe":"Santa Fe","Santiago del Estero":"Santiago del Estero","Tierra del Fuego":"Ushuaia","Tucumán":"San Miguel de Tucumán"},
 fr:{"Auvergne-Rhône-Alpes":"Lyon","Bourgogne-Franche-Comté":"Dijon","Brittany":"Rennes","Centre-Val de Loire":"Orléans","Corsica":"Ajaccio","Grand Est":"Strasbourg","Hauts-de-France":"Lille","Normandy":"Rouen","Nouvelle-Aquitaine":"Bordeaux","Occitanie":"Toulouse","Pays de la Loire":"Nantes","Provence-Alpes-Côte-d'Azur":"Marseille","Île-de-France":"Paris"},
 de:{"Baden-Württemberg":"Stuttgart","Bavaria":"Munich","Brandenburg":"Potsdam","Free Hanseatic Bremen":"Bremen","Hesse":"Wiesbaden","Lower Saxony":"Hanover","Mecklenburg-Western Pomerania":"Schwerin","North Rhine-Westphalia":"Düsseldorf","Rhineland-Palatinate":"Mainz","Saarland":"Saarbrücken","Saxony":"Dresden","Saxony-Anhalt":"Magdeburg","Schleswig-Holstein":"Kiel","Thuringia":"Erfurt"},
 it:{"Abruzzo":"L'Aquila","Aosta Valley":"Aosta","Apulia":"Bari","Basilicata":"Potenza","Calabria":"Catanzaro","Campania":"Naples","Emilia-Romagna":"Bologna","Friuli-Venezia Giulia":"Trieste","Lazio":"Rome","Liguria":"Genoa","Lombardy":"Milan","Marche":"Ancona","Molise":"Campobasso","Piedmont":"Turin","Sardinia":"Cagliari","Sicily":"Palermo","Trentino-South Tyrol":"Trento","Tuscany":"Florence","Umbria":"Perugia","Veneto":"Venice"},
 es:{"Andalusia":"Seville","Aragon":"Zaragoza","Asturias":"Oviedo","Balearic Islands":"Palma","Basque Country":"Vitoria-Gasteiz","Cantabria":"Santander","Castile and León":"Valladolid","Castilla–La Mancha":"Toledo","Catalonia":"Barcelona","Community of Madrid":"Madrid","Extremadura":"Mérida","Galicia":"Santiago de Compostela","La Rioja":"Logroño","Murcia":"Murcia","Navarre":"Pamplona","Valencian Community":"Valencia"},
 ru:{"Altai Republic":"Gorno-Altaysk","Amur":"Blagoveshchensk","Arkhangelsk":"Arkhangelsk","Astrakhan":"Astrakhan","Bashkortostan":"Ufa","Belgorod":"Belgorod","Bryansk":"Bryansk","Chechen Republic":"Grozny","Chelyabinsk":"Chelyabinsk","Chukotka Autonomous Okrug":"Anadyr","Chuvash Republic":"Cheboksary","Irkutsk":"Irkutsk","Ivanovo":"Ivanovo","Jewish Autonomous Oblast":"Birobidzhan","Kabardino-Balkaria":"Nalchik","Kaliningrad":"Kaliningrad","Kaluga":"Kaluga","Kamchatka Krai":"Petropavlovsk-Kamchatsky","Karachay-Cherkess Republic":"Cherkessk","Karelia":"Petrozavodsk","Kemerovo":"Kemerovo","Khabarovsk Krai":"Khabarovsk","Khanty-Mansi Autonomous Okrug":"Khanty-Mansiysk","Kirov":"Kirov","Komi Republic":"Syktyvkar","Kostroma":"Kostroma","Krasnodar Krai":"Krasnodar","Krasnoyarsk Krai":"Krasnoyarsk","Kurgan":"Kurgan","Kursk":"Kursk","Lipetsk":"Lipetsk","Magadan":"Magadan","Mari El Republic":"Yoshkar-Ola","Murmansk":"Murmansk","Nenets Autonomous Okrug":"Naryan-Mar","Nizhny Novgorod":"Nizhny Novgorod","Novgorod":"Veliky Novgorod","Novosibirsk":"Novosibirsk","Omsk":"Omsk","Orenburg":"Orenburg","Oryol":"Oryol","Penza":"Penza","Perm Krai":"Perm","Primorsky Krai":"Vladivostok","Pskov":"Pskov","Republic of Adygea":"Maykop","Republic of Buryatia":"Ulan-Ude","Republic of Dagestan":"Makhachkala","Republic of Ingushetia":"Magas","Republic of Kalmykia":"Elista","Republic of Khakassia":"Abakan","Republic of Mordovia":"Saransk","Republic of North Ossetia-Alania":"Vladikavkaz","Republic of Tatarstan":"Kazan","Rostov":"Rostov-on-Don","Ryazan":"Ryazan","Sakha Republic":"Yakutsk","Sakhalin":"Yuzhno-Sakhalinsk","Samara":"Samara","Saratov":"Saratov","Smolensk":"Smolensk","Stavropol Krai":"Stavropol","Sverdlovsk":"Yekaterinburg","Tambov":"Tambov","Tomsk":"Tomsk","Tula":"Tula","Tuva Republic":"Kyzyl","Tver":"Tver","Tyumen":"Tyumen","Udmurt Republic":"Izhevsk","Ulyanovsk":"Ulyanovsk","Vladimir":"Vladimir","Volgograd":"Volgograd","Vologda":"Vologda","Voronezh":"Voronezh","Yamalo-Nenets Autonomous Okrug":"Salekhard","Yaroslavl":"Yaroslavl","Zabaykalsky Krai":"Chita"},
 cn:{"Anhui":"Hefei","Fujian":"Fuzhou","Gansu":"Lanzhou","Guangdong":"Guangzhou","Guangxi":"Nanning","Guizhou":"Guiyang","Hainan":"Haikou","Hebei":"Shijiazhuang","Heilongjiang":"Harbin","Henan":"Zhengzhou","Hubei":"Wuhan","Hunan":"Changsha","Inner Mongolia":"Hohhot","Jiangsu":"Nanjing","Jiangxi":"Nanchang","Jilin":"Changchun","Liaoning":"Shenyang","Ningxia":"Yinchuan","Qinghai":"Xining","Shaanxi":"Xi'an","Shandong":"Jinan","Shanxi":"Taiyuan","Sichuan":"Chengdu","Tibet":"Lhasa","Xinjiang":"Ürümqi","Yunnan":"Kunming","Zhejiang":"Hangzhou"},
 in:{"Andaman and Nicobar Islands":"Port Blair","Andhra Pradesh":"Amaravati","Arunachal Pradesh":"Itanagar","Assam":"Dispur","Bihar":"Patna","Chhattisgarh":"Raipur","Dadra and Nagar Haveli and Daman and Diu":"Daman","Goa":"Panaji","Gujarat":"Gandhinagar","Haryana":"Chandigarh","Himachal Pradesh":"Shimla","Jharkhand":"Ranchi","Karnataka":"Bengaluru","Kerala":"Thiruvananthapuram","Ladakh":"Leh","Lakshadweep":"Kavaratti","Madhya Pradesh":"Bhopal","Maharashtra":"Mumbai","Manipur":"Imphal","Meghalaya":"Shillong","Mizoram":"Aizawl","Nagaland":"Kohima","Odisha":"Bhubaneswar","Punjab":"Chandigarh","Rajasthan":"Jaipur","Sikkim":"Gangtok","Tamil Nadu":"Chennai","Telangana":"Hyderabad","Tripura":"Agartala","Uttar Pradesh":"Lucknow","Uttarakhand":"Dehradun","West Bengal":"Kolkata"},
 jp:{"Aichi":"Nagoya","Akita":"Akita","Aomori":"Aomori","Chiba":"Chiba","Ehime":"Matsuyama","Fukui":"Fukui","Fukuoka":"Fukuoka","Fukushima":"Fukushima","Gifu":"Gifu","Gunma":"Maebashi","Hiroshima":"Hiroshima","Hokkaidō":"Sapporo","Hyōgo":"Kobe","Ibaraki":"Mito","Ishikawa":"Kanazawa","Iwate":"Morioka","Kagawa":"Takamatsu","Kagoshima":"Kagoshima","Kanagawa":"Yokohama","Kumamoto":"Kumamoto","Kyōto":"Kyoto","Kōchi":"Kōchi","Mie":"Tsu","Miyagi":"Sendai","Miyazaki":"Miyazaki","Nagano":"Nagano","Nagasaki":"Nagasaki","Nara":"Nara","Niigata":"Niigata","Okayama":"Okayama","Okinawa":"Naha","Saga":"Saga","Saitama":"Saitama","Shiga":"Ōtsu","Shimane":"Matsue","Shizuoka":"Shizuoka","Tochigi":"Utsunomiya","Tokushima":"Tokushima","Tottori":"Tottori","Toyama":"Toyama","Wakayama":"Wakayama","Yamagata":"Yamagata","Yamaguchi":"Yamaguchi","Yamanashi":"Kōfu","Ōita":"Ōita","Ōsaka":"Osaka"},
 au:{"New South Wales":"Sydney","Victoria":"Melbourne","Queensland":"Brisbane","Western Australia":"Perth","South Australia":"Adelaide","Tasmania":"Hobart","Northern Territory":"Darwin","Australian Capital Territory":"Canberra"},
 za:{"Eastern Cape":"Bhisho","Free State":"Bloemfontein","Gauteng":"Johannesburg","KwaZulu-Natal":"Pietermaritzburg","Limpopo":"Polokwane","Mpumalanga":"Mbombela","North West":"Mahikeng","Northern Cape":"Kimberley","Western Cape":"Cape Town"},
 ng:{"Abia":"Umuahia","Adamawa":"Yola","Akwa Ibom":"Uyo","Anambra":"Awka","Bauchi":"Bauchi","Bayelsa":"Yenagoa","Benue":"Makurdi","Borno":"Maiduguri","Cross River":"Calabar","Delta":"Asaba","Ebonyi":"Abakaliki","Edo":"Benin City","Ekiti":"Ado Ekiti","Enugu":"Enugu","Gombe":"Gombe","Imo":"Owerri","Jigawa":"Dutse","Kaduna":"Kaduna","Kano":"Kano","Katsina":"Katsina","Kebbi":"Birnin Kebbi","Kogi":"Lokoja","Kwara":"Ilorin","Lagos":"Ikeja","Nasarawa":"Lafia","Niger":"Minna","Ogun":"Abeokuta","Ondo":"Akure","Osun":"Osogbo","Oyo":"Ibadan","Plateau":"Jos","Rivers":"Port Harcourt","Sokoto":"Sokoto","Taraba":"Jalingo","Yobe":"Damaturu","Zamfara":"Gusau"},
 at:{"Upper Austria":"Linz","Burgenland":"Eisenstadt","Vorarlberg":"Bregenz","Tyrol":"Innsbruck","Salzburg":"Salzburg","Carinthia":"Klagenfurt","Styria":"Graz","Vienna":"Vienna","Lower Austria":"St. Pölten"},
 ch:{"Valais":"Sion","Ticino":"Bellinzona","Graubünden":"Chur","Schaffhausen":"Schaffhausen","Thurgau":"Frauenfeld","Zürich":"Zürich","Aargau":"Aarau","Basel-Stadt":"Basel","Basel-Landschaft":"Liestal","St. Gallen":"St. Gallen","Solothurn":"Solothurn","Jura":"Delémont","Geneva":"Geneva","Vaud":"Lausanne","Neuchâtel":"Neuchâtel","Bern":"Bern","Lucerne":"Lucerne","Zug":"Zug","Uri":"Altdorf","Schwyz":"Schwyz","Glarus":"Glarus","Nidwalden":"Stans","Fribourg":"Fribourg","Obwalden":"Sarnen","Appenzell Ausserrhoden":"Herisau","Appenzell Innerrhoden":"Appenzell"},
 be:{"West Flanders":"Bruges","Hainaut":"Mons","Namur":"Namur","Luxembourg":"Arlon","Liège":"Liège","East Flanders":"Ghent","Antwerp":"Antwerp","Limburg":"Hasselt","Brussels-Capital Region":"Brussels","Flemish Brabant":"Leuven","Walloon Brabant":"Wavre"},
 nl:{"Groningen":"Groningen","Drenthe":"Assen","Overijssel":"Zwolle","Gelderland":"Arnhem","Limburg":"Maastricht","Zeeland":"Middelburg","North Brabant":"'s-Hertogenbosch","South Holland":"The Hague","North Holland":"Haarlem","Friesland":"Leeuwarden","Utrecht":"Utrecht","Flevoland":"Lelystad"},
 dk:{"Capital Region":"Hillerød","Zealand":"Sorø","Southern Denmark":"Vejle","Central Denmark":"Viborg","North Denmark":"Aalborg"},
 no:{"Oslo":"Oslo","Rogaland":"Stavanger","Møre og Romsdal":"Molde","Nordland":"Bodø","Østfold":"Sarpsborg","Buskerud":"Drammen","Innlandet":"Hamar","Vestfold":"Tønsberg","Telemark":"Skien","Agder":"Kristiansand","Vestland":"Bergen","Trøndelag":"Steinkjer","Troms":"Tromsø","Finnmark":"Vadsø"},
 se:{"Norrbotten":"Luleå","Västerbotten":"Umeå","Jämtland":"Östersund","Dalarna":"Falun","Värmland":"Karlstad","Västernorrland":"Härnösand","Gävleborg":"Gävle","Uppsala":"Uppsala","Stockholm":"Stockholm","Södermanland":"Nyköping","Östergötland":"Linköping","Kalmar":"Kalmar","Blekinge":"Karlskrona","Halland":"Halmstad","Gotland":"Visby","Västmanland":"Västerås","Jönköping":"Jönköping","Örebro":"Örebro","Kronoberg":"Växjö","Västra Götaland":"Gothenburg","Skåne":"Malmö"},
 fi:{"Åland":"Mariehamn","Lapland":"Rovaniemi","North Ostrobothnia":"Oulu","Kymenlaakso":"Kouvola","Uusimaa":"Helsinki","Southwest Finland":"Turku","Ostrobothnia":"Vaasa","North Savo":"Kuopio","South Savo":"Mikkeli","Central Finland":"Jyväskylä","Kanta-Häme":"Hämeenlinna","Kainuu":"Kajaani","North Karelia":"Joensuu","South Karelia":"Lappeenranta","Satakunta":"Pori","Central Ostrobothnia":"Kokkola","South Ostrobothnia":"Seinäjoki","Pirkanmaa":"Tampere","Päijät-Häme":"Lahti"},
 ee:{"Viljandi":"Viljandi","Pärnu":"Pärnu","Tartu":"Tartu","Lääne":"Haapsalu","Harju":"Tallinn","Valga":"Valga","Võru":"Võru","Ida-Viru":"Jõhvi","Põlva":"Põlva","Jõgeva":"Jõgeva","Lääne-Viru":"Rakvere","Saare":"Kuressaare","Hiiu":"Kärdla","Rapla":"Rapla","Järva":"Paide"},
 lt:{"Vilnius":"Vilnius","Panevėžys":"Panevėžys","Klaipėda":"Klaipėda","Šiauliai":"Šiauliai","Kaunas":"Kaunas","Utena":"Utena","Alytus":"Alytus","Telšiai":"Telšiai","Marijampolė":"Marijampolė","Tauragė":"Tauragė"},
 pl:{"Silesian":"Katowice","Lesser Poland":"Kraków","Subcarpathian":"Rzeszów","Lower Silesian":"Wrocław","Opole":"Opole","Podlaskie":"Białystok","Lubusz":"Zielona Góra","West Pomeranian":"Szczecin","Lublin":"Lublin","Pomeranian":"Gdańsk","Masovian":"Warsaw","Łódź":"Łódź","Kuyavian-Pomeranian":"Bydgoszcz","Greater Poland":"Poznań","Świętokrzyskie":"Kielce","Warmian-Masurian":"Olsztyn"},
 cz:{"Ústí nad Labem":"Ústí nad Labem","Liberec":"Liberec","Plzeň":"Plzeň","South Bohemia":"České Budějovice","Hradec Králové":"Hradec Králové","Olomouc":"Olomouc","Pardubice":"Pardubice","Moravia-Silesia":"Ostrava","South Moravia":"Brno","Vysočina":"Jihlava","Prague":"Prague","Karlovy Vary":"Karlovy Vary","Zlín":"Zlín","Central Bohemia":"Prague"},
 sk:{"Žilina":"Žilina","Prešov":"Prešov","Košice":"Košice","Bratislava":"Bratislava","Trnava":"Trnava","Banská Bystrica":"Banská Bystrica","Trenčín":"Trenčín","Nitra":"Nitra"},
 hu:{"Pest":"Budapest","Fejér":"Székesfehérvár","Komárom-Esztergom":"Tatabánya","Veszprém":"Veszprém","Csongrád-Csanád":"Szeged","Bács-Kiskun":"Kecskemét","Békés":"Békéscsaba","Jász-Nagykun-Szolnok":"Szolnok","Hajdú-Bihar":"Debrecen","Szabolcs-Szatmár-Bereg":"Nyíregyháza","Nógrád":"Salgótarján","Heves":"Eger","Borsod-Abaúj-Zemplén":"Miskolc","Somogy":"Kaposvár","Baranya":"Pécs","Tolna":"Szekszárd","Győr-Moson-Sopron":"Győr","Vas":"Szombathely","Zala":"Zalaegerszeg"},
 ro:{"Satu Mare":"Satu Mare","Arad":"Arad","Bihor":"Oradea","Timiș":"Timișoara","Mehedinți":"Drobeta-Turnu Severin","Dolj":"Craiova","Călărași":"Călărași","Teleorman":"Alexandria","Giurgiu":"Giurgiu","Constanța":"Constanța","Olt":"Slatina","Caraș-Severin":"Reșița","Botoșani":"Botoșani","Iași":"Iași","Vaslui":"Vaslui","Galați":"Galați","Suceava":"Suceava","Maramureș":"Baia Mare","Tulcea":"Tulcea","Cluj":"Cluj-Napoca","Bistrița-Năsăud":"Bistrița","Sălaj":"Zalău","Dâmbovița":"Târgoviște","Argeș":"Pitești","Gorj":"Târgu Jiu","Hunedoara":"Deva","Vâlcea":"Râmnicu Vâlcea","Prahova":"Ploiești","Covasna":"Sfântu Gheorghe","Vrancea":"Focșani","Buzău":"Buzău","Brașov":"Brașov","Sibiu":"Sibiu","Mureș":"Târgu Mureș","Harghita":"Miercurea Ciuc","Neamț":"Piatra Neamț","Bacău":"Bacău","Alba":"Alba Iulia","Brăila":"Brăila","Ialomița":"Slobozia","Ilfov":"Buftea"},
 bg:{"Sofia City":"Sofia","Sofia Province":"Sofia","Burgas":"Burgas","Haskovo":"Haskovo","Pernik":"Pernik","Montana":"Montana","Kyustendil":"Kyustendil","Ruse":"Ruse","Dobrich":"Dobrich","Vratsa":"Vratsa","Pleven":"Pleven","Varna":"Varna","Plovdiv":"Plovdiv","Stara Zagora":"Stara Zagora","Sliven":"Sliven","Shumen":"Shumen","Razgrad":"Razgrad","Lovech":"Lovech","Yambol":"Yambol","Vidin":"Vidin","Blagoevgrad":"Blagoevgrad","Silistra":"Silistra","Veliko Tarnovo":"Veliko Tarnovo","Kardzhali":"Kardzhali","Smolyan":"Smolyan","Targovishte":"Targovishte","Gabrovo":"Gabrovo","Pazardzhik":"Pazardzhik"},
 gr:{"Epirus":"Ioannina","Attica":"Athens","South Aegean":"Ermoupoli","Ionian Islands":"Corfu","Central Macedonia":"Thessaloniki","Eastern Macedonia and Thrace":"Komotini","Thessaly":"Larissa","Central Greece":"Lamia","Peloponnese":"Tripoli","Western Greece":"Patras","Crete":"Heraklion","North Aegean":"Mytilene","Western Macedonia":"Kozani","Mount Athos":"Karyes"},
 al:{"Tirana":"Tirana","Dibër":"Peshkopi","Kukës":"Kukës","Korçë":"Korçë","Elbasan":"Elbasan","Gjirokastër":"Gjirokastër","Vlorë":"Vlorë","Shkodër":"Shkodër","Fier":"Fier","Durrës":"Durrës","Lezhë":"Lezhë","Berat":"Berat"},
 rs:{"North Bačka":"Subotica","West Bačka":"Sombor","North Banat":"Kikinda","Pčinja":"Vranje","Bor":"Bor","Zaječar":"Zaječar","Pirot":"Pirot","Jablanica":"Leskovac","Raška":"Kraljevo","Rasina":"Kruševac","Toplica":"Prokuplje","Zlatibor":"Užice","Srem":"Sremska Mitrovica","Mačva":"Šabac","South Bačka":"Novi Sad","Central Banat":"Zrenjanin","South Banat":"Pančevo","Braničevo":"Požarevac","Podunavlje":"Smederevo","Nišava":"Niš","Pomoravlje":"Jagodina","Šumadija":"Kragujevac","Moravica":"Čačak","Kolubara":"Valjevo"},
 xk:{"Gjilan":"Gjilan","Mitrovica":"Mitrovica","Peja":"Peja","Pristina":"Pristina","Prizren":"Prizren","Ferizaj":"Ferizaj","Gjakova":"Gjakova"},
 ba:{"Republika Srpska":"Banja Luka","Brčko District":"Brčko","Una-Sana Canton":"Bihać","Posavina Canton":"Orašje","Tuzla Canton":"Tuzla","Zenica-Doboj Canton":"Zenica","Bosnian Podrinje Canton":"Goražde","Central Bosnia Canton":"Travnik","Herzegovina-Neretva Canton":"Mostar","West Herzegovina Canton":"Široki Brijeg","Sarajevo Canton":"Sarajevo","Canton 10":"Livno"},
 hr:{"Osijek-Baranja":"Osijek","Dubrovnik-Neretva":"Dubrovnik","Brod-Posavina":"Slavonski Brod","Karlovac":"Karlovac","Zadar":"Zadar","Split-Dalmatia":"Split","Primorje-Gorski Kotar":"Rijeka","Šibenik-Knin":"Šibenik","Međimurje":"Čakovec","Virovitica-Podravina":"Virovitica","Koprivnica-Križevci":"Koprivnica","Istria":"Pazin","Sisak-Moslavina":"Sisak","Vukovar-Syrmia":"Vukovar","Varaždin":"Varaždin","Krapina-Zagorje":"Krapina","Zagreb County":"Zagreb","Lika-Senj":"Gospić","Bjelovar-Bilogora":"Bjelovar","Požega-Slavonia":"Požega"},
 ua:{"Crimea":"Simferopol","Chernihiv":"Chernihiv","Volyn":"Lutsk","Rivne":"Rivne","Zhytomyr":"Zhytomyr","Zakarpattia":"Uzhhorod","Chernivtsi":"Chernivtsi","Ivano-Frankivsk":"Ivano-Frankivsk","Odesa":"Odesa","Vinnytsia":"Vinnytsia","Lviv":"Lviv","Sumy":"Sumy","Kharkiv":"Kharkiv","Luhansk":"Luhansk","Donetsk":"Donetsk","Kherson":"Kherson","Zaporizhzhia":"Zaporizhzhia","Mykolaiv":"Mykolaiv","Poltava":"Poltava","Khmelnytskyi":"Khmelnytskyi","Ternopil":"Ternopil","Dnipropetrovsk":"Dnipro","Cherkasy":"Cherkasy","Kirovohrad":"Kirovohrad","Kyiv Oblast":"Kyiv"},
 by:{"Minsk Region":"Minsk","Gomel":"Gomel","Brest":"Brest","Vitebsk":"Vitebsk","Grodno":"Grodno","Mogilev":"Mogilev"},
 ie:{"Dublin":"Dublin","Cork":"Cork","Galway":"Galway","Limerick":"Limerick","Waterford":"Waterford","Kerry":"Tralee","Clare":"Ennis","Mayo":"Castlebar","Sligo":"Sligo","Donegal":"Lifford","Leitrim":"Carrick-on-Shannon","Roscommon":"Roscommon","Longford":"Longford","Westmeath":"Mullingar","Offaly":"Tullamore","Laois":"Portlaoise","Kildare":"Naas","Meath":"Navan","Louth":"Dundalk","Monaghan":"Monaghan","Cavan":"Cavan","Wicklow":"Wicklow","Wexford":"Wexford","Carlow":"Carlow","Kilkenny":"Kilkenny"},
 pt:{"Évora":"Évora","Portalegre":"Portalegre","Castelo Branco":"Castelo Branco","Guarda":"Guarda","Bragança":"Bragança","Vila Real":"Vila Real","Braga":"Braga","Faro":"Faro","Beja":"Beja","Setúbal":"Setúbal","Lisbon":"Lisbon","Santarém":"Santarém","Leiria":"Leiria","Coimbra":"Coimbra","Aveiro":"Aveiro","Porto":"Porto","Viseu":"Viseu","Viana do Castelo":"Viana do Castelo"},
 tr:{"Artvin":"Artvin","Hakkâri":"Hakkâri","Ağrı":"Ağrı","Van":"Van","Kırklareli":"Kırklareli","Edirne":"Edirne","Kars":"Kars","Mardin":"Mardin","Şanlıurfa":"Şanlıurfa","Kilis":"Kilis","Gaziantep":"Gaziantep","Hatay":"Antakya","Istanbul":"Istanbul","Tekirdağ":"Tekirdağ","Çanakkale":"Çanakkale","Rize":"Rize","Trabzon":"Trabzon","Giresun":"Giresun","Ordu":"Ordu","Samsun":"Samsun","Sinop":"Sinop","Kastamonu":"Kastamonu","Zonguldak":"Zonguldak","Sakarya":"Sakarya","Kocaeli":"İzmit","Bursa":"Bursa","Balıkesir":"Balıkesir","İzmir":"İzmir","Aydın":"Aydın","Muğla":"Muğla","Antalya":"Antalya","Mersin":"Mersin","Adana":"Adana","Bolu":"Bolu","Ankara":"Ankara","Bilecik":"Bilecik","Eskişehir":"Eskişehir","Çankırı":"Çankırı","Tokat":"Tokat","Sivas":"Sivas","Çorum":"Çorum","Amasya":"Amasya","Kütahya":"Kütahya","Konya":"Konya","Karaman":"Karaman","Niğde":"Niğde","Kayseri":"Kayseri","Isparta":"Isparta","Manisa":"Manisa","Denizli":"Denizli","Burdur":"Burdur","Nevşehir":"Nevşehir","Yozgat":"Yozgat","Kırşehir":"Kırşehir","Uşak":"Uşak","Erzincan":"Erzincan","Tunceli":"Tunceli","Afyonkarahisar":"Afyonkarahisar","Kahramanmaraş":"Kahramanmaraş","Muş":"Muş","Erzurum":"Erzurum","Malatya":"Malatya","Elazığ":"Elazığ","Bitlis":"Bitlis","Bingöl":"Bingöl","Adıyaman":"Adıyaman","Diyarbakır":"Diyarbakır","Batman":"Batman","Siirt":"Siirt","Gümüşhane":"Gümüşhane","Ardahan":"Ardahan","Şırnak":"Şırnak","Iğdır":"Iğdır","Bartın":"Bartın","Düzce":"Düzce","Yalova":"Yalova","Karabük":"Karabük","Aksaray":"Aksaray","Kırıkkale":"Kırıkkale","Osmaniye":"Osmaniye","Bayburt":"Bayburt"},
 ge:{"Shida Kartli":"Gori","Abkhazia":"Sukhumi","Samegrelo-Zemo Svaneti":"Zugdidi","Racha-Lechkhumi and Kvemo Svaneti":"Ambrolauri","Mtskheta-Mtianeti":"Mtskheta","Kakheti":"Telavi","Samtskhe–Javakheti":"Akhaltsikhe","Adjara":"Batumi","Kvemo Kartli":"Rustavi","Guria":"Ozurgeti","Imereti":"Kutaisi"},
 am:{"Tavush":"Ijevan","Shirak":"Gyumri","Gegharkunik":"Gavar","Vayots Dzor":"Yeghegnadzor","Ararat":"Artashat","Aragatsotn":"Ashtarak","Lori":"Vanadzor","Syunik":"Kapan","Armavir":"Armavir","Kotayk":"Hrazdan"},
 ir:{"West Azerbaijan":"Urmia","East Azerbaijan":"Tabriz","Ardabil":"Ardabil","Gilan":"Rasht","Kurdistan":"Sanandaj","Kermanshah":"Kermanshah","Ilam":"Ilam","Khuzestan":"Ahvaz","North Khorasan":"Bojnurd","Golestan":"Gorgan","Razavi Khorasan":"Mashhad","South Khorasan":"Birjand","Sistan and Baluchestan":"Zahedan","Bushehr":"Bushehr","Hormozgan":"Bandar Abbas","Mazandaran":"Sari","Semnan":"Semnan","Zanjan":"Zanjan","Qazvin":"Qazvin","Markazi":"Arak","Isfahan":"Isfahan","Chaharmahal and Bakhtiari":"Shahrekord","Kohgiluyeh and Boyer-Ahmad":"Yasuj","Fars":"Shiraz","Kerman":"Kerman","Hamadan":"Hamadan","Lorestan":"Khorramabad","Yazd":"Yazd","Qom":"Qom","Tehran":"Tehran","Alborz":"Karaj"},
 iq:{"Duhok":"Duhok","Erbil":"Erbil","Basra":"Basra","Al Muthanna":"As Samawah","Sulaymaniyah":"Sulaymaniyah","Diyala":"Baqubah","Wasit":"Al Kut","Maysan":"Al Amarah","Al Anbar":"Ar Ramadi","Najaf":"Najaf","Nineveh":"Mosul","Saladin":"Tikrit","Kirkuk":"Kirkuk","Baghdad":"Baghdad","Babylon":"Al Hillah","Al-Qādisiyyah":"Ad Diwaniyah","Dhi Qar":"An Nasiriyah","Karbala":"Karbala"},
 sy:{"Tartus":"Tartus","Al-Hasakah":"Al Hasakah","Al-Raqqah":"Ar Raqqah","Idlib":"Idlib","Latakia":"Latakia","As-Suwayda":"As Suwayda","Daraa":"Dar'a","Deir ez-Zor":"Dayr az Zawr","Hama":"Hamah","Damascus":"Damascus","Homs":"Homs","Aleppo":"Aleppo"},
 lb:{"Nabatieh":"Nabatieh","South":"Sidon","Beqaa":"Zahlé","North":"Tripoli","Mount Lebanon":"Baabda","Beirut":"Beirut"},
 il:{"Jerusalem District":"Jerusalem","Haifa District":"Haifa","Tel Aviv District":"Tel Aviv","Central":"Ramla","Northern":"Nazareth","Southern":"Beersheba"},
 jo:{"Irbid":"Irbid","Karak":"Al Karak","Tafilah":"At Tafilah","Aqaba":"Al Aqabah","Balqa":"As Salt","Mafraq":"Al Mafraq","Ma'an":"Ma'an","Amman":"Amman","Zarqa":"Az Zarqa","Madaba":"Madaba","Ajloun":"Ajloun","Jerash":"Jerash"},
 sa:{"Eastern Province":"Dammam","Northern Borders":"Arar","Najran":"Najran","'Asir":"Abha","Jazan":"Jazan","Tabuk":"Tabuk","Al Madinah":"Medina","Riyadh":"Riyadh","Al-Qassim":"Buraydah","Ha'il":"Ha'il","Makkah":"Mecca","Al-Baha":"Al-Baha","Al-Jawf":"Sakakah"},
 ae:{"Fujairah":"Fujairah","Sharjah":"Sharjah","Ras Al Khaimah":"Ras Al Khaimah","Dubai":"Dubai","Abu Dhabi":"Abu Dhabi","Umm Al Quwain":"Umm Al Quwain"},
 om:{"Muscat":"Muscat","Musandam":"Khasab","North Al Batinah":"Sohar","Al Buraimi":"Al Buraimi","Ad Dhahirah":"Ibri","Dhofar":"Salalah","Al Wusta":"Haima","South Ash Sharqiyah":"Sur","North Ash Sharqiyah":"Ibra","South Al Batinah":"Rustaq","Ad Dakhiliyah":"Nizwa"},
 kw:{"Al Jahra":"Al Jahra","Al Ahmadi":"Al Ahmadi","Hawally":"Hawalli","Capital":"Kuwait City"},
 ye:{"Hadhramaut":"Al Mukalla","Sa'dah":"Sa'dah","Hajjah":"Hajjah","Al Hudaydah":"Al Hudaydah","Ta'izz":"Ta'izz","Lahij":"Lahij","'Adan":"Aden","Shabwah":"'Ataq","Ma'rib":"Marib","Al Bayda'":"Al Bayda","Ibb":"Ibb","Dhamar":"Dhamar","Al Mahrah":"Al Ghaydah","Al Jawf":"Al Hazm","Abyan":"Zinjibar","'Amran":"Amran","Al Mahwit":"Al Mahwit"},
 af:{"Badakhshan":"Feyzabad","Takhar":"Taloqan","Kunduz":"Kunduz","Balkh":"Mazar-i-Sharif","Jowzjan":"Sheberghan","Faryab":"Meymaneh","Badghis":"Qala-i-Naw","Herat":"Herat","Nimruz":"Zaranj","Farah":"Farah","Kunar":"Asadabad","Nangarhar":"Jalalabad","Paktia":"Gardiz","Paktika":"Sharana","Zabul":"Qalat","Kandahar":"Kandahar","Helmand":"Lashkar Gah","Urozgan":"Tarin Kowt","Ghazni":"Ghazni","Kabul":"Kabul","Laghman":"Mehtar Lam","Logar":"Pul-i-Alam","Kapisa":"Mahmud-i-Raqi","Maidan Wardak":"Mayda Shahr","Bamyan":"Bamyan","Parwan":"Charikar","Ghōr":"Chaghcharan","Baghlan":"Baghlan","Samangan":"Aybak","Nuristan":"Parun","Khost":"Khost","Panjshir":"Bazarak","Sar-e Pol":"Sar-e Pol","Daykundi":"Nili"},
 pk:{"Punjab":"Lahore","Sindh":"Karachi","Khyber Pakhtunkhwa":"Peshawar","Balochistan":"Quetta","Islamabad Capital Territory":"Islamabad","Gilgit-Baltistan":"Gilgit","Azad Kashmir":"Muzaffarabad"},
 bd:{"Chattogram":"Chattogram","Sylhet":"Sylhet","Dhaka":"Dhaka","Rajshahi":"Rajshahi","Khulna":"Khulna","Barishal":"Barishal","Rangpur":"Rangpur"},
 bt:{"Thimphu":"Thimphu","Paro":"Paro","Wangdue Phodrang":"Wangdue Phodrang","Punakha":"Punakha","Trashiyangtse":"Trashiyangtse","Lhuntse":"Lhuntse","Bumthang":"Jakar","Haa":"Haa","Samtse":"Samtse","Zhemgang":"Zhemgang","Samdrup Jongkhar":"Samdrup Jongkhar","Trashigang":"Trashigang","Gasa":"Gasa","Tsirang":"Damphu","Mongar":"Mongar","Trongsa":"Trongsa","Pemagatshel":"Pemagatshel"},
 lk:{"Western":"Colombo","Central":"Kandy","Southern":"Galle","Northern":"Jaffna","Eastern":"Trincomalee","North Western":"Kurunegala","North Central":"Anuradhapura","Uva":"Badulla","Sabaragamuwa":"Ratnapura"},
 mm:{"Rakhine":"Sittwe","Chin":"Hakha","Kachin":"Myitkyina","Sagaing":"Sagaing","Shan":"Taunggyi","Kayah":"Loikaw","Kayin":"Pa-an","Mon":"Mawlamyine","Tanintharyi":"Dawei","Ayeyarwady":"Pathein","Yangon":"Yangon","Bago":"Bago","Magway":"Magway","Mandalay":"Mandalay"},
 th:{"Surin":"Surin","Si Sa Ket":"Sisaket","Ubon Ratchathani":"Ubon Ratchathani","Buri Ram":"Buriram","Trat":"Trat","Chanthaburi":"Chanthaburi","Satun":"Satun","Songkhla":"Songkhla","Yala":"Yala","Narathiwat":"Narathiwat","Chiang Rai":"Chiang Rai","Chiang Mai":"Chiang Mai","Mae Hong Son":"Mae Hong Son","Tak":"Tak","Kanchanaburi":"Kanchanaburi","Prachuap Khiri Khan":"Prachuap Khiri Khan","Phetchaburi":"Phetchaburi","Ratchaburi":"Ratchaburi","Chumphon":"Chumphon","Ranong":"Ranong","Phayao":"Phayao","Nan":"Nan","Uttaradit":"Uttaradit","Phitsanulok":"Phitsanulok","Loei":"Loei","Nong Khai":"Nong Khai","Nakhon Phanom":"Nakhon Phanom","Phang Nga":"Phangnga","Krabi":"Krabi","Trang":"Trang","Pattani":"Pattani","Phatthalung":"Phatthalung","Nakhon Si Thammarat":"Nakhon Si Thammarat","Surat Thani":"Surat Thani","Samut Songkhram":"Samut Songkhram","Samut Sakhon":"Samut Sakhon","Bangkok":"Bangkok","Samut Prakan":"Samut Prakan","Chachoengsao":"Chachoengsao","Chon Buri":"Chon Buri","Rayong":"Rayong","Phuket":"Phuket","Khon Kaen":"Khon Kaen","Sakon Nakhon":"Sakon Nakhon","Suphan Buri":"Suphan Buri","Sing Buri":"Sing Buri","Chai Nat":"Chainat","Ang Thong":"Ang Thong","Saraburi":"Saraburi","Nakhon Ratchasima":"Nakhon Ratchasima","Nakhon Nayok":"Nakhon Nayok","Pathum Thani":"Pathum Thani","Uthai Thani":"Uthai Thani","Kalasin":"Kalasin","Roi Et":"Roi Et","Maha Sarakham":"Maha Sarakham","Lopburi":"Lop Buri","Udon Thani":"Udon Thani","Phra Nakhon Si Ayutthaya":"Ayutthaya","Nonthaburi":"Nonthaburi","Nakhon Pathom":"Nakhon Pathom","Kamphaeng Phet":"Kamphaeng Phet","Lampang":"Lampang","Sukhothai":"Sukhothai","Nakhon Sawan":"Nakhon Sawan","Phetchabun":"Phetchabun","Phichit":"Phichit","Chaiyaphum":"Chaiyaphum","Phrae":"Phrae","Lamphun":"Lamphun","Prachin Buri":"Prachin Buri","Yasothon":"Yasothon","Sa Kaeo":"Sa Kaeo","Bueng Kan":"Bueng Kan","Mukdahan":"Mukdahan","Amnat Charoen":"Amnat Charoen","Nong Bua Lam Phu":"Nong Bua Lam Phu"},
 la:{"Phongsaly":"Phongsaly","Luang Namtha":"Luang Namtha","Bokeo":"Houayxay","Sainyabuli":"Xaignabouri","Khammouane":"Thakhek","Savannakhet":"Savannakhet","Salavan":"Salavan","Luang Prabang":"Luang Prabang","Houaphanh":"Xam Neua","Attapeu":"Attapeu","Oudomxay":"Muang Xay","Bolikhamsai":"Paksan","Champasak":"Pakse","Xiangkhouang":"Phonsavan"},
 kh:{"Ratanakiri":"Banlung","Mondulkiri":"Sen Monorom","Kratié":"Kratié","Kampong Cham":"Kampong Cham","Svay Rieng":"Svay Rieng","Prey Veng":"Prey Veng","Takéo":"Takéo","Kampot":"Kampot","Preah Vihear":"Preah Vihear","Siem Reap":"Siem Reap","Koh Kong":"Koh Kong","Pursat":"Pursat","Battambang":"Battambang","Stung Treng":"Stung Treng","Kampong Chhnang":"Kampong Chhnang","Kampong Thom":"Kampong Thom","Kampong Speu":"Chbar Mon","Kandal":"Ta Khmau","Oddar Meanchey":"Samraong","Banteay Meanchey":"Serei Saophoan"},
 my:{"Sabah":"Kota Kinabalu","Perlis":"Kangar","Kedah":"Alor Setar","Kelantan":"Kota Baharu","Perak":"Ipoh","Sarawak":"Kuching","Penang":"George Town","Negeri Sembilan":"Seremban","Melaka":"Malacca City","Johor":"Johor Bahru","Terengganu":"Kuala Terengganu","Selangor":"Shah Alam","Pahang":"Kuantan"},
 id:{"East Kalimantan":"Samarinda","East Nusa Tenggara":"Kupang","West Kalimantan":"Pontianak","Papua":"Jayapura","Maluku":"Ambon","West Nusa Tenggara":"Mataram","South Sulawesi":"Makassar","Central Java":"Semarang","West Java":"Bandung","Southeast Sulawesi":"Kendari","Central Sulawesi":"Palu","Riau":"Pekanbaru","North Sulawesi":"Manado","Jambi":"Jambi","South Sumatra":"Palembang","Bengkulu":"Bengkulu","West Sumatra":"Padang","North Sumatra":"Medan","Aceh":"Banda Aceh","Central Kalimantan":"Palangka Raya","South Kalimantan":"Banjarbaru","Bali":"Denpasar","East Java":"Surabaya","Banten":"Serang","West Papua":"Manokwari","North Maluku":"Sofifi","Riau Islands":"Tanjung Pinang","Gorontalo":"Gorontalo","West Sulawesi":"Mamuju","Lampung":"Bandar Lampung","Bangka Belitung Islands":"Pangkal Pinang"},
 ph:{"National Capital Region":"Manila","Cordillera":"Baguio","Ilocos":"San Fernando (La Union)","Cagayan Valley":"Tuguegarao","Central Luzon":"San Fernando (Pampanga)","Calabarzon":"Calamba","Mimaropa":"Calapan","Bicol":"Legazpi","Western Visayas":"Iloilo City","Central Visayas":"Cebu City","Eastern Visayas":"Tacloban","Zamboanga Peninsula":"Pagadian","Northern Mindanao":"Cagayan de Oro","Davao":"Davao City","Soccsksargen":"Koronadal","Caraga":"Butuan","Bangsamoro":"Cotabato City"},
 bn:{"Brunei-Muara":"Bandar Seri Begawan","Temburong":"Bangar","Tutong":"Tutong","Belait":"Kuala Belait"},
 tl:{"Dili":"Dili","Oecusse":"Pante Macassar","Bobonaro":"Maliana","Cova Lima":"Suai","Ainaro":"Ainaro","Manufahi":"Same","Manatuto":"Manatuto","Viqueque":"Viqueque","Lautém":"Lospalos","Baucau":"Baucau","Liquiçá":"Liquiçá","Ermera":"Gleno","Aileu":"Aileu"},
 mn:{"Dornod":"Choibalsan","Bayan-Ölgii":"Ölgii","Khovd":"Khovd","Sükhbaatar":"Baruun-Urt","Dornogovi":"Sainshand","Govi-Altai":"Altai","Bayankhongor":"Bayankhongor","Ömnögovi":"Dalandzadgad","Khövsgöl":"Mörön","Bulgan":"Bulgan","Uvs":"Ulaangom","Selenge":"Sükhbaatar","Zavkhan":"Uliastai","Khentii":"Chinggis City","Töv":"Zuunmod","Arkhangai":"Tsetserleg","Orkhon":"Erdenet","Dundgovi":"Mandalgovi","Övörkhangai":"Arvaikheer","Darkhan-Uul":"Darkhan","Govisümber":"Choir"},
 kp:{"Kangwon":"Wonsan","North Hwanghae":"Sariwon","North Hamgyong":"Chongjin","Ryanggang":"Hyesan","Chagang":"Kanggye","North Pyongan":"Sinuiju","South Pyongan":"Pyongsong","South Hwanghae":"Haeju","South Hamgyong":"Hamhung"},
 kr:{"Gangwon":"Chuncheon","Gyeonggi":"Suwon","North Jeolla":"Jeonju","Jeju":"Jeju","North Chungcheong":"Cheongju","South Chungcheong":"Hongseong","South Jeolla":"Muan","South Gyeongsang":"Changwon","North Gyeongsang":"Andong"},
 tw:{"Taoyuan":"Taoyuan","Hsinchu County":"Zhubei","Hsinchu City":"Hsinchu","Miaoli":"Miaoli","Changhua":"Changhua","Yunlin":"Douliu","Chiayi County":"Taibao","Pingtung":"Pingtung","Taitung":"Taitung","Hualien":"Hualien","Yilan":"Yilan","Penghu":"Magong","Nantou":"Nantou","Chiayi City":"Chiayi","Kinmen":"Jincheng"},
 kz:{"Jambyl":"Taraz","Turkistan":"Turkistan","Mangystau":"Aktau","Kyzylorda":"Kyzylorda","Aktobe":"Aktobe","North Kazakhstan":"Petropavl","Pavlodar":"Pavlodar","West Kazakhstan":"Oral","Atyrau":"Atyrau","Akmola":"Kokshetau","East Kazakhstan":"Oskemen","Kostanay":"Kostanay","Karaganda":"Karaganda"},
 uz:{"Fergana":"Fergana","Namangan":"Namangan","Andijan":"Andijan","Sirdaryo":"Guliston","Jizzakh":"Jizzakh","Samarqand":"Samarkand","Qashqadaryo":"Qarshi","Surxondaryo":"Termiz","Karakalpakstan":"Nukus","Navoiy":"Navoiy","Xorazm":"Urgench","Bukhara":"Bukhara","Tashkent Region":"Nurafshon"},
 tm:{"Lebap":"Türkmenabat","Mary":"Mary","Ahal":"Ashgabat","Daşoguz":"Daşoguz","Balkan":"Balkanabat"},
 kg:{"Issyk-Kul":"Karakol","Naryn":"Naryn","Osh":"Osh","Talas":"Talas","Jalal-Abad":"Jalal Abad","Batken":"Batken"},
 tj:{"Sughd":"Khujand","Districts of Republican Subordination":"Dushanbe","Gorno-Badakhshan":"Khorog","Khatlon":"Bokhtar"},
 eg:{"North Sinai":"El Arish","Aswan":"Aswan","Red Sea":"Hurghada","Matrouh":"Marsa Matruh","New Valley":"El Kharga","South Sinai":"El Tur","Port Said":"Port Said","Dakahlia":"El Mansura","Al Sharqia":"Zagazig","Ismailia":"Ismailia","Damietta":"Damietta","Kafr el-Sheikh":"Kafr el Sheikh","Beheira":"Damanhur","Cairo":"Cairo","Minya":"El Minya","Faiyum":"El Faiyum","Beni Suef":"Beni Suef","Monufia":"Shibin el Kom","Qalyubia":"Benha","Gharbia":"Tanta","Sohag":"Sohag","Qena":"Qena","Asyut":"Asyut","Suez":"Suez","Alexandria":"Alexandria","Giza":"Giza","Luxor":"Luxor"},
 ly:{"Murzuq":"Murzuq","Murqub":"Al Khums","Tripoli District":"Tripoli","Zawiya":"Zawiya","Benghazi":"Benghazi","Jufra":"Hun","Butnan":"Tobruk","Jabal al Akhdar":"Bayda","Kufra":"Kufra","Sirte":"Sirte","Ghat":"Ghat","Ghadames":"Ghadames","Nuqat al Khams":"Zuwara","Wadi al Hayaa":"Ubari"},
 dz:{"Adrar":"Adrar","Tamanghasset":"Tamanrasset","Béchar":"Béchar","Tébessa":"Tébessa","Ouargla":"Ouargla","Tlemcen":"Tlemcen","Annaba":"Annaba","Skikda":"Skikda","Jijel":"Jijel","Béjaïa":"Béjaïa","Tizi Ouzou":"Tizi-Ouzou","Algiers":"Algiers","Mostaganem":"Mostaganem","Sétif":"Sétif","Bordj Bou Arréridj":"Bordj Bou Arréridj","Bouïra":"Bouïra","Blida":"Blida","Saïda":"Saïda","Sidi Bel Abbès":"Sidi bel Abbes","Mascara":"Mascara","Laghouat":"Laghouat","Médéa":"Médéa","Tiaret":"Tiaret","M'Sila":"M'Sila","Batna":"Batna","Guelma":"Guelma","Constantine":"Constantine","Oum El Bouaghi":"Oum el Bouaghi","Biskra":"Biskra","Djelfa":"Djelfa","Tindouf":"Tindouf","El Tarf":"El Tarf","El Oued":"El Oued","Souk Ahras":"Souk Ahras","Illizi":"Illizi","Naama":"Naâma","Boumerdès":"Boumerdès","Tipasa":"Tipaza","Chlef":"Chlef","Oran":"Oran","Aïn Témouchent":"Aïn Témouchent","Tissemsilt":"Tissemsilt","Aïn Defla":"Aïn Defla","Relizane":"Relizane","El Bayadh":"El Bayadh","Ghardaïa":"Ghardaïa","Khenchela":"Khenchela","Mila":"Mila"},
 mr:{"Tiris Zemmour":"Zouérat","Dakhlet Nouadhibou":"Nouadhibou","Adrar":"Atar","Brakna":"Aleg","Guidimaka":"Sélibaby","Hodh Ech Chargui":"Néma","Hodh El Gharbi":"Ayoun el Atrous","Assaba":"Kiffa","Inchiri":"Akjoujt","Nouakchott":"Nouakchott","Tagant":"Tidjikja","Trarza":"Rosso","Gorgol":"Kaédi"},
 ml:{"Kayes":"Kayes","Timbuktu":"Timbuktu","Gao":"Gao","Mopti":"Mopti","Sikasso":"Sikasso","Bamako":"Bamako","Ségou":"Ségou","Koulikoro":"Koulikoro","Kidal":"Kidal"},
 ne:{"Tahoua":"Tahoua","Dosso":"Dosso","Diffa":"Diffa","Maradi":"Maradi","Zinder":"Zinder","Tillabéri":"Tillabéri","Agadez":"Agadez"},
 td:{"Lac":"Bol","Salamat":"Am Timan","Moyen-Chari":"Sarh","Mayo-Kebbi Est":"Bongor","Borkou":"Faya-Largeau","Kanem":"Mao","Ouaddaï":"Abéché","Wadi Fira":"Biltine","Tandjilé":"Laï","Guéra":"Mongo","Batha":"Ati","Sila":"Goz Beïda","Mandoul":"Koumra","Logone Oriental":"Doba","Hadjer-Lamis":"Massakory","Chari-Baguirmi":"Massenya","Mayo-Kebbi Ouest":"Pala","Ennedi":"Fada","Tibesti":"Bardaï","Bahr el Gazel":"Moussoro","Logone Occidental":"Moundou"},
 sd:{"South Darfur":"Nyala","Al Qadarif":"Gedaref","Blue Nile":"Ed Damazin","Northern":"Dongola","River Nile":"Ed Damer","North Darfur":"El Fasher","West Darfur":"Geneina","Red Sea":"Port Sudan","Kassala":"Kassala","White Nile":"Kosti","South Kordofan":"Kadugli","Khartoum":"Khartoum","North Kordofan":"El Obeid","Central Darfur":"Zalingei","Sennar":"Sinja","East Darfur":"Ed Daein","Al Jazirah":"Wad Madani"},
 ss:{"Eastern Equatoria":"Torit","Western Bahr el Ghazal":"Wau","Western Equatoria":"Yambio","Central Equatoria":"Juba","Upper Nile":"Malakal","Jonglei":"Bor","Unity":"Bentiu","Northern Bahr el Ghazal":"Aweil","Lakes":"Rumbek","Warrap":"Kuajok"},
 et:{"Somali":"Jijiga","Tigray":"Mekelle","Addis Ababa":"Addis Ababa","Harari":"Harar","Southern Nations":"Hawassa","Afar":"Semera","Amhara":"Bahir Dar","Benishangul-Gumuz":"Asosa","Gambela":"Gambela"},
 er:{"Southern Red Sea":"Assab","Northern Red Sea":"Massawa","Anseba":"Keren","Debub":"Mendefera","Maekel":"Asmara","Gash-Barka":"Barentu"},
 dj:{"Ali Sabieh":"Ali Sabieh","Dikhil":"Dikhil","Tadjourah":"Tadjoura","Obock":"Obock","Arta":"Arta"},
 tz:{"Mbeya":"Mbeya","Ruvuma":"Songea","Kigoma":"Kigoma","Kagera":"Bukoba","Mtwara":"Mtwara","Mara":"Musoma","Arusha":"Arusha","Kilimanjaro":"Moshi","Tanga":"Tanga","Lindi":"Lindi","Pwani":"Kibaha","Dar es Salaam":"Dar es Salaam","Unguja North":"Mkokotoni","Mjini Magharibi":"Zanzibar","South Pemba":"Chake Chake","North Pemba":"Wete","Morogoro":"Morogoro","Dodoma":"Dodoma","Manyara":"Babati","Singida":"Singida","Tabora":"Tabora","Iringa":"Iringa","Mwanza":"Mwanza","Shinyanga":"Shinyanga","Njombe":"Njombe","Katavi":"Mpanda","Rukwa":"Sumbawanga","Unguja South":"Koani","Simiyu":"Bariadi","Geita":"Geita"},
 rw:{"Eastern":"Rwamagana","Southern":"Nyanza","Western":"Karongi"},
 cg:{"Likouala":"Impfondo","Cuvette":"Owando","Plateaux":"Djambala","Pool":"Kinkala","Brazzaville":"Brazzaville","Bouenza":"Madingou","Niari":"Dolisie","Sangha":"Ouésso","Cuvette-Ouest":"Ewo","Lékoumou":"Sibiti","Pointe-Noire":"Pointe-Noire"},
 ga:{"Ogooué-Ivindo":"Makokou","Haut-Ogooué":"Franceville","Ogooué-Lolo":"Koulamoutou","Ngounié":"Mouila","Nyanga":"Tchibanga","Estuaire":"Libreville","Ogooué-Maritime":"Port-Gentil","Moyen-Ogooué":"Lambaréné","Woleu-Ntem":"Oyem"},
 gq:{"Litoral":"Bata","Centro Sur":"Evinayong","Wele-Nzas":"Mongomo","Bioko Norte":"Malabo","Bioko Sur":"Luba","Kié-Ntem":"Ebebiyín"},
 cm:{"South":"Ebolowa","Far North":"Maroua","North":"Garoua","Adamawa":"Ngaoundéré","Northwest":"Bamenda","Southwest":"Buea","East":"Bertoua","Littoral":"Douala","West":"Bafoussam","Centre":"Yaoundé"},
 cf:{"Vakaga":"Birao","Haute-Kotto":"Bria","Haut-Mbomou":"Obo","Kémo":"Sibut","Ouaka":"Bambari","Basse-Kotto":"Mobaye","Mbomou":"Bangassou","Lobaye":"Mbaïki","Bamingui-Bangoran":"N'Délé","Ouham":"Bossangoa","Ouham-Pendé":"Bozoum","Sangha-Mbaéré":"Nola","Nana-Mambéré":"Bouar","Mambéré-Kadéï":"Berbérati","Nana-Grébizi":"Kaga Bandoro","Ombella-M'Poko":"Bimbo"},
 bj:{"Alibori":"Kandi","Borgou":"Parakou","Ouémé":"Porto-Novo","Atakora":"Natitingou","Donga":"Djougou","Zou":"Abomey","Mono":"Lokossa","Atlantique":"Allada","Littoral":"Cotonou","Plateau":"Pobè","Collines":"Dassa-Zoumè","Kouffo":"Aplahoué"},
 tg:{"Kara":"Kara","Savanes":"Dapaong","Centre":"Sokodé","Plateaux":"Atakpamé"},
 gh:{"Upper East":"Bolgatanga","Northern":"Tamale","Volta":"Ho","Brong-Ahafo":"Sunyani","Western":"Sekondi-Takoradi","Upper West":"Wa","Central":"Cape Coast","Greater Accra":"Accra","Ashanti":"Kumasi","Eastern":"Koforidua"},
 bf:{"Boucle du Mouhoun":"Dédougou","Cascades":"Banfora","Centre":"Ouagadougou","Centre-Est":"Tenkodogo","Centre-Nord":"Kaya","Centre-Ouest":"Koudougou","Centre-Sud":"Manga","Est":"Fada N'gourma","Hauts-Bassins":"Bobo-Dioulasso","Nord":"Ouahigouya","Plateau-Central":"Ziniaré","Sahel":"Dori","Sud-Ouest":"Gaoua"},
 lr:{"Grand Cape Mount":"Robertsport","Lofa":"Voinjama","Nimba":"Sanniquellie","Grand Gedeh":"Zwedru","Maryland":"Harper","Bong":"Gbarnga","Montserrado":"Bensonville","Margibi":"Kakata","Grand Bassa":"Buchanan","River Cess":"Rivercess","Sinoe":"Greenville","Grand Kru":"Barclayville","Gbarpolu":"Bopolu","River Gee":"Fish Town","Bomi":"Tubmanburg"},
 sl:{"Northern":"Makeni","Eastern":"Kenema","Southern":"Bo","Western Area":"Freetown"},
 gn:{"Boké":"Boké","Faranah":"Faranah","Kankan":"Kankan","Kindia":"Kindia","Labé":"Labé","Mamou":"Mamou","Nzérékoré":"Nzérékoré"},
 gw:{"Gabú":"Gabú","Tombali":"Catió","Bafatá":"Bafatá","Oio":"Farim","Cacheu":"Cacheu","Bissau":"Bissau","Quinara":"Fulacunda","Bolama":"Bolama","Biombo":"Quinhámel"},
 sn:{"Tambacounda":"Tambacounda","Kolda":"Kolda","Ziguinchor":"Ziguinchor","Matam":"Matam","Kaolack":"Kaolack","Fatick":"Fatick","Louga":"Louga","Thiès":"Thiès","Dakar":"Dakar","Diourbel":"Diourbel","Kédougou":"Kédougou","Sédhiou":"Sédhiou","Saint-Louis":"Saint-Louis","Kaffrine":"Kaffrine"},
 gm:{"Central River":"Janjanbureh","North Bank":"Kerewan","Upper River":"Basse Santa Su","Lower River":"Mansakonko","West Coast":"Brikama"},
 cv:{"Praia":"Praia"},
 ao:{"Cabinda":"Cabinda","Cuando Cubango":"Menongue","Moxico":"Luena","Namibe":"Moçâmedes","Cunene":"Ondjiva","Zaire":"Mbanza-Congo","Uíge":"Uíge","Lunda Norte":"Lucapa","Malanje":"Malanje","Lunda Sul":"Saurimo","Cuanza Sul":"Sumbe","Benguela":"Benguela","Bengo":"Caxito","Luanda":"Luanda","Bié":"Kuito","Cuanza Norte":"Ndalatando","Huíla":"Lubango","Huambo":"Huambo"},
 zm:{"Eastern":"Chipata","Northern":"Kasama","Lusaka":"Lusaka","Southern":"Choma","Western":"Mongu","Northwestern":"Solwezi","Luapula":"Mansa","Copperbelt":"Ndola","Central":"Kabwe","Muchinga":"Chinsali"},
 zw:{"Matabeleland South":"Gwanda","Masvingo":"Masvingo","Manicaland":"Mutare","Midlands":"Gweru","Matabeleland North":"Lupane","Mashonaland West":"Chinhoyi","Mashonaland Central":"Bindura","Mashonaland East":"Marondera"},
 mw:{"Karonga":"Karonga","Nkhata Bay":"Nkhata Bay","Chitipa":"Chitipa","Mchinji":"Mchinji","Nkhotakota":"Nkhotakota","Salima":"Salima","Mangochi":"Mangochi","Machinga":"Machinga","Dedza":"Dedza","Lilongwe":"Lilongwe","Nsanje":"Nsanje","Mwanza":"Mwanza","Ntcheu":"Ntcheu","Zomba":"Zomba","Mulanje":"Mulanje","Chiradzulu":"Chiradzulu","Blantyre":"Blantyre","Rumphi":"Rumphi","Likoma":"Likoma","Mzimba":"Mzimba","Kasungu":"Kasungu","Chikwawa":"Chikwawa","Neno":"Neno","Phalombe":"Phalombe","Thyolo":"Thyolo","Dowa":"Dowa","Balaka":"Balaka","Ntchisi":"Ntchisi"},
 mz:{"Maputo Province":"Matola","Cabo Delgado":"Pemba","Niassa":"Lichinga","Tete":"Tete","Manica":"Chimoio","Gaza":"Xai-Xai","Zambezia":"Quelimane","Sofala":"Beira","Nampula":"Nampula","Inhambane":"Inhambane"},
 na:{"Kunene":"Outjo","Omaheke":"Gobabis","Khomas":"Windhoek","Oshikoto":"Tsumeb","Karas":"Keetmanshoop","Omusati":"Outapi","Ohangwena":"Eenhana","Kavango":"Rundu","Zambezi":"Katima Mulilo","Hardap":"Mariental","Otjozondjupa":"Otjiwarongo","Erongo":"Swakopmund","Oshana":"Oshakati"},
 ls:{"Mokhotlong":"Mokhotlong","Berea":"Teyateyaneng","Maseru":"Maseru","Mafeteng":"Mafeteng","Mohale's Hoek":"Mohale's Hoek","Quthing":"Moyeni","Butha-Buthe":"Butha-Buthe","Leribe":"Hlotse","Qacha's Nek":"Qacha's Nek","Thaba-Tseka":"Thaba-Tseka"},
 sz:{"Lubombo":"Siteki","Hhohho":"Mbabane","Manzini":"Manzini","Shiselweni":"Nhlangano"},
 mg:{"Boeny":"Mahajanga","Diana":"Antsiranana","Atsinanana":"Toamasina","Atsimo-Andrefana":"Toliara","Analamanga":"Antananarivo","Haute Matsiatra":"Fianarantsoa","Sofia":"Antsohihy","Sava":"Sambava","Analanjirofo":"Fenoarivo Atsinanana","Vatovavy-Fitovinany":"Manakara","Atsimo-Atsinanana":"Farafangana","Anosy":"Taolagnaro","Androy":"Ambovombe","Menabe":"Morondava","Melaky":"Maintirano","Betsiboka":"Maevatanana","Bongolava":"Tsiroanomandidy","Vakinankaratra":"Antsirabe","Amoron'i Mania":"Ambositra","Alaotra-Mangoro":"Ambatondrazaka","Ihorombe":"Ihosy","Itasy":"Miarinarivo"},
 km:{"Grande Comore":"Moroni","Mohéli":"Fomboni","Anjouan":"Mutsamudu"},
 gt:{"Jutiapa":"Jutiapa","Chiquimula":"Chiquimula","Petén":"Flores","San Marcos":"San Marcos","Huehuetenango":"Huehuetenango","Quiché":"Santa Cruz del Quiché","Alta Verapaz":"Cobán","Izabal":"Puerto Barrios","Zacapa":"Zacapa","Retalhuleu":"Retalhuleu","Suchitepéquez":"Mazatenango","Escuintla":"Escuintla","Santa Rosa":"Cuilapa","Chimaltenango":"Chimaltenango","Sacatepéquez":"Antigua Guatemala","Guatemala":"Guatemala City","Jalapa":"Jalapa","El Progreso":"El Progreso","Sololá":"Sololá","Quetzaltenango":"Quetzaltenango","Baja Verapaz":"Salamá","Totonicapán":"Totonicapán"},
 bz:{"Cayo":"El Cayo","Orange Walk":"Orange Walk","Corozal":"Corozal","Toledo":"Punta Gorda","Stann Creek":"Dangriga","Belize":"Belize City"},
 sv:{"Ahuachapán":"Ahuachapán","Santa Ana":"Santa Ana","Chalatenango":"Chalatenango","Cabañas":"Sensuntepeque","Morazán":"San Francisco Gotera","San Miguel":"San Miguel","La Unión":"La Unión","Sonsonate":"Sonsonate","La Libertad":"Santa Tecla","La Paz":"Zacatecoluca","San Vicente":"San Vicente","Usulután":"Usulután","Cuscatlán":"Cojutepeque","San Salvador":"San Salvador"},
 hn:{"Ocotepeque":"Nueva Ocotepeque","Lempira":"Gracias","Intibucá":"La Esperanza","La Paz":"La Paz","Valle":"Nacaome","Olancho":"Juticalpa","Gracias a Dios":"Puerto Lempira","El Paraíso":"Yuscarán","Choluteca":"Choluteca","Cortés":"San Pedro Sula","Santa Bárbara":"Santa Bárbara","Copán":"Santa Rosa de Copán","Colón":"Trujillo","Atlántida":"La Ceiba","Bay Islands":"Roatán","Comayagua":"Comayagua","Yoro":"Yoro","Francisco Morazán":"Tegucigalpa"},
 ni:{"Río San Juan":"San Carlos","North Caribbean Coast":"Bilwi","Jinotega":"Jinotega","Nueva Segovia":"Ocotal","Chinandega":"Chinandega","Madriz":"Somoto","Rivas":"Rivas","South Caribbean Coast":"Bluefields","León":"León","Managua":"Managua","Carazo":"Jinotepe","Matagalpa":"Matagalpa","Boaco":"Boaco","Chontales":"Juigalpa","Estelí":"Estelí","Granada":"Granada","Masaya":"Masaya"},
 cr:{"Alajuela":"Alajuela","Guanacaste":"Liberia","Limón":"Limón","Puntarenas":"Puntarenas","Heredia":"Heredia","San José":"San José","Cartago":"Cartago"},
 pa:{"Bocas del Toro":"Bocas del Toro","Chiriquí":"David","Darién":"La Palma","Panamá":"Panama City","Coclé":"Penonomé","Veraguas":"Santiago","Colón":"Colón","Los Santos":"Las Tablas","Herrera":"Chitré"},
 cu:{"Guantánamo":"Guantánamo","Camagüey":"Camagüey","Ciego de Ávila":"Ciego de Ávila","Holguín":"Holguín","Isla de la Juventud":"Nueva Gerona","Sancti Spíritus":"Sancti Spíritus","Villa Clara":"Santa Clara","Matanzas":"Matanzas","Las Tunas":"Las Tunas","Havana":"Havana","Pinar del Río":"Pinar del Río","Cienfuegos":"Cienfuegos","Granma":"Bayamo","Santiago de Cuba":"Santiago de Cuba","Mayabeque":"San José de las Lajas","Artemisa":"Artemisa"},
 jm:{"Saint Ann":"Saint Ann's Bay","Trelawny":"Falmouth","Saint James":"Montego Bay","Hanover":"Lucea","Westmoreland":"Savanna-la-Mar","Saint Elizabeth":"Black River","Manchester":"Mandeville","Clarendon":"May Pen","Saint Catherine":"Spanish Town","Saint Andrew":"Half Way Tree","Kingston":"Kingston","Saint Thomas":"Port Morant","Portland":"Port Antonio","Saint Mary":"Port Maria"},
 ht:{"Nord-Est":"Fort-Liberté","Centre":"Hinche","Ouest":"Port-au-Prince","Sud-Est":"Jacmel","Sud":"Les Cayes","Grand'Anse":"Jérémie","Nord-Ouest":"Port-de-Paix","Nord":"Cap-Haïtien","Artibonite":"Gonaïves","Nippes":"Miragoâne"},
 do:{"Monte Cristi":"Monte Cristi","Dajabón":"Dajabón","La Estrelleta":"Comendador","Independencia":"Jimaní","Pedernales":"Pedernales","La Altagracia":"Higüey","El Seibo":"El Seibo","Hato Mayor":"Hato Mayor","Samaná":"Samaná","María Trinidad Sánchez":"Nagua","Espaillat":"Moca","Puerto Plata":"Puerto Plata","Barahona":"Barahona","Azua":"Azua","Peravia":"Baní","San Cristóbal":"San Cristóbal","San Pedro de Macorís":"San Pedro de Macorís","Valverde":"Mao","Santiago Rodríguez":"Sabaneta","La Vega":"La Vega","Hermanas Mirabal":"Salcedo","Duarte":"San Francisco de Macorís","Santiago":"Santiago","Baoruco":"Neiba","San Juan":"San Juan","Monseñor Nouel":"Bonao","Sánchez Ramírez":"Cotuí","Monte Plata":"Monte Plata","La Romana":"La Romana","San José de Ocoa":"San José de Ocoa"},
 co:{"Nariño":"Pasto","Putumayo":"Mocoa","Chocó":"Quibdó","Guainía":"Inírida","Vaupés":"Mitú","Amazonas":"Leticia","La Guajira":"Riohacha","Cesar":"Valledupar","Norte de Santander":"Cúcuta","Arauca":"Arauca","Boyacá":"Tunja","Vichada":"Puerto Carreño","Cauca":"Popayán","Valle del Cauca":"Cali","Antioquia":"Medellín","Córdoba":"Montería","Sucre":"Sincelejo","Bolívar":"Cartagena","Atlántico":"Barranquilla","Magdalena":"Santa Marta","Caquetá":"Florencia","Huila":"Neiva","Caldas":"Manizales","Casanare":"Yopal","Santander":"Bucaramanga","Tolima":"Ibagué","Quindío":"Armenia","Risaralda":"Pereira","San Andrés and Providencia":"San Andrés","Guaviare":"San José del Guaviare","Meta":"Villavicencio","Cundinamarca":"Bogotá"},
 ve:{"Bolívar":"Ciudad Bolívar","Amazonas":"Puerto Ayacucho","Zulia":"Maracaibo","Táchira":"San Cristóbal","Apure":"San Fernando de Apure","Mérida":"Mérida","Trujillo":"Trujillo","Falcón":"Coro","Yaracuy":"San Felipe","Carabobo":"Valencia","Anzoátegui":"Barcelona","Sucre":"Cumaná","Nueva Esparta":"La Asunción","Guárico":"San Juan de los Morros","Cojedes":"San Carlos","Barinas":"Barinas","Lara":"Barquisimeto","Portuguesa":"Guanare","Delta Amacuro":"Tucupita","Aragua":"Maracay","La Guaira":"La Guaira","Miranda":"Los Teques","Monagas":"Maturín"},
 ec:{"Esmeraldas":"Esmeraldas","Carchi":"Tulcán","Pastaza":"Puyo","Morona-Santiago":"Macas","Zamora Chinchipe":"Zamora","Loja":"Loja","El Oro":"Machala","Guayas":"Guayaquil","Galápagos":"Puerto Baquerizo Moreno","Manabí":"Portoviejo","Azuay":"Cuenca","Cañar":"Azogues","Tungurahua":"Ambato","Napo":"Tena","Chimborazo":"Riobamba","Bolívar":"Guaranda","Imbabura":"Ibarra","Cotopaxi":"Latacunga","Los Ríos":"Babahoyo","Pichincha":"Quito","Sucumbíos":"Nueva Loja","Orellana":"Puerto Francisco de Orellana","Santa Elena":"Santa Elena","Santo Domingo de los Tsáchilas":"Santo Domingo"},
 pe:{"Lima Region":"Huacho","Tacna":"Tacna","Madre de Dios":"Puerto Maldonado","Loreto":"Iquitos","Amazonas":"Chachapoyas","Cajamarca":"Cajamarca","Tumbes":"Tumbes","Piura":"Piura","Ucayali":"Pucallpa","Puno":"Puno","Moquegua":"Moquegua","Arequipa":"Arequipa","Ica":"Ica","Callao":"Callao","Áncash":"Huaraz","La Libertad":"Trujillo","Lambayeque":"Chiclayo","Cusco":"Cusco","Ayacucho":"Ayacucho","Apurímac":"Abancay","Huancavelica":"Huancavelica","San Martín":"Moyobamba","Huanuco":"Huánuco","Pasco":"Cerro de Pasco","Junín":"Huancayo"},
 bo:{"La Paz":"La Paz","Oruro":"Oruro","Potosí":"Potosí","Tarija":"Tarija","Santa Cruz":"Santa Cruz","Chuquisaca":"Sucre","Pando":"Cobija","Beni":"Trinidad","Cochabamba":"Cochabamba"},
 py:{"Presidente Hayes":"Villa Hayes","Central":"Areguá","Alto Paraná":"Ciudad del Este","Itapúa":"Encarnación","Ñeembucú":"Pilar","Misiones":"San Juan Bautista","Concepción":"Concepción","Amambay":"Pedro Juan Caballero","San Pedro":"San Pedro","Caaguazú":"Coronel Oviedo","Cordillera":"Caacupé","Caazapá":"Caazapá","Paraguarí":"Paraguarí","Guairá":"Villarrica","Boquerón":"Filadelfia","Alto Paraguay":"Fuerte Olimpo","Canindeyú":"Salto del Guairá"},
 uy:{"Paysandú":"Paysandú","Artigas":"Artigas","Salto":"Salto","Rivera":"Rivera","Rocha":"Rocha","Treinta y Tres":"Treinta y Tres","Cerro Largo":"Melo","Canelones":"Canelones","Montevideo":"Montevideo","San José":"San José de Mayo","Colonia":"Colonia del Sacramento","Soriano":"Mercedes","Río Negro":"Fray Bentos","Tacuarembó":"Tacuarembó","Durazno":"Durazno","Flores":"Trinidad","Florida":"Florida","Lavalleja":"Minas","Maldonado":"Maldonado"},
 cl:{"Arica y Parinacota":"Arica","Tarapacá":"Iquique","Antofagasta":"Antofagasta","Atacama":"Copiapó","Coquimbo":"La Serena","Santiago":"Santiago","Valparaíso":"Valparaíso","Maule":"Talca","Araucanía":"Temuco","Biobío":"Concepción","Los Ríos":"Valdivia","Los Lagos":"Puerto Montt","Aysén":"Coyhaique","Magellan and the Chilean Antarctic":"Punta Arenas","O'Higgins":"Rancagua","Ñuble":"Chillán"},
 nz:{"Northland":"Whangārei","Auckland":"Auckland","Waikato":"Hamilton","Bay of Plenty":"Whakatāne","Gisborne":"Gisborne","Hawke's Bay":"Napier","Taranaki":"Stratford","Manawatū-Whanganui":"Palmerston North","Wellington":"Wellington","Tasman":"Richmond","Nelson":"Nelson","Marlborough":"Blenheim","West Coast":"Greymouth","Canterbury":"Christchurch","Otago":"Dunedin","Southland":"Invercargill"},
 pg:{"Sandaun":"Vanimo","East Sepik":"Wewak","Madang":"Madang","Morobe":"Lae","Oro":"Popondetta","Milne Bay":"Alotau","Gulf":"Kerema","Bougainville":"Buka","West New Britain":"Kimbe","East New Britain":"Rabaul","New Ireland":"Kavieng","Manus":"Lorengau","Chimbu":"Kundiawa","Enga":"Wabag","Western Highlands":"Mount Hagen","Southern Highlands":"Mendi","Eastern Highlands":"Goroka","Western":"Daru"},
 fj:{"Central":"Suva","Eastern":"Levuka","Western":"Lautoka","Northern":"Labasa"},
 sb:{"Rennell and Bellona":"Tigoa","Makira-Ulawa":"Kirakira","Temotu":"Lata","Malaita":"Auki","Guadalcanal":"Honiara","Central":"Tulagi","Western":"Gizo","Isabel":"Buala","Choiseul":"Taro"},
 vu:{"Shefa":"Port Vila","Tafea":"Isangel","Malampa":"Lakatoro","Sanma":"Luganville","Penama":"Saratamata","Torba":"Sola"}};
const DATA={};
function load(cc){if(DATA[cc])return Promise.resolve(DATA[cc]);return fetch("provinces/"+cc+".json").then(r=>{if(!r.ok)throw new Error(r.status);return r.json()}).then(d=>{d.items.forEach(x=>{/* d3 wants clockwise outer rings: flip any ring that would cover more than half the globe */const fix=r=>{if(d3.geoArea({type:"Polygon",coordinates:[r]})>2*Math.PI)r.reverse()};if(x.g.type==="Polygon")x.g.coordinates.forEach(fix);else x.g.coordinates.forEach(p=>p.forEach(fix));x.f={type:"Feature",properties:{},geometry:x.g}});DATA[cc]=d;return d})}
function projFor(cc,F,W,H){const fc={type:"FeatureCollection",features:F};
 if(cc==="us")return d3.geoAlbersUsa().fitExtent([[8,8],[W-8,H-8]],fc);
 const b=d3.geoBounds(fc);let lo0=b[0][0],lo1=b[1][0];if(lo1<lo0)lo1+=360;const cl=(lo0+lo1)/2,la0=b[0][1],la1=b[1][1];
 if(cc==="ru")return d3.geoConicEqualArea().rotate([-100,0]).parallels([50,70]).fitExtent([[8,8],[W-8,H-8]],fc);
 if(Math.abs(la1-la0)>12||cc==="cn"||cc==="ca")return d3.geoConicEqualArea().rotate([-cl,0]).parallels([la0+(la1-la0)/6,la1-(la1-la0)/6]).fitExtent([[8,8],[W-8,H-8]],fc);
 return d3.geoMercator().rotate([-cl,0]).fitExtent([[8,8],[W-8,H-8]],fc)}
const st=()=>{const t=triviaState();t.prov=t.prov||{mode:"find",len:"10",best:{}};return t.prov};
let R=null;
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function start(cc,mode){const S=st();load(cc).then(d=>{const items=d.items.filter(x=>mode!=="cap"||(CAPS[cc]&&CAPS[cc][x.n]));
  const len=S.len==="all"?items.length:S.len==="endless"?Infinity:Math.min(+S.len||10,items.length);
  R={cc,mode,d,items,queue:shuffle(items.slice()),len,k:0,ok:0,miss:[],cur:null,answered:false,tries:0,done:{},t0:Date.now()};next()}).catch(e=>{console.error(e);R=null;menuMsg("Couldn’t load the map. Check your connection.")})}
function next(){if(!R)return;if(R.k>=R.len){R.end=true;render();return}if(!R.queue.length)R.queue=shuffle(R.items.slice());
 if(R.len===Infinity&&R.again&&R.again.length&&R.again[0].at<=R.k)R.cur=R.again.shift().x;else R.cur=R.queue.shift();
 R.answered=false;R.tries=0;R.wrong=null;R._vb=null;R.opts=R.mode==="name"||R.mode==="cap"?opts():null;render()}
function opts(){const c=R.cur,near=R.items.filter(x=>x!==c).map(x=>[x,Math.hypot(x.c[0]-c.c[0],x.c[1]-c.c[1])]).sort((a,b)=>a[1]-b[1]).slice(0,8).map(a=>a[0]);
 const o=[c].concat(shuffle(near).slice(0,3));return shuffle(o)}
function capOf(x){return(CAPS[R.cc]||{})[x.n]}
function finish(ok){R.answered=true;R.right=ok;R.k++;if(ok){R.ok++;R.done[R.cur.n]="ok";try{if(typeof ppCredit==="function")ppCredit(R.cc,"know",R.mode!=="find"?false:true,"pv:"+R.cc+":"+R.mode+":"+R.t0)}catch(e){}try{if(typeof xpGain==="function")xpGain(1,"drill")}catch(e){}}
 else{R.done[R.cur.n]="no";R.miss.push(R.cur);if(R.len===Infinity)(R.again=R.again||[]).push({x:R.cur,at:R.k+3})}render()}
function clickRegion(n){if(!R||R.answered||R.mode!=="find")return;const x=R.items.find(i=>i.n===n);if(!x)return;
 if(x===R.cur){finish(R.tries===0);return}R.tries++;R.wrong=x;if(R.tries>=2){finish(false);return}render()}
function menuMsg(m){R=null;render(m)}
function title(){const L=LIST.find(l=>l[0]===R.cc);return L?L[1]:R.cc}
function kind(){const L=LIST.find(l=>l[0]===R.cc);return L?L[2]:"region"}
function note(){const L=LIST.find(l=>l[0]===R.cc);return L&&L[4]?"Divisions: "+L[4]+".":""}
function render(msg){const v=document.getElementById("triviaView");if(!v)return;
 if(!R){const sec=v.querySelector(".pv-sec");if(sec)sec.outerHTML=menuHTML(msg);return}
 if(R.end){const S=st(),key=R.cc+":"+R.mode,pb=S.best[key]||0,nb=R.ok>pb;if(nb&&!R._saved){S.best[key]=R.ok;try{saveStats()}catch(e){}}R._saved=1;const miss=[...new Set(R.miss.map(x=>x.n))];
  v.innerHTML='<div class="dr-wrap"><div class="pv-card pv-endc"><small>'+esc(title())+'</small><h2>'+R.ok+' / '+R.k+'</h2><p>'+(R.ok===R.k?"Perfect round.":nb?"New best!":"Best: "+pb)+'</p>'+(miss.length?'<p class="pv-missl"><small>To practise:</small> '+miss.map(esc).join(" · ")+'</p>':'')+'<div class="dr-acts"><button type="button" class="chip" id="pvBack">All drills</button><button type="button" class="chip tut-go" id="pvAgain">Again →</button></div></div></div>';
  document.getElementById("pvBack").onclick=()=>{R=null;try{renderTriviaView()}catch(e){}};document.getElementById("pvAgain").onclick=()=>start(R.cc,R.mode);return}
 const c=R.cur;let ask="",body="";
 if(R.mode==="find")ask="Where is <b>"+esc(c.n)+"</b>?";else if(R.mode==="name")ask="Which "+esc(kind())+" is highlighted?";else ask="What is the capital of the highlighted "+esc(kind().split(" ")[0])+"?";
 if(R.opts)body='<div class="dr-opts4 pv-opts">'+R.opts.map((o,i)=>{let cls="";if(R.answered){if(o===c)cls=" ok";else if(o===R.given)cls=" no"}const lab=R.mode==="cap"?capOf(o):o.n;return'<button type="button" class="dr-o'+cls+'" data-i="'+i+'"'+(R.answered?" disabled":"")+'><kbd>'+(i+1)+'</kbd>'+esc(lab)+'</button>'}).join("")+'</div>';
 const fb=R.answered?'<div class="dr-fb '+(R.right?"ok":"no")+'"><b>'+(R.right?"Right!":"Not quite.")+'</b> '+esc(c.n)+(capOf(c)?' · capital '+esc(capOf(c)):'')+'</div><button type="button" class="chip tut-go" id="pvNext">'+(R.k>=R.len?"See score →":"Next →")+'</button>':(R.wrong?'<div class="dr-fb no">That’s <b>'+esc(R.wrong.n)+'</b>. One more try.</div>':'')+'<button type="button" class="chip dr-skip" id="pvSkip">Skip <kbd>Esc</kbd></button>';
 v.innerHTML='<div class="dr-wrap pv-wrap"><div class="pv-card"><div class="dr-top"><span>'+esc(title())+(R.len===Infinity?" · endless":" · "+Math.min(R.k+(R.answered?0:1),R.len)+" of "+R.len)+'</span><span>score <b>'+R.ok+'</b></span><button type="button" class="dr-quit" id="pvQuit">End</button></div>'+(note()?'<p class="pv-note">'+esc(note())+'</p>':'')+'<h3>'+ask+'</h3><div class="pv-map"><svg></svg><div class="pv-zoom"><button type="button" data-z="1.6" aria-label="Zoom in">+</button><button type="button" data-z="0.625" aria-label="Zoom out">−</button></div><div class="pv-tip" hidden></div></div>'+body+fb+'</div></div>';
 drawMap(v.querySelector(".pv-map"));
 document.getElementById("pvQuit").onclick=()=>{R.len=R.k;R.end=true;render()};
 v.querySelectorAll(".pv-opts .dr-o").forEach(b=>b.onclick=()=>{const o=R.opts[+b.dataset.i];R.given=o;finish(o===c)});
 const sk=document.getElementById("pvSkip");if(sk)sk.onclick=()=>{if(!R.answered)finish(false)};const nx=document.getElementById("pvNext");if(nx){nx.onclick=next;nx.focus({preventScroll:true})}}
function drawMap(box){const svg=box.querySelector("svg"),W=box.clientWidth||700,H=box.clientHeight||440;
 const P=projFor(R.cc,R.items.map(x=>x.f),W,H),path=d3.geoPath(P),c=R.cur,show=R.mode!=="find";
 const cls=x=>{let k="pv-r";if(R.done[x.n]==="ok"&&x!==c)k+=" done";if(show&&x===c)k+=" target";if(R.answered&&x===c)k+=R.right?" right":" reveal";if(R.wrong===x)k+=" wrong";return k};
 const lab=R.items.filter(x=>(R.done[x.n]&&x!==c)||(R.answered&&x===c)||x===R.wrong);
 let h='<g class="pv-g">'+R.items.map((x,i)=>'<path class="'+cls(x)+'" data-i="'+i+'" d="'+(path(x.f)||"")+'"/>').join("");
 h+=lab.map(x=>{const p=P(x.c);return p?'<text class="pv-lab" x="'+p[0].toFixed(1)+'" y="'+p[1].toFixed(1)+'">'+esc(x.n)+'</text>':""}).join("")+'</g>';
 svg.innerHTML=h;
 /* zoom and pan by moving the viewBox */
 let vb=R._vb||[0,0,W,H];
 if(!R._vb&&(show||R.answered)&&c){const bb=path.bounds(c.f),w=bb[1][0]-bb[0][0],hh=bb[1][1]-bb[0][1];if(w<14&&hh<14){const k=Math.min(8,40/Math.max(w,hh,1)),cx=(bb[0][0]+bb[1][0])/2,cy=(bb[0][1]+bb[1][1])/2;vb=[cx-W/k/2,cy-H/k/2,W/k,H/k]}}
 const apply=()=>{svg.setAttribute("viewBox",vb.map(v=>v.toFixed(2)).join(" "));const k=W/vb[2];svg.style.setProperty("--pvk",k)};apply();
 const zoomAt=(f,mx,my)=>{const nw=Math.min(W,Math.max(W/14,vb[2]/f)),nh=nw*H/W;const px=vb[0]+(mx/W)*vb[2],py=vb[1]+(my/H)*vb[3];vb=[px-(mx/W)*nw,py-(my/H)*nh,nw,nh];clamp();apply();R._vb=vb.slice()};
 const clamp=()=>{vb[0]=Math.max(-W*.2,Math.min(W*1.2-vb[2],vb[0]));vb[1]=Math.max(-H*.2,Math.min(H*1.2-vb[3],vb[1]))};
 svg.onwheel=e=>{e.preventDefault();const r=svg.getBoundingClientRect();zoomAt(e.deltaY<0?1.25:0.8,(e.clientX-r.left)*W/r.width,(e.clientY-r.top)*H/r.height)};
 let drag=null,moved=false,pts=new Map();
 svg.onpointerdown=e=>{pts.set(e.pointerId,[e.clientX,e.clientY]);drag={x:e.clientX,y:e.clientY,vb:vb.slice(),d0:pts.size===2?dist():0};moved=false;try{svg.setPointerCapture(e.pointerId)}catch(_){}};
 const dist=()=>{const a=[...pts.values()];return a.length<2?0:Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1])};
 svg.onpointermove=e=>{if(!drag)return;pts.set(e.pointerId,[e.clientX,e.clientY]);const r=svg.getBoundingClientRect();
  if(pts.size===2){const d=dist();if(drag.d0){const a=[...pts.values()];zoomAt(d/drag.d0,((a[0][0]+a[1][0])/2-r.left)*W/r.width,((a[0][1]+a[1][1])/2-r.top)*H/r.height);drag.d0=d;moved=true}else drag.d0=d;return}
  const dx=(e.clientX-drag.x)*drag.vb[2]/r.width,dy=(e.clientY-drag.y)*drag.vb[3]/r.height;if(Math.abs(e.clientX-drag.x)+Math.abs(e.clientY-drag.y)>5)moved=true;if(moved){vb=[drag.vb[0]-dx,drag.vb[1]-dy,vb[2],vb[3]];clamp();apply();R._vb=vb.slice()}};
 svg.onpointerup=svg.onpointercancel=e=>{pts.delete(e.pointerId);if(!pts.size)drag=null};
 svg.onclick=e=>{if(moved)return;const t=e.target.closest&&e.target.closest("path.pv-r");if(t)clickRegion(R.items[+t.dataset.i].n)};
 const tip=box.querySelector(".pv-tip");
 svg.onmousemove=e=>{const t=e.target.closest&&e.target.closest("path.pv-r");if(!t){tip.hidden=true;return}const x=R.items[+t.dataset.i];if(R.done[x.n]||R.answered||x===R.wrong){tip.hidden=false;tip.textContent=x.n;const r=box.getBoundingClientRect();tip.style.left=(e.clientX-r.left+12)+"px";tip.style.top=(e.clientY-r.top+12)+"px"}else tip.hidden=true};
 svg.onmouseleave=()=>{tip.hidden=true};
 box.querySelectorAll("[data-z]").forEach(b=>b.onclick=()=>zoomAt(+b.dataset.z,W/2,H/2))}
const CONT=["Africa","Americas","Asia","Europe","Oceania"];let Q="";
const fold=t=>String(t).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
function tileHTML(l,S){const[cc,lab,noun,,nt]=l,best=S.best[cc+":"+S.mode];return'<button type="button" class="pv-tile" data-pv="'+cc+'" data-q="'+esc(fold(lab+" "+cc+" "+noun))+'" title="'+esc(noun+(nt?" · "+nt:""))+'"><img src="'+(typeof flagUrl==="function"?flagUrl(cc,"w80"):"")+'" alt="" loading="lazy"><b>'+esc(lab)+'</b>'+(best?'<small>best '+best+'</small>':'')+'</button>'}
function menuHTML(msg){const S=st(),L=LIST.filter(l=>S.mode!=="cap"||CAPS[l[0]]);return'<div class="pv-sec"><div class="dr-head"><h2>States & provinces</h2><p>Learn the map inside a country. Pick one of '+L.length+' countries to start.</p></div>'+(msg?'<p class="dr-msg">'+esc(msg)+'</p>':'')+
 '<div class="dr-row pv-moderow"><span>Mode</span>'+[["find","Find it on the map"],["name","Name the highlighted one"],["cap","Capitals"]].map(([k,l])=>'<button type="button" class="chip'+(S.mode===k?" active":"")+'" data-pvm="'+k+'">'+l+'</button>').join("")+'</div>'+
 '<div class="pv-search"><input type="search" id="pvSearch" placeholder="Search countries…" aria-label="Search countries" autocomplete="off" value="'+esc(Q)+'"></div>'+
 CONT.map(c=>{const T=L.filter(l=>l[3]===c).sort((a,b)=>a[1].localeCompare(b[1]));return T.length?'<div class="pv-cont" data-cont="'+c+'"><h3>'+c+' <small>'+T.length+'</small></h3><div class="pv-grid">'+T.map(l=>tileHTML(l,S)).join("")+'</div></div>':""}).join("")+
 '<p class="pv-none" hidden>No country matches.</p></div>'}
function filterMenu(sec){const q=fold(Q.trim());let any=false;sec.querySelectorAll(".pv-cont").forEach(g=>{let n=0;g.querySelectorAll(".pv-tile").forEach(t=>{const ok=!q||t.dataset.q.includes(q);t.hidden=!ok;if(ok)n++});g.hidden=!n;if(n)any=true});const no=sec.querySelector(".pv-none");if(no)no.hidden=any}
function wireMenu(sec){const S=st();sec.querySelectorAll("[data-pvm]").forEach(b=>b.onclick=()=>{S.mode=b.dataset.pvm;try{saveStats()}catch(e){}sec.outerHTML=menuHTML();ensure()});
 sec.querySelectorAll("[data-pv]").forEach(b=>b.onclick=()=>{const S2=st();S2.len=(triviaState().drills||{}).len||"10";start(b.dataset.pv,S2.mode)});
 const inp=sec.querySelector("#pvSearch");if(inp){inp.oninput=()=>{Q=inp.value;filterMenu(sec)};inp.onkeydown=e=>{if(e.key==="Enter"){const t=[...sec.querySelectorAll(".pv-tile")].find(x=>!x.hidden);if(t)t.click()}else if(e.key==="Escape"&&inp.value){e.stopPropagation();inp.value="";Q="";filterMenu(sec)}}}
 if(Q)filterMenu(sec)}
/* put the section under the drill tiles whenever the Drills menu is showing */
function ensure(){if(R)return;const v=document.getElementById("triviaView");if(!v)return;const opts=v.querySelector(".dr-wrap > .dr-opts");if(!opts||v.querySelector(".dr-card"))return;let sec=v.querySelector(".pv-sec");if(!sec){opts.insertAdjacentHTML("afterend",menuHTML());sec=v.querySelector(".pv-sec")}if(!sec._w){sec._w=1;wireMenu(sec)}}
new MutationObserver(()=>{try{ensure()}catch(e){}}).observe(document.documentElement,{childList:true,subtree:true});
{const _rt=renderTriviaView;renderTriviaView=function(){if(R&&triviaState().fcMode==="drills"){return render()}return _rt.apply(this,arguments)}}
document.addEventListener("keydown",e=>{if(!R||R.end)return;const v=document.getElementById("triviaView");if(!v||!v.querySelector(".pv-card"))return;
 if(e.key==="Escape"&&!R.answered){e.preventDefault();finish(false);return}
 if(e.key==="Enter"&&R.answered){const nx=document.getElementById("pvNext");if(nx){e.preventDefault();nx.click()}return}
 if(!R.answered&&R.opts&&/^[1-4]$/.test(e.key)){const b=v.querySelectorAll(".pv-opts .dr-o")[+e.key-1];if(b)b.click()}});
const css=document.createElement("style");css.textContent=`
.pv-sec{ margin-top:26px; }
.pv-moderow{ justify-content:center; margin-bottom:10px; }
.pv-grid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); gap:10px; }
.pv-search{ display:flex; justify-content:center; margin:4px 0 6px; } .pv-search input{ width:min(420px,100%); font:inherit; font-size:15px; padding:9px 14px; border-radius:999px; border:1px solid rgba(20,40,70,.18); background:rgba(255,255,255,.9); color:inherit; }
.pv-cont{ margin-top:14px; } .pv-cont h3{ font-size:16px; margin:0 0 8px 4px; } .pv-cont h3 small{ opacity:.55; font-weight:600; font-size:12px; } .pv-none{ text-align:center; opacity:.7; }
.pv-tile[hidden], .pv-cont[hidden]{ display:none; } .pv-note{ font-size:12px; opacity:.65; margin:2px 0 0; }
.pv-tile{ display:flex; flex-direction:column; align-items:center; gap:4px; border:0; background:rgba(255,255,255,.85); border-radius:16px; box-shadow:0 4px 14px rgba(20,40,70,.08); padding:12px 8px; cursor:pointer; font:inherit; color:inherit; }
.pv-tile:hover{ transform:translateY(-1px); box-shadow:0 6px 18px rgba(20,40,70,.14); } .pv-tile img{ height:30px; border-radius:3px; box-shadow:0 1px 4px rgba(0,0,0,.2); } .pv-tile b{ font-size:14px; } .pv-tile small{ opacity:.6; font-size:11px; }
.pv-wrap{ max-width:1000px; } .pv-card{ background:rgba(255,255,255,.92); border-radius:22px; box-shadow:0 6px 22px rgba(20,40,70,.1); padding:16px; text-align:center; } .pv-card h3{ font-size:20px; margin:6px 0 10px; }
.pv-map{ position:relative; height:min(62vh,520px); background:linear-gradient(#e7f2fa,#d8e9f5); border-radius:16px; overflow:hidden; touch-action:none; } .pv-map svg{ width:100%; height:100%; display:block; cursor:pointer; }
.pv-r{ fill:#f3ead7; stroke:#8a7a5c; stroke-width:calc(.8px / var(--pvk,1)); transition:fill .15s; } .pv-r:hover{ fill:#fff3c9; }
.pv-r.done{ fill:#cfe8cf; } .pv-r.target{ fill:#ffb14a; stroke:#a85a00; } .pv-r.right{ fill:#5cc06b; stroke:#2f7a3a; } .pv-r.reveal{ fill:#ffb14a; stroke:#a85a00; animation:pvPulse 1s ease-in-out 3; } .pv-r.wrong{ fill:#f08a84; }
@keyframes pvPulse{ 50%{ fill:#ffd79a; } }
.pv-lab{ font:700 calc(12px / var(--pvk,1)) system-ui,sans-serif; fill:#1f2a33; stroke:#fff; stroke-width:calc(3px / var(--pvk,1)); paint-order:stroke; text-anchor:middle; dominant-baseline:middle; pointer-events:none; }
.pv-zoom{ position:absolute; right:10px; top:10px; display:flex; flex-direction:column; gap:6px; } .pv-zoom button{ width:34px; height:34px; border-radius:50%; border:0; background:#fff; box-shadow:0 2px 8px rgba(0,0,0,.18); font-size:18px; cursor:pointer; color:#1f2a33; }
.pv-tip{ position:absolute; pointer-events:none; background:#1f2a33; color:#fff; font-size:12px; padding:3px 8px; border-radius:6px; }
.pv-endc h2{ font-size:42px; margin:6px 0; } .pv-missl{ max-width:640px; margin:8px auto; }
body.sky-night .pv-tile, body.sky-night .pv-card, body.dark-theme .pv-tile, body.dark-theme .pv-card{ background:rgba(30,34,60,.9); }
body.sky-night .pv-search input, body.dark-theme .pv-search input{ background:rgba(30,34,60,.9); border-color:rgba(255,255,255,.2); }
body.sky-night .pv-map, body.dark-theme .pv-map{ background:linear-gradient(#16223a,#101a2e); }`;
document.head.appendChild(css);
window.gfProvinces={start:start,LIST:LIST,load:load,projFor:projFor};
})();
