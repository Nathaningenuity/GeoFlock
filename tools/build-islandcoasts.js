#!/usr/bin/env node
/* Build detailed coastlines for the islands and island chains in the map search (geoflock-search.js).
 *
 *   node tools/build-islandcoasts.js <islands.json> <ne_10m_land.geojson> <ne_10m_minor_islands.geojson>
 *
 * Inputs (download once, not kept in the repo):
 *   - islands.json: the search's island entries, [[name, category, type, rough GeoJSON geometry], ...], dumped from the
 *     page with  JSON.stringify(gfSearch.build().filter(<island test>).map(e=>[e.n,e.cat,e.typ||"",e.g]))
 *   - Natural Earth 1:10m land and minor islands (public domain), https://github.com/nvkelso/natural-earth-vector/tree/master/geojson
 *
 * Writes textures/ISLAND_COASTS.json: { p: [ring, ...], e: { "<name>": [ring index, ...] } }. Each landmass's outer ring is
 * stored once (island chains share their islands with the islands themselves) as whole thousandths of a degree:
 * [lon0, lat0, dlon1, dlat1, dlon2, dlat2, ...], each point given as the step from the one before.
 * A Natural Earth landmass belongs to an entry when its middle lies inside (or right next to) the entry's rough outline,
 * and it is not much bigger than that outline (so a continent never joins a group of islands off its coast).
 */
"use strict";
const fs = require("fs"), path = require("path");
const [islPath, landPath, minorPath] = process.argv.slice(2);
if (!islPath || !landPath || !minorPath) { console.error("usage: node tools/build-islandcoasts.js <islands.json> <ne_10m_land.geojson> <ne_10m_minor_islands.geojson>"); process.exit(1); }
const ISL = JSON.parse(fs.readFileSync(islPath, "utf8"));
const polysOf = g => g.type === "Polygon" ? [g.coordinates] : g.type === "MultiPolygon" ? g.coordinates : [];
const LAND = [];
for (const f of [landPath, minorPath]) JSON.parse(fs.readFileSync(f, "utf8")).features.forEach(ft => ft.geometry && polysOf(ft.geometry).forEach(P => LAND.push(P[0])));

/* planar helpers in degrees, with longitudes shifted by +360 when a shape crosses the 180° line */
const shift = (r, wrap) => wrap ? r.map(([x, y]) => [x < 0 ? x + 360 : x, y]) : r;
function bbox(r) { let a = 1e9, b = 1e9, c = -1e9, d = -1e9; for (const [x, y] of r) { if (x < a) a = x; if (y < b) b = y; if (x > c) c = x; if (y > d) d = y } return [a, b, c, d] }
function area(r) { let s = 0; for (let i = 0, j = r.length - 1; i < r.length; j = i++) s += (r[j][0] - r[i][0]) * (r[j][1] + r[i][1]); return Math.abs(s / 2) }
function centroid(r) { let A = 0, X = 0, Y = 0; for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const c = r[j][0] * r[i][1] - r[i][0] * r[j][1]; A += c; X += (r[j][0] + r[i][0]) * c; Y += (r[j][1] + r[i][1]) * c }
  if (Math.abs(A) < 1e-12) { const b = bbox(r); return [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2] } return [X / (3 * A), Y / (3 * A)] }
function inside(p, rings) { let c = false; for (const r of rings) for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const a = r[i], b = r[j]; if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c } return c }
function distTo(p, rings) { let best = 1e9; for (const r of rings) for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const a = r[j], b = r[i], ex = b[0] - a[0], ey = b[1] - a[1], L = ex * ex + ey * ey;
  let t = L ? ((p[0] - a[0]) * ex + (p[1] - a[1]) * ey) / L : 0; t = Math.max(0, Math.min(1, t)); const d = Math.hypot(a[0] + t * ex - p[0], a[1] + t * ey - p[1]); if (d < best) best = d } return best }
/* Douglas–Peucker, keeping the ring closed */
function simplify(r, tol) { if (r.length < 8) return r; const keep = new Uint8Array(r.length); keep[0] = keep[r.length - 1] = 1;
  /* a closed ring starts and ends on the same point: split it at the point farthest from there first */
  let far = 1, fd = -1; for (let i = 1; i < r.length - 1; i++) { const d = Math.hypot(r[i][0] - r[0][0], r[i][1] - r[0][1]); if (d > fd) { fd = d; far = i } }
  keep[far] = 1; const st = [[0, far], [far, r.length - 1]];
  while (st.length) { const [a, b] = st.pop(); let md = 0, mi = -1; const A = r[a], B = r[b], ex = B[0] - A[0], ey = B[1] - A[1], L = Math.hypot(ex, ey) || 1e-12;
    for (let i = a + 1; i < b; i++) { const d = Math.abs((r[i][0] - A[0]) * ey - (r[i][1] - A[1]) * ex) / L; if (d > md) { md = d; mi = i } }
    if (md > tol) { keep[mi] = 1; st.push([a, mi], [mi, b]) } }
  return r.filter((_, i) => keep[i]) }
const LB = LAND.map(r => ({ r, b: bbox(r) }));

const OUT = { p: [], e: {} }, PIX = new Map(); let total = 0;
ISL.forEach(([name, cat, , g]) => {
  const raw = polysOf(g).map(P => P[0]); if (!raw.length) return;
  let B = bbox([].concat(...raw)); const wrap = B[2] - B[0] > 180 && B[0] < -170 && B[2] > 170;
  const R = raw.map(r => shift(r, wrap)); B = bbox([].concat(...R));
  const A = R.reduce((s, r) => s + area(r), 0), pad = Math.max(.08, Math.sqrt(A) * .05);
  const got = [];
  LB.forEach(({ r, b }) => {
    let rr = r, bb = b;
    if (wrap && b[2] < 0) { rr = shift(r, true); bb = bbox(rr) } else if (wrap && b[0] < 0) return;
    if (bb[2] < B[0] - pad || bb[0] > B[2] + pad || bb[3] < B[1] - pad || bb[1] > B[3] + pad) return;
    const a = area(rr); if (a > A * 3 + .02) return;
    const c = centroid(rr);
    if (!inside(c, R) && distTo(c, R) > pad) return;
    got.push(rr);
  });
  if (!got.length) return;
  /* about 200 m: as sharp as the 1:10m map, fewer points */
  const ix = [];
  got.forEach(r => {
    const k = r.length + ":" + r[0].join(",") + ":" + r[r.length >> 1].join(",");
    if (!PIX.has(k)) {
      const q = simplify(r, .002).map(([x, y]) => [Math.round((x > 180 ? x - 360 : x) * 1e3), Math.round(y * 1e3)]);
      if (q.length < 4) { PIX.set(k, -1); return }
      const flat = [q[0][0], q[0][1]]; for (let i = 1; i < q.length; i++) { const dx = q[i][0] - q[i - 1][0], dy = q[i][1] - q[i - 1][1]; if (dx || dy) flat.push(dx, dy) }
      PIX.set(k, OUT.p.length); OUT.p.push(flat); total += flat.length / 2;
    }
    const i = PIX.get(k); if (i >= 0) ix.push(i);
  });
  if (ix.length) OUT.e[name] = ix;
});
const file = path.join(__dirname, "..", "textures/ISLAND_COASTS.json");
fs.writeFileSync(file, JSON.stringify(OUT));
console.log("entries", Object.keys(OUT.e).length, "of", ISL.length, "points", total, "bytes", fs.statSync(file).size);
