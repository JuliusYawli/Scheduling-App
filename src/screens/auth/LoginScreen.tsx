import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { Button, HelperText, Text, TextInput } from "react-native-paper";
import type { AuthStackParamList } from "../../navigation/types";
import { useAuthStore } from "../../store/useAuthStore";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error } = useAuthStore();

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.title}>
          Staff Scheduling
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Sign in with the account your admin gave you.
        </Text>

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        {error ? <HelperText type="error">{error}</HelperText> : null}

        <Button mode="contained" onPress={() => login(email, password)} loading={isLoading}>
          Sign in
        </Button>

        <Button
          mode="text"
          style={styles.forgotPassword}
          onPress={() => navigation.navigate("ForgotPassword")}
        >
          Forgot password?
        </Button>

        <View style={styles.demoBox}>
          <Text variant="labelSmall" style={styles.demoLabel}>
            DEMO ACCOUNTS
          </Text>
          <Text variant="bodySmall">Admin: admin@school.edu / admin123</Text>
          <Text variant="bodySmall">Staff: grace.mensah@school.edu / staff123</Text>
        </View>
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
  forgotPassword: { marginTop: 4 },
  demoBox: {
    marginTop: 32,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DBE2E8",
    gap: 2,
  },
  demoLabel: { marginBottom: 4, letterSpacing: 1, color: "#5B6773" },
});
