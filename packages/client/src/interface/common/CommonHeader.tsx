import { JSX, Show } from "solid-js";

import { useLingui } from "@lingui/solid/macro";
import { css } from "styled-system/css";

import { useState } from "@revolt/state";

import MdArrowBack from "lucide-solid/icons/arrow-left";

/**
 * Leading icon of a page header
 *
 * On desktop it is just the page's icon (the sidebar toggle lives in the top
 * bar). On phones it becomes a back button that reveals the sidebar.
 */
export function HeaderIcon(props: { children: JSX.Element }) {
  const state = useState();
  const { t } = useLingui();

  return (
    <Show
      when={state.appDrawer()}
      fallback={
        <span class={container} aria-hidden="true">
          {props.children}
        </span>
      }
    >
      <button
        type="button"
        class={back}
        aria-label={t`Back`}
        onClick={() => state.appDrawer()?.setShown(false)}
      >
        <MdArrowBack size={20} />
      </button>
    </Show>
  );
}

const container = css({
  display: "grid",
  placeItems: "center",
  flexShrink: 0,
  width: "28px",
  height: "28px",
  marginLeft: "calc(-1 * var(--caps-space-2))",
  borderRadius: "var(--caps-radius-sm)",
  color: "var(--caps-text-3)",
});

const back = css({
  all: "unset",
  display: "grid",
  placeItems: "center",
  flexShrink: 0,
  width: "32px",
  height: "32px",
  marginLeft: "calc(-1 * var(--caps-space-3))",
  borderRadius: "var(--caps-radius-sm)",
  color: "var(--caps-text-2)",
  cursor: "pointer",
  "&:hover": {
    color: "var(--caps-text)",
    background: "var(--caps-hover)",
  },
  "&:focus-visible": { boxShadow: "var(--caps-focus-ring)" },
});
