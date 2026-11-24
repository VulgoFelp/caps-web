import { For, Show, createMemo } from "solid-js";

import { Trans, useLingui } from "@lingui/solid/macro";
import { Channel } from "stoat.js";
import { css } from "styled-system/css";
import { styled } from "styled-system/jsx";

import { useClient } from "@revolt/client";
import { useNavigate } from "@revolt/routing";
import { useVoice } from "@revolt/rtc";
import { Avatar } from "@revolt/ui";

import IconMonitor from "lucide-solid/icons/screen-share";
import IconVideo from "lucide-solid/icons/video";
import IconVolume from "lucide-solid/icons/volume-2";

import { Section } from "./Section";

/**
 * Voice rooms with people in them right now (across everything you can see)
 */
export function VoiceRooms() {
  const client = useClient();

  const rooms = createMemo(() =>
    [...client().channels.values()]
      .filter((c) => c.isVoice && c.voiceParticipants.size > 0)
      .sort((a, b) => b.voiceParticipants.size - a.voiceParticipants.size),
  );

  return (
    <Show when={rooms().length}>
      <Section title={<Trans>Live voice rooms</Trans>} meta={rooms().length}>
        <Grid>
          <For each={rooms()}>
            {(channel) => <RoomCard channel={channel} />}
          </For>
        </Grid>
      </Section>
    </Show>
  );
}

function RoomCard(props: { channel: Channel }) {
  const { t } = useLingui();
  const client = useClient();
  const voice = useVoice();
  const navigate = useNavigate();

  const participants = () => [...props.channel.voiceParticipants.values()];
  const inThisRoom = () => voice.channel()?.id === props.channel.id;
  const sharing = () => participants().some((p) => p.isScreensharing());
  const camera = () => participants().some((p) => p.isCamera());

  const where = () =>
    props.channel.server?.name ??
    (props.channel.type === "Group" ? t`Group` : t`Direct message`);

  return (
    <Card data-live={inThisRoom() || undefined}>
      <CardTop>
        <span class={liveDot} aria-hidden="true" />
        <span class={roomName}>
          {props.channel.displayName ?? props.channel.name}
        </span>
        <Show when={sharing()}>
          <IconMonitor size={14} aria-label={t`Screen sharing`} />
        </Show>
        <Show when={camera()}>
          <IconVideo size={14} aria-label={t`Camera on`} />
        </Show>
      </CardTop>
      <span class={roomWhere}>{where()}</span>
      <People>
        <For each={participants().slice(0, 6)}>
          {(p) => {
            const user = () => client().users.get(p.userId);
            return (
              <span
                class={personRing}
                data-muted={!p.isPublishing() || undefined}
                title={user()?.displayName}
              >
                <Avatar
                  size={28}
                  src={user()?.avatarURL}
                  fallback={user()?.displayName}
                />
              </span>
            );
          }}
        </For>
        <Show when={participants().length > 6}>
          <span class={more}>+{participants().length - 6}</span>
        </Show>
      </People>
      <Actions>
        <Show
          when={!inThisRoom()}
          fallback={
            <span class={youAreHere}>
              <IconVolume size={14} />
              <Trans>You're here</Trans>
            </span>
          }
        >
          <button
            type="button"
            class={joinButton}
            onClick={() => {
              voice.connect(props.channel);
              navigate(props.channel.path);
            }}
          >
            <Trans>Join</Trans>
          </button>
        </Show>
        <a class={openLink} href={props.channel.path}>
          <Trans>Open</Trans>
        </a>
      </Actions>
    </Card>
  );
}

const Grid = styled("div", {
  base: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: "var(--caps-space-5)",
  },
});

const Card = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--caps-space-3)",
    padding: "var(--caps-space-6)",
    borderRadius: "var(--caps-radius-lg)",
    background: "var(--caps-bg-surface)",
    boxShadow: "inset 0 0 0 1px var(--caps-line-soft)",
    transition: "box-shadow var(--caps-dur) var(--caps-ease)",

    "&:hover": { boxShadow: "inset 0 0 0 1px var(--caps-line)" },
    "&[data-live]": { boxShadow: "inset 0 0 0 1px var(--caps-accent-line)" },
  },
});

const CardTop = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "var(--caps-space-3)",
    color: "var(--caps-text-3)",
  },
});

const liveDot = css({
  width: "8px",
  height: "8px",
  flexShrink: 0,
  borderRadius: "var(--caps-radius-full)",
  background: "var(--caps-success)",
  boxShadow: "0 0 0 3px var(--caps-success-soft)",
});

const roomName = css({
  flex: 1,
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontSize: "var(--caps-text-base)",
  fontWeight: 600,
  color: "var(--caps-text)",
});

const roomWhere = css({
  fontSize: "var(--caps-text-sm)",
  color: "var(--caps-text-3)",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const People = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    paddingBlock: "var(--caps-space-3)",
    "& > *:not(:first-child)": { marginInlineStart: "-6px" },
  },
});

const personRing = css({
  display: "grid",
  borderRadius: "var(--caps-radius-full)",
  boxShadow: "0 0 0 2px var(--caps-bg-surface)",
  "&[data-muted]": { opacity: 0.7 },
});

const more = css({
  display: "grid",
  placeItems: "center",
  width: "28px",
  height: "28px",
  borderRadius: "var(--caps-radius-full)",
  background: "var(--caps-bg-component)",
  boxShadow: "0 0 0 2px var(--caps-bg-surface)",
  fontSize: "11px",
  fontWeight: 600,
  color: "var(--caps-text-2)",
});

const Actions = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "var(--caps-space-4)",
  },
});

const joinButton = css({
  all: "unset",
  display: "inline-grid",
  placeItems: "center",
  height: "30px",
  paddingInline: "var(--caps-space-6)",
  borderRadius: "var(--caps-radius-md)",
  background: "var(--caps-accent)",
  color: "var(--caps-on-accent)",
  fontSize: "var(--caps-text-md)",
  fontWeight: 600,
  cursor: "pointer",
  transition: "background var(--caps-dur-fast) var(--caps-ease)",
  "&:hover": { background: "var(--caps-accent-hover)" },
  "&:active": { transform: "translateY(0.5px)" },
  "&:focus-visible": { boxShadow: "var(--caps-focus-ring)" },
});

const openLink = css({
  fontSize: "var(--caps-text-md)",
  fontWeight: 500,
  color: "var(--caps-text-2)",
  textDecoration: "none",
  "&:hover": { color: "var(--caps-text)" },
});

const youAreHere = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--caps-space-3)",
  height: "30px",
  fontSize: "var(--caps-text-md)",
  fontWeight: 600,
  color: "var(--caps-accent-text)",
});
