"use client";

import Link from "next/link";
import BlogArticleContent from "@/components/BlogArticleContent";
import { useLanguage } from "@/contexts/LanguageContext";
import { getPrimaryBlogTag, type BlogPost } from "@/lib/blog";

type BlogArticleViewProps = {
  post: BlogPost;
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

export default function BlogArticleView({ post }: BlogArticleViewProps) {
  const { t, locale } = useLanguage();
  const b = t.blog;
  const primaryTag = getPrimaryBlogTag(post);

  return (
    <>
      <Link
        href="/blogg"
        className="inline-flex items-center gap-2 text-sm font-semibold text-rose-600 transition hover:text-rose-700"
      >
        ← {b.backToBlog}
      </Link>

      <article className="mt-8">
        <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-zinc-500">
          <span className="rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-semibold text-rose-700">
            {primaryTag}
          </span>
          <span>{formatBlogDate(post.createdAt, locale)}</span>
          <span aria-hidden>·</span>
          <span>{post.readingTime}</span>
        </div>

        <h1 className="mt-6 text-3xl font-bold leading-tight tracking-tight text-zinc-900 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="mt-5 text-lg leading-relaxed text-zinc-600">{post.excerpt}</p>
        )}

        {post.keyPoints.length > 0 && (
          <aside className="mt-10 rounded-2xl border border-rose-200/80 bg-gradient-to-br from-white via-[#FDF3F3] to-rose-50/80 p-6 shadow-sm shadow-rose-100/60 sm:p-8">
            <h2 className="text-sm font-bold uppercase tracking-wide text-rose-700">
              {b.keyPoints}
            </h2>
            <ul className="mt-4 space-y-3">
              {post.keyPoints.map((point, index) => (
                <li
                  key={index}
                  className="flex gap-3 text-sm leading-relaxed text-zinc-700 sm:text-base"
                >
                  <span
                    className="mt-2 h-2 w-2 shrink-0 rounded-full bg-rose-400"
                    aria-hidden
                  />
                  <span className="whitespace-pre-line">{point}</span>
                </li>
              ))}
            </ul>
          </aside>
        )}

        <div className="mt-10">
          <BlogArticleContent content={post.content} />
        </div>

        {post.tags.length > 0 && (
          <div className="mt-12 flex flex-wrap gap-2 border-t border-rose-100 pt-8">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-rose-100 bg-rose-50/50 px-3 py-1 text-xs font-semibold text-rose-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </article>
    </>
  );
}
