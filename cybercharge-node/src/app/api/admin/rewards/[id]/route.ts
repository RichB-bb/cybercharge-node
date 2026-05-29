import {
  getAdminSupabaseClient,
  handleAdminError,
  requireAdmin,
} from "@/lib/admin/server";

const allowedStatuses = new Set(["approved", "paid", "rejected"]);

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/admin/rewards/[id]">,
) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await context.params;
    const payload = (await request.json()) as { status?: string };

    if (!payload.status || !allowedStatuses.has(payload.status)) {
      return Response.json({ error: "不支持的奖励状态。" }, { status: 400 });
    }

    const client = getAdminSupabaseClient();
    const { data, error } = await client
      .from("rewards")
      .update({
        status: payload.status,
        paid_at: payload.status === "paid" ? new Date().toISOString() : null,
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;

    return Response.json({ reward: data });
  } catch (error) {
    return handleAdminError(error);
  }
}
