-- Stage 3 privacy migration. Review and test in staging before applying to
-- production. Existing marketing choices are preserved but explicitly marked
-- as legacy because their original wording and collection source are unknown.

alter table public.loyalty_members
  add column if not exists privacy_notice_version text,
  add column if not exists privacy_notice_seen_at timestamptz,
  add column if not exists marketing_consent_at timestamptz,
  add column if not exists marketing_consent_version text,
  add column if not exists marketing_consent_source text,
  add column if not exists marketing_withdrawn_at timestamptz;

update public.loyalty_members
set privacy_notice_version = 'legacy-unrecorded'
where privacy_notice_version is null;

update public.loyalty_members
set marketing_consent_at = coalesce(marketing_consent_at, created_at),
    marketing_consent_version = coalesce(marketing_consent_version, 'legacy-unrecorded'),
    marketing_consent_source = coalesce(marketing_consent_source, 'legacy-migration')
where marketing_consent = true;

alter table public.loyalty_members
  alter column privacy_notice_version set not null;

alter table public.loyalty_members
  drop constraint if exists loyalty_marketing_consent_metadata_check;

alter table public.loyalty_members
  add constraint loyalty_marketing_consent_metadata_check check (
    marketing_consent = false
    or (
      marketing_consent_at is not null
      and marketing_consent_version is not null
      and marketing_consent_source is not null
    )
  );

create table if not exists public.loyalty_consent_events (
  id bigint generated always as identity primary key,
  member_id uuid not null references public.loyalty_members(id) on delete cascade,
  consent_type text not null check (consent_type = 'email_marketing'),
  action text not null check (action in ('granted', 'withdrawn', 'legacy_recorded')),
  wording_version text not null check (char_length(wording_version) between 1 and 100),
  source text not null check (char_length(source) between 1 and 100),
  occurred_at timestamptz not null default now()
);

create index if not exists loyalty_consent_events_member_created_idx
  on public.loyalty_consent_events (member_id, occurred_at desc);

alter table public.loyalty_consent_events enable row level security;
revoke all on public.loyalty_consent_events from anon, authenticated;
grant select, insert on public.loyalty_consent_events to service_role;
grant usage, select on sequence public.loyalty_consent_events_id_seq to service_role;

insert into public.loyalty_consent_events (
  member_id,
  consent_type,
  action,
  wording_version,
  source,
  occurred_at
)
select
  member.id,
  'email_marketing',
  'legacy_recorded',
  'legacy-unrecorded',
  'legacy-migration',
  member.created_at
from public.loyalty_members member
where member.marketing_consent = true
  and not exists (
    select 1
    from public.loyalty_consent_events event
    where event.member_id = member.id
      and event.action = 'legacy_recorded'
  );

create or replace function public.register_loyalty_member(
  p_first_name text,
  p_email text,
  p_marketing_consent boolean,
  p_member_code text,
  p_public_code text,
  p_privacy_notice_version text,
  p_marketing_consent_version text,
  p_source text
)
returns setof public.loyalty_members
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_member public.loyalty_members%rowtype;
begin
  insert into public.loyalty_members (
    first_name,
    email,
    marketing_consent,
    member_code,
    public_code,
    privacy_notice_version,
    privacy_notice_seen_at,
    marketing_consent_at,
    marketing_consent_version,
    marketing_consent_source
  ) values (
    p_first_name,
    p_email,
    p_marketing_consent,
    p_member_code,
    p_public_code,
    p_privacy_notice_version,
    now(),
    case when p_marketing_consent then now() else null end,
    case when p_marketing_consent then p_marketing_consent_version else null end,
    case when p_marketing_consent then p_source else null end
  )
  returning * into new_member;

  if p_marketing_consent then
    insert into public.loyalty_consent_events (
      member_id,
      consent_type,
      action,
      wording_version,
      source
    ) values (
      new_member.id,
      'email_marketing',
      'granted',
      p_marketing_consent_version,
      p_source
    );
  end if;

  return next new_member;
end;
$$;

create or replace function public.withdraw_loyalty_marketing(
  p_member_id uuid,
  p_wording_version text,
  p_source text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  member_found boolean;
  was_consented boolean;
begin
  select true, marketing_consent
  into member_found, was_consented
  from public.loyalty_members
  where id = p_member_id
  for update;

  if not found then
    return false;
  end if;

  if was_consented then
    update public.loyalty_members
    set marketing_consent = false,
        marketing_withdrawn_at = now()
    where id = p_member_id;

    insert into public.loyalty_consent_events (
      member_id,
      consent_type,
      action,
      wording_version,
      source
    ) values (
      p_member_id,
      'email_marketing',
      'withdrawn',
      p_wording_version,
      p_source
    );
  end if;

  return member_found;
end;
$$;

create or replace function public.delete_loyalty_member(p_member_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleted_count integer;
begin
  delete from public.loyalty_members where id = p_member_id;
  get diagnostics deleted_count = row_count;
  return deleted_count = 1;
end;
$$;

revoke all on function public.register_loyalty_member(text, text, boolean, text, text, text, text, text) from public, anon, authenticated;
revoke all on function public.withdraw_loyalty_marketing(uuid, text, text) from public, anon, authenticated;
revoke all on function public.delete_loyalty_member(uuid) from public, anon, authenticated;
grant execute on function public.register_loyalty_member(text, text, boolean, text, text, text, text, text) to service_role;
grant execute on function public.withdraw_loyalty_marketing(uuid, text, text) to service_role;
grant execute on function public.delete_loyalty_member(uuid) to service_role;
