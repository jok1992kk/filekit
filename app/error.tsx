"use client";

import Link from "next/link";

import { Container, Section } from "@/components/site/Section";
import { buttonClass } from "@/components/ui/Button";

/** Root error boundary. Renders inside the existing root layout (Next only
 * swaps in a fresh <html>/<body> for global-error.tsx, not this file) — and
 * deliberately skips Header/Footer, since whatever crashed the tree might be
 * a shared component they depend on too. */
export default function ErrorBoundary({ reset }: { error: Error; reset: () => void }) {
  return (
    <Section className="flex flex-col items-center text-center">
      <Container className="flex flex-col items-center">
        <div className="eyebrow">Error</div>
        <h1 className="mt-3 text-[clamp(28px,3.2vw,38px)]">Something went wrong.</h1>
        <p className="mt-3.5 max-w-[440px] text-[16.5px] leading-[1.55]">
          An unexpected error occurred. You can try again, or head back to the home page.
        </p>
        <div className="mt-7 flex gap-3">
          <button type="button" onClick={reset} className={buttonClass()}>
            Try again
          </button>
          <Link href="/" className={buttonClass({ variant: "ghost" })}>
            Back to Home
          </Link>
        </div>
      </Container>
    </Section>
  );
}
