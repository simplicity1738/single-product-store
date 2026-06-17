"use client";

import type { StoreConfig } from "@/lib/store-config";
import {
  HERO_FONT_FAMILY_OPTIONS,
  HERO_FONT_SIZE_OPTIONS,
  type HeroFontFamily,
} from "@/lib/hero-settings";

type HeroSettingsFormProps = {
  siteSettings: StoreConfig["siteSettings"];
  onChange: (next: StoreConfig["siteSettings"]) => void;
};

const inputClassName =
  "mt-2 w-full rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100";

const labelClassName =
  "text-xs font-semibold uppercase tracking-wide text-zinc-500";

function TypographyControls({
  fontSize,
  fontFamily,
  onFontSizeChange,
  onFontFamilyChange,
}: {
  fontSize: string;
  fontFamily: HeroFontFamily;
  onFontSizeChange: (value: string) => void;
  onFontFamilyChange: (value: HeroFontFamily) => void;
}) {
  return (
    <div className="mt-3 grid gap-3 sm:grid-cols-2">
      <label className="block">
        <span className={labelClassName}>Teckenstorlek</span>
        <select
          value={fontSize}
          onChange={(event) => onFontSizeChange(event.target.value)}
          className={inputClassName}
        >
          {HERO_FONT_SIZE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className={labelClassName}>Typsnitt</span>
        <select
          value={fontFamily}
          onChange={(event) =>
            onFontFamilyChange(event.target.value as HeroFontFamily)
          }
          className={inputClassName}
        >
          {HERO_FONT_FAMILY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

export default function HeroSettingsForm({
  siteSettings,
  onChange,
}: HeroSettingsFormProps) {
  function patch(partial: Partial<StoreConfig["siteSettings"]>) {
    onChange({ ...siteSettings, ...partial });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-rose-100 bg-rose-50/30 p-4 sm:p-5">
        <h2 className="text-sm font-bold text-zinc-900">Varumärke (överst)</h2>
        <p className="mt-1 text-xs text-zinc-500">
          Visa SimpliCity som text eller ladda en logotypbild i hero-sektionen.
        </p>

        <label className="mt-4 flex items-start gap-3 rounded-xl border border-rose-100 bg-white px-4 py-3">
          <input
            type="checkbox"
            checked={siteSettings.heroUseLogoImage}
            onChange={(event) =>
              patch({ heroUseLogoImage: event.target.checked })
            }
            className="mt-0.5 h-4 w-4 rounded border-rose-300 text-rose-500 focus:ring-rose-400"
          />
          <span className="text-sm text-zinc-700">
            Använd logotypbild istället för varumärkestext
          </span>
        </label>

        {!siteSettings.heroUseLogoImage ? (
          <label className="mt-4 block">
            <span className={labelClassName}>Varumärkestext</span>
            <input
              value={siteSettings.heroBrandText}
              onChange={(event) => patch({ heroBrandText: event.target.value })}
              className={inputClassName}
            />
            <TypographyControls
              fontSize={siteSettings.heroBrandFontSize}
              fontFamily={siteSettings.heroBrandFontFamily}
              onFontSizeChange={(value) => patch({ heroBrandFontSize: value })}
              onFontFamilyChange={(value) =>
                patch({ heroBrandFontFamily: value })
              }
            />
          </label>
        ) : (
          <label className="mt-4 block">
            <span className={labelClassName}>Hero-logotyp (bild-URL)</span>
            <input
              value={siteSettings.heroLogoPath}
              onChange={(event) => patch({ heroLogoPath: event.target.value })}
              placeholder="/logo.png"
              className={inputClassName}
            />
          </label>
        )}
      </div>

      <div className="rounded-2xl border border-rose-100 bg-rose-50/30 p-4 sm:p-5">
        <h2 className="text-sm font-bold text-zinc-900">Hero Title</h2>
        <p className="mt-1 text-xs text-zinc-500">
          Huvudrubrik under varumärket, t.ex. Kvalitet utan kompromisser.
        </p>
        <label className="mt-4 block">
          <span className={labelClassName}>Rubriktext</span>
          <input
            value={siteSettings.heroTitle}
            onChange={(event) => patch({ heroTitle: event.target.value })}
            className={inputClassName}
          />
          <TypographyControls
            fontSize={siteSettings.heroTitleFontSize}
            fontFamily={siteSettings.heroTitleFontFamily}
            onFontSizeChange={(value) => patch({ heroTitleFontSize: value })}
            onFontFamilyChange={(value) => patch({ heroTitleFontFamily: value })}
          />
        </label>
      </div>

      <div className="rounded-2xl border border-rose-100 bg-rose-50/30 p-4 sm:p-5">
        <h2 className="text-sm font-bold text-zinc-900">Hero Tagline</h2>
        <p className="mt-1 text-xs text-zinc-500">
          Underrad i premium rosa accent, t.ex. Renhet och kvalitet i fokus.
        </p>
        <label className="mt-4 block">
          <span className={labelClassName}>Tagline</span>
          <input
            value={siteSettings.heroTagline}
            onChange={(event) => patch({ heroTagline: event.target.value })}
            className={inputClassName}
          />
          <TypographyControls
            fontSize={siteSettings.heroTaglineFontSize}
            fontFamily={siteSettings.heroTaglineFontFamily}
            onFontSizeChange={(value) => patch({ heroTaglineFontSize: value })}
            onFontFamilyChange={(value) =>
              patch({ heroTaglineFontFamily: value })
            }
          />
        </label>
      </div>

      <div className="rounded-2xl border border-rose-100 bg-rose-50/30 p-4 sm:p-5">
        <h2 className="text-sm font-bold text-zinc-900">Hero Description</h2>
        <p className="mt-1 text-xs text-zinc-500">
          Brödtext under tagline på startsidan.
        </p>
        <label className="mt-4 block">
          <span className={labelClassName}>Beskrivning</span>
          <textarea
            value={siteSettings.heroSubtitle}
            onChange={(event) => patch({ heroSubtitle: event.target.value })}
            rows={4}
            className={inputClassName}
          />
          <TypographyControls
            fontSize={siteSettings.heroDescriptionFontSize}
            fontFamily={siteSettings.heroDescriptionFontFamily}
            onFontSizeChange={(value) =>
              patch({ heroDescriptionFontSize: value })
            }
            onFontFamilyChange={(value) =>
              patch({ heroDescriptionFontFamily: value })
            }
          />
        </label>
      </div>

      <div className="rounded-2xl border border-rose-100 bg-rose-50/30 p-4 sm:p-5">
        <h2 className="text-sm font-bold text-zinc-900">Support-badge</h2>
        <p className="mt-1 text-xs text-zinc-500">
          Rosa pill-badge under action-knapparna på startsidan.
        </p>
        <label className="mt-4 block">
          <span className={labelClassName}>Badge-text</span>
          <input
            value={siteSettings.heroBadge}
            onChange={(event) => patch({ heroBadge: event.target.value })}
            className={inputClassName}
          />
        </label>
      </div>
    </div>
  );
}
