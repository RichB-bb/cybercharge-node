import {
  getAdminSupabaseClient,
  getClientIp,
  handleAdminError,
} from "@/lib/admin/server";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { wallet_address?: string };
    const walletAddress = payload.wallet_address?.trim().toLowerCase();

    if (!walletAddress || !walletAddress.startsWith("0x")) {
      return Response.json({ error: "Invalid wallet address." }, { status: 400 });
    }

    const client = getAdminSupabaseClient();
    const now = new Date().toISOString();
    const ipAddress = getClientIp(request);
    const ipGeo = await lookupIpGeo(ipAddress);
    const userPayload = {
      wallet_address: walletAddress,
      ip_address: ipAddress,
      ip_country: ipGeo.ip_country,
      ip_region: ipGeo.ip_region,
      ip_city: ipGeo.ip_city,
      ip_timezone: ipGeo.ip_timezone,
      ip_org: ipGeo.ip_org,
      last_activity_at: now,
      status: "active",
    };

    const { data, error } = await client
      .from("users")
      .upsert(userPayload, { onConflict: "wallet_address" })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return Response.json({ success: true, user: data });
  } catch (error) {
    return handleAdminError(error);
  }
}

async function lookupIpGeo(ipAddress: string) {
  const emptyGeo = {
    ip_country: null as string | null,
    ip_region: null as string | null,
    ip_city: null as string | null,
    ip_timezone: null as string | null,
    ip_org: null as string | null,
  };

  if (isLocalIp(ipAddress)) {
    return {
      ...emptyGeo,
      ip_country: "本地开发环境",
      ip_region: "本地开发环境",
      ip_city: "本地开发环境",
      ip_timezone: null,
      ip_org: "Localhost",
    };
  }

  try {
    const response = await fetch(`https://ipapi.co/${ipAddress}/json/`, {
      headers: {
        accept: "application/json",
      },
      next: { revalidate: 60 * 60 * 24 },
    });

    if (!response.ok) {
      return emptyGeo;
    }

    const data = (await response.json()) as {
      country_name?: string;
      region?: string;
      city?: string;
      timezone?: string;
      org?: string;
      error?: boolean;
    };

    if (data.error) {
      return emptyGeo;
    }

    return {
      ip_country: data.country_name ?? null,
      ip_region: data.region ?? null,
      ip_city: data.city ?? null,
      ip_timezone: data.timezone ?? null,
      ip_org: data.org ?? null,
    };
  } catch {
    return emptyGeo;
  }
}

function isLocalIp(ipAddress: string) {
  return (
    ipAddress === "127.0.0.1" ||
    ipAddress === "::1" ||
    ipAddress === "localhost" ||
    ipAddress.startsWith("192.168.") ||
    ipAddress.startsWith("10.") ||
    /^172\\.(1[6-9]|2\\d|3[0-1])\\./.test(ipAddress)
  );
}
