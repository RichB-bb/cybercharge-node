"use client";

import { useEffect, useMemo, useState } from "react";
import { CircleDollarSign } from "lucide-react";
import { useAccount } from "wagmi";
import { useLanguage } from "@/lib/i18n";
import type { RewardRecord, WithdrawalRequestRecord } from "@/lib/supabase";

type Balance = {
  amount: number;
  asset: string;
};

const assets = ["USDT", "USDC", "ETH"] as const;
const networks = ["Ethereum", "Base", "Polygon", "BSC"] as const;

export function WithdrawableBalance() {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const { language, t } = useLanguage();
  const [balances, setBalances] = useState<Balance[]>([]);
  const [rewards, setRewards] = useState<RewardRecord[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequestRecord[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<(typeof assets)[number]>("USDT");
  const [selectedNetwork, setSelectedNetwork] = useState<(typeof networks)[number]>("Ethereum");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function loadWithdrawalData(walletAddress: string) {
    setIsLoading(true);
    setMessage("");

    try {
      const [rewardsResponse, withdrawalsResponse] = await Promise.all([
        fetch(`/api/dashboard/rewards?wallet=${encodeURIComponent(walletAddress)}`, {
          cache: "no-store",
        }),
        fetch(`/api/dashboard/withdrawals?wallet=${encodeURIComponent(walletAddress)}`, {
          cache: "no-store",
        }),
      ]);

      const rewardsData = (await rewardsResponse.json()) as {
        balances?: Balance[];
        rewards?: RewardRecord[];
        error?: string;
      };
      const withdrawalsData = (await withdrawalsResponse.json()) as {
        withdrawals?: WithdrawalRequestRecord[];
        error?: string;
      };

      if (!rewardsResponse.ok) {
        throw new Error(rewardsData.error ?? t.dashboard.loadRewardsError);
      }

      if (!withdrawalsResponse.ok) {
        throw new Error(withdrawalsData.error ?? t.dashboard.loadWithdrawalsError);
      }

      setBalances(rewardsData.balances ?? []);
      setRewards(rewardsData.rewards ?? []);
      setWithdrawals(withdrawalsData.withdrawals ?? []);
    } catch (error) {
      setBalances([]);
      setRewards([]);
      setWithdrawals([]);
      setMessage(error instanceof Error ? error.message : t.dashboard.loadWithdrawalDataError);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (isConnecting || isReconnecting) {
      return;
    }

    if (!isConnected || !address) {
      setBalances([]);
      setRewards([]);
      setWithdrawals([]);
      return;
    }

    void loadWithdrawalData(address);
  }, [address, isConnected, isConnecting, isReconnecting]);

  const selectedBalance = useMemo(() => {
    const approved = balances.find((item) => item.asset === selectedAsset)?.amount ?? 0;
    const reserved = withdrawals
      .filter(
        (item) =>
          item.asset === selectedAsset &&
          (item.status === "pending" || item.status === "approved"),
      )
      .reduce((sum, item) => sum + Number(item.amount), 0);

    return Math.max(approved - reserved, 0);
  }, [balances, selectedAsset, withdrawals]);

  const approvedRewards = rewards.filter((reward) => reward.status === "approved");
  const displayAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : t.dashboard.notConnectedShort;

  async function submitWithdrawal(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!isConnected || !address) {
      setMessage(t.dashboard.validationConnectWallet);
      return;
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setMessage(t.dashboard.validationAmountPositive);
      return;
    }

    if (numericAmount > selectedBalance) {
      setMessage(t.dashboard.validationAmountExceeded);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/withdrawals/request", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          amount: numericAmount,
          asset: selectedAsset,
          network: selectedNetwork,
          wallet_address: address,
        }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? t.dashboard.submitWithdrawalError);
      }

      setAmount("");
      setMessage(t.dashboard.withdrawalSubmitted);
      await loadWithdrawalData(address);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t.dashboard.submitWithdrawalError);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mt-6 border border-zinc-200 bg-white p-4 sm:p-6 lg:p-8">
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-red-600">
                {t.dashboard.rewards}
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
                {t.dashboard.withdrawableBalance}
              </h2>
            </div>
            <CircleDollarSign size={24} className="shrink-0 text-red-600" />
          </div>

          <p className="mt-4 text-sm leading-6 text-zinc-500">
            {t.dashboard.yourAvailableRewards}
          </p>

          <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
            {assets.map((asset) => {
              const value = balances.find((item) => item.asset === asset)?.amount ?? 0;

              return (
                <button
                  key={asset}
                  type="button"
                  onClick={() => setSelectedAsset(asset)}
                  className={`border p-3 text-left transition sm:p-4 ${
                    selectedAsset === asset
                      ? "border-zinc-950 bg-zinc-950 text-white"
                      : "border-zinc-200 bg-white text-zinc-950 hover:border-zinc-400"
                  }`}
                >
                  <p className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {formatAmount(value, language)}
                  </p>
                  <p className="mt-1 text-sm opacity-70">{asset}</p>
                </button>
              );
            })}
          </div>

          <p className="mt-5 text-sm leading-6 text-zinc-500">
            {t.dashboard.withdrawalDisclaimer}
          </p>
        </div>

        <form onSubmit={submitWithdrawal} className="border-t border-zinc-200 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <h3 className="text-2xl font-semibold tracking-tight text-zinc-950">
            {t.dashboard.requestWithdrawal}
          </h3>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            {t.dashboard.withdrawToConnectedWallet}
          </p>
          <div className="mt-4 border-y border-zinc-200 py-4">
            <p className="text-sm font-medium text-zinc-500">{t.dashboard.withdrawalWallet}</p>
            <p className="mt-2 break-all font-mono text-lg font-semibold text-zinc-950">
              {isConnected ? address : displayAddress}
            </p>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <label className="block sm:col-span-1">
              <span className="text-sm font-medium text-zinc-500">{t.dashboard.amount}</span>
              <input
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                type="number"
                step="0.000001"
                min="0"
                className="mt-2 h-12 w-full border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-950"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-zinc-500">{t.dashboard.asset}</span>
              <select
                value={selectedAsset}
                onChange={(event) => setSelectedAsset(event.target.value as (typeof assets)[number])}
                className="mt-2 h-12 w-full border border-zinc-200 px-3 text-sm"
              >
                {assets.map((asset) => (
                  <option key={asset} value={asset}>
                    {asset}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-zinc-500">{t.dashboard.network}</span>
              <select
                value={selectedNetwork}
                onChange={(event) =>
                  setSelectedNetwork(event.target.value as (typeof networks)[number])
                }
                className="mt-2 h-12 w-full border border-zinc-200 px-3 text-sm"
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
            disabled={!isConnected || isSubmitting || selectedBalance <= 0}
            className="mt-5 h-12 w-full bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
          >
            {isSubmitting ? t.dashboard.submitting : t.dashboard.requestWithdrawal}
          </button>
          {message && <p className="mt-4 text-sm leading-6 text-zinc-500">{message}</p>}
          {isLoading && <p className="mt-4 text-sm text-zinc-500">{t.dashboard.loadingRewards}</p>}
        </form>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <RecordList
          empty={t.dashboard.noApprovedRewards}
          rows={approvedRewards.map((reward) => ({
            id: reward.id,
            left: `${reward.amount} ${reward.asset}`,
            right: translateRewardType(reward.reward_type, language),
            sub: reward.created_at ? formatDate(reward.created_at, language) : "-",
          }))}
          title={t.dashboard.rewardHistory}
        />
        <RecordList
          empty={t.dashboard.noWithdrawalRequests}
          rows={withdrawals.map((withdrawal) => ({
            id: withdrawal.id,
            left: `${withdrawal.amount} ${withdrawal.asset}`,
            right: translateStatus(withdrawal.status, language),
            sub: withdrawal.payout_tx_hash
              ? `${shorten(withdrawal.payout_tx_hash)} · ${withdrawal.network}`
              : `${withdrawal.network} · ${formatDate(withdrawal.created_at, language)}`,
          }))}
          title={t.dashboard.withdrawalHistory}
        />
      </div>
    </section>
  );
}

function RecordList({
  empty,
  rows,
  title,
}: {
  empty: string;
  rows: Array<{ id: string; left: string; right: string; sub: string }>;
  title: string;
}) {
  return (
    <div className="border-t border-zinc-200 pt-5">
      <h3 className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">{title}</h3>
      <div className="mt-4 space-y-3">
        {rows.length === 0 && <p className="text-sm text-zinc-500">{empty}</p>}
        {rows.map((row) => (
          <div key={row.id} className="flex items-start justify-between gap-4 border-b border-zinc-100 pb-3">
            <div>
              <p className="font-semibold text-zinc-950">{row.left}</p>
              <p className="mt-1 text-xs text-zinc-500">{row.sub}</p>
            </div>
            <p className="text-sm text-zinc-500">{row.right}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatAmount(value: number, language = "en") {
  return new Intl.NumberFormat(getIntlLocale(language), {
    maximumFractionDigits: 6,
    minimumFractionDigits: 0,
  }).format(value);
}

function formatDate(value?: string | null, language = "en") {
  if (!value) return "-";
  return new Intl.DateTimeFormat(getIntlLocale(language), {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function shorten(value?: string | null) {
  if (!value) return "-";
  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}

function translateRewardType(type: string, language: string) {
  const labels: Record<string, Record<string, string>> = {
    zh: {
      referral: "推荐奖励",
      revenue_share: "收益分配",
      manual_bonus: "手动奖励",
    },
    en: {
      referral: "Referral",
      revenue_share: "Revenue Share",
      manual_bonus: "Manual Bonus",
    },
  };

  return (labels[language] ?? labels.en)[type] ?? type;
}

function translateStatus(status: string, language: string) {
  const labels: Record<string, Record<string, string>> = {
    zh: {
      approved: "已批准",
      paid: "已发放",
      pending: "待处理",
      rejected: "已拒绝",
    },
    en: {
      approved: "Approved",
      paid: "Paid",
      pending: "Pending",
      rejected: "Rejected",
    },
  };

  return (labels[language] ?? labels.en)[status] ?? status;
}

function getIntlLocale(language: string) {
  const locales: Record<string, string> = {
    ar: "ar",
    en: "en-US",
    es: "es-ES",
    fr: "fr-FR",
    ja: "ja-JP",
    ko: "ko-KR",
    zh: "zh-CN",
  };

  return locales[language] ?? "en-US";
}
