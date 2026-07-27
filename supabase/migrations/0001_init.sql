-- Schema + Row Level Security for the Staff Scheduling App.
-- Mirrors docs/design/system-design.md §3 (entity-relationship model) and
-- the Admin/Staff role split in §2. Run this in the Supabase SQL Editor, or
-- via `supabase db push` once the project is linked (see README).

create extension if not exists pgcrypto;

-- profiles is the join between auth.users and app role, equivalent to
-- Firestore's old /users/{uid} doc. One row per Auth user (admin or staff).
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('admin', 'staff')),
  name text not null
);

-- Staff row id == the staff member's Auth user id (see the Edge Function in
-- supabase/functions/create-staff), same simplification the app used with
-- Firebase: one id doubles as both the profile key and the "staffId" the
-- rest of the schema references.
create table public.staff (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null unique,
  contact_number text not null,
  subject_ids uuid[] not null default '{}'
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  name text not null
);
create unique index courses_name_lower_idx on public.courses (lower(name));

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  course_id uuid not null references public.courses (id) on delete cascade
);

create table public.students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  course_id uuid not null references public.courses (id) on delete cascade
);

create table public.slots (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects (id) on delete cascade,
  staff_id uuid not null references public.staff (id) on delete cascade,
  day_of_week text not null check (day_of_week in ('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat')),
  start_time text not null,
  end_time text not null
);

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references public.slots (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  date date not null,
  status text not null check (status in ('present', 'absent')),
  marked_by_staff_id uuid not null references public.staff (id) on delete cascade
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_staff_id uuid not null references public.staff (id) on delete cascade,
  slot_id uuid references public.slots (id) on delete set null,
  type text not null check (type in ('staff_created', 'slot_created', 'slot_changed')),
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- security definer so policies that call this don't recurse into profiles'
-- own RLS (which would otherwise re-trigger this same check).
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.staff enable row level security;
alter table public.courses enable row level security;
alter table public.subjects enable row level security;
alter table public.students enable row level security;
alter table public.slots enable row level security;
alter table public.attendance enable row level security;
alter table public.notifications enable row level security;

create policy "profiles: read own or admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "profiles: admin writes" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

create policy "staff: read own or admin" on public.staff
  for select using (id = auth.uid() or public.is_admin());
create policy "staff: admin writes" on public.staff
  for all using (public.is_admin()) with check (public.is_admin());

create policy "courses: read all signed in" on public.courses
  for select using (auth.uid() is not null);
create policy "courses: admin writes" on public.courses
  for all using (public.is_admin()) with check (public.is_admin());

create policy "subjects: read all signed in" on public.subjects
  for select using (auth.uid() is not null);
create policy "subjects: admin writes" on public.subjects
  for all using (public.is_admin()) with check (public.is_admin());

create policy "students: read all signed in" on public.students
  for select using (auth.uid() is not null);
create policy "students: admin writes" on public.students
  for all using (public.is_admin()) with check (public.is_admin());

create policy "slots: read all signed in" on public.slots
  for select using (auth.uid() is not null);
create policy "slots: admin writes" on public.slots
  for all using (public.is_admin()) with check (public.is_admin());

-- Attendance: a staff member may only touch records they marked themselves.
create policy "attendance: read own or admin" on public.attendance
  for select using (marked_by_staff_id = auth.uid() or public.is_admin());
create policy "attendance: write own or admin" on public.attendance
  for all
  using (marked_by_staff_id = auth.uid() or public.is_admin())
  with check (marked_by_staff_id = auth.uid() or public.is_admin());

-- Notifications: written by the admin app (slotRepository.add stands in for
-- the onSlotCreated trigger, see design doc §6); staff can read/mark-read
-- only their own.
create policy "notifications: read own or admin" on public.notifications
  for select using (recipient_staff_id = auth.uid() or public.is_admin());
create policy "notifications: admin insert" on public.notifications
  for insert with check (public.is_admin());
create policy "notifications: update own or admin" on public.notifications
  for update
  using (recipient_staff_id = auth.uid() or public.is_admin())
  with check (recipient_staff_id = auth.uid() or public.is_admin());
create policy "notifications: admin delete" on public.notifications
  for delete using (public.is_admin());
