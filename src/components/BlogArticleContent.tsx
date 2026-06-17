"use client";

import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";

const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="mt-10 scroll-mt-24 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-8 scroll-mt-24 text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-6 text-lg font-semibold text-zinc-900">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="mb-4 text-base leading-relaxed text-zinc-700">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mb-4 list-disc space-y-2 pl-6 text-base leading-relaxed text-zinc-700">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 list-decimal space-y-2 pl-6 text-base leading-relaxed text-zinc-700">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-zinc-900">{children}</strong>
  ),
  em: ({ children }) => <em className="italic text-zinc-700">{children}</em>,
  a: ({ href, children }) => (
    <a
      href={href}
      className="font-medium text-rose-600 underline decoration-rose-200 underline-offset-2 transition hover:text-rose-700"
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      target={href?.startsWith("http") ? "_blank" : undefined}
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mb-4 border-l-4 border-rose-200 pl-4 italic text-zinc-600">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-8 border-rose-100" />,
  code: ({ children }) => (
    <code className="rounded bg-rose-50 px-1.5 py-0.5 text-sm text-rose-800">
      {children}
    </code>
  ),
};

type BlogArticleContentProps = {
  content: string;
};

export default function BlogArticleContent({ content }: BlogArticleContentProps) {
  const trimmed = content.trim();

  if (!trimmed) {
    return null;
  }

  return (
    <div className="blog-article-content">
      <ReactMarkdown components={markdownComponents}>{trimmed}</ReactMarkdown>
    </div>
  );
}
