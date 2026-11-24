import {
  createEffect,
  createSignal,
  JSX,
  Match,
  onCleanup,
  Show,
  Switch,
} from "solid-js";

import { Server } from "stoat.js";
import { styled } from "styled-system/jsx";

import { ChannelContextMenu, ServerContextMenu } from "@revolt/app";
import { MessageCache } from "@revolt/app/interface/channels/text/MessageCache";
import { Titlebar } from "@revolt/app/interface/desktop/Titlebar";
import { useClient, useClientLifecycle } from "@revolt/client";
import { State } from "@revolt/client/Controller";
import { NotificationsWorker } from "@revolt/client/NotificationsWorker";
import { useModals } from "@revolt/modal";
import { Navigate, useBeforeLeave, useLocation } from "@revolt/routing";
import { useState } from "@revolt/state";
import { LAYOUT_SECTIONS } from "@revolt/state/stores/Layout";
import { LoadingScreen } from "@revolt/ui";

import { useDevice } from "@revolt/common";

import { SlideDrawer } from "../components/ui/components/navigation/SlideDrawer";
import { Sidebar } from "./interface/Sidebar";
import { BottomTabs } from "./interface/shell/BottomTabs";
import { CommandPalette } from "./interface/shell/CommandPalette";
import { GlobalKeybinds } from "./interface/shell/GlobalKeybinds";
import { TopBar } from "./interface/shell/TopBar";

/**
 * Application layout
 */
const Interface = (props: { children: JSX.Element }) => {
  const state = useState();
  const client = useClient();
  const { openModal } = useModals();
  const { isLoggedIn, isSwapping, lifecycle } = useClientLifecycle();
  const { pathname } = useLocation();
  const device = useDevice();

  useBeforeLeave((e) => {
    if (!e.defaultPrevented) {
      if (e.to === "/settings") {
        e.preventDefault();
        openModal({ type: "settings", config: "user" });
      } else if (typeof e.to === "string") {
        state.layout.setLastActivePath(e.to);
      }
    }
  });

  createEffect(() => {
    if (!isLoggedIn() && !isSwapping()) {
      state.auth.setNextPath(pathname);
    }
  });

  function isDisconnected() {
    return [
      State.Connecting,
      State.Disconnected,
      State.Reconnecting,
      State.Offline,
    ].includes(lifecycle.state());
  }

  //Drawer slider for mobile
  let layoutRef: HTMLDivElement | undefined, sDrawer: SlideDrawer | undefined;
  const [contRef, setContRef] = createSignal<HTMLDivElement>();
  function rstLayout() {
    state.layout.setSectionState(LAYOUT_SECTIONS.PRIMARY_SIDEBAR, false, false);
    state.layout.setSectionState(LAYOUT_SECTIONS.MEMBER_SIDEBAR, false, true);
  }
  createEffect(() => {
    //Create drawer
    const cont = contRef();
    if (cont && layoutRef && !sDrawer)
      sDrawer = new SlideDrawer(cont, layoutRef);
    //Update on layout change
    if (sDrawer) {
      const en = sDrawer.enabled;
      setTimeout(() => {
        state.setAppDrawer(en ? sDrawer : undefined);
        if (en) rstLayout();
      }, 1);
    }
  });
  onCleanup(() => {
    sDrawer?.delete();
    state.setAppDrawer((sDrawer = undefined));
  });

  return (
    <MessageCache client={client()}>
      <AppRoot class="app_root">
        <Titlebar />
        <Switch fallback={<LoadingScreen />}>
          <Match when={!isLoggedIn()}>
            <Navigate href="/login" />
          </Match>
          <Match when={lifecycle.loadedOnce()}>
            <Show when={device.layout() !== "phone"}>
              <TopBar />
            </Show>
            <GlobalKeybinds />
            <CommandPalette />
            <Layout
              ref={layoutRef}
              disconnected={isDisconnected()}
              style={{ "flex-grow": 1, "min-height": 0 }}
              onDragOver={(e) => {
                if (e.dataTransfer) e.dataTransfer.dropEffect = "none";
              }}
              onDrop={(e) => e.preventDefault()}
            >
              <Sidebar
                menuGenerator={(target) => ({
                  contextMenu: () => {
                    return (
                      <>
                        {target instanceof Server ? (
                          <ServerContextMenu server={target} />
                        ) : (
                          <ChannelContextMenu channel={target} />
                        )}
                      </>
                    );
                  },
                })}
              />
              <Content
                ref={setContRef}
                class="app_body"
                sidebar={state.layout.getSectionState(
                  LAYOUT_SECTIONS.PRIMARY_SIDEBAR,
                  true,
                )}
              >
                {props.children}
              </Content>
            </Layout>
            <Show when={device.layout() === "phone"}>
              <BottomTabs />
            </Show>
          </Match>
        </Switch>

        <NotificationsWorker />
      </AppRoot>
    </MessageCache>
  );
};

const AppRoot = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    overflow: "hidden",
    background: "var(--caps-bg-canvas)",
  },
});

/**
 * Parent container (sidebar + content panel). On phones this is the
 * swipe drawer root.
 */
const Layout = styled("div", {
  base: {
    display: "flex",
    height: "100%",
    minWidth: 0,
    minHeight: 0,
    paddingInlineEnd: "var(--caps-panel-gap)",
    paddingBottom: "var(--caps-panel-gap)",

    _phone: {
      padding: 0,
    },
  },
  variants: {
    disconnected: {
      true: {
        color: "var(--caps-text)",
        background: "var(--caps-bg-canvas)",
      },
      false: {
        color: "var(--caps-text-3)",
        background: "var(--caps-bg-canvas)",
      },
    },
  },
});

/**
 * Main content panel: floats on the canvas with a hairline and soft corners
 */
const Content = styled("div", {
  base: {
    display: "flex",
    width: "100%",
    minWidth: 0,
    overflow: "hidden",
    background: "var(--caps-bg-panel)",
    borderRadius: "var(--caps-radius-lg)",
    boxShadow: "0 0 0 1px var(--caps-line-soft)",

    _phone: {
      borderRadius: 0,
      boxShadow: "none",
    },
  },
  variants: {
    sidebar: {
      false: {
        marginInlineStart: "var(--caps-panel-gap)",
        _phone: { marginInlineStart: 0 },
      },
      true: {},
    },
  },
});

export default Interface;
