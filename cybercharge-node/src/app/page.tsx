import { FeaturesSection } from "@/components/FeaturesSection";
import { HeroSection } from "@/components/HeroSection";
import { ImmersiveImageSection } from "@/components/ImmersiveImageSection";
import { InfrastructureOverview } from "@/components/InfrastructureOverview";
import { Navbar } from "@/components/Navbar";
import { PaymentSection } from "@/components/PaymentSection";
import { PurchaseFlow } from "@/components/PurchaseFlow";
import { RevenueModel } from "@/components/RevenueModel";
import { DeploymentMap } from "@/components/DeploymentMap";
import { WhyEVInfrastructure } from "@/components/WhyEVInfrastructure";

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
      <RevenueModel />
      <InfrastructureOverview />
      <DeploymentMap />
      <WhyEVInfrastructure />
      <FeaturesSection />
      <PaymentSection />
      <PurchaseFlow />
    </main>
  );
}
