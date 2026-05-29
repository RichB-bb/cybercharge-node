alter table public.users enable row level security;
alter table public.allocations enable row level security;
alter table public.transactions enable row level security;

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

drop policy if exists "Allow public MVP user reads" on public.users;
drop policy if exists "Allow public MVP user inserts" on public.users;
drop policy if exists "Allow public MVP allocation reads" on public.allocations;
drop policy if exists "Allow public MVP allocation inserts" on public.allocations;
drop policy if exists "Allow public MVP transaction reads" on public.transactions;
drop policy if exists "Allow public MVP transaction inserts" on public.transactions;
drop policy if exists "Allow public MVP transaction updates" on public.transactions;

drop policy if exists "Users can read own wallet profile" on public.users;
drop policy if exists "Users can create own wallet profile" on public.users;
drop policy if exists "Users can update own wallet profile" on public.users;
drop policy if exists "Users can read own allocations" on public.allocations;
drop policy if exists "Users can create own allocations" on public.allocations;
drop policy if exists "Users can read own transactions" on public.transactions;
drop policy if exists "Users can create own transactions" on public.transactions;
drop policy if exists "Users can update own transactions" on public.transactions;
drop policy if exists "Admin wallets can read users" on public.users;
drop policy if exists "Admin wallets can read allocations" on public.allocations;
drop policy if exists "Admin wallets can read transactions" on public.transactions;

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
