import type { Course, Subject } from "../../models";
import { db, networkDelay, nextId } from "../mockStore";

export async function list(): Promise<Course[]> {
  await networkDelay();
  return [...db.courses];
}

export async function add(name: string, subjectNames: string[]): Promise<{ course: Course; subjects: Subject[] }> {
  await networkDelay();
  const course: Course = { id: nextId("course"), name };
  db.courses.push(course);
  const subjects = subjectNames
    .map((subjectName) => subjectName.trim())
    .filter(Boolean)
    .map((subjectName) => ({ id: nextId("subject"), name: subjectName, courseId: course.id }));
  db.subjects.push(...subjects);
  return { course, subjects };
}
