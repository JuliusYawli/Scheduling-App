import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScrollView, StyleSheet, View } from "react-native";
import { Badge, Button, Card, Text } from "react-native-paper";
import { useAuthStore } from "../../store/useAuthStore";
import { useNotificationsForStaff } from "../../data/queries/notifications";
import type { StaffStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<StaffStackParamList, "StaffDashboard">;

export default function StaffDashboardScreen({ navigation }: Props) {
  const { user, logout } = useAuthStore();
  const { data: notifications } = useNotificationsForStaff(user?.staffId);
  const unreadCount = notifications?.filter((notification) => !notification.read).length ?? 0;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        Welcome, {user?.name}
      </Text>

      <Card style={styles.card} onPress={() => navigation.navigate("StaffTimetable")}>
        <Card.Content>
          <Text variant="titleMedium">Timetable</Text>
          <Text variant="bodySmall" style={styles.cardDescription}>
            See your classes for the week
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card} onPress={() => navigation.navigate("AttendanceSubjectList")}>
        <Card.Content>
          <Text variant="titleMedium">Attendance</Text>
          <Text variant="bodySmall" style={styles.cardDescription}>
            Mark students present or absent for a class
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card} onPress={() => navigation.navigate("Notifications")}>
        <Card.Content style={styles.notificationsRow}>
          <View>
            <Text variant="titleMedium">Notifications</Text>
            <Text variant="bodySmall" style={styles.cardDescription}>
              Timetable changes from your admin
            </Text>
          </View>
          {unreadCount > 0 ? <Badge>{unreadCount}</Badge> : null}
        </Card.Content>
      </Card>

      <Card style={styles.card} onPress={() => navigation.navigate("Profile")}>
        <Card.Content>
          <Text variant="titleMedium">Profile</Text>
          <Text variant="bodySmall" style={styles.cardDescription}>
            Account details and change your password
          </Text>
        </Card.Content>
      </Card>

      <Button onPress={logout} style={styles.signOut}>
        Sign out
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 12 },
  title: { fontWeight: "700", marginBottom: 4 },
  card: { borderRadius: 12 },
  cardDescription: { color: "#5B6773", marginTop: 4 },
  notificationsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  signOut: { marginTop: 8 },
});
