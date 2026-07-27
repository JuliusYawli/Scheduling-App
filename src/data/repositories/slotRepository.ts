import { supabase } from "../supabase";
import type { DayOfWeek, Slot } from "../../models";
import { findConflict } from "../../domain/slotConflictChecker";
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

interface SlotRow {
  id: string;
  subject_id: string;
  staff_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
}

function toSlot(row: SlotRow): Slot {
  return {
    id: row.id,
    subjectId: row.subject_id,
    staffId: row.staff_id,
    dayOfWeek: row.day_of_week as DayOfWeek,
    startTime: row.start_time,
    endTime: row.end_time,
  };
}

export async function list(): Promise<Slot[]> {
  const { data, error } = await supabase.from("slots").select("*");
  if (error) throw error;
  return (data ?? []).map(toSlot);
}

export async function listByStaff(staffId: string): Promise<Slot[]> {
  const { data, error } = await supabase.from("slots").select("*").eq("staff_id", staffId);
  if (error) throw error;
  return (data ?? []).map(toSlot);
}

/**
 * Mirrors the design doc's notification trigger (§6): creating a slot would
 * fire a server-side hook that emails the staff member and writes a
 * notification row. The notification row is written here directly since
 * there's no such trigger deployed yet — see notificationRepository.ts.
 */
export async function add(input: NewSlotInput): Promise<Slot> {
  const staffSlots = await listByStaff(input.staffId);
  const conflict = findConflict(staffSlots, input);
  if (conflict) {
    throw new SlotConflictError(conflict);
  }

  const { data, error } = await supabase
    .from("slots")
    .insert({
      subject_id: input.subjectId,
      staff_id: input.staffId,
      day_of_week: input.dayOfWeek,
      start_time: input.startTime,
      end_time: input.endTime,
    })
    .select()
    .single();
  if (error) throw error;

  const slot = toSlot(data);
  await notifyStaffOfSlot(slot, "slot_created");
  return slot;
}

export async function remove(id: string): Promise<void> {
  const { error } = await supabase.from("slots").delete().eq("id", id);
  if (error) throw error;
}
