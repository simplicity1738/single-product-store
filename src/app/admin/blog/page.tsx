"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  SUGGESTED_BLOG_TAGS,
  slugifyBlogTitle,
  type BlogPost,
} from "@/lib/blog";

type BlogDraft = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  keyPoints: string[];
  tags: string[];
  readingTime: string;
};

type ViewMode = "list" | "create" | "edit";

type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

const emptyDraft = (): BlogDraft => ({
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  keyPoints: [""],
  tags: [],
  readingTime: "7 min läsning",
});

function draftFromPost(post: BlogPost): BlogDraft {
  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    keyPoints: post.keyPoints.length > 0 ? post.keyPoints : [""],
    tags: post.tags,
    readingTime: post.readingTime,
  };
}

function formatBlogDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [view, setView] = useState<ViewMode>("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<BlogDraft>(emptyDraft);
  const [slugTouched, setSlugTouched] = useState(false);
  const [customTag, setCustomTag] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = useCallback((next: ToastState) => {
    setToast(next);
    if (next) {
      window.setTimeout(() => setToast(null), 3200);
    }
  }, []);

  const loadPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/blog");
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "Load failed");
      setPosts(Array.isArray(data.posts) ? data.posts : []);
    } catch {
      showToast({ type: "error", message: "Kunde inte ladda bloggartiklar." });
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  function openCreate() {
    setDraft(emptyDraft());
    setSlugTouched(false);
    setEditingId(null);
    setView("create");
  }

  function openEdit(post: BlogPost) {
    setDraft(draftFromPost(post));
    setSlugTouched(true);
    setEditingId(post.id);
    setView("edit");
  }

  function backToList() {
    setView("list");
    setEditingId(null);
    setDraft(emptyDraft());
    setSlugTouched(false);
  }

  function updateDraft<K extends keyof BlogDraft>(field: K, value: BlogDraft[K]) {
    setDraft((current) => {
      const next = { ...current, [field]: value };
      if (field === "title" && !slugTouched) {
        next.slug = slugifyBlogTitle(String(value));
      }
      return next;
    });
  }

  function toggleTag(tag: string) {
    setDraft((current) => ({
      ...current,
      tags: current.tags.includes(tag)
        ? current.tags.filter((entry) => entry !== tag)
        : [...current.tags, tag],
    }));
  }

  function addCustomTag() {
    const trimmed = customTag.trim();
    if (!trimmed) return;
    setDraft((current) => ({
      ...current,
      tags: current.tags.includes(trimmed)
        ? current.tags
        : [...current.tags, trimmed],
    }));
    setCustomTag("");
  }

  function updateKeyPoint(index: number, value: string) {
    setDraft((current) => ({
      ...current,
      keyPoints: current.keyPoints.map((entry, entryIndex) =>
        entryIndex === index ? value : entry,
      ),
    }));
  }

  function addKeyPoint() {
    setDraft((current) => ({
      ...current,
      keyPoints: [...current.keyPoints, ""],
    }));
  }

  function removeKeyPoint(index: number) {
    setDraft((current) => ({
      ...current,
      keyPoints: current.keyPoints.filter((_, entryIndex) => entryIndex !== index),
    }));
  }

  async function handleSave() {
    if (!draft.title.trim() || !draft.content.trim()) {
      showToast({ type: "error", message: "Titel och innehåll krävs." });
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...draft,
        slug: slugifyBlogTitle(draft.slug || draft.title),
        keyPoints: draft.keyPoints.map((entry) => entry.trim()).filter(Boolean),
      };

      const response = await fetch(
        view === "edit" && editingId ? `/api/admin/blog/${editingId}` : "/api/admin/blog",
        {
          method: view === "edit" ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message ?? "Save failed");
      }

      showToast({
        type: "success",
        message: view === "edit" ? "Artikel uppdaterad." : "Artikel skapad.",
      });
      await loadPosts();
      backToList();
    } catch (error) {
      showToast({
        type: "error",
        message:
          error instanceof Error ? error.message : "Kunde inte spara artikeln.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(post: BlogPost) {
    if (!window.confirm(`Ta bort "${post.title}"?`)) return;

    try {
      const response = await fetch(`/api/admin/blog/${post.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message ?? "Delete failed");
      }

      showToast({ type: "success", message: "Artikel borttagen." });
      if (editingId === post.id) backToList();
      await loadPosts();
    } catch (error) {
      showToast({
        type: "error",
        message:
          error instanceof Error ? error.message : "Kunde inte ta bort artikeln.",
      });
    }
  }

  return (
    <div className="min-h-screen text-white">
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full px-6 py-3 text-sm font-semibold shadow-lg ${
            toast.type === "success"
              ? "bg-[#ECE5D8] text-[#0F0C0B] shadow-md"
              : "bg-red-500 text-white shadow-red-500/30"
          }`}
          role="status"
        >
          {toast.message}
        </div>
      )}

      <header className="border-b border-white/10 bg-[#0B0908]/90 px-4 py-5 backdrop-blur-md sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#ECE5D8] lg:hidden">
              Admin · Blogg
            </p>
            <h1 className="text-2xl font-bold text-white">Blogg</h1>
            <p className="mt-1 text-sm text-[#A89A92]">
              Hantera forskningsartiklar, taggar och viktiga punkter.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin"
              className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-xs font-medium uppercase text-[#CFC4BD] transition-all hover:bg-white/10 hover:text-white lg:hidden"
            >
              Översikt
            </Link>
            {view === "list" ? (
              <button
                type="button"
                onClick={openCreate}
                className="rounded-xl bg-[#ECE5D8] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#0F0C0B] shadow-md transition-all hover:bg-white"
              >
                Skapa ny artikel
              </button>
            ) : (
              <button
                type="button"
                onClick={backToList}
                className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-xs font-medium uppercase text-[#CFC4BD] transition-all hover:bg-white/10 hover:text-white"
              >
                Tillbaka till listan
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {view === "list" ? (
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-xl backdrop-blur-md sm:p-8">
            <h2 className="text-lg font-bold text-white">Publicerade artiklar</h2>

            {isLoading ? (
              <p className="mt-6 text-sm text-[#A89A92]">Laddar artiklar…</p>
            ) : posts.length === 0 ? (
              <p className="mt-6 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-10 text-center text-sm text-[#A89A92]">
                Inga artiklar ännu. Skapa din första forskningspost.
              </p>
            ) : (
              <div className="mt-6 space-y-4">
                {posts.map((post) => (
                  <article
                    key={post.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-bold text-white">{post.title}</h3>
                        <p className="mt-1 text-sm text-[#A89A92]">{post.excerpt || "—"}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#A89A92]">
                          <span>{formatBlogDate(post.createdAt)}</span>
                          <span>·</span>
                          <span>{post.readingTime}</span>
                          <span>·</span>
                          <span className="font-mono">/{post.slug}</span>
                        </div>
                        {post.tags.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {post.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full border border-white/10 bg-[#ECE5D8]/10 px-2.5 py-1 text-[10px] font-medium uppercase text-[#ECE5D8]"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(post)}
                          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium uppercase text-[#CFC4BD] transition-all hover:bg-white/10 hover:text-white"
                        >
                          Redigera
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(post)}
                          className="rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/20"
                        >
                          Ta bort
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : (
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-xl backdrop-blur-md sm:p-8">
            <h2 className="text-lg font-bold text-white">
              {view === "edit" ? "Redigera artikel" : "Skapa ny artikel"}
            </h2>

            <div className="mt-6 space-y-5">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
                  Titel
                </span>
                <input
                  value={draft.title}
                  onChange={(event) => updateDraft("title", event.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
                  Slug (URL)
                </span>
                <input
                  value={draft.slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    updateDraft("slug", event.target.value);
                  }}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 font-mono text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
                  Sammanfattning
                </span>
                <textarea
                  value={draft.excerpt}
                  onChange={(event) => updateDraft("excerpt", event.target.value)}
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
                  Lästid
                </span>
                <input
                  value={draft.readingTime}
                  onChange={(event) => updateDraft("readingTime", event.target.value)}
                  placeholder="7 min läsning"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
                />
              </label>

              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
                  Taggar
                </span>
                <div className="mt-3 flex flex-wrap gap-2">
                  {SUGGESTED_BLOG_TAGS.map((tag) => {
                    const selected = draft.tags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        aria-pressed={selected}
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                          selected
                            ? "border-white/20 bg-[#ECE5D8] text-[#0F0C0B]"
                            : "border-white/10 bg-white/5 text-[#CFC4BD] hover:border-white/20 hover:text-white"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 flex gap-2">
                  <input
                    value={customTag}
                    onChange={(event) => setCustomTag(event.target.value)}
                    placeholder="Egen tagg…"
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addCustomTag();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addCustomTag}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-medium uppercase text-[#CFC4BD] transition-all hover:bg-white/10 hover:text-white"
                  >
                    Lägg till
                  </button>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
                  Viktiga punkter
                </span>
                <div className="mt-3 space-y-2">
                  {draft.keyPoints.map((point, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        value={point}
                        onChange={(event) => updateKeyPoint(index, event.target.value)}
                        placeholder={`Punkt ${index + 1}`}
                        className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => removeKeyPoint(index)}
                        className="rounded-xl border border-red-500/20 px-3 text-xs font-semibold text-red-300 transition hover:bg-red-500/10"
                        aria-label="Ta bort punkt"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addKeyPoint}
                  className="mt-3 rounded-full border border-dashed border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase text-[#CFC4BD] transition hover:bg-white/10 hover:text-white"
                >
                  + Lägg till punkt
                </button>
              </div>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
                  Artikelns innehåll
                </span>
                <textarea
                  value={draft.content}
                  onChange={(event) => updateDraft("content", event.target.value)}
                  rows={16}
                  placeholder="Skriv artikelns huvudinnehåll här (markdown stöds)…"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 font-mono text-xs leading-relaxed text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
                />
              </label>

              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={isSaving}
                className="rounded-xl bg-[#ECE5D8] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#0F0C0B] shadow-md transition-all hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Sparar…" : view === "edit" ? "Spara ändringar" : "Publicera artikel"}
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
