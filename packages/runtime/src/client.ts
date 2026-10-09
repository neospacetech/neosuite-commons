import { ApiError, errorFromResponse, networkError } from "./errors";
import { sseFromResponse, type SseMessage } from "./sse";

/** Returns the current bearer token, or nothing for anonymous requests. */
export type TokenProvider = () => string | null | undefined | Promise<string | null | undefined>;

export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export type QueryValue = string | number | boolean | null | undefined;

export interface ApiClientOptions {
  /** Absolute base URL, e.g. `https://suite.example.com/api/tasks`. */
  baseUrl: string;
  getToken?: TokenProvider;
  /** Fetch implementation. Defaults to the global `fetch`. */
  fetch?: FetchLike;
  /** Headers sent with every request. */
  headers?: Record<string, string>;
  /** Called with every `unauthenticated` error, e.g. to trigger a token refresh or sign-in. */
  onUnauthenticated?: (error: ApiError) => void;
}

export interface RequestOptions {
  query?: Record<string, QueryValue | QueryValue[]>;
  /** JSON-serialised unless it is a `FormData`, `Blob`, `URLSearchParams` or string. */
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

function isRawBody(body: unknown): body is BodyInit {
  return (
    typeof body === "string" ||
    (typeof FormData !== "undefined" && body instanceof FormData) ||
    (typeof Blob !== "undefined" && body instanceof Blob) ||
    (typeof URLSearchParams !== "undefined" && body instanceof URLSearchParams) ||
    body instanceof ArrayBuffer
  );
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly options: ApiClientOptions;

  constructor(options: ApiClientOptions) {
    this.options = options;
    this.baseUrl = options.baseUrl.replace(/\/+$/, "");
  }

  /** Resolve a path against the base URL and append query parameters. */
  url(path: string, query?: RequestOptions["query"]): string {
    const url = /^https?:\/\//.test(path) ? path : `${this.baseUrl}/${path.replace(/^\/+/, "")}`;
    if (!query) return url;
    const params = new URLSearchParams();
    for (const [key, raw] of Object.entries(query)) {
      for (const value of Array.isArray(raw) ? raw : [raw]) {
        if (value !== undefined && value !== null) params.append(key, String(value));
      }
    }
    const qs = params.toString();
    return qs ? `${url}${url.includes("?") ? "&" : "?"}${qs}` : url;
  }

  /** Send a request and return the raw response. Throws `ApiError` for transport failures and non-2xx statuses. */
  async send(method: HttpMethod, path: string, options: RequestOptions = {}, accept = "application/json"): Promise<Response> {
    const headers: Record<string, string> = {
      Accept: `${accept}, application/problem+json;q=0.9`,
      ...this.options.headers,
      ...options.headers,
    };
    const token = await this.options.getToken?.();
    if (token) headers.Authorization = `Bearer ${token}`;

    let body: BodyInit | undefined;
    if (options.body !== undefined) {
      if (isRawBody(options.body)) {
        body = options.body;
      } else {
        body = JSON.stringify(options.body);
        headers["Content-Type"] ??= "application/json";
      }
    }

    const doFetch = this.options.fetch ?? ((input, init) => globalThis.fetch(input, init));
    let response: Response;
    try {
      response = await doFetch(this.url(path, options.query), { method, headers, body, signal: options.signal });
    } catch (cause) {
      throw networkError(cause);
    }

    if (!response.ok) {
      const error = await errorFromResponse(response);
      if (error.code === "unauthenticated" || response.status === 401) this.options.onUnauthenticated?.(error);
      throw error;
    }
    return response;
  }

  /** Send a request and decode a JSON response. 204 and empty bodies resolve to `undefined`. */
  async request<T>(method: HttpMethod, path: string, options?: RequestOptions): Promise<T> {
    const response = await this.send(method, path, options);
    if (response.status === 204) return undefined as T;
    const text = await response.text();
    if (!text) return undefined as T;
    try {
      return JSON.parse(text) as T;
    } catch (cause) {
      throw new ApiError(
        { status: response.status, code: "invalid_response", title: "Response was not valid JSON", retryable: false },
        { cause },
      );
    }
  }

  get<T>(path: string, options?: Omit<RequestOptions, "body">): Promise<T> {
    return this.request<T>("GET", path, options);
  }

  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>("POST", path, { ...options, body });
  }

  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>("PUT", path, { ...options, body });
  }

  patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>("PATCH", path, { ...options, body });
  }

  delete<T = void>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>("DELETE", path, options);
  }

  /**
   * Open a server-sent event stream. Iterate with `for await`; abort via `options.signal` or by
   * breaking out of the loop. Send `Last-Event-ID` in `options.headers` to resume.
   */
  async *stream(path: string, options: RequestOptions & { method?: HttpMethod } = {}): AsyncGenerator<SseMessage> {
    const { method = options.body === undefined ? "GET" : "POST", ...rest } = options;
    const response = await this.send(method, path, rest, "text/event-stream");
    yield* sseFromResponse(response);
  }
}
