/* GeoFlock: the Philosophy tour, reworked (replaces the steps built in geoflock-tours-ideas1.js; same id, colour and shelf).
   The tour is about philosophy: the big ideas in plain words, with the thinkers who had them. Geography comes in only
   where a place really shaped the ideas, and then the card says how: a trading port with no official story (Miletus),
   mountains that split Greece into hundreds of states (Aristotle's 158 constitutions), rival kingdoms bidding for
   advisers (Linzi), a crossroads of translators (Baghdad), a borderland of three faiths (Córdoba), a merchant refuge
   (Amsterdam) and a port that brought the world to Kant (Königsberg). Every stop stays on the History map, at the year
   it talks about, so the map never switches.
   Photos: the shared library and the Philodyssey portraits already in it; four new portraits (from Philodyssey's
   img/th, Wikimedia Commons originals) are listed in GF_PHILO2_PHOTOS with author, licence and page.
   Older patches keyed by the old stop titles (polish-l) are skipped: the new stops carry their own photo pins. Load it
   after the other tour and polish files. */
(function(){
if(typeof PS_TOURS==="undefined"||!PS_TOURS.philosophy)return;
const ID="philosophy",TL="#b79be6",W=[-180,-58,180,80];
const S=o=>Object.assign({_autoSpin:1,_ctx:1,_lg:1,_ky:1,_enr:1,card:"left",mode:"history"},o);
/* photo pin: at, label, library file (Commons file name) */
const ph=(at,label,f)=>({at,label,f});
const ic=(at,icon)=>({at,icon,col:"#7b55c7"});

/* new pictures for the shared library (portraits from Philodyssey's img/th; Commons originals) */
window.GF_PHILO2_PHOTOS=[
 {f:"Half Portraits of the Great Sage and Virtuous Men of Old - Meng Ke (孟軻).jpg",d:"photos/ph_mencius.webp",by:"Unknown artist, Yuan dynasty (National Palace Museum)",lic:"Public domain",page:"https://commons.wikimedia.org/wiki/File:Half_Portraits_of_the_Great_Sage_and_Virtuous_Men_of_Old_-_Meng_Ke_(%E5%AD%9F%E8%BB%BB).jpg",y:30},
 {f:"Portrait of Xun Zi.jpg",d:"photos/ph_xunzi.webp",by:"Unknown artist (imagined portrait)",lic:"Public domain",page:"https://commons.wikimedia.org/wiki/File:Portrait_of_Xun_Zi.jpg",y:30},
 {f:"Философ Мо-Цзы.jpg",d:"photos/ph_mozi.webp",by:"Vjacheslav Rublevskiy (imagined portrait)",lic:"CC0",page:"https://commons.wikimedia.org/wiki/File:%D0%A4%D0%B8%D0%BB%D0%BE%D1%81%D0%BE%D1%84_%D0%9C%D0%BE-%D0%A6%D0%B7%D1%8B.jpg",y:30},
 {f:"Statue Of Han Fei.png",d:"photos/ph_hanfeizi.webp",by:"Sabinowitz",lic:"CC BY-SA 4.0",page:"https://commons.wikimedia.org/wiki/File:Statue_Of_Han_Fei.png",y:30}];

/* library files used below */
const F={
 thales:"Arte romana, testa di talete di mileto, II sec..JPG",heraclitus:"Heraclitus b 4 compressed.jpg",parmenides:"Busto di Parmenide (cropped).jpg",
 socrates:"Socrates Louvre.jpg",plato:"Plato Silanion Musei Capitolini MC1377.png",aristotle:"Aristotle Altemps Inv8575.jpg",
 zeno:"Paolo Monti - Servizio fotografico (Napoli, 1969) - BEIC 6353768.jpg",epictetus:"Epicteti Enchiridion Latinis versibus adumbratum (Oxford 1715) frontispiece (cropped).jpg",
 marcus:"MSR-ra-61-b-1-DM.jpg",buddha:"Buddha in Sarnath Museum (Dhammajak Mutra).jpg",nagarjuna:"Nagarjuna with 84 mahasiddha cropped.jpg",
 confucius:"Confucius Tang Dynasty.jpg",laozi:"Zhang Lu-Laozi Riding an Ox.jpg",zhuangzi:"Zhuangzi.gif",
 averroes:"Andrea di bonaiuto, apoteosi di san tommaso d'aquino, 11 averroè.jpg",alfarabi:"Al-Farabi.jpg",maimonides:"Maimonides.jpg",
 machiavelli:"Portrait of Niccolò Machiavelli by Santi di Tito.jpg",montaigne:"Portrait of Michel de Montaigne, circa unknown.jpg",
 descartes:"Frans Hals - Portret van René Descartes.jpg",spinoza:"Spinoza.jpg",locke:"Godfrey Kneller - Portrait of John Locke (Hermitage).jpg",
 hume:"David Hume Ramsay.jpg",rousseau:"Maurice Quentin de La Tour - Portrait of Jean-Jacques Rousseau - adjusted.jpg",wollstonecraft:"Mary Wollstonecraft Portrait.jpg",
 kant:"Immanuel Kant - Gemaelde 1.jpg",hegel:"Jakob Schlesinger - Hegel 1831.jpg",kierkegaard:"Søren Kierkegaard (1813-1855) - (cropped).jpg",
 mill:"John Stuart Mill by London Stereoscopic Company, c1870.jpg",nietzsche:"Nietzsche187a.jpg",wittgenstein:"Ludwig Wittgenstein 1929.jpg",
 russell:"Bertrand Russell in 1936.jpg",frege:"Young frege.jpg",beauvoir:"Simone De Beauvoir (cropped).jpg",sartre:"Jean Paul Sartre 1965.jpg",
 rawls:"John Rawls (1971 photo portrait).jpg",singer:"Peter Singer 2017 (cropped).jpg",ambedkar:"Dr. Bhimrao Ambedkar.jpg",dubois:"W.E.B. Du Bois by James E. Purdy, 1907 (3x4).jpg",
 mencius:"Half Portraits of the Great Sage and Virtuous Men of Old - Meng Ke (孟軻).jpg",xunzi:"Portrait of Xun Zi.jpg",mozi:"Философ Мо-Цзы.jpg",hanfei:"Statue Of Han Fei.png",
 acropolis:"Attica 06-13 Athens 50 View from Philopappos - Acropolis Hill.jpg",delphi:"Delphi, Greece - panoramio.jpg",
 olympia:"Top down aerial of the Stadium in Olympia, Greece (51223830819).jpg",stoa:"Stoa of Attalos, Athens, Greece.jpg",
 qufu:"Dacheng Hall.JPG",nalanda:"Temple 3 - Sariputta Stupa - Nalanda Mahavihara (10).jpg",varanasi:"Varanasi Munshi Ghat3.jpg",
 tigris:"Tigris in Baghdad 1958 04.jpg",khwarizmi:"Image-Al-Kitāb al-muḫtaṣar fī ḥisāb al-ğabr wa-l-muqābala.jpg",bukhara:"Ark of Bukhara 2023.9.jpg",
 cordoba:"Great Mosque of Cordoba, interior, 8th - 10th centuries (38) (29721130342).jpg",
 florence:"Florence Duomo from Michelangelo hill.jpg",venice:"(Venice) Doge's Palace and campanile of St. Mark's Basilica facing the sea.jpg",
 canals:"KeizersgrachtReguliersgrachtAmsterdam.jpg",edinburgh:"Castle, City of Edinburgh (IMG 20190628 180330).jpg",
 kanttomb:"Kaliningrad - Cathedral and Kant tomb.jpg",flore:"Café de Flore, 172 boulevard Saint-Germain, Paris 6e.jpg",nyhavn:"Nyhavn, Copenhagen, 20220618 1725 7350.jpg"};

const STEPS=[
S({title:"The big questions",view:W,sub:"2026",globe:[60,30,1],card:undefined,photo:F.acropolis,
 ph:[ph([23.72,37.98],"Athens: Socrates",F.socrates),ph([84.99,24.69],"Bodh Gaya: the Buddha",F.buddha),ph([116.99,35.6],"Qufu: Confucius",F.confucius),
  ph([-4.78,37.88],"Córdoba: Ibn Rushd",F.averroes),ph([4.9,52.37],"Amsterdam: Descartes",F.descartes),ph([20.51,54.71],"Königsberg: Kant",F.kant),
  ph([2.35,48.86],"Paris: Simone de Beauvoir",F.beauvoir),ph([-71.12,42.37],"Harvard: John Rawls",F.rawls)],
 stat:"What is real? How do we know? How should we live? What is fair?",
 body:"Philosophy means ‘love of wisdom’ in Greek. It tackles questions that experiments alone can’t settle, and answers them with reasons anyone can check. This tour is about those ideas and the people who had them; where a place helped shape an idea, the card shows how.",
 more:"Watch for a pattern: busy ports where strangers swap stories, crossroads where books are translated, small rival states that compete for clever advisers, and refuges where thinkers can print what is banned elsewhere. Around 2,500 years ago Confucius, the Buddha and the first Greek philosophers lived within about a century of each other, without knowing of one another."}),

S({title:"Miletus: from myth to nature",view:[12,24,48,48],globe:[30,37,2.6],sub:"bc500",photo:F.thales,
 lines:[{coords:[[27.28,37.53],[26.4,39.2],[26.6,40.3],[29,41.1],[32,42],[35.15,42.03]],kind:"flow"},{coords:[[27.28,37.53],[26.4,39.2],[26.6,40.3],[29,41.1],[30.5,43.5],[31.9,46.69]],kind:"flow"},
  {coords:[[27.28,37.53],[27.5,35.5],[29.5,32.3],[30.6,30.9]],kind:"flow"},{coords:[[27.28,37.53],[32,37.4],[37,36.9],[40.5,35.5],[44.42,32.54]],kind:"flow"}],
 pins:[[[27.28,37.53],"Miletus","point"],[[35.15,42.03],"Sinope: a Milesian colony","point"],[[31.9,46.69],"Olbia: a Milesian colony","point"],
  [[30.6,30.9],"Naukratis: Greek traders in Egypt","point"],[[44.42,32.54],"Babylon: centuries of star records","point"]],
 ph:[ph([27.34,37.94],"Ephesus: Heraclitus",F.heraclitus),ph([15.155,40.16],"Elea: Parmenides",F.parmenides)],
 stat:"Philosophy was born where ships unload other people’s gods",
 body:"Around 600 BC in Miletus, a Greek port on the coast of today’s Turkey, Thales explained the world through nature instead of stories about gods: everything, he guessed, is made of water. His pupil Anaximander said it all comes from something boundless, and drew one of the first maps of the world. Miletus traded with its colonies around the Black Sea and with Egypt and Babylon, and had no powerful priests guarding one official story, so rival explanations could be compared out loud.",
 more:"Thales was wrong about water, but his question was new: what single natural stuff lies behind everything? The historian Herodotus said geometry (‘earth-measuring’) began in Egypt, where the Nile’s yearly flood washed away field boundaries and surveyors had to measure them out again; Greek travellers such as Thales brought ideas like this home. Up the coast at Ephesus, Heraclitus said everything flows, while Parmenides, in Elea in southern Italy, argued that change is an illusion."}),

S({title:"Qufu: Confucius and the Way",view:[98,22,128,42],globe:[114,34,2.6],sub:"bc500/chn",photo:F.confucius,
 pins:[[[112.45,34.62],"Luoyang: the Zhou kings’ capital","point"]],
 ph:[ph([116.99,35.6],"Temple of Confucius, Qufu",F.qufu),ph([110.87,34.63],"Hangu Pass: Laozi",F.laozi),ph([115.65,34.41],"Meng: Zhuangzi",F.zhuangzi)],
 stat:"‘Do not do to others what you would not want done to yourself’",
 body:"Confucius (551–479 BC), a teacher from Qufu, said goodness is learned like a craft: through family love, good manners and practice, anyone can become a ‘noble person’. The Daoists answered: stop trying so hard. Their classic, the Daodejing, praises acting without forcing, like water, which yields yet wears away stone.",
 more:"The Zhou kings had lost their grip and China was splitting into rival states; Confucius spent some 14 years travelling from court to court in search of a ruler who would put his ideas to work, and found none. Legend says Laozi wrote the Daodejing for the keeper of the Hangu Pass before riding west on an ox. Zhuangzi dreamed he was a butterfly, then woke and wondered: was he a man who had dreamed of being a butterfly, or a butterfly now dreaming it was a man?"}),

S({title:"The Ganges: is there a self?",view:[70,13,92,30],globe:[82,23,3.5],sub:"bc400/ind",photo:F.buddha,
 pins:[[[84.99,24.69],"Bodh Gaya: awakening","point"],[[83.28,27.47],"Lumbini: birth","point"]],
 ph:[ph([83.0,25.32],"Varanasi and Sarnath",F.varanasi),ph([85.44,25.14],"Nalanda",F.nalanda),ph([79.31,16.52],"Nagarjunakonda: Nagarjuna",F.nagarjuna)],
 stat:"‘Tat tvam asi’, ‘you are that’: or is there no fixed self at all?",
 body:"In an Upanishad composed by the Ganges, a father dissolves salt in water and asks his son to find it: it is everywhere, though unseen. Like the salt, he says, the one reality, Brahman, is in everything, and your deepest self is that. The Buddha, who awoke under a tree at Bodh Gaya and first taught at Sarnath, said instead that a person has no fixed self, just as a chariot is nothing but its parts.",
 more:"The wet Ganges plain grew rice in plenty. It fed new cities and kingdoms such as Magadha, shaded on this map of 400 BC, and also many wandering teachers who lived on gifts of food and debated in public; the Buddha and Mahavira, the founder of Jainism, were two of them. The Buddha taught a Middle Way between luxury and starving yourself. Around AD 200 Nagarjuna went further: nothing exists on its own; everything depends on other things."}),

S({title:"Athens: Socrates and Plato",view:[16,34.5,28,41.5],globe:[23,38.5,4],sub:"bc400/alex",photo:F.socrates,
 pins:[[[23.722,37.975],"The Agora, Athens","point"],[[22.5,38.48],"Delphi: ‘Know yourself’","point"]],
 ph:[ph([23.69,38.05],"The Academy: Plato",F.plato)],
 iconPins:[ic([23.708,37.992],"book")],
 stat:"Do you really know what you think you know?",
 body:"Socrates wrote nothing. In the Agora, the market square of democratic Athens, he asked people simple questions like ‘What is courage?’ until they saw their answers didn’t hold up. His student Plato imagined prisoners chained in a cave who see only shadows on a wall and take them for the real world: philosophy, he said, is turning round to see what casts the shadows.",
 more:"Athens sentenced Socrates to death in 399 BC for ‘corrupting the young’; he refused to escape. Plato founded the Academy around 387 BC, which gave us the word ‘academic’, and wrote his ideas as conversations, with Socrates as the main speaker. Athens was a sea power and a democracy whose citizens were used to arguing in public, though women, slaves and foreigners had no vote."}),

S({title:"Fragmentation: Greece’s many constitutions",view:[13,34.5,29,42],globe:[22,38.5,3.6],sub:"bc400/alex",photo:F.delphi,
 pins:[[[23.73,37.98],"Athens: democracy","point"],[[22.43,37.07],"Sparta: two kings and a council","point"],[[22.93,37.91],"Corinth: rule by the rich","point"],
  [[15.29,37.07],"Syracuse: tyrants","point"]],
 ph:[ph([23.79,40.53],"Stagira: Aristotle",F.aristotle),ph([21.63,37.64],"Olympia: games for all Greeks",F.olympia)],
 stat:"Aristotle’s school collected 158 constitutions to compare: geography produced the sample",
 body:"Mountains cut Greece into small valleys and islands, and the sea was easier to cross than the passes, so instead of one kingdom there were hundreds of city-states, each trying its own laws: kings, tyrants, rule by the rich, democracy. Aristotle, Plato’s student, had his school collect 158 of their constitutions and compare how each one worked. Political philosophy began as comparative government.",
 more:"From the comparison he sorted governments into rule by one, by a few or by many, each with a good form that serves everyone and a corrupt one that serves only the rulers. He called humans ‘political animals’: by nature we live in communities and argue about how to run them. Only the Athenian constitution survives, found on papyrus in Egypt and published in 1891. Shared gods, the games at Olympia and the oracle at Delphi kept ideas moving between the rival states."}),

S({title:"Linzi: the Hundred Schools",view:[100,27,126,42],globe:[114,35,2.8],sub:"bc300/chn",photo:F.mencius,
 pins:[[[118.35,36.85],"Linzi: the Jixia Academy","point"],[[108.7,34.33],"Xianyang: Qin, the final winner","point"]],
 ph:[ph([118.0,36.4],"Linzi: Xunzi",F.xunzi),ph([115.65,34.41],"Song: Mozi",F.mozi),ph([113.74,34.4],"Han: Han Fei",F.hanfei)],
 stat:"Competing states bid for good ideas like firms bid for talent",
 body:"From about 475 BC China split into the Warring States, whose kings competed for advisers who could make them rich and strong. In Linzi, its capital, the state of Qi funded the Jixia Academy, giving scholars houses and salaries simply to debate. Confucians, Mohists, Legalists and Daoists all pitched their ideas to rulers: the ‘Hundred Schools of Thought’.",
 more:"Mencius said people are born good, as water flows downhill; Xunzi, who led the Jixia Academy three times, said goodness takes training, as warped wood must be steamed straight. Mozi preached equal care for everyone and opposed wars of conquest; Han Fei, a Legalist, said only clear laws, rewards and punishments keep order. Greece’s city-states show the same pattern, and the economic historian Joel Mokyr argues the same for fragmented early-modern Europe. When Qin conquered the rest in 221 BC it backed the Legalists, and in 213 BC it burned books: the bidding was over."}),

S({title:"The Stoics: citizens of the world",view:[-14,28,38,52],globe:[22,40,2.4],sub:"100/rom",gfRuler:{a:[23.73,37.98],b:[29.92,31.2]},photo:F.marcus,
 lines:[{coords:[[33.63,34.92],[29,36],[25,37],[23.72,37.98]],kind:"flow"},{coords:[[29.12,37.93],[26,38.5],[21,38.5],[17,39.5],[12.49,41.89]],kind:"flow"}],
 pins:[[[29.92,31.2],"Alexandria: the great library","point"],[[12.49,41.89],"Rome: Seneca","point"],[[16.86,48.11],"Carnuntum: Marcus Aurelius","point"]],
 ph:[ph([33.63,34.92],"Kition: Zeno",F.zeno),ph([29.12,37.93],"Hierapolis: Epictetus",F.epictetus),ph([23.72,37.98],"The Stoa of Attalos, Athens",F.stoa)],
 stat:"Some things are up to you, and some are not: worry only about the first",
 body:"Once Alexander’s conquests, and then Rome, had swallowed the small Greek states, philosophy turned to a personal question: how can one person live well in a huge, uncertain world? Zeno of Kition taught in a painted porch, the Stoa, in Athens: you can’t control what happens, only how you judge it and respond. Asked where he came from, the earlier thinker Diogenes had answered ‘I am a citizen of the world’, and the Stoics made that an ideal.",
 more:"Rival schools answered differently: Epicurus said a happy life needs only simple pleasures and friends. Stoicism spread across the Roman Empire, shaded on this map of AD 100, taught by a former slave, Epictetus, and by an emperor, Marcus Aurelius, who wrote part of his Meditations in army camps by the Danube. Alexandria, about 940 km from Athens (drag the ruler), gathered the books of all these schools in its great library."}),

S({title:"Baghdad: the House of Wisdom",view:[20,14,80,46],globe:[48,32,2.2],sub:"800/isl",photo:F.tigris,
 lines:[{coords:[[29.92,31.2],[33,33],[38,34.5],[44.36,33.31]],kind:"flow"},{coords:[[48.5,32.28],[46.5,32.9],[44.36,33.31]],kind:"flow"},
  {coords:[[75.78,23.18],[68,24.5],[60,25.5],[56,26.6],[50,29.5],[47,31],[44.36,33.31]],kind:"flow"},{coords:[[66.96,39.65],[61,37],[54,36],[48,34.5],[44.36,33.31]],kind:"flow"}],
 pins:[[[29.92,31.2],"Alexandria: Greek books","point"],[[48.5,32.28],"Gundeshapur: Persian learning","point"],[[75.78,23.18],"Ujjain: Indian astronomy","point"],[[66.96,39.65],"Samarkand: paper","point"]],
 ph:[ph([44.2,33.1],"Baghdad: al-Farabi",F.alfarabi),ph([64.42,39.77],"Bukhara: Ibn Sina’s city",F.bukhara)],
 iconPins:[ic([44.36,33.31],"book")],
 stat:"Translators turned Greek, Persian and Indian books into Arabic: one road by which Aristotle survived",
 body:"Founded in 762 between the Tigris and the Euphrates, where Silk Road caravans met river boats from the Gulf, Baghdad grew into one of the biggest cities on Earth. Its caliphs paid scholars to translate Greek, Persian and Indian books into Arabic, and the House of Wisdom, a royal library, became the symbol of that effort. Philosophers such as al-Kindi and al-Farabi then built on Plato and Aristotle, asking how reason fits with faith.",
 more:"Paper, a Chinese invention that had reached Samarkand, was being made in Baghdad by the 790s, so books cost far less than on parchment. Ibn Sina (Avicenna), from near Bukhara, imagined a ‘floating man’ created in mid-air, unable to see, hear or touch anything, even his own body: he would still know he exists, so the self, Ibn Sina argued, is more than the body. Greek copies also survived in Byzantium, but Western Europe first met much of Aristotle in Latin translations made from Arabic."}),

S({title:"Córdoba: reason and revelation",view:[-14,29,6,45],globe:[-4,37,3.4],sub:"1100",photo:F.cordoba,
 pins:[[[-4.02,39.86],"Toledo: Arabic into Latin","point"],[[-7.99,31.63],"Marrakesh: Ibn Rushd’s last years","point"]],
 ph:[ph([-4.78,37.88],"Córdoba: Ibn Rushd",F.averroes),ph([-4.98,34.06],"Fez: Maimonides",F.maimonides)],
 stat:"Two great reasoners born in one city, about a decade apart",
 body:"Ibn Rushd (Averroes, born 1126) and Moses Maimonides (born 1138) both grew up in Córdoba, in al-Andalus, a borderland where Muslims, Jews and Christians lived side by side, with Christian kingdoms pressing from the north. Both tried to reconcile reason with revelation: Ibn Rushd argued that truth cannot contradict truth, so careful reasoning and the Qur’an must agree; Maimonides, that where the Bible seems to clash with reason it should be read as a metaphor. The question is unavoidable when rival scriptures share a market.",
 more:"The tolerance was fragile: after the stricter Almohads took Córdoba in 1148, Maimonides’ family left, living for a while in Fez and finally in Egypt, where he wrote his Guide for the Perplexed; late in life Ibn Rushd saw his books burned. Yet his commentaries on Aristotle, put into Latin in Toledo, were so studied in Europe’s new universities that scholars called him simply ‘the Commentator’; Thomas Aquinas, in Paris, argued with them."}),

S({title:"Florence: should a ruler be good?",view:[0,36,24,50],globe:[12,43,3.5],sub:"1500",photo:F.machiavelli,
 pins:[[[9.19,45.46],"Milan","point"],[[12.49,41.9],"Rome: the Pope’s lands","point"],[[14.27,40.85],"Naples","point"]],
 ph:[ph([11.26,43.77],"Florence’s cathedral",F.florence),ph([12.34,45.44],"Venice",F.venice)],
 stat:"Is it better for a ruler to be loved or feared?",
 body:"Niccolò Machiavelli, sacked as an official of the Florentine Republic in 1512, wrote The Prince about how rulers really keep power, not how they ought to. Better to be feared than loved, he said, if you cannot be both, but never hated. Readers still argue: honest realism, or advice for tyrants?",
 more:"Italy was a patchwork of rival states (Florence, Venice, Milan, the Pope’s lands, Naples), and after 1494 French and Spanish armies marched in to fight over it. As a diplomat, Machiavelli watched rulers rise and fall up close and compared them with ancient Rome: once again, many small states gave a thinker plenty of cases. In France, Michel de Montaigne wrote essays about himself and asked ‘What do I know?’."}),

S({title:"Amsterdam: a refuge for ideas",view:[1,50.4,9,54.2],globe:[5,52,5],sub:"1650/ned",photo:F.canals,
 ph:[ph([4.9,52.37],"Amsterdam: Spinoza",F.spinoza),ph([4.49,52.16],"Leiden: Descartes",F.descartes),ph([4.48,51.92],"Rotterdam: Locke",F.locke)],
 iconPins:[ic([4.49,52.16],"book")],
 stat:"Tolerance was good for trade, and philosophy hitched a ride",
 body:"The Dutch Republic was a low-lying merchant republic, much of it land reclaimed from the sea and kept dry by water boards in which neighbours had to cooperate. To trade with everyone it tolerated almost everyone, and its printers published books banned elsewhere. René Descartes lived there some 20 years: doubting everything he could, he found one thing he couldn’t doubt, ‘I think, therefore I am’.",
 more:"Baruch Spinoza, born in Amsterdam in 1632, argued that God and Nature are one and the same, and that a free state should let people think what they like and say what they think. John Locke, in exile, wrote his Letter Concerning Toleration in Amsterdam in 1685, and later lived in Rotterdam. The freedom had limits: Spinoza published without his name, and his book was banned in 1674. Descartes’ Discourse on Method was printed at Leiden in 1637."}),

S({title:"Edinburgh: what can experience teach us?",view:[-14,44,12,59],globe:[-2,52,4],sub:"1715",photo:F.hume,
 ph:[ph([-3.2,55.95],"Edinburgh Castle",F.edinburgh),ph([6.14,46.2],"Geneva: Rousseau",F.rousseau),ph([-0.08,51.55],"London: Mary Wollstonecraft",F.wollstonecraft)],
 stat:"The sun has risen every morning so far. Can you prove it will rise tomorrow?",
 body:"The Empiricists said every idea starts in the senses: John Locke called a newborn’s mind a blank sheet of paper. David Hume of Edinburgh went further. We never see one thing make another happen, only one thing following another, so our trust in cause and effect rests on habit, not proof.",
 more:"Hume also said you cannot get an ‘ought’ from an ‘is’: facts alone never tell you what to do. In an essay on national character he rejected the popular idea that climate shapes a people’s temper, pointing instead to government, trade and imitation: a philosopher warning against overdoing geography. In Geneva, Jean-Jacques Rousseau asked whether civilisation had made people worse, and in London in 1792 Mary Wollstonecraft argued that girls only seem less rational because they are denied the education boys get."}),

S({title:"Königsberg: the world comes to Kant",view:[5.6,49.5,27.6,58.5],globe:[17,54,4.5],sub:"1783",photo:F.kant,
 pins:[[[21.2,55.0],"The Baltic sea trade","point"],[[22.4,54.62],"The Pregel: river road inland","point"]],
 ph:[ph([20.51,54.71],"Kant’s tomb, Kaliningrad",F.kanttomb),ph([13.4,52.52],"Berlin: Hegel",F.hegel)],
 stat:"A crossroads can come to the philosopher",
 body:"Immanuel Kant (1724–1804) said the mind is not a mirror: space, time and cause are shapes it gives to everything we experience, so we know the world only as it appears to us. In ethics, a rule is right only if you could want everyone to follow it, and people must never be used merely as tools. Kant hardly ever left Königsberg, and argued he didn’t need to: a port and university city, he wrote, brings knowledge of people and the world to you.",
 more:"In his Anthropology he listed what made Königsberg enough: a government, a university, sea trade, and rivers into the interior that brought in neighbours with other languages and customs. He even lectured on physical geography nearly 50 times. He said Hume had woken him from his ‘dogmatic slumber’. Königsberg is now Kaliningrad, in Russia; his tomb stands beside its cathedral."}),

S({title:"Copenhagen: how should I live?",view:[-12,42,24,59],globe:[6,51,3.5],sub:"1850",photo:F.kierkegaard,
 pins:[[[12.57,55.68],"Copenhagen: Kierkegaard","point"],[[6.64,49.75],"Trier: Marx’s birthplace","point"]],
 ph:[ph([-0.13,51.51],"London: John Stuart Mill",F.mill),ph([9.76,46.43],"Sils Maria: Nietzsche",F.nietzsche)],
 stat:"‘Anxiety is the dizziness of freedom’",
 body:"In the 1800s several thinkers rebelled against grand systems that claimed to explain everyone’s life. Søren Kierkegaard, who strolled the streets of Copenhagen by day and wrote by night, said no theory can choose a life for you: you must choose, and commit. In London, John Stuart Mill argued that people should be free to live as they wish, as long as they harm no one else.",
 more:"Karl Marx, born in Trier, argued that the way people make their living shapes their ideas, not the other way round; thrown out of Germany, France and Belgium, he found refuge in London and wrote Capital in the British Museum’s reading room. Friedrich Nietzsche, walking in the Swiss Alps at Sils Maria, urged people to question the values they had inherited and create their own."}),

S({title:"Vienna: the limits of language",view:[-12,44,24,57],globe:[8,51,3.5],sub:"1925",photo:F.wittgenstein,
 pins:[[[16.37,48.21],"Vienna: Wittgenstein","point"]],
 ph:[ph([0.12,52.2],"Cambridge: Bertrand Russell",F.russell),ph([11.59,50.93],"Jena: Frege",F.frege)],
 stat:"What can words say, and what can’t they?",
 body:"Around 1900 some philosophers took up a new tool, logic: break a thought into its parts, as a chemist breaks a compound into elements. Ludwig Wittgenstein, from Vienna, came to study with Bertrand Russell in Cambridge. He first said language pictures facts; later he said a word’s meaning is the way we use it, like a move in a game.",
 more:"In the 1920s the Vienna Circle met to sweep away any claim that science could not check. As the Nazis rose, most of its members left for Britain and America, taking this way of doing philosophy with them; Karl Popper, a critic close to the Circle, wrote his defence of free societies, The Open Society, in faraway Christchurch, New Zealand. Russell described a stopped clock that happens to show the right time: if you trust it, do you know the time?"}),

S({title:"Paris: condemned to be free",view:[-14,33,16,53],globe:[2,45,3.5],sub:"1950",photo:F.beauvoir,
 pins:[[[7.85,47.99],"Freiburg: Husserl","point"]],
 ph:[ph([2.35,48.85],"Paris: Sartre",F.sartre),ph([3.06,36.75],"Algiers: Camus","Albert Camus, gagnant de prix Nobel, portrait en buste, posé au bureau, faisant face à gauche, cigarette de tabagisme.jpg")],
 stat:"‘Existence comes before essence’: you are not born with a purpose; you make yourself by your choices",
 body:"In Paris after the Second World War, Jean-Paul Sartre said humans have no fixed nature, so we are free, and responsible for who we become; pretending otherwise is ‘bad faith’. Simone de Beauvoir added that freedom is always lived in a situation: ‘One is not born, but rather becomes, a woman’, she wrote in The Second Sex (1949).",
 more:"Albert Camus, who grew up in Algiers, said life has no built-in meaning, yet we can still live it fully, like Sisyphus pushing his rock uphill. Their existentialism grew out of phenomenology, begun by Edmund Husserl in Freiburg: describe experience exactly as it shows up. During the war Sartre and Beauvoir wrote in the cafés of Saint-Germain, partly because the cafés were heated."}),

S({title:"Now explore",view:W,globe:[20,25,1],sub:"2026",card:undefined,photo:F.rawls,
 pins:[[[-71.12,42.37],"Harvard, 1971","point"]],
 ph:[ph([144.96,-37.81],"Melbourne: Peter Singer",F.singer),ph([72.88,19.08],"Mumbai: B. R. Ambedkar",F.ambedkar),ph([-84.39,33.75],"Atlanta: W. E. B. Du Bois",F.dubois)],
 stat:"One last thought experiment: the veil of ignorance",
 body:"In 1971 John Rawls of Harvard asked: design a fair society, but without knowing who you will be in it: rich or poor, which country, which body. What rules would you choose? Explore these thinkers, their ideas and their thought experiments further in Philodyssey.",
 more:"Today’s philosophers keep asking what we owe each other. Peter Singer asks why a child drowning in a pond in front of you should matter more than one dying far away. W. E. B. Du Bois and B. R. Ambedkar asked whose voices the old ideas of fairness had left out. The Religions and Literature tours visit the faiths and books that carried many of these ideas."})];
STEPS.forEach(s=>{if(s.card===undefined&&(s.title==="The big questions"||s.title==="Now explore"))delete s.card});
/* the card sits on the left of the map: widen each view westwards so the stop's places fall in the free right part */
STEPS.forEach(s=>{if(s.card==="left"&&s.view){const v=s.view;s.view=[Math.max(-180,v[2]-(v[2]-v[0])/0.6),v[1],v[2],v[3]]}});

/* ---------- the tour: same id, colour and shelf; only the steps and hint change ---------- */
const T=PS_TOURS[ID];
T.steps=STEPS;T.map={mode:"history"};T.stopModes=false;T.alsoOn=[];
T.hint="Thales in Miletus, Confucius, the Buddha, Socrates, Aristotle’s 158 constitutions, the Hundred Schools, the Stoics, Baghdad’s translators, Ibn Rushd and Maimonides, Machiavelli, the Dutch refuge, Hume, Kant, Kierkegaard, Wittgenstein, Beauvoir and Rawls’s veil";
STEPS._gfHist=1;
/* older patches keyed by stop title (polish-k, polish-l) must leave these stops alone */
STEPS._polK=1;STEPS.forEach(s=>{s._polLd=1});
const mine=()=>typeof ps!=="undefined"&&ps&&ps.tour===ID&&PS_TOURS[ID].steps===STEPS;

/* ---------- pictures ---------- */
const lock=(o,k,v)=>Object.defineProperty(o,k,{configurable:true,enumerable:true,get(){return v},set(){}});
const libIdx=f=>{try{return PS_PHOTO_DATA.findIndex(x=>x&&x.f===f&&x.d)}catch(e){return -1}};
function merge(){try{if(typeof gfMergeExtra==="function")gfMergeExtra();if(typeof PS_PHOTO_DATA==="undefined")return;
 const have=new Set(PS_PHOTO_DATA.map(p=>p&&p.f));GF_PHILO2_PHOTOS.forEach(p=>{if(!have.has(p.f))PS_PHOTO_DATA.push(p)})}catch(e){}}
try{if(window._gfExtraDone&&typeof PS_PHOTO_DATA!=="undefined")merge();else if(typeof GF_EXTRA_PHOTOS!=="undefined")GF_PHILO2_PHOTOS.forEach(p=>GF_EXTRA_PHOTOS.push(p))}catch(e){}
/* portraits keep faces in view (CSS object-position height, as the other Philodyssey portraits) */
function faces(){try{if(typeof PS_PHOTO_Y==="undefined")return;GF_PHILO2_PHOTOS.forEach(p=>{const k=libIdx(p.f);if(k>=0&&p.y!=null)PS_PHOTO_Y[k]=p.y})}catch(e){}}
/* photo pins: locked list (other files re-set phPins when its length changes), each pin carrying its own picture */
STEPS.forEach(s=>{const arr=(s.ph||[]).map(q=>({at:q.at,label:q.label,col:TL,icon:"photo",_f:q.f}));delete s.ph;lock(s,"phPins",arr);s._sqPruned=-1});
function reg(s){try{window.PS_SQ_IMG=window.PS_SQ_IMG||{};(s.phPins||[]).forEach(q=>{const i=libIdx(q._f);if(i>=0){q.img=i;q._gfImg=i;PS_SQ_IMG[q.label]=i}})}catch(e){}}
function regAll(){merge();faces();STEPS.forEach(reg)}
/* the card photo of each stop */
if(typeof psPhotoFor==="function"){const _pf=psPhotoFor;psPhotoFor=function(St){try{if(St&&St.photo&&STEPS.includes(St)){const i=libIdx(St.photo);if(i>=0)return PS_PHOTO_DATA[i]}}catch(e){}return _pf.apply(this,arguments)}}
if(typeof psGo==="function"){const _g=psGo;psGo=function(i){try{if(mine()){const S=psSteps()[i];if(S){merge();faces();reg(S)}}}catch(e){}return _g.apply(this,arguments)}}
/* captions under the photo pins (geoflock-phcap.js shows the part after "Place: " when it starts with a capital) */
try{window.GF_PHCAP=window.GF_PHCAP||{};Object.assign(GF_PHCAP,{
 "Baghdad: al-Farabi":"Al-Farabi","Bukhara: Ibn Sina’s city":"The Ark of Bukhara","Florence’s cathedral":"Florence’s cathedral",
 "Olympia: games for all Greeks":"Olympia’s stadium","Varanasi and Sarnath":"Varanasi’s ghats","Temple of Confucius, Qufu":"Temple of Confucius",
 "The Stoa of Attalos, Athens":"The Stoa, Athens","Kant’s tomb, Kaliningrad":"Kant’s tomb"})}catch(e){}
regAll();addEventListener("load",()=>setTimeout(regAll,1500));[4000,12000].forEach(ms=>setTimeout(regAll,ms));

/* ---------- questions: a right answer inks the named country's Knowledge stamp ---------- */
try{if(typeof TOURQ!=="undefined"){TOURQ[ID]={mid:[
 {at:"Miletus: from myth to nature",st:"Miletus: from myth to nature",q:"Thales of Miletus thought everything was made of…",o:["Fire","Water","Atoms","Air"],a:1,why:"He looked for one natural stuff behind everything; Miletus is on the coast of today’s Turkey.",kc:"tr"},
 {at:"Fragmentation: Greece’s many constitutions",st:"Fragmentation: Greece’s many constitutions",q:"How many constitutions of Greek states did Aristotle’s school collect and compare?",o:["12","58","158","1,000"],a:2,why:"Mountains and sea had split Greece into hundreds of states, each with its own laws.",kc:"gr"},
 {at:"Linzi: the Hundred Schools",st:"Linzi: the Hundred Schools",q:"What did the state of Qi pay for in its capital, Linzi?",o:["A Great Wall","The Jixia Academy","A printing press","A navy"],a:1,why:"Scholars got houses and salaries simply to debate, and rival kings listened.",kc:"cn"},
 {at:"Amsterdam: a refuge for ideas",st:"Amsterdam: a refuge for ideas",q:"Who wrote his Letter Concerning Toleration while in exile in Amsterdam?",o:["Thomas Hobbes","John Locke","David Hume","Voltaire"],a:1,why:"Locke lived in the Dutch Republic from 1683 to 1689.",kc:"nl"}],
 recap:[
 {q:"Where did the Buddha first teach the Middle Way?",o:["Lumbini","Sarnath","Kathmandu","Lhasa"],a:1,why:"In the Deer Park at Sarnath, near Varanasi.",st:"The Ganges: is there a self?",kc:"in"},
 {q:"Baghdad, home of the House of Wisdom, lies between which two rivers?",o:["The Nile and the Jordan","The Tigris and the Euphrates","The Indus and the Ganges","The Amu Darya and the Syr Darya"],a:1,why:"It was founded in 762 where the two rivers run closest together.",st:"Baghdad: the House of Wisdom",kc:"iq"},
 {q:"Ibn Rushd (Averroes) and Maimonides were both born in which city?",o:["Toledo","Córdoba","Granada","Seville"],a:1,why:"Córdoba, in al-Andalus, today’s Spain.",st:"Córdoba: reason and revelation",kc:"es"},
 {q:"Kant’s home town Königsberg is now called…",o:["Gdańsk","Kaliningrad","Klaipėda","Riga"],a:1,why:"It has been Kaliningrad, in Russia, since 1946.",st:"Königsberg: the world comes to Kant",kc:"ru"},
 {q:"Kierkegaard walked the streets of which city?",o:["Oslo","Stockholm","Copenhagen","Amsterdam"],a:2,why:"He lived almost all his life in Copenhagen.",st:"Copenhagen: how should I live?",kc:"dk"}]}}}catch(e){}
})();
