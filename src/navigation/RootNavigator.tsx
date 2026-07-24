import { NavigationContainer } from "@react-navigation/native";
import LoginScreen from "../screens/auth/LoginScreen";
import AdminNavigator from "./AdminNavigator";
import StaffNavigator from "./StaffNavigator";
import { useAuthStore } from "../store/useAuthStore";

export default function RootNavigator() {
  const user = useAuthStore((state) => state.user);

  return (
    <NavigationContainer>
      {!user ? <LoginScreen /> : user.role === "admin" ? <AdminNavigator /> : <StaffNavigator />}
    </NavigationContainer>
  );
}
