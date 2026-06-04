# Dashboard Earnings View Report

## Dashboard New Structure

The user Dashboard has been simplified into a clear rewards and withdrawal experience.

Current structure:

1. Connected Wallet
   - Shows the connected wallet address and wallet status.
   - Shows a reconnecting state before showing disconnected.
   - Shows Connect Wallet only after reconnect fails.

2. Withdrawable Balance
   - First visible operational block on mobile.
   - Shows available approved rewards by asset.
   - Provides the withdrawal entry immediately.

3. Request Withdrawal
   - Default withdrawal wallet is the connected wallet.
   - User enters amount, asset, and network.
   - Submission creates a manual withdrawal request.

4. My Allocation
   - Shows total active allocation.
   - Shows total paid, active allocations, last purchase, and allocation status.
   - If no allocation exists, shows “No active allocation yet” and a Purchase Allocation link.

5. Earnings Overview
   - Confirmed Rewards
   - Withdrawable Balance
   - Withdrawn

6. Earnings Activity Chart
   - Simple date-based bar chart from admin-confirmed reward records.
   - Empty state explains rewards appear after admin-confirmed infrastructure activity.

7. Reward History
   - Date
   - Reward type
   - Amount
   - Asset
   - Status
   - Note

8. Withdrawal History
   - Pending / Approved / Rejected / Paid status
   - Amount
   - Asset
   - Network
   - Payout transaction hash
   - Requested date

## Data Sources

New API:

```text
GET /api/dashboard/summary?wallet={connected_wallet}
```

This endpoint aggregates:

- `allocations`
- `transactions`
- `rewards`
- `withdrawal_requests`

Existing withdrawal endpoint is reused:

```text
POST /api/withdrawals/request
```

## Earnings Display Logic

Rewards are shown only from records already stored in the `rewards` table.

Totals:

- Confirmed Rewards: `rewards.status in approved / paid`
- Withdrawable Balance: `rewards.status = approved`
- Withdrawn: `rewards.status = paid`

The chart groups admin-confirmed rewards by `created_at` date.

## Withdrawal Handling

Withdrawals remain manually reviewed.

The user can request withdrawal only to the connected wallet address. Admin review, manual payout, and payout transaction hash entry remain handled by the existing Admin workflow.

## No Active Allocation State

If the user has no active allocation, the Dashboard shows:

```text
No active allocation yet.
```

The user is directed to:

```text
Purchase Allocation
```

which links to the homepage Payment section.

## Compliance Note

The requested automatic daily 1%-2% random increase was not implemented as withdrawable earnings. That would create an automatic yield-like experience and conflict with the product’s risk language.

The implemented version only shows admin-confirmed rewards and avoids:

- Guaranteed returns
- Fixed return
- Daily profit
- APY
- ROI

## Verification

- `npm run build` passed
- `npm run build:cloudflare` passed
