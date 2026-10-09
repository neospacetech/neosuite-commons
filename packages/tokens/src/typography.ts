export interface TextStyleToken {
  fontSize: number;
  lineHeight: number;
  fontWeight: "400" | "500" | "600" | "700";
  letterSpacing?: number;
}

export const fontFamilies = {
  sans: "System",
  mono: "monospace",
} as const;

/**
 * Typography scale in dp. Sizes are the base size at 100% OS font scale; native text scales
 * with the OS setting automatically, and layouts must keep working up to `maxFontScale`.
 */
export const typography = {
  display: { fontSize: 36, lineHeight: 44, fontWeight: "700" },
  headline: { fontSize: 28, lineHeight: 36, fontWeight: "600" },
  title: { fontSize: 22, lineHeight: 28, fontWeight: "600" },
  subtitle: { fontSize: 18, lineHeight: 24, fontWeight: "600" },
  body: { fontSize: 16, lineHeight: 24, fontWeight: "400" },
  bodyStrong: { fontSize: 16, lineHeight: 24, fontWeight: "600" },
  label: { fontSize: 14, lineHeight: 20, fontWeight: "500" },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: "400" },
  code: { fontSize: 14, lineHeight: 20, fontWeight: "400" },
} as const satisfies Record<string, TextStyleToken>;
export type TypographyToken = keyof typeof typography;

/** Largest OS font scale layouts must support without loss of content or function. */
export const maxFontScale = 2;

/** Multiplier applied to the type scale for 10-ft (television) UI. */
export const tvTypeScale = 1.5;

/** Scale a text style by an OS font scale (clamped to `maxFontScale`) and an optional form-factor multiplier. */
export function scaleTextStyle(
  style: TextStyleToken,
  fontScale = 1,
  formFactorScale = 1,
): TextStyleToken {
  const factor = Math.min(Math.max(fontScale, 0.5), maxFontScale) * formFactorScale;
  return {
    ...style,
    fontSize: Math.round(style.fontSize * factor),
    lineHeight: Math.round(style.lineHeight * factor),
  };
}
