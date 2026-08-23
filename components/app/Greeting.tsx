"use client";

import { useEffect, useState } from "react";

/**
 * Time-of-day greeting (SPEC.md §9). Resolved after mount rather than on the
 * server: the server's clock is UTC in production and would tell half the
 * world good morning at the wrong time.
 */
export function Greeting({ firstName }: { firstName: string }) {
  const [partOfDay, setPartOfDay] = useState<string | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setPartOfDay("morning");
    else if (hour < 18) setPartOfDay("afternoon");
    else setPartOfDay("evening");
  }, []);

  return (
    <h1 className="text-[clamp(26px,3vw,34px)]">
      {partOfDay ? `Good ${partOfDay}, ${firstName}.` : `Welcome back, ${firstName}.`}
    </h1>
  );
}
