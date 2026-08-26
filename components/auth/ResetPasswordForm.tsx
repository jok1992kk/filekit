"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle } from "lucide-react";

import { buttonClass } from "@/components/ui/Button";
import { resetPasswordAction, type ResetPasswordState } from "@/app/actions/auth";

const fieldClass =
  "h-11 w-full rounded-ctl border border-border bg-white px-3 text-[15px] text-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-muted focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-tint)]";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={buttonClass({ block: true, className: "disabled:opacity-60" })}
    >
      {pending ? "Saving…" : "Set new password"}
    </button>
  );
}

export function ResetPasswordForm() {
  const [state, formAction] = useActionState<ResetPasswordState, FormData>(
    resetPasswordAction,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-[13.5px] font-medium text-ink" htmlFor="password">
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="At least 8 characters"
          className={fieldClass}
        />
      </div>

      {state.error ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-ctl border border-border bg-surface px-3 py-2.5 text-[13.5px] text-ink"
        >
          <AlertCircle width={15} height={15} strokeWidth={1.7} className="mt-[3px] flex-none text-muted" />
          {state.error}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
