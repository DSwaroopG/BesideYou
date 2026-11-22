"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { BOOKING_KEYS, HONEYPOT_KEY, MAX_LENGTH, validateBooking, type BookingError, type BookingKey } from "@/lib/booking";
import { form as copy, next } from "@/content/contact";

// The four visible fields of the v3.0 brief form. All six contract keys are still sent
// (see lib/booking.ts); the two not shown go as empty strings.
const FIELDS = [
 { key: "name", type: "text", autoComplete: "name" },
 { key: "company", type: "text", autoComplete: "organization" },
 { key: "email", type: "email", autoComplete: "email" },
 { key: "current_outbound_state", multiline: true },
] as const satisfies ReadonlyArray<{ key: BookingKey; type?: string; autoComplete?: string; multiline?: boolean }>;

type Visible = (typeof FIELDS)[number]["key"];
type Status = "idle" | "sending" | "success" | "error" | "limited";

export function ContactForm() {
 const [errors, setErrors] = useState<Partial<Record<Visible, BookingError>>>({});
 const [status, setStatus] = useState<Status>("idle");
 const [enhanced, setEnhanced] = useState(false);
 const busy = useRef(false);
 const success = useRef<HTMLParagraphElement>(null);

 // Until hydration the form works natively (POST to the API, which redirects) and the browser's
 // own validation applies. Once React runs, custom validation and inline messages take over.
 // ?status=error comes back from a failed native submission.
 useEffect(() => {
  setEnhanced(true);
  if (new URLSearchParams(location.search).get("status") === "error") setStatus("error");
 }, []);

 // Move focus to the confirmation so keyboard and screen-reader users land on it.
 useEffect(() => { if (status === "success") success.current?.focus(); }, [status]);

 async function submit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  if (busy.current) return;
  const formEl = event.currentTarget;
  const data = new FormData(formEl);
  const values = Object.fromEntries(BOOKING_KEYS.map(key => [key, String(data.get(key) ?? "")]));
  const checked = validateBooking(values);
  if (!checked.ok) {
   const visible = Object.fromEntries(FIELDS.flatMap(({ key }) => checked.errors[key] ? [[key, checked.errors[key]]] : [])) as Partial<Record<Visible, BookingError>>;
   setErrors(visible);
   const first = FIELDS.find(({ key }) => visible[key]);
   if (first) (formEl.elements.namedItem(first.key) as HTMLElement | null)?.focus();
   return;
  }
  setErrors({});
  busy.current = true;
  setStatus("sending");
  try {
   const response = await fetch("/api/book-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...checked.payload, [HONEYPOT_KEY]: String(data.get(HONEYPOT_KEY) ?? "") }),
    signal: AbortSignal.timeout(20_000),
   });
   const result = await response.json().catch(() => ({}));
   if (response.ok && result.ok) { setStatus("success"); return; }
   if (response.status === 429) { setStatus("limited"); return; }
   const serverErrors = Object.fromEntries(FIELDS.flatMap(({ key }) => result.fields?.[key] ? [[key, result.fields[key]]] : [])) as Partial<Record<Visible, BookingError>>;
   if (response.status === 400 && Object.keys(serverErrors).length) {
    setErrors(serverErrors);
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

 const clear = (key: Visible) => {
  setErrors(current => { if (!current[key]) return current; const nextErrors = { ...current }; delete nextErrors[key]; return nextErrors; });
  if (status === "error" || status === "limited") setStatus("idle");
 };

 if (status === "success") return <div aria-live="polite"><p ref={success} tabIndex={-1} className="by-lead by-form-success" role="status">{copy.success}</p></div>;

 return <div aria-live="polite">
  <form className="by-form ct-form" method="post" action="/api/book-session" noValidate={enhanced} onSubmit={submit} aria-busy={status === "sending"}>
   {FIELDS.map(field => {
    const error = errors[field.key];
    const multiline = "multiline" in field;
    const described = [multiline ? `${field.key}-hint` : "", error ? `${field.key}-error` : ""].filter(Boolean).join(" ") || undefined;
    const props = {
     id: field.key, name: field.key, required: true, maxLength: MAX_LENGTH[field.key],
     "aria-invalid": Boolean(error), "aria-describedby": described,
     onChange: () => clear(field.key),
    };
    return <div className={multiline || field.key === "email" ? "by-field by-field-wide" : "by-field"} key={field.key}>
     <label htmlFor={field.key}>{copy.labels[field.key]}</label>
     {multiline && <p id={`${field.key}-hint`} className="ct-hint">{copy.hint}</p>}
     {multiline
      ? <textarea {...props} rows={4} />
      : <input {...props} type={field.type} autoComplete={field.autoComplete} inputMode={field.type === "email" ? "email" : undefined} spellCheck={field.type === "email" ? false : undefined} />}
     {error && <p id={`${field.key}-error`} className="by-field-error">{copy.errors[error]}</p>}
    </div>;
   })}

   {/* Spam trap: hidden from people and assistive tech; bots that fill it are dropped server-side. */}
   <div className="ct-trap" aria-hidden="true">
    <label htmlFor={HONEYPOT_KEY}>Leave this empty</label>
    <input id={HONEYPOT_KEY} name={HONEYPOT_KEY} type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
   </div>

   {(status === "error" || status === "limited") && <p role="alert" className="by-field-wide ct-alert">
    {status === "limited" ? copy.rateLimited : copy.failed} <a href={`mailto:${next.email}`}>{next.email}</a>.
   </p>}

   <div className="by-field-wide ct-submit">
    <button className="by-action" disabled={status === "sending"} type="submit">{status === "sending" ? copy.sending : copy.submit}<span aria-hidden="true">↗</span></button>
    <p className="ct-privacy">{copy.privacy} <Link href="/privacy">{copy.privacyLink}</Link></p>
   </div>
  </form>
 </div>;
}
