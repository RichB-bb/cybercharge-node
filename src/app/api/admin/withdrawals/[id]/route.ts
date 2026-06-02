import {
  getAdminSupabaseClient,
  handleAdminError,
  requireAdmin,
} from "@/lib/admin/server";
import type { RewardRecord, WithdrawalRequestRecord } from "@/lib/supabase";

const allowedStatuses = new Set(["approved", "rejected", "paid"]);

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/admin/withdrawals/[id]">,
) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await context.params;
    const payload = (await request.json()) as {
      admin_note?: string;
      payout_tx_hash?: string;
      status?: string;
    };

    if (!payload.status || !allowedStatuses.has(payload.status)) {
      return Response.json({ error: "不支持的提现状态。" }, { status: 400 });
    }

    if (payload.status === "paid" && !payload.payout_tx_hash?.trim()) {
      return Response.json({ error: "标记已支付前必须填写 payout tx hash。" }, { status: 400 });
    }

    const client = getAdminSupabaseClient();
    const { data: withdrawal, error: withdrawalError } = await client
      .from("withdrawal_requests")
      .select("*")
      .eq("id", id)
      .single();

    if (withdrawalError) throw withdrawalError;

    const requestRow = withdrawal as WithdrawalRequestRecord;
    const now = new Date().toISOString();

    if (payload.status === "paid") {
      await markApprovedRewardsAsPaid({
        amount: Number(requestRow.amount),
        asset: requestRow.asset,
        client,
        paidAt: now,
        userId: requestRow.user_id,
        withdrawalId: requestRow.id,
      });
    }

    const { data, error } = await client
      .from("withdrawal_requests")
      .update({
        admin_note: payload.admin_note ?? requestRow.admin_note ?? null,
        payout_tx_hash: payload.status === "paid" ? payload.payout_tx_hash?.trim() : requestRow.payout_tx_hash,
        reviewed_at:
          payload.status === "approved" || payload.status === "rejected"
            ? now
            : requestRow.reviewed_at,
        paid_at: payload.status === "paid" ? now : requestRow.paid_at,
        status: payload.status,
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;

    return Response.json({ withdrawal: data });
  } catch (error) {
    return handleAdminError(error);
  }
}

async function markApprovedRewardsAsPaid({
  amount,
  asset,
  client,
  paidAt,
  userId,
  withdrawalId,
}: {
  amount: number;
  asset: string;
  client: ReturnType<typeof getAdminSupabaseClient>;
  paidAt: string;
  userId: string;
  withdrawalId: string;
}) {
  const { data, error } = await client
    .from("rewards")
    .select("*")
    .eq("user_id", userId)
    .eq("asset", asset)
    .eq("status", "approved")
    .order("created_at", { ascending: true });

  if (error) throw error;

  const rewards = (data ?? []) as RewardRecord[];
  const available = rewards.reduce((sum, reward) => sum + Number(reward.amount), 0);

  if (available + 0.000001 < amount) {
    throw new Error("可提现奖励余额不足，无法标记提现为已支付。");
  }

  let remaining = amount;

  for (const reward of rewards) {
    if (remaining <= 0) break;

    const rewardAmount = Number(reward.amount);

    if (rewardAmount <= remaining + 0.000001) {
      const { error: updateError } = await client
        .from("rewards")
        .update({
          note: appendSettlementNote(reward.note, withdrawalId),
          paid_at: paidAt,
          status: "paid",
        })
        .eq("id", reward.id);

      if (updateError) throw updateError;
      remaining -= rewardAmount;
      continue;
    }

    const paidAmount = remaining;
    const leftoverAmount = rewardAmount - paidAmount;

    const { error: partialUpdateError } = await client
      .from("rewards")
      .update({
        amount: paidAmount,
        note: appendSettlementNote(reward.note, withdrawalId),
        paid_at: paidAt,
        status: "paid",
      })
      .eq("id", reward.id);

    if (partialUpdateError) throw partialUpdateError;

    const { error: leftoverError } = await client.from("rewards").insert([
      {
        user_id: reward.user_id,
        wallet_address: reward.wallet_address,
        reward_type: reward.reward_type,
        amount: leftoverAmount,
        asset: reward.asset,
        status: "approved",
        note: appendLeftoverNote(reward.note, withdrawalId),
      },
    ]);

    if (leftoverError) throw leftoverError;
    remaining = 0;
  }
}

function appendSettlementNote(note: string | null, withdrawalId: string) {
  return [note, `Settled by withdrawal ${withdrawalId}`].filter(Boolean).join(" | ");
}

function appendLeftoverNote(note: string | null, withdrawalId: string) {
  return [note, `Remaining balance after withdrawal ${withdrawalId}`].filter(Boolean).join(" | ");
}
