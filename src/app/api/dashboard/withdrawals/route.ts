import {
  getAdminSupabaseClient,
  handleAdminError,
} from "@/lib/admin/server";
import type { WithdrawalRequestRecord } from "@/lib/supabase";

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
      return Response.json({ withdrawals: [] });
    }

    const { data, error } = await client
      .from("withdrawal_requests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return Response.json({ withdrawals: (data ?? []) as WithdrawalRequestRecord[] });
  } catch (error) {
    return handleAdminError(error);
  }
}
