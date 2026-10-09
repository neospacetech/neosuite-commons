/**
 * Window-size classes. Widths are density-independent pixels (dp on native, CSS px on web).
 *
 * - `compact`  < 600      phones
 * - `medium`   600–1023   tablets, foldables, small windows
 * - `expanded` 1024–1439  laptops
 * - `large`    ≥ 1440     desktops
 * - `tv`       10-ft UI with D-pad focus, chosen by form factor rather than width
 */
export type SizeClass = "compact" | "medium" | "expanded" | "large";
export type Breakpoint = SizeClass | "tv";

/** Minimum width (inclusive) of each size class. */
export const breakpoints = {
  compact: 0,
  medium: 600,
  expanded: 1024,
  large: 1440,
} as const satisfies Record<SizeClass, number>;

/** Size classes ordered from narrowest to widest. */
export const sizeClasses: readonly SizeClass[] = ["compact", "medium", "expanded", "large"];

export interface BreakpointOptions {
  /** True when running on a television (e.g. `Platform.isTV`). */
  isTV?: boolean;
}

/** Size class for a window width, ignoring form factor. Non-finite or negative widths are `compact`. */
export function sizeClassFor(width: number): SizeClass {
  if (!Number.isFinite(width)) return width === Infinity ? "large" : "compact";
  if (width >= breakpoints.large) return "large";
  if (width >= breakpoints.expanded) return "expanded";
  if (width >= breakpoints.medium) return "medium";
  return "compact";
}

/** Breakpoint for a window width; television form factor takes precedence over width. */
export function breakpointFor(width: number, options: BreakpointOptions = {}): Breakpoint {
  return options.isTV ? "tv" : sizeClassFor(width);
}

/** True when `bp` is at least as wide as `min`. `tv` counts as `large`. */
export function isAtLeast(bp: Breakpoint, min: SizeClass): boolean {
  const effective: SizeClass = bp === "tv" ? "large" : bp;
  return sizeClasses.indexOf(effective) >= sizeClasses.indexOf(min);
}

/** Narrowest width every screen must support without horizontal scrolling (WCAG 1.4.10). */
export const minSupportedWidth = 320;
