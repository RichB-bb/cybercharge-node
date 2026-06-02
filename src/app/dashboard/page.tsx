import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { WithdrawableBalance } from "@/components/dashboard/WithdrawableBalance";

export default function DashboardPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-zinc-950">
      <Navbar />
      <div className="px-4 pb-14 pt-[calc(env(safe-area-inset-top)+4.5rem)] sm:px-8 sm:pb-20 sm:pt-28">
        <div className="mx-auto max-w-5xl">
          <DashboardHero />
          <WithdrawableBalance />
        </div>
      </div>
      <Footer />
    </main>
  );
}
