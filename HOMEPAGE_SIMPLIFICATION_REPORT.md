# Homepage Simplification Report

## Summary

This phase focuses on conversion speed rather than adding more visual polish. The first three high-impact sections remain unchanged:

- Hero video
- Real Charging Infrastructure image section
- Revenue Sharing Energy Assets image section

Everything after those sections was shortened so mobile users can reach the investment/payment entry faster.

## Removed Or Bypassed Modules

- Removed `RevenueModel` from the homepage path.
- Removed `InfrastructureOverview` from the homepage path.
- Removed `WhyEVInfrastructure` from the homepage path.
- Removed `FeaturesSection` from the homepage path.
- Removed `PurchaseFlow` from the homepage path.

The component files were left in place for future reuse, but they are no longer rendered on the homepage.

## Shortened Content

- Deployment copy was reduced to a concise headline and one-line positioning statement.
- The deployment stats strip was removed so the live map becomes the primary visual.
- The payment flow was reduced from five steps to three:
  - Connect Wallet
  - Purchase Allocation
  - View Dashboard
- Risk disclosure was moved into compact text at the bottom of the payment panel.
- Footer spacing was compressed and link labels were shortened.

## Payment Simplification

- Payment now behaves more like a purchase panel:
  - Allocation selector
  - Wallet connection
  - Network selector
  - Asset selector
  - Payment amount
  - Purchase Allocation CTA
- QR/manual payment is collapsed by default under `Manual Payment (Optional)`.
- Success modal now includes a direct `View Investor Dashboard` CTA.

## Mobile Improvements

- Reduced section padding after the first three visual sections.
- Reduced explanatory content and repeated stats.
- Payment controls are more compact while keeping touch targets large.
- Manual QR no longer consumes first-view payment space on mobile.
- Footer height is lower, reducing end-of-page scrolling.

## Expected Conversion Lift

- Users reach the payment section sooner.
- The primary action is clearer.
- Dashboard path is visible before and after purchase.
- The page feels more like an EV infrastructure purchase flow and less like a long explanatory landing page.
