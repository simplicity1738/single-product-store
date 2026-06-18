"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useLanguage();

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("[SimpliCity] Unhandled error:", error);
    }
  }, [error]);

  return (
    <div className="flex min-h-full flex-col bg-gradient-to-b from-rose-50 via-white to-rose-50/40">
      <header className="border-b border-rose-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-4 px-4 sm:h-24 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-pink-200 bg-rose-50 shadow-md shadow-rose-100 sm:h-20 sm:w-20">
              <Image
                src="/logo.png"
                alt={t.brand}
                width={200}
                height={200}
                className="h-[115%] w-[115%] object-cover object-center"
                priority
              />
            </div>
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-pink-200 bg-rose-50 shadow-lg shadow-rose-100 sm:h-28 sm:w-28">
          <svg
            className="h-12 w-12 text-rose-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>

        <h1 className="mt-10 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
          {t.errors.global.title}
          <span className="mt-1 block text-lg font-medium text-zinc-500 sm:text-xl">
            {t.errors.global.titleEn}
          </span>
        </h1>

        <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-600 sm:text-base">
          {t.errors.global.description}
        </p>

        {error.digest && (
          <p className="mt-3 font-mono text-xs text-zinc-400">
            Ref: {error.digest}
          </p>
        )}

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-12 items-center justify-center rounded-full bg-rose-400 px-8 text-sm font-semibold text-white transition hover:bg-rose-500"
          >
            {t.errors.global.tryAgain}
          </button>
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-full border border-rose-200 bg-white px-8 text-sm font-semibold text-zinc-800 transition hover:border-rose-300 hover:bg-rose-50"
          >
            {t.errors.global.backHome}
          </Link>
        </div>
      </main>
    </div>
  );
}
