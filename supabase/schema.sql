create extension if not exists pgcrypto;

create table if not exists public.portfolio_admins (
  singleton boolean primary key default true check (singleton),
  admin_email text not null unique,
  created_at timestamptz not null default now()
);

drop policy if exists "Admins can view their own portfolio role" on public.portfolio_admins;

do $$
declare
  old_primary_key text;
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'portfolio_admins'
      and column_name = 'user_id'
  ) then
    delete from public.portfolio_admins;

    select conname
      into old_primary_key
      from pg_constraint
      where conrelid = 'public.portfolio_admins'::regclass
        and contype = 'p';
    if old_primary_key is not null then
      execute format('alter table public.portfolio_admins drop constraint %I', old_primary_key);
    end if;
    alter table public.portfolio_admins alter column user_id drop not null;
  end if;
end
$$;

alter table public.portfolio_admins add column if not exists singleton boolean;
alter table public.portfolio_admins add column if not exists admin_email text;
alter table public.portfolio_admins alter column singleton set default true;
update public.portfolio_admins set singleton = true where singleton is null;
alter table public.portfolio_admins alter column singleton set not null;
update public.portfolio_admins set admin_email = 'kofiephram@gmail.com' where admin_email is null;
alter table public.portfolio_admins alter column admin_email set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.portfolio_admins'::regclass and contype = 'p'
  ) then
    alter table public.portfolio_admins add constraint portfolio_admins_pkey primary key (singleton);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.portfolio_admins'::regclass
      and conname = 'portfolio_admins_singleton_check'
  ) then
    alter table public.portfolio_admins
      add constraint portfolio_admins_singleton_check check (singleton);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.portfolio_admins'::regclass
      and conname = 'portfolio_admins_admin_email_key'
  ) then
    alter table public.portfolio_admins
      add constraint portfolio_admins_admin_email_key unique (admin_email);
  end if;
end
$$;

insert into public.portfolio_admins (singleton, admin_email)
values (true, 'kofiephram@gmail.com')
on conflict (singleton) do nothing;

alter table public.portfolio_admins enable row level security;
revoke all on public.portfolio_admins from anon, authenticated;
grant select on public.portfolio_admins to authenticated;

create policy "Admins can view their own portfolio role"
  on public.portfolio_admins
  for select
  to authenticated
  using (
    lower(admin_email) = lower((select auth.jwt() ->> 'email'))
    and (select auth.jwt() -> 'app_metadata' ->> 'provider') = 'google'
  );

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  link text not null default '',
  tags text[] not null default '{}',
  images text[] not null default '{}',
  image_paths text[] not null default '{}',
  image_credits jsonb not null default '[]',
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;
revoke all on public.projects from anon, authenticated;
grant select on public.projects to anon, authenticated;
grant insert, update, delete on public.projects to authenticated;

drop policy if exists "Anyone can view portfolio projects" on public.projects;
create policy "Anyone can view portfolio projects"
  on public.projects
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Portfolio admins can add projects" on public.projects;
create policy "Portfolio admins can add projects"
  on public.projects
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.portfolio_admins
      where lower(admin_email) = lower((select auth.jwt() ->> 'email'))
        and (select auth.jwt() -> 'app_metadata' ->> 'provider') = 'google'
    )
  );

drop policy if exists "Portfolio admins can update projects" on public.projects;
create policy "Portfolio admins can update projects"
  on public.projects
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.portfolio_admins
      where lower(admin_email) = lower((select auth.jwt() ->> 'email'))
        and (select auth.jwt() -> 'app_metadata' ->> 'provider') = 'google'
    )
  )
  with check (
    exists (
      select 1
      from public.portfolio_admins
      where lower(admin_email) = lower((select auth.jwt() ->> 'email'))
        and (select auth.jwt() -> 'app_metadata' ->> 'provider') = 'google'
    )
  );

drop policy if exists "Portfolio admins can delete projects" on public.projects;
create policy "Portfolio admins can delete projects"
  on public.projects
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.portfolio_admins
      where lower(admin_email) = lower((select auth.jwt() ->> 'email'))
        and (select auth.jwt() -> 'app_metadata' ->> 'provider') = 'google'
    )
  );

do $$
begin
  if exists (
    select 1 from pg_publication where pubname = 'supabase_realtime'
  ) and not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'projects'
  ) then
    execute 'alter publication supabase_realtime add table public.projects';
  end if;
end
$$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-project-images',
  'portfolio-project-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Anyone can view portfolio project images" on storage.objects;
create policy "Anyone can view portfolio project images"
  on storage.objects
  for select
  to public
  using (bucket_id = 'portfolio-project-images');

drop policy if exists "Portfolio admins can upload project images" on storage.objects;
create policy "Portfolio admins can upload project images"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'portfolio-project-images'
    and exists (
      select 1
      from public.portfolio_admins
      where lower(admin_email) = lower((select auth.jwt() ->> 'email'))
        and (select auth.jwt() -> 'app_metadata' ->> 'provider') = 'google'
    )
  );

drop policy if exists "Portfolio admins can update project images" on storage.objects;
create policy "Portfolio admins can update project images"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'portfolio-project-images'
    and exists (
      select 1
      from public.portfolio_admins
      where lower(admin_email) = lower((select auth.jwt() ->> 'email'))
        and (select auth.jwt() -> 'app_metadata' ->> 'provider') = 'google'
    )
  )
  with check (
    bucket_id = 'portfolio-project-images'
    and exists (
      select 1
      from public.portfolio_admins
      where lower(admin_email) = lower((select auth.jwt() ->> 'email'))
        and (select auth.jwt() -> 'app_metadata' ->> 'provider') = 'google'
    )
  );

drop policy if exists "Portfolio admins can delete project images" on storage.objects;
create policy "Portfolio admins can delete project images"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'portfolio-project-images'
    and exists (
      select 1
      from public.portfolio_admins
      where lower(admin_email) = lower((select auth.jwt() ->> 'email'))
        and (select auth.jwt() -> 'app_metadata' ->> 'provider') = 'google'
    )
  );
