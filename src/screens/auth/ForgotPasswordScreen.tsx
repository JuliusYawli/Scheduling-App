import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Linking from "expo-linking";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { Button, HelperText, Text, TextInput } from "react-native-paper";
import * as authRepository from "../../data/repositories/authRepository";
import type { AuthStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "ForgotPassword">;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await authRepository.requestPasswordReset(email, Linking.createURL("reset-password"));
      setSent(true);
    } catch {
      // Don't reveal whether the address exists — same message either way.
      setSent(true);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.title}>
          Reset your password
        </Text>

        {sent ? (
          <>
            <Text variant="bodyMedium" style={styles.subtitle}>
              If an account exists for {email.trim()}, a reset link has been sent — open it on this
              device to set a new password.
            </Text>
            <Button mode="contained" onPress={() => navigation.goBack()}>
              Back to sign in
            </Button>
          </>
        ) : (
          <>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Enter your email and we'll send you a link to set a new password.
            </Text>
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />
            {error ? <HelperText type="error">{error}</HelperText> : null}
            <Button mode="contained" onPress={handleSubmit} loading={isLoading}>
              Send reset link
            </Button>
            <Button mode="text" style={styles.back} onPress={() => navigation.goBack()}>
              Back to sign in
            </Button>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, justifyContent: "center", padding: 24 },
  title: { marginBottom: 4, fontWeight: "700" },
  subtitle: { marginBottom: 24, color: "#5B6773" },
  input: { marginBottom: 12 },
  back: { marginTop: 4 },
});
