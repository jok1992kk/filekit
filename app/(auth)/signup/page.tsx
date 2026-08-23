import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth/AuthForm";
import { getCurrentUser } from "@/lib/auth";
import { SIGNUP_FREE_TOKENS } from "@/lib/plans";

export const metadata: Metadata = { title: "Create your account" };

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (await getCurrentUser()) redirect("/dashboard");
  const { next } = await searchParams;

  return (
    <>
      <h1 className="text-[24px]">Create your account</h1>
      <p className="mt-2 mb-6 text-[14.5px] leading-[1.55]">
        {SIGNUP_FREE_TOKENS} free tokens to start. No card required.
      </p>

      <AuthForm mode="signup" next={next} />

      <p className="mt-5 text-[13.5px] text-muted">
        Already have an account?{" "}
        <Link href="/signin" className="font-medium text-ink hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
