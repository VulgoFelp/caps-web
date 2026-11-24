import { Accessor, Match, Setter, Show, Switch } from "solid-js";

import { Trans, useLingui } from "@lingui/solid/macro";
import { Channel } from "stoat.js";
import { css } from "styled-system/css";
import { styled } from "styled-system/jsx";

import { useClient } from "@revolt/client";
import { getChannelIcon, useDevice } from "@revolt/common";
import { TextWithEmoji } from "@revolt/markdown";
import { useModals } from "@revolt/modal";
import { useVoice } from "@revolt/rtc";
import { useState } from "@revolt/state";
import { LAYOUT_SECTIONS } from "@revolt/state/stores/Layout";
import {
  Button,
  IconButton,
  NonBreakingText,
  OverflowingText,
  Spacer,
  typography,
  UserStatus,
} from "@revolt/ui";
import { Symbol } from "@revolt/ui/components/utils/Symbol";

import MdSettings from "lucide-solid/icons/settings";
import MdPersonAdd from "lucide-solid/icons/user-plus";
import MdGroup from "lucide-solid/icons/users";

import MdKeep from "../../svg/keep.svg?component-solid";
import { HeaderIcon } from "../common/CommonHeader";

import { canIHasSidebar, SidebarState } from "./text/TextChannel";

interface Props {
  /**
   * Channel to render header for
   */
  channel: Channel;

  /**
   * Sidebar state
   */
  sidebarState?: Accessor<SidebarState>;

  /**
   * Set sidebar state
   */
  setSidebarState?: Setter<SidebarState>;
}

/**
 * Common channel header component
 */
export function ChannelHeader(props: Props) {
  const { openModal } = useModals();
  const client = useClient();
  const { t } = useLingui();
  const state = useState();
  const voice = useVoice();
  const { layout } = useDevice();

  const searchValue = () => {
    if (!props.sidebarState) return null;

    const state = props.sidebarState();
    if (state.state === "search") return state.query;
    return "";
  };

  return (
    <>
      <Switch>
        <Match
          when={
            props.channel.type === "TextChannel" ||
            props.channel.type === "Group"
          }
        >
          <HeaderIcon>
            <Symbol>{getChannelIcon(props.channel)}</Symbol>
          </HeaderIcon>
          <NonBreakingText
            class={
              typography({ class: "title", size: "medium" }) +
              " " +
              mobileOverflow
            }
            onClick={() =>
              openModal({
                type: "channel_info",
                channel: props.channel,
              })
            }
          >
            <TextWithEmoji content={props.channel.name!} />
          </NonBreakingText>
          <Show when={layout() !== "phone" && props.channel.description}>
            <Divider />
            <a
              class={descriptionLink}
              onClick={() =>
                openModal({
                  type: "channel_info",
                  channel: props.channel,
                })
              }
              use:floating={{
                tooltip: {
                  placement: "bottom",
                  content: t`Click to show full description`,
                },
              }}
            >
              <OverflowingText
                class={typography({ class: "title", size: "small" })}
              >
                <TextWithEmoji
                  content={props.channel.description?.split("\n").shift()}
                />
              </OverflowingText>
            </a>
          </Show>
        </Match>
        <Match when={props.channel.type === "DirectMessage"}>
          <HeaderIcon>
            <Symbol>alternate_email</Symbol>
          </HeaderIcon>
          <OverflowingText>
            <TextWithEmoji content={props.channel.recipient?.username} />
          </OverflowingText>
          <UserStatus status={props.channel.recipient?.presence} size="8px" />
        </Match>
        <Match when={props.channel.type === "SavedMessages"}>
          <HeaderIcon>
            <Symbol>note_stack</Symbol>
          </HeaderIcon>
          <Trans>Saved Notes</Trans>
        </Match>
      </Switch>

      <Spacer />

      <Show when={props.channel.isVoice && !voice.showCard(props.channel)}>
        <IconButton
          onPress={() => voice.connect(props.channel)}
          use:floating={{
            tooltip: {
              placement: "bottom",
              content: t`Join the voice channel`,
            },
          }}
        >
          <Symbol>call</Symbol>
        </IconButton>
      </Show>

      <Show
        when={
          (props.channel.type === "Group" || props.channel.serverId) &&
          props.channel.orPermission("ManageChannel", "ManagePermissions")
        }
      >
        <IconButton
          onPress={() =>
            openModal({
              type: "settings",
              config: "channel",
              context: props.channel,
            })
          }
          use:floating={{
            tooltip: {
              placement: "bottom",
              content: t`Channel Settings`,
            },
          }}
        >
          <MdSettings />
        </IconButton>
      </Show>

      <Show when={props.channel.type === "Group"}>
        <Button
          variant="text"
          size="icon"
          onPress={() =>
            openModal({
              type: "add_members_to_group",
              group: props.channel,
              client: client(),
            })
          }
          use:floating={{
            tooltip: {
              placement: "bottom",
              content: t`Add friends to group`,
            },
          }}
        >
          <MdPersonAdd />
        </Button>
      </Show>

      <Show when={props.sidebarState}>
        <IconButton
          aria-selected={props.sidebarState!().state === "pins"}
          use:floating={{
            tooltip: {
              placement: "bottom",
              content: t`View pinned messages`,
            },
          }}
          onPress={() =>
            props.sidebarState!().state === "pins"
              ? props.setSidebarState!({
                  state: "default",
                })
              : props.setSidebarState!({
                  state: "pins",
                })
          }
        >
          <MdKeep />
        </IconButton>
      </Show>

      <Show when={props.sidebarState && canIHasSidebar(props.channel)}>
        <IconButton
          aria-selected={
            props.sidebarState!().state === "default" &&
            state.layout.getSectionState(LAYOUT_SECTIONS.MEMBER_SIDEBAR, true)
          }
          onPress={() => {
            if (props.sidebarState!().state === "default") {
              state.layout.toggleSectionState(
                LAYOUT_SECTIONS.MEMBER_SIDEBAR,
                true,
              );
            } else {
              state.layout.setSectionState(
                LAYOUT_SECTIONS.MEMBER_SIDEBAR,
                true,
                true,
              );

              props.setSidebarState!({
                state: "default",
              });
            }
          }}
          use:floating={{
            tooltip: {
              placement: "bottom",
              content: t`View members`,
            },
          }}
        >
          <MdGroup />
        </IconButton>
      </Show>

      <Show when={searchValue() !== null}>
        <Show
          when={
            layout() === "desktop" || props.sidebarState!().state !== "default"
          }
          fallback={
            <IconButton
              onPress={() =>
                props.setSidebarState!({ state: "search", query: "" })
              }
              use:floating={{
                tooltip: {
                  placement: "bottom",
                  content: t`Search`,
                },
              }}
            >
              <Symbol>search</Symbol>
            </IconButton>
          }
        >
          <SearchBox
            type="search"
            placeholder={t`Search`}
            value={searchValue()!}
            onChange={(e) =>
              e.currentTarget.value
                ? props.setSidebarState!({
                    state: "search",
                    query: e.currentTarget.value,
                  })
                : props.setSidebarState!({
                    state: "default",
                  })
            }
          />
        </Show>
      </Show>
    </>
  );
}

const SearchBox = styled("input", {
  base: {
    height: "var(--caps-h-sm)",
    width: "200px",
    marginLeft: "var(--caps-space-2)",
    paddingInline: "28px 10px",
    border: "none",
    outline: "none",
    borderRadius: "var(--caps-radius-md)",
    color: "var(--caps-text)",
    fontFamily: "inherit",
    fontSize: "var(--caps-text-md)",
    background:
      "var(--caps-bg-field) no-repeat 9px 50% / 14px url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%237d7b73' stroke-width='2.4' stroke-linecap='round'%3E%3Ccircle cx='11' cy='11' r='7'/%3E%3Cpath d='m20 20-3.5-3.5'/%3E%3C/svg%3E\")",
    boxShadow: "inset 0 0 0 1px var(--caps-line)",
    transition:
      "width var(--caps-dur-slow) var(--caps-ease-out), box-shadow var(--caps-dur) var(--caps-ease)",

    "&::placeholder": {
      color: "var(--caps-text-3)",
    },

    "&:hover": {
      boxShadow: "inset 0 0 0 1px var(--caps-line-strong)",
    },

    "&:focus": {
      width: "260px",
      boxShadow:
        "inset 0 0 0 1px var(--caps-accent), 0 0 0 3px var(--caps-accent-soft)",
    },

    "&::-webkit-search-cancel-button": {
      filter: "grayscale(1)",
    },
  },
});

/**
 * Vertical divider between name and topic
 */
const Divider = styled("div", {
  base: {
    flexShrink: 0,
    width: "1px",
    height: "16px",
    margin: "0 var(--caps-space-2)",
    backgroundColor: "var(--caps-line-strong)",
  },
});

/**
 * Link for the description
 */
const descriptionLink = css({
  minWidth: 0,
  cursor: "pointer",
  color: "var(--caps-text-3)",
  fontWeight: 400,
  transition: "color var(--caps-dur-fast) var(--caps-ease)",

  "& *": {
    fontWeight: "400 !important",
  },

  "&:hover": {
    color: "var(--caps-text-2)",
  },
});

const mobileOverflow = css({
  _phone: {
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
});
