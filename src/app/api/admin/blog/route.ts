import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth.server";
import { revalidateBlogPaths } from "@/lib/blog-cache";
import { createBlogPost, readBlogPosts } from "@/lib/blog.server";
import type { BlogPost } from "@/lib/blog";

export async function GET() {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const posts = await readBlogPosts();
  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  try {
    const body = (await request.json()) as Partial<BlogPost>;
    const post = await createBlogPost(body);

    revalidateBlogPaths(post.slug);

    return NextResponse.json({
      success: true,
      message: "Artikel skapad.",
      post,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "SLUG_CONFLICT") {
      return NextResponse.json(
        { success: false, message: "Sluggen används redan av en annan artikel." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { success: false, message: "Kunde inte skapa artikeln." },
      { status: 500 },
    );
  }
}
