import { supabase } from "../supabase";
import type { Subject } from "../../models";

function toSubject(row: { id: string; name: string; course_id: string }): Subject {
  return { id: row.id, name: row.name, courseId: row.course_id };
}

export async function list(): Promise<Subject[]> {
  const { data, error } = await supabase.from("subjects").select("*");
  if (error) throw error;
  return (data ?? []).map(toSubject);
}

export async function listByIds(subjectIds: string[]): Promise<Subject[]> {
  if (subjectIds.length === 0) return [];
  const { data, error } = await supabase.from("subjects").select("*").in("id", subjectIds);
  if (error) throw error;
  return (data ?? []).map(toSubject);
}
