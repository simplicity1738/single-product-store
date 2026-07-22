import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Products, { QualitySection } from "@/components/Products";
import OrderForm from "@/components/OrderForm";
import ContactForm from "@/components/ContactForm";
import TrustBar from "@/components/TrustBar";
import Reviews from "@/components/Reviews";
import Footer from "@/components/Footer";
import { readStoreConfig } from "@/lib/store-config.server";

export default async function Home() {
  const config = await readStoreConfig();

  return (
    <div className="min-h-full bg-white text-zinc-900">
      {/* Full-bleed luxury dark pink canvas — header + hero share one backdrop */}
      <div className="relative bg-gradient-to-b from-[#2D1720] via-[#24121A] to-[#1A0C13]">
        <Header />
        <Hero siteSettings={config.siteSettings} />
      </div>

      <main>
        <QualitySection />
        <Products />
        <OrderForm />
        <ContactForm />
        <TrustBar />
        <Reviews />
      </main>
      <Footer />
    </div>
  );
}
