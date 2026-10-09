import { describe, expect, it, vi } from "vitest";
import { backoffDelay, createMemorySessionStore, tokenProviderFromStore } from "./index";

describe("tokenProviderFromStore", () => {
  it("returns the current token and refreshes expired sessions once", async () => {
    const store = createMemorySessionStore({ accessToken: "old", expiresAt: Date.now() - 1 });
    const refresh = vi.fn(async () => ({ accessToken: "new", expiresAt: Date.now() + 3_600_000 }));
    const getToken = tokenProviderFromStore(store, refresh);
    const tokens = await Promise.all([getToken(), getToken()]);
    expect(tokens).toEqual(["new", "new"]);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(await getToken()).toBe("new");
  });

  it("returns null when signed out", async () => {
    expect(await tokenProviderFromStore(createMemorySessionStore())()).toBeNull();
  });
});

describe("backoffDelay", () => {
  it("grows exponentially and caps", () => {
    expect(backoffDelay(0, 500, 30_000, () => 1)).toBe(500);
    expect(backoffDelay(3, 500, 30_000, () => 1)).toBe(4000);
    expect(backoffDelay(20, 500, 30_000, () => 1)).toBe(30_000);
  });
});
