import { Component, JSX, Match, Show, Switch, createMemo } from "solid-js";
import { styled } from "styled-system/jsx";

import { Channel, Server as ServerI } from "stoat.js";

import {
  CategoryContextMenu,
  ChannelContextMenu,
  ServerSidebarContextMenu,
} from "@revolt/app";
import { useClient } from "@revolt/client";
import { useModals } from "@revolt/modal";
import { useLocation, useParams, useSmartParams } from "@revolt/routing";
import { useState } from "@revolt/state";
import { LAYOUT_SECTIONS, LAYOUT_SIZES } from "@revolt/state/stores/Layout";
import { ResizeHandle } from "@revolt/ui";

import { HomeSidebar, ServerSidebar } from "./navigation";
import { CallDock } from "./shell/CallDock";

const MainBar = styled("div", {
  base: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    minHeight: 0,
    width: "var(--caps-sidebar-width)",

    _phone: {
      "--caps-sidebar-width": "100vw !important",
      position: "absolute",
      width: "100vw",
      height: "100%",
    },
  },
});

/**
 * Unified, contextual sidebar
 *
 * Shows the open community's channels, or your conversations everywhere
 * else. Resizable by dragging its edge and collapsible (Ctrl+B / top bar).
 */
export const Sidebar = (props: {
  /**
   * Menu generator TODO FIXME: remove
   */
  menuGenerator: (t: ServerI | Channel) => JSX.Directives["floating"];
}) => {
  const state = useState();
  const params = useParams<{ server: string }>();
  const location = useLocation();

  const width = () => state.layout.getSize(LAYOUT_SIZES.SIDEBAR);

  return (
    <Show
      when={
        state.layout.getSectionState(LAYOUT_SECTIONS.PRIMARY_SIDEBAR, true) &&
        !location.pathname.startsWith("/discover") &&
        !location.pathname.startsWith("/staff")
      }
    >
      <MainBar
        class="main_bar"
        style={{ "--caps-sidebar-width": `${width()}px` }}
      >
        <Switch fallback={<Home />}>
          <Match when={params.server}>
            <Server />
          </Match>
        </Switch>
        <CallDock />
        <ResizeHandle
          edge="right"
          width={width}
          min={LAYOUT_SIZES.SIDEBAR.min}
          max={LAYOUT_SIZES.SIDEBAR.max}
          label="Redimensionar barra lateral"
          onResize={(w) => state.layout.setSize(LAYOUT_SIZES.SIDEBAR, w)}
          onReset={() =>
            state.layout.setSize(
              LAYOUT_SIZES.SIDEBAR,
              LAYOUT_SIZES.SIDEBAR.default,
            )
          }
        />
      </MainBar>
    </Show>
  );
};

/**
 * Render sidebar for home
 */
const Home: Component = () => {
  const params = useSmartParams();
  const client = useClient();
  const state = useState();
  const conversations = createMemo(() =>
    state.ordering.orderedConversations(client()),
  );

  return (
    <HomeSidebar
      conversations={conversations}
      channelId={params().channelId}
      openSavedNotes={(navigate) => {
        // Check whether the saved messages channel exists already
        const channelId = [...client()!.channels.values()].find(
          (channel) => channel.type === "SavedMessages",
        )?.id;

        if (navigate) {
          if (channelId) {
            // Navigate if exists
            navigate(`/channel/${channelId}`);
          } else {
            // If not, try to create one but only if navigating
            client()!
              .user!.openDM()
              .then((channel) => navigate(`/channel/${channel.id}`));
          }
        }

        // Otherwise return channel ID if available
        return channelId;
      }}
    />
  );
};

/**
 * Render sidebar for a server
 */
const Server: Component = () => {
  const { openModal } = useModals();
  const params = useSmartParams();
  const client = useClient();

  /**
   * Resolve the server
   * @returns Server
   */
  const server = () => client()!.servers.get(params().serverId!)!;

  /**
   * Open the server information modal
   */
  function openServerInfo() {
    openModal({
      type: "server_info",
      server: server(),
    });
  }

  /**
   * Open the server settings modal
   */
  function openServerSettings() {
    openModal({
      type: "settings",
      config: "server",
      context: server(),
    });
  }

  return (
    <Show when={server()}>
      <ServerSidebar
        server={server()}
        channelId={params().channelId}
        openServerInfo={openServerInfo}
        openServerSettings={openServerSettings}
        menuGenerator={(target) => ({
          contextMenu: () =>
            target instanceof Channel ? (
              <ChannelContextMenu channel={target} />
            ) : target instanceof ServerI ? (
              <ServerSidebarContextMenu server={target} />
            ) : (
              <CategoryContextMenu server={server()} category={target} />
            ),
        })}
      />
    </Show>
  );
};
