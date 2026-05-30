import {
  getAdminSupabaseClient,
  getAdminSupabaseConfigState,
  handleAdminError,
  requireAdmin,
} from "@/lib/admin/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const config = getAdminSupabaseConfigState();

  if (!config.supabaseConfigured) {
    return Response.json(
      {
        supabaseConfigured: false,
        usersCount: 0,
        transactionsCount: 0,
        allocationsCount: 0,
        rewardsCount: 0,
      },
      {
        headers: {
          "cache-control": "no-store",
        },
      },
    );
  }

  try {
    const client = getAdminSupabaseClient();
    const [usersResult, transactionsResult, allocationsResult, rewardsResult] =
      await Promise.all([
        client.from("users").select("id", { count: "exact", head: true }),
        client.from("transactions").select("id", { count: "exact", head: true }),
        client.from("allocations").select("id", { count: "exact", head: true }),
        client.from("rewards").select("id", { count: "exact", head: true }),
      ]);

    if (usersResult.error) throw usersResult.error;
    if (transactionsResult.error) throw transactionsResult.error;
    if (allocationsResult.error) throw allocationsResult.error;
    if (rewardsResult.error) throw rewardsResult.error;

    return Response.json(
      {
        supabaseConfigured: true,
        usersCount: usersResult.count ?? 0,
        transactionsCount: transactionsResult.count ?? 0,
        allocationsCount: allocationsResult.count ?? 0,
        rewardsCount: rewardsResult.count ?? 0,
      },
      {
        headers: {
          "cache-control": "no-store",
        },
      },
    );
  } catch (error) {
    return handleAdminError(error);
  }
}
