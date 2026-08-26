-- WareSnap — Supabase schema (SPEC.md §11)
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  full_name text not null default '',
  plan text not null default 'free'
    check (plan in ('free', 'starter', 'seller', 'pro')),
  billing_cycle text not null default 'monthly'
    check (billing_cycle in ('monthly', 'yearly')),
  tokens_subscription int not null default 25,
  tokens_purchased int not null default 0,
  renews_on timestamptz not null default (now() + interval '1 month'),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create table public.token_ledger (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users on delete cascade,
  delta int not null,
  reason text not null
    check (reason in ('signup_bonus', 'tool_run', 'pack_purchase', 'plan_change')),
  tool text,
  created_at timestamptz not null default now()
);

alter table public.token_ledger enable row level security;

create policy "Users read own ledger"
  on public.token_ledger for select
  using (auth.uid() = user_id);

-- New auth.users row -> profile + signup bonus ledger entry, in one transaction.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, tokens_subscription, renews_on)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    25,
    now() + interval '1 month'
  );

  insert into public.token_ledger (user_id, delta, reason, tool)
  values (new.id, 25, 'signup_bonus', null);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Atomic spend: subscription bucket first, then purchased. Takes the user id
-- as a parameter rather than auth.uid() because it is only ever called from
-- the Next.js server with the service_role key, after the app has already
-- authenticated the caller against its own session cookie — see
-- lib/auth/supabase.ts. Execute is revoked from anon/authenticated below so
-- the publishable key can never reach it directly.
create function public.spend_tokens(
  p_user_id uuid,
  p_cost int,
  p_reason text,
  p_tool text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sub int;
  v_purchased int;
  v_from_sub int;
  v_balance int;
begin
  select tokens_subscription, tokens_purchased
    into v_sub, v_purchased
    from public.profiles
    where id = p_user_id
    for update;

  if not found then
    raise exception 'user_not_found';
  end if;

  if v_sub + v_purchased < p_cost then
    return jsonb_build_object(
      'ok', false,
      'error', 'insufficient_tokens',
      'needed', p_cost - (v_sub + v_purchased)
    );
  end if;

  v_from_sub := least(v_sub, p_cost);

  update public.profiles
    set tokens_subscription = tokens_subscription - v_from_sub,
        tokens_purchased = tokens_purchased - (p_cost - v_from_sub)
    where id = p_user_id;

  insert into public.token_ledger (user_id, delta, reason, tool)
  values (p_user_id, -p_cost, p_reason, p_tool);

  select tokens_subscription + tokens_purchased into v_balance
    from public.profiles where id = p_user_id;

  return jsonb_build_object('ok', true, 'balance', v_balance);
end;
$$;

-- `from public` alone is not enough — Supabase's default privileges grant
-- EXECUTE to anon/authenticated directly (not merely via PUBLIC), so each
-- has to be named here or the publishable key can call this directly and
-- spend or fabricate ledger entries for an arbitrary user_id.
revoke execute on function public.spend_tokens(uuid, int, text, text)
  from public, anon, authenticated;
grant execute on function public.spend_tokens(uuid, int, text, text) to service_role;
