# Staff Scheduling App

A cross-platform (iOS + Android) app for scheduling staff, building weekly
timetables, and tracking student attendance — built to replace manual,
paper-based tracking at colleges and institutes.

> Status: wired up to a real Supabase project (Postgres + Auth) — you need
> your own Supabase project's URL/keys to run it (see
> [Supabase setup](#supabase-setup) below). Email notifications are the one
> piece still not live (needs a paid email provider); see
> [What's real vs mocked](#whats-real-vs-mocked). Full data model, screen
> flows, and phased build plan:
> [docs/design/system-design.md](docs/design/system-design.md) (written
> against Firestore originally — the ER model and screen flows still apply,
> §3.3's Firestore collection layout and §7 Cloud Functions section are the
> parts superseded by `supabase/migrations/0001_init.sql` and
> `supabase/functions/`).

## What it does

Two roles, one app:

- **Admin** — logs in with a pre-registered account, manages staff, courses,
  subjects, and students, and builds the weekly timetable by assigning
  subjects to staff at specific day/time slots. A slot can't be created if
  the staff member is already booked at that time.
- **Staff** — logs in with an account created by an Admin, views their own
  weekly timetable, and takes attendance (Present/Absent) for the students
  enrolled in each subject they teach.

Both roles get notified by email and in-app alerts when their timetable
changes (new staff account, new slot, slot changed/removed).

## Tech stack

| Layer | Choice |
|---|---|
| App | React Native + Expo (TypeScript) |
| UI | React Native Paper, React Navigation |
| State/data | React Query + Zustand |
| Auth & database | Supabase (Postgres + Auth) |
| Notifications | In-app: a Postgres row, polled by React Query. Email: not implemented — would need a Supabase Edge Function + an email provider |

Full rationale for the original choices (Firebase) is in the design doc;
this app moved to Supabase to avoid a mandatory billing-account requirement
Google now imposes on new Firebase/GCP projects even for free-tier usage —
Supabase's free tier needs no card at all.

## Supabase setup

The app needs a Supabase project of your own — this is a one-time manual
step (it needs an account, so it can't be scripted for you):

1. **Create the project.** Sign up at [supabase.com](https://supabase.com/)
   (free, no card required) and create a new project. Pick a database
   password when prompted — save it, you won't need it for the app itself
   but you will if you ever connect a SQL client directly.
2. **Run the schema + security policies.** Dashboard → **SQL Editor** → New
   query → paste in the entire contents of
   `supabase/migrations/0001_init.sql` → **Run**. This creates every table
   (`profiles`, `staff`, `courses`, `subjects`, `students`, `slots`,
   `attendance`, `notifications`) and turns on Row Level Security with the
   admin/staff access rules described in that file's comments.
3. **Enable Email/Password auth.** It's on by default for new projects —
   confirm under Authentication → Providers → Email that it's enabled.
4. **Get your API keys.** Project settings → **API**. Copy the **Project
   URL** and the **anon / public** key (not the `service_role` one — that
   one's a secret, see step 6).
5. **Set your env vars.** `cp .env.example .env`, then fill in:

   ```text
   EXPO_PUBLIC_SUPABASE_URL=<Project URL from step 4>
   EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon/public key from step 4>
   ```

   Restart `npm start` afterward (Expo only reloads `EXPO_PUBLIC_*` vars on
   a fresh start).
6. **Deploy the create-staff Edge Function.** Adding a staff account needs
   the `service_role` key server-side (creating an Auth user + writing
   `profiles`/`staff` rows has to bypass Row Level Security, and that key
   must never ship inside the app) — that's what
   `supabase/functions/create-staff/index.ts` is for.

   ```sh
   npx supabase login
   npx supabase link --project-ref <your-project-ref>   # the id in your project's URL
   npx supabase functions deploy create-staff
   ```

   Without this step, the "Add Staff" screen will fail — every other screen
   works without it.
7. **Seed the demo accounts + data.** Project settings → API → copy the
   `service_role` secret (never commit this, never put it in `.env` — it's
   only used once, from your terminal), then:

   ```sh
   SUPABASE_URL=<Project URL> SUPABASE_SERVICE_ROLE_KEY=<service_role key> npm run seed
   ```

   This creates:

   | Role | Email | Password |
   |---|---|---|
   | Admin | `admin@school.edu` | `admin123` |
   | Staff | `grace.mensah@school.edu` | `staff123` |
   | Staff | `kwame.owusu@school.edu` | `staff123` |

   Safe to re-run — it skips anything that already exists.

## Running it

```sh
npm install
npm start
```

This opens the Expo dev tools with a QR code. Install **Expo Go** on your
phone (App Store or Google Play, free), make sure your phone is on the same
Wi-Fi as your computer, then scan the QR code — iOS via the Camera app,
Android from inside Expo Go itself.

Run the test suite with `npm test` (covers the staff double-booking
conflict rule in `src/domain/slotConflictChecker.ts`).

## What's real vs mocked

Every screen in the design doc is built and navigable, and every repository
in `src/data/repositories/` talks to a real Supabase project (once you've
done the [Supabase setup](#supabase-setup) above):

- Login checks real Supabase Auth; sessions persist across app restarts
  (`AsyncStorage`-backed, see `src/data/supabase.ts`).
- Staff/courses/students/slots/attendance are Postgres tables — changes
  persist and are shared across devices, access-controlled by the Row Level
  Security policies in `supabase/migrations/0001_init.sql`.
- Adding a slot writes the in-app notification row directly (client-side
  stand-in for a server-side trigger), so the bell icon and unread badge
  work today.
- Adding a staff member calls the `create-staff` Edge Function (step 6
  above) rather than creating the Auth account from the client directly —
  that always has to happen server-side, with or without Firebase/Supabase,
  since it needs a key that can't live in the app bundle.
- **Not live:** the *email* half of notifications. Nothing in the app
  depends on it — see the design doc §6 for what a real implementation
  would look like (a `slots` insert trigger calling out to an email API).

## Project structure

```text
App.tsx                  # provider setup: React Query, Paper, navigation
src/
  models/                 # shared TypeScript types
  domain/                 # slotConflictChecker — pure, unit-tested business rule
  data/
    supabase.ts             Supabase client init (reads .env)
    repositories/            one file per entity, async, talks to Postgres/Auth
    queries/                  React Query hooks wrapping the repositories
  store/                   useAuthStore (Zustand) — session/role
  navigation/              RootNavigator, AdminNavigator, StaffNavigator
  screens/
    auth/ admin/ staff/ shared/
  components/              small shared UI (WeeklyTimetable, Centered)
scripts/
  seed-supabase.js         one-time demo data seed (service role key) — npm run seed
supabase/
  migrations/0001_init.sql  schema + Row Level Security policies
  functions/create-staff/   Edge Function: the one privileged operation the
                            app needs (see its header comment)
docs/
  design/
    system-design.md      # data model, screen flows, architecture, dev plan
                           # (written for Firestore — see the note at the top
                           # of this README for what's superseded)
```

## Documentation

- [System design](docs/design/system-design.md) — entity-relationship
  diagram, Admin/Staff screen flows, the staff double-booking conflict
  rule, notification architecture, module layout, and the phased
  development plan. Written against Firestore originally; the schema in
  `supabase/migrations/0001_init.sql` is the up-to-date source of truth for
  the database layer.
