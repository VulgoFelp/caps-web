import { For, Show, createMemo } from "solid-js";

import { Trans, useLingui } from "@lingui/solid/macro";
import { User } from "stoat.js";
import { css } from "styled-system/css";
import { styled } from "styled-system/jsx";

import { UserContextMenu } from "@revolt/app";
import { useClient } from "@revolt/client";
import { useModals } from "@revolt/modal";
import { useNavigate } from "@revolt/routing";
import { Avatar, Button, UserActivityLine, UserStatus } from "@revolt/ui";

import { Section, SectionLink, Surface } from "./Section";

/**
 * Friends that are online now, with their status
 */
export function OnlineFriends() {
  const client = useClient();
  const { openModal } = useModals();

  const friends = createMemo(() =>
    client().users.filter((u) => u.relationship === "Friend"),
  );
  const online = createMemo(() =>
    friends()
      .filter((u) => u.online)
      .sort((a, b) => a.displayName.localeCompare(b.displayName)),
  );

  return (
    <Section
      title={<Trans>Friends online</Trans>}
      meta={`${online().length}/${friends().length}`}
      action={
        <SectionLink href="/friends">
          <Trans>All friends</Trans>
        </SectionLink>
      }
    >
      <Surface>
        <Show
          when={online().length}
          fallback={
            <Empty>
              <span>
                <Show
                  when={friends().length}
                  fallback={<Trans>Add friends to see who's around.</Trans>}
                >
                  <Trans>None of your friends are online right now.</Trans>
                </Show>
              </span>
              <Show when={!friends().length}>
                <Button
                  size="sm"
                  variant="tonal"
                  onPress={() =>
                    openModal({ type: "add_friend", client: client() })
                  }
                >
                  <Trans>Add friend</Trans>
                </Button>
              </Show>
            </Empty>
          }
        >
          <For each={online().slice(0, 8)}>
            {(user) => <FriendRow user={user} />}
          </For>
        </Show>
      </Surface>
    </Section>
  );
}

function FriendRow(props: { user: User }) {
  const { t } = useLingui();
  const navigate = useNavigate();

  const status = () =>
    props.user.statusMessage((s) =>
      s === "Online"
        ? t`Online`
        : s === "Busy"
          ? t`Do Not Disturb`
          : s === "Focus"
            ? t`Focus`
            : s === "Idle"
              ? t`Idle`
              : t`Offline`,
    ) ??
    (props.user.presence === "Busy"
      ? t`Do Not Disturb`
      : props.user.presence === "Idle"
        ? t`Idle`
        : props.user.presence === "Focus"
          ? t`Focus`
          : t`Online`);

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
        size={32}
        src={props.user.avatarURL}
        fallback={props.user.displayName}
        holepunch="bottom-right"
        overlay={<UserStatus.Graphic status={props.user.presence} />}
      />
      <span class={text}>
        <span class={name}>{props.user.displayName}</span>
        <Show
          when={props.user.activity}
          fallback={<span class={sub}>{status()}</span>}
        >
          <UserActivityLine user={props.user} elapsed={false} />
        </Show>
      </span>
    </button>
  );
}

const Empty = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "var(--caps-space-5)",
    padding: "var(--caps-space-7) var(--caps-space-6)",
    fontSize: "var(--caps-text-md)",
    color: "var(--caps-text-3)",
    textAlign: "center",
  },
});

const row = css({
  all: "unset",
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  gap: "var(--caps-space-5)",
  width: "100%",
  padding: "var(--caps-space-4) var(--caps-space-6)",
  cursor: "pointer",
  transition: "background var(--caps-dur-fast) var(--caps-ease)",
  "&:hover": { background: "var(--caps-hover)" },
  "&:focus-visible": { boxShadow: "var(--caps-focus-ring)" },
});

const text = css({
  display: "flex",
  flexDirection: "column",
  gap: "1px",
  minWidth: 0,
});

const name = css({
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontSize: "var(--caps-text-base)",
  fontWeight: 500,
  color: "var(--caps-text)",
});

const sub = css({
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontSize: "var(--caps-text-sm)",
  color: "var(--caps-text-3)",
});
