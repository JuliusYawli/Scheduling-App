import type { DayOfWeek, Slot } from "../models";

export interface CandidateSlot {
  staffId: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
}

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function timeRangesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string
): boolean {
  const s1 = toMinutes(aStart);
  const e1 = toMinutes(aEnd);
  const s2 = toMinutes(bStart);
  const e2 = toMinutes(bEnd);
  return s1 < e2 && s2 < e1;
}

/**
 * Returns the existing slot that conflicts with the candidate, or null if the
 * staff member is free. A slot never conflicts with itself when editing
 * (pass its id as excludeSlotId).
 */
export function findConflict(
  existingSlots: Slot[],
  candidate: CandidateSlot,
  excludeSlotId?: string
): Slot | null {
  for (const slot of existingSlots) {
    if (slot.id === excludeSlotId) continue;
    if (slot.staffId !== candidate.staffId) continue;
    if (slot.dayOfWeek !== candidate.dayOfWeek) continue;
    if (timeRangesOverlap(slot.startTime, slot.endTime, candidate.startTime, candidate.endTime)) {
      return slot;
    }
  }
  return null;
}
