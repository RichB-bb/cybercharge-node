import { createClient } from "@supabase/supabase-js";
import { getCloudflareContext } from "@opennextjs/cloudflare";

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
  const expectedKey = getAdminDeviceKey();
  const providedKey =
    request.headers.get("x-admin-device-key") ??
    new URL(request.url).searchParams.get("key");

  return Boolean(expectedKey && providedKey && providedKey.trim() === expectedKey);
}

export function getAdminDeviceKey() {
  return getRuntimeEnvValue("ADMIN_DEVICE_KEY");
}

export function getAdminDebugState(request: Request) {
  const expectedKey = getAdminDeviceKey();
  const providedKey =
    request.headers.get("x-admin-device-key") ??
    new URL(request.url).searchParams.get("key") ??
    "";

  return {
    adminKeyConfigured: Boolean(expectedKey),
    receivedKey: Boolean(providedKey),
    keyMatched: Boolean(expectedKey && providedKey && providedKey.trim() === expectedKey),
  };
}

export function unauthorizedResponse() {
  return Response.json({ error: "无权访问" }, { status: 401 });
}

export function getAdminSupabaseClient() {
  const { supabaseUrl, serviceRoleKey } = getAdminSupabaseRuntimeEnv();

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase admin environment variables are not configured.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });
}

export function getAdminSupabaseConfigState() {
  const { anonKey, serviceRoleKey, supabaseUrl } = getAdminSupabaseRuntimeEnv();

  return {
    supabaseConfigured: Boolean(supabaseUrl && serviceRoleKey),
    supabaseUrlConfigured: Boolean(supabaseUrl),
    anonKeyConfigured: Boolean(anonKey),
    serviceRoleKeyConfigured: Boolean(serviceRoleKey),
  };
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

function getAdminSupabaseRuntimeEnv() {
  return {
    supabaseUrl: getRuntimeEnvValue("NEXT_PUBLIC_SUPABASE_URL"),
    anonKey: getRuntimeEnvValue("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    serviceRoleKey: getRuntimeEnvValue("SUPABASE_SERVICE_ROLE_KEY"),
  };
}

function getRuntimeEnvValue(name: string) {
  const processValue = process.env[name]?.trim();

  if (processValue) {
    return processValue;
  }

  try {
    const cloudflareEnv = getCloudflareContext({ async: false }).env as Record<
      string,
      unknown
    >;
    const bindingValue = cloudflareEnv[name];

    return typeof bindingValue === "string" ? bindingValue.trim() : "";
  } catch {
    return "";
  }
}
