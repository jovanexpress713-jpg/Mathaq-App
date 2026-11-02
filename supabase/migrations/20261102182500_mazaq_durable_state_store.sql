-- MAZAQ durable state storage for serverless deployments.
-- The service_role is the only API role granted access. Never expose its key to the browser.
create table if not exists public.mazaq_state (
  id text primary key check (id = 'primary'),
  payload jsonb not null,
  version bigint not null default 0 check (version >= 0),
  updated_at timestamptz not null default now()
);

alter table public.mazaq_state enable row level security;
revoke all on table public.mazaq_state from anon, authenticated;
grant all on table public.mazaq_state to service_role;

insert into public.mazaq_state (id, payload, version)
values ('primary', '{}'::jsonb, 0)
on conflict (id) do nothing;
