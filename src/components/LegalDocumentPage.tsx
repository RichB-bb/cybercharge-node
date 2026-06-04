import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

type LegalSection = {
  body: string[];
  title: string;
};

export function LegalDocumentPage({
  description,
  sections,
  title,
}: {
  description: string;
  sections: LegalSection[];
  title: string;
}) {
  return (
    <main className="min-h-screen bg-white text-zinc-950">
      <Navbar />
      <section className="px-4 pb-16 pt-[calc(env(safe-area-inset-top)+6rem)] sm:px-8 sm:pb-24 sm:pt-32">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-red-600">
            CyberCharge
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-zinc-950 sm:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-zinc-500 sm:text-xl sm:leading-8">
            {description}
          </p>

          <div className="mt-12 divide-y divide-zinc-200 border-y border-zinc-200">
            {sections.map((section) => (
              <article key={section.title} className="grid gap-5 py-8 sm:grid-cols-[0.42fr_1fr] sm:py-10">
                <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">
                  {section.title}
                </h2>
                <div className="space-y-4 text-sm leading-7 text-zinc-600 sm:text-base sm:leading-8">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <p className="mt-8 max-w-3xl text-xs leading-6 text-zinc-500">
            These documents are provided for the CyberCharge front-end platform experience and should be reviewed with appropriate professional advice before participating in any infrastructure allocation.
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
