/**
 * Pure layout decisions. Components delegate every breakpoint-dependent choice to these
 * functions so the rules are testable without rendering.
 */
import { minPointerTarget, minTouchTarget, type Breakpoint } from "@neospacetech/neosuite-tokens";
import type { DataColumn } from "./DataView";

/** Primary navigation: bottom tabs (compact), navigation rail (medium), sidebar (expanded, large, tv). */
export type NavMode = "tabs" | "rail" | "sidebar";

export function navModeFor(bp: Breakpoint): NavMode {
  switch (bp) {
    case "compact":
      return "tabs";
    case "medium":
      return "rail";
    default:
      return "sidebar";
  }
}

/** List-detail: one pane with push navigation (compact) or side-by-side panes. */
export type ListDetailMode = "stack" | "split";

export function listDetailModeFor(bp: Breakpoint): ListDetailMode {
  return bp === "compact" ? "stack" : "split";
}

export interface ListDetailPanes {
  list: boolean;
  detail: boolean;
  /** Whether the detail pane offers a back affordance to return to the list. */
  back: boolean;
}

export function listDetailPanes(mode: ListDetailMode, hasSelection: boolean): ListDetailPanes {
  if (mode === "split") return { list: true, detail: true, back: false };
  return { list: !hasSelection, detail: hasSelection, back: hasSelection };
}

export interface CardFields<T> {
  primary: DataColumn<T> | undefined;
  rest: DataColumn<T>[];
}

/** Split table columns into the card title and the remaining label/value fields. */
export function cardFields<T>(columns: DataColumn<T>[]): CardFields<T> {
  const primary = columns.find((c) => c.primary) ?? columns[0];
  return { primary, rest: columns.filter((c) => c !== primary) };
}

/** Secondary panels (e.g. the NeoMind panel): full-screen sheet on compact, side panel otherwise. */
export type PanelMode = "sheet" | "side";

export function panelModeFor(bp: Breakpoint): PanelMode {
  return bp === "compact" ? "sheet" : "side";
}

/** Tabular data: card list on compact, table otherwise. */
export type DataViewMode = "cards" | "table";

export function dataViewModeFor(bp: Breakpoint): DataViewMode {
  return bp === "compact" ? "cards" : "table";
}

export type PointerKind = "touch" | "fine" | "dpad";

/** Minimum interactive target size for the active input mode. */
export function minTargetFor(pointer: PointerKind): number {
  return pointer === "fine" ? minPointerTarget : minTouchTarget;
}

export interface BreakpointSlots<T> {
  compact: T;
  medium?: T;
  expanded?: T;
  large?: T;
  tv?: T;
}

const FALLBACK: Record<Breakpoint, readonly Breakpoint[]> = {
  compact: ["compact"],
  medium: ["medium", "compact"],
  expanded: ["expanded", "medium", "compact"],
  large: ["large", "expanded", "medium", "compact"],
  tv: ["tv", "large", "expanded", "medium", "compact"],
};

/** Value for a breakpoint, falling back to the nearest narrower slot that is defined. */
export function resolveSlot<T>(bp: Breakpoint, slots: BreakpointSlots<T>): T {
  for (const candidate of FALLBACK[bp]) {
    const value = slots[candidate];
    if (value !== undefined) return value;
  }
  return slots.compact;
}

/** Width of a side pane: its preferred width, but never more than `maxFraction` of the container. */
export function paneWidth(preferred: number, containerWidth: number, maxFraction = 0.4): number {
  return Math.max(0, Math.min(preferred, Math.floor(containerWidth * maxFraction)));
}
