import { BiRegularChevronLeft, BiRegularChevronRight } from "solid-icons/bi";

import { JSX, Match, Switch } from "solid-js";

import MdArrowBack from "@material-design-icons/svg/outlined/arrow_back.svg?component-solid";

import { useLingui } from "@lingui/solid/macro";
import { css } from "styled-system/css";

import { useState } from "@revolt/state";
import { LAYOUT_SECTIONS } from "@revolt/state/stores/Layout";

/**
 * Wrapper for header icons which adds the chevron on the
 * correct side for toggling sidebar (if on desktop) and
 * the hamburger icon to open sidebar (if on mobile).
 */
export function HeaderIcon(props: { children: JSX.Element }) {
  const state = useState();
  const { t } = useLingui();

  return (
    <div
      class={container}
      onClick={() => {
        const ad = state.appDrawer();
        if (ad) ad.setShown(false);
        else
          state.layout.toggleSectionState(
            LAYOUT_SECTIONS.PRIMARY_SIDEBAR,
            true,
          );
      }}
      use:floating={{
        tooltip: {
          placement: "bottom",
          content: t`Toggle main sidebar`,
        },
      }}
    >
      <Switch
        fallback={
          <>
            <BiRegularChevronRight size={14} class="caps-chevron" />
            {props.children}
          </>
        }
      >
        <Match when={state.appDrawer()}>
          <MdArrowBack />
        </Match>
        <Match
          when={state.layout.getSectionState(
            LAYOUT_SECTIONS.PRIMARY_SIDEBAR,
            true,
          )}
        >
          <BiRegularChevronLeft size={14} class="caps-chevron" />
          {props.children}
        </Match>
      </Switch>
    </div>
  );
}

const container = css({
  display: "flex",
  cursor: "pointer",
  alignItems: "center",
  gap: "2px",
  height: "var(--caps-h-sm)",
  marginLeft: "calc(-1 * var(--caps-space-2))",
  paddingInline: "var(--caps-space-2) var(--caps-space-3)",
  borderRadius: "var(--caps-radius-sm)",
  color: "var(--caps-text-3)",
  fill: "var(--caps-text-3)",
  transition:
    "background-color var(--caps-dur-fast) var(--caps-ease), color var(--caps-dur-fast) var(--caps-ease)",

  "& svg, & .material-symbols-outlined": {
    fontSize: "20px",
  },

  "& .caps-chevron": {
    opacity: 0,
    marginRight: "-4px",
    transition: "opacity var(--caps-dur-fast) var(--caps-ease)",
  },

  "&:hover": {
    color: "var(--caps-text)",
    fill: "var(--caps-text)",
    background: "var(--caps-hover)",
  },

  "&:hover .caps-chevron": {
    opacity: 1,
  },
});
