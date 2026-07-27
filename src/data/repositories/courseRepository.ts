import { supabase } from "../supabase";
import type { Course, Subject } from "../../models";

export class DuplicateCourseNameError extends Error {
  constructor() {
    super("A course with this name already exists.");
    this.name = "DuplicateCourseNameError";
  }
}

function toCourse(row: { id: string; name: string }): Course {
  return { id: row.id, name: row.name };
}

export async function list(): Promise<Course[]> {
  const { data, error } = await supabase.from("courses").select("*");
  if (error) throw error;
  return (data ?? []).map(toCourse);
}

export async function add(name: string, subjectNames: string[]): Promise<{ course: Course; subjects: Subject[] }> {
  const { data: courseRow, error: courseError } = await supabase
    .from("courses")
    .insert({ name: name.trim() })
    .select()
    .single();
  if (courseError) {
    if (courseError.code === "23505") throw new DuplicateCourseNameError();
    throw courseError;
  }
  const course = toCourse(courseRow);

  const uniqueSubjectNames = [
    ...new Set(subjectNames.map((subjectName) => subjectName.trim()).filter(Boolean)),
  ];
  if (uniqueSubjectNames.length === 0) {
    return { course, subjects: [] };
  }

  const { data: subjectRows, error: subjectError } = await supabase
    .from("subjects")
    .insert(uniqueSubjectNames.map((subjectName) => ({ name: subjectName, course_id: course.id })))
    .select();
  if (subjectError) throw subjectError;

  const subjects: Subject[] = (subjectRows ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    courseId: row.course_id,
  }));
  return { course, subjects };
}
