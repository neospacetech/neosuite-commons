import { paneWidths, spacing, type Breakpoint } from "@neospacetech/neosuite-tokens";
import { useEffect, useId, type ReactNode } from "react";
import { BackHandler, Modal, Platform, StyleSheet, View } from "react-native";
import { Button } from "./Button";
import { useBreakpoint } from "./environment";
import { panelModeFor, paneWidth } from "./layout";
import { Row } from "./Stack";
import { Text } from "./Text";
import { useTheme } from "./theme";

function PanelHeader({ title, titleId, onClose, closeLabel }: { title: string; titleId: string; onClose: () => void; closeLabel: string }) {
  const { colors } = useTheme();
  return (
    <Row gap="sm" padding="sm" style={{ borderBottomWidth: 1, borderColor: colors.border, paddingLeft: spacing.lg }}>
      <Text nativeID={titleId} variant="subtitle" headingLevel={2} style={{ flex: 1 }}>
        {title}
      </Text>
      <Button label={closeLabel} variant="ghost" onPress={onClose} />
    </Row>
  );
}

function useEscape(active: boolean, onClose: () => void) {
  useEffect(() => {
    if (!active) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      onClose();
      return true;
    });
    let removeKey = () => {};
    if (Platform.OS === "web" && typeof document !== "undefined") {
      const onKey = (event: KeyboardEvent) => {
        if (event.key === "Escape") onClose();
      };
      document.addEventListener("keydown", onKey);
      removeKey = () => document.removeEventListener("keydown", onKey);
    }
    return () => {
      sub.remove();
      removeKey();
    };
  }, [active, onClose]);
}

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  closeLabel?: string;
}

/** Full-screen modal sheet. For modal flows on any breakpoint. */
export function Sheet({ open, onClose, title, children, closeLabel = "Close" }: SheetProps) {
  const { colors } = useTheme();
  const titleId = useId();
  return (
    <Modal visible={open} onRequestClose={onClose} animationType="slide" presentationStyle="fullScreen">
      <View role="dialog" aria-modal aria-labelledby={titleId} style={{ flex: 1, backgroundColor: colors.background }}>
        <PanelHeader title={title} titleId={titleId} onClose={onClose} closeLabel={closeLabel} />
        <View style={{ flex: 1, minHeight: 0 }}>{children}</View>
      </View>
    </Modal>
  );
}

export interface SidePanelProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  width?: number;
  closeLabel?: string;
}

/** Inline panel at the trailing edge of a row layout. */
export function SidePanel({ title, onClose, children, width = paneWidths.sidePanel, closeLabel = "Close" }: SidePanelProps) {
  const { colors } = useTheme();
  const titleId = useId();
  return (
    <View
      role="complementary"
      aria-labelledby={titleId}
      style={{ width, borderLeftWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }}
    >
      <PanelHeader title={title} titleId={titleId} onClose={onClose} closeLabel={closeLabel} />
      <View style={{ flex: 1, minHeight: 0 }}>{children}</View>
    </View>
  );
}

export interface AdaptivePanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Panel content, e.g. the NeoMind panel. */
  panel: ReactNode;
  /** Main content the panel sits beside. */
  children: ReactNode;
  width?: number;
  closeLabel?: string;
  breakpoint?: Breakpoint;
}

/**
 * Secondary panel that is a full-screen sheet on compact and a side panel on wider sizes.
 * The panel content stays mounted while open, so its state survives resizing across breakpoints.
 */
export function AdaptivePanel({
  open,
  onClose,
  title,
  panel,
  children,
  width = paneWidths.sidePanel,
  closeLabel = "Close",
  breakpoint,
}: AdaptivePanelProps) {
  const { colors } = useTheme();
  const info = useBreakpoint();
  const mode = panelModeFor(breakpoint ?? info.breakpoint);
  const sheet = mode === "sheet";
  const titleId = useId();
  useEscape(open, onClose);

  return (
    <View style={{ flex: 1, flexDirection: "row", minWidth: 0 }}>
      <View
        style={{ flex: 1, minWidth: 0 }}
        aria-hidden={open && sheet}
        importantForAccessibility={open && sheet ? "no-hide-descendants" : "auto"}
      >
        {children}
      </View>
      {open && (
        <View
          role={sheet ? "dialog" : "complementary"}
          aria-modal={sheet}
          aria-labelledby={titleId}
          style={
            sheet
              ? [StyleSheet.absoluteFill, { backgroundColor: colors.background, zIndex: 10 }]
              : {
                  width: paneWidth(width, info.width, 0.5),
                  borderLeftWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                }
          }
        >
          <PanelHeader title={title} titleId={titleId} onClose={onClose} closeLabel={closeLabel} />
          <View style={{ flex: 1, minHeight: 0 }}>{panel}</View>
        </View>
      )}
    </View>
  );
}
