create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null unique,
  created_at timestamptz not null default now(),
  preferred_language text default 'en',
  ip_address text,
  ip_country text,
  ip_region text,
  ip_city text,
  ip_timezone text,
  ip_org text,
  last_activity_at timestamptz,
  status text not null default 'active',
  admin_status text not null default 'normal',
  admin_note text
);

create table if not exists public.allocations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  allocation_percent numeric(5, 2) not null,
  purchase_value numeric(18, 6) not null,
  asset text not null,
  network text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  tx_hash text,
  amount numeric(18, 6) not null,
  asset text not null,
  network text not null,
  status text not null default 'pending',
  token_contract text,
  payment_type text not null default 'native',
  confirmation_time timestamptz,
  created_at timestamptz not null default now()
);

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

alter table public.users
  add column if not exists ip_address text;

alter table public.users
  add column if not exists ip_country text;

alter table public.users
  add column if not exists ip_region text;

alter table public.users
  add column if not exists ip_city text;

alter table public.users
  add column if not exists ip_timezone text;

alter table public.users
  add column if not exists ip_org text;

alter table public.users
  add column if not exists last_activity_at timestamptz;

alter table public.users
  add column if not exists status text not null default 'active';

alter table public.users
  add column if not exists admin_status text not null default 'normal';

alter table public.users
  add column if not exists admin_note text;

alter table public.transactions
  add column if not exists confirmation_time timestamptz;

alter table public.transactions
  add column if not exists token_contract text;

alter table public.transactions
  add column if not exists payment_type text not null default 'native';

create index if not exists users_wallet_address_idx
  on public.users (lower(wallet_address));

create index if not exists allocations_user_id_created_at_idx
  on public.allocations (user_id, created_at desc);

create index if not exists transactions_user_id_created_at_idx
  on public.transactions (user_id, created_at desc);

create index if not exists rewards_user_id_created_at_idx
  on public.rewards (user_id, created_at desc);

create index if not exists rewards_wallet_address_idx
  on public.rewards (lower(wallet_address));

alter table public.users enable row level security;
alter table public.allocations enable row level security;
alter table public.transactions enable row level security;
alter table public.rewards enable row level security;

create or replace function public.current_wallet_address()
returns text
language sql
stable
as $$
  select lower(
    coalesce(
      nullif(auth.jwt() ->> 'wallet_address', ''),
      nullif(nullif(current_setting('request.headers', true), '')::jsonb ->> 'x-wallet-address', '')
    )
  )
$$;

create or replace function public.is_admin_wallet()
returns boolean
language sql
stable
as $$
  select public.current_wallet_address() =
    lower(nullif(nullif(current_setting('request.headers', true), '')::jsonb ->> 'x-admin-wallet', ''))
$$;

create policy "Users can read own wallet profile"
  on public.users for select
  using (lower(wallet_address) = public.current_wallet_address());

create policy "Users can create own wallet profile"
  on public.users for insert
  with check (lower(wallet_address) = public.current_wallet_address());

create policy "Users can update own wallet profile"
  on public.users for update
  using (lower(wallet_address) = public.current_wallet_address())
  with check (lower(wallet_address) = public.current_wallet_address());

create policy "Users can read own allocations"
  on public.allocations for select
  using (
    exists (
      select 1
      from public.users
      where users.id = allocations.user_id
        and lower(users.wallet_address) = public.current_wallet_address()
    )
  );

create policy "Users can create own allocations"
  on public.allocations for insert
  with check (
    exists (
      select 1
      from public.users
      where users.id = allocations.user_id
        and lower(users.wallet_address) = public.current_wallet_address()
    )
  );

create policy "Users can read own transactions"
  on public.transactions for select
  using (
    exists (
      select 1
      from public.users
      where users.id = transactions.user_id
        and lower(users.wallet_address) = public.current_wallet_address()
    )
  );

create policy "Users can create own transactions"
  on public.transactions for insert
  with check (
    exists (
      select 1
      from public.users
      where users.id = transactions.user_id
        and lower(users.wallet_address) = public.current_wallet_address()
    )
  );

create policy "Users can update own transactions"
  on public.transactions for update
  using (
    exists (
      select 1
      from public.users
      where users.id = transactions.user_id
        and lower(users.wallet_address) = public.current_wallet_address()
    )
  )
  with check (
    exists (
      select 1
      from public.users
      where users.id = transactions.user_id
        and lower(users.wallet_address) = public.current_wallet_address()
    )
  );

create policy "Admin wallets can read users"
  on public.users for select
  using (public.is_admin_wallet());

create policy "Admin wallets can read allocations"
  on public.allocations for select
  using (public.is_admin_wallet());

create policy "Admin wallets can read transactions"
  on public.transactions for select
  using (public.is_admin_wallet());

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

create policy "Admin wallets can read rewards"
  on public.rewards for select
  using (public.is_admin_wallet());
