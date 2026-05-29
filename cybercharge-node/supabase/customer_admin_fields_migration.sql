alter table public.users
  add column if not exists admin_status text not null default 'normal';

alter table public.users
  add column if not exists admin_note text;

notify pgrst, 'reload schema';
