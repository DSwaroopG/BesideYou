// Shared helpers for the site's three.js scenes (offer-flight-scene.ts, who-people-scene.ts).
// Only ever imported by those lazily loaded modules, so three.js stays out of first-load bundles.
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
export const smooth = (value: number) => value * value * (3 - 2 * value);
export const range = (value: number, from: number, to: number) => clamp01((value - from) / (to - from));
export const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// Deterministic randomness so a scene (and its poster) is identical on every load.
export function seeded(seed: number) {
 return () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
 };
}

export function canvasTexture(width: number, height: number, draw: (ctx: CanvasRenderingContext2D) => void) {
 const canvas = document.createElement("canvas");
 canvas.width = width; canvas.height = height;
 draw(canvas.getContext("2d")!);
 const texture = new THREE.CanvasTexture(canvas);
 texture.colorSpace = THREE.SRGBColorSpace;
 return texture;
}

// The brand's dotted paper as a repeating ground texture.
export function dotTexture(renderer: THREE.WebGLRenderer) {
 const texture = canvasTexture(64, 64, ctx => {
  ctx.fillStyle = "#F4F2ED"; ctx.fillRect(0, 0, 64, 64);
  ctx.fillStyle = "#CFCAC0"; ctx.beginPath(); ctx.arc(32, 32, 3.2, 0, Math.PI * 2); ctx.fill();
 });
 texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
 texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
 return texture;
}

// Merge a static model into one mesh per material (and one line set per line material), so a
// detailed model costs a handful of draw calls. Objects in `keep` (moving parts, such as landing
// gear) stay separate. The root must still be at the origin, unrotated, when this runs.
export function freeze(root: THREE.Object3D, shadows: boolean, keep: THREE.Object3D[] = []) {
 root.updateMatrixWorld(true);
 const meshes = new Map<THREE.Material, THREE.BufferGeometry[]>(), lines = new Map<THREE.Material, THREE.BufferGeometry[]>();
 const kept = (object: THREE.Object3D) => { for (let o: THREE.Object3D | null = object; o && o !== root; o = o.parent) if (keep.includes(o)) return true; return false; };
 root.traverse(object => {
  const item = object as THREE.Mesh;
  if (object === root || kept(object) || !item.geometry || Array.isArray(item.material)) return;
  let geometry = item.geometry.clone().applyMatrix4(item.matrixWorld);
  if (geometry.index) geometry = geometry.toNonIndexed();
  const bucket = (object as THREE.LineSegments).isLineSegments ? lines : meshes;
  const material = item.material as THREE.Material;
  bucket.set(material, [...(bucket.get(material) ?? []), geometry]);
 });
 const frozen = new THREE.Group();
 meshes.forEach((list, material) => { const mesh = new THREE.Mesh(mergeGeometries(list), material); mesh.castShadow = shadows; frozen.add(mesh); });
 lines.forEach((list, material) => frozen.add(new THREE.LineSegments(mergeGeometries(list), material)));
 keep.forEach(object => frozen.add(object));
 return frozen;
}

// Free everything a scene allocated, then release the GL context (browsers cap live contexts).
export function disposeScene(scene: THREE.Scene, renderer: THREE.WebGLRenderer, textures: THREE.Texture[]) {
 scene.traverse(object => {
  const mesh = object as THREE.Mesh;
  if (mesh.geometry) mesh.geometry.dispose();
  const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
  if (Array.isArray(material)) material.forEach(item => item.dispose()); else material?.dispose();
 });
 textures.forEach(texture => texture.dispose());
 renderer.dispose();
 renderer.forceContextLoss();
}
