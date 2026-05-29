"use client";

import {
  useAccountModal,
  useChainModal,
  useConnectModal,
} from "@rainbow-me/rainbowkit";
import { motion } from "framer-motion";
import { useAccount, useChainId } from "wagmi";
import { languages, useLanguage } from "@/lib/i18n";
import { BrandLogo } from "./BrandLogo";

const navItems = [
  { key: "dashboard", href: "/dashboard" },
  { key: "nodes", href: "/#payment" },
  { key: "whyEv", href: "/#why-ev" },
  { key: "highlights", href: "/#features" },
  { key: "revenue", href: "/#revenue" },
  { key: "network", href: "/#deployment-map" },
  { key: "payment", href: "/#payment" },
] as const;

const supportedChainIds = new Set([1, 8453, 137, 56]);

export function Navbar() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed inset-x-0 top-0 z-50 bg-white/75 pt-[env(safe-area-inset-top)] backdrop-blur-xl"
    >
      <nav className="mx-auto grid h-14 max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-4 sm:h-16 sm:px-8 lg:grid-cols-[1fr_auto_1fr]">
        <a href="#top" className="min-w-0">
          <BrandLogo />
        </a>

        <div className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.key}
              href={item.href}
              className="text-sm font-medium text-zinc-700 transition hover:text-zinc-950"
            >
              {t.nav[item.key]}
            </a>
          ))}
        </div>

        <div className="flex min-w-0 items-center gap-1.5 justify-self-end sm:gap-2">
          <select
            aria-label="Language"
            value={language}
            onChange={(event) => setLanguage(event.target.value as typeof language)}
            className="h-9 max-w-24 rounded-full border border-zinc-200 bg-white/85 px-2 text-xs font-medium text-zinc-700 outline-none transition hover:border-zinc-400 sm:max-w-none sm:px-3"
          >
            {languages.map((item) => (
              <option key={item.code} value={item.code}>
                {item.label}
              </option>
            ))}
          </select>
          <CompactConnectButton />
        </div>
      </nav>
    </motion.header>
  );
}

function CompactConnectButton() {
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
        Connect
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
        Network
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
