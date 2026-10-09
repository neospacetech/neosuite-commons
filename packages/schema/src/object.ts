/*
 * Hand-written for now. These types will be generated from the contracts/ directories of the
 * NeoSuite repositories; keep names and shapes aligned with those contracts.
 */

import type { ObjectRef, Timestamp, Ulid } from "./refs";

/** A user, service account or agent acting in a tenant. */
export interface PrincipalRef {
  kind: "user" | "group" | "service" | "agent";
  id: string;
  display_name?: string;
}

export type Sensitivity = "public" | "internal" | "confidential" | "restricted";

export interface PermissionGrant {
  principal: PrincipalRef;
  /** Relation in the permission graph, e.g. `viewer`, `editor`, `owner`. */
  relation: string;
}

export interface ObjectPermissions {
  /** Whether the object inherits grants from its parent. */
  inherit: boolean;
  grants: PermissionGrant[];
  /** Actions the current caller may perform, when the server includes them. */
  allowed_actions?: string[];
}

export interface Relationship {
  /** Relationship kind, e.g. `assigned_to`, `blocks`, `member_of`. */
  kind: string;
  target: ObjectRef;
  properties?: Record<string, unknown>;
}

/** A mention of another object from inside this one's content. */
export interface ObjectReference {
  target: ObjectRef;
  /** Property or content path that holds the reference. */
  path?: string;
}

export interface HistoryEntry {
  version: number;
  at: Timestamp;
  actor: PrincipalRef;
  /** CloudEvents type of the change, e.g. `neotasks.task.updated`. */
  event_type: string;
  summary?: string;
}

export interface Provenance {
  /** Product or service that created the object, e.g. `neotasks`. */
  source: string;
  /** Identifier in the originating system, for imported objects. */
  external_id?: string;
  imported_at?: Timestamp;
  /** Set when an agent created or changed the object. */
  generated_by?: PrincipalRef;
}

/** The unified envelope every NeoSuite object is stored and exchanged in. */
export interface ObjectEnvelope<
  TType extends string = string,
  TProperties extends Record<string, unknown> = Record<string, unknown>,
> {
  id: Ulid;
  /** Registered type name, e.g. `core.Person`, `neotasks.Task`. */
  type: TType;
  created_at: Timestamp;
  updated_at: Timestamp;
  creator: PrincipalRef;
  owner: PrincipalRef;
  permissions: ObjectPermissions;
  properties: TProperties;
  relationships: Relationship[];
  references: ObjectReference[];
  history: HistoryEntry[];
  parent: ObjectRef | null;
  provenance: Provenance;
  sensitivity: Sensitivity;
  /** Alternative stable identifiers (slugs, external keys). */
  aliases: string[];
}
