"use client";

import LegalPageLayout from "@/components/LegalPageLayout";
import { useLanguage } from "@/contexts/LanguageContext";

export default function DisclaimerPage() {
  const { t } = useLanguage();

  return (
    <LegalPageLayout
      content={t.legal.disclaimer}
      lastUpdated={t.legal.disclaimerLastUpdated}
    />
  );
}
