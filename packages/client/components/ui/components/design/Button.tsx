import { Show, createRenderEffect, mergeProps, on, splitProps } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";

import { AriaButtonProps, createButton } from "@solid-aria/button";
import { cva } from "styled-system/css/cva";

import { Ripple } from "./Ripple";
import { typography } from "./Text";

type Props = Omit<
  Parameters<typeof button>[0] &
    AriaButtonProps &
    JSX.DirectiveAttributes &
    Pick<
      JSX.ButtonHTMLAttributes<HTMLButtonElement>,
      "role" | "tabIndex" | "aria-selected"
    >,
  "onClick" | "_permitAnimation" | "disabled"
> & {
  groupActive?: boolean;
  bg?: string;
};

/**
 * Buttons prompt most actions in a UI
 *
 * If you wish to create standard button groups:
 *
 * ```tsx
 * <Row>
 *   <Button
 *     onPress={() => setActiveA()}
 *     groupActive={activeA()}
 *     group="standard"
 *   >
 *     Button A
 *   </Button>
 *   <Button
 *     onPress={() => setActiveB()}
 *     groupActive={activeB()}
 *     group="standard"
 *   >
 *     Button B
 *   </Button>
 *   <Button
 *     onPress={() => setActiveC()}
 *     groupActive={activeC()}
 *     group="standard"
 *   >
 *     Button C
 *   </Button>
 * </Row>
 * ```
 *
 * If you wish to create connected button groups:
 *
 * ```tsx
 * <Row>
 *   <Button
 *     onPress={() => setActiveA()}
 *     groupActive={activeA()}
 *     group="connected-start"
 *   >
 *     Button A
 *   </Button>
 *   <Button
 *     onPress={() => setActiveB()}
 *     groupActive={activeB()}
 *     group="connected"
 *   >
 *     Button B
 *   </Button>
 *   <Button
 *     onPress={() => setActiveC()}
 *     groupActive={activeC()}
 *     group="connected-end"
 *   >
 *     Button C
 *   </Button>
 * </Row>
 * ```
 *
 * @specification https://m3.material.io/components/buttons
 */
export function Button(props: Props) {
  const [passthrough, propsRest] = splitProps(props, [
    "aria-selected",
    "tabIndex",
    "role",
  ]);

  const [style, rest] = splitProps(propsRest, [
    "bg",
    "size",
    "shape",
    "variant",
    "group",
    "groupActive",
  ]);
  let ref: HTMLButtonElement | undefined;

  const shape = () =>
    style.group
      ? style.groupActive !== (style.group === "standard")
        ? "round"
        : "square"
      : style.shape;

  const variant = () =>
    style.group ? (style.groupActive ? "filled" : "tonal") : style.variant;

  let _permitAnimation = false;
  createRenderEffect(
    on(
      () => shape(),
      () => (_permitAnimation = true),
      { defer: true },
    ),
  );

  const [btn, noBtnRest] = splitProps(rest, ["onPress"]);

  //Emulate delay of native onClick
  // See issue https://github.com/solidjs-community/solid-aria/issues/84
  // Delay must be at least 32ms for Safari
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onPress = (e: any) => setTimeout(() => btn.onPress?.(e), 32),
    btnRest = mergeProps(noBtnRest, { onPress, preventFocusOnPress: true });

  const { buttonProps } = createButton(btnRest, () => ref);
  return (
    <button
      {...passthrough}
      {...buttonProps}
      ref={ref}
      class={button({
        shape: shape(),
        variant: variant(),
        size: style.size,
        group: style.group,
        disabled: buttonProps.disabled,
        _permitAnimation,
      })}
      style={{
        "background-color": style.bg,
      }}
      // @codegen directives props=rest include=floating
    >
      <Show when={!buttonProps.disabled}>
        <Ripple />
      </Show>
      {rest.children}
    </button>
  );
}

/**
 * CAPS button
 *
 * Compact, crisp corners (no pills), one accent-filled primary per view and
 * neutral variants for everything else. Connected groups render as a
 * segmented control (segments share a field background, selection is a
 * raised neutral segment rather than a colour fill).
 */
const button = cva({
  base: {
    ...typography.raw(),

    // for <Ripple />:
    position: "relative",

    paddingInline: "var(--padding-inline)",
    gap: "var(--caps-space-3)",

    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    whiteSpace: "nowrap",

    fontWeight: 600,
    fontSize: "var(--caps-text-md)",
    letterSpacing: "0",
    lineHeight: 1,
    fontFamily: "inherit",

    cursor: "pointer",
    border: "none",
    borderRadius: "var(--caps-radius-md)",
    transition:
      "background-color var(--caps-dur-fast) var(--caps-ease), box-shadow var(--caps-dur-fast) var(--caps-ease), color var(--caps-dur-fast) var(--caps-ease), transform var(--caps-dur-fast) var(--caps-ease)",

    "--md-ripple-hover-opacity": "0",
    "--md-ripple-pressed-opacity": "0.08",

    color: "var(--color)",
    fill: "var(--color)",

    "&:active": {
      transform: "translateY(0.5px)",
    },
  },
  variants: {
    /**
     * Variant is equivalent to 'color' in Material spec
     */
    variant: {
      elevated: {
        background: "var(--caps-bg-overlay)",
        boxShadow: "inset 0 0 0 1px var(--caps-line)",
        "--color": "var(--caps-text)",
        "&:hover": {
          background: "var(--caps-active)",
        },
      },
      filled: {
        background: "var(--caps-accent)",
        "--color": "var(--caps-on-accent)",
        "&:hover": {
          background: "var(--caps-accent-hover)",
        },
        "&:active": {
          background: "var(--caps-accent-pressed)",
        },
      },
      tonal: {
        background: "var(--caps-bg-overlay)",
        boxShadow: "inset 0 0 0 1px var(--caps-line)",
        "--color": "var(--caps-text)",
        "&:hover": {
          background: "var(--caps-active)",
          boxShadow: "inset 0 0 0 1px var(--caps-line-strong)",
        },
      },
      outlined: {
        boxShadow: "inset 0 0 0 1px var(--caps-line-strong)",
        background: "transparent",
        "--color": "var(--caps-text-2)",
        "&:hover": {
          background: "var(--caps-hover)",
          "--color": "var(--caps-text)",
        },
      },
      text: {
        background: "transparent",
        "--color": "var(--caps-accent-text)",
        "&:hover": {
          background: "var(--caps-hover)",
        },
      },
      _error: {
        background: "var(--caps-danger)",
        "--color": "#ffffff",
        "&:hover": {
          filter: "brightness(1.08)",
        },
      },

      // Old entries:

      /**
       * @deprecated
       */
      success: {
        fill: "var(--unset-fg)",
        color: "var(--unset-fg)",
        background: "var(--unset-bg)",
      },
      /**
       * @deprecated
       */
      warning: {
        fill: "var(--unset-fg)",
        color: "var(--unset-fg)",
        background: "var(--unset-bg)",
      },
      /**
       * @deprecated
       */
      error: {
        fill: "var(--unset-fg)",
        color: "var(--unset-fg)",
        background: "var(--unset-bg)",
      },
      /**
       * @deprecated use filled
       */
      primary: {
        fill: "var(--unset-fg)",
        color: "var(--unset-fg)",
        background: "var(--unset-bg)",
      },
      /**
       * @deprecated use tonal
       */
      secondary: {
        fill: "var(--unset-fg)",
        color: "var(--unset-fg)",
        background: "var(--unset-bg)",
      },
      /**
       * @deprecated use text instead
       */
      plain: {
        fill: "var(--unset-fg)",
        color: "var(--unset-fg)",
        background: "var(--unset-bg)",
      },
    },
    /**
     * Shapes (kept for API compatibility; CAPS uses one corner radius)
     */
    shape: {
      round: {},
      square: {},
    },
    /**
     * Button groups
     */
    group: {
      "connected-start": {},
      "connected-end": {},
      connected: {},
      standard: {},
    },
    /**
     * Internal helper (kept for API compatibility)
     */
    _permitAnimation: {
      true: {},
      false: {},
    },
    /**
     * Sizes
     */
    size: {
      xs: {
        height: "var(--caps-h-sm)",
        "--padding-inline": "10px",
        fontSize: "var(--caps-text-sm)",
      },
      sm: {
        height: "var(--caps-h-md)",
        "--padding-inline": "14px",
      },
      md: {
        height: "var(--caps-h-lg)",
        "--padding-inline": "16px",
        fontSize: "var(--caps-text-base)",
      },
      lg: {
        height: "44px",
        "--padding-inline": "22px",
        fontSize: "var(--caps-text-lg)",
        borderRadius: "var(--caps-radius-lg)",
      },
      xl: {
        height: "52px",
        "--padding-inline": "28px",
        fontSize: "var(--caps-text-xl)",
        borderRadius: "var(--caps-radius-lg)",
      },

      // Old code:
      icon: {
        width: "var(--caps-h-md)",
        height: "var(--caps-h-md)",
      },
      /**
       * @deprecated
       */
      small: {
        height: "var(--caps-h-md)",
        paddingInline: "14px",

        ...typography.raw(),
        fontWeight: 600,
        fontSize: "var(--caps-text-md)",
      },
      /**
       * @deprecated
       */
      normal: {
        height: "var(--caps-h-lg)",
        minWidth: "88px",
        padding: "0 16px",
        fontSize: "var(--caps-text-md)",
      },
      /**
       * @deprecated
       */
      fab: {
        width: "40px",
        height: "40px",
        borderRadius: "var(--caps-radius-lg)",
      },
      /**
       * @deprecated
       */
      fluid: {
        borderRadius: "var(--caps-radius-md)",
      },
      /**
       * @deprecated
       */
      inline: {
        padding: "2px 8px",
        fontSize: "var(--caps-text-sm)",
        borderRadius: "var(--caps-radius-sm)",
      },
      /**
       * @deprecated
       */
      none: {
        borderRadius: "0",
      },
    },
    /**
     * Whether the button is disabled
     */
    disabled: {
      true: {
        cursor: "not-allowed",
        "&:active": {
          transform: "none",
        },
      },
      false: {},
    },
  },
  defaultVariants: {
    size: "sm",
    shape: "round",
    variant: "filled",
    disabled: false,
  },
  compoundVariants: [
    // disabled styles
    {
      variant: ["elevated", "filled", "tonal", "outlined", "_error"],
      disabled: true,
      css: {
        "--color": "var(--caps-text-disabled)",
        background: "var(--caps-hover)",
        boxShadow: "none",
        filter: "none",
        "&:hover": {
          background: "var(--caps-hover)",
        },
      },
    },
    {
      variant: "text",
      disabled: true,
      css: {
        "--color": "var(--caps-text-disabled)",
        background: "transparent",
      },
    },

    // segmented control: groups share one track
    {
      group: ["connected-start", "connected", "connected-end", "standard"],
      css: {
        flexGrow: 1,
        flexBasis: 0,
        borderRadius: "var(--caps-radius-sm)",
        boxShadow: "inset 0 0 0 1px var(--caps-line)",
        background: "var(--caps-bg-field)",
        "--color": "var(--caps-text-2)",
        fontWeight: 500,
        "&:hover": {
          background: "var(--caps-hover)",
          "--color": "var(--caps-text)",
        },
      },
    },
    {
      group: ["connected-start", "connected", "connected-end", "standard"],
      variant: "filled",
      css: {
        background: "var(--caps-selected)",
        boxShadow: "inset 0 0 0 1px var(--caps-line-strong)",
        "--color": "var(--caps-text)",
        fontWeight: 600,
        "&:hover": {
          background: "var(--caps-selected)",
        },
      },
    },
  ],
});
