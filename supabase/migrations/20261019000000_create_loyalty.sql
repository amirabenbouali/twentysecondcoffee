create extension if not exists pgcrypto;

create table if not exists public.loyalty_members (
  id uuid primary key default gen_random_uuid(),
  public_code text not null unique,
  member_code text not null unique,
  first_name text not null check (char_length(first_name) between 2 and 40),
  email text not null unique,
  beans integer not null default 0 check (beans between 0 and 8),
  rewards_available integer not null default 0 check (rewards_available >= 0),
  marketing_consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.loyalty_activity (
  id bigint generated always as identity primary key,
  member_id uuid not null references public.loyalty_members(id) on delete cascade,
  action text not null check (action in ('stamp', 'redeem', 'undo')),
  before_beans integer not null,
  before_rewards integer not null,
  after_beans integer not null,
  after_rewards integer not null,
  reverted_activity_id bigint references public.loyalty_activity(id),
  voided_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists loyalty_activity_member_created_idx
  on public.loyalty_activity (member_id, created_at desc);

alter table public.loyalty_members enable row level security;
alter table public.loyalty_activity enable row level security;

revoke all on public.loyalty_members from anon, authenticated;
revoke all on public.loyalty_activity from anon, authenticated;
grant select, insert, update on public.loyalty_members to service_role;
grant select, insert, update on public.loyalty_activity to service_role;
grant usage, select on sequence public.loyalty_activity_id_seq to service_role;

create or replace function public.set_loyalty_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists loyalty_members_set_updated_at on public.loyalty_members;
create trigger loyalty_members_set_updated_at
before update on public.loyalty_members
for each row execute function public.set_loyalty_updated_at();

create or replace function public.add_loyalty_bean(p_member_id uuid)
returns setof public.loyalty_members
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_member public.loyalty_members%rowtype;
  next_beans integer;
  next_rewards integer;
begin
  select * into current_member
  from public.loyalty_members
  where id = p_member_id
  for update;

  if not found then
    raise exception 'Member not found';
  end if;

  if current_member.beans = 8 then
    next_beans := 0;
    next_rewards := current_member.rewards_available + 1;
  else
    next_beans := current_member.beans + 1;
    next_rewards := current_member.rewards_available;
  end if;

  update public.loyalty_members
  set beans = next_beans, rewards_available = next_rewards
  where id = p_member_id;

  insert into public.loyalty_activity (
    member_id, action, before_beans, before_rewards, after_beans, after_rewards
  ) values (
    p_member_id, 'stamp', current_member.beans, current_member.rewards_available,
    next_beans, next_rewards
  );

  return query select * from public.loyalty_members where id = p_member_id;
end;
$$;

create or replace function public.redeem_loyalty_reward(p_member_id uuid)
returns setof public.loyalty_members
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_member public.loyalty_members%rowtype;
begin
  select * into current_member
  from public.loyalty_members
  where id = p_member_id
  for update;

  if not found then
    raise exception 'Member not found';
  end if;

  if current_member.rewards_available < 1 then
    raise exception 'No reward available';
  end if;

  update public.loyalty_members
  set rewards_available = rewards_available - 1
  where id = p_member_id;

  insert into public.loyalty_activity (
    member_id, action, before_beans, before_rewards, after_beans, after_rewards
  ) values (
    p_member_id, 'redeem', current_member.beans, current_member.rewards_available,
    current_member.beans, current_member.rewards_available - 1
  );

  return query select * from public.loyalty_members where id = p_member_id;
end;
$$;

create or replace function public.undo_last_loyalty_action(p_member_id uuid)
returns setof public.loyalty_members
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_member public.loyalty_members%rowtype;
  previous_activity public.loyalty_activity%rowtype;
begin
  select * into current_member
  from public.loyalty_members
  where id = p_member_id
  for update;

  if not found then
    raise exception 'Member not found';
  end if;

  select * into previous_activity
  from public.loyalty_activity
  where member_id = p_member_id
    and action in ('stamp', 'redeem')
    and voided_at is null
  order by created_at desc, id desc
  limit 1
  for update;

  if not found then
    raise exception 'No action available to undo';
  end if;

  update public.loyalty_members
  set beans = previous_activity.before_beans,
      rewards_available = previous_activity.before_rewards
  where id = p_member_id;

  update public.loyalty_activity
  set voided_at = now()
  where id = previous_activity.id;

  insert into public.loyalty_activity (
    member_id, action, before_beans, before_rewards, after_beans, after_rewards,
    reverted_activity_id
  ) values (
    p_member_id, 'undo', current_member.beans, current_member.rewards_available,
    previous_activity.before_beans, previous_activity.before_rewards,
    previous_activity.id
  );

  return query select * from public.loyalty_members where id = p_member_id;
end;
$$;

revoke all on function public.add_loyalty_bean(uuid) from public, anon, authenticated;
revoke all on function public.redeem_loyalty_reward(uuid) from public, anon, authenticated;
revoke all on function public.undo_last_loyalty_action(uuid) from public, anon, authenticated;
grant execute on function public.add_loyalty_bean(uuid) to service_role;
grant execute on function public.redeem_loyalty_reward(uuid) to service_role;
grant execute on function public.undo_last_loyalty_action(uuid) to service_role;
