import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";
import { useAuthStore } from "../../store/useAuthStore";
import type { AdminStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<AdminStackParamList, "AdminDashboard">;

const TILES: { title: string; description: string; screen: keyof AdminStackParamList }[] = [
  { title: "Staff", description: "Add staff and assign the subjects they teach", screen: "StaffList" },
  { title: "Courses", description: "Add courses and their subjects", screen: "CourseList" },
  { title: "Students", description: "Add students and enroll them in a course", screen: "StudentList" },
  { title: "Add Slot", description: "Schedule a subject with a staff member", screen: "AddSlot" },
  { title: "Timetable", description: "View the full weekly timetable", screen: "Timetable" },
  { title: "Profile", description: "Account details and change your password", screen: "Profile" },
];

export default function AdminDashboardScreen({ navigation }: Props) {
  const { user, logout } = useAuthStore();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        Welcome, {user?.name}
      </Text>
      <View style={styles.grid}>
        {TILES.map((tile) => (
          <Card key={tile.screen} style={styles.card} onPress={() => navigation.navigate(tile.screen)}>
            <Card.Content>
              <Text variant="titleMedium">{tile.title}</Text>
              <Text variant="bodySmall" style={styles.cardDescription}>
                {tile.description}
              </Text>
            </Card.Content>
          </Card>
        ))}
      </View>
      <Button onPress={logout} style={styles.signOut}>
        Sign out
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 16 },
  title: { fontWeight: "700" },
  grid: { gap: 12 },
  card: { borderRadius: 12 },
  cardDescription: { color: "#5B6773", marginTop: 4 },
  signOut: { marginTop: 8 },
});
