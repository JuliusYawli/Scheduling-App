import type { AppNotification, NotificationType, Slot } from "../../models";
import { db, networkDelay, nextId } from "../mockStore";
import { subjectSeed } from "../mock/seed";

export async function listForStaff(staffId: string): Promise<AppNotification[]> {
  await networkDelay();
  return db.notifications
    .filter((notification) => notification.recipientStaffId === staffId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function markRead(id: string): Promise<void> {
  await networkDelay(120);
  const notification = db.notifications.find((item) => item.id === id);
  if (notification) notification.read = true;
}

/** Stands in for the onSlotCreated/onSlotChanged Cloud Function. */
export function notifyStaffOfSlot(slot: Slot, type: NotificationType): void {
  const subject = db.subjects.find((item) => item.id === slot.subjectId) ?? subjectSeed[0];
  const notification: AppNotification = {
    id: nextId("notif"),
    recipientStaffId: slot.staffId,
    slotId: slot.id,
    type,
    message: `New class scheduled: ${subject.name} — ${slot.dayOfWeek} ${slot.startTime}–${slot.endTime}`,
    read: false,
    createdAt: new Date().toISOString(),
  };
  db.notifications.push(notification);
}
