import {
  getAdminSupabaseClient,
  handleAdminError,
  requireAdmin,
} from "@/lib/admin/server";

export async function GET(request: Request) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const client = getAdminSupabaseClient();
    const { data, error } = await client
      .from("rewards")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return Response.json({ rewards: data ?? [] });
  } catch (error) {
    return handleAdminError(error);
  }
}

export async function POST(request: Request) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const payload = (await request.json()) as {
      wallet_address?: string;
      reward_type?: string;
      amount?: number;
      asset?: string;
      note?: string;
    };
    const walletAddress = payload.wallet_address?.trim().toLowerCase();

    if (!walletAddress || !payload.reward_type || !payload.amount || !payload.asset) {
      return Response.json({ error: "缺少奖励字段。" }, { status: 400 });
    }

    const client = getAdminSupabaseClient();
    const { data: user, error: userError } = await client
      .from("users")
      .select("*")
      .eq("wallet_address", walletAddress)
      .single();

    if (userError) throw userError;

    const { data, error } = await client
      .from("rewards")
      .insert([
        {
          user_id: user.id,
          wallet_address: walletAddress,
          reward_type: payload.reward_type,
          amount: payload.amount,
          asset: payload.asset,
          status: "pending",
          note: payload.note ?? null,
        },
      ])
      .select("*")
      .single();

    if (error) throw error;

    return Response.json({ reward: data });
  } catch (error) {
    return handleAdminError(error);
  }
}
