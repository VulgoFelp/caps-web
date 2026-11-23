import { cva } from "styled-system/css";

/**
 * Styles for the main content of a page
 *
 * Content sits flush on the app surface; separation comes from hairlines.
 */
export const main = cva({
  base: {
    flexGrow: 1,
    minWidth: 0,
    minHeight: 0,

    display: "flex",
    overflow: "hidden",
    flexDirection: "column",

    // CAPS: content sits flush on the app surface, no floating card
    background: "var(--caps-bg-app)",
    paddingBottom: "env(keyboard-inset-height)",
  },
});
