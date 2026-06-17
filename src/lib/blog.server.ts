import { KV_KEYS, readKvData, writeKvData } from "@/lib/kv-store";
import {
  slugifyBlogTitle,
  sortBlogPosts,
  type BlogPost,
} from "@/lib/blog";
import { sanitizeMultilineText, sanitizePlainText } from "@/lib/sanitize";

export const BLOG_FIELD_LIMITS = {
  title: 200,
  slug: 120,
  excerpt: 500,
  content: 50000,
  keyPoint: 300,
  tag: 40,
  readingTime: 40,
  maxKeyPoints: 12,
  maxTags: 10,
} as const;

function normalizeStringArray(
  value: unknown,
  itemLimit: number,
  maxItems: number,
): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => sanitizePlainText(String(entry ?? ""), itemLimit))
    .filter(Boolean)
    .slice(0, maxItems);
}

export function normalizeBlogPost(
  entry: Partial<BlogPost>,
  existing?: BlogPost,
): BlogPost {
  const title = sanitizePlainText(entry.title ?? existing?.title ?? "", BLOG_FIELD_LIMITS.title);
  const slugSource = entry.slug ?? existing?.slug ?? title;
  const slug =
    sanitizePlainText(slugifyBlogTitle(slugSource), BLOG_FIELD_LIMITS.slug) ||
    `post-${Date.now()}`;

  const createdAt = existing?.createdAt ?? entry.createdAt ?? new Date().toISOString();

  return {
    id: entry.id?.trim() || existing?.id || `blog-${Date.now()}`,
    title,
    slug,
    excerpt: sanitizePlainText(entry.excerpt ?? existing?.excerpt ?? "", BLOG_FIELD_LIMITS.excerpt),
    content: sanitizeMultilineText(
      entry.content ?? existing?.content ?? "",
      BLOG_FIELD_LIMITS.content,
    ),
    keyPoints: normalizeStringArray(
      entry.keyPoints ?? existing?.keyPoints,
      BLOG_FIELD_LIMITS.keyPoint,
      BLOG_FIELD_LIMITS.maxKeyPoints,
    ),
    tags: normalizeStringArray(
      entry.tags ?? existing?.tags,
      BLOG_FIELD_LIMITS.tag,
      BLOG_FIELD_LIMITS.maxTags,
    ),
    readingTime: sanitizePlainText(
      entry.readingTime ?? existing?.readingTime ?? "5 min läsning",
      BLOG_FIELD_LIMITS.readingTime,
    ),
    createdAt,
  };
}

export async function readBlogPosts(): Promise<BlogPost[]> {
  const parsed = await readKvData<BlogPost[]>(
    KV_KEYS.BLOG_POSTS,
    "blog-posts.json",
    [],
  );

  if (!Array.isArray(parsed)) return [];
  return sortBlogPosts(parsed.map((entry) => normalizeBlogPost(entry)));
}

async function writeBlogPosts(posts: BlogPost[]): Promise<void> {
  await writeKvData(KV_KEYS.BLOG_POSTS, "blog-posts.json", sortBlogPosts(posts));
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  const posts = await readBlogPosts();
  return posts.find((entry) => entry.id === id) ?? null;
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const normalized = slugifyBlogTitle(slug);
  const posts = await readBlogPosts();
  return posts.find((entry) => entry.slug === normalized) ?? null;
}

function assertUniqueSlug(posts: BlogPost[], slug: string, excludeId?: string): void {
  const conflict = posts.find(
    (entry) => entry.slug === slug && entry.id !== excludeId,
  );
  if (conflict) {
    throw new Error("SLUG_CONFLICT");
  }
}

export async function createBlogPost(input: Partial<BlogPost>): Promise<BlogPost> {
  const posts = await readBlogPosts();
  const post = normalizeBlogPost(input);
  assertUniqueSlug(posts, post.slug);
  posts.push(post);
  await writeBlogPosts(posts);
  return post;
}

export async function updateBlogPost(
  id: string,
  input: Partial<BlogPost>,
): Promise<BlogPost | null> {
  const posts = await readBlogPosts();
  const index = posts.findIndex((entry) => entry.id === id);
  if (index < 0) return null;

  const post = normalizeBlogPost({ ...posts[index], ...input, id }, posts[index]);
  assertUniqueSlug(posts, post.slug, id);
  posts[index] = post;
  await writeBlogPosts(posts);
  return post;
}

export async function deleteBlogPost(id: string): Promise<BlogPost | null> {
  const posts = await readBlogPosts();
  const target = posts.find((entry) => entry.id === id);
  if (!target) return null;

  const next = posts.filter((entry) => entry.id !== id);
  await writeBlogPosts(next);
  return target;
}
