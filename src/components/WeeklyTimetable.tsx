import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { DAYS_OF_WEEK } from "../models";
import type { Slot, Staff, Subject } from "../models";

interface Props {
  slots: Slot[];
  subjects: Subject[];
  staff: Staff[];
  /** Hide the staff name column, e.g. on the staff member's own timetable. */
  showStaffName?: boolean;
  /** When provided, slot cards become pressable (e.g. Admin tapping to delete). */
  onSlotPress?: (slot: Slot) => void;
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

  return (
    <ScrollView horizontal contentContainerStyle={styles.row}>
      {DAYS_OF_WEEK.map((day) => {
        const daySlots = slots
          .filter((slot) => slot.dayOfWeek === day)
          .sort((a, b) => a.startTime.localeCompare(b.startTime));

        return (
          <View key={day} style={styles.column}>
            <Text variant="labelLarge" style={styles.dayHeader}>
              {day}
            </Text>
            {daySlots.length === 0 ? (
              <Text variant="bodySmall" style={styles.empty}>
                —
              </Text>
            ) : (
              daySlots.map((slot) => (
                <Pressable
                  key={slot.id}
                  style={styles.slotCard}
                  disabled={!onSlotPress}
                  onPress={() => onSlotPress?.(slot)}
                >
                  <Text variant="labelSmall" style={styles.time}>
                    {slot.startTime}–{slot.endTime}
                  </Text>
                  <Text variant="bodyMedium" style={styles.subject}>
                    {subjectById.get(slot.subjectId)?.name ?? "Unknown subject"}
                  </Text>
                  {showStaffName ? (
                    <Text variant="bodySmall" style={styles.staffName}>
                      {staffById.get(slot.staffId)?.name ?? "Unassigned"}
                    </Text>
                  ) : null}
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
  row: { paddingHorizontal: 12, paddingVertical: 8, gap: 10 },
  column: { width: 148 },
  dayHeader: { marginBottom: 8, color: "#5B6773", letterSpacing: 0.5 },
  empty: { color: "#94A0AC" },
  slotCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DBE2E8",
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  time: { color: "#B36A14", marginBottom: 2 },
  subject: { fontWeight: "600" },
  staffName: { color: "#5B6773", marginTop: 2 },
});
