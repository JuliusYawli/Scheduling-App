import { supabase } from "../supabase";
import type { AttendanceRecord, AttendanceStatus } from "../../models";

interface AttendanceRow {
  id: string;
  slot_id: string;
  student_id: string;
  date: string;
  status: string;
  marked_by_staff_id: string;
}

function toRecord(row: AttendanceRow): AttendanceRecord {
  return {
    id: row.id,
    slotId: row.slot_id,
    studentId: row.student_id,
    date: row.date,
    status: row.status as AttendanceStatus,
    markedByStaffId: row.marked_by_staff_id,
  };
}

export async function listForSlotAndDate(slotId: string, date: string): Promise<AttendanceRecord[]> {
  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("slot_id", slotId)
    .eq("date", date);
  if (error) throw error;
  return (data ?? []).map(toRecord);
}

export interface AttendanceEntry {
  studentId: string;
  status: AttendanceStatus;
}

export async function saveAttendance(
  slotId: string,
  date: string,
  markedByStaffId: string,
  entries: AttendanceEntry[]
): Promise<void> {
  const { error: deleteError } = await supabase
    .from("attendance")
    .delete()
    .eq("slot_id", slotId)
    .eq("date", date);
  if (deleteError) throw deleteError;

  if (entries.length === 0) return;

  const { error: insertError } = await supabase.from("attendance").insert(
    entries.map((entry) => ({
      slot_id: slotId,
      date,
      student_id: entry.studentId,
      status: entry.status,
      marked_by_staff_id: markedByStaffId,
    }))
  );
  if (insertError) throw insertError;
}
