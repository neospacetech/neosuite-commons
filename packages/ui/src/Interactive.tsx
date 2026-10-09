import { focusRing } from "@neospacetech/neosuite-tokens";
import { useState, type ReactNode, type Ref } from "react";
import {
  Pressable,
  type NativeSyntheticEvent,
  type PressableProps,
  type StyleProp,
  type TargetedEvent,
  type View,
  type ViewStyle,
} from "react-native";
import { isFocusVisible } from "./environment";
import { useTheme } from "./theme";

export interface InteractiveState {
  hovered: boolean;
  pressed: boolean;
  /** Focused via keyboard or D-pad (focus-visible). */
  focused: boolean;
  disabled: boolean;
}

export interface InteractiveProps extends Omit<PressableProps, "style" | "children"> {
  style?: StyleProp<ViewStyle> | ((state: InteractiveState) => StyleProp<ViewStyle>);
  children?: ReactNode | ((state: InteractiveState) => ReactNode);
  /** Draw the theme focus ring when focus-visible. Defaults to true. */
  focusRing?: boolean;
  ref?: Ref<View>;
}

/**
 * Pressable with hover, pressed and focus-visible state, and a visible focus ring.
 * Enter and Space activate it on web when it has a button-like role; D-pad select on TV.
 */
export function Interactive({
  style,
  children,
  focusRing: showRing = true,
  disabled,
  onHoverIn,
  onHoverOut,
  onFocus,
  onBlur,
  ...rest
}: InteractiveProps) {
  const { colors } = useTheme();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const isDisabled = !!disabled;

  return (
    <Pressable
      {...rest}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      onHoverIn={(event) => {
        setHovered(true);
        onHoverIn?.(event);
      }}
      onHoverOut={(event) => {
        setHovered(false);
        onHoverOut?.(event);
      }}
      onFocus={(event: NativeSyntheticEvent<TargetedEvent>) => {
        setFocused(isFocusVisible());
        onFocus?.(event);
      }}
      onBlur={(event: NativeSyntheticEvent<TargetedEvent>) => {
        setFocused(false);
        onBlur?.(event);
      }}
      style={({ pressed }) => {
        const state: InteractiveState = { hovered: hovered && !isDisabled, pressed, focused, disabled: isDisabled };
        return [
          !isDisabled && { cursor: "pointer" as const },
          typeof style === "function" ? style(state) : style,
          showRing &&
            focused && {
              outlineColor: colors.focusRing,
              outlineStyle: "solid" as const,
              outlineWidth: focusRing.width,
              outlineOffset: focusRing.offset,
            },
        ];
      }}
    >
      {({ pressed }) =>
        typeof children === "function"
          ? children({ hovered: hovered && !isDisabled, pressed, focused, disabled: isDisabled })
          : children
      }
    </Pressable>
  );
}
