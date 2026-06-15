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
    <div className="mt-4">
      {label ? (
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
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
                  ? "border-rose-400 bg-rose-400 text-white shadow-sm shadow-rose-200"
                  : "border-rose-200 bg-white text-zinc-700 hover:border-rose-300 hover:bg-rose-50"
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
