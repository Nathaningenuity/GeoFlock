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

EXCEPTIONS_PLACEHOLDER
