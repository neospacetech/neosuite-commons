import { radii, spacing } from "@neospacetech/neosuite-tokens";
import type { ReactNode } from "react";
import { ActivityIndicator, type GestureResponderEvent, type StyleProp, type ViewStyle } from "react-native";
import { usePointerKind } from "./environment";
import { Interactive, type InteractiveState } from "./Interactive";
import { minTargetFor } from "./layout";
import { Text } from "./Text";
import { useTheme, type Theme } from "./theme";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps {
  label: string;
  onPress?: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  /** Leading icon; decorative, so the label remains the accessible name. */
  icon?: ReactNode;
  /** Render only the icon; `label` becomes the accessible name. */
  iconOnly?: boolean;
  fullWidth?: boolean;
  accessibilityHint?: string;
  testID?: string;
  /** Layout-only overrides (margins, alignment, flex). */
  style?: StyleProp<ViewStyle>;
}

const HEIGHT: Record<ButtonSize, number> = { sm: 32, md: 40, lg: 48 };
const PAD: Record<ButtonSize, number> = { sm: spacing.md, md: spacing.lg, lg: spacing.xl };

function colorsFor(theme: Theme, variant: ButtonVariant, state: InteractiveState) {
  const c = theme.colors;
  if (state.disabled) return { bg: c.disabled, fg: "onDisabled" as const, border: c.disabled };
  switch (variant) {
    case "primary":
      return { bg: state.hovered || state.pressed ? c.primaryHover : c.primary, fg: "onPrimary" as const, border: c.primary };
    case "danger":
      return { bg: state.hovered || state.pressed ? c.dangerHover : c.danger, fg: "onDanger" as const, border: c.danger };
    case "secondary":
      return {
        bg: state.pressed ? c.surfacePressed : state.hovered ? c.surfaceHover : c.surfaceRaised,
        fg: "text" as const,
        border: c.borderStrong,
      };
    case "ghost":
      return {
        bg: state.pressed ? c.surfacePressed : state.hovered ? c.surfaceHover : "transparent",
        fg: "primary" as const,
        border: "transparent",
      };
  }
}

/**
 * Button with a 44pt minimum target on touch and D-pad, hover and focus-visible states,
 * and Enter/Space activation on web.
 */
export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  disabled,
  loading,
  icon,
  iconOnly,
  fullWidth,
  accessibilityHint,
  testID,
  style,
}: ButtonProps) {
  const theme = useTheme();
  const target = Math.max(HEIGHT[size], minTargetFor(usePointerKind()));
  const inactive = !!disabled || !!loading;

  return (
    <Interactive
      role="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: !!loading }}
      aria-busy={!!loading}
      disabled={inactive}
      onPress={onPress}
      testID={testID}
      style={(state) => {
        const colors = colorsFor(theme, variant, state);
        return [
          {
            minHeight: target,
            minWidth: target,
            paddingHorizontal: iconOnly ? spacing.sm : PAD[size],
            paddingVertical: spacing.xs,
            borderRadius: radii.md,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.bg,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: spacing.sm,
            alignSelf: fullWidth ? "stretch" : "flex-start",
            maxWidth: "100%",
          },
          style,
        ];
      }}
    >
      {(state) => {
        const fg = colorsFor(theme, variant, state).fg;
        return (
          <>
            {loading ? <ActivityIndicator size="small" color={theme.colors[fg]} /> : icon}
            {!iconOnly && (
              <Text variant="label" align="center" style={{ color: theme.colors[fg] }}>
                {label}
              </Text>
            )}
          </>
        );
      }}
    </Interactive>
  );
}
