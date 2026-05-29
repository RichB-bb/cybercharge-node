export type ChainLabel = "Ethereum" | "Base" | "Polygon" | "BSC";
export type TokenSymbol = "ETH" | "USDT" | "USDC";
export type PaymentType = "native" | "erc20";

export type TokenConfig = {
  chainId: number;
  decimals: number;
  paymentType: PaymentType;
  supported: boolean;
  contractAddress?: `0x${string}`;
  unsupportedReason?: string;
};

export const tokenConfig: Record<ChainLabel, Record<TokenSymbol, TokenConfig>> = {
  Ethereum: {
    ETH: {
      chainId: 1,
      decimals: 18,
      paymentType: "native",
      supported: true,
    },
    USDT: {
      chainId: 1,
      decimals: 6,
      paymentType: "erc20",
      supported: true,
      contractAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    },
    USDC: {
      chainId: 1,
      decimals: 6,
      paymentType: "erc20",
      supported: true,
      contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    },
  },
  Base: {
    ETH: {
      chainId: 8453,
      decimals: 18,
      paymentType: "native",
      supported: true,
    },
    USDT: {
      chainId: 8453,
      decimals: 6,
      paymentType: "erc20",
      supported: false,
      unsupportedReason: "Token payment is not supported on this network yet.",
    },
    USDC: {
      chainId: 8453,
      decimals: 6,
      paymentType: "erc20",
      supported: true,
      contractAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    },
  },
  Polygon: {
    ETH: {
      chainId: 137,
      decimals: 18,
      paymentType: "native",
      supported: false,
      unsupportedReason:
        "Native ETH transfer is only supported on Ethereum and Base. Please select USDT or USDC on this network.",
    },
    USDT: {
      chainId: 137,
      decimals: 6,
      paymentType: "erc20",
      supported: true,
      contractAddress: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    },
    USDC: {
      chainId: 137,
      decimals: 6,
      paymentType: "erc20",
      supported: true,
      contractAddress: "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359",
    },
  },
  BSC: {
    ETH: {
      chainId: 56,
      decimals: 18,
      paymentType: "native",
      supported: false,
      unsupportedReason:
        "Native ETH transfer is only supported on Ethereum and Base. Please select USDT or USDC on this network.",
    },
    USDT: {
      chainId: 56,
      decimals: 18,
      paymentType: "erc20",
      supported: true,
      contractAddress: "0x55d398326f99059fF775485246999027B3197955",
    },
    USDC: {
      chainId: 56,
      decimals: 18,
      paymentType: "erc20",
      supported: false,
      unsupportedReason: "Token payment is not supported on this network yet.",
    },
  },
};

export function getTokenConfig(chain: ChainLabel, token: TokenSymbol) {
  return tokenConfig[chain][token];
}

export function getUnsupportedPaymentMessage(chain: ChainLabel, token: TokenSymbol) {
  return (
    getTokenConfig(chain, token).unsupportedReason ??
    "Token payment is not supported on this network yet."
  );
}

export function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
