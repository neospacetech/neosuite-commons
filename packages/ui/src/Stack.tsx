import { spacing, type SpacingToken } from "@neospacetech/neosuite-tokens";
import { View, type ViewProps, type ViewStyle } from "react-native";

export interface StackProps extends ViewProps {
  gap?: SpacingToken;
  padding?: SpacingToken;
  align?: ViewStyle["alignItems"];
  justify?: ViewStyle["justifyContent"];
  /** Let children wrap onto new lines (Row only). Use for chips and toolbars so narrow screens reflow. */
  wrap?: boolean;
  /** Fill the remaining space in the parent. */
  flex?: boolean;
}

function stackStyle(direction: "row" | "column", p: StackProps): ViewStyle {
  return {
    flexDirection: direction,
    gap: spacing[p.gap ?? "none"],
    padding: p.padding ? spacing[p.padding] : undefined,
    alignItems: p.align,
    justifyContent: p.justify,
    flexWrap: p.wrap ? "wrap" : "nowrap",
    flex: p.flex ? 1 : undefined,
    minWidth: 0,
  };
}

/** Vertical stack. Spacing between children comes from `gap`; children never set outer margins. */
export function Stack({ gap, padding, align, justify, wrap, flex, style, ...rest }: StackProps) {
  return <View {...rest} style={[stackStyle("column", { gap, padding, align, justify, wrap, flex }), style]} />;
}

/** Horizontal stack. Prefer `wrap` for content that may not fit at 320px. */
export function Row({ gap, padding, align = "center", justify, wrap, flex, style, ...rest }: StackProps) {
  return <View {...rest} style={[stackStyle("row", { gap, padding, align, justify, wrap, flex }), style]} />;
}

export interface SpacerProps {
  /** Fixed size; omit to take up all remaining space. */
  size?: SpacingToken;
}

export function Spacer({ size }: SpacerProps) {
  return <View aria-hidden style={size ? { width: spacing[size], height: spacing[size] } : { flex: 1 }} />;
}
