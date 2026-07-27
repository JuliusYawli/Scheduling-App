import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { DAYS_OF_WEEK } from "../models";
import type { DayOfWeek, Slot, Staff, Subject } from "../models";

interface Props {
  slots: Slot[];
  subjects: Subject[];
  staff: Staff[];
  /** Hide the staff name column, e.g. on the staff member's own timetable. */
  showStaffName?: boolean;
  /** When provided, slot cards become pressable (e.g. Admin tapping to delete). */
  onSlotPress?: (slot: Slot) => void;
}

const FULL_DAY_NAME: Record<DayOfWeek, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
};

function todayAbbreviation(): DayOfWeek | null {
  const jsDay = new Date().getDay();
  return DAYS_OF_WEEK[jsDay - 1] ?? null;
}

export default function WeeklyTimetable({
  slots,
  subjects,
  staff,
  showStaffName = true,
  onSlotPress,
}: Props) {
  const subjectById = new Map(subjects.map((subject) => [subject.id, subject]));
  const staffById = new Map(staff.map((member) => [member.id, member]));
  const today = todayAbbreviation();

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {DAYS_OF_WEEK.map((day) => {
        const isToday = day === today;
        const daySlots = slots
          .filter((slot) => slot.dayOfWeek === day)
          .sort((a, b) => a.startTime.localeCompare(b.startTime));

        return (
          <View key={day} style={styles.daySection}>
            <View style={styles.dayHeaderRow}>
              <Text variant="titleMedium" style={[styles.dayHeader, isToday && styles.dayHeaderToday]}>
                {FULL_DAY_NAME[day]}
              </Text>
              {isToday ? (
                <View style={styles.todayBadge}>
                  <Text variant="labelSmall" style={styles.todayBadgeText}>
                    TODAY
                  </Text>
                </View>
              ) : null}
            </View>

            {daySlots.length === 0 ? (
              <Text variant="bodySmall" style={styles.empty}>
                No classes scheduled
              </Text>
            ) : (
              daySlots.map((slot) => (
                <Pressable
                  key={slot.id}
                  style={styles.slotCard}
                  disabled={!onSlotPress}
                  onPress={() => onSlotPress?.(slot)}
                >
                  <Text variant="labelLarge" style={styles.time}>
                    {slot.startTime}–{slot.endTime}
                  </Text>
                  <View style={styles.slotDetails}>
                    <Text variant="bodyLarge" style={styles.subject}>
                      {subjectById.get(slot.subjectId)?.name ?? "Unknown subject"}
                    </Text>
                    {showStaffName ? (
                      <Text variant="bodySmall" style={styles.staffName}>
                        {staffById.get(slot.staffId)?.name ?? "Unassigned"}
                      </Text>
                    ) : null}
                  </View>
                </Pressable>
              ))
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingVertical: 8, paddingBottom: 24 },
  daySection: { marginBottom: 20 },
  dayHeaderRow: { flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 8 },
  dayHeader: { color: "#3A4551" },
  dayHeaderToday: { color: "#B36A14" },
  todayBadge: {
    backgroundColor: "#FCEEDD",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  todayBadgeText: { color: "#B36A14", letterSpacing: 0.5 },
  empty: { color: "#94A0AC", paddingLeft: 2 },
  slotCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DBE2E8",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  time: { color: "#B36A14", width: 92 },
  slotDetails: { flex: 1 },
  subject: { fontWeight: "600" },
  staffName: { color: "#5B6773", marginTop: 2 },
});
