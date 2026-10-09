import { paneWidths, spacing, type Breakpoint } from "@neospacetech/neosuite-tokens";
import type { ReactNode } from "react";
import { View, type ViewStyle } from "react-native";
import { useResolvedBreakpoint } from "./environment";
import { Interactive } from "./Interactive";
import { navModeFor, type NavMode } from "./layout";
import { Text } from "./Text";
import { useTheme } from "./theme";

export interface NavItem {
  key: string;
  label: string;
  icon?: (props: { color: string; size: number; active: boolean }) => ReactNode;
  /** Short badge text, e.g. an unread count. */
  badge?: string | number;
}

export interface Insets {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface NavShellProps {
  items: NavItem[];
  activeKey: string;
  onSelect: (key: string) => void;
  children: ReactNode;
  /** Shown at the top of the rail or sidebar (e.g. product switcher). */
  header?: ReactNode;
  /** Shown at the bottom of the rail or sidebar (e.g. account menu). */
  footer?: ReactNode;
  /** Safe-area insets, e.g. from react-native-safe-area-context. */
  insets?: Insets;
  breakpoint?: Breakpoint;
  accessibilityLabel?: string;
}

/**
 * Primary navigation that adapts by breakpoint: bottom tabs on compact, a navigation rail on
 * medium, a sidebar on expanded, large and TV. Content stays mounted across mode changes.
 */
export function NavShell({
  items,
  activeKey,
  onSelect,
  children,
  header,
  footer,
  insets = {},
  breakpoint,
  accessibilityLabel = "Main",
}: NavShellProps) {
  const mode = navModeFor(useResolvedBreakpoint(breakpoint));
  const { colors } = useTheme();
  const vertical = mode !== "tabs";

  const nav = (
    <View
      role="navigation"
      aria-label={accessibilityLabel}
      style={[
        { backgroundColor: colors.surface, borderColor: colors.border },
        vertical
          ? {
              width: mode === "rail" ? paneWidths.navigationRail : paneWidths.sidebar,
              borderRightWidth: 1,
              paddingTop: (insets.top ?? 0) + spacing.sm,
              paddingBottom: (insets.bottom ?? 0) + spacing.sm,
              paddingLeft: insets.left ?? 0,
              gap: spacing.sm,
            }
          : { borderTopWidth: 1, paddingBottom: insets.bottom ?? 0, paddingLeft: insets.left, paddingRight: insets.right },
      ]}
    >
      {vertical && header}
      <View
        role="tablist"
        aria-orientation={vertical ? "vertical" : "horizontal"}
        style={{ flexDirection: vertical ? "column" : "row", gap: vertical ? spacing.xs : 0, flex: vertical ? 1 : undefined }}
      >
        {items.map((item) => (
          <NavButton key={item.key} item={item} mode={mode} active={item.key === activeKey} onSelect={onSelect} />
        ))}
      </View>
      {vertical && footer}
    </View>
  );

  return (
    <View style={{ flex: 1, flexDirection: vertical ? "row" : "column", backgroundColor: colors.background }}>
      {vertical ? nav : null}
      <View role="main" style={{ flex: 1, minWidth: 0, minHeight: 0 }}>
        {children}
      </View>
      {vertical ? null : nav}
    </View>
  );
}

function NavButton({
  item,
  mode,
  active,
  onSelect,
}: {
  item: NavItem;
  mode: NavMode;
  active: boolean;
  onSelect: (key: string) => void;
}) {
  const { colors, radii } = useTheme();
  const color = active ? colors.primary : colors.textMuted;
  const layout: ViewStyle =
    mode === "sidebar"
      ? { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.lg, minHeight: 44, marginHorizontal: spacing.sm }
      : mode === "rail"
        ? { alignItems: "center", justifyContent: "center", gap: spacing.xxs, minHeight: 56, paddingVertical: spacing.xs, marginHorizontal: spacing.xs }
        : { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.xxs, minHeight: 56, paddingVertical: spacing.xs };
  const badge = item.badge !== undefined ? `, ${item.badge}` : "";

  return (
    <Interactive
      role="tab"
      aria-selected={active}
      accessibilityState={{ selected: active }}
      accessibilityLabel={`${item.label}${badge}`}
      onPress={() => onSelect(item.key)}
      style={({ hovered, pressed }) => [
        layout,
        { borderRadius: radii.md, minWidth: 0 },
        (active || hovered || pressed) && {
          backgroundColor: pressed ? colors.surfacePressed : active ? colors.surfaceRaised : colors.surfaceHover,
        },
      ]}
    >
      {item.icon?.({ color, size: 24, active })}
      <Text
        variant={mode === "sidebar" ? "label" : "caption"}
        numberOfLines={mode === "sidebar" ? 2 : 1}
        align={mode === "sidebar" ? "left" : "center"}
        style={{ color, fontWeight: active ? "600" : "400", flexShrink: 1 }}
      >
        {item.label}
      </Text>
      {item.badge !== undefined && (
        <Text variant="caption" tone="primary" aria-hidden>
          {String(item.badge)}
        </Text>
      )}
    </Interactive>
  );
}
