import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export type RewardStatus = "pending" | "approved" | "paid" | "rejected";
export type RewardType = "referral" | "revenue_share" | "manual_bonus";

export type AdminRewardRecord = {
  id: string;
  user_id: string;
  wallet_address: string;
  reward_type: RewardType | string;
  amount: number;
  asset: string;
  status: RewardStatus | string;
  note: string | null;
  created_at: string;
  paid_at: string | null;
};

export function isAdminDeviceRequest(request: Request) {
  const expectedKey = process.env.ADMIN_DEVICE_KEY;
  const providedKey =
    request.headers.get("x-admin-device-key") ??
    new URL(request.url).searchParams.get("key");

  return Boolean(expectedKey && providedKey && providedKey === expectedKey);
}

export function unauthorizedResponse() {
  return Response.json({ error: "无权访问" }, { status: 401 });
}

export function getAdminSupabaseClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase admin environment variables are not configured.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });
}

export function getClientIp(request: Request) {
  const cfIp = request.headers.get("cf-connecting-ip");
  const realIp = request.headers.get("x-real-ip");
  const forwarded = request.headers.get("x-forwarded-for");
  const forwardedIp = forwarded?.split(",")[0]?.trim();

  return cfIp ?? realIp ?? forwardedIp ?? "unknown";
}

export function handleAdminError(error: unknown) {
  const detail = serializeAdminError(error);
  return Response.json({ error: detail.message, detail }, { status: 500 });
}

export function requireAdmin(request: Request) {
  if (!isAdminDeviceRequest(request)) {
    return unauthorizedResponse();
  }

  return null;
}

function serializeAdminError(error: unknown) {
  if (!error || typeof error !== "object") {
    return { message: String(error) || "后台请求失败。" };
  }

  const record = error as {
    code?: string;
    message?: string;
    details?: string;
    hint?: string;
  };

  return {
    code: record.code,
    message: record.message ?? "后台请求失败。",
    details: record.details,
    hint: record.hint,
  };
}
