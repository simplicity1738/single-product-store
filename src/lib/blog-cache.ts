import { revalidatePath } from "next/cache";

/** Bust Next.js caches for the blog index and an optional article slug. */
export function revalidateBlogPaths(slug?: string): void {
  revalidatePath("/blogg");
  revalidatePath("/blogg", "layout");

  if (slug) {
    revalidatePath(`/blogg/${slug}`);
  }
}
