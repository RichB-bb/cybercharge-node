create table if not exists public.withdrawal_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  wallet_address text not null,
  amount numeric not null,
  asset text not null default 'USDT',
  network text not null default 'Ethereum',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'paid')),
  payout_tx_hash text,
  admin_note text,
  requested_at timestamptz default now(),
  reviewed_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists withdrawal_requests_user_id_created_at_idx
  on public.withdrawal_requests (user_id, created_at desc);

create index if not exists withdrawal_requests_wallet_address_idx
  on public.withdrawal_requests (lower(wallet_address));

alter table public.withdrawal_requests enable row level security;

drop policy if exists "Users can read own withdrawal requests" on public.withdrawal_requests;
drop policy if exists "Users can create own withdrawal requests" on public.withdrawal_requests;
drop policy if exists "Admin wallets can read withdrawal requests" on public.withdrawal_requests;

create policy "Users can read own withdrawal requests"
  on public.withdrawal_requests for select
  using (
    exists (
      select 1
      from public.users
      where users.id = withdrawal_requests.user_id
        and lower(users.wallet_address) = public.current_wallet_address()
    )
  );

create policy "Users can create own withdrawal requests"
  on public.withdrawal_requests for insert
  with check (
    exists (
      select 1
      from public.users
      where users.id = withdrawal_requests.user_id
        and lower(users.wallet_address) = public.current_wallet_address()
    )
  );

create policy "Admin wallets can read withdrawal requests"
  on public.withdrawal_requests for select
  using (public.is_admin_wallet());

grant select, insert on public.withdrawal_requests to anon, authenticated;

notify pgrst, 'reload schema';
