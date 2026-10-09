import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";
import type { ApiClient } from "./client";
import type { Session, SessionStore } from "./session";

const ApiClientContext = createContext<ApiClient | null>(null);

export function ApiClientProvider({ client, children }: { client: ApiClient; children: ReactNode }) {
  return <ApiClientContext.Provider value={client}>{children}</ApiClientContext.Provider>;
}

export function useApiClient(): ApiClient {
  const client = useContext(ApiClientContext);
  if (!client) throw new Error("useApiClient must be used inside <ApiClientProvider>");
  return client;
}

/** Current session from a store; re-renders on change. */
export function useSession(store: SessionStore): Session | null {
  return useSyncExternalStore(store.subscribe, store.getSession, store.getSession);
}
