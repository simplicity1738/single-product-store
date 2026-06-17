import { NextResponse } from "next/server";
import { readBlogPosts } from "@/lib/blog.server";

export async function GET() {
  const posts = await readBlogPosts();
  return NextResponse.json({ posts });
}
