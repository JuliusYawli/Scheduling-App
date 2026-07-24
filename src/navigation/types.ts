export type AdminStackParamList = {
  AdminDashboard: undefined;
  StaffList: undefined;
  AddStaff: undefined;
  CourseList: undefined;
  AddCourse: undefined;
  StudentList: undefined;
  AddStudent: undefined;
  AddSlot: undefined;
  Timetable: undefined;
};

export type StaffStackParamList = {
  StaffDashboard: undefined;
  StaffTimetable: undefined;
  AttendanceSubjectList: undefined;
  AttendanceMark: { slotId: string; subjectName: string };
  Notifications: undefined;
};
