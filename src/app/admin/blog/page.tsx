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
    <div className="min-h-screen text-zinc-900">
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full px-6 py-3 text-sm font-semibold shadow-lg ${
            toast.type === "success"
              ? "bg-emerald-500 text-white shadow-emerald-500/30"
              : "bg-red-500 text-white shadow-red-500/30"
          }`}
          role="status"
        >
          {toast.message}
        </div>
      )}

      <header className="border-b border-rose-100 bg-white/90 px-4 py-5 backdrop-blur-md sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-600 lg:hidden">
              Admin · Blogg
            </p>
            <h1 className="text-2xl font-bold text-zinc-900">Blogg</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Hantera forskningsartiklar, taggar och viktiga punkter.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin"
              className="rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-600 transition hover:border-rose-300 hover:text-rose-700 lg:hidden"
            >
              Översikt
            </Link>
            {view === "list" ? (
              <button
                type="button"
                onClick={openCreate}
                className="rounded-full bg-rose-400 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-500"
              >
                Skapa ny artikel
              </button>
            ) : (
              <button
                type="button"
                onClick={backToList}
                className="rounded-full border border-rose-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-600 transition hover:border-rose-300"
              >
                Tillbaka till listan
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {view === "list" ? (
          <section className="rounded-3xl border border-rose-100 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-lg font-bold text-zinc-900">Publicerade artiklar</h2>

            {isLoading ? (
              <p className="mt-6 text-sm text-zinc-500">Laddar artiklar…</p>
            ) : posts.length === 0 ? (
              <p className="mt-6 rounded-2xl border border-dashed border-rose-200 bg-rose-50/40 px-4 py-10 text-center text-sm text-zinc-500">
                Inga artiklar ännu. Skapa din första forskningspost.
              </p>
            ) : (
              <div className="mt-6 space-y-4">
                {posts.map((post) => (
                  <article
                    key={post.id}
                    className="rounded-2xl border border-rose-100 bg-rose-50/30 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-bold text-zinc-900">{post.title}</h3>
                        <p className="mt-1 text-sm text-zinc-500">{post.excerpt || "—"}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
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
                                className="rounded-full border border-rose-200 bg-white px-2.5 py-1 text-xs font-semibold text-rose-700"
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
                          className="rounded-full border border-rose-200 bg-white px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                        >
                          Redigera
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(post)}
                          className="rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
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
          <section className="rounded-3xl border border-rose-100 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-lg font-bold text-zinc-900">
              {view === "edit" ? "Redigera artikel" : "Skapa ny artikel"}
            </h2>

            <div className="mt-6 space-y-5">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Titel
                </span>
                <input
                  value={draft.title}
                  onChange={(event) => updateDraft("title", event.target.value)}
                  className="mt-2 w-full rounded-xl border border-rose-200 px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Slug (URL)
                </span>
                <input
                  value={draft.slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    updateDraft("slug", event.target.value);
                  }}
                  className="mt-2 w-full rounded-xl border border-rose-200 px-4 py-3 font-mono text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Sammanfattning
                </span>
                <textarea
                  value={draft.excerpt}
                  onChange={(event) => updateDraft("excerpt", event.target.value)}
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-rose-200 px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Lästid
                </span>
                <input
                  value={draft.readingTime}
                  onChange={(event) => updateDraft("readingTime", event.target.value)}
                  placeholder="7 min läsning"
                  className="mt-2 w-full rounded-xl border border-rose-200 px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                />
              </label>

              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
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
                            ? "border-rose-300 bg-rose-50 text-rose-700"
                            : "border-rose-100 bg-white text-zinc-600 hover:border-rose-200"
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
                    className="flex-1 rounded-xl border border-rose-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400"
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
                    className="rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                  >
                    Lägg till
                  </button>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Viktiga punkter
                </span>
                <div className="mt-3 space-y-2">
                  {draft.keyPoints.map((point, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        value={point}
                        onChange={(event) => updateKeyPoint(index, event.target.value)}
                        placeholder={`Punkt ${index + 1}`}
                        className="flex-1 rounded-xl border border-rose-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400"
                      />
                      <button
                        type="button"
                        onClick={() => removeKeyPoint(index)}
                        className="rounded-xl border border-red-200 px-3 text-xs font-semibold text-red-600 transition hover:bg-red-50"
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
                  className="mt-3 rounded-full border border-dashed border-rose-200 bg-rose-50/40 px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                >
                  + Lägg till punkt
                </button>
              </div>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Artikelns innehåll
                </span>
                <textarea
                  value={draft.content}
                  onChange={(event) => updateDraft("content", event.target.value)}
                  rows={16}
                  placeholder="Skriv artikelns huvudinnehåll här (markdown stöds)…"
                  className="mt-2 w-full rounded-xl border border-rose-200 px-4 py-3 font-mono text-sm leading-relaxed outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                />
              </label>

              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={isSaving}
                className="rounded-full bg-rose-400 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
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
