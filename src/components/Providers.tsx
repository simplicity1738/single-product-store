"use client";

import { Suspense } from "react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ProductProvider } from "@/contexts/ProductContext";
import { StoreConfigProvider } from "@/contexts/StoreConfigContext";
import AnalyticsScripts from "@/components/AnalyticsScripts";
import RefTracker from "@/components/RefTracker";
import Faq from "@/components/Faq";
import CartDrawer from "@/components/CartDrawer";
import AgeGate from "@/components/AgeGate";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <StoreConfigProvider>
        <AnalyticsScripts />
        <Suspense fallback={null}>
          <RefTracker />
        </Suspense>
        <ProductProvider>
          <AgeGate />
          {children}
          <CartDrawer />
          <Faq />
        </ProductProvider>
      </StoreConfigProvider>
    </LanguageProvider>
  );
}
