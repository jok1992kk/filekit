"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle } from "lucide-react";

import { buttonClass } from "@/components/ui/Button";
import {
  signInAction,
  signUpAction,
  type AuthFormState,
} from "@/app/actions/auth";

const fieldClass =
  "h-11 w-full rounded-ctl border border-border bg-white px-3 text-[15px] text-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-muted focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-tint)]";

const labelClass = "mb-1.5 block text-[13.5px] font-medium text-ink";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={buttonClass({ block: true, className: "disabled:opacity-60" })}
    >
      {pending ? "One moment…" : label}
    </button>
  );
}

export function AuthForm({
  mode,
  next,
}: {
  mode: "signup" | "signin";
  /** Path to return to once authenticated. */
  next?: string;
}) {
  const isSignUp = mode === "signup";
  const action = isSignUp ? signUpAction : signInAction;
  const [state, formAction] = useActionState<AuthFormState, FormData>(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {next ? <input type="hidden" name="next" value={next} /> : null}

      {isSignUp ? (
        <div>
          <label className={labelClass} htmlFor="fullName">
            Name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            required
            defaultValue={state.fullName ?? ""}
            placeholder="Jordan Miller"
            className={fieldClass}
          />
        </div>
      ) : null}

      <div>
        <label className={labelClass} htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.email ?? ""}
          placeholder="you@example.com"
          className={fieldClass}
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className={labelClass} htmlFor="password">
            Password
          </label>
          {!isSignUp ? (
            <Link href="/forgot-password" className="mb-1.5 text-[13px] text-muted hover:text-accent">
              Forgot password?
            </Link>
          ) : null}
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={isSignUp ? "new-password" : "current-password"}
          required
          minLength={isSignUp ? 8 : undefined}
          placeholder={isSignUp ? "At least 8 characters" : "••••••••"}
          className={fieldClass}
        />
      </div>

      {state.error ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-ctl border border-border bg-surface px-3 py-2.5 text-[13.5px] text-ink"
        >
          <AlertCircle
            width={15}
            height={15}
            strokeWidth={1.7}
            className="mt-[3px] flex-none text-muted"
          />
          {state.error}
        </p>
      ) : null}

      <SubmitButton label={isSignUp ? "Create account" : "Sign in"} />
    </form>
  );
}
