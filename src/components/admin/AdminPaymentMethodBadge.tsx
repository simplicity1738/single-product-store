"use client";

import {
  formatPaymentMethodBadge,
  PAYMENT_METHOD,
  STRIPE_PAYMENT_TYPE,
  type PaymentMethod,
  type StripePaymentType,
} from "@/lib/order-payment";

function KlarnaIcon() {
  return (
    <span
      className="inline-flex h-4 items-center justify-center rounded-full border border-white/10 bg-[#ECE5D8]/20 px-1.5 text-[8px] font-black uppercase tracking-wider text-[#ECE5D8]"
      aria-hidden
    >
      K
    </span>
  );
}

function CardIcon() {
  return (
    <svg
      viewBox="0 0 24 16"
      className="h-3.5 w-5 shrink-0"
      role="img"
      aria-hidden
    >
      <rect width="24" height="16" rx="2" fill="#1A1F71" />
      <rect x="0" y="4" width="24" height="3" fill="#F4B942" />
      <rect x="3" y="11" width="6" height="1.5" rx="0.5" fill="#FFFFFF" opacity="0.9" />
    </svg>
  );
}

function VisaMiniIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" aria-hidden>
      <path
        fill="#CFC4BD"
        d="M9.112 8.262 5.97 15.758H3.92L2.374 9.775c-.094-.368-.175-.503-.461-.658C1.447 8.864.677 8.627 0 8.479l.046-.217h3.3a.904.904 0 0 1 .894.764l.817 4.338 2.018-5.102zm8.033 5.049c.008-1.979-2.736-2.088-2.717-2.972.006-.269.262-.555.822-.628a3.66 3.66 0 0 1 1.913.336l.34-1.59a5.207 5.207 0 0 0-1.814-.333c-1.917 0-3.266 1.02-3.278 2.479-.012 1.079.963 1.68 1.698 2.04.756.367 1.01.603 1.006.931-.005.504-.602.725-1.16.734-.975.015-1.54-.263-1.992-.473l-.351 1.642c.453.208 1.289.39 2.156.398 2.037 0 3.37-1.006 3.377-2.564m5.061 2.447H24l-1.565-7.496h-1.656a.883.883 0 0 0-.826.55l-2.909 6.946h2.036l.405-1.12h2.488zm-2.163-2.656 1.02-2.815.588 2.815zm-8.16-4.84-1.603 7.496H8.34l1.605-7.496z"
      />
    </svg>
  );
}

function MastercardMiniIcon() {
  return (
    <svg viewBox="0 0 24 16" className="h-3.5 w-5 shrink-0" aria-hidden>
      <circle cx="9" cy="8" r="6" fill="#EB001B" />
      <circle cx="15" cy="8" r="6" fill="#F79E1B" />
      <path fill="#FF5F00" d="M12 3.5a6 6 0 0 0 0 9 6 6 0 0 0 0-9z" />
    </svg>
  );
}

function BitcoinMiniIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" aria-hidden>
      <circle cx="12" cy="12" r="11" fill="#F7931A" fillOpacity="0.15" />
      <path
        fill="#F7931A"
        d="M23.189 10.101c.209-1.395-.855-2.143-2.311-2.643l.472-1.893-1.15-.287-.46 1.845c-.302-.075-.613-.146-.92-.216l.464-1.86-1.151-.287-.472 1.893c-.249-.057-.494-.112-.732-.17l.001-.006-1.585-.396-.306 1.228s.855.196.838.208c.467.117.551.427.537.672l-.538 2.158c.032.008.074.02.12.039l-.121-.03-.753 3.018c-.057.142-.201.354-.527.273.011.016-.838-.209-.838-.209l-.571 1.316 1.497.373c.278.07.551.142.818.21l-.476 1.913 1.15.287.472-1.894c.314.085.618.164.916.237l-.471 1.886 1.151.287.476-1.908c1.958.371 3.43.221 4.049-1.549.499-1.426-.025-2.248-1.054-2.782.749-.173 1.313-.662 1.463-1.679zm-2.637 3.654c-.354 1.428-2.751.655-3.528.461l.629-2.526c.777.194 3.266.578 2.899 2.065zm.355-3.658c-.324 1.297-2.325.637-2.975.475l.571-2.288c.65.163 2.728.464 2.404 1.813z"
      />
    </svg>
  );
}

function LinkMiniIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" aria-hidden>
      <rect width="24" height="24" rx="6" fill="#00D66F" />
      <path
        fill="#0A2540"
        d="M7.5 12.2c0-2.3 1.8-4.2 4.2-4.2.9 0 1.7.3 2.4.7l-1 1.4c-.4-.2-.8-.4-1.3-.4-1.4 0-2.4 1-2.4 2.5s1 2.5 2.4 2.5c.5 0 1-.1 1.3-.4l1 1.4c-.7.5-1.5.7-2.4.7-2.4 0-4.2-1.9-4.2-4.2zm9.2-3.9h1.8v7.8h-1.8V8.3z"
      />
    </svg>
  );
}

function badgeTone(paymentMethod?: PaymentMethod, stripePaymentType?: StripePaymentType) {
  if (paymentMethod === PAYMENT_METHOD.STRIPE) {
    if (stripePaymentType === STRIPE_PAYMENT_TYPE.KLARNA) {
      return "border-white/10 bg-[#ECE5D8]/10 text-[#ECE5D8]";
    }
    if (stripePaymentType === STRIPE_PAYMENT_TYPE.LINK) {
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
    }
    return "border-white/10 bg-white/5 text-[#CFC4BD]";
  }
  return "border-orange-500/20 bg-orange-500/10 text-orange-300";
}

function PaymentIcons({
  paymentMethod,
  stripePaymentType,
}: {
  paymentMethod?: PaymentMethod;
  stripePaymentType?: StripePaymentType;
}) {
  if (paymentMethod === PAYMENT_METHOD.STRIPE) {
    if (stripePaymentType === STRIPE_PAYMENT_TYPE.KLARNA) {
      return <KlarnaIcon />;
    }
    if (stripePaymentType === STRIPE_PAYMENT_TYPE.LINK) {
      return <LinkMiniIcon />;
    }
    return (
      <span className="inline-flex items-center gap-0.5" aria-hidden>
        <VisaMiniIcon />
        <MastercardMiniIcon />
      </span>
    );
  }

  return <BitcoinMiniIcon />;
}

type AdminPaymentMethodBadgeProps = {
  paymentMethod?: PaymentMethod;
  stripePaymentType?: StripePaymentType;
};

export default function AdminPaymentMethodBadge({
  paymentMethod,
  stripePaymentType,
}: AdminPaymentMethodBadgeProps) {
  const method = paymentMethod ?? PAYMENT_METHOD.BITCOIN;
  const label = formatPaymentMethodBadge(method, stripePaymentType);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase ${badgeTone(method, stripePaymentType)}`}
    >
      <PaymentIcons
        paymentMethod={method}
        stripePaymentType={stripePaymentType}
      />
      <span>{label}</span>
    </span>
  );
}

/** Kept for any callers that still want the card-only glyph. */
export function AdminCardPaymentIcon() {
  return <CardIcon />;
}
