const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const isSecretKeyInPublicEnv = supabaseAnonKey.startsWith("sb_secret_");

export const publicEnv = {
  supabaseUrl,
  supabaseAnonKey: isSecretKeyInPublicEnv ? "" : supabaseAnonKey,
};

export const publicEnvStatus = {
  isSupabaseUrlLoaded: Boolean(supabaseUrl),
  isSupabaseAnonLoaded: Boolean(supabaseAnonKey) && !isSecretKeyInPublicEnv,
  isSecretKeyInPublicEnv,
  missingSupabaseVars: [
    !supabaseUrl ? "NEXT_PUBLIC_SUPABASE_URL" : null,
    !supabaseAnonKey ? "NEXT_PUBLIC_SUPABASE_ANON_KEY" : null,
    isSecretKeyInPublicEnv ? "NEXT_PUBLIC_SUPABASE_ANON_KEY must be publishable/anon, not sb_secret" : null,
  ].filter(Boolean) as string[],
};

export const isPublicSupabaseConfigured =
  publicEnvStatus.isSupabaseUrlLoaded && publicEnvStatus.isSupabaseAnonLoaded;

export function getSupabaseEnvError() {
  if (isPublicSupabaseConfigured) {
    return "";
  }

  return `Missing Supabase environment variable(s): ${publicEnvStatus.missingSupabaseVars.join(
    ", ",
  )}. Add them to .env.local and restart npm run dev.`;
}

if (process.env.NODE_ENV === "development") {
  console.log("Supabase URL loaded", publicEnvStatus.isSupabaseUrlLoaded);
  console.log("Supabase ANON loaded", publicEnvStatus.isSupabaseAnonLoaded);

  if (publicEnvStatus.isSecretKeyInPublicEnv) {
    console.error(
      "Forbidden Supabase env: NEXT_PUBLIC_SUPABASE_ANON_KEY contains a secret key. Use the publishable/anon key in NEXT_PUBLIC_SUPABASE_ANON_KEY and keep sb_secret/service_role only in SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  if (!isPublicSupabaseConfigured) {
    console.warn(getSupabaseEnvError());
  }
}
