import type { Breakpoint } from "@neospacetech/neosuite-tokens";
import type { ReactNode } from "react";
import { useBreakpoint, type BreakpointInfo } from "./environment";
import { resolveSlot, type BreakpointSlots } from "./layout";

export type AdaptiveLayoutProps =
  | { render: (info: BreakpointInfo) => ReactNode; breakpoint?: Breakpoint }
  | (BreakpointSlots<ReactNode> & { breakpoint?: Breakpoint });

/**
 * Renders different structure per breakpoint, either through `render` or per-breakpoint slots
 * (`compact` is required; wider slots fall back to the nearest narrower one).
 * Keep state that must survive a resize above this component.
 */
export function AdaptiveLayout(props: AdaptiveLayoutProps) {
  const info = useBreakpoint();
  const resolved = props.breakpoint ? { ...info, breakpoint: props.breakpoint } : info;
  if ("render" in props) return <>{props.render(resolved)}</>;
  return <>{resolveSlot(resolved.breakpoint, props)}</>;
}
