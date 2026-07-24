export type Role = "admin" | "staff";

export type DayOfWeek = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";

export const DAYS_OF_WEEK: DayOfWeek[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export interface AuthUser {
  uid: string;
  email: string;
  role: Role;
  staffId?: string;
  name: string;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  contactNumber: string;
  subjectIds: string[];
}

export interface Course {
  id: string;
  name: string;
}

export interface Subject {
  id: string;
  name: string;
  courseId: string;
}

export interface Student {
  id: string;
  name: string;
  courseId: string;
}

export interface Slot {
  id: string;
  subjectId: string;
  staffId: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // "HH:MM", 24h
  endTime: string; // "HH:MM", 24h
}

export type AttendanceStatus = "present" | "absent";

export interface AttendanceRecord {
  id: string;
  slotId: string;
  studentId: string;
  date: string; // ISO date, "YYYY-MM-DD"
  status: AttendanceStatus;
  markedByStaffId: string;
}

export type NotificationType = "staff_created" | "slot_created" | "slot_changed";

export interface AppNotification {
  id: string;
  recipientStaffId: string;
  slotId?: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: string; // ISO timestamp
}
