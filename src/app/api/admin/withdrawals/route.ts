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
      .from("withdrawal_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return Response.json({ withdrawals: data ?? [] });
  } catch (error) {
    return handleAdminError(error);
  }
}
