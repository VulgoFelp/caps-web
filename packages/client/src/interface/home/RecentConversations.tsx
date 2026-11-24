import { For, Match, Show, Switch, createMemo, createResource } from "solid-js";

import { Trans, useLingui } from "@lingui/solid/macro";
import { Channel } from "stoat.js";
import { css } from "styled-system/css";
import { styled } from "styled-system/jsx";

import { useClient } from "@revolt/client";
import { useState } from "@revolt/state";
import { Avatar, Time, UserStatus } from "@revolt/ui";

import { plainText } from "../shell/plainText";

import { Section, SectionLink, Surface } from "./Section";

/**
 * Most recent conversations with a preview of the last message
 */
export function RecentConversations() {
  const state = useState();
  const client = useClient();

  const conversations = createMemo(() =>
    state.ordering
      .orderedConversations(client())
      .filter((c) => c.lastMessageId)
      .slice(0, 6),
  );

  return (
    <Section
      title={<Trans>Recent conversations</Trans>}
      action={
        <SectionLink href="/conversations">
          <Trans>See all</Trans>
        </SectionLink>
      }
    >
      <Show
        when={conversations().length}
        fallback={
          <Surface class={emptyRow}>
            <Trans>Your conversations will show up here.</Trans>
          </Surface>
        }
      >
        <Surface>
          <For each={conversations()}>
            {(channel) => <ConversationRow channel={channel} />}
          </For>
        </Surface>
      </Show>
    </Section>
  );
}

function ConversationRow(props: { channel: Channel }) {
  const { t } = useLingui();
  const client = useClient();

  // last message: from cache, otherwise fetched once
  const [fetched] = createResource(
    () =>
      !props.channel.lastMessage ? props.channel.lastMessageId : undefined,
    () =>
      props.channel
        .fetchMessages({ limit: 1 })
        .then((list) => list[0])
        .catch(() => undefined),
  );
  const last = () => props.channel.lastMessage ?? fetched();

  const preview = () => {
    const message = last();
    if (!message) return "";
    const author =
      message.authorId === client().user?.id ? t`You` : message.username;
    const body =
      plainText(message.content, client()) ||
      (message.attachments?.length ? t`Sent an attachment` : "");
    return props.channel.type === "DirectMessage" &&
      message.authorId !== client().user?.id
      ? body
      : `${author}: ${body}`;
  };

  const typing = () => props.channel.typing.filter((u) => !u.self);

  return (
    <Row
      href={props.channel.path}
      data-unread={props.channel.unread || undefined}
    >
      <Switch>
        <Match when={props.channel.type === "DirectMessage"}>
          <Avatar
            size={36}
            src={props.channel.recipient?.avatarURL}
            fallback={props.channel.displayName}
            holepunch="bottom-right"
            overlay={
              <UserStatus.Graphic status={props.channel.recipient?.presence} />
            }
          />
        </Match>
        <Match when>
          <Avatar
            size={36}
            shape="rounded-square"
            src={props.channel.iconURL}
            fallback={props.channel.displayName}
          />
        </Match>
      </Switch>
      <Text>
        <span class={name}>{props.channel.displayName}</span>
        <span class={sub}>
          <Show when={typing().length} fallback={preview() || "…"}>
            <span class={typingText}>
              <Trans>typing…</Trans>
            </span>
          </Show>
        </span>
      </Text>
      <Meta>
        <Show when={props.channel.lastMessageAt}>
          <span class={time}>
            <Time value={props.channel.lastMessageAt!} format="relative" />
          </span>
        </Show>
        <Show
          when={props.channel.mentions?.size}
          fallback={
            <Show when={props.channel.unread}>
              <span class={dot} />
            </Show>
          }
        >
          <span class={badge}>{props.channel.mentions!.size}</span>
        </Show>
      </Meta>
    </Row>
  );
}

const emptyRow = css({
  padding: "var(--caps-space-7)",
  fontSize: "var(--caps-text-md)",
  color: "var(--caps-text-3)",
  textAlign: "center",
});

const Row = styled("a", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "var(--caps-space-5)",
    padding: "var(--caps-space-4) var(--caps-space-6)",
    textDecoration: "none",
    color: "inherit",
    transition: "background var(--caps-dur-fast) var(--caps-ease)",

    "&:not(:last-child)": {
      boxShadow: "inset 0 -1px 0 var(--caps-line-soft)",
    },
    "&:hover": { background: "var(--caps-hover)" },
    "&:focus-visible": { boxShadow: "var(--caps-focus-ring)" },
  },
});

const Text = styled("div", {
  base: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
});

const name = css({
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontSize: "var(--caps-text-base)",
  fontWeight: 500,
  color: "var(--caps-text)",
  "[data-unread] &": { fontWeight: 650 },
});

const sub = css({
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontSize: "var(--caps-text-md)",
  color: "var(--caps-text-3)",
  "[data-unread] &": { color: "var(--caps-text-2)" },
});

const typingText = css({ color: "var(--caps-accent-text)" });

const Meta = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "var(--caps-space-2)",
    flexShrink: 0,
  },
});

const time = css({
  fontSize: "11px",
  color: "var(--caps-text-3)",
  fontVariantNumeric: "tabular-nums",
});

const dot = css({
  width: "8px",
  height: "8px",
  borderRadius: "var(--caps-radius-full)",
  background: "var(--caps-accent)",
});

const badge = css({
  display: "inline-grid",
  placeItems: "center",
  minWidth: "18px",
  height: "18px",
  paddingInline: "5px",
  borderRadius: "var(--caps-radius-full)",
  background: "var(--caps-mention)",
  color: "#1d1404",
  fontSize: "11px",
  fontWeight: 700,
});
