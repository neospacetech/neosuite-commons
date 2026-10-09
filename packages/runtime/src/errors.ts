/** RFC 9457 problem details, with NeoSuite's stable `code` extension. */
export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  /** Stable, machine-readable error code, e.g. `object.not_found`. */
  code?: string;
  /** Whether repeating the same request may succeed. */
  retryable?: boolean;
  [extension: string]: unknown;
}

const STATUS_CODES: Record<number, string> = {
  400: "bad_request",
  401: "unauthenticated",
  403: "forbidden",
  404: "not_found",
  405: "method_not_allowed",
  408: "timeout",
  409: "conflict",
  410: "gone",
  412: "precondition_failed",
  413: "payload_too_large",
  415: "unsupported_media_type",
  422: "validation_failed",
  429: "rate_limited",
  500: "internal",
  502: "bad_gateway",
  503: "unavailable",
  504: "gateway_timeout",
};

const RETRYABLE_STATUSES = new Set([408, 425, 429, 502, 503, 504]);

/** Fallback code used when the server did not supply one. */
export function codeForStatus(status: number): string {
  return STATUS_CODES[status] ?? (status >= 500 ? "internal" : `http_${status}`);
}

/** Error raised for every failed request. `code` is stable and safe to branch on. */
export class ApiError extends Error {
  override readonly name = "ApiError";
  readonly code: string;
  /** HTTP status, or 0 when no response was received. */
  readonly status: number;
  readonly retryable: boolean;
  readonly problem: ProblemDetails;

  constructor(problem: ProblemDetails & { status: number; code: string }, options?: { cause?: unknown }) {
    super(problem.detail ?? problem.title ?? problem.code, options);
    this.code = problem.code;
    this.status = problem.status;
    this.retryable = problem.retryable ?? (problem.status === 0 || RETRYABLE_STATUSES.has(problem.status));
    this.problem = problem;
  }

  get title(): string | undefined {
    return this.problem.title;
  }

  get detail(): string | undefined {
    return this.problem.detail;
  }
}

export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Build an `ApiError` from a non-2xx response. Never throws. */
export async function errorFromResponse(response: Response): Promise<ApiError> {
  const status = response.status;
  let text = "";
  try {
    text = await response.text();
  } catch {
    // Body unreadable; fall back to the status.
  }

  let parsed: unknown;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = undefined;
    }
  }

  if (isRecord(parsed)) {
    const problem = parsed as ProblemDetails;
    const code = typeof problem.code === "string" && problem.code ? problem.code : codeForStatus(status);
    return new ApiError({
      ...problem,
      title: typeof problem.title === "string" ? problem.title : response.statusText || undefined,
      detail: typeof problem.detail === "string" ? problem.detail : undefined,
      retryable: typeof problem.retryable === "boolean" ? problem.retryable : undefined,
      status,
      code,
    });
  }

  return new ApiError({
    status,
    code: codeForStatus(status),
    title: response.statusText || undefined,
    detail: text ? text.slice(0, 500) : undefined,
  });
}

/** Wrap a transport failure (DNS, offline, CORS, abort). */
export function networkError(cause: unknown): ApiError {
  const aborted = isRecord(cause) && cause.name === "AbortError";
  return new ApiError(
    {
      status: 0,
      code: aborted ? "aborted" : "network_error",
      title: aborted ? "Request aborted" : "Network request failed",
      retryable: !aborted,
    },
    { cause },
  );
}
