alter table public.users
  add column if not exists ip_address text;

alter table public.users
  add column if not exists last_activity_at timestamptz;

alter table public.users
  add column if not exists status text not null default 'active';

create table if not exists public.rewards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  wallet_address text not null,
  reward_type text not null check (reward_type in ('referral', 'revenue_share', 'manual_bonus')),
  amount numeric(18, 6) not null,
  asset text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'paid', 'rejected')),
  note text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists rewards_user_id_created_at_idx
  on public.rewards (user_id, created_at desc);

create index if not exists rewards_wallet_address_idx
  on public.rewards (lower(wallet_address));

alter table public.rewards enable row level security;

create policy "Users can update own wallet profile"
  on public.users for update
  using (lower(wallet_address) = public.current_wallet_address())
  with check (lower(wallet_address) = public.current_wallet_address());

create policy "Users can read own rewards"
  on public.rewards for select
  using (
    exists (
      select 1
      from public.users
      where users.id = rewards.user_id
        and lower(users.wallet_address) = public.current_wallet_address()
    )
  );
