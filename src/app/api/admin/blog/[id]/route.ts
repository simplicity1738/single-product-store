import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth.server";
import {
  deleteBlogPost,
  getBlogPostById,
  updateBlogPost,
} from "@/lib/blog.server";
import type { BlogPost } from "@/lib/blog";
import { sanitizeIdentifier } from "@/lib/sanitize";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  const postId = sanitizeIdentifier(id, 80);
  if (!postId) {
    return NextResponse.json(
      { success: false, message: "Ogiltigt artikel-ID." },
      { status: 400 },
    );
  }

  const post = await getBlogPostById(postId);
  if (!post) {
    return NextResponse.json(
      { success: false, message: "Artikeln hittades inte." },
      { status: 404 },
    );
  }

  return NextResponse.json({ post });
}

export async function PUT(request: Request, context: RouteContext) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  const postId = sanitizeIdentifier(id, 80);
  if (!postId) {
    return NextResponse.json(
      { success: false, message: "Ogiltigt artikel-ID." },
      { status: 400 },
    );
  }

  try {
    const body = (await request.json()) as Partial<BlogPost>;
    const post = await updateBlogPost(postId, body);

    if (!post) {
      return NextResponse.json(
        { success: false, message: "Artikeln hittades inte." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Artikel uppdaterad.",
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
      { success: false, message: "Kunde inte uppdatera artikeln." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  const postId = sanitizeIdentifier(id, 80);
  if (!postId) {
    return NextResponse.json(
      { success: false, message: "Ogiltigt artikel-ID." },
      { status: 400 },
    );
  }

  const deleted = await deleteBlogPost(postId);
  if (!deleted) {
    return NextResponse.json(
      { success: false, message: "Artikeln hittades inte." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    message: "Artikel borttagen.",
  });
}
