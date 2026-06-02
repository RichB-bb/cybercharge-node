# Wallet Persistence Report

## Issue

After connecting a wallet, refreshing the page could lose the connected wallet state and require the user to connect again.

## Root Cause

The wagmi/RainbowKit provider used `getDefaultConfig` with `ssr: true`, but did not explicitly configure persistent browser storage. Wagmi reconnects on mount by default, but stable persistence is more reliable when storage is explicitly configured for the app.

## Fix

Updated `src/app/providers.tsx` to:

- Add wagmi `createStorage`
- Persist wallet connection state in `localStorage`
- Use the storage key `cybercharge-wallet`
- Avoid direct `window` access during SSR/Cloudflare prerender
- Explicitly set `reconnectOnMount` on `WagmiProvider`

## SSR / Cloudflare Safety

The storage wrapper checks:

```ts
typeof window === "undefined"
```

before reading or writing `localStorage`, so Cloudflare Worker SSR/prerender does not attempt to access browser-only APIs.

## Expected Behavior

- Browser refresh should restore the previously connected wallet when the connector supports reconnecting.
- Mobile wallet in-app browsers should retain connection state more reliably after navigation or returning from wallet app flows.
- WalletConnect sessions remain dependent on a valid `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` and the wallet's session behavior.

## Unchanged Areas

- Payment logic was not modified.
- Supabase logic was not modified.
- Admin logic was not modified.
- Dashboard data logic was not modified.
