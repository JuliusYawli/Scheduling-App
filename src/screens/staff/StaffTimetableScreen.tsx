import { StyleSheet, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import Centered from "../../components/Centered";
import WeeklyTimetable from "../../components/WeeklyTimetable";
import { useSlotsByStaff } from "../../data/queries/slots";
import { useSubjectList } from "../../data/queries/courses";
import { useAuthStore } from "../../store/useAuthStore";

export default function StaffTimetableScreen() {
  const { user } = useAuthStore();
  const { data: slots, isLoading } = useSlotsByStaff(user?.staffId);
  const { data: subjects } = useSubjectList();

  if (isLoading || !slots || !subjects) {
    return (
      <Centered>
        <ActivityIndicator />
      </Centered>
    );
  }

  return (
    <View style={styles.container}>
      <WeeklyTimetable slots={slots} subjects={subjects} staff={[]} showStaffName={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 12 },
});
