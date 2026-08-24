import Link from "next/link";

import { Container } from "@/components/site/Section";
import { Wordmark } from "@/components/site/Wordmark";
import { brand } from "@/lib/brand";

const columns = [
  {
    title: "Product",
    links: [
      { href: "/tools", label: "Tools" },
      { href: "/pricing", label: "Pricing" },
      { href: "/examples", label: "Examples" },
      { href: "/#faq", label: "FAQ" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/terms", label: "Terms" },
      { href: "/privacy", label: "Privacy" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/signin", label: "Sign In" },
      { href: "/signup", label: "Create Account" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <Container className="grid grid-cols-[minmax(0,320px)_repeat(3,minmax(0,160px))] gap-10 py-16 max-tab:grid-cols-2 max-mob:grid-cols-1 max-mob:gap-9 max-mob:py-11">
        <div>
          <Wordmark />
          <p className="mt-3.5 max-w-[280px] text-[14px] leading-[1.55] text-muted">
            {brand.tagline}
          </p>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <div className="eyebrow">{column.title}</div>
            <ul className="mt-4 flex flex-col gap-3">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[14px] text-body hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>

      <div className="border-t border-border">
        <Container className="py-6 text-[13px] text-muted">
          © 2026 {brand.name}. All rights reserved.
        </Container>
      </div>
    </footer>
  );
}
