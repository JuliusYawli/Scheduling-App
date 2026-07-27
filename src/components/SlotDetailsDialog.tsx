import { StyleSheet } from "react-native";
import { Button, Dialog, Portal, Text } from "react-native-paper";

interface Props {
  visible: boolean;
  subjectName: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  staffName?: string;
  loading?: boolean;
  onRemove: () => void;
  onDismiss: () => void;
}

export default function SlotDetailsDialog({
  visible,
  subjectName,
  dayOfWeek,
  startTime,
  endTime,
  staffName,
  loading = false,
  onRemove,
  onDismiss,
}: Props) {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{subjectName}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyLarge" style={styles.line}>
            {dayOfWeek} · {startTime}–{endTime}
          </Text>
          {staffName ? (
            <Text variant="bodyMedium" style={styles.staff}>
              {staffName}
            </Text>
          ) : null}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss} disabled={loading}>
            Cancel
          </Button>
          <Button onPress={onRemove} loading={loading} textColor="#B3261E">
            Remove class
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  line: { fontWeight: "600" },
  staff: { color: "#5B6773", marginTop: 4 },
});
