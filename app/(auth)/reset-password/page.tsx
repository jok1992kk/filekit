import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Set a new password" };

export default async function ResetPasswordPage() {
  // Only reachable with a live session, which /auth/callback?type=recovery
  // sets after verifying the emailed link — no session means the link was
  // never clicked (or already used), so there is nothing to reset here.
  if (!(await getCurrentUser())) redirect("/forgot-password");

  return (
    <>
      <h1 className="text-[24px]">Set a new password</h1>
      <p className="mt-2 mb-6 text-[14.5px] leading-[1.55]">
        Choose a new password for your account.
      </p>

      <ResetPasswordForm />
    </>
  );
}
