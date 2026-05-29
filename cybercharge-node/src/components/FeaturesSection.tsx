"use client";

import { motion } from "framer-motion";
import { Blocks, Building2, Coins, CreditCard } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

const features = [
  {
    icon: Building2,
  },
  {
    icon: Coins,
  },
  {
    icon: CreditCard,
  },
  {
    icon: Blocks,
  },
];

export function FeaturesSection() {
  const { t } = useLanguage();

  return (
    <section id="features" className="bg-zinc-50 px-4 py-20 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.85, ease: "easeOut" }}
          className="max-w-3xl"
        >
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-red-600 sm:text-sm sm:tracking-[0.28em]">
              {t.features.eyebrow}
            </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-6xl">
            {t.features.title}
          </h2>
        </motion.div>

        <div className="mt-12 space-y-12 sm:mt-20 sm:space-y-20">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const copy = t.features.items[index];
            return (
              <motion.article
                key={copy.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, delay: index * 0.06, ease: "easeOut" }}
                className="grid items-center gap-6 border-t border-zinc-200 pt-8 md:grid-cols-[0.8fr_1.2fr] md:gap-10 md:pt-10"
              >
                <div className="flex items-center gap-4 sm:gap-5">
                  <Icon size={28} className="text-red-600" />
                  <h3 className="text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
                    {copy.title}
                  </h3>
                </div>
                <p className="max-w-2xl text-base leading-7 text-zinc-500 sm:text-xl sm:leading-9">{copy.description}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
