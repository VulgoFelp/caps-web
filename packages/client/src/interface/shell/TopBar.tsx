import { JSX, Show, createMemo, createSignal } from "solid-js";

import { Trans, useLingui } from "@lingui/solid/macro";
import { css, cva } from "styled-system/css";
import { styled } from "styled-system/jsx";

import { useClient, useUser } from "@revolt/client";
import { useModals } from "@revolt/modal";
import { useLocation, useSmartParams } from "@revolt/routing";
import { useState } from "@revolt/state";
import { LAYOUT_SECTIONS } from "@revolt/state/stores/Layout";
import { Avatar, CapsMark, UserStatus } from "@revolt/ui";

import { staffRole } from "@revolt/ui/components/features/profiles/StaffBadge";
import IconBell from "lucide-solid/icons/bell";
import IconPanel from "lucide-solid/icons/panel-left";
import IconRefresh from "lucide-solid/icons/refresh-cw";
import IconSearch from "lucide-solid/icons/search";
import IconSettings from "lucide-solid/icons/settings";
import IconShield from "lucide-solid/icons/shield";

import { pendingUpdate } from "../../serviceWorkerInterface";
import { UserMenu } from "../navigation/servers/UserMenu";

import { CommunitySwitcher } from "./CommunitySwitcher";
import { NotificationCenter, useNotificationCount } from "./NotificationCenter";
import {
  MOD_KEY,
  notificationsOpen,
  sectionFor,
  setNotificationsOpen,
  setPaletteOpen,
} from "./shellState";

/**
 * Global top navigation
 *
 * Brand, primary sections (Home, Conversations, Communities, Friends), the
 * community switcher, search (command palette), notifications and profile.
 */
export function TopBar() {
  const { t } = useLingui();
  const state = useState();
  const client = useClient();
  const user = useUser();
  const location = useLocation();
  const params = useSmartParams();
  const { openModal } = useModals();

  const section = () => sectionFor(location.pathname);
  const activeServer = () =>
    params().serverId ? client().servers.get(params().serverId!) : undefined;

  const unreadConversations = createMemo(
    () =>
      state.ordering
        .orderedConversations(client())
        .filter((c) => c.unread && !state.notifications.isMuted(c)).length,
  );

  const friendRequests = createMemo(
    () => client().users.filter((u) => u.relationship === "Incoming").length,
  );

  const notificationCount = useNotificationCount();

  const [profileAnchor, setProfileAnchor] = createSignal<HTMLButtonElement>();
  const [bellAnchor, setBellAnchor] = createSignal<HTMLButtonElement>();

  const sidebarOpen = () =>
    state.layout.getSectionState(LAYOUT_SECTIONS.PRIMARY_SIDEBAR, true);

  return (
    <Bar>
      <button
        class={iconAction()}
        type="button"
        onClick={() =>
          state.layout.toggleSectionState(LAYOUT_SECTIONS.PRIMARY_SIDEBAR, true)
        }
        aria-label={sidebarOpen() ? t`Hide sidebar` : t`Show sidebar`}
        aria-pressed={sidebarOpen()}
        use:floating={{
          tooltip: {
            placement: "bottom",
            content: `${sidebarOpen() ? t`Hide sidebar` : t`Show sidebar`} · ${MOD_KEY}+B`,
          },
        }}
      >
        <IconPanel size={18} />
      </button>

      <Brand href="/app" aria-label="CAPS">
        <CapsMark size={22} />
        <span>CAPS</span>
      </Brand>

      <Nav aria-label={t`Main navigation`}>
        <NavLink href="/app" active={section() === "home"}>
          <Trans>Home</Trans>
        </NavLink>
        <NavLink
          href={
            state.layout.getLastActivePath().startsWith("/channel/")
              ? state.layout.getLastActivePath()
              : "/conversations"
          }
          active={section() === "conversations"}
          badge={unreadConversations()}
        >
          <Trans>Conversations</Trans>
        </NavLink>
        <CommunitySwitcher active={activeServer()} />
        <NavLink
          href="/friends"
          active={section() === "friends"}
          badge={friendRequests()}
        >
          <Trans>Friends</Trans>
        </NavLink>
        <Show when={staffRole(user()?.badges)}>
          <NavLink href="/staff" active={section() === "staff"}>
            <IconShield size={14} />
            <Trans>Staff</Trans>
          </NavLink>
        </Show>
      </Nav>

      <Spacer />

      <Show when={pendingUpdate()}>
        <button
          type="button"
          class={updatePill}
          onClick={() => pendingUpdate()?.()}
          use:floating={{
            tooltip: {
              placement: "bottom",
              content: t`A new version of CAPS is ready. Click to reload.`,
            },
          }}
        >
          <IconRefresh size={14} />
          <Trans>Update CAPS</Trans>
        </button>
      </Show>

      <SearchButton
        type="button"
        onClick={() => setPaletteOpen(true)}
        aria-label={t`Search`}
      >
        <IconSearch size={15} />
        <span class={searchLabel}>
          <Trans>Search or jump to…</Trans>
        </span>
        <kbd class={kbd}>{MOD_KEY} K</kbd>
      </SearchButton>

      <button
        class={iconAction()}
        ref={setBellAnchor}
        type="button"
        aria-label={t`Notifications`}
        aria-expanded={notificationsOpen()}
        onClick={() => setNotificationsOpen((v) => !v)}
        use:floating={{
          tooltip: { placement: "bottom", content: t`Notifications` },
        }}
      >
        <IconBell size={18} />
        <Show when={notificationCount()}>
          <span class={bellBadge}>
            {notificationCount() > 99 ? "99+" : notificationCount()}
          </span>
        </Show>
      </button>
      <NotificationCenter anchor={bellAnchor} />

      <button
        class={iconAction()}
        type="button"
        aria-label={t`Settings`}
        onClick={() => openModal({ type: "settings", config: "user" })}
        use:floating={{
          tooltip: { placement: "bottom", content: t`Settings` },
        }}
      >
        <IconSettings size={18} />
      </button>

      <Profile ref={setProfileAnchor} type="button" aria-label={t`Profile`}>
        <Avatar
          size={28}
          src={user()?.avatarURL}
          fallback={user()?.displayName}
          holepunch="bottom-right"
          overlay={<UserStatus.Graphic status={user()?.presence} />}
        />
      </Profile>
      <UserMenu anchor={profileAnchor} placement="bottom-end" />
    </Bar>
  );
}

/**
 * Primary section link
 */
function NavLink(props: {
  href: string;
  active: boolean;
  badge?: number;
  children: JSX.Element;
}) {
  return (
    <a
      href={props.href}
      class={navLink}
      aria-current={props.active ? "page" : undefined}
    >
      {props.children}
      <Show when={props.badge}>
        <span class={navBadge}>{props.badge! > 99 ? "99+" : props.badge}</span>
      </Show>
    </a>
  );
}

const Bar = styled("header", {
  base: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    gap: "var(--caps-space-2)",
    height: "var(--caps-topbar-height)",
    paddingInline: "var(--caps-space-4) var(--caps-space-5)",
    background: "var(--caps-bg-canvas)",
    color: "var(--caps-text-2)",
    position: "relative",
    zIndex: "var(--caps-z-topbar)",

    _phone: {
      display: "none",
    },
  },
});

const Brand = styled("a", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "var(--caps-space-4)",
    height: "32px",
    paddingInline: "var(--caps-space-3) var(--caps-space-5)",
    marginInlineEnd: "var(--caps-space-3)",
    borderRadius: "var(--caps-radius-md)",
    color: "var(--caps-text)",
    fontSize: "15px",
    fontWeight: 700,
    letterSpacing: "-0.02em",
    textDecoration: "none",

    "&:focus-visible": { boxShadow: "var(--caps-focus-ring)" },
  },
});

const Nav = styled("nav", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "var(--caps-space-1)",
    minWidth: 0,
  },
});

const navLink = css({
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--caps-space-3)",
  height: "32px",
  paddingInline: "var(--caps-space-5)",
  borderRadius: "var(--caps-radius-md)",
  fontSize: "var(--caps-text-md)",
  fontWeight: 500,
  color: "var(--caps-text-2)",
  textDecoration: "none",
  whiteSpace: "nowrap",
  transition:
    "background var(--caps-dur-fast) var(--caps-ease), color var(--caps-dur-fast) var(--caps-ease)",

  "&:hover": {
    background: "var(--caps-hover)",
    color: "var(--caps-text)",
  },
  "&[aria-current=page]": {
    color: "var(--caps-text)",
    background: "var(--caps-bg-component)",
  },
  "&:focus-visible": { boxShadow: "var(--caps-focus-ring)" },
});

const navBadge = css({
  display: "inline-grid",
  placeItems: "center",
  minWidth: "17px",
  height: "17px",
  paddingInline: "5px",
  borderRadius: "var(--caps-radius-full)",
  background: "var(--caps-accent)",
  color: "var(--caps-on-accent)",
  fontSize: "10.5px",
  fontWeight: 700,
  fontVariantNumeric: "tabular-nums",
});

const Spacer = styled("div", { base: { flex: 1 } });

const SearchButton = styled("button", {
  base: {
    all: "unset",
    boxSizing: "border-box",
    display: "inline-flex",
    alignItems: "center",
    gap: "var(--caps-space-4)",
    width: "clamp(180px, 22vw, 300px)",
    height: "32px",
    paddingInline: "var(--caps-space-5) var(--caps-space-3)",
    marginInlineEnd: "var(--caps-space-4)",
    borderRadius: "var(--caps-radius-md)",
    background: "var(--caps-bg-surface)",
    boxShadow: "inset 0 0 0 1px var(--caps-line-soft)",
    color: "var(--caps-text-3)",
    fontSize: "var(--caps-text-md)",
    cursor: "pointer",
    transition: "box-shadow var(--caps-dur-fast) var(--caps-ease)",

    "&:hover": {
      boxShadow: "inset 0 0 0 1px var(--caps-line)",
      color: "var(--caps-text-2)",
    },
    "&:focus-visible": { boxShadow: "var(--caps-focus-ring)" },

    _tablet: {
      width: "32px",
      paddingInline: "0",
      justifyContent: "center",
      background: "transparent",
      boxShadow: "none",
    },
  },
});

const searchLabel = css({
  flex: 1,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  _tablet: { display: "none" },
});

const kbd = css({
  fontFamily: "var(--caps-font-sans)",
  fontSize: "11px",
  fontWeight: 500,
  color: "var(--caps-text-3)",
  paddingInline: "5px",
  height: "20px",
  lineHeight: "20px",
  borderRadius: "var(--caps-radius-xs)",
  background: "var(--caps-bg-component)",
  _tablet: { display: "none" },
});

const iconAction = cva({
  base: {
    all: "unset",
    boxSizing: "border-box",
    position: "relative",
    display: "grid",
    placeItems: "center",
    width: "32px",
    height: "32px",
    borderRadius: "var(--caps-radius-md)",
    color: "var(--caps-text-2)",
    cursor: "pointer",
    transition:
      "background var(--caps-dur-fast) var(--caps-ease), color var(--caps-dur-fast) var(--caps-ease)",

    "&:hover, &[aria-expanded=true]": {
      background: "var(--caps-hover)",
      color: "var(--caps-text)",
    },
    "&:active": { transform: "scale(0.96)" },
    "&:focus-visible": { boxShadow: "var(--caps-focus-ring)" },
  },
});

const bellBadge = css({
  position: "absolute",
  top: "2px",
  right: "1px",
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
  boxShadow: "0 0 0 2px var(--caps-bg-canvas)",
});

const Profile = styled("button", {
  base: {
    all: "unset",
    display: "grid",
    placeItems: "center",
    width: "36px",
    height: "36px",
    marginInlineStart: "var(--caps-space-2)",
    borderRadius: "var(--caps-radius-full)",
    cursor: "pointer",

    "&:focus-visible": { boxShadow: "var(--caps-focus-ring)" },
  },
});

const updatePill = css({
  all: "unset",
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--caps-space-3)",
  height: "28px",
  paddingInline: "var(--caps-space-5)",
  marginInlineEnd: "var(--caps-space-4)",
  borderRadius: "var(--caps-radius-full)",
  background: "var(--caps-accent-soft)",
  boxShadow: "inset 0 0 0 1px var(--caps-accent-line)",
  color: "var(--caps-accent-text)",
  fontSize: "var(--caps-text-sm)",
  fontWeight: 600,
  cursor: "pointer",
  animation: "capsPopIn 200ms var(--caps-ease-out)",
  "&:hover": {
    background: "var(--caps-accent)",
    color: "var(--caps-on-accent)",
  },
  "&:focus-visible": { boxShadow: "var(--caps-focus-ring)" },
});
