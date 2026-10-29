# Currency pictures: spec

The Currency cards (Study & Quiz › Other › Currency, and the currency quiz) should read as a catalogue, not a collage.

## 1. Media

- Every country gets a **real image** from Wikimedia Commons under a free licence (PD, CC0, CC BY, CC BY-SA; never
  NC, ND or fair use). Author, licence and Commons page are recorded in `drillimg/index.json` → `credit`.
- **Default:** the **front of a common banknote of the current series**, horizontal. Vertical-format notes are
  turned to landscape.
- **Euro countries:** that country's **national side of a euro coin** (1 € or 2 €), so each one has its own picture.
  Monaco, San Marino, Vatican City and Andorra included. Coins are used for nothing else.
- **Shared currencies** show the shared note (the repetition is true): BCEAO note for the West African CFA franc,
  BEAC note for the Central African CFA franc, the Eastern Caribbean dollar, a current US note for dollarised
  countries (Ecuador, El Salvador, Panama, Timor-Leste, Marshall Islands, Micronesia, Palau), the Australian dollar
  (Kiribati, Nauru, Tuvalu), the Swiss franc (Liechtenstein), the Israeli shekel (Palestine).
- Current series only. Nothing historic.

## 2. Preprocessing (`tools/currency_media.py`)

`tools/currency_sources.json` lists every picture (Commons file, kind, countries, credit, optional crop/rotate).
The script fetches a 960 px thumbnail (a standard Wikimedia size) (gently: one request per 5 s, back-off on 429), trims borders and plain
background, turns portrait notes to landscape, and fits the result **without cropping or stretching**, centred, into an
**800×400 transparent** box (notes fill it less a 2 % margin; coins are cut out round at **82 % of the height**).
Output: `drillimg/cur/<key>.webp` (quality 82), one file per country or one per shared currency (`xof`, `xaf`, `xcd`,
`usd`, `aud`, `chf`, `ils`), and the matching `by[cc].cur` / `credit` entries. Re-run it after any change.

## 3. Frame (`geoflock-drillmedia.js`)

- A 2:1 box with one neutral tray colour (`#eceff3`; dark mode `#222b38`). No blurred backdrop for currency (other
  photo drills keep theirs).
- Image `object-fit: contain`, `filter: drop-shadow(0 2px 6px rgb(0 0 0 / .15))`.

## 4. Labels

- One format everywhere (grid caption, answer line, hint): **name · ISO 4217 code · sign**, e.g.
  `Cuban peso · CUP · $`. The sign is left out when it equals the code (`Swiss franc · CHF`). Made by
  `gfCurLabel()` in `geoflock-drills.js`.
- Both CFA francs use `FCFA`; the Comorian franc is `CF`. The currency card has no caption of its own (the label sits
  beside it), so nothing is named twice.

## 5. Affordance

- Every currency card has the ⓘ; its tooltip gives the label, what the picture shows, for shared currencies the issuer
  ("Shared currency, issued by the ECB / BCEAO / BEAC / ECCB …"), and author and licence.
- Flags beside the cards sit in one 30×20 box with a 1 px hairline border, so light flags (Cyprus, Japan) keep their edge.

## 6. Clue mode

"Which country uses the …?" must not show a real note (it names its country). There, and only there, a stand-in is
drawn: one neutral design (single colour, the currency's sign, nothing else).

## 7. Validation (`tools/check_currency_media.py`)

Flags any country with: no image; an image outside `drillimg/cur/`; not 800×400, not transparent, not centred, a
coin not at ~82 % height or a note not filling the box; a euro country without its coin (or a coin anywhere else);
no author, no Commons page, or a licence that is missing or not free; label fields without an ISO code or sign.
Entries with an `exception` in `currency_sources.json` are listed below and reported separately.

## Exceptions

Checked against Wikimedia Commons in October 2026 (only PD / CC0 / CC BY / CC BY-SA files that Commons itself hosts). Commons search and the API were unavailable from this machine (rate-limited), so "none found" means none in the country's Commons banknote/coin categories or on the English Wikipedia article for the currency. Candidates that were found but could not be fetched and looked at before the rate limit closed in are kept under `_pending` in `tools/currency_sources.json`, ready to be checked and promoted.

**A real picture, but not the default (older issue, coin, photo or lower denomination):**

- **Angola**: No freely licensed image of the current (2012/2020) kwanza series on Commons; shows the most recent free note (1999 series).
- **Solomon Islands**: No freely licensed image of the current polymer series on Commons; shows the paper 2-dollar note.
- **Eritrea**: No freely licensed image of the 2015 nakfa series on Commons; shows the most recent free note (1997 series).
- **Gambia**: No freely licensed image of the 2019 dalasi series on Commons; shows the most recent free note (2006 series).
- **Thailand**: No freely licensed scan of the current (series 17) notes on Commons; shows the series-16 20-baht note.
- **Costa Rica**: No freely licensed image of the 2010-series colón notes on Commons; shows the most recent free note (2009 issue).
- **Trinidad and Tobago**: No freely licensed image of the 2020 polymer series on Commons; shows the paper 1-dollar note.
- **Burkina Faso, Benin, Côte d'Ivoire, Guinea-Bissau, Mali, Niger, Senegal, Togo**: No freely licensed image of a BCEAO banknote on Commons; shows the current 500-franc coin instead.
- **Tajikistan**: No freely licensed image of a current somoni banknote on Commons; shows the current 5-somoni coin instead.
- **Netherlands**: No freely licensed image of a Dutch 1- or 2-euro national side on Commons; shows the 5-cent coin.
- **Luxembourg**: No freely licensed image of a Luxembourg 1- or 2-euro national side on Commons; shows the 20-cent coin.
- **Montenegro, Kosovo**: Montenegro and Kosovo use the euro but have no national coin side; they show euro banknotes instead (a photo of the notes, the only freely licensed one on Commons).
- **Morocco**: No freely licensed image of the 2012 dirham series on Commons; shows the most recent free note (2002 series).
- **Syria**: No freely licensed image of a current Syrian pound note on Commons; shows the most recent free one (1957).
- **Egypt**: No freely licensed image of a current Egyptian banknote on Commons; shows the current 1-pound coin instead.
- **Zambia**: No freely licensed scan of a single current kwacha note on Commons; shows a photo of two current notes.
- **Sierra Leone**: No freely licensed scan of a single new-leone note on Commons; shows a photo of a pile of the 2022 notes.
- **United Arab Emirates**: No freely licensed image of a current UAE banknote on Commons; shows the current 1-dirham coin instead.
- **Sweden**: No freely licensed image of a current Swedish banknote on Commons; shows the current 10-krona coin instead.
- **Zimbabwe**: No freely licensed image of a Zimbabwe Gold (ZiG) note on Commons; shows the US dollar, which is also legal tender in Zimbabwe and used for most payments.
- **Saudi Arabia**: No freely licensed image of a current Saudi riyal note on Commons; shows the current 1-riyal coin instead.
- **Cambodia**: No freely licensed scan of a single current riel note could be fetched; shows a photo of a fan of current notes.
- **Switzerland, Liechtenstein**: The single-note scan picked for this (File:SUI0019o.jpg) could not be fetched before Wikimedia rate-limited this machine; shows the fanned ninth series (a free, current picture) meanwhile.
- **Pakistan**: No freely licensed image of a current Pakistani rupee note on Commons; shows the current 5-rupee coin instead.
- **Kuwait**: No freely licensed image of a current Kuwaiti dinar note on Commons; shows a current 100-fils coin instead.
- **Slovakia**: No freely licensed image of a Slovak 1- or 2-euro national side on Commons; shows the 1-cent coin.
- **Canada**: Current Canadian polymer notes have no freely licensed image on Commons; shows the most recent free note (the 1973 1-dollar).
- **Namibia**: No freely licensed image of a Namibian dollar note on Commons; shows the current 5-dollar coin instead.
- **Barbados**: No freely licensed image of a current Barbados dollar note on Commons; shows a current 25-cent coin instead.
- **South Africa**: No freely licensed image of the current (2023) rand series on Commons; shows the most recent free note (1993 series 10 rand).
- **Mauritania**: No freely licensed image of a current (2017) ouguiya note was confirmed on Commons; shows the current 20-ouguiya coin.

**No freely licensed picture found; the card shows the neutral drawn note, with ⓘ saying so:**

- **China**: The only scan of the fifth-series renminbi on Commons is under a deletion request, and no other freely licensed current note is hosted.
- **Jordan**: Jordanian banknotes on Commons are hosted under "use permitted by the Central Bank of Jordan", which is not a free licence (PD/CC0/CC BY/CC BY-SA).
- **Israel, Palestine**: Israeli new shekel notes and coins on Commons are hosted under "use permitted by the Bank of Israel", which is not a free licence (PD/CC0/CC BY/CC BY-SA).
- **Hungary**: Hungarian forint notes on Commons are hosted under a Magyar Nemzeti Bank template, not a free licence; no freely licensed current coin found.
- **Malaysia**: No freely licensed image of a current ringgit note or coin on Commons.
- **Vietnam**: No freely licensed image of a current đồng note or coin on Commons.
- **Iceland**: No freely licensed image of a current króna note or coin on Commons (only issues from the 1920s).
- **Bahamas**: No freely licensed image of a current Bahamian dollar note or coin on Commons.
- **Uruguay**: No freely licensed image of a current Uruguayan peso note or coin on Commons.
- **Vanuatu**: No freely licensed image of a current vatu note or coin on Commons.
- **Botswana**: No freely licensed image of a pula note or coin on Commons.
- **Mozambique**: No freely licensed image of a current (post-2006) metical note or coin on Commons.
- **São Tomé and Príncipe**: No freely licensed image of a current (post-2018) dobra note or coin on Commons.
- **Sudan**: No freely licensed image of a current Sudanese pound note or coin on Commons.
- **Cameroon, Central African Republic, Chad, Congo, Equatorial Guinea, Gabon**: No freely licensed image of a BEAC (Central African CFA franc) note or coin on Commons.
- **North Korea**: No freely licensed image of a current (post-2009) North Korean won note or coin on Commons.
- **Qatar**: No freely licensed image of a current Qatari riyal note or coin on Commons.
- **Sri Lanka**: No freely licensed image of a current Sri Lankan rupee note or circulating coin on Commons (only a commemorative proof coin).
- **South Korea**: South Korean notes and coins on Commons are hosted under a Bank of Korea template ("South Korean currency"), not a free licence.
- **Cuba**: No freely licensed image of a current Cuban peso note or coin on Commons (only bundles and 19th/20th-century issues).
- **Uganda**: A freely licensed candidate was found (File:UgandanShillings1000.jpg) but Wikimedia rate-limited this machine before it could be fetched and checked; see "_pending" in tools/currency_sources.json.
- **Brunei**: A freely licensed candidate was found (File:Brunei 5 dollar 2011 polymer note.jpg) but Wikimedia rate-limited this machine before it could be fetched and checked; see "_pending" in tools/currency_sources.json.
- **Nepal**: A freely licensed candidate was found (File:NPR 1000 (obverse).jpg) but Wikimedia rate-limited this machine before it could be fetched and checked; see "_pending" in tools/currency_sources.json.
- **Singapore**: A freely licensed candidate was found (File:10 Singapore dollar front - Portrait Series.jpg) but Wikimedia rate-limited this machine before it could be fetched and checked; see "_pending" in tools/currency_sources.json.
- **Norway**: A freely licensed candidate was found (File:Norwegian 200 kroner observe.jpg) but Wikimedia rate-limited this machine before it could be fetched and checked; see "_pending" in tools/currency_sources.json.
- **Belize**: A freely licensed candidate was found (File:Belize dollar $2 banknote 2025 issue, front.jpg) but Wikimedia rate-limited this machine before it could be fetched and checked; see "_pending" in tools/currency_sources.json.
- **Dominican Republic**: A freely licensed candidate was found (File:Dop2014notes 100 front.png) but Wikimedia rate-limited this machine before it could be fetched and checked; see "_pending" in tools/currency_sources.json.
- **Paraguay**: A freely licensed candidate was found (File:2000 dos mil guaranies anverso.jpg) but Wikimedia rate-limited this machine before it could be fetched and checked; see "_pending" in tools/currency_sources.json.
- **Australia, Kiribati, Nauru, Tuvalu**: A freely licensed candidate was found (File:2018 Australian fifty dollar note obverse.jpg) but Wikimedia rate-limited this machine before it could be fetched and checked; see "_pending" in tools/currency_sources.json.
- **New Zealand**: A freely licensed candidate was found (File:New Zealand twenty-dollar banknote, Series 7.jpg) but Wikimedia rate-limited this machine before it could be fetched and checked; see "_pending" in tools/currency_sources.json.
- **Ireland**: A freely licensed candidate was found (File:2 Euro, Ireland.jpg) but Wikimedia rate-limited this machine before it could be fetched and checked; see "_pending" in tools/currency_sources.json.
- **United Kingdom**: A freely licensed candidate was found (File:Pound sterling banknotes.png) but Wikimedia rate-limited this machine before it could be fetched and checked; see "_pending" in tools/currency_sources.json.
- **Mexico**: A freely licensed candidate was found (File:Banco de México G $500 obverse.png) but Wikimedia rate-limited this machine before it could be fetched and checked; see "_pending" in tools/currency_sources.json.
- **Guyana**: A freely licensed candidate was found (File:GYDnotes.png) but Wikimedia rate-limited this machine before it could be fetched and checked; see "_pending" in tools/currency_sources.json.
- **Iraq**: No freely licensed image of a current Iraqi dinar note on Commons was found.
- **Poland**: No freely licensed image of a current złoty note or coin on Commons was found.
- **Denmark**: A freely licensed candidate was found (File:10 kroner coin 2011-.jpg) but Wikimedia rate-limited this machine before it could be fetched and checked; see "_pending" in tools/currency_sources.json.
- **Argentina**: No freely licensed image of a current Argentine peso note or coin was found in the Commons categories checked (only photos of bundles and historic issues).
- **Colombia**: No freely licensed image of a current Colombian peso note or coin was found in the Commons categories checked (only photos of bundles and historic issues).
- **Peru**: No freely licensed image of a current Peruvian sol note or coin was found in the Commons categories checked (only photos of bundles and historic issues).
