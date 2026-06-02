"use client";

import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import type { Locale } from "@rainbow-me/rainbowkit";
import {
  binanceWallet,
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
  okxWallet,
  trustWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createStorage, http } from "wagmi";
import { base, bsc, mainnet, polygon } from "wagmi/chains";
import { WagmiProvider } from "wagmi";
import { useState } from "react";
import { WalletUserSync } from "@/components/WalletUserSync";
import { LanguageProvider, type Language, useLanguage } from "@/lib/i18n";

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim();

if (!walletConnectProjectId && process.env.NODE_ENV === "development") {
  console.warn(
    "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is missing. WalletConnect is disabled until a project ID is configured.",
  );
}

const walletStorage = createStorage({
  key: "cybercharge-wallet",
  storage: {
    getItem(key) {
      if (typeof window === "undefined") return null;
      return window.localStorage.getItem(key);
    },
    removeItem(key) {
      if (typeof window === "undefined") return;
      window.localStorage.removeItem(key);
    },
    setItem(key, value) {
      if (typeof window === "undefined") return;
      window.localStorage.setItem(key, value);
    },
  },
});

const config = getDefaultConfig({
  appName: "CyberCharge Node",
  projectId: walletConnectProjectId ?? "",
  wallets: [
    {
      groupName: "Supported Wallets",
      wallets: walletConnectProjectId
        ? [
            binanceWallet,
            metaMaskWallet,
            coinbaseWallet,
            trustWallet,
            okxWallet,
            walletConnectWallet,
            injectedWallet,
          ]
        : [
            injectedWallet,
            coinbaseWallet,
          ],
    },
  ],
  chains: [mainnet, base, polygon, bsc],
  transports: {
    [mainnet.id]: http("https://rpc.ankr.com/eth"),
    [base.id]: http("https://mainnet.base.org"),
    [polygon.id]: http("https://polygon-bor-rpc.publicnode.com"),
    [bsc.id]: http("https://bsc-dataseed.binance.org"),
  },
  storage: walletStorage,
  ssr: true,
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <Web3Providers>{children}</Web3Providers>
    </LanguageProvider>
  );
}

function Web3Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const { language } = useLanguage();
  const rainbowKitLocale = getRainbowKitLocale(language);

  return (
    <WagmiProvider config={config} reconnectOnMount>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider locale={rainbowKitLocale}>
          <WalletUserSync />
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

function getRainbowKitLocale(language: Language): Locale {
  const locales: Record<Language, Locale> = {
    ar: "ar-AR",
    en: "en-US",
    es: "es-419",
    fr: "fr-FR",
    ja: "ja-JP",
    ko: "ko-KR",
    zh: "zh-CN",
  };

  return locales[language];
}
