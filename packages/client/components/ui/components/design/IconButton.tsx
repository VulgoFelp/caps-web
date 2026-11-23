import { mergeProps, Show, splitProps } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";

import { AriaButtonProps, createButton } from "@solid-aria/button";
import { cva } from "styled-system/css/cva";

import { Ripple } from "./Ripple";
import { typography } from "./Text";

type Props = Omit<
  Parameters<typeof iconButton2>[0] &
    AriaButtonProps &
    JSX.DirectiveAttributes &
    Pick<
      JSX.ButtonHTMLAttributes<HTMLButtonElement>,
      "role" | "tabIndex" | "aria-selected" | "style"
    >,
  "onClick" | "disabled"
>;

/**
 * Icon buttons help people take minor actions with one tap
 *
 * @specification https://m3.material.io/components/icon-buttons
 */
export function IconButton(props: Props) {
  const [passthrough, propsRest] = splitProps(props, [
    "aria-selected",
    "tabIndex",
    "role",
    "style",
  ]);

  const [style, rest] = splitProps(propsRest, [
    "size",
    "shape",
    "width",
    "variant",
    "_compositionSendMessage",
  ]);
  let ref: HTMLButtonElement | undefined;

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
      class={iconButton2({
        ...style,
        disabled: buttonProps.disabled,
      })}
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
 * CAPS icon button
 *
 * Soft-square hit areas (never Material circles), quiet by default, with a
 * neutral hover wash and accent only for the filled variant.
 */
const iconButton2 = cva({
  base: {
    ...typography.raw(),

    // for <Ripple />:
    position: "relative",

    // ensure it's always 1:1
    aspectRatio: "1/1",

    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    fontWeight: 500,
    fontFamily: "inherit",

    cursor: "pointer",
    border: "none",
    background: "transparent",
    borderRadius: "var(--caps-radius-md)",
    transition:
      "background-color var(--caps-dur-fast) var(--caps-ease), color var(--caps-dur-fast) var(--caps-ease), transform var(--caps-dur-fast) var(--caps-ease)",

    "--md-ripple-hover-opacity": "0",
    "--md-ripple-pressed-opacity": "0.08",

    color: "var(--colour)",
    fill: "var(--colour)",

    "&:active": {
      transform: "scale(0.96)",
    },
  },
  variants: {
    variant: {
      filled: {
        background: "var(--caps-accent)",
        "--colour": "var(--caps-on-accent)",
        "&:hover": {
          background: "var(--caps-accent-hover)",
        },
      },
      tonal: {
        background: "var(--caps-bg-overlay)",
        boxShadow: "inset 0 0 0 1px var(--caps-line)",
        "--colour": "var(--caps-text)",
        "&:hover": {
          background: "var(--caps-active)",
        },
      },
      outlined: {
        boxShadow: "inset 0 0 0 1px var(--caps-line-strong)",
        "--colour": "var(--caps-text-2)",
        "&:hover": {
          background: "var(--caps-hover)",
          "--colour": "var(--caps-text)",
        },
      },
      standard: {
        "--colour": "var(--caps-text-3)",
        "&:hover": {
          background: "var(--caps-hover)",
          "--colour": "var(--caps-text)",
        },
        "&[aria-selected=true]": {
          "--colour": "var(--caps-text)",
          background: "var(--caps-selected)",
        },
      },

      // CAPS: an input that is switched off (muted mic, deafened)
      _muted: {
        background: "var(--caps-danger-soft)",
        boxShadow: "inset 0 0 0 1px rgba(from var(--caps-danger) r g b / 0.35)",
        "--colour": "var(--caps-danger)",
        "&:hover": {
          background: "rgba(from var(--caps-danger) r g b / 0.2)",
        },
      },

      _header: {
        "--colour": "white",
        "&:hover": {
          background: "rgba(255, 255, 255, 0.14)",
        },
      },
    },
    size: {
      xs: {
        height: "var(--caps-h-sm)",
        "& > svg": { width: "18px", height: "18px" },
        "& > .material-symbols-outlined": { fontSize: "18px !important" },
      },
      sm: {
        height: "var(--caps-h-md)",
        "& > svg": { width: "20px", height: "20px" },
        "& > .material-symbols-outlined": { fontSize: "20px !important" },
      },
      md: {
        height: "40px",
      },
      lg: {
        height: "56px",
      },
      xl: {
        height: "72px",
      },
    },
    shape: {
      round: {},
      square: {},
    },
    width: {
      narrow: {},
      default: {},
      wide: {},
    },
    /**
     * Whether the button is disabled
     */
    disabled: {
      true: {
        cursor: "not-allowed",
        opacity: 0.4,
        "&:active": {
          transform: "none",
        },
      },
      false: {},
    },
    _compositionSendMessage: {
      true: {
        width: "var(--caps-h-md)",
        height: "var(--caps-h-md) !important",
        alignSelf: "flex-end",
      },
    },
  },
  defaultVariants: {
    variant: "standard",
    width: "default",
    shape: "round",
    size: "sm",
    disabled: false,
    _compositionSendMessage: false,
  },
  compoundVariants: [
    {
      size: ["xs", "sm"],
      width: "narrow",
      css: {
        paddingInline: "2px",
      },
    },
    {
      size: ["xs", "sm"],
      width: "default",
      css: {
        paddingInline: "4px",
      },
    },
    {
      size: ["xs", "sm"],
      width: "wide",
      css: {
        aspectRatio: "unset",
        paddingInline: "10px",
      },
    },
    {
      size: "md",
      css: {
        paddingInline: "8px",
      },
    },
    {
      size: ["md", "lg", "xl"],
      css: {
        borderRadius: "var(--caps-radius-lg)",
      },
    },
    {
      size: ["lg", "xl"],
      css: {
        paddingInline: "16px",
      },
    },
  ],
});
