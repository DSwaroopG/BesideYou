import type { MetadataRoute } from "next";
// Web app manifest: name, colours and icons for "Add to home screen" and search previews.
export default function manifest(): MetadataRoute.Manifest {
 return {
  name: "BesideYou", short_name: "BesideYou",
  description: "The system that finds your clients, built for you. Pay only when a call with the right buyer happens.",
  start_url: "/", display: "browser", background_color: "#F4F2ED", theme_color: "#F4F2ED",
  icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }, { src: "/icon-512.png", sizes: "512x512", type: "image/png" }],
 };
}
