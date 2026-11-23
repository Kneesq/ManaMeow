-- ============================================================================
-- ManaMeow - Step 1: Supabase Database Schema, Functions, Triggers, RLS & Storage
-- Run this entire script once in Supabase SQL Editor.
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- 1. Core Tables
-- ----------------------------------------------------------------------------

-- 1.1 User profiles (1:1 with auth.users, unique username)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null check (char_length(trim(username)) between 2 and 32),
  created_at timestamptz not null default now()
);

create unique index if not exists profiles_username_lower_uidx
  on public.profiles (lower(trim(username)));

-- 1.2 Cats (main cat profile)
create table if not exists public.cats (
  id uuid primary key default gen_random_uuid(),
  primary_name text not null check (char_length(trim(primary_name)) between 1 and 60),
  avatar_url text not null check (char_length(trim(avatar_url)) > 0),
  category text check (category in ('stray', 'pet')),
  gender text check (gender in ('male', 'female', 'unknown')),
  note text,
  pixel_seed text,
  creator_id uuid references public.profiles(id) on delete set null,
  guest_name text check (guest_name is null or char_length(trim(guest_name)) <= 40),
  is_location_hidden boolean not null default false,
  public_lat double precision check (public_lat is null or (public_lat between -90 and 90)),
  public_lng double precision check (public_lng is null or (public_lng between -180 and 180)),
  merged_into_cat_id uuid references public.cats(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cats_no_self_merge check (merged_into_cat_id is null or merged_into_cat_id <> id)
);

create index if not exists cats_active_created_idx
  on public.cats (created_at desc)
  where merged_into_cat_id is null;

create index if not exists cats_creator_idx
  on public.cats (creator_id);

-- 1.3 Private exact locations for pets (strictly owner-only)
create table if not exists public.cat_private_locations (
  cat_id uuid primary key references public.cats(id) on delete cascade,
  creator_id uuid not null references public.profiles(id) on delete cascade,
  exact_lat double precision not null check (exact_lat between -90 and 90),
  exact_lng double precision not null check (exact_lng between -180 and 180),
  updated_at timestamptz not null default now()
);

-- 1.4 Public multi-naming slots (3 to 5 community names for stray cats)
create table if not exists public.cat_public_names (
  id uuid primary key default gen_random_uuid(),
  cat_id uuid not null references public.cats(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 40),
  created_by uuid references public.profiles(id) on delete set null,
  slot_order smallint not null check (slot_order between 1 and 5),
  created_at timestamptz not null default now(),
  unique (cat_id, slot_order)
);

create unique index if not exists cat_public_names_unique_name_uidx
  on public.cat_public_names (cat_id, lower(trim(name)));

-- 1.5 Private personal nicknames (visible only to the user)
create table if not exists public.cat_private_nicknames (
  user_id uuid not null references public.profiles(id) on delete cascade,
  cat_id uuid not null references public.cats(id) on delete cascade,
  nickname text not null check (char_length(trim(nickname)) between 1 and 40),
  updated_at timestamptz not null default now(),
  primary key (user_id, cat_id)
);

-- 1.6 Unified media & timeline events (Photos / Videos / Timeline)
create table if not exists public.cat_media_events (
  id uuid primary key default gen_random_uuid(),
  cat_id uuid not null references public.cats(id) on delete cascade,
  media_type text not null check (media_type in ('photo', 'video', 'sighting')),
  media_url text,
  caption text,
  uploader_id uuid references public.profiles(id) on delete set null,
  guest_name text check (guest_name is null or char_length(trim(guest_name)) <= 40),
  lat double precision check (lat is null or (lat between -90 and 90)),
  lng double precision check (lng is null or (lng between -180 and 180)),
  created_at timestamptz not null default now()
);

create index if not exists cat_media_timeline_idx
  on public.cat_media_events (cat_id, created_at desc);

create index if not exists cat_media_type_idx
  on public.cat_media_events (cat_id, media_type, created_at desc);

-- 1.7 User cat relations (Favorites & Following for personal pawprint library)
create table if not exists public.user_cat_relations (
  user_id uuid not null references public.profiles(id) on delete cascade,
  cat_id uuid not null references public.cats(id) on delete cascade,
  relation_type text not null check (relation_type in ('favorite', 'following')),
  created_at timestamptz not null default now(),
  primary key (user_id, cat_id, relation_type)
);

create index if not exists user_cat_relations_user_idx
  on public.user_cat_relations (user_id, relation_type, created_at desc);

-- 1.8 Duplicate cat merge requests (two-party mutual consent)
create table if not exists public.cat_merge_requests (
  id uuid primary key default gen_random_uuid(),
  target_cat_id uuid not null references public.cats(id) on delete cascade,
  source_cat_id uuid not null references public.cats(id) on delete cascade,
  requested_by uuid not null references public.profiles(id) on delete cascade,
  target_creator_approved boolean not null default false,
  source_creator_approved boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'merged', 'rejected')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  constraint cat_merge_distinct_cats check (target_cat_id <> source_cat_id)
);

create index if not exists cat_merge_requests_pending_idx
  on public.cat_merge_requests (status, created_at desc);

-- ----------------------------------------------------------------------------
-- 2. Functions & Triggers
-- ----------------------------------------------------------------------------

-- 2.1 Auto-create profile row on auth.users signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_username text;
begin
  v_username := nullif(trim(coalesce(new.raw_user_meta_data ->> 'username', '')), '');
  if v_username is null then
    v_username := 'meow_' || left(replace(new.id::text, '-', ''), 8);
  end if;

  insert into public.profiles (id, username)
  values (new.id, v_username)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2.2 Resolve email from username for minimal Username + Password login
create or replace function public.get_email_by_username(p_username text)
returns text
language sql
security definer
set search_path = public, auth
as $$
  select u.email
  from public.profiles p
  join auth.users u on u.id = p.id
  where lower(trim(p.username)) = lower(trim(p_username))
  limit 1;
$$;

grant execute on function public.get_email_by_username(text) to anon, authenticated;

-- 2.3 Coordinate obfuscation helper (random 200m - 500m offset for hidden pet locations)
create or replace function public.fuzz_coordinate(
  p_lat double precision,
  p_lng double precision,
  out fuzzed_lat double precision,
  out fuzzed_lng double precision
)
language plpgsql
volatile
as $$
declare
  v_dist_m double precision;
  v_angle double precision;
  v_dlat double precision;
  v_dlng double precision;
  v_cos_lat double precision;
begin
  if p_lat is null or p_lng is null then
    fuzzed_lat := p_lat;
    fuzzed_lng := p_lng;
    return;
  end if;

  v_dist_m := 200.0 + random() * 300.0; -- 200m to 500m
  v_angle := random() * 2.0 * pi();
  v_dlat := (v_dist_m * cos(v_angle)) / 111320.0;
  v_cos_lat := greatest(cos(radians(p_lat)), 0.01);
  v_dlng := (v_dist_m * sin(v_angle)) / (111320.0 * v_cos_lat);

  fuzzed_lat := greatest(-89.9, least(89.9, round((p_lat + v_dlat)::numeric, 5)::double precision));
  fuzzed_lng := greatest(-179.9, least(179.9, round((p_lng + v_dlng)::numeric, 5)::double precision));
end;
$$;

-- 2.4 Trigger on cats: updated_at + automatic fuzzing when pet hides exact location
create or replace function public.trg_cats_privacy_and_timestamp()
returns trigger
language plpgsql
as $$
declare
  v_fuzzed record;
begin
  new.updated_at := now();

  if new.category = 'pet'
     and new.is_location_hidden = true
     and new.public_lat is not null
     and new.public_lng is not null
     and (
       tg_op = 'INSERT'
       or old.is_location_hidden is distinct from new.is_location_hidden
       or old.public_lat is distinct from new.public_lat
       or old.public_lng is distinct from new.public_lng
     )
  then
    select * into v_fuzzed from public.fuzz_coordinate(new.public_lat, new.public_lng);
    new.public_lat := v_fuzzed.fuzzed_lat;
    new.public_lng := v_fuzzed.fuzzed_lng;
  end if;

  return new;
end;
$$;

drop trigger if exists cats_privacy_and_timestamp on public.cats;
create trigger cats_privacy_and_timestamp
  before insert or update on public.cats
  for each row execute function public.trg_cats_privacy_and_timestamp();

-- 2.5 Trigger on cat_media_events: fuzz sighting coordinates if parent cat hides exact location
create or replace function public.trg_cat_media_privacy()
returns trigger
language plpgsql
as $$
declare
  v_hidden boolean;
  v_fuzzed record;
begin
  if new.lat is not null and new.lng is not null then
    select (category = 'pet' and is_location_hidden)
      into v_hidden
      from public.cats
      where id = new.cat_id;

    if coalesce(v_hidden, false) then
      select * into v_fuzzed from public.fuzz_coordinate(new.lat, new.lng);
      new.lat := v_fuzzed.fuzzed_lat;
      new.lng := v_fuzzed.fuzzed_lng;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists cat_media_privacy on public.cat_media_events;
create trigger cat_media_privacy
  before insert on public.cat_media_events
  for each row execute function public.trg_cat_media_privacy();

-- 2.6 Enforce max 5 public names per cat
create or replace function public.trg_enforce_public_names_limit()
returns trigger
language plpgsql
as $$
declare
  v_count integer;
begin
  select count(*) into v_count
  from public.cat_public_names
  where cat_id = new.cat_id;

  if v_count >= 5 then
    raise exception 'A cat can have at most 5 public names';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_public_names_limit on public.cat_public_names;
create trigger enforce_public_names_limit
  before insert on public.cat_public_names
  for each row execute function public.trg_enforce_public_names_limit();

-- 2.7 Two-party mutual consent merge RPC
create or replace function public.confirm_cat_merge(
  p_request_id uuid,
  p_approve boolean default true
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_req public.cat_merge_requests%rowtype;
  v_target_creator uuid;
  v_source_creator uuid;
  v_is_target boolean := false;
  v_is_source boolean := false;
  v_next_slot smallint;
  v_name_rec record;
begin
  if v_uid is null then
    raise exception 'Authentication required';
  end if;

  select * into v_req
  from public.cat_merge_requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'Merge request not found';
  end if;

  if v_req.status <> 'pending' then
    return jsonb_build_object(
      'status', v_req.status,
      'target_creator_approved', v_req.target_creator_approved,
      'source_creator_approved', v_req.source_creator_approved
    );
  end if;

  select creator_id into v_target_creator from public.cats where id = v_req.target_cat_id;
  select creator_id into v_source_creator from public.cats where id = v_req.source_cat_id;

  v_is_target := (v_target_creator = v_uid);
  v_is_source := (v_source_creator = v_uid);

  if not v_is_target and not v_is_source then
    raise exception 'Only the original or duplicate cat creator can respond to this merge request';
  end if;

  if not p_approve then
    update public.cat_merge_requests
    set status = 'rejected', resolved_at = now()
    where id = p_request_id;

    return jsonb_build_object(
      'status', 'rejected',
      'target_creator_approved', v_req.target_creator_approved,
      'source_creator_approved', v_req.source_creator_approved
    );
  end if;

  if v_is_target then
    v_req.target_creator_approved := true;
  end if;
  if v_is_source then
    v_req.source_creator_approved := true;
  end if;

  if v_req.target_creator_approved and v_req.source_creator_approved then
    -- Migrate media & timeline events
    update public.cat_media_events
    set cat_id = v_req.target_cat_id
    where cat_id = v_req.source_cat_id;

    -- Migrate user relations without duplicates
    insert into public.user_cat_relations (user_id, cat_id, relation_type, created_at)
    select user_id, v_req.target_cat_id, relation_type, created_at
    from public.user_cat_relations
    where cat_id = v_req.source_cat_id
    on conflict do nothing;

    delete from public.user_cat_relations where cat_id = v_req.source_cat_id;

    -- Migrate private nicknames without overwriting existing ones on target
    insert into public.cat_private_nicknames (user_id, cat_id, nickname, updated_at)
    select user_id, v_req.target_cat_id, nickname, updated_at
    from public.cat_private_nicknames
    where cat_id = v_req.source_cat_id
    on conflict do nothing;

    -- Migrate up to remaining public name slots (max 5)
    for v_name_rec in
      select name, created_by
      from public.cat_public_names
      where cat_id = v_req.source_cat_id
      order by slot_order asc
    loop
      select coalesce(max(slot_order), 0) + 1 into v_next_slot
      from public.cat_public_names
      where cat_id = v_req.target_cat_id;

      exit when v_next_slot > 5;

      insert into public.cat_public_names (cat_id, name, created_by, slot_order)
      values (v_req.target_cat_id, v_name_rec.name, v_name_rec.created_by, v_next_slot)
      on conflict do nothing;
    end loop;

    -- Mark source cat as merged
    update public.cats
    set merged_into_cat_id = v_req.target_cat_id
    where id = v_req.source_cat_id;

    update public.cat_merge_requests
    set target_creator_approved = true,
        source_creator_approved = true,
        status = 'merged',
        resolved_at = now()
    where id = p_request_id;

    return jsonb_build_object(
      'status', 'merged',
      'target_creator_approved', true,
      'source_creator_approved', true
    );
  end if;

  update public.cat_merge_requests
  set target_creator_approved = v_req.target_creator_approved,
      source_creator_approved = v_req.source_creator_approved
  where id = p_request_id;

  return jsonb_build_object(
    'status', 'pending',
    'target_creator_approved', v_req.target_creator_approved,
    'source_creator_approved', v_req.source_creator_approved
  );
end;
$$;

grant execute on function public.confirm_cat_merge(uuid, boolean) to authenticated;

-- ----------------------------------------------------------------------------
-- 3. Row Level Security (RLS) Policies
-- ----------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.cats enable row level security;
alter table public.cat_private_locations enable row level security;
alter table public.cat_public_names enable row level security;
alter table public.cat_private_nicknames enable row level security;
alter table public.cat_media_events enable row level security;
alter table public.user_cat_relations enable row level security;
alter table public.cat_merge_requests enable row level security;

-- 3.1 profiles
drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all"
  on public.profiles for select
  to anon, authenticated
  using (true);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 3.2 cats
drop policy if exists "cats_select_active" on public.cats;
create policy "cats_select_active"
  on public.cats for select
  to anon, authenticated
  using (merged_into_cat_id is null or auth.uid() = creator_id);

drop policy if exists "cats_insert_guest_or_user" on public.cats;
create policy "cats_insert_guest_or_user"
  on public.cats for insert
  to anon, authenticated
  with check (
    (auth.uid() is null and creator_id is null)
    or (auth.uid() is not null and creator_id = auth.uid())
  );

drop policy if exists "cats_update_creator_only" on public.cats;
create policy "cats_update_creator_only"
  on public.cats for update
  to authenticated
  using (auth.uid() = creator_id)
  with check (auth.uid() = creator_id);

drop policy if exists "cats_delete_creator_only" on public.cats;
create policy "cats_delete_creator_only"
  on public.cats for delete
  to authenticated
  using (auth.uid() = creator_id);

-- 3.3 cat_private_locations (strictly pet owner only)
drop policy if exists "cat_private_locations_owner_all" on public.cat_private_locations;
create policy "cat_private_locations_owner_all"
  on public.cat_private_locations for all
  to authenticated
  using (auth.uid() = creator_id)
  with check (
    auth.uid() = creator_id
    and exists (
      select 1 from public.cats c
      where c.id = cat_id and c.creator_id = auth.uid()
    )
  );

-- 3.4 cat_public_names (stray: any authenticated user; pet: owner only)
drop policy if exists "cat_public_names_select_all" on public.cat_public_names;
create policy "cat_public_names_select_all"
  on public.cat_public_names for select
  to anon, authenticated
  using (true);

drop policy if exists "cat_public_names_insert_stray_or_owner" on public.cat_public_names;
create policy "cat_public_names_insert_stray_or_owner"
  on public.cat_public_names for insert
  to authenticated
  with check (
    created_by = auth.uid()
    and exists (
      select 1 from public.cats c
      where c.id = cat_id
        and c.merged_into_cat_id is null
        and (c.category is distinct from 'pet' or c.creator_id = auth.uid())
    )
  );

drop policy if exists "cat_public_names_update_owner_or_author" on public.cat_public_names;
create policy "cat_public_names_update_owner_or_author"
  on public.cat_public_names for update
  to authenticated
  using (
    exists (
      select 1 from public.cats c
      where c.id = cat_id
        and (
          c.creator_id = auth.uid()
          or (c.category is distinct from 'pet' and created_by = auth.uid())
        )
    )
  );

drop policy if exists "cat_public_names_delete_owner_or_author" on public.cat_public_names;
create policy "cat_public_names_delete_owner_or_author"
  on public.cat_public_names for delete
  to authenticated
  using (
    exists (
      select 1 from public.cats c
      where c.id = cat_id
        and (
          c.creator_id = auth.uid()
          or (c.category is distinct from 'pet' and created_by = auth.uid())
        )
    )
  );

-- 3.5 cat_private_nicknames (strictly self-only)
drop policy if exists "cat_private_nicknames_self_all" on public.cat_private_nicknames;
create policy "cat_private_nicknames_self_all"
  on public.cat_private_nicknames for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 3.6 cat_media_events (guest & user upload; uploader can delete own)
drop policy if exists "cat_media_events_select_all" on public.cat_media_events;
create policy "cat_media_events_select_all"
  on public.cat_media_events for select
  to anon, authenticated
  using (true);

drop policy if exists "cat_media_events_insert_guest_or_user" on public.cat_media_events;
create policy "cat_media_events_insert_guest_or_user"
  on public.cat_media_events for insert
  to anon, authenticated
  with check (
    (auth.uid() is null and uploader_id is null)
    or (auth.uid() is not null and uploader_id = auth.uid())
  );

drop policy if exists "cat_media_events_delete_own" on public.cat_media_events;
create policy "cat_media_events_delete_own"
  on public.cat_media_events for delete
  to authenticated
  using (auth.uid() = uploader_id);

-- 3.7 user_cat_relations (strictly self-only)
drop policy if exists "user_cat_relations_self_all" on public.user_cat_relations;
create policy "user_cat_relations_self_all"
  on public.user_cat_relations for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 3.8 cat_merge_requests
drop policy if exists "cat_merge_requests_select_all" on public.cat_merge_requests;
create policy "cat_merge_requests_select_all"
  on public.cat_merge_requests for select
  to anon, authenticated
  using (true);

drop policy if exists "cat_merge_requests_insert_auth" on public.cat_merge_requests;
create policy "cat_merge_requests_insert_auth"
  on public.cat_merge_requests for insert
  to authenticated
  with check (
    auth.uid() = requested_by
    and status = 'pending'
  );

-- ----------------------------------------------------------------------------
-- 4. Supabase Storage Bucket & Policies (cat-media)
-- ----------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cat-media',
  'cat-media',
  true,
  52428800, -- 50 MB max (photos <= 10MB enforced on client; videos <= 50MB)
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "cat_media_public_read" on storage.objects;
create policy "cat_media_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'cat-media');

drop policy if exists "cat_media_upload_photos_videos" on storage.objects;
create policy "cat_media_upload_photos_videos"
  on storage.objects for insert
  to anon, authenticated
  with check (
    bucket_id = 'cat-media'
    and (storage.foldername(name))[1] in ('photos', 'videos')
  );

drop policy if exists "cat_media_delete_own" on storage.objects;
create policy "cat_media_delete_own"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'cat-media' and owner = auth.uid());
