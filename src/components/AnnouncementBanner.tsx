"use client";

import { useEffect, useMemo, useState } from "react";
import type { BannerConfig } from "@/lib/store-config";

type AnnouncementBannerProps = {
  banner: BannerConfig;
};

function formatRemaining(targetIso: string): string {
  const target = new Date(targetIso).getTime();
  const diff = target - Date.now();

  if (Number.isNaN(target) || diff <= 0) {
    return "00:00:00";
  }

  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1_000);

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

function useCountdown(targetIso: string, enabled: boolean) {
  const [remaining, setRemaining] = useState(() =>
    enabled && targetIso ? formatRemaining(targetIso) : "",
  );

  useEffect(() => {
    if (!enabled || !targetIso) return;

    function tick() {
      setRemaining(formatRemaining(targetIso));
    }

    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [enabled, targetIso]);

  if (!enabled || !targetIso) return "";
  return remaining;
}

const STYLE_CLASSES: Record<BannerConfig["style"], string> = {
  "clean-minimalist": "bg-zinc-900 text-white",
  "flash-sale-pulse": "animate-banner-pulse bg-rose-600 text-white",
  "urgent-alert": "bg-red-700 text-white",
};

export default function AnnouncementBanner({ banner }: AnnouncementBannerProps) {
  const lines = useMemo(
    () => banner.activeLines.filter((line) => line.trim().length > 0),
    [banner.activeLines],
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [fadeKey, setFadeKey] = useState(0);
  const countdown = useCountdown(banner.countdownEndsAt, banner.countdownEnabled);

  useEffect(() => {
    if (lines.length <= 1) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % lines.length);
      setFadeKey((current) => current + 1);
    }, 4000);

    return () => window.clearInterval(interval);
  }, [lines.length]);

  if (lines.length === 0) return null;

  const currentLine = lines[activeIndex] ?? lines[0];

  return (
    <div
      className={`relative overflow-hidden px-4 py-2.5 text-center text-sm font-semibold tracking-wide ${STYLE_CLASSES[banner.style]}`}
      role="status"
      aria-live="polite"
    >
      {banner.style === "urgent-alert" && (
        <span
          className="absolute left-4 top-1/2 inline-block h-2 w-2 -translate-y-1/2 animate-banner-dot rounded-full bg-white"
          aria-hidden
        />
      )}

      <div className="mx-auto flex max-w-6xl items-center justify-center gap-3">
        <span
          key={fadeKey}
          className="animate-banner-crossfade inline-block"
        >
          {currentLine}
        </span>

        {banner.countdownEnabled && countdown && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/20 px-3 py-0.5 font-mono text-xs tabular-nums">
            <span className="opacity-80">⏱</span>
            {countdown}
          </span>
        )}
      </div>
    </div>
  );
}
