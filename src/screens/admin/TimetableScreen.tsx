import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import Centered from "../../components/Centered";
import SlotDetailsDialog from "../../components/SlotDetailsDialog";
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
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  if (slotsLoading || !slots || !subjects || !staff) {
    return (
      <Centered>
        <ActivityIndicator />
      </Centered>
    );
  }

  const selectedSubjectName = subjects.find((subject) => subject.id === selectedSlot?.subjectId)?.name;
  const selectedStaffName = staff.find((member) => member.id === selectedSlot?.staffId)?.name;

  async function handleRemove() {
    if (!selectedSlot) return;
    await removeSlot.mutateAsync(selectedSlot.id);
    setSelectedSlot(null);
  }

  return (
    <View style={styles.container}>
      <Text variant="bodySmall" style={styles.hint}>
        Tap a class to see its details.
      </Text>
      <WeeklyTimetable
        slots={slots}
        subjects={subjects}
        staff={staff}
        onSlotPress={(slot) => setSelectedSlot(slot)}
      />

      <SlotDetailsDialog
        visible={selectedSlot !== null}
        subjectName={selectedSubjectName ?? "Unknown subject"}
        dayOfWeek={selectedSlot?.dayOfWeek ?? ""}
        startTime={selectedSlot?.startTime ?? ""}
        endTime={selectedSlot?.endTime ?? ""}
        staffName={selectedStaffName}
        loading={removeSlot.isPending}
        onRemove={handleRemove}
        onDismiss={() => setSelectedSlot(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 12 },
  hint: { color: "#5B6773", paddingHorizontal: 16, marginBottom: 4 },
});
