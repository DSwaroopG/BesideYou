// Booking brief contract, shared by the form (components/contact-form.tsx) and the API route
// (app/api/book-session/route.ts) so both validate the same way.
//
// The live webhook expects exactly these six keys (owner contract, see docs/HANDOFF.md):
// do not rename, drop or reorder them without owner approval. The v3.0 brief asks for a
// four-field form, so the page collects four of them; `role` and `primary_growth_objective`
// are still sent, as empty strings.
export const BOOKING_KEYS = ["name", "company", "role", "email", "primary_growth_objective", "current_outbound_state"] as const;
export type BookingKey = (typeof BOOKING_KEYS)[number];
export type BookingPayload = Record<BookingKey, string>;
export type BookingError = "required" | "invalid" | "too_long";

export const REQUIRED_KEYS: readonly BookingKey[] = ["name", "company", "email", "current_outbound_state"];

export const MAX_LENGTH: Record<BookingKey, number> = {
 name: 120,
 company: 160,
 role: 120,
 email: 254,
 primary_growth_objective: 2000,
 current_outbound_state: 2000,
};

// Spam trap: a field people never see. Named so browser autofill will not fill it.
export const HONEYPOT_KEY = "by_extra";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateBooking(input: unknown):
 | { ok: true; payload: BookingPayload }
 | { ok: false; errors: Partial<Record<BookingKey, BookingError>> } {
 const source = (input !== null && typeof input === "object" ? input : {}) as Record<string, unknown>;
 const payload = {} as BookingPayload;
 const errors: Partial<Record<BookingKey, BookingError>> = {};
 for (const key of BOOKING_KEYS) {
  const raw = source[key];
  const value = typeof raw === "string" ? raw.trim() : "";
  payload[key] = value;
  if (REQUIRED_KEYS.includes(key) && !value) errors[key] = "required";
  else if (value.length > MAX_LENGTH[key]) errors[key] = "too_long";
 }
 if (payload.email && !errors.email && !EMAIL.test(payload.email)) errors.email = "invalid";
 return Object.keys(errors).length ? { ok: false, errors } : { ok: true, payload };
}
