import { describe, expect, it, vi } from "vitest";
import { ApiClient, ApiError, type FetchLike } from "./index";

function mockFetch(response: Response | Error) {
  return vi.fn<FetchLike>(async () => {
    if (response instanceof Error) throw response;
    return response;
  });
}

function problem(status: number, body: unknown, contentType = "application/problem+json") {
  return new Response(typeof body === "string" ? body : JSON.stringify(body), {
    status,
    headers: { "Content-Type": contentType },
  });
}

async function caught(promise: Promise<unknown>): Promise<ApiError> {
  try {
    await promise;
  } catch (error) {
    expect(error).toBeInstanceOf(ApiError);
    return error as ApiError;
  }
  throw new Error("expected rejection");
}

describe("ApiClient requests", () => {
  it("joins base URL, query and bearer token", async () => {
    const fetch = mockFetch(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    const client = new ApiClient({ baseUrl: "https://suite.test/api/tasks/", fetch, getToken: async () => "tok" });

    await expect(client.get("/v1/tasks", { query: { limit: 10, tag: ["a", "b"], cursor: undefined } })).resolves.toEqual({
      ok: true,
    });

    const [url, init] = fetch.mock.calls[0]!;
    expect(url).toBe("https://suite.test/api/tasks/v1/tasks?limit=10&tag=a&tag=b");
    expect((init?.headers as Record<string, string>).Authorization).toBe("Bearer tok");
  });

  it("serialises JSON bodies", async () => {
    const fetch = mockFetch(new Response(null, { status: 204 }));
    const client = new ApiClient({ baseUrl: "https://suite.test", fetch });
    await expect(client.post("/x", { a: 1 })).resolves.toBeUndefined();
    const init = fetch.mock.calls[0]![1]!;
    expect(init.body).toBe('{"a":1}');
    expect((init.headers as Record<string, string>)["Content-Type"]).toBe("application/json");
  });
});

describe("ApiClient error parsing", () => {
  it("reads problem+json with a stable code", async () => {
    const fetch = mockFetch(
      problem(404, {
        type: "https://neosuite.dev/problems/object-not-found",
        title: "Object not found",
        status: 404,
        detail: "No task 01J9Z3QK8T6V2N4R5S7W8X9Y0A",
        code: "object.not_found",
        object_id: "01J9Z3QK8T6V2N4R5S7W8X9Y0A",
      }),
    );
    const error = await caught(new ApiClient({ baseUrl: "https://suite.test", fetch }).get("/o/1"));
    expect(error.code).toBe("object.not_found");
    expect(error.status).toBe(404);
    expect(error.title).toBe("Object not found");
    expect(error.message).toBe("No task 01J9Z3QK8T6V2N4R5S7W8X9Y0A");
    expect(error.problem.object_id).toBe("01J9Z3QK8T6V2N4R5S7W8X9Y0A");
    expect(error.retryable).toBe(false);
  });

  it("honours an explicit retryable flag", async () => {
    const fetch = mockFetch(problem(409, { title: "Busy", code: "object.locked", retryable: true }));
    const error = await caught(new ApiClient({ baseUrl: "https://suite.test", fetch }).get("/x"));
    expect(error.code).toBe("object.locked");
    expect(error.retryable).toBe(true);
  });

  it("derives a code from the status when the problem has none", async () => {
    const fetch = mockFetch(problem(429, { title: "Slow down" }));
    const error = await caught(new ApiClient({ baseUrl: "https://suite.test", fetch }).get("/x"));
    expect(error.code).toBe("rate_limited");
    expect(error.retryable).toBe(true);
  });

  it("handles non-JSON error bodies", async () => {
    const fetch = mockFetch(
      new Response("<html>bad gateway</html>", { status: 502, statusText: "Bad Gateway", headers: { "Content-Type": "text/html" } }),
    );
    const error = await caught(new ApiClient({ baseUrl: "https://suite.test", fetch }).get("/x"));
    expect(error.code).toBe("bad_gateway");
    expect(error.title).toBe("Bad Gateway");
    expect(error.detail).toBe("<html>bad gateway</html>");
    expect(error.retryable).toBe(true);
  });

  it("wraps transport failures as network_error", async () => {
    const fetch = mockFetch(new TypeError("Failed to fetch"));
    const error = await caught(new ApiClient({ baseUrl: "https://suite.test", fetch }).get("/x"));
    expect(error.code).toBe("network_error");
    expect(error.status).toBe(0);
    expect(error.retryable).toBe(true);
    expect(error.cause).toBeInstanceOf(TypeError);
  });

  it("notifies on unauthenticated responses", async () => {
    const onUnauthenticated = vi.fn();
    const fetch = mockFetch(problem(401, { title: "Token expired", code: "auth.token_expired" }));
    const client = new ApiClient({ baseUrl: "https://suite.test", fetch, onUnauthenticated });
    const error = await caught(client.get("/x"));
    expect(onUnauthenticated).toHaveBeenCalledWith(error);
  });
});
