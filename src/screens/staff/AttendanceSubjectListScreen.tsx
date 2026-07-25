import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FlatList, RefreshControl } from "react-native";
import { ActivityIndicator, Card, Text } from "react-native-paper";
import Centered from "../../components/Centered";
import { useSlotsByStaff } from "../../data/queries/slots";
import { useSubjectList } from "../../data/queries/courses";
import { useAuthStore } from "../../store/useAuthStore";
import type { StaffStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<StaffStackParamList, "AttendanceSubjectList">;

export default function AttendanceSubjectListScreen({ navigation }: Props) {
  const { user } = useAuthStore();
  const { data: slots, isLoading, isRefetching, refetch } = useSlotsByStaff(user?.staffId);
  const { data: subjects } = useSubjectList();

  if (isLoading || !slots || !subjects) {
    return (
      <Centered>
        <ActivityIndicator />
      </Centered>
    );
  }

  const sortedSlots = [...slots].sort(
    (a, b) => a.dayOfWeek.localeCompare(b.dayOfWeek) || a.startTime.localeCompare(b.startTime)
  );

  return (
    <FlatList
      data={sortedSlots}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16, gap: 10 }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      ListEmptyComponent={
        <Centered>
          <Text>You have no classes scheduled yet.</Text>
        </Centered>
      }
      renderItem={({ item }) => {
        const subject = subjects.find((s) => s.id === item.subjectId);
        return (
          <Card
            style={{ borderRadius: 12 }}
            onPress={() =>
              navigation.navigate("AttendanceMark", {
                slotId: item.id,
                subjectName: subject?.name ?? "Class",
              })
            }
          >
            <Card.Content>
              <Text variant="titleMedium">{subject?.name ?? "Unknown subject"}</Text>
              <Text variant="bodySmall" style={{ color: "#5B6773", marginTop: 4 }}>
                {item.dayOfWeek} · {item.startTime}–{item.endTime}
              </Text>
            </Card.Content>
          </Card>
        );
      }}
    />
  );
}
