import type { AuthUser } from "../../models";
import { db, networkDelay } from "../mockStore";
import { ADMIN_ACCOUNT } from "../mock/seed";

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Incorrect email or password.");
    this.name = "InvalidCredentialsError";
  }
}

export async function login(email: string, password: string): Promise<AuthUser> {
  await networkDelay();
  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedEmail === ADMIN_ACCOUNT.email && password === ADMIN_ACCOUNT.password) {
    return { uid: "admin-1", email: ADMIN_ACCOUNT.email, role: "admin", name: ADMIN_ACCOUNT.name };
  }

  const staff = db.staff.find((member) => member.email.toLowerCase() === normalizedEmail);
  const expectedPassword = staff ? db.staffPasswords[staff.email] : undefined;
  if (staff && expectedPassword === password) {
    return { uid: staff.id, email: staff.email, role: "staff", staffId: staff.id, name: staff.name };
  }

  throw new InvalidCredentialsError();
}
