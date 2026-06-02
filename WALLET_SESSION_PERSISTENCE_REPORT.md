# Wallet Session Persistence Report

## Summary

CyberCharge now preserves wallet connection state more reliably across refreshes, browser restarts, and returning from mobile wallet apps.

## Previous Issue

The wagmi provider already used `reconnectOnMount` and a custom localStorage-backed storage adapter, but the UI treated the initial hydration/reconnect period as a disconnected state.

That caused the Dashboard and Navbar to show `Connect Wallet` before wagmi finished restoring the saved connector and WalletConnect session.

## How Connection State Is Stored

wagmi now continues to use a dedicated localStorage namespace:

```text
cybercharge-wallet
```

The storage adapter is guarded for SSR and restricted browser contexts:

- No direct `window` access during SSR.
- localStorage reads/writes are wrapped in `try/catch`.
- If localStorage is unavailable, storage calls fail safely instead of breaking hydration.

WalletConnect sessions continue to be persisted by WalletConnect in browser storage. RainbowKit receives the same wagmi config and reads restored connection state after mount.

## Reconnect Behavior

`WagmiProvider` remains configured with:

```tsx
reconnectOnMount
```

On mount, wagmi rehydrates persisted connector state and attempts to reconnect.

The UI now distinguishes between:

- reconnecting
- connecting
- connected
- truly disconnected

## Dashboard Behavior

The Dashboard no longer immediately shows a disconnected wallet state after refresh.

Instead, it shows:

```text
Restoring wallet session...
```

If reconnect succeeds, it shows the connected wallet address. If reconnect fails after the grace period, it shows the Connect Wallet action.

The rewards/withdrawal panel also avoids clearing existing state while wagmi is reconnecting.

## Navbar Behavior

The Navbar wallet button now avoids flashing `Connect Wallet` during the reconnect window. It shows a small neutral restoring state until wagmi resolves the wallet session.

## Second-Day Revisit

If the wallet connector and WalletConnect session are still valid in browser storage, wagmi attempts to reconnect automatically when the site opens again.

Some wallets may still ask the user to confirm or reconnect if:

- the wallet app revoked the session,
- WalletConnect session expired,
- browser storage was cleared,
- the user changed accounts or networks in the wallet,
- mobile in-app browser storage was reset.

## Verification

- `npm run build` passed
- `npm run build:cloudflare` passed

Payment logic, Admin, Supabase, Rewards, and Withdrawal logic were not changed.
