import { createMemo, createSignal, For, Match, Show, Switch } from "solid-js";
import { Portal } from "solid-js/web";

import { Trans, useLingui } from "@lingui/solid/macro";
import { Server } from "stoat.js";
import { css, cva } from "styled-system/css";
import { styled } from "styled-system/jsx";

import { ServerContextMenu } from "@revolt/app";
import { ServerFolderContextMenu } from "@revolt/app/menus/ServerFolderContextMenu";
import { useClient } from "@revolt/client";
import { useDevice } from "@revolt/common";
import { useInstance } from "@revolt/instance";
import { useModals } from "@revolt/modal";
import { useNavigate } from "@revolt/routing";
import { ResolvedEntry, useState } from "@revolt/state";
import { Avatar, Popover } from "@revolt/ui";

import IconMute from "lucide-solid/icons/bell-off";
import IconCheck from "lucide-solid/icons/check";
import IconChevronDown from "lucide-solid/icons/chevron-down";
import IconChevronRight from "lucide-solid/icons/chevron-right";
import IconCompass from "lucide-solid/icons/compass";
import IconFolder from "lucide-solid/icons/folder";
import IconGrid from "lucide-solid/icons/layout-grid";
import IconPlus from "lucide-solid/icons/plus";
import IconSearch from "lucide-solid/icons/search";
import IconVolume from "lucide-solid/icons/volume-2";

import { createRailDrag, RailEntry } from "../navigation/servers/railDrag";

import { useCommunityBadges, useCommunityOrdering } from "./communityState";

/**
 * Community switcher: the top bar entry that replaces the server rail
 *
 * Lists communities and folders in the user's order, with unread/mention
 * badges, voice activity and mute state. Supports search, keyboard
 * navigation, reordering by drag (drop onto another community to make a
 * folder), context menus, and creating/joining communities.
 */
export function CommunitySwitcher(props: {
  /**
   * Currently open community
   */
  active?: Server;
  /**
   * Render the trigger as a bottom tab (phone layout)
   */
  tab?: boolean;
}) {
  const { t } = useLingui();
  const state = useState();
  const client = useClient();
  const navigate = useNavigate();
  const instance = useInstance();
  const { openModal } = useModals();
  const { isMobile, hasCoarsePointer } = useDevice();
  const badges = useCommunityBadges();
  const ordering = useCommunityOrdering();

  const [open, setOpen] = createSignal(false);
  const [anchor, setAnchor] = createSignal<HTMLButtonElement>();
  const [query, setQuery] = createSignal("");
  const [cursor, setCursor] = createSignal(0);
  let list!: HTMLDivElement;

  const servers = () => state.ordering.orderedServers(client());

  // aggregated badge for the trigger (communities other than the open one)
  const totalMentions = createMemo(() =>
    servers().reduce((n, s) => n + badges.mentions(s), 0),
  );
  const anyUnread = createMemo(() =>
    servers().some((s) => s.id !== props.active?.id && badges.unread(s)),
  );

  const results = createMemo(() => {
    const q = query().trim().toLowerCase();
    if (!q) return [];
    return servers().filter((s) => s.name.toLowerCase().includes(q));
  });

  function go(server: Server) {
    setOpen(false);
    setQuery("");
    navigate(state.layout.getLastActiveServerPath(server.id));
  }

  function createOrJoin() {
    setOpen(false);
    openModal({ type: "create_or_join_server", client: client() });
  }

  function onSearchKey(e: KeyboardEvent) {
    const items = query() ? results() : servers();
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(items.length - 1, c + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(0, c - 1));
    } else if (e.key === "Enter") {
      const target = items[cursor()];
      if (target) go(target);
    }
  }

  const drag = createRailDrag({
    entries: (): RailEntry[] =>
      ordering.entries().flatMap<RailEntry>((entry) =>
        entry.type === "folder"
          ? [
              { id: entry.id, kind: "folder" as const },
              ...(entry.folder.collapsed
                ? []
                : entry.servers.map((server) => ({
                    id: server.id,
                    kind: "server" as const,
                    parent: entry.id,
                  }))),
            ]
          : [{ id: entry.id, kind: "server" as const }],
      ),
    container: () => list,
    label: (id) => {
      for (const entry of ordering.entries()) {
        if (entry.id === id)
          return entry.type === "folder"
            ? entry.folder.name || t`Folder`
            : entry.server.name;
        if (entry.type !== "folder") continue;
        const member = entry.servers.find((server) => server.id === id);
        if (member) return member.name;
      }
    },
    disabled: () => isMobile || hasCoarsePointer || !!query(),
    onFold: ordering.fold,
    onMove: ordering.place,
  });

  const flatIndex = (server: Server) => servers().indexOf(server);

  const dragLabel = () => {
    const id = drag.dragging();
    if (!id) return "";
    const server = servers().find((s) => s.id === id);
    if (server) return server.name;
    const folder = ordering.entries().find((e) => e.id === id);
    return folder?.type === "folder" ? folder.folder.name || t`Folder` : "";
  };

  return (
    <>
      <Show
        when={props.tab}
        fallback={
          <Trigger
            ref={setAnchor}
            type="button"
            aria-haspopup="dialog"
            aria-expanded={open()}
            data-active={!!props.active || undefined}
            onClick={() => {
              setCursor(
                Math.max(0, props.active ? flatIndex(props.active) : 0),
              );
              setOpen((v) => !v);
            }}
          >
            <Show
              when={props.active}
              fallback={
                <span class={triggerLabel}>
                  <Trans>Communities</Trans>
                </span>
              }
            >
              {(server) => (
                <>
                  <Avatar
                    size={20}
                    shape="rounded-square"
                    src={server().iconURL}
                    fallback={server().name}
                  />
                  <span class={triggerLabel}>{server().name}</span>
                </>
              )}
            </Show>
            <Show when={totalMentions() || anyUnread()}>
              <Show
                when={totalMentions()}
                fallback={<span class={dot} aria-label={t`Unread`} />}
              >
                <span class={countBadge}>
                  {totalMentions() > 99 ? "99+" : totalMentions()}
                </span>
              </Show>
            </Show>
            <IconChevronDown size={14} class={chevron} />
          </Trigger>
        }
      >
        <TabTrigger
          ref={setAnchor}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open()}
          data-active={!!props.active || undefined}
          onClick={() => setOpen((v) => !v)}
        >
          <span class={tabIcon}>
            <IconGrid size={20} />
            <Show when={totalMentions()}>
              <span class={tabBadge}>{totalMentions()}</span>
            </Show>
          </span>
          <Trans>Communities</Trans>
        </TabTrigger>
      </Show>

      <Popover
        anchor={anchor}
        open={open()}
        onClose={() => {
          setOpen(false);
          setQuery("");
        }}
        width={340}
        placement={props.tab ? "top" : "bottom-start"}
        label={t`Communities`}
      >
        <SearchRow>
          <IconSearch size={15} />
          <input
            ref={(el) => setTimeout(() => el.focus(), 0)}
            value={query()}
            onInput={(e) => {
              setQuery(e.currentTarget.value);
              setCursor(0);
            }}
            onKeyDown={onSearchKey}
            placeholder={t`Find a community`}
            aria-label={t`Find a community`}
          />
        </SearchRow>

        <ListArea ref={list} role="listbox" aria-label={t`Communities`}>
          <Switch>
            <Match when={query()}>
              <For
                each={results()}
                fallback={
                  <Empty>
                    <Trans>No communities match your search.</Trans>
                  </Empty>
                }
              >
                {(server, i) => (
                  <CommunityRow
                    server={server}
                    active={server.id === props.active?.id}
                    focused={cursor() === i()}
                    onSelect={() => go(server)}
                  />
                )}
              </For>
            </Match>
            <Match when={servers().length === 0}>
              <Empty>
                <Trans>You haven't joined any communities yet.</Trans>
              </Empty>
            </Match>
            <Match when>
              <For each={ordering.entries()}>
                {(entry) => (
                  <Switch>
                    <Match when={entry.type === "server" && entry}>
                      {(item) => (
                        <CommunityRow
                          server={item().server}
                          active={item().server.id === props.active?.id}
                          focused={cursor() === flatIndex(item().server)}
                          onSelect={() => go(item().server)}
                          drag={drag}
                        />
                      )}
                    </Match>
                    <Match when={entry.type === "folder" && entry}>
                      {(item) => (
                        <FolderRows
                          entry={
                            item() as Extract<ResolvedEntry, { type: "folder" }>
                          }
                          activeId={props.active?.id}
                          cursor={cursor()}
                          flatIndex={flatIndex}
                          onSelect={go}
                          drag={drag}
                        />
                      )}
                    </Match>
                  </Switch>
                )}
              </For>
              <Show
                when={
                  drag.intent()?.type === "move" &&
                  (drag.intent() as { before?: string }).before === undefined
                }
              >
                <div class={insertion} />
              </Show>
            </Match>
          </Switch>
        </ListArea>

        <div aria-live="polite" class={srOnly}>
          {drag.status()}
        </div>

        <Footer>
          <FooterButton type="button" onClick={createOrJoin}>
            <IconPlus size={16} />
            <Trans>Create or join</Trans>
          </FooterButton>
          <Show when={instance.isStoat}>
            <FooterButton
              type="button"
              onClick={() => {
                setOpen(false);
                navigate(state.layout.getLastActiveDiscoverPath());
              }}
            >
              <IconCompass size={16} />
              <Trans>Explore</Trans>
            </FooterButton>
          </Show>
        </Footer>
      </Popover>

      <Show when={drag.pointer() && drag.dragging()}>
        <Portal mount={document.getElementById("floating")!}>
          <div
            class={ghost}
            style={{
              left: `${(drag.pointer()?.x ?? 0) + 8}px`,
              top: `${(drag.pointer()?.y ?? 0) - 14}px`,
            }}
          >
            {dragLabel()}
          </div>
        </Portal>
      </Show>
    </>
  );
}

type Drag = ReturnType<typeof createRailDrag>;

/**
 * One community in the list
 */
function CommunityRow(props: {
  server: Server;
  active: boolean;
  focused: boolean;
  onSelect: () => void;
  drag?: Drag;
  nested?: boolean;
}) {
  const badges = useCommunityBadges();
  const mentions = () => badges.mentions(props.server);
  const intent = () => props.drag?.intent();

  return (
    <>
      <Show
        when={
          intent()?.type === "move" &&
          (intent() as { before?: string }).before === props.server.id
        }
      >
        <div class={insertion} />
      </Show>
      <div
        class={row({ nested: props.nested })}
        ref={(el) => props.drag?.register(props.server.id, el)}
        role="option"
        aria-selected={props.active}
        tabIndex={-1}
        data-focused={props.focused || undefined}
        data-active={props.active || undefined}
        data-fold-target={
          (intent()?.type === "fold" &&
            (intent() as { target: string }).target === props.server.id) ||
          undefined
        }
        data-dragging={props.drag?.dragging() === props.server.id || undefined}
        onPointerDown={(e) => props.drag?.press(props.server.id, e)}
        onKeyDown={(e) => props.drag?.keys(props.server.id, e)}
        onClick={() => props.onSelect()}
        use:floating={{
          contextMenu: () => <ServerContextMenu server={props.server} />,
        }}
      >
        <Avatar
          size={28}
          shape="rounded-square"
          src={props.server.iconURL}
          fallback={props.server.name}
        />
        <span
          class={rowName}
          data-unread={badges.unread(props.server) || undefined}
        >
          {props.server.name}
        </span>
        <span class={rowMeta}>
          <Show when={props.server.voiceStatus !== "none"}>
            <IconVolume size={14} class={voiceIcon} aria-label="Voz ativa" />
          </Show>
          <Show when={badges.muted(props.server)}>
            <IconMute size={14} aria-label="Silenciada" />
          </Show>
          <Show
            when={mentions()}
            fallback={
              <Show when={badges.unread(props.server)}>
                <span class={dot} />
              </Show>
            }
          >
            <span class={countBadge}>
              {mentions() > 99 ? "99+" : mentions()}
            </span>
          </Show>
          <Show when={props.active}>
            <IconCheck size={15} class={checkIcon} />
          </Show>
        </span>
      </div>
    </>
  );
}

/**
 * A folder with its members (collapsible inline)
 */
function FolderRows(props: {
  entry: Extract<ResolvedEntry, { type: "folder" }>;
  activeId?: string;
  cursor: number;
  flatIndex: (s: Server) => number;
  onSelect: (s: Server) => void;
  drag: Drag;
}) {
  const state = useState();
  const badges = useCommunityBadges();
  const collapsed = () => props.entry.folder.collapsed;
  const mentions = () =>
    props.entry.servers.reduce((n, s) => n + badges.mentions(s), 0);
  const unread = () => props.entry.servers.some((s) => badges.unread(s));
  const intent = () => props.drag.intent();

  return (
    <>
      <Show
        when={
          intent()?.type === "move" &&
          (intent() as { before?: string }).before === props.entry.id
        }
      >
        <div class={insertion} />
      </Show>
      <div
        class={row()}
        ref={(el) => props.drag.register(props.entry.id, el)}
        role="option"
        aria-expanded={!collapsed()}
        tabIndex={-1}
        data-fold-target={
          (intent()?.type === "fold" &&
            (intent() as { target: string }).target === props.entry.id) ||
          undefined
        }
        onPointerDown={(e) => props.drag.press(props.entry.id, e)}
        onKeyDown={(e) => props.drag.keys(props.entry.id, e)}
        onClick={() => state.ordering.toggleFolder(props.entry.folder.id)}
        use:floating={{
          contextMenu: () => (
            <ServerFolderContextMenu folder={props.entry.folder} />
          ),
        }}
      >
        <span
          class={folderIcon}
          style={{
            color: props.entry.folder.colour ?? "var(--caps-text-2)",
          }}
        >
          <IconFolder size={16} />
        </span>
        <span class={rowName}>
          {props.entry.folder.name || <Trans>Folder</Trans>}
        </span>
        <span class={rowMeta}>
          <Show when={collapsed()}>
            <Show
              when={mentions()}
              fallback={
                <Show when={unread()}>
                  <span class={dot} />
                </Show>
              }
            >
              <span class={countBadge}>{mentions()}</span>
            </Show>
          </Show>
          <IconChevronRight
            size={15}
            style={{
              transform: collapsed() ? "none" : "rotate(90deg)",
              transition: "transform var(--caps-dur) var(--caps-ease)",
            }}
          />
        </span>
      </div>
      <Show when={!collapsed()}>
        <For each={props.entry.servers}>
          {(server) => (
            <CommunityRow
              server={server}
              active={server.id === props.activeId}
              focused={props.cursor === props.flatIndex(server)}
              onSelect={() => props.onSelect(server)}
              drag={props.drag}
              nested
            />
          )}
        </For>
      </Show>
    </>
  );
}

const Trigger = styled("button", {
  base: {
    all: "unset",
    boxSizing: "border-box",
    display: "inline-flex",
    alignItems: "center",
    gap: "var(--caps-space-4)",
    height: "32px",
    maxWidth: "260px",
    paddingInline: "var(--caps-space-4) var(--caps-space-3)",
    borderRadius: "var(--caps-radius-md)",
    fontSize: "var(--caps-text-md)",
    fontWeight: 500,
    color: "var(--caps-text-2)",
    cursor: "pointer",
    transition:
      "background var(--caps-dur-fast) var(--caps-ease), color var(--caps-dur-fast) var(--caps-ease)",

    "&:hover, &[aria-expanded=true]": {
      background: "var(--caps-hover)",
      color: "var(--caps-text)",
    },
    "&[data-active]": {
      color: "var(--caps-text)",
      background: "var(--caps-bg-component)",
    },
    "&:focus-visible": {
      boxShadow: "var(--caps-focus-ring)",
    },
  },
});

const triggerLabel = css({
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const chevron = css({
  color: "var(--caps-text-3)",
  flexShrink: 0,
});

const SearchRow = styled("label", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "var(--caps-space-4)",
    height: "44px",
    paddingInline: "var(--caps-space-6)",
    color: "var(--caps-text-3)",
    borderBottom: "1px solid var(--caps-line-soft)",
    flexShrink: 0,

    "& input": {
      all: "unset",
      flex: 1,
      minWidth: 0,
      fontSize: "var(--caps-text-base)",
      color: "var(--caps-text)",
    },
    "& input::placeholder": {
      color: "var(--caps-text-3)",
    },
  },
});

const ListArea = styled("div", {
  base: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    padding: "var(--caps-space-3)",
  },
});

const row = cva({
  base: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: "var(--caps-space-5)",
    height: "40px",
    paddingInline: "var(--caps-space-4)",
    borderRadius: "var(--caps-radius-md)",
    cursor: "pointer",
    userSelect: "none",
    color: "var(--caps-text-2)",
    transition: "background var(--caps-dur-fast) var(--caps-ease)",

    "&:hover, &[data-focused]": {
      background: "var(--caps-hover)",
      color: "var(--caps-text)",
    },
    "&[data-active]": {
      background: "var(--caps-selected)",
      color: "var(--caps-text)",
    },
    "&[data-fold-target]": {
      boxShadow: "inset 0 0 0 1px var(--caps-accent-line)",
      background: "var(--caps-accent-soft)",
    },
    "&[data-dragging]": {
      opacity: 0.45,
    },
  },
  variants: {
    nested: {
      true: {
        marginInlineStart: "var(--caps-space-7)",
      },
    },
  },
});

const rowName = css({
  flex: 1,
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontSize: "var(--caps-text-base)",
  "&[data-unread]": {
    color: "var(--caps-text)",
    fontWeight: 600,
  },
});

const rowMeta = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--caps-space-3)",
  color: "var(--caps-text-3)",
  flexShrink: 0,
});

const voiceIcon = css({ color: "var(--caps-success)" });
const checkIcon = css({ color: "var(--caps-accent)" });

const folderIcon = css({
  display: "grid",
  placeItems: "center",
  width: "28px",
  height: "28px",
  borderRadius: "var(--caps-radius-sm)",
  background: "var(--caps-bg-component)",
});

const countBadge = css({
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
  fontVariantNumeric: "tabular-nums",
});

const dot = css({
  width: "7px",
  height: "7px",
  borderRadius: "var(--caps-radius-full)",
  background: "var(--caps-text)",
});

const insertion = css({
  height: "2px",
  marginInline: "var(--caps-space-4)",
  marginBlock: "-1px",
  borderRadius: "2px",
  background: "var(--caps-accent)",
});

const ghost = css({
  position: "fixed",
  zIndex: 200,
  pointerEvents: "none",
  padding: "6px 10px",
  borderRadius: "var(--caps-radius-md)",
  background: "var(--caps-bg-overlay)",
  boxShadow: "var(--caps-shadow-pop)",
  fontSize: "var(--caps-text-md)",
  color: "var(--caps-text)",
});

const Empty = styled("div", {
  base: {
    padding: "var(--caps-space-8) var(--caps-space-6)",
    textAlign: "center",
    fontSize: "var(--caps-text-md)",
    color: "var(--caps-text-3)",
  },
});

const Footer = styled("div", {
  base: {
    display: "flex",
    gap: "var(--caps-space-2)",
    padding: "var(--caps-space-3)",
    borderTop: "1px solid var(--caps-line-soft)",
    flexShrink: 0,
  },
});

const FooterButton = styled("button", {
  base: {
    all: "unset",
    boxSizing: "border-box",
    flex: 1,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "var(--caps-space-3)",
    height: "34px",
    borderRadius: "var(--caps-radius-md)",
    fontSize: "var(--caps-text-md)",
    fontWeight: 500,
    color: "var(--caps-text-2)",
    cursor: "pointer",

    "&:hover": {
      background: "var(--caps-hover)",
      color: "var(--caps-text)",
    },
    "&:focus-visible": {
      boxShadow: "var(--caps-focus-ring)",
    },
  },
});

const srOnly = css({
  position: "absolute",
  width: "1px",
  height: "1px",
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
});

const TabTrigger = styled("button", {
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
    "&[data-active], &[aria-expanded=true]": { color: "var(--caps-text)" },
  },
});

const tabIcon = css({ position: "relative", display: "grid" });

const tabBadge = css({
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
