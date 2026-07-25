import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Card, Text } from "react-native-paper";
import Centered from "../../components/Centered";
import { useCourseList, useSubjectList } from "../../data/queries/courses";
import type { AdminStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<AdminStackParamList, "CourseList">;

export default function CourseListScreen({ navigation }: Props) {
  const { data: courses, isLoading, isRefetching, refetch } = useCourseList();
  const { data: subjects } = useSubjectList();

  if (isLoading || !courses) {
    return (
      <Centered>
        <ActivityIndicator />
      </Centered>
    );
  }

  return (
    <View style={styles.container}>
      <Button mode="contained" style={styles.addButton} onPress={() => navigation.navigate("AddCourse")}>
        Add Course
      </Button>
      <FlatList
        data={courses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListEmptyComponent={
          <Centered>
            <Text>No courses added yet.</Text>
          </Centered>
        }
        renderItem={({ item }) => {
          const courseSubjects = (subjects ?? []).filter((subject) => subject.courseId === item.id);
          return (
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="titleMedium">{item.name}</Text>
                <Text variant="bodySmall" style={styles.muted}>
                  {courseSubjects.length
                    ? courseSubjects.map((subject) => subject.name).join(", ")
                    : "No subjects yet"}
                </Text>
              </Card.Content>
            </Card>
          );
        }}
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
