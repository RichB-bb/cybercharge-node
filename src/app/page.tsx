import { DeploymentMap } from "@/components/DeploymentMap";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { ImmersiveImageSection } from "@/components/ImmersiveImageSection";
import { Navbar } from "@/components/Navbar";
import { PaymentSection } from "@/components/PaymentSection";
import { PaymentTimeline } from "@/components/PaymentTimeline";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-zinc-950">
      <Navbar />
      <HeroSection />
      <ImmersiveImageSection
        image="/images/station.avif"
        copyKey="station"
      />
      <ImmersiveImageSection
        image="/images/deployment.avif"
        copyKey="assets"
      />
      <DeploymentMap />
      <PaymentTimeline />
      <PaymentSection />
      <Footer />
    </main>
  );
}
