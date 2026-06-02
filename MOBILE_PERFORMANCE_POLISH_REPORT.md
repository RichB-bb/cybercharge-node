# Mobile Performance Polish Report

## Summary

This pass keeps the Tesla / Apple-style dynamic hero experience while reducing mobile resource weight and improving scroll smoothness.

## Experience Preserved

- The mobile homepage still opens with a full-screen animated Hero video.
- Desktop continues to use the original large cinematic Hero video.
- The first three premium visual sections remain visually intact.
- The charging infrastructure map still shows real Leaflet / OpenStreetMap markers when the user reaches the network section.

## Resource Optimizations

### Hero Video

- Added a dedicated mobile Hero video:
  - `public/videos/hero-mobile.mp4`
  - 720p
  - H.264 MP4
  - 7-second loop
  - 580 KB
  - Uses `station.avif` as poster fallback

Desktop still uses:

- `public/videos/Supercharger-Hero-Desktop.webm`
- 5.5 MB

The browser now chooses the correct video by media query:

- Mobile: `hero-mobile.mp4`
- Desktop: `Supercharger-Hero-Desktop.webm`

### Image Sections

Added mobile-specific image assets:

- `public/images/station-mobile.jpg` - 76 KB
- `public/images/deployment-mobile.jpg` - 86 KB

The immersive image sections now use `<picture>` and media queries so mobile browsers do not need to load the larger desktop image resources.

### Deployment Map

The map now loads only when the Deployment Network section is near the viewport. This avoids loading Leaflet, OpenStreetMap tiles, and markers during initial page load.

Mobile map behavior:

- Fixed 420px height to prevent layout shift.
- Marker count is reduced on compact screens.
- Map still supports drag and zoom after loading.

### JavaScript Loading

Below-the-fold sections are dynamically imported:

- Deployment Map
- Payment Timeline
- Payment Section

This keeps wallet/payment code out of the initial homepage path until later in the scroll.

### Motion

Hero motion is preserved for premium first-screen feel. The Navbar entrance animation was removed to reduce non-essential motion and JS work outside the Hero.

## Expected Mobile Improvements

- Lower mobile Hero media transfer from 5.5 MB to approximately 580 KB.
- Faster first meaningful visual load while preserving video motion.
- Less scroll jank before the map section.
- Lower map rendering work on mobile through delayed load and reduced markers.
- Lower initial JavaScript pressure by deferring payment/map sections.

## Wallet and Payment Impact

No payment, wallet, Supabase, Admin, rewards, or withdrawal business logic was changed.

Wallet and payment behavior remains the same; only component loading timing and media delivery were optimized.

## Verification

- `npm run build` passed
- `npm run build:cloudflare` passed
