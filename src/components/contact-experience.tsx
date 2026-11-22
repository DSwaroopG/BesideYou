"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent, type KeyboardEvent, type RefObject } from "react";
import { HONEYPOT_KEY, MAX_LENGTH, validateBooking, type BookingError, type BookingKey } from "@/lib/booking";
import { form as plainCopy, guided as copy, next } from "@/content/contact";
import { ContactForm } from "@/components/contact-form";

// /contact. Server HTML (and no-JS, and a failed native submit) is the plain four-field form.
// After hydration it becomes a guided brief: one question at a time, a progress route, and a live
// card that shows the brief and rewrites the call agenda from the answers. Both send the same six
// contract keys to /api/book-session (lib/booking.ts); nothing about the payload or webhook changes.
export function ContactExperience() {
 const [guided, setGuided] = useState(false);
 useEffect(() => { if (new URLSearchParams(location.search).get("status") !== "error") setGuided(true); }, []);
 return guided ? <GuidedBrief /> : <section className="by-section by-grid ct-main" aria-labelledby="ct-form-title">
  <h2 id="ct-form-title" className="by-sr-only">Your brief</h2>
  <aside className="by-span4 ct-aside" aria-labelledby="ct-next-title">
   <p className="by-eyebrow" id="ct-next-title">{next.label}</p>
   <ol className="ct-steps">{next.steps.map((step, k) => <li key={step}><span aria-hidden="true">{String(k + 1).padStart(2, "0")}</span>{step}</li>)}</ol>
   <p className="ct-email">{next.emailLabel} <a href={`mailto:${next.email}`}>{next.email}</a></p>
  </aside>
  <div className="by-span8"><ContactForm /></div>
 </section>;
}

type Status = "idle" | "sending" | "success" | "error" | "limited";
type Field = "name" | "company" | "today" | "goal" | "email" | "role";
const LAST = 4;
const OTHER = "Something else";
const STEP_OF: Partial<Record<BookingKey, number>> = { name: 0, company: 0, role: 0, current_outbound_state: 1, primary_growth_objective: 2, email: 3 };
const FIELD_OF: Partial<Record<BookingKey, Field>> = { name: "name", company: "company", role: "role", current_outbound_state: "today", primary_growth_objective: "goal", email: "email" };
const label = (options: ReadonlyArray<readonly [string, string]>, ids: string[]) => options.filter(([id]) => ids.includes(id)).map(([, text]) => text);
const compose = (labels: string[], note: string) => [labels.join(", "), note.trim()].filter(Boolean).join(". ");
const order = (k: number) => ({ "--k": k }) as CSSProperties;

function GuidedBrief() {
 const [step, setStep] = useState(0);
 const [dir, setDir] = useState(1);
 const [name, setName] = useState("");
 const [company, setCompany] = useState("");
 const [role, setRole] = useState("");
 const [roleOther, setRoleOther] = useState("");
 const [today, setToday] = useState<string[]>([]);
 const [todayNote, setTodayNote] = useState("");
 const [goal, setGoal] = useState<string[]>([]);
 const [goalNote, setGoalNote] = useState("");
 const [email, setEmail] = useState("");
 const [reaction, setReaction] = useState("");
 const [errors, setErrors] = useState<Partial<Record<Field, BookingError>>>({});
 const [status, setStatus] = useState<Status>("idle");
 const [flown, setFlown] = useState(false);
 const moved = useRef(false);
 const stepRef = useRef<HTMLDivElement>(null);
 const doneRef = useRef<HTMLHeadingElement>(null);
 const trap = useRef<HTMLInputElement>(null);
 const busy = useRef(false);

 const roleValue = role === OTHER ? roleOther.trim() : role;
 const outbound = compose(label(copy.today.options, today), todayNote);
 const objective = compose(label(copy.goal.options, goal), goalNote);
 const payload = { name, company, role: roleValue, email, primary_growth_objective: objective, current_outbound_state: outbound };
 // "Asha, Founder at Northwind": whatever parts are filled in so far.
 const lead = [name.trim(), roleValue].filter(Boolean).join(", ");
 const who = company.trim() ? (lead ? `${lead} at ${company.trim()}` : company.trim()) : lead;

 // The agenda rewrites itself from the answers.
 const agenda = useMemo(() => {
  const co = company.trim() || "your company";
  const second = (["agency", "self", "referrals", "network", "linkedin", "events", "inbound"] as const).find(id => today.includes(id)) ?? "none";
  const skipReferrals = second === "referrals" || second === "network";
  const third = (["pricing", "own", "test", "calls", "referrals", "fit"] as const).find(id => goal.includes(id) && !(id === "referrals" && skipReferrals)) ?? "none";
  // Keys follow the choice, so typing the company updates the text without re-animating it.
  return ([["first", copy.agenda.first], [`second-${second}`, copy.agenda.second[second]], [`third-${third}`, copy.agenda.third[third]], ["last", copy.agenda.last]] as const)
   .map(([key, line]) => ({ key, text: line.replace("{company}", co) }));
 }, [company, today, goal]);

 // Focus follows the flow (never on first load, so the page doesn't jump).
 useEffect(() => {
  if (!moved.current) return;
  const box = stepRef.current;
  const target = box?.querySelector<HTMLElement>("[data-autofocus]") ?? box?.querySelector<HTMLElement>("h3");
  target?.focus({ preventScroll: true });
  box?.closest(".ct-stage")?.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
 }, [step]);
 useEffect(() => { if (flown) doneRef.current?.focus(); }, [flown]);
 // After sending, the card flies off; the confirmation takes over when it's gone.
 useEffect(() => {
  if (status !== "success") return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { setFlown(true); return; }
  const timer = window.setTimeout(() => setFlown(true), 1000);
  return () => clearTimeout(timer);
 }, [status]);

 const check = (keys: BookingKey[]) => {
  const result = validateBooking(payload);
  if (result.ok) return {};
  return Object.fromEntries(keys.flatMap(key => result.errors[key] ? [[FIELD_OF[key]!, result.errors[key]!]] : [])) as Partial<Record<Field, BookingError>>;
 };
 const STEP_KEYS: BookingKey[][] = [["name", "company", "role"], ["current_outbound_state"], ["primary_growth_objective"], ["email"], []];

 const go = (to: number) => { moved.current = true; setDir(to > step ? 1 : -1); setErrors({}); setStep(to); };
 const clear = (field: Field) => { setErrors(current => { if (!current[field]) return current; const copyErrors = { ...current }; delete copyErrors[field]; return copyErrors; }); if (status === "error" || status === "limited") setStatus("idle"); };

 async function send() {
  if (busy.current) return;
  const result = validateBooking(payload);
  if (!result.ok) {
   const first = Math.min(...Object.keys(result.errors).map(key => STEP_OF[key as BookingKey] ?? LAST));
   go(first);
   setErrors(check(STEP_KEYS[first]));
   return;
  }
  busy.current = true;
  setStatus("sending");
  try {
   const response = await fetch("/api/book-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...result.payload, [HONEYPOT_KEY]: trap.current?.value ?? "" }),
    signal: AbortSignal.timeout(20_000),
   });
   const body = await response.json().catch(() => ({}));
   if (response.ok && body.ok) { setStatus("success"); return; }
   if (response.status === 429) { setStatus("limited"); return; }
   const fields = (body.fields ?? {}) as Partial<Record<BookingKey, BookingError>>;
   const keys = Object.keys(fields) as BookingKey[];
   if (response.status === 400 && keys.length) {
    const first = Math.min(...keys.map(key => STEP_OF[key] ?? LAST));
    go(first);
    setErrors(Object.fromEntries(keys.flatMap(key => FIELD_OF[key] ? [[FIELD_OF[key]!, fields[key]!]] : [])));
    setStatus("idle");
    return;
   }
   setStatus("error");
  } catch {
   setStatus("error");
  } finally {
   busy.current = false;
  }
 }

 function submit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  if (step === LAST) { void send(); return; }
  const found = check(STEP_KEYS[step]);
  if (Object.keys(found).length) {
   setErrors(found);
   const target = found.name ? "#ct-name" : found.company ? "#ct-company" : found.today ? ".ct-chips button" : found.email ? "input[type=email]" : "textarea";
   stepRef.current?.querySelector<HTMLElement>(target)?.focus();
   return;
  }
  go(step + 1);
 }
 // In a note box, Enter adds a line; Ctrl or Cmd + Enter moves on.
 const noteKeys = (event: KeyboardEvent<HTMLTextAreaElement>) => {
  if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); }
 };
 const toggle = (list: string[], set: (next: string[]) => void, id: string, field: Field, react = false) => {
  const on = !list.includes(id);
  set(on ? [...list, id] : list.filter(item => item !== id));
  clear(field);
  if (react) setReaction(on ? id : "");
 };
 const err = (field: Field) => errors[field] ? <p className="by-field-error ct-error" id={`ct-${field}-error`}>{plainCopy.errors[errors[field]!]}</p> : null;
 const firstName = name.trim().split(/\s+/)[0] || "";
 const sent = status === "success";

 return <section className="by-section ct-stage" data-state={sent ? "sent" : "open"} aria-labelledby="ct-flow-title">
  <h2 id="ct-flow-title" className="by-sr-only">Your brief</h2>
  <Route step={sent ? LAST + 1 : step} onGo={go} disabled={sent} />

  {flown ? <Done name={firstName} doneRef={doneRef} agenda={agenda} /> : <div className="by-grid ct-stage-grid">
   <div className="by-span7 ct-flow-col">
    <form className="ct-flow" noValidate onSubmit={submit} aria-busy={status === "sending"}>
     <div className="ct-step" key={step} data-dir={dir} ref={stepRef}>
      <p className="ct-step-num"><span>{String(step + 1).padStart(2, "0")}</span> · {copy.rail[step]}</p>

      {step === 0 && <>
       <h3 className="ct-q" tabIndex={-1}>{copy.you.title}</h3>
       <p className="ct-sentence">
        {copy.you.before}{" "}
        <Inline id="ct-name" value={name} onChange={value => { setName(value); clear("name"); }} placeholder={copy.you.placeholders.name} label={plainCopy.labels.name} autoComplete="name" max={MAX_LENGTH.name} invalid={!!errors.name} autofocus />
        {" "}{copy.you.middle}{" "}
        <Inline id="ct-company" value={company} onChange={value => { setCompany(value); clear("company"); }} placeholder={copy.you.placeholders.company} label={plainCopy.labels.company} autoComplete="organization" max={MAX_LENGTH.company} invalid={!!errors.company} />
        {copy.you.after}
       </p>
       {err("name")}{err("company")}
       <fieldset className="ct-set">
        <legend>{copy.you.roleLabel}</legend>
        <div className="ct-chips">{copy.you.roles.map((item, k) => <button type="button" key={item} className="ct-chip" style={order(k)} aria-pressed={role === item} onClick={() => { setRole(role === item ? "" : item); clear("role"); }}>{item}</button>)}</div>
        {role === OTHER && <input className="ct-line" aria-label={copy.you.roleOther} placeholder={copy.you.roleOther} value={roleOther} maxLength={MAX_LENGTH.role} onChange={event => setRoleOther(event.target.value)} autoComplete="organization-title" />}
       </fieldset>
      </>}

      {step === 1 && <>
       <h3 className="ct-q" tabIndex={-1}>{copy.today.title}</h3>
       <fieldset className="ct-set">
        <legend className="ct-hint">{copy.today.hint}</legend>
        <div className="ct-chips" data-invalid={!!errors.today} aria-describedby={errors.today ? "ct-today-error" : undefined}>{copy.today.options.map(([id, text], k) => <button type="button" key={id} className="ct-chip" style={order(k)} aria-pressed={today.includes(id)} data-autofocus={k === 0 ? "" : undefined} onClick={() => toggle(today, setToday, id, "today", true)}>{text}</button>)}</div>
       </fieldset>
       {reaction && today.includes(reaction) && <p className="ct-reaction" key={reaction} role="status">{copy.today.reactions[reaction as keyof typeof copy.today.reactions]}</p>}
       <label className="ct-note"><span>{copy.today.noteLabel}</span>
        <textarea rows={2} value={todayNote} placeholder={copy.today.notePlaceholder} maxLength={MAX_LENGTH.current_outbound_state} onChange={event => { setTodayNote(event.target.value); clear("today"); }} onKeyDown={noteKeys} />
       </label>
       {err("today")}
      </>}

      {step === 2 && <>
       <h3 className="ct-q" tabIndex={-1}>{copy.goal.title}</h3>
       <fieldset className="ct-set">
        <legend className="ct-hint">{copy.goal.hint}</legend>
        <div className="ct-chips">{copy.goal.options.map(([id, text], k) => <button type="button" key={id} className="ct-chip" style={order(k)} aria-pressed={goal.includes(id)} data-autofocus={k === 0 ? "" : undefined} onClick={() => toggle(goal, setGoal, id, "goal")}>{text}</button>)}</div>
       </fieldset>
       <label className="ct-note"><span>{copy.goal.noteLabel}</span>
        <textarea rows={2} value={goalNote} placeholder={copy.goal.notePlaceholder} maxLength={MAX_LENGTH.primary_growth_objective} onChange={event => { setGoalNote(event.target.value); clear("goal"); }} onKeyDown={noteKeys} />
       </label>
       {err("goal")}
      </>}

      {step === 3 && <>
       <h3 className="ct-q" tabIndex={-1}>{copy.invite.title}</h3>
       <label className="ct-field-big"><span className="by-sr-only">{copy.invite.label}</span>
        <input type="email" inputMode="email" spellCheck={false} autoComplete="email" value={email} placeholder={copy.invite.placeholder} maxLength={MAX_LENGTH.email} aria-invalid={!!errors.email} aria-describedby={errors.email ? "ct-email-error" : undefined} data-autofocus="" onChange={event => { setEmail(event.target.value); clear("email"); }} />
       </label>
       {err("email")}
       <p className="ct-privacy">{plainCopy.privacy} <Link href="/privacy">{plainCopy.privacyLink}</Link></p>
      </>}

      {step === LAST && <>
       <h3 className="ct-q" tabIndex={-1}>{copy.review.title}</h3>
       <p className="ct-lead">{copy.review.lead}</p>
       <p className="ct-edits">{copy.rail.slice(0, LAST).map((part, k) => <button type="button" key={part} className="ct-edit" onClick={() => go(k)}>{copy.review.edit} <span>{part.toLowerCase()}</span></button>)}</p>
      </>}
     </div>

     {/* Spam trap: hidden from people and assistive tech; bots that fill it are dropped server-side. */}
     <div className="ct-trap" aria-hidden="true"><label htmlFor="ct-trap">Leave this empty</label><input id="ct-trap" ref={trap} type="text" tabIndex={-1} autoComplete="off" defaultValue="" /></div>

     {(status === "error" || status === "limited") && <p role="alert" className="ct-alert">{status === "limited" ? plainCopy.rateLimited : plainCopy.failed} <a href={`mailto:${next.email}`}>{next.email}</a>.</p>}

     <div className="ct-nav">
      {step > 0 && <button type="button" className="ct-back" onClick={() => go(step - 1)}><span aria-hidden="true">←</span>{copy.back}</button>}
      <button className="by-action ct-go" type="submit" disabled={status === "sending" || sent}>{step === LAST ? (status === "sending" ? copy.review.sending : copy.review.send) : copy.continue}<span aria-hidden="true">{step === LAST ? "↗" : "→"}</span></button>
      {step < LAST && <span className="ct-enter" aria-hidden="true">{copy.enter} ↵</span>}
     </div>
    </form>
   </div>

   <aside className="by-span5 ct-card-col" aria-label={copy.card.title}>
    <LiveCard step={step} who={who} outbound={outbound} objective={objective} email={email.trim()} agenda={agenda} />
   </aside>
  </div>}
 </section>;
}

// A text input that sits inside a sentence and grows with what's typed.
function Inline({ id, value, onChange, placeholder, label: name, autoComplete, max, invalid, autofocus }: { id: string; value: string; onChange: (value: string) => void; placeholder: string; label: string; autoComplete: string; max: number; invalid: boolean; autofocus?: boolean }) {
 // A hidden copy of the text sizes the box, so the input is exactly as wide as what's typed.
 return <span className="ct-inline">
  <span className="ct-inline-size" aria-hidden="true">{value || placeholder}</span>
  <input id={id} value={value} placeholder={placeholder} aria-label={name} autoComplete={autoComplete} maxLength={max} aria-invalid={invalid} aria-describedby={invalid ? `ct-${id.slice(3)}-error` : undefined} data-autofocus={autofocus ? "" : undefined} onChange={event => onChange(event.target.value)} />
 </span>;
}

// The progress route: a wave with five stops; finished stops take you back to edit them.
const ROUTE = "M0,32 C125,4 125,60 250,32 S375,4 500,32 S625,60 750,32 S875,4 1000,32";
function Route({ step, onGo, disabled }: { step: number; onGo: (step: number) => void; disabled: boolean }) {
 const path = useRef<SVGPathElement>(null);
 const clip = useRef<SVGRectElement>(null);
 const dot = useRef<HTMLSpanElement>(null);
 const at = useRef(0);
 useEffect(() => {
  const line = path.current, mark = dot.current;
  if (!line || !mark) return;
  const total = line.getTotalLength();
  const target = Math.min(1, step / LAST);
  const from = at.current;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const place = (t: number) => {
   const p = line.getPointAtLength(total * t);
   mark.style.left = `${p.x / 10}%`; mark.style.top = `${p.y}px`;
   clip.current?.setAttribute("width", String(p.x));
  };
  if (reduced) { place(target); at.current = target; return; }
  let raf = 0; const start = performance.now();
  const tick = (now: number) => {
   const k = Math.min(1, (now - start) / 900), e = 1 - (1 - k) ** 3;
   const t = from + (target - from) * e;
   at.current = t; place(t);
   if (k < 1) raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
 }, [step]);
 return <div className="ct-route">
  <svg viewBox="0 0 1000 64" preserveAspectRatio="none" aria-hidden="true" focusable="false">
   {/* The wave only moves left to right, so clipping at the dot's x draws exactly the route so far. */}
   <defs><clipPath id="ct-route-clip"><rect ref={clip} x="-10" y="-20" width="0" height="104" /></clipPath></defs>
   <path ref={path} className="ct-route-base" d={ROUTE} />
   <path className="ct-route-done" d={ROUTE} clipPath="url(#ct-route-clip)" />
  </svg>
  <span className="ct-route-dot" ref={dot} aria-hidden="true" />
  <ol className="ct-route-stops">{copy.rail.map((part, k) => {
   const state = k < step ? "done" : k === step ? "now" : "next";
   return <li key={part} data-state={state} style={{ left: `${k * 25}%` }}>
    {state === "done" && !disabled ? <button type="button" onClick={() => onGo(k)} aria-label={`${copy.back} to ${part}`}>{part}</button> : <span aria-current={state === "now" ? "step" : undefined}>{part}</span>}
   </li>;
  })}</ol>
 </div>;
}

// The card that builds itself: the brief, the agenda, and both clocks.
type Agenda = Array<{ key: string; text: string }>;
function AgendaList({ items }: { items: Agenda }) {
 return <ol>{items.map((item, k) => <li key={item.key}><span aria-hidden="true">{k + 1}</span>{item.text}</li>)}</ol>;
}
function LiveCard({ step, who, outbound, objective, email, agenda }: { step: number; who: string; outbound: string; objective: string; email: string; agenda: Agenda }) {
 const rows: Array<[string, string, number]> = [[copy.card.rows.who, who, 0], [copy.card.rows.today, outbound, 1], [copy.card.rows.goal, objective, 2], [copy.card.rows.email, email, 3]];
 return <div className="ct-card" data-step={step}>
  <p className="ct-card-head"><span>{copy.card.title}</span><span>{copy.card.with}</span></p>
  <dl className="ct-brief">{rows.map(([title, value, k]) => <div key={title} data-filled={!!value} data-active={step === k}>
   <dt>{title}</dt>
   <dd>{value ? <span className="ct-value">{value}</span> : <span className="ct-skeleton" aria-label="Not answered yet" />}</dd>
  </div>)}</dl>
  <div className="ct-agenda">
   <p className="ct-card-label">{copy.card.agenda}</p>
   <AgendaList items={agenda} />
  </div>
  <Clocks />
 </div>;
}

function Clocks() {
 const [now, setNow] = useState<Date | null>(null);
 useEffect(() => {
  setNow(new Date());
  const timer = window.setInterval(() => setNow(new Date()), 30_000);
  return () => clearInterval(timer);
 }, []);
 if (!now) return null;
 const time = (zone?: string) => new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: zone }).format(now);
 return <div className="ct-clocks">
  <p><span>{copy.card.you}</span><time>{time()}</time></p>
  <p><span>{copy.card.us}</span><time>{time("Asia/Kolkata")}</time></p>
  <p className="ct-reply">{copy.card.reply}</p>
 </div>;
}

function Done({ name, doneRef, agenda }: { name: string; doneRef: RefObject<HTMLHeadingElement | null>; agenda: Agenda }) {
 const done = copy.done;
 return <div className="by-grid ct-done-grid"><div className="by-span7 ct-done" role="status">
  <p className="by-eyebrow">{done.eyebrow}</p>
  <h3 className="ct-done-title" ref={doneRef} tabIndex={-1}>{name ? done.title.replace("{name}", name) : done.title.replace(", {name}", "")}</h3>
  <p className="ct-lead">{done.lead}</p>
  <ol className="ct-timeline">{done.steps.map(([title, when], k) => <li key={title} data-state={k === 0 ? "done" : k === 1 ? "now" : "next"} style={order(k)}>
   <i aria-hidden="true" /><span>{title}</span><span>{when}</span>
  </li>)}</ol>
  <Clocks />
  <p className="ct-done-links">
   <Link className="by-text-link" href="/#hm-why-title">{done.play}<span aria-hidden="true">↗</span></Link>
   <Link className="by-text-link" href="/how-it-works">{done.how}<span aria-hidden="true">↗</span></Link>
  </p>
 </div>
 <aside className="by-span5 ct-done-card" aria-label={copy.card.agenda}>
  <div className="ct-card">
   <p className="ct-card-head"><span>{copy.card.title}</span><span className="ct-stamp">{done.stamp}</span></p>
   <div className="ct-agenda"><p className="ct-card-label">{copy.card.agenda}</p><AgendaList items={agenda} /></div>
  </div>
 </aside></div>;
}
