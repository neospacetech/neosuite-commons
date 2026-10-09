/** Semantic colour roles. Components reference roles, never raw palette values. */
export interface ColorScheme {
  background: string;
  surface: string;
  surfaceRaised: string;
  surfaceHover: string;
  surfacePressed: string;
  text: string;
  textMuted: string;
  textInverse: string;
  border: string;
  borderStrong: string;
  primary: string;
  primaryHover: string;
  onPrimary: string;
  danger: string;
  dangerHover: string;
  onDanger: string;
  success: string;
  warning: string;
  focusRing: string;
  overlay: string;
  placeholder: string;
  disabled: string;
  onDisabled: string;
}

export type ThemeName = "light" | "dark" | "highContrast";

/** A user's theme choice; `system` follows the OS colour scheme and contrast settings. */
export type ThemePreference = ThemeName | "system";

/** Theme for a preference given the platform's colour scheme and high-contrast setting. */
export function resolveThemeName(
  preference: ThemePreference,
  scheme: "light" | "dark" | null | undefined,
  prefersHighContrast = false,
): ThemeName {
  if (preference !== "system") return preference;
  if (prefersHighContrast) return "highContrast";
  return scheme === "dark" ? "dark" : "light";
}

export const themes: Record<ThemeName, ColorScheme> = {
  light: {
    background: "#FFFFFF",
    surface: "#F6F7F9",
    surfaceRaised: "#FFFFFF",
    surfaceHover: "#ECEEF2",
    surfacePressed: "#DFE2E8",
    text: "#14171F",
    textMuted: "#4F5666",
    textInverse: "#FFFFFF",
    border: "#D4D8E0",
    borderStrong: "#6B7385",
    primary: "#1F5BD6",
    primaryHover: "#1A4DB5",
    onPrimary: "#FFFFFF",
    danger: "#C0262D",
    dangerHover: "#A11F25",
    onDanger: "#FFFFFF",
    success: "#1C7A3E",
    warning: "#8A5A00",
    focusRing: "#1F5BD6",
    overlay: "rgba(20, 23, 31, 0.48)",
    placeholder: "#5F6677",
    disabled: "#E3E6EB",
    onDisabled: "#6B7385",
  },
  dark: {
    background: "#0F1115",
    surface: "#171A21",
    surfaceRaised: "#1F232C",
    surfaceHover: "#272C37",
    surfacePressed: "#313744",
    text: "#F2F4F8",
    textMuted: "#B3BAC7",
    textInverse: "#14171F",
    border: "#343A47",
    borderStrong: "#8C94A5",
    primary: "#7FA6FF",
    primaryHover: "#9BB9FF",
    onPrimary: "#0B1530",
    danger: "#FF8A8F",
    dangerHover: "#FFA3A7",
    onDanger: "#2E0507",
    success: "#6FD394",
    warning: "#F2C063",
    focusRing: "#9BB9FF",
    overlay: "rgba(0, 0, 0, 0.64)",
    placeholder: "#9AA2B1",
    disabled: "#252A33",
    onDisabled: "#8C94A5",
  },
  highContrast: {
    background: "#000000",
    surface: "#000000",
    surfaceRaised: "#0A0A0A",
    surfaceHover: "#1A1A1A",
    surfacePressed: "#2A2A2A",
    text: "#FFFFFF",
    textMuted: "#E6E6E6",
    textInverse: "#000000",
    border: "#FFFFFF",
    borderStrong: "#FFFFFF",
    primary: "#FFE14D",
    primaryHover: "#FFEA80",
    onPrimary: "#000000",
    danger: "#FF9C9C",
    dangerHover: "#FFB8B8",
    onDanger: "#000000",
    success: "#7DFF9E",
    warning: "#FFD24D",
    focusRing: "#00E5FF",
    overlay: "rgba(0, 0, 0, 0.85)",
    placeholder: "#D9D9D9",
    disabled: "#1A1A1A",
    onDisabled: "#D9D9D9",
  },
};

function channel(hex: string, offset: number): number {
  const v = parseInt(hex.slice(offset, offset + 2), 16) / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

/** WCAG relative luminance of a `#RRGGBB` colour. */
export function relativeLuminance(hex: string): number {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) throw new Error(`Expected #RRGGBB colour, got "${hex}"`);
  return 0.2126 * channel(hex, 1) + 0.7152 * channel(hex, 3) + 0.0722 * channel(hex, 5);
}

/** WCAG contrast ratio between two `#RRGGBB` colours (1–21). */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}
