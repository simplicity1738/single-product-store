"use client";

type SyringeVisualProps = {
  units: number;
  maxUnits: number;
  unitLabel: string;
};

const BODY = "#FDF3F3";
const LIQUID = "rgba(251, 113, 133, 0.42)";
const TRIM = "#E8A0A8";
const TRIM_DARK = "#D4898F";

export default function SyringeVisual({
  units,
  maxUnits,
  unitLabel,
}: SyringeVisualProps) {
  const fillRatio = Math.min(Math.max(units / maxUnits, 0), 1);
  const barrelTop = 72;
  const barrelHeight = 168;
  const barrelBottom = barrelTop + barrelHeight;
  const fillHeight = fillRatio * barrelHeight;
  const fillY = barrelBottom - fillHeight;
  const markerY = fillY;

  const majorTicks = maxUnits === 100 ? 10 : 5;

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox="0 0 140 280"
        className="h-auto w-full max-w-[11rem] sm:max-w-[12.5rem]"
        aria-hidden
      >
        <defs>
          <clipPath id="syringe-barrel-clip">
            <rect x="46" y={barrelTop} width="48" height={barrelHeight} rx="4" />
          </clipPath>
          <linearGradient id="syringe-liquid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(251, 113, 133, 0.55)" />
            <stop offset="100%" stopColor="rgba(244, 63, 94, 0.38)" />
          </linearGradient>
        </defs>

        {/* Plunger */}
        <rect x="58" y="28" width="24" height="36" rx="3" fill={BODY} stroke={TRIM_DARK} strokeWidth="1.2" />
        <rect x="62" y="32" width="16" height="8" rx="2" fill={TRIM} opacity="0.5" />
        <rect x="66" y="64" width="8" height="10" rx="1" fill="#FFFFFF" stroke={TRIM} strokeWidth="1" />

        {/* Barrel outline */}
        <rect
          x="44"
          y={barrelTop}
          width="52"
          height={barrelHeight}
          rx="6"
          fill="#FFFFFF"
          stroke={TRIM_DARK}
          strokeWidth="1.5"
        />

        {/* Graduation ticks */}
        {Array.from({ length: majorTicks + 1 }, (_, index) => {
          const tickUnits = (index / majorTicks) * maxUnits;
          const y = barrelBottom - (tickUnits / maxUnits) * barrelHeight;
          const isMajor = index % 1 === 0;

          return (
            <g key={tickUnits}>
              <line
                x1="38"
                y1={y}
                x2="44"
                y2={y}
                stroke={TRIM_DARK}
                strokeWidth={isMajor ? "1.4" : "1"}
                opacity={isMajor ? 1 : 0.6}
              />
              {isMajor && (
                <text
                  x="32"
                  y={y + 3}
                  textAnchor="end"
                  className="fill-zinc-500 text-[8px] font-medium"
                >
                  {Math.round(tickUnits)}
                </text>
              )}
            </g>
          );
        })}

        {/* Liquid fill */}
        <g clipPath="url(#syringe-barrel-clip)">
          <rect
            x="46"
            y={fillY}
            width="48"
            height={fillHeight}
            fill="url(#syringe-liquid)"
            className="transition-all duration-300 ease-out"
          />
        </g>

        {/* Active level marker */}
        {units > 0 && (
          <line
            x1="44"
            y1={markerY}
            x2="96"
            y2={markerY}
            stroke="#FB7185"
            strokeWidth="2"
            strokeDasharray="4 3"
            className="transition-all duration-300 ease-out"
          />
        )}

        {/* Needle hub */}
        <rect x="62" y={barrelBottom} width="16" height="14" rx="2" fill={BODY} stroke={TRIM_DARK} strokeWidth="1.2" />
        <line x1="70" y1={barrelBottom + 14} x2="70" y2="262" stroke={TRIM} strokeWidth="2" strokeLinecap="round" />
        <line x1="70" y1="262" x2="70" y2="272" stroke={TRIM_DARK} strokeWidth="1.2" strokeLinecap="round" />
      </svg>

      <p className="mt-2 text-center text-xs font-medium text-zinc-500">
        {unitLabel}
      </p>
    </div>
  );
}
