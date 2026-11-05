# Tour review, overnight 5–6 November 2026

All 119 guided tours (2034 cards, intro and “Now explore” cards included) were read stop by stop and run in the app with Playwright. Nothing was removed or reordered. (About 13 new book tours that other work added to the app later in the evening, bringing it to 132, were not part of this review.)

## The most important items

1. **40 stops are flagged for you to decide on** (list below, and visible in the app: an amber “⚑ Review: …” chip under the stop title, an amber ring on that stop’s dot, a ⚑ after “Stop n of m”, a “⚑ n” badge on the tour’s picture in the tour lists, and a ⚑ after a flagged stop in the card’s short stop list). Most flags are **repeats across tours** (the same story and often the same stat in two or three tours); the rest are **thin text-only definitions** in the AP Human Geography tours and a few generic list stops. All of it lives in one file, `geoflock-tourflags.js`: delete a line to drop one flag, or delete the file and its `<script>` tag to drop them all.
2. **Four overview tours are hidden but still in the code.** Empires & independence (`hempires`), Modern history (`hmodern`), the History tour (`timeline`) and Music & sport (`musicsport`) are not in PS_TOUR_ORDER and have no card anywhere, so nobody can open them; they overlap heavily with the detailed history, Music and Sports tours. I did not flag their stops. If they are retired for good, they could be deleted. The “Geography” best-surprises sampler is live and repeats Elevation, Seas, Plates, Lakes, Animals and Climate stops word for word by design (left alone, not flagged).
3. **Fixed:** seven stops whose text promised a tool that was not there (five “move along the chart” stops without a chart, a missing ruler, a missing “drag the US over it” outline); the GDP tour’s “Count the lights” stop never switched to the Earth-at-night map although its text says it has; a refugee figure that had gone out of date; a country label sitting in the wrong country; two photo pins that showed the empty “photo coming” box (details below).
4. **Added:** thermometers on five temperature stops that compare places. (The one stop that showed nothing on the map, Antarctica “Bigger than Europe”, got true-size Europe and Australia outlines from another change tonight, so I dropped my own Australia outline there.)
5. The content is in very good shape overall: up to date to October 2026, with few factual problems found. The weak spots are repetition across tours, not errors.

## Fixes made (all in files that load late, so they win over the original definitions)

| Tour · stop | Problem | Fix | File |
|---|---|---|---|
| AP 2c “Why people move” · Forced to move | Stat said “Over 120 million people have been forced from their homes”; UNHCR’s count fell to about 117 million by mid-2025, and the Conflicts tour already says 118 million at the end of 2025 | Stat now: “About 118 million people had been forced from their homes by the end of 2025” | geoflock-review-dedupe.js (new section at the end) |
| AP 4c “Empires, power and unions” · Shatterbelts | The “Vietnam” label was at 106°E 16°N, which is inside Laos | Moved to 108.3°E 14.6°N (central Vietnam) | geoflock-review-dedupe.js |
| Elevation · The lowest land on Earth; South America · Living high in the Andes and The Amazon basin; Antarctica history · Reading the ice; Natural hazards · Tornado Alley | The text says “Move along the chart”, but these five stops had no chart (checked in the app: no cross-section in the card) | Gave each the card cross-section the other stops use (xsec, geoflock-tourxs.js): coast → Jerusalem → Dead Sea; Pacific → Aconcagua → Mendoza → pampas; up the Amazon from its mouth past Manaus and Iquitos to the Andes; coast → Dome C → Vostok on the ice sheet; Gulf coast → Oklahoma → the Canadian prairies | geoflock-review-dedupe.js |
| Asia history · The emperor’s clay army | Text: “about 1,800 km in a straight line (ruler)”, but no ruler | Ruler from Shanhaiguan to Jiayuguan | geoflock-review-dedupe.js |
| Africa · The Sahara is mostly rock | Text: “drag the US over it to compare”, but there was nothing to drag | True-size outline of the United States laid on the Sahara (draggable) | geoflock-review-dedupe.js |
| Maths · Mercator’s stretched map | Photo pin “Duisburg: Mercator’s map, 1569” pointed at a file that was not in the photo library, so it showed the empty “photo coming” box | Added Mercator’s 1569 world map (Wikimedia Commons, public domain) as photos/xa33c90dd32d5000a.webp and to the library | geoflock-review-photos2.js |
| GDP · Count the lights, not the figures | The stop asks for the Earth-at-night map (mode "night") and its text says “the map has switched to the Earth at night”, but the GDP tour had no per-stop map switching (stopModes), so the Economy map stayed on (seen in the automated run) | Switched per-stop maps on for the GDP tour (stopModes, with “night” added to alsoOn, as the Energy tour does); the next stop goes back to the Economy map | geoflock-review-dedupe.js |
| International relations · Politics of the world (intro) | Photo pin “South Sudan: Cattle at a camp near Imehejek” had no picture (the photo existed only in the flags wall’s own list) | Added that Commons photo (Diego Delso, CC BY-SA 4.0) to the tour photo library and linked the pin | geoflock-review-photos2.js |

Version bumps in index.html: geoflock-review-dedupe.js v1→v2, geoflock-review-photos2.js v9→v10, geoflock-tourthermo.js v1→v2, and the new `<script src="geoflock-tourflags.js?v=3">` right before geoflock-signin.js.

## Additions made

| Tour · stop | Addition |
|---|---|
| Climate · Same line, different worlds | Thermometers at Cairo, New Orleans and Shanghai (geoflock-tourthermo.js) |
| Houses · Snow houses | Thermometer at Igloolik |
| Houses · Towers that catch the wind | Thermometer at Yazd |
| Deserts · Hotter than an oven floor | Thermometers in the Lut Desert and at Kerman |
| Weather · Warm winds off the mountains | Thermometers at Loma and Great Falls, Montana (the chinook stop) |

## Flagged stops (for you to decide)

Stop numbers are as the card shows them (“Stop n of m”) on the evening of 5 November; other work on the tours tonight may shift a few of them, so the titles are what count (the flags match by title).

- **Asia** (`asia`, 16 stops)
  - Stop 1 “Most people”: Generic ranking that repeats Population stop 1
  - Stop 14 “The two giants’ neighbours”: Repeats Borders stop 2 (China and Russia, 14 neighbours each); little new on the map
- **Africa** (`africa`, 20 stops)
  - Stop 3 “Most people”: Generic top-5 list; the Nigeria fact is already in Population stop 11
- **North America** (`namerica`, 17 stops)
  - Stop 3 “The longest border”: Repeats Borders stop 1 (Canada–US, the longest border)
- **South America** (`samerica`, 18 stops)
  - Stop 17 “Europe in South America”: Repeats Borders stop 16 (France–Brazil border)
- **Oceania** (`oceania`, 16 stops)
  - Stop 9 “The biggest blast in a century”: Repeats Volcanoes stop 10 (Hunga Tonga 2022, same 57 km stat)
  - Stop 16 “Big ocean states”: Overlaps Islands stop 13 (Kiribati’s tiny land and huge sea zone)
- **Antarctica** (`antarctica`, 16 stops)
  - Stop 8 “Hidden under the ice”: Overlaps Lakes stop 16 (Lake Vostok under the ice)
  - Stop 9 “The moving South Pole”: Repeats Time zones stop 17 (every time zone meets at the Pole); the moving marker is the only new fact
- **Asia history** (`hasia`, 16 stops)
  - Stop 6 “Angkor”: Repeats Landmarks stop 6 (Angkor Wat, same stat)
- **South America history** (`hsamerica`, 17 stops)
  - Stop 15 “Brasília”: Repeats Capital cities stop 7 (Brasília); also in AP tour 2a
- **Landmarks** (`landmarks`, 15 stops)
  - Stop 9 “An island only twice a day”: Repeats Islands stop 7 (Mont-Saint-Michel’s tides); only one pin on the map
- **Cities** (`cities`, 14 stops)
  - Stop 4 “The fall line”: Third fall-line stop (also North America 7 and AP tour 6a stop 1)
  - Stop 6 “Money cities”: Generic fact (New York and London lead); overlaps AP tour 6a stop 8 (world cities)
  - Stop 13 “Africa’s booming cities”: Generic; five photos but no growth figures or data on the map
- **Religions** (`langrel`, 18 stops)
  - Stop 15 “Holy cities”: Generic list of holy places; short text, little on the map
- **Earth from space** (`space`, 17 stops)
  - Stop 4 “A sea that shrank”: Repeats Lakes stop 6 (the Aral Sea); also AP tour 5d stop 4
- **Thinking geographically** (`hg1`, 12 stops)
  - Stop 6 “A coastline in the votes”: Repeats Population stop 8 (Alabama’s chalk-belt vote)
- **Cultural diffusion** (`hg3a`, 11 stops)
  - Stop 10 “A shrinking world”: Repeats AP tour 1 stop 11 (time–space compression)
  - Stop 11 “Global culture, local culture”: Text only: generic definition, nothing specific on the map
- **Cultural landscapes** (`hg3b`, 11 stops)
  - Stop 3 “Two ways of judging”: Abstract definition (ethnocentrism vs relativism); the pins don’t show the idea
- **Religion and language** (`hg3c`, 11 stops)
  - Stop 10 “Acculturation and assimilation”: Text only: definition with one photo, nothing on the map
- **Farming and environment** (`hg5d`, 11 stops)
  - Stop 9 “Organic and local food”: Generic definition with one photo, nothing on the map
  - Stop 10 “Food deserts”: Generic definition; one pin, no data shown
- **Suburbs and sustainability** (`hg6c`, 11 stops)
  - Stop 7 “Smart growth”: Thin: one photo and a one-line definition
  - Stop 10 “New urbanism”: Overlaps stop 7 (smart growth); one photo only
- **Urban challenges** (`hg6d`, 12 stops)
  - Stop 7 “Squatter settlements”: Overlaps stop 6 (informal settlements) and stop 8 (disamenity zones)
  - Stop 9 “Zones of abandonment”: Very short definition with one photo
- **Island life** (`islandlife`, 16 stops)
  - Stop 9 “Krakatoa starts again”: Stat repeats Hazards stop 9 (Krakatoa heard 4,800 km away); the regrowth story is only in the body
  - Stop 14 “Islands in the sky”: Stat repeats South America stop 12 (Angel Falls, 979 m); only the tepui-as-island idea is new
- **Gunpowder and sea** (`hgunpowder`, 15 stops)
  - Stop 4 “1492”: Repeats Explorers stop 4 (Columbus, 1492); the next stop covers the Columbian exchange
- **Revolutions and industry** (`hrevolutions`, 15 stops)
  - Stop 9 “The law of bird droppings”: Repeats Energy & resources stop 14 (the Guano Islands Act)
- **Weather and winds** (`weather`, 16 stops)
  - Stop 2 “The Sahara feeds the Amazon”: Repeats Space stop 9 (Bodélé dust feeds the Amazon)
- **Coasts** (`coasts`, 16 stops)
  - Stop 9 “A coast built by animals”: Repeats Oceania stop 6 (Great Barrier Reef, about 2,300 km)
- **Deserts** (`deserts`, 16 stops)
  - Stop 12 “The great salt flat”: Third Salar de Uyuni stop (also South America 13 and Space 14)
- **Ice** (`ice`, 16 stops)
  - Stop 16 “Ice that remembers”: Repeats History of Antarctica stop 14 (the 1.2-million-year ice core)
- **The world since 1991** (`hsince91`, 17 stops)
  - Stop 16 “The Darién Gap”: Repeats AP tour 2c stop 3 (the Darién Gap, half a million in 2023)
- **Animal migration** (`amigration`, 15 stops)
  - Stop 11 “Red crabs march to the sea”: Repeats Island life stop 3 (Christmas Island red crabs)
- **Words on the map** (`words`, 14 stops)
  - Stop 10 “Hangul: an alphabet by design”: Repeats History of Asia stop 7 (Hangul, King Sejong, 1443)
- **Learning** (`learning`, 13 stops)
  - Stop 9 “Cables under the sea”: Off-topic for learning, and repeats Geopolitics stop 19 (seabed cables)

## Automated checks

Scripts and raw results are in the session scratchpad (`review/`); they are throwaway.

**In the app, stop by stop (Playwright, Chromium, 1400×900, flat map, every reachable tour):** 1,947 of 2,031 cards opened one after another; the rest are the 4 hidden tours (68 cards) and Map projections (18 cards, its own engine).

| Check | Result |
|---|---|
| Page errors (uncaught exceptions) while opening each stop | **0** |
| Console errors | **0** from the tours (the only one is the World Bank population fetch, blocked by CORS on localhost, at page load) |
| HTTP errors / failed requests (photos, map tiles, data) | **0** |
| Card photos | 1,674 shown, none broken |
| Photo pins | 2,736 shown, every one with its picture (2 were empty before tonight’s fixes) |
| Text overflowing its box (title, stat, body, header) | **0** |
| Card running off the bottom of the window | **0** (1,906 cards scroll inside the card, as designed) |
| Stop’s map not the one it asks for | **1**: GDP “Count the lights” stayed on the Economy map (fixed) |

**From the tour data (every tour, every stop):**

| Check | Result |
|---|---|
| Map modes and layer names (S.mode, S.on, T.map) | all exist (short layer names such as “grid”, “plates”, “currents” go through gfTourToggleInput) |
| Per-stop maps a tour cannot switch to (S.mode without stopModes) | 1 (GDP, fixed) |
| Empty title, stat or body | none |
| Coordinates out of range or lat/lon swapped | none (Auckland at −185° in Migration 18 is deliberate, for a map across the date line) |
| Pins whose label names a country but that sit in another | 1: AP 4c “Vietnam” in Laos (fixed); the others are deliberate (Ceuta, Melilla, Büsingen, Versailles for “Germany proclaimed here”, and so on) |
| Pins named after a city or land feature but far out at sea | none (all sea pins are seas, routes, islands or deliberate label spots) |
| Photo files referenced by any card or photo pin missing on disk | none |
| Text that promises a tool the stop does not have (“move along the chart”, “(ruler)”, “drag X over it”, “the slider”) | 9 found: 7 fixed, 2 left for you (see below) |
| Duplicate stop titles | only “Now explore” (by design) and cross-tour repeats (see the flags and the list below) |


## Per tour

One line each: what was found, fixed, added or flagged, and the best addition still to do.

- **Population** (`pop`, 18 stops): Strong; every stop has a line, highlight or circle on the density map. *Next:* True-size ghost of Bangladesh dropped on Iowa (stop 5 compares them); City Lights side-by-side for “Egypt is the Nile”.
- **Geography** (`geo`, 16 stops): The “best surprises” sampler; by design it repeats stops from Elevation, Seas, Plates, Lakes, Animals and Climate word for word (the earlier de-duplication pass left it alone, so it is not flagged). *Next:* Ruler from Miami due south on “South America is east of North America”; sea-level slider on “A planet of water”.
- **GDP** (`gdp`, 15 stops): Strong. Fixed: stop 7 (“Count the lights”) now really switches to the Earth at night, as its text says. *Next:* A year slider (1990→2025) for “China’s rise”, like the growth slider on “Poorer than Ghana”.
- **Elevation** (`elev`, 16 stops): Strong; cross-sections, height slider and sea-level slider are well used. *Next:* A sea-level slider at +1 m on “Countries that could disappear” (Maldives, Tuvalu).
- **Climate** (`climate`, 19 stops): Strong. Coriolis and CO₂ stops are simulations (no map pins by design). Added thermometers for Cairo, New Orleans and Shanghai on “Same line, different worlds”. *Next:* Day & Night (season) on “Why we have seasons” is there; a rain-shadow cross-section on “The driest place” would help.
- **Rivers** (`rivers`, 19 stops): Strong. *Next:* Walkers (floating boat) along the Nile for “The Nile’s slow fall”; cross-section along the Niger for “Running from the sea”.
- **Lakes** (`lakes`, 16 stops): Strong. *Next:* Sea-level/lake-level slider for the Aral Sea (1960 → today) would be the best new simulation.
- **Seas & oceans** (`seas`, 18 stops): Strong; tides stop is a simulation. *Next:* Walkers along the shipping lanes on “The busiest gateways”.
- **Borders** (`borders`, 19 stops): Strong; History-map years used well.
- **Islands** (`islands`, 15 stops): Good. Stops 4, 7 and 14 are zoomed photo stops with only a photo pin; fine, but a border line across Saint Martin (stop 14) would add a lot. *Next:* Magnifier inset for Saint Martin and for Pheasant Island style tiny places.
- **Europe** (`europe`, 16 stops): Strong.
- **Asia** (`asia`, 16 stops): Two weak stops flagged: stop 1 (generic ranking) and stop 14 (repeats Borders 2). *Next:* Cross-section across the Himalaya to the Tibetan Plateau on “Asia’s water tower”.
- **Africa** (`africa`, 20 stops): Long tour (22 stops); stop 3 (“Most people”) flagged as a generic list. *Next:* Cross-section from the coast up onto the plateau for the river stops.
- **North America** (`namerica`, 17 stops): Stop 3 (longest border) flagged: it repeats Borders 1. *Next:* Cross-section on the fall line (stop 7).
- **South America** (`samerica`, 18 stops): Stop 17 (French Guiana) flagged: repeats Borders 16. *Next:* Walkers along the Inca road would suit stop 8; a cross-section across the Andes for stop 4 (its text says “move along the chart”: check it shows).
- **Oceania** (`oceania`, 16 stops): Stops 9 (Tonga, repeats Volcanoes 10) and 16 (Kiribati, overlaps Islands 13) flagged. *Next:* Walkers (canoes) on “The Polynesian triangle”.
- **Antarctica** (`antarctica`, 16 stops): “Bigger than Europe” now has draggable true-size Europe and Australia outlines (added by another change tonight). Stops 8 and 9 flagged as repeats. *Next:* Day & Night for the four-month polar night; sea-level slider for “Most of the world’s fresh water” (58 m).
- **Time zones** (`time`, 17 stops): Strong; Day & Night used throughout.
- **Plate tectonics** (`plates`, 18 stops): Strong; Inside the Earth, rock cycle and volcano stops are simulations. *Next:* Continental drift slider (the Humans tour has one) on “The continents fit together” and “The next supercontinent”.
- **Ancient civilisations** (`hancient`, 17 stops): Strong.
- **Empires & independence** (`hempires`, 15 stops): Hidden: not in the tour order and no card, so not reachable. Not flagged.
- **Modern history** (`hmodern`, 15 stops): Hidden: not in the tour order and no card, so not reachable. Not flagged.
- **Europe history** (`heurope`, 17 stops): Strong.
- **Asia history** (`hasia`, 16 stops): Stop 6 (Angkor) flagged: same stat as Landmarks 6.
- **Africa history** (`hafrica`, 18 stops): Strong.
- **North America history** (`hnamerica`, 17 stops): Strong.
- **South America history** (`hsamerica`, 17 stops): Stop 15 (Brasília) flagged: repeats Capital cities 7.
- **Oceania history** (`hoceania`, 18 stops): Strong. *Next:* Walkers (canoes) along the Lapita route on stop 3.
- **Antarctica history** (`hantarctica`, 16 stops): Good; several stops are a photo plus one pin. *Next:* Walkers along Amundsen’s and Scott’s routes on “Race to the Pole”, and Mawson’s 160 km walk (stop 9 has only a photo).
- **Food** (`food`, 17 stops): Strong.
- **Landmarks** (`landmarks`, 15 stops): Stop 9 (Mont-Saint-Michel) flagged: repeats Islands 7. *Next:* Magnifier inset (like the Richat one) for Petra’s Siq and Lalibela.
- **Music & sport** (`musicsport`, 15 stops): Hidden: not in the tour order and no card, so not reachable. Not flagged; stops 6, 7 and 13 are near-copies of Sports 3 and Music 16 and 8. *Next:* Delete if retired.
- **Explorers** (`explorers`, 18 stops): Strong; good routes. *Next:* Walkers along Magellan’s and Ibn Battuta’s routes.
- **Natural hazards** (`hazards`, 17 stops): Strong; hurricane and epicentre stops are simulations.
- **Energy & resources** (`resources`, 16 stops): Strong.
- **Migration** (`migration`, 18 stops): Strong.
- **Inventions** (`inventions`, 14 stops): Strong.
- **Environment** (`environment`, 18 stops): Strong. *Next:* Sea-level slider (+1 m) on the Tuvalu stop.
- **Transport & trade** (`transport`, 16 stops): Strong. *Next:* Walkers (container ship) round Africa vs Suez on stop 3.
- **Animals** (`animals`, 15 stops): Strong. *Next:* Walkers (like the red crabs) circling the wildebeest loop on “Great journeys” and in Animal migration 1.
- **International relations** (`politics`, 15 stops): Strong; clubs map used well. Fixed the missing photo on the intro’s South Sudan photo pin.
- **Languages** (`culture`, 15 stops): Strong.
- **Flags** (`flags`, 19 stops): Fine; mostly highlight-only by nature.
- **Cities** (`cities`, 14 stops): Three stops flagged: 4 (third fall-line stop), 6 and 13 (generic). *Next:* City Lights for “The biggest cities”.
- **Map projections** (`projections`, 16 stops): Strong. Runs on its own projection engine and card, so the flags, the stop dots and my automated stop-by-stop run do not apply to it; the “Opening Map projections…” loading chip stays in the page (not visible on the Projections map) because the usual tour engine never reports the tour as open.
- **Religions** (`langrel`, 18 stops): Stop 15 (Holy cities) flagged as generic.
- **Politics** (`govmap`, 15 stops): Strong.
- **History tour** (`timeline`, 15 stops): Hidden: not in the tour order and no card, so not reachable. Not flagged.
- **Earth at night** (`night`, 15 stops): Strong. *Next:* City Lights before/after for “The lights went out in Syria” (2011 vs 2015) would make the point visually.
- **Earth from space** (`space`, 17 stops): Stop 4 (Aral Sea) flagged: repeats Lakes 6. *Next:* Magnifier insets (like the Richat one) for Almería’s greenhouses and the Okavango delta.
- **Geopolitics** (`geopol`, 19 stops): Strong and very current (2026 events).
- **Thinking geographically** (`hg1`, 12 stops): Stop 6 flagged: repeats Population 8 (Alabama vote).
- **Data and regions** (`hg1b`, 12 stops): Short definitional stops by design (AP); none flagged.
- **Where people live** (`hg2a`, 11 stops): Fine.
- **Population models** (`hg2b`, 11 stops): Fine; diagrams used.
- **Policies and ageing** (`hg2d`, 12 stops): Fine.
- **Migration** (`hg2c`, 12 stops): Fixed the refugee figure on “Forced to move” (over 120 million → about 118 million, end 2025).
- **Cultural diffusion** (`hg3a`, 11 stops): Stops 10 and 11 flagged (repeat of time–space compression; text-only).
- **Cultural landscapes** (`hg3b`, 11 stops): Stop 3 flagged (abstract, nothing on the map).
- **Religion and language** (`hg3c`, 11 stops): Stop 10 flagged (text-only definition).
- **States and boundaries** (`hg4a`, 12 stops): Fine.
- **Forces in states** (`hg4b`, 13 stops): Fine.
- **Empires and unions** (`hg4c`, 11 stops): Fixed the “Vietnam” label on Shatterbelts (it sat in Laos).
- **Borders and districts** (`hg4d`, 11 stops): Fine.
- **Farming systems** (`hg5a`, 12 stops): Fine.
- **Rural land models** (`hg5b`, 11 stops): Fine; diagrams used.
- **Global food system** (`hg5c`, 11 stops): Fine.
- **Farming and environment** (`hg5d`, 11 stops): Stops 9 and 10 flagged (generic definitions).
- **Cities and urbanisation** (`hg6a`, 11 stops): Fine.
- **Urban models** (`hg6b`, 10 stops): Fine; city-model diagrams used.
- **Suburbs and sustainability** (`hg6c`, 11 stops): Stops 7 and 10 flagged (thin, overlapping definitions).
- **Urban challenges** (`hg6d`, 12 stops): Stops 7 and 9 flagged (overlap / very short).
- **Measuring development** (`hg7a`, 12 stops): Fine.
- **Industry** (`hg7b`, 12 stops): Fine.
- **Trade** (`hg7c`, 12 stops): Fine.
- **Sustainability** (`hg7d`, 10 stops): Fine.
- **People** (`people`, 17 stops): Strong.
- **Human origins** (`humans`, 18 stops): Strong; drift slider and sea-level slider used.
- **Island life** (`islandlife`, 16 stops): Stops 9 and 14 flagged: their stats repeat Hazards 9 and South America 12.
- **Special regions** (`regions`, 17 stops): Strong.
- **Medieval empires** (`hmedieval`, 16 stops): Strong.
- **Gunpowder and sea** (`hgunpowder`, 15 stops): Stop 4 (1492) flagged: repeats Explorers 4.
- **Revolutions and industry** (`hrevolutions`, 15 stops): Stop 9 (guano law) flagged: repeats Energy & resources 14.
- **Mountain ranges** (`ranges`, 16 stops): Strong.
- **Volcanoes** (`volcanoes`, 16 stops): Strong.
- **Caves** (`caves`, 16 stops): Strong.
- **Weather and winds** (`weather`, 16 stops): Stop 2 flagged (repeats Space 9). Added thermometers on the chinook stop (Loma and Great Falls, Montana).
- **Coasts** (`coasts`, 16 stops): Stop 9 (Great Barrier Reef) flagged: repeats Oceania 6. *Next:* A coastline-ruler simulation (measure with shorter and shorter rulers) for “The longest coastline”.
- **Deserts** (`deserts`, 16 stops): Stop 12 (Salar de Uyuni) flagged: third copy. Added thermometers on “Hotter than an oven floor” (Lut Desert, Kerman).
- **Ice** (`ice`, 16 stops): Stop 16 flagged: repeats History of Antarctica 14. *Next:* A year slider for Arctic sea ice (1980 against today) on “The frozen ocean”.
- **The World Wars** (`hwars`, 17 stops): Strong. *Next:* Walkers along the D-Day crossing and the Burma Road.
- **Cold War & end of empires** (`hcoldwar`, 17 stops): Strong. Stop 5 (Partition of India) is a near copy of Empires 13, but that tour is hidden, so it is not flagged.
- **The world since 1991** (`hsince91`, 17 stops): Stop 16 (Darién Gap) flagged: repeats AP 2c stop 3.
- **Art and architecture** (`art`, 16 stops): Strong.
- **Music** (`music`, 16 stops): Strong.
- **Literature** (`literature`, 15 stops): Strong. *Next:* Walkers along Odysseus’s route (stop 2 has 10 pins) and Bashō’s narrow road.
- **Philosophy** (`philosophy`, 16 stops): Strong.
- **Sports** (`sports`, 17 stops): Strong.
- **Festivals** (`festivals`, 17 stops): Strong; Day & Night used for Nowruz and Inti Raymi.
- **Houses** (`houses`, 16 stops): Strong. Added thermometers on “Snow houses” (Igloolik) and “Towers that catch the wind” (Yazd).
- **Prisoners of Geography** (`bprisoners`, 14 stops): Strong.
- **Guns, Germs, and Steel** (`bggs`, 12 stops): Strong.
- **Why Nations Fail** (`bnations`, 12 stops): Strong.
- **Collapse** (`bcollapse`, 13 stops): Strong.
- **Biomes** (`biomes`, 14 stops): Strong.
- **Forests** (`forests`, 14 stops): Strong.
- **Ocean life** (`ocean`, 15 stops): Strong.
- **Animal migration** (`amigration`, 15 stops): Stop 11 (red crabs) flagged: repeats Island life 3.
- **Where food comes from** (`crops`, 15 stops): Strong.
- **Capital cities** (`capitals`, 15 stops): Strong.
- **Energy of the world** (`energy`, 15 stops): Strong.
- **Money on the map** (`currencies`, 15 stops): Strong.
- **Conflicts and peace** (`conflicts`, 15 stops): Strong.
- **Mythology** (`mythology`, 16 stops): Strong.
- **Science** (`science`, 16 stops): Strong.
- **Maths** (`maths`, 16 stops): Fixed the missing photo on “Mercator’s stretched map” (Mercator’s 1569 map, public domain).
- **Psychology** (`psychology`, 14 stops): Fine; the map link is thin on several stops by nature (studies).
- **Words on the map** (`words`, 14 stops): Stop 10 (Hangul) flagged: repeats History of Asia 7.
- **Learning** (`learning`, 13 stops): Stop 9 (undersea cables) flagged: off-topic and repeats Geopolitics 19.

## Best additions still to do (simulations and interactive elements)

Ordered by how much they would add. All use tools that already exist in the app; none were built tonight because each needs new data or a hand-placed route.

1. **Aral Sea shoreline slider** (Lakes 6, Space 4, AP 5d 4): a year slider from 1960 to today that shrinks the lake, like the sea-level slider. The single most striking “change over time” story in the tours.
2. **Walkers along routes** (the crab and early-human walkers in geoflock-walkers.js): canoes on the Polynesian triangle (Oceania 8, Oceania history 3), Amundsen vs Scott on Antarctica history 6, Magellan and Ibn Battuta (Explorers 7 and 10), Odysseus (Literature 2), container ships round Africa vs through Suez (Transport 3).
3. **Continental drift slider** from Human origins (“Australia sails away”) reused on Plate tectonics 12 (“The continents fit together”) and 18 (“The next supercontinent”).
4. **True-size ghosts** where a stop compares areas in words: Bangladesh over Iowa (Population 5), Greater Tokyo vs Montenegro already done; Mongolia vs France/Germany/Italy/UK (Population 15), Texas over Europe’s biggest countries (Europe 2), Central America vs Texas (North America 13).
5. **Sea-level slider at +1 m** on the low-island stops (Elevation 12 Maldives/Tuvalu, Environment 10 Tuvalu, Oceania 14).
6. **Magnifier insets** (geoflock-eyezoom.js, now only on the Richat Structure) for places too small for the tour map: Saint Martin’s border (Islands 14), Baarle (Borders 13), Petra’s Siq (Landmarks 4), Pheasant Island (Borders 15).
7. **Cross-sections** where the text describes a profile: the fall line (North America 7), the Himalaya to the Tibetan Plateau (Asia 4), the Atacama rain shadow (Climate 12).
8. **City Lights side by side** for density stops (Population “Egypt is the Nile”, “Canada hugs the border”; Cities “The biggest cities”).
9. **Day & Night** for the polar night (Antarctica 3, Islands of the midnight sun is already done in Europe 16).

## Repeats across tours that were not flagged

These overlap in subject but each tour has its own angle, or the earlier de-duplication pass deliberately kept both:

- Geography sampler ↔ Elevation 1 and 3, Seas 1 and 18, Plates 11, Lakes 3, Animals 3, Climate 17 (identical text; left alone by policy).
- Hidden overview tours ↔ detailed tours: Modern history 14/15 ↔ Since 1991 7/17; Timeline 5 ↔ Medieval 16; Empires 1, 5, 13 ↔ Medieval 2, Gunpowder 6, Cold War 5. Also Asia history 5 ↔ Religions 2.
- Africa history 1 ↔ Human origins 15 (oldest Homo sapiens, Jebel Irhoud); Asia 4 ↔ Ice 5 (the Third Pole); Climate 11 ↔ Asia 5 ↔ Weather 4 (the monsoon); Lakes 15 ↔ North America 2 (Canada’s lakes); Elevation 14 ↔ Space 15 (Mid-Atlantic Ridge); Seas 8 ↔ Ocean life 1 (coral reefs); Food 2 ↔ Gunpowder 5 (Columbian exchange); Empires 8 ↔ Gunpowder 11 ↔ South America history 8 (sugar and slavery).
- Music & sport (hidden) 2, 6, 7, 9, 12, 13 ↔ Sports 2, 3, 8 and Music 8, 10, 16.

## Text that promises something not on the map (not fixed)

- Europe 2 “The biggest countries”: “Texas … is bigger still: drag it over Europe to compare”, but there is no Texas outline (the true-size ghosts take countries, not US states). Either add a Texas shape or drop the “drag it” clause.
- Geography 15 “Wider than the Moon”: “drag it over Australia on the globe to compare”, but no Moon outline appeared in my run (the Geography tour was left alone).
- Every other “drag the ruler”, “move along the chart”, “the slider” and “drag X over Y” in the tours was checked against the stop’s data or in the app.

## Other observations

- On Elevation 6 the Toolkit’s Cross-section panel (“Pick a ready-made line…”) was open over the lower half of the tour card in my run, hiding the Back/Next buttons. It may come from the cross-section work going on tonight; worth a look once that settles.
- A few stops changed title or order while I worked (other work on the tours tonight, e.g. Languages and Religions). The flags match by title, so a renamed stop simply loses its flag.

## Figures that disagree between tours (worth one look)

- Canada’s 2023 fires: “over 15 million hectares” (Forests 2) vs “about 17 million hectares” (Natural hazards 13). Both appear in official sources (15 Mha in the October 2023 government report, about 17–18 Mha in the final count); one figure everywhere would be cleaner.
- People forced from their homes: now 118 million in both the Conflicts tour and AP 2c (fixed tonight).

## Not checked / limits

- Facts about events after mid-2026 (for example the 2026 Nobel Prize in Literature, the Strait of Hormuz closure, the Darién figures for 2025) were left as written: I could not confirm them either way.
- The new book-tour files in the folder that are not yet loaded by index.html (geoflock-tours-bflat.js, -bplagues.js, -brihla.js, -bspiky.js) and the hug files were not reviewed (others are working on them).
- The automated run used the flat map in a 1400×900 window; phone-width overflow was not checked stop by stop.
