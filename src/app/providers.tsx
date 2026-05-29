"use client";

import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http } from "wagmi";
import { base, bsc, mainnet, polygon } from "wagmi/chains";
import { WagmiProvider } from "wagmi";
import { useState } from "react";
import { WalletUserSync } from "@/components/WalletUserSync";
import { LanguageProvider } from "@/lib/i18n";

const config = getDefaultConfig({
  appName: "CyberCharge Node",
  projectId: "YOUR_WALLETCONNECT_PROJECT_ID",
  chains: [mainnet, base, polygon, bsc],
  transports: {
    [mainnet.id]: http("https://rpc.ankr.com/eth"),
    [base.id]: http("https://mainnet.base.org"),
    [polygon.id]: http("https://polygon-bor-rpc.publicnode.com"),
    [bsc.id]: http("https://bsc-dataseed.binance.org"),
  },
  ssr: true,
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <LanguageProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <WalletUserSync />
            {children}
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </LanguageProvider>
  );
}
