import Link from "next/link";

import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";

/** Overlapping product frames: one source photo, multiple ready listings. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-[9px] text-[17px] font-semibold tracking-[-0.03em] text-ink",
        className,
      )}
    >
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true" className="flex-none">
        <rect x="1" y="6" width="13" height="13" rx="3.5" fill="#15803D" />
        <rect x="7" y="1" width="14" height="14" rx="4" fill="#111111" />
        <circle cx="16.5" cy="5.5" r="1.35" fill="white" />
        <path d="M10.5 11.5L13.2 8.8L17.7 13.3" stroke="white" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {brand.name}
    </Link>
  );
}
