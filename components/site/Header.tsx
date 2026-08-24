"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

import { Container } from "@/components/site/Section";
import { Wordmark } from "@/components/site/Wordmark";
import { buttonClass } from "@/components/ui/Button";
import { primaryNav } from "@/lib/brand";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white">
      <Container className="flex h-16 items-center gap-9">
        <Wordmark />

        <nav className="flex gap-[26px] text-[14.5px] max-tab:hidden">
          {primaryNav.map((item, index) => (
            <Link
              key={`${item.href}-${index}`}
              href={item.href}
              className="text-body hover:text-accent"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-[18px] max-tab:hidden">
          <Link href="/signin" className="text-[14.5px] text-body hover:text-ink">
            Sign In
          </Link>
          <Link href="/signup" className={buttonClass({ size: "sm" })}>
            Get Started
          </Link>
        </div>

        <button
          type="button"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="ml-auto hidden h-9 w-9 items-center justify-center rounded-ctl border border-border bg-white max-tab:flex"
        >
          <Menu width={16} height={16} strokeWidth={1.5} className="text-ink" />
        </button>
      </Container>

      {open ? (
        <div className="border-b border-border bg-white">
          {primaryNav.map((item, index) => (
            <Link
              key={`${item.href}-${index}`}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block border-b border-border px-6 py-[13px] text-[15px]"
            >
              {item.label}
            </Link>
          ))}
          <div className="flex gap-[10px] px-6 py-[14px]">
            <Link
              href="/signin"
              onClick={() => setOpen(false)}
              className={buttonClass({
                variant: "ghost",
                size: "sm",
                className: "flex-1",
              })}
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              onClick={() => setOpen(false)}
              className={buttonClass({ size: "sm", className: "flex-1" })}
            >
              Get Started
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
