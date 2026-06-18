"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import type {
  BannerAnimation,
  BannerConfig,
  BannerTimeDisplayMode,
} from "@/lib/store-config";

type AnnouncementBannerProps = {
  banner: BannerConfig;
};

function formatRemaining(targetIso: string): string {
  const target = new Date(targetIso).getTime();
  if (Number.isNaN(target) || !targetIso.trim()) {
    return "";
  }

  const diff = target - Date.now();
  if (diff <= 0) {
    return "00:00:00";
  }

  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1_000);

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

function formatLocalizedEndDate(targetIso: string): string {
  const target = new Date(targetIso);
  if (Number.isNaN(target.getTime()) || !targetIso.trim()) {
    return "";
  }

  return target.toLocaleDateString("sv-SE", {
    day: "numeric",
    month: "long",
  });
}

function useCountdown(targetIso: string, enabled: boolean) {
  const [remaining, setRemaining] = useState(() =>
    enabled && targetIso ? formatRemaining(targetIso) : "",
  );

  useEffect(() => {
    if (!enabled || !targetIso) {
      setRemaining("");
      return;
    }

    function tick() {
      setRemaining(formatRemaining(targetIso));
    }

    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [enabled, targetIso]);

  return remaining;
}

const STYLE_SHELL: Record<BannerConfig["style"], string> = {
  "clean-minimalist":
    "relative overflow-hidden bg-rose-400 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]",
  "flash-sale-pulse":
    "relative overflow-hidden bg-gradient-to-r from-rose-400 via-pink-500 to-amber-300 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]",
  "urgent-alert":
    "relative overflow-hidden bg-gradient-to-r from-red-800 via-red-700 to-red-900 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]",
};

function BannerTimeDisplay({ banner }: { banner: BannerConfig }) {
  const timeDisplayMode: BannerTimeDisplayMode = banner.timeDisplayMode;
  const countdownEndsAt = banner.countdownEndsAt.trim();
  const customDateString = banner.customDateString.trim();
  const isStaticDate = timeDisplayMode === "staticDate";

  const countdown = useCountdown(
    countdownEndsAt,
    banner.countdownEnabled && !isStaticDate && Boolean(countdownEndsAt),
  );

  const staticLabel = useMemo(() => {
    if (!isStaticDate) return "";
    if (customDateString) return customDateString;
    if (countdownEndsAt) return formatLocalizedEndDate(countdownEndsAt);
    return "";
  }, [countdownEndsAt, customDateString, isStaticDate]);

  const pillLabel = isStaticDate ? staticLabel : countdown;

  if (!banner.countdownEnabled || !pillLabel) {
    return null;
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/20 bg-black/15 px-3 py-0.5 text-xs backdrop-blur-sm ${
        isStaticDate ? "font-medium" : "font-mono tabular-nums"
      }`}
    >
      <span className="opacity-80" aria-hidden>
        {isStaticDate ? "📅" : "⏱"}
      </span>
      {isStaticDate ? (
        <span>{staticLabel}</span>
      ) : (
        <span>{countdown}</span>
      )}
    </span>
  );
}

function RotatingLines({ lines }: { lines: string[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fadeKey, setFadeKey] = useState(0);

  useEffect(() => {
    if (lines.length <= 1) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % lines.length);
      setFadeKey((current) => current + 1);
    }, 4000);

    return () => window.clearInterval(interval);
  }, [lines.length]);

  const currentLine = lines[activeIndex] ?? lines[0];

  return (
    <span key={fadeKey} className="animate-banner-crossfade inline-block">
      {currentLine}
    </span>
  );
}

function SlideTickerLines({ lines }: { lines: string[] }) {
  const trackItems = useMemo(() => [...lines, ...lines], [lines]);

  return (
    <div className="relative w-full overflow-hidden">
      <div className="flex w-max animate-marquee items-center gap-10 whitespace-nowrap">
        {trackItems.map((text, index) => (
          <span
            key={`${text}-${index}`}
            className="inline-flex items-center gap-10 text-sm font-semibold tracking-wide"
          >
            <span>{text}</span>
            <span className="opacity-40" aria-hidden>
              •
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

function BannerTextAnimationWrapper({
  animation,
  children,
}: {
  animation: BannerAnimation;
  children: ReactNode;
}) {
  if (animation === "pulse") {
    return (
      <span className="inline-block animate-[pulse_3s_ease-in-out_infinite]">
        {children}
      </span>
    );
  }

  if (animation === "shimmer") {
    return (
      <span className="relative inline-block overflow-hidden">
        {children}
        <span
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:200%_100%] animate-shimmer"
          aria-hidden
        />
      </span>
    );
  }

  return <>{children}</>;
}

function BannerTextContent({
  lines,
  animation,
}: {
  lines: string[];
  animation: BannerAnimation;
}) {
  if (animation === "slide") {
    return <SlideTickerLines lines={lines} />;
  }

  return (
    <BannerTextAnimationWrapper animation={animation}>
      <RotatingLines lines={lines} />
    </BannerTextAnimationWrapper>
  );
}

export default function AnnouncementBanner({ banner }: AnnouncementBannerProps) {
  const lines = useMemo(
    () => banner.activeLines.filter((line) => line.trim().length > 0),
    [banner.activeLines],
  );

  if (lines.length === 0) return null;

  const animation = banner.bannerAnimation ?? "none";
  const isSlideLayout = animation === "slide";

  return (
    <div
      className={`px-4 py-2.5 text-center text-sm font-semibold tracking-wide ${STYLE_SHELL[banner.style]}`}
      role="status"
      aria-live="polite"
    >
      {isSlideLayout ? (
        <div className="relative mx-auto flex max-w-6xl items-center gap-4">
          <div className="min-w-0 flex-1">
            <BannerTextContent lines={lines} animation={animation} />
          </div>
          <BannerTimeDisplay banner={banner} />
        </div>
      ) : (
        <div className="relative mx-auto flex max-w-6xl items-center justify-center gap-3">
          <BannerTextContent lines={lines} animation={animation} />
          <BannerTimeDisplay banner={banner} />
        </div>
      )}
    </div>
  );
}
