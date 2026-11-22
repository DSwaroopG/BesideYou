// The four people, shared by the Who We Help story (who-people-scene.ts) and the homepage line-up
// (who-lineup-scene.ts). Stylised 3D characters: real proportions, faces, hair, skin tones and
// clothes: two women and two men, all white Americans (owner's call, 2026-11-21). They are
// illustrations, not likenesses of anyone.
//   0 AI and data teams    woman, long blonde hair, knit sweater, jeans; an open laptop
//   1 Software studios     man, short brown hair swept up at the front, trimmed beard, tee and chinos; tablet, gold stylus
//   2 Managed IT providers woman, auburn bob, polo and skirt; headset; a server rack with gold LEDs
//   3 B2B service firms    older man, grey hair, glasses, navy suit and purple tie; briefcase
// The rig (groups and joints) is the same for everyone, so the scenes animate them identically.
// Only imported by lazily loaded scene modules, so three.js stays out of first-load bundles.
import * as THREE from "three";
import { canvasTexture } from "@/components/scene-kit";

export type Mats = { body: THREE.Material; hair: THREE.Material; dark: THREE.Material; gold: THREE.Material; tint: THREE.Material; lapel: THREE.Material; led: THREE.Material };
export type Limb = { joint: THREE.Group; mid: THREE.Group; end: THREE.Group };
// `screen` is the AI person's laptop chart (a canvas texture the home line-up redraws).
export type Rig = { root: THREE.Group; pelvis: THREE.Group; torso: THREE.Group; head: THREE.Group; armR: Limb; armL: Limb; legL: Limb; legR: Limb; hold?: { joint: THREE.Euler; elbow: number }; leds: THREE.Mesh[]; screen?: THREE.CanvasTexture };

export const C = { paper: 0xf4f2ed, card: 0xfbfaf7, tint: 0xe9e4da, hair: 0xd2ccc1, ink: 0x2a2b33, gold: 0xffbf00, lapel: 0x4a4d59, accent: 0x280137 };

type Look = {
 female: boolean; height: number;
 skin: number; hair: number; lips: number;
 top: number; sleeves: "long" | "short"; bottom: number; skirt?: boolean; tights?: number;
 shoes: number; sole: number;
};
const LOOKS: Look[] = [
 { female: true, height: .965, skin: 0xf2cdb0, hair: 0xc59a5e, lips: 0xc27a6c, top: 0xece4d6, sleeves: "long", bottom: 0x4b5b7a, shoes: 0xf7f4ee, sole: 0xd9d3c6 },
 { female: false, height: 1, skin: 0xe8b996, hair: 0x5b3a22, lips: 0xb06c5c, top: 0x34363f, sleeves: "short", bottom: 0xc4b598, shoes: 0x2a2b33, sole: 0xf2efe8 },
 { female: true, height: .95, skin: 0xf0c8a8, hair: 0x8a3c20, lips: 0xbd7064, top: 0xfbfaf7, sleeves: "short", bottom: 0x2f3a55, skirt: true, tights: 0x34343c, shoes: 0x2a2b33, sole: 0x2a2b33 },
 { female: false, height: 1.02, skin: 0xe4b294, hair: 0xa6a19a, lips: 0xa8675a, top: 0x2d3446, sleeves: "long", bottom: 0x2d3446, shoes: 0x1e1f26, sole: 0x1e1f26 },
];

// A limb segment hanging from its joint (origin) down to -length, rounded at both ends.
// A limb hanging from its joint (origin) down to -length: rounded at both ends, tapering r1 to r2.
function limb(r1: number, r2: number, length: number) {
 const points: THREE.Vector2[] = [];
 for (let i = 6; i >= 0; i--) { const a = -Math.PI / 2 * (i / 6); points.push(new THREE.Vector2(Math.cos(a) * r2, -length + Math.sin(a) * r2)); }
 for (let i = 6; i >= 0; i--) { const a = Math.PI / 2 * (1 - i / 6); points.push(new THREE.Vector2(Math.cos(a) * r1, Math.sin(a) * r1)); }
 return new THREE.LatheGeometry(points, 20);
}

// The head: one smooth egg-shaped lathe (chin at the bottom), so the face has no seams. `HEAD`
// scales it (narrower than deep), and `faceZ` finds the surface so features sit exactly on it.
const HEAD = { x: .9, z: 1.08, lift: -.004, forward: .012 };
function headProfile(female: boolean) {
 const pts = female
  ? [[0, .006], [.03, .009], [.052, .025], [.067, .049], [.078, .078], [.086, .11], [.09, .145], [.089, .18], [.08, .21], [.06, .232], [.03, .243], [0, .246]]
  : [[0, .002], [.036, .005], [.059, .021], [.073, .046], [.083, .076], [.09, .11], [.093, .145], [.092, .18], [.083, .21], [.062, .233], [.032, .244], [0, .247]];
 return new THREE.SplineCurve(pts.map(([x, y]) => new THREE.Vector2(x, y))).getPoints(40);
}
function radiusAt(profile: THREE.Vector2[], y: number) {
 for (let i = 1; i < profile.length; i++) {
  const a = profile[i - 1], b = profile[i];
  if ((y - a.y) * (y - b.y) <= 0 && a.y !== b.y) return a.x + (b.x - a.x) * (y - a.y) / (b.y - a.y);
 }
 return 0;
}

// A shell that hugs the head (hair, a beard): a grid over the head's own surface between two
// heights per angle (phi 0 is the front), pushed out along the surface normal by `thick(t)`
// (t is 0 at the lower edge, 1 at the upper edge), so it never lets skin show through.
type ShellSpec = { phi: [number, number]; lower: (phi: number) => number; upper: (phi: number) => number; thick: (t: number, phi: number) => number; cols?: number; rows?: number };
function shell(profile: THREE.Vector2[], spec: ShellSpec) {
 const cols = spec.cols ?? 56, rows = spec.rows ?? 22, e = .002;
 const positions: number[] = [], index: number[] = [];
 for (let i = 0; i <= cols; i++) {
  const phi = spec.phi[0] + (spec.phi[1] - spec.phi[0]) * i / cols;
  const lo = spec.lower(phi), hi = spec.upper(phi);
  for (let j = 0; j <= rows; j++) {
   const t = j / rows, y = lo + (hi - lo) * t;
   const r = radiusAt(profile, y);
   let nr = (radiusAt(profile, y - e) - radiusAt(profile, y + e)) * -1, ny = 2 * e;
   [nr, ny] = [ny, -nr];                       // rotate the tangent (dr, dy) to the outward normal
   const len = Math.hypot(nr, ny) || 1, k = spec.thick(t, phi) / len;
   const rr = Math.max(0, r + nr * k), yy = y + ny * k;
   positions.push(HEAD.x * rr * Math.sin(phi), yy + HEAD.lift, HEAD.forward + HEAD.z * rr * Math.cos(phi));
  }
 }
 for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
  const a = i * (rows + 1) + j, b = a + rows + 1;
  index.push(a, b, a + 1, b, b + 1, a + 1);
 }
 const geometry = new THREE.BufferGeometry();
 geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
 geometry.setIndex(index);
 geometry.computeVertexNormals();
 return geometry;
}
const smoothstep = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
// A hairline height for an angle: `front` at the forehead, `side` above the ears, `back` at the nape.
const hairline = (front: number, side: number, back: number) => (phi: number) => {
 const c = Math.cos(phi);
 return c >= 0 ? side + (front - side) * Math.pow(c, .8) : side + (back - side) * -c;
};
const group = (parent: THREE.Object3D, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; };
const sphere = (r: number, w = 24, h = 16) => new THREE.SphereGeometry(r, w, h);

export function screenTexture(draw: (ctx: CanvasRenderingContext2D) => void) {
 return canvasTexture(256, 176, ctx => { ctx.fillStyle = "#1E1F26"; ctx.fillRect(0, 0, 256, 176); draw(ctx); });
}

// ---------- A person (faces +Z; its right side is -X) ----------
export function buildPerson(kind: number, m: Mats, textures: THREE.Texture[], shadows: boolean): Rig {
 const look = LOOKS[kind];
 const root = new THREE.Group();
 root.scale.setScalar(look.height);
 const part = (geometry: THREE.BufferGeometry, material: THREE.Material, parent: THREE.Object3D, x = 0, y = 0, z = 0) => {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.castShadow = shadows;
  parent.add(mesh);
  return mesh;
 };
 const mat = (color: number, roughness = .78, extra: THREE.MeshStandardMaterialParameters = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });
 // A thin rod from a to b (a mic boom, the arms of glasses).
 const UP = new THREE.Vector3(0, 1, 0);
 const rod = (a: THREE.Vector3, b: THREE.Vector3, radius: number, material: THREE.Material, parent: THREE.Object3D) => {
  const d = b.clone().sub(a);
  const mesh = part(new THREE.CylinderGeometry(radius, radius, d.length(), 8), material, parent, (a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
  mesh.quaternion.setFromUnitVectors(UP, d.normalize());
  return mesh;
 };
 const skin = mat(look.skin, .55), hair = mat(look.hair, .7), top = mat(look.top), bottom = mat(look.bottom);
 const shoes = mat(look.shoes, .6), sole = mat(look.sole, .7), eyes = mat(0x17110e, .22), lips = mat(look.lips, .6);
 const f = look.female;

 // Hips and torso (a lathe profile: shoulders, chest, waist).
 const pelvis = group(root, 0, .95, 0);
 part(sphere(1, 24, 16).scale(f ? .158 : .15, .11, .108), bottom, pelvis, 0, .01, 0);
 const torso = group(pelvis, 0, .05, 0);
 const shape = f
  ? [[.135, 0], [.122, .1], [.128, .19], [.142, .28], [.146, .36], [.152, .42], [.132, .475], [.085, .515], [.04, .532], [0, .536]]
  : [[.132, 0], [.138, .1], [.148, .2], [.165, .3], [.18, .39], [.186, .44], [.16, .49], [.1, .53], [.05, .547], [0, .55]];
 const profile = new THREE.SplineCurve(shape.map(([x, y]) => new THREE.Vector2(x, y))).getPoints(28).map(p => new THREE.Vector2(Math.max(0, p.x), p.y));
 part(new THREE.LatheGeometry(profile, 36).scale(1, 1, .66), top, torso);
 // Neck.
 part(new THREE.CylinderGeometry(f ? .041 : .05, f ? .047 : .057, .1, 20), skin, torso, 0, .56, .004);

 // ---------- Head and face ----------
 const head = group(torso, 0, .58, 0);
 head.scale.setScalar(1.05);
 const profileHead = headProfile(f);
 part(new THREE.LatheGeometry(profileHead, 44).scale(HEAD.x, 1, HEAD.z), skin, head, 0, HEAD.lift, HEAD.forward);
 const faceZ = (y: number, x = 0) => {
  const r = radiusAt(profileHead, y - HEAD.lift), u = x / HEAD.x;
  return HEAD.forward + HEAD.z * Math.sqrt(Math.max(0, r * r - u * u));
 };
 const white = mat(0xf3eee6, .35);
 const eyeX = f ? .031 : .033, eyeY = .125;
 for (const side of [1, -1]) {
  const x = eyeX * side;
  part(sphere(.0128, 16, 12).scale(1.22, .82, .5), white, head, x, eyeY, faceZ(eyeY, x) - .003);          // eye white
  part(sphere(.0082, 14, 12), eyes, head, x, eyeY, faceZ(eyeY, x) - .001);                                 // iris
  const brow = part(new THREE.CapsuleGeometry(f ? .0036 : .0048, .027, 3, 8).rotateZ(Math.PI / 2), hair, head, x * 1.04, .153, faceZ(.153, x) + .001);
  brow.rotation.z = -.1 * side;
  brow.rotation.y = .25 * side;
  const ear = part(sphere(.023, 14, 10).scale(.42, 1, .72), skin, head, (HEAD.x * radiusAt(profileHead, .118) - .004) * side, .118, .004);
  ear.rotation.y = -.2 * side;
 }
 part(sphere(.0155, 14, 12).scale(.72, 1.3, 1), skin, head, 0, .1, faceZ(.1) + .002);                        // nose
 const smile = part(new THREE.TorusGeometry(.017, .0032, 6, 18, Math.PI * .6), lips, head, 0, .086, faceZ(.072) - .0025);
 smile.rotation.z = -Math.PI / 2 - Math.PI * .3;

 // ---------- Arms and hands ----------
 const shoulder = f ? .152 : .176;
 const upper = f ? .041 : .049, fore = f ? .034 : .04;
 const arm = (side: number): Limb => {
  const joint = group(torso, shoulder * side, .45, 0);
  if (look.sleeves === "short") {
   part(limb(upper * 1.06, upper * 1.02, .13), top, joint);
   part(limb(upper * .9, upper * .76, .3), skin, joint);
  } else {
   part(limb(upper, upper * .84, .3), top, joint);
  }
  const mid = group(joint, 0, -.3, 0);
  part(look.sleeves === "short" ? limb(fore * .92, fore * .7, .27) : limb(fore, fore * .82, .27), look.sleeves === "short" ? skin : top, mid);
  if (kind === 3) part(new THREE.TorusGeometry(fore * .95, .006, 6, 18).rotateX(Math.PI / 2), mat(0xf7f5f0, .7), mid, 0, -.25, 0); // shirt cuff
  const end = group(mid, 0, -.27, 0);
  part(sphere(.034, 16, 12).scale(.8, 1.25, .5), skin, end, 0, -.045, 0);                  // palm
  part(new THREE.CapsuleGeometry(.024, .03, 4, 10).scale(1, 1, .55), skin, end, 0, -.088, 0); // fingers
  const thumb = part(new THREE.CapsuleGeometry(.009, .03, 4, 8), skin, end, 0, -.04, .02);
  thumb.rotation.x = .5;
  return { joint, mid, end };
 };

 // ---------- Legs and shoes ----------
 const legColor = look.skirt ? mat(look.tights ?? look.bottom, .65) : bottom;
 const leg = (side: number): Limb => {
  const joint = group(pelvis, (f ? .082 : .086) * side, 0, 0);
  part(limb(f ? .074 : .079, f ? .052 : .058, .43), legColor, joint);
  const mid = group(joint, 0, -.43, 0);
  part(look.skirt ? limb(.051, .034, .43) : limb(f ? .053 : .058, f ? .044 : .05, .43), legColor, mid);
  const end = group(mid, 0, -.43, 0);
  part(new THREE.CapsuleGeometry(f ? .036 : .042, f ? .13 : .15, 4, 12).rotateX(Math.PI / 2).scale(1.05, .78, 1), shoes, end, 0, -.052, .05);
  part(new THREE.CapsuleGeometry(f ? .037 : .043, f ? .13 : .15, 4, 12).rotateX(Math.PI / 2).scale(1.08, .3, 1.02), sole, end, 0, -.078, .05);
  return { joint, mid, end };
 };
 const armR = arm(-1), armL = arm(1), legL = leg(1), legR = leg(-1);
 if (look.skirt) {
  const skirt = part(new THREE.CylinderGeometry(.158, .19, .33, 32, 1, true), mat(look.bottom, .8, { side: THREE.DoubleSide }), pelvis, 0, -.13, 0);
  skirt.scale.z = .78;
 }

 // ---------- Hair: shells that hug the head, one per style ----------
 const TOP = profileHead[profileHead.length - 1].y;
 const hairShell = (spec: Omit<ShellSpec, "upper"> & { upper?: ShellSpec["upper"] }) => part(shell(profileHead, { upper: () => TOP, ...spec }), hair, head);
 const leds: THREE.Mesh[] = [];
 let hold: Rig["hold"];
 let screen: THREE.CanvasTexture | undefined;

 if (kind === 0) {
  // Long hair, centre parting, falling down the back and past the shoulders.
  hairShell({ phi: [-Math.PI, Math.PI], lower: hairline(.19, .11, .02), thick: t => .011 + .006 * (1 - t) });
  part(new THREE.CapsuleGeometry(.08, .22, 6, 18).scale(1.04, 1, .5), hair, head, 0, .03, -.06);
  for (const side of [1, -1]) {
   const lock = part(new THREE.CapsuleGeometry(.026, .17, 4, 10).scale(1, 1, 1.3), hair, head, .074 * side, .07, -.01);
   lock.rotation.z = .1 * side;
  }
  // Knit collar.
  part(new THREE.TorusGeometry(.058, .02, 10, 28).rotateX(Math.PI / 2), mat(0xe2d8c7, .9), torso, 0, .525, .004);
  // An open laptop with a gold chart.
  // Held out in front, clear of the body, lid open a little past upright.
  const laptop = group(torso, .1, .2, .33);
  laptop.rotation.set(-.12, -.3, 0);
  part(new THREE.BoxGeometry(.32, .016, .22), m.tint, laptop);
  const hinge = group(laptop, 0, .008, -.11);
  hinge.rotation.x = -1.74;
  part(new THREE.BoxGeometry(.32, .012, .21), m.dark, hinge, 0, 0, .105);
  const bars = screenTexture(ctx => {
   ctx.fillStyle = "#FFBF00";
   [70, 110, 92, 140, 124].forEach((h, k) => ctx.fillRect(34 + k * 40, 150 - h, 24, h));
   ctx.fillStyle = "#5C5850"; ctx.fillRect(24, 152, 208, 2);
  });
  textures.push(bars);
  screen = bars;
  const face = part(new THREE.PlaneGeometry(.3, .19), new THREE.MeshBasicMaterial({ map: bars, toneMapped: false }), hinge, 0, -.007, .105);
  face.rotation.x = Math.PI / 2;
  hold = { joint: new THREE.Euler(-.35, 0, .18), elbow: -1.2 };
 } else if (kind === 1) {
  // Short brown hair, fuller on top and swept up at the front, and a trimmed beard.
  hairShell({ phi: [-Math.PI, Math.PI], lower: hairline(.205, .14, .05), thick: t => .008 + .012 * t });
  const quiff = part(sphere(1, 20, 14).scale(.072, .032, .078), hair, head, -.012, .25, .04);
  quiff.rotation.set(.18, 0, .1);
  // A trimmed beard from the sideburns, along the jaw and under the chin, below the mouth.
  part(shell(profileHead, { phi: [-1.62, 1.62], lower: () => .004, upper: phi => .057 + .05 * Math.pow(Math.abs(phi) / 1.62, 1.6), thick: () => .004, rows: 12 }), mat(0x4a2f1c, .8), head);
  part(new THREE.CapsuleGeometry(.0055, .032, 3, 8).rotateZ(Math.PI / 2), hair, head, 0, .09, faceZ(.09) + .001);
  // Crew neck.
  part(new THREE.TorusGeometry(.06, .009, 8, 28).rotateX(Math.PI / 2), mat(0x2a2c33), torso, 0, .528, .004);
  // A tablet showing a wireframe, and a gold stylus.
  const tablet = group(torso, .07, .3, .2);
  tablet.rotation.set(-.6, -.45, .1);
  part(new THREE.BoxGeometry(.2, .28, .012), m.dark, tablet);
  const frame = screenTexture(ctx => {
   ctx.strokeStyle = "#8C877D"; ctx.lineWidth = 4;
   ctx.strokeRect(24, 18, 208, 140); ctx.strokeRect(40, 34, 80, 54); ctx.beginPath(); ctx.moveTo(136, 44); ctx.lineTo(212, 44); ctx.moveTo(136, 66); ctx.lineTo(196, 66); ctx.stroke();
   ctx.fillStyle = "#FFBF00"; ctx.fillRect(40, 108, 72, 26);
  });
  textures.push(frame);
  const screenMesh = part(new THREE.PlaneGeometry(.18, .26), new THREE.MeshBasicMaterial({ map: frame, toneMapped: false }), tablet, 0, 0, .007);
  screenMesh.rotation.z = Math.PI / 2;
  part(new THREE.CylinderGeometry(.006, .006, .14, 8), m.gold, armR.end, 0, -.07, .03);
  hold = { joint: new THREE.Euler(-.55, 0, .22), elbow: -1.6 };
 } else if (kind === 2) {
  // A bob: a fringe just above the brows, then straight down to the jaw, flaring a little.
  hairShell({ phi: [-Math.PI, Math.PI], lower: phi => .164 + (.04 - .164) * smoothstep(.95, 1.2, Math.abs(phi)), thick: (t, phi) => .011 + .02 * (1 - t) ** 2 * smoothstep(.95, 1.3, Math.abs(phi)), cols: 72 });
  // Polo collar and placket.
  for (const side of [1, -1]) {
   const collar = part(new THREE.BoxGeometry(.055, .026, .012), top, torso, .034 * side, .508, .062);
   collar.rotation.set(-.35, .45 * side, -.5 * side);
  }
  part(new THREE.BoxGeometry(.022, .1, .006), mat(0xe9e4da), torso, 0, .45, .099);
  // A headset with a gold mic tip.
  part(new THREE.TorusGeometry(.124, .008, 8, 30, Math.PI), m.dark, head, 0, .132, .004);
  for (const side of [1, -1]) part(new THREE.CylinderGeometry(.031, .031, .026, 18).rotateZ(Math.PI / 2), m.dark, head, .122 * side, .125, .004);
  const micTip = new THREE.Vector3(-.03, .078, faceZ(.078, -.03) + .018);
  rod(new THREE.Vector3(-.122, .118, .016), micTip, .0042, m.dark, head);
  part(sphere(.011, 10, 8), m.gold, head, micTip.x, micTip.y, micTip.z);
 } else {
  // Grey side-parted hair, glasses, a navy suit with a white shirt, purple tie and gold pin.
  const base = hairline(.205, .13, .05);
  hairShell({ phi: [-Math.PI, Math.PI], lower: phi => base(phi) + .02 * Math.exp(-((Math.abs(phi) - .62) ** 2) / .03), thick: () => .009 });
  const sweep = part(sphere(1, 20, 14).scale(.068, .028, .08), hair, head, .022, .247, .03);
  sweep.rotation.z = -.16;
  const frameMat = mat(0x1e1f26, .35);
  const lensZ = faceZ(.125, .033) + .012;
  for (const side of [1, -1]) {
   part(new THREE.TorusGeometry(.019, .0026, 8, 26), frameMat, head, .033 * side, .125, lensZ);
   rod(new THREE.Vector3(.051 * side, .127, lensZ - .002), new THREE.Vector3(.083 * side, .13, .0), .0022, frameMat, head);
  }
  part(new THREE.CapsuleGeometry(.0024, .018, 3, 6).rotateZ(Math.PI / 2), frameMat, head, 0, .128, lensZ);
  const shirt = mat(0xf7f5f0, .7);
  part(new THREE.CylinderGeometry(.042, .01, .22, 3, 1).rotateY(Math.PI).scale(1, 1, .2), shirt, torso, 0, .43, .118);
  for (const side of [1, -1]) {
   const lapel = part(new THREE.BoxGeometry(.05, .24, .014), mat(0x262c3c, .7), torso, .052 * side, .38, .122);
   lapel.rotation.z = -.32 * side;
   const collar = part(new THREE.BoxGeometry(.04, .03, .01), shirt, torso, .028 * side, .52, .07);
   collar.rotation.set(-.3, 0, -.6 * side);
  }
  part(new THREE.BoxGeometry(.028, .028, .016), mat(C.accent, .5), torso, 0, .49, .106);         // tie knot
  part(new THREE.CylinderGeometry(.016, .026, .22, 4, 1).scale(1, 1, .35), mat(C.accent, .5), torso, 0, .37, .125); // tie
  part(sphere(.011, 10, 8), m.gold, torso, .09, .43, .112);
  part(new THREE.BoxGeometry(.3, .22, .08), m.tint, armL.end, 0, -.2, 0);
  part(new THREE.TorusGeometry(.035, .008, 6, 14, Math.PI), m.dark, armL.end, 0, -.085, 0);
  part(new THREE.BoxGeometry(.045, .025, .01), m.gold, armL.end, 0, -.11, .043);
 }
 return { root, pelvis, torso, head, armR, armL, legL, legR, hold, leds, screen };
}

export const flatMaterial = (color: number, extra: THREE.MeshBasicMaterialParameters = {}) => new THREE.MeshBasicMaterial({ color, toneMapped: false, ...extra });

export function makeMaterials(): Mats {
 return {
  body: new THREE.MeshStandardMaterial({ color: C.card, roughness: .62 }),
  hair: new THREE.MeshStandardMaterial({ color: C.hair, roughness: .85 }),
  dark: new THREE.MeshStandardMaterial({ color: C.ink, roughness: .45 }),
  gold: new THREE.MeshStandardMaterial({ color: C.gold, roughness: .45 }),
  tint: new THREE.MeshStandardMaterial({ color: C.tint, roughness: .75 }),
  lapel: new THREE.MeshStandardMaterial({ color: C.lapel, roughness: .6 }),
  led: flatMaterial(C.gold),
 };
}

// The managed IT provider's server rack. Its LEDs blink (toggle `visible`).
export function buildRack(m: Mats, shadows: boolean) {
 const rack = new THREE.Group();
 const leds: THREE.Mesh[] = [];
 const rackBody = new THREE.Mesh(new THREE.BoxGeometry(.42, 1.05, .42), m.tint);
 rackBody.position.y = .525; rackBody.castShadow = shadows;
 const rackFace = new THREE.Mesh(new THREE.BoxGeometry(.36, .95, .01), m.dark);
 rackFace.position.set(0, .54, .215);
 rack.add(rackBody, rackFace);
 for (let k = 0; k < 7; k++) {
  const slot = new THREE.Mesh(new THREE.BoxGeometry(.3, .006, .004), m.lapel);
  slot.position.set(0, .16 + k * .125, .222);
  const led = new THREE.Mesh(new THREE.BoxGeometry(.03, .016, .006), m.led);
  led.position.set(.13, .2 + k * .125, .222);
  rack.add(slot, led);
  leds.push(led);
 }
 return { rack, leds };
}
