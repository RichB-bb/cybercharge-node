"use client";

import {
  useAccountModal,
  useChainModal,
  useConnectModal,
} from "@rainbow-me/rainbowkit";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { parseEther, parseUnits } from "viem";
import {
  useAccount,
  useChainId,
  usePublicClient,
  useSendTransaction,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import { getSupabaseEnvError } from "@/lib/env";
import { useLanguage } from "@/lib/i18n";
import {
  createSupabaseWalletClient,
  ensureUserByWallet,
  isSupabaseConfigured,
} from "@/lib/supabase";
import {
  getTokenConfig,
  getUnsupportedPaymentMessage,
  shortenAddress,
  type ChainLabel,
  type TokenSymbol,
} from "@/lib/tokenConfig";

type ChainOption = {
  id: string;
  label: ChainLabel;
};

type AllocationOption = 10 | 25 | 50 | 100;
type TokenOption = TokenSymbol;

const chains: ChainOption[] = [
  { id: "ethereum", label: "Ethereum" },
  { id: "base", label: "Base" },
  { id: "polygon", label: "Polygon" },
  { id: "bsc", label: "BSC" },
];

const allocations: AllocationOption[] = [10, 25, 50, 100];
const tokens: TokenOption[] = ["ETH", "USDT", "USDC"];
const fullChargingNodeUsdt = 1999;
const fallbackEthPrice = 4200;
const treasuryWallet = (process.env.NEXT_PUBLIC_TREASURY_WALLET ??
  "0x3a6cF210C5704790463ccE4eCC3EAD0E8Ce571C5") as `0x${string}`;

const chainIds: Record<ChainLabel, number> = {
  Ethereum: 1,
  Base: 8453,
  Polygon: 137,
  BSC: 56,
};

const explorerBaseUrls: Record<ChainLabel, string> = {
  Ethereum: "https://etherscan.io/tx/",
  Base: "https://basescan.org/tx/",
  Polygon: "https://polygonscan.com/tx/",
  BSC: "https://bscscan.com/tx/",
};

const supportedChainIds = new Set(Object.values(chainIds));

const erc20TransferAbi = [
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

const paymentSuccessCopy: Record<string, { title: string; message: string; close: string }> = {
  en: {
    title: "Payment Completed",
    message: "Thank you for supporting clean energy.",
    close: "Done",
  },
  zh: {
    title: "付款完成",
    message: "感谢您支持新能源",
    close: "完成",
  },
  ja: {
    title: "お支払いが完了しました",
    message: "クリーンエネルギーへのご支援ありがとうございます。",
    close: "完了",
  },
  ko: {
    title: "결제가 완료되었습니다",
    message: "신재생 에너지를 지원해 주셔서 감사합니다.",
    close: "완료",
  },
  es: {
    title: "Pago completado",
    message: "Gracias por apoyar la energía limpia.",
    close: "Listo",
  },
  fr: {
    title: "Paiement terminé",
    message: "Merci de soutenir les nouvelles énergies.",
    close: "Terminé",
  },
  ar: {
    title: "اكتمل الدفع",
    message: "شكرا لدعمكم الطاقة النظيفة.",
    close: "تم",
  },
};

export function PaymentSection() {
  const { language, t } = useLanguage();
  const { address, isConnected } = useAccount();
  const [selectedChain, setSelectedChain] = useState<ChainLabel>("Ethereum");
  const [selectedToken, setSelectedToken] = useState<TokenOption>("ETH");
  const [selectedAllocation, setSelectedAllocation] =
    useState<AllocationOption>(25);
  const connectedChainId = useChainId();
  const targetChainId = chainIds[selectedChain];
  const publicClient = usePublicClient({ chainId: chainIds[selectedChain] });
  const { sendTransactionAsync } = useSendTransaction();
  const { writeContractAsync } = useWriteContract();
  const { switchChainAsync } = useSwitchChain();
  const [ethPrice, setEthPrice] = useState<number | null>(null);
  const [purchaseStatus, setPurchaseStatus] = useState<
    "idle" | "processing" | "pending" | "success" | "error"
  >("idle");
  const [purchaseMessage, setPurchaseMessage] = useState("");
  const [latestTxHash, setLatestTxHash] = useState<`0x${string}` | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isManualPaymentOpen, setIsManualPaymentOpen] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadEthPrice() {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd",
          { signal: controller.signal },
        );
        const data = (await response.json()) as {
          ethereum?: { usd?: number };
        };

        if (data.ethereum?.usd) {
          setEthPrice(data.ethereum.usd);
        }
      } catch {
        setEthPrice(null);
      }
    }

    void loadEthPrice();

    return () => controller.abort();
  }, []);

  const usdtAmount = calculateAllocationUsdtAmount(selectedAllocation);
  const effectiveEthPrice = ethPrice ?? fallbackEthPrice;
  const ethAmount = usdtAmount / effectiveEthPrice;
  const selectedTokenConfig = getTokenConfig(selectedChain, selectedToken);
  const isPaymentSupported = selectedTokenConfig.supported;
  const paymentMethod =
    selectedTokenConfig.paymentType === "erc20" ? "ERC20 Transfer" : "Native Transfer";
  const paymentAmount =
    selectedToken === "ETH"
      ? formatEthAmount(ethAmount, language)
      : formatStableAmount(usdtAmount, language);
  const allocationLabel = `${selectedAllocation}% ${t.payment.allocation}`;
  const ethTransferAmount = formatEthAmount(ethAmount, "en");
  const ethTransferValue = parseEther(ethTransferAmount);
  const tokenTransferAmount = toTokenAmountString(usdtAmount, selectedTokenConfig.decimals);
  const transferDisplayAmount = selectedToken === "ETH" ? ethTransferAmount : tokenTransferAmount;
  const transferValue =
    selectedTokenConfig.paymentType === "native"
      ? ethTransferValue
      : parseUnits(tokenTransferAmount, selectedTokenConfig.decimals);
  const explorerLink = latestTxHash ? `${explorerBaseUrls[selectedChain]}${latestTxHash}` : null;
  const isProcessing = purchaseStatus === "processing" || purchaseStatus === "pending";
  const unsupportedPaymentMessage = getUnsupportedPaymentMessage(selectedChain, selectedToken);

  function handlePurchaseClick() {
    setPurchaseMessage("");

    if (!isPaymentSupported) {
      setPurchaseStatus("error");
      setPurchaseMessage(unsupportedPaymentMessage);
      return;
    }

    if (!isConnected || !address) {
      setPurchaseStatus("error");
      setPurchaseMessage("Please connect your wallet before recording an allocation.");
      return;
    }

    setIsConfirmOpen(true);
  }

  async function copyToClipboard(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopyMessage(`${label} copied.`);
    } catch {
      setCopyMessage(`Unable to copy ${label.toLowerCase()}.`);
    }
  }

  async function handlePurchaseAllocation() {
    setPurchaseStatus("processing");
    setPurchaseMessage("");
    setIsConfirmOpen(false);

    if (!isConnected || !address) {
      setPurchaseStatus("error");
      setPurchaseMessage("Please connect your wallet before recording an allocation.");
      return;
    }

    if (!isSupabaseConfigured) {
      setPurchaseStatus("error");
      setPurchaseMessage(getSupabaseEnvError());
      return;
    }

    try {
      const client = createSupabaseWalletClient(address);

      if (!client) {
        throw new Error(getSupabaseEnvError());
      }

      if (!isPaymentSupported) {
        throw new Error(unsupportedPaymentMessage);
      }

      if (!targetChainId) {
        throw new Error("Unsupported network selected.");
      }

      if (connectedChainId !== targetChainId) {
        try {
          await switchChainAsync({ chainId: targetChainId });
        } catch {
          throw new Error(`Wrong network. Please switch to ${selectedChain}.`);
        }
      }

      if (!publicClient) {
        throw new Error("Network client is not ready. Please try again.");
      }

      setPurchaseMessage("Requesting wallet signature...");

      let hash: `0x${string}`;

      if (selectedTokenConfig.paymentType === "native") {
        hash = await sendTransactionAsync({
          to: treasuryWallet,
          value: transferValue,
          chainId: targetChainId,
        });
      } else {
        if (!selectedTokenConfig.contractAddress) {
          throw new Error("Token payment is not supported on this network yet.");
        }

        hash = await writeContractAsync({
          address: selectedTokenConfig.contractAddress,
          abi: erc20TransferAbi,
          functionName: "transfer",
          args: [treasuryWallet, transferValue],
          chainId: targetChainId,
        });
      }

      setLatestTxHash(hash);

      const user = await ensureUserByWallet(address, language);

      const { data: transaction, error: transactionError } = await client
        .from("transactions")
        .insert([
          {
            user_id: user.id,
            tx_hash: hash,
            amount: Number(transferDisplayAmount),
            asset: selectedToken,
            network: selectedChain,
            status: "pending",
            token_contract: selectedTokenConfig.contractAddress ?? null,
            payment_type: selectedTokenConfig.paymentType,
          },
        ])
        .select("*")
        .single();

      if (transactionError) {
        throw transactionError;
      }

      setPurchaseStatus("pending");
      setPurchaseMessage("Waiting for network confirmation...");

      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
        timeout: 120_000,
      });

      if (receipt.status !== "success") {
        await client.from("transactions").update({ status: "failed" }).eq("id", transaction.id);
        throw new Error("Transaction failed on network.");
      }

      const confirmationTime = new Date().toISOString();
      const { error: confirmationError } = await client
        .from("transactions")
        .update({
          status: "confirmed",
          confirmation_time: confirmationTime,
        })
        .eq("id", transaction.id);

      if (confirmationError) {
        throw confirmationError;
      }

      const { error: allocationError } = await client.from("allocations").insert([
        {
          user_id: user.id,
          allocation_percent: selectedAllocation,
          purchase_value: Number(transferDisplayAmount),
          asset: selectedToken,
          network: selectedChain,
          status: "active",
        },
      ]);

      if (allocationError) {
        throw allocationError;
      }

      setPurchaseStatus("success");
      setPurchaseMessage("Allocation Successfully Recorded");
      setIsSuccessOpen(true);
    } catch (error) {
      setPurchaseStatus("error");
      const message = error instanceof Error ? error.message : "Unable to complete transaction.";
      setPurchaseMessage(normalizeTransactionError(message));
    }
  }

  return (
    <section id="payment" className="bg-white px-4 py-12 sm:px-8 sm:py-20">
      <div className="mx-auto grid max-w-7xl min-w-0 gap-8 lg:grid-cols-[0.82fr_1fr] lg:items-start lg:gap-12">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-red-600 sm:text-sm sm:tracking-[0.28em]">
            {t.payment.eyebrow}
          </p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-950 sm:mt-4 sm:text-6xl">
            {t.payment.title}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-500 sm:text-xl sm:leading-8">
            {t.payment.subtitle}
          </p>

          <div className="mt-8 sm:mt-10">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-zinc-500 sm:text-sm">
              {t.payment.allocationSelector}
            </p>
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {allocations.map((allocation) => (
                <button
                  key={allocation}
                  type="button"
                  onClick={() => setSelectedAllocation(allocation)}
                  className={`h-14 border text-base font-semibold transition sm:text-lg ${
                    selectedAllocation === allocation
                      ? "border-zinc-950 bg-zinc-950 text-white"
                      : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400"
                  }`}
                >
                  {allocation}%
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 border-y border-zinc-200 py-6">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500 sm:text-sm">
              {t.payment.summary}
            </p>
            <h3 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
              {allocationLabel}
            </h3>
            <div className="mt-4 grid gap-2 text-base text-zinc-700 sm:grid-cols-2 sm:text-lg">
              <p>≈ {formatStableAmount(usdtAmount, language)} USDT</p>
              <p>≈ {formatEthAmount(ethAmount, language)} ETH</p>
            </div>
            <p className="mt-3 text-xs leading-5 text-zinc-500 sm:text-sm">
              {ethPrice
                ? `${t.payment.ethEstimateLive} ${formatStableAmount(ethPrice, language)} USDT/ETH.`
                : t.payment.ethEstimate}
            </p>
          </div>
        </div>

        <div className="min-w-0 border border-zinc-200 bg-zinc-50 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-3 border-b border-zinc-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                {t.payment.panel}
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">
                {allocationLabel}
              </h3>
            </div>
            <div className="sm:text-right">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
                {t.payment.paymentAmount}
              </p>
              <p className="mt-1 text-2xl font-semibold text-zinc-950">
                {paymentAmount} {selectedToken}
              </p>
            </div>
          </div>

          <div className="mt-6 min-w-0 overflow-hidden">
            <p className="mb-3 text-sm font-medium text-zinc-700">{t.payment.wallet}</p>
            <PaymentConnectButton />
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-medium text-zinc-700">{t.payment.network}</p>
              <div className="grid grid-cols-2 gap-2">
                {chains.map((chain) => (
                  <button
                    key={chain.id}
                    type="button"
                    onClick={() => setSelectedChain(chain.label)}
                    className={`h-12 border px-3 text-sm font-medium transition ${
                      selectedChain === chain.label
                        ? "border-zinc-950 bg-white text-zinc-950"
                        : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-400"
                    }`}
                  >
                    {chain.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-medium text-zinc-700">{t.payment.asset}</p>
              <div className="grid grid-cols-3 gap-2">
                {tokens.map((token) => (
                  <button
                    key={token}
                    type="button"
                    onClick={() => setSelectedToken(token)}
                    className={`h-12 border px-3 text-sm font-medium transition ${
                      selectedToken === token
                        ? "border-zinc-950 bg-zinc-950 text-white"
                        : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-400"
                    }`}
                  >
                    {token}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 text-sm">
            <PaymentDetail label={t.payment.paymentMethod} value={paymentMethod} />
            {selectedTokenConfig.paymentType === "erc20" && selectedTokenConfig.contractAddress && (
              <PaymentDetail
                label={t.payment.tokenContract}
                value={shortenAddress(selectedTokenConfig.contractAddress)}
              />
            )}
          </div>

          <div className="mt-6 border border-zinc-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
              Legal & Risk Notice
            </p>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              By purchasing an allocation, you acknowledge the{" "}
              <a href="/terms" className="font-medium text-zinc-950 underline underline-offset-4">
                Terms of Service
              </a>
              ,{" "}
              <a href="/privacy" className="font-medium text-zinc-950 underline underline-offset-4">
                Privacy Policy
              </a>
              , and{" "}
              <a
                href="/risk-disclosure"
                className="font-medium text-zinc-950 underline underline-offset-4"
              >
                Risk Disclosure
              </a>
              .
            </p>
          </div>

          <button
            type="button"
            onClick={handlePurchaseClick}
            disabled={isProcessing || !isPaymentSupported}
            className="mt-7 min-h-12 w-full bg-zinc-950 px-4 text-base font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
          >
            {purchaseStatus === "processing" && t.payment.processingAllocation}
            {purchaseStatus === "pending" && t.payment.waitingConfirmation}
            {purchaseStatus !== "processing" &&
              purchaseStatus !== "pending" &&
              t.payment.purchaseAllocation}
          </button>

          {!isPaymentSupported && (
            <p className="mt-4 text-sm leading-6 text-zinc-500">{unsupportedPaymentMessage}</p>
          )}

          {purchaseMessage && (
            <p
              className={`mt-4 text-sm leading-6 ${
                purchaseStatus === "success" ? "text-emerald-700" : "text-red-600"
              }`}
            >
              {purchaseMessage}
            </p>
          )}
          {explorerLink && (
            <a
              href={explorerLink}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex text-sm font-medium text-zinc-950 underline underline-offset-4"
            >
              View on Explorer
            </a>
          )}

          <div className="mt-7 border-t border-zinc-200 pt-5">
            <button
              type="button"
              onClick={() => setIsManualPaymentOpen((open) => !open)}
              className="flex h-11 w-full items-center justify-between border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-950 transition hover:border-zinc-400"
            >
              <span>Manual Payment (Optional)</span>
              <span className="text-zinc-400">{isManualPaymentOpen ? "-" : "+"}</span>
            </button>

            {isManualPaymentOpen && (
              <div className="mt-4 grid gap-4 sm:grid-cols-[120px_1fr] sm:items-start">
                <div className="grid size-[120px] place-items-center border border-zinc-200 bg-white">
                  <QRCodeSVG value={treasuryWallet} size={92} bgColor="#ffffff" fgColor="#050505" />
                </div>
                <div className="space-y-3 text-sm">
                  <p className="font-medium text-zinc-950">Scan to copy receiving wallet address</p>
                  <PaymentDetail label="You Pay" value={`${transferDisplayAmount} ${selectedToken}`} />
                  <PaymentDetail label="Network" value={selectedChain} />
                  <PaymentDetail label="Asset" value={selectedToken} />
                  <p className="text-xs leading-5 text-zinc-500">
                    For exact amount payment, use the Purchase Allocation button.
                  </p>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(treasuryWallet, "Wallet address")}
                    className="h-10 w-full border border-zinc-200 px-3 text-sm font-semibold text-zinc-950 transition hover:border-zinc-400"
                  >
                    Copy Wallet Address
                  </button>
                  {copyMessage && <p className="text-sm text-zinc-500">{copyMessage}</p>}
                </div>
              </div>
            )}
          </div>

          <p id="risk-disclosure" className="mt-5 text-xs leading-5 text-zinc-500">
            Participation involves risk. Review risk disclosure before proceeding.
          </p>
        </div>
      </div>
      {isConfirmOpen && (
        <PaymentConfirmationDialog
          allocation={`${selectedAllocation}%`}
          amount={`${transferDisplayAmount} ${selectedToken}`}
          asset={selectedToken}
          paymentMethod={paymentMethod}
          tokenContract={selectedTokenConfig.contractAddress}
          network={selectedChain}
          onCancel={() => setIsConfirmOpen(false)}
          onConfirm={handlePurchaseAllocation}
          treasury="0x3a6c...71C5"
        />
      )}
      {isSuccessOpen && (
        <PaymentSuccessDialog
          closeLabel={(paymentSuccessCopy[language] ?? paymentSuccessCopy.en).close}
          message={(paymentSuccessCopy[language] ?? paymentSuccessCopy.en).message}
          onClose={() => setIsSuccessOpen(false)}
          title={(paymentSuccessCopy[language] ?? paymentSuccessCopy.en).title}
        />
      )}
    </section>
  );
}

function normalizeTransactionError(message: string) {
  const lower = message.toLowerCase();

  if (lower.includes("rejected") || lower.includes("denied") || lower.includes("user")) {
    return "Payment cancelled by user.";
  }

  if (
    lower.includes("insufficient") ||
    lower.includes("exceeds balance") ||
    lower.includes("exceed balance")
  ) {
    if (lower.includes("allowance") || lower.includes("erc20") || lower.includes("token")) {
      return "Insufficient token balance for this ERC20 transfer.";
    }

    return "Insufficient balance for this payment.";
  }

  if (lower.includes("timeout") || lower.includes("timed out")) {
    return "Transaction confirmation timed out. Pending transaction remains in Supabase.";
  }

  if (lower.includes("unsupported")) {
    return "Token payment is not supported on this network yet.";
  }

  if (lower.includes("execution reverted") || lower.includes("contract")) {
    return "Contract write failed. Please check token balance and network gas.";
  }

  return message;
}

function calculateAllocationUsdtAmount(allocation: AllocationOption) {
  return (fullChargingNodeUsdt * allocation) / 100;
}

function PaymentConfirmationDialog({
  allocation,
  amount,
  asset,
  network,
  onCancel,
  onConfirm,
  paymentMethod,
  treasury,
  tokenContract,
}: {
  allocation: string;
  amount: string;
  asset: string;
  network: string;
  onCancel: () => void;
  onConfirm: () => void;
  paymentMethod: string;
  treasury: string;
  tokenContract?: string;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/40 px-4 pb-4 pt-20 sm:items-center sm:p-6">
      <div className="w-full max-w-lg bg-white p-5 shadow-2xl sm:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-red-600">
          Final Confirmation
        </p>
        <h3 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">
          Confirm Payment
        </h3>
        <p className="mt-3 text-sm leading-6 text-zinc-500">
          Review the payment details before your wallet transaction is requested.
        </p>

        <div className="mt-8 space-y-4 text-sm">
          <PaymentDetail label="Allocation" value={allocation} />
          <PaymentDetail label="Pay amount" value={amount} />
          <PaymentDetail label="Network" value={network} />
          <PaymentDetail label="Asset" value={asset} />
          <PaymentDetail label="Payment Method" value={paymentMethod} />
          {tokenContract && (
            <PaymentDetail label="Token Contract" value={shortenAddress(tokenContract)} />
          )}
        </div>

        <div className="mt-6 border-t border-zinc-200 pt-5">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
            Receiving Wallet Verified
          </p>
          <p className="mt-2 font-mono text-sm font-medium text-zinc-950">{treasury}</p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-12 border border-zinc-200 px-4 text-sm font-semibold text-zinc-950 transition hover:border-zinc-400"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-12 bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Confirm Payment
          </button>
        </div>
      </div>
    </div>
  );
}

function PaymentSuccessDialog({
  closeLabel,
  message,
  onClose,
  title,
}: {
  closeLabel: string;
  message: string;
  onClose: () => void;
  title: string;
}) {
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/35 px-4 pb-4 pt-20 sm:items-center sm:p-6">
      <div className="w-full max-w-md bg-white p-6 text-center shadow-2xl sm:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-red-600">
          CyberCharge
        </p>
        <h3 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">
          {title}
        </h3>
        <p className="mx-auto mt-4 max-w-xs text-base leading-7 text-zinc-500">{message}</p>
        <a
          href="/dashboard"
          className="mt-7 inline-flex h-11 w-full items-center justify-center border border-zinc-950 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-950 hover:text-white"
        >
          View Investor Dashboard
        </a>
        <button
          type="button"
          onClick={onClose}
          className="mt-3 h-11 w-full bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800"
        >
          {closeLabel}
        </button>
      </div>
    </div>
  );
}

function PaymentConnectButton() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();
  const { openChainModal } = useChainModal();
  const isUnsupportedChain = Boolean(
    isConnected && chainId && !supportedChainIds.has(chainId),
  );

  if (!isConnected || !address) {
    return (
      <button
        type="button"
        onClick={openConnectModal}
        className="h-12 w-full bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800"
      >
        Connect Wallet
      </button>
    );
  }

  if (isUnsupportedChain) {
    return (
      <button
        type="button"
        onClick={openChainModal}
        className="h-12 w-full bg-red-600 px-4 text-sm font-semibold text-white"
      >
        Switch Network
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={openAccountModal}
      className="h-12 w-full truncate bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800"
    >
      {shortenAddress(address)}
    </button>
  );
}

function PaymentDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-4 border-b border-zinc-200 pb-3">
      <span className="min-w-0 text-zinc-500">{label}</span>
      <span className="min-w-0 break-words text-right font-medium text-zinc-950">{value}</span>
    </div>
  );
}

function formatStableAmount(value: number, language: string = "en") {
  return new Intl.NumberFormat(language, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value);
}

function formatEthAmount(value: number, language: string = "en") {
  return new Intl.NumberFormat(language, {
    maximumFractionDigits: 6,
    minimumFractionDigits: 0,
  }).format(value);
}

function toTokenAmountString(value: number, decimals: number) {
  return value
    .toFixed(Math.min(decimals, 6))
    .replace(/\.?0+$/, "");
}
