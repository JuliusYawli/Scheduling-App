import { StyleSheet, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import Centered from "../../components/Centered";
import WeeklyTimetable from "../../components/WeeklyTimetable";
import { useSlotList } from "../../data/queries/slots";
import { useSubjectList } from "../../data/queries/courses";
import { useStaffList } from "../../data/queries/staff";

export default function TimetableScreen() {
  const { data: slots, isLoading: slotsLoading } = useSlotList();
  const { data: subjects } = useSubjectList();
  const { data: staff } = useStaffList();

  if (slotsLoading || !slots || !subjects || !staff) {
    return (
      <Centered>
        <ActivityIndicator />
      </Centered>
    );
  }

  return (
    <View style={styles.container}>
      <WeeklyTimetable slots={slots} subjects={subjects} staff={staff} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 12 },
});
