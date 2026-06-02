# Binance Wallet Integration Report

## Current Wallet Configuration

CyberCharge uses RainbowKit `getDefaultConfig` in `src/app/providers.tsx`.

The wallet group is named:

- `Supported Wallets`

## Binance Wallet Native Support

RainbowKit `2.2.11` does support Binance Wallet natively.

Confirmed wallet factories:

- `binanceWallet`
- `metaMaskWallet`
- `coinbaseWallet`
- `trustWallet`
- `okxWallet`
- `walletConnectWallet`
- `injectedWallet`

Note: the Trust Wallet factory name in this RainbowKit version is `trustWallet`, not `trustWalletWallet`.

## Final Wallet Display Order

When `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is configured, the wallet order is:

1. Binance Wallet
2. MetaMask
3. Coinbase Wallet
4. Trust Wallet
5. OKX Wallet
6. WalletConnect
7. Browser Wallet

If WalletConnect project ID is missing, WalletConnect-dependent app wallets are not shown to avoid invalid WalletConnect requests. The fallback list is:

1. Browser Wallet
2. Coinbase Wallet

## Mobile Support

The following mobile wallet entries are now explicitly available through RainbowKit when WalletConnect is configured:

- Binance Wallet App
- MetaMask App
- Trust Wallet App
- OKX Wallet App

These wallets can open through their RainbowKit-supported injected or WalletConnect mobile connector behavior depending on the device/browser context.

## WalletConnect Status

WalletConnect is retained.

It remains important for:

- Binance Wallet mobile users
- Wallets without browser injection
- In-app browser contexts
- Cross-device QR connection

## Binance Wallet User Connection Path

Preferred path:

1. Click `Connect`
2. Select `Binance Wallet`
3. Connect using Binance Wallet app/browser context

Fallback path:

1. Click `Connect`
2. Select `WalletConnect`
3. Choose Binance Wallet from WalletConnect-supported wallets

## Test Suggestions

- Test desktop browser with Binance Wallet extension installed.
- Test Binance Wallet mobile in-app browser.
- Test iPhone Safari with WalletConnect.
- Test Android Chrome with Binance Wallet and OKX Wallet.
- Confirm MetaMask appears as a separate wallet entry, not only as Browser Wallet.
- Confirm Browser Wallet remains available as the last fallback option.
