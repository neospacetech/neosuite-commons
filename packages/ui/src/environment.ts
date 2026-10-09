import { breakpointFor, type Breakpoint } from "@neospacetech/neosuite-tokens";
import { useMemo, useSyncExternalStore } from "react";
import { Platform, useWindowDimensions } from "react-native";
import type { PointerKind } from "./layout";

export interface BreakpointInfo {
  breakpoint: Breakpoint;
  width: number;
  height: number;
  fontScale: number;
  isTV: boolean;
}

/** Current breakpoint from the window size. Updates live on resize, rotation and split-screen. */
export function useBreakpoint(): BreakpointInfo {
  const { width, height, fontScale } = useWindowDimensions();
  const isTV = Platform.isTV;
  return useMemo(
    () => ({ breakpoint: breakpointFor(width, { isTV }), width, height, fontScale, isTV }),
    [width, height, fontScale, isTV],
  );
}

/** Breakpoint from an explicit override or the window. */
export function useResolvedBreakpoint(override?: Breakpoint): Breakpoint {
  const { breakpoint } = useBreakpoint();
  return override ?? breakpoint;
}

const COARSE_QUERY = "(pointer: coarse)";
const hasMatchMedia = () => Platform.OS === "web" && typeof window !== "undefined" && !!window.matchMedia;

function getPointer(): PointerKind {
  if (Platform.isTV) return "dpad";
  if (Platform.OS !== "web") return "touch";
  return hasMatchMedia() && window.matchMedia(COARSE_QUERY).matches ? "touch" : "fine";
}

function subscribePointer(listener: () => void): () => void {
  if (!hasMatchMedia()) return () => {};
  const query = window.matchMedia(COARSE_QUERY);
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}

/** Primary input mode: touch, fine pointer (mouse/trackpad) or D-pad. */
export function usePointerKind(): PointerKind {
  return useSyncExternalStore(subscribePointer, getPointer, getPointer);
}

/*
 * Focus-visible tracking. Native focus only comes from keyboards, D-pads and assistive tech,
 * so it is always visible there. On web, focus rings show after keyboard input and hide after
 * pointer input, matching :focus-visible.
 */
let keyboardModality = Platform.OS !== "web";
let modalityListening = false;

function listenForModality(): void {
  if (modalityListening || Platform.OS !== "web" || typeof document === "undefined") return;
  modalityListening = true;
  const onKey = (event: KeyboardEvent) => {
    if (!event.metaKey && !event.ctrlKey && !event.altKey) keyboardModality = true;
  };
  const onPointer = () => {
    keyboardModality = false;
  };
  document.addEventListener("keydown", onKey, true);
  document.addEventListener("pointerdown", onPointer, true);
  document.addEventListener("mousedown", onPointer, true);
}

listenForModality();

/** Whether a focus event arriving now should show a focus ring. */
export function isFocusVisible(): boolean {
  listenForModality();
  return keyboardModality;
}
