"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, MailCheck } from "lucide-react";

import { buttonClass } from "@/components/ui/Button";
import { forgotPasswordAction, type ForgotPasswordState } from "@/app/actions/auth";

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
      {pending ? "Sending…" : "Send reset link"}
    </button>
  );
}

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState<ForgotPasswordState, FormData>(
    forgotPasswordAction,
    {},
  );

  if (state.sent) {
    return (
      <p className="flex items-start gap-2 rounded-ctl border border-border bg-surface px-3 py-2.5 text-[13.5px] text-ink">
        <MailCheck width={15} height={15} strokeWidth={1.7} className="mt-[3px] flex-none text-accent" />
        If that email has an account, a reset link is on its way.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-[13.5px] font-medium text-ink" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
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
