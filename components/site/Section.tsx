import * as React from "react";

import { cn } from "@/lib/utils";

/** `.wrap` — max-width 1200, 24px gutters. */
export function Container({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-[1200px] px-6", className)}
      {...props}
    />
  );
}

/** `section.block` — 88px of vertical air, 56px below 640. */
export function Section({ className, ...props }: React.ComponentProps<"section">) {
  return <section className={cn("py-[88px] max-mob:py-14", className)} {...props} />;
}

/** `.sec-head` — eyebrow, heading, optional lead. */
export function SectionHead({
  eyebrow,
  title,
  lead,
  flush = false,
  className,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  /** Drop the bottom margin — the pricing header lays it out itself. */
  flush?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-[640px]",
        !flush && "mb-11 max-mob:mb-8",
        className,
      )}
    >
      <div className="eyebrow">{eyebrow}</div>
      <h2 className="mt-3 text-[clamp(28px,3.2vw,38px)]">{title}</h2>
      {lead ? (
        <p className="mt-3.5 max-w-[520px] text-[16.5px]">{lead}</p>
      ) : null}
    </div>
  );
}
