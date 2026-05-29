import { getAdminDebugState } from "@/lib/admin/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return Response.json(getAdminDebugState(request), {
    headers: {
      "cache-control": "no-store",
    },
  });
}
