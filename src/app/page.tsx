import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Products, { Features } from "@/components/Products";
import OrderForm from "@/components/OrderForm";
import ContactForm from "@/components/ContactForm";
import TrustBar from "@/components/TrustBar";
import Reviews from "@/components/Reviews";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-full bg-white text-zinc-900">
      <Header />
      <main>
        <Hero />
        <Products />
        <Features />
        <OrderForm />
        <ContactForm />
        <TrustBar />
        <Reviews />
      </main>
      <Footer />
    </div>
  );
}
