export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  keyPoints: string[];
  tags: string[];
  readingTime: string;
  createdAt: string;
};

export const SUGGESTED_BLOG_TAGS = [
  "MT-2",
  "BPC-157",
  "TB-500",
  "GHK-Cu",
  "Semaglutid",
  "Retatrutid",
  "Peptider",
  "Rekonstitution",
  "Dosering",
  "Forskningen",
  "Guider",
] as const;

export type BlogCategoryId = "all" | "dosering" | "forskning" | "guider";

export const BLOG_CATEGORY_FILTERS: {
  id: BlogCategoryId;
  matchTags: string[];
}[] = [
  { id: "all", matchTags: [] },
  {
    id: "dosering",
    matchTags: ["dosering", "titrering", "dosing"],
  },
  {
    id: "forskning",
    matchTags: ["forskningen", "forskning", "research"],
  },
  {
    id: "guider",
    matchTags: ["guider", "guide", "guides"],
  },
];

export function postMatchesCategory(
  post: BlogPost,
  categoryId: BlogCategoryId,
): boolean {
  if (categoryId === "all") return true;

  const filter = BLOG_CATEGORY_FILTERS.find((entry) => entry.id === categoryId);
  if (!filter) return true;

  const normalizedPostTags = post.tags.map((tag) => tag.toLowerCase());
  return filter.matchTags.some((needle) =>
    normalizedPostTags.some(
      (tag) => tag === needle || tag.includes(needle),
    ),
  );
}

export function filterBlogPosts(
  posts: BlogPost[],
  query: string,
  categoryId: BlogCategoryId,
): BlogPost[] {
  const normalizedQuery = query.trim().toLowerCase();

  return posts.filter((post) => {
    if (!postMatchesCategory(post, categoryId)) return false;
    if (!normalizedQuery) return true;

    const haystack = [
      post.title,
      post.excerpt,
      post.content,
      ...post.tags,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });
}

export function getPrimaryBlogTag(post: BlogPost): string {
  return post.tags[0] ?? "Peptider";
}

export function slugifyBlogTitle(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function sortBlogPosts(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}
