import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import IdleLogoutGuard from "./src/components/IdleLogoutGuard";
import RootNavigator from "./src/navigation/RootNavigator";
import { appTheme } from "./src/theme";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={appTheme}>
          <IdleLogoutGuard>
            <RootNavigator />
          </IdleLogoutGuard>
          <StatusBar style="auto" />
        </PaperProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
