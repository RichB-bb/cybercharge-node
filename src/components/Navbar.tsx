"use client";

import {
  useAccountModal,
  useChainModal,
  useConnectModal,
} from "@rainbow-me/rainbowkit";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { languages, useLanguage } from "@/lib/i18n";
import { BrandLogo } from "./BrandLogo";

const navItems = [
  { labelKey: "infrastructure", href: "/#infrastructure" },
  { labelKey: "network", href: "/#deployment-map" },
  { labelKey: "payment", href: "/#payment" },
  { labelKey: "dashboard", href: "/dashboard" },
] as const;

const supportedChainIds = new Set([1, 8453, 137, 56]);

export function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 bg-white/75 pt-[env(safe-area-inset-top)] backdrop-blur-xl"
    >
      <nav className="mx-auto grid h-14 max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-4 sm:h-16 sm:px-8 lg:grid-cols-[1fr_auto_1fr]">
        <a href="/#top" className="min-w-0" onClick={() => setIsMenuOpen(false)}>
          <BrandLogo />
        </a>

        <div className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-zinc-700 transition hover:text-zinc-950"
            >
              {t.nav[item.labelKey]}
            </a>
          ))}
        </div>

        <div className="flex min-w-0 items-center gap-1.5 justify-self-end sm:gap-2">
          <a
            href="/#payment"
            className="hidden h-9 items-center rounded-full bg-zinc-950 px-4 text-xs font-semibold text-white transition hover:bg-zinc-800 xl:inline-flex"
          >
            {t.nav.purchaseAllocation}
          </a>
          <select
            aria-label={t.nav.language}
            value={language}
            onChange={(event) => setLanguage(event.target.value as typeof language)}
            className="hidden h-9 max-w-24 rounded-full border border-zinc-200 bg-white/85 px-2 text-xs font-medium text-zinc-700 outline-none transition hover:border-zinc-400 sm:block sm:max-w-none sm:px-3"
          >
            {languages.map((item) => (
              <option key={item.code} value={item.code}>
                {item.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setIsMenuOpen((current) => !current)}
            className="grid size-9 place-items-center rounded-full border border-zinc-200 bg-white/85 text-zinc-950 transition hover:border-zinc-400 lg:hidden"
          >
            {isMenuOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
          <CompactConnectButton />
        </div>
      </nav>

      {isMenuOpen && (
        <div className="border-t border-zinc-200 bg-white/95 px-4 py-5 shadow-sm backdrop-blur-xl lg:hidden">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-1">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex min-h-12 items-center justify-between border-b border-zinc-100 text-base font-medium text-zinc-950"
                >
                  {t.nav[item.labelKey]}
                  <span className="text-zinc-300">/</span>
                </a>
              ))}
            </div>
            <a
              href="/#payment"
              onClick={() => setIsMenuOpen(false)}
              className="mt-5 flex h-12 items-center justify-center bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800"
            >
              {t.nav.purchaseAllocation}
            </a>
            <div className="mt-5">
              <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                {t.nav.language}
              </label>
              <select
                aria-label={t.nav.language}
                value={language}
                onChange={(event) => setLanguage(event.target.value as typeof language)}
                className="h-12 w-full rounded-none border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 outline-none transition hover:border-zinc-400"
              >
                {languages.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function CompactConnectButton() {
  const { t } = useLanguage();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { openAccountModal } = useAccountModal();
  const { openChainModal } = useChainModal();
  const { openConnectModal } = useConnectModal();
  const isUnsupportedChain = Boolean(isConnected && chainId && !supportedChainIds.has(chainId));

  if (!isConnected || !address) {
    return (
      <button
        type="button"
        onClick={openConnectModal}
        className="h-9 rounded-full bg-zinc-950 px-3 text-xs font-semibold text-white transition hover:bg-zinc-800 sm:px-4"
      >
        {t.dashboard.connectWallet}
      </button>
    );
  }

  if (isUnsupportedChain) {
    return (
      <button
        type="button"
        onClick={openChainModal}
        className="h-9 rounded-full bg-red-600 px-3 text-xs font-semibold text-white"
      >
        {t.nav.network}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={openAccountModal}
      className="h-9 max-w-28 truncate rounded-full bg-zinc-950 px-3 text-xs font-semibold text-white transition hover:bg-zinc-800 sm:max-w-40 sm:px-4"
    >
      {shortenAddress(address)}
    </button>
  );
}

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
