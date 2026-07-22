"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { StoreConfig } from "@/lib/store-config";
import { DEFAULT_ORDER_EMAIL_TEMPLATES } from "@/lib/store-config";
import { normalizeSiteSettings } from "@/lib/hero-settings";
import HeroCampaignForm from "@/components/admin/HeroCampaignForm";
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
  const [orderEmail, setOrderEmail] = useState(DEFAULT_ORDER_EMAIL_TEMPLATES);
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
      setOrderEmail(data.orderEmail ?? DEFAULT_ORDER_EMAIL_TEMPLATES);
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
          orderEmail,
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
            <p className="text-xs font-semibold uppercase tracking-wider text-[#ECE5D8]">
              Sajtinställningar
            </p>
            <h1 className="mt-2 text-2xl font-bold text-white">
              Sajtkonfiguration
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[#CFC4BD]">
              Anpassa kampanj-hero, navigation och synlighet för den publika
              startsidan.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaving || isLoading || !config}
            className="rounded-xl bg-[#ECE5D8] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#0F0C0B] shadow-md transition-all hover:bg-white disabled:opacity-60"
          >
            {isSaving ? "Sparar…" : "Spara ändringar"}
          </button>
        </div>

        {toast && (
          <p
            className={`mt-4 rounded-xl px-4 py-3 text-sm ${
              toast.type === "success"
                ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                : "border border-red-500/20 bg-red-500/10 text-red-300"
            }`}
          >
            {toast.message}
          </p>
        )}

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-xl backdrop-blur-md sm:p-8">
          <h2 className="text-lg font-bold text-white">
            Hjälte-Kampanj (Hero Showcase)
          </h2>
          <p className="mt-1 text-sm text-[#A89A92]">
            Kampanjmotor för startsidans split-layout med utvald produkt.
          </p>

          {isLoading || !config ? (
            <p className="mt-6 text-sm text-[#A89A92]">Laddar kampanjinställningar…</p>
          ) : (
            <div className="mt-6">
              <HeroCampaignForm
                siteSettings={siteSettings}
                products={config.products}
                onChange={setSiteSettings}
              />
            </div>
          )}
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-xl backdrop-blur-md sm:p-8">
          <h2 className="text-lg font-bold text-white">Navigation</h2>
          <p className="mt-1 text-sm text-[#A89A92]">
            Styr synlighet och visningsnamn för menylänkar och widgets.
          </p>

          {isLoading ? (
            <p className="mt-6 text-sm text-[#A89A92]">Laddar sajtinställningar…</p>
          ) : (
            <div className="mt-6 space-y-4">
              {SITE_NAV_KEYS.map((key) => {
                const item = siteNavigation[key];
                const meta = SITE_NAV_ADMIN_META[key];

                return (
                  <div
                    key={key}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5"
                  >
                    <div>
                      <h2 className="text-sm font-bold text-white">
                        {meta.title}
                      </h2>
                      <p className="mt-1 text-xs text-[#A89A92]">{meta.hint}</p>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                        <input
                          type="checkbox"
                          checked={item.hide_navbar}
                          onChange={(event) =>
                            updateNavItem(key, "hide_navbar", event.target.checked)
                          }
                          className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 text-[#ECE5D8] focus:ring-[#ECE5D8]"
                        />
                        <span className="text-sm leading-snug text-[#CFC4BD]">
                          <span className="block font-semibold text-white">
                            Dölj endast i toppmenyn
                          </span>
                          <span className="mt-0.5 block text-xs text-[#A89A92]">
                            Länken försvinner från header och mobilmeny.
                          </span>
                        </span>
                      </label>

                      <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                        <input
                          type="checkbox"
                          checked={item.hide_section}
                          onChange={(event) =>
                            updateNavItem(key, "hide_section", event.target.checked)
                          }
                          className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 text-[#ECE5D8] focus:ring-[#ECE5D8]"
                        />
                        <span className="text-sm leading-snug text-[#CFC4BD]">
                          <span className="block font-semibold text-white">
                            Dölj helt från hemsidan
                          </span>
                          <span className="mt-0.5 block text-xs text-[#A89A92]">
                            Sektionen eller widgeten renderas inte på startsidan.
                          </span>
                        </span>
                      </label>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
                          Visningsnamn (SV)
                        </span>
                        <input
                          value={item.label_sv}
                          maxLength={SITE_NAV_LABEL_MAX}
                          onChange={(event) =>
                            updateNavItem(key, "label_sv", event.target.value)
                          }
                          placeholder={meta.title}
                          className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
                        />
                      </label>

                      <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
                          Display name (EN)
                        </span>
                        <input
                          value={item.label_en}
                          maxLength={SITE_NAV_LABEL_MAX}
                          onChange={(event) =>
                            updateNavItem(key, "label_en", event.target.value)
                          }
                          placeholder={meta.title}
                          className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
                        />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-xl backdrop-blur-md sm:p-8">
          <h2 className="text-lg font-bold text-white">
            Orderbekräftelse via e-post
          </h2>
          <p className="mt-1 text-sm text-[#A89A92]">
            Anpassa ämne och brödtext för orderbekräftelser. Placeholders:{" "}
            <code className="rounded bg-white/10 px-1 text-[#ECE5D8]">{`{{orderId}}`}</code>,{" "}
            <code className="rounded bg-white/10 px-1 text-[#ECE5D8]">{`{{customerName}}`}</code>,{" "}
            <code className="rounded bg-white/10 px-1 text-[#ECE5D8]">{`{{total}}`}</code>,{" "}
            <code className="rounded bg-white/10 px-1 text-[#ECE5D8]">{`{{cartSummary}}`}</code>
          </p>

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
                Ämne för orderbekräftelse
              </span>
              <input
                value={orderEmail.emailSubject}
                onChange={(event) =>
                  setOrderEmail((current) => ({
                    ...current,
                    emailSubject: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
                Text för orderbekräftelse
              </span>
              <textarea
                value={orderEmail.emailBody}
                onChange={(event) =>
                  setOrderEmail((current) => ({
                    ...current,
                    emailBody: event.target.value,
                  }))
                }
                rows={8}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs leading-relaxed text-white outline-none transition-all placeholder-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
              />
            </label>
          </div>
        </section>

        <p className="mt-6 text-sm text-[#A89A92]">
          <Link href="/admin" className="font-medium text-[#ECE5D8] hover:text-white">
            ← Tillbaka till adminöversikten
          </Link>
        </p>
      </div>
    </div>
  );
}
