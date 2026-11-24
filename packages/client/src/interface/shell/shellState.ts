import { createSignal } from "solid-js";

/**
 * Shell-wide UI state that is not persisted
 */
const [paletteOpen, setPaletteOpen] = createSignal(false);
const [notificationsOpen, setNotificationsOpen] = createSignal(false);

export { notificationsOpen, paletteOpen, setNotificationsOpen, setPaletteOpen };

/**
 * Which top level section a path belongs to
 */
export type ShellSection = "home" | "conversations" | "communities" | "friends";

/**
 * Resolve the section for a pathname
 * @param pathname Current path
 */
export function sectionFor(pathname: string): ShellSection {
  if (pathname.startsWith("/server/") || pathname.startsWith("/discover"))
    return "communities";
  if (pathname.startsWith("/friends")) return "friends";
  if (pathname.startsWith("/channel/") || pathname.startsWith("/conversations"))
    return "conversations";
  return "home";
}

/**
 * Platform modifier label for shortcuts
 */
export const MOD_KEY = navigator.platform.startsWith("Mac") ? "⌘" : "Ctrl";

/**
 * Request for the side panel of a channel (from the command palette)
 */
export type PanelRequest = {
  channelId: string;
  state: "search" | "pins";
  query?: string;
};

const [panelRequest, setPanelRequest] = createSignal<PanelRequest>();

export { panelRequest, setPanelRequest };
