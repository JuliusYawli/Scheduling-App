import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FlatList, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Card, IconButton, Text } from "react-native-paper";
import Centered from "../../components/Centered";
import { useStaffList, useRemoveStaff } from "../../data/queries/staff";
import { useSubjectList } from "../../data/queries/courses";
import type { AdminStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<AdminStackParamList, "StaffList">;

export default function StaffListScreen({ navigation }: Props) {
  const { data: staff, isLoading } = useStaffList();
  const { data: subjects } = useSubjectList();
  const removeStaff = useRemoveStaff();

  if (isLoading || !staff) {
    return (
      <Centered>
        <ActivityIndicator />
      </Centered>
    );
  }

  const subjectNamesFor = (subjectIds: string[]) =>
    subjectIds
      .map((id) => subjects?.find((subject) => subject.id === id)?.name)
      .filter(Boolean)
      .join(", ") || "No subjects assigned";

  return (
    <View style={styles.container}>
      <Button mode="contained" style={styles.addButton} onPress={() => navigation.navigate("AddStaff")}>
        Add Staff
      </Button>
      <FlatList
        data={staff}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Centered>
            <Text>No staff added yet.</Text>
          </Centered>
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.info}>
                <Text variant="titleMedium">{item.name}</Text>
                <Text variant="bodySmall" style={styles.muted}>
                  {item.email} · {item.contactNumber}
                </Text>
                <Text variant="bodySmall" style={styles.muted}>
                  {subjectNamesFor(item.subjectIds)}
                </Text>
              </View>
              <IconButton icon="delete-outline" onPress={() => removeStaff.mutate(item.id)} />
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  addButton: { margin: 16, marginBottom: 8 },
  list: { padding: 16, paddingTop: 8, gap: 10 },
  card: { borderRadius: 12 },
  cardContent: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  info: { flex: 1 },
  muted: { color: "#5B6773", marginTop: 2 },
});
