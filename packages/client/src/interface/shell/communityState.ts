import { Server } from "stoat.js";

import { useClient } from "@revolt/client";
import { useState } from "@revolt/state";

/**
 * Mention count for a community, excluding muted channels
 */
export function useCommunityBadges() {
  const state = useState();

  const mentions = (server: Server) =>
    server.channels.reduce(
      (count, channel) =>
        count +
        (state.notifications.isChannelMuted(channel)
          ? 0
          : (channel.mentions?.size ?? 0)),
      0,
    );

  const unread = (server: Server) =>
    server.unread && !state.notifications.isMuted(server);

  return {
    mentions,
    unread,
    muted: (s: Server) => state.notifications.isMuted(s),
  };
}

/**
 * Reordering and folding of communities (shared by the switcher)
 */
export function useCommunityOrdering() {
  const state = useState();
  const client = useClient();

  const entries = () => state.ordering.orderedEntries(client());

  /**
   * Fold an entry into another (creates a folder when needed)
   */
  function fold(target: string, incoming: string) {
    const list = entries();
    const entry = list.find((item) => item.id === target);
    if (!entry) return;

    const ids = list.map((item) => item.id).filter((id) => id !== incoming);

    if (entry.type === "folder") {
      state.ordering.addToFolder(entry.folder.id, incoming);
    } else {
      const folderId = state.ordering.createFolder("Nova pasta", [
        target,
        incoming,
      ]);
      const at = ids.indexOf(target);
      if (at !== -1) ids[at] = folderId;
    }

    state.ordering.setServerOrder(ids);
  }

  /**
   * Move an entry to a new position (optionally inside a folder)
   */
  function place(moved: string, before?: string, parent?: string) {
    const currentOrder = entries().map((entry) => entry.id);
    const ids = currentOrder.filter((id) => id !== moved);

    if (parent) {
      state.ordering.placeInFolder(parent, moved, before);
      state.ordering.setServerOrder(ids);
      return;
    }

    if (state.ordering.folderOf(moved)) {
      state.ordering.removeFromFolder(moved);
    }

    const at = before ? ids.indexOf(before) : -1;
    const index = at === -1 ? ids.length : at;
    const newOrder = [...ids.slice(0, index), moved, ...ids.slice(index)];

    if (
      newOrder.length === currentOrder.length &&
      newOrder.every((id, i) => id === currentOrder[i])
    ) {
      return;
    }

    state.ordering.setServerOrder(newOrder);
  }

  return { entries, fold, place };
}
