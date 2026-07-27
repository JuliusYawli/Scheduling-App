import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, HelperText, Text, TextInput } from "react-native-paper";
import * as authRepository from "../../data/repositories/authRepository";

interface Props {
  accessToken: string;
  refreshToken: string;
  onDone: () => void;
}

export default function ResetPasswordScreen({ accessToken, refreshToken, onDone }: Props) {
  const [establishing, setEstablishing] = useState(true);
  const [linkValid, setLinkValid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    authRepository.establishRecoverySession(accessToken, refreshToken).then((ok) => {
      setLinkValid(ok);
      setEstablishing(false);
    });
  }, [accessToken, refreshToken]);

  async function handleSubmit() {
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await authRepository.updatePassword(password);
      await authRepository.logout();
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update password. Try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (establishing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.title}>
          Set a new password
        </Text>

        {!linkValid ? (
          <>
            <Text variant="bodyMedium" style={styles.subtitle}>
              This reset link is invalid or has expired. Request a new one from the sign-in screen.
            </Text>
            <Button mode="contained" onPress={onDone}>
              Back to sign in
            </Button>
          </>
        ) : done ? (
          <>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Your password has been updated. Sign in with your new password.
            </Text>
            <Button mode="contained" onPress={onDone}>
              Back to sign in
            </Button>
          </>
        ) : (
          <>
            <TextInput
              label="New password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
            />
            <TextInput
              label="Confirm new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              style={styles.input}
            />
            {error ? <HelperText type="error">{error}</HelperText> : null}
            <Button mode="contained" onPress={handleSubmit} loading={isLoading}>
              Update password
            </Button>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, justifyContent: "center", padding: 24 },
  title: { marginBottom: 4, fontWeight: "700" },
  subtitle: { marginBottom: 24, color: "#5B6773" },
  input: { marginBottom: 12 },
});
