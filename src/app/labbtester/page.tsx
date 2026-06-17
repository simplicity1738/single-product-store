import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LabTestGallery from "@/components/LabTestGallery";
import { readLabTests } from "@/lib/lab-test.server";

export default async function LabTestsPage() {
  const tests = await readLabTests();

  return (
    <div className="min-h-full bg-gradient-to-b from-[#FDF3F3]/70 via-rose-50/30 to-white text-zinc-900">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <LabTestGallery initialTests={tests} />
      </main>
      <Footer />
    </div>
  );
}
