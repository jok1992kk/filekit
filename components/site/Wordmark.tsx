import Link from "next/link";

import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";

/** Text wordmark with the 20×20 monochrome frame mark (SPEC.md §1). */
export function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-[9px] text-[17px] font-semibold tracking-[-0.03em] text-ink",
        className,
      )}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="flex-none">
        <rect x="0.75" y="0.75" width="18.5" height="18.5" rx="5.25" fill="#111111" />
        <rect x="5.5" y="5.5" width="9" height="9" rx="1.75" stroke="#fff" strokeWidth="1.3" />
      </svg>
      {brand.name}
    </Link>
  );
}
