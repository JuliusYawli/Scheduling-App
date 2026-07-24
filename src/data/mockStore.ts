import type {
  AppNotification,
  AttendanceRecord,
  Course,
  Slot,
  Staff,
  Student,
  Subject,
} from "../models";
import {
  attendanceSeed,
  courseSeed,
  notificationSeed,
  slotSeed,
  staffSeed,
  STAFF_PASSWORDS,
  studentSeed,
  subjectSeed,
} from "./mock/seed";

/**
 * In-memory stand-in for Firestore. Every repository in ./repositories reads
 * and writes through here instead of talking to the network, so the app is
 * fully usable before a real Firebase project exists. Swapping a repository
 * to real Firestore later means changing that one file — screens never touch
 * this module directly.
 */
export const db = {
  staff: [...staffSeed],
  courses: [...courseSeed],
  subjects: [...subjectSeed],
  students: [...studentSeed],
  slots: [...slotSeed],
  attendance: [...attendanceSeed] as AttendanceRecord[],
  notifications: [...notificationSeed] as AppNotification[],
  staffPasswords: { ...STAFF_PASSWORDS } as Record<string, string>,
};

let idCounter = 1000;
export function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

/** Simulated network latency so loading states are real, not instant. */
export function networkDelay(ms = 350): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
