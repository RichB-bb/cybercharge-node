import {
  getAdminSupabaseClient,
  handleAdminError,
} from "@/lib/admin/server";
import type {
  AllocationRecord,
  RewardRecord,
  TransactionRecord,
  WithdrawalRequestRecord,
} from "@/lib/supabase";

type AssetTotal = {
  amount: number;
  asset: string;
};

export async function GET(request: Request) {
  try {
    const walletAddress = new URL(request.url).searchParams.get("wallet")?.trim().toLowerCase();

    if (!walletAddress || !walletAddress.startsWith("0x")) {
      return Response.json({ error: "Invalid wallet address." }, { status: 400 });
    }

    const client = getAdminSupabaseClient();
    const { data: user, error: userError } = await client
      .from("users")
      .select("id,wallet_address")
      .eq("wallet_address", walletAddress)
      .maybeSingle();

    if (userError) throw userError;

    if (!user) {
      return Response.json({
        allocation: emptyAllocationSummary(),
        rewards: emptyRewardSummary(),
        rewardActivity: [],
        rewardHistory: [],
        transactions: [],
        withdrawals: [],
      });
    }

    const [allocationsResult, transactionsResult, rewardsResult, withdrawalsResult] =
      await Promise.all([
        client
          .from("allocations")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        client
          .from("transactions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        client
          .from("rewards")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        client
          .from("withdrawal_requests")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

    if (allocationsResult.error) throw allocationsResult.error;
    if (transactionsResult.error) throw transactionsResult.error;
    if (rewardsResult.error) throw rewardsResult.error;
    if (withdrawalsResult.error) throw withdrawalsResult.error;

    const allocations = (allocationsResult.data ?? []) as AllocationRecord[];
    const transactions = (transactionsResult.data ?? []) as TransactionRecord[];
    const rewards = (rewardsResult.data ?? []) as RewardRecord[];
    const withdrawals = (withdrawalsResult.data ?? []) as WithdrawalRequestRecord[];

    return Response.json({
      allocation: buildAllocationSummary(allocations, transactions),
      rewards: buildRewardSummary(rewards),
      rewardActivity: buildRewardActivity(rewards),
      rewardHistory: rewards,
      transactions,
      withdrawals,
    });
  } catch (error) {
    return handleAdminError(error);
  }
}

function buildAllocationSummary(
  allocations: AllocationRecord[],
  transactions: TransactionRecord[],
) {
  const activeAllocations = allocations.filter((item) => item.status === "active");
  const confirmedTransactions = transactions.filter((item) => item.status === "confirmed");
  const lastPurchase =
    activeAllocations[0]?.created_at ?? confirmedTransactions[0]?.confirmation_time ?? null;

  return {
    activeAllocations: activeAllocations.length,
    allocationStatus: activeAllocations.length > 0 ? "active" : "none",
    lastPurchase,
    totalAllocation: activeAllocations.reduce(
      (sum, item) => sum + Number(item.allocation_percent),
      0,
    ),
    totalPaid: groupTotals(
      confirmedTransactions.map((item) => ({
        amount: Number(item.amount),
        asset: item.asset || "USDT",
      })),
    ),
  };
}

function buildRewardSummary(rewards: RewardRecord[]) {
  return {
    confirmedRewards: groupTotals(
      rewards
        .filter((item) => item.status === "approved" || item.status === "paid")
        .map((item) => ({ amount: Number(item.amount), asset: item.asset || "USDT" })),
    ),
    withdrawableBalance: groupTotals(
      rewards
        .filter((item) => item.status === "approved")
        .map((item) => ({ amount: Number(item.amount), asset: item.asset || "USDT" })),
    ),
    withdrawn: groupTotals(
      rewards
        .filter((item) => item.status === "paid")
        .map((item) => ({ amount: Number(item.amount), asset: item.asset || "USDT" })),
    ),
  };
}

function buildRewardActivity(rewards: RewardRecord[]) {
  const totals = new Map<string, number>();

  for (const reward of rewards) {
    if (reward.status !== "approved" && reward.status !== "paid") continue;
    const date = reward.created_at?.slice(0, 10);
    if (!date) continue;
    totals.set(date, (totals.get(date) ?? 0) + Number(reward.amount));
  }

  return Array.from(totals.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({ amount, date }));
}

function groupTotals(items: AssetTotal[]) {
  const totals = new Map<string, number>();

  for (const item of items) {
    totals.set(item.asset, (totals.get(item.asset) ?? 0) + item.amount);
  }

  return Array.from(totals.entries()).map(([asset, amount]) => ({ asset, amount }));
}

function emptyAllocationSummary() {
  return {
    activeAllocations: 0,
    allocationStatus: "none",
    lastPurchase: null,
    totalAllocation: 0,
    totalPaid: [],
  };
}

function emptyRewardSummary() {
  return {
    confirmedRewards: [],
    withdrawableBalance: [],
    withdrawn: [],
  };
}
