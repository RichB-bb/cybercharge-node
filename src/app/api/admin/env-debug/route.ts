import {
  getAdminSupabaseConfigState,
  requireAdmin,
} from "@/lib/admin/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const config = getAdminSupabaseConfigState();

  return Response.json(
    {
      supabaseUrlConfigured: config.supabaseUrlConfigured,
      anonKeyConfigured: config.anonKeyConfigured,
      serviceRoleConfigured: config.serviceRoleKeyConfigured,
    },
    {
      headers: {
        "cache-control": "no-store",
      },
    },
  );
}
