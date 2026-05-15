"use client";

import { useEffect, useState } from "react";

function greetingFor(hour: number): string {
  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

export function TimeGreeting() {
  // Render an empty string on first paint so SSR + client match, then fill in
  // the time-based greeting after mount. Avoids hydration mismatch since the
  // server can't know the visitor's local hour.
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    setGreeting(greetingFor(new Date().getHours()));
  }, []);

  return (
    <p id="time-greeting" aria-live="polite">
      {greeting}
    </p>
  );
}
