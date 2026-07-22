import type { CSSProperties } from "react";
import type { CampaignTheme } from "@/lib/campaign-theme";

type HeroThemeDecorationsProps = {
  theme: CampaignTheme;
};

const DECOR_BASE = "pointer-events-none absolute select-none z-0";

type SvgProps = {
  className?: string;
  style?: CSSProperties;
};

function SnowflakeIcon({ className, style }: SvgProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden
      className={className}
      style={style}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d="M32 6v52M6 32h52M14 14l36 36M50 14L14 50" />
      <path d="M32 6l6 7M32 6l-6 7M32 58l6-7M32 58l-6-7M6 32l7 6M6 32l7-6M58 32l-7 6M58 32l-7-6" />
    </svg>
  );
}

function Julklapp({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden className={className}>
      <rect
        x="16"
        y="38"
        width="68"
        height="50"
        rx="5"
        fill="#fff1f2"
        stroke="#fecdd3"
        strokeWidth="1.2"
      />
      <rect x="16" y="38" width="68" height="12" rx="3" fill="#fce7f3" />
      <rect x="46" y="38" width="8" height="50" fill="#f9a8d4" opacity="0.45" />
      <path
        d="M50 38 C40 26 26 28 26 38 C26 46 36 50 50 44 C64 50 74 46 74 38 C74 28 60 26 50 38 Z"
        fill="#fda4af"
        opacity="0.65"
        stroke="#e8a0a8"
        strokeWidth="1"
      />
      <path
        d="M50 26v12"
        stroke="#e8a0a8"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const SNOWFLAKE_LAYER = [
  { left: "6%", delay: "0s", duration: "16s", size: "h-4 w-4" },
  { left: "14%", delay: "3s", duration: "19s", size: "h-6 w-6" },
  { left: "22%", delay: "6s", duration: "17s", size: "h-5 w-5" },
  { left: "31%", delay: "1.5s", duration: "21s", size: "h-7 w-7" },
  { left: "40%", delay: "8s", duration: "15s", size: "h-4 w-4" },
  { left: "48%", delay: "4s", duration: "18s", size: "h-6 w-6" },
  { left: "56%", delay: "10s", duration: "20s", size: "h-5 w-5" },
  { left: "64%", delay: "2s", duration: "16s", size: "h-7 w-7" },
  { left: "72%", delay: "7s", duration: "22s", size: "h-4 w-4" },
  { left: "80%", delay: "5s", duration: "17s", size: "h-6 w-6" },
  { left: "88%", delay: "11s", duration: "19s", size: "h-5 w-5" },
  { left: "94%", delay: "9s", duration: "23s", size: "h-4 w-4" },
];

function SummerDecorations() {
  return (
    <div
      className={`${DECOR_BASE} inset-0 bg-[radial-gradient(circle_at_top_right,rgba(253,224,178,0.28)_0%,rgba(251,182,182,0.35)_42%,transparent_55%)]`}
    />
  );
}

function WinterDecorations() {
  return (
    <>
      <div className={`${DECOR_BASE} inset-0 overflow-hidden`}>
        {SNOWFLAKE_LAYER.map((flake) => (
          <SnowflakeIcon
            key={`${flake.left}-${flake.delay}`}
            className={`animate-fade-in-down absolute top-0 text-rose-300/35 ${flake.size}`}
            style={{
              left: flake.left,
              animationDelay: flake.delay,
              animationDuration: flake.duration,
            }}
          />
        ))}
      </div>

      <Julklapp
        className={`${DECOR_BASE} bottom-5 left-3 h-14 w-14 opacity-80 md:bottom-8 md:left-8 md:h-20 md:w-20`}
      />
      <Julklapp
        className={`${DECOR_BASE} bottom-6 right-4 h-12 w-12 rotate-6 opacity-75 md:bottom-10 md:right-10 md:h-16 md:w-16`}
      />
      <Julklapp
        className={`${DECOR_BASE} bottom-4 left-[42%] hidden h-11 w-11 -rotate-3 opacity-70 sm:block md:h-14 md:w-14`}
      />
    </>
  );
}

function AutumnDecorations() {
  return (
    <div
      className={`${DECOR_BASE} inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,143,0.22),transparent_55%)]`}
    />
  );
}

export default function HeroThemeDecorations({
  theme,
}: HeroThemeDecorationsProps) {
  if (theme === "none") return null;

  return (
    <div className={`${DECOR_BASE} inset-0 overflow-hidden`} aria-hidden>
      {theme === "summer" ? <SummerDecorations /> : null}
      {theme === "winter" ? <WinterDecorations /> : null}
      {theme === "autumn" ? <AutumnDecorations /> : null}
    </div>
  );
}

export function HeroSupportBadge({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  const text = label.trim();
  if (!text) return null;

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`.trim()}>
      <span className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/40 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-700 shadow-sm backdrop-blur-md">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-400" aria-hidden />
        {text}
      </span>
    </div>
  );
}
