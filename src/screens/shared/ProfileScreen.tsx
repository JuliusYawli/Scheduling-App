import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Button, Card, Divider, HelperText, Text, TextInput } from "react-native-paper";
import * as authRepository from "../../data/repositories/authRepository";
import { useAuthStore } from "../../store/useAuthStore";

export default function ProfileScreen() {
  const { user } = useAuthStore();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleChangePassword() {
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setSuccess(false);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      setSuccess(false);
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await authRepository.updatePassword(password);
      setPassword("");
      setConfirmPassword("");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update password. Try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">{user?.name}</Text>
          <Text variant="bodyMedium" style={styles.muted}>
            {user?.email}
          </Text>
          <Text variant="bodySmall" style={styles.muted}>
            {user?.role === "admin" ? "Admin" : "Staff"}
          </Text>
        </Card.Content>
      </Card>

      <Divider style={styles.divider} />

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Change password
      </Text>
      <TextInput
        label="New password"
        value={password}
        onChangeText={(value) => {
          setPassword(value);
          setSuccess(false);
        }}
        secureTextEntry
        style={styles.input}
      />
      <TextInput
        label="Confirm new password"
        value={confirmPassword}
        onChangeText={(value) => {
          setConfirmPassword(value);
          setSuccess(false);
        }}
        secureTextEntry
        style={styles.input}
      />
      {error ? <HelperText type="error">{error}</HelperText> : null}
      {success ? <HelperText type="info">Password updated.</HelperText> : null}
      <Button mode="contained" onPress={handleChangePassword} loading={isLoading}>
        Update password
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  card: { borderRadius: 12, marginBottom: 8 },
  muted: { color: "#5B6773", marginTop: 2 },
  divider: { marginVertical: 20 },
  sectionTitle: { marginBottom: 12 },
  input: { marginBottom: 12 },
});
