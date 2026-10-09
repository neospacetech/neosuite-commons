/*
 * Hand-written for now. These types will be generated from the contracts/ directories of the
 * NeoSuite repositories; keep names and shapes aligned with those contracts.
 */

import type { ActionDescriptor, JsonSchema } from "./actions";

/** Path every service serves its manifest at. */
export const MANIFEST_PATH = "/.well-known/neosuite/manifest.json";

export interface TypeDescriptor {
  /** Registered type name, e.g. `neotasks.Task`. */
  name: string;
  title: string;
  description?: string;
  schema: JsonSchema;
}

export interface EventDescriptor {
  /** CloudEvents type, e.g. `neotasks.task.completed`. */
  type: string;
  description?: string;
  data_schema: JsonSchema;
}

export interface ContextProviderDescriptor {
  id: string;
  title: string;
  description: string;
  /** Endpoint path, relative to the service base URL. */
  path: string;
  /** Object types this provider can describe. */
  object_types?: string[];
  input_schema?: JsonSchema;
}

/** Shape of `/.well-known/neosuite/manifest.json`. */
export interface Manifest {
  manifest_version: 1;
  service: {
    id: string;
    name: string;
    version: string;
    api_base?: string;
  };
  types: TypeDescriptor[];
  events: EventDescriptor[];
  actions: ActionDescriptor[];
  context_providers: ContextProviderDescriptor[];
}
