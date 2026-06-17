import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Peptidkalkylator — SimpliCity",
  description:
    "Beräkna exakt sprutenhet för peptidlösning. Premium kalkylator för rekonstitution med mg-dosering.",
};

export default function CalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
