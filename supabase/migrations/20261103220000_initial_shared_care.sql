create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  created_at timestamptz not null default now()
);

create table public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 80),
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now()
);

create table public.family_memberships (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('owner', 'caregiver')),
  status text not null default 'active' check (status in ('active', 'revoked')),
  created_at timestamptz not null default now(),
  unique (family_id, user_id),
  unique (id, family_id)
);

create table public.family_children (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  nickname text not null default '',
  age smallint not null,
  goals text[] not null default '{}',
  other_goal text not null default '',
  created_at timestamptz not null default now(),
  unique (id, family_id)
);

create table public.family_member_child_permissions (
  membership_id uuid not null,
  family_id uuid not null,
  child_id uuid not null,
  can_view_guide boolean not null default false,
  can_view_plan boolean not null default false,
  can_view_toolkit boolean not null default false,
  can_view_updates boolean not null default false,
  can_view_requests boolean not null default false,
  primary key (membership_id, child_id),
  foreign key (membership_id, family_id)
    references public.family_memberships (id, family_id) on delete cascade,
  foreign key (child_id, family_id)
    references public.family_children (id, family_id) on delete cascade
);

create table public.child_care_guides (
  child_id uuid primary key references public.family_children (id) on delete cascade,
  needs text not null default '',
  what_helps text not null default '',
  calming_strategies text not null default '',
  easy_game text not null default '',
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id)
);

create table public.care_blocks (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.family_children (id) on delete cascade,
  care_date date not null,
  starts_at time not null,
  title text not null check (length(trim(title)) between 1 and 100),
  details text not null default '',
  assigned_to uuid references auth.users (id) on delete set null,
  created_by uuid not null default auth.uid() references auth.users (id),
  created_at timestamptz not null default now()
);

create table public.handoff_updates (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.family_children (id) on delete cascade,
  kind text not null default 'Handoff note'
    check (kind in ('Handoff note', 'What helped', 'Heads-up')),
  body text not null check (length(trim(body)) between 1 and 500),
  created_by uuid not null default auth.uid() references auth.users (id),
  created_at timestamptz not null default now()
);

create table public.help_requests (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.family_children (id) on delete cascade,
  body text not null check (length(trim(body)) between 1 and 300),
  needed_by time,
  assigned_to uuid references auth.users (id) on delete set null,
  status text not null default 'open' check (status in ('open', 'accepted', 'completed', 'cancelled')),
  created_by uuid not null default auth.uid() references auth.users (id),
  accepted_by uuid references auth.users (id),
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  check (status not in ('accepted', 'completed') or accepted_by is not null),
  check ((accepted_by is null) = (accepted_at is null))
);

create table public.family_saved_ideas (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.family_children (id) on delete cascade,
  idea_id text not null,
  saved_by uuid not null default auth.uid() references auth.users (id),
  created_at timestamptz not null default now(),
  unique (child_id, idea_id)
);

create table public.family_idea_feedback (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.family_children (id) on delete cascade,
  idea_id text not null,
  result text not null check (result in ('Helped', 'Partly', 'Didn''t fit')),
  note text not null default '',
  created_by uuid not null default auth.uid() references auth.users (id),
  created_at timestamptz not null default now()
);

create index family_memberships_user_status_idx
  on public.family_memberships (user_id, status);
create index family_children_family_idx on public.family_children (family_id);
create index care_blocks_child_date_time_idx
  on public.care_blocks (child_id, care_date, starts_at);
create index handoff_updates_child_created_idx
  on public.handoff_updates (child_id, created_at desc);
create index help_requests_child_status_idx
  on public.help_requests (child_id, status, created_at desc);
create index family_member_permissions_child_idx
  on public.family_member_child_permissions (child_id, membership_id);

create or replace function public.is_family_owner(target_family_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.family_memberships membership
    where membership.family_id = target_family_id
      and membership.user_id = (select auth.uid())
      and membership.role = 'owner'
      and membership.status = 'active'
  );
$$;

create or replace function public.are_family_members(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.family_memberships subject
    join public.family_memberships viewer
      on viewer.family_id = subject.family_id
    where subject.user_id = target_user_id
      and subject.status = 'active'
      and viewer.user_id = (select auth.uid())
      and viewer.status = 'active'
  );
$$;

create or replace function public.has_child_permission(
  target_child_id uuid,
  permission_name text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.family_children child
    join public.family_memberships membership
      on membership.family_id = child.family_id
    left join public.family_member_child_permissions permission
      on permission.membership_id = membership.id
      and permission.child_id = child.id
    where child.id = target_child_id
      and membership.user_id = (select auth.uid())
      and membership.status = 'active'
      and (
        membership.role = 'owner'
        or case permission_name
          when 'guide' then permission.can_view_guide
          when 'plan' then permission.can_view_plan
          when 'toolkit' then permission.can_view_toolkit
          when 'updates' then permission.can_view_updates
          when 'requests' then permission.can_view_requests
          else false
        end
      )
  );
$$;

create or replace function public.has_child_access(target_child_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.family_children child
    join public.family_memberships membership
      on membership.family_id = child.family_id
    left join public.family_member_child_permissions permission
      on permission.membership_id = membership.id
      and permission.child_id = child.id
    where child.id = target_child_id
      and membership.user_id = (select auth.uid())
      and membership.status = 'active'
      and (
        membership.role = 'owner'
        or permission.can_view_guide
        or permission.can_view_plan
        or permission.can_view_toolkit
        or permission.can_view_updates
        or permission.can_view_requests
      )
  );
$$;

create or replace function public.create_family(family_name text default '')
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_family_id uuid;
  current_user_id uuid := (select auth.uid());
begin
  if current_user_id is null then
    raise exception 'Sign in before creating a family.';
  end if;

  if length(trim(coalesce(family_name, ''))) = 0 then
    raise exception 'Enter a family name.';
  end if;

  insert into public.families (name, created_by)
  values (left(trim(coalesce(family_name, '')), 80), current_user_id)
  returning id into new_family_id;

  insert into public.family_memberships (family_id, user_id, role, status)
  values (new_family_id, current_user_id, 'owner', 'active');

  return new_family_id;
end;
$$;

create or replace function public.accept_help_request(target_request_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
begin
  if current_user_id is null then
    raise exception 'Sign in before accepting a request.';
  end if;

  update public.help_requests request
  set status = 'accepted',
      accepted_by = current_user_id,
      accepted_at = now()
  where request.id = target_request_id
    and request.status = 'open'
    and public.has_child_permission(request.child_id, 'requests');

  if not found then
    raise exception 'This request is not open or you do not have permission to accept it.';
  end if;
end;
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'name', ''), 80)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user();

alter table public.profiles enable row level security;
alter table public.families enable row level security;
alter table public.family_memberships enable row level security;
alter table public.family_children enable row level security;
alter table public.family_member_child_permissions enable row level security;
alter table public.child_care_guides enable row level security;
alter table public.care_blocks enable row level security;
alter table public.handoff_updates enable row level security;
alter table public.help_requests enable row level security;
alter table public.family_saved_ideas enable row level security;
alter table public.family_idea_feedback enable row level security;

create policy "Profiles are visible to their owner and family members"
  on public.profiles for select to authenticated
  using (
    id = (select auth.uid())
    or (select public.are_family_members(id))
  );
create policy "Users can create their own profile"
  on public.profiles for insert to authenticated
  with check (id = (select auth.uid()));
create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "Active members can view their families"
  on public.families for select to authenticated
  using (exists (
    select 1 from public.family_memberships membership
    where membership.family_id = families.id
      and membership.user_id = (select auth.uid())
      and membership.status = 'active'
  ));
create policy "Owners can update their families"
  on public.families for update to authenticated
  using ((select public.is_family_owner(id)))
  with check ((select public.is_family_owner(id)));

create policy "Members can view their membership"
  on public.family_memberships for select to authenticated
  using (
    user_id = (select auth.uid())
    or (select public.is_family_owner(family_id))
  );
create policy "Owners can update memberships"
  on public.family_memberships for update to authenticated
  using ((select public.is_family_owner(family_id)))
  with check ((select public.is_family_owner(family_id)));

create policy "Members with child access can view child basics"
  on public.family_children for select to authenticated
  using ((select public.has_child_access(id)));
create policy "Owners can add children"
  on public.family_children for insert to authenticated
  with check ((select public.is_family_owner(family_id)));
create policy "Owners can update children"
  on public.family_children for update to authenticated
  using ((select public.is_family_owner(family_id)))
  with check ((select public.is_family_owner(family_id)));
create policy "Owners can remove children"
  on public.family_children for delete to authenticated
  using ((select public.is_family_owner(family_id)));

create policy "Members can view their child permissions"
  on public.family_member_child_permissions for select to authenticated
  using (
    (select public.is_family_owner(family_id))
    or exists (
      select 1 from public.family_memberships membership
      where membership.id = membership_id
        and membership.user_id = (select auth.uid())
        and membership.status = 'active'
    )
  );
create policy "Owners can grant child permissions"
  on public.family_member_child_permissions for insert to authenticated
  with check ((select public.is_family_owner(family_id)));
create policy "Owners can change child permissions"
  on public.family_member_child_permissions for update to authenticated
  using ((select public.is_family_owner(family_id)))
  with check ((select public.is_family_owner(family_id)));
create policy "Owners can revoke child permissions"
  on public.family_member_child_permissions for delete to authenticated
  using ((select public.is_family_owner(family_id)));

create policy "Caregivers with guide access can view care guides"
  on public.child_care_guides for select to authenticated
  using ((select public.has_child_permission(child_id, 'guide')));
create policy "Owners can add care guides"
  on public.child_care_guides for insert to authenticated
  with check ((select public.is_family_owner(
    (select family_id from public.family_children where id = child_id)
  )));
create policy "Owners can edit care guides"
  on public.child_care_guides for update to authenticated
  using ((select public.is_family_owner(
    (select family_id from public.family_children where id = child_id)
  )))
  with check ((select public.is_family_owner(
    (select family_id from public.family_children where id = child_id)
  )));
create policy "Owners can remove care guides"
  on public.child_care_guides for delete to authenticated
  using ((select public.is_family_owner(
    (select family_id from public.family_children where id = child_id)
  )));

create policy "Caregivers with plan access can view care blocks"
  on public.care_blocks for select to authenticated
  using ((select public.has_child_permission(child_id, 'plan')));
create policy "Caregivers with plan access can add care blocks"
  on public.care_blocks for insert to authenticated
  with check (
    (select public.has_child_permission(child_id, 'plan'))
    and created_by = (select auth.uid())
  );
create policy "Caregivers with plan access can edit care blocks"
  on public.care_blocks for update to authenticated
  using ((select public.has_child_permission(child_id, 'plan')))
  with check ((select public.has_child_permission(child_id, 'plan')));
create policy "Caregivers with plan access can remove care blocks"
  on public.care_blocks for delete to authenticated
  using ((select public.has_child_permission(child_id, 'plan')));

create policy "Caregivers with update access can view handoffs"
  on public.handoff_updates for select to authenticated
  using ((select public.has_child_permission(child_id, 'updates')));
create policy "Caregivers with update access can post handoffs"
  on public.handoff_updates for insert to authenticated
  with check (
    (select public.has_child_permission(child_id, 'updates'))
    and created_by = (select auth.uid())
  );
create policy "Authors or owners can edit handoffs"
  on public.handoff_updates for update to authenticated
  using (
    (select public.has_child_permission(child_id, 'updates'))
    and (
      created_by = (select auth.uid())
      or (select public.is_family_owner(
        (select family_id from public.family_children where id = child_id)
      ))
    )
  )
  with check (
    (select public.has_child_permission(child_id, 'updates'))
    and (
      created_by = (select auth.uid())
      or (select public.is_family_owner(
        (select family_id from public.family_children where id = child_id)
      ))
    )
  );
create policy "Authors or owners can remove handoffs"
  on public.handoff_updates for delete to authenticated
  using (
    (select public.has_child_permission(child_id, 'updates'))
    and (
      created_by = (select auth.uid())
      or (select public.is_family_owner(
        (select family_id from public.family_children where id = child_id)
      ))
    )
  );

create policy "Caregivers with request access can view help requests"
  on public.help_requests for select to authenticated
  using ((select public.has_child_permission(child_id, 'requests')));
create policy "Caregivers with request access can ask for help"
  on public.help_requests for insert to authenticated
  with check (
    (select public.has_child_permission(child_id, 'requests'))
    and created_by = (select auth.uid())
    and status = 'open'
    and accepted_by is null
    and accepted_at is null
  );
create policy "Caregivers with request access can respond to requests"
  on public.help_requests for update to authenticated
  using (
    (select public.has_child_permission(child_id, 'requests'))
    and (
      created_by = (select auth.uid())
      or accepted_by = (select auth.uid())
      or (select public.is_family_owner(
        (select family_id from public.family_children where id = child_id)
      ))
    )
  )
  with check (
    (select public.has_child_permission(child_id, 'requests'))
    and (
      created_by = (select auth.uid())
      or accepted_by = (select auth.uid())
      or (select public.is_family_owner(
        (select family_id from public.family_children where id = child_id)
      ))
    )
  );
create policy "Caregivers with request access can remove requests"
  on public.help_requests for delete to authenticated
  using (
    (select public.has_child_permission(child_id, 'requests'))
    and (
      created_by = (select auth.uid())
      or accepted_by = (select auth.uid())
      or (select public.is_family_owner(
        (select family_id from public.family_children where id = child_id)
      ))
    )
  );

create policy "Caregivers with toolkit access can view saved ideas"
  on public.family_saved_ideas for select to authenticated
  using ((select public.has_child_permission(child_id, 'toolkit')));
create policy "Caregivers with toolkit access can save ideas"
  on public.family_saved_ideas for insert to authenticated
  with check (
    (select public.has_child_permission(child_id, 'toolkit'))
    and saved_by = (select auth.uid())
  );
create policy "Owners can remove saved ideas"
  on public.family_saved_ideas for delete to authenticated
  using (
    (select public.has_child_permission(child_id, 'toolkit'))
    and (saved_by = (select auth.uid())
      or (select public.is_family_owner((select family_id from public.family_children where id = child_id))))
  );

create policy "Caregivers with toolkit access can view idea feedback"
  on public.family_idea_feedback for select to authenticated
  using ((select public.has_child_permission(child_id, 'toolkit')));
create policy "Caregivers with toolkit access can add idea feedback"
  on public.family_idea_feedback for insert to authenticated
  with check (
    (select public.has_child_permission(child_id, 'toolkit'))
    and created_by = (select auth.uid())
  );
create policy "Authors or owners can edit idea feedback"
  on public.family_idea_feedback for update to authenticated
  using (
    (select public.has_child_permission(child_id, 'toolkit'))
    and (
      created_by = (select auth.uid())
      or (select public.is_family_owner(
        (select family_id from public.family_children where id = child_id)
      ))
    )
  )
  with check (
    (select public.has_child_permission(child_id, 'toolkit'))
    and (
      created_by = (select auth.uid())
      or (select public.is_family_owner(
        (select family_id from public.family_children where id = child_id)
      ))
    )
  );
create policy "Authors or owners can remove idea feedback"
  on public.family_idea_feedback for delete to authenticated
  using (
    (select public.has_child_permission(child_id, 'toolkit'))
    and (
      created_by = (select auth.uid())
      or (select public.is_family_owner(
        (select family_id from public.family_children where id = child_id)
      ))
    )
  );

grant select, insert on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;
grant select on public.families to authenticated;
grant update (name) on public.families to authenticated;
grant select on public.family_memberships to authenticated;
grant update (status) on public.family_memberships to authenticated;
grant select, insert, delete on public.family_children to authenticated;
grant update (nickname, age, goals, other_goal) on public.family_children to authenticated;
grant select, insert, delete on public.family_member_child_permissions to authenticated;
grant update (
  can_view_guide,
  can_view_plan,
  can_view_toolkit,
  can_view_updates,
  can_view_requests
) on public.family_member_child_permissions to authenticated;
grant select, insert, delete on public.child_care_guides to authenticated;
grant update (needs, what_helps, calming_strategies, easy_game, updated_at)
  on public.child_care_guides to authenticated;
grant select, insert, delete on public.care_blocks to authenticated;
grant update (care_date, starts_at, title, details, assigned_to)
  on public.care_blocks to authenticated;
grant select, insert, delete on public.handoff_updates to authenticated;
grant update (kind, body) on public.handoff_updates to authenticated;
grant select, insert, delete on public.help_requests to authenticated;
grant update (body, needed_by, assigned_to, status)
  on public.help_requests to authenticated;
grant select, insert, delete on public.family_saved_ideas to authenticated;
grant select, insert, delete on public.family_idea_feedback to authenticated;
grant update (idea_id, result, note) on public.family_idea_feedback to authenticated;

revoke all on function public.is_family_owner(uuid) from public;
revoke all on function public.are_family_members(uuid) from public;
revoke all on function public.has_child_permission(uuid, text) from public;
revoke all on function public.has_child_access(uuid) from public;
revoke all on function public.create_family(text) from public;
revoke all on function public.accept_help_request(uuid) from public;
grant execute on function public.is_family_owner(uuid) to authenticated;
grant execute on function public.are_family_members(uuid) to authenticated;
grant execute on function public.has_child_permission(uuid, text) to authenticated;
grant execute on function public.has_child_access(uuid) to authenticated;
grant execute on function public.create_family(text) to authenticated;
grant execute on function public.accept_help_request(uuid) to authenticated;
