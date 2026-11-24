import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// The picture people see when a BesideYou link is shared (LinkedIn, X, WhatsApp, Slack, iMessage).
// One design for every page: the logo, a small label, the page's headline and one plain line, on the
// site's paper colour. Generated at build time by each route's opengraph-image.tsx. Gold is a fill
// only (the bar at the bottom); fonts are the site's own (OFL), stored in src/og.
export const shareSize = { width: 1200, height: 630 };
export const shareType = "image/png";

const ink = "#0B0C10", ink70 = "#4A463F", ink45 = "#5C5850", accent = "#280137", paper = "#F4F2ED", gold = "#FFBF00", rule = "#D6D2C9";

export async function shareImage({ label, title, line }: { label: string; title: string; line?: string }) {
 const dir = join(process.cwd(), "src/og");
 const [sans, mono, logo] = await Promise.all([
  readFile(join(dir, "InstrumentSans-Medium.ttf")),
  readFile(join(dir, "IBMPlexMono-Regular.ttf")),
  readFile(join(dir, "logo.png")),
 ]);
 const size = title.length > 70 ? 58 : title.length > 45 ? 66 : 76;
 return new ImageResponse(
  <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: paper, padding: "64px 80px 0" }}>
   <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
     {/* eslint-disable-next-line @next/next/no-img-element */}
     <img src={`data:image/png;base64,${logo.toString("base64")}`} width={60} height={60} alt="" />
     <div style={{ display: "flex", fontFamily: "Instrument Sans", fontSize: 34, color: ink }}>Beside<span style={{ color: accent }}>You</span></div>
    </div>
    <div style={{ display: "flex", fontFamily: "Plex Mono", fontSize: 20, letterSpacing: 3, color: ink45, textTransform: "uppercase" }}>{label}</div>
   </div>
   <div style={{ display: "flex", flexDirection: "column", gap: 26, maxWidth: 1000 }}>
    <div style={{ display: "flex", fontFamily: "Instrument Sans", fontSize: size, lineHeight: 1.08, letterSpacing: -1.5, color: ink }}>{title}</div>
    {line && <div style={{ display: "flex", fontFamily: "Instrument Sans", fontSize: 30, lineHeight: 1.35, color: ink70 }}>{line}</div>}
   </div>
   <div style={{ display: "flex", flexDirection: "column" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 26, borderTop: `1px solid ${rule}`, paddingTop: 22, fontFamily: "Plex Mono", fontSize: 20, color: ink45 }}>
     <span>besideyou.io</span><span>Built for founder-led B2B firms</span>
    </div>
    <div style={{ display: "flex", height: 14, margin: "0 -80px", background: gold }} />
   </div>
  </div>,
  {
   ...shareSize,
   fonts: [
    { name: "Instrument Sans", data: sans, style: "normal", weight: 500 },
    { name: "Plex Mono", data: mono, style: "normal", weight: 400 },
   ],
  },
 );
}
