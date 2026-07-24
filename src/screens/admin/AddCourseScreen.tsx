import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Button, HelperText, Text, TextInput } from "react-native-paper";
import { useAddCourse } from "../../data/queries/courses";
import type { AdminStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<AdminStackParamList, "AddCourse">;

export default function AddCourseScreen({ navigation }: Props) {
  const addCourse = useAddCourse();
  const [name, setName] = useState("");
  const [subjectNames, setSubjectNames] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!name.trim()) {
      setFormError("Course name is required.");
      return;
    }
    setFormError(null);
    await addCourse.mutateAsync({
      name,
      subjectNames: subjectNames.split(",").map((subject) => subject.trim()),
    });
    navigation.goBack();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput label="Course name" value={name} onChangeText={setName} style={styles.input} />
      <TextInput
        label="Subjects (comma-separated)"
        value={subjectNames}
        onChangeText={setSubjectNames}
        placeholder="Core Java, Advance Java"
        multiline
        style={styles.input}
      />
      <Text variant="bodySmall" style={styles.hint}>
        Example: "Core Java, Advance Java" adds two subjects under this course.
      </Text>

      {formError ? <HelperText type="error">{formError}</HelperText> : null}

      <Button mode="contained" onPress={handleSubmit} loading={addCourse.isPending} style={styles.submit}>
        Save course
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: { marginBottom: 8 },
  hint: { color: "#5B6773", marginBottom: 12 },
  submit: { marginTop: 8 },
});
