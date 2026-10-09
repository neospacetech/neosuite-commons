/*
 * Hand-written for now. These types will be generated from the contracts/ directories of the
 * NeoSuite repositories; keep names and shapes aligned with those contracts.
 */

import type { Timestamp } from "./refs";

/** CloudEvents 1.0 envelope. Event types follow `<product>.<type>.<past-verb>`. */
export interface CloudEvent<TData = unknown> {
  specversion: "1.0";
  id: string;
  source: string;
  type: string;
  subject?: string;
  time?: Timestamp;
  datacontenttype?: string;
  dataschema?: string;
  data?: TData;
  /** Extension attribute: tenant the event belongs to. */
  tenant?: string;
  /** Extension attributes. */
  [extension: string]: unknown;
}

const EVENT_TYPE_RE = /^[a-z][a-z0-9]*\.[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$/;

export function isValidEventType(type: string): boolean {
  return EVENT_TYPE_RE.test(type);
}
