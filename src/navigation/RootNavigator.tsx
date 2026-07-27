import { NavigationContainer } from "@react-navigation/native";
import * as Linking from "expo-linking";
import { useEffect, useState } from "react";
import ResetPasswordScreen from "../screens/auth/ResetPasswordScreen";
import { useAuthStore } from "../store/useAuthStore";
import AdminNavigator from "./AdminNavigator";
import AuthNavigator from "./AuthNavigator";
import StaffNavigator from "./StaffNavigator";

interface RecoveryTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * The password-reset email link opens as
 * `staffscheduling://reset-password#access_token=...&refresh_token=...&type=recovery`
 * — Supabase puts the tokens in the URL fragment (not a query string), so
 * they need pulling out manually rather than via a normal deep-link route.
 */
function parseRecoveryTokens(url: string): RecoveryTokens | null {
  const hashIndex = url.indexOf("#");
  if (hashIndex === -1) return null;
  const params = new URLSearchParams(url.slice(hashIndex + 1));
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  if (params.get("type") === "recovery" && accessToken && refreshToken) {
    return { accessToken, refreshToken };
  }
  return null;
}

export default function RootNavigator() {
  const user = useAuthStore((state) => state.user);
  const [recoveryTokens, setRecoveryTokens] = useState<RecoveryTokens | null>(null);

  useEffect(() => {
    function handleUrl(url: string) {
      const tokens = parseRecoveryTokens(url);
      if (tokens) setRecoveryTokens(tokens);
    }
    Linking.getInitialURL().then((url) => {
      if (url) handleUrl(url);
    });
    const subscription = Linking.addEventListener("url", ({ url }) => handleUrl(url));
    return () => subscription.remove();
  }, []);

  return (
    <NavigationContainer>
      {recoveryTokens ? (
        <ResetPasswordScreen
          accessToken={recoveryTokens.accessToken}
          refreshToken={recoveryTokens.refreshToken}
          onDone={() => setRecoveryTokens(null)}
        />
      ) : !user ? (
        <AuthNavigator />
      ) : user.role === "admin" ? (
        <AdminNavigator />
      ) : (
        <StaffNavigator />
      )}
    </NavigationContainer>
  );
}
