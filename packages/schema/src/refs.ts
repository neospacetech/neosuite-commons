/*
 * Hand-written for now. These types will be generated from the contracts/ directories of the
 * NeoSuite repositories; keep names and shapes aligned with those contracts.
 */

/** Crockford base32 ULID, 26 characters. */
export type Ulid = string;

/** RFC 3339 timestamp. */
export type Timestamp = string;

/** Stable object reference: `neo://<tenant>/o/<ulid>`. */
export type ObjectRef = `neo://${string}/o/${string}`;

const ULID_RE = /^[0-9A-HJKMNP-TV-Z]{26}$/;
const TENANT_RE = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const REF_RE = /^neo:\/\/([^/]+)\/o\/([^/?#]+)$/;

export function isUlid(value: string): value is Ulid {
  return ULID_RE.test(value);
}

export function formatObjectRef(tenant: string, id: Ulid): ObjectRef {
  if (!TENANT_RE.test(tenant)) throw new Error(`Invalid tenant "${tenant}"`);
  if (!isUlid(id)) throw new Error(`Invalid ULID "${id}"`);
  return `neo://${tenant}/o/${id}`;
}

export function parseObjectRef(ref: string): { tenant: string; id: Ulid } | null {
  const match = REF_RE.exec(ref);
  if (!match) return null;
  const [, tenant = "", id = ""] = match;
  if (!TENANT_RE.test(tenant) || !isUlid(id)) return null;
  return { tenant, id };
}

export function isObjectRef(value: string): value is ObjectRef {
  return parseObjectRef(value) !== null;
}
