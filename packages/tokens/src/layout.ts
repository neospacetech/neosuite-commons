/** Spacing scale in dp. Components never set outer margins; parents space children with these. */
export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  huge: 64,
} as const;
export type SpacingToken = keyof typeof spacing;

export const radii = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 9999,
} as const;
export type RadiusToken = keyof typeof radii;

/** Minimum interactive target on touch devices, in dp/pt. */
export const minTouchTarget = 44;

/** Minimum interactive target for fine pointers (mouse, trackpad). */
export const minPointerTarget = 32;

/** Focus indicator geometry. */
export const focusRing = {
  width: 2,
  offset: 2,
} as const;

/** Pane widths used by adaptive layouts. */
export const paneWidths = {
  navigationRail: 80,
  sidebar: 256,
  listPane: 360,
  sidePanel: 400,
  maxContent: 1200,
} as const;
