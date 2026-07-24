import { findConflict, timeRangesOverlap } from "../slotConflictChecker";
import type { Slot } from "../../models";

describe("timeRangesOverlap", () => {
  it("detects a partial overlap", () => {
    expect(timeRangesOverlap("09:00", "10:00", "09:30", "10:30")).toBe(true);
  });

  it("detects one range fully containing another", () => {
    expect(timeRangesOverlap("09:00", "12:00", "10:00", "11:00")).toBe(true);
  });

  it("treats back-to-back ranges as non-overlapping", () => {
    expect(timeRangesOverlap("09:00", "10:00", "10:00", "11:00")).toBe(false);
  });

  it("treats disjoint ranges as non-overlapping", () => {
    expect(timeRangesOverlap("09:00", "10:00", "11:00", "12:00")).toBe(false);
  });
});

describe("findConflict", () => {
  const baseSlot: Slot = {
    id: "slot-1",
    subjectId: "subject-1",
    staffId: "staff-1",
    dayOfWeek: "Mon",
    startTime: "09:00",
    endTime: "10:00",
  };

  it("returns the conflicting slot for the same staff, day, and overlapping time", () => {
    const result = findConflict([baseSlot], {
      staffId: "staff-1",
      dayOfWeek: "Mon",
      startTime: "09:30",
      endTime: "10:30",
    });
    expect(result).toBe(baseSlot);
  });

  it("returns null when the staff member is different", () => {
    const result = findConflict([baseSlot], {
      staffId: "staff-2",
      dayOfWeek: "Mon",
      startTime: "09:00",
      endTime: "10:00",
    });
    expect(result).toBeNull();
  });

  it("returns null when the day is different", () => {
    const result = findConflict([baseSlot], {
      staffId: "staff-1",
      dayOfWeek: "Tue",
      startTime: "09:00",
      endTime: "10:00",
    });
    expect(result).toBeNull();
  });

  it("ignores the slot being edited when excludeSlotId matches", () => {
    const result = findConflict([baseSlot], {
      staffId: "staff-1",
      dayOfWeek: "Mon",
      startTime: "09:00",
      endTime: "10:00",
    }, "slot-1");
    expect(result).toBeNull();
  });
});
