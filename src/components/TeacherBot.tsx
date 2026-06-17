"use client";

type TeacherBotProps = {
  isInteracting: boolean;
  tagLabel: string;
};

export default function TeacherBot({ isInteracting, tagLabel }: TeacherBotProps) {
  return (
    <div className="relative flex flex-col items-end">
      <div
        className="pointer-events-none absolute bottom-[calc(100%+0.35rem)] right-0 z-10 whitespace-nowrap rounded-full border border-rose-100 bg-white px-3 py-1.5 text-[11px] font-semibold tracking-wide text-rose-600 shadow-md shadow-rose-200/50 sm:text-xs"
        aria-hidden
      >
        {tagLabel}
        <span className="absolute -bottom-1.5 right-6 h-2.5 w-2.5 rotate-45 border-b border-r border-rose-100 bg-white" />
      </div>

      <div className="animate-teacher-bot-bob">
        <svg
          viewBox="0 0 108 132"
          className="h-[8.25rem] w-[6.75rem] drop-shadow-lg drop-shadow-rose-300/40"
          aria-hidden
        >
          <defs>
            <linearGradient id="teacher-bot-body" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="100%" stopColor="#f43f5e" />
            </linearGradient>
            <linearGradient id="teacher-bot-head" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#fff1f2" />
            </linearGradient>
          </defs>

          {/* Legs peeking up from below the viewport */}
          <rect x="36" y="104" width="13" height="36" rx="6" fill="#f43f5e" />
          <rect x="59" y="104" width="13" height="36" rx="6" fill="#e11d48" />

          {/* Left arm — relaxed at side */}
          <g transform="rotate(18 28 78)">
            <rect x="18" y="74" width="11" height="26" rx="5.5" fill="#fb7185" />
            <circle cx="22" cy="100" r="5.5" fill="#fff1f2" stroke="#fda4af" strokeWidth="1.2" />
          </g>

          {/* Torso */}
          <rect
            x="30"
            y="68"
            width="48"
            height="40"
            rx="12"
            fill="url(#teacher-bot-body)"
            stroke="#fda4af"
            strokeWidth="1.5"
          />
          <rect x="42" y="78" width="24" height="4" rx="2" fill="#fff1f2" opacity="0.35" />

          {/* Right arm — waves on interaction */}
          <g
            className={isInteracting ? "animate-teacher-bot-wave" : ""}
            style={{ transformOrigin: "76px 80px", transformBox: "fill-box" }}
          >
            <rect x="70" y="80" width="11" height="24" rx="5.5" fill="#fb7185" />
            <circle cx="75.5" cy="106" r="5.5" fill="#fff1f2" stroke="#fda4af" strokeWidth="1.2" />
          </g>

          {/* Head */}
          <rect
            x="28"
            y="26"
            width="52"
            height="46"
            rx="16"
            fill="url(#teacher-bot-head)"
            stroke="#fda4af"
            strokeWidth="1.5"
          />

          {/* Graduation cap — angled teacher hat */}
          <g transform="translate(54 24) rotate(-14)">
            <polygon points="-24,-10 24,-10 0,-22" fill="#27272a" />
            <rect x="-20" y="-10" width="40" height="5" rx="1.5" fill="#3f3f46" />
            <rect x="-22" y="-5" width="44" height="7" rx="2.5" fill="#27272a" />
            <line
              x1="20"
              y1="-7"
              x2="30"
              y2="2"
              stroke="#fbbf24"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <circle cx="30" cy="3" r="2.2" fill="#fbbf24" />
          </g>

          {/* Eyes */}
          <g className="animate-teacher-bot-blink" style={{ transformOrigin: "42px 46px" }}>
            <ellipse cx="42" cy="46" rx="4.2" ry="5" fill="#27272a" />
          </g>
          <g
            className={
              isInteracting ? "" : "animate-teacher-bot-blink"
            }
            style={{ transformOrigin: "66px 46px", animationDelay: "0.08s" }}
          >
            {isInteracting ? (
              <path
                d="M62 46.5 Q66 49.5 70 46.5"
                fill="none"
                stroke="#27272a"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ) : (
              <ellipse cx="66" cy="46" rx="4.2" ry="5" fill="#27272a" />
            )}
          </g>

          {/* Smile */}
          <path
            d="M44 58 Q54 64 64 58"
            fill="none"
            stroke="#fb7185"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Cheek blush */}
          <circle cx="36" cy="54" r="3" fill="#fda4af" opacity="0.45" />
          <circle cx="72" cy="54" r="3" fill="#fda4af" opacity="0.45" />
        </svg>
      </div>
    </div>
  );
}
