import type { Course, Subject } from "../../models";
import { db, networkDelay, nextId } from "../mockStore";

export class DuplicateCourseNameError extends Error {
  constructor() {
    super("A course with this name already exists.");
    this.name = "DuplicateCourseNameError";
  }
}

export async function list(): Promise<Course[]> {
  await networkDelay();
  return [...db.courses];
}

export async function add(name: string, subjectNames: string[]): Promise<{ course: Course; subjects: Subject[] }> {
  await networkDelay();
  const normalizedName = name.trim().toLowerCase();
  if (db.courses.some((existing) => existing.name.toLowerCase() === normalizedName)) {
    throw new DuplicateCourseNameError();
  }
  const course: Course = { id: nextId("course"), name: name.trim() };
  db.courses.push(course);
  const uniqueSubjectNames = [
    ...new Set(subjectNames.map((subjectName) => subjectName.trim()).filter(Boolean)),
  ];
  const subjects = uniqueSubjectNames.map((subjectName) => ({
    id: nextId("subject"),
    name: subjectName,
    courseId: course.id,
  }));
  db.subjects.push(...subjects);
  return { course, subjects };
}
