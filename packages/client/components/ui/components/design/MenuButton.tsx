import { createEffect, JSX, Show, splitProps } from "solid-js";

import { MdRipple } from "@material/web/ripple/ripple";
import { cva } from "styled-system/css";
import { styled } from "styled-system/jsx";

import { useState } from "@revolt/state";
import { SlideState } from "../navigation/SlideDrawer";
import { Ripple } from "./Ripple";
import { Unreads } from "./Unreads";

export type Props = {
  /**
   * Button size
   * @default thin
   */
  readonly size?: "thin" | "normal";

  /**
   * Button attention
   * @default normal
   */
  readonly attention?: "muted" | "normal" | "active" | "selected";

  /**
   * Button icon
   */
  readonly icon?: JSX.Element;

  /**
   * Button content
   */
  readonly children?: JSX.Element;

  /**
   * Alert indicator
   */
  readonly alert?: number | boolean;

  /**
   * Hover actions
   */
  readonly actions?: JSX.Element;

  readonly noDrawer?: boolean;
};

/**
 * Button intended for sidebar contexts
 */
export function MenuButton(
  props: Props &
    JSX.HTMLAttributes<HTMLAnchorElement> &
    JSX.HTMLAttributes<HTMLDivElement> & { href?: string },
) {
  const { appDrawer } = useState();
  const [local, other] = splitProps(props, [
    "onClick",
    "noDrawer",
    "attention",
    "size",
    "icon",
    "children",
    "alert",
    "actions",
  ]);
  let ripple: MdRipple | undefined;

  createEffect(() => {
    const sPos = appDrawer()?.state;
    if (sPos === SlideState.SHOWN || sPos === SlideState.HIDDEN)
      //@ts-expect-error private call
      ripple?.endPressAnimation();
  });

  function onClick(e: Event) {
    if (!local.noDrawer) appDrawer()?.setShown(true);
    // @ts-expect-error callable listener
    if (local.onClick) local.onClick(e);
  }

  const cont = (
    <>
      <Ripple ref={ripple} />
      {local.icon}
      <Content>{local.children}</Content>
      <Show when={local.alert}>
        <span class="hover-hide">
          <Unreads
            count={typeof local.alert === "number" ? local.alert : 0}
            size={typeof local.alert === "number" ? "0.85rem" : "0.4rem"}
            unread
          />
        </span>
      </Show>
      {local.actions && (
        <Actions class="hover-show" onClick={(e) => e.stopPropagation()}>
          {local.actions}
        </Actions>
      )}
    </>
  );

  return (
    // TODO: port to panda-css to merge down components
    <Show
      when={other.href}
      fallback={
        <div
          {...other}
          onClick={onClick}
          classList={{
            [base({
              attention: local.attention,
              size: local.size,
            })]: true,
          }}
          // @codegen directives props=other include=floating
        >
          {cont}
        </div>
      }
    >
      <a
        {...other}
        onClick={onClick}
        classList={{
          [base({
            attention: local.attention,
            size: local.size,
          })]: true,
        }}
        // @codegen directives props=other include=floating
      >
        {cont}
      </a>
    </Show>
  );
}

/**
 * Top-level container
 *
 * CAPS sidebar row: compact, quiet by default, with a lime notch marking the
 * current location.
 */
const base = cva({
  base: {
    flexShrink: 0,

    fontWeight: 500,
    fontSize: "var(--caps-text-base)",
    letterSpacing: "-0.003em",
    userSelect: "none",
    cursor: "pointer",

    // for <Ripple /> and the selection notch:
    position: "relative",

    display: "flex",
    alignItems: "center",
    margin: "0 var(--caps-space-4)",
    padding: "0 var(--caps-space-4)",
    borderRadius: "var(--caps-radius-sm)",

    color: "var(--color)",
    fill: "var(--color)",
    transition:
      "background-color var(--caps-dur-fast) var(--caps-ease), color var(--caps-dur-fast) var(--caps-ease)",

    "--md-ripple-hover-opacity": "0",
    "--md-ripple-pressed-opacity": "0.06",

    "& > svg": {
      alignSelf: "center",
    },

    "&::before": {
      content: '""',
      position: "absolute",
      left: "calc(-1 * var(--caps-space-4))",
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
      "--color": "var(--caps-text)",
    },

    "&:active": {
      background: "var(--caps-active)",
    },

    // swap `.hover-hide` elements w/  `.hover-show` elements on hover
    "&:hover .hover-hide, &:not(:hover) .hover-show": {
      display: "none",
    },
  },
  variants: {
    size: {
      normal: {
        height: "var(--caps-h-md)",
        gap: "var(--caps-space-4)",
      },
      thin: {
        height: "var(--caps-h-sm)",
        gap: "var(--caps-space-3)",

        // implicitly align center since we won't stack anything
        alignItems: "center",
      },
    },
    attention: {
      normal: {
        "--color": "var(--caps-text-3)",
        background: "transparent",
      },
      muted: {
        "--color": "var(--caps-text-disabled)",
        background: "transparent",

        "& img": {
          opacity: "0.4",
        },
      },
      active: {
        "--color": "var(--caps-text)",
        background: "transparent",
        fontWeight: 600,

        // unread channels: short notch in the text colour
        "&[data-unread]::before": {
          height: "8px",
          background: "var(--caps-text)",
        },
      },
      selected: {
        "--color": "var(--caps-text)",
        background: "var(--caps-selected)",

        "&::before": {
          height: "18px",
        },

        "&:hover": {
          background: "var(--caps-selected)",
        },
      },
    },
  },
  defaultVariants: {
    size: "normal",
    attention: "normal",
  },
});

/**
 * Textual content
 */
const Content = styled("div", {
  base: {
    flexGrow: 1,
    minWidth: 0,
  },
});

/**
 * Right-side actions
 */
const Actions = styled("div", {
  base: {
    alignSelf: "center",

    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    gap: "var(--caps-space-1)",

    "& > a": {
      display: "grid",
      placeItems: "center",
      width: "22px",
      height: "22px",
      borderRadius: "var(--caps-radius-xs)",
      color: "var(--caps-text-3)",
      fill: "var(--caps-text-3)",
      transition: "color var(--caps-dur-fast) var(--caps-ease)",
    },

    "& > a:hover": {
      color: "var(--caps-text)",
      fill: "var(--caps-text)",
      background: "var(--caps-hover)",
    },
  },
});
