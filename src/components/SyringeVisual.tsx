"use client";

type SyringeVisualProps = {
  units: number;
  maxUnits: number;
  unitLabel: string;
};

const BODY = "#FDF3F3";
const TRIM = "#E8A0A8";
const TRIM_DARK = "#D4898F";

export default function SyringeVisual({
  units,
  maxUnits,
  unitLabel,
}: SyringeVisualProps) {
  const fillRatio = Math.min(Math.max(units / maxUnits, 0), 1);
  const barrelX = 88;
  const barrelWidth = 320;
  const barrelY = 34;
  const barrelHeight = 48;
  const fillWidth = fillRatio * barrelWidth;
  const markerX = barrelX + fillWidth;

  const tickCount = maxUnits === 100 ? 10 : 5;

  return (
    <div className="flex w-full flex-col items-center">
      <svg
        viewBox="0 0 480 120"
        className="h-auto w-full max-w-3xl"
        aria-hidden
      >
        <defs>
          <clipPath id="syringe-barrel-clip-horizontal">
            <rect
              x={barrelX}
              y={barrelY}
              width={barrelWidth}
              height={barrelHeight}
              rx="6"
            />
          </clipPath>
          <linearGradient id="syringe-liquid-horizontal" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(244, 63, 94, 0.32)" />
            <stop offset="100%" stopColor="rgba(251, 113, 133, 0.52)" />
          </linearGradient>
        </defs>

        {/* Plunger */}
        <rect x="18" y="42" width="52" height="32" rx="4" fill={BODY} stroke={TRIM_DARK} strokeWidth="1.4" />
        <rect x="24" y="48" width="40" height="10" rx="2" fill={TRIM} opacity="0.45" />
        <rect x="70" y="50" width="18" height="16" rx="2" fill="#FFFFFF" stroke={TRIM} strokeWidth="1" />

        {/* Barrel */}
        <rect
          x={barrelX - 2}
          y={barrelY - 2}
          width={barrelWidth + 4}
          height={barrelHeight + 4}
          rx="8"
          fill="#FFFFFF"
          stroke={TRIM_DARK}
          strokeWidth="1.6"
        />

        {/* Graduation ticks */}
        {Array.from({ length: tickCount + 1 }, (_, index) => {
          const tickUnits = (index / tickCount) * maxUnits;
          const x = barrelX + (tickUnits / maxUnits) * barrelWidth;

          return (
            <g key={tickUnits}>
              <line
                x1={x}
                y1={barrelY - 6}
                x2={x}
                y2={barrelY - 1}
                stroke={TRIM_DARK}
                strokeWidth="1.4"
              />
              <text
                x={x}
                y={barrelY - 10}
                textAnchor="middle"
                className="fill-zinc-500 text-[9px] font-semibold"
              >
                {Math.round(tickUnits)}
              </text>
            </g>
          );
        })}

        {/* Pink liquid fill */}
        <g clipPath="url(#syringe-barrel-clip-horizontal)">
          <rect
            x={barrelX}
            y={barrelY}
            width={fillWidth}
            height={barrelHeight}
            fill="url(#syringe-liquid-horizontal)"
            className="transition-all duration-300 ease-out"
          />
        </g>

        {/* Active level marker */}
        {units > 0 && (
          <line
            x1={markerX}
            y1={barrelY - 4}
            x2={markerX}
            y2={barrelY + barrelHeight + 4}
            stroke="#FB7185"
            strokeWidth="2.5"
            strokeDasharray="4 3"
            className="transition-all duration-300 ease-out"
          />
        )}

        {/* Needle hub + needle */}
        <rect
          x={barrelX + barrelWidth}
          y="46"
          width="22"
          height="24"
          rx="3"
          fill={BODY}
          stroke={TRIM_DARK}
          strokeWidth="1.2"
        />
        <line
          x1={barrelX + barrelWidth + 11}
          y1="58"
          x2="462"
          y2="58"
          stroke={TRIM}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <line
          x1="462"
          y1="58"
          x2="472"
          y2="58"
          stroke={TRIM_DARK}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>

      <p className="mt-3 text-center text-sm font-medium text-zinc-500">{unitLabel}</p>
    </div>
  );
}
