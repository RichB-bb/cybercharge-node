"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export function HeroSection() {
  const { t } = useLanguage();

  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-black px-4 pb-10 pt-[calc(env(safe-area-inset-top)+4rem)] sm:px-8"
    >
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster="/images/station.avif"
        preload="metadata"
      >
        <source src="/videos/hero-mobile.mp4" type="video/mp4" media="(max-width: 639px)" />
        <source
          src="/videos/Supercharger-Hero-Desktop.webm"
          type="video/webm"
          media="(min-width: 640px)"
        />
      </video>
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center text-center">
        <motion.div
          initial={{ y: 28, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="max-w-5xl"
        >
          <h1 className="text-4xl font-semibold leading-[1.02] tracking-tight text-white min-[390px]:text-5xl sm:text-7xl lg:text-8xl">
            {t.hero.title}
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-white/85 sm:mt-5 sm:text-2xl sm:leading-9">
            {t.hero.subtitle}
          </p>

          <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row sm:gap-4">
            <a
              href="#payment"
              className="group inline-flex h-12 w-full max-w-72 items-center justify-center gap-2 rounded-md bg-zinc-950 px-6 text-sm font-semibold text-white transition hover:bg-zinc-800 sm:h-11 sm:min-w-44 sm:max-w-none"
            >
              {t.hero.invest}
              <ChevronRight size={17} className="transition group-hover:translate-x-1" />
            </a>
            <a
              href="#deployment-map"
              className="inline-flex h-12 w-full max-w-72 items-center justify-center rounded-md bg-white/85 px-6 text-sm font-semibold text-zinc-950 transition hover:bg-white sm:h-11 sm:min-w-44 sm:max-w-none"
            >
              {t.hero.deployment}
            </a>
          </div>
          <a
            href="/dashboard"
            className="mt-5 inline-flex text-sm font-semibold text-white underline decoration-white/45 underline-offset-8 transition hover:decoration-white"
          >
            View Investor Dashboard
          </a>
        </motion.div>
      </div>
    </section>
  );
}
