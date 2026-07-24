import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Button, Checkbox, HelperText, Text, TextInput } from "react-native-paper";
import { useSubjectList } from "../../data/queries/courses";
import { useAddStaff } from "../../data/queries/staff";
import type { AdminStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<AdminStackParamList, "AddStaff">;

export default function AddStaffScreen({ navigation }: Props) {
  const { data: subjects } = useSubjectList();
  const addStaff = useAddStaff();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [password, setPassword] = useState("");
  const [subjectIds, setSubjectIds] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  function toggleSubject(id: string) {
    setSubjectIds((current) =>
      current.includes(id) ? current.filter((existing) => existing !== id) : [...current, id]
    );
  }

  async function handleSubmit() {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setFormError("Name, email, and password are required.");
      return;
    }
    setFormError(null);
    await addStaff.mutateAsync({ name, email, contactNumber, password, subjectIds });
    navigation.goBack();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput label="Full name" value={name} onChangeText={setName} style={styles.input} />
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        label="Contact number"
        value={contactNumber}
        onChangeText={setContactNumber}
        keyboardType="phone-pad"
        style={styles.input}
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <Text variant="labelLarge" style={styles.sectionLabel}>
        Subjects taught
      </Text>
      {(subjects ?? []).map((subject) => (
        <Checkbox.Item
          key={subject.id}
          label={subject.name}
          status={subjectIds.includes(subject.id) ? "checked" : "unchecked"}
          onPress={() => toggleSubject(subject.id)}
        />
      ))}

      {formError ? <HelperText type="error">{formError}</HelperText> : null}
      {addStaff.isError ? (
        <HelperText type="error">
          {addStaff.error instanceof Error ? addStaff.error.message : "Could not add staff."}
        </HelperText>
      ) : null}

      <Button mode="contained" onPress={handleSubmit} loading={addStaff.isPending} style={styles.submit}>
        Save staff member
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  input: { marginBottom: 12 },
  sectionLabel: { marginTop: 8, marginBottom: 4, color: "#5B6773" },
  submit: { marginTop: 16 },
});
