import {
  For,
  JSX,
  Show,
  createEffect,
  createMemo,
  createSignal,
  on,
} from "solid-js";
import { Portal } from "solid-js/web";

import { Trans, useLingui } from "@lingui/solid/macro";
import { css } from "styled-system/css";
import { styled } from "styled-system/jsx";

import { useClient, useUser } from "@revolt/client";
import { useModals } from "@revolt/modal";
import { useNavigate, useSmartParams } from "@revolt/routing";
import { useVoice } from "@revolt/rtc";
import { useState } from "@revolt/state";
import { LAYOUT_SECTIONS } from "@revolt/state/stores/Layout";
import { Avatar } from "@revolt/ui";

import IconAt from "lucide-solid/icons/at-sign";
import IconBell from "lucide-solid/icons/bell";
import IconHash from "lucide-solid/icons/hash";
import IconHeadphoneOff from "lucide-solid/icons/headphone-off";
import IconHeadset from "lucide-solid/icons/headset";
import IconHouse from "lucide-solid/icons/house";
import IconLogIn from "lucide-solid/icons/log-in";
import IconMessages from "lucide-solid/icons/messages-square";
import IconMic from "lucide-solid/icons/mic";
import IconMoon from "lucide-solid/icons/moon";
import IconPanel from "lucide-solid/icons/panel-left";
import IconPhoneOff from "lucide-solid/icons/phone-off";
import IconPin from "lucide-solid/icons/pin";
import IconPlus from "lucide-solid/icons/plus";
import IconSearch from "lucide-solid/icons/search";
import IconSettings from "lucide-solid/icons/settings";
import IconSun from "lucide-solid/icons/sun";
import IconUserPlus from "lucide-solid/icons/user-plus";
import IconUsers from "lucide-solid/icons/users";

import {
  MOD_KEY,
  paletteOpen,
  setNotificationsOpen,
  setPaletteOpen,
  setPanelRequest,
} from "./shellState";

type Item = {
  id: string;
  group: string;
  label: string;
  hint?: string;
  keywords?: string;
  icon: JSX.Element;
  shortcut?: string;
  run: () => void;
};

const RECENT_KEY = "caps:palette-recent";

function loadRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveRecent(id: string) {
  try {
    const list = [id, ...loadRecent().filter((x) => x !== id)].slice(0, 6);
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  } catch {
    // storage unavailable
  }
}

/**
 * Normalise text for matching (case and accents)
 */
const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/**
 * Match score: prefix > word prefix > substring > subsequence
 */
function score(item: Item, query: string) {
  const label = norm(item.label);
  const hay = `${label} ${norm(item.hint ?? "")} ${norm(item.keywords ?? "")}`;
  if (label.startsWith(query)) return 100 - label.length / 100;
  if (label.split(/[\s#·-]+/).some((w) => w.startsWith(query))) return 80;
  if (hay.includes(query)) return 60;
  let i = 0;
  for (const ch of label) if (ch === query[i]) i++;
  return i === query.length ? 30 : 0;
}

/**
 * Command palette (Ctrl/⌘+K)
 *
 * Jump to any community, channel, conversation or friend that is loaded,
 * and run common actions. Message search runs in the current channel.
 */
export function CommandPalette() {
  const { t } = useLingui();
  const state = useState();
  const client = useClient();
  const user = useUser();
  const navigate = useNavigate();
  const params = useSmartParams();
  const voice = useVoice();
  const { openModal } = useModals();

  const [query, setQuery] = createSignal("");
  const [cursor, setCursor] = createSignal(0);
  let listRef!: HTMLDivElement;

  createEffect(
    on(paletteOpen, (open) => {
      if (open) {
        setQuery("");
        setCursor(0);
        setNotificationsOpen(false);
      }
    }),
  );

  const close = () => setPaletteOpen(false);

  const currentChannel = () =>
    params().channelId ? client().channels.get(params().channelId!) : undefined;

  const items = createMemo<Item[]>(() => {
    if (!paletteOpen()) return [];
    const c = client();
    const out: Item[] = [];
    const go = (path: string) => () => navigate(path);

    // navigation
    out.push(
      {
        id: "nav:home",
        group: t`Go to`,
        label: t`Home`,
        icon: <IconHouse size={16} />,
        run: go("/app"),
      },
      {
        id: "nav:conversations",
        group: t`Go to`,
        label: t`Conversations`,
        icon: <IconMessages size={16} />,
        run: go("/conversations"),
      },
      {
        id: "nav:friends",
        group: t`Go to`,
        label: t`Friends`,
        icon: <IconUsers size={16} />,
        run: go("/friends"),
      },
    );

    // communities and their channels
    for (const server of state.ordering.orderedServers(c)) {
      out.push({
        id: `server:${server.id}`,
        group: t`Communities`,
        label: server.name,
        keywords: "comunidade servidor",
        icon: (
          <Avatar
            size={20}
            shape="rounded-square"
            src={server.iconURL}
            fallback={server.name}
          />
        ),
        run: go(state.layout.getLastActiveServerPath(server.id)),
      });
      for (const channel of server.channels) {
        out.push({
          id: `channel:${channel.id}`,
          group: t`Channels`,
          label: channel.name,
          hint: server.name,
          keywords: channel.isVoice ? "voz voice" : "texto",
          icon: channel.isVoice ? (
            <IconHeadset size={16} />
          ) : (
            <IconHash size={16} />
          ),
          run: go(`/server/${server.id}/channel/${channel.id}`),
        });
      }
    }

    // conversations
    for (const channel of state.ordering.orderedConversations(c)) {
      out.push({
        id: `dm:${channel.id}`,
        group: t`Conversations`,
        label: channel.displayName ?? "",
        hint: channel.type === "Group" ? t`Group` : t`Direct message`,
        icon: (
          <Avatar
            size={20}
            src={channel.iconURL ?? channel.recipient?.avatarURL}
            fallback={channel.displayName}
          />
        ),
        run: go(channel.path),
      });
    }

    // friends (open a DM)
    for (const friend of c.users.filter((u) => u.relationship === "Friend")) {
      out.push({
        id: `friend:${friend.id}`,
        group: t`Friends`,
        label: friend.displayName,
        hint: `${friend.username}#${friend.discriminator}`,
        icon: (
          <Avatar
            size={20}
            src={friend.avatarURL}
            fallback={friend.displayName}
          />
        ),
        run: () => friend.openDM().then((ch) => navigate(ch.path)),
      });
    }

    // actions
    const channel = currentChannel();
    if (channel) {
      if (query().trim()) {
        out.push({
          id: "action:search",
          group: t`Actions`,
          label: t`Search messages for "${query().trim()}"`,
          hint: channel.displayName ?? channel.name,
          icon: <IconSearch size={16} />,
          run: () =>
            setPanelRequest({
              channelId: channel.id,
              state: "search",
              query: query().trim(),
            }),
        });
      }
      out.push({
        id: "action:pins",
        group: t`Actions`,
        label: t`Pinned messages`,
        hint: channel.displayName ?? channel.name,
        icon: <IconPin size={16} />,
        run: () => setPanelRequest({ channelId: channel.id, state: "pins" }),
      });
      if (channel.isVoice && voice.channel()?.id !== channel.id) {
        out.push({
          id: "action:join-voice",
          group: t`Voice`,
          label: t`Join voice`,
          hint: channel.displayName ?? channel.name,
          icon: <IconLogIn size={16} />,
          run: () => voice.connect(channel),
        });
      }
    }

    if (voice.channel()) {
      out.push(
        {
          id: "voice:mute",
          group: t`Voice`,
          label: voice.microphone() ? t`Mute microphone` : t`Unmute microphone`,
          icon: <IconMic size={16} />,
          shortcut: `${MOD_KEY} ⇧ M`,
          run: () => voice.toggleMute(),
        },
        {
          id: "voice:deafen",
          group: t`Voice`,
          label: voice.deafen() ? t`Undeafen` : t`Deafen`,
          icon: <IconHeadphoneOff size={16} />,
          shortcut: `${MOD_KEY} ⇧ D`,
          run: () => voice.toggleDeafen(),
        },
        {
          id: "voice:leave",
          group: t`Voice`,
          label: t`Leave call`,
          icon: <IconPhoneOff size={16} />,
          run: () => voice.disconnect(),
        },
      );
    }

    out.push(
      {
        id: "action:create-community",
        group: t`Actions`,
        label: t`Create or join a community`,
        icon: <IconPlus size={16} />,
        run: () => openModal({ type: "create_or_join_server", client: c }),
      },
      {
        id: "action:add-friend",
        group: t`Actions`,
        label: t`Add friend`,
        icon: <IconUserPlus size={16} />,
        run: () => openModal({ type: "add_friend", client: c }),
      },
      {
        id: "action:new-group",
        group: t`Actions`,
        label: t`New group`,
        icon: <IconUsers size={16} />,
        run: () => openModal({ type: "create_group", client: c }),
      },
      {
        id: "action:status",
        group: t`Actions`,
        label: t`Set custom status`,
        icon: <IconAt size={16} />,
        run: () => openModal({ type: "custom_status", client: c }),
      },
      {
        id: "action:settings",
        group: t`Actions`,
        label: t`Open settings`,
        icon: <IconSettings size={16} />,
        run: () => openModal({ type: "settings", config: "user" }),
      },
      {
        id: "action:notifications",
        group: t`Actions`,
        label: t`Open notifications`,
        icon: <IconBell size={16} />,
        run: () => setNotificationsOpen(true),
      },
      {
        id: "action:sidebar",
        group: t`Actions`,
        label: t`Toggle sidebar`,
        icon: <IconPanel size={16} />,
        shortcut: `${MOD_KEY} B`,
        run: () =>
          state.layout.toggleSectionState(
            LAYOUT_SECTIONS.PRIMARY_SIDEBAR,
            true,
          ),
      },
      {
        id: "action:theme",
        group: t`Actions`,
        label: state.theme.activeTheme.darkMode
          ? t`Switch to light theme`
          : t`Switch to dark theme`,
        icon: state.theme.activeTheme.darkMode ? (
          <IconSun size={16} />
        ) : (
          <IconMoon size={16} />
        ),
        run: () =>
          state.theme.setMode(
            state.theme.activeTheme.darkMode ? "light" : "dark",
          ),
      },
    );

    for (const [presence, label] of [
      ["Online", t`Online`],
      ["Idle", t`Idle`],
      ["Focus", t`Focus`],
      ["Busy", t`Do Not Disturb`],
      ["Invisible", t`Invisible`],
    ] as const) {
      out.push({
        id: `presence:${presence}`,
        group: t`Status`,
        label: t`Set status: ${label}`,
        keywords: "presença status",
        icon: <span class={presenceDot} data-presence={presence} />,
        run: () => user()?.edit({ status: { presence } }),
      });
    }

    return out;
  });

  /**
   * Visible list: recents when empty, otherwise ranked matches
   */
  const visible = createMemo<Item[]>(() => {
    const q = norm(query().trim());
    const all = items();
    if (!q) {
      const recent = loadRecent()
        .map((id) => all.find((i) => i.id === id))
        .filter(Boolean)
        .map((i) => ({ ...i!, group: t`Recent` }));
      const defaults = all.filter(
        (i) =>
          i.group === t`Go to` ||
          i.group === t`Actions` ||
          i.group === t`Voice`,
      );
      return [...recent, ...defaults].slice(0, 14);
    }
    return (
      all
        .map((item) => ({ item, s: score(item, q) }))
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s)
        .slice(0, 40)
        .map((x) => x.item)
        // keep groups together, in order of their best match
        .sort((a, b) => {
          const order = (g: string) =>
            [t`Actions`, t`Voice`].includes(g) && !g.startsWith(t`Search`)
              ? 1
              : 0;
          return order(a.group) - order(b.group);
        })
    );
  });

  function run(item?: Item) {
    if (!item) return;
    saveRecent(item.id);
    close();
    item.run();
  }

  function onKeyDown(e: KeyboardEvent) {
    const list = visible();
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => (c + 1) % Math.max(1, list.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => (c - 1 + list.length) % Math.max(1, list.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(list[cursor()]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      close();
    }
  }

  createEffect(
    on(cursor, (c) => {
      listRef
        ?.querySelector(`[data-index="${c}"]`)
        ?.scrollIntoView({ block: "nearest" });
    }),
  );

  return (
    <Show when={paletteOpen()}>
      <Portal mount={document.getElementById("floating")!}>
        <Scrim onPointerDown={(e) => e.target === e.currentTarget && close()}>
          <Panel
            role="dialog"
            aria-modal="true"
            aria-label={t`Command palette`}
          >
            <InputRow>
              <IconSearch size={18} />
              <input
                ref={(el) => setTimeout(() => el.focus(), 0)}
                value={query()}
                onInput={(e) => {
                  setQuery(e.currentTarget.value);
                  setCursor(0);
                }}
                onKeyDown={onKeyDown}
                placeholder={t`Search communities, channels, people and actions…`}
                aria-label={t`Search`}
                aria-controls="caps-palette-list"
                aria-activedescendant={`caps-palette-${cursor()}`}
                role="combobox"
                aria-expanded="true"
              />
              <kbd class={kbd}>Esc</kbd>
            </InputRow>

            <List ref={listRef} id="caps-palette-list" role="listbox">
              <Show
                when={visible().length}
                fallback={
                  <Empty>
                    <Trans>Nothing found for "{query()}"</Trans>
                  </Empty>
                }
              >
                <For each={visible()}>
                  {(item, i) => (
                    <>
                      <Show
                        when={
                          i() === 0 || visible()[i() - 1].group !== item.group
                        }
                      >
                        <Group>{item.group}</Group>
                      </Show>
                      <Row
                        id={`caps-palette-${i()}`}
                        data-index={i()}
                        role="option"
                        aria-selected={cursor() === i()}
                        onPointerMove={() => setCursor(i())}
                        onClick={() => run(item)}
                      >
                        <span class={rowIcon}>{item.icon}</span>
                        <span class={rowLabel}>{item.label}</span>
                        <Show when={item.hint}>
                          <span class={rowHint}>{item.hint}</span>
                        </Show>
                        <Show when={item.shortcut}>
                          <kbd class={kbd}>{item.shortcut}</kbd>
                        </Show>
                      </Row>
                    </>
                  )}
                </For>
              </Show>
            </List>

            <Footer>
              <span>
                <kbd class={kbd}>↑</kbd>
                <kbd class={kbd}>↓</kbd>
                <Trans>navigate</Trans>
              </span>
              <span>
                <kbd class={kbd}>↵</kbd>
                <Trans>open</Trans>
              </span>
              <span class={footerRight}>
                <kbd class={kbd}>{MOD_KEY} K</kbd>
                <Trans>anywhere</Trans>
              </span>
            </Footer>
          </Panel>
        </Scrim>
      </Portal>
    </Show>
  );
}

const Scrim = styled("div", {
  base: {
    position: "fixed",
    inset: 0,
    zIndex: "var(--caps-z-modal)",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingTop: "min(14vh, 120px)",
    paddingInline: "var(--caps-space-6)",
    background: "var(--caps-scrim)",
    animation: "authHintIn 120ms var(--caps-ease-out)",
  },
});

const Panel = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    width: "min(640px, 100%)",
    maxHeight: "min(560px, 76vh)",
    overflow: "hidden",
    background: "var(--caps-bg-overlay)",
    borderRadius: "var(--caps-radius-xl)",
    boxShadow: "var(--caps-shadow-modal)",
    animation: "capsPopIn 160ms var(--caps-ease-out)",
  },
});

const InputRow = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "var(--caps-space-5)",
    height: "56px",
    paddingInline: "var(--caps-space-7) var(--caps-space-5)",
    borderBottom: "1px solid var(--caps-line-soft)",
    color: "var(--caps-text-3)",
    flexShrink: 0,

    "& input": {
      all: "unset",
      flex: 1,
      minWidth: 0,
      fontSize: "var(--caps-text-lg)",
      color: "var(--caps-text)",
    },
    "& input::placeholder": { color: "var(--caps-text-3)" },
  },
});

const List = styled("div", {
  base: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    padding: "var(--caps-space-3)",
  },
});

const Group = styled("div", {
  base: {
    padding: "var(--caps-space-5) var(--caps-space-5) var(--caps-space-2)",
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "var(--caps-text-3)",
  },
});

const Row = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "var(--caps-space-5)",
    height: "40px",
    paddingInline: "var(--caps-space-5)",
    borderRadius: "var(--caps-radius-md)",
    color: "var(--caps-text-2)",
    cursor: "pointer",
    userSelect: "none",

    "&[aria-selected=true]": {
      background: "var(--caps-selected)",
      color: "var(--caps-text)",
      boxShadow: "inset 2px 0 0 var(--caps-accent)",
    },
  },
});

const rowIcon = css({
  display: "grid",
  placeItems: "center",
  width: "22px",
  flexShrink: 0,
  color: "var(--caps-text-3)",
});

const rowLabel = css({
  flex: 1,
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontSize: "var(--caps-text-base)",
});

const rowHint = css({
  flexShrink: 0,
  maxWidth: "40%",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontSize: "var(--caps-text-sm)",
  color: "var(--caps-text-3)",
});

const kbd = css({
  display: "inline-grid",
  placeItems: "center",
  minWidth: "20px",
  height: "20px",
  paddingInline: "5px",
  borderRadius: "var(--caps-radius-xs)",
  background: "var(--caps-bg-component)",
  fontFamily: "var(--caps-font-sans)",
  fontSize: "11px",
  fontWeight: 500,
  color: "var(--caps-text-2)",
});

const presenceDot = css({
  width: "10px",
  height: "10px",
  borderRadius: "var(--caps-radius-full)",
  '&[data-presence="Online"]': { background: "var(--caps-presence-online)" },
  '&[data-presence="Idle"]': { background: "var(--caps-presence-idle)" },
  '&[data-presence="Focus"]': { background: "var(--caps-presence-focus)" },
  '&[data-presence="Busy"]': { background: "var(--caps-presence-busy)" },
  '&[data-presence="Invisible"]': {
    boxShadow: "inset 0 0 0 2px var(--caps-presence-offline)",
  },
});

const Footer = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "var(--caps-space-7)",
    height: "40px",
    paddingInline: "var(--caps-space-6)",
    borderTop: "1px solid var(--caps-line-soft)",
    fontSize: "var(--caps-text-sm)",
    color: "var(--caps-text-3)",
    flexShrink: 0,

    "& > span": {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--caps-space-2)",
    },

    _phone: { display: "none" },
  },
});

const footerRight = css({ marginInlineStart: "auto" });

const Empty = styled("div", {
  base: {
    padding: "var(--caps-space-9) var(--caps-space-6)",
    textAlign: "center",
    fontSize: "var(--caps-text-md)",
    color: "var(--caps-text-3)",
  },
});
