import { For, Show, createMemo } from "solid-js";

import { Plural, Trans, useLingui } from "@lingui/solid/macro";
import { css } from "styled-system/css";
import { styled } from "styled-system/jsx";

import { IS_DEV, useClient } from "@revolt/client";
import { useModals } from "@revolt/modal";
import { useNavigate } from "@revolt/routing";
import { Avatar, Button, Header, iconSize } from "@revolt/ui";

import IconDownload from "lucide-solid/icons/download";
import IconHouse from "lucide-solid/icons/house";
import IconLink from "lucide-solid/icons/link";
import IconPlus from "lucide-solid/icons/plus";
import IconUserPlus from "lucide-solid/icons/user-plus";
import IconUsers from "lucide-solid/icons/users";

import { HeaderIcon } from "./common/CommonHeader";
import { ActiveCommunities } from "./home/ActiveCommunities";
import { OnlineFriends } from "./home/OnlineFriends";
import { PlayingNow } from "./home/PlayingNow";
import { RecentConversations } from "./home/RecentConversations";
import { Section, Surface } from "./home/Section";
import { VoiceRooms } from "./home/VoiceRooms";
import { useNotificationCount } from "./shell/NotificationCenter";
import { WINDOWS_DOWNLOAD_URL, isWindowsBrowser } from "./shell/shellState";

/**
 * Social home: what's happening with your friends and communities right now
 */
export function HomePage() {
  const { t } = useLingui();
  const { openModal } = useModals();
  const navigate = useNavigate();
  const client = useClient();
  const notifications = useNotificationCount();

  const greeting = () => {
    const hour = new Date().getHours();
    return hour < 5
      ? t`Good evening`
      : hour < 12
        ? t`Good morning`
        : hour < 18
          ? t`Good afternoon`
          : t`Good evening`;
  };

  const onlineFriends = createMemo(
    () =>
      client().users.filter((u) => u.relationship === "Friend" && u.online)
        .length,
  );
  const liveRooms = createMemo(
    () =>
      [...client().channels.values()].filter(
        (c) => c.isVoice && c.voiceParticipants.size > 0,
      ).length,
  );
  const requests = createMemo(() =>
    client().users.filter((u) => u.relationship === "Incoming"),
  );

  return (
    <Base>
      <Header placement="primary">
        <HeaderIcon>
          <IconHouse {...iconSize(18)} />
        </HeaderIcon>
        <Trans>Home</Trans>
      </Header>
      <div use:scrollable={{ class: scroller }}>
        <Page>
          <Hero>
            <h1>
              {greeting()}, {client().user?.displayName}
            </h1>
            <Summary>
              <span>
                <Plural
                  value={onlineFriends()}
                  _0="No friends online"
                  one="# friend online"
                  other="# friends online"
                />
              </span>
              <span>
                <Plural
                  value={liveRooms()}
                  _0="No live voice rooms"
                  one="# live voice room"
                  other="# live voice rooms"
                />
              </span>
              <Show when={notifications()}>
                <span class={highlight}>
                  <Plural
                    value={notifications()}
                    one="# new notification"
                    other="# new notifications"
                  />
                </span>
              </Show>
            </Summary>
            <QuickActions>
              <button
                type="button"
                class={quick}
                onClick={() =>
                  openModal({ type: "add_friend", client: client() })
                }
              >
                <IconUserPlus size={16} />
                <Trans>Add friend</Trans>
              </button>
              <button
                type="button"
                class={quick}
                onClick={() =>
                  openModal({ type: "create_group", client: client() })
                }
              >
                <IconUsers size={16} />
                <Trans>New group</Trans>
              </button>
              <button
                type="button"
                class={quick}
                onClick={() =>
                  openModal({ type: "create_server", client: client() })
                }
              >
                <IconPlus size={16} />
                <Trans>Create community</Trans>
              </button>
              <button
                type="button"
                class={quick}
                onClick={() =>
                  openModal({ type: "join_server", client: client() })
                }
              >
                <IconLink size={16} />
                <Trans>Join with invite</Trans>
              </button>
              <Show when={isWindowsBrowser}>
                <a
                  class={quick}
                  href={WINDOWS_DOWNLOAD_URL}
                  download="CAPS-Setup.exe"
                >
                  <IconDownload size={16} />
                  <Trans>Download for Windows</Trans>
                </a>
              </Show>
            </QuickActions>
          </Hero>

          <Columns>
            <Main>
              <VoiceRooms />
              <PlayingNow />
              <RecentConversations />
              <ActiveCommunities />
            </Main>
            <Aside>
              <Show when={requests().length}>
                <Section
                  title={<Trans>Friend requests</Trans>}
                  meta={requests().length}
                >
                  <Surface>
                    <For each={requests()}>
                      {(user) => (
                        <div class={requestRow}>
                          <Avatar
                            size={32}
                            src={user.avatarURL}
                            fallback={user.displayName}
                          />
                          <span class={requestName}>{user.displayName}</span>
                          <Button size="xs" onPress={() => user.addFriend()}>
                            <Trans>Accept</Trans>
                          </Button>
                          <Button
                            size="xs"
                            variant="text"
                            onPress={() => user.removeFriend()}
                          >
                            <Trans>Ignore</Trans>
                          </Button>
                        </div>
                      )}
                    </For>
                  </Surface>
                </Section>
              </Show>
              <OnlineFriends />
            </Aside>
          </Columns>

          <Show when={IS_DEV}>
            <Button variant="text" size="sm" onPress={() => navigate("/dev")}>
              Open Development Page
            </Button>
          </Show>
        </Page>
      </div>
    </Base>
  );
}

const Base = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minWidth: 0,
    minHeight: 0,
  },
});

const scroller = css({
  flex: 1,
  minHeight: 0,
});

const Page = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--caps-space-9)",
    width: "100%",
    maxWidth: "1120px",
    marginInline: "auto",
    padding: "var(--caps-space-9) var(--caps-space-9) var(--caps-space-10)",

    _tablet: { padding: "var(--caps-space-8) var(--caps-space-6)" },
    _phone: { padding: "var(--caps-space-7) var(--caps-space-5)" },
  },
});

const Hero = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--caps-space-4)",
    animation: "authHintIn 260ms var(--caps-ease-out)",

    "& h1": {
      margin: 0,
      fontSize: "var(--caps-text-3xl)",
      fontWeight: 650,
      letterSpacing: "-0.025em",
      color: "var(--caps-text)",
      _phone: { fontSize: "var(--caps-text-2xl)" },
    },
  },
});

const Summary = styled("div", {
  base: {
    display: "flex",
    flexWrap: "wrap",
    gap: "var(--caps-space-2) var(--caps-space-6)",
    fontSize: "var(--caps-text-base)",
    color: "var(--caps-text-3)",

    "& > span:not(:first-child)::before": {
      content: '"·"',
      marginInlineEnd: "var(--caps-space-6)",
      color: "var(--caps-text-disabled)",
    },
  },
});

const highlight = css({ color: "var(--caps-mention)" });

const QuickActions = styled("div", {
  base: {
    display: "flex",
    flexWrap: "wrap",
    gap: "var(--caps-space-3)",
    marginTop: "var(--caps-space-5)",
  },
});

const quick = css({
  all: "unset",
  boxSizing: "border-box",
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--caps-space-4)",
  height: "32px",
  paddingInline: "var(--caps-space-5) var(--caps-space-6)",
  borderRadius: "var(--caps-radius-md)",
  background: "var(--caps-bg-component)",
  fontSize: "var(--caps-text-md)",
  fontWeight: 500,
  color: "var(--caps-text-2)",
  cursor: "pointer",
  transition:
    "background var(--caps-dur-fast) var(--caps-ease), color var(--caps-dur-fast) var(--caps-ease)",
  "&:hover": {
    background: "var(--caps-bg-component-hover)",
    color: "var(--caps-text)",
  },
  "&:active": { transform: "translateY(0.5px)" },
  "&:focus-visible": { boxShadow: "var(--caps-focus-ring)" },
});

const Columns = styled("div", {
  base: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 300px",
    gap: "var(--caps-space-9)",
    alignItems: "start",

    "@media (max-width: 1100px)": {
      gridTemplateColumns: "minmax(0, 1fr)",
    },
  },
});

const Main = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--caps-space-9)",
    minWidth: 0,
  },
});

const Aside = styled("aside", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--caps-space-9)",
    minWidth: 0,
  },
});

const requestRow = css({
  display: "flex",
  alignItems: "center",
  gap: "var(--caps-space-4)",
  padding: "var(--caps-space-4) var(--caps-space-5)",
  "&:not(:last-child)": { boxShadow: "inset 0 -1px 0 var(--caps-line-soft)" },
});

const requestName = css({
  flex: 1,
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontSize: "var(--caps-text-md)",
  fontWeight: 500,
});
