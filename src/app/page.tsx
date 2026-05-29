import { FeaturesSection } from "@/components/FeaturesSection";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { ImmersiveImageSection } from "@/components/ImmersiveImageSection";
import { InfrastructureOverview } from "@/components/InfrastructureOverview";
import { Navbar } from "@/components/Navbar";
import { PaymentSection } from "@/components/PaymentSection";
import { PaymentTimeline } from "@/components/PaymentTimeline";
import { PlatformSnapshot } from "@/components/PlatformSnapshot";
import { PurchaseFlow } from "@/components/PurchaseFlow";
import { RevenueModel } from "@/components/RevenueModel";
import { DeploymentMap } from "@/components/DeploymentMap";
import { WhyEVInfrastructure } from "@/components/WhyEVInfrastructure";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-zinc-950">
      <Navbar />
      <HeroSection />
      <PlatformSnapshot />
      <ImmersiveImageSection
        image="/images/station.avif"
        copyKey="station"
      />
      <ImmersiveImageSection
        image="/images/deployment.avif"
        copyKey="assets"
      />
      <RevenueModel />
      <InfrastructureOverview />
      <DeploymentMap />
      <WhyEVInfrastructure />
      <FeaturesSection />
      <PaymentTimeline />
      <PaymentSection />
      <PurchaseFlow />
      <Footer />
    </main>
  );
}
