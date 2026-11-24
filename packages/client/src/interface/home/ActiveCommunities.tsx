import { For, Show, createMemo } from "solid-js";

import { Plural, Trans } from "@lingui/solid/macro";
import { Server } from "stoat.js";
import { css } from "styled-system/css";
import { styled } from "styled-system/jsx";

import { ServerContextMenu } from "@revolt/app";
import { useClient } from "@revolt/client";
import { useModals } from "@revolt/modal";
import { useState } from "@revolt/state";
import { Avatar } from "@revolt/ui";

import IconPlus from "lucide-solid/icons/plus";
import IconVolume from "lucide-solid/icons/volume-2";

import { useCommunityBadges } from "../shell/communityState";

import { Section } from "./Section";

/**
 * Communities ranked by real activity signals: mentions, unread channels,
 * people in voice and how recent the last message is
 */
export function ActiveCommunities() {
  const state = useState();
  const client = useClient();
  const { openModal } = useModals();
  const badges = useCommunityBadges();

  const ranked = createMemo(() => {
    const now = Date.now();
    return state.ordering
      .orderedServers(client())
      .map((server) => {
        const lastAt = server.channels.reduce(
          (max, c) => Math.max(max, c.lastMessageAt?.getTime() ?? 0),
          0,
        );
        const inVoice = server.channels.reduce(
          (n, c) => n + c.voiceParticipants.size,
          0,
        );
        const hours = lastAt ? (now - lastAt) / 3.6e6 : 1e4;
        const score =
          badges.mentions(server) * 100 +
          (badges.unread(server) ? 30 : 0) +
          inVoice * 40 +
          Math.max(0, 48 - hours);
        return { server, score, inVoice, lastAt };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  });

  return (
    <Section title={<Trans>Your communities</Trans>}>
      <Grid>
        <For each={ranked()}>
          {(entry) => (
            <CommunityCard server={entry.server} inVoice={entry.inVoice} />
          )}
        </For>
        <button
          type="button"
          class={addCard}
          onClick={() =>
            openModal({ type: "create_or_join_server", client: client() })
          }
        >
          <IconPlus size={18} />
          <Trans>Create or join</Trans>
        </button>
      </Grid>
    </Section>
  );
}

function CommunityCard(props: { server: Server; inVoice: number }) {
  const state = useState();
  const badges = useCommunityBadges();
  const mentions = () => badges.mentions(props.server);

  return (
    <a
      class={card}
      href={state.layout.getLastActiveServerPath(props.server.id)}
      data-unread={badges.unread(props.server) || undefined}
      use:floating={{
        contextMenu: () => <ServerContextMenu server={props.server} />,
      }}
    >
      <Avatar
        size={40}
        shape="rounded-square"
        src={props.server.iconURL}
        fallback={props.server.name}
      />
      <span class={text}>
        <span class={name}>{props.server.name}</span>
        <span class={sub}>
          <Show
            when={props.inVoice}
            fallback={
              <Show when={props.server.approximateMemberCount}>
                <Plural
                  value={props.server.approximateMemberCount}
                  one="# member"
                  other="# members"
                />
              </Show>
            }
          >
            <span class={voice}>
              <IconVolume size={12} />
              <Plural
                value={props.inVoice}
                one="# in voice"
                other="# in voice"
              />
            </span>
          </Show>
        </span>
      </span>
      <Show
        when={mentions()}
        fallback={
          <Show when={badges.unread(props.server)}>
            <span class={dot} />
          </Show>
        }
      >
        <span class={badge}>{mentions()}</span>
      </Show>
    </a>
  );
}

const Grid = styled("div", {
  base: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "var(--caps-space-4)",
  },
});

const card = css({
  display: "flex",
  alignItems: "center",
  gap: "var(--caps-space-5)",
  padding: "var(--caps-space-5)",
  borderRadius: "var(--caps-radius-lg)",
  background: "var(--caps-bg-surface)",
  boxShadow: "inset 0 0 0 1px var(--caps-line-soft)",
  color: "inherit",
  textDecoration: "none",
  transition:
    "box-shadow var(--caps-dur) var(--caps-ease), background var(--caps-dur) var(--caps-ease)",
  "&:hover": {
    boxShadow: "inset 0 0 0 1px var(--caps-line)",
    background: "var(--caps-bg-component)",
  },
  "&:focus-visible": { boxShadow: "var(--caps-focus-ring)" },
});

const addCard = css({
  all: "unset",
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--caps-space-4)",
  minHeight: "66px",
  borderRadius: "var(--caps-radius-lg)",
  border: "1px dashed var(--caps-line)",
  fontSize: "var(--caps-text-md)",
  fontWeight: 500,
  color: "var(--caps-text-3)",
  cursor: "pointer",
  "&:hover": {
    color: "var(--caps-text)",
    borderColor: "var(--caps-line-strong)",
    background: "var(--caps-hover)",
  },
  "&:focus-visible": { boxShadow: "var(--caps-focus-ring)" },
});

const text = css({
  flex: 1,
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  gap: "2px",
});

const name = css({
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontSize: "var(--caps-text-base)",
  fontWeight: 600,
  color: "var(--caps-text)",
});

const sub = css({
  fontSize: "var(--caps-text-sm)",
  color: "var(--caps-text-3)",
});

const voice = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "4px",
  color: "var(--caps-success)",
});

const dot = css({
  width: "8px",
  height: "8px",
  flexShrink: 0,
  borderRadius: "var(--caps-radius-full)",
  background: "var(--caps-text)",
});

const badge = css({
  display: "inline-grid",
  placeItems: "center",
  minWidth: "20px",
  height: "20px",
  paddingInline: "6px",
  flexShrink: 0,
  borderRadius: "var(--caps-radius-full)",
  background: "var(--caps-mention)",
  color: "#1d1404",
  fontSize: "11px",
  fontWeight: 700,
});
