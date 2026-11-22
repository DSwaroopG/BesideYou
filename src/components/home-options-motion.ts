const MOTION = {
 duration: 1500,
 failsafe: 2000,
 lockKeys: ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " ", "Spacebar"],
} as const;

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const easeOut = (value: number) => 1 - (1 - value) ** 3;

export function enhanceOptions(section: HTMLElement, entry: { lastY: number; jumped: boolean }) {
 const track = section.querySelector<HTMLElement>(".by-opts-track")!;
 const grid = section.querySelector<HTMLElement>(".by-opts-grid")!;
 const cards = Array.from(grid.querySelectorAll<HTMLElement>(".by-opts-card"));
 const routes = Array.from(grid.querySelectorAll<SVGSVGElement>(".by-opts-route"));
 const cta = section.querySelector<HTMLElement>(".by-action")!;
 const wide = matchMedia("(min-width: 900px)");
 const tall = matchMedia("(min-height: 720px)");
 const motionOk = matchMedia("(prefers-reduced-motion: no-preference)");
 const state = { mode: "static", played: false, running: false, locked: false, listening: false, lastY: entry.lastY, lockedY: 0 };
 let frame = 0, failsafe = 0, started = 0;

 const apply = (amount: number) => {
  cards.forEach((card, index) => {
   const value = easeOut(clamp(amount * 3.2 - index * .62));
   const route = easeOut(clamp(amount * 2.8 - index * .45 - .12));
   card.style.opacity = String(value);
   card.style.transform = `translateY(${((1 - value) * 14).toFixed(2)}px)`;
   routes[index].style.clipPath = `inset(0 ${((1 - route) * 100).toFixed(2)}% 0 0)`;
  });
  const tint = easeOut(clamp((amount - .78) / .22));
  section.style.setProperty("--tint", String(tint));
  section.style.setProperty("--a", String(amount));
  cta.style.opacity = String(.25 + .75 * tint);
 };
 const finalState = () => {
  cards.forEach(card => { card.style.removeProperty("opacity"); card.style.removeProperty("transform"); });
  routes.forEach(route => route.style.removeProperty("clip-path"));
  section.style.removeProperty("--tint"); section.style.removeProperty("--a");
  cta.style.removeProperty("opacity");
 };
 const preventMove = (event: Event) => { event.preventDefault(); };
 const preventKey = (event: KeyboardEvent) => {
  const target = event.target instanceof Element ? event.target : null;
  if (target?.closest("input,textarea,select,[contenteditable=true]")) return;
  if (MOTION.lockKeys.includes(event.key as typeof MOTION.lockKeys[number])) event.preventDefault();
 };
 const holdPosition = () => {
  if (state.locked && Math.abs(scrollY - state.lockedY) > .5) scrollTo({ top: state.lockedY, behavior: "instant" as ScrollBehavior });
 };
 const unlock = () => {
  if (!state.locked) return;
  state.locked = false;
  removeEventListener("wheel", preventMove); removeEventListener("touchmove", preventMove);
  removeEventListener("keydown", preventKey); removeEventListener("scroll", holdPosition);
 };
 const finish = () => {
  cancelAnimationFrame(frame); frame = 0; clearTimeout(failsafe); failsafe = 0;
  state.running = false; state.played = true;
  finalState(); unlock(); section.dataset.state = "complete"; syncScroll();
 };
 const tick = (now: number) => {
  frame = 0;
  const amount = clamp((now - started) / MOTION.duration);
  apply(amount);
  if (amount < 1) frame = requestAnimationFrame(tick);
  else finish();
 };
 const play = (lock: boolean) => {
  if (state.played || state.running) return;
  state.running = true; state.played = true;
  if (lock) {
   state.lockedY = track.getBoundingClientRect().top + scrollY - 88;
   scrollTo({ top: state.lockedY, behavior: "instant" as ScrollBehavior });
   state.locked = true; section.dataset.state = "locked";
   addEventListener("wheel", preventMove, { passive: false }); addEventListener("touchmove", preventMove, { passive: false });
   addEventListener("keydown", preventKey); addEventListener("scroll", holdPosition, { passive: true });
  } else section.dataset.state = "playing";
  started = performance.now(); frame = requestAnimationFrame(tick);
  failsafe = window.setTimeout(finish, MOTION.failsafe);
 };
 const onScroll = () => {
  if (state.mode !== "hold" || state.played) { state.lastY = scrollY; return; }
  const current = scrollY, jump = Math.abs(current - state.lastY) > innerHeight, forward = current >= state.lastY;
  state.lastY = current;
  if (forward && track.getBoundingClientRect().top <= 89) play(!jump);
 };
 const syncScroll = () => {
  const should = state.mode === "hold" && !state.played;
  if (should === state.listening) return;
  state.listening = should;
  if (should) addEventListener("scroll", onScroll, { passive: true });
  else removeEventListener("scroll", onScroll);
 };
 const setMode = () => {
  if (state.running || state.locked) finish();
  state.mode = !motionOk.matches ? "static" : wide.matches && tall.matches ? "hold" : "reveal";
  section.dataset.mode = state.mode;
  if (state.mode === "static") { state.played = true; finalState(); section.dataset.state = "complete"; }
  syncScroll();
 };
 const reveal = new IntersectionObserver(([item]) => { if (state.mode === "reveal" && item.intersectionRatio >= .4) play(false); }, { threshold: .4 });
 const visibility = () => { if (document.hidden && (state.running || state.locked)) finish(); };

 apply(0); reveal.observe(grid);
 document.addEventListener("visibilitychange", visibility);
 wide.addEventListener("change", setMode); tall.addEventListener("change", setMode); motionOk.addEventListener("change", setMode);
 setMode();
 if (!state.played && state.mode === "hold" && track.getBoundingClientRect().top <= 89) play(!entry.jumped);

 return () => {
  cancelAnimationFrame(frame); clearTimeout(failsafe); unlock(); removeEventListener("scroll", onScroll);
  document.removeEventListener("visibilitychange", visibility); reveal.disconnect();
  wide.removeEventListener("change", setMode); tall.removeEventListener("change", setMode); motionOk.removeEventListener("change", setMode);
 };
}
