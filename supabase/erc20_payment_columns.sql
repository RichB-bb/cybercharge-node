alter table public.transactions
  add column if not exists token_contract text;

alter table public.transactions
  add column if not exists payment_type text not null default 'native';
