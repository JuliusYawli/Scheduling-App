import type { AttendanceRecord, AttendanceStatus } from "../../models";
import { db, networkDelay, nextId } from "../mockStore";

export async function listForSlotAndDate(slotId: string, date: string): Promise<AttendanceRecord[]> {
  await networkDelay();
  return db.attendance.filter((record) => record.slotId === slotId && record.date === date);
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
  await networkDelay();
  db.attendance = db.attendance.filter(
    (record) => !(record.slotId === slotId && record.date === date)
  );
  const records: AttendanceRecord[] = entries.map((entry) => ({
    id: nextId("attendance"),
    slotId,
    date,
    studentId: entry.studentId,
    status: entry.status,
    markedByStaffId,
  }));
  db.attendance.push(...records);
}
