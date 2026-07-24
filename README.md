# Staff Scheduling App

A cross-platform (iOS + Android) app for scheduling staff, building weekly
timetables, and tracking student attendance — built to replace manual,
paper-based tracking at colleges and institutes.

> Status: running end-to-end on mock data (no Firebase project wired up
> yet). See [What's real vs mocked](#whats-real-vs-mocked) below, and
> [docs/design/system-design.md](docs/design/system-design.md) for the full
> data model, screen flows, and phased build plan.

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
| Auth & database | Firebase Authentication + Firestore (Web SDK) — not wired up yet, see below |
| Notifications | Firebase Cloud Functions + Resend (email), Firestore listener (in-app) — not wired up yet |

Full rationale for each choice is in the design doc.

## Running it

```sh
npm install
npm start
```

This opens the Expo dev tools with a QR code. Install **Expo Go** on your
phone (App Store or Google Play, free), make sure your phone is on the same
Wi-Fi as your computer, then scan the QR code — iOS via the Camera app,
Android from inside Expo Go itself.

Demo accounts (seeded, see `src/data/mock/seed.ts`):

| Role | Email | Password |
|---|---|---|
| Admin | `admin@school.edu` | `admin123` |
| Staff | `grace.mensah@school.edu` | `staff123` |
| Staff | `kwame.owusu@school.edu` | `staff123` |

Run the test suite with `npm test` (covers the staff double-booking
conflict rule in `src/domain/slotConflictChecker.ts`).

## What's real vs mocked

Every screen in the design doc is built and navigable, backed by an
**in-memory mock data layer** (`src/data/mockStore.ts` + `src/data/repositories/`)
instead of a real Firebase project — that part of Phase 0 needs your Google
account to create, which nobody can do on your behalf. Concretely:

- Login checks against seeded accounts, not Firebase Authentication.
- Staff/courses/students/slots/attendance are held in memory and reset
  every time the app restarts — nothing persists yet.
- "New slot" notifications are created locally instead of by a Cloud
  Function, and there's no real email sending (no Resend account wired up).

Every repository function is `async` and shaped like its future Firestore
equivalent on purpose — swapping mock data for real Firebase later means
rewriting the *inside* of `src/data/repositories/*.ts`, not the screens that
call them. See §6 of the design doc for the target architecture.

## Project structure

```text
App.tsx                  # provider setup: React Query, Paper, navigation
src/
  models/                 # shared TypeScript types
  domain/                 # slotConflictChecker — pure, unit-tested business rule
  data/
    mock/                  seed data for the demo accounts above
    mockStore.ts            in-memory "database"
    repositories/            one file per entity, async, Firestore-shaped
    queries/                  React Query hooks wrapping the repositories
  store/                   useAuthStore (Zustand) — session/role
  navigation/              RootNavigator, AdminNavigator, StaffNavigator
  screens/
    auth/ admin/ staff/ shared/
  components/              small shared UI (WeeklyTimetable, Centered)
docs/
  design/
    system-design.md      # data model, screen flows, architecture, dev plan
```

## Next steps toward a real backend

1. Create a Firebase project (needs your Google account) — Auth, Firestore,
   and Cloud Functions (Blaze plan for the email-sending Cloud Function).
2. Replace the contents of `src/data/repositories/*.ts` with real Firestore
   calls, keeping each function's signature the same.
3. Add the Cloud Functions in `functions/` (see design doc §7.3) for the
   email/notification triggers currently faked in `notificationRepository.ts`.

## Documentation

- [System design](docs/design/system-design.md) — entity-relationship
  diagram, Firestore schema, Admin/Staff screen flows, the staff
  double-booking conflict rule, notification architecture, module layout,
  and the phased development plan.
