# Withdrawal Workflow Report

## Added Database Table

Added `withdrawal_requests` in:

- `supabase/schema.sql`
- `supabase/full_setup.sql`
- `supabase/withdrawal_requests_migration.sql`

Fields:

- `id`
- `user_id`
- `wallet_address`
- `amount`
- `asset`
- `network`
- `status`
- `payout_tx_hash`
- `admin_note`
- `requested_at`
- `reviewed_at`
- `paid_at`
- `created_at`

Status flow:

- `pending`
- `approved`
- `rejected`
- `paid`

## Dashboard Features

Added `Withdrawable Balance` to the investor dashboard.

The dashboard now reads:

- Approved reward records
- Withdrawal request history
- Current withdrawable balances by asset

Users can submit a withdrawal request with:

- Amount
- Asset
- Network
- Connected wallet address

The request is created as `withdrawal_requests.status = pending`.

## Admin Features

Added a new admin tab:

- `提现管理`

Admin can now:

- View all withdrawal requests
- Approve a request
- Reject a request with an optional note
- Enter a payout transaction hash
- Mark a request as paid

When a withdrawal is marked as paid, the system marks matching `approved` rewards as `paid`.
If one reward is larger than the withdrawal amount, it is split so the unpaid remainder stays `approved`.

## Withdrawal Status Flow

```text
Admin creates or approves rewards
↓
rewards.status = approved
↓
Dashboard shows Withdrawable Balance
↓
User submits withdrawal request
↓
withdrawal_requests.status = pending
↓
Admin approves or rejects
↓
withdrawal_requests.status = approved / rejected
↓
Admin manually transfers funds on-chain
↓
Admin enters payout tx hash
↓
withdrawal_requests.status = paid
↓
matched rewards.status = paid
```

## Manual Transfer Flow

This version does not perform automatic token transfers.

Admin must manually send funds from the appropriate wallet, then record the payout transaction hash in the admin dashboard.

This avoids adding custody automation, signer management, and automated payout risk before the operational workflow is verified.

## Current Limitations

- No automatic on-chain payout.
- No signed wallet-auth withdrawal proof yet.
- Withdrawal identity is still based on connected wallet address.
- Approved balances are based on admin-confirmed reward records only.

Compliance-safe copy is used:

- Rewards are based on admin-confirmed records.
- Withdrawals are manually reviewed.
- Processing times may vary.
- Rewards are not guaranteed.
