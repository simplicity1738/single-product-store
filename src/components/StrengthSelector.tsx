"use client";

type StrengthSelectorProps = {
  productId: string;
  strengths: string[];
  activeStrength: string;
  onSelect: (strength: string) => void;
  label?: string;
};

export default function StrengthSelector({
  productId,
  strengths,
  activeStrength,
  onSelect,
  label,
}: StrengthSelectorProps) {
  if (strengths.length <= 1) return null;

  return (
    <div className="mt-2">
      {label ? (
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#A89A92]">
          {label}
        </p>
      ) : null}
      <div
        role="radiogroup"
        aria-label={label ?? "Välj styrka"}
        className="mt-2 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-thin"
      >
        {strengths.map((strength) => {
          const isActive = strength === activeStrength;
          return (
            <button
              key={`${productId}-${strength}`}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onSelect(strength)}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                isActive
                  ? "border-[#ECE5D8]/40 bg-[#ECE5D8] text-[#0F0C0B] shadow-sm"
                  : "border-white/10 bg-white/5 text-[#D4C8C2] hover:border-white/25 hover:bg-white/10"
              }`}
            >
              {strength}
            </button>
          );
        })}
      </div>
    </div>
  );
}
