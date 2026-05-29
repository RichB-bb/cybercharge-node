import {
  getTokenConfig,
  shortenAddress,
  type ChainLabel,
  type TokenSymbol,
} from "@/lib/tokenConfig";

const treasuryWallet =
  process.env.NEXT_PUBLIC_TREASURY_WALLET ??
  "0x3a6cF210C5704790463ccE4eCC3EAD0E8Ce571C5";

const qaCombinations: Array<{ network: ChainLabel; asset: TokenSymbol }> = [
  { network: "Ethereum", asset: "ETH" },
  { network: "Ethereum", asset: "USDT" },
  { network: "Ethereum", asset: "USDC" },
  { network: "Base", asset: "ETH" },
  { network: "Base", asset: "USDC" },
  { network: "Polygon", asset: "USDT" },
  { network: "Polygon", asset: "USDC" },
  { network: "BSC", asset: "USDT" },
];

const explorerLabels: Record<ChainLabel, string> = {
  Ethereum: "Etherscan",
  Base: "Basescan",
  Polygon: "Polygonscan",
  BSC: "BscScan",
};

export default function PaymentTestPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-10 text-zinc-950 sm:px-8 sm:py-16">
      <section className="mx-auto max-w-7xl">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-red-600">
          Payment QA
        </p>
        <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
              Payment QA Checklist
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-500 sm:text-xl sm:leading-8">
              Read-only verification matrix for enabled native and ERC20 payment routes.
            </p>
          </div>
          <div className="border border-zinc-200 p-4">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
              Treasury Wallet
            </p>
            <p className="mt-2 break-all font-mono text-sm font-semibold text-zinc-950">
              {treasuryWallet}
            </p>
          </div>
        </div>

        <div className="mt-10 border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          Use small test amounts before production payments.
        </div>

        <div className="mt-12 overflow-x-auto border border-zinc-200">
          <table className="min-w-[920px] w-full border-collapse text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-[0.16em] text-zinc-500">
              <tr>
                <th className="border-b border-zinc-200 px-5 py-4 font-medium">Network</th>
                <th className="border-b border-zinc-200 px-5 py-4 font-medium">Asset</th>
                <th className="border-b border-zinc-200 px-5 py-4 font-medium">Payment Type</th>
                <th className="border-b border-zinc-200 px-5 py-4 font-medium">Token Contract</th>
                <th className="border-b border-zinc-200 px-5 py-4 font-medium">Decimals</th>
                <th className="border-b border-zinc-200 px-5 py-4 font-medium">Explorer</th>
                <th className="border-b border-zinc-200 px-5 py-4 font-medium">Supported</th>
                <th className="border-b border-zinc-200 px-5 py-4 font-medium">QA Status</th>
              </tr>
            </thead>
            <tbody>
              {qaCombinations.map(({ network, asset }) => {
                const config = getTokenConfig(network, asset);
                const hasConfigWarning =
                  config.supported &&
                  (config.decimals === undefined ||
                    (config.paymentType === "erc20" && !config.contractAddress));

                return (
                  <tr key={`${network}-${asset}`} className="border-b border-zinc-100">
                    <td className="px-5 py-5 font-medium text-zinc-950">{network}</td>
                    <td className="px-5 py-5 text-zinc-700">{asset}</td>
                    <td className="px-5 py-5 text-zinc-700">{config.paymentType}</td>
                    <td className="px-5 py-5 font-mono text-xs text-zinc-600">
                      {config.contractAddress
                        ? `${shortenAddress(config.contractAddress)}`
                        : asset === "ETH"
                          ? "Native asset"
                          : "Not configured"}
                    </td>
                    <td className="px-5 py-5 text-zinc-700">{config.decimals}</td>
                    <td className="px-5 py-5 text-zinc-700">{explorerLabels[network]}</td>
                    <td className="px-5 py-5">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold ${
                          config.supported
                            ? "bg-zinc-950 text-white"
                            : "bg-zinc-100 text-zinc-500"
                        }`}
                      >
                        {config.supported ? "yes" : "no"}
                      </span>
                    </td>
                    <td className="px-5 py-5">
                      {hasConfigWarning ? (
                        <span className="text-sm font-semibold text-red-600">
                          Missing contract or decimals
                        </span>
                      ) : (
                        <span className="text-sm text-zinc-500">
                          {config.supported ? "Ready for small-amount QA" : "Unsupported"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
