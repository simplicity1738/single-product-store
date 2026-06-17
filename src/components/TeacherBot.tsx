"use client";

type TeacherBotProps = {
  isActive: boolean;
  tagLabel: string;
};

const BODY = "#FDF3F3";
const BODY_DEEP = "#F8E8E8";
const TRIM = "#E8A0A8";
const TRIM_DARK = "#D4898F";
const ACCENT = "#FB7185";
const ROSE_GOLD = "#C9956C";

export default function TeacherBot({ isActive, tagLabel }: TeacherBotProps) {
  return (
    <div className="relative flex flex-col items-end">
      <div
        className="pointer-events-none absolute bottom-[calc(100%+0.35rem)] right-0 z-10 whitespace-nowrap rounded-full border px-3 py-1.5 text-[11px] font-semibold tracking-wide shadow-md sm:text-xs"
        style={{
          backgroundColor: BODY,
          borderColor: TRIM,
          color: TRIM_DARK,
          boxShadow: "0 4px 14px rgba(232, 160, 168, 0.35)",
        }}
        aria-hidden
      >
        {tagLabel}
        <span
          className="absolute -bottom-1.5 right-6 h-2.5 w-2.5 rotate-45 border-b border-r"
          style={{ backgroundColor: BODY, borderColor: TRIM }}
        />
      </div>

      <div className="animate-teacher-bot-bob">
        <svg
          viewBox="0 0 108 132"
          className="h-[8.25rem] w-[6.75rem]"
          style={{ filter: "drop-shadow(0 8px 18px rgba(232, 160, 168, 0.35))" }}
          aria-hidden
        >
          <defs>
            <linearGradient id="teacher-bot-body" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={BODY} />
              <stop offset="100%" stopColor={BODY_DEEP} />
            </linearGradient>
            <linearGradient id="teacher-bot-head" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor={BODY} />
            </linearGradient>
          </defs>

          {/* Legs peeking up from below the viewport */}
          <rect x="36" y="104" width="13" height="36" rx="6" fill={BODY_DEEP} stroke={TRIM} strokeWidth="1" />
          <rect x="59" y="104" width="13" height="36" rx="6" fill={BODY_DEEP} stroke={TRIM} strokeWidth="1" />

          {/* Left arm — relaxed at side */}
          <g transform="rotate(18 28 78)">
            <rect x="18" y="74" width="11" height="26" rx="5.5" fill={BODY} stroke={TRIM} strokeWidth="1.2" />
            <circle cx="22" cy="100" r="5.5" fill="#FFFFFF" stroke={TRIM_DARK} strokeWidth="1.2" />
          </g>

          {/* Torso */}
          <rect
            x="30"
            y="68"
            width="48"
            height="40"
            rx="12"
            fill="url(#teacher-bot-body)"
            stroke={TRIM_DARK}
            strokeWidth="1.5"
          />
          <rect x="42" y="78" width="24" height="4" rx="2" fill={TRIM} opacity="0.55" />

          {/* Right arm — static structure, CSS transition only */}
          <g
            className="teacher-bot-arm transition-transform duration-300 ease-out"
            style={{
              transformOrigin: "76px 80px",
              transformBox: "fill-box",
              transform: isActive ? "rotate(-25deg)" : "rotate(0deg)",
            }}
          >
            <rect x="70" y="80" width="11" height="24" rx="5.5" fill={BODY} stroke={TRIM} strokeWidth="1.2" />
            <circle cx="75.5" cy="106" r="5.5" fill="#FFFFFF" stroke={TRIM_DARK} strokeWidth="1.2" />
          </g>

          {/* Head */}
          <rect
            x="28"
            y="26"
            width="52"
            height="46"
            rx="16"
            fill="url(#teacher-bot-head)"
            stroke={TRIM_DARK}
            strokeWidth="1.5"
          />

          {/* Graduation cap — angled teacher hat */}
          <g transform="translate(54 24) rotate(-14)">
            <polygon points="-24,-10 24,-10 0,-22" fill="#3F3F46" />
            <rect x="-20" y="-10" width="40" height="5" rx="1.5" fill="#52525B" />
            <rect x="-22" y="-5" width="44" height="7" rx="2.5" fill="#3F3F46" stroke={TRIM_DARK} strokeWidth="0.6" />
            <line
              x1="20"
              y1="-7"
              x2="30"
              y2="2"
              stroke={ROSE_GOLD}
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <circle cx="30" cy="3" r="2.2" fill={ROSE_GOLD} />
          </g>

          {/* Eyes — always ellipses; scale for happy wide-open expression */}
          <g
            className={`teacher-bot-eye transition-transform duration-300 ease-out ${
              isActive ? "" : "animate-teacher-bot-blink"
            }`}
            style={{
              transformOrigin: "42px 46px",
              transformBox: "fill-box",
              ...(isActive ? { transform: "scale(1.22, 1.35)" } : {}),
            }}
          >
            <ellipse cx="42" cy="46" rx="4.2" ry="5" fill={TRIM_DARK} />
            <ellipse cx="42" cy="44.5" rx="1.2" ry="1.4" fill="#FFFFFF" opacity="0.85" />
          </g>
          <g
            className={`teacher-bot-eye transition-transform duration-300 ease-out ${
              isActive ? "" : "animate-teacher-bot-blink"
            }`}
            style={{
              transformOrigin: "66px 46px",
              transformBox: "fill-box",
              ...(isActive ? { transform: "scale(1.22, 1.35)" } : {}),
              ...(!isActive ? { animationDelay: "0.08s" } : {}),
            }}
          >
            <ellipse cx="66" cy="46" rx="4.2" ry="5" fill={TRIM_DARK} />
            <ellipse cx="66" cy="44.5" rx="1.2" ry="1.4" fill="#FFFFFF" opacity="0.85" />
          </g>

          {/* Smile */}
          <path
            d="M44 58 Q54 64 64 58"
            fill="none"
            stroke={ACCENT}
            strokeWidth="2"
            strokeLinecap="round"
            className={`origin-center transition-transform duration-300 ease-out ${
              isActive ? "scale-110" : "scale-100"
            }`}
            style={{ transformOrigin: "54px 61px", transformBox: "fill-box" }}
          />

          {/* Cheek blush */}
          <circle cx="36" cy="54" r="3" fill={TRIM} opacity="0.5" />
          <circle cx="72" cy="54" r="3" fill={TRIM} opacity="0.5" />
        </svg>
      </div>
    </div>
  );
}
