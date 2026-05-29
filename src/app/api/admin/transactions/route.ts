import {
  getAdminSupabaseClient,
  handleAdminError,
  requireAdmin,
} from "@/lib/admin/server";
import type { TransactionRecord, UserRecord } from "@/lib/supabase";

const explorerBaseUrls: Record<string, string> = {
  Ethereum: "https://etherscan.io/tx/",
  Base: "https://basescan.org/tx/",
  Polygon: "https://polygonscan.com/tx/",
  BSC: "https://bscscan.com/tx/",
};

export async function GET(request: Request) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const client = getAdminSupabaseClient();
    const [transactionsResult, usersResult] = await Promise.all([
      client.from("transactions").select("*").order("created_at", { ascending: false }),
      client.from("users").select("*"),
    ]);

    if (transactionsResult.error) throw transactionsResult.error;
    if (usersResult.error) throw usersResult.error;

    const users = new Map(
      ((usersResult.data ?? []) as UserRecord[]).map((user) => [user.id, user]),
    );

    const transactions = ((transactionsResult.data ?? []) as TransactionRecord[]).map((item) => {
      const user = users.get(item.user_id);
      return {
        ...item,
        wallet_address: user?.wallet_address ?? "-",
        ip_address: user?.ip_address ?? "-",
        ip_country: user?.ip_country ?? "-",
        explorer_link: item.tx_hash ? `${explorerBaseUrls[item.network] ?? ""}${item.tx_hash}` : "",
      };
    });

    return Response.json({ transactions });
  } catch (error) {
    return handleAdminError(error);
  }
}
