import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogArticleView from "@/components/BlogArticleView";
import { getBlogPostBySlug } from "@/lib/blog.server";

export const dynamic = "force-dynamic";

type BlogArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: BlogArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return { title: "Artikel hittades inte — SimpliCity" };
  }

  return {
    title: `${post.title} — SimpliCity`,
    description: post.excerpt,
  };
}

export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-[#FDF3F3]/70 via-rose-50/20 to-white text-zinc-900">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <BlogArticleView post={post} />
      </main>
      <Footer />
    </div>
  );
}
