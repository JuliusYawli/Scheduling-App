import { supabase } from "../supabase";
import type { Staff } from "../../models";

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

interface StaffRow {
  id: string;
  name: string;
  email: string;
  contact_number: string;
  subject_ids: string[];
}

function toStaff(row: StaffRow): Staff {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    contactNumber: row.contact_number,
    subjectIds: row.subject_ids,
  };
}

async function parseFunctionErrorBody(error: unknown): Promise<{ error?: string } | null> {
  const context = (error as { context?: unknown } | null)?.context;
  if (!(context instanceof Response)) return null;
  try {
    return await context.json();
  } catch {
    return null;
  }
}

export async function list(): Promise<Staff[]> {
  const { data, error } = await supabase.from("staff").select("*");
  if (error) throw error;
  return (data ?? []).map(toStaff);
}

/**
 * Creating the Auth account has to happen server-side — it needs the
 * service role key, which must never ship inside the app bundle. The
 * create-staff Edge Function (supabase/functions/create-staff) holds that
 * key, checks the caller is really an admin, then creates the Auth user and
 * the staff/profiles rows together. supabase.functions.invoke automatically
 * forwards the admin's own session token, which the function uses for that
 * check.
 */
export async function add(input: NewStaffInput): Promise<Staff> {
  const { data, error } = await supabase.functions.invoke("create-staff", {
    body: {
      name: input.name,
      email: input.email.trim().toLowerCase(),
      contactNumber: input.contactNumber,
      password: input.password,
      subjectIds: input.subjectIds,
    },
  });
  if (error) {
    const body = await parseFunctionErrorBody(error);
    if (body?.error === "email-taken") {
      throw new DuplicateEmailError();
    }
    throw error;
  }
  return toStaff(data as StaffRow);
}

/**
 * Deleting the Auth account also needs the service role key — the
 * delete-staff Edge Function handles the Auth user plus the staff/profiles
 * rows together; slots and attendance for this staff member are already
 * gone via ON DELETE CASCADE once the staff row is deleted.
 */
export async function remove(id: string): Promise<void> {
  const { error } = await supabase.functions.invoke("delete-staff", {
    body: { staffId: id },
  });
  if (error) throw error;
}
