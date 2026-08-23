import { redirect } from "next/navigation";

import { AppHeader } from "@/components/app/AppHeader";
import { getCurrentUser } from "@/lib/auth";

/**
 * The real guard. `middleware.ts` only sees whether a cookie exists; this
 * runs on Node, resolves the token against the auth store, and is what
 * actually stands between a stale cookie and a private page.
 */
export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");

  return (
    <>
      <AppHeader user={user} />
      <main>{children}</main>
    </>
  );
}
