import type { CSSProperties } from "react";
import type { CampaignTheme } from "@/lib/campaign-theme";

type HeroThemeDecorationsProps = {
  theme: CampaignTheme;
};

const DECOR_BASE =
  "pointer-events-none absolute select-none z-0";

type SvgProps = {
  className?: string;
  style?: CSSProperties;
};

function PalmFrond({ className }: SvgProps) {
  return (
    <svg
      viewBox="0 0 180 300"
      aria-hidden
      className={className}
      fill="currentColor"
    >
      <path d="M90 12C58 68 28 118 18 178c-6 36 4 78 28 98 8-52 22-98 44-138 22 40 36 86 44 138 24-20 34-62 28-98-10-60-40-110-72-166z" />
      <path
        d="M90 36v240"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        opacity="0.25"
      />
      <path
        d="M90 80c-18 28-32 58-38 92M90 80c18 28 32 58 38 92M90 120c-12 22-20 46-24 72M90 120c12 22 20 46 24 72"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        opacity="0.18"
      />
    </svg>
  );
}

function MonsteraLeaf({ className }: SvgProps) {
  return (
    <svg
      viewBox="0 0 200 260"
      aria-hidden
      className={className}
      fill="currentColor"
    >
      <path d="M100 16C62 52 28 96 20 150c-6 38 8 82 36 98 6-44 18-82 34-118 16 36 28 74 34 118 28-16 42-60 36-98-8-54-42-98-60-134z" />
      <ellipse cx="72" cy="118" rx="14" ry="22" fill="white" opacity="0.12" />
      <ellipse cx="128" cy="118" rx="14" ry="22" fill="white" opacity="0.12" />
      <ellipse cx="100" cy="168" rx="12" ry="18" fill="white" opacity="0.1" />
      <path
        d="M100 28v200"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        opacity="0.22"
      />
    </svg>
  );
}

function HibiscusFlower({ className }: SvgProps) {
  return (
    <svg
      viewBox="0 0 160 160"
      aria-hidden
      className={className}
      fill="currentColor"
    >
      <circle cx="80" cy="80" r="14" opacity="0.55" />
      <ellipse cx="80" cy="36" rx="22" ry="34" />
      <ellipse cx="80" cy="124" rx="22" ry="34" />
      <ellipse cx="36" cy="80" rx="34" ry="22" />
      <ellipse cx="124" cy="80" rx="34" ry="22" />
      <ellipse
        cx="52"
        cy="52"
        rx="26"
        ry="20"
        transform="rotate(-45 52 52)"
      />
      <ellipse
        cx="108"
        cy="52"
        rx="26"
        ry="20"
        transform="rotate(45 108 52)"
      />
      <ellipse
        cx="52"
        cy="108"
        rx="26"
        ry="20"
        transform="rotate(45 52 108)"
      />
      <ellipse
        cx="108"
        cy="108"
        rx="26"
        ry="20"
        transform="rotate(-45 108 108)"
      />
    </svg>
  );
}

function SnowflakeIcon({
  className,
  style,
  variant = 1,
}: SvgProps & { variant?: 1 | 2 }) {
  if (variant === 2) {
    return (
      <svg
        viewBox="0 0 64 64"
        aria-hidden
        className={className}
        style={style}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      >
        <path d="M32 4v56M4 32h56" />
        <path d="M12 12l40 40M52 12L12 52" />
        <path d="M32 4l6 8M32 4l-6 8M32 60l6-8M32 60l-6-8M4 32l8 6M4 32l8-6M60 32l-8 6M60 32l-8-6" />
        <circle cx="32" cy="32" r="3" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden
      className={className}
      style={style}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M32 6v52M6 32h52M14 14l36 36M50 14L14 50" />
      <path d="M32 6l8 8M32 6l-8 8M32 58l8-8M32 58l-8-8M6 32l8 8M6 32l8-8M58 32l-8 8M58 32l-8-8" />
    </svg>
  );
}

function GiftBox({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden className={className}>
      <rect
        x="18"
        y="44"
        width="84"
        height="62"
        rx="6"
        fill="currentColor"
        opacity="0.9"
      />
      <rect x="18" y="44" width="84" height="18" rx="4" fill="white" opacity="0.22" />
      <rect x="54" y="44" width="12" height="62" fill="white" opacity="0.35" />
      <path
        d="M60 44c-16-14-34-12-34 2 0 10 12 16 34 10 22 6 34 0 34-10 0-14-18-16-34-2z"
        fill="currentColor"
        opacity="0.75"
      />
      <circle cx="60" cy="30" r="8" fill="white" opacity="0.85" />
    </svg>
  );
}

export function HeroSunGlow() {
  return (
    <>
      <div
        aria-hidden
        className={`${DECOR_BASE} inset-0 bg-[radial-gradient(circle_at_top_left,rgba(253,218,218,0.4),transparent_60%)]`}
      />
      <div
        aria-hidden
        className={`${DECOR_BASE} -left-8 top-0 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(251,191,143,0.35)_0%,rgba(244,114,182,0.15)_50%,transparent_72%)] blur-2xl sm:h-[32rem] sm:w-[32rem]`}
      />
    </>
  );
}

export function HeroSantaHat() {
  return (
    <div
      aria-hidden
      className={`${DECOR_BASE} -left-5 -top-6 z-10 -rotate-12 sm:-left-7 sm:-top-8`}
    >
      <svg
        viewBox="0 0 120 96"
        className="h-20 w-24 drop-shadow-lg sm:h-24 sm:w-28"
      >
        <path d="M10 78h100l-8-14H18l-8 14z" fill="#b91c1c" />
        <path
          d="M18 64h84l10-36L60 10 8 28l10 36z"
          fill="#dc2626"
        />
        <path
          d="M60 10c18 8 32 22 42 42"
          stroke="#fca5a5"
          strokeWidth="2.5"
          fill="none"
        />
        <rect x="10" y="72" width="100" height="10" rx="3" fill="#fef2f2" />
        <circle cx="98" cy="24" r="11" fill="#ffffff" />
        <circle cx="98" cy="24" r="11" fill="none" stroke="#fecdd3" strokeWidth="1" />
      </svg>
    </div>
  );
}

function SummerDecorations() {
  const foliageClass =
    "h-auto w-48 opacity-25 md:w-80 md:opacity-40";

  return (
    <>
      <div className={`${DECOR_BASE} -left-6 bottom-8 top-0 w-48 md:-left-10 md:w-80`}>
        <PalmFrond
          className={`${foliageClass} absolute -left-4 top-6 text-emerald-600/80`}
        />
        <MonsteraLeaf
          className={`${foliageClass} absolute left-8 top-32 text-emerald-700/70`}
        />
        <HibiscusFlower
          className={`${foliageClass} absolute -left-2 top-[22rem] w-36 text-rose-400/80 md:top-[26rem] md:w-52`}
        />
        <PalmFrond
          className={`${foliageClass} absolute left-12 top-[14rem] w-40 -scale-x-100 text-teal-700/60 md:w-64`}
        />
      </div>

      <div className={`${DECOR_BASE} -right-6 bottom-8 top-0 w-48 md:-right-10 md:w-80`}>
        <MonsteraLeaf
          className={`${foliageClass} absolute -right-2 top-10 -scale-x-100 text-emerald-700/75`}
        />
        <PalmFrond
          className={`${foliageClass} absolute right-6 top-36 -scale-x-100 text-emerald-600/70`}
        />
        <HibiscusFlower
          className={`${foliageClass} absolute right-0 top-[20rem] w-40 text-pink-400/75 md:w-56`}
        />
        <PalmFrond
          className={`${foliageClass} absolute -right-4 top-[12rem] w-44 text-teal-600/55 md:w-72`}
        />
      </div>
    </>
  );
}

const SNOWFLAKE_LAYER = [
  { left: "4%", delay: "0s", duration: "14s", size: "h-5 w-5", variant: 1 as const, opacity: "opacity-50" },
  { left: "11%", delay: "2.5s", duration: "18s", size: "h-8 w-8", variant: 2 as const, opacity: "opacity-70" },
  { left: "18%", delay: "5s", duration: "16s", size: "h-6 w-6", variant: 1 as const, opacity: "opacity-60" },
  { left: "26%", delay: "1s", duration: "20s", size: "h-10 w-10", variant: 2 as const, opacity: "opacity-75" },
  { left: "34%", delay: "7s", duration: "15s", size: "h-5 w-5", variant: 1 as const, opacity: "opacity-45" },
  { left: "42%", delay: "3.5s", duration: "17s", size: "h-7 w-7", variant: 2 as const, opacity: "opacity-65" },
  { left: "50%", delay: "9s", duration: "19s", size: "h-9 w-9", variant: 1 as const, opacity: "opacity-80" },
  { left: "58%", delay: "4s", duration: "13s", size: "h-6 w-6", variant: 2 as const, opacity: "opacity-55" },
  { left: "66%", delay: "11s", duration: "21s", size: "h-8 w-8", variant: 1 as const, opacity: "opacity-70" },
  { left: "74%", delay: "6s", duration: "16s", size: "h-5 w-5", variant: 2 as const, opacity: "opacity-50" },
  { left: "82%", delay: "2s", duration: "18s", size: "h-10 w-10", variant: 1 as const, opacity: "opacity-75" },
  { left: "89%", delay: "8s", duration: "14s", size: "h-7 w-7", variant: 2 as const, opacity: "opacity-65" },
  { left: "95%", delay: "12s", duration: "22s", size: "h-6 w-6", variant: 1 as const, opacity: "opacity-55" },
  { left: "22%", delay: "10s", duration: "23s", size: "h-11 w-11", variant: 2 as const, opacity: "opacity-60" },
  { left: "70%", delay: "13s", duration: "24s", size: "h-9 w-9", variant: 1 as const, opacity: "opacity-68" },
];

function WinterDecorations() {
  return (
    <>
      <div className={`${DECOR_BASE} inset-0 overflow-hidden`}>
        {SNOWFLAKE_LAYER.map((flake) => (
          <SnowflakeIcon
            key={`${flake.left}-${flake.delay}`}
            variant={flake.variant}
            className={`animate-fade-in-down absolute top-0 text-sky-100/90 ${flake.size} ${flake.opacity}`}
            style={{
              left: flake.left,
              animationDelay: flake.delay,
              animationDuration: flake.duration,
            }}
          />
        ))}
      </div>

      <GiftBox
        className={`${DECOR_BASE} bottom-4 left-2 h-16 w-16 text-rose-400/50 md:bottom-6 md:left-6 md:h-24 md:w-24`}
      />
      <GiftBox
        className={`${DECOR_BASE} bottom-6 right-4 h-14 w-14 rotate-6 text-rose-500/45 md:bottom-8 md:right-8 md:h-20 md:w-20`}
      />
      <GiftBox
        className={`${DECOR_BASE} bottom-2 right-[38%] hidden h-12 w-12 -rotate-6 text-pink-400/40 sm:block md:h-16 md:w-16`}
      />
    </>
  );
}

function AutumnDecorations() {
  const foliageClass =
    "h-auto w-40 opacity-30 md:w-64 md:opacity-45";

  return (
    <>
      <PalmFrond
        className={`${DECOR_BASE} ${foliageClass} -left-4 top-32 text-amber-600/70`}
      />
      <MonsteraLeaf
        className={`${DECOR_BASE} ${foliageClass} right-4 top-24 -scale-x-100 text-orange-500/60`}
      />
    </>
  );
}

export default function HeroThemeDecorations({
  theme,
}: HeroThemeDecorationsProps) {
  if (theme === "none") return null;

  return (
    <div
      className={`${DECOR_BASE} inset-0 overflow-hidden`}
      aria-hidden
    >
      {theme === "summer" ? <SummerDecorations /> : null}
      {theme === "winter" ? <WinterDecorations /> : null}
      {theme === "autumn" ? <AutumnDecorations /> : null}
    </div>
  );
}

export function HeroSupportBadge({ label }: { label: string }) {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-3">
      <span className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold tracking-wide text-rose-700">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-400" aria-hidden />
        {label}
      </span>
    </div>
  );
}
