"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { StoreConfig } from "@/lib/store-config";
import { normalizeSiteSettings } from "@/lib/hero-settings";
import HeroSettingsForm from "@/components/admin/HeroSettingsForm";
import {
  normalizeSiteNavigation,
  SITE_NAV_ADMIN_META,
  SITE_NAV_KEYS,
  SITE_NAV_LABEL_MAX,
  type SiteNavKey,
  type SiteNavigation,
} from "@/lib/site-navigation";

type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

export default function AdminSiteSettingsPage() {
  const [config, setConfig] = useState<StoreConfig | null>(null);
  const [siteSettings, setSiteSettings] = useState(
    normalizeSiteSettings(undefined),
  );
  const [siteNavigation, setSiteNavigation] = useState<SiteNavigation>(
    normalizeSiteNavigation(undefined),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = useCallback((next: ToastState) => {
    setToast(next);
    if (next) {
      window.setTimeout(() => setToast(null), 3200);
    }
  }, []);

  const loadConfig = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/config");
      if (!response.ok) throw new Error("Failed to load");
      const data = (await response.json()) as StoreConfig;
      setConfig(data);
      setSiteSettings(normalizeSiteSettings(data.siteSettings));
      setSiteNavigation(normalizeSiteNavigation(data.siteNavigation));
    } catch {
      showToast({
        type: "error",
        message: "Kunde inte ladda sajtinställningarna.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadConfig();
  }, [loadConfig]);

  function updateNavItem<K extends keyof SiteNavigation[SiteNavKey]>(
    key: SiteNavKey,
    field: K,
    value: SiteNavigation[SiteNavKey][K],
  ) {
    setSiteNavigation((current) =>
      normalizeSiteNavigation({
        ...current,
        [key]: {
          ...current[key],
          [field]: value,
        },
      }),
    );
  }

  async function handleSave() {
    if (!config) return;
    setIsSaving(true);
    setToast(null);

    try {
      const response = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...config,
          siteSettings: normalizeSiteSettings(siteSettings),
          siteNavigation: normalizeSiteNavigation(siteNavigation),
        }),
      });

      const data = (await response.json()) as {
        success?: boolean;
        message?: string;
      };

      if (!response.ok || !data.success) {
        throw new Error(data.message ?? "Save failed");
      }

      showToast({
        type: "success",
        message: data.message ?? "Sajtinställningar sparade.",
      });
      await loadConfig();
    } catch {
      showToast({
        type: "error",
        message: "Kunde inte spara sajtinställningarna.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">
              Sajtinställningar
            </p>
            <h1 className="mt-2 text-2xl font-bold text-zinc-900">
              Sajtkonfiguration
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-600">
              Anpassa hero-typografi, navigation och synlighet för den publika
              startsidan.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaving || isLoading || !config}
            className="rounded-full bg-rose-400 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:opacity-60"
          >
            {isSaving ? "Sparar…" : "Spara ändringar"}
          </button>
        </div>

        {toast && (
          <p
            className={`mt-4 rounded-xl px-4 py-3 text-sm ${
              toast.type === "success"
                ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {toast.message}
          </p>
        )}

        <section className="mt-8 rounded-3xl border border-rose-100 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold text-zinc-900">Hero &amp; typografi</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Styr rubriker, storlekar, typsnitt och logotyp för hero-sektionen.
          </p>

          {isLoading ? (
            <p className="mt-6 text-sm text-zinc-500">Laddar hero-inställningar…</p>
          ) : (
            <div className="mt-6">
              <HeroSettingsForm
                siteSettings={siteSettings}
                onChange={setSiteSettings}
              />
            </div>
          )}
        </section>

        <section className="mt-8 rounded-3xl border border-rose-100 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold text-zinc-900">Navigation</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Styr synlighet och visningsnamn för menylänkar och widgets.
          </p>

          {isLoading ? (
            <p className="mt-6 text-sm text-zinc-500">Laddar sajtinställningar…</p>
          ) : (
            <div className="mt-6 space-y-4">
              {SITE_NAV_KEYS.map((key) => {
                const item = siteNavigation[key];
                const meta = SITE_NAV_ADMIN_META[key];

                return (
                  <div
                    key={key}
                    className="rounded-2xl border border-rose-100 bg-rose-50/30 p-4 sm:p-5"
                  >
                    <div>
                      <h2 className="text-sm font-bold text-zinc-900">
                        {meta.title}
                      </h2>
                      <p className="mt-1 text-xs text-zinc-500">{meta.hint}</p>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <label className="flex items-start gap-3 rounded-xl border border-rose-100 bg-white px-4 py-3">
                        <input
                          type="checkbox"
                          checked={item.hide_navbar}
                          onChange={(event) =>
                            updateNavItem(key, "hide_navbar", event.target.checked)
                          }
                          className="mt-0.5 h-4 w-4 rounded border-rose-300 text-rose-500 focus:ring-rose-400"
                        />
                        <span className="text-sm leading-snug text-zinc-700">
                          <span className="block font-semibold text-zinc-900">
                            Dölj endast i toppmenyn
                          </span>
                          <span className="mt-0.5 block text-xs text-zinc-500">
                            Länken försvinner från header och mobilmeny.
                          </span>
                        </span>
                      </label>

                      <label className="flex items-start gap-3 rounded-xl border border-rose-100 bg-white px-4 py-3">
                        <input
                          type="checkbox"
                          checked={item.hide_section}
                          onChange={(event) =>
                            updateNavItem(key, "hide_section", event.target.checked)
                          }
                          className="mt-0.5 h-4 w-4 rounded border-rose-300 text-rose-500 focus:ring-rose-400"
                        />
                        <span className="text-sm leading-snug text-zinc-700">
                          <span className="block font-semibold text-zinc-900">
                            Dölj helt från hemsidan
                          </span>
                          <span className="mt-0.5 block text-xs text-zinc-500">
                            Sektionen eller widgeten renderas inte på startsidan.
                          </span>
                        </span>
                      </label>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Visningsnamn (SV)
                        </span>
                        <input
                          value={item.label_sv}
                          maxLength={SITE_NAV_LABEL_MAX}
                          onChange={(event) =>
                            updateNavItem(key, "label_sv", event.target.value)
                          }
                          placeholder={meta.title}
                          className="mt-2 w-full rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                        />
                      </label>

                      <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Display name (EN)
                        </span>
                        <input
                          value={item.label_en}
                          maxLength={SITE_NAV_LABEL_MAX}
                          onChange={(event) =>
                            updateNavItem(key, "label_en", event.target.value)
                          }
                          placeholder={meta.title}
                          className="mt-2 w-full rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                        />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <p className="mt-6 text-sm text-zinc-500">
          <Link href="/admin" className="font-medium text-rose-600 hover:text-rose-700">
            ← Tillbaka till adminöversikten
          </Link>
        </p>
      </div>
    </div>
  );
}
