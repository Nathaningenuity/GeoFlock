/* GeoFlock: more hand-written trivia questions, mostly for the thinner topics and the easiest and hardest levels.
   One question a line, checked against standard references, numbers rounded:
     C|topic|part|difficulty|answer codes|"Which country …" text|why
       answer codes: "ar" one country; "ne+ng" name both; "me/xk" either one is right
     X|topic|part|difficulty|kind|answer|aliases;…|related country codes|question|why   (a typed answer that isn't a country)
   Ids run from 41000 in the order below; new lines only ever go at the end so saved progress keeps pointing at the right question. */
(function(){if(typeof TRIVIA_Q==="undefined")return;
const DATA=`
C|geo|flags|1|jp|has a white flag with a red disc, the 'circle of the sun'|The flag is called the Hinomaru. Japan's name means 'origin of the sun'.
C|geo|flags|1|il|has a white flag with a blue Star of David between two blue stripes|The stripes recall a Jewish prayer shawl, the tallit.
C|geo|flags|1|tr|has a red flag with a white crescent and star|The flag is called Ay Yıldız, 'moon star'.
C|geo|flags|2|pk|has a green flag with a white crescent and star and a white stripe at the hoist|Green stands for the Muslim majority, the white stripe for religious minorities.
C|geo|flags|2|fi|has a white flag with a blue Nordic cross|Blue for the thousands of lakes and the sky, white for the snow.
C|geo|flags|2|no|has a red flag with a blue Nordic cross edged in white|Norway's flag combines the colours of the French, US and British flags, all symbols of liberty in 1821.
C|geo|flags|3|is|has a blue flag with a red Nordic cross edged in white|Blue for the sea and mountains, white for ice and snow, red for volcanic fire.
C|geo|flags|1|se|has a blue flag with a yellow Nordic cross|The colours come from the old Swedish coat of arms of three golden crowns on blue.
C|geo|flags|1|mx|has a flag showing an eagle eating a snake while perched on a cactus|It shows the legend of the founding of Tenochtitlan, today's Mexico City.
C|geo|flags|3|br|has a flag whose blue globe shows the night sky over Rio de Janeiro|Its 27 stars stand for the 26 states and the Federal District. The motto reads 'Ordem e Progresso'.
C|geo|flags|2|au|has a flag with the Union Jack, the Southern Cross and a large seven-pointed star|The big star is the Commonwealth Star: six points for the states, one for the territories.
C|geo|flags|2|nz|has a blue flag with the Union Jack and four red stars of the Southern Cross|In 2016 voters chose to keep it over a new silver fern design.
C|geo|flags|1|vn|has a red flag with a single large yellow star|The five points of the star stand for workers, farmers, soldiers, intellectuals and young people.
C|geo|flags|1|cn|has a red flag with one large and four small yellow stars|The big star stands for the Communist Party, the four small ones for the people.
C|geo|flags|2|kr|has a white flag with a red and blue circle and four black bar patterns|The circle is the taegeuk (yin and yang); the bars are trigrams from the I Ching.
C|geo|flags|1|de|has a flag of black, red and gold horizontal stripes|The colours go back to the uniforms of volunteers who fought Napoleon.
C|geo|flags|2|sa|has a green flag with the Islamic creed written above a sword|Because it bears the shahada, the flag is never flown at half-mast.
C|geo|flags|4|ir|has 'Allahu Akbar' written 22 times along the edges of its green and red stripes|The 22 repeats recall the date of the 1979 revolution, 22 Bahman in the Iranian calendar.
C|geo|flags|4|iq|has 'Allahu Akbar' written in green on the white stripe of its red, white and black flag|The words were added in 1991; since 2008 they are written in Kufic script.
C|geo|flags|1|fr|has the blue, white and red 'Tricolore', a symbol of its 1789 revolution|Blue and red are the colours of Paris; white was the royal colour.
C|geo|flags|1|ie|has a green, white and orange vertical tricolour|Green for the Gaelic tradition, orange for supporters of William of Orange, white for peace between them.
C|geo|flags|2|pl|has a flag of white over red|Indonesia and Monaco have the same colours the other way round, red over white.
C|geo|flags|2|bd|has a green flag with a red disc set slightly towards the hoist|The disc is set off-centre so it looks centred when the flag flies.
C|geo|flags|3|pw|has a light blue flag with a yellow disc for the full moon|The full moon is the time for fishing, planting and celebrations in Palau.
C|geo|flags|3|sg|has a red-over-white flag with a crescent moon and five stars|The stars stand for democracy, peace, progress, justice and equality.
C|geo|flags|3|ba|has a blue flag with a yellow triangle and a line of white stars|The triangle roughly follows the country's shape; its three corners stand for the three main peoples.
C|geo|flags|1|ua|has a flag of blue over yellow|The colours are often read as blue sky over golden wheat fields.
C|geo|flags|4|me|has a red flag with a gold border and a gold double-headed eagle|The eagle comes from the arms of the Petrović-Njegoš dynasty that once ruled the country.
C|geo|flags|3|so|has a light blue flag with one white five-pointed star|The five points stand for the five regions where Somali people live.
C|geo|flags|4|ki|has a flag showing a frigatebird flying over a rising sun and waves|The waves stand for the Pacific; the islands spread across all four hemispheres.
C|geo|flags|2|gh|has a red, gold and green flag with a black star in the middle|The Black Star stood for African freedom when Ghana became independent in 1957.
C|geo|flags|3|la|has a flag with a white disc on a blue band between two red bands|The white disc is the full moon over the Mekong River.
C|geo|flags|3|mc|has a flag almost identical to Indonesia's, but a different shape|Both are red over white; Monaco's is 4:5, Indonesia's 2:3.
C|geo|flags|3|gr|has a flag of nine blue and white stripes with a white cross|The nine stripes are said to stand for the syllables of 'Freedom or Death'.
C|geo|flags|3|mv|has a red flag with a green rectangle and a white crescent|Red stands for the blood of national heroes, green for palms and peace.
C|politics|capitals|3|ec|has the highest official capital city, Quito, at about 2,850 m|Quito's old town was one of the first two places named World Heritage cities, in 1978.
C|politics|capitals|3|mt|has a capital, Valletta, built by the Knights of St John after a great siege|Valletta was founded in 1566, the year after the Ottoman siege of Malta failed.
C|politics|capitals|4|sc|has a capital named after Queen Victoria|Victoria, on Mahé island, is one of the smallest capitals in the world.
C|politics|capitals|2|ar|has a capital whose name means 'good airs' or 'fair winds'|Buenos Aires was named after a Virgin Mary venerated by sailors, Our Lady of Good Air.
C|politics|capitals|3|et|has a capital whose name means 'new flower'|Addis Ababa was founded in 1886 by Empress Taytu, wife of Menelik II.
C|politics|capitals|3|ke|has a capital named after a Maasai phrase for 'cool water'|Nairobi began in 1899 as a depot on the railway from Mombasa to Uganda.
C|politics|capitals|3|my|has a capital whose name means 'muddy confluence'|Kuala Lumpur grew up where the Klang and Gombak rivers meet, around tin mines.
C|politics|capitals|3|ge|has a capital whose name comes from its word for 'warm', for its hot springs|Tbilisi still has sulphur bathhouses in its old town, Abanotubani.
C|politics|capitals|3|bt|has a capital where a police officer directs traffic instead of traffic lights|Thimphu tried a traffic light once, but people preferred the policemen.
C|politics|capitals|3|li|has a capital, Vaduz, overlooked by its prince's castle|The princely family still lives in Vaduz Castle above the town.
C|politics|capitals|5|pw|has a capital, Ngerulmud, with only a few hundred people living nearby|Palau moved its capital from Koror in 2006.
C|politics|capitals|4|tv|has a capital, Funafuti, which is a coral atoll|Its airstrip is one of the largest open spaces on the atoll and doubles as a playground.
C|politics|capitals|4|er|has a capital, Asmara, listed as a World Heritage site for its Italian modernist buildings|Asmara was rebuilt by Italian colonists in the 1930s; its Fiat Tagliero garage looks like a plane.
C|politics|capitals|4|mr|has a capital, Nouakchott, that was only a small village until it was chosen in 1958|It was built as a capital just before independence in 1960 and now holds about a third of the people.
C|politics|capitals|4|bw|has a capital, Gaborone, built from scratch for independence in 1966|Before that the country had been run from Mafeking, outside its own borders.
C|politics|capitals|1|it|has a capital that surrounds another country entirely|Rome surrounds Vatican City, the world's smallest country.
C|politics|capitals|4|uy|has the southernmost national capital in the Americas|Montevideo lies at about 34.9° S, a little further south than Buenos Aires.
C|politics|capitals|2|mx|has a capital built on the ruins of an Aztec city on a drained lake bed|Mexico City stands on Tenochtitlan; the soft lake bed makes buildings slowly sink.
C|politics|capitals|3|pe|has a capital founded by Francisco Pizarro in 1535|Lima, the 'City of Kings', became the centre of Spain's empire in South America.
C|politics|capitals|3|co|has a capital at about 2,600 m in the Andes|Bogotá is one of the highest big cities in the world.
C|politics|capitals|4|tj|has a capital whose name means 'Monday', after the day of its market|Dushanbe was a village with a Monday bazaar before it became a Soviet capital.
C|politics|capitals|3|kr|has a capital about 50 km from a heavily guarded border|Seoul's metropolitan area holds about half of the country's people.
C|politics|capitals|4|ye|has a capital whose old city is famous for tall mud-brick tower houses|Old Sana'a has been lived in for over 2,500 years and is a World Heritage site.
X|politics|capitals|3|city|Reykjavík|reykjavik|is|Which capital's name means 'smoky bay'?|Early settlers saw steam rising from hot springs and thought it was smoke.
X|politics|capitals|3|city|Montevideo||uy|Which capital lies on the Río de la Plata, across the water from Buenos Aires?|The Río de la Plata is the widest estuary in the world.
X|politics|capitals|2|city|Astana|nur-sultan;nursultan;akmola;tselinograd|kz|Which city replaced Almaty as Kazakhstan's capital in 1997?|It has changed its name several times: Akmola, Astana, Nur-Sultan and Astana again.
X|politics|capitals|1|city|Moscow|moskva|ru|Which capital is home to the Kremlin and Red Square?|'Kremlin' means fortress; many old Russian towns have one.
X|politics|capitals|1|city|Athens|athina|gr|Which capital is home to the Acropolis?|The Parthenon on the Acropolis was finished in 432 BC.
X|politics|capitals|1|city|Beijing|peking;peiping|cn|Which capital is home to the Forbidden City?|The palace was the home of Chinese emperors for almost 500 years.
X|politics|capitals|2|city|Saint Petersburg|st petersburg;petrograd;leningrad|ru|Which city was Russia's capital from 1712 to 1918?|Peter the Great built it on marshland as his 'window on Europe'.
X|politics|capitals|3|city|Abidjan||ci|Which city was Côte d'Ivoire's capital until 1983?|It is still the country's largest city and economic centre.
X|politics|capitals|2|city|Seoul||kr|Which capital sits on the Han River?|The Han splits the city into a northern and a southern half.
X|politics|capitals|2|city|Budapest||hu|Which capital was formed in 1873 by joining Buda, Óbuda and Pest on either side of the Danube?|Buda is on the hilly west bank, Pest on the flat east bank.
X|politics|capitals|2|city|Prague|praha|cz|Which capital stands on the Vltava River and is famous for the Charles Bridge?|The Charles Bridge was begun in 1357.
X|politics|capitals|2|city|Lisbon|lisboa|pt|Which capital lies where the Tagus River meets the Atlantic?|An earthquake and tsunami destroyed much of it in 1755.
X|politics|capitals|3|city|Belgrade|beograd|rs|Which capital stands where the Sava flows into the Danube?|Its fortress has been fought over more than a hundred times.
X|politics|capitals|2|city|Kuala Lumpur|kl|my|Which capital is home to the Petronas Towers?|The twin towers were the tallest buildings in the world from 1998 to 2004.
X|politics|capitals|3|city|Oslo|christiania;kristiania|no|Which capital was called Christiania for about 300 years?|It took back its old Norse name, Oslo, in 1925.
X|politics|capitals|3|city|Jakarta||id|Which capital was called Batavia under Dutch rule?|Batavia was the headquarters of the Dutch East India Company in Asia.
X|politics|capitals|3|city|Harare||zw|Which capital was called Salisbury until 1982?|It was named after the British prime minister Lord Salisbury.
X|politics|capitals|3|city|Kinshasa||cd|Which capital was called Léopoldville until 1966?|It was named after King Leopold II of Belgium.
X|politics|capitals|5|city|N'Djamena|ndjamena;n djamena|td|Which capital was called Fort-Lamy until 1973?|It stands where the Chari and Logone rivers meet, on the border with Cameroon.
X|politics|capitals|4|city|Maputo||mz|Which capital was called Lourenço Marques until 1976?|It was named after a Portuguese trader who explored the bay in 1544.
X|politics|capitals|5|city|Malabo||gq|Which capital, on an island, was called Santa Isabel until 1973?|Malabo lies on Bioko island, not on the mainland part of the country.
X|politics|capitals|4|city|Bishkek|frunze|kg|Which capital was called Frunze in Soviet times?|It was named after Mikhail Frunze, a Red Army commander born there.
X|politics|capitals|5|city|Dushanbe|stalinabad|tj|Which capital was called Stalinabad from 1929 to 1961?|It got back its old name, which means 'Monday', after Stalin was denounced.
X|politics|capitals|4|city|Tbilisi|tiflis|ge|Which capital was known to the outside world as Tiflis until 1936?|The name comes from the Georgian word for 'warm'.
X|politics|capitals|4|city|Santo Domingo||do|Which capital was renamed Ciudad Trujillo after a dictator from 1936 to 1961?|It is the oldest European-founded city in the Americas still standing, from 1496.
X|politics|capitals|4|city|Ottawa|bytown|ca|Which capital was once called Bytown?|It was named after Colonel John By, who built the Rideau Canal.
C|politics|international|2|cn|is the only permanent member of the UN Security Council in East Asia|The five permanent members are China, France, Russia, the UK and the US.
C|politics|international|3|ve|is the only founding member of OPEC outside the Middle East|OPEC was founded in Baghdad in 1960 by Iran, Iraq, Kuwait, Saudi Arabia and Venezuela.
C|politics|international|2|ch|hosts the UN's European headquarters and the World Trade Organization, in Geneva|Geneva also hosts the Red Cross and the World Health Organization.
C|politics|international|3|at|hosts the International Atomic Energy Agency, in Vienna|Vienna is one of the four main UN sites, with New York, Geneva and Nairobi.
C|politics|international|3|it|hosts the UN Food and Agriculture Organization, in Rome|The FAO was founded in 1945 to fight hunger.
C|politics|international|4|ke|hosts the headquarters of the UN Environment Programme|Nairobi is the only main UN headquarters in the Global South.
C|politics|international|2|us|hosts the headquarters of the World Bank and the International Monetary Fund|Both were planned at Bretton Woods, New Hampshire, in 1944, and sit in Washington, D.C.
C|politics|international|2|nl|hosts the International Criminal Court|The ICC in The Hague tries people for genocide, war crimes and crimes against humanity.
C|politics|international|3|eg|hosts the headquarters of the Arab League|The league was founded in Cairo in 1945; its headquarters moved to Tunis from 1979 to 1990.
C|politics|international|4|sa|hosts the headquarters of the Organisation of Islamic Cooperation, in Jeddah|The OIC has 57 member states.
C|politics|international|3|gb|hosts the Commonwealth Secretariat, at Marlborough House in London|The Commonwealth has 56 member countries.
C|politics|international|3|ch|hosts the International Olympic Committee, in Lausanne|Pierre de Coubertin moved the IOC there in 1915, during the First World War.
C|politics|international|2|tr|has been in NATO since 1952 and has its largest city on two continents|Istanbul spans the Bosphorus between Europe and Asia.
C|politics|international|1|de|is the most populous country in the European Union|Germany has about 84 million people.
C|politics|international|3|no|voted against joining the EU in referendums in 1972 and 1994|It is still closely tied to the EU through the European Economic Area.
C|politics|international|4|is|is an island country in the European Economic Area but not in the EU|Iceland applied to join the EU in 2009 but dropped the application in 2015.
C|politics|international|4|me/xk|uses the euro without being in the EU or having an agreement with it, in the Balkans|Both switched from the German mark to the euro when it was launched.
C|politics|international|4|bg|adopted the euro on 1 January 2026, becoming the 21st eurozone country|It replaced the lev, which had been pegged to the euro for years.
C|politics|international|3|ru|holds a veto in the UN Security Council and has the most nuclear warheads|Russia and the US together hold about 90% of the world's nuclear weapons.
C|politics|international|4|id|hosted the 1955 Bandung Conference of newly independent Asian and African countries|It led to the Non-Aligned Movement of countries that sided with neither Cold War bloc.
C|politics|international|4|gm|left the Commonwealth in 2013 and rejoined in 2018|It returned after President Jammeh lost the 2016 election.
C|politics|international|4|ga|joined the Commonwealth in 2022, though it had been a French colony|Togo joined on the same day.
C|politics|international|3|rw|joined the Commonwealth in 2009, though it had been a German and then a Belgian colony|Rwanda also switched its schools from French to English in 2008.
C|politics|international|1|jp|is the only Asian member of the G7|The G7 also includes Canada, France, Germany, Italy, the UK and the US.
C|politics|international|2|br|hosted the 1992 Earth Summit in Rio de Janeiro|The summit opened the treaties on climate change and biodiversity for signing.
C|politics|international|2|eg|was the first Arab country to make peace with Israel, in 1979|The deal followed the Camp David Accords of 1978; President Sadat was killed in 1981.
C|politics|international|3|ae/bh|signed the Abraham Accords with Israel in 2020|Morocco and Sudan followed later the same year.
C|politics|international|4|ci|hosts the African Development Bank, in Abidjan|The bank moved to Tunis during a crisis from 2003 and returned in 2014.
C|politics|international|4|fj|hosts the headquarters of the Pacific Islands Forum, in Suva|The forum has 18 members, from Australia to the tiny atoll nations.
C|politics|international|4|gy|hosts the headquarters of CARICOM, the Caribbean Community, in Georgetown|Guyana is on the South American mainland, but culturally Caribbean.
C|politics|international|5|bw|hosts the Southern African Development Community's secretariat, in Gaborone|SADC has 16 member states.
C|politics|international|4|uy|hosts the Mercosur secretariat, in Montevideo|The bloc's founders were Argentina, Brazil, Paraguay and Uruguay.
X|politics|international|3|org|International Court of Justice|icj;world court|nl|Which court, in the Peace Palace in The Hague, settles disputes between countries for the UN?|Its 15 judges are elected for nine-year terms.
X|politics|international|2|org|International Olympic Committee|ioc|ch|Which body, based in Lausanne, chooses the host cities of the Olympic Games?|It was founded in Paris in 1894.
X|politics|international|1|org|FIFA|federation internationale de football association|ch|Which body, based in Zurich, runs world football and the World Cup?|It has 211 member associations, more than the UN has members.
X|politics|international|4|event|Peace of Westphalia|treaty of westphalia;westphalia|de|Which 1648 treaties ended the Thirty Years' War and are often seen as the start of the modern system of sovereign states?|They were signed in the cities of Münster and Osnabrück.
X|politics|international|3|event|Maastricht Treaty|treaty of maastricht;maastricht|nl|Which 1992 treaty, signed in a Dutch city, created the European Union?|It also set the path to the euro.
X|politics|international|3|event|Treaty of Rome|rome treaty|it|Which 1957 treaty created the European Economic Community?|Its six founders were Belgium, France, West Germany, Italy, Luxembourg and the Netherlands.
X|politics|international|3|event|Congress of Vienna|vienna congress|at|Which 1814–15 meeting of the great powers redrew Europe's map after Napoleon?|It kept a balance of power that lasted, with few big wars, for decades.
X|politics|international|3|event|Montreal Protocol|montreal|ca|Which 1987 agreement protects the ozone layer by phasing out CFCs?|It was the first UN treaty to be ratified by every country in the world.
X|politics|international|2|event|Kyoto Protocol|kyoto|jp|Which 1997 climate treaty, named after a Japanese city, set the first binding emission cuts?|It came into force in 2005; the Paris Agreement followed in 2015.
X|politics|international|3|org|OECD|organisation for economic co-operation and development;organization for economic cooperation and development|fr|Which group of 38 mostly rich countries, based in Paris, publishes economic data and the PISA school tests?|It grew out of the body that ran the Marshall Plan after the Second World War.
X|politics|international|4|org|Organisation of Islamic Cooperation|oic;organization of islamic cooperation|sa|Which body of 57 member states, based in Jeddah, speaks for the Muslim world?|It is the second-largest intergovernmental organisation after the UN.
X|politics|international|3|event|USMCA|cusma;t-mec;united states-mexico-canada agreement|us,mx,ca|Which trade agreement replaced NAFTA in 2020?|Canadians call it CUSMA and Mexicans T-MEC.
X|politics|international|2|org|UNESCO|united nations educational scientific and cultural organization|fr|Which UN agency, based in Paris, keeps the World Heritage List?|The first sites were listed in 1978, including the Galápagos Islands.
X|politics|international|1|org|UNICEF|united nations children's fund|us|Which UN agency, founded in 1946, works for children around the world?|It won the Nobel Peace Prize in 1965.
X|politics|international|2|org|Médecins Sans Frontières|msf;doctors without borders;medecins sans frontieres|fr|Which medical charity, founded in France in 1971, won the 1999 Nobel Peace Prize?|Its teams work in war zones and disasters in about 70 countries.
X|politics|international|3|org|ECOWAS|economic community of west african states;cedeao|ng|Which West African bloc, founded in 1975, has its headquarters in Abuja?|Mali, Burkina Faso and Niger left it in January 2025.
X|politics|international|5|org|Alliance of Sahel States|aes;confederation of sahel states;sahel alliance|ml,bf,ne|Which alliance did Mali, Burkina Faso and Niger form after breaking with ECOWAS?|They set it up as a defence pact in 2023 and made it a confederation in 2024.
X|politics|international|2|org|G20|group of twenty;g-20|za|Which group of big economies took in the African Union as a full member in 2023?|It holds about 85% of the world's economy.
X|politics|international|4|org|European Coal and Steel Community|ecsc|fr,de|Which 1951 community of six countries, pooling two heavy industries, was the seed of the EU?|The idea was to make war between France and Germany 'materially impossible'.
X|politics|international|4|event|Helsinki Accords|helsinki final act;helsinki agreement|fi|Which 1975 accords on security and human rights in Europe were signed in Finland's capital?|They were signed by 35 states, including the US and the Soviet Union.
X|politics|international|2|event|Good Friday Agreement|belfast agreement|gb,ie|Which 1998 agreement largely ended the conflict in Northern Ireland?|It was approved by referendums on both sides of the Irish border.
X|politics|international|3|event|Oslo Accords|oslo agreement|il,ps|In which 1993 agreements did Israel and the PLO recognise each other?|They were sealed with a handshake on the White House lawn.
X|politics|international|3|event|Camp David Accords|camp david|eg,il|Which 1978 accords between Egypt and Israel were agreed at a US presidential retreat?|Anwar Sadat and Menachem Begin shared the Nobel Peace Prize for them.
C|politics|government|3|bn|is an absolute monarchy ruled by a sultan on the island of Borneo|Its sultan has ruled since 1967, one of the longest reigns in the world.
C|politics|government|1|va|is ruled by the Pope|The Pope is an absolute monarch, elected by the cardinals in a conclave.
C|politics|government|3|is|has one of the oldest parliaments in the world, the Althing, founded in 930|It first met outdoors at Þingvellir, in a rift valley between two tectonic plates.
C|politics|government|2|il|has a parliament called the Knesset|The Knesset has 120 members, after the assembly of Jewish elders in ancient times.
C|politics|government|2|ru|has a parliament whose lower house is called the State Duma|'Duma' comes from the Russian word for 'to think'.
C|politics|government|2|de|has a parliament called the Bundestag|It meets in the Reichstag building, with a glass dome added in 1999.
C|politics|government|4|se|has a parliament called the Riksdag|Sweden's parliament has 349 members.
C|politics|government|4|es|has a parliament called the Cortes Generales|It has two chambers, the Congress of Deputies and the Senate.
C|politics|government|3|jp|has a parliament called the Diet|The National Diet has two houses, the House of Representatives and the House of Councillors.
C|politics|government|2|cn|has the world's largest parliament, the National People's Congress|It has close to 3,000 members and meets once a year in the Great Hall of the People.
C|politics|government|4|ua|has a parliament called the Verkhovna Rada|'Verkhovna Rada' means Supreme Council.
C|politics|government|5|lv|has a parliament called the Saeima|It has 100 members and meets in Riga.
C|politics|government|5|lt|has a parliament called the Seimas|It has 141 members and meets in Vilnius.
C|politics|government|5|ee|has a parliament called the Riigikogu|It meets in Toompea Castle in Tallinn.
C|politics|government|5|hr|has a parliament called the Sabor|The Sabor traces its history back to the 1200s.
C|politics|government|5|bd|has a parliament called the Jatiya Sangsad|It meets in a huge concrete building in Dhaka designed by the American architect Louis Kahn.
C|politics|government|3|tr|has a parliament called the Grand National Assembly|It first met in Ankara in 1920, during the war of independence.
C|politics|government|5|fi|has a parliament called the Eduskunta|In 1907 it seated the world's first women members of parliament.
C|politics|government|4|ch|has a Federal Council of seven members who together act as head of state|The presidency rotates every year among the seven councillors.
C|politics|government|2|us|has the oldest written national constitution still in use, from 1787|It has been amended 27 times.
C|politics|government|3|gb/nz/il|is one of the few countries with no single written constitution|Its constitution is spread across laws, court rulings and customs.
C|politics|government|2|jp|has the oldest continuous hereditary monarchy in the world|Tradition counts Emperor Naruhito as the 126th emperor.
C|politics|government|4|mx|elects its president for a single six-year term, the 'sexenio'|No president can ever be re-elected.
C|politics|government|4|au|has had compulsory voting in national elections since 1924|People who don't vote can be fined; turnout is usually around 90%.
C|politics|government|3|gb|is home to the monarch who is head of state of 15 countries|These Commonwealth realms include Canada, Australia, New Zealand and Jamaica.
C|politics|government|2|lu|is the world's only grand duchy|It is also one of the founding members of the EU and NATO.
C|politics|government|3|om|is a sultanate in the southeast of the Arabian Peninsula|Sultan Qaboos ruled for nearly 50 years until 2020.
C|politics|government|5|gq|has had the same president since 1979, the longest-serving non-royal head of state|Teodoro Obiang took power in a coup.
C|politics|government|4|cm|is led by Paul Biya, the oldest serving head of state, in power since 1982|He was re-elected in 2025 at the age of 92.
C|politics|government|3|tw|was the first place in Asia to legalise same-sex marriage, in 2019|The law followed a ruling by its constitutional court in 2017.
C|politics|government|4|ec|was the first country to give nature its own rights in its constitution, in 2008|'Pachamama', Mother Earth, has the right to exist and regenerate.
C|economy|mining|3|us|is the world's largest producer of natural gas|Much of it comes from shale rock, cracked open by fracking.
C|economy|mining|4|us|has been the world's largest exporter of liquefied natural gas since 2023|It overtook Australia and Qatar as new export terminals opened on the Gulf of Mexico coast.
C|economy|mining|4|ru|mines more diamonds by number of carats than any other country|Most come from Yakutia in Siberia, where the Mir mine left a hole over 500 m deep.
C|economy|mining|3|id|is the world's largest producer of nickel, much of it from Sulawesi|Nickel is used in stainless steel and in electric-car batteries.
C|economy|mining|3|mx|is the world's largest producer of silver|Spanish colonial silver from Zacatecas and Guanajuato was traded as far as China.
C|economy|mining|2|au|is the world's largest producer of iron ore|Most comes from the Pilbara in Western Australia and is shipped to China.
C|economy|mining|3|cn|is the world's largest producer of aluminium|It makes more than half of the world's aluminium.
C|economy|mining|3|ng|is usually Africa's largest oil producer, from the Niger Delta|Oil makes up most of its exports, but it imports much of its petrol.
C|economy|mining|3|py|gets almost all its electricity from hydropower and sells the surplus to Brazil and Argentina|It shares two giant dams: Itaipu with Brazil and Yacyretá with Argentina.
C|economy|mining|2|is|makes almost all its electricity from hydro and geothermal power and heats most homes with hot water from the ground|It also uses that cheap energy to smelt aluminium.
C|economy|mining|3|id|is the world's largest exporter of coal|Most of it goes to China and India.
C|economy|mining|4|sa|has Ghawar, the world's largest conventional oil field|Ghawar is about 280 km long and has produced oil since 1951.
C|economy|mining|4|qa/ir|shares the world's largest natural gas field, under the Persian Gulf|Qatar calls its part the North Field; Iran calls its part South Pars.
C|economy|mining|3|ca|has the Athabasca oil sands, in Alberta|The sands hold one of the biggest oil reserves in the world, as thick bitumen.
C|economy|mining|4|id|has the Grasberg mine, one of the world's biggest gold and copper mines, high in the mountains of Papua|The mine sits at over 4,000 m, near glaciers.
C|economy|mining|3|se|has the Kiruna iron mine, so large that the town above it is being moved|The new city centre is about 3 km east; some old buildings were moved whole.
C|economy|mining|4|cl|has Escondida, the world's largest copper mine|It lies in the Atacama Desert, at about 3,100 m.
C|economy|mining|3|au|produces most of the world's opal|Coober Pedy, Lightning Ridge and Andamooka are famous opal towns.
C|economy|mining|4|ca|is the world's largest producer of potash, mostly from Saskatchewan|Potash is used to make fertiliser.
C|economy|mining|4|za|is the world's largest producer of manganese|Manganese is needed to make steel.
C|economy|mining|3|za|is where the Cullinan, the largest gem diamond ever found, was dug up in 1905|It weighed about 3,106 carats; its biggest pieces are in the British Crown Jewels.
C|economy|mining|3|br|is the largest oil producer in South America|Most of its oil comes from deep under the seabed off Rio de Janeiro, below a thick layer of salt.
C|economy|mining|3|az|had some of the world's first industrially drilled oil wells, near Baku, in the 1840s|By 1900 Baku produced about half of the world's oil.
C|economy|mining|5|bh|was the first place on the Arab side of the Gulf to strike oil, in 1932|Its first well, Jebel Dukhan No. 1, is now a museum.
C|economy|mining|5|tm|has Galkynysh, one of the largest natural gas fields in the world|Turkmenistan sells most of its gas to China through a long pipeline.
X|economy|mining|2|landmark|Three Gorges Dam|three gorges|cn|Which dam on the Yangtze River is the world's largest power station?|It is about 2.3 km long and took 17 years to build.
X|economy|mining|3|landmark|Itaipu Dam|itaipu|br,py|Which giant hydroelectric dam on the Paraná River is shared by Brazil and Paraguay?|Its name means 'singing stone' in Guaraní.
X|economy|mining|5|landmark|Bingham Canyon Mine|bingham canyon;kennecott copper mine|us|Which open-pit copper mine near Salt Lake City is one of the deepest man-made holes in the world?|It is over 1 km deep and more than 4 km wide.
X|economy|mining|2|product|Nickel||id|Which metal, used in stainless steel and batteries, is mined above all in Indonesia?|Canada's Sudbury Basin, a huge meteorite crater, is another big source.
X|economy|mining|4|product|Bitumen|oil sands;tar sands;heavy oil;asphalt|ca|Which thick, tar-like form of oil is dug and pumped from the sands of northern Alberta?|It has to be heated or thinned before it will flow through pipes.
X|economy|mining|4|product|Titanium||au,za|Which strong, light metal, used in aircraft and artificial hips, comes from minerals like rutile and ilmenite?|It is named after the Titans of Greek myth.
X|economy|mining|4|product|Mercury|quicksilver|es|Which liquid metal was mined at Almadén in Spain for over 2,000 years?|Almadén once produced about a third of all the mercury ever used.
X|economy|mining|4|product|Palladium||ru|Which precious metal, used in car exhaust filters, is mined above all in Norilsk, Russia?|Norilsk, north of the Arctic Circle, is one of the coldest big cities on Earth.
X|economy|mining|3|product|Sulfur|sulphur|id|Which yellow element do miners still carry by hand out of the crater of Ijen volcano, on Java?|At night burning sulfur gas glows blue in the crater.
X|economy|mining|5|product|Iodine||cl|Which element, added to salt to prevent goitre, comes mostly from Chile's Atacama Desert?|It is a by-product of mining nitrate deposits.
C|economy|farming|3|cn|is the world's largest producer of tea|Tea has been drunk there for at least 2,000 years.
C|economy|farming|3|br|is the world's largest producer of soybeans|Much of it grows on the Cerrado, a tropical savanna.
C|economy|farming|3|ru|is the world's largest exporter of wheat|Much of it is shipped from Black Sea ports.
C|economy|farming|3|in|is the world's largest producer of bananas|Nearly all of them are eaten at home rather than exported.
C|economy|farming|2|mx|is the world's largest producer of avocados|The state of Michoacán grows most of them.
C|economy|farming|3|ir|grows about 90% of the world's saffron|Each crocus flower gives only three red threads, picked by hand.
C|economy|farming|3|pe|is the world's largest producer of quinoa|It overtook Bolivia in the 2010s, as quinoa became popular abroad.
C|economy|farming|3|id|has the Maluku Islands, once the only place where cloves and nutmeg grew|Europeans called them the Spice Islands and fought over them for centuries.
C|economy|farming|2|nz|has about four sheep for every person|In the 1980s there were over 20 sheep per person.
C|economy|farming|4|gt|is the world's largest producer of cardamom|The spice was brought by a German coffee planter in the 1910s; most is sold to the Middle East.
C|economy|farming|4|vn|is the world's largest producer of black pepper|It grows over a third of the world's pepper, mostly in the Central Highlands.
C|economy|farming|3|ng|is the world's largest producer of cassava|Cassava roots must be soaked or cooked to remove a natural poison.
C|economy|farming|3|tr|grows about two-thirds of the world's hazelnuts, along the Black Sea coast|Most chocolate spreads use Turkish hazelnuts.
C|economy|farming|3|us|is the world's largest producer of almonds|Most grow in California's Central Valley, pollinated by bees trucked in from across the country.
C|economy|farming|4|ke|is a top exporter of roses, many grown around Lake Naivasha|Flowers flown overnight to Europe are one of its biggest exports.
C|economy|farming|4|eg|is the world's largest producer of dates|Dates have been grown along the Nile for thousands of years.
C|economy|farming|4|cr|is the world's largest exporter of pineapples|Most of the pineapples sold in Europe and the US come from there.
C|economy|farming|1|lk|is famous for 'Ceylon tea'|Tea replaced coffee there after a disease wiped out the coffee plantations in the 1870s.
X|economy|farming|4|product|Khat|qat;chat|ye,et|Which leaf, chewed as a mild stimulant, takes up much of Yemen's farmland?|It needs a lot of water in one of the driest countries on Earth.
X|economy|farming|2|product|Palm oil||id,my|Which oil from a tropical tree is found in about half of supermarket products?|It gives more oil per hectare than any other crop.
X|economy|farming|2|product|Cotton||uz|Which crop, Uzbekistan's 'white gold', drained the Aral Sea through Soviet irrigation canals?|The Aral Sea has shrunk to about a tenth of its old size.
X|economy|farming|1|product|Cocoa|cacao;cocoa beans;cacao beans|ci,gh|Which beans are fermented, dried and roasted to make chocolate?|The Maya and Aztecs drank it bitter; the Aztecs used the beans as money.
C|geo|size|1|au|is the largest country in Oceania|It covers about 7.7 million km², close to the size of the contiguous United States.
C|geo|size|1|sa|is the largest country on the Arabian Peninsula|It covers about 2.15 million km², much of it desert.
C|geo|size|2|id|is the largest country in Southeast Asia|It stretches about 5,000 km from east to west.
C|geo|size|1|in|is the largest country in South Asia|It is the seventh-largest country in the world.
C|geo|size|2|ar|is the second-largest country in South America|It is the largest Spanish-speaking country in the world by area.
C|geo|size|3|in|is the second-largest country lying wholly in Asia|Only China is larger among countries entirely in Asia.
C|geo|size|2|mc|is the smallest country in the world after Vatican City|It covers about 2 km², part of it on land taken from the sea.
C|geo|size|3|nr|is the smallest country in Oceania|Nauru covers about 21 km² and is a single raised coral island.
C|geo|size|3|dk|is the smallest of the five Nordic countries, not counting Greenland and the Faroes|Its mainland, Jutland, is the only part joined to continental Europe.
C|geo|size|4|qa|is the smallest country on the mainland of the Arabian Peninsula|It is a peninsula of its own sticking into the Persian Gulf.
C|geo|size|2|br|is the largest country crossed by the equator|The equator also crosses Ecuador, Colombia, Gabon, Congo, DR Congo, Uganda, Kenya, Somalia, Indonesia, Kiribati, the Maldives and São Tomé.
C|geo|size|3|mg|is the largest country made up of a single island|Madagascar is the world's fourth-largest island.
C|geo|size|2|cl|is the longest country from north to south|It stretches about 4,300 km but is on average only about 175 km wide.
C|geo|population|1|in|became the world's most populous country in 2023|It overtook China, whose population has started to shrink.
C|geo|population|1|ng|is the most populous country in Africa|It has over 220 million people; Lagos is one of Africa's biggest cities.
C|geo|population|1|br|is the most populous country in South America|About half of all South Americans are Brazilian.
C|geo|population|2|id|is the most populous Muslim-majority country|About 240 million Indonesians are Muslim.
C|geo|population|1|mx|is the most populous Spanish-speaking country|It has about 130 million people; Spain has under 50 million.
C|geo|population|3|cd|has the most people of any country where French is an official language|It has over 100 million people, well ahead of France.
C|geo|population|3|et|is the most populous landlocked country|It has about 130 million people, more than any other country without a coast.
C|geo|population|3|sr|is the least populous country in South America|It has about 640,000 people, most living near the coast.
C|geo|population|3|sc|is the least populous country in Africa|Seychelles has about 120,000 people on its 115 islands.
C|geo|population|3|bd|is the most densely populated large country|About 175 million people live in an area only a little larger than Greece.
C|geo|population|2|mn|is the most sparsely populated country|It has about 2 people per km², half of them in the capital.
C|geo|population|2|jp|has the oldest population of any large country, with almost 3 in 10 people aged over 65|Its population has been shrinking since 2008.
C|geo|population|3|ne/td|has one of the highest birth rates in the world, about six children per woman|Half of the people are under 16.
C|geo|population|1|us|is the third most populous country|It has about 340 million people, after India and China.
C|geo|population|2|id|is the fourth most populous country|It has about 280 million people on thousands of islands.
C|geo|population|3|pk|is the fifth most populous country|It has about 250 million people.
C|geo|population|1|au|is the most populous country in Oceania|It has about 27 million people, most of them along the southeast coast.
C|geo|population|3|pg|is the second most populous country in Oceania|Papua New Guinea has about 10 million people and over 800 languages.
C|geo|population|2|se|is the most populous Nordic country|It has about 10.5 million people.
C|geo|population|4|in|has the largest number of people living abroad, about 18 million|The UN counts large Indian communities in the Gulf states, the US and the UK.
C|geo|population|3|lt|is the most populous of the three Baltic states|It has about 2.9 million people.
X|culture|festivals|2|festival|Carnival of Venice|venice carnival;carnevale di venezia;carnevale|it|Which festival is famous for its elaborate masks, worn on the canals and squares of an Italian city?|The masks once let rich and poor mix without being recognised.
X|culture|festivals|3|festival|Las Fallas|fallas;falles|es|Which festival in Valencia burns giant papier-mâché figures every March?|The figures, some as tall as buildings, are set alight on the night of 19 March.
X|culture|festivals|2|festival|Kumbh Mela|kumbh;maha kumbh;maha kumbh mela|in|Which Hindu pilgrimage, held by rivers in turn every few years, is the largest gathering of people on Earth?|Tens of millions bathed at Prayagraj, where the Ganges and Yamuna meet, in 2025.
X|culture|festivals|3|festival|Obon|bon;o-bon|jp|Which Japanese summer festival welcomes back the spirits of ancestors with lanterns and circle dances?|At the end, lanterns are often floated down rivers to guide the spirits back.
X|culture|festivals|1|festival|Hanukkah|chanukah;hanukah;chanukkah|il|Which Jewish festival of lights lasts eight nights?|One more candle is lit on the menorah each night.
X|culture|festivals|1|festival|Eid al-Fitr|eid;eid ul fitr;eid al fitr|sa,id|Which festival marks the end of the fasting month of Ramadan?|It begins when the new moon is sighted.
X|culture|festivals|3|festival|Loy Krathong|loi krathong|th|In which Thai festival do people float small decorated baskets on rivers under the full moon?|The baskets were traditionally made of banana leaves.
X|culture|festivals|2|festival|Burning Man|burningman|us|Which gathering in the Nevada desert ends with the burning of a giant wooden figure?|About 70,000 people build a temporary city there each summer.
X|culture|festivals|2|city|Edinburgh||gb|Which city hosts the world's largest arts festival, the Fringe, every August?|The Fringe began in 1947, when eight groups turned up uninvited to the new Edinburgh International Festival.
X|culture|festivals|1|city|Cannes||fr|Which town on the French Riviera hosts the film festival that awards the Palme d'Or?|The festival is held every May.
X|culture|festivals|3|city|Venice|venezia|it|Which city hosts the oldest film festival in the world, first held in 1932?|Its top prize is the Golden Lion.
X|culture|festivals|3|festival|Palio di Siena|palio;il palio|it|Which bareback horse race around a city square in Tuscany is run twice each summer?|The race lasts about 90 seconds; a horse can win without its rider.
X|culture|festivals|1|festival|Eurovision Song Contest|eurovision|ch|Which song contest, first held in 1956, sees countries send one song each?|Sweden and Ireland have each won it seven times.
X|culture|festivals|4|city|Oruro||bo|Which Bolivian mining city's carnival, famous for its devil dance, is a UNESCO masterpiece of heritage?|The Diablada dancers wear huge masks with horns and bulging eyes.
X|culture|festivals|3|festival|Durga Puja|durgotsav;sharadotsav|in|Which Hindu festival, the biggest of the year in Kolkata, celebrates the goddess Durga's victory over a buffalo demon?|Giant clay statues of Durga are carried to the river and immersed at the end.
X|culture|festivals|2|festival|Dragon Boat Festival|duanwu;duanwu festival|cn|Which Chinese festival is celebrated with boat races and sticky rice dumplings called zongzi?|It remembers the poet Qu Yuan, who drowned himself in a river around 278 BC.
X|culture|festivals|2|festival|Bonfire Night|guy fawkes night;guy fawkes day|gb|Which night of fireworks on 5 November remembers a failed plot to blow up the English Parliament?|Guy Fawkes was caught guarding barrels of gunpowder under the House of Lords in 1605.
X|culture|festivals|2|festival|Midsummer|midsommar|se|Which Swedish festival in June is celebrated by dancing around a maypole decorated with flowers?|Many Swedes say it is the most important day of the year after Christmas.
X|culture|festivals|3|festival|Semana Santa|holy week|es|What is the week before Easter called in Spain, when Seville fills with hooded processions?|Brotherhoods carry heavy floats with statues through the streets for hours.
X|culture|festivals|4|festival|Pushkar Camel Fair|pushkar fair;pushkar mela|in|Which fair in Rajasthan gathers tens of thousands of camels every November?|It takes place by a holy lake at the time of the Kartik full moon.
X|culture|festivals|4|festival|Timkat|timket|et|Which Ethiopian Orthodox festival celebrates the Epiphany in January with colourful processions?|Replicas of the Ark of the Covenant are carried out of every church.
X|culture|festivals|4|festival|Dashain|dasain;bada dashain|np|Which 15-day autumn festival is the biggest of the year in Nepal, when families gather and kites fill the sky?|Bamboo swings are put up in villages for the festival.
X|culture|festivals|3|festival|Chuseok|chusok;hangawi|kr|Which Korean harvest festival is celebrated with half-moon rice cakes called songpyeon?|Millions travel to their home towns to honour their ancestors.
X|culture|festivals|1|festival|Mardi Gras|fat tuesday;carnival|us|Which New Orleans celebration before Lent is famous for parades and strings of beads thrown from floats?|Its name is French for 'Fat Tuesday'.
X|culture|festivals|4|festival|Quebec Winter Carnival|carnaval de quebec;winter carnival;quebec carnival|ca|Which winter festival has an ice palace and a snowman mascot called Bonhomme?|It is one of the biggest winter carnivals in the world, held since 1955 in its modern form.
X|culture|festivals|3|city|Harbin||cn|Which Chinese city holds a famous Ice and Snow Festival with huge lit-up ice buildings?|Winter temperatures there often drop below −25 °C.
X|culture|festivals|5|festival|Guelaguetza|la guelaguetza|mx|Which July festival in Oaxaca brings together the dances of the region's indigenous peoples?|Its name is a Zapotec word for sharing or exchanging gifts.
X|culture|festivals|3|festival|King's Day|koningsdag;kings day|nl|Which Dutch holiday on 27 April turns the country orange?|The whole country becomes a giant street market and party.
X|culture|festivals|2|festival|Christmas market|christkindlmarkt;weihnachtsmarkt;christmas markets|de|Which German tradition fills town squares in December with stalls, mulled wine and gingerbread?|Dresden's Striezelmarkt has been held since 1434.
X|culture|festivals|2|festival|Glastonbury Festival|glastonbury|gb|Which music festival takes place on a dairy farm in Somerset?|It was first held in 1970, the day after Jimi Hendrix died; tickets cost £1 and included free milk.
X|culture|festivals|4|festival|Onam|thiruvonam|in|Which harvest festival of Kerala is celebrated with snake boat races and flower carpets?|It welcomes back the legendary king Mahabali.
X|culture|festivals|3|festival|Sukkot|sukkoth;feast of tabernacles;succot|il|Which Jewish autumn festival is spent partly in temporary huts with roofs of branches?|The huts remember the Israelites' 40 years in the desert.
X|culture|festivals|2|festival|Yom Kippur|day of atonement|il|Which Jewish day of fasting is the holiest of the year?|In Israel almost all traffic stops for the day.
X|culture|festivals|2|festival|Cinco de Mayo|5 de mayo|mx|Which holiday on 5 May marks a Mexican victory over French forces at Puebla in 1862?|It is celebrated more widely in the United States than in Mexico.
C|culture|festivals|3|nz|celebrates Waitangi Day on 6 February, for the treaty signed with Māori chiefs in 1840|The treaty is seen as the founding document of the country.
C|culture|festivals|1|fr|celebrates Bastille Day on 14 July|It marks the storming of the Bastille prison in Paris in 1789.
C|culture|festivals|3|no|celebrates Constitution Day on 17 May with children's parades|Its 1814 constitution is one of the oldest still in use.
C|culture|festivals|1|us|celebrates Independence Day on 4 July|The Declaration of Independence was adopted on 4 July 1776.
C|culture|festivals|1|ca|celebrates its national day on 1 July|It marks the joining of the first provinces in 1867.
C|culture|festivals|4|be|holds a carnival in Binche, where masked Gilles throw oranges at the crowd|The Gilles wear tall ostrich-feather hats and wooden clogs.
C|culture|festivals|5|mx|holds the 'Night of the Radishes', a radish-carving contest in Oaxaca every 23 December|Farmers carve giant radishes into nativity scenes and figures.
C|culture|festivals|4|th|holds a festival where monkeys are served a huge buffet among the temples of Lopburi|Thousands of macaques live in the town's old Khmer temples.
C|culture|festivals|4|jp|holds the Gion Matsuri every July in Kyoto|Huge wooden floats, some over 20 m tall, are pulled through the streets.
C|culture|festivals|4|kr|holds the Boryeong Mud Festival every summer|It began in 1998 to advertise cosmetics made from the local mud.
C|culture|festivals|2|vn|celebrates Tết, the lunar new year, as its biggest holiday|Families buy peach blossoms or kumquat trees to decorate their homes.
C|culture|festivals|4|ma|holds the Gnaoua World Music Festival in the seaside town of Essaouira|Gnawa music grew from the songs of people brought across the Sahara as slaves.
C|culture|festivals|5|my|holds the Rainforest World Music Festival in Sarawak, on Borneo|It is held near Kuching, at the foot of Mount Santubong.
C|culture|festivals|4|hu|holds the Sziget music festival on an island in the Danube|Sziget means 'island' in Hungarian.
C|culture|festivals|4|dk|holds the Roskilde Festival, one of Europe's largest music festivals|It has been run by volunteers for charity since 1971.
C|culture|festivals|4|bs|holds Junkanoo street parades on Boxing Day and New Year's Day|Dancers in costumes of crêpe paper parade to drums, cowbells and horns.
C|culture|food|3|se|is the home of surströmming, fermented Baltic herring|The tins bulge as the fish keeps fermenting; people open them outdoors.
C|culture|food|3|is|is the home of hákarl, fermented shark|The Greenland shark is poisonous when fresh, so it is buried and dried for months.
C|culture|food|4|it|is the home of casu marzu, a sheep's cheese with live insect larvae, from Sardinia|Its sale is banned, but it is still made at home.
C|culture|food|3|ph|is the home of balut, a boiled fertilised duck egg|It is sold by street vendors in the evening.
C|culture|food|2|ca|is the home of poutine, fries with cheese curds and gravy|It was first served in rural Quebec in the 1950s.
C|culture|food|3|au+nz|is one of the two countries that both claim the pavlova|The meringue dessert is named after the Russian ballerina Anna Pavlova, who toured both in the 1920s.
C|culture|food|2|pl|is the home of pierogi, filled dumplings|Polish towns hold whole festivals devoted to them.
C|culture|food|4|za|is the home of bobotie, spiced minced meat baked with an egg topping|It came to the Cape with cooks from Southeast Asia in the 1600s.
C|culture|food|4|uz|has plov, rice cooked in giant pots with meat and carrots, as its national dish|Tashkent has a whole plov centre where tonnes are cooked every day.
C|culture|food|3|ge|is the home of khachapuri, a boat-shaped bread filled with cheese and egg|The Adjarian kind is topped with butter and a raw egg yolk.
C|culture|food|3|mx|is the home of mole poblano, a sauce made with chillies and chocolate|Some moles have over 20 ingredients.
C|culture|food|2|pe|is the home of ceviche, raw fish 'cooked' in lime juice|It has its own national day, 28 June.
C|culture|food|1|kr|is the home of kimchi, fermented cabbage with chilli|Families make huge batches together each autumn, a custom called kimjang.
C|culture|food|3|br|has feijoada, a stew of black beans and pork, as its national dish|In Rio it is traditionally eaten on Wednesdays and Saturdays.
C|culture|food|3|my|has nasi lemak, rice cooked in coconut milk, as its national dish|It is served with sambal, peanuts, anchovies and egg, often for breakfast.
C|culture|sport|1|us|has won the most Olympic medals of all time|It has topped the medal table at most Summer Games since 1896.
C|culture|sport|1|jp|is the home of sumo wrestling|A wrestler loses if he leaves the ring or touches the ground with anything but the soles of his feet.
C|culture|sport|2|kr|is where the martial art of taekwondo was developed|Taekwondo became a full Olympic sport in 2000.
C|culture|sport|2|br|is the home of capoeira, a martial art disguised as a dance|It was developed by enslaved Africans.
C|culture|sport|3|ie|is the home of hurling, one of the fastest field sports|Players hit a small ball called a sliotar with a wooden stick called a hurley.
C|culture|sport|3|za|has won the men's Rugby World Cup four times, more than any other country|It won in 1995, 2007, 2019 and 2023.
C|culture|sport|3|au|has won the men's Cricket World Cup six times|Its wins came in 1987, 1999, 2003, 2007, 2015 and 2023.
C|culture|sport|5|ar|has pato, a game on horseback with a ball fitted with handles, as its national game|It was once played with a live duck in a basket; 'pato' means duck.
C|culture|sport|3|ca|has lacrosse as its national summer sport and ice hockey as its winter one|Lacrosse was first played by Indigenous peoples, who called it 'the Creator's game'.
C|culture|sport|3|in|is the home of kabaddi, a tag game played while holding one's breath|Raiders chant 'kabaddi, kabaddi' to show they have not taken a breath.
C|culture|sport|1|fr|hosted the 2024 Summer Olympics|The opening ceremony was held on boats along the Seine.
C|culture|sport|2|au|will host the 2032 Summer Olympics, in Brisbane|Australia hosted before in Melbourne in 1956 and Sydney in 2000.
C|culture|sport|2|it|hosted the 2026 Winter Olympics in Milan and Cortina d'Ampezzo|Italy hosted the Winter Games before in Cortina in 1956 and Turin in 2006.
C|culture|sport|3|sa|will host the 2034 FIFA World Cup|It will be the second World Cup in the Middle East, after Qatar 2022.
C|culture|sport|2|no|tops the all-time medal table of the Winter Olympics|Cross-country skiing and biathlon brought most of its medals.
C|culture|sport|1|jm|is the home of the sprinter Usain Bolt|His 100 m world record, 9.58 seconds, has stood since 2009.
C|culture|sport|3|ke|is famous for long-distance runners from the highlands around Iten|Eliud Kipchoge became the first person to run a marathon in under two hours, in 2019.
C|culture|sport|3|nz|has a rugby team, the All Blacks, that performs the haka before every match|The best-known haka, Ka Mate, was composed in the 1820s.
C|culture|sport|4|lk|won the 1996 Cricket World Cup, beating Australia in the final|It was the country's first World Cup win.
C|culture|sport|3|cu|has won more Olympic boxing gold medals than any other country except the US|Teófilo Stevenson won three Olympic heavyweight golds.
X|culture|sport|2|sport|Reggae||jm|Which music style, made famous by Bob Marley, began in Jamaica in the late 1960s?|Reggae was added to UNESCO's heritage list in 2018.
X|culture|sport|3|sport|Samba||br|Which dance and music, with roots in Bahia and Rio, fills Brazil's carnival parades?|Samba schools spend a whole year preparing their parades.
X|culture|sport|4|sport|Pehlwani|kushti|in,pk|What is the traditional mud-pit wrestling of India and Pakistan called?|Wrestlers train in clay pits called akharas.
C|words|names|1|ec|has a name meaning 'equator'|The equator passes about 25 km north of its capital, Quito.
C|words|names|3|th|has a name, Prathet Thai, meaning 'land of the free'|It is the only Southeast Asian country never colonised by Europeans.
C|words|names|3|fr|has a name meaning 'land of the Franks'|The Franks were a Germanic people who conquered Roman Gaul.
C|words|names|1|nl|has a name meaning 'low countries'|About a quarter of the country lies below sea level.
C|words|names|1|jp|has a name meaning 'origin of the sun'|In English it is often called the 'Land of the Rising Sun'.
C|words|names|3|kr/kp|has been called the 'Land of the Morning Calm'|The phrase comes from Joseon, the name of the old Korean kingdom.
C|words|names|3|ma|has a name in Arabic, al-Maghrib, meaning 'the west'|Its English name comes from the city of Marrakesh.
C|words|names|3|ir|has a name meaning 'land of the Aryans'|In 1935 it asked other countries to stop calling it Persia.
C|words|names|2|rw|is called the 'land of a thousand hills'|Almost all of the country is hilly; its lowest point is about 950 m above sea level.
C|words|names|2|in|is named after the Indus River|Most of the Indus now flows through Pakistan.
C|words|names|3|mu|is named after Prince Maurice of Nassau|Dutch sailors named it in 1598.
C|words|names|2|sl|has a name from the Portuguese for 'lion mountains'|Pedro de Sintra named the mountains around Freetown harbour in 1462.
C|words|names|1|ci|is named after the ivory trade|It asks to be called Côte d'Ivoire in every language.
C|words|names|4|bh|has a name meaning 'two seas' in Arabic|It may refer to the sweet springs under the salty sea around the islands.
C|words|names|4|tz|has a name made by joining Tanganyika and Zanzibar|The two united in 1964.
C|words|names|4|ls|has a name meaning 'land of the people who speak Sesotho'|Its old name under British rule was Basutoland.
X|words|names|3|oldname|Northern Rhodesia||zm|What was Zambia called before 1964?|Its copper mines made it one of the richest colonies in Africa.
X|words|names|3|oldname|Nyasaland||mw|What was Malawi called before 1964?|It was named after Lake Nyasa, now Lake Malawi.
X|words|names|2|oldname|East Pakistan||bd|What was Bangladesh called from 1955 to 1971?|It was separated from West Pakistan by about 1,600 km of India.
X|words|names|3|oldname|Kampuchea|democratic kampuchea|kh|What was Cambodia called under the Khmer Rouge?|Kampuchea is the Khmer name of the country.
X|words|names|3|oldname|British Guiana||gy|What was Guyana called before 1966?|Guyana is said to mean 'land of many waters'.
X|words|names|3|oldname|Dutch Guiana|surinam|sr|What was Suriname called as a colony of the Netherlands?|The Dutch got it from England in 1667 in exchange for New Amsterdam.
X|words|names|4|oldname|Bechuanaland||bw|What was Botswana called before 1966?|The Tswana people give the country its name.
X|words|names|4|oldname|Basutoland||ls|What was Lesotho called before 1966?|It is the only country entirely above 1,000 m.
X|words|names|3|oldname|South West Africa||na|What was Namibia called before independence in 1990?|It was run by South Africa from 1915.
X|words|names|3|oldname|Tanganyika||tz|What was mainland Tanzania called before it united with Zanzibar in 1964?|The name came from Lake Tanganyika.
X|words|names|5|oldname|French Somaliland|french somali coast;cote francaise des somalis|dj|What was Djibouti called before 1967, while it was a French colony?|It became independent in 1977.
X|words|names|4|oldname|French Sudan|soudan francais|ml|What was Mali called as a French colony?|It took the name of the medieval Mali Empire at independence in 1960.
X|words|names|4|oldname|New Hebrides||vu|What was Vanuatu called before 1980?|It was ruled jointly by Britain and France, with two police forces and two legal systems.
X|words|names|4|oldname|Gilbert Islands|gilberts|ki|What was Kiribati called before 1979?|Kiribati is the local way of saying 'Gilberts'.
X|words|names|4|oldname|Ellice Islands||tv|What was Tuvalu called under British rule?|Tuvalu means 'eight standing together', for its inhabited islands.
X|words|names|4|oldname|Spanish Guinea||gq|What was Equatorial Guinea called before 1968?|It is the only African country with Spanish as an official language.
X|words|names|1|oldname|Swaziland||sz|What was Eswatini called until 2018?|The king announced the change on the 50th anniversary of independence.
X|words|names|1|oldname|Czechoslovakia||cz,sk|Which country split peacefully into two in 1993?|The 'Velvet Divorce' followed the Velvet Revolution of 1989.
X|words|names|4|oldname|Irish Free State||ie|What was Ireland officially called from 1922 to 1937?|It became a republic in 1949.
X|words|names|2|oldname|Dutch East Indies|netherlands east indies|id|What was Indonesia called as a Dutch colony?|The Dutch ruled parts of it for over 300 years.
X|words|names|2|oldname|French Indochina|indochina|vn,la,kh|What was the French colony made up of today's Vietnam, Laos and Cambodia called?|It was formed in 1887 and broke up in 1954.
X|words|names|4|oldname|Saint-Domingue|saint domingue|ht|What was Haiti called as a French colony?|In the 1780s it produced about 40% of Europe's sugar.
C|history|ancient|1|mx|was the heart of the Aztec Empire|The Aztec capital, Tenochtitlan, was one of the largest cities in the world in 1500.
C|history|ancient|1|kh|is where the Khmer Empire built Angkor Wat|It is the largest religious monument in the world and appears on the national flag.
C|history|ancient|2|tn|is where the ancient city of Carthage stood|Rome destroyed Carthage in 146 BC at the end of the Punic Wars.
C|history|ancient|2|tr|is where the ruins of Troy were found|Heinrich Schliemann dug there in the 1870s, looking for Homer's city.
C|history|ancient|3|gr|is where Alexander the Great was born, at Pella in ancient Macedon|He was taught as a boy by the philosopher Aristotle.
C|history|ancient|2|iq|is where the ancient city of Babylon stood|Its Ishtar Gate, covered in blue glazed bricks, was rebuilt in a Berlin museum.
C|history|ancient|3|lb|is where Byblos stands, one of the oldest continuously inhabited towns|The Greek word for book, biblos, came from the papyrus traded through Byblos.
C|history|ancient|1|jo|is where Petra, the 'rose-red city' of the Nabataeans, stands|Its buildings were carved straight out of the sandstone cliffs.
C|history|ancient|2|ir|is where the ruins of Persepolis stand|Alexander the Great burned the palace in 330 BC.
C|history|ancient|1|zw|is where the stone ruins of Great Zimbabwe stand|The country took its name from them; 'zimbabwe' means 'houses of stone'.
C|history|ancient|2|cl|is where the Moai statues of Rapa Nui stand|There are almost 900 of them on Easter Island.
C|history|ancient|1|cn|is where the Terracotta Army was found in 1974|Farmers digging a well found the first pieces of the 8,000 clay soldiers.
C|history|ancient|1|mn|is the homeland of Genghis Khan|His empire became the largest contiguous land empire in history.
C|history|ancient|4|mx|was the home of the Olmecs, famous for their giant stone heads|The Olmecs are often called the 'mother culture' of Mesoamerica.
C|history|ancient|4|tr|was the home of the Hittite Empire, ruled from Hattusa|The Hittites signed one of the oldest known peace treaties, with Egypt, around 1259 BC.
C|history|ancient|4|et|was the home of the Kingdom of Aksum, famous for its giant stone obelisks|Aksum was one of the first states to adopt Christianity, in the 300s.
C|history|ancient|2|ml|was the heart of the medieval Mali Empire of Mansa Musa|Timbuktu became a great centre of learning under the empire.
C|history|ancient|3|ng|was home to the Kingdom of Benin, famous for its bronze sculptures|British soldiers looted thousands of the bronzes in 1897; some have now been returned.
C|history|ancient|5|id|was the centre of Srivijaya, a Buddhist trading empire based on Sumatra|Srivijaya controlled the Strait of Malacca from about the 600s to the 1200s.
C|history|ancient|5|vn|was home to the Champa kingdoms, whose red-brick towers stand at Mỹ Sơn|The Cham people still live in southern Vietnam and Cambodia.
C|history|ancient|5|za|was home to the Kingdom of Mapungubwe, famous for a little golden rhinoceros|Mapungubwe flourished around 1220–1290 by the Limpopo River.
C|history|ancient|2|pe|has the Nazca Lines, huge drawings scratched into the desert|The figures include a hummingbird, a monkey and a spider, best seen from the air.
C|history|ancient|5|in|was home to the Chola dynasty, which sent navies to Southeast Asia|The Cholas built the great Brihadeeswarar Temple at Thanjavur around 1010.
C|history|ancient|2|tr|is where Constantinople, capital of the Byzantine Empire, stood|It fell to the Ottomans in 1453 and is now Istanbul.
C|history|ancient|4|de|was home to Lübeck, the leading city of the Hanseatic League of trading towns|At its height the Hansa linked about 200 towns around the Baltic and North Sea.
C|history|modern|2|be|is where the Battle of Waterloo was fought in 1815|Napoleon was defeated by Wellington and the Prussian general Blücher.
C|history|modern|1|de|is where the Berlin Wall fell in 1989|The wall had divided the city for 28 years.
C|history|modern|1|jp|is where the first atomic bomb used in war fell, on Hiroshima, in 1945|A second bomb fell on Nagasaki three days later.
C|history|ancient|2|gb|is where Magna Carta was sealed in 1215|King John agreed to it at Runnymede, beside the River Thames.
C|history|ancient|2|gb|is where the Battle of Hastings was fought in 1066|William the Conqueror's victory is shown on the Bayeux Tapestry.
C|history|modern|2|de|was united by Otto von Bismarck in 1871|The German Empire was declared in the Hall of Mirrors at Versailles.
C|history|modern|2|it|was united in 1861 after campaigns led by Garibaldi|Rome joined only in 1870 and became the capital in 1871.
C|history|modern|1|ie|suffered the Great Famine of 1845–52|About a million people died and another million emigrated.
C|history|modern|3|cz|ended communist rule in the peaceful 'Velvet Revolution' of 1989, as part of Czechoslovakia|The playwright Václav Havel became president.
C|history|colonial|4|ph|was handed by Spain to the United States in 1898 for $20 million|The Treaty of Paris ended the Spanish–American War.
C|history|modern|1|cu|was at the centre of the 1962 missile crisis|For 13 days the US and the Soviet Union came close to nuclear war.
C|history|colonial|2|gh|was led to independence in 1957 by Kwame Nkrumah|It was one of the first colonies south of the Sahara to become independent.
C|history|modern|1|za|elected Nelson Mandela as its first Black president in 1994|He had spent 27 years in prison.
C|history|colonial|3|ke|was led to independence in 1963 by Jomo Kenyatta|His son Uhuru later became president too.
C|history|colonial|1|in|won independence in 1947 after a long campaign led by Mahatma Gandhi|Gandhi's 1930 Salt March was a famous act of peaceful protest.
C|history|modern|2|et|was ruled by Emperor Haile Selassie until 1974|Rastafarians in Jamaica see him as a messiah.
C|history|modern|2|ir|was ruled by a shah until the revolution of 1979|Ayatollah Khomeini returned from exile to lead the new Islamic Republic.
C|history|modern|2|ru|is where the Battle of Stalingrad was fought in 1942–43|It was one of the bloodiest battles in history and a turning point of the Second World War.
C|history|modern|1|fr|is where the D-Day landings took place in June 1944|About 156,000 troops landed on the beaches of Normandy on the first day.
C|history|modern|2|gb|is where the Titanic was built, in Belfast|It sank on its first voyage in 1912 after hitting an iceberg.
C|history|colonial|3|ly|was invaded by Italy in 1911|Omar Mukhtar led the resistance for twenty years until he was hanged in 1931.
C|history|colonial|2|et|was never colonised, apart from an Italian occupation in 1936–41|It defeated an Italian army at Adwa in 1896.
C|history|modern|2|sk|split peacefully from the Czech Republic in 1993|The split is called the Velvet Divorce.
C|history|modern|3|no|became independent from Sweden in 1905|It chose a Danish prince as its king, Haakon VII.
C|history|modern|3|is|became fully independent from Denmark in 1944|It was declared at Þingvellir while Denmark was occupied by Germany.
C|history|modern|2|fi|declared independence from Russia in 1917|It had been a grand duchy of the Russian Empire since 1809.
C|history|colonial|2|pk|was created in 1947 as a homeland for the Muslims of British India|It was made of two parts more than 1,500 km apart.
C|history|modern|2|sg|was separated from Malaysia in 1965|Its first prime minister, Lee Kuan Yew, cried on television announcing the split.
C|history|colonial|3|mx|won independence from Spain in 1821|The war began in 1810 with Father Hidalgo's 'Cry of Dolores'.
C|history|colonial|2|br|became independent from Portugal in 1822 under a Portuguese prince|Prince Pedro became Emperor Pedro I of Brazil.
X|history|ancient|2|empire|Byzantine Empire|byzantium;eastern roman empire;byzantines|tr|Which empire, ruled from Constantinople, built the Hagia Sophia in 537?|It lasted for about a thousand years after the western Roman Empire fell.
X|history|colonial|4|person|Atahualpa|atahuallpa|pe|Which Inca emperor was captured by Francisco Pizarro at Cajamarca in 1532?|He filled a room with gold as a ransom, but was killed anyway.
X|history|colonial|3|person|Moctezuma|montezuma;moctezuma ii;motecuhzoma|mx|Which Aztec ruler met Hernán Cortés in 1519?|He died in 1520, while being held by the Spanish.
X|history|colonial|3|person|Toussaint Louverture|toussaint l'ouverture;toussaint|ht|Who led the revolt of enslaved people in Saint-Domingue that led to Haitian independence?|He died in a French prison in 1803, less than a year before Haiti's independence.
X|history|colonial|2|person|Shaka|shaka zulu|za|Which king built the Zulu kingdom into a great power in the early 1800s?|He is said to have introduced a short stabbing spear and the 'buffalo horns' battle formation.
X|history|colonial|4|person|Menelik II|menelik|et|Which Ethiopian emperor defeated an Italian army at the Battle of Adwa in 1896?|He also founded Addis Ababa.
X|history|ancient|1|person|Tutankhamun|tutankhamen;king tut;tutankhamon|eg|Which boy pharaoh's tomb was found almost untouched by Howard Carter in 1922?|His gold death mask weighs about 10 kg.
X|history|ancient|2|person|Shah Jahan|shahjahan|in|Which Mughal emperor built the Taj Mahal in memory of his wife Mumtaz Mahal?|He spent his last years imprisoned by his son, with a view of the Taj.
X|history|ancient|2|empire|Ottoman Empire|ottomans;ottoman|tr|Which empire was founded by Osman I around 1299?|It lasted over 600 years, until 1922.
X|history|ancient|4|empire|Achaemenid Empire|achaemenids;persian empire;first persian empire|ir|Which Persian empire did Cyrus the Great found in about 550 BC?|At its height it ruled about two-fifths of all the people alive.
X|history|ancient|3|civilisation|Minoans|minoan;minoan civilisation;minoan civilization|gr|Which Bronze Age civilisation built the palace of Knossos on Crete?|They are named after the legendary King Minos.
X|history|ancient|3|event|Fall of Constantinople|siege of constantinople|tr|Which event of 1453 ended the Byzantine Empire?|The Ottomans used huge cannons to break the city's walls.
X|history|modern|2|event|Spanish flu|1918 flu;1918 influenza|us|Which pandemic of 1918–20 killed tens of millions of people?|It was called 'Spanish' because neutral Spain's newspapers reported it freely.
X|history|modern|4|volcano|Tambora|mount tambora|id|Which Indonesian volcano's 1815 eruption caused the 'Year Without a Summer'?|It was the largest eruption in recorded history.
X|history|ancient|1|volcano|Vesuvius|mount vesuvius;vesuvio|it|Which volcano buried Pompeii and Herculaneum in AD 79?|It is the only active volcano on mainland Europe.
X|history|colonial|3|event|Berlin Conference|congo conference;west africa conference|de|Which 1884–85 meeting set the rules for European powers carving up Africa?|No Africans were invited.
C|geo|borders|4|az|has an exclave, Nakhchivan, separated from the rest of the country by Armenia|Nakhchivan borders Iran and has a short border with Turkey.
C|geo|borders|4|om|has an exclave, the Musandam Peninsula, on the Strait of Hormuz|Its fjord-like inlets are called the 'Norway of Arabia'.
C|geo|borders|5|tl|has an exclave, Oecusse, surrounded by Indonesian West Timor and the sea|Oecusse was where the Portuguese first settled on Timor.
C|geo|borders|5|be|has a town, Baarle-Hertog, made of about 20 small enclaves inside the Netherlands|Some houses are split by the border; the address goes by where the front door is.
C|geo|borders|2|ru|has an exclave, Kaliningrad, between Poland and Lithuania|Before 1945 the city was the German city of Königsberg.
C|geo|borders|3|dk|has a land border with only one country, Germany|The border runs across the base of the Jutland peninsula.
C|geo|borders|2|pt|has a land border with only one country, Spain|Their border, settled in 1297, is one of the oldest in Europe.
C|geo|borders|3|qa|has a land border with only one country, Saudi Arabia|Saudi Arabia closed the border from 2017 to 2021.
C|geo|borders|2|gb|has a land border with only one country, Ireland|The border runs about 500 km across the island of Ireland.
C|geo|borders|3|bn|has a land border with only one country, Malaysia|Malaysia's Limbang district splits it into two parts.
C|geo|borders|3|pg/tl|has its only land border with Indonesia|The two countries share islands with Indonesia: New Guinea and Timor.
C|geo|location|3|ir|is the only country with coasts on both the Caspian Sea and the Persian Gulf|It also borders the Gulf of Oman.
C|geo|location|2|eg/il|has coasts on both the Mediterranean and the Red Sea|The Suez Canal links the two seas.
C|geo|location|4|cy|is the easternmost member of the European Union|Geographically the island lies in Asia, south of Turkey.
C|geo|location|1|za|is the southernmost country in Africa|Cape Agulhas, not the Cape of Good Hope, is Africa's southern tip.
C|nature|terrain|3|au|has Mount Kosciuszko, at 2,228 m the highest point of its mainland|It was named after a Polish-Lithuanian general.
C|nature|terrain|1|tz|has Mount Kilimanjaro, the highest mountain in Africa|At 5,895 m it is the highest mountain in the world that stands on its own.
C|nature|terrain|2|ar|has Aconcagua, the highest mountain in the Americas|At about 6,960 m it is the highest peak outside Asia.
C|nature|terrain|5|cl/ar|has Ojos del Salado, the highest volcano on Earth, on its border|It is about 6,890 m high and has the highest lake in the world near its summit.
C|nature|terrain|4|et|has the Danakil Depression, one of the hottest and lowest places on Earth|Its Dallol area has yellow and green hot springs, about 125 m below sea level.
C|nature|terrain|5|ir|has the Lut Desert, where satellites have measured some of the hottest ground temperatures on Earth|Ground temperatures of about 70 °C have been recorded there.
C|nature|water|3|bd/in|has the Sundarbans, the largest mangrove forest in the world|It is home to Bengal tigers that swim between the islands.
C|nature|wildlife|1|id|is home to the Komodo dragon, the largest lizard|It can grow to about 3 m long.
C|nature|terrain|2|ch/it|has the Matterhorn on its border|Its pyramid shape inspired the Toblerone logo.
C|nature|water|4|tz|has Lake Natron, whose salty red water can preserve dead birds like stone|It is also the main breeding ground of lesser flamingos.
C|nature|terrain|1|au|has Uluru, a giant sandstone rock in the desert|Uluru is sacred to the Anangu people; climbing it was banned in 2019.
C|nature|terrain|2|gb|has the Giant's Causeway, about 40,000 basalt columns|The columns formed when lava cooled and cracked about 60 million years ago.
C|nature|terrain|3|no|has the Svalbard archipelago, where people must carry protection against polar bears outside town|Svalbard also has a seed vault holding copies of the world's crop seeds.
C|nature|terrain|2|tr|has the white travertine terraces of Pamukkale|The name means 'cotton castle'.
C|nature|water|4|au|has Lake Hillier, a lake that stays bright pink|Its colour comes from salt-loving algae and bacteria.
C|nature|terrain|5|cn|has the Yarlung Tsangpo Grand Canyon, often called the deepest canyon on Earth|The river, called the Brahmaputra further on, cuts around the peak of Namcha Barwa.
C|nature|terrain|3|vn|has Son Doong, the largest cave passage in the world|A jungle and a river grow inside it; it was only explored in 2009.
C|nature|terrain|4|us|has Mammoth Cave, the longest known cave system in the world|Over 680 km of passages have been mapped.
C|nature|terrain|1|eg|has the Sinai Peninsula|The peninsula joins Africa to Asia.
C|nature|terrain|2|ru|has the Kamchatka Peninsula, with dozens of active volcanoes|It also has the Valley of Geysers.
C|nature|terrain|2|mx|has most of the Yucatán Peninsula|The asteroid that wiped out the dinosaurs struck near its coast, at Chicxulub.
C|nature|wildlife|2|au|is the only country where koalas live in the wild|Koalas sleep up to 20 hours a day.
C|nature|wildlife|4|bw|has more African elephants than any other country|Around 130,000 elephants live there, many along the Chobe River.
C|nature|wildlife|5|tz|has more lions than any other country|Serengeti, Ruaha and Nyerere parks hold much of Africa's lion population.`;
const have=new Set(TRIVIA_Q.map(q=>q.id)),added=[];
DATA.split("\n").forEach((l,i)=>{l=l.trim();if(!l)return;const p=l.split("|"),id=41000+i;if(have.has(id))return;let q;
 if(p[0]==="C"){const codes=p[4],either=codes.includes("/");q={s:p[1],b:p[2],d:+p[3],a:codes.split(/[+/]/),t:p[5],w:p[6]||undefined,q:4,id,gx:1,more:1};if(either)q.e=1}
 else if(p[0]==="X"){q={s:p[1],b:p[2],d:+p[3],a:[],x:{n:p[5],al:p[6]?p[6].split(";").filter(Boolean):[],k:p[4]},kc:p[7]?p[7].split(",").filter(Boolean):[],t:p[8],w:p[9]||undefined,q:4,id,gx:1,more:1}}
 if(!q)return;TRIVIA_Q.push(q);added.push(q);if(q.x&&typeof TV_PLACES_Q!=="undefined")TV_PLACES_Q.push(q)});
/* the answer lists for typing were built before this file loaded, so add these answers to them */
try{const G=TV_X_GROUP;added.forEach(q=>{if(!q.x)return;const g=G[q.x.k]||"region";(TV_X_POOL[g]=TV_X_POOL[g]||new Map).set(q.x.n,q.x.al||[]);TV_X_KIND_OF[q.x.n]=q.x.k})}catch(e){}
/* the engine's per-part tallies */
try{added.forEach(q=>{const k=q.s+":"+q.b;if(typeof TV_BLOCK_QIDS!=="undefined"&&TV_BLOCK_QIDS[k]&&!TV_BLOCK_QIDS[k].includes(q.id))TV_BLOCK_QIDS[k].push(q.id);if(typeof TV_BLOCK_SIZE!=="undefined")TV_BLOCK_SIZE[k]=(TV_BLOCK_SIZE[k]||0)+1})}catch(e){}
window.GF_TRIVIA_MORE=added.length;
})();
