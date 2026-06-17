import type { CampaignTheme } from "@/lib/campaign-theme";

type HeroThemeDecorationsProps = {
  theme: CampaignTheme;
};

function TropicalLeaf({
  className,
  flip,
}: {
  className?: string;
  flip?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 120 160"
      aria-hidden
      className={`pointer-events-none absolute text-rose-300/40 ${className ?? ""} ${flip ? "-scale-x-100" : ""}`}
      fill="currentColor"
    >
      <path d="M60 8C42 38 18 62 14 98c-2 18 8 38 26 48 4-28 14-52 32-72C88 58 98 34 96 8c-12 4-24 0-36-8z" />
      <path
        d="M60 40v110"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        opacity="0.35"
      />
    </svg>
  );
}

function Snowflake({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden
      className={`pointer-events-none absolute text-sky-200/70 ${className ?? ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M32 6v52M6 32h52M14 14l36 36M50 14L14 50" />
      <path d="M32 6l8 8M32 6l-8 8M32 58l8-8M32 58l-8-8M6 32l8 8M6 32l8-8M58 32l-8 8M58 32l-8-8" />
    </svg>
  );
}

export function HeroSunGlow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -left-24 top-8 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(251,191,143,0.45)_0%,rgba(244,114,182,0.18)_45%,transparent_72%)] blur-2xl sm:h-96 sm:w-96"
    />
  );
}

export function HeroSantaHat() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -right-2 -top-3 z-20 rotate-12 sm:-right-3 sm:-top-4"
    >
      <svg viewBox="0 0 88 72" className="h-14 w-[4.5rem] drop-shadow-md sm:h-16 sm:w-20">
        <path
          d="M8 58h72l-6-10H14l-6 10z"
          fill="#ef4444"
        />
        <path d="M14 48h60l8-28L44 8 6 20l8 28z" fill="#dc2626" />
        <circle cx="76" cy="18" r="9" fill="#f8fafc" />
        <path
          d="M44 8c14 6 24 16 30 30"
          stroke="#fca5a5"
          strokeWidth="2"
          fill="none"
        />
      </svg>
    </div>
  );
}

export default function HeroThemeDecorations({
  theme,
}: HeroThemeDecorationsProps) {
  if (theme === "none") return null;

  if (theme === "summer") {
    return (
      <>
        <TropicalLeaf className="-left-6 top-24 h-32 w-24 opacity-60 sm:-left-10 sm:top-16 sm:h-40 sm:w-28" />
        <TropicalLeaf
          flip
          className="right-4 top-40 h-28 w-20 opacity-50 sm:right-16 sm:top-28 sm:h-36 sm:w-24"
        />
        <TropicalLeaf className="bottom-16 left-1/4 h-24 w-20 opacity-40" />
        <TropicalLeaf
          flip
          className="right-1/3 top-8 h-20 w-16 opacity-35 hidden sm:block"
        />
      </>
    );
  }

  if (theme === "winter") {
    return (
      <>
        <Snowflake className="left-[8%] top-20 h-10 w-10 animate-pulse" />
        <Snowflake className="left-[22%] top-44 h-8 w-8 opacity-80" />
        <Snowflake className="right-[18%] top-28 h-12 w-12 animate-pulse" />
        <Snowflake className="right-[10%] top-56 h-9 w-9 opacity-70" />
        <Snowflake className="left-[42%] top-12 h-7 w-7 opacity-60 hidden sm:block" />
      </>
    );
  }

  if (theme === "autumn") {
    return (
      <>
        <TropicalLeaf className="-left-4 top-32 h-24 w-20 text-amber-400/35" />
        <TropicalLeaf
          flip
          className="right-8 top-24 h-28 w-24 text-orange-400/30"
        />
      </>
    );
  }

  return null;
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
