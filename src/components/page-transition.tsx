"use client";

import { ViewTransition, type ReactNode } from "react";
import { usePathname } from "next/navigation";

// Page-to-page transitions (View Transitions API through React, experimental.viewTransition in
// next.config.ts). Keyed by path, so a route change exits the old page and enters the new one;
// same-page hash links and in-page updates don't animate. The header is anchored (globals.css)
// and the motion lives in globals.css under "Page transitions". Browsers without the API, and
// reduced motion, simply swap pages.
export function PageTransition({ children }: { children: ReactNode }) {
 const pathname = usePathname();
 return <ViewTransition key={pathname} enter="by-page-in" exit="by-page-out" update="none" default="none">{children}</ViewTransition>;
}
