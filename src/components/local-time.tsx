"use client";

import { useEffect, useState } from "react";

const formatter = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false });

export function LocalTime() {
 const [time, setTime] = useState<string | null>(null);

 useEffect(() => {
  let interval = 0;
  const update = () => setTime(formatter.format(new Date()));
  update();
  const timeout = window.setTimeout(() => {
   update();
   interval = window.setInterval(update, 60_000);
  }, 60_000 - Date.now() % 60_000);
  return () => {
   clearTimeout(timeout);
   clearInterval(interval);
  };
 }, []);

 return time ? <> · <time>{time}</time> IST</> : null;
}
