import { MD3LightTheme } from "react-native-paper";

// Same amber/graphite palette as the architecture diagram, so the running
// app and the design docs read as one visual identity.
export const appTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#B36A14",
    onPrimary: "#FFFFFF",
    primaryContainer: "#FBF3E7",
    onPrimaryContainer: "#5A3A0C",
    secondary: "#5B6773",
    background: "#F2F5F7",
    surface: "#FFFFFF",
    surfaceVariant: "#EEF1F3",
    onSurface: "#161D25",
    onSurfaceVariant: "#5B6773",
    outline: "#C3CCD4",
    error: "#B3261E",
  },
};
