// True when the browser can create a WebGL context. The probe context is released immediately.
export function webglAvailable() {
 try {
  const probe = document.createElement("canvas");
  const gl = (probe.getContext("webgl2") ?? probe.getContext("webgl")) as WebGLRenderingContext | null;
  if (!gl) return false;
  gl.getExtension("WEBGL_lose_context")?.loseContext();
  return true;
 } catch {
  return false;
 }
}
