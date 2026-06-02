import {
  getAdminSupabaseClient,
  handleAdminError,
} from "@/lib/admin/server";
import type { RewardRecord, WithdrawalRequestRecord } from "@/lib/supabase";

const supportedAssets = new Set(["USDT", "USDC", "ETH"]);
const supportedNetworks = new Set(["Ethereum", "Base", "Polygon", "BSC"]);

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      wallet_address?: string;
      amount?: number;
      asset?: string;
      network?: string;
    };
    const walletAddress = payload.wallet_address?.trim().toLowerCase();
    const amount = Number(payload.amount);
    const asset = payload.asset ?? "USDT";
    const network = payload.network ?? "Ethereum";

    if (!walletAddress || !walletAddress.startsWith("0x")) {
      return Response.json({ error: "Invalid wallet address." }, { status: 400 });
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return Response.json({ error: "Withdrawal amount must be greater than 0." }, { status: 400 });
    }

    if (!supportedAssets.has(asset) || !supportedNetworks.has(network)) {
      return Response.json({ error: "Unsupported withdrawal asset or network." }, { status: 400 });
    }

    const client = getAdminSupabaseClient();
    const { data: user, error: userError } = await client
      .from("users")
      .select("id,wallet_address")
      .eq("wallet_address", walletAddress)
      .maybeSingle();

    if (userError) throw userError;

    if (!user) {
      return Response.json({ error: "Wallet user was not found." }, { status: 404 });
    }

    const [rewardsResult, withdrawalsResult] = await Promise.all([
      client
        .from("rewards")
        .select("*")
        .eq("user_id", user.id)
        .eq("asset", asset)
        .eq("status", "approved"),
      client
        .from("withdrawal_requests")
        .select("*")
        .eq("user_id", user.id)
        .eq("asset", asset)
        .in("status", ["pending", "approved"]),
    ]);

    if (rewardsResult.error) throw rewardsResult.error;
    if (withdrawalsResult.error) throw withdrawalsResult.error;

    const approvedRewards = (rewardsResult.data ?? []) as RewardRecord[];
    const openWithdrawals = (withdrawalsResult.data ?? []) as WithdrawalRequestRecord[];
    const approvedBalance = approvedRewards.reduce((sum, item) => sum + Number(item.amount), 0);
    const reservedBalance = openWithdrawals.reduce((sum, item) => sum + Number(item.amount), 0);
    const availableBalance = Math.max(approvedBalance - reservedBalance, 0);

    if (amount > availableBalance) {
      return Response.json(
        { error: "Withdrawal amount exceeds available approved balance." },
        { status: 400 },
      );
    }

    const { data, error } = await client
      .from("withdrawal_requests")
      .insert([
        {
          user_id: user.id,
          wallet_address: walletAddress,
          amount,
          asset,
          network,
          status: "pending",
        },
      ])
      .select("*")
      .single();

    if (error) throw error;

    return Response.json({ withdrawal: data as WithdrawalRequestRecord });
  } catch (error) {
    return handleAdminError(error);
  }
}
