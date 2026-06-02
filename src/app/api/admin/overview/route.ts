import {
  getAdminSupabaseClient,
  handleAdminError,
  requireAdmin,
  type AdminRewardRecord,
} from "@/lib/admin/server";
import type { AllocationRecord, TransactionRecord, UserRecord } from "@/lib/supabase";

export async function GET(request: Request) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const client = getAdminSupabaseClient();
    const [usersResult, transactionsResult, allocationsResult, rewardsResult, withdrawalsResult] =
      await Promise.all([
        client.from("users").select("*"),
        client.from("transactions").select("*"),
        client.from("allocations").select("*"),
        client.from("rewards").select("*"),
        client.from("withdrawal_requests").select("*"),
      ]);

    if (usersResult.error) throw usersResult.error;
    if (transactionsResult.error) throw transactionsResult.error;
    if (allocationsResult.error) throw allocationsResult.error;
    if (rewardsResult.error) throw rewardsResult.error;
    if (withdrawalsResult.error) throw withdrawalsResult.error;

    const users = (usersResult.data ?? []) as UserRecord[];
    const transactions = (transactionsResult.data ?? []) as TransactionRecord[];
    const allocations = (allocationsResult.data ?? []) as AllocationRecord[];
    const rewards = (rewardsResult.data ?? []) as AdminRewardRecord[];

    return Response.json({
      totalCustomers: users.length,
      totalRechargeVolume: transactions.reduce((sum, item) => sum + Number(item.amount), 0),
      totalAllocations: allocations.length,
      totalRewards: rewards.reduce((sum, item) => sum + Number(item.amount), 0),
      pendingRewards: rewards.filter((item) => item.status === "pending").length,
      paidRewards: rewards.filter((item) => item.status === "paid").length,
      pendingWithdrawals: (withdrawalsResult.data ?? []).filter((item) => item.status === "pending").length,
    });
  } catch (error) {
    return handleAdminError(error);
  }
}
