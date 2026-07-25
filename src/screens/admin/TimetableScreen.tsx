import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import Centered from "../../components/Centered";
import ConfirmDialog from "../../components/ConfirmDialog";
import WeeklyTimetable from "../../components/WeeklyTimetable";
import { useRemoveSlot, useSlotList } from "../../data/queries/slots";
import { useSubjectList } from "../../data/queries/courses";
import { useStaffList } from "../../data/queries/staff";
import type { Slot } from "../../models";

export default function TimetableScreen() {
  const { data: slots, isLoading: slotsLoading } = useSlotList();
  const { data: subjects } = useSubjectList();
  const { data: staff } = useStaffList();
  const removeSlot = useRemoveSlot();
  const [pendingDelete, setPendingDelete] = useState<Slot | null>(null);

  if (slotsLoading || !slots || !subjects || !staff) {
    return (
      <Centered>
        <ActivityIndicator />
      </Centered>
    );
  }

  const pendingSubjectName = subjects.find((subject) => subject.id === pendingDelete?.subjectId)?.name;

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    await removeSlot.mutateAsync(pendingDelete.id);
    setPendingDelete(null);
  }

  return (
    <View style={styles.container}>
      <Text variant="bodySmall" style={styles.hint}>
        Tap a class to remove it from the timetable.
      </Text>
      <WeeklyTimetable
        slots={slots}
        subjects={subjects}
        staff={staff}
        onSlotPress={(slot) => setPendingDelete(slot)}
      />

      <ConfirmDialog
        visible={pendingDelete !== null}
        title="Remove this class?"
        message={`This removes ${pendingSubjectName ?? "this class"} (${pendingDelete?.dayOfWeek} ${pendingDelete?.startTime}–${pendingDelete?.endTime}) from the timetable.`}
        loading={removeSlot.isPending}
        onConfirm={handleConfirmDelete}
        onDismiss={() => setPendingDelete(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 12 },
  hint: { color: "#5B6773", paddingHorizontal: 16, marginBottom: 4 },
});
