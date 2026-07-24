import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, SegmentedButtons, Text } from "react-native-paper";
import Centered from "../../components/Centered";
import { useSlotsByStaff } from "../../data/queries/slots";
import { useSubjectList } from "../../data/queries/courses";
import { useStudentsByCourse } from "../../data/queries/students";
import { useAttendanceForSlot, useSaveAttendance } from "../../data/queries/attendance";
import { useAuthStore } from "../../store/useAuthStore";
import type { AttendanceStatus } from "../../models";
import type { StaffStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<StaffStackParamList, "AttendanceMark">;

const today = new Date().toISOString().slice(0, 10);

export default function AttendanceMarkScreen({ route }: Props) {
  const { slotId, subjectName } = route.params;
  const { user } = useAuthStore();

  const { data: slots } = useSlotsByStaff(user?.staffId);
  const slot = slots?.find((item) => item.id === slotId);

  const { data: subjects } = useSubjectList();
  const subject = subjects?.find((item) => item.id === slot?.subjectId);

  const { data: students, isLoading: studentsLoading } = useStudentsByCourse(subject?.courseId);
  const { data: existingRecords } = useAttendanceForSlot(slotId, today);
  const saveAttendance = useSaveAttendance();

  const [statusByStudent, setStatusByStudent] = useState<Record<string, AttendanceStatus>>({});

  useEffect(() => {
    if (!students) return;
    setStatusByStudent((current) => {
      const next = { ...current };
      for (const student of students) {
        if (next[student.id]) continue;
        const existing = existingRecords?.find((record) => record.studentId === student.id);
        next[student.id] = existing?.status ?? "present";
      }
      return next;
    });
  }, [students, existingRecords]);

  if (studentsLoading || !students || !user?.staffId) {
    return (
      <Centered>
        <ActivityIndicator />
      </Centered>
    );
  }

  async function handleSave() {
    if (!user?.staffId) return;
    await saveAttendance.mutateAsync({
      slotId,
      date: today,
      markedByStaffId: user.staffId,
      entries: students!.map((student) => ({
        studentId: student.id,
        status: statusByStudent[student.id] ?? "present",
      })),
    });
  }

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.header}>
        {subjectName} · {today}
      </Text>
      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Centered>
            <Text>No students enrolled in this course yet.</Text>
          </Centered>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text variant="bodyLarge" style={styles.studentName}>
              {item.name}
            </Text>
            <SegmentedButtons
              value={statusByStudent[item.id] ?? "present"}
              onValueChange={(value) =>
                setStatusByStudent((current) => ({ ...current, [item.id]: value as AttendanceStatus }))
              }
              buttons={[
                { value: "present", label: "Present" },
                { value: "absent", label: "Absent" },
              ]}
              style={styles.segmented}
            />
          </View>
        )}
      />
      <Button
        mode="contained"
        onPress={handleSave}
        loading={saveAttendance.isPending}
        style={styles.saveButton}
      >
        Save attendance
      </Button>
      {saveAttendance.isSuccess ? (
        <Text variant="bodySmall" style={styles.savedText}>
          Saved.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, paddingBottom: 4 },
  list: { paddingHorizontal: 16, gap: 12 },
  row: { gap: 6 },
  studentName: { fontWeight: "600" },
  segmented: { marginBottom: 4 },
  saveButton: { margin: 16 },
  savedText: { textAlign: "center", color: "#5B6773", marginTop: -8, marginBottom: 12 },
});
