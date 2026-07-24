import type {
  AppNotification,
  AttendanceRecord,
  Course,
  Slot,
  Staff,
  Student,
  Subject,
} from "../../models";

export const ADMIN_ACCOUNT = {
  email: "admin@school.edu",
  password: "admin123",
  name: "Admin",
};

// Staff passwords, keyed by email — this stands in for Firebase Auth until
// Phase 0's real Firebase project exists. See src/data/repositories/authRepository.ts.
export const STAFF_PASSWORDS: Record<string, string> = {
  "grace.mensah@school.edu": "staff123",
  "kwame.owusu@school.edu": "staff123",
};

export const staffSeed: Staff[] = [
  {
    id: "staff-1",
    name: "Grace Mensah",
    email: "grace.mensah@school.edu",
    contactNumber: "024-555-0101",
    subjectIds: ["subject-1", "subject-2"],
  },
  {
    id: "staff-2",
    name: "Kwame Owusu",
    email: "kwame.owusu@school.edu",
    contactNumber: "024-555-0102",
    subjectIds: ["subject-3", "subject-4"],
  },
];

export const courseSeed: Course[] = [
  { id: "course-1", name: "Java" },
  { id: "course-2", name: "Computer Science" },
];

export const subjectSeed: Subject[] = [
  { id: "subject-1", name: "Core Java", courseId: "course-1" },
  { id: "subject-2", name: "Advance Java", courseId: "course-1" },
  { id: "subject-3", name: "Artificial Intelligence", courseId: "course-2" },
  { id: "subject-4", name: "Machine Learning", courseId: "course-2" },
];

export const studentSeed: Student[] = [
  { id: "student-1", name: "Ama Boateng", courseId: "course-1" },
  { id: "student-2", name: "Kofi Asante", courseId: "course-1" },
  { id: "student-3", name: "Efua Darko", courseId: "course-1" },
  { id: "student-4", name: "Yaw Appiah", courseId: "course-2" },
  { id: "student-5", name: "Abena Osei", courseId: "course-2" },
  { id: "student-6", name: "Kojo Antwi", courseId: "course-2" },
];

export const slotSeed: Slot[] = [
  {
    id: "slot-1",
    subjectId: "subject-1",
    staffId: "staff-1",
    dayOfWeek: "Mon",
    startTime: "09:00",
    endTime: "10:00",
  },
  {
    id: "slot-2",
    subjectId: "subject-2",
    staffId: "staff-1",
    dayOfWeek: "Wed",
    startTime: "11:00",
    endTime: "12:00",
  },
  {
    id: "slot-3",
    subjectId: "subject-3",
    staffId: "staff-2",
    dayOfWeek: "Mon",
    startTime: "10:00",
    endTime: "11:00",
  },
  {
    id: "slot-4",
    subjectId: "subject-4",
    staffId: "staff-2",
    dayOfWeek: "Thu",
    startTime: "13:00",
    endTime: "14:30",
  },
];

export const attendanceSeed: AttendanceRecord[] = [];

export const notificationSeed: AppNotification[] = [
  {
    id: "notif-1",
    recipientStaffId: "staff-1",
    slotId: "slot-1",
    type: "slot_created",
    message: "New class scheduled: Core Java — Mon 09:00–10:00",
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "notif-2",
    recipientStaffId: "staff-2",
    slotId: "slot-4",
    type: "slot_created",
    message: "New class scheduled: Machine Learning — Thu 13:00–14:30",
    read: false,
    createdAt: new Date().toISOString(),
  },
];
