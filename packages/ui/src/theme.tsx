import {
  radii,
  spacing,
  themes,
  typography,
  type ColorScheme,
  resolveThemeName,
  type ThemeName,
  type ThemePreference,
} from "@neospacetech/neosuite-tokens";
import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { Platform, useColorScheme } from "react-native";

export interface Theme {
  name: ThemeName;
  colors: ColorScheme;
  spacing: typeof spacing;
  radii: typeof radii;
  typography: typeof typography;
  isDark: boolean;
}

export function createTheme(name: ThemeName): Theme {
  return { name, colors: themes[name], spacing, radii, typography, isDark: name !== "light" };
}

const HIGH_CONTRAST_QUERY = "(prefers-contrast: more), (forced-colors: active)";

function subscribeHighContrast(listener: () => void): () => void {
  if (Platform.OS !== "web" || typeof window === "undefined" || !window.matchMedia) return () => {};
  const query = window.matchMedia(HIGH_CONTRAST_QUERY);
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}

function getHighContrast(): boolean {
  if (Platform.OS !== "web" || typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia(HIGH_CONTRAST_QUERY).matches;
}

const defaultTheme = createTheme("light");
const ThemeContext = createContext<Theme>(defaultTheme);

export interface ThemeProviderProps {
  /** `system` follows the OS colour scheme and contrast preference. */
  theme?: ThemePreference;
  children: ReactNode;
}

export function ThemeProvider({ theme = "system", children }: ThemeProviderProps) {
  const scheme = useColorScheme();
  const highContrast = useSyncExternalStore(subscribeHighContrast, getHighContrast, () => false);
  const name = resolveThemeName(theme, scheme, highContrast);
  const value = useMemo(() => createTheme(name), [name]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
