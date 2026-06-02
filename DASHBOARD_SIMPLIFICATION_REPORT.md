# Dashboard Simplification Report

## Goal

The user dashboard was simplified into a rewards and withdrawal view.

## Removed From Dashboard View

- Portfolio overview
- Allocation card
- Revenue participation card
- Deployment exposure
- Network activity
- Transaction history

These components remain in the codebase but are no longer rendered on `/dashboard`.

## Remaining Dashboard Structure

- Connected Wallet
- Withdrawable Balance
- Request Withdrawal
- Withdrawal History
- Reward History

## Withdrawable Balance Logic

Withdrawable balance is based only on:

```text
rewards.status = approved
```

Pending, rejected, and paid rewards are not counted as withdrawable.

## Withdrawal Request Form

The withdrawal wallet is fixed to the currently connected wallet.

The user can only input:

- Amount
- Asset
- Network

The request sends:

```text
wallet_address = connected wallet
status = pending
```

## Validation

The dashboard enforces:

- Wallet must be connected
- Amount must be greater than 0
- Amount must be less than or equal to withdrawable balance
- Withdrawal wallet is the connected wallet

## Mobile Improvement

The simplified dashboard prioritizes the balance and withdrawal button near the top of the page, making it easier to use on mobile without scrolling through investment analytics.
