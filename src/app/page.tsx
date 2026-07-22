import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Products, { QualitySection } from "@/components/Products";
import OrderForm from "@/components/OrderForm";
import Reviews from "@/components/Reviews";
import Footer from "@/components/Footer";
import { readStoreConfig } from "@/lib/store-config.server";

export default async function Home() {
  const config = await readStoreConfig();

  return (
    <div className="min-h-full bg-white text-zinc-900">
      {/* ONDO: cream header → cinematic hero → quality → products → checkout → reviews */}
      <Header />
      <Hero siteSettings={config.siteSettings} />
      <QualitySection />

      <main>
        <Products />
        <OrderForm />
        <Reviews />
      </main>
      <Footer />
    </div>
  );
}
