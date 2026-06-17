import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blogg — SimpliCity",
  description:
    "Artiklar om peptider, dosering och den senaste forskningen.",
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
