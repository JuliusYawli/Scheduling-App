import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Chip, HelperText, RadioButton, Text, TextInput } from "react-native-paper";
import { useStaffList } from "../../data/queries/staff";
import { useSubjectList } from "../../data/queries/courses";
import { useAddSlot } from "../../data/queries/slots";
import { SlotConflictError } from "../../data/repositories/slotRepository";
import { DAYS_OF_WEEK } from "../../models";
import type { DayOfWeek } from "../../models";
import type { AdminStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<AdminStackParamList, "AddSlot">;

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export default function AddSlotScreen({ navigation }: Props) {
  const { data: subjects } = useSubjectList();
  const { data: staff } = useStaffList();
  const addSlot = useAddSlot();

  const [subjectId, setSubjectId] = useState<string | undefined>(undefined);
  const [staffId, setStaffId] = useState<string | undefined>(undefined);
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>("Mon");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!subjectId || !staffId) {
      setFormError("Choose a subject and a staff member.");
      return;
    }
    if (!TIME_PATTERN.test(startTime) || !TIME_PATTERN.test(endTime)) {
      setFormError("Times must be in 24-hour HH:MM format, e.g. 09:00.");
      return;
    }
    if (startTime >= endTime) {
      setFormError("End time must be after start time.");
      return;
    }
    setFormError(null);
    try {
      await addSlot.mutateAsync({ subjectId, staffId, dayOfWeek, startTime, endTime });
      navigation.navigate("Timetable");
    } catch (err) {
      if (err instanceof SlotConflictError) {
        setFormError(
          `Staff already booked ${err.conflictingSlot.dayOfWeek} ${err.conflictingSlot.startTime}–${err.conflictingSlot.endTime}.`
        );
      } else {
        setFormError("Could not save this slot. Try again.");
      }
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="labelLarge" style={styles.sectionLabel}>
        Subject
      </Text>
      <RadioButton.Group onValueChange={setSubjectId} value={subjectId ?? ""}>
        {(subjects ?? []).map((subject) => (
          <RadioButton.Item key={subject.id} label={subject.name} value={subject.id} />
        ))}
      </RadioButton.Group>

      <Text variant="labelLarge" style={styles.sectionLabel}>
        Staff
      </Text>
      <RadioButton.Group onValueChange={setStaffId} value={staffId ?? ""}>
        {(staff ?? []).map((member) => (
          <RadioButton.Item key={member.id} label={member.name} value={member.id} />
        ))}
      </RadioButton.Group>

      <Text variant="labelLarge" style={styles.sectionLabel}>
        Day of week
      </Text>
      <View style={styles.dayRow}>
        {DAYS_OF_WEEK.map((day) => (
          <Chip
            key={day}
            selected={dayOfWeek === day}
            onPress={() => setDayOfWeek(day)}
            style={styles.dayChip}
          >
            {day}
          </Chip>
        ))}
      </View>

      <View style={styles.timeRow}>
        <TextInput
          label="Start (HH:MM)"
          value={startTime}
          onChangeText={setStartTime}
          style={styles.timeInput}
        />
        <TextInput
          label="End (HH:MM)"
          value={endTime}
          onChangeText={setEndTime}
          style={styles.timeInput}
        />
      </View>

      {formError ? <HelperText type="error">{formError}</HelperText> : null}

      <Button mode="contained" onPress={handleSubmit} loading={addSlot.isPending} style={styles.submit}>
        Save slot
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  sectionLabel: { marginTop: 12, marginBottom: 4, color: "#5B6773" },
  dayRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  dayChip: { marginBottom: 4 },
  timeRow: { flexDirection: "row", gap: 12, marginTop: 12 },
  timeInput: { flex: 1 },
  submit: { marginTop: 20 },
});
