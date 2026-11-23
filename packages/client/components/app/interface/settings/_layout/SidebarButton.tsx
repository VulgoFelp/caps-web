import { createEffect, JSX, splitProps } from "solid-js";
import { styled } from "styled-system/jsx";

import { MdRipple } from "@material/web/ripple/ripple";
import { useState } from "@revolt/state";
import { Ripple } from "@revolt/ui";
import { SlideState } from "@revolt/ui/components/navigation/SlideDrawer";

/**
 * Sidebar button
 */
export function SidebarButton(
  props: JSX.HTMLAttributes<HTMLAnchorElement> & {
    "aria-selected"?: boolean;
    noDrawer?: boolean;
  },
) {
  const { diagDrawer } = useState();
  const [local, other] = splitProps(props, ["onClick", "noDrawer", "class"]);
  let ripple: MdRipple | undefined;

  createEffect(() => {
    const sPos = diagDrawer()?.state;
    if (sPos === SlideState.SHOWN || sPos === SlideState.HIDDEN)
      //@ts-expect-error private call
      ripple?.endPressAnimation();
  });

  function onClick(e: Event) {
    if (!local.noDrawer) diagDrawer()?.setShown(true);
    // @ts-expect-error callable listener
    if (local.onClick) local.onClick(e);
  }

  return (
    <SidebarButtonBase
      {...other}
      class={"button" + (local.class ? " " + local.class : "")}
      onClick={onClick}
    >
      <Ripple ref={ripple} />
      {props.children}
    </SidebarButtonBase>
  );
}

const SidebarButtonBase = styled("a", {
  base: {
    // for <Ripple /> and the selection notch:
    position: "relative",
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    height: "var(--caps-h-md)",
    padding: "0 10px",
    borderRadius: "var(--caps-radius-sm)",
    fontWeight: 500,
    marginInlineEnd: "12px",
    fontSize: "var(--caps-text-base)",
    userSelect: "none",
    cursor: "pointer",
    transition:
      "background-color var(--caps-dur-fast) var(--caps-ease), color var(--caps-dur-fast) var(--caps-ease)",
    color: "var(--caps-text-2)",
    fill: "var(--caps-text-2)",
    background: "unset",

    "--md-ripple-hover-opacity": "0",
    "--md-ripple-pressed-opacity": "0.06",

    "& svg": {
      flexShrink: 0,
      width: "18px",
      height: "18px",
    },

    "&::before": {
      content: '""',
      position: "absolute",
      left: "-8px",
      top: "50%",
      width: "3px",
      height: "0px",
      borderRadius: "0 3px 3px 0",
      background: "var(--caps-accent)",
      transform: "translateY(-50%)",
      transition: "height var(--caps-dur) var(--caps-ease-out)",
    },

    "&:hover": {
      background: "var(--caps-hover)",
      color: "var(--caps-text)",
      fill: "var(--caps-text)",
    },
  },
  variants: {
    "aria-selected": {
      true: {
        background: "var(--caps-selected)",
        color: "var(--caps-text)",
        fill: "var(--caps-text)",

        "&::before": {
          height: "16px",
        },

        "&:hover": {
          background: "var(--caps-selected)",
        },
      },
    },
  },
});

export const SidebarButtonTitle = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexGrow: 1,
    minWidth: 0,
    paddingInlineEnd: "8px",
  },
});

export const SidebarButtonContent = styled("div", {
  base: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
  },
});

export const SidebarButtonIcon = styled("div", {
  base: {
    display: "flex",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    flexShrink: 0,
    gap: "2px",
  },
});
