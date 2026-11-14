#!/bin/sh
# Builds textures/reliefhr2 (the sharper Natural Earth relief for the globe, geoflock-reliefsharp.js).
# Source: NE1_HR_LC_SR_W.tif from https://naciscdn.org/naturalearth/10m/raster/NE1_HR_LC_SR_W.zip (Natural Earth, public domain).
# Usage: sh tools/reliefhr2/run.sh NE1_HR_LC_SR_W.tif WORKDIR   (WORKDIR needs about 4 GB free; run from the repo root)
# 1 prep: the HR picture shrunk to the globe picture's grid, and the globe picture's two halves as one image
# 2 lut: a 33x33x33 colour table from the HR colours to the globe picture's colours
# 3 build: the HR picture through the table (G.npy), and which pixels are sea (SEA.npy)
# 4 corr2: what is left between the two, smoothed separately over land and over sea; large areas where the globe picture has
#   its own land or sea (the Antarctic ice shelves) become see-through
# 5 final: corrections applied at full size (OUT.npy); 6 boost: the hill shading at 2-8 px brought up to the globe picture's
#   strength (OUT2.npy); 7 tiles: webp tiles, 1/ full size in 6-degree tiles, 0/ half size in 12-degree tiles
set -e
D=$(cd "$(dirname "$0")" && pwd);W=$2;R=$(pwd)
python3 -I "$D/prep.py" "$1" "$R" "$W"
python3 -I "$D/lut.py" "$W" 33
python3 -I "$D/build.py" "$1" "$W"
python3 -I "$D/corr2.py" "$W"
python3 -I "$D/final.py" "$W"
python3 -I "$D/boost.py" "$W" 0.5
python3 -I "$D/tiles.py" "$W" "$R/textures/reliefhr2"
