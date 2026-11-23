import { styled } from "styled-system/jsx";

/**
 * Common styles for sidebar
 */
export const SidebarBase = styled("div", {
  base: {
    display: "flex",
    flexShrink: 0,
    flexDirection: "column",
    overflow: "hidden",
    // the sidebar meets the server rail with a single soft corner
    borderTopLeftRadius: "var(--caps-radius-lg)",
    boxShadow: "inset 1px 1px 0 var(--caps-line-soft)",
    width: "var(--caps-sidebar-width)",

    fill: "var(--caps-text)",
    color: "var(--caps-text)",
    background: "var(--caps-bg-sidebar)",

    "& a": {
      textDecoration: "none",
    },

    _phone: {
      flexGrow: 1,
      borderTopLeftRadius: 0,
      boxShadow: "none",
    },
  },
});
