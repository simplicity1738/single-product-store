import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Labbtester — SimpliCity",
  description:
    "Tredjepartsanalyser och labbtester. Alla batcher verifieras för renhet och identitet.",
};

export default function LabTestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
