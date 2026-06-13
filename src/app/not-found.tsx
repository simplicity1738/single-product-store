"use client";

import Image from "next/image";
import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";

export default function NotFound() {
  const { t } = useLanguage();

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
        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-pink-200 bg-rose-50 shadow-lg shadow-rose-100 sm:h-28 sm:w-28">
          <Image
            src="/logo.png"
            alt={t.brand}
            width={240}
            height={240}
            className="h-[115%] w-[115%] object-cover object-center"
          />
        </div>

        <p className="mt-10 text-7xl font-bold tracking-tight text-rose-200 sm:text-8xl">
          404
        </p>

        <h1 className="mt-4 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
          {t.errors.notFound.title}
          <span className="mt-1 block text-lg font-medium text-zinc-500 sm:text-xl">
            {t.errors.notFound.titleEn}
          </span>
        </h1>

        <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-600 sm:text-base">
          {t.errors.notFound.description}
        </p>

        <Link
          href="/"
          className="mt-10 inline-flex h-12 items-center justify-center rounded-full bg-rose-400 px-8 text-sm font-semibold text-white transition hover:bg-rose-500"
        >
          {t.errors.notFound.backHome}
        </Link>
      </main>
    </div>
  );
}
