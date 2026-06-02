import dynamic from "next/dynamic";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { ImmersiveImageSection } from "@/components/ImmersiveImageSection";
import { Navbar } from "@/components/Navbar";

const DeploymentMap = dynamic(() =>
  import("@/components/DeploymentMap").then((module) => module.DeploymentMap),
);
const PaymentTimeline = dynamic(() =>
  import("@/components/PaymentTimeline").then((module) => module.PaymentTimeline),
);
const PaymentSection = dynamic(() =>
  import("@/components/PaymentSection").then((module) => module.PaymentSection),
);

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-zinc-950">
      <Navbar />
      <HeroSection />
      <ImmersiveImageSection
        id="infrastructure"
        image="/images/station.avif"
        mobileImage="/images/station-mobile.jpg"
        copyKey="station"
      />
      <ImmersiveImageSection
        image="/images/deployment.avif"
        mobileImage="/images/deployment-mobile.jpg"
        copyKey="assets"
      />
      <DeploymentMap />
      <PaymentTimeline />
      <PaymentSection />
      <HowReturnsGenerated />
      <Footer />
    </main>
  );
}

function HowReturnsGenerated() {
  const cards = [
    {
      title: "Infrastructure Allocation",
      body: "Participants acquire an allocation linked to charging infrastructure deployment.",
    },
    {
      title: "Charging Activity",
      body: "Network assets generate operational activity across active locations.",
    },
    {
      title: "Dashboard Tracking",
      body: "Allocation records and activity are reflected in the investor dashboard.",
    },
  ];

  return (
    <section className="bg-white px-4 py-12 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <h2 className="text-4xl font-semibold tracking-tight text-zinc-950 sm:text-6xl">
            How Returns Are Generated
          </h2>
          <p className="mt-4 text-base leading-7 text-zinc-500 sm:text-xl sm:leading-8">
            A simplified overview of how infrastructure participation is tracked across
            the platform.
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:mt-10 lg:grid-cols-3">
          {cards.map((card, index) => (
            <article key={card.title} className="border border-zinc-200 bg-white p-6">
              <p className="text-sm font-medium text-zinc-400">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-8 text-2xl font-semibold tracking-tight text-zinc-950">
                {card.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-zinc-500">{card.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
