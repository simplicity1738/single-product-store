"use client";

import LegalPageLayout from "@/components/LegalPageLayout";
import { useLanguage } from "@/contexts/LanguageContext";

export default function PrivacyPolicyPage() {
  const { t } = useLanguage();

  return <LegalPageLayout content={t.legal.privacy} />;
}
