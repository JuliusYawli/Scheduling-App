import { createNativeStackNavigator } from "@react-navigation/native-stack";
import StaffDashboardScreen from "../screens/staff/StaffDashboardScreen";
import StaffTimetableScreen from "../screens/staff/StaffTimetableScreen";
import AttendanceSubjectListScreen from "../screens/staff/AttendanceSubjectListScreen";
import AttendanceMarkScreen from "../screens/staff/AttendanceMarkScreen";
import NotificationsScreen from "../screens/shared/NotificationsScreen";
import type { StaffStackParamList } from "./types";

const Stack = createNativeStackNavigator<StaffStackParamList>();

export default function StaffNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerTitleAlign: "center" }}>
      <Stack.Screen name="StaffDashboard" component={StaffDashboardScreen} options={{ title: "My Dashboard" }} />
      <Stack.Screen name="StaffTimetable" component={StaffTimetableScreen} options={{ title: "My Timetable" }} />
      <Stack.Screen
        name="AttendanceSubjectList"
        component={AttendanceSubjectListScreen}
        options={{ title: "My Classes" }}
      />
      <Stack.Screen name="AttendanceMark" component={AttendanceMarkScreen} options={{ title: "Attendance" }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: "Notifications" }} />
    </Stack.Navigator>
  );
}
