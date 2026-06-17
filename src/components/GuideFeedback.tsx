"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

type GuideFeedbackProps = {
  className?: string;
};

export default function GuideFeedback({ className = "" }: GuideFeedbackProps) {
  const { t } = useLanguage();
  const [selectedVote, setSelectedVote] = useState<"positive" | "negative" | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitVote(vote: "positive" | "negative") {
    if (selectedVote || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vote }),
      });

      if (!response.ok) {
        throw new Error("Feedback failed");
      }

      setSelectedVote(vote);
    } catch {
      setSelectedVote(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className={`rounded-xl border border-rose-100 bg-rose-50/40 px-4 py-3 ${className}`}
    >
      <p className="text-xs font-medium text-zinc-600">{t.faq.feedbackPrompt}</p>

      {selectedVote ? (
        <p className="mt-2 text-xs font-semibold text-rose-600">
          {selectedVote === "positive"
            ? t.faq.feedbackThanksPositive
            : t.faq.feedbackThanksNegative}
        </p>
      ) : (
        <div className="mt-3 flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => void submitVote("positive")}
            aria-label={t.faq.feedbackPositive}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-rose-200 bg-white text-lg transition hover:border-rose-300 hover:bg-rose-50 disabled:opacity-60"
          >
            👍
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => void submitVote("negative")}
            aria-label={t.faq.feedbackNegative}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-rose-200 bg-white text-lg transition hover:border-rose-300 hover:bg-rose-50 disabled:opacity-60"
          >
            👎
          </button>
        </div>
      )}
    </div>
  );
}
