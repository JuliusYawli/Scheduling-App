import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Card, Text } from "react-native-paper";
import Centered from "../../components/Centered";
import { useCourseList } from "../../data/queries/courses";
import { useStudentList } from "../../data/queries/students";
import type { AdminStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<AdminStackParamList, "StudentList">;

export default function StudentListScreen({ navigation }: Props) {
  const { data: students, isLoading, isRefetching, refetch } = useStudentList();
  const { data: courses } = useCourseList();

  if (isLoading || !students) {
    return (
      <Centered>
        <ActivityIndicator />
      </Centered>
    );
  }

  return (
    <View style={styles.container}>
      <Button mode="contained" style={styles.addButton} onPress={() => navigation.navigate("AddStudent")}>
        Add Student
      </Button>
      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListEmptyComponent={
          <Centered>
            <Text>No students added yet.</Text>
          </Centered>
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium">{item.name}</Text>
              <Text variant="bodySmall" style={styles.muted}>
                {courses?.find((course) => course.id === item.courseId)?.name ?? "No course"}
              </Text>
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
  muted: { color: "#5B6773", marginTop: 4 },
});
