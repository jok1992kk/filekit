import type { Metadata } from "next";
import Link from "next/link";

import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="text-[24px]">Reset your password</h1>
      <p className="mt-2 mb-6 text-[14.5px] leading-[1.55]">
        Enter your email and we&apos;ll send you a link to set a new one.
      </p>

      <ForgotPasswordForm />

      <p className="mt-5 text-[13.5px] text-muted">
        <Link href="/signin" className="font-medium text-ink hover:underline">
          Back to sign in
        </Link>
      </p>
    </>
  );
}
