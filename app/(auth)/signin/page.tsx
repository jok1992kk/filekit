import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth/AuthForm";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (await getCurrentUser()) redirect("/dashboard");
  const { next } = await searchParams;

  return (
    <>
      <h1 className="text-[24px]">Welcome back</h1>
      <p className="mt-2 mb-6 text-[14.5px] leading-[1.55]">
        Sign in to prepare your product photos.
      </p>

      <AuthForm mode="signin" next={next} />

      <p className="mt-5 text-[13.5px] text-muted">
        New here?{" "}
        <Link href="/signup" className="font-medium text-ink hover:underline">
          Create an account
        </Link>
      </p>
    </>
  );
}
