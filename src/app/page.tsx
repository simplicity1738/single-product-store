import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Products, { QualitySection } from "@/components/Products";
import OrderForm from "@/components/OrderForm";
import ContactForm from "@/components/ContactForm";
import TrustBar from "@/components/TrustBar";
import Reviews from "@/components/Reviews";
import Footer from "@/components/Footer";
import {
  readStoreConfig,
} from "@/lib/store-config.server";
import { resolveCampaignFeaturedProduct } from "@/lib/store-config";

export default async function Home() {
  const config = await readStoreConfig();
  const featuredProduct = resolveCampaignFeaturedProduct(config);
  const featuredConfigProduct =
    config.products.find((product) => product.id === featuredProduct?.id) ??
    null;

  return (
    <div className="min-h-full bg-white text-zinc-900">
      <Header />
      <main>
        <Hero
          siteSettings={config.siteSettings}
          featuredProduct={featuredProduct}
          featuredConfigProduct={featuredConfigProduct}
        />
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
