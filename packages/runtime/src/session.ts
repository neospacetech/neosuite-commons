export interface Session {
  accessToken: string;
  refreshToken?: string;
  /** Access-token expiry, epoch milliseconds. */
  expiresAt?: number;
  /** Subject (user id) from the identity provider. */
  subject?: string;
  tenant?: string;
}

/**
 * Holds the current session. Reads are synchronous so UI can render from it directly;
 * persistent implementations hydrate from secure storage before first use.
 * Native apps persist tokens in the platform keychain; web keeps them in memory.
 */
export interface SessionStore {
  getSession(): Session | null;
  setSession(session: Session | null): Promise<void>;
  /** Subscribe to changes; returns an unsubscribe function. */
  subscribe(listener: () => void): () => void;
}

/** Refreshes an expiring session, returning the new session or null when sign-in is required. */
export type SessionRefresher = (session: Session) => Promise<Session | null>;

export function createMemorySessionStore(initial: Session | null = null): SessionStore {
  let current = initial;
  const listeners = new Set<() => void>();
  return {
    getSession: () => current,
    async setSession(session) {
      current = session;
      for (const listener of [...listeners]) listener();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export function isExpired(session: Session, now = Date.now(), skewMs = 30_000): boolean {
  return session.expiresAt !== undefined && session.expiresAt - skewMs <= now;
}

/**
 * Token provider for `ApiClient` backed by a session store. Expiring sessions are refreshed
 * once, with concurrent callers sharing the same refresh.
 */
export function tokenProviderFromStore(store: SessionStore, refresh?: SessionRefresher): () => Promise<string | null> {
  let pending: Promise<Session | null> | null = null;
  return async () => {
    const session = store.getSession();
    if (!session) return null;
    if (!refresh || !isExpired(session)) return session.accessToken;
    pending ??= refresh(session)
      .then(async (next) => {
        await store.setSession(next);
        return next;
      })
      .finally(() => {
        pending = null;
      });
    const next = await pending;
    return next?.accessToken ?? null;
  };
}
