import { isAdminDeviceRequest } from "@/lib/admin/server";

export async function GET(request: Request) {
  return Response.json({ authorized: isAdminDeviceRequest(request) });
}
