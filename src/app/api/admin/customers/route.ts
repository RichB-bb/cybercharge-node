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
    const [usersResult, transactionsResult, allocationsResult, rewardsResult] =
      await Promise.all([
        client.from("users").select("*").order("created_at", { ascending: false }),
        client.from("transactions").select("*"),
        client.from("allocations").select("*"),
        client.from("rewards").select("*"),
      ]);

    if (usersResult.error) throw usersResult.error;
    if (transactionsResult.error) throw transactionsResult.error;
    if (allocationsResult.error) throw allocationsResult.error;
    if (rewardsResult.error) throw rewardsResult.error;

    const transactions = (transactionsResult.data ?? []) as TransactionRecord[];
    const allocations = (allocationsResult.data ?? []) as AllocationRecord[];
    const rewards = (rewardsResult.data ?? []) as AdminRewardRecord[];

    const customers = ((usersResult.data ?? []) as UserRecord[]).map((user) => {
      const userTransactions = transactions.filter((item) => item.user_id === user.id);
      const userAllocations = allocations.filter((item) => item.user_id === user.id);
      const userRewards = rewards.filter((item) => item.user_id === user.id);
      const lastTransaction = userTransactions
        .map((item) => item.created_at)
        .sort()
        .at(-1);

      return {
        ...user,
        last_activity_at: user.last_activity_at ?? lastTransaction ?? user.created_at,
        total_recharge: userTransactions.reduce((sum, item) => sum + Number(item.amount), 0),
        total_allocation: userAllocations.reduce(
          (sum, item) => sum + Number(item.allocation_percent),
          0,
        ),
        total_rewards: userRewards.reduce((sum, item) => sum + Number(item.amount), 0),
      };
    });

    return Response.json({ customers });
  } catch (error) {
    return handleAdminError(error);
  }
}
