"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";

export function RevenueModel() {
  const { t } = useLanguage();

  return (
    <section id="revenue" className="bg-white px-4 py-20 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.85, ease: "easeOut" }}
          className="mx-auto max-w-4xl text-center"
        >
          <h2 className="text-4xl font-semibold tracking-tight text-zinc-950 sm:text-7xl">
            {t.revenue.title}
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-zinc-500 sm:mt-6 sm:text-2xl sm:leading-9">
            {t.revenue.subtitle}
          </p>
        </motion.div>

        <div className="mx-auto mt-14 max-w-5xl space-y-12 sm:mt-24 sm:space-y-20">
          {t.revenue.steps.map((step, index) => {
            return (
              <motion.article
                key={step}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.75, delay: index * 0.06, ease: "easeOut" }}
                className="grid gap-5 border-t border-zinc-200 pt-8 sm:grid-cols-[220px_1fr] sm:items-start sm:gap-8 sm:pt-10"
              >
                <p className="text-5xl font-semibold tracking-tight text-zinc-300 sm:text-8xl">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="max-w-3xl text-2xl font-semibold leading-tight tracking-tight text-zinc-950 sm:text-5xl">
                  {step}
                </h3>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
