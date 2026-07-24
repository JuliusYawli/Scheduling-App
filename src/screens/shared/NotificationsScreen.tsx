import { FlatList, StyleSheet, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import Centered from "../../components/Centered";
import { useMarkNotificationRead, useNotificationsForStaff } from "../../data/queries/notifications";
import { useAuthStore } from "../../store/useAuthStore";

export default function NotificationsScreen() {
  const { user } = useAuthStore();
  const { data: notifications, isLoading } = useNotificationsForStaff(user?.staffId);
  const markRead = useMarkNotificationRead();

  if (isLoading || !notifications) {
    return (
      <Centered>
        <ActivityIndicator />
      </Centered>
    );
  }

  return (
    <FlatList
      data={notifications}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      ListEmptyComponent={
        <Centered>
          <Text>No notifications yet.</Text>
        </Centered>
      }
      renderItem={({ item }) => (
        <View
          style={[styles.row, !item.read && styles.unread]}
          onTouchEnd={() => !item.read && markRead.mutate(item.id)}
        >
          <Text variant="bodyMedium">{item.message}</Text>
          <Text variant="bodySmall" style={styles.timestamp}>
            {new Date(item.createdAt).toLocaleString()}
          </Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 10 },
  row: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DBE2E8",
    backgroundColor: "#FFFFFF",
  },
  unread: { borderColor: "#B36A14", backgroundColor: "#FBF3E7" },
  timestamp: { color: "#5B6773", marginTop: 6 },
});
