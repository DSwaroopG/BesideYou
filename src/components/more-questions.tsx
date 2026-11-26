"use client";

import { useEffect, useRef, useState } from "react";

// Phones only (see globals.css): folds the later questions away until asked. Rendered hidden on the
// server, so without JavaScript every question simply shows.
export function MoreQuestions({ count }: { count: number }) {
  const button = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const list = button.current?.parentElement;
    if (!list) return;
    list.dataset.more = open ? "open" : "closed";
    button.current!.hidden = open;
    if (open) list.querySelector<HTMLElement>(".by-q-extra summary")?.focus();
  }, [open]);

  return <button ref={button} type="button" className="by-q-more" hidden aria-expanded={open} onClick={() => setOpen(true)}>
    {count} more questions<span aria-hidden="true">+</span>
  </button>;
}
