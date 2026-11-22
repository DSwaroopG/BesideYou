// Real-time 3D flight scene for /why-besideyou (three.js). Loaded lazily by
// components/offer-flight.tsx when the section approaches the viewport, never on first paint.
//
// Story: two grey planes (the usual retainer) circle a holding stack over a beacon, forever, on time.
// Our white plane with a gold tail flies one route: guided in by approach lights, it lands, follows
// the gold lead-in line to its gate and the jet bridge connects. The arrivals board on the terminal
// flips our flight from "On approach" to "Landed" while the retainer stays "Holding".
// Look: a white-clay architectural model of an airport on the brand's dotted paper. Unlit ground
// pieces are not tone mapped so brand colours stay exact; buildings, planes, trees and clouds are lit.
// Desktop gets real soft shadows; phones get cheap blob shadows under the planes instead.
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { canvasTexture, clamp01, disposeScene, freeze, range, seeded, smooth, v3 } from "@/components/scene-kit";

export type FlightScene = {
 setProgress(progress: number, jump?: boolean): void;
 resize(width: number, height: number): void;
 start(): void;
 stop(): void;
 dispose(): void;
 snapshot(progress: number, width: number, height: number): string;
};

type Options = { onFirstFrame?: () => void; onLost?: () => void; mobile?: boolean };

const C = {
 paper: 0xf4f2ed, card: 0xfbfaf7, tint: 0xece7dd, apron: 0xefebe3, taxi: 0xe6e1d6, rule: 0xd6d2c9,
 ink: 0x0b0c10, ink30: 0x8c877d, ink45: 0x5c5850, grey: 0xb9b4aa, gold: 0xffbf00, glass: 0x4a4d59,
};


// ---------- Geometry helpers ----------
function slab(points: Array<[number, number]>, depth: number) {
 const shape = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));
 const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: depth * .3, bevelSize: Math.min(.025, depth * .35), bevelSegments: 2, curveSegments: 1 });
 geometry.translate(0, 0, -depth / 2);
 return geometry;
}

// A flat strip following points on the ground (taxi lines, lead-in lines).
function ribbon(points: THREE.Vector3[], width: number, y: number) {
 const positions: number[] = [], index: number[] = [];
 points.forEach((point, i) => {
  const a = points[Math.max(0, i - 1)], b = points[Math.min(points.length - 1, i + 1)];
  const length = Math.hypot(b.x - a.x, b.z - a.z) || 1;
  const nx = -(b.z - a.z) / length * width / 2, nz = (b.x - a.x) / length * width / 2;
  positions.push(point.x + nx, y, point.z + nz, point.x - nx, y, point.z - nz);
  if (i > 0) { const k = i * 2; index.push(k - 2, k - 1, k, k - 1, k + 1, k); }
 });
 const geometry = new THREE.BufferGeometry();
 geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
 geometry.setIndex(index);
 geometry.computeVertexNormals();
 return geometry;
}


// ---------- The aircraft ----------
// A stylised airliner, nose along +Z (so its left side is +X). Centre sits 0.82 above wheel bottoms.
const GROUND_HEIGHT = .82;
type Paint = { body: THREE.Material; tail: THREE.Material; trim: THREE.Material; dark: THREE.Material; edge: THREE.LineBasicMaterial; livery?: THREE.Texture; logo?: THREE.Texture };



function buildPlane(paint: Paint, shadows: boolean) {
 const plane = new THREE.Group();
 const add = (geometry: THREE.BufferGeometry, material: THREE.Material, outline = false, parent: THREE.Object3D = plane) => {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = shadows;
  if (outline) mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 25), paint.edge));
  parent.add(mesh);
  return mesh;
 };

 const profile = new THREE.SplineCurve([
  new THREE.Vector2(0, -2.3), new THREE.Vector2(.09, -2.17), new THREE.Vector2(.23, -1.6), new THREE.Vector2(.33, -.8),
  new THREE.Vector2(.34, .95), new THREE.Vector2(.3, 1.62), new THREE.Vector2(.18, 2.06), new THREE.Vector2(0, 2.28),
 ]).getPoints(44).map(point => new THREE.Vector2(Math.max(0, point.x), point.y));
 const fuselage = new THREE.LatheGeometry(profile, 32);
 fuselage.rotateX(Math.PI / 2);
 add(fuselage, paint.body);

 for (const side of [1, -1]) {
  // Swept wing with slight dihedral; winglet, flap line and nav light ride with it.
  const wingGroup = new THREE.Group();
  wingGroup.position.set(0, -.2, .1);
  wingGroup.rotation.z = .06 * side;
  plane.add(wingGroup);
  const wing = slab([[.25 * side, .75], [2.35 * side, -.25], [2.35 * side, -.62], [.25 * side, -.35]], .07);
  wing.rotateX(Math.PI / 2);
  add(wing, paint.body, true, wingGroup);
  const winglet = slab([[0, 0], [.06, .42], [.26, .42], [.4, 0]], .04);
  winglet.rotateY(-Math.PI / 2);
  add(winglet, paint.trim, true, wingGroup).position.set(2.33 * side, .03, -.62);
  const flap = add(new THREE.BoxGeometry(2, .012, .03), paint.dark, false, wingGroup);
  flap.position.set(1.3 * side, .058, -.47);
  flap.rotation.y = .128 * side;
  add(new THREE.SphereGeometry(.045, 10, 8), paint.trim, false, wingGroup).position.set(2.37 * side, 0, -.42);
  // Flap-track fairings under the trailing edge.
  for (const fx of [.85, 1.35, 1.85]) {
   const fairing = add(new THREE.SphereGeometry(.05, 10, 8), paint.body, false, wingGroup);
   fairing.scale.set(.9, .8, 3.4);
   fairing.position.set(fx * side, -.075, -.38 - (fx - .25) / 2.1 * .27);
  }

  const stab = slab([[.08 * side, .22], [1.05 * side, -.22], [1.05 * side, -.48], [.08 * side, -.34]], .05);
  stab.rotateX(Math.PI / 2);
  add(stab, paint.body, true).position.set(0, .08, -1.86);

  // Engine: nacelle, dark intake, spinner, exhaust and pylon.
  const nacelle = new THREE.CylinderGeometry(.15, .13, .72, 24);
  nacelle.rotateX(Math.PI / 2);
  add(nacelle, paint.body).position.set(1.05 * side, -.4, .55);
  const intake = new THREE.CylinderGeometry(.122, .122, .03, 24);
  intake.rotateX(Math.PI / 2);
  add(intake, paint.dark).position.set(1.05 * side, -.4, .905);
  add(new THREE.TorusGeometry(.136, .016, 8, 28), paint.trim).position.set(1.05 * side, -.4, .915);
  const spinner = new THREE.ConeGeometry(.045, .09, 12);
  spinner.rotateX(Math.PI / 2);
  add(spinner, paint.body).position.set(1.05 * side, -.4, .93);
  const exhaust = new THREE.CylinderGeometry(.075, .095, .1, 20);
  exhaust.rotateX(Math.PI / 2);
  add(exhaust, paint.dark).position.set(1.05 * side, -.4, .16);
  add(new THREE.BoxGeometry(.05, .16, .42), paint.body).position.set(1.05 * side, -.27, .48);

  // Cabin windows and doors.
  for (let k = 0; k < 10; k++) add(new THREE.BoxGeometry(.02, .06, .08), paint.dark).position.set(.336 * side, .08, -1 + k * .24);
  add(new THREE.BoxGeometry(.016, .3, .15), paint.dark).position.set(.327 * side, 0, 1.42);
  add(new THREE.BoxGeometry(.016, .28, .14), paint.dark).position.set(.29 * side, 0, -1.25);

  // Livery on the upper fuselage: a flat decal tangent to the surface 35 degrees above the side.
  if (paint.livery) {
   const angle = THREE.MathUtils.degToRad(35);
   const decal = new THREE.Mesh(new THREE.PlaneGeometry(1.5, .16), new THREE.MeshStandardMaterial({ map: paint.livery, transparent: true, roughness: .6, polygonOffset: true, polygonOffsetFactor: -2 }));
   decal.rotation.set(0, side * Math.PI / 2, 0);
   decal.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), side * angle);
   decal.position.set(side * (.34 * Math.cos(angle) + .012), .34 * Math.sin(angle) + .008, .05);
   plane.add(decal);
  }
 }

 const fin = slab([[-1.2, .2], [-1.92, 1.18], [-2.2, 1.18], [-2.26, .14]], .06);
 fin.rotateY(-Math.PI / 2);
 add(fin, paint.tail, true);

 const shield = add(new THREE.BoxGeometry(.36, .09, .22), paint.dark);
 shield.position.set(0, .16, 1.82);
 shield.rotation.x = .45;
 for (const x of [-.07, 0, .07]) { const mullion = add(new THREE.BoxGeometry(.012, .1, .232), paint.body); mullion.position.set(x, .162, 1.82); mullion.rotation.x = .45; }
 add(new THREE.BoxGeometry(.012, .09, .14), paint.dark).position.set(0, .375, .5);                     // antenna
 add(new THREE.SphereGeometry(.03, 10, 8), paint.trim).position.set(0, .345, -.1);                   // top beacon
 add(new THREE.SphereGeometry(.03, 10, 8), paint.trim).position.set(0, -.345, .2);                   // belly beacon
 add(new THREE.CylinderGeometry(.03, .045, .06, 12).rotateX(Math.PI / 2), paint.dark).position.set(0, 0, -2.28); // tail exhaust

 if (paint.livery) {
  // Gold cheatline with an ink pinstripe below it, hugging the cabin on both sides.
  for (const [start, length, material] of [[1.47, .09, paint.trim], [1.425, .022, paint.dark]] as const) for (const mirror of [false, true]) {
   const strip = new THREE.CylinderGeometry(.3445, .3445, 1.75, 6, 1, true, mirror ? Math.PI * 2 - start - length : start, length);
   strip.rotateX(Math.PI / 2);
   strip.translate(0, 0, .075);
   add(strip, material);
  }
 }
 if (paint.logo) {
  // Logo on a white roundel, both sides of the gold fin.
  const roundel = new THREE.MeshStandardMaterial({ map: paint.logo, roughness: .5, polygonOffset: true, polygonOffsetFactor: -2 });
  for (const side of [1, -1]) {
   const disc = new THREE.Mesh(new THREE.CircleGeometry(.22, 32), roundel);
   disc.rotation.y = side * Math.PI / 2;
   disc.position.set(side * .052, .63, -1.87);
   plane.add(disc);
  }
 }

 // Landing gear: groups scale on Y from the attach point (0 = retracted). Mains have twin wheels.
 const gear: THREE.Group[] = [];
 for (const [x, z, twin] of [[0, 1.4, false], [.5, -.05, true], [-.5, -.05, true]] as const) {
  const leg = new THREE.Group();
  const strut = new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, .46, 8), paint.dark);
  strut.position.y = -.23;
  leg.add(strut);
  for (const offset of twin ? [-.07, .07] : [0]) {
   const wheel = new THREE.CylinderGeometry(.1, .1, .07, 16);
   wheel.rotateZ(Math.PI / 2);
   const wheelMesh = new THREE.Mesh(wheel, paint.dark);
   wheelMesh.position.set(offset, -.46, 0);
   leg.add(wheelMesh);
  }
  leg.position.set(x, -.26, z);
  plane.add(leg);
  gear.push(leg);
 }
 return { plane: freeze(plane, shadows, gear), gear };
}

// ---------- Ground vehicles (forward is +Z, built at the origin, then frozen) ----------
type Kit = { clay: THREE.Material; glass: THREE.Material; dark: THREE.Material; gold: THREE.Material; tint: THREE.Material };
type Vehicle = "tractor" | "cart" | "fuel" | "catering" | "loader" | "tug";
function vehicle(kind: Vehicle, kit: Kit, shadows: boolean) {
 const group = new THREE.Group();
 const part = (geometry: THREE.BufferGeometry, material: THREE.Material, x: number, y: number, z: number, rx = 0) => {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z); mesh.rotation.x = rx;
  group.add(mesh);
 };
 const wheels = (halfWidth: number, zs: number[], r = .07) => { for (const z of zs) for (const x of [-halfWidth, halfWidth]) part(new THREE.CylinderGeometry(r, r, .05, 12).rotateZ(Math.PI / 2), kit.dark, x, r, z); };
 const cab = (z: number, y: number) => { part(new THREE.BoxGeometry(.42, .32, .36), kit.clay, 0, y, z); part(new THREE.BoxGeometry(.38, .11, .02), kit.glass, 0, y + .06, z + .185); };
 if (kind === "tractor") {
  part(new THREE.BoxGeometry(.36, .2, .55), kit.clay, 0, .17, 0); part(new THREE.BoxGeometry(.3, .2, .22), kit.glass, 0, .37, -.1);
  part(new THREE.BoxGeometry(.08, .04, .08), kit.gold, 0, .49, -.1); wheels(.19, [-.18, .18]);
 } else if (kind === "cart") {
  part(new THREE.BoxGeometry(.4, .05, .6), kit.dark, 0, .13, 0);
  part(new THREE.BoxGeometry(.16, .14, .2), kit.tint, -.09, .23, -.15); part(new THREE.BoxGeometry(.16, .12, .18), kit.gold, .1, .22, -.12); part(new THREE.BoxGeometry(.3, .16, .22), kit.clay, 0, .24, .14);
  wheels(.19, [-.2, .2], .055);
 } else if (kind === "fuel") {
  part(new THREE.BoxGeometry(.44, .1, 1.5), kit.dark, 0, .14, 0); cab(.55, .36);
  part(new THREE.CylinderGeometry(.21, .21, 1, 20).rotateX(Math.PI / 2), kit.clay, 0, .42, -.22);
  for (const z of [-.52, .08]) part(new THREE.CylinderGeometry(.216, .216, .06, 20).rotateX(Math.PI / 2), kit.gold, 0, .42, z);
  wheels(.22, [-.55, -.25, .5]);
 } else if (kind === "catering") {
  part(new THREE.BoxGeometry(.44, .1, 1.3), kit.dark, 0, .14, 0); cab(.48, .34);
  for (const rx of [-.6, .6]) for (const x of [-.15, .15]) part(new THREE.BoxGeometry(.03, .62, .03), kit.dark, x, .5, -.22, rx);
  part(new THREE.BoxGeometry(.48, .4, .8), kit.clay, 0, .96, -.22); part(new THREE.BoxGeometry(.485, .05, .805), kit.gold, 0, .82, -.22);
  wheels(.22, [-.45, .45]);
 } else if (kind === "loader") {
  part(new THREE.BoxGeometry(.32, .14, .8), kit.clay, 0, .15, 0); part(new THREE.BoxGeometry(.2, .03, 1.15), kit.dark, 0, .45, .12, -.42);
  part(new THREE.BoxGeometry(.04, .08, 1.1), kit.gold, .12, .47, .12, -.42); wheels(.17, [-.25, .25]);
 } else {
  part(new THREE.BoxGeometry(.52, .16, .72), kit.tint, 0, .15, 0); part(new THREE.BoxGeometry(.26, .16, .2), kit.glass, 0, .31, -.18);
  part(new THREE.BoxGeometry(.06, .04, .06), kit.gold, 0, .41, -.18); wheels(.27, [-.22, .22]);
 }
 return freeze(group, shadows);
}

// Holding pattern: a racetrack in the air. Returns a point for a 0..1 position along it.
function racetrack(center: THREE.Vector3, straight: number, radius: number) {
 const half = straight / 2;
 const perimeter = 2 * straight + 2 * Math.PI * radius;
 return (t: number, out = new THREE.Vector3()) => {
  let s = ((t % 1) + 1) % 1 * perimeter;
  if (s < straight) return out.set(center.x - half + s, center.y, center.z + radius);
  s -= straight;
  if (s < Math.PI * radius) { const a = Math.PI / 2 - s / radius; return out.set(center.x + half + Math.cos(a) * radius, center.y, center.z + Math.sin(a) * radius); }
  s -= Math.PI * radius;
  if (s < straight) return out.set(center.x + half - s, center.y, center.z - radius);
  s -= straight;
  const a = -Math.PI / 2 - s / radius;
  return out.set(center.x - half + Math.cos(a) * radius, center.y, center.z + Math.sin(a) * radius);
 };
}

const lookTarget = new THREE.Vector3();
function orient(object: THREE.Object3D, position: THREE.Vector3, tangent: THREE.Vector3, next: THREE.Vector3, gain: number, pitch = 0) {
 object.position.copy(position);
 object.lookAt(lookTarget.copy(position).add(tangent));
 const turn = tangent.x * next.z - tangent.z * next.x;
 object.rotateZ(Math.max(-.5, Math.min(.5, turn * gain)));
 if (pitch) object.rotateX(pitch);
}

// ---------- Scene ----------
export function createFlightScene(canvas: HTMLCanvasElement, options: Options = {}): FlightScene {
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
 scene.fog = new THREE.Fog(C.paper, 80, 230);
 const camera = new THREE.PerspectiveCamera(32, 16 / 9, .5, 560);

 scene.add(new THREE.HemisphereLight(0xffffff, 0xe6e1d6, 1.85));
 const sun = new THREE.DirectionalLight(0xffffff, 2.2);
 sun.position.set(48, 62, -40);
 sun.target.position.set(8, 0, 12);
 scene.add(sun, sun.target);
 if (shadows) {
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -80, right: 80, top: 70, bottom: -70, near: 10, far: 190 });
  sun.shadow.camera.updateProjectionMatrix();
  sun.shadow.bias = -.0004;
  sun.shadow.normalBias = .03;
 }

 const textures: THREE.Texture[] = [];
 const flat = (color: number, extra: THREE.MeshBasicMaterialParameters = {}) => new THREE.MeshBasicMaterial({ color, toneMapped: false, ...extra });
 const clay = new THREE.MeshStandardMaterial({ color: C.card, roughness: .62 });
 const clayTint = new THREE.MeshStandardMaterial({ color: 0xeeeae2, roughness: .8 });
 const glass = new THREE.MeshStandardMaterial({ color: C.glass, roughness: .3, metalness: .2 });
 const post = new THREE.MeshStandardMaterial({ color: C.ink30, roughness: .7 });
 const dark = new THREE.MeshStandardMaterial({ color: C.ink, roughness: .5 });
 const gold = new THREE.MeshStandardMaterial({ color: C.gold, roughness: .45 });
 const edge = new THREE.LineBasicMaterial({ color: C.ink30, transparent: true, opacity: .5, toneMapped: false });
 const buildingEdge = new THREE.LineBasicMaterial({ color: C.ink30, transparent: true, opacity: .32, toneMapped: false });
 const solid = (geometry: THREE.BufferGeometry, material: THREE.Material, x: number, y: number, z: number, outline = false) => {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.castShadow = shadows; mesh.receiveShadow = shadows;
  if (outline) mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 20), buildingEdge));
  scene.add(mesh);
  return mesh;
 };
 const decal = (w: number, d: number, x: number, z: number, color: number, y = .02, factor = -2) => {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, d), flat(color, { polygonOffset: true, polygonOffsetFactor: factor }));
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(x, y, z);
  scene.add(mesh);
  return mesh;
 };

 // ---------- Ground ----------
 const dots = canvasTexture(64, 64, ctx => {
  ctx.fillStyle = "#F4F2ED"; ctx.fillRect(0, 0, 64, 64);
  ctx.fillStyle = "#CFCAC0"; ctx.beginPath(); ctx.arc(32, 32, 3.2, 0, Math.PI * 2); ctx.fill();
 });
 dots.wrapS = dots.wrapT = THREE.RepeatWrapping;
 dots.repeat.set(700 / 2.4, 700 / 2.4);
 dots.anisotropy = renderer.capabilities.getMaxAnisotropy();
 textures.push(dots);
 const ground = new THREE.Mesh(new THREE.PlaneGeometry(700, 700), flat(0xffffff, { map: dots }));
 ground.rotation.x = -Math.PI / 2;
 scene.add(ground);
 if (shadows) {
  const catcher = new THREE.Mesh(new THREE.PlaneGeometry(220, 200), new THREE.ShadowMaterial({ opacity: .13 }));
  catcher.rotation.x = -Math.PI / 2;
  catcher.position.set(10, .05, 12);
  catcher.receiveShadow = true;
  scene.add(catcher);
 }

 // ---------- Runway: x from -18 to 46, centre line on z = 0 ----------
 const RUNWAY = { from: -18, to: 46, width: 7 };
 const mid = (RUNWAY.from + RUNWAY.to) / 2, span = RUNWAY.to - RUNWAY.from;
 decal(span, RUNWAY.width, mid, 0, C.tint, .01, -1);
 for (let x = RUNWAY.from + 9; x < RUNWAY.to - 6; x += 3.2) decal(1.5, .14, x, 0, C.ink);
 for (const end of [RUNWAY.from + 2, RUNWAY.to - 2]) for (let k = 0; k < 8; k++) decal(2.2, .26, end, -2.6 + k * .74, C.ink);
 for (const z of [-3.25, 3.25]) decal(span, .05, mid, z, C.ink30);
 for (const z of [-1.5, 1.5]) decal(3.4, .55, -5, z, C.ink);                                    // aiming points
 for (const x of [-11, -1, 3, 7]) for (const z of [-2.2, -1.75, 1.75, 2.2]) decal(1.4, .16, x, z, C.ink); // touchdown zone

 // Parallel taxiway, a connector and the apron in front of the terminal, with gold guide lines.
 decal(66, 3.2, 15, 9, C.taxi, .012, -1);
 decal(3.2, 4, 0, 5.4, C.taxi, .012, -1);
 decal(42, 15, 29, 19.5, C.apron, .011, -1);
 const goldLine = flat(C.gold, { side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -3 });
 scene.add(new THREE.Mesh(ribbon([v3(-16, 0, 9), v3(48, 0, 9)], .12, .024), goldLine));
 for (const gx of [20, 36]) scene.add(new THREE.Mesh(ribbon([v3(gx, 0, 10.6), v3(gx, 0, 21)], .12, .024), goldLine));
 for (const gx of [20, 28, 36]) decal(1.3, .12, gx, 21.6, C.ink, .024, -3);

 // Lights: runway edge lights sweep gold as we land; approach lights pulse toward the threshold
 // while we are on approach; the PAPI beside the touchdown zone shows two gold, two white.
 const lightBox = new THREE.BoxGeometry(.17, .06, .17);
 const unlit = new THREE.Color(C.rule), lit = new THREE.Color(C.gold), white = new THREE.Color(C.card), matrix = new THREE.Matrix4();
 const EDGE_PAIRS = 16;
 const edgeLights = new THREE.InstancedMesh(lightBox, flat(0xffffff), EDGE_PAIRS * 2);
 for (let k = 0; k < EDGE_PAIRS; k++) for (const [j, z] of [[0, -3.7], [1, 3.7]] as const) {
  edgeLights.setMatrixAt(k * 2 + j, matrix.makeTranslation(RUNWAY.from + 2 + k * 4, .05, z));
  edgeLights.setColorAt(k * 2 + j, unlit);
 }
 scene.add(edgeLights);
 let edgeLit = -1;

 const APPROACH_BARS = 10, BAR_LIGHTS = 5;
 const approachLights = new THREE.InstancedMesh(lightBox, flat(0xffffff), APPROACH_BARS * BAR_LIGHTS);
 const posts: THREE.BufferGeometry[] = [];
 for (let b = 0; b < APPROACH_BARS; b++) for (let l = 0; l < BAR_LIGHTS; l++) {
  const x = RUNWAY.from - 3 - b * 3, z = (l - 2) * .9;
  approachLights.setMatrixAt(b * BAR_LIGHTS + l, matrix.makeTranslation(x, .42, z));
  approachLights.setColorAt(b * BAR_LIGHTS + l, unlit);
  posts.push(new THREE.CylinderGeometry(.018, .018, .38, 6).translate(x, .19, z));
 }
 scene.add(approachLights);
 solid(mergeGeometries(posts), post, 0, 0, 0).castShadow = false;
 for (let k = 0; k < 4; k++) solid(new THREE.BoxGeometry(.38, .26, .3), k < 2 ? gold : clay, -4, .13, -5 - k * .6);

 // Windsock (gold and white bands round the sock) and the localizer antenna array past the far end.
 const sockTexture = canvasTexture(8, 64, ctx => { for (let k = 0; k < 5; k++) { ctx.fillStyle = k % 2 ? "#FBFAF7" : "#FFBF00"; ctx.fillRect(0, k * 12.8, 8, 12.8); } });
 textures.push(sockTexture);
 solid(new THREE.CylinderGeometry(.04, .05, 3.2, 8), dark, 4, 1.6, -8.5);
 const sock = new THREE.Group();
 sock.position.set(4, 3.05, -8.5);
 const sockGeometry = new THREE.CylinderGeometry(.26, .1, 1.6, 16, 1, true);
 sockGeometry.rotateZ(Math.PI / 2);
 sockGeometry.translate(.8, 0, 0);
 const sockMesh = new THREE.Mesh(sockGeometry, new THREE.MeshStandardMaterial({ map: sockTexture, side: THREE.DoubleSide, roughness: .7 }));
 sockMesh.castShadow = shadows;
 sock.add(sockMesh);
 scene.add(sock);
 const antennas: THREE.BufferGeometry[] = [new THREE.BoxGeometry(.08, .08, 8.4).translate(51, 1.2, 0)];
 for (let k = 0; k < 9; k++) antennas.push(new THREE.CylinderGeometry(.035, .035, 1.2, 6).translate(51, .6, -4 + k));
 solid(mergeGeometries(antennas), clayTint, 0, 0, 0);

 // ---------- Buildings ----------
 // Terminal with glass band, roof units and three gates. Ours (x = 28) gets the moving jet bridge.
 solid(new THREE.BoxGeometry(34, 3.4, 7), clay, 29, 1.7, 30.5, true);
 solid(new THREE.BoxGeometry(33.4, 1.05, .08), glass, 29, 1.8, 26.98);
 solid(new THREE.BoxGeometry(35.2, .24, 8.2), clay, 29, 3.52, 30.5, true);
 for (const [x, w] of [[18, 3], [25, 2.2], [33, 3.4], [41, 2.4]] as const) solid(new THREE.BoxGeometry(w, .7, 2.2), clayTint, x, 3.99, 32, true);
 const bridges: THREE.Group[] = [];
 for (const gx of [20, 28, 36]) {
  const bridge = new THREE.Group();
  bridge.position.set(gx + 1.05, 1.35, 26.9);
  const tube = new THREE.BoxGeometry(.8, .8, 1);
  tube.translate(0, 0, -.5);
  const tubeMesh = new THREE.Mesh(tube, clay);
  tubeMesh.castShadow = shadows;
  tubeMesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(tube, 20), buildingEdge));
  bridge.add(tubeMesh);
  bridge.scale.z = 2.6;
  scene.add(bridge);
  bridges.push(bridge);
  solid(new THREE.CylinderGeometry(.12, .12, 1.35, 8), dark, gx + 1.05, .675, 26.4);
 }
 const ourBridge = bridges[1];

 // Arrivals board on the roof: our flight flips to Landed; the retainer stays Holding.
 const mono = `${getComputedStyle(document.documentElement).getPropertyValue("--font-plex").trim() || "ui-monospace"}, monospace`;
 const sans = getComputedStyle(document.body).fontFamily || "sans-serif";
 const boardCanvas = document.createElement("canvas");
 boardCanvas.width = 1024; boardCanvas.height = 300;
 const board = new THREE.CanvasTexture(boardCanvas);
 board.colorSpace = THREE.SRGBColorSpace;
 board.anisotropy = renderer.capabilities.getMaxAnisotropy();
 textures.push(board);
 let boardState = "";
 const drawBoard = (landed: boolean) => {
  const ctx = boardCanvas.getContext("2d")!;
  ctx.fillStyle = "#0B0C10"; ctx.fillRect(0, 0, 1024, 300);
  ctx.textBaseline = "alphabetic"; ctx.textAlign = "left";
  ctx.font = `400 30px ${mono}`; ctx.fillStyle = "#8C877D";
  ctx.fillText("A R R I V A L S", 48, 62);
  ctx.fillStyle = "#26262C"; ctx.fillRect(48, 86, 928, 2); ctx.fillRect(48, 190, 928, 2);
  const row = (y: number, name: string, status: string, color: string, dot: boolean) => {
   ctx.font = `500 54px ${sans}`; ctx.fillStyle = "#F4F2ED"; ctx.fillText(name, 48, y);
   ctx.font = `400 34px ${mono}`; ctx.fillStyle = color; ctx.textAlign = "right"; ctx.fillText(status, 976, y - 4); ctx.textAlign = "left";
   if (dot) { const w = ctx.measureText(status).width; ctx.beginPath(); ctx.arc(976 - w - 26, y - 16, 10, 0, Math.PI * 2); ctx.fill(); }
  };
  row(160, "Monthly fee", "HOLDING", "#8C877D", false);
  row(262, "Intro call", landed ? "LANDED" : "ON APPROACH", landed ? "#FFBF00" : "#B9B4AA", landed);
  board.needsUpdate = true;
 };
 drawBoard(false);
 document.fonts?.ready.then(() => { boardState = ""; }).catch(() => {});
 const boardMesh = new THREE.Mesh(new THREE.PlaneGeometry(6.8, 2), new THREE.MeshBasicMaterial({ map: board, toneMapped: false }));
 boardMesh.position.set(31.5, 5.55, 26.7);
 boardMesh.rotation.y = Math.PI;
 scene.add(boardMesh);
 solid(new THREE.BoxGeometry(6.95, 2.12, .12), dark, 31.5, 5.55, 26.78);
 for (const x of [29, 34]) solid(new THREE.BoxGeometry(.12, 1, .12), dark, x, 4.1, 26.85);

 // Control tower with a blinking gold beacon.
 solid(new THREE.BoxGeometry(4.4, 2.6, 3.6), clay, 6, 1.3, 24, true);
 solid(new THREE.CylinderGeometry(.7, .85, 10, 20), clay, 6, 7.6, 24);
 solid(new THREE.CylinderGeometry(2.05, 2.05, .18, 8), clay, 6, 12.65, 24);
 solid(new THREE.CylinderGeometry(1.95, 1.55, 1.6, 8), glass, 6, 13.5, 24);
 solid(new THREE.CylinderGeometry(1.45, 2.15, .55, 8), clay, 6, 14.55, 24, true);
 solid(new THREE.CylinderGeometry(.04, .04, 2, 6), dark, 6, 15.8, 24);
 const beacon = new THREE.Mesh(new THREE.SphereGeometry(.17, 12, 10), flat(C.gold));
 beacon.position.set(6, 16.9, 24);
 scene.add(beacon);

 // Hangar (half cylinder, door toward the runway), fuel farm, small service buildings.
 const hangarShell = new THREE.CylinderGeometry(5, 5, 14, 28, 1, true, Math.PI / 2, Math.PI);
 hangarShell.rotateX(Math.PI / 2);
 solid(hangarShell, new THREE.MeshStandardMaterial({ color: C.card, roughness: .62, side: THREE.DoubleSide }), -34, 0, 31);
 const door = new THREE.CircleGeometry(5, 28, 0, Math.PI);
 door.rotateY(Math.PI);
 solid(door, new THREE.MeshStandardMaterial({ color: 0xd9d4ca, roughness: .8 }), -34, 0, 23.98);
 for (let k = -3; k <= 3; k++) solid(new THREE.BoxGeometry(.05, Math.sqrt(25 - (k * 1.4) ** 2) - .1, .04), post, -34 + k * 1.4, (Math.sqrt(25 - (k * 1.4) ** 2) - .1) / 2, 23.94);
 solid(new THREE.CircleGeometry(5, 28, 0, Math.PI), clay, -34, 0, 38);
 for (let k = 0; k < 3; k++) solid(new THREE.CylinderGeometry(1.4, 1.4, 2.2, 24), clay, -44 + k * 3.4, 1.1, 42, true);
 for (const [x, z, w, h, d] of [[54, 30, 5, 2.2, 4], [-24, 40, 4, 1.8, 3], [16, 40, 6, 2.4, 3.5], [44, 40, 3, 1.6, 3]] as const) solid(new THREE.BoxGeometry(w, h, d), clay, x, h / 2, z, true);

 // VOR beacon at the holding fix, under the holding stack.
 const HOLD = v3(-14, 0, 20);
 const vorParts = [new THREE.CylinderGeometry(2.4, 2.4, .15, 32).translate(HOLD.x, .075, HOLD.z), new THREE.ConeGeometry(.5, 2.2, 16).translate(HOLD.x, 1.25, HOLD.z)];
 for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; vorParts.push(new THREE.CylinderGeometry(.05, .05, .7, 6).translate(HOLD.x + Math.cos(a) * 1.9, .5, HOLD.z + Math.sin(a) * 1.9)); }
 solid(mergeGeometries(vorParts), clay, 0, 0, 0);
 const vorTip = new THREE.Mesh(new THREE.SphereGeometry(.14, 12, 10), flat(C.gold));
 vorTip.position.set(HOLD.x, 2.42, HOLD.z);
 scene.add(vorTip);

 // ---------- Trees: faceted, white-clay, instanced ----------
 const random = seeded(11);
 const nearApproach = (x: number, z: number) => {
  const ax = -96, az = -34, dx = 88, dz = 34;
  const t = clamp01(((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz));
  return Math.hypot(x - (ax + dx * t), z - (az + dz * t)) < 9;
 };
 const blocked = (x: number, z: number) =>
  (Math.abs(z) < 8 && x > -55 && x < 62) || (x > 6 && x < 57 && z > 4 && z < 48) || (x > -42 && x < -25 && z > 20 && z < 46) ||
  (x > -49 && x < -36 && z > 38 && z < 46) || (x > 0 && x < 12 && z > 19 && z < 29) || Math.hypot(x - HOLD.x, z - HOLD.z) < 5 || nearApproach(x, z);
 const spots: Array<[number, number, number]> = [];
 const bands = [[-70, 85, 44, 72, 70], [0, 85, -24, -58, 44], [-85, -40, 2, 44, 30], [58, 92, -14, 30, 24], [-40, -10, 26, 44, 12]] as const;
 for (const [x0, x1, z0, z1, count] of bands) {
  let placed = 0, tries = 0;
  while (placed < count && tries++ < count * 20) {
   const x = x0 + random() * (x1 - x0), z = z0 + random() * (z1 - z0);
   if (blocked(x, z)) continue;
   spots.push([x, z, .75 + random() * .75]); placed++;
  }
 }
 const crowns = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .85, flatShading: true }), spots.length);
 const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(.1, .14, 1, 6), clayTint, spots.length);
 const crownTones = [new THREE.Color(0xfbfaf7), new THREE.Color(0xeeeae2), new THREE.Color(0xe7e3d9)];
 const turn = new THREE.Quaternion(), upAxis = v3(0, 1, 0), size3 = new THREE.Vector3(), at = new THREE.Vector3();
 spots.forEach(([x, z, size], k) => {
  turn.setFromAxisAngle(upAxis, random() * Math.PI);
  crowns.setMatrixAt(k, matrix.compose(at.set(x, 2.1 * size, z), turn, size3.set(1.25 * size, 1.45 * size, 1.25 * size)));
  crowns.setColorAt(k, crownTones[k % 3]);
  trunks.setMatrixAt(k, matrix.compose(at.set(x, .6 * size, z), turn, size3.set(size, 1.2 * size, size)));
 });
 crowns.castShadow = trunks.castShadow = shadows;
 scene.add(crowns, trunks);

 // ---------- Clouds: faceted, drifting slowly ----------
 const cloudMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, flatShading: true, emissive: 0xffffff, emissiveIntensity: .42 });
 const clouds = ([[-36, 19, 34, 1], [6, 27, 46, 1.3], [42, 25, 54, 1.1], [72, 22, 12, 1], [-64, 21, -6, 1.15], [-28, 24, -46, 1], [24, 29, -32, 1.35]] as const).map(([x, y, z, size], k) => {
  const parts: THREE.BufferGeometry[] = [];
  const count = 5 + (k % 2);
  for (let i = 0; i < count; i++) {
   const r = (1.6 + random() * 1.6) * size;
   parts.push(new THREE.IcosahedronGeometry(r, 1).scale(1, .72, 1).translate((i - count / 2) * 1.9 * size + random() * .8, random() * .9 * size, (random() - .5) * 2.4 * size));
  }
  const mesh = new THREE.Mesh(mergeGeometries(parts), cloudMaterial);
  mesh.position.set(x, y, z);
  scene.add(mesh);
  return { mesh, x, phase: k * 1.7 };
 });

 // ---------- Planes ----------
 const livery = canvasTexture(1024, 110, ctx => {
  ctx.font = `500 84px ${sans}`; ctx.textBaseline = "middle";
  ctx.fillStyle = "#0B0C10"; ctx.fillText("Beside", 40, 58);
  const w = ctx.measureText("Beside").width;
  ctx.fillStyle = "#280137"; ctx.fillText("You", 40 + w, 58);
 });
 textures.push(livery);
 // Tail logo: the brand mark on a white roundel (drawn once the image loads).
 const logo = canvasTexture(256, 256, ctx => { ctx.fillStyle = "#FBFAF7"; ctx.beginPath(); ctx.arc(128, 128, 126, 0, Math.PI * 2); ctx.fill(); });
 textures.push(logo);
 const logoImage = new Image();
 logoImage.onload = () => { (logo.image as HTMLCanvasElement).getContext("2d")!.drawImage(logoImage, 40, 40, 176, 176); logo.needsUpdate = true; };
 logoImage.src = "/by-logo.png";
 const brand: Paint = { body: new THREE.MeshStandardMaterial({ color: C.card, roughness: .55 }), tail: gold, trim: gold, dark, edge, livery, logo };
 const ours = buildPlane(brand, shadows);
 const greyBody = new THREE.MeshStandardMaterial({ color: C.grey, roughness: .7 });
 const greyPaint = { body: greyBody, tail: greyBody, trim: greyBody, dark: new THREE.MeshStandardMaterial({ color: C.ink45, roughness: .6 }), edge };
 const holding = [buildPlane(greyPaint, shadows), buildPlane(greyPaint, shadows)];
 holding.forEach(({ gear }) => gear.forEach(leg => { leg.visible = false; }));
 scene.add(ours.plane, ...holding.map(h => h.plane));

 // ---------- A busy apron ----------
 // Two more BesideYou planes already at their gates (earlier landings), jet bridges connected.
 for (const gx of [20, 36]) {
  const parked = buildPlane(brand, shadows);
  parked.plane.position.set(gx, GROUND_HEIGHT, 19.4);
  scene.add(parked.plane);
 }
 bridges[0].scale.z = bridges[2].scale.z = 5.6;

 // Ground vehicles around the gates, and a baggage train driving a loop round the terminal.
 const kit: Kit = { clay, glass, dark, gold, tint: clayTint };
 const parkedVehicle = (kind: Vehicle, x: number, z: number, heading: number) => {
  const item = vehicle(kind, kit, shadows);
  item.position.set(x, 0, z); item.rotation.y = heading;
  scene.add(item);
 };
 parkedVehicle("loader", 18.4, 17.6, Math.PI / 2);
 parkedVehicle("tractor", 16.6, 16.5, 0);
 parkedVehicle("cart", 16.6, 15.7, 0);
 parkedVehicle("cart", 16.6, 14.9, 0);
 parkedVehicle("fuel", 38.7, 20.3, Math.PI);
 parkedVehicle("catering", 34.5, 21.1, -Math.PI / 2);
 parkedVehicle("tug", 25.3, 23.3, Math.PI / 2);
 parkedVehicle("tug", -30.4, 21.6, .6);
 const loop = new THREE.CatmullRomCurve3([v3(10.6, 0, 25.3), v3(29, 0, 25.3), v3(47.4, 0, 25.3), v3(48.6, 0, 30.6), v3(47.4, 0, 35.9), v3(29, 0, 35.9), v3(10.6, 0, 35.9), v3(9.4, 0, 30.6)], true, "centripetal");
 const loopLength = loop.getLength();
 const train = (["tractor", "cart", "cart", "cart"] as const).map(kind => { const item = vehicle(kind, kit, shadows); scene.add(item); return item; });

 // Ground crew in gold vests (one marshalling at our gate), and passengers by the terminal.
 const crew: THREE.BufferGeometry[] = [], guests: THREE.BufferGeometry[] = [], heads: THREE.BufferGeometry[] = [];
 for (const [x, z, staff] of [[19, 18.1, 1], [18.6, 17.3, 1], [37.7, 21.5, 1], [34.8, 21.6, 1], [27.2, 22.7, 1], [-30.8, 22.6, 1], [-30, 23.1, 1], [8.6, 21.3, 1], [23.6, 35.4, 0], [24.4, 35.6, 0], [32.8, 35.3, 0], [33.5, 35.5, 0], [40.2, 35.4, 0], [29.4, 39.6, 0]] as const) {
  (staff ? crew : guests).push(new THREE.CapsuleGeometry(.045, .13, 4, 8).translate(x, .115, z));
  heads.push(new THREE.SphereGeometry(.04, 10, 8).translate(x, .27, z));
 }
 for (const dx of [-.09, .09]) crew.push(new THREE.CapsuleGeometry(.012, .1, 2, 6).rotateZ(Math.PI / 2 - dx * 6).translate(27.2 + dx, .2, 22.7)); // marshalling wands
 solid(mergeGeometries(crew), gold, 0, 0, 0);
 solid(mergeGeometries(guests), clayTint, 0, 0, 0);
 solid(mergeGeometries(heads), clay, 0, 0, 0);

 // Car park behind the terminal.
 decal(21, 8.4, 30, 41.4, C.tint, .011, -1);
 const stalls: THREE.BufferGeometry[] = [];
 for (const z of [38.8, 44]) for (let i = 0; i <= 14; i++) stalls.push(new THREE.PlaneGeometry(.04, 1.5).rotateX(-Math.PI / 2).translate(20.5 + i * 1.4, .02, z));
 scene.add(new THREE.Mesh(mergeGeometries(stalls), flat(C.rule, { polygonOffset: true, polygonOffsetFactor: -2 })));
 const slots: Array<[number, number, number]> = [];
 for (const [z, heading] of [[38.8, 0], [44, Math.PI]] as const) for (let i = 0; i < 14; i++) if (random() > .28) slots.push([21.2 + i * 1.4, z, heading]);
 const carBodies = new THREE.InstancedMesh(new THREE.BoxGeometry(.5, .17, .95), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .5 }), slots.length);
 const carCabins = new THREE.InstancedMesh(new THREE.BoxGeometry(.42, .14, .5), glass, slots.length);
 const carTones = [0xfbfaf7, 0xfbfaf7, 0xe3ded4, 0x5c5850, 0xb9b4aa, 0xffbf00].map(tone => new THREE.Color(tone));
 slots.forEach(([x, z, heading], k) => {
  turn.setFromAxisAngle(upAxis, heading);
  carBodies.setMatrixAt(k, matrix.compose(at.set(x, .155, z), turn, size3.set(1, 1, 1)));
  carBodies.setColorAt(k, carTones[Math.floor(random() * carTones.length)]);
  carCabins.setMatrixAt(k, matrix.compose(at.set(x, .3, z - (heading ? -.06 : .06)), turn, size3.set(1, 1, 1)));
 });
 carBodies.castShadow = carCabins.castShadow = shadows;
 scene.add(carBodies, carCabins);

 // Landing lights: two soft gold beams from the wing roots while we approach.
 const beamMaterial = new THREE.MeshBasicMaterial({ color: C.gold, vertexColors: true, transparent: true, opacity: 0, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
 const beams = new THREE.Group();
 for (const side of [1, -1]) {
  const cone = new THREE.ConeGeometry(.8, 9, 28, 6, true);
  const position = cone.getAttribute("position");
  const fade = new Float32Array(position.count * 4);
  for (let i = 0; i < position.count; i++) { const a = (position.getY(i) + 4.5) / 9; fade.set([1, 1, 1, a * a], i * 4); }
  cone.setAttribute("color", new THREE.BufferAttribute(fade, 4));
  cone.translate(0, -4.5, 0);
  cone.rotateX(-Math.PI / 2 - .12);
  const beam = new THREE.Mesh(cone, beamMaterial);
  beam.position.set(.42 * side, -.32, .55);
  beams.add(beam);
 }
 ours.plane.add(beams);

 // Blob shadows for planes on phones (desktop has real shadows).
 const blob = canvasTexture(128, 128, ctx => {
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(11,12,16,.55)"); gradient.addColorStop(.55, "rgba(11,12,16,.18)"); gradient.addColorStop(1, "rgba(11,12,16,0)");
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 128, 128);
 });
 textures.push(blob);
 const blobFor = () => {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), flat(0xffffff, { map: blob, transparent: true, depthWrite: false }));
  mesh.rotation.x = -Math.PI / 2;
  mesh.visible = !shadows;
  scene.add(mesh);
  return mesh;
 };
 const blobs = [blobFor(), blobFor(), blobFor()];
 const placeBlob = (mesh: THREE.Mesh, plane: THREE.Object3D) => {
  if (shadows) return;
  const height = Math.max(0, plane.position.y - GROUND_HEIGHT);
  const grow = 1 + height * .09;
  mesh.position.set(plane.position.x, .03, plane.position.z);
  mesh.scale.set(4.8 * grow, 4.6 * grow, 1);
  (mesh.material as THREE.MeshBasicMaterial).opacity = .85 / (1 + height * .35);
 };

 // Tyre smoke at touchdown.
 const puffGeometry = new THREE.IcosahedronGeometry(.32, 1);
 const puffs = Array.from({ length: 10 }, (_, k) => {
  const mesh = new THREE.Mesh(puffGeometry, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, transparent: true, opacity: 0, depthWrite: false }));
  mesh.position.set(-8.6 + (k >> 1) * .9, .3, k % 2 ? .5 : -.5);
  mesh.visible = false;
  scene.add(mesh);
  return { mesh, delay: (k >> 1) * .006 };
 });

 // Holding stack: two racetracks at different altitudes over the beacon.
 const stack = [13, 15.6].map((altitude, k) => {
  const path = racetrack(v3(HOLD.x, altitude, HOLD.z), 18, 6.5);
  const line = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(Array.from({ length: 220 }, (_, i) => path(i / 220))), new THREE.LineDashedMaterial({ color: C.ink30, dashSize: .7, gapSize: .45, toneMapped: false, transparent: true, opacity: k ? .55 : .9 }));
  line.computeLineDistances();
  scene.add(line);
  return { path, phase: k * .27 };
 });

 // Our route: approach (air) to touchdown, then the ground route: roll-out, exit, taxi to the gate.
 const TOUCHDOWN = v3(-8, GROUND_HEIGHT, 0), GATE = v3(28, GROUND_HEIGHT, 19.4);
 const approach = new THREE.CatmullRomCurve3([v3(-96, 22, -34), v3(-68, 17, -22), v3(-44, 11, -9), v3(-26, 4.6, -1.5), v3(-14, 1.45, 0), TOUCHDOWN], false, "centripetal");
 const groundPath = new THREE.CatmullRomCurve3([TOUCHDOWN, v3(8, GROUND_HEIGHT, 0), v3(17, GROUND_HEIGHT, 0), v3(22.5, GROUND_HEIGHT, 1.1), v3(26.3, GROUND_HEIGHT, 4.6), v3(27.7, GROUND_HEIGHT, 9), v3(28, GROUND_HEIGHT, 13.5), GATE], false, "centripetal");
 const AIR = .66;
 const route = (s: number, out = new THREE.Vector3()) => {
  if (s <= AIR) return approach.getPointAt(s / AIR, out);
  const t = (s - AIR) / (1 - AIR);
  return groundPath.getPointAt(1 - (1 - t) ** 2.1, out);
 };
 // Gold lead-in line on the ground from the runway exit to our gate.
 scene.add(new THREE.Mesh(ribbon(Array.from({ length: 90 }, (_, k) => groundPath.getPointAt(.42 + k / 89 * .58)), .14, .026), goldLine));
 const TRAIL_POINTS = 220;
 const trail = new THREE.Line(new THREE.BufferGeometry().setFromPoints(Array.from({ length: TRAIL_POINTS }, (_, k) => approach.getPointAt(k / (TRAIL_POINTS - 1)))), new THREE.LineDashedMaterial({ color: C.ink, dashSize: .45, gapSize: .35, transparent: true, opacity: .6, toneMapped: false }));
 trail.computeLineDistances();
 trail.geometry.setDrawRange(0, 0);
 scene.add(trail);

 // ---------- Camera ----------
 const keys = [
  { p: 0, pos: v3(4, 17.5, -2), at: v3(-14, 13.2, 20) },
  { p: .2, pos: v3(0, 16.8, 0), at: v3(-15, 12.8, 19) },
  { p: .44, pos: v3(-42, 24, -52), at: v3(-22, 7, -8) },
  { p: .66, pos: v3(0, 7, -24), at: v3(4, 1.5, 4) },
  { p: .88, pos: v3(58, 19, -22), at: v3(15, 4, 13) },
  { p: 1, pos: v3(61, 19.5, -24), at: v3(15, 4, 13) },
 ];
 const portraitEnd = [{ pos: v3(62, 27, -38), at: v3(18, 4, 13) }, { pos: v3(65, 27.5, -40), at: v3(18, 4, 13) }];
 const camPos = new THREE.Vector3(), camAt = new THREE.Vector3(), followPos = new THREE.Vector3(), followAt = new THREE.Vector3(), side = new THREE.Vector3();
 const keyframe = (p: number, portrait: boolean) => {
  let i = 0;
  while (i < keys.length - 2 && p > keys[i + 1].p) i++;
  const pick = (k: number) => portrait && k >= keys.length - 2 ? { ...keys[k], ...portraitEnd[k - (keys.length - 2)] } : keys[k];
  const a = pick(i), b = pick(i + 1);
  const t = smooth(range(p, a.p, b.p));
  camPos.lerpVectors(a.pos, b.pos, t);
  camAt.lerpVectors(a.at, b.at, t);
 };

 // ---------- Per-frame update ----------
 const tmp = new THREE.Vector3(), tangent = new THREE.Vector3(), ahead = new THREE.Vector3(), next = new THREE.Vector3(), ahead2 = new THREE.Vector3(), trainAt = new THREE.Vector3(), trainDir = new THREE.Vector3();
 let shown = 0, target = 0, time = 0;
 const HOLD_PERIOD = 17;

 function update(p: number) {
  // Holding stack: circles on time, whatever the scroll does.
  stack.forEach(({ path, phase }, k) => {
   const lap = time / HOLD_PERIOD + phase;
   path(lap, tmp);
   tangent.subVectors(path(lap + .004, ahead), tmp).normalize();
   next.subVectors(path(lap + .03, ahead), path(lap + .026, ahead2)).normalize();
   orient(holding[k].plane, tmp, tangent, next, 9);
   placeBlob(blobs[k + 1], holding[k].plane);
  });

  // Our plane: route position from scroll.
  const s = range(p, .2, .92);
  route(s, tmp);
  route(Math.min(1, s + .003), ahead);
  if (ahead.distanceToSquared(tmp) < 1e-7) tangent.set(0, 0, 1); else tangent.subVectors(ahead, tmp).normalize();
  next.subVectors(route(Math.min(1, s + .03), ahead2), route(Math.min(1, s + .026))).normalize();
  if (!Number.isFinite(next.x) || next.lengthSq() < .5) next.copy(tangent);
  const flare = s < AIR ? -.13 * range(s, AIR - .06, AIR) : -.13 * (1 - range(s, AIR, AIR + .03));
  orient(ours.plane, tmp, tangent, next, s < AIR ? 3 * (1 - range(s, .45, .6)) : 0, flare);
  placeBlob(blobs[0], ours.plane);
  const gear = smooth(range(p, .5, .6));
  ours.gear.forEach(leg => { leg.scale.y = Math.max(.001, gear); leg.visible = gear > .01; });
  beamMaterial.opacity = .32 * smooth(range(p, .42, .5)) * (1 - smooth(range(p, .66, .7)));
  beams.visible = beamMaterial.opacity > .002;
  trail.geometry.setDrawRange(0, Math.floor(TRAIL_POINTS * clamp01(s / AIR)));

  // Touchdown smoke.
  puffs.forEach(({ mesh, delay }) => {
   const u = range(p, .672 + delay, .76 + delay);
   mesh.visible = u > 0 && u < 1;
   if (!mesh.visible) return;
   mesh.scale.setScalar(.5 + u * 2.4);
   mesh.position.y = .3 + u * .5;
   (mesh.material as THREE.MeshStandardMaterial).opacity = .55 * (1 - u);
  });

  // Runway edge lights sweep gold as we land; approach lights pulse toward the threshold.
  const edgeCount = Math.round(EDGE_PAIRS * range(p, .6, .76));
  if (edgeCount !== edgeLit) {
   edgeLit = edgeCount;
   for (let k = 0; k < EDGE_PAIRS; k++) { edgeLights.setColorAt(k * 2, k < edgeCount ? lit : unlit); edgeLights.setColorAt(k * 2 + 1, k < edgeCount ? lit : unlit); }
   if (edgeLights.instanceColor) edgeLights.instanceColor.needsUpdate = true;
  }
  const guiding = p > .24 && p < .7;
  const pulse = (time * .9) % 1;
  for (let b = 0; b < APPROACH_BARS; b++) {
   const on = guiding && Math.abs(1 - b / (APPROACH_BARS - 1) - pulse) < .09;
   for (let l = 0; l < BAR_LIGHTS; l++) approachLights.setColorAt(b * BAR_LIGHTS + l, on ? lit : guiding ? white : unlit);
  }
  if (approachLights.instanceColor) approachLights.instanceColor.needsUpdate = true;

  // Gate: the jet bridge reaches our door once we stop; the board flips to Landed at touchdown.
  ourBridge.scale.z = 2.6 + 3 * smooth(range(p, .92, .98));
  const state = s >= AIR ? "landed" : "approach";
  if (state !== boardState) { boardState = state; drawBoard(state === "landed"); }

  // Baggage train: tractor and carts follow each other round the terminal loop.
  const trainLap = time / 48;
  train.forEach((piece, k) => {
   const u = (((trainLap - k * .78 / loopLength) % 1) + 1) % 1;
   loop.getPointAt(u, trainAt);
   loop.getTangentAt(u, trainDir);
   piece.position.copy(trainAt);
   piece.rotation.y = Math.atan2(trainDir.x, trainDir.z);
  });

  // Ambient: beacon blink, windsock sway, cloud drift.
  beacon.visible = (time % 1.6) < .55;
  sock.rotation.y = -.35 + Math.sin(time * .9) * .12;
  sock.rotation.z = -.12 + Math.sin(time * 1.7) * .04;
  clouds.forEach(({ mesh, x, phase }) => { mesh.position.x = x + Math.sin(time * .04 + phase) * 3; });

  // Camera: keyframes, then a chase camera behind our plane looking down its one route (beat 2),
  // then a side camera tracking the landing (beat 3). Offsets adapt to portrait screens.
  const portrait = camera.aspect < 1;
  keyframe(p, portrait);
  const here = ours.plane.position;
  const chase = smooth(range(p, .24, .32)) * (1 - smooth(range(p, .46, .54)));
  if (chase > 0) {
   const c = portrait ? { back: 14, up: 4.4, side: -1.5, ahead: 10 } : { back: 10.5, up: 3.4, side: -5, ahead: 16 };
   side.set(-tangent.z, 0, tangent.x).normalize();
   followPos.copy(here).addScaledVector(tangent, -c.back).addScaledVector(side, c.side); followPos.y += c.up;
   followAt.copy(here).addScaledVector(tangent, c.ahead); followAt.y -= 1.5;
   camPos.lerp(followPos, chase);
   camAt.lerp(followAt, chase);
  }
  const follow = smooth(range(p, .48, .56)) * (1 - smooth(range(p, .76, .86)));
  if (follow > 0) {
   const f = portrait ? { x: -4, y: 2.4, z: -13.5, lookX: -.8 } : { x: -6.5, y: 1.9, z: -9.5, lookX: 4 };
   followPos.set(here.x + f.x, here.y + f.y, here.z + f.z);
   followAt.set(here.x + f.lookX, here.y - .3, here.z + 1.5);
   camPos.lerp(followPos, follow);
   camAt.lerp(followAt, follow);
  }
  camera.position.copy(camPos);
  camera.lookAt(camAt);
 }

 // ---------- Loop, sizing, adaptive quality ----------
 let raf = 0, running = false, last = 0, first = true;
 const gaps: number[] = [];
 function frame(now: number) {
  raf = requestAnimationFrame(frame);
  const dt = Math.min(.05, last ? (now - last) / 1000 : 1 / 60);
  last = now;
  time += dt;
  shown += (target - shown) * (1 - Math.exp(-dt * 7));
  update(shown);
  renderer.render(scene, camera);
  if (first) { first = false; options.onFirstFrame?.(); }
  gaps.push(dt);
  if (gaps.length >= 90) {
   const average = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
   gaps.length = 0;
   if (average > 1 / 42 && dpr > 1) { dpr = Math.max(1, dpr - .25); renderer.setPixelRatio(dpr); }
  }
 }

 let width = 1, height = 1;
 function resize(w: number, h: number) {
  width = Math.max(1, Math.round(w)); height = Math.max(1, Math.round(h));
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.fov = camera.aspect < .8 ? 54 : camera.aspect < 1.3 ? 42 : 32;
  camera.updateProjectionMatrix();
  if (!running) { update(shown); renderer.render(scene, camera); }
 }

 const lost = (event: Event) => { event.preventDefault(); stop(); options.onLost?.(); };
 canvas.addEventListener("webglcontextlost", lost);

 function start() { if (running) return; running = true; last = 0; raf = requestAnimationFrame(frame); }
 function stop() { running = false; cancelAnimationFrame(raf); }

 return {
  setProgress(progress, jump = false) { target = clamp01(progress); if (jump) shown = target; },
  resize,
  start,
  stop,
  dispose() {
   stop();
   canvas.removeEventListener("webglcontextlost", lost);
   disposeScene(scene, renderer, textures);
  },
  // Renders one frame at a fixed progress and size and returns it as a PNG data URL.
  // Used by scripts/capture-offer-poster.mjs to regenerate the poster from the real scene.
  snapshot(progress, w, h) {
   const keep = { width, height, dpr, shown, target };
   renderer.setPixelRatio(1);
   resize(w, h);
   shown = target = clamp01(progress);
   update(shown);
   renderer.render(scene, camera);
   const url = canvas.toDataURL("image/png");
   renderer.setPixelRatio(keep.dpr);
   shown = keep.shown; target = keep.target;
   resize(keep.width, keep.height);
   return url;
  },
 };
}
