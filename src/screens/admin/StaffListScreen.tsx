import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Card, IconButton, Text } from "react-native-paper";
import Centered from "../../components/Centered";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useStaffList, useRemoveStaff } from "../../data/queries/staff";
import { useSubjectList } from "../../data/queries/courses";
import type { Staff } from "../../models";
import type { AdminStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<AdminStackParamList, "StaffList">;

export default function StaffListScreen({ navigation }: Props) {
  const { data: staff, isLoading, isRefetching, refetch } = useStaffList();
  const { data: subjects } = useSubjectList();
  const removeStaff = useRemoveStaff();
  const [pendingDelete, setPendingDelete] = useState<Staff | null>(null);

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

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    await removeStaff.mutateAsync(pendingDelete.id);
    setPendingDelete(null);
  }

  return (
    <View style={styles.container}>
      <Button mode="contained" style={styles.addButton} onPress={() => navigation.navigate("AddStaff")}>
        Add Staff
      </Button>
      <FlatList
        data={staff}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
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
              <IconButton icon="delete-outline" onPress={() => setPendingDelete(item)} />
            </Card.Content>
          </Card>
        )}
      />

      <ConfirmDialog
        visible={pendingDelete !== null}
        title="Remove staff member?"
        message={`This deletes ${pendingDelete?.name ?? "this staff member"} and any slots already scheduled for them. This can't be undone.`}
        loading={removeStaff.isPending}
        onConfirm={handleConfirmDelete}
        onDismiss={() => setPendingDelete(null)}
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
