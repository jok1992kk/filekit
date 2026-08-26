import Link from "next/link";

import { AccountMenu } from "@/components/app/AccountMenu";
import { Container } from "@/components/site/Section";
import { Wordmark } from "@/components/site/Wordmark";
import type { PublicUser } from "@/lib/auth";
import { tokenBalance } from "@/lib/auth";
import { formatCount } from "@/lib/utils";

const appNav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/editor", label: "Editor" },
] as const;

/** The signed-in header (SPEC.md §9): wordmark, app nav, balance pill, avatar. */
export function AppHeader({ user }: { user: PublicUser }) {
  const balance = tokenBalance(user);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white">
      <Container className="flex h-16 items-center gap-9 max-mob:gap-4">
        <Wordmark />

        <nav className="flex gap-[26px] text-[14.5px] max-tab:hidden">
          {appNav.map((item) => (
            <Link key={item.href} href={item.href} className="text-body hover:text-ink">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <span className="flex items-center gap-1 rounded-full border border-border bg-white px-2.5 py-[5px] text-[12.5px] text-muted">
            <span className="font-medium text-ink">{formatCount(balance)}</span>
            {balance === 1 ? "token" : "tokens"}
          </span>
          <AccountMenu fullName={user.fullName} email={user.email} />
        </div>
      </Container>
    </header>
  );
}
