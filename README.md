# Staff Scheduling App

A cross-platform (iOS + Android) app for scheduling staff, building weekly
timetables, and tracking student attendance — built to replace manual,
paper-based tracking at colleges and institutes.

> Status: design complete, implementation not started. See
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
| Auth & database | Firebase Authentication + Firestore (Web SDK) |
| Notifications | Firebase Cloud Functions + Resend (email), Firestore listener (in-app) |

Full rationale for each choice is in the design doc.

## Getting started

The app hasn't been scaffolded yet — this repo currently holds the design
docs only. Phase 0 of the [development plan](docs/design/system-design.md#8-development-plan-phased)
covers initial setup: `create-expo-app`, Firebase project creation, and
wiring up Auth/Firestore/Functions.

## Project structure

```text
docs/
  design/
    system-design.md   # data model, screen flows, architecture, dev plan
```

## Documentation

- [System design](docs/design/system-design.md) — entity-relationship
  diagram, Firestore schema, Admin/Staff screen flows, the staff
  double-booking conflict rule, notification architecture, module layout,
  and the phased development plan.
