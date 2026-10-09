import { describe, expect, it } from "vitest";
import {
  breakpointFor,
  contrastRatio,
  isAtLeast,
  maxFontScale,
  resolveThemeName,
  scaleTextStyle,
  sizeClassFor,
  themes,
  typography,
  type ThemeName,
} from "./index";

describe("breakpointFor", () => {
  it.each([
    [0, "compact"],
    [320, "compact"],
    [599, "compact"],
    [599.9, "compact"],
    [600, "medium"],
    [1023, "medium"],
    [1024, "expanded"],
    [1439, "expanded"],
    [1440, "large"],
    [3840, "large"],
  ] as const)("width %d -> %s", (width, expected) => {
    expect(breakpointFor(width)).toBe(expected);
  });

  it("treats invalid widths as compact", () => {
    expect(breakpointFor(-1)).toBe("compact");
    expect(breakpointFor(Number.NaN)).toBe("compact");
  });

  it("returns tv for televisions regardless of width", () => {
    expect(breakpointFor(1920, { isTV: true })).toBe("tv");
    expect(breakpointFor(320, { isTV: true })).toBe("tv");
    expect(breakpointFor(1920, { isTV: false })).toBe("large");
  });

  it("sizeClassFor ignores form factor", () => {
    expect(sizeClassFor(960)).toBe("medium");
  });
});

describe("isAtLeast", () => {
  it("orders size classes and treats tv as large", () => {
    expect(isAtLeast("compact", "medium")).toBe(false);
    expect(isAtLeast("medium", "medium")).toBe(true);
    expect(isAtLeast("large", "expanded")).toBe(true);
    expect(isAtLeast("tv", "large")).toBe(true);
  });
});

describe("typography", () => {
  it("scales with OS font scale and clamps at the maximum", () => {
    expect(scaleTextStyle(typography.body, 1.5).fontSize).toBe(24);
    expect(scaleTextStyle(typography.body, 3).fontSize).toBe(typography.body.fontSize * maxFontScale);
  });
});

describe("resolveThemeName", () => {
  it("prefers explicit choice, then high contrast, then the OS scheme", () => {
    expect(resolveThemeName("light", "dark", true)).toBe("light");
    expect(resolveThemeName("system", "dark", true)).toBe("highContrast");
    expect(resolveThemeName("system", "dark")).toBe("dark");
    expect(resolveThemeName("system", null)).toBe("light");
  });
});

describe("themes", () => {
  const names = Object.keys(themes) as ThemeName[];
  const minimum = (name: ThemeName) => (name === "highContrast" ? 7 : 4.5);

  it.each(names)("%s text roles meet contrast minimums", (name) => {
    const t = themes[name];
    const min = minimum(name);
    expect(contrastRatio(t.text, t.background)).toBeGreaterThanOrEqual(min);
    expect(contrastRatio(t.text, t.surface)).toBeGreaterThanOrEqual(min);
    expect(contrastRatio(t.textMuted, t.background)).toBeGreaterThanOrEqual(min);
    expect(contrastRatio(t.onPrimary, t.primary)).toBeGreaterThanOrEqual(min);
    expect(contrastRatio(t.onDanger, t.danger)).toBeGreaterThanOrEqual(min);
    expect(contrastRatio(t.placeholder, t.background)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(names)("%s focus ring is visible against the background", (name) => {
    const t = themes[name];
    expect(contrastRatio(t.focusRing, t.background)).toBeGreaterThanOrEqual(3);
  });
});
