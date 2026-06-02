# CyberCharge I18N Sync Report

## Summary

CyberCharge now uses a single app-wide language context for the public site, payment entry, footer, wallet modal locale, and user dashboard.

## Previous Issue

The app already had a `LanguageProvider`, but several visible areas still used hardcoded English strings. RainbowKit also did not receive the selected language, so the wallet connection modal could display a different language from the page.

Language state also initialized to English on every refresh, which caused the selected language to appear lost after reloads.

## New Language State

Language state is stored in `localStorage` under:

```text
cybercharge_language
```

On page load, the provider restores the saved language. When language changes, the provider updates:

- `document.documentElement.lang`
- `document.documentElement.dir`
- `localStorage`

Arabic uses RTL via `dir="rtl"`. Other supported languages use `dir="ltr"`.

## Pages and Areas Connected

- Homepage sections using `useLanguage`
- Navbar desktop and mobile menu
- Footer links and platform description
- Payment section core labels and buttons
- Payment timeline
- User dashboard hero
- Withdrawable balance
- Withdrawal request form
- Reward and withdrawal history labels

The Admin console remains Chinese-first because it is an internal operations panel. Its data logic was not changed.

## RainbowKit Locale

RainbowKit now follows the selected app language through the provider:

- `en` -> `en-US`
- `zh` -> `zh-CN`
- `ja` -> `ja-JP`
- `ko` -> `ko-KR`
- `es` -> `es-419`
- `fr` -> `fr-FR`
- `ar` -> `ar-AR`

This keeps the wallet connection modal aligned with the selected site language where RainbowKit supports that locale.

## Verification

- `npm run build` passed
- `npm run build:cloudflare` passed

Payment logic, Supabase logic, Admin data logic, and WalletConnect configuration were not changed.
