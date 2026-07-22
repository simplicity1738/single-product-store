"use client";

import { useLanguage } from "@/contexts/LanguageContext";

type PaymentTrustBadgesProps = {
  className?: string;
  variant?: "default" | "monochrome";
  hideLabel?: boolean;
};

const logoClassName =
  "h-6 w-auto shrink-0 sm:h-7 opacity-95 transition-opacity duration-300 hover:opacity-100";

const glassBadgeClassName =
  "inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/10 px-3 py-1.5 shadow-sm backdrop-blur-md";

function StripeLogo() {
  return (
    <svg
      viewBox="0 0 64 24"
      className={logoClassName}
      role="img"
      aria-label="Stripe"
    >
      <text
        x="0"
        y="18"
        fill="#A5A0FF"
        fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif"
        fontSize="18"
        fontWeight="600"
        letterSpacing="-0.4"
      >
        stripe
      </text>
    </svg>
  );
}

function VisaLogo() {
  return (
    <svg
      viewBox="0 0 24 24"
      className={logoClassName}
      role="img"
      aria-label="Visa"
    >
      <path
        fill="#FFFFFF"
        d="M9.112 8.262 5.97 15.758H3.92L2.374 9.775c-.094-.368-.175-.503-.461-.658C1.447 8.864.677 8.627 0 8.479l.046-.217h3.3a.904.904 0 0 1 .894.764l.817 4.338 2.018-5.102zm8.033 5.049c.008-1.979-2.736-2.088-2.717-2.972.006-.269.262-.555.822-.628a3.66 3.66 0 0 1 1.913.336l.34-1.59a5.207 5.207 0 0 0-1.814-.333c-1.917 0-3.266 1.02-3.278 2.479-.012 1.079.963 1.68 1.698 2.04.756.367 1.01.603 1.006.931-.005.504-.602.725-1.16.734-.975.015-1.54-.263-1.992-.473l-.351 1.642c.453.208 1.289.39 2.156.398 2.037 0 3.37-1.006 3.377-2.564m5.061 2.447H24l-1.565-7.496h-1.656a.883.883 0 0 0-.826.55l-2.909 6.946h2.036l.405-1.12h2.488zm-2.163-2.656 1.02-2.815.588 2.815zm-8.16-4.84-1.603 7.496H8.34l1.605-7.496z"
      />
    </svg>
  );
}

function MastercardLogo() {
  return (
    <svg
      viewBox="0 0 48 30"
      className={`${logoClassName} max-w-[2.75rem] sm:max-w-none`}
      role="img"
      aria-label="Mastercard"
    >
      <circle cx="18" cy="15" r="12" fill="#EB001B" />
      <circle cx="30" cy="15" r="12" fill="#F79E1B" />
      <path fill="#FF5F00" d="M24 7.2a12 12 0 0 0 0 15.6 12 12 0 0 0 0-15.6z" />
    </svg>
  );
}

function ApplePayLogo() {
  return (
    <svg
      viewBox="0 0 120 40"
      className={`${logoClassName} max-w-[3.5rem] sm:max-w-none`}
      role="img"
      aria-label="Apple Pay"
    >
      <path
        fill="#FFFFFF"
        d="M26.9 12.8c-.9 1-2.3 1.8-3.7 1.7-.1-1.5.5-3.1 1.4-4.1.9-1.1 2.5-1.8 3.8-1.9.1 1.6-.5 3.1-1.5 4.3zm1.3 2.1c-2-.1-3.7 1.2-4.6 1.2-.9 0-2.3-1.1-3.8-1.1-2 0-3.8 1.1-4.8 2.9-2 3.5-.5 8.7 1.5 11.5 1 1.4 2.2 3 3.7 2.9 1.5-.1 2.1-1 3.8-1 1.7 0 2.2 1 3.8 1 1.6 0 2.7-1.5 3.7-2.9 1.2-1.7 1.7-3.3 1.7-3.4-.1 0-3.2-1.2-3.2-4.9-.1-3 2.6-4.5 2.7-4.6-1.7-2.3-4.2-2.5-5.2-2.6z"
      />
      <text
        x="52"
        y="26.5"
        fill="#FFFFFF"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontSize="15"
        fontWeight="500"
        letterSpacing="0.02em"
      >
        Pay
      </text>
    </svg>
  );
}

function KlarnaBadge() {
  return (
    <span
      className="font-sans text-[10px] font-black uppercase tracking-widest text-[#ECE5D8]"
      role="img"
      aria-label="Klarna"
    >
      KLARNA
    </span>
  );
}

function BitcoinLogo() {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`${logoClassName} max-w-[2rem] sm:max-w-none`}
      role="img"
      aria-label="Bitcoin"
    >
      <circle cx="12" cy="12" r="11" fill="#F7931A" fillOpacity="0.2" />
      <path
        fill="#F7931A"
        d="M23.189 10.101c.209-1.395-.855-2.143-2.311-2.643l.472-1.893-1.15-.287-.46 1.845c-.302-.075-.613-.146-.92-.216l.464-1.86-1.151-.287-.472 1.893c-.249-.057-.494-.112-.732-.17l.001-.006-1.585-.396-.306 1.228s.855.196.838.208c.467.117.551.427.537.672l-.538 2.158c.032.008.074.02.12.039l-.121-.03-.753 3.018c-.057.142-.201.354-.527.273.011.016-.838-.209-.838-.209l-.571 1.316 1.497.373c.278.07.551.142.818.21l-.476 1.913 1.15.287.472-1.894c.314.085.618.164.916.237l-.471 1.886 1.151.287.476-1.908c1.958.371 3.43.221 4.049-1.549.499-1.426-.025-2.248-1.054-2.782.749-.173 1.313-.662 1.463-1.679zm-2.637 3.654c-.354 1.428-2.751.655-3.528.461l.629-2.526c.777.194 3.266.578 2.899 2.065zm.355-3.658c-.324 1.297-2.325.637-2.975.475l.571-2.288c.65.163 2.728.464 2.404 1.813z"
      />
    </svg>
  );
}

type PaymentBadgeItem = {
  key: string;
  render: () => React.ReactNode;
};

const DEFAULT_BADGES: PaymentBadgeItem[] = [
  { key: "stripe", render: () => <StripeLogo /> },
  { key: "visa", render: () => <VisaLogo /> },
  { key: "mastercard", render: () => <MastercardLogo /> },
  { key: "apple-pay", render: () => <ApplePayLogo /> },
  { key: "klarna", render: () => <KlarnaBadge /> },
  { key: "bitcoin", render: () => <BitcoinLogo /> },
];

const MONOCHROME_BADGES = DEFAULT_BADGES.filter((badge) => badge.key !== "stripe");

export default function PaymentTrustBadges({
  className = "",
  variant = "default",
  hideLabel = false,
}: PaymentTrustBadgesProps) {
  const { t } = useLanguage();
  const badges = variant === "monochrome" ? MONOCHROME_BADGES : DEFAULT_BADGES;

  return (
    <div className={`text-center ${className}`}>
      {!hideLabel && (
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[#A89A92]">
          {t.trust.securePayments}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
        {badges.map((badge) => (
          <span key={badge.key} className={glassBadgeClassName}>
            {badge.render()}
          </span>
        ))}
      </div>
    </div>
  );
}
