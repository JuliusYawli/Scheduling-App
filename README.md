# Staff Scheduling App

A cross-platform (iOS + Android) app for scheduling staff, building weekly
timetables, and tracking student attendance — built to replace manual,
paper-based tracking at colleges and institutes.

> Status: wired up to a real Supabase project (Postgres + Auth) and Resend
> for email — you need your own Supabase project's URL/keys and a Resend
> API key to run it (see [Supabase setup](#supabase-setup) below). Full data model, screen
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
changes (new staff account, new slot, slot changed/removed). Both roles
also have a Profile screen to change their password, and can reset a
forgotten password from the login screen via an emailed link.

## Tech stack

| Layer | Choice |
|---|---|
| App | React Native + Expo (TypeScript) |
| UI | React Native Paper, React Navigation |
| State/data | React Query + Zustand |
| Auth & database | Supabase (Postgres + Auth) |
| Notifications | In-app: a Postgres row, polled by React Query. Email: Resend, via the `send-email` Edge Function and the welcome-email step in `create-staff` |

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
7. **Deploy the send-email Edge Function + set your Resend key.** Email
   (welcome email on staff creation, "new class scheduled" email on slot
   creation) needs a [Resend](https://resend.com/) API key — sign up (free
   tier, no domain required to start) and copy an API key from the
   dashboard, then:

   ```sh
   npx supabase secrets set RESEND_API_KEY=re_xxx
   npx supabase functions deploy send-email
   npx supabase functions deploy create-staff   # re-deploy: it also sends an email now
   ```

   Without a verified sending domain, Resend's shared sandbox sender
   (`onboarding@resend.dev`, the default) can only deliver to **your own**
   Resend account email — not real staff addresses. To send to real
   inboxes, verify a domain at resend.com/domains, then set a `FROM_EMAIL`
   secret on an address at that domain:
   `npx supabase secrets set FROM_EMAIL=notifications@yourdomain.com`.
   Email sending is best-effort everywhere it's called — a failed send
   never blocks the underlying action (staff/slot creation still succeeds).
8. **Seed the demo accounts + data.** Project settings → API → copy the
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
9. **Add the password-reset redirect URL.** Authentication → URL
   Configuration → Redirect URLs → add `staffscheduling://reset-password`
   (this is the app's URL scheme, set in `app.json`). Without this, the
   "Forgot password?" email link won't be allowed to open back into the
   app. Supabase's own built-in email sending (used for this one flow —
   not Resend) has a low rate limit meant for testing; if you outgrow it,
   configure custom SMTP under Authentication → Emails using Resend's SMTP
   credentials (host `smtp.resend.com`, user `resend`, password = your
   Resend API key).

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
- Adding or removing a staff member calls the `create-staff` /
  `delete-staff` Edge Functions (steps 6 above) rather than touching Auth
  from the client directly — that always has to happen server-side, with
  or without Firebase/Supabase, since it needs a key that can't live in the
  app bundle.
- Email notifications are live via Resend (step 7 above): a welcome email
  on staff creation, a "new class scheduled" email on slot creation. Both
  are client-invoked (the client calls the Edge Function right after the
  underlying action succeeds) rather than fired by a server-side database
  trigger — same simplification as the in-app notification row above, and
  for the same reason: one fewer moving part until it's worth the added
  complexity of a real trigger.
- Forgot password (login screen) and change password (Profile screen, both
  roles) both call real Supabase Auth — verified against the live project.
  The one piece that needs an on-device test rather than an API check is
  the deep link itself (tapping the emailed reset link actually reopening
  the app to the reset-password screen), since that depends on the native
  build registering the `staffscheduling://` URL scheme (see `app.json`).

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
  navigation/              RootNavigator (also handles the password-reset
                            deep link), AuthNavigator, AdminNavigator,
                            StaffNavigator
  screens/
    auth/                    LoginScreen, ForgotPasswordScreen,
                              ResetPasswordScreen
    admin/ staff/
    shared/                  NotificationsScreen, ProfileScreen
                              (change password — both roles)
  components/              small shared UI (WeeklyTimetable, Centered)
scripts/
  seed-supabase.js         one-time demo data seed (service role key) — npm run seed
supabase/
  migrations/0001_init.sql  schema + Row Level Security policies
  functions/
    create-staff/           creates a staff Auth account + rows, then a
                            welcome email (needs the service_role key)
    delete-staff/            deletes a staff member's Auth account + rows
    send-email/              generic "send one email via Resend" function,
                            called after slot creation
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
