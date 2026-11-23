import { Accessor, For, Setter, Show, onMount } from "solid-js";

import { styled } from "styled-system/jsx";

import { Column, OverflowingText } from "@revolt/ui";

// import MdError from "@material-design-icons/svg/filled/error.svg?component-solid";
// import MdOpenInNew from "@material-design-icons/svg/filled/open_in_new.svg?component-solid";
import { SettingsList } from "..";
import { useSettingsNavigation } from "../Settings";

import {
  SidebarButton,
  SidebarButtonContent,
  SidebarButtonTitle,
} from "./SidebarButton";

/**
 * Settings Sidebar Layout
 */
export function SettingsSidebar(props: {
  list: Accessor<SettingsList<unknown>>;
  setPage: Setter<string | undefined>;
  page: Accessor<string | undefined>;
}) {
  const { navigate } = useSettingsNavigation();

  /**
   * Select first page on load
   */
  onMount(() => {
    if (!props.page()) {
      props.setPage(props.list().entries[0].entries[0].id);
    }
  });

  return (
    <Base class="settings_sidebar">
      <div use:invisibleScrollable>
        <Content class="content">
          <Column gap="lg">
            {props.list().prepend}
            <For each={props.list().entries}>
              {(category) => (
                <Show when={!category.hidden}>
                  <Column>
                    <Show when={category.title}>
                      <CategoryTitle>{category.title}</CategoryTitle>
                    </Show>
                    <Column gap="s">
                      <For each={category.entries}>
                        {(entry) => (
                          <Show when={!entry.hidden}>
                            <SidebarButton
                              onClick={() => navigate(entry)}
                              aria-selected={
                                props.page()?.split("/")[0] ===
                                entry.id?.split("/")[0]
                              }
                            >
                              <SidebarButtonTitle>
                                {entry.icon}
                                <SidebarButtonContent>
                                  <OverflowingText>
                                    {entry.title}
                                  </OverflowingText>
                                </SidebarButtonContent>
                              </SidebarButtonTitle>
                              {/*<SidebarButtonIcon>
                                <MdOpenInNew
                                  {...iconSize(20)}
                                  fill={theme!.colour("primary")}
                                />
                                <MdError
                                  {...iconSize(20)}
                                  fill={theme!.colour("primary")}
                                />
                              </SidebarButtonIcon>*/}
                            </SidebarButton>
                          </Show>
                        )}
                      </For>
                    </Column>
                  </Column>
                </Show>
              )}
            </For>
            {props.list().append}
          </Column>
        </Content>
      </div>
    </Base>
  );
}

/**
 * Base layout of the sidebar
 */
const Base = styled("div", {
  base: {
    display: "flex",
    flex: "1 0 218px",
    paddingLeft: "8px",
    justifyContent: "flex-end",
    height: "100%",

    _phone: {
      position: "absolute",
      top: "var(--inset-top)",
      bottom: "var(--inset-bottom)",
      height: "auto",
      width: "100vw",
      paddingLeft: "12px",

      "& > *": {
        width: "100%",
      },
    },
  },
});

/**
 * Aligned content within the sidebar
 */
const Content = styled("div", {
  base: {
    minWidth: "220px",
    maxWidth: "260px",
    padding: "56px 0 16px",
    display: "flex",
    gap: "1px",

    flexDirection: "column",

    "& a > div": {
      margin: 0,
    },

    _tablet: {
      padding: "8px 0",
    },
    _phone: {
      padding: "8px 0",
      maxWidth: "unset",
    },
  },
});

/**
 * Titles for each category
 */
const CategoryTitle = styled("span", {
  base: {
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",

    textTransform: "uppercase",
    fontSize: "var(--caps-text-xs)",
    fontWeight: 600,
    letterSpacing: "0.06em",
    margin: "var(--caps-space-5) 10px var(--caps-space-2)",
    marginInlineEnd: "20px",

    color: "var(--caps-text-3)",
  },
});
