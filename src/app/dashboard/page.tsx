import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { PortfolioOverview } from "@/components/dashboard/PortfolioOverview";
import { AllocationCard } from "@/components/dashboard/AllocationCard";
import { RevenueCard } from "@/components/dashboard/RevenueCard";
import { DeploymentExposure } from "@/components/dashboard/DeploymentExposure";
import { TransactionHistory } from "@/components/dashboard/TransactionHistory";
import { NetworkActivity } from "@/components/dashboard/NetworkActivity";

export default function DashboardPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-zinc-950">
      <Navbar />
      <div className="px-4 pb-20 pt-[calc(env(safe-area-inset-top)+5rem)] sm:px-8 sm:pb-28 sm:pt-32">
        <div className="mx-auto max-w-7xl">
          <DashboardHero />
          <PortfolioOverview />

          <div className="mt-10 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <AllocationCard />
            <RevenueCard />
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <DeploymentExposure />
            <NetworkActivity />
          </div>

          <TransactionHistory />
        </div>
      </div>
      <Footer />
    </main>
  );
}
