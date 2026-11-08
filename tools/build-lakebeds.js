#!/usr/bin/env node
/* Build the lake-bed data for the cross-section (geoflock-xsect.js).
 *
 *   node tools/build-lakebeds.js <HydroLAKES_points_v10.dbf> <GLOBathy_basic_parameters(1-100K LAKES).csv>
 *
 * Inputs (download once, not kept in the repo):
 *   - HydroLAKES v1.0 points, attribute table (Messager et al. 2016, Nature Communications 7:13603),
 *     https://data.hydrosheds.org/file/hydrolakes/HydroLAKES_points_v10_shp.zip  (CC BY 4.0)
 *   - GLOBathy basic parameters (Khazaei et al. 2022, Scientific Data 9:36, doi:10.1038/s41597-022-01132-9),
 *     https://springernature.figshare.com/articles/dataset/13402070  (the site's lakes all have Hylak_id < 100,000,
 *     so only the first CSV is needed)
 *
 * What it does:
 *   1. Adds each lake's HydroLAKES Hylak_id to textures/LAKES.json as a 7th field
 *      ([name, level, meanDepth, type, areaKm2, polygons, id]); readers that take the first six fields are unaffected.
 *      Lakes are matched by name and area (LAKES.json was made from HydroLAKES, in Hylak_id order).
 *   2. Writes textures/LAKEBED.json: { "<Hylak_id>": [GLOBathy max depth (m), pour lon, pour lat, GRanD id] }
 *      for the site's lakes only. The pour point is where the lake drains out; for a reservoir it is the dam.
 */
"use strict";
const fs = require("fs"), path = require("path");
const [dbfPath, csvPath] = process.argv.slice(2);
if (!dbfPath || !csvPath) { console.error("usage: node tools/build-lakebeds.js <HydroLAKES_points_v10.dbf> <GLOBathy (1-100K LAKES).csv>"); process.exit(1); }
const ROOT = path.join(__dirname, "..");

/* a minimal dBASE III reader: the fields we need, as numbers or latin-1 text */
function readDbf(file, want) {
  const b = fs.readFileSync(file), n = b.readUInt32LE(4), hlen = b.readUInt16LE(8), rlen = b.readUInt16LE(10);
  const F = []; let off = 1;
  for (let p = 32; b[p] !== 0x0d; p += 32) {
    const name = b.toString("latin1", p, p + 11).replace(/\0.*$/, ""), type = String.fromCharCode(b[p + 11]), len = b[p + 16];
    F.push({ name, type, len, off }); off += len;
  }
  const use = F.filter(f => want.includes(f.name)), out = [];
  for (let i = 0; i < n; i++) {
    const r = hlen + i * rlen; if (b[r] === 0x2a) continue; /* deleted */
    const o = {};
    for (const f of use) { const s = b.toString("latin1", r + f.off, r + f.off + f.len).trim(); o[f.name] = f.type === "C" ? s : +s; }
    out.push(o);
  }
  return out;
}

const HL = readDbf(dbfPath, ["Hylak_id", "Lake_name", "Lake_area", "Lake_type", "Grand_id", "Pour_long", "Pour_lat"]).filter(o => o.Lake_area >= 40);
const lakesFile = path.join(ROOT, "textures/LAKES.json"), LAKES = JSON.parse(fs.readFileSync(lakesFile, "utf8"));

/* match: same area (to the km²) and, where both have one, the same name; ties go to the nearest Hylak_id in order */
const byArea = new Map();
HL.forEach(o => { const k = Math.round(o.Lake_area); for (const kk of [k - 1, k, k + 1]) { if (!byArea.has(kk)) byArea.set(kk, []); byArea.get(kk).push(o); } });
let matched = 0, prev = 0; const ids = new Set();
LAKES.forEach(L => {
  const [n, , , , ar] = L, c = (byArea.get(Math.round(ar)) || []).filter(o => !ids.has(o.Hylak_id) && Math.abs(o.Lake_area - ar) <= 1);
  const named = c.filter(o => n && o.Lake_name && o.Lake_name.normalize("NFC") === String(n).normalize("NFC"));
  const pool = named.length ? named : c;
  pool.sort((a, b) => Math.abs(a.Hylak_id - prev) - Math.abs(b.Hylak_id - prev));
  const o = pool[0];
  L.length = 6;
  if (o) { L.push(o.Hylak_id); ids.add(o.Hylak_id); prev = o.Hylak_id; matched++; }
  else L.push(0);
});
console.log("matched", matched, "of", LAKES.length);

/* GLOBathy: Dmax_use_m is the paper's recommended maximum depth (published value where known, else its estimate) */
const csv = fs.readFileSync(csvPath, "utf8").split(/\r?\n/), head = csv[0].split(","), ix = k => head.indexOf(k);
const iId = ix("Hylak_id"), iD = ix("Dmax_use_m");
const DMAX = new Map();
for (let i = 1; i < csv.length; i++) {
  if (!csv[i]) continue;
  /* Lake_name may hold commas inside quotes: read the id from the front and the depth from the back */
  const parts = csv[i].split(","), id = +parts[iId], d = +parts[parts.length - (head.length - iD)];
  if (ids.has(id) && d > 0) DMAX.set(id, d);
}
const BED = {}, hlById = new Map(HL.map(o => [o.Hylak_id, o]));
ids.forEach(id => {
  const o = hlById.get(id), d = DMAX.get(id);
  BED[id] = [d ? Math.round(d * 10) / 10 : 0, Math.round(o.Pour_long * 1e4) / 1e4, Math.round(o.Pour_lat * 1e4) / 1e4, o.Grand_id || 0];
});
console.log("GLOBathy depths", DMAX.size);

fs.writeFileSync(lakesFile, JSON.stringify(LAKES));
fs.writeFileSync(path.join(ROOT, "textures/LAKEBED.json"), JSON.stringify(BED));
console.log("wrote textures/LAKES.json (with ids) and textures/LAKEBED.json");
