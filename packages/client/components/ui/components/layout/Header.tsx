import { styled } from "styled-system/jsx";

export interface Props {
  readonly placement: "primary" | "secondary";

  readonly topBorder?: boolean;
  readonly bottomBorder?: boolean;
}

/**
 * Header component
 */
export const Header = styled("div", {
  base: {
    gap: "var(--caps-space-4)",
    flex: "0 auto",
    display: "flex",
    flexShrink: 0,
    alignItems: "center",
    fontWeight: 600,
    fontSize: "var(--caps-text-base)",
    userSelect: "none",
    overflow: "hidden",
    height: "var(--caps-header-height)",
    paddingInline: "var(--caps-space-6)",
    borderBottom: "1px solid var(--caps-line-soft)",

    color: "var(--caps-text)",
    fill: "var(--caps-text)",

    backgroundSize: "cover !important",
    backgroundPosition: "center !important",
    "& svg": {
      flexShrink: 0,
    },
  },
  variants: {
    placement: {
      primary: {
        background: "var(--caps-bg-app)",
        paddingInline: "var(--caps-space-5) var(--caps-space-4)",
      },
      secondary: {
        background: "var(--caps-bg-sidebar)",
        paddingInline: "var(--caps-space-6) var(--caps-space-4)",
      },
    },
    image: {
      true: {
        color: "white",
        fill: "white",
        padding: 0,
        borderBottom: "none",

        alignItems: "flex-end",
        justifyContent: "stretch",
        textShadow: "0 1px 2px rgba(0, 0, 0, 0.6)",
        height: "112px",

        "& > div": {
          flexGrow: 1,
          height: "var(--caps-header-height)",
          padding: "0 var(--caps-space-4) 0 var(--caps-space-6)",
          background:
            "linear-gradient(0deg, rgba(0, 0, 0, 0.72), rgba(0, 0, 0, 0))",
        },
      },
    },
    transparent: {
      true: {
        width: "100%",
        zIndex: "10",
        borderBottom: "none",
      },
    },
  },
  defaultVariants: {
    placement: "primary",
    image: false,
    transparent: false,
  },
});

/**
 * Position an element below a floating header
 *
 * Ensure you place a div inside to make the positioning work
 */
export const BelowFloatingHeader = styled("div", {
  base: {
    position: "relative",
    zIndex: "10",

    // i guess this works, probably refactor this later
    "& > div > div": {
      width: "100%",
      position: "absolute",
      top: "var(--caps-space-4)",
    },
  },
});
