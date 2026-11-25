-- Stage 4 loyalty production-readiness migration.
-- Apply only to a non-production project until the complete staging test plan
-- has passed. This migration deliberately creates no staff users.

do $$
begin
  if exists (
    select 1
    from public.loyalty_members
    group by lower(trim(email))
    having count(*) > 1
  ) then
    raise exception 'NORMALIZED_EMAIL_DUPLICATES_EXIST';
  end if;
end;
$$;

update public.loyalty_members set email = lower(trim(email));
create unique index if not exists loyalty_members_email_normalized_idx
  on public.loyalty_members (lower(email));

create table if not exists public.loyalty_staff (
  id uuid primary key default gen_random_uuid(),
  username text not null check (
    username = lower(username)
    and username ~ '^[a-z0-9][a-z0-9._-]{2,49}$'
  ),
  display_name text not null check (char_length(display_name) between 2 and 80),
  role text not null check (role in ('barista', 'manager')),
  password_hash text not null check (char_length(password_hash) between 80 and 300),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz
);

create unique index if not exists loyalty_staff_username_idx
  on public.loyalty_staff (lower(username));

create table if not exists public.loyalty_staff_sessions (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.loyalty_staff(id) on delete cascade,
  token_hash text not null unique check (token_hash ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  last_seen_at timestamptz not null default now(),
  revoked_at timestamptz,
  check (expires_at > created_at)
);

create index if not exists loyalty_staff_sessions_staff_idx
  on public.loyalty_staff_sessions (staff_id, expires_at desc);
create index if not exists loyalty_staff_sessions_active_idx
  on public.loyalty_staff_sessions (token_hash, expires_at)
  where revoked_at is null;

alter table public.loyalty_activity
  add column if not exists staff_id uuid references public.loyalty_staff(id),
  add column if not exists idempotency_key uuid,
  add column if not exists request_source text;

create unique index if not exists loyalty_activity_idempotency_idx
  on public.loyalty_activity (idempotency_key)
  where idempotency_key is not null;
create index if not exists loyalty_activity_staff_created_idx
  on public.loyalty_activity (staff_id, created_at desc);

create table if not exists public.loyalty_wallet_sync_queue (
  member_id uuid primary key references public.loyalty_members(id) on delete cascade,
  attempts integer not null default 0 check (attempts between 0 and 20),
  available_at timestamptz not null default now(),
  locked_until timestamptz,
  last_error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists loyalty_wallet_sync_due_idx
  on public.loyalty_wallet_sync_queue (available_at, updated_at);

alter table public.loyalty_staff enable row level security;
alter table public.loyalty_staff_sessions enable row level security;
alter table public.loyalty_wallet_sync_queue enable row level security;

revoke all on public.loyalty_staff from anon, authenticated;
revoke all on public.loyalty_staff_sessions from anon, authenticated;
revoke all on public.loyalty_wallet_sync_queue from anon, authenticated;
grant select, insert, update, delete on public.loyalty_staff to service_role;
grant select, insert, update, delete on public.loyalty_staff_sessions to service_role;
grant select, insert, update, delete on public.loyalty_wallet_sync_queue to service_role;

drop trigger if exists loyalty_staff_set_updated_at on public.loyalty_staff;
create trigger loyalty_staff_set_updated_at
before update on public.loyalty_staff
for each row execute function public.set_loyalty_updated_at();

create or replace function public.loyalty_staff_can(
  p_staff_id uuid,
  p_permission text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.loyalty_staff
    where id = p_staff_id
      and active = true
      and (
        role = 'manager'
        or (role = 'barista' and p_permission in ('member:read', 'stamp', 'redeem'))
      )
  );
$$;

create or replace function public.queue_loyalty_wallet_sync(p_member_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.loyalty_wallet_sync_queue (
    member_id, attempts, available_at, locked_until, last_error_code, updated_at
  ) values (
    p_member_id, 0, now(), null, null, now()
  )
  on conflict (member_id) do update
  set attempts = 0,
      available_at = now(),
      locked_until = null,
      last_error_code = null,
      updated_at = now();
$$;

drop function if exists public.add_loyalty_bean(uuid);
drop function if exists public.redeem_loyalty_reward(uuid);
drop function if exists public.undo_last_loyalty_action(uuid);

create or replace function public.add_loyalty_bean(
  p_member_id uuid,
  p_staff_id uuid,
  p_idempotency_key uuid,
  p_request_source text
)
returns setof public.loyalty_members
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_member public.loyalty_members%rowtype;
  existing_activity public.loyalty_activity%rowtype;
  next_beans integer;
  next_rewards integer;
begin
  if not public.loyalty_staff_can(p_staff_id, 'stamp') then
    raise exception 'STAFF_FORBIDDEN';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_idempotency_key::text, 0));
  select * into existing_activity
  from public.loyalty_activity
  where idempotency_key = p_idempotency_key;

  if found then
    if existing_activity.member_id <> p_member_id or existing_activity.action <> 'stamp' then
      raise exception 'IDEMPOTENCY_CONFLICT';
    end if;
    return query select * from public.loyalty_members where id = p_member_id;
    return;
  end if;

  select * into current_member
  from public.loyalty_members
  where id = p_member_id
  for update;

  if not found then raise exception 'MEMBER_NOT_FOUND'; end if;

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
    member_id, staff_id, action, before_beans, before_rewards,
    after_beans, after_rewards, idempotency_key, request_source
  ) values (
    p_member_id, p_staff_id, 'stamp', current_member.beans,
    current_member.rewards_available, next_beans, next_rewards,
    p_idempotency_key, left(coalesce(p_request_source, 'staff_desk'), 80)
  );

  perform public.queue_loyalty_wallet_sync(p_member_id);
  return query select * from public.loyalty_members where id = p_member_id;
end;
$$;

create or replace function public.redeem_loyalty_reward(
  p_member_id uuid,
  p_staff_id uuid,
  p_idempotency_key uuid,
  p_request_source text
)
returns setof public.loyalty_members
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_member public.loyalty_members%rowtype;
  existing_activity public.loyalty_activity%rowtype;
begin
  if not public.loyalty_staff_can(p_staff_id, 'redeem') then
    raise exception 'STAFF_FORBIDDEN';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_idempotency_key::text, 0));
  select * into existing_activity
  from public.loyalty_activity
  where idempotency_key = p_idempotency_key;

  if found then
    if existing_activity.member_id <> p_member_id or existing_activity.action <> 'redeem' then
      raise exception 'IDEMPOTENCY_CONFLICT';
    end if;
    return query select * from public.loyalty_members where id = p_member_id;
    return;
  end if;

  select * into current_member
  from public.loyalty_members
  where id = p_member_id
  for update;

  if not found then raise exception 'MEMBER_NOT_FOUND'; end if;
  if current_member.rewards_available < 1 then raise exception 'NO_REWARD_AVAILABLE'; end if;

  update public.loyalty_members
  set rewards_available = rewards_available - 1
  where id = p_member_id;

  insert into public.loyalty_activity (
    member_id, staff_id, action, before_beans, before_rewards,
    after_beans, after_rewards, idempotency_key, request_source
  ) values (
    p_member_id, p_staff_id, 'redeem', current_member.beans,
    current_member.rewards_available, current_member.beans,
    current_member.rewards_available - 1, p_idempotency_key,
    left(coalesce(p_request_source, 'staff_desk'), 80)
  );

  perform public.queue_loyalty_wallet_sync(p_member_id);
  return query select * from public.loyalty_members where id = p_member_id;
end;
$$;

create or replace function public.undo_last_loyalty_action(
  p_member_id uuid,
  p_staff_id uuid,
  p_idempotency_key uuid,
  p_request_source text
)
returns setof public.loyalty_members
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_member public.loyalty_members%rowtype;
  previous_activity public.loyalty_activity%rowtype;
  existing_activity public.loyalty_activity%rowtype;
begin
  if not public.loyalty_staff_can(p_staff_id, 'undo') then
    raise exception 'STAFF_FORBIDDEN';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_idempotency_key::text, 0));
  select * into existing_activity
  from public.loyalty_activity
  where idempotency_key = p_idempotency_key;

  if found then
    if existing_activity.member_id <> p_member_id or existing_activity.action <> 'undo' then
      raise exception 'IDEMPOTENCY_CONFLICT';
    end if;
    return query select * from public.loyalty_members where id = p_member_id;
    return;
  end if;

  select * into current_member
  from public.loyalty_members
  where id = p_member_id
  for update;

  if not found then raise exception 'MEMBER_NOT_FOUND'; end if;

  select * into previous_activity
  from public.loyalty_activity
  where member_id = p_member_id
    and action in ('stamp', 'redeem')
    and voided_at is null
  order by created_at desc, id desc
  limit 1
  for update;

  if not found then raise exception 'NO_ACTION_TO_UNDO'; end if;

  update public.loyalty_members
  set beans = previous_activity.before_beans,
      rewards_available = previous_activity.before_rewards
  where id = p_member_id;

  update public.loyalty_activity
  set voided_at = now()
  where id = previous_activity.id;

  insert into public.loyalty_activity (
    member_id, staff_id, action, before_beans, before_rewards,
    after_beans, after_rewards, reverted_activity_id,
    idempotency_key, request_source
  ) values (
    p_member_id, p_staff_id, 'undo', current_member.beans,
    current_member.rewards_available, previous_activity.before_beans,
    previous_activity.before_rewards, previous_activity.id,
    p_idempotency_key, left(coalesce(p_request_source, 'staff_desk'), 80)
  );

  perform public.queue_loyalty_wallet_sync(p_member_id);
  return query select * from public.loyalty_members where id = p_member_id;
end;
$$;

create or replace function public.search_loyalty_members(
  p_staff_id uuid,
  p_query text default null,
  p_limit integer default 26,
  p_cursor_updated_at timestamptz default null,
  p_cursor_id uuid default null
)
returns setof public.loyalty_members
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.loyalty_staff_can(p_staff_id, 'member:read') then
    raise exception 'STAFF_FORBIDDEN';
  end if;

  return query
  select member.*
  from public.loyalty_members member
  where (
    nullif(trim(p_query), '') is null
    or member.first_name ilike '%' || trim(p_query) || '%'
    or member.email ilike '%' || trim(p_query) || '%'
    or member.member_code ilike '%' || trim(p_query) || '%'
  )
  and (
    p_cursor_updated_at is null
    or p_cursor_id is null
    or (member.updated_at, member.id) < (p_cursor_updated_at, p_cursor_id)
  )
  order by member.updated_at desc, member.id desc
  limit least(greatest(p_limit, 1), 51);
end;
$$;

create or replace function public.lookup_loyalty_member(
  p_staff_id uuid,
  p_code text
)
returns setof public.loyalty_members
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  normalized_code text := trim(p_code);
begin
  if not public.loyalty_staff_can(p_staff_id, 'member:read') then
    raise exception 'STAFF_FORBIDDEN';
  end if;

  if normalized_code like 'TSC:%' then
    normalized_code := substring(normalized_code from 5);
  end if;

  return query
  select member.*
  from public.loyalty_members member
  where member.public_code = normalized_code
     or upper(member.member_code) = upper(normalized_code)
  limit 1;
end;
$$;

create or replace function public.list_loyalty_activity(
  p_staff_id uuid,
  p_member_id uuid,
  p_limit integer default 30
)
returns table (
  id bigint,
  action text,
  before_beans integer,
  before_rewards integer,
  after_beans integer,
  after_rewards integer,
  voided_at timestamptz,
  created_at timestamptz,
  staff_display_name text,
  request_source text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.loyalty_staff_can(p_staff_id, 'audit:read') then
    raise exception 'STAFF_FORBIDDEN';
  end if;

  return query
  select activity.id, activity.action, activity.before_beans,
    activity.before_rewards, activity.after_beans, activity.after_rewards,
    activity.voided_at, activity.created_at,
    coalesce(staff.display_name, 'Legacy or removed staff'), activity.request_source
  from public.loyalty_activity activity
  left join public.loyalty_staff staff on staff.id = activity.staff_id
  where activity.member_id = p_member_id
  order by activity.created_at desc, activity.id desc
  limit least(greatest(p_limit, 1), 100);
end;
$$;

create or replace function public.claim_loyalty_wallet_sync_jobs(p_limit integer default 20)
returns table (
  member_id uuid,
  public_code text,
  member_code text,
  first_name text,
  beans integer,
  rewards_available integer,
  attempts integer
)
language sql
security definer
set search_path = ''
as $$
  with claimed as (
    select queue.member_id
    from public.loyalty_wallet_sync_queue queue
    where queue.available_at <= now()
      and (queue.locked_until is null or queue.locked_until < now())
      and queue.attempts < 20
    order by queue.available_at, queue.updated_at
    limit least(greatest(p_limit, 1), 50)
    for update skip locked
  ), updated as (
    update public.loyalty_wallet_sync_queue queue
    set locked_until = now() + interval '5 minutes', updated_at = now()
    from claimed
    where queue.member_id = claimed.member_id
    returning queue.member_id, queue.attempts
  )
  select member.id, member.public_code, member.member_code, member.first_name,
    member.beans, member.rewards_available, updated.attempts
  from updated
  join public.loyalty_members member on member.id = updated.member_id;
$$;

create or replace function public.complete_loyalty_wallet_sync(p_member_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.loyalty_wallet_sync_queue where member_id = p_member_id;
$$;

create or replace function public.retry_loyalty_wallet_sync(
  p_member_id uuid,
  p_error_code text
)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.loyalty_wallet_sync_queue
  set attempts = least(attempts + 1, 20),
      available_at = now() + case
        when attempts < 1 then interval '30 seconds'
        when attempts < 2 then interval '2 minutes'
        when attempts < 4 then interval '10 minutes'
        else interval '1 hour'
      end,
      locked_until = null,
      last_error_code = left(coalesce(p_error_code, 'unknown'), 80),
      updated_at = now()
  where member_id = p_member_id;
$$;

revoke all on function public.loyalty_staff_can(uuid, text) from public, anon, authenticated;
revoke all on function public.queue_loyalty_wallet_sync(uuid) from public, anon, authenticated;
revoke all on function public.add_loyalty_bean(uuid, uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.redeem_loyalty_reward(uuid, uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.undo_last_loyalty_action(uuid, uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.search_loyalty_members(uuid, text, integer, timestamptz, uuid) from public, anon, authenticated;
revoke all on function public.lookup_loyalty_member(uuid, text) from public, anon, authenticated;
revoke all on function public.list_loyalty_activity(uuid, uuid, integer) from public, anon, authenticated;
revoke all on function public.claim_loyalty_wallet_sync_jobs(integer) from public, anon, authenticated;
revoke all on function public.complete_loyalty_wallet_sync(uuid) from public, anon, authenticated;
revoke all on function public.retry_loyalty_wallet_sync(uuid, text) from public, anon, authenticated;

grant execute on function public.loyalty_staff_can(uuid, text) to service_role;
grant execute on function public.queue_loyalty_wallet_sync(uuid) to service_role;
grant execute on function public.add_loyalty_bean(uuid, uuid, uuid, text) to service_role;
grant execute on function public.redeem_loyalty_reward(uuid, uuid, uuid, text) to service_role;
grant execute on function public.undo_last_loyalty_action(uuid, uuid, uuid, text) to service_role;
grant execute on function public.search_loyalty_members(uuid, text, integer, timestamptz, uuid) to service_role;
grant execute on function public.lookup_loyalty_member(uuid, text) to service_role;
grant execute on function public.list_loyalty_activity(uuid, uuid, integer) to service_role;
grant execute on function public.claim_loyalty_wallet_sync_jobs(integer) to service_role;
grant execute on function public.complete_loyalty_wallet_sync(uuid) to service_role;
grant execute on function public.retry_loyalty_wallet_sync(uuid, text) to service_role;
