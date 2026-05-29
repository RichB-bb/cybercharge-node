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

notify pgrst, 'reload schema';
