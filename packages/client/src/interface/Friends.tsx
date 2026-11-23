import {
  Accessor,
  For,
  JSX,
  Match,
  Show,
  Switch,
  createMemo,
  createSignal,
  splitProps,
} from "solid-js";

import { Trans, useLingui } from "@lingui/solid/macro";
import { VirtualContainer } from "@minht11/solid-virtual-container";
import type { User } from "stoat.js";
import { styled } from "styled-system/jsx";

import { UserContextMenu } from "@revolt/app";
import { useClient } from "@revolt/client";
import { useModals } from "@revolt/modal";
import {
  Avatar,
  Button,
  Deferred,
  Header,
  List,
  ListItem,
  ListSubheader,
  OverflowingText,
  UserStatus,
  main,
} from "@revolt/ui";
import { Symbol } from "@revolt/ui/components/utils/Symbol";

import { HeaderIcon } from "./common/CommonHeader";

/**
 * Base layout of the friends page
 */
const Base = styled("div", {
  base: {
    width: "100%",
    display: "flex",
    flexDirection: "column",

    "& .FriendsList": {
      flexGrow: 1,
      minHeight: 0,
      paddingInline: "var(--caps-space-4)",
    },
  },
});

/**
 * Horizontal tab bar for friend lists
 */
const Tabs = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "var(--caps-space-1)",
    flexShrink: 0,
    height: "48px",
    paddingInline: "var(--caps-space-5)",
    borderBottom: "1px solid var(--caps-line-soft)",
  },
});

const Tab = styled("button", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "var(--caps-space-3)",
    height: "var(--caps-h-sm)",
    padding: "0 10px",
    border: "none",
    borderRadius: "var(--caps-radius-sm)",
    background: "transparent",
    color: "var(--caps-text-3)",
    fontFamily: "inherit",
    fontSize: "var(--caps-text-md)",
    fontWeight: 500,
    cursor: "pointer",
    transition:
      "background-color var(--caps-dur-fast) var(--caps-ease), color var(--caps-dur-fast) var(--caps-ease)",

    "&:hover": {
      color: "var(--caps-text)",
      background: "var(--caps-hover)",
    },
  },
  variants: {
    selected: {
      true: {
        color: "var(--caps-text)",
        background: "var(--caps-selected)",
        fontWeight: 600,
      },
    },
  },
});

const TabCount = styled("span", {
  base: {
    minWidth: "18px",
    height: "18px",
    padding: "0 5px",
    display: "grid",
    placeItems: "center",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: 700,
    color: "#ffffff",
    background: "var(--caps-danger)",
  },
});

/**
 * Friends menu
 */
export function Friends() {
  const { t } = useLingui();
  const client = useClient();
  const { openModal } = useModals();

  /**
   * Reference to the parent scroll container
   */
  let scrollTargetElement!: HTMLDivElement;

  /**
   * Signal required for reacting to ref changes
   */
  const targetSignal = () => scrollTargetElement;

  /**
   * Generate lists of all users
   */
  const lists = createMemo(() => {
    const list = client()!.users.toList();

    const friends = list
      .filter((user) => user.relationship === "Friend")
      .sort((a, b) => a.displayName.localeCompare(b.displayName));

    return {
      friends,
      online: friends.filter((user) => user.online),
      incoming: list
        .filter((user) => user.relationship === "Incoming")
        .sort((a, b) => a.displayName.localeCompare(b.displayName)),
      outgoing: list
        .filter((user) => user.relationship === "Outgoing")
        .sort((a, b) => a.displayName.localeCompare(b.displayName)),
      blocked: list
        .filter((user) => user.relationship === "Blocked")
        .sort((a, b) => a.displayName.localeCompare(b.displayName)),
    };
  });

  const pending = () => {
    const incoming = lists().incoming;
    return incoming.length > 99 ? "99+" : incoming.length;
  };

  const [page, setPage] = createSignal("online");

  return (
    <Base>
      <Header placement="primary">
        <HeaderIcon>
          <Symbol>group</Symbol>
        </HeaderIcon>
        <Trans>Friends</Trans>
      </Header>

      <main class={main()}>
        <div
          style={{
            position: "relative",
            "min-height": 0,
            display: "flex",
            "flex-direction": "column",
            height: "100%",
          }}
        >
          <Tabs role="tablist">
            <For
              each={[
                { id: "online", label: t`Online` },
                { id: "all", label: t`All` },
                { id: "pending", label: t`Pending` },
                { id: "blocked", label: t`Blocked` },
              ]}
            >
              {(tab) => (
                <Tab
                  role="tab"
                  aria-selected={page() === tab.id}
                  selected={page() === tab.id}
                  onClick={() => setPage(tab.id)}
                >
                  {tab.label}
                  <Show when={tab.id === "pending" && pending()}>
                    <TabCount>{pending()}</TabCount>
                  </Show>
                </Tab>
              )}
            </For>
            <div style={{ "flex-grow": 1 }} />
            <Button
              size="xs"
              onPress={() =>
                openModal({
                  type: "add_friend",
                  client: client(),
                })
              }
            >
              <Symbol size={16}>person_add</Symbol>
              <Trans>Add a new friend</Trans>
            </Button>
          </Tabs>

          <Deferred>
            <div class="FriendsList" ref={scrollTargetElement} use:scrollable>
              <Switch
                fallback={
                  <People
                    title={t`Online`}
                    users={lists().online}
                    scrollTargetElement={targetSignal}
                  />
                }
              >
                <Match when={page() === "all"}>
                  <People
                    title={t`All`}
                    users={lists().friends}
                    scrollTargetElement={targetSignal}
                  />
                </Match>
                <Match when={page() === "pending"}>
                  <People
                    title={t`Incoming`}
                    users={lists().incoming}
                    scrollTargetElement={targetSignal}
                  />
                  <People
                    title={t`Outgoing`}
                    users={lists().outgoing}
                    scrollTargetElement={targetSignal}
                  />
                </Match>
                <Match when={page() === "blocked"}>
                  <People
                    title={t`Blocked`}
                    users={lists().blocked}
                    scrollTargetElement={targetSignal}
                  />
                </Match>
              </Switch>
            </div>
          </Deferred>
        </div>
      </main>
    </Base>
  );
}

/**
 * List of users
 */
function People(props: {
  users: User[];
  title: string;
  scrollTargetElement: Accessor<HTMLDivElement>;
}) {
  return (
    <List>
      <ListSubheader>
        {props.title} {"–"} {props.users.length}
      </ListSubheader>

      <Show when={props.users.length === 0}>
        <ListItem disabled>
          <Trans>Nobody here right now!</Trans>
        </ListItem>
      </Show>

      <VirtualContainer
        items={props.users}
        scrollTarget={props.scrollTargetElement()}
        itemSize={{ height: 58 }}
        // grid rendering:
        // itemSize={{ height: 60, width: 240 }}
        // crossAxisCount={(measurements) =>
        //   Math.floor(measurements.container.cross / measurements.itemSize.cross)
        // }
        // width: 100% needs to be removed from listentry below for this to work ^^^
      >
        {(item) => (
          <ContainerListEntry
            style={{
              ...item.style,
            }}
          >
            <Entry
              role="listitem"
              tabIndex={item.tabIndex}
              style={item.style}
              user={item.item}
            />
          </ContainerListEntry>
        )}
      </VirtualContainer>
    </List>
  );
}

const ContainerListEntry = styled("div", {
  base: {
    width: "100%",
  },
});

/**
 * Single user entry
 */
function Entry(
  props: { user: User } & Omit<
    JSX.AnchorHTMLAttributes<HTMLAnchorElement>,
    "href"
  >,
) {
  const { openModal } = useModals();
  const [local, remote] = splitProps(props, ["user"]);

  return (
    <a
      {...remote}
      use:floating={{
        contextMenu: () => <UserContextMenu user={local.user} />,
      }}
      onClick={() => openModal({ type: "user_profile", user: local.user })}
    >
      <ListItem>
        <Avatar
          slot="icon"
          size={36}
          src={local.user.animatedAvatarURL}
          holepunch={
            props.user.relationship === "Friend" ? "bottom-right" : "none"
          }
          overlay={
            <Show when={props.user.relationship === "Friend"}>
              <UserStatus.Graphic
                status={props.user.status?.presence ?? "Online"}
              />
            </Show>
          }
        />
        <OverflowingText>{local.user.displayName}</OverflowingText>
      </ListItem>
    </a>
  );
}
