import { Match, Show, Switch, createMemo } from "solid-js";

import { Trans } from "@lingui/solid/macro";
import { Channel } from "stoat.js";
import { styled } from "styled-system/jsx";

import { Text } from "../../../design";
import { Symbol } from "../../../utils/Symbol";

interface Props {
  /**
   * Channel information
   */
  channel: Channel;
}

/**
 * Mark the beginning of a conversation
 */
export function ConversationStart(props: Props) {
  const canReadHistory = createMemo(() =>
    props.channel.havePermission("ReadMessageHistory"),
  );

  return (
    <Base>
      <Glyph aria-hidden="true">
        <Symbol size={28}>
          {props.channel.type === "SavedMessages"
            ? "note_stack"
            : props.channel.type === "DirectMessage"
              ? "alternate_email"
              : props.channel.type === "Group"
                ? "group"
                : "tag"}
        </Symbol>
      </Glyph>
      <Show when={props.channel.type !== "SavedMessages"}>
        <Text class="headline" size="large">
          {props.channel.name ?? props.channel.recipient?.username}
        </Text>
      </Show>
      <Text class="body" size="large">
        <Switch
          fallback={<Trans>This is the start of your conversation.</Trans>}
        >
          <Match when={!canReadHistory()}>
            <Trans>You don't have permission to see past messages.</Trans>
          </Match>
          <Match when={props.channel.type === "SavedMessages"}>
            <Trans>This is the start of your notes.</Trans>
          </Match>
        </Switch>
      </Text>
    </Base>
  );
}

/**
 * Base styles
 */
const Base = styled("div", {
  base: {
    display: "flex",
    userSelect: "none",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "var(--caps-space-2)",
    margin: "var(--caps-space-10) var(--caps-space-6) var(--caps-space-6) 16px",
    paddingBottom: "var(--caps-space-6)",
    borderBottom: "1px solid var(--caps-line-soft)",

    color: "var(--caps-text)",

    "& > span:last-child": {
      color: "var(--caps-text-2)",
    },
  },
});

/**
 * Channel glyph tile
 */
const Glyph = styled("div", {
  base: {
    display: "grid",
    placeItems: "center",
    width: "56px",
    height: "56px",
    marginBottom: "var(--caps-space-4)",
    borderRadius: "var(--caps-radius-server)",
    color: "var(--caps-accent)",
    background: "var(--caps-bg-raised)",
    boxShadow: "inset 0 0 0 1px var(--caps-line)",
  },
});
