import {
  Accessor,
  For,
  Match,
  Show,
  Switch,
  createMemo,
  createResource,
} from "solid-js";

import { Trans, useLingui } from "@lingui/solid/macro";
import { Channel, User } from "stoat.js";
import { css, cva } from "styled-system/css";
import { styled } from "styled-system/jsx";
import { decodeTime } from "ulid";

import { useClient } from "@revolt/client";
import { useModals } from "@revolt/modal";
import { useNavigate } from "@revolt/routing";
import { useState } from "@revolt/state";
import { Avatar, Popover, Time } from "@revolt/ui";

import IconAt from "lucide-solid/icons/at-sign";
import IconCheck from "lucide-solid/icons/check";
import IconCheckAll from "lucide-solid/icons/check-check";
import IconMessage from "lucide-solid/icons/message-square";
import IconSettings from "lucide-solid/icons/settings";
import IconUserPlus from "lucide-solid/icons/user-plus";
import IconX from "lucide-solid/icons/x";

import { plainText } from "./plainText";
import { notificationsOpen, setNotificationsOpen } from "./shellState";

/**
 * Unread mentions across every channel you can see (muted channels excluded)
 */
function useMentionEntries() {
  const client = useClient();
  const state = useState();

  return createMemo(() => {
    const out: { channel: Channel; messageId: string }[] = [];
    for (const channel of client().channels.values()) {
      if (state.notifications.isChannelMuted(channel)) continue;
      const mentions = channel.mentions;
      if (!mentions?.size) continue;
      for (const id of mentions) out.push({ channel, messageId: id });
    }
    // ULIDs sort by time
    return out.sort((a, b) => (a.messageId < b.messageId ? 1 : -1));
  });
}

/**
 * Conversations (DMs/groups) with unread messages and no unread mentions
 */
function useUnreadConversations() {
  const client = useClient();
  const state = useState();
  return createMemo(() =>
    state.ordering
      .orderedConversations(client())
      .filter(
        (c) => c.unread && !state.notifications.isMuted(c) && !c.mentions?.size,
      ),
  );
}

function useFriendRequests() {
  const client = useClient();
  return createMemo(() =>
    client().users.filter((u) => u.relationship === "Incoming"),
  );
}

/**
 * Count shown on the bell
 */
export function useNotificationCount() {
  const mentions = useMentionEntries();
  const conversations = useUnreadConversations();
  const requests = useFriendRequests();
  return () => mentions().length + conversations().length + requests().length;
}

/**
 * Notification centre (bell)
 *
 * Built only from data the server provides: unread mentions, incoming friend
 * requests and unread conversations. There is no server-side history, so
 * items disappear once read.
 */
export function NotificationCenter(props: {
  anchor: Accessor<HTMLElement | undefined>;
}) {
  const { t } = useLingui();
  const navigate = useNavigate();
  const { openModal } = useModals();
  const mentions = useMentionEntries();
  const conversations = useUnreadConversations();
  const requests = useFriendRequests();

  const empty = () =>
    !mentions().length && !conversations().length && !requests().length;

  function close() {
    setNotificationsOpen(false);
  }

  function markAllRead() {
    const channels = new Set<Channel>();
    mentions().forEach((m) => channels.add(m.channel));
    conversations().forEach((c) => channels.add(c));
    channels.forEach((c) => c.ack(undefined, false, false));
  }

  return (
    <Popover
      anchor={props.anchor}
      open={notificationsOpen()}
      onClose={close}
      placement="bottom-end"
      width={380}
      label={t`Notifications`}
    >
      <Head>
        <h2>
          <Trans>Notifications</Trans>
        </h2>
        <Show when={mentions().length || conversations().length}>
          <HeadButton type="button" onClick={markAllRead}>
            <IconCheckAll size={15} />
            <Trans>Mark all as read</Trans>
          </HeadButton>
        </Show>
        <HeadIcon
          type="button"
          aria-label={t`Notification settings`}
          onClick={() => {
            close();
            openModal({ type: "settings", config: "user" });
          }}
        >
          <IconSettings size={15} />
        </HeadIcon>
      </Head>

      <Body>
        <Switch>
          <Match when={empty()}>
            <Empty>
              <span class={emptyIcon}>
                <IconCheck size={20} />
              </span>
              <strong>
                <Trans>You're all caught up</Trans>
              </strong>
              <span>
                <Trans>
                  Mentions, friend requests and new messages show up here.
                </Trans>
              </span>
            </Empty>
          </Match>
          <Match when>
            <Show when={requests().length}>
              <GroupLabel>
                <Trans>Friend requests</Trans>
              </GroupLabel>
              <For each={requests()}>
                {(user) => <RequestItem user={user} />}
              </For>
            </Show>

            <Show when={mentions().length}>
              <GroupLabel>
                <Trans>Mentions</Trans>
              </GroupLabel>
              <For each={mentions().slice(0, 30)}>
                {(entry) => (
                  <MentionItem
                    channel={entry.channel}
                    messageId={entry.messageId}
                    onOpen={(path) => {
                      close();
                      navigate(path);
                    }}
                  />
                )}
              </For>
            </Show>

            <Show when={conversations().length}>
              <GroupLabel>
                <Trans>Unread conversations</Trans>
              </GroupLabel>
              <For each={conversations()}>
                {(channel) => (
                  <ItemButton
                    type="button"
                    onClick={() => {
                      close();
                      navigate(channel.path);
                    }}
                  >
                    <Avatar
                      size={32}
                      src={channel.iconURL ?? channel.recipient?.avatarURL}
                      fallback={channel.displayName}
                    />
                    <ItemText>
                      <span class={itemTitle}>{channel.displayName}</span>
                      <span class={itemSub}>
                        <IconMessage size={12} />
                        <Trans>New messages</Trans>
                      </span>
                    </ItemText>
                    <Show when={channel.lastMessageAt}>
                      <span class={itemTime}>
                        <Time
                          value={channel.lastMessageAt!}
                          format="relative"
                        />
                      </span>
                    </Show>
                  </ItemButton>
                )}
              </For>
            </Show>
          </Match>
        </Switch>
      </Body>
    </Popover>
  );
}

/**
 * Incoming friend request with inline actions
 */
function RequestItem(props: { user: User }) {
  const { t } = useLingui();
  return (
    <Item>
      <Avatar
        size={32}
        src={props.user.avatarURL}
        fallback={props.user.displayName}
      />
      <ItemText>
        <span class={itemTitle}>{props.user.displayName}</span>
        <span class={itemSub}>
          <IconUserPlus size={12} />
          <Trans>wants to be your friend</Trans>
        </span>
      </ItemText>
      <Actions>
        <button
          type="button"
          class={roundAction({ accept: true })}
          aria-label={t`Accept`}
          onClick={() => props.user.addFriend()}
          use:floating={{ tooltip: { placement: "top", content: t`Accept` } }}
        >
          <IconCheck size={15} />
        </button>
        <button
          class={roundAction()}
          type="button"
          aria-label={t`Ignore`}
          onClick={() => props.user.removeFriend()}
          use:floating={{ tooltip: { placement: "top", content: t`Ignore` } }}
        >
          <IconX size={15} />
        </button>
      </Actions>
    </Item>
  );
}

/**
 * One unread mention; the message is fetched on demand
 */
function MentionItem(props: {
  channel: Channel;
  messageId: string;
  onOpen: (path: string) => void;
}) {
  const client = useClient();
  const [message] = createResource(
    () => props.messageId,
    (id) => client().messages.get(id) ?? props.channel.fetchMessage(id),
  );

  const where = () =>
    props.channel.server
      ? `${props.channel.server.name} · #${props.channel.name}`
      : props.channel.displayName;

  return (
    <ItemButton
      type="button"
      onClick={() =>
        props.onOpen(
          message()?.path ?? `${props.channel.path}/${props.messageId}`,
        )
      }
    >
      <Avatar
        size={32}
        src={message()?.avatarURL}
        fallback={message()?.username}
      />
      <ItemText>
        <span class={itemTitle}>
          <Show when={message()} fallback={where()}>
            {message()!.username}
            <span class={itemWhere}> · {where()}</span>
          </Show>
        </span>
        <span class={itemSub}>
          <IconAt size={12} />
          <span class={clamp}>
            {message() ? plainText(message()!.content, client()) || "…" : "…"}
          </span>
        </span>
      </ItemText>
      <span class={itemTime}>
        <Time value={new Date(decodeTime(props.messageId))} format="relative" />
      </span>
    </ItemButton>
  );
}

const Head = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "var(--caps-space-3)",
    height: "48px",
    paddingInline: "var(--caps-space-6) var(--caps-space-4)",
    borderBottom: "1px solid var(--caps-line-soft)",
    flexShrink: 0,

    "& h2": {
      flex: 1,
      margin: 0,
      fontSize: "var(--caps-text-base)",
      fontWeight: 600,
    },
  },
});

const HeadButton = styled("button", {
  base: {
    all: "unset",
    display: "inline-flex",
    alignItems: "center",
    gap: "var(--caps-space-3)",
    height: "28px",
    paddingInline: "var(--caps-space-4)",
    borderRadius: "var(--caps-radius-sm)",
    fontSize: "var(--caps-text-sm)",
    fontWeight: 500,
    color: "var(--caps-text-2)",
    cursor: "pointer",
    "&:hover": { background: "var(--caps-hover)", color: "var(--caps-text)" },
    "&:focus-visible": { boxShadow: "var(--caps-focus-ring)" },
  },
});

const HeadIcon = styled("button", {
  base: {
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
  },
});

const Body = styled("div", {
  base: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    padding: "var(--caps-space-3)",
  },
});

const GroupLabel = styled("div", {
  base: {
    padding: "var(--caps-space-5) var(--caps-space-4) var(--caps-space-3)",
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "var(--caps-text-3)",
  },
});

const itemBase = {
  all: "unset",
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  gap: "var(--caps-space-5)",
  width: "100%",
  minHeight: "52px",
  padding: "var(--caps-space-3) var(--caps-space-4)",
  borderRadius: "var(--caps-radius-md)",
  "&:focus-visible": { boxShadow: "var(--caps-focus-ring)" },
} as const;

const Item = styled("div", { base: itemBase });

const ItemButton = styled("button", {
  base: {
    ...itemBase,
    cursor: "pointer",
    "&:hover": { background: "var(--caps-hover)" },
  },
});

const ItemText = styled("div", {
  base: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
});

const itemTitle = css({
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontSize: "var(--caps-text-md)",
  fontWeight: 600,
  color: "var(--caps-text)",
});

const itemWhere = css({
  fontWeight: 400,
  color: "var(--caps-text-3)",
});

const itemSub = css({
  display: "flex",
  alignItems: "center",
  gap: "var(--caps-space-2)",
  minWidth: 0,
  fontSize: "var(--caps-text-sm)",
  color: "var(--caps-text-2)",
  "& svg": { flexShrink: 0, color: "var(--caps-text-3)" },
});

const clamp = css({
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const itemTime = css({
  flexShrink: 0,
  alignSelf: "flex-start",
  paddingTop: "4px",
  fontSize: "11px",
  color: "var(--caps-text-3)",
  fontVariantNumeric: "tabular-nums",
});

const Actions = styled("div", {
  base: { display: "flex", gap: "var(--caps-space-2)" },
});

const roundAction = cva({
  base: {
    all: "unset",
    display: "grid",
    placeItems: "center",
    width: "30px",
    height: "30px",
    borderRadius: "var(--caps-radius-full)",
    background: "var(--caps-bg-component)",
    color: "var(--caps-text-2)",
    cursor: "pointer",
    "&:hover": {
      color: "var(--caps-text)",
      background: "var(--caps-bg-component-hover)",
    },
    "&:focus-visible": { boxShadow: "var(--caps-focus-ring)" },
  },
  variants: {
    accept: {
      true: {
        "&:hover": {
          background: "var(--caps-success-soft)",
          color: "var(--caps-success)",
        },
      },
    },
  },
});

const Empty = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "var(--caps-space-3)",
    padding: "var(--caps-space-9) var(--caps-space-8)",
    textAlign: "center",
    fontSize: "var(--caps-text-md)",
    color: "var(--caps-text-3)",

    "& strong": {
      color: "var(--caps-text)",
      fontWeight: 600,
      fontSize: "var(--caps-text-base)",
    },
  },
});

const emptyIcon = css({
  display: "grid",
  placeItems: "center",
  width: "40px",
  height: "40px",
  marginBottom: "var(--caps-space-3)",
  borderRadius: "var(--caps-radius-full)",
  background: "var(--caps-accent-soft)",
  color: "var(--caps-accent)",
});
