import { describe, expect, it } from "vitest";
import { formatObjectRef, isValidEventType, parseObjectRef } from "./index";

const ID = "01J9Z3QK8T6V2N4R5S7W8X9Y0A";

describe("object refs", () => {
  it("round-trips tenant and id", () => {
    const ref = formatObjectRef("acme", ID);
    expect(ref).toBe(`neo://acme/o/${ID}`);
    expect(parseObjectRef(ref)).toEqual({ tenant: "acme", id: ID });
  });

  it("rejects malformed refs", () => {
    expect(parseObjectRef(`https://acme/o/${ID}`)).toBeNull();
    expect(parseObjectRef("neo://acme/o/not-a-ulid")).toBeNull();
    expect(parseObjectRef(`neo://Acme/o/${ID}`)).toBeNull();
    expect(() => formatObjectRef("acme", "short")).toThrow();
  });
});

describe("event types", () => {
  it("accepts <product>.<type>.<past-verb>", () => {
    expect(isValidEventType("neotasks.task.completed")).toBe(true);
    expect(isValidEventType("neotasks.Task.completed")).toBe(false);
    expect(isValidEventType("task.completed")).toBe(false);
  });
});
