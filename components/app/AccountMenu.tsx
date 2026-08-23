"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

import { signOutAction } from "@/app/actions/auth";

function initialsOf(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const itemClass =
  "block w-full px-3.5 py-2.5 text-left text-[14px] text-body hover:bg-surface hover:text-ink";

export function AccountMenu({
  fullName,
  email,
}: {
  fullName: string;
  email: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-1.5 rounded-full border border-border bg-white py-1 pl-1 pr-2 hover:border-border-strong"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-2 text-[11.5px] font-medium tracking-[-0.01em] text-ink">
          {initialsOf(fullName)}
        </span>
        <ChevronDown
          width={14}
          height={14}
          strokeWidth={1.6}
          className={
            "text-muted transition-transform duration-150" +
            (open ? " rotate-180" : "")
          }
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] w-[224px] overflow-hidden rounded-card border border-border bg-white py-1 shadow-[0_1px_2px_rgba(0,0,0,.04),0_16px_32px_-20px_rgba(15,15,16,.28)]"
        >
          <div className="border-b border-border px-3.5 pb-2.5 pt-2">
            <div className="truncate text-[13.5px] font-medium text-ink">
              {fullName}
            </div>
            <div className="truncate text-[12.5px] text-muted">{email}</div>
          </div>

          <Link href="/account" role="menuitem" className={itemClass} onClick={() => setOpen(false)}>
            Account
          </Link>
          <Link href="/tokens" role="menuitem" className={itemClass} onClick={() => setOpen(false)}>
            Billing
          </Link>

          <form action={signOutAction} className="border-t border-border">
            <button type="submit" role="menuitem" className={itemClass}>
              Sign out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
