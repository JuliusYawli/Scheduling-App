import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AdminDashboardScreen from "../screens/admin/AdminDashboardScreen";
import StaffListScreen from "../screens/admin/StaffListScreen";
import AddStaffScreen from "../screens/admin/AddStaffScreen";
import CourseListScreen from "../screens/admin/CourseListScreen";
import AddCourseScreen from "../screens/admin/AddCourseScreen";
import StudentListScreen from "../screens/admin/StudentListScreen";
import AddStudentScreen from "../screens/admin/AddStudentScreen";
import AddSlotScreen from "../screens/admin/AddSlotScreen";
import TimetableScreen from "../screens/admin/TimetableScreen";
import type { AdminStackParamList } from "./types";

const Stack = createNativeStackNavigator<AdminStackParamList>();

export default function AdminNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerTitleAlign: "center" }}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: "Admin" }} />
      <Stack.Screen name="StaffList" component={StaffListScreen} options={{ title: "Staff" }} />
      <Stack.Screen name="AddStaff" component={AddStaffScreen} options={{ title: "Add Staff" }} />
      <Stack.Screen name="CourseList" component={CourseListScreen} options={{ title: "Courses" }} />
      <Stack.Screen name="AddCourse" component={AddCourseScreen} options={{ title: "Add Course" }} />
      <Stack.Screen name="StudentList" component={StudentListScreen} options={{ title: "Students" }} />
      <Stack.Screen name="AddStudent" component={AddStudentScreen} options={{ title: "Add Student" }} />
      <Stack.Screen name="AddSlot" component={AddSlotScreen} options={{ title: "Add Slot" }} />
      <Stack.Screen name="Timetable" component={TimetableScreen} options={{ title: "Timetable" }} />
    </Stack.Navigator>
  );
}
