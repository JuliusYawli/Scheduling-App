import { supabase } from "../supabase";
import type { Student } from "../../models";

function toStudent(row: { id: string; name: string; course_id: string }): Student {
  return { id: row.id, name: row.name, courseId: row.course_id };
}

export async function list(): Promise<Student[]> {
  const { data, error } = await supabase.from("students").select("*");
  if (error) throw error;
  return (data ?? []).map(toStudent);
}

export async function listByCourse(courseId: string): Promise<Student[]> {
  const { data, error } = await supabase.from("students").select("*").eq("course_id", courseId);
  if (error) throw error;
  return (data ?? []).map(toStudent);
}

export async function add(name: string, courseId: string): Promise<Student> {
  const { data, error } = await supabase
    .from("students")
    .insert({ name, course_id: courseId })
    .select()
    .single();
  if (error) throw error;
  return toStudent(data);
}
