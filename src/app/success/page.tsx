import { Suspense } from "react";
import SuccessReceipt from "./SuccessReceipt";

function SuccessLoading() {
  return (
    <div className="flex min-h-full items-center justify-center bg-rose-50 px-4 py-24">
      <p className="text-sm text-zinc-500">Loading receipt…</p>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<SuccessLoading />}>
      <SuccessReceipt />
    </Suspense>
  );
}
