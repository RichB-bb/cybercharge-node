"use client";

import { useLanguage } from "@/lib/i18n";
import { BrandLogo } from "./BrandLogo";

const footerLinks = [
  { labelKey: "terms", href: "/terms" },
  { labelKey: "privacy", href: "/privacy" },
  { labelKey: "riskDisclosure", href: "/#risk-disclosure" },
  { labelKey: "contact", href: "mailto:contact@tslcharge.cc" },
] as const;

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-zinc-200 bg-white px-4 py-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] sm:px-8 sm:py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <BrandLogo />
          <p className="mt-3 text-sm leading-6 text-zinc-500">
            {t.footer.platform}
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-5 gap-y-3 text-sm font-medium text-zinc-700">
          {footerLinks.map((link) => (
            <a
              key={link.labelKey}
              href={link.href}
              className="transition hover:text-zinc-950"
            >
              {t.footer[link.labelKey]}
            </a>
          ))}
        </nav>
      </div>
      <div className="mx-auto mt-5 max-w-7xl text-sm text-zinc-400">
        {t.footer.copyright}
      </div>
    </footer>
  );
}
