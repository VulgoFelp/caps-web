import { JSX, splitProps } from "solid-js";

import { styled } from "styled-system/jsx";

import { typography } from "../design";

/**
 * Base element for the tooltip
 */
export const TooltipBase = styled("div", {
  base: {
    ...typography.raw({
      class: "label",
      size: "medium",
    }),

    // CAPS: inverted, compact chip so it reads instantly over any surface
    color: "var(--caps-bg-app)",
    background: "var(--caps-text)",
    padding: "5px 8px",
    borderRadius: "var(--caps-radius-sm)",
    fontWeight: 600,
    maxWidth: "280px",
    boxShadow: "0 4px 12px -2px rgba(0, 0, 0, 0.4)",
  },
});

type Props = {
  /**
   * Tooltip trigger area
   */
  children: JSX.Element;
} & (JSX.Directives["floating"] & object)["tooltip"];

/**
 * Tooltip component
 */
export function Tooltip(props: Props) {
  const [local, remote] = splitProps(props, ["children"]);

  return (
    <div use:floating={{ tooltip: remote as never }}>{local.children}</div>
  );
}
