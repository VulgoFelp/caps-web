import { JSX, Show } from "solid-js";

import { styled } from "styled-system/jsx";

/**
 * A titled block of the social home
 */
export function Section(props: {
  title: JSX.Element;
  /**
   * Count or short meta next to the title
   */
  meta?: JSX.Element;
  /**
   * Action on the right of the title (e.g. "See all")
   */
  action?: JSX.Element;
  children: JSX.Element;
}) {
  return (
    <Base>
      <Head>
        <h2>{props.title}</h2>
        <Show when={props.meta !== undefined && props.meta !== false}>
          <span class="meta">{props.meta}</span>
        </Show>
        <span style={{ flex: 1 }} />
        {props.action}
      </Head>
      {props.children}
    </Base>
  );
}

const Base = styled("section", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--caps-space-4)",
    minWidth: 0,
  },
});

const Head = styled("div", {
  base: {
    display: "flex",
    alignItems: "baseline",
    gap: "var(--caps-space-4)",
    minHeight: "24px",

    "& h2": {
      margin: 0,
      fontSize: "var(--caps-text-sm)",
      fontWeight: 600,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      color: "var(--caps-text-3)",
    },

    "& .meta": {
      fontSize: "var(--caps-text-sm)",
      color: "var(--caps-text-disabled)",
      fontVariantNumeric: "tabular-nums",
    },
  },
});

/**
 * Text link used for section actions
 */
export const SectionLink = styled("a", {
  base: {
    fontSize: "var(--caps-text-sm)",
    fontWeight: 500,
    color: "var(--caps-text-3)",
    textDecoration: "none",
    cursor: "pointer",
    "&:hover": { color: "var(--caps-text)" },
  },
});

/**
 * Plain surface block used by home modules (one level, no nesting)
 */
export const Surface = styled("div", {
  base: {
    borderRadius: "var(--caps-radius-lg)",
    background: "var(--caps-bg-surface)",
    boxShadow: "inset 0 0 0 1px var(--caps-line-soft)",
    overflow: "hidden",
  },
});
