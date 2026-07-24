import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

export default function Centered({ children }: { children: ReactNode }) {
  return <View style={styles.container}>{children}</View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
});
