# Usage: python3 -I tools/fix-ethnic-arctic-band.py <ETHNIC_GROUPS.json before the fix> <GREG shapefile path without extension, from https://icr.ethz.ch/data/greg/GREG.zip> <output.json>
"""Restore the band 65°N–68.75°N that went missing from textures/ETHNIC_GROUPS.json, from the original GREG shapefile.
Each GREG polygon crossing the band is cut to the band and to what the file does not already cover; the piece is
joined to the file's polygon that holds the rest of that same GREG polygon (same name, same colour); pieces of
groups that lie wholly in the band become new geometries named from GREG, coloured unlike their neighbours."""
import json,sys,shapefile
from shapely.geometry import shape,Polygon,MultiPolygon,box,mapping
from shapely.ops import unary_union
from shapely.strtree import STRtree
SRC,GREG,OUT=sys.argv[1:4]
t=json.load(open(SRC));tr=t['transform'];sx,sy=tr['scale'];tx,ty=tr['translate']
arcs=[]
for a in t['arcs']:
  x=y=0;pts=[]
  for p in a: x+=p[0];y+=p[1];pts.append((x*sx+tx,y*sy+ty))
  arcs.append(pts)
def ring(idx):
  out=[]
  for i in idx:
    pts=arcs[i] if i>=0 else arcs[~i][::-1]
    out.extend(pts if not out else pts[1:])
  return out
G=t['objects']['eth']['geometries']
polys=[]  # (gi, pi, shapely polygon)
for gi,g in enumerate(G):
  P=[g['arcs']] if g['type']=='Polygon' else g['arcs']
  for pi,pp in enumerate(P):
    try: polys.append((gi,pi,Polygon(ring(pp[0]),[ring(h) for h in pp[1:]]).buffer(0)))
    except Exception as e: print('bad',gi,pi,e)
cover=unary_union([p for _,_,p in polys])
TREE=STRtree([p for _,_,p in polys])
LO,HI=64.6,69.3
band=box(-180,LO,180,HI)
r=shapefile.Reader(GREG,encoding='latin-1')
fn=[f.name for f in r.fields[1:]]
import collections
def gname(d):
  names=[str(d[k]).strip() for k in ('G1SHORTNAM','G2SHORTNAM','G3SHORTNAM') if d.get(k) and str(d[k]).strip()]
  return names[0] if len(names)==1 else ', '.join(names[:-1])+' and '+names[-1]
votes=collections.defaultdict(collections.Counter)
for sr in r.iterShapeRecords():
  g=shape(sr.shape.__geo_interface__).buffer(0);nm=gname(dict(zip(fn,sr.record)))
  for i in TREE.query(g):
    a=polys[i][2].intersection(g).area
    if a>0: votes[nm][G[polys[i][0]]['properties']['n']]+=a
NAME={k:v.most_common(1)[0][0] for k,v in votes.items()}
add={}   # (gi,pi) -> list of pieces
new=[]   # (name, geom)
for sr in r.iterShapeRecords():
  g=shape(sr.shape.__geo_interface__).buffer(0)
  if not g.intersects(band): continue
  piece=g.intersection(band).difference(cover)
  piece=piece.buffer(0)
  if piece.is_empty or piece.area<1e-4: continue
  rest=g.difference(band)
  best=None;ba=0
  if not rest.is_empty:
    for i in TREE.query(rest):
      a=polys[i][2].intersection(rest).area
      if a>ba: ba,best=a,i
  if best is not None and ba>1e-3:
    add.setdefault((polys[best][0],polys[best][1]),[]).append(piece)
  else:
    d=dict(zip(fn,sr.record))
    names=[d[k].strip() for k in ('G1SHORTNAM','G2SHORTNAM','G3SHORTNAM') if d.get(k) and str(d[k]).strip()]
    nm=names[0] if len(names)==1 else ', '.join(names[:-1])+' and '+names[-1]
    # the file's own name for this group: the feature that overlaps this GREG polygon most anywhere
    bo=0;fname=None
    for i in TREE.query(g):
      a=polys[i][2].intersection(g).area
      if a>bo: bo,fname=a,G[polys[i][0]]['properties']['n']
    new.append(((NAME.get(nm) or fname or nm).replace("Saami","Sámi"),piece))
print('joined to',len(add),'polygons; new',len(new),[n for n,_ in new])
# rebuild: new arcs for changed polygons
def q(pt):return (round((pt[0]-tx)/sx),round((pt[1]-ty)/sy))
def enc(coords):
  qs=[q(p) for p in coords];out=[];px=py=0;last=None
  for x,y in qs:
    if last==(x,y):continue
    out.append([x-px,y-py]);px,py=x,y;last=(x,y)
  return out
def addpoly(P):
  rs=[]
  for rg in [P.exterior]+list(P.interiors):
    c=list(rg.coords)
    if len(c)<4:continue
    t['arcs'].append(enc(c));rs.append([len(t['arcs'])-1])
  return rs
def parts(geom):
  geom=geom.simplify(0.01,preserve_topology=True).buffer(0)
  return [geom] if geom.geom_type=='Polygon' else [p for p in getattr(geom,'geoms',[]) if p.geom_type=='Polygon']
byg={}
for (gi,pi),pcs in add.items():
  base=[p for (a,b,p) in polys if a==gi and b==pi][0]
  u=unary_union([base]+pcs).buffer(0)
  byg.setdefault(gi,{})[pi]=u
for gi,repl in byg.items():
  g=G[gi];P=[g['arcs']] if g['type']=='Polygon' else g['arcs']
  c=g['properties'].get('c');cl=c if isinstance(c,list) else [c]*len(P)
  NP=[];NC=[]
  for pi,pp in enumerate(P):
    if pi in repl:
      for part in parts(repl[pi]):
        NP.append(addpoly(part));NC.append(cl[pi])
    else: NP.append(pp);NC.append(cl[pi])
  g['type']='MultiPolygon';g['arcs']=NP;g['properties']['c']=NC
# new groups: colour unlike touching polygons
PAL=7
for nm,geom in new:
  near=set();same=None
  for i in TREE.query(geom.buffer(0.05)):
    gi,pi,p=polys[i]
    if p.distance(geom)<0.05:
      c=G[gi]['properties']['c'];cc=c[pi] if isinstance(c,list) else c
      if G[gi]['properties']['n']==nm: same=cc
      else: near.add(cc)
  col=same if same is not None else next((k for k in range(PAL) if k not in near),0)
  ps=parts(geom);
  if not ps:continue
  G.append({'type':'MultiPolygon','arcs':[addpoly(p) for p in ps],'properties':{'n':nm,'c':[col]*len(ps)}})
json.dump(t,open(OUT,'w'),separators=(',',':'))
