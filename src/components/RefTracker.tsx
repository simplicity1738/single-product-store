"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { REF_COOKIE_NAME, normalizeRefHandle } from "@/lib/ref-tracking";

const REF_SESSION_PREFIX = "ref-tracked:";
const REF_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function persistRefCookie(ref: string): void {
  const normalizedRef = normalizeRefHandle(ref);
  if (!normalizedRef) return;

  document.cookie = `${REF_COOKIE_NAME}=${encodeURIComponent(normalizedRef)}; path=/; max-age=${REF_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}

export default function RefTracker() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

  useEffect(() => {
    if (!ref) return;

    const normalizedRef = normalizeRefHandle(ref);
    if (!normalizedRef) return;

    persistRefCookie(normalizedRef);

    const sessionKey = `${REF_SESSION_PREFIX}${normalizedRef}`;
    if (sessionStorage.getItem(sessionKey)) return;

    void fetch("/api/influencer/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ref: normalizedRef }),
    })
      .then((response) => {
        if (response.ok) {
          sessionStorage.setItem(sessionKey, "1");
        }
      })
      .catch(() => {
        // Silent — tracking is best-effort.
      });
  }, [ref]);

  return null;
}
