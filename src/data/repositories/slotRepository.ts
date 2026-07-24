import type { DayOfWeek, Slot } from "../../models";
import { findConflict } from "../../domain/slotConflictChecker";
import { db, networkDelay, nextId } from "../mockStore";
import { notifyStaffOfSlot } from "./notificationRepository";

export class SlotConflictError extends Error {
  constructor(public conflictingSlot: Slot) {
    super("This staff member is already booked at that time.");
    this.name = "SlotConflictError";
  }
}

export interface NewSlotInput {
  subjectId: string;
  staffId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}

export async function list(): Promise<Slot[]> {
  await networkDelay();
  return [...db.slots];
}

export async function listByStaff(staffId: string): Promise<Slot[]> {
  await networkDelay();
  return db.slots.filter((slot) => slot.staffId === staffId);
}

/**
 * Mirrors the design doc's Cloud Function trigger: a Firestore write to
 * /slots would fire onSlotCreated, which emails the staff member and writes
 * a notification doc. Here both happen inline since there's no real backend
 * yet — swapping to Firebase later moves the notification call into that
 * Cloud Function instead of this repository.
 */
export async function add(input: NewSlotInput): Promise<Slot> {
  await networkDelay();
  const conflict = findConflict(db.slots, input);
  if (conflict) {
    throw new SlotConflictError(conflict);
  }
  const slot: Slot = { id: nextId("slot"), ...input };
  db.slots.push(slot);
  notifyStaffOfSlot(slot, "slot_created");
  return slot;
}

export async function remove(id: string): Promise<void> {
  await networkDelay();
  db.slots = db.slots.filter((slot) => slot.id !== id);
}
