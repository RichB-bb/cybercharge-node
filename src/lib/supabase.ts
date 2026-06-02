import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isPublicSupabaseConfigured, publicEnv } from "@/lib/env";

export type UserRecord = {
  id: string;
  wallet_address: string;
  created_at: string;
  preferred_language: string | null;
  ip_address: string | null;
  ip_country: string | null;
  ip_region: string | null;
  ip_city: string | null;
  ip_timezone: string | null;
  ip_org: string | null;
  last_activity_at: string | null;
  status: string | null;
  admin_status: string | null;
  admin_note: string | null;
};

export type AllocationRecord = {
  id: string;
  user_id: string;
  allocation_percent: number;
  purchase_value: number;
  asset: string;
  network: string;
  status: string;
  created_at: string;
};

export type TransactionRecord = {
  id: string;
  user_id: string;
  tx_hash: string | null;
  amount: number;
  asset: string;
  network: string;
  status: string;
  confirmation_time: string | null;
  token_contract: string | null;
  payment_type: "native" | "erc20" | string | null;
  created_at: string;
};

export type RewardRecord = {
  id: string;
  user_id: string;
  wallet_address: string;
  reward_type: "referral" | "revenue_share" | "manual_bonus" | string;
  amount: number;
  asset: string;
  status: "pending" | "approved" | "paid" | "rejected" | string;
  note: string | null;
  created_at: string;
  paid_at: string | null;
};

export type WithdrawalRequestRecord = {
  id: string;
  user_id: string;
  wallet_address: string;
  amount: number;
  asset: string;
  network: string;
  status: "pending" | "approved" | "rejected" | "paid" | string;
  payout_tx_hash: string | null;
  admin_note: string | null;
  requested_at: string | null;
  reviewed_at: string | null;
  paid_at: string | null;
  created_at: string | null;
};

const supabaseUrl = publicEnv.supabaseUrl;
const supabaseAnonKey = publicEnv.supabaseAnonKey;

export const isSupabaseConfigured = isPublicSupabaseConfigured;

type SupabaseBrowserClient = SupabaseClient<any, "public", any, any, any>;

const supabaseClientOptions = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
} as const;

let publicSupabaseClient: SupabaseBrowserClient | null = null;
const walletClientCache = new Map<string, SupabaseBrowserClient>();
const adminClientCache = new Map<string, SupabaseBrowserClient>();

function createBrowserSupabaseClient(headers?: Record<string, string>) {
  return createClient(supabaseUrl as string, supabaseAnonKey as string, {
    ...supabaseClientOptions,
    global: headers ? { headers } : undefined,
  });
}

function getPublicSupabaseClient() {
  if (!isSupabaseConfigured) {
    return null;
  }

  publicSupabaseClient ??= createBrowserSupabaseClient();
  return publicSupabaseClient;
}

export const supabase = getPublicSupabaseClient();

export function createSupabaseWalletClient(walletAddress?: string) {
  if (!isSupabaseConfigured) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Supabase wallet client not created: env is missing.");
    }
    return null;
  }

  const cacheKey = walletAddress?.toLowerCase() ?? "__anonymous_wallet__";
  const cachedClient = walletClientCache.get(cacheKey);

  if (cachedClient) {
    return cachedClient;
  }

  const headers = walletAddress
    ? { "x-wallet-address": walletAddress.toLowerCase() }
    : undefined;

  const client = createBrowserSupabaseClient(headers);

  walletClientCache.set(cacheKey, client);
  return client;
}

export function createSupabaseAdminClient(walletAddress?: string) {
  if (!isSupabaseConfigured) {
    return null;
  }

  const adminIdentity = (walletAddress ?? "local-admin").toLowerCase();
  const cachedClient = adminClientCache.get(adminIdentity);

  if (cachedClient) {
    return cachedClient;
  }

  const client = createBrowserSupabaseClient({
    "x-wallet-address": adminIdentity,
    "x-admin-wallet": adminIdentity,
  });

  adminClientCache.set(adminIdentity, client);
  return client;
}

export async function ensureUserByWallet(
  walletAddress: string,
  preferredLanguage = "en",
) {
  const client = createSupabaseWalletClient(walletAddress);

  if (!client) {
    throw new Error("Supabase is not configured.");
  }

  const normalizedWallet = walletAddress.toLowerCase();
  const activityUpdate = {
    ip_address: await fetchClientIp(),
    last_activity_at: new Date().toISOString(),
    status: "active",
  };

  if (process.env.NODE_ENV === "development") {
    console.log("Supabase URL configured", isSupabaseConfigured);
    console.log("user activity payload", activityUpdate);
  }

  const { data: existingUser, error: lookupError } = await client
    .from("users")
    .select("*")
    .eq("wallet_address", normalizedWallet)
    .maybeSingle();

  if (lookupError) {
    if (process.env.NODE_ENV === "development") {
      console.error("user lookup error", lookupError);
    }
    throw lookupError;
  }

  if (existingUser) {
    if (process.env.NODE_ENV === "development") {
      console.log("user exists", existingUser.wallet_address);
    }

    const { data: updatedUser, error: updateError } = await client
      .from("users")
      .update(activityUpdate)
      .eq("id", existingUser.id)
      .select("*")
      .single();

    if (process.env.NODE_ENV === "development") {
      if (updateError) {
        console.error("update error detail", serializeSupabaseError(updateError));
      } else {
        console.log("update success", updatedUser);
      }
    }

    return (updateError ? existingUser : (updatedUser ?? existingUser)) as UserRecord;
  }

  if (process.env.NODE_ENV === "development") {
    console.log("creating user", normalizedWallet);
  }

  const { data: createdUser, error: createError } = await client
    .from("users")
    .insert([
      {
        wallet_address: normalizedWallet,
        preferred_language: preferredLanguage,
        ...activityUpdate,
      },
    ])
    .select("*")
    .single();

  if (createError) {
    if (process.env.NODE_ENV === "development") {
      console.error("insert error detail", serializeSupabaseError(createError));
    }

    const { data: fallbackUser, error: fallbackError } = await client
      .from("users")
      .insert([
        {
          wallet_address: normalizedWallet,
          preferred_language: preferredLanguage,
        },
      ])
      .select("*")
      .single();

    if (fallbackError) {
      if (process.env.NODE_ENV === "development") {
        console.error("fallback insert error detail", serializeSupabaseError(fallbackError));
      }
      throw createError;
    }

    if (process.env.NODE_ENV === "development") {
      console.log("insert success", fallbackUser);
    }

    return fallbackUser as UserRecord;
  }

  if (process.env.NODE_ENV === "development") {
    console.log("insert success", createdUser);
  }

  return createdUser as UserRecord;
}

function serializeSupabaseError(error: unknown) {
  if (!error || typeof error !== "object") {
    return { message: String(error) };
  }

  const record = error as {
    code?: string;
    message?: string;
    details?: string;
    hint?: string;
  };

  return {
    code: record.code,
    message: record.message,
    details: record.details,
    hint: record.hint,
  };
}

async function fetchClientIp() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const response = await fetch("/api/client-info", { cache: "no-store" });
    const data = (await response.json()) as { ip?: string };
    return data.ip ?? null;
  } catch {
    return null;
  }
}

export async function fetchAllocationsByWallet(walletAddress: string) {
  const user = await ensureUserByWallet(walletAddress);
  const client = createSupabaseWalletClient(walletAddress);

  if (!client) {
    return [];
  }

  const { data, error } = await client
    .from("allocations")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as AllocationRecord[];
}

export async function fetchPendingTransactionCountByWallet(walletAddress: string) {
  const user = await ensureUserByWallet(walletAddress);
  const client = createSupabaseWalletClient(walletAddress);

  if (!client) {
    return 0;
  }

  const { count, error } = await client
    .from("transactions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "pending");

  if (error) {
    throw error;
  }

  return count ?? 0;
}

export async function fetchTransactionsByWallet(walletAddress: string) {
  const user = await ensureUserByWallet(walletAddress);
  const client = createSupabaseWalletClient(walletAddress);

  if (!client) {
    return [];
  }

  const { data, error } = await client
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as TransactionRecord[];
}
