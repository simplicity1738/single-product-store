"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Cormorant_Garamond } from "next/font/google";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  filterBlogPosts,
  getPrimaryBlogTag,
  type BlogCategoryId,
  type BlogPost,
} from "@/lib/blog";

const blogDisplay = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

type BlogIndexProps = {
  initialPosts: BlogPost[];
};

function formatBlogDate(value: string, locale: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(locale === "en" ? "en-GB" : "sv-SE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function BlogCard({ post, locale }: { post: BlogPost; locale: string }) {
  const primaryTag = getPrimaryBlogTag(post);

  return (
    <Link
      href={`/blogg/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-0 text-white shadow-xl transition-all hover:border-white/20"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[#181312]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[#ECE5D8] transition group-hover:scale-105">
            <svg
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
              />
            </svg>
          </div>
        </div>
        <span className="absolute left-4 top-4 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase text-[#ECE5D8]">
          {primaryTag}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h2 className="text-lg font-semibold leading-snug text-white transition group-hover:text-[#ECE5D8]">
          {post.title}
        </h2>
        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-[#CFC4BD]">
          {post.excerpt}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium text-[#A89A92]">
          <span>{formatBlogDate(post.createdAt, locale)}</span>
          <span aria-hidden>·</span>
          <span>{post.readingTime}</span>
        </div>
      </div>
    </Link>
  );
}

export default function BlogIndex({ initialPosts }: BlogIndexProps) {
  const { t, locale } = useLanguage();
  const b = t.blog;

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<BlogCategoryId>("all");

  const filteredPosts = useMemo(
    () => filterBlogPosts(initialPosts, query, category),
    [initialPosts, query, category],
  );

  const categories: { id: BlogCategoryId; label: string }[] = [
    { id: "all", label: b.filterAll },
    { id: "dosering", label: b.filterDosing },
    { id: "forskning", label: b.filterResearch },
    { id: "guider", label: b.filterGuides },
  ];

  return (
    <>
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#ECE5D8]">
          {b.eyebrow}
        </p>
        <h1
          className={`${blogDisplay.className} mt-3 text-4xl font-serif tracking-tight text-white md:text-5xl`}
        >
          {b.title}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[#CFC4BD] md:text-base">
          {b.subtitle}
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-2xl">
        <label className="relative block">
          <span className="sr-only">{b.searchLabel}</span>
          <svg
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#A89A92]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={b.searchPlaceholder}
            className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
          />
        </label>
      </div>

      <div className="mx-auto mt-6 flex max-w-4xl flex-wrap justify-center gap-2">
        {categories.map((entry) => {
          const selected = category === entry.id;
          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => setCategory(entry.id)}
              aria-pressed={selected}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                selected
                  ? "border-[#ECE5D8] bg-[#ECE5D8] font-semibold text-[#0F0C0B]"
                  : "border-white/10 bg-white/5 text-[#CFC4BD] hover:border-white/20 hover:text-white"
              }`}
            >
              {entry.label}
            </button>
          );
        })}
      </div>

      {filteredPosts.length === 0 ? (
        <p className="mx-auto mt-12 max-w-lg rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-10 text-center text-sm text-[#A89A92]">
          {b.emptyResults}
        </p>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredPosts.map((post) => (
            <BlogCard key={post.id} post={post} locale={locale} />
          ))}
        </div>
      )}
    </>
  );
}
