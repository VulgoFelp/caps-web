import { For, Show, createMemo } from "solid-js";

import { Plural, Trans } from "@lingui/solid/macro";
import { User } from "stoat.js";
import { css } from "styled-system/css";
import { styled } from "styled-system/jsx";

import { UserContextMenu } from "@revolt/app";
import { useClient } from "@revolt/client";
import { useNavigate } from "@revolt/routing";
import { Avatar, UserStatus, formatActivityElapsed } from "@revolt/ui";

import IconGamepad from "lucide-solid/icons/gamepad-2";

import { Section } from "./Section";

/**
 * CAPS: friends that are playing something right now, grouped by game
 *
 * Only real activity reported by CAPS Desktop (opt-in). Hidden when nobody
 * is playing.
 */
export function PlayingNow() {
  const client = useClient();

  const players = createMemo(() =>
    client().users.filter((u) => u.relationship === "Friend" && !!u.activity),
  );

  const games = createMemo(() => {
    const groups = new Map<string, User[]>();
    for (const user of players()) {
      const name = user.activity!.name;
      groups.set(name, [...(groups.get(name) ?? []), user]);
    }

    return [...groups.entries()]
      .map(([name, users]) => ({
        name,
        // longest session first
        users: users.sort(
          (a, b) =>
            a.activity!.startedAt.getTime() - b.activity!.startedAt.getTime(),
        ),
      }))
      .sort(
        (a, b) =>
          b.users.length - a.users.length || a.name.localeCompare(b.name),
      );
  });

  return (
    <Show when={games().length}>
      <Section title={<Trans>Playing now</Trans>} meta={players().length}>
        <Grid>
          <For each={games()}>
            {(game) => <GameCard name={game.name} users={game.users} />}
          </For>
        </Grid>
      </Section>
    </Show>
  );
}

function GameCard(props: { name: string; users: User[] }) {
  return (
    <Card>
      <CardTop>
        <IconGamepad size={16} class={gameIcon} />
        <span class={gameName} title={props.name}>
          {props.name}
        </span>
        <span class={count}>
          <Plural value={props.users.length} one="# friend" other="# friends" />
        </span>
      </CardTop>
      <For each={props.users.slice(0, 4)}>
        {(user) => <PlayerRow user={user} />}
      </For>
      <Show when={props.users.length > 4}>
        <span class={more}>+{props.users.length - 4}</span>
      </Show>
    </Card>
  );
}

function PlayerRow(props: { user: User }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      class={row}
      onClick={() => props.user.openDM().then((c) => navigate(c.path))}
      use:floating={{
        userCard: { user: props.user },
        contextMenu: () => <UserContextMenu user={props.user} />,
      }}
    >
      <Avatar
        size={24}
        src={props.user.avatarURL}
        fallback={props.user.displayName}
        holepunch="bottom-right"
        overlay={<UserStatus.Graphic status={props.user.presence} />}
      />
      <span class={playerName}>{props.user.displayName}</span>
      <Show when={props.user.activity}>
        {(activity) => (
          <span class={elapsed}>
            {formatActivityElapsed(activity().startedAt)}
          </span>
        )}
      </Show>
    </button>
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
    gap: "var(--caps-space-2)",
    padding: "var(--caps-space-5)",
    borderRadius: "var(--caps-radius-lg)",
    background: "var(--caps-bg-surface)",
    boxShadow: "inset 0 0 0 1px var(--caps-line-soft)",
    transition: "box-shadow var(--caps-dur) var(--caps-ease)",

    "&:hover": { boxShadow: "inset 0 0 0 1px var(--caps-accent-line)" },
  },
});

const CardTop = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "var(--caps-space-3)",
    paddingInline: "var(--caps-space-2)",
    paddingBottom: "var(--caps-space-2)",
  },
});

const gameIcon = css({
  flexShrink: 0,
  color: "var(--caps-accent-text)",
});

const gameName = css({
  flex: 1,
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontSize: "var(--caps-text-base)",
  fontWeight: 600,
  color: "var(--caps-text)",
});

const count = css({
  flexShrink: 0,
  fontSize: "var(--caps-text-sm)",
  color: "var(--caps-text-3)",
});

const row = css({
  all: "unset",
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  gap: "var(--caps-space-4)",
  width: "100%",
  padding: "var(--caps-space-2)",
  borderRadius: "var(--caps-radius-md)",
  cursor: "pointer",
  transition: "background var(--caps-dur-fast) var(--caps-ease)",
  "&:hover": { background: "var(--caps-hover)" },
  "&:focus-visible": { boxShadow: "var(--caps-focus-ring)" },
});

const playerName = css({
  flex: 1,
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontSize: "var(--caps-text-md)",
  color: "var(--caps-text)",
});

const elapsed = css({
  flexShrink: 0,
  fontSize: "var(--caps-text-sm)",
  fontVariantNumeric: "tabular-nums",
  color: "var(--caps-text-3)",
});

const more = css({
  paddingInline: "var(--caps-space-2)",
  fontSize: "var(--caps-text-sm)",
  color: "var(--caps-text-3)",
});
