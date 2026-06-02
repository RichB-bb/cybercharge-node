import {
  getAdminSupabaseClient,
  handleAdminError,
} from "@/lib/admin/server";
import type { RewardRecord } from "@/lib/supabase";

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
      return Response.json({ rewards: [], balances: [] });
    }

    const { data, error } = await client
      .from("rewards")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const rewards = (data ?? []) as RewardRecord[];
    const balances = calculateApprovedBalances(rewards);

    return Response.json({ rewards, balances });
  } catch (error) {
    return handleAdminError(error);
  }
}

function calculateApprovedBalances(rewards: RewardRecord[]) {
  const totals = new Map<string, number>();

  for (const reward of rewards) {
    if (reward.status !== "approved") continue;
    const asset = reward.asset || "USDT";
    totals.set(asset, (totals.get(asset) ?? 0) + Number(reward.amount));
  }

  return Array.from(totals.entries()).map(([asset, amount]) => ({ asset, amount }));
}
