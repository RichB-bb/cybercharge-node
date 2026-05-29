import { getClientIp } from "@/lib/admin/server";

export async function GET(request: Request) {
  return Response.json({ ip: getClientIp(request) });
}
