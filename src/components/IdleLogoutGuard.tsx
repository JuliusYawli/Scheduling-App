import { useCallback, useEffect, useRef } from "react";
import { AppState, StyleSheet, View, type AppStateStatus } from "react-native";
import { useAuthStore } from "../store/useAuthStore";

const IDLE_TIMEOUT_MS = 5 * 60 * 1000;

interface Props {
  children: React.ReactNode;
}

export default function IdleLogoutGuard({ children }: Props) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backgroundedAtRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetTimer = useCallback(() => {
    clearTimer();
    if (!user) return;
    timerRef.current = setTimeout(logout, IDLE_TIMEOUT_MS);
  }, [user, logout, clearTimer]);

  // A plain onTouchStart only fires once some descendant (a Button, a
  // TextInput) claims the touch responder — a tap on empty background
  // space claims nothing and never reaches it. The capture-phase
  // responder hook below fires for every touch regardless of what (if
  // anything) ends up claiming it, so it's the only reliable way to
  // observe "any touch anywhere". Returning false means this view never
  // actually claims the responder, so normal touch handling elsewhere is
  // unaffected.
  const handleAnyTouch = useCallback(() => {
    resetTimer();
    return false;
  }, [resetTimer]);

  useEffect(() => {
    resetTimer();
    return clearTimer;
  }, [resetTimer, clearTimer]);

  useEffect(() => {
    // JS timers pause while backgrounded, so re-check elapsed wall-clock
    // time on resume instead of relying on the timeout having fired.
    function handleAppStateChange(nextState: AppStateStatus) {
      if (nextState === "background" || nextState === "inactive") {
        backgroundedAtRef.current = Date.now();
        return;
      }
      if (nextState !== "active") return;
      const backgroundedAt = backgroundedAtRef.current;
      backgroundedAtRef.current = null;
      if (user && backgroundedAt && Date.now() - backgroundedAt >= IDLE_TIMEOUT_MS) {
        logout();
      } else {
        resetTimer();
      }
    }

    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription.remove();
  }, [user, logout, resetTimer]);

  return (
    <View style={styles.flex} onStartShouldSetResponderCapture={handleAnyTouch}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
