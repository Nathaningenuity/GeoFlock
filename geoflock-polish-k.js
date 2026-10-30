/* GeoFlock polish K: pictures for tour stops that showed only text labels. Turns the main text pins of the ideas tours
   (Literature, Art, Music, Mythology, Science, Maths, Psychology, Words, Learning) and of Festivals, Sports, Houses and
   Landmarks into photo pins (a famous scene, illustration, portrait or building that the label names), and adds card
   photos to stops that had none. New pictures are freely licensed files from Wikimedia Commons (GF_POLK_PHOTOS, with
   author, licence and page); the rest come from the shared library. Every patch is keyed by tour and stop title, so a
   renamed or removed stop is simply skipped; card photos are only filled in where a stop still has none. Load it after
   the tour files and the other polish patches. */
(function(){
/* new photos from Wikimedia Commons, added to the shared library */
window.GF_POLK_PHOTOS=[{"f": "British Museum Flood Tablet 1.jpg","d": "photos/x45eb0d4b563e1f58.webp","by": "Mike Peel (www.mikepeel.net)","lic": "CC BY-SA 4.0","page": "https://commons.wikimedia.org/wiki/File:British_Museum_Flood_Tablet_1.jpg"},{"f": "Walls of Troy (2).jpg","d": "photos/x159e8a52a82619b7.webp","by": "CherryX","lic": "CC BY-SA 3.0","page": "https://commons.wikimedia.org/wiki/File:Walls_of_Troy_(2).jpg"},{"f": "Krishna and Arjun on the chariot, Mahabharata, 18th-19th century, India.jpg","d": "photos/xa03df66d6ce84858.webp","by": "Unknown Indian artist, 18th–19th century","lic": "Public domain","page": "https://commons.wikimedia.org/wiki/File:Krishna_and_Arjun_on_the_chariot,_Mahabharata,_18th-19th_century,_India.jpg"},{"f": "Phoenix Hall, Byodo-in, November 2016 -01.jpg","d": "photos/xe490825a50184850.webp","by": "Martin Falbisoner","lic": "CC BY-SA 4.0","page": "https://commons.wikimedia.org/wiki/File:Phoenix_Hall,_Byodo-in,_November_2016_-01.jpg"},{"f": "Genji emaki azumaya.jpg","d": "photos/x3b33403ae0fdc08b.webp","by": "Unknown artist, about 1130 (Tokugawa Art Museum)","lic": "Public domain","page": "https://commons.wikimedia.org/wiki/File:Genji_emaki_azumaya.jpg"},{"f": "Dante's tomb (Ravenna) - Facade.jpg","d": "photos/xd995de7c0d290c90.webp","by": "ThePhotografer","lic": "CC BY-SA 4.0","page": "https://commons.wikimedia.org/wiki/File:Dante's_tomb_(Ravenna)_-_Facade.jpg"},{"f": "Shakespeare's birthplace Stratford - upon - Avon - panoramio.jpg","d": "photos/x77a644993f4c7eda.webp","by": "ianpudsey","lic": "CC BY 3.0","page": "https://commons.wikimedia.org/wiki/File:Shakespeare's_birthplace_Stratford_-_upon_-_Avon_-_panoramio.jpg"},{"f": "Gutenberg Bible, Lenox Copy, New York Public Library, 2009. Pic 01.jpg","d": "photos/x017fa4d21c72b345.webp","by": "NYC Wanderer (Kevin Eng)","lic": "CC BY-SA 2.0","page": "https://commons.wikimedia.org/wiki/File:Gutenberg_Bible,_Lenox_Copy,_New_York_Public_Library,_2009._Pic_01.jpg"},{"f": "Vasily Perov - Портрет Ф.М.Достоевского - Google Art Project.jpg","d": "photos/x68969bc9c35844ca.webp","by": "Vasily Perov (1872)","lic": "Public domain","page": "https://commons.wikimedia.org/wiki/File:Vasily_Perov_-_%D0%9F%D0%BE%D1%80%D1%82%D1%80%D0%B5%D1%82_%D0%A4.%D0%9C.%D0%94%D0%BE%D1%81%D1%82%D0%BE%D0%B5%D0%B2%D1%81%D0%BA%D0%BE%D0%B3%D0%BE_-_Google_Art_Project.jpg"},{"f": "RU YP TH 3.jpg","d": "photos/x1ea40fad5070e362.webp","by": "Digr","lic": "CC BY-SA 4.0","page": "https://commons.wikimedia.org/wiki/File:RU_YP_TH_3.jpg"},{"f": "Casa natal de Gabriel García Márquez (SAM 5602).jpg","d": "photos/xbe7fbe9064177347.webp","by": "Tim Buendía","lic": "CC BY-SA 3.0","page": "https://commons.wikimedia.org/wiki/File:Casa_natal_de_Gabriel_Garc%C3%ADa_M%C3%A1rquez_(SAM_5602).jpg"},{"f": "Chinua Achebe - Buffalo 25Sep2008 crop.jpg","d": "photos/x41b8b4cfdc802b37.webp","by": "Stuart C. Shapiro","lic": "CC BY 3.0","page": "https://commons.wikimedia.org/wiki/File:Chinua_Achebe_-_Buffalo_25Sep2008_crop.jpg"},{"f": "Naguib Mahfouz in 1960s.jpg","d": "photos/x9aa9307fe301152b.webp","by": "AUC Press","lic": "Public domain","page": "https://commons.wikimedia.org/wiki/File:Naguib_Mahfouz_in_1960s.jpg"},{"f": "Han Kang, 2024 Nobel Prize Laureate in Literature (cropped).jpg","d": "photos/x1cefdd0382624a62.webp","by": "John Sears","lic": "CC BY-SA 4.0","page": "https://commons.wikimedia.org/wiki/File:Han_Kang,_2024_Nobel_Prize_Laureate_in_Literature_(cropped).jpg"},{"f": "PikiWiki Israel 16505 \"The Little Prince\" garden in Holon.JPG","d": "photos/x16753481cecc29d3.webp","by": "Dr. Avishai Teicher, PikiWiki – Israel free image collection project","lic": "CC BY 2.5","page": "https://commons.wikimedia.org/wiki/File:PikiWiki_Israel_16505_%22The_Little_Prince%22_garden_in_Holon.JPG"},{"f": "Pinocchio.jpg","d": "photos/x603fce8730a67d81.webp","by": "Enrico Mazzanti (1883)","lic": "Public domain","page": "https://commons.wikimedia.org/wiki/File:Pinocchio.jpg"},{"f": "Torquay harbour - geograph.org.uk - 5719656.jpg","d": "photos/x6f49cf925a93fa81.webp","by": "Derek Harper","lic": "CC BY-SA 2.0","page": "https://commons.wikimedia.org/wiki/File:Torquay_harbour_-_geograph.org.uk_-_5719656.jpg"},{"f": "Altamira, bison.jpg","d": "photos/x559c681f8d1e584d.webp","by": "Unknown prehistoric artist (Altamira cave)","lic": "Public domain","page": "https://commons.wikimedia.org/wiki/File:Altamira,_bison.jpg"},{"f": "Notre-Dame de Paris, 4 October 2017.jpg","d": "photos/xcfd1642f9f7d5568.webp","by": "Ali Sabbagh","lic": "CC0","page": "https://commons.wikimedia.org/wiki/File:Notre-Dame_de_Paris,_4_October_2017.jpg"},{"f": "Kölner Dom - Westfassade 2022 ohne Gerüst-0968 b.jpg","d": "photos/x8ed9014a58e6d595.webp","by": "Raimond Spekking","lic": "CC BY-SA 4.0","page": "https://commons.wikimedia.org/wiki/File:K%C3%B6lner_Dom_-_Westfassade_2022_ohne_Ger%C3%BCst-0968_b.jpg"},{"f": "Australia Aboriginal Culture 009.jpg","d": "photos/xb01fea3747b018dd.webp","by": "Steve Evans","lic": "CC BY 2.0","page": "https://commons.wikimedia.org/wiki/File:Australia_Aboriginal_Culture_009.jpg"},{"f": "Joseph Karl Stieler's Beethoven mit dem Manuskript der Missa solemnis.jpg","d": "photos/x26dca8040f9a484b.webp","by": "Joseph Karl Stieler (1820)","lic": "Public domain","page": "https://commons.wikimedia.org/wiki/File:Joseph_Karl_Stieler's_Beethoven_mit_dem_Manuskript_der_Missa_solemnis.jpg"},{"f": "Looking East on Beale Street, Memphis, Tennessee, June 2014.jpg","d": "photos/x2350fa5feb977031.webp","by": "Anonymous Wikimedia Commons contributor","lic": "CC0","page": "https://commons.wikimedia.org/wiki/File:Looking_East_on_Beale_Street,_Memphis,_Tennessee,_June_2014.jpg"},{"f": "Mytikas peak 02.jpg","d": "photos/xa5b6bf4602564659.webp","by": "Stolbovsky","lic": "CC BY-SA 3.0","page": "https://commons.wikimedia.org/wiki/File:Mytikas_peak_02.jpg"},{"f": "Lion Gate, Hattusa 13 (cropped).jpg","d": "photos/x3bd79267c0995342.webp","by": "Carole Raddato","lic": "CC BY-SA 2.0","page": "https://commons.wikimedia.org/wiki/File:Lion_Gate,_Hattusa_13_(cropped).jpg"},{"f": "Kailash north.JPG","d": "photos/x247d3ddd7df4b625.webp","by": "Ondřej Žváček","lic": "CC BY 2.5","page": "https://commons.wikimedia.org/wiki/File:Kailash_north.JPG"},{"f": "EastHanSeismograph.JPG","d": "photos/xaa532fb0c813379e.webp","by": "Kowloonese","lic": "CC BY-SA 3.0","page": "https://commons.wikimedia.org/wiki/File:EastHanSeismograph.JPG"},{"f": "Galileo galilei, telescopi del 1609-10 ca..JPG","d": "photos/xa7cd3dae372cf933.webp","by": "Sailko","lic": "CC BY-SA 3.0","page": "https://commons.wikimedia.org/wiki/File:Galileo_galilei,_telescopi_del_1609-10_ca..JPG"},{"f": "Galileo before the Holy Office - Joseph-Nicolas Robert-Fleury, 1847.png","d": "photos/xd48772b3f9e2ea6e.webp","by": "Joseph-Nicolas Robert-Fleury (1847)","lic": "Public domain","page": "https://commons.wikimedia.org/wiki/File:Galileo_before_the_Holy_Office_-_Joseph-Nicolas_Robert-Fleury,_1847.png"},{"f": "Humboldt-Bonpland Chimborazo.jpg","d": "photos/xcdb6c0c2768da402.webp","by": "Friedrich Georg Weitsch (1810)","lic": "Public domain","page": "https://commons.wikimedia.org/wiki/File:Humboldt-Bonpland_Chimborazo.jpg"},{"f": "Marie Curie c. 1920s.jpg","d": "photos/x2683ca5b97797739.webp","by": "Henri Manuel","lic": "Public domain","page": "https://commons.wikimedia.org/wiki/File:Marie_Curie_c._1920s.jpg"},{"f": "Highest resolution image of the 1919 solar eclipse.tif","d": "photos/x3ce80afc157a8215.webp","by": "F. W. Dyson, A. S. Eddington and C. Davidson (1920); ESO/Landessternwarte Heidelberg-Königstuhl","lic": "CC BY 4.0","page": "https://commons.wikimedia.org/wiki/File:Highest_resolution_image_of_the_1919_solar_eclipse.tif"},{"f": "Wegener Expedition-1930 026 (retuschiert).jpg","d": "photos/x43a9859eb2d311b8.webp","by": "Wegener expedition 1930 (F. Loewe, J. Georgi, E. Sorge, A. Wegener)","lic": "Public domain","page": "https://commons.wikimedia.org/wiki/File:Wegener_Expedition-1930_026_(retuschiert).jpg"},{"f": "CERN Atlas Caverne.jpg","d": "photos/x2a0ee744567688e2.webp","by": "Nikolai Schwerg","lic": "CC BY-SA 3.0","page": "https://commons.wikimedia.org/wiki/File:CERN_Atlas_Caverne.jpg"},{"f": "Very Large Telescope against a beautiful twilight on Cerro Paranal.jpg","d": "photos/x81337e17f43b87b5.webp","by": "ESO/B. Tafreshi (twanight.org)","lic": "CC BY 4.0","page": "https://commons.wikimedia.org/wiki/File:Very_Large_Telescope_against_a_beautiful_twilight_on_Cerro_Paranal.jpg"},{"f": "Plimpton 322.jpg","d": "photos/xfa99cb2151147de0.webp","by": "Unknown Babylonian scribe (photo: unknown)","lic": "Public domain","page": "https://commons.wikimedia.org/wiki/File:Plimpton_322.jpg"},{"f": "P.Penn. Museum inv. E02748 Euclid's Elements 2.5.jpg","d": "photos/xacff37b624183313.webp","by": "University of Pennsylvania Museum (Oxyrhynchus papyrus 29)","lic": "CC BY-SA 4.0","page": "https://commons.wikimedia.org/wiki/File:P.Penn._Museum_inv._E02748_Euclid's_Elements_2.5.jpg"},{"f": "Liber abbaci magliab f124r.jpg","d": "photos/x74fbfd6bee4d756f.webp","by": "Leonardo Fibonacci, Liber Abaci (13th-century copy, Biblioteca Nazionale Centrale, Florence)","lic": "Public domain","page": "https://commons.wikimedia.org/wiki/File:Liber_abbaci_magliab_f124r.jpg"},{"f": "Image-Al-Kitāb al-muḫtaṣar fī ḥisāb al-ğabr wa-l-muqābala.jpg","d": "photos/x08f3040a49b9bef8.webp","by": "Muhammad ibn Musa al-Khwarizmi (copy in the Bodleian Library)","lic": "Public domain","page": "https://commons.wikimedia.org/wiki/File:Image-Al-Kit%C4%81b_al-mu%E1%B8%ABta%E1%B9%A3ar_f%C4%AB_%E1%B8%A5is%C4%81b_al-%C4%9Fabr_wa-l-muq%C4%81bala.jpg"},{"f": "Land's End, Cornwall, England.jpg","d": "photos/x23332b1af1cbcc2a.webp","by": "Keven Law","lic": "CC BY-SA 2.0","page": "https://commons.wikimedia.org/wiki/File:Land's_End,_Cornwall,_England.jpg"},{"f": "Hunminjeongum.jpg","d": "photos/xd5bfb264c66dc3c1.webp","by": "Hunminjeongeum Haerye (1446), Kansong Art Museum","lic": "Public domain","page": "https://commons.wikimedia.org/wiki/File:Hunminjeongum.jpg"},{"f": "Unuaj Libroj por Rusoj, Poloj, Francoj kaj Germanoj - 1887.jpg","d": "photos/xb6c139e6c7ba6efa.webp","by": "L. L. Zamenhof (1887)","lic": "Public domain","page": "https://commons.wikimedia.org/wiki/File:Unuaj_Libroj_por_Rusoj,_Poloj,_Francoj_kaj_Germanoj_-_1887.jpg"},{"f": "Zamenhof portreto.jpg","d": "photos/x44f4fe52f0045991.webp","by": "Unknown photographer","lic": "Public domain","page": "https://commons.wikimedia.org/wiki/File:Zamenhof_portreto.jpg"},{"f": "29610-Fez (28134041211) (qarawiyyin crop).jpg","d": "photos/xa0d72916dfdc0784.webp","by": "xiquinhosilva (cropped by R. Prazeres)","lic": "CC BY-SA 4.0","page": "https://commons.wikimedia.org/wiki/File:29610-Fez_(28134041211)_(qarawiyyin_crop).jpg"},{"f": "Myeongnyundang.jpg","d": "photos/x18bec093b002a2ea.webp","by": "GN Coordinator","lic": "CC BY-SA 4.0","page": "https://commons.wikimedia.org/wiki/File:Myeongnyundang.jpg"},{"f": "Timbuktu-manuscripts-astronomy-mathematics.jpg","d": "photos/x54b677f553241240.webp","by": "Elias Altmimi","lic": "Public domain","page": "https://commons.wikimedia.org/wiki/File:Timbuktu-manuscripts-astronomy-mathematics.jpg"},{"f": "Ireland Valentia Island telegraph.JPG","d": "photos/x0206c5628b66a8fb.webp","by": "John Flanagan","lic": "CC BY 3.0","page": "https://commons.wikimedia.org/wiki/File:Ireland_Valentia_Island_telegraph.JPG"},{"f": "Heart's Content Cable Station.JPG","d": "photos/x571098d5fe5190b3.webp","by": "Robthepiper","lic": "CC BY-SA 3.0","page": "https://commons.wikimedia.org/wiki/File:Heart's_Content_Cable_Station.JPG"},{"f": "ARPANET first router 2.jpg","d": "photos/xa10ad7a058744b84.webp","by": "Steve Jurvetson","lic": "CC BY 2.0","page": "https://commons.wikimedia.org/wiki/File:ARPANET_first_router_2.jpg"},{"f": "Christkindlesmarkt nuernberg.jpg","d": "photos/xfeb2ef8f1fbb0772.webp","by": "Roland Berger","lic": "CC BY-SA 3.0","page": "https://commons.wikimedia.org/wiki/File:Christkindlesmarkt_nuernberg.jpg"},{"f": "Theresienwiese Hacker-Festzelt Oktoberfest 2025.jpg","d": "photos/x78d915a713eb72be.webp","by": "kallerna","lic": "CC BY-SA 4.0","page": "https://commons.wikimedia.org/wiki/File:Theresienwiese_Hacker-Festzelt_Oktoberfest_2025.jpg"},{"f": "Tomatina 2006.jpg","d": "photos/x2caffa4477778554.webp","by": "Graham McLellan","lic": "CC BY 2.0","page": "https://commons.wikimedia.org/wiki/File:Tomatina_2006.jpg"},{"f": "The First Thanksgiving cph.3g04961.jpg","d": "photos/x4b097e03ca436704.webp","by": "Jean Leon Gerome Ferris (about 1915)","lic": "Public domain","page": "https://commons.wikimedia.org/wiki/File:The_First_Thanksgiving_cph.3g04961.jpg"},{"f": "UpHellyAa1(AnneBurgess)30Jan1973.jpg","d": "photos/xfa92ea064497f84e.webp","by": "Anne Burgess","lic": "CC BY-SA 2.0","page": "https://commons.wikimedia.org/wiki/File:UpHellyAa1(AnneBurgess)30Jan1973.jpg"},{"f": "SapporoFestival8.JPG","d": "photos/x2f7c3ac0e2994087.webp","by": "Materialscientist","lic": "CC BY-SA 3.0","page": "https://commons.wikimedia.org/wiki/File:SapporoFestival8.JPG"},{"f": "Estadio Azteca (2011-09-25).jpg","d": "photos/xc69e733a7f2d1d43.webp","by": "Pinjm2000","lic": "CC BY-SA 4.0","page": "https://commons.wikimedia.org/wiki/File:Estadio_Azteca_(2011-09-25).jpg"},{"f": "Cricket World Cup Final (16351625604).jpg","d": "photos/xbfd4b2a0719e4ac2.webp","by": "Tourism Victoria","lic": "CC BY 2.0","page": "https://commons.wikimedia.org/wiki/File:Cricket_World_Cup_Final_(16351625604).jpg"},{"f": "Summer Koshien 2009 Final.jpg","d": "photos/x685785d5050a42e0.webp","by": "百楽兎","lic": "CC BY-SA 3.0","page": "https://commons.wikimedia.org/wiki/File:Summer_Koshien_2009_Final.jpg"},{"f": "Aki basho dohyō-iri on Sept. 28 2014.jpg","d": "photos/x3d246bdd37b75a20.webp","by": "Jeffrey Pauletto","lic": "CC BY-SA 2.0","page": "https://commons.wikimedia.org/wiki/File:Aki_basho_dohy%C5%8D-iri_on_Sept._28_2014.jpg"},{"f": "Col tourmalet 01.jpg","d": "photos/xabbc9a5b77e16d36.webp","by": "Patrick Giraud","lic": "CC BY-SA 2.5","page": "https://commons.wikimedia.org/wiki/File:Col_tourmalet_01.jpg"},{"f": "Lacets AlpedHuez.jpg","d": "photos/x8d9a79c338626b24.webp","by": "VerTdeTerre","lic": "CC BY-SA 3.0","page": "https://commons.wikimedia.org/wiki/File:Lacets_AlpedHuez.jpg"},{"f": "Mont Ventoux 090927.jpg","d": "photos/x27bc68b94ae68af8.webp","by": "muneaki","lic": "CC BY-SA 3.0","page": "https://commons.wikimedia.org/wiki/File:Mont_Ventoux_090927.jpg"},{"f": "Swilken Bridge, Old Course geograph-6310525-by-Gordon-Hatton.jpg","d": "photos/xcd34b3dcc344d487.webp","by": "Gordon Hatton","lic": "CC BY-SA 2.0","page": "https://commons.wikimedia.org/wiki/File:Swilken_Bridge,_Old_Course_geograph-6310525-by-Gordon-Hatton.jpg"},{"f": "Igloos.jpg","d": "photos/x40c265a758eeffd0.webp","by": "Unknown artist, after sketches by C. F. Hall (1865)","lic": "Public domain","page": "https://commons.wikimedia.org/wiki/File:Igloos.jpg"},{"f": "Derinkuyu Underground City 9910 Nevit.jpg","d": "photos/x42ce82b97f8d75dc.webp","by": "Nevit Dilmen","lic": "CC BY-SA 3.0","page": "https://commons.wikimedia.org/wiki/File:Derinkuyu_Underground_City_9910_Nevit.jpg"},{"f": "Kowloon Walled City - 1989 Aerial.jpg","d": "photos/xc1c4c870f33db0bd.webp","by": "Ian Lambot","lic": "CC BY-SA 4.0","page": "https://commons.wikimedia.org/wiki/File:Kowloon_Walled_City_-_1989_Aerial.jpg"},{"f": "Hanging Gardens of Babylon.jpg","d": "photos/xb176c249748c17f8.webp","by": "Unknown artist (19th-century illustration)","lic": "Public domain","page": "https://commons.wikimedia.org/wiki/File:Hanging_Gardens_of_Babylon.jpg"},{"f": "Mausoleum at Halicarnassus at the Bodrum Museum of Underwater Archaeology.jpg","d": "photos/x5784e49b8e8c34ae.webp","by": "Jona Lendering","lic": "CC0","page": "https://commons.wikimedia.org/wiki/File:Mausoleum_at_Halicarnassus_at_the_Bodrum_Museum_of_Underwater_Archaeology.jpg"},{"f": "Philip Galle - Lighthouse of Alexandria (Pharos of Alexandria) - 1572.jpg","d": "photos/x1afb255f2078f087.webp","by": "Philip Galle, after Maarten van Heemskerck (1572)","lic": "Public domain","page": "https://commons.wikimedia.org/wiki/File:Philip_Galle_-_Lighthouse_of_Alexandria_(Pharos_of_Alexandria)_-_1572.jpg"},{"f": "Head of the Statue of Liberty on display in a park in Paris.jpg","d": "photos/x40246b20a392f8a8.webp","by": "Albert Fernique (1878)","lic": "Public domain","page": "https://commons.wikimedia.org/wiki/File:Head_of_the_Statue_of_Liberty_on_display_in_a_park_in_Paris.jpg"},{"f": "祖冲之铜像.jpg","d": "photos/xb9a86670d7ace1ed.webp","by": "三猎","lic": "CC BY-SA 4.0","page": "https://commons.wikimedia.org/wiki/File:%E7%A5%96%E5%86%B2%E4%B9%8B%E9%93%9C%E5%83%8F.jpg"},{"f": "Konigsberg bridges.png","d": "photos/x3eb63c95b6bf919d.webp","by": "Bogdan Giuşcă, after Merian-Erben (1652)","lic": "CC BY-SA 3.0","page": "https://commons.wikimedia.org/wiki/File:Konigsberg_bridges.png"},{"f": "Asashoryu fight Jan08.JPG","d": "photos/x882019030bc68e52.webp","by": "Eckhard Pecher","lic": "CC BY 3.0","page": "https://commons.wikimedia.org/wiki/File:Asashoryu_fight_Jan08.JPG"},{"f": "Three round, one oval, one square (16831811084).jpg","d": "photos/x587f182d63ce1460.webp","by": "Scott Edmunds","lic": "CC BY 2.0","page": "https://commons.wikimedia.org/wiki/File:Three_round,_one_oval,_one_square_(16831811084).jpg"},{"f": "Traditional Toraja House.JPG","d": "photos/x93d64187efecba5c.webp","by": "22Kartika","lic": "CC BY-SA 3.0","page": "https://commons.wikimedia.org/wiki/File:Traditional_Toraja_House.JPG"},{"f": "Ndebele Architecture.jpg","d": "photos/x059956ef64ce681b.webp","by": "Angela Abel","lic": "CC BY 4.0","page": "https://commons.wikimedia.org/wiki/File:Ndebele_Architecture.jpg"}];
/* photo pins to add, by tour and stop title: {at, label, f (library file), drop: [text pins it replaces]}.
   A pin whose label equals a text pin's label replaces that text pin. */
const P=(at,label,f,drop)=>({at,label,f,drop:drop||[]});
const PINS={
 literature:{
  "The Epic of Gilgamesh":[P([45.64,31.32],"Uruk: Gilgamesh’s city","Uruk ziggurat (2).jpg"),
   P([43.15,36.36],"Nineveh: the Flood Tablet","British Museum Flood Tablet 1.jpg",["Nineveh: the library"])],
  "Homer’s Troy and Ithaca":[P([26.24,39.96],"The walls of Troy","Walls of Troy (2).jpg",["Troy"])],
  "The Mahabharata and the Ramayana":[P([76.85,29.97],"Kurukshetra: Krishna and Arjuna","Krishna and Arjun on the chariot, Mahabharata, 18th-19th century, India.jpg",["Kurukshetra"])],
  "The Tale of Genji":[P([135.8,34.88],"Uji: the Byōdō-in","Phoenix Hall, Byodo-in, November 2016 -01.jpg",["Uji"]),
   P([136.93,35.18],"The Genji scroll, about 1130 (Nagoya)","Genji emaki azumaya.jpg")],
  "Dante’s journey":[P([12.2,44.42],"Ravenna: his tomb","Dante's tomb (Ravenna) - Facade.jpg")],
  "Shakespeare’s London":[P([-1.71,52.19],"Stratford: Shakespeare’s birthplace","Shakespeare's birthplace Stratford - upon - Avon - panoramio.jpg",["Stratford-upon-Avon"])],
  "Don Quixote’s La Mancha":[],
  "Gutenberg’s printing press":[P([8.27,50],"Mainz: the Gutenberg Bible","Gutenberg Bible, Lenox Copy, New York Public Library, 2009. Pic 01.jpg",["Mainz"])],
  "The great Russian novels":[P([30.32,59.94],"St Petersburg: Dostoevsky","Vasily Perov - Портрет Ф.М.Достоевского - Google Art Project.jpg",["St Petersburg: Crime and Punishment"]),
   P([37.52,54.07],"Yasnaya Polyana: Tolstoy’s home","RU YP TH 3.jpg")],
  "Magical realism in Colombia":[P([-74.19,10.59],"Aracataca: García Márquez’s birthplace","Casa natal de Gabriel García Márquez (SAM 5602).jpg",["Aracataca: the model for Macondo"])],
  "Things Fall Apart":[P([6.89,6.15],"Chinua Achebe, from Ogidi","Chinua Achebe - Buffalo 25Sep2008 crop.jpg",["Ogidi: Achebe’s home town"])],
  "The Nobel map":[P([31.24,30.04],"Mahfouz, 1988","Naguib Mahfouz in 1960s.jpg"),
   P([126.98,37.57],"Han Kang, 2024","Han Kang, 2024 Nobel Prize Laureate in Literature (cropped).jpg")],
  "The most translated books":[P([2.35,48.86],"The Little Prince (1943)","PikiWiki Israel 16505 \"The Little Prince\" garden in Holon.JPG"),
   P([11.26,43.77],"Pinocchio (1883)","Pinocchio.jpg"),P([-3.53,50.46],"Agatha Christie’s Torquay","Torquay harbour - geograph.org.uk - 5719656.jpg")]},
 art:{
  "The first artists":[P([119.68,-4.98],"Maros caves, Sulawesi","Leang Tedongnge rock art panel credit Basran Burhan.jpg"),P([-4.12,43.38],"Altamira","Altamira, bison.jpg")],
  "Angkor":[P([103.859,13.441],"The Bayon’s stone faces","Das Lächeln von Angkor.jpg")],
  "Gothic cathedrals":[P([2.35,48.85],"Notre-Dame de Paris","Notre-Dame de Paris, 4 October 2017.jpg"),P([6.96,50.94],"Cologne Cathedral","Kölner Dom - Westfassade 2022 ohne Gerüst-0968 b.jpg",["Cologne"])]},
 music:{
  "The didgeridoo":[P([135,-12.5],"Arnhem Land","Australia Aboriginal Culture 009.jpg")],
  "Vienna, city of music":[P([7.1,50.73],"Beethoven, born in Bonn","Joseph Karl Stieler's Beethoven mit dem Manuskript der Missa solemnis.jpg",["Bonn: Beethoven’s birthplace"])],
  "Down the Mississippi: blues and jazz":[P([-90.05,35.15],"Memphis: Beale Street","Looking East on Beale Street, Memphis, Tennessee, June 2014.jpg",["Memphis"])]},
 mythology:{
  "Mount Olympus and Delphi":[P([22.35,40.09],"Mount Olympus 2,918 m","Mytikas peak 02.jpg")],
  "Troy":[P([26.24,39.96],"Troy (Hisarlik)","Walls of Troy (2).jpg"),P([34.62,40.02],"Hattusa, the Hittite capital","Lion Gate, Hattusa 13 (cropped).jpg")],
  "The flood":[P([43.15,36.36],"Nineveh: the flood tablet","British Museum Flood Tablet 1.jpg")],
  "Mount Kailash":[P([81.31,31.07],"Mount Kailash 6,638 m","Kailash north.JPG")],
  "Loch Ness":[P([-4.44,57.32],"Urquhart Castle","Urquhart Castle Tower House 2.jpg")]},
 science:{
  "Zhang Heng’s earthquake detector":[P([112.45,34.62],"Luoyang: Zhang Heng’s detector (a model)","EastHanSeismograph.JPG",["Luoyang, the Han capital"])],
  "Galileo’s telescope":[P([11.88,45.41],"Padua: the telescope, 1609","Galileo galilei, telescopi del 1609-10 ca..JPG"),
   P([12.48,41.9],"Rome: his trial, 1633","Galileo before the Holy Office - Joseph-Nicolas Robert-Fleury, 1847.png")],
  "Humboldt on Chimborazo":[P([-78.82,-1.47],"Chimborazo 6,263 m","Humboldt-Bonpland Chimborazo.jpg")],
  "Marie Curie":[P([2.35,48.85],"Paris: her laboratory","Marie Curie c. 1920s.jpg")],
  "The eclipse that tested Einstein":[P([-40.35,-3.69],"Sobral, Brazil","Highest resolution image of the 1919 solar eclipse.tif")],
  "Mapping the ocean floor":[P([-40,71],"Greenland: Wegener’s last expedition","Wegener Expedition-1930 026 (retuschiert).jpg")],
  "CERN":[P([6.05,46.23],"CERN: the ATLAS detector","CERN Atlas Caverne.jpg")],
  "Dark skies":[P([-70.4,-24.63],"Paranal, Chile","Very Large Telescope against a beautiful twilight on Cerro Paranal.jpg")]},
 maths:{
  "Counting in sixties":[P([45.85,31.29],"Larsa: the Plimpton 322 tablet","Plimpton 322.jpg",["Larsa"])],
  "Euclid’s Alexandria":[P([29.92,31.2],"Euclid’s Elements on papyrus","P.Penn. Museum inv. E02748 Euclid's Elements 2.5.jpg")],
  "Zero travels west":[
   P([10.4,43.72],"Pisa: Fibonacci","Liber abbaci magliab f124r.jpg")],
  "The House of Wisdom":[P([44.36,33.31],"Baghdad: al-Khwarizmi’s algebra","Image-Al-Kitāb al-muḫtaṣar fī ḥisāb al-ğabr wa-l-muqābala.jpg",["Baghdad"])],
  "Mercator’s stretched map":[P([6.76,51.43],"Duisburg: Mercator’s map, 1569","Mercator 1569.png")],
  "The coastline paradox":[P([-5.71,50.07],"Land’s End","Land's End, Cornwall, England.jpg")]},
 words:{
  "Writing begins":[P([114.35,36.1],"Anyang: oracle bones, about 1200 BC","Shang Ox Bone Oracle Bone 03.jpg")],
  "Hangul: an alphabet by design":[P([126.98,37.57],"Seoul: the Hunminjeongeum, 1446","Hunminjeongum.jpg",["Seoul"])],
  "Esperanto":[P([21.01,52.23],"Warsaw: Esperanto’s first book, 1887","Unuaj Libroj por Rusoj, Poloj, Francoj kaj Germanoj - 1887.jpg"),
   P([23.16,53.13],"Białystok: Zamenhof’s home town","Zamenhof portreto.jpg")]},
 learning:{
  "Nalanda":[P([85.44,25.14],"Nalanda","Temple 3 - Sariputta Stupa - Nalanda Mahavihara (10).jpg")],
  "Al-Qarawiyyin":[P([-4.98,34.06],"Fez: al-Qarawiyyin","29610-Fez (28134041211) (qarawiyyin crop).jpg",["Fez"])],
  "Exams for an empire":[P([126.99,37.59],"Seoul: Sungkyunkwan, 1398","Myeongnyundang.jpg")],
  "The manuscripts of Timbuktu":[P([-3,16.77],"Timbuktu: the manuscripts","Timbuktu-manuscripts-astronomy-mathematics.jpg",["Timbuktu"])],
  "Cables under the sea":[P([-10.3,51.93],"Valentia Island","Ireland Valentia Island telegraph.JPG"),P([-53.37,47.88],"Heart’s Content","Heart's Content Cable Station.JPG")],
  "The internet is born":[P([-118.44,34.07],"UCLA, Los Angeles","ARPANET first router 2.jpg")]},
 festivals:{
  "Sun, Moon or both":[P([35.22,31.78],"Jerusalem","Western wall and its square, jerusalem.jpg")],
  "Ramadan and Eid":[P([106.83,-6.17],"Jakarta: the Istiqlal Mosque","Istiqlal Mosque Jakarta prayer hall interior view 04.jpg",["Jakarta"])],
  "Christmas and Easter":[P([35.2,31.7],"Bethlehem","Church of the Nativity (7703592746).jpg"),P([11.08,49.45],"Nuremberg’s Christmas market","Christkindlesmarkt nuernberg.jpg"),
   P([39.04,12.03],"Lalibela: Christmas on 7 January","Lalibela, san giorgio, esterno 24.jpg")],
  "Inti Raymi":[P([-68.67,-16.55],"Tiwanaku: the Andean new year","PUERTA DEL SOL TIWANAKU.jpg")],
  "Oktoberfest and La Tomatina":[P([11.55,48.13],"Munich: Theresienwiese","Theresienwiese Hacker-Festzelt Oktoberfest 2025.jpg"),P([-0.79,39.42],"Buñol","Tomatina 2006.jpg")],
  "Harvest moons and Thanksgiving":[P([-70.66,41.96],"Plymouth: the harvest feast of 1621","The First Thanksgiving cph.3g04961.jpg")],
  "Fire and ice in midwinter":[P([-1.15,60.15],"Lerwick, Shetland: Up Helly Aa","UpHellyAa1(AnneBurgess)30Jan1973.jpg"),P([141.35,43.06],"Sapporo Snow Festival","SapporoFestival8.JPG")]},
 sports:{
  "World Cup hosts":[P([-99.15,19.3],"Estadio Azteca","Estadio Azteca (2011-09-25).jpg")],
  "Cricket and the Commonwealth":[P([144.98,-37.82],"Melbourne Cricket Ground","Cricket World Cup Final (16351625604).jpg")],
  "Baseball’s map":[P([135.36,34.72],"Koshien Stadium","Summer Koshien 2009 Final.jpg")],
  "Sumo":[P([139.79,35.7],"Ryōgoku Kokugikan, Tokyo","Aki basho dohyō-iri on Sept. 28 2014.jpg")],
  "The Tour de France":[P([2.35,48.87],"Paris: the Champs-Élysées","Avenue des Champs-Élysées July 24, 2009 N1.jpg"),P([0.15,42.91],"Col du Tourmalet","Col tourmalet 01.jpg"),
   P([6.07,45.09],"Alpe d’Huez","Lacets AlpedHuez.jpg"),P([5.28,44.17],"Mont Ventoux","Mont Ventoux 090927.jpg")],
  "Where sports were invented":[P([-2.8,56.34],"St Andrews: golf","Swilken Bridge, Old Course geograph-6310525-by-Gordon-Hatton.jpg")]},
 houses:{
  "Snow houses":[P([-81.8,69.38],"Igloolik: ‘there is a house here’","Igloos.jpg",["Igloolik"])],
  "Living underground":[P([34.73,38.37],"Derinkuyu underground city","Derinkuyu Underground City 9910 Nevit.jpg")],
  "Steep roofs for rain and snow":[],
  "Cities of towers":[P([114.19,22.33],"Kowloon Walled City, pulled down 1993–94","Kowloon Walled City - 1989 Aerial.jpg")]},
 landmarks:{
  "The Great Wall":[P([116.39,39.92],"Forbidden City","Sunset of the Forbidden City 2006.JPG")],
  "Seven ancient wonders":[P([44.42,32.54],"Hanging Gardens","Hanging Gardens of Babylon.jpg"),P([27.42,37.04],"Mausoleum","Mausoleum at Halicarnassus at the Bodrum Museum of Underwater Archaeology.jpg"),
   P([29.89,31.21],"Lighthouse of Alexandria","Philip Galle - Lighthouse of Alexandria (Pharos of Alexandria) - 1572.jpg")],
  "The New Seven Wonders":[P([12.49,41.89],"Colosseum","Colosseum in Rome-April 2007-1- copie 2B.jpg"),P([78.04,27.17],"Taj Mahal","Taj Mahal, Agra, India edit2.jpg"),
   P([-43.21,-22.95],"Christ the Redeemer","Rio de Janeiro - Cristo Redentor 01.jpg")],
  "The Statue of Liberty":[P([2.35,48.86],"Built in Paris","Head of the Statue of Liberty on display in a park in Paris.jpg")],
  "Machu Picchu":[P([-71.97,-13.53],"Cusco","Catedral de la ciudad del Cusco.jpg")],
  "Natural wonders":[P([-112.1,36.1],"Grand Canyon","Grand Canyon Hopi Point with rainbow 2013.jpg"),P([-43.17,-22.9],"Rio’s harbour","Rio skyline and Cristo Redentor from Sugarloaf Mountain, Brazil.jpg"),
   P([146,-18],"Great Barrier Reef","Aerial View of Great Barrier Reef (Ank Kumar) 05.jpg")],
  "World Heritage":[P([-3,16.77],"Timbuktu","Djinguereber Mosque, Timbuktu.jpg")]}
};
/* card photos for stops that had none ("tour|title" → library file); only used when the stop still has no photo */
const CARD={
 "mythology|Now explore":"Great Sphinx of Giza (أبو الهول).jpg",
 "science|Now explore":"Aldrin Apollo 11.jpg",
 "maths|Zu Chongzhi and π":"祖冲之铜像.jpg",
 "maths|The bridges of Königsberg":"Konigsberg bridges.png",
 "maths|Now explore":"Feet on prime meridian greenwich observatory.jpg",
 "psychology|Now explore":"Times square nuit.jpg",
 "words|Now explore":"Street signs in Tuzla.jpg",
 "learning|Now explore":"Bodleian MS. Huntington 214 roll332 frame36.jpg",
 "sports|Sumo":"Asashoryu fight Jan08.JPG",
 "houses|The round houses of Fujian":"Three round, one oval, one square (16831811084).jpg",
 "houses|Toraja tongkonan":"Traditional Toraja House.JPG",
 "houses|Ndebele painted houses":"Ndebele Architecture.jpg"
};
/* photo pins that showed the wrong thing for the stop */
const RM={"mythology|The flood":["A cuneiform tablet"]};

/* ---------- engine ---------- */
const def=(o,k,v)=>Object.defineProperty(o,k,{configurable:true,enumerable:true,writable:true,value:v});
/* the ideas tours (geoflock-tours-ideas*.js) put back their own photo-pin list whenever its length changes; on those stops the
   new list is locked (psLock style: a getter that ignores assignments), so the shared pruning still works on it in place */
const lock=(o,k,v)=>Object.defineProperty(o,k,{configurable:true,enumerable:true,get(){return v},set(){}});
const IDEAS=new Set(["literature","art","music","mythology","science","maths","psychology","words","learning"]);
const stopOf=(id,title)=>{try{const t=PS_TOURS[id];return t&&t.steps?t.steps.find(s=>s.title===title):null}catch(e){return null}};
const strip=s=>String(s==null?"":s).replace(/​/g,"").trim();
function libIdx(f){try{return PS_PHOTO_DATA.findIndex(x=>x&&x.f===f&&x.d)}catch(e){return -1}}
function merge(){try{if(typeof gfMergeExtra==="function")gfMergeExtra();if(typeof PS_PHOTO_DATA==="undefined")return;
 const have=new Set(PS_PHOTO_DATA.map(p=>p&&p.f));GF_POLK_PHOTOS.forEach(p=>{if(!have.has(p.f))PS_PHOTO_DATA.push(p)})}catch(e){}}
try{if(window._gfExtraDone&&typeof PS_PHOTO_DATA!=="undefined")merge();else if(typeof GF_EXTRA_PHOTOS!=="undefined")GF_POLK_PHOTOS.forEach(p=>GF_EXTRA_PHOTOS.push(p))}catch(e){}

function patch(){merge();
 for(const id in PINS){const t=(typeof PS_TOURS!=="undefined")&&PS_TOURS[id];if(!t||!t.steps||t.steps._polK)continue;t.steps._polK=1;
  for(const title in PINS[id]){const s=stopOf(id,title);if(!s)continue;
   try{const add=PINS[id][title].map(o=>({at:o.at,label:o.label,col:"#d9682b",icon:"photo",_f:o.f}));
    const labs=new Set(add.map(q=>strip(q.label)));
    const rm=new Set((RM[id+"|"+title]||[]).map(strip));
    const keep=(s.phPins||[]).filter(q=>!labs.has(strip(q.label))&&!rm.has(strip(q.label))).map(q=>Object.assign({},q));
    const arr=keep.concat(add);
    /* text pins that a photo pin now stands for */
    const drop=new Set(PINS[id][title].flatMap(o=>[strip(o.label)].concat(o.drop||[])));
    const fp=a=>Array.isArray(a)?a.filter(p=>!drop.has(strip(Array.isArray(p)?p[1]:p.text))):a;
    if(Array.isArray(s.pins))def(s,"pins",fp(s.pins));if(Array.isArray(s._pins0))s._pins0=fp(s._pins0);
    if(IDEAS.has(id))lock(s,"phPins",arr);else def(s,"phPins",arr);
    s._sqPruned=-1}catch(e){console.error(e)}}}
}
function photos(){try{if(typeof PS_PHOTO==="undefined"||typeof PS_PHOTO_DATA==="undefined")return;merge();
 for(const k in CARD){const i=libIdx(CARD[k]);if(i<0||PS_PHOTO[k]!=null)continue;const [id,title]=k.split("|");const s=stopOf(id,title);let has=null;
  try{const o=ps;ps={tour:id,i:0};try{has=s&&psPhotoFor(s)}finally{ps=o}}catch(e){}if(!has)PS_PHOTO[k]=i}
 window.PS_SQ_IMG=window.PS_SQ_IMG||{};
 for(const id in PINS)for(const title in PINS[id]){const s=stopOf(id,title);if(s)reg(s)}}catch(e){console.error(e)}}
function reg(s){try{window.PS_SQ_IMG=window.PS_SQ_IMG||{};(s.phPins||[]).forEach(q=>{const f=q&&q._f;if(!f)return;const i=libIdx(f);if(i>=0){q.img=i;PS_SQ_IMG[q.label]=i}})}catch(e){}}
/* register just before a stop draws too, in case another file rebuilt the label map */
if(typeof psGo==="function"){const _g=psGo;psGo=function(i){try{if(typeof ps!=="undefined"&&ps&&PINS[ps.tour]){const S=psSteps()[i];if(S)reg(S)}}catch(e){}return _g.apply(this,arguments)}}
function run(){patch();photos()}
run();addEventListener("load",()=>setTimeout(run,1500));setTimeout(run,4000);
})();
