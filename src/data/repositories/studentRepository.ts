import type { Student } from "../../models";
import { db, networkDelay, nextId } from "../mockStore";

export async function list(): Promise<Student[]> {
  await networkDelay();
  return [...db.students];
}

export async function listByCourse(courseId: string): Promise<Student[]> {
  await networkDelay();
  return db.students.filter((student) => student.courseId === courseId);
}

export async function add(name: string, courseId: string): Promise<Student> {
  await networkDelay();
  const student: Student = { id: nextId("student"), name, courseId };
  db.students.push(student);
  return student;
}
