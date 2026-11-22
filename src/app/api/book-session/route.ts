import { NextResponse, type NextRequest } from "next/server";
import { HONEYPOT_KEY, validateBooking } from "@/lib/booking";

// Live booking webhook (owner contract: do not change without owner approval).
// BOOKING_WEBHOOK_URL exists only to point staging or tests at a mock; production leaves it unset.
const WEBHOOK_URL = process.env.BOOKING_WEBHOOK_URL || "https://workflow.besideyou.io/webhook/receive-call-details";
const MAX_BODY_BYTES = 16 * 1024;
const UPSTREAM_TIMEOUT_MS = 10_000;

// Best-effort flood guard: per server instance and in memory, so it resets on restart and is not
// shared across instances. Platform-level rate limiting is the real control if traffic grows.
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 15 * 60 * 1000;
const attempts = new Map<string, number[]>();

function limited(ip: string) {
 const now = Date.now();
 const recent = (attempts.get(ip) ?? []).filter(time => now - time < RATE_WINDOW_MS);
 if (recent.length >= RATE_LIMIT) { attempts.set(ip, recent); return true; }
 recent.push(now);
 attempts.set(ip, recent);
 if (attempts.size > 5000) for (const [key, times] of attempts) if (!times.some(time => now - time < RATE_WINDOW_MS)) attempts.delete(key);
 return false;
}

type Outcome = { ok: boolean; status: number; error?: string; fields?: unknown };

// The form posts JSON when JavaScript is running. Before hydration, or without JavaScript, the
// browser posts the form natively (urlencoded); those requests get a redirect to a page instead.
function respond(req: NextRequest, native: boolean, outcome: Outcome) {
 if (native) {
  const to = outcome.ok ? "/contact/sent" : "/contact?status=error";
  return NextResponse.redirect(new URL(to, req.url), 303);
 }
 const { status, ...body } = outcome;
 return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
 const type = (req.headers.get("content-type") ?? "").toLowerCase();
 const native = type.includes("application/x-www-form-urlencoded");
 if (!native && !type.includes("application/json")) return respond(req, false, { ok: false, status: 415, error: "unsupported_media_type" });
 if (Number(req.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) return respond(req, native, { ok: false, status: 413, error: "too_large" });

 let text: string;
 try { text = await req.text(); } catch { return respond(req, native, { ok: false, status: 400, error: "bad_request" }); }
 if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) return respond(req, native, { ok: false, status: 413, error: "too_large" });

 let body: unknown;
 if (native) body = Object.fromEntries(new URLSearchParams(text));
 else {
  try { body = JSON.parse(text); } catch { return respond(req, false, { ok: false, status: 400, error: "invalid_json" }); }
 }

 // A filled spam trap means a bot: answer as if it worked and forward nothing.
 const trap = body !== null && typeof body === "object" ? (body as Record<string, unknown>)[HONEYPOT_KEY] : undefined;
 if (typeof trap === "string" && trap.trim()) return respond(req, native, { ok: true, status: 200 });

 const result = validateBooking(body);
 if (!result.ok) return respond(req, native, { ok: false, status: 400, error: "invalid", fields: result.errors });

 const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
 if (limited(ip)) return respond(req, native, { ok: false, status: 429, error: "rate_limited" });

 try {
  // Only the six contract keys are forwarded, trimmed, in contract order.
  const upstream = await fetch(WEBHOOK_URL, {
   method: "POST",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify(result.payload),
   signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
   cache: "no-store",
  });
  if (!upstream.ok) {
   console.error(`[book-session] webhook responded ${upstream.status}`);
   return respond(req, native, { ok: false, status: 502, error: "upstream" });
  }
  return respond(req, native, { ok: true, status: 200 });
 } catch (error) {
  const timedOut = error instanceof Error && error.name === "TimeoutError";
  console.error(`[book-session] webhook ${timedOut ? "timed out" : "unreachable"}`);
  return respond(req, native, { ok: false, status: timedOut ? 504 : 502, error: timedOut ? "upstream_timeout" : "upstream" });
 }
}
