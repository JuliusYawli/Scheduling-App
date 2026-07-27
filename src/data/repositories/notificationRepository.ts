import { supabase } from "../supabase";
import type { AppNotification, NotificationType, Slot } from "../../models";
import * as subjectRepository from "./subjectRepository";

function toNotification(row: {
  id: string;
  recipient_staff_id: string;
  slot_id: string | null;
  type: string;
  message: string;
  read: boolean;
  created_at: string;
}): AppNotification {
  return {
    id: row.id,
    recipientStaffId: row.recipient_staff_id,
    slotId: row.slot_id ?? undefined,
    type: row.type as NotificationType,
    message: row.message,
    read: row.read,
    createdAt: row.created_at,
  };
}

export async function listForStaff(staffId: string): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("recipient_staff_id", staffId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toNotification);
}

export async function markRead(id: string): Promise<void> {
  const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id);
  if (error) throw error;
}

/**
 * Stands in for a Postgres trigger / Edge Function that would send email on
 * slot changes (docs/design/system-design.md §6) — writes the in-app
 * notification row directly from the client under the admin's session.
 */
export async function notifyStaffOfSlot(slot: Slot, type: NotificationType): Promise<void> {
  const [subject] = await subjectRepository.listByIds([slot.subjectId]);
  const message = subject
    ? `New class scheduled: ${subject.name} — ${slot.dayOfWeek} ${slot.startTime}–${slot.endTime}`
    : `Your timetable changed — ${slot.dayOfWeek} ${slot.startTime}–${slot.endTime}`;
  const { error } = await supabase.from("notifications").insert({
    recipient_staff_id: slot.staffId,
    slot_id: slot.id,
    type,
    message,
    read: false,
  });
  if (error) throw error;
}
