import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Products, { QualitySection } from "@/components/Products";
import BundleSection from "@/components/BundleSection";
import OrderForm from "@/components/OrderForm";
import Reviews from "@/components/Reviews";
import Footer from "@/components/Footer";
import { readStoreConfig } from "@/lib/store-config.server";

export default async function Home() {
  const config = await readStoreConfig();

  return (
    <div className="min-h-full bg-[#0F0C0B] text-white">
      {/* ONDO: cream header → cinematic hero → quality → products → bundle → checkout → reviews */}
      <Header />
      <Hero siteSettings={config.siteSettings} />
      <QualitySection />

      <main className="bg-[#0F0C0B]">
        <Products />
        <BundleSection />
        <OrderForm />
        <Reviews />
      </main>
      <Footer />
    </div>
  );
}
