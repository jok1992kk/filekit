import type { Metadata } from "next";
import Link from "next/link";

import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Container, Section } from "@/components/site/Section";
import { buttonClass } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <>
      <Header />
      <main>
        <Section className="flex flex-col items-center text-center">
          <Container className="flex flex-col items-center">
            <div className="eyebrow">404</div>
            <h1 className="mt-3 text-[clamp(28px,3.2vw,38px)]">Page not found.</h1>
            <p className="mt-3.5 max-w-[440px] text-[16.5px] leading-[1.55]">
              The page you&apos;re looking for doesn&apos;t exist, or has moved.
            </p>
            <Link href="/" className={buttonClass({ className: "mt-7" })}>
              Back to Home
            </Link>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
