// The homepage "Who benefits" line-up (three.js, loaded lazily by components/home-who-people.tsx).
// One WebGL canvas sits behind the four tiles and draws each person into their own tile (scissored
// viewports), so four figures cost one context. The page passes the tile rects in canvas pixels.
// Choreography, all on the scene's own clock:
//   enter()      each person walks in from the left (staggered), turns to the viewer and waves
//   idle         breathing, weight shift, a look around, and a small action of their own
//                (AI: the laptop chart moves; studio: taps the tablet; IT: checks the rack, whose
//                LEDs blink; service firm: straightens the blazer)
//   setSpeaker() the speaker faces the viewer and gestures while talking; their gold ring ripples
// Figures come from who-figures.ts (the same people as the Who We Help story).
import * as THREE from "three";
import { canvasTexture, clamp01, disposeScene, dotTexture, smooth } from "@/components/scene-kit";
import { buildPerson, buildRack, C, flatMaterial, makeMaterials } from "@/components/who-figures";

export type Tile = { x: number; y: number; w: number; h: number };
export type LineupScene = {
 setLayout(tiles: Tile[], width: number, height: number): void;
 enter(instant?: boolean): void;
 setSpeaker(index: number): void;
 start(): void;
 stop(): void;
 dispose(): void;
 snapshot(index: number, width: number, height: number, close?: boolean): string;
};
type Options = { mobile?: boolean; onFirstFrame?: () => void; onLost?: () => void };

const COUNT = 4;
const STAND = [0, 0, 0, 0];     // where each person stands (left of centre; the bubble sits top right)
const FACE = .2;                // yaw when facing the viewer
const OFF = -2.1;               // the walk-in starts outside the tile
const STAGGER = .24, WALK = 1.15, TURN = .4, WAVE = 1.5;
const BARS = [70, 110, 92, 140, 124];
// Where each person looks during their own action: [down, sideways].
const GLANCE = [[.38, .32], [.32, .26], [0, .8], [.3, 0]] as const;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
// 0 before `a`, eases up to 1, holds, eases back to 0 by `b`.
const bump = (t: number, a: number, b: number, ramp = .45) => smooth(clamp01((t - a) / ramp)) * (1 - smooth(clamp01((t - b + ramp) / ramp)));

export function createLineupScene(canvas: HTMLCanvasElement, options: Options = {}): LineupScene {
 const mobile = Boolean(options.mobile);
 const shadows = !mobile;
 const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
 renderer.autoClear = false;
 renderer.toneMapping = THREE.NeutralToneMapping;
 renderer.shadowMap.enabled = shadows;
 renderer.shadowMap.type = THREE.PCFSoftShadowMap;
 let dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);
 renderer.setPixelRatio(dpr);

 const scene = new THREE.Scene();
 scene.fog = new THREE.Fog(C.paper, 7, 17);
 const camera = new THREE.PerspectiveCamera(30, 1, .1, 60);
 scene.add(new THREE.HemisphereLight(0xffffff, 0xe6e1d6, 1.9));
 const sun = new THREE.DirectionalLight(0xffffff, 2.1);
 sun.position.set(2.5, 5, 4);
 scene.add(sun, sun.target);
 if (shadows) {
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: 1, far: 15 });
  sun.shadow.camera.updateProjectionMatrix();
  sun.shadow.bias = -.0005;
  sun.shadow.normalBias = .02;
 }

 const textures: THREE.Texture[] = [];
 const m = makeMaterials();

 // Floor: the dotted paper, a gold ring where each person stands, and a ripple for the speaker.
 const dots = dotTexture(renderer);
 dots.repeat.set(30 / .3, 30 / .3);
 textures.push(dots);
 const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), flatMaterial(0xffffff, { map: dots }));
 floor.rotation.x = -Math.PI / 2;
 scene.add(floor);
 if (shadows) {
  const catcher = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.ShadowMaterial({ opacity: .16 }));
  catcher.rotation.x = -Math.PI / 2;
  catcher.position.y = .002;
  catcher.receiveShadow = true;
  scene.add(catcher);
 }
 const ring = new THREE.TorusGeometry(.36, .006, 6, 72).rotateX(Math.PI / 2);
 const spot = new THREE.Mesh(ring, flatMaterial(C.gold));
 spot.position.y = .004;
 const rippleMaterial = flatMaterial(C.gold, { transparent: true, opacity: 0, depthWrite: false });
 const ripple = new THREE.Mesh(ring, rippleMaterial);
 ripple.position.y = .005;
 scene.add(spot, ripple);
 const blob = canvasTexture(128, 128, ctx => {
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(11,12,16,.32)"); gradient.addColorStop(1, "rgba(11,12,16,0)");
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 128, 128);
 });
 textures.push(blob);
 const blobMesh = new THREE.Mesh(new THREE.PlaneGeometry(.7, .5), flatMaterial(0xffffff, { map: blob, transparent: true, depthWrite: false }));
 blobMesh.rotation.x = -Math.PI / 2;
 blobMesh.position.y = .003;
 blobMesh.visible = !shadows;
 scene.add(blobMesh);

 const people = Array.from({ length: COUNT }, (_, k) => buildPerson(k, m, textures, shadows));
 people.forEach(rig => { rig.root.position.x = OFF; rig.root.rotation.y = Math.PI / 2; scene.add(rig.root); });
 const { rack, leds } = buildRack(m, shadows);
 // On her left (screen right), low in the tile, so it never sits under the speech bubble.
 rack.position.set(STAND[2] + .66, 0, -.34);
 scene.add(rack);

 // ---------- State ----------
 const pose = people.map(() => ({ talk: 0, wave: 0 }));
 let enterAt = -1, instant = false, speaker = -1, time = 0, chartAt = 0;
 let tiles: Tile[] = [], width = 1, height = 1;

 // Framing: in roomy tiles the person stands left of centre, leaving the top right for the
 // page's speech bubble; small tiles keep them centred.
 function frameCamera(centred = false) {
  const tile = tiles[0];
  const aspect = tile ? tile.w / Math.max(1, tile.h) : .9;
  const roomy = !centred && (tile?.w ?? 0) >= 250;
  const visible = roomy ? 2.7 : 2.5;
  camera.aspect = aspect;
  camera.fov = 30;
  camera.updateProjectionMatrix();
  const distance = visible / 2 / Math.tan(THREE.MathUtils.degToRad(15));
  const shift = roomy ? visible / 2 * aspect * .37 : 0;
  const lookY = roomy ? 1.12 : .98;
  camera.position.set(shift + .1, lookY + .22, distance);
  camera.lookAt(shift, lookY, 0);
  camera.updateMatrixWorld();
 }

 // The AI person's laptop chart breathes.
 function drawChart() {
  const texture = people[0].screen;
  if (!texture) return;
  const ctx = (texture.image as HTMLCanvasElement).getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = "#1E1F26"; ctx.fillRect(0, 0, 256, 176);
  ctx.fillStyle = "#FFBF00";
  BARS.forEach((h, i) => { const v = h * (.62 + .38 * (.5 + .5 * Math.sin(time * 1.7 + i * 1.25))); ctx.fillRect(34 + i * 40, 150 - v, 24, v); });
  ctx.fillStyle = "#5C5850"; ctx.fillRect(24, 152, 208, 2);
  texture.needsUpdate = true;
 }

 // ---------- Per-person motion ----------
 function update(k: number, dt: number) {
  const rig = people[k], p = pose[k];
  const te = enterAt < 0 ? -1 : instant ? 99 : time - enterAt - k * STAGGER;
  const stand = STAND[k];
  let x = OFF, yaw = Math.PI / 2, walk = 0, distance = 0;
  if (te >= 0) {
   const a = clamp01(te / WALK);
   x = OFF + (stand - OFF) * (1 - (1 - a) ** 2);
   walk = a < 1 ? Math.min(1, (1 - a) * 5) : 0;
   yaw = Math.PI / 2 + (FACE - Math.PI / 2) * smooth(clamp01((te - WALK * .8) / TURN));
   distance = x - OFF;
  }
  rig.root.position.x = x;
  rig.root.rotation.y = yaw;

  const phase = distance / .52 * Math.PI;
  const stride = Math.sin(phase) * walk;
  rig.legL.joint.rotation.x = -stride * .5;
  rig.legR.joint.rotation.x = stride * .5;
  rig.legL.mid.rotation.x = Math.max(0, Math.sin(phase - 1)) * .75 * walk;
  rig.legR.mid.rotation.x = Math.max(0, -Math.sin(phase - 1)) * .75 * walk;
  rig.pelvis.position.y = .95 - .012 * walk + Math.abs(Math.sin(phase)) * .02 * walk;
  rig.torso.scale.y = 1 + Math.sin(time * 1.7 + k) * .007;
  rig.pelvis.rotation.z = Math.sin(time * .55 + k * 1.3) * .012 * (1 - walk);

  // Weights, eased so every change of pose blends.
  const settled = te > WALK + TURN;
  const waving = te > WALK + TURN * .5 && te < WALK + TURN * .5 + WAVE ? 1 : 0;
  p.wave += (waving - p.wave) * (1 - Math.exp(-dt * 7));
  p.talk += ((speaker === k && settled ? 1 : 0) - p.talk) * (1 - Math.exp(-dt * 5));
  const fidget = settled ? bump((time + k * 2.3) % 9, 4.4, 7.2) * (1 - p.talk) * (1 - p.wave) : 0;

  // Right arm: walk swing / rest, then the person's own action, then talking, then the wave.
  let jx = stride * .35, jz = -.07, ex = -.08, ez = 0;
  if (k === 1) { jx = lerp(jx, -.6, fidget); jz = lerp(jz, .4, fidget); ex = lerp(ex, -1.22 + Math.sin(time * 14) * .06, fidget); }
  if (k === 3) { jx = lerp(jx, -.55, fidget); jz = lerp(jz, .36, fidget); ex = lerp(ex, -1.5, fidget); }
  jx = lerp(jx, -.55, p.talk); jz = lerp(jz, -.3, p.talk); ex = lerp(ex, -1.25 + Math.sin(time * 5.5) * .2, p.talk);
  jx = lerp(jx, 0, p.wave); jz = lerp(jz, -2.05, p.wave); ex = lerp(ex, 0, p.wave); ez = lerp(ez, -1 + Math.sin(time * 10) * .34, p.wave);
  rig.armR.joint.rotation.set(jx, 0, jz);
  rig.armR.mid.rotation.set(ex, 0, ez);

  // Left arm: holds its prop, or swings and rests (the briefcase sways a little).
  if (rig.hold) {
   rig.armL.joint.quaternion.setFromEuler(rig.hold.joint);
   rig.armL.mid.rotation.x = rig.hold.elbow;
  } else {
   rig.armL.joint.rotation.set(-stride * .35 + (k === 3 ? Math.sin(time * 1.1) * .035 : 0), 0, .07);
   rig.armL.mid.rotation.x = -.08;
  }

  // Head: a slow look around, a glance at their own thing, the viewer while talking or waving.
  const [gx, gy] = GLANCE[k];
  let hx = gx * fidget, hy = Math.sin(time * .42 + k * 1.9) * .22 * (1 - fidget) + gy * fidget, hz = 0;
  hx = lerp(hx, .03 + Math.sin(time * 3.4) * .05, p.talk); hy = lerp(hy, -FACE * .8, p.talk);
  hx = lerp(hx, -.06, p.wave); hy = lerp(hy, -FACE * .6, p.wave); hz = lerp(hz, Math.sin(time * 2.2) * .08, p.wave);
  const blend = 1 - Math.exp(-dt * 8);
  rig.head.rotation.x += (hx - rig.head.rotation.x) * blend;
  rig.head.rotation.y += (hy - rig.head.rotation.y) * blend;
  rig.head.rotation.z += (hz - rig.head.rotation.z) * blend;
 }

 // ---------- Drawing: one scissored viewport per tile (tile i shows person order[i]) ----------
 function draw(order = [0, 1, 2, 3]) {
  renderer.setScissorTest(false);
  renderer.setClearColor(0x000000, 0);
  renderer.clear();
  if (!tiles.length) return;
  renderer.setScissorTest(true);
  renderer.setClearColor(C.paper, 1);
  leds.forEach((led, k) => { led.visible = Math.sin(time * (2.1 + k * .63) + k * 1.7) > -.25; });
  const f = (time * .9) % 1;
  tiles.forEach((tile, i) => {
   const k = order[i];
   const y = height - tile.y - tile.h;
   renderer.setViewport(tile.x, y, tile.w, tile.h);
   renderer.setScissor(tile.x, y, tile.w, tile.h);
   renderer.clear();
   people.forEach((rig, j) => { rig.root.visible = j === k; });
   rack.visible = k === 2;
   const talk = pose[k].talk;
   spot.position.x = ripple.position.x = STAND[k];
   spot.scale.setScalar(1 + talk * .05 * Math.sin(time * 6));
   ripple.visible = talk > .02;
   ripple.scale.setScalar(1 + f * .75);
   rippleMaterial.opacity = (1 - f) * .6 * talk;
   blobMesh.position.x = people[k].root.position.x;
   renderer.render(scene, camera);
  });
 }

 // ---------- Loop, sizing, adaptive quality ----------
 let raf = 0, running = false, last = 0, first = true;
 const gaps: number[] = [];
 const firstFrame = () => { if (first) { first = false; options.onFirstFrame?.(); } };
 function frame(now: number) {
  raf = requestAnimationFrame(frame);
  const dt = Math.min(.05, last ? (now - last) / 1000 : 1 / 60);
  last = now;
  time += dt;
  for (let k = 0; k < COUNT; k++) update(k, dt);
  if (time - chartAt > .08) { chartAt = time; drawChart(); }
  draw();
  firstFrame();
  gaps.push(dt);
  if (gaps.length >= 90) {
   const average = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
   gaps.length = 0;
   if (average > 1 / 42 && dpr > 1) { dpr = Math.max(1, dpr - .25); renderer.setPixelRatio(dpr); renderer.setSize(width, height, false); }
  }
 }

 const lost = (event: Event) => { event.preventDefault(); stop(); options.onLost?.(); };
 canvas.addEventListener("webglcontextlost", lost);
 function start() { if (running) return; running = true; last = 0; raf = requestAnimationFrame(frame); }
 function stop() { running = false; cancelAnimationFrame(raf); }

 return {
  setLayout(next, w, h) {
   tiles = next;
   width = Math.max(1, Math.round(w)); height = Math.max(1, Math.round(h));
   renderer.setSize(width, height, false);
   frameCamera();
   if (!running) { for (let k = 0; k < COUNT; k++) update(k, .1); draw(); firstFrame(); }
  },
  enter(skipWalk = false) { if (enterAt >= 0) return; enterAt = time; instant = skipWalk; },
  setSpeaker(index) { speaker = index; },
  start,
  stop,
  dispose() { stop(); canvas.removeEventListener("webglcontextlost", lost); disposeScene(scene, renderer, textures); },
  // One person standing at ease, centred, at a fixed size: the homepage posters
  // (scripts/capture-home-posters.mjs) for no-JS, reduced motion and no WebGL.
  // `close` frames the head and shoulders (used to check faces).
  snapshot(index, w, h, close = false) {
   const keep = { tiles, width, height, dpr, enterAt, instant, speaker, time, running };
   stop();
   renderer.setPixelRatio(1);
   enterAt = 0; instant = true; speaker = -1;
   time = 1 - index * 2.3;   // outside the person's own action, so they stand at ease
   tiles = [{ x: 0, y: 0, w, h }]; width = w; height = h;
   renderer.setSize(w, h, false);
   frameCamera(true);
   if (close) { camera.position.set(.06, 1.66, .95); camera.lookAt(0, 1.6, 0); camera.updateMatrixWorld(); }
   pose.forEach(p => { p.talk = 0; p.wave = 0; });
   for (let step = 0; step < 40; step++) update(index, .05);
   draw([index]);
   const url = canvas.toDataURL("image/png");
   ({ tiles, width, height, dpr, enterAt, instant, speaker, time } = keep);
   renderer.setPixelRatio(dpr);
   renderer.setSize(width, height, false);
   frameCamera();
   if (keep.running) start(); else draw();
   return url;
  },
 };
}
