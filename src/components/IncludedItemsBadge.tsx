type IncludedItemsBadgeProps = {
  items: string;
};

export default function IncludedItemsBadge({ items }: IncludedItemsBadgeProps) {
  const trimmed = items.trim();
  if (!trimmed) return null;

  return (
    <p className="mt-2 inline-flex max-w-full items-start gap-1.5 rounded-lg border border-rose-200/80 bg-rose-50 px-2.5 py-1.5 text-xs font-medium leading-snug text-rose-700">
      <span aria-hidden className="shrink-0">
        📦
      </span>
      <span>
        Medföljer: <span className="text-rose-800">{trimmed}</span>
      </span>
    </p>
  );
}
