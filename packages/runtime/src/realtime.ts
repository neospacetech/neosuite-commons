import type { CloudEvent } from "@neospacetech/neosuite-schema";

export type RealtimeState = "idle" | "connecting" | "open" | "reconnecting" | "closed";

export interface RealtimeSubscription {
  unsubscribe(): void;
}

/**
 * Live updates over a WebSocket. Servers push CloudEvents on named channels
 * (e.g. an object ref or `tenant:<id>`). Implementations reconnect with backoff
 * and resubscribe automatically.
 */
export interface RealtimeClient {
  readonly state: RealtimeState;
  connect(): void;
  close(): void;
  subscribe<TData = unknown>(channel: string, handler: (event: CloudEvent<TData>) => void): RealtimeSubscription;
  onStateChange(listener: (state: RealtimeState) => void): () => void;
}

export interface RealtimeOptions {
  url: string;
  getToken?: () => string | null | undefined | Promise<string | null | undefined>;
  /** WebSocket constructor; defaults to the global. */
  WebSocket?: typeof WebSocket;
}

/** Exponential backoff with full jitter, capped at `maxMs`. */
export function backoffDelay(attempt: number, baseMs = 500, maxMs = 30_000, random: () => number = Math.random): number {
  const ceiling = Math.min(maxMs, baseMs * 2 ** Math.max(0, attempt));
  return Math.round(random() * ceiling);
}
