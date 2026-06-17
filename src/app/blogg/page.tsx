import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogIndex from "@/components/BlogIndex";
import { readBlogPosts } from "@/lib/blog.server";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await readBlogPosts();

  return (
    <div className="min-h-full bg-gradient-to-b from-[#FDF3F3]/70 via-rose-50/30 to-white text-zinc-900">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <BlogIndex initialPosts={posts} />
      </main>
      <Footer />
    </div>
  );
}
