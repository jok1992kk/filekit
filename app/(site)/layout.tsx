import { Header } from "@/components/site/Header";

/**
 * Marketing chrome. Deliberately does not read the session: keeping these
 * pages statically rendered matters more for the home page's LCP than
 * swapping "Sign In" for "Dashboard" in the header.
 */
export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  );
}
