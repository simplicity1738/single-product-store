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
      className={`rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 ${className}`}
    >
      <p className="text-xs font-medium text-[#CFC4BD]">{t.faq.feedbackPrompt}</p>

      {selectedVote ? (
        <p className="mt-2 text-xs font-semibold text-[#ECE5D8]">
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
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg transition hover:border-white/25 hover:bg-white/10 disabled:opacity-60"
          >
            👍
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => void submitVote("negative")}
            aria-label={t.faq.feedbackNegative}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg transition hover:border-white/25 hover:bg-white/10 disabled:opacity-60"
          >
            👎
          </button>
        </div>
      )}
    </div>
  );
}
