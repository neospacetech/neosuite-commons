import { maxFontScale, scaleTextStyle, tvTypeScale, type ColorScheme, type TypographyToken } from "@neospacetech/neosuite-tokens";
import { Platform, Text as RNText, type TextProps as RNTextProps } from "react-native";
import { useTheme } from "./theme";

export type TextTone = "default" | "muted" | "primary" | "danger" | "success" | "warning" | "onPrimary" | "inverse";

const TONE: Record<TextTone, keyof ColorScheme> = {
  default: "text",
  muted: "textMuted",
  primary: "primary",
  danger: "danger",
  success: "success",
  warning: "warning",
  onPrimary: "onPrimary",
  inverse: "textInverse",
};

export interface TextProps extends RNTextProps {
  variant?: TypographyToken;
  tone?: TextTone;
  /** Marks the text as a heading of this level (1–6) for assistive tech. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  align?: "auto" | "left" | "right" | "center" | "justify";
}

/** Themed text. Scales with the OS font size up to `maxFontScale` and wraps by default. */
export function Text({ variant = "body", tone = "default", headingLevel, align, style, ...rest }: TextProps) {
  const theme = useTheme();
  const base = theme.typography[variant];
  const scaled = Platform.isTV ? scaleTextStyle(base, 1, tvTypeScale) : base;
  return (
    <RNText
      maxFontSizeMultiplier={maxFontScale}
      role={headingLevel ? "heading" : undefined}
      aria-level={headingLevel}
      {...rest}
      style={[
        {
          color: theme.colors[TONE[tone]],
          fontFamily: variant === "code" ? "monospace" : undefined,
          fontSize: scaled.fontSize,
          lineHeight: scaled.lineHeight,
          fontWeight: scaled.fontWeight,
          textAlign: align,
          flexShrink: 1,
        },
        style,
      ]}
    />
  );
}
