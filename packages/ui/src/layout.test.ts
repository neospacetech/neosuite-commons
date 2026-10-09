import { describe, expect, it } from "vitest";
import {
  cardFields,
  dataViewModeFor,
  listDetailModeFor,
  listDetailPanes,
  minTargetFor,
  navModeFor,
  panelModeFor,
  paneWidth,
  resolveSlot,
} from "./layout";

describe("navModeFor", () => {
  it.each([
    ["compact", "tabs"],
    ["medium", "rail"],
    ["expanded", "sidebar"],
    ["large", "sidebar"],
    ["tv", "sidebar"],
  ] as const)("%s -> %s", (bp, mode) => {
    expect(navModeFor(bp)).toBe(mode);
  });
});

describe("list-detail", () => {
  it("stacks on compact and splits otherwise", () => {
    expect(listDetailModeFor("compact")).toBe("stack");
    expect(listDetailModeFor("medium")).toBe("split");
    expect(listDetailModeFor("tv")).toBe("split");
  });

  it("shows one pane at a time when stacked", () => {
    expect(listDetailPanes("stack", false)).toEqual({ list: true, detail: false, back: false });
    expect(listDetailPanes("stack", true)).toEqual({ list: false, detail: true, back: true });
    expect(listDetailPanes("split", true)).toEqual({ list: true, detail: true, back: false });
  });
});

describe("panels, data views and targets", () => {
  it("uses sheets and cards only on compact", () => {
    expect(panelModeFor("compact")).toBe("sheet");
    expect(panelModeFor("medium")).toBe("side");
    expect(dataViewModeFor("compact")).toBe("cards");
    expect(dataViewModeFor("expanded")).toBe("table");
  });

  it("keeps 44pt targets for touch and D-pad", () => {
    expect(minTargetFor("touch")).toBe(44);
    expect(minTargetFor("dpad")).toBe(44);
    expect(minTargetFor("fine")).toBeLessThan(44);
  });
});

describe("resolveSlot", () => {
  const slots = { compact: "c", expanded: "e" };
  it("falls back to the nearest narrower slot", () => {
    expect(resolveSlot("compact", slots)).toBe("c");
    expect(resolveSlot("medium", slots)).toBe("c");
    expect(resolveSlot("large", slots)).toBe("e");
    expect(resolveSlot("tv", slots)).toBe("e");
    expect(resolveSlot("tv", { ...slots, tv: "t" })).toBe("t");
  });
});

describe("cardFields", () => {
  it("uses the marked primary column as the card title", () => {
    const columns = [{ key: "id", header: "ID" }, { key: "name", header: "Name", primary: true }, { key: "due", header: "Due" }];
    const { primary, rest } = cardFields(columns);
    expect(primary?.key).toBe("name");
    expect(rest.map((c) => c.key)).toEqual(["id", "due"]);
  });

  it("falls back to the first column", () => {
    expect(cardFields([{ key: "a", header: "A" }]).primary?.key).toBe("a");
  });
});

describe("paneWidth", () => {
  it("caps a pane to a fraction of the container", () => {
    expect(paneWidth(360, 1440)).toBe(360);
    expect(paneWidth(360, 600)).toBe(240);
  });
});
