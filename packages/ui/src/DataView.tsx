import { radii, spacing, type Breakpoint } from "@neospacetech/neosuite-tokens";
import type { ReactNode } from "react";
import { FlatList, View, type ViewStyle } from "react-native";
import { useResolvedBreakpoint } from "./environment";
import { Interactive } from "./Interactive";
import { cardFields, dataViewModeFor } from "./layout";
import { Stack } from "./Stack";
import { Text } from "./Text";
import { useTheme } from "./theme";

export interface DataColumn<T> {
  key: string;
  header: string;
  /** Plain value; used for display when `render` is absent. */
  value?: (row: T) => string | number | null | undefined;
  render?: (row: T) => ReactNode;
  /** Relative width in the table. Defaults to 1. */
  flex?: number;
  align?: "start" | "end";
  /** Use as the card title on compact. The first column is used when none is marked. */
  primary?: boolean;
}

export interface DataViewProps<T> {
  data: readonly T[];
  columns: DataColumn<T>[];
  keyExtractor: (row: T) => string;
  onRowPress?: (row: T) => void;
  /** Custom card for compact; defaults to title plus label/value pairs. */
  renderCard?: (row: T) => ReactNode;
  emptyState?: ReactNode;
  /** Accessible name of the table or list. */
  accessibilityLabel: string;
  breakpoint?: Breakpoint;
}

function cell<T>(column: DataColumn<T>, row: T): ReactNode {
  if (column.render) return column.render(row);
  const value = column.value?.(row);
  return <Text>{value === null || value === undefined ? "" : String(value)}</Text>;
}

/** Tabular data: a table with a sticky header on wider sizes, a card list on compact. */
export function DataView<T>({
  data,
  columns,
  keyExtractor,
  onRowPress,
  renderCard,
  emptyState = null,
  accessibilityLabel,
  breakpoint,
}: DataViewProps<T>) {
  const theme = useTheme();
  const { colors } = theme;
  const mode = dataViewModeFor(useResolvedBreakpoint(breakpoint));

  const pressable = (row: T, label: string, style: ViewStyle, content: ReactNode, role: "row" | "listitem") =>
    onRowPress ? (
      <Interactive
        role={role}
        accessibilityLabel={label}
        accessibilityHint="Opens details"
        onPress={() => onRowPress(row)}
        style={({ hovered, pressed }) => [
          style,
          (hovered || pressed) && { backgroundColor: pressed ? colors.surfacePressed : colors.surfaceHover },
        ]}
      >
        {content}
      </Interactive>
    ) : (
      <View role={role} style={style}>
        {content}
      </View>
    );

  if (mode === "cards") {
    const { primary, rest } = cardFields(columns);
    return (
      <FlatList
        role="list"
        aria-label={accessibilityLabel}
        data={data}
        keyExtractor={keyExtractor}
        ListEmptyComponent={<>{emptyState}</>}
        contentContainerStyle={{ padding: spacing.md, gap: spacing.sm }}
        renderItem={({ item }) => {
          const title = primary?.value?.(item);
          const content = renderCard ? (
            renderCard(item)
          ) : (
            <Stack gap="xs">
              {primary && <View>{primary.render ? primary.render(item) : <Text variant="bodyStrong">{title ?? ""}</Text>}</View>}
              {rest.map((column) => (
                <View key={column.key} style={{ flexDirection: "row", flexWrap: "wrap", columnGap: spacing.sm }}>
                  <Text variant="label" tone="muted">
                    {column.header}
                  </Text>
                  <View style={{ flexShrink: 1, minWidth: 0 }}>{cell(column, item)}</View>
                </View>
              ))}
            </Stack>
          );
          return pressable(
            item,
            title !== undefined && title !== null ? String(title) : keyExtractor(item),
            {
              padding: spacing.lg,
              borderRadius: radii.lg,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surfaceRaised,
            },
            content,
            "listitem",
          );
        }}
      />
    );
  }

  const rowStyle: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minHeight: 44,
    borderBottomWidth: 1,
    borderColor: colors.border,
  };
  const cellStyle = (column: DataColumn<T>): ViewStyle => ({
    flex: column.flex ?? 1,
    minWidth: 0,
    alignItems: column.align === "end" ? "flex-end" : "flex-start",
  });

  return (
    <FlatList
      role="table"
      aria-label={accessibilityLabel}
      data={data}
      keyExtractor={keyExtractor}
      stickyHeaderIndices={[0]}
      ListEmptyComponent={<>{emptyState}</>}
      ListHeaderComponent={
        <View role="row" style={[rowStyle, { backgroundColor: colors.surface, borderColor: colors.borderStrong }]}>
          {columns.map((column) => (
            <View key={column.key} role="columnheader" style={cellStyle(column)}>
              <Text variant="label" tone="muted">
                {column.header}
              </Text>
            </View>
          ))}
        </View>
      }
      renderItem={({ item }) => {
        const primary = cardFields(columns).primary?.value?.(item);
        return pressable(
          item,
          primary !== undefined && primary !== null ? String(primary) : keyExtractor(item),
          rowStyle,
          columns.map((column) => (
            <View key={column.key} role="cell" style={cellStyle(column)}>
              {cell(column, item)}
            </View>
          )),
          "row",
        );
      }}
    />
  );
}
