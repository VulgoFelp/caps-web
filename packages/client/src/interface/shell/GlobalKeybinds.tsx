import { onCleanup, onMount } from "solid-js";

import { useClient } from "@revolt/client";
import { KeybindAction, createKeybind } from "@revolt/keybinds";
import { useNavigate, useSmartParams } from "@revolt/routing";
import { useVoice } from "@revolt/rtc";
import { useState } from "@revolt/state";
import { LAYOUT_SECTIONS } from "@revolt/state/stores/Layout";

import { setPaletteOpen } from "./shellState";

/**
 * Shortcuts that work anywhere in the app, independent of which panels are
 * mounted (the old server rail used to own the community shortcuts)
 */
export function GlobalKeybinds() {
  const state = useState();
  const client = useClient();
  const navigate = useNavigate();
  const params = useSmartParams();
  const voice = useVoice();

  function navigateServer(byOffset: number) {
    const servers = state.ordering.orderedServers(client());
    if (!servers.length) return;
    const current = params().serverId;
    if (!current) {
      navigate(
        `/server/${(byOffset === 1 ? servers[0] : servers[servers.length - 1]).id}`,
      );
      return;
    }
    const index = servers.findIndex((s) => s.id === current) + byOffset;
    if (index === -1) return navigate("/app");
    const next = servers.at(index % servers.length);
    if (next) navigate(state.layout.getLastActiveServerPath(next.id));
  }

  createKeybind(KeybindAction.NAVIGATION_SERVER_UP, () => navigateServer(-1));
  createKeybind(KeybindAction.NAVIGATION_SERVER_DOWN, () => navigateServer(1));

  function onKeyDown(e: KeyboardEvent) {
    const mod = e.ctrlKey || e.metaKey;
    if (!mod || e.altKey) return;
    const key = e.key.toLowerCase();

    if (e.shiftKey && voice.channel() && (key === "m" || key === "d")) {
      e.preventDefault();
      if (key === "m") voice.toggleMute();
      else voice.toggleDeafen();
      return;
    }

    if (key === "k" && !e.shiftKey) {
      e.preventDefault();
      setPaletteOpen((v) => !v);
    } else if (key === "b" && !e.shiftKey) {
      // leave Ctrl+B to the rich text editor when it is focused
      const el = document.activeElement as HTMLElement | null;
      if (el?.closest?.(".cm-editor, [contenteditable=true], textarea, input"))
        return;
      e.preventDefault();
      state.layout.toggleSectionState(LAYOUT_SECTIONS.PRIMARY_SIDEBAR, true);
    }
  }

  onMount(() => document.addEventListener("keydown", onKeyDown, true));
  onCleanup(() => document.removeEventListener("keydown", onKeyDown, true));

  return null;
}
