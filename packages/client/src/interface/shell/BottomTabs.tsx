import { JSX, Show, createMemo, createSignal } from "solid-js";

import { Trans, useLingui } from "@lingui/solid/macro";
import { css } from "styled-system/css";
import { styled } from "styled-system/jsx";

import { useClient, useUser } from "@revolt/client";
import { useLocation, useNavigate, useSmartParams } from "@revolt/routing";
import { useState } from "@revolt/state";
import { Avatar, UserStatus } from "@revolt/ui";

import IconBell from "lucide-solid/icons/bell";
import IconHouse from "lucide-solid/icons/house";
import IconMessages from "lucide-solid/icons/messages-square";

import { UserMenu } from "../navigation/servers/UserMenu";

import { CommunitySwitcher } from "./CommunitySwitcher";
import { NotificationCenter, useNotificationCount } from "./NotificationCenter";
import {
  notificationsOpen,
  sectionFor,
  setNotificationsOpen,
} from "./shellState";

/**
 * Phone navigation: the top bar becomes a bottom tab bar
 */
export function BottomTabs() {
  const { t } = useLingui();
  const state = useState();
  const client = useClient();
  const user = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const params = useSmartParams();
  const count = useNotificationCount();

  const section = () => sectionFor(location.pathname);
  const activeServer = () =>
    params().serverId ? client().servers.get(params().serverId!) : undefined;

  const unreadConversations = createMemo(
    () =>
      state.ordering
        .orderedConversations(client())
        .filter((c) => c.unread && !state.notifications.isMuted(c)).length,
  );

  const [bell, setBell] = createSignal<HTMLButtonElement>();
  const [profile, setProfile] = createSignal<HTMLButtonElement>();

  /**
   * Go to a section and reveal its list (the sidebar)
   */
  function openSection(path: string, showList: boolean) {
    navigate(path);
    setTimeout(() => state.appDrawer()?.setShown(!showList), 0);
  }

  return (
    <Bar aria-label={t`Main navigation`}>
      <Tab
        type="button"
        data-active={section() === "home" || undefined}
        onClick={() => openSection("/app", false)}
      >
        <IconHouse size={20} />
        <Trans>Home</Trans>
      </Tab>
      <Tab
        type="button"
        data-active={section() === "conversations" || undefined}
        onClick={() => openSection("/conversations", true)}
      >
        <TabIcon
          icon={<IconMessages size={20} />}
          badge={unreadConversations()}
        />
        <Trans>Conversations</Trans>
      </Tab>
      <CommunitySwitcher active={activeServer()} tab />
      <Tab
        ref={setBell}
        type="button"
        aria-expanded={notificationsOpen()}
        onClick={() => setNotificationsOpen((v) => !v)}
      >
        <TabIcon icon={<IconBell size={20} />} badge={count()} />
        <Trans>Notifications</Trans>
      </Tab>
      <NotificationCenter anchor={bell} />
      <Tab ref={setProfile} type="button">
        <Avatar
          size={22}
          src={user()?.avatarURL}
          fallback={user()?.displayName}
          holepunch="bottom-right"
          overlay={<UserStatus.Graphic status={user()?.presence} />}
        />
        <Trans>You</Trans>
      </Tab>
      <UserMenu anchor={profile} placement="bottom-end" />
    </Bar>
  );
}

function TabIcon(props: { icon: JSX.Element; badge?: number }) {
  return (
    <span class={iconWrap}>
      {props.icon}
      <Show when={props.badge}>
        <span class={badge}>{props.badge! > 99 ? "99+" : props.badge}</span>
      </Show>
    </span>
  );
}

const Bar = styled("nav", {
  base: {
    display: "none",
    flexShrink: 0,
    height: "calc(56px + env(safe-area-inset-bottom, 0px))",
    paddingBottom: "env(safe-area-inset-bottom, 0px)",
    background: "var(--caps-bg-canvas)",
    borderTop: "1px solid var(--caps-line-soft)",
    zIndex: "var(--caps-z-topbar)",

    _phone: {
      display: "flex",
    },
  },
});

const Tab = styled("button", {
  base: {
    all: "unset",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "2px",
    fontSize: "10.5px",
    fontWeight: 500,
    color: "var(--caps-text-3)",
    cursor: "pointer",

    "&[data-active], &[aria-expanded=true]": {
      color: "var(--caps-text)",
    },
  },
});

const iconWrap = css({ position: "relative", display: "grid" });

const badge = css({
  position: "absolute",
  top: "-4px",
  right: "-8px",
  minWidth: "15px",
  height: "15px",
  paddingInline: "4px",
  borderRadius: "var(--caps-radius-full)",
  background: "var(--caps-mention)",
  color: "#1d1404",
  fontSize: "9.5px",
  fontWeight: 700,
  lineHeight: "15px",
  textAlign: "center",
});
