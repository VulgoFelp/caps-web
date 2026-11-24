import {
  Match,
  Show,
  Switch,
  createMemo,
  createSignal,
  splitProps,
} from "solid-js";

import { Plural, Trans, useLingui } from "@lingui/solid/macro";
import { VirtualContainer } from "@minht11/solid-virtual-container";
import { Channel } from "stoat.js";
import { css } from "styled-system/css";
import { styled } from "styled-system/jsx";

import { ChannelContextMenu, UserContextMenu } from "@revolt/app";
import { useClient } from "@revolt/client";
import { useDevice } from "@revolt/common";
import Instance from "@revolt/instance/Instance";
import { TextWithEmoji } from "@revolt/markdown";
import { useModals } from "@revolt/modal";
import { useLocation, useNavigate } from "@revolt/routing";
import {
  Avatar,
  Deferred,
  MenuButton,
  OverflowingText,
  Tooltip,
  UserStatus,
  typography,
} from "@revolt/ui";
import { Symbol } from "@revolt/ui/components/utils/Symbol";

import IconPlus from "lucide-solid/icons/plus";
import IconSearch from "lucide-solid/icons/search";

import { SidebarBase, SidebarHeader, sidebarIconButton } from "./common";

interface Props {
  /**
   * Ordered list of conversations
   */
  conversations: () => Channel[];

  /**
   * Current channel ID
   */
  channelId?: string;

  /**
   * Open the saved notes channel
   */
  openSavedNotes: (
    navigate?: ReturnType<typeof useNavigate>,
  ) => string | undefined;
}

/**
 * Display home navigation and conversations
 */
export const HomeSidebar = (props: Props) => {
  const { t } = useLingui();
  const client = useClient();
  const navigate = useNavigate();
  const location = useLocation();
  const { openModal } = useModals();
  const { isMobile } = useDevice();

  const savedNotesChannelId = createMemo(() => props.openSavedNotes());

  let scrollTargetElement!: HTMLDivElement;

  const pendingRequests = createMemo(() => {
    return client().users.filter((user) => user.relationship === "Incoming")
      .length;
  });

  const [filter, setFilter] = createSignal("");
  const filtered = createMemo(() => {
    const q = filter().trim().toLowerCase();
    if (!q) return props.conversations();
    return props
      .conversations()
      .filter((c) => (c.displayName ?? "").toLowerCase().includes(q));
  });

  return (
    <SidebarBase class="channel_bar home">
      <SidebarHeader>
        <span class={css({ flex: 1 })}>
          <Trans>Conversations</Trans>
        </span>
        <button
          class={sidebarIconButton()}
          type="button"
          aria-label={t`Create a new group`}
          onClick={() => openModal({ type: "create_group", client: client() })}
          use:floating={{
            tooltip: { placement: "bottom", content: t`Create a new group` },
          }}
        >
          <IconPlus size={16} />
        </button>
      </SidebarHeader>

      <FilterField>
        <IconSearch size={14} />
        <input
          value={filter()}
          onInput={(e) => setFilter(e.currentTarget.value)}
          placeholder={t`Filter conversations`}
          aria-label={t`Filter conversations`}
        />
      </FilterField>

      <div ref={scrollTargetElement} use:invisibleScrollable>
        <List>
          <PhoneOnly>
            <MenuButton
              href="/friends"
              size="normal"
              icon={<Symbol>group</Symbol>}
              attention={
                Instance.relPath(location.pathname) === "/friends"
                  ? "selected"
                  : "normal"
              }
            >
              <ButtonTitle>
                <Trans>Friends</Trans>
                <div style={{ flex: "1 1 auto" }} />
                <Show when={pendingRequests()}>
                  <PendingBadge>{pendingRequests()}</PendingBadge>
                </Show>
              </ButtonTitle>
            </MenuButton>
          </PhoneOnly>

          <Switch
            fallback={
              <MenuButton
                size="normal"
                attention={"normal"}
                icon={<Symbol>note_stack</Symbol>}
                onClick={() => props.openSavedNotes(navigate)}
              >
                <ButtonTitle>
                  <Trans>Saved Notes</Trans>
                </ButtonTitle>
              </MenuButton>
            }
          >
            <Match when={savedNotesChannelId()}>
              <MenuButton
                href={`/channel/${savedNotesChannelId()}`}
                size="normal"
                icon={<Symbol>note_stack</Symbol>}
                attention={
                  props.channelId && savedNotesChannelId() === props.channelId
                    ? "selected"
                    : "normal"
                }
              >
                <ButtonTitle>
                  <Trans>Saved Notes</Trans>
                </ButtonTitle>
              </MenuButton>
            </Match>
          </Switch>

          <Category>
            <Trans>Direct messages</Trans>
            <span class={css({ color: "var(--caps-text-disabled)" })}>
              {props.conversations().length}
            </span>
          </Category>

          <Show
            when={filtered().length}
            fallback={
              <EmptyList>
                <Show
                  when={filter()}
                  fallback={<Trans>No conversations yet.</Trans>}
                >
                  <Trans>No conversations match.</Trans>
                </Show>
              </EmptyList>
            }
          >
            <Deferred>
              <VirtualContainer
                items={filtered()}
                scrollTarget={scrollTargetElement}
                itemSize={{ height: 48 }}
              >
                {(item) => (
                  <div
                    style={{
                      ...item.style,
                      width: "100%",
                      "padding-block": "2px",
                    }}
                  >
                    <Entry
                      // @ts-expect-error missing type on Entry
                      role="listitem"
                      tabIndex={item.tabIndex}
                      channel={item.item}
                      active={item.item.id === props.channelId}
                      isMobile={isMobile}
                    />
                  </div>
                )}
              </VirtualContainer>
            </Deferred>
          </Show>
        </List>
      </div>
    </SidebarBase>
  );
};

const FilterField = styled("label", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "var(--caps-space-4)",
    flexShrink: 0,
    height: "32px",
    margin: "0 var(--caps-space-4) var(--caps-space-4)",
    paddingInline: "var(--caps-space-5)",
    borderRadius: "var(--caps-radius-md)",
    background: "var(--caps-bg-surface)",
    boxShadow: "inset 0 0 0 1px var(--caps-line-soft)",
    color: "var(--caps-text-3)",
    transition: "box-shadow var(--caps-dur-fast) var(--caps-ease)",

    "&:focus-within": {
      boxShadow:
        "inset 0 0 0 1px var(--caps-accent-line), 0 0 0 3px var(--caps-accent-soft)",
    },

    "& input": {
      all: "unset",
      flex: 1,
      minWidth: 0,
      fontSize: "var(--caps-text-md)",
      color: "var(--caps-text)",
    },
    "& input::placeholder": { color: "var(--caps-text-3)" },
  },
});

const PhoneOnly = styled("div", {
  base: {
    display: "none",
    _phone: { display: "block" },
  },
});

const EmptyList = styled("div", {
  base: {
    padding: "var(--caps-space-6)",
    fontSize: "var(--caps-text-md)",
    color: "var(--caps-text-3)",
    textAlign: "center",
  },
});

export const Header = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    fontWeight: 600,
    fontSize: "var(--caps-text-lg)",
    letterSpacing: "-0.01em",
    userSelect: "none",
    overflow: "hidden",
    textOverflow: "ellipsis",
    height: "var(--caps-header-height)",
    paddingInline: "var(--caps-space-6)",
    marginBottom: "var(--caps-space-4)",
    borderBottom: "1px solid var(--caps-line-soft)",
    color: "var(--caps-text)",
  },
});

/**
 * Button title
 */
const ButtonTitle = styled("div", {
  base: {
    gap: "var(--gap-md)",
    height: "100%",
    display: "flex",
    alignItems: "center",
  },
});

const PendingBadge = styled("div", {
  base: {
    ...typography.raw({ class: "label", size: "small" }),
    minWidth: "18px",
    height: "18px",
    padding: "0 5px",
    display: "grid",
    placeItems: "center",
    fontWeight: 700,
    color: "var(--caps-on-accent)",
    background: "var(--caps-accent)",
    borderRadius: "var(--caps-radius-full)",
  },
});

const Category = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    margin: "0 var(--caps-space-4)",
    padding: "var(--caps-space-7) var(--caps-space-3) var(--caps-space-3)",

    color: "var(--caps-text-3)",
    fill: "var(--caps-text-3)",
    fontSize: "var(--caps-text-xs)",
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",

    "& a": {
      display: "grid",
      placeItems: "center",
      width: "20px",
      height: "20px",
      borderRadius: "var(--caps-radius-xs)",
      transition: "background-color var(--caps-dur-fast) var(--caps-ease)",
    },

    "& a:hover": {
      color: "var(--caps-text)",
      fill: "var(--caps-text)",
      background: "var(--caps-hover)",
    },
  },
});

/**
 * Styles required to correctly display name and status
 */
const NameStatusStack = styled("div", {
  base: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
});

/**
 * Single conversation entry
 */
function Entry(
  props: { channel: Channel; active: boolean; isMobile: boolean } /*& Omit<
    ComponentProps<typeof Link>,
    "href"
  >*/,
) {
  const [local, remote] = splitProps(props, ["channel", "active", "isMobile"]);

  const { t } = useLingui();
  const { openModal } = useModals();

  /**
   * Determine user status if present
   */
  const status = () =>
    local.channel.recipient?.statusMessage((s) =>
      s === "Online"
        ? t`Online`
        : s === "Busy"
          ? t`Busy`
          : s === "Focus"
            ? t`Focus`
            : s === "Idle"
              ? t`Idle`
              : t`Offline`,
    );

  return (
    <MenuButton
      {...remote}
      href={`/channel/${local.channel.id}`}
      size="normal"
      alert={
        !local.active &&
        local.channel.unread &&
        (local.channel.mentions?.size || true)
      }
      attention={
        local.active
          ? "selected"
          : local.channel.muted
            ? "muted"
            : local.channel.unread
              ? "active"
              : "normal"
      }
      icon={
        <Switch>
          <Match when={local.channel.type === "Group"}>
            <Avatar
              size={32}
              shape="rounded-square"
              fallback={local.channel.name}
              src={local.channel.iconURL}
              primaryContrast
            />
          </Match>
          <Match when={local.channel.type === "DirectMessage"}>
            <Avatar
              size={32}
              src={local.channel.iconURL}
              holepunch="bottom-right"
              overlay={
                <UserStatus.Graphic
                  status={local.channel?.recipient?.presence}
                />
              }
            />
          </Match>
        </Switch>
      }
      use:floating={{
        contextMenu: () =>
          local.channel.type === "DirectMessage" ? (
            <UserContextMenu
              user={local.channel.recipient!}
              channel={local.channel}
            />
          ) : (
            <ChannelContextMenu channel={local.channel} />
          ),
      }}
    >
      <NameStatusStack>
        <Switch>
          <Match when={local.channel.type === "Group"}>
            <OverflowingText>
              <TextWithEmoji content={local.channel.name!} />
            </OverflowingText>
            <span class={typography({ class: "_status" })}>
              {/* <Plural
                  value={local.channel.recipientIds.size}
                  one="# Member"
                  other="# Members"
                /> */}
              <Plural
                value={local.channel.recipientIds.size}
                one="# member"
                other="# members"
              />
            </span>
          </Match>
          <Match when={local.channel.type === "DirectMessage"}>
            <OverflowingText>
              {local.channel?.recipient?.displayName}
            </OverflowingText>
            <Show when={status()}>
              <Tooltip
                content={() => <TextWithEmoji content={status()!} />}
                placement="top-start"
                aria={status()!}
              >
                <OverflowingText class={typography({ class: "_status" })}>
                  <TextWithEmoji content={status()!} />
                </OverflowingText>
              </Tooltip>
            </Show>
          </Match>
        </Switch>
      </NameStatusStack>
    </MenuButton>
  );
}

/**
 * Inner scrollable list
 * We fix the width in order to prevent scrollbar from moving stuff around
 */
const List = styled("div", {
  base: {
    width: "var(--caps-sidebar-width)",
    display: "flex",
    flexDirection: "column",
    gap: "1px",
    paddingBottom: "var(--caps-space-4)",
  },
});
