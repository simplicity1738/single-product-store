"use client";

import LegalPageLayout from "@/components/LegalPageLayout";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LabTestsPage() {
  const { t } = useLanguage();

  return <LegalPageLayout content={t.legal.labTests} showPlaceholder />;
}
