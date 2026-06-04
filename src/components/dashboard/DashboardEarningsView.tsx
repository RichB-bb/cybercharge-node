"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, WalletCards } from "lucide-react";
import { useAccount } from "wagmi";
import type {
  RewardRecord,
  TransactionRecord,
  WithdrawalRequestRecord,
} from "@/lib/supabase";

type AssetTotal = {
  amount: number;
  asset: string;
};

type RewardActivity = {
  amount: number;
  date: string;
};

type DashboardSummary = {
  allocation: {
    activeAllocations: number;
    allocationStatus: string;
    lastPurchase: string | null;
    totalAllocation: number;
    totalPaid: AssetTotal[];
  };
  rewards: {
    confirmedRewards: AssetTotal[];
    withdrawableBalance: AssetTotal[];
    withdrawn: AssetTotal[];
  };
  rewardActivity: RewardActivity[];
  rewardHistory: RewardRecord[];
  transactions: TransactionRecord[];
  withdrawals: WithdrawalRequestRecord[];
};

const assets = ["USDT", "USDC", "ETH"] as const;
const networks = ["Ethereum", "Base", "Polygon", "BSC"] as const;

const emptySummary: DashboardSummary = {
  allocation: {
    activeAllocations: 0,
    allocationStatus: "none",
    lastPurchase: null,
    totalAllocation: 0,
    totalPaid: [],
  },
  rewards: {
    confirmedRewards: [],
    withdrawableBalance: [],
    withdrawn: [],
  },
  rewardActivity: [],
  rewardHistory: [],
  transactions: [],
  withdrawals: [],
};

export function DashboardEarningsView() {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const [summary, setSummary] = useState<DashboardSummary>(emptySummary);
  const [amount, setAmount] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<(typeof assets)[number]>("USDT");
  const [selectedNetwork, setSelectedNetwork] = useState<(typeof networks)[number]>("Ethereum");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const isRestoringWallet = isConnecting || isReconnecting;

  async function loadSummary(walletAddress: string) {
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/dashboard/summary?wallet=${encodeURIComponent(walletAddress)}`,
        { cache: "no-store" },
      );
      const data = (await response.json()) as DashboardSummary & { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to load dashboard data.");
      }

      setSummary({
        ...emptySummary,
        ...data,
        allocation: { ...emptySummary.allocation, ...data.allocation },
        rewards: { ...emptySummary.rewards, ...data.rewards },
      });
    } catch (error) {
      setSummary(emptySummary);
      setMessage(error instanceof Error ? error.message : "Unable to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (isRestoringWallet) return;

    if (!isConnected || !address) {
      setSummary(emptySummary);
      return;
    }

    void loadSummary(address);
  }, [address, isConnected, isRestoringWallet]);

  const selectedBalance = useMemo(() => {
    const approved =
      summary.rewards.withdrawableBalance.find((item) => item.asset === selectedAsset)?.amount ?? 0;
    const reserved = summary.withdrawals
      .filter(
        (item) =>
          item.asset === selectedAsset &&
          (item.status === "pending" || item.status === "approved"),
      )
      .reduce((sum, item) => sum + Number(item.amount), 0);

    return Math.max(approved - reserved, 0);
  }, [selectedAsset, summary.rewards.withdrawableBalance, summary.withdrawals]);

  async function submitWithdrawal(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!isConnected || !address) {
      setMessage("Connect wallet before requesting a withdrawal.");
      return;
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setMessage("Withdrawal amount must be greater than 0.");
      return;
    }

    if (numericAmount > selectedBalance) {
      setMessage("Withdrawal amount exceeds your withdrawable balance.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/withdrawals/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          amount: numericAmount,
          asset: selectedAsset,
          network: selectedNetwork,
          wallet_address: address,
        }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to submit withdrawal request.");
      }

      setAmount("");
      setMessage("Withdrawal request submitted for manual review.");
      await loadSummary(address);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to submit withdrawal request.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mt-6 space-y-6">
      <section className="grid gap-4 lg:grid-cols-[0.82fr_1.18fr]">
        <BalancePanel
          balances={summary.rewards.withdrawableBalance}
          isLoading={isLoading || isRestoringWallet}
          selectedAsset={selectedAsset}
          selectedBalance={selectedBalance}
          setSelectedAsset={setSelectedAsset}
        />
        <WithdrawalForm
          address={address}
          amount={amount}
          isConnected={isConnected}
          isSubmitting={isSubmitting}
          message={message}
          onAmountChange={setAmount}
          onSubmit={submitWithdrawal}
          selectedAsset={selectedAsset}
          selectedNetwork={selectedNetwork}
          setSelectedAsset={setSelectedAsset}
          setSelectedNetwork={setSelectedNetwork}
        />
      </section>

      <MyAllocation allocation={summary.allocation} />
      <EarningsOverview rewards={summary.rewards} />
      <EarningsActivityChart activity={summary.rewardActivity} />
      <RewardHistory rewards={summary.rewardHistory} />
      <WithdrawalHistory withdrawals={summary.withdrawals} />
    </div>
  );
}

function BalancePanel({
  balances,
  isLoading,
  selectedAsset,
  selectedBalance,
  setSelectedAsset,
}: {
  balances: AssetTotal[];
  isLoading: boolean;
  selectedAsset: string;
  selectedBalance: number;
  setSelectedAsset: (asset: (typeof assets)[number]) => void;
}) {
  return (
    <article className="border border-zinc-200 bg-white p-5 sm:p-7">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-red-600">
        Withdraw
      </p>
      <h2 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-950">
        {isLoading ? "..." : formatAmount(selectedBalance)}
      </h2>
      <p className="mt-2 text-sm font-medium text-zinc-500">{selectedAsset}</p>
      <p className="mt-5 text-sm leading-6 text-zinc-500">
        Withdrawable Balance from admin-confirmed rewards. Manual withdrawal review applies.
      </p>

      <div className="mt-5 grid grid-cols-3 gap-2">
        {assets.map((asset) => {
          const value = balances.find((item) => item.asset === asset)?.amount ?? 0;

          return (
            <button
              key={asset}
              type="button"
              onClick={() => setSelectedAsset(asset)}
              className={`min-h-14 border p-3 text-left transition ${
                selectedAsset === asset
                  ? "border-zinc-950 bg-zinc-950 text-white"
                  : "border-zinc-200 text-zinc-950 hover:border-zinc-400"
              }`}
            >
              <p className="text-base font-semibold">{formatAmount(value)}</p>
              <p className="text-xs opacity-70">{asset}</p>
            </button>
          );
        })}
      </div>
    </article>
  );
}

function WithdrawalForm({
  address,
  amount,
  isConnected,
  isSubmitting,
  message,
  onAmountChange,
  onSubmit,
  selectedAsset,
  selectedNetwork,
  setSelectedAsset,
  setSelectedNetwork,
}: {
  address?: string;
  amount: string;
  isConnected: boolean;
  isSubmitting: boolean;
  message: string;
  onAmountChange: (amount: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  selectedAsset: (typeof assets)[number];
  selectedNetwork: (typeof networks)[number];
  setSelectedAsset: (asset: (typeof assets)[number]) => void;
  setSelectedNetwork: (network: (typeof networks)[number]) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="border border-zinc-200 bg-zinc-50 p-5 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
            Request Withdrawal
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">
            Withdraw to connected wallet
          </h2>
        </div>
        <WalletCards size={24} className="shrink-0 text-red-600" />
      </div>

      <div className="mt-5 border-y border-zinc-200 py-4">
        <p className="text-sm text-zinc-500">Withdrawal wallet</p>
        <p className="mt-2 break-all font-mono text-sm font-semibold text-zinc-950">
          {isConnected && address ? address : "No wallet connected"}
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm font-medium text-zinc-500">Amount</span>
          <input
            value={amount}
            onChange={(event) => onAmountChange(event.target.value)}
            type="number"
            step="0.000001"
            min="0"
            className="mt-2 h-12 w-full border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-950"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-zinc-500">Asset</span>
          <select
            value={selectedAsset}
            onChange={(event) => setSelectedAsset(event.target.value as (typeof assets)[number])}
            className="mt-2 h-12 w-full border border-zinc-200 bg-white px-3 text-sm"
          >
            {assets.map((asset) => (
              <option key={asset} value={asset}>
                {asset}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-zinc-500">Network</span>
          <select
            value={selectedNetwork}
            onChange={(event) =>
              setSelectedNetwork(event.target.value as (typeof networks)[number])
            }
            className="mt-2 h-12 w-full border border-zinc-200 bg-white px-3 text-sm"
          >
            {networks.map((network) => (
              <option key={network} value={network}>
                {network}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        type="submit"
        disabled={!isConnected || isSubmitting}
        className="mt-5 h-12 w-full bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
      >
        {isSubmitting ? "Submitting..." : "Request Withdrawal"}
      </button>

      {message && <p className="mt-4 text-sm leading-6 text-zinc-500">{message}</p>}
    </form>
  );
}

function MyAllocation({ allocation }: { allocation: DashboardSummary["allocation"] }) {
  const hasAllocation = allocation.activeAllocations > 0;

  return (
    <section className="border border-zinc-200 bg-white p-5 sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-red-600">
            My Allocation
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">
            {hasAllocation ? `${formatAmount(allocation.totalAllocation)}%` : "No active allocation yet."}
          </h2>
        </div>
        {!hasAllocation && (
          <a
            href="/#payment"
            className="inline-flex h-11 items-center justify-center gap-2 bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Purchase Allocation
            <ArrowRight size={16} />
          </a>
        )}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-5">
        <Metric label="Total Allocation" value={`${formatAmount(allocation.totalAllocation)}%`} />
        <Metric label="Total Paid" value={formatTotals(allocation.totalPaid)} />
        <Metric label="Active Allocations" value={String(allocation.activeAllocations)} />
        <Metric label="Last Purchase" value={formatDate(allocation.lastPurchase)} />
        <Metric label="Allocation Status" value={allocation.allocationStatus} />
      </div>
    </section>
  );
}

function EarningsOverview({ rewards }: { rewards: DashboardSummary["rewards"] }) {
  const cards = [
    { label: "Confirmed Rewards", value: formatTotals(rewards.confirmedRewards) },
    { label: "Withdrawable Balance", value: formatTotals(rewards.withdrawableBalance) },
    { label: "Withdrawn", value: formatTotals(rewards.withdrawn) },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-3">
      {cards.map((card) => (
        <article key={card.label} className="border border-zinc-200 bg-white p-5">
          <p className="text-sm text-zinc-500">{card.label}</p>
          <p className="mt-5 text-2xl font-semibold tracking-tight text-zinc-950">
            {card.value}
          </p>
        </article>
      ))}
    </section>
  );
}

function EarningsActivityChart({ activity }: { activity: RewardActivity[] }) {
  const maxAmount = Math.max(...activity.map((item) => item.amount), 0);

  return (
    <section className="border border-zinc-200 bg-white p-5 sm:p-7">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
        Infrastructure Activity
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">
        Earnings Activity
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
        Rewards will appear after admin-confirmed infrastructure activity.
      </p>

      {activity.length === 0 ? (
        <p className="mt-8 text-sm text-zinc-500">
          Rewards will appear after admin-confirmed infrastructure activity.
        </p>
      ) : (
        <div className="mt-8 flex h-44 items-end gap-2 border-b border-zinc-200">
          {activity.slice(-14).map((item) => (
            <div key={item.date} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full bg-zinc-950"
                style={{ height: `${Math.max((item.amount / maxAmount) * 100, 8)}%` }}
                title={`${item.date}: ${formatAmount(item.amount)} USDT`}
              />
              <span className="text-[10px] text-zinc-400">{item.date.slice(5)}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function RewardHistory({ rewards }: { rewards: RewardRecord[] }) {
  return (
    <RecordSection title="Reward History">
      {rewards.length === 0 ? (
        <EmptyRow text="Rewards will appear after admin-confirmed infrastructure activity." />
      ) : (
        rewards.map((reward) => (
          <div key={reward.id} className="grid gap-2 border-b border-zinc-100 py-4 sm:grid-cols-[1fr_1fr_1fr_1fr_1.4fr]">
            <Cell label="Date" value={formatDate(reward.created_at)} />
            <Cell label="Type" value={formatRewardType(reward.reward_type)} />
            <Cell label="Amount" value={`${formatAmount(reward.amount)} ${reward.asset}`} />
            <Cell label="Status" value={formatStatus(reward.status)} />
            <Cell label="Note" value={reward.note ?? "-"} />
          </div>
        ))
      )}
    </RecordSection>
  );
}

function WithdrawalHistory({ withdrawals }: { withdrawals: WithdrawalRequestRecord[] }) {
  return (
    <RecordSection title="Withdrawal History">
      {withdrawals.length === 0 ? (
        <EmptyRow text="No withdrawal requests found." />
      ) : (
        withdrawals.map((withdrawal) => (
          <div key={withdrawal.id} className="grid gap-2 border-b border-zinc-100 py-4 sm:grid-cols-[1fr_1fr_1fr_1fr_1.4fr]">
            <Cell label="Status" value={formatStatus(withdrawal.status)} />
            <Cell label="Amount" value={`${formatAmount(withdrawal.amount)} ${withdrawal.asset}`} />
            <Cell label="Network" value={withdrawal.network} />
            <Cell label="Requested" value={formatDate(withdrawal.requested_at ?? withdrawal.created_at)} />
            <Cell label="Payout Tx" value={shorten(withdrawal.payout_tx_hash)} />
          </div>
        ))
      )}
    </RecordSection>
  );
}

function RecordSection({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="border border-zinc-200 bg-white p-5 sm:p-7">
      <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function EmptyRow({ text }: { text: string }) {
  return <p className="text-sm leading-6 text-zinc-500">{text}</p>;
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-400">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-zinc-950">{value}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-zinc-200 pt-4">
      <p className="text-xl font-semibold tracking-tight text-zinc-950">{value}</p>
      <p className="mt-2 text-xs leading-5 text-zinc-500">{label}</p>
    </div>
  );
}

function formatTotals(totals: AssetTotal[]) {
  if (totals.length === 0) return "0 USDT";
  return totals.map((item) => `${formatAmount(item.amount)} ${item.asset}`).join(" / ");
}

function formatAmount(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 6,
    minimumFractionDigits: 0,
  }).format(value);
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatRewardType(type: string) {
  const labels: Record<string, string> = {
    manual_bonus: "Manual Bonus",
    referral: "Referral",
    revenue_share: "Revenue Share",
  };

  return labels[type] ?? type;
}

function formatStatus(status: string) {
  const labels: Record<string, string> = {
    active: "Active",
    approved: "Approved",
    paid: "Paid",
    pending: "Pending",
    rejected: "Rejected",
  };

  return labels[status] ?? status;
}

function shorten(value?: string | null) {
  if (!value) return "-";
  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}
