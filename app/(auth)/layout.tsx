import Link from "next/link";

import { Wordmark } from "@/components/site/Wordmark";

/** A centred card on the surface grey, and nothing else to click away to. */
export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface px-6 py-14">
      <Wordmark className="mb-8" />
      <div className="w-full max-w-[400px] rounded-card border border-border bg-white p-8 max-mob:p-6">
        {children}
      </div>
      <p className="mt-6 text-[13px] text-muted">
        <Link href="/" className="hover:text-ink">
          ← Back to site
        </Link>
      </p>
    </main>
  );
}
