// Real-time 3D people for the Examples story on /who-we-help (three.js, loaded lazily by
// components/who-examples.tsx). The figures themselves live in who-figures.ts.
// Scroll progress drives the story (timings in who-story.ts): each person walks in, turns to the
// card, and points at the card row being explained; the page measures the rows and passes their
// positions in canvas pixels via setTargets, so the hand aims at the real row.
import * as THREE from "three";
import { canvasTexture, clamp01, disposeScene, dotTexture, range, smooth } from "@/components/scene-kit";
import { buildPerson, buildRack, C, makeMaterials, type Rig } from "@/components/who-figures";
import { PEOPLE, STORY, storyAt } from "@/components/who-story";

export type PeopleScene = {
 setProgress(progress: number, jump?: boolean): void;
 setTargets(targets: Array<[number, number]> | null): void;
 resize(width: number, height: number): void;
 start(): void;
 stop(): void;
 dispose(): void;
 snapshot(chapter: number, width: number, height: number): string;
};

type Options = { onFirstFrame?: () => void; onLost?: () => void; mobile?: boolean };
const DOWN = new THREE.Vector3(0, -1, 0);
// ---------- Scene ----------
export function createPeopleScene(canvas: HTMLCanvasElement, options: Options = {}): PeopleScene {
 const mobile = Boolean(options.mobile);
 const shadows = !mobile;
 const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
 renderer.setClearColor(C.paper, 1);
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
 const flat = (color: number, extra: THREE.MeshBasicMaterialParameters = {}) => new THREE.MeshBasicMaterial({ color, toneMapped: false, ...extra });
 const m = makeMaterials();

 // Floor: the dotted paper; a gold ring marks where each person stands.
 const dots = dotTexture(renderer);
 dots.repeat.set(30 / .3, 30 / .3);
 textures.push(dots);
 const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), flat(0xffffff, { map: dots }));
 floor.rotation.x = -Math.PI / 2;
 scene.add(floor);
 if (shadows) {
  const catcher = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.ShadowMaterial({ opacity: .16 }));
  catcher.rotation.x = -Math.PI / 2;
  catcher.position.y = .002;
  catcher.receiveShadow = true;
  scene.add(catcher);
 }
 const spot = new THREE.Mesh(new THREE.TorusGeometry(.36, .006, 6, 72), flat(C.gold));
 spot.rotation.x = Math.PI / 2;
 spot.position.y = .004;
 scene.add(spot);
 const blob = canvasTexture(128, 128, ctx => {
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(11,12,16,.32)"); gradient.addColorStop(1, "rgba(11,12,16,0)");
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 128, 128);
 });
 textures.push(blob);
 const blobMesh = new THREE.Mesh(new THREE.PlaneGeometry(.7, .5), flat(0xffffff, { map: blob, transparent: true, depthWrite: false }));
 blobMesh.rotation.x = -Math.PI / 2;
 blobMesh.position.y = .003;
 blobMesh.visible = !shadows;
 scene.add(blobMesh);

 const people = Array.from({ length: PEOPLE }, (_, k) => buildPerson(k, m, textures, shadows));
 people.forEach(rig => { rig.root.visible = false; scene.add(rig.root); });

 // The managed IT provider's server rack, with blinking gold LEDs.
 const { rack, leds } = buildRack(m, shadows);
 people[2].leds.push(...leds);
 scene.add(rack);

 // ---------- Layout (depends on the canvas shape) ----------
 const layout = { standX: 0, offLeft: -3, yaw: 1, lookY: .98 };
 let width = 1, height = 1;
 function frameCamera() {
  const aspect = width / height;
  const compact = aspect > 1.05;               // phones: person above the card, bubble beside them
  const visible = compact ? 2.25 : 2.95;        // world height in view (room above the head for the bubble)
  const halfWidth = visible / 2 * aspect;
  camera.aspect = aspect;
  camera.fov = 30;
  camera.updateProjectionMatrix();
  const distance = visible / 2 / Math.tan(THREE.MathUtils.degToRad(15));
  layout.standX = compact ? -halfWidth * .5 : -halfWidth * .14;
  layout.offLeft = -halfWidth - .8;
  layout.yaw = compact ? .45 : .5;             // turned enough to point at the card, with the face still visible
  layout.lookY = compact ? 1 : 1.18;
  camera.position.set(.15, layout.lookY + .22, distance);
  camera.lookAt(0, layout.lookY, 0);
  camera.updateMatrixWorld();
  spot.position.x = layout.standX;
  rack.position.set(layout.standX - .62, 0, -.32);
 }

 // ---------- Pointing ----------
 let targets: Array<[number, number]> | null = null;
 const shoulder = new THREE.Vector3(), camRight = new THREE.Vector3(), camUp = new THREE.Vector3(), camBack = new THREE.Vector3();
 const aim = new THREE.Vector3(), torsoQuat = new THREE.Quaternion(), qPoint = new THREE.Quaternion(), qRest = new THREE.Quaternion(), euler = new THREE.Euler();
 function pointAt(rig: Rig, row: number, out: THREE.Quaternion) {
  rig.armR.joint.getWorldPosition(shoulder);
  const projected = shoulder.clone().project(camera);
  const sx = (projected.x + 1) / 2 * width, sy = (1 - projected.y) / 2 * height;
  const [tx, ty] = targets?.[row] ?? [width * 1.3, sy + (row - 1) * height * .08];
  const dx = tx - sx, dy = ty - sy;
  camRight.setFromMatrixColumn(camera.matrixWorld, 0);
  camUp.setFromMatrixColumn(camera.matrixWorld, 1);
  camBack.setFromMatrixColumn(camera.matrixWorld, 2);
  aim.copy(camRight).multiplyScalar(dx).addScaledVector(camUp, -dy).addScaledVector(camBack, Math.hypot(dx, dy) * .3).normalize();
  rig.torso.getWorldQuaternion(torsoQuat);
  aim.applyQuaternion(torsoQuat.invert());
  out.setFromUnitVectors(DOWN, aim);
  return { dy, reach: dx };
 }

 // ---------- Per-frame update ----------
 let shown = 0, target = 0, time = 0;
 function update(p: number, dt: number) {
  const story = storyAt(p);
  people.forEach((rig, k) => { rig.root.visible = k === story.chapter; });
  rack.visible = story.chapter === 2;
  const rig = people[story.chapter];
  const { local, last } = story;

  // Walk in from the left, turn to the card; walk off left before the next person.
  const arriving = range(local, 0, STORY.arrive);
  const turningOut = last ? 0 : range(local, STORY.leave, STORY.leave + .02);
  const leaving = last ? 0 : range(local, STORY.leave + .02, 1);
  let x: number, yaw: number, walk = 0, distance: number;
  if (turningOut > 0) {
   x = layout.standX + (layout.offLeft - layout.standX) * leaving * leaving;
   yaw = layout.yaw + (-Math.PI / 2 - layout.yaw) * smooth(turningOut);
   walk = leaving > 0 && leaving < 1 ? Math.min(1, leaving * 6) : 0;
   distance = layout.standX - x;
  } else {
   const eased = 1 - (1 - arriving) ** 2;
   x = layout.offLeft + (layout.standX - layout.offLeft) * eased;
   yaw = Math.PI / 2 + (layout.yaw - Math.PI / 2) * smooth(range(local, STORY.arrive * .75, STORY.arrive + .05));
   walk = arriving < 1 ? Math.min(1, (1 - arriving) * 5) : 0;
   distance = x - layout.offLeft;
  }
  rig.root.position.set(x, 0, 0);
  rig.root.rotation.y = yaw;
  blobMesh.position.x = x;

  const phase = distance / .52 * Math.PI;
  const stride = Math.sin(phase) * walk;
  rig.legL.joint.rotation.x = -stride * .5;
  rig.legR.joint.rotation.x = stride * .5;
  rig.legL.mid.rotation.x = Math.max(0, Math.sin(phase - 1)) * .75 * walk;
  rig.legR.mid.rotation.x = Math.max(0, -Math.sin(phase - 1)) * .75 * walk;
  rig.pelvis.position.y = .95 - .012 * walk + Math.abs(Math.sin(phase)) * .02 * walk;
  // Breathing and a slight weight shift when standing.
  rig.torso.scale.y = 1 + Math.sin(time * 1.7) * .007;
  rig.pelvis.rotation.z = Math.sin(time * .55) * .012 * (1 - walk);

  const blend = 1 - Math.exp(-dt * 9);
  // Right arm: swing while walking, a presenting gesture for the intro, then point at each row.
  const presenting = walk === 0 && story.line === 0;
  if (walk === 0 && story.row >= 0) {
   const { dy } = pointAt(rig, story.row, qPoint);
   rig.armR.joint.quaternion.slerp(qPoint, blend);
   rig.armR.mid.rotation.x += (-.12 - rig.armR.mid.rotation.x) * blend;
   rig.head.rotation.y += (.45 - rig.head.rotation.y) * blend;
   rig.head.rotation.x += (clamp01(dy / height + .3) * .45 - rig.head.rotation.x) * blend;
  } else if (presenting) {
   pointAt(rig, 0, qPoint);
   qRest.setFromEuler(euler.set(0, 0, -.07));
   qPoint.slerp(qRest, .45);
   rig.armR.joint.quaternion.slerp(qPoint, blend);
   rig.armR.mid.rotation.x += (-.5 - rig.armR.mid.rotation.x) * blend;
   rig.head.rotation.y += (.3 - rig.head.rotation.y) * blend;
   rig.head.rotation.x += (0 - rig.head.rotation.x) * blend;
  } else {
   qRest.setFromEuler(euler.set(stride * .35, 0, -.07));
   rig.armR.joint.quaternion.slerp(qRest, walk ? .5 : blend);
   rig.armR.mid.rotation.x += (-.08 - rig.armR.mid.rotation.x) * blend;
   rig.head.rotation.y += (0 - rig.head.rotation.y) * blend;
   rig.head.rotation.x += (0 - rig.head.rotation.x) * blend;
  }
  // Left arm: holds its prop, or swings and rests.
  if (rig.hold) {
   rig.armL.joint.quaternion.setFromEuler(rig.hold.joint);
   rig.armL.mid.rotation.x = rig.hold.elbow;
  } else {
   qRest.setFromEuler(euler.set(-stride * .35, 0, .07));
   rig.armL.joint.quaternion.slerp(qRest, walk ? .5 : blend);
   rig.armL.mid.rotation.x += (-.08 - rig.armL.mid.rotation.x) * blend;
  }
  // The rack's LEDs blink.
  rig.leds.forEach((led, k) => { led.visible = Math.sin(time * (2.1 + k * .63) + k * 1.7) > -.25; });

  camera.position.x = .15 + Math.sin(time * .25) * .03;
  camera.lookAt(0, layout.lookY, 0);
 }

 // ---------- Loop, sizing, adaptive quality ----------
 let raf = 0, running = false, last = 0, first = true;
 const gaps: number[] = [];
 function frame(now: number) {
  raf = requestAnimationFrame(frame);
  const dt = Math.min(.05, last ? (now - last) / 1000 : 1 / 60);
  last = now;
  time += dt;
  shown += (target - shown) * (1 - Math.exp(-dt * 8));
  update(shown, dt);
  renderer.render(scene, camera);
  if (first) { first = false; options.onFirstFrame?.(); }
  gaps.push(dt);
  if (gaps.length >= 90) {
   const average = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
   gaps.length = 0;
   if (average > 1 / 42 && dpr > 1) { dpr = Math.max(1, dpr - .25); renderer.setPixelRatio(dpr); }
  }
 }
 const settle = (p: number) => { for (let k = 0; k < 40; k++) update(p, .1); };

 function resize(w: number, h: number) {
  width = Math.max(1, Math.round(w)); height = Math.max(1, Math.round(h));
  renderer.setSize(width, height, false);
  frameCamera();
  if (!running) { settle(shown); renderer.render(scene, camera); }
 }

 const lost = (event: Event) => { event.preventDefault(); stop(); options.onLost?.(); };
 canvas.addEventListener("webglcontextlost", lost);
 function start() { if (running) return; running = true; last = 0; raf = requestAnimationFrame(frame); }
 function stop() { running = false; cancelAnimationFrame(raf); }

 return {
  setProgress(progress, jump = false) { target = clamp01(progress); if (jump) { shown = target; settle(shown); } },
  setTargets(next) { targets = next; },
  resize,
  start,
  stop,
  dispose() { stop(); canvas.removeEventListener("webglcontextlost", lost); disposeScene(scene, renderer, textures); },
  // Renders one person mid-explanation (pointing at a row) at a fixed size; used for the posters.
  snapshot(chapter, w, h) {
   const keep = { width, height, dpr, shown, target, targets };
   renderer.setPixelRatio(1);
   targets = null;
   resize(w, h);
   shown = target = (chapter + .5) / PEOPLE;
   settle(shown);
   renderer.render(scene, camera);
   const url = canvas.toDataURL("image/png");
   renderer.setPixelRatio(keep.dpr);
   ({ shown, target, targets } = keep);
   resize(keep.width, keep.height);
   return url;
  },
 };
}
