"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { DEFAULT_LAB_NAME, type LabTest } from "@/lib/lab-test";

type LabTestDraft = {
  productName: string;
  purity: string;
  batchNumber: string;
  labName: string;
  testDate: string;
  reportUrl: string;
};

type ViewMode = "list" | "create" | "edit";

type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

const emptyDraft = (): LabTestDraft => ({
  productName: "",
  purity: "99.0%",
  batchNumber: "",
  labName: DEFAULT_LAB_NAME,
  testDate: new Date().toISOString().slice(0, 10),
  reportUrl: "",
});

function draftFromTest(test: LabTest): LabTestDraft {
  return {
    productName: test.productName,
    purity: test.purity,
    batchNumber: test.batchNumber,
    labName: test.labName,
    testDate: test.testDate.slice(0, 10),
    reportUrl: test.reportUrl,
  };
}

function formatTestDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminLabTestsPage() {
  const [tests, setTests] = useState<LabTest[]>([]);
  const [view, setView] = useState<ViewMode>("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<LabTestDraft>(emptyDraft());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = useCallback((next: ToastState) => {
    setToast(next);
    if (next) window.setTimeout(() => setToast(null), 3200);
  }, []);

  const loadTests = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/lab-tests");
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "Load failed");
      setTests(Array.isArray(data.tests) ? data.tests : []);
    } catch {
      showToast({ type: "error", message: "Kunde inte ladda labbtester." });
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadTests();
  }, [loadTests]);

  function openCreate() {
    setDraft(emptyDraft());
    setEditingId(null);
    setView("create");
  }

  function openEdit(test: LabTest) {
    setDraft(draftFromTest(test));
    setEditingId(test.id);
    setView("edit");
  }

  function backToList() {
    setView("list");
    setEditingId(null);
    setDraft(emptyDraft());
  }

  async function handleUpload(file: File) {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/lab-tests/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message ?? "Upload failed");
      }

      setDraft((current) => ({ ...current, reportUrl: data.reportUrl }));
      showToast({ type: "success", message: "Analysrapport uppladdad." });
    } catch (error) {
      showToast({
        type: "error",
        message:
          error instanceof Error ? error.message : "Kunde inte ladda upp filen.",
      });
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSave() {
    if (!draft.productName.trim() || !draft.batchNumber.trim() || !draft.reportUrl.trim()) {
      showToast({
        type: "error",
        message: "Produktnamn, batchkod och analysrapport krävs.",
      });
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...draft,
        testDate: new Date(draft.testDate).toISOString(),
      };

      const response = await fetch(
        view === "edit" && editingId
          ? `/api/admin/lab-tests/${editingId}`
          : "/api/admin/lab-tests",
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
        message: view === "edit" ? "Labbtest uppdaterat." : "Labbtest skapat.",
      });
      await loadTests();
      backToList();
    } catch (error) {
      showToast({
        type: "error",
        message:
          error instanceof Error ? error.message : "Kunde inte spara labbtestet.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(test: LabTest) {
    if (!window.confirm(`Ta bort labbtest för "${test.productName}"?`)) return;

    try {
      const response = await fetch(`/api/admin/lab-tests/${test.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message ?? "Delete failed");
      }

      showToast({ type: "success", message: "Labbtest borttaget." });
      if (editingId === test.id) backToList();
      await loadTests();
    } catch (error) {
      showToast({
        type: "error",
        message:
          error instanceof Error ? error.message : "Kunde inte ta bort labbtestet.",
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
              Admin · Labbtester
            </p>
            <h1 className="text-2xl font-bold text-white">Labbtester</h1>
            <p className="mt-1 text-sm text-[#A89A92]">
              Hantera certifikat, renhetsdata och analysrapporter.
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
                Lägg till labbtest
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
            <h2 className="text-lg font-bold text-white">Certifikatgalleri</h2>

            {isLoading ? (
              <p className="mt-6 text-sm text-[#A89A92]">Laddar labbtester…</p>
            ) : tests.length === 0 ? (
              <p className="mt-6 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-10 text-center text-sm text-[#A89A92]">
                Inga labbtester ännu. Lägg till ditt första certifikat.
              </p>
            ) : (
              <div className="mt-6 space-y-4">
                {tests.map((test) => (
                  <article
                    key={test.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-white">
                            {test.productName}
                          </h3>
                          <span className="rounded-full border border-white/10 bg-[#ECE5D8]/10 px-2.5 py-1 text-[10px] font-medium uppercase text-[#ECE5D8]">
                            {test.purity}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-[#A89A92]">
                          Batch: <span className="font-mono">{test.batchNumber}</span>
                        </p>
                        <p className="mt-1 text-sm text-[#A89A92]">
                          {test.labName} · {formatTestDate(test.testDate)}
                        </p>
                        <p className="mt-1 truncate text-xs font-mono text-[#A89A92]">
                          {test.reportUrl}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(test)}
                          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium uppercase text-[#CFC4BD] transition-all hover:bg-white/10 hover:text-white"
                        >
                          Redigera
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(test)}
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
              {view === "edit" ? "Redigera labbtest" : "Skapa nytt labbtest"}
            </h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
                  Produktnamn
                </span>
                <input
                  value={draft.productName}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, productName: event.target.value }))
                  }
                  placeholder="Melanotan 2"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
                  Renhet (%)
                </span>
                <input
                  value={draft.purity}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, purity: event.target.value }))
                  }
                  placeholder="99.4%"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
                  Batchkod
                </span>
                <input
                  value={draft.batchNumber}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, batchNumber: event.target.value }))
                  }
                  placeholder="SP-MT2-2026"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 font-mono text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
                  Testdatum
                </span>
                <input
                  type="date"
                  value={draft.testDate}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, testDate: event.target.value }))
                  }
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
                  Labb
                </span>
                <input
                  value={draft.labName}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, labName: event.target.value }))
                  }
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
                />
              </label>

              <div className="sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
                  Analysrapport (PDF/bild)
                </span>
                <div className="mt-2 grid gap-3 sm:grid-cols-[1fr_auto]">
                  <input
                    value={draft.reportUrl}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, reportUrl: event.target.value }))
                    }
                    placeholder="/lab-reports/rapport.pdf eller https://…"
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-3 font-mono text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
                  />
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-medium uppercase text-[#CFC4BD] transition-all hover:bg-white/10 hover:text-white">
                    {isUploading ? "Laddar upp…" : "Ladda upp fil"}
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/*"
                      className="hidden"
                      disabled={isUploading}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) void handleUpload(file);
                        event.currentTarget.value = "";
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={isSaving}
              className="mt-6 rounded-xl bg-[#ECE5D8] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#0F0C0B] shadow-md transition-all hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Sparar…" : view === "edit" ? "Spara ändringar" : "Publicera certifikat"}
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
