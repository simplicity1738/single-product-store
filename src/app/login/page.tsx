"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = (await response.json()) as {
        success?: boolean;
        message?: string;
      };

      if (!response.ok || !data.success) {
        throw new Error(data.message ?? "Invalid password.");
      }

      router.push("/admin");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not sign in. Try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-rose-50 via-rose-50/80 to-white px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-500">
            SimpliCity
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">
            Admin Gateway
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-500">
            Sign in to access the store administration panel.
          </p>
        </div>

        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="rounded-3xl border border-rose-100 bg-white p-8 shadow-lg shadow-rose-100/50"
        >
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Admin Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              disabled={isSubmitting}
              placeholder="Enter your password"
              className="mt-2 w-full rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100 disabled:opacity-60"
            />
          </label>

          {error ? (
            <p
              className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting || !password}
            className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-rose-400 text-sm font-bold text-white shadow-lg shadow-rose-400/30 transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-zinc-400">
          Protected by server-side session controls.
        </p>
      </div>
    </div>
  );
}
