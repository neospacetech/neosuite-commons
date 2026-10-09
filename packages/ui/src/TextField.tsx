import { focusRing, maxFontScale, radii, spacing } from "@neospacetech/neosuite-tokens";
import { useId, useState } from "react";
import { TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from "react-native";
import { isFocusVisible, usePointerKind } from "./environment";
import { minTargetFor } from "./layout";
import { Text } from "./Text";
import { useTheme } from "./theme";

export interface TextFieldProps extends Omit<TextInputProps, "style" | "placeholderTextColor"> {
  label: string;
  /** Hint shown under the field while there is no error. */
  helperText?: string;
  /** Error message; marks the field invalid and is announced to assistive tech. */
  error?: string;
  required?: boolean;
  /** Layout-only overrides for the outer container. */
  style?: StyleProp<ViewStyle>;
}

/** Labelled text input with helper and error text. */
export function TextField({
  label,
  helperText,
  error,
  required,
  editable = true,
  style,
  onFocus,
  onBlur,
  multiline,
  ...rest
}: TextFieldProps) {
  const theme = useTheme();
  const { colors } = theme;
  const id = useId();
  const labelId = `${id}-label`;
  const messageId = `${id}-message`;
  const [focused, setFocused] = useState(false);
  const [ring, setRing] = useState(false);
  const minHeight = Math.max(40, minTargetFor(usePointerKind()));
  const message = error ?? helperText;

  return (
    <View style={[{ gap: spacing.xs, minWidth: 0, alignSelf: "stretch" }, style]}>
      <Text nativeID={labelId} variant="label" tone={editable ? "default" : "muted"}>
        {label}
        {required ? " *" : ""}
      </Text>
      <TextInput
        {...rest}
        multiline={multiline}
        editable={editable}
        aria-labelledby={labelId}
        accessibilityLabel={required ? `${label}, required` : label}
        accessibilityHint={message}
        aria-describedby={message ? messageId : undefined}
        aria-invalid={error ? true : undefined}
        aria-required={required || undefined}
        accessibilityState={{ disabled: !editable }}
        maxFontSizeMultiplier={maxFontScale}
        placeholderTextColor={colors.placeholder}
        onFocus={(event) => {
          setFocused(true);
          setRing(isFocusVisible());
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          setRing(false);
          onBlur?.(event);
        }}
        style={[
          {
            minHeight: multiline ? minHeight * 2 : minHeight,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderRadius: radii.md,
            borderWidth: focused || error ? 2 : 1,
            borderColor: error ? colors.danger : focused ? colors.primary : colors.borderStrong,
            backgroundColor: editable ? colors.surfaceRaised : colors.disabled,
            color: editable ? colors.text : colors.onDisabled,
            fontSize: theme.typography.body.fontSize,
            textAlignVertical: multiline ? "top" : "center",
            width: "100%",
          },
          ring && {
            outlineColor: colors.focusRing,
            outlineStyle: "solid",
            outlineWidth: focusRing.width,
            outlineOffset: focusRing.offset,
          },
        ]}
      />
      {message ? (
        <Text
          nativeID={messageId}
          variant="caption"
          tone={error ? "danger" : "muted"}
          role={error ? "alert" : undefined}
          aria-live={error ? "polite" : undefined}
        >
          {message}
        </Text>
      ) : null}
    </View>
  );
}
