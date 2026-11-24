import { cva } from "styled-system/css";
import { styled } from "styled-system/jsx";

/**
 * Common styles for the unified sidebar (sits directly on the app canvas)
 */
export const SidebarBase = styled("div", {
  base: {
    display: "flex",
    flex: 1,
    minHeight: 0,
    flexDirection: "column",
    overflow: "hidden",
    width: "var(--caps-sidebar-width)",

    color: "var(--caps-text)",
    background: "var(--caps-bg-canvas)",

    "& a": {
      textDecoration: "none",
    },

    _phone: {
      flexGrow: 1,
    },
  },
});

/**
 * Sidebar section header (title + actions)
 */
export const SidebarHeader = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "var(--caps-space-3)",
    flexShrink: 0,
    height: "var(--caps-header-height)",
    paddingInline: "var(--caps-space-6) var(--caps-space-4)",
    color: "var(--caps-text)",
    fontSize: "var(--caps-text-base)",
    fontWeight: 600,
    letterSpacing: "-0.01em",
    userSelect: "none",
  },
});

/**
 * Small square icon button used in sidebar headers and section labels
 */
export const sidebarIconButton = cva({
  base: {
    all: "unset",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    width: "26px",
    height: "26px",
    borderRadius: "var(--caps-radius-sm)",
    color: "var(--caps-text-3)",
    cursor: "pointer",
    transition:
      "background var(--caps-dur-fast) var(--caps-ease), color var(--caps-dur-fast) var(--caps-ease)",

    "&:hover, &[aria-expanded=true]": {
      background: "var(--caps-hover)",
      color: "var(--caps-text)",
    },
    "&:focus-visible": { boxShadow: "var(--caps-focus-ring)" },
  },
});
