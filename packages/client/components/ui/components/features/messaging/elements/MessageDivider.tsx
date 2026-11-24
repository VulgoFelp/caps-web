import { Show } from "solid-js";

import { Trans } from "@lingui/solid/macro";
import { styled } from "styled-system/jsx";

/**
 * Divider line
 */
const Base = styled("div", {
  base: {
    height: 0,
    display: "flex",
    userSelect: "none",
    alignItems: "center",
    margin: "17px 12px 17px 8px",

    "& time": {
      marginTop: "-2px",
      fontSize: "0.6875rem",
      lineHeight: "0.6875rem",
      fontWeight: 600,
      paddingInline: "5px 5px",

      borderRadius: "var(--borderRadius-md)",

      color: "var(--caps-text-3)",
      background: "var(--caps-bg-canvas)",
    },
  },
  variants: {
    unread: {
      true: {
        borderTop: "thin solid var(--caps-accent)",
      },
      false: {
        borderTop: "thin solid var(--caps-line)",
      },
    },
  },
  defaultVariants: {
    unread: false,
  },
});

/**
 * Unread indicator
 */
const Unread = styled("div", {
  base: {
    fontSize: "0.625rem",
    fontWeight: 600,
    color: "var(--caps-on-accent)",
    background: "var(--caps-accent)",

    padding: "0 6px",
    marginTop: "-1px",
    borderRadius: "60px",
  },
});

interface Props {
  /**
   * Display the date
   */
  date?: string;

  /**
   * Show unread indicator
   */
  unread?: boolean;
}

/**
 * Generic message divider
 */
export function MessageDivider(props: Props) {
  return (
    <Base unread={props.unread}>
      <Show when={props.unread}>
        <Unread>
          <Trans>NEW</Trans>
        </Unread>
      </Show>
      <Show when={props.date}>
        <time>{props.date}</time>
      </Show>
    </Base>
  );
}
