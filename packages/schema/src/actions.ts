/*
 * Hand-written for now. These types will be generated from the contracts/ directories of the
 * NeoSuite repositories; keep names and shapes aligned with those contracts.
 */

/** JSON Schema document (draft 2020-12). */
export type JsonSchema = Record<string, unknown>;

/**
 * How invoking an action affects the world. Clients and agents use it to decide whether to ask
 * for confirmation: `read` never, `write` per policy, `destructive` and `external` always.
 */
export type EffectClass = "read" | "write" | "destructive" | "external";

export interface ActionDescriptor {
  /** Stable identifier, e.g. `neotasks.task.complete`. */
  id: string;
  title: string;
  description: string;
  effect: EffectClass;
  input_schema: JsonSchema;
  output_schema?: JsonSchema;
  /** Object types the action applies to, when it targets an object. */
  applies_to?: string[];
  /** Permission relation required on the target object. */
  required_permission?: string;
  idempotent?: boolean;
}
