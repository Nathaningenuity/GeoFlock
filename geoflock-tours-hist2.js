/* GeoFlock: three era tours for the History shelf.
   hwars    "The World Wars" (1914–1945)
   hcoldwar "Cold War and the end of empires" (1945–1991)
   hsince91 "The world since 1991"
   They play on the History map (a year frame and a highlighted group from terra-atlas-history.js, set by each stop's
   sub:"<year>/<group>"), with countries, lines and pins drawn on top. Two new card simulations (the human cost of
   World War II; the UN growing from 51 to 193 members) and three reused ones (the nuclear arms race, steady growth). */
/* photos added for these tours (Wikimedia Commons; licence and author in each entry). The rest come from the shared library. */
window.GF_HIST2_PHOTOS=[];
(function(){
if(typeof PS_TOURS==="undefined"||typeof PS_TOUR_ORDER==="undefined")return;
const TL="#6d4c41",W=[-180,-58,180,80];
const S=o=>Object.assign({_autoSpin:1,_ctx:1,_lg:1,_ky:1,_enr:1,_histWide:1},o);
const ph=(at,label)=>({at,label,col:TL,icon:"photo"});
const USSR=["ru","ua","by","md","ee","lv","lt","ge","am","az","kz","uz","tm","kg","tj"];
const fix=s=>{if(s.G){s._hsMerged=1;s.legend=null;s.hi=s.hi||[...new Set(s.G.flatMap(g=>g.codes))];s.hiSoft=s.hiSoft||[]}return s};

/* =============================================================== 1. The World Wars */
const WARS=[
S({title:"A world at war",view:W,globe:[20,30,1],sub:"1914",
 phPins:[ph([18.43,43.86],"Latin Bridge, Sarajevo"),ph([26.29,40.24],"Anzac Cove"),ph([44.5,48.7],"Stalingrad"),ph([19.2,50.03],"Auschwitz-Birkenau"),ph([-157.95,21.36],"USS Arizona Memorial"),ph([132.45,34.4],"Genbaku Dome"),ph([-73.97,40.75],"UN General Assembly")],
 stat:"Between 1914 and 1945, two world wars killed more than 80 million people",
 body:"In just 31 years the world fought two wars that reached every continent. Empires that had ruled for centuries fell, new countries were born, and whole cities were destroyed from the air.",
 more:"This tour follows the story from a shot in Sarajevo to the founding of the United Nations. The map starts in 1914, when a handful of European empires ruled most of the planet."}),
S({title:"A shot in Sarajevo",view:[4,36,32,55],globe:[18,46,2.2],sub:"1914/ah",card:"left",
 pins:[[[18.43,43.86],"Sarajevo, 28 June 1914","point"],[[16.37,48.21],"Vienna","point"],[[20.46,44.82],"Belgrade","point"],[[13.4,52.52],"Berlin","point"]],
 phPins:[ph([18.43,43.86],"Latin Bridge, Sarajevo")],
 stat:"On 28 June 1914 a 19-year-old shot the heir to Austria-Hungary’s throne, and within six weeks most of Europe was at war",
 body:"Gavrilo Princip, a Bosnian Serb nationalist, killed Archduke Franz Ferdinand and his wife Sophie near the Latin Bridge in Sarajevo. Austria-Hungary blamed Serbia and declared war on it a month later.",
 more:"Alliances pulled everyone in: Russia backed Serbia, Germany backed Austria-Hungary, France was Russia’s ally, and Britain joined when Germany invaded neutral Belgium on 4 August. Austria-Hungary is lit on the map."}),
S({title:"The Western Front",view:[-3,46,11,53],globe:[4,49.8,4],sub:"1914/ger",card:"left",
 lines:[{coords:[[2.75,51.13],[2.88,50.85],[2.82,50.5],[2.78,50.29],[2.7,50.0],[2.85,49.7],[3.0,49.55],[3.4,49.4],[4.03,49.28],[4.8,49.2],[5.38,49.17],[5.6,48.95],[6.05,48.9],[6.75,48.6],[7.05,48.15],[7.15,47.5]],kind:"red"}],
 pins:[[[2.88,50.85],"Ypres","point"],[[2.69,50.05],"The Somme","point"],[[5.38,49.16],"Verdun","point"],[[2.35,48.86],"Paris","point"]],
 stat:"For over three years, a line of trenches about 700 km long barely moved, from the North Sea to Switzerland",
 body:"Machine guns, barbed wire and artillery made attacking deadly. Soldiers lived in muddy trenches, sometimes only a few hundred metres from the enemy (the front is drawn in red).",
 more:"On the first day of the Battle of the Somme, 1 July 1916, the British army lost about 19,000 men killed, its worst day ever. At Verdun, France and Germany fought for ten months in 1916, with around 700,000 killed, wounded or missing."}),
S({title:"Gallipoli",view:[22.5,37.5,31,42],globe:[26.5,40,5],sub:"1914/ott",card:"left",on:["connections"],
 lines:[{coords:[[25.27,39.87],[25.75,40.0],[26.25,40.23]],kind:"flow"},{coords:[[25.27,39.87],[25.8,39.95],[26.17,40.05]],kind:"flow"}],
 pins:[[[26.29,40.24],"Anzac Cove","point"],[[26.18,40.05],"Cape Helles","point"],[[28.98,41.01],"Constantinople (Istanbul)","point"],[[25.27,39.87],"Allied base, Lemnos","point"]],
 phPins:[ph([26.29,40.24],"Anzac Cove")],
 stat:"In 1915 the Allies tried to force their way through the Dardanelles to Constantinople, and failed",
 body:"British, French, Australian and New Zealand troops landed on the Gallipoli peninsula on 25 April 1915. The Ottoman army, with Mustafa Kemal among its commanders, held the hills above the beaches for eight months.",
 more:"The straits were the only sea route between the Black Sea and the Mediterranean, and Russia’s main way out for its grain (today’s shipping lanes are on the map). About 100,000 soldiers died before the Allies left in January 1916. 25 April is now Anzac Day in Australia and New Zealand, and Kemal went on to found modern Turkey."}),
S({title:"A new Middle East",view:[24,12,62,43],globe:[42,30,2],sub:"1925",card:"left",
 G:[{t:"French mandates",c:"#6d8fd6",codes:["sy","lb"]},{t:"British mandates",c:"#ec8fa8",codes:["iq","jo","il","ps"]},{t:"Turkey, a republic from 1923",c:"#3f9d93",codes:["tr"]}],
 pins:[[[32.85,39.93],"Ankara","point"],[[36.29,33.51],"Damascus","point"],[[44.37,33.31],"Baghdad","point"],[[35.21,31.77],"Jerusalem","point"]],
 stat:"The Ottoman Empire had ruled the Middle East for 400 years. After 1918 Britain and France divided its Arab lands",
 body:"A secret deal of 1916, the Sykes–Picot Agreement, sketched the split. Under League of Nations mandates, France took Syria and Lebanon, and Britain took Iraq, Transjordan and Palestine.",
 more:"Many borders in the region still follow these lines. In Anatolia, Mustafa Kemal fought off the Allies and founded the Republic of Turkey in 1923, later taking the surname Atatürk. Iraq became independent in 1932 and Saudi Arabia was proclaimed the same year."}),
S({title:"Four empires fall",view:[-12,34,45,66],globe:[18,50,1.5],sub:"1919/new",card:"right",
 pins:[[[2.12,48.8],"Versailles","point"]],
 stat:"By 1919 the German, Austro-Hungarian, Russian and Ottoman empires were gone, and nine new countries were on the map of Europe",
 body:"The fighting stopped at 11 a.m. on 11 November 1918. At the Paris Peace Conference, the winners redrew the map: Poland, Czechoslovakia, Yugoslavia, Finland, Estonia, Latvia and Lithuania appeared, with Austria and Hungary as separate states (yellow).",
 more:"Germany signed the Treaty of Versailles on 28 June 1919, five years to the day after Sarajevo, and lost land, colonies and its army. About 9 to 10 million soldiers had died. A flu pandemic that followed, in 1918–20, killed tens of millions more."}),
S({title:"Crash and dictators",view:[-128,8,48,64],globe:[-30,40,1.1],sub:"1938/ger",
 G:[{t:"Fascist and military rule",c:"#8c6d5a",codes:["de","it","jp"]}],
 pins:[[[-74.01,40.71],"Wall Street crash, 1929","point"],[[12.5,41.9],"Mussolini in power, 1922","point"],[[13.4,52.52],"Hitler in power, 1933","point"],[[-3.7,40.42],"Spanish Civil War, 1936–39","point"]],
 stat:"After the Wall Street Crash of October 1929, about one American worker in four lost their job",
 body:"The Great Depression spread round the world: trade collapsed, banks failed and in Germany about six million people were out of work by 1932. Angry and afraid, many voters turned to strongmen who promised order.",
 more:"Mussolini had ruled Italy since 1922; Hitler became Germany’s chancellor in January 1933 and soon made himself dictator. Japan seized Manchuria in 1931, Italy invaded Ethiopia in 1935, and in 1938 Germany took over Austria and part of Czechoslovakia."}),
S({title:"Blitzkrieg",view:[-25,40,25,62],globe:[8,51,2],sub:"1938/ger",card:"right",
 lines:[{coords:[[13.4,52.5],[17,52.3],[21,52.23]],kind:"flow"},{coords:[[7,50.3],[5.6,49.9],[4.4,49.8],[3.2,50.4],[2.37,51.03]],kind:"flow"},{coords:[[4.4,49.8],[3.3,49.2],[2.35,48.86]],kind:"flow"},{coords:[[10.6,57.7],[10.75,59.9]],kind:"flow"}],
 pins:[[[21,52.23],"Warsaw","point"],[[2.37,51.03],"Dunkirk","point"],[[2.35,48.86],"Paris","point"],[[-0.13,51.51],"London: the Blitz","point"]],
 stat:"In 1940 Germany conquered France in about six weeks",
 body:"Germany invaded Poland on 1 September 1939, and Britain and France declared war two days later. In spring 1940, fast tanks backed by aircraft, ‘lightning war’, overran Denmark, Norway, the Netherlands, Belgium and France (arrows).",
 more:"About 338,000 Allied soldiers were rescued from the beaches of Dunkirk. Britain fought on alone in the air in the Battle of Britain, and German bombing raids, the Blitz, killed about 43,000 civilians in British cities in 1940–41."}),
S({title:"Stalingrad",view:[12,40,58,63],globe:[34,52,1.8],sub:"1938/ussr",card:"right",
 lines:[{coords:[[21,52.2],[27.6,53.9],[31.9,54.8],[36.5,55.6]],kind:"flow"},{coords:[[21,54.6],[24.1,56.95],[29.5,59.4]],kind:"flow"},{coords:[[23.5,50.5],[30.5,50.45],[36.2,50.0],[40,48.6],[44,48.7]],kind:"flow"},{coords:[[44.5,48.7],[36.2,51.7],[30.5,50.45],[24,51.5],[21,52.2],[13.4,52.5]],kind:"red"}],
 pins:[[[30.32,59.94],"Leningrad","point"],[[37.62,55.75],"Moscow","point"],[[44.5,48.7],"Stalingrad","point"],[[36.19,51.73],"Kursk","point"],[[13.4,52.52],"Berlin","point"]],
 phPins:[ph([44.5,48.7],"Stalingrad")],
 stat:"Most of Germany’s soldiers who died in the war fell fighting the Soviet Union",
 body:"On 22 June 1941 about 3 million German and allied troops invaded the Soviet Union (arrows). They besieged Leningrad and reached the edge of Moscow, but were stopped there in December.",
 more:"At Stalingrad, from August 1942 to February 1943, a whole German army was surrounded and destroyed, in one of the deadliest battles in history. After that the Red Army pushed west all the way to Berlin (red). The siege of Leningrad lasted 872 days and around a million civilians died, most of them of hunger."}),
S({title:"The Holocaust",view:[4,44,36,57],globe:[18,51,3],sub:"1938",card:"left",
 pins:[[[19.18,50.03],"Auschwitz-Birkenau","point"],[[22.05,52.63],"Treblinka","point"],[[23.59,51.45],"Sobibor","point"],[[23.46,50.37],"Belzec","point"],[[18.73,52.15],"Chełmno","point"],[[22.6,51.22],"Majdanek","point"],[[20.99,52.24],"Warsaw Ghetto","point"]],
 phPins:[ph([19.2,50.03],"Auschwitz-Birkenau")],
 stat:"Nazi Germany and its collaborators murdered about six million Jews, about two-thirds of the Jews of Europe",
 body:"Jews across occupied Europe were forced into ghettos, shot in mass killings, or sent by train to death camps that Germany built in occupied Poland. The Nazis called it the ‘Final Solution’.",
 more:"About 1.1 million people were murdered at Auschwitz-Birkenau alone, most of them Jews. The Nazis also murdered Roma and Sinti, disabled people, Soviet prisoners of war, Poles and many others. Auschwitz was liberated on 27 January 1945, now International Holocaust Remembrance Day."}),
S({title:"War in the Pacific",view:[95,-15,215,52],globe:[160,20,1.2],sub:"1938/jpn",card:"left",
 pins:[[[-157.95,21.36],"Pearl Harbor, 7 Dec 1941","point"],[[-177.37,28.21],"Midway, June 1942","point"],[[103.82,1.35],"Singapore falls, Feb 1942","point"],[[160,-9.5],"Guadalcanal","point"],[[127.8,26.3],"Okinawa, 1945","point"]],
 phPins:[ph([-157.95,21.36],"USS Arizona Memorial")],
 stat:"On 7 December 1941 Japanese planes attacked the US fleet at Pearl Harbor, killing about 2,400 Americans",
 body:"Japan had been at war in China since 1937. Pearl Harbor brought the United States into the war, and within months Japan took the Philippines, Malaya, Singapore, the Dutch East Indies and Burma.",
 more:"Six months later, at the Battle of Midway in June 1942, the US sank four Japanese aircraft carriers and the tide turned. American forces then ‘island-hopped’ across the Pacific towards Japan, through bloody battles such as Guadalcanal, Iwo Jima and Okinawa."}),
S({title:"D-Day",view:[-4.2,48,2.6,51.2],globe:[-0.8,49.6,7],sub:"1938/ger",card:"right",
 lines:[{coords:[[-1.1,50.75],[-1.1,50.1],[-0.95,49.45]],kind:"flow"},{coords:[[-1.4,50.85],[-1.6,50.2],[-1.18,49.47]],kind:"flow"},{coords:[[-0.9,50.75],[-0.6,50.1],[-0.45,49.38]],kind:"flow"},{coords:[[-1.2,49.5],[-1.18,49.41],[-1.0,49.38],[-0.85,49.37],[-0.6,49.34],[-0.43,49.34],[-0.25,49.29]],kind:"red"}],
 pins:[[[-0.7,49.3],"Five beaches: Utah, Omaha, Gold, Juno, Sword","point"],[[-1.09,50.8],"Portsmouth","point"]],
 stat:"On 6 June 1944, about 156,000 Allied troops landed on five beaches in Normandy, the largest invasion from the sea in history",
 body:"American, British and Canadian soldiers, with Free French, Polish and other forces, crossed the English Channel overnight in about 7,000 ships and boats (arrows) and landed along about 80 km of coast (red). By the end of August, Paris was free.",
 more:"With the Red Army closing in from the east, Hitler killed himself in Berlin on 30 April 1945. Germany surrendered on 8 May, still marked as Victory in Europe Day."}),
S({title:"Hiroshima and Nagasaki",view:[124,28,148,42],globe:[134,35,4],sub:"1938/jpn",card:"right",
 pins:[[[132.46,34.39],"Hiroshima","point"],[[129.87,32.75],"Nagasaki","point"],[[139.69,35.69],"Tokyo","point"]],
 phPins:[ph([132.45,34.4],"Genbaku Dome")],
 stat:"Only two nuclear weapons have ever been used in war, both on Japan in August 1945",
 body:"The US dropped atomic bombs on Hiroshima on 6 August and on Nagasaki on 9 August. By the end of 1945 they had killed well over 100,000 people, most of them civilians.",
 more:"The Soviet Union declared war on Japan on 8 August. Japan announced its surrender on 15 August and signed it on 2 September, ending World War II. In Hiroshima, the ruined Genbaku Dome was left standing as a memorial."}),
S({title:"The human cost",view:W,globe:[60,35,1],sub:"1945",
 G:[{t:"Soviet Union: about 24 million dead",c:"#b9524f",codes:USSR},{t:"China: 15 to 20 million",c:"#c9a24f",codes:["cn"]},{t:"Germany, Poland, Japan: 3 to 7 million each",c:"#8c6d5a",codes:["de","pl","jp"]}],
 stat:"World War II killed about 70 to 85 million people, around 3% of everyone alive in 1940",
 body:"More civilians died than soldiers: in bombing, massacres, famine and disease, and in the Holocaust. The Soviet Union and China lost the most people; Poland lost the biggest share, about one person in six.",
 more:"Tens of millions more were left homeless or driven from their homes. Compare countries on the card: estimates vary, so the numbers are rounded."}),
S({title:"The United Nations",view:[-140,0,40,70],globe:[-60,35,1.3],sub:"1945",spin:75,
 G:[{t:"Permanent members of the Security Council",c:"#4a7fc1",codes:["us","gb","fr","cn","ru"]}],
 pins:[[[-122.42,37.78],"San Francisco: Charter signed, June 1945","point"],[[-73.97,40.75],"UN headquarters, New York","point"]],
 phPins:[ph([-73.97,40.75],"UN General Assembly")],
 stat:"The United Nations began on 24 October 1945 with 51 members; today it has 193",
 body:"Its Charter was signed in San Francisco in June 1945, with one aim above all: ‘to save succeeding generations from the scourge of war’. Five winners of the war became permanent members of the Security Council, each with a veto (lit).",
 more:"The UN replaced the League of Nations, which had failed to stop World War II. In 1948 it adopted the Universal Declaration of Human Rights. Slide through the years on the card to watch the world’s new countries join."}),
S({title:"Now explore",view:W,globe:[20,30,1],sub:"1938",
 stat:"Hover any country to see its name and neighbours",
 body:"Drag the History map’s timeline from 1914 to 1945 and watch empires rise and fall. The next tour, Cold War and the end of empires, picks up the story in 1945."})];

/* =============================================================== 2. Cold War and the end of empires */
const COLD=[
S({title:"Two superpowers",view:W,globe:[40,35,1],sub:"1955/ussr",
 phPins:[ph([13.38,52.51],"Checkpoint Charlie, 1963"),ph([126.68,37.96],"Panmunjom"),ph([74.57,31.6],"Wagah border"),ph([-0.2,5.55],"Black Star Square, Accra"),ph([105.83,21.04],"Ho Chi Minh Mausoleum"),ph([-82.37,23.14],"Havana"),ph([165.4,11.6],"Bikini Atoll test"),ph([-80.6,28.5],"Apollo 11 launch")],
 stat:"After 1945 two superpowers, the United States and the Soviet Union, faced each other for over 40 years",
 body:"They never fought each other directly, so the long stand-off was called the Cold War. At the same time Europe’s empires broke up, and about 100 new countries joined the map.",
 more:"The map starts in 1955: the Soviet Union is lit, and the colours of Britain, France, Portugal and the others still cover much of Africa."}),
S({title:"The Iron Curtain",view:[-12,36,42,64],globe:[16,50,1.6],sub:"1950/ussr",card:"left",
 hiSoft:["pl","cz","sk","hu","ro","bg","al","de"],
 lines:[{coords:[[10.9,54.0],[10.8,53.4],[11.3,52.9],[10.6,52.0],[10.2,51.2],[10.0,50.6],[11.9,50.3],[12.5,50.3],[13.8,48.8],[14.9,48.75],[16.9,48.6],[17.1,48.0],[16.5,47.0],[16.1,46.65],[13.7,45.6]],kind:"red"}],
 pins:[[[14.55,53.43],"Stettin (Szczecin)","point"],[[13.77,45.65],"Trieste","point"]],
 stat:"‘From Stettin in the Baltic to Trieste in the Adriatic, an iron curtain has descended across the Continent’",
 body:"Winston Churchill said it in 1946. The Red Army had freed Eastern Europe from the Nazis but stayed, and by 1948 communists loyal to Moscow ruled Poland, Czechoslovakia, Hungary, Romania, Bulgaria and East Germany (pale).",
 more:"The US answered with the Marshall Plan, about 13 billion dollars to rebuild Western Europe from 1948. The Iron Curtain (red) became a real fence of barbed wire, minefields and watchtowers."}),
S({title:"Berlin divided",view:[5,47,17,55.5],globe:[11,51.5,4],sub:"1950/new",card:"right",
 lines:[{coords:[[10.9,54.0],[10.8,53.4],[11.3,52.9],[10.6,52.0],[10.2,51.2],[10.0,50.6],[11.9,50.3],[12.3,50.2]],kind:"red"},{coords:[[8.68,50.11],[13.4,52.47]],kind:"flow"},{coords:[[9.99,53.55],[13.4,52.47]],kind:"flow"},{coords:[[9.05,52.25],[13.4,52.47]],kind:"flow"}],
 pins:[[[13.4,52.52],"Berlin","point"],[[7.1,50.73],"Bonn, West German capital","point"]],
 phPins:[ph([13.39,52.51],"Checkpoint Charlie, 1963"),ph([13.44,52.5],"The Berlin Wall")],
 stat:"In 1948–49 Western planes flew about 2.3 million tonnes of food and coal into West Berlin",
 body:"Germany and Berlin were split into American, British, French and Soviet zones. When the Soviets blocked the roads and railways to West Berlin, the Allies supplied it by air for almost a year, along three air corridors (arrows).",
 more:"In 1949 two German states were founded, West and East (yellow). So many East Germans fled west through Berlin that on 13 August 1961 East Germany sealed the border with the Berlin Wall."}),
S({title:"NATO and the Warsaw Pact",view:[-130,15,180,78],globe:[0,50,1],sub:"1955/ussr",
 G:[{t:"NATO’s 12 founders, 1949",c:"#4a7fc1",codes:["us","ca","gb","fr","be","nl","lu","dk","no","is","it","pt"]},{t:"Warsaw Pact, 1955",c:"#b9524f",codes:USSR.concat(["pl","cz","sk","hu","ro","bg","al","de"])}],
 stat:"By 1986 there were about 70,000 nuclear warheads on Earth",
 body:"Twelve countries founded NATO in 1949, promising that an attack on one was an attack on all. In 1955 the Soviet Union and seven allies answered with the Warsaw Pact (only East Germany, not today’s whole Germany, was a member).",
 more:"Soviet tanks crushed uprisings in Hungary in 1956 and Czechoslovakia in 1968. Each side built enough bombs to destroy the other many times over: ‘mutually assured destruction’. Slide through the arms race on the card."}),
S({title:"Partition of India",view:[58,5,100,38],globe:[78,24,1.8],sub:"1950/new",card:"right",
 G:[{t:"India",c:"#e8a33d",codes:["in"]},{t:"Pakistan, in two parts until 1971",c:"#3a8f5a",codes:["pk","bd"]}],
 pins:[[[77.21,28.61],"Delhi","point"],[[74.35,31.55],"Lahore","point"],[[88.36,22.57],"Kolkata","point"],[[74.57,31.6],"Wagah border","point"]],
 phPins:[ph([74.57,31.6],"Wagah border")],
 stat:"When British India was split in 1947, about 15 million people had to move",
 body:"British rule ended at midnight on 14–15 August 1947. The land was divided into mainly Hindu India and mainly Muslim Pakistan, in two pieces 1,600 km apart; Hindus and Sikhs fled one way, Muslims the other.",
 more:"Somewhere between 200,000 and 2 million people were killed in the violence. The border was drawn in about five weeks by a British lawyer who had never been to India. East Pakistan became Bangladesh in 1971, and India and Pakistan both claim Kashmir."}),
S({title:"China’s revolution",view:[72,15,136,54],globe:[105,33,1.6],sub:"1950/chn",card:"left",
 pins:[[[116.39,39.9],"Beijing, 1 October 1949","point"],[[121.56,25.04],"Taipei","point"]],
 phPins:[ph([116.39,39.91],"Tiananmen Gate")],
 stat:"On 1 October 1949 Mao Zedong proclaimed the People’s Republic of China",
 body:"After a long civil war, interrupted by the war against Japan, the Communists won and the defeated Nationalist government retreated to Taiwan. Taiwan has governed itself ever since; Beijing claims it as part of China.",
 more:"Mao’s Great Leap Forward, a rush to industrialise, led to a famine from 1959 to 1961 that killed tens of millions of people. The Cultural Revolution of 1966–76 turned young Red Guards against teachers, officials and their own families."}),
S({title:"The Korean War",view:[123,33,132,43.5],globe:[127.5,38,5],sub:"1955",card:"left",
 lines:[{coords:[[124,38],[124.5,38],[125,38],[125.5,38],[126,38],[126.5,38],[127,38],[127.5,38],[128,38],[128.5,38],[129,38],[129.5,38]],kind:"dash",parallel:true},{coords:[[126.1,37.75],[126.68,37.95],[127.05,38.2],[127.5,38.3],[128,38.3],[128.35,38.6]],kind:"red"}],
 pins:[[[126.98,37.57],"Seoul","point"],[[125.75,39.03],"Pyongyang","point"],[[126.68,37.96],"Panmunjom","point"]],
 phPins:[ph([126.68,37.96],"Panmunjom")],
 stat:"The Korean War stopped in 1953, but no peace treaty was ever signed",
 body:"In 1945 Korea was split at the 38th parallel (dashed). North Korea invaded the South in June 1950; a UN force led by the US fought back, then China joined in on the North’s side.",
 more:"After three years and perhaps 2 to 3 million deaths, the front line ended close to where it began (red). The Demilitarised Zone along it, about 4 km wide and 250 km long, is still one of the most heavily guarded borders on Earth."}),
S({title:"The Year of Africa",view:[-20,-36,52,38],globe:[15,5,1.05],sub:"1960/new",card:"right",
 pins:[[[-0.19,5.56],"Accra: Ghana free, 1957","point"],[[15.31,-4.32],"Kinshasa: DR Congo, 30 June 1960","point"],[[3.06,36.75],"Algiers: free in 1962, after 8 years of war","point"]],
 phPins:[ph([-0.2,5.55],"Black Star Square, Accra")],
 stat:"In 1960 alone, 17 African countries became independent",
 body:"Ghana led the way south of the Sahara in 1957. In 1960 most of French Africa, plus Nigeria, Somalia and DR Congo, became free (yellow), and the rest of the continent followed over the next 30 years.",
 more:"Some independence came peacefully; elsewhere, as in Algeria, Kenya, Angola and Mozambique, it took long wars. Zimbabwe was free in 1980 and Namibia in 1990. Slide the card to watch the UN fill up with new countries."}),
S({title:"Vietnam",view:[96,6,118,25],globe:[106,16,3],sub:"1965",card:"left",
 lines:[{coords:[[106.55,17],[107.1,17]],kind:"dash"},{coords:[[105.8,20.9],[105.7,18.7],[105.9,17.6],[106.3,16.6],[106.8,14.8],[107.0,13.4],[106.6,11.6]],kind:"flow"}],
 pins:[[[105.85,21.03],"Hanoi","point"],[[106.7,10.78],"Saigon, falls 30 April 1975","point"],[[103.02,21.39],"Dien Bien Phu, 1954","point"]],
 phPins:[ph([105.83,21.04],"Ho Chi Minh Mausoleum"),ph([108.2,16.05],"Huey helicopter")],
 stat:"At its peak in 1969, the US had over half a million troops in Vietnam",
 body:"After beating France at Dien Bien Phu in 1954, Vietnam was split at the 17th parallel (dashed): a communist North and a US-backed South. The North sent fighters and supplies south down the Ho Chi Minh Trail through Laos and Cambodia (arrow).",
 more:"US troops left in 1973 and Saigon fell to the North in 1975. About 58,000 Americans died, and somewhere between 1 and 3 million Vietnamese. Neighbouring Laos was bombed more heavily, per person, than any country in history."}),
S({title:"The Cuban Missile Crisis",view:[-112,5,-55,46],globe:[-82,26,1.75],sub:"1960",card:"left",
 hi:["cu"],
 lines:[{circle:[-83,22.7],km:2e3,kind:"circle"}],
 pins:[[[-83,22.7],"Missile sites","point"],[[-77.04,38.9],"Washington","point"]],
 phPins:[ph([-82.37,23.14],"Havana")],
 stat:"For 13 days in October 1962, the world stood closer to nuclear war than ever before or since",
 body:"US spy planes found Soviet missile sites in Cuba, about 150 km from Florida (circle: their rough range). President Kennedy ordered a naval ‘quarantine’ of the island, and Soviet ships steamed towards it.",
 more:"Khrushchev agreed to remove the missiles; in return the US promised not to invade Cuba and, secretly, to take its own missiles out of Turkey. Afterwards a direct ‘hotline’ was set up between Washington and Moscow."}),
S({title:"The space race",view:[-100,-40,100,65],globe:[0,35,1],sub:"1960/ussr",
 hi:["us"],
 pins:[[[63.3,45.96],"Baikonur","point"],[[-80.6,28.5],"Cape Canaveral","point"]],
 phPins:[ph([-80.6,28.5],"Apollo 11 launch"),ph([-40,10],"Buzz Aldrin on the Moon")],
 stat:"The Soviet Union put the first satellite and the first person in space; the US put the first people on the Moon",
 body:"Sputnik 1 was launched on 4 October 1957 and Yuri Gagarin orbited the Earth on 12 April 1961. Apollo 11 landed on the Moon on 20 July 1969, and only 12 people, all Americans, have ever walked there.",
 more:"Soviet rockets flew from Baikonur, now in Kazakhstan; Apollo launched from Cape Canaveral in Florida. Valentina Tereshkova became the first woman in space in 1963. The rockets were close cousins of the missiles built to carry bombs."}),
S({title:"Neither East nor West",view:W,globe:[40,15,1],sub:"1960/yugo",
 G:[{t:"Founders of the Non-Aligned Movement, Belgrade 1961",c:"#3a8f5a",codes:["af","dz","mm","kh","lk","cd","cu","cy","et","gh","gn","in","id","iq","lb","ml","ma","np","sa","so","sd","eg","ye","tn","rs","hr","si","ba","me","mk"]}],
 pins:[[[107.61,-6.92],"Bandung, 1955","point"],[[20.46,44.82],"Belgrade, 1961","point"]],
 stat:"25 countries met in Belgrade in 1961 to found the Non-Aligned Movement; it now has 120 members",
 body:"Many new countries did not want to pick a side in the Cold War. Led by India’s Nehru, Egypt’s Nasser, Indonesia’s Sukarno, Ghana’s Nkrumah and Yugoslavia’s Tito (lit), they met first at Bandung in Indonesia in 1955.",
 more:"Yugoslavia was communist but broke with Stalin in 1948 and went its own way. In practice many ‘non-aligned’ countries leaned one way or the other, and both superpowers competed for their friendship with aid and weapons."}),
S({title:"Afghanistan, 1979",view:[52,23,82,42],globe:[67,33,3],sub:"1980/ussr",card:"right",
 hi:["af"],
 lines:[{coords:[[67.28,37.22],[67.9,36.5],[69.0,35.3],[69.17,34.53]],kind:"flow"}],
 pins:[[[69.17,34.53],"Kabul","point"],[[67.28,37.22],"Termez: the main way in","point"],[[71.58,34.01],"Peshawar: refugee camps","point"]],
 stat:"The Soviet Union fought in Afghanistan for over nine years, and about 15,000 Soviet soldiers died",
 body:"Soviet troops invaded at the end of December 1979 to prop up a communist government. Afghan resistance fighters, the mujahideen, fought back from the mountains, armed by the US, Pakistan and Saudi Arabia.",
 more:"Perhaps a million Afghans died, and about 5 million fled to Pakistan and Iran. The last Soviet soldiers left on 15 February 1989. The same year as the invasion, 1979, a revolution in Iran overthrew the Shah and set up an Islamic republic."}),
S({title:"The Wall falls",view:[-6,40,40,62],globe:[17,51,2.2],sub:"1990",card:"right",
 hi:["pl","hu","de","cz","sk","bg","ro","ee","lv","lt"],
 lines:[{coords:[[24.75,59.44],[25.3,58.3],[24.1,56.95],[24.6,55.9],[25.28,54.69]],kind:"red"}],
 pins:[[[13.4,52.52],"Berlin, 9 November","point"],[[18.65,54.35],"Gdańsk: Solidarity","point"],[[16.6,47.68],"Hungary opens its border","point"]],
 phPins:[ph([13.38,52.52],"Fall of the Berlin Wall")],
 stat:"In 1989 communist governments across Eastern Europe fell, one after another, within months",
 body:"Poland held partly free elections in June, Hungary opened its border with Austria, and on 9 November the Berlin Wall opened after an official announced new travel rules too early. Crowds climbed on it that night.",
 more:"In August about 2 million people held hands in a chain about 675 km long across Estonia, Latvia and Lithuania, the Baltic Way (red). Most of 1989’s revolutions were peaceful; Romania’s was not. Germany reunited on 3 October 1990."}),
S({title:"The end of the Soviet Union",view:[20,30,180,78],globe:[80,55,1],sub:"1990/ussr",card:"left",
 pins:[[[37.62,55.75],"Moscow: the flag comes down, 25 December 1991","point"],[[23.9,52.6],"Belovezha: the USSR is dissolved, 8 December","point"]],
 phPins:[ph([37.62,55.75],"The Kremlin")],
 stat:"On 25 December 1991 Mikhail Gorbachev resigned, and the Soviet flag over the Kremlin was lowered for the last time",
 body:"Gorbachev had tried to save the system with openness (glasnost) and reform (perestroika), but the Soviet economy was failing and its republics wanted out. A failed coup by hardliners in August 1991 sped up the end.",
 more:"In December the leaders of Russia, Ukraine and Belarus agreed that the USSR no longer existed. It broke into 15 independent countries, and the Cold War was over. The next tour starts there."}),
S({title:"Now explore",view:W,globe:[20,30,1],sub:"1975",
 stat:"Hover any country to see its name and neighbours",
 body:"Drag the History map’s timeline from 1945 to 1990 and watch the empires’ colours drain away from Africa and Asia. The World Wars tour comes before this one, and The world since 1991 after it."})];

/* =============================================================== 3. The world since 1991 */
const EU0=["be","fr","de","it","lu","nl"],EU1=["dk","ie","gb","gr","es","pt","at","fi","se"],EU2=["cy","cz","ee","hu","lv","lt","mt","pl","sk","si","bg","ro","hr"];
const NOW=[
S({title:"A new world",view:W,globe:[40,30,1],sub:"2026",
 phPins:[ph([114.06,22.54],"Shenzhen"),ph([-74.01,40.71],"9/11 Memorial"),ph([7.77,48.6],"European Parliament"),ph([31.58,4.85],"Juba"),ph([17.81,43.34],"Stari Most, Mostar"),ph([36.32,32.29],"Zaatari camp"),ph([30.52,50.45],"Kyiv metro, 2022"),ph([-45,72],"Greenland ice melting")],
 stat:"Since 1991, about 30 new countries have joined the map",
 body:"When the Cold War ended, many hoped for a calmer world. Instead the years since have brought new countries and new wars, a Europe that grew together, China’s rise, financial crisis, a pandemic and a warming climate.",
 more:"This tour follows the big events from the break-up of the Soviet Union to today. Contested places stay neutral here: the map shows what is on the ground and says who disputes it."}),
S({title:"One country becomes fifteen",view:[15,28,95,66],globe:[55,50,1.5],sub:"1995/new",histAnim:["1990","1995"],histAnimLabel:"↻ Replay the break-up",card:"right",
 pins:[[[24.1,56.95],"Riga","point"],[[69.24,41.31],"Tashkent","point"],[[44.79,41.72],"Tbilisi","point"]],
 phPins:[ph([24.11,56.95],"Freedom Monument, Riga"),ph([71.43,51.13],"Astana")],
 stat:"The Soviet Union broke into 15 countries; Russia alone is still the biggest country on Earth",
 body:"Estonia, Latvia and Lithuania went first, then Ukraine, Belarus, the countries of the Caucasus and Central Asia (yellow). Yugoslavia and Czechoslovakia split up in the same few years.",
 more:"About 25 million ethnic Russians suddenly found themselves living outside Russia. Czechoslovakia’s ‘Velvet Divorce’ into Czechia and Slovakia, on 1 January 1993, was entirely peaceful."}),
S({title:"Yugoslavia breaks apart",view:[12,40,24,47.5],globe:[18,44,4.5],sub:"1995",card:"left",
 G:[{t:"Independent 1991–92",c:"#8fb3a8",codes:["si","hr","mk","ba"]},{t:"Serbia and Montenegro: one state until 2006",c:"#c9a0dc",codes:["rs","me"]},{t:"Kosovo: declared independence 2008, not recognised by Serbia",c:"#d9c7a3",codes:["xk"]}],
 pins:[[[18.41,43.86],"Sarajevo: besieged 1992–96","point"],[[19.3,44.1],"Srebrenica, July 1995","point"],[[19.0,45.35],"Vukovar","point"]],
 phPins:[ph([17.81,43.34],"Stari Most, Mostar")],
 stat:"The wars that broke up Yugoslavia, from 1991 to 2001, were Europe’s deadliest since 1945",
 body:"Slovenia and Croatia declared independence in June 1991, and Bosnia followed. In Bosnia’s war, about 100,000 people were killed, and Sarajevo was besieged for nearly four years.",
 more:"At Srebrenica in July 1995, about 8,000 Bosniak men and boys were murdered, a crime UN courts ruled to be genocide. The Dayton Agreement ended the Bosnian war that December. Kosovo declared independence in 2008; about half the world’s countries recognise it, but Serbia and many others do not."}),
S({title:"Europe grows together",view:[-25,34,45,71],globe:[15,52,1.45],sub:"2015",
 G:[{t:"The six founders, 1950s",c:"#2f5fb3",codes:EU0},{t:"Joined 1973–1995 (the UK left in 2020)",c:"#6d8fd6",codes:EU1},{t:"Joined 2004–2013",c:"#a8c0ea",codes:EU2}],
 phPins:[ph([7.77,48.6],"European Parliament")],
 stat:"The European Union grew from 12 countries in 1993 to 28; ten joined on a single day, 1 May 2004",
 body:"The Maastricht Treaty created the EU in 1993. Most of the newcomers in 2004–2013 had been communist countries behind the Iron Curtain only 15 years before.",
 more:"The euro arrived in 1999 and its coins and notes in 2002; Bulgaria became the 21st country to use it in 2026. In most of the EU you can cross borders without showing a passport, under the Schengen rules."}),
S({title:"The rise of China",view:[72,15,136,54],globe:[110,30,1.7],sub:"2005/chn",card:"left",on:["connections"],
 pins:[[[114.06,22.54],"Shenzhen","point"],[[114.17,22.3],"Hong Kong: back to China, 1997","point"],[[121.5,31.24],"Shanghai","point"],[[116.39,39.9],"Beijing","point"]],
 phPins:[ph([114.06,22.54],"Shenzhen"),ph([121.5,31.24],"Pudong, Shanghai")],
 stat:"Shenzhen grew from a town of about 30,000 people in 1980 to a city of over 17 million",
 body:"From 1978 Deng Xiaoping opened China to markets and foreign investment, starting with ‘special economic zones’ like Shenzhen, next to Hong Kong. China joined the World Trade Organization in 2001 and became the ‘workshop of the world’, its goods shipped out through some of the busiest ports on Earth (shipping lanes on the map).",
 more:"It passed Japan as the world’s second-largest economy in 2010, and around 800 million Chinese people escaped extreme poverty. See how steady fast growth adds up on the card."}),
S({title:"September 11",view:[-85,8,75,56],globe:[-10,35,1],sub:"2005",
 hi:["af"],
 pins:[[[-74.01,40.71],"New York","point"],[[-77.06,38.87],"The Pentagon","point"],[[69.17,34.53],"Kabul","point"]],
 phPins:[ph([-74.01,40.71],"9/11 Memorial")],
 stat:"On 11 September 2001, hijackers flew airliners into the World Trade Center and the Pentagon, killing nearly 3,000 people",
 body:"The attacks were planned by al-Qaeda, led by Osama bin Laden from Afghanistan. Within a month a US-led coalition invaded Afghanistan (lit) and overthrew its Taliban government.",
 more:"Western troops stayed for almost 20 years. Bin Laden was killed in Pakistan in 2011. As the last US troops left in August 2021, the Taliban took back power."}),
S({title:"The Iraq War",view:[34,27,52,39],globe:[43,33,4],sub:"2005",card:"left",on:["resources"],
 hi:["iq"],hiSoft:["sy"],
 pins:[[[44.37,33.31],"Baghdad","point"],[[43.13,36.34],"Mosul: held by IS 2014–17","point"],[[39.01,35.95],"Raqqa","point"],[[47.78,30.5],"Basra","point"]],
 phPins:[ph([44.36,33.32],"Baghdad")],
 stat:"In March 2003 a US-led coalition invaded Iraq and overthrew Saddam Hussein in three weeks",
 body:"The invasion was justified by claims that Iraq had weapons of mass destruction; none were found. Years of insurgency and fighting between communities followed, and hundreds of thousands of Iraqis died.",
 more:"Iraq holds some of the world’s largest oil reserves (oil fields on the map). In 2014 the Islamic State group seized large parts of Iraq and Syria. It was driven out of Mosul in 2017 and lost its last village, in Syria, in 2019."}),
S({title:"The 2008 crash",view:[-82,22,42,66],globe:[-20,45,1.3],sub:"2010",card:"left",
 hi:["us","gb","is","ie","gr"],
 pins:[[[-74.01,40.71],"Wall Street","point"],[[-0.09,51.51],"London","point"],[[-21.9,64.15],"Iceland: all three big banks fail","point"],[[23.73,37.98],"Athens","point"]],
 stat:"In 2009 the world economy shrank for the first time since World War II",
 body:"US banks had lent huge sums to home buyers who could not repay. When house prices fell, the investment bank Lehman Brothers went bust on 15 September 2008, the biggest bankruptcy in US history, and panic spread round the world.",
 more:"Governments spent hundreds of billions to rescue banks. In the euro debt crisis that followed, Greece needed three bailouts and its economy shrank by about a quarter."}),
S({title:"The Arab Spring",view:[-18,8,62,40],globe:[22,28,1.6],sub:"2010",card:"left",
 G:[{t:"Leaders overthrown in 2011–12",c:"#d98a3a",codes:["tn","eg","ly","ye"]},{t:"Civil war from 2011",c:"#b23a3a",codes:["sy"]}],
 pins:[[[9.48,35.04],"Sidi Bouzid, 17 December 2010","point"],[[31.24,30.04],"Tahrir Square, Cairo","point"],[[36.29,33.51],"Damascus","point"]],
 phPins:[ph([36.32,32.29],"Zaatari camp")],
 stat:"In early 2011, protests toppled the long-time rulers of Tunisia and Egypt within weeks",
 body:"It began when a young Tunisian street seller, Mohamed Bouazizi, set himself on fire in protest. Tunisia’s president fled on 14 January 2011, and after 18 days of protests in Cairo’s Tahrir Square, Egypt’s Hosni Mubarak resigned.",
 more:"Libya and Yemen fell into war, and in Syria a crackdown became a civil war that killed hundreds of thousands and drove over 6 million people abroad; Zaatari camp in Jordan became a city of refugees. Syria’s president Bashar al-Assad fell in December 2024."}),
S({title:"The newest country",view:[18,-1,42,20],globe:[31,8,3.5],sub:"2015/new",card:"right",
 pins:[[[31.58,4.85],"Juba","point"],[[32.53,15.5],"Khartoum","point"],[[28.43,9.6],"Abyei: claimed by both","point"]],
 phPins:[ph([31.58,4.85],"Juba")],
 stat:"South Sudan became independent on 9 July 2011, and is still the world’s newest country",
 body:"After decades of civil war with the government in Khartoum, the people of the south voted in January 2011, about 99% of them for independence. A week after independence, South Sudan became the UN’s 193rd member.",
 more:"Its joy did not last: a civil war from 2013 to 2018 killed an estimated 400,000 people. The two Sudans still argue over the oil region of Abyei, and Sudan itself has been at war since 2023."}),
S({title:"Climate agreements",view:W,globe:[20,25,1],sub:"2015",
 G:[{t:"The biggest emitters of CO₂ today",c:"#8c6d5a",codes:["cn","us","in","ru","jp"]}],
 pins:[[[-43.2,-22.9],"Rio, 1992","point"],[[135.77,35.01],"Kyoto, 1997","point"],[[2.35,48.86],"Paris, 2015","point"]],
 phPins:[ph([-45,72],"Greenland ice melting")],
 stat:"In the Paris Agreement of 2015, almost every country agreed to keep warming well below 2 °C",
 body:"The 1992 Earth Summit in Rio set up the UN’s climate talks; at Kyoto in 1997 rich countries promised cuts. In Paris in December 2015, 196 parties agreed that every country would set its own targets, and aim to limit warming to 1.5 °C.",
 more:"The US left the agreement in 2020, rejoined in 2021 and left again in January 2026. China now emits about 30% of the world’s carbon dioxide, and 2024 was the first calendar year more than 1.5 °C warmer than before industry."}),
S({title:"Brexit",view:[-11,49.5,3.5,61],globe:[-3,54.5,4],sub:"2020",card:"right",
 hi:["gb"],
 pins:[[[-0.13,51.5],"London","point"],[[-3.19,55.95],"Scotland: 62% Remain","point"],[[-5.93,54.6],"Northern Ireland: 56% Remain","point"],[[-3.18,51.48],"Wales: 52.5% Leave","point"],[[-1.9,52.48],"England: 53.4% Leave","point"]],
 phPins:[ph([-0.12,51.5],"Palace of Westminster")],
 stat:"On 23 June 2016 the UK voted by 51.9% to 48.1% to leave the European Union",
 body:"England and Wales voted to leave; Scotland and Northern Ireland voted to remain. After years of argument over the terms, the UK left on 31 January 2020, the first country ever to leave the EU.",
 more:"The hardest question was Northern Ireland’s land border with Ireland, which stays in the EU. To keep that border open, goods going from Great Britain to Northern Ireland face checks instead."}),
S({title:"COVID-19",view:W,globe:[100,30,1],sub:"2020",
 pins:[[[114.3,30.59],"Wuhan, December 2019","point"]],
 phPins:[ph([14.41,50.09],"Charles Bridge, Prague, 2020"),ph([19.94,50.06],"Kraków, April 2020"),ph([114.3,30.59],"Wuhan")],
 stat:"Over 7 million deaths from COVID-19 were reported worldwide; the true toll was probably two or three times higher",
 body:"A new coronavirus was found in Wuhan, China, at the end of 2019. The WHO called it a pandemic on 11 March 2020, and within weeks billions of people were told to stay at home, while streets and skies emptied.",
 more:"Vaccines were made in under a year: the first approved shot was given in the UK on 8 December 2020. The WHO ended its global health emergency in May 2023."}),
S({title:"War in Ukraine",view:[20,43,42,53.5],globe:[32,48.5,3.5],sub:"2026/ann",card:"left",
 hi:["ua"],
 pins:[[[30.52,50.45],"Kyiv","point"],[[34.1,45],"Crimea","point"],[[38,48],"Donbas","point"]],
 phPins:[ph([30.52,50.45],"Kyiv metro, 2022"),ph([22.77,49.78],"Refugees at Przemyśl")],
 stat:"Russia’s full-scale invasion of Ukraine on 24 February 2022 began the biggest war in Europe since 1945",
 body:"Russian forces attacked from the north, east and south. Ukraine drove them back from Kyiv, but by 2025 Russia held about a fifth of Ukraine; fighting went on into 2026 while talks were held.",
 more:"The war grew out of 2014, when Russia annexed Crimea (pale red), a move most countries do not recognise, and fighting began in the Donbas. Millions of Ukrainians fled abroad, and Finland and Sweden joined NATO in 2023 and 2024."}),
S({title:"Now explore",view:W,globe:[20,25,1],sub:"2026",
 stat:"Hover any country to see its name and neighbours",
 body:"Drag the History map’s timeline from 1990 to today: most borders have barely moved since 1995. The Cold War tour comes just before this one, and the Politics tour shows today’s alliances."})];

const TOURS={
 hwars:{name:"Guided tour on the World Wars",short:"The World Wars",hint:"A shot in Sarajevo, a 700 km line of trenches, Stalingrad, D-Day and the birth of the United Nations",steps:WARS},
 hcoldwar:{name:"Guided tour on the Cold War and the end of empires",short:"Cold War & end of empires",hint:"A wall through Berlin, 17 new countries in a year, 13 days on the brink and a flag lowered over the Kremlin",steps:COLD},
 hsince91:{name:"Guided tour on the world since 1991",short:"The world since 1991",hint:"Fifteen new countries in a year, a fishing town that became a megacity, a pandemic and Europe’s biggest war since 1945",steps:NOW}};
/* every stop gets an explicit spin (the shared auto-spin pass ran before this file loaded): centred on its view when that is far from Greenwich */
const spinOf=St=>{if(St.spin!=null)return;const v=St.view;let a=v[0],b=v[2];if(b<a)b+=360;let c=(a+b)/2;c=((c+180)%360+360)%360-180;St.spin=(b-a>200||Math.abs(c)<=60)?0:(typeof spinNorm==="function"?spinNorm(-Math.round(c/30)*30):-Math.round(c/30)*30)};
Object.keys(TOURS).forEach(id=>TOURS[id].steps.forEach(spinOf));
Object.keys(TOURS).forEach(id=>{const T=TOURS[id];PS_TOURS[id]={name:T.name,short:T.short,hint:T.hint,map:{mode:"history",histRelief:true},group:"history",col:TL,steps:T.steps.map(fix)}});

/* ---------- card simulations ---------- */
if(typeof DG!=="undefined"&&typeof dgT==="function"){
const T=dgT,INK="#1d3047",SUBC="#5b6b80",ACC="#e8701a";
const btn=(act,x,y,w,label,on)=>'<g data-act="'+act+'" class="dg-tab'+(on?" on":"")+'" style="cursor:pointer"><rect x="'+x+'" y="'+y+'" width="'+w+'" height="17" rx="8.5" fill="'+(on?INK:"#fff")+'" stroke="'+INK+'" stroke-opacity=".3"/>'+T(x+w/2,y+11.6,label,'text-anchor="middle" font-size="7.6" font-weight="700" fill="'+(on?"#fff":INK)+'"')+"</g>";
const slider=(cls,x1,x2,y)=>'<g class="dg-handle" data-drag="'+cls+'"><rect x="'+(x1-4)+'" y="'+(y-8)+'" width="'+(x2-x1+8)+'" height="16" fill="transparent"/><line x1="'+x1+'" x2="'+x2+'" y1="'+y+'" y2="'+y+'" stroke="#c9d3dc" stroke-width="3" stroke-linecap="round"/><circle class="dg-k-'+cls+'" cy="'+y+'" r="6" fill="'+ACC+'" stroke="#fff" stroke-width="1.4"/></g>';
const paint=(svg,sel,h)=>{const g=svg.querySelector(sel);if(g)g.innerHTML=typeof dgPaint==="function"?dgPaint(h):h};
/* 1. the human cost of World War II: rounded mid-range estimates, military and civilian deaths together */
const COST=[["Soviet Union",24,"20–27 million",14],["China",17,"15–20 million",3.5],["Germany",7,"6.6–8.8 million",9],["Poland",5.8,"5.6–5.8 million",17],["Dutch East Indies (Indonesia)",3.5,"3–4 million",5],["Japan",3,"2.5–3.1 million",4],["British India",2.5,"1.5–2.5 million",0.6],["Yugoslavia",1,"about 1 million",7],["France",0.6,"about 600,000",1.4],["Italy",0.5,"about 500,000",1],["United Kingdom",0.45,"about 450,000",0.9],["United States",0.42,"about 420,000",0.3]];
DG.h2cost={title:"The human cost of World War II",src:"Deaths of soldiers and civilians, 1937–45, including the Holocaust and war-time famines (Bengal 1943, Java). Rounded from the ranges in published estimates (e.g. Wikipedia, ‘World War II casualties’, and the sources it cites); shares are of each country’s 1939 population. Estimates vary widely.",_k:0,
 svg:()=>'<svg viewBox="0 0 300 214"><g class="dg-tabs"></g><g class="dg-dyn"></g></svg>',
 init:svg=>DG.h2cost._set(svg),act:(svg,a)=>{if(a.indexOf("tab:")===0){DG.h2cost._k=+a.slice(4);DG.h2cost._set(svg)}},
 _set:svg=>{const k=DG.h2cost._k;paint(svg,".dg-tabs",btn("tab:0",50,4,96,"How many died",k===0)+btn("tab:1",152,4,104,"Share of the people",k===1));
  const rows=COST.slice().sort((a,b)=>k?b[3]-a[3]:b[1]-a[1]),mx=k?17:24;let g="";
  rows.forEach((r,i)=>{const y=30+i*14.4,v=k?r[3]:r[1],w=Math.max(1.5,v/mx*118);
   g+=T(112,y+8,r[0],'text-anchor="end" font-size="6.6" font-weight="700" fill="'+INK+'"')+'<rect x="116" y="'+y+'" width="'+w.toFixed(1)+'" height="10" rx="2" fill="'+(r[0]==="Poland"||r[0]==="Soviet Union"?"#b9524f":"#8c6d5a")+'"/>'+T(119+w,y+8,k?(v<1?v:Math.round(v))+"%":r[2],'font-size="6.2" fill="'+SUBC+'"')});
  g+=T(150,210,k?"Poland lost about one person in six; the United States about one in 300":"About 70–85 million died in all, more civilians than soldiers",'text-anchor="middle" font-size="7" font-weight="800" fill="'+INK+'"');
  if(typeof dgDyn==="function")dgDyn(svg,g);else paint(svg,".dg-dyn",g)}};
/* 2. the UN fills up: members at the end of each year */
const UNM=[[1945,51],[1946,55],[1950,60],[1955,76],[1956,80],[1957,82],[1960,99],[1961,104],[1962,110],[1964,115],[1965,117],[1968,126],[1970,127],[1971,132],[1975,144],[1980,154],[1984,159],[1991,166],[1992,179],[1993,184],[1994,185],[2000,189],[2002,191],[2006,192],[2011,193]];
const unAt=y=>{let v=51;UNM.forEach(p=>{if(p[0]<=y)v=p[1]});return v};
const unMsg=y=>y<1955?"The founders: mostly Europe and the Americas, with a few independent countries in Asia and Africa.":y<1960?"Asia breaks free first: India, Pakistan, Indonesia, Burma and more have joined.":y<1966?"Africa’s turn: 17 African countries become independent in 1960 alone.":y<1990?"The last colonies go: small islands in the Caribbean and Pacific, and Portugal’s African colonies.":y<1995?"The Soviet Union and Yugoslavia break up, and Germany and Yemen unite: 26 new members in five years.":y<2011?"Switzerland and Timor-Leste join in 2002, Montenegro in 2006.":"South Sudan becomes the 193rd member in July 2011.";
const UX0=34,UX1=286,ux=y=>UX0+(y-1945)/(2026-1945)*(UX1-UX0),uy=v=>150-v/200*110;
DG.h2un={title:"The UN fills up with new countries",src:"Member states of the United Nations at the end of each year (UN, ‘Growth in United Nations membership’). Germany’s two states joined in 1973 and became one in 1990; Yemen’s two did the same in 1990.",_y:1945,
 svg:()=>{let h=T(12,14,"Members of the United Nations",'font-size="8.4" font-weight="900" fill="'+INK+'"');
  [0,50,100,150,200].forEach(v=>{h+='<line x1="'+UX0+'" x2="'+UX1+'" y1="'+uy(v)+'" y2="'+uy(v)+'" stroke="#e1e7ee" stroke-width=".7"/>'+T(UX0-3,uy(v)+2,String(v),'font-size="5.6" text-anchor="end" fill="'+SUBC+'"')});
  [1950,1970,1990,2010].forEach(y=>{h+=T(ux(y),158,String(y),'font-size="5.6" text-anchor="middle" fill="'+SUBC+'"')});
  let d="";for(let y=1945;y<=2026;y++){d+=(d?"L":"M")+ux(y).toFixed(1)+","+uy(unAt(y)).toFixed(1)}
  h+='<path d="'+d+'" fill="none" stroke="#4a7fc1" stroke-width="1.8"/><g class="dg-dyn"></g>'+slider("y",14,286,196);
  return '<svg viewBox="0 0 300 206">'+h+'</svg>'},
 init:svg=>DG.h2un._set(svg),
 drag:(svg,n,x)=>{DG.h2un._y=Math.round(1945+Math.max(0,Math.min(1,(x-14)/272))*(2026-1945));DG.h2un._set(svg)},
 _set:svg=>{const y=DG.h2un._y,v=unAt(y),x=ux(y);
  let g='<line x1="'+x.toFixed(1)+'" x2="'+x.toFixed(1)+'" y1="40" y2="150" stroke="'+ACC+'" stroke-width="1.2"/><circle cx="'+x.toFixed(1)+'" cy="'+uy(v).toFixed(1)+'" r="3" fill="'+ACC+'" stroke="#fff"/>';
  g+=T(288,14,y+": "+v+" members",'text-anchor="end" font-size="10" font-weight="900" fill="'+ACC+'"');
  g+='<foreignObject x="12" y="160" width="276" height="26"><div xmlns="http://www.w3.org/1999/xhtml" style="font:500 6.8px/1.3 Inter,system-ui,sans-serif;color:'+SUBC+'">'+unMsg(y)+'</div></foreignObject>';
  if(typeof dgDyn==="function")dgDyn(svg,g);else paint(svg,".dg-dyn",g);const k=svg.querySelector(".dg-k-y");if(k)k.setAttribute("cx",(14+(y-1945)/(2026-1945)*272).toFixed(1))}};
if(typeof PS_DIAG!=="undefined"){Object.assign(PS_DIAG,{"hwars|The human cost":"h2cost","hwars|The United Nations":"h2un","hcoldwar|The Year of Africa":"h2un","hcoldwar|NATO and the Warsaw Pact":"nukes"});if(DG.growth)PS_DIAG["hsince91|The rise of China"]="growth"}
try{["h2cost","h2un"].forEach(k=>{if(!DG_ORDER.includes(k))DG_ORDER.push(k);if(!SIM_KEYS.includes(k))SIM_KEYS.push(k);DG[k].cat="people"})}catch(e){}
}

/* ---------- questions: a right answer inks the named country's Knowledge stamp ---------- */
try{if(typeof TOURQ!=="undefined"){
TOURQ.hwars={mid:[
 {at:"The Western Front",st:"A shot in Sarajevo",q:"Whose murder in Sarajevo in June 1914 set off World War I?",o:["The Tsar of Russia","Archduke Franz Ferdinand","The Kaiser of Germany","The King of Serbia"],a:1,why:"He was heir to the throne of Austria-Hungary; a Bosnian Serb nationalist shot him and his wife.",kc:"ba"},
 {at:"A new Middle East",st:"Gallipoli",q:"Which day remembers the Gallipoli landings in Australia and New Zealand?",o:["Remembrance Day","Waitangi Day","Anzac Day","Australia Day"],a:2,why:"Anzac Day, 25 April: the troops landed on 25 April 1915.",kc:"tr"},
 {at:"D-Day",st:"Stalingrad",q:"Which city saw the battle, in 1942–43, where a whole German army was destroyed?",o:["Leningrad","Moscow","Stalingrad","Warsaw"],a:2,why:"Stalingrad, now Volgograd, on the Volga.",kc:"ru"}],
 recap:[
 {q:"How many soldiers came ashore in Normandy on D-Day, 6 June 1944?",o:["About 15,000","About 156,000","About 1.5 million","About 5 million"],a:1,why:"The largest invasion from the sea ever made, on five beaches.",st:"D-Day",kc:"fr"},
 {q:"Which country lost the biggest share of its people in World War II?",o:["United Kingdom","Poland","France","United States"],a:1,why:"About one person in six in Poland died, including about 3 million Polish Jews.",st:"The human cost",kc:"pl"},
 {q:"How many members did the United Nations start with in 1945?",o:["5","25","51","193"],a:2,why:"51; it has 193 today.",st:"The United Nations",kc:"us"}]};
TOURQ.hcoldwar={mid:[
 {at:"NATO and the Warsaw Pact",st:"Berlin divided",q:"In which year did East Germany build the Berlin Wall?",o:["1945","1949","1961","1989"],a:2,why:"On 13 August 1961, to stop East Germans fleeing west.",kc:"de"},
 {at:"China’s revolution",st:"Partition of India",q:"In 1947 British India was divided into India and which other country?",o:["Bangladesh","Sri Lanka","Pakistan","Myanmar"],a:2,why:"Pakistan, in two parts; East Pakistan became Bangladesh in 1971.",kc:"in"},
 {at:"Vietnam",st:"The Year of Africa",q:"How many African countries became independent in 1960?",o:["3","9","17","30"],a:2,why:"Seventeen, most of them former French colonies: the Year of Africa.",kc:"gh"}],
 recap:[
 {q:"Where were the Soviet missiles found in October 1962?",o:["Turkey","Cuba","East Germany","Vietnam"],a:1,why:"In Cuba, about 150 km from Florida: 13 days on the brink.",st:"The Cuban Missile Crisis",kc:"cu"},
 {q:"Who was the first person in space?",o:["Neil Armstrong","Yuri Gagarin","Valentina Tereshkova","Buzz Aldrin"],a:1,why:"Yuri Gagarin, on 12 April 1961.",st:"The space race",kc:"kz"},
 {q:"Into how many countries did the Soviet Union break up in 1991?",o:["5","9","15","27"],a:2,why:"Fifteen, from Estonia to Tajikistan.",st:"The end of the Soviet Union",kc:"ru"}]};
TOURQ.hsince91={mid:[
 {at:"Europe grows together",st:"Yugoslavia breaks apart",q:"Which city was besieged for nearly four years in the 1990s?",o:["Belgrade","Zagreb","Sarajevo","Ljubljana"],a:2,why:"Sarajevo, from 1992 to 1996.",kc:"ba"},
 {at:"September 11",st:"The rise of China",q:"Which city grew from a small town in 1980 into a city of over 17 million?",o:["Shanghai","Shenzhen","Hong Kong","Beijing"],a:1,why:"Shenzhen, China’s first special economic zone, next to Hong Kong.",kc:"cn"},
 {at:"The newest country",st:"The Arab Spring",q:"In which country did the Arab Spring begin, in December 2010?",o:["Egypt","Tunisia","Syria","Libya"],a:1,why:"In Tunisia, after a street seller set himself on fire in Sidi Bouzid.",kc:"tn"}],
 recap:[
 {q:"What is the world’s newest country?",o:["Kosovo","Timor-Leste","South Sudan","Montenegro"],a:2,why:"South Sudan, independent on 9 July 2011.",st:"The newest country",kc:"ss"},
 {q:"In which city was the 2015 climate agreement signed?",o:["Kyoto","Rio de Janeiro","Paris","Copenhagen"],a:2,why:"Paris, in December 2015.",st:"Climate agreements",kc:"fr"},
 {q:"In what year did the UK vote to leave the European Union?",o:["2008","2016","2020","2022"],a:1,why:"On 23 June 2016; it left on 31 January 2020.",st:"Brexit",kc:"gb"}]};
}}catch(e){}

/* ---------- photos: card photos by stop, photo pins by label (Commons file names in the shared library, plus GF_HIST2_PHOTOS) ---------- */
const P={sarajevo:"Latin Bridge 2023.jpg",anzac:"View of Anzac Cove - Gallipoli Peninsula - Dardanelles - Turkey - 01 (5734713946).jpg",stal:"The Battle of Stalingrad second collage.jpg",ausch:"Auschwitz II Birkenau - gate, tracks.jpg",
 arizona:"USS Arizona Memorial (aerial view).jpg",genbaku:"Genbaku Dome04-r.JPG",unga:"United Nations General Assembly Hall (3).jpg",checkpoint:"Berlin - Checkpoint Charlie 1963.jpg",wall:"Berlinermauer.jpg",
 dmz:"DMZ AT PANMUNJOM DPRK (NORTH KOREA)OCT 2012 (8157355503).jpg",wagah:"Lowering of the flags at the Wagah border.jpg",accra:"Black Star Square and Independence Arch, Accra, Ghana.jpg",hcm:"Hanoi, Vietnam, Ho Chi Minh Mausoleum on Ba Dinh Square.jpg",
 huey:"UH-1 Huey helicopter (Vietnam War) - Wisconsin Veterans Museum - DSC03070.JPG",havana:"AvMalecon-LaHabanaCuba-04735.jpg",bikini:"Operation Crossroads Baker Edit.jpg",apollo:"Apollo 11 Launch - GPN-2000-000630.jpg",aldrin:"Aldrin Apollo 11.jpg",
 tian:"1996 -247-15a Beijing Tiananmen Gate (5068462443).jpg",fall:"Fall of the Berlin Wall 1989, people walking.jpg",kremlin:"Moscow Kremlin and Bolshoy Kamenny Bridge late evening 01.JPG",
 shenzhen:"The panorama of Futian Shenzhen.jpg",pudong:"Shanghai Pudong skyline by day.jpg",nine:"National September 11 Memorial, World Trade Center, Manhattan, New York.jpg",ep:"European Parliament Strasbourg Hemicycle - Diliff.jpg",juba:"Juba City.jpg",
 mostar:"Stari Most, Mostar.jpg",zaatari:"Zaatari Refugee Camp John Green 18.png",kyiv:"People on a metro station during Russian invasion, Kyiv, 2022.jpg",przemysl:"Ukrainian refugees at Przemyśl returning home.jpg",
 greenland:"Early Melt on the Greenland Ice Sheet (33354485670).jpg",riga:"0873 LVA Riga freedom monument SE.jpg",astana:"Night at Esil District, Astana (P1190721).jpg",baghdad:"Sunset in Baghdad, Iraq.jpg",
 westminster:"Palace of Westminster as seen from Westminster Bridge.jpg",charles:"Charles Bridge Covid.jpg",krakow:"Empty Old Town Market Square in Kraków during the COVID-19 pandemic in Poland, April 2020.jpg",wuhan:"CN - Hubei - Wuhan - Kranichpagode.jpg",
 nato:"Finland flag raising at NATO Headquarters 4 April 2023.jpg",bamiyan:"Buddhas of Bamiyan D39.jpg"};
const PIN={"Latin Bridge, Sarajevo":P.sarajevo,"Anzac Cove":P.anzac,"Stalingrad":P.stal,"Auschwitz-Birkenau":P.ausch,"USS Arizona Memorial":P.arizona,"Genbaku Dome":P.genbaku,"UN General Assembly":P.unga,
 "Checkpoint Charlie, 1963":P.checkpoint,"The Berlin Wall":P.wall,"Panmunjom":P.dmz,"Wagah border":P.wagah,"Black Star Square, Accra":P.accra,"Ho Chi Minh Mausoleum":P.hcm,"Huey helicopter":P.huey,"Havana":P.havana,
 "Bikini Atoll test":P.bikini,"Apollo 11 launch":P.apollo,"Buzz Aldrin on the Moon":P.aldrin,"Tiananmen Gate":P.tian,"Fall of the Berlin Wall":P.fall,"The Kremlin":P.kremlin,
 "Shenzhen":P.shenzhen,"Pudong, Shanghai":P.pudong,"9/11 Memorial":P.nine,"European Parliament":P.ep,"Juba":P.juba,"Stari Most, Mostar":P.mostar,"Zaatari camp":P.zaatari,"Kyiv metro, 2022":P.kyiv,"Refugees at Przemyśl":P.przemysl,
 "Greenland ice melting":P.greenland,"Freedom Monument, Riga":P.riga,"Astana":P.astana,"Baghdad":P.baghdad,"Palace of Westminster":P.westminster,"Charles Bridge, Prague, 2020":P.charles,"Kraków, April 2020":P.krakow,"Wuhan":P.wuhan};
const CARD={
 hwars:{"A world at war":P.anzac,"A shot in Sarajevo":P.sarajevo,"Gallipoli":P.anzac,"Stalingrad":P.stal,"The Holocaust":P.ausch,"War in the Pacific":P.arizona,"Hiroshima and Nagasaki":P.genbaku,"The United Nations":P.unga},
 hcoldwar:{"Two superpowers":P.bikini,"The Iron Curtain":P.checkpoint,"Berlin divided":P.wall,"NATO and the Warsaw Pact":P.bikini,"Partition of India":P.wagah,"China’s revolution":P.tian,"The Korean War":P.dmz,"The Year of Africa":P.accra,"Vietnam":P.huey,"The Cuban Missile Crisis":P.havana,"The space race":P.aldrin,"The Wall falls":P.fall,"The end of the Soviet Union":P.kremlin},
 hsince91:{"A new world":P.nine,"One country becomes fifteen":P.riga,"Yugoslavia breaks apart":P.mostar,"Europe grows together":P.ep,"The rise of China":P.shenzhen,"September 11":P.nine,"The Iraq War":P.baghdad,"The Arab Spring":P.zaatari,"The newest country":P.juba,"Climate agreements":P.greenland,"Brexit":P.westminster,"COVID-19":P.charles,"War in Ukraine":P.kyiv}};
const PHOTOS=window.GF_HIST2_PHOTOS||[];
try{if(window._gfExtraDone&&typeof PS_PHOTO_DATA!=="undefined"){const have=new Set(PS_PHOTO_DATA.map(p=>p.f));PHOTOS.forEach(p=>{if(!have.has(p.f))PS_PHOTO_DATA.push(p)})}else if(typeof GF_EXTRA_PHOTOS!=="undefined")PHOTOS.forEach(p=>GF_EXTRA_PHOTOS.push(p))}catch(e){}
PHOTOS.forEach(p=>{if(p.card&&p.tour&&CARD[p.tour])CARD[p.tour][p.card]=p.f;(p.pins||[]).forEach(l=>PIN[l]=p.f)});
const IDS=Object.keys(TOURS);
if(typeof psPhotoFor==="function"){const _pf=psPhotoFor;psPhotoFor=function(St){try{const want=typeof ps!=="undefined"&&ps&&St&&CARD[ps.tour]&&CARD[ps.tour][St.title];if(want){if(typeof gfMergeExtra==="function")gfMergeExtra();const p=PS_PHOTO_DATA.find(x=>x&&x.f===want&&x.d);if(p)return p}}catch(e){}return _pf.apply(this,arguments)}}
try{Object.assign(GF_SQ_FILE,PIN)}catch(e){}
/* photo pins without a photo are dropped; the photos are registered before each stop draws */
const KEEP=new Map();
IDS.forEach(ID=>{PS_TOURS[ID].steps.forEach(St=>{if(St.phPins)St.phPins=St.phPins.filter(q=>PIN[q.label])});
 PS_TOURS[ID].steps.forEach(St=>KEEP.set(St,(St.phPins||[]).map(q=>Object.assign({},q))))});
function prep(St){try{const K=St&&KEEP.get(St);if(!K||!K.length)return;if(typeof gfMergeExtra==="function")gfMergeExtra();window.PS_SQ_IMG=window.PS_SQ_IMG||{};
 K.forEach(q=>{const f=PIN[q.label],k=f&&PS_PHOTO_DATA.findIndex(x=>x&&x.f===f);if(k>=0)PS_SQ_IMG[q.label]=k});
 const labs=new Set(K.map(q=>q.label));if(St._restored)St._restored=St._restored.filter(r=>!labs.has(r[1]));if(St.pins)St.pins=St.pins.filter(p=>!labs.has(Array.isArray(p)?p[1]:p.text));if(St._pins0)St._pins0=St._pins0.filter(p=>!labs.has(Array.isArray(p)?p[1]:p.text));
 if((St.phPins||[]).length!==K.length){St.phPins=K.map(q=>Object.assign({},q));St._sqPruned=-1;return true}}catch(e){console.error(e)}}
const mine=()=>typeof ps!=="undefined"&&ps&&IDS.includes(ps.tour);
function restore(){try{if(!mine())return;if(prep(psSteps()[ps.i])){if(typeof psPhPinsSync==="function")psPhPinsSync();if(typeof psPlacePins==="function")psPlacePins(true)}}catch(e){console.error(e)}}
if(typeof psGo==="function"){const _g=psGo;psGo=function(i){try{if(mine())prep(psSteps()[i])}catch(e){}const r=_g.apply(this,arguments);restore();setTimeout(restore,300);return r}}
/* covers for the Guided tours page cards: reuse the card photo of a key stop */
try{if(typeof TOUR_THUMBS!=="undefined"){const th=(id,f)=>{if(TOUR_THUMBS[id])return;if(typeof gfMergeExtra==="function")gfMergeExtra();const p=PS_PHOTO_DATA.find(x=>x&&x.f===f&&x.d&&/^photos\//.test(x.d));if(p)TOUR_THUMBS[id]=p.d};th("hwars",P.anzac);th("hcoldwar",P.fall);th("hsince91",P.shenzhen)}}catch(e){}
/* on the Tours page, in order after the other history tours */
const o=PS_TOUR_ORDER;IDS.forEach(id=>{const i=o.indexOf(id);if(i>=0)o.splice(i,1)});let a=o.indexOf("hrevolutions");if(a<0)a=o.indexOf("hmodern");if(a<0)a=o.indexOf("hancient");o.splice(a>=0?a+1:o.length,0,...IDS);
})();
