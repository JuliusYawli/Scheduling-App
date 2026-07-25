import { Button, Dialog, Portal, Text } from "react-native-paper";

interface Props {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
}

export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = "Delete",
  loading = false,
  onConfirm,
  onDismiss,
}: Props) {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">{message}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss} disabled={loading}>
            Cancel
          </Button>
          <Button onPress={onConfirm} loading={loading} textColor="#B3261E">
            {confirmLabel}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
