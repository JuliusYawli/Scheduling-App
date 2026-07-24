import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Button, HelperText, RadioButton, Text, TextInput } from "react-native-paper";
import { useCourseList } from "../../data/queries/courses";
import { useAddStudent } from "../../data/queries/students";
import type { AdminStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<AdminStackParamList, "AddStudent">;

export default function AddStudentScreen({ navigation }: Props) {
  const { data: courses } = useCourseList();
  const addStudent = useAddStudent();

  const [name, setName] = useState("");
  const [courseId, setCourseId] = useState<string | undefined>(undefined);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!name.trim() || !courseId) {
      setFormError("Name and course are required.");
      return;
    }
    setFormError(null);
    await addStudent.mutateAsync({ name, courseId });
    navigation.goBack();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput label="Student name" value={name} onChangeText={setName} style={styles.input} />

      <Text variant="labelLarge" style={styles.sectionLabel}>
        Course
      </Text>
      <RadioButton.Group onValueChange={setCourseId} value={courseId ?? ""}>
        {(courses ?? []).map((course) => (
          <RadioButton.Item key={course.id} label={course.name} value={course.id} />
        ))}
      </RadioButton.Group>

      {formError ? <HelperText type="error">{formError}</HelperText> : null}

      <Button mode="contained" onPress={handleSubmit} loading={addStudent.isPending} style={styles.submit}>
        Save student
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: { marginBottom: 12 },
  sectionLabel: { marginBottom: 4, color: "#5B6773" },
  submit: { marginTop: 16 },
});
