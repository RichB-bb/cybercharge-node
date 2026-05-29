import {
  getAdminSupabaseClient,
  handleAdminError,
  requireAdmin,
} from "@/lib/admin/server";

export async function GET(request: Request, context: RouteContext<"/api/admin/customers/[id]">) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await context.params;
    const client = getAdminSupabaseClient();
    const [userResult, transactionsResult, allocationsResult, rewardsResult] =
      await Promise.all([
        client.from("users").select("*").eq("id", id).single(),
        client
          .from("transactions")
          .select("*")
          .eq("user_id", id)
          .order("created_at", { ascending: false }),
        client
          .from("allocations")
          .select("*")
          .eq("user_id", id)
          .order("created_at", { ascending: false }),
        client.from("rewards").select("*").eq("user_id", id).order("created_at", {
          ascending: false,
        }),
      ]);

    if (userResult.error) throw userResult.error;
    if (transactionsResult.error) throw transactionsResult.error;
    if (allocationsResult.error) throw allocationsResult.error;
    if (rewardsResult.error) throw rewardsResult.error;

    return Response.json({
      customer: userResult.data,
      transactions: transactionsResult.data ?? [],
      allocations: allocationsResult.data ?? [],
      rewards: rewardsResult.data ?? [],
    });
  } catch (error) {
    return handleAdminError(error);
  }
}

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/admin/customers/[id]">,
) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await context.params;
    const payload = (await request.json()) as {
      admin_note?: string;
      admin_status?: string;
    };
    const allowedStatuses = new Set(["normal", "vip", "risk", "frozen"]);
    const updatePayload: {
      admin_note?: string;
      admin_status?: string;
    } = {};

    if (typeof payload.admin_note === "string") {
      updatePayload.admin_note = payload.admin_note;
    }

    if (payload.admin_status) {
      if (!allowedStatuses.has(payload.admin_status)) {
        return Response.json({ error: "不支持的客户状态。" }, { status: 400 });
      }

      updatePayload.admin_status = payload.admin_status;
    }

    const client = getAdminSupabaseClient();
    const { data, error } = await client
      .from("users")
      .update(updatePayload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;

    return Response.json({ customer: data });
  } catch (error) {
    return handleAdminError(error);
  }
}
