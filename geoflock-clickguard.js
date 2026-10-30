/* GeoFlock: one guard for every "click the map to open something" (country profile, biome / ecoregion / realm card,
   history story card, capital card, lake / river / layer cards, the count-people country card…).
   A press on the map opens something only when it is a clean click on the map itself:
   (a) no toolkit tool is armed (pins, pens, eraser, shovel, dragger, geometry, ruler) and the cross-section is not drawing;
   (b) the press went down on the map surface (the canvas, the SVG or a country), not on a button, chip, legend, panel,
       tour card, launcher, dialog… and not outside the map;
   (c) the pointer moved less than ~6 px and the press was shorter than ~600 ms (a drag or pan opens nothing);
   (d) during a guided tour, presses on the tour's own cards, labels and buttons open nothing;
   (e) no modal was already open when the press began.
   It filters map clicks before the map's own handlers hear them, wraps openFlagZoom (every map → country/biome/story
   opener runs through it), and exposes gfClickGuard.ok(e) for handlers that listen on the whole document. */
(function(){
"use strict";
if(window.gfClickGuard)return;
const MOVE=6,HOLD=600;
/* things that are UI, not map: a press that starts on any of these is never a map click */
const UI=["button","a","input","select","textarea","label","option","summary","[role=button]","[role=tab]","[role=menu]","[role=menuitem]",
 "[role=dialog]","[role=listbox]","[contenteditable]",".chip",".ps-launcher",".ps-card","[class^='ps-']","[class*=' ps-']",
 ".legend",".population-legend",".legend-swatch",".map-legend","#flKey",".flk",".gfk-tray",".gfk-panel",".gfk-obj",".gfk-pin",".gfk-coord",
 ".gfk-gx",".gfk-gall",".gfk-cap:not(.gfk-cap-pass)",".gf-dng",".globe-btns",".globe-tip",".globe-subs",".globe-surprise",".hist-dock",
 ".hist-story",".hist-story-tab",".hist-track",".gfs-card","[id^='globalSearch']",".global-search",".am-tools",".map-zoom-controls",
 ".map-submode-overlay",".all-maps-submodes",".all-maps-label-controls",".gf-capcard",".gf-pc",".gf-xs",".gf-learn","#gfLearn",
 ".spin-home",".gf-spin-note",".am-dice-top",".gf-nat-card",".game-modal",".gf-lk-tabs",".gf-tip",".tooltip"].join(",");
/* the map containers of World Maps (flat map, flat globe and 3-D globe) and, for the capital card, the other maps */
const WORLD="#allMapsView, #allMapsWrap, #amGlobeHost";
const ANYMAP=WORLD+", .globe-host, .globe-stage, .map-wrap";
const MODAL="#flagZoomOverlay, .game-modal-backdrop, .gf-nat-back, [aria-modal='true']";
const el=t=>t&&t.nodeType===1?t:t&&t.parentElement||null;
const vis=e=>!!(e&&e.isConnected&&e.getClientRects().length);
function inWorld(t){t=el(t);if(!t||!t.closest)return false;if(t.closest(WORLD))return true;try{return!!(typeof amGlobe!=="undefined"&&amGlobe&&amGlobe.host&&amGlobe.host.contains(t))}catch(e){return false}}
function inAnyMap(t){t=el(t);return!!(t&&t.closest&&(t.closest(ANYMAP)||inWorld(t)))}
/* on the SVG only the tour's labels and pins and the toolkit's own pins and objects are UI (tours tint and outline
   countries with ps-… shapes, and those stay part of the map) */
const UI_SVG=".ps-lab, .ps-pins, .ps-pp, .gfk-pin, .gfk-obj, a, [role=button]";
/* walk up from the target, stopping at the map's own container (which a tour may mark with a ps-… class) */
const STOP="#allMapsWrap, #amGlobeHost, .globe-host, .globe-stage, .map-wrap, #allMapsView, body";
function uiOf(t){t=el(t);while(t&&t.nodeType===1){if(t instanceof SVGElement){if(t.matches(UI_SVG))return t}else{if(t.matches(UI))return t;if(t.matches(STOP))return null}t=t.parentElement}return null}
function isUI(t){return!!uiOf(t)}
/* the map surface: the canvas, the SVG (a country, the sea, a lake, a marker drawn on it), or the bare map container */
function isSurface(t){t=el(t);if(!t||!t.closest||!inAnyMap(t)||isUI(t))return false;
 if(t.closest("foreignObject"))return false;
 if(t instanceof SVGElement||t.tagName==="CANVAS")return true;
 return t.matches("#allMapsWrap, #amGlobeHost, .globe-host, .globe-stage, .gfk-cap-pass, .map-wrap")}
function modalOpen(){try{return[...document.querySelectorAll(MODAL)].some(vis)}catch(e){return false}}
/* (a) a tool that turns map presses into something else */
function toolArmed(opts){opts=opts||{};
 try{const S=window.gfToolkit&&gfToolkit.S;if(S&&(S.pinArm||S.pen||S.shovelArm||S.dragging||S.stroke||S.erasing))return"toolkit"}catch(e){}
 try{if(document.querySelector(".gfk-pinning, .gfk-dragmode, .gfk-moving, .gfk-cap:not(.gfk-cap-pass)"))return"toolkit"}catch(e){}
 try{const X=window.gfCrossSection;if(X&&(X.armed||X.drawing))return"xsect";if(document.querySelector(".gf-xs-go.on"))return"xsect"}catch(e){}
 if(opts.open){/* tools that use the click themselves: they may have the click, but it must not also open a card */
  try{if(typeof amtMeasure!=="undefined"&&amtMeasure)return"measure"}catch(e){}
  try{if(typeof amGlobe!=="undefined"&&amGlobe&&amGlobe._measure)return"measure"}catch(e){}
  try{if(window.gfToolkit&&gfToolkit.S&&gfToolkit.S.place&&gfToolkit.S.place.ruler)return"ruler"}catch(e){}}
 return""}
/* the current press: where it went down, how far it has moved, when */
let rec=null;
function onDown(e){if(e.isPrimary===false)return;
 if(e.pointerType==="mouse"&&e.button!==0){rec={x:e.clientX,y:e.clientY,t:performance.now(),max:0,surface:false,map:false,ui:true,modal:false,armed:"",fresh:true,tgt:e.target,btn:true};return}
 rec={x:e.clientX,y:e.clientY,t:performance.now(),max:0,surface:isSurface(e.target),map:inAnyMap(e.target),world:inWorld(e.target),ui:isUI(e.target),
  modal:modalOpen(),armed:toolArmed({open:true}),fresh:true,tgt:e.target,id:e.pointerId}}
function onMove(e){if(!rec||!rec.fresh||e.isPrimary===false)return;const d=Math.hypot(e.clientX-rec.x,e.clientY-rec.y);if(d>rec.max)rec.max=d}
addEventListener("pointerdown",onDown,true);
addEventListener("pointermove",onMove,{capture:true,passive:true});
/* the press is spent once its click has been handled (or, with no click, shortly after it lets go) */
addEventListener("pointerup",e=>{onMove(e);if(rec){rec.up=performance.now();const r=rec;setTimeout(()=>{if(rec===r)r.fresh=false},400)}},true);
addEventListener("pointercancel",()=>{if(rec)rec.fresh=false},true);
/* why a press must not open anything ("" = it may) */
function why(e,opts){opts=opts||{};
 if(e&&e.isTrusted===false)return"";
 if(e&&e.type==="click"&&e.detail===0)return"";/* keyboard: Enter/Space on a focused element */
 const r=rec;if(!r||!r.fresh)return"no-press";/* the press was swallowed by something else (a tool) */
 if(r.btn)return"button";
 const a=toolArmed(opts);if(a&&a!==opts.except)return"tool:"+a;
 if(r.armed&&r.armed!==opts.except&&!(opts.open===false&&(r.armed==="measure"||r.armed==="ruler")))return"tool:"+r.armed;
 if(!r.surface)return r.map?"ui":"outside";
 if(r.modal)return"modal";
 let d=r.max;if(e&&e.clientX!=null&&(e.clientX||e.clientY)){d=Math.max(d,Math.hypot(e.clientX-r.x,e.clientY-r.y))}
 if(d>MOVE)return"moved";
 if(performance.now()-r.t>HOLD)return"held";
 if(e&&e.target&&e.type!=="pointerup"&&!opts.anyTarget){const t=e.target;if(isUI(t)&&!isSurface(t))return"ui"}
 return""}
let lastWhy="";
/* ok(e): may this click open something on the map? */
function ok(e,opts){const w=why(e||window.event,opts);lastWhy=w;return!w}
/* 1. map clicks: stop them before the map's own handlers (country paths, lakes, rivers, layer markers) hear them */
addEventListener("click",e=>{try{
 if(!e.isTrusted||e.detail===0)return;const t=e.target;
 if(!inWorld(t)||!isSurface(t)){setTimeout(()=>{if(rec)rec.fresh=false},0);return}
 const w=why(e,{open:false});lastWhy=w;setTimeout(()=>{if(rec)rec.fresh=false},0);
 if(w){e.stopImmediatePropagation();e.preventDefault()}}catch(er){}},true);
/* 2. openers: a profile, biome, story or region card asked for in the middle of a map press */
function blockOpen(){const ev=window.event;if(!ev||!ev.isTrusted)return false;
 if(!/^(click|pointerup|mouseup|touchend|dblclick)$/.test(ev.type))return false;
 if(ev.type==="click"&&ev.detail===0)return false;
 const t=ev.target;
 /* a press that began and ended on a button (outside the map, or a "Go to the country" button over it) is that button's own action */
 if(rec&&rec.fresh&&!rec.surface&&rec.tgt&&isUI(t)&&!isSurface(t)){const b=uiOf(rec.tgt),b2=uiOf(t);
  if(b&&b2&&(b===b2||b.contains(b2)||b2.contains(b)))return false}
 if(!(inAnyMap(t)||rec&&rec.fresh&&rec.map))return false;/* not a map press at all */
 return!ok(ev,{open:true})}
function wrapOpeners(){
 try{if(typeof openFlagZoom==="function"&&!openFlagZoom._gfGuard){const o=openFlagZoom;
  openFlagZoom=function(){try{if(blockOpen())return}catch(e){}return o.apply(this,arguments)};openFlagZoom._gfGuard=1}}catch(e){}
 try{if(typeof window.gfNatureCard==="function"&&!window.gfNatureCard._gfGuard){const o=window.gfNatureCard;
  window.gfNatureCard=function(){try{if(blockOpen())return}catch(e){}return o.apply(this,arguments)};window.gfNatureCard._gfGuard=1}}catch(e){}}
wrapOpeners();addEventListener("load",wrapOpeners);setTimeout(wrapOpeners,1500);
window.gfClickGuard={ok,why:e=>why(e||window.event,{open:true}),isSurface,isUI,toolArmed,get last(){return lastWhy},get press(){return rec}};
})();
