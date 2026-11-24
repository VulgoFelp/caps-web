import {
  Match,
  Show,
  Switch,
  createEffect,
  createSignal,
  on,
  onCleanup,
} from "solid-js";

import { Trans, useLingui } from "@lingui/solid/macro";
import { css, cva } from "styled-system/css";
import { styled } from "styled-system/jsx";
import { decodeTime, ulid } from "ulid";

import { DraftMessages, Messages } from "@revolt/app";
import { useClient } from "@revolt/client";
import { Keybind, KeybindAction, createKeybind } from "@revolt/keybinds";
import { useNavigate, useSmartParams } from "@revolt/routing";
import { useState } from "@revolt/state";

import { LAYOUT_SECTIONS, LAYOUT_SIZES } from "@revolt/state/stores/Layout";
import {
  BelowFloatingHeader,
  Header,
  NewMessages,
  ResizeHandle,
  main,
} from "@revolt/ui";
import { VoiceChannelCallCardMount } from "@revolt/ui/components/features/voice/callCard/VoiceCallCard";
import IconX from "lucide-solid/icons/x";
import { panelRequest, setPanelRequest } from "../../shell/shellState";

import { ChannelHeader } from "../ChannelHeader";
import { ChannelPageProps } from "../ChannelPage";

import { Channel } from "stoat.js";
import { MessageComposition } from "./Composition";
import { isLargeServer } from "./largeServer";
import { MemberSidebar } from "./MemberSidebar";
import { TextSearchSidebar } from "./TextSearchSidebar";

/**
 * State of the channel sidebar
 */
export type SidebarState =
  | {
      state: "search";
      query: string;
    }
  | {
      state: "pins";
    }
  | {
      state: "default";
    };

export function canIHasSidebar(ch: Channel) {
  return !["SavedMessages", "DirectMessage"].includes(ch.type);
}

/**
 * Channel component
 */
export function TextChannel(props: ChannelPageProps) {
  const state = useState();
  const { t } = useLingui();
  const panelWidth = () => state.layout.getSize(LAYOUT_SIZES.SIDE_PANEL);
  const client = useClient();

  // Last unread message id
  const [lastId, setLastId] = createSignal<string>();

  // Read highlighted message id from parameters
  const params = useSmartParams();
  const navigate = useNavigate();

  /**
   * Message id to be highlighted
   * @returns Message Id
   */
  const highlightMessageId = () => params().messageId;

  const canConnect = () =>
    props.channel.isVoice && props.channel.havePermission("Connect");

  // Get a reference to the message box's load latest function
  let jumpToBottomRef: ((nearby?: string) => void) | undefined;

  const [atEnd, setEnd] = createSignal(true);

  // Store last unread message id
  createEffect(
    on(
      () => props.channel.id,
      (id) =>
        setLastId(
          props.channel.unread
            ? (client().channelUnreads.get(id)?.lastMessageId as string)
            : undefined,
        ),
    ),
  );

  // Mark channel as read whenever it is marked as unread
  createEffect(
    on(
      // must be at the end of the conversation
      () => props.channel.unread && atEnd(),
      (unread) => {
        if (unread) {
          if (document.hasFocus()) {
            // acknowledge the message
            props.channel.ack();
          } else {
            // otherwise mark this location as the last read location
            if (!lastId()) {
              // (taking away one second from the seed)
              setLastId(ulid(decodeTime(props.channel.lastMessageId!) - 1));
            }
          }
        }
      },
    ),
  );

  // Mark as read on re-focus
  function onFocus() {
    if (props.channel.unread && atEnd()) {
      props.channel.ack();
    }
  }

  function onVisibilityChange() {
    if (document.visibilityState === "visible") onFocus();
  }

  // Chromium + webkit
  window.addEventListener("focus", onFocus);
  // Gecko
  document.addEventListener("focus", onFocus);
  // Mobile (eg. unlock screen)
  document.addEventListener("visibilitychange", onVisibilityChange);
  onCleanup(() => {
    // Mobile
    document.removeEventListener("visibilitychange", onVisibilityChange);
    // Gecko
    document.removeEventListener("focus", onFocus);
    // Chromium + webkit
    window.removeEventListener("focus", onFocus);
  });

  // Register ack/jump latest
  createKeybind(KeybindAction.CHAT_JUMP_END, () => {
    // Mark channel as read if not already
    if (props.channel.unread) {
      props.channel.ack();
    }

    // Clear the last unread id
    if (lastId()) {
      setLastId(undefined);
    }

    // Scroll to the bottom
    jumpToBottomRef?.();
  });

  // Sidebar scroll target
  let sidebarScrollTargetElement!: HTMLDivElement;

  // Sidebar state
  const [sidebarState, setSidebarState] = createSignal<SidebarState>({
    state: "default",
  });

  // todo: in the future maybe persist per ID?
  createEffect(
    on(
      () => props.channel.id,
      () => setSidebarState({ state: "default" }),
    ),
  );

  // side panel requests from the command palette
  createEffect(
    on(panelRequest, (request) => {
      if (!request || request.channelId !== props.channel.id) return;
      setSidebarState(
        request.state === "search"
          ? { state: "search", query: request.query ?? "" }
          : { state: "pins" },
      );
      setPanelRequest(undefined);
    }),
  );

  // If this is a server text channel, sync the members
  // todo: useQuery
  createEffect(
    on(
      () => props.channel.serverId,
      (serverId, prevServerId) =>
        // This effect tracks channel, not serverId, therefore we must ensure the old serverId
        // is not the same as the current serverId
        prevServerId !== serverId &&
        props.channel.type === "TextChannel" &&
        props.channel.server?.syncMembers(isLargeServer(props.channel.server)),
    ),
  );

  return (
    <>
      <Header placement="primary">
        <ChannelHeader
          channel={props.channel}
          sidebarState={sidebarState}
          setSidebarState={setSidebarState}
        />
      </Header>
      <Content>
        <main class={main()}>
          <Show
            when={canConnect()}
            fallback={
              <BelowFloatingHeader>
                <div>
                  <NewMessages
                    lastId={lastId}
                    jumpBack={() => navigate(lastId()!)}
                    dismiss={() => setLastId()}
                  />
                </div>
              </BelowFloatingHeader>
            }
          >
            <VoiceChannelCallCardMount channel={props.channel} />
          </Show>

          <Messages
            channel={props.channel}
            lastReadId={lastId}
            pendingMessages={(pendingProps) => (
              <DraftMessages
                channel={props.channel}
                tail={pendingProps.tail}
                sentIds={pendingProps.ids}
              />
            )}
            highlightedMessageId={highlightMessageId}
            clearHighlightedMessage={() => navigate(".")}
            jumpToBottomRef={(ref) => (jumpToBottomRef = ref)}
            atEnd={[atEnd, setEnd]}
          />

          <MessageComposition
            channel={props.channel}
            onMessageSend={() => jumpToBottomRef?.()}
          />
        </main>
        <Show
          when={
            (state.layout.getSectionState(
              LAYOUT_SECTIONS.MEMBER_SIDEBAR,
              true,
            ) &&
              canIHasSidebar(props.channel)) ||
            sidebarState().state !== "default"
          }
        >
          <aside
            class={panelShell()}
            style={{ width: `${panelWidth()}px` }}
            aria-label={
              sidebarState().state === "search"
                ? t`Search results`
                : sidebarState().state === "pins"
                  ? t`Pinned messages`
                  : t`Members`
            }
          >
            <ResizeHandle
              edge="left"
              width={panelWidth}
              min={LAYOUT_SIZES.SIDE_PANEL.min}
              max={LAYOUT_SIZES.SIDE_PANEL.max}
              label={t`Resize panel`}
              onResize={(w) => state.layout.setSize(LAYOUT_SIZES.SIDE_PANEL, w)}
              onReset={() =>
                state.layout.setSize(
                  LAYOUT_SIZES.SIDE_PANEL,
                  LAYOUT_SIZES.SIDE_PANEL.default,
                )
              }
            />
            <PanelHead>
              <span>
                <Switch fallback={<Trans>Members</Trans>}>
                  <Match when={sidebarState().state === "search"}>
                    <Trans>Search results</Trans>
                  </Match>
                  <Match when={sidebarState().state === "pins"}>
                    <Trans>Pinned messages</Trans>
                  </Match>
                </Switch>
              </span>
              <button
                type="button"
                class={panelClose}
                aria-label={t`Close panel`}
                onClick={() => {
                  if (sidebarState().state !== "default") {
                    setSidebarState({ state: "default" });
                  } else {
                    state.layout.setSectionState(
                      LAYOUT_SECTIONS.MEMBER_SIDEBAR,
                      false,
                      true,
                    );
                  }
                }}
                use:floating={{
                  tooltip: { placement: "bottom", content: t`Close panel` },
                }}
              >
                <IconX size={16} />
              </button>
            </PanelHead>
            <div
              ref={sidebarScrollTargetElement}
              use:scrollable={{
                direction: "y",
                showOnHover: true,
                class: sidebar(),
              }}
            >
              <Switch
                fallback={
                  <MemberSidebar
                    channel={props.channel}
                    scrollTargetElement={sidebarScrollTargetElement}
                    isLargeServer={isLargeServer(props.channel.server)}
                  />
                }
              >
                <Match when={sidebarState().state === "search"}>
                  <WideSidebarContainer>
                    <TextSearchSidebar
                      channel={props.channel}
                      query={{
                        query: (sidebarState() as { query: string }).query,
                      }}
                    />
                  </WideSidebarContainer>
                </Match>
                <Match when={sidebarState().state === "pins"}>
                  <WideSidebarContainer>
                    <TextSearchSidebar
                      channel={props.channel}
                      query={{ pinned: true, sort: "Latest" }}
                    />
                  </WideSidebarContainer>
                </Match>
              </Switch>

              <Show when={sidebarState().state !== "default"}>
                <Keybind
                  keybind={KeybindAction.CLOSE_SIDEBAR}
                  onPressed={() => setSidebarState({ state: "default" })}
                />
              </Show>
            </div>
          </aside>
        </Show>
      </Content>
    </>
  );
}

/**
 * Main content row layout
 */
const Content = styled("div", {
  base: {
    display: "flex",
    flexDirection: "row",
    flexGrow: 1,
    minWidth: 0,
    minHeight: 0,
  },
});

/**
 * Base styles
 */
const panelShell = cva({
  base: {
    position: "relative",
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
    background: "var(--caps-bg-panel)",
    borderLeft: "1px solid var(--caps-line-soft)",
    animation: "authHintIn 160ms var(--caps-ease-out)",

    _phone: {
      position: "absolute",
      inset: 0,
      width: "100% !important",
      zIndex: "var(--caps-z-panel)",
      borderLeft: "none",
    },
  },
});

const sidebar = cva({
  base: {
    flex: 1,
    minHeight: 0,
  },
});

const PanelHead = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "var(--caps-space-3)",
    flexShrink: 0,
    height: "var(--caps-header-height)",
    paddingInline: "var(--caps-space-6) var(--caps-space-4)",
    borderBottom: "1px solid var(--caps-line-soft)",
    fontSize: "var(--caps-text-base)",
    fontWeight: 600,
    color: "var(--caps-text)",

    "& > span": { flex: 1, minWidth: 0 },
  },
});

const panelClose = css({
  all: "unset",
  display: "grid",
  placeItems: "center",
  width: "28px",
  height: "28px",
  borderRadius: "var(--caps-radius-sm)",
  color: "var(--caps-text-3)",
  cursor: "pointer",
  "&:hover": { background: "var(--caps-hover)", color: "var(--caps-text)" },
  "&:focus-visible": { boxShadow: "var(--caps-focus-ring)" },
});

/**
 * Container styles
 */
const WideSidebarContainer = styled("div", {
  base: {
    paddingInline: "var(--caps-space-4)",
    paddingTop: "var(--caps-space-4)",
  },
});

/**
 * Sidebar title
 */
const SidebarTitle = styled("div", {
  base: {
    padding: "var(--caps-space-6) var(--caps-space-4) var(--caps-space-4)",
    color: "var(--caps-text)",
    fontWeight: 600,
  },
});
