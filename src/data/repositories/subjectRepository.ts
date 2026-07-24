import type { Subject } from "../../models";
import { db, networkDelay } from "../mockStore";

export async function list(): Promise<Subject[]> {
  await networkDelay();
  return [...db.subjects];
}

export async function listByIds(subjectIds: string[]): Promise<Subject[]> {
  await networkDelay();
  return db.subjects.filter((subject) => subjectIds.includes(subject.id));
}
