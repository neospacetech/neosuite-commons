import { paneWidths, spacing, type Breakpoint } from "@neospacetech/neosuite-tokens";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { BackHandler, View } from "react-native";
import { Button } from "./Button";
import { useBreakpoint } from "./environment";
import { listDetailModeFor, listDetailPanes, paneWidth, type ListDetailMode } from "./layout";
import { useTheme } from "./theme";

export interface ListDetailContext {
  selectedId: string | null;
  select: (id: string | null) => void;
  mode: ListDetailMode;
}

export interface ListDetailProps {
  renderList: (context: ListDetailContext) => ReactNode;
  /** Rendered when an item is selected. */
  renderDetail: (context: ListDetailContext & { selectedId: string }) => ReactNode;
  /** Shown in the detail pane when side-by-side and nothing is selected. */
  emptyDetail?: ReactNode;
  /** Controlled selection. */
  selectedId?: string | null;
  defaultSelectedId?: string | null;
  onSelectionChange?: (id: string | null) => void;
  /** Preferred list pane width when side-by-side. */
  listWidth?: number;
  backLabel?: string;
  breakpoint?: Breakpoint;
}

/**
 * List and detail: one pane with push navigation on compact, side-by-side otherwise.
 * Both panes stay mounted, so selection, scroll position and input state survive resizes
 * and returning from the detail on compact.
 */
export function ListDetail({
  renderList,
  renderDetail,
  emptyDetail = null,
  selectedId: controlled,
  defaultSelectedId = null,
  onSelectionChange,
  listWidth = paneWidths.listPane,
  backLabel = "Back",
  breakpoint,
}: ListDetailProps) {
  const { colors } = useTheme();
  const info = useBreakpoint();
  const mode = listDetailModeFor(breakpoint ?? info.breakpoint);
  const [uncontrolled, setUncontrolled] = useState<string | null>(defaultSelectedId);
  const selectedId = controlled !== undefined ? controlled : uncontrolled;
  const panes = listDetailPanes(mode, selectedId !== null);

  const select = useCallback(
    (id: string | null) => {
      if (controlled === undefined) setUncontrolled(id);
      onSelectionChange?.(id);
    },
    [controlled, onSelectionChange],
  );
  const back = useCallback(() => select(null), [select]);

  useEffect(() => {
    if (!panes.back) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      back();
      return true;
    });
    return () => sub.remove();
  }, [panes.back, back]);

  const context: ListDetailContext = { selectedId, select, mode };
  const split = mode === "split";

  return (
    <View style={{ flex: 1, flexDirection: "row", minWidth: 0 }}>
      <View
        aria-hidden={!panes.list}
        style={[
          split
            ? { width: paneWidth(listWidth, info.width), borderRightWidth: 1, borderColor: colors.border }
            : { flex: 1 },
          !panes.list && { display: "none" },
        ]}
      >
        {renderList(context)}
      </View>
      <View style={[{ flex: 1, minWidth: 0 }, !panes.detail && { display: "none" }]}>
        {panes.back && (
          <View style={{ padding: spacing.sm }}>
            <Button label={backLabel} variant="ghost" onPress={back} />
          </View>
        )}
        {selectedId !== null ? renderDetail({ ...context, selectedId }) : emptyDetail}
      </View>
    </View>
  );
}
