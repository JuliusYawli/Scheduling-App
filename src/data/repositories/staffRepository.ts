import type { Staff } from "../../models";
import { db, networkDelay, nextId } from "../mockStore";
import { ADMIN_ACCOUNT } from "../mock/seed";

export interface NewStaffInput {
  name: string;
  email: string;
  contactNumber: string;
  password: string;
  subjectIds: string[];
}

export class DuplicateEmailError extends Error {
  constructor() {
    super("A staff member with this email already exists.");
    this.name = "DuplicateEmailError";
  }
}

export async function list(): Promise<Staff[]> {
  await networkDelay();
  return [...db.staff];
}

export async function add(input: NewStaffInput): Promise<Staff> {
  await networkDelay();
  const normalizedEmail = input.email.trim().toLowerCase();
  const emailTaken =
    normalizedEmail === ADMIN_ACCOUNT.email ||
    db.staff.some((member) => member.email.toLowerCase() === normalizedEmail);
  if (emailTaken) {
    throw new DuplicateEmailError();
  }
  const staff: Staff = {
    id: nextId("staff"),
    name: input.name,
    email: input.email,
    contactNumber: input.contactNumber,
    subjectIds: input.subjectIds,
  };
  db.staff.push(staff);
  db.staffPasswords[staff.email] = input.password;
  return staff;
}

export async function remove(id: string): Promise<void> {
  await networkDelay();
  const staff = db.staff.find((member) => member.id === id);
  db.staff = db.staff.filter((member) => member.id !== id);
  db.slots = db.slots.filter((slot) => slot.staffId !== id);
  if (staff) delete db.staffPasswords[staff.email];
}
